---
artifact_schema_version: 1
artifact_id: CAP-003-E5-S1-tasks
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
  timestamp: 2026-11-07T06:18:44Z
  source_artifacts:
    - id: CAP-003-E5-S1
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

# Tasks: CAP-003-E5-S1 — Home Header, Market State and the Home Copy Catalogue

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/home/stories/CAP-003-E5-S1.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `home-ui`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

The owner wants Home to open with one line that says what the rest of the screen is as of: today's date, the market state and how current prices are. This story creates the first three Home modules (component design `home-ui` 2.1, 2.3; UX design 1.3 Page Layout 1). `web/src/screens/home/market-state.ts` reads the America/Chicago wall clock from `Intl.DateTimeFormat` parts and exports `marketState(now)`: `closed` on Saturdays, Sundays and weekdays before 08:30 or from 15:00, `not_determinable` inside weekday 08:30 to 15:00, because without a trading calendar a holiday or early close cannot be told from a session (DEC-0206). `web/src/screens/home/header.tsx` exports `HomeHeader`: the `h1` *{Weekday}, {YYYY-MM-DD}* in America/Chicago with an English weekday (DEC-0209), and the generic `AsOfLine` (CAP-003-E1-S10) with three parts, *{market state} · prices current to {prices_as_of} · checked {time}*. *Market closed* is text; *Market state not determinable* is `NotDeterminable` (CAP-003-E1-S6) with the reason *FactorFlow has no trading calendar, so it can't tell a session from a holiday.* `prices_as_of` goes through `formatSessionDate`, unshifted, or reads *prices not downloaded yet* when null, and an em dash with hidden *not determinable* while the attention read fails. *checked {time}* is attention's `checked_at` through `formatClock`. A one-minute `setInterval` recomputes the date and market state from the clock with no read. `web/src/screens/home/copy.ts` holds every Home string the designs fix (home-ui 2.3 to 2.5 and §10; UX design 1.3), which CAP-003-E5-S2 and CAP-003-E5-S3 render. Its module shape is adopted provisionally as DEC-0362. No delivered file is edited.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-24 | The market state inside session hours renders as not determinable, never as open; the header's other states (loading, prices null, read failed) are rendered as designed | T002, T003, T005, T007, T009, T011 |
| AC-25 | The as-of line shows *checked {time}* from the attention read, and it ages while the read fails | T007, T011, T012 |
| AC-26 | The header is built from `ui-components` (`AsOfLine`, `NotDeterminable`, `Absent`, the formatters) and consumes theme tokens only | T007, T011, T012, T013 |
| DAC-E5-6 | The header renders the date as *{Weekday}, {YYYY-MM-DD}* and the market state as stated, across a DST change | T002, T004, T005, T009, T011 |
| DAC-E5-S1-1 | Saturday, Sunday, weekday 08:29 and 15:00 are `closed`; weekday 08:30 and 14:59 are `not_determinable`; the same across the March and November DST changes | T002, T003, T009 |
| DAC-E5-S1-2 | On 2026-10-15 the `h1` reads *Thursday, 2026-10-15*; `prices_as_of` renders unshifted through `formatSessionDate` | T004, T011 |
| DAC-E5-S1-3 | The header, its as-of line and the copy catalogue, in every state, contain none of the eight DAC-E7-3 terms; every label comes from `labelOf` or `copy.ts` | T006, T008, T010, T011 |
| DAC-E5-S1-4 | The market-state badge goes through `NotDeterminable` (`coverage-unknown`), not a tier; no state is conveyed by colour alone | T005, T011 |

Mapped test cases (from `tests/component/home-ui-tests.md` lines 142-224, confirmed in `tests/coverage-matrix.md` lines 244 and 250-253, which count this story "4 of 4"): **TC-COMP-132** (DAC-E5-S1-1, DAC-E5-6, AC-24), **TC-COMP-133** (DAC-E5-S1-2, DAC-E5-6, AC-24), **TC-COMP-134** (DAC-E5-S1-3, AC-19) and **TC-COMP-135** (DAC-E5-S1-4, AC-20). The other cases on the AC-24, AC-25 and AC-26 rows belong to sibling stories: TC-COMP-131 and TC-COMP-143 to CAP-003-E5-S2 and CAP-003-E5-S3, TC-COMP-138, TC-COMP-141 and TC-COMP-142 to the tile and the card, and TC-COMP-144 (the literal scan widened to `web/src/screens/home/`) to CAP-003-E5-S3. No mapped case covers the story's AC-25 or AC-26 directly, so T007 adds unit tests for both. No integration or end-to-end case is owned by this story. The test specification is `status: draft`. Its steps are used as written and sharpened below into literal assertions.

## Phase 1: Setup

**Purpose**: Confirm the hard dependencies are in the tree and record a green baseline.

- [ ] T001 From the repo root, confirm the producers this story imports exist with the shapes their plans fix: `web/src/app/shell-context.tsx` exports `useShell` (CAP-003-E3-S3); `web/src/app/shell-types.ts` exports `Attention` and `ReadState` (CAP-003-E3-S1); `web/src/components/patterns/presence.tsx` exports `Absent({ label })` and `NotDeterminable({ reason, label? })`, and `web/src/components/patterns/format.ts` exports `formatClock` and `formatSessionDate` (CAP-003-E1-S6, DEC-0309 and -2); `web/src/components/patterns/as-of-line.tsx` exports `AsOfLine` accepting `{ parts, className? }` (CAP-003-E1-S10, DEC-0315); `web/src/components/ui/badge.tsx` renders `data-variant` (CAP-003-E1-S1). If a producer's merged signature differs from the one named here, use the merged one and record the difference in this story's TDD evidence. Then run `npm run test` and record that it passes before any change. No package, configuration or token is added (traces to AC-26)

**Checkpoint**: Every producer is present and the Vitest suite is green.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin the market-state rule, the header's text and DOM in every state, and the catalogue's exact wording.

