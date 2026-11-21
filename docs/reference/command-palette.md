# Command palette (`web/src/app/command-palette/`)

The palette dialog and its modules, as CAP-003-E3-S5 left them (component design
`command-palette` sections 2.2 to 2.4, 4, 5 and 10; DAC-E3-11, DAC-E3-12,
DAC-E3-S5-1 to DAC-E3-S5-5; DEC-0207, DEC-0330 to DEC-0332). The dialog shell it
renders in is `CommandDialog`, in [`ui-components.md`](ui-components.md).

`CommandPalette` is not mounted yet: no file outside this directory imports it.
The shell's shortcut and top-bar opener are a later story's (see the
`Palette dialog` interface in [`../architecture.md`](../architecture.md)).

## The component (`index.tsx`)

`CommandPalette({ open, onOpenChange })` renders `CommandDialog` with
`shouldFilter={false}`, so cmdk neither filters nor re-orders: the palette decides
which rows exist. Its body, `PaletteBody`, is mounted only while the dialog is
open (Radix unmounts the content on close), so the typed text and the universes
read are per opening and nothing typed is kept.

Groups render in this order, with a `CommandSeparator` (`alwaysRender`) between
whichever are present: **Stocks**, **Universes**, **Pages**. There is no Actions
group, and every row only navigates: choosing a row calls `navigate(to)` and then
closes the dialog.

| State | Rendering |
|---|---|
| Hint (no text) | Stocks group with a disabled row, *Type a symbol to find a followed stock* |
| Loading | Stocks group with a `CommandLoading` row, *Searching…*; the Universes group is absent until its read answers |
| Results | One row per symbol, value `stock:<symbol>` |
| Partial | After the symbols, a disabled row, *Showing the first 8. Keep typing to narrow.*, when the answer has a `next_cursor` |
| Empty | `CommandEmpty`, *No stocks or pages match "<text>".*, only once the text is non-blank, the stock search has answered and the universes read is not loading; the Stocks group is dropped when its answer has no symbols |
| Error | A disabled row in the group that failed (`error:stocks`, `error:universes`); the other groups stay usable |
| Unreachable | The same error rows, worded by `failureReason`; Pages is local and always works |

Not applicable here: stale, unavailable and the one-tier rule (no status renders,
so `StatusBadge` and `NotDeterminable` are not used).

Universe rows (`universe:<id>`) are filtered locally with `matchesText` on the
universe's name. A Universes group renders only when the read failed or at least
one row matches. Page rows (`page:<to>`) are `palettePages()` filtered with
`matchesText` on the label and the hint, and show the hint right-aligned.

## Copy (`copy.ts`)

`PALETTE_COPY` holds every owner-facing string: the input placeholder (*Jump to a
stock or page*), the group headings (*Stocks*, *Universes*, *Pages*), the hint,
searching, partial and empty wording, the two error sentences and the labels and
hints of the three data pages (*Coverage*, *Followed stocks*, *Downloads*, each
hinted *Data health › …*). The dialog's own label, *Search FactorFlow*, belongs
to `CommandDialog`.

`failureReason(error)` returns *FactorFlow is not answering* for an
`ApiUnreachableError` and *FactorFlow hit an unexpected problem* for anything
else. The envelope's message and request id are never shown.

## Pages and matching (`pages.ts`)

`palettePages()` returns `{ label, to, hint }` for each entry of `DESTINATIONS`
(hint `null`), in that list's order, followed by `/data/coverage`,
`/data/followed` and `/data/downloads` with their hints. `DESTINATIONS` is read
at call time, so a destination another story registers appears unchanged.

`matchesText(text, ...fields)` is the local match: blank text (after `trim`)
matches everything; otherwise any non-null field containing the trimmed text,
ignoring case.

## Targets (`targets.ts`)

- `stockTarget(symbol)`: `/research/stocks/<symbol>` when `RESEARCH_REGISTERED`,
  otherwise `/data/coverage?symbol=<symbol>`. The symbol is URI-encoded and the
  flag is read at call time.
- `universeTarget(id)`: `/research/universes/<id>`, id URI-encoded. Universes are
  offered only while research routes are registered.

## Stock search (`use-stock-search.ts`)

`useStockSearch(text)` returns `idle`, `loading`, `ok { symbols, more }` or
`error { error }`.

- Blank text (after `trim`) is `idle` and sends nothing.
- Otherwise it is `loading` and, after `STOCK_SEARCH_DEBOUNCE_MS` (250 ms), sends
  one `GET /api/instruments?symbol=<trimmed>&lifecycle=active&limit=8`
  (`STOCK_SEARCH_LIMIT` is 8). `more` is true when `next_cursor` is not `null`.
- The request carries an `AbortSignal`, aborted when the text changes, clears or
  the palette closes, and a settled answer or error from an aborted request is
  dropped. It calls `requestJson` rather than `listInstruments`, because
  `listInstruments` forwards no `signal`; the request sent is the same one.

## Universes read (`universes.ts`)

`fetchActiveUniverses(signal?)` sends `GET /api/universes?lifecycle=active` with
no limit, so the route's default page applies, and maps each row to
`{ id: universe_id, name }`. The palette reads it once per opening, and not at
all while `RESEARCH_REGISTERED` is false.
