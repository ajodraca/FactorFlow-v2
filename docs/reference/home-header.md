# Home screen: header, market state, data tile, Needs you card and copy catalogue (`web/src/screens/home/`)

The modules of the Home screen (component design `home-ui` 2.1 to 2.5;
CAP-003-E5-S1, E5-S2 and E5-S3; AC-7 to AC-12, AC-16, AC-21, AC-24 to AC-26,
DAC-E5-1 to DAC-E5-11, DAC-E5-S1-1, DAC-E5-S2-1 to DAC-E5-S2-5,
DAC-E5-S3-1 to DAC-E5-S3-4). Their module shape is provisional, recorded as
DEC-0362 and, for the card and the screen, DEC-0367. `index.tsx` composes them
into `HomeScreen`, but no route renders it yet: CAP-003-E5-S5 registers `/home`
(`web/src/app/titles.ts`), and the only importers of `index.tsx` today are its
own tests.

| File | Holds |
|---|---|
| `market-state.ts` | `chicagoWallClock`, `marketState` and their types |
| `header.tsx` | `HomeHeader` |
| `data-tile.tsx` | `DataTile` |
| `needs-you-card.tsx` | `NeedsYouCard`, `NEEDS_YOU_STATES` |
| `index.tsx` | `HomeScreen` (default export) |
| `copy.ts` | Every Home string the designs fix, as grouped `as const` objects |

## `market-state.ts`

Reads the America/Chicago wall clock from `Intl.DateTimeFormat` parts and never
the viewer's machine zone, so the date and state are the same across a DST change.

### `chicagoWallClock(now: Date): ChicagoWallClock`

Returns `{ weekday, date, minutes }`: the English weekday (`en-US`, long), the
ISO date `YYYY-MM-DD`, and minutes after midnight on a 24-hour clock
(`hourCycle: "h23"`, so midnight is hour 0, never 24).

### `marketState(now: Date): MarketState`

`MarketState` is `"closed" | "not_determinable"`; there is no `open`.

| Chicago time | Result |
|---|---|
| Saturday or Sunday, any time | `closed` |
| Weekday, before 08:30 | `closed` |
| Weekday, 08:30 up to but not including 15:00 | `not_determinable` |
| Weekday, 15:00 or later | `closed` |

Inside weekday session hours the state is `not_determinable` because FactorFlow
has no trading calendar, so a holiday or early close cannot be told from a
session (DEC-0206).

## `header.tsx`

### `HomeHeader(): JSX.Element`

Takes no props. It reads `attention` from `useShell()` (see
[`shell-context.md`](shell-context.md)) and makes no read of its own. A private
`useMinuteClock` hook holds the current instant in state and renews it with a
repeating `setInterval` every 60 000 ms, cleared on unmount; the date and the
market state are recomputed from the clock alone.

Renders a `<header>` holding:

- an `h1` (`text-xl`) reading *{Weekday}, {YYYY-MM-DD}* in America/Chicago, from
  `HEADER.heading` (DEC-0209);
- while `attention.kind` is `loading`, a placeholder `div`
  (`data-testid="home-as-of-skeleton"`, `aria-hidden="true"`, `animate-pulse`)
  in place of the as-of line;
- otherwise an `AsOfLine` (see [`component-patterns.md`](component-patterns.md))
  with three parts, *{market state} · {prices} · {checked}*.

| Part | Content |
|---|---|
| Market state | `closed`: the text *Market closed*. `not_determinable`: `NotDeterminable` labelled *Market state not determinable*, with the reason *FactorFlow has no trading calendar, so it can't tell a session from a holiday.* |
| Prices, attention `ok` and `prices_as_of` null | *prices not downloaded yet* |
| Prices, attention `ok` | *prices current to {date}*, the date through `formatSessionDate`, unshifted |
| Prices, attention not `ok` (`loading` is never shown; `error` or any other state) | *prices current to* followed by `Absent` with the hidden label *not determinable* |
| Checked, with an answered read | *checked {time}*: the server's `checked_at` through `formatClock`, never the client's `checkedAt`. An `error` state with a retained `last` read keeps showing that read's `checked_at`, so the time ages while the read fails |
| Checked, no answered read | *checked* followed by `Absent` with the hidden label *not determinable* |

The header uses `ui-components` patterns and theme tokens only (AC-26).

## `data-tile.tsx`

### `DataTile(): JSX.Element | null`

Takes no props. It reads `attention`, `scores` and `refresh` from `useShell()`
(see [`shell-context.md`](shell-context.md)) and makes no read of its own and
never the aggregate (DEC-0219 withdrawn). It is one `section` labelled by its
`CardTitle`, *Data* (`DATA_TILE.title`), over a `Card` of variant `metric`. It
picks one of six states, in this order:

