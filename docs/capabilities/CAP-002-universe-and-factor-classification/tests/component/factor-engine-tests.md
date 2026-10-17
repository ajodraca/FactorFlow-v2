---
artifact_schema_version: 1
artifact_id: CAP-002-factor-engine-component-tests
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
    - id: CAP-002-component-design-factor-engine
      version: "2"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# factor-engine Component Test Specification

### TC-COMP-059: Unresolved LINE_ITEMS key yields missing inputs; momentum still classifies

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S2-5, AC-7
**Priority:** P2
**Type:** functional

#### Preconditions
- A `LINE_ITEMS` key still `REQUIRES_INPUT`

#### Steps
1. Inputs are derived.

#### Expected Result
- They are `missing` with `detail.cause = line_item_mapping_unresolved` and momentum still classifies; `test_line_items_resolved.py` fails until every key is resolved.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S2-5; no further cases are invented.

### TC-COMP-060: revenue_growth equals four-quarter sum over prior four minus one

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S3-1, DAC-E2-1, AC-7
**Priority:** P2
**Type:** functional

#### Preconditions
- Eight quarters

#### Steps
1. `revenue_growth` is derived.

#### Expected Result
- It equals the ratio of the four-quarter sum to the prior four minus one and `as_of` is the latest period.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S3-1; no further cases are invented.

### TC-COMP-061: Annual FY rows enter no TTM sum

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S3-3, DAC-E2-1, AC-7
**Priority:** P2
**Type:** functional

#### Preconditions
- `fiscal_period = 'FY'` rows

#### Steps
1. TTM sums are formed.

#### Expected Result
- Annual rows enter no sum.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S3-3; no further cases are invented.

### TC-COMP-062: Non-positive base or shares make inputs not_computable

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S3-7, DAC-E2-1, AC-7
**Priority:** P2
**Type:** functional

#### Preconditions
- A prior-year revenue or EPS base of zero or less, or non-positive shares

#### Steps
1. Inputs are derived.

#### Expected Result
- They are `not_computable` and the factor is not classified with that reason input (DEC-0055).

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S3-7; no further cases are invented.

### TC-COMP-063: Missing 12-month price makes only return_12m missing

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S4-1, DAC-E2-1, AC-7
**Priority:** P2
**Type:** functional

#### Preconditions
- A stock lacking a bar before S_12

#### Steps
1. Inputs are derived.

#### Expected Result
- `return_12m` is `missing` and the other two are present.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S4-1; no further cases are invented.

### TC-COMP-064: 2-for-1 split inside window leaves return unchanged

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S4-2, DAC-E2-1, AC-7
**Priority:** P2
**Type:** functional

#### Preconditions
- A 2-for-1 split inside the window

#### Steps
1. The return is computed.

#### Expected Result
- Pre-split prices are halved and the return equals the unsplit series' return.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S4-2; no further cases are invented.

### TC-COMP-065: Dividend of 1 on close of 100 multiplies return factor by 1.01

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S4-3, DAC-E2-1, AC-7
**Priority:** P2
**Type:** functional

#### Preconditions
- One dividend of 1 against a prior close of 100

#### Steps
1. The return is computed.

#### Expected Result
- The return factor is multiplied by 1.01.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S4-3; no further cases are invented.

### TC-COMP-066: Momentum known_on is max observed_on of bars and actions used

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S4-4, AC-7
**Priority:** P2
**Type:** functional

#### Preconditions
- The bars and actions used

#### Steps
1. The input is written.

#### Expected Result
- `known_on` equals the maximum `observed_on` over them.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S4-4; no further cases are invented.

### TC-COMP-067: Stock with two of three value inputs is outside value peer set

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S5-2, DAC-E2-2, AC-8
**Priority:** P2
**Type:** functional

#### Preconditions
- A stock with two of three value inputs present

#### Steps
1. Peer sets are formed.

#### Expected Result
- It is outside the value peer set and is classified on growth and momentum.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S5-2; no further cases are invented.

