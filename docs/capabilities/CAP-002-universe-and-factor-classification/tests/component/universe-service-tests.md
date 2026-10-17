---
artifact_schema_version: 1
artifact_id: CAP-002-universe-service-component-tests
artifact_type: test-specification
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T18:38:08Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "3"
    - id: CAP-002-backlog
      version: "4"
    - id: CAP-002-component-design-universe-service
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# universe-service Component Test Specification

### TC-COMP-001: Uncovered symbols refuse the whole create or add

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S3-1, DAC-E1-1, AC-1
**Priority:** P1
**Type:** functional

#### Preconditions
- A batch containing one symbol with no `instrument` row or no `coverage_segment`

#### Steps
1. `create_by_hand` or `add_members` runs.

#### Expected Result
- `InstrumentNotAcquired` names every uncovered symbol and nothing is written.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S3-1; no further cases are invented.

### TC-COMP-002: Create appends one created and n member_added events

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S3-3, AC-1
**Priority:** P1
**Type:** functional

#### Preconditions
- A successful create of n symbols

#### Steps
1. The events are read.

#### Expected Result
- There is one `created` and n `member_added` events appended in one `executemany`, and replay returns the n members with `member_since`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S3-3; no further cases are invented.

### TC-COMP-003: 3000-member universe created and replayed correctly

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S3-8, AC-1
**Priority:** P1
**Type:** performance

#### Preconditions
- A universe of 3000 members created in three calls

#### Steps
1. It is created and replayed.

#### Expected Result
- The result is correct within the test's own budget (`slow` marker).

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S3-8; no further cases are invented.

### TC-COMP-012: create_from_filter members equal evaluate_filter result

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S5-1, DAC-E1-2, AC-2
**Priority:** P1
**Type:** functional

#### Preconditions
- Thresholds, `hide_incomplete` and a prefix

#### Steps
1. `create_from_filter` runs.

#### Expected Result
- The members equal `evaluate_filter`'s result for that set and the same `Thresholds`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S5-1; no further cases are invented.

### TC-COMP-013: Newer complete set raises ClassificationSetChanged

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S5-2, DAC-E1-2, AC-2
**Priority:** P1
**Type:** functional

#### Preconditions
- A newer complete set than the named `set_id`

#### Steps
1. The snapshot is requested.

#### Expected Result
- `ClassificationSetChanged` (`classification_set_changed`) is raised and nothing is written.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S5-2; no further cases are invented.

### TC-COMP-014: Saved snapshot Origin equals filter_provenance

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S5-4, DAC-E1-3, AC-2
**Priority:** P1
**Type:** functional

#### Preconditions
- A saved snapshot

#### Steps
1. `get_universe` reads it.

#### Expected Result
- The `Origin` carries the bounds, `hide_incomplete`, `symbol` (null without a search), `set_id` and the set's `classification_date`, equal to `filter_provenance` on the event.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S5-4; no further cases are invented.

### TC-COMP-015: hide_incomplete decides membership of incomplete stocks

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S5-5, DAC-E1-2, AC-2
**Priority:** P1
**Type:** functional

#### Preconditions
- As stated in the source acceptance criterion.

#### Steps
1. Exercise the behaviour stated below.

#### Expected Result
- Given a stock incomplete on one factor for an input reason that the bounds admit, When `hide_incomplete` is false it is a member and when true it is not.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S5-5; no further cases are invented.

### TC-COMP-016: Later sets do not change a saved snapshot's members

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S5-6, AC-2
**Priority:** P1
**Type:** functional

#### Preconditions
- A later set that changes which stocks match

#### Steps
1. The universe is read.

#### Expected Result
- Its members are unchanged.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S5-6; no further cases are invented.

### TC-COMP-019: Concurrent same-name creates serialise on the write lock

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S3-5, DAC-E1-5, AC-3, AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Two connections creating the same name at once

#### Steps
1. Both run.

#### Expected Result
- They serialise on `UNIVERSE_WRITE_LOCK_KEY` and exactly one succeeds.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S3-5; no further cases are invented.

### TC-COMP-023: Active universe name must be unique; retired name reusable

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S3-4, DAC-E1-4, AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- An active universe already named X after trimming

#### Steps
1. A second create or rename names X.

#### Expected Result
- `UniverseNameInUse` is raised; after the first is retired the name is accepted.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S3-4; no further cases are invented.

### TC-COMP-024: Adding a current member reports already_member, no event

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S3-6, DAC-E1-6, AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- A symbol already a current member

#### Steps
1. `add_members` runs.

#### Expected Result
- It is returned in `already_member` and no event is appended for it.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S3-6; no further cases are invented.

### TC-COMP-025: Rename keeps identity, history and memberships

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S4-1, AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- A rename

#### Steps
1. It is applied.