Shared harness for `web/src/screens/home/header.test.tsx` (T004–T007). Mock the shell with `const shell = vi.hoisted(() => ({ value: { attention: { kind: "loading" } } as unknown as ShellContextValue }))` and `vi.mock("../../app/shell-context", () => ({ useShell: () => shell.value }))`. This is the consumer seam CAP-003-E3-S3's plan names (`useShell()` throws without a provider, DEC-0326). Give `refresh` and `setTitleDetail` as `vi.fn()`. Fixtures are independent literals typed `Attention`, never produced by code under test:
- `ATTENTION`: `checked_at: "2026-10-15T22:52:10Z"` (17:52:10 CDT), `prices_as_of: "2026-10-14"`, `followed_count: 1236`, `credential_present: true`, `problems: { stock_count: 0, symbols: [], newest_completed_at: null }`, `latest_download: null`, `latest_terminal_download: null`, `items: []`.
- `OK`: `{ kind: "ok", data: ATTENTION, checkedAt: new Date("2026-10-15T22:53:41Z") }`. The client `checkedAt` differs from `checked_at` on purpose (see T007).
- `FAILED_WITH_LAST`: `{ kind: "error", error: new ApiUnreachableError("unreachable"), last: { data: { ...ATTENTION, checked_at: "2026-10-15T22:40:05Z" }, checkedAt: new Date("2026-10-15T22:40:06Z") } }`.
- `FAILED_NO_LAST`: the same error with `last: null`.
- `LOADING`: `{ kind: "loading" }`.

Fake timers: `vi.useFakeTimers()` and `vi.setSystemTime(<instant>)` in each case, `vi.useRealTimers()` in `afterEach`, and timers advanced inside `act` (delivered precedent `web/src/app/status-region.test.tsx` lines 31-32). Render `<HomeHeader />` inside `MemoryRouter`. Locate the line with `getByTestId("as-of-line")`. Compare its text after `textContent.replace(/\s+/g, " ").trim()`.

### Mandatory Component Tests

- [ ] T002 [P] Implement TC-COMP-132 (marketState closed outside session hours, not determinable inside, across DST) in a new `web/src/screens/home/market-state.test.ts`, with a `// Implements TC-COMP-132` comment, as an `it.each` over this literal table of UTC instants and their America/Chicago meaning.
  - March change (CST before 2026-03-08, CDT after):
    - Fri 2026-03-06: `14:29Z` 08:29 → `closed`; `14:30Z` 08:30 → `not_determinable`; `20:59Z` 14:59 → `not_determinable`; `21:00Z` 15:00 → `closed`.
    - Sat 2026-03-07 `18:00Z` (12:00 CST) → `closed`.
    - Sun 2026-03-08 `17:00Z` (12:00 CDT) → `closed`.
    - Mon 2026-03-09: `13:29Z` 08:29 → `closed`; `13:30Z` 08:30 → `not_determinable`; `19:59Z` 14:59 → `not_determinable`; `20:00Z` 15:00 → `closed`.
  - November change (CDT before 2026-11-01, CST after):
    - Fri 2026-10-30: `13:29Z` → `closed`; `13:30Z` → `not_determinable`; `19:59Z` → `not_determinable`; `20:00Z` → `closed`.
    - Sat 2026-10-31 `17:00Z` (12:00 CDT) → `closed`.
    - Sun 2026-11-01 `18:00Z` (12:00 CST) → `closed`.
    - Mon 2026-11-02: `14:29Z` → `closed`; `14:30Z` → `not_determinable`; `20:59Z` → `not_determinable`; `21:00Z` → `closed`.
  - The weekend instants are inside session hours on purpose, so only the weekday rule makes them `closed`.
  - Repeat the whole table inside `describe.each(["Asia/Tokyo", "UTC", "America/Los_Angeles"])`, which sets and restores `process.env.TZ` in `beforeEach`/`afterEach` exactly as `web/src/screens/research/format.test.ts` lines 159-170 do.
  - Kills:
    - off-by-one `>=` → `>` on the opening bound (08:30 rows turn `closed`);
    - off-by-one `<` → `<=` on the closing bound (15:00 rows turn `not_determinable`);
    - negate-boolean `||` → `&&` in the weekend test (Saturday 12:00 turns `not_determinable`);
    - swap-case `"Saturday"` → `"Friday"` (both Friday 08:30 rows turn `closed`);
    - remove-attribute of `timeZone: "America/Chicago"` (under TZ=Asia/Tokyo, Mon 2026-03-09 13:30Z reads 22:30 and turns `closed`);
    - a fixed `-06:00` offset, which fails the CDT Monday 13:30Z row, and a fixed `-05:00` offset, which fails the CST Friday 14:29Z row.
- [ ] T004 Implement TC-COMP-133 (Header date heading and unshifted prices as-of) in a new `web/src/screens/home/header.test.tsx`, with a `// Implements TC-COMP-133` comment, using the shared harness and `shell.value.attention = OK`.
  - At system time `2026-10-16T01:00:00Z`, which is Thursday 2026-10-15 20:00 CDT, `getByRole("heading", { level: 1 })` has text `"Thursday, 2026-10-15"`. The line's collapsed text is exactly `"Market closed · prices current to 2026-10-14 · checked 17:52:10 CDT"`.
  - At `2026-10-15T17:00:00Z` (12:00 CDT) the `h1` is again `"Thursday, 2026-10-15"`.
  - Inside a `describe.each(["Asia/Tokyo", "America/Los_Angeles"])` TZ block (same set/restore pattern), with `prices_as_of: "2026-03-08"` (the spring DST change), the line contains `"prices current to 2026-03-08"`. At `2026-10-15T17:00:00Z` the `h1` is `"Thursday, 2026-10-15"`.
  - Kills:
    - a heading built from UTC parts, which reads `"Friday, 2026-10-16"` at 01:00Z;
    - a heading built from machine-local parts, which reads Friday under Asia/Tokyo at 17:00Z;
    - swap-case `weekday: "long"` → `"short"`, which reads `"Thu, 2026-10-15"`;
    - a `prices_as_of` routed through `new Date(...)` and an instant formatter, which renders `2026-03-07` under America/Los_Angeles.
