---
artifact_schema_version: 1
artifact_id: CAP-001-ux-design
artifact_type: ux-design
artifact_version: 5
capability_id: CAP-001
title: Market Data Acquisition Foundation
created: 2026-09-05
updated: 2026-09-05
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
design_source: Generated from UX brief
approved_by: Pending review
approval_date: none
design_system: FactorFlow Design System (shadcn/ui + Radix)
theme: design-system/theme.css
ai_provenance:
  agent_id: ux-design-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-05T04:39:06Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "6"
    - id: CAP-001-ux-brief
      version: "7"
    - id: STD-UI
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# UX Design: Market Data Acquisition Foundation

**Capability:** CAP-001
**Design Source:** Generated from UX brief v6, then refined against owner decisions of 2026-09-05 resolving seven of its eight open questions. No Figma frames exist: `design-system/component-map.json` carries a null Figma file key because shadcn/ui publishes no official kit.
**Approved By:** Pending review
**Approval Date:** none
**Design System:** FactorFlow Design System (shadcn/ui + Radix), 12 component specifications
**Theme:** `design-system/theme.css`

This design was generated from the brief without a human designer or any visual
design tool. It is a best-effort automated design and should be read before it is
decomposed. Where it made a choice the brief left open, the choice and its
alternative are recorded in Section 7 rather than buried in a layout.

Two constraints shaped almost every decision below. The interface must tell the
owner the truth about what data the product holds, which is why the empty,
unavailable and partial states carry as much specification as the populated ones.
And STD-UI v4, approved 2026-09-05, is binding rather than advisory, so its rules
are cited at the point they decide something.

## 0. Application Shell

Every screen renders inside one shell, specified once here rather than repeated
per screen. The shell is a composition, not a component: `design-system/intake.md`
step 1.3 places compositions in this document rather than in the design system.

**Layout.** A fixed left navigation rail of `--space-7` width holding four
destinations, a main region, and a persistent status region pinned to the bottom
of the rail. Main region padding is `--space-5`; the gap between stacked regions
is `--space-5`; dense table regions use `--space-3` internally. No value outside
the spacing scale appears anywhere in this design (STD-UI-29).

**Navigation.** Four destinations, in this order: Coverage, Instruments, Runs,
Settings. Run detail is a child route of Runs and is not a fifth destination.
There is no top-level navigation beyond these four, no user menu, no account
area and no sign-in: AC-14 binds the interface to loopback with no
authentication, so nothing in the shell assumes a principal.

Names come from the product vocabulary STD-UI-1 fixes. Not "Jobs", not "Sync",
not "Import".

**The status region** reports two facts from `GET /api/health`, which AC-18
requires reachable without inspecting the data store: whether the product is
answering, and how the most recent acquisition run ended. It polls every 30
seconds and shows its last-updated time (STD-UI-25). It is where STD-UI-11's
trading-environment indicator will land when a capability introduces one; CAP-001
has no paper or live environment, so the region carries only these two facts
today, and it is sized to take a third line later without restructuring.

**Type.** `--text-base` is the interface default, `--text-sm` for dense table
bodies, `--text-xs` for timestamps and table metadata, `--text-xl` for screen
titles. The base is 14px because this is a desktop tool read for long stretches.

**Density.** Every table consumes `--row-height`, which currently resolves to
`--row-height-comfortable`. STD-UI-29 permits a capability to select a tier from
the defined set but not to introduce a value, and OQ-UI-4 records the current
default as a port-time placeholder. This design selects no tier and inherits,
which is the honest position until that question is answered.

## 1. Screens

### 1.1 Coverage overview

The landing screen once any data exists, and the screen that answers the question
the owner asks most often: which instruments are fit to rely on.

#### Page Layout

Screen title, then a toolbar, then one full-width table. No cards, no summary
tiles, no chart. The brief's primary information is a per-instrument judgement,
and a summary tile above the table would answer a question nobody asked while
pushing the answer below the fold.

The toolbar holds, left to right: a filter input over instrument symbol, a
lifecycle filter, and the primary action. The primary action is **Start
acquisition run**, placed here because this is the landing screen and starting a
run is the one thing the owner does that is not reading.

The table is virtualised and fills the remaining height (STD-UI-30, AC-4's 3000
instruments). Columns, left to right:

| Column | Alignment | Notes |
|--------|-----------|-------|
| Symbol | left | Row expander sits before it |
| Lifecycle | left | Active or Retired, `badge` |
| Reference | left | Presence state, `badge` |
| Prices | left | Presence state, `badge` |
| Fundamentals | left | Presence state, `badge` |
| Corporate actions | left | Presence state, `badge` |
| Covered from | right | ISO-8601, `--font-numeric` |
| Covered to | right | ISO-8601, `--font-numeric` |
| Gaps | right | Count, or the unavailable marker |
| Depth | right | Covered-from against the stated history depth |
| Last acquired | right | Timestamp with zone, `--text-xs` |

