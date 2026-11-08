---
artifact_schema_version: 1
artifact_id: CAP-003-E6-S3-tasks
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
  timestamp: 2026-11-07T06:41:15Z
  source_artifacts:
    - id: CAP-003-E6-S3
      version: "1"
    - id: CAP-003-E6
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-data-health-ui
      version: "1"
    - id: CAP-003-component-design-data-health-api
      version: "1"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-owner-web-app
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-data-health-ui-tests
      version: "1"
    - id: CAP-003-E6-S1-tasks
      version: "1"
    - id: CAP-003-E6-S2-tasks
      version: "1"
    - id: CAP-003-E3-S1-tasks
      version: "1"
    - id: CAP-003-E3-S3-tasks
      version: "1"
    - id: CAP-003-E1-S1-tasks
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

# Tasks: CAP-003-E6-S3 — Needs Fixing: Problem Rows with Their Fix, the Header Action, Show More and Nothing Needs Fixing

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S3.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `data-health-ui`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Every followed stock with a problem is listed with what failed, why, what it means and the fix that applies, so the owner never guesses whether downloading again would help (AC-13, AC-14). This story adds two components to `web/src/screens/data-health/` (data-health-ui 2.1, 2.5). `problem-row.tsx` renders one `li`: the symbol at weight 600 linking to `/data/coverage?symbol={SYMBOL}` (named *{SYMBOL}, show in the coverage table*); per failure a `StatusBadge` *Failed* (critical) or *Not found* (warning) with *Downloading {data type words} failed: {reason}, {attempts} attempts* or *The provider doesn't recognise this symbol.*; the consequence at `--text-xs`; and the fix: for a *Failed* failure the download-again sentence with no per-row control, for a *Not found* failure **Stop following** (`ghost`, named *Stop following {SYMBOL}*, opening CAP-003-E6-S2's dialog) and **Follow a different symbol** (`outline` link to `/data/followed` with router state `{ focusAdd: true }`, named *Follow a different symbol than {SYMBOL}*) with the not-found sentence. `needs-fixing.tsx` renders the `card` `default` region: the `h2` *Needs fixing · {n}* from the aggregate's `affected_count` (the set the rail chip counts, AC-16), the sub-line *From your most recent downloads · checked {time}* from the aggregate's `checked_at`, CAP-003-E6-S2's **Download now** only when any loaded row is `retryable`, the rows in served (symbol) order, **Show more** while `next_cursor` is set appending `fetchProblems(cursor, 50)` with focus kept and the new row count announced politely, *Couldn't read more problems: {reason}.* with **Try again** restarting from the first page, and at `affected_count` 0 *Nothing needs fixing.* with *Last complete download {start time}* from `listAcquisitionRuns({ state: "succeeded", limit: 1 })` or *No complete download yet*. It renders `StopFollowingDialog` once beside the rows. Strings are appended to CAP-003-E6-S1's `copy.ts`. The tests are `problem-row.test.tsx` and `needs-fixing.test.tsx`.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-13 | Each row names the stock, what was being downloaded, the reason and the consequence, and offers the recovery that applies | T002, T005, T006, T009, T010, T011, T012, T014 |
| AC-14 | A *Not found* stock offers stopping following and following a different symbol, never a download | T002, T003, T006, T011, T012 |
| AC-16 | The *Needs fixing* header count is the set the rail chip counts | T006, T012 |
| AC-25 | **Show more** keeps focus and announces the new row count politely; row actions name the symbol | T002, T003, T006, T011, T012 |
| AC-24 | Provider reason is text; no `request_id` (via DAC-E6-S3-3) | T004, T007, T009, T012 |
| AC-19 | Display vocabulary only (via DAC-E6-S3-4) | T008, T011 |
| AC-20 | Every status through `StatusBadge`, never colour alone (via DAC-E6-S3-5) | T005, T011 |
| DAC-E6-8 | Each row renders as stated | T002, T005, T011 |
| DAC-E6-9 | Header, **Download now** condition, **Show more**, `422` handling | T006, T007, T010, T012 |
| DAC-E6-10 | *Nothing needs fixing.* with the last complete download or *No complete download yet* | T009, T012 |
| DAC-E6-13 | **Follow a different symbol than {SYMBOL}** goes to `/data/followed` with `{ focusAdd: true }` | T003, T011 |
| DAC-E6-S3-1 | `failed` prices + `not_found` reference: both badges, retryable, *Not found* fix controls, no per-row download | T002, T006, T011, T012 |
| DAC-E6-S3-2 | 120 problem stocks: **Show more** twice calls `fetchProblems` with the served cursors and `limit` 50, rows append in symbol order, the control keeps focus | T006, T012 |
| DAC-E6-S3-3 | `reason` is text, never markup; no `request_id` | T004, T007, T011, T012 |
| DAC-E6-S3-4 | No DAC-E7-3 term in visible text or accessible names; labels from `labelOf` or `copy.ts` | T008, T010, T011, T012 |
| DAC-E6-S3-5 | Outcome badges through `StatusBadge` with label text and `aria-hidden` shape; nothing by colour alone | T005, T011 |

