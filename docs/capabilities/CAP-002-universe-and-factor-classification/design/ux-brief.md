---
artifact_schema_version: 1
artifact_id: CAP-002-ux-brief
artifact_type: ux-brief
artifact_version: 1
capability_id: CAP-002
title: Universe & Factor Classification
created: 2026-10-15
updated: 2026-10-15
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
ai_provenance:
  agent_id: ux-brief-agent
  agent_version: "1.0"
  model: claude-fable-5-1
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-16T04:45:00Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "1"
    - id: STD-UI
      version: "4"
    - id: CAP-001-ux-brief
      version: "7"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: factorflow-design-system
      version: "ported from the first build, 2026-09-05; textarea added 2026-09-05"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# UX Brief: Universe & Factor Classification

**Capability:** CAP-002
**Design System:** FactorFlow Design System (shadcn/ui + Radix), configured at `projects/factorflow-v2/design-system.yaml`, held in `design-system/` in this repository. `design_system_available = true`: the repository and all configured paths (`design-system/components/`, `design-system/theme.css`, `design-system/component-map.json`, `design-system/intake.md`) were verified to exist, and all 12 component specifications were read for this brief.
**Theme:** `design-system/theme.css`
**Designer Handoff Date:** 2026-10-15

This brief was produced in an unattended `$design-run`. Every choice the skill
would otherwise have asked the owner about is recorded as a decision under
`projects/factorflow-v2/decisions/` (DEC-0059 to DEC-0062) and marked
**PROVISIONAL** where it rests on a derivation rather than an approved artifact.
Two questions are left open with `[REQUIRES INPUT]` markers in §9 because no
artifact derives an answer. The two abstentions the system design recorded in
its §8 (the Massive line-item mapping and the universe name length bound) are
carried here as constraints, not re-decided.

CAP-002 is the second interface capability, and the first that renders a
derived number rather than a recorded fact. CAP-001's interface tells the owner
what data the product holds; this one tells the owner what the product computed
from it, and where it could not. The acceptance criteria that exist because a
plausible interface would lie are more numerous than in CAP-001: AC-12 forbids a
score built from fewer inputs than its definition, AC-14 forbids ranking a
factor on too few stocks, AC-20 forbids a half-finished set shown as current,
AC-22 forbids an empty list that reads as complete, and AC-23 requires a
restatement mark that follows the classification into history. STD-UI-4,
STD-UI-13 to STD-UI-18 and STD-UI-23 carry the same obligations as rules. Every
presentation decision below is subordinate to them.

CAP-002's screens compose into the shell CAP-001 delivered. The system design
(§4.2, screen registration) names exactly two rail destinations, Classifications
and Universes, and five client routes: `/classifications`, `/universes`,
`/universes/:universeId`, `/compare` and `/stocks/:symbol`. This brief invents
no parallel shell, no second status region and no new navigation level. It
reuses the shell, the unreachable state, the `ScreenState` union, the
server-side filtering at volume, the `blocked`-not-`disabled` idiom, the
`confirm`-not-`destructive` idiom, the single and bulk symbol entry pattern,
and the polled-region conventions that CAP-001's UX design and
`component-design-owner-web-app.md` fixed. Where this brief needs something
those do not provide, it says so.

## 1. Screens Needed

| Screen | Purpose | User Flow / AC |
|--------|---------|----------------|
| Classifications | Rail destination at `/classifications`. Every actively acquired stock with its standardised score and percentile on value, growth and momentum from the current set, sortable by any factor, narrowed by thresholds on one or more factors and by symbol search; rows selectable to feed Compare and universe creation; a reviewed filter result saved as a named universe | Flows "See stocks classified after an acquisition", "Build a universe from a factor filter", "Compare stocks and inspect the evidence"; AC-9, AC-12, AC-14, AC-15, AC-16, AC-22, AC-23; AC-2 for saving a filter; system design 4.2 `GET /api/classifications`, `POST /api/universes` with `filter` and `set_id` |
| Classification currency | A region composed into every screen that renders a classification: which set is current, the date it was produced and the acquisition run it reflects, whether a later set is building or the latest attempt failed and why, and the last-updated time of the poll. Listed as a screen because it has its own information architecture and its own states; per `design-system/intake.md` step 1.3 it is a composition, so its assembly belongs in `ux-design.md` | Flow "See stocks classified" steps 3, 5 and 6; AC-20, AC-21, AC-22; system design 3.3 step 13, constraints 11 and 18, `GET /api/classifications` set block, `GET /api/classifications/sets`, `GET /api/acquisition-runs/{id}` reused |
| Universes | Rail destination at `/universes`. The owner's active universes with member counts, retired universes reachable but separated, and the action to create a universe by hand | Flows "Build a universe by hand", "Maintain universes over time"; AC-1, AC-3, AC-4, AC-5; system design 4.2 `GET /api/universes`, `POST /api/universes` with `symbols` |
| Universe detail | Child route at `/universes/:universeId`. The members of one universe with their classifications from the current set, sortable and filterable within the universe; add and remove members, rename, retire; membership as of a past date; and the universe's event history | Flows "Build a universe by hand" step 3, "Compare stocks" steps 1 and 2, "Maintain universes over time"; AC-3, AC-4, AC-5, AC-6, AC-15, AC-16; system design 3.2, 4.2 `GET /api/universes/{id}`, `GET /api/universes/{id}/events`, `PATCH /api/universes/{id}`, `POST /api/universes/{id}/members`, `DELETE /api/universes/{id}/members/{symbol}`, `DELETE /api/universes/{id}` |
| Compare | Child route at `/compare`. Chosen stocks side by side with all three factors: score, percentile, status with its reason, restatement mark, and the inputs each factor was built from | Flow "Compare stocks and inspect the evidence" steps 3 and 5; AC-12, AC-16; system design 3.3 step 16, `GET /api/classifications` with `symbols` |
| Stock evidence | Child route at `/stocks/:symbol`. One stock: its classification per factor in the current set, every input with its value, status, the period or session it came from and the date it was known, the restatement mark, the statement of what the check does not cover, and the stock's classifications in earlier sets | Flow "Compare stocks" step 4, "Understand and fix insufficient evidence"; AC-12, AC-13, AC-17, AC-18, AC-19, AC-23; system design 3.3 step 17, `GET /api/classifications/stocks/{symbol}`, `GET /api/classifications/stocks/{symbol}/history` |

Six screens, of which one, Classification currency, is a composed region rather
than a destination. Compare and Stock evidence are child routes, not
destinations: the system design declares two destinations and five routes, and
this brief adds none (DEC-0061). The CAP-001 shell's application status region
is not extended: it is delivered behaviour owned by `owner-web-app`, and
AGT-SCOPE-002 forbids writing an obligation into it. The classification
currency region is therefore a CAP-002 composition placed inside CAP-002's own
screens, not a third line in the shell's status region.

## 2. Information Architecture

### 2.1 Classifications

**Data elements:**

- Stock symbol (source: AC-8, AC-16; system design 4.2 `GET /api/classifications` `stocks[].symbol`)
- Instrument lifecycle, active or retired (source: AC-15; system design 3.2 step 10, `stocks[].lifecycle`)
- Per factor, for value, growth and momentum: status `classified` or `not_classified`; standardised score with explicit sign; percentile rank 0 to 100 (source: AC-9, AC-12; system design 4.4 `factor_classification`)
- Per factor, when not classified: the reason code (`input_missing`, `input_outdated`, `input_not_computable`, `not_enough_stocks`, `retired`) and the input named (source: AC-12, AC-14, AC-15; system design 4.4 `reason_code`, `reason_input`)
- Per factor for the whole set: how many stocks qualified and whether the factor is ranked (source: AC-14; system design 4.4 `classification_set_factor`, response `factors[].qualified_count`, `ranked`)
- Restatement mark on value and growth classifications (source: AC-23; system design constraint 9, `restated_possible`)
- Whether anything has been classified at all (source: AC-22; system design 3.3 step 14 `never_classified: true`)
- Which universe, if any, the list is scoped to (source: AC-16; `universe_id`)
- Active sort and thresholds (source: AC-16; `sort`, `order`, per-factor `score_min`, `score_max`, `percentile_min`, `percentile_max`, all applied in SQL over the whole set, system design 3.3 step 15)
- Row selection, by symbol (source: AC-16 side by side; AC-1 universe by hand)

