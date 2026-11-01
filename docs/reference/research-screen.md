# Research screen modules (`web/src/screens/research/`)

`web/src/screens/research/` will hold the CAP-002 Research screens
(`component-design-classification-ui.md`). So far it holds two pure modules
the screens will share (CAP-002-E4-S2) and one hook (CAP-002-E4-S4):

- `format.ts`, the one place a CAP-002 number or date becomes text;
- `copy.ts`, every owner-facing string of the CAP-002 screens;
- `use-score-set-poll.ts`, the poll that learns when a score set completes
  or fails; see [The score-set poll](#the-score-set-poll-use-score-set-pollts);

and the Filters pane with its two parts (CAP-002-E4-S5):

- `use-research-query.ts`, the hook binding the URL to a `ResearchQuery`
  ([URL binding](#url-binding-use-research-queryts));
- `threshold-sentence.tsx`, one factor's threshold sentence
  ([Threshold sentence](#threshold-sentence-threshold-sentencetsx));
- `filters-pane.tsx`, the pane itself
  ([Filters pane](#filters-pane-filters-panetsx));

and the save and add dialogs with their notices (CAP-002-E4-S8):

- `notices.tsx`, the success notices the dialogs confirm through
  ([Success notices](#success-notices-noticestsx));
- `dialog-frame.tsx`, the frame both dialogs share
  ([Dialog frame](#dialog-frame-dialog-frametsx));
- `save-as-universe-dialog.tsx`, **Save these {n} as a universe…** and its
  dialog ([Save as a universe](#save-as-a-universe-save-as-universe-dialogtsx));
- `add-to-universe-dialog.tsx`, the tray's **Add to universe…** dialog
  ([Add to a universe](#add-to-a-universe-add-to-universe-dialogtsx));

and the results table with its window arithmetic (CAP-002-E4-S6):

- `results-window.ts`, the pure window, reveal and paging arithmetic
  ([Results window](#results-window-results-windowts));
- `results-table.tsx`, the virtualised results table
  ([Results table](#results-table-results-tabletsx));

and the first screen, the universes list with its create dialog
(CAP-002-E1-S7), in `universes/`; see
[Universes screen](#universes-screen-universes).

No route mounts any of them yet: `/research/universes` and
`/research/universes/:universeId` are registered by CAP-002-E4-S10. The dialogs' only importers are
their tests; `notices.tsx` and `dialog-frame.tsx` are imported only by the
dialogs and the tests. The results table's only importer is its test
(CAP-002-E4-S9 and CAP-002-E1-S8 are its planned hosts). The factor cell, the *Possibly
restated* mark, the not-current banner and the as-of line in
`web/src/components/patterns/` import `format.ts` and `copy.ts`
(CAP-002-E4-S3, CAP-002-E4-S4); see
[`component-patterns.md`](component-patterns.md). The poll hook's only
importer is its test. The URL query model the screens read lives in
`web/src/api/research-query.ts`; see
[`web-api.md`](web-api.md#research-url-codec-research-queryts).

## Display formatting (`format.ts`)

Every numeric input is the wire's decimal string at stored precision
(DEC-0063). It is rounded by string arithmetic, half away from zero, never
through a float (DEC-0147). The rules:

- a value that rounds to zero is never signed;
- signs use the ASCII hyphen-minus (U+002D);
- the zero spelling a `Decimal` column can emit at a scale (`0E-10`) reads as
  zero;
- any other string that is not a plain decimal throws `RangeError`, so a value
  the API never sent is not rendered (STD-UI-4).

| Function | Output |
|----------|--------|
| `formatScore(value)` | a standardised score: two decimals, `+` or `-`, `0.00` unsigned |
| `formatPercentile(value)` | a whole number 0 to 100, no sign and no `%` |
| `formatRatio(value)` | two decimals; a negative keeps `-`, never a `+` |
| `formatRate(value)` | the engine's fraction times 100, two decimals, signed, with `%` |
| `formatAmount(value)` | whole units with `,` thousands separators, no currency symbol and no abbreviation (STD-UI-6) |
| `formatTimestamp(value, {seconds}?)` | an instant in America/Chicago with the zone as the instant falls, `2026-10-15 17:46 CDT`; with `seconds`, `2026-10-15 17:52:10 CDT` |
| `formatDate(value)` | a calendar date (`classification_date`, `known_on`, an input's `as_of`), returned as received |

`formatTimestamp` accepts only an ISO-8601 instant with `Z` or an offset,
never a local wall-clock time, and throws `RangeError` otherwise. It formats
with `Intl.DateTimeFormat` in `America/Chicago` and `hourCycle: "h23"`, so
midnight is `00` and the machine's zone is never read. `formatDate` checks
the `YYYY-MM-DD` shape, throws `RangeError` otherwise, and never passes the
value through `Date` (STD-UI-5). A date that is not on the calendar, such as
`2026-02-29`, is returned unchanged.

## Owner-facing copy (`copy.ts`)

`copy.ts` holds every owner-facing string of the CAP-002 screens, so
components and their tests share one source. Wording is verbatim from the
UX design, and each group's doc comment cites its section. Display labels
follow STD-UI-1 (DEC-0072). A message a later story needs and no design
contains is added with a doc comment saying so. The universe name's maximum
length is not stated here: it is `[REQUIRES INPUT]` in classification-ui
section 14.

| Export | Holds |
|--------|-------|
| `SHELL_ROUTES` | the delivered CAP-001 routes CAP-002 links to: `download(runId)` gives `/runs/{runId}`, `dataHealth` is `/runs` and `followedStocks` is `/instruments`. When the shell delivers the blueprint's routes, this one map changes |
| `UNIVERSE_LIFECYCLE` | every universe-lifecycle string containing *retire*, *retired* or *retiring* |
| `ErrorCode` | the error codes of classification-api section 2.5 |
| `ErrorContext` | what a failure sentence is built from: `action`, `resource`, `symbols`, `universeName` |
| `OPERATION_LABELS` | one *Could not ...* sentence per `ClassificationOperation` (DEC-0149) |
| `RESOURCE_LABELS` | the display noun of each `ClassificationResource` |
| `FALLBACK_ERROR` | the sentence for an unknown or absent code |
| `ERROR_SENTENCES` | one sentence template per `ErrorCode` (STD-UI-19) |
| `failureSentence(failure)` | the statement of a failed call |
| `FACTOR_LABELS`, `REGIONS` | factor names, and the Research panes' section labels |
| `FILTERS`, `describeQuery(query)`, `savedFromFilter(date, query)` | the Filters pane, and a `ResearchQuery` in words. Three `FILTERS` entries no design contains carry a doc comment saying so: `valueThresholdFor(factor)`, the growth and momentum rows' value-blank name (DEC-0157); `unavailableUniverse`, the *Look in* option for a scope the loaded list lacks (DEC-0158); `loadingUniverses`, the same option while the list loads (DEC-0237, provisional) |
| `thresholdFieldError(factor, measure)` | the threshold field's error on blur, *Could not set the {factor} threshold: {rule}.*, where `rule` is *a percentile is a number from 0 to 100* or *a standardised score is a finite number* (DEC-0157, provisional). A standalone string: not `failureSentence` output and no `OPERATION_LABELS` entry |
| `CELL`, `INPUT_STATUS`, `IncompleteReasonCode` | the factor cell and column states (see [Factor-cell sentences](#factor-cell-sentences)), an input's non-present status, and the three `ReasonCode` values an *Incomplete* cell can carry |
| `SORT` | the results table's sort-button names, `bySymbol` (*Sort by symbol*), `byPercentile(factor)` and `byStandardisedScore(factor)` (*Sort by {factor} percentile*, *Sort by {factor} standardised score*), and `incompleteLast`, the ranked factor headers' description (*Stocks with an incomplete score are listed last, whether sorted up or down.*) (CAP-002-E4-S6; DEC-0161) |
| `RESULTS`, `SCORE_SET` | the results header and empty bodies, and the as-of line, not-current banner and set history. `RESULTS.columns`, the table's *Symbol* and *Name* headers, is CAP-002-E4-S6's (DEC-0239) |
| `SELECTION`, `DIALOGS` | the selection tray and inspector, and the save and add dialogs. Two `DIALOGS` entries no design contains carry a doc comment saying so (CAP-002-E4-S8): `enterName`, *Enter a name for the universe.*, the one empty-name field error every universe name field shares (DEC-0167, DEC-0169); `universe`, *Universe*, the Add dialog's select label |
| `NOTICES` | the success notices' `dismiss` label, *Dismiss*, which no design words (CAP-002-E4-S8; DEC-0168) |
| `UNIVERSES`, `UNIVERSE_DETAIL` | the universes list and create dialog, and one universe's detail. `UNIVERSES` entries no design contains carry a doc comment saying so: `hideDetailsFor(name)`, `loading` (*Loading…*), `noActive`, `resetFilter` (*Reset filter*; DEC-0254), `nameRequired`, and `createdAt(timestamp)`, whose lifecycle twin is `UNIVERSE_LIFECYCLE.retiredAt(timestamp)` (DEC-0256, provisional) |
| `COMPARE`, `EVIDENCE` | Compare, and the stock evidence panels |

### The retire allow-list

STD-UI-1 forbids *retire* for a stock, whose label is *stop following*, but
leaves *universe* its own label (DEC-0145). So every universe-lifecycle string
that says *retire*, *retired* or *retiring* lives in `UNIVERSE_LIFECYCLE`.
`OPERATION_LABELS["retire-universe"]` is `UNIVERSE_LIFECYCLE.retireFailed`.

`copy.test.ts` (TC-COMP-072) scans every string in the catalogue, and every
sentence `failureSentence` can compose, for vocabulary STD-UI-1 forbids. Such
vocabulary includes *retire* in any string outside this group, which the scan
reads as its allow-list. The test also asserts that no lifecycle string
matches *stock*, *instrument* or *follow*. A later story adds a new lifecycle
string to the group and never edits the scanner.

A string that starts with a `UNIVERSE_LIFECYCLE` string, followed by `: ` and a
remainder without *retire*, is also allowed. This prefix rule is DEC-0226, a
provisional agent decision. It admits the composed `retire-universe` failure
sentences, and it applies to every scanned string.

### Factor-cell sentences

Every *Incomplete* sentence takes one shape, built by a private
`incompleteSentence(cause, factor)`: *Incomplete: {cause}, so {factor} can't
be compared fairly. It isn't guessed.* Three `CELL` functions fill it:

| Function | `cause` |
|----------|---------|
| `incompleteReason(input, status, factor)` | `{input} {status}`, with `status` from `CELL.incompleteStatus` (*is missing*, *is outdated*, *couldn't be computed*) |
| `incompleteDetail(detail, factor)` | the engine's owner-facing `reasonDetail`, as sent (DEC-0151) |
| `incompleteGeneric(code, factor)` | *an input* followed by the status phrase `code` selects, where `code` is an `IncompleteReasonCode` (`input_missing`, `input_outdated`, `input_not_computable`) |

The factor cell's *Incomplete* badge titles itself with `incompleteDetail`
when the cell carries a `reasonDetail` and with `incompleteGeneric` otherwise
([`component-patterns.md`](component-patterns.md)). `notFollowedNoDate`,
*Not followed. Earlier scores stand.*, is the *Not followed* badge's title
while no read carries the date a stock stopped being followed (DEC-0152);
`notFollowedSince(date)` is the sentence for when one does.

### Score-set sentences

`SCORE_SET` is read by the not-current banner, the as-of line and the
score-set poll ([`component-patterns.md`](component-patterns.md)). The
banner reads `notReflecting`, `scoreUpdateFailed`, `buildingBody` and
`failedBody`; the line reads `scoresFrom`, `separator`,
`fromTheDownloadStarted`, `openDownload`, `complete`, `partial`, `sortedBy`,
`checked`, `updating`, `earlierSetsAction` and `couldNotCheck`, and
`RESULTS.tryAgain`; the hook reads `scoresUpdatedTo`. CAP-002-E4-S4 added one
string, `noReasonRecorded` (*no reason was recorded*): the reason clause
`failedBody` takes when a failed set's `failureReason` is null. No design
states it, because the scheduler always records a reason; it is defensive
against the nullable wire type (DEC-0232, provisional). `asOfLine(scoresAt,
downloadStarted, sortedBy)`, the whole line as one string, is not what the
component renders: it composes the parts itself so the start time can be a
link.

### Failure sentences

`failureSentence({operation, resource, code, symbols?, universeName?})`
selects its sentence by `code` alone:

- An `ErrorCode` gives `ERROR_SENTENCES[code]`, called with the operation's
  label as `action`, the resource's label, `symbols` (default `[]`) and
  `universeName` (default `null`). Most templates read
  *{action}: {reason}*, and some add a recovery. Five ignore the action and
  give their own sentence: `classification_set_changed`,
  `universe_not_found`, `universe_retired`, `last_member` and
  `instrument_not_found` (which names the first symbol when there is one).
- Any other code, or `null`, gives `{action}: {FALLBACK_ERROR}`. The code
  itself is never shown.

A code counts as an `ErrorCode` only when it is an own key of
`ERROR_SENTENCES` (`Object.hasOwn`). So an unknown code named like an
`Object.prototype` member, such as `toString`, also gets the fallback. No test
pins that case yet; it is the open warning IR-001 of the story's
implementation review v2.

The sentence never reads the envelope's `message` or the error's `name`. A
`ClassificationApiError` can therefore be passed as is: its `operation`,
`resource`, `code` and `symbols` are the fields read.

## URL binding (`use-research-query.ts`)

`useResearchQuery()` is the React binding between the URL and the codec's
`ResearchQuery` (DAC-E4-3; DEC-0156). The URL is the only state. It returns a
`ResearchQueryBinding`:

| Member | Behaviour |
|--------|-----------|
| `query` | `decodeResearchQuery` of the location search, memoised on the search string, so its identity is stable while the URL is unchanged |
| `setQuery(next)` | writes `applyResearchQuery` over the current params as a push: unknown keys survive, no default is written, and back navigation restores the earlier filter. A write that leaves the search string unchanged navigates nowhere |
| `clear()` | `setQuery` of `DEFAULT_RESEARCH_QUERY` with the current `sort` kept |

Every write is a full query built from `query`. Two writes in one tick do not
compose: react-router's functional `setSearchParams` hands each updater the
render's params, not the previous write's result, so a second write in the
same tick must carry the whole query it wants.

The hook never fetches. The host that issues the list request (CAP-002-E4-S9
on Research, CAP-002-E1-S8 on universe detail) keys it on `query`: one write,
one URL, one request (DAC-E4-S5-2). It runs inside a router; its tests
(`use-research-query.test.tsx`) render under `MemoryRouter`.

## Threshold sentence (`threshold-sentence.tsx`)

`ThresholdSentence({ factor, value?, onCommit })` is one factor's *[measure]
[direction] [value]* sentence (blueprint 4.7; UX design 1.1 item 3;
classification-ui 2.5): a hidden swatch filled with the factor's
`--factor-{factor}` token, the factor's label from `FACTOR_LABELS`, then one
`<p>` holding three blanks. `value` is the factor's current
`ThresholdSentence` from the URL, `undefined` for no threshold. `onCommit`
is called once per change with the new sentence, or `null` to drop the
factor's threshold.

The three blanks and their accessible names (DAC-E4-S5-4; DEC-0157):

| Blank | Control | Name | Options or placeholder |
|-------|---------|------|------------------------|
| measure | `select` | `FILTERS.measureFor(factor)`, *Measure for value* | *percentile* (default), *standardised score* |
| direction | `select` | `FILTERS.directionFor(factor)`, *Direction for value* | *at least* (default), *at most* |
| value | `text` input, `inputMode="decimal"`, `w-8` (DEC-0236, provisional) | *Value threshold* on the value row (`FILTERS.thresholdFor`), *Value threshold for growth* and *for momentum* otherwise (`FILTERS.valueThresholdFor`) | placeholder *any* |

Commit and validation:

- The selects commit on change; the value commits on blur or Enter. A blank
  value with a committed sentence commits `null`; a blank value with none
  commits nothing. A commit equal to `value` is not re-sent.
- `validateThresholdValue(factor, measure, raw)` (exported) returns the
  field error for `raw` under `measure`, or `null` when it is valid or blank.
  Validity is the codec's own verdict: the value is valid exactly when
  `decodeResearchQuery` would keep a sentence carrying it, so the pane and the
  URL cannot drift (DEC-0157; see
  [`web-api.md`](web-api.md#research-url-codec-research-queryts) for the
  rule). The wording is `thresholdFieldError(factor, measure)`.
- An invalid value is a field error before any request, and nothing is
  written (DAC-E4-S5-1): a `role="alert"` paragraph in `--destructive`, the
  input `aria-invalid` and `aria-describedby` it. Typing clears the error as
  soon as the draft is valid; blur alone never raises one on a valid draft.
- The draft re-syncs from `value`, so back navigation resets it. A host that
  must reset a row whose `value` is already `undefined` remounts it (the pane
  does this on Clear filters).
- Nothing in the row is ever `disabled`: rows stay usable while a request is
  in flight.

Tests: `threshold-sentence.test.tsx` (TC-COMP-134, TC-COMP-137).

## Filters pane (`filters-pane.tsx`)

`FiltersPane({ showLookIn = true, activeInstruments = null, children })` is
the Research screen's Filters pane (UX design 1.1; classification-ui 2.5;
DEC-0156). It is itself the `section` labelled `REGIONS.filters`, so a host
mounts it unwrapped. It is controlled by the URL through `useResearchQuery`:
every change is one `setQuery`, hence one URL write and one list request by
the host (DAC-E4-S5-2, DAC-E4-3). It never fetches the list and never reads
an error's `message`.

| Prop | Meaning |
|------|---------|
| `showLookIn` | `false` on universe detail: no *Look in*, and `scope` is neither read as a filter nor written |
| `activeInstruments` | the followed-stock count for the *All followed stocks · {n}* option; `null` while unknown, when the option reads *All followed stocks* |
| `children` | rendered above **Clear filters**: universe detail's *Members as of* slot |

Its parts, in order, each a `py-3` block separated by a divider:

- **Find a stock.** A text input whose draft commits on blur or Enter; Escape
  clears it and commits the empty value. The symbol rule is the codec's: a raw
  value is accepted exactly when `decodeResearchQuery` keeps it as `symbol`,
  and it is written upper-cased. A rejected value shows
  `UNIVERSES.invalidSymbol(raw)` as a `role="alert"` field error and writes
  nothing. The draft re-syncs from the URL's `symbol`.
- **Look in** (when `showLookIn`). A `select` named `FILTERS.lookInName` of its
  current option, *Look in: All followed stocks*. On mount the pane lists
  every active universe, page after page of `listUniverses({ lifecycle:
  "active", cursor })` until `nextCursor` is `null` (DEC-0235); the list is
  shown only once whole, and a failure on any page fails the whole list with
  no partial options. A failure renders `failureSentence` of the
  `ClassificationApiError`, or of `{ operation: "list-universes", resource:
  "universe", code: null }` for any other cause, as an alert the select is
  described by. A URL `scope` the options lack keeps its own selected option,
  labelled by what is known of the list:

  | List state | Option label |
  |------------|--------------|
  | loaded, scope absent | `FILTERS.unavailableUniverse`, *Unavailable universe* (DEC-0158) |
  | still loading | `FILTERS.loadingUniverses`, *Loading universes…* (DEC-0237, provisional) |
  | failed | `OPERATION_LABELS["list-universes"]`, *Could not load your universes* (DEC-0237, provisional) |

- **Threshold sentences.** One `ThresholdSentence` per factor (value, growth,
  momentum), then `FILTERS.percentileHelper`. A commit replaces or deletes
  that factor's entry in `query.sentences`.
- **Hide stocks with an incomplete score.** A checkbox bound to
  `query.hideIncomplete`, described by `FILTERS.hideIncompleteHelper`; its
  label row is at least `--control-min-target` tall.
- `children`.
- **Clear filters.** Shown only while a filter is active: a sentence, a
  symbol, hide-incomplete, or (with *Look in*) a scope. Sort alone shows no
  button. It writes `DEFAULT_RESEARCH_QUERY` with the current `sort` kept and,
  without *Look in*, the current `scope` kept; clears the *Find a stock* draft
  and error; remounts the three threshold rows, dropping any uncommitted
  draft or error; and moves focus to *Find a stock* (DAC-E4-S5-3; DEC-0157).

Tests: `filters-pane.test.tsx` (TC-COMP-135, TC-COMP-136), driven through a
probe host that issues one `toListParams` request per `query` change.

## Results window (`results-window.ts`)

The window arithmetic of the results table (DAC-E4-S6-5, AC-11; DEC-0160):
pure functions over numbers, with no React and no import, so the table and
its tests share one definition. The table is windowed over keyset pages, so
the scroll height tracks the rows loaded so far, never the server's match
count: a keyset cursor cannot jump.

| Constant | Value | Meaning |
|----------|-------|---------|
| `ROW_HEIGHT_PX` | `32` | one row's height, `--row-height-comfortable` (2rem) |
| `VIEWPORT_ROWS` | `15` | rows the fixed-height scroll container shows at once |
| `OVERSCAN_ROWS` | `10` | rows rendered above and below the viewport |
| `PREFETCH_ROWS` | `20` | the next page is read when the window's end is this close to the loaded end |
| `PAGE_SIZE` | `50` | rows per keyset page, the API's `DEFAULT_PAGE_SIZE` |

| Function | Returns |
|----------|---------|
| `visibleWindow({ scrollTop, loadedCount })` | a `VisibleWindow`, `{ start, end, padTop, padBottom }`: from `OVERSCAN_ROWS` above the first visible row to `OVERSCAN_ROWS` below the viewport, clamped to the loaded rows, with spacer heights that keep the scroll height at `loadedCount * ROW_HEIGHT_PX`. A negative or `NaN` `scrollTop` is the top. At most 35 rows are rendered |
| `scrollTopToReveal(index, scrollTop)` | `scrollTop` unchanged when row `index` is inside the viewport, its top edge when it is above, its bottom edge when it is below |
| `needsNextPage({ end, loadedCount, nextCursor, loading })` | true when a cursor exists, no read is in flight and `end + PREFETCH_ROWS >= loadedCount` |

Tests: `results-window.test.ts`.

## Results table (`results-table.tsx`)

`ResultsTable(props)` is the results table of the Research screen
(CAP-002-E4-S9) and a universe's Members tab (CAP-002-E1-S8)
(classification-ui 2.5; UX design 1.1; AC-9, AC-11, AC-12, AC-14, AC-16;
DAC-E4-S6-1 to DAC-E4-S6-5; DEC-0159 to DEC-0162, DEC-0164). It is a native
`table` windowed over keyset pages: the DOM holds a bounded number of rows
however many stocks match, and sorting, filtering and counting are the
server's.

| Prop | Meaning |
|------|---------|
| `query`, `onQueryChange` | the effective `ResearchQuery`, controlled by the host and held in the URL (DAC-E4-3). It is compared by identity: a new object reads page one again, so a host keeps one object per URL state, or each `onResult` would start another read |
| `refreshKey` | bumped by the host to reload page one once with the same query (DEC-0062) |
| `selected`, `onSelect` | the selected symbol, controlled by the host so it survives sort, filter, scope and refresh; `onSelect` is immediate |
| `onInspect` | a debounced selection notification (below) |
| `checked`, `onCheckedChange` | the checked symbols in checking order, controlled by the host; `onCheckedChange` receives the whole list |
| `onResult` | called once per first page with the response (`FirstPage`, the `ClassificationList`), never for a later page: the host's h1, as-of line and banner read it |
| `empty` | `(kind: EmptyKind) => ReactNode`, the host's `never-populated` and `no-match` bodies (DAC-E4-S9-1) |
| `matchLabel` | the sentence announced for a match count; default `RESULTS.stocksMatch`, *{n} stocks match* |
| `extraColumns` | the host's `ExtraColumn`s, `{ id, header, align?, placement?, cell }`: `placement: "afterName"` between Name and Value (the Members tab's *Member since*), `"end"` (the default) after Momentum (its **Remove…**). Same-placement entries render in array order. A control in such a cell stops the click's propagation when activating it must not select the row |

`onResult`, `matchLabel` and `onInspect` are read through refs, so a changed
callback identity starts no read. `INSPECT_DEBOUNCE_MS` (`150`) is exported.

### Layout and columns

The table sits in a scroll container `(VIEWPORT_ROWS + 2) * ROW_HEIGHT_PX`
tall (two row heights for the header), `overflow-y: auto`, with the `thead`
`sticky`. The columns are a checkbox column with an empty header, *Symbol*,
*Name* (`RESULTS.columns`), the `afterName` extras, *Value*, *Growth* and
*Momentum*, then the `end` extras. Each row's symbol is its `th scope="row"`;
its name is truncated with the full name as `title`. Each factor cell is the
shared `FactorCell` without `showScore`
([`component-patterns.md`](component-patterns.md)); the row itself carries no
state colour (AC-12).

A factor header shows the factor's swatch, filled inline with
`--factor-{factor}`, and its label. Then:

- **Ranked** (or before the first page, when no summary is known): two sort
  buttons, `SORT.byPercentile(factor)` and `SORT.byStandardisedScore(factor)`,
  and the header is described by an `sr-only` `SORT.incompleteLast`. The
  response's order is rendered as is, so incomplete scores sit last as the
  server sorted them (DAC-E4-S6-3).
- **Not ranked** (`summary.ranked` false): no sort button and no `aria-sort`,
  and the header states `CELL.qualified(qualifiedCount, minPeerSetSize)` once.
  Every cell of the column then renders *Not enough to rank*, whatever the
  cell says, except a cell whose `reasonCode` is `retired`, which keeps
  *Not followed* (AC-14; DAC-E4-S6-1).

### Sorting

A sort button is a 24 px target (`h-5 w-5`) whose accessible name is the
whole button; its glyph, `▲`, `▼` or `↕`, is `aria-hidden`. Activating one
calls `onQueryChange` with the next sort (DEC-0161), and the read follows
from the new `query` (DAC-E4-S6-2):

| Column | Cycle |
|--------|-------|
| a factor's percentile or standardised score | ascending, descending, unsorted (`null`); from any other sort, ascending |
| Symbol | unsorted is the API's symbol-ascending default, so from `null` or ascending it gives descending, and from anything else `null` |

`aria-sort` is set only on the active column and only while the body shows
rows; with `sort` `null` the Symbol column reads `ascending`.

### Reads

Page one is read with `toListParams(query)` and `limit: PAGE_SIZE` on mount,
on each new `query`, on each `refreshKey` bump and on each retry. The rows
shown stay in place, the `tbody` at `opacity-60` and the table `aria-busy`,
until the response replaces them; a response superseded by a newer read, or
arriving after unmount, is ignored. On arrival:

- if a row holding focus (or a control in it) is in the new page, the window
  scrolls only as far as needed to keep it, so its element and its focus
  persist; otherwise the window returns to the top and focus falls to the
  document body (DEC-0244);
- the polite `output` announces `matchLabel(matchCount)`, re-inserted as a new
  node each time so an unchanged count is read again (DAC-E4-S6-2);
- `onResult` is called with the page.

Later pages are read with the cursor when `needsNextPage` holds for the
current window, only for rows read for the current `query`, `refreshKey` and
attempt, and never while a page has failed. Their rows are appended with any
symbol already loaded dropped.

| Failure | Shown as |
|---------|----------|
| page one | the body's only row: `failureSentence` of the `ClassificationApiError` (or of `list-classifications` with no code for any other cause) and **Try again**, which reads page one again |
| a later page, `cursor_stale` | page one is read again, once per `query` and `refreshKey`; a second stale cursor in the same epoch is shown as any other page failure |
| any other later page | the sentence and **Try again** below the table; Try again re-reads the same cursor |

### Bodies

| State | Renders |
|-------|---------|
| before the first page | twelve `aria-hidden` skeleton rows |
| `neverClassified` | `empty("never-populated")` in place of the whole table |
| no rows | the header row over one cell holding `empty("no-match")`; no `aria-sort` and no `aria-rowcount` |
| rows | the window's rows between two `aria-hidden` spacer rows of `padTop` and `padBottom`; the table's `aria-rowcount` is `matchCount + 1` and each row's `aria-rowindex` its position in the loaded result plus 2 |

### Selection, checking and the keyboard

DAC-E4-S6-4; DEC-0162, DEC-0164.

- A click anywhere on a row, or Enter on the row, selects it. Space on the
  row does nothing, not even the page scroll.
- The row's checkbox, named `CELL.selectRow(symbol)` (*Select {symbol}*),
  checks and unchecks without selecting: its click does not reach the row. A
  checked symbol joins the end of `checked`; an unchecked one leaves it, the
  order of the rest kept.
- ArrowDown and ArrowUp, from the row or its checkbox, select the next or
  previous loaded row and move focus to it. A target inside the viewport is
  focused at once; one outside it is scrolled to (`scrollTopToReveal`) and
  focused once rendered. An arrow past either end does nothing.
- The table has one tab stop: the selected row when it is rendered, else the
  first rendered row.
- Selecting the already-selected symbol calls nothing. Otherwise `onSelect`
  is called at once and `onInspect` once, `INSPECT_DEBOUNCE_MS` after the last
  selection change; the timer is cleared on each new selection and on
  unmount. `onInspect` is not the inspector's trigger: `InspectorPanel`
  debounces its own `symbol` prop (DEC-0164), so a host passes it the
  immediate `selected` and does not wire `onInspect` into it, which would
  make the wait 300 ms.

A row is `aria-selected` when selected. Every row draws a 4 px left edge,
transparent unless selected, so selection shifts nothing; the selected row's
edge is `status-active` over a `status-active-muted` fill. A checked row is
filled with `--muted` as an inline style (DEC-0240). DEC-0240 and DEC-0239
(`RESULTS.columns`) are open provisional decisions awaiting the owner.

Tests: `results-table.test.tsx` (TC-COMP-093, TC-COMP-098, TC-COMP-110,
TC-COMP-138, TC-COMP-139, and the T006 and T008 cases), mocking
`listClassifications`.

## Success notices (`notices.tsx`)

The save and add dialogs confirm through `success` notices, *Saved {n} stocks
as {name}* and *Added {n} stocks to {name}*, each linking to the universe
(DAC-E4-S8-3, DAC-E4-S8-5; UX design 1.1; DEC-0168, DEC-0258). The state
lives in the host, not the dialog, so a notice raised by a dialog that is
closing or already unmounted still shows.

| Export | Behaviour |
|--------|-----------|
| `useNotices()` | returns a `NoticesBinding`: `notices`, the `HeldNotice[]` in arrival order; `notify(notice)`, which appends it with the next id from a counter ref; `dismiss(id)`, which removes only that item |
| `NoticeRegion({ notices, onDismiss })` | the region that renders them |
| `Notice` | `{ message, to? }`: the self-contained message and, optionally, the route it links to |
| `HeldNotice` | a `Notice` with the `id` `dismiss` names it by |
| `universePath(universeId)` | `/research/universes/{id}`, the id URI-encoded |

The contract a host relies on: it calls `useNotices` once and renders
`NoticeRegion` once; a dialog only calls `notify`.

`NoticeRegion` is an `output` (implicit `role="status"`) with
`aria-live="polite"`, `aria-atomic="false"` and `tabIndex={-1}`, fixed at the
bottom right, and always mounted, empty before any notice, so its first
announcement is read. It renders the three newest notices only (`MAX_SHOWN`);
older ones are held in the host's state and return as shown ones are
dismissed (DEC-0258). Each shown notice is a `span` with
`data-variant="success"` on the `--popover` surface with a `--status-good`
border. Its message is plain text, a router `Link` when `to` is given, then a
**Dismiss** button (`NOTICES.dismiss`). Dismiss, or `Escape` while the link
or Dismiss has focus, removes the item and moves focus to the region. Nothing
is removed by time: DEC-0168 keeps an item until it is dismissed, so the
toast spec's five-second `success` timeout is not applied.

Two warnings of the story's implementation review v2 remain open here. A held
notice that returns to the stack is announced again as if new (IR-003).
The region is `fixed` with no `z-index`, so a host that renders it after a
dialog draws it above the dialog's overlay, still clickable (IR-001; see
[Dialog frame](#dialog-frame-dialog-frametsx)).

Tests: `notices.test.tsx`.

## Dialog frame (`dialog-frame.tsx`)

`DialogFrame({ title, children, initialFocusRef, onCancel, busy,
descriptionId? })` is the `dialog` `standard` frame both dialogs render
(classification-ui 2.7; dialog design spec sections 3 to 6), following the
frame `screens/instruments/retire-dialog.tsx` established. It keeps no state
of its own.

- A native `<dialog open>` with `aria-modal="true"`, `data-variant="standard"`,
  labelled by its `h2` title and described by `descriptionId` when given;
  `aria-busy` while `busy`. Surface and text are `--popover` and
  `--popover-foreground` (DEC-0257).
- Before it, an overlay: an `aria-hidden` `fixed inset-0` layer in
  `bg-background/80` that dims the page behind and takes the pointer
  (DEC-0259). A click on it calls `onCancel`; a press on it never moves focus
  out of the dialog.
- On open, focus moves to `initialFocusRef`; on unmount, for any reason,
  focus returns to whatever held it before the dialog opened.
- `Escape` calls `onCancel`. `Tab` and `Shift+Tab` cycle over the enabled,
  tabbable controls present at each keypress, so a confirm swapped while open
  stays in the cycle.

`onCancel` is the dialog's own Cancel. Each dialog makes it a no-op while a
request is pending, so Cancel, `Escape` and the overlay never close a dialog
before its request's result is known (DEC-0259).

`ConfirmProgress({ pending })` is a confirm action's progress in place: an
`aria-hidden` spinner beside the label whose slot is always reserved
(`invisible` when not pending), so the button's width never changes. It spins
only under `motion-safe`.

`<dialog open>` is not modal, and the overlay and the dialog are `fixed` with
no `z-index`. Stacking therefore follows DOM order: positioned content the
host renders after the frame, such as a `NoticeRegion`, draws above the
overlay and still receives the pointer. This is the open warning IR-001 of
the story's implementation review v2, to be settled before CAP-002-E4-S9
places the region.

Tests: the frame is exercised through both dialogs' tests.

## Save as a universe (`save-as-universe-dialog.tsx`)

`SaveAsUniverse({ query, matchCount, setId, incompleteCount, onNotify })` is
**Save these {n} as a universe…** and its dialog (AC-2, AC-5, DAC-E4-5,
DAC-E4-S8-1 to DAC-E4-S8-4; UX design 1.1; DEC-0167, DEC-0168, DEC-0259).

| Prop | Meaning |
|------|---------|
| `query` | the current `ResearchQuery` |
| `matchCount` | the results header's match count |
| `setId` | the on-screen score set; `null` while none is shown |
| `incompleteCount` | the incomplete matches, only when every matching row is loaded, else `null`: the *including* clause is then omitted, not guessed (STD-UI-15) |
| `onNotify` | the host's `notify` |

**The control.** An outline button reading `RESULTS.saveThese(matchCount)`.
At zero matches or with no set it is `blocked`: `aria-disabled`, still
focusable, described by `RESULTS.nothingToSave`, and activating it opens
nothing and sends nothing. Under a universe scope (`query.scope` non-null)
the control is not rendered: the save carries the filter, not the scope.

**Open.** Activating the control snapshots `query`, `matchCount`, `setId`
and `incompleteCount`; the dialog reads only that snapshot, so its title and
its request always agree. The title is `DIALOGS.saveTitle(matchCount)`. The
description is `DIALOGS.includingIncomplete` when the incomplete count is
above zero, then `describeQuery(query)` when not empty. Focus starts on the
Name field.

**Save.** A blank name (after trimming) shows `DIALOGS.enterName` as a field
error and sends nothing. Otherwise it posts `createUniverse({ name, filter:
toThresholds(query), setId })`, the same thresholds object the list read
uses. While the request is pending, Save shows `ConfirmProgress` with
`aria-busy` and `data-pending`, Cancel is `aria-disabled` with a muted cue,
and a second submit does nothing. On success it calls `onNotify` with
`DIALOGS.saved(memberCount, name)` from the response, linking to
`universePath(universeId)`, then closes. On failure the dialog stays open:

| Failure | Shown as |
|---------|----------|
| `universe_name_in_use` | a field error on Name, `failureSentence` with the trimmed name, and focus on Name |
| `classification_set_changed` | an alert with `failureSentence`; **Review new result** replaces Save in the same button, keeping focus, and closes the dialog without a request |
| any other `ClassificationApiError` | an alert with `failureSentence` |
| any other cause | an alert with `failureSentence` of `create-universe` with no code |

Errors and the invalid border use `--destructive`, and the confirm is
`--primary` on `--primary-foreground` (DEC-0257).

**Scope change.** If the scope becomes a universe while the dialog is open
and idle, it closes for good, so it never returns with an old snapshot. A
pending save keeps it open until its result is known (DEC-0259). When the
dialog closes after its trigger was unmounted this way, focus falls to the
document body (open warning IR-002 of the story's implementation review v2).

Tests: `save-as-universe-dialog.test.tsx` (TC-COMP-008 to TC-COMP-011).

## Add to a universe (`add-to-universe-dialog.tsx`)

`AddToUniverseDialog({ symbols, onClose, onNotify })` is the tray's **Add to
universe…** dialog (DAC-E4-S8-5, AC-4, AC-5; UX design 1.1; DEC-0163,
DEC-0168, DEC-0169, DEC-0259). Its host renders it while open (CAP-002-E4-S9,
behind the tray's `onAddToUniverse`) and owns the notices. The symbols are
those it opened with; a later change to `symbols` is ignored.

**Universes.** On open it reads the active universes once,
`listUniverses({ lifecycle: "active", limit: 500 })`, the API's largest page,
with no paging (DEC-0169). Meanwhile a `status` skeleton reading
`FILTERS.loadingUniverses` holds the select's box. The select, labelled
`DIALOGS.universe`, lists the universes in the API's order, then
`DIALOGS.newUniverseOption`. The first universe is chosen, or *New universe*
when none exists. A failed read replaces the field with an alert,
`failureSentence` of `list-universes`. Add is `aria-disabled` and does
nothing until the list has loaded.

**Focus.** It starts on Cancel. When the list arrives it moves to the
select, or to the Name field when there is no universe, unless the owner has
moved it meanwhile.

**Add.** *New universe* reveals a Name field; a blank name shows
`DIALOGS.enterName` and sends nothing. Add then calls
`createUniverse({ name, symbols })`, the by-hand shape, or
`addUniverseMembers(universeId, symbols)` for a chosen universe. While
pending, Add shows `ConfirmProgress`, Cancel is `aria-disabled`, and a changed
choice is ignored, so a refusal lands on the field it concerns. On success it
calls `onNotify` once with `DIALOGS.added(added, name, alreadyMembers)`,
counted from the response (a new universe's `memberCount`, with no
already-member clause), linking to the universe, then `onClose`. A
`universe_name_in_use` refusal is a field error on Name; any other failure,
`universe_retired` included, is an alert, and Add stays available.

Cancel, `Escape` and the overlay do nothing while a request is pending
(DEC-0259). A request that succeeds after the host unmounted the dialog
itself still notifies, since the stocks were added, but never calls
`onClose`. A failure after such an unmount is dropped: the owner is not told
(open warning IR-004 of the story's implementation review v2).

Tests: `add-to-universe-dialog.test.tsx` (TC-COMP-033).

## The score-set poll (`use-score-set-poll.ts`)

`useScoreSetPoll({ onNewSet })` is the poll every scored CAP-002 surface
runs (classification-ui 2.3, 2.6; UX design 1.2 Polling and Completion;
AC-20, AC-22; DAC-E4-4, DAC-E4-S4-4 to DAC-E4-S4-6; DEC-0153, DEC-0155,
DEC-0233). It takes one callback, `onNewSet(summary: ClassificationSummary)`,
read from the latest render through a ref, so a changed callback identity
does not restart polling. It returns:

| Field | Type | Meaning |
|-------|------|---------|
| `summary` | `ClassificationSummary \| null` | the last successful read; `null` before the first |
| `checkedAt` | `string \| null` | `new Date().toISOString()` after each successful read; `null` before the first, unchanged by a rejected read |
| `pollFailed` | `boolean` | true after a rejected read, until a read succeeds |
| `tryAgain` | `() => Promise<void>` | one read, now; polling resumes while a continuation condition holds |
| `announcement` | `string \| null` | `SCORE_SET.scoresUpdatedTo(endedAt, runStartedAt)` for the latest new set, both times through `formatTimestamp` |

`POLL_INTERVAL_MS`, an exported constant, is `10_000` (STD-UI-25),
mirroring `HEALTH_POLL_INTERVAL_MS` in `web/src/app/status-region.tsx`.

**Reads.** The hook calls `getClassificationSummary()` from
`web/src/api/classification-client.ts` once on mount, from first load and
before any set exists, then on a `setInterval` of `POLL_INTERVAL_MS` while
all of these hold:

- no read has failed since the last success (`pollFailed` is false), and
- the last read's `later.state` is `building`, or the shell's health reports
  the latest download non-terminal, or one more read is owed (below).

The download's state comes from the delivered `useHealth()` in
`status-region.tsx`: `health.most_recent_run.state` is `requested`,
`running` or `cancelling` (`isNonTerminalRunState` from
`web/src/screens/runs/outcome-badge.tsx`). The hook issues no health read of
its own, so the shell's single 30-second health interval is unchanged. The
timer is cleared when the condition stops holding and on unmount. At most
one read is in flight: a tick that lands during a slow read is skipped, not
queued.

**The owed read.** What a read can have seen is fixed when it is issued. A
read issued while the download still ran cannot have seen the set it
produced, so after the health reports the download terminal the hook keeps
its cadence until a read issued after that report has landed; that read's
`later` then governs (DEC-0233). The guarantee this gives is a further read
0 to 10 seconds after the terminal report. Two handoff exposures remain the
owner's question in DEC-0238 (open, provisional): the owed read's tick
landing inside the scheduler's claim window, and a download shorter than one
30-second health interval, which never shows non-terminal to the hook. If
the owner picks a different rule the hook changes, and CAP-002-E4-S4 and
CAP-002-E4-S9 are reworked.

**A new set.** The hook remembers the last read's `set.setId`, or `null`
when that read had no set, and distinguishes both from "not yet read". A
successful read whose `set` is non-null and whose `setId` differs from the
remembered value is a new complete set, a first set after a never-populated
read included: the hook sets `announcement` once and calls `onNewSet(next)`
once (DAC-E4-S4-5; DEC-0153). The very first read never fires, a read that
returns the same set never re-fires, and each further new set fires once
more. The host's reload with its sort, filters, selection and checked rows
preserved runs from `onNewSet` and is the host's (CAP-002-E4-S6, E4-S9).

**Failure.** A rejected read, whether the API did not answer or refused, sets
`pollFailed` true, keeps `summary` and `checkedAt` as they were, and stops
the timer until `tryAgain` (DEC-0155), whether or not a set exists yet. The
error's text is not rendered (STD-UI-23); the as-of line shows *Could not
check for newer scores.* with **Try again**, and in the never-populated
state, which has no line, E4-S9's body does from the same two fields.
`tryAgain` is the read itself: one call performs one read, a success clears
`pollFailed` and resumes the cadence while a condition holds, and a new set
it returns fires `onNewSet` as any read would. Only the read is guarded: a
host callback that throws is the host's defect, not a failed poll.

**Lifetime.** A mounted ref guards every state update and callback, so a
read resolving after unmount sets nothing and calls nothing. A `StrictMode`
double mount leaves one interval and fires `onNewSet` once. The hook keeps no
module-level state and touches no storage.

`use-score-set-poll.test.ts` beside it carries TC-COMP-177 and TC-COMP-184
and drives the hook with fake timers, mocking the client and `useHealth`.

## Universes screen (`universes/`)

The universes list and its create dialog (UX design 1.3; classification-ui
2.7; AC-1, AC-3, AC-5; CAP-002-E1-S7). Three modules:

- `index.tsx`, the default export `UniversesScreen`;
- `universe-table.tsx`, `UniverseTable` and `universeDetailPath(universeId)`,
  which gives `/research/universes/{id}` with the id URI-encoded;
- `create-dialog.tsx`, `CreateDialog({ onCreated, onCancel })` and
  `withLink(sentence, phrase, to)`, which renders the `phrase` inside
  `sentence` as a link and leaves the words verbatim (DEC-0254).

No route mounts the screen yet (CAP-002-E4-S10), and universe detail is
CAP-002-E1-S9's.

### The list (`index.tsx`)

`UniversesScreen` mirrors the delivered Instruments screen: one `card` whose
header keeps, in every state, the `h1` *Universes*, the counts line
`UNIVERSE_LIFECYCLE.counts(active, retired)` once a read has succeeded, a
lifecycle `select` (`data-variant="inline"`, named *Show: {option}*, options
*Active* (default), *Retired*, *All*) and **New universe…**.

Each selection reads every page of `listUniverses({ lifecycle, limit: 500,
cursor })` until `nextCursor` is `null` (DEC-0101); the counts are the last
page's. A selection change or **Try again** re-reads; a read that settles
after a newer one started is ignored. The screen's `ScreenState`:

| State | When | Renders |
|-------|------|---------|
| `loading` | a read is in flight | *Loading…* in a polite live region; the rows last shown stay, the table `aria-busy` and its body dimmed (DEC-0256, provisional) |
| `populated` | the selection has universes | the table |
| `empty-never-populated` | no universe exists in any lifecycle | no table; `UNIVERSES.noUniversesYet` with *Research* linking to `/research`, and focus on **New universe…** |
| `empty-no-match` | the selection matches none (DEC-0103) | the table's header row over one four-column cell: *No retired universes.* with **Reset filter** selecting *Active*, or *No active universes.* with **Reset filter** selecting *All* (DEC-0255) |
| `error` | a read failed | the header row over one cell: `failureSentence` for `list-universes` by `code` as an alert in `--destructive`, with **Try again** |
| `unreachable` | `ApiUnreachableError` | nothing; the shell owns the state |

**Reset filter** and **Try again** unmount when activated, so both move focus
to the lifecycle select (DEC-0256). Creating opens `CreateDialog`; on success
the screen navigates to `universeDetailPath` of the new id, with no toast. The
screen has no delete (STD-UI-2).

### The table (`universe-table.tsx`)

`UniverseTable({ universes, body?, busy })` is the `data-table`
`expandable` (`data-variant="expandable"`), patterned on the delivered
coverage table. The header row (*Name*, *Lifecycle*, *Members*, *Created*) is
always rendered; `body`, when given, replaces the rows in one `colSpan={4}`
cell; `busy` sets `aria-busy` and the `tbody` class `opacity-50`.

- **Name** sorts in the browser over the loaded rows, case-insensitively.
  Its header button cycles `aria-sort` none, ascending, descending, none
  (`NEXT_SORT`); unsorted is the order the API returned.
- Each row header holds an expander (`aria-expanded`, `aria-controls` naming
  the detail row, named *Show details for {name}* or *Hide details for
  {name}*) and the name as a link to the universe's detail. A retired row
  mutes its name and shows the `secondary` *Retired* badge, text with a
  hollow square (STD-UI-8). *Members* is `memberCount`; *Created* is the
  America/Chicago date of `createdAt`.
- The expanded row shows *Created {timestamp}*, *Retired {timestamp}* when
  `retiredAt` is set (both through `formatTimestamp`), and the origin line,
  in a polite live region.
- The origin line is read once per row while the table lives: `readOrigin`
  pages `listUniverseEvents(universeId, { limit: 500, cursor })`, newest
  first, until the `created` event, and passes its `filterProvenance` to
  `describeOrigin`. A failure, or a history with no `created` event or a
  provenance without `classification_date`, renders `failureSentence` for
  `list-universe-events` as an alert with **Try again**, which re-reads and
  moves focus to the row's expander.

`describeOrigin(provenance)` is module-private and pure (DEC-0108: CAP-002-E1-S9
will export and import it, so its name, parameter, `string` return and
wording are fixed). `null` gives *Created by hand*. Otherwise it gives
*Saved from a filter on {classification_date}*, then, each only when it
applied: `: ` and the bounds, in factor order value, growth, momentum,
percentile before standardised score, minimum before maximum, each
*{factor} {measure} {at least|at most} {value}* with the value through
`formatPercentile` or `formatScore`; `; search "{symbol}"`; and `; stocks with
an incomplete score hidden`. A threshold key outside the twelve is dropped.

### The create dialog (`create-dialog.tsx`)

`CreateDialog` is a native `<dialog open>` (`data-variant="standard"`, drawn
in `--popover`) built on the delivered `retire-dialog.tsx`: its own Tab
cycle between the Name field and **Create**, Escape cancels unless a request
is in flight, initial focus is on Name, and focus returns to the opener on
unmount.

- **Stocks to include** parses with CAP-001's `parseBulkSymbols` on paste
  (the text the paste produces, a replaced selection included) and on blur,
  never per keystroke. Blur rewrites the field one normalised entry per
  line. A polite counter reads *{n} symbols recognised, {m} not recognised*
  and lists each rejected entry.
- **Create** is `blocked` (`data-variant="blocked"`, still focusable,
  `aria-describedby` its reason) while the recognised entries, counted as
  parsed with duplicates, number zero (*Enter at least one stock.*) or more
  than 1000 (*Up to 1000 stocks can be added in one request.*) (DEC-0104).
  Submitting while blocked sends nothing. Submit re-parses the field first.
- A name empty after trimming is a Name field error, *Enter a name for the
  universe.*, and sends nothing.
- `createUniverse({ name, symbols })` sends the trimmed name and the distinct
  normalised symbols; **Create** and **Cancel** are disabled in flight. On
  success it calls `onCreated(universeId)`.
- Failures render by `code`, never the envelope's `message`:
  `instrument_not_acquired` with symbols gives the `failureSentence` naming
  them, with *Follow them on Data health* linking to
  `SHELL_ROUTES.followedStocks`, as an assertive alert; `universe_name_in_use`
  gives the Name field error *Another active universe is already named
  {name}.*; anything else gives the generic `create-universe` sentence. Both
  fields keep their text. Focus moves to Name for a Name error and to
  **Create** otherwise; editing Name clears its error.

Tests: `universes.test.tsx` (TC-COMP-020, TC-COMP-021, TC-COMP-022 and the
T010 cases) and `create-dialog.test.tsx` (TC-COMP-042, TC-COMP-006,
TC-COMP-007 and the T009 cases), mocking the fetch layer.

Open warnings from the story's implementation review v2: the `opacity-50`
dimming of kept rows falls below STD-UI-24's 4.5:1 contrast (IR-001), and
the list announces no row count after its rows update, which `data-table`
section 5 asks for (IR-002).
