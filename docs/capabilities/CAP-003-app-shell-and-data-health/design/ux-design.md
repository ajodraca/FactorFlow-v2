---
artifact_schema_version: 1
artifact_id: CAP-003-ux-design
artifact_type: ux-design
artifact_version: 1
capability_id: CAP-003
title: App Shell & Data Health
created: 2026-10-25
updated: 2026-10-25
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
design_source: Generated from UX brief, starting from PRODUCT-UX-S01, PRODUCT-UX-S02 and PRODUCT-UX-S09
approved_by: Pending review
approval_date: none
design_system: FactorFlow Design System (shadcn/ui + Radix)
theme: design-system/theme.css
ai_provenance:
  agent_id: ux-design-agent
  agent_version: "1.2"
  model: claude-fable-5-1
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-26T02:17:21Z
  source_artifacts:
    - id: CAP-003
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-brief
      version: "1"
    - id: PRODUCT-UX
      version: "6"
    - id: PRODUCT-UX-S01
      version: "4"
    - id: PRODUCT-UX-S02
      version: "4"
    - id: PRODUCT-UX-S09
      version: "4"
    - id: STD-UI
      version: "6"
    - id: CAP-001-ux-design
      version: "5"
    - id: factorflow-design-system
      version: "18 components as of 2026-10-15"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# UX Design: App Shell & Data Health

**Capability:** CAP-003
**Design Source:** Generated from UX brief v1 (committed 41ff183), starting from the three approved screen specifications the blueprint's §0 names for this capability: `docs/ux/screens/S01-home.md` (`PRODUCT-UX-S01` v4), `docs/ux/screens/S02-setup.md` (`PRODUCT-UX-S02` v4) and `docs/ux/screens/S09-data-health.md` (`PRODUCT-UX-S09` v4), and from `CAP-001-ux-design` v5 §1.1 to §1.5 for the five screens taken over. No Figma frames exist: `design-system/component-map.json` carries a null Figma file key because shadcn/ui publishes no official kit. The canvas sources are `docs/ux/design-source/P01-Home.dc.html`, `P02-Setup.dc.html` and `P09-Data.dc.html`; where they and a specification disagree, the specification wins (S01 §11, S02 §11, S09 §11), and this design took nothing from the canvas directly. This is the Path B automated design.
**Approved By:** Pending review
**Approval Date:** none
**Design System:** FactorFlow Design System (shadcn/ui + Radix), 18 component specifications as of 2026-10-15, all read; 15 used, 3 unused with reasons in Section 3
**Theme:** `design-system/theme.css`

This design was produced in an unattended `$design-run` without a human
designer or any visual design tool. It is a best-effort automated design and
should be read before it is decomposed. Every choice the skill would otherwise
have asked the owner about is either fixed by an approved artifact and cited
where it decides something, or rests on a decision already recorded under
`projects/factorflow-v2/decisions/` in the harness repository: the system
design's DEC-0200 to DEC-0208 and the UX brief's DEC-0209 and DEC-0210. This
design applies them without re-deciding, marks every position that rests on
one **PROVISIONAL** where its record is, and **records no decision of its own**:
everything it adds beyond its sources is copy whose shape the brief fixed and
delegated to this design (brief §9), or layout the screen specifications and
the blueprint already settle. Nothing was abstained.

Following `docs/ux/README.md` and blueprint §0, this design **starts each
screen from its approved specification and delivers the regions the
blueprint's milestone map (§10) assigns to M1**, leaving the rest out rather
than inventing a different layout; it inherits the shell (§3), the shared
patterns (§4), the status map (§8) and the action tiers (§9) and restates them
only where this capability is the one that builds them, because the shell and
the patterns are its deliverable (capability §2, §5.3). Every departure from an
approved screen specification is listed in Section 0.8 with its reason, as
blueprint §0 requires.

**Vocabulary in this document.** As STD-UI-1 v6 and blueprint §7 require,
every string the owner reads uses the display labels: *stock*, *followed
stock*, *stop following*, *download*, *Complete*, *Partial*, *Failed*,
*Cancelled by you*, *Interrupted*, *Incomplete*, *score*. This document, being
an SDD document, keeps the domain terms when it names API fields, acceptance
criteria and persistence (`instrument`, `acquisition_run`, `acquisition_state`,
`run_instrument_result`, outcome), and writes every user-visible string in
italics with its display label (AC-19). Bold marks a control's label. A value
in braces is composed at render time from the field the text names.

## 0. Application Shell

The shell is a composition, not a component (`design-system/intake.md` step
1.3), and this capability is the one that builds it (blueprint §0; capability
§2 *One product-wide shell*). It is specified once here and used by every
route: the eight screens of Section 1, CAP-002's five `/research` routes
(AC-27) and every later capability's screens. It replaces the shell and route
composition `CAP-001-ux-design` v5 §0 delivered (DEC-0204, PROVISIONAL).
The component that owns it is `owner-shell` (system design §4.1).

### 0.1 Layout

Blueprint §3.1, with the kill switch and the environment region absent in M1
(blueprint §10; D-7; system design constraint 14):

```
+----------+-------------------------------------------------------------+
| Rail     | Top bar (sticky): title or breadcrumb          [ Search  K ] |
| 208 px   +-------------------------------------------------------------+
|          |                                                             |
| Home  4  | Main region: padding --space-5; Home, Setup and Data health |
| Research | cap at 1180 px; Coverage, Followed stocks, Downloads and    |
|          | Download detail use the full width for their tables         |
|          |                                                             |
| Data   3 |                                                             |
| Settings |                                                             |
+----------+-------------------------------------------------------------+
```

| Region | Specification |
|--------|---------------|
| Page ground | `hsl(var(--muted) / 0.5)` over `--background` (the STD-UI-29 A-5 alpha, not a new token). Content sits on `card`s on `--background` |
| Rail | 208 px wide, `--border` right edge. Top to bottom: the brand mark, the primary group (Home, Research), a flexible gap, the data-and-system group (Data health, Settings) pinned to the bottom. Each item is a link: a 16 px stroke icon (`lucide-react`, DEC-0205) and the label at `--text-base`, `--space-2` by `--space-3` padding, `--radius`. The current item has a `--background` fill with a 1 px `--border` ring and its icon in `--foreground`; other items render in `--muted-foreground` with the label in `--foreground`. The brand mark is the product name *FactorFlow* as text at `--text-base` weight 600, `--space-3` padding: the product has no visual brand and needs none (STD-UI §2.2), so a word is the mark |
| Top bar | Sticky, `--background`, bottom `--border`, `--space-3` by `--space-5` padding. Left: the screen's title or breadcrumb at `--text-base` weight 600 from the static route-to-title table in 0.3. Right: the palette opener, a `button` `outline` labelled *Search* with the platform shortcut as trailing text in `--text-xs` `--muted-foreground` (*⌘K* on macOS, *Ctrl+K* elsewhere) and the accessible name *Open the command palette*. Nothing between them in M1: the environment region and the kill switch ship with paper trading (D-7), and their place is left empty rather than reserved by a disabled control |
| Main region | `--space-5` padding; stacked regions `--space-5` apart. Home, Setup and Data health cap their content at 1180 px (blueprint §3.1 reading screens); the four table screens and Settings use the width CAP-001 v5 gave them (full width for tables, `--measure-prose` for Settings) |

**Responsive** (blueprint §3.1; capability §5.3). The design width is 1280 px
and above. Between 1024 and 1279 px nothing on these screens moves: no screen
here has a side panel. Below 768 px the rail stacks above the content as a
horizontal list (brand mark, then the four items in one row, scrolling
horizontally if needed) and the top bar wraps the opener under the title;
nothing becomes unreachable, and nothing needs to be pleasant on a phone.

### 0.2 Destinations and count chips

The rail holds one static, ordered destination list kept in code (DEC-0204,
PROVISIONAL): primary group Home (`/home`) and Research (`/research`);
data-and-system group Data health (`/data`) and Settings (`/settings`).
Strategies and Portfolio are absent, not disabled (AC-1; S01 §2). Research is
in the list exactly when `classification-ui`'s `/research` routes are
registered in the same change, so the rail has either three or four items in
M1 and the design is drawn for both (capability OQ-2; brief §9):

| Landing order | Rail in M1 | Palette Pages group | Palette Universes group |
|---------------|------------|---------------------|-------------------------|
| This shell lands first | Home; Data health, Settings | Home, Data health, Settings, Coverage, Followed stocks, Downloads | absent |
| CAP-002's screens are registered | Home, Research; Data health, Settings | the above plus Research | present |

**Count chips** (blueprint §2.1; AC-16): a `badge` `status-warning` at
`--text-xs` inside the rail item, right-aligned, carrying the count as its
text label. Home's count is the length of the merged *Needs you* list computed
by the same `sortAttention` function `home-ui` uses, over the three
server-derived item kinds in `GET /api/attention` `items` and the two
score-derived kinds (DEC-0203, PROVISIONAL); Data health's count is
`GET /api/attention` `problems.stock_count`. A chip is absent, not zero, when
its count is zero. The chip's text is its accessible name and the rail item's
accessible name includes it in words: *Home, 4 items need you*, *Data health,
3 stocks with problems*. The badge's warning shape is the variant's own and is
`aria-hidden`; the text carries the meaning (STD-UI-8). Chips refresh on the
attention cadence (0.4) and a changed count is announced politely through the
rail's polite live region without moving focus. While an attention read
fails, a chip keeps its last value and its accessible name gains *, as of
{time}*; the shell shows no error of its own (brief §12.4).

### 0.3 Routes, titles and redirects

The route map is `owner-shell`'s (system design §4.2, screen registration).
Titles come from one static route-to-title table; each screen's `h1` stays its
own specification's (S01's date, S02's *Get set up*, S09's question) and the
top bar never repeats an `h1` word for word except where the title is the
screen's name.

| Route | Screen | Top-bar title |
|-------|--------|---------------|
| `/` | redirect: `/setup` while `GET /api/health` `most_recent_run` is null, else `/home` (DEC-0202 as the owner amended it on 2026-10-25, PROVISIONAL) | none; a skeleton main region until the first health answer |
| `/setup` | 1.2 First-run setup | *Setup* |
| `/home` | 1.3 Home | *Home* |
| `/data` | 1.4 Data health | *Data health* |
| `/data/coverage` | 1.5 Coverage (accepts `?symbol=`) | *Data health › Coverage* |
| `/data/followed` | 1.6 Followed stocks (accepts router state `{focusAdd: true}`) | *Data health › Followed stocks* |
| `/data/downloads` | 1.7 Downloads | *Data health › Downloads* |
| `/data/downloads/:id` | 1.8 Download detail | *Data health › Downloads › Download {start time}* |
| `/settings` | 1.9 Settings | *Settings* |
| `/research`, `/research/stocks/:symbol`, `/research/compare`, `/research/universes`, `/research/universes/:id` | CAP-002's screens, unchanged (AC-27) | CAP-002's own titles (`CAP-002-ux-design` v3 §0) |
| `/coverage`, `/instruments`, `/runs`, `/runs/:runId` | client-side `Navigate replace` to `/data/coverage`, `/data/followed`, `/data/downloads`, `/data/downloads/:runId`, query kept, for one release (AC-18; blueprint §2.2) | none |
| any other path | 0.5 not-found state inside the shell | *Page not found* |

