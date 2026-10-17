---
artifact_schema_version: 1
artifact_id: CAP-002-classification-ui-component-tests
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
    - id: CAP-002-component-design-classification-ui
      version: "3"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# classification-ui Component Test Specification

### TC-COMP-006: Create dialog names every uncovered symbol and keeps the list

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S7-2, DAC-E1-1, AC-1
**Priority:** P1
**Type:** functional

#### Preconditions
- A response with `instrument_not_acquired`

#### Steps
1. The dialog receives it.

#### Expected Result
- It names every uncovered symbol, links to the followed-stocks page and keeps the owner's list.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S7-2; no further cases are invented.

### TC-COMP-007: Successful create navigates to the new universe without toast

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S7-3, AC-1
**Priority:** P1
**Type:** functional

#### Preconditions
- A `201`

#### Steps
1. The create succeeds.

#### Expected Result
- The app navigates to the new universe's detail without a toast.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S7-3; no further cases are invented.

### TC-COMP-008: Save blocked at zero matches

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S8-1, DAC-E4-5, AC-2, AC-5
**Priority:** P1
**Type:** functional

#### Preconditions
- Zero matches

#### Steps
1. Save is shown.

#### Expected Result
- It is `blocked` with its reason.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S8-1; no further cases are invented.

### TC-COMP-009: Save under a search carries the prefix

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S8-2, DAC-E4-5, AC-2, AC-5
**Priority:** P1
**Type:** functional

#### Preconditions
- A search is active

#### Steps
1. Saved.

#### Expected Result
- The request carries the prefix as `symbol` (null otherwise) and the description names the search.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S8-2; no further cases are invented.

### TC-COMP-010: 201 closes dialog and toasts a link

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S8-3, AC-2
**Priority:** P1
**Type:** functional

#### Preconditions
- A `201`

#### Steps
1. Saved.

#### Expected Result
- The dialog closes and a toast links to the universe.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S8-3; no further cases are invented.

### TC-COMP-011: classification_set_changed replaces Save with Review new result

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S8-4, AC-2
**Priority:** P1
**Type:** functional

#### Preconditions
- `classification_set_changed`

#### Steps
1. Received.

#### Expected Result
- Save is replaced by Review new result.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S8-4; no further cases are invented.

### TC-COMP-020: Retired universes appear only under the lifecycle select

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S7-4, AC-3
**Priority:** P2
**Type:** functional

#### Preconditions
- Active and retired universes

#### Steps
1. The list renders.

#### Expected Result
- Retired ones appear only under the lifecycle select with a `secondary` badge reading Retired.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S7-4; no further cases are invented.

### TC-COMP-021: Filter-origin line names search and hidden-incomplete only when applied

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S7-5, AC-3
**Priority:** P2
**Type:** functional

#### Preconditions
- A universe saved from a filter

#### Steps
1. Its origin line renders.

#### Expected Result
- It names the filter, `search "AA"` and `stocks with an incomplete score hidden` only when they applied.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S7-5; no further cases are invented.

### TC-COMP-022: Never-populated state distinct from empty lifecycle filter

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S7-6, AC-3
**Priority:** P2
**Type:** functional

#### Preconditions
- No universe exists

#### Steps
1. The list renders.

#### Expected Result
- The never-populated state is distinct from a lifecycle filter that matches nothing.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S7-6; no further cases are invented.

### TC-COMP-029: History tab newest first, rename shows both names

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S8-6, AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- The history tab

#### Steps
1. It renders.

#### Expected Result
- Events are newest first and a rename shows both names.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S8-6; no further cases are invented.

### TC-COMP-030: Inline rename: Enter sends PATCH, Esc cancels, field errors

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S9-1, DAC-E1-4, AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Inline rename

#### Steps
1. Enter is pressed.

#### Expected Result
- `PATCH` is sent and Esc cancels; `universe_name_in_use` attaches as a field error and an empty trimmed name is a field error.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S9-1; no further cases are invented.

