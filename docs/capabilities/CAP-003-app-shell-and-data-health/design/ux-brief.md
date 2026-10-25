---
artifact_schema_version: 1
artifact_id: CAP-003-ux-brief
artifact_type: ux-brief
artifact_version: 1
capability_id: CAP-003
title: App Shell & Data Health
created: 2026-10-25
updated: 2026-10-25
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
ai_provenance:
  agent_id: ux-brief-agent
  agent_version: "1.2"
  model: claude-fable-5-1
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-25T19:46:08Z
  source_artifacts:
    - id: CAP-003
      version: "1, draft 2026-10-24"
    - id: CAP-003-system-design
      version: "1, draft 2026-10-25, committed 09410b0"
    - id: PRODUCT-UX
      version: "6, approved 2026-10-16"
    - id: PRODUCT-UX-S01
      version: "4, approved 2026-10-16"
    - id: PRODUCT-UX-S02
      version: "4, approved 2026-10-16"
    - id: PRODUCT-UX-S09
      version: "4, approved 2026-10-16"
    - id: STD-UI
      version: "6, approved 2026-10-16"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-002-ux-brief
      version: "3, approved 2026-10-17"
    - id: factorflow-design-system
      version: "18 components as of 2026-10-15"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# UX Brief: App Shell & Data Health

**Capability:** CAP-003
**Design System:** FactorFlow Design System (shadcn/ui + Radix), configured at `projects/factorflow-v2/design-system.yaml`, held in `design-system/` in this repository. `design_system_available = true`: the repository and every configured path (`design-system/components/`, `design-system/theme.css`, `design-system/component-map.json`, `design-system/intake.md`) were verified to exist, and all 18 component specifications as of 2026-10-15 were read for this brief; 15 are used (§4, §7).
**Theme:** `design-system/theme.css`
**Designer Handoff Date:** 2026-10-25

This brief was produced in an unattended `$design-run`. Every choice the skill
would otherwise have asked the owner about is recorded as a decision under
`projects/factorflow-v2/decisions/` in the harness repository and marked
**PROVISIONAL** where it rests on a derivation rather than an approved artifact.
The system design recorded DEC-0200 to DEC-0208 and this brief applies them
without re-deciding; this brief records two of its own, DEC-0209 (Home's header
date, a contradiction between S01 §8 and STD-UI-5 that the standard's own
precedence settles) and DEC-0210 (how the Data health verdict and Home's data
tile derive one tier, and what the M1 verdict says; PROVISIONAL). Nothing was
abstained. The owner upholds or reverts each with `scripts/sdd decisions`.

Following `docs/ux/README.md` and blueprint §0, this brief **cites `PRODUCT-UX`
as a source artifact, claims this capability's row from the blueprint's
milestone map (§10), starts each screen from its approved screen specification
(S01, S02, S09), inherits the shell (§3), patterns (§4), status map (§8) and
action tiers (§9) without restating them, and records only what CAP-003 adds,
specializes or departs from**, each departure with its reason. Where the
capability's STD-UI conformance table (`Capability-CAP-003.md` §5.4) delegates
the narrative to this brief, §12 carries it.

**Vocabulary in this document.** As STD-UI-1 v6 and blueprint §7 require, text
the owner reads uses the display labels: *stock*, *followed stock*, *stop
following*, *download*, *Complete*, *Partial*, *Failed*, *Cancelled by you*,
*Interrupted*, *Incomplete*, *score*. This brief, being an SDD document, keeps
the domain terms (instrument, acquisition run, `acquisition_state`, outcome)
when it names API fields, acceptance criteria and persistence, and writes every
user-visible string in italics with its display label. The UX design and every
implementing story must do the same (AC-19).

## 1. Screens Needed

The blueprint's milestone map (§10) assigns this capability one M1 row,
claimed here verbatim: **§3 shell without the kill switch and environment
region (no order path exists yet); rail and routes of §2; route migration;
command palette with Stocks, Universes and Pages groups; CAP-001's Coverage,
Instruments, Runs, Run detail and Settings restyled under `/data/*` and
`/settings` with §7 labels; S09 Data health and S02 steps 1–4, both on
CAP-001's API as it is; S01 Home with the data card and data-related *Needs
you* items.** The route map (§2.2) names every path, and the system design
(§4.2, screen registration) registers them. The brief covers eight screens and
two shell-level surfaces that are compositions rather than screens.

| Screen | Purpose | User Flow / AC |
|--------|---------|----------------|
| Shell (composition, every route; `owner-shell`) | Blueprint §3.1 rail and top bar without the kill switch and environment region; destinations limited to shipped screens (Home, Research once CAP-002's routes are registered, Data health, Settings) with count chips; route-derived top-bar title; the `/` redirect and the four legacy redirects; the unreachable state; the not-found state inside the shell; the shell-wide polled reads (health 30 s, attention and classification summary 60 s, 10 s while a download is non-terminal or scores are building) | Flows "Reach CAP-001's surfaces through the shell" and "The product stops answering"; AC-1, AC-2, AC-16, AC-18, AC-23, AC-25, AC-27; system design §3.1, §4.1; DEC-0202, DEC-0204 |
| Command palette (`command` `dialog`, every route; `command-palette`) | Blueprint §3.4 palette opened by `⌘K` / `Ctrl+K` and the top-bar button, with the M1 groups Stocks, Universes (when registered) and Pages; no Actions group and no trading action | Flow "Reach CAP-001's surfaces" step 4; AC-22; system design §3.5; DEC-0207 |
| S02 First-run setup, `/setup` (`setup-ui`) | Screen specification `docs/ux/screens/S02-setup.md` v4, steps 1 to 4 (step 5 is M2). Vertical `stepper`, one step card at a time: credential presence, history depth, stocks to follow by pasting a list, the first download with its progress; *Add later* ends setup without a download | Flow "Get from an empty install to a first download"; AC-2 to AC-7; S02-1 to S02-6; system design §3.2; DEC-0202 |
| S01 Home, `/home` (`home-ui`) | Screen specification `docs/ux/screens/S01-home.md` v4, M1 regions only: header with date and market state, the data tile alone in the summary row, *Needs you* with data-related items. No paper or live tile, no strategy list, no *+ New strategy* | Flow "See what needs them today"; AC-7 to AC-10, AC-16, AC-21; S01-3, S01-4, S01-6, S01-7; system design §3.3; DEC-0203, DEC-0206, DEC-0209, DEC-0210 |
| S09 Data health, `/data` (`data-health-ui`) | Screen specification `docs/ux/screens/S09-data-health.md` v4, M1 regions: verdict, three check cards (Daily prices, Company financials, Factor scores; Live prices is M3), *Needs fixing* with its recoveries, Recent downloads, What you follow without the broker row | Flow "Decide whether the data can be trusted"; AC-11 to AC-16, AC-21; S09-1 to S09-5; system design §3.4; DEC-0200, DEC-0201, DEC-0210 |
| Coverage, `/data/coverage` (`owner-web-app`, taken over) | CAP-001's Coverage overview (`CAP-001-ux-design` v5 §1.1) at its new path, titled *Data health › Coverage*, relabelled to STD-UI-1 v6, tiers per blueprint §8, rebuilt from `ui-components`; accepts `?symbol=` to seed its filter (palette fallback target) | Flow "Reach CAP-001's surfaces" steps 1 to 3; AC-17 to AC-20, AC-26 |
| Followed stocks, `/data/followed` (`owner-web-app`, taken over) | CAP-001's Instruments screen (v5 §1.2) at its new path, titled *Data health › Followed stocks*; *Follow stocks* and *Stop following* in place of add and retire; opens with the add field focused when reached from *Follow a different symbol* | Same; AC-14 (as the target of *Follow a different symbol*) |
| Downloads, `/data/downloads` (`owner-web-app`, taken over) | CAP-001's Runs screen (v5 §1.4) at its new path, titled *Data health › Downloads*; outcomes as *Complete*, *Partial*, *Failed*, *Cancelled by you*, *Interrupted*; a download named by its start time (OQ-1) | Same; AC-12, AC-20 |
| Download detail, `/data/downloads/:id` (`owner-web-app`, taken over) | CAP-001's Run detail (v5 §1.5) at its new path, titled *Data health › Downloads › Download {start time}*; the target of *See download* from Home and of every Recent downloads row | Same; AC-12, AC-13 (diagnosis), AC-20 |
| Settings, `/settings` (`owner-web-app`, taken over) | CAP-001's Settings (v5 §1.3) in the shell: history depth and market data key presence, never its value, plus the *Open setup* link S02 §6 requires; the target of *Open Settings* from Home | Flow "Reach CAP-001's surfaces" step 2; AC-4, AC-17; S02 §6 |

CAP-002's five `/research` routes render in this shell unchanged and are not
designed here (AC-27; capability §5.2).

## 2. Information Architecture

Each subsection names only what CAP-003 adds to or specializes from the
blueprint and the screen specification it starts from. Blueprint §3 (shell),
§4 (patterns), §4.10 (state renderings), §7 (vocabulary), §8 (status map) and
§9 (action tiers) apply throughout and are not restated.

### 2.1 Shell

**Data elements:**
- Destination list, static and ordered: primary group Home, Research; data and system group Data health, Settings (blueprint §2.1; AC-1). Research is present exactly when `classification-ui`'s `/research` routes are registered in the same change (system design §4.1; DEC-0204). Strategies and Portfolio are absent, not disabled.
- Home count chip: the length of the merged *Needs you* list, computed by the same `sortAttention` function `home-ui` uses (`GET /api/attention` `items` plus the two score-derived kinds; DEC-0203). Data health count chip: `GET /api/attention` `problems.stock_count`. Each chip is absent at zero (AC-16).
- Top-bar title from a static route-to-title table (system design §3.5 note 4): *Home*, *Setup*, *Data health*, *Data health › Coverage*, *Data health › Followed stocks*, *Data health › Downloads*, *Data health › Downloads › Download {start time}*, *Settings*; CAP-002's routes keep their own titles. Each screen's `h1` remains its specification's (S01's date, S02's *Get set up*, S09's question).
- Palette button at the right of the top bar (blueprint §3.1), labelled with the shortcut; the environment region and the kill switch are absent in M1, and their place is left empty rather than reserved by a disabled control (system design constraint 14; blueprint D-7).
- Liveness from `GET /api/health` every 30 s (the delivered `HealthProvider`), with the time of the last successful answer, consumed only by the unreachable state (DEC-0204).
- Redirects, all client-side `Navigate replace` with the query kept: `/` to `/setup` while `most_recent_run` is null, else to `/home` (DEC-0202); `/coverage`, `/instruments`, `/runs`, `/runs/:runId` to their new paths for one release (AC-18; blueprint §2.2).

**Grouping and hierarchy:**
- Rail (208 px): brand mark, primary group, flexible gap, data-and-system group pinned to the bottom (blueprint §3.1). The CAP-001 status region is retired; its two facts are re-homed, liveness into the unreachable state and the last download's outcome into Home's data tile and Data health's Recent downloads (DEC-0204).
- Top bar, sticky: title at the left, palette button at the right, nothing between them in M1.
- Main region: `--space-5` padding; Home, Setup and Data health cap at 1180 px, the five taken-over screens use the full width for their tables (blueprint §3.1).
- Below 768 px the rail stacks above the content as a horizontal list and the top bar wraps; nothing is unreachable (blueprint §3.1; capability §5.3).

**Primary vs. secondary information:**
- Primary: the current destination (`aria-current="page"`) and the screen title.
- Secondary: the two count chips; the palette shortcut.

**Shell states (blueprint §3.5, specialized):**
- *Setup incomplete*: `/` opens setup; every other destination stays reachable and shows its honest empty state (DEC-0202).
- *Unreachable*: the main region is replaced by the delivered unreachable state, kept word for word (*FactorFlow is not answering. The application container may have stopped, or a database migration may have failed and prevented it from starting. Check the container logs.*, `CAP-001-ux-design` v5 §2), with one line added: *Last answered {time} CDT* (DEC-0204; AC-23). The rail, its chips as last read, and the top bar remain; when health answers again the routed screen mounts at the same URL and refetches, without a page reload.
- *Not found*: a path matching no registered route renders a designed state inside the shell, one sentence saying there is no page at this address and a link to Home; it never renders a blank main region. Copy is the UX design's.
- *Trading stopped* and *classifications updating*: not shell states in M1 (no order path; score state is shown where scores are shown).

