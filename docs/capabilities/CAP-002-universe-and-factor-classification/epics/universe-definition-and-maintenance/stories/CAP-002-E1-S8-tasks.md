---
artifact_schema_version: 1
artifact_id: CAP-002-E1-S8-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T23:30:00Z
  source_artifacts:
    - id: CAP-002-E1-S8
      version: "1"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E1-S8 — Universe Members and History Tabs with As-Of View and Remove Dialog

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/universe-definition-and-maintenance/stories/CAP-002-E1-S8.md`
**Component**: `FactorFlow-v2` (module `classification-ui`, universe detail tabs)
**Branch**: `usr/alvaro-de-jodra/CAP-002-E1-tasks`
**Date**: 2026-10-17

## Summary

Build the two tabs and the remove dialog of the universe detail screen under `web/src/screens/research/universes/detail/`: `members-tab.tsx` (the shared results table scoped to the universe, a *Members as of* control, the *Member since* column and the in-row **Remove…**), `history-tab.tsx` (the universe's events newest first, a rename showing both names, *View members as of this event* links) and `remove-dialog.tsx` (the `confirm` dialog, plus the row action that is `blocked` on the sole member with **Retire…** adjacent). A member no longer followed stays in the table with *Not followed* on every factor. With no `as_of` the Members tab is `results-table.tsx` on the list read scoped by `universe_id`; with `as_of` it reads `GET /api/universes/{id}?as_of=` (the only read that accepts the date) and renders the returned members. The story consumes E4-S1's fetch layer, E4-S2's copy and format, E4-S3's `factor-cell.tsx`, E4-S5's `filters-pane.tsx` and E4-S6's `results-table.tsx`; it registers no route and builds no detail index, header, add-stocks or retire dialog (CAP-002-E1-S9 mounts these tabs and owns those). The props this plan pins for the three components are the contract E1-S9 imports.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-4 | Maintain a universe; a rename keeps history and shows in it | T005, T008, T009, T012, T013, T014 |
| AC-5 | Refuse to remove the last member; offer retirement | T006, T012 |
| AC-6 | Dated membership retained; members on any past date visible | T002, T003, T007, T009, T012, T013, T014 |
| AC-15 | A retired instrument stays a member, shown *Not followed* | T004, T014 |
| DAC-E1-7 | Sole member removal refused with `last_member`, retirement offered | T006, T012 |
| DAC-E1-8 | Membership as of a date; before creation flagged with the creation date | T002, T003, T014 |
| DAC-E1-9 | A retired instrument remains a member and replays as retired | T004, T014 |
| DAC-E1-S8-1 | *View members as of this event* or a typed date requests `as_of` and the label states it; malformed date is a field error (TC-COMP-055) | T002, T009, T013, T014 |
| DAC-E1-S8-2 | Date before creation renders the did-not-exist sentence with the creation date (TC-COMP-056) | T003, T014 |
| DAC-E1-S8-3 | Retired member shows *Not followed* on every factor, never under *All followed stocks* (TC-COMP-119) | T004, T014 |
| DAC-E1-S8-4 | Sole member: Remove `blocked` with Retire adjacent; `last_member` keeps the dialog with a Retire action (TC-COMP-043) | T006, T012 |
| DAC-E1-S8-5 | Remove dialog is `confirm`, states history stays, initial focus on Cancel (TC-COMP-057) | T007, T012 |
| DAC-E1-S8-6 | History newest first, a rename shows both names (TC-COMP-029) | T008, T009, T013 |

## Phase 1: Setup

**Purpose**: Confirm the producers this story imports exist and bind the exact names this plan leaves to them.

- [ ] T001 Verify, without editing, that the producers exist, and record the exact names every later task uses. If any item in (a) to (e) is missing, STOP: the hard edges E4-S1, E4-S2, E4-S3, E4-S5 and E4-S6 are unmet and this plan must not be coded yet. (a) E4-S1: `web/src/api/classification-client.ts` and `web/src/api/classification-types.ts` exist and `requestJson` is exported from `web/src/api/client.ts`. Record the functions and their camelCase results for: `GET /api/universes/{id}` with optional `as_of` (result: `universeId`, `name`, `lifecycle`, `createdAt`, `retiredAt`, `memberCount`, `asOf`, `asOfBeforeCreation`, `members[] {symbol, name, lifecycle, memberSince, factors}`); `GET /api/classifications` with `universe_id` and the filter/sort/cursor parameters (record how `ResearchQuery` from `research-query.ts` is turned into its parameters); `GET /api/universes/{id}/events` with `limit` and `cursor` (result: `events[] {eventId, eventType, name, symbol, recordedAt, recordedOn, filterProvenance}`, `nextCursor`); `DELETE /api/universes/{id}/members/{symbol}` (result: `removedAt`); the error class and how it exposes `code` (`last_member`, `universe_retired`, `not_a_member`, `universe_not_found`, `validation_error`) . (b) E4-S2: `web/src/screens/research/copy.ts` (record which keys already hold the strings listed in T010), `web/src/screens/research/format.ts` (record `formatTimestamp` and whether a helper returns the America/Chicago calendar date of a timestamp), `research-query.ts` (record whether the `as_of` key is part of `ResearchQuery` or must be handled by the caller). (c) E4-S3: `web/src/components/patterns/factor-cell.tsx` exports `FactorCell`; record its props and that a retired `lifecycle`/`reasonCode: "retired"` renders *Not followed*. (d) E4-S5: `web/src/screens/research/filters-pane.tsx`; record its props, how a universe scope removes *Look in*, and whether it exposes a footer slot above **Clear filters**. (e) E4-S6: `web/src/screens/research/results-table.tsx`; record its props, in particular a `universeId`/scope prop, whether it accepts an extra column and a row-action renderer, how a row is addressed in the DOM (for focus return in T014), and the heading element it leaves to its host. (f) Delivered: `react-router-dom` is a dependency, `web/src/api/types.ts` exports `ScreenState`, `web/src/screens/instruments/retire-dialog.tsx` is the dialog precedent. (g) `git status` shows no file of this story and no `web/src/screens/research/universes/detail/` content beyond what E1-S9 or other stories created.

**Checkpoint**: Every name later tasks import is recorded; nothing is edited.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the tabs and the dialog from the acceptance criteria.

### Mandatory Component Tests

All three files are new (DEC-0064: no delivered test file is edited). Conventions follow `web/src/screens/instruments/retire-dialog.test.tsx` and `bulk-add.test.tsx`: Vitest and React Testing Library, `userEvent.setup()`, the fetch layer replaced with `vi.mock("../../../../api/classification-client", async () => ({ ...(await vi.importActual(...)), <getUniverseFn>: vi.fn(), <listFn>: vi.fn(), <eventsFn>: vi.fn(), <removeFn>: vi.fn() }))` using the names T001 recorded, and a `// Implements TC-COMP-0NN` comment on each test. Every render sits in a `MemoryRouter`. Assert literal owner-facing strings from UX design 1.4, not imports from `copy.ts`.

