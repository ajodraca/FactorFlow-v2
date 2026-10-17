---
artifact_schema_version: 1
artifact_id: CAP-002-e2e-tests
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
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# CAP-002 End-to-End Test Specification

### TC-E2E-001: Flow 1 happy path: stocks are classified after an acquisition run

**Scope:** e2e
**Component(s):** classification-ui, classification-api, classification-reader, universe-service, factor-engine, classification-scheduler, research-store
**Traces to:** AC-9, AC-10, AC-12, AC-13, AC-15, AC-21
**Priority:** P1
**Type:** functional

#### Preconditions
- At least 30 stocks are on the acquisition list with enough price and fundamentals history
- The owner has not opened Research since the last run

#### Steps
1. The owner starts an acquisition run from the acquisition screens and waits for it to end as succeeded.
2. Without any further action, the owner opens the Research screen.
3. The owner reads the as-of line.
4. The owner reads a stock that lacks one input.

#### Expected Result
- The screen lists each followed stock with a score and a whole-number percentile (0 to 100) for value, growth and momentum.
- The as-of line reads "Scores from {time}" and names the download that started at {time}, in America/Chicago, and links to that run.
- A stock lacking an input shows "Incomplete" on the affected factor and names the missing or outdated input; its other factors still show scores.

#### Error / Edge Cases
- None beyond the scenario.

### TC-E2E-002: Flow 1 error path: nothing scored, then too few stocks to rank

**Scope:** e2e
**Component(s):** classification-ui, classification-api, classification-reader, universe-service, factor-engine, classification-scheduler, research-store
**Traces to:** AC-14, AC-22, AC-20
**Priority:** P1
**Type:** functional

#### Preconditions
- A new product store with no classification yet and 20 stocks on the acquisition list

#### Steps
1. The owner opens the Research screen.
2. The owner starts an acquisition run and waits for it to end as succeeded.
3. The owner reopens the Research screen.

#### Expected Result
- Before the run, the body states "No stocks have been scored yet" and shows no empty table.
- After the run, every cell of each factor column reads "Not enough to rank" and the column header states how many stocks qualified (for example 20 qualified, 30 needed); no score or percentile is shown.

#### Error / Edge Cases
- Flow step 6 (nothing classified yet) is the first observation of this journey.

### TC-E2E-003: Flow 2 happy path: build a universe by hand

**Scope:** e2e
**Component(s):** classification-ui, classification-api, classification-reader, universe-service, factor-engine, classification-scheduler, research-store
**Traces to:** AC-1, AC-3, AC-15
**Priority:** P1
**Type:** functional

#### Preconditions
- Several followed stocks have been scored
- The owner has no universe named Core

#### Steps
1. The owner opens Universes and chooses New universe.
2. The owner names it "Core" and enters three followed stock symbols.
3. The owner submits.
4. The owner opens Research, scoped to Core.

#### Expected Result
- The app opens the new universe showing the three members with their value, growth and momentum scores.
- The universe is listed among the owner's active universes.
- The Research list scoped to Core shows the same three stocks with the same scores as in All followed stocks.

#### Error / Edge Cases
- None beyond the scenario.

### TC-E2E-004: Flow 2 error path: adding a stock that is not followed

**Scope:** e2e
**Component(s):** classification-ui, classification-api, classification-reader, universe-service, factor-engine, classification-scheduler, research-store
**Traces to:** AC-1, AC-5
**Priority:** P1
**Type:** functional

#### Preconditions
- A followed stock AAA and a stock ZZZ that is not on the acquisition list

#### Steps
1. The owner opens New universe, names it "Core", and enters AAA and ZZZ.
2. The owner submits.
3. The owner opens the Universes list.

#### Expected Result
- The dialog stays open with the owner's list kept and states that ZZZ is not followed and has no data, with a link to the followed-stocks page.
- No universe named Core appears in the list.

#### Error / Edge Cases
- None beyond the scenario.

### TC-E2E-005: Flow 3 happy path: save a factor filter as a universe

**Scope:** e2e
**Component(s):** classification-ui, classification-api, classification-reader, universe-service, factor-engine, classification-scheduler, research-store
**Traces to:** AC-2, AC-16
**Priority:** P1
**Type:** functional

#### Preconditions
- Scores exist for at least 30 stocks; some stocks have high value percentile and positive momentum

#### Steps
1. The owner opens Research and sets a value percentile lower bound and a momentum score lower bound.
2. The owner reads the result count in the heading.
3. The owner chooses Save these {n} as a universe, names it, and confirms.
4. After the next acquisition run ends, the owner reopens the universe.

#### Expected Result
- The dialog and heading show the same count n.
- A toast links to the new universe, which shows exactly n members and an origin line naming the filter and the date of the scores.
- After the later run the universe still shows the same n members even if the filter now matches different stocks.

#### Error / Edge Cases
- None beyond the scenario.

### TC-E2E-006: Flow 3 error path: a filter that matches no stock

**Scope:** e2e
**Component(s):** classification-ui, classification-api, classification-reader, universe-service, factor-engine, classification-scheduler, research-store
**Traces to:** AC-2, AC-5
**Priority:** P1
**Type:** functional

#### Preconditions
- Scores exist for at least 30 stocks

