---
artifact_schema_version: 1
artifact_id: CAP-001-ux-brief
artifact_type: ux-brief
artifact_version: 4
capability_id: CAP-001
title: Market Data Acquisition Foundation
created: 2026-09-04
updated: 2026-09-05
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
ai_provenance:
  agent_id: ux-brief-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-05T03:45:00Z
  source_artifacts:
    - id: CAP-001
      version: "2"
    - id: CAP-001-system-design
      version: "1"
    - id: STD-UI
      version: "3"
    - id: factorflow-design-system
      version: "ported from the first build, 2026-09-05"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# UX Brief: Market Data Acquisition Foundation

**Capability:** CAP-001
**Design System:** FactorFlow Design System (shadcn/ui + Radix), configured at `projects/factorflow-v2/design-system.yaml`, held in `design-system/` in this repository. 11 component specifications, resolved and read for this brief.
**Theme:** `design-system/theme.css`
**Designer Handoff Date:** 2026-09-05

This is the first interface FactorFlow-v2 builds, but it is no longer the first
place its interface decisions are made. Since v1 of this brief, two artifacts
have landed that govern it: `docs/constitution/standards/ui-conventions.md`
(STD-UI v2), the project's enforceable UX standard, and the design system at
`design-system/`. Both cite this brief's v1 as a source. Several questions v1
raised are now answered by them rather than by the designer, and §12 records
conformance rule by rule as STD-UI §4 requires.

What has not changed is what the interface is for. It has one job that is easy to
state and easy to get wrong: tell the owner-operator the truth about what data
the product holds. Three of the twenty one acceptance criteria exist only because
a plausible interface would lie. AC-17 forbids an empty state that reads as a
healthy one. AC-9 forbids a run that failed presenting as succeeded. AC-8, read
against system design constraint 5.5, forbids reporting zero gaps when gap
detection cannot run at all. STD-UI-4, STD-UI-14, STD-UI-15 and STD-UI-18 now
carry the same obligations as project-wide rules. Every presentation decision
below is subordinate to them.

## 1. Screens Needed

| Screen | Purpose | User Flow / AC |
|--------|---------|----------------|
| Coverage overview | Show, per named instrument, which data types are present, the date range covered, when it was last acquired, and missing trading days inside that range, so the owner can tell which instruments are fit to rely on without inspecting the data store | AC-3, AC-7, AC-8, AC-17, AC-21; flow "Confirm the data is fit to rely on"; system design 4.2 `GET /api/coverage` |
| Instrument list | Maintain the named acquisition list: see it, add to it, retire from it, without editing configuration files or the data store | AC-1, AC-4, AC-21; flows "Acquire market data for the first time" and "Add an instrument after the first acquisition"; system design 4.2 `GET/POST/DELETE /api/instruments` |
| Acquisition settings | State the history depth that governs what is acquired, before the first run, and see whether the provider credential was supplied to the process | AC-2, AC-13; flow "Acquire market data for the first time" steps 2 and 5; system design 4.2 `PUT /api/settings/history-depth` |
| Run history | Show every acquisition run and its honest outcome, so a failed, partial, cancelled or abandoned run is never mistaken for a successful one | AC-9, AC-19, AC-20; flow "Diagnose and recover from a failed acquisition" step 2; system design 4.2 `GET /api/acquisition-runs` |
| Run detail | Show what one run did instrument by instrument and data type by data type, the reason reported for each failure, and the action to cancel a run that is under way | AC-10, AC-11, AC-19, AC-20; flows "Diagnose and recover" and "Stop an acquisition that is taking too long"; system design 4.2 `GET /api/acquisition-runs/{runId}`, `POST /api/acquisition-runs/{runId}/cancel` |
| Application status | A persistent region of the shell reporting whether the product is running and how its most recent acquisition run ended, plus the state the interface must show when the API is not answering at all | AC-16, AC-18; flow "Operate and upgrade the running product" steps 4 and 5; system design 4.2 `GET /api/health`, control flow step 36 |

Six screens, of which one, Application status, is a persistent shell region with
a detail view rather than a destination. It is listed as a screen because it has
its own information architecture and its own states. Per `design-system/README.md`
it is a composition rather than a component, so its assembly belongs in
`ux-design.md`.

## 2. Information Architecture

### 2.1 Coverage overview

**Data elements:**

- Instrument symbol (source: AC-1 named instrument list; system design 4.1 `instrument-list-service`)
- Stable instrument identity: CIK, composite FIGI, share class FIGI (source: system design assumption 2; identity does not rest on the ticker)
- Lifecycle state, active or retired (source: AC-21; system design constraint 5.8)
- Presence of each of the four data types: instrument reference, daily prices, company fundamentals, corporate actions (source: AC-3, AC-7)
- Date range covered, derived from rows actually written (source: AC-7; system design constraint 5.9; STD-UI-15)
- When this instrument was last acquired (source: AC-7; STD-UI-13)
- Missing trading days inside the instrument's covered range, or the statement that gap detection is unavailable (source: AC-8; system design constraint 5.5; STD-UI-14)
- Whether anything has been acquired at all (source: AC-17; STD-UI-23)

**Grouping and hierarchy:**

- One row per named instrument, active and retired instruments both present and visibly distinguished, because AC-21 requires retained coverage to be visible and distinguishable rather than omitted.
- The four data types are a group within the row. They are peers, not a ranking: a missing fundamental matters as much as a missing price.
- Gap information is a per-row summary that opens to the specific dates. The dates are the evidence; the summary is what the owner scans.

**Primary vs. secondary information:**

- Primary: which instruments have complete coverage over the range the owner needs, and which do not. Flow "Confirm the data is fit to rely on" step 4 states this as the outcome, and it is what the default view must answer without interaction.
- Secondary: exact covered ranges, the specific missing dates, the stable identifiers, and the last-acquired timestamp to the minute.

**The state that carries the risk.** Gap detection has three outcomes, not two:
gaps found, no gaps found, and gap detection unavailable. The third arises
whenever fewer than two named instruments hold data in the range, because the
trading-day set is derived from the instruments themselves and would then equal
the single instrument's own dates and report zero vacuously (system design
constraint 5.5). STD-UI-14 makes this a rule rather than a judgement, and the
design system supplies the exact vocabulary: the `badge` component's
`coverage-present` / `coverage-absent` / `coverage-unknown` variants, where
`coverage-unknown` carries `--pattern-indeterminate` and the word *unknown* and
"MUST NOT read as a milder `coverage-absent`".

