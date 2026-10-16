---
artifact_schema_version: 1
artifact_id: CAP-002-ux-design
artifact_type: ux-design
artifact_version: 1
capability_id: CAP-002
title: Universe & Factor Classification
created: 2026-10-16
updated: 2026-10-16
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
design_source: Generated from UX brief
approved_by: Pending review
approval_date: none
design_system: FactorFlow Design System (shadcn/ui + Radix)
theme: design-system/theme.css
ai_provenance:
  agent_id: ux-design-agent
  agent_version: "1.0"
  model: claude-fable-5-1
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-16T05:10:00Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "1"
    - id: CAP-002-ux-brief
      version: "1"
    - id: STD-UI
      version: "4"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: factorflow-design-system
      version: "ported from the first build, 2026-09-05; textarea added 2026-09-05"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# UX Design: Universe & Factor Classification

**Capability:** CAP-002
**Design Source:** Generated from UX brief v1. No Figma frames exist: `design-system/component-map.json` carries a null Figma file key because shadcn/ui publishes no official kit. This is the Path B automated design.
**Approved By:** Pending review
**Approval Date:** none
**Design System:** FactorFlow Design System (shadcn/ui + Radix), 12 component specifications, all read; 10 used, 2 unused with reasons in Section 3
**Theme:** `design-system/theme.css`

This design was produced in an unattended `$design-run` without a human
designer or any visual design tool. It is a best-effort automated design and
should be read before it is decomposed. Every choice the skill would otherwise
have asked the owner about is either fixed by an approved artifact and cited
where it decides something, or recorded as a decision under
`projects/factorflow-v2/decisions/` and marked **PROVISIONAL**. The brief's
four decisions (DEC-0059 to DEC-0062) are honoured, not re-decided. This design
adds one of its own, DEC-0063, on numeric precision, which the brief's Section 9
explicitly permitted it to settle provisionally. Two of the brief's questions
and two of the system design's are carried as `[REQUIRES INPUT]` markers in
Section 7 because no artifact derives an answer.

CAP-002 is the first FactorFlow capability that renders a derived number. The
acceptance criteria that exist because a plausible interface would lie (AC-12,
AC-14, AC-20, AC-22, AC-23) and the STD-UI rules that carry the same
obligations (STD-UI-4, STD-UI-13 to STD-UI-18, STD-UI-23) decide more of the
layout below than any aesthetic consideration does. Where a cell could be read
as a measured value and is not one, the design says so in text, in shape and in
token, and never in colour alone.

## 0. Composition into the Delivered Shell

This section is added to the template structure, as the CAP-001 UX design added
its Section 0, because every screen below composes into a shell CAP-001
delivered and the reader needs the composition stated once rather than
inferred six times. `design-system/intake.md` step 1.3 places compositions in
this document.

**The shell is not amended.** The fixed left rail of `--space-7`, the main
region at `--space-5` padding, the status region pinned to the rail's foot, the
30-second health poll, the `ScreenState` union with its two empty variants, the
unreachable state and the landing rule are CAP-001 behaviour
(`component-design-owner-web-app.md` Sections 2.2 to 2.4) and AGT-SCOPE-002
forbids writing an obligation into them. CAP-002 registers two rail
destinations and five client routes at the composition points the system design
names (Section 4.2, screen registration; Section 8 question 4:
`web/src/app/shell.tsx`, `web/src/app/routes.tsx`).

**Rail order** (DEC-0061, PROVISIONAL): Coverage, Instruments, Runs, Settings,
**Classifications**, **Universes**. The two new destinations are appended after
the four delivered ones, in that order. Compare (`/compare`) and Stock evidence
(`/stocks/:symbol`) are child routes reached from those two destinations and
from each other, never destinations. The landing screen is unchanged.

**Routes**: `/classifications`, `/universes`, `/universes/:universeId`,
`/compare?symbols=AAPL,MSFT`, `/stocks/:symbol`. Every state the owner may
want to return to or link is carried in the URL: the active sort and thresholds
on Classifications and Universe detail, the `as_of` date on Universe detail, the
active tab on Universe detail and Stock evidence, and the compared symbols on
Compare. The `tabs` specification requires the active tab in the URL; the rest
follows the same reason, that a view the owner has built should survive reload.

**The status region carries nothing new.** The classification currency region
(Section 1.2) is a CAP-002 composition placed inside CAP-002's own screens, not
a third line in the shell's status region, which stays reserved for STD-UI-11's
trading-environment indicator as CAP-001 sized it.

**Type, density and spacing** are CAP-001's: `--text-base` as the default,
`--text-sm` for dense table bodies, `--text-xs` for timestamps and table
metadata, `--text-lg` for region headings, `--text-xl` for screen titles. Dense
table regions use `--space-3` internally and stacked regions sit `--space-5`
apart. Every table consumes `--row-height`, which resolves to
`--row-height-comfortable`; this design selects no density tier and inherits,
as CAP-001 did, because OQ-UI-4 records the current default as a port-time
placeholder and STD-UI-29 permits selecting a tier but not introducing a value.
No spacing, size or colour literal appears anywhere in this design.

**Numbers** (DEC-0063, PROVISIONAL). Scores render at two decimals with an
explicit sign (`+1.27`, `−0.45`, `0.00` at the peer mean, unsigned);
percentiles as whole numbers 0 to 100 with no sign and no `%` suffix, because a
percentile is a rank, not a rate (STD-UI-2); ratio inputs at two decimals; rate
inputs as signed percentages at two decimals (`+12.40%`); per-share amounts at
two decimals; monetary amounts in whole currency units with thousands
separators and no abbreviation (STD-UI-6). Every numeric column uses
`--font-numeric`, is right- and decimal-aligned, and fixes its precision per
column (STD-UI-3). No score or percentile carries a polarity colour: `--gain`
and `--loss` are not applied to any CAP-002 value (DEC-0060), so the only
colour job this capability engages is status.

**Three renderings are never confused** (STD-UI-4, STD-UI-14). A measured score
of zero renders `0.00`. An absent score, where an input is missing, outdated or
not computable, renders the em dash marker in `--value-missing` with its status
word and the input named. A not-determinable score, where fewer than 30 stocks
qualified, renders `--pattern-indeterminate` over `--value-indeterminate-muted`
with the label *Not ranked*; it never renders as the absent marker and never as
zero. Blank means only that the column does not apply to the row.

**Dates and timestamps** (STD-UI-5). `classification_date`, `known_on` and
`recorded_on` are ISO-8601 dates. `as_of` on an input is a fiscal period end or
a session date and is never converted. `started_at`, `ended_at`, `recorded_at`,
`created_at`, `retired_at` and `member_since` are timestamps rendered in
America/Chicago with the zone shown, in `--text-xs` inside tables.

## 1. Screens

Six screens, as the brief's Section 1 names them. Classification currency
(1.2) is a composed region placed inside 1.1, 1.4, 1.5 and 1.6, listed as a
screen because it carries its own information architecture and states. Each
screen below records its eight STD-UI-23 states in a States subsection, added
to the template's per-screen structure for the reason CAP-001's design added
it: the brief enumerates the states and the design is where their rendering is
fixed.

### 1.1 Classifications

The screen flow "See stocks classified after an acquisition" lands on, and the
screen that answers the owner's first question: how is every stock I acquire
classified, and where could the product not say.

#### Page Layout

Screen title, then the classification currency region (1.2), then a toolbar,
then one full-width virtualised table that fills the remaining height. No
summary tiles and no chart: the brief's primary information is a per-stock
judgement, and the capability commits to no chart (STD-UI-9, 27 and 28 do not
engage).

The toolbar holds, left to right: the symbol search filter; the scope `select`
(*All classified stocks*, then one option per active universe, labelled
*Scope*); the **Thresholds** control; the active-threshold summary with a
*Clear thresholds* action; and, at the right, **Save as universe**, the
region's one `default` action, present only when at least one threshold is
active and the scope is all stocks, because the API's filter-save carries
thresholds only (system design 4.2, `POST /api/universes` with `filter` and
`set_id`).

**The threshold panel** is the interim composition the brief recorded against
its COMPONENT-SPEC-GAP (Section 3). The Thresholds control is a `button`
`outline` that discloses a panel region below the toolbar, in the position
CAP-001's *Add many* region opens, rather than a popover, because the design
system has no popover component and a disclosed region needs no new primitive.
The panel is one `form` `inline` with three groups headed *Value*, *Growth*,
*Momentum*, each holding four `input` `numeric` fields: *Score at least*,
*Score at most*, *Percentile at least*, *Percentile at most*. Twelve bounds,
the number AC-16 implies (thresholds above or below a chosen score or
percentile, on one or more of three factors). An *Apply* action (`button`
`secondary`, the panel being a sub-region of the toolbar whose primary is Save
as universe) submits them all at once; `Enter` in any field applies, per the
`form` contract. Field validation runs on blur: percentile bounds must lie in 0
to 100 and score bounds must be finite decimals (system design constraint 15),
and a bound outside that range is a field error before any request is made.
Once applied, the panel collapses and the toolbar summarises the active bounds
in text, *Value percentile at least 80, Momentum score above 0.00*, with the
Clear action beside it. The panel re-opens with the active values filled.

**The table.** One row per stock, collapsed, with a selection checkbox as the
first cell and the row expander before the symbol. Columns, left to right:

| Column | Alignment | Notes |
|--------|-----------|-------|
| Symbol | left | A link to `/stocks/:symbol`; sortable (default, ascending) |
| Lifecycle | left | `badge` `secondary` *Retired* on a retired instrument; blank on an active one, because blank means the column does not apply |
| Value score | right | `--font-numeric`, two decimals, explicit sign; sortable |
| Value percentile | right | `--font-numeric`, whole number; sortable |
| Growth score | right | as Value score; sortable |
| Growth percentile | right | as Value percentile; sortable |
| Momentum score | right | as Value score; sortable |
| Momentum percentile | right | as Value percentile; sortable |

The three factors are column pairs of equal standing, in the order the
capability defines them. Default order is by symbol ascending (brief Section
2.1): defaulting to one factor would privilege it over the other two.

**A classified cell** shows the signed score in the score cell and the whole
percentile in the percentile cell. Where the classification is built from
backfilled fundamentals (`restated_possible`, value and growth only), the score
cell also carries `badge` `outline` with an icon and the label *Possibly
restated* (AC-23, STD-UI-17), on every row where it applies and at every
volume, because the mark must propagate to every presentation.

**A not-classified cell** (reason `input_missing`, `input_outdated`,
`input_not_computable` or `retired`) merges the factor's two cells into one
(`colspan` 2, headed by both column headers) and renders, in order: the em dash
marker in `--value-missing`; `badge` `status-warning` *Not classified*, or
`status-neutral` *Retired* for a retired instrument (DEC-0059); and the input
named in product vocabulary, *fundamentals outdated*, *operating cash flow
missing*, *prior-year revenue not positive*. Never a number, never `0.00`. One
status word per factor, so a row that is classified on two factors and not on
one reads as two numbers and one status, not as a row-level failure.

**A not-ranked factor** (`ranked = false`, fewer than 30 qualified) is a
column-pair fact stated once. The pair's header carries `badge` `status-serious`
with the label *Not ranked* and the sentence *18 of 30 stocks qualified*, the
30 being the capability's owner decision of 2026-10-12 and the count the
response's `qualified_count`. Every cell in the pair merges and carries
`--pattern-indeterminate` over `--value-indeterminate-muted` with the text *Not
ranked* in `--value-indeterminate`, so a screen reader hears the count once in
the header and the state in each cell, and a sighted reader sees the hatch
down the column (STD-UI-14, AC-14). The pair's sort controls are removed,
because there is nothing to order.

**Row expansion** reveals, per factor, every input with its status, value,
`as_of` and `known_on` dates and the restatement mark, read once per expansion
from `GET /api/classifications/stocks/{symbol}` because the list response does
not carry input rows and pre-loading them for 3000 rows would defeat the
collapsed default. The expansion ends with a link *Open evidence for AAPL* to
`/stocks/:symbol`. Rows are collapsed by default: at 3000 stocks an expanded
view is unreadable, which is what the `expandable` variant exists for
(STD-UI-30).

