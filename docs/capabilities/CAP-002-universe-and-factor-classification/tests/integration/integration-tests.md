---
artifact_schema_version: 1
artifact_id: CAP-002-integration-tests
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
    - id: CAP-002-component-design-research-store
      version: "2"
    - id: CAP-002-component-design-universe-service
      version: "2"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-classification-scheduler
      version: "2"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-component-design-classification-ui
      version: "3"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# CAP-002 Integration Test Specification

### TC-INT-001: POST /api/universes creates a universe from covered symbols

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-1, AC-3
**Priority:** P1
**Type:** functional

#### Preconditions
- A complete classification set exists covering at least 30 actively acquired stocks
- Symbols AAA and BBB are covered by acquisition

#### Steps
1. POST /api/universes with {"name": "Core", "symbols": ["AAA","BBB"]}.
2. GET /api/universes/{id} for the returned id.

#### Expected Result
- First call returns 201 UniverseResponse with 2 members and a classification cell per member.
- Second call returns the same two members.

#### Error / Edge Cases
- Duplicate symbols in the request: not named in the specs; recorded as a coverage note, not tested.

### TC-INT-002: POST /api/universes refuses an uncovered symbol

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-1, DAC-E1-1
**Priority:** P1
**Type:** functional

#### Preconditions
- Symbol AAA is covered; symbol ZZZ is not covered by acquisition

#### Steps
1. POST /api/universes with symbols ["AAA","ZZZ"].
2. GET /api/universes.

#### Expected Result
- First call returns 409 instrument_not_acquired with a symbols list containing ZZZ.
- The universe list does not contain the requested name; nothing was written.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-003: POST /api/universes/{id}/members adds covered symbols

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-1, AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- An active universe with member AAA; BBB is covered

#### Steps
1. POST /api/universes/{id}/members with {"symbols": ["BBB"]}.
2. GET /api/universes/{id}.

#### Expected Result
- First call returns 200 with BBB in added and an empty already_member.
- The universe now has members AAA and BBB.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-004: POST /api/universes/{id}/members refuses an uncovered symbol

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-1, AC-4
**Priority:** P1
**Type:** functional

#### Preconditions
- An active universe with member AAA; ZZZ is not covered

#### Steps
1. POST /api/universes/{id}/members with symbols ["ZZZ"].
2. GET /api/universes/{id}.

#### Expected Result
- Call returns 409 instrument_not_acquired naming ZZZ.
- Membership is unchanged.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-005: POST /api/universes from a filter snapshots the filtered result

**Scope:** integration
**Component(s):** classification-api, universe-service, classification-reader, research-store
**Traces to:** AC-2, DAC-E1-2, DAC-E1-3
**Priority:** P1
**Type:** functional

#### Preconditions
- A complete classification set exists covering at least 30 actively acquired stocks
- The current set id S and a filter (for example a value percentile lower bound) that matches 5 stocks

#### Steps
1. GET /api/classifications with the filter and note match_count and the symbols.
2. POST /api/universes with {"name", "filter": {bounds, hide_incomplete, symbol}, "set_id": S}.
3. GET /api/universes/{id}.

#### Expected Result
- Step 2 returns 201 with 5 members equal to the step 1 result and an origin carrying the bounds, hide_incomplete, symbol, set_id and the set's classification_date.
- Step 3 returns the same members and origin.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-006: POST /api/universes from a filter refuses a superseded set

**Scope:** integration
**Component(s):** classification-api, universe-service, classification-reader, research-store
**Traces to:** AC-2, DAC-E1-2
**Priority:** P1
**Type:** functional

#### Preconditions
- Set S is complete; a newer set S2 has since become the current complete set

#### Steps
1. POST /api/universes with a filter and set_id S.
2. GET /api/universes.

#### Expected Result
- First call returns 409 classification_set_changed.
- No universe with the requested name exists.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-007: A filter-built universe keeps its members after a new set

