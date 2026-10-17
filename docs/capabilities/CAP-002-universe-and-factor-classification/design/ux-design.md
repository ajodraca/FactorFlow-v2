---
artifact_schema_version: 1
artifact_id: CAP-002-ux-design
artifact_type: ux-design
artifact_version: 3
capability_id: CAP-002
title: Universe & Factor Classification
created: 2026-10-16
updated: 2026-10-17
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
design_source: Generated from UX brief, starting from PRODUCT-UX-S03
approved_by: Pending review
approval_date: none
design_system: FactorFlow Design System (shadcn/ui + Radix)
theme: design-system/theme.css
ai_provenance:
  agent_id: ux-design-agent
  agent_version: "1.2"
  model: claude-fable-5-1
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T02:40:00Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "3"
    - id: CAP-002-ux-brief
      version: "3"
    - id: CAP-002-specification-review
      version: "2"
    - id: PRODUCT-UX
      version: "6, approved 2026-10-16"
    - id: PRODUCT-UX-S03
      version: "4, approved 2026-10-16"
    - id: PRODUCT-UX-S01
      version: "4, approved 2026-10-16"
    - id: PRODUCT-UX-S09
      version: "4, approved 2026-10-16"
    - id: STD-UI
      version: "6"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: factorflow-design-system
      version: "as of 2026-10-15"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# UX Design: Universe & Factor Classification

**Capability:** CAP-002
**Design Source:** Generated from UX brief v3, starting from the approved Research screen specification `docs/ux/screens/S03-research.md` (`PRODUCT-UX-S03` v4) as the blueprint's §0 requires. No Figma frames exist: `design-system/component-map.json` carries a null Figma file key because shadcn/ui publishes no official kit. The canvas source for S03 is `docs/ux/design-source/P03-Research.dc.html`; where it and the specification disagree, the specification wins (S03 §11). This is the Path B automated design.
**Approved By:** Pending review
**Approval Date:** none
**Design System:** FactorFlow Design System (shadcn/ui + Radix), 18 component specifications as of 2026-10-15, all read; 12 used, 6 unused with reasons in Section 3
**Theme:** `design-system/theme.css`

This design was produced in an unattended `$design-run` without a human
designer or any visual design tool. It is a best-effort automated design and
should be read before it is decomposed. Every choice the skill would otherwise
have asked the owner about is either fixed by an approved artifact and cited
where it decides something, or recorded as a decision under
`projects/factorflow-v2/decisions/` and marked **PROVISIONAL**.

**Version 2 (2026-10-16)** aligns this design with the product UX blueprint
(`PRODUCT-UX` v6) and its Research screen specification (`PRODUCT-UX-S03` v4),
both approved on 2026-10-16 after version 1 was written, with STD-UI v6, and
with the system design v2 and UX brief v2 refined for the same reason.
Following `docs/ux/README.md` and the skill's Configuration, this design
**starts from S03 and delivers the regions it assigns to M1 CAP-002, verbatim
where the specification fixes them**; it implements on top of S03 what the
brief's §2 adds or specializes (DEC-0072 to DEC-0076), and it restyles the
three other CAP-002 pages into the blueprint's shell under `/research/*`
(blueprint §2.2, §2.3; DEC-0068). Every departure from S03 or the blueprint is
recorded with its reason, never redesigned. Version 1's Classifications screen
and its Classification currency region are folded into S03's Results pane,
banner and as-of line; its two rail destinations and five routes are withdrawn
(DEC-0061 and the route list of DEC-0064 superseded by DEC-0068, DEC-0069).
The brief's decisions are honoured, not re-decided. This version adds two of
its own, DEC-0077 and DEC-0078, for renderings and control placements that S03,
the blueprint and the brief leave open; DEC-0063 (numeric precision) stands.

**Version 3 (2026-10-17)** is the consistency pass the owner directed on
specification review v2
(`docs/capabilities/CAP-002-universe-and-factor-classification/specifications-review-report-v2.md`)
and applies four of its findings to this design, each exactly as the system
design v3 and the UX brief v3 (both pinned here) resolved it: FINDING-5 (the
*Find a stock* prefix travels in the saved filter with the twelve bounds and
`hide_incomplete`, the save dialog names the search, and the saved members are
exactly the stocks the results header counts; Sections 1.1, 1.3, 1.4, 5),
FINDING-6 (a threshold excludes only stocks classified on that factor that
fail the bound; a stock incomplete on that factor stays listed as *Incomplete*
unless *Hide stocks with an incomplete score* is on, so S03-1 is satisfied
without exception; Sections 1.1, 4, 5; DEC-0081), FINDING-7 (one `set` plus
`later` shape before and after the first set, polling from first load, and
*Updating* or *Score update failed* in the never-populated state; Sections
1.1, 1.2, 1.6, 5; DEC-0082) and FINDING-8 (a download is named by its start
time in America/Chicago, the time being the link to the run detail, never by a
number and never by the raw `run_id`; S03 §3's *#{n}* is a recorded departure;
Sections 0, 1.1, 1.2, 1.6, 2, 4, 5, 7; DEC-0083). The records are the system
design v3's and are cited, not re-decided: DEC-0081 follows from the approved
S03 and supersedes the threshold-exclusion statements of DEC-0071 and
DEC-0076; DEC-0082 and DEC-0083 (superseding DEC-0079 (e)) are
**PROVISIONAL**; DEC-0084 (the delivered files CAP-002 edits) was read and
bears on Section 0's citation only. This version records no decision of its
own. Review v2's other findings on this design (FINDING-9, 11, 25, 26, 32)
and elsewhere are carried, not fixed, here; nothing else changes.

**Vocabulary in this document.** As STD-UI-1 v6 and blueprint §7 require, every
string the owner reads uses the display labels: *stock*, *followed stock*,
*stop following* and *Not followed*, *download*, *Complete* and *Partial*,
*Incomplete*, *Not enough to rank*, and a factor's *score* shown as a
*percentile* and a *standardised score* (never shortened to *score*). This
document, being an SDD document, keeps the domain terms when it names API
fields, view-model fields, acceptance criteria and persistence (`instrument`,
`acquisition_run`, `not_classified`, `classification`), and writes every
user-visible string in italics with its display label (DEC-0072).

## 0. Composition into the Delivered Shell

This section is kept from version 1, as the CAP-001 UX design added its
Section 0, because every screen below composes into a shell another capability
owns and the reader needs the composition stated once. `design-system/intake.md`
step 1.3 places compositions in this document. The blueprint's §12 D-8
(decided 2026-10-16) gives the shell to a new M1 capability, *App shell & data
health*, which is not yet defined, so this section says two things: where
CAP-002's screens sit in the blueprint's shell, and how they are reached until
that shell exists.

**Into the blueprint's shell (blueprint §3).** CAP-002's five routes sit in the
Research area of the §2.1 rail: one destination, **Research** at `/research`,
in the primary group after Home. The page ground is `hsl(var(--muted) / 0.5)`
over `--background` (the STD-UI-29 A-5 alpha, not a new token); every region
below is content on a `card` on `--background`. The top bar carries the page
title or breadcrumb at `--text-base` weight 600 (*Research*; *Research ›
Universes › Tech*; *Research › AAPL*; *Research › Compare*), the command button,
the environment region and the kill switch, none of which CAP-002 renders or
edits (the region and the switch arrive in M2, blueprint §10). The main region
has `--space-5` padding; the Research screen, the universe tables and the
comparison use the full width (blueprint §3.1: tables and boards use the full
width; S03 is a three-pane table screen), and the stock evidence page, a reading
screen, caps at 1180 px. Between 1024 and 1279 px the Research inspector moves
below the list (§3.1, §4.5); below 768 px the rail stacks above the content and
nothing is unreachable. Score-set state (*Updating*, *Not reflecting the latest
download*, *Score update failed*) is shown where scores are shown, never in the
shell (§3.5). The command palette's Stocks and Universes groups (§3.4) open
CAP-002's routes but are the shell capability's to build. Unreachable is the
shell's designed state on every route (§3.5); CAP-002 adds nothing to it.

**Into the delivered CAP-001 shell, meanwhile (DEC-0069, PROVISIONAL).** Until
the *App shell & data health* capability delivers the §3 shell,
`classification-ui` appends exactly one destination, **Research** at
`/research`, after the four delivered CAP-001 destinations (Coverage,
Instruments, Runs, Settings) in `web/src/app/shell.tsx`, and registers its five
routes at the `web/src/app/routes.tsx` seam (system design v3 §4.2, screen
registration; §8 question 4, which lists every delivered file the composition
edits, DEC-0084). Nothing else in the delivered shell is edited: the
fixed rail, the status region pinned to its foot (reserved for STD-UI-11's
environment indicator), the 30-second health poll, the `ScreenState` union, the
unreachable state and the landing rule stay CAP-001's
(`component-design-owner-web-app.md` §2.2 to §2.4; AGT-SCOPE-002). Under that
shell the page ground is the delivered `--background` and the regions below
still sit on `card`s, so the screens change no layout when the blueprint's shell
replaces it; the shell capability removes or replaces the one appended entry and
migrates nothing of CAP-002's, because the routes are already the blueprint's.
Where a CAP-002 link targets a blueprint route the shell capability will
deliver (the download's start time in the as-of line to `/data/downloads/:id`;
Data health at `/data`;
followed stocks at `/data/followed`), it targets the delivered CAP-001 route
meanwhile (`/runs/:runId`, `/runs`, `/instruments`) and is changed by the shell
capability's route migration (blueprint §2.2), not by CAP-002.

**Routes** (blueprint §2.2; DEC-0068): `/research` (S03), `/research/stocks/:symbol`
(stock evidence), `/research/compare?symbols=AAPL,MSFT` (compare),
`/research/universes` (universes), `/research/universes/:universeId` (universe
detail). Every state the owner may want to return to or share is carried in the
URL: thresholds, scope, hide-incomplete, search and sort on Research (S03 §5,
S03-5) and on universe detail; the `as_of` date and the active tab on universe
detail; the active tab on stock evidence (`tabs` contract); the compared
symbols on compare. Checked rows are client state, kept by symbol across filter
changes (S03 §5).

**Display labels, numbers, dates and marks, stated once.** User-visible text
uses the STD-UI-1 v6 display labels (blueprint §7; DEC-0072). Percentiles render
as whole numbers 0 to 100 with no sign and no `%` (a percentile is a rank, not
a rate, STD-UI-2); standardised scores at two decimals with an explicit sign
(`+1.27`, `−0.45`, `0.00` at the peer mean, unsigned); ratio inputs at two
decimals; rate inputs as signed percentages at two decimals (`+12.40%`);
per-share amounts at two decimals; monetary amounts in whole currency units with
thousands separators and no abbreviation (STD-UI-6); every numeric column in
`--font-numeric`, right- and decimal-aligned, precision fixed per column
(STD-UI-3) (DEC-0063, PROVISIONAL, consistent with S03 §8's *88* and *0.00*).
No percentile or standardised score carries a polarity colour: `--gain` and
`--loss` are not applied to any CAP-002 value (DEC-0060), and the standardised
score renders in `--muted-foreground` (blueprint §4.4). The as-of line
(blueprint §4.8) sits in `--text-xs` `--muted-foreground` directly under the
region title on every scored surface and reads *Scores from {date} {time}
{zone} · from the download started {date} {time} {zone} · sorted by {column}*
(DEC-0073, PROVISIONAL, with the download named as DEC-0083 fixes it). **A
download is named by its start time in America/Chicago, with the zone, and the
start time is the link to that download's detail**: no table or artifact
numbers downloads (`acquisition_run.run_id` is the only identifier), so no
download number and no raw `run_id` appears on any CAP-002 surface, and S03
§3's *from download #{n}* is a departure from the approved copy, recorded with
that reason (DEC-0083, PROVISIONAL, superseding DEC-0079 (e); system design v3
§3.3 step 18, §8 question 11; review v2 FINDING-8; Section 7). Timestamps
are America/Chicago with the zone shown (*CDT* or *CST* as the instant falls),
`classification_date`, `known_on` and `recorded_on` are ISO-8601 dates, and
`as_of` on an input is a fiscal period end or a session date rendered
unconverted (STD-UI-5). Polled regions add *checked {time}* (STD-UI-25).

**Three presence renderings are never confused** (STD-UI-14; blueprint §4.4;
DEC-0072). Present: the percentile and its bar. Absent: `badge`
`coverage-absent` *Incomplete*, the reason in a tooltip and in the inspector.
Not determinable: `badge` `coverage-unknown` *Not enough to rank*, carrying
`--pattern-indeterminate` and never reading as a milder *Incomplete*. An absent
value in an evidence or compare table renders the em dash in `--value-missing`;
`0.00` is a measured standardised score at the peer mean; blank means only that
the column does not apply (STD-UI-4).

**Type, density and spacing** are theme tokens (STD-UI-29): `--text-base` as
the default, `--text-sm` for dense table bodies, `--text-xs` for timestamps,
as-of lines and the 11 px canvas labels (blueprint §13), `--text-lg` for the
results `h1` (S03 §3), `--text-xl` for page titles and the inspector symbol.
Panes sit `--space-4` apart (S03 §3); stacked regions `--space-5` apart. Every
table consumes `--row-height`, which resolves to `--row-height-comfortable`;
this design selects no density tier and inherits, as CAP-001 did, pending
OQ-UI-4. No spacing, size or colour literal appears anywhere in this design;
the pixel widths quoted from S03 (220 to 250 px, 300 to 340 px, 22 px, 52 px,
56 px) are the approved specification's and bind the layout, not the theme.

## 1. Screens

Five routes, as the brief's §1 names them. Section 1.1 is S03 delivered;
Section 1.2 is the score-set state the blueprint folds into S03's banner and
as-of line and the shell capability's screens consume, kept as a numbered
section so version 1's Classification currency region has a clear successor;
Sections 1.3 to 1.6 are the three pages blueprint §2.2 calls "CAP-002 page,
restyled into this shell" (universes list and detail share a route pair). Each
screen records its eight STD-UI-23 states in a States subsection, as version 1
did, because the brief enumerates the states (§12.4) and the design is where
their rendering is fixed. S03 §7 governs Research and is reproduced there with
CAP-002's specializations.

### 1.1 Research (S03, `/research`)

The screen flow "See stocks classified after an acquisition" lands on, and the
one that answers the owner's question in blueprint §2.1: *which stocks look
interesting, and why?* It is S03 §3 to §10 delivered in full, less the two
controls S03 marks M2, **Use in a strategy** (Results header) and **Start a
strategy from this screen** (Inspector), and less the holdings line (M2, review
v4 FINDING-45). Each is **absent**, not disabled: the blueprint's template rule
is that an earlier milestone delivers the regions §10 assigns and leaves the
rest out (blueprint §0). The Results header therefore carries one action and
the inspector one.

#### Page Layout

Three panes in a wrapping flex row, `--space-4` apart, each a `card`, under the
top bar's title *Research* (S03 §3). Below 1280 px the inspector wraps below the
results (blueprint §4.5); the Filters pane keeps its width and the results take
the rest.

**Filters** (220 to 250 px; `section` labelled *Filters*): `h2` *Find stocks*,
then sections separated by `--border`, top to bottom:

1. **Find a stock** (a departure from S03 §3, DEC-0074, PROVISIONAL): one
   `input` `text` labelled *Find a stock*, placeholder *Symbol*, matching the
   symbol prefix server-side through the `symbol` parameter the list read
   already carries, held in the URL query and cleared by **Clear filters**.
   Reason: STD-UI-30 requires search at the committed 3000-stock volume
   (AC-11), blueprint §11 records the research list as virtualised *with search
   and filter*, and S03 as approved has no search field (review v4 FINDING-22,
   open). It matches the symbol only; search by symbol and name product-wide is
   the shell's command palette (blueprint §3.4). `Esc` clears it (`input`
   contract). The prefix is part of the filter, not only of the view: it
   travels into **Save these {n} as a universe…** with the twelve bounds and
   `hide_incomplete`, so a search narrows what is saved exactly as it narrows
   what is counted (system design v3 §3.3 step 15, §4.2 `POST /api/universes`;
   brief v3 §2.1 items 3 and 6; review v2 FINDING-5).
