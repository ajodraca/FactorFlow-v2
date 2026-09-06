---
artifact_schema_version: 1
artifact_id: CAP-001-component-tests
artifact_type: test-specification
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-06
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-06T00:00:00Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Component Test Specification

### TC-COMP-001: Named instrument list: The owner-operator MUST be able to add instruments to and remove them from the acqui…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Named instrument list: The owner-operator MUST be able to add instruments to and remove them from the acquisition list, and see the current list, without editing configuration files or the data store directly.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-1 is exercised; no additional condition is assumed.

### TC-COMP-002: History depth is stated, not assumed: The product MUST require the owner-operator to state the history dept…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- History depth is stated, not assumed: The product MUST require the owner-operator to state the history depth before the first acquisition run, and MUST NOT acquire to a depth the owner has not stated.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-2 is exercised; no additional condition is assumed.

### TC-COMP-003: Data types acquired: A successful acquisition run MUST provide, for each named instrument the provider cove…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Data types acquired: A successful acquisition run MUST provide, for each named instrument the provider covers, instrument reference data, daily prices, company fundamentals and corporate actions over the stated history depth.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-3 is exercised; no additional condition is assumed.

### TC-COMP-004: Acquisition volume: The product MUST complete an acquisition run covering up to 3000 named instruments with…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Acquisition volume: The product MUST complete an acquisition run covering up to 3000 named instruments without manual intervention.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-4 is exercised; no additional condition is assumed.

### TC-COMP-005: Point-in-time record: Every acquired value MUST be recorded with the date on which it was known, and a run…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Point-in-time record: Every acquired value MUST be recorded with the date on which it was known, and a run returning a restated value for a date already held MUST add a record rather than replace the existing one.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-5 is exercised; no additional condition is assumed.

### TC-COMP-006: Re-run safety: Re-running acquisition over a period already acquired MUST NOT duplicate, overwrite or remov…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Re-run safety: Re-running acquisition over a period already acquired MUST NOT duplicate, overwrite or remove previously recorded data.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-6 is exercised; no additional condition is assumed.

### TC-COMP-007: Coverage visibility: The owner-operator MUST be able to see, for each named instrument, which data types ar…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Coverage visibility: The owner-operator MUST be able to see, for each named instrument, which data types are present, the date range covered, and when that instrument was last acquired.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-7 is exercised; no additional condition is assumed.

### TC-COMP-008: Gap visibility: The product MUST identify missing trading days within a date range it has acquired for an i…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-8
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-8.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Gap visibility: The product MUST identify missing trading days within a date range it has acquired for an instrument.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-8 is exercised; no additional condition is assumed.

### TC-COMP-009: Honest run outcome: Every acquisition run MUST be recorded as succeeded, failed or partial, and MUST NOT be…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-9
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-9.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Honest run outcome: Every acquisition run MUST be recorded as succeeded, failed or partial, and MUST NOT be recorded as succeeded when any named instrument failed to acquire.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-9 is exercised; no additional condition is assumed.

### TC-COMP-010: Failure diagnosis: For a failed or partial run, the owner-operator MUST be able to see which instrument and…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-10.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Failure diagnosis: For a failed or partial run, the owner-operator MUST be able to see which instrument and which data type was affected and the reason reported for the failure.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-10 is exercised; no additional condition is assumed.

### TC-COMP-011: Unrecognised instrument does not stop the run: When the provider does not recognise a named instrument, the…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-11
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-11.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Unrecognised instrument does not stop the run: When the provider does not recognise a named instrument, the run MUST report that instrument and MUST continue acquiring the remaining instruments.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-11 is exercised; no additional condition is assumed.

### TC-COMP-012: A failed run leaves no false history: A run that fails partway MUST NOT leave data that presents as complet…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-12
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-12.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A failed run leaves no false history: A run that fails partway MUST NOT leave data that presents as complete coverage for a range it did not fully acquire.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-12 is exercised; no additional condition is assumed.

### TC-COMP-013: Credential handling: The provider credential MUST be supplied at runtime from the environment, and MUST NOT…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-13
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-13.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Credential handling: The provider credential MUST be supplied at runtime from the environment, and MUST NOT appear in the repository, in log output, or in any view the product renders.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-13 is exercised; no additional condition is assumed.

### TC-COMP-014: Network exposure: The owner interface MUST NOT be reachable from a non-loopback network interface

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-14
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-14.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Network exposure: The owner interface MUST NOT be reachable from a non-loopback network interface.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-14 is exercised; no additional condition is assumed.

### TC-COMP-015: Forward data evolution: Deploying a newer version of the product onto an existing data store MUST bring the…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-15
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-15.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Forward data evolution: Deploying a newer version of the product onto an existing data store MUST bring the stored data forward without losing or rewriting previously acquired history.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-15 is exercised; no additional condition is assumed.

### TC-COMP-016: Refuse an inconsistent start: When the stored data cannot be brought forward to the running version, the pr…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-16
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-16.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Refuse an inconsistent start: When the stored data cannot be brought forward to the running version, the product MUST report the failure and MUST NOT serve or write data.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-16 is exercised; no additional condition is assumed.

### TC-COMP-017: Honest empty state: Before any acquisition has run, the ingestion view MUST state that no data has been acq…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-17
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-17.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Honest empty state: Before any acquisition has run, the ingestion view MUST state that no data has been acquired rather than presenting an empty successful state.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-17 is exercised; no additional condition is assumed.

### TC-COMP-018: Operational visibility: The owner-operator MUST be able to determine whether the product is running and whe…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-18
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-18.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Operational visibility: The owner-operator MUST be able to determine whether the product is running and whether its most recent acquisition run failed, without inspecting the data store directly.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-18 is exercised; no additional condition is assumed.

### TC-COMP-019: Cancel a run in progress: An owner-operator MUST be able to cancel an acquisition run that is under way. Th…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-19
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-19.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Cancel a run in progress: An owner-operator MUST be able to cancel an acquisition run that is under way. The cancelled run MUST NOT begin acquiring any instrument it had not already started, and coverage already written MUST be retained.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-19 is exercised; no additional condition is assumed.

### TC-COMP-020: An interrupted run does not block the next one: An acquisition run whose process stops unexpectedly MUST re…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-20
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-20.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- An interrupted run does not block the next one: An acquisition run whose process stops unexpectedly MUST reach a terminal state without the owner-operator modifying the data store, and MUST NOT prevent a subsequent run from starting.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-20 is exercised; no additional condition is assumed.

### TC-COMP-021: Removal retains history: Removing an instrument from the acquisition list MUST stop further acquisition for…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-21
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-21.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Removal retains history: Removing an instrument from the acquisition list MUST stop further acquisition for that instrument and MUST retain every observation already recorded for it. The owner-operator MUST be able to see that retained coverage and distinguish it from instruments still being acquired.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-21 is exercised; no additional condition is assumed.

### TC-COMP-022: Deepening backfills history: When the owner-operator increases the stated history depth, the next acquisiti…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-22
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-22.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Deepening backfills history: When the owner-operator increases the stated history depth, the next acquisition run MUST acquire the missing earlier range for every active named instrument that falls short of the new depth, without re-acquiring the range already covered.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-22 is exercised; no additional condition is assumed.

### TC-COMP-023: Concurrent run requests queue: When the owner-operator starts an acquisition run while another run is under…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-23
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-23.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Concurrent run requests queue: When the owner-operator starts an acquisition run while another run is under way, the product MUST accept the new request, record it as requested, and start it only after the active run reaches a terminal state. Requested runs MUST start in request order.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-23 is exercised; no additional condition is assumed.

### TC-COMP-024: A run with nothing to acquire is refused, not run: When the owner-operator starts an acquisition run while…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-24
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-24.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A run with nothing to acquire is refused, not run: When the owner-operator starts an acquisition run while no instrument is active, the product MUST refuse the request, state that no instruments are named, and record no run. A run that completes having acquired nothing would be either a success that did nothing or a failure the owner did not cause, and AC-9 requires the recorded outcome to mean what it says.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-24 is exercised; no additional condition is assumed.

### TC-COMP-025: Retiring an instrument takes effect from the next run: An instrument retired while an acquisition run is un…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-25
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-25.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Retiring an instrument takes effect from the next run: An instrument retired while an acquisition run is under way MUST still be reached by that run, and MUST NOT be acquired by any later run. Observations written for it before the run ends are retained (AC-21). The run's scope is fixed when it starts, so that what a run did is explainable from what it set out to do.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-25 is exercised; no additional condition is assumed.

### TC-COMP-026: A queued run can be cancelled before it starts: When the owner-operator cancels an acquisition run that has…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** AC-26
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by AC-26.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A queued run can be cancelled before it starts: When the owner-operator cancels an acquisition run that has been requested but not yet started, the product MUST record it as cancelled, MUST NOT start it, and MUST leave any run already under way unaffected.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in AC-26 is exercised; no additional condition is assumed.

### TC-COMP-027: Coverage MUST be derived at read time from coverage segments and observation rows, and MUST NOT be stored a…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Coverage MUST be derived at read time from coverage segments and observation rows, and MUST NOT be stored as an asserted summary.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-1 is exercised; no additional condition is assumed.

### TC-COMP-028: The trading-day set MUST be formed as the union of dates on which any named instrument has a daily bar in t…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The trading-day set MUST be formed as the union of dates on which any named instrument has a daily bar in the requested range.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-2 is exercised; no additional condition is assumed.

### TC-COMP-029: A missing date MUST be reported as a gap only when it falls inside that instrument's own covered range, sin…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A missing date MUST be reported as a gap only when it falls inside that instrument's own covered range, since a date before the instrument was first acquired is outside coverage rather than a gap.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-3 is exercised; no additional condition is assumed.

### TC-COMP-030: Gap detection MUST be reported as unavailable, with a reason, when fewer than two named instruments hold da…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Gap detection MUST be reported as unavailable, with a reason, when fewer than two named instruments hold data in the range, rather than returning an empty gap list.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-4 is exercised; no additional condition is assumed.

### TC-COMP-031: Gap detection MUST apply to daily prices only

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Gap detection MUST apply to daily prices only.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-5 is exercised; no additional condition is assumed.

### TC-COMP-032: The product MUST NOT claim to detect a market-wide provider outage, since every instrument is missing that…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The product MUST NOT claim to detect a market-wide provider outage, since every instrument is missing that day and the derived set cannot represent it.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-6 is exercised; no additional condition is assumed.

### TC-COMP-033: Never-acquired MUST be computed as the absence of any observation row in the store, not as an empty result…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Never-acquired MUST be computed as the absence of any observation row in the store, not as an empty result for the current filter, and the two MUST render distinct copy.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-7 is exercised; no additional condition is assumed.

### TC-COMP-034: Retired instruments MUST appear in coverage reads with their retained coverage, marked distinctly from acti…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-8
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-8.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Retired instruments MUST appear in coverage reads with their retained coverage, marked distinctly from active instruments rather than omitted.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-8 is exercised; no additional condition is assumed.

### TC-COMP-035: An instrument covered to a shallower depth than the current stated depth MUST be presented as short by a st…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-9
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-9.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- An instrument covered to a shallower depth than the current stated depth MUST be presented as short by a stated amount.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-9 is exercised; no additional condition is assumed.

### TC-COMP-036: Coverage reads MUST support symbol filter, lifecycle filter, date bounds and cursor paging at 3000 instrume…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-10
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-10.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Coverage reads MUST support symbol filter, lifecycle filter, date bounds and cursor paging at 3000 instruments.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-10 is exercised; no additional condition is assumed.

### TC-COMP-037: Each instrument row MUST report per-data-type presence as present, absent or unknown

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-11
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-11.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Each instrument row MUST report per-data-type presence as present, absent or unknown.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-11 is exercised; no additional condition is assumed.

### TC-COMP-038: A uniform shortfall across every instrument caused by the provider plan's history cap MUST NOT be presented…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-12
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-12.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A uniform shortfall across every instrument caused by the provider plan's history cap MUST NOT be presented as a provider data gap.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-12 is exercised; no additional condition is assumed.

### TC-COMP-039: The Coverage screen MUST NOT auto-poll and MUST show a last-updated time

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-13
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-13.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The Coverage screen MUST NOT auto-poll and MUST show a last-updated time.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-13 is exercised; no additional condition is assumed.

### TC-COMP-040: Specific missing dates MUST be available behind expansion rather than in the collapsed row

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-14
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-14.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Specific missing dates MUST be available behind expansion rather than in the collapsed row.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-14 is exercised; no additional condition is assumed.

### TC-COMP-041: Given an instrument, When its per-data-type presence is reported, Then each of the four types is present, a…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S1-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S1-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an instrument, When its per-data-type presence is reported, Then each of the four types is present, absent or unknown.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S1-1 is exercised; no additional condition is assumed.

