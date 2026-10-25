---
artifact_schema_version: 1
artifact_id: CAP-003-component-design-data-health-ui
artifact_type: component-design
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-25
updated: 2026-10-25
ai_provenance:
  agent_id: design-decomposition-agent
  agent_version: "1.1"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-25T19:44:57Z
  source_artifacts:
    - id: CAP-003
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-brief
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: PRODUCT-UX-S09
      version: "4"
    - id: STD-UI
      version: "6"
    - id: tech-stack
      version: "6"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Component: Data Health UI

**Status:** draft
**Capability:** CAP-003
**Owner:** Alvaro de Jodra
**Last Updated:** 2026-10-25

This design was produced in an unattended `$design-run`. It applies DEC-0200,
DEC-0201, DEC-0210, DEC-0213, DEC-0217 and DEC-0220 without re-deciding them,
DEC-0210 and DEC-0217 as the owner amended them on 2026-10-25;
decisions live under `projects/factorflow-v2/decisions/` in the harness
repository. Positions resting on a decision are marked **PROVISIONAL**. It
records no decision of its own.

## 1. Overview

`data-health-ui` is the Data health screen at `/data`: S09's M1 regions,
which are the verdict, three check cards (Daily prices, Company financials,
Factor scores; Live prices is M3), *Needs fixing* with its recoveries, Recent
downloads without the schedule line (M2) and What you follow without the
broker row (M2) (system design §3.4; UX design 1.4). It answers "is the data
good enough to trust?" in one sentence and names, for each followed stock
with a problem, what failed, why, what it means and the fix (capability flow
2).

It offers two recoveries, both through the delivered API: **Download now**, a
full download over the followed list that CAP-001 makes safe to repeat (AC-15;
D-9), and, for a symbol the provider does not recognise, **Stop following**
(confirmed, history kept) and **Follow a different symbol** (a link to
Followed stocks), never a download (AC-14).

Use cases addressed: AC-11, AC-12, AC-13, AC-14, AC-15, AC-21, AC-24, AC-25,
and the Data health half of AC-16 (the chip is the shell's, from the same
set).

Support matrix: as the shell. Dependencies: `owner-shell` (`useShell`,
`useDataHealth`, `fetchProblems`, `refresh`); the delivered client functions
`startAcquisitionRun`, `retireInstrument`, `listAcquisitionRuns`,
`listInstruments`, `getHistoryDepth`; `ui-components`.

## 2. Design Details

### 2.1 Placement

```
web/src/screens/data-health/index.tsx              DataHealthScreen: header, cards, Needs fixing, lower columns
web/src/screens/data-health/verdict.tsx            badge + one sentence (DEC-0210)
web/src/screens/data-health/check-card.tsx         the check card composition (UX design §3)
web/src/screens/data-health/daily-prices-card.tsx
web/src/screens/data-health/financials-card.tsx
web/src/screens/data-health/scores-card.tsx        from the shell's summary
web/src/screens/data-health/needs-fixing.tsx       header, rows, Show more
web/src/screens/data-health/problem-row.tsx        the problem row composition (UX design §3)
web/src/screens/data-health/stop-following-dialog.tsx  dialog confirm, blueprint §9 wording
web/src/screens/data-health/download-now.tsx       the one action, used by the header and Needs fixing
web/src/screens/data-health/recent-downloads.tsx   data-table compact with history semantics
web/src/screens/data-health/what-you-follow.tsx    card summary
web/src/screens/data-health/copy.ts                every owner-facing string
web/src/screens/data-health/*.test.ts(x)
tests/e2e/data-health-trust.spec.ts
tests/e2e/data-health-not-found.spec.ts
```

All new; no delivered file is edited.

### 2.2 Loading and fixing