Expanding a row reveals the stable identity (CIK, composite FIGI, share class
FIGI), the per-data-type covered ranges where they differ from the row summary,
and the specific missing trading dates behind the gap count. The dates are the
evidence; the count is what the owner scans. Rows are collapsed by default,
because at 3000 instruments an expanded view is unreadable.

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Instrument coverage table | `data-table` | `expandable` | `design-system/components/data-table/design-spec.md` |
| Symbol filter | `data-table` toolbar filter | n/a | `design-system/components/data-table/design-spec.md` |
| Lifecycle filter | `select` | `inline` | `design-system/components/select/design-spec.md` |
| Data type presence | `badge` | `coverage-present`, `coverage-absent`, `coverage-unknown` | `design-system/components/badge/design-spec.md` |
| Retired marker | `badge` | `secondary` | `design-system/components/badge/design-spec.md` |
| Start acquisition run | `button` | `default` | `design-system/components/button/design-spec.md` |
| Start, when history depth is unset or no instrument is active | `button` | `blocked` | `design-system/components/button/design-spec.md` |

The filter is the table's own toolbar filter rather than a standalone `input`:
the `input` specification directs table filtering to the toolbar, and using a
bare `input` here would contradict it.

#### Interaction Flows

**Reading coverage.** No interaction required for the primary judgement. Data
type presence, covered range and gap count are visible in the collapsed row.

**Expanding a row.** `Enter` or `Space` on the expander. Focus stays on the
expander and the inserted content is announced politely, per the `data-table`
accessibility contract. Expanding does not fetch: coverage is one read.

**Filtering.** Applies server-side across the full result set, never the current
page. The `data-table` contract is explicit that sorting or filtering only the
loaded page produces a silently wrong ranking. Existing rows stay visible and
dimmed during the refresh rather than collapsing to a spinner.

**Starting a run.** With history depth set, the action posts to
`POST /api/acquisition-runs`, which returns 202 and a run id, and the interface
routes to that run's detail. It never waits on the provider.

Requesting a run while one is already active queues it: the run journal claims
the oldest requested run, so the new run appears in Runs as `requested` and
begins when the active one finishes. The Start action stays available and says
so: *A run is in progress. This will start when it finishes.* This is the owner's
decision of 2026-09-05, now stated as AC-23.

**Start has two blocked reasons, and they are not interchangeable.** With history
depth unset, the action renders as `button` `blocked` beside *History depth is
not set. Set it in Settings before acquiring.* (AC-2). With no active instrument
named, it renders `blocked` beside *No instruments are named. Add instruments
before acquiring.* (AC-24). Each names the screen that fixes it, because the two
are fixed in different places and a single generic *Cannot start* would send the
owner to the wrong one. When both hold, the depth reason is shown first, matching
the order of the API's own refusals.

The `blocked` variant stays focusable and exposes the reason through
`aria-describedby`, where a plain disabled control would hide the reason from a
keyboard or screen reader user entirely.

**Short of stated depth.** When the owner deepens history depth, instruments
already acquired are now short of it. The Depth column marks those rows *Short by
`n` years* using `badge` `status-warning`, and the next run backfills the missing
earlier range (AC-6 makes the re-run safe). Rows meeting the stated depth carry no
marker rather than a redundant confirmation. This presentation exists because
deepening is the owner's decision of 2026-09-05, stated as AC-22.

**Gap detection unavailable.** When fewer than two named instruments hold data in
the range, the Gaps column renders `coverage-unknown` carrying
`--pattern-indeterminate` and the word *Unknown*, with the reason on the row's
expansion: *Gap detection needs at least two instruments holding data in this
range.* It never renders zero. STD-UI-14 forbids the binary presentation and
STD-UI-18 requires the check to state what it does not cover, which for this
check is a market-wide provider outage: every instrument is missing that day, so
the day never enters the trading-day set. That sentence appears once, below the
table, not per row.

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton at the expected row count, per the `data-table` contract |
| Empty, never populated | *No data has been acquired yet.* with the run action beside it. AC-17 forbids an empty table that reads as healthy |
| Empty, nothing found | *No instrument matches this filter.* with a reset control |
| Partial | Ordinary rendering. Some instruments covered and some not is the normal state, not an exception |
| Stale | Last-updated time in the toolbar. Coverage does not auto-poll |
| Unavailable | Gap detection unavailable, as above. Per column, never per screen |
| Error | Header and toolbar stay rendered, body replaced by the error and a retry |
| Unreachable | The shell's unreachable state takes the screen. See Section 2 |

#### Token Usage

