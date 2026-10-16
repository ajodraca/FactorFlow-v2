---
artifact_schema_version: 1
artifact_id: CAP-002-ux-brief
artifact_type: ux-brief
artifact_version: 2
capability_id: CAP-002
title: Universe & Factor Classification
created: 2026-10-15
updated: 2026-10-16
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
ai_provenance:
  agent_id: ux-brief-agent
  agent_version: "1.1"
  model: claude-fable-5-1
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-16T23:20:00Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
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
    - id: CAP-001-ux-brief
      version: "7"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: factorflow-design-system
      version: "as of 2026-10-15"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# UX Brief: Universe & Factor Classification

**Capability:** CAP-002
**Design System:** FactorFlow Design System (shadcn/ui + Radix), configured at `projects/factorflow-v2/design-system.yaml`, held in `design-system/` in this repository. `design_system_available = true`: the repository and all configured paths (`design-system/components/`, `design-system/theme.css`, `design-system/component-map.json`, `design-system/intake.md`) were verified to exist, and all 18 component specifications as of 2026-10-15 were read for this brief, including the six added for the product UX blueprint (`checkbox`, `command`, `progress`, `radio-group`, `stepper`, `toggle-group`) and the `data-table` `virtualised` variant.
**Theme:** `design-system/theme.css`
**Designer Handoff Date:** 2026-10-16

This brief was produced in an unattended `$design-run`. Every choice the skill
would otherwise have asked the owner about is recorded as a decision under
`projects/factorflow-v2/decisions/` and marked **PROVISIONAL** where it rests on
a derivation rather than an approved artifact. Version 1 recorded DEC-0059 to
DEC-0062; this version records DEC-0072 to DEC-0076 and cites DEC-0068 to
DEC-0071, which the system design v2 recorded the same day.

**Version 2 (2026-10-16)** aligns this brief with the product UX blueprint
(`PRODUCT-UX` v6) and its Research screen specification (`PRODUCT-UX-S03` v4),
both approved on 2026-10-16 after version 1 was written, with STD-UI v6, and
with the system design v2 that was refined for the same reason. Following
`docs/ux/README.md` and the skill's Configuration, this brief now **cites
`PRODUCT-UX` as a source artifact, claims this capability's rows from the
blueprint's milestone map (§10), starts each screen from its screen
specification, and records only what CAP-002 adds or specializes**. Where the
blueprint or S03 settles something, this brief cites it rather than re-deriving
it; where CAP-002 departs from them, the departure is recorded with its reason
rather than redesigned. The Classifications screen and the Classification
currency region of version 1 are folded into S03; the other three screens keep
their information architecture and are restated against the blueprint's shell,
patterns and display labels. What CAP-002 computes and stores is unchanged.

CAP-002 is the second interface capability, and the first that renders a
derived number rather than a recorded fact. CAP-001's interface tells the owner
what data the product holds; this one tells the owner what the product computed
from it, and where it could not. The acceptance criteria that exist because a
plausible interface would lie are more numerous than in CAP-001: AC-12 forbids a
score built from fewer inputs than its definition, AC-14 forbids ranking a
factor on too few stocks, AC-20 forbids a half-finished set shown as current,
AC-22 forbids an empty list that reads as complete, and AC-23 requires a
restatement mark that follows the score into history. Blueprint principle 5
(*never hide incomplete data; never fill it in*) and STD-UI-4, STD-UI-13 to
STD-UI-18 and STD-UI-23 carry the same obligations as rules. Every
presentation decision below is subordinate to them.

**Vocabulary in this document.** As STD-UI-1 v6 and blueprint §7 require, text
the owner reads uses the display labels: *stock*, *followed stock*, *stop
following*, *download*, *Complete* and *Partial*, *Incomplete*, *Not enough to
rank*, and a factor's *score* shown as a *percentile* and a *standardised
score*. This brief, being an SDD document, keeps the domain terms (instrument,
acquisition run, not classified, classification) when it names API fields,
acceptance criteria and persistence, and writes every user-visible string in
italics with its display label. The UX design and `classification-ui` must do
the same (DEC-0072).

## 1. Screens Needed

The blueprint's milestone map (§10) assigns CAP-002 one M1 row, claimed here
verbatim: **S03 Research with inspector and selection tray; stock evidence,
compare and universes routes.** Its route map (§2.2) names the paths, and the
system design v2 (§4.2, screen registration; DEC-0068) registers them.

| Screen | Purpose | User Flow / AC |
|--------|---------|----------------|
| S03 Research, `/research` | Screen specification `docs/ux/screens/S03-research.md` v4, delivered in full except the two M2 controls it marks (*Use in a strategy*, *Start a strategy from this screen*) and the holdings line (M2, review v4 FINDING-45). Three panes in `card`s: Filters (scope, per-factor threshold sentences, hide-incomplete), Results (`h1` *{n} stocks match*, as-of line, **Save these {n} as a universe…**, `data-table` `virtualised` with blueprint §4.4 factor cells and the §4.6 selection tray) and Inspector (§4.5, the selected stock's scores, inputs' as-of, memberships, evidence link). The not-current banner above the results header carries the score-set state (blueprint §3.5, §8). This screen folds version 1's Classifications screen and Classification currency region into one approved layout | Flows "See stocks classified after an acquisition", "Build a universe from a factor filter", "Compare stocks and inspect the evidence" steps 1 and 2; S03 §2: AC-1 to AC-3, AC-9, AC-12, AC-14, AC-16, AC-17, AC-21, AC-23, and through §3 and §7 also AC-15, AC-20, AC-22; S03 acceptance checks S03-1 to S03-7; system design v2 §3.3 steps 13 to 18, `GET /api/classifications` (with `match_count`, `hide_incomplete`), `GET /api/classifications/summary`, `GET /api/classifications/stocks/{symbol}`, `POST /api/universes` with `filter` and `set_id` |
| Stock evidence, `/research/stocks/:symbol` | "CAP-002 page, restyled into this shell" (blueprint §2.2, §2.3). One stock: its score per factor in the current set, every input with its value, status, the period or session it came from and the date it was known, the *Possibly restated* mark, the statement of what the check does not cover, and the stock's scores in earlier sets. Reached from the inspector's **See every input and its date** (S03 §3) | Flow "Compare stocks" step 4, "Understand and fix insufficient evidence"; AC-12, AC-13, AC-17, AC-18, AC-19, AC-23; system design v2 §3.3 step 17, `GET /api/classifications/stocks/{symbol}`, `/history` |
| Compare, `/research/compare?symbols=` | "CAP-002 page, restyled". Two to six stocks side by side (DEC-0070) with all three factors: percentile, standardised score, *Incomplete* with its reason, *Possibly restated* mark, and the inputs each factor was built from. Reached from the selection tray's **Compare side by side** (S03 §6) | Flow "Compare stocks and inspect the evidence" steps 3 and 5; AC-12, AC-16; system design v2 §3.3 step 16, `GET /api/classifications` with `symbols` (2 to `MAX_COMPARE_SYMBOLS` = 6) |
| Universes, `/research/universes` | "CAP-002 page, restyled". The owner's active universes with member counts, retired universes reachable but separated, and the action to create a universe by hand | Flows "Build a universe by hand", "Maintain universes over time"; AC-1, AC-3, AC-4, AC-5; system design v2 §4.2 `GET /api/universes`, `POST /api/universes` with `symbols` |
| Universe detail, `/research/universes/:id` | "CAP-002 page, restyled". The members of one universe with their scores from the current set, in the same results-and-inspector composition as S03 scoped to the universe; add and remove members, rename, retire; membership as of a past date; and the universe's event history | Flows "Build a universe by hand" step 3, "Compare stocks" steps 1 and 2, "Maintain universes over time"; AC-3, AC-4, AC-5, AC-6, AC-15, AC-16; system design v2 §3.2, §4.2 `GET /api/universes/{id}`, `/events`, `PATCH`, `POST .../members`, `DELETE .../members/{symbol}`, `DELETE /api/universes/{id}` |

Five routes, one rail destination. **Research** is the destination (blueprint
§2.1), and the rail it sits in belongs to the *App shell & data health*
capability the blueprint names (§12 D-8), not to CAP-002. Until that capability
delivers the blueprint's shell, `classification-ui` appends exactly one Research
entry to the delivered CAP-001 rail as a minimal, reversible composition and
registers its five routes at the `routes.tsx` seam (DEC-0068 from the approved
blueprint; DEC-0069, PROVISIONAL, for the interim composition; system design v2
§8 question 4). Version 1's two destinations and five `/classifications`,
`/universes`, `/compare` and `/stocks` routes are withdrawn (DEC-0061 and the
route list of DEC-0064 superseded by DEC-0068). The shell's status region is
not extended: blueprint §3.5 shows *classifications updating / not current*
where scores are shown, never in the shell.

Two screens CAP-002 does **not** define consume its state: S01 Home's data tile
(*{n} of {m} stocks current*, score as-of, *Not reflecting the latest
download* when stale; S01 §5, S01-6) and S09 Data health's *Factor scores*
check card (S09 §3, §5). Both are the shell capability's, run "on CAP-002's
classification state as it is" (blueprint §10), and read it through
`GET /api/classifications/summary` (system design v2 §4.2; DEC-0071,
PROVISIONAL), whose consumer identifier is unpublished until that capability's
design exists (§9).

## 2. Information Architecture

### 2.1 S03 Research

S03 §3 to §7 fix the layout, component mapping, view model, interactions and
states of this screen. This brief does not re-derive them. It maps S03's view
model to CAP-002's reads, then records what CAP-002 adds or specializes.

**Data elements, S03 §5 against the system design v2:**

