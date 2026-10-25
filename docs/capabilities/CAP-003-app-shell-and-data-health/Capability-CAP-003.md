---
artifact_schema_version: 1
artifact_id: CAP-003
artifact_type: capability
artifact_version: 1
id: CAP-003
title: App Shell & Data Health
description: >-
  Give the owner-operator one product-wide owner interface shell, a first-run
  setup, a Home that says what needs them, and a Data health screen that says
  whether the data can be trusted, with CAP-001's market data surfaces reached
  through it in the product's own words.
created: 2026-10-24
updated: 2026-10-25
owner: Alvaro de Jodra
owner_github: ajodraca
status: draft
ai_provenance:
  agent_id: capability-definition-agent
  agent_version: "1.0"
  model: claude-fable-5-1
  tool: Claude Code
  tool_version: unknown
  timestamp: 2026-10-24T23:26:09Z
  source_artifacts:
    - id: PRODUCT-UX
      version: "6"
    - id: PRODUCT-UX-S01
      version: "4"
    - id: PRODUCT-UX-S02
      version: "4"
    - id: PRODUCT-UX-S09
      version: "4"
    - id: CAP-001
      version: "8"
    - id: CAP-002
      version: "1"
    - id: STD-UI
      version: "6"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# App Shell & Data Health

## 1. Description

The owner-operator reaches FactorFlow's market data today through four screens
CAP-001 delivered for its own purpose — Coverage, Instruments, Runs and Settings
— inside a shell designed for one capability and worded in the system's
vocabulary. There is no place that answers *is the data good enough to trust?*
in one look, no guided first run (depth is set in Settings, stocks are added on
another screen, the first download is started on a third), and nothing that
tells the owner what needs them today. CAP-002 is about to add Research and
universe screens to the same interim shell.

The product UX blueprint (`docs/ux/product-ux-blueprint.md`, approved
2026-10-16) specifies the owner interface for the whole product, M1 through M6,
so that every capability builds a piece of the same thing. Its owner decision
D-8 assigns the M1 part to a new capability rather than to CAP-001, which is
approved and takes no new work. This capability is that part: one shell with
the product's navigation, a first-run setup, a Home that lists what needs the
owner, a Data health screen with the problems and their fixes, and CAP-001's
coverage, followed-stock, download and settings surfaces reached through that
shell in the product's own words — stock, followed stock, download, stop
following.

It completes M1 (2026-Q4) together with CAP-002. Delivered before CAP-002's
screens land, it saves them from being built in one shell and moved to another;
delivered after, it takes over the interim shell they were placed in. Either
way, nothing CAP-001 recorded or does changes: this capability presents
CAP-001's data and actions, it does not re-acquire, re-store or re-define them.

## 2. Scope

### In Scope

- **One product-wide shell** for every owner-interface route: a navigation rail
  in two groups (Home, Research, Strategies, Portfolio; Data health, Settings),
  a top bar carrying the screen's title and a command palette, and an
  attention count on destinations that hold items needing the owner.
  Destinations whose milestone has not shipped are absent, not disabled.
- **First-run setup** at `/setup`: market data credential presence, history
  depth, the stocks to follow (pasted as a list), and the first download — as
  one multi-step operation the owner can leave and return to. The product
  routes to setup until the first download has been started, and to Home after.
- **Home** at `/home`: the date and market state, a data tile stating how many
  followed stocks are current and the as-of times of scores and prices, and a
  *Needs you* list of data-related items, each with one action.
- **Data health** at `/data`: a one-sentence verdict, check cards for daily
  prices, company financials and factor scores, a *Needs fixing* list naming
  each affected stock, what failed, why and its fix, the most recent downloads,
  and a summary of what the owner follows.
- **CAP-001's surfaces under the shell**: coverage at `/data/coverage`,
  followed stocks at `/data/followed`, downloads and download detail at
  `/data/downloads` and `/data/downloads/:id`, and settings at `/settings`,
  with the behaviour CAP-001 accepted preserved and every user-visible label in
  the product vocabulary and the product's status tiers.
- **Route migration**: the four paths CAP-001 shipped continue to reach their
  screens by redirecting to the new paths for one release.