**Grouping and hierarchy:**

- One row per stock. The three factors are a group within the row, and within each factor the score and the percentile are a pair. The factors are peers, not a ranking: the capability defines them with equal standing and the owner compares across them.
- Not-classified cells render the status word and the input named, inline, in place of the number: *Not classified, fundamentals outdated*. The evidence behind the reason is one interaction away, on the row's expansion and on the stock evidence screen (STD-UI-13).
- A factor that is not ranked (fewer than 30 qualified) is a column-level fact, not a per-row one. It is stated once, in that factor's column header, with the count: *Not ranked: 18 of 30 stocks qualified*, and every cell in the column carries the indeterminate marker rather than repeating the sentence 3000 times (AC-14, STD-UI-14).
- The classification currency region sits above the table and is the first thing read.
- Default order is by symbol ascending, because defaulting to one factor would privilege it over the other two. The owner sorts by any factor's score or percentile (AC-16).

**Primary vs. secondary information:**

- Primary: for each stock, its score and percentile on each factor, or the fact that it is not classified on that factor and why. This is flow "See stocks classified" step 3 and 4, and the collapsed row must answer it without interaction.
- Secondary: the input as-of and known-on dates behind each factor (expansion), the set's run identifier and timestamps (currency region detail), the exact qualified counts.

**The states that carry the risk.** Three of them. First, a stock not classified
on one factor is still classified on the others (capability §2, "Not being
classified on one factor does not prevent classification on the others"), so a
row routinely carries two numbers and one status word; the designer must not
let the status word read as a row-level failure. Second, STD-UI-14 gives
presence three states per factor cell: present (a score), absent (an input
missing, outdated or not computable), and not determinable (not enough stocks to
rank). The third must never render as the second: the `data-table`
specification §7 fixes the treatment, `--pattern-indeterminate` with a label,
never an ordinary missing marker. Third, STD-UI-4: an absent score renders as an
explicit missing marker, the em dash the `data-table` specification names, never
`0`, because a standardised score of zero is a real value meaning exactly at the
peer mean.

**The tier mapping is this brief's to make, and it is recorded.** Capability
§5.4 delegates the STD-UI-12 mapping of the seven classification states to the
UX brief. DEC-0059 (PROVISIONAL) fixes it; §12.2 carries the table. Two
assignments a designer would most likely get wrong: `not classified` is
**warning**, not critical, because the set completed and this stock's evidence
on one factor fell short, which is the standard's own `partial` reasoning; and
`retired` is **neutral**, never a fault, because the owner retired the stock.

### 2.2 Classification currency

**Data elements:**

- The current set: its `classification_date`, in ISO-8601, and the `run_id` of the acquisition run it reflects, linking to that run's detail screen delivered by CAP-001 (source: AC-21; system design 3.3 step 13, `GET /api/acquisition-runs/{id}` reused)
- Whether the current set reflects the latest acquisition, or a later set is `building`, or the latest attempt is `failed` with its `failure_reason` (source: AC-20; system design constraint 11, `set.not_current`)
- For a building set: when it started, as a timestamp with zone (source: system design 4.4 `started_at`; STD-UI-5)
- For a failed set: the reason, as recorded, never a stack trace (source: AC-20; system design 3.1 step 25)
- That nothing has been classified yet, when no complete set exists (source: AC-22)
- Last-updated time of the poll (source: STD-UI-25; system design constraint 18)
- Which run outcome the set reflects, `succeeded` or `partial`, because a set built after a partial run carries more missing inputs and the owner should know why (source: AC-10; capability §2)

**Grouping and hierarchy:**

- A compact region above every classification-bearing table, opening to detail. The set list (`GET /api/classifications/sets`) is the detail: every set newest first with state, date, run, timings and per-factor qualified counts.
- Three mutually exclusive headline states: current, not current because a later set is building, not current because the latest attempt failed. A fourth, never classified, replaces the table rather than heading it.

**Primary vs. secondary information:**

- Primary: are these classifications current, and when were they produced.
- Secondary: the run identifier, the timings, the failure reason text, the set history.

**Honest currency is the whole point of this region.** AC-20 forbids a
half-finished set shown as current, and the system design (constraint 2, 3.1
step 13a) makes that structurally true: a set becomes `complete` in one
transaction. What the interface owns is the mark. While a later set builds, the
previous set stays on screen marked *Not reflecting the latest acquisition*,
tiered warning, with *Updating* tiered active beside it. When the attempt
failed, the previous set stays, the mark stays, and the failure is shown
tiered critical with its reason and the sentence that the next qualifying
acquisition run will try again (system design 3.1 step 27). There is no
progress indicator for a building set: the engine runs as SQL and reports no
per-stock progress (system design 3.1 step 8), so nothing honest could be
drawn, and the CAP-001 component-spec gap for an indeterminate indicator is not
reopened here. The building state carries its start time instead.

**When the set completes, the screen refreshes once** (DEC-0062, PROVISIONAL):
the region announces the new date and run politely, the table dims and reloads
under the `data-table` contract, and sort, thresholds, scope, expanded rows and
selection are kept by symbol. It does not wait for the owner to ask, because
flow "See stocks classified" step 3 says *without any further action*; it does
not replace silently, because STD-UI-16 and STD-UI-24 forbid it.

### 2.3 Universes

**Data elements:**

- Universe name (source: AC-1, AC-4; system design 4.2 `GET /api/universes` `name`)
- Lifecycle, active or retired, and when retired (source: AC-4, AC-6; `lifecycle`, `retired_at`)
- Member count (source: AC-3, AC-5; `member_count`)
- When created (source: `created_at`; STD-UI-5)
- Count of active universes (source: AC-3; derived from the list)

**Grouping and hierarchy:**

- Active universes are the working list. Retired universes are present but separated by a lifecycle filter defaulting to active, because flow "Maintain universes" step 4 says a retired universe no longer appears among the active ones while its history can still be viewed.
- Creating is the one write action on this screen. There is no delete, at any level of the interface (STD-UI-2, AC-6).

**Primary vs. secondary information:**

- Primary: the active universes and how many members each has.
- Secondary: retired universes, creation and retirement timestamps.

**A universe always has at least one member.** AC-5 refuses to create or save an
empty universe. The create action therefore cannot complete with no symbols, and
the control that submits it renders `button` `blocked` with the reason beside it
until at least one symbol is entered, rather than letting the request fail.
The server's `422 empty_universe` is the backstop, not the first line.

### 2.4 Universe detail

**Data elements:**

- Name, lifecycle, created and retired timestamps, member count (source: AC-4, AC-6)
- Each member: symbol, instrument lifecycle, `member_since`, and its classification per factor from the current set with the same elements as §2.1 (source: AC-3, AC-15, AC-16; system design 4.2 `GET /api/universes/{id}`)
- The as-of date the membership is shown for, defaulting to now (source: AC-6; `as_of`)
- Filter provenance when the universe was created from a filter: the thresholds and the set they were evaluated against (source: AC-2; system design 4.4 `filter_provenance` on the `created` event)
- The event history: `created`, `renamed`, `member_added`, `member_removed`, `retired`, each with the name or symbol and `recorded_at`, newest first (source: AC-4, AC-6; `GET /api/universes/{id}/events`)
- Classification currency, as §2.2 (source: AC-20, AC-21)

**Grouping and hierarchy:**

- A summary header for the universe's own attributes, then the member table, then the event history behind a secondary view. The member table is the same composition as §2.1 scoped to the universe, with the same sort and thresholds and the same selection feeding Compare, because AC-16 requires comparison to work both across all stocks and within a universe and the owner should not learn two tables.
- A retired member stays in the table, marked retired, with every factor *Not classified, retired* (AC-15, flow "Maintain universes" step 5). It is not omitted and not moved.
- Membership as of a past date is reached from the event history first: membership changes only at events, so *View members as of this event* on any `member_added`, `member_removed` or `created` event shows the membership on that date and on every date up to the next event. A typed ISO-8601 date is the second path, through `input` `text`, which avoids a date-picker component the design system does not have (the CAP-001 UX design §7 recorded that absence) without weakening AC-6.

**Primary vs. secondary information:**

- Primary: who is in this universe now, and how each member is classified.
- Secondary: the event history, past membership, filter provenance, timestamps.

**A universe saved from a filter is a snapshot, and the screen must say so.**
AC-2 and STD-UI-15: the detail shows the saved members, never the filter's
current result. The provenance line reads as history, *Created on 2026-10-15
from a filter on the classifications of 2026-10-15: value percentile at least
80, momentum score above 0*, and no control re-evaluates it. A member whose
classification has since changed stays a member.

**Removal and retirement keep history, and the words must say so** (STD-UI-2,
AC-6). Both are consequential under the capability's §5.4 STD-UI-19 row and
take `dialog` `confirm`, never `destructive`, exactly as CAP-001 fixed for
retiring an instrument: nothing is discarded. The remove confirmation names the
stock and the universe and states that the dated membership record stays and
that classifications are unaffected. The retire confirmation states that the
universe leaves the active list and that its members and history stay viewable.

**Removing the last member is refused in favour of retirement** (AC-5, flow
"Maintain universes" step 6). The interface knows `member_count`, so the remove
action on the sole member renders `button` `blocked` with the reason *This is
the last member. Retire the universe instead.* and the retire action beside it.
The server's `409 last_member`, whose message offers retirement (system design
3.2 step 7a), is the backstop: if it arrives, the dialog stays open with the
error and the retire action, per the `dialog` contract.