2. **Look in**: `select` `inline` whose options are *All followed stocks ·
   {n}* and each active universe by name (S03 §3; `GET /api/universes`). The
   trigger's accessible name reads *Look in: All followed stocks* (`select`
   contract). The select always has a value; *All followed stocks* is the
   explicit no-filter option.
3. **Thresholds**: one row per factor, in the order value, growth, momentum,
   each a swatch (`--factor-value`, `--factor-growth`, `--factor-momentum`;
   identity, STD-UI-7) and the factor's name, then a sentence with three blanks
   (blueprint §4.7, sentence builder, each sentence a `<p>`): *[percentile ▾]
   [at least ▾] [n]*. The first `select` `inline` chooses *percentile* or
   *standardised score*, the second *at least* or *at most*, and the `input`
   `numeric` (56 px, placeholder *any*) the value. Accessible names read as the
   blanks: *Measure for value*, *Direction for value*, *Value threshold*
   (blueprint §4.7). Helper under the rows, in `--text-xs` `--muted-foreground`:
   *Percentile 70 means "scores better than 70% of the stocks scored on this
   factor".* (S03 §3). Validation runs on blur: a percentile outside 0 to 100
   or a non-finite standardised score is a field error in `--destructive`
   before any request (`input` contract; system design v3 constraint 15); a
   blank value means no threshold on that measure. The three blanks map
   one-to-one onto the twelve read bounds `{factor}_percentile_min/_max`,
   `{factor}_score_min/_max` (system design v3 §3.3 step 15); no new filter
   model exists. **A threshold on a factor excludes only stocks that are
   classified on that factor and fail the bound.** A stock incomplete on that
   factor stays listed, rendered *Incomplete*, and stays in the count unless
   **Hide incomplete** is on; a stock unranked on it (*Not enough to rank*) is
   likewise not excluded by the threshold. This is S03-1's approved text and
   blueprint §1 principle 5, and it is what makes the helper sentence true
   (DEC-0081, from the approved S03, superseding the threshold-exclusion
   reading in DEC-0071 and DEC-0076; system design v3 §3.3 step 15; review v2
   FINDING-6).
4. **Hide incomplete**: `checkbox` `default` *Hide stocks with an incomplete
   score*, default off, helper *They're shown by default so nothing disappears
   silently.* (S03 §3; `hide_incomplete`). With it on, stocks whose
   `not_classified` reason on any factor is an input reason (missing,
   outdated or not computable) leave the list and the count; it is the only
   control that removes an incomplete stock (S03-1; DEC-0081; system design v3
   §3.3 step 15).
5. **Clear filters** (DEC-0078, PROVISIONAL; a placement S03 leaves open):
   `button` `ghost` at the pane's foot, rendered whenever any threshold, the
   search, a universe scope or hide-incomplete is active, resetting all of them
   and the URL to the defaults; the same control appears in the nothing-found
   state (S03 §7). Sort is not a filter and is kept.

**Results** (fluid; `section` labelled *Results*). The not-current banner, when
it applies, sits first (Section 1.2). Then the header: `h1` *{n} stocks match*
at `--text-lg` (S03 §3, §8), its count `match_count` over the whole filtered
set, never the page (S03-2), counting every stock the scope, the thresholds,
the search and hide-incomplete leave listed, incomplete ones included unless
hidden (DEC-0081); under it the as-of line *Scores from 2026-10-15 17:46 CDT ·
from the download started 2026-10-15 17:30 CDT · sorted by value* (Section 0;
S03 §3 as specialized by DEC-0073 and DEC-0083), where the download's start
time *2026-10-15 17:30 CDT* is the link to that download's detail (no number
and no raw `run_id` is shown: DEC-0083, PROVISIONAL) and the
line ends with **Earlier sets…** (`button` `ghost`, DEC-0078) opening the set
history dialog of Section 1.2. Right of the header: **Save these {n} as a
universe…** (`button` `outline`, S03 §3; DEC-0076 rules below). Then the table,
then the STD-UI-18 footnote in `--text-xs` `--muted-foreground`: *A score is
shown only when every input is present and current. This checks presence and
currency, not whether the provider's values are correct.* (S03 §8).

**The table** is `data-table` `virtualised` with the base contract's row
checkboxes (S03 §4): windowed rows over keyset pages at `DEFAULT_PAGE_SIZE` 50
and `MAX_PAGE_SIZE` 500, sorting, filtering and counting server-side over the
full set (S03 §6; system design v3 §3.3 step 15). Columns, left to right:

| Column | Alignment | Content |
|--------|-----------|---------|
| (checkbox) | n/a | `checkbox` `default` named *Select {SYMBOL}*; 24 px target |
| Symbol | left | Row header (`<th scope="row">`), `--font-numeric`; not a link, because click and `Enter` on the row select it into the inspector (S03 §6); the evidence page is reached from the inspector. Sortable, the default sort ascending so no factor is privileged (brief §2.1) |
| Name | left | `instrument.name`, `--foreground`, truncated with the full name in the cell's `title` |
| Value | right | Blueprint §4.4 factor cell; header carries the `--factor-value` swatch and the name; sortable on percentile, and on standardised score through the sort allowlist `value_score` (S03 §6 shows the arrow and `aria-sort`) |
| Growth | right | As Value, `--factor-growth` |
| Momentum | right | As Value, `--factor-momentum` |

**The factor cell** (blueprint §4.4, a composition in
`web/src/components/patterns/`): the percentile in `--font-numeric` weight 600,
right-aligned in a fixed 22 px box, then a 52 px bar filled to the percentile in
`--seq-4` on `--seq-1` (magnitude, STD-UI-7), `aria-hidden` (S03 §9). The
standardised score never appears in the list; it is in the inspector. Where the
classification carries the restatement mark (`restated_possible`, AC-23,
STD-UI-17), the **Possibly restated mark** follows the number (DEC-0075,
PROVISIONAL, resolving review v4 FINDING-56): an inline element of the same
pattern carrying the `badge` `status-neutral` tokens (`--status-neutral` on
`--status-neutral-muted`, `--radius`, `--text-xs`) whose text content is
*Possibly restated*, rendered visually hidden, with the glyph *R* drawn
`aria-hidden` beside it. Assistive technology reads the words; sighted readers
see the compact mark the blueprint draws; no `badge` component is used, so no
accessible-name override is needed (badge specification §5). The mark appears
on every percentile that carries it, here, in the inspector, on universe
detail, compare, evidence and history (S03-6). The explanation sentence lives in
the inspector and on the evidence page, never in the cell.

**An incomplete factor** (`not_classified`: input missing, outdated or not
computable) renders `badge` `coverage-absent` *Incomplete* in place of the
number and bar, with the reason in the owner's words as the cell's tooltip,
reachable from the row's selection because the inspector carries it in full
(S03 §8 copy: *Incomplete: revenue for the quarter ending 2025-06-27 is
missing, so growth can't be compared fairly. It isn't guessed.*, with *is
outdated* or *couldn't be computed* for the other reason codes; inputs named
in product vocabulary, brief §2.1 item 9). Never a number, never `0`. A row
incomplete on one factor and scored on two reads as two percentiles and one
word, not as a row-level failure (AC-12). A threshold on that factor does not
remove the row: it stays listed as *Incomplete* until *Hide stocks with an
incomplete score* is on (S03-1; DEC-0081).

**A factor below 30 qualifying stocks** (`ranked = false`, AC-14, S03-4):
every cell in that column renders `badge` `coverage-unknown` *Not enough to
rank*, and the column header adds *{n} qualified, 30 needed* under the name, so
a screen reader hears the count once (S03 §7 *Unavailable*; brief §2.1 item
10). The column's sort control is removed, because there is nothing to order.
The 30 is the capability's owner decision of 2026-10-12; `qualified_count`
supplies the count.