- [ ] T002 [P] Implement TC-COMP-055 (As-of view requests as_of and labels it; malformed date is field error; DAC-E1-S8-1, DAC-E1-8, AC-6) in `web/src/screens/research/universes/detail/members-tab.test.tsx`. Render `MembersTab` with props `universeId`, `universeName: "Tech"`, `lifecycle: "active"`, `memberCount: 3`, `asOf: null` and `onAsOfChange`/`onMembershipChanged`/`onRetire` spies. (a) Type `2026-09-30` into the field labelled *Members as of* and press `Enter`: `onAsOfChange` is called once with `"2026-09-30"`. Re-render with `asOf: "2026-09-30"` and a doubled universe read: the read function is called with the universe id and `"2026-09-30"`, a polite live region (`role="status"`) reads *Members as of 2026-09-30. Scores shown are from the current set.*, the returned members render with their percentile cells and their *Member since* text, and a **Show current members** button is present; activating it calls `onAsOfChange(null)`. (b) Malformed input (`2026-13-40`, `30/09/2026`, `abc`, and an empty string submitted is not an error and clears nothing): the field shows an error naming the shape, *Enter a date as YYYY-MM-DD.*, `aria-invalid="true"`, `onAsOfChange` and the read function are called zero times. (c) A server `422` (`validation_error`) on the as-of read renders the same field error and keeps the previous table. (d) With `asOf` set, thresholds, search and sort are not applied: the list read is not called and the as-of line sentence also reads, once, that filters apply to the current members only (the sentence from T010; DEC-0105).
- [ ] T003 [P] Implement TC-COMP-056 (As-of before creation shows did-not-exist sentence; DAC-E1-S8-2, DAC-E1-8, AC-6) in `web/src/screens/research/universes/detail/members-tab.test.tsx` (same file, applied after T002). Double the universe read to return `asOfBeforeCreation: true`, `members: []`, `name: "Tech"`, `createdAt: "2026-10-15T14:20:00Z"` for `asOf: "2026-01-01"`: the tab renders *Tech did not exist on 2026-01-01. It was created on 2026-10-15.* and renders no table and no *No members match these filters.* sentence. Add a boundary case: `createdAt: "2026-10-16T03:30:00Z"` is 22:30 on 2026-10-15 in America/Chicago, so the sentence says *created on 2026-10-15* (the Chicago date rule, DEC-0105).
- [ ] T004 [P] Implement TC-COMP-119 (Retired member shows Not followed, absent from All followed stocks; DAC-E1-S8-3, DAC-E1-9, AC-15) in `web/src/screens/research/universes/detail/members-tab.test.tsx` (same file, applied after T003). Double the list read to return a scored member `AAPL` and a retired member `OLD` (`lifecycle: "retired"`, all three factor cells `not_classified` with `reasonCode: "retired"`). Assert the `OLD` row is rendered in the table (not omitted, not moved to a separate list) with three *Not followed* badges (`data-variant="status-neutral"` on each) and no percentile or bar; that every list request issued by the tab carries `universeId` equal to the prop and none is issued without it (the stock is only ever listed under the universe scope, never under *All followed stocks*); and that `OLD` has a **Remove…** action named *Remove OLD from Tech* like any other member (it remains removable).
- [ ] T005 [P] Additional unit tests in `web/src/screens/research/universes/detail/members-tab.test.tsx` (same file, after T004) for the implementation concerns the TCs do not pin. (a) *Member since* column present after Name, text from `formatTimestamp` of the universe read's `memberSince` joined by symbol (AC-6). (b) The heading (a non-`h1`; the page `h1` is the universe name, E1-S9) reads *{n} of {m} members match* from the list read's `matchCount` and the `memberCount` prop. (c) Each row's **Remove…** has the accessible name *Remove AAPL from Tech*; none is a bare *Remove*. (d) `lifecycle: "retired"` renders no **Remove…** at all and no *Members as of* editing is blocked (reading as of a date stays possible). (e) Remove flow: activate **Remove…** on a row, confirm; the remove function is called with the universe id and `AAPL`; on resolve the list read and the universe read are re-issued, `onMembershipChanged` is called once, a `role="status"` element reads *Removed AAPL from Tech* (DEC-0107), and focus is on the row now at the removed row's index, or on the heading when the removed row was last. (f) Remove rejecting with `universe_retired` keeps the dialog open with *This universe is retired and can't be changed. Its members and history are still viewable.* (g) Remove rejecting with `not_a_member` closes the dialog, re-reads and shows *AAPL is no longer a member of Tech.* politely. (h) Thresholds, search and **Clear filters** go through E4-S5's pane and URL; the tab adds none of its own. (i) `memberCount: 1` and a single row: the row's Remove action is the `blocked` form from T006.
- [ ] T006 [P] Implement TC-COMP-043 (Sole member Remove is blocked with adjacent Retire action; DAC-E1-S8-4, DAC-E1-7, AC-5, AC-6) in `web/src/screens/research/universes/detail/remove-dialog.test.tsx`. (a) Render `RemoveAction` with `soleMember: true`: the control named *Remove AAPL from Tech* is `data-variant="blocked"`, focusable (`tabIndex` 0, `toBeEnabled()`, not a bare `disabled`), `aria-describedby` points at an element reading *This is the last member. Retire the universe instead.*, clicking it calls `onRemove` zero times and opens no dialog, and a **Retire…** button is adjacent (the next focusable element after it in tab order, same container); activating **Retire…** calls `onRetire` once. With `soleMember: false` it is the `ghost` **Remove…** and clicking calls `onRemove` once. (b) Render `RemoveDialog` with `error: "last_member"` (the server backstop, e.g. a race on a stale count): the dialog stays open, an `role="alert"` reads *This is the last member, so it can't be removed. Retire the universe instead.*, the confirm **Remove from universe** is replaced by **Retire…**, **Cancel** stays, and activating **Retire…** calls `onRetire` once.
- [ ] T007 [P] Implement TC-COMP-057 (Remove dialog is confirm variant, focus on Cancel; DAC-E1-S8-5, AC-6) in `web/src/screens/research/universes/detail/remove-dialog.test.tsx` (same file, applied after T006). Render `RemoveDialog` with `symbol: "AAPL"`, `universeName: "Tech"`. Assert: the dialog has `data-variant="confirm"` and never `destructive`; the title reads *Remove AAPL from Tech*; the description reads *Its membership until today stays in the universe's history. Its scores are not affected.*; the confirm button is **Remove from universe**; `document.activeElement` is **Cancel** on mount; Esc calls `onCancel`; Tab from the last control wraps to **Cancel** and Shift+Tab from **Cancel** wraps to the last control (the manual trap of `retire-dialog.tsx`); focus returns to the previously focused element on unmount; `pending: true` natively disables the confirm and not **Cancel**. Add a case for `error: "generic"` rendering a `role="alert"` with the generic sentence and keeping the confirm.
- [ ] T008 [P] Implement TC-COMP-029 (History tab newest first, rename shows both names; DAC-E1-S8-6, AC-4) in `web/src/screens/research/universes/detail/history-tab.test.tsx`. Double the events read to return, newest first: a `member_removed` (`OLD`, 2026-10-18), `renamed` (name `Tech and Dividend growers`, 2026-10-17), `member_added` (`AAPL`, 2026-10-16), `created` (name `Tech`, 2026-10-15) with `nextCursor: null`. Render `HistoryTab`. Assert the data rows appear in that order (first body row is the removal, last is *Created*), the renamed row's Detail reads both names, *Tech → Tech and Dividend growers* with the old name taken from the nearest older `created`/`renamed` event, the Event column labels are *Created*, *Renamed*, *Stock added*, *Stock removed*, the table is a native `<table>` with `data-variant="history"` and column headers *Recorded at*, *Event*, *Detail*, and *Recorded at* is `formatTimestamp` text with the zone.
- [ ] T009 [P] Additional unit tests in `web/src/screens/research/universes/detail/history-tab.test.tsx` (same file, after T008). (a) Symbol in a `member_added`/`member_removed` row is a `Link` to `/research/stocks/AAPL`. (b) *View members as of this event* appears on `created`, `member_added` and `member_removed` rows and on no `renamed` or `retired` row; activating it calls `onViewMembersAsOf` with that event's `recordedOn` (America/Chicago date, DEC-0065) and nothing else. (c) A `retired` row renders *Retired* with no Detail. (d) Paging: with `nextCursor: "c1"` a **Load more** button is shown, activating it calls the events read with that cursor and appends the older rows below without reordering; the first read uses `limit` 50 (DEC-0107). (e) The renamed row at a page boundary: page one ends on a `renamed` event with a `nextCursor`; the tab reads the next page on its own until a `created` or `renamed` event supplies the old name, and renders both names (no row shows only the new name). (f) Error: a rejected read replaces the body with the operation, resource and reason sentence from `copy.ts` and **Try again**, which re-reads; `universe_not_found` renders the *No universe with this address exists.* sentence with a link to Universes. (g) Loading renders a skeleton region (`aria-busy="true"`), not an empty table. (h) No `dangerouslySetInnerHTML` (the repo's `render.test.tsx` scan covers the files; add no exception).

