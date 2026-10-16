---
artifact_schema_version: 1
artifact_id: PRODUCT-UX-S08
artifact_type: ux-screen-spec
artifact_version: 2
parent: PRODUCT-UX
title: "S08 Portfolio — live and paper"
route: /portfolio/live, /portfolio/paper
design_source: docs/ux/design-source/P08-Portfolio.dc.html
status: draft
created: 2026-10-15
updated: 2026-10-16
owner: Alvaro de Jodra
owner_github: ajodraca
ai_provenance:
  agent_id: ux-blueprint
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude
  tool_version: unknown
  timestamp: 2026-10-16T03:39:39Z
  source_artifacts:
    - id: PRODUCT-UX
      version: "4"
    - id: STD-UI
      version: "6"
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
---

# S08 Portfolio — live and paper

## 1. Purpose

What is held, whether it is inside the owner's limits, and what was traded.
One screen, two environments, never mixed: the environment is chosen by a
segmented control, stated in words, and repeated in the page's colour channel.

## 2. Delivered by

| Region | Milestone |
|--------|-----------|
| Paper tab: summary, strategy sections, positions, orders | M2 |
| Intraday prices and as-of | M3 |
| Pause, resuming a paused paper strategy, and the *Not sent: trading stopped* order state (D-7) | M2 |
| Live tab, limit meters, per-strategy daily-loss stops, resuming live strategies | M6 |

Before M6 the environment control shows only *Paper · practice*, and the live
route redirects to paper.

## 3. Layout

1. **Environment row.** `toggle-group` `environment`: *◆ Live · real
   money* and *○ Paper · practice* (each with its shape); the selected one in its
   environment colour. Right: as-of line (*Alpaca live account · prices at
   today's close, {time} · checked {time}*).
2. **Summary row.** Four `card` `metric` tiles: *Account value* (with cash),
   *Today* (signed amount and %), *Largest position vs {n}% limit* (value, symbol,
   `progress` `meter`), *Closest to its daily-loss limit* (strategy name,
   today's loss vs that strategy's {n}% limit, `progress` `meter`, *At {n}% a
   strategy stops itself; the others keep trading.*). Each strategy has its own
   daily-loss limit (D-11). Paper shows the same four;
   limit tiles say *paper limits mirror your live settings* when they do.
3. **One card per strategy** in the environment: header with name, stage facts
   (*Live since {date} · {return} · next rebalance {time}*) and actions:
   **Evidence** (`outline`) then, separated by `--space-5`, **Pause this
   strategy…** (`outline`, consequential), or **Resume {name}…** when paused.
   Under the header, that strategy's daily-loss meter (*Today −0.4% of its 3%
   limit*). Body: positions table — Symbol,
   Shares, Avg cost, Close (or Last), Value, Weight with limit bar, Unrealised
   (signed). Footer *Showing {n} of {m} positions*.
4. **Orders card.** Time, Side, Symbol, Shares, Outcome (§8 of the blueprint).
   Header note states the next scheduled orders, or that trading is stopped.

When trading is stopped, the shell banner (blueprint §3.3) sits above this
screen, and the Orders note reads *Stopped: the next rebalance will not send
orders until you resume.*

## 4. Component mapping

| Element | Component | Variant |
|---------|-----------|---------|
| Environment switch | `toggle-group` | `environment` |
| Summary tiles | `card` | `metric` |
| Limit gauges | `progress` | `meter` |
| Strategy section | `card` | `default` |
| Positions | `data-table` | `holdings` |
| Weight vs limit | `progress` | `meter`, inline 80 px |
| Orders | `data-table` | `history` |
| Order outcome | `badge` | `status-*` per blueprint §8 |
| Pause, resume | `button` + `dialog` | `outline` + `confirm`; resuming a live strategy is `real-money` |

## 5. View model