**Scope:** integration
**Component(s):** classification-api, universe-service, classification-reader, research-store
**Traces to:** AC-2
**Priority:** P1
**Type:** functional

#### Preconditions
- A universe saved from a filter with 5 members under set S
- A newer complete set S2 in which the filter would match a different set of stocks

#### Steps
1. GET /api/universes/{id}.
2. GET /api/classifications with the same filter.

#### Expected Result
- Step 1 returns exactly the 5 saved members.
- Step 2 returns a different match set than the universe members; the universe was not altered.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-008: POST /api/universes from a filter matching no stock is refused

**Scope:** integration
**Component(s):** classification-api, universe-service, classification-reader, research-store
**Traces to:** AC-5, AC-2
**Priority:** P1
**Type:** functional

#### Preconditions
- A complete classification set exists covering at least 30 actively acquired stocks
- A filter that matches zero stocks

#### Steps
1. POST /api/universes with that filter and the current set_id.

#### Expected Result
- 422 empty_universe; no universe is created.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-009: One stock belongs to two universes at the same time

**Scope:** integration
**Component(s):** classification-api, universe-service, classification-reader, research-store
**Traces to:** AC-3, DAC-E3-8
**Priority:** P2
**Type:** functional

#### Preconditions
- Universes U1 and U2 both containing AAA

#### Steps
1. GET /api/universes.
2. GET /api/classifications/stocks/AAA.

#### Expected Result
- Both universes are listed as active.
- The evidence response memberships lists U1 and U2 in name order.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-010: POST /api/universes refuses a name already used by an active universe

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-3, AC-4, DAC-E1-4
**Priority:** P2
**Type:** functional

#### Preconditions
- An active universe named Core

#### Steps
1. POST /api/universes with name "Core" and covered symbols.

#### Expected Result
- 409 universe_name_in_use; exactly one universe named Core exists.

#### Error / Edge Cases
- After Core is retired the same name is accepted (DAC-E1-4); covered at component scope (DAC-E1-S3-4).

### TC-INT-011: PATCH /api/universes/{id} renames and keeps history

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-4, DAC-E1-5
**Priority:** P1
**Type:** functional

#### Preconditions
- An active universe with 2 members and prior events

#### Steps
1. PATCH /api/universes/{id} with {"name": "Renamed"}.
2. GET /api/universes/{id}/events.

#### Expected Result
- 200 UniverseResponse with the same universe id and the new name.
- Events list shows all earlier events plus one renamed event; no earlier event changed.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-012: PATCH /api/universes/{id} refuses a name in use

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Active universes Core and Other

#### Steps
1. PATCH Other with {"name": "Core"}.

#### Expected Result
- 409 universe_name_in_use; Other keeps its name.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-013: PATCH on a retired universe is refused

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-4
**Priority:** P2
**Type:** functional

#### Preconditions
- A retired universe

#### Steps
1. PATCH /api/universes/{id} with a new name.

#### Expected Result
- 409 universe_retired; the name is unchanged.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-014: DELETE /api/universes/{id} retires without deleting

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-4, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- An active universe with 2 members

#### Steps
1. DELETE /api/universes/{id}.
2. GET /api/universes (default lifecycle).
3. GET /api/universes?lifecycle=retired.
4. GET /api/universes/{id}.

#### Expected Result
- 200 {lifecycle: retired, retired_at}.
- The universe is absent from the active list.
- The universe is present in the retired list.
- Members and events remain readable.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-015: DELETE on an already retired universe is refused

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-4
**Priority:** P3
**Type:** functional

#### Preconditions
- A retired universe

#### Steps
1. DELETE /api/universes/{id}.

#### Expected Result
- 409 universe_retired.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-016: DELETE /api/universes/{id}/members/{symbol} removes but retains history

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-6, AC-4
**Priority:** P1
**Type:** functional

#### Preconditions
- A universe with members AAA and BBB

#### Steps
1. DELETE /api/universes/{id}/members/BBB.
2. GET /api/universes/{id}.
3. GET /api/universes/{id}/events.