- **Command palette** opening from the keyboard and the top bar, finding
  followed stocks, universes and pages.
- **Taking over the interim shell**: the one Research destination CAP-002
  appends to CAP-001's rail (CAP-002 design decision DEC-0069) is replaced by
  this shell's rail, with CAP-002's routes unchanged.
- **The product's own building blocks**: every surface above is built from the
  design system's components and tokens, so a later capability adds screens
  without restyling shared ones.

### Out of Scope

- **Stop all trading and the trading-environment region.** No order path exists
  in M1; blueprint D-7 ships them with paper trading (M2).
- **Setup step 5, the paper trading account** (M2), and the broker row in *What
  you follow*.
- **Scheduled downloads** and the schedule line under *Recent downloads*
  (blueprint D-2, M2). Downloads remain on demand.
- **The *Live prices* check card** (M3).
- **Strategy, paper and live regions of Home** — the paper and live tiles,
  strategy items, the strategy list and *New strategy* (M2 onward). They are
  absent, not placeholders.
- **A download scoped to the stocks that failed.** Retrying is a full download
  over the followed list, which CAP-001 AC-6 makes safe (blueprint D-9).
- **Research, stock evidence, compare and universe screens** — CAP-002 owns
  them; this capability only gives them their place in the rail.
- **Any change to what CAP-001 acquires, stores, records or refuses.** Its
  acceptance criteria stand; this capability changes where and in which words
  its results are shown.
- **Settings sections for the review gate and live limits** (M5, M6).
- **Removing the redirects from CAP-001's old paths**, due one release after
  this capability ships.

## 3. User Flows

### Owner-operator — Get from an empty install to a first download

1. The owner opens the product for the first time. Nothing is configured and
   no data has been downloaded, so the product opens setup rather than a screen
   that would show empty tables as if they were complete.
2. Setup shows its steps and the owner's position in them. Step 1 states
   whether the market data credential was found, never its value; when it is
   missing, it names what to set and that the product must be restarted.
3. The owner states how far back history should go and reads the plan's limit
   on what the provider holds.
4. The owner pastes a list of stock symbols. The product shows how many were
   accepted, which were duplicates and which it could not read, keeps the
   accepted ones, and warns when fewer than 30 are accepted because no factor
   can be ranked below that count. The owner may still continue.
5. The owner starts the first download. It runs on its own; the owner may leave
   setup and come back. From now on the product opens on Home, which shows the
   download's progress until scores exist.
6. Alternate: the owner goes back a step. Everything entered later is kept when
   they move forward again.
7. Alternate: the owner pastes no usable symbol. Continue is withheld with the
   reason stated beside it; choosing *Add later* lets setup finish without a
   download.

### Owner-operator — Decide whether the data can be trusted

1. The owner opens Data health. The title answers the question in one sentence
   — how many followed stocks need attention and that strategies skip them
   until fixed — above check cards for daily prices, company financials and
   factor scores, each with its tier, its result and the time it is current to.
2. The owner reads *Needs fixing*: one row per affected stock naming what was
   being downloaded, what failed and why, and the consequence for anything that
   holds it.
3. For a failure the provider may not repeat, the owner presses **Download
   now**. The product downloads the whole followed list again; nothing already
   stored is duplicated, overwritten or removed. The running download heads
   *Recent downloads* with its progress and the checks refresh when it ends.
4. For a symbol the provider does not recognise, the row offers **Stop
   following** and **Follow a different symbol**, never a download, because
   downloading again cannot help. Stopping is confirmed and keeps the stock's
   history.
5. Alternate: a download is already running when the owner presses **Download
   now**. The product accepts the request and says it starts when the current
   one finishes.
6. Alternate: nothing is wrong. *Needs fixing* says so and gives the time of
   the last complete download.
7. Alternate: gap detection could not run. The daily prices card shows the
   check as not determinable, with its reason, rather than as passed or
   failed.

### Owner-operator — See what needs them today

1. The owner opens the product. Home shows the date and market state, a data
   tile with how many followed stocks are current and the as-of times of scores
   and prices, and *Needs you*: the most important item first, each with
   exactly one action.