Mapped test cases (from `tests/component/data-health-ui-tests.md`, confirmed in `tests/coverage-matrix.md` lines 48–49, 276–281 and 295–299): **TC-COMP-152** (DAC-E6-10), **TC-COMP-153** (DAC-E6-13), **TC-COMP-165** (DAC-E6-S3-1, DAC-E6-8), **TC-COMP-166** (DAC-E6-S3-2, DAC-E6-9), **TC-COMP-167** (DAC-E6-S3-3), **TC-COMP-168** (DAC-E6-S3-4), **TC-COMP-169** (DAC-E6-S3-5). The specification is `status: draft`; its steps are used as written and sharpened below. Other TCs on the AC-13, AC-14 and AC-16 rows belong to other stories (TC-COMP-162 is CAP-003-E6-S2's dialog; TC-COMP-049/067 are E2/E3). TC-INT-014, 016–020 and 037 and TC-E2E-003 drive this component on the real stack in Phase 6b and CAP-003-E6-S6; no integration or end-to-end case is owned by this story.

## Phase 1: Setup

**Purpose**: Confirm the baseline and the hard dependencies' exports.

- [ ] T001 From the repo root run `npm ci` and `npm run test` and record the baseline as green. Confirm, without editing anything, that each hard dependency's deliverable exists; STOP and report if any is missing:
  - (CAP-003-E1-S1) `web/src/components/ui/card.tsx` exports `Card` (`variant` `"default"`), `CardHeader`, `CardTitle` (an `h2` that forwards its `ref`: `grep -n "forwardRef" web/src/components/ui/card.tsx`), `CardContent`; `web/src/components/ui/button.tsx` exports `Button` with `variant` `outline` and `ghost`, `asChild`, and forwards its `ref`.
  - (CAP-003-E1-S5) `web/src/components/patterns/tiers.ts` exports `tierOf`, `labelOf` and `Status` with the `{ of: "result"; outcome: "failed" | "not_found" }` member; `web/src/components/patterns/status-badge.tsx` exports the six-tier `StatusBadge({ tier, children })`.
  - (CAP-003-E1-S6) `web/src/components/patterns/format.ts` exports `formatInstant`, `formatClock` and `formatCount`.
  - (CAP-003-E3-S1) `web/src/app/shell-types.ts` exports `ReadState`, `DataHealth` and `ProblemPage`; `web/src/app/shell-client.ts` exports `fetchProblems(cursor: string | null | undefined, limit: number): Promise<ProblemPage>`.
  - (CAP-003-E6-S1) `web/src/screens/data-health/copy.ts` exports `TRY_AGAIN`, `READ_TARGETS`, `checked`, `readFailed` and `readFailureReason`; `web/src/screens/data-health/check-card.tsx` exports `ReadFailure` and `SkeletonLine`.
  - (CAP-003-E6-S2) `web/src/screens/data-health/download-now.tsx` exports `DownloadNow({ label? })`; `web/src/screens/data-health/stop-following-dialog.tsx` exports `StopFollowingDialog({ symbol, onClose, onStopped, onRefusalClosed, fallbackFocusRef })`; `copy.ts` exports `STOP_FOLLOWING`.
  - The delivered `web/src/api/client.ts` exports `listAcquisitionRuns`, `ApiError` and `ApiUnreachableError`; `web/src/api/types.ts` exports `DataType` and `AcquisitionRun`.
  - None of `NEEDS_FIXING`, `DATA_TYPE_WORDS`, `SHOW_MORE`, `NOTHING_NEEDS_FIXING` is already exported from `copy.ts` by a sibling story (`grep -nE "export (const|function) (NEEDS_FIXING|needsFixingTitle|DATA_TYPE_WORDS|SHOW_MORE|showingOf|NOTHING_NEEDS_FIXING|MORE_PROBLEMS)\b" web/src/screens/data-health/copy.ts` prints nothing); on a collision STOP and report rather than rename.

  No package is added by this story (traces to AC-13).

**Checkpoint**: Baseline green; every import this story makes resolves; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin each row line, fix, link, count, page, focus move and state before either component exists.

**Shared harness** (copied into each of the two test files, since test files share no module).

- **Mocks.**
  - `vi.mock("../../app/shell-client", async () => ({ ...(await vi.importActual("../../app/shell-client")), fetchProblems: vi.fn() }))`.
  - `vi.mock("../../api/client", async () => ({ ...(await vi.importActual("../../api/client")), listAcquisitionRuns: vi.fn(), startAcquisitionRun: vi.fn(), retireInstrument: vi.fn() }))`, following the delivered `web/src/screens/runs/run-controls.test.tsx` l.16–19 precedent, so the real `ApiError` and `ApiUnreachableError` are used.
  - `vi.mock("../../app/shell-context", () => ({ useShell: () => ({ refresh }) }))` with a module-level `refresh = vi.fn()`, the consumer seam CAP-003-E6-S2's harness uses (S2's `DownloadNow` and `StopFollowingDialog` call CAP-003-E3-S3's `useShell`).
  - `beforeEach` resets every mock; `afterEach` asserts the global `fetch` was never called (every read goes through a mocked function).
- **Fixtures** (independent literals, never built by the code under test; typed by CAP-003-E3-S1's `DataHealth` and `ProblemPage`):
  - `FAIL(data_type, reason = "provider timeout", attempts = 3)` is `{ data_type, outcome: "failed", reason, attempts, completed_at: "2026-10-30T18:20:00Z", run_id: "r-7" }`; `NF(data_type)` is the same with `outcome: "not_found"`, `reason: "no such ticker"`, `attempts: 1`.
  - `ROW(symbol, failures)` is `{ symbol, failures, retryable: failures.some((f) => f.outcome === "failed") }` written out per fixture as a literal boolean, not computed, where a test depends on it.
  - `DH(over)` is a `DataHealth` with `checked_at "2026-10-30T19:03:12Z"`, `never_acquired false`, `followed_count 300`, `affected_count 2`, both checks set to S1's `ok` defaults, `problems { rows: [ROW("FBXX", [NF("reference")]), ROW("KO", [FAIL("prices")])], next_cursor: null }`, overridden by `over`.
  - `ok(data)` is `{ kind: "ok", data, checkedAt: new Date("2026-10-30T19:03:12Z") }`.
  - `SYMS = Array.from({ length: 120 }, (_, i) => \`S${String(i).padStart(3, "0")}\`)`, the 120 problem stocks of DAC-E6-S3-2; `PAGE(from, to, next)` builds `{ rows: SYMS.slice(from, to).map((s) => ROW(s, [FAIL("prices")])), next_cursor: next }`.
- **Errors.** `BAD_CURSOR = new ApiError("\`cursor\` must be a stock symbol.", "req-422", { code: "validation_error" })` (data-health-api 2.3's delivered text), `INTERNAL = new ApiError("database said no", "req-9f3", { code: "internal_error" })`, `UNREACHABLE = new ApiUnreachableError("fetch failed")`. No message or request id may reach the DOM.
- **Render.** `<MemoryRouter initialEntries={["/data"]}>` around the component and a `LocationProbe` rendering `JSON.stringify({ path: location.pathname + location.search, state: location.state })` into `data-testid="location"`. `userEvent.setup()` drives every interaction. Times are America/Chicago through CAP-003-E1-S6 (`2026-10-30T19:03:12Z` is *14:03:12 CDT*; `2026-10-29T14:00:00Z` is *2026-10-29 09:00 CDT*); expected strings are literals.
- **Term scan.** `visibleAndAccessibleText(root)` joins `root.textContent`, `document.body.textContent` (the dialog portals) and the computed accessible name of every `button`, `link`, `heading` and `dialog`; `TERMS = /\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i`.

### Mandatory Component Tests

- [ ] T002 [P] Implement **TC-COMP-165** (a row with `failed` and `not_found` failures renders both fixes correctly) with the full DAC-E6-8 row. Write it in a new `web/src/screens/data-health/problem-row.test.tsx` as `describe("Problem row (TC-COMP-165, DAC-E6-S3-1, DAC-E6-8, AC-13, AC-14)")`, with `// Implements TC-COMP-165`. Render `<ul><ProblemRow row={…} onStopFollowing={spy} /></ul>`.
  - (a) **Step 1, mixed row** `ROW("FBXX", [FAIL("prices"), NF("reference")])` with `retryable: true`:
    - Exactly one `li`. A link with accessible name *FBXX, show in the coverage table*, visible text *FBXX*, class containing `font-semibold`, `href="/data/coverage?symbol=FBXX"`.
    - Two badges in failure order: `status-critical` *Failed* then `status-warning` *Not found*.
    - The text contains exactly *Downloading daily prices failed: provider timeout, 3 attempts* and *The provider doesn't recognise this symbol.*; it does not contain *no such ticker* (a not-found failure's reason is not rendered) nor *1 attempts*.
    - The consequence *Its scores show as Incomplete until this is fixed, and so does every universe holding it.* appears exactly once, in an element with `text-xs`.
    - Both fixes render once each: *Download again to retry; data already stored is never duplicated or overwritten.* (the row is retryable) and *Probably a typo or a delisted ticker. Downloading again won't help.*
    - A button named exactly *Stop following FBXX* with visible text *Stop following* and `data-variant="ghost"`; a link named exactly *Follow a different symbol than FBXX* with visible text *Follow a different symbol* and `data-variant="outline"`.
    - No per-row download control: `queryByRole("button", { name: /download/i })` is null, and `startAcquisitionRun` is never called after clicking every control in the row except **Stop following**.
  - (b) **The four data-type words**: `FAIL("prices" | "fundamentals" | "corporate_actions" | "reference")` render exactly *Downloading daily prices failed…*, *Downloading company financials failed…*, *Downloading corporate actions failed…*, *Downloading reference data failed…* (`it.each`, literals).
  - (c) **Failed only** `ROW("KO", [FAIL("prices"), FAIL("fundamentals", "rate limited", 5)])`: two `status-critical` badges in served order, *…company financials failed: rate limited, 5 attempts*, the download-again sentence exactly once, no **Stop following** and no **Follow a different symbol**.
  - (d) **Not found only** `ROW("ZZZZ", [NF("reference")])` with `retryable: false`: no download-again sentence; both *Not found* controls and the not-found sentence.
  - (e) **Null reason** `FAIL("prices", null, 2)`: exactly *Downloading daily prices failed: no reason was recorded, 2 attempts* (Other Notes, precedent); never `null` or `undefined`.
  - (f) **Stop following** click calls `spy` once with exactly `"FBXX"`; nothing else is called.

  Kills:
  - swap-case `critical`↔`warning` on the outcome tier, or `labelOf` bypassed (a: badge variant or label)
  - swap-case among the four `DATA_TYPE_WORDS` (b)
  - negate-boolean on the "any `not_found`" fix condition (c: controls appear; d: they vanish)
  - negate-boolean on the "any `failed`" fix condition (d: download-again sentence appears)
  - drop-field-copy of `attempts` / `reason` in the failed sentence (a, c)
  - a hand-written mutant rendering the fix once per failure instead of once per outcome (c: the sentence twice)
  - drop-field-copy of `symbol` in `onStopFollowing(symbol)` (f)
- [ ] T003 [P] Implement **TC-COMP-153** (Follow a different symbol navigates to Followed stocks with `focusAdd`). Write it in `web/src/screens/data-health/problem-row.test.tsx` after T002 as `describe("Follow a different symbol (TC-COMP-153, DAC-E6-13, AC-14)")`, with `// Implements TC-COMP-153`. Render the *Not found* row `ROW("FBXX", [NF("reference")])` in the memory router with the `LocationProbe` and a `<Route path="/data/followed">` rendering *followed page*.
  - Step 1: click the link named *Follow a different symbol than FBXX*.
  - Step 2: `JSON.parse(getByTestId("location").textContent)` equals exactly `{ path: "/data/followed", state: { focusAdd: true } }`, and *followed page* renders.
  - The symbol link instead goes to `{ path: "/data/coverage?symbol=FBXX", state: null }`.
  - Kills: drop-field-copy of the `state` prop (`state` null); negate-boolean `focusAdd: true` → `false`; swap-case of the two link targets.
- [ ] T004 Implement **TC-COMP-167, row half** (provider reason renders as text). Write it in `web/src/screens/data-health/problem-row.test.tsx` after T003 as `describe("Provider reason is text (TC-COMP-167, DAC-E6-S3-3, AC-24)")`, with `// Implements TC-COMP-167`. Render `ROW("FBXX", [FAIL("prices", "<img src=x onerror=alert(1)><b>bold</b>", 3)])`.
  - The row's text contains the literal *Downloading daily prices failed: <img src=x onerror=alert(1)><b>bold</b>, 3 attempts*.
  - `container.querySelector("img, b, script")` is null.
  - Kills: a hand-written mutant rendering the reason through `dangerouslySetInnerHTML` (an `img` appears; the delivered `web/src/api/render.test.tsx` walk also rejects it).
- [ ] T005 Implement **TC-COMP-169** (failure outcome badges carry shape). Write it in `web/src/screens/data-health/problem-row.test.tsx` after T004 as `describe("Outcome badges (TC-COMP-169, DAC-E6-S3-5, AC-20)")`, with `// Implements TC-COMP-169`. Render the mixed row of T002 (a).
  - Each `[data-variant^="status-"]` badge's text content is exactly its label (*Failed*, *Not found*), contains an `svg[aria-hidden="true"]`, and carries no `aria-label` replacing the words.
  - The two shapes differ: the `svg` of the *Failed* badge and of the *Not found* badge have different `data-shape` / markup (CAP-003-E1-S5's square vs triangle), so greyscale tells them apart.
  - No `coverage-unknown` badge renders: nothing in a row is undeterminable (the absent reason has words, T002 (e)); this records the NotDeterminable clause as not applicable here, as coverage-matrix note 7 does for DAC-E6-S2-4.
  - Kills: a hand-written mutant rendering the label in a bare `span` with a colour class instead of `StatusBadge` (no `status-*` badge, no `svg`); swap-case `labelOf` → the raw `outcome` (*not_found* as text).
- [ ] T006 Implement **TC-COMP-166** (Show more appends pages with served cursors and keeps focus) with the header, the count and the **Download now** condition. Write it in a new `web/src/screens/data-health/needs-fixing.test.tsx` as `describe("Needs fixing rows and Show more (TC-COMP-166, DAC-E6-S3-2, DAC-E6-9, AC-16, AC-25)")`, with `// Implements TC-COMP-166`. Render `<NeedsFixing dataHealth={ok(DH(…))} onReread={reread} />`.
  - (a) **Header and count (AC-16)** with `affected_count 120` and `problems PAGE(0, 50, "S049")`:
    - A `region` named by its `h2`; the `h2` text is exactly *Needs fixing · 120* (never *50*, the loaded row count) and has `tabIndex` -1.
    - The sub-line is exactly *From your most recent downloads · checked 14:03:12 CDT*.
    - 50 `li` elements whose symbol links read `SYMS.slice(0, 50)` in order.
  - (b) **Step 2, Show more twice**, `fetchProblems` resolving `PAGE(50, 100, "S099")` then `PAGE(100, 120, null)`:
    - A `button` *Show more* with `data-variant="outline"`, after the list. Click it: `fetchProblems.mock.calls` is `[["S049", 50]]`; then 100 `li` in `SYMS.slice(0, 100)` order; *Show more* `toHaveFocus()`; a `aria-live="polite"` element (outside the list) reads exactly *Showing 100 of 120 stocks* (DEC-0382).
    - Click again: calls are exactly `[["S049", 50], ["S099", 50]]`; 120 `li` in `SYMS` order; the live region reads *Showing 120 of 120 stocks*; *Show more* is gone and focus is on the rows `list` (`tabIndex` -1), never `document.body` (Resolved Conflict 2).
    - While a page is pending (a `deferred`), *Show more* has `aria-busy="true"`, has no `disabled` attribute, and a second click does not call `fetchProblems` again.
  - (c) **Download now condition (DAC-E6-9)**:
    - With the default `DH` (KO retryable): exactly one button named *Download now* sits inside the card's header, after the `h2`.
    - With every loaded row `retryable: false` (`[ROW("FBXX", [NF("reference")])]`): no *Download now* inside the region.
    - With a first page all `retryable: false` and `next_cursor` set, then a Show more page whose row is `retryable: true`: *Download now* appears after the page loads ("any loaded row").
  - (d) **No Show more** when `next_cursor` is null (default `DH`).
  - (e) **Rows in served order**: the default renders *FBXX* before *KO*; no client sort is asserted beyond the served order (Other Notes).

  Kills:
  - drop-field-copy `affected_count` → `rows.length` in the title (a: *50*)
  - drop-field-copy of `page.next_cursor` (b: the second call repeats `"S049"`)
  - drop-defaulted-argument / off-by-one on `limit` 50 (b)
  - a hand-written mutant prepending instead of appending (b: order)
  - negate-boolean on the `some(retryable)` condition (c)
  - a hand-written mutant computing the condition over the first page only (c, third case)
  - negate-boolean on the in-flight guard (b: two calls)
  - remove-attribute of `aria-live` (b)
- [ ] T007 Implement **TC-COMP-166 edge** (`422` reads *Couldn't read more problems* with **Try again** restarting from the first page) and **TC-COMP-167, card half**. Write it in `web/src/screens/data-health/needs-fixing.test.tsx` after T006 as `describe("Show more failure (TC-COMP-166, TC-COMP-167, DAC-E6-9, DAC-E6-S3-3)")`, with `// Implements TC-COMP-166` and `// Implements TC-COMP-167`.
  - (a) `affected_count 120`, `PAGE(0, 50, "S049")`; `fetchProblems` rejects `BAD_CURSOR`. After clicking *Show more*: the 50 rows are kept; a `role="status"` element reads exactly *Couldn't read more problems: FactorFlow hit an unexpected problem.* (CAP-003-E6-S1's `readFailureReason`, DEC-0373); *Show more* is gone and a *Try again* button (`outline`) has focus.
  - (b) Click *Try again*: `reread` is called exactly once; `fetchProblems` is not called again (the first page comes with the aggregate's answer, DEC-0381).
  - (c) `rerender` with a **new** `ok(DH({ affected_count: 120, problems: PAGE(0, 50, "S049") }))` object (the aggregate's answer): the failure line is gone, 50 rows, *Show more* is back.
  - (d) `UNREACHABLE` gives *Couldn't read more problems: FactorFlow is not answering.*; `INTERNAL` gives the *unexpected problem* sentence (DEC-0381: every Show more failure, not only `422`).
  - (e) `document.body.textContent` contains none of *req-422*, *req-9f3*, *must be a stock symbol*, *database said no*.
  - Kills: a hand-written mutant rendering `error.message` (a, e); swap-case of the Try again handler to `fetchProblems(cursor, 50)` (b: `fetchProblems` called again); a hand-written mutant that does not reset pages on a new aggregate answer (c: the failure line stays).

  (The `422` case's `{reason}` reuses S1's `readFailureReason`, whose own unit test already maps `validation_error` to the unexpected-problem clause.)
- [ ] T008 Implement **TC-COMP-168** (Needs fixing card, rows, Show more, empty and error states use the display vocabulary). Write it in `web/src/screens/data-health/needs-fixing.test.tsx` after T007 as `describe("Needs fixing vocabulary (TC-COMP-168, DAC-E6-S3-4, AC-19)")`, with `// Implements TC-COMP-168`.
  - (a) Render, one at a time, every state this story defines: `loading`; aggregate `error`; populated with the T002 (a) mixed row plus a failed-only row and *Show more*; after a Show more page with its announcement; the Show more failure (T007 (a)); `affected_count` 0 while the last complete read is pending, with one run, with none, and failed (T009); and the *Stop following FBXX* dialog opened from a row. For each, `visibleAndAccessibleText` never matches `TERMS`.
  - (b) A planted case proves the regex is not vacuous: `TERMS` matches `"one run"`, `"Retired"` and `"Provider credential"` and does not match `"Downloading"`, `"downloads"` or `"corporate_actions"`.
  - (c) Every badge label is a `labelOf` value (*Failed*, *Not found*), and every other label is a `copy.ts` literal (`SHOW_MORE`, `TRY_AGAIN`, `STOP_FOLLOWING`, `FOLLOW_DIFFERENT`, `DOWNLOAD_NOW`): asserted by comparing each button's and link's visible text against the imported constants and the symbol.
  - Kills: swap-case of a data-type word to the wire value (`corporate_actions` rendered: the planted case shows `\b` would not catch it, so (c) and T002 (b) do); a hand-written mutant labelling the row's stop button *Retire* (a).
- [ ] T009 Implement **TC-COMP-152** (Nothing needs fixing with the last complete download line). Write it in `web/src/screens/data-health/needs-fixing.test.tsx` after T008 as `describe("Nothing needs fixing (TC-COMP-152, DAC-E6-10, AC-13)")`, with `// Implements TC-COMP-152`. `DH({ affected_count: 0, problems: { rows: [], next_cursor: null } })`.
  - (a) **Step 1**: `listAcquisitionRuns` resolves `{ runs: [{ runId: "r-9", state: "succeeded", historyDepthYears: 5, requestedAt: "2026-10-29T13:59:00Z", startedAt: "2026-10-29T14:00:00Z", endedAt: "2026-10-29T15:10:00Z", instrumentsNamed: 300, instrumentsWritten: 300, instrumentsFailed: 0, failureReason: null }], nextCursor: null }`. It is called exactly once with exactly `{ state: "succeeded", limit: 1 }`. The card reads *Nothing needs fixing.* and *Last complete download 2026-10-29 09:00 CDT*. The `h2` is *Needs fixing · 0*; no `li`, no *Show more*, no *Download now*.
  - (b) **Step 2**: `{ runs: [], nextCursor: null }` gives *Nothing needs fixing.* and *No complete download yet*.
  - (c) **`startedAt` null** (`requestedAt "2026-10-29T13:59:00Z"`): *Last complete download 2026-10-29 08:59 CDT* (CAP-003-E1-S6's `formatDownloadName` rule, Other Notes).
  - (d) **Read only at 0** (register C3): with the default `DH` (`affected_count 2`) `listAcquisitionRuns` is never called.
  - (e) **Pending**: while the read is a pending `deferred`, *Nothing needs fixing.* renders and the line is a skeleton (`aria-busy="true"`), never *No complete download yet*.
  - (f) **Failed** (`UNREACHABLE`): a `role="status"` reads exactly *Couldn't read the last complete download: FactorFlow is not answering.* with *Try again*, which calls `listAcquisitionRuns` a second time with the same filter and not `reread` (DEC-0383).
  - (g) **New aggregate answer at 0**: a `rerender` with a new `ok(DH({ affected_count: 0, … }))` object calls `listAcquisitionRuns` once more (DEC-0383).
  - Kills: negate-boolean on `affected_count === 0` (d: read called; a: rows path); drop-field-copy of the `state: "succeeded"` filter (a: called with `{ limit: 1 }`); swap-case `startedAt` → `endedAt` (a: *10:10*); negate-boolean on `runs.length === 0` (a, b swap); a hand-written mutant reading the line from the aggregate's rows (b).
- [ ] T010 Write the aggregate's states and the dialog wiring for the card. Write it in `web/src/screens/data-health/needs-fixing.test.tsx` after T009 as `describe("Needs fixing states and stop following (DAC-E6-9, DAC-E6-12 wiring, DAC-E6-17, AC-24)")`. (DAC-E6-12 is CAP-003-E6-S2's; this pins only this card's side of the S2 caller contract.)
  - (a) **Loading** (`{ kind: "loading" }`): the region keeps an `h2` reading exactly *Needs fixing* (no count), an element carries `aria-busy="true"`, and no `li`, badge or *Download now* renders (ux-design 1.4 Loading: skeleton rows in the lower cards; DEC-0380).
  - (b) **Error** (`{ kind: "error", error: INTERNAL, last: { data: DH(), checkedAt } }`): the `h2` *Needs fixing* is kept; the body is exactly *Couldn't read the data health checks: FactorFlow hit an unexpected problem.* (S1's `READ_TARGETS.checks`, DAC-E6-17) with *Try again* calling `reread` once; `last`'s rows are not rendered (DAC-E6-17: body replaced); no *req-9f3*.
  - (c) **Stop following opens the one dialog**: with the default `DH`, click *Stop following FBXX*; `getByRole("dialog", { name: "Stop following FBXX" })` is present and exactly one `dialog` exists. Confirm with `retireInstrument` resolving `{ lifecycle: "retired", retiredAt: "2026-10-30T19:10:00Z" }`: `reread` is called exactly once (S2's `onStopped`, DAC-E6-15), `refresh` once with `"attention"`.
  - (d) **Row leaves, focus to heading**: continue from (c) and `rerender` with a new `ok(DH({ affected_count: 1, problems: { rows: [ROW("KO", [FAIL("prices")])], next_cursor: null } }))`: FBXX's `li` is gone and the `h2` `toHaveFocus()` (S2's fallback through this card's heading ref).
  - (e) **Refusal close re-reads**: `retireInstrument` rejects `new ApiError("instrument 'FBXX' is already retired", "req-409", { code: "instrument_already_retired" })`; the dialog stays open; `reread` is not yet called. `{Escape}` closes it and `reread` is called exactly once (DEC-0381). An `INTERNAL` refusal closed the same way calls `reread` zero times (S2: only `404`/`409` make the row stale).
  - Kills: negate-boolean on the `kind === "error"` branch (b: rows render); a hand-written mutant wiring `onRefusalClosed` to a no-op (e); a hand-written mutant passing no `fallbackFocusRef` heading (d: focus on `body`); a hand-written mutant passing `onStopped={() => {}}` (c: `reread` uncalled).

### Additional Unit Tests

- [ ] T011 Write the copy unit cases as `describe("copy.ts, Needs fixing strings (DEC-0382, -4)")` in `web/src/screens/data-health/problem-row.test.tsx` after T005.
  - `needsFixingTitle(1236)` is *Needs fixing · 1,236*; `needsFixingTitle(0)` is *Needs fixing · 0*.
  - `downloadFailed("corporate_actions", "x", 1234)` is *Downloading corporate actions failed: x, 1,234 attempts*; with reason `null` it is *Downloading corporate actions failed: no reason was recorded, 1,234 attempts*.
  - `showingOf(100, 1236)` is *Showing 100 of 1,236 stocks*.
  - `lastCompleteDownload("2026-10-29 09:00 CDT")` is *Last complete download 2026-10-29 09:00 CDT*.
  - `stopFollowingName("FBXX")`, `followDifferentName("FBXX")` and `symbolLinkName("FBXX")` are exactly *Stop following FBXX*, *Follow a different symbol than FBXX* and *FBXX, show in the coverage table*.
  - Kills: drop-defaulted-argument of `formatCount` (*1236*); swap-case of the null-reason fallback; drop-field-copy of `symbol` in any name.

**Checkpoint**: All Phase 2 tests exist and fail, because `problem-row.tsx`, `needs-fixing.tsx` and the new `copy.ts` exports do not exist, so the imports fail. Every delivered test and every CAP-003-E6-S1 and E6-S2 test still passes.

---

## Phase 3: Core Implementation

**Purpose**: The strings, the row composition and the card.

- [ ] T012 Extend `web/src/screens/data-health/copy.ts`, the catalogue CAP-003-E6-S1 created. Change nothing S1 or S2 wrote; append a section headed `// CAP-003-E6-S3: Needs fixing (data-health-ui 2.5)`. Strings are verbatim from data-health-ui 2.5, ux-design 1.4 item 3 and epic DAC-E6-8 to DAC-E6-10 unless marked. Exports:
  - `NEEDS_FIXING = "Needs fixing"`; `needsFixingTitle(n)` → `` `${NEEDS_FIXING} · ${formatCount(n)}` ``.
  - `FROM_RECENT_DOWNLOADS = "From your most recent downloads"` (joined to S1's `checked(time)` with `" · "`).
  - `DATA_TYPE_WORDS: Readonly<Record<DataType, string>>` = `{ prices: "daily prices", fundamentals: "company financials", corporate_actions: "corporate actions", reference: "reference data" }` (`DataType` from `../../api/types`; story *Implementation*).
  - `NO_REASON_RECORDED = "no reason was recorded"` (Other Notes, precedent); `downloadFailed(dataType, reason: string | null, attempts)` → `` `Downloading ${DATA_TYPE_WORDS[dataType]} failed: ${reason ?? NO_REASON_RECORDED}, ${formatCount(attempts)} attempts` ``.
  - `NOT_RECOGNISED = "The provider doesn't recognise this symbol."`
  - `CONSEQUENCE = "Its scores show as Incomplete until this is fixed, and so does every universe holding it."` (DEC-0201; no strategy wording in M1).
  - `FAILED_FIX = "Download again to retry; data already stored is never duplicated or overwritten."`; `NOT_FOUND_FIX = "Probably a typo or a delisted ticker. Downloading again won't help."`
  - `FOLLOW_DIFFERENT = "Follow a different symbol"`; `followDifferentName(s)` → `` `${FOLLOW_DIFFERENT} than ${s}` ``; `stopFollowingName(s)` → `` `${STOP_FOLLOWING} ${s}` `` (S2's constant); `symbolLinkName(s)` → `` `${s}, show in the coverage table` `` (data-health-ui 10).
  - `SHOW_MORE = "Show more"`; `MORE_PROBLEMS = "more problems"` (the `readFailed` target of DAC-E6-9); `showingOf(shown, n)` → `` `Showing ${formatCount(shown)} of ${formatCount(n)} stocks` `` (DEC-0382).
  - `NOTHING_NEEDS_FIXING = "Nothing needs fixing."`; `lastCompleteDownload(time)` → `` `Last complete download ${time}` ``; `NO_COMPLETE_DOWNLOAD = "No complete download yet"`; `LAST_COMPLETE_TARGET = "the last complete download"` (DEC-0383).

  The section's doc comment states that the `DATA_TYPE_WORDS` keys are wire values never rendered, that `{reason}` in `downloadFailed` is provider text rendered as text, and that read-failure reasons come only from S1's `readFailureReason`. No unit or hex literal appears, comments included. Makes T011 pass; supplies T002–T010.
- [ ] T013 Create `web/src/screens/data-health/problem-row.tsx` exporting `ProblemRow({ row, onStopFollowing }: { row: ProblemPage["rows"][number]; onStopFollowing: (symbol: string) => void })` (DEC-0380), the problem-row composition (UX design §3; data-health-ui 2.5, 10). It renders `<li className="flex flex-col gap-3 py-3">` (`--space-3` between a row's lines) holding, in order:
  1. `<Link to={`/data/coverage?symbol=${encodeURIComponent(row.symbol)}`} aria-label={symbolLinkName(row.symbol)} className="font-semibold">{row.symbol}</Link>`.
  2. Per failure, in served order (`data_type` order, data-health-reader l.294), a `<p className="flex items-center gap-2 text-sm">` with `<StatusBadge tier={tierOf(st)}>{labelOf(st)}</StatusBadge>` (`st = { of: "result", outcome: f.outcome }`) then, as a text child, `downloadFailed(f.data_type, f.reason, f.attempts)` for `failed` or `NOT_RECOGNISED` for `not_found`. The reason is a React text child only.
  3. `<p className="text-xs text-muted-foreground">{CONSEQUENCE}</p>`.
  4. When any failure is `failed`: `<p className="text-sm">{FAILED_FIX}</p>` (no control; the header's **Download now** is the action, D-9).
  5. When any failure is `not_found`: `<div className="flex flex-wrap items-center gap-2">` with `<Button variant="ghost" aria-label={stopFollowingName(row.symbol)} onClick={() => onStopFollowing(row.symbol)}>{STOP_FOLLOWING}</Button>`, `<Button variant="outline" asChild><Link to="/data/followed" state={{ focusAdd: true }} aria-label={followDifferentName(row.symbol)}>{FOLLOW_DIFFERENT}</Link></Button>` and `<p className="text-sm">{NOT_FOUND_FIX}</p>`.

  The doc comment cites data-health-ui 2.5, 2.7 and 10, DAC-E6-8, DAC-E6-13, AC-13, AC-14, D-9 owner-web-app's `focusAdd` entry hint (consumed by CAP-003-E7-S3) and the `?symbol=` seeding of Coverage (CAP-003-E7-S2), and states that each fix renders once per row per outcome present. Depends on T012; makes T002–T005 pass.
- [ ] T014 Create `web/src/screens/data-health/needs-fixing.tsx` exporting `NeedsFixing({ dataHealth, onReread }: { dataHealth: ReadState<DataHealth>; onReread: () => void })` (DEC-0380).
  - **Frame (every state).** `<section aria-labelledby={titleId}>` (`useId`) wrapping `<Card variant="default">`. `CardHeader` is a row (`flex-row flex-wrap items-start justify-between gap-2`) holding a column with `<CardTitle id={titleId} ref={headingRef} tabIndex={-1}>` and, when `ok`, the sub-line `<p className="text-xs text-muted-foreground">` `` `${FROM_RECENT_DOWNLOADS} · ${checked(formatClock(dh.checked_at))}` ``, then, when `ok` and `rows.some((r) => r.retryable)`, `<DownloadNow />` (CAP-003-E6-S2). The title is `NEEDS_FIXING` while loading or failed, otherwise `needsFixingTitle(dh.affected_count)`.
  - **`loading`.** `CardContent` holds three `<SkeletonLine />` (S1).
  - **`error`.** `CardContent` holds `<ReadFailure sentence={readFailed(READ_TARGETS.checks, readFailureReason(error))} onRetry={onReread} />` (S1; DAC-E6-17). `last` is never read.
  - **`ok`, page state.** `extraRows: ProblemRow[]`, `cursor: string | null`, `pagePending: boolean`, `pageFailure: string | null`, `announcement: { text; serial }`, `openFor: string | null`, refs `inFlight`, `generation`, `moreRef`, `tryRef`, `listRef`, `headingRef`. A `useEffect` on `[dh]` (the aggregate answer's object identity; owner-shell `ReadState`: each answer is a new object) resets `extraRows` to `[]`, `cursor` to `dh.problems.next_cursor`, `pageFailure` to null and bumps `generation`, so the rows always restart from the aggregate's first page (DEC-0381). `rows = [...dh.problems.rows, ...extraRows]`.
  - **`showMore()`.** Return if `inFlight`; set it and `pagePending`; `const g = generation.current`; `fetchProblems(cursor, 50)` (E3-S1; cursor as served). On success with `g` current: append `page.rows`, set `cursor = page.next_cursor`, set `announcement = { text: showingOf(rows.length + page.rows.length, dh.affected_count), serial + 1 }`; when `page.next_cursor === null` and `document.activeElement === moreRef.current`, focus `listRef.current` after the render (Resolved Conflict 2). On failure with `g` current: `pageFailure = readFailureReason(e)` for `ApiError`/`ApiUnreachableError` (any other thrown value is passed as a plain `ApiError`, as S2 does, so no thrown text shows); when *Show more* had focus, focus `tryRef.current` after the render. `finally` clears both.
  - **`ok`, `affected_count > 0`.** `CardContent` holds `<ul ref={listRef} tabIndex={-1} aria-labelledby={titleId} className="flex flex-col divide-y divide-border">` with `rows.map((r) => <ProblemRow key={r.symbol} row={r} onStopFollowing={setOpenFor} />)`; then, when `pageFailure`, `<p role="status" className="text-sm">{readFailed(MORE_PROBLEMS, pageFailure)}</p>` and `<Button ref={tryRef} variant="outline" onClick={onReread}>{TRY_AGAIN}</Button>` (the S1 `ReadFailure` convention, itself CAP-003-E1-S9's `StateRegion` error convention, written out for the ref); else, when `cursor !== null`, `<Button ref={moreRef} variant="outline" aria-busy={pagePending || undefined} onClick={() => void showMore()}>{SHOW_MORE}</Button>` (never `disabled`).
  - **`ok`, `affected_count === 0`.** `<p className="text-base font-semibold">{NOTHING_NEEDS_FIXING}</p>` and the last-complete line from a module-local `LastComplete` child keyed on `dh` (so a new aggregate answer re-reads, DEC-0383): it calls `listAcquisitionRuns({ state: "succeeded", limit: 1 })` on mount and on its own **Try again**; pending renders `<SkeletonLine />`; a run renders `<p className="text-xs text-muted-foreground">{lastCompleteDownload(formatInstant(run.startedAt ?? run.requestedAt))}</p>`; none renders `NO_COMPLETE_DOWNLOAD` the same way; a failure renders `<ReadFailure sentence={readFailed(LAST_COMPLETE_TARGET, readFailureReason(e))} onRetry={read} />`. Responses after unmount are ignored.
  - **Always (when `ok`).** `<output aria-live="polite" className="sr-only"><span key={announcement.serial}>{announcement.text}</span></output>` outside the list (the delivered `results-table.tsx` l.684–685 pattern), and `<StopFollowingDialog symbol={openFor} onClose={() => setOpenFor(null)} onStopped={onReread} onRefusalClosed={onReread} fallbackFocusRef={headingRef} />` rendered once, beside the rows and not inside `ProblemRow`, and not wrapped in `memo` (S2 caller contract).
  - **Doc comment.** Cites data-health-ui 2.5, 2.7, 3 and 10, DAC-E6-9, DAC-E6-10, DAC-E6-15, DAC-E6-17, AC-16, AC-25, DEC-0201 (the header count is the aggregate's `affected_count`, the set the rail chip counts), register C3 (the last-complete read only at 0), and DEC-0380 to -4. It states that the component calls no shell hook itself (S2's children do) and that S5 passes `useDataHealth().state` and `retry`.

  Depends on T012 and T013; makes T006–T010 pass.

**Checkpoint**: `npx vitest run web/src/screens/data-health` is green, including CAP-003-E6-S1's and E6-S2's files. The module gains exactly `ProblemRow`, `NeedsFixing` and the `copy.ts` additions.

---

## Phase 4: Integration

**Purpose**: Prove the new files sit cleanly in the delivered suite and the shared scans.

- [ ] T015 Run `npm run test` unchanged. It includes `web/src/api/render.test.tsx`, which walks `web/src` and forbids `dangerouslySetInnerHTML` (data-health-ui 4), and, when present, `web/src/components/token-literals.test.ts` (CAP-003-E1-S1; S5 adds this directory). Run S5's future literal scan by hand: `grep -nE "[0-9](px|rem|em|vh|vw)\b|#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(" web/src/screens/data-health/problem-row.tsx web/src/screens/data-health/needs-fixing.tsx web/src/screens/data-health/copy.ts` prints nothing. Confirm with `git status --short web/ package.json` that the only changes are the four new files and the `copy.ts` append (traces to AC-13, AC-24).

**Checkpoint**: Whole suite green; literal scan clean; only this story's files changed.

---

## Phase 5: Polish

**Purpose**: Validation commands, mutation pass and TDD evidence.

- [ ] T016 Run `npm run lint`, `npm run format` and `npx tsc --noEmit` from the repo root, formatting only the changed files with `npx biome format --write web/src/screens/data-health/problem-row.tsx web/src/screens/data-health/problem-row.test.tsx web/src/screens/data-health/needs-fixing.tsx web/src/screens/data-health/needs-fixing.test.tsx web/src/screens/data-health/copy.ts`. Then `npm run build`. Then the mutation pass: `python3 scripts/mutation-run.py run --command "npx vitest run web/src/screens/data-health && npx tsc --noEmit"` over `problem-row.tsx`, `needs-fixing.tsx` and the S3 section of `copy.ts`, with the hand-written mutants in Other Notes; no surviving non-equivalent mutant (traces to AC-13, AC-14).
- [ ] T017 After each TDD cycle in T002–T016 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E6-S3-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is planned (INV-TDD-002, TEST-TDD-008; traces to no AC). The cycles:
  1. T002–T005, T011, T012 and T013 (the row and its strings).
  2. T006, T007 and the rows/Show more parts of T014.
  3. T009 and the zero-state part of T014.
  4. T010 and the loading/error/dialog parts of T014.
  5. T008 (tests only; joins cycle 4's evidence if no production change follows). T015 and T016 add no behaviour and join cycle 5's validation evidence.

**Checkpoint**: Every acceptance criterion is satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E6-S2 | hard | `DownloadNow`, `StopFollowingDialog` and `STOP_FOLLOWING` (S2 plan T009–T011, DEC-0379). Existing edge |
| CAP-003-E6-S1 | hard | `copy.ts` (`TRY_AGAIN`, `READ_TARGETS`, `checked`, `readFailed`, `readFailureReason`) and `ReadFailure`, `SkeletonLine` from `check-card.tsx` (S1 plan T012, T013). Existing edge |
| CAP-003-E3-S1 | hard | `fetchProblems`, `ReadState`, `DataHealth`, `ProblemPage` (E3-S1 plan T009, T010). Existing edge |
| CAP-003-E1-S5 | hard | `StatusBadge`, `tierOf`, `labelOf` with the `result` member (E1-S5 plan T006). Existing edge |
| CAP-003-E1-S1 | hard | `Card`, `CardHeader`, `CardTitle`, `CardContent`, `Button` (`ghost`, `outline`, `asChild`). Existing edge |
| CAP-003-E1-S6 | hard | `formatInstant`, `formatClock`, `formatCount`. Existing edge |
| CAP-003-E3-S3 | context | No direct import. S2's components call `useShell`, so this story's tests mock `../../app/shell-context`; the module is ordered before this story through the hard edge CAP-003-E6-S2 → CAP-003-E3-S3. `useDataHealth().retry` reaches `NeedsFixing` as the `onReread` prop from S5 |
| CAP-003-E6-S5 | reverse | `DataHealthScreen` renders `NeedsFixing` with `useDataHealth().state` and `retry` (S5 Dependencies; graph: S5 depends on S3) |
| CAP-003-E6-S6 | reverse | The real-stack journeys (TC-INT-014, TC-INT-019) exercise these rows through the screen; graph: S6 → S7 → S5 → S3 |
| CAP-003-E1-S9 | context | Its `StateRegion` error convention (`role="status"` sentence, **Try again** `outline` outside it) is followed by the Show more failure markup; nothing imported |
| CAP-003-E7-S3 | context | Followed stocks reads `location.state.focusAdd` and focuses its add field (owner-web-app l.209, l.265–266); this story only sends the state (DAC-E6-13) |
| CAP-003-E7-S2 | context | Coverage seeds its filter from `?symbol=`; this story only links there (DAC-E6-8) |

No new hard dependency was found, so no edge is added to `CAP-003-E6-S3: [CAP-003-E6-S2, CAP-003-E6-S1, CAP-003-E3-S1, CAP-003-E1-S5, CAP-003-E1-S1, CAP-003-E1-S6]`.

### Task Dependencies

- T001: no dependencies.
- T002 → T003 → T004 → T005 → T011: same file (`problem-row.test.tsx`), sequential, after T001.
- T006 → T007 → T008 → T009 → T010: same file (`needs-fixing.test.tsx`), sequential, after T001; parallel with the `problem-row.test.tsx` chain.
- T012: depends on T001 (its tests exist first per the T017 cycles).
- T013: depends on T012.
- T014: depends on T012 and T013.
- T015: depends on T013, T014. T016: depends on T015.
- T017: interleaved; runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities

- The two test files can be written in parallel.
- T013 can be written while T014's page-state logic is designed; T014 imports T013, so it lands second.

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

The Python commands do not apply (no file under `src/`), and `npm run test:e2e` does not apply (no end-to-end case belongs to this story).

### Story-Specific Validation

- **DAC-E6-8, DAC-E6-S3-1, AC-13, AC-14**: T002 passes; a *Not found* row has no control whose name contains *download*.
- **DAC-E6-9, DAC-E6-S3-2, AC-16, AC-25**: T006 and T007 pass: calls `[["S049", 50], ["S099", 50]]`, 120 rows in order, *Needs fixing · 120*, focus on *Show more* while it exists.
- **DAC-E6-10**: T009 passes; `listAcquisitionRuns` is called only at `affected_count` 0, with `{ state: "succeeded", limit: 1 }`.
- **DAC-E6-13**: T003 passes with state `{ focusAdd: true }`.
- **DAC-E6-S3-3, AC-24**: T004 and T007 pass; `grep -n "dangerouslySetInnerHTML\|\.message\|requestId" web/src/screens/data-health/problem-row.tsx web/src/screens/data-health/needs-fixing.tsx` prints nothing (doc comments must not name them either).
- **DAC-E6-S3-4, AC-19**: T008 passes in every state. Source cross-check: `grep -niE "\b(instrument|acquisition|acquire|run|runs|retire|retired)\b" web/src/screens/data-health/problem-row.tsx web/src/screens/data-health/needs-fixing.tsx` prints only comment lines that cite a design or a delivered file, never a string literal.
- **DAC-E6-S3-5, AC-20**: T005 passes.

---

## Notes

### Resolved Conflicts

1. **When **Show more** appears.** ux-design 1.4 item 3 says "After 50 rows, **Show more** … `cursor={last symbol}`". **Governing:** epic DAC-E6-9 and data-health-ui 2.5: it appears when `next_cursor` is set and sends the cursor as served (DAC-E6-S3-2; register C8). The served cursor is the last symbol, so the UX wording describes the same request.
2. **"The control keeps focus" when the last page removes it.** DAC-E6-S3-2 activates **Show more** twice over 120 stocks; the second page served has `next_cursor` null, and DAC-E6-9 / data-health-ui 2.5 show the control only "when `next_cursor` is set", so it leaves the DOM. **Governing:** the story AC while the control exists (T006 asserts focus on it after the first activation), and, for the moment it is removed, the delivered precedent (ladder step 5): `web/src/screens/research/set-history-dialog.tsx` l.116 and `web/src/screens/research/stocks/history-tab.tsx` l.134 move focus from a removed **Show more** to the list it extended. Here focus moves to the rows `ul` (`tabIndex` -1), never to `body`. The same precedent covers a page failure replacing **Show more**: focus moves to the **Try again** that replaced it.
3. **Source of "Last complete download".** ux-design 1.4 States says the most recent *Complete* row of Recent downloads. **Governing:** epic DAC-E6-10 and data-health-ui 2.5: a dedicated `listAcquisitionRuns({ state: "succeeded", limit: 1 })`, read only at `affected_count` 0 (register C3; T009 (d)).
4. **Which header carries **Download now** in this story.** The epic Goals line says "Download now in the header only when a row is retryable". **Governing:** DAC-E6-9 and data-health-ui 2.5: this is the *Needs fixing* card header. The page header's **Download now** is CAP-003-E6-S1/S5's (register C10).
5. **Wording of a failed read's `{reason}`.** Delivered envelope messages carry domain terms (`instruments.py` l.113–125; data-health-api's *`cursor` must be a stock symbol.*). **Governing:** DAC-E6-S3-3/-4 (no `request_id`, no forbidden term) and ux-design 0.7 ("the envelope's `code` selects the wording"): every `{reason}` comes from S1's `readFailureReason` (DEC-0373), which already maps `validation_error` (the `422`) to *FactorFlow hit an unexpected problem*. No new reason wording is coined here (register G3 for S3).

### Open Gaps

1. **The two components' interfaces and their loading and error states. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0380.**
   - **What is undetermined.** data-health-ui 2.1 names the files only. No artifact fixes the props, which component holds the dialog, or what *Needs fixing* shows while the aggregate loads or fails (the header count is unknown then).
   - **What the plan adopts (T010, T013, T014).** `ProblemRow({ row, onStopFollowing })`; `NeedsFixing({ dataHealth: ReadState<DataHealth>, onReread })`, which renders the `h2` *Needs fixing* without a count and three skeleton lines while loading, the same `h2` with *Couldn't read the data health checks: {reason}.* and **Try again** (→ `onReread`) while failed, ignoring `last`, and renders `StopFollowingDialog` once beside the rows with its heading as `fallbackFocusRef`.
   - **Derivation.** ux-design 1.4 Loading ("skeleton rows in the three lower cards") and DAC-E6-17 ("keep each card's header and replace its body", with the aggregate's wording) give the states; S1 T007 (e) already renders the same aggregate failure sentence. Taking `ReadState` keeps the heading — S2's focus fallback target — mounted in every state. S2's caller contract (DEC-0379) fixes the dialog placement.
   - **Alternatives rejected.** Taking `DataHealth` only and letting S5 render the loading/error cards (S1's choice for the check cards) was rejected because the heading would then be S5's and the fallback ref would cross components.
   - **Classification.** Propagating: CAP-003-E6-S5 renders `<NeedsFixing dataHealth={state} onReread={retry} />`.
   - **Owning design.** data-health-ui 2.1, 2.5 and 10 (States), at its next revision.
2. **Which read refreshes the rows after a stop-following refusal and on the Show more **Try again**, and what a Show more failure other than `422` shows. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0381.**
   - **What is undetermined.** DAC-E6-12 says "refresh the row on close" after a `404`/`409`; DAC-E6-9 says **Try again** "restarts from the first page". Neither names the read (register G4; S2 Open Gap 4 hands it to this plan). DAC-E6-9 names only the `422`; a `500` or an unreachable API on **Show more** is not covered.
   - **What the plan adopts (T007, T010, T014).** Both call `onReread`, the aggregate re-read (`useDataHealth().retry`), and every new aggregate answer resets the loaded pages to its first page. Any **Show more** failure keeps the loaded rows and renders *Couldn't read more problems: {reason}.* with **Try again**, the reason from `readFailureReason`.
   - **Derivation.** data-health-ui 3 "One problem set (DEC-0201): the header count, the verdict's *n* and the rows come from one response", which a page re-fetch would break, and its refresh list "on load, **Try again**, once when a download ends, after **Stop following**" (unqualified by success); DAC-E6-15 lists "on **Try again**" and forbids only a timer. Treating every page failure like the `422` follows the per-card error pattern (ux-design 1.4 Error) without dropping rows the owner already sees.
   - **Alternatives rejected.** Re-fetching the loaded pages with `fetchProblems` (keeps DAC-E6-15's list literal but mixes responses); a refusal close that re-reads nothing (contradicts DAC-E6-12).
   - **Classification.** Propagating: it adds aggregate reads that CAP-003-E6-S5's refresh-rule test (DAC-E6-S5-2) and the integration cases observe; S5 must not treat a refusal-close read as a fault.
   - **Owning design.** data-health-ui 2.5, 2.7 and 3, at its next revision.
3. **The wording of the **Show more** announcement. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0382.**
   - **What is undetermined.** DAC-E6-9 and ux-design 1.4 require "the new row count announced politely"; no artifact gives the words.
   - **What the plan adopts (T006, T012).** *Showing {shown} of {n} stocks*, `n` being `affected_count`, through a keyed `sr-only` polite `output`.
   - **Derivation.** It is the product's own "Showing {n} of {m}" pattern (S08 portfolio, cited in UX spec-review FINDING-42), with *stocks* as the count noun of the header and the verdict; the total ties the announcement to the header count (AC-16).
   - **Classification.** Contained.
   - **Owning design.** data-health-ui 2.5 and 10, at its next revision.
4. **The last-complete-download line while its read is pending or failed, and when it is re-read. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0383.**
   - **What is undetermined.** DAC-E6-10 gives the line for one run and for none; DAC-E6-17's error list does not include this read, and nothing says when it is repeated.
   - **What the plan adopts (T009, T014).** Pending: a skeleton line under *Nothing needs fixing.* Failed: *Couldn't read the last complete download: {reason}.* with **Try again** re-reading only this list. Re-read once per aggregate answer that has `affected_count` 0.
   - **Derivation.** ux-design 1.4 Loading/Error per region (skeleton; *Couldn't read {what}: {reason}.* with **Try again**), applied to the one read it does not list, with S1's `readFailed` and `readFailureReason`. Re-reading with each aggregate answer keeps the line current after a download ends (the aggregate is re-read then, DAC-E6-15) without any timer.
   - **Classification.** Contained.
   - **Owning design.** data-health-ui 2.5 and 10, at its next revision.

### Other Notes

- **Null failure reason (settled by precedent, ladder step 5).** `ProblemRowResponse.failures[].reason` is `str | None` (data-health-reader l.173, l.192). The delivered run roster renders the same recorded result reason as `row.reason ?? "No reason was recorded."` (`web/src/screens/runs/detail/instrument-roster.tsx` l.48); the clause form *no reason was recorded* is used here. A not-found failure's reason is not rendered: its sentence is fixed (DAC-E6-8).
- **Start time of the last complete download.** `formatInstant(run.startedAt ?? run.requestedAt)`, CAP-003-E1-S6's `formatDownloadName` rule without its *Download* prefix (the sentence already names it), and system-design OQ1 (answered 2026-10-25: the start time in America/Chicago is the permanent naming). It is not a link: DAC-E6-10 gives none.
- **Fix once per outcome per row.** data-health-ui 2.5 gives the fix "to the row" (*the row **Stop following***), so a row with two *Failed* failures shows the download-again sentence once, and a row with both outcomes shows both fixes (DAC-E6-S3-1).
- **Order.** Rows render in served order; the reader orders by symbol (`ORDER BY i.symbol`, data-health-reader l.294) and keyset pages continue it. A client sort would be an equivalent mutant on real data and is not added.
- **Retryable.** The header condition reads `row.retryable` (DAC-E6-9); the row's fix lines read the failure outcomes (DAC-E6-8). On served data they agree (data-health-reader: `retryable` = any failure `failed`).
- **Singular copy (register G11).** *{attempts} attempts* and *Showing 1 of …* have no singular form in any artifact and are implemented as written; *1 attempts* is recorded as a copy follow-up for data-health-ui 2.5, not adopted silently.
- **Strategy wording.** The consequence names scores and universes only (DEC-0210; UX 0.8). The one blueprint sentence that mentions strategies is S2's dialog description.
- **`focusAdd` consumer.** Focusing the add field is CAP-003-E7-S3's (owner-web-app l.209); this story asserts only the navigation and the router state (register C9).
- **No self-contradicting check.** The term scan reads rendered text and accessible names, never source; `DATA_TYPE_WORDS` keys (`corporate_actions`) and wire codes in `copy.ts` are never rendered, and the T008 planted case proves `\b` does not match inside them. The Validation Plan grep for `\.message|requestId|dangerouslySetInnerHTML` applies to the two production files, whose doc comments must not use those tokens.
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `web/src/screens/data-health/needs-fixing.tsx`: `needsFixingTitle(dh.affected_count)` → `needsFixingTitle(rows.length)`
  - `web/src/screens/data-health/needs-fixing.tsx`: `rows.some((r) => r.retryable)` → `dh.problems.rows.some((r) => r.retryable)`
  - `web/src/screens/data-health/needs-fixing.tsx`: `[...dh.problems.rows, ...extraRows]` → `[...extraRows, ...dh.problems.rows]`
  - `web/src/screens/data-health/needs-fixing.tsx`: `onRefusalClosed={onReread}` → `onRefusalClosed={() => {}}`
  - `web/src/screens/data-health/needs-fixing.tsx`: `onClick={onReread}` (page Try again) → `onClick={() => void showMore()}`
  - `web/src/screens/data-health/needs-fixing.tsx`: the `[dh]` reset effect → (deleted)
  - `web/src/screens/data-health/needs-fixing.tsx`: `readFailureReason(e)` → `e.message`
  - `web/src/screens/data-health/needs-fixing.tsx`: `run.startedAt ?? run.requestedAt` → `run.endedAt ?? run.requestedAt`
  - `web/src/screens/data-health/problem-row.tsx`: the per-row fix → one fix per failure
  - `web/src/screens/data-health/problem-row.tsx`: `state={{ focusAdd: true }}` → (removed)
