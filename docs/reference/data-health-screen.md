# Data health modules (`web/src/screens/data-health/`)

The Data health screen (component design `data-health-ui` 2.1 to 2.7, 3, 5, 10;
CAP-003-E6-S1 to CAP-003-E6-S5; AC-4, AC-8, AC-12 to AC-17, AC-19, AC-21,
AC-24 to AC-26, AC-28, DAC-E6-1 to DAC-E6-17, DAC-E6-S4-1 to DAC-E6-S4-4,
DAC-E6-S5-1 to DAC-E6-S5-6). `index.tsx` (E6-S5) composes the regions below.
No `/data` route registers it yet (CAP-003-E6-S7); the only importers today are
the modules' own tests. The verdict and the cards take the reads, the retries
and the **Download now** node as props and call no shell hook; `DownloadNow` and
`StopFollowingDialog` (E6-S2) read the shell context for `refresh`.
`RecentDownloads` and `WhatYouFollow` (E6-S4) take no props, read the shell
context (`attention`, `health`) and make their own reads.

| File | Holds |
|---|---|
| `index.tsx` | `DataHealthScreen` (default export), the screen: header, verdict, check grid or empty card, Needs fixing, Recent downloads, What you follow |
| `copy.ts` | Every owner-facing string of the screen, as `as const` objects and small functions |
| `check-card.tsx` | `CheckCard`, `ReadFailure`, `SkeletonLine` |
| `verdict.tsx` | `Verdict`, the page header and the verdict |
| `daily-prices-card.tsx` | `DailyPricesCard` |
| `financials-card.tsx` | `FinancialsCard` |
| `scores-card.tsx` | `ScoresCard` |
| `download-now.tsx` | `DownloadNow`, the **Download now** control |
| `stop-following-dialog.tsx` | `StopFollowingDialog`, the confirmed **Stop following** recovery |
| `problem-row.tsx` | `ProblemRow`, one stock with a problem |
| `needs-fixing.tsx` | `NeedsFixing`, the Needs fixing card (rows, paging, last complete download) |
| `recent-downloads.tsx` | `RecentDownloads`, the five newest downloads |
| `what-you-follow.tsx` | `WhatYouFollow`, the followed and stopped counts, history depth and key presence |

## `copy.ts`

No string carries a DAC-E7-3 term, and a `{reason}` is never an envelope
`message` or `request_id`. Counts are formatted by `formatCount`
(`components/patterns/format`), which adds the thousands separator; the string
functions take already-formatted counts, except `countClause` and `andMore`.

- `PAGE_TITLE` (*Is the data good enough to trust?*), `FULL_COVERAGE_TABLE`,
  `TRY_AGAIN`, `CHECK_TITLES` (`daily_prices`, `company_financials`, `scores`).
- `countClause(n, m)`: *None of the M followed stocks needs attention* at 0,
  the singular form at 1, the plural form otherwise. Both `n` and `m` pass
  through `formatCount`.
- `verdictSentenceRest(n, m, downloadClause)`: the count clause plus `.`, or
  `, and the last download failed.` / `, and the last download was
  interrupted.` for `"failed"` / `"interrupted"`.
- `gapsNotCheckable(reason)`, `checked(time)`, `readFailed(what, reason)`.
- `READ_TARGETS`: `attention`, `checks`, `scores`.
- `readFailureReason(error)`: *FactorFlow is not answering* for an
  `ApiUnreachableError`, otherwise *FactorFlow hit an unexpected problem*
  (DEC-0373). Neither the envelope's `message` nor its `request_id` is shown.
- `ABSENT`: `noData`, `noPrices`, `noFinancials`, `noScores`.
- `andMore(k)`: `and {k} more`. It does not format `k`.
- `gapReason(code)`: `GAP_REASONS` maps the wire code
  `fewer_than_two_instruments_with_data` to its display clause (DEC-0374); an
  unknown code is shown as itself, and `null` is *no reason was given*.
- Daily prices: `allPrices`, `withoutPrices`, `withGaps`, `behind`,
  `GAPS_NOT_DETERMINABLE`, `PRICES_TO`, `PRICES_SCOPE_NOTE`.
- Company financials: `allFinancials`, `withoutFinancials`,
  `withFailedDownloads`, `FINANCIALS_TO`, `FINANCIALS_NOTE`.
- Factor scores: `stocksCurrent`, `showAsIncomplete`, `SCORES_AT`,
  `FROM_DOWNLOAD_STARTED`, `SCORES_NOT_SERVED`.