The breadcrumb separator is the character *›* with `--space-2` either side,
in `--muted-foreground`; each ancestor crumb is a link (*Data health* to
`/data`, *Downloads* to `/data/downloads`), the last crumb is text. A download
is named by its start time in America/Chicago with the zone (*Download
2026-10-15 17:31 CDT*) until the owner answers capability OQ-1 (system design
assumption 5; CAP-002's DEC-0083).

### 0.4 Shell-wide reads and cadences

The interface learns everything by polling, and every cadence is recorded here
(STD-UI-25; system design constraint 8). All polling pauses while the
document is hidden and resumes with an immediate read when it is shown.

| Read | Cadence | Consumers | Shown as |
|------|---------|-----------|----------|
| `GET /api/health` (the delivered `HealthProvider`, kept) | every 30 s | the `/` redirect, the unreachable state, setup step 1 and Settings (credential presence), What you follow | the unreachable state's *Last answered {time}* |
| `GET /api/attention` | every 60 s; every 10 s while `latest_download.state` is non-terminal | the two count chips, Home, setup step 4, Data health's verdict and empty state (`latest_terminal_download`) and its Recent downloads tick | *checked {time}* on Home's header and *Needs you* card, on setup step 4's progress line and on *Needs fixing* |
| `GET /api/classifications/summary` | every 60 s; every 10 s while `later` reports a set building; a `404` is the state *not served*, not an error | Home's data tile and score-derived items, Data health's Factor scores card | the data tile's *Scores {as-of}* line |
| `GET /api/data-health` | on load of `/data`, on **Try again**, once when the attention read shows the latest download turned terminal, and after **Stop following** succeeds; never on an interval | Data health | *checked {time}* in the verdict's as-of line and the *Needs fixing* sub-line |
| `GET /api/acquisition-runs?limit=5` | on load of `/data` and on each 10 s attention tick while a download is non-terminal | Recent downloads | the running row's progress, and *checked {time}* in the card's sub-line, the time of the last successful read, while it polls and otherwise |

Times in *checked {time}* render as `HH:MM:SS` with the zone (*checked
18:52:14 CDT*), as blueprint §4.8 draws them.

### 0.5 Shell states

Blueprint §3.5, specialized for M1 (brief §2.1).

| State | Rendering |
|-------|-----------|
| Setup incomplete | `/` opens setup until a download is started from setup or Data health. The rail is present and every destination stays reachable, each showing its honest empty state (DEC-0202; AC-21). No banner, no lock |
| Unreachable | The main region alone is replaced by a `card` `default` holding a `section` with `role="status"`: `h2` *FactorFlow is not answering.* and the delivered paragraph kept word for word, *The application container may have stopped, or a database migration may have failed and prevented it from starting. Check the container logs.* (`CAP-001-ux-design` v5 §2), then one line this capability adds, *Last answered {YYYY-MM-DD HH:MM:SS zone}* from `HealthProvider`'s last successful answer, or *Not yet answered since this page opened* when there is none (DEC-0204; AC-23). The rail, its chips as last read, and the top bar remain. When a later health poll answers, the routed screen mounts again at the same URL and refetches; nothing reloads the page. The state is announced once on entry and once on recovery |
| Not found | A path matching no registered route renders, inside the shell with the top-bar title *Page not found*, a `card` `default` holding a `section` with `role="status"`: `h1` *There's no page at this address.* and one line, *Check the address, or go to* **Home** (a link to `/home`). The main region is never blank. Copy is this design's (brief §2.1) |
| Trading stopped, classifications updating | Not shell states in M1: no order path exists (D-7), and score state is shown where scores are shown (blueprint §3.5) |
| Loading | Until the first health answer, `/` renders a skeleton main region (one card-shaped skeleton at the 1180 px cap); every other route renders its own screen's skeleton at once. *Not yet checked* is not evidence of anything (system design §3.1 note 2) |

### 0.6 Component mapping, tokens and accessibility of the shell

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Rail items, breadcrumb ancestors, the not-found **Home** link | link (`react-router-dom` `NavLink` with `aria-current="page"`), styled from the `button` `ghost` tokens | n/a | `design-system/components/button/design-spec.md` §1 directs navigation to a link |
| Count chip | `badge` | `status-warning` at `--text-xs` | `design-system/components/badge/design-spec.md` |
| Palette opener | `button` | `outline`, trailing shortcut text, accessible name *Open the command palette* | `design-system/components/button/design-spec.md` |
| Unreachable and not-found states | `card` | `default` | `design-system/components/card/design-spec.md` |
| A download that completes while the owner is on another screen | `toast` | `success` for *Complete*, `warning` for *Partial* and *Interrupted*, `error` for *Failed*; never `info`, never for a result already visible on the current screen (CAP-001 v5 §2, kept) | `design-system/components/toast/design-spec.md` |

**Tokens.** Rail and top bar on `--background` with `--border` edges; labels
`--foreground`, inactive icons `--muted-foreground`; current item ring
`--border`; focus ring `--ring` at `--focus-ring-width`; page ground
`hsl(var(--muted) / 0.5)`; chip `--status-warning` on `--status-warning-muted`
at `--text-xs`, checked against the rail ground at 4.5:1 and recorded in
`design-system/theme-validation.md` rather than assumed; the unreachable and
not-found cards `--card` and `--card-foreground`; toast accents
`--status-good`, `--status-warning`, `--status-critical`. Type:
`--text-base` default, `--text-xs` for the shortcut hint and *checked {time}*.
Spacing only from `--space-*`. No literal outside the theme, except the
layout widths 0.7 places in `web/src/app/layout.ts` (AC-26; STD-UI-29).

**Accessibility** (STD-UI-24; brief §6). The rail is a `nav` labelled *Main*;
the current item carries `aria-current="page"`. The top bar is a `banner`
whose first text is the title. Every screen has one `main` with one `h1`.
After a route change, focus moves to the main region's `h1`, not to the rail,
so a screen-reader user hears the new screen first; the top-bar title changes
with it. The shell's single keydown listener opens the palette on `⌘K` or
`Ctrl+K` and ignores keystrokes whose target is a text field (blueprint §3.4).
Toasts never steal focus; `error` and `warning` toasts persist until
dismissed. Visible focus is never suppressed anywhere. Contrast: text 4.5:1,
large text and interactive boundaries 3:1.

### 0.7 Conventions stated once

**Display labels, numbers, dates and tiers.** User-visible text uses the
STD-UI-1 v6 display labels (blueprint §7; AC-19), including every string on the
five taken-over screens (1.5 to 1.9). Counts are whole numbers with thousands
separators in `--font-numeric` (*1,236*), precision fixed per region
(STD-UI-3). Dates are ISO-8601 (`YYYY-MM-DD`); timestamps are America/Chicago
with the zone shown, *CDT* or *CST* as the instant falls, in the form
`YYYY-MM-DD HH:MM zone`, or `HH:MM zone` where the date is already on the line;
session dates (`prices_as_of`, `latest_session`, `covered_to`) are calendar
dates rendered unconverted (STD-UI-5; blueprint §4.8). A download is named by
its start time with the zone (0.3). Every status renders through the one tier
function in `ui-components` as `badge` `status-<tier>` with its label and the
tier shape (neutral hollow circle, active ringed dot, good filled circle,
warning triangle, serious diamond, critical square), never colour alone
(AC-20; STD-UI-8, STD-UI-12; blueprint §8); the full table is brief §12.2.
The verdict's tier comes from one function in `ui-components`,
`worstDataTier`, over the problem set and the latest terminal download; Home's
data tile calls the same function and shows the worse of its tier and the
score-state tier (DEC-0210 and DEC-0217 as the owner amended them on
2026-10-25, PROVISIONAL).

**Three presence renderings are never confused** (STD-UI-4, STD-UI-14; system
design constraint 5). Present: the value. Absent: an em dash in
`--value-missing`, never `0` and never blank; blank means only that a column
does not apply. Not determinable: `badge` `coverage-unknown` *Not
determinable* carrying `--pattern-indeterminate` and its words, with its
reason beside it or one interaction away, never a dimmed absent and never a
passed check.

**Every error has three parts** (STD-UI-19): the operation, the stock or
download, and the reason, then the recovery where one exists. The envelope's
`code` selects the wording and `request_id` is never shown.

**Type, density and spacing** are theme tokens (STD-UI-29): `--text-base`
default, `--text-sm` dense table bodies, `--text-xs` timestamps, as-of lines,
sub-lines and step counters, `--text-lg` card `h2`s, `--text-xl` screen `h1`s
and the setup step question, `--text-2xl` the data tile's hero count. Every
table consumes `--row-height`, which resolves to `--row-height-comfortable`;
this design selects no density tier and inherits, as CAP-001 and CAP-002 did,
pending STD-UI OQ-UI-4. The pixel widths quoted from the blueprint and the
screen specifications (208, 1180, 260 to 300, 28 px, 16 px, 70ch) are
approved-specification values, not theme literals and not new tokens: they are
held in one layout-constants module in `owner-shell`, `web/src/app/layout.ts`,
and read from there, never written at a call site. AC-26, as the owner
narrowed it on 2026-10-25, permits them there (review v1 FINDING-6). The light theme is assumed
(STD-UI OQ-UI-2; brief §9).

### 0.8 Departures from approved sources

Blueprint §0 requires every departure from a screen specification to be
listed with its reason. This design departs in seven places, six of them
inherited from the brief and one of its own against the brief, and in none of
them redesigns what the source settles.

| Departure | Source departed from | What this design does | Reason |
|-----------|---------------------|-----------------------|--------|
| Home's `h1` date | S01 §3 and §8: *Thursday, 15 October* | *Thursday, 2026-10-15* | STD-UI-5 requires ISO-8601 and never a locale format, and STD-UI §1.1 makes the standard win; the weekday word is kept (DEC-0209, `contradiction`, decided on the standard's own precedence) |
| The M1 verdict sentence | S09 §3: *strategies skip them until they're fixed* | *their scores show as Incomplete until they're fixed* | No strategy exists in M1 and STD-UI-2 forbids words describing behaviour the product does not have; the wording returns with M2 (DEC-0210, PROVISIONAL; DEC-0201) |
| Setup step 3's source choice | S02 §3: *Paste a list* / *Upload a CSV* / *Add later* | two `radio-group` `cards` options, *Paste a list* and *Add later* | The capability scopes step 3 to a pasted list (capability §2, AC-5); CSV upload was capability OQ-3, answered no by the owner on 2026-10-25, and would have been a `file-input` gap through `design-system/intake.md` (S02 §11) |
| The check cards' Stale state | S09 §7: a check whose as-of is before the latest trading day reads *Not current* | Not rendered in M1; the Daily prices card states that currency is judged against the newest session any followed stock holds | No trading calendar exists (DEC-0206), so currency is judged against the newest session any followed stock holds (DEC-0201), which no stock can predate for every stock; a label would assert what cannot be detected (STD-UI-18; review v1 FINDING-2). The state returns when a calendar exists (system design open question 9) |
| *Needs fixing*'s sub-line | S09 §3: the *Needs fixing* header names each problem *with the download it came from* | *From your most recent downloads · checked {time}* (1.4) | Problems are each stock's latest recorded outcome per data type, which may come from different downloads, so no single download can be named (DEC-0201, PROVISIONAL) |
| Home's market state | S01 §3, §5 and §8: the market state from a trading calendar (*Market closed at 15:00 CDT*) | *Market closed* on Saturdays, Sundays and weekdays outside 08:30 to 15:00 America/Chicago; inside those hours `coverage-unknown` *Market state not determinable* (1.3) | No trading calendar exists, so a session cannot be told from a holiday and no close time can be asserted (DEC-0206, PROVISIONAL; STD-UI-15) |
| The palette dialog's accessible label | UX brief §6: *Command palette* | *Search FactorFlow* | The `command` design spec §5 fixes the dialog's label, and the component contract is what this design must use as it exists (skill constraint 2). The brief's `h1`-style title is not rendered; the input's placeholder is the visible text |

Three further points are specializations of a source rather than departures,
and are recorded where they occur: S01 §8's *Needs you* data item becomes five
item kinds in the §4.1 shape (DEC-0203, PROVISIONAL; 1.3); S09 §5's
server-written verdict sentence is composed in the interface from the counts
the new read returns (DEC-0200, PROVISIONAL; 1.4); and S09 §3's *Recent
downloads* row number is the download's start time (capability OQ-1, answered
no by the owner on 2026-10-25; 1.4).

## 1. Screens

Eight screens and one dialog surface, as brief §1 names them. Sections 1.2 to
1.4 are S02, S01 and S09 delivered for M1; Sections 1.5 to 1.9 are the five
CAP-001 screens taken over, where this design records the deltas against
`CAP-001-ux-design` v5 and restates nothing it settled (AC-17). Each screen
records its eight STD-UI-23 states in a States subsection (AC-24), starting
from the specification's states table, with the brief's §12.4 enumeration as
the source.

### 1.1 Command palette (`command` `dialog`, every route)

Blueprint §3.4 for M1: the groups Stocks, Universes and Pages, no Actions
group, and never an action that places or stops trading (AC-22; blueprint
§10; DEC-0207, PROVISIONAL). Owned by `command-palette`; opened by
`owner-shell`.

#### Page Layout

A `command` `dialog` centred over the page at 560 px wide (the cmdk default
shadcn/ui ships; a width inside the vendored component, not a call-site
literal), overlay `--foreground` at 40%. Top to bottom: `CommandInput` with the
placeholder *Jump to a stock or page* and the accessible label *Search
FactorFlow*; `CommandList` holding, in order and each with its heading,
`CommandGroup` *Stocks*, `CommandGroup` *Universes* (only while CAP-002's
universes routes are registered), `CommandGroup` *Pages*, separated by
`CommandSeparator`; `CommandEmpty` when no group has an item. Each
`CommandItem` shows its primary text (the symbol, the universe name, the page
name) at `--text-base` and a secondary hint at `--text-xs`
`--muted-foreground` (the company name where the followed list holds one; for
a page, its route group, *Data health › Coverage*).

| Group | Items | Source | Choosing one opens |
|-------|-------|--------|--------------------|
| Stocks | followed stocks whose symbol starts with the typed text, at most 8, each *{SYMBOL} · {name}* | `GET /api/instruments?symbol={prefix}&lifecycle=active&limit=8`, debounced 250 ms, `shouldFilter={false}` for this group (command spec §4) | `/research/stocks/{symbol}` while the research routes are registered, else `/data/coverage?symbol={symbol}` (DEC-0207) |
| Universes | active universes by name, filtered locally | `GET /api/universes` read once per open | `/research/universes/{id}` |
| Pages | the shipped rail destinations plus *Coverage*, *Followed stocks*, *Downloads*, filtered locally | the static destination list (0.2) and the three `/data` sub-pages | the route |

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| The palette | `command` | `dialog` | `design-system/components/command/design-spec.md` |
| Loading row while a stock search runs | `command` `Command.Loading` | n/a, *Searching…* | `design-system/components/command/design-spec.md` §4 |
| Opener in the top bar | `button` | `outline` | `design-system/components/button/design-spec.md` |

#### Interaction Flows

Per the `command` interaction contract (spec §4): `⌘K` / `Ctrl+K` outside a
text field, or the opener, opens the palette with focus in the input; typing
filters Pages and Universes locally and searches followed stocks on the
server; `ArrowDown` / `ArrowUp` move the active item and wrap (`loop` set);
`Enter` runs the active item, which navigates and closes the palette; `Esc`
closes and returns focus to the opener; pointer hover activates, click
selects. Before anything is typed, Pages lists every shipped page and the
Stocks group shows one non-selectable hint row, *Type a symbol to find a
followed stock*, so the group is never an unexplained blank. While the
debounced search runs, the Stocks group shows `Command.Loading` *Searching…*,
never an empty group. The palette never mutates anything: every item
navigates (AC-22).

#### States

| State | Rendering |
|-------|-----------|
| Loading | Stocks: *Searching…* while the search runs. Universes: read once per open; its heading renders when the read answers |
| Empty, never populated | Before typing: the Stocks hint row; Pages lists the shipped pages |
| Empty, nothing found | `CommandEmpty` *No stocks or pages match "{text}".* (the `command` spec §7 form, naming the groups searched) |
| Partial | Stocks shows at most 8 results; when the response reports more, a last non-selectable row reads *Showing the first 8. Keep typing to narrow.* |
| Stale | Not applicable: stocks are re-read on each keystroke, universes once per open |
| Unavailable | Not applicable: no check runs here |
| Error | The stock search fails: the Stocks group's body reads *Couldn't search followed stocks: {reason}.* and the Universes and Pages groups stay usable (system design §3.5 box 12). The universes read fails: *Couldn't read universes: {reason}.* in that group alone |
| Unreachable | The palette still opens from the keyboard; Stocks and Universes state they cannot search; Pages stays usable so the owner can still move between screens |

#### Token Usage

`--popover` / `--popover-foreground` surface and text; `--accent` /
`--accent-foreground` active item; `--muted-foreground` at `--text-xs` for
group headings, hints and the shortcut; overlay `--foreground` at 40%;
`--radius`. All from the `command` spec §6.

#### Accessibility

cmdk renders a combobox with a listbox; `CommandDialog` composes Radix Dialog,
which traps focus and restores it to the opener on close. The dialog is
labelled *Search FactorFlow* (command spec §5); the input has the visible
placeholder and that accessible label; group headings are announced; the
empty state and the error rows are text. Opening moves focus to the input;
closing returns it to the opener. The hint and *Showing the first 8* rows are
`aria-disabled` and skipped by arrow navigation.

### 1.2 First-run setup (S02, `/setup`)