Two further obligations land on this screen. STD-UI-4 requires a cell with no
observation to render as an explicit missing marker, and the `data-table` spec
fixes it as an em dash, never `0` and never blank, with blank reserved for a
column that does not apply to that row. STD-UI-18 requires the gap check to state
what it does not cover: a market-wide provider outage leaves no gap to detect,
because the day never enters the trading-day set, so the absence of gaps must not
be presented as evidence of completeness.

### 2.2 Instrument list

**Data elements:**

- Symbol as named by the owner (source: AC-1)
- Stable identity returned by the provider, once reference data has been acquired for it (source: system design assumption 2)
- Lifecycle state and, for a retired instrument, when it was retired (source: AC-21)
- Count of instruments currently named, against the volume the product commits to (source: AC-4, up to 3000)
- Whether the provider recognised this instrument on the most recent run that reached it (source: AC-11)

**Grouping and hierarchy:**

- Active instruments are the working list. Retired instruments are present but separated, because they are no longer acquired and their coverage is historical.
- Adding and retiring are the two write actions. There is no delete, at any level of the interface.

**Primary vs. secondary information:**

- Primary: the active list and its size.
- Secondary: retired instruments, identity detail, and per-instrument provider recognition.

**Retirement is not deletion, and the interface must not say it is.** System
design constraint 5.8 and AC-21 make removal a retirement: acquisition stops,
every observation already recorded stands. STD-UI-2 raises this from good
practice to a rule, and cites this exact case as its authority. The consequence
for the designer is concrete: the confirmation uses the `dialog` component's
`confirm` variant, not `destructive`. The `destructive` variant is specified for
"deleting or discarding data", and retirement discards nothing. Choosing it would
put the product's most prominent confirmation behind a word the product does not
mean.

### 2.3 Acquisition settings

**Data elements:**

- History depth, the owner's statement of how far back history must reach (source: AC-2; system design 4.2 `PUT /api/settings/history-depth`)
- Whether history depth has been stated at all, because acquisition cannot start before it has (source: AC-2; system design traceability row AC-2, the runner refuses to claim a run with no depth set)
- Whether the provider credential was supplied to the process, as a present or absent fact only (source: AC-13)

**Grouping and hierarchy:**

- History depth is the one setting the owner controls here. It gates the first run, so its unset state belongs at the top of this screen and is echoed wherever a run can be started.
- Credential status is read-only and reported, not edited.

**Primary vs. secondary information:**

- Primary: history depth and whether it has been stated.
- Secondary: credential presence.

**The credential is never a form field.** AC-13 requires the credential to be
supplied at runtime from the environment and to appear in no view the product
renders. There is therefore no input for it anywhere in the interface, and no
screen echoes it, not masked, not truncated, not as a last-four. What the
interface may report is that a required environment value was missing, naming the
variable and never its value, which is what the process itself does at start
(system design control flow step 38). STD-UI-1 applies to that message: it names
the variable, not a `500` or an exception class.

### 2.4 Run history

**Data elements:**

- Run identifier (source: system design 4.2, `POST /api/acquisition-runs` returns a run id)
- When the run was requested, when it started, when it ended (source: STD-UI-5, ISO-8601 with a visible zone)
- Outcome, one of eight lifecycle states: requested, running, cancelling, succeeded, partial, failed, cancelled, abandoned (source: system design 4.1 `run-journal`; tiered by STD-UI-12 and reproduced in §12.2)
- How many named instruments the run wrote and how many failed (source: AC-9, outcome is computed from written coverage rather than from intent)

**Grouping and hierarchy:**

- Reverse chronological. The run the owner cares about is almost always the most recent one, and flow "Diagnose and recover from a failed acquisition" step 2 opens here to find it.
- A run currently in progress belongs at the top and visibly distinct from completed runs, because it is the only row whose state will change while the owner is looking at it.

**Primary vs. secondary information:**

- Primary: outcome and when.
- Secondary: counts, timings, identifiers.

**Eight states, four of which are not success and are not the same as each
other.** Failed, partial, cancelled and abandoned each mean something different
to the owner and imply a different next action. STD-UI-12 now fixes their
severities, and two of its assignments are the ones a designer would most likely
get wrong: `partial` is **warning, never good**, and `cancelled` is **neutral,
never critical**. A run the owner deliberately stopped is not a fault, and a run
that brought in less than it should have is not a success. Collapsing any of the
eight into a generic "unsuccessful" defeats AC-9 and AC-20.

This screen is also the first surface in the product to render a timestamp, which
is why STD-UI's own OQ-UI-3, the single display time zone, is called out there as
wanting an answer before the first screen is built. It is carried into §9 here.

### 2.5 Run detail

**Data elements:**

- The run's outcome and lifecycle state (source: AC-9)
- Per instrument: whether it was reached, whether it wrote, whether it failed (source: AC-10, AC-11)
- Per instrument and per data type: the reason reported for a failure (source: AC-10; system design control flow step 21)
- Which instruments the provider did not recognise, distinct from instruments that failed for other reasons (source: AC-11)
- For an abandoned run, what abandonment means and that coverage written before the interruption stands (source: AC-20; system design constraint 5.7 and control flow step 51)
- For a cancelled run, that instruments not reached are simply absent rather than partially written (source: AC-19; system design control flow step 47)

**Grouping and hierarchy:**

- One row per instrument, collapsed by default, expanding to the four data types. A run may cover up to 3000 instruments (AC-4), so an expanded-by-default view of four rows per instrument is unreadable at the volume the product commits to. The `data-table` `expandable` variant exists for exactly this and cites STD-UI-30.
- Failures sort above successes, or are filterable to them. The owner opens this screen because something went wrong, and flow "Diagnose and recover" step 3 is about finding which instrument and which data type.

**Primary vs. secondary information:**

- Primary: which instruments failed and why.
- Secondary: the full instrument roster and per-data-type detail for instruments that succeeded.

