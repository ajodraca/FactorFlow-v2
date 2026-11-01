# Shared presentation patterns (`web/src/components/patterns/`)

`web/src/components/patterns/` holds the compositions every CAP-002 surface
draws a factor result with (`component-design-classification-ui.md` section
2.5; UX design 1.1) and the score-set state it shows above its scores
(section 2.6; UX design 1.2). CAP-002-E4-S3 created the directory with two
files:

- `factor-cell.tsx`, one factor's result as a percentile and bar, or as one
  of three worded states;
- `restated-mark.tsx`, the *Possibly restated* mark.

CAP-002-E4-S4 added three:

- `not-current-banner.tsx`, the banner shown while a later set builds or
  after an attempt failed;
- `as-of-line.tsx`, the line that says when the scores were produced and
  from which download, and announces a change;
- `status-badge.tsx`, the tiered badge the banner and the line share.

CAP-002-E4-S7 added the two selection controls:

- `selection-tray.tsx`, the tray under the results that counts the checked
  rows and offers **Compare side by side** and **Add to universe…**;
- `inspector-panel.tsx`, the panel beside the results that reads and
  explains one selected stock.

Six of the seven are pure functions of their props: no state, no effect, no
fetch. The inspector is the exception: it holds its read's state and issues
`getStockEvidence` itself ([The inspector](#the-inspector-inspector-paneltsx)).
The poll that feeds the banner and the line lives beside the screen code, in
`web/src/screens/research/use-score-set-poll.ts`
([`research-screen.md`](research-screen.md#the-score-set-poll-use-score-set-pollts)).
They read their types from `web/src/api/classification-types.ts`
([`web-api.md`](web-api.md#types-classification-typests)) and their number
formatting and owner-facing strings from `web/src/screens/research/`
([`research-screen.md`](research-screen.md)); no string shown to the owner is
written in any of them. No route or screen imports them yet; their only
importers are each other (`status-badge.tsx` is imported by the banner and
the line, `factor-cell.tsx` by the inspector) and their own tests beside them
(`factor-cell.test.tsx`, `restated-mark.test.tsx`,
`not-current-banner.test.tsx`, `as-of-line.test.tsx`,
`selection-tray.test.tsx`, `inspector-panel.test.tsx`), which carry
TC-COMP-073, TC-COMP-074, TC-COMP-097, TC-COMP-109, TC-COMP-140 to
TC-COMP-143, TC-COMP-174, TC-COMP-175, TC-COMP-176 and TC-COMP-179.
CAP-002-E4-S9 is the first planned consumer of the banner, the line, the
tray and the inspector.

## The factor cell (`factor-cell.tsx`)

`FactorCell({ cell, factor, showScore = false, notFollowedSince = null })`
renders one inline `span` valid inside a table cell, so a table draws one per
factor per row.

| Prop | Type | Meaning |
|------|------|---------|
| `cell` | `FactorCell` from `classification-types.ts`, aliased `FactorCellData` | one factor's result as the API sends it: `status`, `score`, `percentile`, `reasonCode`, `reasonInput`, `reasonDetail`, `restatedPossible` |
| `factor` | `FactorName` | `value`, `growth` or `momentum`; named in the *Incomplete* sentence and read by the mark |
| `showScore` | `boolean`, default `false` | print the standardised score after the percentile. The list rendering leaves it off; the inspector, evidence and compare renderings set it |
| `notFollowedSince` | `string \| null`, default `null` | the date a stock stopped being followed, for the *Not followed* title. No current read carries it (DEC-0152) |

### Which rendering a cell gets

The state is chosen by `reasonCode` first, then `status` (DEC-0151), in this
order:

1. `reasonCode === "retired"` renders *Not followed*, even when the cell
   carries a `percentile`.
2. `reasonCode === "not_enough_stocks"` renders *Not enough to rank*, even
   when the cell is `classified` with a `percentile`.
3. `status === "classified"` with a non-null `percentile` renders the scored
   cell. A percentile of `"0.0000000000"` is a measurement and is scored as
   `0` with an empty bar; truthiness is never the test.
4. Anything else renders *Incomplete*: a `not_classified` cell with an input
   reason, with a null `reasonCode`, or with a `reasonCode` the type does not
   name, and a `classified` cell whose `percentile` is null.

The `score` and `percentile` an unscored cell carries are never read, so an
unscored factor never shows `0` or a bare number (DAC-E4-S3-1), while a
measured `0.00` score prints as `0.00` through `formatScore` (DAC-E4-S3-2).

### The four renderings

Every element the cell renders carries `data-testid="factor-cell"`. The three
worded states are badges that also carry a `data-variant`, share the delivered
badge size `inline-flex items-center gap-1 rounded px-2 py-1 text-xs` (copied
from `screens/coverage/badges.tsx`, which is CAP-001's and is not imported)
and draw an `aria-hidden` shape before the word. Their colours are the theme's
status tokens, never a polarity or factor-identity colour (DAC-E4-S3-4).

| State | `data-variant` | Visible text | Shape | Tokens | `title` |
|-------|----------------|--------------|-------|--------|---------|
| Scored | none | `formatPercentile(percentile)` | the bar | `font-numeric font-semibold` on the number; `--seq-4` on `--seq-1` for the bar | none |
| Incomplete | `coverage-absent` | `Incomplete` | an em dash | `bg-value-missing-muted text-value-missing` | the reason sentence, see below |
| Not enough to rank | `coverage-unknown` | `Not enough to rank` | a question-mark icon | `bg-value-indeterminate-muted bg-pattern-indeterminate text-value-indeterminate` (the hatch is on this state only) | none |
| Not followed | `status-neutral` | `Not followed` | a dash in a circle | `bg-status-neutral-muted text-status-neutral` | `Not followed. Earlier scores stand.`, or `Not followed since {date}. Earlier scores stand.` when `notFollowedSince` is given |

**The scored cell** is a `span` of up to four children, in this order:

1. the percentile, `data-testid="factor-percentile"`: `formatPercentile`'s
   whole number, right-aligned in a fixed `w-5` box in the numeric face at
   weight 600;
2. the bar, `data-testid="factor-bar"`, `aria-hidden="true"`: a `h-2 w-7`
   track painted `hsl(var(--seq-1))` holding a fill painted `hsl(var(--seq-4))`
   whose inline `width` is the printed whole number as a percentage. Both
   colours are inline styles because the Tailwind config maps no `seq` colour,
   and the width is data. Assistive technology reads the number alone;
3. the *Possibly restated* mark, when `cell.restatedPossible` is true (the
   mark itself returns nothing on momentum);
4. the standardised score, `data-testid="factor-score"`, only when
   `showScore` is set and `cell.score` is not null: `formatScore(score)` in
   `font-numeric text-xs text-muted-foreground`. A null score with `showScore`
   prints nothing, never `0.00`.

The box and the bar take the theme's spacing tokens nearest the design's
22 px and 52 px (DEC-0230, provisional).

**The Incomplete title** names the cause and the factor through `copy.ts`
(DEC-0151):

- with a `reasonDetail`, `CELL.incompleteDetail(reasonDetail, factor)`, for
  example *Incomplete: operating cash flow missing, so value can't be compared
  fairly. It isn't guessed.*; the detail is interpolated as sent;
- with a null `reasonDetail` and a `reasonCode` of `input_missing`,
  `input_outdated` or `input_not_computable`,
  `CELL.incompleteGeneric(reasonCode, factor)`: *an input is missing*, *an
  input is outdated* or *an input couldn't be computed* in the same sentence;
- with neither, no `title` at all (DEC-0229, provisional). The membership
  test is `Object.hasOwn` on the code table, so a reason named like an
  `Object.prototype` member gets no title either.

`reasonInput`, a payload key, is never read. The sentence is the badge's
`title` and is not repeated as visible text; the inspector carries it in
full.

**Not enough to rank** carries no count and no title: the *{n} qualified, 30
needed* line belongs to the column header, so a screen reader hears it once
per column, not once per cell.

**Not followed** formats `notFollowedSince` through `formatDate`, which
returns a `YYYY-MM-DD` string as given and throws `RangeError` on any other
shape, so a malformed date is refused rather than rendered.

## The Possibly restated mark (`restated-mark.tsx`)

`RestatedMark({ factor })` returns `null` when `factor` is `momentum`, and
otherwise one inline `span` with the `status-neutral` tokens at the delivered
badge size (`inline-flex items-center rounded px-2 py-1 text-xs
bg-status-neutral-muted text-status-neutral`) holding two children: the words
`Possibly restated` from `CELL.possiblyRestated` in an `sr-only` child, and
the glyph `R` in an `aria-hidden` child. Its accessible name is therefore its
own text, `Possibly restated`; it has no `role`, `aria-label` or `title`, is
not focusable and uses no badge component (DEC-0075). The explanation
sentence (`CELL.restatedExplanation`) is never in the mark; the inspector and
evidence carry it.

The momentum guard lives in the mark rather than in each consumer: the mark
never renders on momentum (DAC-E4-S3-3), and every surface that shows it
reuses this one element, so no caller can show it there by mistake
(DEC-0150).

## The status badge (`status-badge.tsx`)

`StatusBadge({ tier, children, title, className })` renders one inline
`span` holding an `aria-hidden` shape and a word. It is the badge the banner
and the line draw their states with (UX design 1.2; STD-UI-8); the factor
cell and the restated mark predate it and keep their own markup.

| Prop | Type | Meaning |
|------|------|---------|
| `tier` | `StatusTier`: `good`, `warning`, `active` or `critical` | the colour tokens and the shape |
| `children` | `string` | the word, from `copy.ts` |
| `title` | `string`, optional | a native tooltip; the *Updating* badge carries the building set's start time |
| `className` | `string`, optional | layout classes the host adds, as full literal strings (the banner adds `w-fit`) |

The `span` carries `data-variant="status-{tier}"`, the `title`, and a class
list made of the badge size `inline-flex items-center gap-1 rounded px-2
py-1 text-xs`, the host's `className`, and the tier's colour classes. Those
colour classes are `TIER_CLASSES[tier]` imported from the delivered
`web/src/screens/runs/outcome-badge.tsx` rather than restated (SA-DUP-001):
`bg-status-{tier}-muted text-status-{tier}`. The shape is a 12 by 12 `svg`
(`h-3 w-3 shrink-0`, `aria-hidden="true"`, `focusable="false"`) drawn in
`currentColor`, one per tier so the tiers stay distinct in greyscale: good a
filled circle with no stroke, warning a triangle, active a ringed dot (a
stroked ring around a filled dot), critical a square. The badge has no test
file of its own; the banner and line tests pin its variants, shapes and
tokens.

## The not-current banner (`not-current-banner.tsx`)

`NotCurrentBanner({ set, later })` renders the banner every scored surface
shows above its scores while a later set builds or after an attempt failed
(AC-20; DAC-E4-4, DAC-E4-S4-1, DAC-E4-S4-2), or `null`.

| Prop | Type | Meaning |
|------|------|---------|
| `set` | `CurrentSet \| null` | the current, complete set |
| `later` | `LaterSet \| null` | the building or failed set, when there is one |

It reads `set` and `later` only, never `CurrentSet.notCurrent`, so the list
and summary reads' shared shape is its one source (DEC-0082). It returns
`null` when either is null: with no later set the as-of line stands alone,
and with no current set the host's never-populated body renders the first
set's *Updating* or *Score update failed* from the same `later` block
(DAC-E4-2; that body is CAP-002-E4-S9's).

Otherwise it is a `card` container, a `div` with `data-testid`
`not-current-banner`, `data-variant="default"` and the classes `flex
flex-col gap-2 rounded border border-border bg-card p-4 text-base
text-card-foreground`, holding two children:

1. the badge (`StatusBadge`, `w-fit`): tier `warning` reading
   `SCORE_SET.notReflecting`, *Not reflecting the latest download*, when
   `later.state` is `building`; tier `critical` reading
   `SCORE_SET.scoreUpdateFailed`, *Score update failed*, when it is `failed`;
2. one `p` with the body sentence. Times are `formatTimestamp` of the set's
   `endedAt` (produced) and `runStartedAt` (download started). While building
   the body is `SCORE_SET.buildingBody(produced, downloadStarted)`. After a
   failure it is `SCORE_SET.failedBody(failedAt, reason, produced,
   downloadStarted)`, where `failedAt` is the later set's `endedAt`, or its
   `startedAt` when `endedAt` is null, and `reason` is the recorded
   `failureReason` as sent, or `SCORE_SET.noReasonRecorded` (*no reason was
   recorded*) when it is null. Both fallbacks cover the nullable wire types
   only; the scheduler records both on every failed set (DEC-0232,
   provisional).

The reason is rendered as a text child, never as HTML. The banner has no
button, link, handler or live region: the scheduler does not retry a failed
set, so nothing is offered to retry (STD-UI-2), and announcing is the as-of
line's (DEC-0154). Its body is one text paragraph, so its times render in
the surrounding face rather than `font-numeric`; the story's plan records
this against UX design 1.2 Token Usage as a follow-up.

## The as-of line (`as-of-line.tsx`)

`AsOfLine({ set, later, checkedAt, pollFailed, onTryAgain, announcement =
null, sortLabel, onOpenEarlierSets, loading = false })` renders the line under
a scored surface's title (AC-21; DAC-E4-4, DAC-E4-S4-1, DAC-E4-S4-3,
DAC-E4-S4-4; DEC-0154), and is the one place a score-set change is
announced.

| Prop | Type | Meaning |
|------|------|---------|
| `set` | `CurrentSet \| null` | the current set; `null` renders nothing (the never-populated body has no line) unless `loading` |
| `later` | `LaterSet \| null` | the building or failed set; *Updating* and *checked* appear only while `later.state` is `building` |
| `checkedAt` | `string \| null` | the ISO-8601 instant of the last successful poll read, as `useScoreSetPoll` returns it; `null` before the first |
| `pollFailed` | `boolean` | a rejected poll read; adds *Could not check for newer scores.* and **Try again** |
| `onTryAgain` | `() => void` | the **Try again** handler, one call per click |
| `announcement` | `string \| null`, default `null` | the sentence the live region carries, from the hook |
| `sortLabel` | `string`, optional | adds *· sorted by {label}*; omitted on compare and evidence |
| `onOpenEarlierSets` | `() => void`, optional | renders the **Earlier sets…** button; the dialog is CAP-002-E4-S9's, so without a handler the button is absent |
| `loading` | `boolean`, default `false` | with `set` null, renders the skeleton instead of nothing |

**The skeleton** is a `div` with `data-testid` `as-of-line-skeleton`,
`aria-hidden="true"` and the classes `min-h-7 w-full animate-pulse rounded
bg-secondary`. The line and the skeleton share the one height token
`min-h-7`, so the skeleton stands in at the line's final height and the
table beneath does not shift (UX design 1.2, Loading).

**The line** is a `p` with `data-testid` `as-of-line` and the classes
`min-h-7 text-xs text-muted-foreground`, in inline flow (no flex container),
with these children in DOM order:

1. the set sentence: `SCORE_SET.scoresFrom(produced)`, with the produced time
   (`formatTimestamp(set.endedAt)`) in a `font-numeric` span, then
   `SCORE_SET.separator` (` · `), then
   `SCORE_SET.fromTheDownloadStarted(started)`, with the start time
   (`formatTimestamp(set.runStartedAt)`) as a react-router `Link` to
   `SHELL_ROUTES.download(set.runId)` whose `aria-label` is
   `SCORE_SET.openDownload(started)` and whose classes are `font-numeric
   underline`. The run is named by its start time, never by a number or
   UUID (DEC-0083);
2. the outcome badge, from `set.runOutcome`: `succeeded` is tier `good`
   reading `SCORE_SET.complete`, *Complete*; `partial` is tier `warning`
   reading `SCORE_SET.partial`, *Partial*;
3. ` · sorted by {sortLabel}` (`SCORE_SET.sortedBy`), when `sortLabel` is
   given;
4. `SCORE_SET.checked(time)`, *checked {time}*, in a `font-numeric` span,
   where `time` is `formatTimestamp(checkedAt, { seconds: true })`, only
   while `later.state` is `building` and `checkedAt` is non-null. It sits
   outside the live region so the 10-second tick is not announced
   (STD-UI-25);
5. the live region, an `output` with `aria-live="polite"`,
   `aria-atomic="false"` and `data-testid` `as-of-line-status`, present
   whenever the line renders and empty when it holds nothing (so the first
   announcement is read). Its children, in order: the `announcement` text in
   a `span`, when non-empty; the *Updating* badge (tier `active`,
   `SCORE_SET.updating`) while `later.state` is `building`, with the
   building set's formatted `startedAt` as its `title`; the **Earlier
   sets…** button (`SCORE_SET.earlierSetsAction`, `type="button"`,
   `data-variant="ghost"`, classes `rounded px-2 py-1 text-xs underline`)
   when `onOpenEarlierSets` is given, which never changes while mounted and
   so is never announced; and, while `pollFailed`, a `br` followed by
   `SCORE_SET.couldNotCheck`, *Could not check for newer scores.*, so the
   failure reads under the line. An `output` carries `role="status"`
   implicitly; `aria-atomic` is set to `false` explicitly because
   `role="status"` is atomic by default, and an atomic region would re-read
   the retained announcement whenever *Updating* or the failure text toggles
   (STD-UI-24; CAP-002-E4-S4 Open Gap 6);
6. the **Try again** button (`RESULTS.tryAgain`, `type="button"`, classes
   `rounded border border-border px-2 py-1 text-xs`), immediately after the
   region and outside it, while `pollFailed`, calling `onTryAgain`.

A new set, a set starting to build and a failed poll are therefore each
announced once; the checked tick, the link, the outcome badge and **Try
again** are not. A failed poll clears no mark: the set sentence, the outcome
badge and *Updating* all stay. The banner beside the line is unaffected by a
failed poll, because the hook keeps the summary it reads from.

## The selection tray (`selection-tray.tsx`)

`SelectionTray({ checked, onAddToUniverse })` renders the tray the Research
screen (CAP-002-E4-S9) and a universe's Members tab mount under their results
(DAC-E4-S7-1, AC-16; classification-ui section 2.5; UX design 1.1). It is
controlled and stateless: `checked` is the host's, the host keeps it unique by
symbol, and the tray counts what it is given by `checked.length`, a duplicate
included (DEC-0163).

| Prop | Type | Meaning |
|------|------|---------|
| `checked` | `string[]` | the checked symbols, in the order checked |
| `onAddToUniverse` | `(symbols: string[]) => void`, optional | called with `checked` by **Add to universe…**; the host opens the add dialog with it ([`research-screen.md`](research-screen.md#add-to-a-universe-add-to-universe-dialogtsx)). Without it the button is absent |

With no checked row it renders nothing (`null`). It does not mount an empty
live region at 0, so the count it shows on first appearance may not be
announced by every screen reader; the Research screen that composes it owns
announcing the first selection (DEC-0249, owner-decided, propagating to
CAP-002-E4-S9).

From one checked row it renders a `section` labelled `REGIONS.selection`,
*Selection* (so its role is `region`), with the classes `flex flex-wrap
items-center gap-3 rounded bg-foreground p-3 text-background`, holding in
order:

1. a `p` with `aria-live="polite"` reading `SELECTION.selected(n)`, *{n}
   selected*;
2. **Compare side by side** (`SELECTION.compareSideBySide`). While 2 to 6 rows
   are checked (`COMPARE_MIN` and `COMPARE_MAX`, exported; the API's
   `symbols` bound, DEC-0070) it is a react-router `Link` to
   `/research/compare?symbols=` followed by the symbols in the order checked,
   each `encodeURIComponent`-encoded and joined by literal commas, with
   `data-variant="outline"`. At 1 or at 7 and more it is a `button` with
   `data-variant="blocked"` and `aria-disabled="true"`, never `disabled`, so it
   keeps focus; it has no handler, so a click, Enter or Space does nothing. Its
   reason, `SELECTION.compareBlocked`, *Check 2 to 6 stocks to compare them.*,
   is a visible `span` beside it, referenced by the button's
   `aria-describedby`. This is the blocked pattern of
   `screens/instruments/start-action.tsx`;
3. **Add to universe…** (`SELECTION.addToUniverse`), a `button` with
   `data-variant="outline"`, only when `onAddToUniverse` is given.

The link and both buttons share the delivered button size `w-fit rounded
border border-border px-3 py-2 text-sm`.

Tests: `selection-tray.test.tsx` (TC-COMP-140, and the tray's appearance,
count, encoding and Add seam).

## The inspector (`inspector-panel.tsx`)

`InspectorPanel({ symbol })` renders the panel the Research screen
(CAP-002-E4-S9) and a universe's Members tab mount beside their results
(DAC-E4-S7-2, DAC-E4-S7-3, DAC-E4-S7-4, AC-16; classification-ui section 2.5;
UX design 1.1). `symbol` is the host's immediate selection, `null` when none,
not the results table's debounced `onInspect` value: the inspector owns the
one 150 ms wait (`INSPECT_DEBOUNCE_MS`, exported; DEC-0164).

It is always one `section` labelled `REGIONS.selectedStock`, *Selected
stock*, with `data-variant="summary"`, `tabIndex={-1}` and the classes `flex
flex-col gap-3 rounded border border-border bg-card p-4 text-card-foreground`.
The `tabIndex` makes it focusable by script only; it is never a tab stop.

### Reading the selected stock

- **Nothing selected.** With `symbol` null it reads `SELECTION.inspectorEmpty`,
  *Select a stock to see why it scores as it does.*, and issues no read.
  Clearing the selection discards a read in flight or a shown failure.
- **One read per settled selection.** A symbol that stays selected for 150 ms
  is read once with `getStockEvidence(symbol)`
  ([`web-api.md`](web-api.md#endpoint-functions-classification-clientts)).
  A burst of selections issues one read, for the last. There is no polling, no cache and no prefetch.
- **Loading.** From the moment a symbol is selected until its read settles,
  the body is a skeleton: an `output` (implicitly `role="status"`) with the
  classes `block h-8 w-full animate-pulse rounded bg-secondary`, holding
  `SELECTION.inspectorLoading`, *Loading the selected stock.*, in an `sr-only`
  `span`. Its height is the spacing token `h-8` (`var(--space-8)`), never a
  literal (STD-UI-29; DEC-0251, owner-upheld). A new selection resets the
  panel during render, before the commit, so the previous stock is never
  shown under the new one.
- **Failure.** A rejected read shows a `p` with its STD-UI-19 sentence and a
  **Try again** button (`RESULTS.tryAgain`). A `ClassificationApiError` gives
  `failureSentence(error)`, built from its code, never its `message`; any
  other rejection, a network error say, gives the `get-stock-evidence`
  sentence with a null code. **Try again** moves focus to the section, the one
  element that stays through the failure, the skeleton and the loaded stock,
  then reads the same symbol once more after the same 150 ms wait (DEC-0250,
  provisional; STD-UI-24). The focused section shows the browser's default
  focus outline.
- **Stale reads are dropped** (DEC-0165). Each read is keyed by the
  `(symbol, attempt)` it was issued for, `attempt` counting **Try again**
  presses. A read for a selection that is no longer current is ignored,
  whether it succeeds or fails and whether it settles before or after the
  current read. Two guards cover this: the effect's cleanup flag, and a key
  check at render, which covers the gap between the new selection's commit
  and React running the previous effect's cleanup.

### The loaded stock

Top to bottom, as UX design 1.1 orders it:

1. the symbol in `font-numeric text-xl`, followed by a *Not followed* badge
   when `lifecycle` is `retired`, then the name in `text-sm`;
2. the memberships line, a `p` with `data-testid="memberships"`: *In no
   universe* (`SELECTION.inNoUniverse`) when the stock belongs to none,
   otherwise *In* followed by each universe name as an underlined link to
   `/research/universes/{universeId}` (encoded), joined by `, ` and a final
   ` and ` (`SELECTION.inUniversesLead`, `listComma`, `listAnd`), so it reads
   as `SELECTION.inUniverses` does;
3. a `dl` with one block per factor, value, growth, momentum:
   - the `dt`: the factor's identity swatch, an `aria-hidden` `inline-block
     h-2 w-2 rounded` `span` painted `hsl(var(--factor-{factor}))` as an
     inline style (the Tailwind config maps no `factor` colour; DEC-0166),
     then `FACTOR_LABELS[factor]`. The swatch's corner is `rounded`, the
     corner the other patterns use (DEC-0251);
   - a `dd` with [`FactorCell`](#the-factor-cell-factor-celltsx) with
     `showScore`, or `CELL.absentValue` (`—`) when the evidence has no cell
     for the factor. *Not enough to rank* prints no count;
   - when any of the factor's inputs has an `asOf`, a `dd` with
     `data-testid="inputs-line"` in `text-xs`: the dated inputs grouped by
     identical `(asOf, knownOn)` in the order first seen, one clause per group
     joined by `SELECTION.inputsLineSeparator` (`; `). A clause is
     `SELECTION.inputsLine(labels, asOf, knownOn)`, *From {inputs}, as of
     {date}, known {date}*, or `SELECTION.inputsLineAsOf(labels, asOf)` when
     the group has no `knownOn`. Dates pass through `formatDate`. Only each
     input's `label` is printed, never its `inputName` or `detail`
     (STD-UI-1);
4. the explanation box, when it holds a sentence (below);
5. **See every input and its date** (`SELECTION.seeEveryInput`), a link to
   `/research/stocks/{symbol}` (encoded) with `data-variant="outline"` and the
   delivered button classes;
6. the footnote, `SELECTION.footnote`, in `text-xs text-muted-foreground`.

The holdings line and **Start a strategy from this screen** belong to M2 and
are absent.

**The *Not followed* badge** repeats `FactorCell`'s `status-neutral` badge
markup (dash in a circle, `CELL.notFollowed`) rather than importing it,
because `factor-cell.tsx` exports no badge. Likewise the box below restates
the cell's choice of state. A later change to `FactorCell`'s state order
must be mirrored here (open warning IR-002 of the story's implementation
review v4).

### The explanation box

The box explains what the factor cells draw, so its rules follow
`FactorCell`'s choice of state (DEC-0151, DEC-0247). Its sentences, in this
order:

1. one *Incomplete* sentence per factor `FactorCell` draws *Incomplete*
   (not `retired`, not `not_enough_stocks`, and not `classified` with a
   percentile), in factor order. It is the badge's own `title`:
   `CELL.incompleteDetail` from `reasonDetail`, else `CELL.incompleteGeneric`
   from an input reason code. A cell with neither contributes no sentence
   (DEC-0229);
2. `CELL.notFollowedNoDate`, *Not followed. Earlier scores stand.*, when the
   stock's `lifecycle` is `retired`;
3. `CELL.restatedExplanation`, the STD-UI-17 sentence, once, when any value or
   growth cell is drawn scored with `restatedPossible`, that is, when a
   *Possibly restated* mark is on screen.

The box opens whenever it holds at least one sentence and is absent
otherwise, so a followed stock with every factor scored and no mark has no
box. It is a `div` with `data-testid="explanation"` and the classes `flex
flex-col gap-2 rounded-[var(--radius)] border border-border p-3 text-sm`,
one `p` per sentence. Its corner is the theme's `--radius` through an
arbitrary-value class, as CAP-002-E4-S8's dialog frame and notices use,
with no theme or Tailwind change (DEC-0262, owner-decided); the card,
buttons, skeleton and badge keep `rounded`.

Tests: `inspector-panel.test.tsx` (TC-COMP-141, TC-COMP-142, TC-COMP-143, and
the loading, failure, **Try again**, stale-read, factor-block and explanation
cases). Open warning IR-001 of implementation review v4: no test yet drives
the new selection's own read failing after a stale success settles in the
commit gap; the code handles it.