| Field | Type | Source |
|-------|------|--------|
| `environment` | `live` / `paper` | route |
| `account` | `{value, cash, todayChange, todayChangePct, pricesAsOf, checkedAt}` | broker port |
| `limits` | `{perStockPct, dailyLossPct, largest: {symbol, weightPct}, closestToDailyLoss: {strategyId, name, todayLossPct}}` — `dailyLossPct` applies to each strategy separately | settings + risk service |
| `tradingState` | `{allowed: bool, stoppedAt?}` — only the owner stops all trading (D-11) | kill-switch store (read, never cached optimistically) |
| `strategies[]` | `{id, name, stage, since, sinceStartPct, nextRebalance, paused, stoppedByLimitAt?, todayLossPct, positions: [{symbol, shares, avgCost, price, value, weightPct, unrealised}], positionCount}` | broker + strategy service |
| `orders[]` | `{time, side, symbol, shares, outcome, fillPrice?, filled?, requested?, reason?}` | broker port |

## 6. Interactions

- The environment switch changes the route (`/portfolio/live` ↔
  `/portfolio/paper`), so the browser's back button and links preserve it.
- Summary, positions and orders poll every 30 s while the market is open and
  every 5 minutes when closed; *checked {time}* updates (STD-UI-25).
- **Pause this strategy…** opens `dialog` `confirm`. Resuming a paused paper
  strategy opens `dialog` `confirm` (M2, blueprint §9); resuming a paused
  **live** strategy opens `dialog` `real-money` (M6).
- A strategy that reaches its daily-loss limit stops itself and no other
  (D-11). Its card shows `badge` `status-serious` *Stopped: daily-loss limit
  reached at {time}*, its unsent orders read *Not sent: strategy stopped*, and
  S01 gets a *Needs you* item. Other strategies and the trading-wide state are
  unchanged.
- Limit meters change tier only by words and shape: below 80% of the limit no
  badge; 80–99% `status-warning` *Near limit*; at the limit `status-serious`
  *At limit*.

## 7. States

| State | Rendering |
|-------|-----------|
| Loading | Tile skeletons; positions skeleton at 10 rows |
| Empty, never populated | No strategy in this environment: *Nothing trades on paper yet.* with a link to Strategies; live: *No strategy is live. A strategy goes live after your review.* |
| Empty, nothing found | Orders with none in range: *No orders since the last rebalance on {date}.* |
| Partial | Positions whose price is missing show the last known price with its date and `badge` `status-warning` *Price from {date}* |
| Stale | *checked {time}*; when the broker read is older than 2 polls, `status-warning` *Not current* on the as-of line |
| Unavailable | Broker unreachable: tiles show `coverage-unknown` *Can't read account*, never $0.00; the kill switch still works (blueprint §3.3) |
| Error | Per card: operation, resource, reason, **Try again** |
| Unreachable | Shell state |

## 8. Copy

| Key | Text |
|-----|------|
| Daily limit helper | *At {n}% a strategy stops itself; the others keep trading.* |
| Pause confirmation | *Pause {name}? It sends no orders until you resume it. What it holds stays held.* |
| Order partially filled | *Filled 42 of 46 at $39.10 · rest cancelled at close* |
| Order not sent | *Not sent: trading stopped* |

## 9. Accessibility

- The environment switch is a `toggle-group` with roving focus; each item's
  accessible name includes *real money* or *practice*.
- Meters use `role="meter"` with `aria-valuetext` such as *6.80% of an 8% limit*.
- Money and returns carry signs in text; tables follow `data-table` holdings
  semantics with a totals row.

## 10. Acceptance checks

1. **S08-1** Live and paper are never shown in one table or total.
2. **S08-2** The trading state shown is the stored state; after *Stop all
   trading*, the screen changes only when the store does.
3. **S08-3** An unreadable broker account never renders as zero.
4. **S08-4** Resuming a live strategy, or resuming trading when a live
   strategy would resume, requires `dialog` `real-money`; resuming paper only
   uses `dialog` `confirm` and is never styled as real money.
5. **S08-5** Pause is not adjacent to a routine action without separation.
6. **S08-6** A strategy at its daily-loss limit stops alone; other strategies
   keep trading and the stopped banner does not appear.

## 11. Differences from the canvas

- The canvas draws the owner-engaged stopped state in critical red; blueprint
  §3.3 tiers it neutral.
- The canvas's *Resume trading…* resumes directly; blueprint §9 routes it
  through `dialog` `confirm` (paper only) or `real-money` (when a live strategy
  would resume).
- The canvas's summary tile *Today's loss vs daily limit* is account-level; the
  daily-loss limit is per strategy (D-11), so the tile names the strategy
  closest to its limit.