- `scope` (source: AC-16; `GET /api/universes` for the list of active universes, `universe_id` on the list read). *Look in* offers *All followed stocks · {n}* and each active universe by name
- `thresholds`, per factor `{measure, direction, value}` (source: AC-16; the twelve bounds `{factor}_percentile_min/_max`, `{factor}_score_min/_max`, system design v2 §3.3 step 15: the sentence *[percentile|standardised score ▾] [at least|at most ▾] [n]* maps one-to-one onto them, so no new filter model exists)
- `hideIncomplete` (source: S03-1; `hide_incomplete`, default false; DEC-0071)
- `sort` (source: AC-16; `sort` from the allowlist `symbol`, `{factor}_score`, `{factor}_percentile`, and `order`)
- `classificationSet` `{producedAt, fromDownload, current, updating, failedReason}` (source: AC-20, AC-21; the `set` block or `never_classified: true` on the list and summary reads: `classification_date`, `ended_at`, `run_id`, `state`, `not_current` with the building or failed later set and its `failure_reason`)
- `peerCounts` per factor `{qualified, followed}` (source: AC-14; `factors[].qualified_count`, `ranked`, and the set's `active_instruments`)
- `rows[]`, each factor `{state, percentile, standardisedScore, reason, restated}` (source: AC-9, AC-12, AC-14, AC-15, AC-23; `stocks[]` with `lifecycle` and per-factor `status`, `score`, `percentile`, `reason_code`, `reason_input`, `restated_possible`). Name is `instrument.name` through the same read
- `matchCount` (source: S03-2; `match_count`, the count over the whole filtered set, never the page)
- `selected`, `checked` (client; `checked` kept across filter changes, S03 §5)
- `inspector`: the selected row plus `memberships[]` and `inputsAsOf` per factor (source: AC-17, S03-3; `GET /api/classifications/stocks/{symbol}`, whose `factor_input` rows carry `as_of` and `known_on` and whose `memberships` carry `universe_id` and `name`). `heldBy[]` is M2 and absent (FINDING-45)

**Grouping and hierarchy:** S03 §3. Filters left, Results centre, Inspector
right in a wrapping flex row of `card`s; the inspector moves below the list
under 1280 px (blueprint §3.1, §4.5). Within the results, one row per stock,
the three factors as peers (blueprint §4.4 cells, column headers carrying the
factor swatch), default sort by symbol so that no factor is privileged; the
owner sorts by any factor (AC-16).

**Primary vs. secondary information:** S03 §1 and blueprint principle 4. Primary:
the match count and each stock's percentile per factor, or *Incomplete* / *Not
enough to rank* in its place. Secondary: the standardised score, the inputs and
their as-of dates and the restatement explanation, all in the inspector; the
full inputs on the evidence page.

**What CAP-002 adds or specializes beyond S03.** Each item names its reason;
departures from the approved specification are marked as such.

1. **Score-set state and the as-of line** (blueprint §3.5, §4.8, §8; DEC-0072,
   DEC-0073). The as-of line under the results title reads *Scores from
   {date} {time} CDT, download #{n} · sorted by {factor}*; naming the download
   is a CAP-002 specialization for AC-21 (review v4 FINDING-23) and *download
   #{n}* links to that download's detail (blueprint `/data/downloads/:id`
   once the shell capability delivers it; the delivered CAP-001 run detail
   meanwhile). While a later set builds, the line adds `badge` `status-active`
   *Updating* and *checked {time}* (STD-UI-25) and the `status-warning` banner
   of S03 §3 sits above the results header with its approved text. When the
   latest attempt failed, the banner's `status-critical` variant reads *Score
   update failed {time}: {reason}. Showing scores produced {time} from download
   #{n}. The next complete download will try again.* (DEC-0073, PROVISIONAL;
   S03 §5 carries `failedReason` with no rendering). The set history
   (`GET /api/classifications/sets`) is one interaction from the as-of line as
   a `dialog` `standard`, never a region of S03 (DEC-0073).
2. **Refresh once on completion** (DEC-0062, PROVISIONAL, kept). S03 says the
   newer set *replaces this one when complete*; CAP-002 fixes how: the as-of
   line announces the new date and download politely, the table dims and
   reloads under the `data-table` contract, and sort, thresholds, scope,
   `hideIncomplete`, the selected row and the checked rows are kept by symbol.
   It does not wait for the owner (flow "See stocks classified" step 3, *without
   any further action*) and does not replace silently (STD-UI-16, STD-UI-24).
   The poll runs every 10 seconds while a set is building or a download is
   non-terminal and stops otherwise (system design v2 constraint 18; DEC-0054).
3. **Search by symbol in the Filters pane, a departure from S03 §3** (DEC-0074,
   PROVISIONAL). Above *Look in*, an `input` `text` labelled *Find a stock*
   (placeholder *Symbol*) applies a prefix match server-side through the
   `symbol` parameter the list read already carries, lives in the URL query like
   every other filter (S03-5) and is cleared by **Clear filters**. Reason:
   STD-UI-30 requires search and filter at the committed 3000-stock volume
   (AC-11), blueprint §11 records the research list as having search, and S03
   as approved has none (review v4 FINDING-22, open). It matches the symbol
   only: the read has no name parameter, and search by symbol and name
   product-wide is the shell's command palette (blueprint §3.4).
4. **A retired stock's cell** (DEC-0073, PROVISIONAL; blueprint §8 names no
   state for it). Under *All followed stocks* a stock the owner has stopped
   following is not listed, because it is not followed. Under a universe scope,
   on universe detail, in compare and on its evidence page it keeps its row and
   each factor cell shows `badge` `status-neutral` *Not followed* in place of
   the percentile, with *Not followed since {date}. Earlier scores stand.* in the
   tooltip and the inspector (AC-15). Neutral, never a fault: the owner chose
   it (the DEC-0059 row the blueprint does not supersede).
5. **The *Possibly restated* mark's accessible name** (DEC-0075, PROVISIONAL;
   review v4 FINDING-56). Blueprint §4.4 draws a `badge` `status-neutral`
   reading *R* with the accessible name *Possibly restated*; the badge
   specification §5 forbids an accessible name that differs from the label. The
   resolution the UX design should take: the mark is part of the factor-cell
   composition in `web/src/components/patterns/`, an inline element carrying the
   `badge` `status-neutral` tokens whose text is *Possibly restated* rendered
   visually hidden, with the glyph *R* `aria-hidden` beside it. The rendering
   the blueprint draws is kept; the component it names is not used. The
   explanation stays in the inspector and on the evidence page.
6. **Save these {n} as a universe…** (DEC-0076, PROVISIONAL; review v4
   FINDING-55, FINDING-42). At zero matches the control renders `button`
   `blocked` with *No stocks match these filters, so there is nothing to save.*
   (AC-5; `422 empty_universe` is the backstop). The saved members are exactly
   the stocks the header counts: a stock incomplete on a factor that carries no
   threshold is a member, because thresholds match on stored values (system
   design v2 §3.3 step 15); when *Hide stocks with an incomplete score* is on,
   hidden stocks are not members, so the `filter` the save posts carries
   `hide_incomplete` with the thresholds and the scope and the snapshot equals
   the displayed result (S03-7, AC-2). The `dialog` `standard` states *{n}
   stocks, including {m} with an incomplete score* when m > 0, the scope and
   thresholds in words, and a name field. Completion is confirmed by `toast`
   `success` *Saved {n} stocks as {name}* linking to the new universe
   (STD-UI-24); **Add to universe…** confirms the same way. Not offered while
   the scope is a universe: the save carries thresholds only (system design v2
   §4.2).
7. **Compare side by side** is enabled while 2 to 6 rows are checked (S03 §6;
   DEC-0070, from the approved specification). With one or more than six
   checked, the tray action renders `blocked` with *Check 2 to 6 stocks to
   compare them.* This closes version 1's open question.
8. **Selection and checking never interfere** (S03 §6): click or `Enter`
   selects into the inspector, `Space` on the checkbox checks; `↑`/`↓` move the
   selection with the inspector following after 150 ms. Row checkboxes are
   named *Select {SYMBOL}* (checkbox specification §5).
9. **The Incomplete reason in the owner's words** (AC-12, STD-UI-1). The
   tooltip and inspector sentence follows S03 §8: *Incomplete: {input} for the
   quarter ending {date} is missing, so {factor} can't be compared fairly. It
   isn't guessed.* with *is outdated* or *couldn't be computed* for the other
   reason codes. Inputs are named in product vocabulary (book-to-price,
   earnings yield, free-cash-flow yield, revenue growth, earnings-per-share
   growth, 3-, 6- and 12-month total return), never by payload key (system
   design v2 §8 question 1 bears on vocabulary only).
10. **A factor below 30 qualifying stocks** (AC-14, S03 §7 *Unavailable*,
    S03-4): every cell in the column reads `badge` `coverage-unknown` *Not
    enough to rank* and the header says *{n} qualified, 30 needed*; a screen
    reader hears the count once in the header, not 3000 times.

### 2.2 Score-set state, folded into S03 and consumed by the shell's screens

Version 1 defined a *Classification currency* region composed into every
classification-bearing screen. Blueprint §3.5 and §4.10 settle where that
state lives: *shown where scores are shown, never in the shell*, as the as-of
line (§4.8) and the *Stale* rendering (§4.10, *not reflecting the latest
download*, `badge` `status-warning`). On S03 that is the banner and as-of line
of §2.1 item 1; on universe detail, compare and stock evidence it is the same
as-of line and banner composition above the scores (AC-20, AC-21). The region
is no longer a screen of this brief.

**Data elements** (unchanged from version 1 in substance; renamed to the
display labels): the current set's `classification_date` and the download it
reflects (`run_id`, AC-21); whether a later set is building (*Updating*) or the
latest attempt failed with its `failure_reason` (*Score update failed*, AC-20);
the building set's `started_at`; that nothing has been scored yet
(`never_classified`, AC-22); the poll's *checked {time}* (STD-UI-25); the
download's outcome, *Complete* or *Partial*, because a set built after a
partial download carries more *Incomplete* cells and the owner should know why
(AC-10, capability §2). Source: the `set` block on `GET /api/classifications`
and `GET /api/classifications/summary` (system design v2 §3.3 steps 13 and 18).

**Three mutually exclusive headline states** render under blueprint §8's labels
and tiers (DEC-0072): current (as-of line only), *Not reflecting the latest
download* (warning) with *Updating* (active) while a later set builds, and
*Score update failed* (critical) with the previous set still shown and marked.
A fourth, never scored, replaces the results body (S03 §7 *Empty, never
populated*: *No stocks have been scored yet.* with the latest download's state
and a link to Data health, AC-22). There is no progress indicator for a building
set: the engine runs as SQL and reports no per-stock progress (system design
§3.1 step 8), so the `progress` `indeterminate` variant is not used and the
state carries its start time instead.

**What the shell capability's screens read.** S01's data tile and S09's *Factor
scores* card render the same three labels and *{n} of {m} stocks current*
from `GET /api/classifications/summary`, where a stock is current when none of
its inputs in the current set is missing or outdated (AC-12, AC-13; review v4
FINDING-32; DEC-0071, PROVISIONAL). This brief specifies the read's meaning,
not those screens.

### 2.3 Universes (restyled)

The information architecture of version 1 stands; it is restated against the
blueprint's shell and labels.

**Data elements:**

- Universe name (source: AC-1, AC-4; `GET /api/universes` `name`)
- Lifecycle, active or retired, and when retired (source: AC-4, AC-6; `lifecycle`, `retired_at`)
- Member count (source: AC-3, AC-5; `member_count`)
- When created (source: `created_at`; STD-UI-5)
- Count of active universes (source: AC-3; derived from the list)