| Purpose | Token |
|---------|-------|
| Table separators | `--border` |
| Header text | `--muted-foreground` |
| Body text | `--foreground` on `--background` |
| Presence, present | `--status-good` on `--status-good-muted` |
| Presence, absent | `--value-missing` on `--value-missing-muted` |
| Presence, unknown | `--value-indeterminate` on `--value-indeterminate-muted`, plus `--pattern-indeterminate` |
| Retired marker | `--secondary` on `--secondary-foreground` |
| Dates and counts | `--font-numeric` |
| No observation in a cell | `--value-missing`, rendered as an em dash |
| Row height, cell padding | `--row-height`, `--cell-padding-x`, `--cell-padding-y` |
| Dense body text | `--text-sm` |

An absent observation renders an em dash, never `0` and never blank: zero means a
measured zero and blank means the column does not apply to that row (STD-UI-4).

#### Accessibility

Column and row headers are programmatically associated, because a cell's meaning
here always depends on both the instrument and the data type. Every presence
state carries its word, not only its colour and pattern, so the table is readable
in greyscale (STD-UI-8). The expander's accessible name identifies its row rather
than saying "expand". Filtering does not move focus, and the new row count is
announced politely.

### 1.2 Instruments

#### Page Layout

Screen title, toolbar, one table. The toolbar holds a symbol filter, a lifecycle
filter, a count reading *`n` active, `m` retired* against AC-4's ceiling, and the
**Add instrument** action.

Adding is a single-field inline form in the toolbar rather than a dialog: it is a
routine, reversible action, and a dialog for every symbol would be punitive at
this volume. The field accepts one symbol and submits on `Enter`.

Beside it, **Add many** opens a `textarea` `list` region below the toolbar for
bulk entry, which is how the owner reaches AC-4's volume. It accepts symbols
separated by newline, comma, tab or semicolon, parses on paste and on blur, and
reports how many were recognised and which were not before anything is added.
Rejected entries do not discard the accepted ones: at three thousand symbols, a
paste rejected wholesale over one malformed line is work the owner cannot easily
reconstruct.

Active and retired instruments are one table with a lifecycle column, not two
tables. AC-21 requires retained coverage to be visible and distinguishable rather
than omitted, and splitting them would make a retired instrument's history feel
archived when it is still live evidence.

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Instrument table | `data-table` | `expandable` | `design-system/components/data-table/design-spec.md` |
| Add instrument field | `form` + `input` | `inline` + `text` | `design-system/components/form/design-spec.md`, `design-system/components/input/design-spec.md` |
| Add many, bulk symbol entry | `textarea` | `list` | `design-system/components/textarea/design-spec.md` |
| Add action | `button` | `default` | `design-system/components/button/design-spec.md` |
| Retire action, in row | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Retire confirmation | `dialog` | `confirm` | `design-system/components/dialog/design-spec.md` |
| Lifecycle marker | `badge` | `secondary` for retired | `design-system/components/badge/design-spec.md` |
| Provider recognition | `badge` | `status-warning` when unrecognised | `design-system/components/badge/design-spec.md` |

#### Interaction Flows

**Adding.** The field validates format only. It cannot validate against the
provider, because whether Massive recognises a symbol is not known until a run
reaches it (AC-11), and a field that appeared to validate would be lying. On
submit the instrument appears as active with its data types absent and its
recognition state unknown. Duplicate of an active instrument is a field error;
duplicate of a retired one offers to reactivate rather than erroring.

**Retiring.** The row action opens `dialog` `confirm`, not `destructive`. The
`destructive` variant is specified for deleting or discarding data, and
retirement discards nothing: acquisition stops and every observation already
recorded stands. Using `destructive` would put the product's most prominent
confirmation behind a word the product does not mean, which STD-UI-2 forbids.

The confirmation reads: *Stop acquiring `SYMBOL`? Its recorded history is kept
and stays visible on the Coverage screen. You can add it again later.* Initial
focus is on cancel, per the `dialog` contract. The confirm action is labelled
**Stop acquiring**, not "Delete" and not "Remove".

When a run is under way, the dialog adds a sentence: *A run is in progress and
will still acquire `SYMBOL` this time. Retirement takes effect from the next
run.* This is AC-25's behaviour made visible at the point the owner acts,
because the alternative — saying nothing — leaves them to discover an
observation written after they retired the instrument and read it as a defect
rather than as the stated scope rule.

Retiring the last active instrument holding data in a range makes gap detection
unavailable. The dialog says so when it applies, because the consequence is not
otherwise visible from this screen.

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton |
| Empty, never populated | *No instruments named yet.* with the add field focused |
| Empty, nothing found | *No instrument matches this filter.* with a reset |
| Partial | Not applicable: an instrument is named or it is not. Recorded rather than left silent |
| Stale | Last-updated time |
| Unavailable | Not applicable: no check runs on this screen |
| Error | Body replaced, retry offered, add field preserved with its value |
| Unreachable | Shell state |

#### Token Usage

