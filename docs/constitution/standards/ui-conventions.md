---
artifact_schema_version: 1
artifact_id: STD-UI
artifact_type: constitution-artifact
artifact_version: 3
id: STD-UI
title: Owner Interface Conventions
kind: standard
status: draft
created: 2026-09-05
updated: 2026-09-05
owner: Alvaro de Jodra
owner_github: ajodraca
owning_capability: none
applies_to: every capability that delivers or modifies an owner-facing interface surface
ai_provenance:
  agent_id: constitution-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude (Cowork)
  tool_version: unknown
  timestamp: 2026-09-05T03:40:00Z
  source_artifacts:
    - id: product-charter
      version: "2"
    - id: tech-stack
      version: "2"
    - id: CAP-001-ux-brief
      version: "1"
    - id: edg-compliance
      version: "1.0"
    - id: factorflow-design-system
      version: "ported from the first build, 2026-09-05"
  invoking_user: ajodraca
  correlation_id: 6493d4a3-41a0-4991-9e37-c372f762c3d0
---

# Owner Interface Conventions

## 1. Purpose and Standing

FactorFlow-v2 has no interface yet. `CAP-001-ux-brief` v1 records that no design
system is configured for the project and that the patterns CAP-001 settles —
status vocabulary, empty and failure states, table shape — are inherited by every
capability from M2 through M6. Before this standard, those patterns had no
governed home: each UX brief would have re-derived them, and divergence between
capabilities would have been discovered at review rather than prevented.

This standard gives them one home. It states what an owner-facing surface must
do, rule by rule, so a reviewer can check a capability against it rather than
against taste.

### 1.1 Authority where this and a capability disagree

**This standard wins**, with one exception: a capability whose acceptance
criterion is *stricter* than a rule here conforms by satisfying its own
criterion. A capability may never be looser. Where a capability needs to be
looser, the fix is an amendment to the rule, not a local exception.

Each rule below names its own authority. Rules citing the product charter or
`tech-stack.md` **restate an existing obligation** in interface terms. Rules
citing "internal policy" **create a new obligation** that no other artifact
carries, and are the ones to scrutinise: they exist because the product's
interface has to decide something no upstream artifact decided.

### 1.2 Standing relative to the `edg-compliance` skill

The `edg-compliance` skill is scaffold-wide advisory expertise, derived from the
ISG Storage Experience Design Guide, and states of itself that the enforceable
EDG constitution is in progress. **For factorflow-v2, this standard is that
constitution.**

The division is by layer, not by precedence contest:

- **This standard is normative** — what a capability must comply with, and what
  a reviewer checks.
- **`edg-compliance` remains advisory** — how to comply, and its catalogue of
  common agent violations, which stays useful and is not superseded.

Where both speak, this standard governs. Where this standard is silent,
`edg-compliance` advises. Three EDG positions are **deliberately departed from**,
each at the rule that departs: STD-UI-12 (severity vocabulary), STD-UI-21 (the
kill switch takes no confirmation), and the screen-reader scope exclusion in §2.3.
A reviewer finding one of those is looking at an intended departure, not a defect.

Nothing here changes the `edg-compliance` skill, which is shared across projects
and referenced by five other scaffold skills.

### 1.3 What a reader must not conclude

- **That this is a design system.** It contains no component specifications, no
  token values, no theme. The design system is a separate artifact, configured at
  `projects/factorflow-v2/design-system.yaml` and held in `design-system/` in this
  repository since 2026-09-05. **This standard states the obligations; that
  artifact satisfies them.** Where the two disagree, this standard wins and the
  design system is corrected: a token is never the reason a rule bends.
- **That approving it settles the open interface questions.** Four remain, listed
  in §5.3.
- **That a rule's absence is permission.** Silence means `edg-compliance` advises
  and the capability decides, recording the decision in its UX brief.

## 2. Scope

### 2.1 Governed

Every user-facing surface of `owner-web-app`, in every capability, for the life
of the product. A capability that renders anything the owner reads is in scope.

### 2.2 Not governed