**Grouping and hierarchy:**

- A single `card` on the page ground holding the table at full width (blueprint §3.1, tables use the full width); the page title *Universes* in the top bar; **New universe…** (`button` `default`) at the right of the card header, the one write action on the screen. There is no delete at any level of the interface (STD-UI-2, AC-6)
- Active universes are the working list; retired universes are present but separated by a lifecycle `select` `inline` defaulting to active, because flow "Maintain universes" step 4 says a retired universe no longer appears among the active ones while its history can still be viewed. A retired universe carries `badge` `secondary` *Retired*, the blueprint's own treatment of a retired thing (§4.3)
- The row's name is the link to detail (CAP-001's link-not-row-click convention)

**Primary vs. secondary information:**

- Primary: the active universes and how many members each has.
- Secondary: retired universes, creation and retirement timestamps, filter provenance (on detail).

**A universe always has at least one member** (AC-5). The create action cannot
complete with no stocks, so the dialog's confirm renders `button` `blocked`
with the reason until at least one symbol is entered; `422 empty_universe` is
the backstop. Creation is routine (blueprint §9).

### 2.4 Universe detail (restyled)

**Data elements:**

- Name, lifecycle, created and retired timestamps, member count (source: AC-4, AC-6)
- Each member: symbol, name, whether still followed, `member_since`, and its score per factor from the current set with the same elements as §2.1 (source: AC-3, AC-15, AC-16; `GET /api/universes/{id}`)
- The as-of date the membership is shown for, defaulting to now (source: AC-6; `as_of`)
- Filter provenance when the universe was saved from a filter: the thresholds, the hide-incomplete state and the set they were evaluated against (source: AC-2; system design §4.4 `filter_provenance` on the `created` event; DEC-0076)
- The event history: `created`, `renamed`, `member_added`, `member_removed`, `retired`, each with the name or symbol and `recorded_at`, newest first (source: AC-4, AC-6; `/events`)
- Score-set state as §2.2 (source: AC-20, AC-21)

**Grouping and hierarchy:**

- A `card` `summary` header for the universe's own attributes and actions (**Add stocks…** `default`, **Rename** inline, **Retire…** `secondary`), then the member table, then the event history behind `tabs` `default` (*Members* / *History*) with the active tab in the URL
- The member table **is S03's results pane and inspector scoped to the universe**: `data-table` `virtualised`, blueprint §4.4 factor cells, the same sort and threshold sentences (in a Filters pane reduced to thresholds, hide-incomplete and *Find a stock*), the same selection tray with **Compare side by side** and **Add to universe…**, the same inspector. AC-16 requires comparison to work both across all stocks and within a universe and the owner should not learn two tables. In-row **Remove…** (`button` `ghost`, named *Remove {SYMBOL} from {universe}*) is the one addition
- A member the owner has stopped following stays in the table with *Not followed* on every factor (AC-15, flow "Maintain universes" step 5; DEC-0073). It is not omitted and not moved
- Membership as of a past date is reached from the event history first: membership changes only at events, so *View members as of this event* on any `member_added`, `member_removed` or `created` event shows the membership on that date. A typed ISO-8601 date is the second path, through `input` `text`, which avoids a date-picker component the design system does not have without weakening AC-6

**Primary vs. secondary information:**

- Primary: who is in this universe now, and how each member scores.
- Secondary: the event history, past membership, filter provenance, timestamps.

**A universe saved from a filter is a snapshot, and the screen must say so**
(AC-2, STD-UI-15). The provenance line reads as history: *Saved on 2026-10-15
from the scores of 2026-10-15: value percentile at least 80, momentum
standardised score at least 0, stocks with an incomplete score hidden*, and no
control re-evaluates it. A member whose score has since changed stays a member.

**Removal and retirement keep history, and the words must say so** (STD-UI-2,
AC-6). Both are consequential (blueprint §9, *CAP-002 wording*) and take
`dialog` `confirm`, never `destructive`: *Remove AAPL from Tech? Its membership
until today stays in the universe's history. Its scores are not affected.* and
*Retire Tech? It leaves your active universes. Its members and history stay
viewable.*

**Removing the last member is refused in favour of retirement** (AC-5, flow
"Maintain universes" step 6). The remove action on the sole member renders
`button` `blocked` with *This is the last member. Retire the universe instead.*
and the retire action beside it; `409 last_member` is the backstop and keeps
the dialog open with the error and the retire action.

### 2.5 Compare (restyled)

**Data elements:**

- The chosen stocks, two to six, by symbol, each with name and whether still followed (source: AC-16; DEC-0070; `GET /api/classifications` with `symbols`)
- Per stock, per factor: percentile, standardised score, *Incomplete* with its reason, *Not enough to rank*, *Not followed*, *Possibly restated* mark (source: AC-12, AC-14, AC-15, AC-16, AC-23)
- Per stock, per factor: the inputs the factor was built from, each with value, status and as-of date, as flow step 3 requires *all three factors and their inputs* (source: AC-16, AC-17; `GET /api/classifications/stocks/{symbol}` per stock)
- Score-set state as §2.2 (source: AC-20, AC-21)

**Grouping and hierarchy:**

- One `card` at full width. Stocks as columns, factors and their inputs as rows: value percentile, value standardised score, book-to-price, earnings yield, free-cash-flow yield; then growth and its two inputs; then momentum and its three windows. Side by side means the comparison axis is the row, so each row holds one quantity at one precision across every stock (STD-UI-3)
- Each factor is a row group with its name and swatch as the group header (blueprint §4.4: the swatch is identity). The `badge` factor variants are not used: they tag a record as a value, growth or momentum stock, which CAP-002 never does
- Compare is an evidence page in the sense of blueprint §4.4, so the standardised score renders here in `--muted-foreground` beneath the percentile, as in the inspector
- A stock incomplete on a factor keeps its column and shows *Incomplete* with the input named in that factor's cells, never a value and never a gap (flow "Compare stocks" step 5)

**Primary vs. secondary information:**

- Primary: the three percentiles per stock, read across.
- Secondary: the standardised scores, the input values and dates, which explain a difference.

**How stocks reach this screen.** The S03 or universe-detail selection tray's
**Compare side by side** with 2 to 6 checked rows, routing to
`/research/compare?symbols=` so the view can be linked and survives reload
(S03 §6). The screen's own entry adds or removes a column within the bound
(`input` `text`, *Add a stock*); the seventh is refused before the request with
*A comparison holds up to 6 stocks.*, and the read refuses a list outside 2 to 6
with `422` as the backstop. No horizontal scroll is needed at six columns on
the design width.

**This is a composition, not a `data-table` variant.** It has no sorting, no
filtering and no pagination, and its records run across rather than down. The
designer should build it with native `<table>` semantics, programmatic row and
column headers, `--font-numeric` and the `data-table` token set, per
`design-system/intake.md` step 1.3, and should not open a component-spec gap.

### 2.6 Stock evidence (restyled)

**Data elements:**

- Symbol, name, whether still followed (source: AC-15)
- Score-set state as §2.2, and when no set exists the statement that the stock has no score because nothing has been scored (source: AC-22; `set: null`)
- Per factor: percentile, standardised score, *Incomplete* with its reason, *Not enough to rank*, *Possibly restated* mark (source: AC-12, AC-14, AC-23)
- Per factor, every input: name, status `present`, `missing`, `outdated` or `not_computable` rendered as *Present*, *Missing*, *Outdated*, *Couldn't be computed*, value, `as_of` (the fiscal period end or session date it came from), `known_on` (the date FactorFlow knew it), `restated_possible`, and the reason detail when missing, including the download outcome that left it missing (source: AC-12, AC-13, AC-17; system design §4.4 `factor_input`)
- The active universes the stock belongs to (source: `memberships`; DEC-0071)
- The statement of what the check does not cover (source: STD-UI-18; S03 §8 results footnote)
- Earlier scores of this stock: per set, the date, download, and per-factor percentile, standardised score, state and mark, newest first (source: AC-18, AC-19; `/history`)

**Grouping and hierarchy:**

- The page title is the symbol and name; the as-of line and banner of §2.2 sit under it. Three factor groups, each a `card` `summary` description list of the factor's result (blueprint §4.4 cell, then the standardised score) and its inputs. The `summary` variant is written for exactly this, the attributes of one entity, and the input counts are small (three, two, three)
- Current evidence and history are two views of one subject: `tabs` `default` (*Now* / *Earlier scores*) with the active tab in the URL
- Dates everywhere: `as_of` is a session or period-end date and renders unconverted; `known_on` is a date; set timestamps carry America/Chicago (STD-UI-5)

**Primary vs. secondary information:**

- Primary: on each factor, does this stock have a score, and if not, which input is missing or outdated and what made it so (flow "Understand and fix insufficient evidence" step 2), readable without expanding anything.
- Secondary: the component periods and sessions behind each input, the download that left an input missing, the memberships, the history.

**Every error here has three parts and a recovery action** (STD-UI-19). For an
outdated fundamental: *Value for KO couldn't be scored: its latest statement
covers a quarter that ended more than 6 months before 2026-10-15.* and the
recovery, *The next Complete or Partial download will try again.* Where the
provider holds no such data (flow step 5), the screen says so and offers no
recovery, because none exists.

**The check states what it does not cover** (STD-UI-18, S03 §8): *A score is
shown only when every input is present and current. This checks presence and
currency, not whether the provider's values are correct.* The restatement mark
is the one case where the product knows a limitation and says so (STD-UI-17):
*Possibly restated: the financials behind this score were downloaded for a
period that had already been reported before FactorFlow began following this
stock, so they may reflect later restatements.*

## 3. Interactions Required

Every action carries its STD-UI-19 tier as blueprint §9 fixes it for CAP-002:
save results as a universe, select and compare are **routine**; create and
rename a universe and add members are **routine**; remove a member and retire a
universe are **consequential** with CAP-002's wording in `dialog` `confirm`.
CAP-002 has no capital-at-risk action and no destructive one: retirement and
removal keep history (STD-UI-2). Every error names the operation, the resource
and the reason, and offers a recovery action where one exists; the error
envelope's `code` selects the wording and its `message` is never shown raw.
S03 §6 fixes the Research interactions; the rows below cite it and add CAP-002's
specializations.

