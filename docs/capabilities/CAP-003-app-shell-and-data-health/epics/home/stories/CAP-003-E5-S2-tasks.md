---
artifact_schema_version: 1
artifact_id: CAP-003-E5-S2-tasks
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
  timestamp: 2026-11-07T06:32:03Z
  source_artifacts:
    - id: CAP-003-E5-S2
      version: "1"
    - id: CAP-003-E5
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-data-health-ui
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-E6
      version: "2"
    - id: CAP-003-home-ui-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E5-S2 — The Data Tile: Verdict Badge, Hero Count, As-Of Lines, Lag Badge and the First-Download-Running State

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/home/stories/CAP-003-E5-S2.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `home-ui`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

The owner wants one tile on Home that says how many followed stocks are current and whether the data can be trusted, in the same words Data health uses. This story creates `web/src/screens/home/data-tile.tsx` (component design `home-ui` 2.2, 2.4, §10; UX design 1.3 Page Layout 2). It exports `DataTile()`, which takes no props and reads `useShell().attention` and `useShell().scores` only (DEC-0363). The tile has these states:

- **Skeleton** while attention loads, and while the summary loads once a download has ended. `dataTileBadge`'s score input has not answered yet (ui-components 2.4).
- **Nothing** while `latest_download` is null. `HomeScreen` (CAP-003-E5-S3) shows the empty state instead (DAC-E5-1).
- **First download running** while `latest_terminal_download` is null:
  - the sentence *Your first download, started {time}, is running.* from `started_at`, or from `requested_at` while the download is queued;
  - a `StatusBadge` *Downloading* (`tierOf`/`labelOf` over the download state) only while that state is `running`;
  - nothing else (DAC-E5-2, DEC-0210 as amended).
- **Full tile** once a download has ended. It is a `card` `metric` that is one link to `/data`, titled *Data*. It holds:
  - The badge: `dataTileBadge(worstDataTier({ affectedCount: problems.stock_count, followedCount: followed_count, latestTerminalDownload: latest_terminal_download.state }), scoreStatus)`. `scoreStatus` is the summary's score state, mapped in the order Data health's Factor scores card uses (Resolved Conflict 2), or `null` while the summary is not served (DAC-E5-3).
  - The hero line *{current} of {followed} stocks current*. Both figures come from `stocks_current` while the summary is served and carries one. Otherwise the current figure is an `Absent` em dash with hidden *not determinable* and `followed` is attention's `followed_count` (DAC-E5-4).
  - *Scores {time}* from `set.ended_at`. It is an em dash while the summary is not served, and *No scores yet* when `never_classified`.
  - *Prices {YYYY-MM-DD}* from `prices_as_of`, unconverted.
  - The scope sentence.
  - The lag badge `status-warning` *Not reflecting the latest download*, rendered when `set.not_current` is true or `later` is non-null (DAC-E5-5).
- **Error**, replacing the tile's body under its title, while attention fails or the summary fails with anything but `404`: *Couldn't read the data summary: {reason}.* with **Try again**, which calls `refresh("attention")` or `refresh("scores")` (epic DAC-E5-11).

No request goes to the aggregate. The tile adds two string groups to E5-S1's `copy.ts`: the absent-price words (DEC-0365) and the read-failure reasons (DEC-0366).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-8 | The tile shows current of followed, the scores and prices as-of, and says when scores lag the latest download | T003, T004, T005, T010, T014 |
| AC-11 | The tile's verdict tier equals Data health's verdict for the same inputs | T003, T007, T014 |
| AC-21 | Until a download has ended the tile gives no verdict and never *Yes* | T002, T010, T013 |
| DAC-E5-2 | The first-download-running state with no verdict word, hero count, as-of line, lag badge or progress | T002, T010, T013 |
| DAC-E5-3 | Once `latest_terminal_download` is set the badge is `dataTileBadge` over the verdict and the score state; no aggregate request | T003, T007, T014 |
| DAC-E5-4 | Hero and as-of sources as stated, never more current than followed | T004, T010, T012, T014 |
| DAC-E5-5 | The lag badge renders when `set.not_current` or `later` building or failed, never otherwise | T005, T014 |
| DAC-E5-S2-1 | `requested` with the summary at `404`: no *Downloading*; `running`: *Downloading*; terminal set: verdict badge | T002, T013 |
| DAC-E5-S2-2 | The tile's verdict tier equals the `data-health-ui` verdict fixture's; `failed` scores show *Score update failed*; *No scores yet* and *Updating* keep the verdict | T003, T014 |
| DAC-E5-S2-3 | One link named by title, tier and figures, or by the first-download sentence; no `/api/data-health` request | T007, T013, T014 |
| DAC-E5-S2-4 | No DAC-E7-3 term in any state; every label from `labelOf` or `copy.ts` | T008, T011, T012, T015 |
| DAC-E5-S2-5 | Every badge goes through `StatusBadge` with its label as text and its shape `aria-hidden`; every em dash goes through `Absent`; no state by colour alone | T009, T013, T014 |

Mapped test cases (`tests/component/home-ui-tests.md`; `tests/coverage-matrix.md` lines 46, 239-258, which counts this story "5 of 5"):

| Test case | Traces to |
|---|---|
| **TC-COMP-128** | DAC-E5-4, AC-8 |
| **TC-COMP-129** | DAC-E5-5, AC-8 |
| **TC-COMP-136** | DAC-E5-S2-1, DAC-E5-2, AC-21 |
| **TC-COMP-137** | DAC-E5-S2-2, DAC-E5-3, AC-11 |
| **TC-COMP-138** | DAC-E5-S2-3, DAC-E5-3 |
| **TC-COMP-139** | DAC-E5-S2-4, AC-19 |
| **TC-COMP-140** | DAC-E5-S2-5, AC-20 |
| **TC-COMP-131**, the tile half only | DAC-E5-11 |

TC-COMP-131 traces to DAC-E5-11, which CAP-003-E5-S3 lists. This story's Description renders the tile's error, so the tile half is implemented here, and E5-S3 asserts the whole-Home half. Owner-shell's TC-COMP-059 leaves its render half ("score figures render not determinable", the score error with **Try again**) to the consumers (CAP-003-E3-S3 plan, Resolved Conflict 1). T004 and T006 cover that half for Home. The test specification is `status: draft`. Its steps are used as written and sharpened below into literal assertions.

## Phase 1: Setup

**Purpose**: Confirm the hard dependencies are in the tree and record a green baseline.

- [ ] T001 From the repo root, confirm the producers this story imports exist with the shapes their plans fix. Any producer whose merged signature differs: use the merged one and record the difference in this story's TDD evidence. Then run `npm run test` and record that it passes before any change. No package, configuration or token is added (traces to DAC-E5-3, DAC-E5-S2-5).
  - CAP-003-E3-S3: `web/src/app/shell-context.tsx` exports `useShell` and `ShellContextValue`.
  - CAP-003-E3-S1: `web/src/app/shell-types.ts` exports `Attention`, `ReadState`, `ScoreState` and `ScoreSummary`, snake_case as served.
  - CAP-003-E1-S7: `web/src/components/patterns/worst-data-tier.ts` exports `worstDataTier` and `dataTileBadge`.
  - CAP-003-E1-S5: `web/src/components/patterns/tiers.ts` exports `tierOf`, `labelOf` and `Status`; `status-badge.tsx` exports `StatusBadge({ tier, children, title?, className? })`.
  - CAP-003-E1-S6: `web/src/components/patterns/presence.tsx` exports `Absent({ label })`; `format.ts` exports `formatInstant`, `formatSessionDate` and `formatCount` (DEC-0309 and -2).
  - CAP-003-E1-S1: `web/src/components/ui/card.tsx` exports `Card` (`variant` rendered as `data-variant`), `CardHeader`, `CardTitle` (an `h2` forwarding `id`), `CardContent` and `CardMetricValue`; `button.tsx` exports `Button` with the `outline` variant (DEC-0297).
  - CAP-003-E5-S1: `web/src/screens/home/copy.ts` exports `DATA_TILE` (`title`, `ofFollowedStocksCurrent`, `scores`, `prices`, `scope`, `firstDownloadRunning`, `readError`, `name`, `firstDownloadName`), `NOT_DETERMINABLE` and `TRY_AGAIN` (DEC-0362).