### TC-COMP-068: Scores identical regardless of universe membership

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S5-5, DAC-E2-2, AC-8
**Priority:** P2
**Type:** functional

#### Preconditions
- A stock in zero, one or several universes

#### Steps
1. Classified.

#### Expected Result
- Its scores are identical; no universe table is read.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S5-5; no further cases are invented.

### TC-COMP-069: Composite arithmetic matches hand-built peer set and properties

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S5-1, DAC-E2-3, AC-9
**Priority:** P2
**Type:** functional

#### Preconditions
- A hand-built peer set

#### Steps
1. The composite is computed.

#### Expected Result
- Z-scores, the equal-weight mean, re-standardisation to mean 0 and sd 1 and `percent_rank x 100` match `test_composite_arithmetic.py`; a zero-dispersion input contributes 0; `hypothesis` property tests hold over random peer sets.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S5-1; no further cases are invented.

### TC-COMP-090: Build timeout fails the set with a timeout reason

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S2-3, AC-11
**Priority:** P1
**Type:** functional

#### Preconditions
- `timeout_seconds` of 0.001 against a populated store

#### Steps
1. `build` runs.

#### Expected Result
- The set is `failed` with a timeout reason and no rows (DEC-0067).

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S2-3; no further cases are invented.

### TC-COMP-091: 3000 instruments build within 295 s with expected row counts

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S7-1, DAC-E2-5, AC-11
**Priority:** P1
**Type:** performance

#### Preconditions
- 3000 instruments

#### Steps
1. `build` runs.

#### Expected Result
- It completes within 295 seconds and writes 24,000 inputs and 9,000 classifications.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S7-1; no further cases are invented.

### TC-COMP-094: Seven quarters leave growth inputs missing, value unaffected

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S3-2, AC-12
**Priority:** P1
**Type:** functional

#### Preconditions
- Seven quarters

#### Steps
1. Growth inputs are derived.

#### Expected Result
- They are `missing` with `detail.periods_found` listing seven and value inputs are unaffected.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S3-2; no further cases are invented.

### TC-COMP-095: not_computable input yields input_not_computable naming it

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S5-6, AC-12
**Priority:** P1
**Type:** functional

#### Preconditions
- An input `not_computable`

#### Steps
1. The factor is classified.

#### Expected Result
- The stock is `not_classified` with `input_not_computable` and the reason input named.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S5-6; no further cases are invented.

### TC-COMP-100: Fundamental outdated at 6 months and a day, present at exactly 6

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S3-5, DAC-E2-6, AC-13
**Priority:** P2
**Type:** functional

#### Preconditions
- A latest period end 6 months and a day before the classification date

#### Steps
1. Currency is decided.

#### Expected Result
- The input is `outdated`; at exactly 6 months it is `present`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S3-5; no further cases are invented.

### TC-COMP-101: Stale latest bar makes value inputs outdated, growth unaffected

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S3-6, DAC-E2-6, AC-13
**Priority:** P2
**Type:** functional

#### Preconditions
- A stock whose latest bar precedes the latest trading day held

#### Steps
1. Value inputs are decided.

#### Expected Result
- They are `outdated`; growth inputs are unaffected.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S3-6; no further cases are invented.

### TC-COMP-102: Stale latest bar makes all momentum inputs outdated

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S4-5, DAC-E2-6, AC-13
**Priority:** P2
**Type:** functional

#### Preconditions
- A stock whose latest bar precedes the latest trading day held

#### Steps
1. Momentum is decided.

#### Expected Result
- All three momentum inputs are `outdated`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S4-5; no further cases are invented.

### TC-COMP-107: 29 qualifying stocks: not ranked; 30 ranks

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S5-3, DAC-E2-7, AC-14
**Priority:** P1
**Type:** functional

#### Preconditions
- 29 qualifying stocks

#### Steps
1. A factor is classified.

#### Expected Result
- `ranked` is false, every active stock is `not_classified` with `not_enough_stocks` and `reason_detail` `29 of 30 stocks qualified`, and no score is written; at 30 it ranks.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S5-3; no further cases are invented.