### 2.5 Compare

**Data elements:**

- The chosen stocks, by symbol, each with instrument lifecycle (source: AC-16; system design 3.3 step 16, `GET /api/classifications` with `symbols`)
- Per stock, per factor: status, score, percentile, reason and input named when not classified, restatement mark (source: AC-12, AC-16, AC-23)
- Per stock, per factor: the inputs the factor was built from, each with value, status and as-of date, as the capability's flow step 3 requires *all three factors and their inputs* (source: AC-16, AC-17; `GET /api/classifications/stocks/{symbol}` for the input rows)
- Classification currency, as §2.2 (source: AC-20, AC-21)

**Grouping and hierarchy:**

- Stocks as columns, factors and their inputs as rows: value score, value percentile, book-to-price, earnings yield, free-cash-flow yield; then growth and its two inputs; then momentum and its three windows. Side by side means the comparison axis is the row, so each row holds one quantity at one precision across every stock (STD-UI-3).
- Each factor is a row group with its name as the group header. Factor identity is carried by the header text, not by the `badge` factor variants: those tag a record as a value, growth or momentum stock, which CAP-002 never does (every stock scores on all three).
- A stock not classified on a factor keeps its column and shows the status word and the input named in that factor's cells, never a value and never a gap (flow "Compare stocks" step 5).

**Primary vs. secondary information:**

- Primary: the three scores and percentiles per stock, read across.
- Secondary: the input values and dates, which explain a difference.

**How stocks reach this screen.** Row selection on Classifications or Universe
detail, then *Compare selected*, which routes to `/compare` with the symbols in
the query so the view can be linked and survives reload; or symbols typed into
the screen's own entry. The API bounds the list at `MAX_PAGE_SIZE`, 500
(system design 4.2, inherited from `component-design-ingestion-api.md` §2.4a).
The capability says *a few chosen stocks* and gives no number; this brief sets
no cap below the API's and asks the owner whether one is wanted (§9). Until
then the layout must degrade honestly: columns beyond the viewport scroll
horizontally inside the table's own container, with the row headers pinned, as
the CAP-001 component design §14 question 4 already describes for wide tables.

**This is a composition, not a `data-table` variant.** It has no sorting, no
filtering and no pagination, and its records run across rather than down. The
`data-table` specification's own guidance for a static table with no sorting
is a plain table with native semantics, and `design-system/intake.md` step 1.3
places a screen region built from existing pieces in `ux-design.md`. The
designer should build it with native `<table>` semantics, programmatic row and
column headers, `--font-numeric` and the `data-table` token set, and should not
open a component-spec gap for it.

### 2.6 Stock evidence

**Data elements:**

- Symbol and instrument lifecycle (source: AC-15)
- Classification currency, as §2.2, and when no set exists the statement that the stock has not been classified because nothing has (source: AC-22; `set: null`)
- Per factor: status, score, percentile, reason and input named when not classified, restatement mark (source: AC-12, AC-14, AC-23)
- Per factor, every input: name, status `present`, `missing`, `outdated` or `not_computable`, value, `as_of` (the fiscal period end or session date it came from), `known_on` (the date the product knew it), `restated_possible`, and the reason detail when missing, including the acquisition outcome that left it missing (source: AC-12, AC-13, AC-17; system design 4.4 `factor_input`)
- The seven input names in the product's vocabulary: book-to-price, earnings yield, free-cash-flow yield, revenue growth, earnings-per-share growth, and the 3-, 6- and 12-month total returns, with the components behind them in the detail (source: capability §2 factor definitions; system design constraint 8)
- The statement of what the check does not cover (source: STD-UI-18; capability §5.4)
- Earlier classifications of this stock: per set, the classification date, run, and per-factor status, score, percentile and mark, newest first (source: AC-18, AC-19; `GET /api/classifications/stocks/{symbol}/history`)

**Grouping and hierarchy:**

- Three factor groups, each a description list of the factor's result and its inputs. The `card` `summary` variant is written for exactly this, the attributes of one entity, and the input counts are small (three, two, three).
- Current evidence and history are two views of one subject. `tabs` `default` with the active tab in the URL fits the specification's own example, *a stock's factors, fundamentals, and price history*; a stacked layout is the alternative and is the designer's call.
- Dates everywhere: `as_of` is a session or period-end date and renders unconverted; `known_on` is an `observed_on` date; set timestamps carry America/Chicago (STD-UI-5).

**Primary vs. secondary information:**

- Primary: on each factor, is this stock classified, and if not, which input is missing or outdated and what made it so. This is flow "Understand and fix insufficient evidence" step 2 and must be readable without expanding anything.
- Secondary: the component periods and sessions behind each input, the acquisition outcome that left an input missing, and the history.

**Every error here has three parts and a recovery action** (STD-UI-19). For an
outdated fundamental: classifying value for the named stock could not use the
latest statement because its period ended more than 6 months before
2026-10-15; the recovery is the next acquisition run that ends succeeded or
partial, which the screen names, because flow step 3 is the owner acquiring
again. Where the cause is that the provider holds no such data (flow step 5),
the screen says so and offers no recovery, because none exists; STD-UI-19
requires a recovery action only where one exists.

**The check states what it does not cover** (STD-UI-18, capability §5.4). Once
per screen, below the factor groups: the insufficient-evidence result judges
whether each input is present and current, not whether the provider's values
are correct. The restatement mark is the one case where the product knows a
limitation and says so (STD-UI-17): *Possibly reflects restated data*, with
the sentence that the fundamentals behind this classification were acquired
for a period already reported before acquisition of this stock began.

**Inputs are named, payload keys are not.** System design §8 question 1 leaves
the mapping from the seven inputs to the provider's statement payload keys to
the owner. The interface is unaffected except in vocabulary: a missing input is
named as *operating cash flow*, never as a payload key or a field path, which
STD-UI-1 forbids as implementation vocabulary.

## 3. Interactions Required

Every action carries its STD-UI-19 tier: **routine** (reversible, no
confirmation), **consequential** (confirmation describing the actual effect), or
**capital-at-risk**. CAP-002 has no capital-at-risk action and no destructive
one: retirement and removal keep history (capability §5.4, STD-UI-19 and
STD-UI-22 rows). Every error states the operation, the resource and the reason,
and offers a recovery action where one exists; the error envelope's `code`
(system design 4.2) selects the wording, and its `message` is never shown raw.

