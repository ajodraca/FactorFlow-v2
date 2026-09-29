---
artifact_schema_version: 1
artifact_id: CAP-001-E6-S4-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-29
updated: 2026-09-29
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: devin
  tool: Devin
  tool_version: unknown
  timestamp: 2026-09-29T02:43:47Z
  source_artifacts:
    - id: CAP-001-E6-S4
      version: "1"
    - id: CAP-001-E6
      version: "1"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-component-design-coverage-service
      version: "6"
    - id: CAP-001-component-design-ingestion-api
      version: "6"
    - id: CAP-001-component-tests
      version: "1"
    - id: CAP-001-E6-S3-tasks
      version: "1"
    - id: CAP-001-E5-S6-tasks
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E6-S4 — Coverage Screen

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S4.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E6-tasks`
**Date**: 2026-09-29

## Summary

This story delivers `web/src/screens/coverage/`, the screen that tells the owner which
instruments they can rely on without reading the data itself (AC-7, AC-8, AC-17, AC-21,
AC-22). It replaces the `/coverage` placeholder in `web/src/app/routes.tsx`. The screen
reads `GET /api/coverage` (CAP-001-E6-S3) through a new typed client call, and it
fetches only on mount, on a filter or page change, or on a manual Refresh. It never
polls, and it shows a last-updated time (DAC-E6-13).

Each row shows:

- lifecycle, using the existing `LifecycleBadge`;
- presence for each of the four data types, as three distinct badges;
- the covered range, as unconverted session dates;
- a gap count;
- a *Short by n years* depth marker;
- last acquired, in America/Chicago.

Absent values, measured zeros and inapplicable cells render three different ways
(STD-UI-4). When gap detection is unavailable, the Gaps column shows *Unknown* with the
indeterminate pattern and the reason, and never a zero (DAC-E6-4). Specific gap dates
sit behind row expansion. They come from S3's provisional `expand=<symbol>` parameter,
and each is fetched once, when the owner opens a row (Open Gap 1).

Never-acquired and nothing-matched have different copy. The never-acquired state offers
the Start action that CAP-001-E5-S6 delivers. The table scrolls inside its own
container. Filtering is server-side and pages replace each other, so the DOM stays
bounded at 3000 instruments. When every instrument is short of the stated depth by the
same amount, one sentence says this is a plan limit, not a data gap (DAC-E6-S4-6).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-7 | Each instrument shows data-type presence, covered range and last-acquired | T001, T002, T003, T005, T012, T014, T015, T017, T018, T019 |
| AC-8 | Gap count in the row; specific dates behind expansion | T003, T006, T010, T012, T013, T017, T023 |
| AC-17 | Nothing acquired → says so, never empty-and-healthy | T005, T013, T018 |
| AC-21 | Retired instruments show retained coverage, marked distinctly | T005, T014, T017 |
| AC-22 | Short of stated depth → *Short by n years* | T005, T013, T014, T017 |
| DAC-E6-4 | Detection unavailable → reason shown, no zero count | T005, T010, T013, T014, T017 |
| DAC-E6-13 | No auto-poll; last-updated time shown | T007, T018, T023 |
| DAC-E6-S4-1 | Em dash for absent, `0` for measured zero, blank for inapplicable, visually distinct | T001, T008, T010, T015 |
| DAC-E6-S4-2 | ISO-8601; session dates unconverted; timestamps in America/Chicago | T008, T015, T023 |
| DAC-E6-S4-3 | Present / absent / unknown badges are distinct, each with text plus an icon or shape | T001, T009, T014 |
| DAC-E6-S4-4 | Never-acquired copy differs from no-match; never-acquired offers the run action | T005, T013, T018, T019 |
| DAC-E6-S4-5 | At 3000 instruments search and filter stay usable; the table scrolls in its own container | T006, T018, T020, T023 |
| DAC-E6-S4-6 | A uniform depth shortfall reads as a plan limit, not a data gap | T005, T011, T013, T016, T018 |
| DAC-E6-S4-7 | Every status stays distinguishable in greyscale | T001, T009, T014 |

## Phase 1: Setup

**Purpose**: Expose the theme tokens this screen needs to Tailwind. Add the typed
coverage contract to the fetch layer.

- [ ] T001 [P] Add the data-vintage tokens to `tailwind.config.js`. Add nothing else.
  - The tokens already exist in `design-system/theme.css` lines 84–100.
  - Under `theme.extend.colors`, add these four entries, in the file's existing
    `hsl(var(--x) / <alpha-value>)` form:
    - `value-missing`
    - `value-missing-muted`
    - `value-indeterminate`
    - `value-indeterminate-muted`
  - Add `theme.extend.backgroundImage` with
    `{ "pattern-indeterminate": "var(--pattern-indeterminate)" }`.
  - Every value resolves to a token and none is a literal (STD-UI-29). Tokens are
    selected, never introduced.
  - Traces to: DAC-E6-S4-1, DAC-E6-S4-3 and DAC-E6-S4-7 (ux-design 1.1 Token Usage;
    badge spec section 6).
- [ ] T002 Add the coverage contract to `web/src/api/types.ts`.
  - Append the types after `HistoryDepth`, in the file's style. Each carries a docstring
    that cites ingestion-api section 11 and this plan's Open Gaps 1–2:
    - `export type PresenceState = "present" | "absent" | "unknown";`
    - `export type CoverageDataType = "reference" | "prices" | "fundamentals" | "corporate_actions";`
      These are the four values of the `coverage_data_type_known` check in
      `migrations/0003_coverage.sql`.
    - `export interface CoverageRow` with these fields:
      - `symbol: string`
      - `lifecycle: InstrumentLifecycle`
      - `dataTypes: Record<CoverageDataType, PresenceState>`
      - `coveredFrom: string | null` and `coveredTo: string | null`: session dates, kept
        as the wire's `YYYY-MM-DD` strings and never parsed into `Date` (STD-UI-5)
      - `lastAcquiredAt: string | null`: an ISO-8601 instant
      - `gapCount: number | null`
      - `depthShortByYears: number | null`
    - `export interface CoverageGapDetection { available: boolean; reason: string | null }`
    - `export interface CoverageView { rows: CoverageRow[]; neverAcquired: boolean; gapDetection: CoverageGapDetection; nextCursor: string | null }`
    - `export interface CoverageExpansion { symbol: string; gapDates: string[] | null }`
      Here `null` means not computed, and `[]` means computed with nothing missing
      (CAP-001-E6-S2 PROVISIONAL item 4).
- [ ] T003 Add two calls to `web/src/api/client.ts`, after `listInstruments` (depends on T002).
  - Both reuse the private `requestJson`, so a transport failure becomes
    `ApiUnreachableError` and a non-2xx response becomes `ApiError`. Both map snake_case
    to camelCase at the boundary, following the `listInstruments` precedent.
  - `export interface CoverageFilters { symbol?: string; lifecycle?: InstrumentLifecycle; cursor?: string }`
  - `export async function fetchCoverage(filters: CoverageFilters = {}): Promise<CoverageView>`:
    - Build the query with `URLSearchParams` and set only the filters that are present.
    - Send **no** `limit`, `from` or `to`. The API's `DEFAULT_PAGE_SIZE` of 50 applies.
      With both bounds omitted, the service covers everything acquired (ingestion-api
      2.4a; coverage-service 2.3, owner decision 2026-09-05).
    - Map `instruments[]` to `rows`, and `data_types` to `dataTypes`. Copy the other
      fields unchanged: `null` stays `null`, and `0` stays `0`.
  - `export async function fetchCoverageGapDates(symbol: string): Promise<CoverageExpansion>`:
    - Call `GET /api/coverage?symbol=<symbol>&limit=1&expand=<symbol>` and read only the
      body's `expanded` key (Open Gap 1).
    - If `expanded` is missing, throw
      `new ApiError("GET /api/coverage returned no gap dates for <symbol>", "unknown")`.
      Never return an empty list, which would read as "no gaps".
    - URL-encode `symbol`.

**Checkpoint**: `npx tsc --noEmit` passes. No screen code exists yet.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing Vitest specs that pin every rendering this story's ACs
require, before any screen code exists.

Test conventions:

- Every screen test mocks `../../api/client` with `vi.mock`. Spread `vi.importActual`
  and replace `fetchCoverage` and `fetchCoverageGapDates` with `vi.fn()`. This follows
  the `screens/instruments/empty-states.test.tsx` precedent.
- Every screen test also mocks `../runs/run-controls`. The mock replaces the Start
  control that CAP-001-E5-S6 exports with a stub rendering
  `<button type="button">Start acquisition run</button>`, so these tests never reach
  the run endpoints.
- Every mandatory test carries a traceability comment such as
  `// Implements TC-COMP-059`.