### 2.2 Command palette

**Data elements** (DEC-0207; command design spec §4):
- Stocks: followed stocks matching the typed text as a symbol prefix, from `GET /api/instruments?symbol={prefix}&lifecycle=active&limit=8`, debounced; each item shows the symbol and, where the followed list holds one, the name. Choosing one opens `/research/stocks/{symbol}` when the research routes are registered, otherwise `/data/coverage?symbol={symbol}`.
- Universes: active universes from `GET /api/universes` read once per open and filtered locally; the group exists only while CAP-002's universes routes are registered; choosing one opens `/research/universes/{id}`.
- Pages: the shipped rail destinations plus *Coverage*, *Followed stocks* and *Downloads*, filtered locally.
- No Actions group in M1 (blueprint §10); nothing in the palette places or stops trading (AC-22).

**Grouping and hierarchy:** `CommandInput` with the placeholder *Jump to a stock or page*, then groups in the order Stocks, Universes, Pages, each with its heading, separated by `CommandSeparator`.

**Primary vs. secondary information:** the symbol or page name is primary; the name beside a symbol and the destination hint are secondary.

**States:** before typing, Pages lists every shipped page and Stocks is empty with a hint to type a symbol; no match in any group renders `CommandEmpty` *No stocks or pages match "{text}".*; a failed stock search renders, inside the Stocks group, the operation and reason (*Couldn't search followed stocks: {reason}*) while Universes and Pages stay usable (system design §3.5 box 12); a loading stock search shows a skeleton row, never an empty group. The palette closes on choice or `Esc` and returns focus to the opener.

### 2.3 S02 First-run setup

Starts from S02 §3 (two columns: step list 260 to 300 px, step card fluid), §4
component mapping, §6 interactions and §8 copy, with these specializations.

**Data elements (per step, with their source):**
- Stepper: four steps in M1, *Step n of 4*; each step's done, current or to-do state is derived on load from the server (credential presence from the shell's health read, `GET /api/settings/history-depth`, `GET /api/instruments?lifecycle=active&limit=1` `active_count`, the shell's attention `latest_download`), so leaving and returning re-derives every step (DEC-0202; S02-1). Done steps carry a one-line summary (*Found*, *5 years of history*, *120 followed stocks*).
- Step 1, *Connect market data*: read-only; `badge` `status-good` *Found* or `status-critical` *Missing* from `health.credential_present`; when missing, the variable name `FACTORFLOW_MASSIVE_API_KEY` and *Restart FactorFlow after setting it.* Never the value (AC-4; S02-4). While health is unreachable the presence renders `coverage-unknown` *Not determinable*, never *Missing* (S02 §7).
- Step 2, *How far back should history go?*: `input` `numeric` with the *years* suffix inside `form` `stacked`; the plan-limit note of S02 §3; committed with `PUT /api/settings/history-depth` on Continue; `422` renders as a field error naming the step and the reason with the value kept (S02 §7).
- Step 3, *Which stocks do you want to follow?*: `radio-group` `cards` with **two** options in M1, *Paste a list* and *Add later*; *Upload a CSV* (S02 §3) is **not built**, a recorded departure from the approved screen because the capability scopes step 3 to a pasted list (capability §2, AC-5, OQ-3; system design §3.2 note 5). `textarea` `list` with the delivered `parse-bulk-symbols` result on paste and blur: accepted count (`badge` `status-good`), each duplicate and each unreadable entry named (`badge` `status-warning`), a near-miss suggestion as a button that applies it (S02 §6). Below 30 accepted, the ranking warning of S02 §6, with Continue available (AC-6; S02-5). At zero accepted, Continue is `button` `blocked` with *Paste at least one symbol, or choose Add later.* (S02 §7). On Continue the accepted symbols go to `POST /api/instruments` in batches of at most 1000; the response's `added`, `reactivated` and `rejected` (with reasons) are shown, a `409` because every symbol is already followed is treated as success, and a `422` because every entry is malformed names each entry with its reason and discards nothing (AC-5; S02-3).
- Step 4, *Download data for {n} stocks*: a summary of the three choices, repeating step 1's badge so a missing key is visible where the download starts; **Start download** (`button` `default`) posts `POST /api/acquisition-runs`. `202` with `queued_behind` null: `progress` `determinate` *{done} of {total} stocks* from the shell's attention `latest_download.progress`, polled every 10 s, with *checked {time}* from attention `checked_at` beside it (STD-UI-25; AC-25) and *You can leave; this keeps running.* `202` with `queued_behind` set: *A download is running. This starts when it finishes.* `409` `history_depth_not_set` or `no_active_instruments`: the refusal names the operation, the step to return to and the reason, as a link to that step. **Start download is not blocked when the key is missing**: CAP-001's Start is blocked only for an unset depth or an empty followed list (`CAP-001-ux-design` v5 §1.1, §1.4) and AC-17 preserves that; a download without a key fails and surfaces on Home as the *Failed* download item and the missing-key item (DEC-0203).
- *Add later* (step 3): ends setup by navigating to `/home`, which shows its honest empty state; nothing is stored, so `/` opens setup again until a download is requested (DEC-0202; capability flow 1 step 7).

**Grouping and hierarchy:** S02 §3 unchanged: `h1` *Get set up* and the sub-line, the `stepper` `vertical` as a `nav` *Setup steps*, the step card with *Step n of 4*, the step question as `h2`, explanation, controls, info note, footer with **← Back: {previous step}** (`button` `ghost`) and **Continue** (`button` `default`) with its *Next: …* hint.

**Primary vs. secondary information:**
- Primary: the current step's question and its one control.
- Secondary: the step list and its summaries, the plan-limit and parse notes, the info note about the followed list.

**Drafts:** every value entered in a later step is kept in `setup-ui`'s state for the visit when the owner goes back (AC-3; S02-2); nothing is written to browser storage (system design §4.4).

**Reopening:** Settings carries an *Open setup* link (S02 §6; system design §4.1), so setup is reachable after completion for a second pass; its steps then show as done.

### 2.4 S01 Home

Starts from S01 §2 (M1 regions), §3, §4, §6 and §7, with these
specializations. The summary row holds the data tile alone at one-third width,
with *Needs you* beside it (S01 §2).

**Data elements:**
- Header: `h1` *{Weekday}, {YYYY-MM-DD}* (**DEC-0209**: STD-UI-5 requires ISO-8601 and never a locale format, and STD-UI §1.1 makes the standard win over S01 §8's *Thursday, 15 October*; the weekday word is kept; a recorded departure from S01 §8). Under it the as-of line: the market state (**DEC-0206**: *Market closed* on Saturdays, Sundays and weekdays outside 08:30 to 15:00 America/Chicago; inside weekday session hours *Market state not determinable*, rendered as `coverage-unknown`, because no trading calendar exists), then *prices current to {session date}* from `GET /api/attention` `prices_as_of` (a session date, unconverted; STD-UI-5), then *checked {time}* (STD-UI-25). No *next rebalance* and no **+ New strategy** (M2; S01 §2).
- Data tile (`card` `metric`, links to `/data`): `badge` with the worse of two tiers and the label of whichever wins (**DEC-0210**, as the owner amended it on 2026-10-25): the verdict tier, from the same `worstDataTier` function Data health's verdict uses, over attention's `problems.stock_count`, `followed_count` and `latest_terminal_download`, labelled with its answer word; and the blueprint §8 score-state tier from the classification summary, labelled as the Factor scores card labels it; neutral and active score states never worsen it. The tile does not read `GET /api/data-health`. *{current} of {followed} stocks current* with both figures from `GET /api/classifications/summary` `stocks_current` (`current_count` and `followed_count`, counted over the score set's active instruments) when the summary is served; while it is not, `followed` from attention's `followed_count` and `current` rendered as not determinable (an explicit marker, not zero) (AC-8; capability §5.1); *Scores {as-of}* from the summary's set and *Prices {as-of}* from attention (S01-6); the sentence *Every other number on this page is as of those times.*; the `badge` `status-warning` *Not reflecting the latest download* when `set.not_current` is true or the summary's `later` block reports a newer set building or failed (AC-8; S01 §7 Stale).
- *Needs you* (`card`): header *Needs you · {n}*, sub-line *Most important first. Nothing here is urgent unless marked.*, *checked {time}* from attention `checked_at`; then the blueprint §4.1 items, merged from the three server-derived kinds and the two score-derived kinds and sorted by tier then newest first in the shared `sortAttention` (**DEC-0203**). Every action navigates; none mutates (S01 §6). An item leaves only when its cause no longer holds in the latest read (AC-9; S01-4).

**The M1 item catalogue** (DEC-0203; copy is the UX design's to finalise, shapes and actions are fixed):

| Kind | Source | Tier | Title (suggested) | Body (suggested) | Action → target |
|------|--------|------|-------------------|------------------|-----------------|
| Followed stocks with problems | attention `items` `data_problems`, `problems.symbols`, `problems.stock_count` | warning | *KO, TSLA and FBXX are missing data* / *KO, TSLA, FBXX and {k} more stocks are missing data* (S01 §8's *today's data* dropped: the missing data may be any data type) | *Their scores show as Incomplete until the data is complete.* | **Fix data** → `/data` |
| Latest download not complete | attention `items` `download_not_complete`, `latest_terminal_download` | critical when *Failed*; serious when *Interrupted* | *The last download failed* / *The last download was interrupted* | *{failure_reason}, ended {time}.* / *FactorFlow restarted mid-download. Download again to pick up the rest.* | **See download** → `/data/downloads/{run_id}` |
| Market data key missing | attention `items` `credential_missing` | critical | *The market data key is missing* | *Set FACTORFLOW_MASSIVE_API_KEY and restart FactorFlow. Downloads fail until then.* | **Open Settings** → `/settings` |
| First download running, or scores being produced, before any score set exists | attention `latest_download` non-terminal, or summary `later` building, with `never_classified` true | active | *Your first download is running* / *Your first scores are being produced* | *{done} of {total} stocks so far. Scores appear when it finishes.* (AC-7) | **See download** → `/data/downloads/{run_id}` |
| Latest score update failed | summary `later` failed | critical | *The latest score update failed* | *{reason}. Scores still show the set from {download start time}.* | **See details** → `/data` |

**Grouping and hierarchy:** header row; summary row (data tile, one third); *Needs you* beside it; nothing below (S01-7).

**Primary vs. secondary information:**
- Primary: the topmost *Needs you* item and the data tile's tier.
- Secondary: the counts and as-of times, the market state, *checked {time}*.

**Home states that specialize S01 §7:** *Empty, never populated* is not a redirect: with no download ever requested (`latest_download` null) Home renders *No data has been downloaded yet.* with **Start setup** → `/setup` in place of the data tile and the list (AC-21; DEC-0202; system design §3.3 box 5). *Empty, nothing found* is *Needs you* with zero items: *Nothing needs you right now.* with *checked {time}*. The score regions render not determinable while the summary answers `404`, and the error state with **Try again** on any other error (capability §5.1).

### 2.5 S09 Data health

Starts from S09 §3, §4, §6, §7, §8 and §11, with these specializations. The
Live prices card (M3), the broker row (M2) and the schedule line (M2, D-2) are
absent.

**Data elements:**
- Header: `h1` *Is the data good enough to trust?*; under it the verdict, a `badge` with its tier and one sentence composed in the interface (**DEC-0210** and **DEC-0217** as the owner amended them on 2026-10-25, PROVISIONAL; **DEC-0200**). The tier and opening word come from the problem set (`GET /api/data-health` `affected_count` against `followed_count`) and attention's `latest_terminal_download`, nothing else: *Yes. None of the {m} followed stocks needs attention.* (good, none affected); *Mostly yes. {n} of {m} followed stocks need attention; their scores show as Incomplete until they're fixed.* (warning, some affected); *No.* with the count clause (critical, every followed stock affected); a latest terminal download that *Failed* makes it critical *No.* and adds *, and the last download failed.*; one that was *Interrupted* makes it serious (`status-serious`) with *Mostly yes.*, the count clause and *, and the last download was interrupted.* The full order is critical, serious, warning, good, neutral, with active beside good; neutral and active never worsen the answer. S09 §3's *strategies skip them until they're fixed* is not used in M1 because no strategy exists (STD-UI-2; DEC-0201); it returns with M2. Right: **Full coverage table** (`outline`, a link → `/data/coverage`) and **Download now** (`default`).
- Check cards, three `card` `metric` in the four-column grid with the fourth column empty, no placeholder (S09 §2):
  - *Daily prices* from `checks.daily_prices`: tier good when `status` is `ok`, warning when `exceptions`, `coverage-unknown` *Not determinable* when `not_determinable`; result line *All {m} stocks have prices to {latest_session}* or *{absent} without prices, {gaps} with gaps, {behind} behind {latest_session}*; as-of *{latest_session}*; `exception_symbols` (first five) *and {k} more*; when `gap_detection.available` is false the gap part reads *Gaps not determinable: {reason}* while absence and currency still render (capability flow 2 step 7; DEC-0201). The STD-UI-18 scope note *Gaps are judged against the days other followed stocks hold. A market-wide outage leaves no gap to detect.* links to `/data/coverage` (S09 §8).
  - *Company financials* from `checks.company_financials`: tier as above; result *All {m} stocks have financials* or *{absent} without financials, {problems} with failed downloads*; as-of `as_of` (a timestamp, America/Chicago); exceptions as above.
  - *Factor scores* from the shell's classification summary (capability §5.1; blueprint §8): `coverage-unknown` *Not determinable* while the summary answers `404`; `status-neutral` *No scores yet* while `never_classified`; `status-active` *Updating* while `later` reports a set building; `status-critical` *Score update failed* when `later` failed; `status-warning` *Not reflecting the latest download* when `set.not_current`; otherwise `status-good` with *{current} of {followed} stocks current*, both from `stocks_current` as on Home's tile; result line *{k} stocks show as Incomplete until their data is complete*, *k* being that `followed_count` minus `current_count` (S09 §11); as-of the set's production time and the download it reflects, named by its start time.
- *Needs fixing · {n}* (`card`): sub-line *From your most recent downloads · checked {time}* (problems are each stock's latest recorded outcome, which may span downloads; DEC-0201), and **Download now** (`default`) only when at least one row is `retryable` (S09 §3; AC-14). One row per stock from `problems.rows`, ordered by symbol, 50 per page with **Show more** reading `GET /api/data-health/problems?cursor=` (STD-UI-30): symbol as a link to `/data/coverage?symbol=`; per failure, `badge` `status-critical` *Failed* or `status-warning` *Not found*, then what failed in words, *Downloading {company financials} failed: {reason}, {attempts} attempts* or *The provider doesn't recognise this symbol.*; a second line with the M1 consequence *Its scores show as Incomplete until this is fixed, and so does every universe holding it.* (DEC-0201; universes are not enumerated); for *Failed*, *Download again to retry; data already stored is never duplicated or overwritten.*; for *Not found*, the row's own **Stop following** (`ghost`) and **Follow a different symbol** (`outline`) and *Probably a typo or a delisted ticker. Downloading again won't help.* (S09 §8; AC-13, AC-14; S09-2, S09-3).
- Recent downloads (`card` with `data-table` `compact` under `history` semantics): the five most recent from `GET /api/acquisition-runs?limit=5`: start time in America/Chicago (the download's name until OQ-1 is answered), outcome `badge` per blueprint §8, *start → end*, a one-line result (*{written} of {named} stocks*; for *Interrupted*, S09 §8's wording); a running download heads the list with `progress` `determinate` *{done} of {total} stocks* re-read on each 10 s attention tick; sub-line *Starts when you press Download now* (S09 §11, pre-M2) followed by *checked {time}*, the time of the last successful read of the list, while it polls and otherwise (STD-UI-25; AC-25); each row links to `/data/downloads/:id`.
- What you follow (`card` `summary`): *{n} followed stocks*, *{k} stopped following (history kept)*, *History: {y} years* (or *not set*, as a link to Settings), *Market data key: Found / Missing* (never the value; S09-4); no broker row; **Manage followed stocks** → `/data/followed`.

**Grouping and hierarchy:** S09 §3 unchanged: header row, check cards, *Needs fixing*, then Recent downloads and What you follow side by side.

**Primary vs. secondary information:**
- Primary: the verdict and the *Needs fixing* rows with their fixes.
- Secondary: the check cards' as-of lines and exceptions, Recent downloads, What you follow.

**Data health states that specialize S09 §7:** *Empty, never populated* (no download has ever ended: attention's `latest_terminal_download` absent, not coverage's `never_acquired`): the verdict, the check cards and What you follow give way to *No data has been downloaded yet.* with **Start the first download** when at least one stock is followed, or *Follow some stocks in setup first* linking to `/setup` when none is (AC-21; S09-5); *Needs fixing* and Recent downloads still render whenever problems or downloads exist; no check renders as passed. Once a download has ended, `never_acquired` drives only the check cards' null state (*Not determinable*), so a download that stored nothing still shows its problem rows (review v1 FINDING-10). *Empty, nothing found*: *Needs fixing* reads *Nothing needs fixing.* with *Last complete download {start time}* from the most recent *Complete* row of Recent downloads, or *No complete download yet*. *Stale*: not detectable on the check cards in M1 — without a trading calendar, currency is judged against the newest session any followed stock holds (DEC-0201, DEC-0206) and the Daily prices card states that scope; Factor scores keeps *Not reflecting the latest download*. *Unavailable*: the gap part of Daily prices, and Factor scores before the summary is served. *Error*: per card, header kept, body replaced by the operation, resource and reason with **Try again** (a `500` envelope's `request_id` is never shown). The aggregate is read on load, on **Try again**, once when a running download ends, and after **Stop following** succeeds; never on an interval (system design §3.4 note 1).

### 2.6 The five taken-over screens

The information architecture of each screen is `CAP-001-ux-design` v5 §1.1 to
§1.5 and is not restated. CAP-003 changes where and in which words each is
shown, never what it does (AC-17). The deltas:

| Delta | Detail | Source |
|-------|--------|--------|
| Paths and titles | `/coverage` → `/data/coverage` *Data health › Coverage*; `/instruments` → `/data/followed` *Data health › Followed stocks*; `/runs` → `/data/downloads` *Data health › Downloads*; `/runs/:runId` → `/data/downloads/:runId` *Data health › Downloads › Download {start time}*; `/settings` unchanged, *Settings*. Old paths redirect for one release | Blueprint §2.2; AC-18; system design §3.1 |
| Display labels (every user-visible string) | *instrument* → *stock*; *Instruments* → *Followed stocks*; *Add instruments* → *Follow stocks*; *Retire* → *Stop following*; *acquisition run* / *Runs* → *download* / *Downloads*; *Start acquisition run* → *Download now*; outcomes → *Complete*, *Partial*, *Failed*, *Cancelled by you*, *Interrupted*; *Provider credential supplied / missing* → *Market data key: Found / Missing*. *Coverage*, *gap*, *history depth*, *trading day* are unchanged (domain term is the display label). No domain term appears beside a label | STD-UI-1 v6; blueprint §7; AC-19 |
| Status tiers | Every download state and outcome renders as the single blueprint §8 tier with label and shape through the one tier function in `ui-components`: *Partial* warning, never good; *Cancelled by you* neutral, never critical; *Interrupted* serious | AC-20; STD-UI-12; system design constraint 4 |
| Components | Rebuilt from `ui-components` (the vendored design-system components) in place of the hand-built elements; the `data-table` `virtualised` variant for the coverage and followed-stock lists at 3000 rows, replacing the windowed rendering CAP-001 built by hand | AC-26; STD-UI-30; DEC-0205 |
| Entry hints | `/data/coverage?symbol={SYMBOL}` seeds the coverage filter (palette fallback target, *Needs fixing* symbol link); `/data/followed` opened with router state `{focusAdd: true}` focuses the add field (*Follow a different symbol*). Neither changes an action's outcome | System design §3.5 note 3 |
| Settings | Gains the *Open setup* link; the credential region's label becomes *Market data key*; otherwise CAP-001's history depth and credential presence, never the value | S02 §6; AC-4 |
| Shell | The CAP-001 shell and status region are replaced by `owner-shell`; the status region's facts are re-homed (DEC-0204). A download that completes while the owner is elsewhere still raises its `toast` (CAP-001 v5 §2) | AC-23; DEC-0204 |
| Internal links | Every in-screen link (run detail from a run row, coverage from an instrument, settings from a blocked Start) points at the new paths | AC-18 |

Everything else stands: the `blocked` Start reasons (*History depth is not set …*, *No instruments are named …*, reworded as *No stocks are followed. Follow stocks before downloading.*), the cancel confirmation and its wording, the retire confirmation now in blueprint §9's *Stop following {SYMBOL}?* wording, the honest empty states, the per-screen eight-state tables of CAP-001 v5 §1.1 to §1.5 (§12.4).

## 3. Interactions Required

Every action is tiered per blueprint §9 and STD-UI-19 (§12.3). Every error
names the operation, the resource and the reason and offers the recovery where
one exists; no code, payload key or `request_id` reaches the owner. Navigation
is a link, not a button, so middle-click and open-in-new-tab work (button spec
§1).

| Screen | User Action | Expected Outcome | Error / Edge Case |
|--------|-------------|------------------|-------------------|
| Shell | Open any path | The shell renders with the rail and top bar; `/` redirects to setup or Home after the first health answer (a skeleton main region until then); old paths redirect to new ones with the query kept | Health fails: the unreachable state in the main region with *Last answered {time}*; the routed screen returns at the same URL when health answers again, without a reload (AC-23). Unknown path: the not-found state inside the shell |
| Shell | Choose a rail destination | The screen mounts at its route; the top-bar title changes; the destination carries `aria-current="page"` | A destination whose screen has not shipped is absent, so nothing to choose (AC-1) |
| Shell | Read a count chip | Home shows the *Needs you* count, Data health the problem-stock count; both refresh on the attention cadence and are announced politely when they change | Zero: no chip (AC-16). Attention read failing: chips keep their last value with the stale time in their accessible name; the shell shows no error of its own |
| Palette | `⌘K` / `Ctrl+K` or the top-bar button | The `command` `dialog` opens with focus in the search; typing filters Pages and Universes locally and searches followed stocks on the server, debounced | Keystroke inside a text field: ignored (blueprint §3.4). Stock search fails: the Stocks group states the operation and reason; other groups usable. No match: `CommandEmpty` |
| Palette | Choose a stock | `/research/stocks/{symbol}` when registered, else `/data/coverage?symbol={symbol}`; the palette closes and focus returns to the opener | Research routes not registered: the coverage table filtered to the symbol (DEC-0207) |
| Palette | Choose a universe or a page | The route opens; focus returns to the opener | Universes group absent until CAP-002's routes are registered |
| Setup | Open `/setup` | Steps re-derived from the server; the first not-done step is current; focus on the step `h2` | API unreachable: shell state; credential presence `coverage-unknown`, never *Missing* |
| Setup step 1 | Read the credential presence | *Found* or *Missing*, never the value; when missing, the variable name and the restart note; Continue available | Nothing to enter here; a missing key is fixed outside the product (AC-4) |
| Setup step 2 | Enter years, Continue | `PUT /api/settings/history-depth`; the stepper summary reads *{y} years of history*; step 3 becomes current | `422`: field error naming the step and the reason (1 to 50 years), value kept. Save fails: field-level error, value kept (S02 §7) |
| Setup step 3 | Choose *Paste a list*, paste symbols | Parse on paste and blur: accepted count, duplicates and unreadable entries named, near-miss suggestions applicable by a button; the ranking warning below 30 accepted | Zero accepted: Continue `blocked` with *Paste at least one symbol, or choose Add later.* (S02 §7). Rejected entries never discard accepted ones (AC-5) |
| Setup step 3 | Continue | `POST /api/instruments` in batches of at most 1000; added and reactivated counted, server-rejected entries named; summary *{n} followed stocks*; step 4 current | `409` all already followed: treated as success. `422` all malformed: each named with its reason, nothing discarded. Batch failure mid-way: the entries not yet posted are named and kept in the textarea for a retry |
| Setup step 3 | Choose *Add later* | Setup ends; `/home` opens with its honest empty state; `/` keeps opening setup until a download is requested (DEC-0202) | None |
| Setup step 4 | **Start download** | `POST /api/acquisition-runs` `202`; `progress` *{done} of {total} stocks* every 10 s; *You can leave; this keeps running.*; `/` now opens Home (S02-6) | `queued_behind` set: *A download is running. This starts when it finishes.* `409` `history_depth_not_set` / `no_active_instruments`: the refusal names the operation, the reason and links to the step that fixes it. Key missing: the download starts and fails; Home shows the *Failed* download and the missing-key items (DEC-0203) |
| Setup | **← Back** | The previous step becomes current; every value entered in later steps is kept for the visit (AC-3; S02-2) | None |
| Home | Open `/home` | Header, data tile and *Needs you* from the shell's attention and summary reads; *checked {time}* | `latest_download` null: *No data has been downloaded yet.* with **Start setup** (AC-21). Summary `404`: score figures not determinable. Summary error: the score regions' error state with **Try again**. Attention error: the data tile and list bodies replaced by the operation, reason and **Try again**, header kept |
| Home | Press an item's action | Navigates to its target (§2.4 catalogue); nothing mutates (S01 §6) | The item is still present if its cause still holds on return; it leaves only when the cause is resolved (AC-9) |
| Home | Open the data tile | `/data` | None |
| Home | Wait | *Needs you* and the tile refresh on the attention cadence; a changed count is announced politely; focus never moves | Document hidden: polling pauses and resumes with an immediate read |
| Data health | Open `/data` | `GET /api/data-health` once; verdict, three check cards, *Needs fixing*, Recent downloads, What you follow | No download ever ended (attention `latest_terminal_download` absent): the AC-21 empty state, *Needs fixing* and Recent downloads still rendered when problems or downloads exist. `500`: per-card error with **Try again**. Factor scores not determinable until the summary is served |
| Data health | **Download now** (header or *Needs fixing*) | `POST /api/acquisition-runs`; the download heads Recent downloads with progress; the checks refresh once when it ends (routine, no confirmation) | `queued_behind` set: helper *A download is running. This starts when it finishes.* (AC-15). `409` `history_depth_not_set`: *Set how far back history should go first* linking to Settings; `no_active_instruments`: *Follow at least one stock first* linking to Followed stocks |
| Data health | **Stop following {SYMBOL}** (a *Not found* row) | `dialog` `confirm`: *Stop following {SYMBOL}? Its history is kept, and strategies holding it keep holding it. You can follow it again later.* (blueprint §9); confirm → `DELETE /api/instruments/{symbol}` `200`; the row leaves, the counts refresh, the change is announced politely | `409` already stopped or `404`: the refusal names the stock and the reason; the row refreshes. Cancel first in DOM order; the confirm is never the initial focus |
| Data health | **Follow a different symbol than {SYMBOL}** | `/data/followed` with the add field focused (two separate actions, D-9) | None |
| Data health | **Show more** in *Needs fixing* | The next 50 rows by keyset cursor appended; focus stays on the control | `422` bad cursor: the body states the operation and reason with **Try again** from the first page |
| Data health | Open **Full coverage table**, **Manage followed stocks**, a download row | `/data/coverage`, `/data/followed`, `/data/downloads/:id` | None |
| Data health | Wait while a download runs | Recent downloads re-reads on each 10 s tick; progress updates; when the download turns terminal the aggregate re-reads once | A download that ends *Partial* or *Interrupted* is shown as such, never as complete (AC-12; S09-1) |
| Taken-over screens | Every action CAP-001 accepted (follow and stop following, start and cancel a download, read coverage and gaps, diagnose a failure, set the depth, read the key presence) | The same outcome, confirmation and refusal as CAP-001 v5 §1.1 to §1.5, at the new paths and in the display vocabulary | Unchanged (AC-17) |
| Taken-over screens | Arrive at `/data/coverage?symbol=` or at `/data/followed` with `{focusAdd: true}` | The filter is seeded, or the add field focused | A symbol the filter does not match renders CAP-001's nothing-found state |
| Settings | **Open setup** | `/setup` with every step re-derived as done | None |

## 4. Suggested Components

> **Note:** This section applies only when a design system is configured in `projects/factorflow-v2/design-system.yaml`. One is, so this section names components that have a `design-spec.md` in `design-system/components/`.

Every component below was read from its specification. S01 §4, S02 §4 and S09
§4 fix the three screens' mappings; the rows reproduce them and extend them to
the shell, the palette and the taken-over screens. Nothing is proposed that
does not exist. The components are vendored into `web/src/components/ui/` as
shadcn/ui ships them (DEC-0205, PROVISIONAL as to the non-Radix npm packages).

| UI Pattern | Suggested Component | Variant | Design Spec Reference |
|------------|---------------------|---------|-----------------------|
| Rail count chips (Home, Data health) | `badge` | `status-warning` at `--text-xs`, the count as text (blueprint §2.1) | `design-system/components/badge/design-spec.md` |
| Download states and outcomes; check tiers; *Needs you* item tags; verdict tier; *Not found*; *Found* / *Missing*; score states | `badge` | `status-neutral` / `status-active` / `status-good` / `status-warning` / `status-serious` / `status-critical` per blueprint §8 and §12.2; always label plus shape | `design-system/components/badge/design-spec.md` |
| A check or figure that could not be determined: gap detection unavailable, Factor scores before the summary is served, market state inside session hours, credential presence while unreachable | `badge` | `coverage-unknown` *Not determinable*, never a dimmed absent | `design-system/components/badge/design-spec.md` |
| Parse result counts in setup step 3 | `badge` | `status-good` accepted count; `status-warning` per rejected or duplicate entry (S02 §4) | `design-system/components/badge/design-spec.md` |
| **Download now**, **Start download**, **Continue**, **Start setup**, **Start the first download** | `button` | `default`, at most one per region | `design-system/components/button/design-spec.md` |
| *Needs you* item actions; **Full coverage table**; **Follow a different symbol**; **Show more**; **Try again** | `button` | `outline` (navigating actions render as links styled as `outline`) | `design-system/components/button/design-spec.md` |
| **← Back**; in-row **Stop following** | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Continue with zero accepted symbols; CAP-001's Start with depth unset or no stocks followed | `button` | `blocked`, reason beside it through `aria-describedby`, focusable | `design-system/components/button/design-spec.md` |
| Palette opener in the top bar | `button` | `outline` with the shortcut as trailing text and an accessible name *Open the command palette* | `design-system/components/button/design-spec.md` |
| Home data tile; the three check cards | `card` | `metric` (S01 §4, S09 §4) | `design-system/components/card/design-spec.md` |
| *Needs you*; *Needs fixing*; Recent downloads; the setup step card; the not-found and unreachable states | `card` | `default` | `design-system/components/card/design-spec.md` |
| What you follow; Settings regions | `card` | `summary` (S09 §4) | `design-system/components/card/design-spec.md` |
| Recent downloads (five rows, no selection, no row actions) | `data-table` | `compact` with `history` semantics (S09 §4) | `design-system/components/data-table/design-spec.md` |
| Coverage and followed-stock lists at the committed 3000 rows | `data-table` | `virtualised` (STD-UI-30; blueprint §13) | `design-system/components/data-table/design-spec.md` |
| Downloads list; download detail's per-stock results | `data-table` | `history`; CAP-001's `expandable` where v5 uses it | `design-system/components/data-table/design-spec.md` |
| Stop following; cancel a download | `dialog` | `confirm`, never `destructive` (blueprint §9; STD-UI-2) | `design-system/components/dialog/design-spec.md` |
| History depth in setup step 2 and Settings | `input` | `numeric` with the *years* suffix (S02 §4) | `design-system/components/input/design-spec.md` |
| Setup steps 2 and 3, Settings, the add field on Followed stocks | `form` | `stacked` (the field owns label, description and error; CAP-001 v5) | `design-system/components/form/design-spec.md` |
| Pasted symbols in setup step 3 and on Followed stocks | `textarea` | `list` (S02 §4) | `design-system/components/textarea/design-spec.md` |
| Source choice in setup step 3 (*Paste a list* / *Add later*) | `radio-group` | `cards`, two options in M1 (S02 §4) | `design-system/components/radio-group/design-spec.md` |
| Download progress in setup step 4, Recent downloads and the download detail | `progress` | `determinate` *{done} of {total} stocks*; `indeterminate` only while `total` is unknown, never an estimate | `design-system/components/progress/design-spec.md` |
| Setup step list | `stepper` | `vertical`, done steps as links (S02 §4) | `design-system/components/stepper/design-spec.md` |
| Command palette | `command` | `dialog` (blueprint §3.4) | `design-system/components/command/design-spec.md` |
| A download that completes while the owner is on another screen (CAP-001 v5 §2, kept) | `toast` | `success` / `warning` / `error` by outcome; `info` never used for a result already visible | `design-system/components/toast/design-spec.md` |
| CAP-001 row-level filters and page-size controls on the taken-over screens | `select` | `inline` where CAP-001 v5 uses it | `design-system/components/select/design-spec.md` |
| CAP-001 row selection and filters where v5 uses them | `checkbox` | `default`, under the table's contract | `design-system/components/checkbox/design-spec.md` |

**Compositions, not components** (blueprint §4; `design-system/intake.md` step
1.3), built once in `web/src/components/patterns/` and in `web/src/app/`, and
named so the UX design and the component designs use one name each: the shell
(rail, top bar, unreachable and not-found states; `web/src/app/`); the count
chip (a `badge` inside a rail item); the *Needs you* item and `sortAttention`
(blueprint §4.1); the as-of line (blueprint §4.8; `AsOfLine` in `patterns/as-of-line.tsx`, which
CAP-002 lands first specialised to Research and CAP-003's `ui-components` takes
over and generalises, the Research line composing it; owner decision
2026-10-25); the status badge with the
one tier function (blueprint §8; system design constraint 4); `worstDataTier`
(DEC-0210); the state-coverage region that renders STD-UI-23's eight states
around a body (blueprint §4.10); the check card (a `card` `metric` with a tier
`badge`, a result line and an as-of line); the problem row (a `badge`, text and
the row's own actions); the setup step card (S02 §3).

**Components deliberately not proposed.** `chart` (no chart in M1; capability
§5.4 records STD-UI-9, STD-UI-27 and STD-UI-28 as not applicable; S01's
sparklines belong to the strategy list, M2). `tabs` (no region has independent
views; the environment tabs are S08's). `toggle-group` (M2 and later). `button`
`kill-switch` and `badge` `paper` / `real-money` (no order path, D-7). `dialog`
`destructive` and `real-money` (nothing is deleted; nothing is traded). `input`
`currency` / `percentage` (no money figure, no rate). `radio-group` `default`
(the step-3 choice frames the step, so `cards`). `progress` `meter` (no bounded
capacity is shown in M1). `select` `grouped`, `data-table` `ranking` and
`holdings` (nothing ranked or held).

**No COMPONENT-SPEC-GAP.** Every element maps to an existing component or a
composition. S02 §11's native `input type="file"` for *Upload a CSV* would have
been a gap; the option is not built in M1 (OQ-3), and a yes from the owner
routes a `file-input` through `design-system/intake.md`.

## 5. Constraints

- **STD-UI v6 governs every surface here, and the blueprint discharges much of
  it.** Where this brief and the standard disagree, the standard wins; a
  capability may be stricter than a rule but never looser (STD-UI §1.1). §12
  records conformance rule by rule and mirrors `Capability-CAP-003.md` §5.4,
  with which it agrees on every row.
- **The blueprint's shell, patterns, status map and action tiers are inherited,
  not restated** (blueprint §0): page ground `hsl(var(--muted) / 0.5)`, content
  on `card`s, main padding `--space-5`, reading screens at 1180 px, tables at
  full width, the §4 patterns, the §7 labels, the §8 tiers, the §9 tiers for
  this capability's actions. No screen restyles a shared pattern, and this
  capability builds the shared ones once (capability §5.3).
- **M1 subtraction, not placeholders.** The kill switch, the environment region,
  the trading-stopped banner, setup step 5, the Live prices card, the broker
  row, the schedule line, the paper and live tiles, the strategy list, *+ New
  strategy*, *next rebalance*, the palette's Actions group and the Strategies
  and Portfolio destinations are absent, and no disabled control or empty slot
  stands in for them (AC-1, AC-10; S01-7; system design constraints 11 and 14).
- **Only shipped destinations, decided in code.** The rail, the palette's Pages
  group and the route map list a destination only in the change that registers
  its screen; no runtime feature detection (DEC-0204; AC-1). CAP-002's
  `/research` routes are unchanged and reachable whichever capability lands
  first (AC-27; OQ-2).
- **Display labels, never domain terms, in user-visible text** (STD-UI-1 v6;
  blueprint §7; AC-19), including every string on the five taken-over screens
  (§2.6). The new API responses keep the domain vocabulary and carry no sentence
  and no tier; every sentence is composed in the interface (DEC-0200; system
  design constraint 3).
- **One tier per status, label plus shape, never colour alone** (AC-20; STD-UI-8,
  STD-UI-12): one tier function in `ui-components` for download states and
  outcomes, result outcomes, check results and score states (system design
  constraint 4), and one `worstDataTier` for the verdict, which Home's data
  tile also calls before taking the worse of it and the score-state tier
  (DEC-0210, as the owner amended it on 2026-10-25).
- **Not determinable is a value of its own** (STD-UI-4, STD-UI-14; system design
  constraint 5): a check that could not run, score figures before the summary is
  served, the market state inside session hours and credential presence while
  unreachable render as `coverage-unknown` with a reason, never as passed, zero,
  *Missing* or blank.
- **A partial or interrupted download is never complete** (AC-12; STD-UI-15):
  run states render from the recorded state only; a check built on one shows
  its exceptions.
- **Nothing is asserted beyond what is recorded** (capability §5.3; STD-UI-15):
  no provider read, no trading calendar, no stored setup flag, no browser
  storage (DEC-0202, DEC-0206; system design §4.4).
- **Setup completes when the first download is requested, not finished**
  (DEC-0202; S02 §6; capability assumption 4); only `/` redirects on it;
  *Add later* stores nothing.
- **Setup step 3 pastes a list; CSV upload is not built** (capability §2, AC-5;
  OQ-3); the `radio-group` `cards` has two options and the departure from S02 §3
  is recorded in §9.
- **Device target: desktop browser, keyboard first, ≥ 1280 px design width**
  (blueprint §3.1; capability §5.3). Between 1024 and 1279 px nothing on these
  screens moves (no side panel); below 768 px the rail stacks and the top bar
  wraps, and nothing is unreachable. No touch target is stated in any source.
- **No authentication, no account, no user menu** (capability §5.3; system
  design constraint 9; the `SEC-ENC-001 host-local loopback exception` under
  DEC-0050 as extended by DEC-0208).
- **One owner-operator** (charter §2; tech stack C8). No per-user state anywhere.
- **The interface learns everything by polling, and every cadence is recorded**
  (STD-UI-25; system design constraint 8): health 30 s; attention and summary
  60 s, 10 s while a download is non-terminal or a set is building; Recent
  downloads on each 10 s tick while a download runs; the data-health aggregate
  on demand and once when a download ends; all paused while the document is
  hidden; every polled region shows *checked {time}*.
- **Volume: up to 3000 followed stocks** (CAP-001 AC-4; STD-UI-30): aggregates
  are computed on the server (DEC-0200); *Needs fixing* pages by keyset at 50
  rows, bounded at 500; the coverage and followed-stock lists are `data-table`
  `virtualised` with search and filter; the palette's Stocks group reads at
  most 8 server-filtered results; the Universes group is read once per open.
- **Dates are ISO-8601 and timestamps carry America/Chicago** (STD-UI-5;
  blueprint §4.8): Home's `h1` is *{Weekday}, {YYYY-MM-DD}* (DEC-0209);
  `prices_as_of`, `latest_session` and every session date are unconverted;
  `checked_at`, `ended_at`, `as_of` (fundamentals) and the download's start
  time carry the zone. A download is named by its start time until OQ-1 is
  answered (system design assumption 5; CAP-002's DEC-0083).
- **Every action is routine or consequential; none is capital-at-risk or
  destructive** (STD-UI-19, STD-UI-22; §12.3). *Stop following* keeps history
  and its confirmation says so (STD-UI-2).
- **Every error has three parts and a recovery** (STD-UI-19): the operation,
  the stock or download, the reason; `request_id` and envelope codes select
  wording and are never shown.
- **Built from the design system, tokens only** (AC-26; STD-UI-29): no spacing,
  size or colour literal outside `theme.css`, except the approved-specification
  layout widths (208 px, 1180 px, 260 to 300 px, 28 px, 16 px, 70ch), which are
  not new tokens and are held in one layout-constants module in `owner-shell`,
  `web/src/app/layout.ts`, as AC-26, narrowed by the owner on 2026-10-25,
  permits; the page-ground alpha is the v5 A-5 case; the density tier is inherited pending OQ-UI-4. The non-Radix
  packages the vendored components import (`cmdk`, `sonner`, `clsx`,
  `tailwind-merge`, `class-variance-authority`, `lucide-react`) are PROVISIONAL
  until the owner's `$tech-stack` confirmation (DEC-0205; OQ-4), and no story
  adds them before it.
- **Accessibility is enforced by review, not tooling** (STD-UI-24;
  `tech-stack.md`: Biome has no `jsx-a11y` equivalent).
- **Delivered tests change with the routes and labels** (blueprint §2.2;
  system design constraint 15); design decomposition enumerates every delivered
  file this capability edits (system design open question 8).

## 6. Accessibility Requirements

S01 §9, S02 §9 and S09 §9 fix the three screens' semantics; the shell, the
palette and the taken-over screens follow the same rules, and CAP-001 v5's
per-screen accessibility sections stand for the latter.

- **WCAG level or target:** WCAG 2.1 AA, the project target under STD-UI-24.
  Screen-reader certification is not a release gate (STD-UI §2.3); the
  semantics below are mandatory.
- **Landmarks and names:** the rail is a `nav` labelled *Main*; each rail item
  is a link whose accessible name includes its count (*Data health, 3 stocks
  with problems*); the current item carries `aria-current="page"`. The top bar
  is a `banner` with the title as its first text. Every screen has one `main`
  with one `h1`; each card is a `section` labelled by its `h2` (S01 §9, S09
  §9). The setup step list is a `nav` labelled *Setup steps* with
  `aria-current="step"` on the current step; the step card is a `section`
  labelled by its `h2`, and focus moves to that `h2` when the step changes
  (S02 §9). The palette is a Radix `Dialog` with its title *Command palette*
  and the cmdk listbox semantics; it traps focus, closes on `Esc` and returns
  focus to the opener. The unreachable and not-found states are `section`s
  with `role="status"` text so the change is announced.
- **Keyboard navigation needs:** every operation completable by keyboard
  (STD-UI-24, AC-25): the shortcut `⌘K` / `Ctrl+K` outside text fields, the
  rail and every link by `Tab` and `Enter`, the stepper's done steps as links,
  the `radio-group` by arrow keys, `textarea` paste and the suggestion buttons,
  `input` `numeric` with arrow stepping, **Continue** and **← Back**, **Start
  download**, **Download now**, **Show more**, the `dialog` `confirm` with
  cancel first in DOM order and the confirm never the initial focus, the
  taken-over screens' operations as CAP-001 v5 specifies. `button` `blocked`
  is used for every precondition-gated action (zero accepted symbols; CAP-001's
  Start) because it stays focusable and exposes its reason through
  `aria-describedby`. Visible focus is never suppressed; the main region's
  content, not the rail, receives focus after a route change.
- **Tables:** Recent downloads carries the start time as its row header and
  column headers for outcome, span and result; the download detail and the
  coverage and followed-stock tables keep CAP-001 v5's row and column headers,
  `aria-sort` and in-row action names (*Stop following AAPL*).
- **Items, rows and badges:** the *Needs you* severity tile is `aria-hidden`
  and the tag badge carries the tier in words (S01 §9); each item is a list
  item with its one action named for the item (*Fix data for KO, TSLA and
  FBXX*). Problem rows are list items; each action's accessible name includes
  the symbol (*Stop following FBXX*, *Follow a different symbol than FBXX*)
  (S09 §9). Every status and coverage badge carries its words and shape, so
  the greyscale rendering is the test (STD-UI-8). The count chip's text is its
  accessible name.
- **Polled and replaced content:** a changed *Needs you* count, a changed rail
  chip, a download turning terminal, a verdict refresh and the parse result in
  setup step 3 (a polite live region tied to the textarea by
  `aria-describedby`, S02 §9) announce politely and never move focus (S01 §6,
  S09 §9). *checked {time}* is text, not only a tooltip. The unreachable state
  is announced once on entry and once on recovery.
- **Progress:** `progress` `determinate` is a `progressbar` paired with the
  visible text *{done} of {total} stocks*; the bar is never the only carrier.
- **Contrast:** text at 4.5:1, large text and interactive boundaries at 3:1
  (STD-UI-24), as recorded for the status tiers and `coverage-unknown` in
  `design-system/theme-validation.md`; the as-of line in
  `--muted-foreground` on a card must meet 4.5:1; the count chip at
  `--text-xs` on the rail ground must meet 4.5:1 and is checked, not assumed.
- **Touch / mobile requirements:** none stated in any source. Control targets
  follow the component specifications, at least 24 by 24 CSS pixels
  (`--control-min-target`). Below 768 px nothing is unreachable (blueprint
  §3.1).
- **Colour-not-solo-state requirements:** mandatory under STD-UI-8 and
  load-bearing on every screen: download outcomes, check tiers, item tiers,
  the verdict and *Found* / *Missing* each carry a label and a tier shape;
  *Not determinable* carries `--pattern-indeterminate` and its words so it
  never reads as a milder absent; the market state is text. No colour encodes
  direction (no signed figure exists in M1).
- **Credential:** the key's value never appears in any state, name, tooltip or
  error (AC-4; S02-4; S09-4).

## 7. Component Library References

> **Note:** This section applies only when a design system is configured. Omit when no design system is available.

| Component | Slug | Design Spec Path |
|-----------|------|------------------|
| Badge | `badge` | `design-system/components/badge/design-spec.md` |
| Button | `button` | `design-system/components/button/design-spec.md` |
| Card | `card` | `design-system/components/card/design-spec.md` |
| Checkbox | `checkbox` | `design-system/components/checkbox/design-spec.md` |
| Command | `command` | `design-system/components/command/design-spec.md` |
| Data Table | `data-table` | `design-system/components/data-table/design-spec.md` |
| Dialog | `dialog` | `design-system/components/dialog/design-spec.md` |
| Form | `form` | `design-system/components/form/design-spec.md` |
| Input | `input` | `design-system/components/input/design-spec.md` |
| Progress | `progress` | `design-system/components/progress/design-spec.md` |
| Radio Group | `radio-group` | `design-system/components/radio-group/design-spec.md` |
| Select | `select` | `design-system/components/select/design-spec.md` |
| Stepper | `stepper` | `design-system/components/stepper/design-spec.md` |
| Textarea | `textarea` | `design-system/components/textarea/design-spec.md` |
| Toast | `toast` | `design-system/components/toast/design-spec.md` |

Fifteen of the eighteen components are referenced; `chart`, `tabs` and
`toggle-group` are not, for the reasons in §4. `command`, `stepper`,
`progress`, `radio-group` and `checkbox` are `status: beta` and this capability
is their first consumer; so is `textarea`. No Figma node IDs exist:
`design-system/component-map.json` carries a null `figma_file_key` and an empty
component map, so Path A's Figma route has no design source to extract from;
the canvas sources for the three new screens are
`docs/ux/design-source/P01-Home.dc.html`, `P02-Setup.dc.html` and
`P09-Data.dc.html`, and the specification wins where they disagree (S01 §11,
S02 §11, S09 §11). The automated Path B is unaffected.

## 8. EDG Compliance Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Consistency with product patterns | pass | CAP-003 builds the blueprint's shell, patterns and three M1 screens as approved and restyles CAP-001's five screens into them with the §7 labels, §8 status map and §9 tiers; it adds no destination the blueprint does not name. Departures from the approved screens are three, each recorded with its reason: Home's `h1` date (DEC-0209, STD-UI-5 wins), the M1 verdict sentence without strategies (DEC-0210, STD-UI-2), and setup step 3 without *Upload a CSV* (capability scope; OQ-3). The *Needs you* catalogue extends S01 §8's one data item to five kinds (DEC-0203), each in the §4.1 shape |
| Progressive disclosure | pass | Blueprint principle 4: Home shows the topmost item and one tile; Data health shows a verdict, then three cards, then only the rows that need fixing; the coverage table, the followed list and the download detail are one click away. The palette reaches any page without adding navigation. Setup shows one step at a time with the whole path visible |
| Error clarity | pass | Every refusal in §3 names the operation, the stock or download and the reason, and offers the recovery: the step to fix in setup, Settings or Followed stocks for a refused download, **Try again** for a failed read, *Download again* or *Stop following* per problem row. A not-found symbol says downloading again won't help. No code, `request_id`, payload key or implementation word reaches the owner (STD-UI-1, STD-UI-19) |
| Accessibility | pass | WCAG 2.1 AA per STD-UI-24, specified in §6 against each operation and in S01 §9, S02 §9, S09 §9; Radix primitives carry the dialog, radio and command contracts; `blocked` instead of `disabled` everywhere a precondition gates an action. Enforcement is human review, which the standard acknowledges |
| States and feedback (empty, loading, error, success, partial) | pass | All five, plus the three more STD-UI-23 requires, enumerated per region in §12.4, starting from S01 §7, S02 §7 and S09 §7. Never-populated (*No data has been downloaded yet*) and nothing-found (*Nothing needs you right now*, *Nothing needs fixing*) are distinct everywhere both can occur (AC-21, AC-24); stale is a marked state where it can be detected (*Not reflecting the latest download*), and the check cards state the currency they cannot judge; unavailable is `coverage-unknown` with a reason; progress shows *{done} of {total}*; a download that completes while the owner is elsewhere raises a `toast`, and an effect the owner can see (a row leaving) is announced politely rather than toasted |

**Intentional departures from `edg-compliance`, recorded so a reviewer does not
raise them.** STD-UI §1.2 declares them: six severity tiers reconciled to EDG's
three levels (STD-UI-12); the kill switch without confirmation (STD-UI-21),
which this capability does not deliver; screen-reader certification exempt as
a gate with semantics mandatory. Of STD-UI §2.3's four scope exemptions, the
ones engaged here are error codes (the envelope's `code` selects wording and
is never shown) and "no new top-level navigation without EDG review": the rail
this capability delivers is the blueprint's approved navigation, not a new
item.

## 9. Open Questions

Decisions this brief made are not listed here; they are DEC-0209 and
DEC-0210, and the ones it applies are DEC-0200 to DEC-0208, cited where they
apply. What follows is what no artifact derives, carried for the owner, and
what the UX design needs to know is still open. Nothing was abstained in this
run.

- **OQ-1, carried: do downloads get a short visible number?** `[REQUIRES
  INPUT: whether downloads gain a short number, and its format]`. Until then
  every surface here names a download by its start time in America/Chicago:
  setup step 4's progress line, Home's items, Recent downloads, the download
  detail's title and the top-bar breadcrumb (system design assumption 5;
  CAP-002's DEC-0083). *Owner: capability owner. Blocks: copy in the UX design,
  not its layout.*
- **OQ-2, carried: which lands first, this shell or CAP-002's Research
  screens?** DEC-0204 and DEC-0207 make either order work; the UX design's
  composition section states the rail with and without Research and the
  palette's Universes group present or absent. *Owner: capability owner
  (sequencing). Blocks: nothing in this brief.*
- **OQ-3, carried: is uploading a CSV an M1 way to name stocks?** `[REQUIRES
  INPUT: whether CSV upload is in M1]`. This brief specifies two options in
  step 3's `radio-group` `cards`; a yes adds the third option, a criterion to
  the capability and a `file-input` through `design-system/intake.md` (S02
  §11). *Owner: capability owner. Blocks: one control in the UX design.*
- **OQ-4, carried: the npm packages the vendored components import.**
  DEC-0205 specifies them provisionally; only the owner amends
  `tech-stack.md`. *Owner: capability owner via `$tech-stack`. Blocks: the
  implementing stories, not the UX design.*
- **DEC-0209 awaits the owner's verdict; DEC-0210 was reviewed and upheld as
  amended on 2026-10-25, and §2.5 carries the amended rule.** The `h1` date departs
  from an approved screen specification on the standard's own precedence, and
  the verdict's tier function and M1 wording rest on a derivation. If the
  owner prefers S01's long date, the fix is an amendment to STD-UI-5 (one-way,
  the owner's); if the owner wants the verdict worded or tiered differently,
  the UX design changes copy and one function.
- **Copy the UX design finalises** (shapes fixed here, words suggested):
  the five *Needs you* item titles and bodies (§2.4), the check cards' result
  lines (§2.5), the not-found state, the palette placeholder and empty text.
  Every string must use the display labels (AC-19) and name no behaviour the
  product does not have (STD-UI-2).
- **Carried from the system design §8, not re-decided here:** the other
  design's consumer name (question 5), the research screens' `/runs/:runId`
  links (6), the latency target for `GET /api/data-health` (7, answered
  2026-10-25: AC-28), the delivered
  file and test edit list (8), a trading calendar (9), and the promotion of
  DEC-0203 and DEC-0204 to a `decision-record` constitution artifact (10).
- **Which density tier is the default?** STD-UI OQ-UI-4, inherited as CAP-001
  and CAP-002 did.
- **Does M1 expose a way to switch to the dark theme?** STD-UI OQ-UI-2; the
  tokens exist and the shell is where a switch would live. Not decided here;
  the UX design assumes the light theme only.

## 10. Source Documents

| Document | Path | Key Findings |
|----------|------|--------------|
| Capability CAP-003 v1 (draft) | `docs/capabilities/CAP-003-app-shell-and-data-health/Capability-CAP-003.md` | 28 acceptance criteria (AC-28 added 2026-10-25); scope (shell, setup, Home, Data health, five screens taken over, redirects, palette, interim rail replaced, built from the design system); out of scope (kill switch, step 5, schedules, Live prices, scoped retry, any CAP-001 change); five user flows; §5.1 dependencies on CAP-001 and CAP-002's summary; §5.3 constraints; §5.4 STD-UI conformance, delegating the narrative to this brief; assumptions 1 to 4; OQ-1 to OQ-4 |
| System design CAP-003 v1 (draft, 09410b0) | `docs/capabilities/CAP-003-app-shell-and-data-health/design/system-design.md` | `ui_facing: true`; eight components and their interfaces (`GET /api/attention`, `GET /api/data-health`, `GET /api/data-health/problems`, the shell context, screen registration); control flows §3.1 to §3.5 with every state source and cadence; constraints 1 to 15; assumptions 1 to 7; traceability; open questions 1 to 10; DEC-0200 to DEC-0208 applied here |
| Product UX blueprint `PRODUCT-UX` v6 (approved 2026-10-16) | `docs/ux/product-ux-blueprint.md` | §0 how a brief uses it; principles 4, 5, 7, 8; §2.1 rail and count chips; §2.2 routes, `/` redirect and legacy redirects; §3.1 layout and responsive rules; §3.4 palette; §3.5 shell states; §4.1 Needs-you item, §4.8 as-of line, §4.10 state renderings; §6 first-run and data-problem flows; §7 vocabulary; §8 status map; §9 action tiers and confirm wording; §10 the M1 row claimed in §1; §11 product-level conformance cited in §12; §12 D-2, D-7, D-8, D-9; §13 the six new component specs |
| Home `PRODUCT-UX-S01` v4 (approved) | `docs/ux/screens/S01-home.md` | M1 regions (§2); layout, mapping, view model (§3 to §5); interactions and 60 s polling (§6); states (§7); copy (§8, departed from on the `h1` date, DEC-0209); accessibility (§9); S01-3, S01-4, S01-6, S01-7 |
| Setup `PRODUCT-UX-S02` v4 (approved) | `docs/ux/screens/S02-setup.md` | Steps 1 to 4 in M1 (§2); two-column layout and step content (§3); mapping (§4); interactions incl. parse rules, the 30-stock warning, completion on the first started download, reopen from Settings (§6); states (§7); copy (§8); accessibility (§9); S02-1 to S02-6; §11 the CSV file control not built here |
| Data health `PRODUCT-UX-S09` v4 (approved) | `docs/ux/screens/S09-data-health.md` | M1 regions (§2); layout (§3); mapping (§4); view model (§5, the verdict and problems fields this brief composes in the interface); interactions (§6); states (§7); copy (§8); accessibility (§9); S09-1 to S09-5; §11 the M1 sub-line and the *Incomplete* wording |
| STD-UI v6 (approved) | `docs/constitution/standards/ui-conventions.md` | Thirty rules; §1.1 precedence (applied in DEC-0209); §1.2 and §2.3 departures and exemptions; §4 conformance record required in the UX brief (§12); STD-UI-1 display labels and permitted specialization; STD-UI-5; STD-UI-12 tiers and run mapping; STD-UI-14; STD-UI-23 eight states; STD-UI-24; STD-UI-25; STD-UI-26; STD-UI-30 |
| CAP-001 UX design v5 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-design.md` | §0 the delivered shell and status region this capability replaces; §1.1 to §1.5 the five screens taken over, their components, states and `blocked` reasons; §2 the unreachable state wording kept here and the completion `toast`; the credential region's presence-only rule |
| CAP-002 UX brief v3 (approved) | `docs/capabilities/CAP-002-universe-and-factor-classification/design/ux-brief.md` | The conformance record shape this brief mirrors (§12); the interim rail entry this shell replaces (DEC-0069); a download named by its start time (DEC-0083); the restyled-page delta pattern reused in §2.6 |
| Design system (as of 2026-10-15) | `design-system/README.md`, `design-system/components/*/design-spec.md`, `design-system/theme.css`, `design-system/component-map.json`, `design-system/intake.md` | 18 specifications read, 15 used; `badge` tiers always carry label and icon, `coverage-unknown` never a dimmed absent; `button` `blocked` and no real-money button; `card` `metric` and `summary`; `data-table` `compact`, `history`, `virtualised`; `dialog` `confirm`; `radio-group` `cards` for two or three options; `progress` `determinate` paired with text; `stepper` `vertical` with done steps as links; `command` `dialog` on cmdk; `toast` never for a visible result; compositions belong in the UX design |
| UX pipeline note | `docs/ux/README.md` | A capability's UX brief cites `PRODUCT-UX`, claims its rows from §10 and records only what it adds or specializes; the UX design starts from the matching screen spec |
| Product charter v2 | `docs/constitution/product-charter.md` | One owner-operator, no separation of duties, no subscribers; the Owner Interface as a building block; M1 2026-Q4 |
| Tech stack v5 | `docs/constitution/tech-stack.md` | React 18, Vite, `react-router-dom`, Tailwind bound to the theme, `shadcn/ui` on Radix (OQ-TS-6); Biome has no `jsx-a11y` equivalent; C8 one owner; Massive has no historical calendar |
| EDG compliance skill | `.agents/skills/edg-compliance/SKILL.md` (harness repository) | Advisory beneath STD-UI per STD-UI §1.2; checklist applied in §8 |
| Decision records applied | `projects/factorflow-v2/decisions/DEC-0200.md` to `DEC-0208.md` (harness repository) | Server-side aggregates and interface-composed sentences (0188); the problem definition, M1 consequence and check derivations (0189); setup completion and *Add later* (0190); the five Needs-you kinds (0191); the shell layout, static destinations and the retired status region (0192); vendored components and provisional packages (0193); market state (0194); palette groups and targets (0195); loopback exception (0196) |
| Decision records written by this brief | `projects/factorflow-v2/decisions/DEC-0209.md`, `DEC-0210.md` (harness repository) | Home's `h1` renders the weekday and the ISO-8601 date, STD-UI-5 winning over S01 §8 (`contradiction`, high); the verdict and the data tile share `worstDataTier` and the M1 verdict names Incomplete scores, not strategies (`provisional`, medium) |

## 11. Readiness Assessment

**Readiness Score: 85/100**

Ready for either path. Every screen starts from an approved specification with
its own acceptance checks (S01, S02, S09) or from a delivered design (CAP-001
v5 §1.1 to §1.5), so the UX design has little to invent: eight screens and two
shell surfaces cover all 27 interface-facing acceptance criteria (AC-28, the aggregate's latency bound, is traced by data-health-reader and data-health-api), every read the system design
declares (three new, fourteen reused, two from CAP-002) has a consumer named in
§2 and §3, and no region depends on a read that does not exist. Every
component proposed was read from its specification; fifteen of eighteen are
used, six of them for the first time, and no COMPONENT-SPEC-GAP remains. The
compositions are named with their home in `web/src/components/patterns/` and
`web/src/app/`. §12 carries the STD-UI conformance record the capability's
§5.4 delegates here, and the two agree on every row.

What this brief adds beyond its sources: the M1 subtraction of every unshipped
region stated as absence, not placeholder; the shell's static destination list,
titles and states as the UX design will draw them; the *Needs you* catalogue
in the §4.1 shape with suggested copy for all five kinds; the composition of
the verdict, the three check cards and the problem rows from the fields the
new reads return; the delta table for the five taken-over screens, so the UX
design restates nothing CAP-001 settled; and the eight-state enumeration for
every region.

Eleven positions rest on recorded agent decisions rather than approved
artifacts, nine from the system design and two from this brief; the owner
upholds or reverts each. Three depart from approved screen specifications
(DEC-0209, DEC-0210, and step 3 without CSV upload) and are recorded, not
hidden. Nothing was abstained.

The fifteen points withheld are for what no brief can supply: two product
questions the owner has not answered (OQ-1, OQ-3) change copy and one
control; the capability and system design this brief reads are drafts and
specification review has not seen any of the three; the `worstDataTier`
derivation and the five-kind catalogue have not been seen rendered by the
owner; and the shell this capability delivers takes over screens whose
delivered tests change with it, which design decomposition has yet to
enumerate.

## 12. STD-UI Conformance Record

STD-UI §4 requires a conforming capability to record four things in its UX
brief: which rules its surfaces engage, which do not apply and why, where each
applicable rule is satisfied, and each local specialization. Silence is not a
record. This record is against **STD-UI v6**; `Capability-CAP-003.md` §5.4 is
the machine-checked mirror, written against the same version, and this record
agrees with it on every row. Blueprint §11 says where the blueprint already
discharges a rule product-wide and is cited where it does.

### 12.1 Rule-by-rule

| Rule | Applies | Where satisfied, or why not |
|------|---------|------------------------------|
| STD-UI-1 Product vocabulary | yes | Blueprint §11 and §7. Every user-visible string in §2 and §3 uses the v6 display labels, including the five taken-over screens (§2.6); the API keeps the domain terms (DEC-0200). **Specialization (permitted):** CAP-003 adds two concepts with their domain term and display label, redefining none: the provider credential (`credential_present`, `FACTORFLOW_MASSIVE_API_KEY`) is displayed as *market data key*, *Found* / *Missing*, replacing CAP-001 v5's *Provider credential supplied / missing*; a followed stock whose latest recorded outcome for any data type is `failed` or `not_found` (DEC-0201) is displayed as *a stock with a problem* / *needs attention*, and the region as *Needs fixing*. Capability §5.4: `yes`, agrees |
| STD-UI-2 Words describe behaviour | yes | Blueprint §11 (§9 confirmation wording). *Stop following* keeps history and the dialog says so; **Download now** describes a full download, not a scoped retry (D-9); the M1 verdict and problem rows name *Incomplete* scores, not strategies that do not exist (DEC-0210, DEC-0201); a not-found row says downloading again won't help. Capability §5.4: `yes`, agrees |
| STD-UI-3 Comparable figures | yes | Blueprint §11. Counts and as-of figures in `--font-numeric` with precision fixed per region (whole counts, dates and times); the taken-over tables keep CAP-001 v5's alignment. Capability §5.4: `yes`, agrees |
| STD-UI-4 Missing is not zero | yes | Blueprint §11. §2.4, §2.5, §5: a count that cannot be determined (current stocks before the summary is served) renders an explicit marker, never zero; a check that could not run is `coverage-unknown`; the verdict's problem count is a measured count; blank only where a column does not apply. Capability §5.4: `yes`, agrees |
| STD-UI-5 Dates and timestamps | yes | Blueprint §11 and §4.8. §5: ISO-8601 dates, the `h1` included (DEC-0209); America/Chicago with the zone on every timestamp; session dates unconverted; a download named by its start time with the zone. Capability §5.4: `yes`, agrees |
| STD-UI-6 No abbreviation where compared | no | No money or market-capitalisation figure is compared on these screens; CAP-001's tables are taken over unchanged. Capability §5.4: `no`, agrees |
| STD-UI-7 One job per palette | yes | Blueprint §11. Status tiers for downloads, checks, items and the verdict; no direction, magnitude or environment colour is used in M1 (AC-20). Capability §5.4: `yes`, agrees |
| STD-UI-8 Colour never the sole carrier | yes | Blueprint §11 and §8. §6: every status carries its label and tier shape; the count chip is text; *Not determinable* carries its pattern and words; the greyscale rendering is the test (AC-16, AC-20). Capability §5.4: `yes`, agrees |
| STD-UI-9 Colour follows the entity | no | No chart and no per-entity series in M1; S01's sparklines belong to the strategy list (M2). Capability §5.4: `no`, agrees |
| STD-UI-10 Palettes validated, not judged | no, for this capability | Binds the shared theme; satisfied there by `design-system/theme-validation.md`; no token is added (blueprint §13). Capability §5.4: `no`, agrees |
| STD-UI-11 Paper and live distinguishable | no | No paper or live environment exists in M1; the environment region ships with paper trading (D-7). Neither `--risk-*` token is used. Capability §5.4: `no`, agrees |
| STD-UI-12 Status form and severity | yes | Blueprint §11 and §8. Every download outcome, check result, score state, item and stock state maps to one tier through one function (system design constraint 4); §12.2 carries the table. **Specialization (permitted):** CAP-003 adds the check-card states *No missing prices or gaps* and *All financials present* (good), the verdict's tiers (DEC-0210) and the item tiers of DEC-0203, each mapped to an existing tier; no tier is added. The v5 trading-state rows are not CAP-003's. Capability §5.4: `yes`, agrees |
| STD-UI-13 Every value carries its as-of date | yes | Blueprint §11 and §4.8. §2.4, §2.5: the data tile's score and price as-of (S01-6), each check card's as-of, *checked {time}* on every polled region, Recent downloads' start and end (AC-8, AC-11). Capability §5.4: `yes`, agrees |
| STD-UI-14 Presence has three states | yes | Blueprint §11. §2.3 to §2.5, §5: credential presence *Found* / *Missing* / not determinable; each check `ok` / exceptions / `not_determinable`; the Factor scores card and score figures not determinable before the summary is served; the market state inside session hours; the third never renders as the second and never as zero (AC-8, AC-11, AC-24). Capability §5.4: `yes`, agrees |
| STD-UI-15 Nothing asserted beyond derived | yes | Blueprint §11. §5: only recorded outcomes are shown; a partial download is never complete (AC-12); no trading calendar, provider read or setup flag is invented (DEC-0202, DEC-0206). Capability §5.4: `yes`, agrees |
| STD-UI-16 No silent substitution | yes | Blueprint §11. §2.4, §2.5: scores that lag the latest download are shown only with *Not reflecting the latest download*; missing data is named *Incomplete* and skipped, never filled (AC-8, AC-13). Capability §5.4: `yes`, agrees |
| STD-UI-17 Known limitations propagate | partial | Carried by CAP-002's scores; these screens show counts, not percentiles, so no restatement mark is rendered here. The Factor scores card and the data tile show counts of current stocks and carry no mark because no marked value is displayed. Capability §5.4: `partial`, agrees |
| STD-UI-18 A check states what it does not cover | yes | Blueprint §11. §2.5: the Daily prices card carries S09 §8's scope note and links to the coverage table where it is shown in full; the Company financials card states it checks presence and failed downloads, not correctness. Capability §5.4: `yes`, agrees |
| STD-UI-19 Action tiers and error actionability | yes | Blueprint §11 and §9 tier every action here; §3 states each error's three parts and recovery; §12.3 summarises. Capability §5.4: `yes`, agrees |
| STD-UI-20 The promotion gate | no | No promotion in M1. Capability §5.4: `no`, agrees |
| STD-UI-21 The kill switch | no | No order path in M1; the kill switch ships with paper trading (D-7); capability §5.2 records it as a non-dependency. Capability §5.4: `no`, agrees |
| STD-UI-22 Control adjacency | no | No capital-at-risk or destructive control on these screens; *Stop following* is consequential, not destructive (STD-UI-2). Capability §5.4: `no`, agrees |
| STD-UI-23 State coverage | yes | Blueprint §11 and §4.10; S01 §7, S02 §7, S09 §7 for the three screens; CAP-001 v5 §1.1 to §1.5 for the five taken over; §12.4 enumerates all eight states per region (AC-24). Capability §5.4: `yes`, agrees |
| STD-UI-24 Programmatic semantics and feedback | yes | Blueprint §11 (accessibility section in every screen spec); §6 in full; Radix contracts for dialog, radio and command; `blocked` not `disabled`; polite announcements for every polled change (AC-25). Capability §5.4: `yes`, agrees |
| STD-UI-25 Polled freshness | yes | Blueprint §11 and §4.8. §5 records every cadence (system design constraint 8) and every polled region shows *checked {time}*, setup step 4's progress line and Recent downloads included; the data-health aggregate is on demand and says when it was read. **Specialization (permitted):** cadence varies per region as §5 lists; the rail's count chips carry no time of their own, and the Home and Data health *checked {time}* lines, read on the same cadence, stand for them (review v1 FINDING-11). Capability §5.4: `yes`, agrees |
| STD-UI-26 Multi-step operations | yes | §2.3: setup shows its four steps, the current position (*Step n of 4*) and what remains; going back keeps every value entered (AC-3; S02-1, S02-2). Capability §5.4: `yes`, agrees |
| STD-UI-27 Chart integrity | no | No chart in M1 (capability §5.4; system design §4.3). Capability §5.4: `no`, agrees |
| STD-UI-28 Chart provenance | no | No chart in M1. Capability §5.4: `no`, agrees |
| STD-UI-29 Density tokens | yes | Blueprint §11. §5: no literal outside the theme except the approved-specification layout widths held in `web/src/app/layout.ts` (AC-26 as narrowed by the owner); the page-ground alpha is the v5 A-5 case; corrections belong in the vendored component (AC-26). **Specialization (permitted):** a tier is selected from the defined set; inherited pending OQ-UI-4. Capability §5.4: `yes`, agrees |
| STD-UI-30 Lists at committed volume | yes | Blueprint §11. §5: the followed-stock and coverage lists at 3000 stocks (CAP-001 AC-4) are `data-table` `virtualised` with search and filter when taken over; *Needs fixing* pages by keyset at 50, bounded at 500; the palette's Stocks group is server-filtered to 8 results; aggregates are computed on the server (DEC-0200). **Specialization (permitted):** the volume is CAP-001's committed 3000, inherited; no new list reaches it. Capability §5.4: `yes`, agrees |

### 12.2 Status tier table (STD-UI-12)

The mapping follows blueprint §8 where it names the state and DEC-0201,
DEC-0203 and DEC-0210 where the blueprint is silent. STD-UI-12's verification
requires the table to appear in the capability's UX brief; capability §5.4
delegates it here. Presence states are governed by STD-UI-14 and rendered with
the `badge` coverage variants, not the status tiers; they are listed for
completeness.

| State | Display label | Tier | `badge` variant | Source |
|-------|---------------|------|-----------------|--------|
| Download `requested` | *Queued* | neutral | `status-neutral` | Blueprint §8 |
| Download `running` | *Downloading* | active | `status-active` | Blueprint §8 |
| Download `cancelling` | *Stopping* | warning | `status-warning` | Blueprint §8 |
| Download `succeeded` | *Complete* | good | `status-good` | Blueprint §8 |
| Download `partial` | *Partial* | warning, never good | `status-warning` | Blueprint §8; STD-UI-12 |
| Download `failed` | *Failed* | critical | `status-critical` | Blueprint §8 |
| Download `cancelled` | *Cancelled by you* | neutral, never critical | `status-neutral` | Blueprint §8; STD-UI-12 |
| Download `abandoned` | *Interrupted* | serious | `status-serious` | Blueprint §8 |
| Followed stock, result outcome `not_found` | *Not found* | warning | `status-warning` | Blueprint §8 |
| Followed stock, result outcome `failed` (a problem row) | *Failed* | critical | `status-critical` | Blueprint §8 (Failed); DEC-0201 |
| Scores `later` building | *Updating* | active | `status-active` | Blueprint §8 |
| Scores `set.not_current` | *Not reflecting the latest download* | warning | `status-warning` | Blueprint §8 |
| Scores `later` failed | *Score update failed* | critical | `status-critical` | Blueprint §8 |
| Scores `never_classified` | *No scores yet* | neutral | `status-neutral` | DEC-0203 kind 4 context; STD-UI-12 neutral (nothing has happened) |
| Scores served and current | *Current* | good | `status-good` | DEC-0210 |
| Check `ok` | *No missing prices or gaps* (Daily prices) / *All financials present* (Company financials) | good | `status-good` | DEC-0201; STD-UI-18 (review v1 FINDING-2) |
| Check `exceptions` | *Needs attention* | warning | `status-warning` | DEC-0201 |
| Check `not_determinable` | *Not determinable* | presence, not a tier | `coverage-unknown` | DEC-0201; STD-UI-14 |
| Verdict: no followed stock affected / some affected / every followed stock affected, or the last download *Failed* / the last download *Interrupted* | *Yes* / *Mostly yes* / *No* / *Mostly yes* | good / warning / critical / serious | `status-good` / `status-warning` / `status-critical` / `status-serious` | DEC-0210, DEC-0217 as amended by the owner 2026-10-25 (PROVISIONAL) |
| Data tile: the worse of the verdict tier and the score-state tier; neutral and active never worsen it | the winning tier's label | the winning tier | `status-<tier>` | DEC-0210 as amended (PROVISIONAL) |
| Market data key present / missing | *Found* / *Missing* | good / critical | `status-good` / `status-critical` | Blueprint §8 (provider key) |
| Market data key while unreachable | *Not determinable* | presence | `coverage-unknown` | S02 §7; STD-UI-14 |
| Market state outside session hours / inside | *Market closed* / *Not determinable* | neutral text / presence | text / `coverage-unknown` | DEC-0206 |
| *Needs you* item: stocks with problems | *Data* tag | warning | `status-warning` | DEC-0203 |
| *Needs you* item: last download failed / interrupted | *Download* tag | critical / serious | `status-critical` / `status-serious` | DEC-0203; blueprint §8 |
| *Needs you* item: key missing | *Setup* tag | critical | `status-critical` | DEC-0203 |
| *Needs you* item: first download or scores building | *Download* / *Scores* tag | active | `status-active` | DEC-0203 |
| *Needs you* item: score update failed | *Scores* tag | critical | `status-critical` | DEC-0203 |
| Rail count chip | the count | warning | `status-warning` | Blueprint §2.1 |

### 12.3 Actions

Tiered inline in §3 per blueprint §9. CAP-003 has two consequential actions,
**Stop following** (`dialog` `confirm` with blueprint §9's wording) and
cancelling a download (`dialog` `confirm` with CAP-001's wording, taken over
unchanged); every other action is routine with no confirmation: following
stocks by pasting a list, saving the history depth, **Start download**,
**Download now** (also the retry), **Add later**, **Continue** and **← Back**,
**Show more**, **Try again**, and every navigation. It has no capital-at-risk
action, because nothing is traded, and no destructive one, because nothing is
deleted; *Stop following* keeps the stock's history and says so (STD-UI-2,
STD-UI-19, STD-UI-22).

### 12.4 State coverage per region (STD-UI-23)

Eight states per data-bearing region, or a recorded reason one does not apply.
S01 §7, S02 §7 and S09 §7 govern the three screens and are specialized in the
rows below; the five taken-over screens keep CAP-001 v5's eight-state tables
(§1.1 to §1.5) with their labels and tiers restated per §2.6, and are not
reproduced. Unreachable is the shell's designed state (blueprint §3.5; §2.1)
on every route and is not redesigned per region.

| Region | Loading | Empty, never populated | Empty, nothing found | Partial | Stale | Unavailable, check could not run | Error | Unreachable |
|--------|---------|------------------------|----------------------|---------|-------|----------------------------------|-------|-------------|
| Shell: rail and count chips | Rail renders at once; chips absent until the first attention answer | n/a: destinations are static | n/a | n/a | Chips keep their last value with the stale time in their accessible name while a poll fails | n/a | No chip error of its own; the attention error shows in Home's and Data health's regions | Main region replaced by the unreachable state with *Last answered {time}*; rail and top bar remain (AC-23) |
| Shell: `/` redirect | Skeleton main region until the first health answer | Redirects to `/setup` while no download was ever requested (DEC-0202) | n/a | n/a | n/a | n/a | n/a: a failed health read is the unreachable state | As above |
| Shell: not-found route | n/a | n/a | A path matching no route: one sentence and a link to Home, inside the shell | n/a | n/a | n/a | n/a | As above |
| Palette: Stocks | Skeleton row while the debounced search runs | Before typing: a hint to type a symbol | *No stocks or pages match "{text}".* (`CommandEmpty`) | n/a: at most 8 results, stated | n/a: read on each keystroke | n/a | The group states the operation and reason; other groups usable | The palette still opens; Stocks states it cannot search; Pages usable |
| Palette: Universes, Pages | Universes read once per open; Pages static | Universes absent until registered; Pages always has the shipped pages | Covered by the shared `CommandEmpty` | n/a | n/a | n/a | Universes states the operation and reason | Pages usable |
| Setup: step list | Skeleton step list (S02 §7) | Step 1 current with nothing done | n/a: steps are fixed | Some steps done, the rest to do | n/a: re-derived on load | Credential presence `coverage-unknown` while health is unreachable, never *Missing* | A failed read of depth or count: the step shows *Couldn't read {thing}* with **Try again**; other steps unaffected | Shell state |
| Setup: step card | Card skeleton | Step 1 before anything is entered | Step 3 with zero accepted: Continue `blocked` with its reason (S02 §7) | Step 3 with rejected entries: both counts, accepted kept (S02-3) | Setup reads current configuration on load (S02 §7); step 4's progress line, polled, carries *checked {time}* | Step 1 as above; step 4 progress not determinable while attention fails: *Progress not available* with the running state | Save failure: field-level error naming the step and reason, values kept (S02 §7); `409` refusal on step 4 names the operation, reason and the step to fix | Shell state |
| Home: header and as-of line | Skeleton line | n/a: the date always renders | n/a | n/a | *checked {time}* ages while attention fails | Market state `coverage-unknown` inside session hours (DEC-0206); price as-of not determinable while attention fails | Replaced by the operation and reason, header kept | Shell state |
| Home: data tile | Skeleton tile | `latest_download` null: the whole summary row and list give way to *No data has been downloaded yet.* with **Start setup** (AC-21) | n/a | Warning tier with counts when some stocks are not current (S01 §7) | *Not reflecting the latest download* when scores lag (AC-8) | Score figures `coverage-unknown` while the summary answers `404`; followed count still from attention | Header kept, body replaced with operation, resource, reason and **Try again** (S01 §7) | Shell state |
| Home: *Needs you* | Three skeleton item rows (S01 §7) | As the data tile: AC-21's empty state | *Nothing needs you right now.* with *checked {time}* (S01 §7) | Items present; the count in the header | *checked {time}* ages while attention fails | A score-derived item cannot be determined while the summary is not served; server items still render | Header kept, body replaced, **Try again** | Shell state |
| Data health: verdict | Skeleton line and badge | No download ever ended (`latest_terminal_download` absent): AC-21's empty state (S09-5) | n/a | Warning tier with the count; serious when the last download was interrupted | n/a: composed from the aggregate's counts and attention's latest download, read with them | n/a: its inputs are recorded outcomes, never a check that could not run (DEC-0210 as amended) | Replaced by the operation and reason, `h1` kept | Shell state |
| Data health: check cards | Skeleton cards (S09 §7) | AC-21's empty state while no download has ended; after one has ended with nothing stored (`never_acquired`), the null checks render *Not determinable*, never passed | n/a | Exceptions named with counts | Not detectable in M1: currency is judged against the newest session any followed stock holds and the Daily prices card says so (DEC-0201, DEC-0206); Factor scores *Not reflecting the latest download* when `set.not_current` | Daily prices gap part `coverage-unknown` with `coverage-service`'s reason; Factor scores `coverage-unknown` before the summary is served (S09 §7) | Per card: operation, reason, **Try again** (S09 §7) | Shell state |
| Data health: *Needs fixing* | Skeleton rows | Rendered whenever problems exist, beside AC-21's empty state if no download has ended | *Nothing needs fixing.* with the last complete download's time, or *No complete download yet* (S09 §7) | Rows present; **Download now** only when any row is retryable | *checked {time}* in the sub-line | n/a: the problem set is read from recorded outcomes, never a check that could not run | Header kept, body replaced, **Try again**; a bad **Show more** cursor restarts from the first page | Shell state |
| Data health: Recent downloads | Skeleton rows | Rendered whenever a download exists, beside AC-21's empty state if none has ended: the running one alone | n/a: no filter | A *Partial* or *Interrupted* row shown as such (S09-1) | Rows re-read each 10 s tick while a download runs; *checked {time}* in the sub-line while polling and otherwise | n/a | Header kept, body replaced, **Try again** | Shell state |
| Data health: What you follow | Skeleton list | Zero followed stocks: *No stocks followed yet* with the setup link (AC-21) | n/a | n/a: each line is a fact or an explicit *not set* | n/a: read on demand | Key presence `coverage-unknown` while health is unreachable | Header kept, body replaced, **Try again** | Shell state |
| Taken-over screens (five) | CAP-001 v5 §1.1 to §1.5, unchanged | Unchanged, relabelled | Unchanged | Unchanged | Unchanged | Unchanged | Unchanged, three-part errors | Shell state |