| Screen | User Action | Tier | Expected Outcome | Error / Edge Case |
|--------|-------------|------|------------------|-------------------|
| Classifications | Read the classified stocks | routine | Each active stock with score and percentile per factor, or *Not classified* with the input named, under the current set's date (AC-9, AC-12, AC-21) | Never classified: *No stocks have been classified yet. Classifications are produced after an acquisition run ends succeeded or partial.* with a link to Runs; never an empty table (AC-22, STD-UI-23). A factor not ranked: column header states *Not ranked* and the qualified count, cells carry the indeterminate marker (AC-14, STD-UI-14) |
| Classifications | Sort by a factor's score or percentile | routine | Whole-set order changes, server-side; focus stays; new order announced politely | Not-classified rows sort after classified ones on that factor, stated in the column header, so an absent score never sorts as zero (STD-UI-4) |
| Classifications | Apply thresholds on one or more factors | routine | The list narrows to stocks meeting every threshold, server-side over the whole set (AC-16); active thresholds are summarised in the toolbar with a clear action | No stock matches: *No stock meets these thresholds.* with a reset, distinct from never classified (AC-22). A percentile outside 0 to 100 or a non-finite score is a field error before the request (system design constraint 15) |
| Classifications | Search by symbol | routine | Prefix match over the whole set, server-side | Matches none: nothing-found state with reset |
| Classifications | Save the filter result as a universe | routine | A `dialog` `standard` shows the match count, the thresholds and a name field; on save the universe exists with exactly the reviewed members and the detail opens (AC-2) | Zero matches: the save action renders `blocked` with *No stock meets these thresholds, so there is nothing to save.* (AC-5). `409 classification_set_changed`: *Could not save this filter as a universe: classifications changed while you were reviewing them. Review the new result, then save again.* `409 universe_name_in_use`: name the conflict, keep the dialog open. Not offered when the list is scoped to a universe: the API carries thresholds only (system design 4.2) |
| Classifications, Universe detail | Select rows and compare | routine | *Compare selected* opens `/compare` with the symbols in the query (AC-16) | More selected than `MAX_PAGE_SIZE`, 500: the action renders `blocked` with the bound stated. Whether a lower cap is wanted is open (§9) |
| Classifications | Select rows and create a universe from them | routine | The create dialog opens with the symbols prefilled (AC-1) | As create below |
| Classifications, every classification-bearing screen | Watch a building set complete | routine | The currency region shows *Updating* and the not-current mark, polling every 10 seconds with a last-updated time; on completion the screen refreshes once, announced, with sort, thresholds, scope, expansion and selection kept (DEC-0062, PROVISIONAL) | The attempt fails: the previous set stays, marked not current, with the failure and its reason tiered critical and the statement that the next qualifying run will try again (AC-20). Polling stops when no set is building and no run is non-terminal (system design constraint 18) |
| Classification currency | Open the run a set reflects | routine | The CAP-001 run detail screen for that `run_id` (AC-21) | The run is `partial`: say so beside the date, because it explains missing inputs |
| Classification currency | Open the set history | routine | Every set newest first with state, date, run, timings and per-factor counts | A failed set shows its reason; a building set its start time |
| Universes | Create a universe by hand | routine | A `dialog` `standard` with a name field and a bulk symbol field; on create the universe exists and its detail opens showing members with classifications (AC-1, flow step 3) | No symbol entered: create renders `blocked` with the reason (AC-5). `409 instrument_not_acquired`: *Could not create the universe: acquisition does not cover MSFT, TSLA. Add them on the Instruments screen, then try again.* naming every uncovered symbol; nothing was created and the entered symbols stay in the field (AC-1, system design constraint 13). `409 universe_name_in_use`: name the conflict. A symbol not matching the instrument shape is a field error before the request |
| Universes | Find a universe; show retired ones | routine | Lifecycle filter active, retired, all | Retired list empty: nothing-found, not never-populated |
| Universe detail | Add members, singly or in bulk | routine | Added symbols appear with their classifications; `already_member` symbols are reported, not errored (AC-4) | `409 instrument_not_acquired` refuses the whole request naming every uncovered symbol, entered symbols preserved (system design constraint 13). `409 universe_retired`: *This universe is retired and cannot be changed. Its members and history are still viewable.* More than `MAX_SYMBOLS_PER_REQUEST`, 1000, in one submission: field error stating the bound |
| Universe detail | Remove a member | consequential | `dialog` `confirm`: *Remove AAPL from Tech? Its membership until today stays in the universe history. Its classifications are not affected.* On confirm the row leaves the current membership and appears in the history (AC-4, AC-6) | Sole member: the action renders `blocked` with *This is the last member. Retire the universe instead.* and the retire action beside it (AC-5). `409 last_member` as backstop: dialog stays open with the error and the retire action. Never `destructive`: nothing is discarded (STD-UI-2) |
| Universe detail | Rename | routine | Inline name edit; the new name appears, identity and history unchanged (AC-4) | `409 universe_name_in_use`: field error naming the conflict. Empty after trimming: field error. Maximum length is open, carried from system design §8 question 2 |
| Universe detail | Retire | consequential | `dialog` `confirm`: *Retire Tech? It leaves your active universes. Its members and history stay viewable.* On confirm the universe shows retired and leaves the active list (AC-4, AC-6) | Already retired: `409 universe_retired`. Never `destructive` (STD-UI-2) |
| Universe detail | View membership as of a past date | routine | From an event, *View members as of this event*; or a typed ISO-8601 date; the table shows the members on that date, clearly labelled as-of, with classifications from the current set (AC-6) | Date before creation: empty by definition, stated as such with the creation date. Malformed date: field error, ISO-8601 stated (`422`) |
| Universe detail | Read the event history | routine | Events newest first with name or symbol and timestamp with zone (AC-6, flow "Maintain universes" step 3) | Paged with a cursor; no event is ever missing because none is deleted |
| Compare | Read stocks side by side | routine | Columns per stock, rows per factor and input, every value at the row's precision (AC-16) | A stock not classified on a factor keeps its column and shows the status and input named (flow step 5). A retired stock shows *Not classified, retired* on every factor |
| Compare | Add or remove a stock | routine | Column added or removed; the URL updates | Symbol not found: `404 instrument_not_found`, *No instrument named XYZ is on the acquisition list.* |
| Stock evidence | Read the inputs behind a classification | routine | Per factor, each input's value, status, as-of and known-on date (AC-17), and the restatement mark where it applies (AC-23) | Missing or outdated input: the three-part statement and, where one exists, the recovery (the next qualifying acquisition run); where the provider holds no such data, the statement that no recovery exists (flow "Understand and fix" step 5) |
| Stock evidence | Read earlier classifications | routine | Every earlier set's result for this stock, newest first, each dated and tied to its run (AC-18) | No earlier set: nothing-found distinct from never classified. A backfill observed later never alters an earlier row (AC-19); the history reads as recorded |
| Every screen | Load data | routine | Content appears | Eight states per region (STD-UI-23), enumerated in §12.4. Unreachable is the shell's designed state delivered by CAP-001, never a transport error |

## 4. Suggested Components

> **Note:** This section applies only when a design system is configured in `projects/factorflow-v2/design-system.yaml`. One is, so this section names components that have a `design-spec.md` in `design-system/components/`.

Every component below was read from its specification. Nothing is proposed that
does not exist; where CAP-002 needs something the design system does not have,
it is recorded as a gap or a composition per `design-system/intake.md`.