2. A partial download has left three stocks without today's data. The item
   names them, says their scores show as Incomplete until fixed, and offers
   **Fix data**, which opens Data health. The Data health destination carries
   the count of stocks with problems.
3. The owner fixes the data. The item leaves the list because its cause is
   resolved, not because it was seen.
4. Alternate: nothing needs the owner. Home says so and when it last checked.
5. Alternate: scores lag the latest download. The data tile says it is not
   reflecting the latest download rather than presenting the older scores as
   current.

### Owner-operator — Reach CAP-001's surfaces through the shell

1. The owner chooses Data health in the rail and follows **Full coverage
   table**, **Manage followed stocks** or a download row. Coverage, followed
   stocks, downloads and download detail open in the same shell, titled in the
   top bar, with every label in the product's words: stock, followed stock,
   download, stop following, Complete, Partial, Failed, Cancelled by you,
   Interrupted.
2. Everything the owner could do on CAP-001's screens — add and stop following
   stocks, start and cancel downloads, read coverage and gaps, diagnose a
   failed download, set the history depth, see whether the credential is
   present — still works, with the same confirmations and refusals.
3. Alternate: the owner opens a bookmark to one of CAP-001's original paths.
   The product takes them to the same screen at its new path.
4. Alternate: the owner presses the command palette shortcut, types part of a
   symbol or a page name, and jumps to the followed stock, universe or page.

### Owner-operator — The product stops answering

1. While the owner is on any screen, the product's health check stops
   answering.
2. The main region is replaced by the designed unreachable state; the rail and
   top bar stay, so the owner is not stranded and can see when the product last
   answered.
3. When it answers again, the screen the owner was on returns without the owner
   reloading.

## 4. Acceptance Criteria

1. **AC-1 — One shell:** Every owner-interface screen MUST render inside one
   shell whose navigation groups Home, Research, Strategies and Portfolio apart
   from Data health and Settings, in that order, and a destination whose screen
   has not shipped MUST be absent rather than disabled.
2. **AC-2 — Setup comes first:** Until the first download has been started, the
   product MUST open on setup; afterwards it MUST open on Home.
3. **AC-3 — Setup is a visible multi-step operation:** Setup MUST show its
   steps, the owner's position and what remains, and going back to an earlier
   step MUST keep every value entered in later steps.
4. **AC-4 — Credential presence, never value:** Setup and Settings MUST state
   whether the market data credential was found and, when it is missing, which
   environment variable to set, and MUST NOT display its value.
5. **AC-5 — Pasted list is parsed honestly:** When the owner pastes a list of
   symbols, the product MUST accept the valid entries, name each entry it could
   not read and each duplicate, and MUST NOT discard an accepted entry because
   another was rejected.
6. **AC-6 — Too few to rank is a warning, not a block:** When fewer than 30
   symbols are accepted, setup MUST say that no factor can be ranked below that
   count (CAP-002 AC-14) and MUST still let the owner continue.
7. **AC-7 — First download from setup:** The owner MUST be able to start the
   first download from setup and leave; Home MUST then show that download's
   progress until scores exist.
8. **AC-8 — Home's data tile:** Home MUST show how many followed stocks are
   current out of how many are followed, and the as-of time of scores and of
   prices, and MUST say when scores do not reflect the latest download.
9. **AC-9 — Needs you:** Every item on Home MUST have exactly one action, items
   MUST be ordered by severity tier then recency, and an item MUST leave the
   list only when its cause is resolved, never because it was viewed.
10. **AC-10 — Nothing unshipped on Home:** Before paper trading ships, Home MUST
    render no strategy, paper or live region and no placeholder for one.
11. **AC-11 — Data health verdict:** Data health MUST open with a one-sentence
    verdict naming how many followed stocks need attention, and check cards for
    daily prices, company financials and factor scores, each carrying its
    severity tier and the time it is current to.
12. **AC-12 — A partial download is never complete:** No screen MUST present a
    partial or interrupted download, or a check built on one, as complete.
13. **AC-13 — Every problem names its fix:** Each row in *Needs fixing* MUST
    name the stock, what was being downloaded, the reason reported and the
    consequence for anything holding the stock, and MUST offer the recovery
    action that applies.