**Cancellation is cooperative and the interface must not promise otherwise.** The
request is recorded against the run rather than acted on the process, and the
runner observes it between instruments (system design control flow steps 44 and
45). So cancelling produces a `cancelling` state that persists for up to one
instrument's work before becoming `cancelled`. STD-UI-12 tiers `cancelling` as
warning, "requested but not effective", which is precisely the honest reading. A
control that reads as an immediate stop misdescribes it, and STD-UI-2 forbids
that wording. AC-19 also carries an edge the interface owns: if the run had
already finished when cancellation was asked for, the owner is told it completed
rather than being shown a cancellation that did not happen.

**Every error here has three parts.** STD-UI-19 requires each to name the
operation, the affected resource and the reason, and to offer a recovery action
where one exists. For this screen that is: acquiring a named data type, for a
named instrument, for the reason the provider or the client reported, with the
recovery being a re-run, which AC-6 makes safe.

### 2.6 Application status

**Data elements:**

- Whether the product is running and answering (source: AC-18; system design 4.2 `GET /api/health`)
- How the most recent acquisition run ended (source: AC-18)
- The state where the API is not answering at all (source: AC-16; system design control flow step 36, a migrator failure exits the container non-zero and the API never binds)

**Grouping and hierarchy:**

- A compact persistent region in the shell, present on every screen, opening to detail. AC-18 requires the owner to be able to determine both facts without inspecting the data store, which makes this ambient rather than a place to navigate to.

**Primary vs. secondary information:**

- Primary: is it running, and did the last run fail.
- Secondary: run timing and the identifier of that run.

**The unreachable state is a real state and it belongs to the interface.** When
`schema-migrator` cannot bring the store forward, the API never binds, so the
single-page application loads from a bundle it already has and every request
fails. STD-UI-23 names this state explicitly and requires it to be designed
rather than surfaced as a generic transport error. A network error would tell the
owner nothing, and AC-16 is precisely the case where the product is deliberately
refusing to run.

**This region is where a later obligation lands, and it should be designed to
receive it.** STD-UI-11 requires a persistent, non-dismissible region stating the
active trading environment on every screen. CAP-001 has no paper or live
environment, so the rule does not apply here (§12.1). But this is the region that
will carry it, and per AGT-SCOPE-005 the shape is cheap to get right now and
expensive to restructure once M2 puts real money behind it.

## 3. Interactions Required

Every action carries its STD-UI-19 tier: **routine** (reversible, no
confirmation), **consequential** (confirmation describing the actual effect), or
**capital-at-risk**. CAP-001 has no capital-at-risk action, because it places no
orders.

| Screen | User Action | Tier | Expected Outcome | Error / Edge Case |
|--------|-------------|------|------------------|-------------------|
| Instrument list | Add an instrument to the acquisition list | routine | The instrument appears as active and is acquired by the next run (AC-1) | Already named, active or retired; the symbol is not one the provider recognises, which is not known until a run reaches it (AC-11), so add cannot validate against the provider and must not appear to |
| Instrument list | Retire an instrument | consequential | Acquisition stops for it; every observation already recorded is retained and remains visible on the coverage overview, distinguished from active instruments (AC-21) | The confirmation describes retirement, not deletion (STD-UI-2), and uses `dialog` `confirm` rather than `destructive`. Retiring the last active instrument leaves gap detection unavailable (system design 5.5) |
| Instrument list | Find an instrument in a list of up to 3000 (AC-4) | routine | The owner reaches a named instrument without paging blindly | Search and filter are obligations under STD-UI-30, not conveniences, and belong to the table toolbar rather than a standalone `input` |
| Acquisition settings | State the history depth | consequential | The depth is recorded and governs what subsequent runs acquire (AC-2) | Not yet stated: the start control renders as `button` `blocked` with the reason beside it, rather than a run that starts and then refuses to be claimed. Changing depth after data exists has no stated behaviour, see §9 |
| Coverage overview | Read per-instrument coverage | routine | Data types present, range covered, last acquired, gaps (AC-7, AC-8) | Nothing acquired yet: state that plainly (AC-17, STD-UI-23). Gap detection unavailable below two instruments holding data in range: `coverage-unknown`, never zero (STD-UI-14) |
| Coverage overview / Run history | Start an acquisition run | consequential | The request is accepted and a run appears in history; the interface does not wait on the provider (system design control flow steps 3 and 4, a 202 with a run id) | History depth unset: `button` `blocked` with the reason, which stays focusable so the reason reaches a keyboard user. A run already in progress: behaviour unstated, see §9 |
| Run history | See a run in progress advance | routine | Progress becomes visible without the owner reloading the page, refreshing every 10 seconds | There is no server-pushed progress (system design control flow steps 28 to 31). STD-UI-25 is satisfied: the cadence is decided and each polled region shows its last-updated time |
| Run detail | Cancel a run that is under way | consequential | The run enters `cancelling`, then `cancelled`; instruments not yet reached are untouched; coverage already written is retained (AC-19) | The run finished before the request was observed: tell the owner it completed, do not show a cancellation that did not happen (AC-19, flow step 5). Not `destructive`: nothing is discarded |
| Run detail | Read why a run failed or was partial | routine | The affected instrument and data type, and the reason reported (AC-10), in the three parts STD-UI-19 requires | An unrecognised instrument is reported and the run continued (AC-11); this reads as a data problem the owner fixes, not as a run failure |
| Run detail | Understand an abandoned run | routine | The owner learns the run was reclaimed because the process holding it stopped, that coverage written before it stands, and that a new run may be started (AC-20) | Tiered `serious` by STD-UI-12, "recoverable, and requires explanation to be understood". Without that explanation it reads as a product defect |
| Application status | Check that the product is running and how the last run ended | routine | Both facts are available from any screen without inspecting the data store (AC-18) | The API is not answering: a designed state naming that the product is not running (AC-16, STD-UI-23), never a generic transport error |
| Every screen | Load data | routine | Content appears | Eight states are required per data-bearing region by STD-UI-23, enumerated in §12.4. Never-populated and nothing-found may not be collapsed (AC-17) |

## 4. Suggested Components

