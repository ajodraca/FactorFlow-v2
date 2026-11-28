# Data health modules (`web/src/screens/data-health/`)

The first modules of the Data health screen (component design `data-health-ui`
2.1, 2.3, 2.4 and 2.7; CAP-003-E6-S1 and CAP-003-E6-S2; AC-8, AC-14, AC-15,
AC-17, AC-19, DAC-E6-1 to DAC-E6-5, DAC-E6-11, DAC-E6-12). Nothing mounts them
yet: there is no screen `index.tsx` and no `/data` route registration, and the
only importers today are the modules' own tests. The verdict and the cards take
the reads, the retries and the **Download now** node as props and call no shell
hook; `DownloadNow` and `StopFollowingDialog` (E6-S2) read the shell context for
`refresh`.

| File | Holds |
|---|---|
| `copy.ts` | Every owner-facing string of the screen, as `as const` objects and small functions |
| `check-card.tsx` | `CheckCard`, `ReadFailure`, `SkeletonLine` |
| `verdict.tsx` | `Verdict`, the page header and the verdict |
| `daily-prices-card.tsx` | `DailyPricesCard` |
| `financials-card.tsx` | `FinancialsCard` |
| `scores-card.tsx` | `ScoresCard` |
| `download-now.tsx` | `DownloadNow`, the **Download now** control |
| `stop-following-dialog.tsx` | `StopFollowingDialog`, the confirmed **Stop following** recovery |

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
- `isStaleRowRefusal(error)`: true only for an `ApiError` whose code is one of
  those two. `stopFailureReason(error)`: the refusal's reason for them, else
  `readFailureReason(error)`.

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

Tests: `check-cards.test.tsx`, `verdict.test.tsx`, `download-now.test.tsx`,
`stop-following-dialog.test.tsx`.