- The component test spec's steps are generic boilerplate. The concrete assertions below
  are sharpened from each TC's AC, and that AC is the source of truth.

Every test uses the fixture builder from T004.

### Mandatory Component Tests

- [ ] T004 Create the shared fixture builder in `web/src/screens/coverage/test-fixtures.ts`. It exports no test cases.
  - `row(overrides?: Partial<CoverageRow>): CoverageRow`. By default it returns:
    - symbol `AAPL`, lifecycle `active`, and all four data types `present`;
    - `coveredFrom: "2024-01-02"` and `coveredTo: "2024-01-05"`;
    - `lastAcquiredAt: "2026-09-05T22:14:03Z"`;
    - `gapCount: 0` and `depthShortByYears: null`.
  - `view(overrides?: Partial<CoverageView>): CoverageView`. By default it returns:
    - `rows: [row()]`, `neverAcquired: false` and `nextCursor: null`;
    - `gapDetection: { available: true, reason: null }`.
  - `UNAVAILABLE_REASON = "fewer_than_two_instruments_with_data"`, the wire code in
    coverage-service 2.4 and CAP-001-E6-S3-tasks T001.
- [ ] T005 Create `web/src/screens/coverage/coverage.test.tsx`, the file owner-web-app section 7 names. Render `<CoverageScreen />` inside a `MemoryRouter`. Add one `describe` per TC:
  - **TC-COMP-007 (AC-7)**: `fetchCoverage` resolves `view()`.
    - The row's `th[scope=row]` contains `AAPL`.
    - The row has four presence badges, found with `getAllByTestId("presence-badge")`.
    - The cells under the column headers *Covered from* and *Covered to* read
      `2024-01-02` and `2024-01-05`. Locate each cell by its column header index, not
      by position.
    - The *Last acquired* cell reads `2026-09-05 17:14:03 America/Chicago`.
    - The column headers, all with `scope="col"`, are, in order: Symbol, Lifecycle,
      Reference, Prices, Fundamentals, Corporate actions, Covered from, Covered to,
      Gaps, Depth, Last acquired (ux-design 1.1 Page Layout).
  - **TC-COMP-017 (AC-17)**: resolve `view({ neverAcquired: true, rows: [], gapDetection: { available: false, reason: UNAVAILABLE_REASON } })`.
    - The text *No data has been acquired yet.* is present (ux-design 1.1 States).
    - `queryByRole("table")` is `null`, so no empty table can read as healthy.
    - No `0` appears anywhere in the main region.
  - **TC-COMP-062 (DAC-E6-S4-4)**:
    - Case (a), never-acquired as above: the stubbed Start button is present, and
      *No instrument matches this filter.* is absent.
    - Case (b): resolve `view({ rows: [] })`, where `neverAcquired` is false.
      *No instrument matches this filter.* and a *Reset filter* button are present, and
      *No data has been acquired yet.* is absent.
    - Clicking *Reset filter* clears the symbol input, and `fetchCoverage` is called
      again with no `symbol`.
  - **TC-COMP-021 (AC-21)**: resolve a row with `symbol: "MSFT", lifecycle: "retired"` and the default coverage.
    - The row's `lifecycle-badge` has `data-variant="secondary"` and the text *Retired*.
    - The retired row still shows `2024-01-02` and `2024-01-05` and its four presence
      badges.
  - **TC-COMP-022 (AC-22)**: resolve three rows.
    - `SHRT` has `depthShortByYears: 2`. Its Depth cell holds a `data-testid="depth-short-badge"`
      element with `data-variant="status-warning"` and the text *Short by 2 years*.
    - `ONE` has `1`. Its badge reads *Short by 1 year*.
    - `MEET` has `null` and `ZERO` has `0`. Their Depth cells contain no
      `depth-short-badge` and no text. Compliant rows carry no marker (ux-design 1.1),
      and a zero is not a shortfall (Resolved Conflict 3).
  - **TC-COMP-030 (DAC-E6-4)**: resolve two rows with `gapCount: null` and `gapDetection: { available: false, reason: UNAVAILABLE_REASON }`.
    - Each Gaps cell holds a `data-testid="gaps-unknown-badge"` element with
      `data-variant="coverage-unknown"`, the text *Unknown*, and the class
      `bg-pattern-indeterminate`.
    - No Gaps cell has the text content `0`.
    - Below the table, the reason sentence *Gap detection needs at least two instruments
      holding data in this range.* appears exactly once.
    - Expanding a row shows the same sentence in the expansion region, and
      `fetchCoverageGapDates` is **not** called.
  - **TC-COMP-064 (DAC-E6-S4-6)**:
    - Uniform case: resolve three rows, each with a covered range and
      `depthShortByYears: 3`. The plan-limit note (T013 copy, `data-testid="plan-limit-note"`)
      is present, and it contains `3 years` and `provider plan`.
    - Every row still carries its own *Short by 3 years* badge (AC-22). No Gaps cell
      changes: they still show the fixture's `0`.
    - Mixed case: `3`, `3` and `null`. The note is absent.
    - Single-row case: `3`. The note is absent (Open Gap 3).