> **Note:** This section applies only when a design system is configured in `projects/factorflow-v2/design-system.yaml`. One is, so this section names components that have a `design-spec.md` in `design-system/components/`.

Every component below was read from its specification. Nothing is proposed that
does not exist, and where CAP-001 needs something the design system does not
have, it is recorded as a gap rather than invented, per `design-system/intake.md`.

| UI Pattern | Suggested Component | Variant | Design Spec Reference |
|------------|---------------------|---------|-----------------------|
| Coverage overview: one row per instrument, expanding to per-data-type detail | `data-table` | `expandable` | `design-system/components/data-table/design-spec.md` |
| Instrument list at up to 3000 rows, expanding to stable identity | `data-table` | `expandable` | `design-system/components/data-table/design-spec.md` |
| Run history: completed runs as immutable records | `data-table` | `history` | `design-system/components/data-table/design-spec.md` |
| Run detail: instrument roster, expanding to the four data types | `data-table` | `expandable` | `design-system/components/data-table/design-spec.md` |
| Run lifecycle status, all eight states | `badge` | `status-neutral`, `status-active`, `status-good`, `status-warning`, `status-serious`, `status-critical`, per the mapping in §12.2 | `design-system/components/badge/design-spec.md` |
| Coverage presence, three states | `badge` | `coverage-present`, `coverage-absent`, `coverage-unknown` | `design-system/components/badge/design-spec.md` |
| Retired instrument marker | `badge` | `secondary` | `design-system/components/badge/design-spec.md` |
| Start an acquisition run | `button` | `default` | `design-system/components/button/design-spec.md` |
| Start blocked because history depth is unstated | `button` | `blocked` | `design-system/components/button/design-spec.md` |
| Cancel a run under way | `button` | `secondary` | `design-system/components/button/design-spec.md` |
| In-row actions on the instrument list | `button` | `outline` or `ghost` | `design-system/components/button/design-spec.md` |
| Confirm retiring an instrument | `dialog` | `confirm` | `design-system/components/dialog/design-spec.md` |
| Run detail header: the attributes of one run | `card` | `summary` | `design-system/components/card/design-spec.md` |
| State the history depth | `form` | `stacked` | `design-system/components/form/design-spec.md` |
| History depth value, if expressed as a number of years | `input` | `numeric` | `design-system/components/input/design-spec.md` |
| History depth value, if expressed as a choice from a fixed set | `select` | `default` | `design-system/components/select/design-spec.md` |
| A run finished while the owner was on another screen | `toast` | `success`, `warning` or `error` by outcome | `design-system/components/toast/design-spec.md` |

Two entries are conditional on the open question in §9 about how history depth is
expressed: `input` `numeric` if it is a number of years, `select` if it is a
choice from a fixed set. The designer should not need both.

**Components deliberately not proposed.** `chart` is unused: the system design
states that charting is not used anywhere in CAP-001, which needs tables, forms
and status only. `tabs` is unused: no screen presents alternative views of one
subject. `input` is not proposed for table filtering, because its own
specification directs filtering to the table toolbar.

**COMPONENT-SPEC-GAP: indeterminate progress indicator.** An acquisition run
under way needs progress indication, and no duration target exists for a run, so
nothing honest can be estimated. No component in the design system covers it, and
`design-system/README.md` already records this as the one known gap for CAP-001,
noting it is genuinely new rather than a variant and that its interaction and
accessibility contracts must be derived from the upstream Radix documentation
rather than written from memory. This brief records the gap and proposes nothing,
per `intake.md`. Resolving it is a deliberate human edit to the design system,
which the UX skills may not make.

**Two compositions, not components.** The application status region and the
polled live region are assembled from existing components rather than being
components themselves. `intake.md` step 1.3 places compositions in the
capability's `ux-design.md`, and `README.md` says the same of these two
specifically.

## 5. Constraints

- **STD-UI v2 governs every surface here.** Where this brief and the standard
  disagree, the standard wins; a capability may be stricter than a rule but never
  looser. §12 records conformance rule by rule, which STD-UI §4 requires of the
  UX brief rather than of a later artifact.
- **Device target: desktop browser, keyboard first.** The product is self-hosted
  on a single machine the owner controls and the interface binds to loopback
  (capability section 5.3; system design constraint 5.11). No mobile or touch
  target is stated anywhere in the capability, system design, charter or STD-UI,
  so none is assumed here.
- **No authentication, no account, no user concepts.** AC-14 and system design
  constraint 5.11. There is no sign-in, no user menu, no permissions surface, and
  nothing in the interface assumes an authenticated principal.
- **One owner-operator.** System design constraint 5.16 and charter section 2. No
  multi-user language, no assignment, no ownership fields.
- **The interface talks only to `ingestion-api`.** There is no path from the
  browser to the ingestion process (system design section 2).
- **No server-pushed progress.** `POST /api/acquisition-runs` returns 202 and the
  browser learns of progress by polling (system design control flow steps 3, 4
  and 28 to 31). STD-UI-25 turns this into two obligations: a visible last-updated
  time on every polled region, and a cadence recorded in the design.
- **Up to 3000 named instruments per run (AC-4), and STD-UI-30 says what that
  requires:** such a list MUST be virtualised and MUST provide search and filter.
  Note the tension recorded in §12.1: the `data-table` specification's anatomy
  offers pagination and does not mention virtualisation, so satisfying STD-UI-30
  is not automatic from choosing the component.
- **Coverage is derived, never asserted** (system design constraint 5.9,
  STD-UI-15). The interface may not present intended or expected coverage.
- **Presence has three states** (system design constraint 5.5, STD-UI-14). Gap
  detection unavailable is not an error and not zero gaps.
- **A check states what it does not cover** (STD-UI-18). A market-wide provider
  outage cannot be detected, so the absence of gaps is not evidence of
  completeness.
- **Missing is not zero** (STD-UI-4). An absent observation renders as an em dash
  per the `data-table` specification, never `0`, and blank means only that the
  column does not apply.
- **Dates are ISO-8601 and timestamps carry a visible zone, which is
  America/Chicago** (STD-UI-5, owner decision of 2026-09-05 closing OQ-UI-3). The
  same zone computes `observed_on`. Session dates are calendar dates in the
  exchange's terms and are rendered unconverted; only timestamps carry the zone.
  Central is not the exchange zone, so a run between 23:00 and 24:00 Central
  stamps a calendar day that exchange time would call the next one, and the run
  history is where that is visible.