#### Expected Result
- 200 {removed_at}.
- BBB is not a current member.
- Both member_added and member_removed events for BBB are listed.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-017: POST /api/universes with no symbols is refused

**Scope:** integration
**Component(s):** classification-api, universe-service
**Traces to:** AC-5
**Priority:** P1
**Type:** functional

#### Preconditions
- None

#### Steps
1. POST /api/universes with {"name": "Empty", "symbols": []}.
2. GET /api/universes.

#### Expected Result
- Request is rejected (422 empty_universe or validation_error).
- No universe named Empty exists.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-018: DELETE the last member is refused

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-5, DAC-E1-7
**Priority:** P1
**Type:** functional

#### Preconditions
- An active universe with exactly one member AAA

#### Steps
1. DELETE /api/universes/{id}/members/AAA.
2. GET /api/universes/{id}.

#### Expected Result
- 409 last_member.
- AAA is still a member and the universe is active.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-019: GET /api/universes/{id}?as_of returns past membership

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-6, DAC-E1-8
**Priority:** P1
**Type:** functional

#### Preconditions
- A universe created on D1 with AAA and BBB, BBB removed on D2, CCC added on D3

#### Steps
1. GET /api/universes/{id}?as_of=D1.
2. GET /api/universes/{id}?as_of=D2.
3. GET /api/universes/{id}?as_of=D3.

#### Expected Result
- Members AAA, BBB.
- Members AAA.
- Members AAA, CCC.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-020: GET /api/universes/{id}?as_of before creation reports as_of_before_creation

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-6, DAC-E1-8
**Priority:** P2
**Type:** functional

#### Preconditions
- A universe created on D1

#### Steps
1. GET /api/universes/{id}?as_of=<a date before D1>.

#### Expected Result
- 200 with no members, as_of_before_creation true and the creation date.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-021: GET /api/universes/{id}/events lists membership events newest first

**Scope:** integration
**Component(s):** classification-api, universe-service, research-store
**Traces to:** AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A universe with a created, member_added, member_removed and renamed event

#### Steps
1. GET /api/universes/{id}/events.

#### Expected Result
- 200 UniverseEventsResponse listing all events newest first; none omitted.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-022: GET /api/universes/{id} rejects a malformed as_of

**Scope:** integration
**Component(s):** classification-api, universe-service
**Traces to:** AC-6
**Priority:** P3
**Type:** functional

#### Preconditions
- An existing universe

#### Steps
1. GET /api/universes/{id}?as_of=not-a-date.

#### Expected Result
- 422 validation error.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-023: GET /api/universes/{id} for an unknown universe returns 404

**Scope:** integration
**Component(s):** classification-api, universe-service
**Traces to:** AC-6
**Priority:** P3
**Type:** functional

#### Preconditions
- No universe with the requested id

#### Steps
1. GET /api/universes/{random uuid}.

#### Expected Result
- 404 universe_not_found in the error envelope.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-024: Forward-only migrations apply without touching CAP-001 data

**Scope:** integration
**Component(s):** research-store
**Traces to:** AC-19, AC-6
**Priority:** P2
**Type:** functional

#### Preconditions
- A store at migration 0004 with CAP-001 data

#### Steps
1. Apply the migrator.
2. Re-apply the migrator.

#### Expected Result
- Versions 5 and 6 are recorded, CAP-001 rows are unchanged, and the second run applies nothing.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-025: Evidence exposes the eight factor inputs derived from acquired data

**Scope:** integration
**Component(s):** classification-api, factor-engine, research-store
**Traces to:** AC-7, AC-17
**Priority:** P1
**Type:** functional

#### Preconditions
- Acquisition data for a stock with at least 8 quarters of fundamentals and 13 months of bars; classification has completed

#### Steps
1. GET /api/classifications/stocks/{symbol}.

#### Expected Result
- The response lists the eight inputs (book-to-price, earnings yield, free-cash-flow yield, revenue growth, EPS growth, 3-, 6-, 12-month return) each with a value, as_of and known_on, grouped under value, growth and momentum.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-026: A stock's classification is identical unscoped and within each universe