| UI Pattern | Suggested Component | Variant | Design Spec Reference |
|------------|---------------------|---------|-----------------------|
| Classifications: one row per stock, up to 3000, expanding to per-factor input summary and evidence link | `data-table` | `expandable` | `design-system/components/data-table/design-spec.md` |
| Universe detail: members with classifications, same shape scoped to the universe | `data-table` | `expandable` | `design-system/components/data-table/design-spec.md` |
| Universes: the universe list | `data-table` | `expandable`, rows expanding to creation and retirement timestamps and filter provenance | `design-system/components/data-table/design-spec.md` |
| Universe event history; stock classification history; set history | `data-table` | `history` | `design-system/components/data-table/design-spec.md` |
| Symbol search over classifications or members | `data-table` toolbar filter | n/a | `design-system/components/data-table/design-spec.md` |
| Lifecycle filter on Universes; scope selector on Classifications (all stocks or one universe) | `select` | `inline` | `design-system/components/select/design-spec.md` |
| Classification states: not classified, not enough stocks to rank, retired, updating, not reflecting the latest acquisition, classification failed | `badge` | `status-warning`, `status-serious`, `status-neutral`, `status-active`, `status-warning`, `status-critical`, per §12.2 (DEC-0059) | `design-system/components/badge/design-spec.md` |
| Instrument lifecycle marker on a retired stock; universe retired marker | `badge` | `secondary` | `design-system/components/badge/design-spec.md` |
| Restatement mark, *Possibly restated*, inside dense rows | `badge` | `outline`, with an icon and the label text (STD-UI-8) | `design-system/components/badge/design-spec.md` |
| Run outcome the set reflects, `succeeded` or `partial` | `badge` | `status-good` or `status-warning`, the CAP-001 mapping | `design-system/components/badge/design-spec.md` |
| Create universe; Save as universe; Compare selected | `button` | `default`, at most one primary per region | `design-system/components/button/design-spec.md` |
| Create or save with no members; remove the last member; compare beyond the bound | `button` | `blocked`, reason beside it, focusable | `design-system/components/button/design-spec.md` |
| Retire universe | `button` | `secondary` | `design-system/components/button/design-spec.md` |
| In-row remove member; in-row open evidence | `button` | `ghost`; navigation to `/stocks/:symbol` is a link, per the specification | `design-system/components/button/design-spec.md` |
| Confirm removing a member; confirm retiring a universe | `dialog` | `confirm`, never `destructive` | `design-system/components/dialog/design-spec.md` |
| Create a universe; save a filter as a universe | `dialog` | `standard`, carrying a `form` `dialog` | `design-system/components/dialog/design-spec.md`, `design-system/components/form/design-spec.md` |
| Universe name; rename inline; as-of date entry; add one member | `form` + `input` | `inline` or `dialog` + `text` | `design-system/components/form/design-spec.md`, `design-system/components/input/design-spec.md` |
| Bulk symbol entry when creating a universe or adding members | `textarea` | `list` | `design-system/components/textarea/design-spec.md` |
| Threshold values: score and percentile bounds | `input` | `numeric` | `design-system/components/input/design-spec.md` |
| Universe summary header; classification currency detail; per-factor evidence groups | `card` | `summary` | `design-system/components/card/design-spec.md` |
| Stock evidence: current evidence against history | `tabs` | `default`, active tab in the URL | `design-system/components/tabs/design-spec.md` |
| A universe created, member added or removed, or a set completed while the owner is on another screen | `toast` | `success`, `info`, or `error` for a failed set | `design-system/components/toast/design-spec.md` |

**Components deliberately not proposed.** `chart`: the capability commits to no
chart, the system design §4.3 records `lightweight-charts` as unused, and
STD-UI-9, STD-UI-27 and STD-UI-28 are recorded as not applicable. The `badge`
factor variants `value`, `growth` and `momentum`: they tag a record as one kind
of stock, and CAP-002 scores every stock on all three factors, so factor
identity is carried by column and group headers in text. `dialog` `destructive`:
CAP-002 has no destructive action. `input` `percentage`: percentile is a rank
from 0 to 100, not a rate, and a `%` suffix would misdescribe it (STD-UI-2).

**COMPONENT-SPEC-GAP: numeric threshold filter in the `data-table` toolbar.**
AC-16 requires thresholds above or below a chosen score or percentile on one or
more factors at once, twelve bounds in all. The `data-table` anatomy names a
filter input, faceted filters and a column visibility control; none is a
numeric range, and the `input` and `form` specifications both direct table
filtering to the toolbar rather than to themselves. Per `intake.md` step 1.2
this is an extension of the toolbar, a table row in the `data-table`
specification rather than a new component. This brief records the gap and
proposes `input` `numeric` inside the toolbar as the interim composition; the
resolving edit to the design system is a human one the UX skills may not make.

**Compositions, not components.** The classification currency region (§2.2),
the side-by-side comparison table (§2.5) and the threshold toolbar panel are
assembled from existing pieces and belong in `ux-design.md` per `intake.md`
step 1.3.

## 5. Constraints

- **STD-UI v4 governs every surface here.** Where this brief and the standard
  disagree, the standard wins; a capability may be stricter than a rule but never
  looser. §12 records conformance rule by rule, as STD-UI §4 requires, and
  mirrors `Capability-CAP-002.md` §5.4.
- **CAP-002 composes into the delivered shell and amends none of it.** Two rail
  destinations appended after Settings, in the order Classifications, Universes
  (DEC-0061, PROVISIONAL), and five client routes (system design 4.2, §8
  question 4). No second status region, no new navigation level, no change to
  the landing screen, no change to the unreachable state. AGT-SCOPE-002.
- **Device target: desktop browser, keyboard first,** as CAP-001 fixed
  (`component-design-owner-web-app.md` §1). No mobile or touch target is stated
  in any source. Wide tables scroll horizontally inside their own container, not
  the page.
- **No authentication, no account, no user concepts.** Capability §5.3; system
  design constraint 12; the loopback exception under DEC-0050 and DEC-0058.
- **One owner-operator.** No per-user ownership of universes, no sharing
  (capability §5.3; tech stack C8; system design constraint 19).
- **The interface learns everything by polling.** The classification currency
  region polls every 10 seconds while a set is building or a run is non-terminal
  and stops otherwise (system design constraint 18, DEC-0054, PROVISIONAL);
  every polled region shows its last-updated time (STD-UI-25). Universe reads
  and evidence reads are on demand.
- **Up to 3000 classified stocks (AC-11), and STD-UI-30 says what that
  requires:** the classified-stock list and a universe's member list are
  virtualised and provide search and filter. Sort and thresholds apply in SQL
  over the whole set with keyset pagination at `DEFAULT_PAGE_SIZE` 50 and
  `MAX_PAGE_SIZE` 500 (system design 3.3 step 15), never over a loaded page. The
  CAP-001 conformance record's **partial** for STD-UI-30 is inherited: the
  `data-table` specification offers pagination and not virtualisation, so the
  design must virtualise; the component does not discharge the rule alone.
- **Request bounds are the first capability's:** `MAX_SYMBOLS_PER_REQUEST` 1000
  per member submission, `MAX_PAGE_SIZE` 500 per compare list (system design
  4.2). The universe name maximum length is `[REQUIRES INPUT: maximum universe
  name length in characters]`, abstained in the system design (§8 question 2)
  and carried here unchanged; the name field states the bound once it is known.
- **A whole request is refused when any symbol is uncovered** (AC-1; system
  design constraint 13, DEC-0057). The interface reports every uncovered symbol,
  preserves the entered list and lets the owner remove them and resubmit. This
  differs from CAP-001's Add many, where parsing rejects lines individually;
  here the parse step still reports malformed entries individually, and the
  coverage refusal comes from the server as one answer.
- **Like for like, or not at all** (AC-12, AC-14; system design constraint 6).
  No partial score is ever rendered. A not-classified cell carries the status
  word and the input named; a not-ranked factor carries the qualified count.
- **Presence has three states per factor cell** (STD-UI-14): present, absent
  (input missing, outdated or not computable), not determinable (not enough
  stocks to rank). The third never renders as the second and never as zero.
- **Missing is not zero** (STD-UI-4). An absent score renders as the em dash the
  `data-table` specification names; a score of `0.00` is a real value at the
  peer mean; blank means only that the column does not apply.
- **Scores carry an explicit sign and no polarity colour** (DEC-0060). STD-UI-3
  fixes precision per column; the number of decimals is open (§9).
- **Dates are ISO-8601 and timestamps carry America/Chicago** (STD-UI-5).
  `classification_date`, `known_on` and `recorded_on` are dates in that zone's
  rule; `as_of` is a fiscal period end or session date and is never converted;
  `started_at`, `ended_at`, `recorded_at`, `created_at`, `retired_at` and
  `member_since` are timestamps with the zone shown.
- **Nothing is asserted beyond what is derived** (STD-UI-15). A filter-built
  universe shows its saved members, never the filter's current result (AC-2); a
  classification is shown only from a `complete` set.
- **No silent substitution** (STD-UI-16). The previous set is shown only with
  its not-current mark (AC-20); a completed set replaces it once, announced
  (DEC-0062).
- **The restatement mark propagates** (STD-UI-17, AC-23): on every presentation
  of a value or growth classification built from backfilled fundamentals, in
  the list, in Compare, in evidence and in history.