- [ ] T005 Implement TC-COMP-135 (Market-state badge through NotDeterminable with its shape) in `web/src/screens/home/header.test.tsx` (same file as T004, so sequential), with a `// Implements TC-COMP-135` comment, `shell.value.attention = OK`. Inside session hours, at `2026-10-15T17:00:00Z`:
  - `getByText("Market state not determinable")` is the badge element. It has `data-variant="coverage-unknown"` and the class `bg-pattern-indeterminate` (the non-colour cue, a hatch).
  - It `toHaveAccessibleDescription("FactorFlow has no trading calendar, so it can't tell a session from a holiday.")`, and that reason is also present as text in the line.
  - The `as-of-line` element contains no element whose `data-variant` starts with `status-` and no `svg`: not determinable is not a tier, so no tier shape renders (ui-components 2.3; Resolved Conflict 2 sharpens the TC's StatusBadge clause).
  - Outside hours, at `2026-10-16T01:00:00Z`, the line has the text `"Market closed"` and no element with a `data-variant` attribute.
  - The two states differ in words, not only in colour: the two texts are distinct literals, and *Market closed* is never in the badge.
  - Kills:
    - swap-case `NotDeterminable` → a `StatusBadge` tier (a `status-*` variant appears);
    - remove-attribute of the `reason` prop (no accessible description);
    - negate-boolean on the `marketState(now) === "closed"` branch (the outside-hours case shows the badge).
- [ ] T006 Implement TC-COMP-134 (Header, as-of line and copy use the display vocabulary) in `web/src/screens/home/header.test.tsx` (same file, after T005), with a `// Implements TC-COMP-134` comment.
  - Define `const TERMS = /\b(?:instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i`, the eight DAC-E7-3 terms as whole words in any case.
  - Header states: render `HomeHeader` in each of the ten combinations of {`2026-10-15T17:00:00Z` inside hours, `2026-10-16T01:00:00Z` outside} × {`LOADING`, `OK`, `OK` with `prices_as_of: null`, `FAILED_WITH_LAST`, `FAILED_NO_LAST`}. From each, collect the container's `textContent` and every `aria-label`, `title` and `alt` attribute value. Assert that `TERMS` matches none of them.
  - Catalogue: `import * as copy from "./copy"`. Walk every export recursively. Collect each string leaf. Call each function leaf with the arguments listed for its path in a literal `CALLS` map, which covers every branch T008 names. Assert:
    - the walk finds at least 40 strings, so the pass is not vacuous;
    - every function leaf's path has an entry in `CALLS`, so a later function cannot slip past the scan;
    - `TERMS` matches none of the strings.
  - Scanner control: `TERMS` matches `"Next run"`, `"RUNS"`, `"Provider Credential"`, `"instrument"` and `"Retired"`, and does not match `"running"`, `"Downloads"`, `"rerun"` or `"instruments"`. *instruments* is outside the DAC's list, and the research precedent at `web/src/screens/research/copy.test.ts` line 98 shows plural forms are listed separately.
  - "Every label is from `labelOf` or `copy.ts`" is asserted by building every expected string in T004, T005 and T007 from the literal wording, which T008 pins against `copy.ts`.
  - Kills: a copy mutant `pricesNotDownloaded: "prices not acquired yet"`, and a header mutant naming the as-of part *last run*. Both are caught by `TERMS`.

### Additional Unit Tests

- [ ] T003 [P] Add the wall-clock and second-granularity cases to `web/src/screens/home/market-state.test.ts` (same file as T002, so sequential with it), also inside T002's TZ `describe.each` (traces to DAC-E5-S1-1, DAC-E5-6, AC-24).
  - `chicagoWallClock(new Date("2026-10-16T01:00:00Z"))` `toEqual({ weekday: "Thursday", date: "2026-10-15", minutes: 1200 })`.
  - `chicagoWallClock(new Date("2026-10-16T05:00:00Z"))` `toEqual({ weekday: "Friday", date: "2026-10-16", minutes: 0 })`: midnight is `0`, never `1440`.
  - `marketState(new Date("2026-10-15T13:29:59Z"))` (08:29:59) is `"closed"`.
  - `marketState(new Date("2026-10-15T19:59:59Z"))` (14:59:59) is `"not_determinable"`.
  - `marketState(new Date("2026-10-15T20:00:00Z"))` (15:00:00) is `"closed"`.
  - Kills:
    - remove-attribute of `hourCycle: "h23"`: en-US falls back to a 12-hour clock, so 20:00 reads `08` and minutes `480`;
    - swap-case `"h23"` → `"h24"`: midnight reads `24`;
    - an implementation rounding seconds up to the next minute, which turns 14:59:59 into 15:00 → `closed`.
- [ ] T007 Add the freshness, failure, loading, tick and composition cases to `web/src/screens/home/header.test.tsx` (same file, after T006) (traces to AC-25, AC-24, AC-26, DAC-E5-6).
  - (a) *checked* from the read (AC-25): with `OK`, the line contains `"checked 17:52:10 CDT"` and not `"17:53:41"`. Kills drop-field-copy of `data.checked_at` in favour of the client `checkedAt` (the wrong-property trap: the two values differ by design).
  - (b) Aging while the read fails (AC-25; home-ui 2.3): with `FAILED_WITH_LAST`, the line contains `"checked 17:40:05 CDT"`.
    - The prices part reads `"prices current to"` followed by an element with `aria-hidden="true"` and text `"—"`, and an element with class `sr-only` and text `"not determinable"`.
    - The line does not contain `"2026-10-14"`, although `last.data.prices_as_of` is `"2026-10-14"`: the design renders an em dash while the read fails.
    - Kills a mutant that renders `last.data.prices_as_of`, and swap-case `Absent` → plain text `"—"` (no hidden words).
  - (c) Never answered: with `FAILED_NO_LAST`, the checked part reads `"checked"` followed by the aria-hidden `"—"` and the `sr-only` `"not determinable"`. The line's text contains no digit `0` (home-ui §3: never `0`).
  - (d) Prices not downloaded: with `OK` and `prices_as_of: null`, the line's collapsed text at `2026-10-16T01:00:00Z` is exactly `"Market closed · prices not downloaded yet · checked 17:52:10 CDT"`. Kills negate-boolean on the `prices_as_of === null` branch.
  - (e) Loading (home-ui §10 Loading):
    - with `LOADING`, the `h1` renders;
    - `getByTestId("home-as-of-skeleton")` has `aria-hidden="true"`;
    - `queryByTestId("as-of-line")` is null and the text contains no `"checked"`.
  - (f) Minute tick with no read (DEC-0206; story Implementation): spy `vi.spyOn(globalThis, "fetch")`.
    - At `2026-10-15T13:29:30Z` (08:29:30 CDT) the line reads `"Market closed"`. After `act(() => vi.advanceTimersByTime(60_000))` it shows the badge `"Market state not determinable"`.
    - At `2026-10-16T04:59:30Z` (23:59:30 CDT) the `h1` reads `"Thursday, 2026-10-15"`. After one 60 000 ms advance it reads `"Friday, 2026-10-16"`.
    - In both, `fetch`, `shell.value.refresh` and `shell.value.setTitleDetail` are never called.
    - Kills: off-by-one on the interval (`60_000` → `60_001` leaves the state unchanged after the advance); a `now` captured once outside state (never updates).
  - (g) Cleanup: record `vi.getTimerCount()` after the render settles, then `unmount()`; the count is exactly one lower. Kills removing `clearInterval` from the effect cleanup.
  - (h) Composition (AC-26):
    - with `OK`, `getByTestId("as-of-line")` is a `P` element with classes `text-xs` and `text-muted-foreground`;
    - it has exactly two child `span`s with classes `inline-block` and `px-2` and trimmed text `·` (the generic `AsOfLine` separators of CAP-003-E1-S10);
    - the `h1` has class `text-xl`;
    - `container.querySelectorAll("[style]")` is empty (no inline style, so no literal).
    - Kills: swap-case `AsOfLine` → a hand-joined string (no separator spans); remove-attribute of `text-xl`.
- [ ] T008 [P] Pin the catalogue's wording in a new `web/src/screens/home/copy.test.ts`. The story's Files list does not name this file. Its precedent is the delivered `web/src/screens/research/copy.test.ts`. Each assertion compares against an independent literal (traces to DAC-E5-S1-3; prerequisite for CAP-003-E5-S2's DAC-E5-2 and DAC-E5-4 and CAP-003-E5-S3's DAC-E5-1 and DAC-E5-7 to DAC-E5-11, which render these strings).
  - **Static strings.** Every static string listed in T010 equals its literal. One `toEqual` per group against a literal object.
  - **Templates:**
    - `HEADER.heading("Thursday", "2026-10-15")` is `"Thursday, 2026-10-15"`.
    - `ITEMS.data_problems.title`:
      - `(["KO"], 1)` is `"KO is missing data"`;
      - `(["KO", "TSLA"], 2)` is `"KO and TSLA are missing data"`;
      - `(["FBXX", "KO", "TSLA"], 3)` is `"FBXX, KO and TSLA are missing data"`;
      - `(["FBXX", "KO", "TSLA"], 4)` is `"FBXX, KO, TSLA and 1 more stock are missing data"`;
      - `(["FBXX", "KO", "TSLA"], 1239)` is `"FBXX, KO, TSLA and 1,236 more stocks are missing data"`.
    - `ITEMS.data_problems.body(1)` is `"Its scores show as Incomplete until the data is complete."`, and `body(3)` is `"Their scores show as Incomplete until the data is complete."`.
    - `ITEMS.data_problems.actionName(["KO", "TSLA", "FBXX"])` is `"Fix data for KO, TSLA and FBXX"`.
    - `ITEMS.download_not_complete.failedBody("The provider refused the request", "2026-10-15 17:46 CDT")` is `"The provider refused the request. Ended 2026-10-15 17:46 CDT."`.
    - `ITEMS.download_not_complete.interruptedBody("2026-10-15 17:46 CDT")` is `"FactorFlow restarted mid-download. Download again to pick up the rest. Ended 2026-10-15 17:46 CDT."`.
    - `ITEMS.first_download.body`:
      - `(12, 1236)` is `"12 of 1,236 stocks so far. Scores appear when it finishes."`;
      - `(0, 1)` is `"0 of 1 stock so far. Scores appear when it finishes."`;
      - `(5, null)` is `"Scores appear when it finishes."`.
    - `ITEMS.score_failed.body`:
      - `("The engine stopped", "2026-10-15 17:30 CDT")` is `"The engine stopped. Scores still show the set from the download started 2026-10-15 17:30 CDT."`;
      - `("The engine stopped", null)` is `"The engine stopped."`.
    - `DATA_TILE.firstDownloadRunning("2026-10-15 16:02 CDT")` is `"Your first download, started 2026-10-15 16:02 CDT, is running."`.
    - `DATA_TILE.ofFollowedStocksCurrent("1,236")` is `"of 1,236 stocks current"`.
    - `DATA_TILE.name("Mostly yes", "1,233", "1,236", "2026-10-15 17:46 CDT", "2026-10-15")` is `"Data: mostly yes. 1,233 of 1,236 stocks current. Scores 2026-10-15 17:46 CDT, prices 2026-10-15."`.
    - `DATA_TILE.firstDownloadName("2026-10-15 16:02 CDT")` is `"Data: your first download, started 2026-10-15 16:02 CDT, is running."`.
    - `DATA_TILE.readError("The server answered 500")` is `"Couldn't read the data summary: The server answered 500."`.
    - `NEEDS_YOU.heading(3)` is `"Needs you · 3"`.
    - `NEEDS_YOU.readError("The server answered 500")` is `"Couldn't read what needs you: The server answered 500."`.
  - Kills:
    - off-by-one on the `symbols.length === 1` and `stockCount > symbols.length` guards (one-symbol and four-stock cases);
    - swap-case `Its` ↔ `Their`;
    - negate-boolean on `total === null`;
    - negate-boolean on `setStartedAt === null`;
    - off-by-one on the singular guard `=== 1` (`"1 more stocks"` and `"of 1 stocks"`);
    - drop of the first-letter lowercasing in `DATA_TILE.name` (`"Data: Mostly yes."`).

**Checkpoint**: T002–T008 are written and fail, because `market-state.ts`, `copy.ts` and `header.tsx` do not exist.

---

## Phase 3: Core Implementation

**Purpose**: Create the three Home modules that make the Phase 2 tests pass.

- [ ] T009 Create `web/src/screens/home/market-state.ts`, per DEC-0362 (Open Gap 1), which makes T002 and T003 pass.
  - Export `type MarketState = "closed" | "not_determinable"` and `interface ChicagoWallClock { weekday: string; date: string; minutes: number }`.
  - One module-level `Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "long", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })`.
  - `chicagoWallClock(now: Date): ChicagoWallClock` reads `formatToParts` and returns:
    - `weekday`: the English weekday;
    - `date`: `${year}-${month}-${day}`;
    - `minutes`: `hour * 60 + minute`.
  - `marketState(now: Date): MarketState` returns `"closed"` when `weekday` is `"Saturday"` or `"Sunday"`. Otherwise it returns `"not_determinable"` when `SESSION_OPENS <= minutes && minutes < SESSION_CLOSES`, with module constants `SESSION_OPENS = 8 * 60 + 30` and `SESSION_CLOSES = 15 * 60`, and `"closed"` otherwise.
  - The module doc comment cites DEC-0206, DAC-E5-6, DAC-E5-S1-1, component design `home-ui` 2.3 and system design open question 9 (no trading calendar). It states that the rule reads the clock only and never the viewer's machine zone.
  - No `toLocale*` call or word appears anywhere in the file, comments included, so the Validation Plan grep cannot contradict this task.
- [ ] T010 [P] Create `web/src/screens/home/copy.ts`, per DEC-0362, which makes T008 and the catalogue half of T006 pass. It is grouped `as const` objects in the shape of the delivered `web/src/screens/research/copy.ts`. Each member carries a doc comment citing its section. The only import is `formatCount` from `../../components/patterns/format` (CAP-003-E1-S6). A private `listOf(items)` builds `"A"`, `"A and B"`, `"A, B and C"` (the delivered research helper, restated because a screen must not import another screen).
  - **Top level:**
    - `NOT_DETERMINABLE = "not determinable"`: the hidden words of every Home em dash (home-ui 2.3, 2.4, §10 Accessibility).
    - `CHECKED = "checked"`.
    - `TRY_AGAIN = "Try again"`.
  - **`HEADER`** (home-ui 2.3; UX 1.3 Page Layout 1):
    - `heading(weekday, date)` → `` `${weekday}, ${date}` ``;
    - `marketClosed: "Market closed"`;
    - `marketNotDeterminable: "Market state not determinable"`;
    - `noTradingCalendar: "FactorFlow has no trading calendar, so it can't tell a session from a holiday."`;
    - `pricesCurrentTo: "prices current to"`;
    - `pricesNotDownloaded: "prices not downloaded yet"`.
  - **`DATA_TILE`** (home-ui 2.4, §10; UX 1.3 Page Layout 2 and Accessibility; epic DAC-E5-2, DAC-E5-11; Resolved Conflict 3):
    - `title: "Data"`;
    - `ofFollowedStocksCurrent(followed)` → `` `of ${followed} stocks current` ``. The caller puts the current figure, or `Absent`, before it;
    - `scores: "Scores"` and `prices: "Prices"`, the as-of labels;
    - `scope: "Every other number on this page is as of those times."`;
    - `firstDownloadRunning(time)` → *Your first download, started {time}, is running.*;
    - `readError(reason)` → *Couldn't read the data summary: {reason}.*;
    - `name(label, current, followed, scores, prices)` → *Data: {label with its first letter lower-cased}. {current} of {followed} stocks current. Scores {scores}, prices {prices}.*;
    - `firstDownloadName(time)` → *Data: your first download, started {time}, is running.*
  - **`NEEDS_YOU`** (home-ui 2.5, §10; UX 1.3 Page Layout 3 and States):
    - `title: "Needs you"`;
    - `heading(count: number)` → `` `Needs you · ${formatCount(count)}` ``;
    - `subLine: "Most important first. Nothing here is urgent unless marked."`;
    - `nothingNeedsYou: "Nothing needs you right now."`;
    - `readError(reason)` → *Couldn't read what needs you: {reason}.*
  - **`EMPTY_STATE`** (epic DAC-E5-1; UX 1.3 States):
    - `title: "No data has been downloaded yet."`;
    - `body: "Set up FactorFlow to name the stocks to follow and start the first download."`;
    - `action: "Start setup"`.
  - **`ITEMS`**, keyed by the six kind names of component design `ui-components` 2.6 (`data_problems`, `download_not_complete`, `credential_missing`, `first_download`, `first_scores`, `score_failed`; home-ui 2.5 table; UX 1.3 catalogue; DEC-0203, DEC-0216). It is not typed by CAP-003-E1-S8's `NeedsYouKind` (Open Gap 1).
    - `data_problems`:
      - `tag: "Data"`;
      - `title(symbols: readonly string[], stockCount: number)`: one symbol gives *{A} is missing data*; two or three give `` `${listOf(symbols)} are missing data` ``; when `stockCount > symbols.length`, it gives *{symbols joined by ", "} and {formatCount(k)} more {k === 1 ? "stock" : "stocks"} are missing data* with `k = stockCount - symbols.length`;
      - `body(stockCount)`: *Its…* when `stockCount === 1`, else *Their scores show as Incomplete until the data is complete.*;
      - `action: "Fix data"`;
      - `actionName(symbols)` → `` `Fix data for ${listOf(symbols)}` ``.
    - `download_not_complete`:
      - `tag: "Download"`;
      - `failedTitle: "The last download failed"` and `interruptedTitle: "The last download was interrupted"`;
      - `failedBody(reason, endedAt)` → *{reason}. Ended {endedAt}.*;
      - `interruptedBody(endedAt)` → *FactorFlow restarted mid-download. Download again to pick up the rest. Ended {endedAt}.*;
      - `action: "See download"`;
      - `failedActionName: "See the download that failed"`.
    - `credential_missing`:
      - `tag: "Setup"`;
      - `title: "The market data key is missing"`;
      - `body: "Set FACTORFLOW_MASSIVE_API_KEY and restart FactorFlow. Downloads fail until then."`;
      - `action: "Open Settings"`;
      - `actionName: "Open Settings to set the market data key"`.
    - `first_download`:
      - `tag: "Download"`;
      - `title: "Your first download is running"`;
      - `body(done: number, total: number | null)`: `total === null` gives *Scores appear when it finishes.* alone (DEC-0213 f); otherwise *{formatCount(done)} of {formatCount(total)} {total === 1 ? "stock" : "stocks"} so far. Scores appear when it finishes.*;
      - `action: "See download"`.
    - `first_scores`:
      - `tag: "Scores"`;
      - `title: "Your first scores are being produced"`;
      - `body: "Scores appear when this finishes."`;
      - `action: "See download"`.
    - `score_failed`:
      - `tag: "Scores"`;
      - `title: "The latest score update failed"`;
      - `body(reason, setStartedAt: string | null)`: `null` gives *{reason}.* alone; otherwise *{reason}. Scores still show the set from the download started {setStartedAt}.*;
      - `action: "See details"`.
  - **Left out on purpose** (Open Gap 1; Other Notes): tier and status labels, which `labelOf` owns (CAP-003-E1-S5: *Downloading*, *Interrupted*, *Failed*, *Not reflecting the latest download*, *Score update failed*, *No scores yet*, *Updating*); the answer words *Yes*, *Mostly yes* and *No*, which `worstDataTier`'s `DataAnswer.word` owns (CAP-003-E1-S7); route targets, which `deriveNeedsYou` and the router own; and the strings no artifact fixes (Open Gap 2).
  - Doc comments name no unit or hex literal: CAP-003-E5-S3 adds this directory to the literal scan, comments included.
- [ ] T011 Create `web/src/screens/home/header.tsx` (depends on T009, T010), which makes T004–T007 pass. Export `function HomeHeader(): JSX.Element`, which takes no props (DEC-0362).
  - **Data.** It reads `const { attention } = useShell()` (`../../app/shell-context`) and nothing else from the context.
  - **Clock.** A module-private hook `useMinuteClock(): Date` holds `useState(() => new Date())`. In a `useEffect` it starts `setInterval(() => setNow(new Date()), MINUTE_MS)` and returns `() => clearInterval(timer)`, with `const MINUTE_MS = 60_000`.
  - **Layout.** It renders `<header>`, which contains:
    - `<h1 className="text-xl">{HEADER.heading(weekday, date)}</h1>`, from `chicagoWallClock(now)`;
    - then, while `attention.kind === "loading"`, `<div data-testid="home-as-of-skeleton" aria-hidden="true" className="min-h-7 w-full animate-pulse rounded bg-secondary" />`. This is the delivered as-of skeleton classes of `as-of-line.tsx` lines 154-158, and home-ui §10's "skeleton header line";
    - otherwise `<AsOfLine parts={[market, prices, checked]} />` from `../../components/patterns/as-of-line`.
  - **The three parts:**
    - `market`: `HEADER.marketClosed` as text when `marketState(now) === "closed"`, else `<NotDeterminable label={HEADER.marketNotDeterminable} reason={HEADER.noTradingCalendar} />`. It is never a `StatusBadge` (ui-components 2.3: not determinable is not a tier; Resolved Conflict 2).
    - `prices`:
      - with `attention.kind === "ok"` and a non-null `prices_as_of`: `` `${HEADER.pricesCurrentTo} ${formatSessionDate(attention.data.prices_as_of)}` ``;
      - with `ok` and a null `prices_as_of`: `HEADER.pricesNotDownloaded`;
      - with `error`: `<>{HEADER.pricesCurrentTo} <Absent label={NOT_DETERMINABLE} /></>`, whatever `last` holds (home-ui 2.3).
    - `checked`:
      - `` `${CHECKED} ${formatClock(data.checked_at)}` ``, with `data` being `attention.data` when `ok` and `attention.last.data` when `error` with a `last`. It is the server's `checked_at`, never the client `checkedAt` (home-ui 2.3);
      - `<>{CHECKED} <Absent label={NOT_DETERMINABLE} /></>` when `error` with `last: null` (home-ui §3: any figure whose read fails renders through `Absent` or `NotDeterminable`, never `0`).
  - **Doc comment.** The module doc comment cites component design `home-ui` 2.3 and §10, UX design 1.3 Page Layout 1, DEC-0206, DEC-0209, AC-24, AC-25, AC-26 and DEC-0362. It states that the header makes no read of its own.
  - **Forbidden words and classes.** No comment or code in the file uses the words `fetch` or `refresh`, so the Validation Plan grep cannot contradict this task. No `--gain`, `--loss`, inline `style`, or unit or hex literal appears anywhere.

**Checkpoint**: T002–T008 pass.

---

## Phase 4: Integration

**Purpose**: Prove the new screen modules sit inside the delivered and shared checks, with no delivered file touched.

- [ ] T012 Run `npm run test` and confirm the whole suite is green, including the following, unchanged:
  - `web/src/components/token-literals.test.ts`: CAP-003-E1-S1's scan, and CAP-003-E3-S2's layout rule, which already walks all of `web/src/` and so covers `web/src/screens/home/`;
  - `web/src/components/patterns/as-of-line.test.tsx`;
  - `web/src/components/patterns/presence.test.tsx`;
  - `web/src/components/patterns/format.test.ts`;
  - `web/src/api/render.test.tsx` (no `dangerouslySetInnerHTML`).

  Then confirm that this story touched no delivered or producer file: `git diff --exit-code -- web/src/app web/src/components web/src/api package.json tailwind.config.js design-system` exits 0, and `git status --short web/` lists only the six new files under `web/src/screens/home/` (traces to AC-26, AC-25)

**Checkpoint**: The Vitest suite is green, and only `market-state.ts`, `market-state.test.ts`, `copy.ts`, `copy.test.ts`, `header.tsx` and `header.test.tsx` are new.

---

## Phase 5: Polish

**Purpose**: Validation commands and TDD evidence.

- [ ] T013 Run `npm run lint`, `npm run format`, `npx tsc --noEmit` and `npm run build` from the repo root.
  - Fix format findings with `npx biome format --write web/src/screens/home`.
  - The test files are type-checked too, which proves the `Attention` fixtures match CAP-003-E3-S1's type.
  - Fix findings in this story's six files only (traces to AC-26)
- [ ] T014 After each TDD cycle in T002–T013 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E5-S1-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`; no per-cycle commit is planned. Cycles: (1) T002 + T003 + T009, the market state; (2) T008 + T010, the catalogue; (3) T004–T007 + T011, the header; T012–T013 add no behaviour and join cycle 3's validation evidence (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E3-S3 | hard | `header.tsx` imports `useShell` from `web/src/app/shell-context.tsx` (existing graph edge) |
| CAP-003-E3-S1 | hard | `header.tsx` and `header.test.tsx` import the types `Attention` and `ReadState` from `web/src/app/shell-types.ts`, which this story creates. The edge is new in the graph, although CAP-003-E3-S3 already orders it transitively |
| CAP-003-E1-S6 | hard | `header.tsx` imports `Absent`, `NotDeterminable`, `formatClock` and `formatSessionDate`, and `copy.ts` imports `formatCount` (existing graph edge) |
| CAP-003-E1-S10 | hard | `header.tsx` renders the generic `AsOfLine` `parts` form (existing graph edge) |
| CAP-003-E1-S1 | hard | The `coverage-unknown` `badge` reached through `NotDeterminable`, and the `data-variant` attribute T005 asserts (existing graph edge) |
| CAP-003-E1-S5 | context | DAC-E5-S1-3 and DAC-E5-S1-4 name `labelOf` and `StatusBadge`. The header renders no tier, because the market state is not determinable (Resolved Conflict 2), and `copy.ts` leaves `labelOf`'s labels to it. Nothing is imported |
| CAP-003-E1-S7 | context | The answer words *Yes*, *Mostly yes* and *No* are `DataAnswer.word`, so `copy.ts` does not restate them. Nothing is imported |
| CAP-003-E1-S8 | soft | `ITEMS` is keyed by the six kind names component design `ui-components` 2.6 pins. `NeedsYouKind` is not imported, so the two develop against the approved design concurrently |
| CAP-003-E3-S2 | context | Its layout-literal rule in `token-literals.test.ts` walks all of `web/src/`, so it checks this story's files. Nothing is imported |
| CAP-003-E5-S2 | reverse | The data tile renders `DATA_TILE`, `NOT_DETERMINABLE` and `TRY_AGAIN` from `copy.ts` (graph: E5-S2 → E5-S1) |
| CAP-003-E5-S3 | reverse | `HomeScreen` renders `HomeHeader`, and the card renders `NEEDS_YOU`, `ITEMS`, `EMPTY_STATE` and `TRY_AGAIN`. It also widens the literal scan to this directory (graph: E5-S3 → E5-S1) |

New hard edge added to `dependencies.yaml`: `CAP-003-E5-S1 → CAP-003-E3-S1`.

### Task Dependencies

- T001: No dependencies
- T002 → T003: same file, sequential; after T001
- T004 → T005 → T006 → T007: same file, sequential; after T001
- T008: after T001; parallel with the two chains above
- T009: Depends on T002, T003 (makes them pass)
- T010: Depends on T008 (makes it pass); parallel with T009
- T011: Depends on T004–T007, T009, T010
- T012: Depends on T011
- T013: Depends on T012
- T014: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities

- Phase 2: the `market-state.test.ts` chain (T002, T003), the `header.test.tsx` chain (T004–T007) and `copy.test.ts` (T008) touch different files
- Phase 3: T009 and T010 in parallel; T011 after both

---

## Validation Plan

### Constitution-Defined Commands

(`docs/constitution/tech-stack.md` v7 Validation Commands, working directory `.`)

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit`

### Story-Specific Validation

- DAC-E5-S1-1 / DAC-E5-6: T002 and T003 pass, inside the TZ block too. `grep -n "toLocale" web/src/screens/home/market-state.ts` prints nothing; T009 forbids the word in comments too.
- DAC-E5-S1-2: T004 passes. `grep -n "formatSessionDate(" web/src/screens/home/header.tsx` prints at least one line, so the price date goes through the shared formatter.
- DAC-E5-S1-3: T006 and T008 pass.
- DAC-E5-S1-4: T005 passes.
- AC-25 and no read: T007 (a)–(c) and (f) pass. `grep -nE "fetch|refresh" web/src/screens/home/header.tsx web/src/screens/home/market-state.ts` prints nothing; T011 forbids both words in that file.
- AC-26:
  - T007 (h) passes.
  - `grep -nE "[0-9]+(px|rem|em|vh|vw)\b|#[0-9a-fA-F]{3,8}\b|(rgb|hsl)a?\(" web/src/screens/home/header.tsx web/src/screens/home/market-state.ts web/src/screens/home/copy.ts` prints nothing. This is CAP-003-E1-S1's literal set, applied ahead of CAP-003-E5-S3 adding the directory to the scan.
  - `grep -nE -- "--gain|--loss" web/src/screens/home/header.tsx` prints nothing.
- No delivered file changed: T012's `git diff --exit-code` exits 0.

---

## Notes

### Resolved Conflicts

1. **15:00 itself: DEC-0206 says "after 15:00", the designs say "from 15:00".** DEC-0206's decision line closes the market "on weekdays before 08:30 or after 15:00 CT". Component design `home-ui` 2.3, UX design 1.3 and epic DAC-E5-6 close it "from 15:00". Story DAC-E5-S1-1 is explicit: "a weekday 15:00 … Then each is `closed`; given … 14:59, Then `not_determinable`". **Governing: epic DAC-E5-6 and story DAC-E5-S1-1** (acceptance criteria over a decision's prose, which the designs and the epic restate as *from*). 15:00:00 is `closed` (T002, T003).
2. **"Each goes through `StatusBadge`" vs "not determinable is not a tier".** DAC-E5-S1-4 and TC-COMP-135 carry the shared template clause "each goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`". Their own subject is the market-state badge "`coverage-unknown` through `NotDeterminable`". Component design `ui-components` 2.3 says "Not determinable is not a tier: it renders through `NotDeterminable`, never through `tierOf`". The header renders no tier, so the `StatusBadge` clause has nothing to apply to. **Governing: the story's own clause "a value no artifact can determine goes through `NotDeterminable`" plus `ui-components` 2.3.** This is the reading coverage-matrix note 7 gives the same template in three other stories. T005 asserts that the badge is `coverage-unknown` with its pattern, and that no `status-*` variant or tier shape renders.
3. **Where the reason sits.** Component design `home-ui` 2.3 and UX design 1.3 give the not-determinable badge "the tooltip and visually hidden text" *FactorFlow has no trading calendar…*, and the story Description says "hidden text". Story DAC-E5-S1-4 requires the badge to go through `NotDeterminable`. CAP-003-E1-S6's plan renders that reason as visible text beside the badge and as its accessible description (that plan's Resolved Conflict 2; DEC-0310). It has no hidden-only or tooltip mode. **Governing: story DAC-E5-S1-4** over the design's rendering detail. A screen reader still receives the reason as the badge's description (T005), and a sighted owner sees it without hovering, which meets the design's intent. Follow-up for `home-ui` 2.3 at its next revision: say "with its reason (`NotDeterminable`)" instead of "tooltip and visually hidden text".
4. **The first-download sentence and the tile's name in that state.** UX design 1.3 (Page Layout 2, States and Accessibility) writes *The first download, started {start time}, is running.* and the name *Data: downloading. The first download, started …, is running.* Epic DAC-E5-2 and component design `home-ui` 2.4 write *Your first download, started {YYYY-MM-DD HH:MM zone}, is running.* `home-ui` §10 names the tile *Data: your first download, started …, is running.* The epic NFR names it "by its title and sentence". **Governing: epic DAC-E5-2 and the epic Accessibility NFR**, with `home-ui` §10 for the exact name. `copy.ts` holds `DATA_TILE.firstDownloadRunning` and `DATA_TILE.firstDownloadName` in that form (T010).
5. **The header's states.** The story lists the market states and the three `prices_as_of` renderings. `home-ui` §10 also gives a loading state ("Skeleton header line") and "*checked {time}* ages while attention fails". **Governing: `home-ui` 2.3, §3 and §10**, which the story's AC-24 and AC-25 point to. Loading renders the `h1` and a skeleton as-of line (T007 (e)). A failed read with a last answer shows that answer's `checked_at` (T007 (b)). A failed read with no answer ever shows `Absent` for *checked* (T007 (c)), by §3's rule that "any figure whose read fails" renders through `Absent` or `NotDeterminable`, never `0`. While the read fails, the price date is an em dash even when a last answer holds one, as §2.3 writes it.
6. **Singular nouns in the catalogue.** home-ui 2.5 writes *{k} more stocks* and *{done} of {total} stocks so far* in the plural only. Epic DAC-E5-7 requires "plural forms MUST follow the count". **Governing: epic DAC-E5-7.** The noun follows the number that counts it: *1 more stock* and *of 1 stock so far* (T008, T010). The verb of the data title stays *are*, because at least four stocks are named or counted. The tile's *of {followed} stocks current* has no plural rule in any criterion, so it stays as written.