**Scope:** integration
**Component(s):** classification-api, classification-reader, universe-service, research-store
**Traces to:** AC-8
**Priority:** P1
**Type:** functional

#### Preconditions
- Stock AAA is in universes U1 and U2 and in none other

#### Steps
1. GET /api/classifications?symbol=AAA (unscoped).
2. GET /api/classifications?universe_id=U1.
3. GET /api/classifications?universe_id=U2.

#### Expected Result
- The three AAA rows carry identical score and percentile for value, growth and momentum.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-027: GET /api/classifications returns score and percentile per ranked factor

**Scope:** integration
**Component(s):** classification-api, classification-reader, research-store
**Traces to:** AC-9
**Priority:** P1
**Type:** functional

#### Preconditions
- A complete classification set exists covering at least 30 actively acquired stocks

#### Steps
1. GET /api/classifications.

#### Expected Result
- 200 ClassificationListResponse with set, later and match_count; each ranked factor cell has a standardised score and a percentile between 0 and 100, serialised as decimal strings.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-028: Succeeded and partial acquisition runs lead to a classification set

**Scope:** integration
**Component(s):** classification-scheduler, factor-engine, research-store
**Traces to:** AC-10
**Priority:** P1
**Type:** functional

#### Preconditions
- Two ended runs: one succeeded, one partial, neither with a classification set

#### Steps
1. Leave the running product idle for enough poll intervals to classify both runs.
2. Read the sets via GET /api/classifications/sets.

#### Expected Result
- Two complete sets exist, one per run, created in ended_at order, each recording its run.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-029: Failed, cancelled and abandoned runs lead to no set

**Scope:** integration
**Component(s):** classification-scheduler, research-store
**Traces to:** AC-10, DAC-E2-4
**Priority:** P1
**Type:** functional

#### Preconditions
- Ended runs in failed, cancelled and abandoned state, one of which wrote observations before stopping

#### Steps
1. Leave the running product idle for several poll intervals.
2. GET /api/classifications/sets.

#### Expected Result
- No set exists for any of those runs.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-030: A second set claim for the same run is refused

**Scope:** integration
**Component(s):** classification-scheduler, research-store
**Traces to:** AC-10, DAC-E2-4
**Priority:** P2
**Type:** functional

#### Preconditions
- A run that already has a classification set

#### Steps
1. Execute the Set claim insert for the same run_id.

#### Expected Result
- The unique violation is raised and handled as no claim; the set count for the run stays 1.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-031: Classification of 3000 stocks completes within 5 minutes of run end

**Scope:** integration
**Component(s):** classification-scheduler, factor-engine, research-store, classification-api
**Traces to:** AC-11
**Priority:** P1
**Type:** performance

#### Preconditions
- Acquisition data for 3000 actively acquired stocks and a run that ends succeeded at time T

#### Steps
1. Record T.
2. Poll GET /api/classifications/summary until set reflects the run.

#### Expected Result
- The summary reports the new complete set no later than T + 5 minutes.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-032: Evidence names the missing input when a factor is not classified

**Scope:** integration
**Component(s):** classification-api, factor-engine, research-store
**Traces to:** AC-12
**Priority:** P1
**Type:** functional

#### Preconditions
- Stock AAA lacks one value input (for example no cash-flow statement)

#### Steps
1. GET /api/classifications/stocks/AAA.

#### Expected Result
- Value is not_classified with reason input_missing naming the missing input and no score or percentile; growth and momentum are still classified.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-033: Thresholds exclude only classified stocks that fail the bound

**Scope:** integration
**Component(s):** classification-api, classification-reader, research-store
**Traces to:** AC-12, AC-16, DAC-E3-3
**Priority:** P1
**Type:** functional

#### Preconditions
- A set with one stock incomplete on value and others classified

#### Steps
1. GET /api/classifications with a value percentile lower bound of 50.