- **The check states what it does not cover** (STD-UI-18): present and current,
  not correct.
- **Retirement and removal, never deletion** (STD-UI-2, AC-6). No destructive
  action exists in this capability.
- **No charting** (capability §5.4; system design §4.3). STD-UI-9, STD-UI-27 and
  STD-UI-28 do not apply; a UX design that adds a chart engages all three.
- **Density, type scale and spacing come from theme tokens** (STD-UI-29); the
  density tier is inherited as CAP-001 did, pending OQ-UI-4.
- **Accessibility is enforced by review, not by tooling** (STD-UI-24;
  `tech-stack.md`: Biome has no `jsx-a11y` equivalent).
- **The seven factor inputs are named in product vocabulary** (STD-UI-1), never
  by provider payload key; the key mapping is the system design's abstained
  question 1 and does not bear on this brief beyond vocabulary.
- **Point-in-time history is the constraint that cannot be repaired later**
  (charter §3; tech stack C5; system design constraint 3). Nothing in the
  interface offers to edit, correct or delete a recorded classification or
  membership event, and no wording implies it could.

## 6. Accessibility Requirements

- **WCAG level or target:** WCAG 2.1 AA, the project target under STD-UI-24.
- **Keyboard navigation needs:** Every operation completable by keyboard
  (STD-UI-24): sorting, applying and clearing thresholds, searching, selecting
  rows, opening Compare and evidence, expanding a row, creating a universe,
  adding and removing members, renaming, retiring, viewing as-of membership,
  switching evidence tabs, and opening the currency detail. Focus is managed on
  every dialog and on content inserted into the page, and visible focus is never
  suppressed. `button` `blocked` is used for every precondition-gated action
  (no members, last member, compare beyond the bound) because it stays focusable
  and exposes its reason through `aria-describedby`, where a disabled control
  hides the reason from a keyboard or screen-reader user. Links, not buttons,
  carry navigation to evidence and to the run a set reflects, so middle-click
  and open-in-new-tab work.
- **Screen reader considerations:** Every status carries its word, never an icon
  alone: the six classification states, the restatement mark, the lifecycle
  marker. Tables carry programmatic row and column headers wherever a cell's
  meaning depends on both, which in the classified-stock list (stock by factor
  metric) and in Compare (quantity by stock) it always does. A not-ranked
  factor's column header carries the count so a screen reader hears it once,
  not per cell. Sorting, filtering and the set refresh must not move focus, and
  the new row count and the new classification date are announced politely. The
  expander and in-row actions name their row: *Remove AAPL from Tech*, never a
  bare *Remove* repeated 3000 times. The scope condition in STD-UI §2.3 applies:
  screen-reader certification is exempt as a release gate, the semantics are
  mandatory.
- **Polled content:** The currency region announces politely rather than
  replacing silently (STD-UI-24) and displays its last-updated time (STD-UI-25).
- **Contrast:** Text at 4.5:1, large text and interactive boundaries at 3:1
  (STD-UI-24). The warm tiers `warning` and `serious`, which this capability
  renders far more often than CAP-001 did, were darkened to meet contrast in
  `design-system/theme-validation.md`; the designer should expect them to read
  dark rather than amber.
- **Touch / mobile requirements:** None stated in any source. Control target
  sizes follow the component specifications, at least 24 by 24 CSS pixels
  (`--control-min-target`).
- **Colour-not-solo-state requirements:** Mandatory under STD-UI-8 and
  load-bearing: `not classified` and `not enough stocks to rank` are both warm
  tiers and differ in meaning, and the distinction between a per-stock evidence
  shortfall and a set-wide ranking failure is the one AC-12 and AC-14 protect.
  Every status carries a text label plus an icon or shape; a greyscale rendering
  remains fully readable. Scores carry their sign in text (STD-UI-3), and no
  colour encodes polarity (DEC-0060), so a greyscale rendering loses nothing.

## 7. Component Library References

> **Note:** This section applies only when a design system is configured. Omit when no design system is available.

| Component | Slug | Design Spec Path |
|-----------|------|------------------|
| Data Table | `data-table` | `design-system/components/data-table/design-spec.md` |
| Badge | `badge` | `design-system/components/badge/design-spec.md` |
| Button | `button` | `design-system/components/button/design-spec.md` |
| Dialog | `dialog` | `design-system/components/dialog/design-spec.md` |
| Card | `card` | `design-system/components/card/design-spec.md` |
| Form | `form` | `design-system/components/form/design-spec.md` |
| Input | `input` | `design-system/components/input/design-spec.md` |
| Select | `select` | `design-system/components/select/design-spec.md` |
| Textarea | `textarea` | `design-system/components/textarea/design-spec.md` |
| Tabs | `tabs` | `design-system/components/tabs/design-spec.md` |
| Toast | `toast` | `design-system/components/toast/design-spec.md` |

Eleven of the twelve components are referenced; `chart` is not, for the reason
in §4. No Figma node IDs exist: `design-system/component-map.json` carries a
null `figma_file_key` and an empty component map, so Path A's Figma route has
no design source to extract from and the automated Path B is unaffected, as
CAP-001's brief recorded.

## 8. EDG Compliance Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Consistency with product patterns | pass | CAP-002 reuses the shell, routes pattern, status vocabulary, `blocked`, `confirm`, bulk entry, polled-region and server-side-filtering conventions CAP-001 fixed, and adds two destinations without reordering the delivered four (DEC-0061). Vocabulary is held to STD-UI-1; the four terms CAP-002 adds are recorded in §12.1 |
| Progressive disclosure | pass | The collapsed classification row answers "how is this stock classified" with six numbers or status words; input dates, reasons in detail and history are one interaction away. A not-ranked factor is stated once in its header, not per row. Twelve threshold bounds sit behind one toolbar control. Compare shows scores first and inputs beneath |
| Error clarity | pass | Every refusal in §3 names the operation, the stock or universe and the reason, and offers the recovery where one exists: add the stock on Instruments, review and save again, retire instead, acquire again. Where no recovery exists (the provider holds no such data) the screen says so rather than inventing one. No payload key, code or exception reaches the owner (STD-UI-1) |
| Accessibility | pass | WCAG 2.1 AA per STD-UI-24, specified in §6 against each operation. Enforcement is human review, which the standard acknowledges |
| States and feedback (empty, loading, error, success, partial) | pass | All five, plus the three more STD-UI-23 requires, enumerated per region in §12.4. Never-classified and nothing-found are distinct everywhere both can occur (AC-22); stale is a first-class, marked state (AC-20); unavailable is the not-ranked factor (AC-14) |

**Intentional departures from `edg-compliance`, recorded so a reviewer does not
raise them.** STD-UI §1.2 declares them: six severity tiers reconciled to EDG's
three levels (STD-UI-12); the kill switch without confirmation (STD-UI-21),
which CAP-002 does not deliver; screen-reader certification exempt as a gate
with semantics mandatory. Of STD-UI §2.3's four scope exemptions, the one
engaged here is error codes: the error envelope's `code` selects wording and is
never shown, because the product has one owner and no support channel, and
STD-UI-19's three-part actionability replaces it.

## 9. Open Questions

Decisions this brief made are not listed here; they are DEC-0059 to DEC-0062
and are cited where they apply. What follows is what no artifact derives.

- **Is there a maximum number of stocks in the side-by-side view?** The
  capability says *a few chosen stocks* (flow "Compare stocks" step 3, AC-16) and
  the API bounds the `symbols` list at `MAX_PAGE_SIZE`, 500 (system design 4.2).
  No artifact gives a smaller number, and inventing one would be a quantitative
  value without a source. `[REQUIRES INPUT: maximum number of stocks compared
  side by side, or confirmation that the API bound is the only one]`. *Owner:
  capability owner. Blocks: nothing; the UX design proceeds with no cap below
  500 and horizontal scroll inside the table, and adds a cap if one is given.*
  **Abstained in this run.**
- **To how many decimals do scores and percentiles render?** STD-UI-3 requires a
  precision fixed per column and an explicit sign; it does not fix the
  precision, and neither the capability nor the system design does. Scores are
  standardised values, percentiles are `percent_rank` times 100 (system design
  constraint 7), so the natural precisions differ. `[REQUIRES INPUT: decimal
  places for the score column and for the percentile column]`. *Owner:
  capability owner. Blocks: nothing; the UX design may proceed on a precision
  marked PROVISIONAL and record it.* **Abstained in this run.**