### TC-COMP-042: Given `never_acquired`, When it is computed, Then it uses its own query over observation existence, separat…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S1-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S1-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given `never_acquired`, When it is computed, Then it uses its own query over observation existence, separate from the filtered coverage query, because conflating them produces AC-17's exact failure.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S1-2 is exercised; no additional condition is assumed.

### TC-COMP-043: Given an instrument covered to a shallower depth than the current stated depth, When coverage is read, Then…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S1-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S1-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an instrument covered to a shallower depth than the current stated depth, When coverage is read, Then it reports how far short it falls.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S1-3 is exercised; no additional condition is assumed.

### TC-COMP-044: Given a retired instrument, When coverage is read, Then it is included with a lifecycle marker rather than…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S1-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S1-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a retired instrument, When coverage is read, Then it is included with a lifecycle marker rather than omitted.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S1-4 is exercised; no additional condition is assumed.

### TC-COMP-045: Given last-acquired, When it is reported, Then it comes from `acquisition_state` stamped inside the write t…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S1-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S1-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given last-acquired, When it is reported, Then it comes from `acquisition_state` stamped inside the write transaction, not from a run's intent.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S1-5 is exercised; no additional condition is assumed.

### TC-COMP-046: Given a uniform shortfall across every instrument caused by the plan's history cap, When coverage renders,…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S1-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S1-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a uniform shortfall across every instrument caused by the plan's history cap, When coverage renders, Then it is not presented as a provider data gap.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S1-6 is exercised; no additional condition is assumed.

### TC-COMP-047: Given coverage reads, When they are issued, Then they support a symbol filter, lifecycle filter, date bound…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S1-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S1-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given coverage reads, When they are issued, Then they support a symbol filter, lifecycle filter, date bounds and cursor paging at 3000 instruments.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S1-7 is exercised; no additional condition is assumed.

### TC-COMP-048: Given an instrument checked against its own dates alone, When the set is built, Then this is explicitly avo…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S2-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S2-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an instrument checked against its own dates alone, When the set is built, Then this is explicitly avoided, because it would report zero gaps for every instrument always.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S2-1 is exercised; no additional condition is assumed.

### TC-COMP-049: Given a date before an instrument was first acquired, When it is evaluated, Then it is outside coverage rat…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S2-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S2-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a date before an instrument was first acquired, When it is evaluated, Then it is outside coverage rather than a gap.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S2-2 is exercised; no additional condition is assumed.

### TC-COMP-050: Given the availability predicate, When it is applied, Then it is evaluated inside the statement so an unava…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S2-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S2-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the availability predicate, When it is applied, Then it is evaluated inside the statement so an unavailable check returns no rows rather than a zero count.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S2-3 is exercised; no additional condition is assumed.

### TC-COMP-051: Given fundamentals or corporate actions, When gaps are considered, Then none are computed, since quarterly…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S2-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S2-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given fundamentals or corporate actions, When gaps are considered, Then none are computed, since quarterly and sporadic data carry no per-day expectation.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S2-4 is exercised; no additional condition is assumed.

### TC-COMP-052: Given a day on which every instrument is missing a bar, When gaps are computed, Then no gap is reported for…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S2-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S2-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a day on which every instrument is missing a bar, When gaps are computed, Then no gap is reported for anyone, which is the market-wide outage limitation stated plainly rather than hidden.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S2-5 is exercised; no additional condition is assumed.

### TC-COMP-053: Given gap results, When they are returned, Then a count is available for the collapsed row and specific dat…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S2-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S2-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given gap results, When they are returned, Then a count is available for the collapsed row and specific dates for expansion.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S2-6 is exercised; no additional condition is assumed.

### TC-COMP-054: Given gap detection unavailable, When the response is built, Then `gap_detection` reports unavailable toget…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S3-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S3-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given gap detection unavailable, When the response is built, Then `gap_detection` reports unavailable together with the reason, and gap counts are absent rather than zero.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S3-1 is exercised; no additional condition is assumed.

### TC-COMP-055: Given specific gap dates, When they are requested, Then they are available through expansion rather than in…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S3-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S3-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given specific gap dates, When they are requested, Then they are available through expansion rather than included in every collapsed row, keeping the default response bounded at 3000 instruments.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S3-2 is exercised; no additional condition is assumed.

### TC-COMP-056: Given a `limit` beyond the canonical bound, When it is supplied, Then `422` is returned rather than silentl…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S3-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S3-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a `limit` beyond the canonical bound, When it is supplied, Then `422` is returned rather than silently clamping.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S3-3 is exercised; no additional condition is assumed.

### TC-COMP-057: Given a lifecycle filter, When it is applied, Then retired instruments can be included or excluded explicit…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S3-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S3-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a lifecycle filter, When it is applied, Then retired instruments can be included or excluded explicitly, and the default includes them so retained history is not hidden.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S3-4 is exercised; no additional condition is assumed.

### TC-COMP-058: Given `from` later than `to`, When supplied, Then `422` is returned

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S3-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S3-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given `from` later than `to`, When supplied, Then `422` is returned.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S3-5 is exercised; no additional condition is assumed.

### TC-COMP-059: Given an absent value, When it renders, Then an em dash is shown; a measured zero renders as zero; an inapp…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S4-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S4-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an absent value, When it renders, Then an em dash is shown; a measured zero renders as zero; an inapplicable cell renders blank. These three are visually distinct.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S4-1 is exercised; no additional condition is assumed.

### TC-COMP-060: Given dates, When they render, Then they use ISO-8601, with session dates left unconverted and timestamps i…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S4-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S4-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given dates, When they render, Then they use ISO-8601, with session dates left unconverted and timestamps in America/Chicago.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S4-2 is exercised; no additional condition is assumed.

### TC-COMP-061: Given per-data-type presence, When it renders, Then present, absent and unknown use distinct badge variants…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S4-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S4-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given per-data-type presence, When it renders, Then present, absent and unknown use distinct badge variants, each carrying text plus icon or shape.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S4-3 is exercised; no additional condition is assumed.

### TC-COMP-062: Given never-acquired, When it renders, Then its copy differs from a filter matching nothing, and the never-…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S4-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S4-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given never-acquired, When it renders, Then its copy differs from a filter matching nothing, and the never-acquired state offers the run action.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S4-4 is exercised; no additional condition is assumed.

### TC-COMP-063: Given 3000 instruments, When the screen renders, Then search and filter remain usable and the table scrolls…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S4-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S4-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given 3000 instruments, When the screen renders, Then search and filter remain usable and the table scrolls within its own container rather than the page.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S4-5 is exercised; no additional condition is assumed.

### TC-COMP-064: Given a uniform depth shortfall across all instruments, When it renders, Then it reads as a plan limit rath…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S4-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S4-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a uniform depth shortfall across all instruments, When it renders, Then it reads as a plan limit rather than as a provider data gap.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S4-6 is exercised; no additional condition is assumed.

### TC-COMP-065: Given the screen in greyscale, When it renders, Then every status remains distinguishable

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E6-S4-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E6-S4-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the screen in greyscale, When it renders, Then every status remains distinguishable.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E6-S4-7 is exercised; no additional condition is assumed.

### TC-COMP-066: Per-instrument results MUST be recorded per data type, so an instrument recognised for prices but holding n…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Per-instrument results MUST be recorded per data type, so an instrument recognised for prices but holding no fundamentals is reported precisely.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-1 is exercised; no additional condition is assumed.

### TC-COMP-067: A not-found outcome MUST render distinguishably from a failed outcome, since the owner's remedy differs

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A not-found outcome MUST render distinguishably from a failed outcome, since the owner's remedy differs.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-2 is exercised; no additional condition is assumed.

### TC-COMP-068: Every stored failure reason MUST name the symbol, the data type and the provider's request id

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Every stored failure reason MUST name the symbol, the data type and the provider's request id.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-3 is exercised; no additional condition is assumed.

### TC-COMP-069: No stored or rendered failure reason MUST contain the provider credential

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- No stored or rendered failure reason MUST contain the provider credential.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-4 is exercised; no additional condition is assumed.

### TC-COMP-070: Every non-2xx API response MUST carry one envelope shape: a stable snake_case code the interface may branch…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Every non-2xx API response MUST carry one envelope shape: a stable snake_case code the interface may branch on, owner-facing prose, the resource, and a request id.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-5 is exercised; no additional condition is assumed.

### TC-COMP-071: The request id MUST be generated per request and included in every log record for that request

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The request id MUST be generated per request and included in every log record for that request.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-6 is exercised; no additional condition is assumed.

### TC-COMP-072: A `500` MUST return an internal-error code and request id only, with stack traces and driver messages going…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A `500` MUST return an internal-error code and request id only, with stack traces and driver messages going to the log.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-7 is exercised; no additional condition is assumed.

### TC-COMP-073: `GET /api/health` MUST report the most recent run's outcome, completing the payload whose liveness, databas…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-8
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-8.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- `GET /api/health` MUST report the most recent run's outcome, completing the payload whose liveness, database, credential-presence and schema-version fields E1 delivers.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-8 is exercised; no additional condition is assumed.

### TC-COMP-074: Run detail MUST collapse to one row per instrument and expand to four data types, so a 3000-instrument run…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-9
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-9.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Run detail MUST collapse to one row per instrument and expand to four data types, so a 3000-instrument run remains navigable.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-9 is exercised; no additional condition is assumed.

### TC-COMP-075: Run detail MUST support filtering by outcome and cursor paging

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-10
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-10.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Run detail MUST support filtering by outcome and cursor paging.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-10 is exercised; no additional condition is assumed.

### TC-COMP-076: Every status MUST carry a text label plus icon or shape, so the interface is readable in greyscale

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-11
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-11.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Every status MUST carry a text label plus icon or shape, so the interface is readable in greyscale.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-11 is exercised; no additional condition is assumed.

### TC-COMP-077: Migration failure detail MUST be written to the container log the owner reads and MUST NOT be constructed b…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-12
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-12.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Migration failure detail MUST be written to the container log the owner reads and MUST NOT be constructed by formatting a driver exception directly, since a connection error can include the connection string.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-12 is exercised; no additional condition is assumed.

### TC-COMP-078: Given a run of 3000 instruments, When detail is read, Then results page rather than returning in one response

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S1-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S1-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run of 3000 instruments, When detail is read, Then results page rather than returning in one response.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S1-1 is exercised; no additional condition is assumed.

### TC-COMP-079: Given run detail, When it is read, Then per-outcome counts are available without paging through every row

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S1-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S1-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given run detail, When it is read, Then per-outcome counts are available without paging through every row.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S1-2 is exercised; no additional condition is assumed.

### TC-COMP-080: Given an instrument with mixed per-data-type outcomes, When it is read, Then all four data types are return…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S1-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S1-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an instrument with mixed per-data-type outcomes, When it is read, Then all four data types are returned together for that instrument.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S1-3 is exercised; no additional condition is assumed.

### TC-COMP-081: Given run history, When it is read, Then runs return reverse-chronologically with a state filter and cursor…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S1-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S1-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given run history, When it is read, Then runs return reverse-chronologically with a state filter and cursor paging.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S1-4 is exercised; no additional condition is assumed.

### TC-COMP-082: Given a stored reason, When it is returned, Then it contains no credential, asserted by test

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S1-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S1-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a stored reason, When it is returned, Then it contains no credential, asserted by test.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S1-5 is exercised; no additional condition is assumed.

### TC-COMP-083: Given an error code, When the interface branches on it, Then the code is stable snake_case and does not cha…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S2-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S2-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an error code, When the interface branches on it, Then the code is stable snake_case and does not change with message wording.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S2-1 is exercised; no additional condition is assumed.

### TC-COMP-084: Given an unhandled exception, When it reaches the handler, Then no stack trace or driver message appears in…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S2-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S2-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an unhandled exception, When it reaches the handler, Then no stack trace or driver message appears in the response body.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S2-2 is exercised; no additional condition is assumed.

### TC-COMP-085: Given a request id, When it appears in a response, Then the same id appears in that request's log records,…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S2-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S2-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a request id, When it appears in a response, Then the same id appears in that request's log records, which is what makes a reported failure findable.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S2-3 is exercised; no additional condition is assumed.

### TC-COMP-086: Given any error response, When it is composed, Then no credential value can appear in it

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S2-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S2-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given any error response, When it is composed, Then no credential value can appear in it.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S2-4 is exercised; no additional condition is assumed.

### TC-COMP-087: Given a validation failure from Pydantic, When it is returned, Then it is mapped into the shared envelope r…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S2-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S2-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a validation failure from Pydantic, When it is returned, Then it is mapped into the shared envelope rather than FastAPI's default shape, so the interface has one shape only.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S2-5 is exercised; no additional condition is assumed.

### TC-COMP-088: Given no run has ever been recorded, When health responds, Then `most_recent_run` is `null`, which the stat…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S3-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S3-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given no run has ever been recorded, When health responds, Then `most_recent_run` is `null`, which the status region renders as no run recorded rather than as a failure.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S3-1 is exercised; no additional condition is assumed.