S02 §3 to §9 delivered for steps 1 to 4 (step 5 is M2, S02 §2), on CAP-001's
API as it is. Owned by `setup-ui`. Setup is complete exactly when CAP-001's
run journal holds a download in any state (DEC-0202, PROVISIONAL); no setup
flag is stored. `/` then opens Home (AC-2, S02-6), and `/setup` stays
reachable from Settings' **Open setup** link (S02 §6) with every step shown as
done. Each step's values are saved on **Continue** through CAP-001's
endpoints, and unsaved input is held in app memory above the `/setup` route
for the session (Interaction Flows).

#### Page Layout

Two columns inside the 1180 px main region, `--space-6` apart (S02 §3).

**Step list** (260 to 300 px): `h1` *Get set up* at `--text-xl`; the sub-line
*About 10 minutes, then the data download runs on its own. You can leave and
come back.* at `--text-xs` `--muted-foreground` (S02 §8); then the `stepper`
`vertical` as a `nav` labelled *Setup steps*, four steps in M1, each a 28 px
dot with the step number or a check, a bold title and a one-line summary of
what was chosen once the step is done:

| Step | Title | Done summary | Done when (re-derived from the server on each load) |
|------|-------|--------------|------------------------------------------------------|
| 1 | *Market data* | *Found* or *Missing* | always, once health has answered: the step is read-only |
| 2 | *How far back* | *{y} years of history* | `GET /api/settings/history-depth` `years` is set |
| 3 | *Stocks to follow* | *{n} followed stocks* | `GET /api/instruments?lifecycle=active&limit=1` `active_count` > 0 |
| 4 | *Download data* | *Download started {start time}* | the shell's attention `latest_download` is non-null |

On every visit the step list and the current step are re-derived from
settings, the followed list and downloads, the current step being the first
step not done (S02 §5); unsaved input held for the session fills its fields,
and nothing is written to browser storage (system design §4.4).

**Step card** (fluid, a `card` `default`): *Step {n} of 4* at `--text-xs`
`--muted-foreground`; the step question as `h2` at `--text-xl`; an explanation
paragraph capped at 70ch; the step's controls; an info note at `--text-xs` on
`--muted`; then a footer row with **← Back: {previous step title}** (`button`
`ghost`) at the left and, at the right, the hint *Next: {next step title}* at
`--text-xs` and **Continue** (`button` `default`). Step 1 has no Back; step 4
has no Continue and no Next hint.

| Step | Question (`h2`) | Controls and copy |
|------|-----------------|-------------------|
| 1 | *Connect market data* | Read-only. A line *Market data key:* with `badge` `status-good` *Found* or `status-critical` *Missing* from `health.credential_present`. When missing, two lines: *Set the environment variable `FACTORFLOW_MASSIVE_API_KEY` to your Massive API key.* and *Restart FactorFlow after setting it.* Never the value (AC-4; S02-4). While health is unreachable the badge is `coverage-unknown` *Not determinable* with *FactorFlow isn't answering, so the key can't be checked.*, never *Missing* (S02 §7). **Continue** is available in every case: a missing key is fixed outside the product, and a download without one fails and surfaces on Home (DEC-0203) |
| 2 | *How far back should history go?* | `form` `stacked` with one field: label *History depth*, `input` `numeric` with the non-editable suffix *years* (part of the accessible name), description *Whole years, 1 to 50.* Plan-limit note (S02 §3; CAP-001 §6): *Your provider plan holds 5 years. A deeper depth is requested as stated; the provider returns what it holds.* **Continue** saves with `PUT /api/settings/history-depth` and moves on. `422`: a field error *History depth must be a whole number of years from 1 to 50.* with the value kept (S02 §7) |
| 3 | *Which stocks do you want to follow?* | Explanation (S02 §8): *FactorFlow downloads data and scores value, growth and momentum for these stocks. Scores rank stocks against each other, so a factor needs at least 30 stocks with complete data before it can rank anything. Start with 100 or more if you can.* Then `radio-group` `cards` labelled *How do you want to name them?* with two options (0.8): **Paste a list**, *Paste symbols separated by commas or one per line.*; **Add later**, *Continue without stocks for now; you can follow them later from Data health.*, with which **Continue** is available and posts nothing Choosing *Paste a list* reveals `form` `stacked` with `textarea` `list`, label *Stock symbols*, placeholder *AAPL, MSFT, NVDA or one symbol per line*, description *Whether the provider knows each one is checked during the download.* (S02 §8). Parse on paste and blur with the delivered `parse-bulk-symbols`: the counter sentence *{a} symbols recognised, {d} duplicates, {r} not recognised* with `badge` `status-good` on the accepted count and one `badge` `status-warning` per duplicate or unreadable entry, each named with its reason (*ZZZZ, not a valid symbol format*), and a near-miss as a `button` `outline` *Did you mean BRK.B?* that applies it (S02 §6). Below 30 accepted, the warning *Factor scores need at least 30 stocks with complete data. With {a}, no factor can be ranked yet.* with **Continue** available (AC-6; S02-5). Info note (S02 §8): *This is your followed list. You can add or stop following stocks any time in Data health. Stopping keeps their history; nothing is ever deleted.* |
| 4 | *Download data for {n} stocks* | A `card` `summary` description list of the three choices: *Market data key* with step 1's badge repeated, *History depth* *{y} years*, *Followed stocks* *{n}*. Then **Start download** (`button` `default`). After `202`: `progress` `determinate` with the text *{done} of {total} stocks* from attention `latest_download.progress` on the 10 s cadence, the line *Started {start time} · checked {time}*, the time being the attention read's `checked_at` (STD-UI-25; AC-25), and *You can leave; this keeps running.* (S02 §3). With no stock followed (`active_count` 0, as after *Add later*), **Start download** is `button` `blocked` with CAP-001's `no_active_instruments` reason beside it, *No stocks are followed. Follow stocks before downloading.*, and the step offers two exits, **Go to Home** (a link to `/home`) and **Manage followed stocks** (a link to `/data/followed`), both styled `button` `outline`. Nothing else to do on this step |

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Step list | `stepper` | `vertical`, done steps as links | `design-system/components/stepper/design-spec.md` |
| Step card | `card` | `default` | `design-system/components/card/design-spec.md` |
| Key presence (steps 1 and 4) | `badge` | `status-good` *Found* / `status-critical` *Missing* / `coverage-unknown` *Not determinable* | `design-system/components/badge/design-spec.md` |
| History depth field | `form` + `input` | `stacked` + `numeric` with the *years* suffix | `design-system/components/form/design-spec.md`, `design-system/components/input/design-spec.md` |
| Source choice | `radio-group` | `cards`, two options | `design-system/components/radio-group/design-spec.md` |
| Symbols | `form` + `textarea` | `stacked` + `list` | `design-system/components/form/design-spec.md`, `design-system/components/textarea/design-spec.md` |
| Parse result counts | `badge` | `status-good` accepted count; `status-warning` per duplicate or unreadable entry | `design-system/components/badge/design-spec.md` |
| Near-miss suggestion | `button` | `outline` | `design-system/components/button/design-spec.md` |
| Step 4 summary | `card` | `summary` | `design-system/components/card/design-spec.md` |
| Start download, Continue | `button` | `default`, one per step card | `design-system/components/button/design-spec.md` |
| Continue with zero accepted symbols | `button` | `blocked`, reason through `aria-describedby` | `design-system/components/button/design-spec.md` |
| Start download with no stock followed (step 4) | `button` | `blocked`, the `no_active_instruments` reason through `aria-describedby` | `design-system/components/button/design-spec.md` |
| Go to Home, Manage followed stocks (step 4 exits) | link styled as `button` | `outline` | `design-system/components/button/design-spec.md` |
| Back | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Download progress | `progress` | `determinate`; `indeterminate` only while `total` is unknown | `design-system/components/progress/design-spec.md` |

#### Interaction Flows

**Continue** saves the step through the delivered endpoint and makes the next
step current; **← Back** makes the previous step current and discards nothing.
Unsaved input in every step is held in app memory above the `/setup` route, a
React state holder in the shell's route tree, for the session: going back a
step, or leaving `/setup` and returning, keeps it, and only a page reload
loses it; nothing is written to browser storage (DEC-0202; AC-3; S02-2;
STD-UI-26). A done step in the stepper is a link to that
step. Focus moves to the step card's `h2` whenever the current step changes
(S02 §9).

**Step 2.** Validation runs on blur (`input` contract); `422` renders as the
field error above with the value kept. The stepper summary becomes *{y} years
of history*.

**Step 3, pasting.** Parsing runs on paste and blur, never per keystroke;
symbols normalise to upper case on blur (`textarea` contract). Rejected and
duplicate entries never discard accepted ones (AC-5). At zero accepted with
*Paste a list* chosen, **Continue** is `button` `blocked` with *Paste at least one symbol, or choose
Add later.* beside it (S02 §7).

**Step 3, Continue.** The accepted symbols go to `POST /api/instruments` in
batches of at most 1000. The response's `added` and `reactivated` counts and
every `rejected` entry with its reason are shown in the counter region; a
`409` because every symbol is already followed is treated as success (a
repeated Continue after going back); a `422` because every entry is malformed
names each entry with its reason and discards nothing (AC-5; S02-3). If a
batch fails part-way, the entries not yet posted are named and kept in the
textarea for a retry, and the posted ones are counted as followed. The stepper
summary becomes *{n} followed stocks*; step 4 becomes current.

**Step 3, Add later.** **Continue** passes step 3 with no symbols and posts
nothing; step 4 becomes current. With no stock followed, step 4 shows **Start
download** `blocked` with CAP-001's `no_active_instruments` reason, *No stocks
are followed. Follow stocks before downloading.*, derived from `active_count`
0 without a request, and two exits: **Go to Home**, where Home shows its
honest empty state with **Start setup** (AC-21), and **Manage followed
stocks**, which opens `/data/followed`. Setup stays incomplete, so `/` keeps
opening `/setup` until a download is started from setup or Data health; no
setup flag is stored (DEC-0202; capability flow 1 step 7).

**Step 4, Start download.** `POST /api/acquisition-runs`. `202` with
`queued_behind` null: the progress bar and text appear; `/` now opens Home
(S02-6). `202` with `queued_behind` set: *A download is running. This starts
when it finishes.* in place of the progress bar until the queued download
starts. `409` `history_depth_not_set`: *Couldn't start the download: history
depth isn't set.* with a link **Go to step 2**; `409` `no_active_instruments`:
*Couldn't start the download: no stocks are followed.* with **Go to step 3**.
**Start download** is not blocked when the key is missing: CAP-001 blocks a
start only for an unset depth or an empty followed list (CAP-001 v5 §1.1,
§1.4) and AC-17 preserves that; the download fails and Home shows the *Failed*
download item and the missing-key item (DEC-0203). Starting a download is
routine, no confirmation (blueprint §9).

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton step list and a card skeleton at the step card's shape (S02 §7) |
| Empty, never populated | Step 1 current with nothing done |
| Empty, nothing found | Step 3 with zero accepted symbols: **Continue** `blocked` with its reason (S02 §7); step 4 with no stock followed (after *Add later*): **Start download** `blocked` with the `no_active_instruments` reason, with **Go to Home** and **Manage followed stocks** |
| Partial | Step 3 with rejected or duplicate entries: both counts, the accepted kept (S02-3); some steps done, the rest to do |
| Stale | Not applicable to the steps: setup re-derives every step from the server on load (S02 §7); step 4's progress line, the one polled region, carries *checked {time}* (0.4) |
| Unavailable | Step 1 and step 4's key line `coverage-unknown` while health is unreachable, never *Missing*; step 4's progress while the attention read fails: *Progress can't be read right now* beside the running state, never a frozen bar presented as current |
| Error | A failed read of the depth or the followed count: that step's summary reads *Couldn't read {history depth / the followed list}: {reason}* with **Try again**; other steps unaffected. A failed save: the field-level error naming the step and the reason, values kept (S02 §7). A `409` on step 4: the refusal above, with the step that fixes it |
| Unreachable | Shell state (0.5) |

#### Token Usage

Stepper per its spec §6: done dot `--foreground` with a `--background` check,
current ring `--status-active` with `--status-active-muted`, to-do outline and
connector `--border`, labels `--foreground` and `--muted-foreground`, step
numbers `--font-numeric` at `--text-xs`. Card `--card` / `--card-foreground`,
`--border`. Field boundaries `--input` (3:1), focus `--ring`, error text and
border `--destructive`, descriptions and the counter `--muted-foreground`,
rejected-entry markers `--status-warning`. Key presence `--status-good` /
`--status-critical` on their muted grounds; not determinable
`--value-indeterminate` on `--value-indeterminate-muted` with
`--pattern-indeterminate`. Radio cards `--border` with a 1 px `--foreground`
selected ring. Progress track `--seq-1`, indicator `--status-active` (download
in progress), value text `--font-numeric`. Spacing `--space-6` between the
columns, `--space-4` inside the card, `--space-5` between card regions.

#### Accessibility

The step list is a `nav` labelled *Setup steps* holding an `ol`; the current
step carries `aria-current="step"`; done steps' state is in text (*How far
back, done*). The step card is a `section` labelled by its `h2`, and focus
moves to that `h2` when the step changes (S02 §9). The radio group is one tab
stop with roving focus and arrow keys (Radix). The textarea's counter is a
polite live region tied to the field by `aria-describedby`; rejected entries
are announced with their reason. The years suffix is part of the input's
accessible name. `button` `blocked` stays focusable and exposes its reason
through `aria-describedby`. The progress bar is a `progressbar` labelled by
the visible *{done} of {total} stocks*, announced through the card's polite
region at the 10 s cadence, never per frame. The key's value appears in no
state, name, tooltip or error (AC-4).

### 1.3 Home (S01, `/home`)

S01 §2 M1 regions: the header row, the data tile alone in the summary row at
one-third width, and *Needs you* beside it. No paper or live tile, no *Your
strategies* list, no **+ New strategy**, no *next rebalance*, and no
placeholder for any of them (AC-10; S01-7). Owned by `home-ui`, reading the
shell's attention and summary reads (system design §3.3).

#### Page Layout

Main region capped at 1180 px, regions stacked `--space-5` apart (S01 §3).

1. **Header row.** `h1` *{Weekday}, {YYYY-MM-DD}* at `--text-xl`, the session
   date being today's calendar date in America/Chicago (DEC-0209; 0.8). Under
   it the as-of line at `--text-xs` `--muted-foreground` (blueprint §4.8):
   *{market state} · prices current to {prices_as_of} · checked {time}*, where
   the market state is *Market closed* on Saturdays, Sundays and weekdays
   outside 08:30 to 15:00 America/Chicago, and inside those weekday hours a
   `badge` `coverage-unknown` *Market state not determinable* with the tooltip
   and visually hidden text *FactorFlow has no trading calendar, so it can't
   tell a session from a holiday.* (DEC-0206, PROVISIONAL); `prices_as_of` is
   a session date, unconverted, or *prices not downloaded yet* when null;
   *checked {time}* is the attention read's `checked_at` (STD-UI-25). The row
   has no right-hand action in M1.