#### Expected Result
- The incomplete stock is listed and counted; only classified stocks below the bound are excluded.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-034: A fundamental older than 6 months is outdated; exactly 6 months is present

**Scope:** integration
**Component(s):** classification-api, factor-engine, research-store
**Traces to:** AC-13
**Priority:** P1
**Type:** functional

#### Preconditions
- Stock AAA whose latest period ended 6 months and a day before the classification date; stock BBB whose latest period ended exactly 6 months before

#### Steps
1. GET /api/classifications/stocks/AAA.
2. GET /api/classifications/stocks/BBB.

#### Expected Result
- AAA fundamental inputs are outdated and value/growth are not_classified with reason input_outdated naming the input.
- BBB inputs are present.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-035: Summary counts stocks with missing or outdated inputs as not current

**Scope:** integration
**Component(s):** classification-api, classification-reader, research-store
**Traces to:** AC-13, DAC-E3-10
**Priority:** P2
**Type:** functional

#### Preconditions
- A current set in which one stock has an outdated input, one has a not_computable input and the rest are present

#### Steps
1. GET /api/classifications/summary.

#### Expected Result
- stocks_current excludes the outdated stock and includes the not_computable stock.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-036: Fewer than 30 qualifying stocks shows no scores

**Scope:** integration
**Component(s):** classification-api, factor-engine, classification-reader, research-store
**Traces to:** AC-14
**Priority:** P1
**Type:** functional

#### Preconditions
- A set in which 29 stocks have every growth input present

#### Steps
1. GET /api/classifications.
2. GET /api/classifications/summary.

#### Expected Result
- Every stock is not_classified on growth with reason not_enough_stocks and the count 29 of 30; no growth score or percentile appears; other factors rank normally.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-037: Retired stock is excluded unscoped and shown as retired in a universe

**Scope:** integration
**Component(s):** classification-api, classification-reader, universe-service, factor-engine, research-store
**Traces to:** AC-15, DAC-E3-5
**Priority:** P1
**Type:** functional

#### Preconditions
- Stock RRR retired from acquisition and a member of universe U

#### Steps
1. GET /api/classifications (unscoped).
2. GET /api/classifications?universe_id=U.

#### Expected Result
- RRR is absent from the unscoped list and from every peer set.
- RRR is listed in U, not_classified with reason retired on all three factors.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-038: Compare includes a retired stock with its retired reason

**Scope:** integration
**Component(s):** classification-api, classification-reader, research-store
**Traces to:** AC-15, AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- Retired stock RRR and active stock AAA

#### Steps
1. GET /api/classifications?symbols=RRR,AAA.

#### Expected Result
- Both are returned; RRR cells are not_classified with reason retired.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-039: List sorts by factor and pages with a stable match_count

**Scope:** integration
**Component(s):** classification-api, classification-reader, research-store
**Traces to:** AC-16, DAC-E3-6
**Priority:** P1
**Type:** functional

#### Preconditions
- A set with more stocks than one page

#### Steps
1. GET /api/classifications?sort=<allowed value>&order=desc&limit=10.
2. Follow next_cursor to the second page.

#### Expected Result
- Rows are ordered by the sort; match_count equals the whole filtered scope on both pages.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-040: Compare reports unrecognised symbols

**Scope:** integration
**Component(s):** classification-api, classification-reader, research-store
**Traces to:** AC-16, DAC-E3-7
**Priority:** P1
**Type:** functional

#### Preconditions
- Known stocks AAA and BBB

#### Steps
1. GET /api/classifications?symbols=AAA,BBB,NOPE.

#### Expected Result
- AAA and BBB returned; NOPE listed in unknown_symbols.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-041: Compare outside 2 to 6 symbols is rejected

**Scope:** integration
**Component(s):** classification-api, classification-reader
**Traces to:** AC-16
**Priority:** P2
**Type:** functional

#### Preconditions
- Known stocks

#### Steps
1. GET /api/classifications?symbols=AAA.
2. GET /api/classifications?symbols= with 7 symbols.