**Checkpoint**: Every producer is present and the Vitest suite is green.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin each tile state's text, badges, link, name and reads.

**Shared harness** for `web/src/screens/home/data-tile.test.tsx` (T002–T010). This is the consumer seam CAP-003-E5-S1's plan uses.

- Mock the shell:
  - `const shell = vi.hoisted(() => ({ value: {} as unknown as ShellContextValue }))`;
  - `vi.mock("../../app/shell-context", () => ({ useShell: () => shell.value }))`;
  - in `beforeEach`, set `shell.value = { health: { kind: "loading" }, attention, scores, refresh: vi.fn(), setTitleDetail: vi.fn() }`, cast as the type requires.
- Render with `render(<MemoryRouter><DataTile /></MemoryRouter>)`, with the helper `tile()` returning the container.
- `fetch` is the global `vi.fn()` stub of `web/src/test-setup.ts`.

Fixtures are independent literals typed `Attention` and `ScoreSummary`, never produced by code under test:

- `ATTENTION`:
  - `checked_at: "2026-10-15T22:52:10Z"`, `followed_count: 26`, `prices_as_of: "2026-10-14"`, `credential_present: true`;
  - `problems: { stock_count: 3, symbols: ["FBXX", "KO", "TSLA"], newest_completed_at: "2026-10-15T22:40:00Z" }`;
  - `latest_download: { run_id: "run-7", state: "partial", requested_at: "2026-10-15T21:00:00Z", started_at: "2026-10-15T21:02:00Z", ended_at: "2026-10-15T22:40:00Z", progress: { done: 30, total: 30 } }`;
  - `latest_terminal_download: { run_id: "run-7", state: "partial", ended_at: "2026-10-15T22:40:00Z", failure_reason: null }`;
  - `items: []`.

  Attention's `followed_count` (26) is deliberately lower than the summary's `stocks_current.current_count` (27). A tile that mixed the two sources would read *27 of 26*.
- `FIRST(state, startedAt)`: `ATTENTION` with these fields replaced:
  - `problems: { stock_count: 0, symbols: [], newest_completed_at: null }`;
  - `latest_terminal_download: null`;
  - `latest_download: { run_id: "run-1", state, requested_at: "2026-10-15T21:00:00Z" (16:00 CDT), started_at: startedAt, ended_at: null, progress: { done: 12, total: 30 } }`.

  Use `FIRST("requested", null)`, `FIRST("running", "2026-10-15T21:02:00Z")` (16:02 CDT) and `FIRST("cancelling", "2026-10-15T21:02:00Z")`.
- `VERDICT(stockCount, followedCount, state)`: `ATTENTION` with those three inputs replaced.
- `SUMMARY(over)`: a served `ScoreSummary` built from these defaults, with `over` applied:
  - `never_classified: false`;
  - `set: { set_id: "s-1", classification_date: "2026-10-15", run_id: "run-7", run_started_at: "2026-10-15T21:02:00Z", run_outcome: "partial", state: "complete", started_at: "2026-10-15T22:41:00Z", ended_at: "2026-10-15T22:46:00Z" (17:46 CDT), latest_trading_day: "2026-10-15", active_instruments: 30, not_current: false }`;
  - `later: null`;
  - `factors`: the three `FactorName` keys, each `{ qualified_count: 30, ranked: true, min_peer_set_size: 5 }`;
  - `stocks_current: { current_count: 27, followed_count: 30 }`.

  Named variants:
  - `BUILDING`: `set.not_current: true`, `later: { set_id: "s-2", state: "building", started_at: "2026-10-15T23:00:00Z", ended_at: null, failure_reason: null, run_id: "run-8", run_started_at: "2026-10-15T22:58:00Z" }`.
  - `FAILED`: the same with `state: "failed"`, `ended_at: "2026-10-15T23:05:00Z"` and `failure_reason: "The engine stopped"`.
  - `NEVER`: `never_classified: true`, `set: null`, `stocks_current: null`, `later: null`.
  - `NEVER_FAILED`: `NEVER` with `FAILED`'s `later`.
  - `NOT_CURRENT_ONLY`: `set.not_current: true`, `later: null`. This is synthetic. CAP-002 never serves it (Resolved Conflict 2).
- Score states:
  - `served(s)`: `{ kind: "served", data: s, checkedAt: new Date("2026-10-15T22:53:00Z") }`;
  - `NOT_SERVED`: `{ kind: "not_served" }`;
  - `LOADING`: `{ kind: "loading" }`;
  - `SUMMARY_500`: `{ kind: "error", error: new ApiError("Internal error", "req-9f3", { code: "internal_error" }), last: null }`;
  - `SUMMARY_500_LAST`: the same with `last: SUMMARY().data`.
- Attention states:
  - `ok(a)`: `{ kind: "ok", data: a, checkedAt: new Date("2026-10-15T22:53:41Z") }`;
  - `ATT_LOADING`: `{ kind: "loading" }`;
  - `ATT_UNREACHABLE`: `{ kind: "error", error: new ApiUnreachableError("GET /api/attention could not be reached"), last: { data: ATTENTION, checkedAt: new Date("2026-10-15T22:40:06Z") } }`;
  - `ATT_500`: `{ kind: "error", error: new ApiError("Internal error", "req-9f3", { code: "internal_error" }), last: null }`.

Locators:

- `badgeOf(c)` is `c.querySelector('[data-testid="data-tile-badge"] [data-variant^="status-"]')`.
- `lagOf(c)` is `c.querySelector('[data-testid="data-tile-lag"] [data-variant^="status-"]')`.
- Collapsed text is `textContent.replace(/\s+/g, " ").trim()`.

Every expected string below is a literal.

### Mandatory Component Tests

- [ ] T002 Implement TC-COMP-136 (Downloading badge only while running; verdict once a download ended) in a new `web/src/screens/home/data-tile.test.tsx`, with a `// Implements TC-COMP-136` comment.
  - (a) `FIRST("requested", null)` with `NOT_SERVED`:
    - The collapsed text of the tile contains `"Your first download, started 2026-10-15 16:00 CDT, is running."`.
    - `badgeOf` is null, and no element in the tile has a `data-variant` starting with `status-`.
  - (b) `FIRST("running", "2026-10-15T21:02:00Z")` with `NOT_SERVED`:
    - The sentence reads `"started 2026-10-15 16:02 CDT"`.
    - Exactly one `status-*` element is in the tile. It is `[data-variant="status-active"]` with text `"Downloading"`.
  - (c) Edge case (DAC-E5-2). For (a) and (b), and again with `served(NEVER_FAILED)` in place of `NOT_SERVED`:
    - No whole word `Yes`, `No`, `Mostly yes`, `Score update failed`, `Not reflecting the latest download` or `No scores yet` appears.
    - No `"stocks current"`, `"Scores "`, `"Prices "` or `"Every other number"` appears.
    - `"12 of"` does not appear (no progress).
    - `served(NEVER_FAILED)` would be critical *Score update failed* on a full tile, so the score tier must not leak through.
  - (d) Settled: `ok(ATTENTION)` with `NOT_SERVED`. `badgeOf` is `[data-variant="status-warning"]` with text `"Mostly yes"`.
  - Kills:
    - negate-boolean on `state === "running"` (a) shows the badge, or (b) loses it;
    - swap-case of the fallback order `requested_at ?? started_at` (b reads 16:00);
    - a mutant passing the served score status into the first-download branch (c, NEVER_FAILED).