### TC-COMP-089: Given a run in a non-terminal state, When health responds, Then that run is reported with its current state…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S3-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S3-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run in a non-terminal state, When health responds, Then that run is reported with its current state rather than skipped in favour of an older terminal one.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S3-2 is exercised; no additional condition is assumed.

### TC-COMP-090: Given the most recent run, When it is reported, Then it carries its id, state and end timestamp, enough for…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S3-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S3-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the most recent run, When it is reported, Then it carries its id, state and end timestamp, enough for the status region without a second request.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S3-3 is exercised; no additional condition is assumed.

### TC-COMP-091: Given health is polled every 30 seconds from every screen, When this query runs, Then it is indexed so the…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S3-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S3-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given health is polled every 30 seconds from every screen, When this query runs, Then it is indexed so the poll is cheap.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S3-4 is exercised; no additional condition is assumed.

### TC-COMP-092: Given an abandoned run, When it is opened, Then a written explanation states that the run's process stopped…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S4-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S4-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an abandoned run, When it is opened, Then a written explanation states that the run's process stopped and the run was reclaimed, with the path to starting a new run.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S4-1 is exercised; no additional condition is assumed.

### TC-COMP-093: Given a failed or partial run, When it is opened, Then re-run is offered as the named recovery action

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S4-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S4-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a failed or partial run, When it is opened, Then re-run is offered as the named recovery action.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S4-2 is exercised; no additional condition is assumed.

### TC-COMP-094: Given a cancel that races completion, When `409` returns, Then the screen states the run completed rather t…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S4-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S4-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a cancel that races completion, When `409` returns, Then the screen states the run completed rather than showing a cancellation that did not happen.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S4-3 is exercised; no additional condition is assumed.

### TC-COMP-095: Given per-instrument outcomes, When they render, Then `not_found` uses a warning tier distinct from `failed…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S4-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S4-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given per-instrument outcomes, When they render, Then `not_found` uses a warning tier distinct from `failed`, since the owner's remedy differs.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S4-4 is exercised; no additional condition is assumed.

### TC-COMP-096: Given a reason, When it renders, Then it shows the data type and the provider request id, and never any cre…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S4-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S4-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a reason, When it renders, Then it shows the data type and the provider request id, and never any credential.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S4-5 is exercised; no additional condition is assumed.

### TC-COMP-097: Given a run in a non-terminal state, When the screen is open, Then it polls every 10 seconds and stops once…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S4-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S4-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run in a non-terminal state, When the screen is open, Then it polls every 10 seconds and stops once the run is terminal.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S4-6 is exercised; no additional condition is assumed.

### TC-COMP-098: Given an outcome filter, When it is applied, Then only matching instruments render, and results page rather…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E7-S4-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E7-S4-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an outcome filter, When it is applied, Then only matching instruments render, and results page rather than loading 3000 rows at once.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E7-S4-7 is exercised; no additional condition is assumed.

### TC-COMP-099: Symbols MUST be normalised on entry to a single canonical form, so that the same instrument named two ways…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Symbols MUST be normalised on entry to a single canonical form, so that the same instrument named two ways is one row.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-1 is exercised; no additional condition is assumed.

### TC-COMP-100: Adding a symbol already present and active MUST be reported as a duplicate rather than creating a second ro…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Adding a symbol already present and active MUST be reported as a duplicate rather than creating a second row; adding one already present and retired MUST reactivate it.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-2 is exercised; no additional condition is assumed.

### TC-COMP-101: Bulk entry MUST accept newline, comma, tab or semicolon separated symbols, and MUST report recognised and r…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Bulk entry MUST accept newline, comma, tab or semicolon separated symbols, and MUST report recognised and rejected entries separately before anything is added, with rejected entries never discarding accepted ones.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-3 is exercised; no additional condition is assumed.

### TC-COMP-102: `POST /api/instruments` MUST return `201` when at least one symbol was added or reactivated, `409` when all…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- `POST /api/instruments` MUST return `201` when at least one symbol was added or reactivated, `409` when all were duplicates, and `422` when all were malformed.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-4 is exercised; no additional condition is assumed.

### TC-COMP-103: Retiring an instrument MUST be a lifecycle transition, never a delete. `DELETE /api/instruments/{symbol}` M…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Retiring an instrument MUST be a lifecycle transition, never a delete. `DELETE /api/instruments/{symbol}` MUST return `404` for an unknown symbol and `409` for one already retired.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-5 is exercised; no additional condition is assumed.

### TC-COMP-104: Coverage reads MUST distinguish retired instruments rather than omitting them, so that retained history rem…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Coverage reads MUST distinguish retired instruments rather than omitting them, so that retained history remains visible.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-6 is exercised; no additional condition is assumed.

### TC-COMP-105: History depth MUST be stated as a number of years, and `GET /api/settings/history-depth` MUST return `null`…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- History depth MUST be stated as a number of years, and `GET /api/settings/history-depth` MUST return `null` when never set, distinct from zero.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-7 is exercised; no additional condition is assumed.

### TC-COMP-106: `PUT /api/settings/history-depth` MUST reject a value that is not a positive integer with `422`

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-8
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-8.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- `PUT /api/settings/history-depth` MUST reject a value that is not a positive integer with `422`.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-8 is exercised; no additional condition is assumed.

### TC-COMP-107: When no history depth is set, the Start action MUST render as `blocked` with its reason stated, rather than…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-9
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-9.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- When no history depth is set, the Start action MUST render as `blocked` with its reason stated, rather than disabled or absent.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-9 is exercised; no additional condition is assumed.

### TC-COMP-108: The instrument list MUST support search and filter at 3000 instruments, and MUST report active and retired…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-10
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-10.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The instrument list MUST support search and filter at 3000 instruments, and MUST report active and retired counts.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-10 is exercised; no additional condition is assumed.

### TC-COMP-109: The retire confirmation MUST state that a run already under way still finishes with the instrument included

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-11
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-11.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The retire confirmation MUST state that a run already under way still finishes with the instrument included.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-11 is exercised; no additional condition is assumed.

### TC-COMP-110: A depth beyond what the provider plan holds MUST be issued as stated, and a uniform shortfall across every…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-12
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-12.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A depth beyond what the provider plan holds MUST be issued as stated, and a uniform shortfall across every instrument MUST NOT be presented as a provider data gap.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-12 is exercised; no additional condition is assumed.

### TC-COMP-111: Given a symbol with surrounding whitespace or lowercase letters, When it is normalised, Then it is trimmed…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S1-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S1-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a symbol with surrounding whitespace or lowercase letters, When it is normalised, Then it is trimmed and uppercased before any lookup or insert.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S1-1 is exercised; no additional condition is assumed.

### TC-COMP-112: Given a symbol that does not match `^[A-Z][A-Z0-9.-]{0,15}$` after normalisation, When it is added, Then it…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S1-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S1-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a symbol that does not match `^[A-Z][A-Z0-9.-]{0,15}$` after normalisation, When it is added, Then it is rejected as malformed and no row is written.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S1-2 is exercised; no additional condition is assumed.

### TC-COMP-113: Given a retired instrument, When the same symbol is added again, Then the existing row's lifecycle returns…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S1-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S1-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a retired instrument, When the same symbol is added again, Then the existing row's lifecycle returns to `active` and `retired_at` is cleared, rather than a second row being created.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S1-3 is exercised; no additional condition is assumed.

### TC-COMP-114: Given a batch containing valid, duplicate and malformed symbols, When it is added, Then each symbol is clas…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S1-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S1-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a batch containing valid, duplicate and malformed symbols, When it is added, Then each symbol is classified independently and rejected entries never discard accepted ones.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S1-4 is exercised; no additional condition is assumed.

### TC-COMP-115: Given retirement of a symbol that is unknown, When it is attempted, Then it is reported as unknown and dist…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S1-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S1-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given retirement of a symbol that is unknown, When it is attempted, Then it is reported as unknown and distinguished from one already retired.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S1-5 is exercised; no additional condition is assumed.

### TC-COMP-116: Given retirement, When it completes, Then no observation, coverage segment or run result for that instrumen…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S1-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S1-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given retirement, When it completes, Then no observation, coverage segment or run result for that instrument is modified or removed.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S1-6 is exercised; no additional condition is assumed.

### TC-COMP-117: Given the list read, When it is called, Then it supports a symbol prefix filter, a lifecycle filter, and cu…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S1-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S1-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the list read, When it is called, Then it supports a symbol prefix filter, a lifecycle filter, and cursor paging, and reports active and retired counts.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S1-7 is exercised; no additional condition is assumed.

### TC-COMP-118: Given a depth value, When it is written, Then it must be a positive integer number of years and any other v…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S2-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S2-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a depth value, When it is written, Then it must be a positive integer number of years and any other value is rejected.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S2-1 is exercised; no additional condition is assumed.

### TC-COMP-119: Given the setting store, When depth is written, Then it is held in `owner_setting` as a `jsonb` value under…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S2-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S2-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the setting store, When depth is written, Then it is held in `owner_setting` as a `jsonb` value under a fixed key, so a later setting needs no schema change.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S2-2 is exercised; no additional condition is assumed.

### TC-COMP-120: Given a depth already set, When a new value is written, Then it replaces the previous one and `updated_at`…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S2-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S2-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a depth already set, When a new value is written, Then it replaces the previous one and `updated_at` advances.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S2-3 is exercised; no additional condition is assumed.

### TC-COMP-121: Given a depth read, When it returns, Then it carries the `updated_at` timestamp alongside the value, so the…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S2-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S2-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a depth read, When it returns, Then it carries the `updated_at` timestamp alongside the value, so the interface can show when it was last changed.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S2-4 is exercised; no additional condition is assumed.

### TC-COMP-122: Given the plan's five-year cap, When a larger depth is stated, Then this module records it unchanged and en…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S2-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S2-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the plan's five-year cap, When a larger depth is stated, Then this module records it unchanged and enforces no cap, because the provider returns what it holds.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S2-5 is exercised; no additional condition is assumed.

### TC-COMP-123: Given a mixed batch, When it returns `201`, Then the body reports `added`, `reactivated` and `rejected` sep…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S3-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S3-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a mixed batch, When it returns `201`, Then the body reports `added`, `reactivated` and `rejected` separately, each rejected entry carrying a reason.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S3-1 is exercised; no additional condition is assumed.

### TC-COMP-124: Given `GET /api/settings/history-depth` with no depth set, When it responds, Then `years` is `null`, distin…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S3-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S3-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given `GET /api/settings/history-depth` with no depth set, When it responds, Then `years` is `null`, distinct from zero.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S3-2 is exercised; no additional condition is assumed.

### TC-COMP-125: Given any non-2xx response from these routes, When it is returned, Then it carries the shared error envelop…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S3-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S3-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given any non-2xx response from these routes, When it is returned, Then it carries the shared error envelope with a stable snake_case code, owner-facing message, resource and request id.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S3-3 is exercised; no additional condition is assumed.

### TC-COMP-126: Given a `limit` beyond the canonical bound, When it is supplied, Then it is rejected with `422` rather than…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S3-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S3-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a `limit` beyond the canonical bound, When it is supplied, Then it is rejected with `422` rather than silently clamped.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S3-4 is exercised; no additional condition is assumed.

### TC-COMP-127: Given a cursor from a previous page, When it is supplied, Then the next page continues from it and the orde…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S3-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S3-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a cursor from a previous page, When it is supplied, Then the next page continues from it and the ordering is stable across requests.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S3-5 is exercised; no additional condition is assumed.

### TC-COMP-128: Given a bulk paste containing rejected entries, When the preview is shown, Then rejected entries are listed…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S4-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S4-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a bulk paste containing rejected entries, When the preview is shown, Then rejected entries are listed with reasons and the accepted ones remain available to add.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S4-1 is exercised; no additional condition is assumed.

### TC-COMP-129: Given the retire confirmation, When it renders, Then it uses `dialog` `confirm` and not `destructive`, and…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S4-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S4-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the retire confirmation, When it renders, Then it uses `dialog` `confirm` and not `destructive`, and its copy says retirement rather than deletion.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S4-2 is exercised; no additional condition is assumed.

### TC-COMP-130: Given a control that cannot be used, When it renders, Then it uses `button` `blocked` with the reason visib…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S4-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S4-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a control that cannot be used, When it renders, Then it uses `button` `blocked` with the reason visible, never a bare disabled control, because a disabled control hides its reason from keyboard and screen-reader users.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S4-3 is exercised; no additional condition is assumed.

### TC-COMP-131: Given the instrument table, When it renders, Then active and retired instruments are distinguishable and re…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S4-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S4-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the instrument table, When it renders, Then active and retired instruments are distinguishable and retired ones are not omitted.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S4-4 is exercised; no additional condition is assumed.

### TC-COMP-132: Given the depth input, When a non-positive or non-integer value is entered, Then the error names the operat…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S4-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S4-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the depth input, When a non-positive or non-integer value is entered, Then the error names the operation, the resource and the reason per STD-UI-19.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S4-5 is exercised; no additional condition is assumed.