2. **Summary row.** A three-column grid holding the data tile in the first
   column; the other two columns are empty, not placeholders (S01 §2).
   **Data tile**: a `card` `metric` whose whole surface is one link to
   `/data`, titled *Data* at `--text-lg`. Under the title the tier `badge`:
   the worse of two tiers by blueprint §4.1's order (critical, serious,
   warning, good, neutral; active beside good), with the label of whichever
   wins (DEC-0210 as the owner amended it on 2026-10-25, PROVISIONAL). One is
   the verdict tier, from the same `worstDataTier` call Data health's verdict
   makes, over attention's `problems.stock_count`, `followed_count` and
   `latest_terminal_download`, labelled with its answer word (`status-good`
   *Yes*, `status-warning` or `status-serious` *Mostly yes*, `status-critical`
   *No*; 1.4). The other is the blueprint §8 score-state tier from the
   summary, labelled as the Factor scores card labels it (*Score update
   failed*, *Not reflecting the latest download*; 1.4). Neutral and active
   score states (*No scores yet*, *Updating*) never worsen the badge, and a
   score state that is not determinable contributes no tier. The tile reads
   nothing from `GET /api/data-health` (review v1 FINDING-4). Never-acquired
   replaces both tiers (DEC-0210 as amended): while attention's
   `latest_terminal_download` is null no download has ever ended (the signal
   Data health already uses), and the tile shows no verdict tier and no
   *Yes*. Before any download is requested Home shows its empty state
   (States); from the first request until a download ends the tile is in the
   first-download-running state: under the title, `badge` `status-active`
   *Downloading* while `latest_download.state` is `running` and no badge
   otherwise, and in place of the hero line and the as-of lines the one
   sentence *The first download, started {start time}, is running.*, the time
   being `latest_download.started_at`, or `requested_at` while it waits to
   start. The tile renders no progress; the *Your first download is running*
   item carries it. Once a download has ended the tile renders in full. The
   hero line
   *{current} of {followed} stocks current* at `--text-2xl` `--font-numeric`
   takes both figures from the summary's `stocks_current`, `current_count`
   and `followed_count`, counted over the score set's active instruments,
   when the summary is served, so one population is counted (review v1
   FINDING-7); while it is not served, `followed` is attention's
   `followed_count` and `current` an em dash in `--value-missing` with the
   visually hidden text *not determinable* (AC-8; STD-UI-4). Then two
   as-of lines, *Scores {YYYY-MM-DD HH:MM zone}* from the summary's current
   set and *Prices {YYYY-MM-DD}* from `prices_as_of` (S01-6), each an em dash
   with *not determinable* when its source is not served; then the sentence
   *Every other number on this page is as of those times.* When the summary's
   `set.not_current` is true, or its `later` block reports a newer set
   building or failed, the tile adds `badge` `status-warning` *Not reflecting
   the latest download* under the as-of lines (AC-8; S01 §7 Stale).
3. **Needs you.** A `card` `default` beside the tile, spanning the remaining
   two columns of the summary row and the full width below it. Header `h2`
   *Needs you · {n}* with the sub-line *Most important first. Nothing here is
   urgent unless marked.* and, right-aligned at `--text-xs`, *checked {time}*
   (S01 §3; STD-UI-25). Then the list of blueprint §4.1 items, one row each:
   a 28 px severity tile (tier fill, tier shape, `aria-hidden`), the tier
   `badge` with the item's tag, a one-line title at weight 600, one or two
   sentences of body, and exactly one action at the right, a link styled as
   `button` `outline` (no *Ready* item exists before M5). Rows are separated
   by `--border`.

**The M1 item catalogue** (DEC-0203, PROVISIONAL; brief §2.4, copy finalised
here in the shapes the brief fixed). Items are merged from the three
server-derived kinds and the two score-derived kinds and sorted by tier
(critical, serious, warning, good, neutral; active sorts with good) then
newest first by the shared `sortAttention`; the Home chip is that list's
length.

| Kind | Source | Tag, tier | Title | Body | Action, target |
|------|--------|-----------|-------|------|----------------|
| Followed stocks with problems | attention `items` `data_problems`; `problems.symbols`, `problems.stock_count`; recency `problems.newest_completed_at` | *Data*, warning | *{A}, {B} and {C} are missing data* for up to three symbols; *{A}, {B}, {C} and {k} more stocks are missing data* beyond three; *{A} is missing data* for one | *Their scores show as Incomplete until the data is complete.* (singular: *Its scores show as Incomplete until the data is complete.*) | **Fix data**, `/data` |
| Latest download not complete | attention `items` `download_not_complete`; `latest_terminal_download` `{run_id, state, ended_at, failure_reason}` | *Download*, critical when *Failed*, serious when *Interrupted* | *The last download failed* / *The last download was interrupted* | *{failure_reason}. Ended {ended_at}.* / *FactorFlow restarted mid-download. Download again to pick up the rest. Ended {ended_at}.* | **See download**, `/data/downloads/{run_id}` |
| Market data key missing | attention `items` `credential_missing`; recency the health check time | *Setup*, critical | *The market data key is missing* | *Set `FACTORFLOW_MASSIVE_API_KEY` and restart FactorFlow. Downloads fail until then.* | **Open Settings**, `/settings` |
| First download, or first scores, before any score set exists | attention `latest_download` non-terminal, or summary `later` building, while summary `never_classified` is true; recency `requested_at` | *Download* / *Scores*, active | *Your first download is running* / *Your first scores are being produced* | *{done} of {total} stocks so far. Scores appear when it finishes.* / *Scores appear when this finishes.* (AC-7) | **See download**, `/data/downloads/{run_id}` |
| Latest score update failed | summary `later` failed; recency its `ended_at` | *Scores*, critical | *The latest score update failed* | *{reason}. Scores still show the set from the download started {start time}.* | **See details**, `/data` |

Every action navigates; none mutates (S01 §6). An item is present exactly
while its cause holds in the latest read, so it leaves when the cause is
resolved and never because it was viewed (AC-9; S01-4).

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Data tile | `card` | `metric`, the whole card one link | `design-system/components/card/design-spec.md` |
| Data tier label; *Not reflecting the latest download* | `badge` | `status-<tier>` of the winning tier, or at most `status-active` *Downloading* while no download has ended; `status-warning` | `design-system/components/badge/design-spec.md` |
| Figures that cannot be determined; the market state inside session hours | `badge` and em dash | `coverage-unknown`; `--value-missing` em dash | `design-system/components/badge/design-spec.md` |
| Needs you card | `card` | `default` | `design-system/components/card/design-spec.md` |
| Needs-you item | composition, blueprint §4.1 (`web/src/components/patterns/`) | `card` row, `badge`, `button` | `design-system/components/badge/design-spec.md`, `design-system/components/button/design-spec.md` |
| Item tag | `badge` | `status-<tier>` per the catalogue | `design-system/components/badge/design-spec.md` |
| Item action (a link) | `button` | `outline` | `design-system/components/button/design-spec.md` |
| Start setup (empty state) | `button` | `default`, a link to `/setup` | `design-system/components/button/design-spec.md` |
| Try again (error states) | `button` | `outline` | `design-system/components/button/design-spec.md` |

#### Interaction Flows

Nothing on Home mutates state (S01 §6). The data tile opens `/data`; each
item's action opens its target; the item is still present if its cause still
holds on return. *Needs you* and the tile refresh on the attention and
summary cadences (0.4); a changed count is announced politely through the
card's live region and focus never moves (S01 §6). The header's market state
is recomputed from the clock each minute without a read (DEC-0206).

#### States

S01 §7, specialized by brief §2.4.

| State | Rendering |
|-------|-----------|
| Loading | Skeleton header line, a skeleton tile and three skeleton item rows (S01 §7) |
| Empty, never populated | `latest_download` null: not a redirect. The summary row and the list give way to one `card` `default`: `h2` *No data has been downloaded yet.*, the line *Set up FactorFlow to name the stocks to follow and start the first download.*, and **Start setup** (a link to `/setup`) (AC-21; DEC-0202; system design §3.3 box 5). The header still renders |
| Empty, first download running | `latest_download` set and `latest_terminal_download` null: the data tile shows the first-download-running state (Page Layout 2), with no verdict tier and no *Yes*, `status-active` *Downloading* at most and the sentence *The first download, started {start time}, is running.*; the score-state tier is not shown either (DEC-0210 as amended; system design §3.3 box 21). *Needs you* renders as usual, with the *Your first download is running* item |
| Empty, nothing found | *Needs you* with zero items: the body reads *Nothing needs you right now.* with *checked {time}* (S01 §7) |
| Partial | The data tile at its warning tier with its counts; the affected stocks named in a *Needs you* item (S01 §7) |
| Stale | `badge` `status-warning` *Not reflecting the latest download* on the tile when scores lag the latest download (AC-8); *checked {time}* ages while the attention read fails |
| Unavailable | Score figures render not determinable while the summary answers `404` (the current count, the scores as-of, and the first-scores and score-failed items are not derivable; the server items still render); the market state inside session hours is `coverage-unknown`; the price as-of is an em dash with *not determinable* while attention fails |
| Error | Per card, header kept, body replaced by *Couldn't read {what needs you / the data summary}: {reason}.* and **Try again** (S01 §7); a summary error other than `404` renders the score figures' error the same way inside the tile |
| Unreachable | Shell state (0.5) |

#### Token Usage

`--card` / `--card-foreground`, `--border`; `h1` `--text-xl`, card titles
`--text-lg`, the hero count `--text-2xl` in `--font-numeric`, as-of lines and
*checked* at `--text-xs` `--muted-foreground` (4.5:1 on `--card`, checked not
assumed); tier badges `--status-<tier>` on `--status-<tier>-muted`; the
severity tile the tier's `--status-<tier>` fill with its shape in
`--status-foreground`; not determinable `--value-indeterminate` on
`--value-indeterminate-muted` with `--pattern-indeterminate`; the em dash in
`--value-missing`; item action `--input` border, `--ring` focus; grid gaps
`--space-5`, item padding `--space-3` by `--space-4`. No `--gain` or `--loss`:
no signed figure exists on Home in M1.

#### Accessibility

`main` with the date `h1`; each card is a `section` labelled by its `h2` (S01
§9). The data tile is a single link whose accessible name combines its title,
tier and figures: *Data: mostly yes. 1,233 of 1,236 stocks current. Scores
2026-10-15 17:46 CDT, prices 2026-10-15.* In the first-download-running
state it is *Data: downloading. The first download, started 2026-10-15 17:31
CDT, is running.* The item's severity tile is
`aria-hidden` and the tag badge carries the tier in words (S01 §9); the list
is a `ul` of `li`s and each action's accessible name names the item (*Fix data
for KO, TSLA and FBXX*, *See the download that failed*, *Open Settings to set
the market data key*). A changed count announces politely. The market state
is text; the em dash carries visually hidden *not determinable* so a screen
reader never hears a bare dash. No colour encodes direction (STD-UI-8).

### 1.4 Data health (S09, `/data`)

S09 §3 to §9 delivered for M1: the verdict, three check cards (Live prices is
M3), *Needs fixing* with its recoveries, Recent downloads without the schedule
line (M2, D-2), and What you follow without the broker row (M2). Owned by
`data-health-ui`, reading `GET /api/data-health` on demand (DEC-0200,
PROVISIONAL) and the shell's attention and summary reads.

#### Page Layout

Reading width, 1180 px cap, regions stacked `--space-5` apart (S09 §3).

1. **Header row.** `h1` *Is the data good enough to trust?* at `--text-xl`.
   Under it the verdict: a `badge` with the tier from `worstDataTier` and the
   one-sentence verdict composed in the interface (DEC-0210 and DEC-0217 as
   the owner amended them on 2026-10-25, PROVISIONAL; DEC-0200). The tier and
   the opening word come from two inputs only: the problem set
   (`affected_count`, *n*, against `followed_count`, *m*) and attention's
   `latest_terminal_download`. The worst applicable row wins by the order
   critical, serious, warning, good; the check cards and the score state
   contribute no tier (review v1 FINDING-8, FINDING-9). The badge is the
   sentence's opening clause, so the line reads as one sentence with the
   badge as its first word:

   | Tier | When | Badge | Sentence after the badge |
   |------|------|-------|--------------------------|
   | good | no followed stock is affected, and the latest terminal download neither failed nor was interrupted | `status-good` *Yes* | *None of the {m} followed stocks needs attention.* |
   | warning | some, not every, followed stock is affected | `status-warning` *Mostly yes* | *{n} of {m} followed stocks need attention; their scores show as Incomplete until they're fixed.* (singular: *1 of {m} followed stocks needs attention; its scores show as Incomplete until it's fixed.*) |
   | serious | the latest terminal download is *Interrupted* | `status-serious` *Mostly yes* | the count clause above, then *, and the last download was interrupted.* |
   | critical | every followed stock is affected, or the latest terminal download *Failed* | `status-critical` *No* | the count clause above, then *, and the last download failed.* when the download failed |

   The download clause follows the count clause whenever the latest terminal
   download failed or was interrupted, whichever row wins. In M1 the sentence
   names no strategy; S09 §3's strategies clause returns with M2 (0.8). Under
   the sentence, the as-of line at `--text-xs`: *checked {time}* from
   `checked_at`. Right of the `h1`: **Full coverage table** (a link to
   `/data/coverage` styled `button` `outline`) and **Download now** (`button`
   `default`). A check that is not determinable changes no tier and is named
   after the sentence: *Daily prices can't be checked for gaps: {reason}.*