- **Component and charting library selection.** Settled by `tech-stack.md` v2,
  OQ-TS-6 closed 2026-09-03: `shadcn/ui` on Radix primitives, TradingView
  `lightweight-charts`.
- **Per-capability screen inventory, information architecture and
  acceptance-criteria tracing.** These belong to each capability's UX brief.
- **Token values, component specifications and theme.** These belong to a design
  system configured at `projects/factorflow-v2/design-system.yaml`. STD-UI-29
  obliges the tokens to exist and be consumed; it does not set them.
- **Visual brand.** The product has none and needs none: charter §2 gives it one
  owner-operator and no audience.

### 2.3 Explicit exemptions from otherwise-applicable guidance

Recorded as scope conditions so that a reviewer does not raise them as findings.

| Exempted | Source | Why it does not apply here |
|----------|--------|---------------------------|
| Consistency across a product family; shared navigation hierarchy across products | `edg-compliance` principle 1 | FactorFlow is a single product with no family. Its vocabulary examples — volumes, pools, hosts, snapshots — are another domain's |
| "No new top-level navigation items without EDG review" | `edg-compliance` checklist | There is no EDG review body for this project, and no existing hierarchy to place a feature within. STD-UI-1 carries the part that does apply |
| Documented, consistent error codes | `edg-compliance` principle 3 | Charter §2 gives the product one owner-operator and no support channel. An error code exists so a user can quote it to someone else. STD-UI-19 carries the actionability obligation instead |
| Screen-reader compatibility as a release gate | `edg-compliance` principle 4 | Charter §2 and CAP-001 system design constraint 5.11: one owner-operator, loopback-bound, no authentication and no second user. **The semantics remain mandatory under STD-UI-24** — what is exempt is certification as a gate, not the markup |

## 3. Normative Rules

### 3.1 Language and vocabulary

### STD-UI-1 — Product vocabulary

**Rule:** User-visible text MUST use the product's domain vocabulary. It MUST NOT
substitute generic terms — job, sync, import, task, item, object, entity, record,
delete — for a named product concept. It MUST NOT surface implementation
vocabulary (null, undefined, exception, timeout, 500).

The vocabulary is: instrument, universe, acquisition run, coverage, observation,
history depth, trading day, gap, retired, factor, classification, strategy,
promotion, paper, live, kill switch.

**Authority:** Charter §1–§3, which names each of these; `edg-compliance`
terminology principle.
**Verification:** Reviewer reads every user-visible string in the capability's UX
brief and implementation against this list.
**Specialization:** permitted — a capability MAY add a term its domain
introduces, recording it in its UX brief. It MAY NOT redefine a term above.

### STD-UI-2 — Words must describe actual behaviour

**Rule:** Labels, confirmations and messages MUST describe what the product
actually does. They MUST NOT describe behaviour the product does not have.

**Authority:** CAP-001 AC-21 and system design constraint 5.8 — removal is
retirement, and acquisition stops while every recorded observation stands.
Wording it as deletion describes a capability the product does not have.
**Verification:** Each action's label and confirmation text is read against the
behaviour its acceptance criterion defines.
**Specialization:** none.

### 3.2 Quantities and time

### STD-UI-3 — Comparable figures

**Rule:** Numeric values that can be compared within a column MUST render in
tabular figures, MUST be right- and decimal-aligned, MUST use a precision fixed
per column rather than per value, and MUST carry an explicit sign where the
quantity is signed.

**Authority:** Internal policy. Charter §2 makes reviewing factor evidence the
owner's primary activity, and factor evidence is read by scanning columns.
**Verification:** A screenshot of any table containing a numeric column.
**Specialization:** none.

### STD-UI-4 — Missing is not zero

**Rule:** A value for which no observation exists MUST render as an explicit
missing marker, distinct from both zero and blank. Zero MUST represent only a
measured zero. Blank MUST represent only inapplicability.

**Authority:** Charter §3, point-in-time persistence; CAP-001 AC-17, which
forbids an empty state that reads as a healthy one.
**Verification:** Reviewer confirms all three renderings are distinguishable for
every numeric field in the capability.
**Specialization:** none.