- [ ] T006 [P] Create `web/src/screens/coverage/coverage-table.test.tsx`
  - **TC-COMP-008 (AC-8)**:
    - Arrange: resolve `view({ rows: [row({ symbol: "CVA", gapCount: 0 }), row({ symbol: "CVC", gapCount: 2 })] })`.
      `fetchCoverageGapDates` resolves `{ symbol: "CVC", gapDates: ["2024-01-03", "2024-01-04"] }`.
    - The row counts show: the CVC Gaps cell reads `2`, and the CVA Gaps cell reads `0`.
    - Before any expansion, `fetchCoverageGapDates` has not been called, and no
      `2024-01-03` is in the document. The dates are not pre-loaded (DAC-E6-14).
    - The expander is a `button` with the accessible name *Show details for CVC* and
      `aria-expanded="false"`.
    - Press `Enter` on it with `userEvent.keyboard`.
      - `aria-expanded` becomes `"true"`, and the accessible name becomes
        *Hide details for CVC*.
      - Focus stays on the expander.
      - `fetchCoverageGapDates` is called once, with `"CVC"`.
      - The expansion region, `aria-live="polite"`, lists `2024-01-03` and `2024-01-04`
        in ascending order.
    - Collapse and re-expand. There is no second call, because the result is cached
      until the next refresh (Open Gap 4).
    - Expanding CVA, with `gapCount: 0`, makes **no** call. It shows
      *No missing trading days in the covered range.*
  - **TC-COMP-063 (DAC-E6-S4-5)**:
    - Page one: resolve 50 rows (`S0001`–`S0050`) with `nextCursor: "S0050"`.
      - The table is a descendant of `data-testid="coverage-table-scroll"`, whose
        `className` contains `overflow-auto` and `min-h-0`.
    - Type `AA` into the *Filter by symbol* textbox.
      - After advancing timers past the 250 ms debounce, `fetchCoverage` was last
        called with `{ symbol: "AA", lifecycle: undefined, cursor: undefined }`.
      - The filter is server-side and never a scan of the loaded page.
      - The textbox keeps focus.
      - A polite live region reads *N instruments shown*.
    - Select *Retired* in *Lifecycle*. The next call carries `lifecycle: "retired"`.
    - Clear the filter, then click *Next page*.
      - `fetchCoverage` is called with `cursor: "S0050"`.
      - The rendered body rows equal the second page's rows only (≤ 50). The first
        page's `S0001` is gone, so the DOM stays bounded (owner-web-app AC 18).
    - Click *Previous page*. `fetchCoverage` is called with `cursor: undefined`, and
      `S0001` is back.
    - On the first page, *Previous page* is not rendered. With `nextCursor: null`,
      *Next page* is not rendered.
  - **Additional, expansion error** (STD-UI-19):
    - Arrange: `fetchCoverageGapDates` rejects with `new ApiError("instrument not found", "req-9")`.
    - The expansion region shows
      *Loading missing dates for CVC failed: instrument not found (request req-9)* and a
      *Retry* button.
    - *Retry* re-invokes the call.
  - **Additional, inapplicable expansion**: a row with `gapCount: null` on an available
    view shows `GAPS_INAPPLICABLE` (T013), and makes no call.

- [ ] T007 [P] Implement TC-COMP-039 (DAC-E6-13: no auto-poll, last-updated shown) in `web/src/screens/coverage/coverage.polling.test.tsx`
  - Call `vi.useFakeTimers({ shouldAdvanceTime: true })` and
    `vi.setSystemTime(new Date("2026-09-06T15:00:00Z"))`.
  - Render `<CoverageScreen />`, and flush the mount fetch with
    `await vi.advanceTimersByTimeAsync(0)`.
  - Assert:
    - `fetchCoverage` has been called once.
    - The toolbar shows *Last updated 2026-09-06 10:00:00 America/Chicago*.
  - Advance `10 * 60_000` ms, the PROVISIONAL "extended interval" in Open Gap 5.
    - `fetchCoverage` is still called exactly once.
    - `fetchCoverageGapDates` is never called.
    - The last-updated text is unchanged.
  - Set the system time to `2026-09-06T15:10:00Z` and click *Refresh*.
    - `fetchCoverage` has now been called twice.
    - The text reads *Last updated 2026-09-06 10:10:00 America/Chicago*.
    - While the refresh is pending, the previous rows stay rendered and the table has
      `aria-busy="true"`. They never collapse to a loading message (data-table spec
      section 4).
  - Restore real timers in `afterEach`.

- [ ] T008 [P] Create `web/src/screens/coverage/cells.test.tsx`
  - **TC-COMP-059 (DAC-E6-S4-1)**: render the cell components directly.
    - `<MissingValue />`:
      - The visible text is `—` (U+2014), with `aria-hidden="true"` on the glyph.
      - An `sr-only` span reads *No data*.
      - It has `data-state="missing"` and the class `text-value-missing`.
    - `<CountValue value={0} />`:
      - The text is exactly `0`.
      - It has `data-state="measured"` and the class `font-numeric`.
    - `<Inapplicable />`:
      - It has no visible text.
      - An `sr-only` span reads *Not applicable*.
      - It has `data-state="inapplicable"`.
    - The three `data-state` values and the three visible texts (`—`, `0`, empty) are
      pairwise distinct.
    - In the screen, a row with `coveredFrom: null, coveredTo: null, lastAcquiredAt: null`
      renders `MissingValue` in those three cells.
  - **TC-COMP-060 (DAC-E6-S4-2)**:
    - `<SessionDate value="2024-01-02" />` renders exactly `2024-01-02`.
    - Also assert that `formatSessionDate` returns its input unchanged for
      `"2024-12-31"` and `"2024-01-01"`, the days that most often shift under a zone
      conversion.
    - `<Timestamp value="2026-09-05T22:14:03Z" />` renders
      `2026-09-05 17:14:03 America/Chicago` (CDT).
    - `"2026-01-15T06:30:00Z"` renders `2026-01-15 00:30:00 America/Chicago` (CST).

- [ ] T009 [P] Create `web/src/screens/coverage/badges.test.tsx`
  - **TC-COMP-061 (DAC-E6-S4-3)**: render `<PresenceBadge state="present" | "absent" | "unknown" />`.
    - The `data-variant` values are `coverage-present`, `coverage-absent` and
      `coverage-unknown`.
    - The visible labels are *Present*, *Absent* and *Unknown*.
    - Each badge contains an icon, which is either an `svg` with `aria-hidden="true"`
      or the absent badge's em dash glyph.
    - `unknown` carries `bg-pattern-indeterminate`. `absent` does **not** carry it:
      unknown never reads as a milder absent (badge spec section 2; STD-UI-14).
  - **TC-COMP-065 (DAC-E6-S4-7)**: greyscale distinguishability, asserted as shape plus
    text rather than colour.
    - Collect a signature for each status the screen renders:
      - the three presence badges;
      - `<GapsUnknownBadge />`;
      - `<DepthShortBadge years={2} />`;
      - `LifecycleBadge` retired and active.
    - Each signature is: the label text, plus the icon's shape markup (the `svg`'s
      child element tag names and their `fill` attribute), or the glyph for absent.
    - Assert that all signatures are pairwise distinct, and that each label is
      non-empty.
    - Assert that no badge's meaning depends on a colour class alone: for every badge,
      removing its `class` attribute leaves the label and icon in place.

### Additional Unit Tests

- [ ] T010 [P] Add the gaps-cell decision table to `web/src/screens/coverage/cells.test.tsx`. It supports DAC-E6-4, DAC-E6-S4-1 and CAP-001-E6-S3-tasks Open Gap 4.
  - `<GapsCell gapCount={3} available />` renders `CountValue` `3`.
  - `gapCount={0} available` renders `CountValue` `0`, a measured zero.
  - `gapCount={null} available` renders `Inapplicable`. The instrument has no prices
    coverage, so gap detection does not apply (DAC-E6-5).
  - `gapCount={null} available={false}` renders `GapsUnknownBadge`.
  - `gapCount={4} available={false}`, which should never happen, still renders
    `GapsUnknownBadge`. It never shows a number when the view says detection is
    unavailable.
  - `reasonSentence(UNAVAILABLE_REASON)` returns the UX sentence verbatim.
  - `reasonSentence("something_new")` returns
    *Gap detection is unavailable (something_new).*, so an unknown code is shown as
    text and never dropped.
- [ ] T011 [P] Create `web/src/screens/coverage/uniform-shortfall.test.ts` for the pure function in T012. It supports DAC-E6-S4-6 and AC-22.
  - Two or more rows, each with a non-null `coveredFrom` and the same
    `depthShortByYears` `n > 0`, return `n`.
  - An empty list returns `null`, and so does a single row.
  - Any covered row with `null` or `0` returns `null`, and so does any pair of differing
    values.
  - Rows with `coveredFrom: null` (nothing covered) are ignored. If fewer than two
    covered rows remain, the result is `null`.
