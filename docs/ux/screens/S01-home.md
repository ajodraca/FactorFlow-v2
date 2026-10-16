---
artifact_schema_version: 1
artifact_id: PRODUCT-UX-S01
artifact_type: ux-screen-spec
artifact_version: 4
parent: PRODUCT-UX
title: "S01 Home — what needs you today"
route: /home
design_source: docs/ux/design-source/P01-Home.dc.html
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
  timestamp: 2026-10-16T18:00:01Z
  source_artifacts:
    - id: PRODUCT-UX
      version: "6"
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
---

# S01 Home — what needs you today

## 1. Purpose

The first screen after setup. It answers *what needs me today?* in under five
seconds: whether real money is fine, whether the data can be trusted, and the
short list of things only the owner can do. It is a starting point, not a
dashboard to stare at; every element links somewhere the owner acts.

## 2. Delivered by

| Region | Milestone |
|--------|-----------|
| Page title, as-of line, data card, data-related *Needs you* items | M1 (App shell & data health, D-8) |
| Paper card, strategy-related items, *Your strategies* list, *+ New strategy* | M2 |
| Live card | M6 |
| *Ready* (review) items | M5 |

Regions not yet delivered are absent, not disabled. In M1 the summary row holds
the data card alone, at one third width, with the *Needs you* list beside it.

## 3. Layout

Main region capped at 1180 px, `--space-5` padding, regions stacked with
`--space-5` gaps.

1. **Header row.** `h1` *{Weekday}, {day} {Month}* (`--text-xl`). Under it the
   as-of line: market state, price as-of, next scheduled rebalance. Right:
   **+ New strategy** (`button` `outline`).
2. **Summary row.** Three `card` `metric` tiles in a three-column grid:
   - **Live** — `badge` `real-money` *LIVE · real money*; account value
     (`--text-2xl`, `--font-numeric`); today's change with sign and colour;
     one line: strategies, positions, and the highest daily-loss limit use
     among its strategies (each strategy has its own limit, D-11). Whole tile links to
     `/portfolio/live`.
   - **Paper** — same shape, `badge` `paper`. Links to `/portfolio/paper`.
   - **Data** — `badge` with the worst current data tier and a short label;
     *{n} of {m} stocks current*; score as-of and price as-of; the sentence
     *Every other number on this page is as of those times.* Links to `/data`.
   Live and paper are never summed.
3. **Needs you.** `card` with header *Needs you · {n}* and the sub-line
   *Most important first. Nothing here is urgent unless marked.*, then the
   blueprint §4.1 items.
4. **Your strategies.** `card` with header and *Open the board* link, then a
   five-column list: Strategy (name link + one-line rule) · Stage (§4.3 badge)
   · Since start (signed %) · Last 30 days (sparkline) · Next step (link).

## 4. Component mapping

| Element | Component | Variant |
|---------|-----------|---------|
| Live / paper / data tiles | `card` | `metric` |
| Environment label in tiles | `badge` | `real-money` / `paper` |
| Data tier label | `badge` | `status-<tier>` |
| Needs-you list | composition, blueprint §4.1 | — |
| Item tag | `badge` | `status-<tier>` |
| Item action | `button` | `default` for *Ready*, else `outline` |
| Strategy list | `data-table` | `compact` |
| Stage | `badge` | blueprint §4.3 |
| Sparkline | `chart` | `sparkline` |
| New strategy | `button` | `outline` |

## 5. View model

| Field | Type | Source | Notes |
|-------|------|--------|-------|
| `today` | session date + market state (`open`, `closed`, `holiday`) | trading calendar | Header and as-of line |
| `pricesAsOf` | timestamp | market data | |
| `nextRebalance` | timestamp or null | strategy schedules | Earliest across paper and live |
| `live` | `{value, todayChange, todayChangePct, strategies, positions, maxStrategyDailyLossUsedPct}` or null | broker live account | Null hides the tile |
| `paper` | same shape or null | broker paper account | Null hides the tile |
| `data` | `{worstTier, label, currentCount, followedCount, scoresAsOf, pricesAsOf}` | coverage, classification run | |
| `attention[]` | `{id, tier, tag, title, body, action: {label, href}}` | attention service (aggregates gate, limits, data, drafts, orders) | Server-sorted (blueprint §4.1) |
| `strategies[]` | `{id, name, ruleSummary, stage, sinceStartPct or null, last30[], nextStep: {label, href}}` | strategy service | `last30` is daily values; null when there is no history |