### TC-COMP-031: Add stocks reports already-current symbol politely

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S9-2, DAC-E1-6, AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Add stocks with an already-current symbol

#### Steps
1. The response arrives.

#### Expected Result
- `already_member` is reported politely and not as an error.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S9-2; no further cases are invented.

### TC-COMP-032: Add stocks with uncovered symbol names every symbol

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S9-3, AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- An uncovered symbol

#### Steps
1. Add stocks is submitted.

#### Expected Result
- The whole-request refusal names every symbol.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S9-3; no further cases are invented.

### TC-COMP-033: Add toast with already-member clause; universe_retired wording

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S8-5, AC-5
**Priority:** P1
**Type:** functional

#### Preconditions
- Add

#### Steps
1. It succeeds.

#### Expected Result
- It toasts Added {n} stocks to {name} with the already-member clause; `universe_retired` shows its wording.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S8-5; no further cases are invented.

### TC-COMP-042: Create dialog submit blocked for zero or over 1000 symbols

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S7-1, AC-5
**Priority:** P1
**Type:** non-functional

#### Preconditions
- No symbol parses or more than 1000 do

#### Steps
1. The create dialog is shown.

#### Expected Result
- The submit control is `blocked` with its reason and stays focusable.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S7-1; no further cases are invented.

### TC-COMP-043: Sole member Remove is blocked with adjacent Retire action

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S8-4, DAC-E1-7, AC-5, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The sole member

#### Steps
1. Remove is activated.

#### Expected Result
- It is `blocked` with a Retire action adjacent; `last_member` keeps the dialog with a Retire action.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S8-4; no further cases are invented.

### TC-COMP-044: Retire dialog is confirm variant; header shows Retired after 200

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S9-4, DAC-E1-7, AC-5, AC-6
**Priority:** P1
**Type:** non-functional

#### Preconditions
- Retire

#### Steps
1. The dialog opens.

#### Expected Result
- It uses the `confirm` variant and, after `200`, the header shows Retired and the actions leave.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S9-4; no further cases are invented.

### TC-COMP-055: As-of view requests as_of and labels it; malformed date is field error

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S8-1, DAC-E1-8, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- *View members as of this event* or a typed date

#### Steps
1. Chosen.

#### Expected Result
- The table requests `as_of` and the label states it; a malformed date is a field error.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S8-1; no further cases are invented.

### TC-COMP-056: As-of before creation shows did-not-exist sentence

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S8-2, DAC-E1-8, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A date before creation

#### Steps
1. The as-of view loads.

#### Expected Result
- The did-not-exist sentence with the creation date renders.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S8-2; no further cases are invented.

### TC-COMP-057: Remove dialog is confirm variant, focus on Cancel

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S8-5, AC-6
**Priority:** P1
**Type:** non-functional

#### Preconditions
- Remove

#### Steps
1. The dialog opens.

#### Expected Result
- It uses the `confirm` variant (never `destructive`), states that history stays and puts initial focus on Cancel.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S8-5; no further cases are invented.

### TC-COMP-058: Retired universe stays readable with universe_retired wording

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S9-5, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A retired universe

#### Steps
1. The page renders.

#### Expected Result
- Members and history remain readable and `universe_retired` wording is shown for any attempted write.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S9-5; no further cases are invented.

### TC-COMP-071: Score, percentile, ratio, rate and date formatting

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S2-3, AC-9
**Priority:** P2
**Type:** functional

#### Preconditions
- Scores, percentiles, ratios, rates and amounts

#### Steps
1. Formatted.

#### Expected Result
- `+1.27`, `-0.45`, `0.00` unsigned; percentile `84` without sign or `%`; ratios 2 dp; rates `+12.40%`; timestamps in America/Chicago with zone; dates unconverted.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S2-3; no further cases are invented.