- **Polled refresh cadences are decided** (STD-UI-25, owner decision of
  2026-09-05): run progress every 10 seconds, application status every 30
  seconds, and coverage on demand rather than on a timer, refreshing once when a
  run completes. Coverage is the one expensive read, because gaps are derived at
  read time (system design constraints 5.5 and 5.9) across up to 3000 instruments
  and four data types, and its numbers change only as instruments complete. Every
  polled region displays its last-updated time.
- **The provider credential appears in no view** (AC-13).
- **Retirement, never deletion** (AC-21, system design constraint 5.8, STD-UI-2).
  No destructive action exists in this capability at all.
- **No charting** (system design section 4.3), so STD-UI-27 and STD-UI-28 do not
  apply.
- **Density, type scale and spacing come from theme tokens** (STD-UI-29), and no
  component may be overridden at a call site; a correction belongs in the
  vendored component.
- **Accessibility is enforced by review, not by tooling.** `tech-stack.md`
  records that Biome has no `eslint-plugin-jsx-a11y` equivalent, and STD-UI-24
  restates it. The requirements in §6 are written to be reviewable against.
- **This capability sets the interface patterns the product inherits.** Per
  AGT-SCOPE-005 the status vocabulary, empty and failure state conventions and
  table shape chosen here are cheap now and expensive after M2 through M6 build
  on them. STD-UI now holds most of these, which is what changed since v1.

## 6. Accessibility Requirements

- **WCAG level or target:** WCAG 2.1 AA. This is no longer an inherited default:
  STD-UI-24 adopts it as the project target, explicitly closing the question v1
  of this brief raised.
- **Keyboard navigation needs:** Every operation completable by keyboard
  (STD-UI-24), including adding and retiring an instrument, starting a run,
  cancelling a run, expanding an instrument row, and reaching the application
  status detail. Focus is managed on the retirement dialog and on content
  inserted into the page, and visible focus is never suppressed. The `button`
  `blocked` variant matters here specifically: it stays focusable and exposes its
  reason through `aria-describedby`, where a plain disabled control is not
  focusable and the reason never reaches a keyboard or screen-reader user.
- **Screen reader considerations:** The eight run states, the coverage tri-state
  and the per-data-type outcomes each carry an accessible text equivalent, never
  an icon alone. Tables carry programmatic row and column headers wherever a
  cell's meaning depends on both, which on the coverage overview it always does.
  Sorting or filtering must not move focus, and the new row count is announced
  politely. Note the scope condition in STD-UI §2.3: screen-reader certification
  is exempt as a release gate for this product, because there is one
  owner-operator and no second user, but **the semantics remain mandatory**. A
  reviewer should not raise the exemption as licence to omit markup.
- **Polled content:** Regions updated by polling announce politely rather than
  replacing silently (STD-UI-24) and display their last-updated time (STD-UI-25).
- **Contrast:** Text at 4.5:1, large text and interactive boundaries at 3:1
  (STD-UI-24).
- **Touch / mobile requirements:** None. No touch or mobile target is stated in
  any source document. Control target sizes still follow the component
  specifications, which set at least 24x24 CSS pixels for sort controls and
  checkboxes.
- **Colour-not-solo-state requirements:** Mandatory under STD-UI-8, and
  load-bearing here rather than routine. Succeeded, partial, failed, cancelled
  and abandoned are five outcomes a colour scheme cannot separate, and the
  distinction between partial and succeeded is exactly the one AC-9 protects.
  Every status carries a text label plus an icon or shape. STD-UI-8's verification
  is the test to design against: a greyscale rendering of the surface remains
  fully readable.

## 7. Component Library References

> **Note:** This section applies only when a design system is configured. Omit when no design system is available.

| Component | Slug | Design Spec Path | Figma Node ID (if known) |
|-----------|------|------------------|--------------------------|
| Data Table | `data-table` | `design-system/components/data-table/design-spec.md` | none |
| Badge | `badge` | `design-system/components/badge/design-spec.md` | none |
| Button | `button` | `design-system/components/button/design-spec.md` | none |
| Dialog | `dialog` | `design-system/components/dialog/design-spec.md` | none |
| Card | `card` | `design-system/components/card/design-spec.md` | none |
| Form | `form` | `design-system/components/form/design-spec.md` | none |
| Input | `input` | `design-system/components/input/design-spec.md` | none |
| Select | `select` | `design-system/components/select/design-spec.md` | none |
| Toast | `toast` | `design-system/components/toast/design-spec.md` | none |

No Figma node IDs exist. `design-system/component-map.json` carries a null
`figma_file_key` and an empty component map, because shadcn/ui publishes no
official Figma kit. The map records the consequence: the Figma-based
`$ux-spec-extraction` path has no file keys to resolve, and the automated
`$ux-design` path is unaffected. **This bears on the path decision at the end of
this brief:** Path A's Figma route has no design source to extract from today.

Two components in the design system are not referenced by CAP-001, `chart` and
`tabs`, for the reasons given in §4.

## 8. EDG Compliance Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Consistency with product patterns | pass | Since v1 this is no longer a judgement call. STD-UI-1 fixes the vocabulary, STD-UI-12 fixes the severity tiers including CAP-001's own run lifecycle, and the design system fixes the components and tokens. Terminology here is held to the standard's list, and the terms CAP-001 adds are recorded in §12.1 as STD-UI-1 permits |
| Progressive disclosure | pass | Coverage overview answers "which instruments are fit to rely on" before any interaction, with ranges, dates and identifiers behind expansion. Run detail collapses to one row per instrument and expands to the four data types, using the `data-table` `expandable` variant written for this |
| Error clarity | pass | STD-UI-19's three parts are stated per error in §2.5 and §3: operation, affected resource, reason, plus a recovery action where one exists. Abandoned runs carry an explanation. The unreachable-API state names its cause. No implementation vocabulary reaches the owner (STD-UI-1) |
| Accessibility | pass | WCAG 2.1 AA is now the adopted project target under STD-UI-24 rather than an inherited default, and §6 states the requirements against it. Enforcement remains human review, which STD-UI-24 acknowledges in the rule itself rather than leaving as a gap |
| States and feedback (empty, loading, error, success, partial) | pass | All five, plus the three more STD-UI-23 requires: stale, unavailable-because-a-check-could-not-run, and unreachable. §12.4 enumerates all eight per region as the rule's verification demands. Never-populated and nothing-found are kept distinct (AC-17) |