#### Steps
1. The owner opens Research and sets bounds that match nothing.
2. The owner looks for the save control.

#### Expected Result
- The page states that no stocks match these filters and offers Clear filters.
- Save these 0 as a universe is blocked with its reason, and no universe is created.

#### Error / Edge Cases
- None beyond the scenario.

### TC-E2E-007: Flow 4 happy path: sort, narrow, compare and inspect evidence

**Scope:** e2e
**Component(s):** classification-ui, classification-api, classification-reader, universe-service, factor-engine, classification-scheduler, research-store
**Traces to:** AC-16, AC-17, AC-9
**Priority:** P1
**Type:** functional

#### Preconditions
- A universe with at least 4 scored stocks

#### Steps
1. The owner opens the universe in Research, sorts by momentum percentile and sets a growth threshold.
2. The owner checks three stocks and chooses Compare.
3. The owner opens the evidence for one stock.

#### Expected Result
- The list is ordered by the chosen sort and narrowed by the threshold; the heading count matches the filtered scope.
- The side-by-side view shows value, growth and momentum for all three stocks.
- The evidence page lists every input with its value and the date each was known.

#### Error / Edge Cases
- None beyond the scenario.

### TC-E2E-008: Flow 4 error path: compare a stock that is not classified on a factor

**Scope:** e2e
**Component(s):** classification-ui, classification-api, classification-reader, universe-service, factor-engine, classification-scheduler, research-store
**Traces to:** AC-12, AC-14, AC-15, AC-16
**Priority:** P1
**Type:** functional

#### Preconditions
- Stock AAA is scored; stock BBB is incomplete on growth; stock RRR is retired from acquisition but a universe member

#### Steps
1. The owner selects AAA, BBB and RRR in a universe and chooses Compare.

#### Expected Result
- All three columns are present.
- BBB shows "Incomplete" on growth with the input named, RRR shows "Not followed" on every factor, and no value is shown for either.

#### Error / Edge Cases
- None beyond the scenario.

### TC-E2E-009: Flow 5 happy path: fix insufficient evidence and see it classified

**Scope:** e2e
**Component(s):** classification-ui, classification-api, classification-reader, universe-service, factor-engine, classification-scheduler, research-store
**Traces to:** AC-12, AC-13, AC-18, AC-20, AC-23
**Priority:** P1
**Type:** functional

#### Preconditions
- After a partial acquisition run, stock BBB is not classified on growth because a fundamental is missing

#### Steps
1. The owner opens BBB's evidence and reads the growth card.
2. The owner acquires again so the stock's data completes, and waits for the run to end as succeeded.
3. The owner reopens BBB's evidence.
4. The owner opens the Earlier scores tab.

#### Expected Result
- Step 1 names the missing input, the rule and how to recover.
- After the run, growth shows a score and percentile.
- The Earlier scores tab lists the earlier "Incomplete" result with its original date, newest first.

#### Error / Edge Cases
- None beyond the scenario.

### TC-E2E-010: Flow 5 error path: the provider holds no data

**Scope:** e2e
**Component(s):** classification-ui, classification-api, classification-reader, universe-service, factor-engine, classification-scheduler, research-store
**Traces to:** AC-12, AC-13, AC-17
**Priority:** P2
**Type:** functional

#### Preconditions
- Stock CCC for which the provider holds no fundamentals

#### Steps
1. The owner opens CCC's evidence and reads the growth card.
2. The owner runs another acquisition and reopens the evidence.

#### Expected Result
- The card says the provider holds no such data and offers no recovery.
- After the run CCC remains not classified on growth and the reason still says so.

#### Error / Edge Cases
- None beyond the scenario.

### TC-E2E-011: Flow 6 happy path: maintain a universe over time

**Scope:** e2e
**Component(s):** classification-ui, classification-api, classification-reader, universe-service, factor-engine, classification-scheduler, research-store
**Traces to:** AC-3, AC-4, AC-6
**Priority:** P1
**Type:** functional

#### Preconditions
- An active universe Core with three members

#### Steps
1. The owner renames Core to "Core 2".
2. The owner adds one stock and removes another.
3. The owner opens the History tab and views members as of an earlier date.
4. The owner retires the universe.

#### Expected Result
- The universe reflects each change at once.
- History lists every event newest first (rename shows both names) and the as-of view shows the members of that earlier date.
- After retirement the header shows Retired, the universe leaves the active list, and its members and history remain readable.

#### Error / Edge Cases
- None beyond the scenario.

### TC-E2E-012: Flow 6 error path: removing the last member is refused

**Scope:** e2e
**Component(s):** classification-ui, classification-api, classification-reader, universe-service, factor-engine, classification-scheduler, research-store
**Traces to:** AC-5, AC-6, AC-15
**Priority:** P1
**Type:** functional

#### Preconditions
- An active universe with exactly one member, which is a stock retired from acquisition

#### Steps
1. The owner chooses Remove on the only member.
2. The owner chooses Retire instead.

#### Expected Result
- Remove is blocked, with a Retire action adjacent, and the member stays.
- The universe is retired; the retired stock was shown as Not followed throughout and the history still shows it as a member.

#### Error / Edge Cases
- None beyond the scenario.

