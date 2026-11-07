---
artifact_schema_version: 1
artifact_id: CAP-003-E5-S3-tasks
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
  timestamp: 2026-11-07T06:45:52Z
  source_artifacts:
    - id: CAP-003-E5-S3
      version: "1"
    - id: CAP-003-E5
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-home-ui-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E5-S3 — Needs You Card and the Home Screen: One Action per Item, the Honest Empty State and Nothing Unshipped

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/home/stories/CAP-003-E5-S3.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `home-ui`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

The owner wants Home to list what needs them, most important first, each with one action, and to say plainly when nothing does or when no data has been downloaded yet. This story closes the Home screen (component design `home-ui` 2.1, 2.2, 2.5, §3, §10; UX design 1.3).

- `web/src/screens/home/needs-you-card.tsx` exports `NeedsYouCard()`, which takes no props and reads `useShell()` only (DEC-0367).
  - Its list is `sortAttention(deriveNeedsYou(attention, scores))` (CAP-003-E1-S8), the same call the rail's Home chip makes (AC-16).
  - Each item renders through `NeedsYouItemRow` (CAP-003-E1-S8) with the catalogue copy of `home-ui` 2.5 from `copy.ts` (CAP-003-E5-S1), the 28 px tile size from `LAYOUT.markerSize` (CAP-003-E3-S2), and one navigating link styled `button` `outline`, named for the item.
  - The header is *Needs you · {n}*, the sub-line and *checked {time}*. A changed count is announced through a polite `output` (DEC-0370).
  - The body renders through `StateRegion` (CAP-003-E1-S9): skeleton rows while loading; the list, or *Nothing needs you right now.*, once attention answers; *Couldn't read what needs you: {reason}.* with **Try again** while it fails. The kinds that do not apply carry their recorded reasons.
- `web/src/screens/home/index.tsx` default-exports `HomeScreen`. It renders inside the shell's `main`, capped at `LAYOUT.contentMaxWidth`:
  - the header (`HomeHeader`, CAP-003-E5-S1);
  - while `latest_download` is null, the empty-state card with **Start setup** (DAC-E5-1);
  - otherwise the three-column summary row holding only the data tile (`DataTile`, CAP-003-E5-S2), with the *Needs you* card below it at full width (Resolved Conflict 1).
- Nothing renders strategy, paper or live text, and no action mutates state.
- The story widens CAP-003-E1-S1's literal scan to `web/src/screens/home/`. It adds a few plain strings to E5-S1's `copy.ts`, and makes one defaulted change to `ITEMS.data_problems.actionName` (DEC-0368 and -3).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-7 | The first download's progress shows through the *Your first download is running* item until scores exist | T011, T012, T016 |
| AC-9 | Exactly one action per item; tier then recency order; an item leaves only when its cause is resolved | T002, T003, T011, T016 |
| AC-10 | No strategy, paper or live region or placeholder | T006, T014, T017 |
| AC-12 | `download_not_complete` renders *Interrupted* as serious and *Failed* as critical | T011, T016 |
| AC-16 | Home's count is the same derivation as the rail chip | T012, T016 |
| AC-21 | Before any download, Home says no data has been downloaded and offers setup | T005, T017 |
| AC-24 | Every Home region renders the eight states or records why one does not apply | T007, T008, T012, T016, T017 |
| AC-25 | Keyboard-completable; every polled region shows its last-updated time | T002, T003, T007, T012, T014, T016 |
| AC-26 | Built from `ui-components`; tokens only | T004, T010, T012, T014, T016, T017, T018 |
| DAC-E5-1 | Never-downloaded empty state as stated; header kept; no tile or list | T005, T017 |
| DAC-E5-7 | Each kind's tag, tier, title, body and single action; plural and dropped-clause rules | T002, T011, T013, T015, T016 |
| DAC-E5-8 | Each action a link styled `button` `outline` named for the item; no action mutates | T002, T011, T015, T016 |
| DAC-E5-9 | *Nothing needs you right now.* with *checked {time}*; polite announcement; focus never moves | T003, T016 |
| DAC-E5-10 | No strategy, paper or live text or role; summary row columns two and three empty | T006, T017 |
| DAC-E5-11 | Per-card error with **Try again** and aging *checked {time}*; summary `404` keeps server items and DEC-0216's first-download item | T007, T012, T016, T017 |
| DAC-E5-S3-1 | Order and the three named actions; `fetch` never called with a mutating method | T002 |
| DAC-E5-S3-2 | The item leaves; the new count is announced politely; `document.activeElement` unchanged | T003 |
| DAC-E5-S3-3 | Each state renders through `StateRegion` or records why it does not apply | T008, T016 |
| DAC-E5-S3-4 | Literal scan widened to `web/src/screens/home/` and passing | T010, T018 |
| DAC-E5-S3-5 | No DAC-E7-3 term in any state; every label from `labelOf` or `copy.ts` | T009, T013 |
| DAC-E5-S3-6 | Tag badges through `StatusBadge` with label text and `aria-hidden` shape; tile `aria-hidden`; nothing by colour alone | T004 |

Mapped test cases (`tests/component/home-ui-tests.md` lines 33-52, 99-141 and 338-467; `tests/coverage-matrix.md` lines 44, 45, 56, 59, 61, 239-249, 259-264 and 421, which counts this story "6 of 6"):

| Test case | Traces to | Task |
|---|---|---|
| **TC-COMP-127** | AC-21, DAC-E5-1 | T005 |
| **TC-COMP-130** | AC-10, DAC-E5-10 | T006 |
| **TC-COMP-131**, the Home half | AC-24, DAC-E5-11 | T007 |
| **TC-COMP-141** | AC-9, AC-25, DAC-E5-S3-1, DAC-E5-7, DAC-E5-8 | T002 |
| **TC-COMP-142** | AC-9, AC-25, DAC-E5-S3-2, DAC-E5-9 | T003 |
| **TC-COMP-143** | AC-24, DAC-E5-S3-3 | T008 |
| **TC-COMP-144** | AC-26, DAC-E5-S3-4 | T010 |
| **TC-COMP-145** | AC-19, DAC-E5-S3-5 | T009 |
| **TC-COMP-146** | AC-20, DAC-E5-S3-6 | T004 |

- TC-COMP-131's tile half (the tile's error sentence, **Try again** → `refresh("scores")`) is CAP-003-E5-S2's T006. T007 here asserts the Home half: header kept, both cards' errors, the card's **Try again**, aging *checked*, and the `404` and `500` summary cases for the list.
- AC-7, AC-12 and AC-16 have no `home-ui` case: their rows list ui-components, data-health and integration cases. T011 and T012 add unit tests for Home's side of each.
- The test specification is `status: draft`. Its steps are used as written and sharpened below into literal assertions.

## Phase 1: Setup

**Purpose**: Confirm the hard dependencies are in the tree with the shapes their plans fix, and record a green baseline.

- [ ] T001 From the repo root, confirm the producers this story imports exist with the shapes their plans fix. Where a merged signature differs from the one named here, use the merged one and record the difference in this story's TDD evidence. Then run `npm run test` and record that it passes before any change. No package, configuration or token is added (traces to AC-26).
  - CAP-003-E3-S3: `web/src/app/shell-context.tsx` exports `useShell` and `ShellContextValue` (`health`, `attention`, `scores`, `refresh(kind)`, `setTitleDetail`).
  - CAP-003-E3-S1: `web/src/app/shell-types.ts` exports `Attention`, `ReadState`, `ScoreState` and `ScoreSummary`, snake_case as served.
  - CAP-003-E3-S2: `web/src/app/layout.ts` exports `LAYOUT` with `contentMaxWidth: "1180px"` and `markerSize: "28px"`.
  - CAP-003-E1-S8: `web/src/components/patterns/needs-you.ts` exports `NeedsYouItem`, `deriveNeedsYou` and `sortAttention`. `needs-you-item.tsx` exports `NeedsYouItemRow({ item, title, body, actionLabel, actionName, markerSize })` (DEC-0319).
  - CAP-003-E1-S9: `web/src/components/patterns/state-region.tsx` exports `StateRegion` and `StateRenderers` (`{ state: ScreenState<T>; renderers; onRetry }`, error in a `role="status"` element followed by an `outline` **Try again**; DEC-0313 and -2).
  - CAP-003-E1-S6: `web/src/components/patterns/presence.tsx` exports `Absent({ label })`. `format.ts` exports `formatInstant` and `formatClock`, each accepting an ISO string.
  - CAP-003-E1-S1:
    - `web/src/components/ui/card.tsx` exports `Card` (`variant` as `data-variant`), `CardHeader`, `CardTitle` (an `h2` forwarding `id`) and `CardContent`;
    - `button.tsx` exports `Button` with `asChild` and the `default` and `outline` variants;
    - `web/src/components/token-literals.test.ts` exports `SCANNED_DIRECTORIES`, `isScannedSource` and `literalsIn` (DEC-0296).
  - CAP-003-E5-S1: `web/src/screens/home/header.tsx` exports `HomeHeader()`. `copy.ts` exports `NEEDS_YOU`, `EMPTY_STATE`, `ITEMS`, `NOT_DETERMINABLE` and `CHECKED` (DEC-0362).
  - CAP-003-E5-S2: `web/src/screens/home/data-tile.tsx` exports `DataTile()`, whose root is a `section` labelled by its `h2` *Data* (DEC-0363). `copy.ts` exports `READ_FAILURE` (DEC-0366).

**Checkpoint**: Every producer is present and the Vitest suite is green.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin the list's order, copy, names, announcement and states; the Home layout and empty state; the vocabulary; and the widened literal scan.

**Shared harness.** Both `web/src/screens/home/needs-you-card.test.tsx` (T002–T004, T011, T012) and `web/src/screens/home/home.test.tsx` (T005–T009, T014) use it. This is the consumer seam CAP-003-E5-S1's and CAP-003-E5-S2's plans use.

- Mock the shell:
  - `const shell = vi.hoisted(() => ({ value: {} as unknown as ShellContextValue }))`;
  - `vi.mock("../../app/shell-context", () => ({ useShell: () => shell.value }))`;
  - in `beforeEach`, set `shell.value = { health: { kind: "loading" }, attention, scores, refresh: vi.fn(), setTitleDetail: vi.fn() }`, cast as the type requires.