| State | When | Renders |
|---|---|---|
| Skeleton | `attention` is `loading`; or a badge exists and `scores` is `loading` | The title over one `animate-pulse` block (`data-testid="data-tile-skeleton"`, `aria-busy`), no link |
| Error | `attention` is `error`; or a badge exists and `scores` is `error` | The title, *Couldn't read the data summary: {reason}.* and a *Try again* button (`type="button"`) that calls `refresh("attention")` or `refresh("scores")`; no badge, figure or link, and never the last good answer |
| Nothing | `attention.data.latest_download` is `null` | `null`; the empty state is another module's |
| First download | No download has ended | The link card with the sentence *Your first download, started {time}, is running.*, the time from `started_at`, else `requested_at`, through `formatInstant`; no hero, as-of line or lag badge. While the download's state is `running` a *Downloading* `StatusBadge` shows in the header slot under the title |
| Full | A download has ended and `scores` has answered | The link card below |

The error reason is one fixed sentence per kind of failure, never the server's
message or request id: `READ_FAILURE.unreachable` for `ApiUnreachableError`,
`READ_FAILURE.unexpected` otherwise (DEC-0366).

**Badge.** `worstDataTier` takes `attention.problems.stock_count`,
`followed_count` and `latest_terminal_download.state`; `dataTileBadge` then adds
the scores' status (see [`component-patterns.md`](component-patterns.md#the-data-verdict-worst-data-tierts)).
The badge is `null` exactly when no download has ended, which is how the First
download state is chosen. The scores status is `null` while `scores` is not
`served`; otherwise the first of: `never_classified` when the summary says so,
`building` or `failed` when `later` is in that state, `not_current` when
`set.not_current` is true, else `current` (data-health-ui 2.4 order). The badge
is in `data-testid="data-tile-badge"`.

**Full state.** One `Link` to `/data` with `aria-label` set to the card's
accessible name wraps the card. Under the header, in document order:

1. The hero: the current stock count, then *of {followed} stocks current*. The
   count is `stocks_current.current_count` and the followed count
   `stocks_current.followed_count`, falling back to `attention.followed_count`
   when `stocks_current` is absent; both through `formatCount`, so a four-digit
   count shows its `,`. With no `stocks_current` the count is `Absent`
   (*not determinable*).
2. The scores line: *Scores {time}*, the time from `scores.set.ended_at`
   through `formatInstant`; with no set, the *Never classified* label alone;
   with `scores` not served, *Scores* then `Absent`.
3. The prices line: *Prices {date}* from `prices_as_of` through
   `formatSessionDate`; with `prices_as_of` null, *Prices* then `Absent` with the
   hidden label *not downloaded yet*.
4. The scope sentence, *Every other number on this page is as of those times.*
5. A *Not current* `StatusBadge` (`data-testid="data-tile-lag"`) when `scores`
   is served and either `set.not_current` is true or a `later` set exists.

Every badge goes through `StatusBadge` and every dash through `Absent`.

**Accessible name.** `DATA_TILE.name` of the badge label (first letter
lower-cased), the count (or *not determinable*), the followed count, the scores
time (the *Never classified* label lower-cased when no set; *not determinable*
when not served) and the prices date (or *not downloaded yet*), e.g. *Data:
mostly yes. 1,233 of 1,236 stocks current. Scores {time}, prices {date}.* The
First download state uses `DATA_TILE.firstDownloadName(time)`.

No domain term of the data model appears in any tile string (DAC-E5-S2-4).

Tests: `data-tile.test.tsx`.

## `needs-you-card.tsx`

### `NeedsYouCard(): JSX.Element`

