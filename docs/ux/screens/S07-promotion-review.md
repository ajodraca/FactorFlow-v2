---
artifact_schema_version: 1
artifact_id: PRODUCT-UX-S07
artifact_type: ux-screen-spec
artifact_version: 1
parent: PRODUCT-UX
title: "S07 Promotion review — paper to live"
route: /strategies/:id/review
design_source: docs/ux/design-source/P07-Promote.dc.html
status: draft
created: 2026-10-15
updated: 2026-10-15
owner: Alvaro de Jodra
owner_github: ajodraca
ai_provenance:
  agent_id: ux-blueprint
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude
  tool_version: unknown
  timestamp: 2026-10-16T01:40:00Z
  source_artifacts:
    - id: PRODUCT-UX
      version: "1"
    - id: STD-UI
      version: "5"
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
---

# S07 Promotion review — paper to live

## 1. Purpose

The one place a strategy is trusted with real money. STD-UI-20 shapes it:
evidence in the same view as the action, explicit acknowledgement of any mark,
the owner's stated rationale, and never a toggle. Its title is the question:
*Move {name} to live?*

## 2. Delivered by

M5 (Promotion gate). The live account, allocation and limits it configures go
live with M6; until M6 the action is absent and the page reads as evidence only,
ending with *Live trading arrives in a later release.*

## 3. Layout

Reading width (1180 px cap). Top to bottom:

1. **Header row.** `h1` *Move {name} to live?*; stepper with Review current.
2. **Real-money note.** `role="note"`: the `real-money` chip *REAL MONEY* and
   *This decision moves real money. Read the evidence, then confirm at the
   bottom. Nothing happens until you do.*
3. **Your gate** (`card`). Header with *Criteria you set in Settings ·
   evaluated {time}*. One row per criterion: tier tile, criterion in words,
   observed value at right. A criterion carrying a mark is `status-warning`
   *Needs acknowledgement* and points to the acknowledgement it requires.
4. **Two cards side by side.**
   - **Paper vs backtest, same {n} days**: rows Return, Worst drop, Trades,
     Average cost per trade, Days skipped for incomplete data; columns Paper and
     Backtest; then a sentence that names any regime the paper period did not
     cover.
   - **How it will run live**: *Money to allocate* (`input` `currency`) with
     the unallocated live cash under it; *Start* (`radio-group`): *At the next
     rebalance, {time}* (recommended) / *Now: buy today's targets at tomorrow's
     open*; *Limits (live only)*: per-stock and daily-loss limits in words; the
     broker line.
5. **Confirm you understand** (`card`). Three `checkbox` acknowledgements as
   full-width bordered labels, then *Why now?* `textarea` `autosize` with its
   purpose in the label.
6. **Action row.** Left: **Keep paper trading** (`outline`). Right, at least
   `--space-5` away: the remaining-items line and **Go live with ${amount}…**,
   which follows blueprint §4.9.

### The confirmation dialog

**Go live with ${amount}…** opens `dialog` `real-money` (not dismissible by
click-outside; initial focus on **Cancel**):

> **Start live trading {name}?**
> ${amount} of real money · first orders at {time} · never more than {n}% in one
> stock · stops itself after a {n}% daily loss · Alpaca live account.
>
> **Cancel** · **Start live trading** (`--risk-real-money`)

## 4. Component mapping

| Element | Component | Variant |
|---------|-----------|---------|
| Real-money chip | `badge` | `real-money` |
| Gate rows | composition: `badge` `status-*` + text | — |
| Paper vs backtest | `data-table` | `compact` |
| Allocation | `input` | `currency` |
| Start choice | `radio-group` | `default` |
| Acknowledgements | `checkbox` | `acknowledgement` |
| Rationale | `textarea` | `autosize` |
| Go live | `button` | `blocked` until ready, then `default`; opens the dialog |
| Final confirmation | `dialog` | `real-money` |
| Keep paper trading | `button` | `outline` |

## 5. View model