### Open Gaps

1. **`copy.ts`'s module interface and the header's export. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0362.**
   - **What is undetermined.** Component design `home-ui` 2.1 places "item titles, bodies, actions and every other string" in `copy.ts`, and the story assigns it "the item titles, bodies and actions of home-ui 2.5 and every other string of UX design 1.3". No artifact names the module's exports, how templates take their values, what `header.tsx` exports, or where the America/Chicago wall clock is read.
   - **What the plan adopts (T009, T010, T011).**
     - `copy.ts` exports the groups `HEADER`, `DATA_TILE`, `NEEDS_YOU`, `EMPTY_STATE` and `ITEMS`, plus `NOT_DETERMINABLE`, `CHECKED` and `TRY_AGAIN`, with the members T010 lists.
     - Plain strings are constants. A part that may be an em dash is a prefix constant (`HEADER.pricesCurrentTo`, `CHECKED`, `DATA_TILE.scores`, `DATA_TILE.prices`, `DATA_TILE.ofFollowedStocksCurrent`), so a caller can place `Absent` beside it.
     - Templates take times and dates already formatted, and take counts as numbers wherever plurality depends on them, formatting those numbers with `formatCount`.
     - `ITEMS` is keyed by the six kind names of `ui-components` 2.6 without importing `NeedsYouKind`.
     - `copy.ts` holds no tier label (`labelOf`'s), no answer word (`DataAnswer.word`) and no route.
     - `header.tsx` exports `HomeHeader()`, which takes no props and reads `useShell().attention`.
     - `market-state.ts` exports `MarketState`, `marketState(now: Date)`, `ChicagoWallClock` and `chicagoWallClock(now: Date)`.
   - **Derivation.**
     - The delivered CAP-002 catalogue `web/src/screens/research/copy.ts` is grouped `as const` objects of constants and template functions, each citing its section, with a `listOf` helper and with labels owned elsewhere left out. That module states "a message a later story needs and no design contains is added with a doc comment saying so", which is the rule Open Gap 2 follows.
     - Labels and answer words already have one owner in `ui-components` 2.3 and 2.4, and DAC-E5-S1-3 itself says a label comes "from `labelOf` or this component's `copy.ts`".
     - Prefix constants are the minimum that lets `Absent` stand in for a value inside a sentence (home-ui 2.3, 2.4).
     - One `Intl.DateTimeFormat` read of weekday, date and minutes serves both the `h1` and `marketState`, so the two can never disagree about which day it is.
   - **Alternatives rejected.**
     - A flat key-to-string map: it cannot hold the plural and dropped-clause rules of home-ui 2.5.
     - Restating `labelOf`'s labels in `copy.ts`: two sources for one label.
     - Typing `ITEMS` by `NeedsYouKind`: a new hard edge on CAP-003-E1-S8 for a type alone.
     - A `now` prop on `HomeHeader`: fake timers already control the clock, and `HomeScreen` has no clock of its own to pass.
   - **Klass.** Propagating. CAP-003-E5-S2 and CAP-003-E5-S3 import these names, and CAP-003-E5-S3 mounts `HomeHeader`.
   - **Owning design to absorb it.** Component design `home-ui` 2.1 should state the module exports at its next revision.
2. **Strings no artifact fixes are not in `copy.ts`.** This is not an adopted value. These strings belong to the stories whose criteria need them, and those stories add them to `copy.ts` with a doc comment, per the research catalogue's rule:
   - the accessible names of the actions beyond the three examples: the interrupted download, `first_download`, `first_scores`, `score_failed`, and `data_problems` beyond three symbols (DAC-E5-8; CAP-003-E5-S3);
   - the rendering of a null `failure_reason` or a null score `reason` in a body (CAP-003-E5-S3);
   - whether *Needs you · 0* shows when the list is empty (CAP-003-E5-S3);
   - the polite announcement's wording for a changed count (DAC-E5-9; CAP-003-E5-S3);
   - the tile's name when one of its figures is an em dash (DAC-E5-S2-3; CAP-003-E5-S2).
   
   This story's criteria require none of them. Owning design: component design `home-ui` 2.5 and §10 at their next revision.

### Other Notes

- **`copy.test.ts` is beside the Files list.** The story names `header.test.tsx` and `market-state.test.ts` only. `copy.ts`'s template rules are new behaviour, and TDD needs a failing test before they exist. The delivered `research/copy.test.ts` is the precedent. No other unlisted file is created.
- **The credential body's variable name.** home-ui 2.5 sets `FACTORFLOW_MASSIVE_API_KEY` in code style. `copy.ts` holds the sentence as plain text, and CAP-003-E5-S3 decides whether to render the name in a `code` element. The name is the variable's, never the key's value (home-ui §4; AC-4).
- **Minute alignment.** The interval starts at mount, so the market state can change up to 59 seconds after 08:30 or 15:00. "Recomputed each minute" (home-ui 2.3) and the story's "`setInterval` of one minute" ask no more. Aligning to the wall-clock minute would add a timeout chain that nothing requires.
- **DEC-0209 is open.** Its record is `status: open` with no owner verdict. Every design and the epic apply it, and epic Open Questions mark it "Blocks: nothing", so the `h1` is *Thursday, 2026-10-15*. If the owner reverses it, only `HEADER.heading` and T004's literal change.
- **`date` from the wall clock, not `formatInstant`.** `ui-components` 2.5 requires `formatInstant` for times. The `h1` is a calendar date with a weekday, not a time, and `chicagoWallClock` builds it from the same `Intl` parts `format.ts` uses, in `en-US` with `timeZone: "America/Chicago"`.
- **Screen readers hear the reason once as description and once as text.** That follows from CAP-003-E1-S6's `NotDeterminable`. It is not changed here.
- **The literal scan.** `web/src/screens/home/` joins CAP-003-E1-S1's `SCANNED_DIRECTORIES` in CAP-003-E5-S3 (DAC-E5-S3-4, TC-COMP-144). Until then the Validation Plan grep stands in. CAP-003-E3-S2's layout rule already covers the directory.
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `web/src/screens/home/market-state.ts`: `timeZone: "America/Chicago",` → (deleted)
  - `web/src/screens/home/market-state.ts`: `hourCycle: "h23",` → (deleted)
  - `web/src/screens/home/market-state.ts`: `minutes < SESSION_CLOSES` → `minutes <= SESSION_CLOSES`
  - `web/src/screens/home/header.tsx`: `formatClock(data.checked_at)` → `formatClock(attention.checkedAt)` (where in scope)
  - `web/src/screens/home/header.tsx`: `return () => clearInterval(timer);` → `return undefined;`
  - `web/src/screens/home/header.tsx`: `<NotDeterminable label={HEADER.marketNotDeterminable} reason={HEADER.noTradingCalendar} />` → `HEADER.marketNotDeterminable`
  - `web/src/screens/home/copy.ts`: `k === 1 ? "stock" : "stocks"` → `"stocks"`
  - `web/src/screens/home/copy.ts`: `"prices not downloaded yet"` → `"prices not acquired yet"` (vocabulary scan, T006)