## 6. Interactions

- Every tile, item action, strategy name and next-step link navigates. Nothing
  on this screen mutates state.
- The *Needs you* list polls every 60 s while the page is visible and announces
  a changed count politely. Polled freshness appears as *checked {time}* in the
  card header (STD-UI-25).
- An item leaves the list only when its cause is resolved (for example a
  successful download), never because it was viewed.

## 7. States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton tiles and three skeleton item rows |
| Empty, never populated | Setup incomplete routes to `/setup`. With setup complete but no strategies: the *Your strategies* card reads *No strategies yet. Start from a research screen or from scratch.* with **New strategy** |
| Empty, nothing found | *Needs you* with zero items: *Nothing needs you right now.* with the time last checked |
| Partial | Data tile shows its warning tier and counts; affected items appear in *Needs you* |
| Stale | Data tile badge *Not reflecting the latest download* when scores lag the last download |
| Unavailable | A broker account that cannot be read: its tile shows `coverage-unknown` *Can't read account* and the reason, never a zero value |
| Error | Per card: header kept, body replaced with operation, resource, reason and **Try again** |
| Unreachable | Shell state |

## 8. Copy

| Key | Text |
|-----|------|
| Header | *Thursday, 15 October* |
| As-of line | *Market closed at 15:00 CDT · prices current to today's close · next rebalance Mon 2026-11-02 14:45 CST* |
| Needs-you sub-line | *Most important first. Nothing here is urgent unless marked.* |
| Ready item | *Quality Value Monthly is ready for your review* / *63 paper trading days, tracking its backtest within 0.8 percentage points. Every gate criterion you set is met.* / **Review evidence** |
| Limit item | *Momentum Tilt hit its 8% per-stock limit on NVDA (paper)* / *Two buys today were trimmed to stay under the limit. Nothing failed; the strategy holds slightly less NVDA than its rules asked for.* / **See orders** |
| Data item | *KO, TSLA and FBXX are missing today's data* / *Their scores show as Incomplete until the data is complete. Strategies holding them won't trade them until then.* / **Fix data** |
| Draft item | *Growth Momentum Blend has never been backtested* / **Run backtest** |
| Daily-loss stop item | *Momentum Tilt stopped at its 3% daily-loss limit (paper)* / *It sends no orders until you resume it. Other strategies keep trading.* / **Review and resume** (→ S08). Clears when the strategy is resumed, paused or retired |

## 9. Accessibility

- Landmarks: `main` with `h1`; each card is a `section` labelled by its `h2`.
- Tiles are single links whose accessible name combines the environment and the
  value: *Live, real money: $25,846.12, today plus $118.40*.
- Severity tiles in items are `aria-hidden`; the tag badge carries the tier in
  words.
- Sparklines are `role="img"` with a name stating direction (*Rising over 30
  days*); the numbers live on the strategy page.
- Today's change: sign is in the text; colour is secondary.

## 10. Acceptance checks

1. **S01-1** Live and paper values are shown separately and never summed.
2. **S01-2** Each tile states its environment in words.
3. **S01-3** Every *Needs you* item has exactly one action, and items are
   ordered by tier then recency.
4. **S01-4** Viewing the page removes no item; resolving the cause does.
5. **S01-5** A broker account that cannot be read never renders as $0.00.
6. **S01-6** The data tile shows the as-of time of scores and of prices.
7. **S01-7** Before M2, no strategy, paper or live region renders, and no empty
   placeholder for them appears.

## 11. Differences from the canvas

- The canvas draws all three tiles; §2 removes tiles whose milestone has not
  shipped.
- The canvas's nav count chip on Home (4) equals the *Needs you* count; the spec
  makes that binding.
