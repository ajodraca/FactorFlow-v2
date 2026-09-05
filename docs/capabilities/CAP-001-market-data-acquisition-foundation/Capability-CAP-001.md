---
artifact_schema_version: 1
artifact_id: CAP-001
artifact_type: capability
artifact_version: 5
id: CAP-001
title: Market Data Acquisition Foundation
description: >-
  Acquire price, fundamental, corporate-action and instrument reference data
  from the market data provider into durable point-in-time storage, and give
  the owner-operator a way to see what was ingested and to tell when ingestion
  is failing.
created: 2026-09-03
updated: 2026-09-05
owner: Alvaro de Jodra
owner_github: ajodraca
status: draft
ai_provenance:
  agent_id: capability-definition-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-05T04:15:00Z
  source_artifacts:
    - id: product-charter
      version: "2, approved 2026-09-03"
    - id: tech-stack
      version: "1, approved 2026-09-03"
    - id: STD-UI
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Market Data Acquisition Foundation

## 1. Description

FactorFlow classifies a self-defined stock universe by value, growth and
momentum, and no part of that is possible without trustworthy market data. Today
the product has no way to obtain any: the repository holds a charter and a tech
stack and nothing that runs. The owner-operator cannot classify an instrument,
cannot judge a strategy, and cannot begin M1 until price, fundamental,
corporate-action and instrument reference data is arriving and is known to be
correct.

This capability delivers that first arrival of data, and the means to trust it.
The owner-operator can acquire historical and reference data for the instruments
they care about, see what was actually ingested and for what dates, and tell
without ambiguity when an ingestion run has failed or returned less than it
should have. Because factor and universe history cannot be reconstructed after
the fact -- fundamentals are restated and delisted instruments disappear -- data
is recorded point-in-time from the first run rather than as overwritten current
state.

It is also the product's first running system, so it establishes the operational
baseline every later capability inherits: the deployable processes, the schema
and its forward-only evolution, runtime configuration and provider credential
handling, and enough operational visibility to diagnose a failed run. Those
choices are fixed by the approved tech stack rather than made here; what this
capability owns is the outcome that the owner-operator can run the system, get
data in, and see when it breaks. It is the foundation for M1 (Universe and
Factors, 2026-Q4); the live streaming feed belongs to M3 and is not delivered
here.

## 2. Scope

### In Scope

- The owner-operator names the instruments to acquire data for, as an explicit
  list they can add to and remove from. Composing universes by rule or screen is
  a later capability's concern; this capability needs only a stated list.
- Removing an instrument retires it from future acquisition without discarding
  what was already observed for it. Point-in-time history cannot be re-acquired
  as-observed once discarded, so removal is not deletion.
- Acquisition of instrument reference data, historical daily prices, company
  fundamentals and corporate actions for the named instruments, from the
  product's market data provider.
- The owner-operator states how far back history must reach before the first
  acquisition runs, and that stated depth governs what is acquired. The product
  does not assume a depth on the owner's behalf.
- Acquired data is recorded point-in-time and append-only, carrying the date
  each value was known, so that a later restatement adds a record rather than
  replacing one.
- Re-running acquisition is safe: a repeated or overlapping run does not
  duplicate, overwrite or corrupt what was already recorded.
- Acquisition runs when the owner-operator starts it. The product does not
  promise continuously refreshed data, and does not judge acquired data to have
  expired.
- The owner-operator can stop an acquisition run that is under way, and an
  acquisition interrupted by anything else does not leave the product unable to
  run another.
- The owner-operator can see what was actually ingested: coverage per instrument
  (which data types are present, over what date range, and when that instrument
  was last acquired), the history of acquisition runs and their outcomes, the
  detail of any failure, and explicit flagging of missing trading days inside a
  range that was acquired.
- The product is runnable and operable by its owner: it starts, evolves its
  schema forward across versions without data loss, takes its runtime
  configuration and provider credential from the environment, and reports
  operational state well enough to diagnose a failed run.

### Out of Scope

- The live streaming market data feed and the long-lived connection it requires.
  Deferred to M3; it sits behind the same provider contract this capability
  establishes, so adding it later does not change how history is read.
- Computing value, growth or momentum classifications from the acquired data.
  This capability delivers the inputs; classification is the second half of M1
  and belongs to its own capability.