| Field | Type | Source |
|-------|------|--------|
| `strategy` | `{id, name, version}` | strategy service |
| `gate` | `{evaluatedAt, criteria: [{id, text, observed, state: met/notMet/needsAck, ackId?}]}` | promotion service, evaluating the owner's gate settings (D-3) |
| `comparison` | `{start, end, days, paper: {...}, backtest: {...}, uncoveredRegimes: []}` | promotion service |
| `marks` | `[{id, text}]` from STD-UI-17 sources (restated holdings) | promotion service |
| `live` | `{unallocatedCash, nextRebalance, limits: {perStockPct, dailyLossPct}, broker: {name, connected}}` | broker + settings |
| `acknowledgements` | `[{id, text, required: true}]` — the fixed set plus one per mark | promotion service |
| `decision` (POST) | `{strategyVersion, amount, start, acknowledged: [ids], rationale, evidenceSnapshotId}` | promotion service; stored as the decision history (charter §3) |

The decision stores the id of the evidence snapshot the owner saw, so the
history records what was on screen, not what is computed later.

## 6. Interactions

- The page never changes state until the dialog's **Start live trading**.
- The remaining-items line counts unchecked acknowledgements and an empty
  rationale; it is the go-live button's `aria-describedby`.
- If the gate is no longer met when the page loads (for example tracking moved
  beyond the limit), the go-live button is `blocked` with *The gate is no longer
  met: {criterion}*, and the criterion row shows *Not yet*.
- If the evidence changes while the page is open (a new trading day), a
  `status-warning` banner says *The evidence was updated at {time}. Review it
  before going live.* and clears the acknowledgements.
- After success: a `status-good` confirmation on this page (*Promoted. {name}
  goes live at {time} with ${amount}. Your reasons are saved with this
  decision.*), the strategy moves to Live on S04, and the environment region
  gains or increments the live chip.

## 7. States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton per card |
| Empty, never populated | Not reachable for a strategy not in Ready for review: route redirects to the strategy's stage page |
| Empty, nothing found | Not applicable |
| Partial | Gate rows *Not yet*: evidence shown, action blocked with the reason |
| Stale | Evidence-updated banner (§6) |
| Unavailable | Broker live account not connected: action blocked, *Connect your live account in Settings*, link |
| Error | Promotion failed: dialog stays open with operation, strategy and reason; nothing is half-applied |
| Unreachable | Shell state |

## 8. Copy

| Key | Text |
|-----|------|
| Acknowledgement 1 | *I reviewed the evidence above, including that paper trading has not been through a downturn.* (second clause only when `uncoveredRegimes` is non-empty) |
| Acknowledgement 2 (per mark) | *{n} of {m} holdings are scored from fundamentals that may reflect later restatements, so the backtest may flatter them.* |
| Acknowledgement 3 | *Live orders spend real money. Stop all trading halts new orders at once; it does not sell what I hold.* |
| Rationale label | *Why now?* — *Saved with this decision so you can revisit it later* |
| Remaining line | *{n} things left: confirm each statement and say why* / *Ready. This starts real-money trading.* |

## 9. Accessibility

- Every acknowledgement is a real `checkbox` whose label is the full sentence.
- The go-live button stays focusable while blocked and exposes the reason
  (`button` `blocked` contract).
- The dialog traps focus, starts on **Cancel** (STD-UI-22), and returns focus to
  the go-live button on close.
- The real-money note is announced as a note on page load.

## 10. Acceptance checks

1. **S07-1** Evidence, acknowledgements, rationale and the action are on one
   page (STD-UI-20).
2. **S07-2** The action is impossible until every acknowledgement is checked and
   a rationale is entered (STD-UI-20, v5).
3. **S07-3** Promotion requires the `real-money` dialog; no other path promotes.
4. **S07-4** The dialog's initial focus is Cancel, and the go-live control is not
   adjacent to Keep paper trading (STD-UI-22).
5. **S07-5** The stored decision references the evidence snapshot shown.
6. **S07-6** Every STD-UI-17 mark on the strategy's holdings produces its own
   acknowledgement.

## 11. Differences from the canvas

- The canvas's go-live button promotes directly and is styled with
  `--risk-real-money`. The `button` spec forbids a real-money button variant;
  the button opens `dialog` `real-money`, whose confirm action carries the
  colour (§3).
- The canvas does not show the evidence-updated banner or the gate-no-longer-met
  state; §6 adds them.