- [ ] T003 Implement TC-COMP-137 (Tile verdict equals the Data health verdict; worse score state wins) in `data-tile.test.tsx` (same file, after T002), with a `// Implements TC-COMP-137` comment.
  - (a) `it.each` with `NOT_SERVED`, so the verdict stands alone. The table is literal. Its first three rows are the Data health fixtures of CAP-003-E6-S1's DAC-E6-S1-1, the rest the other answer-table rows of ui-components 2.4. Each row is `VERDICT(stock, followed, state) → [variant, text]`:
    - `(1, 10, "partial")` → `["status-warning", "Mostly yes"]`
    - `(10, 10, "succeeded")` → `["status-critical", "No"]`
    - `(0, 10, "failed")` → `["status-critical", "No"]`
    - `(0, 10, "abandoned")` → `["status-serious", "Mostly yes"]`
    - `(0, 10, "succeeded")` → `["status-good", "Yes"]`
    - `(0, 10, "cancelled")` → `["status-good", "Yes"]`

    `badgeOf` has exactly that `data-variant` and text.
  - (b) Score states over the good verdict `VERDICT(0, 10, "succeeded")`, each `served(...)` → expected badge:
    - `FAILED` → `["status-critical", "Score update failed"]`
    - `NEVER` → `["status-good", "Yes"]`
    - `BUILDING` → `["status-good", "Yes"]` (*Updating* never displaces the answer)
    - `NEVER_FAILED` → `["status-good", "Yes"]` (table order: `never_classified` is read first)
    - `NOT_CURRENT_ONLY` → `["status-warning", "Not reflecting the latest download"]`
    - `SUMMARY()` → `["status-good", "Yes"]`
  - (c) Ties and the worse verdict:
    - `VERDICT(10, 10, "succeeded")` with `served(FAILED)` → `["status-critical", "No"]` (a tie goes to the verdict);
    - `VERDICT(1, 10, "partial")` with `served(FAILED)` → `["status-critical", "Score update failed"]`;
    - `VERDICT(1, 10, "partial")` with `served(BUILDING)` → `["status-warning", "Mostly yes"]`.
  - Kills:
    - swap-case `building` ↔ `failed` in the module's `scoreStateOf` (b, FAILED and BUILDING);
    - reordering the `not_current` check before the `later` checks (b, BUILDING turns *Not reflecting…*);
    - reordering `never_classified` after `later` failed (b, NEVER_FAILED turns critical);
    - drop-field-copy of `problems.stock_count` as `affectedCount` (a, row 1 turns *Yes*);
    - passing attention's `latest_download.state` instead of `latest_terminal_download.state` (a: change `latest_download.state` to `"succeeded"` in a copy of row 3, and it still reads *No*);
    - passing the served score status as `null` (b, FAILED).
- [ ] T004 Implement TC-COMP-128 (Hero line figures from stocks_current; fallbacks while not served) in `data-tile.test.tsx` (after T003), with a `// Implements TC-COMP-128` comment.
  - (a) Served, `ok(ATTENTION)` with `served(SUMMARY())`:
    - the hero element's collapsed text is exactly `"27 of 30 stocks current"`, never `"27 of 26"`;
    - the tile contains `"Scores 2026-10-15 17:46 CDT"` and `"Prices 2026-10-14"`.
  - (b) Not served, with `NOT_SERVED`:
    - the hero begins with an element `aria-hidden="true"` whose text is `"—"`, followed by a `sr-only` element with text `"not determinable"`;
    - the hero's collapsed text is `"—not determinable of 26 stocks current"`;
    - the scores line is `"Scores"` followed by the same `Absent` pair;
    - `"Prices 2026-10-14"` is still shown.
  - (c) `never_classified`, with `served(NEVER)`:
    - the hero has the same `Absent` pair and `"of 26 stocks current"`;
    - the scores line's collapsed text is exactly `"No scores yet"`;
    - `"Prices 2026-10-14"` is shown, unconverted.
  - (d) "Never `0`" (home-ui §3): neither (b) nor (c) contains `"0 of"`.
  - Kills:
    - drop-field-copy of `stocks_current.followed_count` → attention's `followed_count` (a reads `27 of 26`);
    - negate-boolean on the `stocks_current === null` branch (c renders `0 of`, or throws);
    - swap-case `set.ended_at` → `set.started_at` (a reads `17:41`);
    - a mutant routing `prices_as_of` through `formatInstant(new Date(...))`, which throws or shifts.
- [ ] T005 Implement TC-COMP-129 (Lag badge only when the set is not current or a later set is building or failed) in `data-tile.test.tsx` (after T004), with a `// Implements TC-COMP-129` comment.
  - `it.each` over `ok(ATTENTION)` with each of `served(NOT_CURRENT_ONLY)`, `served(BUILDING)`, `served(FAILED)` and `served(NEVER_FAILED)`:
    - `lagOf` is `[data-variant="status-warning"]` with text exactly `"Not reflecting the latest download"`;
    - the lag wrapper follows the prices line in document order (`compareDocumentPosition` has `DOCUMENT_POSITION_FOLLOWING`; home-ui 2.4 table order).
  - With `served(SUMMARY())`, `served(NEVER)` and `NOT_SERVED`, `lagOf` is null and the text `"Not reflecting"` is absent from the tile.
  - Kills:
    - negate-boolean on `set?.not_current === true` (NOT_CURRENT_ONLY loses it, or SUMMARY() gains it);
    - `||` → `&&` between the two causes (BUILDING and FAILED still pass, but NOT_CURRENT_ONLY and NEVER_FAILED lose the badge);
    - removing the `later !== null` cause (NEVER_FAILED loses it).
- [ ] T006 Implement TC-COMP-131, the tile half (attention failure and summary errors render inside the tile; `404` is not an error), in `data-tile.test.tsx` (after T005), with a `// Implements TC-COMP-131 (tile half; CAP-003-E5-S3 asserts the Home half)` comment.
  - (a) `ATT_UNREACHABLE`:
    - `getByRole("heading", { level: 2, name: "Data" })` renders;
    - the tile contains exactly `"Couldn't read the data summary: FactorFlow is not answering."`;
    - no `status-*` element and no link are in the tile, and `"/api/attention"` does not appear (DEC-0366);
    - `getByRole("button", { name: "Try again" })` is clicked with `userEvent`, and `shell.value.refresh` is called exactly once, with `"attention"`.
  - (b) `ATT_500`:
    - the sentence is `"Couldn't read the data summary: FactorFlow hit an unexpected problem."`;
    - neither `"req-9f3"` nor `"Internal error"` appears.
  - (c) `ok(ATTENTION)` with `SUMMARY_500`, and again with `SUMMARY_500_LAST`:
    - the same *unexpected problem* sentence;
    - no `status-*` element, no hero and no link;
    - **Try again** calls `refresh` exactly once, with `"scores"`.

    With `last` present the tile still shows the error, because epic DAC-E5-11 requires it (Resolved Conflict 4).
  - (d) `FIRST("running", …)` with `SUMMARY_500`: the first-download sentence renders and no error sentence does. The first-download state reads no summary (home-ui 2.2 flow).
  - (e) `ok(ATTENTION)` with `NOT_SERVED`: no error sentence and no **Try again**. A `404` is not an error (owner-shell DAC-E3-6).
  - Kills:
    - negate-boolean on `error instanceof ApiUnreachableError` (a and b swap their reasons);
    - swap-case `refresh("scores")` → `refresh("attention")` (c);
    - a mutant rendering `error.message` (b shows `Internal error`);
    - a mutant rendering `last` while the summary fails (c, the `SUMMARY_500_LAST` case shows the hero).