### STD-UI-5 — Dates and timestamps

**Rule:** Dates MUST render in ISO-8601 (`YYYY-MM-DD`) and MUST NOT be
locale-formatted. Timestamps MUST carry a visible time zone. The product MUST
display one zone throughout, and that zone is **America/Chicago**, which is also
the zone in which `observed_on` is computed. A timestamp MUST NOT be rendered in
the viewing machine's local zone.

A market session date is not a timestamp and MUST NOT be converted. A daily bar,
a corporate action and an as-of date carry the exchange session date as a
calendar date; converting one between zones moves it onto the wrong day, which
is the error this rule exists to prevent rather than an application of it.

**Authority:** Charter §3 — factor and universe history is point-in-time, so the
date a value was known is load-bearing evidence rather than metadata. The zone is
the owner's decision of 2026-09-05, closing OQ-UI-3.
**Verification:** Any rendered date or timestamp. A run whose timestamp falls
between 23:00 and 24:00 America/Chicago stamps the calendar day the display
shows.
**Specialization:** none.

### STD-UI-6 — No abbreviation where values are compared

**Rule:** Magnitudes MUST NOT be abbreviated in any table or list where values
are compared against one another. Abbreviation is permitted only where a single
value stands alone.

**Authority:** Internal policy.
**Verification:** Table and list screenshots.
**Specialization:** none.

### 3.3 Colour and status

### STD-UI-7 — One job per palette

**Rule:** Colour MUST serve exactly one of four jobs, and no palette MUST serve
two: **categorical** (identity), **sequential** (magnitude, one hue light to
dark), **diverging** (polarity, two hues with a neutral midpoint), **status**
(state). Red and green MUST be reserved for status. Market direction MUST use a
diverging pair that is not red and green.

**Authority:** Internal policy, and the owner's standing decision. The first
FactorFlow build placed gain and loss on teal and amber for this reason —
"red-green colour vision deficiency affects roughly 1 in 12 men, and gain/loss is
the most repeated signal in the product" (`design-system/README.md`) — and its
theme reserved red for `--destructive`. That decision was re-derived here
independently before the earlier build was consulted, and the two agree. The
supporting argument stands on its own: the product shows market direction and
system state on the same screens, red/green cannot mean both, and status has the
stronger claim because STD-UI-12 requires five outcomes that are not success to
be separable, where a misread failure is the costlier error.
**Verification:** The theme's token map, read against the four jobs. No token
outside the status palette resolves to a red or green hue.
**Specialization:** none. The assignment is the rule; inverting it is an
amendment to this rule, not a capability's choice.

### STD-UI-8 — Colour is never the sole carrier

**Rule:** State, identity and direction MUST each carry a non-colour encoding: a
text label plus an icon or shape for state, a legend entry for series identity,
an explicit sign for direction.

**Authority:** `edg-compliance` principle 4; WCAG 2.1 AA 1.4.1.
**Verification:** A greyscale rendering of the surface remains fully readable.
**Specialization:** none.

### STD-UI-9 — Colour follows the entity

**Rule:** A series colour MUST be assigned by entity and MUST NOT be assigned by
rank or position. Changing a filter MUST NOT repaint the entities that remain.

**Authority:** Internal policy.
**Verification:** Apply a filter that removes a series; the survivors keep their
colours.
**Specialization:** none.

### STD-UI-10 — Palettes are validated, not judged

**Rule:** Before use, a palette MUST be validated for adjacent-pair separation
under colour-vision deficiency, separation under normal vision, and contrast
against its surface. The validation output MUST be recorded.

**Authority:** `edg-compliance` principle 4; WCAG 2.1 AA 1.4.3.
**Verification:** The recorded validation output accompanies the theme.
**Specialization:** stricter-only.

### STD-UI-11 — Paper and live are always distinguishable

**Rule:** The interface MUST state the active environment in words, in a
persistent region present on every screen, which MUST NOT be dismissible and MUST
NOT scroll out of view. The distinction MUST NOT rest on hue alone.