**A stock the owner has stopped following** (`lifecycle` retired, AC-15;
DEC-0073, PROVISIONAL) is not listed under *All followed stocks*, because it is
not followed. Under a universe scope it keeps its row and every factor cell
renders `badge` `status-neutral` *Not followed*, with *Not followed since
{date}. Earlier scores stand.* as the tooltip and in the inspector. Neutral,
never a fault: the owner chose it (DEC-0059's retired row, kept by DEC-0072).

**The selected row** carries a 3 px inset `--status-active` edge and
`--status-active-muted` fill and `aria-selected` (blueprint §4.5; S03 §9).
Checked rows use the table's `--muted` selected background. Checking never
selects and selecting never checks (S03 §6).

**The selection tray** (blueprint §4.6; S03 §3) pins to the bottom of the
Results card when one or more rows are checked: a dark bar, `--foreground` fill
with `--background` text, `role="region"` labelled *Selection*, announced
politely as *{n} selected* when it appears (S03 §9). Left: *{n} selected*;
right: **Compare side by side** and **Add to universe…**, both `button`
`outline` on the dark bar. **Compare side by side** is enabled while 2 to 6
rows are checked (S03 §6; DEC-0070) and otherwise renders `button` `blocked`
with *Check 2 to 6 stocks to compare them.* beside it (brief §2.1 item 7).
Checked rows are kept by symbol across filter, sort and scope changes and
across the set refresh (S03 §5; DEC-0062).

**Inspector** (300 to 340 px; `card` `summary`; `section` labelled *Selected
stock*; blueprint §4.5, S03 §3). When nothing is selected it reads *Select a
stock to see why it scores as it does.* (brief §12.4). When a row is selected,
top to bottom:

1. The symbol at `--text-xl` `--font-numeric` and the name beneath it; `badge`
   `status-neutral` *Not followed* after the symbol when the stock is no longer
   followed (DEC-0073).
2. The **memberships line**: *In Tech and Dividend growers* with each name a
   link to `/research/universes/:universeId`, or *In no universe*
   (`memberships` on `GET /api/classifications/stocks/{symbol}`, DEC-0071). The
   holdings line S03 names is M2 and absent (FINDING-45).
3. **One block per factor** (value, growth, momentum): the swatch and name as a
   description term, then the percentile in weight 600 (with the *Possibly
   restated* mark where it applies) and the standardised score in
   `--muted-foreground` at two decimals, signed (DEC-0063), then one line in
   `--text-xs` naming the inputs and their as-of dates (S03-3): *From
   book-to-price, earnings yield and free-cash-flow yield, as of 2025-06-27,
   known 2026-10-14*. An incomplete factor shows *Incomplete* in place of the
   numbers; a factor below 30 shows *Not enough to rank* with *{n} qualified,
   30 needed*; a stock not followed shows *Not followed* on every factor.
4. **The Incomplete explanation box**, present when any factor is incomplete:
   bordered (`--border`, `--radius`), one sentence per incomplete factor in the
   S03 §8 shape, in full. For a stock no longer followed the box reads *Not
   followed since {date}. Earlier scores stand.* (DEC-0073). Where a percentile
   carries the restatement mark, the box also carries the STD-UI-17 sentence:
   *Possibly restated: the financials behind this score were downloaded for a
   period that had already been reported before FactorFlow began following this
   stock, so they may reflect later restatements.* (brief §2.6).
5. **See every input and its date** (`button` `outline`, rendered as a link
   to `/research/stocks/:symbol` because it navigates; S03 §3). **Start a
   strategy from this screen** is M2 and absent.
6. The footnote in `--text-xs` `--muted-foreground`: *Percentile first: 88
   means better than 88% of the stocks scored on this factor. The small number
   is the standardised score.* (S03 §8).

**The not-current banner and the Score update failed rendering** are Section
1.2's and sit above the results header (S03 §3).

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Filters, Results and Inspector panes | `card` | `default` (Filters, Results); `summary` (Inspector, S03 §4) | `design-system/components/card/design-spec.md` |
| Find a stock (DEC-0074) | `input` | `text` | `design-system/components/input/design-spec.md` |
| Look in (scope) | `select` | `inline` (S03 §4) | `design-system/components/select/design-spec.md` |
| Threshold measure and direction | `select` | `inline` (S03 §4) | `design-system/components/select/design-spec.md` |
| Threshold value, 56 px, placeholder *any* | `input` | `numeric` (S03 §4) | `design-system/components/input/design-spec.md` |
| Hide stocks with an incomplete score | `checkbox` | `default` (S03 §4) | `design-system/components/checkbox/design-spec.md` |
| Clear filters; Earlier sets… (DEC-0078) | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Results table | `data-table` | `virtualised`, with the base contract's row checkboxes (S03 §4) | `design-system/components/data-table/design-spec.md` |
| Row selection | `checkbox` | `default`, named *Select {SYMBOL}* (S03 §4) | `design-system/components/checkbox/design-spec.md` |
| Factor cell, incl. the Possibly restated mark | composition, blueprint §4.4 (DEC-0075) | n/a | `design-system/intake.md` step 1.3 |
| Incomplete, in a factor cell | `badge` | `coverage-absent` (S03 §4; DEC-0072) | `design-system/components/badge/design-spec.md` |
| Not enough to rank, in a factor cell | `badge` | `coverage-unknown` (S03 §4) | `design-system/components/badge/design-spec.md` |
| Not followed, in a factor cell and the inspector (DEC-0073) | `badge` | `status-neutral` | `design-system/components/badge/design-spec.md` |
| Save these {n} as a universe… | `button` | `outline` (S03 §3) | `design-system/components/button/design-spec.md` |
| Save these {n} as a universe… at zero matches (DEC-0076) | `button` | `blocked` | `design-system/components/button/design-spec.md` |
| Save-as-universe dialog; Add-to-universe dialog | `dialog` + `form` | `standard` + `dialog` (S03 §6) | `design-system/components/dialog/design-spec.md`, `design-system/components/form/design-spec.md` |
| Universe name in the save dialog | `input` | `text` | `design-system/components/input/design-spec.md` |
| Universe to add to, in the add dialog | `select` | `default` (inside `form`; options: active universes plus *New universe*) | `design-system/components/select/design-spec.md` |
| Selection tray | composition, blueprint §4.6 | n/a | `design-system/intake.md` step 1.3 |
| Compare side by side; Add to universe… (tray) | `button` | `outline`; `blocked` outside 2 to 6 checked | `design-system/components/button/design-spec.md` |
| See every input and its date | `button` | `outline` (S03 §3), as a link | `design-system/components/button/design-spec.md` |
| Inspector memberships; the download's start time in the as-of line (DEC-0083) | link | n/a | `design-system/components/button/design-spec.md`, which directs navigation to a link |
| As-of line | composition, blueprint §4.8 | n/a | `design-system/intake.md` step 1.3 |
| Saved {n} stocks as {name}; Added {n} stocks to {name} (DEC-0076) | `toast` | `success` | `design-system/components/toast/design-spec.md` |
| Not-current banner; Score update failed | Section 1.2 | | |

#### Interaction Flows

**Reading scores** (AC-9, AC-12, AC-21). No interaction is required for the
primary judgement: each row carries three percentiles, or *Incomplete* / *Not
enough to rank* in a cell's place, under the match count and the as-of line
naming the scores' date and the download by its start time (DEC-0083).

**Filtering, sorting, scope and search** (S03 §6, AC-16). Every change applies
on selection or on blur, runs server-side over the full set, and updates the
URL query, so the view survives reload and back navigation (S03-5). Rows stay
visible and dimmed while the new result loads; focus does not move; the new
match count is announced politely (`data-table` contract). `Enter` or `Space`
on a column's sort control cycles ascending, descending, unsorted; the as-of
line's *sorted by {column}* follows. Stocks incomplete on the sorted factor
sort after every scored row in both directions, so an absent percentile never
sorts as zero (STD-UI-4); the header's description says so. A threshold never
removes a stock incomplete on that factor: it stays listed as *Incomplete*,
and counted, until *Hide stocks with an incomplete score* is on (S03-1;
DEC-0081). Nothing found
renders *No stocks match these filters.* with **Clear filters** (S03 §7).

**Selecting and checking** (S03 §6). Click or `Enter` on a row selects it into
the inspector; `Space` on its checkbox checks it; the two never interfere.
`↑`/`↓` move the selection and the inspector follows after a 150 ms debounce
(S03 §6). The inspector's content is read once per selection from
`GET /api/classifications/stocks/{symbol}`, because the list read carries no
input rows (system design v3 §3.3 step 17).

**Saving the result as a universe** (AC-2, S03 §6, S03-7; DEC-0076,
PROVISIONAL; routine, blueprint §9). **Save these {n} as a universe…** opens
`dialog` `standard`, title *Save these {n} stocks as a universe*, whose
description states *{n} stocks, including {m} with an incomplete score* when
m > 0, then the thresholds, the search when one is active and the
hide-incomplete state in words (*value percentile at least 80 · momentum
standardised score at least 0.00 · search "AA" · stocks with an incomplete
score hidden*, each clause only when it applies), and whose one field is the
universe name (`input` `text`, maximum length stated once it is known, Section
7). The confirm label is **Save**; initial focus is the name field (`dialog`
contract for `standard`). The request posts `filter`, the one object the list
was read with (the twelve threshold bounds, `hide_incomplete` and the *Find a
stock* `symbol` prefix, null when none), and the `set_id` on screen; the
server evaluates all three against that set with the predicate the list uses,
so **the saved members are exactly the stocks the results header counts**
(S03-7; system design v3 §3.3 step 15, §4.2 `POST /api/universes`; brief v3
§2.1 item 6; review v2 FINDING-5). Three rules fix who is a member, and they
are the list's: a stock incomplete on a factor, thresholded or not, is a
member unless hidden (DEC-0081); a search keeps only the stocks it matched;
hidden stocks are not members. On
`201` the dialog closes and `toast` `success` *Saved {n} stocks as {name}*
carries a link to `/research/universes/:universeId` (STD-UI-24; FINDING-42).
On `409 universe_name_in_use` the error attaches to the name field and the
dialog stays open. On `409 classification_set_changed` the dialog stays open
with *Could not save these stocks as a universe: the scores changed while you
were reviewing them. Review the new result, then save again.* and the confirm
is replaced by **Review new result**, which closes the dialog onto the
already-refreshed table (DEC-0062). At zero matches the control renders
`button` `blocked` with *No stocks match these filters, so there is nothing to
save.* beside it (AC-5); `422 empty_universe` is the backstop. The control is
not offered while the scope is a universe: the saved filter carries the
bounds, `hide_incomplete` and the prefix, no scope (system design v3 §4.2).

**Comparing** (S03 §6, AC-16; DEC-0070). **Compare side by side** routes to
`/research/compare?symbols=…` with the checked rows, 2 to 6. Outside that
range the action is `blocked` with its reason. The browser's back returns here
with every filter restored from the URL.

**Adding checked rows to a universe** (AC-1, AC-4; S03 §6; DEC-0076; routine).
**Add to universe…** opens `dialog` `standard`, title *Add {n} stocks to a
universe*, with a `select` `default` listing the active universes plus *New
universe*; choosing *New universe* reveals a name field. The confirm is
**Add**. On success `toast` `success` *Added {n} stocks to {name}* links to the
universe, with *, and {m} were already members* when m > 0 (already-member
stocks are reported, never errored, AC-4). On `409 universe_retired` the
dialog shows *This universe is retired and can't be changed. Its members and
history are still viewable.*; `409 instrument_not_acquired` cannot arise from
checked rows, which are all followed stocks.

**Watching a set complete** (AC-10, AC-20; DEC-0062, PROVISIONAL; DEC-0054).
Section 1.2 polls while a set builds; on completion the as-of line announces
the new date and download politely, the table dims and reloads once under the
`data-table` contract, and sort, thresholds, scope, hide-incomplete, search,
the selected row and the checked rows are kept by symbol. The owner takes no
action (flow "See stocks classified" step 3).

**Opening the download and the set history** (AC-21; DEC-0073, DEC-0083). The
download's start time in the as-of line (*from the download started 2026-10-15
17:30 CDT*) opens that download's detail (Section 0 names the route under each
shell). **Earlier sets…** opens the set history dialog of Section 1.2.

#### States (S03 §7, with CAP-002's specializations)

| State | Rendering |
|-------|-----------|
| Loading | Table skeleton at 12 rows; inspector skeleton (S03 §7) |
| Empty, never populated | `never_classified: true` (`set` null): the results body reads *No stocks have been scored yet.* and then, from the `later` block, the first set's state: `badge` `status-active` *Updating* with *The first set of scores is being produced from the download started {time}.* while it builds, or `badge` `status-critical` *Score update failed* with *Score update failed {time}: {reason}. The next complete download will try again.* if the first attempt failed (AC-20); beneath it the latest download's state (*The latest download, started {time}, is Downloading* / *ended Complete at {time}* / *ended Failed at {time}: {reason}*, the start time linked to its detail) and a link *Open Data health* (S03 §7, AC-22; DEC-0082, PROVISIONAL; DEC-0083). The body polls every 10 s from first load while the first set builds or the latest download is non-terminal (Section 1.2), so the first scores appear without a reload (flow "See stocks classified" step 3); never an empty table, never the download's state in place of the set's. The Filters pane renders with its controls `blocked`-free but inert; the inspector reads its empty sentence |
| Empty, nothing found | *No stocks match these filters.* with **Clear filters** (S03 §7); a search matching no symbol is this state |
| Partial | *Incomplete* cells inline; header counts unchanged (S03 §7, AC-12). A set built after a *Partial* download says so in the as-of line (Section 1.2) |
| Stale | Not-current banner above the results header (S03 §3; Section 1.2), `status-warning`; the `status-critical` rendering when the update failed (DEC-0073); *checked {time}* on the as-of line (AC-20) |
| Unavailable | A factor below 30 qualifying stocks: every cell in that column *Not enough to rank*, header *{n} qualified, 30 needed* (S03 §7, S03-4, AC-14). Per column, never per screen |
| Error | Results body replaced with the operation, the resource and the reason and **Try again**; filters kept (S03 §7). The inspector's block is replaced the same way when the stock read fails |
| Unreachable | Shell state (blueprint §3.5) |

#### Token Usage

| Purpose | Token |
|---------|-------|
| Pane surfaces and text; pane boundaries | `--card` / `--card-foreground`; `--border` |
| Page ground under the panes (blueprint shell) | `hsl(var(--muted) / 0.5)` over `--background` |
| Results `h1`; inspector symbol | `--text-lg`; `--text-xl` with `--font-numeric` |
| As-of line, helpers, footnotes, standardised score | `--text-xs`, `--muted-foreground` |
| Factor swatches in column headers and threshold rows | `--factor-value`, `--factor-growth`, `--factor-momentum` |
| Percentile bar | `--seq-4` on `--seq-1` |
| Percentile, standardised score, symbol | `--font-numeric` |
| Table separators; header text; body text; checked-row background | `--border`; `--muted-foreground`; `--foreground`; `--muted` |
| Selected row | `--status-active` edge, `--status-active-muted` fill |
| Incomplete | `--value-missing` on `--value-missing-muted` (`coverage-absent`) |
| Not enough to rank | `--value-indeterminate` on `--value-indeterminate-muted` plus `--pattern-indeterminate` (`coverage-unknown`) |
| Not followed; Possibly restated mark | `--status-neutral` on `--status-neutral-muted` |
| Selection tray | `--foreground` fill, `--background` text |
| Field boundaries and focus | `--input`, `--ring`; errors `--destructive` |
| Row height, cell padding, dense body text | `--row-height`, `--cell-padding-x` / `--cell-padding-y`, `--text-sm` |
| Pane gap; region spacing | `--space-4`; `--space-5` |
| Dialog and toast surfaces | `--popover` / `--popover-foreground`; toast success accent `--status-good` |

`--gain`, `--loss` and `--neutral-value` are not used: no CAP-002 value is a
return or a change (DEC-0060). The `badge` factor variants are not used: the
swatch in the header is identity, and every stock scores on all three factors.

#### Accessibility (S03 §9, with CAP-002's additions)

The three panes are `section`s labelled *Filters*, *Results* and *Selected
stock*. The table follows the `data-table` contract: row headers on Symbol,
`aria-sort` on the sorted column, `aria-selected` on the selected row; every
column header is programmatically associated with its cells. Factor bars are
`aria-hidden`; the percentile is the text. The *Possibly restated* mark exposes
the words *Possibly restated* as its text with the *R* glyph `aria-hidden`
(DEC-0075). The *Incomplete* and *Not enough to rank* badges carry their words
and their distinct treatments (`--value-missing` against
`--pattern-indeterminate`), so the distinction AC-12 and AC-14 protect survives
greyscale (STD-UI-8); the reason tooltip is never the only path to the reason,
because the inspector carries it. The *{n} qualified, 30 needed* count lives in
the column header so a screen reader hears it once, not 3000 times. The tray
is a `role="region"` labelled *Selection*, announced politely as *{n} selected*.
Every threshold control has an accessible name that reads as its blank
(blueprint §4.7). Every `blocked` action stays focusable and exposes its reason
through `aria-describedby`. Sorting, filtering, scope change and the set refresh
never move focus; the new match count and, on refresh, the new date and
download are announced politely (STD-UI-24). Checkboxes and sort controls are
at least 24 by 24 CSS pixels (`--control-min-target`). Dialogs trap focus and
return it to their trigger.

### 1.2 Score-set state, folded into S03 and consumed by the shell's screens

Version 1 defined a *Classification currency* region composed into every
classification-bearing screen. Blueprint §3.5 and §4.10 settle where that state
lives: *shown where scores are shown, never in the shell*, as the as-of line
(§4.8) and the *Stale* rendering (§4.10). On Research that is S03 §3's banner
above the results header and the as-of line under the `h1`; on universe
detail, compare and stock evidence it is the same banner-and-line composition
above the scores (AC-20, AC-21). This section fixes the composition once; no
screen restyles it (blueprint §0). What S01 Home and S09 Data health consume is
stated at the end; those screens are the shell capability's and are not
designed here.

#### Page Layout

**The state comes from one shape** (DEC-0082, PROVISIONAL; system design v3
§3.3 steps 13, 14 and 18, §4.2). Both `GET /api/classifications` and
`GET /api/classifications/summary` carry `set`, the current complete set or
null, and `later`, the most recent set newer than `set`, or the first set
while none is complete, with its `set_id`, `state` (`building` or `failed`),
`started_at`, `ended_at`, `failure_reason`, `run_id` and `run_started_at`, or
null when no such set exists. `not_current` is true exactly when `later` is
non-null, so every rendering below reads from `later` alone, on whichever of
the two reads the host screen holds, before and after the first set.

**The as-of line** (blueprint §4.8; DEC-0073, PROVISIONAL; DEC-0083,
PROVISIONAL), directly under the region title in `--text-xs`
`--muted-foreground`: *Scores from 2026-10-15 17:46 CDT · from the download
started 2026-10-15 17:30 CDT · sorted by value*, where *2026-10-15 17:30 CDT*,
the download's start time (`run_started_at`, America/Chicago with the zone,
STD-UI-5), is the link to the download's detail (Section 0) and the download's
outcome follows it as `badge` `status-good` *Complete* or `status-warning`
*Partial* (blueprint §8), because a set built after a partial download carries
more *Incomplete* cells and the owner should know why (AC-10). A download is
named by its start time on every CAP-002 surface, never by a number and never
by the raw `run_id`: no table or artifact numbers downloads, so S03 §3's
*#{n}* is a recorded departure and the number is the owner's (DEC-0083,
superseding DEC-0079 (e); system design v3 §3.3 step 18; Section 7). On a
surface with no sort (compare, evidence) the *sorted by* clause is omitted.
While a later set builds, the line adds `badge` `status-active` *Updating* and
*checked 17:52:10 CDT* (STD-UI-25). It ends with **Earlier sets…** (`button`
`ghost`, DEC-0078).

**The not-current banner** (S03 §3, §4: a `badge` inside a `card`), a
full-width `card` above the results header, carrying the badge and one or two
sentences at `--text-base`:

| Condition | Badge | Text |
|-----------|-------|------|
| The current set reflects the latest qualifying download | no banner; the as-of line alone | |
| `later.state` is `building` | `badge` `status-warning` *Not reflecting the latest download*; the as-of line carries *Updating* | *Showing scores produced 17:46 CDT from the download started 2026-10-15 17:30 CDT. A newer set is being produced and replaces this one when complete.* (S03 §3, with the download named by its start time, DEC-0083) |
| `later.state` is `failed` | `badge` `status-critical` *Score update failed* (DEC-0073) | *Score update failed 18:03 CDT: {failure_reason as recorded}. Showing scores produced 17:46 CDT from the download started 2026-10-15 17:30 CDT. The next complete download will try again.* |