**Three intentional departures from `edg-compliance`, recorded so a reviewer does
not raise them as findings.** STD-UI §1.2 declares each: the six severity tiers
of STD-UI-12 where EDG names three levels, reconciled by the mapping in that
rule; the kill switch taking no confirmation under STD-UI-21, which CAP-001 does
not deliver; and screen-reader certification exempted as a release gate while its
semantics stay mandatory. STD-UI also records four scope exemptions where EDG
presupposes a product family, a review body, a support channel or a second user
that this product does not have. For CAP-001 the relevant one is error codes:
EDG asks for documented consistent codes, and STD-UI-19's actionability
obligation replaces them, because an error code exists so a user can quote it to
someone and this product has one owner and no support channel.

## 9. Open Questions

Six questions earlier versions raised are now answered and are not repeated: the
accessibility target (STD-UI-24 adopts WCAG 2.1 AA), the status vocabulary
(STD-UI-12), the presence tri-state vocabulary (STD-UI-14 and the `badge`
variants), whether components could be named at all (the design system now
exists), the display time zone (America/Chicago, closing OQ-UI-3), and the polled
refresh cadences. The last two were settled by the owner on 2026-09-05 and are
recorded in §5 as constraints rather than carried here as questions. Every
quantitative value in this brief now cites a source. The one unsourced threshold
left in the capability's orbit belongs to the design system rather than to this
brief: the minimum palette separation, recorded in
`design-system/theme-validation.md`.

- **Which density tier is the default?** STD-UI's OQ-UI-4 records that
  `theme.css` currently resolves `--row-height` to `--row-height-comfortable` as
  a port-time placeholder rather than an owner decision. CAP-001's tables are the
  first consumer of it, and STD-UI-29 lets a capability select a tier from the
  defined set but never introduce a value.
- **How does the owner add instruments at the volume the product commits to?**
  AC-4 commits to runs of up to 3000 instruments, and AC-1 requires adding
  without editing configuration files or the data store. Adding 3000 one at a
  time satisfies AC-1 literally and defeats it in practice, but bulk entry, paste
  or file import is specified nowhere and is not the interface's to invent. This
  remains the gap most likely to matter on first use.
- **How is history depth expressed to the owner: a number of years, a start date,
  or a choice from a set?** AC-2 requires the depth to be stated and system design
  section 4.2 names the endpoint, but neither fixes its shape, and the shape
  decides between the `input` `numeric` and `select` rows in §4.
- **What happens when the owner changes history depth after data has been
  acquired?** Deeper history implies existing instruments are now short of the
  stated depth, which the coverage overview would need to express under
  STD-UI-15. Nothing in the capability or system design covers it.
- **What should happen when a run is requested while one is already in progress?**
  `run-journal` claims the oldest requested run, so a second request appears to
  queue rather than to be rejected, but no acceptance criterion states the
  behaviour and the interface must present one or the other.
- **Should the owner be able to see the configured provider request budget?** Run
  duration follows from it (system design constraint 5.14) and the owner has no
  other way to anticipate how long a run will take, but no interface exposes it
  and adding one would exceed the capability.
- **Is the first-run path a multi-step operation?** State depth, name instruments,
  start a run is a sequence across three screens rather than one operation, so
  §12.1 records STD-UI-26 as not applicable. If the designer makes it a guided
  setup, STD-UI-26 engages and its requirements apply.
- **Which screen is the landing screen?** Coverage overview answers the question
  the owner asks most often, but the first-run path starts at settings and the
  instrument list.

**Two findings recorded rather than resolved,** because they belong to artifacts
this skill may not write:

- **COMPONENT-SPEC-GAP, indeterminate progress indicator.** Described in §4.
  Resolving it is a human edit to the design system.
- **Where the conformance record belongs.** STD-UI §4 requires it in the UX
  brief; `scripts/check-capabilities.py` reads it from the capability
  specification. It is now in both, which satisfies each and duplicates the
  content. Either STD-UI §4 moves the obligation, or the checker reads the brief.
  Not this brief's to settle.
- **STD-UI-10 had no recorded validation output.** Now it does, and it does not
  pass: The rule requires a palette to
  be validated for adjacent-pair separation under colour-vision deficiency, for
  separation under normal vision, and for contrast against its surface, and
  requires the validation output to be recorded alongside the theme.
  `design-system/theme-validation.md` now records it, generated by
  `design-system/validate-theme.py`. The palette carries 16 contrast pairs below
  the WCAG 2.1 AA minimum STD-UI-24 adopts, 13 of them in the light theme. Three
  bind CAP-001 directly: `--value-missing` on `--background` at 2.53:1, which is
  the em dash STD-UI-4 requires in every uncovered coverage cell; and
  `--status-warning` and `--status-serious` on their muted grounds at 2.32:1 and
  3.68:1, which the run history renders as badges for the `partial` and
  `abandoned` outcomes. No token was changed to make them pass, because that is a
  design-language decision for the owner.

## 10. Source Documents