- Download now: `DOWNLOAD_NOW` (*Download now*), `QUEUED_NOTICE` (*A download is
  running. This starts when it finishes.*), `startFailed(reason)` (*Couldn't
  start the download: {reason}.*) and `START_REFUSALS`, keyed by the wire codes
  of `POST /api/acquisition-runs`, each `{ sentence, fix, to }`:
  `history_depth_not_set` (*Set history depth*, `/settings`) and
  `no_active_instruments` (*Follow stocks*, `/data/followed`). The envelope
  `message` is never rendered.
- Stop following: `STOP_FOLLOWING`, `stopFollowingTitle(symbol)`,
  `stopFollowingDescription(symbol)` (the blueprint section 9 sentence),
  `stopFollowingFailed(symbol, reason)`, `stoppedFollowing(symbol)` and
  `STOP_REFUSAL_REASONS` (DEC-0377): `instrument_not_found` is *FactorFlow
  doesn't follow it*, `instrument_already_retired` is *you already stopped
  following it*.
- Needs fixing: `NEEDS_FIXING`, `needsFixingTitle(n)` (*Needs fixing · N*),
  `FROM_RECENT_DOWNLOADS`, `DATA_TYPE_WORDS` (wire `DataType` to *daily prices*,
  *company financials*, *corporate actions*, *reference data*; the keys are never
  rendered), `downloadFailed(dataType, reason, attempts)` (*Downloading X
  failed: {reason}, N attempts*, with `NO_REASON_RECORDED` for a `null` reason),
  `NOT_RECOGNISED`, `CONSEQUENCE`, `FAILED_FIX`, `NOT_FOUND_FIX`,
  `FOLLOW_DIFFERENT`, and the accessible names `followDifferentName(symbol)`,
  `stopFollowingName(symbol)` and `symbolLinkName(symbol)`.
- Paging and empty state: `SHOW_MORE`, `MORE_PROBLEMS`, `showingOf(shown, n)`,
  `NOTHING_NEEDS_FIXING`, `lastCompleteDownload(time)`, `NO_COMPLETE_DOWNLOAD`
  and `LAST_COMPLETE_TARGET`.
- Recent downloads: `RECENT_DOWNLOADS`, `recentDownloadsSubline(time)` (*Starts
  when you press Download now*, then ` · checked {time}` once `time` is not
  `null`), `DOWNLOAD_COLUMNS` (*Started*, *Outcome*, *Ended*, *Result*),
  `READ_TARGETS.recentDownloads`, `ABSENT.notEnded` (*not ended yet*) and the
  result sentences `writtenOf(written, named)` (*W of N stocks*),
  `partialResult(written, named, failed)` (*W of N stocks, F failed*),
  `interruptedResult(written)` (*FactorFlow restarted mid-download; W kept, the
  rest picked up next time*) and `progressOf(done, total)` (*D of T stocks*).
  The counts are passed already formatted.
- What you follow: `WHAT_YOU_FOLLOW`, `FOLLOWED_STOCKS`, `STOPPED_FOLLOWING`,
  `historyKept(count)` (*N (history kept)*), `HISTORY_DEPTH`,
  `depthYears(years)` (*N years*), `DEPTH_NOT_SET` (*not set*),
  `MARKET_DATA_KEY`, `KEY_NOT_DETERMINABLE_REASON` (*FactorFlow is not
  answering*, the unreachable clause of `readFailureReason`, DEC-0385),
  `MANAGE_FOLLOWED_STOCKS` and `READ_TARGETS.whatYouFollow`.
- Never-downloaded empty card (E6-S5): `NO_DATA_YET` (*No data has been
  downloaded yet.*), `downloadForFollowed(n)` (*Download data for your {n}
  followed stocks to see whether it can be trusted.*; `n` arrives formatted),
  `START_FIRST_DOWNLOAD`, `FOLLOW_FIRST` (*Follow some stocks first.*) and
  `OPEN_SETUP`.
- `isStaleRowRefusal(error)`: true only for an `ApiError` whose code is one of
  those two. `stopFailureReason(error)`: the refusal's reason for them, else
  `readFailureReason(error)`.

## `index.tsx`

### `DataHealthScreen()` (default export)

