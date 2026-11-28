# Followed stocks modules (`web/src/screens/instruments/`)

The Followed stocks screen at `/data/followed` (owner-web-app 2.1, 2.3, 2.4;
UX design 1.6; CAP-003-E7-S3; AC-5, AC-14, AC-17 to AC-20, AC-24 to AC-26,
DAC-E7-6, DAC-E7-9, DAC-E7-11, DAC-E7-S3-1 to DAC-E7-S3-6). The directory keeps
its delivered name, `instruments` (DAC-E7-13); the default export of `index.tsx`
is still `InstrumentsScreen`. The screen sends and receives what CAP-001
delivered: `GET`/`POST /api/instruments` and `DELETE /api/instruments/{symbol}`
through `api/client`. Nothing about the wire changed, only the words on the
screen.

| File | Holds |
|---|---|
| `index.tsx` | `InstrumentsScreen` (default export): heading, `StartAction`, add region, the screen's own read through `StateRegion` |
| `add-field.tsx` | `AddField`, the **Follow a stock** form |
| `bulk-add.tsx` | `BulkAdd`, the **Follow many** region |
| `parse-bulk-symbols.ts` | `parseBulkSymbols`, unchanged; setup imports it too |
| `instrument-table.tsx` | `InstrumentTable`: toolbar, the `virtualised` `DataTable`, paging, the stop-following flow |
| `retire-dialog.tsx` | `RetireDialog`, the `confirm` dialog |
| `badges.tsx` | `LifecycleBadge`, `RecognitionBadge` |
| `start-action.tsx` | `StartAction`, the **Download now** button |

## Screen (`index.tsx`)

- The screen reads `listInstruments({})` and holds `ScreenState<{ everPopulated }>`.
  `activeCount + retiredCount > 0` is `populated`, otherwise
  `empty-never-populated`; a rejected read is `error`. `StateRegion` renders
  them: *Loading followed stocks…*, *No stocks followed yet.*, the table, and
  *Couldn't read followed stocks: {message}.* (with a retry).
- The other four kinds are declared `notApplicable` with their reason
  (`empty-no-match`, `partial`, `unavailable`, `unreachable`), so the eight-state
  table stays complete (AC-24). The shell replaces the main region when the API
  does not answer.