- Composing a universe by rule, screen or ranking. The owner names instruments
  directly here; universe definition owns that outcome later.
- Strategy definition, strategy evaluation, order placement, position tracking,
  the broker relationship and the kill switch. None of these are reachable
  without data and none are delivered here.
- Backtesting and the replay of strategies over historical data (M4). This
  capability records the point-in-time history backtesting will later depend on,
  but delivers no replay.
- Any acquisition of data for instruments the owner has not named.
- Scheduled or automatic recurring acquisition, and any notion of data being
  stale or expired. Acquisition is owner-triggered, so there is no freshness
  expectation for the product to fall short of. A capability that needs data
  kept current will own that outcome and the staleness definition that comes
  with it.

## 3. User Flows

### Owner-Operator -- Acquire market data for the first time

1. The owner-operator has a running product with no market data in it, and a
   credential for the market data provider.
2. They supply the provider credential and state how far back history must
   reach, then name the instruments they want data for.
3. They start an acquisition run.
4. The run reports its progress and completes, and the owner-operator sees each
   named instrument listed with the data types present and the date range
   covered.
5. If the credential is rejected or the provider cannot be reached, the run
   reports that it failed and why, and no partially-written data is left behind
   that would later be mistaken for a complete history.

### Owner-Operator -- Confirm the data is fit to rely on

1. The owner-operator wants to know whether the data behind a decision is
   complete and current.
2. They open the ingestion view.
3. They see, per instrument, the date range covered, when it was last acquired,
   and any missing trading days inside that range.
4. They can tell, without inspecting the data itself, which instruments have
   complete coverage over the range they need and which do not.
5. If nothing has been acquired yet, the view says so plainly rather than
   appearing empty and healthy.

### Owner-Operator -- Diagnose and recover from a failed acquisition

1. An acquisition run fails or completes having brought in less than expected.
2. The owner-operator opens the run history and sees that run marked as failed
   or partial rather than successful.
3. They open the run and see which instrument and which data type was affected,
   and the reason reported for the failure.
4. They correct the cause and start the run again.
5. The re-run completes and the affected instrument shows complete coverage;
   data that had already been acquired is neither duplicated nor overwritten.

### Owner-Operator -- Stop an acquisition that is taking too long

1. The owner-operator has started an acquisition covering a large instrument
   list and decides not to let it finish.
2. They see that the run is under way and ask to stop it.
3. The run stops without starting the instruments it had not yet reached, and is
   shown as cancelled rather than failed.
4. The instruments it had already acquired keep their coverage, and a later run
   completes the rest without re-fetching them.
5. If the run had already finished by the time they asked, they are told it
   completed rather than being shown a cancellation that did not happen.

### Owner-Operator -- Add an instrument after the first acquisition

1. The owner-operator decides they need data for an instrument not previously
   named.
2. They add it to the instrument list.
3. They start an acquisition run.
4. The new instrument is populated to the same history depth as the others, and
   instruments already covered are not re-fetched or disturbed.
5. If the provider does not recognise the instrument, the owner-operator is told
   which one and why, and the rest of the run still completes.

### Owner-Operator -- Operate and upgrade the running product

1. The owner-operator deploys a new version of the product onto the machine they
   control.
2. They start it with the runtime configuration and provider credential supplied
   from the environment rather than from anything committed to the repository.
3. The product brings its stored data forward to the new version without losing
   or rewriting the history already acquired.
4. The owner-operator can see that the product started, and can see its
   operational state well enough to distinguish a healthy system from one whose
   acquisition is failing.
5. If the data store cannot be brought forward, the product reports the failure
   and does not start in a state that would write inconsistent data.

## 4. Acceptance Criteria

1. **AC-1 — Named instrument list:** The owner-operator MUST be able to add
   instruments to and remove them from the acquisition list, and see the current
   list, without editing configuration files or the data store directly.
2. **AC-2 — History depth is stated, not assumed:** The product MUST require the
   owner-operator to state the history depth before the first acquisition run,
   and MUST NOT acquire to a depth the owner has not stated.
3. **AC-3 — Data types acquired:** A successful acquisition run MUST provide,
   for each named instrument the provider covers, instrument reference data,
   daily prices, company fundamentals and corporate actions over the stated
   history depth.