2. **Check cards.** Three `card` `metric` in a four-column grid, the fourth
   column empty with no placeholder (S09 §2). Each: the tier `badge` with the
   check's name as its label is not used; instead the card title is the
   check's name as `h2` at `--text-lg`, the tier `badge` beside it with the
   state label from brief §12.2, a bold one-line result at `--text-base`, and
   one `--text-xs` line with the as-of and the named exceptions (S09 §3).

   | Card | Tier and label | Result line | As-of line and exceptions |
   |------|----------------|-------------|---------------------------|
   | *Daily prices* (`checks.daily_prices`) | `status-good` *No missing prices or gaps* when `status` is `ok`; `status-warning` *Needs attention* when `exceptions`; `coverage-unknown` *Not determinable* when `not_determinable` (S09 §7's Stale state is not rendered: §0.8) | *All {m} stocks have prices to {latest_session}* or *{absent_count} without prices, {gap_stock_count} with gaps, {behind_count} behind {latest_session}* (a zero part is omitted) | *Prices to {latest_session}* then up to five `exception_symbols` *and {k} more*. When `gap_detection.available` is false the gap part reads *Gaps not determinable: {gap_detection.reason}* as `coverage-unknown` while absence and currency still render (capability flow 2 step 7; DEC-0201). A scope note under the line, *Gaps and currency are judged against the days and the newest session other followed stocks hold. FactorFlow has no trading calendar, so a day with no download leaves nothing to detect.* with **Full coverage table** as its link (STD-UI-18; S09 §8; DEC-0201, DEC-0206) |
   | *Company financials* (`checks.company_financials`) | `status-good` *All financials present* when `status` is `ok`; otherwise as above | *All {m} stocks have financials* or *{absent_count} without financials, {problem_count} with failed downloads* | *Financials to {as_of}* (a timestamp with the zone) then exceptions as above; a scope line *Checks that financials are present and downloaded, not that they are correct.* (STD-UI-18) |
   | *Factor scores* (the shell's summary) | `coverage-unknown` *Not determinable* while the summary answers `404`; `status-neutral` *No scores yet* while `never_classified`; `status-active` *Updating* while `later` reports a set building; `status-critical` *Score update failed* when `later` failed; `status-warning` *Not reflecting the latest download* when `set.not_current`; else `status-good` *Current* | *{current} of {followed} stocks current*, both from the summary's `stocks_current` as on Home's tile (1.3), and when any are not, *{k} stocks show as Incomplete until their data is complete*, *k* being that `followed_count` minus `current_count` (S09 §11) | *Scores {YYYY-MM-DD HH:MM zone} · from the download started {start time}* (the time a link to `/data/downloads/{run_id}`); *FactorFlow can't read scores yet.* while not served |

3. **Needs fixing · {n}** (`card` `default`). Header `h2` with the count, the
   sub-line *From your most recent downloads · checked {time}* (problems are
   each stock's latest recorded outcome, which may span downloads, DEC-0201),
   and **Download now** (`button` `default`) only when at least one row is
   `retryable` (S09 §3; AC-14). One row per stock from `problems.rows`,
   ordered by symbol, a `ul` of `li`s:
   - the symbol at weight 600 as a link to `/data/coverage?symbol={SYMBOL}`;
   - per failure in `failures[]`, the outcome `badge`, `status-critical`
     *Failed* or `status-warning` *Not found*, then what failed in words:
     *Downloading {daily prices / company financials / corporate actions /
     reference data} failed: {reason}, {attempts} attempts* or *The provider
     doesn't recognise this symbol.* (S09 §8; S09-2);
   - a second line at `--text-xs` with the M1 consequence, *Its scores show
     as Incomplete until this is fixed, and so does every universe holding
     it.* (DEC-0201; universes are not enumerated);
   - the fix: for *Failed*, *Download again to retry; data already stored is
     never duplicated or overwritten.* (S09 §8), no per-row control, the
     header's **Download now** being the action (D-9); for *Not found*, the
     row's own **Stop following** (`button` `ghost`) and **Follow a different
     symbol** (`button` `outline`, a link) with *Probably a typo or a delisted
     ticker. Downloading again won't help.* (AC-13, AC-14; S09-3).
   After 50 rows, **Show more** (`button` `outline`) appends the next page
   from `GET /api/data-health/problems?cursor={last symbol}&limit=50`
   (STD-UI-30).
4. **Two columns**, `--space-5` apart.
   - **Recent downloads** (`card` `default`, `h2` *Recent downloads*,
     sub-line *Starts when you press Download now · checked {time}*: the
     first part S09 §11's wording before M2, the time that of the last
     successful read of the list, shown while it polls and otherwise,
     STD-UI-25, AC-25):
     a `data-table` `compact` with `history` semantics, the five most recent
     from `GET /api/acquisition-runs?limit=5`, columns *Started* (the start
     time with the zone, the row header, a link to `/data/downloads/{id}`),
     *Outcome* (the blueprint §8 `badge`), *Ended* (the end time, or an em
     dash while running), *Result* (*{written} of {named} stocks*; for
     *Interrupted*, *FactorFlow restarted mid-download; {written} kept, the
     rest picked up next time*, S09 §8; for *Partial*, *{written} of {named}
     stocks, {failed} failed*). A running download heads the list with
     `progress` `determinate` and *{done} of {total} stocks* in its Result
     cell, re-read on each 10 s attention tick (S09 §6).
   - **What you follow** (`card` `summary`, `h2` *What you follow*): a
     description list, *Followed stocks* *{n}*, *Stopped following* *{k}
     (history kept)*, *History depth* *{y} years* or *not set* as a link to
     `/settings`, *Market data key* `badge` *Found* / *Missing* /
     `coverage-unknown` *Not determinable* (never the value; S09-4); no
     broker row; footer **Manage followed stocks** (a link to
     `/data/followed` styled `button` `outline`).

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Check cards | `card` | `metric` | `design-system/components/card/design-spec.md` |
| Verdict tier; check tiers; score states; *Failed* / *Not found* on rows; download outcomes; key presence | `badge` | `status-neutral` / `status-active` / `status-good` / `status-warning` / `status-serious` / `status-critical` per brief §12.2 | `design-system/components/badge/design-spec.md` |
| Not determinable (gap part, null checks, Factor scores before served, key while unreachable) | `badge` | `coverage-unknown` | `design-system/components/badge/design-spec.md` |
| Download now (header and *Needs fixing*); Start the first download | `button` | `default`, one per region | `design-system/components/button/design-spec.md` |
| Full coverage table; Follow a different symbol; Manage followed stocks; Show more; Try again | `button` | `outline` (links where they navigate) | `design-system/components/button/design-spec.md` |
| Stop following (in row) | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Stop following confirmation | `dialog` | `confirm` | `design-system/components/dialog/design-spec.md` |
| Needs fixing, Recent downloads | `card` | `default` | `design-system/components/card/design-spec.md` |
| Problem row | composition: `badge` + text + `button` (S09 §4) | n/a | `design-system/components/badge/design-spec.md`, `design-system/components/button/design-spec.md` |
| Downloads list | `data-table` | `compact` with `history` semantics (no selection, no row actions) | `design-system/components/data-table/design-spec.md` |
| Running download's progress | `progress` | `determinate` | `design-system/components/progress/design-spec.md` |
| What you follow | `card` | `summary` | `design-system/components/card/design-spec.md` |

#### Interaction Flows

**Download now** (header or *Needs fixing*, the same action) posts
`POST /api/acquisition-runs`, routine, no confirmation (blueprint §9; S09 §6).
`202` with `queued_behind` null: the download heads Recent downloads with its
progress, and the checks refresh once when it ends. `202` with
`queued_behind` set: the button's helper line reads *A download is running.
This starts when it finishes.* (AC-15). `409` `history_depth_not_set`:
*Couldn't start the download: history depth isn't set.* with **Set history
depth** linking to `/settings`; `409` `no_active_instruments`: *Couldn't start
the download: no stocks are followed.* with **Follow stocks** linking to
`/data/followed`. Download now downloads the whole followed list; there is no
per-stock retry (D-9), and the row copy says so.

**Stop following {SYMBOL}** (a *Not found* row) is consequential: `dialog`
`confirm` titled *Stop following {SYMBOL}* with the description *Stop
following {SYMBOL}? Its history is kept, and strategies holding it keep
holding it. You can follow it again later.* (blueprint §9, verbatim), actions
**Cancel** then **Stop following**, cancel first in DOM order and the initial
focus. Confirm sends `DELETE /api/instruments/{symbol}`; `200`: the dialog
closes, the row leaves, *Needs fixing*'s count and the rail chip refresh (the
aggregate is re-read and the shell re-reads attention), and *Stopped
following {SYMBOL}* is announced politely, no toast, because the change is
visible. `409` already stopped or `404`: the dialog stays open with *Couldn't
stop following {SYMBOL}: {reason}.* inside it; on close the row refreshes.

**Follow a different symbol than {SYMBOL}** navigates to `/data/followed`
with router state `{focusAdd: true}`, which focuses the add field (1.6).
Fixing a typo is two separate actions (D-9).

**Show more** appends the next 50 rows and keeps focus on the control; the
new row count is announced politely. A `422` on a bad cursor renders *Couldn't
read more problems: {reason}.* with **Try again**, which restarts from the
first page.

**Links.** **Full coverage table** opens `/data/coverage`; a problem row's
symbol opens `/data/coverage?symbol={SYMBOL}`; **Manage followed stocks**
opens `/data/followed`; a Recent downloads row's start time opens
`/data/downloads/{id}`.

**Refresh.** The aggregate is read on load, on **Try again**, once when the
attention read shows the latest download turned terminal, and after **Stop
following** succeeds, never on an interval (system design §3.4 note 1).
Recent downloads re-reads on each 10 s attention tick while a download runs
and the running row's progress updates; polling announces politely and never
moves focus (S09 §9).

#### States

S09 §7, specialized by brief §2.5.

| State | Rendering |
|-------|-----------|
| Loading | Skeleton verdict line and badge, three skeleton cards, skeleton rows in the three lower cards (S09 §7) |
| Empty, never populated | No download has ever ended (attention's `latest_terminal_download` absent), not coverage's `never_acquired`: the verdict, the check cards and What you follow give way to one `card` `default` under the `h1`: `h2` *No data has been downloaded yet.*; when at least one stock is followed, *Download data for your {n} followed stocks to see whether it can be trusted.* and **Start the first download** (`button` `default`, the same post as Download now); when none is followed, *Follow some stocks first.* and **Open setup** (a link to `/setup`). *Needs fixing* and Recent downloads still render below it whenever problems or downloads exist, so a running first download shows its progress. No check renders as passed (AC-21; S09-5). Once a download has ended the screen renders in full even if nothing was stored: `never_acquired` then drives only the check cards, whose null checks render `coverage-unknown` *Not determinable* with *Nothing has been stored yet.*, while the problem rows say why (review v1 FINDING-10) |
| Empty, nothing found | *Needs fixing · 0* reads *Nothing needs fixing.* with *Last complete download {start time}* from the most recent *Complete* row of Recent downloads, or *No complete download yet* (S09 §7) |
| Partial | The check cards name their exceptions with counts; the *Partial* or *Interrupted* row in Recent downloads is shown as such, never as complete (AC-12; S09-1) |
| Stale | Not detectable on the check cards in M1: the Daily prices scope note states that currency is judged against the newest session any followed stock holds (§0.8; DEC-0201, DEC-0206); Factor scores carries *Not reflecting the latest download* when `set.not_current` |
| Unavailable | The gap part of Daily prices as `coverage-unknown` with `coverage-service`'s reason; Factor scores `coverage-unknown` before the summary is served; the key presence `coverage-unknown` while health is unreachable (S09 §7) |
| Error | Per card, header kept, body replaced by *Couldn't read {what needs attention / the data health checks / recent downloads / what you follow}: {reason}.* and **Try again** (S09 §7); the verdict's read is attention, so its failure renders there. A `500` envelope's `request_id` is never shown |
| Unreachable | Shell state (0.5) |

#### Token Usage

`--card` / `--card-foreground`, `--border`; `h1` `--text-xl`, card `h2`s
`--text-lg`, result lines `--text-base` weight 600, as-of lines, sub-lines and
consequences `--text-xs` `--muted-foreground`; tier badges `--status-<tier>`
on `--status-<tier>-muted`; not determinable `--value-indeterminate` on
`--value-indeterminate-muted` with `--pattern-indeterminate`; the table's
separators `--border`, header text `--muted-foreground`, body `--text-sm`,
times and counts `--font-numeric`, `--row-height-compact` through the
`compact` variant, an em dash in `--value-missing` for a download not yet
ended; progress track `--seq-1`, indicator `--status-active`; dialog
`--popover` / `--popover-foreground`; buttons `--primary` /
`--primary-foreground` (default), `--input` border (outline), `--ring` focus.
Spacing `--space-5` between regions, `--space-4` inside cards, `--space-3`
between a row's lines.

#### Accessibility

Each card is a `section` labelled by its `h2` (S09 §9). The verdict line is
one sentence to a screen reader (the badge's text is its first clause).
Problem rows are list items; each action's accessible name includes the
symbol: *Stop following FBXX*, *Follow a different symbol than FBXX*, and the
symbol link reads *FBXX, show in the coverage table*. The Recent downloads
table carries the start time as its row header and column headers for
outcome, end and result; the running row's `progressbar` is labelled by its
visible text. The confirm dialog is `role="dialog"` with `aria-modal`, focus
trapped, cancel the initial focus, focus returned to the row's **Stop
following** on close (or to the *Needs fixing* heading when the row has left).
Polling updates and a row leaving announce politely and never move focus.
Every status carries its words and shape, so the greyscale rendering is the
test (STD-UI-8). The key's value never appears (S09-4).

### 1.5 Coverage (`/data/coverage`, taken over)

`CAP-001-ux-design` v5 §1.1, Coverage overview, at its new path in this
shell. The information architecture, the table's eleven columns, the row
expansion, the filter, the gap-detection rendering and the eight states are
v5's and are not restated; CAP-003 changes where and in which words the screen
is shown, never what it does (AC-17). Owned by `owner-web-app`.

#### Page Layout

As v5 §1.1: screen title, toolbar, one full-width table, no cards. The top-bar
title is *Data health › Coverage* (0.3); the screen's own `h1` is *Coverage*.
The toolbar holds the symbol filter (the table's own toolbar filter), the
lifecycle filter and the primary action. The table is `data-table`
`virtualised` with per-row expansion kept as v5 specified it, so that the
committed 3000 stocks render in a windowed list with server-side search,
filter and count (STD-UI-30; blueprint §13) in place of the windowed rendering
CAP-001 built by hand (AC-26; DEC-0205).

**Deltas against v5 §1.1** (brief §2.6):

| Delta | Detail |
|-------|--------|
| Path and title | `/coverage` redirects to `/data/coverage` for one release (AC-18); top-bar title *Data health › Coverage* |
| Labels | *instrument* → *stock* throughout (*Stock* column header, *No stock matches this filter.*, *No data has been downloaded yet.*); **Start acquisition run** → **Download now**; *Last acquired* → *Last downloaded*; lifecycle *Retired* → *Stopped following*. *Coverage*, *gap*, *history depth*, *trading day*, *Covered from*, *Covered to*, *Depth*, *Reference*, *Prices*, *Fundamentals*, *Corporate actions* are unchanged (the domain term is the display label, STD-UI-1) |
| Blocked reasons | **Download now** `blocked` beside *History depth is not set. Set it in Settings before downloading.* (depth unset) or *No stocks are followed. Follow stocks before downloading.* (no active stock); depth first when both hold, as v5 ordered them (AC-17; AC-19) |
| Queued message | *A download is running. This starts when it finishes.* (AC-15 wording, the same as Data health's) |
| Tiers | *Short by {n} years* stays `badge` `status-warning`; presence badges unchanged (`coverage-present` / `coverage-absent` / `coverage-unknown`); the gap-detection scope sentence below the table unchanged |
| Entry hint | `?symbol={SYMBOL}` seeds the symbol filter on load; the filter is editable and clearing it clears the query. A symbol the filter does not match renders v5's nothing-found state, *No stock matches this filter.* with the reset (system design §3.5 note 3) |
| Components | Rebuilt from `ui-components`: `data-table` `virtualised` (with the row expansion v5 specified), `select` `inline`, `badge`, `button` |
| Internal links | Starting a download routes to `/data/downloads/{run_id}`; the blocked reason's *Settings* is a link to `/settings` |

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Coverage table | `data-table` | `virtualised`, with per-row expansion | `design-system/components/data-table/design-spec.md` |
| Symbol filter | `data-table` toolbar filter | n/a | `design-system/components/data-table/design-spec.md` |
| Lifecycle filter | `select` | `inline` | `design-system/components/select/design-spec.md` |
| Data type presence | `badge` | `coverage-present` / `coverage-absent` / `coverage-unknown` | `design-system/components/badge/design-spec.md` |
| Stopped-following marker; *Short by {n} years* | `badge` | `secondary`; `status-warning` | `design-system/components/badge/design-spec.md` |
| Download now | `button` | `default`, or `blocked` with its reason | `design-system/components/button/design-spec.md` |

#### Interaction Flows

v5 §1.1 unchanged in outcome: reading coverage needs no interaction;
expanding a row by `Enter` or `Space` on the expander keeps focus and
announces politely; filtering applies server-side across the full set and
keeps existing rows visible and dimmed; **Download now** posts
`POST /api/acquisition-runs`, returns `202` and routes to the download's
detail at `/data/downloads/{run_id}`, queues with the message above when one
is running, and renders `blocked` with the two non-interchangeable reasons.

#### States

v5 §1.1's table, relabelled: loading skeleton at the expected row count;
never populated *No data has been downloaded yet.* with **Download now**
beside it (or `blocked` with its reason); nothing found *No stock matches this
filter.* with a reset; partial is the ordinary rendering; stale is the
toolbar's last-updated time (coverage does not poll); unavailable is the
*Gaps* column's `coverage-unknown` *Unknown* with its reason on expansion and
the STD-UI-18 sentence below the table; error keeps the header and toolbar
and replaces the body with *Couldn't read coverage: {reason}.* and **Try
again**; unreachable is the shell state.

#### Token Usage

v5 §1.1 unchanged: `--border`, `--muted-foreground`, `--foreground` on
`--background`, the presence pairs (`--status-good` / `--status-good-muted`,
`--value-missing` / `--value-missing-muted`, `--value-indeterminate` /
`--value-indeterminate-muted` with `--pattern-indeterminate`), `--secondary`,
`--font-numeric`, `--row-height`, `--cell-padding-x` / `--cell-padding-y`,
`--text-sm`.

#### Accessibility

v5 §1.1 unchanged: programmatic row and column headers, `aria-sort`, every
presence state carrying its word, the expander named for its row (*Expand
AAPL*), filtering that does not move focus, the new row count announced
politely. The accessible names use the display labels.

### 1.6 Followed stocks (`/data/followed`, taken over)

`CAP-001-ux-design` v5 §1.2, Instruments, at its new path. Owned by
`owner-web-app`.

#### Page Layout

As v5 §1.2: `h1` *Followed stocks*, a toolbar with the symbol filter, the
lifecycle filter, the count *{n} followed, {m} stopped following* and the add
field, then one table of active and stopped-following stocks with a lifecycle
column. Top-bar title *Data health › Followed stocks*.

**Deltas against v5 §1.2** (brief §2.6):

| Delta | Detail |
|-------|--------|
| Path and title | `/instruments` redirects to `/data/followed` for one release (AC-18) |
| Labels | *Instruments* → *Followed stocks*; **Add instrument** → **Follow a stock**; **Add many** → **Follow many**; **Retire** → **Stop following**; *Retired* → *Stopped following*; *active* → *followed*; *No instruments named yet.* → *No stocks followed yet.*; *No instrument matches this filter.* → *No stock matches this filter.*; the add field's accessible name *Symbol of the stock to follow* |
| Stop following confirmation | `dialog` `confirm` with blueprint §9's wording: *Stop following {SYMBOL}? Its history is kept, and strategies holding it keep holding it. You can follow it again later.*, confirm label **Stop following**. v5's two conditional sentences stand, relabelled: *A download is running and will still download {SYMBOL} this time. Stopping takes effect from the next download.* (CAP-001 AC-25) and, when it applies, the gap-detection consequence |
| Recognition | `badge` `status-warning` *Not found* for a stock the provider does not recognise (blueprint §8) |
| Entry hint | Opened with router state `{focusAdd: true}` (from **Follow a different symbol**), the add field receives focus on mount |
| Components | Rebuilt from `ui-components`: `data-table` `virtualised` (STD-UI-30), `form` `inline` + `input` `text` for the single add field, `textarea` `list` for **Follow many**, `button` `default` / `ghost`, `dialog` `confirm`, `badge`, `select` `inline` |
| Internal links | A stock's coverage link opens `/data/coverage?symbol={SYMBOL}` |

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Followed-stock table | `data-table` | `virtualised`, with the row expansion v5 specified | `design-system/components/data-table/design-spec.md` |
| Add field | `form` + `input` | `inline` + `text` | `design-system/components/form/design-spec.md`, `design-system/components/input/design-spec.md` |
| Follow many | `textarea` | `list` | `design-system/components/textarea/design-spec.md` |
| Follow a stock | `button` | `default` | `design-system/components/button/design-spec.md` |
| Stop following (in row) | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Stop following confirmation | `dialog` | `confirm` | `design-system/components/dialog/design-spec.md` |
| Lifecycle and recognition markers | `badge` | `secondary` for stopped following; `status-warning` *Not found* | `design-system/components/badge/design-spec.md` |
| Lifecycle filter | `select` | `inline` | `design-system/components/select/design-spec.md` |

#### Interaction Flows

v5 §1.2 unchanged in outcome: following validates format only and never
against the provider; a duplicate of a followed stock is a field error, a
duplicate of a stopped-following one offers to follow it again; **Follow
many** parses on paste and blur and keeps accepted entries when some are
rejected (AC-5 shares this parser with setup); **Stop following** opens the
`confirm` dialog, never `destructive`, because nothing is deleted (STD-UI-2),
with cancel first and the initial focus, and the stock's history stays
visible on Coverage.

#### States

v5 §1.2's table, relabelled: skeleton; *No stocks followed yet.* with the add
field focused; *No stock matches this filter.* with a reset; partial not
applicable (a stock is followed or it is not; recorded); last-updated time;
unavailable not applicable (no check runs here); error replaces the body,
offers **Try again** and preserves the add field's value; unreachable is the
shell state.

#### Token Usage

v5 §1.2 unchanged: table tokens as in 1.5, stopped-following rows
`--muted-foreground` with the `--secondary` badge, `--status-warning` on
`--status-warning-muted` for *Not found*, `--input` for the add field's
boundary at 3:1, `--destructive` for a field error.

#### Accessibility

v5 §1.2 unchanged with the display labels: the add field's accessible name
states what is followed; the row action reads *Stop following AAPL*, never a
bare label repeated 3000 times; dialog focus trapped and returned to the
triggering row action.

### 1.7 Downloads (`/data/downloads`, taken over)

`CAP-001-ux-design` v5 §1.4, Runs, at its new path. Owned by `owner-web-app`.

#### Page Layout

As v5 §1.4: `h1` *Downloads*, a toolbar with the outcome filter, the
last-updated time and **Download now**, one `data-table` `history` in reverse
chronological order with a running download pinned to the top. Top-bar title
*Data health › Downloads*.

**Deltas against v5 §1.4** (brief §2.6):

| Delta | Detail |
|-------|--------|
| Path and title | `/runs` redirects to `/data/downloads` for one release (AC-18) |
| Labels | *Runs* → *Downloads*; **Start acquisition run** → **Download now**; the first column is *Started*, the start time with the zone as the link to the detail (the download's name until OQ-1 is answered; replaces v5's run id link, since no raw `run_id` appears on any surface, CAP-002's DEC-0083); *Requested*, *Ended* unchanged; *Instruments written* → *Stocks downloaded*; *Instruments failed* → *Stocks failed*; *No acquisition run has been requested yet.* → *No download has been requested yet.*; *No run matches this filter.* → *No download matches this filter.* |
| Outcomes | The eight states as blueprint §8 labels them through the one tier function: *Queued* neutral, *Downloading* active, *Stopping* warning, *Complete* good, *Partial* warning (never good), *Failed* critical, *Cancelled by you* neutral (never critical), *Interrupted* serious (AC-20; STD-UI-12) |
| Blocked reasons and queued message | As 1.5 |
| Components | Rebuilt from `ui-components`: `data-table` `history`, `select` `inline`, `badge`, `button` |
| Internal links | Each row's start time opens `/data/downloads/{id}`; starting a download routes there too |

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Downloads table | `data-table` | `history` | `design-system/components/data-table/design-spec.md` |
| Start time, opening the detail | link in the first column | n/a | `design-system/components/button/design-spec.md` §1 directs navigation to a link |
| Outcome | `badge` | the six `status-*` variants per blueprint §8 | `design-system/components/badge/design-spec.md` |
| Outcome filter | `select` | `inline` | `design-system/components/select/design-spec.md` |
| Download now | `button` | `default` or `blocked` | `design-system/components/button/design-spec.md` |

#### Interaction Flows

v5 §1.4 unchanged: the table polls every 10 s while any download is
non-terminal and stops when none is, with the toolbar's last-updated time
(STD-UI-25); `Enter` on the focused start-time link opens the detail and
middle-click opens it in a new tab; **Download now** as in 1.5.

#### States

v5 §1.4's table, relabelled: skeleton; *No download has been requested yet.*;
*No download matches this filter.* with a reset; a running download shown
beside finished ones; last-updated time while polling; unavailable not
applicable; error replaces the body with *Couldn't read downloads: {reason}.*
and **Try again**; unreachable is the shell state.

#### Token Usage

v5 §1.4 unchanged: the six tier pairs, `--text-xs` and `--font-numeric` for
timestamps and counts, table tokens as in 1.5.

#### Accessibility

v5 §1.4 unchanged: each outcome badge carries its word and shape; the polled
region announces politely and never steals focus; the start-time link's
accessible name reads *Download started 2026-10-15 17:31 CDT, open details*.

### 1.8 Download detail (`/data/downloads/:id`, taken over)

`CAP-001-ux-design` v5 §1.5, Run detail, at its new path. Owned by
`owner-web-app`. The target of **See download** from Home and of every Recent
downloads row.

#### Page Layout

As v5 §1.5: a `card` `summary` holding the download's outcome, timestamps,
counts, progress while running and **Cancel download** when non-terminal; then
a full-height `data-table` `expandable` of one row per stock, collapsed,
expanding to the four data types, failures sorted above successes, with an
outcome filter. The screen's `h1` is *Download {start time}*; the top-bar
title is *Data health › Downloads › Download {start time}*.

**Deltas against v5 §1.5** (brief §2.6):

| Delta | Detail |
|-------|--------|
| Path and title | `/runs/:runId` redirects to `/data/downloads/:runId` for one release (AC-18) |
| Labels | *Run detail* → *Download {start time}*; **Cancel run** → **Cancel download**; *instrument* → *stock* (*Stocks downloaded*, *Stocks failed*, *No stock in this download matches this filter.*); the outcome labels of blueprint §8; *acquiring daily prices* → *downloading daily prices* in every reason line |
| Progress while running | `progress` `determinate` *{done} of {total} stocks* in the summary, polled every 10 s with the last-updated time, no estimated time remaining (`progress` spec §7). This closes the COMPONENT-SPEC-GAP v5 §3 left open, as `design-system/README.md` records; `indeterminate` is used only while `total` is unknown |
| Cancel a running download | `dialog` `confirm`, v5's wording with the display labels substituted (AC-19): *Stop this download? Stocks already downloaded keep their coverage. Stocks not yet started will be skipped. The download stops after the stock it is working on now.*, confirm label **Stop download**. On confirm the state is *Stopping* (warning) until the download ends, never presented as immediate |
| Cancel a queued download | *Cancel this queued download? It has not started, so nothing has been downloaded. The download in progress is not affected.*, confirm **Cancel download**; the state goes straight to *Cancelled by you* (CAP-001 AC-26) |
| The download finished first | *This download had already finished.* with its outcome (CAP-001 AC-19) |
| Interrupted explanation | *FactorFlow stopped before this download finished, and the download was picked up as interrupted. Coverage written before it stopped is kept. Download again to continue.* (`status-serious`) |
| Not found | A stock the provider does not recognise is distinguished from other failures with `status-warning` *Not found* and the sentence *The provider doesn't recognise this symbol. Downloading again won't help; stop following it or follow a different symbol.* with **Open Data health** linking to `/data` |
| Components | Rebuilt from `ui-components`: `card` `summary`, `data-table` `expandable`, `badge`, `button` `secondary`, `dialog` `confirm`, `progress` `determinate`, `select` `inline`; the completion `toast` raised when the download finishes while the owner is elsewhere (0.6) |
| Internal links | A stock's symbol opens `/data/coverage?symbol={SYMBOL}` |

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Download summary | `card` | `summary` | `design-system/components/card/design-spec.md` |
| Download outcome; per-data-type outcome | `badge` | the six `status-*` variants; `status-good` / `status-warning` / `status-critical` | `design-system/components/badge/design-spec.md` |
| Stock roster | `data-table` | `expandable` | `design-system/components/data-table/design-spec.md` |
| Progress while running | `progress` | `determinate` | `design-system/components/progress/design-spec.md` |
| Cancel download | `button` | `secondary` | `design-system/components/button/design-spec.md` |
| Cancel confirmation | `dialog` | `confirm` | `design-system/components/dialog/design-spec.md` |
| Outcome filter | `select` | `inline` | `design-system/components/select/design-spec.md` |
| Finished elsewhere | `toast` | `success` / `warning` / `error` by outcome | `design-system/components/toast/design-spec.md` |

#### Interaction Flows

v5 §1.5 unchanged in outcome: cancelling is consequential and cooperative,
confirmed in the `confirm` dialog with cancel first; reading a failure
expands the stock to its four data types, each with its outcome and reason in
the three STD-UI-19 parts (*Downloading daily prices for KO failed: the
provider timed out 3 times.*) and the recovery (*Download again; data already
stored is never duplicated or overwritten.*); progress polls every 10 s and
announces politely.

#### States

v5 §1.5's table, relabelled: skeleton on the summary and roster; never
populated not applicable (a download exists or the route is the shell's
not-found state); *No stock in this download matches this filter.* with a
reset; the download's own *Partial* outcome, tiered warning; last-updated
time while running; unavailable not applicable; error keeps the summary and
replaces the roster with *Couldn't read this download's stocks: {reason}.* and
**Try again**; unreachable is the shell state.

#### Token Usage

v5 §1.5 unchanged: `--card` for the summary, the six tier pairs, `--font-numeric`
and `--text-xs` for counts and timestamps, table tokens as in 1.5; progress
`--seq-1` track and `--status-active` indicator; toast accents
`--status-good`, `--status-warning`, `--status-critical`.

#### Accessibility

v5 §1.5 unchanged: the cancel dialog traps and returns focus; per-data-type
outcomes carry text; the progress region announces politely at each poll; the
roster's row and column headers are programmatically associated; the
`progressbar` is labelled by its visible text.

### 1.9 Settings (`/settings`, taken over)

`CAP-001-ux-design` v5 §1.3 in this shell. Owned by `owner-web-app`. The
target of **Open Settings** from Home and of the *not set* link in What you
follow.

#### Page Layout

As v5 §1.3: a single column capped at `--measure-prose`, `h1` *Settings*,
then regions stacked `--space-5` apart. CAP-003 adds one line under the `h1`
and relabels one region:

1. **Setup link.** *Walk through setup again to check the market data key,
   history depth and followed stocks.* with **Open setup** (a link to `/setup`
   styled `button` `outline`) (S02 §6; system design §4.1). Its steps show as
   done.
2. **History depth** (`form` `stacked`, unchanged): label *History depth*,
   `input` `numeric` with the *years* suffix, description *Whole years, 1 to
   50. Required before the first download.* until set, **Save** (`button`
   `default`); validation on blur; a `422` as a field error with the value
   kept.
3. **Market data key** (`card` `summary`, v5's *Provider credential* region
   relabelled): read-only, no field anywhere. The line *Market data key:* with
   `badge` `status-good` *Found* or `status-critical` *Missing*, never the
   value, never masked or truncated (AC-4; CAP-001 AC-13). When missing, *Set
   the environment variable `FACTORFLOW_MASSIVE_API_KEY` to your Massive API
   key, then restart FactorFlow.* While health is unreachable,
   `coverage-unknown` *Not determinable*, never *Missing*.

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| History depth form | `form` + `input` | `stacked` + `numeric` | `design-system/components/form/design-spec.md`, `design-system/components/input/design-spec.md` |
| Save | `button` | `default` | `design-system/components/button/design-spec.md` |
| Open setup | `button` | `outline`, a link | `design-system/components/button/design-spec.md` |
| Market data key region | `card` | `summary` | `design-system/components/card/design-spec.md` |
| Key presence | `badge` | `status-good` / `status-critical` / `coverage-unknown` | `design-system/components/badge/design-spec.md` |

#### Interaction Flows

v5 §1.3 unchanged: the depth saves with `PUT /api/settings/history-depth`;
until it is set every **Download now** across the interface renders `blocked`
with the depth reason. **Open setup** navigates to `/setup`.

#### States

v5 §1.3's table, relabelled: skeleton on the depth field; never populated is
the depth not yet set, which blocks every download action; nothing found not
applicable (a single record); partial not applicable; stale not applicable
(the screen does not poll beyond the shell's health read); unavailable is the
key presence `coverage-unknown` while health is unreachable; error is a
field-level error through `form` with values preserved; unreachable is the
shell state.

#### Token Usage

v5 §1.3 unchanged: `--card` / `--card-foreground`, `--border`, `--input` at
3:1, `--muted-foreground` for descriptions, `--status-good` /
`--status-critical` on their muted grounds, `--value-indeterminate` with
`--pattern-indeterminate` for not determinable, `--text-base` throughout.

#### Accessibility

v5 §1.3 unchanged: the suffix is part of the field's accessible name, errors
are referenced by `aria-describedby` with `aria-invalid`, the key presence is
a text statement never carried by colour alone, and the key's value appears
nowhere.

## 2. Cross-Screen Navigation

The rail's two groups and the top-bar palette reach every screen; the flows
below are the capability's five user flows drawn across them.

**First run** (capability flow 1; blueprint §6). `/` on an empty install
redirects to `/setup` after the first health answer (DEC-0202). Setup's four
steps run against CAP-001's API, each saved on **Continue**, with unsaved
input held in app memory above `/setup` for the session; **Start download**
requests the download and from then on `/` opens `/home`, where the *Your
first download is running* item (kind 4) shows its progress with **See
download** to the detail, until a score set exists (AC-7), and the data tile
shows the first-download-running state, with no verdict, until a download
ends. *Add later* passes step 3 with no symbols to step 4, whose **Start
download** is `blocked` with the `no_active_instruments` reason and whose two
exits lead to Home's honest empty state (its **Start setup** returns to
`/setup`) and to Followed stocks; setup stays incomplete, so `/` keeps opening
`/setup` until a download is started from setup or Data health. Settings'
**Open setup** reopens setup at any time with its steps shown as done.

**Deciding whether the data can be trusted** (flow 2). Rail: Data health. The
verdict and the three cards answer first; *Needs fixing* lists only the
stocks with problems. **Download now** starts a full download, which heads
Recent downloads; a *Not found* row's **Stop following** confirms in place and
**Follow a different symbol** opens Followed stocks with the add field
focused; a problem row's symbol opens Coverage filtered to it; **Full
coverage table**, **Manage followed stocks** and a Recent downloads row reach
Coverage, Followed stocks and the download detail.

**Seeing what needs them today** (flow 3). Home is where problems surface
(blueprint principle 8). **Fix data** opens Data health; **See download**
opens the detail; **Open Settings** opens Settings; **See details** opens Data
health. The Data health chip carries the problem-stock count and the Home chip
the item count; both leave the rail at zero (AC-16). An item leaves Home only
when its cause is resolved (AC-9).

**Reaching CAP-001's surfaces** (flow 4). Coverage, Followed stocks,
Downloads, Download detail and Settings open in this shell under their new
titles with every action, confirmation and refusal CAP-001 accepted
(AC-17). A bookmark to `/coverage`, `/instruments`, `/runs` or `/runs/:runId`
arrives at the new path with its query kept (AC-18). The palette finds a
followed stock (to its evidence page when CAP-002's routes are registered,
else to Coverage filtered to it), a universe (when registered) or a page from
any screen (AC-22). CAP-002's five `/research` routes are reached from the
Research rail item and the palette and are otherwise untouched (AC-27).

**The product stops answering** (flow 5). On any route the main region becomes
the unreachable state with *Last answered {time}* while the rail and top bar
stay; when health answers again the same URL's screen mounts and refetches
without a reload (AC-23).

**Starting and watching a download.** Starting from Coverage or Downloads
routes to the download's detail (CAP-001 v5 §2); starting from Data health or
setup stays on that screen and shows the progress there. A download that
completes while the owner is on another screen raises a `toast`; one that
completes while the owner is on its detail does not (`toast` spec §1).

## 3. Component-Spec Gaps

> This section applies because a design system is configured at
> `projects/factorflow-v2/design-system.yaml`.

| UI Element | Source Reference | Suggested Slug | Intake Reference |
|------------|-----------------|----------------|------------------|
| None | Every element in Sections 0 and 1 maps to an existing component or to a composition of them (`design-system/intake.md` step 1.3) | none | `design-system/intake.md` |

**No COMPONENT-SPEC-GAP.** All 18 specifications in `design-system/components/`
were read, and every component this design names exists with the variant it
uses: `badge` (`status-*`, `coverage-unknown`, `secondary`), `button`
(`default`, `secondary`, `outline`, `ghost`, `blocked`), `card` (`default`,
`metric`, `summary`), `checkbox` (`default`, under the table's contract where
CAP-001 v5 uses it), `command` (`dialog`), `data-table` (`compact`, `history`,
`virtualised`, `expandable`), `dialog` (`confirm`), `form` (`stacked`,
`inline`), `input` (`text`, `numeric`), `progress` (`determinate`,
`indeterminate`), `radio-group` (`cards`), `select` (`inline`), `stepper`
(`vertical`), `textarea` (`list`), `toast` (`success`, `warning`, `error`).
Six are `status: beta` and this capability is their first consumer
(`command`, `stepper`, `progress`, `radio-group`, `checkbox`, `textarea`).

**The one gap CAP-001 v5 §3 left open is closed here.** The indeterminate
progress indicator for a download whose duration cannot be estimated is the
`progress` component added on 2026-10-15 (`design-system/README.md`); the
download detail (1.8), setup step 4 (1.2) and Recent downloads (1.4) use its
`determinate` variant with *{done} of {total} stocks*, and `indeterminate`
only while the total is unknown.

**Compositions, not components**, built once in `web/src/components/patterns/`
and `web/src/app/` and named so the component designs use one name each
(blueprint §4; brief §4): the shell (0.1 to 0.5), the count chip (0.2), the
Needs-you item and `sortAttention` (1.3), the as-of line (0.4, blueprint §4.8; `AsOfLine` in
`web/src/components/patterns/as-of-line.tsx`, which CAP-002 lands first
specialised to Research and `ui-components` takes over and generalises, the
Research line composing it, by the owner's decision of 2026-10-25),
the status badge with the one tier function (0.7), `worstDataTier` (1.3, 1.4),
the state-coverage region that renders STD-UI-23's eight states around a body
(blueprint §4.10), the check card (1.4), the problem row (1.4), the setup step
card (1.2).

**Components deliberately not used**, with the reason: `chart` (no chart in
M1; capability §5.4 records STD-UI-9, STD-UI-27 and STD-UI-28 as not
applicable; S01's sparklines belong to the strategy list, M2); `tabs` (no
region has independent views; the environment tabs are S08's); `toggle-group`
(M2 and later). Variants not used: `button` `kill-switch` and `badge` `paper`
/ `real-money` (no order path, D-7); `dialog` `destructive` and `real-money`
(nothing is deleted; nothing is traded); `input` `currency` / `percentage` (no
money figure, no rate); `radio-group` `default` (the step-3 choice frames the
step, so `cards`); `progress` `meter` (no bounded capacity in M1); `select`
`grouped`, `data-table` `ranking` and `holdings` (nothing ranked or held);
`checkbox` `acknowledgement` (no capital-at-risk action).

**A gap that would open on one owner answer.** If the owner wants *Upload a
CSV* in M1 (capability OQ-3), S02 §11's native `input type="file"` has no
specification; it routes through `design-system/intake.md` as `file-input`
and setup step 3 gains a third `radio-group` card.

## 4. EDG Compliance

`edg-compliance` is advisory beneath STD-UI v6, which is this project's
enforceable UX constitution (STD-UI §1.2). The checklist is applied here; the
intentional departures STD-UI §1.2 and §2.3 declare are recorded after the
table so a reviewer does not raise them.

| Check | Status | Notes |
|-------|--------|-------|
| Consistency with product patterns | pass | The shell, the patterns and the three M1 screens are the blueprint's, built from the approved S01, S02 and S09 and the §7 labels, §8 status map and §9 action tiers; the five CAP-001 screens are restyled into them with their behaviour intact (AC-17). No destination, pattern or label is invented: Section 0.8 lists the seven departures, each with its source and reason. Compositions have one name each (Section 3) so later capabilities reuse rather than restyle them (capability §5.3) |
| Progressive disclosure | pass | Blueprint principle 4 throughout: Home shows the topmost item and one tile; Data health shows the verdict, then three cards, then only the rows that need fixing, with the full coverage table, the followed list and the download detail one link away; setup shows one step at a time with the whole path visible; the palette reaches any page without adding navigation. Expandable rows keep 3000-stock tables readable (STD-UI-30) |
| Error clarity | pass | Every refusal and failure names the operation, the stock or download and the reason, and offers the recovery (STD-UI-19): the step to fix in setup, Settings or Followed stocks for a refused download, **Try again** for a failed read, *Download again* or **Stop following** / **Follow a different symbol** per problem row, *Downloading again won't help* for a not-found symbol. No code, `request_id`, payload key or implementation word reaches the owner (STD-UI-1); the unreachable state names the likely cause and where to look |
| Accessibility | pass | WCAG 2.1 AA per STD-UI-24, specified per surface in Sections 0 and 1: landmarks and names, keyboard completion of every operation, focus management on route changes, dialogs, the palette and the stepper, polite announcement of every polled change, `blocked` instead of `disabled` wherever a precondition gates an action, 4.5:1 text and 3:1 boundaries with the chip and as-of pairs checked against `theme-validation.md`. Radix, cmdk and native-list contracts carry the dialog, radio, command, stepper and table semantics. Enforcement is human review, which the standard acknowledges |
| States and feedback (empty, loading, error, success, partial) | pass | All five, plus the three more STD-UI-23 requires, enumerated per surface in a States table (AC-24), starting from S01 §7, S02 §7, S09 §7 and CAP-001 v5 §1.1 to §1.5. Never-populated (*No data has been downloaded yet.*) and nothing-found (*Nothing needs you right now.*, *Nothing needs fixing.*) are distinct everywhere both can occur (AC-21); stale is a marked state where it can be detected (*Not reflecting the latest download*), and the check cards state the currency they cannot judge; unavailable is `coverage-unknown` with a reason; progress shows *{done} of {total}*; a download that completes while the owner is elsewhere raises a `toast`, and a change the owner can see (a row leaving) is announced politely rather than toasted |

**Intentional departures from `edg-compliance`, declared by STD-UI.** Six
severity tiers reconciled to EDG's three levels (STD-UI-12); the kill switch
without confirmation (STD-UI-21), which this capability does not deliver;
screen-reader certification exempt as a gate while the semantics remain
mandatory (§2.3). Of STD-UI §2.3's scope exemptions, those engaged here are
error codes (the envelope's `code` selects wording and is never shown) and
"no new top-level navigation without EDG review": the rail this capability
delivers is the blueprint's approved navigation, not a new item.

## 5. Traceability

| AC ID | Capability AC | UX Design Element | Component + Variant |
|-------|---------------|-------------------|-------------------------|
| AC-1 | One shell; groups in order; unshipped absent | 0.1 layout; 0.2 static destination list drawn for both landing orders; Strategies and Portfolio absent | shell composition; `badge` `status-warning` chips |
| AC-2 | Setup first, Home after | 0.3 `/` redirect on `most_recent_run` (DEC-0202); 1.2 step 4 | `Navigate replace`; `button` `default` |
| AC-3 | Setup steps, position, back keeps values | 1.2 stepper with *Step n of 4*, unsaved input held in app memory above `/setup` for the session, **← Back**; step 4 blocked after *Add later* with its two exits (DEC-0202) | `stepper` `vertical`; `card` `default`; `button` `ghost` |
| AC-4 | Credential presence, never value | 1.2 step 1 and step 4 summary; 1.9 Market data key region; 1.4 What you follow | `badge` `status-good` / `status-critical` / `coverage-unknown` |
| AC-5 | Pasted list parsed honestly | 1.2 step 3 parse result and the per-entry server dispositions; 1.6 Follow many | `textarea` `list`; `badge` `status-good` / `status-warning` |
| AC-6 | Fewer than 30 is a warning | 1.2 step 3 ranking warning with **Continue** available | `button` `default` |
| AC-7 | First download from setup; Home shows progress | 1.2 step 4 progress; 1.3 item kind 4 *Your first download is running* | `progress` `determinate`; Needs-you item |
| AC-8 | Home data tile, scores lag stated | 1.3 data tile: counts, two as-of lines, *Not reflecting the latest download*, not determinable while the summary is not served; no verdict tier while no download has ended | `card` `metric`; `badge` `status-warning`; `--value-missing` em dash |
| AC-9 | Needs you: one action, ordered, leaves on resolution | 1.3 catalogue, `sortAttention`, items present only while their cause holds | Needs-you item; `button` `outline` |
| AC-10 | Nothing unshipped on Home | 1.3 page layout: one tile, no strategy, paper or live region, empty grid columns not placeholders | `card` `metric` |
| AC-11 | Data health verdict and check cards | 1.4 verdict composed from `affected_count` and `followed_count` with its tier; three cards each with tier, result and as-of | `badge` `status-*` / `coverage-unknown`; `card` `metric` |
| AC-12 | A partial download is never complete | 0.7 one tier function; 1.4 Recent downloads and checks; 1.7, 1.8 outcomes: *Partial* warning, *Interrupted* serious | `badge` `status-warning` / `status-serious` |
| AC-13 | Every problem names its fix | 1.4 problem row: symbol, what failed, reason, attempts, consequence, the fix | problem row composition; `badge`; `button` `ghost` / `outline` |
| AC-14 | Not found is not retried | 1.4 *Not found* rows offer **Stop following** and **Follow a different symbol**, never a download; header **Download now** only when a row is retryable | `button` `ghost` / `outline`; `dialog` `confirm` |
| AC-15 | Download now is the retry; queued when running | 1.4, 1.5, 1.7 **Download now**; *A download is running. This starts when it finishes.* | `button` `default` |
| AC-16 | Attention counts, absent at zero | 0.2 count chips from the merged list and `problems.stock_count`, absent at zero | `badge` `status-warning` at `--text-xs` |
| AC-17 | Delivered behaviour preserved at new paths | 1.5 to 1.9 deltas tables: paths, labels and components change, outcomes, confirmations and refusals do not | as CAP-001 v5, rebuilt from `ui-components` |
| AC-18 | Old paths arrive for one release | 0.3 four legacy redirects with the query kept | `Navigate replace` |
| AC-19 | Product vocabulary | 0.7 conventions; every string in Sections 0 and 1, including the five relabelled screens | all |
| AC-20 | One tier per status | 0.7 one tier function with label plus shape; brief §12.2 table rendered in 1.3, 1.4, 1.7, 1.8 | `badge` `status-*` |
| AC-21 | Honest empty state | 1.3 and 1.4 never-populated states with **Start setup**, **Start the first download** or **Open setup**; 1.3's first-download-running tile with no verdict; no check renders as passed | `card` `default`; `button` `default` |
| AC-22 | Command palette | 1.1 opened by `⌘K` / `Ctrl+K` and the top-bar opener on every route; Stocks, Universes, Pages; no trading action | `command` `dialog`; `button` `outline` |
| AC-23 | Unreachable is a designed state | 0.5 unreachable state with *Last answered {time}*; rail and top bar remain; remount at the same URL | `card` `default` |
| AC-24 | Every region defines its states | States tables in 1.1 to 1.9 and 0.5, each inapplicable state recorded with its reason | state-coverage region |
| AC-25 | Keyboard and freshness | 0.4 cadences and *checked {time}* on every polled region; Accessibility subsections of every surface | all |
| AC-26 | Built from the design system | Component Mapping and Token Usage of every surface; no literal outside `theme.css` except the approved-specification layout widths in `web/src/app/layout.ts` (0.7) | all, vendored per DEC-0205 |
| AC-27 | CAP-002 keeps its routes | 0.2 Research in the static list when its routes are registered; 0.3 the five `/research` routes unchanged | shell composition |

**Screen acceptance checks.** S01-3 and S01-4 (1.3 catalogue and
`sortAttention`), S01-6 (1.3 as-of lines), S01-7 (1.3 layout); S01-1, S01-2
and S01-5 concern the paper and live tiles, which are not in M1. S02-1 (1.2
*Step n of 4* and the stepper), S02-2 (drafts kept), S02-3 (parse result),
S02-4 (key presence only), S02-5 (ranking warning), S02-6 (0.3 redirect after
the first requested download). S09-1 (1.4 Recent downloads and 1.7, 1.8
outcomes), S09-2 and S09-3 (1.4 problem rows), S09-4 (1.4 What you follow,
1.9), S09-5 (1.4 never-populated state).

## 6. Source Mapping

| Source | Reference | Verification Method | Date |
|--------|-----------|---------------------|------|
| UX brief v1 (draft, 41ff183) | `docs/capabilities/CAP-003-app-shell-and-data-health/design/ux-brief.md` | Text reference. Eight screens and two shell surfaces, information architecture, interactions, component proposals, constraints, accessibility, the STD-UI conformance record and the eight-state enumeration read in full; its suggested copy finalised here in the shapes it fixed | 2026-10-25 |
| Capability CAP-003 v1 (draft) | `docs/capabilities/CAP-003-app-shell-and-data-health/Capability-CAP-003.md` | Text reference. All 28 acceptance criteria (AC-28 added 2026-10-25), the 27 interface-facing ones traced in Section 5; five user flows drawn in Section 2; §5.3 constraints and OQ-1 to OQ-4 carried | 2026-10-25 |
| System design CAP-003 v1 (draft, 4c663e2) | `docs/capabilities/CAP-003-app-shell-and-data-health/design/system-design.md` | Text reference. The eight components, the three new reads and their fields, the shell context, screen registration, control flows §3.1 to §3.5 with every state source and cadence, constraints 1 to 15 | 2026-10-25 |
| Product UX blueprint `PRODUCT-UX` v6 (approved 2026-10-16) | `docs/ux/product-ux-blueprint.md` | Text reference. §0 how a design uses it; §2.1, §2.2 rail, routes and redirects; §3.1, §3.4, §3.5 shell; §4.1, §4.8, §4.10 patterns; §6 flows; §7 vocabulary; §8 status map; §9 action tiers; §10 M1 row; D-2, D-7, D-8, D-9 | 2026-10-25 |
| Home `PRODUCT-UX-S01` v4 (approved) | `docs/ux/screens/S01-home.md` | Text reference. Starting layout for 1.3; M1 regions, mapping, interactions, states, copy, accessibility, S01-3 to S01-7; departed from on the `h1` date (DEC-0209) | 2026-10-25 |
| Setup `PRODUCT-UX-S02` v4 (approved) | `docs/ux/screens/S02-setup.md` | Text reference. Starting layout for 1.2; steps 1 to 4, mapping, interactions, states, copy, accessibility, S02-1 to S02-6; departed from on *Upload a CSV* (OQ-3) | 2026-10-25 |
| Data health `PRODUCT-UX-S09` v4 (approved) | `docs/ux/screens/S09-data-health.md` | Text reference. Starting layout for 1.4; M1 regions, mapping, view model, interactions, states, copy, accessibility, S09-1 to S09-5; departed from on the verdict's strategy wording (DEC-0210) | 2026-10-25 |
| STD-UI v6 (approved) | `docs/constitution/standards/ui-conventions.md` | Text reference. All 30 rules read; those governing a surface here cited where they decide something; §1.1 precedence, §1.2 and §2.3 departures and exemptions | 2026-10-25 |
| CAP-001 UX design v5 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-design.md` | Text reference. §0 the shell and status region replaced here; §1.1 to §1.5 the five screens taken over, restated only as deltas in 1.5 to 1.9; §2 the unreachable wording and completion toast kept; §3 the progress gap closed here | 2026-10-25 |
| CAP-002 UX design v3 (approved) | `docs/capabilities/CAP-002-universe-and-factor-classification/design/ux-design.md` | Text reference. §0 the composition into this shell, the download named by its start time (DEC-0083), the restyled-page delta pattern reused in 1.5 to 1.9 | 2026-10-25 |
| Component specifications | `design-system/components/*/design-spec.md` | Text reference. All 18 read; 15 used, 3 unused with reasons in Section 3; every variant named here checked against its spec's Variants table; the `command` label and `CommandEmpty` guidance applied in 1.1 | 2026-10-25 |
| Theme tokens | `design-system/theme.css` | Text reference. Every token named in this design verified to exist; the page-ground alpha is the STD-UI-29 A-5 case | 2026-10-25 |
| Component map and intake | `design-system/component-map.json`, `design-system/intake.md` | Text reference. Null Figma file key and empty component map, so no frame references exist; intake step 1.3 places the compositions in this document | 2026-10-25 |
| UX pipeline note | `docs/ux/README.md` | Text reference. The UX design starts from the matching screen specification and delivers the regions it assigns to the milestone | 2026-10-25 |
| Decision records applied | `projects/factorflow-v2/decisions/DEC-0200.md` to `DEC-0210.md` (harness repository) | Text reference. Server-side aggregates and interface-composed sentences (0200); the problem definition, M1 consequence and check derivations (0201); setup completion and *Add later* (0202); the five Needs-you kinds (0203); the shell layout, static destinations and the retired status region (0204); vendored components and provisional packages (0205); market state (0206); palette groups and targets (0207); loopback exception (0208); Home's `h1` date (0209); `worstDataTier` and the M1 verdict (0210). Applied, not re-decided | 2026-10-25 |

No Figma frame, image or diagram was used. This is the Path B automated design.

## 7. Open Questions

Nothing was abstained in this run, and this design recorded no decision of
its own. The positions below are what no artifact derives, carried for the
owner, and what the next stages need to know is still open.

- **OQ-1, carried: do downloads get a short visible number?** `[REQUIRES
  INPUT: whether downloads gain a short number, and its format]`. Every
  surface here names a download by its start time in America/Chicago with the
  zone: setup step 4's *Started {start time}*, Home's items, Recent downloads'
  *Started* column, the download detail's `h1` and the top-bar breadcrumb, the
  Factor scores card's *from the download started {start time}* (system design
  assumption 5; CAP-002's DEC-0083). *Owner: capability owner. Blocks: copy in
  1.2, 1.3, 1.4, 1.7, 1.8 and 0.3, not layout.*
- **OQ-2, carried: which lands first, this shell or CAP-002's Research
  screens?** 0.2 draws the rail and the palette for both orders (DEC-0204,
  DEC-0207). *Owner: capability owner (sequencing). Blocks: nothing in this
  design.*
- **OQ-3, carried: is uploading a CSV an M1 way to name stocks?** `[REQUIRES
  INPUT: whether CSV upload is in M1]`. 1.2 step 3 has two `radio-group`
  `cards` options; a yes adds the third, a criterion to the capability and a
  `file-input` through `design-system/intake.md` (Section 3). *Owner:
  capability owner. Blocks: one control in 1.2.*
- **OQ-4, carried: the npm packages the vendored components import.**
  DEC-0205 specifies them provisionally; only the owner amends
  `tech-stack.md`. Every Component Mapping here assumes the vendored
  components exist. *Owner: capability owner via `$tech-stack`. Blocks: the
  implementing stories, not this design.*
- **DEC-0209 awaits the owner's verdict; DEC-0210 was reviewed and upheld as
  amended on 2026-10-25, and 1.4 carries the amended rule.** If the owner prefers
  S01's long date, the fix is an amendment to STD-UI-5 (one-way, the owner's)
  and 1.3's `h1` changes; if the owner wants the verdict worded or tiered
  differently, 1.4's verdict table and `worstDataTier` change, and the data
  tile's badge label in 1.3 with them. DEC-0203's five item kinds have not
  been seen rendered by the owner; a kind the owner does not want is one row
  of the 1.3 catalogue.
- **The data tile's badge carries the label of whichever tier wins**: the
  verdict's answer word (*Yes*, *Mostly yes*, *No*) or the score state's
  label (*Score update failed*, *Not reflecting the latest download*), as
  DEC-0210, amended by the owner on 2026-10-25, directs (1.3). On Home the
  question is not on screen, so the tile's title *Data* and its accessible
  name carry the context. When the two tiers are equal the amended decision
  does not say whose label shows; this design shows the verdict's answer
  word, the label the tile carried before the amendment, and records that
  here rather than deciding it silently.
- **Carried from the system design §8, not re-decided here:** the other
  design's consumer name (question 5), the research screens' `/runs/:runId`
  links, which the redirect carries for one release (6), the latency target
  for `GET /api/data-health` (7, answered 2026-10-25: AC-28), the delivered file and test edit list that
  design decomposition enumerates (8), a trading calendar (9), and the
  promotion of DEC-0203 and DEC-0204 to a `decision-record` constitution
  artifact (10).
- **Which density tier is the default?** STD-UI OQ-UI-4, inherited as CAP-001
  and CAP-002 did; this design selects no tier.
- **Does M1 expose a way to switch to the dark theme?** STD-UI OQ-UI-2; the
  tokens exist and the shell's top bar is where a switch would live. This
  design assumes the light theme only and reserves no space.
- **Review findings this design should be checked against.** The capability
  and system design it reads are drafts, and specification review has not
  seen any of the three CAP-003 artifacts; the brief's conformance record
  (§12) is mirrored by capability §5.4 and this design renders it. The
  `worstDataTier` derivation, the five-kind catalogue and the shell's static
  destination list are the three positions a reviewer should read first.

This design was generated without any human designer or visual design tool.
It should be reviewed before decomposition.