### TC-COMP-072: copy.ts contains no forbidden vocabulary

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S2-4, DAC-E4-1, AC-9, AC-12, AC-14
**Priority:** P2
**Type:** functional

#### Preconditions
- `copy.ts`

#### Steps
1. Scanned.

#### Expected Result
- No owner-facing string contains instrument, acquisition run, not classified, retire, or a bare score where percentile or standardised score is meant (STD-UI-1).

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S2-4; no further cases are invented.

### TC-COMP-073: Unscored factor never shows 0 or bare number

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S3-1, DAC-E4-1, AC-9, AC-12, AC-14
**Priority:** P2
**Type:** functional

#### Preconditions
- An unscored factor

#### Steps
1. Rendered.

#### Expected Result
- It never shows `0` or a bare number, only the word, shape and token for its state.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S3-1; no further cases are invented.

### TC-COMP-074: Measured 0.00 score renders as 0.00

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S3-2, AC-9
**Priority:** P2
**Type:** functional

#### Preconditions
- A measured `0.00` standardised score

#### Steps
1. Rendered.

#### Expected Result
- It appears as `0.00`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S3-2; no further cases are invented.

### TC-COMP-093: 3000 rows virtualised

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S6-5, AC-11
**Priority:** P1
**Type:** functional

#### Preconditions
- 3000 rows

#### Steps
1. Rendered.

#### Expected Result
- The DOM does not grow with the result size (virtualised).

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S6-5; no further cases are invented.

### TC-COMP-097: Possibly restated mark on value and growth only

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S3-3, AC-12
**Priority:** P1
**Type:** non-functional

#### Preconditions
- `restatedPossible` on value or growth

#### Steps
1. Rendered.

#### Expected Result
- The mark's accessible name and text are Possibly restated, and it never renders on momentum.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S3-3; no further cases are invented.

### TC-COMP-098: Incomplete factor cell and incomplete rows sort last

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S6-3, AC-12
**Priority:** P1
**Type:** functional

#### Preconditions
- A stock incomplete on one factor

#### Steps
1. The table renders.

#### Expected Result
- Two percentiles and one Incomplete appear and incomplete rows sort last, described in the header.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S6-3; no further cases are invented.

### TC-COMP-099: Absence-judges-presence footnote appears once

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S9-5, AC-12
**Priority:** P1
**Type:** functional

#### Preconditions
- The footnote

#### Steps
1. Rendered.

#### Expected Result
- The statement that absence judges presence and currency, not provider correctness, appears once (STD-UI-18).

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S9-5; no further cases are invented.

### TC-COMP-105: Outdated fundamental card names period end, rule and recovery

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S3-1, DAC-E5-2, AC-17, AC-13
**Priority:** P2
**Type:** functional

#### Preconditions
- An outdated fundamental

#### Steps
1. The card renders.

#### Expected Result
- It names the period end, the 6-month rule against the scores' date and the next-download recovery.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S3-1; no further cases are invented.

### TC-COMP-106: No-provider-data factor offers no recovery

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S3-2, DAC-E5-2, AC-17, AC-13
**Priority:** P2
**Type:** functional

#### Preconditions
- A factor where the provider holds no data

#### Steps
1. The card renders.

#### Expected Result
- No recovery is offered.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S3-2; no further cases are invented.

### TC-COMP-109: Every status has a word plus shape; polarity colour carries no value

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S3-4, AC-14
**Priority:** P1
**Type:** functional

#### Preconditions
- A status

#### Steps
1. Rendered.

#### Expected Result
- No polarity colour carries a value and every status has a word plus a shape or pattern (STD-UI-4, STD-UI-14).

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S3-4; no further cases are invented.

### TC-COMP-110: Under-30 factor shows header count, Not enough to rank, no sort

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S6-1, AC-14
**Priority:** P1
**Type:** functional

#### Preconditions
- A factor with fewer than 30 qualifying stocks