**Checkpoint**: All tests written and failing (no production code yet).

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass with the three components.

- [ ] T010 Add the owner-facing strings this story needs to `web/src/screens/research/copy.ts` only where T001 found a key missing (E4-S2 owns the file). Strings, in display labels: *Members as of* (field label); *Enter a date as YYYY-MM-DD.*; *Members as of {date}. Scores shown are from the current set.*; the as-of sentence *Filters and sorting apply to current members only.*; **Show current members**; *{name} did not exist on {date}. It was created on {created}.*; *{n} of {m} members match*; *No members match these filters.* and its **Clear filters** reuse; **Member since**; *Remove {symbol} from {name}* (button name and dialog title, which is *Remove {symbol} from {name}* too); **Remove…**; dialog description *Its membership until today stays in the universe's history. Its scores are not affected.*; **Remove from universe**; **Cancel**; *This is the last member. Retire the universe instead.*; *This is the last member, so it can't be removed. Retire the universe instead.*; **Retire…**; *Removed {symbol} from {name}*; *{symbol} is no longer a member of {name}.*; *This universe is retired and can't be changed. Its members and history are still viewable.* (design 2.7; reuse if S7 or E4-S2 added it); event labels *Created*, *Renamed*, *Stock added*, *Stock removed*, *Retired*; **View members as of this event**; column headers *Recorded at*, *Event*, *Detail*; **Load more**; *Loading…*; the history error sentences and *No universe with this address exists.* with its link label; a generic remove failure sentence. Keep each one keyed entry; reuse any key T001 found. Then run `npm run test -- copy` and confirm E4-S2's vocabulary scan still passes: its forbidden word *retire* targets the instrument sense (stop following), and the universe lifecycle words are mandated by this story's AC and design 2.7; if the scan flags only those strings, narrow its matcher in `copy.test.ts` to exempt universe wording (the same narrowing the E1-S7 plan T011 names; do it once, whichever story lands first) and say so in the TDD evidence. Depends on T001.
- [ ] T011 Add the seams T001 found missing, and only those, as additive optional props defaulted so every E4-S5 and E4-S6 test passes unchanged (DEC-0106; 9a shape): in `web/src/screens/research/results-table.tsx` an optional extra column after Name (header **Member since**, cell content from a renderer or a map keyed by symbol) and an optional last-cell row-action renderer receiving the row; in `web/src/screens/research/filters-pane.tsx` an optional footer slot rendered above **Clear filters** for the *Members as of* form. If T001 found the seam already present, this task is a no-op: record that in the TDD evidence and make no edit. Run the full existing `results-table.test.tsx` and `filters-pane.test.tsx` after the edit; any assertion that now fails means the prop was not defaulted, not that the test should change. Depends on T001; T004, T005 and T002 depend on it where the seam was missing.
- [ ] T012 Create `web/src/screens/research/universes/detail/remove-dialog.tsx`. Exports `RemoveDialog({ symbol, universeName, error, pending, onConfirm, onCancel, onRetire })` and `RemoveAction({ symbol, universeName, soleMember, onRemove, onRetire })`. `RemoveDialog` is a native `<dialog open aria-modal="true" aria-labelledby>` with `data-variant="confirm"`, copied in structure from `web/src/screens/instruments/retire-dialog.tsx` (own Tab-cycle between first and last control, Esc cancels, focus restored on unmount, initial focus on **Cancel**), title *Remove {symbol} from {name}*, the description from T010, `error: "last_member" | "universe_retired" | "generic" | null` rendered as a `role="alert"` by code through `copy.ts` (never `message`), confirm **Remove from universe** natively `disabled` while `pending`, and, for `error === "last_member"`, the confirm replaced by **Retire…** calling `onRetire`. `RemoveAction` renders, for `soleMember === false`, the `ghost` **Remove…** (`data-variant="ghost"`, accessible name *Remove {symbol} from {name}*) calling `onRemove`; for `soleMember === true`, the same name as `data-variant="blocked"` (focusable, `tabIndex` 0, `aria-describedby` the sentence *This is the last member. Retire the universe instead.*, click does nothing) followed immediately by a **Retire…** button calling `onRetire`. The dialog never uses `destructive` (STD-UI-2); no text is passed through `dangerouslySetInnerHTML`. Depends on T001, T010; makes T006 and T007 pass.
- [ ] T013 Create `web/src/screens/research/universes/detail/history-tab.tsx`. Exports `HistoryTab({ universeId, onViewMembersAsOf })`. State is `ScreenState<{ events; nextCursor }>`. Reads the events function (T001) at `limit` 50 on mount, newest first as returned; **Load more** appends the next page. Renders a native `<table data-variant="history">` with the columns *Recorded at* (`formatTimestamp`, zone shown), *Event* (labels by `eventType`) and *Detail*: the name for `created`, `old → new` for `renamed` (the old name is the nearest older event that carries a name, found in the loaded list; when the last loaded `renamed` row has none and `nextCursor` is not null, read the next page without a click until one is found or the cursor ends, DEC-0107), the symbol as a `Link` to `/research/stocks/{symbol}` for `member_added`/`member_removed`, nothing for `retired`; and, on `created`, `member_added` and `member_removed` rows only, a **View members as of this event** button (a link in appearance, per the UX design's component table) calling `onViewMembersAsOf(event.recordedOn)`. Loading is a skeleton with `aria-busy="true"`; an error replaces the body with the operation, resource, reason and **Try again** from `copy.ts` by `code`, `universe_not_found` giving the link to `/research/universes`. The tab never filters, sorts or deletes events. Depends on T001, T010; makes T008 and T009 pass.
- [ ] T014 Create `web/src/screens/research/universes/detail/members-tab.tsx`. Exports `MembersTab({ universeId, universeName, lifecycle, memberCount, asOf, onAsOfChange, onMembershipChanged, onRetire })`; these props are the contract E1-S9 imports (`asOf` is controlled by the host and kept in the URL by it; `lifecycle` is `"active" | "retired"`). Composition: a `section` labelled *Filters* holding E4-S5's `FiltersPane` in universe scope (no *Look in*) with the *Members as of* `form` `inline` in its footer slot (T011): a labelled `input` `text`, `Enter` submits, validated client-side as `^\d{4}-\d{2}-\d{2}$` plus a real calendar date before any request, a server `422` showing the same field error; and a `section` labelled *Results* holding the heading (*{n} of {m} members match*, `matchCount` and the `memberCount` prop, an `h2`) and the table. **Current view** (`asOf === null`): E4-S6's `ResultsTable` scoped by `universeId`, its extra *Member since* column and **Remove…** row action (T011), the `ResearchQuery` from the URL as E4-S5 and E4-S6 already do; *Member since* comes from one `GET /api/universes/{id}` read (no `as_of`) joined by symbol, re-read after each removal. **As-of view** (`asOf` set): read the universe endpoint with `asOf`; render a polite `role="status"` line *Members as of {date}. Scores shown are from the current set.* with **Show current members** (`ghost`) calling `onAsOfChange(null)`; when `asOfBeforeCreation` is true render only the did-not-exist sentence (creation date = America/Chicago calendar date of `createdAt`, from `format.ts` if T001 found a helper, else `Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" })`; DEC-0105); otherwise render the returned members in one native `<table>` (Symbol, Name, Value, Growth, Momentum via `FactorCell`, Member since) in the order returned, with filters, search and sort not applied and the sentence from T010 saying so (DEC-0105), and no **Remove…** (the current membership is not what is shown). Remove: `RemoveAction` per row (`soleMember` is `memberCount === 1`), opening `RemoveDialog`; confirm calls the remove function; success closes the dialog, re-reads the list and the universe read, calls `onMembershipChanged()`, shows `role="status"` text *Removed {symbol} from {name}* (DEC-0107) and moves focus to the row now at the removed row's index (using T001's row addressing) or to the heading when it was last; `last_member` and `universe_retired` set the dialog's `error`; `not_a_member` closes it and announces politely. `lifecycle === "retired"` renders no `RemoveAction` and keeps the as-of control. A member no longer followed is rendered exactly as any other row by `FactorCell` (*Not followed* on every factor); the tab neither filters it out nor passes a scope other than `universeId`. Plain text children only. Depends on T001, T010, T011, T012; makes T002 to T005 pass.