- [ ] T012 [P] Create `web/src/api/client.coverage.test.ts`. It stubs `fetch` with `vi.stubGlobal`, following `web/src/test-setup.ts`. It supports AC-7 and AC-8.
  - `fetchCoverage({ symbol: "AA", lifecycle: "retired", cursor: "X" })` requests
    `/api/coverage?symbol=AA&lifecycle=retired&cursor=X`.
    - The request carries no `limit`, `from` or `to`.
    - The mapped result has these camelCase fields: `rows`, `neverAcquired`,
      `gapDetection` and `nextCursor`.
    - `gap_count: 0` stays `0`, and `gap_count: null` stays `null`.
  - `fetchCoverage()` with no filters requests exactly `/api/coverage`.
  - `fetchCoverageGapDates("BRK.B")` requests
    `/api/coverage?symbol=BRK.B&limit=1&expand=BRK.B`, URL-encoded, and returns
    `expanded` mapped to `{ symbol, gapDates }`.
    - It passes a `gap_dates: null` through as `null`.
    - A body without `expanded` rejects with `ApiError`.
  - A `422` error envelope rejects with `ApiError` carrying the envelope's message and
    request id.
  - A thrown `fetch` rejects with `ApiUnreachableError`.
  - This file is separate from the `web/src/api/client.test.ts` that CAP-001-E5-S6-tasks
    T005 plans, so the two stories never edit one test file.

**Checkpoint**: `npm run test` collects T005–T012, and they fail on missing modules and
exports (`screens/coverage/*`, `fetchCoverage`), not on fixture errors. The existing
suites stay green.

---

## Phase 3: Core Implementation

**Purpose**: Build the presentational pieces and the screen that make Phase 2 pass.

- [ ] T013 [P] Create `web/src/screens/coverage/copy.ts`. It holds every user-visible sentence as an exported constant, so the tests and components share one source.
  - Verbatim from ux-design 1.1:
    - `NEVER_ACQUIRED = "No data has been acquired yet."`
    - `NO_MATCH = "No instrument matches this filter."`
    - `UNAVAILABLE_SENTENCE = "Gap detection needs at least two instruments holding data in this range."`
  - The mapping `REASON_SENTENCES: Record<string, string> = { fewer_than_two_instruments_with_data: UNAVAILABLE_SENTENCE }`
    and `reasonSentence(code: string | null): string`, which falls back as T010
    specifies.
  - The PROVISIONAL copy from Open Gap 6:
    - `OUTAGE_SENTENCE = "Gap detection cannot see a market-wide provider outage: a day missing for every instrument never enters the trading-day set."`
      This is the STD-UI-18 coverage statement, derived from ux-design 1.1 and
      DAC-E6-6.
    - `NO_GAPS = "No missing trading days in the covered range."`
    - `GAPS_INAPPLICABLE = "Gap detection applies to daily prices only, and no daily prices are covered for this instrument."`
    - `planLimitNote(years: number): string`, which returns
      `` `Every instrument shown is short of the stated history depth by ${years} ${years === 1 ? "year" : "years"}. A shortfall shared by every instrument is the provider plan's history limit, not missing data.` ``
    - `shortBy(years)`, which returns *Short by 1 year* or *Short by n years*.