#### Steps
1. The table renders.

#### Expected Result
- The header carries {n} qualified, 30 needed, every cell is Not enough to rank and the column's sort control is absent.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S6-1; no further cases are invented.

### TC-COMP-114: Retired stock reads Not followed on every factor in Compare

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S1-4, DAC-E5-3, AC-15
**Priority:** P1
**Type:** functional

#### Preconditions
- A retired stock

#### Steps
1. Compared.

#### Expected Result
- Every factor reads Not followed.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S1-4; no further cases are invented.

### TC-COMP-115: Retired stock's earlier classifications remain visible

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S2-3, DAC-E5-3, AC-15
**Priority:** P1
**Type:** functional

#### Preconditions
- A retired stock

#### Steps
1. The tab renders.

#### Expected Result
- Its earlier classifications remain visible.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S2-3; no further cases are invented.

### TC-COMP-116: Retired stock evidence reads Not followed; history keeps scores

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S3-4, DAC-E5-3, AC-15
**Priority:** P1
**Type:** functional

#### Preconditions
- A retired stock

#### Steps
1. The screen renders.

#### Expected Result
- Each factor reads Not followed while earlier classifications stay in the history tab.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S3-4; no further cases are invented.

### TC-COMP-119: Retired member shows Not followed, absent from All followed stocks

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E1-S8-3, DAC-E1-9, AC-15
**Priority:** P1
**Type:** functional

#### Preconditions
- A retired instrument that remains a member

#### Steps
1. The table renders.

#### Expected Result
- It shows Not followed on every factor and never appears under All followed stocks.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E1-S8-3; no further cases are invented.

### TC-COMP-127: Compare keeps incomplete stock's column with the input named

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S1-1, DAC-E5-1, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- A stock incomplete on a factor

#### Steps
1. Compared.

#### Expected Result
- Its column remains with Incomplete and the input named; not enough to rank is stated once per group.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S1-1; no further cases are invented.

### TC-COMP-128: Compare blocks Add at six and prompts below two

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S1-2, DAC-E5-1, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- Six columns

#### Steps
1. Add is attempted.

#### Expected Result
- It is `blocked` with A comparison holds up to 6 stocks.; given fewer than two, Then Choose 2 to 6 stocks to compare. is shown.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S1-2; no further cases are invented.

### TC-COMP-129: Unknown symbol is a field error; no column added

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S1-3, DAC-E5-1, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- `instrument_not_found`

#### Steps
1. An added symbol is unknown.

#### Expected Result
- It is a field error and no column is added; `unknown_symbols` from the server are reported.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S1-3; no further cases are invented.

### TC-COMP-130: Exporting requestJson changes only the export keyword

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S1-1, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- `client.ts`

#### Steps
1. The export is added.

#### Expected Result
- Only the `export` keyword changes and every delivered client test still passes.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S1-1; no further cases are invented.

### TC-COMP-131: Every API response field has a typed counterpart; scores stay strings

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S1-4, DAC-E4-3, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- Every response in classification-api section 2.7

#### Steps
1. Mapped.

#### Expected Result
- Each field has a typed counterpart and decimal-string scores stay strings until formatted.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S1-4; no further cases are invented.

### TC-COMP-132: ResearchQuery URL round-trip; one sentence per bound

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S2-1, DAC-E4-3, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- Any `ResearchQuery`

#### Steps
1. Encoded and decoded.

#### Expected Result
- It round-trips equal, each threshold sentence maps to exactly one of the twelve bounds and an invalid key is dropped, not sent.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S2-1; no further cases are invented.

### TC-COMP-133: Save payload is twelve bounds, hide_incomplete and symbol

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S2-2, DAC-E4-3, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- A save payload built from the query

#### Steps
1. Constructed.

#### Expected Result
- It is the twelve bounds, `hide_incomplete` and `symbol`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S2-2; no further cases are invented.