4. **AC-4 — Acquisition volume:** The product MUST complete an acquisition run
   covering up to 3000 named instruments without manual intervention.
5. **AC-5 — Point-in-time record:** Every acquired value MUST be recorded with
   the date on which it was known, and a run returning a restated value for a
   date already held MUST add a record rather than replace the existing one.
6. **AC-6 — Re-run safety:** Re-running acquisition over a period already
   acquired MUST NOT duplicate, overwrite or remove previously recorded data.
7. **AC-7 — Coverage visibility:** The owner-operator MUST be able to see, for
   each named instrument, which data types are present, the date range covered,
   and when that instrument was last acquired.
8. **AC-8 — Gap visibility:** The product MUST identify missing trading days
   within a date range it has acquired for an instrument.
9. **AC-9 — Honest run outcome:** Every acquisition run MUST be recorded as
   succeeded, failed or partial, and MUST NOT be recorded as succeeded when any
   named instrument failed to acquire.
10. **AC-10 — Failure diagnosis:** For a failed or partial run, the
    owner-operator MUST be able to see which instrument and which data type was
    affected and the reason reported for the failure.
11. **AC-11 — Unrecognised instrument does not stop the run:** When the provider
    does not recognise a named instrument, the run MUST report that instrument
    and MUST continue acquiring the remaining instruments.
12. **AC-12 — A failed run leaves no false history:** A run that fails partway
    MUST NOT leave data that presents as complete coverage for a range it did
    not fully acquire.
13. **AC-13 — Credential handling:** The provider credential MUST be supplied at
    runtime from the environment, and MUST NOT appear in the repository, in log
    output, or in any view the product renders.
14. **AC-14 — Network exposure:** The owner interface MUST NOT be reachable from
    a non-loopback network interface.
15. **AC-15 — Forward data evolution:** Deploying a newer version of the product
    onto an existing data store MUST bring the stored data forward without
    losing or rewriting previously acquired history.
16. **AC-16 — Refuse an inconsistent start:** When the stored data cannot be
    brought forward to the running version, the product MUST report the failure
    and MUST NOT serve or write data.
17. **AC-17 — Honest empty state:** Before any acquisition has run, the
    ingestion view MUST state that no data has been acquired rather than
    presenting an empty successful state.
18. **AC-18 — Operational visibility:** The owner-operator MUST be able to
    determine whether the product is running and whether its most recent
    acquisition run failed, without inspecting the data store directly.
19. **AC-19 — Cancel a run in progress:** An owner-operator MUST be able to
    cancel an acquisition run that is under way. The cancelled run MUST NOT begin
    acquiring any instrument it had not already started, and coverage already
    written MUST be retained.
20. **AC-20 — An interrupted run does not block the next one:** An acquisition
    run whose process stops unexpectedly MUST reach a terminal state without the
    owner-operator modifying the data store, and MUST NOT prevent a subsequent
    run from starting.
21. **AC-21 — Removal retains history:** Removing an instrument from the
    acquisition list MUST stop further acquisition for that instrument and MUST
    retain every observation already recorded for it. The owner-operator MUST be
    able to see that retained coverage and distinguish it from instruments still
    being acquired.

## 5. Dependencies and Constraints

### 5.1 Dependencies

| Target | Type | What is needed | Satisfied when |
|--------|------|----------------|----------------|
| Massive (market data provider) | requires-runtime | Historical reads for instrument reference data, daily prices, company fundamentals and corporate actions, authenticated by an API key supplied at runtime, covering the owner's stated history depth for up to 3000 named instruments. No acceptance criterion can be cited: Massive is an external provider, not a capability, and its coverage is still under evaluation. | An acquisition run completes against the live provider and returns all four data types for named instruments over the stated depth. |
| `docs/constitution/tech-stack.md` | conforms-to | The approved technology choices and the project-wide constraints C1-C11 that bound this capability: process topology, single transactional store, the one market-data contract spanning historical and live reads, and append-only point-in-time history. | Specification review confirms the system design for this capability uses only approved technologies and honours C1, C2, C4, C5, C7 and C8. |
| STD-UI | conforms-to | The project's enforceable owner-interface standard, 30 numbered rules governing vocabulary, quantities, colour and status, data vintage, actions, states and feedback, charts and scale. CAP-001 delivers the product's first interface surface, so every rule governing a surface it renders binds it. | Section 5.4 accounts for all 30 rules, and specification review confirms the UX brief and UX design satisfy each rule marked yes or partial. |

