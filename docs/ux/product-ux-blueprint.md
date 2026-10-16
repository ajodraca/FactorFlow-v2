---
artifact_schema_version: 1
artifact_id: PRODUCT-UX
artifact_type: ux-blueprint
artifact_version: 3
id: PRODUCT-UX
title: FactorFlow Owner Interface — Product UX Blueprint
kind: blueprint
status: draft
created: 2026-10-15
updated: 2026-10-15
owner: Alvaro de Jodra
owner_github: ajodraca
applies_to: every capability that delivers or modifies an owner-facing interface surface, M1 through M6
design_source: "Claude Design canvas 'FactorFlow v2 — Owner Interface', page 'Whole product · usability-first' (https://claude.ai/code/artifact/d80f7e78-4cfd-470f-ae4a-35f063250c6a); sources mirrored in docs/ux/design-source/"
design_system: FactorFlow Design System (shadcn/ui + Radix)
theme: design-system/theme.css
ai_provenance:
  agent_id: ux-blueprint
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude
  tool_version: unknown
  timestamp: 2026-10-16T01:40:00Z
  source_artifacts:
    - id: product-charter
      version: "2, approved 2026-09-03"
    - id: STD-UI
      version: "6"
    - id: CAP-001
      version: "8, approved 2026-09-06"
    - id: CAP-002
      version: "1, draft"
    - id: CAP-001-ux-design
      version: "5"
    - id: factorflow-design-system
      version: "12 components as of 2026-09-05, extended by this change"
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
---

# Product UX Blueprint: FactorFlow Owner Interface

> **Status: draft. The owner intends to approve it (2026-10-15); approval waits for a
> review through the harness gate.** The owner chose the canvas
> page *Whole product · usability-first* as the guide for developing the
> interface (2026-10-15). This blueprint turns that page into rules, routes,
> patterns and per-screen specifications that the SDD pipeline can cite. All
> seven owner decisions in §12 are decided: D-1, D-4 and D-5 through STD-UI v5,
> and D-2, D-3, D-6 and D-7 directly.

## 0. How to use this blueprint

The blueprint sits between the charter and each capability's UX artifacts.

- **A capability's `ux-brief.md`** cites `PRODUCT-UX` as a source artifact,
  names the screens and regions it delivers from §10, and inherits the shell
  (§3), patterns (§4), status map (§8) and action tiers (§9) without restating
  them. It records only what it adds or specializes.
- **A capability's `ux-design.md`** takes the matching screen specification in
  `docs/ux/screens/` as its starting layout. Where the capability needs less than
  the full screen (an earlier milestone), it delivers the regions §10 assigns and
  leaves the rest out, rather than inventing a different layout.
- **Implementation** builds the shell and shared patterns once, in
  `web/src/app/` and a new `web/src/components/patterns/` directory, and
  builds screens from them. No
  screen restyles a shared pattern.
- **The canvas is the visual reference, not the source of truth.** Where a
  screen specification and the canvas disagree, the specification wins. Every
  such disagreement is listed under "Differences from the canvas" in that
  specification, with the reason.

| Document | What it holds |
|----------|---------------|
| `docs/ux/product-ux-blueprint.md` | This file: principles, information architecture, shell, shared patterns, status and action rules, vocabulary, milestone map, conformance, decisions |
| `docs/ux/screens/S01-home.md` … `S09-data-health.md` | One specification per screen: layout, component mapping, view model, interactions, states, copy, accessibility, acceptance checks |
| `docs/ux/design-source/` | The nine canvas sources, mirrored for reference |
| `design-system/components/*` | Six new component specifications and new variants this blueprint requires (§13) |
| `docs/constitution/proposals/STD-UI-v5-proposal.md` | The STD-UI amendments this blueprint depends on (§12) |

## 1. Design principles

Each principle names the rules it serves. They are the tie-breakers when a
capability's design has to choose.

1. **Organise around the owner's loop, not the system's modules.** The owner
   does four things: research stocks, build a strategy, prove it, trade it. The
   navigation is those four verbs (Research, Strategies, Portfolio, plus Home
   for "what needs me"). Market data, downloads and configuration are plumbing;
   they live under Data health and Settings, one level down. *(Charter §1, §2.)*
2. **Every screen answers one question, in its title.** "Is the data good enough
   to trust?", "Move Quality Value Monthly to live?". The primary action answers
   it; secondary actions are visibly secondary.
3. **The strategy is the main object, and its lifecycle is always visible.**
   Draft → Backtest → Paper → Review → Live, drawn the same way everywhere
   (§4.2). The next step is always one primary button.
4. **Show the answer first, the evidence one click away.** Percentiles before
   scores, a plain-language verdict before the metrics, a count before the
   list. Every number can be opened to the inputs and dates behind it.
   *(STD-UI-13, STD-UI-28.)*