**Checkpoint**: `npm run test -- web/src/screens/research/universes/detail` passes; every test from T002 to T009 is green.

---

## Phase 4: Integration

**Purpose**: Confirm the three components plug into what CAP-002-E1-S9 mounts, and touch nothing else.

- [ ] T015 Confirm integration without editing outside the story: (a) `members-tab.tsx` exports `MembersTab`, `history-tab.tsx` exports `HistoryTab` and `remove-dialog.tsx` exports `RemoveDialog` and `RemoveAction`, each with the props named in T012 to T014, so E1-S9 imports them by those names and no default export is needed; (b) `git status` lists only the three new source files and three new test files under `web/src/screens/research/universes/detail/`, the possible additive edits to `web/src/screens/research/copy.ts` (and at most the narrowing in `copy.test.ts` named in T010), `results-table.tsx` and `filters-pane.tsx` (T011, only the optional props), this plan and the TDD-evidence file; no change to `web/src/app/*`, `web/src/api/*` or any delivered CAP-001 file; (c) `npm run test -- results-table filters-pane` still passes unchanged, proving the seams are defaulted; (d) no route, no tab container and no detail header exists in these files (E1-S9 and E4-S10). Depends on T012 to T014.

**Checkpoint**: The tabs are importable by the detail screen and the change set is limited to the files above.

