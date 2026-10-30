# Shared presentation patterns (`web/src/components/patterns/`)

`web/src/components/patterns/` holds the compositions every CAP-002 surface
draws a factor result with (`component-design-classification-ui.md` section
2.5; UX design 1.1). CAP-002-E4-S3 created the directory with two files:

- `factor-cell.tsx`, one factor's result as a percentile and bar, or as one
  of three worded states;
- `restated-mark.tsx`, the *Possibly restated* mark.

Both are pure functions of their props: no state, no effect, no fetch. They
read their types from `web/src/api/classification-types.ts`
([`web-api.md`](web-api.md#types-classification-typests)) and their number
formatting and owner-facing strings from `web/src/screens/research/`
([`research-screen.md`](research-screen.md)); no string shown to the owner is
written in either file. No route or screen imports them yet; their only
importers are their own tests beside them (`factor-cell.test.tsx`,
`restated-mark.test.tsx`), which carry TC-COMP-073, TC-COMP-074, TC-COMP-097
and TC-COMP-109.

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
