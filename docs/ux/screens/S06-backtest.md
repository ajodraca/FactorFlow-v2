---
artifact_schema_version: 1
artifact_id: PRODUCT-UX-S06
artifact_type: ux-screen-spec
artifact_version: 1
parent: PRODUCT-UX
title: "S06 Backtest result"
route: /strategies/:id/backtests/:backtestId
design_source: docs/ux/design-source/P06-Backtest.dc.html
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
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
---

# S06 Backtest result

## 1. Purpose

Say in one sentence how the strategy would have done, then show the evidence
across market periods and state plainly what the backtest cannot know. It is
the first half of the promotion evidence (charter M4, "promotion-grade evidence
across market regimes").

## 2. Delivered by

M4 (Backtesting).

## 3. Layout

1. **Header row.** `h1` strategy name; `badge` `status-good` *Backtest complete
   · v{n}*; the lifecycle stepper with Backtest current.
2. **Verdict card.** One paragraph at `--text-lg`: *Over {years} years, $10,000
   would have grown to {end}, against {benchmarkEnd} for the benchmark. Its worst
   drop was {dd}, versus {benchmarkDd}.* Right: **Edit rules** (`outline`) and
   **Start paper trading** (`default`).
3. **Metric row.** Four `card` `metric` tiles: *Growth per year*, *Worst drop,
   peak to low*, *Ups and downs (yearly volatility)*, *Market periods it beat the
   benchmark* (*{k} of {n}*). Each tile's sub-line gives the benchmark's value.
4. **Chart card.** `h2` *Growth of $10,000*; provenance line (measure, units,
   date range, n, cost assumption); legend with both series; *View as table*.
   The chart is `chart` `line` with period bands (§13 of the blueprint): one
   y-scale in USD, strategy in `--chart-1`, benchmark in `--chart-6`, both 2 px,
   end-point markers and direct end labels in full figures, year ticks on the
   x-axis, shaded named stress periods.
5. **Two columns.**
   - **By market period** (`data-table` `compact`): Period, Dates, Strategy, Benchmark, Difference (pp, signed).
     This is also the chart's table equivalent target for *View as table*.
   - **What this can't tell you** (`card`): four bullets — point-in-time use,
     the *Possibly restated* share with the badge, the followed-from limitation,
     and the cost assumption.

## 4. Component mapping

| Element | Component | Variant |
|---------|-----------|---------|
| Metric tiles | `card` | `metric` |
| Growth chart | `chart` | `line` with period bands |
| Chart container | `card` | `chart` |
| Periods table | `data-table` | `compact` |
| Restated mark | `badge` | `status-neutral` with diamond |
| Stepper | `stepper` | `horizontal` |

## 5. View model

| Field | Type | Source |
|-------|------|--------|
| `backtest` | `{id, strategyVersion, start, end, monthEnds: n, costAssumptionPct, benchmark: {id, label}}` | backtest service |
| `series` | `{date, strategy, benchmark}[]` month-end values in USD from 10,000 | backtest service |
| `metrics` | `{cagr, worstDrop, volatility, periodsBeaten, periodsTotal}` for strategy and benchmark | backtest service; the UI never computes them |
| `periods[]` | `{name, start, end, strategyReturn, benchmarkReturn, differencePp}` | market-period catalogue + backtest |
| `limitations` | `{restatedShare, restatedBefore, followedFromNote}` | backtest service (STD-UI-17) |

Market periods are a named, versioned catalogue owned by the backtesting
capability; the UI renders them and does not define them.

## 6. Interactions

- Hover or focus on the chart shows a crosshair and a tooltip with the date,
  both values and the difference (dataviz hover layer). Keyboard: the chart is
  focusable; `←`/`→` move between month-ends.
- *View as table* scrolls to and focuses the periods table; a second link in it
  offers the full month-end table in a `dialog` `standard`.
- **Start paper trading** opens the blueprint §9 confirmation.
- A backtest still running shows `progress` `indeterminate` *Backtesting {name}
  over {years} years…* in place of sections 2–5, polling every 5 s.

## 7. States

| State | Rendering |
|-------|-----------|
| Loading | Skeletons for verdict, tiles and chart |
| Empty, never populated | Not reachable: a route needs a backtest id. The strategy page without a backtest offers **Run backtest** |
| Empty, nothing found | Not applicable |
| Partial | A backtest whose early years held fewer than 30 rankable stocks marks those months on the chart as a hatched band (`--pattern-indeterminate`) labelled *Too few stocks to rank* and excludes them from metrics |
| Stale | A backtest of an older rules version: `status-warning` banner *This backtest is of version {n}. The rules have changed since.* with **Run backtest** |
| Unavailable | Not applicable |
| Error | Failed backtest: operation, strategy, reason, **Try again** |
| Unreachable | Shell state |

## 8. Copy

| Key | Text |
|-----|------|
| Provenance | *Month-end value in USD · {start} to {end} · n = {n} month-ends · after an assumed {cost}% cost per trade* |
| Limitations | *Every decision used only data as it was known on that date. Nothing from later leaks in.* · *{share}% of value scores before {year} came from fundamentals downloaded later, which may include corrections the market didn't have then.* · *Stocks only count from the date you started following them, so the early years see a smaller list.* · *Costs are an assumption ({cost}% per trade). Paper trading measures the real ones.* |

## 9. Accessibility

- The chart is `role="img"` with a name stating both end values and the shaded
  periods; the periods table and month-end table are its text equivalents
  (STD-UI-28).
- Signed returns carry the sign in text; colour is secondary.
- Legend entries are text with a line sample; series are also direct-labelled.

## 10. Acceptance checks

1. **S06-1** The chart has exactly one y-scale and a legend for two series
   (STD-UI-27).
2. **S06-2** The chart states measure, units, date range, n and cost
   assumption, and a table equivalent is reachable from it (STD-UI-28).
3. **S06-3** All metrics come from the backtest service; the UI computes none.
4. **S06-4** The restated share appears whenever any backtested score carried
   the mark.
5. **S06-5** A backtest of a superseded rules version says so.

## 11. Differences from the canvas

- The canvas computes its sample series and metrics in the page; production
  takes them from the service (S06-3).
- The canvas lacks the hover layer; §6 adds it.