- Clock:
  - `vi.useFakeTimers({ shouldAdvanceTime: true })` and `vi.setSystemTime(new Date("2026-10-16T01:00:00Z"))` (Thursday 2026-10-15 20:00 CDT, market closed) in `beforeEach`;
  - `vi.useRealTimers()` in `afterEach`;
  - `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`.

  This is the delivered precedent of `web/src/app/status-region.test.tsx` lines 31-32. `HomeHeader` keeps a minute interval.
- Render:
  - Inside `MemoryRouter initialEntries={["/home"]}` with `<Routes><Route path="/home" element={<X />} /><Route path="*" element={<LocationProbe />} /></Routes>`. `LocationProbe` renders `useLocation().pathname` in `data-testid="location"`.
  - Re-render after changing `shell.value` with `rerender` of the same tree.
- `fetch` is the global `vi.fn()` stub of `web/src/test-setup.ts`.
- Locators:
  - `card()` is `getByRole("region", { name: /^Needs you/ })`, the `section` labelled by its `h2`;
  - `rows()` is `within(card()).queryAllByRole("listitem")`;
  - collapsed text is `textContent.replace(/\s+/g, " ").trim()`.

Fixtures are independent literals typed `Attention` and `ScoreSummary`, never produced by code under test. Every expected string below is a literal.

- `ATTENTION`:
  - `checked_at: "2026-10-15T22:52:10Z"` (17:52:10 CDT), `followed_count: 26`, `prices_as_of: "2026-10-14"`, `credential_present: false`;
  - `problems: { stock_count: 3, symbols: ["KO", "TSLA", "FBXX"], newest_completed_at: "2026-10-15T22:31:00Z" }`;
  - `latest_download: { run_id: "run-7", state: "failed", requested_at: "2026-10-15T21:00:00Z", started_at: "2026-10-15T21:02:00Z", ended_at: "2026-10-15T22:40:00Z", progress: { done: 30, total: 30 } }`;
  - `latest_terminal_download: { run_id: "run-7", state: "failed", ended_at: "2026-10-15T22:40:00Z", failure_reason: "The market data service refused the request" }`;
  - `items`, in this deliberately unsorted order:
    - `{ kind: "data_problems", recorded_at: "2026-10-15T22:31:00Z", run_id: null }`;
    - `{ kind: "download_not_complete", recorded_at: "2026-10-15T22:40:00Z", run_id: "run-7" }`;
    - `{ kind: "credential_missing", recorded_at: "2026-10-15T22:52:10Z", run_id: null }`.

  The symbols are in the order the AC's example name gives (Other Notes, *Symbol order*).
- `INTERRUPTED`: `ATTENTION` with `latest_download.state` and `latest_terminal_download.state` set to `"abandoned"` and `failure_reason: null`.
- `FIRST(total)`: `ATTENTION` with these fields replaced:
  - `credential_present: true`, `problems: { stock_count: 0, symbols: [], newest_completed_at: null }`, `items: []`, `latest_terminal_download: null`;
  - `latest_download: { run_id: "run-1", state: "running", requested_at: "2026-10-15T21:00:00Z", started_at: "2026-10-15T21:02:00Z", ended_at: null, progress: { done: 12, total } }`.
- `SCORED`: `FIRST(30)` with `latest_download.state` set to `"succeeded"`, `ended_at: "2026-10-15T22:40:00Z"`, and `latest_terminal_download: { run_id: "run-1", state: "succeeded", ended_at: "2026-10-15T22:40:00Z", failure_reason: null }`.
- `NEVER_DOWNLOADED`: `FIRST(30)` with `latest_download: null`.
- `SUMMARY(over)`: a served `ScoreSummary` built from these defaults, with `over` applied:
  - `never_classified: false`;
  - `set: { set_id: "s-1", classification_date: "2026-10-15", run_id: "run-1", run_started_at: "2026-10-15T21:02:00Z" (16:02 CDT), run_outcome: "succeeded", state: "complete", started_at: "2026-10-15T22:41:00Z", ended_at: "2026-10-15T22:46:00Z", latest_trading_day: "2026-10-15", active_instruments: 30, not_current: false }`;
  - `later: null`;
  - `factors`: the three `FactorName` keys, each `{ qualified_count: 30, ranked: true, min_peer_set_size: 5 }`;
  - `stocks_current: { current_count: 27, followed_count: 30 }`.

  Named variants:
  - `FAILED`: `set.not_current: true`, `later: { set_id: "s-2", state: "failed", started_at: "2026-10-15T23:00:00Z", ended_at: "2026-10-15T23:05:00Z", failure_reason: "The scoring engine stopped", run_id: "run-8", run_started_at: "2026-10-15T22:58:00Z" }`.
  - `NEVER_BUILDING`: `never_classified: true`, `set: null`, `stocks_current: null`, `later: { set_id: "s-1", state: "building", started_at: "2026-10-15T22:41:00Z", ended_at: null, failure_reason: null, run_id: "run-1", run_started_at: "2026-10-15T21:02:00Z" }`.
  - `NEVER_FAILED`: `NEVER_BUILDING` with `later.state: "failed"`, `ended_at: "2026-10-15T23:05:00Z"` and `failure_reason: "The scoring engine stopped"`.
- Score states:
  - `served(s)`: `{ kind: "served", data: s, checkedAt: new Date("2026-10-15T22:53:00Z") }`;
  - `NOT_SERVED`: `{ kind: "not_served" }`;
  - `SCORES_LOADING`: `{ kind: "loading" }`;
  - `SUMMARY_500`: `{ kind: "error", error: new ApiError("Internal error", "req-9f3", { code: "internal_error" }), last: null }`.
- Attention states:
  - `ok(a)`: `{ kind: "ok", data: a, checkedAt: new Date("2026-10-15T22:53:41Z") }`. The client time differs from `checked_at` on purpose;
  - `ATT_LOADING`: `{ kind: "loading" }`;
  - `ATT_UNREACHABLE`: `{ kind: "error", error: new ApiUnreachableError("GET /api/attention could not be reached"), last: { data: { ...ATTENTION, checked_at: "2026-10-15T22:40:05Z" }, checkedAt: new Date("2026-10-15T22:40:06Z") } }`;
  - `ATT_500`: `{ kind: "error", error: new ApiError("Internal error", "req-9f3", { code: "internal_error" }), last: null }`.

### Mandatory Component Tests

- [ ] T002 Implement TC-COMP-141 (Needs you order, action names and no mutating request) in a new `web/src/screens/home/needs-you-card.test.tsx`, with a `// Implements TC-COMP-141` comment, rendering `<NeedsYouCard />` with the shared harness.
  - (a) Order, `ok(ATTENTION)` with `served(SUMMARY())`:
    - Each row's `p.font-semibold` text, in document order, `toEqual` `["The market data key is missing", "The last download failed", "KO, TSLA and FBXX are missing data"]`. This is critical (newest), critical (older), warning.
    - With `ok(INTERRUPTED)`, the order is `["The market data key is missing", "The last download was interrupted", "KO, TSLA and FBXX are missing data"]`: critical, serious, warning.
  - (b) Names. In each row, `within(row).getAllByRole("link")` has length 1. The three links' accessible names, in order, `toEqual` `["Open Settings to set the market data key", "See the download that failed", "Fix data for KO, TSLA and FBXX"]`. Their `getAttribute("href")` values `toEqual` `["/settings", "/data/downloads/run-7", "/data"]`. Their visible texts `toEqual` `["Open Settings", "See download", "Fix data"]`. Each has `data-variant="outline"`.
  - (c) No mutation, keyboard-completable (AC-25):
    - For each of the three actions in turn: `unmount()` the previous render and render afresh at `/home`, focus the action with `user.tab()` until `document.activeElement` is that link, and press `{Enter}`. `getByTestId("location")` reads that link's `href`.
    - Afterwards, `vi.mocked(fetch).mock.calls` holds no call whose second argument's `method` is `POST`, `PUT`, `PATCH` or `DELETE`, and in fact no call at all.
    - `within(card()).queryAllByRole("button")` is empty: the only control is a link.
  - (d) TC edge: each kind's catalogue copy and plurals are T011.
  - Kills:
    - swap-case on the copy branch for `download_not_complete` (the failed fixture shows the interrupted title, or the reverse);
    - a mutant listing `attention.items` in served order without `sortAttention` (order (a) reads data, download, setup);
    - drop-field-copy of `actionName` (names become the visible labels);
    - negate-boolean on the failed/interrupted choice ((a) second fixture).
- [ ] T003 Implement TC-COMP-142 (An item leaves when its cause is gone; count announced without moving focus) in `needs-you-card.test.tsx` (after T002), with a `// Implements TC-COMP-142` comment.
  - Render with `ok(ATTENTION)` and `served(SUMMARY())`.
  - Let `status = within(card()).getByRole("status")`. It is an `OUTPUT` element. Its text is `"Needs you · 3"`. It has no `aria-live="assertive"`. `within(card()).queryByRole("alert")` is null.
  - Focus the link named `"See the download that failed"` with `link.focus()`, and let `focused = document.activeElement`.
  - Re-render with `ok({ ...ATTENTION, problems: { stock_count: 0, symbols: [], newest_completed_at: null }, items: ATTENTION.items.filter((i) => i.kind !== "data_problems") })`:
    - `rows()` has length 2, and `"KO, TSLA and FBXX are missing data"` is absent;
    - `within(card()).getByRole("status")` is the same node as `status` (`toBe`), so the region was not remounted and the change is announced, and its text is `"Needs you · 2"`;
    - `document.activeElement` `toBe(focused)`, and `focused` is still connected;
    - the `h2` text is `"Needs you · 2"`.
  - Re-render with the same read again: still two rows. An item never leaves because it was viewed or re-rendered.
  - TC edge (DAC-E5-9): re-render with `ok({ ...FIRST(30), latest_download: { ...FIRST(30).latest_download, state: "succeeded" }, latest_terminal_download: { run_id: "run-1", state: "succeeded", ended_at: "2026-10-15T22:40:00Z", failure_reason: null } })` and `served(SUMMARY())`:
    - `rows()` is empty and no `ul` renders;
    - the card's collapsed text contains `"Nothing needs you right now."` and `"checked 17:52:10 CDT"`;
    - the status reads `"Needs you · 0"`, and the `h2` reads `"Needs you · 0"` (Resolved Conflict 7);
    - no element contains `"No "` followed by `"match"` (nothing-found does not apply).
  - Kills:
    - a mutant rendering the count only inside the `h2` with no live region (`getByRole("status")` fails);
    - a mutant keying the `output` on the count (`key={n}`, so `toBe(status)` fails on remount);
    - a mutant calling `.focus()` on the first row after a change (`activeElement` moves);
    - negate-boolean on the empty-list branch.