| Document | Path | Key Findings |
|----------|------|--------------|
| Capability CAP-001 v2 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/Capability-CAP-001.md` | 21 acceptance criteria; six user flows with explicit failure branches; owner-triggered acquisition; history depth stated rather than assumed; removal retains history; loopback-only with no authentication; up to 3000 instruments |
| System Design CAP-001 v1 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/system-design.md` | `ui_facing: true`; `owner-web-app` is a React SPA talking only to `ingestion-api`; seven JSON endpoints; eight run lifecycle states; 202-and-poll rather than server push; coverage derived not asserted; gap detection unavailable below two instruments; cooperative cancellation; abandoned-run reclaim; charting explicitly unused |
| STD-UI v2 | `docs/constitution/standards/ui-conventions.md` | The project's enforceable UX standard, 30 rules. Adopts WCAG 2.1 AA; fixes the six severity tiers and CAP-001's own run-state mapping; requires the three-state presence model, the eight-state region model, action tiering, ISO-8601 dates, virtualised lists at committed volume, and a conformance record in this brief. Cites this brief's v1 as a source artifact |
| Design system | `design-system/` and `projects/factorflow-v2/design-system.yaml` | 11 component specifications; `theme.css` tokens including the six status tiers and the missing, indeterminate and neutral-value distinctions; `component-map.json` empty with a null Figma file key; `intake.md` governing gaps; `README.md` recording the port from the first build and the one known CAP-001 gap |
| Product Charter v2 | `docs/constitution/product-charter.md` | Single owner-operator with no separation of duties; the Owner Interface is one of the product's building blocks; point-in-time history is the constraint that cannot be repaired later; M1 is Universe and Factors, 2026-Q4 |
| Tech Stack v2 | `docs/constitution/tech-stack.md` | React 18 with Vite, Tailwind, `shadcn/ui` on Radix and TradingView `lightweight-charts` (OQ-TS-6 closed 2026-09-03); Radix chosen partly for keyboard and ARIA behaviour; Biome has no `jsx-a11y` equivalent, so accessibility is enforced by review |
| EDG compliance skill | `.claude/skills/edg-compliance/SKILL.md` | Advisory beneath STD-UI per STD-UI §1.2. Four core principles and the catalogue of common agent violations this brief is checked against |
| Context cache | `cache/context_feeder/factorflow-v2/factorflow-v2/summary.md` | Refreshed 2026-09-03, and now behind: it holds CAP-001 at v1 and predates STD-UI and the design system. The repository was read directly for those |

## 11. Readiness Assessment

**Readiness Score: 93/100**

Ready for either path, and readier than v1. Six screens are derived from six user
flows and cover all 21 acceptance criteria; the seven endpoints the system design
declares each have a consumer named here, and no screen depends on an endpoint
that does not exist. Every component proposed was read from its specification,
and the one thing CAP-001 needs that the design system lacks is recorded as a
gap rather than invented.

What changed since v1 is that two of its open questions became rules rather than
answers the designer had to supply. STD-UI-24 adopted WCAG 2.1 AA, closing the
question v1 raised. STD-UI-12 fixed the severity tiers and went further than this
brief had, mapping CAP-001's own eight run states, including the two assignments
a designer would most likely get wrong: partial is never good, cancelled is never
critical. STD-UI-14 and the `badge` `coverage-unknown` variant turned v1's
argument about the third presence state into a rule with a component behind it.

What this brief adds beyond restating its sources is unchanged in kind, and now
has enforcement behind it: gap detection has three outcomes and not two; the empty
state distinguishes never-acquired from acquired-and-empty; eight run states
include four distinct kinds of not-success; cancellation is cooperative and
cannot be presented as immediate; retirement is not deletion, which now decides a
concrete component choice, `dialog` `confirm` rather than `destructive`; and the
API-not-answering case is a designed state rather than a transport error.

Ten open questions remain, three more than v1 despite four being closed, because
conformance work surfaced questions v1 could not see. Two now bear on work
outside this brief: the component-spec gap for indeterminate progress, and
STD-UI-10's missing palette validation record. Neither blocks design, and neither
is this skill's to fix. Of the rest, the time zone is the one the standard itself
says wants answering before the first screen is built, and CAP-001's run history
is that screen.

The seven points withheld are for what no brief can supply: nothing here has been
read by anyone but its author, and no user has seen the patterns it proposes.

## 12. STD-UI Conformance Record

STD-UI §4 requires a conforming capability to record four things in its UX brief:
which rules its surfaces engage, which do not apply and why, where each
applicable rule is satisfied, and each local specialization. Silence is not a
record.

**This record exists in two places, and the duplication is not an oversight.**
STD-UI §4 puts it here. `scripts/check-capabilities.py` reads it from the
capability specification, under a `### 5.4 Standards Conformance` heading and
keyed off a `conforms-to STD-UI` edge, which is where it is now mirrored. The
narrative below is the reasoned record; §5.4 of `Capability-CAP-001.md` is the
machine-checked one, and the two must agree. Which of the two locations the
standard and the tooling should settle on is an open question for the owner,
recorded in §9.

### 12.1 Rule-by-rule