### TC-COMP-133: Given the list has never been populated, When the screen renders, Then it states that no instruments are na…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S4-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S4-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the list has never been populated, When the screen renders, Then it states that no instruments are named, distinct from a filter matching nothing.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S4-6 is exercised; no additional condition is assumed.

### TC-COMP-134: Given every status shown, When it renders, Then it carries a text label plus icon or shape and is readable…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E2-S4-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E2-S4-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given every status shown, When it renders, Then it carries a text label plus icon or shape and is readable in greyscale.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E2-S4-7 is exercised; no additional condition is assumed.

### TC-COMP-135: Observations MUST be appended with the date FactorFlow observed them. The provider's filing date MAY be sto…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Observations MUST be appended with the date FactorFlow observed them. The provider's filing date MAY be stored as a descriptive attribute but MUST NEVER serve as the as-of date, because it conflates restatements of the same period.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-1 is exercised; no additional condition is assumed.

### TC-COMP-136: Appending MUST use insert-on-conflict-do-nothing against a natural key that includes a hash of the value, s…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Appending MUST use insert-on-conflict-do-nothing against a natural key that includes a hash of the value, so an identical value writes nothing and a restated value writes a new row.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-2 is exercised; no additional condition is assumed.

### TC-COMP-137: Value hashing MUST be deterministic across processes: canonical JSON with sorted keys, no whitespace and de…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Value hashing MUST be deterministic across processes: canonical JSON with sorted keys, no whitespace and decimals rendered as strings, hashed with SHA-256.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-3 is exercised; no additional condition is assumed.

### TC-COMP-138: All four data types for one instrument, the coverage segment merge, the acquisition-state stamp and the per…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- All four data types for one instrument, the coverage segment merge, the acquisition-state stamp and the per-instrument results MUST commit in a single transaction, and any failure MUST roll back the whole instrument.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-4 is exercised; no additional condition is assumed.

### TC-COMP-139: A coverage segment MUST be extended only inside the transaction that wrote the rows justifying it. No compo…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A coverage segment MUST be extended only inside the transaction that wrote the rows justifying it. No component may record intended coverage ahead of the write.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-5 is exercised; no additional condition is assumed.

### TC-COMP-140: The runner MUST compute, per instrument and data type, only the sub-ranges of the requested depth not alrea…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The runner MUST compute, per instrument and data type, only the sub-ranges of the requested depth not already covered.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-6 is exercised; no additional condition is assumed.

### TC-COMP-141: An instrument covered from a later date than the depth start MUST yield the earlier gap for fetching, which…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- An instrument covered from a later date than the depth start MUST yield the earlier gap for fetching, which is the deepening backfill.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-7 is exercised; no additional condition is assumed.

### TC-COMP-142: The depth start MUST be computed from the depth snapshotted onto the run row at request time, not from the…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-8
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-8.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The depth start MUST be computed from the depth snapshotted onto the run row at request time, not from the current setting, so a depth changed mid-queue does not redefine a run already requested.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-8 is exercised; no additional condition is assumed.

### TC-COMP-143: The trailing range since the last covered day MUST be re-fetched on every run, because the last covered day…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-9
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-9.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The trailing range since the last covered day MUST be re-fetched on every run, because the last covered day may have been a partial session, and idempotence makes re-fetching a day already held write nothing.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-9 is exercised; no additional condition is assumed.

### TC-COMP-144: Each instrument's per-data-type outcome MUST be classified as written, unchanged, not-found or failed, with…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-10
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-10.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Each instrument's per-data-type outcome MUST be classified as written, unchanged, not-found or failed, with not-found recorded per data type as well as per instrument, since the provider may recognise an instrument for prices and hold no fundamentals for it.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-10 is exercised; no additional condition is assumed.

### TC-COMP-145: An instrument not reached because the run was cancelled MUST write no row, leaving neither coverage nor a f…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-11
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-11.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- An instrument not reached because the run was cancelled MUST write no row, leaving neither coverage nor a failure record.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-11 is exercised; no additional condition is assumed.

### TC-COMP-146: The run's instrument roster MUST be read once, at claim time, so that the run's scope is fixed when it starts

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-12
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-12.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The run's instrument roster MUST be read once, at claim time, so that the run's scope is fixed when it starts.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-12 is exercised; no additional condition is assumed.

### TC-COMP-147: A run whose stated history depth is unset MUST acquire nothing and MUST be finalised as failed

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-13
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-13.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A run whose stated history depth is unset MUST acquire nothing and MUST be finalised as failed.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-13 is exercised; no additional condition is assumed.

### TC-COMP-148: Each instrument MUST be processed in its own transaction so that a run is resumable and an interruption los…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-14
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-14.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Each instrument MUST be processed in its own transaction so that a run is resumable and an interruption loses at most one instrument's work.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-14 is exercised; no additional condition is assumed.

### TC-COMP-149: No recorded failure reason MUST contain the provider credential

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-15
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-15.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- No recorded failure reason MUST contain the provider credential.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-15 is exercised; no additional condition is assumed.

### TC-COMP-150: Given any observation row, When it is written, Then `observed_on` is FactorFlow's own observation date, def…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S1-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S1-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given any observation row, When it is written, Then `observed_on` is FactorFlow's own observation date, defaulting to the current date, and is never taken from a provider field.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S1-1 is exercised; no additional condition is assumed.

### TC-COMP-151: Given an identical value re-fetched, When it is inserted with `ON CONFLICT DO NOTHING`, Then zero rows are…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S1-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S1-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an identical value re-fetched, When it is inserted with `ON CONFLICT DO NOTHING`, Then zero rows are affected and the existing row is untouched.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S1-2 is exercised; no additional condition is assumed.

### TC-COMP-152: Given a restated value for a date already held, When it is inserted, Then the differing value hash makes it…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S1-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S1-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a restated value for a date already held, When it is inserted, Then the differing value hash makes it a new row and both records coexist.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S1-3 is exercised; no additional condition is assumed.

### TC-COMP-153: Given the value hash column, When it is defined, Then it is a 32-byte digest with a length check constraint…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S1-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S1-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the value hash column, When it is defined, Then it is a 32-byte digest with a length check constraint, matching SHA-256 output.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S1-4 is exercised; no additional condition is assumed.

### TC-COMP-154: Given `daily_bar`, When it is defined, Then price and volume columns use exact numeric types rather than fl…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S1-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S1-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given `daily_bar`, When it is defined, Then price and volume columns use exact numeric types rather than floating point, so no binary rounding enters recorded history.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S1-5 is exercised; no additional condition is assumed.

### TC-COMP-155: Given every observation table, When migration `0002` is reviewed, Then it contains no `UPDATE` or `DELETE`…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S1-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S1-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given every observation table, When migration `0002` is reviewed, Then it contains no `UPDATE` or `DELETE` statement against observation history, and no later migration may introduce one.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S1-6 is exercised; no additional condition is assumed.

### TC-COMP-156: Given a query path over observations, When it is written anywhere in the codebase, Then it performs no `UPD…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S1-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S1-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a query path over observations, When it is written anywhere in the codebase, Then it performs no `UPDATE` or `DELETE` against these tables.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S1-7 is exercised; no additional condition is assumed.

### TC-COMP-157: Given two dictionaries with the same pairs in different insertion order, When each is hashed, Then the dige…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S2-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S2-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given two dictionaries with the same pairs in different insertion order, When each is hashed, Then the digests are equal, because keys are sorted.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S2-1 is exercised; no additional condition is assumed.

### TC-COMP-158: Given a `Decimal` value, When it is canonicalised, Then it renders as a string, so no float repr enters the…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S2-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S2-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a `Decimal` value, When it is canonicalised, Then it renders as a string, so no float repr enters the digest and `1.10` stays distinct from `1.1` only if the provider distinguishes them.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S2-2 is exercised; no additional condition is assumed.

### TC-COMP-159: Given a value containing a type the canonicaliser does not support, When it is hashed, Then it raises rathe…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S2-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S2-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a value containing a type the canonicaliser does not support, When it is hashed, Then it raises rather than silently coercing, since a wrong digest is worse than a failed write.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S2-3 is exercised; no additional condition is assumed.

### TC-COMP-160: Given the digest, When it is returned, Then it is 32 raw bytes, matching the column's length check constraint

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S2-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S2-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the digest, When it is returned, Then it is 32 raw bytes, matching the column's length check constraint.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S2-4 is exercised; no additional condition is assumed.

### TC-COMP-161: Given a value differing in any field, When it is hashed, Then the digest differs, so a restatement is alway…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S2-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S2-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a value differing in any field, When it is hashed, Then the digest differs, so a restatement is always recorded as new.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S2-5 is exercised; no additional condition is assumed.

### TC-COMP-162: Given the write call, When it succeeds, Then it reports rows appended per data type and whether anything ch…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S3-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S3-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the write call, When it succeeds, Then it reports rows appended per data type and whether anything changed, so the runner can classify the outcome as written or unchanged.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S3-1 is exercised; no additional condition is assumed.

### TC-COMP-163: Given existing coverage segments for an instrument and data type, When a newly written range abuts or overl…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S3-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S3-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given existing coverage segments for an instrument and data type, When a newly written range abuts or overlaps them, Then they are merged into the minimal set of non-overlapping segments.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S3-2 is exercised; no additional condition is assumed.

### TC-COMP-164: Given the `coverage_no_overlap` exclusion constraint, When a merge is attempted that would overlap, Then th…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S3-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S3-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the `coverage_no_overlap` exclusion constraint, When a merge is attempted that would overlap, Then the constraint rejects it, so the invariant is enforced by the database and not only by the merge arithmetic.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S3-3 is exercised; no additional condition is assumed.

### TC-COMP-165: Given a write that raises partway, When the transaction rolls back, Then neither observations nor a coverag…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S3-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S3-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a write that raises partway, When the transaction rolls back, Then neither observations nor a coverage segment exist for the attempted range, leaving the instrument as though never attempted.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S3-4 is exercised; no additional condition is assumed.

### TC-COMP-166: Given acquisition state, When a write commits, Then `last_acquired_at`, `last_run_id` and `last_outcome` ar…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S3-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S3-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given acquisition state, When a write commits, Then `last_acquired_at`, `last_run_id` and `last_outcome` are stamped in the same transaction.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S3-5 is exercised; no additional condition is assumed.

### TC-COMP-167: Given per-instrument results, When a write commits, Then one row per data type is recorded in the same tran…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S3-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S3-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given per-instrument results, When a write commits, Then one row per data type is recorded in the same transaction.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S3-6 is exercised; no additional condition is assumed.

### TC-COMP-168: Given inserts, When they execute, Then they use `INSERT ... ON CONFLICT DO NOTHING` and never `UPDATE` or `…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S3-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S3-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given inserts, When they execute, Then they use `INSERT ... ON CONFLICT DO NOTHING` and never `UPDATE` or `DELETE` against observation history.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S3-7 is exercised; no additional condition is assumed.

### TC-COMP-169: Given an instrument with no coverage, When planning runs, Then the whole range from `depth_start` to today…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S4-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S4-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an instrument with no coverage, When planning runs, Then the whole range from `depth_start` to today is yielded as one fetch range.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S4-1 is exercised; no additional condition is assumed.

### TC-COMP-170: Given an instrument covering the whole requested range, When planning runs, Then only the trailing range si…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S4-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S4-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an instrument covering the whole requested range, When planning runs, Then only the trailing range since `covered_to` is yielded.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S4-2 is exercised; no additional condition is assumed.

### TC-COMP-171: Given coverage with an interior gap, When planning runs, Then each missing sub-range is yielded separately…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S4-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S4-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given coverage with an interior gap, When planning runs, Then each missing sub-range is yielded separately rather than as one span covering held data.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S4-3 is exercised; no additional condition is assumed.

### TC-COMP-172: Given a depth changed while a run is queued, When that run is claimed and plans, Then it uses its own snaps…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S4-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S4-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a depth changed while a run is queued, When that run is claimed and plans, Then it uses its own snapshotted depth, so its scope is explainable from its own record.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S4-4 is exercised; no additional condition is assumed.

### TC-COMP-173: Given planning per data type, When it runs, Then reference, prices, fundamentals and corporate actions are…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S4-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S4-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given planning per data type, When it runs, Then reference, prices, fundamentals and corporate actions are planned independently, since their coverage can differ.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S4-5 is exercised; no additional condition is assumed.

### TC-COMP-174: Given `depth_start` later than today, When it is computed, Then the plan is empty rather than yielding an i…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S4-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S4-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given `depth_start` later than today, When it is computed, Then the plan is empty rather than yielding an inverted range.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S4-6 is exercised; no additional condition is assumed.

