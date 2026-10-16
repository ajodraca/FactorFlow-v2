---
artifact_schema_version: 1
artifact_id: PRODUCT-UX-S09
artifact_type: ux-screen-spec
artifact_version: 4
parent: PRODUCT-UX
title: "S09 Data health"
route: /data
design_source: docs/ux/design-source/P09-Data.dc.html
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
    - id: CAP-001
      version: "8"
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
approval:
  approval_policy: owner-allowed
  approved_by: "Alvaro de Jodra"
  approved_at: 2026-10-16T18:17:32Z
  reviewed_revision: sha256:80cd17bf543472046573c09465bd593d25b305cd64e4e2159fa4b2bf481b32c0
  review_artifact: "docs/ux/specifications-review-report-v4.md"
---

# S09 Data health

## 1. Purpose

Answer *Is the data good enough to trust?* in one look, and list only what
needs fixing, each with its fix. It is the front door to CAP-001's surfaces
(coverage, followed stocks, downloads), which move one level down.

## 2. Delivered by

| Region | Milestone |
|--------|-----------|
| Title verdict, Daily prices, Company financials, Factor scores cards, Needs fixing, Recent downloads, What you follow | M1, App shell & data health (D-8), on CAP-001's API and CAP-002's classification state as they are |
| Live prices card | M3 |
| Broker row in *What you follow* | M2 |
| Scheduled downloads and the schedule line in *Recent downloads* | M2 (D-2) |

## 3. Layout

Reading width (1180 px cap).

1. **Header row.** `h1` *Is the data good enough to trust?*; a one-sentence
   verdict under it (*Mostly yes. 3 of 1,236 followed stocks need attention;
   strategies skip them until they're fixed.*). Right: **Full coverage table**
   (`outline`, → `/data/coverage`) and **Download now** (`default`).
2. **Check cards.** Up to four `card`s in a four-column grid: *Live prices*
   (M3), *Daily prices*, *Company financials*, *Factor scores*. Each: tier badge
   with the check's name, a bold one-line result, one `--text-xs` line with
   as-of and the named exceptions.
3. **Needs fixing · {n}** (`card`). Header with the download it came from and
   **Download now** (`default`, only when any failure is retryable), which
   downloads the whole followed list again (D-9). One row per problem: symbol ·
   outcome badge + what failed in words · a second line with consequence and
   holding strategies · for *Not found*, the row's own actions **Stop
   following** and **Follow a different symbol**.
4. **Two columns.**
   - **Recent downloads** (`card`): five most recent: number, outcome badge,
     start → end, one-line result. Header sub-line names the schedule (D-2).
     Each row links to `/data/downloads/:id`.
   - **What you follow** (`card`): followed count, stopped-following count
     (*history kept*), history depth, market data key presence, broker presence;
     **Manage followed stocks** (→ `/data/followed`).

## 4. Component mapping

| Element | Component | Variant |
|---------|-----------|---------|
| Check cards | `card` | `metric` |
| Check tier | `badge` | `status-*` |
| Problem rows | composition: `badge` + text + `button` | — |
| Row actions | `button` | `outline`; *Stop following* `ghost` |
| Downloads list | `data-table` | `compact`, `history` semantics |
| Download outcome | `badge` | `status-*` per blueprint §8 |
| Download progress (while running) | `progress` | `determinate` |
| Follow summary | `card` | `summary` |

## 5. View model

| Field | Type | Source |
|-------|------|--------|
| `verdict` | `{tier, sentence, affectedCount, followedCount}` | coverage service (server-written sentence) |
| `checks[]` | `{id: livePrices/dailyPrices/financials/scores, tier, label, result, asOf, exceptions: string[]}` | coverage, live feed (M3), classification runs |
| `problems[]` | `{symbol, kind: failed/notFound, dataType, operation, reason, consequence, heldBy[], retryable}` (`retryable` decides whether the header shows **Download now**) | latest download's failures (CAP-001 AC-10, AC-11) |
| `downloads[]` | `{id, outcome, start, end, result}` latest five | run journal |
| `activeDownload` | `{id, done, total}` or null | run journal |
| `following` | `{followed, stopped, historyYears, providerKey, broker}` | settings, followed list, runtime config |

## 6. Interactions

- **Download now** starts a download (routine). If one is running, it queues and
  the button's helper reads *A download is running. This starts when it
  finishes.* (CAP-001 AC-23).
- **Download now** in the *Needs fixing* header is the same action as the
  header's: a download over every followed stock (routine). CAP-001 AC-6 makes
  re-running safe: data already stored is never duplicated, overwritten or
  removed. There is no per-stock retry (D-9).
- **Stop following** is consequential (blueprint §9).
- **Follow a different symbol** opens `/data/followed` with the add field
  focused. Fixing a typo is two actions, stop following and follow, each
  confirmed on its own (D-9).
- While a download runs, its row heads *Recent downloads* with `progress` and
  polls every 10 s; check cards refresh when it ends.

## 7. States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton cards and rows |
| Empty, never populated | *No data has been downloaded yet.* with **Start the first download**, or a link to setup when no stocks are followed (CAP-001 AC-17, AC-24) |
| Empty, nothing found | *Needs fixing* with no problems: *Nothing needs fixing.* and the time of the last complete download |
| Partial | The normal partial rendering above |
| Stale | A check whose as-of predates the latest trading day: `status-warning` *Not current* |
| Unavailable | Gap detection unavailable (CAP-001): *Daily prices* card shows `coverage-unknown` for gaps with the reason |
| Error | Per card: operation, reason, **Try again** |
| Unreachable | Shell state |

## 8. Copy

| Key | Text |
|-----|------|
| Failed row | *Downloading company financials: the provider timed out 3 times.* / *Download again to retry; data already stored is never duplicated or overwritten. Held by Deep Value Quarterly (live) — it keeps holding KO and won't trade it until fixed.* |
| Not-found row | *The provider doesn't recognise this symbol.* / *Probably a typo or a delisted ticker. Downloading again won't help.* |
| Interrupted download | *The app restarted mid-download; 611 kept, the rest picked up next time* |
| Check scope (STD-UI-18) | Under *Daily prices*: *Gaps are judged against the days other followed stocks hold. A market-wide outage leaves no gap to detect.* (shown on `/data/coverage`, linked from the card) |

## 9. Accessibility

- Each card is a `section` labelled by its heading.
- Problem rows are list items; each action's accessible name includes the
  symbol (*Stop following FBXX*, *Follow a different symbol than FBXX*).
- Polling updates announce politely and never move focus.

## 10. Acceptance checks

1. **S09-1** A partial download is never shown as complete.
2. **S09-2** Each problem names the operation, the stock and the reason, and
   offers its recovery action.
3. **S09-3** A not-found symbol offers stop following and follow a different
   symbol, never a download as its fix.
4. **S09-4** The provider key's value never appears.
5. **S09-5** Before any download, the screen states that no data exists.

## 11. Differences from the canvas

- The canvas's per-stock **Retry {SYMBOL}**, **Retry the {n} that failed** and
  one-step **Correct symbol** are replaced by **Download now** and two separate
  actions, because CAP-001 offers no scoped download or combined swap (D-9).
- The canvas's *Factor scores* card says affected stocks are "held at
  yesterday's, marked as such". CAP-002 AC-12 and AC-13 show them as
  *Incomplete* instead; the card says *{n} stocks show as Incomplete until
  their data is complete*.
- Before M2, when no schedule exists yet, the *Recent
  downloads* sub-line reads *Starts when you press Download now*; from M2 it
  names the schedule as the canvas does (D-2).