### TC-COMP-134: Threshold field validates percentile and non-finite scores on blur

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S5-1, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- A percentile of 101 or a non-finite standardised score

#### Steps
1. The field blurs.

#### Expected Result
- It is a field error before any request; a blank value means no threshold.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S5-1; no further cases are invented.

### TC-COMP-135: One list request per filter change, URL updated

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S5-2, DAC-E4-3, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- A threshold, scope, hide-incomplete or search change

#### Steps
1. Made.

#### Expected Result
- Exactly one list request is issued with the mapped parameters and the URL updates.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S5-2; no further cases are invented.

### TC-COMP-136: Clear filters resets filters and keeps sort

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S5-3, DAC-E4-3, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- Clear filters

#### Steps
1. Activated.

#### Expected Result
- All filters reset and the sort is kept.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S5-3; no further cases are invented.

### TC-COMP-137: Threshold sentences have accessible names reading as sentences

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S5-4, AC-16
**Priority:** P2
**Type:** non-functional

#### Preconditions
- Each sentence

#### Steps
1. Read by assistive technology.

#### Expected Result
- Its accessible name reads as the blanks of the sentence.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S5-4; no further cases are invented.

### TC-COMP-138: Sort issues request, updates aria-sort, announces count

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S6-2, AC-16
**Priority:** P2
**Type:** non-functional

#### Preconditions
- A sort activation

#### Steps
1. Made.

#### Expected Result
- A request with `sort` and `order` is issued, `aria-sort` follows, focus does not move and the new match count is announced.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S6-2; no further cases are invented.

### TC-COMP-139: Selection and checking do not interfere

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S6-4, AC-16
**Priority:** P2
**Type:** non-functional

#### Preconditions
- Click or Enter selects and Space on the checkbox checks

#### Steps
1. Used.

#### Expected Result
- Selection (`aria-selected`) and checking never interfere.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S6-4; no further cases are invented.

### TC-COMP-140: Compare tray blocked at 1 or 7, enabled at 2 to 6

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S7-1, AC-16
**Priority:** P2
**Type:** non-functional

#### Preconditions
- 1 or 7 checked stocks

#### Steps
1. The tray renders.

#### Expected Result
- Compare is `blocked` with its reason and stays focusable; at 2 to 6 it is enabled.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S7-1; no further cases are invented.

### TC-COMP-141: Inspector debounces 150 ms and shows inputs with dates

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S7-2, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- A selected stock

#### Steps
1. The inspector loads.

#### Expected Result
- One read is issued after a 150 ms debounce and shows each input with `as_of` and `known_on`.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S7-2; no further cases are invented.

### TC-COMP-142: Inspector empty sentence when nothing selected

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S7-3, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- Nothing selected

#### Steps
1. The inspector renders.

#### Expected Result
- The empty sentence is shown.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S7-3; no further cases are invented.

### TC-COMP-143: Inspector reads In no universe

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S7-4, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- A stock in no active universe

#### Steps
1. The inspector renders.

#### Expected Result
- It reads In no universe.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S7-4; no further cases are invented.

### TC-COMP-144: Heading shows server matchCount

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S9-2, DAC-E4-3, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- A result

#### Steps
1. The heading renders.

#### Expected Result
- The h1 shows the server's `matchCount`, not the loaded row count.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S9-2; no further cases are invented.

### TC-COMP-145: Reload and back restore state from the URL

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S9-3, DAC-E4-3, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- A reload or back navigation

#### Steps
1. The screen loads.

#### Expected Result
- Thresholds, scope, hide-incomplete, search and sort are restored from the URL.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S9-3; no further cases are invented.

### TC-COMP-149: Unknown symbol shows not-found state

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S3-5, AC-17
**Priority:** P2
**Type:** functional

#### Preconditions
- An unknown symbol

#### Steps
1. The screen loads.

#### Expected Result
- A not-found state is shown, not an empty card set.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S3-5; no further cases are invented.