5. **Never hide incomplete data; never fill it in.** A missing input shows as
   *Incomplete* with its reason, in place, and strategies skip it. A screen
   never silently drops a row. *(STD-UI-4, STD-UI-14, STD-UI-16; CAP-002 AC-12.)*
6. **Real money is unmistakable, and stopping is one click.** The environment
   region and the kill switch sit in the same place on every screen. Real-money
   decisions carry their evidence on the same page. *(STD-UI-11, STD-UI-20,
   STD-UI-21, STD-UI-22.)*
7. **Plain words over system words.** The interface speaks the owner's language
   ("followed stocks", "download", "Incomplete") while code, API and documents
   keep the domain vocabulary. The mapping is fixed in §7 and in STD-UI-1 (v5).
8. **Prompt, don't hunt.** Problems surface on Home as "Needs you" items with one
   action each. Nothing important exists only on a page the owner must remember
   to visit.

## 2. Information architecture

### 2.1 Navigation

The left rail holds two groups.

| Group | Destination | Route | Question it answers | Screen spec |
|-------|-------------|-------|---------------------|-------------|
| Primary | **Home** | `/home` | What needs me today? | S01 |
| Primary | **Research** | `/research` | Which stocks look interesting, and why? | S03 |
| Primary | **Strategies** | `/strategies` | Where is each strategy in its lifecycle? | S04 |
| Primary | **Portfolio** | `/portfolio/live`, `/portfolio/paper` | What do I hold, and is it within my limits? | S08 |
| Data and system | **Data health** | `/data` | Is the data good enough to trust? | S09 |
| Data and system | **Settings** | `/settings` | How is the product configured? | not drawn; §2.3 |

Destinations show a count chip when they hold items needing attention (Home:
open "Needs you" items; Data health: stocks with problems). The chip is the
`badge` `status-warning` variant at `--text-xs` and carries the count as text.

### 2.2 Complete route map

| Route | Screen | Drawn on canvas | First milestone |
|-------|--------|-----------------|-----------------|
| `/` | redirect: `/setup` until setup is complete, else `/home` | — | M1 |
| `/setup` | S02 First-run setup (steps 1–4 in M1, step 5 from M2) | yes | M1 |
| `/home` | S01 Home | yes | M1 |
| `/research` | S03 Research — screener + inspector | yes | M1 |
| `/research/stocks/:symbol` | Stock evidence (full inputs and history) | CAP-002 page, restyled into this shell | M1 |
| `/research/compare?symbols=` | Compare side by side | CAP-002 page, restyled | M1 |
| `/research/universes` and `/research/universes/:id` | Universes list + detail | CAP-002 page, restyled | M1 |
| `/strategies` | S04 Strategies board | yes | M2 |
| `/strategies/new`, `/strategies/:id/rules` | S05 Strategy builder | yes | M2 |
| `/strategies/:id` | Strategy overview: redirects to the page for its current stage | — | M2 |
| `/strategies/:id/backtests/:backtestId` | S06 Backtest result | yes | M4 |
| `/strategies/:id/review` | S07 Promotion review | yes | M5 |
| `/portfolio/paper` | S08 Portfolio, paper tab | yes (live tab drawn) | M2 |
| `/portfolio/live` | S08 Portfolio, live tab | yes | M6 |
| `/data` | S09 Data health | yes | M1 |
| `/data/coverage` | Full coverage table (CAP-001 Coverage, restyled) | CAP-001 page | M1 |
| `/data/followed` | Followed stocks (CAP-001 Instruments, restyled) | CAP-001 page | M1 |
| `/data/downloads` and `/data/downloads/:id` | Download history + detail (CAP-001 Runs, Run detail) | CAP-001 pages | M1 |
| `/settings` | Settings: history depth, provider key, broker, promotion gate, live limits | partially (CAP-001 Settings) | M1 |

**Migration from the shipped CAP-001 routes.** `/coverage` → `/data/coverage`,
`/instruments` → `/data/followed`, `/runs` → `/data/downloads`, `/runs/:runId`
→ `/data/downloads/:runId`. The old paths redirect permanently (client-side
`Navigate replace`) for one release, then are removed. Tests in
`web/src/app/routes.test.tsx` and `shell.*.test.tsx` change with them.

### 2.3 Screens not drawn

Four routes reuse layouts already designed on the CAP-001 and CAP-002 canvas
pages, restyled into this shell: stock evidence, compare, universes, and the
three Data sub-pages. Settings is drawn only as CAP-001's history-depth and
credential form; the promotion-gate and live-limit sections are specified in
S07 and S08 and get their own capability UX design when M5 and M6 arrive.

## 3. Application shell