**The selection bar** appears above the table when at least one row is
selected and is its own region: *3 selected*, **Compare selected** (`button`
`default`, this region's one primary), *Create universe from selected*
(`button` `secondary`) and *Clear selection* (`button` `ghost`). Selection is
by symbol and survives sort, threshold and scope changes and the set refresh
(DEC-0062).

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Classified-stock table | `data-table` | `expandable`, with row selection | `design-system/components/data-table/design-spec.md` |
| Symbol search | `data-table` toolbar filter | n/a | `design-system/components/data-table/design-spec.md` |
| Scope selector, all stocks or one universe | `select` | `inline` | `design-system/components/select/design-spec.md` |
| Thresholds control | `button` | `outline` | `design-system/components/button/design-spec.md` |
| Threshold panel | `form` | `inline` | `design-system/components/form/design-spec.md` |
| Twelve threshold bounds | `input` | `numeric` | `design-system/components/input/design-spec.md` |
| Apply thresholds | `button` | `secondary` | `design-system/components/button/design-spec.md` |
| Clear thresholds; Clear selection | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Save as universe | `button` | `default` | `design-system/components/button/design-spec.md` |
| Save as universe when the filter matches nothing | `button` | `blocked` | `design-system/components/button/design-spec.md` |
| Save as universe dialog | `dialog` + `form` | `standard` + `dialog` | `design-system/components/dialog/design-spec.md`, `design-system/components/form/design-spec.md` |
| Universe name in the save dialog | `input` | `text` | `design-system/components/input/design-spec.md` |
| Compare selected | `button` | `default` | `design-system/components/button/design-spec.md` |
| Compare selected beyond the bound | `button` | `blocked` | `design-system/components/button/design-spec.md` |
| Create universe from selected | `button` | `secondary` | `design-system/components/button/design-spec.md` |
| Not classified; Retired, in a merged factor cell | `badge` | `status-warning`; `status-neutral` | `design-system/components/badge/design-spec.md` |
| Not ranked, in a column-pair header | `badge` | `status-serious` | `design-system/components/badge/design-spec.md` |
| Possibly restated | `badge` | `outline`, with icon and label | `design-system/components/badge/design-spec.md` |
| Retired instrument marker | `badge` | `secondary` | `design-system/components/badge/design-spec.md` |
| Symbol, opening evidence | link in the first column | n/a | `design-system/components/button/design-spec.md`, which directs navigation to a link |
| Classification currency region | composition, Section 1.2 | n/a | `design-system/intake.md` step 1.3 |

The search is the table's own toolbar filter rather than a standalone `input`,
because the `input` specification directs table filtering to the toolbar. The
threshold fields are `input` `numeric` inside a `form` because no toolbar
numeric-range filter exists; that absence is the gap in Section 3.

#### Interaction Flows

**Reading classifications.** No interaction required for the primary
judgement: the collapsed row carries six numbers, or the status words and
inputs where a factor could not be classified, under the currency region's
date (AC-9, AC-12, AC-21).

**Sorting.** `Enter` or `Space` on a column's sort control cycles ascending,
descending, unsorted, per the `data-table` contract; the order is applied in
SQL over the whole current set, never over a loaded page (system design 3.3
step 15). Rows not classified on the sorted factor sort after every classified
row in both directions, and the column header says so on hover and in its
description, so an absent score never sorts as zero (STD-UI-4). Existing rows
stay visible and dimmed during the refresh; focus does not move; the new row
count is announced politely.

**Applying thresholds.** Apply submits all twelve bounds, the list narrows to
stocks meeting every bound, server-side (AC-16), and the toolbar summary
updates. Rows not classified on a thresholded factor are excluded by the
server, because they have no score to compare; the summary states *stocks not
classified on a thresholded factor are not shown*. No stock matching renders
the nothing-found state with a reset, distinct from never classified (AC-22).

**Searching by symbol.** Prefix match over the whole set, server-side, through
the toolbar filter. `Esc` clears the field.

**Changing scope.** Selecting a universe scopes the list to its current
members (system design 3.3 step 15, `universe_id`) and hides Save as universe.
The scope select always has a value; *All classified stocks* is the explicit
no-filter option, per the `select` contract.

**Saving a filter as a universe** (AC-2, flow "Build a universe from a factor
filter"). Save as universe opens `dialog` `standard` whose title is *Save
filter as universe*, whose description states the match count and the active
bounds and the classification date they were evaluated against, and whose one
field is the universe name. The confirm label is **Save universe**. The request
carries the thresholds and the `set_id` of the set on screen. On `201` the
dialog closes and the interface routes to the new universe's detail, where the
members are visible, so no toast is raised. On `409 universe_name_in_use` the
error attaches to the name field and the dialog stays open. On
`409 classification_set_changed` the dialog stays open with *Could not save
this filter as a universe: classifications changed while you were reviewing
them. Review the new result, then save again.*, the Save action is replaced by
*Review new result*, which closes the dialog onto the already-refreshed table
(DEC-0062). When the filter matches no stock, Save as universe renders
`blocked` beside *No stock meets these thresholds, so there is nothing to
save.* (AC-5); the server's `422 empty_universe` is the backstop.

**Comparing** (AC-16). Compare selected routes to `/compare` with the selected
symbols in the query. Above `MAX_PAGE_SIZE`, 500, the API's bound on the
`symbols` list (system design 4.2), the action renders `blocked` beside *Up to
500 stocks can be compared at once.* Whether a lower cap is wanted is the
owner's (Section 7).

**Creating a universe from a selection** (AC-1). Create universe from selected
opens the create dialog of Section 1.3 with the selected symbols prefilled in
its bulk field.

**Watching a set complete.** Specified in Section 1.2; this table dims, reloads
once under the `data-table` contract, and keeps sort, thresholds, scope,
expanded rows and selection by symbol (DEC-0062, PROVISIONAL).

**Opening evidence.** The symbol link follows to `/stocks/:symbol` on `Enter`;
middle-click opens it in a new tab. The expander's `Open evidence` link does the
same from the expansion.

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton at the expected row count, per the `data-table` contract |
| Empty, never populated | `never_classified: true`: the currency region and the table are replaced by *No stocks have been classified yet. Classifications are produced after an acquisition run ends succeeded or partial.* with a link to Runs (AC-22, STD-UI-23); never an empty table |
| Empty, nothing found | *No stock meets these thresholds.* or *No instrument matches this search.* with a reset; distinct from never classified |
| Partial | Ordinary rendering. Some stocks not classified on some factors, each named inline (AC-12); a set from a `partial` run says so in the currency region |
| Stale | The set is not current (AC-20): the currency region carries the mark and the poll's last-updated time; the table keeps rendering the current set |
| Unavailable | A factor not ranked: header states *Not ranked* with the count, cells carry the indeterminate marker (AC-14, STD-UI-14). Per column pair, never per screen |
| Error | Header, toolbar and currency region stay rendered; the body is replaced by the error and a retry |
| Unreachable | The shell's designed state takes the screen (CAP-001 UX design Section 2) |

#### Token Usage

| Purpose | Token |
|---------|-------|
| Table separators | `--border` |
| Header text | `--muted-foreground` |
| Body text | `--foreground` on `--background` |
| Row hover and selected row | `--muted` |
| Scores, percentiles, dates | `--font-numeric` |
| Dense body text | `--text-sm`; timestamps `--text-xs` |
| Not classified | `--status-warning` on `--status-warning-muted` |
| Retired, as a classification state | `--status-neutral` on `--status-neutral-muted` |
| Not ranked, header badge | `--status-serious` on `--status-serious-muted` |
| Not ranked, cells | `--value-indeterminate` on `--value-indeterminate-muted`, plus `--pattern-indeterminate` |
| Absent score marker | `--value-missing`, rendered as an em dash |
| Possibly restated | `--border` outline, `--foreground` text |
| Retired instrument marker | `--secondary` on `--secondary-foreground` |
| Thresholds and Apply | `--input` border, `--ring` focus; `--secondary` on `--secondary-foreground` |
| Save as universe; Compare selected | `--primary` on `--primary-foreground` |
| Threshold field error | `--destructive` |
| Row height, cell padding | `--row-height`, `--cell-padding-x`, `--cell-padding-y` |
| Region spacing | `--space-3` inside the table region; `--space-5` between regions |

`--gain`, `--loss` and `--neutral-value` are not used: no CAP-002 value is a
return or a change (DEC-0060). The `--factor-*` tokens are not used: factor
identity is carried by the column headers in text, because every stock scores
on all three factors and the `badge` factor variants tag a record as one kind
of stock.

#### Accessibility

Column and row headers are programmatically associated, because a cell's
meaning always depends on both the stock and the factor metric; a merged
not-classified or not-ranked cell is headed by both of its pair's headers. The
not-ranked count lives in the header so a screen reader hears it once, not
3000 times. Every status carries its word and an icon or pattern, so the table
reads in greyscale (STD-UI-8); the sign is in the text (STD-UI-3). Sorting,
filtering, scope change and the set refresh do not move focus; the new row
count and, on refresh, the new classification date are announced politely
(STD-UI-24). The selection checkbox's accessible name is *Select AAPL*, the
expander's *Show inputs for AAPL*, the evidence link's *Open evidence for
AAPL*. Every `blocked` action stays focusable and exposes its reason through
`aria-describedby`. Sort controls and checkboxes are at least 24 by 24 CSS
pixels (`--control-min-target`). Wide tables scroll horizontally inside their
own container, never the page.

### 1.2 Classification currency

A compact region composed into every screen that renders a classification:
Classifications, Universe detail, Compare and Stock evidence. It is the first
thing read on each, because AC-20 and AC-21 make "are these current, and when
were they produced" the precondition of reading anything beneath it.

#### Page Layout

One row of `--text-base` at `--space-3` padding, bounded by `--border`, sitting
between the screen title and the toolbar. Left to right: the headline state
badge; the sentence *Classifications of 2026-10-15, from acquisition run
`run_id` (succeeded)*, where the run id is a link to CAP-001's run detail and
the outcome is `badge` `status-good` *Succeeded* or `status-warning` *Partial*
(CAP-001's mapping, reused because a set built after a partial run carries more
missing inputs); then, when it applies, the second sentence of the state below;
then, right-aligned in `--text-xs`, *Last checked 14:02:10 America/Chicago*
while polling; and a *Set history* control (`button` `ghost`) that discloses
the set list beneath the row.

**Three mutually exclusive headline states**, each tiered by DEC-0059
(PROVISIONAL):

| Condition | Badge | Sentence |
|-----------|-------|----------|
| The current set reflects the latest qualifying run | none, the dated sentence alone | *Classifications of 2026-10-15, from acquisition run … (succeeded)* |
| A later set is `building` | `status-warning` *Not reflecting the latest acquisition* and `status-active` *Updating* | *… A new set has been building since 14:00:41 America/Chicago.* |
| The latest attempt `failed` | `status-warning` *Not reflecting the latest acquisition* and `status-critical` *Classification failed* | *… The attempt for run … failed: <failure_reason as recorded>. The next acquisition run that ends succeeded or partial will try again.* |

A fourth condition, never classified, replaces the table rather than heading
it (Section 1.1 States). There is no progress indicator for a building set: the
engine runs as SQL and reports no per-stock progress (system design 3.1 step
8), so nothing honest could be drawn, and CAP-001's open component-spec gap for
an indeterminate indicator is not reopened here. The building state carries its
start time instead.

**The set history** is a `data-table` `history` disclosed beneath the row:
columns State (`badge` by the tier table), Classification date, Run (link),
Started, Ended, Value qualified, Growth qualified, Momentum qualified, Reason.
Newest first, keyset paged (`GET /api/classifications/sets`). A failed set's
Reason cell carries `failure_reason` as recorded, never a stack trace (system
design 3.1 step 25); a building set's Ended cell is blank, because the column
does not yet apply; a qualified count below 30 renders with `badge`
`status-serious` *Not ranked* beside it.

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Currency region | composition | n/a | `design-system/intake.md` step 1.3 |
| Not reflecting the latest acquisition; Updating; Classification failed | `badge` | `status-warning`; `status-active`; `status-critical` | `design-system/components/badge/design-spec.md` |
| Run outcome the set reflects | `badge` | `status-good` or `status-warning` | `design-system/components/badge/design-spec.md` |
| Run id, opening CAP-001 run detail | link | n/a | `design-system/components/button/design-spec.md`, which directs navigation to a link |
| Set history control | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Set history list | `data-table` | `history` | `design-system/components/data-table/design-spec.md` |
| Set state in the history | `badge` | `status-good` *Complete*, `status-active` *Building*, `status-critical` *Failed* | `design-system/components/badge/design-spec.md` |

#### Interaction Flows

**Polling** (STD-UI-25; system design constraint 18, DEC-0054). The region
polls `GET /api/classifications` every 10 seconds while a later set is
`building` or any acquisition run is non-terminal, and stops otherwise. The
cadence is the owner's 2026-09-05 run-progress cadence, reused. While polling,
*Last checked* shows the time of the last successful poll with its zone. A
poll that fails leaves the displayed set and its mark in place and sets the
region's Error state below; it never clears a mark.

**Completion** (DEC-0062, PROVISIONAL). When a poll reports the building set
`complete`, the region announces politely *Classifications updated to
2026-10-16, from acquisition run …*, the badges clear, and the host screen's
table dims and reloads once under the `data-table` contract with sort,
thresholds, scope, expansion and selection preserved by symbol. The owner takes
no action, because flow "See stocks classified" step 3 says *without any
further action*; the replacement is dated and announced at the point of
display, so STD-UI-16 is satisfied. No further automatic replacement occurs
until another set completes.

**Failure** (AC-20). The previous set stays on every screen, the warning mark
stays, and the critical badge and its two sentences appear. Nothing is offered
to retry, because the scheduler does not retry a failed run (system design 3.1
step 27) and a control that implied otherwise would describe behaviour the
product does not have (STD-UI-2).

**Opening the run.** The run id link follows to CAP-001's run detail for that
`run_id` (`GET /api/acquisition-runs/{id}`, reused unchanged), where the owner
reads which instruments the run left unacquired (AC-21).

**Opening the set history.** The control discloses the list in place and moves
focus to its heading; it collapses on the same control.

#### States

| State | Rendering |
|-------|-----------|
| Loading | The row renders its skeleton at final height so the table beneath does not shift |
| Empty, never populated | Never classified: stated as in Section 1.1, replacing the host table (AC-22) |
| Empty, nothing found | n/a: a set exists or none does |
| Partial | A later set building: *Updating* beside the current set's date |
| Stale | Not current, with the mark and *Last checked*; the state this region exists to show (AC-20) |
| Unavailable | n/a: no check runs here |
| Error | The set read failed: the region keeps the last displayed set and mark, adds *Could not check for newer classifications* with a retry; a `failed` set is not this state but the designed critical rendering above |
| Unreachable | Shell state |

#### Token Usage

`--status-warning`, `--status-active`, `--status-critical`, `--status-good` on
their `-muted` grounds; `--border` for the region boundary; `--muted-foreground`
for *Last checked*; `--font-numeric` and `--text-xs` for dates and times;
history table tokens as in Section 1.1.

#### Accessibility

The region is a polite live region: a new date, a new state or a failure is
announced without stealing focus (STD-UI-24). Each badge carries its word and
an icon. The two warm tiers, `warning` and `serious`, read dark rather than
amber because `design-system/theme-validation.md` darkened them to meet
contrast; the design relies on the words, not the hue. The run link's
accessible name is *Open acquisition run … on the Runs screen*. The disclosure
control carries `aria-expanded`.

### 1.3 Universes

The rail destination at `/universes`: the owner's active universes, retired
ones reachable but separated, and the one write action, creating a universe by
hand.

#### Page Layout

Screen title, toolbar, one table. The toolbar holds the name search filter; the
lifecycle `select` (*Active* default, *Retired*, *All*); the count *`n` active,
`m` retired* in `--muted-foreground`; and **Create universe**, the primary
action.

The table is `data-table` `expandable`. Columns: Name (left, a link to
`/universes/:universeId`, sortable); Lifecycle (`badge` `secondary` *Retired*,
blank for active); Members (right, whole number, `--font-numeric`); Created
(ISO-8601 date). Expanding a row reveals the full `created_at` and `retired_at`
timestamps with zone and the universe's origin line, *Created by hand* or
*Created from a filter on the classifications of 2026-10-15: value percentile
at least 80, momentum score above 0.00*, read once per expansion from the
universe's `created` event (`GET /api/universes/{id}/events`; the events read
is newest first, and reaching the oldest event is the component design's to
fix). Active and retired universes are one table with a lifecycle column, not
two tables, as CAP-001 did for instruments; retirement is a lifecycle, not an
archive (STD-UI-2, AC-6).

**The create dialog** is `dialog` `standard`, title *Create universe*,
carrying a `form` `dialog` with two fields: *Name* (`input` `text`) and
*Stocks* (`textarea` `list`, minimum four rows, placeholder `AAPL, MSFT, NVDA`
or one symbol per line). The textarea parses on paste and on blur, reports *12
symbols recognised, 1 not recognised* as a polite live region, lists each
rejected entry with its reason (*zzzz. not a valid symbol format*), and keeps
the accepted ones. The confirm action **Create universe** renders `blocked`
beside *Enter at least one stock.* until one symbol parses (AC-5), and
`blocked` beside *Up to 1000 stocks can be added in one request.* above
`MAX_SYMBOLS_PER_REQUEST` (system design 4.2). The name field states its
maximum length once that bound is known (Section 7). Cancel is first in DOM
order; initial focus is on the Name field, per the `dialog` contract for
`standard`.

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Universe list | `data-table` | `expandable` | `design-system/components/data-table/design-spec.md` |
| Name search | `data-table` toolbar filter | n/a | `design-system/components/data-table/design-spec.md` |
| Lifecycle filter | `select` | `inline` | `design-system/components/select/design-spec.md` |
| Create universe | `button` | `default` | `design-system/components/button/design-spec.md` |
| Create universe dialog | `dialog` + `form` | `standard` + `dialog` | `design-system/components/dialog/design-spec.md`, `design-system/components/form/design-spec.md` |
| Universe name | `input` | `text` | `design-system/components/input/design-spec.md` |
| Bulk symbol entry | `textarea` | `list` | `design-system/components/textarea/design-spec.md` |
| Create, with no stock or beyond the bound | `button` | `blocked` | `design-system/components/button/design-spec.md` |
| Retired universe marker | `badge` | `secondary` | `design-system/components/badge/design-spec.md` |
| Universe name, opening detail | link in the first column | n/a | `design-system/components/button/design-spec.md`, which directs navigation to a link |

#### Interaction Flows

**Creating by hand** (AC-1, flow "Build a universe by hand"). On confirm the
request posts `{"name", "symbols"}`. On `201` the dialog closes and the
interface routes to the new universe's detail, where the members are visible
with their classifications (flow step 3); no toast is raised, because the
result is on screen. On `409 instrument_not_acquired` the dialog stays open
with the summary error *Could not create the universe: acquisition does not
cover MSFT, TSLA. Add them on the Instruments screen, then try again.* naming
every uncovered symbol, a link to Instruments, and the entered symbols intact
(system design constraint 13, DEC-0057): the whole request is refused and
nothing was created, which differs from CAP-001's per-line parse and is why
the parse step still reports malformed entries individually while the coverage
refusal arrives as one answer. On `409 universe_name_in_use` the error attaches
to the Name field. Symbols normalise to upper case on blur, never while typing.

**Finding a universe.** The toolbar filter matches on name prefix,
server-side. The lifecycle select applies on selection; *Retired* with no
retired universe renders the nothing-found state, not the never-populated one.

**Opening a universe.** The name link follows to detail; middle-click opens a
new tab.

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton |
| Empty, never populated | *No universes yet. Create one by picking stocks, or save a filter on the Classifications screen.* with Create universe beside it and a link to Classifications |
| Empty, nothing found | *No universe matches this search.* or *No retired universes.* with a reset |
| Partial | n/a: a universe is active or retired |
| Stale | Last-updated time in the toolbar; this screen does not poll |
| Unavailable | n/a: no check runs here |
| Error | Header and toolbar kept, body replaced by the error and a retry |
| Unreachable | Shell state |

#### Token Usage

Table tokens as in Section 1.1. `--secondary` on `--secondary-foreground` for
the retired marker; `--muted-foreground` for the retired universe's name and
the count; `--primary` on `--primary-foreground` for Create universe;
`--popover` and `--popover-foreground` for the dialog; `--input` for field
boundaries; `--destructive` for field and summary errors; `--status-warning`
for the textarea's rejected-entry marker; `--text-base` inside the dialog.

#### Accessibility

The dialog is `role="dialog"` with `aria-modal`, focus trapped, returned to
Create universe on close. The textarea's accessible name states what is being
entered, *Stocks to include*, and its counter and rejected list are referenced
by `aria-describedby`. The summary error is an assertive live region (form
contract). The name link's accessible name is the universe name alone, which
is meaningful out of context. The expander's name is *Show details for Tech*.

### 1.4 Universe detail

The child route at `/universes/:universeId`: one universe's members with their
classifications, the actions that maintain it, membership as of a past date,
and its event history.

#### Page Layout

Four stacked regions at `--space-5`: a summary header, the classification
currency region (1.2), a `tabs` `default` list with two tabs, **Members** and
**History**, and the active tab's panel. The active tab is in the URL.

**The summary header** is a `card` `summary`: the universe name as the screen
title, rendered as an inline rename `form` `inline` with one `input` `text`
field and a *Rename* action (`button` `secondary`) that appears on edit;
beneath it a description list of Lifecycle (`badge` `secondary` *Retired* with
`retired_at` when retired; *Active* in text otherwise), Members (whole
number), Created (timestamp with zone), and Origin (the provenance line of
Section 1.3, from the `created` event). The header's actions sit right: **Add
stocks** (`button` `default`, the region's primary) and *Retire universe*
(`button` `secondary`). On a retired universe both actions are absent and the
header states *This universe is retired. Its members and history stay
viewable.*

**A universe saved from a filter is a snapshot, and the header says so.** The
Origin line reads as history, names the thresholds and the classification date
they were evaluated against, and no control re-evaluates it (AC-2,
STD-UI-15). A member whose classification has since changed stays a member.

**The Members panel** is the Section 1.1 composition scoped to this universe:
the same toolbar (symbol search, Thresholds, active-threshold summary, Clear),
without the scope select and without Save as universe, plus an *As of* control
at the toolbar's right: a `form` `inline` with one `input` `text` field
labelled *Members as of* accepting an ISO-8601 date, which the design system's
lack of a date input makes the honest control (CAP-001 UX design Section 7
recorded that absence). The same table, with two differences: a **Member
since** column (timestamp with zone, `--text-xs`) after Lifecycle, and an
in-row action **Remove** (`button` `ghost`, accessible name *Remove AAPL from
Tech*) as the last cell. A retired instrument stays in the table, marked
*Retired*, with every factor cell merged to `status-neutral` *Not classified,
retired* (AC-15); it is neither omitted nor moved. When the table shows a past
date, a line above it reads *Members as of 2026-09-30. Classifications shown
are from the current set.* with a *Show current members* reset.

**The History panel** is a `data-table` `history`: columns Recorded at
(timestamp with zone), Event (*Created*, *Renamed*, *Stock added*, *Stock
removed*, *Retired*, in product vocabulary), Detail (the name or symbol, the
symbol a link to evidence), and, on `created`, `member_added` and
`member_removed` rows, a link *View members as of this event*, which opens the
Members tab with `as_of` set to that event's date. Newest first, keyset paged.
No event is ever missing, because none is deleted (AC-6).

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Summary header | `card` | `summary` | `design-system/components/card/design-spec.md` |
| Inline rename | `form` + `input` | `inline` + `text` | `design-system/components/form/design-spec.md`, `design-system/components/input/design-spec.md` |
| Rename action | `button` | `secondary` | `design-system/components/button/design-spec.md` |
| Lifecycle marker | `badge` | `secondary` for retired | `design-system/components/badge/design-spec.md` |
| Add stocks | `button` | `default` | `design-system/components/button/design-spec.md` |
| Add stocks dialog | `dialog` + `form` + `textarea` | `standard` + `dialog` + `list` | `design-system/components/dialog/design-spec.md`, `design-system/components/form/design-spec.md`, `design-system/components/textarea/design-spec.md` |
| Add, with no stock or beyond the bound | `button` | `blocked` | `design-system/components/button/design-spec.md` |
| Retire universe | `button` | `secondary` | `design-system/components/button/design-spec.md` |
| Retire confirmation | `dialog` | `confirm`, never `destructive` | `design-system/components/dialog/design-spec.md` |
| Members and History | `tabs` | `default`, active tab in the URL | `design-system/components/tabs/design-spec.md` |
| Member table | `data-table` | `expandable`, with row selection; the Section 1.1 composition scoped to the universe | `design-system/components/data-table/design-spec.md` |
| Symbol search; Thresholds panel; selection bar | as Section 1.1 | as Section 1.1 | as Section 1.1 |
| Members as of | `form` + `input` | `inline` + `text` | `design-system/components/form/design-spec.md`, `design-system/components/input/design-spec.md` |
| Remove, in row | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Remove, on the sole member | `button` | `blocked` | `design-system/components/button/design-spec.md` |
| Remove confirmation | `dialog` | `confirm`, never `destructive` | `design-system/components/dialog/design-spec.md` |
| Classification states and marks | `badge` | as Section 1.1 | `design-system/components/badge/design-spec.md` |
| Event history | `data-table` | `history` | `design-system/components/data-table/design-spec.md` |
| View members as of this event; symbol in an event | link | n/a | `design-system/components/button/design-spec.md`, which directs navigation to a link |
| Classification currency region | composition, Section 1.2 | n/a | `design-system/intake.md` step 1.3 |

#### Interaction Flows

**Adding stocks** (AC-4). Add stocks opens `dialog` `standard`, title *Add
stocks to Tech*, with the `textarea` `list` field alone; the confirm **Add
stocks** renders `blocked` until one symbol parses and above 1000 symbols. On
`200` the dialog closes, the added symbols appear in the table with their
classifications, and `already_member` symbols are reported in a polite line
above the table, *MSFT was already a member*, not as an error. On
`409 instrument_not_acquired` the dialog stays open naming every uncovered
symbol with the Instruments link and the entered list intact, as in Section
1.3. On `409 universe_retired` the dialog shows *This universe is retired and
cannot be changed. Its members and history are still viewable.*

**Removing a stock** (AC-4, AC-6; consequential). Remove opens `dialog`
`confirm`, title *Remove AAPL from Tech*, description *Its membership until
today stays in the universe history. Its classifications are not affected.*,
confirm label **Remove from universe**, initial focus on Cancel. It is
`confirm`, never `destructive`: nothing is discarded (STD-UI-2). On `200` the
row leaves the current membership, the History tab gains the event, and focus
returns to the row that now occupies the removed row's position, or to the
table heading if it was last. **On the sole member** the Remove action
renders `blocked` beside *This is the last member. Retire the universe
instead.* with Retire universe adjacent (AC-5, flow "Maintain universes" step
6). The server's `409 last_member` is the backstop: the dialog stays open with
the error and a *Retire universe* action replacing the confirm.

**Renaming** (AC-4; routine). Activating the name opens the inline field with
the current name selected; `Enter` or Rename submits `PATCH`, `Esc` cancels.
On `200` the new name renders and nothing else changes: identity and history
are untouched, which the History tab shows as a *Renamed* event. On
`409 universe_name_in_use` the field error names the conflict; empty after
trimming is a field error. The maximum length is open (Section 7).

**Retiring** (AC-4, AC-6; consequential). Retire universe opens `dialog`
`confirm`, title *Retire Tech*, description *It leaves your active universes.
Its members and history stay viewable.*, confirm label **Retire universe**,
initial focus on Cancel. On `200` the header shows *Retired* with the
timestamp, the actions leave, and the universe leaves the active list. Never
`destructive`.

**Viewing membership as of a date** (AC-6). From an event, *View members as of
this event* opens the Members tab with `as_of` set to that event's
`recorded_on`; membership changes only at events, so this shows the membership
on that date and on every date up to the next event. Typing an ISO-8601 date
in *Members as of* and pressing `Enter` is the second path. A date before
creation renders *Tech did not exist on 2026-01-01. It was created on
2026-10-15.*; a malformed date is a field error stating the ISO-8601 shape
(`422`).

**Sorting, thresholds, search, selection, Compare selected, expansion and
the set refresh** behave as in Section 1.1, scoped to the universe
(`universe_id`). Compare selected routes to `/compare` with the selected
members.

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton on the header, the currency region and the member table at `member_count` rows |
| Empty, never populated | n/a for members: a universe has at least one member (AC-5). n/a for history: a `created` event always exists |
| Empty, nothing found | Members: thresholds or search match no member, with a reset. History: n/a, no filter |
| Partial | Some members not classified on some factors; retired members marked (AC-15) |
| Stale | Classification currency as Section 1.2; a past `as_of` view is labelled with its date |
| Unavailable | A factor not ranked, as Section 1.1 |
| Error | Header retained; the active panel's body replaced by the error and a retry. A `404 universe_not_found` renders *No universe with this address exists.* with a link to Universes |
| Unreachable | Shell state |

#### Token Usage

`--card` and `--card-foreground` for the header, `--border` for its boundary,
`--muted-foreground` for description labels; table and badge tokens as in
Section 1.1; `--primary` on `--primary-foreground` for Add stocks;
`--secondary` on `--secondary-foreground` for Retire and Rename; `--popover`
for dialogs; `--input` and `--ring` for fields; `--destructive` for field
errors; `--foreground`, `--muted-foreground`, `--primary` and `--border` for
the tab list per the `tabs` specification.

#### Accessibility

The universe name is the page's `h1`, and the inline rename field's accessible
name is *Universe name*. Tabs are `tablist`, `tab`, `tabpanel` with the active
tab reflected in the URL and distinguished by weight and underline as well as
colour (tabs contract). Each dialog traps focus and returns it to its trigger;
the remove dialog's confirm is never the initial focus. The Remove action
names its row, *Remove AAPL from Tech*, never a bare *Remove* repeated per
row. The as-of label above the table is a polite live region so a screen
reader learns the table changed date. Header and table semantics as in Section
1.1.

### 1.5 Compare

The child route at `/compare?symbols=…`: chosen stocks side by side with all
three factors and the inputs each was built from (AC-16, flow "Compare stocks
and inspect the evidence" steps 3 and 5).

#### Page Layout

Screen title, the classification currency region (1.2), an entry row, then one
comparison table. The entry row is a `form` `inline` with one `input` `text`
field labelled *Add a stock* and an *Add* action (`button` `secondary`);
`Enter` adds the typed symbol as a new column and appends it to the URL.

**The comparison table is a composition, not a `data-table` variant.** It has
no sorting, no filtering and no pagination, and its records run across rather
than down; the `data-table` specification's own guidance for a static table
with no sorting is a plain table with native semantics, and
`design-system/intake.md` step 1.3 places a screen region built from existing
pieces in this document. It is a native `<table>` with the `data-table` token
set, `--font-numeric` in every value cell, programmatic row and column headers,
and the first column pinned while the rest scroll horizontally inside the
table's own container.

**Columns**: a pinned row-header column, then one column per chosen stock, in
the order chosen. Each stock's column header holds the symbol as a link to
`/stocks/:symbol`, `badge` `secondary` *Retired* where it applies, and a
`button` `ghost` with the accessible name *Remove AAPL from comparison*.

**Rows**, in three row groups headed *Value*, *Growth*, *Momentum* in text
(the `badge` factor variants are not used; every stock scores on all three):

| Group | Rows | Precision (DEC-0063) |
|-------|------|----------------------|
| Value | Score; Percentile; Book-to-price; Earnings yield; Free-cash-flow yield | signed 2 dp; whole number; 2 dp; 2 dp; 2 dp |
| Growth | Score; Percentile; Revenue growth; Earnings-per-share growth | signed 2 dp; whole number; signed % 2 dp; signed % 2 dp |
| Momentum | Score; Percentile; 3-month total return; 6-month total return; 12-month total return | signed 2 dp; whole number; signed % 2 dp, each |

Each row holds one quantity at one precision across every stock, so the
comparison axis is the row (STD-UI-3). Each input row's header carries, on
expansion of the row header (a disclosure in the pinned column), the input's
`as_of` and `known_on` dates per stock beneath the value, so STD-UI-13's date
is one interaction away without doubling the table's height by default.

**A stock not classified on a factor keeps its column.** Its Score and
Percentile cells for that factor merge vertically into one cell carrying the
em dash marker, the `status-warning` *Not classified* (or `status-neutral`
*Retired*) badge and the input named; its input rows still show whatever input
values exist, each with its own status, so the owner sees which one fell
short. A not-ranked factor states *Not ranked, 18 of 30 stocks qualified* once
in its group header and hatches the Score and Percentile cells of every column
(STD-UI-14). The *Possibly restated* mark sits beside the Score where it
applies (AC-23).

**Input values** render in full: a market capitalisation behind a yield is
shown in whole currency units, never abbreviated (STD-UI-6).

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Comparison table | composition on native `<table>` with the `data-table` token set | n/a | `design-system/intake.md` step 1.3; tokens per `design-system/components/data-table/design-spec.md` |
| Add a stock | `form` + `input` | `inline` + `text` | `design-system/components/form/design-spec.md`, `design-system/components/input/design-spec.md` |
| Add | `button` | `secondary` | `design-system/components/button/design-spec.md` |
| Remove from comparison, in a column header | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Symbol, opening evidence | link in the column header | n/a | `design-system/components/button/design-spec.md` |
| Not classified; Retired; Not ranked; Possibly restated | `badge` | `status-warning`; `status-neutral`; `status-serious`; `outline` | `design-system/components/badge/design-spec.md` |
| Retired instrument marker | `badge` | `secondary` | `design-system/components/badge/design-spec.md` |
| Classification currency region | composition, Section 1.2 | n/a | `design-system/intake.md` step 1.3 |

#### Interaction Flows

**Arriving.** From Compare selected on Classifications or Universe detail, the
symbols arrive in the query and the table renders one read of
`GET /api/classifications` with `symbols` for the classifications and one
`GET /api/classifications/stocks/{symbol}` per column for the input rows. The
URL is the state, so the view can be linked and survives reload.

**Adding a stock.** `Enter` or Add appends the symbol; a `404
instrument_not_found` renders the field error *No instrument named XYZ is on
the acquisition list.* and adds no column; a symbol already compared is a field
error naming it. Above `MAX_PAGE_SIZE`, 500, Add renders `blocked` beside *Up to
500 stocks can be compared at once.* The owner's answer on a lower cap is open
(Section 7); until it is given the layout degrades honestly, with columns
beyond the viewport scrolling inside the table while the row headers stay
pinned.

**Removing a stock.** The header's Remove drops the column and updates the URL;
focus moves to the next column's header, or to the entry field if none remains.

**Reading dates.** The disclosure on an input row's header expands that row
across every column to show `as_of` and `known_on` beneath each value; it
collapses on the same control.

**The set refresh** (DEC-0062) reloads the table once, announced by the
currency region, with the chosen symbols kept.

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton with one column per chosen symbol at final width |
| Empty, never populated | No symbol in the URL: *Choose stocks to compare. Select rows on the Classifications screen or a universe, or add a stock here.* with the entry field focused. Never classified: the Section 1.1 statement, with the chosen symbols kept in the URL |
| Empty, nothing found | A typed symbol is not an instrument: named in the field error; no column is added |
| Partial | A stock not classified on a factor shows the status and the input named in that column (flow step 5); a retired stock shows *Not classified, retired* on every factor |
| Stale | Classification currency as Section 1.2 |
| Unavailable | A factor not ranked: stated once in its group header, cells hatched |
| Error | Body replaced by the error and a retry; the chosen symbols stay in the URL and the entry row stays rendered |
| Unreachable | Shell state |

#### Token Usage

Table tokens as in Section 1.1, including `--value-missing`,
`--value-indeterminate` and `--pattern-indeterminate`; the row-group headers
in `--foreground` at `--text-lg`; the pinned column's boundary in `--border`;
`--secondary` for Add; status badges per Section 1.1. No `--factor-*`, `--gain`
or `--loss` token.

#### Accessibility

Row headers (`<th scope="row">`) and column headers (`<th scope="col">`) are
both programmatic, because every cell's meaning depends on the quantity and
the stock; row-group headers are `<th>` spanning the row. The merged
not-classified cell is headed by both the Score and Percentile row headers. The
Remove control names its stock. Horizontal scroll is reachable by keyboard
through the focusable table container. Every status carries its word and an
icon or pattern; the sign is in the text.

### 1.6 Stock evidence

The child route at `/stocks/:symbol`: one stock, its classification per factor
in the current set, every input with its value, status and dates, the
restatement mark, the statement of what the check does not cover, and the
stock's earlier classifications (AC-12, AC-13, AC-17, AC-18, AC-19, AC-23;
flows "Compare stocks" step 4 and "Understand and fix insufficient evidence").

#### Page Layout

Screen title (the symbol, with `badge` `secondary` *Retired* where it
applies), the classification currency region (1.2), then `tabs` `default` with
two tabs, **Current evidence** and **History**, active tab in the URL. The
`tabs` specification's own example, *a stock's factors, fundamentals, and price
history*, is this screen; the brief left tabs against a stacked layout as the
designer's call, and tabs are chosen because history at many sets would push
the current evidence, which is the primary information, below the fold.

**The Current evidence panel** is three `card` `summary` regions, one per
factor, stacked at `--space-5`, each written for the attributes of one entity.
Each card's title is the factor name as a real heading. Its first block is the
result: *Score +1.27, percentile 84* in `--font-numeric` with the *Possibly
restated* mark where it applies; or `badge` `status-warning` *Not classified*
followed by the three-part statement, *Classifying value for AAPL could not use
the latest statement because its period ended 2026-03-31, more than 6 months
before 2026-10-15.* and the recovery, *It will be reconsidered after the next
acquisition run that ends succeeded or partial.*; or, where the provider holds
no such data (flow step 5), *Massive reports no operating cash flow for AAPL,
so value cannot be classified. No action in FactorFlow changes this.* with no
recovery offered, because none exists and STD-UI-19 requires one only where it
exists; or `badge` `status-serious` *Not ranked* with *Only 18 of 30 stocks
qualified on value in this set, so no stock was ranked on it.*; or
`status-neutral` *Retired* with *AAPL is retired from acquisition and is not
classified. Its earlier classifications are in History.*

The card's second block is a description list of the factor's inputs, in the
product's vocabulary (capability Section 2; system design constraint 8), one
row per input, each with: the value at DEC-0063's precision; a status marker
where the input is not `present`; *As of* (the fiscal period end or session
date, unconverted); *Known on* (the `observed_on` date); and a disclosure to
the `detail`, the component periods, sessions and corporate actions behind
the input and, where it is missing, the acquisition outcome that left it so.
Input status renders as follows, under DEC-0059's tier for the classification
state these reasons produce: `present`, the value alone; `missing`, the em
dash marker and `badge` `coverage-absent` *Missing* (STD-UI-14 absent, as
CAP-001 renders an absent data type); `outdated`, the value with `badge`
`status-warning` *Outdated*; `not_computable`, the value or marker with
`badge` `status-warning` *Not computable*. The *Possibly restated* mark sits on
each fundamental input that was backfilled (`restated_possible`).

Below the three cards, once per screen, the STD-UI-18 statement in
`--muted-foreground`: *This evidence judges whether each input is present and
current. It does not judge whether the provider's values are correct.* And,
wherever the restatement mark appears on the screen, its one-sentence meaning
beside the first occurrence: *Possibly reflects restated data: the fundamentals
behind this classification were acquired for a period already reported before
acquisition of this stock began.* (STD-UI-17).

**The History panel** is a `data-table` `history` of the stock's
classifications in earlier sets, newest first: Classification date, Run
(link), then the six score and percentile columns of Section 1.1 with the same
cell treatments, the *Possibly restated* mark where it applied. Each row is
one set's complete result for the stock, as recorded; a backfill observed
later never alters an earlier row (AC-19), and the panel says so once above
the table: *Each row is what was known when that set was produced. Later data
does not change it.*

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Current evidence and History | `tabs` | `default`, active tab in the URL | `design-system/components/tabs/design-spec.md` |
| Per-factor evidence group | `card` | `summary` | `design-system/components/card/design-spec.md` |
| Not classified; Not ranked; Retired, as the factor result | `badge` | `status-warning`; `status-serious`; `status-neutral` | `design-system/components/badge/design-spec.md` |
| Input missing | `badge` | `coverage-absent` | `design-system/components/badge/design-spec.md` |
| Input outdated; input not computable | `badge` | `status-warning` | `design-system/components/badge/design-spec.md` |
| Possibly restated | `badge` | `outline`, with icon and label | `design-system/components/badge/design-spec.md` |
| Retired instrument marker | `badge` | `secondary` | `design-system/components/badge/design-spec.md` |
| Input detail disclosure | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Classification history | `data-table` | `history` | `design-system/components/data-table/design-spec.md` |
| Run id, opening CAP-001 run detail | link | n/a | `design-system/components/button/design-spec.md` |
| Classification currency region | composition, Section 1.2 | n/a | `design-system/intake.md` step 1.3 |

#### Interaction Flows

**Reading the evidence** (AC-17). No interaction is required for the primary
judgement: each card's first block states whether the stock is classified on
that factor and, if not, which input fell short and what made it so (flow
"Understand and fix" step 2). Values and dates are in the list beneath;
component periods and the acquisition outcome are one disclosure away
(STD-UI-13 satisfied inline for the input, one interaction away for its
components).

**Fixing insufficient evidence** (flow steps 3 to 5). Where the recovery is
another acquisition, the statement names it and links to Runs. After the next
qualifying run the currency region announces the new set and the panel reloads
once (DEC-0062); the earlier *Not classified* result remains in History (AC-18).
Where the provider holds no such data, the statement says so and offers
nothing.

**Reading history** (AC-18). The History tab loads on first activation and
stays mounted; the run link opens CAP-001's run detail. Paging follows the
`data-table` contract with keyset cursors.

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton matching the three cards' final layout, so the page does not resize |
| Empty, never populated | `set: null`: *AAPL has not been classified because no classifications exist yet. Classifications are produced after an acquisition run ends succeeded or partial.* with a link to Runs (AC-22). History: *No earlier classifications exist for AAPL.*, stated, distinct from never classified |
| Empty, nothing found | n/a: no filter on either panel |
| Partial | Some factors classified, some not; each not-classified factor names its input (AC-12) |
| Stale | Classification currency as Section 1.2 |
| Unavailable | A factor not ranked: stated in that factor's card with the count |
| Error | Title and currency region retained; the active panel replaced by the error and a retry. `404 instrument_not_found`: *No instrument named XYZ is on the acquisition list.* with a link to Instruments |
| Unreachable | Shell state |

#### Token Usage

`--card` and `--card-foreground` for each factor card, `--border` for its
boundary, `--muted-foreground` for list labels, the STD-UI-18 statement and
the restatement explanation; `--font-numeric` for every value and date;
`--status-warning`, `--status-serious`, `--status-neutral` on their `-muted`
grounds; `--value-missing` on `--value-missing-muted` for a missing input;
`--value-indeterminate` with `--pattern-indeterminate` for a not-ranked factor's
score block; tab tokens per the `tabs` specification; history table tokens as
in Section 1.1.

#### Accessibility

Each card title is a real heading (`h2`) under the symbol's `h1`, so the page
outline reads Symbol, Value, Growth, Momentum. The description lists are
`<dl>` with the input name as `<dt>`. Every status badge carries its word and
an icon; a missing input is distinguishable from a measured zero and from a
not-ranked factor in greyscale. The detail disclosure carries `aria-expanded`
and names its input, *Show how book-to-price was computed*. Tabs follow the
`tabs` contract; the History table has programmatic headers.

## 2. Cross-Screen Navigation

Two destinations appended to the rail, two child routes, and the flows that
cross them. Every navigation is a link, never a button, so middle-click and
open-in-new-tab work (button specification).

**After an acquisition** (flow "See stocks classified"). The owner opens
Classifications from the rail. If a set is building, the currency region says
so and the screen refreshes once when it completes (DEC-0062). The run link in
the currency region crosses into CAP-001's run detail; nothing crosses back
except the rail.

**Classifications to Compare and back.** Select rows, Compare selected, and
`/compare` opens with the symbols in the query. The browser's back returns to
Classifications with its sort, thresholds and scope restored from the URL.
Compare's column-header symbol links open evidence.

**Classifications to Universes.** Save as universe and Create universe from
selected both end on the new universe's detail. Universe detail's scope is
also reachable from Classifications' scope select, which routes nowhere but
scopes in place; the two paths exist because one reads a universe among all
stocks and the other maintains it.

**Universe detail to evidence and Compare.** Symbol links open evidence; the
selection bar's Compare selected opens Compare with the selected members. The
History tab's *View members as of this event* stays on the screen and switches
tab with `as_of` set.

**Evidence to Runs.** The currency region's run link and every recovery
statement that names the next acquisition link to CAP-001's Runs or run
detail, because the owner's fix for insufficient evidence is an acquisition
(flow "Understand and fix" step 3), which CAP-002 never starts itself
(capability Section 5.2).

**Refusals that name another screen.** `409 instrument_not_acquired` links to
Instruments, where the owner adds the stock (flow "Build a universe by hand"
step 4); `never_classified` links to Runs. CAP-002 never edits the acquisition
list and never starts a run.

**Unreachable.** When `GET /api/health` does not answer, the shell's designed
state takes every CAP-002 route exactly as it takes CAP-001's, with the rail
still rendered. CAP-002 adds nothing to it (AGT-SCOPE-002).

## 3. Component-Spec Gaps

| UI Element | Source Reference | Suggested Slug | Intake Reference |
|------------|-----------------|----------------|------------------|
| Numeric threshold filter in the `data-table` toolbar: twelve score and percentile bounds across three factors, applied at once (AC-16) | UX brief v1 Section 4, COMPONENT-SPEC-GAP; this design Section 1.1 threshold panel | `data-table`, a new row in its Anatomy or Variants table rather than a new component, per `design-system/intake.md` step 1.2 | `design-system/intake.md` |

**One gap, carried from the brief, not re-decided.** The `data-table` anatomy
names a filter input, faceted filters and a column visibility control; none is
a numeric range, and the `input` and `form` specifications both direct table
filtering to the toolbar rather than to themselves. This design specifies the
interim composition the brief proposed, `input` `numeric` fields in a `form`
`inline` disclosed from a toolbar control (Section 1.1), so the screen is
buildable now; the resolving edit to the design system is a human one the UX
skills may not make. When the toolbar row exists, Section 1.1's panel maps to
it and nothing else in this design changes.

**Two components are deliberately unused**, recorded so a reviewer does not
look for them:

- `chart`: the capability commits to no chart, the system design Section 4.3
  records `lightweight-charts` as unused, and STD-UI-9, 27 and 28 are
  recorded as not applicable. A later design that adds one engages all three.
- `toast`: the brief's Section 4 suggested `toast` for a universe created, a
  member added or removed, or a set completed while the owner is on another
  screen. This design uses none of those, and records the disagreement here as
  AGT-AUTH-003 requires. The `toast` specification forbids a toast for a result
  already visible on screen: creating a universe routes to its detail, adding
  and removing members change the table in view, and a set that completes is
  announced by the currency region on every classification-bearing screen. No
  CAP-002 screen without a currency region polls, so no completion can arrive
  while the owner is on one. If a later capability gives the shell a product-wide
  classification poll, a `toast` `info` on completion becomes the right
  component; nothing in this capability needs it.

**The STD-UI-30 virtualisation gap persists**, inherited from CAP-001's brief,
UX design and component design: the `data-table` specification offers pagination
and not virtualisation, so the component does not discharge the rule alone. This
design requires the classified-stock list and the member list to be virtualised
over keyset pages at `DEFAULT_PAGE_SIZE` 50 and `MAX_PAGE_SIZE` 500 (system
design 3.3 step 15), as CAP-001's component design implemented windowed
rendering; the conformance record stays partial until the specification and the
rule are reconciled by a human edit.

## 4. EDG Compliance

STD-UI Section 1.2 makes the standard normative and `edg-compliance` advisory
beneath it; the three departures STD-UI declares (six tiers reconciled to three
levels, the kill switch without confirmation, screen-reader certification
exempt as a gate) and the error-code exemption of its Section 2.3 are intended
and are not re-raised here.

| Check | Status | Notes |
|-------|--------|-------|
| Consistency with product patterns | pass | Every pattern is CAP-001's or STD-UI's: the shell, rail and unreachable state untouched; two destinations appended without reordering (DEC-0061); `blocked` not disabled; `confirm` not `destructive`; single and bulk symbol entry; link not row click for navigation; server-side sort and filter with rows dimmed on refresh; polled regions announce politely and show their last-updated time. Vocabulary is STD-UI-1's plus the four terms the capability adds (score, percentile, peer set, not classified); inputs are named in product terms, never by payload key |
| Progressive disclosure | pass | The collapsed classification row answers the primary question with six numbers or status words; input dates and reasons are one expansion away and the full evidence one link away. A not-ranked factor is stated once in its header. Twelve threshold bounds sit behind one toolbar control. Compare shows scores first and dates behind a row disclosure. Evidence shows the result first, inputs beneath, component periods behind a disclosure, and history on a second tab |
| Error clarity | pass | Every refusal names the operation, the stock or universe and the reason, and offers the recovery where one exists and says when none does (Sections 1.1 to 1.6, STD-UI-19). The error envelope's `code` selects the wording and `message` is never shown raw; no payload key, exception or status code reaches the owner (STD-UI-1) |
| Accessibility | pass | WCAG 2.1 AA per STD-UI-24, specified per screen: programmatic row and column headers wherever a cell's meaning depends on both, merged cells headed by both headers, polite announcement of every polled or refreshed change, focus managed on dialogs and disclosures, accessible names that identify the row, `blocked` controls that stay focusable, every status in text plus icon or pattern, no colour encoding polarity (DEC-0060). Enforcement is human review, which the standard and tech stack acknowledge |
| States and feedback (empty, loading, error, success, partial) | pass | All five, plus stale, unavailable and unreachable (STD-UI-23), enumerated per screen with inapplicable ones recorded with a reason. Never-classified and nothing-found are distinct everywhere both can occur (AC-22); stale is the marked not-current set (AC-20); unavailable is the not-ranked factor (AC-14); success is visible on screen for every write, which is why no toast is used |

## 5. Traceability

| AC ID | Capability AC | UX Design Element | Component + Variant |
|-------|---------------|-------------------|-------------------------|
| AC-1 | Universe by hand; no uncovered stock | 1.3 create dialog with bulk entry; `409 instrument_not_acquired` refusing the whole request with every symbol named and an Instruments link; 1.1 Create universe from selected | `dialog` `standard` + `form` `dialog` + `input` `text` + `textarea` `list`; `button` `blocked` |
| AC-2 | Universe from a filter, membership fixed | 1.1 Save as universe carrying thresholds and `set_id`; `409 classification_set_changed` handling; 1.3 and 1.4 origin line read as history, no re-evaluation | `dialog` `standard` + `form` `dialog`; `card` `summary` |
| AC-3 | Several universes; a stock in many | 1.3 list of universes; 1.1 scope select listing every active universe; no exclusivity anywhere | `data-table` `expandable`; `select` `inline` |
| AC-4 | Add, remove, rename, retire; rename keeps history | 1.4 Add stocks, Remove, inline rename, Retire; the Renamed event in History | `button` `default` / `ghost` / `secondary`; `dialog` `standard` / `confirm`; `form` `inline` + `input` `text`; `data-table` `history` |
| AC-5 | No empty universe; last member not removable | 1.3 Create `blocked` until one symbol; 1.1 Save as universe `blocked` on zero matches; 1.4 Remove `blocked` on the sole member with Retire adjacent; `409 last_member` backstop | `button` `blocked` |
| AC-6 | Membership history; members on any past date | 1.4 History tab, *View members as of this event*, *Members as of* date entry, as-of label; removal and retirement worded as keeping history | `data-table` `history`; `form` `inline` + `input` `text`; `dialog` `confirm` |
| AC-7 | Factor definitions | 1.5 and 1.6 name exactly the defined inputs per factor in the product vocabulary | composition; `card` `summary` |
| AC-8 | One peer set | 1.1 and 1.4 render the same per-stock classification whether scoped or not; the scope select changes which rows, never their values | `data-table` `expandable`; `select` `inline` |
| AC-9 | Score and percentile | 1.1 score and percentile column pairs; DEC-0063 precision; explicit sign | `data-table` `expandable` |
| AC-10 | Automatic refresh; never after failed, cancelled, abandoned | 1.2 polls and refreshes once on completion without owner action (DEC-0062); the run outcome shown is only `succeeded` or `partial` | composition; `badge` `status-good` / `status-warning` |
| AC-11 | Up to date within 5 minutes for 3000 stocks | 1.1 virtualised table over keyset pages; 1.2 10-second poll while building so completion is seen within the budget | `data-table` `expandable` |
| AC-12 | Like for like only; missing or outdated input named | 1.1 merged not-classified cell with the input named; 1.5 column kept with status and input; 1.6 three-part statement per factor | `badge` `status-warning`; `--value-missing` marker |
| AC-13 | Outdated inputs | 1.6 statement naming the 6-month rule against the classification date, or the latest-trading-day rule, with the input's `as_of` | `badge` `status-warning` *Outdated*; `card` `summary` |
| AC-14 | Enough stocks to rank | 1.1 header badge with the qualified count, cells hatched; 1.5 group header; 1.6 card statement | `badge` `status-serious`; `--pattern-indeterminate` |
| AC-15 | Retired stocks | 1.1 and 1.4 retired marker and `status-neutral` *Not classified, retired* on every factor; member kept in its universe; 1.6 retired statement with History | `badge` `secondary`; `badge` `status-neutral` |
| AC-16 | Sort, filter, side by side; all stocks or one universe | 1.1 sortable factor columns, threshold panel, scope select, selection bar; 1.4 same composition scoped; 1.5 Compare | `data-table` `expandable`; `form` `inline` + `input` `numeric`; `select` `inline`; `button` `default`; composition |
| AC-17 | Evidence behind a result | 1.6 per-input value, status, `as_of`, `known_on`, detail disclosure; 1.1 expansion; 1.5 date disclosure | `card` `summary`; `data-table` `expandable`; composition |
| AC-18 | Classification history, never overwritten | 1.6 History tab, newest first, each row one set's result; 1.4 retired-stock statement pointing to it | `tabs` `default`; `data-table` `history` |
| AC-19 | No backdating | 1.6 History statement that later data does not change a row; `known_on` shown per input; 1.2 set dated by production | `data-table` `history`; `card` `summary` |
| AC-20 | Previous set while not current; failure shown | 1.2 three headline states, the previous set kept with its mark, failure tiered critical with reason and the next-run sentence | `badge` `status-warning` / `status-active` / `status-critical` |
| AC-21 | Classification currency | 1.2 dated sentence with the run link and outcome; set history | composition; link; `data-table` `history` |
| AC-22 | Honest empty state | 1.1 and 1.6 never-classified statements replacing the table, with a Runs link; distinct from nothing-found on every screen | `data-table` empty state; composition |
| AC-23 | Restatement mark | 1.1, 1.4, 1.5 and 1.6 *Possibly restated* on every presentation of an affected value or growth classification and on each backfilled input; retained in 1.6 History; its meaning stated once per screen | `badge` `outline` |

**Classification state tier mapping** (DEC-0059, PROVISIONAL), reproduced from
the brief's Section 12.2 because this design is where it is rendered:

| Classification state | Tier | `badge` variant | Rendered in |
|----------------------|------|-----------------|-------------|
| `classified` | good, where a status word is rendered at all | none in tables; the value is the rendering | 1.1, 1.4, 1.5, 1.6 |
| `not classified` (input missing, outdated or not computable) | warning, never critical | `status-warning` | merged factor cells in 1.1, 1.4, 1.5; result block in 1.6 |
| `not enough stocks to rank` | serious | `status-serious` in the header, with the indeterminate marker in cells (STD-UI-14) | 1.1, 1.4 headers; 1.5 group header; 1.6 result block; 1.2 set history |
| `retired` | neutral, never a fault | `status-neutral` | merged factor cells in 1.1, 1.4, 1.5; result block in 1.6 |
| `updating` | active | `status-active` | 1.2 |
| `not reflecting the latest acquisition` | warning | `status-warning` | 1.2 |
| `classification failed` | critical | `status-critical` | 1.2 |

Per-input statuses on 1.6 (`missing`, `outdated`, `not_computable`) are the
reasons behind a warning-tier classification state and render under that tier,
with `missing` taking STD-UI-14's absent treatment. Set states in the 1.2
history (`complete` good, `building` active, `failed` critical) follow the same
tiers as the headline states they produce.

## 6. Source Mapping

| Source | Reference | Verification Method | Date |
|--------|-----------|---------------------|------|
| UX brief v1 | `docs/capabilities/CAP-002-universe-and-factor-classification/design/ux-brief.md` | Text reference. Six screens, information architecture, 25 interactions with tiers and errors, suggested components, constraints, accessibility, conformance record, tier table and eight-state table read in full and honoured | 2026-10-16 |
| Capability CAP-002 v1 | `docs/capabilities/CAP-002-universe-and-factor-classification/Capability-CAP-002.md` | Text reference. All 23 acceptance criteria traced in Section 5; six flows walked in Sections 1 and 2; Section 5.4 conformance mirrored | 2026-10-16 |
| System design v1 | `docs/capabilities/CAP-002-universe-and-factor-classification/design/system-design.md` | Text reference. Thirteen JSON operations and two reused, response shapes, error codes, bounds, poll cadence, screen registration, abstentions in Section 8 | 2026-10-16 |
| STD-UI v4 | `docs/constitution/standards/ui-conventions.md` | Text reference. Approved 2026-09-05; all 30 rules read, those governing this design cited where they decide something | 2026-10-16 |
| CAP-001 UX design v5 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-design.md` | Text reference. Shell, type, density, spacing, Add and Add many, `confirm` not `destructive`, `blocked` not disabled, link not row click, unreachable state, no date input | 2026-10-16 |
| CAP-001 component design: owner web app v4 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/component-design-owner-web-app.md` | Text reference. Composition points `shell.tsx` and `routes.tsx`, `ScreenState` union, windowed rendering over keyset pages, desktop only, horizontal scroll in container | 2026-10-16 |
| Component specifications | `design-system/components/` | Text reference. All 12 read; 10 used, `chart` and `toast` unused with reasons in Section 3; every variant named exists in its specification | 2026-10-16 |
| Theme tokens | `design-system/theme.css` | Text reference. Every token named in this design verified to exist; no literal introduced | 2026-10-16 |
| Component map and intake | `design-system/component-map.json`, `design-system/intake.md` | Text reference. Null Figma file key and empty map, so no frame to cite; intake steps 1.2 and 1.3 applied to the gap and the compositions | 2026-10-16 |
| Decision records | `projects/factorflow-v2/decisions/DEC-0054.md`, `DEC-0057.md`, `DEC-0059.md` to `DEC-0063.md` (harness repository) | Text reference. Poll cadence and universe semantics from the system design; tier mapping, no polarity colour, rail placement and refresh-once from the brief; numeric precision recorded by this design | 2026-10-16 |

No Figma frame, image or diagram was used. This is the Path B automated design.

## 7. Open Questions

Decisions this design rests on are not listed here; they are DEC-0059 to
DEC-0063 and are cited where they apply. The owner upholds or reverts each with
`scripts/sdd decisions`. What follows is what no artifact derives, and one
disagreement with the brief recorded for the reviewer.

- **Is there a maximum number of stocks in the side-by-side view?** The
  capability says *a few chosen stocks* (flow "Compare stocks" step 3, AC-16)
  and the API bounds the `symbols` list at `MAX_PAGE_SIZE`, 500 (system design
  4.2). No artifact gives a smaller number. `[REQUIRES INPUT: maximum number of
  stocks compared side by side, or confirmation that the API bound is the only
  one]`. *Owner: capability owner. Blocks: nothing; Section 1.5 proceeds with no
  cap below 500, horizontal scroll inside the table and pinned row headers, and
  the `blocked` reason changes to the cap if one is given.* **Abstained in this
  run, carried from the brief's Section 9.**
- **What is the maximum length of a universe name?** SEC-INP-001 requires a
  bound and no artifact states one. `[REQUIRES INPUT: maximum universe name
  length in characters]`. *Owner: capability owner. Blocks: the name field's
  stated bound in Sections 1.1, 1.3 and 1.4 and the API constant; nothing else.*
  **Abstained in this run, carried from the system design's Section 8 question
  2 through the brief.**
- **Which Massive statement payload keys supply each factor input?** Carried
  from the system design's Section 8 question 1. It bears on this design only
  in vocabulary: every input is named in product terms (Section 1.6) whatever
  key supplies it, so no layout here changes with the answer. **Abstained in the
  system design; not a UX question.**
- **Numeric precision is decided provisionally, not asked.** The brief's
  Section 9 abstained on decimals for scores and percentiles and permitted this
  design to proceed on a PROVISIONAL value. DEC-0063 fixes every CAP-002
  numeric column (Section 0). The owner may override it with a presentation
  change alone, because sort and thresholds run on stored values.
- **Which density tier is the default?** Carried from CAP-001 and STD-UI's
  OQ-UI-4. This design inherits, as CAP-001 did.
- **`toast` is not used, against the brief's suggestion.** Recorded in Section
  3 with the reason: every suggested use reports a result already visible, which
  the `toast` specification forbids. A reviewer who prefers the brief's reading
  should treat this as the disagreement AGT-AUTH-003 requires to be flagged, not
  as an omission.
- **The threshold panel is an interim composition** against the one
  COMPONENT-SPEC-GAP (Section 3). When the design system gains a numeric
  toolbar filter, Section 1.1 maps to it; the twelve bounds, their validation
  and the summary line are unchanged.
- **Reaching a universe's `created` event for the origin line** (Sections 1.3
  and 1.4) uses the events read, which is newest first. How the fetch layer
  reaches the oldest event efficiently is the component design's; no API change
  is proposed here.

This design was generated without any human designer or visual design tool. It
should be reviewed before decomposition.