The sequence is system design §3.4 at the component level. Its actors are
the owner, this screen, the shell and the delivered API. The decision points
are whether any download has ever ended, whether a failure is retryable,
whether a download is already running, and whether stopping following
succeeds. The outcome is that every counted stock has a row with its fix,
that a running download heads Recent downloads with its progress, and that
the checks refresh once when it ends.

```mermaid
sequenceDiagram
    autonumber
    participant O as Owner
    participant DH as data-health-ui
    participant SH as owner-shell
    participant API as ingestion-api / data-health-api

    O->>DH: open /data
    DH->>SH: useDataHealth(): GET /api/data-health (on demand)
    DH->>API: GET /api/acquisition-runs?limit=5
    DH->>API: GET /api/acquisition-runs?state=succeeded&limit=1 (only when Needs fixing is empty)
    DH->>API: GET /api/instruments?limit=1, GET /api/settings/history-depth
    alt attention latest_terminal_download null (no download has ever ended)
        DH-->>O: empty card: No data has been downloaded yet + Start the first download or Open setup
        DH-->>O: Needs fixing when affected_count is above 0, Recent downloads when any download exists
    else
        DH-->>O: verdict, three cards (scores from useShell, check cards null while never_acquired), Needs fixing, Recent downloads, What you follow
    end
    O->>DH: Download now
    DH->>API: POST /api/acquisition-runs
    alt 202, queued_behind null
        DH->>SH: refresh("attention")
        SH-->>DH: each 10 s tick while non-terminal: re-read GET /api/acquisition-runs?limit=5
    else 202, queued_behind set
        DH-->>O: "A download is running. This starts when it finishes."
    else 409
        DH-->>O: refusal with Set history depth or Follow stocks
    end
    SH-->>DH: attention: latest download turned terminal
    DH->>SH: aggregate re-read once
    O->>DH: Stop following FBXX (Not found row)
    DH-->>O: dialog confirm, Cancel first and focused
    O->>DH: Stop following
    DH->>API: DELETE /api/instruments/FBXX
    alt 200
        DH->>SH: aggregate re-read; refresh("attention")
        DH-->>O: row leaves; "Stopped following FBXX" announced politely
    else 404 / 409
        DH-->>O: inside the dialog: Couldn't stop following FBXX: {reason}.
    end
```

### 2.3 Verdict (DEC-0210, DEC-0217, PROVISIONAL)

The badge is `worstDataTier` over the problem set, `affected_count` (*n*)
against `followed_count` (*m*) from the aggregate, and attention's
`latest_terminal_download` state from `useShell()`. The checks' tiers do not
feed it; each card shows its own (DEC-0210, DEC-0217 as amended). Home's tile
passes the same problem set (attention's `problems.stock_count`, one set by
DEC-0201) and the same download, so its verdict tier is this one. The
sentence is composed here, with the badge as its first clause:

| Answer | Badge | Sentence after the badge |
|--------|-------|--------------------------|
| good | `status-good` *Yes* | *None of the {m} followed stocks needs attention.* |
| warning | `status-warning` *Mostly yes* | *{n} of {m} followed stocks need attention; their scores show as Incomplete until they're fixed.* (one: *1 of {m} followed stocks needs attention; its scores show as Incomplete until it's fixed.*) |
| serious (latest download interrupted) | `status-serious` *Mostly yes* | the count clause, then *, and the last download was interrupted.* |
| critical (every followed stock affected, or the latest download failed) | `status-critical` *No* | the count clause, then *, and the last download failed.* when the latest download failed |
| attention loading | skeleton verdict line and badge (UX design 1.4 States) | none |
| attention failed | the verdict region's header kept, body *Couldn't read what needs attention: {reason}.* with **Try again** (UX design 1.4 States, Error); no tier is computed without the download input | none |

