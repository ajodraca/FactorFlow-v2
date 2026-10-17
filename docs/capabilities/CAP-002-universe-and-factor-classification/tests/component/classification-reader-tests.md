---
artifact_schema_version: 1
artifact_id: CAP-002-classification-reader-component-tests
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
    - id: CAP-002-component-design-classification-reader
      version: "3"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# classification-reader Component Test Specification

### TC-COMP-096: Threshold excludes only classified stocks failing the bound

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S2-1, DAC-E3-3, AC-12, AC-16
**Priority:** P1
**Type:** functional

#### Preconditions
- A threshold on a factor

#### Steps
1. The list is filtered.

#### Expected Result
- Only a stock classified on that factor and failing the bound is excluded; incomplete or unranked stocks stay listed and counted.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S2-1; no further cases are invented.

### TC-COMP-103: Summary currency counts missing/outdated, not not_computable

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S1-4, DAC-E3-10, AC-13
**Priority:** P2
**Type:** functional

#### Preconditions
- A stock with a `missing` or `outdated` input in the current set

#### Steps
1. The summary counts current stocks.

#### Expected Result
- It is not current; a `not_computable` input does not count against currency.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S1-4; no further cases are invented.

### TC-COMP-104: Summary returns counts only from indexed rows

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S1-5, AC-13
**Priority:** P2
**Type:** functional

#### Preconditions
- The summary read

#### Steps
1. It is executed.

#### Expected Result
- It returns counts only and no stock rows and runs from indexed set rows.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S1-5; no further cases are invented.

### TC-COMP-108: hide_incomplete hides only input-reason stocks

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S2-2, DAC-E3-4, AC-14, AC-15
**Priority:** P1
**Type:** functional

#### Preconditions
- `hide_incomplete`

#### Steps
1. Applied.

#### Expected Result
- A stock is hidden only when its `not_classified` reason on any factor is `input_missing`, `input_outdated` or `input_not_computable`, never `not_enough_stocks` or `retired`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S2-2; no further cases are invented.

### TC-COMP-112: Unscoped list is active only; universe scope keeps retired

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S2-3, DAC-E3-5, AC-15, AC-16
**Priority:** P1
**Type:** functional

#### Preconditions
- The unscoped list

#### Steps
1. Read.

#### Expected Result
- It holds active instruments only; a universe scope keeps retired members rendered with their `retired` reason.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S2-3; no further cases are invented.

### TC-COMP-113: Retired stock keeps its row with retired reason

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S3-4, AC-15
**Priority:** P1
**Type:** functional

#### Preconditions
- A retired stock

#### Steps
1. Compared or read as evidence.

#### Expected Result
- It keeps its row with the `retired` reason.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S3-4; no further cases are invented.

### TC-COMP-120: match_count identical on every page

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S2-4, DAC-E3-6, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- A multi-page result

#### Steps
1. Each page is requested.

#### Expected Result
- `match_count` is identical on every page and counts the whole filtered scope.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S2-4; no further cases are invented.

### TC-COMP-121: Sort allowlist enforced; cursor round-trips and rejects tampering

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S2-5, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- A `sort` value outside the allowlist

#### Steps
1. Validated.

#### Expected Result
- It is rejected and never interpolated into SQL; the cursor round-trips and rejects a tampered value.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S2-5; no further cases are invented.

### TC-COMP-122: All-null thresholds match every stock in scope

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S2-7, DAC-E3-2, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- `Thresholds` with all bounds null and `hide_incomplete` false

#### Steps
1. Evaluated.

#### Expected Result
- Every stock in scope matches.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S2-7; no further cases are invented.

### TC-COMP-123: Compare returns every known symbol, 2 to 6 only

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S3-1, DAC-E3-7, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- 2 to 6 symbols

#### Steps
1. Compare runs.

#### Expected Result
- Every symbol naming a known instrument is returned, including an incomplete or retired one; fewer than 2 or more than 6 is rejected.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S3-1; no further cases are invented.

### TC-COMP-124: Unrecognised compare symbol reported in unknown_symbols

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S3-2, DAC-E3-7, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- An unrecognised symbol

#### Steps
1. Compare runs.