- `getHistoryDepth()` feeds `StartAction`; a failed read degrades to "unset".
- **Focus.** `focusAddRequested` is read once from router state
  `{ focusAdd: true }` (Data health's *Follow a different symbol* sets it). On
  mount the screen then `navigate`s to the same path and search with
  `replace: true, state: null`, so a reload does not re-focus (DAC-E7-6). The add
  field is focused when the screen has never been populated or focus was
  requested; without either, focus is untouched.
- The add region is not rendered while loading or unreachable. A follow or a
  stop bumps `reloadToken`, which re-reads the screen and (as `refreshToken`) the
  table.

## `AddField`

A `form` `inline` with one `input` `text`, labelled *Symbol of the stock to
follow*, and the **Follow a stock** button. The symbol is trimmed and upper-cased
and `addInstruments([symbol])` is called; the field validates format only, never
against the provider.

- A rejection `duplicate_active` shows *{SYMBOL} is already a followed stock.*;
  any other rejection shows *{input} does not match the required symbol shape.*
- A reactivated symbol shows the notice *{SYMBOL} is followed again.*
- A failed request shows *Following {SYMBOL} failed: {message}*.
- `focusOnMount` focuses the input.

## `BulkAdd`

A `textarea` `list` labelled *Follow many*; it parses on blur with the unchanged
`parseBulkSymbols`. The preview reads *{n} recognised, {m} rejected* and lists
each rejected entry as *{input}: does not match the required symbol shape*. The
button reads *Follow {n} stock(s)* and is `blocked` with *Add at least one
recognised symbol before submitting.* when nothing parses. A failed request shows
*Following stocks failed: {message}*. The result reads *{a} followed, {b}
followed again, {c} rejected*, followed by each entry the server rejected with
its reason (*rejected* when it gave none), so valid entries are kept and every
rejected one is named (AC-5).

## `InstrumentTable`

- Followed and stopped-following stocks are one table with a lifecycle column.
  The toolbar has *Filter by symbol* (debounced `FILTER_DEBOUNCE_MS`, 250 ms) and
  a *Lifecycle* `Select` (*All*, *Followed*, *Stopped following*; *All* sends no
  filter), and the count *{n} followed, {m} stopped following*. Every filter
  change is a new server-side `listInstruments` read, never a filter over the
  loaded page.
- The table is `DataTable` `virtualised` inside `<section aria-label="Followed
  stocks">`, with `getRowId` the `instrumentId`. The next keyset page is
  requested through `onEndReached` when the window nears the loaded end, and is
  appended so loaded rows keep their identity. There is no **Load more** button
  and no per-row expansion (DEC-0392).
- States: *Loading followed stocks…*; `empty-no-match` *No stock matches this
  filter.* with **Reset filter**; `error` *Couldn't read followed stocks:
  {message}.* with a retry. The four unreachable kinds are `notApplicable`.
- Columns: *Symbol* links to `/data/coverage?symbol={SYMBOL}` (the symbol
  through `encodeURIComponent`; muted when stopped), *Lifecycle* through
  `LifecycleBadge`, and *Actions*, which holds **Stop following** for a followed
  stock only, with the accessible name *Stop following {SYMBOL}* (AC-25).
- **Stop following** opens `RetireDialog`. A confirm calls
  `retireInstrument(symbol)` with `pending` set; success closes the dialog and
  re-reads, and a rejection (404, 409 or transport) keeps the dialog open with
  the error and does not re-read.
- `notFoundSymbols` (a `ReadonlySet<string>`, default empty) marks stocks the
  provider does not recognise with `RecognitionBadge`. No response names such
  stocks yet, so production passes nothing and no row shows *Not found* today
  (CAP-003-E7-S3 Open Gap 1).

## `RetireDialog`

`ConfirmDialog` (`confirm`, never `destructive`): title *Stop following
{SYMBOL}?*, the description *Its history is kept, and strategies holding it keep
holding it. You can follow it again later.* and the confirm label **Stop
following**. `ConfirmDialog` supplies the focus trap, Escape, **Cancel** first
and focused, and return of focus to the opener. The running-download sentence,
*A download is running and will still download {SYMBOL} this time. Stopping takes
effect from the next download.*, is always rendered (DEC-0390); the
gap-detection sentence is not rendered (DEC-0391). A failure shows *Stopping
following {SYMBOL} failed: {error}* as an alert.

## Badges (`badges.tsx`)

- `LifecycleBadge`: `retired` is `StatusBadge` `neutral` reading *Stopped
  following*; otherwise the plain word *Followed* with no badge (DEC-0389). The
  Coverage screen renders this same marker.
- `RecognitionBadge`: the `not_found` result outcome as its `warning` tier through
  `StatusBadge`, reading *Not found* (AC-14). Nothing here is not determinable, so
  nothing goes through `NotDeterminable`.

## `StartAction`

**Download now** is a `button` that is `blocked` while history depth is unset.
Blocked, it stays focusable and `aria-describedby` points at *History depth is
not set. Set it in Settings before downloading.*, with Settings linked as
`/settings`. Unblocked, a click does nothing, as CAP-001 delivered it (AC-17).

## Tests

- Every `.ts` and `.tsx` source here, tests excluded, is scanned by
  `web/src/components/token-literals.test.ts` for spacing, size and colour
  literals; `web/src/screens/instruments/` is in `SCANNED_DIRECTORIES`
  (DAC-E7-S3-3). No source here may write a unit literal, comments included.
- The suites are `add-field`, `badges`, `bulk-add`, `empty-states`,
  `entry-hint` (the `focusAdd` behaviour, DAC-E7-S3-1), `instrument-table`,
  `retire-dialog` and `start-action`, each beside its source.