### TC-COMP-175: Given the instrument loop, When each iteration begins, Then it checks for a cancellation request and refres…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S5-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S5-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the instrument loop, When each iteration begins, Then it checks for a cancellation request and refreshes the claim heartbeat at the same point.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S5-1 is exercised; no additional condition is assumed.

### TC-COMP-176: Given a cancellation observed between instruments, When it is seen, Then the loop exits without starting th…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S5-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S5-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a cancellation observed between instruments, When it is seen, Then the loop exits without starting the next instrument and the run finalises cancelled.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S5-2 is exercised; no additional condition is assumed.

### TC-COMP-177: Given a runner whose claim has been reclaimed by the sweep, When it notices, Then it stops without writing…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S5-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S5-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a runner whose claim has been reclaimed by the sweep, When it notices, Then it stops without writing further results against that run.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S5-3 is exercised; no additional condition is assumed.

### TC-COMP-178: Given an instrument raising any provider error, When it is caught, Then it is recorded against that instrum…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S5-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S5-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an instrument raising any provider error, When it is caught, Then it is recorded against that instrument and the loop continues to the next.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S5-4 is exercised; no additional condition is assumed.

### TC-COMP-179: Given the run finishes its roster, When it finalises, Then the outcome is computed from what was written ra…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S5-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S5-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the run finishes its roster, When it finalises, Then the outcome is computed from what was written rather than from what was requested.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S5-5 is exercised; no additional condition is assumed.

### TC-COMP-180: Given no run is available to claim, When the runner polls, Then it waits and polls again at the configured…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S5-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S5-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given no run is available to claim, When the runner polls, Then it waits and polls again at the configured interval rather than exiting.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S5-6 is exercised; no additional condition is assumed.

### TC-COMP-181: Given the credential has changed since the last run, When a run is claimed, Then the provider client is reb…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S5-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S5-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the credential has changed since the last run, When a run is claimed, Then the provider client is rebuilt before the first fetch.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S5-7 is exercised; no additional condition is assumed.

### TC-COMP-182: Given a run of 3000 instruments, When it executes, Then no manual step is required and progress is observab…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S5-8
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S5-8.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run of 3000 instruments, When it executes, Then no manual step is required and progress is observable through the journal between instruments.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S5-8 is exercised; no additional condition is assumed.

### TC-COMP-183: Given data returned and rows appended, When it is classified, Then the outcome is `written` and counts towa…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S6-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S6-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given data returned and rows appended, When it is classified, Then the outcome is `written` and counts toward `succeeded`.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S6-1 is exercised; no additional condition is assumed.

### TC-COMP-184: Given data returned whose values are all already held, When it is classified, Then the outcome is `unchange…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S6-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S6-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given data returned whose values are all already held, When it is classified, Then the outcome is `unchanged` and counts toward `succeeded`, because nothing was wrong.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S6-2 is exercised; no additional condition is assumed.

### TC-COMP-185: Given an instrument unknown to the provider, When it is classified, Then the outcome is `not_found`, the ru…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S6-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S6-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an instrument unknown to the provider, When it is classified, Then the outcome is `not_found`, the run continues, and the run's outcome becomes `partial`.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S6-3 is exercised; no additional condition is assumed.

### TC-COMP-186: Given attempts exhausted by transport or server errors, When it is classified, Then the outcome is `failed`…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S6-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S6-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given attempts exhausted by transport or server errors, When it is classified, Then the outcome is `failed`, the run continues, and the run's outcome becomes `partial`.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S6-4 is exercised; no additional condition is assumed.

### TC-COMP-187: Given a `429`, When outcomes are classified, Then it never appears as an outcome, since it is flow control…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S6-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S6-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a `429`, When outcomes are classified, Then it never appears as an outcome, since it is flow control rather than a result.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S6-5 is exercised; no additional condition is assumed.

### TC-COMP-188: Given an instrument recognised for prices but not for fundamentals, When it is classified, Then prices reco…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S6-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S6-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an instrument recognised for prices but not for fundamentals, When it is classified, Then prices record `written` and fundamentals record `not_found` for the same instrument.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S6-6 is exercised; no additional condition is assumed.

### TC-COMP-189: Given a recorded reason, When it is stored, Then it carries the provider request id and no credential

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S6-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S6-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a recorded reason, When it is stored, Then it carries the provider request id and no credential.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S6-7 is exercised; no additional condition is assumed.

### TC-COMP-190: Given a run of 3000 instruments, When it executes, Then memory use stays bounded, with no accumulation of p…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S7-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S7-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run of 3000 instruments, When it executes, Then memory use stays bounded, with no accumulation of per-instrument results in process memory.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S7-1 is exercised; no additional condition is assumed.

### TC-COMP-191: Given the ingestion process is killed mid-run, When a later run starts, Then instruments already committed…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S7-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S7-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the ingestion process is killed mid-run, When a later run starts, Then instruments already committed are not re-fetched and the remainder completes.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S7-2 is exercised; no additional condition is assumed.

### TC-COMP-192: Given database connections, When a long run executes, Then connections are not leaked across instruments

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S7-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S7-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given database connections, When a long run executes, Then connections are not leaked across instruments.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S7-3 is exercised; no additional condition is assumed.

### TC-COMP-193: Given a run interrupted after some instruments, When coverage is read, Then it reports exactly the committe…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S7-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S7-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run interrupted after some instruments, When coverage is read, Then it reports exactly the committed instruments, with no partial range for the one in flight.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S7-4 is exercised; no additional condition is assumed.

### TC-COMP-194: Given no duration target exists, When this story is verified, Then completion and resumability are asserted…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E4-S7-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E4-S7-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given no duration target exists, When this story is verified, Then completion and resumability are asserted and elapsed time is recorded for information rather than asserted as a threshold.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E4-S7-5 is exercised; no additional condition is assumed.

### TC-COMP-195: The client MUST expose one operation per data type, each accepting a symbol and a date range, so that the r…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The client MUST expose one operation per data type, each accepting a symbol and a date range, so that the runner drives acquisition without knowing provider paths.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-1 is exercised; no additional condition is assumed.

### TC-COMP-196: Provider failures MUST be typed as `InstrumentNotFound`, `CredentialRejected`, `ProviderUnavailable` or `Pr…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Provider failures MUST be typed as `InstrumentNotFound`, `CredentialRejected`, `ProviderUnavailable` or `ProviderContractViolation`, since AC-11 depends on telling a 404 from a 401.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-2 is exercised; no additional condition is assumed.

### TC-COMP-197: Because the SDK discards the status code and raises only the response body, the client MUST reconstruct the…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Because the SDK discards the status code and raises only the response body, the client MUST reconstruct the distinction by parsing the error envelope, accepting either `message` or `error` as the failure field and requiring neither.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-3 is exercised; no additional condition is assumed.

### TC-COMP-198: An error payload that will not parse as JSON MUST be classified `ProviderUnavailable` and never `Instrument…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- An error payload that will not parse as JSON MUST be classified `ProviderUnavailable` and never `InstrumentNotFound`, because guessing not-found from an unparseable error would let an outage look like an empty instrument.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-4 is exercised; no additional condition is assumed.

### TC-COMP-199: A `200` response that does not validate against the model MUST be `ProviderContractViolation`, distinct fro…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A `200` response that does not validate against the model MUST be `ProviderContractViolation`, distinct from unavailability, because it means the provider changed rather than that it is down and retrying will not help.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-5 is exercised; no additional condition is assumed.

### TC-COMP-200: A `429` MUST NOT consume the attempt budget, because the request was never served

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A `429` MUST NOT consume the attempt budget, because the request was never served.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-6 is exercised; no additional condition is assumed.

### TC-COMP-201: Since Massive sends no `Retry-After`, verified against the live provider on 2026-09-05, the throttled path…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Since Massive sends no `Retry-After`, verified against the live provider on 2026-09-05, the throttled path MUST wait to the next minute boundary with jitter, matching the fixed per-minute window the provider enforces, rather than applying exponential backoff.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-7 is exercised; no additional condition is assumed.

### TC-COMP-202: Timeouts and server errors MUST be retried with exponential backoff up to a configured attempt limit, defau…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-8
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-8.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Timeouts and server errors MUST be retried with exponential backoff up to a configured attempt limit, defaulting to 3, after which the instrument is recorded failed and the run continues.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-8 is exercised; no additional condition is assumed.

### TC-COMP-203: A throttle wait budget MUST bound the throttled path so that indefinite `429` responses fail the instrument…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-9
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-9.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A throttle wait budget MUST bound the throttled path so that indefinite `429` responses fail the instrument rather than stalling the run.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-9 is exercised; no additional condition is assumed.

### TC-COMP-204: Reference data MUST capture stable instrument identity, including CIK, composite FIGI and share class FIGI,…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-10
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-10.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Reference data MUST capture stable instrument identity, including CIK, composite FIGI and share class FIGI, so identity does not rest on the ticker.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-10 is exercised; no additional condition is assumed.

### TC-COMP-205: A delisted instrument MUST remain acquirable, carrying its active flag and delisting date, so survivorship…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-11
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-11.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A delisted instrument MUST remain acquirable, carrying its active flag and delisting date, so survivorship bias does not enter the recorded history.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-11 is exercised; no additional condition is assumed.

### TC-COMP-206: Provider wire field names MUST NOT escape this component; models MUST name fields in the product's vocabulary

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-12
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-12.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Provider wire field names MUST NOT escape this component; models MUST name fields in the product's vocabulary.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-12 is exercised; no additional condition is assumed.

### TC-COMP-207: Every stored failure reason MUST carry the provider's `request_id` alongside the symbol and data type, and…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-13
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-13.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Every stored failure reason MUST carry the provider's `request_id` alongside the symbol and data type, and MUST NOT contain the credential.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-13 is exercised; no additional condition is assumed.

### TC-COMP-208: The client's interface MUST NOT foreclose the M3 streaming half of the same provider contract

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-14
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-14.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The client's interface MUST NOT foreclose the M3 streaming half of the same provider contract.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-14 is exercised; no additional condition is assumed.

### TC-COMP-209: Given the SDK's default construction, When the client is built, Then the defaults the component design iden…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S1-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S1-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the SDK's default construction, When the client is built, Then the defaults the component design identifies as requiring override are overridden explicitly rather than inherited.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S1-1 is exercised; no additional condition is assumed.

### TC-COMP-210: Given daily aggregates, When they are requested, Then the multiplier is `1`, the timespan is `day`, and `fr…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S1-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S1-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given daily aggregates, When they are requested, Then the multiplier is `1`, the timespan is `day`, and `from` and `to` are inclusive `YYYY-MM-DD`.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S1-2 is exercised; no additional condition is assumed.

### TC-COMP-211: Given a paged response, When `next_url` is present, Then paging follows it until exhausted and the caller s…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S1-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S1-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a paged response, When `next_url` is present, Then paging follows it until exhausted and the caller sees one complete result.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S1-3 is exercised; no additional condition is assumed.

### TC-COMP-212: Given the ticker reference endpoint, When it is called, Then the single-ticker form is used, since the inst…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S1-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S1-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the ticker reference endpoint, When it is called, Then the single-ticker form is used, since the instrument list is the owner's and reference data is fetched per named symbol.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S1-4 is exercised; no additional condition is assumed.

### TC-COMP-213: Given the market-status endpoint, When acquisition runs, Then it is never called, because it is forward-loo…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S1-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S1-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the market-status endpoint, When acquisition runs, Then it is never called, because it is forward-looking only and trading days are derived from acquired data instead.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S1-5 is exercised; no additional condition is assumed.

### TC-COMP-214: Given the credential, When the client is constructed, Then it is passed to the SDK and never written to a l…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S1-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S1-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the credential, When the client is constructed, Then it is passed to the SDK and never written to a log record.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S1-6 is exercised; no additional condition is assumed.

### TC-COMP-215: Given a daily bar, When it is parsed, Then `t`, `o`, `h`, `l`, `c`, `v`, `vw` and `n` map to named fields f…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S2-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S2-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a daily bar, When it is parsed, Then `t`, `o`, `h`, `l`, `c`, `v`, `vw` and `n` map to named fields for timestamp, open, high, low, close, volume, volume-weighted average price and transaction count.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S2-1 is exercised; no additional condition is assumed.

### TC-COMP-216: Given a bar timestamp in Unix milliseconds, When it is parsed, Then it converts to a session date without t…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S2-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S2-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a bar timestamp in Unix milliseconds, When it is parsed, Then it converts to a session date without timezone ambiguity.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S2-2 is exercised; no additional condition is assumed.

### TC-COMP-217: Given a monetary or ratio value, When it is parsed, Then it is held as `Decimal` rather than `float`, so no…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S2-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S2-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a monetary or ratio value, When it is parsed, Then it is held as `Decimal` rather than `float`, so no binary rounding enters recorded history.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S2-3 is exercised; no additional condition is assumed.

### TC-COMP-218: Given a response missing a field the model requires, When it is parsed, Then validation fails and the failu…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S2-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S2-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a response missing a field the model requires, When it is parsed, Then validation fails and the failure is classified `ProviderContractViolation` by CAP-001-E3-S3 rather than passing a partial record on.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S2-4 is exercised; no additional condition is assumed.