---

## Phase 5: Polish

**Purpose**: Whole-suite validation and TDD evidence.

- [ ] T016 Run every command in the Validation Plan from the repository root and fix any failure T002 to T015 introduced, including `npm run format` (Biome format check, no modification: format with `npx biome format --write` on the new files only if it reports differences) and `npx tsc --noEmit` under the repo's `strict`, `noUnusedLocals` and `noUnusedParameters`. Report the exclusions plainly if a command cannot run (`docs/constitution/tech-stack.md`: do not report a partial run as green).
- [ ] T017 After each TDD cycle in T002–T016 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E1-S8-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E1-S9 | reverse | Mounts `MembersTab` and `HistoryTab`, owns the tab container, the URL `as_of` and active tab, and supplies `onAsOfChange`, `onViewMembersAsOf`, `onMembershipChanged` and `onRetire`; graph: `E1-S9: [E1-S8, E4-S1, E4-S2]` |
| CAP-002-E1-S6 | soft | Serves `/api/universes/{id}`, `/events` and `DELETE .../members/{symbol}`; this story develops against classification-api section 2.7 through E4-S1's doubled client and imports nothing from the Python side; the contract is approved |
| CAP-002-E1-S7 | context | Builds the Universes list that navigates to the detail; shares the `copy.ts` additions and the `retire` vocabulary-scan narrowing (T010) but no import |
| CAP-002-E4-S4 | context | Not-current banner, as-of line and score-set poll are not in S8's dependencies or ACs; see Open Gaps |
| CAP-002-E4-S7 | context | Selection tray and inspector are not in S8's dependencies or ACs; see Open Gaps |
| CAP-002-E4-S9 | context | The Research screen composes the same table; no import in either direction |
| CAP-002-E4-S10 | context | Registers the routes; this story registers none |