- [ ] T007 Implement TC-COMP-138 (Tile is one link named by its content; never reads /api/data-health) in `data-tile.test.tsx` (after T006), with a `// Implements TC-COMP-138` comment.
  - (a) Full tile, `ok(ATTENTION)` with `served(SUMMARY())`:
    - `within(tile()).getAllByRole("link")` has length 1, and its `href` attribute ends with `"/data"`;
    - its accessible name is exactly `"Data: mostly yes. 27 of 30 stocks current. Scores 2026-10-15 17:46 CDT, prices 2026-10-14."`;
    - the `h2` *Data* is inside the link;
    - `userEvent.tab()` focuses the link (AC-25 keyboard).
  - (b) First download, `FIRST("running", …)`: one link, named `"Data: your first download, started 2026-10-15 16:02 CDT, is running."`.
  - (c) Names in the states the design gives no example for (DEC-0364):
    - with `NOT_SERVED`: `"Data: mostly yes. not determinable of 26 stocks current. Scores not determinable, prices 2026-10-14."`;
    - with `served(NEVER)`: `"Data: mostly yes. not determinable of 26 stocks current. Scores no scores yet, prices 2026-10-14."`;
    - with `served(FAILED)` over `VERDICT(0, 10, "succeeded")`: `"Data: score update failed. 27 of 30 stocks current. Scores 2026-10-15 17:46 CDT, prices 2026-10-14."`;
    - with `prices_as_of: null` and `served(SUMMARY())`: the name ends with `", prices not downloaded yet."`.
  - (d) No aggregate read:
    - Render every state of T002–T006 in one test. Afterwards, `vi.mocked(fetch)` has no call whose first argument contains `"/api/data-health"`, and in fact no call at all (the shell is mocked).
    - Read `data-tile.tsx` as text with `readFileSync`, resolved from `import.meta.url` as the delivered `web/src/api/render.test.tsx` does. Assert that no `import` line matches `/from\s+["'][^"']*(use-data-health|shell-client)["']/` and that the text has no match for `/\bfetch\b/`. T013 forbids the word in comments too.
  - Kills:
    - drop of the `aria-label` (the name becomes the whole card text);
    - swap-case `formatInstant` → `formatClock` in the name;
    - a mutant wrapping each figure in its own link (two links);
    - a planted `useDataHealth()` call (fetch is called, and the import is flagged).
- [ ] T008 Implement TC-COMP-139 (Data tile uses the display vocabulary in every state) in `data-tile.test.tsx` (after T007), with a `// Implements TC-COMP-139` comment.
  - Define `TERMS = /\b(?:instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i`, the eight DAC-E7-3 terms, as CAP-003-E5-S1's T006 does.
  - Render each of these states: every state of T002 (a)–(d), T003 (b), T004 (a)–(c), T005, T006 (a)–(d) and T010 (a) and (e). From each, collect the container's `textContent` and every `aria-label`, `title` and `alt` value.
  - Assert:
    - at least 15 states are scanned;
    - `TERMS` matches none of the collected values;
    - control: `TERMS` matches `"Next run"`, so a broken pattern cannot pass vacuously.
  - "Every label from `labelOf` or `copy.ts`" is asserted because each expected label in T002–T007 is a literal that `labelOf`'s table (CAP-003-E1-S5) or `copy.ts` (CAP-003-E5-S1, T011) pins.
  - Kills: the hand-written copy mutant `"not downloaded yet"` → `"not acquired yet"`, which T010 (e) renders and `TERMS` catches.
- [ ] T009 Implement TC-COMP-140 (Tile badges and em dashes carry shape, never colour alone) in `data-tile.test.tsx` (after T008), with a `// Implements TC-COMP-140` comment.
  - (a) Badges. Take every badge element rendered across:
    - T003 (a)'s six rows;
    - T003 (b)'s `FAILED` and `NOT_CURRENT_ONLY`;
    - T002 (b)'s *Downloading*;
    - T005's lag badges.

    For each:
    - its trimmed text equals the literal label expected there, and is non-empty;
    - it contains exactly one `svg`, which has `aria-hidden="true"`;
    - the label text is a direct text node, not inside the `svg`.

    Two badges of the same tier share their colour and differ only by label. Text and shape, never colour alone, carry the state (StatusBadge's own shape test is CAP-003-E1-S5's TC-COMP-022).
  - (b) Em dashes. In T004 (b) and (c), every `"—"` in the tile sits in an `aria-hidden="true"` element whose next sibling is a `sr-only` element with text `"not determinable"`.
  - (c) Resolved Conflict 1. No element with `data-variant="coverage-unknown"` renders in any tile state. The design renders each undetermined figure here as an em dash, and the score state while not served contributes no tier.
  - Kills:
    - a mutant rendering the badge as a bare `Badge` without `StatusBadge` (no `svg`);
    - swap-case `Absent` → plain `"—"` text (no hidden words).

### Additional Unit Tests

- [ ] T010 Add the loading, absent-download, cancelling, summary-loading, null-price, time-zone and composition cases to `data-tile.test.tsx` (after T009) (traces to AC-21, DAC-E5-2, DAC-E5-4, AC-8, DAC-E5-S2-5).
  - (a) `ATT_LOADING` with `NOT_SERVED`:
    - `getByTestId("data-tile-skeleton")` has `aria-busy="true"`;
    - no link, no `status-*` element, no `"Couldn't read"`.
  - (b) `ok({ ...ATTENTION, latest_download: null, latest_terminal_download: null })`: `container` is empty, because `HomeScreen` renders the empty state (DAC-E5-1; DEC-0363).
  - (c) `FIRST("cancelling", …)`: the sentence renders and no `status-*` element does. Kills a mutant `state !== "requested"` in place of `state === "running"`.
  - (d) `ok(ATTENTION)` with `LOADING`: the skeleton renders with no badge. The score input of `dataTileBadge` has not answered (ui-components 2.4; Resolved Conflict 3). `FIRST("running", …)` with `LOADING` renders the sentence, not the skeleton. Kills a mutant that renders the verdict alone while the summary loads.
  - (e) `ok({ ...ATTENTION, prices_as_of: null })` with `served(SUMMARY())`: the prices line is `"Prices"` followed by an `aria-hidden` `"—"` and a `sr-only` `"not downloaded yet"`. It is never `"Prices null"` and never blank (DEC-0365). Kills negate-boolean on `prices_as_of === null`.
  - (f) Time zone. Inside `describe.each(["Asia/Tokyo", "America/Los_Angeles"])`, which sets and restores `process.env.TZ` as `web/src/screens/research/format.test.ts` lines 159-170 do: (a) of T004 again reads `"Scores 2026-10-15 17:46 CDT"` and `"Prices 2026-10-14"`, and T002 (b) reads `"16:02 CDT"`.
  - (g) Composition (AC-26, home-ui §10), full tile:
    - the `Card` element has `data-variant="metric"`;
    - the hero is inside an element with classes `font-numeric` and `text-2xl`;
    - the scores and prices lines carry `text-xs` and `text-muted-foreground`;
    - the root is a `section` whose `aria-labelledby` resolves to the `h2` *Data*;
    - `container.querySelectorAll("[style]")` is empty.

    Kills removing `CardMetricValue` (no `text-2xl`), and swap-case `metric` → `default`.
