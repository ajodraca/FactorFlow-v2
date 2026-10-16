---
artifact_schema_version: 1
artifact_id: PRODUCT-UX-S04
artifact_type: ux-screen-spec
artifact_version: 1
parent: PRODUCT-UX
title: "S04 Strategies — lifecycle board"
route: /strategies
design_source: docs/ux/design-source/P04-Strategies.dc.html
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
      version: "3"
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
---

# S04 Strategies — lifecycle board

## 1. Purpose

Show every strategy at its stage, with the one thing to do next on each. The
board's left-to-right order is the product's safety story: nothing reaches real
money without passing paper trading and the owner's review.

## 2. Delivered by

| Column | Milestone |
|--------|-----------|
| Draft, Paper trading, Live | M2 (Live column empty until M6) |
| Backtested | M4 |
| Ready for review | M5 |

Columns not yet delivered are absent (blueprint D-6). In M2 the board has three
columns, and *Start paper trading* sits on Draft cards.

## 3. Layout

1. **Header row.** `h1` *Strategies* and the sub-line *Every strategy moves left
   to right. Nothing reaches real money without passing through paper trading and
   your review.* Right: **Stopped ({n})** (`outline`, opens the stopped and
   retired list) and **+ New strategy** (`default`).
2. **Board.** Columns in a grid of `minmax(220px, 1fr)`, `--space-4` gap,
   horizontally scrollable below 1140 px. Each column: numbered heading (*1 ·
   Draft*), count, one-line meaning; the Paper and Live headings use
   `--risk-paper` and `--risk-real-money` text plus their words.
3. **Strategy card** (`card`, `--space-3` padding, `--space-3` gap): name (`h3`);
   optional status badge at top right (*Limit hit*, *Gate met*, *LIVE*); the
   rule summary sentence (Draft, Backtested, Review); stage facts as a two-column
   key/value list; a `progress` toward the gate on Paper cards (*41 of 60 days
   toward review*); then one primary or outline action and at most one link.
   The Ready-for-review card is emphasised with a 1 px `--foreground` ring.
4. **Footer line.** The owner's gate in words, with a link to Settings →
   Promotion gate.

### Card facts per column

| Column | Facts | Action |
|--------|-------|--------|
| Draft | Last edited; a `status-warning` badge if the rules are incomplete | **Run backtest** (M4+) or **Start paper trading** (M2–M3); **Finish rules** when incomplete |
| Backtested | Growth per year, worst drop, versus benchmark | **Start paper trading**; link *See backtest* |
| Paper trading | Days toward review (`progress`), since start, tracking distance from the backtest | **Open** (→ `/portfolio/paper?strategy=`) |
| Ready for review | Paper days, since start, tracking distance | **Review evidence** (`default`) |
| Live | Value, since go-live date, daily-loss limit use | **Monitor** (→ `/portfolio/live?strategy=`) |

## 4. Component mapping

| Element | Component | Variant |
|---------|-----------|---------|
| Column | composition | — |
| Strategy card | `card` | `default` |
| Stage and status badges | `badge` | blueprint §4.3 |
| Gate progress | `progress` | `determinate` |
| Actions | `button` | `default` / `outline` |

## 5. View model

| Field | Type | Source |
|-------|------|--------|
| `columns[]` | `{stage, count}` limited to delivered stages | strategy service |
| `strategies[]` | `{id, name, stage, ruleSummary, rulesComplete, editedAt, backtest?: {cagr, worstDrop, vsBenchmarkPpPerYear}, paper?: {days, gateDays, sinceStartPct, trackingPp, limitHit}, review?: {gateMet}, live?: {value, sinceDate, sinceStartPct, dailyLossUsedPct}}` | strategy, backtest, broker services |
| `gate` | `{paperDays, trackingPp}` | owner settings; defaults 60 and 2 (D-3) |
| `stoppedCount` | integer | strategy service |

## 6. Interactions

- Cards do not drag. A stage changes only through the action that earns it
  (backtest, start paper trading, go live), never by moving a card.
- **Start paper trading** opens `dialog` `confirm` (blueprint §9) and, on
  confirm, moves the card to Paper trading.
- The board refreshes every 60 s while visible (*checked {time}* under the
  header).

## 7. States

| State | Rendering |
|-------|-----------|
| Loading | Column headings with two skeleton cards each |
| Empty, never populated | One centred card: *No strategies yet.* and **New strategy** plus *or start from a Research screen* |
| Empty, nothing found | A column with no cards shows its meaning line only, no placeholder card |
| Partial | Not applicable: a strategy is in exactly one stage |
| Stale | *checked {time}* |
| Unavailable | A card whose facts can't be read shows `coverage-unknown` for that fact, never zero |
| Error | Board replaced by the error and **Try again**; header kept |
| Unreachable | Shell state |

## 8. Copy

| Key | Text |
|-----|------|
| Column meanings | Draft *Rules written, not yet tested* · Backtested *How it would have done, {years}* · Paper trading *Practice money, real broker, real fills* · Ready for review *Met your gate; waiting for your decision* · Live *Real money, inside your limits* |
| Footer | *Your gate: a strategy is ready for review after 60 paper trading days while staying within 2 percentage points of its backtest. Change it in Settings → Promotion gate.* |

## 9. Accessibility

- Each column is a `section` labelled by its heading; cards are `article`s
  labelled by their `h3`.
- Reading order is column by column, top to bottom.
- Gate progress is `progressbar` with `aria-valuetext` *41 of 60 paper trading
  days*.

## 10. Acceptance checks

1. **S04-1** No interaction other than the stage's own action changes a
   strategy's stage.
2. **S04-2** Paper and Live headings state their environment in words.
3. **S04-3** Each card has exactly one primary or outline action.
4. **S04-4** Columns for undelivered milestones are absent.

## 11. Differences from the canvas

- None beyond §2. Environment-coloured column headings are permitted by STD-UI-11 (v5), with the environment in words.