Hard edges already in the graph and used: `CAP-002-E4-S1` (T001a: client, types, errors, imported by T012 to T014 and mocked in T002 to T009), `CAP-002-E4-S2` (T001b: `copy.ts`, `format.ts`, `research-query.ts`), `CAP-002-E4-S3` (T001c: `factor-cell.tsx` in T014), `CAP-002-E4-S5` (T001d: `filters-pane.tsx` in T014) and `CAP-002-E4-S6` (T001e: `results-table.tsx` in T014). No new hard dependency was found, so `dependencies.yaml` is unchanged (`CAP-002-E1-S8: [CAP-002-E4-S1, CAP-002-E4-S2, CAP-002-E4-S3, CAP-002-E4-S5, CAP-002-E4-S6]`); no cycle (E1-S9 depends on E1-S8, never the reverse).

### Task Dependencies
- T001: no dependencies (verification).
- T002 to T005 (`members-tab.test.tsx`), T006 and T007 (`remove-dialog.test.tsx`), T008 and T009 (`history-tab.test.tsx`): depend on T001 only; three files, so the three groups can run in parallel; within a file the tasks are applied in order.
- T010: depends on T001.
- T011: depends on T001; can run in parallel with T010.
- T012: depends on T010; T013: depends on T010; T014: depends on T010, T011, T012. T012 and T013 can run in parallel.
- T015: depends on T012, T013, T014.
- T016: depends on T015.
- T017: interleaved — runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities
- Phase 2: the three test files are independent.
- Phase 3: T010 and T011 in parallel; then T012 and T013 in parallel.