Table tokens as in 1.1. Retired rows use `--muted-foreground` for the symbol and
`--secondary` for the lifecycle badge. The unrecognised-instrument badge uses
`--status-warning` on `--status-warning-muted`. The add field's boundary uses
`--input`, which meets 3:1 against the surface.

#### Accessibility

The add field's accessible name states what is being added, not just "Symbol".
The retire action's accessible name identifies its row: *Stop acquiring AAPL*,
never a bare "Stop acquiring" repeated 3000 times. Dialog focus is trapped and
returns to the triggering row action on close.

### 1.3 Settings

#### Page Layout

A single narrow column capped at `--measure-prose`, not a full-width table
screen. Two regions stacked with `--space-5` between them: **History depth**,
then **Provider credential**.

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| History depth form | `form` | `stacked` | `design-system/components/form/design-spec.md` |
| History depth value | `input` | `numeric` | `design-system/components/input/design-spec.md` |
| Save action | `button` | `default` | `design-system/components/button/design-spec.md` |
| Credential status | `badge` | `status-good` or `status-critical` | `design-system/components/badge/design-spec.md` |
| Credential region | `card` | `summary` | `design-system/components/card/design-spec.md` |

#### Interaction Flows

**Stating history depth.** A numeric field in years with a non-editable *years*
suffix, submitting to `PUT /api/settings/history-depth`. Validation runs on blur,
not per keystroke. Until it is set, the field carries the description *Required
before the first acquisition run*, and every Start action across the interface
renders `blocked` with that reason.

Years rather than a start date is a design decision, recorded in Section 7 with
its alternative, because the two differ in meaning and not only in shape.

**Credential.** Read-only, and there is no field for it anywhere in this design.
AC-13 requires the credential to be supplied from the environment and to appear
in no view the product renders, so it is not masked, not truncated and not shown
as a last-four. The region states presence only: *Provider credential supplied*
or *Provider credential missing*. When missing, it names the environment variable
and never its value, matching what the process itself reports at start.

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton on the depth field |
| Empty, never populated | History depth not yet set, which blocks every run action |
| Empty, nothing found | Not applicable: a single record |
| Partial | Not applicable |
| Stale | Not applicable: this screen does not poll |
| Unavailable | Credential presence not determinable when health is unreachable, rendered as `coverage-unknown`, never as missing |
| Error | Field-level error through `form`, values preserved |
| Unreachable | Shell state |

#### Token Usage

`--card` and `--card-foreground` for the credential region, `--border` for its
boundary, `--input` for the field boundary at 3:1, `--muted-foreground` for
descriptions, `--status-good` or `--status-critical` on their muted grounds for
credential presence, `--text-base` throughout.

#### Accessibility

The suffix is part of the field's accessible name, so a screen reader announces
years rather than a bare number. Error text meets 4.5:1 and is referenced by
`aria-describedby` with `aria-invalid` on the control. The credential status is a
text statement, never a colour alone.

### 1.4 Runs

#### Page Layout

Screen title, toolbar with an outcome filter, one table in reverse chronological
order. A run in progress pins to the top and is visibly distinct, because it is
the only row whose state changes while the owner is looking at it.

Columns: Outcome, Requested, Started, Ended, Instruments written, Instruments
failed. Timestamps carry their zone. Counts are right-aligned in
`--font-numeric` with precision fixed per column.

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Run table | `data-table` | `history` | `design-system/components/data-table/design-spec.md` |
| Run id, opening run detail | link in the first column | n/a | `design-system/components/button/design-spec.md`, which directs navigation to a link |
| Run outcome | `badge` | the six `status-*` variants, mapped below | `design-system/components/badge/design-spec.md` |
| Outcome filter | `select` | `inline` | `design-system/components/select/design-spec.md` |
| Start acquisition run | `button` | `default` or `blocked` | `design-system/components/button/design-spec.md` |

The `history` variant fits immutable past records and forbids row selection and
row actions. It also defines no row target: the `data-table` contract makes row
click conditional on one, so this design does not use it. Run detail opens from a
link on the run id in the first column, which is what the `button` specification
directs for navigation so that middle-click and open-in-new-tab work. No variant
change is needed.

#### Interaction Flows

**Watching a run.** The table polls every 10 seconds while any run is in a
non-terminal state, and stops polling when none is. The toolbar shows the
last-updated time (STD-UI-25). Polling is cheap here because it reads the run
journal rather than deriving coverage.

**Opening a run.** The run id in the first column is a link to run detail. `Enter` on the focused link follows it, and middle-click opens it in a new tab.