Labels and tiers are blueprint §8's (DEC-0072); the previous set stays on
screen, marked, in both non-current conditions (AC-20). The reason is the
recorded `failure_reason`, never a stack trace. Nothing is offered to retry,
because the scheduler does not retry a failed set and a control implying
otherwise would describe behaviour the product does not have (STD-UI-2).

A fourth condition, never scored (`set` null), replaces the results body rather
than heading it (Section 1.1 States, AC-22) and renders *Updating* or *Score
update failed* with its reason from the same `later` block, so a first set
that builds or fails is shown exactly as a later one is (AC-20; DEC-0082).
There is no progress indicator for a building
set: the engine runs as SQL and reports no per-stock progress (system design
§3.1 step 8), so `progress` `indeterminate` is not used and the banner carries
the set's start time in the *Updating* badge's tooltip and the dialog below.

**The set history** (DEC-0073) is a `dialog` `standard` titled *Earlier sets*
holding a `data-table` `history`: State (`badge` `status-good` *Complete*,
`status-active` *Updating*, `status-critical` *Failed*), Scores date, Download
(its start time, linked to its detail, with its outcome badge; DEC-0083),
Started, Ended (blank for a building set: the
column does not yet apply), Value qualified, Growth qualified, Momentum
qualified, Reason. Newest first, keyset paged (`GET /api/classifications/sets`).
A qualified count below 30 is followed by *Not enough to rank* in text. The
dialog is dismissible, has no confirm action, and returns focus to **Earlier
sets…** on close.

