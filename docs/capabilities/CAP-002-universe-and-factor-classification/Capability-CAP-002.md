---
artifact_schema_version: 1
artifact_id: CAP-002
artifact_type: capability
artifact_version: 1
id: CAP-002
title: Universe & Factor Classification
description: >-
  Turn acquired market data into research evidence: the user defines
  a named analysis universe from instruments already covered by acquisition,
  sees each member classified by value, growth and momentum, and can inspect
  the dated inputs behind every result and where the evidence is insufficient.
created: 2026-10-12
updated: 2026-10-17
owner: Alvaro de Jodra
owner_github: ajodraca
status: approved
ai_provenance:
  agent_id: capability-definition-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Devin Desktop
  tool_version: "unknown"
  timestamp: 2026-10-13T02:20:55Z
  source_artifacts:
    - id: product-charter
      version: "2, approved 2026-09-03"
    - id: tech-stack
      version: "5, approved 2026-10-13"
    - id: STD-UI
      version: "4"
    - id: CAP-001
      version: "8, approved 2026-09-06"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
approval:
  approval_policy: owner-allowed
  approved_by: "Alvaro de Jodra"
  approved_at: 2026-10-17T03:35:36Z
  reviewed_revision: sha256:8a2706f314bf084b017d65d9a96a9ab3f9973106aa3e6fef3c34d7913741f629
  review_artifact: "docs/capabilities/CAP-002-universe-and-factor-classification/specifications-review-report-v3.md"
---

# Universe & Factor Classification

## 1. Description