#### Expected Result
- Both calls return 422.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-042: A tampered or stale cursor is rejected

**Scope:** integration
**Component(s):** classification-api, classification-reader
**Traces to:** AC-16
**Priority:** P3
**Type:** functional

#### Preconditions
- A first page with next_cursor

#### Steps
1. GET /api/classifications with an altered cursor.
2. GET /api/classifications with the cursor after a new set becomes current.

#### Expected Result
- First returns 422 cursor_invalid; second returns 422 cursor_stale.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-043: Scoping to an unknown universe returns 404

**Scope:** integration
**Component(s):** classification-api, classification-reader, universe-service
**Traces to:** AC-16
**Priority:** P3
**Type:** functional

#### Preconditions
- No universe with the requested id

#### Steps
1. GET /api/classifications?universe_id={random uuid}.

#### Expected Result
- 404 universe_not_found.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-044: Evidence lists every input with value, as_of and known_on

**Scope:** integration
**Component(s):** classification-api, classification-reader, research-store
**Traces to:** AC-17
**Priority:** P1
**Type:** functional

#### Preconditions
- A current set and a classified stock AAA

#### Steps
1. GET /api/classifications/stocks/AAA.

#### Expected Result
- 200 StockEvidenceResponse with every input of the current set, each with value (when present), as_of and known_on, and the active universes of AAA.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-045: Evidence for an unknown symbol returns 404

**Scope:** integration
**Component(s):** classification-api, classification-reader
**Traces to:** AC-17
**Priority:** P2
**Type:** functional

#### Preconditions
- No instrument NOPE

#### Steps
1. GET /api/classifications/stocks/NOPE.

#### Expected Result
- 404 instrument_not_found.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-046: History lists a stock's complete sets newest first

**Scope:** integration
**Component(s):** classification-api, classification-reader, research-store
**Traces to:** AC-18
**Priority:** P1
**Type:** functional

#### Preconditions
- Three complete sets and one failed set containing results for AAA

#### Steps
1. GET /api/classifications/stocks/AAA/history.

#### Expected Result
- Three results newest first exactly as recorded; the failed set contributes none.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-047: A later set does not overwrite earlier classification rows

**Scope:** integration
**Component(s):** factor-engine, research-store
**Traces to:** AC-18
**Priority:** P1
**Type:** functional

#### Preconditions
- A complete set S1 with recorded rows

#### Steps
1. Read all S1 classification rows.
2. Let the running product classify a newer run, producing set S2.
3. Read all S1 classification rows again.

#### Expected Result
- The S1 rows are identical before and after; S2 rows exist separately.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-048: History for a never-classified stock is empty; unknown symbol is 404

**Scope:** integration
**Component(s):** classification-api, classification-reader
**Traces to:** AC-18
**Priority:** P2
**Type:** functional

#### Preconditions
- Stock NEW acquired but not yet classified

#### Steps
1. GET /api/classifications/stocks/NEW/history.
2. GET /api/classifications/stocks/NOPE/history.

#### Expected Result
- First returns 200 with an empty list; second returns 404.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-049: Backfill after a set does not alter it or backdate it

**Scope:** integration
**Component(s):** factor-engine, research-store, classification-api
**Traces to:** AC-19
**Priority:** P1
**Type:** functional

#### Preconditions
- A complete set S1 at date D; then a fundamental for an earlier period is acquired as backfill

#### Steps
1. GET /api/classifications/stocks/AAA/history before and after the backfill.
2. Let the running product classify the next qualifying run (set S2) and read AAA again.

#### Expected Result
- S1's result is identical before and after and stays dated D.
- Only S2 reflects the backfill, dated at S2's own production date.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-050: A building later set leaves the previous set displayed and marked not current

**Scope:** integration
**Component(s):** classification-api, classification-reader, classification-scheduler, research-store
**Traces to:** AC-20
**Priority:** P1
**Type:** functional

#### Preconditions
- A complete set S1 and a newer set S2 in state building