14. **AC-14 — Not found is not retried:** A stock the provider does not
    recognise MUST offer stopping following it and following a different
    symbol as its fixes, and MUST NOT offer a download as its fix.
15. **AC-15 — Download now is the retry:** **Download now** MUST start a
    download over the whole followed list; when a download is already under
    way the product MUST accept the request and say it starts when the current
    one finishes.
16. **AC-16 — Attention counts:** The Data health destination MUST carry the
    number of followed stocks with problems and the Home destination the number
    of *Needs you* items, and each count MUST be absent when it is zero.
17. **AC-17 — CAP-001's behaviour is preserved:** Every action, confirmation
    and refusal CAP-001 accepted on its coverage, instrument, run, run-detail
    and settings screens MUST remain available through this shell with the
    same outcome, at `/data/coverage`, `/data/followed`, `/data/downloads`,
    `/data/downloads/:id` and `/settings`.
18. **AC-18 — Old paths still arrive:** Each path CAP-001 shipped MUST take the
    owner to the same screen at its new path for one release after this
    capability ships, and MUST then be removed.
19. **AC-19 — Product vocabulary:** Every user-visible label on the screens
    this capability delivers or takes over MUST use the display label STD-UI-1
    defines and MUST NOT show the domain term beside it.
20. **AC-20 — One tier per status:** Every download outcome, check result and
    stock state MUST render as the single severity tier the blueprint's status
    map assigns it, with its label and its tier shape, never colour alone.
21. **AC-21 — Honest empty state:** Before any download has run, Home and Data
    health MUST state that no data has been downloaded yet and offer the first
    download or setup, rather than presenting empty checks as passed.
22. **AC-22 — Command palette:** The owner MUST be able to open a command
    palette from the keyboard and from the top bar on every screen, and find
    followed stocks, universes and pages from it; it MUST NOT offer any action
    that places or stops trading.
23. **AC-23 — Unreachable is a designed state:** When the product stops
    answering, the main region MUST be replaced by the unreachable state while
    the rail and top bar remain; when it answers again the screen the owner was
    on MUST return without a reload.
24. **AC-24 — Every region defines its states:** Every data-bearing region MUST
    render each of STD-UI-23's eight states as designed, or record why one does
    not apply, and MUST NOT collapse never-populated into nothing-found.
25. **AC-25 — Keyboard and freshness:** Every operation MUST be completable by
    keyboard, and every region updated by polling MUST show its last-updated
    time.
26. **AC-26 — Built from the design system:** Every surface this capability
    delivers or takes over MUST be built from the product's design-system
    components and consume its theme tokens, with no spacing, size or colour
    literal outside the theme.
27. **AC-27 — CAP-002 keeps its routes:** Replacing the interim Research entry
    CAP-002 appended to CAP-001's rail MUST leave every CAP-002 route
    unchanged and reachable from the new rail.

## 5. Dependencies and Constraints

### 5.1 Dependencies