**Authority:** `tech-stack.md` v2 — the interface must never be styled
identically for paper and live; charter §3, the paper-to-live gate.
**Verification:** Every screenshot of every screen shows the environment.
**Specialization:** stricter-only.

### STD-UI-12 — Status form and severity

**Rule:** Every status MUST carry a text label and an icon or shape, and MUST map
to exactly one severity tier. An outcome the owner intended MUST NOT be styled as
a fault. A degraded outcome MUST NOT be styled as a clean one.

The tiers, and their mapping to the three levels `edg-compliance` names:

| Tier | EDG level | Meaning |
|------|-----------|---------|
| `neutral` | info | Nothing has happened, or the owner intended it |
| `active` | info | In progress; will change while watched |
| `good` | info | Completed as intended |
| `warning` | warning | Requested but not effective, or completed but degraded |
| `serious` | warning | Recoverable, and requires explanation to be understood |
| `critical` | critical | Failed |

CAP-001's run lifecycle maps as: `requested` neutral, `running` active,
`cancelling` warning, `succeeded` good, `partial` **warning — never good**,
`failed` critical, `cancelled` **neutral — never critical**, `abandoned` serious.

**Authority:** CAP-001 AC-9, AC-19, AC-20; `edg-compliance` principle 3
(severity levels visually distinct). **Departure:** this standard defines six
tiers where EDG names three. The six are a strict refinement, and the mapping
above is the reconciliation; a review against EDG's three levels is satisfied by
it.
**Verification:** Every status the capability renders appears in a tier table in
its UX brief.
**Specialization:** permitted — a capability MAY add states, mapping each to an
existing tier. It MAY NOT add a tier.

### 3.4 Data vintage and honesty

The rules in this subsection exist because charter §3 makes factor and universe
history point-in-time and warns that overwritten state is lost for good, and
because `tech-stack.md` v2 places the provider's restatement limitation on the
promotion evidence rather than on ingestion. No external design guidance covers
them.

### STD-UI-13 — Every value carries its as-of date

**Rule:** A value derived from point-in-time data MUST carry the date it was
known, inline or one interaction away.

**Authority:** Charter §3, Persistence.
**Verification:** For each displayed value, the as-of date is reachable.
**Specialization:** stricter-only.

### STD-UI-14 — Presence has three states

**Rule:** Wherever a check can fail to run, presence MUST be reported as
**present**, **absent**, or **not determinable**. A binary healthy/unhealthy
presentation MUST NOT be used where the third state is possible. Not-determinable
MUST NOT render as absent, and MUST NOT render as zero.

**Authority:** CAP-001 system design constraint 5.5 — gap detection is
unavailable below two instruments holding data in range, and reporting zero gaps
there is vacuous.
**Verification:** Each presence indicator is exercised in all three states.
**Specialization:** none.

### STD-UI-15 — Nothing is asserted beyond what is derived

**Rule:** The interface MUST display only what recorded data supports. It MUST
NOT present intended, expected or configured coverage as fact.

**Authority:** CAP-001 system design constraint 5.9 — coverage is derived, never
asserted.
**Verification:** Every displayed field traces to a query over recorded rows.
**Specialization:** none.

### STD-UI-16 — No silent substitution

**Rule:** The interface MUST NOT carry a last-known value forward, interpolate
across a gap, or substitute a default for an unknown, unless it states at the
point of display that it has done so.

**Authority:** Charter §3, point-in-time history.
**Verification:** Reviewer identifies each derived or filled value and confirms
the disclosure.
**Specialization:** none.

### STD-UI-17 — Known limitations propagate

**Rule:** A value computed from data carrying a recorded limitation MUST be
marked, and the mark MUST propagate to every presentation derived from it,
including backtest results and promotion evidence.

**Authority:** `tech-stack.md` v2 — Massive's fundamentals are not as-reported;
values backfilled before ingestion began carry restatement bias, and the
obligation was placed on the promotion evidence.
**Verification:** Trace one restatement-affected fundamental through
classification to promotion evidence; the mark survives.
**Specialization:** stricter-only.