- **Which density tier is the default?** Carried from CAP-001 and STD-UI's
  OQ-UI-4. This brief inherits, as CAP-001 did.
- **Carried from the system design §8, not re-decided:** the Massive statement
  payload keys for the seven inputs (question 1, bears on vocabulary only here)
  and the universe name length bound (question 2, bears on the name field).

**Two findings recorded rather than resolved,** because they belong to artifacts
this skill may not write:

- **COMPONENT-SPEC-GAP, numeric threshold filter in the `data-table` toolbar.**
  Described in §4. Resolving it is a human edit to the design system through
  `design-system/intake.md`, most likely a row in the `data-table`
  specification's anatomy or variants rather than a new component.
- **The STD-UI-30 virtualisation gap persists.** CAP-001's brief, UX design and
  component design all record that the `data-table` specification offers
  pagination and not virtualisation. CAP-002 inherits the partial and the
  obligation; nothing here closes it.

## 10. Source Documents

| Document | Path | Key Findings |
|----------|------|--------------|
| Capability CAP-002 v1 (draft) | `docs/capabilities/CAP-002-universe-and-factor-classification/Capability-CAP-002.md` | 23 acceptance criteria; six user flows with failure branches; universes by hand or one-time filter snapshot; one peer set; like for like or not at all; 30-stock ranking threshold; previous set marked while not current; honest empty state; restatement mark in history; §5.4 conformance for all 30 STD-UI rules, delegating the tier mapping and the eight-state enumeration to this brief |
| System design CAP-002 v1 (draft) | `docs/capabilities/CAP-002-universe-and-factor-classification/design/system-design.md` | `ui_facing: true`; `classification-ui` mounted in the `owner-web-app` shell with two destinations and five routes; thirteen JSON operations and two reused; current set is the latest `complete`; `never_classified`; `not_current` with building or failed later set; keyset pagination and request bounds; 10-second poll while building; states mapped to tiers delegated to this brief; two abstentions carried here |
| STD-UI v4 | `docs/constitution/standards/ui-conventions.md` | Thirty rules; six tiers; three presence states; eight region states; America/Chicago; polled cadence recorded in design; known limitations propagate; lists at committed volume; conformance record required in the UX brief |
| CAP-001 UX brief v7 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-brief.md` | The conformance record shape this brief mirrors; coverage refreshes once on run completion (precedent for DEC-0062); `confirm` not `destructive`; `blocked` not disabled; the STD-UI-30 partial |
| CAP-001 UX design v5 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-design.md` | Shell: fixed rail, four destinations in fixed order, status region, unreachable state; Add and Add many pattern; link-not-row-click for navigation; no date input exists; polled regions announce politely |
| CAP-001 component design: owner web app v4 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/component-design-owner-web-app.md` | `web/src/app/shell.tsx` and `routes.tsx` as the composition points; `ScreenState` union with two empty variants; server-side filtering and windowed rendering at 3000 rows; desktop only, wide tables scroll in their container; density inherited |
| Design system | `design-system/` and `projects/factorflow-v2/design-system.yaml` | 12 component specifications read; `theme.css` tokens including the six tiers, `--value-missing`, `--value-indeterminate`, `--pattern-indeterminate`, the factor tokens (not used here) and `--gain` and `--loss` (not used here); `component-map.json` empty; `intake.md` governing gaps and compositions; `theme-validation.md` recording the darkened warm tiers |
| Product charter v2 | `docs/constitution/product-charter.md` | One owner-operator; Owner Interface, Universe Definition and Factor Classification as building blocks; point-in-time factor and universe history that cannot be rebuilt |
| Tech stack v5 | `docs/constitution/tech-stack.md` | React 18, Vite, Tailwind, shadcn/ui on Radix, `react-router-dom`; Biome has no `jsx-a11y` equivalent; C8 one owner; OQ-TS-3 provisionally resolved by DEC-0052 |
| EDG compliance skill | `.agents/skills/edg-compliance/SKILL.md` | Advisory beneath STD-UI per STD-UI §1.2; checklist applied in §8 |
| Decision records | `projects/factorflow-v2/decisions/DEC-0052.md` to `DEC-0058.md`; `DEC-0059.md` to `DEC-0062.md` (harness repository) | The system design's seven provisional choices, of which the poll cadence (DEC-0054) and universe semantics (DEC-0057) bind this brief; the four choices this brief records |

## 11. Readiness Assessment

**Readiness Score: 84/100**

Ready for either path. Six screens are derived from six user flows and cover
all 23 acceptance criteria; each of the thirteen JSON operations the system
design declares, and the two it reuses, has a consumer named in §1 and §3, and
no screen depends on an operation that does not exist. Every component proposed
was read from its specification, the one thing CAP-002 needs that the design
system lacks is recorded as a gap rather than invented, and the two regions
that are compositions are named as such with their home in `ux-design.md`.

What this brief adds beyond restating its sources: the tier mapping the
capability delegated to it, with the two assignments most likely to be got
wrong called out; the three-state presence model applied per factor cell, with
a not-ranked factor stated once in its header rather than 3000 times; the
currency region as a CAP-002 composition rather than an amendment to the
delivered shell; the refusal-whole semantics of member entry reconciled with
CAP-001's per-line parsing; and the as-of membership path through events,
which satisfies AC-6 without a date-picker gap.

Four choices rest on derivations rather than approved artifacts and are
recorded as PROVISIONAL agent decisions (DEC-0059 to DEC-0062); the owner
upholds or reverts each. Two questions are abstained with `[REQUIRES INPUT]`
markers because no artifact derives them, and neither blocks the UX design.
The capability and system design this brief reads are themselves drafts, so
specification review may move ground beneath it.

The sixteen points withheld are for what no brief can supply: nothing here has
been read by anyone but its author, and no owner has yet seen a factor score
rendered.

## 12. STD-UI Conformance Record

STD-UI §4 requires a conforming capability to record four things in its UX
brief: which rules its surfaces engage, which do not apply and why, where each
applicable rule is satisfied, and each local specialization. Silence is not a
record. This section is added to the template structure for that reason, as
CAP-001's brief added it. `Capability-CAP-002.md` §5.4 is the machine-checked
mirror; the narrative below is the reasoned record, and the two agree.

### 12.1 Rule-by-rule

| Rule | Applies | Where satisfied, or why not |
|------|---------|------------------------------|
| STD-UI-1 Product vocabulary | yes | §2 and §3 throughout. **Specialization (permitted):** CAP-002 adds *score*, *percentile*, *peer set* and *not classified*, as its §5.4 records, and redefines no term. Inputs are named in product terms, never by payload key |
| STD-UI-2 Words describe behaviour | yes | §2.4, §3: removal and retirement keep history and say so; `dialog` `confirm` not `destructive`; percentile carries no `%` suffix; the filter-built universe is described as a snapshot |
| STD-UI-3 Comparable figures | yes | §2.1, §2.5, §5: scores signed, tabular figures, right- and decimal-aligned, precision fixed per column; the decimals are open (§9) |
| STD-UI-4 Missing is not zero | yes | §2.1, §5: an absent score is an em dash, `0.00` is a measured value at the peer mean, blank means the column does not apply; absent scores never sort as zero |
| STD-UI-5 Dates and timestamps | yes | §2.6, §5: ISO-8601 dates; America/Chicago on every timestamp; `as_of` session and period dates never converted |
| STD-UI-6 No abbreviation where compared | yes | §2.5, §2.6: input values such as market capitalisation render in full in Compare and evidence |
| STD-UI-7 One job per palette | partial | Status palette for classification states (§12.2). Score polarity is not colour-coded (DEC-0060), so the diverging pair is unengaged; no sequential or categorical palette is used, factor identity being carried in text |
| STD-UI-8 Colour never the sole carrier | yes | §6: every status a `badge` with text plus icon; sign in text; greyscale readability is the test |
| STD-UI-9 Colour follows the entity | no | No series and no per-entity colour; no chart (capability §5.4). A UX design that adds a chart engages it |
| STD-UI-10 Palettes validated, not judged | no, for this capability | Binds the shared theme; satisfied there by `design-system/theme-validation.md` |
| STD-UI-11 Paper and live distinguishable | no | CAP-002 delivers no trading and has no paper or live environment (capability §2) |
| STD-UI-12 Status form and severity | yes | §12.2 carries the tier table. **Specialization (permitted):** CAP-002 adds seven states, each mapped to an existing tier (DEC-0059, PROVISIONAL); no tier is added |
| STD-UI-13 Every value carries its as-of date | yes | §2.2, §2.6: every classification carries its set's date inline via the currency region; every input's `as_of` and `known_on` are one interaction away in the row expansion and inline on evidence |
| STD-UI-14 Presence has three states | yes | §2.1: per factor cell, present, absent, not determinable (not enough stocks to rank); the third carries `--pattern-indeterminate` and a label and never reads as the second |
| STD-UI-15 Nothing asserted beyond derived | yes | §2.4, §5: a filter-built universe shows saved members; classifications only from a `complete` set |
| STD-UI-16 No silent substitution | yes | §2.2, §5: the previous set is shown only with its mark; replacement is announced and dated (DEC-0062) |
| STD-UI-17 Known limitations propagate | yes | §2.6, §5: the restatement mark on every presentation of an affected value or growth classification, including history |
| STD-UI-18 A check states what it does not cover | yes | §2.6: present and current, not correct, stated once per evidence screen and below the classification table |
| STD-UI-19 Action tiers and error actionability | yes | §3 tiers every action and states each error's three parts and recovery; §12.3 summarises |
| STD-UI-20 The promotion gate | no | CAP-002 delivers no promotion (capability §2) |
| STD-UI-21 The kill switch | no | CAP-002 has no order path; capability §5.2 records the kill switch as a non-dependency |
| STD-UI-22 Control adjacency | no | No capital-at-risk and no destructive control; retirement and removal are neither (STD-UI-2) |
| STD-UI-23 State coverage | yes | §12.4 enumerates all eight states per region |
| STD-UI-24 Programmatic semantics and feedback | yes | §6 in full |
| STD-UI-25 Polled freshness | yes | §2.2, §5: the currency region polls every 10 seconds while a set is building or a run is non-terminal, stops otherwise, and shows its last-updated time; cadence recorded in system design constraint 18 |
| STD-UI-26 Multi-step operations | no | No operation spans steps; saving a filter result is one action on a reviewed result (capability §5.4) |
| STD-UI-27 Chart integrity | no | No chart (system design §4.3) |
| STD-UI-28 Chart provenance | no | No chart (system design §4.3) |
| STD-UI-29 Density tokens | yes | §5. **Specialization (permitted):** a tier is selected from the defined set and no value is introduced; the tier is inherited pending OQ-UI-4 |
| STD-UI-30 Lists at committed volume | partial | §5: the classified-stock list and member lists can reach 3000 (AC-11), are virtualised and provide search and filter. The `data-table` specification offers pagination and not virtualisation, so the component does not discharge the rule alone; inherited from CAP-001's record |

### 12.2 Status tier table (STD-UI-12)

The mapping is DEC-0059 (PROVISIONAL), reproduced here because STD-UI-12's
verification requires it to appear in the capability's UX brief and because the
capability's §5.4 delegates it here.

| Classification state | Tier | `badge` variant | Meaning to the owner |
|----------------------|------|-----------------|----------------------|
| `classified` | good, where a status word is rendered at all | none in tables; `status-good` where labelled | The factor was computed from every input it needs; the cell shows the signed score and the percentile |
| `not classified`, reason `input_missing`, `input_outdated` or `input_not_computable` | warning, never critical | `status-warning` | The set completed; this stock's evidence on this factor fell short, and the input is named |
| `not enough stocks to rank`, reason `not_enough_stocks` | serious | `status-serious`; the cell carries the indeterminate marker (STD-UI-14) | Fewer than 30 stocks qualified on this factor, so nothing was ranked; the count is stated in the column header |
| `retired`, reason `retired` | neutral, never a fault | `status-neutral` | The owner retired this stock from acquisition; it is not classified and not in any peer set; earlier classifications stand |
| `updating` | active | `status-active` | A later set is building; this one stays current until it completes |
| `not reflecting the latest acquisition` | warning | `status-warning` | An acquisition run ended and these classifications do not yet reflect it |
| `classification failed` | critical | `status-critical` | The latest attempt failed; the reason is shown; the previous set stays; the next qualifying run tries again |

The run outcome a set reflects reuses CAP-001's mapping: `succeeded` good,
`partial` warning, never good. Per-factor presence is governed by STD-UI-14
rather than STD-UI-12 and uses the `data-table` specification's indeterminate
treatment for the not-ranked case.

### 12.3 Actions

Tiered inline in §3. CAP-002 has two consequential actions, removing a member
and retiring a universe, both taking `dialog` `confirm`; every other action is
routine; it has no capital-at-risk action, because it places no orders, and no
destructive one, because nothing is deleted (capability §5.4, STD-UI-19 and
STD-UI-22 rows).

### 12.4 State coverage per region (STD-UI-23)

Eight states per data-bearing region, or a recorded reason one does not apply.
Unreachable is the shell's designed state delivered by CAP-001 on every route
and is not redesigned here.

| Region | Loading | Empty, never populated | Empty, nothing found | Partial | Stale | Unavailable, check could not run | Error | Unreachable |
|--------|---------|------------------------|----------------------|---------|-------|----------------------------------|-------|-------------|
| Classifications table | Skeleton at expected row count | *No stocks have been classified yet*, with why and a link to Runs (AC-22); never an empty table | Thresholds or search match no stock, with a reset; distinct from never populated | Ordinary: some stocks not classified on some factors, each named (AC-12); a set from a `partial` run says so in the currency region | The set is not current (AC-20), marked in the currency region with the poll's last-updated time | A factor not ranked: column header states *Not ranked* and the qualified count, cells carry the indeterminate marker (AC-14, STD-UI-14) | Header and toolbar kept, body replaced with the error and a retry | Shell state |
| Classification currency | Initial read pending | Never classified, stated (AC-22) | n/a: a set exists or none does | A later set building: *Updating* beside the current set's date | Not current, with the mark and the last-updated time; the state this region exists to show (AC-20) | n/a: no check runs here | Set read failed: region shows the error and a retry; a `failed` set is not this state, it is a designed rendering tiered critical | Shell state |
| Universes list | Skeleton | *No universes yet*, with the create action focused | Lifecycle filter matches none, with a reset | n/a: a universe is active or retired | Last-updated time; not polled | n/a | Body replaced, retry offered | Shell state |
| Universe detail: members | Skeleton at `member_count` | n/a: a universe has at least one member (AC-5) | Thresholds or search match no member, with a reset | Ordinary: some members not classified on some factors; retired members marked (AC-15) | Classification currency as above; as-of view labelled with its date | A factor not ranked, as the classifications table | Body replaced, header retained, retry offered | Shell state |
| Universe detail: events | Skeleton | n/a: a `created` event always exists | n/a: no filter | n/a | n/a: append-only, read on demand | n/a | Body replaced, retry offered | Shell state |
| Compare | Skeleton with one column per chosen symbol | No stock chosen yet: *Choose stocks to compare*, with the entry focused | A typed symbol is not an instrument: named, column not added | A stock not classified on a factor shows the status and input in that column (flow step 5) | Classification currency as above | A factor not ranked: row group header states it once | Body replaced, retry offered; chosen symbols preserved in the URL | Shell state |
| Stock evidence: current | Skeleton matching the three groups | Never classified: *This stock has not been classified because no classifications exist yet* (AC-22) | n/a | Some factors classified, some not; each not-classified factor names its input (AC-12) | Classification currency as above | A factor not ranked: stated in that factor's group | Body replaced, retry offered | Shell state |
| Stock evidence: history | Skeleton | No earlier set exists for this stock, stated, distinct from never classified | n/a: no filter | n/a: each row is one set's complete result for the stock | n/a: history is append-only and read on demand (AC-18, AC-19) | n/a | Body replaced, retry offered | Shell state |