FactorFlow now collects market data, but data alone doesn't help the user
(the charter's owner-operator) decide what to trade. Today the user can't pick
a set of stocks to study, see how each one scores on value, growth and
momentum, or tell whether a result is based on complete information. Without
that, there is no sound basis for defining a strategy.

This capability closes that gap. The user chooses the stocks they want to
analyse, groups them into a named universe, and sees each one classified by
value, growth and momentum. They can compare and filter those stocks, and open
any result to see the data behind it and when that data was known. If
something is missing or out of date, or a stock can't be classified, the
product tells the user plainly and says why. Incomplete data is never shown as
a complete result.

A universe is not the same as the acquisition list. The acquisition list
decides which stocks get data; a universe decides which stocks the user is
analysing. They may start out identical, but they serve different purposes.

Universes and classifications are kept with their dates, so a future backtest
can see exactly what was known at each point in time. Data filled in after the
fact is never treated as if it had been known earlier.

This capability completes M1 (Universe and Factors, 2026-Q4). It succeeds when
the user can repeat a comparison across a universe, explain every
classification, and see where the evidence falls short.

## 2. Scope

### In Scope

- The user defines a named universe from instruments already covered by
  acquisition, in either of two ways: by selecting members by hand, or by
  saving the result of filtering instruments by their classifications as a new
  universe. A universe saved from a filter is a one-time snapshot of that
  filter's result; its membership does not change later unless the user
  changes it.
- The user can hold several named universes at once, and a stock can belong
  to more than one. A universe always has at least one member: it cannot be
  created or saved empty, and removing its last member is refused in favour
  of retiring the universe (owner decision, 2026-10-12).
- The user can add stocks to and remove them from an existing universe, rename
  a universe, and retire a universe they no longer use. Renaming does not
  change a universe's identity or history. Removing a member or retiring a
  universe is not deletion: the dated record that the stock belonged, or that
  the universe existed, is kept.
- The product classifies every instrument acquisition actively covers by
  value, growth and momentum, measured against that same set of instruments.
  An instrument retired from acquisition is not classified on any factor and
  is not part of that set; it can still be a universe member, shown as not
  classified because it is retired, and its earlier classifications remain in
  history. A stock's classification is therefore the same in every universe
  it belongs to; universes group and compare stocks, they do not change how a
  stock is classified.
- The three factors mean the following (owner decision, 2026-10-12):
  - **Value** is an equally weighted composite of book-to-price, earnings
    yield (earnings to price) and free-cash-flow yield (operating cash flow
    less capital expenditure, to market capitalisation).
  - **Growth** is an equally weighted composite of trailing-twelve-month
    revenue growth and trailing-twelve-month earnings-per-share growth, each
    measured against the trailing twelve months a year earlier.
  - **Momentum** is an equally weighted composite of 3-, 6- and 12-month total
    returns, adjusted for splits and dividends, with each window ending one
    month before the classification date.
- For each factor, a stock's classification is shown as a standardised score
  together with its percentile rank (0–100) among all classified stocks.
- Scores and percentiles for a factor are produced only when at least 30
  stocks have every input that factor needs (owner decision, 2026-10-12).
  Below that, every stock is shown as not classified on that factor because
  there are not enough stocks to rank, with the number that qualified.
- Classifications are brought up to date after each acquisition run that ends
  as succeeded or partial, without the user having to request it. After a
  partial run, a stock whose inputs the failure left missing or outdated is
  not classified on the affected factors, under the rule below, rather than
  shown as complete. A run that ends failed, cancelled or
  abandoned does not lead to reclassification, even if it wrote some data
  before it stopped.
- Classifications for up to 3000 actively acquired stocks are up to date
  within 5 minutes of the acquisition run ending (owner decision, 2026-10-12;
  the volume is CAP-001 AC-4's).
- Until a new set of classifications is complete, the user sees the previous
  set marked as not reflecting the latest acquisition. If classification
  fails, the previous set stays visible with that mark, the failure and its
  reason are shown, and the next qualifying acquisition run tries again. A
  half-finished set is never shown as current.
- The user compares stocks by their classifications in three ways: sorting a
  list by any factor's score or percentile; filtering with thresholds above or
  below a chosen score or percentile on one or more factors at once; and
  placing a few chosen stocks side by side with all three factors and their
  inputs. Comparison works over all classified stocks and within a single
  universe.
- The user inspects the inputs behind a classification and the dates on which
  those inputs were known.
- A factor is classified for a stock only when every input that factor needs
  is present and current. Otherwise the stock is shown as not classified on
  that factor, with the missing or outdated input named. A score built from
  fewer inputs than its definition is never shown, so stocks are always
  compared like for like. Not being classified on one factor does not prevent
  classification on the others.
- An input is outdated when (owner decision, 2026-10-12):
  - **fundamentals** — the latest reported period ended more than 6 months
    before the classification date;
  - **prices** — the latest daily price is not from the latest trading day
    the product holds.
- A value or growth classification built from fundamentals that were
  backfilled, meaning acquired for a period already reported before
  acquisition of that stock began, is marked as possibly reflecting restated
  data. The mark stays with the classification in its history.
- Universe membership and classification results are kept as dated history,
  not overwritten, so a later backtest can establish what was known when. A
  classification is dated when it was produced, from inputs as they were known
  at that time. Data backfilled for an earlier period never makes a
  classification appear to have been known before it was produced.

### Out of Scope

- Strategy creation, paper trading, backtesting, promotion and live execution.
  These belong to later capabilities.
- Automatic acquisition of newly discovered instruments.
- Summaries of how a universe's members are spread across each factor, such
  as median percentile or quintile counts.
- Universes defined by a standing rule or screen whose membership updates on
  its own as data changes. A later capability owns that outcome, along with
  the membership history it requires.

## 3. User Flows

### User — See stocks classified after an acquisition

1. The user has stocks on the acquisition list and starts an acquisition run.
2. The run ends as succeeded or partial.
3. Without any further action, the user sees each actively acquired stock
   with a score and percentile for value, growth and momentum, and the date
   the classification was produced.
4. Where a stock could not be classified on a factor, the user sees "not
   classified" for that factor and the input that was missing or outdated.
5. If fewer than 30 stocks qualify on a factor, the user sees that there are
   not enough stocks to rank on that factor, and how many qualified.
6. If nothing has been classified yet, the product says so plainly rather
   than showing an empty list that looks complete.

### User — Build a universe by hand

1. The user wants to study a particular set of stocks.
2. They create a universe, name it, and pick its members from the stocks
   acquisition covers.
3. The universe is saved, and the user sees its members with their
   classifications.
4. If the user tries to add a stock that acquisition does not cover, the
   product tells them it has no data for that stock and that it must first
   be added to the acquisition list.

### User — Build a universe from a factor filter

1. The user wants the stocks that meet a factor profile, such as high value
   and positive momentum.
2. They filter all classified stocks with thresholds on one or more factors
   and review the result.
3. They save the result as a named universe.
4. The universe keeps exactly those members, even when later classifications
   would give the filter a different result.
5. If the filter matches no stocks, the product says so and does not save an
   empty universe.

### User — Compare stocks and inspect the evidence

1. The user opens a universe, or the list of all classified stocks.
2. They sort by any factor and narrow the list with thresholds.
3. They place a few stocks side by side and see all three factors for each.
4. They open a classification and see the inputs it was built from and the
   date each input was known.
5. Where a stock is not classified on a factor, the side-by-side view shows
   "not classified" and the reason, rather than leaving the stock out or
   showing a value.

### User — Understand and fix insufficient evidence

1. The user sees a stock that is not classified on one or more factors.
2. They open it and see which input is missing or outdated, and what made it
   so.
3. They resolve the cause, for example by acquiring again after a partial
   run.
4. After the next acquisition run that ends as succeeded or partial, the
   stock is classified on that factor, and its earlier "not classified"
   result remains in its history.
5. If the cause is that the provider holds no such data for that stock, the
   stock remains not classified on that factor, and the reason continues to
   say so.

### User — Maintain universes over time

1. The user wants to change a universe they built earlier.
2. They add or remove members, rename it, or retire it.
3. The universe reflects the change at once, and its history still shows which
   stocks were members and when.
4. A retired universe no longer appears among the user's active universes,
   and its history can still be viewed.
5. A stock retired from acquisition stays in any universe it belongs to,
   shown as not classified because it is retired.
6. If the user tries to remove a universe's last member, the product refuses
   and offers to retire the universe instead.

## 4. Acceptance Criteria

1. **AC-1 — Universe by hand:** The user MUST be able to create a named
   universe by selecting its members from the stocks acquisition covers, and
   MUST NOT be able to add a stock that acquisition does not cover.
2. **AC-2 — Universe from a filter:** The user MUST be able to save the result
   of a threshold filter as a named universe, and that universe's membership
   MUST NOT change afterwards unless the user changes it.
3. **AC-3 — Several universes:** The user MUST be able to hold more than one
   named universe at a time, and a stock MUST be able to belong to more than
   one universe.
4. **AC-4 — Universe maintenance:** The user MUST be able to add and remove
   members, rename a universe and retire a universe without editing the data
   store directly, and renaming MUST NOT change the universe's history.
5. **AC-5 — No empty universe:** The product MUST refuse to create or save a
   universe with no members, and MUST refuse to remove a universe's last
   member.
6. **AC-6 — Membership history:** Removing a member or retiring a universe
   MUST retain the dated record of membership, and the user MUST be able to
   see which stocks belonged to a universe on any past date.
7. **AC-7 — Factor definitions:** Every value, growth and momentum
   classification MUST be computed from exactly the inputs, periods and equal
   weights defined for that factor in Section 2.
8. **AC-8 — One peer set:** A stock's classification on a factor MUST be
   measured against all actively acquired stocks that qualify on that factor,
   and MUST be identical in every universe the stock belongs to.
9. **AC-9 — Score and percentile:** Every classified factor MUST be shown as a
   standardised score together with a percentile rank from 0 to 100.
10. **AC-10 — Automatic refresh:** Classifications MUST be brought up to date
    without user action after every acquisition run that ends as succeeded or
    partial, and MUST NOT be recomputed after a run that ends as failed,
    cancelled or abandoned.
11. **AC-11 — Timeliness:** Classifications for up to 3000 actively acquired
    stocks MUST be up to date within 5 minutes of the acquisition run ending.
12. **AC-12 — Like-for-like only:** The product MUST NOT show a score or
    percentile on a factor for a stock unless every input that factor needs
    is present and current, and MUST instead show the stock as not classified
    on that factor with the missing or outdated input named.
13. **AC-13 — Outdated inputs:** An input MUST be treated as outdated when it
    is a fundamental whose latest reported period ended more than 6 months
    before the classification date, or a price that is not from the latest
    trading day the product holds.
14. **AC-14 — Enough stocks to rank:** When fewer than 30 stocks qualify on a
    factor, the product MUST NOT show scores or percentiles on that factor,
    and MUST state that there are not enough stocks to rank and how many
    qualified.
15. **AC-15 — Retired stocks:** A stock retired from acquisition MUST NOT be
    classified or counted in any peer set, and MUST be shown in its universes
    as not classified because it is retired.
16. **AC-16 — Compare:** The user MUST be able to sort stocks by any factor's
    score or percentile, filter them with thresholds on one or more factors at
    once, and view chosen stocks side by side, both across all classified
    stocks and within a single universe.
17. **AC-17 — Evidence behind a result:** For any classification, the user
    MUST be able to see the inputs it was built from and the date on which
    each input was known.
18. **AC-18 — Classification history:** Every classification MUST be retained
    with the date it was produced and MUST NOT be overwritten, and the user
    MUST be able to see a stock's earlier classifications.
19. **AC-19 — No backdating:** Data acquired for an earlier period MUST NOT
    change any classification already recorded, and MUST NOT make a
    classification appear to have been known before the date it was
    produced.
20. **AC-20 — Previous set while not current:** Until a new set of
    classifications is complete, the product MUST show the previous set marked
    as not reflecting the latest acquisition, and MUST NOT show a
    half-finished set as current. When classification fails, the product MUST
    also show the failure and its reason.
21. **AC-21 — Classification currency:** The user MUST be able to see when the
    current classifications were produced and which acquisition run they
    reflect.
22. **AC-22 — Honest empty state:** Before any classification has been
    produced, the product MUST state that no stocks have been classified
    rather than presenting an empty list as complete.
23. **AC-23 — Restatement mark:** A value or growth classification MUST be
    marked as possibly reflecting restated data when any fundamental behind it
    was acquired as historical backfill, for a period already reported before
    acquisition of that stock began, and the mark MUST be retained with that
    classification in its history.

## 5. Dependencies and Constraints

### 5.1 Dependencies

| Target | Type | What is needed | Satisfied when |
|--------|------|----------------|----------------|
| CAP-001 | requires-runtime | The data classification is computed from, and the signals that drive it: instrument reference data, daily prices, company fundamentals and corporate actions for actively acquired stocks (`CAP-001 AC-3`), each recorded with the date it was known (`CAP-001 AC-5`); the acquisition list with each stock active or retired (`CAP-001 AC-1`, `CAP-001 AC-21`); per-stock coverage (`CAP-001 AC-7`); and each run's recorded outcome — succeeded, partial, failed, cancelled or abandoned (`CAP-001 AC-9`, `CAP-001 AC-19`, `CAP-001 AC-20`) — at up to 3000 stocks (`CAP-001 AC-4`). | An acquisition run ends as succeeded or partial on the running product, and classifications are produced from the observations, coverage and outcome it recorded. |
| `docs/constitution/tech-stack.md` | conforms-to | The approved technology choices and the project-wide constraints that bound this capability: one transactional relational store (C2), the market data source as one contract that classification reads history through (C4), append-only point-in-time history (C5), and one owner-operator (C8). | Specification review confirms the system design uses only approved technologies and honours C2, C4, C5 and C8. |
| STD-UI | conforms-to | The project's owner-interface standard. CAP-002 adds new owner-facing surfaces — universes, classifications, comparison and evidence — so every rule governing a surface it renders binds it. | Section 5.4 accounts for all 30 rules, and specification review confirms the UX brief and UX design satisfy each rule marked yes or partial. |

### 5.2 Non-Dependencies

| Target | Not depended on for | Why |
|--------|--------------------|-----|
| CAP-001 | Starting acquisition runs or changing the acquisition list | CAP-002 never acquires data or edits the acquisition list. When a stock the user wants is not acquired, CAP-002 tells the user to add it through acquisition. |
| Massive (market data provider) | Any provider read | CAP-002 classifies only from what acquisition has already recorded, and makes no provider requests of its own. |
| Alpaca / the broker port, the kill switch | Anything | CAP-002 places no orders and holds no positions. |

### 5.3 Constraints

- **M1 milestone (2026-Q4).** This capability completes M1, Universe and
  Factors.
- **Point-in-time history.** Universe membership and classifications are
  append-only and carry the date they were produced, because a backtest (M4)
  depends on knowing what was known when, and that history cannot be rebuilt
  later (charter §3; tech stack C5).
- **The owner interface stays bound to the loopback interface with no
  authentication**, as CAP-001 established (owner decision, 2026-09-03). The
  surfaces CAP-002 adds sit behind that same interface and inherit that
  posture and its reason for SEC-AUTH-001 not engaging.
- **One user, no separation of duties, no subscribers** (charter §2; tech
  stack C8). There is no per-user universe ownership or sharing.
- **Massive's fundamentals are not as originally reported.** They may reflect
  later restatements of the same period, a limitation the owner accepted on
  2026-09-02 (tech stack). Value and growth are computed from them, so
  classifications built from backfilled fundamentals carry the mark STD-UI-17
  requires (owner decision, 2026-10-12; AC-23).

### 5.4 Standards Conformance

Conformance to `STD-UI`, as STD-UI section 4 requires. The UX brief for this
capability carries the narrative record and where each rule is satisfied; this
table is the checked mirror of it, and the two must agree.

| Rule | Applies | Where satisfied, or why not |
|------|---------|------------------------------|
| STD-UI-1 | yes | Uses universe, classification, factor, retired, instrument, history depth. Adds *score*, *percentile*, *peer set* and *not classified*; redefines no term |
| STD-UI-2 | yes | Retiring a universe and removing a member are worded as retirement and removal that keep history, never as deletion (AC-4, AC-6) |
| STD-UI-3 | yes | Scores and percentiles render in tabular figures with precision fixed per column; scores carry an explicit sign |
| STD-UI-4 | yes | Not classified renders as an explicit marker, distinct from a measured zero score (AC-12, AC-14) |
| STD-UI-5 | yes | Classification dates and input as-of dates in ISO-8601; timestamps in America/Chicago; session dates unconverted |
| STD-UI-6 | yes | Inputs such as market capitalisation are not abbreviated in comparison tables or the side-by-side view |
| STD-UI-7 | partial | Status palette for classification states. If score polarity is colour-coded, it uses the diverging non-red/green pair |
| STD-UI-8 | yes | Every classification state carries a text label and an icon or shape; score sign is explicit, not colour alone |
| STD-UI-9 | no | CAP-002 commits to no chart or per-entity series. A UX design that adds one engages this rule |
| STD-UI-10 | no | Binds the shared theme, not this capability |
| STD-UI-11 | no | CAP-002 delivers no trading and has no paper or live environment |
| STD-UI-12 | yes | Adds classification states — classified, not classified, not enough stocks to rank, retired, updating, not reflecting the latest acquisition, classification failed — each mapped to an existing tier in the UX brief; no tier added |
| STD-UI-13 | yes | Every classification carries the date it was produced, and every input the date it was known (AC-17, AC-21) |
| STD-UI-14 | yes | Classification on a factor is present, absent (an input is missing or outdated) or not determinable (not enough stocks to rank) (AC-12, AC-14) |
| STD-UI-15 | yes | Only recorded classifications and membership are displayed; a filter-built universe shows its saved members, not the filter's current result (AC-2) |
| STD-UI-16 | yes | No missing input is filled in and no partial score is shown (AC-12); a previous set is shown only with its not-current mark (AC-20) |
| STD-UI-17 | yes | Value and growth classifications built from backfilled fundamentals carry the restatement mark, which stays with them in history for later backtests and promotion evidence to carry forward (AC-23) |
| STD-UI-18 | yes | The insufficient-evidence result states that it judges whether inputs are present and current, not whether the provider's values are correct |
| STD-UI-19 | yes | Creating, renaming and adding members are routine; removing a member and retiring a universe are consequential; every refusal (AC-1, AC-5) names the operation, the stock or universe and the reason |
| STD-UI-20 | no | CAP-002 delivers no promotion |
| STD-UI-21 | no | CAP-002 has no order path. Section 5.2 records the kill switch as a non-dependency |
| STD-UI-22 | no | CAP-002 has no capital-at-risk and no destructive control; retirement is neither |
| STD-UI-23 | yes | The UX brief enumerates all eight states for each data-bearing region |
| STD-UI-24 | yes | Keyboard operation, focus, table headers, contrast and polite announcement of updated content, recorded in the UX brief |
| STD-UI-25 | yes | Any region that polls for classification progress or currency shows its last-updated time, with cadence recorded in the design |
| STD-UI-26 | no | No operation spans steps; saving a filter result as a universe is a single action on a reviewed result |
| STD-UI-27 | no | CAP-002 commits to no chart. A UX design that adds one engages this rule |
| STD-UI-28 | no | CAP-002 commits to no chart. A UX design that adds one engages this rule |
| STD-UI-29 | yes | Selects a density tier from the defined set and introduces no value |
| STD-UI-30 | yes | The classified-stock list can reach 3000 stocks (AC-11), so it is virtualised and provides search and filter |

## 6. Assumptions

- **The financial statements CAP-001 acquires contain the line items the
  factors need** — book equity, earnings and earnings per share, revenue,
  operating cash flow, capital expenditure, and shares outstanding for market
  capitalisation. CAP-001 acquires the balance sheet, income statement and
  cash-flow statement, and its massive-client design records that ratios are
  computable from those statements and the daily bars. Whether every line item
  is present for every stock is unverified. A missing item does not break the
  capability: AC-12 shows the stock as not classified on that factor, naming
  the input. A widespread absence would leave too few stocks to rank (AC-14)
  and would need to be raised with the owner. To be validated against acquired
  data during system design.
- **The stated history depth is deep enough for every factor.** Momentum needs
  at least 13 months of daily prices, and trailing-twelve-month growth needs at
  least two years of quarterly fundamentals. A shallower depth leaves those
  factors not classified under AC-12 rather than computing them wrongly.
- **The stocks are US-listed equities,** as CAP-001 assumes. Another market
  would change reporting periods and the trading-day calendar.

## 7. Open Questions

None.

## 8. Readiness Assessment

**Readiness Score: 92/100**

Architecture can begin. The problem, the affected user, the desired outcome and
the boundary between the acquisition list and the analysis universe are
settled. Scope fixes the decisions that most shape the work: universes are
built by hand or saved once from a filter, never kept up to date by a standing
rule; classification is measured against every actively acquired stock, so it
is the same in every universe; each factor's inputs, periods and weights are
defined; and a factor is never scored from incomplete or outdated inputs.

Six user flows carry explicit failure or alternate branches. Twenty-three
acceptance criteria cover universes, factor definitions, the peer set, refresh
and timeliness, insufficient evidence, comparison, evidence and history,
failure visibility and the restatement mark. Every quantitative value is an
owner decision. The single capability dependency, on CAP-001, is
`requires-runtime` and cites the acceptance criteria that define it, so it
constrains integration order only. All 30 STD-UI rules are accounted for.

No open question remains. What keeps this below 100 is the first assumption:
whether the acquired statements carry every line item the factors need has not
been checked against real data. A missing item is handled by AC-12 rather than
breaking the capability, but a widespread one would leave too few stocks to
rank and would have to come back to the owner.