---

## Validation Plan

### Constitution-Defined Commands
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format`
- Type check (story-stated): `npx tsc --noEmit`

### Story-Specific Validation
- DAC-E1-S8-1: T002 shows `as_of` reaching the read and the label; `2026-13-40` is a field error with zero requests.
- DAC-E1-S8-2: T003 shows the did-not-exist sentence with the creation date, including the Chicago date boundary.
- DAC-E1-S8-3: T004 shows a retired member in the table with *Not followed* x3 and only universe-scoped list requests.
- DAC-E1-S8-4: T006 shows `blocked` Remove with adjacent **Retire…**, and `last_member` replacing the confirm.
- DAC-E1-S8-5: T007 shows `data-variant="confirm"`, the history-stays description and initial focus on Cancel.
- DAC-E1-S8-6: T008 and T009 show newest first, both names on a rename, and the old name found across a page boundary.
- Not covered here by design: Playwright specs `tests/e2e/universe-maintenance.spec.ts` (flow 6) need the real API, the routes (E4-S10) and the detail screen (E1-S9).

---

## Notes

### Resolved Conflicts

- **Which read serves the as-of table.** DAC-E1-S8-1 says the table "requests `as_of`"; classification-ui 2.3 sends the Members table to `GET /api/classifications`, whose query model (classification-api 2.4) has no `as_of`, while `GET /api/universes/{id}` accepts `as_of` and returns members with cells and `member_since`. The story AC governs over the diagram, and the approved API design determines which endpoint can honour it: the current view uses the list read, the as-of view the universe read. No source edit required. Recorded in DEC-0105.
- **`h1` on the Members panel.** UX design 1.4 writes the results `h1` as *{n} of {m} members match* (inherited from 1.1), while the same section makes the universe name the page `h1`. A page has one `h1`; the name governs (UX design Accessibility) and the count renders as the panel's `h2`. No source edit required.
- **Confirmation by toast.** UX design 1.4 and classification-ui 2.7 confirm a removal by `toast` `success`; no toast component exists and none is in any dependency. The announced text is delivered as a `role="status"` element (DEC-0107). Not a design defect: the toast spec is simply unbuilt.
- **Stale self-labels.** Both approved component designs consulted say `**Status:** draft` in the body while front matter is `approved`; front matter governs. No behavioural effect.

### Open Gaps

- **As-of view source, filters and creation date (PROVISIONAL — awaiting owner confirmation (2026-10-17)).** No artifact says whether thresholds, search and sort apply to a past-date view, and the only endpoint that takes `as_of` accepts none of them. The plan renders the returned members in one native table in the order returned, states that filters apply to current members only, and derives the creation date in the did-not-exist sentence as the America/Chicago calendar date of `created_at`. Derivation: classification-api 2.4 and 2.7; DEC-0065 and DEC-0103 for the Chicago rule; the volume cost of an unwindowed table is bounded by one universe's membership on one date. Decision: DEC-0105. Follow-up: classification-api may add `as_of` (and the filter set) to the list read, or return `created_on`; UX design 1.4 may state the as-of table's behaviour.
- **Seams in `results-table.tsx` and `filters-pane.tsx` (PROVISIONAL — awaiting owner confirmation (2026-10-17)).** Design 2.5 gives the table a scope, a *Member since* column and a row action, and the pane a *Members as of* field, but the E4-S5 and E4-S6 stories name none, and the list read's rows carry no `member_since`. T001 records what was delivered; T011 adds only the missing ones as additive defaulted optional props, and *Member since* is joined from the universe read. Decision: DEC-0106. Follow-up: the E4-S5/E4-S6 stories (or classification-ui 2.5) may name the parameters.
- **Removal confirmation and history paging (PROVISIONAL — awaiting owner confirmation (2026-10-17)).** No toast component is delivered, and the History panel's page size and the way a rename finds its old name across pages are unspecified. The plan uses a polite `role="status"` line, pages at 50 (the API default) with **Load more**, and auto-reads the next page only while a `renamed` row has no earlier name. Decision: DEC-0107. Follow-up: a toast pattern (UX design section 3) or a statement of the history page size.
- **Universe detail panes not in this story's scope (genuine backlog gap, no value adopted).** UX design 1.4 puts the not-current banner, the score-set as-of line, the selection tray with **Compare side by side** and the inspector on the Members panel. This story's description, dependencies (no E4-S4, E4-S7) and ACs cover the table, filters pane and factor cell only, and E1-S9 (header, dialogs) and E4-S9 (Research screen) do not claim them either. The plan builds none of them and does not invent an owner. Follow-up for the owner: assign these panes to E1-S9, E4-S9 or a new story at the next backlog revision; AC-16's "within a single universe" for compare and the inspector depends on it.
- **Names the producers fix, not this plan.** The fetch-layer function names, the error class, the `ResultsTable`/`FiltersPane` props and the copy keys belong to unplanned E4-S1, E4-S2, E4-S5 and E4-S6 and no approved artifact pins them. T001 reads them from the delivered files rather than this plan inventing them. Not an owner decision.

### Other Notes

- The register's claim that S8 hard-depends on `[E4-S1, E4-S2, E4-S3, E4-S5, E4-S6]` matches `dependencies.yaml`; confirmed. The register did not read the UI design, API design or test specs when built; this plan did, and found no contradiction with it. One addition for the register: the Members read split (list read for the current view, universe read for as-of and *Member since*), and `RemoveAction`/`RemoveDialog`, `MembersTab` and `HistoryTab` prop contracts above, which S9's planner should treat as pinned.
- E1-S9 must supply the host behaviour this plan relies on: it keeps `as_of` and the active tab in the URL, mounts `HistoryTab` fresh when the History tab is opened (so a removal made on Members shows in History without a refresh key), re-reads its header on `onMembershipChanged`, and opens its retire dialog from `onRetire`. Stated here so S9's plan can import it as the contract.
- Neighbouring stories, by full ID: CAP-002-E1-S6 serves the endpoints this story calls; CAP-002-E1-S7 builds the list that links to the detail; CAP-002-E4-S4 (banner, as-of line) and CAP-002-E4-S7 (tray, inspector) are the panes left unassigned in Open Gaps; CAP-002-E4-S9 composes the Research screen from the same table; CAP-002-E4-S10 registers the routes.
- Mapped test cases implemented here: TC-COMP-029, 043, 055, 056, 057, 119. TC-COMP-058 (retired universe readable with `universe_retired` wording) maps to DAC-E1-S9-5 and is E1-S9's; this story only renders the `universe_retired` sentence for a rejected remove (T005 f).
- The story names `members-tab.test.tsx` and `remove-dialog.test.tsx`; `history-tab.test.tsx` is added because TC-COMP-029 needs a home and no other file under `detail/` is assigned to the History tab (not a delivered test file, so DEC-0064 is unaffected).
- No story status change was made: the invoking instruction was to leave stories untouched, so `status: todo` stays for the owner or driver to move to `planning`.
- Decision records under this plan: DEC-0105, DEC-0106, DEC-0107 (all agent-decided, contained, provisional). A commit carrying this plan carries `Decision-Id:` trailers for all three.
- At planning time none of the E4 producers exist in the tree (`web/src/components/` and `web/src/screens/research/` are absent), so T001 is expected to STOP until E4-S1, E4-S2, E4-S3, E4-S5 and E4-S6 are implemented. This is the dependency order working as designed, not a defect in the plan.