### 5.2 Non-Dependencies

| Target | Not depended on for | Why |
|--------|--------------------|-----|
| Alpaca / the broker port | Any part of acquisition, storage or visibility | This capability places no orders and holds no positions. The broker port is established by the capability that first needs to trade. |
| The kill switch | Bounding anything this capability does | There is no order path here to stop. The kill switch protects the money path, which does not yet exist. |

### 5.3 Constraints

- **M1 milestone (2026-Q4).** This capability is the prerequisite for factor
  classification, which must land inside M1; its delivery date bounds both.
- **Point-in-time history from the first run.** Factor and universe history is
  append-only and carries the date each value was known. This cannot be repaired
  retrospectively: fundamentals are restated and delisted instruments disappear,
  so anything overwritten now is lost permanently.
- **The market data source is one contract covering both historical reads and
  the live feed.** Only the historical half is delivered here, but the contract
  established must not foreclose the live feed that M3 adds behind it.
- **Market data ingestion runs as its own process,** separate from the
  application, because long-lived connections, reconnects and upstream outages
  must not be able to take the rest of the product down.
- **One transactional relational store** for application data.
- **Schema evolves forward only,** through numbered migration files recorded in
  an applied-migrations table. There is no rollback-by-schema-reversal path.
- **Self-hosted on a machine the owner controls,** as containers.
- **The owner interface is bound to the loopback interface and performs no
  authentication.** Decided by the owner on 2026-09-03, on the basis that the
  interface is never externally reachable. This is the reason SEC-AUTH-001 does
  not engage, and it ceases to hold the moment the interface is exposed to any
  network.
- **One owner-operator, no separation of duties, no subscribers.** There is no
  multi-tenancy, no per-user isolation and no horizontal scale requirement.
- **The provider publishes no SDK,** so the product integrates against its
  published interface directly.

### 5.4 Standards Conformance

Conformance to `STD-UI`, recorded as STD-UI section 4 requires. The narrative
record, with the reasoning behind each entry, is section 12 of
`design/ux-brief.md`; this table is the machine-checked mirror of it and the two
must agree.

| Rule | Applies | Where satisfied, or why not |
|------|---------|------------------------------|
| STD-UI-1 | yes | UX brief 2, 3. Adds *data type*, *run outcome* and *abandoned*; redefines no term |
| STD-UI-2 | yes | UX brief 2.2, 3. Retirement is confirmed as retirement, with `dialog` `confirm` not `destructive` |
| STD-UI-3 | yes | Coverage ranges, gap counts and per-run instrument counts in tabular figures, precision fixed per column |
| STD-UI-4 | yes | UX brief 2.1. Absent renders an em dash, zero means a measured zero, blank means inapplicable |
| STD-UI-5 | yes | UX brief 2.1, 2.4, 5. ISO-8601 throughout, timestamps in America/Chicago, session dates unconverted |
| STD-UI-6 | yes | Instrument and gap counts render in full in every table |
| STD-UI-7 | partial | Status palette only. CAP-001 renders no direction, magnitude or categorical series |
| STD-UI-8 | yes | UX brief 6. Every status carries a text label plus icon or shape; greyscale readability is the test |
| STD-UI-9 | no | No series and no per-entity colour. CAP-001 renders no chart |
| STD-UI-10 | no | Binds the shared theme, not this capability. `design-system/theme-validation.md` records the validation; satisfied as of 2026-09-05 |
| STD-UI-11 | no | CAP-001 delivers no trading and has no paper or live environment. UX brief 2.6 shapes the status region to receive the obligation later |
| STD-UI-12 | yes | UX brief 12.2 carries the tier table. No state and no tier is added |
| STD-UI-13 | yes | UX brief 2.1. Last-acquired and covered range inline; observation dates one interaction away |
| STD-UI-14 | yes | UX brief 2.1. `badge` `coverage-present` / `coverage-absent` / `coverage-unknown` |
| STD-UI-15 | yes | UX brief 2.1, 5. Only ranges rows exist for are displayed |
| STD-UI-16 | yes | No value is carried forward across a gap and none is interpolated |
| STD-UI-17 | partial | CAP-001 acquires the fundamentals carrying the restatement limitation but derives no value from them. The obligation engages at classification and promotion |
| STD-UI-18 | yes | UX brief 2.1. The gap check states that a market-wide outage leaves no gap to detect |
| STD-UI-19 | yes | UX brief 3 tiers every action; 2.5 states the three parts of each error |
| STD-UI-20 | no | CAP-001 delivers no promotion. Section 2, out of scope |
| STD-UI-21 | no | CAP-001 has no order path. Section 5.2 records the kill switch as a non-dependency |
| STD-UI-22 | no | CAP-001 has no capital-at-risk control and no destructive one; retirement is neither |
| STD-UI-23 | yes | UX brief 12.4 enumerates all eight states for each of the six regions |
| STD-UI-24 | yes | UX brief 6 |
| STD-UI-25 | yes | UX brief 5 records the cadence per region: 10s run progress, 30s application status, coverage on demand |
| STD-UI-26 | no | No single operation spans steps. Making the first-run path a guided setup would engage this rule |
| STD-UI-27 | no | CAP-001 renders no chart. System design 4.3 |
| STD-UI-28 | no | CAP-001 renders no chart. System design 4.3 |
| STD-UI-29 | yes | Selects a density tier from the defined set and introduces no value. Which tier is open, OQ-UI-4 |
| STD-UI-30 | partial | Search and filter are required at AC-4's volume. The `data-table` spec offers pagination and not virtualisation, which this rule requires, so the component does not discharge it alone |