| Screen | User Action | Tier | Expected Outcome | Error / Edge Case |
|--------|-------------|------|------------------|-------------------|
| S03 Research | Read the scored stocks | routine | Each followed stock with its percentile per factor (blueprint §4.4), the match count, and the as-of line naming the scores' date and download (AC-9, AC-12, AC-21) | Never scored: *No stocks have been scored yet.* with the latest download's state and a link to Data health (S03 §7, AC-22); never an empty table. A factor below 30 qualifying stocks: every cell *Not enough to rank*, header *{n} qualified, 30 needed* (S03-4, AC-14) |
| S03 Research | Change scope, thresholds, hide-incomplete, sort | routine | Server-side over the full set; the count and rows update; rows stay visible and dimmed while loading (S03 §6); state in the URL, surviving reload and back (S03-5) | Nothing found: *No stocks match these filters.* with **Clear filters** (S03 §7). A percentile outside 0 to 100 or a non-finite standardised score is a field error on blur, before the request (`input` contract; system design constraint 15) |
| S03 Research | Find a stock by symbol | routine | Prefix match over the full set, server-side, in the URL (DEC-0074, departure from S03 §3 for STD-UI-30, FINDING-22) | Matches none: the nothing-found state with **Clear filters** |
| S03 Research | Select a row (click or `Enter`, `↑`/`↓`) | routine | The inspector shows the stock's percentiles, standardised scores, inputs' as-of, memberships and the evidence link (S03 §3, S03-3); 150 ms debounce on arrow keys | Checking never selects and selecting never checks (S03 §6) |
| S03 Research, Universe detail | Check rows and compare | routine | The selection tray appears (*{n} selected*, announced politely); **Compare side by side** opens `/research/compare?symbols=` with 2 to 6 checked rows (S03 §6; DEC-0070) | One or more than six checked: the action renders `blocked` with *Check 2 to 6 stocks to compare them.* |
| S03 Research, Universe detail | Check rows and add to a universe | routine | **Add to universe…** opens `dialog` `standard` listing active universes plus *New universe*; on confirm the stocks are added and `toast` `success` *Added {n} stocks to {name}* confirms, naming already-member stocks when any (AC-1, AC-4; DEC-0076) | `409 instrument_not_acquired`: see Universes below. `409 universe_retired`: *This universe is retired and can't be changed. Its members and history are still viewable.* |
| S03 Research | Save these {n} as a universe… | routine | `dialog` `standard`: the count sentence, the scope and thresholds in words, a name field; on save the universe exists with exactly the displayed result and `toast` `success` *Saved {n} stocks as {name}* links to it (AC-2, S03-7; DEC-0076) | Zero matches: `blocked` with *No stocks match these filters, so there is nothing to save.* (AC-5). `409 classification_set_changed`: *Could not save these stocks as a universe: the scores changed while you were reviewing them. Review the new result, then save again.* `409 universe_name_in_use`: field error, dialog stays open. Not offered while the scope is a universe |
| S03 Research, every scored surface | Watch a set complete | routine | Banner and *Updating* while building, polled every 10 seconds with *checked {time}*; on completion the screen refreshes once, announced, with filters, sort, scope, selection and checked rows kept (DEC-0062, PROVISIONAL) | The attempt fails: the previous set stays, marked, with the `status-critical` banner and its reason, and the sentence that the next complete download will try again (AC-20; DEC-0073). Polling stops when no set is building and no download is non-terminal (system design constraint 18) |
| S03 Research | Open the download the scores reflect | routine | *download #{n}* in the as-of line opens that download's detail (AC-21) | A *Partial* download: the as-of line says so, because it explains *Incomplete* cells |
| S03 Research | Open the set history | routine | `dialog` `standard`: every set newest first with state, date, download, timings and per-factor qualified counts (DEC-0073) | A failed set shows its reason; a building set its start time |
| Universes | New universe… | routine | `dialog` `standard` with a name field and a bulk symbol field (`textarea` `list`); on create the universe exists and its detail opens showing members with their scores (AC-1, flow step 3) | No symbol entered: the confirm renders `blocked` with the reason (AC-5). `409 instrument_not_acquired`: *Could not create the universe: FactorFlow doesn't follow MSFT, TSLA. Follow them on Data health, then try again.* naming every unfollowed symbol; nothing was created and the entered symbols stay (AC-1, system design constraint 13). `409 universe_name_in_use`: field error. A malformed symbol is a field error before the request |
| Universes | Show retired universes | routine | Lifecycle `select` `inline`: active, retired, all | Retired list empty: nothing-found, not never-populated |
| Universe detail | Add stocks… singly or in bulk | routine | Added stocks appear with their scores; already-member stocks are reported, not errored (AC-4); `toast` `success` confirms | `409 instrument_not_acquired` refuses the whole request naming every unfollowed symbol, entered symbols preserved. `409 universe_retired` as above. More than `MAX_SYMBOLS_PER_REQUEST`, 1000, in one submission: field error stating the bound |
| Universe detail | Remove… a member | consequential | `dialog` `confirm`: *Remove AAPL from Tech? Its membership until today stays in the universe's history. Its scores are not affected.* On confirm the row leaves the current membership and appears in the history (AC-4, AC-6) | Sole member: `blocked` with *This is the last member. Retire the universe instead.* and the retire action beside it (AC-5). `409 last_member` as backstop. Never `destructive` (STD-UI-2) |
| Universe detail | Rename | routine | Inline name edit; identity and history unchanged (AC-4) | `409 universe_name_in_use`: field error naming the conflict. Empty after trimming: field error. Maximum length is open (§9) |
| Universe detail | Retire… | consequential | `dialog` `confirm`: *Retire Tech? It leaves your active universes. Its members and history stay viewable.* On confirm the universe shows *Retired* and leaves the active list (AC-4, AC-6) | Already retired: `409 universe_retired`. Never `destructive` |
| Universe detail | View membership as of a past date | routine | From an event, *View members as of this event*; or a typed ISO-8601 date; the table shows the members on that date, labelled as-of, with their scores from the current set (AC-6) | Date before creation: empty by definition, stated with the creation date. Malformed date: field error, ISO-8601 stated |
| Universe detail | Read the event history | routine | *History* tab, events newest first with name or symbol and timestamp with zone (AC-6) | Paged with a cursor; no event is ever missing because none is deleted |
| Compare | Read stocks side by side | routine | Columns per stock, rows per factor and input, every value at the row's precision (AC-16) | A stock incomplete on a factor keeps its column and shows *Incomplete* with the input named (flow step 5). A stock no longer followed shows *Not followed* on every factor |
| Compare | Add or remove a stock | routine | Column added or removed within 2 to 6; the URL updates | A seventh: field error *A comparison holds up to 6 stocks.*; `422` as backstop. Unknown symbol: `404 instrument_not_found`, *FactorFlow doesn't follow a stock named XYZ.* |
| Stock evidence | Read the inputs behind a score | routine | Per factor, each input's value, status, as-of and known-on date (AC-17), the memberships, and the *Possibly restated* mark where it applies (AC-23) | Missing or outdated input: the three-part statement and, where one exists, the recovery (the next *Complete* or *Partial* download); where the provider holds no such data, the statement that no recovery exists |
| Stock evidence | Read earlier scores | routine | *Earlier scores* tab: every earlier set's result for this stock, newest first, each dated and tied to its download (AC-18) | No earlier set: nothing-found distinct from never scored. A backfill observed later never alters an earlier row (AC-19) |
| Every screen | Load data | routine | Content appears | Eight states per region (STD-UI-23), enumerated in §12.4; S03's are S03 §7. Unreachable is the shell's designed state (blueprint §3.5) |

## 4. Suggested Components

> **Note:** This section applies only when a design system is configured in `projects/factorflow-v2/design-system.yaml`. One is, so this section names components that have a `design-spec.md` in `design-system/components/`.

Every component below was read from its specification. S03 §4 fixes the
Research screen's mapping; the rows below reproduce it and extend it to the
restyled pages. Nothing is proposed that does not exist.