Reads `attention`, `scores` and `refresh` from the shell context and the
aggregate from `useDataHealth()`, which this module calls and no other does.
The aggregate is read on load, on **Try again**, once when the latest download
turns terminal (the hook's own trigger) and after a successful **Stop
following**; there is no timer. The root is a flex column capped at
`LAYOUT.contentMaxWidth`. In order: `Verdict`, one `StateRegion` slot over
attention's read, `NeedsFixing`, then a two-column grid of `RecentDownloads`
and `WhatYouFollow`. `/data` sets no title detail (DEC-0214).

- **Slot:** `slotState` maps attention to a `ScreenState`: loading to
  `loading`; an error to `unavailable` with `readFailureReason`; a null
  `latest_terminal_download` to `empty-never-populated` (never
  `never_acquired`, DAC-E6-7); otherwise `populated`. `loading`, `populated`
  and `unavailable` render the check grid (`unavailable` with the aggregate's
  own reads); `empty-never-populated` renders `EmptyCard`; `empty-no-match`,
  `partial`, `error` and `unreachable` are declared not applicable.
- **Check grid** (`CheckGrid`): a four-column grid. Daily prices and Company
  financials show a skeleton card while the slot loads or the aggregate loads,
  a `ReadFailure` (`readFailed(READ_TARGETS.checks, ...)`, retrying the
  aggregate) on its error, else their cards. Factor scores shows a skeleton
  while the slot loads, else `ScoresCard`, whose retry is `refresh("scores")`.
- **Empty card** (`EmptyCard`): titled `NO_DATA_YET`. With followed stocks it
  shows `downloadForFollowed` and a `DownloadNow` labelled
  `START_FIRST_DOWNLOAD`; with none it shows `FOLLOW_FIRST` and an **Open
  setup** link to `/setup`.
- **Which lower regions mount:** while attention is not an answer, all do.
  Once it answers with no terminal download: Needs fixing only while the
  aggregate's `affected_count` is above zero, Recent downloads only when
  `latest_download` is not null, and What you follow not at all. Otherwise all
  three. They mount while attention loads and read once (DEC-0405).

`web/src/components/token-literals.test.ts` scans this directory for style
literals (tests excluded; TC-COMP-178, DAC-E6-S5-4).

## `check-card.tsx`

### `CheckCard({ title, status?, result?, asOf?, children? })`

A `section` named by its `h2` title (`aria-labelledby`), a `Card` of variant
`metric`, the status beside the title, then the result (`p`, semibold), the
as-of line (`p`, small, muted) and the children. `status`, `result` and `asOf`
each render only when given (`undefined` omits; `null` content still renders its
wrapper).

### `ReadFailure({ sentence, onRetry })`

The sentence in an `output` (status region) and **Try again** (`outline`
`Button`) outside it, following `StateRegion`'s convention (DEC-0314) without
importing it, because `StateRegion` takes a `ScreenState`, not the shell's
`ReadState`.

### `SkeletonLine()`

One `aria-busy` pulsing placeholder line.

## `verdict.tsx`

### `Verdict({ attention, dataHealth, onRetryAttention, onRetryDataHealth, downloadNow })`

A `header` with the `h1` (`tabIndex={-1}`), **Full coverage table** (a link to
`/data/coverage`) and the `downloadNow` node, then one body, chosen in this
order:

| State | Body |
|---|---|
| `attention` loading | `SkeletonLine` |
| `attention` error | `ReadFailure` for *what needs attention*, retrying `onRetryAttention` |
| `dataHealth` loading | `SkeletonLine` |
| `dataHealth` error | `ReadFailure` for *the data health checks*, retrying `onRetryDataHealth` |
| both served | the verdict sentence, the optional gaps line, the checked line |

A failed read's `last` is never read, and no tier is computed while a read
loads or fails. When both are served, the tier is `worstDataTier` over
`affected_count`, `followed_count` and
`attention.latest_terminal_download?.state`; the checks' tiers never feed it.
When `worstDataTier` returns `null` the body renders nothing.

The served body is:

- `p[data-testid="verdict-sentence"]`: the `StatusBadge` with the answer's word,
  a screen-reader-only `.`, then `verdictSentenceRest(...)`.
- A line `gapsNotCheckable(gapReason(reason))`, only when the Daily prices check
  is present and its `gap_stock_count` is `null`.
- `checked(formatClock(checked_at))`.

## Check cards

Each card takes the check from `DataHealth["checks"]`. Zero parts are omitted
and a `null` is never shown as `0`. A `null` check (Daily prices, Company
financials) is DAC-E6-7's null state: the title with `Absent("no data stored
yet")` as both status and result, and nothing else.

Exception symbols follow the as-of line as ` · SYM, SYM`, then
` and {k} more` when `exception_count` exceeds the symbols served
(`k = exception_count - exception_symbols.length`). `k` is printed as a plain
number, without `formatCount`'s thousands separator, so a four-digit `k`
reads *and 1195 more* beside separated counts (open review finding
CAP-003-E6-S1 v2 IR-001).

### `DailyPricesCard({ check, followedCount })`

- Status: `NotDeterminable` (reason from `gapReason`) when `status` is
  `not_determinable`, otherwise a `StatusBadge` of `tierOf` / `labelOf` for the
  check.
- Result: when `status` is `ok`, *All M stocks have prices to {date}*
  (`followedCount`, `latest_session`), or the absent dash when
  `latest_session` is `null`. Otherwise the non-zero parts joined by `, `, in
  this order: *N without prices* (`absent_count`); *N with gaps*
  (`gap_stock_count`) or `NotDeterminable` *Gaps not determinable* when it is
  `null`; *N behind {date}* (`behind_count`, only with a `latest_session`).
- As-of: *Prices to {date}* (`formatSessionDate`, or the absent dash *no prices
  stored yet*), then the exception symbols.
- Children: `PRICES_SCOPE_NOTE` and a **Full coverage table** `outline` link to
  `/data/coverage`.

### `FinancialsCard({ check, followedCount })`

- Status: a `StatusBadge` of the check's `status`.
- Result: *All M stocks have financials* when `ok`, otherwise the non-zero
  parts joined by `, `: *N without financials* (`absent_count`), *N with failed
  downloads* (`problem_count`).
- As-of: *Financials to {instant}* (`formatInstant(as_of)`, or *no financials
  stored yet* when `as_of` is `null`), then the exception symbols.
- Children: `FINANCIALS_NOTE`; the card checks presence and download, not
  correctness.

### `ScoresCard({ scores, onRetryScores })`

Reads the shell's `ScoreState`, never a `followed_count` of its own; its counts
come from `stocks_current` alone.

| `scores.kind` | Card |
|---|---|
| `loading` | title and a `SkeletonLine` |
| `not_served` | title and `NotDeterminable` *FactorFlow can't read scores yet.* |
| `error`, `last` is `null` | title and `ReadFailure` for *the factor scores*, retrying `onRetryScores` |
| `error`, `last` set | the served card over `last` |
| `served` | the served card over `data` |

The served card: status is a `StatusBadge` for the state, chosen in this
order: `never_classified`; `later.state` `building`; `later.state` `failed`;
`set.not_current`; otherwise `current`. `not_current` is checked after `later`
because CAP-002 sets it exactly when `later` is non-null, so that branch is
unreachable on real data and kept to match the epic's order. The result is
*C of F stocks current* from `stocks_current`, or the absent dash *no scores
yet* when it is `null`. The as-of line, only when `set` is non-null, is
*Scores {ended_at} · from the download started {run_started_at}*, the last a
link to `/data/downloads/{run_id}`. When `F - C > 0`, the children carry *K
stocks show as Incomplete until their data is complete*.

## `download-now.tsx`

### `DownloadNow({ label? })`

A `default` `Button` labelled `label` (default `DOWNLOAD_NOW`). The page header,
Needs fixing and the empty state's first download all render it. The post
carries no argument, so it always covers the whole followed list; there is no
per-stock retry. It asks for no confirmation, navigates nowhere and renders no
status.

A click calls `startAcquisitionRun()`. A ref guard drops a click made while a
start is in flight, and the button carries `aria-busy` meanwhile. Each start
clears the previous outcome first. The outcomes:

| Result | Renders |
|---|---|
| Started, `queuedBehind` is `null` | nothing; calls `refresh("attention")` |
| Started, queued behind a running download | `QUEUED_NOTICE` in an `output` |
| `ApiError` whose `code` is a `START_REFUSALS` key | the refusal's sentence in an `output`, and its `fix` as an `outline` link to `to` |
| Anything else | `startFailed(readFailureReason(...))` in an `output`, and **Try again** (`outline`), which starts again |

Only an `ApiUnreachableError` reads as *FactorFlow is not answering*; any other
thrown value, an `ApiError` with another code included, reads as *FactorFlow hit
an unexpected problem*. No thrown value's own text and no request id is shown.

## `stop-following-dialog.tsx`

### `StopFollowingDialog({ symbol, onClose, onStopped, onRefusalClosed, fallbackFocusRef })`

The design system's `ConfirmDialog` (`confirm`, never `destructive`, because
nothing is deleted), open while `symbol` is not `null`. Cancel is first and
focused and focus is trapped, both from the shared dialog. The title and
description come from `stopFollowingTitle` and `stopFollowingDescription`, the
confirm button is **Stop following**, and the dialog keeps the last symbol so
its text survives the close. Opening it clears any earlier failure.