One shell, specified once, used by every route. It is a composition
(`design-system/intake.md` §1.3), built in `web/src/app/shell.tsx`.

### 3.1 Layout

```
┌──────────┬───────────────────────────────────────────────────────────────┐
│ Rail     │ Top bar (sticky): title/breadcrumb · ⌘K · environment · ▌Stop │
│ 208 px   ├───────────────────────────────────────────────────────────────┤
│          │ [Trading-stopped banner, only while stopped]                   │
│ Home  4  │                                                               │
│ Research │ Main region, padding --space-5, max-width 1180 px for          │
│ Strategy │ reading screens; full width for tables and boards              │
│ Portfolio│                                                               │
│          │                                                               │
│ Data   1 │                                                               │
│ Settings │                                                               │
└──────────┴───────────────────────────────────────────────────────────────┘
```

| Region | Rule |
|--------|------|
| Page ground | `hsl(var(--muted) / 0.5)` over `--background`. Content sits on `card`s on `--background`. The canvas's ad hoc `--surface` (210 40% 98%) is this value; no new token |
| Rail | 208 px; `--border` right edge; brand mark, primary group, flexible gap, data-and-system group pinned to the bottom. Items: 16 px stroke icon + label, `--space-2` × `--space-3` padding, `--radius`. Current item: `--background` fill with a 1 px `--border` ring; icon in `--foreground` |
| Top bar | Sticky, never scrolls out of view (STD-UI-11). `--background`, bottom `--border`. Left: page title or breadcrumb at `--text-base` weight 600. Then command button, environment region, a 1 px divider, and the kill switch, always the last item at the top right |
| Main | `--space-5` padding. Reading screens (Home, Setup, Promotion review, Data health) cap at 1180 px; tables and boards use the full width |

**Responsive.** The product is a desktop tool on loopback (CAP-001 §5.3), so
≥ 1280 px is the design width. Between 1024 and 1279 px, side panels (Research
inspector, Builder preview) move below their main column. Below 768 px the rail
stacks above the content as a horizontal list and the top bar wraps; the
environment region and the kill switch stay in the first visible row. Nothing
needs to be pleasant on a phone, but nothing may be unreachable there.

### 3.2 Environment region (STD-UI-11)

A `role="region"` labelled *Trading environment*, holding one chip per
environment that has an active strategy. Each chip states the environment in
words and carries a shape, so the distinction never rests on hue.

| State | Chips | Tokens and shape |
|-------|-------|------------------|
| Nothing trades yet | `NO TRADING YET` | `--status-neutral` on `--status-neutral-muted`, no shape |
| Paper only | `PAPER · n` | `--risk-paper` on `--risk-paper-muted`, hollow circle |
| Live and paper | `LIVE · n STRATEGY` then `PAPER · n` | `--risk-real-money` on `--risk-real-money-muted`, filled diamond; then paper |
| Trading stopped | chips unchanged; the kill switch shows the stopped state (§3.3) | — |

Chips are links: live → `/portfolio/live`, paper → `/portfolio/paper`. Text is
uppercase, `--text-xs`, weight 700. The chip text is the accessible name; the
shape is `aria-hidden`.

### 3.3 Kill switch (STD-UI-21)

A `button` of the new `kill-switch` variant (§13), always the last element of
the top bar.