| Target | Type | What is needed | Satisfied when |
|--------|------|----------------|----------------|
| CAP-001 | requires-runtime | Everything the shell presents about market data, as CAP-001 already provides it: the acquisition list with add, remove and retire (`CAP-001 AC-1`, `AC-21`, `AC-25`); the stated history depth and deepening (`AC-2`, `AC-22`); starting, queueing and cancelling runs and the refusal of an empty run (`AC-19`, `AC-23`, `AC-24`, `AC-26`); per-instrument coverage and gaps (`AC-7`, `AC-8`); each run's honest outcome and terminal state (`AC-9`, `AC-12`, `AC-20`); failure diagnosis including unrecognised instruments (`AC-10`, `AC-11`); re-run safety, which makes **Download now** a safe retry (`AC-6`); credential presence without its value (`AC-13`); the honest empty state and health (`AC-17`, `AC-18`); and the loopback posture the shell inherits (`AC-14`). | The running product serves these and Setup, Home, Data health and the five taken-over screens render them end to end; AC-7, AC-11 to AC-17 and AC-21 of this capability pass against it. |
| CAP-002 | requires-runtime | The score currency Home's data tile and Data health's *Factor scores* card show: when the current scores were produced and which download they reflect (`CAP-002 AC-21`), the previous set marked as not reflecting the latest download or the failure and its reason (`AC-20`), the honest state before any scores exist (`AC-22`), which stocks are current — every input present and current (`AC-12`, `AC-13`) — and the 30-stock ranking floor setup warns about (`AC-14`). The read that carries these is specified in CAP-002's system design (DEC-0071) and consumed, not defined, here. Also the seam CAP-002 decided for the interim shell (DEC-0069): one appended Research entry this capability replaces, with CAP-002's `/research/*` routes untouched (AC-27). | CAP-002's read surface serves score currency on the running product and AC-8 and AC-11 render it; AC-27 passes with CAP-002's routes reachable from the new rail. Until then the *Factor scores* card and the score as-of render as not determinable, never as a value. |
| `docs/ux/product-ux-blueprint.md` (PRODUCT-UX v6) and `docs/ux/screens/S01`, `S02`, `S09` (v4) | conforms-to | The approved product-wide interface this capability builds the M1 part of: navigation and routes (§2), the shell without the kill switch and environment region (§3), shared patterns (§4), vocabulary (§7), status map (§8), action tiers (§9), the M1 row of the milestone map (§10) and decisions D-2, D-7, D-8, D-9 (§12); S01 §2 M1 regions and S01-3 to S01-7; S02 steps 1 to 4 and S02-1 to S02-6; S09 and S09-1 to S09-5. | The UX brief claims the §10 M1 row and cites PRODUCT-UX; the UX design starts from S01, S02 and S09 and lists every departure; specification review confirms the screen specs' acceptance checks. |
| STD-UI (`docs/constitution/standards/ui-conventions.md`, v6) | conforms-to | The owner-interface standard. This capability delivers the shell every screen renders in and takes over five screens, so every rule governing a surface it renders binds it; STD-UI-1 v6 fixes the display labels AC-19 requires and STD-UI-26 governs setup. | Section 5.4 accounts for all 30 rules, and specification review confirms the UX brief and UX design satisfy each rule marked yes or partial. |
| `docs/constitution/tech-stack.md` (v2) | conforms-to | The approved owner-interface stack — React, Vite, React Router, Tailwind bound to the theme, `shadcn/ui` on Radix primitives (OQ-TS-6, closed 2026-09-03) — and the project-wide constraints that bound this capability: one owner-operator (C8) and a sequenced build whose only dated milestone is M1 (C11). | Specification review confirms the system design uses only approved technologies and honours C8 and C11. |

### 5.2 Non-Dependencies

| Target | Not depended on for | Why |
|--------|--------------------|-----|
| CAP-001 | Any change to what it acquires, stores, records, refuses or exposes | CAP-001 is approved and delivered; blueprint D-8 gives it no new work. This capability presents its results and actions and changes their place and words, never their behaviour (AC-17). Anything found missing in CAP-001's results is recorded as an open question, not written into CAP-001. |
| CAP-002 | Research, stock evidence, compare and universe screens | CAP-002 owns them. This capability gives them their place in the rail and otherwise leaves them alone (AC-27). |
| Massive (market data provider) | Any provider read | Every figure this capability shows was recorded by CAP-001 or produced by CAP-002; it makes no provider request of its own. |
| Alpaca / the broker port, the kill switch | Anything | No order path exists in M1. The kill switch and the environment region ship with paper trading (blueprint D-7). |

### 5.3 Constraints

- **M1 milestone (2026-Q4).** This capability, with CAP-002, completes M1 as
  the blueprint's milestone map defines it (charter §4; blueprint §10).
- **The owner interface stays bound to the loopback interface with no
  authentication**, as CAP-001 established (CAP-001 AC-14; owner decision
  2026-09-03). The shell adds no sign-in, user menu or account area.
- **One owner-operator, no separation of duties, no subscribers** (charter §2;
  tech stack C8).
- **Desktop tool.** The interface is designed for a desktop display; narrower
  widths must leave nothing unreachable but need not be pleasant (blueprint
  §3.1).
- **Nothing shown is asserted beyond what is recorded.** Counts, verdicts and
  check results derive from CAP-001's and CAP-002's recorded outcomes; a check
  that could not run is shown as not determinable, never as passed or as zero
  (STD-UI-4, STD-UI-14, STD-UI-15).