#### Steps
1. GET /api/classifications/summary.
2. GET /api/classifications.

#### Expected Result
- set is S1, later is S2 in state building and not_current is true on both reads; no S2 rows are returned.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-051: A failed build shows the failure and keeps the previous set

**Scope:** integration
**Component(s):** classification-api, factor-engine, classification-scheduler, research-store
**Traces to:** AC-20, DAC-E2-10
**Priority:** P1
**Type:** functional

#### Preconditions
- A complete set S1; a build for a newer run fails midway after writing some rows

#### Steps
1. GET /api/classifications/summary.
2. GET /api/classifications.

#### Expected Result
- set is S1; later is the failed set with its failure_reason; the list contains only S1 results.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-052: Completing a set that is no longer building changes nothing

**Scope:** integration
**Component(s):** factor-engine, research-store
**Traces to:** AC-20, DAC-E2-S2-2
**Priority:** P2
**Type:** functional

#### Preconditions
- A set already marked failed by another writer

#### Steps
1. Execute the Set state transition to complete for that set.

#### Expected Result
- Zero rows updated; the set stays failed.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-053: An interrupted building set is failed at start

**Scope:** integration
**Component(s):** classification-scheduler, research-store
**Traces to:** AC-20, DAC-E2-12
**Priority:** P1
**Type:** functional

#### Preconditions
- A set left building with no classification rows by a stopped process

#### Steps
1. Start the application.
2. GET /api/classifications/sets.

#### Expected Result
- The set is failed with the fixed interruption reason before any new claim; the next qualifying run is classified.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-054: A build failure rolls back every row of the attempt

**Scope:** integration
**Component(s):** factor-engine, research-store
**Traces to:** AC-20, DAC-E2-10
**Priority:** P1
**Type:** functional

#### Preconditions
- A classification attempt forced to fail after inputs are written

#### Steps
1. Let the running product classify the run.
2. Count rows for the set in factor_input, factor_classification and classification_set_factor.

#### Expected Result
- Zero rows in each table; the set is failed with the exception class and message.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-055: Sets list and set detail name the run and its start time

**Scope:** integration
**Component(s):** classification-api, classification-reader, research-store
**Traces to:** AC-21
**Priority:** P1
**Type:** functional

#### Preconditions
- Two complete sets

#### Steps
1. GET /api/classifications/sets.
2. GET /api/classifications/sets/{set_id}.

#### Expected Result
- Sets newest first, each with run_started_at; detail shows the same run and produced-at.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-056: Set detail for an unknown id returns 404

**Scope:** integration
**Component(s):** classification-api, classification-reader
**Traces to:** AC-21
**Priority:** P3
**Type:** functional

#### Preconditions
- No set with the id

#### Steps
1. GET /api/classifications/sets/{random uuid}.

#### Expected Result
- 404 classification_set_not_found.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-057: Before any set exists, list and summary say nothing has been classified

**Scope:** integration
**Component(s):** classification-api, classification-reader
**Traces to:** AC-22
**Priority:** P1
**Type:** functional

#### Preconditions
- A store with no classification set

#### Steps
1. GET /api/classifications.
2. GET /api/classifications/summary.

#### Expected Result
- Both return never_classified true, set null and later null in the same shape.

#### Error / Edge Cases
- None beyond the scenario.

### TC-INT-058: The restatement mark is carried on list, compare, evidence and history

**Scope:** integration
**Component(s):** classification-api, classification-reader, factor-engine, research-store
**Traces to:** AC-23, DAC-E3-12
**Priority:** P1
**Type:** functional

#### Preconditions
- A stock whose value fundamentals were backfilled before its first fundamentals observation

#### Steps
1. GET /api/classifications.
2. GET /api/classifications?symbols=AAA,BBB.
3. GET /api/classifications/stocks/AAA.
4. GET /api/classifications/stocks/AAA/history.

#### Expected Result
- restated_possible is true on the value and growth cells in all four responses and never on momentum.

#### Error / Edge Cases
- None beyond the scenario.