#### Expected Result
- `universe_id`, every earlier event and every membership are unchanged and exactly one `renamed` event is appended.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S4-1; no further cases are invented.

### TC-COMP-026: Removing a non-member raises a typed error

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S4-6, AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- A symbol that is not a current member

#### Steps
1. `remove_member` runs.

#### Expected Result
- A typed not-a-member error is raised and nothing is written.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S4-6; no further cases are invented.

### TC-COMP-035: create_by_hand with no symbols raises EmptyUniverse

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S3-2, AC-5
**Priority:** P1
**Type:** functional

#### Preconditions
- No symbols

#### Steps
1. `create_by_hand` runs.

#### Expected Result
- `EmptyUniverse` is raised and nothing is written.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S3-2; no further cases are invented.

### TC-COMP-036: Removing the sole member raises LastMember

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S4-2, DAC-E1-7, AC-5, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A universe with one current member

#### Steps
1. `remove_member` runs on it.

#### Expected Result
- `LastMember` is raised offering retirement and nothing is written.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S4-2; no further cases are invented.

### TC-COMP-037: Retire appends one retired event, data stays readable

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S4-4, DAC-E1-7, AC-5, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- `retire`

#### Steps
1. It succeeds.

#### Expected Result
- One `retired` event is appended and `get_universe` returns `lifecycle: retired` with members and events readable.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S4-4; no further cases are invented.

### TC-COMP-038: Every write to a retired universe raises UniverseRetired

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S4-5, DAC-E1-7, AC-5, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A retired universe

#### Steps
1. `retire`, `add_members`, `remove_member` or `rename` is called.

#### Expected Result
- `UniverseRetired` is raised.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S4-5; no further cases are invented.

### TC-COMP-039: Filter matching no stock raises EmptyUniverse

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S5-3, AC-5
**Priority:** P1
**Type:** functional

#### Preconditions
- Thresholds that match no stock

#### Steps
1. The snapshot is requested.

#### Expected Result
- `EmptyUniverse` is raised.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S5-3; no further cases are invented.

### TC-COMP-049: Same-day add and remove is not membership; add day counts

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S2-1, DAC-E1-8, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A stock added and removed on the same `recorded_on` date

#### Steps
1. Membership is read as of that date.

#### Expected Result
- It is not a member; a stock added on D is a member as of D and every later date until removed.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S2-1; no further cases are invented.

### TC-COMP-050: Membership before creation is empty and flagged

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S2-2, DAC-E1-8, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A date before the universe's `created` event

#### Steps
1. Membership is read as of it.

#### Expected Result
- It returns no members, `as_of_before_creation: true` and the creation date.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S2-2; no further cases are invented.

### TC-COMP-051: list_events orders by event_id DESC with stable cursor

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S2-4, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A universe with more events than one page

#### Steps
1. `list_events` is read.

#### Expected Result
- Events are ordered by `event_id DESC` with a stable cursor across pages.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S2-4; no further cases are invented.

### TC-COMP-052: Membership SQL is parameterised and loaded once from files

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S2-5, DAC-E1-10, AC-6
**Priority:** P1
**Type:** security

#### Preconditions
- All SQL in this module

#### Steps
1. Statements are inspected.

#### Expected Result
- Every one is parameterised and loaded once at import from a `.sql` file (SEC-INP-002).

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S2-5; no further cases are invented.

### TC-COMP-053: Removed member keeps both events in history

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S4-3, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A removed member

#### Steps
1. History is read.

#### Expected Result
- Both the `member_added` and `member_removed` events remain and the stock is absent from current members.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S4-3; no further cases are invented.

### TC-COMP-054: New membership SQL has no UPDATE or DELETE and is parameterised

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S4-7, DAC-E1-10, AC-6
**Priority:** P1
**Type:** security

#### Preconditions
- The new SQL statements

#### Steps
1. The safety scan runs.

#### Expected Result
- None is an `UPDATE` or `DELETE` and every one is parameterised.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S4-7; no further cases are invented.

### TC-COMP-117: Retired instrument member replays with lifecycle retired

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S2-3, DAC-E1-9, AC-15
**Priority:** P1
**Type:** functional

#### Preconditions
- An instrument whose `lifecycle` is `retired`

#### Steps
1. It is a current or past member.

#### Expected Result
- Replay returns it with `lifecycle: retired` rather than excluding it.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S2-3; no further cases are invented.

### TC-COMP-118: Retired-lifecycle covered symbol is accepted

**Scope:** component
**Component(s):** universe-service
**Traces to:** DAC-E1-S3-7, DAC-E1-9, AC-15
**Priority:** P1
**Type:** functional

#### Preconditions
- A covered symbol whose lifecycle is `retired`

#### Steps
1. It is named.

#### Expected Result
- It is accepted and replays with `lifecycle: retired`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S3-7; no further cases are invented.