A confirm calls `retireInstrument(symbol)` with `pending` set:

- **Success:** closes the dialog (`onClose`), calls `onStopped`, calls
  `refresh("attention")` and announces `stoppedFollowing(symbol)` in a polite
  screen-reader-only `output`. A new announcement remounts its `span` (keyed by
  a serial) so a repeat is read again. No toast is raised.
- **Failure:** the dialog stays open with `stopFollowingFailed(symbol, reason)`
  in an `output`; `reason` is `stopFailureReason(error)`. Anything that is
  neither an `ApiError` nor an `ApiUnreachableError` reads as the unexpected
  problem.

Closing the dialog while a `404` or `409` refusal shows calls `onRefusalClosed`
once, because only those two mean the row is stale; any other failure leaves the
row alone and the callback uncalled.

Focus: the opener is the focused element when the dialog opens. After a
successful stop, or after closing on a stale-row refusal, the dialog watches for
the opener's row to leave. If the row has left and focus has fallen to the body,
it moves focus to `fallbackFocusRef` (the Needs fixing heading), checking again
after a tick because a row can leave in the same update as the close. Focus the
owner has placed elsewhere is never moved; the closing dialog's own buttons do
not count as elsewhere.

Caller contract: render it beside the rows so it re-renders with them (do not
wrap it in `memo`), give the heading `tabIndex={-1}`, and decide what
`onRefusalClosed` re-reads.