- [ ] T014 [P] Create `web/src/screens/coverage/badges.tsx` (depends on T001, T013). Follow the structure of `screens/instruments/badges.tsx`: a `data-testid`, a `data-variant`, a text label, and an `aria-hidden` shape icon that is never a colour alone (STD-UI-8).
  - `PresenceBadge({ state })`, with `data-testid="presence-badge"`:
    - `present`: variant `coverage-present`, a check-mark `polyline` icon, the label
      *Present*, and `bg-status-good-muted text-status-good`.
    - `absent`: variant `coverage-absent`, the em dash glyph `—` (`aria-hidden`) as its
      shape, the label *Absent*, and `bg-value-missing-muted text-value-missing`. This
      satisfies owner-web-app design AC 2 and the story's badge variant (Resolved
      Conflict 2).
    - `unknown`: variant `coverage-unknown`, a question-mark `path` icon, the label
      *Unknown*, and
      `bg-value-indeterminate-muted bg-pattern-indeterminate text-value-indeterminate`.
  - `GapsUnknownBadge()`: the same visual as the `unknown` presence badge, with
    `data-testid="gaps-unknown-badge"` and `data-variant="coverage-unknown"`
    (ux-design 1.1, "Gap detection unavailable").
  - `DepthShortBadge({ years })`:
    - `data-testid="depth-short-badge"` and `data-variant="status-warning"`;
    - a warning-triangle `path` icon, the label `shortBy(years)`, and
      `bg-status-warning-muted text-status-warning` (ux-design 1.1 "Short of stated
      depth"; AC-22).
  - Reuse `LifecycleBadge` from `../instruments/badges`. Do not add a second lifecycle
    badge (AC-21: `badge` `secondary`).
- [ ] T015 [P] Create `web/src/screens/coverage/cells.tsx` (depends on T013, T014).
  - `MissingValue`, `CountValue`, `Inapplicable`, `SessionDate`, `Timestamp` and
    `GapsCell` behave exactly as T008 and T010 specify.
  - `formatSessionDate(value: string): string` returns `value` unchanged. Its docstring
    states that a session date is never passed to `Date` (STD-UI-5; OQ-UI-3 closure).
  - `Timestamp` renders `formatTimestamp(new Date(value))`, imported from
    `../../app/status-region` (CAP-001-E1-S5). Do not re-implement the Chicago
    formatter.
  - Numbers and dates use `font-numeric`, and the dense body uses `text-sm`
    (ux-design 1.1 Token Usage).
- [ ] T016 Create `web/src/screens/coverage/uniform-shortfall.ts` with `export function uniformShortfallYears(rows: CoverageRow[]): number | null`, behaving exactly as T011 specifies. Its docstring cites DAC-E6-S4-6, coverage-service design section 3 ("the fix is a sentence on the coverage screen naming the plan") and Open Gap 3.
- [ ] T017 Create `web/src/screens/coverage/coverage-table.tsx` (depends on T003, T014–T016).
  - Props:
    - `rows: CoverageRow[]` and `gapDetection: CoverageGapDetection`;
    - `refreshing: boolean` and `refreshToken: number`. The expansion cache clears when
      `refreshToken` changes.
  - A native `<table>` with `aria-busy={refreshing}`. When `refreshing`, rows stay
    rendered, dimmed through `text-muted-foreground`.
  - A `<thead>` holding the 11 `th scope="col"` headers in T005's order, with
    `text-muted-foreground`.
  - Per row:
    - A `th scope="row"` holds the expander `button` followed by the symbol.
      - The button has `aria-expanded` and `aria-controls` pointing at its detail row
        id, from `useId`.
      - Its accessible name is *Show details for {symbol}* or *Hide details for {symbol}*.
      - A retired row's symbol uses `text-muted-foreground`, following the
        `instrument-table.tsx` precedent.
    - Then these cells:
      - `LifecycleBadge`;
      - four `PresenceBadge`s in the data-type column order;
      - covered from and covered to, each as a `SessionDate`, or `MissingValue` when
        `null`;
      - `GapsCell`;
      - Depth, as `DepthShortBadge` when `depthShortByYears > 0`, otherwise an empty
        `td`;
      - last acquired, as a `Timestamp`, or `MissingValue` when `null`.
    - Numeric and date columns are `text-right` (data-table spec section 7).
  - Expansion:
    - An expanded row inserts a following `<tr id=…><td colSpan={11}>` whose content
      wrapper is `aria-live="polite"`. Focus is not moved (ux-design 1.1 Interaction
      Flows).
    - What the region shows depends on the view and the row:
      - When `!gapDetection.available`, it shows `reasonSentence(gapDetection.reason)`
        and makes no fetch.
      - When `gapCount === null`, it shows `GAPS_INAPPLICABLE` and makes no fetch.
      - When `gapCount === 0`, it shows `NO_GAPS` and makes no fetch.
      - Otherwise it calls `fetchCoverageGapDates(symbol)` once and caches the result
        in a `Record<string, …>` state keyed by symbol.
        - While the call is pending, it shows *Loading missing dates…*.
        - When the dates arrive, it renders them as an ordered `<ul>` of `SessionDate`,
          sorted ascending as strings. ISO strings sort chronologically.
        - If `gapDates` comes back `null`, it falls back to the reason sentence.
        - An error renders
          *Loading missing dates for {symbol} failed: {message} (request {requestId})*
          with a *Retry* button (STD-UI-19).
    - Guard state updates with a mounted/cancelled flag, following the
      `instrument-table.tsx` precedent.
  - Below the table, and once only:
    - `OUTAGE_SENTENCE` when the view is available;
    - `reasonSentence(gapDetection.reason)` when it is unavailable.
    - Both are `text-xs text-muted-foreground` (STD-UI-18; ux-design 1.1 "once, below
      the table, not per row").
- [ ] T018 Create `web/src/screens/coverage/index.tsx`, the default export `CoverageScreen` (depends on T017).
  - Follow the structure of `screens/instruments/index.tsx`. Keep a
    `ScreenState<CoverageView>` from `../../api/types` and use these kinds:
    - `loading`;
    - `empty-never-populated`, when `neverAcquired` is true, whatever the rows or
      filter hold (DAC-E6-7);
    - `empty-no-match`, when `rows` is empty and `neverAcquired` is false;
    - `populated`, with `fetchedAt` set to `new Date().toISOString()` when the response
      arrives;
    - `error`, from `ApiError.requestId` or `"unknown"`.
  - The `partial`, `unavailable` and `unreachable` kinds are never produced. Put this
    reasoning in the docstring:
    - partial is the ordinary rendering;
    - unavailability is per column, never per screen;
    - the shell owns unreachable, as `instruments/index.tsx` already records.
  - Layout: the root is `flex h-full min-h-0 flex-col gap-5`. It holds, in order:
    1. `<h1 className="text-xl">Coverage</h1>`.
    2. The toolbar, `data-testid="coverage-toolbar"`, which stays rendered in every
       state (ux-design 1.1 Error; owner-web-app AC 17). Left to right, it holds:
       - the *Filter by symbol* text input;
       - the *Lifecycle* native `select`, with *All*, *Active* and *Retired* (`select`
         `inline`);
       - the Start control from `../runs/run-controls` (CAP-001-E5-S6; see Open Gap 7);
       - the *Refresh* button;
       - `Last updated {formatTimestamp(new Date(fetchedAt))}` in `text-xs font-numeric`,
         or *Not yet loaded* before the first response;
       - a polite live region reading `{rows.length} instruments shown` after each
         populated response.
    3. The plan-limit note, `data-testid="plan-limit-note"`. It renders only when
       `uniformShortfallYears(rows)` is non-null, above the table, as
       `planLimitNote(n)`.
    4. The body. Its content depends on the state:
       - loading: *Loading coverage…* with `aria-live="polite"`, following the E2-S4
         pattern (see Other Notes);
       - never-populated: `NEVER_ACQUIRED`. The Start action sits beside it in the
         toolbar, which stays rendered.
       - no-match: `NO_MATCH` and a *Reset filter* button that clears both filters;
       - error: a `role="alert"` block reading
         *Loading coverage failed: {message} (request {requestId})*, with *Retry*;
       - populated: `<div data-testid="coverage-table-scroll" className="min-h-0 flex-1 overflow-auto">`
         wrapping `CoverageTable`, followed by the pager.
  - Fetching:
    - One `useEffect` keyed on `[symbolFilter, lifecycleFilter, cursor, reloadToken]`
      calls `fetchCoverage`.
    - It is debounced by 250 ms when `symbolFilter` is non-empty and 0 ms otherwise,
      reusing the `FILTER_DEBOUNCE_MS = 250` precedent from
      `screens/instruments/instrument-table.tsx`.
    - It is cancelled on cleanup.
    - **No `setInterval` and no re-scheduling** (DAC-E6-13; owner-web-app 2.3, "Coverage
      does not auto-poll"). *Refresh* and *Retry* bump `reloadToken`.
    - On a refresh, keep the previous `populated` data visible with `refreshing = true`
      until the response lands (data-table spec section 4).
  - Pager, for keyset pages that replace each other (Open Gap 2):
    - Keep `cursorStack: (string | undefined)[]`.
    - *Next page* renders only when `nextCursor !== null`. It pushes the current cursor
      and sets `cursor = nextCursor`.
    - *Previous page* renders only when the stack is non-empty, and pops it.
    - A filter change resets the cursor and the stack.
  - Filtering never moves focus (ux-design 1.1 Accessibility).

**Checkpoint**: T004–T012 pass under `npm run test`. `npx tsc --noEmit` and
`npm run lint` are clean.

---

## Phase 4: Integration

**Purpose**: Route the screen inside the shell and make the page itself stop scrolling.
Prove expansion end to end against the real API.

- [ ] T019 Wire the route in `web/src/app/routes.tsx`.
  - Import `CoverageScreen from "../screens/coverage"`.
  - Replace `<ScreenPlaceholder label="Coverage" />` on `/coverage` with
    `<CoverageScreen />`.
  - Keep `ScreenPlaceholder`, because `/runs` still uses it until CAP-001-E5-S6 lands.
    If E5-S6 has already replaced it by merge time, delete the unused function so
    `noUnusedLocals` passes.
  - Leave the other routes untouched. `routes.test.tsx`'s route list is unchanged.
- [ ] T020 Bound the shell's height in `web/src/app/shell.tsx`, so tables scroll inside their own container instead of the page (DAC-E6-S4-5; owner-web-app OQ 4, "the tables scroll horizontally inside their own container rather than the page doing so").
  - On the root `div`, change `min-h-screen` to `h-screen`.
  - Change `<main className="flex-1 p-5">` to `<main className="flex min-w-0 flex-1 flex-col overflow-auto p-5">`.
  - Change nothing else. The rail and the status-region structure asserted by
    `shell.layout.test.tsx` are unchanged.
  - Other screens now scroll within `main` rather than the page. Note this in the
    commit message, because the shell belongs to CAP-001-E1-S4.
- [ ] T021 Run the existing shell suites unmodified.
  - The suites are `web/src/app/shell*.test.tsx`, `status-region*.test.tsx` and
    `routes.test.tsx`. Every one of them renders `/coverage`.
  - `test-setup.ts`'s default `fetch` stub answers every URL with a health body. The
    Coverage screen therefore lands in its `error` state there, and `within(main).getByText("Coverage")`
    still matches the `h1`.
  - If any of these tests fails or emits an `act(...)` warning, fix it in the Coverage
    screen, for example with its cancellation guard. **Do not edit CAP-001-E1-S4/S5 test
    files.**
- [ ] T022 Create the end-to-end seed `tests/e2e/fixtures/coverage-seed.sql`, a plain SQL script. It has no `.spec.ts` suffix, so Playwright never collects it.
  - Insert active instruments `CVA`, `CVB` and `CVC`. The symbols are unique to this
    spec and do not collide with `instruments-add-retire.spec.ts`'s `AAPL`.
  - For each instrument, insert `reference` and `prices` `coverage_segment` rows over
    2024-01-02..2024-01-05.
  - Insert `daily_bar` rows on 2024-01-02, 01-03, 01-04 and 01-05 for CVA and CVB, and
    on 01-02, 01-03 and 01-05 for CVC.
    - `value_hash = sha256((symbol || session_date::text)::bytea)`.
    - Use fixed OHLCV values.
    - Look up each id with `(SELECT instrument_id FROM instrument WHERE symbol = …)`.
  - Insert `acquisition_state` rows for `prices` with `last_outcome='written'`,
    `last_acquired_at='2024-01-05T22:14:03Z'` and `last_run_id=gen_random_uuid()`.
  - The columns follow `migrations/0001`–`0003`.
- [ ] T023 Create `tests/e2e/coverage-expansion.spec.ts`, the story's "`@playwright/test` for expansion to gap dates" (depends on T019, T022). It runs against the real API and PostgreSQL from `playwright.config.ts`.
  - `test.beforeAll` applies the seed with Node's `execFileSync`:
    - `execFileSync("docker", ["exec", "-i", "-e", "PGPASSWORD=postgres", "factorflow-e2e-postgres", "psql", "--host=127.0.0.1", "--username=postgres", "--dbname=factorflow", "-v", "ON_ERROR_STOP=1"], { input: readFileSync(seedPath) })`
    - The container name and credentials are the constants in
      `scripts/run-e2e-server.sh`.
    - This adds no npm dependency.
  - Steps:
    1. `page.goto("/coverage")`. Record every request whose URL contains
       `/api/coverage`.
    2. Fill *Filter by symbol* with `CV`, then wait for the rows CVA, CVB and CVC.
    3. Assert that the Gaps cell for CVC reads `1`, and that CVA and CVB read `0`.
    4. Assert that no recorded request so far contains `expand=`.
    5. Focus *Show details for CVC* and press `Enter`.
    6. Assert that the expansion shows `2024-01-04`, and that exactly one recorded
       request contains `expand=CVC`.
    7. Assert that *Covered from* for CVC reads `2024-01-02`, which is unconverted.
    8. Assert that `await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight)`
       is `true`, so the page itself does not scroll.
    9. Wait 15 s with `page.waitForTimeout`, then assert that no further non-`expand`
       `/api/coverage` request was made. This is a browser-level check of no polling.
       The fake-timer proof is T007.
  - This needs CAP-001-E6-S1 to CAP-001-E6-S3 merged. S3 is an existing hard edge, and
    S1 and S2 are its own.

**Checkpoint**: `npm run test` is fully green, including the untouched shell suites.
`npm run test:e2e` runs both specs green.

---

## Phase 5: Polish

**Purpose**: Traceability, provisional-decision markers and clean validation.

- [ ] T024 [P] Add provenance comments.
  - In the docstrings of `web/src/screens/coverage/index.tsx`, `coverage-table.tsx`,
    `copy.ts` and `uniform-shortfall.ts`, cite each PROVISIONAL decision by this plan's
    Open Gap number. This follows the precedent in `screens/instruments/start-action.tsx`
    and `api/types.ts` for recorded contract choices.
  - Put a one-line comment above the fetch effect: "No polling: DAC-E6-13, owner-web-app
    2.3".
  - Put one above the expansion fetch: "Fetch on expansion: DAC-E6-14 governs over
    ux-design 1.1; see Resolved Conflict 1".
- [ ] T025 Run the validation commands from the repository root, and fix issues only in the files this story touches:
  - `npm run format`
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run test`
  - `npm run build`
  - `npm run test:e2e`

**Checkpoint**: All 14 story ACs are satisfied, and every command exits 0.

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here as `reverse`, `soft`, or
`context`. A newly discovered hard dependency must be added to the graph.

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E1-S4 | hard | `web/src/app/shell.tsx`, `routes.tsx`, and `ScreenState<T>` in `web/src/api/types.ts`. This edge already exists. T020 edits the shell's layout classes. |
| CAP-001-E6-S3 | hard | `GET /api/coverage` and its provisional `expand` / `expanded` contract (CAP-001-E6-S3-tasks Open Gap 1). This edge already exists. |
| CAP-001-E1-S5 | hard | T015 imports `formatTimestamp` from `web/src/app/status-region.tsx`, which commit `163fb18` added under CAP-001-E1-S5. The story is implemented (`docs-sync`). **New edge added to `dependencies.yaml`.** |
| CAP-001-E2-S4 | hard | T014 imports `LifecycleBadge` from `web/src/screens/instruments/badges.tsx`. T003 reuses `requestJson` and `ApiError` in `web/src/api/client.ts`. Both were added in commit `bfcc2cd` under CAP-001-E2-S4. The story is implemented (`docs-sync`). **New edge added to `dependencies.yaml`.** |
| CAP-001-E5-S6 | hard | T018 composes the Start control from `web/src/screens/runs/run-controls.tsx`, which CAP-001-E5-S6 "delivers … the Start action" (its story Description, and its tasks T008). DAC-E6-S4-4 requires the never-acquired state to offer that action. E5-S6 is `todo` and not yet implemented. **New edge added to `dependencies.yaml`.** It adds no cycle, because E5-S6 depends on E1-S4 and E5-S5 only. |
| CAP-001-E6-S1 | context | It produces `never_acquired`, presence and `depth_shortfall_years` (CAP-001-E6-S1-tasks T012, including its PROVISIONAL ceiling rounding). S4 consumes them only through S3's HTTP body, and S1 is transitive through S3. |
| CAP-001-E6-S2 | context | Its `read_gap_dates` `None`-versus-`[]` semantics (CAP-001-E6-S2-tasks PROVISIONAL item 4) define `expanded.gap_dates`, which S4 renders. It is consumed only through S3 and is transitive. |

### Task Dependencies

- T001 has no dependencies.
- T002 has no dependencies. T003 depends on T002.
- T004 has no dependencies. T005–T011 depend on T004. T012 depends on T002 and T003.
- T005–T012 edit different files and can run in parallel. T010 extends T008's file, so
  it runs after T008.
- T013 has no dependencies. T014 depends on T001 and T013. T015 depends on T013 and
  T014. T016 depends on T002.
- T017 depends on T003 and T014–T016. T018 depends on T017, and on CAP-001-E5-S6 being
  merged for the real Start control.
- T019 depends on T018. T020 has no dependencies. T021 depends on T019 and T020.
- T022 has no dependencies. T023 depends on T019, T020 and T022, with S1–S3 merged.
- T024 depends on T018. T025 depends on every earlier task.

### Parallel Opportunities

- Phase 1: T001 and T002 run in parallel.
- Phase 2: T005, T006, T007, T008, T009, T011 and T012 run in parallel after T004.
- Phase 3: T013 and T016 run in parallel. T014 and T015 run in sequence after T013.
- Phase 4: T020 and T022 run in parallel with T019.

### Phase Dependencies

- Phase 1 comes before Phase 2, because the tests import the types.
- Phase 2 comes before Phase 3 under TDD.
- Phase 3 comes before Phase 4.
- Phase 5 comes last.

---

## Validation Plan

### Constitution-Defined Commands

From `docs/constitution/tech-stack.md` → Validation Commands (TypeScript):

- Build: `npm run build`
- Test: `npm run test`
- End to end: `npm run test:e2e`. It needs Docker and `npx playwright install`.
- Lint: `npm run lint`
- Format: `npm run format`
- Type check: `npx tsc --noEmit`

The story's own Validation section adds nothing beyond these commands.

### Story-Specific Validation

- AC-7 / TC-COMP-007: `npx vitest run web/src/screens/coverage/coverage.test.tsx -t "TC-COMP-007"`
  checks the four presence badges, the exact covered range, the Chicago last-acquired
  time, and the 11 column headers.
- AC-8 / TC-COMP-008: `coverage-table.test.tsx` checks that the count is in the row, no
  date is in the DOM before expansion, exactly one fetch happens on `Enter`, and the
  dates are ascending. T023 proves the same thing in a browser.
- AC-17 / TC-COMP-017 and DAC-E6-S4-4 / TC-COMP-062: never-acquired shows no table and
  its own copy, plus the Start control. No-match shows different copy and a reset.
- AC-21 / TC-COMP-021: the retired row has the `secondary` badge and a full range.
- AC-22 / TC-COMP-022: only rows with a positive shortfall carry *Short by n years*, and
  the singular and plural forms are both handled.
- DAC-E6-4 / TC-COMP-030: every row shows *Unknown* with the pattern and no `0`. The
  reason appears once below the table and in the expansion, and the expansion makes no
  fetch.
- DAC-E6-13 / TC-COMP-039: one fetch over 10 fake minutes, and the last-updated time
  changes only on Refresh. T023 checks the browser for 15 s.
- DAC-E6-S4-1 / TC-COMP-059: the three `data-state` values and texts are distinct.
- DAC-E6-S4-2 / TC-COMP-060: session dates are byte-identical to the wire, and
  timestamps are in CDT and CST.
- DAC-E6-S4-3 / TC-COMP-061 and DAC-E6-S4-7 / TC-COMP-065: badge signatures are pairwise
  distinct, and unknown carries the pattern while absent does not.
- DAC-E6-S4-5 / TC-COMP-063: the request is server-side, the scroll container exists,
  pages replace each other (≤ 50 rows in the DOM), and T023 shows the page itself does
  not scroll.
- DAC-E6-S4-6 / TC-COMP-064: the plan-limit note shows only for a uniform shortfall
  across two or more covered rows, and the per-row badges stay.
- Regression: the unmodified shell, status-region and routes suites pass (T021).
- Manual review, because Biome carries no `jsx-a11y` equivalent (owner-web-app section
  4):
  - a keyboard pass through filter → lifecycle → Start → Refresh → expanders → pager;
  - a greyscale screenshot of a populated screen, checked for STD-UI-8.

---

## Notes

### Resolved Conflicts

1. **Whether expansion fetches.**
   - ux-design 1.1 says "Expanding does not fetch: coverage is one read".
     owner-web-app section 5 opens with "Row expansion does not fetch".
   - Against that:
     - DAC-E6-14 (epic AC) and this story's AC-8 put specific dates "behind
       expansion" rather than in the collapsed row.
     - owner-web-app section 5 itself continues "fetched once per expansion rather than
       pre-loaded for 3000 rows".
     - CAP-001-E6-S3's contract returns no dates in the collapsed rows.
   - Epic and story ACs outrank design prose, so S4 fetches on expansion.
   - CAP-001-E6-S3-tasks Resolved Conflict 2 and register section 8 reach the same
     result.
   - The UX sentence should be corrected at the next ux-design revision.
2. **Absent data type: em dash or badge.**
   - owner-web-app design AC 2 says "A data type with no observation renders an em dash,
     never a zero and never a blank". The story's Technical Details and ux-design 1.1
     Component Mapping name the `badge` `coverage-absent` variant for presence.
   - These are not exclusive. The `coverage-absent` badge uses the em dash glyph as its
     shape, beside the word *Absent* (T014).
   - Story ACs (DAC-E6-S4-3: distinct badge variants, each with text plus an icon or
     shape) govern the component choice, and the design AC is satisfied by the glyph.
   - No source edit is needed.
3. **`depth_short_by_years: 0`.**
   - CAP-001-E6-S3's story example JSON shows `0`. coverage-service 2.4 and S3's plan
     return `null` when the depth is met.
   - The design's normative prose outranks an illustrative snippet.
   - The screen renders a marker only for a value `> 0` (T017). `null` and `0` both
     render as a blank Depth cell, which is inapplicable because no marker is due
     (ux-design 1.1, "Rows meeting the stated depth carry no marker").
4. **Who owns Start.**
   - The docstring in `web/src/screens/instruments/start-action.tsx` says starting a run
     "belongs to whichever story owns Coverage (1.1)".
   - The approved CAP-001-E5-S6 story says it "Delivers … the Start action". This
     story's Technical Details name only `GET /api/coverage` as its endpoint.
   - An approved story outranks a code comment, so S4 composes E5-S6's control and adds
     no `POST /api/acquisition-runs` call of its own. This creates the new hard edge on
     CAP-001-E5-S6.
   - The Start blocked and queued tests that owner-web-app section 7 files under
     `web/src/screens/coverage/start-run.test.tsx` test E5-S6's control (AC-2, AC-23,
     AC-24). They are E5-S6's run-controls tests and are not duplicated here.

### Open Gaps

1. **CONFIRMED by owner (2026-09-29; adopted provisionally, then confirmed): the expansion request.**
   - Undefined:
     - The HTTP shape for gap dates is itself provisional (CAP-001-E6-S3-tasks
       Open Gap 1: optional `expand=<symbol>` on `GET /api/coverage`, with the response
       adding `expanded: {symbol, gap_dates}`). S4 depends on that unconfirmed decision.
     - No artifact says which other parameters an expansion request carries.
   - Adopted: `GET /api/coverage?symbol=<S>&limit=1&expand=<S>`, reading only
     `expanded` (T003).
   - Derivation:
     - `expand` is computed by `read_gap_dates` independently of the page filters (S3
       T015, S2 T017), so narrowing the page to one row changes nothing in `expanded`.
     - Narrowing does minimise the incidental `read_coverage` cost on what the design
       calls the most expensive read (owner-web-app 2.3).
     - `limit=1` is within S3's accepted bounds (`gt=0`, `le=MAX_PAGE_SIZE`).
   - If the owner changes S3's contract, only T003 and T012 change.
   - Absorb in: ingestion-api section 11, alongside S3's gap.
2. **Genuine gap: STD-UI-30 virtualisation is only partly met.**
   - This was already known: owner-web-app OQ 2, the story's Open Questions, and
     capability section 5.4.
   - ux-design 1.1 says "The table is virtualised". owner-web-app 2.6 specifies "a
     keyset-paginated list with windowed rendering over the loaded pages", and design
     AC 18 says the DOM must not grow with the result set.
   - The plan adopts pages that replace each other, of the API's default 50 rows, with
     Previous and Next over a cursor stack (T018). It adds no virtualisation library,
     which would be a new dependency that `tech-stack.md` does not record.
   - This deliberately departs from CAP-001-E2-S4's accumulating *Load more* precedent,
     because that pattern grows the DOM without bound, against design AC 18.
   - Absorb in: the design-system `data-table` spec or STD-UI-30's conformance record,
     as OQ 2 already routes.
3. **CONFIRMED by owner (2026-09-29; adopted provisionally, then confirmed): what "uniform depth shortfall" means, and its copy.**
   - Undefined:
     - DAC-E6-S4-6 does not say how the screen recognises a uniform shortfall.
     - The API exposes no plan or whole-view signal.
   - Adopted:
     - The rule: two or more loaded rows with a covered range all carry the same
       `depth_short_by_years` `n > 0` (T011, T016).
     - The result: one note above the table, `planLimitNote(n)` (T013). Every row still
       keeps its own *Short by n years* badge, as AC-22 requires. Gap counts are
       untouched, because the service already excludes pre-coverage dates.
   - Derivation:
     - coverage-service design section 3 says "If the distinction later proves unclear
       in use, the fix is a sentence on the coverage screen naming the plan".
     - A plan cap truncates every instrument to the same start date, which yields the
       same integer shortfall under S1's PROVISIONAL ceiling rule.
     - A single row cannot show uniformity.
     - The loaded page is the only data the client holds.
     - The note says "the provider plan's history limit" rather than naming *Stocks
       Starter*. No API field carries the plan, and hard-coding a tier name would go
       stale when the plan changes.
   - Absorb in: ux-design 1.1 (Depth column) and coverage-service section 2.4, if a
     view-level field is later preferred.
4. **CONFIRMED by owner (2026-09-29; adopted provisionally, then confirmed): when expansion fetches.**
   - Undefined: whether every expansion fetches, and whether results are reused.
   - Adopted:
     - Fetch only when the view is available and `gap_count > 0`.
     - Otherwise render locally, with no request: `0` renders `NO_GAPS`, a row `null`
       renders `GAPS_INAPPLICABLE`, and an unavailable view renders the reason.
     - Cache each result by symbol until the next refresh, filter change or page change
       (T017).
   - Derivation:
     - owner-web-app 5 says "fetched once per expansion".
     - S2's semantics already determine the answer without a call: `[]` for zero, and
       `None` for unavailable or no prices.
     - The design names coverage as the most expensive read.
   - Absorb in: owner-web-app section 5.
5. **CONFIRMED by owner (2026-09-29; adopted provisionally, then confirmed): the "extended interval" in the no-polling test.**
   - Undefined: the story says "asserted with fake timers over an extended interval"
     and gives no length.
   - Adopted: 10 minutes of fake time (T007), plus a 15 s real-time browser check
     (T023).
   - Derivation:
     - Ten minutes is 20 times the longest cadence in the product, the 30 s health poll
       (owner-web-app 2.3), and 60 times the Runs cadence of 10 s. Any accidental
       interval at a product cadence would fire many times.
     - 15 s exceeds the 10 s Runs cadence while staying well inside Playwright's 30 s
       per-test timeout.
   - Absorb in: owner-web-app section 7.
6. **CONFIRMED by owner (2026-09-29; adopted provisionally, then confirmed): copy that no artifact words.**
   - Undefined: exact wording, where UX gives only the substance.
   - Adopted (the constants in T013, plus the toolbar labels in T018):
     - `OUTAGE_SENTENCE`, the STD-UI-18 statement that ux-design 1.1 places "once, below
       the table";
     - `NO_GAPS`;
     - `GAPS_INAPPLICABLE`;
     - the unknown-reason fallback, *Gap detection is unavailable (code).*;
     - the toolbar strings *Last updated …*, *Not yet loaded*, *N instruments shown*,
       *Refresh*, *Next page* and *Previous page*;
     - the expander names *Show / Hide details for {symbol}*;
     - the expansion error *Loading missing dates for {symbol} failed: {message}
       (request {id})*.
   - Derivation:
     - Each is taken from the substance in ux-design 1.1 and STD-UI-1 vocabulary.
     - The error string follows the existing *Loading instruments failed: … (request …)*
       precedent in `screens/instruments/index.tsx` (STD-UI-19: operation, resource,
       reason).
     - The expander name follows ux-design 1.1: "identifies its row rather than saying
       'expand'".
   - The verbatim UX sentences are the never-acquired copy, the no-match copy, the
     unavailable reason and *Short by n years*. They are **not** provisional.
   - Absorb in: ux-design 1.1.
7. **Genuine gap: the Start control's interface is not pinned.**
   - CAP-001-E5-S6-tasks T008 (draft) creates `web/src/screens/runs/run-controls.tsx`
     but names no export or props.
   - T018 composes the control exactly as E5-S6's Runs screen does.
   - If the control needs precondition inputs, S4 supplies them:
     - `historyDepthYears` from `getHistoryDepth()`, following
       `screens/instruments/index.tsx`;
     - the active count from `listInstruments({ lifecycle: "active", limit: 1 }).activeCount`.
   - The T005 tests mock the module, so they do not depend on its shape.
   - **Coordinator action:** plan or implement CAP-001-E5-S6 before CAP-001-E6-S4 is
     coded. The story is `todo`.
8. **Genuine gap: the expansion contents that ux-design 1.1 lists have no source.**
   - ux-design 1.1 says expansion reveals stable identity (CIK, composite FIGI, share
     class FIGI) and per-data-type covered ranges.
   - Neither the ingestion-api section 11 contract nor S3's response carries them, and
     this story's ACs require only gap dates (AC-8) and the unavailable reason
     (DAC-E6-4).
   - The plan renders only those, and invents no field (constraint 3).
   - Absorb in: ux-design 1.1, or ingestion-api section 11 if the owner wants those
     fields.
9. **Genuine gap: the loading skeleton's row count.**
   - ux-design 1.1 specifies "Skeleton at the expected row count". Before the first
     response, no expected count exists.
   - The plan uses the established *Loading coverage…* polite text from
     CAP-001-E2-S4's screens for the first load. On a refresh, existing rows stay
     visible with `aria-busy`, which is the data-table contract's load-bearing part.
   - Absorb in: the data-table spec, or ux-design 1.1.

### Other Notes

- **Density tier (OQ-UI-4)**: this story selects no tier. Rows inherit `--row-height`
  through the theme, as the story's Open Questions record.
- **No date-range controls.** ux-design 1.1's toolbar names only the symbol filter, the
  lifecycle filter and Start.
  - The screen therefore sends no `from` or `to`.
  - The service covers everything acquired (coverage-service 2.3, owner decision
    2026-09-05), which is also what makes a gap older than any window visible.
- **Row-level `gap_count: null` ambiguity** (CAP-001-E6-S3-tasks Open Gap 4). The plan
  follows S3's recommendation:
  - an unavailable view renders `coverage-unknown` in every Gaps cell;
  - a `null` count on an available view renders inapplicable (blank, with an `sr-only`
    label).
- **Shared-file coordination with CAP-001-E5-S6.** Both stories append to
  `web/src/api/types.ts` and `web/src/api/client.ts`, and both touch `routes.tsx`. The
  additions are disjoint. Whichever story lands second rebases, without changing the
  other's code. T012 deliberately uses `client.coverage.test.ts`.
- **Shell edit (T020)** changes two class lists in a CAP-001-E1-S4 file. It is the
  minimum that makes "the table scrolls within its own container rather than the page"
  achievable without a literal viewport height, which STD-UI-29 forbids. It also makes
  the "fixed left rail" of ux-design section 0 literally fixed.
- **Unknown reason codes** are rendered as text and never dropped (T010). The wire value
  is a code, and owner-web-app 2.4 requires the interface not to invent the reason. The
  one known code maps to ux-design 1.1's verbatim sentence.
- **Validation commands** come from the tech stack. No component constitution exists
  beyond the project's `docs/constitution/`. `docs/constitution/standards/ui-conventions.md`
  (STD-UI v4) is binding.
- **Build order.** S4's Vitest suites run against mocks, so they can be written as soon
  as T002–T003 exist. T023 and the real Start control need CAP-001-E6-S1, S2 and S3,
  plus CAP-001-E5-S6, merged first.
