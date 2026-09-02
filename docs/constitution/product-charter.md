---
artifact_schema_version: 1
artifact_id: product-charter
artifact_type: product-charter
artifact_version: 5
product: FactorFlow
tagline: >-
  Classify a self-defined stock universe by value, growth and momentum, and
  trade it automatically under strategies the owner controls — proven in paper
  before any capital is at risk.
created: 2026-09-01
updated: 2026-09-01
last_updated: 2026-09-01
owner: Alvaro de Jodra
owner_github: ajodraca
status: draft
ai_provenance:
  agent_id: product-charter-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-01T19:45:00Z
  source_artifacts: []
  invoking_user: ajodraca
  correlation_id: 6493d4a3-41a0-4991-9e37-c372f762c3d0
---

# Product Charter: FactorFlow

> **Status: complete for its purpose.** This charter was defined from a blank
> slate for the FactorFlow rebuild. The product concept carries over from the
> first FactorFlow build, but no charter decision was inherited — every section
> was re-decided.
>
> Five charter-level decisions are settled: the product keeps the name
> FactorFlow; it serves one owner-operator with no separation of duties; its
> mandate runs from universe definition through factor classification and
> strategy definition and execution to a deliberate paper-to-live gate; and the
> milestones run M1 through M6 in that order, with backtesting committed as M4
> ahead of the promotion gate; and the system is a modular monolith with market
> data ingestion split out.
>
> Two questions are open rather than blocking — the dates for M2–M6 (OQ-2) and
> the broker (OQ-3). Neither prevents capability definition from starting.

## 1. Mission Statement

Enable an individual investor to define their own stock universe, classify it by
value, growth and momentum factors, and trade it automatically under strategies
they control — proving each strategy in paper trading before any capital is at
risk.

The product serves a single owner-operator rather than a market of subscribers.
Its mandate spans the full path from universe definition through factor
classification, strategy definition and execution, and the deliberate gate
between paper and live trading. The investor retains control of which
strategies exist, which of them run, and when they are trusted with real
capital; the product's job is to make that judgement well-informed and to
execute it reliably.

## 2. Target Users

FactorFlow has a single user type. There is no separation of duties: the same
person researches, decides, and operates.

- **Owner-Operator (Investor)** — The sole user of the product. Defines the
  stock universe, configures and tunes strategies, reviews factor and
  performance evidence, decides when a strategy is promoted from paper to live,
  and monitors and intervenes in live trading. Needs trustworthy factor data,
  clear evidence on which to judge a strategy, an unambiguous promotion
  decision, and the ability to stop trading immediately.

## 3. System Overview

The system is a **modular monolith**: the building blocks below are modules
within a single deployable application, with one exception — **Market Data
Ingestion runs as its own process**, because its failure mode is genuinely
different (long-lived connections, reconnects, upstream outages) and it should
not be able to take execution down with it.

This shape was chosen because FactorFlow serves one owner-operator and is built
by one person, so the usual case for separate services — independent scaling and
team autonomy — does not apply. What does apply is that the money path (strategy
decision → order intent → position update) stays inside a single database
transaction instead of becoming a distributed-consistency problem.

Two seams are **hard interfaces regardless of topology**, because they are what
keeps the monolith from foreclosing later options:

- **Broker port** — one interface with three implementations: backtest
  simulator, paper, and live. M2 and M4 both depend on it, and it is what allows
  backtest workers to be split out later if compute demands it.
- **Market data source** — historical point-in-time reads and the live feed
  behind one contract.

Detailed architecture, data flows and API contracts are designed per-capability
during system design.

- **Owner Interface** — Where the owner-operator defines universes, configures
  strategies, reviews evidence, promotes a strategy from paper to live, and
  monitors and intervenes in live trading.
- **Universe Definition** — Composes and maintains the set of instruments the
  product operates over.
- **Factor Classification** — Computes and stores value, growth and momentum
  classifications for instruments in the universe.
- **Strategy Engine** — Evaluates strategies against factor data and produces
  the intended trades.
- **Execution** — Routes orders to paper or live trading and tracks resulting
  positions.
- **Market Data Ingestion** — Acquires the price and fundamental data the
  factor classification and execution depend on.
- **Kill Switch** — Stops new orders. Its state must live outside the
  application's health: recorded in the database and checked before every order,
  with broker-side limits used where available, so that stopping does not depend
  on the application being responsive.
- **Persistence** — Stores instruments, factor data, strategies, orders,
  positions, and the decision history behind promotions. Factor and universe
  history must be recorded **point-in-time** — append-only, carrying the date
  each value was known — rather than as overwritten current state. Backtesting
  (M4) depends on it, and the history cannot be reconstructed after the fact:
  fundamentals are restated and delisted instruments disappear, so state
  overwritten during M1 is lost for good.
- **Broker Integration** — The external broker relationship used for paper and
  live order routing.

## 4. Key Dates

The build is sequenced rather than scheduled. Only the first milestone carries
a target date; the later dates depend on how M1 and M2 go and would be invented
if stated now (see OQ-2). The **order** of the milestones is a settled decision
even though the dates are not.

| Date | Milestone | Key Functionalities |
|------|-----------|---------------------|
| 2026-Q4 | M1 — Universe & Factors | Define and maintain a stock universe; classify its instruments by value, growth and momentum |
| TBD | M2 — Strategies & Paper Trading | Define, configure and tune strategies; run them against the paper broker and produce tracked positions |
| TBD | M3 — Live Market Data | Real-time price and fundamental data, sufficient to judge a strategy |
| TBD | M4 — Backtesting | Replay strategies over historical point-in-time data to produce promotion-grade evidence across market regimes |
| TBD | M5 — Promotion Gate | Evidence review and the owner's paper-to-live promotion decision |
| TBD | M6 — Live Trading | Trading real capital, bounded by position and exposure limits and a kill switch |

## 5. Open Questions

- **OQ-1** — ~~Is the system a modular monolith or a set of separately deployed
  services?~~ **Resolved 2026-09-01: modular monolith**, with market data
  ingestion as a separate process and hard interfaces at the broker port and the
  market data source. Chosen for transactional integrity on the money path and
  for the ops burden a single developer can carry; separate services were
  rejected as serving scale and team autonomy that this product does not have.
  See Section 3.
- **OQ-2** — What are the target dates for M2 through M6? *(affects Key Dates)*
  Deliberately left open: the sequence is fixed, the dates depend on M1's
  outcome. Revisit once M1 lands.
- **OQ-3** — Which broker backs paper and live trading? *(affects System
  Overview, and gates M2 and M6)* Not chosen for the rebuild.