- **Shared surfaces are built once.** The shell and the shared patterns are
  built once and reused; no later capability restyles them (blueprint §0).

### 5.4 Standards Conformance

Conformance to `STD-UI`, as STD-UI section 4 requires. The UX brief carries the
narrative record and where each rule is satisfied; this table is the checked
mirror of it, and the two must agree.

| Rule | Applies | Where satisfied, or why not |
|------|---------|------------------------------|
| STD-UI-1 | yes | AC-19: display labels of STD-UI-1 v6 on every screen delivered or taken over; adds no concept |
| STD-UI-2 | yes | *Stop following* keeps history and the confirmation says so; **Download now** describes a full download, not a scoped retry (AC-14, AC-15) |
| STD-UI-3 | yes | Counts and as-of figures in the numeric face with fixed precision per region (blueprint §11) |
| STD-UI-4 | yes | Absent counts and checks that could not run render as not determinable, never as zero (AC-8, AC-11; 5.3) |
| STD-UI-5 | yes | As-of lines in America/Chicago with the zone; session dates unconverted (blueprint §4.8) |
| STD-UI-6 | no | No money or market-capitalisation figure is compared on these screens; CAP-001's tables are taken over unchanged |
| STD-UI-7 | yes | Status tiers for downloads and checks; no direction, magnitude or environment colour is used in M1 (AC-20) |
| STD-UI-8 | yes | Every status carries its label and tier shape (AC-20); attention counts are text (AC-16) |
| STD-UI-9 | no | No chart or per-entity series in M1; S01's sparklines belong to the strategy list (M2) |
| STD-UI-10 | no | Binds the shared theme; no token is added (blueprint §13) |
| STD-UI-11 | no | No paper or live environment exists in M1; the environment region ships with paper trading (D-7) |
| STD-UI-12 | yes | Every download outcome, check result and stock state maps to one tier of the blueprint's status map (AC-20) |
| STD-UI-13 | yes | Every count and check carries its as-of time (AC-8, AC-11) |
| STD-UI-14 | yes | Present, absent and not determinable are distinct on checks and counts (AC-8, AC-11, AC-24) |
| STD-UI-15 | yes | Only recorded outcomes are shown; a partial download is never shown complete (AC-12) |
| STD-UI-16 | yes | Missing data is named as Incomplete and skipped, never filled (AC-13; blueprint principle 5) |
| STD-UI-17 | partial | Carried by CAP-002's scores; these screens show counts, not percentiles, so no restatement mark is rendered here |
| STD-UI-18 | yes | The daily prices check states that gaps and currency are judged against the days and the newest session other followed stocks hold, not a trading calendar (S09 §8; DEC-0201, DEC-0206), and a clean result asserts that nothing is missing, never that prices are current to the market (review v1 FINDING-2, resolved 2026-10-25) |
| STD-UI-19 | yes | Following and downloading are routine, stopping following is consequential; every refusal names the operation, the stock and the reason (AC-13, AC-14, AC-15) |
| STD-UI-20 | no | No promotion in M1 |
| STD-UI-21 | no | No order path in M1; the kill switch ships with paper trading (D-7). Section 5.2 records it as a non-dependency |
| STD-UI-22 | no | No capital-at-risk or destructive control on these screens |
| STD-UI-23 | yes | AC-24; the UX brief enumerates all eight states per region, starting from the screen specs' states tables |
| STD-UI-24 | yes | AC-25; the screen specs' accessibility sections are the starting point |
| STD-UI-25 | yes | AC-25; cadences recorded in the design, starting from the screen specs |
| STD-UI-26 | yes | AC-3: setup shows steps, position and what remains, and going back keeps entered data |
| STD-UI-27 | no | No chart in M1 |
| STD-UI-28 | no | No chart in M1 |
| STD-UI-29 | yes | AC-26; density inherits the theme's tier (STD-UI OQ-UI-4 still open) |
| STD-UI-30 | yes | The followed-stock and coverage lists CAP-001 committed to 3000 stocks (CAP-001 AC-4) keep CAP-001's volume handling when taken over; no new list reaches that volume |

## 6. Assumptions