## `problem-row.tsx`

### `ProblemRow({ row, onStopFollowing })`

An `li` for one `ProblemRow` of the aggregate (`row.symbol`, `row.failures`,
`row.retryable`):

- The symbol is a link to `/data/coverage?symbol=<encoded symbol>`, named by
  `symbolLinkName`.
- Each failure is one line: a `StatusBadge` (tier and label from the `result`
  status of its outcome) and `downloadFailed(...)` for `failed`, or
  `NOT_RECOGNISED` for `not_found`. A provider `reason` is rendered as a text
  child, never markup.
- `CONSEQUENCE` always follows. Each fix renders once per row, however many
  failures of that outcome the row has.
- A `failed` outcome adds `FAILED_FIX` and no control: the card header's
  **Download now** is the action.
- A `not_found` outcome adds **Stop following** (`ghost`, calls
  `onStopFollowing(symbol)`), **Follow a different symbol** (`outline` link to
  `/data/followed` with router state `{ focusAdd: true }`) and `NOT_FOUND_FIX`.

## `needs-fixing.tsx`

### `NeedsFixing({ dataHealth, onReread })`

`dataHealth` is a `ReadState<DataHealth>`; `onReread` re-reads the aggregate.
The card calls no shell hook itself; its children (`DownloadNow`,
`StopFollowingDialog`) do.

- **Loading:** the heading *Needs fixing* without a count and three
  `SkeletonLine`s. **Error:** the heading and a `ReadFailure` with
  `readFailed(READ_TARGETS.checks, readFailureReason(error))`, retrying through
  `onReread`. The last answer's rows are never shown beside a failure.
- **Answer:** the heading is `needsFixingTitle(affected_count)`, with
  `FROM_RECENT_DOWNLOADS · checked(formatClock(checked_at))` beneath it.
  **Download now** shows in the header when any row is `retryable`.
- **`affected_count` is 0:** `NOTHING_NEEDS_FIXING` and `LastComplete`, which
  calls `listAcquisitionRuns({ state: "succeeded", limit: 1 })` once per
  aggregate answer and shows `lastCompleteDownload(...)` of the run's
  `startedAt` (else `requestedAt`), `NO_COMPLETE_DOWNLOAD` when there is none, or
  a `ReadFailure` with a retry. A read an answer has outdated is ignored.
- **Otherwise:** the rows are `problems.rows` of the answer, then the pages
  **Show more** appends. **Show more** (`outline`, `aria-busy` while pending)
  calls `fetchProblems(cursor, 50)` and appends the page, and shows while the
  cursor is not `null`. Each new answer restarts from its first page, discarding
  appended rows, the cursor, any page failure and any in-flight page, so a count
  and its rows always come from one response. A request an answer has outdated
  is ignored.