### STD-UI-18 — A check states what it does not cover

**Rule:** Where a check cannot detect a class of fault, the interface MUST state
what it does not cover, alongside its result. The absence of a detected problem
MUST NOT be presented as evidence of correctness.

**Authority:** CAP-001 system design constraint 5.5 — a market-wide provider
outage leaves no gap to detect, because the day never enters the trading-day set.
**Verification:** Each check's result carries its coverage statement.
**Specialization:** stricter-only.

### 3.5 Actions

### STD-UI-19 — Action tiers and error actionability

**Rule:** Every action MUST be classified **routine** (reversible, no
confirmation), **consequential** (confirmation describing the actual effect per
STD-UI-2), or **capital-at-risk** (STD-UI-20). Irreversibility MUST be stated
only where true. Every error MUST name the operation, the affected resource and
the reason, and MUST offer a recovery action where one exists.

**Authority:** `edg-compliance` principles 3 and interaction patterns; CAP-001
AC-10, AC-21.
**Verification:** The capability's UX brief tiers every action and states each
error's three parts.
**Specialization:** stricter-only.

### STD-UI-20 — The promotion gate

**Rule:** Promotion from paper to live MUST present the evidence in the same view
as the action; MUST require an explicit acknowledgement, including of any mark
carried under STD-UI-17; MUST capture the owner's stated rationale; and MUST NOT
be a toggle, switch or setting.

**Authority:** Charter §3 — Persistence stores "the decision history behind
promotions", and a decision with no recorded reason is not a history; charter §1,
which makes the gate deliberate.
**Verification:** The promotion interaction is walked; each clause is observable.
**Specialization:** stricter-only. The rationale requirement is open — see §5.3,
OQ-UI-5.

### STD-UI-21 — The kill switch

**Rule:** The kill switch MUST be reachable from every screen at a fixed
position; MUST be a single action; MUST NOT be gated behind a confirmation; and
MUST reflect the persisted state read from the store rather than optimistic local
state.

**Authority:** Charter §3 — kill-switch state lives outside the application's
health, so that stopping does not depend on the application being responsive.
**Departure:** `edg-compliance` requires confirmation dialogs for destructive
actions. This control is protective rather than destructive, and a confirmation
is itself a thing that can fail at the moment the control is needed. The
departure is intentional and a reviewer MUST NOT raise it as a finding.
**Verification:** The control is reachable and single-action from every screen,
and its rendered state changes only when the stored state does.
**Specialization:** none.

### STD-UI-22 — Control adjacency

**Rule:** A capital-at-risk or destructive control MUST NOT be placed adjacent to
a routine one, and MUST NOT be the default focus target of any dialog.

**Authority:** Internal policy.
**Verification:** Layout inspection and a keyboard pass.
**Specialization:** stricter-only.

### 3.6 States and feedback

### STD-UI-23 — State coverage

**Rule:** Every data-bearing region MUST define: loading; empty because never
populated; empty because nothing was found; partial; stale; unavailable because a
check could not run; error; and unreachable because the API is not answering — or
record why one does not apply. Never-populated and nothing-found MUST NOT be
collapsed into one state. Unreachable MUST be a designed state and MUST NOT
surface as a generic transport error.

**Authority:** `edg-compliance` states checklist; CAP-001 AC-16, AC-17.
**Verification:** The capability's UX brief enumerates all eight per region.
**Specialization:** permitted — a region MAY declare a state inapplicable with a
recorded reason.

### STD-UI-24 — Programmatic semantics and feedback

**Rule:** Every operation MUST be completable by keyboard; focus MUST be managed
on dialogs and on content inserted into the page; visible focus MUST NOT be
suppressed. Elements without visible text MUST carry accessible names. A table
MUST carry programmatic row and column headers wherever a cell's meaning depends
on both. Content updated by polling MUST announce politely. Text MUST meet 4.5:1
contrast, and large text and interactive boundaries 3:1. An operation whose
effect is not immediately visible MUST confirm its completion explicitly.