**Outcome vocabulary.** Eight states, six severity tiers, mapped by STD-UI-12 and
reproduced in Section 5. Two assignments carry the capability's honesty
requirements and are not negotiable in implementation: `partial` is **warning,
never good**, because a run that brought in less than it should have is not a
success (AC-9); and `cancelled` is **neutral, never critical**, because a run the
owner deliberately stopped is not a fault (AC-19).

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton |
| Empty, never populated | *No acquisition run has been requested yet.* |
| Empty, nothing found | *No run matches this filter.* with a reset |
| Partial | A run in progress shown alongside completed runs |
| Stale | Last-updated time, while polling |
| Unavailable | Not applicable: no check runs on this screen |
| Error | Body replaced, retry offered |
| Unreachable | Shell state |

#### Token Usage

The six tier pairs, `--status-<tier>` on `--status-<tier>-muted`. Timestamps in
`--text-xs` and `--font-numeric`. Table tokens as in 1.1.

#### Accessibility

Each outcome badge carries its word and an icon, never colour alone: five of the
eight states are not success and a colour scheme cannot separate them, and the
`partial` against `succeeded` distinction is exactly the one AC-9 protects. The
polled region announces politely and never steals focus.

### 1.5 Run detail

#### Page Layout

A summary region, then a full-height instrument table. The summary is a `card`
`summary` holding the run's outcome, its timestamps, its counts, and the
**Cancel run** action when the run is in a non-terminal state.

The instrument table is one row per instrument, collapsed, expanding to the four
data types. A run may cover 3000 instruments, so four rows per instrument
expanded by default is unreadable; the `expandable` variant exists for this and
cites STD-UI-30.

Failures sort above successes by default, and the toolbar carries a filter for
outcome. The owner opens this screen because something went wrong.

#### Component Mapping

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Run summary | `card` | `summary` | `design-system/components/card/design-spec.md` |
| Run outcome | `badge` | the six `status-*` variants | `design-system/components/badge/design-spec.md` |
| Instrument roster | `data-table` | `expandable` | `design-system/components/data-table/design-spec.md` |
| Per-data-type outcome | `badge` | `status-good`, `status-warning`, `status-critical` | `design-system/components/badge/design-spec.md` |
| Cancel run | `button` | `secondary` | `design-system/components/button/design-spec.md` |
| Cancel confirmation | `dialog` | `confirm` | `design-system/components/dialog/design-spec.md` |
| Run finished elsewhere | `toast` | `success`, `warning` or `error` by outcome | `design-system/components/toast/design-spec.md` |
| Progress while running | COMPONENT-SPEC-GAP, the one remaining | see Section 3 | none |

#### Interaction Flows

**Cancelling a running run.** The action opens `dialog` `confirm`, not
`destructive`: nothing is discarded. The confirmation states what cancellation
actually does, because STD-UI-2 requires words to describe real behaviour and
cancellation here is cooperative: *Stop this run? Instruments already acquired
keep their coverage. Instruments not yet started will be skipped. The run stops
after the instrument it is working on now.*

On confirm the run enters `cancelling`, tiered **warning**, "requested but not
effective". That state persists for up to one instrument's work. The interface
must not present cancellation as immediate, and the Cancel action becomes
unavailable rather than remaining clickable.

**Cancelling a queued run** (AC-26). A run still `requested` has not started, so
the copy above would be false: there is no instrument it is working on now, and
nothing has been acquired to keep. The confirmation instead reads *Cancel this
queued run? It has not started, so nothing has been acquired. The run in
progress is not affected.* The last sentence is there because the owner is
cancelling one of two visible runs and the destructive-looking action sits
beside an active one.

On confirm the run goes straight to `cancelled` — terminal, tiered neutral, with
no `cancelling` intermediate and no started time on the run detail. This is the
one cancellation the interface may present as immediate, because it is: the
runner never claims the run rather than being asked to stop.

**The run finished first.** AC-19's edge: if the run reached a terminal state
before the request was observed, the interface says *This run had already
completed.* and shows the outcome. It never shows a cancellation that did not
happen.

**Reading a failure.** Expanding an instrument shows the four data types, each
with its outcome and, where it failed, the reason reported. Every error states
its three STD-UI-19 parts: the operation (acquiring daily prices), the resource
(the named instrument), and the reason (as the provider or client reported it).
The recovery action is a re-run, which AC-6 makes safe, and the screen says so.

**An unrecognised instrument** is reported and distinguished from other failures,
because it is a data problem the owner fixes rather than a run failure, and AC-11
requires the run to have continued.

**An abandoned run** carries an explanation rather than a bare state, tiered
`serious`, "recoverable, and requires explanation to be understood": *The process
running this acquisition stopped before it finished, and the run was reclaimed.
Coverage written before it stopped is kept. Start a new run to continue.* Without
that sentence the state reads as a product defect rather than as the recovery
path it is.

**Progress.** While the run is active the summary shows instruments completed
against instruments named, polled every 10 seconds with a last-updated time. It
shows no estimated time remaining: no duration target exists for a run, so any
estimate would be invented.

#### States