**What S01 Home and S09 Data health consume** (blueprint §10, "on CAP-002's
classification state as it is"; DEC-0071, PROVISIONAL). Both read
`GET /api/classifications/summary` (system design v3 §4.2): the `set` and
`later` blocks, one shape before and after the first set (DEC-0082), the
per-factor `qualified_count` and `ranked`, and
`stocks_current {current_count, followed_count}`. S01's data tile renders the
score as-of and *{n} of {m} stocks current* (S01 §3, §5, S01-6) and the badge
*Not reflecting the latest download* when stale (S01 §7); S09's *Factor
scores* check card renders the tier, the label, a one-line result, the as-of
and the exceptions (S09 §3, §5), saying *{n} stocks show as Incomplete until
their data is complete* (S09 §11). A stock is current when none of its
`factor_input` rows in the current set is `missing` or `outdated` (AC-12,
AC-13; review v4 FINDING-32). This design specifies the read's meaning and the
three labels; the two screens are the shell capability's, whose consumer
identifier is unpublished (Section 7).

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| As-of line | composition, blueprint §4.8 | n/a | `design-system/intake.md` step 1.3 |
| Not-current banner | `badge` inside a `card` | `status-warning` / `status-critical` inside `default` (S03 §4) | `design-system/components/badge/design-spec.md`, `design-system/components/card/design-spec.md` |
| Updating, on the as-of line | `badge` | `status-active` | `design-system/components/badge/design-spec.md` |
| Download outcome the set reflects | `badge` | `status-good` *Complete*; `status-warning` *Partial* (blueprint §8) | `design-system/components/badge/design-spec.md` |
| The download's start time, linked to its detail (DEC-0083) | link | n/a | `design-system/components/button/design-spec.md`, which directs navigation to a link |
| Earlier sets… | `button` | `ghost` (DEC-0078) | `design-system/components/button/design-spec.md` |
| Set history dialog | `dialog` | `standard` (DEC-0073) | `design-system/components/dialog/design-spec.md` |
| Set history list | `data-table` | `history` | `design-system/components/data-table/design-spec.md` |
| Set state in the history | `badge` | `status-good`; `status-active`; `status-critical` | `design-system/components/badge/design-spec.md` |
| A set completed or failed while the owner is on an unscored route | `toast` | `info`; `error` | `design-system/components/toast/design-spec.md` |

#### Interaction Flows

**Polling** (STD-UI-25; system design v3 constraint 18 and §3.3 step 14;
DEC-0054; DEC-0082, PROVISIONAL). Every scored surface polls
`GET /api/classifications/summary` every 10 seconds, **from first load and
before any set exists**, while `later.state` is `building` or the latest
download is non-terminal, and stops otherwise; the never-populated state
therefore learns that the first set completed or failed without a reload. The
cadence is the owner's 2026-09-05 run-progress cadence, reused. While polling,
the as-of line shows *checked {time}*. A poll that fails leaves the displayed
set and its banner in place and adds *Could not check for newer scores.* with
**Try again** under the as-of line; it never clears a mark.

**Completion** (DEC-0062, PROVISIONAL). When a poll reports the building set
complete (a new `set`, `later` null), the as-of line announces politely
*Scores updated to 2026-10-16 17:48 CDT from the download started 2026-10-16
17:30 CDT*, the banner leaves, and the host screen's table or
cards dim and reload once with every filter, sort, selection and checked row
kept by symbol. The replacement is dated and announced at the point of display
(STD-UI-16). On the universes list, which shows no score, no poll runs; a set
that completes or fails while the owner is there surfaces as `toast` `info`
*Scores updated to {date} {time}* or `toast` `error` *Score update failed:
{reason}* (brief §4), so the owner is told once and not surprised on the next
scored route.

**Failure** (AC-20). The previous set stays on every scored surface with the
`status-critical` banner and its reason. The next *Complete* or *Partial*
download starts a new attempt (AC-10); the banner says so.

#### States

| State | Rendering |
|-------|-----------|
| Loading | The as-of line renders its skeleton at final height so the table beneath does not shift |
| Empty, never populated | Never scored (`set` null): the host region's never-populated state (Section 1.1), with no as-of line, rendering *Updating* or *Score update failed* with its reason from `later` (AC-20, AC-22; DEC-0082) |
| Empty, nothing found | n/a: a set exists or none does |
| Partial | A set built after a *Partial* download: the outcome badge on the as-of line says so |
| Stale | The banner, with *Updating* or *Score update failed*; the state this composition exists to show (AC-20) |
| Unavailable | n/a: no check runs here; a factor below 30 is the host table's Unavailable state |
| Error | The summary read failed: last displayed set and banner kept, *Could not check for newer scores.* with **Try again** |
| Unreachable | Shell state |

#### Token Usage

`--status-warning`, `--status-critical`, `--status-active`, `--status-good` on
their `-muted` grounds for the badges; `--card`, `--card-foreground` and
`--border` for the banner card; `--text-xs` and `--muted-foreground` for the
as-of line; `--font-numeric` for dates, times and counts; `--popover` /
`--popover-foreground` for the dialog; history table tokens as Section 1.1.

#### Accessibility

The as-of line is a polite live region: a new date, a new state or a failure
is announced without stealing focus (STD-UI-24). Each badge carries its word
and the tier shape (warning triangle, critical square, active ringed dot, good
filled circle; blueprint §8). The warm tiers read dark rather than amber because
`design-system/theme-validation.md` darkened them for contrast; the design
relies on the words. The download link's accessible name is *Open the download
started 2026-10-15 17:30 CDT*. The dialog is `role="dialog"` with `aria-modal`,
labelled by its title,
focus trapped and returned on close.

### 1.3 Universes (`/research/universes`, restyled)

The owner's active universes with their member counts, retired universes
reachable but separated, and the one write action, creating a universe by
hand. Blueprint §2.2 calls this a "CAP-002 page, restyled into this shell"; the
information architecture is version 1's, restated against the shell, the
shared patterns and the display labels (brief §2.3).

#### Page Layout

Top-bar title *Universes* (breadcrumb *Research › Universes*). One `card` on the
page ground holding the table at full width (blueprint §3.1). The card header
carries `h1` *Universes* at `--text-lg`, the count *{n} active, {m} retired* in
`--muted-foreground`, the lifecycle `select` `inline` (*Active* default,
*Retired*, *All*) and, at the right, **New universe…** (`button` `default`),
the one write action on the screen. There is no delete at any level of the
interface (STD-UI-2, AC-6), and no search: the universe count has no committed
volume, so STD-UI-30 does not engage, and the shell's command palette carries
a Universes group (blueprint §3.4).

The table is `data-table` `expandable` (brief §4). Columns: Name (left, row
header, a link to `/research/universes/:universeId`, sortable); Lifecycle
(`badge` `secondary` *Retired*, the blueprint's own treatment of a retired
thing, §4.3; blank for active because blank means the column does not apply);
Members (right, whole number, `--font-numeric`); Created (ISO-8601 date).
Expanding a row reveals the full `created_at` and `retired_at` timestamps with
zone and the universe's origin line, *Created by hand* or *Saved from a filter
on 2026-10-15: value percentile at least 80, momentum standardised score at
least 0.00; search "AA"; stocks with an incomplete score hidden*, each clause
only when it applies, read once per expansion from the universe's `created`
event (`filter_provenance`, which records the bounds, `hide_incomplete`, the
*Find a stock* prefix and the set's `classification_date`; system design v3
§4.2, §4.4; DEC-0076; review v2 FINDING-5). Active and retired
universes are one table with a lifecycle column, not two tables; retirement is a
lifecycle, not an archive (STD-UI-2, AC-6).

**The create dialog** is `dialog` `standard`, title *New universe*, carrying a
`form` `dialog` with two fields: *Name* (`input` `text`) and *Stocks*
(`textarea` `list`, minimum four rows, placeholder `AAPL, MSFT, NVDA` or one
symbol per line). The textarea parses on paste and on blur, reports *12 symbols
recognised, 1 not recognised* as a polite live region, lists each rejected
entry with its reason (*zzzz: not a valid symbol format*) and keeps the
accepted ones (`textarea` contract). The confirm **Create** renders `button`
`blocked` beside *Enter at least one stock.* until one symbol parses (AC-5),
and beside *Up to 1000 stocks can be added in one request.* above
`MAX_SYMBOLS_PER_REQUEST`. The name field states its maximum length once that
bound is known (Section 7). Cancel is first in DOM order; initial focus is the
Name field. Creation is routine (blueprint §9).

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Page region | `card` | `default` | `design-system/components/card/design-spec.md` |
| Universe list | `data-table` | `expandable` | `design-system/components/data-table/design-spec.md` |
| Lifecycle filter | `select` | `inline` | `design-system/components/select/design-spec.md` |
| New universe… | `button` | `default` | `design-system/components/button/design-spec.md` |
| Create dialog | `dialog` + `form` | `standard` + `dialog` | `design-system/components/dialog/design-spec.md`, `design-system/components/form/design-spec.md` |
| Universe name | `input` | `text` | `design-system/components/input/design-spec.md` |
| Bulk symbol entry | `textarea` | `list` | `design-system/components/textarea/design-spec.md` |
| Create, with no stock or beyond the bound | `button` | `blocked` | `design-system/components/button/design-spec.md` |
| Retired universe | `badge` | `secondary` (blueprint §4.3) | `design-system/components/badge/design-spec.md` |
| Universe name, opening detail | link in the first column | n/a | `design-system/components/button/design-spec.md`, which directs navigation to a link |
| Scores updated / Score update failed while on this screen | `toast` | `info`; `error` (Section 1.2) | `design-system/components/toast/design-spec.md` |

#### Interaction Flows

**Creating by hand** (AC-1, flow "Build a universe by hand"; routine). On
confirm the request posts `{"name", "symbols"}`. On `201` the dialog closes and
the interface routes to the new universe's detail, where the members are
visible with their scores (flow step 3); no toast is raised, because the result
is on screen (`toast` contract). On `409 instrument_not_acquired` the dialog
stays open with the summary error *Could not create the universe: FactorFlow
doesn't follow MSFT, TSLA. Follow them on Data health, then try again.* naming
every unfollowed symbol, a link to the followed-stocks page (Section 0 names
the route under each shell), and the entered symbols intact: the whole request
is refused and nothing was created (system design constraint 13, DEC-0057),
while the parse step still reports malformed entries individually. On
`409 universe_name_in_use` the error attaches to the Name field. Symbols
normalise to upper case on blur, never while typing.

**Showing retired universes.** The lifecycle select applies on selection;
*Retired* with no retired universe renders the nothing-found state, not the
never-populated one.

**Opening a universe.** The name link follows to detail; middle-click opens a
new tab.

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton |
| Empty, never populated | *No universes yet. Create one by picking stocks, or save a result on Research.* with **New universe…** focused and a link to `/research` |
| Empty, nothing found | Lifecycle filter matches none: *No retired universes.* with a reset to *Active* |
| Partial | n/a: a universe is active or retired |
| Stale | n/a: not polled, read on demand; a set completing while here surfaces as a toast (Section 1.2) |
| Unavailable | n/a: no check runs here |
| Error | Header kept, body replaced by the operation, resource, reason and **Try again** |
| Unreachable | Shell state |

#### Token Usage

Table tokens as Section 1.1. `--secondary` on `--secondary-foreground` for the
retired marker; `--muted-foreground` for the count and a retired universe's
name; `--primary` on `--primary-foreground` for **New universe…**; `--popover`
and `--popover-foreground` for the dialog; `--input` and `--ring` for fields;
`--destructive` for field and summary errors; `--status-warning` for the
textarea's rejected-entry marker; `--text-base` inside the dialog.

#### Accessibility

The dialog is `role="dialog"` with `aria-modal`, focus trapped and returned to
**New universe…** on close. The textarea's accessible name is *Stocks to
include*, its counter and rejected list referenced by `aria-describedby`; the
summary error is an assertive live region (`form` contract). The name link's
accessible name is the universe name alone. The expander's name is *Show
details for Tech*. The lifecycle select's accessible name reads *Show: Active*.

### 1.4 Universe detail (`/research/universes/:universeId`, restyled)

One universe's members with their scores from the current set, the actions
that maintain it, membership as of a past date, and its event history. The
member view **is S03's results pane and inspector scoped to the universe**
(brief §2.4): AC-16 requires comparison to work both across all stocks and
within a universe, and the owner should not learn two tables.

#### Page Layout

Breadcrumb *Research › Universes › Tech*. Three stacked regions at `--space-5`:
a summary header `card` `summary`, the `tabs` `default` list with **Members**
and **History**, and the active tab's panel. The active tab is in the URL.

**The summary header** (`card` `summary`): the universe name as the page `h1`
(`--text-xl`), rendered as an inline rename (`form` `inline` with one `input`
`text` field and a **Rename** action, `button` `secondary`, that appears on
edit); beneath it a description list of Lifecycle (`badge` `secondary`
*Retired* with `retired_at` when retired; *Active* in text otherwise), Members
(whole number), Created (timestamp with zone) and Origin (the provenance line of
Section 1.3). The header's actions sit right: **Add stocks…** (`button`
`default`, the region's primary) and **Retire…** (`button` `secondary`). On a
retired universe both are absent and the header states *This universe is
retired. Its members and history stay viewable.*

**A universe saved from a result is a snapshot, and the header says so** (AC-2,
STD-UI-15). The Origin line reads as history, names the thresholds, the search
when one applied, the hide-incomplete state and the scores' date they were
evaluated against, and no
control re-evaluates it. A member whose score has since changed stays a member.

**The Members panel** is Section 1.1's three panes scoped to this universe
(`universe_id` on the list read): the Filters pane reduced to *Find a stock*,
the threshold sentences, hide-incomplete and **Clear filters** (no *Look in*:
the scope is the universe), the Results pane with the not-current banner, the
as-of line, the `data-table` `virtualised` table, the factor cells and the
selection tray, and the Inspector. Three differences: the results `h1` reads
*{n} of {m} members match* (the match count against the member count); there
is no **Save these {n} as a universe…**, because the save carries thresholds
only (system design v3 §4.2); and the table gains **Member since** (timestamp
with zone, `--text-xs`) after Name and an in-row **Remove…** (`button`
`ghost`, accessible name *Remove AAPL from Tech*) as the last cell. A member
the owner has stopped following stays in the table with `badge`
`status-neutral` *Not followed* on every factor (AC-15; DEC-0073); it is
neither omitted nor moved. An **As of** control sits at the Filters pane's
foot above **Clear filters**: a `form` `inline` with one `input` `text` field
labelled *Members as of*, accepting an ISO-8601 date, the honest control in a
design system with no date input (CAP-001 UX design §7). When the table shows a
past date, a line above it reads *Members as of 2026-09-30. Scores shown are
from the current set.* with **Show current members** (`button` `ghost`).

**The History panel** is a `data-table` `history`: Recorded at (timestamp with
zone), Event (*Created*, *Renamed*, *Stock added*, *Stock removed*, *Retired*),
Detail (the name or symbol, the symbol a link to
`/research/stocks/:symbol`), and, on `created`, `member_added` and
`member_removed` rows, a link *View members as of this event*, which opens the
Members tab with `as_of` set to that event's date. Newest first, keyset paged.
No event is ever missing, because none is deleted (AC-6).

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Summary header | `card` | `summary` | `design-system/components/card/design-spec.md` |
| Inline rename | `form` + `input` | `inline` + `text` | `design-system/components/form/design-spec.md`, `design-system/components/input/design-spec.md` |
| Rename; Retire… | `button` | `secondary` | `design-system/components/button/design-spec.md` |
| Retired universe | `badge` | `secondary` | `design-system/components/badge/design-spec.md` |
| Add stocks… | `button` | `default` | `design-system/components/button/design-spec.md` |
| Add stocks dialog | `dialog` + `form` + `textarea` | `standard` + `dialog` + `list` | `design-system/components/dialog/design-spec.md`, `design-system/components/form/design-spec.md`, `design-system/components/textarea/design-spec.md` |
| Add, with no stock or beyond the bound | `button` | `blocked` | `design-system/components/button/design-spec.md` |
| Retire confirmation; Remove confirmation | `dialog` | `confirm`, never `destructive` (blueprint §9) | `design-system/components/dialog/design-spec.md` |
| Members and History | `tabs` | `default`, active tab in the URL | `design-system/components/tabs/design-spec.md` |
| Members: Filters, Results and Inspector panes | as Section 1.1 | as Section 1.1 | as Section 1.1 |
| Member table | `data-table` | `virtualised`, with row checkboxes (S03 §4) | `design-system/components/data-table/design-spec.md` |
| Members as of | `form` + `input` | `inline` + `text` | `design-system/components/form/design-spec.md`, `design-system/components/input/design-spec.md` |
| Show current members | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Remove…, in row | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Remove…, on the sole member | `button` | `blocked` | `design-system/components/button/design-spec.md` |
| Not followed, on every factor of a stock no longer followed | `badge` | `status-neutral` (DEC-0073) | `design-system/components/badge/design-spec.md` |
| Event history | `data-table` | `history` | `design-system/components/data-table/design-spec.md` |
| View members as of this event; symbol in an event | link | n/a | `design-system/components/button/design-spec.md`, which directs navigation to a link |
| Added, removed, retired confirmations | `toast` | `success` (DEC-0076) | `design-system/components/toast/design-spec.md` |
| Not-current banner and as-of line | Section 1.2 | | |

#### Interaction Flows

**Adding stocks** (AC-4; routine). **Add stocks…** opens `dialog` `standard`,
title *Add stocks to Tech*, with the `textarea` `list` field alone; the confirm
**Add** renders `blocked` until one symbol parses and above 1000 symbols. On
`200` the dialog closes, the added stocks appear in the table with their
scores, and `toast` `success` *Added {n} stocks to Tech* confirms, with *, and
{m} were already members* when m > 0 (AC-4; DEC-0076). On
`409 instrument_not_acquired` the dialog stays open naming every unfollowed
symbol with the followed-stocks link and the entered list intact, as in Section
1.3. On `409 universe_retired` the dialog shows *This universe is retired and
can't be changed. Its members and history are still viewable.*

**Removing a stock** (AC-4, AC-6; consequential, blueprint §9, CAP-002
wording). **Remove…** opens `dialog` `confirm`, title *Remove AAPL from Tech*,
description *Its membership until today stays in the universe's history. Its
scores are not affected.*, confirm label **Remove from universe**, initial
focus on Cancel. It is `confirm`, never `destructive`: nothing is discarded
(STD-UI-2). On `200` the row leaves the current membership, the History tab
gains the event, `toast` `success` *Removed AAPL from Tech* confirms, and focus
returns to the row now occupying the removed row's position, or to the table
heading if it was last. **On the sole member** the action renders `blocked`
beside *This is the last member. Retire the universe instead.* with **Retire…**
adjacent (AC-5, flow "Maintain universes" step 6); `409 last_member` is the
backstop, keeping the dialog open with the error and a **Retire…** action
replacing the confirm.

**Renaming** (AC-4; routine). Activating the name opens the inline field with
the current name selected; `Enter` or **Rename** submits `PATCH`, `Esc`
cancels. On `200` the new name renders and nothing else changes; the History
tab shows a *Renamed* event. On `409 universe_name_in_use` the field error
names the conflict; empty after trimming is a field error. The maximum length
is open (Section 7).

**Retiring** (AC-4, AC-6; consequential). **Retire…** opens `dialog` `confirm`,
title *Retire Tech*, description *It leaves your active universes. Its members
and history stay viewable.*, confirm label **Retire universe**, initial focus
on Cancel. On `200` the header shows *Retired* with the timestamp, the actions
leave, `toast` `success` *Retired Tech* confirms, and the universe leaves the
active list. Never `destructive`.

**Viewing membership as of a date** (AC-6; routine). From an event, *View
members as of this event* opens the Members tab with `as_of` set to that
event's date; membership changes only at events, so this shows the membership
on that date and up to the next event. Typing an ISO-8601 date in *Members as
of* and pressing `Enter` is the second path. A date before creation renders
*Tech did not exist on 2026-01-01. It was created on 2026-10-15.*; a malformed
date is a field error stating the ISO-8601 shape (`422`). Scores shown for a
past membership are from the current set, and the label says so (STD-UI-15).

**Filtering, sorting, searching, selecting, checking, comparing, adding to a
universe and the set refresh** behave as Section 1.1, scoped to the universe.
**Compare side by side** routes to `/research/compare?symbols=` with the
checked members (2 to 6).

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton on the header, the as-of line and the member table at `member_count` rows; inspector skeleton |
| Empty, never populated | n/a for members: a universe has at least one member (AC-5). n/a for history: a `created` event always exists |
| Empty, nothing found | Members: thresholds or search match no member, *No members match these filters.* with **Clear filters**. History: n/a, no filter |
| Partial | Some members *Incomplete* on some factors; members no longer followed read *Not followed* (AC-15) |
| Stale | Score-set banner and as-of line as Section 1.2; a past `as_of` view is labelled with its date |
| Unavailable | A factor below 30 qualifying stocks, as Section 1.1 |
| Error | Header retained; the active panel's body replaced by the operation, resource, reason and **Try again**. `404 universe_not_found`: *No universe with this address exists.* with a link to Universes |
| Unreachable | Shell state |

#### Token Usage

`--card` and `--card-foreground` for the header, `--border` for its boundary,
`--muted-foreground` for description labels; Section 1.1's table, cell and
pane tokens; `--primary` on `--primary-foreground` for **Add stocks…**;
`--secondary` on `--secondary-foreground` for **Retire…** and **Rename**;
`--popover` for dialogs; `--input` and `--ring` for fields; `--destructive` for
field errors; `--foreground`, `--muted-foreground`, `--primary` and `--border`
for the tab list per the `tabs` specification.

#### Accessibility

The universe name is the page's `h1`, and the inline rename field's accessible
name is *Universe name*. Tabs are `tablist`, `tab`, `tabpanel` with the active
tab reflected in the URL and distinguished by weight and underline as well as
colour (`tabs` contract); the panes inside the Members tab are `section`s
labelled *Filters*, *Results* and *Selected stock* as on Research. Each dialog
traps focus and returns it to its trigger; the remove and retire dialogs'
confirm is never the initial focus. **Remove…** names its row, never a bare
*Remove* repeated per row. The as-of label above the table is a polite live
region so a screen reader learns the table changed date. Table semantics as
Section 1.1.

### 1.5 Compare (`/research/compare?symbols=`, restyled)

Two to six chosen stocks side by side with all three factors and the inputs
each was built from (AC-16; flow "Compare stocks and inspect the evidence"
steps 3 and 5; DEC-0070). Reached from the selection tray's **Compare side by
side** on Research or universe detail (S03 §6).

#### Page Layout

Breadcrumb *Research › Compare*. One `card` at full width (brief §2.5) holding
`h1` *Comparing {n} stocks* at `--text-lg`, the as-of line and banner of
Section 1.2 (no *sorted by* clause), an entry row and the comparison table. The
entry row is a `form` `inline` with one `input` `text` field labelled *Add a
stock* and an **Add** action (`button` `secondary`); `Enter` adds the typed
symbol as a new column and appends it to the URL.

**The comparison table is a composition, not a `data-table` variant** (brief
§2.5; `design-system/intake.md` step 1.3). It has no sorting, filtering or
pagination, and its records run across rather than down. It is a native
`<table>` with the `data-table` token set, `--font-numeric` in every value
cell, programmatic row and column headers, labelled *Comparison of {n} stocks*.
At six columns no horizontal scroll is needed on the design width; below it,
the first column pins and the rest scroll inside the table's own container.

**Columns**: a pinned row-header column, then one column per chosen stock in
the order chosen. Each stock's column header holds the symbol as a link to
`/research/stocks/:symbol`, the name, `badge` `status-neutral` *Not followed*
where the stock is no longer followed (DEC-0073), and a `button` `ghost` named
*Remove AAPL from comparison*.

**Rows**, in three row groups headed by the factor swatch and name in text
(blueprint §4.4: the swatch is identity; the `badge` factor variants are not
used, because every stock scores on all three):

| Group | Rows | Precision (DEC-0063) |
|-------|------|----------------------|
| Value | Percentile; Standardised score; Book-to-price; Earnings yield; Free-cash-flow yield | whole number; signed 2 dp; 2 dp; 2 dp; 2 dp |
| Growth | Percentile; Standardised score; Revenue growth; Earnings-per-share growth | whole number; signed 2 dp; signed % 2 dp; signed % 2 dp |
| Momentum | Percentile; Standardised score; 3-month total return; 6-month total return; 12-month total return | whole number; signed 2 dp; signed % 2 dp, each |

The percentile row renders the blueprint §4.4 cell (number, bar, *Possibly
restated* mark); the standardised score row renders in `--muted-foreground`
beneath it, because compare is an evidence page in §4.4's sense (brief §2.5).
Each row holds one quantity at one precision across every stock, so the
comparison axis is the row (STD-UI-3). Each input row's header carries a
disclosure (`button` `ghost`, `aria-expanded`, named *Show dates for
book-to-price*) that expands the row across every column to show the input's
`as_of` and `known_on` beneath each value (DEC-0078, kept from version 1), so
STD-UI-13's date is one interaction away without doubling the table's height.

**A stock incomplete on a factor keeps its column** (flow step 5). Its
percentile cell renders `badge` `coverage-absent` *Incomplete*, its
standardised score cell the em dash in `--value-missing`, and the factor's
input rows still show whatever input values exist, each with its own status
(DEC-0077), so the owner sees which input fell short. A factor below 30
qualifying stocks states *Not enough to rank · {n} qualified, 30 needed* once
in its group header and renders `badge` `coverage-unknown` *Not enough to rank*
in every percentile cell of that group, the em dash in the score cells. A stock
no longer followed renders `badge` `status-neutral` *Not followed* in every
percentile cell and the em dash beneath.

**Input status** (DEC-0077, PROVISIONAL): `present`, the value alone;
`missing`, the em dash in `--value-missing` followed by `badge`
`coverage-absent` *Missing*; `outdated`, the value followed by `badge`
`status-warning` *Outdated*; `not_computable`, the value or the em dash
followed by the status text *Couldn't be computed* in `--status-warning` with
the warning tier's triangle `aria-hidden`, as plain text because the display
label exceeds the badge's two words (badge specification §1, §7). The
*Possibly restated* mark sits beside each backfilled fundamental input
(`restated_possible`). Input values render in full (STD-UI-6).

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Page region | `card` | `default` | `design-system/components/card/design-spec.md` |
| Comparison table | composition on native `<table>` with the `data-table` token set (brief §2.5) | n/a | `design-system/intake.md` step 1.3; tokens per `design-system/components/data-table/design-spec.md` |
| Add a stock | `form` + `input` | `inline` + `text` | `design-system/components/form/design-spec.md`, `design-system/components/input/design-spec.md` |
| Add | `button` | `secondary`; `blocked` at six columns | `design-system/components/button/design-spec.md` |
| Remove from comparison; dates disclosure | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Symbol, opening evidence | link in the column header | n/a | `design-system/components/button/design-spec.md` |
| Factor cell, incl. the Possibly restated mark | composition, blueprint §4.4 (DEC-0075) | n/a | `design-system/intake.md` step 1.3 |
| Incomplete; Missing (input) | `badge` | `coverage-absent` | `design-system/components/badge/design-spec.md` |
| Not enough to rank | `badge` | `coverage-unknown` | `design-system/components/badge/design-spec.md` |
| Not followed | `badge` | `status-neutral` | `design-system/components/badge/design-spec.md` |
| Outdated (input) | `badge` | `status-warning` (DEC-0077) | `design-system/components/badge/design-spec.md` |
| Not-current banner and as-of line | Section 1.2 | | |

#### Interaction Flows

**Arriving.** From the selection tray, the symbols arrive in the query and the
table renders one read of `GET /api/classifications` with `symbols` for the
scores and one `GET /api/classifications/stocks/{symbol}` per column for the
input rows. The URL is the state, so the view can be linked and survives
reload.

**Adding a stock** (routine). `Enter` or **Add** appends the symbol within the
bound. A seventh is refused before the request: **Add** renders `blocked`
beside *A comparison holds up to 6 stocks.* (DEC-0070); `422` is the backstop.
`404 instrument_not_found` renders the field error *FactorFlow doesn't follow a
stock named XYZ.* and adds no column; a symbol already compared is a field
error naming it.

**Removing a stock.** The header's control drops the column and updates the
URL; focus moves to the next column's header, or to the entry field if none
remains. With one column left the table reads *Choose 2 to 6 stocks to
compare.* above the remaining column.

**Reading dates.** The disclosure on an input row's header expands that row
across every column; it collapses on the same control.

**The set refresh** (DEC-0062) reloads the table once, announced by the as-of
line, with the chosen symbols kept.

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton with one column per chosen symbol at final width |
| Empty, never populated | Fewer than two symbols in the URL: *Choose 2 to 6 stocks to compare. Check rows on Research or in a universe, or add a stock here.* with the entry field focused (brief §12.4). Never scored: Section 1.1's statement, with the chosen symbols kept in the URL |
| Empty, nothing found | A typed symbol is not followed: named in the field error; no column is added |
| Partial | A stock *Incomplete* on a factor shows it in that column with the input named (flow step 5); a stock no longer followed shows *Not followed* on every factor |
| Stale | Score-set banner and as-of line as Section 1.2 |
| Unavailable | A factor below 30 qualifying stocks: stated once in its group header, *Not enough to rank* in its cells |
| Error | Body replaced by the operation, resource, reason and **Try again**; the chosen symbols stay in the URL and the entry row stays rendered |
| Unreachable | Shell state |

#### Token Usage

Section 1.1's table, cell and badge tokens, including `--value-missing`,
`--value-indeterminate` and `--pattern-indeterminate`; row-group headers in
`--foreground` at `--text-lg` with the `--factor-*` swatch; the pinned column's
boundary in `--border`; `--secondary` on `--secondary-foreground` for **Add**;
`--status-warning` for *Outdated* and *Couldn't be computed*. No `--gain` or
`--loss` token.

#### Accessibility

Row headers (`<th scope="row">`) and column headers (`<th scope="col">`) are
both programmatic, because every cell's meaning depends on the quantity and the
stock; row-group headers are `<th>` spanning the row. The remove control and
the dates disclosure name their stock or input. Horizontal scroll, where it
occurs, is reachable by keyboard through the focusable table container. Every
status carries its word and a shape or pattern; the sign is in the text; the
*Possibly restated* mark exposes its words (DEC-0075).

### 1.6 Stock evidence (`/research/stocks/:symbol`, restyled)

One stock: its score per factor in the current set, every input with its value,
status and dates, the *Possibly restated* mark, the statement of what the check
does not cover, its universe memberships, and its scores in earlier sets
(AC-12, AC-13, AC-17, AC-18, AC-19, AC-23; flows "Compare stocks" step 4 and
"Understand and fix insufficient evidence"). Reached from the inspector's **See
every input and its date** (S03 §3).

#### Page Layout

Breadcrumb *Research › AAPL*. A reading screen capped at 1180 px (blueprint
§3.1). The page title is the symbol (`h1`, `--text-xl`, `--font-numeric`) and
the name, with `badge` `status-neutral` *Not followed* after the symbol where
it applies (DEC-0073); under it the as-of line and banner of Section 1.2 (no
*sorted by* clause) and the memberships line of Section 1.1 (*In Tech and
Dividend growers*, each a link). Then `tabs` `default` with **Now** and
**Earlier scores** (brief §2.6), active tab in the URL.

**The Now panel** is three `card` `summary` regions, one per factor, stacked at
`--space-5`, each written for the attributes of one entity (brief §2.6). Each
card's title is the swatch and the factor name as a real heading. Its first
block is the result: the blueprint §4.4 cell (percentile, bar, *Possibly
restated* mark) with the standardised score in `--muted-foreground` beneath it;
or `badge` `coverage-absent` *Incomplete* followed by the three-part statement
(STD-UI-19), *Value for KO couldn't be scored: its latest statement covers a
quarter that ended more than 6 months before 2026-10-15.* and the recovery,
*The next Complete or Partial download will try again.*; or, where the
provider holds no such data (flow step 5), *Value for KO couldn't be scored:
the provider reports no operating cash flow for KO.* with *No action in
FactorFlow changes this.* and no recovery offered, because none exists; or
`badge` `coverage-unknown` *Not enough to rank* with *Only {n} of 30 stocks
qualified on value in this set, so no stock was ranked on it.*; or `badge`
`status-neutral` *Not followed* with *Not followed since {date}. Earlier scores
stand.* (DEC-0073).

The card's second block is a description list of the factor's inputs in
product vocabulary (book-to-price, earnings yield, free-cash-flow yield;
revenue growth, earnings-per-share growth; 3-, 6- and 12-month total return),
one row per input, each with: the value at DEC-0063's precision; the input
status where it is not `present` (DEC-0077, PROVISIONAL: *Missing* as `badge`
`coverage-absent` with the em dash, *Outdated* as `badge` `status-warning`
beside the value, *Couldn't be computed* as plain text in `--status-warning`
with the tier's triangle `aria-hidden`); *As of* (the fiscal period end or
session date, unconverted); *Known on* (the date FactorFlow knew it); the
*Possibly restated* mark on each backfilled fundamental; and a disclosure
(`button` `ghost`, `aria-expanded`, named *Show how book-to-price was
computed*) to the component periods, sessions and corporate actions behind the
input and, where it is missing, the download outcome that left it so.

Below the three cards, once per screen in `--text-xs` `--muted-foreground`,
the STD-UI-18 statement (S03 §8): *A score is shown only when every input is
present and current. This checks presence and currency, not whether the
provider's values are correct.* And, when the mark appears anywhere on the
screen, the STD-UI-17 sentence beside the first occurrence: *Possibly restated:
the financials behind this score were downloaded for a period that had already
been reported before FactorFlow began following this stock, so they may
reflect later restatements.*

**The Earlier scores panel** is a `data-table` `history` of the stock's
classifications in earlier sets, newest first: Scores date, Download (its
start time, linked to its detail, with its outcome badge; DEC-0083), then
Value, Growth and Momentum as blueprint §4.4
cells with the standardised score in `--muted-foreground` beneath the
percentile and the *Possibly restated* mark where it applied. Each row is one
set's complete result for the stock as recorded; a backfill observed later
never alters an earlier row (AC-19), and the panel says so once above the
table: *Each row is what was known when that set was produced. Later data does
not change it.*

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Now and Earlier scores | `tabs` | `default`, active tab in the URL | `design-system/components/tabs/design-spec.md` |
| Per-factor evidence group | `card` | `summary` | `design-system/components/card/design-spec.md` |
| Factor result cell, incl. the Possibly restated mark | composition, blueprint §4.4 (DEC-0075) | n/a | `design-system/intake.md` step 1.3 |
| Incomplete (factor); Missing (input) | `badge` | `coverage-absent` | `design-system/components/badge/design-spec.md` |
| Not enough to rank | `badge` | `coverage-unknown` | `design-system/components/badge/design-spec.md` |
| Not followed | `badge` | `status-neutral` (DEC-0073) | `design-system/components/badge/design-spec.md` |
| Outdated (input) | `badge` | `status-warning` (DEC-0077) | `design-system/components/badge/design-spec.md` |
| Input detail disclosure | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Earlier scores | `data-table` | `history` | `design-system/components/data-table/design-spec.md` |
| Memberships; the download's start time (DEC-0083) | link | n/a | `design-system/components/button/design-spec.md`, which directs navigation to a link |
| Not-current banner and as-of line | Section 1.2 | | |

#### Interaction Flows

**Reading the evidence** (AC-17). No interaction is required for the primary
judgement: each card's first block states whether the stock is scored on that
factor and, if not, which input fell short and what made it so (flow
"Understand and fix" step 2). Values and dates are in the list beneath;
component periods and the download outcome are one disclosure away (STD-UI-13
inline for the input, one interaction away for its components).

**Fixing insufficient evidence** (flow steps 3 to 5). Where the recovery is
another download, the statement names it and links to Data health (Section 0
names the route under each shell); CAP-002 never starts a download itself
(capability §5.2). After the next qualifying download the as-of line announces
the new set and the panel reloads once (DEC-0062); the earlier *Incomplete*
result remains under Earlier scores (AC-18). Where the provider holds no such
data, the statement says so and offers nothing.

**Reading earlier scores** (AC-18). The tab loads on first activation and
stays mounted; the download link opens the download's detail. Paging follows
the `data-table` contract with keyset cursors.

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton matching the three cards' final layout, so the page does not resize |
| Empty, never populated | `set: null`: *AAPL has no score yet because no stocks have been scored.* with the first set's *Updating* or *Score update failed* and its reason from `later` (DEC-0082), the latest download's state and a link to Data health (AC-20, AC-22). Earlier scores: *No earlier scores for AAPL.*, distinct from never scored |
| Empty, nothing found | n/a: no filter on either panel |
| Partial | Some factors scored, some *Incomplete*; each incomplete factor names its input (AC-12) |
| Stale | Score-set banner and as-of line as Section 1.2 |
| Unavailable | A factor below 30 qualifying stocks: stated in that factor's card with the count |
| Error | Title and as-of line retained; the active panel replaced by the operation, resource, reason and **Try again**. `404 instrument_not_found`: *FactorFlow doesn't follow a stock named XYZ.* with a link to the followed-stocks page |
| Unreachable | Shell state |

#### Token Usage

`--card` and `--card-foreground` for each factor card, `--border` for its
boundary, `--muted-foreground` for list labels, the standardised score, the
STD-UI-18 statement and the restatement explanation; `--font-numeric` for every
value and date; the factor cell's `--factor-*`, `--seq-4` on `--seq-1`;
`--value-missing` on `--value-missing-muted` for *Incomplete* and *Missing*;
`--value-indeterminate` with `--pattern-indeterminate` for *Not enough to
rank*; `--status-neutral` on `--status-neutral-muted` for *Not followed* and the
mark; `--status-warning` on `--status-warning-muted` for *Outdated*,
`--status-warning` for *Couldn't be computed*; tab tokens per the `tabs`
specification; history table tokens as Section 1.1.

#### Accessibility

Each card title is a real heading (`h2`) under the symbol's `h1`, so the page
outline reads Symbol, Value, Growth, Momentum. The description lists are
`<dl>` with the input name as `<dt>`. Every status carries its word and a shape
or pattern; a missing input is distinguishable from a measured zero and from a
factor that could not be ranked in greyscale. The detail disclosure carries
`aria-expanded` and names its input. Tabs follow the `tabs` contract; the
history table has programmatic headers; the factor cells follow S03 §9.

## 2. Cross-Screen Navigation

One rail destination, Research, and five routes under it (blueprint §2.1, §2.2;
DEC-0068). Every navigation is a link, never a button, so middle-click and
open-in-new-tab work (`button` specification); **See every input and its date**
is rendered as a link styled `outline`.

**After a download** (flow "See stocks classified"). The owner opens Research
from the rail. If a set is building, the banner says so and the screen
refreshes once when it completes (DEC-0062). The download's start time in the
as-of line (DEC-0083) crosses into the download's detail (CAP-001's run detail
meanwhile, blueprint
`/data/downloads/:id` once the shell capability lands); nothing crosses back
except the rail.