- [ ] T004 Implement TC-COMP-146 (Item tag badges carry the tier and shape; severity tile hidden) in `needs-you-card.test.tsx` (after T003), with a `// Implements TC-COMP-146` comment.
  - `it.each` over the rows of these renders, each with a literal expectation `[title, variant, tag, shapeChild]`:
    - `ok(ATTENTION)`, `served(SUMMARY())`:
      - `["The market data key is missing", "status-critical", "Setup", "rect"]`
      - `["The last download failed", "status-critical", "Download", "rect"]`
      - `["KO, TSLA and FBXX are missing data", "status-warning", "Data", "path"]`
    - `ok(INTERRUPTED)`: `["The last download was interrupted", "status-serious", "Download", "path"]`
    - `ok(FIRST(30))`, `NOT_SERVED`: `["Your first download is running", "status-active", "Download", "circle"]`
    - `ok(SCORED)`, `served(NEVER_BUILDING)`: `["Your first scores are being produced", "status-active", "Scores", "circle"]`
    - `ok(SCORED)`, `served(FAILED)`: `["The latest score update failed", "status-critical", "Scores", "rect"]`
  - For each row:
    - Exactly one element matches `[data-variant^="status-"]`. It has that `data-variant`, and its trimmed text is exactly the tag. The tier is carried in words.
    - It contains exactly one `svg`, with `aria-hidden="true"`, whose first child's `tagName` is the literal shape child.
    - The row's `[data-slot="severity-tile"]` has `aria-hidden="true"`, and `style.width` and `style.height` both equal `"28px"`. The value comes from `LAYOUT.markerSize`, and the test file is not scanned.
    - The row has no element with `data-variant="coverage-unknown"`.
  - "Not by colour alone": the three distinct tiers above carry three distinct shape children (`rect`, `path`, `circle`), and every tag is a non-empty word.
  - Kills:
    - drop-field-copy of `markerSize={LAYOUT.markerSize}` (no inline size);
    - swap-case `LAYOUT.markerSize` → `LAYOUT.railIconSize` (`"16px"`);
    - a mutant passing a constant tier to the row (variants all equal).

  The shape and tag rendering itself is CAP-003-E1-S8's `NeedsYouItemRow`. This case proves the card hands it each derived item unchanged.
- [ ] T005 Implement TC-COMP-127 (Home empty state before any download) in a new `web/src/screens/home/home.test.tsx`, with a `// Implements TC-COMP-127` comment, rendering `<HomeScreen />` (the default export of `./index`) with the shared harness, `ok(NEVER_DOWNLOADED)` and `NOT_SERVED`.
  - `getByRole("heading", { level: 1 })` reads `"Thursday, 2026-10-15"`. The header is kept.
  - `getByRole("region", { name: "No data has been downloaded yet." })` is a `section`. It contains:
    - the `h2` with that text;
    - an element with `data-variant="default"`, the card;
    - the text `"Set up FactorFlow to name the stocks to follow and start the first download."`;
    - exactly one link, named `"Start setup"`, with `href` `"/setup"` and `data-variant="default"`.
  - No tile and no list:
    - `queryByRole("region", { name: "Data" })`, `queryByRole("region", { name: /^Needs you/ })` and `queryByTestId("home-summary-row")` are null;
    - no `listitem` and no link whose name starts with `"Data:"`.
  - Pressing `{Enter}` on the focused **Start setup** link makes `getByTestId("location")` read `"/setup"` (AC-25).
  - Edge: with `ok(FIRST(30))`, which has a download requested but none ended, the empty card is absent and the summary row renders. The condition is `latest_download`, not `latest_terminal_download`.
  - Kills:
    - negate-boolean on `latest_download === null`;
    - swap-case `latest_download` → `latest_terminal_download` (the edge case shows the empty card);
    - swap-case `variant="default"` → `"outline"` on **Start setup**.
- [ ] T006 Implement TC-COMP-130 (No strategy, paper or live element on Home) in `home.test.tsx` (after T005), with a `// Implements TC-COMP-130` comment.
  - Define `const UNSHIPPED = /\b(?:strateg(?:y|ies)|paper|live|rebalance)\b/i`.
  - `it.each` over three renders: `ok(ATTENTION)` with `served(SUMMARY())`, `ok(FIRST(30))` with `NOT_SERVED`, and `ok(NEVER_DOWNLOADED)` with `NOT_SERVED`. From each, collect:
    - the container's `textContent`;
    - every `aria-label`, `title`, `alt`, `role` and `data-testid` attribute value.

    `UNSHIPPED` matches none of them.
  - Scanner control: `UNSHIPPED` matches `"Your strategies"`, `"+ New strategy"`, `"Paper"`, `"Live tile"` and `"next rebalance"`. It does not match `"delivered"` or `"olive"`.
  - Columns (populated render):
    - `getByTestId("home-summary-row")` has class `grid-cols-3`;
    - its `children.length` is exactly 1, and that child is the region named `"Data"`. Columns two and three hold no element, not even an empty placeholder;
    - `summaryRow.contains(card())` is false. The card is not in those columns (Resolved Conflict 1).
  - Header: `within(container.querySelector("header")).queryAllByRole("link")` and `queryAllByRole("button")` are both empty. No right-hand header action exists.
  - Kills:
    - a mutant placing `<NeedsYouCard />` inside the summary row (`children.length` becomes 2);
    - a mutant adding an empty `<div />` placeholder column;
    - a copy mutant `"Nothing needs you right now."` → `"No strategies need you right now."`, caught by `UNSHIPPED`.
- [ ] T007 Implement TC-COMP-131, the Home half (attention failure keeps the header and shows card errors; `404` keeps server items), in `home.test.tsx` (after T006), with a `// Implements TC-COMP-131 (Home half; CAP-003-E5-S2 asserts the tile half)` comment.
  - (a) `ATT_UNREACHABLE` with `served(SUMMARY())`:
    - The `h1` reads `"Thursday, 2026-10-15"`. `getByTestId("as-of-line")` contains `"checked 17:40:05 CDT"`: the header is kept and its time ages.
    - `card()` contains exactly `"Couldn't read what needs you: FactorFlow is not answering."`, and no `listitem`.
    - The card's header contains `"checked 17:40:05 CDT"`, not `"17:52:10"` or the current time `"20:00"`. *checked* ages (STD-UI-25).
    - The card's `h2` has the accessible name `"Needs you · not determinable"`. It contains an `aria-hidden="true"` element with text `"—"` and an `sr-only` element with text `"not determinable"` (home-ui §3).
    - The region named `"Data"` contains `"Couldn't read the data summary: FactorFlow is not answering."` (CAP-003-E5-S2).
    - `getAllByRole("button", { name: "Try again" })` has length 2. Clicking `within(card()).getByRole("button", { name: "Try again" })` calls `shell.value.refresh` exactly once, with `"attention"`.
  - (b) `ATT_500` with `served(SUMMARY())`:
    - the card reads `"Couldn't read what needs you: FactorFlow hit an unexpected problem."`;
    - neither `"req-9f3"` nor `"Internal error"` appears anywhere;
    - the card's checked part is `"checked"` followed by the `Absent` pair, because no read ever answered.
  - (c) Summary `500` (`ok(ATTENTION)` with `SUMMARY_500`): the card lists exactly the three server-item titles of T002 (a), and no `"Couldn't read what needs you"`. The tile shows its own summary error. This is DAC-E5-11's "a summary error other than `404` renders inside the tile".
  - (d) Summary `404`. Use `ok({ ...FIRST(30), credential_present: false, problems: ATTENTION.problems, items: [ATTENTION.items[0], ATTENTION.items[2]] })` with `NOT_SERVED`:
    - the card lists `["The market data key is missing", "KO, TSLA and FBXX are missing data", "Your first download is running"]`;
    - the last row's body reads `"12 of 30 stocks so far. Scores appear when it finishes."` (DEC-0216; AC-7).
  - Kills:
    - a mutant rendering the error with `error.message` (b shows `Internal error`);
    - swap-case `refresh("attention")` → `refresh("scores")`;
    - a mutant reading `attention.checkedAt` (client time) instead of `checked_at`;
    - a mutant hiding server items while the summary fails ((c) empty).