| State | Rendering |
|-------|-----------|
| Loading | Skeleton on the summary and the roster |
| Empty, never populated | Not applicable: a run exists or the route is invalid |
| Empty, nothing found | *No instrument in this run matches this filter.* with a reset |
| Partial | The run's own `partial` outcome, tiered warning |
| Stale | Last-updated time while the run is active |
| Unavailable | Not applicable |
| Error | Body replaced, summary retained, retry offered |
| Unreachable | Shell state |

#### Token Usage

`--card` for the summary, the six tier pairs for outcomes, `--font-numeric` for
counts and timestamps, `--text-xs` for timestamps, table tokens as in 1.1.

The `toast` mapping is specified against `--status-good`, `--status-warning` and
`--status-critical`, which its own specification now names after the correction
recorded in Section 3.

#### Accessibility

The cancel dialog is `role="dialog"` with focus trapped and returned to the
trigger. Per-data-type outcomes carry text, not icons alone. The progress region
announces politely at each poll rather than replacing silently. The roster's
column and row headers are programmatically associated.

## 2. Cross-Screen Navigation

Four destinations in the rail, one child route, and three flows that cross them.

**First run.** With no history depth set, the shell routes to Settings rather
than Coverage, because Coverage would otherwise present an empty state whose only
resolution is elsewhere. Settings states the depth, the owner moves to
Instruments to name symbols, and the Start action is available from either
Coverage or Runs once both preconditions hold. This is a sequence across three
screens rather than a wizard: no single operation spans steps, so STD-UI-26 does
not engage. Section 7 records that making it a guided setup would engage it.

**Diagnosing a failure.** The status region reports the most recent run's outcome
from any screen. It links to that run's detail directly, which is the path
flow "Diagnose and recover" step 2 describes, without passing through the Runs
list.

**Starting and watching.** Starting a run from Coverage or Runs routes to that
run's detail, because a 202 gives a run id and the detail screen is where
progress lives. A run that completes while the owner is elsewhere raises a
`toast`; a run that completes while the owner is on its detail screen does not,
since the `toast` specification forbids announcing a result already visible.

**Unreachable.** When `GET /api/health` does not answer, the shell replaces the
main region on every route with a designed state: *FactorFlow is not answering.
The application container may have stopped, or a database migration may have
failed and prevented it from starting. Check the container logs.* This is AC-16's
case, where the product deliberately refuses to run rather than serving an
inconsistent store, and STD-UI-23 requires it to be designed rather than surfaced
as a transport error. The navigation rail stays rendered so the owner is not
stranded.

## 3. Component-Spec Gaps

| UI Element | Source Reference | Suggested Slug | Intake Reference |
|------------|-----------------|----------------|------------------|
| Indeterminate progress indicator, for an acquisition run whose duration cannot be estimated | UX brief v6 §4; `design-system/README.md` records this as the one known gap for CAP-001 | `progress` | `design-system/intake.md` |

**The progress indicator** is genuinely new rather than a variant, and
`README.md` says why it was deliberately not written: `intake.md` step 2.3
requires its interaction and accessibility contracts to be derived from the
upstream Radix documentation rather than from memory. Run detail specifies the
region and its polling behaviour above; only the indicator itself is missing.

**Two gaps this design raised have since been closed**, on the owner's decisions
of 2026-09-05, and are recorded here because the design is the artifact that
surfaced them.

*Multi-line entry* was added to the design system as `textarea` at `status: beta`,
with a `list` variant carrying bulk paste. AC-4 commits to runs of up to 3000
instruments and AC-1 forbids editing configuration files to name them, and the
component set had no multi-line entry, so this design could originally only
specify adding symbols one at a time. Section 1.2 now specifies bulk entry
against the new spec.

*The `toast` specification's stale tokens* named `--success`, `--warning` and
`--info`, none of which exists in `theme.css`: the port replaced three status
tokens with the six severity tiers STD-UI-12 requires and missed this spec. It
was the only one of the eleven carrying unresolved references, found by checking
every spec against the theme. Its Tokens Used now names `--status-good`,
`--status-critical`, `--status-warning` and `--status-neutral`, and all twelve
specs resolve.

## 4. EDG Compliance