- [ ] T011 [P] Extend `web/src/screens/home/copy.test.ts` (CAP-003-E5-S1's file) with the strings this story adds. Each assertion compares against a literal.
  - `DATA_TILE.pricesNotDownloaded` is `"not downloaded yet"`.
  - `READ_FAILURE` `toEqual({ unreachable: "FactorFlow is not answering", unexpected: "FactorFlow hit an unexpected problem" })`.
  - `DATA_TILE.readError(READ_FAILURE.unreachable)` is `"Couldn't read the data summary: FactorFlow is not answering."`.
  - If E5-S1's static-string assertion for `DATA_TILE` compares the whole group as one literal object, add the new member to that literal rather than writing a second assertion.

  Traces to DAC-E5-S2-4 (DEC-0365, -4). Kills swap-case between the two reasons.

**Checkpoint**: T002–T011 are written. T002–T010 fail because `data-tile.tsx` does not exist. T011 fails because the two additions do not.

---

## Phase 3: Core Implementation

**Purpose**: Add the two copy entries and build the tile, state by state.

- [ ] T012 [P] Add the two string groups to `web/src/screens/home/copy.ts` (CAP-003-E5-S1's file). Each gets a doc comment saying no design contains it and naming its decision, per the catalogue's rule (E5-S1 Open Gap 2). This makes T011 pass.
  - `DATA_TILE.pricesNotDownloaded: "not downloaded yet"`: the hidden words of the tile's prices em dash while `prices_as_of` is null (DEC-0365).
  - `export const READ_FAILURE = { unreachable: "FactorFlow is not answering", unexpected: "FactorFlow hit an unexpected problem" } as const`: the `{reason}` of *Couldn't read the data summary: {reason}.* (DEC-0366).

  Both are plain strings, not functions. CAP-003-E5-S1's T006 walk scans them with no change to its `CALLS` map. No unit or hex literal is added.
- [ ] T013 Create `web/src/screens/home/data-tile.tsx` with the skeleton, the absent-download, the first-download-running and the link structure (depends on T012). This makes T002, and T010 (a)–(c) and the first half of (d), pass.
  - **Imports:**
    - `useId` and `type JSX` from `react`;
    - `Link` from `react-router-dom`;
    - `useShell` from `../../app/shell-context`;
    - `type { Attention, ScoreSummary }` from `../../app/shell-types`;
    - `ApiUnreachableError`, `type ApiError` from `../../api/client`;
    - `Card`, `CardContent`, `CardHeader`, `CardTitle` and `CardMetricValue` from `../../components/ui/card`;
    - `Button` from `../../components/ui/button`;
    - `StatusBadge` from `../../components/patterns/status-badge`;
    - `tierOf`, `labelOf` and `type Status` from `../../components/patterns/tiers`;
    - `worstDataTier` and `dataTileBadge` from `../../components/patterns/worst-data-tier`;
    - `Absent` from `../../components/patterns/presence`;
    - `formatInstant`, `formatSessionDate` and `formatCount` from `../../components/patterns/format`;
    - `DATA_TILE`, `NOT_DETERMINABLE`, `READ_FAILURE` and `TRY_AGAIN` from `./copy`.
  - **Export.** `export function DataTile(): JSX.Element | null` takes no props (DEC-0363). It reads `const { attention, scores, refresh } = useShell()` and nothing else.
  - **Order of states:**
    1. `attention.kind === "loading"` → the skeleton: `<Card variant="metric" data-testid="data-tile-skeleton" aria-busy="true">`, holding the title and one `aria-hidden` `min-h-7 w-full animate-pulse rounded bg-secondary` block (E5-S1's skeleton classes).
    2. `attention.kind === "error"` → the error state (T015).
    3. `attention.data.latest_download === null` → `null`.
    4. `const verdict = worstDataTier({ affectedCount: a.problems.stock_count, followedCount: a.followed_count, latestTerminalDownload: a.latest_terminal_download?.state ?? null })` and `const badge = dataTileBadge(verdict, scoreStatus(scores))`. `scoreStatus` returns `{ of: "scores", state: scoreStateOf(scores.data) }` while `scores.kind === "served"`, and `null` otherwise.
    5. `badge === null` means no download has ended, because `dataTileBadge` returns `null` exactly when the verdict does, which is exactly when `latestTerminalDownload` is null (ui-components 2.4). It renders the first-download-running state:
       - `const time = formatInstant(d.started_at ?? d.requested_at)`;
       - body `<p>{DATA_TILE.firstDownloadRunning(time)}</p>`;
       - while `d.state === "running"`, `<span data-testid="data-tile-badge"><StatusBadge tier={tierOf(RUNNING)}>{labelOf(RUNNING)}</StatusBadge></span>` with module constant `RUNNING: Status = { of: "download", state: "running" }`;
       - link name `DATA_TILE.firstDownloadName(time)`.

       Keying on `badge === null` avoids a non-null assertion, which Biome's recommended rules reject, and adds no unreachable branch.
    6. `scores.kind === "loading"` → the skeleton.
    7. `scores.kind === "error"` → the error state (T015).
    8. Otherwise → the full tile (T014).
  - **Link structure** (a shared private `TileLink({ name, titleId, children })`):
    - `<section aria-labelledby={titleId}>`;
    - inside it, `<Link to={DATA_HEALTH} aria-label={name} className="block rounded">`;
    - inside that, `<Card variant="metric"><CardHeader><CardTitle id={titleId}>{DATA_TILE.title}</CardTitle>…</CardHeader><CardContent>…</CardContent></Card>`.

    `titleId` comes from `useId()`, and `const DATA_HEALTH = "/data"`, commented with home-ui 2.4. The skeleton and the error state use the same `section` and `Card` without the `Link` (Resolved Conflict 4).
  - **Doc comment.** The module doc comment cites:
    - component design `home-ui` 2.2, 2.4 and §10;
    - UX design 1.3 Page Layout 2;
    - DEC-0210 and DEC-0217 as amended;
    - DAC-E5-2 to DAC-E5-5, AC-8, AC-11 and AC-21;
    - DEC-0363 to -4.

    It says the tile makes no read of its own and never reads the aggregate (DEC-0219 withdrawn). The words `fetch`, `use-data-health` and `shell-client` appear nowhere in the file, comments included, so T007 (d) and the Validation Plan grep cannot contradict this task. No unit or hex literal, no inline `style`, and no `--gain` or `--loss` appear.
- [ ] T014 Add the full tile to `web/src/screens/home/data-tile.tsx` (depends on T013). This makes T003, T004, T005, T007, T009 and T010 (d)–(g) pass.
  - **`scoreStateOf(d: ScoreSummary): Extract<Status, { of: "scores" }>["state"]`** is module-private and follows the table order of data-health-ui 2.4 and epic DAC-E6-5, as CAP-003-E6-S1's `scoreStateOf` applies it (Resolved Conflict 2):
    - `d.never_classified` → `"never_classified"`;
    - `d.later?.state === "building"` → `"building"`;
    - `d.later?.state === "failed"` → `"failed"`;
    - `d.set?.not_current === true` → `"not_current"`;
    - otherwise `"current"`.

    A comment cites data-health-ui 2.4, home-ui 2.4 ("the tier Data health's Factor scores card shows") and spec review v3 FINDING-13.
  - **Values** (with `a` = `attention.data`, `s` = the summary when `scores.kind === "served"` else `null`, `sc` = `s?.stocks_current ?? null`):
    - `current`: `formatCount(sc.current_count)` when `sc` is non-null, else `null`;
    - `followed`: `formatCount(sc === null ? a.followed_count : sc.followed_count)` (DAC-E5-4);
    - `scoresAt`:
      - `s === null` → `null` (em dash);
      - `s.set === null` → `labelOf({ of: "scores", state: "never_classified" })`, *No scores yet*;
      - else `formatInstant(s.set.ended_at)`;
    - `pricesOn`: `a.prices_as_of === null ? null : formatSessionDate(a.prices_as_of)`;
    - `lagging`: `s !== null && (s.set?.not_current === true || s.later !== null)`. `later` is non-null only while building or failed, the two states CAP-002 serves (DAC-E5-5).
  - **Body** (inside `CardHeader`, under the title):
    - `<span data-testid="data-tile-badge"><StatusBadge tier={badge.tier}>{badge.label}</StatusBadge></span>`.
  - **Body** (inside `CardContent`, in home-ui 2.4's row order):
    1. `<CardMetricValue>` holds `{current ?? <Absent label={NOT_DETERMINABLE} />} {DATA_TILE.ofFollowedStocksCurrent(followed)}`.
    2. `<p className="text-xs text-muted-foreground">`:
       - `{DATA_TILE.scores} {scoresAt}` when `scoresAt` is a time;
       - the label alone when `s.set === null`;
       - `{DATA_TILE.scores} <Absent label={NOT_DETERMINABLE} />` when `s === null`.
    3. `<p className="text-xs text-muted-foreground">{DATA_TILE.prices} {pricesOn ?? <Absent label={DATA_TILE.pricesNotDownloaded} />}</p>`.
    4. `<p className="text-xs text-muted-foreground">{DATA_TILE.scope}</p>`.
    5. When `lagging`: `<span data-testid="data-tile-lag"><StatusBadge tier={tierOf(NOT_CURRENT)}>{labelOf(NOT_CURRENT)}</StatusBadge></span>`, with module constant `NOT_CURRENT: Status = { of: "scores", state: "not_current" }`.
  - **Name** (DEC-0364): `DATA_TILE.name(badge.label, current ?? NOT_DETERMINABLE, followed, nameOfScores, pricesOn ?? DATA_TILE.pricesNotDownloaded)`. `nameOfScores` is:
    - `scoresAt` when it is a time;
    - `NOT_DETERMINABLE` when `s === null`;
    - the *No scores yet* label with its first letter lower-cased, the rule `DATA_TILE.name` applies to its own label.
- [ ] T015 Add the error state to `web/src/screens/home/data-tile.tsx` (depends on T014). This makes T006 and T008 pass.
  - **Reason.** A module-private `readFailureReason(error: ApiError | ApiUnreachableError): string` returns `READ_FAILURE.unreachable` for `error instanceof ApiUnreachableError` and `READ_FAILURE.unexpected` otherwise. It never reads `message` or `requestId` (DEC-0366).
  - **`ErrorTile({ error, onRetry })`** renders, in the same `section`/`Card` without a `Link`:
    - the title;
    - `<p>{DATA_TILE.readError(readFailureReason(error))}</p>`;
    - `<Button variant="outline" type="button" onClick={onRetry}>{TRY_AGAIN}</Button>`.

    It renders no badge and no figure (home-ui 2.4 Badge row, "and no badge"; epic DAC-E5-11).
  - **Wiring:**
    - attention error → `onRetry={() => refresh("attention")}`;
    - summary error → `onRetry={() => refresh("scores")}`.

    Neither reads `last` (Resolved Conflict 4).

**Checkpoint**: T002–T011 pass.

---

## Phase 4: Integration

**Purpose**: Prove the tile sits inside the delivered and shared checks, with only this story's files touched.

- [ ] T016 Run `npm run test` and confirm the whole suite is green, including these, unchanged (traces to DAC-E5-S2-4, DAC-E5-S2-5):
  - CAP-003-E5-S1's `header.test.tsx` (its T006 walks `copy.ts` and now scans T012's strings);
  - `web/src/components/token-literals.test.ts`;
  - `web/src/components/patterns/worst-data-tier.test.ts`;
  - `web/src/components/patterns/status-badge.test.tsx`;
  - `web/src/api/render.test.tsx` (no `dangerouslySetInnerHTML`).

  Then confirm no producer or delivered file changed: `git diff --exit-code -- web/src/app web/src/components web/src/api package.json tailwind.config.js design-system` exits 0. `git status --short web/` lists only these:
  - `web/src/screens/home/data-tile.tsx` and `web/src/screens/home/data-tile.test.tsx`, new;
  - `web/src/screens/home/copy.ts` and `web/src/screens/home/copy.test.ts`, modified.

**Checkpoint**: The Vitest suite is green and the change set is exactly those four files.

---

## Phase 5: Polish

**Purpose**: Validation commands and TDD evidence.

- [ ] T017 Run `npm run lint`, `npm run format`, `npx tsc --noEmit` and `npm run build` from the repo root (traces to DAC-E5-S2-5).
  - Fix format findings with `npx biome format --write web/src/screens/home/data-tile.tsx web/src/screens/home/data-tile.test.tsx web/src/screens/home/copy.ts web/src/screens/home/copy.test.ts`.
  - `tsc` checks the test fixtures against CAP-003-E3-S1's `Attention` and `ScoreSummary`.
  - Fix findings in this story's four files only.
- [ ] T018 After each TDD cycle in T002–T017 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E5-S2-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`; no per-cycle commit is planned. T016–T017 add no behaviour and join cycle 4's validation evidence (INV-TDD-002, TEST-TDD-008; traces to no AC). The cycles are:
  1. T011 + T012, the copy entries;
  2. T002 + T007 (b) + T010 (a)–(c) + T013, the skeleton, absent download and first download;
  3. T003 + T004 + T005 + T007 (a), (c), (d) + T009 + T010 (d)–(g) + T014, the full tile;
  4. T006 + T008 + T015, the errors and the vocabulary scan.

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E3-S3 | hard | `data-tile.tsx` imports `useShell` from `web/src/app/shell-context.tsx`, and the test imports `ShellContextValue`. Existing graph edge |
| CAP-003-E3-S1 | hard | `data-tile.tsx` imports `ScoreSummary` and `Attention` from `web/src/app/shell-types.ts`, and the test types its fixtures with them. **New graph edge.** CAP-003-E3-S3 already orders it transitively, as in CAP-003-E5-S1's plan |
| CAP-003-E1-S7 | hard | `worstDataTier` and `dataTileBadge` from `worst-data-tier.ts`. Existing graph edge |
| CAP-003-E1-S5 | hard | `tierOf`, `labelOf`, `Status` and `StatusBadge`. Existing graph edge |
| CAP-003-E1-S6 | hard | `Absent`, `formatInstant`, `formatSessionDate` and `formatCount`. Existing graph edge |
| CAP-003-E1-S1 | hard | `Card` (`metric`), `CardTitle`, `CardMetricValue` and `Button` (`outline`). Existing graph edge |
| CAP-003-E5-S1 | hard | `DATA_TILE`, `NOT_DETERMINABLE` and `TRY_AGAIN` from `copy.ts`. This story also extends `copy.ts` and `copy.test.ts` (T011, T012). Existing graph edge |
| CAP-003-E6-S1 | context | Its `scores-card.tsx` `scoreStateOf` fixes the table order this tile mirrors, and its DAC-E6-S1-1 fixtures are T003 (a)'s first three rows. DEC-0373 is the reason rule T015 mirrors. A screen does not import another screen, so nothing is imported |
| CAP-003-E5-S3 | reverse | `HomeScreen` mounts `DataTile()` in the summary row's first column and renders the empty state the tile leaves to it (graph: E5-S3 → E5-S2) |

New hard edge added to `dependencies.yaml`: `CAP-003-E5-S2 → CAP-003-E3-S1`.

### Task Dependencies

- T001: No dependencies
- T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010: same file, sequential, after T001
- T011: after T001, parallel with the `data-tile.test.tsx` chain
- T012: Depends on T011 (makes it pass)
- T013: Depends on T002, T010, T012
- T014: Depends on T013, T003–T005, T007, T009
- T015: Depends on T014, T006, T008
- T016: Depends on T015
- T017: Depends on T016
- T018: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities

- Phase 2: `copy.test.ts` (T011) and the `data-tile.test.tsx` chain (T002–T010) touch different files
- Phase 3: T012 runs alongside the start of the test chain; T013–T015 are sequential in one file

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

### Story-Specific Validation

- **DAC-E5-2, DAC-E5-S2-1, AC-21:** T002 and T010 (a)–(d) pass.
- **DAC-E5-3, DAC-E5-S2-2, AC-11:** T003 passes.
- **DAC-E5-4, AC-8:** T004 and T010 (e) and (f) pass.
- **DAC-E5-5:** T005 passes.
- **DAC-E5-S2-3:**
  - T007 passes.
  - `grep -nE "fetch|use-data-health|shell-client" web/src/screens/home/data-tile.tsx` prints nothing. T013 forbids those words in that file, comments included.
- **DAC-E5-S2-4:** T008 and T011 pass.
- **DAC-E5-S2-5:**
  - T009 passes.
  - `grep -n "NotDeterminable" web/src/screens/home/data-tile.tsx` prints nothing (Resolved Conflict 1).
- **Error states (epic DAC-E5-11):** T006 passes.
- **AC-26 tokens:**
  - T010 (g) passes.
  - `grep -nE "[0-9]+(px|rem|em|vh|vw)\b|#[0-9a-fA-F]{3,8}\b|(rgb|hsl)a?\(" web/src/screens/home/data-tile.tsx web/src/screens/home/copy.ts` prints nothing.
  - `grep -nE -- "--gain|--loss" web/src/screens/home/data-tile.tsx` prints nothing.
- **No producer or delivered file changed:** T016's `git diff --exit-code` exits 0.

---

## Notes

### Resolved Conflicts

1. **"Em dashes through `Absent` and `NotDeterminable`" versus "an em dash with hidden *not determinable*".**
   - **The conflict.** Story DAC-E5-S2-5 and TC-COMP-140 carry the shared template clause "a value no artifact can determine goes through `NotDeterminable`".
   - **What the higher artifacts say.**
     - Epic DAC-E5-4, home-ui 2.4, UX design 1.3 and the story's own Description render the not-served current count and the scores as-of as "an em dash with hidden *not determinable*". That is `Absent`'s rendering (ui-components 2.5; CAP-003-E1-S6 T007).
     - `NotDeterminable` renders a `coverage-unknown` badge, not a dash.
     - The score state while not served "contributes no tier" (home-ui 2.4), so the tile has no badge to make not determinable.
   - **Governing: epic DAC-E5-4**, above the story's template clause, which is vacuous here as coverage-matrix note 7 records for its siblings.
   - **Outcome.** Every undetermined tile figure is `<Absent label="not determinable" />` (T004, T009 (b)). No `coverage-unknown` badge renders on the tile (T009 (c)).
2. **The score-state order.**
   - **What determines it.** home-ui 2.4 gives the tile "`tierOf({ of: "scores", … })` over the summary's state, the tier Data health's Factor scores card shows". That card's mapping is data-health-ui 2.4's row, restated in epic DAC-E6-5's listed order: `never_classified`, then `later` building, then `later` failed, then `set.not_current`, else current. CAP-003-E6-S1's plan implements it in that order (its Resolved Conflict 5).
   - **Governing: home-ui 2.4's reference to the card, with epic DAC-E6-5's order.** The tile must not read differently from the card (AC-11, DAC-E5-3).
   - **Consequence.** CAP-002 sets `set.not_current` true exactly when `later` is non-null (`classification-types.ts` l.58; `reader.py` l.269). So on real data the score state is never `not_current`.
     - The tile's badge shows *Score update failed* when a later set failed.
     - A building set (*Updating*, active) never displaces the verdict, which DAC-E5-S2-2 requires.
     - The lag badge carries "Not reflecting the latest download" separately (DAC-E5-5).
     - The `not_current` branch is still implemented and tested with the synthetic `NOT_CURRENT_ONLY` fixture (T003 (b)). This is spec review v3 FINDING-13 (LOW, open).
3. **Skeleton while the summary loads.** The story names the skeleton only "while attention loads". ui-components 2.4 says a caller whose read of `worstDataTier`/`dataTileBadge`'s inputs has not answered renders its skeleton, and the score state is `dataTileBadge`'s second input. **Governing: ui-components 2.4**, which fills a case the story leaves unstated rather than contradicting it. Once a download has ended, the tile is a skeleton until the summary answers. In the first-download-running state the summary is not an input, so the sentence renders (T010 (d)).
4. **The error state: body replaced, `last` ignored, and no link around the button.**
   - **What the sources say.**
     - Epic DAC-E5-11 replaces "each card's body" with *Couldn't read … : {reason}.* and **Try again**, and says "a summary error other than `404` MUST render inside the tile the same way".
     - UX design 1.3 says "the score figures' error" for the summary case.
     - Owner-shell 2.4 lets "a card show its last value as stale".
     - Story DAC-E5-S2-3 makes the tile one link, named by its tier and figures or by its first-download sentence.
   - **Governing: epic DAC-E5-11** over the design and UX prose. In both error cases the tile shows its title, the sentence and **Try again**, and no badge and no figure (home-ui 2.4 Badge row: "and no badge"), whatever `last` holds.
   - **Why the error card is not a link.** The error state has neither a tier nor figures to name a link by. HTML forbids a button inside a link. So the error card, like the skeleton, is a `section` and not a link (T006, T013). DAC-E5-S2-3's link applies to the two states it names.
5. **The first-download sentence.** System design §3.3 box 21 and UX design 1.3 write *The first download, started {start time}, is running.*, and UX's accessible name is *Data: downloading. The first download, …*. **Governing: epic DAC-E5-2 and home-ui §10.** The sentence is *Your first download, started {YYYY-MM-DD HH:MM zone}, is running.* The name is *Data: your first download, started …, is running.* (`DATA_TILE.firstDownloadRunning` and `firstDownloadName`, CAP-003-E5-S1 T010).
6. **The lag badge with no set.** DAC-E5-5 renders the lag badge when `later` "reports a newer set building or failed, and never otherwise". With `never_classified` and a `later` set, `later` is the first set, not a newer one. **Governing: DAC-E5-5 read literally,** "`later` building or failed", the same condition home-ui 2.4's Lag row and system design note 2 state. The badge renders with `NEVER_FAILED` (T005). Its words stay true, because no score reflects the latest download.

### Open Gaps

1. **The tile's module interface. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0363.**
   - **What is undetermined.** home-ui 2.1 places "the data tile" in `data-tile.tsx`, and the story says it "reads `useShell().attention` and `.scores` only". No artifact names the export, its props, or what it renders while `latest_download` is null, when `HomeScreen` shows the empty state instead (DAC-E5-1).
   - **What the plan adopts (T013).**
     - `export function DataTile(): JSX.Element | null`, with no props.
     - It renders `null` while attention is `ok` with `latest_download` null.
     - The test hooks are `data-testid` `data-tile-skeleton`, `data-tile-badge` and `data-tile-lag`.
   - **Derivation.** The story's "reads `useShell()` only" leaves nothing for a prop to carry. CAP-003-E5-S1's `HomeHeader()` is the sibling precedent (DEC-0362). `null` is the minimum that lets `HomeScreen` own the empty state without the tile repeating it.
   - **Alternatives rejected.**
     - Props `{ attention, scores }`: they would duplicate the shell context the story names as the source.
     - Rendering the empty state inside the tile: DAC-E5-1 says "no tile".
   - **Klass.** Propagating. CAP-003-E5-S3 mounts `DataTile()`.
   - **Owning design.** Component design `home-ui` 2.1 at its next revision.
2. **The tile's accessible name in states the design gives no example for. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0364.**
   - **What is undetermined.** home-ui §10 and DAC-E5-S2-3 name the tile "by its title, tier and figures" and give one example, with every figure present. CAP-003-E5-S1 left the em-dash case to this story (its Open Gap 2). No artifact says what the name carries for these cases:
     - an em-dashed current count or scores time;
     - *No scores yet*;
     - a null `prices_as_of`;
     - the skeleton and error states.
   - **What the plan adopts (T007 (c), T014).**
     - The name is `DATA_TILE.name(label, current, followed, scores, prices)`. Each figure is replaced by its text alternative:
       - an em-dashed figure by its hidden words *not determinable*;
       - *No scores yet* by *no scores yet* (first letter lower-cased, as `DATA_TILE.name` treats its label);
       - a null price by *not downloaded yet*.

       For example: *Data: mostly yes. not determinable of 26 stocks current. Scores not determinable, prices 2026-10-14.*
     - The skeleton and the error card are not links and carry no name of their own. Their `section` is labelled by the `h2` *Data*.
   - **Derivation.** A screen reader reading the tile's content would hear exactly these words, because the dash is `aria-hidden` and its hidden text is read. So the name and the content cannot disagree. The design's one example is the all-present case of the same rule.
   - **Alternatives rejected.**
     - Omitting absent figures from the name: the name would read better than the tile, which home-ui 2.4 forbids for the badge.
     - New name-only copy: it is a second wording for the same fact.
   - **Klass.** Contained.
   - **Owning design.** `home-ui` §10 (Accessibility) at its next revision.
3. **The tile's price line when `prices_as_of` is null. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0365.**
   - **What is undetermined.** home-ui 2.4 gives the prices line as *Prices {YYYY-MM-DD}*, and an em dash only "while attention fails", which is when the tile shows its error state. `prices_as_of` is `string | null` (CAP-003-E3-S1; data-health-reader 2.2). It is null once a download has ended without storing a price, for example a failed first download. No artifact gives the tile's rendering for it.
   - **What the plan adopts (T012, T014).** The line reads *Prices* followed by `<Absent label="not downloaded yet" />`. `DATA_TILE.pricesNotDownloaded` is added to `copy.ts`.
   - **Derivation.**
     - STD-UI-4 and ui-components 2.5: an absent value is an em dash "with visually hidden text naming what is absent; never `0`, never blank".
     - The header already says *prices not downloaded yet* for the same fact (home-ui 2.3; CAP-003-E5-S1 `HEADER.pricesNotDownloaded`). The hidden words reuse it without repeating *prices* after the visible *Prices*.
   - **Alternatives rejected.**
     - *not determinable*: the fact is known, because no price was stored.
     - The header's whole phrase as visible text: it breaks the *Scores …* / *Prices …* line pattern.
   - **Klass.** Contained.
   - **Owning design.** `home-ui` 2.4 at its next revision.
4. **The `{reason}` of *Couldn't read the data summary: {reason}.* PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0366.**
   - **What is undetermined.** Epic DAC-E5-11 and home-ui 2.4 and §10 require the sentence. UX design 0.7 says the envelope's code selects the wording and `request_id` is never shown. No artifact gives the wording.
   - **What the plan adopts (T012, T015).**
     - For an `ApiUnreachableError`: *FactorFlow is not answering*.
     - For any `ApiError`: *FactorFlow hit an unexpected problem*.
     - The rule never reads `message` or `requestId`. The two clauses are `READ_FAILURE` in Home's `copy.ts`.
   - **Derivation.**
     - The two reads the tile depends on answer only `200`, the `500` `internal_error` envelope, or (for the summary) `404`, which is `not_served` and not an error (owner-shell 2.3; data-health-api 11).
     - CAP-003-E6-S1 adopts the same two clauses for Data health (DEC-0373). Home cannot import a Data health module, so it holds its own copy of the same words.
     - Rendering `message` was rejected there and here, because delivered envelope and client messages carry domain terms and paths (AC-19; DAC-E5-S2-4).
   - **Klass.** Propagating.
     - CAP-003-E5-S3's *Couldn't read what needs you: {reason}.* should use `READ_FAILURE` too.
     - If the owner settles DEC-0373 differently, this follows it. One decision record can cover both.
   - **Owning design.** `home-ui` 2.4 and §10, with UX design 1.3 States (Error), at their next revision.

### Other Notes

- **Files beyond the story's list.** The story names `data-tile.tsx` and `data-tile.test.tsx`. This plan also edits CAP-003-E5-S1's `copy.ts` and `copy.test.ts` (T011, T012), as E5-S1's Open Gap 2 anticipates. Both additions are plain strings, so E5-S1's `CALLS` map in `header.test.tsx` needs no entry. No other file changes.
- **`ScoreSummary` is snake_case.** CAP-003-E3-S1's plan declares it as the wire mirror (`set.ended_at`, `stocks_current.current_count`, `never_classified`), not CAP-002's camelCase `ClassificationSummary`. This plan reads wire names throughout.
- **Two `scoreStateOf`s.** CAP-003-E6-S1's is module-private in `web/src/screens/data-health/scores-card.tsx`. A screen must not import another screen, so the tile writes its own, in the same order. T003 (b) and E6-S1's T005 (b) pin the same order against literals, so the two cannot drift without one test failing. Follow-up for `ui-components` 2.3 at its next revision: export a shared `scoreStateOf(summary)` beside `tierOf`.
- **The link's focus ring.** No delivered link sets a focus class, so the tile link relies on the browser's focus outline, as `web/src/screens/research/results-pane.tsx` does. `block rounded` makes the whole card the target.
- **The hero's word *stocks*.** No criterion gives a plural rule for *of {followed} stocks current* (CAP-003-E5-S1 Resolved Conflict 6), so it stays as written for any count.
- **Hand-written mutants.** Add these to the mutation run beside the generated ones:
  - `web/src/screens/home/data-tile.tsx`: `d.started_at ?? d.requested_at` → `d.requested_at ?? d.started_at`
  - `web/src/screens/home/data-tile.tsx`: `d.state === "running"` → `d.state !== "requested"`
  - `web/src/screens/home/data-tile.tsx`: `sc === null ? a.followed_count : sc.followed_count` → `a.followed_count`
  - `web/src/screens/home/data-tile.tsx`: the `d.set?.not_current === true` branch of `scoreStateOf` moved above the `d.later?.state === "building"` branch
  - `web/src/screens/home/data-tile.tsx`: `s.later !== null` → `false`
  - `web/src/screens/home/data-tile.tsx`: `error instanceof ApiUnreachableError` → `!(error instanceof ApiUnreachableError)`
  - `web/src/screens/home/data-tile.tsx`: `refresh("scores")` → `refresh("attention")`
  - `web/src/screens/home/data-tile.tsx`: `scores.kind === "loading"` branch → (deleted)
  - `web/src/screens/home/copy.ts`: `"not downloaded yet"` → `"not acquired yet"` (vocabulary scan, T008)