#### Expected Result
- It is reported in `unknown_symbols` and not silently dropped.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S3-2; no further cases are invented.

### TC-COMP-146: Evidence returns every factor_input with dates and universes

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S3-3, DAC-E3-8, AC-17
**Priority:** P2
**Type:** functional

#### Preconditions
- A stock

#### Steps
1. Evidence is read.

#### Expected Result
- Every `factor_input` row of the current set is returned with value, `as_of`, `known_on` and `restated_possible`, with the active universes it belongs to in name order.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S3-3; no further cases are invented.

### TC-COMP-147: Evidence with no current set has null set, same shape

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S3-5, DAC-E3-8, AC-17
**Priority:** P2
**Type:** functional

#### Preconditions
- No current set

#### Steps
1. Evidence is read.

#### Expected Result
- `set` is null and the shape matches the populated shape.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S3-5; no further cases are invented.

### TC-COMP-150: History returns complete sets newest first with marks

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S4-1, DAC-E3-9, AC-18
**Priority:** P1
**Type:** functional

#### Preconditions
- A stock

#### Steps
1. History is read.

#### Expected Result
- Only `complete` sets' results are returned, newest first, exactly as recorded, with the restatement mark each carried.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S4-1; no further cases are invented.

### TC-COMP-151: Never-classified stock history is empty, not unknown

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S4-2, AC-18
**Priority:** P1
**Type:** functional

#### Preconditions
- A stock never classified

#### Steps
1. History is read.

#### Expected Result
- It returns an empty list distinct from an unknown symbol.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S4-2; no further cases are invented.

### TC-COMP-152: History excludes failed/building sets; set list includes them

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S4-3, DAC-E3-9, AC-18
**Priority:** P1
**Type:** functional

#### Preconditions
- A `failed` or `building` set

#### Steps
1. History or sets are listed.

#### Expected Result
- History excludes it and the set list includes it with its state and `failure_reason`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S4-3; no further cases are invented.

### TC-COMP-153: 3000-stock list, sort and count served from indexed rows

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S4-4, AC-18
**Priority:** P1
**Type:** performance

#### Preconditions
- 3000 stocks

#### Steps
1. The list, sort and count run.

#### Expected Result
- Each is served from indexed set rows within the test's budget.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S4-4; no further cases are invented.

### TC-COMP-170: current_set returns complete set with newer building set as later

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S1-1, DAC-E3-1, AC-20, AC-21
**Priority:** P1
**Type:** functional

#### Preconditions
- A `complete` set and a newer `building` set

#### Steps
1. `current_set` is read.

#### Expected Result
- `set` is the complete one, `later` the building one and `not_current` true.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S1-1; no further cases are invented.

### TC-COMP-171: First set building or failed gives never_classified with later

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S1-2, DAC-E3-11, AC-20, AC-22
**Priority:** P1
**Type:** functional

#### Preconditions
- Only a `building` or `failed` first set

#### Steps
1. Read.

#### Expected Result
- `never_classified` is true, `set` is null and `later` carries that set with its `failure_reason` when failed.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S1-2; no further cases are invented.

### TC-COMP-178: Reader returns stored values and recomputes nothing

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S1-6, AC-21
**Priority:** P2
**Type:** functional

#### Preconditions
- Each returned value

#### Steps
1. Inspected.

#### Expected Result
- It is a stored row; nothing is recomputed by the reader (STD-UI-15).

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S1-6; no further cases are invented.

### TC-COMP-181: No set at all gives never_classified in the same shape

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S1-3, AC-22
**Priority:** P2
**Type:** functional

#### Preconditions
- No set at all

#### Steps
1. Read.

#### Expected Result
- `never_classified` is true and `later` is null, in the same shape as every other state.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S1-3; no further cases are invented.

### TC-COMP-189: Restated value or growth cell carries restated_possible

**Scope:** component
**Component(s):** classification-reader
**Traces to:** DAC-E3-S2-6, DAC-E3-12, AC-23
**Priority:** P1
**Type:** functional

#### Preconditions
- A restated value or growth cell

#### Steps
1. Listed.

#### Expected Result
- `restated_possible` is on the cell.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E3-S2-6; no further cases are invented.