- [ ] T008 Implement TC-COMP-143 (Home's regions render the eight states or record non-applicability) in `home.test.tsx` (after T007), with a `// Implements TC-COMP-143` comment. One `describe` with one `it` per state, rendering `HomeScreen`:
  - **loading**: `ATT_LOADING` with `SCORES_LOADING`:
    - the `h1` renders and `getByTestId("home-as-of-skeleton")` exists (CAP-003-E5-S1);
    - `getByTestId("data-tile-skeleton")` exists (CAP-003-E5-S2);
    - `getByTestId("needs-you-skeleton")` has exactly three element children, and `closest('[aria-busy="true"]')` is not null;
    - the card's `h2` reads exactly `"Needs you"`;
    - no `"Couldn't read"` appears.
  - **empty, never populated**: `ok(NEVER_DOWNLOADED)` renders the empty card, as in T005.
  - **populated**:
    - `ok(ATTENTION)` with `served(SUMMARY())` shows three rows;
    - the zero-item read of T003's edge case shows *Nothing needs you right now.*;
    - in both, no `aria-busy` element is inside `card()`.
  - **stale**: `ATT_UNREACHABLE` shows the aging `"checked 17:40:05 CDT"` in the card and the header, as in T007 (a).
  - **unavailable**: `ok(ATTENTION)` with `NOT_SERVED` keeps the three server rows. The region named `"Data"` holds the `Absent` pair with `"not determinable"` (CAP-003-E5-S2's figures).
  - **error**: T007 (a), referenced, not repeated.
  - **records**: `import { NEEDS_YOU_STATES } from "./needs-you-card"`.
    - `Object.entries(NEEDS_YOU_STATES).filter(([, v]) => typeof v !== "function").map(([k]) => k).sort()` `toEqual` `["empty-never-populated", "empty-no-match", "partial", "unavailable", "unreachable"]`.
    - Each of those values is an object whose `notApplicable` is a string longer than 20 characters.
    - The renderers for `loading`, `populated` and `error` are functions.

    `npx tsc --noEmit` enforces that the map is a complete `StateRenderers` (CAP-003-E1-S9).
  - **unreachable**: also recorded, not rendered. `attention` never takes that kind, and the shell replaces the main region (AC-23).
  - Kills:
    - swap-case of one entry from renderer to `{ notApplicable }` or back (the key list changes);
    - a mutant mapping the zero-item read to `empty-no-match` (the populated case renders nothing);
    - remove-attribute of the skeleton's third row.
- [ ] T009 Implement TC-COMP-145 (Needs you card, rows and Home use the display vocabulary) in `home.test.tsx` (after T008), with a `// Implements TC-COMP-145` comment.
  - Define `const TERMS = /\b(?:instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i`, the eight DAC-E7-3 terms, as CAP-003-E5-S1's T006 does.
  - Render `HomeScreen` in each of these states. From each, collect the container's `textContent` and every `aria-label`, `title` and `alt` value, so the action names are covered. Assert that `TERMS` matches none of them. The states:
    - every state of T005–T008;
    - `ok(INTERRUPTED)`;
    - `ok(FIRST(null))` with `NOT_SERVED`;
    - `ok(SCORED)` with `served(NEVER_BUILDING)`;
    - `ok(SCORED)` with `served(FAILED)` and `served(NEVER_FAILED)`;
    - `ok({ ...ATTENTION, latest_terminal_download: { ...ATTENTION.latest_terminal_download, failure_reason: null } })`;
    - one-symbol and 1,239-stock `data_problems` reads (T011 (a)).
  - Scanner control, as CAP-003-E5-S1's T006 does: `TERMS` matches `"Next run"`, `"RUNS"`, `"Provider Credential"`, `"instrument"` and `"Retired"`. It does not match `"running"`, `"Downloads"` or `"rerun"`.
  - "Every label is from `labelOf` or `copy.ts`" is asserted because every expected label in T002–T008 and T011–T012 is a literal that `labelOf`'s table (CAP-003-E1-S5) or `copy.ts` (CAP-003-E5-S1; T013 here) pins.
  - Kills: a copy mutant `"See the download your first scores come from"` → `"See the run your first scores come from"`, caught by `TERMS` in the `NEVER_BUILDING` state.
- [ ] T010 [P] Implement TC-COMP-144 (Literal scan widened to `web/src/screens/home/`) as a new `describe("home screen is scanned (TC-COMP-144, DAC-E5-S3-4)")` block appended to `web/src/components/token-literals.test.ts`, with a `// Implements TC-COMP-144` comment. This is CAP-003-E1-S1's file, which screen stories widen by design; CAP-003-E4-S2's T007 is the sibling precedent. Use the file's own `SCANNED_DIRECTORIES`, `isScannedSource`, `literalsIn` and recursive walker. Do not edit any existing case.
  - (a) `SCANNED_DIRECTORIES` contains `"web/src/screens/home/"`.
  - (b) Walking `web/src/screens/home/` recursively finds each of `index.tsx`, `needs-you-card.tsx`, `header.tsx`, `market-state.ts`, `copy.ts` and `data-tile.tsx` as a scanned source, and no `*.test.ts(x)` file as one. `literalsIn` over each returns `[]`.
  - (c) TC step 3, planted: `literalsIn("web/src/screens/home/planted.tsx", 'export const x = "p-[12px]";')` returns exactly `["web/src/screens/home/planted.tsx: 12px"]`.

  RED until T018 appends the entry. Kills: drop of the appended entry, which (a) observes.

### Additional Unit Tests

- [ ] T011 Catalogue copy per kind in `needs-you-card.test.tsx` (after T004) (traces to DAC-E5-7, DAC-E5-8, AC-7, AC-12; DEC-0368 and -3).
  - Each case renders the card. It finds the row by its `p.font-semibold` title and asserts the row's collapsed body text and its link's name, visible text and `href` against literals.
  - (a) `data_problems` (`ATTENTION`'s other items removed):
    - `symbols: ["KO"]`, `stock_count: 1` → title `"KO is missing data"`, body `"Its scores show as Incomplete until the data is complete."`, name `"Fix data for KO"`;
    - `symbols: ["FBXX", "KO", "TSLA"]`, `stock_count: 4` → title `"FBXX, KO, TSLA and 1 more stock are missing data"`, name `"Fix data for FBXX, KO, TSLA and 1 more stock"`;
    - `stock_count: 1239` → title `"FBXX, KO, TSLA and 1,236 more stocks are missing data"`, body `"Their scores show as Incomplete until the data is complete."`, name `"Fix data for FBXX, KO, TSLA and 1,236 more stocks"`;
    - the three-symbol fixture's body is the *Their* form.

    The title rule is CAP-003-E5-S1's. The name rule beyond three is DEC-0368.
  - (b) `download_not_complete` (AC-12):
    - failed → body `"The market data service refused the request. Ended 2026-10-15 17:40 CDT."`;
    - `INTERRUPTED` → title `"The last download was interrupted"`, body `"FactorFlow restarted mid-download. Download again to pick up the rest. Ended 2026-10-15 17:40 CDT."`, name `"See the download that was interrupted"`, `href` `"/data/downloads/run-7"`;
    - failed with `failure_reason: null` → body `"No reason was recorded. Ended 2026-10-15 17:40 CDT."` (DEC-0369).
  - (c) `credential_missing`: body `"Set FACTORFLOW_MASSIVE_API_KEY and restart FactorFlow. Downloads fail until then."` The key's value never appears: no fixture holds one, and `credential_present` renders only as this item (home-ui §4).
  - (d) `first_download` (AC-7):
    - `ok(FIRST(30))` with `NOT_SERVED` → body `"12 of 30 stocks so far. Scores appear when it finishes."`, link text `"See download"`, name `"See your first download"`, `href` `"/data/downloads/run-1"`;
    - `ok(FIRST(null))` → body exactly `"Scores appear when it finishes."`, with no `" of "` (DEC-0213 f).
  - (e) `first_scores`: `ok(SCORED)` with `served(NEVER_BUILDING)` → body `"Scores appear when this finishes."`, name `"See the download your first scores come from"`, `href` `"/data/downloads/run-1"`.
  - (f) `score_failed`:
    - `ok(SCORED)` with `served(FAILED)` → body `"The scoring engine stopped. Scores still show the set from the download started 2026-10-15 16:02 CDT."`, link text `"See details"`, name `"See why the score update failed"`, `href` `"/data"`;
    - with `served(NEVER_FAILED)` → body exactly `"The scoring engine stopped."`;
    - with `FAILED`'s `later.failure_reason: null` → body `"No reason was recorded. Scores still show the set from the download started 2026-10-15 16:02 CDT."`
  - (g) Time zone. Inside `describe.each(["Asia/Tokyo", "America/Los_Angeles"])`, which sets and restores `process.env.TZ` as `web/src/screens/research/format.test.ts` lines 159-170 do, (b) and (f) read `"17:40 CDT"` and `"16:02 CDT"` again.
  - Kills:
    - drop-field-copy of `progress.total` (passing `progress.done` twice gives `"12 of 12"`);
    - negate-boolean on `set === null` for `score_failed`;
    - swap-case `run_started_at` → `started_at` (`"17:41"`);
    - a mutant reading `failure_reason` from `latest_download` (absent on that type: a type error);
    - negate-boolean on the null-reason guard (renders `"null."`).
- [ ] T012 Count, summary states, header, composition and no-read cases in `needs-you-card.test.tsx` (after T011) (traces to AC-16, AC-24, AC-25, AC-26, DAC-E5-9, DAC-E5-11, DAC-E5-S3-3; DEC-0367 and -4).
  - (a) Same derivation as the chip (AC-16), which CAP-003-E3-S6's `count-chip.tsx` reads as `deriveNeedsYou(attention, scores).length`. Use `ok({ ...SCORED, credential_present: true, problems: ATTENTION.problems, items: [ATTENTION.items[0]] })`, which has one server item, with `served(FAILED)`:
    - the `h2` and the status both read `"Needs you · 2"`;
    - `rows()` has length 2: the server item plus `score_failed`. A count of `attention.items.length` would read 1;
    - read `needs-you-card.tsx` as text with `readFileSync`, resolved from `import.meta.url` as the delivered `web/src/api/render.test.tsx` does. It contains `sortAttention(deriveNeedsYou(` exactly once and imports both names from `"../../components/patterns/needs-you"`.
  - (b) Summary loading: `ok(ATTENTION)` with `SCORES_LOADING` lists the three server rows. Score-derived items wait for the summary, as CAP-003-E1-S8 Resolved Conflict 3 decides.
  - (c) Loading heading: `ATT_LOADING` → the `h2` text is exactly `"Needs you"`, with no count and no `"checked"`; no status element renders (DEC-0367).
  - (d) Composition (AC-26; home-ui §10):
    - the card element has `data-variant="default"`;
    - the region's `aria-labelledby` resolves to the `h2`;
    - the sub-line `"Most important first. Nothing here is urgent unless marked."` renders;
    - the checked element has classes `text-xs` and `text-muted-foreground` and follows the `h2` inside one row with class `justify-between`;
    - the list is a `UL` whose children are all `LI`;
    - the `output` has class `sr-only`;
    - no element has a `style` attribute except the three severity tiles.
  - (e) No read of its own. The source text from (a) has no match for `/\bfetch\b/`, `/\bmethod\b/` or `/data-health/`. T016 forbids those words in the file, comments included.
  - Kills:
    - a mutant counting `attention.items.length` ((a));
    - a mutant rendering the count while loading as `0` ((c));
    - swap-case `variant="default"` → `"metric"` ((d)).
- [ ] T013 [P] Extend `web/src/screens/home/copy.test.ts` (CAP-003-E5-S1's file) with the strings and the rule this story adds. Each assertion compares against a literal (traces to DAC-E5-7, DAC-E5-8, DAC-E5-S3-5; DEC-0367, -2 and -3).
  - `ITEMS.download_not_complete.interruptedActionName` is `"See the download that was interrupted"`.
  - `ITEMS.first_download.actionName` is `"See your first download"`.
  - `ITEMS.first_scores.actionName` is `"See the download your first scores come from"`.
  - `ITEMS.score_failed.actionName` is `"See why the score update failed"`.
  - `NO_REASON` is `"No reason was recorded"`.
  - `NEEDS_YOU.headingPrefix` is `"Needs you ·"`.
  - `ITEMS.data_problems.actionName`:
    - `(["KO", "TSLA", "FBXX"])` is still `"Fix data for KO, TSLA and FBXX"`, and so is `(["KO", "TSLA", "FBXX"], 3)`;
    - `(["FBXX", "KO", "TSLA"], 4)` is `"Fix data for FBXX, KO, TSLA and 1 more stock"`;
    - `(["FBXX", "KO", "TSLA"], 1239)` is `"Fix data for FBXX, KO, TSLA and 1,236 more stocks"`.
  - `ITEMS.download_not_complete.failedBody(NO_REASON, "2026-10-15 17:40 CDT")` is `"No reason was recorded. Ended 2026-10-15 17:40 CDT."`.
  - If E5-S1's static-string assertion compares a whole group as one literal object, add the new members to that literal rather than writing a second assertion.
  - Kills:
    - off-by-one on `stockCount > symbols.length` (the three-symbol call gains `"and 0 more"`);
    - off-by-one on the singular guard (`"1 more stocks"`).
- [ ] T014 Home composition and layout cases in `home.test.tsx` (after T009) (traces to AC-10, AC-25, AC-26, DAC-E5-10).
  - Use `ok(ATTENTION)` with `served(SUMMARY())`.
  - `container.querySelector("main")` is null: `HomeScreen` renders inside the shell's `main` and adds none (Resolved Conflict 2). `getAllByRole("heading", { level: 1 })` has length 1.
  - `container.firstElementChild` has `style.maxWidth === "1180px"` and classes `w-full`, `flex`, `flex-col` and `gap-5`. Its children, in order, are the `header`, the summary row and the *Needs you* region.
  - The summary row has class `gap-5`.
  - With `ok(FIRST(30))` and `NOT_SERVED`, the summary row holds the region `"Data"`, which reads the first-download sentence. The card lists `"Your first download is running"`.
  - Every link and button in the container is reached by `user.tab()` in document order: the tile link, then each action link. No element has `tabindex="-1"` or a positive `tabindex`.
  - Kills:
    - drop of the `maxWidth` style;
    - swap-case `LAYOUT.contentMaxWidth` → `LAYOUT.sideColumnMax` (`"300px"`);
    - a mutant wrapping the screen in `<main>`.

**Checkpoint**: T002–T014 are written and fail:
- `needs-you-card.tsx` and `index.tsx` do not exist;
- the `copy.ts` additions do not exist;
- `SCANNED_DIRECTORIES` lacks the home directory.

Every delivered and upstream test still passes.

---

## Phase 3: Core Implementation

**Purpose**: Add the copy entries, build the card, then the screen.

- [ ] T015 [P] Extend `web/src/screens/home/copy.ts` (CAP-003-E5-S1's file). This makes T013 pass. Each addition gets a doc comment saying no design contains it and naming its decision, per that catalogue's rule (CAP-003-E5-S1 Open Gap 2). No unit or hex literal is added.
  - Plain strings, which CAP-003-E5-S1's T006 walk scans with no change to its `CALLS` map:
    - `ITEMS.download_not_complete.interruptedActionName: "See the download that was interrupted"`;
    - `ITEMS.first_download.actionName: "See your first download"`;
    - `ITEMS.first_scores.actionName: "See the download your first scores come from"`;
    - `ITEMS.score_failed.actionName: "See why the score update failed"`.

    All four are DEC-0368.
  - Top-level `NO_REASON = "No reason was recorded"`, DEC-0369.
  - `NEEDS_YOU.headingPrefix: "Needs you ·"`: the heading's words before an `Absent` count while the attention read fails (DEC-0367; home-ui §3).
  - `ITEMS.data_problems.actionName(symbols: readonly string[], stockCount: number = symbols.length)`. It is an additive, defaulted parameter, so CAP-003-E5-S1's existing calls are unchanged.
    - When `stockCount > symbols.length`, it returns `` `Fix data for ${symbols.join(", ")} and ${formatCount(k)} more ${k === 1 ? "stock" : "stocks"}` `` with `k = stockCount - symbols.length`. This is the same subject the title names (DEC-0368).
    - Otherwise it returns `` `Fix data for ${listOf(symbols)}` `` as before.
- [ ] T016 Create `web/src/screens/home/needs-you-card.tsx` (depends on T015; T002–T004, T011, T012 exist first). This makes T002–T004, T011 and T012 pass.
  - **Imports:**
    - `useId` and `type JSX`, `type ReactNode` from `react`;
    - `useShell` from `../../app/shell-context`;
    - `type { Attention, ScoreState }` from `../../app/shell-types`;
    - `LAYOUT` from `../../app/layout`;
    - `ApiError`, `ApiUnreachableError` from `../../api/client`;
    - `type ScreenState` from `../../api/types`;
    - `Card`, `CardContent`, `CardHeader`, `CardTitle` from `../../components/ui/card`;
    - `deriveNeedsYou`, `sortAttention`, `type NeedsYouItem` from `../../components/patterns/needs-you`;
    - `NeedsYouItemRow` from `../../components/patterns/needs-you-item`;
    - `StateRegion`, `type StateRenderers` from `../../components/patterns/state-region`;
    - `Absent` from `../../components/patterns/presence`;
    - `formatClock`, `formatInstant` from `../../components/patterns/format`;
    - `CHECKED`, `ITEMS`, `NEEDS_YOU`, `NO_REASON`, `NOT_DETERMINABLE`, `READ_FAILURE` from `./copy`.
  - **The view type.** A module-private `interface NeedsYouView { items: NeedsYouItem[]; attention: Attention; scores: ScoreState }`.
  - **`export const NEEDS_YOU_STATES: StateRenderers<NeedsYouView>`** (DEC-0367; DAC-E5-S3-3):
    - `loading` → `<ul data-testid="needs-you-skeleton" aria-hidden="true" className="flex flex-col gap-3">` holding three `<li className="min-h-7 w-full animate-pulse rounded bg-secondary" />`. Home-ui §10 Loading: "three skeleton item rows". The classes are CAP-003-E5-S1's skeleton classes.
    - `populated` → with `s.data.items.length === 0`, `<p>{NEEDS_YOU.nothingNeedsYou}</p>` (DAC-E5-9). Otherwise `<ul>` of `NeedsYouItemRow`s, one per item, `key={item.kind}`, each with:
      - `{...itemCopy(item, s.data.attention, s.data.scores)}`;
      - `item`;
      - `markerSize={LAYOUT.markerSize}`.
    - `error` → `(s) => <p>{NEEDS_YOU.readError(s.message)}</p>`. `StateRegion` puts it in its `status` element and adds **Try again** (DEC-0314; epic DAC-E5-11).
    - Recorded, not rendered, each as `{ notApplicable: "…" }`:
      - `empty-never-populated`: "HomeScreen shows the empty card in place of the summary row and this card while latest_download is null (DAC-E5-1)";
      - `empty-no-match`: "Nothing on Home is filtered (DAC-E5-S3-3)";
      - `partial`: "The attention read is whole or failed; a partial download is a data item rendered in populated (DAC-E5-S3-3; home-ui 10 Partial)";
      - `unavailable`: "No part of this card waits on an unavailable read: under a summary 404 the server items render in populated and the first-download item follows DEC-0216 (DAC-E5-11)";
      - `unreachable`: "The shell replaces the main region (AC-23)".

      The reasons are records, never displayed. They avoid unit and hex literals.
  - **`function itemCopy(item, attention, scores): { title: string; body: ReactNode; actionLabel: string; actionName: string }`** is module-private. It is a `switch (item.kind)` with a `const unhandled: never = item.kind` guard:
    - `data_problems`: from `attention.problems`:
      - `title(symbols, stock_count)`;
      - `body(stock_count)`;
      - `action`;
      - `actionName(symbols, stock_count)`.
    - `download_not_complete`: `const failed = item.tier === "critical"`, the tier CAP-003-E1-S8 derived from the recorded state (AC-12). `const endedAt = formatInstant(item.recordedAt)`: the item's `recorded_at` is the download's `ended_at` (data-health-reader 2.7). Then:
      - when failed: `failedTitle`, `failedBody(attention.latest_terminal_download?.failure_reason ?? NO_REASON, endedAt)` and `failedActionName`;
      - otherwise: `interruptedTitle`, `interruptedBody(endedAt)` and `interruptedActionName`;
      - `action` in both cases.
    - `credential_missing`: `title`, `body`, `action`, `actionName`.
    - `first_download`: `title`, `body(attention.latest_download?.progress.done ?? 0, attention.latest_download?.progress.total ?? null)`, `action`, `actionName`.
    - `first_scores`: `title`, `body`, `action`, `actionName`.
    - `score_failed`: with `const summary = scores.kind === "served" ? scores.data : null`:
      - `title`;
      - `body(summary?.later?.failure_reason ?? NO_REASON, summary?.set ? formatInstant(summary.set.run_started_at) : null)`;
      - `action`;
      - `actionName`.

    Every string comes from `copy.ts`. The target is always the derivation's (`NeedsYouItemRow` links to `item.target`).
  - **`function readFailureReason(error: ApiError | ApiUnreachableError): string`** is module-private. It returns `READ_FAILURE.unreachable` for `error instanceof ApiUnreachableError` and `READ_FAILURE.unexpected` otherwise, and never reads `message` or `requestId` for display. It mirrors CAP-003-E5-S2's private function (DEC-0366).
  - **`export function NeedsYouCard(): JSX.Element`** takes no props and reads `const { attention, scores, refresh } = useShell()`.
    - **Items.** `items` is `attention.kind === "ok" ? sortAttention(deriveNeedsYou(attention.data, scores)) : null`. It is written exactly once in this form (AC-16).
    - **Region state** (`ScreenState<NeedsYouView>`):
      - `loading` → `{ kind: "loading" }`;
      - `ok` → `{ kind: "populated", data: { items, attention: attention.data, scores }, fetchedAt: attention.data.checked_at }`;
      - `error` → `{ kind: "error", message: readFailureReason(attention.error), requestId: attention.error instanceof ApiError ? attention.error.requestId : "" }`.
    - **Heading** (the `CardTitle` `h2`, `id={titleId}` from `useId()`):
      - `ok`: `NEEDS_YOU.heading(items.length)`;
      - `error`: `<>{NEEDS_YOU.headingPrefix} <Absent label={NOT_DETERMINABLE} /></>` (home-ui §3);
      - `loading`: `NEEDS_YOU.title` (DEC-0367).
    - **Checked** (`<p className="text-xs text-muted-foreground">`):
      - `` `${CHECKED} ${formatClock(data.checked_at)}` `` with `data` from `ok`, or from `error`'s `last`, so it ages;
      - `<>{CHECKED} <Absent label={NOT_DETERMINABLE} /></>` when `error` has no `last`;
      - nothing while loading.

      It is never the client `checkedAt` (home-ui 2.3, 2.5; AC-25).
    - **Structure:**
      - `<section aria-labelledby={titleId}>` holds `<Card variant="default">`.
      - The card holds `<CardHeader>`, which contains:
        - `<div className="flex items-baseline justify-between gap-4">` with the heading and the checked line, right-aligned;
        - `<p className="text-sm text-muted-foreground">{NEEDS_YOU.subLine}</p>`.
      - Then `<CardContent>`, which contains:
        - while `items !== null`, `<output className="sr-only">{NEEDS_YOU.heading(items.length)}</output>` (DEC-0370). It is rendered unkeyed in a stable position, so React updates its text in place;
        - then `<StateRegion state={…} renderers={NEEDS_YOU_STATES} onRetry={() => refresh("attention")} />`.
      - Nothing calls `focus()`.
  - **Doc comment.** The module doc comment cites:
    - component design `home-ui` 2.5, §3 and §10;
    - UX design 1.3 Page Layout 3, States and Accessibility;
    - DEC-0203, DEC-0216;
    - AC-7, AC-9, AC-12, AC-16, AC-24, AC-25;
    - DAC-E5-7 to DAC-E5-9, DAC-E5-11;
    - DEC-0367 to -4.

    It says every action navigates and the card makes no read of its own.
  - **Forbidden words.** The words `fetch`, `method` and `data-health` appear nowhere in the file, comments included, so T012 (e) and the Validation Plan grep cannot contradict this task. No unit or hex literal, no `--gain` or `--loss`, and no inline `style` appear: the tile's size passes as a prop.
- [ ] T017 Create `web/src/screens/home/index.tsx` (depends on T016; T005–T009 and T014 exist first). This makes T005–T009 and T014 pass.
  - **Imports:**
    - `useId` and `type JSX` from `react`;
    - `Link` from `react-router-dom`;
    - `useShell` from `../../app/shell-context`;
    - `LAYOUT` from `../../app/layout`;
    - `Button` from `../../components/ui/button`;
    - `Card`, `CardContent`, `CardHeader`, `CardTitle` from `../../components/ui/card`;
    - `HomeHeader` from `./header`;
    - `DataTile` from `./data-tile`;
    - `NeedsYouCard` from `./needs-you-card`;
    - `EMPTY_STATE` from `./copy`.
  - **`export default function HomeScreen(): JSX.Element`.** A default export is the delivered screen convention (`web/src/screens/*/index.tsx`), and CAP-003-E3-S4's `lazy(() => import(…))` bindings need it. CAP-003-E5-S5 registers it (DEC-0367).
    - It reads `const { attention } = useShell()`.
    - `const neverDownloaded = attention.kind === "ok" && attention.data.latest_download === null` (DAC-E5-1; home-ui 2.2 boxes 2a and 3).
  - **Root.** `<div className="flex w-full flex-col gap-5" style={{ maxWidth: LAYOUT.contentMaxWidth }}>`. The style form follows CAP-003-E3-S4's `ShellSkeleton`. The root is not a `main`: the shell's `main` region holds the screen (Resolved Conflict 2).
  - **Children:**
    - `<HomeHeader />`;
    - when `neverDownloaded`, the private `EmptyState()`;
    - otherwise:
      - `<div data-testid="home-summary-row" className="grid grid-cols-3 gap-5"><DataTile /></div>`: the tile in column one, columns two and three empty (DAC-E5-10);
      - then `<NeedsYouCard />` below at full width (Resolved Conflict 1).
  - **`EmptyState()`** renders `<section aria-labelledby={id}>` holding a `<Card variant="default">`, which contains:
    - `<CardHeader><CardTitle id={id}>{EMPTY_STATE.title}</CardTitle></CardHeader>`;
    - `<CardContent className="flex flex-col items-start gap-4">`, holding:
      - `<p>{EMPTY_STATE.body}</p>`;
      - `<Button asChild variant="default"><Link to={SETUP}>{EMPTY_STATE.action}</Link></Button>`.

    `const SETUP = "/setup"`, commented with DAC-E5-1.
  - **Doc comment.** The module doc comment cites:
    - component design `home-ui` 2.1, 2.2, §3 and §10;
    - UX design 1.3;
    - AC-10, AC-21, AC-24, AC-26;
    - DAC-E5-1, DAC-E5-10;
    - Resolved Conflicts 1 and 2;
    - DEC-0367.
  - **Forbidden words.** No strategy, paper or live text and no `fetch` appear, comments included. No unit or hex literal and no `--gain` or `--loss` appear.

**Checkpoint**: T002–T009 and T011–T014 pass. T010 waits for T018.

---

## Phase 4: Integration

**Purpose**: Widen the shared literal scan and prove the screen sits inside the delivered and shared checks.

- [ ] T018 Append `"web/src/screens/home/"` to `SCANNED_DIRECTORIES` in `web/src/components/token-literals.test.ts`, after the entries already there, without reordering or removing any (DEC-0296's widening rule; T010 RED first). Change nothing else in the file. This makes T010 pass (traces to DAC-E5-S3-4, AC-26).
  - Then plant `export const x = "12px";` in a temporary `web/src/screens/home/planted.tsx`. Confirm `npx vitest run src/components/token-literals.test.ts` fails, naming that file, and delete the file. Record both runs in the cycle's evidence (TC step 3).
  - Then run `npm run test` and confirm the whole suite is green, including these, unchanged:
    - CAP-003-E5-S1's `header.test.tsx` (its T006 walk scans T015's strings, and the defaulted `actionName` needs no new `CALLS` entry);
    - CAP-003-E5-S2's `data-tile.test.tsx`;
    - CAP-003-E1-S8's `needs-you.test.ts` and `needs-you-item.test.tsx`;
    - CAP-003-E1-S9's `state-region.test.tsx`;
    - CAP-003-E3-S2's layout rule in `token-literals.test.ts`;
    - `web/src/api/render.test.tsx` (no `dangerouslySetInnerHTML`).
  - Confirm the change set: `git diff --exit-code -- web/src/app web/src/api web/src/components/ui web/src/components/patterns package.json tailwind.config.js design-system` exits 0. `git status --short web/` lists only:
    - `web/src/screens/home/needs-you-card.tsx`, `needs-you-card.test.tsx`, `index.tsx` and `home.test.tsx`, new;
    - `web/src/screens/home/copy.ts`, `copy.test.ts` and `web/src/components/token-literals.test.ts`, modified.

**Checkpoint**: The Vitest suite is green, and the home directory is scanned.

---

## Phase 5: Polish

**Purpose**: Validation commands and TDD evidence.

- [ ] T019 Run `npm run lint`, `npm run format`, `npx tsc --noEmit` and `npm run build` from the repo root (traces to AC-26).
  - Fix format findings with `npx biome format --write web/src/screens/home/needs-you-card.tsx web/src/screens/home/needs-you-card.test.tsx web/src/screens/home/index.tsx web/src/screens/home/home.test.tsx web/src/screens/home/copy.ts web/src/screens/home/copy.test.ts web/src/components/token-literals.test.ts`.
  - `tsc` checks:
    - that `NEEDS_YOU_STATES` is a complete `StateRenderers<NeedsYouView>`;
    - the `never` guard in `itemCopy`;
    - the fixtures against CAP-003-E3-S1's types.
  - Biome's `useSemanticElements` is why the live region is an `output`, not a `p` with `role="status"`, as the delivered `as-of-line.tsx` line 96 does.
  - Fix findings in this story's seven files only.
- [ ] T020 After each TDD cycle in T002–T019 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E5-S3-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`; no per-cycle commit is planned. T019 adds no behaviour and joins cycle 4's validation evidence (INV-TDD-002, TEST-TDD-008; traces to no AC). The cycles are:
  1. T013 + T015, the copy entries;
  2. T002–T004 + T011 + T012 + T016, the card;
  3. T005–T009 + T014 + T017, the screen;
  4. T010 + T018, the widened literal scan. This is a test-file change only: `mutation: {not_applicable: "test-only cycle: token-literals.test.ts gains a scanned directory"}`.

**Checkpoint**: All acceptance criteria are satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E5-S1 | hard | `HomeHeader` from `header.tsx`; `NEEDS_YOU`, `EMPTY_STATE`, `ITEMS`, `CHECKED` and `NOT_DETERMINABLE` from `copy.ts`, which T015 extends. Existing graph edge |
| CAP-003-E5-S2 | hard | `DataTile` from `data-tile.tsx`; `READ_FAILURE` from `copy.ts`. Existing graph edge |
| CAP-003-E1-S8 | hard | `deriveNeedsYou`, `sortAttention` and `NeedsYouItem` from `needs-you.ts`; `NeedsYouItemRow` from `needs-you-item.tsx`. Existing graph edge |
| CAP-003-E1-S9 | hard | `StateRegion` and `StateRenderers` from `state-region.tsx`. Existing graph edge |
| CAP-003-E1-S1 | hard | `Card`, `CardHeader`, `CardTitle`, `CardContent` and `Button`; `token-literals.test.ts`, which T010 and T018 widen. Existing graph edge |
| CAP-003-E3-S2 | hard | `LAYOUT.contentMaxWidth` and `LAYOUT.markerSize` from `web/src/app/layout.ts`. Existing graph edge |
| CAP-003-E3-S3 | hard | Both modules import `useShell` from `web/src/app/shell-context.tsx`, and both tests import `ShellContextValue`. **New graph edge.** CAP-003-E5-S1 already orders it transitively |
| CAP-003-E3-S1 | hard | `needs-you-card.tsx` imports `Attention` and `ScoreState` from `web/src/app/shell-types.ts`, and both tests type their fixtures with them and `ScoreSummary`. **New graph edge**, as in the CAP-003-E5-S1 and CAP-003-E5-S2 plans |
| CAP-003-E1-S6 | hard | `needs-you-card.tsx` imports `Absent`, `formatClock` and `formatInstant`. **New graph edge.** CAP-003-E5-S1 already orders it transitively |
| CAP-003-E1-S5 | context | `labelOf` and `StatusBadge` render each tag inside CAP-003-E1-S8's `NeedsYouItemRow`. T004 asserts the result in the DOM. Nothing is imported |
| CAP-003-E3-S6 | context | The rail's Home chip reads the same `deriveNeedsYou(attention, scores).length` (AC-16; DAC-E3-7). T012 (a) pins Home's side |
| CAP-003-E3-S4 | context | Its `lazy(() => import(…))` route bindings are why `HomeScreen` is a default export. Nothing is imported |
| CAP-003-E5-S5 | reverse | Registers `/home` with this story's default-exported `HomeScreen` (graph: E5-S5 → E5-S3) |
| CAP-003-E5-S4 | reverse | Its journey spec drives the rendered Home and its items (graph: E5-S4 → E5-S5 → E5-S3) |
| CAP-003-E4-S2 | context | Its T007 widening of `SCANNED_DIRECTORIES` is the precedent T010 and T018 follow. Nothing is imported |

New hard edges added to `dependencies.yaml`: `CAP-003-E5-S3 → CAP-003-E3-S3`, `CAP-003-E5-S3 → CAP-003-E3-S1` and `CAP-003-E5-S3 → CAP-003-E1-S6`.

### Task Dependencies

- T001: No dependencies.
- `needs-you-card.test.tsx` chain: T002 → T003 → T004 → T011 → T012. Same file, sequential, after T001.
- `home.test.tsx` chain: T005 → T006 → T007 → T008 → T009 → T014. Same file, sequential, after T001.
- T010: after T001. Different file, parallel with both chains.
- T013: after T001. Different file, parallel.
- T015: depends on T013 (makes it pass).
- T016: depends on T015, T002–T004, T011 and T012.
- T017: depends on T016, T005–T009 and T014.
- T018: depends on T010 and T017. The walk in T010 (b) needs `index.tsx` and `needs-you-card.tsx`.
- T019: depends on T018.
- T020: interleaved. It runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities

- Phase 2: the four files are independent of each other: `needs-you-card.test.tsx`, `home.test.tsx`, `token-literals.test.ts` (T010) and `copy.test.ts` (T013).
- Phase 3: T015 can run alongside the start of the test chains. T016 and T017 are sequential, because `index.tsx` mounts the card.

---

## Validation Plan

### Constitution-Defined Commands

These are the `docs/constitution/tech-stack.md` v7 Validation Commands. The working directory is `.`.

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit`

`npm run test:e2e` is not run: no end-to-end case is owned by this story. CAP-003-E5-S4 owns the Home journey.

### Story-Specific Validation

- **DAC-E5-S3-1, DAC-E5-7, DAC-E5-8, AC-9, AC-12:** T002 and T011 pass.
- **DAC-E5-S3-2, DAC-E5-9, AC-25:** T003 passes. `grep -n "focus(" web/src/screens/home/needs-you-card.tsx web/src/screens/home/index.tsx` prints nothing.
- **DAC-E5-S3-3, AC-24:** T008 passes, and `npx tsc --noEmit` passes with `NEEDS_YOU_STATES` typed `StateRenderers<NeedsYouView>`.
- **DAC-E5-S3-4, AC-26:**
  - T010 passes, and the planted-literal run of T018 fails as described.
  - `grep -nE "[0-9]+(px|rem|em|vh|vw)\b|#[0-9a-fA-F]{3,8}\b|(rgb|hsl)a?\(" web/src/screens/home/index.tsx web/src/screens/home/needs-you-card.tsx web/src/screens/home/copy.ts` prints nothing.
  - `grep -nE -- "--gain|--loss" web/src/screens/home/index.tsx web/src/screens/home/needs-you-card.tsx` prints nothing.
- **DAC-E5-S3-5:** T009 and T013 pass.
- **DAC-E5-S3-6, AC-20:** T004 passes.
- **DAC-E5-1, AC-21:** T005 passes.
- **DAC-E5-10, AC-10:** T006 and T014 pass. `grep -niE "\b(strateg(y|ies)|paper|live)\b" web/src/screens/home/index.tsx web/src/screens/home/needs-you-card.tsx` prints nothing, and `grep -n "<main" web/src/screens/home/index.tsx` prints nothing.
- **DAC-E5-11:** T007 and T012 (b) pass.
- **AC-16:** T012 (a) passes. `grep -c "sortAttention(deriveNeedsYou(" web/src/screens/home/needs-you-card.tsx` prints `1`.
- **No action mutates; no read of its own:**
  - T002 (c) passes;
  - `grep -nE "\bfetch\b|\bmethod\b|data-health" web/src/screens/home/needs-you-card.tsx web/src/screens/home/index.tsx` prints nothing. T016 and T017 forbid those words in both files, comments included.
- **Mutation:** run `python3 scripts/mutation-run.py run --command "npx vitest run web/src/screens/home && npx tsc --noEmit"`, adding the hand-written mutants in Other Notes.
- **No producer or delivered file changed:** T018's `git diff --exit-code` exits 0.

---

## Notes

### Resolved Conflicts

1. **Where *Needs you* sits: the summary row's empty columns or beside the tile.**
   - **The conflict.**
     - Component design `home-ui` §10 Layout and UX design 1.3 Page Layout 3 place the *Needs you* card "beside the tile, spanning the remaining two columns of the summary row and the full width below it". The story Description says "*Needs you* beside it".
     - Epic DAC-E5-10, restated in the story's ACs, says "the summary row's second and third columns MUST be empty". TC-COMP-130 asserts "the second and third columns are empty".
     - A card in those columns makes them not empty. The design's shape, beside in two columns and full width below, also cannot be one CSS box.
   - **Governing: epic DAC-E5-10.** Epic acceptance criteria rank above design prose and story description.
   - **Outcome (T006, T017).**
     - The summary row is a three-column grid holding only the tile.
     - The card renders after it, at full width. This is the "full width below it" half of the design.
     - "Beside" is not honoured.
   - **Follow-up.** `home-ui` §10 and UX design 1.3 should restate the layout consistently with DAC-E5-10 at their next revision. If the owner wants the card in columns two and three, DAC-E5-10's "empty" needs rewording to "no tile or placeholder".
2. **`HomeScreen`: "`main` with the date `h1`".**
   - **What the sources say.**
     - The story Description, `home-ui` §10 and UX design 1.3 write "`main` with the date `h1`".
     - Owner-shell §10 and UX design 0.6 say every screen has "one `main` with one `h1`".
     - The delivered shell already renders the `main` region (`web/src/app/shell.tsx` line 68). No delivered screen renders its own `main`.
     - A second, nested `main` would break the one-`main` rule.
   - **Governing: owner-shell §10 and UX design 0.6** (normative accessibility prose). The Description's phrase reads as "the main region holds the date `h1`".
   - **Outcome.** `HomeScreen`'s root is a `div` inside the shell's `main`, holding the only `h1` (T014, T017).
3. **Nothing-found and partial.**
   - **What the sources say.** `home-ui` §10 and UX design 1.3 States map "Empty, nothing found" to *Nothing needs you right now.* and "Partial" to the tile's warning tier. Story DAC-E5-S3-3 says "nothing-found does not apply (nothing is filtered), partial does not apply".
   - **Governing: story DAC-E5-S3-3**, for how `StateRegion`'s kinds are classified, over design prose.
   - **Outcome.**
     - *Nothing needs you right now.* still renders, per epic DAC-E5-9. It is the `populated` renderer's empty-list branch, not `empty-no-match`.
     - The partial download is a data item in `populated` (T008, T016). TC-COMP-143 agrees.
4. **"A value no artifact can determine goes through `NotDeterminable`" (DAC-E5-S3-6, TC-COMP-146).** This is the shared template clause.
   - **What the higher artifacts say.** The card's only undetermined figure is the count and the *checked* time while the read fails. `home-ui` §3, §10 Accessibility and the epic's Accessibility NFR render those as "the em dash carr[ying] hidden *not determinable*". That is `Absent`'s rendering, not a `coverage-unknown` badge.
   - **Governing: `home-ui` §3, §10 and the epic NFR**, as CAP-003-E5-S2's Resolved Conflict 1 and coverage-matrix note 7 read the same template.
   - **Outcome.**
     - The error heading and the never-answered *checked* use `Absent` (T007).
     - No `coverage-unknown` badge renders in the card (T004).
5. **The error's words versus `StateRegion`'s "three parts".** Epic DAC-E5-11 gives *Couldn't read what needs you: {reason}.* `StateRegion` takes the whole sentence from the caller's `error` renderer (DEC-0314). **Governing: epic DAC-E5-11** for the words. The `{reason}` is CAP-003-E5-S2's `READ_FAILURE` (DEC-0366), which that plan names for this card.
6. **Copy rules the epic settles over UX design 1.3.**
   - **`score_failed` without a set.** UX design 1.3 gives only the two-sentence body. Epic DAC-E5-7 drops the second sentence when no set exists. **Governing: epic DAC-E5-7.**
   - **The first-download item under a `404` summary.** UX design 1.3 conditions it on `never_classified` alone. **Governing: epic DAC-E5-11** ("follows DEC-0216"), which CAP-003-E1-S8 implements.
   - Both are applied as written (T011 (f), T007 (d)).
7. ***Needs you · 0*.** The resolution register left open whether the heading shows a zero count. `home-ui` 2.5 and UX design 1.3 give the heading as *Needs you · {n}* with no exception for zero. The rail chip's absence at zero is a rule for the chip (owner-shell), not for the heading. **Governing: `home-ui` 2.5's unconditional template.** With no item, the heading reads *Needs you · 0* and the body reads *Nothing needs you right now.* (T003). This is not an adopted value.
8. ***"All new; no delivered file is edited"* (`home-ui` 2.1)** versus the story's Implementation list, which widens `web/src/components/token-literals.test.ts`. **Governing: the story (DEC-0227 answer A).** `copy.ts` and `copy.test.ts` are CAP-003-E5-S1's files, not delivered ones, and are extended as its Open Gap 2 anticipates.

### Open Gaps

1. **The card's and the screen's module interface, and how Home's states map to `StateRegion`. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0367.**
   - **What is undetermined.** `home-ui` 2.1 places the card in `needs-you-card.tsx` and `HomeScreen` in `index.tsx`. Story DAC-E5-S3-3 requires each state to render through `StateRegion` or record why it does not apply. No artifact names:
     - the card's export or props;
     - `HomeScreen`'s export form;
     - which region carries which `ScreenState` kind;
     - where the never-populated state is decided;
     - the card heading while the read loads or fails.
   - **What the plan adopts (T013, T015–T017).**
     - `export function NeedsYouCard()`, with no props, reading `useShell()`.
     - `export default function HomeScreen()`.
     - The card's body renders through `StateRegion` with `export const NEEDS_YOU_STATES`, holding renderers for `loading`, `populated` (the list or *Nothing needs you right now.*) and `error`. The other five kinds carry recorded `notApplicable` reasons.
     - `HomeScreen` decides the never-populated state itself (`latest_download === null`) and renders the empty card in place of the summary row and the card.
     - The heading reads *Needs you* while loading. While the read fails, it reads *Needs you ·* followed by an `Absent` count (`NEEDS_YOU.headingPrefix`).
   - **Derivation.**
     - The story's "`HomeScreen`" and "reads `useShell()`" leave nothing for a prop to carry. `HomeHeader()` and `DataTile()` are the sibling precedent (DEC-0362, DEC-0363).
     - Every delivered screen default-exports its component, and CAP-003-E3-S4's `lazy` bindings import defaults.
     - Epic DAC-E5-11 makes errors per card, each with its own **Try again**. `StateRegion` renders one **Try again** per region, so Home's error cannot be one screen-level region. The card is the region. The tile renders its own states (CAP-003-E5-S2).
     - The empty card replaces both the tile and the card (DAC-E5-1), so it is the screen's never-populated rendering, and the card records that.
     - The loading heading shows no figure, because no read has answered, and `home-ui` §3 forbids `0`. The failed heading follows §3's rule for "any figure whose read fails".
   - **Alternatives rejected.**
     - One screen-level `StateRegion`: it gives one error and one **Try again** for both cards, against DAC-E5-11.
     - Rendering the empty card inside the *Needs you* region: DAC-E5-1 says "no tile or list" and gives the empty card its own `h2`.
     - A named `HomeScreen` export: it breaks the `lazy` convention.
   - **Klass.** Propagating. CAP-003-E5-S5 imports the default `HomeScreen`, and CAP-003-E5-S4 drives these regions.
   - **Owning design.** `home-ui` 2.1 and §10 States, at its next revision.
2. **Action accessible names beyond the three examples. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0368.**
   - **What is undetermined.** `home-ui` 2.5, epic DAC-E5-8 and story DAC-E5-S3-1 require each action's accessible name to name its item. They give three examples:
     - *Fix data for KO, TSLA and FBXX*;
     - *See the download that failed*;
     - *Open Settings to set the market data key*.

     No artifact gives the name for:
     - the interrupted download;
     - `first_download`;
     - `first_scores`;
     - `score_failed`;
     - a `data_problems` item covering more stocks than the three symbols it names.
   - **What the plan adopts (T011, T013, T015).**
     - *See the download that was interrupted*.
     - *See your first download*.
     - *See the download your first scores come from*.
     - *See why the score update failed*.
     - Beyond three stocks, *Fix data for {A}, {B}, {C} and {k} more stock(s)*, with the noun following the count as epic DAC-E5-7 requires.
   - **Derivation.**
     - Each name is the action's visible label (**See download**, **See details**, **Fix data**) completed by the item's own title, in the pattern the examples set. *See the download that failed* is **See download** plus *The last download failed*.
     - Beyond three stocks, the name repeats the title's subject (CAP-003-E5-S1's title rule), so the name covers every stock the item covers.
     - None uses a DAC-E7-3 term (T009).
   - **Alternatives rejected.**
     - The visible label alone: several items would share *See download*, which DAC-E5-8 forbids.
     - Naming only the three symbols when more stocks are affected: the name would understate the item.
   - **Klass.** Propagating. CAP-003-E5-S4's journey may locate the first-download item's action by name.
   - **Owning design.** `home-ui` 2.5 (and UX design 1.3 Accessibility), at its next revision.
3. **The body when a recorded failure reason is null. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0369.**
   - **What is undetermined.** The failed-download body is *{failure_reason}. Ended {ended_at}.*, and the `score_failed` body begins *{reason}.* (`home-ui` 2.5). `latest_terminal_download.failure_reason` and `later.failure_reason` are both `string | null` (data-health-reader 2.2; CAP-003-E3-S1). No artifact says what the sentence reads when the reason is null.
   - **What the plan adopts (T011, T015, T016).** The reason is replaced by *No reason was recorded* (`NO_REASON`), giving *No reason was recorded. Ended 2026-10-15 17:40 CDT.*
   - **Derivation.**
     - STD-UI-4 and `ui-components` 2.5 forbid a blank or invented value.
     - Capability §5.3's rule, which `home-ui` 2.5 applies to the score body, is that copy never asserts what is not recorded.
     - An em dash mid-sentence would read as punctuation, so the absence is stated in words.
   - **Alternatives rejected.**
     - Dropping the reason sentence: the body would no longer say why the item is there.
     - Rendering the literal `null`.
   - **Klass.** Contained.
   - **Owning design.** `home-ui` 2.5, at its next revision.
4. **The polite announcement of a changed count. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0370.**
   - **What is undetermined.** Epic DAC-E5-9, story DAC-E5-S3-2 and `home-ui` §10 require "a changed count announced politely through the card's live region", with focus never moving. No artifact gives the region's element or its words.
   - **What the plan adopts (T003, T016).**
     - One visually hidden `<output>` in the card, whose implicit `status` role is polite.
     - It holds the heading's words *Needs you · {n}*.
     - It is rendered only while the read has answered, so the error sentence is the card's one status while the read fails.
     - It is never remounted when the count changes.
   - **Derivation.**
     - The delivered polite regions use `output` (`web/src/components/patterns/as-of-line.tsx` line 96; `web/src/app/status-region.tsx` line 253), and Biome's `useSemanticElements` requires it.
     - Reusing the heading's words keeps one wording for the count (`home-ui` 2.5).
     - Not remounting it is what makes a text change an announcement.
   - **Alternatives rejected.**
     - Making the `h2` itself live: headings should not announce, and the sub-line would re-read.
     - The rail chip's *{n} items need you*: that is the chip's name (owner-shell), and it would be a second wording on Home.
   - **Klass.** Contained.
   - **Owning design.** `home-ui` §10 Accessibility, at its next revision.

### Other Notes

- **Symbol order.**
  - Data-health-reader 2.2 serves `problems.symbols` as "the first three by symbol". A real read therefore lists *FBXX, KO, TSLA*.
  - DAC-E5-S3-1's example *Fix data for KO, TSLA and FBXX* names the same three in another order.
  - The card renders the symbols in the order the read gives and never re-sorts them, so the AC's literal comes from a fixture in that order (T002), as CAP-003-E5-S1's T008 does. The T011 fixtures use the reader's order.
  - These are not two determinations of one fact: the AC fixes a name for its fixture, and the reader fixes the order.
- **"Ended {ended_at}".** The plan uses the item's `recordedAt`, which data-health-reader 2.7 defines as the terminal download's `ended_at`, so it holds even when `latest_terminal_download` is absent (CAP-003-E1-S8 DEC-0320). A mutant swapping it for `latest_terminal_download.ended_at` is equivalent on consistent reads. Record it as equivalent with this reason.
- **Failed versus interrupted** is read from the item's tier, which CAP-003-E1-S8 derives with `tierOf` from the recorded state. One derivation decides both the badge and the copy, so they cannot disagree (AC-12).
- **The credential body** is plain text. `home-ui` 2.5's backticks mark an identifier in the design document, and no criterion requires a `code` element. The variable's name renders, never a key value (`home-ui` §4).
- **Two `readFailureReason`s.** CAP-003-E5-S2's is module-private in `data-tile.tsx`. The card writes the same three lines rather than editing a sibling's file. T007 pins both cards' sentences against literals, so the two cannot drift silently.
- **Files beyond the story's list.**
  - The story names `needs-you-card.tsx`, `needs-you-card.test.tsx`, `index.tsx`, `home.test.tsx` and `token-literals.test.ts`.
  - This plan also extends CAP-003-E5-S1's `copy.ts` and `copy.test.ts` (T013, T015).
  - The `copy.ts` additions are plain strings plus one defaulted parameter, so CAP-003-E5-S1's `CALLS` map in `header.test.tsx` needs no new entry.
- **Fake timers.** `HomeHeader` keeps a minute interval (CAP-003-E5-S1). `shouldAdvanceTime` and `userEvent`'s `advanceTimers` keep the user events moving under the fixed clock.
- **Hand-written mutants.** Add these to the mutation run beside the generated ones:
  - `web/src/screens/home/needs-you-card.tsx`: `sortAttention(deriveNeedsYou(attention.data, scores))` → `deriveNeedsYou(attention.data, scores)` (T002 (a))
  - `web/src/screens/home/needs-you-card.tsx`: `NEEDS_YOU.heading(items.length)` → `NEEDS_YOU.heading(attention.data.items.length)` (T012 (a))
  - `web/src/screens/home/needs-you-card.tsx`: `const failed = item.tier === "critical"` → `const failed = item.tier !== "critical"` (T002 (a), T011 (b))
  - `web/src/screens/home/needs-you-card.tsx`: `?? NO_REASON` → `?? ""` (T011 (b), (f))
  - `web/src/screens/home/needs-you-card.tsx`: `summary?.set ? formatInstant(summary.set.run_started_at) : null` → `formatInstant(summary?.later?.started_at ?? "")` (T011 (f))
  - `web/src/screens/home/needs-you-card.tsx`: `markerSize={LAYOUT.markerSize}` → `markerSize={LAYOUT.railIconSize}` (T004)
  - `web/src/screens/home/needs-you-card.tsx`: `formatClock(data.checked_at)` → `formatClock(new Date())` (T007 (a))
  - `web/src/screens/home/needs-you-card.tsx`: `<output className="sr-only">` → `<output key={items.length} className="sr-only">` (T003)
  - `web/src/screens/home/needs-you-card.tsx`: the `empty-no-match` entry `{ notApplicable: … }` → `() => null` (T008)
  - `web/src/screens/home/index.tsx`: `attention.data.latest_download === null` → `attention.data.latest_terminal_download === null` (T005 edge)
  - `web/src/screens/home/index.tsx`: `<NeedsYouCard />` moved inside the summary row `div` (T006)
  - `web/src/screens/home/index.tsx`: `style={{ maxWidth: LAYOUT.contentMaxWidth }}` → (deleted) (T014)
  - `web/src/screens/home/copy.ts`: `"See the download your first scores come from"` → `"See the run your first scores come from"` (T009)
- **No browser storage, no new dependency, no `dangerouslySetInnerHTML`.** `failure_reason` and the score `reason` are provider or engine text, rendered as React text (`home-ui` §4; AGT-PROHIB-003).