**Research to Compare and back.** Check rows, **Compare side by side**, and
`/research/compare?symbols=` opens with the symbols in the query. The browser's
back returns to Research with sort, thresholds, scope, hide-incomplete and
search restored from the URL (S03-5). Compare's column-header symbol links open
evidence.

**Research to Universes.** **Save these {n} as a universe…** and **Add to
universe…** confirm by `toast` `success` linking to the universe's detail
(DEC-0076); *Look in* scopes Research to a universe in place without leaving
it; the inspector's memberships line links to each universe's detail. The two
paths exist because one reads a universe among all stocks and the other
maintains it.

**Universe detail to evidence and Compare.** The inspector's **See every input
and its date** and the History tab's symbol links open evidence; the tray's
**Compare side by side** opens Compare with the checked members. *View members
as of this event* stays on the screen and switches tab with `as_of` set.

**Evidence to Data health.** Every recovery statement that names the next
download links to Data health (CAP-001's Runs meanwhile), because the owner's
fix for insufficient evidence is a download (flow "Understand and fix" step 3),
which CAP-002 never starts itself (capability §5.2). The memberships line links
back to universes.

**Refusals that name another screen.** `409 instrument_not_acquired` links to
the followed-stocks page (`/data/followed`; CAP-001's Instruments meanwhile),
where the owner follows the stock (flow "Build a universe by hand" step 4);
`never_classified` links to Data health. CAP-002 never edits the followed list
and never starts a download.

**The command palette** (blueprint §3.4) opens a stock's evidence or a
universe's detail from anywhere once the shell capability delivers it; CAP-002's
routes are built to be its targets and add nothing to it.

**Unreachable.** When the API does not answer, the shell's designed state takes
every CAP-002 route exactly as it takes CAP-001's, with the rail still rendered
(blueprint §3.5). CAP-002 adds nothing to it (AGT-SCOPE-002).

## 3. Component-Spec Gaps

| UI Element | Source Reference | Suggested Slug | Intake Reference |
|------------|-----------------|----------------|------------------|
| none | | | `design-system/intake.md` |

**No gap remains.** Version 1 recorded one, a numeric threshold filter in the
`data-table` toolbar. S03 §3 places the thresholds in the Filters pane as
sentences built from `select` `inline` and `input` `numeric` (blueprint §4.7,
the sentence builder), so thresholds are not a table-toolbar variant and the
gap is resolved by the approved layout, not by a design-system change (brief
§4). The STD-UI-30 partial version 1 inherited from CAP-001 is also closed: the
`data-table` `virtualised` variant added on 2026-10-15 carries windowed rows
with server-side sort, filter and count (blueprint §13), and Sections 1.1 and
1.4 use it. The one component-contract conflict the blueprint carried, the
*Possibly restated* badge with an accessible-name override (review v4
FINDING-56), is resolved as a composition inside the §4.4 factor-cell pattern
(DEC-0075, PROVISIONAL), which `design-system/intake.md` step 1.3 places in
this document; the owner may prefer a mark component through intake instead,
and the record says so.

**Compositions this design specifies**, built once in
`web/src/components/patterns/` and reused, each from existing components and
tokens (blueprint §4; intake step 1.3): the factor cell with the restatement
mark (§4.4; DEC-0075), the inspector panel (§4.5), the selection tray (§4.6),
the as-of line (§4.8; DEC-0073), the not-current banner (S03 §3, §4), and
CAP-002's side-by-side comparison table (Section 1.5). The shell (§3) and the
command palette (§3.4, `command`) are the shell capability's.

**Six components are deliberately unused**, recorded so a reviewer does not
look for them (brief §4): `chart`, because the capability commits to no chart
and the system design §4.3 records `lightweight-charts` as unused (STD-UI-9,
STD-UI-27 and STD-UI-28 not applicable); `command`, the shell's; `progress`,
because a building set reports no progress and nothing honest could be drawn;
`stepper`, `radio-group` and `toggle-group`, which serve milestones CAP-002
does not deliver. Of the used components, the `badge` factor variants `value`,
`growth` and `momentum` are not used (they tag a record as one kind of stock;
factor identity is the header swatch), `badge` `outline` for the restatement
mark is superseded by §4.4 and DEC-0075, `dialog` `destructive` is not used
(no destructive action exists), `input` `percentage` is not used (a percentile
is a rank, STD-UI-2), and `data-table` `expandable` is used only for the
universes list, never for a list that can reach 3000 rows.

**Version 1's disagreement with the brief on `toast` is withdrawn.** Version 1
used no toast because every suggested use reported a result visible on screen.
The brief v2 and DEC-0076 require explicit completion confirmation for saves
and adds (STD-UI-24; review v4 FINDING-42), whose result is on another route,
so this version uses `toast` `success` there, `toast` `info` and `error` for a
set that completes or fails while the owner is on the unscored universes list,
and still no toast where the result is in view (creating a universe routes to
its detail).

## 4. EDG Compliance

STD-UI §1.2 makes the standard normative and `edg-compliance` advisory beneath
it; the three departures STD-UI declares (six tiers reconciled to three levels,
the kill switch without confirmation, screen-reader certification exempt as a
gate) and the error-code exemption of its §2.3 are intended and are not
re-raised here. The checklist's navigation item, *no new top-level navigation
items without EDG review*, is exempted by STD-UI §2.3; the one destination
added is the blueprint's own (§2.1).

| Check | Status | Notes |
|-------|--------|-------|
| Consistency with product patterns | pass | S03 is delivered as approved, with its three panes, components, copy, states, accessibility and acceptance checks; the three other pages are restyled into the blueprint's §3 shell with the §4 patterns, §7 labels, §8 status map and §9 tiers, and compose into the delivered CAP-001 shell meanwhile with one appended destination (DEC-0069). Departures from S03 are recorded with their reasons: the search field (DEC-0074), the renderings S03 leaves unspecified (DEC-0073, DEC-0077), the control placements it leaves open (DEC-0078), the restatement mark's composition (DEC-0075), and the download named by its start time where S03 §3 prints *from download #{n}*, because nothing numbers downloads (DEC-0083, Section 7); the M2 controls are absent, not disabled. The threshold rule is S03-1's own: a threshold removes no stock incomplete on the factor, so S03-1 is satisfied without exception and no departure is recorded for it (DEC-0081; review v2 FINDING-6). `blocked` not disabled; `confirm` not `destructive`; link not button for navigation; rows dimmed on refresh; polled regions announce politely and show *checked {time}* |
| Progressive disclosure | pass | Blueprint principle 4 and S03: the row answers "how does this stock score" with three percentiles; the standardised score, the inputs' as-of dates and the reasons are one selection away in the inspector; the full inputs one link away on evidence; component periods one disclosure further. A factor below 30 is stated once in its header. Thresholds are sentences in one pane. Compare shows percentiles first, standardised scores beneath, dates behind a disclosure. The set history is behind one control |
| Error clarity | pass | Every refusal in Sections 1.1 to 1.6 names the operation, the stock or universe and the reason, and offers the recovery where one exists and says when none does (STD-UI-19): follow the stock on Data health, review and save again, retire instead, wait for the next download. The error envelope's `code` selects the wording and `message` is never shown raw; no payload key, exception or status code reaches the owner (STD-UI-1) |
| Accessibility | pass | WCAG 2.1 AA per STD-UI-24, specified per screen and by S03 §9: labelled `section`s, programmatic row and column headers wherever a cell's meaning depends on both, `aria-sort` and `aria-selected`, polite announcement of every polled or refreshed change and of the tray, focus managed on dialogs and disclosures, accessible names that identify the row and read as the blank, `blocked` controls that stay focusable, every status in words plus shape or pattern, the restatement mark's words exposed (DEC-0075), no colour encoding polarity (DEC-0060). Enforcement is human review, which the standard and tech stack acknowledge |
| States and feedback (empty, loading, error, success, partial) | pass | All five, plus stale, unavailable and unreachable (STD-UI-23), enumerated per screen with inapplicable ones reasoned; S03 §7 governs Research. Never-scored and nothing-found are distinct everywhere both can occur (AC-22); stale is the marked not-current set (AC-20), and the never-populated state shows a first set building or failed from the same `later` block (DEC-0082); unavailable is the factor below 30 (AC-14); success is confirmed by `toast` where the result is on another route (DEC-0076) and is visible on screen otherwise; a building set has no progress indicator because none can be honest, and carries its start time instead |

## 5. Traceability

Every capability acceptance criterion, then S03's seven acceptance checks, then
the status tier table.

| AC ID | Capability AC | UX Design Element | Component + Variant |
|-------|---------------|-------------------|-------------------------|
| AC-1 | Universe by hand; no unfollowed stock | 1.3 create dialog with bulk entry; `409 instrument_not_acquired` refusing the whole request with every symbol named and a followed-stocks link; 1.1 and 1.4 **Add to universe…** from checked rows | `dialog` `standard` + `form` `dialog` + `input` `text` + `textarea` `list`; `button` `blocked`; `select` `default` |
| AC-2 | Universe from a filter, membership fixed | 1.1 **Save these {n} as a universe…** posting the one filter the list was read with (the twelve bounds, `hide_incomplete`, the *Find a stock* prefix) and `set_id`, so the members are exactly the header's count (system design v3 §4.2; DEC-0076, DEC-0081); `409 classification_set_changed` handling; 1.3 and 1.4 Origin line read as history, naming the search when one applied, no re-evaluation | `button` `outline`; `dialog` `standard` + `form` `dialog`; `toast` `success`; `card` `summary` |
| AC-3 | Several universes; a stock in many | 1.3 list of universes; 1.1 *Look in* listing every active universe; 1.1 and 1.6 memberships line naming several; no exclusivity anywhere | `data-table` `expandable`; `select` `inline` |
| AC-4 | Add, remove, rename, retire; rename keeps history | 1.4 **Add stocks…**, **Remove…**, inline rename, **Retire…**; the *Renamed* event in History; already-member stocks reported, never errored | `button` `default` / `ghost` / `secondary`; `dialog` `standard` / `confirm`; `form` `inline` + `input` `text`; `data-table` `history`; `toast` `success` |
| AC-5 | No empty universe; last member not removable | 1.3 **Create** `blocked` until one symbol; 1.1 **Save these 0 as a universe…** `blocked` (DEC-0076); 1.4 **Remove…** `blocked` on the sole member with **Retire…** adjacent; `422 empty_universe` and `409 last_member` backstops | `button` `blocked` |
| AC-6 | Membership history; members on any past date | 1.4 History tab, *View members as of this event*, *Members as of* date entry, as-of label; removal and retirement worded as keeping history | `data-table` `history`; `form` `inline` + `input` `text`; `dialog` `confirm` |
| AC-7 | Factor definitions | 1.5 and 1.6 name exactly the defined inputs per factor in product vocabulary; 1.1 inspector names them per factor | composition; `card` `summary` |
| AC-8 | One peer set | 1.1 and 1.4 render the same per-stock score whether scoped or not; *Look in* changes which rows, never their values; S03 §3 helper and §8 footnote say "of the stocks scored on this factor" | `data-table` `virtualised`; `select` `inline` |
| AC-9 | Standardised score and percentile | 1.1 percentile in the factor cell, standardised score in the inspector (blueprint §4.4); a stock incomplete on one factor keeps its row and its other percentiles under any threshold (DEC-0081); 1.5 both as rows; 1.6 both in the result block; DEC-0063 precision | composition (factor cell); `card` `summary` |
| AC-10 | Automatic refresh; never after failed, cancelled, abandoned | 1.2 polls and refreshes once on completion without owner action (DEC-0062); the download outcome shown on the as-of line is only *Complete* or *Partial*; the failed banner names the next download as the retry | composition (as-of line); `badge` `status-good` / `status-warning` |
| AC-11 | Up to date within 5 minutes for 3000 stocks | 1.1 and 1.4 `virtualised` table over keyset pages; 1.2 10-second poll while building so completion is seen within the budget; *Find a stock* for STD-UI-30 (DEC-0074) | `data-table` `virtualised`; `input` `text` |
| AC-12 | Like for like only; missing or outdated input named | 1.1 *Incomplete* cell with the reason tooltip and inspector sentence naming the input, the row kept under a threshold on that factor until hidden (S03-1; DEC-0081); 1.5 column kept with status and input; 1.6 three-part statement per factor (DEC-0072) | `badge` `coverage-absent`; `card` `summary` |
| AC-13 | Outdated inputs | 1.6 statement naming the 6-month rule against the scores' date, or the latest-trading-day rule, with the input's *As of*; *Outdated* on the input (DEC-0077); 1.2 the current-stock count's meaning for S01 and S09 (DEC-0071) | `badge` `status-warning`; `card` `summary` |
| AC-14 | Enough stocks to rank | 1.1 and 1.4 column header *{n} qualified, 30 needed* and every cell *Not enough to rank*; 1.5 group header; 1.6 card statement (S03-4) | `badge` `coverage-unknown` |
| AC-15 | Retired stocks | 1.1 under a universe scope, 1.4, 1.5 and 1.6 *Not followed* on every factor with *Not followed since {date}. Earlier scores stand.*; member kept in its universe; not listed under *All followed stocks* (DEC-0073) | `badge` `status-neutral` |
| AC-16 | Sort, filter, side by side; all stocks or one universe | 1.1 sortable factor columns, threshold sentences, *Look in*, selection tray; 1.4 the same panes scoped to the universe; 1.5 Compare at 2 to 6 (DEC-0070) | `data-table` `virtualised`; `select` `inline`; `input` `numeric`; `checkbox` `default`; `button` `outline` / `blocked`; composition (tray, comparison) |
| AC-17 | Evidence behind a result | 1.1 inspector line per factor naming the inputs and their as-of (S03-3); 1.6 per-input value, status, *As of*, *Known on*, detail disclosure; 1.5 dates disclosure | `card` `summary`; `button` `ghost`; composition |
| AC-18 | Classification history, never overwritten | 1.6 Earlier scores tab, newest first, each row one set's result; 1.1 and 1.6 *Earlier scores stand.* for a stock no longer followed | `tabs` `default`; `data-table` `history` |
| AC-19 | No backdating | 1.6 Earlier scores statement that later data does not change a row; *Known on* shown per input; 1.2 set dated by production | `data-table` `history`; `card` `summary` |
| AC-20 | Previous set while not current; failure shown | 1.2 banner from the `later` block: *Not reflecting the latest download* while a later set builds, *Score update failed {time}: {reason}* when the attempt failed, the previous set kept on screen in both (DEC-0072, DEC-0073); 1.1 and 1.6 never-populated state showing a first set as *Updating* or *Score update failed* with its reason, polled from first load (DEC-0082) | `badge` `status-warning` / `status-active` / `status-critical` inside `card` `default` |
| AC-21 | Classification currency | 1.2 as-of line *Scores from {date} {time} {zone} · from the download started {date} {time} {zone}*, the start time linked to the download's detail, with the outcome badge; set history dialog naming each set's download the same way (DEC-0073, DEC-0083) | composition (as-of line); link; `dialog` `standard`; `data-table` `history` |
| AC-22 | Honest empty state | 1.1, 1.5 and 1.6 never-scored statements with the first set's state from `later` (*Updating*, or *Score update failed* with its reason), the latest download's state and a Data health link, replacing the body, polled from first load so the first scores appear without a reload (DEC-0082); distinct from nothing-found on every screen (S03 §7) | `data-table` empty state; composition |
| AC-23 | Restatement mark | 1.1, 1.4, 1.5 and 1.6 *Possibly restated* on every percentile that carries it, lists, inspector, compare, evidence and history; on each backfilled input; its meaning stated once per screen (S03-6; DEC-0075) | composition (factor-cell mark with `status-neutral` tokens) |

**S03 acceptance checks** (S03 §10), each satisfied by this design:

| Check | S03 text | UX Design Element |
|-------|----------|-------------------|
| S03-1 | A stock with any incomplete factor is listed unless *Hide stocks with an incomplete score* is on | 1.1 Filters: `checkbox` *Hide stocks with an incomplete score*, default off, mapping to `hide_incomplete` (default false); 1.1 table lists incomplete stocks with *Incomplete* cells; a threshold on a factor excludes only stocks classified on that factor that fail it, so an incomplete stock stays listed and counted until the checkbox is on (system design v3 §3.3 step 15; DEC-0081). Satisfied without exception; version 2 traced it while its threshold rule contradicted it (review v2 FINDING-6) |
| S03-2 | The match count reflects the full set, not the loaded page | 1.1 `h1` *{n} stocks match* from `match_count`, computed server-side over the whole filtered set (system design v3 §3.3 step 15), counting the incomplete stocks the thresholds leave listed and only the stocks a search matched (DEC-0081) |
| S03-3 | The inspector shows the as-of date for each factor's inputs | 1.1 Inspector, one line per factor naming the inputs and their as-of and known-on dates from `GET /api/classifications/stocks/{symbol}` |
| S03-4 | A factor with fewer than 30 qualifying stocks shows no percentile for any stock | 1.1 every cell in that column *Not enough to rank*, header *{n} qualified, 30 needed*, sort control removed; 1.4, 1.5, 1.6 likewise |
| S03-5 | Filters, sort and scope survive reload and back navigation (URL state) | Section 0 and 1.1: thresholds, scope, hide-incomplete, search and sort in the URL query; checked rows client state |
| S03-6 | A *Possibly restated* mark shows on the percentile in the results table and in the inspector wherever the classification carries it | 1.1 factor cell and inspector block carry the mark (DEC-0075); also 1.4, 1.5, 1.6 |
| S03-7 | **Save these {n} as a universe…** saves every matching stock, not only the loaded page, and the universe keeps those members afterwards | 1.1 the save posts the filter the list was read with (the twelve bounds, `hide_incomplete` and the *Find a stock* prefix) and `set_id`; the server snapshots every matching stock with the list's predicate, incomplete ones included unless hidden, only the stocks a search matched when one is active, so the members are exactly the header's count (system design v3 §4.2; DEC-0076, DEC-0081; review v2 FINDING-5); 1.4 Origin line shows the snapshot as history, the search named when one applied |

**Status tier table** (STD-UI-12; brief §12.2), reproduced because this design
is where it is rendered. The blueprint governs where it names the state
(DEC-0072); DEC-0059 stands where it does not; one state is CAP-002's
(DEC-0073). Per-factor presence is STD-UI-14's and rendered with the `badge`
coverage variants, listed for completeness. Per-input status on evidence and
compare is DEC-0077's.

| State | Display label | Tier | `badge` variant | Rendered in |
|-------|---------------|------|-----------------|-------------|
| A later set is building (`later.state` building, the first set included) | *Updating* | active | `status-active` | 1.2 as-of line; 1.1 and 1.6 never-populated state (DEC-0082); set history |
| The shown set does not reflect the latest download | *Not reflecting the latest download* | warning | `status-warning` | 1.2 banner |
| The latest attempt failed (`later.state` failed, the first set included) | *Score update failed* | critical | `status-critical`, with the reason | 1.2 banner; 1.1 and 1.6 never-populated state (DEC-0082); set history (*Failed*) |
| Download the set reflects: `succeeded` / `partial` | *Complete* / *Partial* | good / warning, never good | `status-good` / `status-warning` | 1.2 as-of line; set history |
| Factor scored (`classified`) | the percentile and bar | none | none | 1.1, 1.4, 1.5, 1.6 |
| Factor not scored (`not_classified`) | *Incomplete* | presence: absent (STD-UI-14) | `coverage-absent` | 1.1, 1.4, 1.5, 1.6 |
| Factor below 30 qualifying stocks (`not_enough_stocks`) | *Not enough to rank* | presence: not determinable (STD-UI-14) | `coverage-unknown`, header *{n} qualified, 30 needed* | 1.1, 1.4, 1.5, 1.6 |
| Stock the owner stopped following (`retired`) | *Not followed* | neutral, never a fault | `status-neutral` | 1.1 (universe scope), 1.4, 1.5, 1.6 |
| Input `missing` | *Missing* | presence: absent (STD-UI-14) | `coverage-absent` (DEC-0077) | 1.5, 1.6 |
| Input `outdated` | *Outdated* | warning | `status-warning` (DEC-0077) | 1.5, 1.6 |
| Input `not_computable` | *Couldn't be computed* | warning | plain text with the tier's triangle, `--status-warning` (DEC-0077) | 1.5, 1.6 |
| Retired universe | *Retired* | none (lifecycle, not status) | `secondary` | 1.3, 1.4 |
| Percentile carrying the restatement mark | *Possibly restated* | neutral | composition with `status-neutral` tokens (DEC-0075) | 1.1, 1.4, 1.5, 1.6 |

## 6. Source Mapping

| Source | Reference | Verification Method | Date |
|--------|-----------|---------------------|------|
| Research screen specification `PRODUCT-UX-S03` v4 (approved) | `docs/ux/screens/S03-research.md` | Text reference. The starting layout for Section 1.1: §3 layout to the Filters, Results and Inspector regions; §4 component mapping reproduced; §5 view model mapped to the reads; §6 interactions; §7 states; §8 copy verbatim; §9 accessibility; §10 checks traced in Section 5; §11 canvas differences honoured | 2026-10-16 |
| Product UX blueprint `PRODUCT-UX` v6 (approved) | `docs/ux/product-ux-blueprint.md` | Text reference. §0 how a design uses it; §2.1, §2.2 destination and routes (Section 0, Section 2); §3 shell and §3.5 (Section 0, Section 1.2); §4.4 factor cell, §4.5 inspector, §4.6 tray, §4.7 sentence builder, §4.8 as-of line, §4.10 states (Sections 1.1, 1.2); §7 vocabulary throughout; §8 status map (Section 5); §9 action tiers (Sections 1.1, 1.4); §10 the M1 row; §12 D-8 (Section 0); §13 `checkbox`, `data-table` `virtualised` | 2026-10-16 |
| Home `PRODUCT-UX-S01` v4 and Data health `PRODUCT-UX-S09` v4 | `docs/ux/screens/S01-home.md`, `docs/ux/screens/S09-data-health.md` | Text reference. S01 §3, §5, §7, S01-6 and S09 §3, §5, §11 read for what the summary read must mean (Section 1.2); not designed here | 2026-10-16 |
| Canvas source for S03 | `docs/ux/design-source/P03-Research.dc.html` | Text reference, through S03 §11: the specification wins on the banner, the mark, the saved-screens controls and the threshold measures; no element was taken from the canvas directly | 2026-10-16 |
| UX brief v3 | `docs/capabilities/CAP-002-universe-and-factor-classification/design/ux-brief.md` | Text reference. §1 screens and routes; §2.1 the ten items CAP-002 adds to S03 and §2.2 to §2.6 the restyled pages, all implemented, with items 1, 3 and 6, §2.2, §3 and §9 as version 3 revised them for review v2 FINDING-5, 6 and 8 (the prefix in the saved filter, the threshold rule, the download named by its start time); §4 components; §5 constraints; §6 accessibility; §12 conformance, tier table and eight-state table honoured | 2026-10-17 |
| Capability CAP-002 v1 | `docs/capabilities/CAP-002-universe-and-factor-classification/Capability-CAP-002.md` | Text reference. All 23 acceptance criteria traced in Section 5; six flows walked in Sections 1 and 2; §5.4 conformance mirrored | 2026-10-16 |
| System design v3 | `docs/capabilities/CAP-002-universe-and-factor-classification/design/system-design.md` | Text reference. §3.3 read flow (steps 13 to 18: the `set` and `later` blocks and polling from first load, the never-populated state, `match_count`, the filter as one object of twelve bounds, `hide_incomplete` and the `symbol` prefix with its three rules, compare 2 to 6, memberships, the summary read, the current-stock rule and the download named by its start time); §4.2 interfaces (`POST /api/universes` with the filter and `origin`, the list and summary rows, `run_started_at`), error codes, bounds and screen registration; §4.4 `filter_provenance`; constraint 18 poll cadence; §8 questions 4, 10 and 11 and the abstentions carried in Section 7 | 2026-10-17 |
| Specification review v2 | `docs/capabilities/CAP-002-universe-and-factor-classification/specifications-review-report-v2.md` | Text reference. Findings Summary Table rows FINDING-5 to FINDING-8 and the UX Design section; the four findings applied in version 3 exactly as the consistency pass fixed them (DEC-0081 to DEC-0083); its other findings on this design (FINDING-9, 11, 25, 26, 32) carried, not fixed | 2026-10-17 |
| STD-UI v6 | `docs/constitution/standards/ui-conventions.md` | Text reference. Approved 2026-10-16; all 30 rules read; STD-UI-1 v6 display labels applied to every user-visible string; those governing this design cited where they decide something | 2026-10-16 |
| UX specifications review v4 | `docs/ux/specifications-review-report-v4.md` | Text reference. Open S03 findings acted on: FINDING-22 (DEC-0074), 23 (DEC-0073), 42 and 55 (DEC-0076), 45 (holdings line M2, absent), 56 (DEC-0075), 57 (S03 §11 honoured); FINDING-54 is M2's (Section 7); FINDING-32 is DEC-0071's | 2026-10-16 |
| CAP-001 UX design v5 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-design.md` | Text reference. The delivered shell composed into meanwhile (Section 0); `confirm` not `destructive`; `blocked` not disabled; link not row click; no date input; polled regions announce politely | 2026-10-16 |
| CAP-001 component design: owner web app v4 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/component-design-owner-web-app.md` | Text reference. Composition seams `shell.tsx` and `routes.tsx`, `ScreenState` union, windowed rendering over keyset pages, desktop only, `/runs/:runId` | 2026-10-16 |
| Component specifications | `design-system/components/` | Text reference. All 18 read; 12 used (`data-table`, `checkbox`, `select`, `input`, `badge`, `card`, `dialog`, `button`, `form`, `textarea`, `tabs`, `toast`), 6 unused with reasons in Section 3; every variant named exists in its specification, checked mechanically | 2026-10-16 |
| Theme tokens | `design-system/theme.css` | Text reference. Every token named in this design verified to exist, checked mechanically; no literal introduced; the page-ground alpha is STD-UI-29 A-5's case | 2026-10-16 |
| Component map and intake | `design-system/component-map.json`, `design-system/intake.md` | Text reference. Null Figma file key and empty map, so no frame to cite; intake step 1.3 applied to the six compositions | 2026-10-16 |
| UX pipeline note | `docs/ux/README.md` | Text reference. The UX design starts from the matching screen spec and delivers the regions it assigns to the capability's milestone | 2026-10-16 |
| Decision records read | `projects/factorflow-v2/decisions/DEC-0054.md`, `DEC-0057.md`, `DEC-0059.md` to `DEC-0063.md`, `DEC-0068.md` to `DEC-0076.md`, `DEC-0079.md`, `DEC-0081.md` to `DEC-0084.md` (harness repository) | Text reference. Poll cadence and universe semantics; tier mapping where not superseded, no polarity colour, refresh-once, precision; routes and destination, interim composition, compare bound, read surface; blueprint labels and tiers, the renderings S03 leaves unspecified, the search field, the mark composition, the save rules; DEC-0079 (a), (b) for `hide_incomplete` and scope, (e) as superseded; DEC-0081 (the threshold rule, from the approved S03, superseding DEC-0071 and DEC-0076 on that point), DEC-0082 (one `set` plus `later` shape, polling from first load; PROVISIONAL), DEC-0083 (a download named by its start time; PROVISIONAL, superseding DEC-0079 (e)), DEC-0084 (the delivered files CAP-002 edits; cited in Section 0, bears on the system design and the component designs) | 2026-10-17 |
| Decision records written by this design | `projects/factorflow-v2/decisions/DEC-0077.md`, `DEC-0078.md` (harness repository) | Version 2: per-input status renderings on evidence and compare; the control placements S03 leaves open (both PROVISIONAL). Version 3 records none: every resolution it applies is the system design v3's | 2026-10-17 |

No Figma frame, image or diagram was used. This is the Path B automated design.

## 7. Open Questions

Decisions this design rests on are not listed here; they are DEC-0059 (where
not superseded), DEC-0060, DEC-0062, DEC-0063, DEC-0068 to DEC-0078 and, from
the system design v3, DEC-0081 to DEC-0083, cited
where they apply. The owner upholds or reverts each with
`scripts/sdd decisions`. What follows is what no artifact derives, and what is
now closed.

- **Closed: the maximum number of stocks compared side by side.** Version 1
  abstained with the API's `MAX_PAGE_SIZE` as the only bound. S03 §6
  (approved) fixes **Compare side by side** at 2 to 6 checked rows; DEC-0070
  records `MAX_COMPARE_SYMBOLS` = 6 as following from the approved artifact.
  Section 1.1's tray and Section 1.5's entry enforce it. Review v4 FINDING-34
  notes the number is unsourced within the UX artifacts; it binds as approved.
- **Closed: the threshold-filter component gap and the STD-UI-30 partial.**
  Section 3: resolved by S03's Filters pane and the `data-table` `virtualised`
  variant.
- **Closed: the restatement mark's accessible name** (review v4 FINDING-56).
  DEC-0075, PROVISIONAL, as a composition; the owner may prefer a mark
  component through `design-system/intake.md`.
- **What is the maximum length of a universe name?** SEC-INP-001 requires a
  bound and no artifact states one. `[REQUIRES INPUT: maximum universe name
  length in characters]`. *Owner: capability owner. Blocks: the name field's
  stated bound in Sections 1.1, 1.3 and 1.4 and the API constant; nothing
  else.* **Abstained in this run, carried from the system design's §8 question
  2 through the brief.**
- **The dependency on the *App shell & data health* capability.** Blueprint §12
  D-8 gives the rail, the §2 routes and the route migration to a capability
  that is not yet defined, and CAP-002's Research destination lives in that
  rail. Whether that capability belongs in `Capability-CAP-002.md` §5.1 (most
  likely `requires-runtime` for the rail entry) is the owner's, and only the
  owner edits that table; meanwhile the interim composition of DEC-0069 holds
  and Section 0 states both shells. The consumer of
  `GET /api/classifications/summary` (S01, S09; Section 1.2) has no published
  identifier until that capability's system design exists. `[REQUIRES INPUT:
  the §5.1 row for the App shell & data health capability, if any, and the
  published identifier of the component that consumes the summary read]`.
  *Owner: capability owner (§5.1); the shell capability's system design (the
  identifier). Blocks: nothing in this design.* **Abstained in this run,
  carried from system design v3 §8 question 10 through the brief.**
- **Do downloads gain a short visible number, and which capability owns it?**
  The approved S03 §3 banner prints *from download #{n}*, and version 2 of this
  design printed a sample download number, but no table or artifact numbers downloads
  (`acquisition_run.run_id` is the only identifier, migration `0004`). Until
  the owner decides, every CAP-002 surface names a download by its start time
  in America/Chicago, the time being the link to its detail (Sections 0, 1.1,
  1.2, 1.6; DEC-0083, PROVISIONAL, superseding DEC-0079 (e)), and S03 §3's
  *#{n}* is a recorded departure from the approved copy with that reason.
  `[REQUIRES INPUT: whether downloads gain a short visible number; if so,
  which capability defines and stores it, likely *App shell & data health*,
  whose S09 lists *Recent downloads*, and its format]`. *Owner: capability
  owner, with the PRODUCT-UX change process for S03 §3's copy. Blocks: nothing
  in this design; the as-of line, banner, set history and Earlier scores copy
  in Sections 0, 1.1, 1.2 and 1.6 change when the number exists.* **Abstained
  in this run, carried from system design v3 §8 question 11 through the
  brief.**
- **Which Massive statement payload keys supply each factor input?** Carried
  from the system design's §8 question 1. It bears on this design only in
  vocabulary: every input is named in product terms (Sections 1.1, 1.5, 1.6)
  whatever key supplies it. **Abstained in the system design; not a UX
  question.**
- **Which density tier is the default?** Carried from CAP-001 and STD-UI's
  OQ-UI-4. This design inherits, as CAP-001 did.
- **Not CAP-002's:** review v4 FINDING-54 (S05's conditions cannot carry S03's
  measure and direction) concerns **Use in a strategy**, which is M2 and
  absent here; the M2 capability resolves it against S03's filter model.
- **Reaching a universe's `created` event for the Origin line** (Sections 1.3
  and 1.4) uses the events read, which is newest first. How the fetch layer
  reaches the oldest event efficiently is the component design's; no API change
  is proposed here.

**Findings the owner should know this design acted on rather than left open.**
Review v4's open findings about S03 that touch CAP-002: FINDING-22 (search,
DEC-0074), FINDING-23 (not-followed, failed and download renderings, DEC-0073),
FINDING-42 (completion confirmations, DEC-0076), FINDING-45 (holdings line
tagged M2 and omitted here), FINDING-55 (save at zero matches and incomplete
membership, DEC-0076), FINDING-56 (restatement mark, DEC-0075). FINDING-25 (the
restyled pages have no source) is answered by Sections 1.3 to 1.6. FINDING-32
(*current* means AC-13) is the system design's DEC-0071. FINDING-57 (canvas
differences) is the screen specification's own; this design took nothing from
the canvas directly. Specification review v2's FINDING-5, FINDING-6, FINDING-7
and FINDING-8 are applied in this version as the consistency pass fixed them
(DEC-0081 to DEC-0083); its other findings that name this design (FINDING-9,
FINDING-11, FINDING-25, FINDING-26, FINDING-32) are carried, not fixed, here.

This design was generated without any human designer or visual design tool. It
should be reviewed before decomposition.