**Authority:** `edg-compliance` principle 4; WCAG 2.1 AA, which this standard
adopts as the project target — closing the question `CAP-001-ux-brief` §6 raised.
**Verification:** A keyboard pass, a contrast check, and inspection of table and
live-region markup. Enforcement is human review: `tech-stack.md` records that
Biome carries no `jsx-a11y` equivalent.
**Specialization:** stricter-only.

### STD-UI-25 — Polled freshness

**Rule:** A region updated by polling MUST display its last-updated time, and its
cadence MUST be recorded in the capability's design rather than left to
implementation.

**Authority:** CAP-001 system design control flow steps 3, 4, 28–31 — the
interface learns of progress only by polling.
**Verification:** The region shows a last-updated time; the design states the
cadence.
**Specialization:** permitted — cadence varies per region.

### STD-UI-26 — Multi-step operations

**Rule:** A multi-step operation MUST show its steps, the current position, and
what remains, and MUST allow retreat to a previous step without loss of entered
data.

**Authority:** `edg-compliance` interaction patterns (wizard pattern).
**Verification:** The operation is walked forward and backward.
**Specialization:** stricter-only.

### 3.7 Charts and scale

### STD-UI-27 — Chart integrity

**Rule:** A chart MUST NOT use two y-scales. Bar charts MUST have a zero
baseline. Categorical hues MUST be assigned in a fixed order and MUST NOT be
cycled; beyond the palette's length the data MUST be grouped or facetted rather
than given generated hues. A chart with two or more series MUST carry a legend.

**Authority:** Internal policy.
**Verification:** Chart inspection.
**Specialization:** none.

### STD-UI-28 — Chart provenance

**Rule:** Every chart MUST state what is measured, its units, its as-of date and
its n, and MUST have a table equivalent reachable from it.

**Authority:** STD-UI-13; charter §2, which makes the owner's judgement rest on
inspectable evidence.
**Verification:** Chart inspection; the table is reachable.
**Specialization:** stricter-only.

### STD-UI-29 — Density tokens

**Rule:** Density, type scale and spacing MUST be defined once as theme tokens
and every surface MUST consume them. A component MUST NOT be overridden at a call
site; a correction belongs in the vendored component.

**Authority:** Internal policy. `tech-stack.md` v2 vendors `shadcn/ui` into the
repository, so its source is the product's to correct.
**Verification:** No spacing, size or colour literal appears outside the theme.
**Specialization:** permitted — a capability MAY select a density tier from the
defined set. It MAY NOT introduce a value.

### STD-UI-30 — Lists at committed volume

**Rule:** A list that can reach the volume its capability commits to MUST be
virtualised and MUST provide search and filter. A layout that works only at
small volume does not satisfy the capability.

**Authority:** CAP-001 AC-4 — up to 3000 named instruments.
**Verification:** The list is exercised at the committed volume.
**Specialization:** permitted — the volume is the capability's own.

## 4. Conformance

A conforming capability records, in its UX brief:

1. **Applicable rules** — which of STD-UI-1 through STD-UI-30 its surfaces engage.
2. **Non-applicable rules** — which do not apply, each with the reason. A
   capability with no charts records STD-UI-27 and STD-UI-28 as not applicable;
   silence is not a record.
3. **Where each applicable rule is satisfied** — the screen, state or component
   that discharges it.
4. **Each local specialization** — the rule, what varies, and why. Only rules
   marked `permitted` or `stricter-only` may be specialized; a rule marked `none`
   may not.

A capability that is looser than a rule marked `none` or `stricter-only` does not
conform, and the finding is an amendment to this standard or a change to the
capability — not a waiver.

## 5. Change Control

### 5.1 What a change requires

An amendment to any rule requires the owner's approval and a new
`artifact_version`. A change to §1 or §2 requires the same. Correcting a
typographical error or a broken reference does not.

### 5.2 Deriving the blast radius

Rule numbering is permanent. A retired rule is marked retired in place and its
number is never reused, because capabilities, UX briefs and review reports cite
the numbers.

On changing rule *n*:

1. Run `python3 scripts/check-capabilities.py --project factorflow-v2 --json`.
2. Re-review every capability whose conformance record marks rule *n* `yes` or
   `partial`, and every capability carrying a specialization of it.
3. Capabilities that record rule *n* as not applicable proceed untouched.
4. Where the change tightens a rule marked `stricter-only`, existing
   specializations MUST be re-checked; where it loosens one, they need not be.

Adding a rule obliges every capability not yet through specification review to
record it. Capabilities already approved are re-reviewed only where the new rule
governs a surface they deliver.

### 5.3 Open questions

These are recorded rather than resolved. None blocks conformance; each names the
rule it would amend.

| ID | Question | Amends |
|----|----------|--------|
| ~~OQ-UI-1~~ | ~~Does status own red and green, with market direction on a non-red/green diverging pair, or the finance-conventional reverse?~~ **Closed 2026-09-05: status owns red and green.** Not a fresh decision — the first FactorFlow build had already placed gain and loss on teal and amber, for the colour-vision reason recorded in `design-system/README.md`, and reserved red for `--destructive`. STD-UI-7 was written independently of that build and reached the same assignment; closing it records the agreement rather than making a new choice | STD-UI-7 |
| OQ-UI-2 | Does the product ship a dark theme, and from which milestone? **Narrowed 2026-09-05:** the tokens exist — `theme.css` carries a full `.dark` block, stepped against the dark surface rather than inverted, which is what STD-UI-29 requires of a second theme. What remains is only whether M1 exposes a way to switch to it | STD-UI-29 |
| ~~OQ-UI-3~~ | ~~Which single time zone does the product display, and do as-of dates and run timestamps share it?~~ **Closed 2026-09-05: America/Chicago, and they do not share it.** The owner chose US Central over exchange time and over UTC. The second half is settled on correctness rather than preference: a session date is a calendar date in the exchange's terms, so it is rendered unconverted while timestamps carry the zone. Note the consequence the owner accepted, that America/Chicago is not the exchange zone, so between 23:00 and 24:00 Central a run stamps `observed_on` one calendar day behind what America/New_York would record | STD-UI-5 |
| OQ-UI-4 | Which density tier is the product default? `theme.css` currently resolves `--row-height` to `--row-height-comfortable`, which is a port-time placeholder rather than an owner decision; changing it is one token | STD-UI-29 |
| OQ-UI-5 | Does the promotion gate capture a written rationale from the owner? Charter §3's "decision history behind promotions" is read here as requiring one; the charter does not say so in as many words | STD-UI-20 |

The remaining questions can be settled against a working interface. OQ-UI-3 could
not, because CAP-001's run history is the first surface that renders a timestamp,
and it was closed on 2026-09-05 before that screen was designed.

## 6. Traceability

| Entry | Authority | Location |
|-------|-----------|----------|
| STD-UI-1, STD-UI-2 | Charter §1–§3; CAP-001 AC-21; `edg-compliance` terminology | §3.1 |
| STD-UI-3, STD-UI-6 | Internal policy, on charter §2 | §3.2 |
| STD-UI-4 | Charter §3; CAP-001 AC-17 | §3.2 |
| STD-UI-5 | Charter §3, point-in-time history | §3.2 |
| STD-UI-7, STD-UI-9 | Internal policy | §3.3 |
| STD-UI-8, STD-UI-10 | `edg-compliance` principle 4; WCAG 2.1 AA 1.4.1, 1.4.3 | §3.3 |
| STD-UI-11 | `tech-stack.md` v2; charter §3 | §3.3 |
| STD-UI-12 | CAP-001 AC-9, AC-19, AC-20; `edg-compliance` principle 3 | §3.3 |
| STD-UI-13, STD-UI-16 | Charter §3, Persistence | §3.4 |
| STD-UI-14, STD-UI-18 | CAP-001 system design constraint 5.5 | §3.4 |
| STD-UI-15 | CAP-001 system design constraint 5.9 | §3.4 |
| STD-UI-17 | `tech-stack.md` v2, Massive restatement limitation | §3.4 |
| STD-UI-19 | `edg-compliance` principle 3; CAP-001 AC-10, AC-21 | §3.5 |
| STD-UI-20 | Charter §3, decision history behind promotions | §3.5 |
| STD-UI-21 | Charter §3, kill switch outside application health | §3.5 |
| STD-UI-22 | Internal policy | §3.5 |
| STD-UI-23 | `edg-compliance` states checklist; CAP-001 AC-16, AC-17 | §3.6 |
| STD-UI-24 | `edg-compliance` principle 4; WCAG 2.1 AA | §3.6 |
| STD-UI-25 | CAP-001 system design control flow 3, 4, 28–31 | §3.6 |
| STD-UI-26 | `edg-compliance` interaction patterns | §3.6 |
| STD-UI-27, STD-UI-29 | Internal policy | §3.7 |
| STD-UI-28 | STD-UI-13; charter §2 | §3.7 |
| STD-UI-30 | CAP-001 AC-4 | §3.7 |
| WCAG 2.1 AA as project target | `edg-compliance` principle 4, adopted here | §2.3, STD-UI-24 |
| Exemptions from `edg-compliance` | Charter §2; CAP-001 system design constraint 5.11 | §2.3 |