| Check | Status | Notes |
|-------|--------|-------|
| Consistency with product patterns | pass | This is the product's first interface, so the patterns are established here rather than matched. They are established from governed sources rather than taste: STD-UI-1 fixes the vocabulary the navigation and every label use, STD-UI-12 fixes the outcome tiers, and the eleven component specifications fix the interaction contracts. Nothing in this design invents a pattern the standard or the design system already settles |
| Progressive disclosure | pass | Coverage answers its primary question in the collapsed row, with ranges, identifiers and specific gap dates behind expansion. Run detail collapses 3000 instruments to one row each and expands to four data types. Settings is two regions, not a preferences surface |
| Error clarity | pass | Every error states the operation, the resource and the reason, per STD-UI-19, and names its recovery where one exists. The abandoned-run and cancellation-raced cases carry written explanations rather than bare states. The unreachable state names the likely cause and where to look, instead of surfacing a transport failure |
| Accessibility | pass | WCAG 2.1 AA per STD-UI-24, specified per screen rather than deferred to the components. Every status carries text plus icon, so each screen is readable in greyscale. The `button` `blocked` variant is used precisely because a disabled control hides its reason from keyboard and screen-reader users. Enforcement remains human review, which the standard acknowledges |
| States and feedback (empty, loading, error, success, partial) | pass | All five, plus the three more STD-UI-23 requires, enumerated per screen with inapplicable ones recorded and reasoned rather than omitted. Never-populated and nothing-found are distinct everywhere they can both occur |

## 5. Traceability

| AC ID | Capability AC | UX Design Element | Component + Variant |
|-------|---------------|-------------------|-------------------------|
| AC-1 | Named instrument list | 1.2 add field, Add many bulk entry, retire action, instrument table | `form` `inline` + `input` `text`; `textarea` `list`; `data-table` `expandable` |
| AC-2 | History depth stated, not assumed | 1.3 history depth; blocked Start actions in 1.1 and 1.4 | `form` `stacked` + `input` `numeric`; `button` `blocked` |
| AC-3 | Data types acquired | 1.1 four presence columns | `badge` `coverage-present` / `coverage-absent` / `coverage-unknown` |
| AC-4 | Acquisition volume, up to 3000 | 1.1, 1.2, 1.5 virtualised tables with search and filter; 1.2 bulk entry, which is what makes the volume reachable | `data-table` `expandable`, `history`; `textarea` `list` |
| AC-5 | Point-in-time record | 1.1 covered ranges and last-acquired, derived from written rows | `data-table` `expandable` |
| AC-6 | Re-run safety | 1.5 re-run named as the recovery action on a failure | `button` `default` |
| AC-7 | Coverage visibility | 1.1 the whole screen | `data-table` `expandable` + `badge` |
| AC-8 | Gap visibility | 1.1 Gaps column, expansion to specific dates, unavailable state | `badge` `coverage-unknown` |
| AC-9 | Honest run outcome | 1.4 outcome column; the tier mapping below | `badge` six `status-*` variants |
| AC-10 | Failure diagnosis | 1.5 per-instrument, per-data-type reasons | `data-table` `expandable` + `badge` |
| AC-11 | Unrecognised instrument does not stop the run | 1.5 distinguished from other failures; 1.2 recognition badge | `badge` `status-warning` |
| AC-12 | A failed run leaves no false history | 1.1 coverage derived from written rows only; no intended coverage rendered | `data-table` `expandable` |
| AC-13 | Credential handling | 1.3 presence only, no field anywhere in the design | `card` `summary` + `badge` |
| AC-14 | Network exposure | Section 0: no sign-in, no user menu, no account area | shell composition |
| AC-15 | Forward data evolution | Section 2 unreachable state, which is what a migration failure surfaces as | shell composition |
| AC-16 | Refuse an inconsistent start | Section 2 unreachable state naming the migration cause | shell composition |
| AC-17 | Honest empty state | 1.1 never-populated state, distinct from nothing-found | `data-table` `expandable` empty state |
| AC-18 | Operational visibility | Section 0 status region, on every screen, polled at 30s | `badge` + shell composition |
| AC-19 | Cancel a run in progress | 1.5 cancel action, `cancelling` state, the already-completed edge | `button` `secondary` + `dialog` `confirm` |
| AC-20 | An interrupted run does not block the next one | 1.5 abandoned-run explanation and the new-run path | `badge` `status-serious` |
| AC-21 | Removal retains history | 1.2 retire wording and `confirm` variant; 1.1 retired rows retained and marked | `dialog` `confirm` + `badge` `secondary` |
| AC-22 | Deepening history depth backfills | 1.1 Depth column, *Short by `n` years* presentation | `badge` `status-warning` |
| AC-23 | Concurrent run requests queue | 1.1 Start action queued state, *A run is in progress* message | `button` `default` |
| AC-24 | A run with nothing to acquire is refused | 1.1 Start rendered `blocked` with the reason *No instruments are named. Add instruments before acquiring.*, mirroring the depth-not-set treatment | `button` `blocked` |
| AC-25 | Retiring takes effect from the next run | 1.2 retire confirmation states that a run in progress still finishes with the instrument included | `dialog` `confirm` |
| AC-26 | A queued run can be cancelled before it starts | 1.5 cancel on a queued run, its distinct confirmation copy, and the immediate `cancelled` state with no started time | `button` `secondary` + `dialog` `confirm` |

**Run outcome tier mapping**, reproduced from STD-UI-12 because this design is
where it is rendered:

| Run state | Tier | `badge` variant |
|-----------|------|-----------------|
| `requested` | neutral | `status-neutral` |
| `running` | active | `status-active` |
| `cancelling` | warning | `status-warning` |
| `succeeded` | good | `status-good` |
| `partial` | warning, never good | `status-warning` |
| `failed` | critical | `status-critical` |
| `cancelled` | neutral, never critical | `status-neutral` |
| `abandoned` | serious | `status-serious` |

## 6. Source Mapping

| Source | Reference | Verification Method | Date |
|--------|-----------|---------------------|------|
| UX brief v6 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-brief.md` | Text reference. Six screens, information architecture, interactions and conformance record read in full | 2026-09-05 |
| Capability CAP-001 v7 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/Capability-CAP-001.md` | Text reference. All 26 acceptance criteria traced in Section 5 | 2026-09-05 |
| System design v3 | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/system-design.md` | Text reference. Endpoints, run lifecycle, 202-and-poll, derived coverage, gap unavailability | 2026-09-05 |
| STD-UI v4 | `docs/constitution/standards/ui-conventions.md` | Text reference. Approved 2026-09-05; all 30 rules read, those governing this design cited inline | 2026-09-05 |
| Component specifications | `design-system/components/` | Text reference. All 12 read; 10 used, 2 unused with reasons; token references checked mechanically against the theme, which found and closed one defect | 2026-09-05 |
| Theme tokens | `design-system/theme.css` | Text reference. Every token named in this design verified to exist | 2026-09-05 |
| Component map | `design-system/component-map.json` | Text reference. Null Figma file key and empty component map, so no frame references exist to cite | 2026-09-05 |

No Figma frame, image or diagram was used. This is the Path B automated design.

## 7. Open Questions

The eight questions this design opened were worked through with the owner on
2026-09-05. Seven are settled and are recorded here with their decision, because
a question that was answered is more useful than one silently deleted. Two things
remain genuinely open, and they are listed last.

### Settled

- **History depth is a number of years.** Chosen over an absolute start date. The
  two differ in meaning, not only in shape: years re-evaluates on every run, so
  five years in 2027 reaches further back in absolute terms than the same setting
  did in 2026. Years fits how the provider bounds history, by plan tier rather
  than by calendar, and the design system has no date input, so a date would have
  opened a third component gap. Specified in 1.3.
- **Bulk instrument entry is designed, and the component now exists.** `textarea`
  was added to the design system at `status: beta` with a `list` variant, and 1.2
  specifies an *Add many* region accepting newline, comma, tab or semicolon
  separated symbols, reporting what was recognised before anything is added.
  Rejected entries never discard accepted ones.
- **Deepening history depth backfills on the next run.** Instruments already
  acquired are marked short of the stated depth in the Coverage Depth column, and
  the next run acquires the missing earlier range, which AC-6 makes safe.
  Specified in 1.1.
- **A run requested while one is active queues.** The run journal claims the
  oldest requested run, so the new run appears as `requested` and begins when the
  active one finishes. The Start action stays available and says so. Specified in
  1.1.
- **`data-table` `history` needs no variant change.** The variant defines no row
  target, and the `data-table` contract makes row click conditional on one, so
  this design does not use it. Run detail opens from a link on the run id, which
  is what the `button` specification directs for navigation, so middle-click and
  open-in-new-tab work. Specified in 1.4.
- **The `toast` specification's stale tokens are corrected.** See Section 3. All
  twelve component specifications now resolve against the theme.
- **The first-run path stays three screens rather than a wizard.** It is three
  separate operations, so STD-UI-26 does not engage. Making it a wizard would
  bring step indication, retreat without data loss, and the rest of that rule's
  contract, for a path the owner walks once. Recorded rather than left open, and
  reversible: if it becomes a guided setup, STD-UI-26 applies and its
  requirements come with it.

### Resolved specification escalation

The deepening-backfill and queued-concurrent-request decisions are now stated as
CAP-001 AC-22 and AC-23. AC-23's `POST /api/acquisition-runs` contract is
defined in the system design, including the `requested` state, FIFO order and
the one-active-run constraint. This document remains limited to presenting
those requirements, per AGT-SPEC-001 and AGT-AUTH-003.

### Still open

- **One component-spec gap remains:** the indeterminate progress indicator for a
  run whose duration cannot be estimated. Section 3 carries it. The region and its
  polling are specified in 1.5; only the indicator is missing.
- **Should the owner see the configured provider request budget?** Run duration
  follows from it and the owner has no other way to anticipate how long a run
  will take, but no endpoint exposes it and adding one exceeds this capability.
  Recorded for whichever capability next takes up ingestion operations rather
  than carried as a question this design can answer.

This design was generated without any human designer or visual design tool. It
should be reviewed before decomposition.
