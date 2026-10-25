---
artifact_schema_version: 1
artifact_id: tech-stack
artifact_type: tech-stack
artifact_version: 6
product: FactorFlow
created: 2026-09-02
updated: 2026-10-25
last_updated: 2026-10-25
owner: Alvaro de Jodra
owner_github: ajodraca
status: approved
ai_provenance:
  agent_id: tech-stack-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-05T22:51:06Z
  source_artifacts:
    - id: product-charter
      version: "2, approved 2026-09-03"
    - id: CAP-001
      version: "7, draft 2026-09-05"
    - id: CAP-001-system-design
      version: "5, draft 2026-09-05"
  invoking_user: ajodraca
  correlation_id: 6493d4a3-41a0-4991-9e37-c372f762c3d0
approval:
  approval_policy: owner-allowed
  approved_by: "Alvaro de Jodra"
  approved_at: 2026-10-13T00:46:11Z
  reviewed_revision: sha256:cf11e1b49118a18cac2b4f24110f365afa354c57f5a2555749c26e456bbb74a7
---

# Tech Stack: FactorFlow

This document defines the approved technology stack for each component
repository in the FactorFlow project. All system designs, component designs,
and implementation stories MUST use the technologies defined here.

FactorFlow is a **single repository** holding the specifications, the
application, the market data ingestion process, and the owner interface.

This stack was selected for a greenfield rebuild; nothing was carried forward
from the first FactorFlow implementation. The product charter remains the
governing product authority, while CAP-001 and its system design supply the
current provider, ingestion, interface and validation requirements used to
refine this revision. Where a choice matches the first build, it was re-derived
from those sources and the reasoning is recorded.

## Project-Wide Constraints

These come from the product charter and bound every choice below. They are
recorded here because each is a technology constraint, not merely a product
statement.

| ID | Constraint | Authority | What it constrains |
|----|------------|-----------|--------------------|
| C1 | **Modular monolith, with Market Data Ingestion as its own process.** Its failure mode — long-lived connections, reconnects, upstream outages — must not be able to take execution down | Charter §3 | Two deployable processes from one repository, and a handoff between them that is not an in-process function call |
| C2 | **The money path stays in a single database transaction.** Strategy decision, order intent and position update commit together | Charter §3 | One transactional relational store. Splitting the money path across stores or services is forbidden, not merely discouraged |
| C3 | **The broker port is one interface with three implementations**: backtest simulator, paper, and live | Charter §3 | The simulator is a first-class implementation, not a test double. No broker-specific type may appear above the port |
| C4 | **The market data source is one contract** covering historical point-in-time reads and the live feed | Charter §3 | One interface over two access patterns, so classification and backtesting read history the same way execution reads the live feed. Massive is the provider; the contract is not a portability layer |
| C5 | **Factor and universe history is append-only and point-in-time**, carrying the date each value was known. It cannot be reconstructed after the fact: fundamentals are restated and delisted instruments disappear | Charter §3, Persistence | The schema decision that is cheapest now and impossible to repair later. State overwritten during M1 is lost for good |
| C6 | **Kill switch state lives outside the application's health** — recorded in the database, checked before every order, with broker-side limits used where available | Charter §3 | A persisted flag settable without the web application, and exactly one order chokepoint. A control that calls into the misbehaving system fails when it is needed |
| C7 | **Ingestion holds long-lived connections and must survive upstream outages** | Charter §3 | An async-capable runtime and explicit reconnect and backoff behaviour in that process |
| C8 | **One owner-operator, no separation of duties, no subscribers** | Charter §2 | Removes multi-tenancy, per-user isolation and horizontal scale from every choice |
| C9 | **Backtesting is committed as M4**, replaying strategies over historical point-in-time data across market regimes to produce promotion-grade evidence | Charter §4 | A compute-heavy numeric workload, and the reason C3 must be a real seam: backtest workers can be split out later only if nothing leaks through the port |
| C10 | **The owner interface must carry evidence review and the paper-to-live promotion**, plus monitoring and intervention in live trading | Charter §3 | Charts and tables, and a promotion interaction deliberate enough to be a decision rather than a setting |
| C11 | **The build is sequenced, not scheduled.** Only M1 carries a date, 2026-Q4 | Charter §4 | Favours a toolchain one developer can move quickly in over one that pays off at team scale |

## Components

### FactorFlow-v2

The single repository. It holds the application — universe definition, factor
classification, the strategy engine, execution and the broker port — the
separate market data ingestion process (C1), the database schema, the owner
interface, and the specifications and constitution that govern them.