| UI Pattern | Suggested Component | Variant | Design Spec Reference |
|------------|---------------------|---------|-----------------------|
| S03 results, universe members: one row per stock, up to 3000, server-side sort, filter and count, row checkboxes, selected row | `data-table` | `virtualised` (S03 §4; replaces version 1's `expandable`) | `design-system/components/data-table/design-spec.md` |
| Universes list | `data-table` | `expandable`, rows expanding to timestamps and filter provenance | `design-system/components/data-table/design-spec.md` |
| Universe event history; stock earlier scores; set history | `data-table` | `history` | `design-system/components/data-table/design-spec.md` |
| Row selection in the results and member tables | `checkbox` | `default`, under the table's contract, named *Select {SYMBOL}* | `design-system/components/checkbox/design-spec.md` |
| *Hide stocks with an incomplete score* | `checkbox` | `default` (S03 §4) | `design-system/components/checkbox/design-spec.md` |
| Scope (*Look in*); threshold measure and direction; lifecycle filter on Universes | `select` | `inline` (S03 §4) | `design-system/components/select/design-spec.md` |
| Threshold values, 56 px, placeholder *any* | `input` | `numeric` (S03 §4) | `design-system/components/input/design-spec.md` |
| *Find a stock*; universe name; rename inline; as-of date entry; add one stock | `input` | `text` | `design-system/components/input/design-spec.md` |
| Dialog forms (save as universe, new universe, add to universe) | `form` | `dialog` | `design-system/components/form/design-spec.md` |
| Bulk symbol entry when creating a universe or adding members | `textarea` | `list` | `design-system/components/textarea/design-spec.md` |
| Inspector; universe summary header; per-factor evidence groups | `card` | `summary` (S03 §4) | `design-system/components/card/design-spec.md` |
| Panes and page regions on the page ground | `card` | `default` (blueprint §3.1) | `design-system/components/card/design-spec.md` |
| *Incomplete* in a factor cell | `badge` | `coverage-absent` (blueprint §4.4; DEC-0072) | `design-system/components/badge/design-spec.md` |
| *Not enough to rank* in a factor cell | `badge` | `coverage-unknown` (blueprint §4.4) | `design-system/components/badge/design-spec.md` |
| *Not followed* in a factor cell of a stock the owner stopped following | `badge` | `status-neutral` (DEC-0073, PROVISIONAL) | `design-system/components/badge/design-spec.md` |
| *Updating*; *Not reflecting the latest download*; *Score update failed* | `badge` | `status-active`; `status-warning`; `status-critical` (blueprint §8; DEC-0072) | `design-system/components/badge/design-spec.md` |
| Download outcome the set reflects | `badge` | `status-good` *Complete*; `status-warning` *Partial* (blueprint §8) | `design-system/components/badge/design-spec.md` |
| Retired universe | `badge` | `secondary` *Retired* (blueprint §4.3) | `design-system/components/badge/design-spec.md` |
| Save these {n} as a universe… | `button` | `outline` (S03 §3) | `design-system/components/button/design-spec.md` |
| New universe…; Add stocks… | `button` | `default`, at most one primary per region | `design-system/components/button/design-spec.md` |
| Save or create with no stocks; remove the last member; compare outside 2 to 6 | `button` | `blocked`, reason beside it, focusable | `design-system/components/button/design-spec.md` |
| Retire… | `button` | `secondary` | `design-system/components/button/design-spec.md` |
| In-row Remove…; **See every input and its date** is `outline` (S03 §3) | `button` | `ghost`; `outline` | `design-system/components/button/design-spec.md` |
| Save as universe; new universe; add to universe; set history | `dialog` | `standard` (S03 §6) | `design-system/components/dialog/design-spec.md` |
| Remove a member; retire a universe | `dialog` | `confirm`, never `destructive` (blueprint §9) | `design-system/components/dialog/design-spec.md` |
| Stock evidence: now against earlier scores; universe detail: members against history | `tabs` | `default`, active tab in the URL | `design-system/components/tabs/design-spec.md` |
| Saved, added, removed, retired; a set completed while the owner is elsewhere; a failed set | `toast` | `success`, `info`, `error` | `design-system/components/toast/design-spec.md` |

**Compositions, not components** (blueprint §4, `design-system/intake.md`
step 1.3), built once in `web/src/components/patterns/` and reused: the factor
cell (§4.4, including the *Possibly restated* mark as DEC-0075 resolves it),
the inspector panel (§4.5), the selection tray (§4.6), the as-of line (§4.8),
the not-current banner (S03 §3, §4: a `badge` inside a `card`), and CAP-002's
side-by-side comparison table (§2.5). The shell (§3) and the command palette
(§3.4, `command`) are the shell capability's and are not proposed here.

**Components deliberately not proposed.** `chart`: the capability commits to no
chart, the system design §4.3 records `lightweight-charts` as unused, and
STD-UI-9, STD-UI-27 and STD-UI-28 are recorded as not applicable. The `badge`
factor variants `value`, `growth` and `momentum`: they tag a record as one kind
of stock, and CAP-002 scores every stock on all three factors; factor identity
is the header swatch (blueprint §4.4). `badge` `outline` for the restatement
mark (version 1): superseded by §4.4 and DEC-0075. `dialog` `destructive`:
CAP-002 has no destructive action. `input` `percentage`: a percentile is a rank
from 0 to 100, not a rate (STD-UI-2). `progress` `indeterminate`: a building set
reports no progress, so nothing honest could be drawn. `command`, `stepper`,
`radio-group`, `toggle-group`: the shell's or later milestones'.

**The COMPONENT-SPEC-GAP of version 1 is resolved.** Version 1 recorded a gap
for a numeric threshold filter in the `data-table` toolbar. S03 §3 places the
thresholds in the Filters pane as sentences built from `select` `inline` and
`input` `numeric` (blueprint §4.7, the sentence builder), so thresholds are not
a table-toolbar variant and no gap remains. The STD-UI-30 partial version 1
inherited from CAP-001 is also closed: the `data-table` `virtualised` variant
added on 2026-10-15 carries windowed rows with server-side sort, filter and
count (§12.1).

## 5. Constraints

- **STD-UI v6 governs every surface here, and the blueprint discharges much of
  it.** Where this brief and the standard disagree, the standard wins; a
  capability may be stricter than a rule but never looser. §12 records
  conformance rule by rule against v6, citing blueprint §11 where it already
  satisfies a rule, and mirrors `Capability-CAP-002.md` §5.4.
- **The blueprint's shell, patterns, status map and action tiers are inherited,
  not restated** (blueprint §0): the §3 shell (page ground
  `hsl(var(--muted) / 0.5)`, content on `card`s, main padding `--space-5`,
  tables and the three-pane Research screen at full width, inspector below the
  list between 1024 and 1279 px, nothing unreachable below 768 px), the §4
  patterns, the §8 labels and tiers, the §9 tiers for CAP-002's actions. No
  screen restyles a shared pattern.
- **One rail destination, Research, five routes under `/research`** (blueprint
  §2.1, §2.2; DEC-0068). The rail belongs to the *App shell & data health*
  capability (D-8); until it lands, `classification-ui` appends one Research
  entry to the delivered CAP-001 rail and registers its routes at the
  `routes.tsx` seam (DEC-0069, PROVISIONAL). No second status region, no new
  navigation level, no change to the landing screen or the unreachable state.
  The UX design's composition section must say both: into the blueprint's shell
  once delivered, into CAP-001's meanwhile.
- **Display labels, never domain terms, in user-visible text** (STD-UI-1 v6,
  blueprint §7; DEC-0072). *stock*, *followed stock*, *stop following* and *Not
  followed*, *download*, *Complete* / *Partial*, *Incomplete*, *Not enough to
  rank*, *percentile*, *standardised score* (never shortened to *score*);
  *universe* unchanged. Code, API and persistence keep `instrument`,
  `acquisition_run`, `not_classified`.
- **Device target: desktop browser, keyboard first,** ≥ 1280 px design width
  (blueprint §3.1; CAP-001 `component-design-owner-web-app.md` §1). No mobile or
  touch target is stated in any source.
- **No authentication, no account, no user concepts.** Capability §5.3; system
  design constraint 12; the loopback exception under DEC-0050 and DEC-0058.
- **One owner-operator.** No per-user ownership of universes, no sharing
  (capability §5.3; tech stack C8; system design constraint 19).
- **The interface learns everything by polling.** The score-set state polls
  every 10 seconds while a set is building or a download is non-terminal and
  stops otherwise (system design v2 constraint 18, DEC-0054, PROVISIONAL);
  every polled region shows *checked {time}* (STD-UI-25, blueprint §4.8).
  Universe reads and evidence reads are on demand.
- **Up to 3000 stocks (AC-11), and STD-UI-30 says what that requires:** the
  results and member lists are `data-table` `virtualised`, with search (*Find a
  stock*, DEC-0074) and filter; sort, thresholds, hide-incomplete and count
  apply in SQL over the whole set with keyset pagination at `DEFAULT_PAGE_SIZE`
  50 and `MAX_PAGE_SIZE` 500 (system design v2 §3.3 step 15), never over a
  loaded page (S03-2, S03 §6).
- **Filter, sort, scope, hide-incomplete and search live in the URL query**
  (S03 §5, S03-5), so a result can be shared and survives reload and back
  navigation; checked rows are client state kept across filter changes.
- **Request bounds:** `MAX_COMPARE_SYMBOLS` 6, from S03 §6 (DEC-0070, closing
  version 1's open question); `MAX_SYMBOLS_PER_REQUEST` 1000 per member
  submission; the universe name maximum length is `[REQUIRES INPUT: maximum
  universe name length in characters]`, abstained in the system design (§8
  question 2) and carried here unchanged; the name field states the bound once
  it is known.
- **A whole request is refused when any symbol is unfollowed** (AC-1; system
  design constraint 13, DEC-0057). The interface reports every unfollowed
  symbol, preserves the entered list and lets the owner remove them and
  resubmit; the parse step still reports malformed entries individually.
- **Like for like, or not at all** (AC-12, AC-14; system design constraint 6).
  No partial score is ever rendered. An incomplete factor carries *Incomplete*
  with the input named; a factor below 30 qualifying stocks carries *Not enough
  to rank* in every cell and the count in its header.
- **Presence has three states per factor cell** (STD-UI-14, blueprint §4.4):
  present (percentile and bar), absent (`coverage-absent` *Incomplete*), not
  determinable (`coverage-unknown` *Not enough to rank*). The third never
  renders as the second and never as zero.
- **Missing is not zero** (STD-UI-4). An absent value in an evidence or compare
  table renders as the em dash the `data-table` specification names; a
  standardised score of `0.00` is a real value at the peer mean; blank means
  only that the column does not apply.
- **Percentiles render whole, standardised scores signed to two decimals**
  (DEC-0063, consistent with S03 §8 *88* and *0.00*), in `--font-numeric`,
  right- and decimal-aligned (STD-UI-3), with no polarity colour (DEC-0060;
  blueprint §4.4 puts the standardised score in `--muted-foreground`).
- **Dates are ISO-8601 and timestamps carry America/Chicago** (STD-UI-5,
  blueprint §4.8). `classification_date`, `known_on` and `recorded_on` are
  dates; `as_of` is a fiscal period end or session date and is never converted;
  `started_at`, `ended_at`, `recorded_at`, `created_at`, `retired_at` and
  `member_since` are timestamps with the zone shown.
- **Nothing is asserted beyond what is derived** (STD-UI-15). A filter-built
  universe shows its saved members, never the filter's current result (AC-2); a
  score is shown only from a `complete` set.
- **No silent substitution** (STD-UI-16). The previous set is shown only with
  its *Not reflecting the latest download* mark (AC-20); a completed set
  replaces it once, announced (DEC-0062).
- **The restatement mark propagates** (STD-UI-17, AC-23, blueprint §4.4): on
  every percentile that carries it, in the results, the inspector, compare,
  evidence and history, as the composition DEC-0075 describes.
- **The check states what it does not cover** (STD-UI-18, S03 §8): present and
  current, not correct; stated once under the results and once per evidence
  page.
- **Retirement and removal, never deletion** (STD-UI-2, AC-6; blueprint §9).
  No destructive action exists in this capability.
- **No charting** (capability §5.4; system design §4.3). STD-UI-9, STD-UI-27 and
  STD-UI-28 do not apply; a UX design that adds a chart engages all three.
- **Density, type scale and spacing come from theme tokens** (STD-UI-29); the
  density tier is inherited pending OQ-UI-4; the canvas's 11 px labels are
  `--text-xs` (blueprint §13).
- **Accessibility is enforced by review, not by tooling** (STD-UI-24;
  `tech-stack.md`: Biome has no `jsx-a11y` equivalent).
- **The seven factor inputs are named in product vocabulary** (STD-UI-1), never
  by provider payload key; the key mapping is the system design's abstained
  question 1 and bears on this brief only in vocabulary.
- **Point-in-time history is the constraint that cannot be repaired later**
  (charter §3; tech stack C5; system design constraint 3). Nothing in the
  interface offers to edit, correct or delete a recorded score or membership
  event, and no wording implies it could.

## 6. Accessibility Requirements

S03 §9 fixes the Research screen's semantics; the restyled pages follow the
same rules.

- **WCAG level or target:** WCAG 2.1 AA, the project target under STD-UI-24.
- **Landmarks and names:** the three Research panes are `section`s labelled
  *Filters*, *Results* and *Selected stock* (S03 §9); the selection tray is a
  `role="region"` labelled *Selection* and is announced politely when it appears
  (blueprint §4.6, *3 selected*). Universe detail labels its sections *Members*
  and *History*; compare labels its table *Comparison of {n} stocks*.
- **Keyboard navigation needs:** Every operation completable by keyboard
  (STD-UI-24): the threshold sentences (`select` `inline`, `input` `numeric`
  with arrow stepping), hide-incomplete, search, sorting, selecting a row with
  `Enter` and moving the selection with `↑`/`↓`, checking with `Space`, the
  tray actions, saving as a universe, creating a universe, adding and removing
  members, renaming, retiring, viewing as-of membership, switching tabs, and
  opening the set history. Focus is managed on every dialog and on content
  inserted into the page, and visible focus is never suppressed. `button`
  `blocked` is used for every precondition-gated action (no stocks, last
  member, compare outside 2 to 6, save at zero matches) because it stays
  focusable and exposes its reason through `aria-describedby`. Links, not
  buttons, carry navigation to evidence, to a universe and to the download a
  set reflects.
- **Tables:** the `data-table` contract (S03 §9): row headers on Symbol,
  `aria-sort` on the sorted column, `aria-selected` on the selected row; row
  checkboxes named *Select {SYMBOL}*; in-row actions named for their row
  (*Remove AAPL from Tech*). Compare carries programmatic row and column headers
  because every cell's meaning depends on both. A factor's *{n} qualified, 30
  needed* is in the column header so a screen reader hears it once.
- **Factor cells:** the bar is `aria-hidden`; the percentile is the text (S03
  §9). *Incomplete* and *Not enough to rank* badges carry their words; the
  reason is in a tooltip that is reachable from the row's selection (the
  inspector carries it in full), never only on hover. The *Possibly restated*
  mark exposes the words *Possibly restated* as its text, with the *R* glyph
  `aria-hidden` (DEC-0075), because the badge specification forbids an
  accessible-name override.
- **Polled and replaced content:** the as-of line announces the new date and
  download politely on completion (DEC-0062) and shows *checked {time}*
  (STD-UI-25); sorting, filtering and the refresh never move focus; the new
  match count is announced politely.
- **Contrast:** Text at 4.5:1, large text and interactive boundaries at 3:1
  (STD-UI-24). The `coverage-absent` and `coverage-unknown` badges and the warm
  tiers meet contrast as recorded in `design-system/theme-validation.md`; the
  standardised score in `--muted-foreground` is body text and must meet 4.5:1
  on the card.
- **Touch / mobile requirements:** None stated in any source. Control target
  sizes follow the component specifications, at least 24 by 24 CSS pixels
  (`--control-min-target`; checkbox specification §5).
- **Colour-not-solo-state requirements:** Mandatory under STD-UI-8 and
  load-bearing: *Incomplete* and *Not enough to rank* differ in meaning and the
  distinction is the one AC-12 and AC-14 protect; both carry words and distinct
  badge treatments (`--value-missing` against `--pattern-indeterminate`), and a
  greyscale rendering remains fully readable. The factor swatch is identity and
  the bar is magnitude, and the column header carries the factor's name in
  text (blueprint §4.4, STD-UI-7). Standardised scores carry their sign in text
  (STD-UI-3), and no colour encodes polarity (DEC-0060).

## 7. Component Library References

> **Note:** This section applies only when a design system is configured. Omit when no design system is available.

| Component | Slug | Design Spec Path |
|-----------|------|------------------|
| Data Table | `data-table` | `design-system/components/data-table/design-spec.md` |
| Checkbox | `checkbox` | `design-system/components/checkbox/design-spec.md` |
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

Twelve of the eighteen components are referenced. `chart` is not, for the
reason in §4; `command` is the shell's (blueprint §3.4); `progress`, `stepper`,
`radio-group` and `toggle-group` serve states and milestones CAP-002 does not
deliver. The six added on 2026-10-15 are `status: beta`, as is `textarea`. No
Figma node IDs exist: `design-system/component-map.json` carries a null
`figma_file_key` and an empty component map, so Path A's Figma route has no
design source to extract from; the canvas source for S03 is
`docs/ux/design-source/P03-Research.dc.html`, and the specification wins where
they disagree (S03 §11). The automated Path B is unaffected.

## 8. EDG Compliance Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Consistency with product patterns | pass | CAP-002 delivers the blueprint's S03 as approved and restyles its three other pages into the §3 shell with the §4 patterns, §7 labels, §8 status map and §9 tiers; it adds one destination the blueprint names and no other navigation. Departures from S03 are three, each recorded with its reason (search field, DEC-0074; the renderings S03 leaves unspecified, DEC-0073; the restatement mark's composition, DEC-0075). Vocabulary is held to STD-UI-1 v6 and the terms CAP-002 adds are recorded in §12.1 |
| Progressive disclosure | pass | Blueprint principle 4: the row answers "how does this stock score" with three percentiles; the standardised score, the inputs' as-of and the reasons are one click away in the inspector, the full inputs one more on the evidence page. A factor below 30 is stated once in its header. Thresholds are sentences in one pane. Compare shows percentiles first and inputs beneath |
| Error clarity | pass | Every refusal in §3 names the operation, the stock or universe and the reason, and offers the recovery where one exists: follow the stock on Data health, review and save again, retire instead, wait for the next download. Where no recovery exists the screen says so. No payload key, code or exception reaches the owner (STD-UI-1) |
| Accessibility | pass | WCAG 2.1 AA per STD-UI-24, specified in §6 against each operation and in S03 §9. The one component contract conflict the blueprint carried (FINDING-56) is resolved as a composition (DEC-0075). Enforcement is human review, which the standard acknowledges |
| States and feedback (empty, loading, error, success, partial) | pass | All five, plus the three more STD-UI-23 requires, enumerated per region in §12.4, with S03 §7 governing the Research screen. Never-scored and nothing-found are distinct everywhere both can occur (AC-22); stale is a first-class, marked state (AC-20); unavailable is the factor below 30 (AC-14); success is confirmed by `toast` for saves and adds (FINDING-42) |

**Intentional departures from `edg-compliance`, recorded so a reviewer does not
raise them.** STD-UI §1.2 declares them: six severity tiers reconciled to EDG's
three levels (STD-UI-12); the kill switch without confirmation (STD-UI-21),
which CAP-002 does not deliver; screen-reader certification exempt as a gate
with semantics mandatory. Of STD-UI §2.3's four scope exemptions, the one
engaged here is error codes: the error envelope's `code` selects wording and is
never shown, because the product has one owner and no support channel, and
STD-UI-19's three-part actionability replaces it.

## 9. Open Questions

Decisions this brief made are not listed here; they are DEC-0072 to DEC-0076,
and the ones it inherits are DEC-0059 (where not superseded), DEC-0060,
DEC-0062, DEC-0063 and DEC-0068 to DEC-0071, cited where they apply. What
follows is what no artifact derives, and what is now closed.

- **Closed: the maximum number of stocks compared side by side.** Version 1
  abstained. S03 §6 (approved) fixes **Compare side by side** at 2 to 6 checked
  rows; DEC-0070 records `MAX_COMPARE_SYMBOLS` = 6 as following from the
  approved artifact. Review v4 FINDING-34 notes the number is unsourced within
  the UX artifacts; it binds as approved, and an owner change to S03 would
  supersede the record.
- **Closed: decimals for scores and percentiles.** Version 1 abstained. DEC-0063
  (percentiles whole, standardised scores signed to two decimals) is consistent
  with S03 §8's *88* and *0.00* and stands.
- **What is the maximum length of a universe name?** `[REQUIRES INPUT: maximum
  universe name length in characters]`. *Owner: capability owner. Blocks: the
  API bounds constant in `classification-api` and the name field's stated
  bound; not the UX design.* Carried from system design §8 question 2.
  **Abstained in this run.**
- **The dependency on the *App shell & data health* capability.** Blueprint §12
  D-8 gives the rail, the §2 routes and the route migration to a capability
  that is not yet defined, and CAP-002's Research destination lives in that
  rail. Whether that capability belongs in `Capability-CAP-002.md` §5.1 (most
  likely `requires-runtime` for the rail entry) is the owner's, and only the
  owner edits that table; meanwhile the interim composition of DEC-0069 holds.
  The consumer of `GET /api/classifications/summary` (S01, S09) has no published
  identifier until that capability's system design exists. `[REQUIRES INPUT:
  the §5.1 row for the App shell & data health capability, if any, and the
  published identifier of the component that consumes the summary read]`.
  *Owner: capability owner (§5.1); the shell capability's system design (the
  identifier). Blocks: nothing in this brief; the UX design's composition
  section states both shells.* Carried from system design v2 §8 question 10.
  **Abstained in this run.**
- **Which density tier is the default?** Carried from CAP-001 and STD-UI's
  OQ-UI-4. This brief inherits, as CAP-001 did.
- **Carried from the system design §8, not re-decided:** the Massive statement
  payload keys for the seven inputs (question 1, bears on vocabulary only here).
- **Not CAP-002's:** review v4 FINDING-54 (S05's conditions cannot carry S03's
  measure and direction) concerns **Use in a strategy**, which is M2 and absent
  here; the M2 capability resolves it against S03's filter model.

**Findings the owner should know this brief acted on rather than left open.**
Review v4's open findings about S03 that touch CAP-002: FINDING-22 (search,
DEC-0074), FINDING-23 (retired, failed and download renderings, DEC-0073),
FINDING-42 (completion confirmations, DEC-0076), FINDING-45 (holdings line
tagged M2 and omitted here), FINDING-55 (save at zero matches and incomplete
membership, DEC-0076), FINDING-56 (restatement mark, DEC-0075). FINDING-25
(the restyled pages have no source) is answered by §2.3 to §2.6 of this brief
and by the UX design. FINDING-32 (*current* means AC-13) is the system design's
DEC-0071. FINDING-57 (canvas differences) is the screen specifications' own.

## 10. Source Documents

| Document | Path | Key Findings |
|----------|------|--------------|
| Capability CAP-002 v1 (draft) | `docs/capabilities/CAP-002-universe-and-factor-classification/Capability-CAP-002.md` | 23 acceptance criteria; six user flows with failure branches; universes by hand or one-time filter snapshot; one peer set; like for like or not at all; 30-stock ranking threshold; previous set marked while not current; honest empty state; restatement mark in history; §5.4 conformance for all 30 STD-UI rules, delegating the tier mapping and the eight-state enumeration to this brief |
| System design CAP-002 v2 (draft) | `docs/capabilities/CAP-002-universe-and-factor-classification/design/system-design.md` | `ui_facing: true`; `classification-ui` as the blueprint's Research area under one Research destination at `/research/*` (§1, §2, §4.1, §4.2; DEC-0068, DEC-0069); S03's filter model mapped onto the twelve bounds, `hide_incomplete`, `match_count`, the summary read and the current-stock rule (§3.3; DEC-0071); `MAX_COMPARE_SYMBOLS` 6 (DEC-0070); poll cadence (constraint 18); the shell changes under the screens without changing them (§6 assumption 7); the D-8 dependency and the unpublished consumer (§8 question 10); two abstentions carried here |
| Product UX blueprint `PRODUCT-UX` v6 (approved 2026-10-16) | `docs/ux/product-ux-blueprint.md` | §0 how a brief uses it; §2.1 one Research destination; §2.2 CAP-002's routes as restyled pages; §3 shell and §3.5 score state where scores are shown; §4.4 factor cell, §4.5 inspector, §4.6 tray, §4.8 as-of line, §4.10 states; §7 vocabulary; §8 score states and tiers; §9 CAP-002 action tiers; §10 the M1 row claimed in §1; §11 product-level conformance cited in §12; §12 D-8; §13 `checkbox`, `data-table` `virtualised` |
| Research screen `PRODUCT-UX-S03` v4 (approved 2026-10-16) | `docs/ux/screens/S03-research.md` | Three panes and their components (§3, §4); view model (§5); interactions incl. URL state, server-side filter and count, 150 ms debounce, compare at 2 to 6 (§6); eight states (§7); copy (§8); accessibility (§9); S03-1 to S03-7 (§10); canvas differences (§11). The starting layout for the UX design |
| Home `PRODUCT-UX-S01` v4 and Data health `PRODUCT-UX-S09` v4 | `docs/ux/screens/S01-home.md`, `docs/ux/screens/S09-data-health.md` | The shell capability's screens that consume CAP-002's state: S01 data tile and S01-6; S09 *Factor scores* card and its *Incomplete* wording (§11). Read for the summary read's meaning, not redesigned |
| UX specifications review v4 | `docs/ux/specifications-review-report-v4.md` | READY verdict the blueprint and screens were approved on; open S03 findings this brief acts on or carries: FINDING-22, 23, 25, 32, 42, 45, 54, 55, 56, 57 (§9) |
| STD-UI v6 | `docs/constitution/standards/ui-conventions.md` | Thirty rules, numbering unchanged since v4; STD-UI-1 v6 separates domain terms from display labels; STD-UI-12's trading-state rows (not CAP-002's); STD-UI-11 and STD-UI-29 clauses CAP-002 does not use; §4 conformance record required in the UX brief; §7 revision history for v5 and v6 |
| CAP-001 UX brief v7 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-brief.md` | The conformance record shape this brief mirrors; coverage refreshes once on run completion (precedent for DEC-0062); `confirm` not `destructive`; `blocked` not disabled |
| CAP-001 UX design v5 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-design.md` | The delivered shell CAP-002 composes into until the blueprint's shell lands; Add and Add many pattern; link-not-row-click; no date input exists; polled regions announce politely |
| CAP-001 component design: owner web app v4 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/component-design-owner-web-app.md` | `web/src/app/shell.tsx` and `routes.tsx` as the composition seams; `ScreenState` union; server-side filtering and windowed rendering at 3000 rows; desktop only |
| Design system (as of 2026-10-15) | `design-system/` and `projects/factorflow-v2/design-system.yaml` | 18 component specifications read, 12 used; `checkbox` (beta) for row selection and hide-incomplete; `data-table` `virtualised` closing the STD-UI-30 gap; `badge` coverage and status variants and the accessible-name rule behind FINDING-56; `select` `inline`, `input` `numeric`, `card` `summary`, `dialog` `standard` and `confirm`; `theme.css` tokens; `component-map.json` empty; `intake.md` governing compositions |
| UX pipeline note | `docs/ux/README.md` | A capability's UX brief cites `PRODUCT-UX`, claims its rows from §10 and records only what it adds or specializes; the UX design starts from the matching screen spec |
| Product charter v2 | `docs/constitution/product-charter.md` | One owner-operator; Owner Interface, Universe Definition and Factor Classification as building blocks; point-in-time factor and universe history that cannot be rebuilt |
| Tech stack v5 | `docs/constitution/tech-stack.md` | React 18, Vite, Tailwind, shadcn/ui on Radix, `react-router-dom`; Biome has no `jsx-a11y` equivalent; C8 one owner |
| EDG compliance skill | `.agents/skills/edg-compliance/SKILL.md` | Advisory beneath STD-UI per STD-UI §1.2; checklist applied in §8 |
| Decision records read | `projects/factorflow-v2/decisions/DEC-0052.md` to `DEC-0071.md` (harness repository) | The system design's provisional choices binding this brief (DEC-0054 poll, DEC-0057 universe semantics); version 1's DEC-0059 (partly superseded), DEC-0060, DEC-0062 (kept), DEC-0061 and DEC-0064 (superseded by DEC-0068, DEC-0069); the UX design's DEC-0063 (kept); the system design v2's DEC-0068 to DEC-0071 |
| Decision records written by this version | `projects/factorflow-v2/decisions/DEC-0072.md` to `DEC-0076.md` (harness repository) | Blueprint labels, tiers and factor-cell presence (from approved artifacts); the renderings S03 leaves unspecified; the search field; the restatement mark composition; save-as-universe rules and confirmations (the last four PROVISIONAL) |

## 11. Readiness Assessment

**Readiness Score: 86/100**

Ready for either path, and more directly than version 1 was: the Research
screen now starts from an approved specification with its own acceptance
checks (S03-1 to S03-7), so the UX design has less to invent and the
specification review has a sharper target. Five screens on five blueprint
routes cover all 23 acceptance criteria; each of the fourteen JSON operations
the system design v2 declares, and the two it reuses, has a consumer named in
§1 to §3, and no screen depends on an operation that does not exist. Every
component proposed was read from its specification, including the two added
for the blueprint that CAP-002 now uses; the gap version 1 recorded is
resolved by the approved layout rather than by a design-system change; and the
compositions are named with their home in `web/src/components/patterns/`.

What this brief adds beyond its sources: the mapping of S03's view model onto
CAP-002's reads; the three departures from S03, each with its reason; the
renderings S03 and the blueprint leave unspecified (a stock no longer followed,
a failed update, the download in the as-of line, the set history); the
save-as-universe rules that make S03-7 testable; the restatement mark's
accessible name without a design-system change; and the restated information
architecture of the three pages the blueprint calls "CAP-002 page, restyled".

Five choices rest on derivations rather than approved artifacts and are
recorded as PROVISIONAL (DEC-0073 to DEC-0076, and the inherited DEC-0062);
the owner upholds or reverts each. Two questions are abstained with
`[REQUIRES INPUT]` markers, neither blocking the UX design. The capability and
system design this brief reads are drafts, and the shell this capability's
screens compose into belongs to a capability nobody has defined, so
specification review may move ground beneath it.

The fourteen points withheld are for what no brief can supply: nothing here
has been read by anyone but its author, the three departures from an approved
screen await the owner's verdict, and no owner has yet seen a factor score
rendered.

## 12. STD-UI Conformance Record

STD-UI §4 requires a conforming capability to record four things in its UX
brief: which rules its surfaces engage, which do not apply and why, where each
applicable rule is satisfied, and each local specialization. Silence is not a
record. This record is against **STD-UI v6**; version 1's was against v4.
Numbering is unchanged between the two; STD-UI-1 (display labels) and
STD-UI-12 (trading-state rows) changed, STD-UI-11 and STD-UI-29 gained clauses.
Blueprint §11 says where the blueprint already discharges a rule product-wide,
and is cited where it does, as its own text invites. `Capability-CAP-002.md`
§5.4 is the machine-checked mirror; where its wording predates v6 (it still
names *not classified* and *instrument* as vocabulary) the owner's next
capability revision aligns it, and this brief says so rather than editing it.

### 12.1 Rule-by-rule

| Rule | Applies | Where satisfied, or why not |
|------|---------|------------------------------|
| STD-UI-1 Product vocabulary | yes | Blueprint §11 and §7; DEC-0072. Every user-visible string in §2 and §3 uses the v6 display labels; the API keeps the domain terms. **Specialization (permitted):** CAP-002 adds *peer set* (domain term; display *the stocks scored on this factor*, S03 §3 helper) and *Not followed* as the display label for a stock the owner has stopped following where it still appears (DEC-0073), and redefines no term. Capability §5.4's row still lists the v4-era terms and needs the owner's revision |
| STD-UI-2 Words describe behaviour | yes | Blueprint §11 (§9 confirmation wording). §2.4, §3: removal and retirement keep history and say so; `dialog` `confirm` not `destructive`; percentile carries no `%`; a filter-built universe is described as a snapshot |
| STD-UI-3 Comparable figures | yes | Blueprint §11 (`--font-numeric`, fixed precision, explicit sign). §5: percentiles whole, standardised scores signed to two decimals (DEC-0063), right- and decimal-aligned in the results, compare and evidence |
| STD-UI-4 Missing is not zero | yes | Blueprint §11 and §4.4. §5: *Incomplete* in a factor cell, the em dash in evidence and compare tables, `0.00` a measured value, blank only for not applicable |
| STD-UI-5 Dates and timestamps | yes | Blueprint §11 and §4.8. §5: ISO-8601 dates, America/Chicago on every timestamp, `as_of` session and period dates never converted |
| STD-UI-6 No abbreviation where compared | yes | Blueprint §11 (compare). §2.5, §2.6: input values render in full in compare and evidence |
| STD-UI-7 One job per palette | yes | Blueprint §11 and §4.4: the factor swatch is identity, the bar is magnitude (`--seq`), status is the tiers; no polarity colour (DEC-0060). Version 1 recorded *partial* because factor identity was text only; the blueprint now engages the categorical and sequential jobs as well, each in its own palette |
| STD-UI-8 Colour never the sole carrier | yes | Blueprint §11 and §8. §6: every status and coverage badge carries words and a shape or pattern; the restatement mark exposes its words (DEC-0075); sign in text; greyscale readability is the test |
| STD-UI-9 Colour follows the entity | no | No series and no chart (capability §5.4). The factor swatch is a fixed identity per factor, not a rank or position. A UX design that adds a chart engages it |
| STD-UI-10 Palettes validated, not judged | no, for this capability | Binds the shared theme; satisfied there by `design-system/theme-validation.md` (blueprint §11: no token is added) |
| STD-UI-11 Paper and live distinguishable | no | CAP-002 delivers no trading and has no paper or live environment (capability §2); the environment region is the shell's from M2 (blueprint §10). The v5 clause on `--risk-*` tokens outside the region is unengaged: CAP-002 uses neither token |
| STD-UI-12 Status form and severity | yes | Blueprint §11 and §8: the score states *Updating* (active), *Not reflecting the latest download* (warning), *Score update failed* (critical), and *Complete* / *Partial* for the download. §12.2 carries CAP-002's table. **Specialization (permitted):** CAP-002 adds one state the blueprint does not name, *Not followed*, mapped to neutral (DEC-0073, PROVISIONAL); no tier is added. The v5 trading-state rows are not CAP-002's |
| STD-UI-13 Every value carries its as-of date | yes | Blueprint §11 (§4.8; S03 inspector and evidence routes). §2.1, §2.6: the as-of line on every scored surface; each input's `as_of` and `known_on` in the inspector and on evidence (S03-3) |
| STD-UI-14 Presence has three states | yes | Blueprint §11 and §4.4 (three states). §2.1, §5: present, `coverage-absent` *Incomplete*, `coverage-unknown` *Not enough to rank*; the third never reads as the second (DEC-0072) |
| STD-UI-15 Nothing asserted beyond derived | yes | Blueprint §11. §2.4, §5: a filter-built universe shows saved members; scores only from a `complete` set |
| STD-UI-16 No silent substitution | yes | Blueprint §11 (incomplete stocks skipped, never filled). §2.2, §5: the previous set is shown only with its mark; replacement is announced and dated (DEC-0062) |
| STD-UI-17 Known limitations propagate | yes | Blueprint §11 and §4.4: the *Possibly restated* mark on every percentile that carries it, in S03's list and inspector; §2.5, §2.6 extend it to compare, evidence and history (S03-6, AC-23); form per DEC-0075 |
| STD-UI-18 A check states what it does not cover | yes | Blueprint §11 (S03 footnote). §2.6: present and current, not correct, under the results and on each evidence page |
| STD-UI-19 Action tiers and error actionability | yes | Blueprint §11 and §9 tier CAP-002's actions; §3 states each error's three parts and recovery; §12.3 summarises |
| STD-UI-20 The promotion gate | no | CAP-002 delivers no promotion (capability §2) |
| STD-UI-21 The kill switch | no | CAP-002 has no order path; capability §5.2 records the kill switch as a non-dependency; the shell's from M2 (blueprint §10) |
| STD-UI-22 Control adjacency | no | No capital-at-risk and no destructive control; retirement and removal are neither (STD-UI-2) |
| STD-UI-23 State coverage | yes | Blueprint §11 and §4.10; S03 §7 for the Research screen; §12.4 enumerates all eight states per region |
| STD-UI-24 Programmatic semantics and feedback | yes | Blueprint §11 (accessibility section in every screen spec); S03 §9; §6 in full; completion confirmed by `toast` for saves and adds (DEC-0076) |
| STD-UI-25 Polled freshness | yes | Blueprint §11 and §4.8 *checked {time}*. §2.1, §5: 10 seconds while a set is building or a download is non-terminal, stops otherwise; cadence recorded in system design v2 constraint 18 |
| STD-UI-26 Multi-step operations | no | No operation spans steps; saving a filter result is one action on a reviewed result (capability §5.4) |
| STD-UI-27 Chart integrity | no | No chart (system design §4.3) |
| STD-UI-28 Chart provenance | no | No chart (system design §4.3) |
| STD-UI-29 Density tokens | yes | Blueprint §11 (only theme tokens; density inherits `--row-height`). §5: no literal outside the theme; the page ground alpha is the v5 A-5 case, not a new value. **Specialization (permitted):** a tier is selected from the defined set; inherited pending OQ-UI-4 |
| STD-UI-30 Lists at committed volume | yes | Blueprint §11 claims it; this brief discharges it: the results and member lists are `data-table` `virtualised` (added 2026-10-15, closing the gap version 1 inherited as *partial*) with server-side sort, filter and count, thresholds and hide-incomplete as filters, and *Find a stock* as search (DEC-0074, the departure S03 as approved needed for this rule). **Specialization (permitted):** the volume is CAP-002's own, 3000 stocks (AC-11) |

### 12.2 Status tier table (STD-UI-12)

The mapping follows blueprint §8 where it names the state (DEC-0072, from the
approved artifact) and DEC-0059 where the blueprint is silent, with one state
CAP-002 adds (DEC-0073, PROVISIONAL). STD-UI-12's verification requires the
table to appear in the capability's UX brief; capability §5.4 delegates it
here. Per-factor presence is governed by STD-UI-14 and rendered with the
`badge` coverage variants, not the status tiers; it is listed for completeness.

| State | Display label | Tier | `badge` variant | Source |
|-------|---------------|------|-----------------|--------|
| A later set is building | *Updating* | active | `status-active` | Blueprint §8 |
| The shown set does not reflect the latest download | *Not reflecting the latest download* | warning | `status-warning` | Blueprint §8, §4.10 |
| The latest attempt failed | *Score update failed* | critical | `status-critical`, with the reason | Blueprint §8 |
| Download the set reflects: `succeeded` / `partial` | *Complete* / *Partial* | good / warning, never good | `status-good` / `status-warning` | Blueprint §8, STD-UI-12 |
| Factor scored (`classified`) | the percentile and bar | none; good where a status word is rendered at all | none | DEC-0059, kept; blueprint §4.4 |
| Factor not scored: input missing, outdated or not computable (`not_classified`) | *Incomplete* | presence: absent (STD-UI-14) | `coverage-absent`, reason in tooltip and inspector | Blueprint §4.4; supersedes DEC-0059's `status-warning` |
| Factor below 30 qualifying stocks (`not_enough_stocks`) | *Not enough to rank* | presence: not determinable (STD-UI-14) | `coverage-unknown`, header *{n} qualified, 30 needed* | Blueprint §4.4; supersedes DEC-0059's `status-serious` |
| Stock the owner stopped following (`retired`) | *Not followed* | neutral, never a fault | `status-neutral` | DEC-0059 tier kept; label DEC-0073, PROVISIONAL |
| Retired universe | *Retired* | none (lifecycle, not status) | `secondary` | Blueprint §4.3 |
| Percentile carrying the restatement mark | *Possibly restated* | neutral | composition with `status-neutral` tokens (DEC-0075) | Blueprint §4.4, STD-UI-17 |

DEC-0059 is superseded for *not classified*, *not enough stocks to rank*,
*updating*, *not reflecting the latest acquisition* and *classification failed*
(labels and, for the first two, the encoding); its *classified* and *retired*
rows stand (DEC-0072).

### 12.3 Actions

Tiered inline in §3 per blueprint §9. CAP-002 has two consequential actions,
removing a member and retiring a universe, both taking `dialog` `confirm` with
CAP-002's wording; every other action, including saving results as a universe,
selecting, comparing, creating, renaming and adding members, is routine with no
confirmation; it has no capital-at-risk action, because it places no orders,
and no destructive one, because nothing is deleted (STD-UI-19, STD-UI-22).

### 12.4 State coverage per region (STD-UI-23)

Eight states per data-bearing region, or a recorded reason one does not apply.
S03 §7 governs the Research screen and is reproduced in the first row with
CAP-002's specializations. Unreachable is the shell's designed state (blueprint
§3.5) on every route and is not redesigned here.

| Region | Loading | Empty, never populated | Empty, nothing found | Partial | Stale | Unavailable, check could not run | Error | Unreachable |
|--------|---------|------------------------|----------------------|---------|-------|----------------------------------|-------|-------------|
| S03 Research: results | Table skeleton at 12 rows (S03 §7) | *No stocks have been scored yet.* with the latest download's state and a link to Data health (S03 §7, AC-22); never an empty table | *No stocks match these filters.* with **Clear filters**; search matching none is this state (S03 §7) | *Incomplete* cells inline; header counts unchanged (S03 §7, AC-12); a set from a *Partial* download says so in the as-of line | Not-current banner above the results header (S03 §3), `status-warning`; `status-critical` variant when the update failed (DEC-0073); *checked {time}* (AC-20) | A factor below 30 qualifying stocks: every cell *Not enough to rank*, header *{n} qualified, 30 needed* (S03 §7, AC-14) | Results body replaced with the operation, reason and **Try again**; filters kept (S03 §7) | Shell state |
| S03 Research: inspector | Inspector skeleton (S03 §7) | *Select a stock to see why it scores as it does.* when nothing is selected | n/a: it shows the selected row or nothing | Some factors *Incomplete*, the explanation box present (S03 §3) | Carries the results' set; no separate mark | A factor below 30: that block reads *Not enough to rank* with the count | Block replaced with the operation, reason and **Try again** | Shell state |
| Universes list | Skeleton | *No universes yet.* with **New universe…** focused | Lifecycle filter matches none, with a reset | n/a: a universe is active or retired | n/a: not polled, read on demand | n/a | Body replaced, retry offered | Shell state |
| Universe detail: members | Skeleton at `member_count` | n/a: a universe has at least one member (AC-5) | Thresholds or search match no member, with a reset | Some members *Incomplete* on some factors; members no longer followed read *Not followed* (AC-15) | Score-set banner and as-of line as S03; an as-of view is labelled with its date | A factor below 30, as the results | Body replaced, header retained, retry offered | Shell state |
| Universe detail: history | Skeleton | n/a: a `created` event always exists | n/a: no filter | n/a | n/a: append-only, read on demand | n/a | Body replaced, retry offered | Shell state |
| Compare | Skeleton with one column per chosen symbol | Fewer than two stocks in the URL: *Choose 2 to 6 stocks to compare.* with the entry focused | A typed symbol is not followed: named, column not added | A stock *Incomplete* on a factor shows it in that column (flow step 5) | Score-set banner and as-of line as S03 | A factor below 30: row group header states it once | Body replaced, retry offered; chosen symbols preserved in the URL | Shell state |
| Stock evidence: now | Skeleton matching the three groups | Never scored: *{SYMBOL} has no score yet because no stocks have been scored.* (AC-22) | n/a | Some factors scored, some *Incomplete*, each naming its input (AC-12) | Score-set banner and as-of line as S03 | A factor below 30: stated in that factor's group | Body replaced, retry offered | Shell state |
| Stock evidence: earlier scores | Skeleton | *No earlier scores for {SYMBOL}.*, distinct from never scored | n/a: no filter | n/a: each row is one set's complete result | n/a: append-only, read on demand (AC-18, AC-19) | n/a | Body replaced, retry offered | Shell state |