The download clause replaces the count clause's closing full stop and
follows the latest terminal download whichever input wins. S09 §3's
strategies clause returns in M2. A check that is not determinable sets no
tier but is still named after the sentence, *Daily prices can't be checked
for gaps: {reason}.*, the reason
being `checks.daily_prices.gap_detection.reason`. The as-of line under the sentence
is *checked {time}* from `checked_at`. Right of the `h1`: **Full coverage
table** (a link to `/data/coverage`, `button` `outline`) and **Download now**.

### 2.4 Check cards (DEC-0201, DEC-0213, PROVISIONAL)

| Card | Tier and label | Result line | As-of line and exceptions |
|------|----------------|-------------|---------------------------|
| *Daily prices* | `ok` *No missing prices or gaps* (good); `exceptions` *Needs attention* (warning); `not_determinable` *Not determinable* (`coverage-unknown`) | *All {m} stocks have prices to {latest_session}*, or the non-zero parts of *{absent_count} without prices, {gap_stock_count} with gaps, {behind_count} behind {latest_session}*; a null `gap_stock_count` renders *Gaps not determinable: {reason}* as `coverage-unknown` while the other parts still render | *Prices to {latest_session}* then up to five `exception_symbols` and *and {k} more*; the scope note *Gaps and currency are judged against the days and the newest session other followed stocks hold. FactorFlow has no trading calendar, so a day with no download leaves nothing to detect.* with **Full coverage table** (STD-UI-18; DEC-0201, DEC-0206) |
| *Company financials* | `ok` *All financials present*; `exceptions` *Needs attention* | *All {m} stocks have financials*, or *{absent_count} without financials, {problem_count} with failed downloads* (zero parts omitted) | *Financials to {as_of}* as a timestamp with the zone, then exceptions; *Checks that financials are present and downloaded, not that they are correct.* (STD-UI-18) |
| *Factor scores* (`useShell().scores`) | not served: `coverage-unknown` *Not determinable*; `never_classified`: *No scores yet* (neutral); `later` building: *Updating* (active); `later` failed: *Score update failed* (critical); `set.not_current`: *Not reflecting the latest download* (warning); else *Current* (good) | *{current} of {followed} stocks current*, both from the summary's `stocks_current`, and when some are not, *{k} stocks show as Incomplete until their data is complete*, *k* being `stocks_current.followed_count` (the set's `active_instruments`) minus `stocks_current.current_count`, never the aggregate's or attention's `followed_count`, so it cannot go negative | *Scores {YYYY-MM-DD HH:MM zone} · from the download started {start time}* with the start time a link to `/data/downloads/{run_id}`; while not served, *FactorFlow can't read scores yet.* |

*and {k} more* takes *k* as the check's `exception_count` minus the symbols
shown, and is omitted when *k* is 0 (DEC-0220, PROVISIONAL). A `0` part of a result
line is omitted, never shown as *0 with gaps* beside a real count, and a null
part is never shown as `0` (STD-UI-4).

### 2.5 *Needs fixing* (AC-13, AC-14)

Header `h2` *Needs fixing · {n}* (`affected_count`), sub-line *From your most
recent downloads · checked {time}*, and **Download now** only when any loaded
row is `retryable`. One `li` per `problems.rows` entry, ordered by symbol:

- the symbol at weight 600, a link to `/data/coverage?symbol={SYMBOL}`;
- per failure, `StatusBadge` *Failed* (critical) or *Not found* (warning),
  then *Downloading {daily prices / company financials / corporate actions /
  reference data} failed: {reason}, {attempts} attempts* or *The provider
  doesn't recognise this symbol.*, the data-type words mapped from
  `prices`, `fundamentals`, `corporate_actions`, `reference`;
- the consequence at `--text-xs`, *Its scores show as Incomplete until this
  is fixed, and so does every universe holding it.* (DEC-0201);