| Rule | Applies | Where satisfied, or why not |
|------|---------|------------------------------|
| STD-UI-1 Product vocabulary | yes | §2 and §3 throughout. **Specialization (permitted):** CAP-001 adds *data type* for the four acquired kinds, *run outcome*, and *abandoned* as a run state. It redefines no term in the standard's list |
| STD-UI-2 Words describe behaviour | yes | §2.2 and §3: the retirement confirmation describes retirement, and takes `dialog` `confirm` rather than `destructive` |
| STD-UI-3 Comparable figures | yes | Coverage date ranges, gap counts and per-run instrument counts, in `data-table` columns using `--font-numeric` with precision fixed per column |
| STD-UI-4 Missing is not zero | yes | §2.1: an absent observation renders as an em dash, zero means a measured zero, blank means the column does not apply |
| STD-UI-5 Dates and timestamps | yes | §2.1, §2.4, §5. ISO-8601 throughout, timestamps in America/Chicago, session dates rendered unconverted |
| STD-UI-6 No abbreviation where compared | yes | Instrument counts and gap counts render in full in every table |
| STD-UI-7 One job per palette | partial | CAP-001 uses the status palette only. It renders no market direction, no magnitude and no categorical series, so the diverging, sequential and categorical palettes are unengaged here |
| STD-UI-8 Colour never the sole carrier | yes | §6 and §4: every status is a `badge` carrying a text label plus icon or shape; greyscale readability is the test |
| STD-UI-9 Colour follows the entity | no | No series and no per-entity colour. CAP-001 renders no chart and assigns no colour by identity |
| STD-UI-10 Palettes validated, not judged | no, for this capability | The rule binds the theme, which is shared and not this capability's artifact. Recorded in §9: no validation output accompanies `theme.css`, which is a gap in the design system rather than in this brief |
| STD-UI-11 Paper and live distinguishable | no | CAP-001 delivers no trading and there is no paper or live environment to state. §2.6 records that the application status region is where the obligation will land, and should be shaped to receive it |
| STD-UI-12 Status form and severity | yes | §12.2 below carries the tier table the rule's verification requires. **No specialization:** CAP-001 adds no state beyond the eight the standard already maps, and adds no tier |
| STD-UI-13 Every value carries its as-of date | yes | §2.1: last-acquired per instrument, covered range per data type, inline. Observation dates are one interaction away |
| STD-UI-14 Presence has three states | yes | §2.1: `badge` `coverage-present` / `coverage-absent` / `coverage-unknown`. The third is never rendered as the second |
| STD-UI-15 Nothing asserted beyond derived | yes | §2.1 and §5: no expected or configured coverage is displayed, only ranges rows exist for |
| STD-UI-16 No silent substitution | yes | No value is carried forward across a gap and none is interpolated. A gap renders as a gap |
| STD-UI-17 Known limitations propagate | partial | CAP-001 acquires the fundamentals that carry the restatement limitation but derives and presents no value from them, so there is nothing here to mark. The obligation engages at classification and promotion. Noted under AGT-SCOPE-005 so the limitation is recorded at acquisition rather than reconstructed later |
| STD-UI-18 A check states what it does not cover | yes | §2.1: the gap check states that a market-wide provider outage leaves no gap to detect |
| STD-UI-19 Action tiers and error actionability | yes | §3 tiers every action. §2.5 states the three parts of each error and the recovery action |
| STD-UI-20 The promotion gate | no | CAP-001 delivers no promotion. Capability §2, out of scope |
| STD-UI-21 The kill switch | no | CAP-001 has no order path. Capability §5.2 records the kill switch as an explicit non-dependency |
| STD-UI-22 Control adjacency | no | CAP-001 has no capital-at-risk control and no destructive one. Retirement is not destructive, per STD-UI-2 |
| STD-UI-23 State coverage | yes | §12.4 below enumerates all eight states per region, as the rule's verification requires |
| STD-UI-24 Programmatic semantics and feedback | yes | §6 in full |
| STD-UI-25 Polled freshness | yes | §5 records the cadence per region, 10s run progress, 30s application status, coverage on demand, and §3 requires the last-updated time on each |
| STD-UI-26 Multi-step operations | no | No single operation spans steps. The first-run path crosses three screens as separate operations. §9 records that making it a guided setup would engage this rule |
| STD-UI-27 Chart integrity | no | CAP-001 renders no chart. System design §4.3 |
| STD-UI-28 Chart provenance | no | CAP-001 renders no chart. System design §4.3 |
| STD-UI-29 Density tokens | yes | §5. **Specialization (permitted):** CAP-001 selects a density tier from the defined set and introduces no value. Which tier is open, OQ-UI-4, carried in §9 |
| STD-UI-30 Lists at committed volume | partial | §2.2, §2.5 and §3: search and filter are required and the volume is AC-4's 3000. **Flagged:** the `data-table` specification's anatomy offers pagination and does not mention virtualisation, which the rule requires. STD-UI wins over the design system per STD-UI §1.3, so the design must virtualise; the component spec does not discharge this by itself |

### 12.2 Status tier table (STD-UI-12)

The mapping is the standard's own, reproduced here because STD-UI-12's
verification requires it to appear in the capability's UX brief.

| Run state | Tier | `badge` variant | Meaning to the owner |
|-----------|------|-----------------|----------------------|
| `requested` | neutral | `status-neutral` | Recorded, not yet claimed by a runner |
| `running` | active | `status-active` | Under way; will change while watched |
| `cancelling` | warning | `status-warning` | Cancellation requested but not yet effective |
| `succeeded` | good | `status-good` | Every named instrument wrote |
| `partial` | warning, never good | `status-warning` | Completed, but some instruments have no data |
| `failed` | critical | `status-critical` | The run failed |
| `cancelled` | neutral, never critical | `status-neutral` | The owner stopped it; what was written stands |
| `abandoned` | serious | `status-serious` | The process holding the run stopped and the run was reclaimed; coverage written before it stands |

Coverage presence is governed by STD-UI-14 rather than STD-UI-12 and uses the
`badge` `coverage-present` / `coverage-absent` / `coverage-unknown` variants.

### 12.3 Actions

Tiered inline in §3. CAP-001 has four consequential actions, retiring an
instrument, stating the history depth, starting a run and cancelling a run; every
other action is routine; and it has no capital-at-risk action, because it places
no orders.

### 12.4 State coverage per region (STD-UI-23)

Eight states per data-bearing region, or a recorded reason one does not apply.

| Region | Loading | Empty, never populated | Empty, nothing found | Partial | Stale | Unavailable, check could not run | Error | Unreachable |
|--------|---------|------------------------|----------------------|---------|-------|----------------------------------|-------|-------------|
| Coverage overview | Skeleton at expected row count | No acquisition has run (AC-17), stated plainly | Filter matches no instrument, with a reset | Some instruments covered, some not | Last-updated time shown while polling | Gap detection unavailable below two instruments (STD-UI-14) | Header and toolbar kept, body replaced with the error and a retry | Designed state naming that the product is not answering (AC-16) |
| Instrument list | Skeleton | No instrument named yet | Filter matches none, with a reset | n/a: an instrument is named or it is not | Last-updated time | n/a: no check runs here | Body replaced, retry offered | As above |
| Acquisition settings | Skeleton on the depth field | History depth not yet stated, which blocks the run action | n/a: a single record | n/a | n/a: not polled | Credential presence not determinable if health is unreachable | Field-level error via `form` | As above |
| Run history | Skeleton | No run has been requested | Filter matches no run, with a reset | A run in progress is shown alongside completed ones | Last-updated time while a run is active | n/a: no check runs here | Body replaced, retry offered | As above |
| Run detail | Skeleton | n/a: a run exists or the route is invalid | Filter matches no instrument in the roster | The run's own `partial` outcome | Last-updated time while the run is active | n/a | Body replaced, retry offered | As above |
| Application status | Initial health probe pending | n/a: health always has a value | n/a | n/a | Last-updated time | Most recent run outcome not determinable if the store is unreadable | Health endpoint returned an error | The state this region exists to show (AC-16, AC-18) |