- **The rail shows only shipped destinations in M1** — Home, Research, Data
  health and Settings — and gains Strategies and Portfolio when their
  capabilities ship (AC-1). Blueprint §2.1 lists all six and S01 §2 says
  undelivered regions are absent, not disabled. **Confirmed by the owner on
  2026-10-25** (specification review v1).
- **CAP-002 ships within M1 and its score-currency read (DEC-0071) is how Home
  and Data health learn when scores were produced.** Until it is deployed, the
  *Factor scores* card and the score as-of render as not determinable. If
  CAP-002 lands after this capability, those two regions are verified at
  integration rather than at this capability's delivery.
- **"One release" in AC-18 means the next release after the one carrying this
  capability**, releases being the images CAP-001 E1-S9 defined. **Confirmed by
  the owner on 2026-10-25** (specification review v1).
- **Setup is complete when the first download has been started, not finished**
  (S02 §6), so an owner who leaves mid-download still lands on Home.

## 7. Open Questions

- **OQ-1 — Do downloads get a short visible number?** CAP-002's DEC-0083 left
  this `[REQUIRES INPUT]` for the owner and names this capability as its likely
  owner. It decides how *Recent downloads* rows, the download detail title and
  setup's progress line name a download; the interim rendering is the start
  time in America/Chicago. Affects AC-11 and AC-17 copy. **Answered 2026-10-25
  by the owner: no.** A download is named by its start time in America/Chicago,
  with the zone, everywhere; no stored or derived number is added in M1 or
  planned. The interim rendering of DEC-0083 is the permanent one, and CAP-002's
  system design question 11 can be closed the same way.
- **OQ-2 — Which lands first, this shell or CAP-002's Research screens?** Both
  edit the shell. If this capability lands first, CAP-002 never builds the
  interim Research entry of DEC-0069; if CAP-002 lands first, AC-27 replaces
  it. Affects sequencing, not scope. **Answered 2026-10-25 by the owner:
  CAP-002 lands first.** Its Research screens ship with their interim rail entry
  (DEC-0069) and AC-27 replaces it.
- **OQ-3 — Is uploading a CSV an M1 way to name stocks?** S02 step 3 offers
  *Paste a list*, *Upload a CSV* and *Add later*, and S02 §11 notes the file
  control the design system lacks. AC-5 covers pasting only; if the owner wants
  the upload in M1, it becomes a criterion here and a component gap for the
  design system's intake. **Answered 2026-10-25 by the owner: no.** M1 setup
  offers *Paste a list* and *Add later*; the *Upload a CSV* departure from S02
  step 3 stays recorded in the UX design, with no file control and no intake.
- **OQ-4 — Does the first vendoring of design-system components into the
  repository need a tech-stack amendment?** `tech-stack.md` approves
  `shadcn/ui` on Radix (OQ-TS-6) but the owner interface has so far hand-built
  its components over the theme. This capability is the first consumer of the
  vendored components and of the new `command`, `stepper`, `progress` and
  `radio-group` specs; whether the utility libraries they bring are within the
  approved stack is a `$tech-stack` question, raised here so system design
  does not decide it silently. **Answered 2026-10-25 by the owner: yes, and all
  ten packages are confirmed** in `tech-stack.md` v6 (OQ-TS-10): `cmdk`,
  `sonner`, `clsx`, `tailwind-merge`, `class-variance-authority` and
  `lucide-react` (DEC-0205) and `@tanstack/react-table`, `react-hook-form`,
  `zod` and `@hookform/resolvers` (DEC-0215), beside the `@radix-ui/react-*`
  primitives. Review v1 FINDING-1 is resolved; each licence is recorded when the
  package is added (SEC-DEP-003).

## 8. Readiness Assessment

**Readiness Score: 85/100**

Problem, users, outcome, scope, flows and 27 acceptance criteria are defined
against an approved blueprint and three approved screen specifications, and
every dependency is typed and cited. The four product questions raised at
definition — the visible download number (OQ-1), delivery order relative to
CAP-002 (OQ-2), CSV upload in M1 (OQ-3) and the tech-stack standing of the
vendored components (OQ-4) — were answered by the owner on 2026-10-25 after
specification review v1; none changed the scope or a criterion.