## 7. Revision History

| Date | Version | Change |
|------|---------|--------|
| 2026-09-05 | 3 | Closed OQ-UI-3 on the owner's decision: the product displays **America/Chicago** throughout, and `observed_on` is computed in it. US Central was chosen over exchange time, which would have put run timestamps in the same frame as the session dates that dominate every screen, and over UTC, which would have matched the container logs a failed run is diagnosed against. The question's second half was settled on correctness rather than preference: a session date is a calendar date in the exchange's terms and is rendered unconverted, because converting one moves a bar onto the wrong day. STD-UI-5 now states both, and records the consequence that Central is not the exchange zone, so a run between 23:00 and 24:00 Central stamps a calendar day that America/New_York would call the next one. Also promoted the thirty rule headings from level four to level three so `scripts/check-capabilities.py` can extract them, which is a corrected reference rather than an amendment and changed no rule text |
| 2026-09-05 | 2 | Closed OQ-UI-1: status owns red and green, market direction keeps a non-red/green diverging pair. Closed on precedent rather than on fresh reasoning — the first FactorFlow build had already made this assignment for the same colour-vision reason, and STD-UI-7 was written independently of it and agreed, so the rule now cites the standing decision alongside its own argument. Narrowed OQ-UI-2, whose tokens now exist. Recorded that `theme.css`'s current density default is a port-time placeholder, not an answer to OQ-UI-4. Updated §1.3 and §2.2: the design system is no longer absent — it was ported into `design-system/` and configured at `projects/factorflow-v2/design-system.yaml` on 2026-09-05, so this standard now states obligations that a resolvable artifact satisfies, and the two are ranked. Corrected a rule reference in §2.2 that named STD-UI-25 where STD-UI-29 governs |
| 2026-09-05 | 1 | Created as a `standard`, on the finding in `CAP-001-ux-brief` v1 that no design system is configured and that CAP-001's interface patterns are inherited by every later capability. Thirty numbered rules, each with an authority, a verification and a specialization posture. Establishes this artifact as factorflow-v2's enforceable UX constitution, with the scaffold-wide `edg-compliance` skill retained as advisory expertise beneath it and left unmodified. Adopts WCAG 2.1 AA as the project target, closing the question `CAP-001-ux-brief` §6 raised. Records three intentional departures from `edg-compliance` — a six-tier severity vocabulary reconciled to EDG's three levels (STD-UI-12), a kill switch that takes no confirmation on charter §3 authority (STD-UI-21), and screen-reader certification exempted as a release gate while its semantics remain mandatory (§2.3, STD-UI-24) — and four exemptions where EDG presupposes a product family, a review body, a support channel or a second user that this product does not have. Five interface questions left open, of which OQ-UI-1, the reservation of red and green for status rather than market direction, is the standing default most likely to be inverted |