Takes no props. It reads `attention`, `scores` and `refresh` from `useShell()`
(see [`shell-context.md`](shell-context.md)) and makes no read of its own. When
`attention` is `ok` it builds the list with
`sortAttention(deriveNeedsYou(attention.data, scores))` (see
[`component-patterns.md`](component-patterns.md#the-needs-you-list-needs-youts)),
so the card and the rail's count share one derivation. It renders a `section`
labelled by its `CardTitle`, over a `Card` of variant `default`, holding the
heading, the *checked* time, the sub-line (`NEEDS_YOU.subLine`) and a
`StateRegion` whose renderers are `NEEDS_YOU_STATES`.

| `attention` | Heading | Body |
|---|---|---|
| `loading` | *Needs you* | Skeleton: three `animate-pulse` rows (`data-testid="needs-you-skeleton"`, `aria-hidden`) |
| `ok`, items present | *Needs you · {n}*, `n` through `formatCount` | One `NeedsYouItemRow` per item, in sorted order, keyed by kind |
| `ok`, no items | *Needs you · 0* | *Nothing needs you right now.* |
| `error` | *Needs you ·* then `Absent` (*not determinable*) | *Couldn't read what needs you: {reason}.* with the shell's *Try again* retry, which calls `refresh("attention")` |

The reason of the error body is `READ_FAILURE.unreachable` for
`ApiUnreachableError` and `READ_FAILURE.unexpected` otherwise, never the server's
message (DEC-0366). *checked {time}* is the server's `checked_at` through
`formatClock`; under `error` it keeps showing the retained `last` read's time,
or *checked* then `Absent` when none was answered. A visually hidden `output`
announces the heading's count when the list is known.

`NEEDS_YOU_STATES` gives a renderer for `loading`, `populated` and `error`. The
other states carry a `notApplicable` reason: `empty-never-populated` (the screen
shows the empty card instead), `empty-no-match`, `partial`, `unavailable` and
`unreachable` (the shell replaces the main region).

**Item copy.** A private `itemCopy` maps each item kind to the `title`, `body`,
`actionLabel` and `actionName` the row takes, from `ITEMS`. Every action only
navigates, to the item's `target`.

| Kind | Title and body come from |
|---|---|
| `data_problems` | `attention.problems.symbols` and `stock_count` |
| `download_not_complete` | `item.tier`: `critical` is the failed wording with `latest_terminal_download.failure_reason`, anything else the interrupted wording; the ended time is `item.recordedAt` through `formatInstant` |
| `credential_missing` | Fixed copy |
| `first_download` | `latest_download.progress` (`done`, `total`); `0` and no total when absent |
| `first_scores` | Fixed copy |
| `score_failed` | `scores.data.later.failure_reason` and, when a set exists, `set.run_started_at` through `formatInstant` |

A missing failure reason reads `NO_REASON`, *No reason was recorded* (DEC-0369).

## `index.tsx`

### `HomeScreen(): JSX.Element`

The default export. Takes no props and adds no `main` or `h1`: it renders inside
the shell's main region, in a column of `LAYOUT.contentMaxWidth`. It reads
`attention` from `useShell()` and renders `HomeHeader`, then:

| Condition | Renders after the header |
|---|---|
| `attention` is `ok` and `latest_download` is `null` | The empty state: a `section` with *No data has been downloaded yet.*, *Set up FactorFlow to name the stocks to follow and start the first download.* and a *Start setup* link (`Button asChild`) to `/setup`. No tile and no list |
| Otherwise, including `loading` and `error` | `data-testid="home-summary-row"` holding `DataTile`, then `NeedsYouCard` |

`web/src/screens/home/` is under the literal scan of
`web/src/components/token-literals.test.ts` (AC-26), which excludes test files.

Tests: `needs-you-card.test.tsx`, `home.test.tsx`, `copy.test.ts`.

## `copy.ts`

Holds every owner-facing Home string the designs fix, so the header, the data
tile and the *Needs you* card share one source. The shape follows
`screens/research/copy.ts`: grouped `as const` objects of constants and template
functions (DEC-0362). The header, the data tile, the card and the empty state render these strings.

| Export | Holds |
|---|---|
| `NOT_DETERMINABLE` | The hidden words of every Home em dash, *not determinable* |
| `CHECKED` | The prefix of the as-of line's last part, *checked* |
| `TRY_AGAIN` | The retry action of a failed read, *Try again* |
| `HEADER` | `heading(weekday, date)`, `marketClosed`, `marketNotDeterminable`, `noTradingCalendar`, `pricesCurrentTo` (a prefix, so `Absent` can follow it) and `pricesNotDownloaded` |
| `DATA_TILE` | The data tile's title, figure text, as-of labels, scope line, first-download and read-error messages, and its accessible names. CAP-003-E5-S2 added `pricesNotDownloaded`, *not downloaded yet*, the hidden words of the prices dash (DEC-0365) |
| `READ_FAILURE` | The `{reason}` of the tile's read-error message, one fixed sentence per failure kind: `unreachable` (*FactorFlow is not answering*) and `unexpected` (*FactorFlow hit an unexpected problem*) (DEC-0366) |
| `NEEDS_YOU` | The card's title, `heading(count)`, `headingPrefix` (*Needs you ·*, before an `Absent` count; DEC-0367), sub-line, empty message and read-error message |
| `NO_REASON` | *No reason was recorded*, the body's reason when a failure reason is null (DEC-0369) |
| `EMPTY_STATE` | The title, body and *Start setup* action shown before any download |
| `ITEMS` | The six item kinds of `ui-components` 2.6 (`data_problems`, `download_not_complete`, `credential_missing`, `first_download`, `first_scores`, `score_failed`), each with its tag, title, body, action text and an `actionName` (the link's accessible name, which names the item; DEC-0368). `data_problems.title` and `actionName` list one, two or three symbols, or the first symbols and how many more |

Left out on purpose: tier and status labels (`labelOf`), the answer words
(`worstDataTier`), and route targets (`deriveNeedsYou` and the router). A story
whose criteria need a string no artifact fixes adds it with a doc comment saying so.
`listOf` is private and restated here because a screen must not import another
screen.
