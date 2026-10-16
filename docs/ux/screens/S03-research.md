---
artifact_schema_version: 1
artifact_id: PRODUCT-UX-S03
artifact_type: ux-screen-spec
artifact_version: 1
parent: PRODUCT-UX
title: "S03 Research — screener and inspector"
route: /research
design_source: docs/ux/design-source/P03-Research.dc.html
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
    - id: CAP-002
      version: "1, draft"
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
---

# S03 Research — screener and inspector

## 1. Purpose

Find stocks worth building a strategy around, and understand why each one
scores as it does, without leaving the list. It merges CAP-002's
Classifications, Compare entry and Evidence summary into one screen with three
panes: filters, results, inspector.

## 2. Delivered by

M1, CAP-002 (AC-1 to AC-3, AC-9, AC-12, AC-14, AC-16, AC-17, AC-21). *Use in a
strategy* arrives in M2; before M2 it is absent.

## 3. Layout

Three panes in a wrapping flex row, `--space-4` apart, each a `card`.

1. **Filters** (220–250 px): `h2` *Find stocks*, then sections separated by
   `--border`:
   - *Look in*: `select` (*All followed stocks · {n}* or a universe).
   - *Percentile at least*: one row per factor (swatch, name, `input`
     `numeric` 56 px, placeholder *any*), then the helper *70 means "scores
     better than 70% of followed stocks".*
   - `checkbox` *Hide stocks with an incomplete score* (default off) with the
     helper *They're shown by default so nothing disappears silently.*
   - *Saved screens*: links.
2. **Results** (fluid): header with `h1` *{n} stocks match* (`--text-lg`) and
   the as-of line *Scores from today 17:46 CDT · sorted by value*; right:
   **Save screen** (`outline`), **Use in a strategy** (`default`). Then the
   virtualised table: checkbox · Symbol · Name · Value · Growth · Momentum
   (blueprint §4.4 factor cells). Sorted column header shows the arrow and
   `aria-sort`. When one or more rows are checked, the selection tray
   (blueprint §4.6) pins to the bottom of the card.
3. **Inspector** (300–340 px): symbol (`--text-xl`, `--font-numeric`) and name;
   memberships and holdings line; one block per factor (swatch, name,
   percentile in weight 600, standardised score in `--muted-foreground`, one line naming the
   inputs and their as-of date); an *Incomplete* explanation box when any
   factor is incomplete; **See every input and its date** (`outline`, to
   `/research/stocks/:symbol`) and **Start a strategy from this screen**
   (`ghost`, M2); a footnote explaining percentile versus standardised score.

When classifications are not current (CAP-002 AC-20), a `status-warning` banner
sits above the results header: *Showing scores produced {time} from download
#{n}. A newer set is being produced and replaces this one when complete.*

## 4. Component mapping

| Element | Component | Variant |
|---------|-----------|---------|
| Scope | `select` | `inline` |
| Threshold inputs | `input` | `numeric` |
| Hide incomplete | `checkbox` | `default` |
| Results table | `data-table` | `virtualised` (new, §13 of the blueprint), with the base contract's row checkboxes |
| Factor cell | composition, blueprint §4.4 | — |
| Incomplete / not enough to rank | `badge` | `coverage-absent` / `coverage-unknown` |
| Row selection | `checkbox` | `default` |
| Selection tray | composition, blueprint §4.6 | — |
| Inspector | `card` | `summary` |
| Not-current banner | `badge` inside a `card` | `status-warning` |

## 5. View model

| Field | Type | Source |
|-------|------|--------|
| `scope` | `{kind: all/universe, id, label, count}` | universes |
| `thresholds` | `{value?, growth?, momentum?}` percentile floors | URL query (shareable, back-button safe) |
| `hideIncomplete` | boolean | URL query |
| `sort` | `{factor, direction}` | URL query |
| `classificationSet` | `{producedAt, fromDownload, current: bool, updating: bool, failedReason?}` | CAP-002 classification runs |
| `peerCounts` | per factor `{qualified, followed}` | CAP-002 AC-14 |
| `rows[]` | `{symbol, name, value, growth, momentum}` where each factor is `{state: classified/incomplete/notEnough/retired, percentile?, standardisedScore?, reason?, restated: bool}` | CAP-002 |
| `matchCount` | integer | server-side filter over the full set |
| `selected` | symbol | client |
| `checked` | symbol[] | client, kept across filter changes |
| `inspector` | the selected row plus `{memberships[], heldBy[], inputsAsOf per factor}` | CAP-002 AC-17 |

## 6. Interactions

- Filtering, sorting and counting run server-side over the full set, never the
  loaded page (`data-table` contract). Rows stay visible and dimmed while a
  new result loads.
- Click or `Enter` on a row selects it into the inspector; `Space` on its
  checkbox checks it. The two never interfere: checking does not select.
- **Use in a strategy** opens S05 with the current scope and thresholds as the
  rule's conditions.
- **Save screen** stores scope and thresholds under a name (routine).
- **Compare side by side** (tray) opens `/research/compare?symbols=…` with the
  checked rows (2–6). **Add to universe…** opens a `dialog` `standard` listing
  universes plus *New universe*.
- `↑`/`↓` move the selection; the inspector follows with a 150 ms debounce.

## 7. States

| State | Rendering |
|-------|-----------|
| Loading | Table skeleton at 12 rows; inspector skeleton |
| Empty, never populated | *No stocks have been scored yet.* plus the latest download state and a link to Data health (CAP-002 AC-22) |
| Empty, nothing found | *No stocks match these filters.* with **Clear filters** |
| Partial | Incomplete cells inline; header counts unchanged |
| Stale | Not-current banner (§3) |
| Unavailable | A factor below 30 qualifying stocks: every cell in that column is *Not enough to rank*, and the column header says *{n} qualified, 30 needed* |
| Error | Results body replaced with the operation and reason and **Try again**; filters kept |
| Unreachable | Shell state |

## 8. Copy

| Key | Text |
|-----|------|
| Results title | *{n} stocks match* |
| Incomplete reason, example | *Incomplete: revenue for the quarter ending 2025-06-27 is missing, so growth can't be compared fairly. It isn't guessed.* |
| Inspector footnote | *Percentile first: 88 means better than 88% of followed stocks. The small number is the standardised score.* |
| Results footnote (STD-UI-18) | *A score is shown only when every input is present and current. This checks presence and currency, not whether the provider's values are correct.* |

## 9. Accessibility

- The three panes are `section`s labelled *Filters*, *Results*, *Selected
  stock*.
- The table follows the `data-table` contract: row headers on Symbol,
  `aria-sort` on the sorted column, `aria-selected` on the selected row.
- Factor bars are `aria-hidden`; the percentile is the text.
- The tray appears as a polite announcement: *3 selected*.

## 10. Acceptance checks

1. **S03-1** A stock with any incomplete factor is listed unless *Hide stocks
   with an incomplete score* is on.
2. **S03-2** The match count reflects the full set, not the loaded page.
3. **S03-3** The inspector shows the as-of date for each factor's inputs.
4. **S03-4** A factor with fewer than 30 qualifying stocks shows no percentile
   for any stock.
5. **S03-5** Filters, sort and scope survive reload and back navigation (URL
   state).
6. **S03-6** A *Possibly restated* mark shows in the inspector wherever the
   classification carries it (CAP-002 AC-23).

## 11. Differences from the canvas

- The canvas omits the not-current banner and the *Possibly restated* mark;
  CAP-002 requires both (§3, S03-6).
- The canvas renders only three factor columns; the *Marks* column from the
  CAP-002 design is folded into the inspector to keep the table scannable.
