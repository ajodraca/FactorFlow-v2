# Home header, market state and copy catalogue (`web/src/screens/home/`)

The first three modules of the Home screen (component design `home-ui` 2.1 and
2.3; CAP-003-E5-S1; AC-24 to AC-26, DAC-E5-6, DAC-E5-S1-1). Their module shape is
provisional, recorded as DEC-0362. Nothing mounts them yet: the Home screen
itself and its route registration come with CAP-003-E5-S2 and CAP-003-E5-S3,
and the only importers today are the modules' own tests and, for `copy.ts`,
`header.tsx`.

| File | Holds |
|---|---|
| `market-state.ts` | `chicagoWallClock`, `marketState` and their types |
| `header.tsx` | `HomeHeader` |
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

## `copy.ts`

Holds every owner-facing Home string the designs fix, so the header, the data
tile and the *Needs you* card share one source. The shape follows
`screens/research/copy.ts`: grouped `as const` objects of constants and template
functions (DEC-0362). Only the header's strings are rendered so far.

| Export | Holds |
|---|---|
| `NOT_DETERMINABLE` | The hidden words of every Home em dash, *not determinable* |
| `CHECKED` | The prefix of the as-of line's last part, *checked* |
| `TRY_AGAIN` | The retry action of a failed read, *Try again* |
| `HEADER` | `heading(weekday, date)`, `marketClosed`, `marketNotDeterminable`, `noTradingCalendar`, `pricesCurrentTo` (a prefix, so `Absent` can follow it) and `pricesNotDownloaded` |
| `DATA_TILE` | The data tile's title, figure text, as-of labels, scope line, first-download and read-error messages, and its accessible names |
| `NEEDS_YOU` | The card's title, `heading(count)`, sub-line, empty message and read-error message |
| `EMPTY_STATE` | The title, body and *Start setup* action shown before any download |
| `ITEMS` | The six item kinds of `ui-components` 2.6 (`data_problems`, `download_not_complete`, `credential_missing`, `first_download`, `first_scores`, `score_failed`), each with its tag, title, body and action text. `data_problems.title` lists one, two or three symbols, or the first symbols and how many more |

Left out on purpose: tier and status labels (`labelOf`), the answer words
(`worstDataTier`), and route targets (`deriveNeedsYou` and the router). A story
whose criteria need a string no artifact fixes adds it with a doc comment saying so.
`listOf` is private and restated here because a screen must not import another
screen.