| Property | Value |
|----------|-------|
| Source | greenfield implementation; refined against product charter v2, CAP-001 v7 and CAP-001 system design v5 |
| Primary Language(s) | Python 3.12+ (application and ingestion); TypeScript 5.x (owner interface) |
| Backend Framework | FastAPI on uvicorn (ASGI). A read-and-write surface: configuring strategies, promoting to live and operating the kill switch are all writes |
| Frontend Framework | React 18 with Vite. The FastAPI surface is therefore a JSON API, consumed by the interface rather than rendering it |
| CSS / Styling | Tailwind CSS |
| Database / Storage | PostgreSQL 16, the single application store. Schema evolved by numbered, forward-only SQL migration files with an applied-migrations table. **No ORM** |
| Process Topology | Two processes from one codebase: the application (API, strategy engine, execution scheduler) and market data ingestion (C1). They share the PostgreSQL instance; ingestion writes, the application reads |
| Broker Integration | **Alpaca**, via its official Python SDK (`alpaca-py`), for both paper and live trading. It sits behind the broker port (C3) as two of that port's three implementations, alongside the backtest simulator. The port is specified in the product's own vocabulary, not Alpaca's, so that a different broker can back live trading later |
| Data Providers | **Massive**, as the single provider for price data, company fundamentals, corporate actions and instrument reference data. REST for historical reads and WebSocket for the live feed, behind one provider contract (C4). Accessed through Massive's official Python client (`massive`), authenticated by an API key supplied at runtime |
| Build Tool | uv for Python dependency resolution and lockfile; setuptools as the build backend with a `src/` layout; Vite for frontend bundling, run on **Node.js 22**, both locally and in the release image's interface build stage (`node:22-slim`) |
| Test Framework | **Python:** pytest with `testcontainers[postgres]` for database-backed tests. **TypeScript:** Vitest with React Testing Library; Playwright for end-to-end |
| Package Manager | uv (Python); npm (frontend) |
| Execution Runtime | An in-process scheduler inside the application container drives strategy evaluation cycles (`APScheduler`, or the equivalent chosen at system design). It reaches the order path only through the chokepoint that checks the kill-switch flag |
| Container Runtime | Docker, self-hosted. PostgreSQL, the application and the ingestion process each run as a container on a machine the owner controls |
| Key Libraries | **Python:** `psycopg` 3 (PostgreSQL driver), `psycopg_pool` (connection pooling, CAP-001-E1-S6), FastAPI / Starlette / Pydantic (API and validation), `pydantic-settings` (environment-based configuration), `massive` (official Massive REST and WebSocket client), `ruff` (lint and format), `mypy` (type checking), `pytest`, `testcontainers[postgres]`, an in-process scheduler (`APScheduler` or equivalent), `alpaca-py` (broker). **TypeScript:** `react`, `react-dom`, `vite`, `react-router-dom` (client routing; the shell's active-destination state is its `NavLink` `aria-current`), `tailwindcss` with `autoprefixer` (`postcss.config.js` runs both on every build, so autoprefixer is in the CSS path for every rendered surface), `vitest`, `@testing-library/react`, `@playwright/test`, `biome` (lint and format), **`shadcn/ui` on Radix primitives** (components, vendored into `web/src/components/ui/` as shadcn/ui ships them, with the `@radix-ui/react-*` primitive each needs and, confirmed 2026-10-25 (OQ-TS-10), the packages the vendored components import: `cmdk` for `command`, `sonner` for `toast`, `@tanstack/react-table` for `data-table`, `react-hook-form`, `zod` and `@hookform/resolvers` for `form`, and shadcn/ui's own utilities `clsx`, `tailwind-merge`, `class-variance-authority` and `lucide-react`; licences MIT except `class-variance-authority` (Apache-2.0) and `lucide-react` (ISC), each to be verified against the package's `LICENSE` file when the story adds it, per SEC-DEP-003) and **TradingView `lightweight-charts`** (charting). The numeric library for factor computation and backtesting remains deferred — see OQ-TS-3 |

**Rationale:**

**Python for the application and ingestion.** In the first FactorFlow build this
choice followed from the broker's official SDK. That argument is not available
here, because charter OQ-3 leaves the broker open, so the language has to stand
on reasoning that does not depend on it. Two charter commitments supply that
reasoning. C9 makes backtesting a delivered milestone rather than an aspiration,
and factor computation over price and fundamental series across market regimes is
numeric work that Python's ecosystem serves better than any alternative the
single developer would move as fast in. C7 requires a process that holds
long-lived connections and reconnects cleanly, which Python's async runtime
handles adequately at this scale. The subsequent choice of Alpaca, which
publishes an official Python SDK, reinforces the decision but did not drive it —
the reasoning above stands whichever broker backs live trading, which is the
property that matters given that the broker is explicitly expected to change.

**PostgreSQL as the single store** carries three charter obligations that each
need durable transactional state, and one that needs a store readable when the
application is not healthy. C2 requires the decision, the order intent and the
position update to commit together, which is what makes the money path
reconstructable rather than best-effort. C5 requires append-only point-in-time
history with as-of dates, which is a modelling problem a relational store with
real constraints and indexes handles directly. C9 replays that history over long
ranges. C6 requires the kill switch flag to be readable and settable by something
that is not the web application, which a shared database provides and an
in-process store does not.

SQLite was weighed seriously and rejected. C8 removes the usual reason to reach
for a server database — there is exactly one user — and a single-file store would
be simpler to operate. It fails on C1: two processes write concurrently, ingestion
holding long transactions against a live feed while execution needs to commit the
money path promptly, and SQLite's single-writer model turns that into lock
contention on the path that matters most.

**No ORM, and numbered forward-only migrations,** because the point-in-time
history (C5) and the order and kill-switch tables (C2, C6) are the safety-critical
state in this product. Their constraints and indexes should be visible in SQL and
reviewable as the statements they are, rather than inferred from model classes.
C5 in particular is unrecoverable if it is got wrong, which is the strongest
argument in this document for making the schema explicit.

**FastAPI** serves the interface's API in the same language and process family as
the rest of the application, and its async runtime is shared with the ingestion
process's needs (C7). Because the interface is a separate React application, that
surface is a JSON contract rather than a template renderer.

**React with Vite for the owner interface, and the case was close.** C8 and C11
argue against it: one user, one developer, and a milestone in 2026-Q4 all favour
a single language and no bundler, and unlike the first FactorFlow build there is
no design-system contract in this repository to offset the cost of a second
toolchain. It was chosen anyway on the two screens the charter commits to and
that carry the most risk. C10 requires evidence review that supports a promotion
judgement, and C9 makes that evidence a backtest across market regimes rather
than a single equity curve; the promotion action itself must read as a decision
rather than a setting. Both are bespoke interaction problems, and both are where
a framework's imposed layout costs most. The decision was also weighed against
what it forecloses: a server-rendered interface would reach M1 sooner, but the
M4 and M5 screens are already committed in the charter, and reaching them would
then mean building the JSON API that this choice has from the start. The price —
more code and more toolchain than a one-user product would otherwise need — is
accepted deliberately.

**Vitest** reuses Vite's transform pipeline, so the frontend carries one build
configuration rather than two. **Playwright** because the promotion flow and the
kill switch are the paths that must be verified end to end rather than against
mocks. **Biome** does lint and format in one tool, matching `ruff` on the Python
side.

**The kill switch is not a FastAPI endpoint.** C6 requires it to work when the
application is misbehaving, and a control that calls into the misbehaving system
fails exactly when it is needed. The mechanism is the persisted flag the execution
path checks before every order, settable by a command that does not pass through
the web application, with broker-side limits configured where the broker offers
them. Any interface button is a convenience over that flag. This is an
architectural constraint on every option below, not a property of FastAPI.

**Docker on a self-hosted machine** expresses the two-process topology (C1)
directly: the application and ingestion are separate containers with separate
restart behaviour, which is the operational form of the charter's requirement
that ingestion's failure mode cannot take execution down. It also makes
`testcontainers[postgres]` work without configuration, so database-backed tests
run against real PostgreSQL rather than a substitute — which matters more here
than usual, because the point-in-time schema (C5) is where correctness has to be
proven. Self-hosted rather than managed follows from C8: there are no
subscribers, so there is nothing to scale and no availability target beyond what
the owner needs.

**An in-process scheduler drives execution.** The charter commits to trading
automatically (§1) without saying what drives it, and §3 fixes the topology as a
modular monolith with ingestion as the single exception — so a dedicated
execution process was not available without amending the charter, and was not
taken. Keeping the scheduler in the application process also keeps the money path
(C2) inside one process and one transaction, which is the point of the monolith.
The cost is that execution is only as available as the application container;
that is acceptable precisely because C6 puts the kill switch outside it, so the
control that stops trading does not share the fate of the thing it stops.

**What would reopen this, and when.** The argument for a dedicated execution
process is not weak — it is the same argument §3 already accepted for ingestion,
that a process whose failure mode differs should not be able to take execution
down with it. The charter drew the line at one exception; whether execution
deserves to be the second was settled implicitly rather than argued. The concrete
condition that would justify revisiting it is **M4**: backtest replay across
market regimes is the compute-heavy workload (C9), and in one process it competes
with the API for the interpreter. If that contention degrades the interface, the
answer is to amend §3 for a second exception rather than to work around it in
code. The cost of having chosen wrongly is bounded, and the charter says why — the
broker port exists so backtest workers can be split out later if compute demands
it, and that option survives this decision intact.

**Massive as the single data provider** was chosen over a two-provider
arrangement because it supplies prices and fundamentals together. That collapses
what would otherwise be two clients, two failure modes, two coverage sets, and a
cross-provider identity mapping whose failure is silent: a wrong mapping
attributes one company's fundamentals to another's prices and reports a plausible
number. Its ticker reference data carries CIK, composite FIGI and share class
FIGI, so instrument identity does not rest on the ticker, and delisted securities
remain queryable with their list and delist dates — which is what keeps
survivorship bias out of the M4 backtests (C9).

**The official Massive Python client is the provider integration library.** It
supports the REST and WebSocket access patterns this stack requires and avoids
reimplementing provider transport, authentication and protocol handling. The
CAP-001 `MassiveClient` remains the project-owned operational boundary around
the SDK for pacing, retries, telemetry and test substitution. It is not a
provider-portability layer: Massive response shapes may remain vendor-shaped
inside ingestion, consistent with C4 and the deliberate single-provider choice.

**Its fundamentals are not point-in-time, and that limitation is accepted
deliberately.** Massive's `filing_date` is the date of the most recent SEC filing
that included a period's data, conflating restatements of the same period; there
is no as-reported query mode and no field recording when a value became publicly
known. C5 is still satisfied going forward, because ingestion appends each
observation with the date FactorFlow observed it. What cannot be recovered is the
span before ingestion begins: backfilled fundamentals carry restated values, so
backtests over that span are biased on the value and growth factors, though not
on momentum, which is price-derived. The owner accepted this on 2026-09-02 rather
than take on a second provider for as-reported history. The obligation it creates
is on the promotion evidence, not on ingestion — see the constraint below.

**Alpaca for paper and live, behind a vendor-neutral port.** Alpaca offers a
paper environment that is a real broker environment rather than a fill simulator,
which is what makes M2's tracked positions meaningful, and an official Python SDK
for the part of this system where a maintained first-party client matters most:
order placement, order state and reconciliation are where a hand-rolled client's
edge cases become misplaced trades.

The owner requires the freedom to move live trading to a different broker if
Alpaca proves inadequate for some strategy. **The abstraction that permits this
already exists as a charter requirement** — C3 defines the broker port as one
interface with three implementations — so no additional layer is introduced.
What the requirement changes is how that port must be specified. The risk is not
the absence of an interface; it is that an interface built with only one vendor
behind it silently takes that vendor's shape. Order types, time-in-force values,
fractional-share semantics, the account and position model, and the error
taxonomy must be expressed in the product's own vocabulary and translated inside
the Alpaca implementation. A port that passes Alpaca's enumerations through is an
interface in name only, and the cost of that is not paid until the migration it
was supposed to enable.

**The broker port is abstracted; the market data source is not.** The two seams
are treated differently on purpose. The broker port carries a real expectation of
change — the owner intends to be able to move live trading elsewhere — and the
charter gives it a second reason besides, that backtest workers can be split out
behind it. The market data source has neither: Massive is the provider, there is
no plan to replace it, and C4's single contract exists to put historical reads
and the live feed behind one interface, not to make the vendor swappable.
Ingestion may therefore use Massive's own shapes directly. Building a translation
layer against a migration nobody plans would be cost paid now for an option
nobody wants.

**Constraints:**

- Every order reaches the broker through **one chokepoint** where the kill switch
  flag and any exposure limits are checked (C6). A second order path makes those
  checks advisory rather than enforced.
- No broker-specific type may appear above the broker port (C3). No Alpaca
  enumeration, identifier, error class or SDK object may cross it. The port's
  vocabulary is the product's, and each implementation translates into it. This
  is what keeps backtest workers separable and what makes replacing the live
  broker a contained change rather than a rewrite.
- **Paper and live are always the same broker.** If live trading ever moves off
  Alpaca, paper moves with it. Promotion evidence must be generated against the
  venue that will execute it; a paper record from one broker does not support a
  promotion to another, because fills, slippage and rejects differ.
- **Market data comes from Massive, not from Alpaca.** Alpaca also sells market
  data, and using it because the dependency is already present would reintroduce
  the two-source instrument-identity problem that choosing a single provider was
  meant to remove. The broker port supplies fills, positions and account state;
  it does not supply prices.
- Factor and universe writes are **append-only with an as-of date** (C5). No
  migration or story may introduce an in-place update to that history.
- Format commands are checks, not rewrites. No agent may run a command that
  modifies formatting without explicit user approval.
- No test may place an order against a live broker environment. Paper is a real
  broker environment, not a mock, and its credentials must be separated from live
  in test configuration.
- **Promotion evidence must state the restatement limitation.** Any backtest
  covering a period before FactorFlow began observing fundamentals is biased on
  the value and growth factors, and the M5 evidence must say so where the owner
  will see it when deciding. A promotion made on evidence that hides this is the
  failure the charter's point-in-time requirement exists to prevent.
- Fundamentals are written with the date FactorFlow observed them, never with a
  provider-supplied filing date treated as the date the value was known (C5).
- The promotion interaction must impose ceremony the broker does not: an
  acknowledgement that cannot be dismissed by accident, and a confirmation naming
  the strategy and the capital at risk (C10). This is a safety requirement on the
  interface, not a styling preference.
- Paper and live must never be styled identically. If the two are visually
  indistinguishable, the distinction that protects the owner stops working.
- Biome has no direct equivalent of `eslint-plugin-jsx-a11y`, so accessibility
  expectations on the interface are enforced by review rather than by a linter.
- The scheduler must reach the order path only through the single chokepoint
  (C6). A scheduled job that places an order by any other route bypasses the kill
  switch, which is the failure this arrangement exists to prevent.
- The kill switch must remain settable when the application container is
  unhealthy or stopped (C6). Any deployment arrangement in which reaching the
  flag requires the application to be running defeats it.

**Validation Commands:**

| Command | Purpose | Working Directory |
|---------|---------|-------------------|
| `uv sync --all-extras` | Install / resolve Python dependencies from the lockfile | `.` |
| `uv build` | Build / package the distribution | `.` |
| `uv run pytest` | Run the full Python suite | `.` |
| `uv run pytest -m 'not postgres'` | Run tests that need no container runtime | `.` |
| `uv run ruff check .` | Lint / static analysis | `.` |
| `uv run ruff format --check .` | Format check, no modification | `.` |
| `uv run mypy src` | Type check | `.` |
| `npm ci` | Install / resolve frontend dependencies from the lockfile | `.` |
| `npm run build` | Build the frontend bundle (Vite) | `.` |
| `npm run test` | Run the Vitest unit and component suite | `.` |
| `npm run test:e2e` | Run the Playwright end-to-end suite | `.` |
| `npm run lint` | Lint the TypeScript sources (Biome) | `.` |
| `npm run format` | Format check, no modification (Biome) | `.` |
| `npx tsc --noEmit` | Type check the TypeScript sources | `.` |

Notes for agents:

- `postgres`-marked tests require a running container runtime. When none is
  available, run `uv run pytest -m 'not postgres'` and report the exclusion.
  Do not report a partial run as a green suite.
- The Playwright suite needs browsers installed (`npx playwright install`) and is
  the only place the promotion flow and the kill switch are exercised end to end.
  The same exclusion rule applies: report the exclusion, do not report a partial
  run as a green suite.
- The seven Python commands above exist and are verified working.
  `pyproject.toml` was created by CAP-001-E1-S1, which defined them.
- The six `npm` and `npx` commands above exist and are verified working.
  `package.json` was created by CAP-001-E1-S4, which defined them.
  `npm run test` drives a real Vite production build as part of the suite, so
  it writes into `src/factorflow/api/static/`; it leaves no tracked file
  modified. `npm run test:e2e` now runs `tests/e2e/instruments-add-retire.spec.ts`
  against a real API and PostgreSQL container, landed by CAP-001-E2-S4.

## Open Questions

| ID | Question | Owner | Blocks |
|----|----------|-------|--------|
| ~~OQ-TS-1~~ | ~~Which broker backs paper and live trading?~~ **Answered 2026-09-02: Alpaca for both**, behind the vendor-neutral broker port, with the live broker expected to be replaceable. Closes charter OQ-3 | — | — |
| ~~OQ-TS-8~~ | ~~If live trading later moves to a different broker, does paper move with it?~~ **Answered 2026-09-02: yes — paper and live are always the same provider.** Promotion evidence is therefore always generated against the venue that will execute it | — | — |
| ~~OQ-TS-2~~ | ~~Which providers supply price data and company fundamentals?~~ **Answered 2026-09-02: Massive, as the single provider**, with its lack of as-reported fundamentals accepted as a known limitation. See the evaluation below | — | — |
| ~~OQ-TS-7~~ | ~~Which Massive plan, and does the owner qualify as non-professional?~~ **Answered 2026-09-02: the owner qualifies as non-professional.** Plan path settled 2026-09-05: currently unsubscribed on Basic; **Stocks Starter + Financials & Ratios ($58/month)** for CAP-001 through M1; **Stocks Advanced** at M3 for real-time. Verified tier table and the three consequences are in the evaluation below | — | — |
| OQ-TS-9 | **Does M4's backtest range require Advanced's 20+ year history before M3 does?** Starter caps history at 5 years and Developer at 10; only Advanced spans 20+. If promotion evidence must cover multiple market regimes, the upgrade trigger arrives at M4 rather than at M3's real-time need. Raised 2026-09-05 from the verified pricing tiers | Capability owner, at M4 system design | Whether the M3 upgrade timing holds; M4 backtest range |
| OQ-TS-3 | **Which numeric library for factor computation and backtest replay** — `pandas`, `polars`, or SQL window functions? **Deferred by owner decision on 2026-09-02** to the system design of the first capability that requires it, because no capability has yet stated the data volumes or the computation shape and choosing without them would be guessing | Capability owner, at the system design of the first capability requiring factor computation | Classification and backtest implementation |
| OQ-TS-4 | **How are Alpaca credentials stored and separated**, such that no test and no misconfiguration can reach the live environment? Alpaca's paper and live environments differ only by credentials and endpoint, which makes this a configuration-safety question rather than a theoretical one | Owner | Broker integration; test configuration |
| ~~OQ-TS-5~~ | ~~Are exact dependency versions pinned now, or captured from the first lockfile?~~ **Answered 2026-09-02: captured from the first lockfile.** No version in this document is authoritative; `uv.lock` and `package-lock.json` are | — | — |
| ~~OQ-TS-10~~ | ~~Are the npm packages the vendored shadcn/ui components import within the approved stack?~~ **Answered 2026-10-25: yes, all ten.** Raised by CAP-003, the first consumer of the vendored components (capability OQ-4; DEC-0205, DEC-0215; specification review v1 FINDING-1). `shadcn/ui` vendors component source that imports `cmdk`, `sonner`, `@tanstack/react-table`, `react-hook-form`, `zod`, `@hookform/resolvers`, `clsx`, `tailwind-merge`, `class-variance-authority` and `lucide-react`; the OQ-TS-6 approval named the library and not these packages. All ten are recorded in Key Libraries; no implementing story adds one before this record, and each licence is checked against the package when added | — | — |
| ~~OQ-TS-6~~ | ~~Which component library and which charting library does the interface build on?~~ **Answered 2026-09-03: `shadcn/ui` on Radix primitives, and TradingView `lightweight-charts`.** The trigger fired earlier than expected: the deferral anticipated the M4 and M5 evidence screens, but CAP-001 delivers an ingestion view and so is the first capability carrying a UX design. Radix supplies keyboard and ARIA behaviour, which matters because Biome has no `jsx-a11y` equivalent; shadcn/ui vendors components into the repository rather than locking them behind a dependency, keeping the M5 promotion ceremony fully controllable. Charting is unused in CAP-001 and was chosen on the M4 and M5 screens: `lightweight-charts` is purpose-built for equity curves and OHLC series | — | — |

### Provider Evaluation — Massive

Evaluated 2026-09-02 against `https://massive.com/docs/llms.txt` and the endpoint
schemas it links. Recorded because the finding on fundamentals is the kind that
is cheap to know now and expensive to discover at M4.

**What it covers.** Massive supplies price data and company fundamentals from one
provider, which is the material difference from a two-provider arrangement: one
client, one failure mode, one coverage set, and no cross-provider identity
mapping. Against the charter it satisfies C4 with REST aggregates and WebSocket
streams behind one provider contract; supplies balance sheets, income statements,
cash flow statements and ratios; and covers corporate actions — splits,
dividends, IPOs and ticker events.

Two coverage points matter more than they look. The ticker reference endpoint
returns **CIK, composite FIGI and share class FIGI**, so instrument identity does
not depend on the ticker. And delisted securities remain queryable
(`active=false`, with `list_date` and `delisted_utc`), which directly addresses
the charter's warning that delisted instruments disappear — the mechanism by
which a backtest silently acquires survivorship bias.

**The limitation, and it is the significant one.** Massive's fundamentals are
**not point-in-time**. Its `filing_date` is documented as the date of the *most
recent* SEC filing that included a period's data, explicitly conflating
restatements of the same period; there is no as-reported query mode, no
distinction between an original filing and an amendment, and no field recording
when a value became publicly known.

The consequence is specific rather than fatal. C5 is still satisfiable **going
forward**: ingestion appends each observation with the date FactorFlow observed
it, which is what C5 asks for and works against any provider. What cannot be
recovered is the period **before** ingestion starts — backfilled fundamentals
carry restated values, so any M4 backtest over that span is biased on the value
and growth factors. Momentum, being price-derived, is unaffected. This is the
charter's own warning about restatement arriving through the data source rather
than through the schema.

**A second limitation, found during CAP-001 system design.** Massive supplies **no
historical trading calendar**. Its market-holidays endpoint is
`GET /v1/marketstatus/upcoming`, documented as forward-looking only: it accepts no
date-range parameters, returns only future holidays, and records "Plan History: Not
applicable to this endpoint" (verified 2026-09-03). No plan tier changes this. Any
capability needing to distinguish a missing trading day from a non-trading day over
a historical range must therefore source that calendar elsewhere, or derive it — as
CAP-001 does, from the observed dates of the instruments it has acquired. Recorded
here because it is a property of the provider rather than of any one capability, and
because the single-provider decision is what makes it everyone's problem.

**Commercial terms.** All plans are marked *individual use only*, and the free
tier *non-pros only*. The owner confirmed non-professional status on 2026-09-02,
which is consistent with C8 — one owner-operator trading their own capital.

**Plan tiers, verified 2026-09-05.** Read from `https://massive.com/pricing`,
and the Basic rate limit confirmed by probe against the live API the same day.

| Tier | Price | Rate limit | History | Notable inclusions |
|------|-------|-----------|---------|--------------------|
| Stocks Basic | free | **5 calls/minute** | 2 years | End-of-day, reference data, corporate actions, minute aggregates |
| Stocks Starter | $29/mo | unlimited | **5 years** | 15-minute delayed, WebSockets, flat files, second aggregates |
| Stocks Developer | $79/mo | unlimited | 10 years | adds trades |
| Stocks Advanced | $199/mo | unlimited | 20+ years | adds real-time, quotes, **financials & ratios** |
| Financials & Ratios | $29/mo | — | — | Add-on; available without a stocks subscription |

**The owner's plan path, decided 2026-09-05.** Currently unsubscribed, on Basic.
The stated path is **Stocks Starter + Financials & Ratios add-on ($58/month)**
for CAP-001 through M1, moving to **Stocks Advanced** when real-time is required
at M3.

Three consequences follow, and they are recorded because each one binds a
capability rather than a preference.

**The rate limit is not a design constraint on the target plan.** Basic's five
calls per minute would make CAP-001's committed volume impossible — roughly
12,000 requests for a full run at AC-4's 3000 instruments, or about 40 hours of
pure waiting. Starter removes the limit entirely. The rate-limit governor is
still required, because a budget the owner configures is what makes the design
tier-agnostic and because an unlimited plan is not a promise of unlimited
throughput, but it is pacing rather than a ceiling on feasibility.

**Fundamentals are an add-on, not a Starter inclusion.** Financials and ratios
appear only in Advanced or as the separate $29 add-on. This confirms the earlier
finding that the first paid entitlement is due at **M1** for fundamentals rather
than at M3 for real-time; the owner's chosen combination buys it deliberately.

**Starter caps history at 5 years, and that is the binding limit for CAP-001.**
See the history-depth note below.

**History depth is capped by plan, and CAP-001 does not enforce it.** AC-2 has
the owner state a history depth and AC-4 commits to acquiring it; on Starter the
provider returns at most 5 years regardless of what is stated. The owner decided
on 2026-09-05 **not** to validate the stated depth against the plan: no
configured ceiling, no rejection at the Settings screen. A deeper request is
issued as stated and the provider returns what it holds.

This is a deliberate acceptance, and it has one obligation attached. CAP-001's
purpose is telling the owner the truth about what the product holds (AC-12,
AC-17), so a uniform 5-year shortfall across every instrument must not render as
though it were a provider data gap. Coverage reports what was actually acquired,
which is already the design; what this note adds is that the shortfall is
expected and attributable to the plan, not to acquisition failure. If it later
proves confusing in practice, the cheaper fix is a note on the coverage screen
rather than input validation.

**Flat files are the right tool for whole-market backfill, and the wrong one for
CAP-001.** Evaluated 2026-09-05 against the flat-file documentation, because
Starter includes them and they look at first like a cheaper way to acquire
history.

They cover **day aggregates, minute aggregates, quotes and trades only**. There
are no flat files for fundamentals, corporate actions or ticker reference data,
so they can replace at most one of CAP-001's four reads and the REST client is
required regardless.

The deciding property is granularity. A flat file is one **day** containing
**every** ticker — the schema carries a `ticker` column and a single
`window_start` — which is the inverse of what CAP-001 needs. Acquiring 3000
named instruments over five years means roughly 1,260 daily files, of which
about three-quarters of each file's rows are discarded, against roughly 3,000
per-instrument REST calls that return only what was asked for. The argument for
flat files is request count, and the unlimited rate limit on Starter removes it.
Adopting them would add an S3 client, credential handling, a
download-decompress-filter pipeline and local staging to this capability, in
exchange for nothing it needs. It also cuts against CAP-001's own scope
boundary, which excludes acquiring data for instruments the owner has not named.

Recorded rather than dismissed, because the calculation inverts at scale. A
capability that backfills the whole market — universe construction, or M4's
backtest history — wants every ticker for every day, which is exactly the shape
a flat file has and exactly the case where per-instrument REST calls become the
expensive path. Decided 2026-09-05: REST for CAP-001; revisit flat files when a
capability needs market-wide history rather than a named list.

**M4 may force the Advanced upgrade before M3 does.** The owner's path upgrades
to Advanced for real-time at M3, but M4 backtests across market regimes, and a
5-year window on Starter or 10 on Developer may not span the regimes the
promotion evidence needs — 20+ years is Advanced-only. This is the same pattern
already recorded for fundamentals at M1: the upgrade trigger arrives earlier
than the headline reason for it. Flagged as a milestone risk on 2026-09-05
rather than decided; M4's design states the required backtest range, and that is
when this resolves.

**Assessment, and the decision taken.** Massive covers the price side of the charter fully and the
fundamentals side adequately for point-in-time capture from the day ingestion
starts. It does not supply as-reported history, so if M4 requires unbiased
fundamental backtests over years the product did not observe, that needs either a
second source for as-reported fundamentals or an explicit, recorded acceptance of
restatement bias in the promotion evidence. The owner chose the second of these on
2026-09-02: adopt Massive as the single provider and carry the restatement
limitation as a stated constraint on the promotion evidence.

## Revision History

| Date | Change |
|------|--------|
| 2026-10-25 | Confirmed the ten npm packages the vendored `shadcn/ui` components import, on the owner's direction, closing OQ-TS-10 and CAP-003 capability OQ-4 (specification review v1 FINDING-1): `cmdk`, `sonner`, `@tanstack/react-table`, `react-hook-form`, `zod`, `@hookform/resolvers`, `clsx`, `tailwind-merge`, `class-variance-authority` and `lucide-react`, with their licences. Approval was invalidated by this edit; the owner re-approves v6 |
| 2026-10-12 | Recorded Node.js 22 as the runtime for the frontend toolchain, on the owner's direction. It is the version the frontend validation commands already run on, and the one the CAP-001 release image's interface build stage uses (`component-design-runtime-config.md` v12 section 2.8.2, its open question 7). No technology was added or changed |
| 2026-09-08 | Recorded the frontend toolchain as built, from CAP-001-E1-S4's implementation. The note claiming the `npm` and `npx` commands "do not exist yet" was false once that story created `package.json`: all six are verified working, so the note now matches the seven Python commands' form and records two behaviours a reader would otherwise meet as surprises — `npm run test` drives a real Vite build and so writes into the API's static directory, and `npm run test:e2e` is defined but has no Playwright specs yet. Added `react-router-dom` to the TypeScript key libraries: it was adopted as a runtime dependency without being recorded here, and it is load-bearing rather than incidental, since the shell's active-destination state is its `NavLink` `aria-current` behaviour. Approval was invalidated by these edits and the artifact returned to draft pending the dedicated `$tech-stack` workflow. A `$tech-stack` review the same day added `autoprefixer`, the one further gap its research surfaced: it is installed and run by `postcss.config.js` on every build, so it sits in the CSS path for every rendered surface, and it had been carried as unrecorded build plumbing. That review confirmed the entry otherwise complete and found no missing or stale components, the project being a single repository |
| 2026-09-05 | Adopted Massive's official Python client by owner decision, retaining the CAP-001 `MassiveClient` as the operational boundary around the SDK rather than a portability layer. Refreshed the document's source context and provenance against CAP-001 v7 and system design v5, and corrected the restatement-bias decision wording. |
| 2026-09-05 | Recorded the verified Massive plan tiers and settled the owner's plan path, closing the remainder of OQ-TS-7. Pricing was read from `massive.com/pricing` and the Basic tier's five-calls-per-minute limit confirmed by probe against the live API, alongside the base URL, the `Authorization: Bearer` scheme and the error envelope — none of which Massive documents publicly. The path is **Stocks Starter + Financials & Ratios ($58/month)** for CAP-001 through M1, moving to **Advanced** at M3 for real-time. Three consequences were recorded: the rate limit stops being a feasibility constraint once off Basic, which resolves the provider-throughput half of CAP-001's specification review FINDING-6; fundamentals remain an add-on rather than a Starter inclusion, confirming the first paid entitlement falls at M1; and Starter caps history at five years, which the owner decided on 2026-09-05 **not** to enforce in CAP-001 — a deeper stated depth is issued as stated and the provider returns what it holds, with the obligation that coverage must not present the uniform shortfall as a provider data gap (AC-12, AC-17). Raised OQ-TS-9: M4's backtest range may force the Advanced upgrade before M3's real-time need does, since 20+ year history is Advanced-only. Approval was invalidated by these edits and the artifact returned to draft pending the dedicated `$tech-stack` workflow |
| 2026-09-03 | Closed OQ-TS-6 on the owner's decision: `shadcn/ui` on Radix primitives for components, TradingView `lightweight-charts` for charting. The deferral had named "the first capability carrying a UX design" as its trigger and assumed that would be the M4 or M5 evidence screens; CAP-001 delivers an ingestion view and reached the UX stages first, so the trigger fired on a capability that needs tables and status rather than charts. Components were therefore decided on CAP-001's needs and accessibility posture, charting on M4 and M5's. Also recorded a second Massive limitation found while designing CAP-001: the provider has no historical trading calendar, its holiday endpoint being forward-looking only, which no plan tier changes. Approval was invalidated by these edits and the artifact returned to draft pending the dedicated `$tech-stack` workflow |
| 2026-09-02 | Created for the FactorFlow rebuild, from the charter alone — no capabilities are defined yet, and nothing was inherited from the first build. Python, PostgreSQL without an ORM, and FastAPI were re-derived from the charter's backtesting commitment, its single-transaction money path and its point-in-time history requirement rather than from the broker SDK that justified the language the first time, because this charter leaves the broker open. SQLite was weighed against the two-process topology and rejected. The owner interface is React with Vite and Tailwind, chosen on the charter's committed backtest-evidence and promotion screens rather than by inheritance, and against a server-rendered alternative that would reach M1 sooner but would defer building the JSON API this choice has from the start. Docker on a self-hosted machine was chosen to express the two-process topology directly and to let database-backed tests run against real PostgreSQL, and an in-process scheduler drives execution because the charter's stated topology leaves no room for a dedicated execution process. Massive was adopted as the single provider for prices, fundamentals, corporate actions and instrument reference data, which removes the cross-provider identity problem entirely; its fundamentals are not as-reported, and that limitation was accepted with the obligation placed on the promotion evidence rather than on ingestion. Alpaca was chosen for both paper and live, closing charter OQ-3; because the owner requires live trading to be movable to another broker, the charter's existing broker port is specified in the product's vocabulary rather than Alpaca's, and no additional abstraction was introduced. The owner then closed the remaining commercial and lifecycle questions: paper and live are always the same broker, so promotion evidence is always generated against the executing venue; the owner qualifies as non-professional and upgrades the Massive plan as entitlements are needed, with the first upgrade due at M1 for fundamentals rather than at M3 for real-time; and dependency versions are captured from the first lockfile rather than pinned here. What remains open is deferred by decision rather than by omission: the numeric library, to the system design of the first capability requiring factor computation, and the interface component and charting libraries, to the first capability carrying a UX design. Alpaca credential separation is the one question still genuinely outstanding |