### TC-COMP-219: Given an optional field absent, When it is parsed, Then the model records its absence rather than substitut…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S2-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S2-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an optional field absent, When it is parsed, Then the model records its absence rather than substituting a zero, because absent and zero are different facts.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S2-5 is exercised; no additional condition is assumed.

### TC-COMP-220: Given an envelope whose `status` is `"NOT_FOUND"`, When it is classified, Then it becomes `InstrumentNotFou…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S3-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S3-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an envelope whose `status` is `"NOT_FOUND"`, When it is classified, Then it becomes `InstrumentNotFound`.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S3-1 is exercised; no additional condition is assumed.

### TC-COMP-221: Given an envelope whose `error` names an API-key problem, When it is classified, Then it becomes `Credentia…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S3-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S3-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an envelope whose `error` names an API-key problem, When it is classified, Then it becomes `CredentialRejected`, and the credential value appears in neither the exception nor any log record.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S3-2 is exercised; no additional condition is assumed.

### TC-COMP-222: Given an envelope that parses but matches no known case, When it is classified, Then it becomes `ProviderUn…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S3-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S3-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an envelope that parses but matches no known case, When it is classified, Then it becomes `ProviderUnavailable`, the safe default.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S3-3 is exercised; no additional condition is assumed.

### TC-COMP-223: Given a `ProviderContractViolation`, When the runner handles it, Then retrying is not attempted, because it…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S3-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S3-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a `ProviderContractViolation`, When the runner handles it, Then retrying is not attempted, because it means the provider changed rather than that it is down.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S3-4 is exercised; no additional condition is assumed.

### TC-COMP-224: Given every typed error, When it is constructed, Then `provider_request_id` is populated from the response…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S3-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S3-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given every typed error, When it is constructed, Then `provider_request_id` is populated from the response when present and `None` when absent, never fabricated.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S3-5 is exercised; no additional condition is assumed.

### TC-COMP-225: Given a `429`, When it is seen, Then it is not raised as a failure at all but handed to the governor as flo…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S3-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S3-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a `429`, When it is seen, Then it is not raised as a failure at all but handed to the governor as flow control.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S3-6 is exercised; no additional condition is assumed.

### TC-COMP-226: Given a provider that does state a delay, When throttled, Then the stated delay is honoured. This path is d…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S4-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S4-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a provider that does state a delay, When throttled, Then the stated delay is honoured. This path is dead code against Massive and is retained because the governor is provider-agnostic.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S4-1 is exercised; no additional condition is assumed.

### TC-COMP-227: Given several retries queued behind the same minute boundary, When they wait, Then full jitter is applied s…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S4-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S4-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given several retries queued behind the same minute boundary, When they wait, Then full jitter is applied so they do not resynchronise onto the same instant.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S4-2 is exercised; no additional condition is assumed.

### TC-COMP-228: Given a `FATAL` outcome such as 404 or 401, When it is seen, Then no wait and no retry occur and it re-rais…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S4-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S4-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a `FATAL` outcome such as 404 or 401, When it is seen, Then no wait and no retry occur and it re-raises to the caller immediately.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S4-3 is exercised; no additional condition is assumed.

### TC-COMP-229: Given the attempt limit is exhausted for one instrument and data type, When exhaustion occurs, Then that in…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S4-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S4-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the attempt limit is exhausted for one instrument and data type, When exhaustion occurs, Then that instrument is recorded failed and the run continues.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S4-4 is exercised; no additional condition is assumed.

### TC-COMP-230: Given the configured request budget, When the plan has no limit, Then pacing introduces no artificial delay…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S4-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S4-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the configured request budget, When the plan has no limit, Then pacing introduces no artificial delay, since the target plan is unlimited as verified 2026-09-05.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S4-5 is exercised; no additional condition is assumed.

### TC-COMP-231: Given the throttle wait budget, When it is configured, Then it bounds the throttled path so `OPS-LOOP-001`'…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S4-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S4-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the throttle wait budget, When it is configured, Then it bounds the throttled path so `OPS-LOOP-001`'s unbounded-loop failure cannot occur.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S4-6 is exercised; no additional condition is assumed.

### TC-COMP-232: Given a provider response without a `request_id`, When a reason is composed, Then the reason records its ab…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S5-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S5-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a provider response without a `request_id`, When a reason is composed, Then the reason records its absence rather than fabricating or omitting the field silently.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S5-1 is exercised; no additional condition is assumed.

### TC-COMP-233: Given a `CredentialRejected` error, When its reason is composed, Then it states that the credential was rej…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S5-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S5-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a `CredentialRejected` error, When its reason is composed, Then it states that the credential was rejected without echoing any part of the value.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S5-2 is exercised; no additional condition is assumed.

### TC-COMP-234: Given a reason string, When it is stored, Then it is bounded in length so a pathological provider message c…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S5-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S5-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a reason string, When it is stored, Then it is bounded in length so a pathological provider message cannot bloat the run record.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S5-3 is exercised; no additional condition is assumed.

### TC-COMP-235: Given any of the four typed errors, When a reason is composed, Then the resulting text distinguishes which…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E3-S5-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E3-S5-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given any of the four typed errors, When a reason is composed, Then the resulting text distinguishes which type it came from, so `not_found` is separable from `failed` downstream.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E3-S5-4 is exercised; no additional condition is assumed.

### TC-COMP-236: The run state machine MUST define exactly the states requested, running, cancelling, succeeded, partial, fa…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The run state machine MUST define exactly the states requested, running, cancelling, succeeded, partial, failed, cancelled and abandoned, with illegal transitions raising rather than being written.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-1 is exercised; no additional condition is assumed.

### TC-COMP-237: The claim MUST be a single statement claiming the oldest requested run only when no run is running or cance…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The claim MUST be a single statement claiming the oldest requested run only when no run is running or cancelling, so that request order is execution order.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-2 is exercised; no additional condition is assumed.

### TC-COMP-238: A partial unique index MUST make a concurrent second claim fail on a unique violation rather than start a s…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A partial unique index MUST make a concurrent second claim fail on a unique violation rather than start a second run.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-3 is exercised; no additional condition is assumed.

### TC-COMP-239: The run outcome MUST be computed from what was actually written rather than from what was requested

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The run outcome MUST be computed from what was actually written rather than from what was requested.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-4 is exercised; no additional condition is assumed.

### TC-COMP-240: A run MUST be recorded succeeded only when every instrument in its roster wrote; otherwise partial when som…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A run MUST be recorded succeeded only when every instrument in its roster wrote; otherwise partial when some wrote, or failed when none wrote or the run itself failed.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-5 is exercised; no additional condition is assumed.

### TC-COMP-241: Cancellation of a running run MUST be recorded as a request against the run rather than acting on the proce…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Cancellation of a running run MUST be recorded as a request against the run rather than acting on the process, and MUST be observed by the runner between instruments, so it takes effect within one instrument's work.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-6 is exercised; no additional condition is assumed.

### TC-COMP-242: A cancelled run MUST be terminal and distinct from failed, and coverage already committed MUST be retained

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A cancelled run MUST be terminal and distinct from failed, and coverage already committed MUST be retained.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-7 is exercised; no additional condition is assumed.

### TC-COMP-243: Cancelling a run still in the requested state MUST move it directly to cancelled as a state transition rath…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-8
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-8.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Cancelling a run still in the requested state MUST move it directly to cancelled as a state transition rather than cooperative cancellation, since there is no runner to signal, and MUST leave an active run unaffected.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-8 is exercised; no additional condition is assumed.

### TC-COMP-244: Cancelling a run that has already reached a terminal state MUST return a conflict naming the run's actual s…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-9
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-9.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Cancelling a run that has already reached a terminal state MUST return a conflict naming the run's actual state, so the owner is told it completed rather than shown a cancellation that did not happen.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-9 is exercised; no additional condition is assumed.

### TC-COMP-245: A runner MUST refresh a heartbeat on the run it holds, at the same point it checks for cancellation

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-10
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-10.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A runner MUST refresh a heartbeat on the run it holds, at the same point it checks for cancellation.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-10 is exercised; no additional condition is assumed.

### TC-COMP-246: A periodic sweep in the application container MUST release any claim whose heartbeat is stale past the conf…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-11
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-11.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A periodic sweep in the application container MUST release any claim whose heartbeat is stale past the configured window and record the run as abandoned, terminal and distinct from both failed and cancelled.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-11 is exercised; no additional condition is assumed.

### TC-COMP-247: The sweep MUST be idempotent and MUST NOT prevent a subsequent run from starting once it has released a sta…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-12
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-12.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The sweep MUST be idempotent and MUST NOT prevent a subsequent run from starting once it has released a stale claim.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-12 is exercised; no additional condition is assumed.

### TC-COMP-248: A runner whose claim has been reclaimed MUST stop without writing further results against that run

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-13
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-13.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A runner whose claim has been reclaimed MUST stop without writing further results against that run.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-13 is exercised; no additional condition is assumed.

### TC-COMP-249: The start endpoint MUST refuse with a conflict and create no run when no history depth is set, and separate…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-14
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-14.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The start endpoint MUST refuse with a conflict and create no run when no history depth is set, and separately when no instrument is active, naming which precondition failed.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-14 is exercised; no additional condition is assumed.

### TC-COMP-250: The start endpoint MUST accept a request while a run is active, returning the new run as requested together…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-15
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-15.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The start endpoint MUST accept a request while a run is active, returning the new run as requested together with the active run it is queued behind, and MUST NOT reject, merge or start it concurrently.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-15 is exercised; no additional condition is assumed.

### TC-COMP-251: Run outcomes MUST render in the tiers STD-UI-12 fixes, with partial never good, cancelled never critical, a…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-16
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-16.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Run outcomes MUST render in the tiers STD-UI-12 fixes, with partial never good, cancelled never critical, and abandoned distinct and serious.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-16 is exercised; no additional condition is assumed.

### TC-COMP-252: The abandoned state MUST be explained to the owner rather than presented as a bare state, together with the…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-17
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-17.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The abandoned state MUST be explained to the owner rather than presented as a bare state, together with the path to a new run.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-17 is exercised; no additional condition is assumed.

### TC-COMP-253: Given `states.py`, When a transition is requested, Then it is checked against a mapping of legal transition…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S1-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S1-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given `states.py`, When a transition is requested, Then it is checked against a mapping of legal transitions and an illegal one raises before any write.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S1-1 is exercised; no additional condition is assumed.

### TC-COMP-254: Given the database, When a run row is written, Then check constraints `acquisition_run_state_known`, `acqui…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S1-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S1-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the database, When a run row is written, Then check constraints `acquisition_run_state_known`, `acquisition_run_claim_agrees` and `acquisition_run_terminal_has_end` act as the backstop behind the application check.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S1-2 is exercised; no additional condition is assumed.

### TC-COMP-255: Given a run row, When it is created, Then it snapshots `history_depth_years` at request time, so a depth ch…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S1-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S1-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run row, When it is created, Then it snapshots `history_depth_years` at request time, so a depth changed while queued does not redefine it.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S1-3 is exercised; no additional condition is assumed.

### TC-COMP-256: Given at most one active run, When the index is defined, Then a partial unique index over runs in `running`…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S1-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S1-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given at most one active run, When the index is defined, Then a partial unique index over runs in `running` or `cancelling` enforces it.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S1-4 is exercised; no additional condition is assumed.

### TC-COMP-257: Given FIFO ordering, When requested runs are queried, Then an index on `requested_at` serves the claim's or…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S1-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S1-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given FIFO ordering, When requested runs are queried, Then an index on `requested_at` serves the claim's ordering.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S1-5 is exercised; no additional condition is assumed.

### TC-COMP-258: Given a terminal run, When it is written, Then it carries an end timestamp, enforced by constraint

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S1-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S1-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a terminal run, When it is written, Then it carries an end timestamp, enforced by constraint.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S1-6 is exercised; no additional condition is assumed.

### TC-COMP-259: Given `run_instrument_result`, When rows are written, Then each carries instrument, data type, outcome and…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S1-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S1-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given `run_instrument_result`, When rows are written, Then each carries instrument, data type, outcome and reason, supporting per-data-type reporting.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S1-7 is exercised; no additional condition is assumed.

### TC-COMP-260: Given several requested runs, When claims occur, Then they are claimed oldest-first by `requested_at`, so r…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S2-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S2-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given several requested runs, When claims occur, Then they are claimed oldest-first by `requested_at`, so request order is execution order.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S2-1 is exercised; no additional condition is assumed.

### TC-COMP-261: Given no claimable run, When the runner polls, Then it receives no row and waits at the configured interval…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S2-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S2-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given no claimable run, When the runner polls, Then it receives no row and waits at the configured interval rather than erroring.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S2-2 is exercised; no additional condition is assumed.