### TC-COMP-154: Earlier scores tab lists results newest first, not recomputed

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S2-1, DAC-E5-4, AC-18, AC-19
**Priority:** P1
**Type:** functional

#### Preconditions
- Recorded sets

#### Steps
1. The tab renders.

#### Expected Result
- Results are newest first and none is recomputed or re-dated.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S2-1; no further cases are invented.

### TC-COMP-155: No earlier scores shown distinct from never scored

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S2-2, DAC-E5-4, AC-18, AC-19
**Priority:** P1
**Type:** functional

#### Preconditions
- No earlier sets

#### Steps
1. The tab renders.

#### Expected Result
- No earlier scores is shown, distinct from never scored.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S2-2; no further cases are invented.

### TC-COMP-174: Banner absent when later null; warning banner when building

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S4-1, DAC-E4-4, AC-20, AC-21
**Priority:** P1
**Type:** functional

#### Preconditions
- `later` null

#### Steps
1. The banner renders.

#### Expected Result
- None appears; given `building`, Then a `status-warning` banner reads Not reflecting the latest download with Updating on the as-of line.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S4-1; no further cases are invented.

### TC-COMP-175: Failed attempt banner shows recorded reason, no retry

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S4-2, DAC-E4-4, AC-20, AC-21
**Priority:** P1
**Type:** functional

#### Preconditions
- A failed attempt

#### Steps
1. The banner renders.

#### Expected Result
- It reads Score update failed with the recorded reason, keeps the previous set and offers nothing to retry.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S4-2; no further cases are invented.

### TC-COMP-176: Failed poll keeps banner and offers Try again

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S4-4, DAC-E4-4, AC-20, AC-21
**Priority:** P1
**Type:** functional

#### Preconditions
- A failed poll

#### Steps
1. It errors.

#### Expected Result
- The banner stays and a Try again control is offered.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S4-4; no further cases are invented.

### TC-COMP-177: New complete set triggers exactly one announcement and reload

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S4-5, DAC-E4-4, AC-20, AC-21
**Priority:** P1
**Type:** non-functional

#### Preconditions
- The poll reports a new complete set

#### Steps
1. It arrives.

#### Expected Result
- Exactly one announcement and one reload occur and no second reload follows.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S4-5; no further cases are invented.

### TC-COMP-179: As-of line shows times in America/Chicago with run link

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S4-3, AC-21
**Priority:** P2
**Type:** functional

#### Preconditions
- The as-of line

#### Steps
1. Rendered.

#### Expected Result
- It reads Scores from {time} from the download started {time} in America/Chicago linked to run detail, with no number or UUID.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S4-3; no further cases are invented.

### TC-COMP-180: Earlier sets dialog opens and returns focus

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S9-4, AC-21
**Priority:** P2
**Type:** non-functional

#### Preconditions
- Earlier sets

#### Steps
1. Activated.

#### Expected Result
- The history dialog opens listing sets by download start time and focus returns to the control on close.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S9-4; no further cases are invented.

### TC-COMP-182: Fetch layer surfaces envelope code, operation, resource, reason

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S1-2, AC-22
**Priority:** P2
**Type:** functional

#### Preconditions
- An API error envelope

#### Steps
1. The fetch layer receives it.

#### Expected Result
- It surfaces the code, operation, resource and reason to the caller without parsing prose.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S1-2; no further cases are invented.

### TC-COMP-183: Types express neverClassified, set and later as one shape

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S1-3, AC-22
**Priority:** P2
**Type:** functional

#### Preconditions
- A response with `set` null and `later` populated

#### Steps
1. Typed.

#### Expected Result
- The types express `neverClassified`, `set` and `later` as one shape.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S1-3; no further cases are invented.

### TC-COMP-184: Never-populated store polls from first load

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S4-6, DAC-E4-2, AC-22
**Priority:** P2
**Type:** functional