### TC-COMP-111: Retired instrument in no peer set, not classified retired

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S5-4, DAC-E2-8, AC-15
**Priority:** P1
**Type:** functional

#### Preconditions
- A retired instrument

#### Steps
1. The build runs.

#### Expected Result
- It is in no peer set, is `not_classified` with reason `retired` on all three factors and has no `factor_input` rows.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S5-4; no further cases are invented.

### TC-COMP-159: set_context resolves date, latest trading day and roster in-transaction

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S2-4, DAC-E2-9, AC-19
**Priority:** P1
**Type:** functional

#### Preconditions
- A run

#### Steps
1. `set_context.sql` resolves it.

#### Expected Result
- It returns the classification date, the latest trading day held across active instruments and the active roster, selecting rows as they exist in the build's own transaction.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S2-4; no further cases are invented.

### TC-COMP-160: classification package is isolated from ingestion and append-only

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S2-6, AC-19
**Priority:** P1
**Type:** security

#### Preconditions
- Anything under `classification/`

#### Steps
1. The safety test runs.

#### Expected Result
- Nothing imports `factorflow.ingestion.massive`, every statement is parameterised and no `UPDATE` or `DELETE` names an observation or history table.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S2-6; no further cases are invented.

### TC-COMP-161: Later observation of a period is used; earlier untouched

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S3-4, DAC-E2-9, AC-19
**Priority:** P1
**Type:** functional

#### Preconditions
- Two observations of one period

#### Steps
1. Selected.

#### Expected Result
- The one with the later `observed_on` is used, `known_on` equals it and the earlier row is untouched.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S3-4; no further cases are invented.

### TC-COMP-162: Backfill after completion leaves the set unchanged

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S7-2, DAC-E2-9, AC-19
**Priority:** P1
**Type:** functional

#### Preconditions
- A completed set

#### Steps
1. A backfilled statement is inserted afterwards.

#### Expected Result
- Every row of that set is unchanged and the next set sees the statement.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S7-2; no further cases are invented.

### TC-COMP-166: Failure after inputs written leaves zero rows and failed set

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S2-1, DAC-E2-10, AC-20
**Priority:** P1
**Type:** functional

#### Preconditions
- An injected failure after inputs are written

#### Steps
1. `build` runs.

#### Expected Result
- The four classification tables hold zero rows for the set and the set is `failed` with the exception class in `failure_reason`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S2-1; no further cases are invented.

### TC-COMP-167: Completing an already-failed set updates no row and rolls back

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S2-2, DAC-E2-10, AC-20
**Priority:** P1
**Type:** functional

#### Preconditions
- The set was already marked `failed` by another writer

#### Steps
1. `build` tries to complete it.

#### Expected Result
- `complete_set.sql` (guarded by `state = 'building'`) updates no row, `build` raises inside the transaction, rolls back and writes nothing.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S2-2; no further cases are invented.

### TC-COMP-186: Pre-first-observation statement marks value and growth restated_possible

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S6-1, DAC-E2-11, AC-23
**Priority:** P1
**Type:** functional

#### Preconditions
- A statement filed before the instrument's first fundamentals observation

#### Steps
1. Inputs and classifications are written.

#### Expected Result
- Its inputs and the value and growth classifications carry `restated_possible`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S6-1; no further cases are invented.

### TC-COMP-187: Momentum classification is never marked

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S6-2, DAC-E2-11, AC-23
**Priority:** P1
**Type:** functional

#### Preconditions
- A momentum classification for the same stock

#### Steps
1. Written.

#### Expected Result
- It is never marked.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S6-2; no further cases are invented.

### TC-COMP-188: Earlier row's mark unchanged by a later set

**Scope:** component
**Component(s):** factor-engine
**Traces to:** DAC-E2-S6-3, AC-23
**Priority:** P1
**Type:** functional

#### Preconditions
- A marked classification in a completed set

#### Steps
1. A later set is built.

#### Expected Result
- The earlier row's mark is unchanged.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E2-S6-3; no further cases are invented.