- the fix: a *Failed* failure reads *Download again to retry; data already
  stored is never duplicated or overwritten.* with no per-row control (the
  header's **Download now** is the action, D-9); a *Not found* failure gives
  the row **Stop following** (`button` `ghost`) and **Follow a different
  symbol** (`button` `outline`, a link) with *Probably a typo or a delisted
  ticker. Downloading again won't help.*

**Show more** (`button` `outline`) after the loaded rows when `next_cursor` is
set appends `fetchProblems(cursor, 50)`; focus stays on the control and the
new row count is announced politely. A `422` reads *Couldn't read more
problems: {reason}.* with **Try again**, which restarts from the first page.

When `affected_count` is 0 the card reads *Nothing needs fixing.* and *Last
complete download {start time}* from `GET /api/acquisition-runs?state=succeeded&limit=1`,
or *No complete download yet* when it returns none. The dedicated read, rather
than the five rows of Recent downloads, keeps the line true when the last
complete download is older than the five most recent (capability §5.3); it is
the delivered endpoint and consumer pair system design §4.2 already declares,
with a different filter.

### 2.6 Recent downloads and What you follow

- **Recent downloads** (`card` `default`, *Starts when you press Download
  now*): `data-table` `compact` with `history` semantics over
  `listAcquisitionRuns({ limit: 5 })`; columns *Started* (the start time, the
  row header, a link to `/data/downloads/{id}`), *Outcome* (`StatusBadge`),
  *Ended* (end time, or an em dash while running), *Result* (*{written} of
  {named} stocks*; *Partial*: *{written} of {named} stocks, {failed} failed*;
  *Interrupted*: *FactorFlow restarted mid-download; {written} kept, the rest
  picked up next time*). A running download heads the list with `progress`
  `determinate` and *{done} of {total} stocks* from attention's
  `latest_download.progress`. The list is re-read on each attention answer
  while `latest_download` is non-terminal, which is the shell's 10 second
  tick, and otherwise only on load. The card's header carries *checked
  {time}*, the time the list last answered, both while a download runs and
  otherwise (AC-25; STD-UI-25).
- **What you follow** (`card` `summary`): *Followed stocks* *{active_count}*,
  *Stopped following* *{retired_count} (history kept)*, *History depth* *{y}
  years* or *not set* as a link to `/settings`, *Market data key* `badge`
  *Found* / *Missing* / `coverage-unknown` *Not determinable* from
  `health.credential_present` (never the value); footer **Manage followed
  stocks** (a link to `/data/followed`).

### 2.7 Actions

- **Download now** (header, *Needs fixing*, and the empty state's **Start the
  first download**) is one component around `startAcquisitionRun()`: routine,
  no confirmation (blueprint §9). `202` with `queued_behind` null calls
  `refresh("attention")`; with it set, the helper line reads *A download is
  running. This starts when it finishes.* (AC-15). `409`
  `history_depth_not_set`: *Couldn't start the download: history depth isn't
  set.* with **Set history depth** to `/settings`; `409`
  `no_active_instruments`: *Couldn't start the download: no stocks are
  followed.* with **Follow stocks** to `/data/followed`. It always downloads
  the whole followed list; there is no per-stock retry (D-9).
- **Stop following {SYMBOL}** opens `dialog` `confirm` titled *Stop following
  {SYMBOL}* with *Stop following {SYMBOL}? Its history is kept, and strategies
  holding it keep holding it. You can follow it again later.* (blueprint §9,
  verbatim), **Cancel** then **Stop following**, cancel first and focused. On
  confirm, `retireInstrument(symbol)`; `200` closes the dialog, re-reads the
  aggregate, calls `refresh("attention")` and announces *Stopped following
  {SYMBOL}*, no toast; `404` or `409` keeps the dialog open with *Couldn't
  stop following {SYMBOL}: {reason}.* and the row refreshes on close (STD-UI-2,
  STD-UI-19).
- **Follow a different symbol than {SYMBOL}** navigates to `/data/followed`
  with router state `{ focusAdd: true }` (owner-web-app's entry hint).

### 2.8 Messages

N/A, not applicable for this component.

## 3. Constraints and Assumptions

- **The aggregate is never on an interval** (system design §3.4 note 1): on
  load, **Try again**, once when a download ends, after **Stop following**.
- **One problem set** (DEC-0201): the header count, the verdict's *n* and the
  rows come from one response.
- **Not found is never retried** (AC-14): no download control on a row whose
  failures are all *Not found*; the header's **Download now** in *Needs
  fixing* appears only when a row is retryable.
- **No strategy wording in M1** (UX design 0.8; DEC-0210): the consequence
  speaks of scores and universes.
- **S09 §7's Stale state is not rendered on the check cards.** Under
  DEC-0201, `latest_session` is the latest session any followed stock holds,
  so no as-of can predate it for every stock. The owner resolved review v1
  FINDING-2 on 2026-10-25: the `ok` label asserts only that nothing is missing
  and the scope note states that currency is judged against that session,
  not a trading calendar (STD-UI-18; UX design §0.8). The state returns when a
  calendar exists (system design open question 9).
- **The verdict's download clause has an input** (resolved 2026-10-25):
  attention's `latest_terminal_download` feeds `worstDataTier`, a failed one
  critical with *, and the last download failed.* and an interrupted one
  serious with *, and the last download was interrupted.*, so a failed
  download that recorded no per-stock failure no longer leaves the verdict at
  *Yes* while Home shows a critical item for the same cause (DEC-0210,
  DEC-0217 as amended).
- **Assumption:** `run_started_at` on the summary's `set` names the download
  the scores came from, as `classification-api` publishes it.

## 4. Security

- The key's value never appears (S09-4; AC-4).
- Reasons render as text; no `dangerouslySetInnerHTML`.
- The two writes are the delivered `POST /api/acquisition-runs` and
  `DELETE /api/instruments/{symbol}`, behind the delivered Origin check.
- No storage.

## 5. Scalability and Performance

- *Needs fixing* pages by 50 under the canonical bounds (STD-UI-30); 300
  problem stocks are six pages.
- One aggregate read per visit plus one per download end; Recent downloads at
  most five rows, re-read at 10 seconds only while a download runs.

## 6. Upgrade

- New screen. M2 adds the schedule line, the broker row and strategy wording;
  M3 adds the Live prices card in the empty fourth column. Nothing is
  reserved.

## 7. Testing

| Test | File | What it proves |
|------|------|----------------|
| Verdict | `web/src/screens/data-health/verdict.test.tsx` | Each answer's badge and sentence; singular forms; every followed stock affected answers critical *No*; a failed latest download answers critical with *, and the last download failed.*; an interrupted one `status-serious` *Mostly yes* with *, and the last download was interrupted.*; check tiers do not change the answer; not-determinable checks named after the sentence; attention failing gives *Can't tell yet* (AC-11; DEC-0210, DEC-0217) |
| Cards | `web/src/screens/data-health/check-cards.test.tsx` | Each status's label and tier; a null gap count renders *Gaps not determinable* and never `0`; zero parts omitted; Factor scores *Not determinable* while the summary answers `404` (AC-11, AC-24; DEC-0213) |
| Partial is never complete | `web/src/screens/data-health/recent-downloads.test.tsx` | *Partial* is warning and *Interrupted* serious with their result sentences (AC-12; S09-1) |
| Recent downloads time | `web/src/screens/data-health/recent-downloads.test.tsx` | *checked {time}* shows while a download runs and otherwise, and advances on each 10 s re-read (AC-25) |
| Rows | `web/src/screens/data-health/problem-row.test.tsx` | Symbol, what failed, reason, attempts and consequence; *Not found* rows offer **Stop following** and **Follow a different symbol** and no download (AC-13, AC-14; S09-2, S09-3) |
| Header action | `web/src/screens/data-health/needs-fixing.test.tsx` | **Download now** appears in *Needs fixing* only with a retryable row; **Show more** appends and keeps focus |
| Download now | `web/src/screens/data-health/download-now.test.tsx` | `202` refreshes attention; `queued_behind` shows the queued line; each `409` names its fix (AC-15) |
| Stop following | `web/src/screens/data-health/stop-following-dialog.test.tsx` | `confirm`, cancel first and focused, blueprint wording; success re-reads and announces; refusal stays in the dialog (STD-UI-2) |
| Empty states | `web/src/screens/data-health/data-health.test.tsx` | `latest_terminal_download` null with and without followed stocks renders the empty card, with Recent downloads beneath it while a first download runs; a download that ended with nothing stored (`never_acquired` true, `affected_count` above 0) renders the verdict, *Needs fixing* with its rows and the check cards' null state, not the empty card; *Nothing needs fixing.* with the last complete download or *No complete download yet* (AC-13, AC-21; S09-5) |
| Refresh rule | `web/src/screens/data-health/data-health.test.tsx` | No aggregate read on a timer; one when the latest download turns terminal |
| Trust journey | `tests/e2e/data-health-trust.spec.ts` | A partial download: verdict *Mostly yes*, rows named, **Download now** starts a full download that heads Recent downloads and the checks refresh at its end (capability flow 2) |
| Not found journey | `tests/e2e/data-health-not-found.spec.ts` | An unrecognised symbol's row: stop following confirmed and the row leaves with history kept on Coverage; follow a different symbol lands on Followed stocks with the add field focused (AC-14) |

## 8. Acceptance Criteria

1. The screen opens with a one-sentence verdict naming how many followed
   stocks need attention, and three check cards each with tier, result and
   as-of.
2. Every row names the stock, what was being downloaded, the reason and the
   consequence, and offers the fix that applies.
3. A *Not found* row never offers a download.
4. **Download now** starts a full download, or says it starts when the
   current one finishes.
5. Nothing partial or interrupted renders as complete.
6. Before any download has ended, the screen says no data has been
   downloaded and offers the first download or setup.
7. Failure scenario: a failed read keeps each card's header and replaces its
   body with *Couldn't read {the data health checks / recent downloads / what
   you follow}: {reason}.* and **Try again**; no `request_id` is shown.

## 9. Workflows

Capability flow 2 in full, including its alternates (a download already
running, nothing wrong, gap detection unavailable), and the Data health half
of flow 3 (**Fix data** and **See details** from Home land here). Intersects
Coverage, Followed stocks, the download detail and Settings by the links in
2.5 to 2.7.

## 10. UX / GUI

From UX design §1.4.

**Layout.** Reading width, 1180 px cap, regions `--space-5` apart:
(1) header row, `h1` *Is the data good enough to trust?* at `--text-xl` with
the verdict under it and the two actions right; (2) three `card` `metric`
check cards in a four-column grid, the fourth empty with no placeholder, each
with its name as `h2` at `--text-lg`, the tier `badge` beside it, a bold
result line at `--text-base` and one `--text-xs` as-of and exceptions line;
(3) *Needs fixing · {n}* (`card` `default`); (4) two columns `--space-5`
apart, Recent downloads and What you follow.

**Component mapping.**

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Check cards | `card` | `metric` | `design-system/components/card/design-spec.md` |
| Verdict tier; check tiers; score states; row outcomes; download outcomes; key presence | `badge` | `status-neutral` / `status-active` / `status-good` / `status-warning` / `status-serious` / `status-critical` per brief §12.2 | `design-system/components/badge/design-spec.md` |
| Not determinable | `badge` | `coverage-unknown` | `design-system/components/badge/design-spec.md` |
| Download now; Start the first download | `button` | `default`, one per region | `design-system/components/button/design-spec.md` |
| Full coverage table; Follow a different symbol; Manage followed stocks; Show more; Try again | `button` | `outline` (links where they navigate) | `design-system/components/button/design-spec.md` |
| Stop following (row) | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Stop following confirmation | `dialog` | `confirm` | `design-system/components/dialog/design-spec.md` |
| Needs fixing, Recent downloads | `card` | `default` | `design-system/components/card/design-spec.md` |
| Problem row | composition: `badge` + text + `button` | n/a | `design-system/components/badge/design-spec.md`, `design-system/components/button/design-spec.md` |
| Downloads list | `data-table` | `compact` with `history` semantics | `design-system/components/data-table/design-spec.md` |
| Running download | `progress` | `determinate` | `design-system/components/progress/design-spec.md` |
| What you follow | `card` | `summary` | `design-system/components/card/design-spec.md` |

**States** (UX design 1.4). Loading: skeleton verdict line and badge, three
skeleton cards, skeleton rows in the lower cards. Empty, never populated:
attention's `latest_terminal_download` null (no download has ever ended),
one `card` `default` in place of the verdict, the check cards and What you
follow, `h2` *No data has been downloaded yet.*, with *Download data for
your {n} followed stocks to see whether it can be trusted.* and **Start the
first download** when stocks are followed, or *Follow some stocks first.* and
**Open setup** when none are; no check renders as passed. *Needs fixing*
still renders when `affected_count` is above 0, and Recent downloads when any
download exists, so a running first download shows its progress. A download
that ended with nothing stored (`never_acquired` true) is not this state:
the verdict, *Needs fixing* and Recent downloads render, and the Daily prices
and Company financials cards render their null state, an `Absent` em dash
for the tier and the result line with hidden *no data stored yet*, never a
passed check. Empty, nothing
found: *Nothing needs fixing.* with the last complete download. Partial: the
cards name their exceptions with counts; *Partial* and *Interrupted* rows as
such. Stale: Factor scores *Not reflecting the latest download*. Unavailable:
the gap part `coverage-unknown` with its reason; Factor scores before the
summary is served; key presence while health is unreachable; the verdict
while attention fails. Error: per card,
header kept, body replaced with the three-part error and **Try again**.
Unreachable: the shell state.

**Tokens.** `--card` / `--card-foreground`, `--border`; `h1` `--text-xl`,
card `h2`s `--text-lg`, result lines `--text-base` weight 600, as-of lines,
sub-lines and consequences `--text-xs` `--muted-foreground`; tier badges
`--status-<tier>` on `--status-<tier>-muted`; not determinable
`--value-indeterminate` on `--value-indeterminate-muted` with
`--pattern-indeterminate`; table separators `--border`, header text
`--muted-foreground`, body `--text-sm`, times and counts `--font-numeric`,
`--row-height-compact` through the `compact` variant, an em dash in
`--value-missing` for a download not yet ended; progress track `--seq-1` and
indicator `--status-active`; dialog `--popover` / `--popover-foreground`;
buttons `--primary` / `--primary-foreground` (default), `--input` border
(outline), `--ring` focus; spacing `--space-5` between regions, `--space-4`
inside cards, `--space-3` between a row's lines.

**Accessibility.** Each card a `section` labelled by its `h2`. The verdict is
one sentence to a screen reader (the badge's text is its first clause). Rows
are list items; actions name the symbol (*Stop following FBXX*, *Follow a
different symbol than FBXX*, *FBXX, show in the coverage table*). The table
has the start time as row header and column headers for outcome, end and
result; the running `progressbar` is labelled by its text. The dialog is
`role="dialog"` with `aria-modal`, focus trapped, cancel first, focus
returned to the row's **Stop following** or, when the row has left, to the
*Needs fixing* heading. Polling and a row leaving announce politely and never
move focus. Greyscale rendering is the test (STD-UI-8). The key's value never
appears.

**Internationalization.** None.

## 11. API Endpoints

Consumed; none exposed.

| Endpoint | Method/Operation | Auth/Privilege | Request | Response | Notes |
|----------|-----------------|----------------|---------|----------|-------|
| `/api/data-health` (via `useDataHealth`) | GET | none, loopback | none | `DataHealthResponse` | On demand (DEC-0200) |
| `/api/attention` (via `useShell`) | GET | none, loopback | none | `AttentionResponse` | Shell cadence; `latest_terminal_download` for the verdict and the empty state |
| `/api/data-health/problems` (via `fetchProblems`) | GET | none, loopback | `cursor`, `limit=50` | `ProblemPageResponse` | **Show more** |
| `/api/acquisition-runs` | GET | none, loopback | `limit=5`; `state=succeeded&limit=1` | runs | Recent downloads; last complete download |
| `/api/acquisition-runs` | POST | none, loopback | none | `202`; `409` | **Download now** (AC-15) |
| `/api/instruments` | GET | none, loopback | `limit=1` | `active_count`, `retired_count` | What you follow |
| `/api/instruments/{symbol}` | DELETE | none, loopback | path symbol | `200`; `404`; `409` | **Stop following** |
| `/api/settings/history-depth` | GET | none, loopback | none | `years` or null | What you follow |

## 12. References

| Type | Document Name | Description | Link |
|------|---------------|-------------|------|
| UX design | CAP-003 v1 | §1.4 Data health, §0.8 departures | `docs/capabilities/CAP-003-app-shell-and-data-health/design/ux-design.md` |
| Screen spec | PRODUCT-UX-S09 v4 | Regions, copy, states, S09-1 to S09-5 | `docs/ux/screens/S09-data-health.md` |
| System design | CAP-003 v1 | §3.4 and notes | `docs/capabilities/CAP-003-app-shell-and-data-health/design/system-design.md` |
| Blueprint | PRODUCT-UX v6 | §9 confirm wording; D-9 | `docs/ux/product-ux-blueprint.md` |
| Decisions | DEC-0200, DEC-0201, DEC-0210, DEC-0213, DEC-0217, DEC-0220 | Reads, definitions, verdict (as amended 2026-10-25), counts, the full tier order (as amended 2026-10-25), exception count | `projects/factorflow-v2/decisions/` (harness repository) |

## 13. Traceability

| Capability AC | System Design Element | Component Design Element | Section |
|--------------|----------------------|--------------------------|---------|
| AC-11 | Verdict counts and checks | Verdict and three cards | 2.3, 2.4 |
| AC-12 | Recorded states only | *Partial* and *Interrupted* rendering | 2.6 |
| AC-13 | Problem rows | Problem row composition | 2.5 |
| AC-14 | `retryable` false for `not_found` | *Not found* fixes, no download | 2.5, 2.7 |
| AC-15 | `POST /api/acquisition-runs`, `queued_behind` | **Download now** | 2.7 |
| AC-21 | No download ever ended | Empty state on `latest_terminal_download` null; `never_acquired` drives the check cards' null state | 2.2, 10 |
| AC-24 | States per region | States paragraph | 10 |
| AC-25 | Keyboard; *checked {time}* | As-of lines; Recent downloads' *checked {time}*; dialog focus | 2.3, 2.6, 10 |
| AC-26 | `ui-components` | Component mapping | 10 |
| AC-16 | `problems.stock_count` | Same set as the header count | 2.5 |

## 14. Open Questions

1. ~~**The verdict's download clause has no input** (3).~~ **Answered
   2026-10-25 by the owner:** attention's `latest_terminal_download` is an
   input to `worstDataTier`; failed is critical with *, and the last download
   failed.*, interrupted serious with *, and the last download was
   interrupted.* (DEC-0210, DEC-0217 as amended; 2.3, 3).
2. **The download's name** (capability OQ-1). *Owner: capability owner.
   Blocks: copy only.*
3. **Latency target for the aggregate: answered.** The owner set AC-28 on
   2026-10-25 (p95 ≤ 2 s at 3,000 followed stocks; system design open
   question 7).