#### Preconditions
- A never-populated store

#### Steps
1. The poll runs.

#### Expected Result
- It polls from first load and the first completion renders the populated state.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S4-6; no further cases are invented.

### TC-COMP-185: Never-populated body distinct from no-match state

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S9-1, DAC-E4-2, AC-22
**Priority:** P2
**Type:** functional

#### Preconditions
- A never-populated store

#### Steps
1. The screen renders.

#### Expected Result
- The body reads No stocks have been scored yet with the first set's Updating or Score update failed and the download's state, and is distinct from No stocks match these filters with Clear filters.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S9-1; no further cases are invented.

### TC-COMP-190: Possibly restated mark on Compare percentiles, sentence once

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S1-5, DAC-E5-5, AC-23
**Priority:** P1
**Type:** functional

#### Preconditions
- A restated value or growth percentile

#### Steps
1. Rendered.

#### Expected Result
- The mark appears on it with the meaning sentence once per screen.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S1-5; no further cases are invented.

### TC-COMP-191: Restatement mark on history rows retained for older rows

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S2-4, DAC-E5-5, AC-23
**Priority:** P1
**Type:** functional

#### Preconditions
- A row with `restated_possible`

#### Steps
1. Rendered.

#### Expected Result
- The mark appears on that row and is retained for older rows.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S2-4; no further cases are invented.

### TC-COMP-192: STD-UI-18 sentence once; restatement meaning beside first mark

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E5-S3-3, DAC-E5-5, AC-23
**Priority:** P1
**Type:** functional

#### Preconditions
- The screen

#### Steps
1. Rendered.

#### Expected Result
- The STD-UI-18 sentence appears once and the restatement meaning appears beside the first mark.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E5-S3-3; no further cases are invented.

### TC-COMP-193: Rail reads five destinations in order; landing redirect unchanged

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S10-1, DAC-E4-6
**Priority:** P3
**Type:** functional

#### Preconditions
- The shell

#### Steps
1. Rendered.

#### Expected Result
- The rail reads Coverage, Instruments, Runs, Settings, Research in that order and the landing redirect is unchanged.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S10-1; no further cases are invented.

### TC-COMP-194: Five research routes render inside the shell

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S10-2, DAC-E4-6
**Priority:** P3
**Type:** functional

#### Preconditions
- `routes.tsx`

#### Steps
1. `/research`, `/research/stocks/:symbol`, `/research/compare`, `/research/universes` and `/research/universes/:universeId` are visited.

#### Expected Result
- Each renders its screen inside the shell.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S10-2; no further cases are invented.

### TC-COMP-195: Unreachable state applies to every CAP-002 route

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S10-3, DAC-E4-6
**Priority:** P3
**Type:** functional

#### Preconditions
- The unreachable state

#### Steps
1. Any CAP-002 route is visited.

#### Expected Result
- The delivered unreachable behaviour applies.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S10-3; no further cases are invented.

### TC-COMP-196: Only shell, routes and four tests changed, assertions limited

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S10-4, DAC-E4-6
**Priority:** P3
**Type:** functional

#### Preconditions
- `git diff`

#### Steps
1. Read.

#### Expected Result
- The only delivered files changed are `shell.tsx`, `routes.tsx` and the four tests, and no assertion other than the five counts and the route-source enumeration changed (AGT-SCOPE-002).

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S10-4; no further cases are invented.

### TC-COMP-197: SHELL_ROUTES link targets point at delivered routes

**Scope:** component
**Component(s):** classification-ui
**Traces to:** DAC-E4-S10-5, DAC-E4-6
**Priority:** P3
**Type:** functional

#### Preconditions
- `SHELL_ROUTES` in `copy.ts`

#### Steps
1. The link targets are read.

#### Expected Result
- They point at delivered routes.

#### Error / Edge Cases
- This scenario is itself the named condition in DAC-E4-S10-5; no further cases are invented.