### TC-COMP-262: Given a claim, When it succeeds, Then it sets `state`, `started_at`, `claimed_by` and `heartbeat_at` in the…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S2-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S2-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a claim, When it succeeds, Then it sets `state`, `started_at`, `claimed_by` and `heartbeat_at` in the same statement.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S2-3 is exercised; no additional condition is assumed.

### TC-COMP-263: Given a claim, When it returns, Then it yields the run id and the snapshotted `history_depth_years`, so the…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S2-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S2-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a claim, When it returns, Then it yields the run id and the snapshotted `history_depth_years`, so the runner plans from the run's own record.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S2-4 is exercised; no additional condition is assumed.

### TC-COMP-264: Given `FOR UPDATE SKIP LOCKED`, When two runners contend, Then neither blocks on the other's row

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S2-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S2-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given `FOR UPDATE SKIP LOCKED`, When two runners contend, Then neither blocks on the other's row.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S2-5 is exercised; no additional condition is assumed.

### TC-COMP-265: Given a queued request, When it is created while a run is active, Then the response reports the active run…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S2-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S2-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a queued request, When it is created while a run is active, Then the response reports the active run it is queued behind.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S2-6 is exercised; no additional condition is assumed.

### TC-COMP-266: Given a running run, When cancellation is requested, Then the run moves to `cancelling` and only reaches `c…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S3-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S3-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a running run, When cancellation is requested, Then the run moves to `cancelling` and only reaches `cancelled` once the runner acknowledges it.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S3-1 is exercised; no additional condition is assumed.

### TC-COMP-267: Given a cancelled run, When coverage is read afterwards, Then instruments it committed retain their coverag…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S3-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S3-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a cancelled run, When coverage is read afterwards, Then instruments it committed retain their coverage and instruments never reached are simply absent.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S3-2 is exercised; no additional condition is assumed.

### TC-COMP-268: Given a run cancelled while queued, When an active run is executing, Then the active run is entirely unaffe…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S3-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S3-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run cancelled while queued, When an active run is executing, Then the active run is entirely unaffected.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S3-3 is exercised; no additional condition is assumed.

### TC-COMP-269: Given a run that completed between the owner's decision and the request arriving, When cancellation is atte…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S3-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S3-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run that completed between the owner's decision and the request arriving, When cancellation is attempted, Then the owner is told it completed rather than shown a cancellation that did not happen.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S3-4 is exercised; no additional condition is assumed.

### TC-COMP-270: Given a run where every instrument recorded `written` or `unchanged`, When it finalises, Then it is `succee…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S3-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S3-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run where every instrument recorded `written` or `unchanged`, When it finalises, Then it is `succeeded`.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S3-5 is exercised; no additional condition is assumed.

### TC-COMP-271: Given a run where at least one instrument recorded `not_found` or `failed` and at least one wrote, When it…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S3-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S3-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run where at least one instrument recorded `not_found` or `failed` and at least one wrote, When it finalises, Then it is `partial` and never `succeeded`.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S3-6 is exercised; no additional condition is assumed.

### TC-COMP-272: Given a run where nothing wrote, When it finalises, Then it is `failed`

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S3-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S3-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run where nothing wrote, When it finalises, Then it is `failed`.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S3-7 is exercised; no additional condition is assumed.

### TC-COMP-273: Given a live runner refreshing its heartbeat, When the sweep runs, Then that run is not reclaimed

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S4-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S4-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a live runner refreshing its heartbeat, When the sweep runs, Then that run is not reclaimed.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S4-1 is exercised; no additional condition is assumed.

### TC-COMP-274: Given a run in `cancelling` whose runner died, When the sweep runs, Then it is reclaimed as `abandoned`, si…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S4-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S4-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run in `cancelling` whose runner died, When the sweep runs, Then it is reclaimed as `abandoned`, since that state is also claimable-stale.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S4-2 is exercised; no additional condition is assumed.

### TC-COMP-275: Given coverage written before an interruption, When the run is reclaimed, Then that coverage stands, becaus…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S4-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S4-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given coverage written before an interruption, When the run is reclaimed, Then that coverage stands, because the per-instrument commit boundary makes it independently valid.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S4-3 is exercised; no additional condition is assumed.

### TC-COMP-276: Given the sweep placed in the application container, When ingestion is stopped entirely, Then reclaim still…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S4-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S4-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the sweep placed in the application container, When ingestion is stopped entirely, Then reclaim still happens, which is the property that makes AC-20 hold for a crash-looping container.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S4-4 is exercised; no additional condition is assumed.

### TC-COMP-277: Given two sweeps running concurrently, When both find the same stale claim, Then exactly one reclaims it an…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S4-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S4-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given two sweeps running concurrently, When both find the same stale claim, Then exactly one reclaims it and the other is a no-op.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S4-5 is exercised; no additional condition is assumed.

### TC-COMP-278: Given a reclaimed run, When the original runner attempts a write, Then the write is rejected because its cl…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S4-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S4-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a reclaimed run, When the original runner attempts a write, Then the write is rejected because its claim no longer matches.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S4-6 is exercised; no additional condition is assumed.

### TC-COMP-279: Given both preconditions unmet, When a run is requested, Then one `409` is returned naming which preconditi…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S5-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S5-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given both preconditions unmet, When a run is requested, Then one `409` is returned naming which precondition failed, and the response is deterministic rather than order-dependent.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S5-1 is exercised; no additional condition is assumed.

### TC-COMP-280: Given a cancellation of an already-terminal run, When it is requested, Then `409 run_already_terminal` is r…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S5-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S5-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a cancellation of an already-terminal run, When it is requested, Then `409 run_already_terminal` is returned carrying the run's actual state.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S5-2 is exercised; no additional condition is assumed.

### TC-COMP-281: Given a cancellation of an unknown run id, When it is requested, Then `404` is returned

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S5-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S5-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a cancellation of an unknown run id, When it is requested, Then `404` is returned.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S5-3 is exercised; no additional condition is assumed.

### TC-COMP-282: Given `GET /api/acquisition-runs`, When it is called, Then runs are returned reverse-chronologically with a…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S5-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S5-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given `GET /api/acquisition-runs`, When it is called, Then runs are returned reverse-chronologically with a state filter, limit and cursor.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S5-4 is exercised; no additional condition is assumed.

### TC-COMP-283: Given `GET /api/acquisition-runs/{id}`, When it is called, Then it returns the run, its counts and its per-…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S5-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S5-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given `GET /api/acquisition-runs/{id}`, When it is called, Then it returns the run, its counts and its per-instrument per-data-type results, with an outcome filter and paging.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S5-5 is exercised; no additional condition is assumed.

### TC-COMP-284: Given any refusal, When it is returned, Then no run row is created, asserted by count

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S5-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S5-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given any refusal, When it is returned, Then no run row is created, asserted by count.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S5-6 is exercised; no additional condition is assumed.

### TC-COMP-285: Given any run in a non-terminal state, When the screen is open, Then it polls every 10 seconds, and polling…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S6-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S6-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given any run in a non-terminal state, When the screen is open, Then it polls every 10 seconds, and polling stops when no run is non-terminal.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S6-1 is exercised; no additional condition is assumed.

### TC-COMP-286: Given the tier mapping, When each state renders, Then `requested` is neutral, `running` active, `cancelling…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S6-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S6-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the tier mapping, When each state renders, Then `requested` is neutral, `running` active, `cancelling` warning, `succeeded` good, `partial` warning, `failed` critical, `cancelled` neutral and `abandoned` serious.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S6-2 is exercised; no additional condition is assumed.

### TC-COMP-287: Given no history depth set, When Start renders, Then it is `blocked` with its own distinct reason, mirrorin…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S6-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S6-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given no history depth set, When Start renders, Then it is `blocked` with its own distinct reason, mirroring the no-instruments treatment.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S6-3 is exercised; no additional condition is assumed.

### TC-COMP-288: Given a run id in the list, When it renders, Then it links to run detail as an anchor, so middle-click and…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S6-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S6-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run id in the list, When it renders, Then it links to run detail as an anchor, so middle-click and open-in-new-tab work.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S6-4 is exercised; no additional condition is assumed.

### TC-COMP-289: Given a cancel confirmation for a queued run, When it renders, Then its copy differs from the running-run c…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S6-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S6-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a cancel confirmation for a queued run, When it renders, Then its copy differs from the running-run confirmation, since the effects differ.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S6-5 is exercised; no additional condition is assumed.

### TC-COMP-290: Given a cancel that races a completion, When `409` returns, Then the screen tells the owner the run complet…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S6-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S6-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a cancel that races a completion, When `409` returns, Then the screen tells the owner the run completed rather than showing a cancellation that did not happen.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S6-6 is exercised; no additional condition is assumed.

### TC-COMP-291: Given no run has ever been recorded, When the list renders, Then it says so plainly rather than appearing e…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E5-S6-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E5-S6-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given no run has ever been recorded, When the list renders, Then it says so plainly rather than appearing empty and healthy.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E5-S6-7 is exercised; no additional condition is assumed.

### TC-COMP-292: The schema MUST hold all capability state in one PostgreSQL database, with no part of it split across anoth…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The schema MUST hold all capability state in one PostgreSQL database, with no part of it split across another store.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-1 is exercised; no additional condition is assumed.

### TC-COMP-293: `applied_migrations` MUST be created by the migrator before the first migration file runs, rather than by a…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- `applied_migrations` MUST be created by the migrator before the first migration file runs, rather than by a migration file, because the migrator reads it to decide what to apply.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-2 is exercised; no additional condition is assumed.

### TC-COMP-294: Migrations MUST be applied in ascending numbered order, each recorded with its version, name and checksum o…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Migrations MUST be applied in ascending numbered order, each recorded with its version, name and checksum on success. A correction MUST be a new file, never an edit to a file already applied.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-3 is exercised; no additional condition is assumed.

### TC-COMP-295: When the store carries a migration number this build does not know, the container MUST exit non-zero and th…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- When the store carries a migration number this build does not know, the container MUST exit non-zero and the API MUST never bind.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-4 is exercised; no additional condition is assumed.

### TC-COMP-296: Migration MUST be serialised by an advisory lock, so that two containers starting concurrently cannot apply…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Migration MUST be serialised by an advisory lock, so that two containers starting concurrently cannot apply the same migration twice.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-5 is exercised; no additional condition is assumed.

### TC-COMP-297: The observation tables MUST carry a natural-key uniqueness constraint including a value hash, so that appen…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The observation tables MUST carry a natural-key uniqueness constraint including a value hash, so that appending an identical value is a no-op and appending a restated value adds a row.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-6 is exercised; no additional condition is assumed.

### TC-COMP-298: A missing required configuration value MUST fail process start with a message naming the environment variab…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A missing required configuration value MUST fail process start with a message naming the environment variable but never its value.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-7 is exercised; no additional condition is assumed.

### TC-COMP-299: The credential MUST be held in memory only, redacted from every log record, and absent from every API respo…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-8
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-8.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The credential MUST be held in memory only, redacted from every log record, and absent from every API response.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-8 is exercised; no additional condition is assumed.

### TC-COMP-300: The credential MUST be supplied to both containers: the ingestion process uses its value, and the applicati…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-9
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-9.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The credential MUST be supplied to both containers: the ingestion process uses its value, and the application process reads only whether it is set, so that health can report presence without the application ever reading the value.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-9 is exercised; no additional condition is assumed.

### TC-COMP-301: The credential MUST be rotatable without a restart: the ingestion process re-reads it when it claims a run…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-10
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-10.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The credential MUST be rotatable without a restart: the ingestion process re-reads it when it claims a run and rebuilds its provider client when the value has changed.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-10 is exercised; no additional condition is assumed.

### TC-COMP-302: Both processes MUST emit structured log records only, with no direct console output

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-11
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-11.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Both processes MUST emit structured log records only, with no direct console output.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-11 is exercised; no additional condition is assumed.

### TC-COMP-303: The application shell MUST present four destinations in the order Coverage, Instruments, Runs, Settings, wi…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-12
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-12.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The application shell MUST present four destinations in the order Coverage, Instruments, Runs, Settings, with run detail as a child route rather than a fifth destination, and MUST NOT include a user menu, account area or sign-in, since no principal is assumed anywhere.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-12 is exercised; no additional condition is assumed.

### TC-COMP-304: A persistent status region MUST appear on every screen, poll health every 30 seconds, and show its last-upd…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-13
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-13.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A persistent status region MUST appear on every screen, poll health every 30 seconds, and show its last-updated time.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-13 is exercised; no additional condition is assumed.

### TC-COMP-305: The status region MUST be sized to take a third line later without restructuring, since the trading-environ…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-14
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-14.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The status region MUST be sized to take a third line later without restructuring, since the trading-environment indicator lands there when a capability introduces one.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-14 is exercised; no additional condition is assumed.

