---
artifact_schema_version: 1
artifact_id: PRODUCT-UX-S05
artifact_type: ux-screen-spec
artifact_version: 4
parent: PRODUCT-UX
title: "S05 Strategy builder"
route: /strategies/new, /strategies/:id/rules
design_source: docs/ux/design-source/P05-Builder.dc.html
status: approved
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
approval:
  approval_policy: owner-allowed
  approved_by: "Alvaro de Jodra"
  approved_at: 2026-10-16T18:17:31Z
  reviewed_revision: sha256:9bc4c1c928c702e695237a0b1e4b234bab288fbc796219d572fdbc5fe0bc68b7
  review_artifact: "docs/ux/specifications-review-report-v4.md"
---

# S05 Strategy builder

## 1. Purpose

Write a strategy's rules as sentences the owner can read back, and see
immediately what it would hold today. The builder never trades; it saves drafts
and versions, and its primary action moves the strategy to the next stage.

## 2. Delivered by

M2 (Strategies & Paper Trading). The primary action is **Start paper trading**
in M2–M3 and **Run backtest** from M4.

## 3. Layout

1. **Header row.** `h1` strategy name (click to rename, routine) with a
   `status-neutral` badge *Draft · saved {time}*. Right: the lifecycle stepper
   (blueprint §4.2), max 720 px.
2. **Two columns**, `--space-5` apart.
   - **Rules card** (fluid): `h2` *Rules* and the sub-line *Each choice reads as
     a sentence. Every value can be changed after a backtest; each change makes a
     new version.* Four numbered sections separated by `--border`:
     1. *Which stocks* — *Start from [scope], keep stocks whose [factor]
        percentile is at least [n] and whose [factor] percentile is at least
        [n]. [+ condition]* then *Rank them by [factor] and hold the top
        [n].*
     2. *How much of each* — `toggle-group` *Equal weight* / *Tilt to standardised score*
        with the resulting per-stock weight; *Never more than [8] % in one
        stock, and keep [2] % in cash.*
     3. *When to trade* — *Rebalance [monthly] on the [first trading day] at
        [14:45 CT], and skip a trade when the weight would change by less than
        [1] %.*
     4. *When data is incomplete* — `radio-group`: **Skip the stock**
        (recommended) / **Sell it**, each with one explanatory line.
     Footer bar on `--muted`: *Saved automatically. Nothing trades from a
     draft.*; **Close** (`ghost`) and the primary action.
   - **Preview card** (360–420 px): *IN PLAIN WORDS* summary at `--text-lg`;
     then *If it ran today* with the as-of line, the funnel *1,236 followed →
     86 pass → 20 held*, a `coverage-absent` badge *{n} skipped: incomplete
     {factor} score*, and the first eight picks (#, symbol, name, ranking
     factor percentile with the blueprint §4.4 *Possibly restated* mark when it
     carries one, target weight) with *+ {n} more · open in Research*.

## 4. Component mapping

| Element | Component | Variant |
|---------|-----------|---------|
| Rule sentences | composition, blueprint §4.7 | — |
| Choice blanks | `select` | `inline` |
| Number blanks | `input` | `numeric` / `percentage` |
| Weighting | `toggle-group` | `single` |
| Incomplete-data rule | `radio-group` | `default` |
| Stepper | `stepper` | `horizontal` |
| Preview list | `data-table` | `compact` |
| Skipped count | `badge` | `coverage-absent` |

## 5. View model

| Field | Type | Source |
|-------|------|--------|
| `strategy` | `{id, name, version, savedAt, stage}` | strategy service |
| `rules` | `{scope, conditions: [{factor, minPercentile}], rankBy, topN, weighting, maxPerStockPct, cashPct, rebalance: {cadence, day, time}, minTradePct, onIncomplete: skip/sell}` | strategy service (versioned) |
| `rulesComplete` | boolean + `missing[]` | server validation |
| `summary` | string | server-rendered from `rules`, so the sentence and the engine never disagree |
| `preview` | `{scoresAsOf, followed, passing, held, skipped: {count, factor}, picks: [{symbol, name, rankPercentile, restated, weight}]}` | strategy engine dry run on today's classifications |

## 6. Interactions

- Every change autosaves after 800 ms of inactivity and updates *saved {time}*.
  Saving a Backtested strategy creates a new version; the stepper falls back
  to Draft for that version and the previous version keeps its evidence.
- A strategy that is paper or live trading opens read-only (blueprint D-10):
  the blanks render as text, the footer bar reads *{name} is paper trading
  (or: trading live). Its rules can't change while it trades.*, and the
  primary action is **Edit as a new strategy** (`default`). That creates a new
  Draft strategy *{name} (copy)* with the same rules and opens it here; nothing
  about the original changes.
- The preview recomputes after each save; while recomputing, the list dims and
  keeps its rows.
- **+ condition** appends a sentence clause with a factor `select` focused.
  Each added clause has a remove button named *Remove condition {n}*.
- The primary action is `button` `blocked` until `rulesComplete`, with the
  missing pieces as its reason (*Choose a rebalance schedule*).
- **Start paper trading** (M2–M3) opens the blueprint §9 confirmation.
  **Run backtest** (M4+) starts the backtest and routes to S06, which shows
  progress.

## 7. States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton sentences; preview skeleton |
| Empty, never populated | New strategy: name *Untitled strategy*, scope *All followed stocks*, no conditions, *Rank by* unset; preview reads *Add a ranking to see what it would hold.* |
| Empty, nothing found | No stock passes the conditions: preview reads *No followed stock passes these conditions today.* and names the strictest condition |
| Partial | Preview shows the skipped-for-incomplete count |
| Stale | Preview as-of line shows *Not reflecting the latest download* when scores are not current |
| Unavailable | No scores exist yet: preview reads *Scores aren't available yet* with a link to Data health |
| Error | Save failure: *Couldn't save {name}: {reason}*, retry; local edits kept |
| Unreachable | Shell state; local edits kept in memory |

## 8. Copy

| Key | Text |
|-----|------|
| Summary example | *On the first trading day of each month, buy the 20 cheapest followed stocks whose momentum is at least average, in equal amounts, never more than 8% in one, keeping 2% cash.* |
| Skip option | **Skip the stock** (recommended) — *It can't enter or be ranked. If already held, it's kept until its score is complete again.* |
| Sell option | **Sell it** — *Treat an incomplete score as a reason to exit.* |

## 9. Accessibility

- Each rule section is a `fieldset` with its heading as `legend`.
- Sentence blanks have names that read as the blank (blueprint §4.7). The
  sentence text around them is plain text in the `<p>`, so a screen reader reads
  the sentence in order.
- The plain-words summary is a polite live region.

## 10. Acceptance checks

1. **S05-1** The plain-words summary is produced by the server from the saved
   rules.
2. **S05-2** Editing a backtested strategy creates a new version and leaves
   the previous version's evidence intact. A paper or live strategy's rules
   can't be edited; **Edit as a new strategy** creates a separate Draft
   strategy and leaves the original trading unchanged.
6. **S05-6** A preview pick whose ranking percentile carries the restatement
   mark shows it (STD-UI-17).
3. **S05-3** The preview names how many stocks were skipped for incomplete
   scores, and never ranks them.
4. **S05-4** The primary action states what is missing while rules are
   incomplete.
5. **S05-5** Nothing on this screen places an order.

## 11. Differences from the canvas

- The canvas shows *Run backtest* as the only primary action; §2 makes it
  milestone-dependent.
- The canvas has no remove control on conditions; §6 adds one.