## 6. Assumptions

- **Massive covers the named instruments over the stated history depth, for all
  four data types, and its rate limits permit a run of up to 3000 instruments.**
  Coverage and limits have not been tested; the tech stack records provider
  evaluation as still open. If the provider falls short, AC-3 and AC-4 change.
- **The owner-operator holds valid provider credentials** before the first
  acquisition run. Nothing in this capability provisions them.
- **The instruments of interest are US-listed equities,** consistent with the
  charter's factor model and the provider's coverage. A different market would
  change reference data and corporate-action handling.

## 7. Open Questions

- **When must the loopback-only decision be revisited?** The absence of
  authentication is sound only while the interface stays on loopback. Live
  trading and a kill switch behind the same interface raise the cost of that
  assumption being wrong. *(Affects AC-14 and the security posture of every
  later capability.)*
- **What is an acceptable duration for a first acquisition run of 3000
  instruments?** No duration target is fixed, so AC-4 constrains completeness
  but not time. *(Affects whether a run that takes many hours is acceptable.)*
- **Does Massive's coverage and rate limiting hold for the full instrument
  count and history depth?** Provider evaluation is recorded as open in the
  approved tech stack. *(Affects AC-3, AC-4 and the assumptions above.)*
- ~~What should happen to data already acquired for an instrument the
  owner-operator removes from the list?~~ **Answered 2026-09-04: retained.**
  Removal retires the instrument from future acquisition and keeps every
  observation already recorded, because point-in-time history cannot be
  re-acquired as-observed once discarded and an instrument dropped today may be
  one a later backtest needs. See AC-21.

## 8. Readiness Assessment

**Readiness Score: 88/100**

Architecture can begin. The problem, the affected user, the desired outcome and
the scope boundaries are settled, including the three that most shape the work:
the live feed is deferred to M3, universe composition belongs to a later
capability, and acquisition is owner-triggered rather than continuous. Five
user flows carry explicit failure branches, and eighteen acceptance criteria
cover acquisition, point-in-time recording, re-run safety, visibility, failure
diagnosis, credential handling, network exposure and forward data evolution.
Every quantitative value is sourced to an owner decision rather than invented.

Twenty acceptance criteria now include cancellation and recovery from an
interrupted run, both added on 2026-09-04 after system design found that a run
claimed by a process that then dies would otherwise wedge acquisition with no
remedy short of editing the data store by hand.

Three open questions remain, none of them blocking. Two bear on external
provider behaviour that only evaluation can settle; one is a security decision
with a known trigger for revisiting rather than an unresolved choice; and one is
a lifecycle detail on instrument removal that affects a single criterion. None
prevents system design from starting, though the provider questions should be
answered before AC-3 and AC-4 are treated as fixed.