### TC-COMP-306: A failure to reach the API MUST render as a named unreachable state identifying the likely cause and where…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-15
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-15.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- A failure to reach the API MUST render as a named unreachable state identifying the likely cause and where to look, rather than surfacing a transport failure, so that a refused start is legible rather than blank.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-15 is exercised; no additional condition is assumed.

### TC-COMP-307: `GET /api/health` MUST report liveness, database reachability, credential presence as a boolean and schema…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-16
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-16.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- `GET /api/health` MUST report liveness, database reachability, credential presence as a boolean and schema version. Its most-recent-run field is delivered by E7.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-16 is exercised; no additional condition is assumed.

### TC-COMP-308: The status region MUST render correctly before any run exists, since the shell ships before the EPICs that…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-17
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-17.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- The status region MUST render correctly before any run exists, since the shell ships before the EPICs that create runs.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-17 is exercised; no additional condition is assumed.

### TC-COMP-309: Given migration `0001`, When it is applied, Then the `btree_gist` extension is created, since `coverage_seg…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S1-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S1-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given migration `0001`, When it is applied, Then the `btree_gist` extension is created, since `coverage_segment`'s exclusion constraint in a later migration depends on it.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S1-1 is exercised; no additional condition is assumed.

### TC-COMP-310: Given the `instrument` table, When a row is inserted, Then `symbol` must be uppercase and match `^[A-Z][A-Z…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S1-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S1-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the `instrument` table, When a row is inserted, Then `symbol` must be uppercase and match `^[A-Z][A-Z0-9.-]{0,15}$`, enforced by check constraints rather than by application code.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S1-2 is exercised; no additional condition is assumed.

### TC-COMP-311: Given the `instrument` table, When `lifecycle` is written, Then it must be `active` or `retired`, and `reti…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S1-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S1-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the `instrument` table, When `lifecycle` is written, Then it must be `active` or `retired`, and `retired_at` must be non-null if and only if `lifecycle` is `retired`.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S1-3 is exercised; no additional condition is assumed.

### TC-COMP-312: Given `owner_setting`, When the history depth is stored, Then it is held as a `jsonb` value keyed by `setti…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S1-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S1-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given `owner_setting`, When the history depth is stored, Then it is held as a `jsonb` value keyed by `setting_key`, so a later setting needs no schema change.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S1-4 is exercised; no additional condition is assumed.

### TC-COMP-313: Given `applied_migrations`, When a migration is recorded, Then the row carries `version` as primary key, `n…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S1-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S1-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given `applied_migrations`, When a migration is recorded, Then the row carries `version` as primary key, `name`, `checksum` and `applied_at`.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S1-5 is exercised; no additional condition is assumed.

### TC-COMP-314: Given migration `0001` applied twice, When the second application is attempted, Then it is skipped because…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S1-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S1-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given migration `0001` applied twice, When the second application is attempted, Then it is skipped because its version is already recorded, and no statement runs.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S1-6 is exercised; no additional condition is assumed.

### TC-COMP-315: Given a schema already current, When the migrator runs, Then it exits `0` logging `schema current at versio…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S2-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S2-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a schema already current, When the migrator runs, Then it exits `0` logging `schema current at version N` and applies nothing.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S2-1 is exercised; no additional condition is assumed.

### TC-COMP-316: Given an unreachable database or rejected credentials, When the migrator runs, Then it exits `1` with a mes…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S2-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S2-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an unreachable database or rejected credentials, When the migrator runs, Then it exits `1` with a message naming the host and database but never the password.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S2-2 is exercised; no additional condition is assumed.

### TC-COMP-317: Given a store at a version this build does not carry, When the migrator runs, Then it exits `2` stating the…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S2-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S2-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a store at a version this build does not carry, When the migrator runs, Then it exits `2` stating the store's version and the highest this build carries.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S2-3 is exercised; no additional condition is assumed.

### TC-COMP-318: Given a recorded migration whose checksum differs from the file this build carries, When the migrator runs,…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S2-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S2-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a recorded migration whose checksum differs from the file this build carries, When the migrator runs, Then it exits `3`, because a file that has been applied must never be edited.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S2-4 is exercised; no additional condition is assumed.

### TC-COMP-319: Given a migration that fails partway, When the failure occurs, Then the migrator exits `4` and no change fr…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S2-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S2-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a migration that fails partway, When the failure occurs, Then the migrator exits `4` and no change from that migration is committed, since each migration runs in its own transaction.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S2-5 is exercised; no additional condition is assumed.

### TC-COMP-320: Given any migrator message, When it is emitted, Then it goes through the structured logger at `error` level…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S2-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S2-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given any migrator message, When it is emitted, Then it goes through the structured logger at `error` level carrying the migration version as a field, never through `print`.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S2-6 is exercised; no additional condition is assumed.

### TC-COMP-321: Given a connection failure, When its message is constructed, Then it is built from known-safe fields rather…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S2-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S2-7.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a connection failure, When its message is constructed, Then it is built from known-safe fields rather than by formatting the driver exception, because a `psycopg` connection error can include the connection string.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S2-7 is exercised; no additional condition is assumed.

### TC-COMP-322: Given a long migration on a populated store, When it runs, Then the advisory lock is held for its duration…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S2-8
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S2-8.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a long migration on a populated store, When it runs, Then the advisory lock is held for its duration so a second container waits rather than corrupting the store.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S2-8 is exercised; no additional condition is assumed.

### TC-COMP-323: Given a Pydantic settings model, When the environment is loaded, Then every required field is validated at…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S3-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S3-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a Pydantic settings model, When the environment is loaded, Then every required field is validated at start and a type error fails the process.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S3-1 is exercised; no additional condition is assumed.

### TC-COMP-324: Given a credential value, When it is held, Then it uses a secret-wrapping type whose `repr` and `str` do no…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S3-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S3-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a credential value, When it is held, Then it uses a secret-wrapping type whose `repr` and `str` do not expose the value, so an accidental interpolation cannot leak it.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S3-2 is exercised; no additional condition is assumed.

### TC-COMP-325: Given the logging configuration, When it is installed, Then a redaction filter removes any configured secre…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S3-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S3-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the logging configuration, When it is installed, Then a redaction filter removes any configured secret value from every record, including records emitted by third-party libraries.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S3-3 is exercised; no additional condition is assumed.

### TC-COMP-326: Given the bind address setting, When it is defaulted, Then it defaults to `127.0.0.1` and a non-loopback va…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S3-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S3-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the bind address setting, When it is defaulted, Then it defaults to `127.0.0.1` and a non-loopback value is rejected at start rather than accepted silently.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S3-4 is exercised; no additional condition is assumed.

### TC-COMP-327: Given the application process, When health reports credential presence, Then it reports a boolean derived f…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S3-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S3-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the application process, When health reports credential presence, Then it reports a boolean derived from whether the variable is set, and the value is never read into the API's response path.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S3-5 is exercised; no additional condition is assumed.

### TC-COMP-328: Given ingestion holding a provider client, When it claims a run and the credential has changed, Then it reb…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S3-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S3-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given ingestion holding a provider client, When it claims a run and the credential has changed, Then it rebuilds the client, because claim time is the only point at which no provider connection and no partial instrument write is in flight.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S3-6 is exercised; no additional condition is assumed.

### TC-COMP-329: Given the destination labels, When they render, Then they use the product vocabulary STD-UI-1 fixes: Covera…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S4-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S4-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the destination labels, When they render, Then they use the product vocabulary STD-UI-1 fixes: Coverage, Instruments, Runs, Settings. Not "Jobs", not "Sync", not "Import".

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S4-1 is exercised; no additional condition is assumed.

### TC-COMP-330: Given a run detail route, When it is opened, Then it renders as a child of Runs and the Runs destination re…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S4-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S4-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a run detail route, When it is opened, Then it renders as a child of Runs and the Runs destination remains the active one in the rail.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S4-2 is exercised; no additional condition is assumed.

### TC-COMP-331: Given any spacing or type value in the shell, When it is applied, Then it comes from the defined scale and…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S4-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S4-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given any spacing or type value in the shell, When it is applied, Then it comes from the defined scale and introduces no new value.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S4-3 is exercised; no additional condition is assumed.

### TC-COMP-332: Given keyboard navigation, When the user tabs through the rail, Then every destination is reachable and the…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S4-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S4-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given keyboard navigation, When the user tabs through the rail, Then every destination is reachable and the active one is announced, meeting WCAG 2.1 AA.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S4-4 is exercised; no additional condition is assumed.

### TC-COMP-333: Given an unknown route, When it is opened, Then the shell renders a not-found state inside the frame rather…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S4-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S4-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an unknown route, When it is opened, Then the shell renders a not-found state inside the frame rather than an empty page or a crash.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S4-5 is exercised; no additional condition is assumed.

### TC-COMP-334: Given the built bundle, When `npm run build` runs, Then output lands in the API package's static directory…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S4-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S4-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the built bundle, When `npm run build` runs, Then output lands in the API package's static directory so one image serves both.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S4-6 is exercised; no additional condition is assumed.

### TC-COMP-335: Given a successful health response, When it renders, Then the region shows the product as answering with a…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S5-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S5-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a successful health response, When it renders, Then the region shows the product as answering with a text label plus icon or shape, readable in greyscale.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S5-1 is exercised; no additional condition is assumed.

### TC-COMP-336: Given the last-updated time, When it renders, Then it uses ISO-8601 and the America/Chicago timezone for ti…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S5-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S5-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the last-updated time, When it renders, Then it uses ISO-8601 and the America/Chicago timezone for timestamps.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S5-2 is exercised; no additional condition is assumed.

### TC-COMP-337: Given a health request that fails, When the failure is a transport error, Then the unreachable state names…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S5-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S5-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a health request that fails, When the failure is a transport error, Then the unreachable state names the likely cause, that the application container may not have started, and where to look, the container log.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S5-3 is exercised; no additional condition is assumed.

### TC-COMP-338: Given the run-outcome line before CAP-001-E7-S3 lands, When the region renders, Then it states that no run…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S5-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S5-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the run-outcome line before CAP-001-E7-S3 lands, When the region renders, Then it states that no run has been recorded rather than presenting an empty successful state.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S5-4 is exercised; no additional condition is assumed.

### TC-COMP-339: Given the polling interval, When the component unmounts, Then the interval is cleared so no request continu…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S5-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S5-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the polling interval, When the component unmounts, Then the interval is cleared so no request continues after navigation.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S5-5 is exercised; no additional condition is assumed.

### TC-COMP-340: Given `credential_present` is false in the health response, When the region renders, Then it distinguishes…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S5-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S5-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given `credential_present` is false in the health response, When the region renders, Then it distinguishes a missing credential from a health check that did not answer.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S5-6 is exercised; no additional condition is assumed.

### TC-COMP-341: Given a reachable database, When health is called, Then `database` reports reachable and `schema_version` r…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S6-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S6-1.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given a reachable database, When health is called, Then `database` reports reachable and `schema_version` reports the highest applied migration version.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S6-1 is exercised; no additional condition is assumed.

### TC-COMP-342: Given an unreachable database, When health is called, Then it responds `200` with `database` reporting unre…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S6-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S6-2.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given an unreachable database, When health is called, Then it responds `200` with `database` reporting unreachable, rather than failing the request, so the interface can distinguish a dead database from a dead API.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S6-2 is exercised; no additional condition is assumed.

### TC-COMP-343: Given the health response, When it is serialised, Then `most_recent_run` is present as `null` until CAP-001…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S6-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S6-3.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the health response, When it is serialised, Then `most_recent_run` is present as `null` until CAP-001-E7-S3 populates it, so the field's absence never has to be handled by the interface.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S6-3 is exercised; no additional condition is assumed.

### TC-COMP-344: Given the application factory, When it is constructed, Then it mounts the built frontend bundle from the AP…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S6-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S6-4.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given the application factory, When it is constructed, Then it mounts the built frontend bundle from the API package's static directory.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S6-4 is exercised; no additional condition is assumed.

### TC-COMP-345: Given request handling, When any request is served, Then middleware generates a request id and includes it…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S6-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S6-5.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given request handling, When any request is served, Then middleware generates a request id and includes it in every log record for that request.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S6-5 is exercised; no additional condition is assumed.

### TC-COMP-346: Given any endpoint in the application, When it is declared, Then it declares no authentication requirement,…

**Scope:** component
**Component(s):** FactorFlow-v2 component identified by the corresponding approved component design
**Traces to:** DAC-E1-S6-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The component test harness is configured with the requirement's stated preconditions.

#### Steps
1. Arrange the valid input, state, or failure condition stated by DAC-E1-S6-6.
2. Invoke the component behavior defined for that requirement.
3. Observe the component result through its defined unit-test interface.

#### Expected Result
- Given any endpoint in the application, When it is declared, Then it declares no authentication requirement, because the loopback binding is what makes that sound.

#### Error / Edge Cases
- Only the explicitly stated failure, boundary, or edge condition in DAC-E1-S6-6 is exercised; no additional condition is assumed.


