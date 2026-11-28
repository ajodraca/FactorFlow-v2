# Data health verdict and check cards (`web/src/screens/data-health/`)

The first modules of the Data health screen (component design `data-health-ui`
2.1, 2.3 and 2.4; CAP-003-E6-S1; AC-8, AC-19, DAC-E6-1 to DAC-E6-5). Nothing
mounts them yet: there is no screen `index.tsx` and no `/data` route
registration, and the only importers today are the modules' own tests. The
screen passes in the reads, the retries and the **Download now** control; no
module here mounts a provider or calls a shell hook.

| File | Holds |
|---|---|
| `copy.ts` | Every owner-facing string of the screen, as `as const` objects and small functions |
| `check-card.tsx` | `CheckCard`, `ReadFailure`, `SkeletonLine` |
| `verdict.tsx` | `Verdict`, the page header and the verdict |
| `daily-prices-card.tsx` | `DailyPricesCard` |
| `financials-card.tsx` | `FinancialsCard` |
| `scores-card.tsx` | `ScoresCard` |

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

Tests: `check-cards.test.tsx`, `verdict.test.tsx`.
