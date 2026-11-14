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

CAP-003-E1-S5 added `tiers.ts`, the status-to-tier and status-to-label
functions, and rebuilt `status-badge.tsx` on the `Badge` component and the six
tiers.

CAP-003-E1-S6 added `format.ts`, the America/Chicago formatters, and
`presence.tsx`, the *absent* and *not determinable* renderings. No screen
imports either yet; their only importers are their tests.

CAP-003-E1-S7 added `worst-data-tier.ts`, the data verdict and the one tier
order. No screen imports it yet; its only importer is its test.

CAP-002-E4-S7 added the two selection controls:

- `selection-tray.tsx`, the tray under the results that counts the checked
  rows and offers **Compare side by side** and **Add to universe…**;
- `inspector-panel.tsx`, the panel beside the results that reads and
  explains one selected stock.

CAP-002-E5-S1 added one:

- `comparison-table.tsx`, the table that sets 2 to 6 stocks side by side,
  one column each.

Six of the eight are pure functions of their props: no state, no effect, no
fetch. The inspector is one exception: it holds its read's state and issues
`getStockEvidence` itself ([The inspector](#the-inspector-inspector-paneltsx)).
The comparison table is the other: it holds each input row's open or closed
dates disclosure, and fetches nothing
([The comparison table](#the-comparison-table-comparison-tabletsx)).
The poll that feeds the banner and the line lives beside the screen code, in
`web/src/screens/research/use-score-set-poll.ts`
([`research-screen.md`](research-screen.md#the-score-set-poll-use-score-set-pollts)).
They read their types from `web/src/api/classification-types.ts`
([`web-api.md`](web-api.md#types-classification-typests)) and their number
formatting and owner-facing strings from `web/src/screens/research/`
([`research-screen.md`](research-screen.md)); no string shown to the owner is
written in any of them. Outside the
directory, `web/src/screens/research/results-table.tsx` (CAP-002-E4-S6)
and `web/src/screens/research/universes/detail/members-tab.tsx`
(CAP-002-E1-S8, for its as-of table) import the factor cell, and
`web/src/screens/research/compare/index.tsx` (CAP-002-E5-S1) imports the
comparison table; otherwise their importers are each other
(`status-badge.tsx` is imported by the banner and the line, `factor-cell.tsx`
by the inspector and the comparison table, `restated-mark.tsx` by the
comparison table) and their own tests beside them (`factor-cell.test.tsx`,
`restated-mark.test.tsx`, `not-current-banner.test.tsx`,
`as-of-line.test.tsx`, `selection-tray.test.tsx`, `inspector-panel.test.tsx`,
`comparison-table.test.tsx`), which carry TC-COMP-073, TC-COMP-074,
TC-COMP-097, TC-COMP-109, TC-COMP-114, TC-COMP-127, TC-COMP-140 to
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

## The status tiers (`tiers.ts`)

`tiers.ts` is the one status-to-tier function of the owner interface
(CAP-003-E1-S5; AC-20, AC-19). It imports only the `RunState` type, and
exports `Tier`, `NeedsYouKind`, `Status`, `tierOf` and `labelOf`.

`Tier` is `neutral`, `active`, `good`, `warning`, `serious` or `critical`.
`Status` is a union tagged by `of`:

| `of` | Other fields | `tierOf` / `labelOf` |
|------|--------------|----------------------|
| `download` | `state`: a `RunState` | `requested` neutral *Queued*; `running` active *Downloading*; `cancelling` warning *Stopping*; `succeeded` good *Complete*; `partial` warning *Partial*; `failed` critical *Failed*; `cancelled` neutral *Cancelled by you*; `abandoned` serious *Interrupted* |
| `result` | `outcome`: `failed` or `not_found` | `not_found` warning *Not found*; `failed` critical *Failed* |
| `scores` | `state`: `never_classified`, `building`, `not_current`, `failed` or `current` | `building` active *Updating*; `not_current` warning *Not reflecting the latest download*; `failed` critical *Score update failed*; `never_classified` neutral *No scores yet*; `current` good *Current* |
| `check` | `check`: `daily_prices` or `company_financials`; `status`: `ok` or `exceptions` | `ok` good, *No missing prices or gaps* or *All financials present* by check; `exceptions` warning *Needs attention* |
| `credential` | `present`: boolean | present good *Found*; absent critical *Missing* |
| `item` | `kind`: a `NeedsYouKind`; `failed?`: boolean | `data_problems` warning *Data*; `download_not_complete` serious *Download*, critical when `failed`; `credential_missing` critical *Setup*; `first_download` active *Download*; `first_scores` active *Scores*; `score_failed` critical *Scores* |

`NeedsYouKind` is `data_problems`, `download_not_complete`,
`credential_missing`, `first_download`, `first_scores` or `score_failed`; it
is declared here so the module imports nothing from `needs-you.ts`.

`partial` is warning and never good; `cancelled` is neutral and never
critical. Not determinable is not a tier: it renders through
`NotDeterminable`, never through `tierOf`. Every `switch` ends in
`default: return assertNever(...)`, which throws `Unhandled status: <JSON>`,
so a kind or state added to `Status` without a row fails to type-check.
`labelOf` is the one source of status labels. Tests: `tiers.test.ts`.

## The data verdict (`worst-data-tier.ts`)

`worst-data-tier.ts` composes the answer to *is my data good?* once, so Data
health's verdict and Home's data tile cannot disagree (CAP-003-E1-S7;
`ui-components` 2.4; AC-8, AC-11, AC-21; DAC-E1-3, DAC-E1-4, DAC-E1-5). It
imports the `RunState` type and `Status`, `Tier`, `tierOf` and `labelOf` from
`tiers.ts`, and exports `TIER_ORDER`, `DataAnswer`, `worstDataTier` and
`dataTileBadge`. The checks' tiers are not an input (DEC-0210 as amended), and
not determinable is not an answer of this module.

**`TIER_ORDER`** is the one six-tier order of the owner interface (DEC-0217 as
amended, DEC-0311): a frozen `Record<Tier, number>` where a lower rank is
worse — critical 0, serious 1, warning 2, good 3, active 3, neutral 4. Active
ranks alongside good, and "x is worse than y" is `TIER_ORDER[x] <
TIER_ORDER[y]`. `sortAttention` (`needs-you.ts`, CAP-003-E1-S8, not yet
present) is to import it; no other source under `web/src` may declare a tier
order.

**`worstDataTier({ affectedCount, followedCount, latestTerminalDownload })`**
returns a `DataAnswer`, `{ tier, word, downloadClause }`, or `null`:

- `null` when `latestTerminalDownload` is `null`: no verdict, and never *Yes*,
  before a download has ended. No count is read.
- The problem tier: `good` when `affectedCount` is 0; otherwise `critical` when
  `affectedCount >= followedCount`, which includes a `followedCount` of 0
  (DEC-0312, provisional); otherwise `warning`.
- The download tier: `failed` is `critical` with the clause `"failed"`;
  `abandoned` is `serious` with the clause `"interrupted"`. Every other state,
  `cancelled` and `partial` included, contributes no tier and no clause.
- The worse of the two wins, by `TIER_ORDER`; on a tie the problem tier stands.
  The clause comes from the download alone, so an `abandoned` download keeps
  `"interrupted"` under a critical problem set.
- The word follows the tier: good *Yes*, warning and serious *Mostly yes*,
  critical *No*.

**`dataTileBadge(verdict, scores)`** gives Home's data tile its badge,
`{ tier, label, from }`, or `null` when `verdict` is `null`, whatever the score
state. `scores` is a `Status` of `of: "scores"`, or `null`. The scores win only
when `tierOf(scores)` is strictly worse than the verdict's tier; then the label
is `labelOf(scores)` and `from` is `"scores"`. Otherwise the badge is the
verdict's tier and word, `from: "verdict"`: a tie goes to the verdict, active
ties good, and neutral never wins.

Tests: `worst-data-tier.test.ts` (TC-COMP-026, TC-COMP-001, TC-COMP-027). The
TC-COMP-027 cases scan every non-test `.ts` and `.tsx` source under `web/src`,
comments stripped, and fail when a second file declares `TIER_ORDER` or an
order literal, or names `TIER_ORDER` without importing it from
`worst-data-tier`; once `needs-you.ts` exists, they also require it to import
`TIER_ORDER`.

## The status badge (`status-badge.tsx`)

`StatusBadge({ tier, children, title, className })` renders one `Badge`
(`ui/badge.tsx`, [`ui-components.md`](ui-components.md#badge-badgetsx)) with
variant `status-{tier}`, holding an `aria-hidden` shape and a word. It is the
badge the banner and the line draw their states with (UX design 1.2;
STD-UI-8); the factor cell and the restated mark predate it and keep their
own markup.

| Prop | Type | Meaning |
|------|------|---------|
| `tier` | `Tier` | the colour tokens and the shape |
| `children` | `string` | the word, from `labelOf` or the caller's own answer |
| `title` | `string`, optional | a native tooltip; the *Updating* badge carries the building set's start time |
| `className` | `string`, optional | layout classes the host adds, as full literal strings (the banner adds `w-fit`) |

The colours and size come from the `Badge` variant, which sets
`data-variant="status-{tier}"`. The shape is a 12 by 12 icon from `lucide-react`
(`h-3 w-3 shrink-0`, `aria-hidden="true"`, `focusable="false"`) drawn in
`currentColor`, one per tier so the tiers stay distinct in greyscale: neutral a
hollow circle, active a ringed dot, good a filled circle, warning a filled
triangle, serious a filled diamond, critical a filled square. `StatusTier` is
kept as an alias of `Tier` for the CAP-002 callers (`as-of-line`,
`set-history-dialog`, `history-tab`). Tests: `status-badge.test.tsx`.

## The formatters (`format.ts`)

`format.ts` is the one place the owner interface formats an instant, a
session date or a count (CAP-003-E1-S6; AC-24; STD-UI-5; DEC-0309,
provisional). It has no import. Every instant renders in `America/Chicago`
with the zone as that instant falls (`CDT` or `CST`), built from
`Intl.DateTimeFormat` parts in `en-US`; the viewer's machine zone is never read
and no `toLocale*` call is made. The shell's `formatTimestamp` is unchanged.

`Instant` is `Date | string`. A string must be an ISO-8601 instant that carries
its zone, `Z` or an offset (`+hh:mm`, `-hh:mm`), with optional seconds and
fraction; a bare local time is refused.

| Function | Returns |
|----------|---------|
| `formatInstant(value, { seconds? })` | `2026-10-15 17:46 CDT`; with `{ seconds: true }`, `2026-10-15 17:52:10 CDT` |
| `formatClock(value)` | `17:52:10 CDT`, for a *checked {time}* clause |
| `formatSessionDate(value: string)` | the string as received, after a `^\d{4}-\d{2}-\d{2}$` check; it never passes through `Date`, so no zone can shift it |
| `formatCount(n: number)` | a whole, non-negative safe integer with `,` thousands separators; `0` is a measured zero |
| `formatDownloadName(startedAt, requestedAt)` | `Download {formatInstant(startedAt ?? requestedAt)}`: the start time, else the request time (capability OQ-1) |

The formatter is built on each call, so the zone is always the one the module
names. It uses `hourCycle: "h23"`, so midnight reads `00`, never `24`. The
guards throw `RangeError`: `Not an ISO-8601 instant: <JSON>` for a string that
is not an instant, or a `Date` that is invalid; `Not an ISO-8601 date: <JSON>`
for `formatSessionDate`; `Not a count: <n>` for a negative, fractional,
non-finite or unsafe number. Tests: `format.test.ts` (TC-COMP-023,
TC-COMP-024, and the clock and guard cases), run under a non-Chicago `TZ` to
show the machine zone is ignored.

## The presence renderings (`presence.tsx`)

`presence.tsx` draws the two states of a value that is not there (CAP-003-E1-S6;
AC-24; STD-UI-4, STD-UI-14; DEC-0310, provisional). Present is the value
itself. A blank means only "does not apply" and is not this module's.

- `Absent({ label })` renders a value that does not exist: a `span` with
  `text-value-missing` holding an `aria-hidden` em dash and an `sr-only` span
  with `label`, the full phrase naming what is absent. It is never zero and
  never blank.
- `NotDeterminable({ reason, label = "Not determinable" })` renders a value
  that cannot be known: an `inline-flex items-center gap-2` `span` holding a
  `Badge` with variant `coverage-unknown` and the label, then the reason in a
  `text-xs text-muted-foreground` `span`. The badge's `aria-describedby` is
  that span's `useId()` id, so the reason is both visible beside the badge and
  its accessible description. It is never a dimmed absent and never a passed
  check.

Neither takes a tab stop or a role. Tests: `presence.test.tsx` (TC-COMP-025).

Open warnings from the story's implementation review v2: no test passes a
fractional-second or minute-precision instant (IR-001); nothing pins that the
visible reason stays in the accessibility tree and follows the badge (IR-002).

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

## The comparison table (`comparison-table.tsx`)

`ComparisonTable({ columns, factors, onRemove })` renders 2 to 6 stocks side
by side, one column each, with the three factors as row groups
(classification-ui section 2.5; UX design 1.5; AC-15, AC-16, AC-23,
DAC-E5-1, DAC-E5-3, DAC-E5-5, DAC-E5-S1-1, DAC-E5-S1-4, DAC-E5-S1-5;
CAP-002-E5-S1). It is presentational: the Compare screen
([`research-screen.md`](research-screen.md#compare-screen-compare)) builds
the columns and removes one on request.

| Prop | Type | Meaning |
|------|------|---------|
| `columns` | `ComparisonColumn[]` | one per stock, in screen order: `symbol`, `name`, `lifecycle`, `factors` (the three `FactorCell` results, from the list read) and `inputs` (the `InputRow`s, from the evidence read) |
| `factors` | `Record<FactorName, FactorSummary>`, optional | the list read's per-factor summary. Absent for a single column, which has no list read (DEC-0176) |
| `onRemove` | `(symbol: string) => void` | called by a column's remove control |

A stock keeps its column whatever its cells say, and `reasonInput`, a payload
key, is never read (DEC-0151, STD-UI-1).

**Container.** A `section` named `COMPARE.comparisonOf(n)`, *Comparison of
{n} stocks*, with `tabIndex={0}` so the keyboard can scroll it, and
`overflow-x-auto`. It holds one native `table` with the same `aria-label` and
the classes `w-full border-collapse text-sm`. The row headers and the corner
header are `sticky left-0` with a right border and the `bg-background` fill,
so the labels stay in view while the columns scroll.

**Column headers.** The corner is a `th` `scope="col"` holding
`COMPARE.measure`, *Measure*, for screen readers only. Each stock's header is
a `th` `scope="col"` with `data-symbol` and `tabIndex={-1}` (focusable by
script, for the screen's focus after a removal), holding:

1. the symbol as a react-router `Link` to `/research/stocks/{symbol}`, the
   symbol `encodeURIComponent`-encoded, in `font-semibold underline`;
2. the name in `text-xs text-muted-foreground`;
3. for a `retired` stock, the *Not followed* badge: `data-variant`
   `status-neutral`, `bg-status-neutral-muted text-status-neutral` at the
   delivered badge size, with the factor cell's dash-in-a-circle shape before
   `CELL.notFollowed` (STD-UI-8). It repeats that markup, since
   `factor-cell.tsx` exports no badge;
4. the remove control: a ghost `button` (`data-variant="ghost"`) showing
   `COMPARE.removeGlyph`, `×`, named `COMPARE.removeFromComparison(symbol)`,
   *Remove {symbol} from comparison*, which calls `onRemove(symbol)`.

**Rows.** For each factor in the order value, growth, momentum:

1. the group header, a `th` `scope="row"` spanning every column in
   `bg-secondary font-semibold`, reading `FACTOR_LABELS[factor]`. When
   `factors` is given and the factor's summary is not `ranked`, it adds
   `COMPARE.notEnoughToRankGroup(qualifiedCount, minPeerSetSize)`, *Not
   enough to rank · {n} qualified, {min} needed*, once for the group, not per
   cell;
2. *Percentile* (`COMPARE.percentile`): each cell is
   [`FactorCell`](#the-factor-cell-factor-celltsx) without `showScore`, so a
   retired stock reads *Not followed*, an unranked one *Not enough to rank*,
   an incomplete one *Incomplete* with its `reasonDetail` title, and a
   restated value or growth percentile carries the mark;
3. *Standardised score* (`COMPARE.standardisedScore`), in
   `text-muted-foreground`: `formatScore(score)` in `font-numeric` only for a
   `classified` cell with a score and a percentile whose `reasonCode` is
   neither `retired` nor `not_enough_stocks`; any other cell shows
   `CELL.absentValue`, the em dash;
4. the factor's input rows, labelled from `COMPARE.inputLabels`: value has
   *Book-to-price*, *Earnings yield* and *Free-cash-flow yield*, formatted
   with `formatRatio`; growth has *Revenue growth* and *EPS growth*, and
   momentum *3-month return*, *6-month return* and *12-month return*, all
   formatted with `formatRate`.

The percentile and score row headers add `, {factor}` for screen readers
only, so each row's name says which group it belongs to.

**An input cell** finds the column's `InputRow` by `inputName` (DEC-0077):

| Input | Renders |
|-------|---------|
| no row (a retired stock) | the em dash only; no status, since no row is not a fault (DEC-0073, DEC-0077) |
| `missing` | the em dash and a *Missing* badge (`INPUT_STATUS.missing`; `data-variant="coverage-absent"`, `bg-value-missing-muted text-value-missing`) |
| `outdated` | the value and an *Outdated* badge (`data-variant="status-warning"`, `bg-status-warning-muted text-status-warning`) with a triangle shape |
| `not_computable` | the value, or the em dash when it is null, and *Couldn't be computed* in `text-xs text-status-warning` with the triangle, no badge fill |
| any other status | the value in `font-numeric`, or the em dash when it is null |

A row with `restatedPossible` adds the
[*Possibly restated* mark](#the-possibly-restated-mark-restated-marktsx),
which returns nothing on momentum. The explanation sentence is not the
table's: the screen renders it once under the table.

**Dates disclosure** (DEC-0078). Each input row's header holds a ghost
**Dates** button (`COMPARE.dates`) named `COMPARE.showDatesFor(label)` with
the label in lower case, *Show dates for book-to-price*, and carrying
`aria-expanded`. It toggles that row for every column at once; each row's
state is its own and starts closed. Open, each cell adds two lines in
`text-xs text-muted-foreground`: `COMPARE.asOf` and the input's `asOf`, and
`COMPARE.knownOn` and its `knownOn`, either one the em dash when absent.

Tests: `comparison-table.test.tsx` (TC-COMP-114, TC-COMP-127, and the
per-input status, structure, dates disclosure and header cases), rendering
the table with props and mocking nothing.

Open warnings from the story's implementation review v3: the cells take
`px-3 py-2` with no row height token or row rule, not the `data-table` row
tokens UX 1.5 cites (IR-004); and the named `section` is a region landmark
that repeats the table's own name (IR-005).