| State | Rendering | Behaviour |
|-------|-----------|-----------|
| Trading allowed | Dark button (`--foreground` fill, `--background` text) with a `--status-critical` octagon icon: **Stop all trading** | One activation stops trading. No confirmation, no dialog (STD-UI-21's documented departure from `edg-compliance`). Sends `POST` to the kill-switch endpoint and then re-reads the stored state |
| Request in flight | Same button, label **Stopping…**, `aria-busy="true"` | The rendered state changes only when the stored state does. If the request fails, the button returns to its first state and a `toast` `error` names the operation, the resource and the reason |
| Stopped | The button is replaced by a non-interactive status: octagon + **Trading stopped** in the `kill-switch` variant's stopped style, and a full-width banner directly under the top bar | Banner text: *All trading is stopped since {time}. No new orders are sent, in live or paper. What you hold stays held.* The banner's only control is **Resume trading…**, which is capital-at-risk (§9) and opens `dialog` `real-money` |

**Severity.** A stop the owner engaged is an outcome the owner intended, so it
is tiered **neutral** (STD-UI-12) and made prominent by placement, size and
words, not by fault colour. A stop the system engaged (daily-loss limit,
broker-side limit) is tiered **serious** and says what triggered it. *This
corrects the canvas, which draws the owner-engaged stop in critical red.*

**Reachability.** The kill switch renders in every shell state, including setup,
error and unreachable. When the application API is unreachable, the button
still renders. Activating it shows *Can't reach FactorFlow. Use the broker's own
kill switch now:* followed by a link to the broker's dashboard, because charter
§3 requires stopping not to depend on the application being responsive.

### 3.4 Command palette

`⌘K` / `Ctrl+K` and the top-bar button open the new `command` component in its
dialog form. Result groups, in order: Stocks (symbol, name), Strategies,
Universes, Pages, Actions (*Download now*, *New strategy*). It never offers
*Stop all trading* or any capital-at-risk action: those have one fixed place
each. The global shortcut is the shell's only keydown listener and ignores
keystrokes inside text inputs.

### 3.5 Shell states

| State | Rendering |
|-------|-----------|
| Setup incomplete | `/` routes to `/setup`; the rail is present and other destinations are reachable, each showing its honest empty state |
| API unreachable | Main region replaced by the unreachable state (as CAP-001 shipped it); rail, top bar, environment chips (last known, marked *as of {time}*) and kill switch remain |
| Trading stopped | §3.3 banner on every route |
| Classifications updating / not current | Shown where scores are shown (S03, S05), not in the shell |

## 4. Shared patterns

Compositions built once in a new `web/src/components/patterns/` directory and
reused. Each lists
the design-system components it is made from.

### 4.1 "Needs you" item

One row: severity tile (28 px, tier fill, tier shape) · tier `badge` with a
short tag · one-line title in weight 600 · one or two sentences of explanation ·
exactly one action button. The action is `button` `default` for *Ready* items
and `outline` otherwise. Items sort by tier (critical, serious, warning, good,
neutral), then newest first. An item disappears only when its cause is
resolved, never on view. Components: `card`, `badge`, `button`.

### 4.2 Lifecycle stepper

The new `stepper` component, horizontal, with five steps: **Draft · Backtest ·
Paper · Review · Live**. Done steps show a check on a filled dot; the current
step has `aria-current="step"` and an `--status-active` ring; future steps are
outlined. Before M4 the Backtest step is omitted, and before M5 the Review step
is omitted: the stepper shows only the stages the product has (D-6).

### 4.3 Strategy stage badge

| Stage | Component | Tier / channel |
|-------|-----------|----------------|
| Draft | `badge` `status-neutral`, hollow circle | neutral |
| Backtested | `badge` `status-neutral`, filled circle | neutral |
| Paper trading | `badge` `paper` | environment channel |
| Ready for review | `badge` `status-good` *Gate met* | good |
| Live | `badge` `real-money` | environment channel |
| Paused by you | `badge` `status-neutral` *Paused* | neutral |
| Stopped by a limit | `badge` `status-serious` *Stopped: daily-loss limit* | serious |
| Retired | `badge` `secondary` | — |

### 4.4 Factor cell

Percentile first: the number in `--font-numeric` weight 600, right-aligned in a
fixed 22 px box, then a 52 px bar (`--seq-4` on `--seq-1`). The standardised
score appears in the inspector and on evidence pages, never in place of the
percentile in a list. Incomplete: `badge` `coverage-absent` labelled
*Incomplete*, with the reason in a tooltip and in the inspector. Not enough
stocks to rank: `badge` `coverage-unknown` labelled *Not enough to rank*. Column
headers carry the factor swatch (`--factor-value`, `--factor-growth`,
`--factor-momentum`): the swatch is identity, the bar is magnitude, and they
never swap (STD-UI-7, STD-UI-9).

### 4.5 Inspector panel

A right-hand `card` (300–340 px) that shows the selected row's detail without
leaving the list. Selection is single and follows click or `Enter` on a row;
the selected row carries a 3 px inset `--status-active` edge and
`--status-active-muted` fill. The inspector ends with links to the full evidence
page. On widths below 1280 px it moves below the list.

### 4.6 Selection tray

When one or more rows are checked, a dark bar (`--foreground` fill) appears at
the foot of the list: *{n} selected* and the bulk actions (*Compare side by
side*, *Add to universe…*). It is a `role="region"` labelled *Selection* and is
announced politely when it appears.

### 4.7 Sentence builder

Rules are written as sentences whose blanks are controls: `select` `inline`
for choices, `input` `numeric` or `percentage` for numbers (56 px wide), and
`button` `ghost` *+ condition* to extend. Each sentence is a `<p>`. Each control
has an accessible name that reads as the blank: *Factor for condition 1*,
*Minimum percentile for condition 1*. A plain-English summary of the whole rule
set sits beside the builder and updates as controls change.

### 4.8 As-of line

Every number that comes from data carries when it was known, in `--text-xs`
`--muted-foreground`, directly under the region title: *Scores 2026-10-15 17:46
CDT*, *Prices at today's close, 2026-10-15 15:00 CDT · checked 18:52:14*.
Timestamps are America/Chicago and carry the zone; session dates are
unconverted (STD-UI-5). Polled regions say *checked {time}* (STD-UI-25).

### 4.9 Guarded action

Capital-at-risk actions (§9) are never adjacent to routine actions (STD-UI-22).
The guarded button sits at the far right of its row, separated by at least
`--space-5`, with a helper line on its left saying what remains before it can
act (*2 things left: confirm each statement and say why*). Until then it is
`button` `blocked` with that line as its `aria-describedby`. When ready, it
opens `dialog` `real-money`; it never places the order itself (button spec §2).

### 4.10 State coverage

Every data region implements STD-UI-23's eight states. The common renderings:

| State | Rendering |
|-------|-----------|
| Loading | Skeleton at the expected shape; never a full-screen spinner |
| Empty, never populated | A sentence saying nothing exists yet and the one action that creates it |
| Empty, nothing found | *No {things} match these filters.* with **Clear filters** |
| Partial | Normal rendering plus the counts of what is missing (*3 of 1,236 incomplete*) |
| Stale | As-of line marked *not reflecting the latest download* (`badge` `status-warning`) |
| Unavailable | The check that could not run, as `coverage-unknown`, with its reason |
| Error | Region header kept, body replaced by the operation, resource and reason, and **Try again** |
| Unreachable | Shell state (§3.5) |

## 5. Screens

| ID | Screen | Route | Canvas board | Spec |
|----|--------|-------|--------------|------|
| S01 | Home — what needs you today | `/home` | `P01-Home.dc.html` | `screens/S01-home.md` |
| S02 | First-run setup | `/setup` | `P02-Setup.dc.html` | `screens/S02-setup.md` |
| S03 | Research — screener + inspector | `/research` | `P03-Research.dc.html` | `screens/S03-research.md` |
| S04 | Strategies — lifecycle board | `/strategies` | `P04-Strategies.dc.html` | `screens/S04-strategies.md` |
| S05 | Strategy builder | `/strategies/:id/rules` | `P05-Builder.dc.html` | `screens/S05-builder.md` |
| S06 | Backtest result | `/strategies/:id/backtests/:backtestId` | `P06-Backtest.dc.html` | `screens/S06-backtest.md` |
| S07 | Promotion review | `/strategies/:id/review` | `P07-Promote.dc.html` | `screens/S07-promotion-review.md` |
| S08 | Portfolio — live and paper | `/portfolio/:env` | `P08-Portfolio.dc.html` | `screens/S08-portfolio.md` |
| S09 | Data health | `/data` | `P09-Data.dc.html` | `screens/S09-data-health.md` |

## 6. Cross-screen flows

**First run.** `/` → S02 step 1 (market data key detected) → step 2 (history
depth) → step 3 (stocks to follow) → step 4 (first download, runs in the
background; the owner may leave) → S01, which shows the download as a *Needs
you* item until scores exist → S03 once scores exist. From M2, step 5 connects
the paper account.

**Idea to live.** S03 filter → *Use in a strategy* → S05 prefilled with the
filter as conditions → *Run backtest* → S06 → *Start paper trading* (consequential
confirm) → S04 Paper column, counting days toward the gate → when the gate is met,
an S01 *Ready* item and the S04 *Ready for review* column → S07 → `dialog`
`real-money` → S04 Live column and S08 live tab.

**Data problem.** A partial download → S01 *Data gap* item and a Data health
count → S09 *Needs fixing* → retry, correct the symbol, or stop following. Every
screen that shows an affected stock shows it as *Incomplete*; every strategy
holding it keeps holding it and does not trade it until it is complete.

**Emergency stop.** The kill switch from any screen → stopped banner on every
route → S08 shows *Not sent: trading stopped* on scheduled orders → **Resume
trading…** → `dialog` `real-money` listing what will trade at the next
rebalance → trading allowed.

## 7. Vocabulary

The interface uses the display labels below. Code, API, database, logs and SDD
documents keep the domain terms. STD-UI-1 (v5, 2026-10-15) makes this table
normative: user-visible text uses the display label and never the domain term
beside it.

| Domain term (STD-UI-1) | Display label | Where it appears |
|------------------------|---------------|------------------|
| instrument on the acquisition list | **followed stock** | Setup, Data health, followed-stocks list |
| retire (an instrument) | **stop following** | Data health, followed-stocks list |
| acquisition run | **download** | Data health, Home, downloads list |
| run outcome `succeeded` / `partial` / `failed` / `cancelled` / `abandoned` | **Complete** / **Partial** / **Failed** / **Cancelled by you** / **Interrupted** | Downloads list and detail |
| coverage | **data** (as in "data current to …") on Data health; *coverage* stays on `/data/coverage` | Data health |
| not classified (input missing or outdated) | **Incomplete** | Research, Builder, Universes |
| not enough stocks to rank | **Not enough to rank** | Research |
| classification | **score**, shown as a **percentile** and a **standardised score** (never shortened to *score*) | Research, Builder |
| universe | **universe** (unchanged) | Research |
| promotion | **review** (the step) / **go live** (the action) | Strategies, Promotion review |
| kill switch | **Stop all trading** (the control) / **Trading stopped** (the state) | Shell |
| paper / live | **Paper** · **Live · real money** | Shell, Portfolio |

New concepts this blueprint introduces, now in STD-UI-1: *gate* (the owner's
promotion criteria), *rebalance*, *limit* (per-stock and daily-loss),
*benchmark*, *market period*.

## 8. Status and severity map

Every status the product renders, mapped to exactly one STD-UI-12 tier. Each is
drawn as `badge` `status-<tier>` with its label and the tier shape (neutral:
hollow circle; active: ringed dot; good: filled circle; warning: triangle;
serious: diamond; critical: square).

| Domain | State → label | Tier |
|--------|---------------|------|
| Download | requested → *Queued* | neutral |
| Download | running → *Downloading* | active |
| Download | cancelling → *Stopping* | warning |
| Download | succeeded → *Complete* | good |
| Download | partial → *Partial* | warning |
| Download | failed → *Failed* | critical |
| Download | cancelled → *Cancelled by you* | neutral |
| Download | abandoned → *Interrupted* | serious |
| Followed stock | provider does not recognise it → *Not found* | warning |
| Scores | being produced → *Updating* | active |
| Scores | previous set shown → *Not reflecting the latest download* | warning |
| Scores | production failed → *Score update failed* | critical |
| Live prices | streaming → *Streaming* | good |
| Live prices | reconnecting → *Reconnecting* | warning |
| Live prices | down beyond the reconnect window → *Not streaming* | critical |
| Strategy | see §4.3 | — |
| Gate criterion | met → *Met* | good |
| Gate criterion | not met → *Not yet* | warning |
| Gate criterion | met but carrying a mark → *Needs acknowledgement* | warning |
| Order | submitted → *Sent* | active |
| Order | filled → *Filled at $x* | good |
| Order | partially filled, remainder cancelled → *Filled n of m* | warning |
| Order | rejected by broker → *Rejected* | critical |
| Order | not sent because trading is stopped → *Not sent: trading stopped* | neutral |
| Order | trimmed by a per-stock limit → *Trimmed by the 8% limit* | warning |
| Trading | stopped by you → *Trading stopped* | neutral (§3.3) |
| Trading | stopped by a limit → *Stopped: {limit}* | serious |
| Broker / provider | connected / key found → *Connected* / *Found* | good |
| Broker / provider | missing or rejected → *Not connected* / *Rejected* | critical |

## 9. Action tiers (STD-UI-19)

| Action | Screen | Tier | Confirmation |
|--------|--------|------|--------------|
| Follow stocks, paste or upload symbols | S02, followed list | routine | none |
| Stop following a stock | S09, followed list | consequential | `dialog` `confirm`: *Stop following {SYMBOL}? Its history is kept, and strategies holding it keep holding it. You can follow it again later.* |
| Download now, retry failed | S09 | routine | none |
| Cancel a download | downloads | consequential | CAP-001 wording |
| Save a screen, select, compare | S03 | routine | none |
| Create, rename a universe; add members | universes | routine | none |
| Remove a member, retire a universe | universes | consequential | CAP-002 wording |
| Edit strategy rules (autosaved, creates a version) | S05 | routine | none |
| Run a backtest | S05, S06 | routine | none |
| Start paper trading | S06, S04 | consequential | `dialog` `confirm`: *Start paper trading {name} with ${amount} of practice money? Orders go to your Alpaca paper account from the next rebalance, {date}.* |
| Pause a strategy | S08, S04 | consequential | `dialog` `confirm`: *Pause {name}? It sends no orders until you resume it. What it holds stays held.* |
| Stop all trading | shell | protective, single action | none (STD-UI-21) |
| Resume trading | shell banner | capital-at-risk | `dialog` `real-money` |
| Go live (promotion) | S07 | capital-at-risk | evidence, acknowledgements and rationale on the page, then `dialog` `real-money` |
| Change live allocation or live limits | Settings, S08 | capital-at-risk | `dialog` `real-money` |
| Resume a paused live strategy | S08 | capital-at-risk | `dialog` `real-money` |

Errors always name the operation, the resource and the reason, and offer the
recovery action where one exists: *Downloading company financials for KO
failed: the provider timed out 3 times. **Retry KO***.

## 10. Milestone map

What each milestone's capabilities deliver from this blueprint. A capability's
UX brief claims rows from this table.

| Milestone | Capability | Delivers |
|-----------|------------|----------|
| M1 | **Shell rework** (new, small; or folded into CAP-002) | §3 shell without the kill switch and environment region (no order path exists yet); rail and routes of §2; route migration; command palette with Stocks, Universes and Pages groups |
| M1 | CAP-001 (shipped) | Restyle only: Coverage, Instruments, Runs, Run detail and Settings move under `/data/*` and `/settings` with §7 labels; S09 Data health built on CAP-001's API; S02 steps 1–4 |
| M1 | CAP-002 (draft) | S03 Research with inspector and selection tray; stock evidence, compare and universes routes; S01 Home with the data card and data-related *Needs you* items only |
| M2 | Strategies & paper trading | **Scheduled downloads** each trading day at 17:30 CT alongside on-demand ones, with a *Needs you* item when a scheduled download fails (D-2); S04 board without the Backtested and Review columns; S05 builder with *Start paper trading* as its primary action; S08 paper tab; S02 step 5; environment region (paper); **kill switch** (the first order path appears here, and STD-UI-21 applies to paper orders too); §4.2 stepper with Draft · Paper · Live |
| M3 | Live market data | S09 *Live prices* card; S08 and S01 as-of lines move to intraday; *Reconnecting* and *Not streaming* states |
| M4 | Backtesting | S06; S04 Backtested column; S05 *Run backtest* becomes primary; Backtest step added to the stepper |
| M5 | Promotion gate | S07; S04 Ready-for-review column; *Ready* items on S01; Settings → Promotion gate; decision history |
| M6 | Live trading | S08 live tab with limit meters; live environment chip; resume flow; system-engaged stops; Settings → live limits |

## 11. STD-UI conformance (product level)

Capabilities record their own conformance; this table says where the blueprint
already discharges each rule, so a capability can cite it.

| Rule | Applies | Where satisfied |
|------|---------|-----------------|
| STD-UI-1 | yes | §7, the display labels STD-UI-1 v5 fixes |
| STD-UI-2 | yes | §9 confirmation wording; *stop following* keeps history and says so |
| STD-UI-3 | yes | All figures `--font-numeric`, fixed precision per column; scores and returns carry an explicit sign |
| STD-UI-4 | yes | §4.4 *Incomplete*; em dash for an absent value; blank only for not applicable |
| STD-UI-5 | yes | §4.8 |
| STD-UI-6 | yes | Money and market capitalisation in full in tables and comparisons (S06, S08, compare). Chart axis labels use full figures too |
| STD-UI-7 | yes | Factor swatch = identity, bar = magnitude (`--seq`), sign colour = direction (`--gain`/`--loss`), status = tiers, environment = `--risk-*` |
| STD-UI-8 | yes | Every status has label and shape (§8); every direction has a sign |
| STD-UI-9 | yes | Chart series colours follow the entity (S06: strategy `--chart-1`, benchmark `--chart-6`) |
| STD-UI-10 | no | Binds the theme. No token is added (§13) |
| STD-UI-11 | yes | §3.2 |
| STD-UI-12 | yes | §8; §3.3 tiers the owner-engaged stop as neutral |
| STD-UI-13 | yes | §4.8; S03 inspector and evidence routes |
| STD-UI-14 | yes | §4.4 three states |
| STD-UI-15 | yes | Screens show recorded values only; S05's *If it ran today* is labelled a preview of today's scores, not a holding |
| STD-UI-16 | yes | Incomplete stocks are skipped, never filled; S01 and S09 say so |
| STD-UI-17 | yes | *Possibly restated* mark on scores, on S06's limits box and as a required acknowledgement on S07 |
| STD-UI-18 | yes | S03 footnote and S09: the check judges presence and currency, not correctness |
| STD-UI-19 | yes | §9 |
| STD-UI-20 | yes | S07: evidence, acknowledgements and a required rationale on one page; not a toggle |
| STD-UI-21 | yes | §3.3 |
| STD-UI-22 | yes | §4.9 |
| STD-UI-23 | yes | §4.10, and a states table in every screen spec |
| STD-UI-24 | yes | Accessibility section in every screen spec; new components carry Radix-derived contracts |
| STD-UI-25 | yes | §4.8 *checked {time}*; cadences per screen spec |
| STD-UI-26 | yes | S02 setup is a five-step operation with back navigation that keeps entered data |
| STD-UI-27 | yes | S06: one y-scale, legend for two series, fixed hue order; S01 sparklines are single-series |
| STD-UI-28 | yes | S06 states measure, units, as-of and n, with *View as table*. S01 sparklines link to their strategy, where the table lives |
| STD-UI-29 | yes | Only theme tokens; density inherits `--row-height` (OQ-UI-4 still open) |
| STD-UI-30 | yes | Research, coverage and followed-stock lists are virtualised with search and filter |

## 12. Owner decisions this blueprint depends on

| ID | Decision | Blocks | Recommendation / outcome |
|----|----------|--------|--------------------------|
| D-1 | Adopt the display labels of §7 by amending STD-UI-1 | Copy in every screen | **Decided 2026-10-15: adopted** (STD-UI v5, A-1) |
| D-2 | Downloads run on a schedule (each trading day, 17:30 CT) as well as on demand | S09 copy, S01 data card, M2 scope | **Decided 2026-10-15: from M2**, with paper trading. Paper evidence feeds the promotion gate, so it must never rest on data nobody remembered to download. CAP-001's out-of-scope note already assigns "data kept current" to the first capability that needs it; that is M2's. On-demand downloads and their queueing are unchanged |
| D-3 | The promotion gate criteria and their values: minimum paper days, maximum distance from the backtest, minimum market periods beaten, zero rejected orders | S04, S07 | **Decided 2026-10-15: owner settings**, defaults 60 paper trading days, within 2 percentage points of the backtest, backtest beats the benchmark in at least half its market periods, 0 rejected orders. Changes are recorded with their date. The gate only makes a review available; going live always needs the owner's review |
| D-4 | Close OQ-UI-5: promotion captures a written rationale | S07 | **Decided 2026-10-15: yes**; OQ-UI-5 closed (STD-UI v5, A-2) |
| D-5 | Allow the `--risk-paper` / `--risk-real-money` channel outside the environment region, for paper and live badges, tiles and column headers | S01, S04, S08 | **Decided 2026-10-15: allowed**, only to mark which environment a thing belongs to and always with words (STD-UI v5, A-4); `theme.css` comment corrected |
| D-6 | The lifecycle stepper shows only the stages the product has (no Backtest step before M4, no Review step before M5) | S04, S05 | **Decided 2026-10-15: only shipped stages.** When a stage ships, strategies already past it are not grandfathered: a paper strategy with no backtest needs one before it can be reviewed |
| D-7 | The kill switch ships in M2 with paper trading rather than in M6 | M2 scope | **Decided 2026-10-15: M2.** Paper orders reach a real broker environment (charter §3); the stored stop state checked before every order is built once, on paper, and reused by M6 |

## 13. Design-system changes

Six component specifications are added at `status: beta`, each with
interaction and accessibility contracts taken from upstream documentation as
`design-system/intake.md` requires:

| Slug | Upstream | Used by |
|------|----------|---------|
| `stepper` | No Radix primitive; HTML ordered list + WAI-ARIA `aria-current="step"` | §4.2, S02 |
| `progress` | Radix Progress (`progressbar`); `meter` variant per WAI-ARIA APG Meter | S04 paper-day progress, S08 limit meters, download progress. Closes CAP-001's open gap |
| `checkbox` | Radix Checkbox | S03 row selection, S07 acknowledgements |
| `radio-group` | Radix Radio Group | S02 source choice, S05 incomplete-data rule, S07 start choice |
| `toggle-group` | Radix Toggle Group | S05 weighting, S08 environment switch |
| `command` | shadcn/ui Command on cmdk, in Radix Dialog | §3.4 |

Variants added to existing specs:

- `button` `kill-switch`: §3.3. A protective control, not a real-money variant,
  so the spec's rule that no button places a real-money trade still holds.
- `chart` `sparkline`: a single-series line without axes, for trends inside
  lists, with its accessible name stating the direction.
- `chart` period bands: an annotation on `line` that shades named date ranges
  in `--muted`, labelled in `--chart-axis`.
- `data-table` `virtualised`: windowed rows with server-side sort, filter and
  count for lists at the committed 3,000-row volume (STD-UI-30).

Within the new specs, `checkbox` carries an `acknowledgement` variant (S07) and
`toggle-group` an `environment` variant (S08).

No token is added. The canvas's `--surface` is `hsl(var(--muted) / 0.5)`, and
its 11 px labels move to `--text-xs` (12 px).

## 14. Revision history

| Date | Version | Change |
|------|---------|--------|
| 2026-10-15 | 3 | Closed D-2 (scheduled downloads from M2), D-3 (gate criteria are owner settings with the stated defaults), D-6 (stepper shows only shipped stages) and D-7 (kill switch in M2); §10 M2 gains scheduled downloads |
| 2026-10-15 | 2 | Recorded the owner's acceptance of STD-UI v5: D-1, D-4 and D-5 decided; §7 vocabulary is normative; owner-engaged stop tiered neutral by STD-UI-12 itself (A-3) |
| 2026-10-15 | 1 | First draft, from the canvas page *Whole product · usability-first*, which the owner chose as the development guide on 2026-10-15 |