- **Paging announcements:** `showingOf(rows, affected_count)` in a polite
  screen-reader-only `output`, remounted per announcement.
- **Paging failure:** `readFailed(MORE_PROBLEMS, reason)` in an `output` and
  **Try again**, which calls `onReread`. A thrown value that is neither an
  `ApiError` nor an `ApiUnreachableError` reads as the unexpected problem.
- **Focus:** when the last page loads while **Show more** has focus, focus moves
  to the list (`tabIndex={-1}`); when a page fails while it has focus, focus
  moves to **Try again**.
- One `StopFollowingDialog` sits beside the rows, opened by a row's
  **Stop following**, with the heading as `fallbackFocusRef`; both `onStopped`
  and `onRefusalClosed` call `onReread`. Its open symbol is dropped when the
  answer is not `ok`.

## `recent-downloads.tsx`

### `RecentDownloads()`

A `section` named by its card title (`RECENT_DOWNLOADS`), with
`recentDownloadsSubline(...)` beneath it. The subline carries *checked {time}*
(`formatClock`) of the last time the list answered, kept when a later read
fails.

- **Reads:** `listAcquisitionRuns({ limit: 5 })` on mount, and again on each new
  `attention` answer (a changed `checkedAt`) while the latest download is
  `requested`, `running` or `cancelling`. It is never read otherwise and no
  timer is set. A retry calls the same read; a read a later one has outdated is
  ignored. A thrown value that is neither an `ApiError` nor an
  `ApiUnreachableError` is rethrown.
- **Loading:** three `SkeletonLine`s. **Error:** the body is replaced by a
  `ReadFailure` with `readFailed(READ_TARGETS.recentDownloads,
  readFailureReason(error))`, retrying the read.
- **Answer:** a compact `DataTable` with *Started* as the row header. The rows
  are ordered running or cancelling first, then requested, then the outcomes,
  each group keeping the list's order. *Started* is `startedAt` (else
  `requestedAt`) through `formatInstant`, a link to
  `/data/downloads/{runId}`; *Outcome* is a `StatusBadge` from `tierOf` /
  `labelOf` of the download's state; *Ended* is `formatInstant(endedAt)` or the
  absent `ABSENT.notEnded`.
- **Result:** `partialResult` for `partial`, `interruptedResult` for
  `abandoned`, `writtenOf` otherwise. For the download that is the attention
  answer's latest and not finished, the cell shows `progressOf` in a polite
  live region and a `Progress` bar from its `progress`; with no `total` yet it
  is an indeterminate bar named by the row's outcome label (DEC-0384).

## `what-you-follow.tsx`

### `WhatYouFollow()`

A `section` named by its card title (`WHAT_YOU_FOLLOW`), a `summary` card.

- **Reads:** `listInstruments({ limit: 1 })` and `getHistoryDepth()` together on
  mount; a retry re-reads both and shows the skeleton again. Either failing
  replaces the body with a `ReadFailure` (`readFailed(READ_TARGETS.whatYouFollow,
  ...)`); a result a later read has outdated is ignored. A non-API thrown
  value is rethrown.
- **Loading:** three `SkeletonLine`s.
- **Answer:** a definition list: *Followed stocks* (`activeCount`), *Stopped
  following* (`historyKept(retiredCount)`), *History depth* (a link to
  `/settings`: `depthYears(years)`, or `DEPTH_NOT_SET` when `years` is `null`)
  and *Market data key*, then a **Manage followed stocks** `outline` link to
  `/data/followed` in the footer. Counts pass through `formatCount`.
- **Market data key:** when the shell's `health.liveness` is `answering` and a
  health answer is held, a `StatusBadge` of `tierOf` / `labelOf` for
  `credential_present`; otherwise `NotDeterminable` with
  `KEY_NOT_DETERMINABLE_REASON`, because `health` keeps its last answer while
  unreachable. Only `credential_present` is read; the key's value is never
  shown.

Tests: `check-cards.test.tsx`, `verdict.test.tsx`, `download-now.test.tsx`,
`stop-following-dialog.test.tsx`, `problem-row.test.tsx`,
`needs-fixing.test.tsx`, `recent-downloads.test.tsx`,
`what-you-follow.test.tsx`, `data-health.test.tsx` (the screen).
