# FactorFlow

Classify a self-defined stock universe and trade it automatically under
owner-controlled strategies, proven in paper before capital is at risk.

A single repository holding the specifications, the application, the market
data ingestion process, and the owner interface. See
`docs/constitution/product-charter.md` for the product itself and
`docs/constitution/tech-stack.md` for the approved technology stack.

## Status

Early. The database schema foundation — including append-only, point-in-time
observation tables for instrument reference data, daily bars, fundamentals,
and corporate actions, the non-overlapping coverage-segment and
last-acquisition-state tables, and the acquisition-run and per-instrument
result journal tables — the instrument-list domain service, the instrument
and settings API routes, the API's health endpoint and application factory,
the pure acquisition-run lifecycle primitives, the run journal's request
and claim operations, the ingestion range planner — which computes
per-data-type fetch intervals from a claimed run's snapshotted history depth,
yielding only the sub-ranges not already covered — and the owner interface's
application shell — its
navigation rail, routing, and status region — are in place. The Instruments
and Settings screens are also built, rendering inside that shell and
consuming the instrument and settings API. The market data ingestion
process's Massive provider response models — parsing the provider's four
historical data shapes into the product's own vocabulary — its typed
error taxonomy — reconstructing which provider failure occurred from the
SDK's single status-code-discarding exception — a safe failure-reason
composer built on that taxonomy, its provider-agnostic rate-limit governor,
the deterministic observation-value hashing primitive, and the historical
client that wires the provider boundary to Massive's REST SDK are also in
place. The observation writer — the pure coverage range arithmetic in
`coverage.py` and the typed writer that commits all four data types atomically in
`writer.py` — is also in place, and the acquisition runner now calls it: it
claims a run, walks the roster it snapshotted at claim time instrument by
instrument, checks the claim and cancellation before each one, fetches each
of the four data types individually (so one instrument can have distinct
per-data-type outcomes), classifies each fetch result through
`outcomes.py`, and finalises the run from what was written.
`ingestion_main.py` is the ingestion process's own entrypoint, separate from
the API. The application container now also runs a periodic reclaim sweep:
`src/factorflow/runs/reclaim.py` (`reclaim_stale_runs`) finds claimed runs
whose heartbeat has gone stale and transitions them to `abandoned`, so a
crashed ingestion process never wedges acquisition permanently; the sweep
runs as an asyncio background task in the API lifespan, not in the ingestion
container, so it continues operating when ingestion is stopped or
crash-looping. The acquisition run API routes — `POST /api/acquisition-runs`,
`GET /api/acquisition-runs`, `GET /api/acquisition-runs/{id}`, and
`POST /api/acquisition-runs/{id}/cancel` — are also in place, backed by a
read-only journal query boundary (`src/factorflow/runs/queries.py`) with
keyset cursor pagination and failure-first result ordering. The coverage
read — `src/factorflow/coverage/service.py`, deriving per-instrument
coverage at read time from the rows actually written — is in place, with gap
detection in daily prices (`src/factorflow/coverage/gaps.py`), and is served
over HTTP by `GET /api/coverage` (`src/factorflow/api/routes/coverage.py`).
The Runs screen is also built: it lists run history with each outcome's
severity tier, polls while a run is in progress, and carries the reusable
Start and Cancel run controls. The Run detail screen is also built at
`/runs/:runId`: it shows one run's outcome, timestamps and counts, its
instrument roster with each data type's outcome and failure reason behind
row expansion, and the cancel and re-run actions. The Coverage screen is also built: it shows
each instrument's per-data-type presence, covered range, gap count and
depth shortfall from `GET /api/coverage`, with gap dates behind row
expansion, and it never polls. Migration `0005_universes.sql` adds the
research store's first tables, `universe` and the append-only
`universe_event` log, and `src/factorflow/universes/replay.py` reads them:
it replays current and as-of membership from the event log and pages events
and universes. `src/factorflow/universes/service.py` is their first writer:
`create_by_hand` creates a named universe from covered instruments (an
`instrument` row with at least one `coverage_segment`, whatever its
lifecycle), and `add_members` adds covered instruments to an active universe,
reporting current members as `already_member`. Either call refuses the whole
request when any symbol is not covered, naming every such symbol, and a
create is also refused when it has no members or when an active universe
already holds its trimmed name. Every write takes one transaction advisory
lock (`UNIVERSE_WRITE_LOCK_KEY`) before its checks, so two concurrent creates
of one name cannot both succeed, and issues `INSERT` only; no API route or
screen calls the service yet. Migration `0006_classifications.sql` adds the
classification tables: `classification_set` (one row per set, keyed to the
acquisition run it reflects, in state `building`, `complete` or `failed`, with
at most one `building` at a time), `classification_set_factor`, `factor_input`
and `factor_classification`. The data side of the classification scheduler
is `src/factorflow/classification/scheduler.py`: `claim_next_set` takes the
oldest ended acquisition run in `succeeded` or `partial` with no set and
inserts a `building` set stamped with the America/Chicago date (a concurrent
claim loses to the one-`building` index and returns `None`), and
`reclaim_interrupted_sets` records every set left `building` as `failed`
with the reason `interrupted: the application restarted during the build`.
Their statements live in `classification/sql/`. No loop calls either yet, and
nothing writes the factor tables. What exists today is described
below and in `docs/reference/` — everything else in `docs/` is
specification for work not yet implemented.

## Requirements

- Python 3.12 or newer
- [uv](https://docs.astral.sh/uv/) for dependency resolution
- Node.js 22 with npm, for the owner interface (matching `tech-stack.md` v5 and
  the release image's `node:22-slim` stage)
- Docker with host networking enabled (Linux, or Docker Desktop with host
  networking enabled under Settings, Resources, Network), for deployment and
  for the `postgres`-marked test suite (see [Deploying and operating FactorFlow](#deploying-and-operating-factorflow) and [Testing](#testing))

## Setup

```bash
uv sync --all-extras   # Python dependencies
npm ci                 # frontend dependencies, from package-lock.json
```

## Building the interface

The interface builds into the API package's static directory, so one
container image ships both:

```bash
npm run build
```

Output lands in `src/factorflow/api/static/`. The build sets
`emptyOutDir: false`, because the default would delete the tracked
`.gitkeep` that keeps that directory in version control — and the API's
static mount is guarded by whether the directory exists. Vite still
overwrites `index.html` and `assets/` each time, but it no longer removes
files it did not produce, so **hashed assets from earlier builds accumulate
there**. Clear `assets/` by hand when that matters; nothing serves the stale
files, since `index.html` references only the current ones.

## Layout

| Path | Contents |
|------|----------|
| `Dockerfile` | Three-stage release image (`component-design-runtime-config.md` section 2.8.2): stage 1 (`interface`, `node:22-slim`) runs `npm ci && npm run build`; stage 2 (`lock`, `python:3.12-slim` with `uv==0.12.10`) runs `uv export --locked --no-emit-project --format requirements.txt`; stage 3 (`python:3.12-slim`) installs requirements with `--require-hashes`, copies the built bundle from `interface`, and installs the package with `--no-deps`. Its `CMD` runs `python -m factorflow.db.migrate_main && exec python -m factorflow.app_main`, so a failed migration prevents the API from ever binding |
| `.dockerignore` | Excludes `node_modules/`, `.venv/`, `dist/`, `build/`, `tests/`, `test-results/`, `playwright-report/`, `.git/`, `.env`, `.env.*`, and `src/factorflow/api/static/` so a local build or test file never enters the release build context |
| `compose.yaml` | Production deployment definition (`component-design-runtime-config.md` section 2.8.3): `postgres:16`, `app`, and `ingestion` (under `profiles: [ingestion]`) all on `network_mode: host` with no published ports, `scram-sha-256` authentication on every route, required `${...:?...}` variable interpolations, and volume `factorflow-pgdata`. See [Deploying and operating FactorFlow](#deploying-and-operating-factorflow) |
| `scripts/deploy-smoke.sh` | Deployment smoke check (`scripts/deploy-smoke.sh [project]`, default `factorflow`): verifies container health and `pg_hba.conf` methods (`scram-sha-256`, `peer`, `reject`), `GET /api/health` (`database == "reachable"` and `schema_version` equal to the running image's highest migration), `GET /` serving `index.html`, and the absence of any listener on port 8000 or 5432 across all non-loopback IPv4, IPv6, and link-local addresses of the host and Docker Desktop's VM |
| `src/factorflow/` | The `factorflow` package (`src/` layout) |
| `src/factorflow/config/` | Runtime configuration and the credential boundary. `settings.py` validates every environment variable at start and holds secrets in `SecretStr`; `redaction.py` scrubs known secret values from log records. See [Configuration](#configuration) |
| `src/factorflow/db/` | Database definitions and the schema migrator. `applied_migrations.py` exports `APPLIED_MIGRATIONS_DDL`, the migration-tracking table the migrator creates before applying the first migration file. `migrator.py` discovers, checksums, and applies migration files under an advisory lock. `migrate_main.py` is the container entrypoint (`python -m factorflow.db.migrate_main`), mapping every outcome to an exit code 0–4 |
| `src/factorflow/db/migrations/` | Numbered, forward-only SQL migrations, shipped inside the installed package and resolved through `migrate_main.MIGRATIONS_DIR`. See `src/factorflow/db/migrations/README.md` for the conventions |
| `src/factorflow/runs/` | Acquisition-run lifecycle: pure state primitives, the journal's request, claim, cancellation, and finalisation boundary, the stale-claim reclaim sweep, and the read-only journal query boundary. `states.py` exposes the allowed states and transitions plus `validate_transition()`, which raises `IllegalRunTransition` before an illegal transition can be persisted; `journal.py` records every run request as `requested` — reporting the active run it queues behind — claims the oldest requested run in one statement while none is running or cancelling, refreshes the claim's heartbeat, records a cancellation request cooperatively against a running run or directly against a queued run (raising `RunAlreadyTerminal` when the run has already ended), reports whether cancellation was requested, records how many instruments a claimed run's roster named, fails a run outright with a reason when the provider rejects the credential, and finalises a run by deriving its terminal state from the results written; `reclaim.py` finds claimed `running` or `cancelling` runs whose `heartbeat_at` is stale past the configured window and transitions them atomically to `abandoned`, clearing claim fields and setting `ended_at`; `queries.py` provides the read-only query boundary for the HTTP API — listing runs by `(requested_at, run_id) DESC` with an enum-validated state filter, and fetching a single run's summary, persisted and whole-run outcome counts, and paged per-instrument results with owner-readable symbols, failure-first ordering, and an enum-validated outcome filter, both using owner-confirmed versioned URL-safe opaque composite cursors, and reading the single most recent run for `GET /api/health` (`get_most_recent_run`) in the same order as the runs list. See [Run request and claim](#run-request-and-claim), [Stale-claim reclaim](#stale-claim-reclaim), and [Acquisition run API](#acquisition-run-api) |
| `src/factorflow/instruments/` | Domain service for the owner-managed instrument list. `symbols.py` normalises supplied symbols and validates their database shape; `service.py` adds or reactivates symbols in one transaction, retires stored symbols without deletion, returns keyset-paged lists with lifecycle counts, and provides the active instrument IDs in symbol order; `settings.py` reads and writes the owner's stated history depth (`read_history_depth`, `write_history_depth`), held in `owner_setting` as a `jsonb` value under the fixed key `history_depth_years` — see [History depth setting](#history-depth-setting). Exposed over HTTP by `src/factorflow/api/routes/instruments.py` and `settings.py` |
| `src/factorflow/coverage/` | The read-only coverage read. `service.py` declares `Presence`, `GapDetection`, `InstrumentCoverage` and `CoverageView` and exposes `read_coverage`, one symbol-keyset page of per-instrument coverage derived at read time, and `read_gap_dates`, one instrument's missing dates; `gaps.py` derives the trading-day set and each instrument's missing days (`detect_gaps`). `sql/coverage.sql`, `sql/never_acquired.sql`, `sql/gap_instrument.sql`, `sql/gap_range.sql` and `sql/gaps.sql` are their statements, loaded at import and shipped as package data (`[tool.setuptools.package-data]` in `pyproject.toml`). Exposed over HTTP by `src/factorflow/api/routes/coverage.py`. See [Coverage read](#coverage-read), [Gap detection](#gap-detection) and [Coverage API](#coverage-api) |
| `src/factorflow/classification/` | Factor classification (CAP-002). The factor engine's build transaction (`engine.py`, `constants.py`, `line_items.py` and their statements in `sql/`) is described in [`docs/reference/classification-engine.md`](docs/reference/classification-engine.md); the classification scheduler's data side (`scheduler.py`) under [Status](#status), and its settings (`settings.py`) under [Configuration](#configuration). `sql/*.sql` ships as package data |
| `src/factorflow/api/` | The FastAPI application. `app.py` is the application factory: lifespan-managed `psycopg_pool.ConnectionPool`, a periodic reclaim loop task (dispatches `reclaim_stale_runs` via `asyncio.to_thread` every 5 seconds), request-id middleware, the Host and Origin middleware it wraps (see [Host and Origin checks](#host-and-origin-checks)), exception handlers (`errors.py`'s envelope for uncaught exceptions, `app.py`'s for request-validation `422`s and framework HTTP errors such as `405`), and the static-bundle mount with its SPA fallback. `bounds.py` holds the canonical request-bound constants (`MAX_HISTORY_DEPTH_YEARS`, `MAX_PAGE_SIZE`, etc.) shared across route modules. `routes/health.py` implements `GET /api/health`; `routes/instruments.py` implements `GET`/`POST /api/instruments` and `DELETE /api/instruments/{symbol}`; `routes/settings.py` implements `GET`/`PUT /api/settings/history-depth` — both thin HTTP surfaces over `src/factorflow/instruments/`, delegating all domain logic. `routes/runs.py` implements `POST /api/acquisition-runs`, `GET /api/acquisition-runs`, `GET /api/acquisition-runs/{id}`, and `POST /api/acquisition-runs/{id}/cancel` — a thin HTTP surface over `src/factorflow/runs/journal.py` (mutations) and `src/factorflow/runs/queries.py` (reads). `routes/coverage.py` implements `GET /api/coverage`, a thin HTTP surface over `src/factorflow/coverage/service.py`. `models.py` and `errors.py` hold the response models and the `{"error": {...}}` envelope; `errors.py` carries an optional `state` field on `ErrorDetail`, excluded from the body unless the error is `run_already_terminal`. `static/` is the Vite build output directory, populated by `npm run build`; only its `.gitkeep` is tracked. See [Running the API](#running-the-api), [Acquisition run API](#acquisition-run-api) and [Coverage API](#coverage-api) |
| `src/factorflow/ingestion/hashing.py` | Pure deterministic observation-value canonicalization and hashing. `canonical_json()` emits sorted, compact UTF-8 JSON with exact `Decimal` strings and rejects unsupported values; `value_hash()` returns its raw 32-byte SHA-256 digest. See [Deterministic observation-value hashing](#deterministic-observation-value-hashing) |
| `src/factorflow/ingestion/plan.py` | Pure range planner for one acquisition run. `depth_start_for_run(run, today)` derives the window start from the claimed run's snapshotted `history_depth_years`, never from the current owner setting. `plan_fetches(data_type, covered, depth_start, today)` returns the sub-ranges of `[depth_start, today]` not already covered, with the trailing covered day deliberately re-fetched. See [Range planner](#range-planner) |
| `src/factorflow/ingestion/rate_limit.py` | The synchronous, provider-agnostic `RateLimitGovernor`: full-start token-bucket pacing, bounded throttle handling, and bounded retry backoff. See [Rate limit governor](#rate-limit-governor) |
| `src/factorflow/ingestion/coverage.py` | Pure date-range arithmetic. `merge_ranges(existing, written)` merges a newly written range into existing coverage segments, coalescing overlap and one-calendar-day adjacency in either direction. Returns the minimal ordered set of non-overlapping segments. No database dependency. See [Coverage range arithmetic](#coverage-range-arithmetic) |
| `src/factorflow/ingestion/writer.py` | Observation writer: one atomic transaction per instrument. Defines `ParsedObservations` (writer-local typed grouping of the four provider-model collections with per-data-type coverage ranges), `WriteResult` (immutable per-type appended/unchanged counts and covered ranges), `RunNotActive` (raised when the run's `acquisition_run` row is not in an active state at the start of a write — prevents a post-reclaim runner from appending data), `write_instrument()` (commits observations, coverage, acquisition state, and run results in the caller's transaction after locking and verifying the run is active), and `write_instrument_with_outcomes()` (extends `write_instrument` to accept pre-classified error outcomes for data types that failed at the provider layer — the function the runner now calls). See [Observation writer](#observation-writer) |
| `src/factorflow/ingestion/runner.py` | The acquisition runner. `AcquisitionRunner.execute_claimed()` drives one claimed run sequentially over the roster snapshot, checking the claim and cancellation before every instrument; `CredentialAwareClientFactory.get_or_rebuild()` returns the cached provider client and builds a new one only when the credential value changed; `run_polling_loop()` claims, executes, or waits. Every write it causes belongs to `writer.py` or `outcomes.py`; it issues two parameterised reads of its own, for an instrument's symbol and its coverage segments. See [Acquisition runner](#acquisition-runner) |
| `src/factorflow/ingestion/outcomes.py` | Per-instrument outcome classification (CAP-001-E4-S6). `InstrumentOutcomeRecord` is the typed per-data-type result record the writer persists. `classify_write_result` maps a `WriteResult` to per-data-type outcome strings (`written`/`unchanged`). `classify_provider_error` maps a typed `MassiveError` to a single `InstrumentOutcomeRecord` for the failing data type (`not_found` or `failed`). `write_error_results` is preserved from E4-S5 for the all-at-once fetch phase. The module owns the classification boundary only — no SQL, no retry logic, no credential access, no reason composition. |
| `src/factorflow/ingestion/massive/` | Pydantic v2 response models for Massive's four historical data shapes, named in the product's own vocabulary rather than the provider's, the provider's typed error taxonomy, a safe failure-reason composer, and the historical client over Massive's REST SDK. `models.py` defines `TickerReference`, `DailyBar`, `FinancialStatement`, and `CorporateAction`; wire field names (`t`, `o`, `h`, `l`, `c`, `filing_date`, and the rest) appear only as `Field(alias=...)`, never as a public attribute. `errors.py` reconstructs `InstrumentNotFound`, `CredentialRejected`, `ProviderUnavailable`, and `ProviderContractViolation` from the Massive SDK's single, status-code-discarding exception, and composes owner-visible failure reasons from them via `compose_failure_reason` and `MAX_FAILURE_REASON_VARIABLE_TEXT`. `client.py` defines `MassiveClient`, the four product-named reads over one reusable SDK client, every request routed through `RateLimitGovernor`; `paging.py` follows a paged read's `next_url` one page at a time under governor permits. `__init__.py` re-exports exactly these model, error-taxonomy and reason-composer names — no Massive SDK type or raw wire dict crosses the package boundary. See [Massive provider response models](#massive-provider-response-models), [Massive historical client](#massive-historical-client), and [Massive provider failure reasons](#massive-provider-failure-reasons) |
| `src/factorflow/app_main.py` | The uvicorn entrypoint (`python -m factorflow.app_main`). Binds the host and port from `ApiSettings` (loopback only by default) |
| `src/factorflow/ingestion_main.py` | The ingestion entrypoint (`python -m factorflow.ingestion_main`), the acquisition process's own `main()`. Loads `Settings`, configures redacted logging, derives a runner id from the hostname, and runs the polling loop. It shares only the database with the API and never imports `factorflow.api` — a test asserts the import never happens. `main()` takes two keyword-only parameters, `settings_factory` (default `Settings`) and `credential_reader` (default `read_provider_credential`, called at every claim). They exist only for the test-only entry point `tests/e2e/support/ingestion_e2e_main.py` and are not configuration; the release launch passes neither. See [Running the acquisition runner](#running-the-acquisition-runner) |
| `web/` | The owner interface's Vite root. `index.html` is the bundle entry; `src/main.tsx` mounts the React root inside a `BrowserRouter` |
| `web/src/api/` | The interface's typed access to the JSON API: the delivered client (`types.ts`, `client.ts`, with `ApiError`/`ApiUnreachableError` and the exported `requestJson`) and the classification fetch layer (`classification-types.ts`, `classification-client.ts`, with `ClassificationApiError`), and the Research URL codec (`research-query.ts`). Described in [`docs/reference/web-api.md`](docs/reference/web-api.md). Same-origin only — the bundle is served by the API process, so every path is relative |
| `web/src/app/` | The application shell. `shell.tsx` renders the fixed navigation rail of four destinations — Coverage, Instruments, Runs, Settings — a main region, and the status region pinned to the rail's bottom. The shell is exactly the viewport's height (`h-screen`) and the main region scrolls on its own (`overflow-auto`), so a screen's content scrolls within `main` rather than the page; `routes.tsx` mounts the Coverage, Instruments, Runs and Settings screens (see below) at their destinations, plus the Run detail screen at `/runs/:runId`, a `/` redirect to `/coverage`, and a catch-all not-found rendered inside the frame. `status-region.tsx` polls health and renders the region, and exports the unreachable state the shell substitutes for the main region. See [The status region](#the-status-region) |
| `web/src/screens/coverage/` | The Coverage screen. `index.tsx` composes the screen's `ScreenState`, toolbar, plan-limit note and cursor-stack pager; `coverage-table.tsx` renders the expandable table and fetches gap dates on expansion; `badges.tsx` renders the presence, gaps-unknown and depth-shortfall badges; `cells.tsx` renders missing, measured and inapplicable values, session dates and Chicago timestamps; `uniform-shortfall.ts` decides when every loaded row shares one shortfall; `copy.ts` holds every user-visible sentence. See [Coverage screen](#coverage-screen) |
| `web/src/screens/instruments/` | The Instruments screen: one table with a lifecycle column (never two tables), single-symbol and bulk (`textarea`) add, and retirement through a `dialog` `confirm`. `index.tsx` composes the screen's `ScreenState`; `instrument-table.tsx` holds server-side search/filter and keyset "Load more" paging; `add-field.tsx` and `bulk-add.tsx` (with `parse-bulk-symbols.ts`) add instruments; `retire-dialog.tsx` confirms retirement; `start-action.tsx` renders the acquisition-run trigger `blocked` when history depth is unset; `badges.tsx` renders the active/retired lifecycle badge. See [Instruments and Settings screens](#instruments-and-settings-screens) |
| `web/src/screens/runs/` | The Runs screen and the reusable run controls. `index.tsx` composes the screen's `ScreenState` and its 10-second poll (`RUNS_POLL_INTERVAL_MS`); `run-table.tsx` renders the `history` table, whose run-id link is the only way into a run; `outcome-badge.tsx` maps each run state to its tier, word and icon (`RUN_STATE_TIER`, `RUN_STATE_LABEL`, `OutcomeBadge`); `run-controls.tsx` exports `StartRunControl`; `cancel-run.tsx` exports `CancelRunControl`, which the Run detail screen mounts. `detail/` is the Run detail screen: `index.tsx` composes its `ScreenState`, outcome filter, cursor-stack pager and 10-second poll (`RUN_DETAIL_POLL_INTERVAL_MS`); `run-summary.tsx` renders the summary card with the cancel and re-run actions; `instrument-roster.tsx` renders the expandable per-instrument roster; `result-outcome-badge.tsx` maps each per-data-type outcome to its tier and word. See [Runs screen](#runs-screen) and [Run detail screen](#run-detail-screen) |
| `web/src/screens/research/` | Shared modules for the CAP-002 Research screens, which no route mounts yet: `format.ts` turns scores, percentiles, ratios, rates, amounts, timestamps and dates into text; `copy.ts` holds every owner-facing string. Described in [`docs/reference/research-screen.md`](docs/reference/research-screen.md) |
| `web/src/screens/settings/` | The Settings screen: `index.tsx` composes the layout; `history-depth-form.tsx` reads and writes the history-depth setting with STD-UI-19-shaped validation errors; `credential-status.tsx` reports provider credential presence only, never the value, with a distinct icon/shape per state. See [Instruments and Settings screens](#instruments-and-settings-screens) |
| `design-system/` | Vendored `theme.css` design tokens, imported by `web/src/index.css` and mapped into Tailwind's scales by `tailwind.config.js` |
| `tests/unit/` | Tests needing no database |
| `tests/integration/` | Tests running against a real PostgreSQL 16 container |
| `tests/e2e/` | Playwright end-to-end specs, run by `npm run test:e2e` against a real API and PostgreSQL container started by `scripts/run-e2e-server.sh`. `fixtures/` holds plain SQL seeds that a spec applies itself, and `support/database.ts` exports `sql()`, which runs one statement in the e2e container; Playwright collects neither. `support/massive_stub.py` is the loopback provider stub and `support/ingestion_e2e_main.py` the test-only ingestion entry point that accepts it — see [Testing](#testing). Nothing under `tests/` is in the release artifact |
| `docs/` | Constitution, capability specifications, and designs |

## Configuration

Every setting is read from the environment at process start and validated
before anything else runs, so a misconfiguration fails immediately rather
than surfacing later as a confusing runtime error. A missing or malformed
required value raises `ConfigurationError` naming the **environment
variable** — never its value.

| Variable | Required | Default | Notes |
|---|---|---|---|
| `FACTORFLOW_DATABASE_URL` | yes | — | Held as a secret; never logged. A plaintext channel is accepted only to `127.0.0.1`, `::1`, or a `localhost` that resolves only to loopback; any other host (or no host) requires `sslmode=verify-full`, and every libpq route to another address (`host`, `hostaddr`, `service`, multi-host, `PGHOST`, `PGHOSTADDR`, `PGSERVICE`, `PGSERVICEFILE`) is refused at start. See [Database URL confinement](#database-url-confinement) |
| `FACTORFLOW_DATABASE_POOL_MIN` | no | `1` | Minimum 1 |
| `FACTORFLOW_DATABASE_POOL_MAX` | no | `4` | Minimum 1 |
| `FACTORFLOW_API_HOST` | no | `127.0.0.1` | Loopback only; a non-loopback address is rejected at start |
| `FACTORFLOW_API_PORT` | no | `8000` | 1–65535. Also fixes the `Host` and `Origin` values the API accepts, read once when the application is built. See [Host and Origin checks](#host-and-origin-checks) |
| `FACTORFLOW_MASSIVE_API_KEY` | yes | — | Held as a secret. Supplied to both processes; the application reads only whether it is set |
| `FACTORFLOW_MASSIVE_BASE_URL` | no | `https://api.massive.com` | `https` only, with a host and nothing else: a query, fragment, userinfo, path, whitespace or control character, or a port outside 1–65535 is rejected at start, and so is `http`, loopback included. One trailing `/` is removed. The error names the variable and the broken rule, never the value. See [Massive historical client](#massive-historical-client) |
| `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` | yes | — | No default: the budget is the owner's provider plan and cannot be guessed |
| `FACTORFLOW_MASSIVE_MAX_ATTEMPTS` | no | `3` | Minimum 1 |
| `FACTORFLOW_MASSIVE_TIMEOUT_SECONDS` | no | `30` | Minimum 1 second |
| `FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS` | no | `2` | |
| `FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS` | no | `300` | |
| `FACTORFLOW_RUN_HEARTBEAT_SECONDS` | no | `60` | Minimum 1 second |
| `FACTORFLOW_RUN_STALE_AFTER_SECONDS` | no | `900` | See the timing rules below |
| `FACTORFLOW_RUN_POLL_INTERVAL_SECONDS` | no | `5` | Minimum 1 second |
| `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS` | no | `5` | Minimum 1 second. Read by `ClassificationSettings`, which no running process uses yet. Must be less than the build timeout, or the settings are refused |
| `FACTORFLOW_CLASSIFICATION_BUILD_TIMEOUT_SECONDS` | no | `300` | Minimum 1 second. Read by `ClassificationSettings`, which no running process uses yet |
| `FACTORFLOW_LOG_LEVEL` | no | `INFO` | Applied to the root logger by `configure_logging()` |

### Timing rules

The run-timing values are related, not independent. `Settings` refuses to
start when any of these is violated, because a broken relationship otherwise
shows up as a run that fails intermittently under a slow provider rather than
as an error at start:

- `stale_after` must exceed `heartbeat × 3`
- `stale_after` must exceed `(max_attempts × timeout × 4) + max_throttle_wait`
  — the worst case for a single instrument, expressed as a formula so raising
  the timeout or the throttle budget raises the required window with it
- `poll_interval` must be less than `stale_after`

### The credential boundary

The provider credential is never written to the repository, a log record, or
an API response. Three mechanisms enforce this together:

- **`SecretStr` wrapping** — `repr()`, `str()`, `model_dump()` and
  `model_dump_json()` of any settings object render it as `**********`.
- **Log redaction** — `configure_logging()` installs `RedactingFilter` so
  every record from every handler is scrubbed, including records from
  third-party libraries, exception tracebacks, and caller-supplied `extra`
  attributes.
- **Presence-only reporting** — `credential_present()` returns whether the
  variable is set without ever reading its value.

Rotation needs no restart: `read_provider_credential()` re-reads the
environment on every call, and `credential_fingerprint()` gives a short,
non-reversible digest for detecting that the value changed.

### Database URL confinement

The database channel carries the database password and market data in
plaintext on loopback (CONST-SEC 1.3 `SEC-ENC-001` host-local loopback
exception, condition H7; `component-design-runtime-config.md` section 2.3;
CAP-001-E1-S8). `DatabaseSettings` enforces that confinement before any of
the three clients — `migrate_main`, the API's connection pool, or
`ingestion_main` — opens a connection:

- **Loopback hosts.** When the parsed host is `127.0.0.1`, `::1`, or
  `localhost` whose every `socket.getaddrinfo` result is a loopback address,
  any `sslmode` is accepted.
- **Any other host, or no host.** A remote host, a `localhost` that resolves
  to any non-loopback address, or a host-less Unix-socket URL must carry
  `sslmode=verify-full`, or loading raises `ConfigurationError` naming
  `FACTORFLOW_DATABASE_URL` and the rule, never the URL or its password
  (AC-13).
- **Alternate libpq address routes refused.** Because libpq can take the
  peer address from outside the URL's host, loading also fails when any of
  `PGHOST`, `PGHOSTADDR`, `PGSERVICE` or `PGSERVICEFILE` is set in the
  environment (even to `""`), when `psycopg.conninfo.conninfo_to_dict` sees
  a `hostaddr` or `service` parameter or a comma-separated host list, or
  when the URI query string carries a `host` parameter (scanned on libpq's
  terms, where `#` does not start a fragment).

Only `src/factorflow/config/settings.py` reads `FACTORFLOW_DATABASE_URL`
from `os.environ` (`DatabaseSettings` and the redaction filter);
`tests/unit/test_database_url_all_clients.py` scans `src/factorflow` to keep
it that way.

**Accepted warnings from implementation review v1**
(`CAP-001-E1-S8-implementation-review-v1.md`) — none blocks a current
acceptance criterion:

- `_confine_plaintext_to_loopback` is a `@model_validator(mode="after")`
  raising `ValueError`, so Pydantic v2 formats `str(exc)` with a leading
  `Value error, FACTORFLOW_DATABASE_URL: <rule>` prefix rather than starting
  directly with the variable name (IR-001, low).
- `tests/unit/test_distribution_contents.py` is not marked `slow` because
  `uv build --wheel --offline` completes in ~0.4 s (task T004 made the
  marker conditional on runtime), whereas
  `component-design-runtime-config.md` section 7 states that the module is
  marked `slow` (IR-002, low).

## History depth setting

`src/factorflow/instruments/settings.py` holds the owner's stated history
depth — how many years of history an acquisition run reaches back for — as a
number of years rather than an absolute start date, so the reach re-evaluates
on every run instead of drifting fixed to whenever it was set. The setting is
stored in the `owner_setting` table (created by migration
`0001_extensions_owner_state.sql`) as a `jsonb` value under the fixed key
`history_depth_years`, so a later owner setting needs no schema change.

`read_history_depth(connection)` returns a `HistoryDepth | None`: `None` when
the owner has never stated a depth, distinct from a stated zero, since a
missing depth is meant to block acquisition rather than the product silently
choosing a depth on the owner's behalf. When set, it returns a frozen
`HistoryDepth` dataclass carrying `years` and `updated_at`, so a caller can
show when the value was last changed.

`write_history_depth(connection, years)` upserts the value and advances
`updated_at`, raising `ValueError` when `years` is not a positive integer
(zero, negative, non-integer, and `bool` values are all rejected — `bool` is
explicitly excluded even though it is an `int` subclass, so `True` cannot
silently store as a depth of 1). No upper bound is enforced here: a depth
beyond what the provider plan holds is recorded unchanged, because the
product reports what was actually acquired rather than presenting a shortfall
as a data gap. A 50-year sanity cap (`MAX_HISTORY_DEPTH_YEARS` in
`src/factorflow/api/bounds.py`) exists instead at the HTTP layer, enforced by
`PUT /api/settings/history-depth`'s request model before this module's write
ever runs — see [Instrument and settings API](#instrument-and-settings-api).

Both functions take a caller-supplied `psycopg.Connection` rather than
opening their own, so a caller can compose a depth write with other
instrument-list operations inside one transaction.

## Instrument and settings API

`src/factorflow/api/routes/instruments.py` and `settings.py` expose the
instrument-list domain service over HTTP — a thin surface that validates the
request, delegates to `src/factorflow/instruments/`, and shapes the
response; no business rule is duplicated in the route layer.

| Endpoint | Behavior |
|---|---|
| `GET /api/instruments` | `symbol` prefix filter, `lifecycle` filter (`active` or `retired`; any other value is rejected `422`), `limit` (default 50, max 500, rejected `422` above the bound rather than clamped), and keyset `cursor` pagination. Returns `active_count`/`retired_count` computed over the whole list, independent of the current filter |
| `POST /api/instruments` | Adds or reactivates up to 1000 symbols (`MAX_SYMBOLS_PER_REQUEST`) per request. `201` when at least one symbol is added or reactivated, with the batch split into `added`/`reactivated`/`rejected` groups, each rejection carrying a reason; `409` when every symbol duplicates an active instrument; `422` when every symbol is malformed |
| `DELETE /api/instruments/{symbol}` | `404` for an unknown symbol, `409` for one already retired, `200` with `lifecycle: "retired"` and `retired_at` otherwise. `retired_at` is the API process's own clock, sampled immediately after the store's transaction commits — an approximation of the store's own `now()`, not a read-back of the exact persisted value |
| `GET /api/settings/history-depth` | `years` (or `null` when never set — distinct from zero) and `updated_at` |
| `PUT /api/settings/history-depth` | Sets the depth; `422` for anything outside `1..50` inclusive |

Every non-2xx response from these two route modules carries the shared
`{"error": {code, message, resource, request_id}}` envelope (`errors.py`),
including FastAPI's own request-validation `422`s — `app.py`'s
`_validation_error_handler` derives `resource` from the request path so a
shared, application-wide handler still names the right resource per route,
and names the offending fields in the message. See
[Error envelope and request correlation](#error-envelope-and-request-correlation).

## Acquisition run API

`src/factorflow/api/routes/runs.py` and `src/factorflow/runs/queries.py`
expose the acquisition run lifecycle over HTTP — a thin HTTP surface that
validates preconditions, delegates mutations to `src/factorflow/runs/journal.py`,
and delegates reads to `src/factorflow/runs/queries.py`.

| Endpoint | Success | Errors | Behavior |
|---|---|---|---|
| `POST /api/acquisition-runs` | `202` `{run_id, state: "requested", queued_behind}` | `409 history_depth_not_set`; `409 no_active_instruments` | Checks history depth first, then the active roster; refuses with `409` before writing any row; always accepts an active-run queue (AC-23, DAC-E5-14, DAC-E5-S5-1) |
| `GET /api/acquisition-runs` | `200` `{runs, next_cursor}` | `422` malformed or unsupported-version cursor, or an unknown `state` | Lists runs reverse-chronologically by `(requested_at, run_id) DESC`; accepts an optional enumerated `state` filter, `limit` (default 50, max 500), and keyset `cursor` (DAC-E5-S5-4, DAC-E7-S1-4) |
| `GET /api/acquisition-runs/{id}` | `200` `{run, counts, results, next_cursor}` | `404` unknown id; `422` malformed cursor or an unknown `outcome` | Returns the run summary; persisted instrument counts plus whole-run `counts.results_by_outcome`; and paged per-instrument, per-data-type results, each with its `symbol`. Outcome counts always include `written`, `unchanged`, `not_found`, `failed`, and `skipped`, are independent of result paging and the optional enumerated `outcome` filter, and default missing outcomes to `0`. Up to `4 * limit` result rows may be returned for `limit` instruments; ordering is failure-first (DAC-E5-S5-5, DAC-E7-S1-2) |
| `POST /api/acquisition-runs/{id}/cancel` | `202` `{state: "cancelling"\|"cancelled"}` | `409 run_already_terminal` with `error.state`; `404` unknown id | Running run → `cancelling`; queued run → `cancelled` directly; terminal run → `409` carrying the actual persisted state (AC-19, AC-26, DAC-E5-S5-2, DAC-E5-S5-3) |

Auth: none; the API is loopback-only by approved design. Request body for start is empty.

Every non-2xx response carries the `{"error": {code, message, resource, request_id}}` envelope,
except a `500`, which carries only `code` and `request_id` (see
[Error envelope and request correlation](#error-envelope-and-request-correlation)).
The `run_already_terminal` `409` also carries `error.state` with the actual persisted run state;
all other errors omit the `state` field so existing envelope consumers are unaffected.
`resource` is `"acquisition-run"` on every S5 error (singular, owner-confirmed in
`component-design-ingestion-api.md` §2.3).

### Keyset cursor contract (owner-confirmed 2026-09-17)

Both list and detail responses use versioned URL-safe opaque composite cursors:
clients treat the value as opaque and pass it back as the `cursor` query parameter.
A malformed or unsupported-version cursor returns `422`. The current cursor version
is `1`; a new version in a future release will be a different opaque string, and
clients holding a v1 cursor will receive `422` on their next page request rather
than silently wrong results.

**Known open gaps, pending design revision** (owner-confirmed, recorded in task plan):

- `component-design-ingestion-api.md` §2.4 does not yet record the depth-first
  precondition precedence (both absent → `history_depth_not_set`).
- `component-design-ingestion-api.md` §11 does not yet publish the complete request
  and response schemas or name the cursor encoding and invalid-version behavior.
- `component-design-ingestion-api.md` §§2.4a and 11 do not yet state that the
  detail `limit` counts instruments and that one page may contain up to `4 * limit`
  data-type rows.

## Deterministic observation-value hashing

`src/factorflow/ingestion/hashing.py` exposes two pure functions consumed by the
observation writer. `canonical_json(value)` recursively accepts JSON-native
`None`, booleans, integers, strings, lists, and string-keyed dictionaries,
plus `Decimal`. It converts each `Decimal` to its exact string form, then emits
UTF-8 JSON with sorted keys and compact separators. Floats, non-string
dictionary keys, and every other unsupported type raise `TypeError`; no
`str()` or `repr()` fallback can silently create a misleading digest.

`value_hash(value)` returns `hashlib.sha256(canonical_json(value)).digest()` as
32 raw bytes. Equivalent dictionaries therefore hash identically regardless
of insertion order, while a changed supplied field changes the digest. The
function hashes every field the caller supplies: the observation writer
(`writer.py`) is responsible for passing only observation values and excluding
`observed_on`, `run_id`, and `recorded_at`.

The canonical form deliberately renders a `Decimal` as a JSON string. A
`Decimal("1.10")` and the literal string `"1.10"` therefore have the same
canonical representation; callers must keep each field's Python type stable.
Changing the canonical form or digest algorithm after observations have been
stored is a data-compatibility change, because unchanged values would otherwise
receive new hashes and be appended again.

## Range planner

`src/factorflow/ingestion/plan.py` computes per-data-type fetch intervals for
one claimed acquisition run. It is a pure module — no database, journal,
roster, provider, or owner-setting access belongs here; CAP-001-E4-S5 is the
caller that supplies the claimed run and per-data-type coverage.

`depth_start_for_run(run, today)` returns `today` minus
`run.history_depth_years` calendar years. The depth is read from the claimed
run's own snapshot, not from the current owner setting, so a depth changed
while a run sits queued does not redefine a run already requested (DAC-E4-8).
When the calendar subtraction lands on February 29 in a non-leap year, the
result is clamped to February 28 — the minimal deterministic interpretation of
"minus N years."

`plan_fetches(data_type, covered, depth_start, today)` returns the
sub-ranges of `[depth_start, today]` not already covered as a list of
`FetchRange(data_type, start, end)` frozen dataclasses. The algorithm:

1. Clips every supplied coverage segment to the requested window.
2. Coalesces overlapping or adjacent clipped segments.
3. Walks the gaps between consecutive coalesced segments; each gap becomes one `FetchRange`.
4. Appends a trailing re-fetch from the last covered date to `today` — the last covered day may have been a partial session, and the observation writer's idempotence means re-fetching a day already held writes nothing (AC-6, DAC-E4-9).
5. Returns an empty list when `depth_start >= today`.

Each call plans one data type independently; `data_type` is a pass-through label on the returned `FetchRange` values. The caller (CAP-001-E4-S5) invokes the function once per data type with the corresponding coverage.

**Known limitations, carried forward as accepted warnings from implementation
review v1** (`CAP-001-E4-S4-implementation-review-v1.md`) — none blocks a
current acceptance criterion:

- The deterministic test `test_data_types_planned_independently` exercises only `prices` and `reference`; `fundamentals` and `corporate_actions` appear only in the Hypothesis property test strategy. Since `data_type` is a pass-through label the behavioral correctness is not in question, but the explicit named-assertion traceability for those two types relies on the property test (IR-001, medium).
- The coalescing loop uses `list(seg)` and a `type: ignore` comment to work around a mypy limitation on the in-place tuple update pattern; the logic is correct and all checks pass, but the suppression hides potential future type errors in that section (IR-002, medium).
- Coverage segments with `start == end` (single-day, inclusive) are treated as zero-width and silently dropped by the `s < e` clip guard, causing a harmless re-fetch of that day. This aligns with the re-fetch-is-cheap philosophy but deviates from the component design's statement that inclusive single-day ranges are valid (IR-003, low).

## Massive provider response models

`src/factorflow/ingestion/massive/models.py` defines four Pydantic v2 models,
one per Massive response shape, each named for the observation table it will
feed: `TickerReference` (`instrument_reference`), `DailyBar` (`daily_bar`),
`FinancialStatement` (`fundamental_observation`), and `CorporateAction`
(`corporate_action`). `MassiveClient` uses these models for its four
historical reads, so Massive wire field names do not leak past the package
boundary.

- Every wire field name (`t`, `o`, `h`, `l`, `c`, `filing_date`, `active`,
  `name`, and the rest) appears only inside a `Field(alias=...)`; every
  public attribute is the product's own vocabulary.
- Every monetary or ratio value is `Decimal`, never `float`, so no binary
  rounding enters a value bound for append-only history. `DailyBar.session_date`
  converts from Massive's Unix-millisecond `t` through a timezone-aware UTC
  conversion, not the host's local timezone.
- `FinancialStatement.provider_filing_date` (aliased from `filing_date`) is
  documented as descriptive only — the provider's most recent filing date,
  which conflates restatements of the same period. It must never be read as
  the observation date; `observed_on` belongs solely to the observation
  writer (CAP-001-E4), which no model here declares.
- A field genuinely absent on the wire (e.g. `TickerReference.delisted_utc`,
  `DailyBar.is_otc`, `FinancialStatement.fiscal_quarter`) parses to `None`,
  never to a substituted zero or `False`.
- A response missing a field the model requires raises Pydantic
  `ValidationError`; CAP-001-E3-S3 maps that to `ProviderContractViolation`
  rather than passing a partial record on.
- Each model's `value_payload()` returns a JSON-round-trippable dict — every
  `Decimal` serializes as a string — for the observation writer's JSONB
  payload column and its append-only value hash. No model declares
  `observed_on`, `run_id`, or `recorded_at`; those remain writer- and
  run-lifecycle-owned.

The limitations `implementation-review-v1` carried forward as accepted
warnings (`FinancialStatement.statement_type`/`timeframe` unconstrained,
top-level-only `Decimal` coercion of extra fields, and no plausibility
check on `DailyBar`'s Unix-milliseconds timestamp) were fixed in the
`CAP-001-E3-S2-implementation-review-v2` rework: `statement_type` and
`timeframe` are now `Literal`-constrained to the persistence contract's
known values, the extra-field `Decimal` coercion recurses into nested
dicts and lists, and `DailyBar`'s timestamp validator rejects non-numeric
input and anything outside a plausible Unix-milliseconds magnitude. The
follow-up also pins the accepted statement/action domains, the September
2003 lower history bound, the timezone test's non-UTC precondition, and the
deliberately duplicated ticker-change payload keys with regression tests.

**Known limitations, carried forward as accepted warnings from implementation
review v5** (`CAP-001-E3-S2-implementation-review-v5.md`) — none changes the
current model behavior or blocks an acceptance criterion:

- The supplementary package-boundary test rejects a bare raw dictionary and
  Massive SDK exports, but treats arbitrary builtin-typed exports as
  package-owned. A collection containing raw wire dictionaries can therefore
  pass that test even though the current 15-name `__all__` exports no such
  value (IR-001, medium).
- The `_MIN_PLAUSIBLE_MILLIS` rationale points to section 3 of
  `component-design-ingestion-api.md`; the September 2003 floor is actually in
  section 2.4a's `MAX_HISTORY_DEPTH_YEARS` row. The bound and its regression
  test are correct; only that source-code comment's section citation is stale
  (IR-002, low).
- The attended decision that CAP-001-E4's writer derives
  `fundamental_observation.fiscal_period` was propagated into E4-S3's task plan
  during this story's coding run. E4-S3 has since implemented and passed its
  own gate on that plan, so v4's process warning is superseded; what remains is
  that the plan's AI provenance attributes the revision to an
  implementation-planning run not represented by the commit history (IR-003,
  low). `FinancialStatement` intentionally has no `fiscal_period` field.
- The optional-versus-zero behavior is covered for `fiscal_quarter` and
  `is_otc`, but those tests do not name their mapped `TC-COMP-219` identifier,
  leaving an automated traceability gap rather than a behavioral coverage gap
  (IR-004, low).
- The extra-field `Decimal` coercion leaves `bool` values as `bool` at every
  level, which matters because `bool` is an `int` subclass. No test pins that
  exemption: without it the suite stays green, but a boolean extra field would
  raise a raw `decimal.InvalidOperation` rather than a `ValidationError`. No
  documented field of the `extra="allow"` endpoint shapes is boolean today
  (IR-005, low).

## Massive historical client

`src/factorflow/ingestion/massive/client.py` provides the project-owned
historical boundary over Massive's official REST SDK. `MassiveClient` exposes
four product-named reads: `fetch_reference(symbol)`,
`fetch_daily_bars(symbol, start, end)`, `fetch_financials(symbol, start, end)`,
and `fetch_corporate_actions(symbol, start, end)`. Each returns the parsed
models above rather than provider wire shapes.

The client creates one reusable SDK client from `MassiveSettings`, explicitly
disabling SDK retries, pagination, and request tracing. It passes the runtime
credential to the SDK for header authentication; it does not put the credential
in request URLs. It also passes the validated `FACTORFLOW_MASSIVE_BASE_URL` as
the SDK's `base`, so every request of the four reads, followed `next_url` pages
and the `vx` sub-client's IPO reads included, goes to that host
(CAP-001-E3-S6). Every initial and followed page request passes through
`RateLimitGovernor`, while `paging.follow_pages()` follows a present
`next_url` one page at a time and raises if a later page fails rather than
returning a partial range.

Reference reads use Massive's single-ticker endpoint. Daily-bar requests use
multiplier `1`, timespan `day`, inclusive ISO date bounds, and unadjusted bars.
Financial statements are read from the three statement endpoints (balance
sheets, income statements and cash-flow statements), each bounded by
`period_end`. Massive's ratios endpoint is not called: CAP-001's fundamentals
are the three statements, and ratios can be derived later from stored
statements and bars (component design v13 section 2.5). Corporate actions
combine splits, dividends, IPOs, and ticker-change events. Ticker events have
no provider date-range parameter, so the client validates their rows and
applies the requested inclusive range locally. The client never calls
Massive's forward-looking market-status endpoint or ticker-list endpoint.

An empty successful response is not an unknown instrument. `fetch_daily_bars`,
`fetch_financials` and `fetch_corporate_actions` return an empty list when a
recognised instrument has nothing in range, such as no corporate action, no
filings or a range outside its trading life. Only `fetch_reference` raises
`InstrumentNotFound` for an empty result, and any provider 404 still raises it
on every read (decision record DEC-0047 in the ai-agents SDD harness).

**Known limitation, carried forward as an accepted warning from
implementation review v6** (`CAP-001-E3-S1-implementation-review-v6.md`,
IR-001, low). The empty-result tests serve `results: []` only. An envelope
with no `results` key is also handled as empty today (`paging.follow_pages`
reads `envelope.get("results") or []`), but no test pins that form, so a
refactor that indexed `envelope["results"]` directly would still pass.

The credential never leaves for another host. With SDK retries at `0`, a
redirect is refused rather than followed: the governor retries the request to
the same host up to `max_attempts`, then raises `ProviderUnavailable`. Neither
SDK connection pool uses a proxy, whatever the `HTTP_PROXY`, `HTTPS_PROXY` or
`ALL_PROXY` environment says, and no construction path relaxes TLS
verification (`cert_reqs="CERT_REQUIRED"` on both pools). The release build
carries none of the test tree: the `Dockerfile` copies nothing under `tests/`,
the wheel contains nothing under it, and nothing in `src/factorflow` imports
from it. `tests/unit/test_massive_redirects.py`, `test_massive_tls.py` and
`test_release_excludes_test_paths.py` prove each of these without opening a
socket.

**Known limitations, carried forward as accepted warnings from
implementation review v1**
(`CAP-001-E3-S6-implementation-review-v1.md`). All four are about how strong
the tests are. None leaves an acceptance criterion unmet:

- `test_trailing_slash_base_never_produces_a_double_slash` uses the default
  host, so it would still pass if `base=` were removed. Other tests catch that
  removal (IR-001).
- `test_no_construction_path_passes_a_tls_override` does not install the
  `forbid_sockets` guard. It patches `RESTClient` for the whole test, so no
  pool exists today (IR-002).
- The source scan for `http` acceptance flags string constants, comparisons
  and collection literals. It would miss a `startswith("http")` or a `match`
  case (IR-003).

  It has exactly one exemption (CAP-001-E1-S7, DAC-E1-S7-6). The constants
  `http://127.0.0.1:`, `http://localhost:` and `http://[::1]:` are accepted
  only in `src/factorflow/api/app.py`, where they build the
  [Origin allow-list](#host-and-origin-checks). That module is matched by its
  path under `src/factorflow`, not by its file name. Any other `http://`
  constant there, those three anywhere else, and every comparison with or
  listing of `"http"` still fail the scan.
- The `Dockerfile` check reads `COPY`/`ADD` line by line. It would miss a
  continued line or the JSON array form (IR-004).

## Massive provider failure reasons

`src/factorflow/ingestion/massive/errors.py` also defines
`compose_failure_reason`, which turns one of the four typed `MassiveError`
subclasses into the safe, owner-visible text stored as
`run_instrument_result.reason`. The acquisition runner calls it in the
per-data-type fetch error handlers, passing the entrypoint's `redact`
callable, before forwarding the composed reason to `classify_provider_error`
(CAP-001-E4-S6). The composer takes the typed `error`, the `symbol`, the
`data_type`, and a caller-supplied `redact` callable — it never reads
runtime configuration or a credential itself.

The stable fields — error kind, `symbol`, `data_type`, and the provider's
`request_id` (`request_id=unavailable` when the provider did not return one,
rather than fabricating or silently omitting it) — are composed first and are
never truncated or redacted, since they never carry provider-supplied free
text. Only the variable segment — the error's own diagnostic message — is
passed through `redact` before being bounded to
`MAX_FAILURE_REASON_VARIABLE_TEXT` (500 characters), so a credential anywhere
in the raw text, including near the truncation boundary, is removed before
the cut is made rather than after; a truncated segment ends with the
`…[truncated]` marker.

`CredentialRejected` is the one exception: its variable segment is always a
fixed description ("the provider rejected the configured credential"),
never the error's own message even redacted, because the reason must not
depend on redaction catching every way a credential could appear in
provider-echoed text. `compose_failure_reason` raises `TypeError` for any
error not in the four-type taxonomy.

## Rate limit governor

`src/factorflow/ingestion/rate_limit.py` implements `RateLimitGovernor`, the
synchronous, provider-agnostic governor that `CAP-001-E3-S1`'s
`massive/client.py` submits every SDK request through, including followed
pages. It imports no Massive SDK, response type,
or wire shape — `send` and `classify` are opaque callables the caller
supplies, and the governor inspects only the `Outcome` `classify` returns,
never the raised exception's type or fields.

`execute(send, classify, stated_delay_seconds=None)` calls `send()` under a
token bucket sized to `GovernorSettings.requests_per_minute`. The bucket starts
full, never refills above that capacity, refills continuously, and consumes one
permit per send. A one-minute window overlapping the initial full bucket may
issue up to capacity plus one window's refill; after drawdown, each subsequent
one-minute window is capped at the configured budget. The classified outcome
then follows a distinct, bounded path:

| Outcome | Attempt counter | Wait | Then |
|---|---|---|---|
| `THROTTLED`, provider stated a delay | unchanged | the stated delay, no jitter | retry |
| `THROTTLED`, no stated delay (the Massive case) | unchanged | to the next minute boundary, plus jitter | retry |
| `RETRYABLE` (timeout or 5xx) | plus one | `initial_backoff_seconds × 2^(attempts−1)`, full jitter | retry while attempts remain |
| `OK` | unchanged | none | return |
| `FATAL` (404, 401, not retryable) | unchanged | none | re-raise |

Two limits terminate the loop, both configured through
`GovernorSettings.from_massive_settings()` (built from `MassiveSettings`
without either settings class importing the other, `MassiveSettings`
imported only under `TYPE_CHECKING`). `max_attempts` (default 3) bounds the
`RETRYABLE` path. Once the first `THROTTLED` outcome occurs,
`max_throttle_wait_seconds` bounds monotonic elapsed time until a later
throttle check, including permit-acquisition waits, sender time, retry
backoff, and throttle sleeps. This elapsed-time accounting means a
provider-stated zero-second delay cannot retry forever. A `429` still never
consumes an attempt; persistent throttling raises `ProviderUnavailable` once
the elapsed throttle budget is exceeded. Because the check follows the wait
that crosses the limit, the budget is soft and may be exceeded by that final
wait.

The no-delay throttle wait is anchored to a wall-clock `now` collaborator
(default `time.time`), not to `monotonic()` or any instant fixed at
governor construction, so the wait tracks the provider's actual per-minute
window regardless of how long the governor instance has been alive. Its
jitter is applied additively on top of the boundary wait
(`boundary + jitter() × boundary`, range `[boundary, 2 × boundary]`) rather
than the literal "full jitter over the computed delay" that
`component-design-rate-limit-governor.md` §2.5 states for every jittered
delay — a deliberate, recorded deviation: true full jitter here
(`[0, boundary)`) would often fire before the provider's per-minute quota
refills, defeating the reason the boundary wait exists. The backoff path
(retryable failures) does use full jitter as written. See
`_boundary_wait_with_jitter`'s docstring and the task plan's Notes.

**Known limitations, carried forward as accepted warnings from
implementation review v5**
(`CAP-001-E3-S4-implementation-review-v5.md`) — none blocks a current
acceptance criterion:

- The `except BaseException` classification boundary (`execute`, per the
  design-mandated `Callable[[BaseException], Outcome]` signature) hands
  `KeyboardInterrupt` and `SystemExit` to the caller's `classify` along with
  every other exception. No test covers either type, and a classifier that
  defaults an unrecognised exception to `RETRYABLE` or `THROTTLED` would
  make the governor sleep through a cancellation signal — for the no-delay
  throttle path, now a genuine up-to-120-second wall-clock wait (v5 IR-003).
- `GovernorSettings` is a plain frozen dataclass with no construction-time
  validation, so a direct literal construction with `requests_per_minute=0`
  succeeds and only fails later, obscurely, with `ZeroDivisionError` inside
  permit acquisition. Every production caller goes through
  `from_massive_settings()`, where `MassiveSettings`'s `Field(ge=1)` already
  enforces positivity, so this affects only direct construction, which
  today only the tests do (v5 IR-007).
- The backoff cap on the first retry is `initial_backoff_seconds × 2**0`,
  i.e. `initial_backoff_seconds` itself — one doubling below component
  design section 2.5 row 3's literal wording ("initial delay times two to
  the power of attempts"). The implementation is the conventional reading
  and the bound holds; the wording gap is flagged for the next design
  revision (v5 IR-005).
- `ProviderUnavailable` is raised with only a message string on exhaustion;
  the attempt count is interpolated into prose rather than carried as a
  structured field, and the module emits no log records naming the attempt
  index, delay, or status code (component design section 4's expectation).
  Whether governor logging and a structured exhaustion failure belong to
  CAP-001-E5 or a later story is an open owner decision (v2 IR-009).
- The test double clock used for the throttle-boundary tests never
  advances the injected wall-clock `now` source during a sleep, so no test
  exercises a multi-wait throttle sequence in which each wait lands on a
  genuinely fresh wall-clock phase, the shape production actually takes
  (v5 IR-006).

## Coverage range arithmetic

`src/factorflow/ingestion/coverage.py` implements `merge_ranges(existing, written)`,
the pure date-range arithmetic that the observation writer uses to maintain the
minimal non-overlapping `coverage_segment` set for one instrument and data type.

`merge_ranges` accepts a list of existing `(covered_from, covered_to)` date
pairs (may be empty or unsorted) and the newly written range. It sorts all
segments by start date, then makes a single left-to-right sweep: two segments
are coalesced when one starts no later than one calendar day after the other
ends, so both overlap and one-day adjacency in either direction produce a merge.
Disjoint segments — those separated by more than one day — are preserved
unchanged. The result is the minimal ordered list of non-overlapping segments
after the written range is absorbed.

The function has no database dependency and carries no side effects, so it can
be tested against a plain list of tuples (see `tests/unit/test_coverage_merge.py`)
independently of the writer's transaction path.

## Coverage read

`src/factorflow/coverage/service.py` reports what the store actually holds,
per instrument (CAP-001-E6-S1). Nothing is stored as a summary: every read
derives coverage from `coverage_segment`, the observation tables,
`acquisition_state`, `owner_setting` and `instrument`, so no range can read
as complete that was not written. The module issues no `INSERT`, `UPDATE`
or `DELETE`, and binds every value as a parameter.

`read_coverage(conn, *, symbol=None, lifecycle=None, from_date=None,
to_date=None, cursor=None, limit=50)` returns a `CoverageView`:

- `never_acquired` comes from its own query (`never_acquired.sql`) over the
  four observation tables, so a filter that matches nothing on a populated
  store is not reported as never acquired. When it is `True`, `instruments`
  is empty and `gap_detection` is unavailable with reason
  `fewer_than_two_instruments_with_data`.
- `instruments` holds one `InstrumentCoverage` per instrument in symbol
  order, retired instruments included. `presence` maps each of `reference`,
  `prices`, `fundamentals` and `corporate_actions` to `present` (a segment
  exists), `absent` (acquisition recorded an outcome but no segment exists)
  or `unknown` (never attempted). `covered_from` / `covered_to` are the
  instrument's `prices` range, `None` without a prices segment.
  `last_acquired_at` is the latest `acquisition_state` timestamp across the
  data types — never a run's intent. `depth_shortfall_years` is
  `ceil((stated × 365 − covered days) / 365)` against the owner's stated
  history depth, and `None` — never zero — when the depth is met or unset.
- `from_date` / `to_date` narrow `covered_from` / `covered_to` to the
  segments overlapping them; an omitted bound applies no predicate.
  `presence` and `depth_shortfall_years` ignore the bounds and describe
  everything acquired (decision DEC-0003, not yet owner-reviewed).
- `symbol` is a prefix filter and `cursor` the previous page's last symbol;
  both are normalised as `list_instruments` normalises them. `next_cursor`
  is set only when more instruments follow: one row beyond `limit` is
  fetched as a lookahead, so an exactly full final page carries no cursor.

`ValueError` is raised when `from_date > to_date`, `lifecycle` is not
`active` or `retired`, or `limit` is outside 1..500. A database error
propagates rather than being rendered as empty coverage.

The gap fields — `CoverageView.gap_detection` and each
`InstrumentCoverage.gaps` — are filled by gap detection; see
[Gap detection](#gap-detection).

**Known limitations, carried forward as accepted warnings from implementation
review v2** (`CAP-001-E6-S1-implementation-review-v2.md`) — none blocks a
current acceptance criterion:

- On a bounded read one row mixes a window-scoped range with
  acquisition-scoped `presence` and `depth_shortfall_years`: a narrow window
  can show a short range with no shortfall, and a type `present` with no
  data inside the range. The component design does not yet state which
  should yield; DEC-0003 awaits owner review before the coverage route and
  screen consume it (IR-001, medium).
- DEC-0003 is cited from `coverage.sql`, `service.py` and
  `tests/integration/test_coverage_reads.py`, but is recorded only in the
  harness repository, not in this one (IR-002, low).
- `_` and `%` in the `symbol` prefix are not escaped, so they act as `LIKE`
  wildcards (`A_L` matches `AAL`). No injection is possible; the same holds
  for `list_instruments`, and a shared escaping helper is deferred to its
  own change (IR-003, low).

## Gap detection

`src/factorflow/coverage/gaps.py` finds missing trading days in daily prices
(CAP-001-E6-S2). The provider supplies no historical trading calendar, so a
trading day is any date on which *any* instrument has a `daily_bar` in the
range. A gap is a trading day inside an instrument's own `prices` covered
range for which that instrument has no bar. Only `prices` are checked:
fundamentals and corporate actions carry no per-day expectation.

`detect_gaps(conn, *, from_date=None, to_date=None)` returns a `GapResult`
with `available`, the resolved `from_date` / `to_date`, and `missing`, a map
from `instrument_id` to its missing dates in ascending order, holding only
instruments with at least one gap. It runs two statements:

- `sql/gap_range.sql` resolves an omitted bound to the widest `prices`
  coverage across all instruments — everything acquired, not a trailing
  window — and reports whether at least two instruments hold bars in the
  range. When fewer do, detection is unavailable and `sql/gaps.sql` is not
  run.
- `sql/gaps.sql` is the component design's statement (section 2.3), copied
  verbatim; `tests/unit/test_coverage_gaps_sql_matches_design.py` fails if
  the two drift apart. It evaluates the same availability predicate inside
  the statement, so it returns no rows when detection is unavailable.

`read_coverage` runs detection once per request over the caller's bounds:

- `gap_detection` is unavailable with reason
  `fewer_than_two_instruments_with_data` and `missing_days=None` — never
  zero — when detection is unavailable. Otherwise its `missing_days` is the
  total across every instrument in the resolved range, not only the
  returned page.
- Each instrument's `gaps` inherits the view's unavailability. When
  available, an instrument without `prices` coverage has no gaps computed
  (`missing_days=None`), and every other instrument carries its own count.
  `InstrumentCoverage` exposes the count only, never the dates.

`read_gap_dates(conn, symbol, *, from_date=None, to_date=None)` returns the
dates behind one instrument's count, keyed by the normalised symbol. It
returns `None` when gaps are not computed — detection unavailable, or no
`prices` coverage — and `[]` only when they are computed and none are
missing. An unknown symbol raises `InstrumentNotFound`. An inverted range
raises `ValueError`, from `read_coverage` always and from `read_gap_dates`
once the instrument is found to hold `prices` coverage.

`UNAVAILABLE_REASON` is defined in `gaps.py` and re-exported from
`service.py` under the same name. Database errors propagate.

Two limits are stated rather than hidden: detection needs at least two
instruments with bars in the range, and a market-wide outage is
undetectable — a day every instrument lacks never enters the trading-day
set, so it is nobody's gap.

**Accepted warnings from implementation review v1**
(`CAP-001-E6-S2-implementation-review-v1.md`) — none blocks a current
acceptance criterion:

- The view-level `gap_detection.missing_days` total on an available read is
  implemented but asserted by no test (IR-001, medium).
- The task plan's per-criterion `-k "008 or …"` validation selectors select
  no tests, because TC traceability is carried in `# Implements TC-COMP-…`
  comments rather than test names; run the whole
  `tests/integration/test_coverage_gaps.py` instead (IR-002, medium).
- `read_gap_dates`'s `from_date` / `to_date` are exercised by no test
  (IR-005, low). Three further low findings concern test-assertion strength
  only (IR-003, IR-004, IR-006).

## Coverage API

`src/factorflow/api/routes/coverage.py` serves `GET /api/coverage`
(CAP-001-E6-S3), a thin HTTP surface over the coverage read: it validates
the query, calls `read_coverage` — and `read_gap_dates` for an expansion —
and shapes the response. It does no coverage arithmetic and runs no SQL of
its own. The response models are the `Coverage*` classes in
`src/factorflow/api/models.py`.

| Parameter | Behavior |
|---|---|
| `symbol` | Prefix filter, passed to `read_coverage` unchanged |
| `lifecycle` | `active` or `retired`; any other value is `422`. Omitted, retired instruments are included |
| `from`, `to` | ISO dates narrowing covered ranges and gap counts. Omitted, they mean everything acquired. `from` later than `to` is `422` before the service is called; equal bounds are accepted |
| `limit` | Default 50 (`DEFAULT_PAGE_SIZE`), max 500 (`MAX_PAGE_SIZE`); `0` or above the bound is `422`, never clamped |
| `cursor` | The previous page's `next_cursor`, passed back verbatim |
| `expand` | One symbol, normalised. Adds a top-level `expanded` object with that instrument's gap dates for the same bounds. A malformed symbol is `422 validation_error`, an unknown one `404 instrument_not_found` |

A `200` body without `expand` carries exactly four keys:

```json
{
  "instruments": [
    {
      "symbol": "AAPL",
      "lifecycle": "active",
      "data_types": {"reference": "present", "prices": "present",
                     "fundamentals": "absent", "corporate_actions": "unknown"},
      "covered_from": "2024-01-02",
      "covered_to": "2024-01-05",
      "last_acquired_at": "2024-01-05T22:14:03Z",
      "gap_count": 0,
      "depth_short_by_years": null
    }
  ],
  "never_acquired": false,
  "gap_detection": {"available": true, "reason": null},
  "next_cursor": null
}
```

- `data_types` is `read_coverage`'s `presence`; `gap_count` is the
  instrument's gap count and `depth_short_by_years` its
  `depth_shortfall_years`. Both are `null` — the key is always present,
  never `0` — when not computed or, for depth, when the stated depth is met
  or unset.
- `gap_detection` carries `available` and `reason` only; the service's
  whole-view `missing_days` total is not exposed. When detection is
  unavailable, `reason` is `fewer_than_two_instruments_with_data` and every
  `gap_count` is `null`.
- `never_acquired` is copied from the service, so an empty store (`true`)
  and a filter matching nothing on a populated store (`false`) both return
  an empty `instruments` list but remain distinguishable.
- No row carries gap dates. With `expand=<symbol>` the body adds
  `"expanded": {"symbol": ..., "gap_dates": [...]}`, where `gap_dates` is
  `null` when gaps are not computed and `[]` when computed with none missing.

Error responses carry the shared `{"error": {...}}` envelope with
`resource: "coverage"`. A database error propagates to the application's
`500 internal_error` handler rather than rendering as empty coverage. Auth:
none; loopback only, as for every route.

The `expand` / `expanded` contract and `gap_count: null` for absent counts
are owner-confirmed PROVISIONAL choices (2026-09-29, recorded as Open Gaps
1–2 in `CAP-001-E6-S3-tasks.md` and in the handler's docstring), pending
their absorption into `component-design-ingestion-api.md` section 11.

**Accepted warnings from implementation review v1**
(`CAP-001-E6-S3-implementation-review-v1.md`) — none blocks a current
acceptance criterion:

- The story's example body shows `"depth_short_by_years": 0`; the route
  returns `null` when the depth is met, as the coverage-service design
  requires. The story example is to be corrected at its next revision
  (IR-001, low).
- The task plan cites `tests/unit/test_api_isolation.py` as guarding the
  route's "no provider import" constraint, but that test checks only route
  dependencies. The constraint holds today; no test would catch a
  regression (IR-002, low).
- A request with `expand` runs whole-store gap detection twice — once inside
  `read_coverage` and again inside `read_gap_dates` — so an expansion costs
  roughly two gap queries, not one (IR-003, low).

## Observation writer

`src/factorflow/ingestion/writer.py` delivers the atomic per-instrument write
boundary (DAC-E4-4, DAC-E4-5) as three exports:

**`ParsedObservations`** — A frozen dataclass that groups the four provider-model
collections (`reference`, `prices`, `fundamentals`, `corporate_actions`) with each
data type's actual returned coverage range (`reference_range`, `prices_range`,
`fundamentals_range`, `corporate_actions_range`). This is a writer-local boundary:
it must not depend on the runner module (owner decision 2026-09-18). `ObservationBatch`
is an alias for the same type.

**`WriteResult`** — A frozen dataclass reporting the outcome of a single
`write_instrument` call: per-type `appended` and `unchanged` row counts, and the
covered range for each data type after the merge committed (DAC-E4-S3-1).

**`RunNotActive`** — A `RuntimeError` raised by `write_instrument` when the
`acquisition_run` row identified by `run_id` is not in `running` or
`cancelling` state at the start of a write. The reclaim sweep transitions a
stale run's row to `abandoned` (terminal); any subsequent write attempt by
the original runner is rejected by this exception before any observation,
coverage, acquisition-state, or `run_instrument_result` row is written
(DAC-E5-13, DAC-E5-S4-6). Carries `run_id` and `actual_state` attributes.

**`write_instrument(connection, instrument_id, run_id, observations, observed_on)`** —
Commits all four data types for one instrument inside the caller's transaction.
The caller owns the transaction boundary; the function operates on the supplied
connection and propagates any error so the caller's transaction rolls back.

Write sequence:

1. **Lock and verify the run** — `SELECT ... FOR UPDATE` on the
   `acquisition_run` row for `run_id`. Raises `RunNotActive` when the row is
   absent or not in `running`/`cancelling`, serialising this write with any
   concurrent reclaim. No observations are written before this check passes.
2. **Append observations** — four per-type helpers (`_insert_references`,
   `_insert_daily_bars`, `_insert_fundamentals`, `_insert_corporate_actions`) each
   use `INSERT ... ON CONFLICT DO NOTHING` against the observation tables' natural
   keys (DAC-E4-S3-7). `_insert_fundamentals` derives the `NOT NULL`
   `fiscal_period` column value as `'FY'` from `timeframe="annual"` and as
   `'Q{fiscal_quarter}'` from `timeframe="quarterly"`, using the existing
   `FinancialStatement.timeframe` and `fiscal_quarter` fields — no
   `fiscal_period` model field is required or declared on the model (owner
   decision 2026-09-20). Each helper returns `(appended, unchanged)` counts.
3. **Replace coverage** — `_replace_coverage` reads the existing
   `coverage_segment` rows for one instrument and data type, calls `merge_ranges`,
   deletes the existing rows, and reinserts the merged set. Coverage replacement
   is explicitly allowed — only the four observation tables are append-only;
   `coverage_segment` supports delete and reinsert.
4. **Upsert acquisition state** — one `INSERT ... ON CONFLICT DO UPDATE` per
   data type stamps `last_acquired_at = now()`, `last_run_id`, and
   `last_outcome = 'written'` in `acquisition_state` (DAC-E4-S3-5).
5. **Insert run results** — one `INSERT` per data type into `run_instrument_result`
   with `outcome = 'written'` when any rows were appended, or `'unchanged'` when
   every returned row already existed (DAC-E4-S3-6).

**Transaction boundary deviation (IR-002, accepted):** the function delegates
the transaction boundary to the caller rather than calling
`connection.transaction()` internally. DAC-E4-4 is still satisfied because all
steps execute on the same connection inside the caller's transaction. The
deviation is documented in the task plan (T011) with rationale: delegating the
boundary makes `write_instrument` composable within larger caller-managed
transaction scopes without nested-transaction overhead.

**`write_instrument_with_outcomes(connection, instrument_id, run_id, observations, observed_on, error_outcomes=None)`** —
Extends `write_instrument` to accept pre-classified error outcomes for data
types that failed at the provider layer (`not_found` or `failed`). The
`error_outcomes` dict maps data-type name (`"reference"`, `"prices"`,
`"fundamentals"`, `"corporate_actions"`) to `InstrumentOutcomeRecord`
instances from `outcomes.classify_provider_error`. For data types present in
`error_outcomes`: no observation rows are inserted, no coverage segment is
written, `acquisition_state` is upserted with the error outcome, and
`run_instrument_result` is inserted with the error outcome and reason. For
data types absent from `error_outcomes`, the normal `write_instrument` logic
applies (`written`/`unchanged`). This is the function the acquisition runner
now calls for every instrument (DAC-E4-S6-3, DAC-E4-S6-4, DAC-E4-S6-6,
DAC-E4-S6-7).

**Known limitations carried forward from implementation review v2
(`CAP-001-E4-S3-implementation-review-v2.md`)** — neither blocks an acceptance
criterion:

- TDD evidence mutation probe 3 is a narrative explanation rather than an
  actual code mutation. The transactional coverage invariant is adequately proven
  by the four rollback probes; the missing mutation probe does not leave an
  untested code path (IR-001, medium).
- The observation-insert failure probe (`test_failure_during_observation_insert_rolls_back_everything`)
  does not assert against `daily_bar` and `corporate_action` after rollback, even
  though `_insert_daily_bars` completed before the injected trigger fired.
  PostgreSQL's all-or-nothing rollback guarantees those rows are gone; the
  `instrument_reference` assertion already proves the mechanism (IR-002, low).

## Per-instrument outcome classification

`src/factorflow/ingestion/outcomes.py` owns the classification boundary between
a provider result and a persisted outcome string. It contains no SQL, no retry
logic, no credential access, and no reason-composition logic.

**`InstrumentOutcomeRecord`** — A frozen dataclass carrying `data_type`,
`outcome` (one of `"written"`, `"unchanged"`, `"not_found"`, `"failed"`), and
an optional `reason` string. The reason is the pre-composed, credential-safe
failure reason from the Massive-client boundary (`compose_failure_reason`); it
is `None` on success paths.

**`classify_write_result(result: WriteResult) -> dict[str, str]`** — Maps a
`WriteResult` to a dict with exactly four keys (the four schema data-type
names). Each data type maps to `"written"` when any rows were appended, or
`"unchanged"` when every returned row already existed (or none came back). This
is a pure function: no database access, no side effects.

**`classify_provider_error(error, *, data_type, reason) -> InstrumentOutcomeRecord`** —
Maps a typed `MassiveError` to a single `InstrumentOutcomeRecord` for the
failing data type. `InstrumentNotFound` → `"not_found"`;
`ProviderUnavailable`/`ProviderContractViolation` → `"failed"`.
`CredentialRejected` raises `ValueError` — it is a run-level failure that must
not become a per-data-type outcome row. Any unrecognised type raises `TypeError`.
The `reason` argument is the already-composed, credential-safe reason string
from the Massive-client boundary; this module does not re-compose or re-redact it.

**`write_error_results(connection, run_id, instrument_id, outcome, reason)`** —
Preserved from E4-S5 for the all-at-once fetch phase. Inserts
`run_instrument_result` rows for all four data types when the provider failed
before any per-data-type result was classified. This path is used by callers
that have not yet migrated to the per-data-type fetch seam. Once the runner
fetches data types individually, `classify_provider_error` +
`write_instrument_with_outcomes` replace this path for individual failures.

**Classification table:**

| Provider result | `classify_write_result` / `classify_provider_error` output | Run effect |
|---|---|---|
| Data returned, rows appended | `written` | counts toward `succeeded` |
| Data returned, every value already held | `unchanged` | counts toward `succeeded` |
| Instrument unknown to the provider (`InstrumentNotFound`) | `not_found` | run continues, outcome becomes `partial` |
| Transport or server error, attempts exhausted (`ProviderUnavailable`, `ProviderContractViolation`) | `failed` | run continues, outcome becomes `partial` |
| Rate-limit pacing (`429`) | no outcome — absorbed by the governor before classification | no row written |
| Not reached because the run was cancelled | no row written | no coverage, no failure |

## Run request and claim

`src/factorflow/runs/journal.py` is the run journal's boundary over the
`acquisition_run` table (migration `0004_runs.sql`): request, claim,
heartbeat, cancellation request, cancellation observation, and finalisation.

`request_run(connection, history_depth_years)` always inserts a `requested`
row — a request is never rejected because a run is active; queueing rather
than rejection is the rule (AC-23). The supplied depth is snapshotted onto
the row at request time. The insert and the active-run lookup share one
transaction, so the returned `(run_id, queued_behind)` pair reports the
`running` or `cancelling` run this request actually follows — `None` when
none is active — and the active row itself is never modified.

`claim_next(connection, runner_id)` is one `UPDATE` statement in one
transaction, with no read-then-write window: a subquery picks the oldest
`requested` row (`ORDER BY requested_at LIMIT 1`) under a `NOT EXISTS`
guard that excludes any `running` or `cancelling` run, and `FOR UPDATE
SKIP LOCKED` lets a contending runner skip a locked candidate rather than
block on it. A successful claim sets `state`, `started_at`, `claimed_by`,
and `heartbeat_at` in that same statement and returns a frozen
`ClaimedRun(run_id, history_depth_years)` carrying the snapshotted depth —
never a re-read of the current setting. `None` means nothing is claimable, and the
loop that consumes it waits `FACTORFLOW_RUN_POLL_INTERVAL_SECONDS` before
polling again — see [Acquisition runner](#acquisition-runner).

The `NOT EXISTS` guard is not the only defence against two active runs:
`idx_acquisition_run_single_active`, a partial unique index over the
`running`/`cancelling` states, turns a race that slips past the guard into
a unique violation instead of a second active run.

`heartbeat(connection, run_id, runner_id)` refreshes the claim and returns
`False` when the row is no longer this runner's to write — the runner's
signal that the claim was lost (e.g. cleared by the reclaim sweep), not an
error to retry. A `False` return means the runner must stop and write nothing
further against this run.

`request_cancel(connection, run_id)` records a cancellation request against
a run. Two paths, both transactional and guarded by `validate_transition`:

- `running` → `cancelling`: records cooperative intent without ending the run.
  `cancel_requested_at` is set; `ended_at` is not. The runner observes this
  between instruments by calling `cancellation_requested`, then calls `finalise`
  to complete the transition.
- `requested` → `cancelled`: direct state transition; the run is cancelled
  immediately, `cancel_requested_at` and `ended_at` are both set, and the run
  is never started or made claimable.

When the run has already reached a terminal state (`succeeded`, `partial`,
`failed`, `cancelled`, or `abandoned`), `request_cancel` raises
`RunAlreadyTerminal`, carrying the persisted state in its `actual_state`
attribute so the caller can report the actual outcome rather than a generic
error. The row is not modified (AC-26, DAC-E5-6, DAC-E5-8, DAC-E5-9).

`cancellation_requested(connection, run_id)` reports whether the run has
moved to `cancelling`. The runner calls this between instruments alongside
`heartbeat`.

`record_instruments_named(connection, run_id, runner_id, count)` stores the
size of the claimed run's roster snapshot in `acquisition_run.instruments_named`.
Like `heartbeat`, it updates only a run this runner still holds in `running`
or `cancelling`, so a runner that has lost its claim writes nothing.

`fail_run(connection, run_id, reason)` records a run-level failure that is not
derived from written results: the runner calls it when the provider rejects
the credential. It ends the run `failed` with `failure_reason` set, unless
cancellation was already requested, in which case the run ends `cancelled`
as `finalise` rule 1 would record it.

`finalise(connection, run_id)` never accepts a caller-supplied outcome. It
derives the terminal state from `run_instrument_result` using the rule:

1. State is `cancelling` → `cancelled` (DAC-E5-7).
2. Zero successful (`written`/`unchanged`) rows → `failed` (DAC-E5-S3-7).
3. All named instruments wrote all four required data types and no non-success rows exist → `succeeded` (DAC-E5-5, DAC-E5-S3-5).
4. Anything else → `partial` (DAC-E5-S3-6).

Clears claim fields (`claimed_by`, `heartbeat_at`) and sets `ended_at` in
every terminal transition. The runner therefore cannot record a run as
successful; it can only write results and let the journal read them.

`finalise` reads the current state with `SELECT ... FOR UPDATE`, so the row
stays locked from that read to the terminal write and concurrent calls on the
same run serialise. Every terminal write is guarded by `validate_transition`,
as in `request_cancel`: a run that is neither `running` nor `cancelling` — a
`requested` run, for instance — raises `IllegalRunTransition` and the row is
left unchanged.

**Known limitation, carried forward as an accepted warning from implementation
review v2** (`CAP-001-E5-S3-implementation-review-v2.md`) — it does not block
an acceptance criterion:

- TDD evidence `commit_hash` fields contain placeholders rather than actual
  Git SHAs; all work was delivered as a single commit rather than per-task
  (IR-001, low).

## Stale-claim reclaim

`src/factorflow/runs/reclaim.py` recovers from a crashed or stopped ingestion
process without manual datastore intervention (AC-20).

`reclaim_stale_runs(connection, stale_after_seconds)` executes one
parameterised `UPDATE … RETURNING` that atomically finds every claimed
`running` or `cancelling` run whose `heartbeat_at` is strictly older than
`stale_after_seconds` seconds ago (using `make_interval(secs => ...)` against
PostgreSQL's `now()`), transitions each to `abandoned`, sets `ended_at =
now()`, and clears `claimed_by` and `heartbeat_at`. Returns the list of
reclaimed `run_id` values (empty when nothing is stale). The caller owns
commit control; this function does not commit.

The sweep is idempotent: a second call finds the already-abandoned rows no
longer match the `running`/`cancelling` state predicate and returns an empty
list. Two concurrent sweepers cannot double-reclaim the same row: PostgreSQL's
per-row update lock serialises them, and the second transaction finds the row
already `abandoned`.

The reclaim sweeper runs in the **application container**, not the ingestion
container. A sweep that only ran inside the ingestion process could not
recover from the ingestion container being stopped or crash-looping — the
exact failure mode this mechanism exists to resolve. See
[Running the API](#running-the-api) for the lifespan-managed reclaim loop in
`app.py`.

**Known limitations, carried forward as accepted warnings from implementation
review v1** (`CAP-001-E5-S4-implementation-review-v1.md`) — none blocks a
current acceptance criterion:

- `test_reclaim_does_not_touch_coverage_or_results` does not insert an
  `acquisition_state` row to verify it is unchanged after reclaim, even though
  the task plan included it in the snapshot assertion. The reclaim SQL provably
  touches only `acquisition_run`; the gap is between the task plan's claimed
  coverage and the actual test scope (IR-001, medium).
- `test_heartbeat_false_after_reclaim_and_write_rejected` uses
  `pytest.raises((RunNotActive, Exception))` rather than
  `pytest.raises(RunNotActive)`, so any exception would pass the assertion; the
  critical behavior (heartbeat returns `False`, 0 result rows) is still verified
  (IR-002, medium).
- Commit `6d047c4` message states "add reclaim_stale_runs and heartbeat" and
  mentions updating `journal.py`, but only `reclaim.py` was created by this
  story — `heartbeat()` was already present on the integration branch from a
  prior story (IR-003, low).

## Acquisition runner

`src/factorflow/ingestion/runner.py` turns a claimed run into observations,
one instrument at a time. It is the process that finally calls the
[observation writer](#observation-writer). It writes nothing directly — every
insert or update belongs to `writer.py` on the success path and `outcomes.py`
on the failure path — while reading an instrument's symbol and coverage
segments through two parameterised queries of its own.

`AcquisitionRunner.execute_claimed(run_id, depth_years, instrument_ids)`
walks the roster it was handed — snapshotted once at claim time, so an
instrument added mid-run belongs to the next one. Before anything else it
records the roster's size on the run through the journal's
`record_instruments_named`, because that is the count `finalise` compares
written results against. A run whose claimed depth
is `None` is finalised without a single provider call: no stated depth means
there is no window to fetch.

Before every instrument, in this order, it refreshes the heartbeat and then
asks whether cancellation was requested. A lost claim stops the run
immediately and writes nothing further — another runner now owns it. An
observed cancellation finalises and stops. Both checks sit at the top of the
loop rather than around the work, so the longest a cancelled run continues
is one instrument.

For each instrument it fetches the four data types individually through
[`plan_fetches`](#range-planner), which is what keeps a re-run from
re-fetching covered ground. Each data type is fetched in a separate
try/except block. `CredentialRejected` is the one run-level error: every
remaining instrument would fail the same way, so the runner records the whole
run `failed` through the journal's `fail_run`, with the composed
credential-safe reason as `failure_reason`, writes nothing for the instrument
it was reading, and returns, so the ingestion process keeps polling
(EXP-20261011-3). The reason is served as `failure_reason` by
`GET /api/acquisition-runs` and `GET /api/acquisition-runs/{id}`; no screen
shows it yet. `InstrumentNotFound`, `ProviderUnavailable`, and any other `MassiveError`
are classified by `classify_provider_error` into a per-data-type
`InstrumentOutcomeRecord` (`not_found` or `failed`). The reason is composed
by `compose_failure_reason` and passed through the entrypoint's redaction
callable before classification, so a credential in a provider message never
reaches the database. After all four data types are attempted, the runner
calls `write_instrument_with_outcomes()` in one transaction, passing the
successfully fetched observations alongside the error outcomes for any
data types that failed. This allows one instrument to record distinct
outcomes per data type — for example `written` for prices and `not_found`
for fundamentals. Provider failures affect the instrument, not the run;
the next instrument starts immediately after.

When the roster is exhausted the run is finalised from what was written.

`CredentialAwareClientFactory` keeps one provider client and rebuilds it only
when the credential's value changes, and the entrypoint re-reads the
credential at each claim — so rotating the key takes effect on the next run
without restarting the process.

**Known limitations, carried forward as accepted warnings from implementation
review v1** (`CAP-001-E4-S6-implementation-review-v1.md`) — none blocks a
current acceptance criterion:

- `test_rate_limit_does_not_produce_outcome_row` (TC-COMP-145) provides a
  normal full-success stub client and asserts outcome strings are in the
  allowed set; it does not inject a 429-equivalent at the fetch boundary to
  prove the governor absorbs it before classification. A future change
  introducing a rate-limit error type that bypasses the governor would not be
  caught by this test (IR-001, medium).
- `test_appended_rows_persist_written_outcome` (TC-COMP-183 integration) does
  not assert `corporate_actions`; `test_unchanged_rows_persist_unchanged_outcome`
  (TC-COMP-184 integration) asserts only `prices` and `fundamentals`. An
  integration regression silently dropping one data type from
  `run_instrument_result` insertion would not be caught by these integration
  tests (IR-002, medium).

## Deploying and operating FactorFlow

Production runs only from the container image defined by `Dockerfile` and
orchestrated by `compose.yaml` (`component-design-runtime-config.md` sections
2.8.3, 2.8.4, 2.8.5, and 9; DEC-0034, DEC-0050). A source-checkout launch is
never a production deployment.

### First deployment

**Preconditions:**

- **Host networking** is required: Linux, or Docker Desktop with **host
  networking enabled** (Settings → Resources → Network). Every service in
  `compose.yaml` runs with `network_mode: host` and no `ports:` mapping.
- **Ports `8000` and `5432` are free** on the host before the first `up`.

**Step 1 — Generate the database password and export the four required variables.**

Generate `FACTORFLOW_POSTGRES_PASSWORD` with `openssl rand -hex 24` (192 bits,
satisfying H4's requirement of at least 128 bits from a cryptographically
secure generator and using only URL-safe characters so it composes into
`FACTORFLOW_DATABASE_URL` unencoded):

```bash
export FACTORFLOW_POSTGRES_PASSWORD="$(openssl rand -hex 24)"
export FACTORFLOW_MASSIVE_API_KEY="<your-massive-api-key>"
export FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=60
export FACTORFLOW_IMAGE_TAG="0.1.0-$(git rev-parse --short HEAD)"
```

All four variables (`FACTORFLOW_POSTGRES_PASSWORD`, `FACTORFLOW_MASSIVE_API_KEY`,
`FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE`, and `FACTORFLOW_IMAGE_TAG`) use
required `${VAR:?...}` interpolation in `compose.yaml`: a missing or empty
variable stops `docker compose` before starting any container and names the
variable. Every build uses an immutable `<version>-<shortsha>` tag (for example
`0.1.0-ef2dd7c`) that is **never reused**, so the previous image remains
available for rollback.

**Step 2 — Build and start PostgreSQL and the application container.**

```bash
docker compose up -d
```

`ingestion` is in the `ingestion` profile, so `docker compose up -d` starts
only `postgres` and `app`. Once `postgres` is healthy on its local Unix socket,
`app` runs `python -m factorflow.db.migrate_main` to bring the store forward to
the image's highest migration version before `exec`ing `python -m
factorflow.app_main` on `127.0.0.1:8000` (AC-15, AC-16).

**Step 3 — Run the deployment smoke check before using the interface or starting ingestion.**

```bash
scripts/deploy-smoke.sh
```

`scripts/deploy-smoke.sh` verifies that:

1. `postgres` and `app` are healthy and every non-comment, non-blank rule in
   `$PGDATA/pg_hba.conf` uses `scram-sha-256`, `peer`, or `reject`.
2. `GET http://127.0.0.1:8000/api/health` returns `200` with
   `database == "reachable"` and `schema_version` equal to the highest version
   discovered inside the running `app` image.
3. `GET http://127.0.0.1:8000/` returns `200` with the bundle's `index.html`.
4. Neither port `8000` nor port `5432` accepts a connection on any non-loopback
   IPv4, IPv6, or link-local address of the host or of Docker Desktop's virtual
   machine.

**Step 4 — Open the interface and start ingestion.**

Only after `scripts/deploy-smoke.sh` passes, open the owner interface at
`http://127.0.0.1:8000` and start the ingestion container from the same image:

```bash
docker compose --profile ingestion up -d
```

Re-run `scripts/deploy-smoke.sh` after every `docker compose up -d` and after
any change to the host's network configuration, before using the interface or
starting ingestion (SEC-ENC-001 host-local loopback exception condition H8).

**Changing the database password.** `POSTGRES_PASSWORD` sets the role's
password only when `factorflow-pgdata` is first initialised. To rotate
`FACTORFLOW_POSTGRES_PASSWORD` later, run `ALTER ROLE` with the old password
still exported in the shell:

```bash
docker compose exec -e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD" \
  postgres psql -U factorflow -d factorflow \
  -c "ALTER ROLE factorflow PASSWORD '<new-password>'"
```

Then export the new `FACTORFLOW_POSTGRES_PASSWORD` and run `docker compose up -d`.

### Upgrade, backup and rollback

Every step runs on the deployment machine in a shell with the four required
variables set. Dumps are written to `$FACTORFLOW_BACKUP_DIR`, a directory
outside the repository chosen by the owner, and are never committed
(`component-design-runtime-config.md` section 2.8.4, OPS-MIG-003).

**Upgrade** from tag `<old>` to tag `<new>`:

1. Back up:
   ```bash
   docker compose exec -T -e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD" \
     postgres pg_dump -U factorflow -d factorflow -Fc \
     > "$FACTORFLOW_BACKUP_DIR/factorflow-<old>-$(date -u +%Y%m%dT%H%M%SZ).dump"
   ```
   A non-zero exit or an empty file stops the upgrade before any later step.
2. Build: `FACTORFLOW_IMAGE_TAG=<new> docker compose build app`.
3. Deploy: `FACTORFLOW_IMAGE_TAG=<new> docker compose stop ingestion`, then
   `FACTORFLOW_IMAGE_TAG=<new> docker compose up -d`. The application container
   migrates forward before serving (AC-15).
4. Verify: run `scripts/deploy-smoke.sh`.
5. Resume ingestion: `FACTORFLOW_IMAGE_TAG=<new> docker compose --profile ingestion up -d`.

**Rollback when `<new>` applied no migration:** stop ingestion
(`docker compose stop ingestion`), run
`FACTORFLOW_IMAGE_TAG=<old> docker compose up -d`, run `scripts/deploy-smoke.sh`,
then start ingestion with
`FACTORFLOW_IMAGE_TAG=<old> docker compose --profile ingestion up -d`.

**Rollback when `<new>` applied a migration.** The older build refuses a store
ahead of its migrations (exit 2, AC-16), so the store is restored from the step
1 dump before the older image starts. Step 2 destroys the current database, so
the owner runs it only after confirming the dump to restore (OPS-DEST-001):

1. `docker compose stop ingestion app`
2. After confirming the dump to restore:
   ```bash
   docker compose exec -T -e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD" \
     postgres dropdb -U factorflow factorflow
   docker compose exec -T -e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD" \
     postgres createdb -U factorflow factorflow
   ```
3. Restore the step 1 dump:
   ```bash
   docker compose exec -T -e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD" \
     postgres pg_restore -U factorflow -d factorflow --no-owner \
     < "$FACTORFLOW_BACKUP_DIR/<the step 1 dump>"
   ```
4. `FACTORFLOW_IMAGE_TAG=<old> docker compose up -d`
5. Run `scripts/deploy-smoke.sh`. Check 2 must report `<old>`'s highest schema
   version.
6. `FACTORFLOW_IMAGE_TAG=<old> docker compose --profile ingestion up -d`

### Pre-release backup and restore drill

Before the first deployment of `0.1.0`, the backup and restore procedure is
rehearsed once under its own project name (`docker compose -p factorflow-drill`)
and volume while no `factorflow` deployment is running (`component-design-runtime-config.md`
section 2.8.4, DAC-E1-S9-9):

1. With `FACTORFLOW_POSTGRES_PASSWORD` generated via `openssl rand -hex 24` and
   the four variables exported, start PostgreSQL and the application only:
   ```bash
   docker compose -p factorflow-drill up -d
   ```
2. Run `scripts/deploy-smoke.sh factorflow-drill` before any data enters the
   drill store and keep its output with the drill record.
3. Open `http://127.0.0.1:8000`, set history depth and add an active instrument,
   start ingestion with `docker compose -p factorflow-drill --profile ingestion up -d`,
   let one acquisition run complete against the live provider, and read
   `GET /api/coverage`.
4. Back up the drill store, empty the database after confirming the dump to
   restore, and restore the dump:
   ```bash
   docker compose -p factorflow-drill exec -T -e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD" \
     postgres pg_dump -U factorflow -d factorflow -Fc \
     > "$FACTORFLOW_BACKUP_DIR/factorflow-drill.dump"
   docker compose -p factorflow-drill stop ingestion app
   docker compose -p factorflow-drill exec -T -e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD" \
     postgres dropdb -U factorflow factorflow
   docker compose -p factorflow-drill exec -T -e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD" \
     postgres createdb -U factorflow factorflow
   docker compose -p factorflow-drill exec -T -e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD" \
     postgres pg_restore -U factorflow -d factorflow --no-owner \
     < "$FACTORFLOW_BACKUP_DIR/factorflow-drill.dump"
   docker compose -p factorflow-drill up -d
   scripts/deploy-smoke.sh factorflow-drill
   ```
5. Read `GET /api/coverage` again and confirm the coverage response is
   unchanged.
6. Remove the drill containers and volume only after confirming the project name
   `factorflow-drill` (OPS-DEST-001):
   ```bash
   docker compose -p factorflow-drill down -v
   ```

The executed pre-release rehearsal record for `0.1.0` (including the pre-data
and post-restore `scripts/deploy-smoke.sh factorflow-drill` outputs, the owner's
H6 and `openssl rand -hex 24` statements, the live-provider run, the `pg_dump` /
`pg_restore` steps, the before/after `GET /api/coverage` comparison, and the
confirmed `down -v` teardown) is recorded in
`docs/releases/CAP-001-v0.1.0-drill-record.md`.

**Accepted warnings from implementation review v1**
(`CAP-001-E1-S9-implementation-review-v1.md`) — none blocks a current
acceptance criterion:

- `docs/releases/CAP-001-v0.1.0-drill-record.md` line 9 initially cited
  repo-relative paths under `docs/constitution/standards/` rather than the
  org-wide harness constitutions `CONST-SEC` 1.3 and `CONST-OPS` 1.3; resolved
  in `docs/releases/CAP-001-v0.1.0-drill-record.md` during doc-sync (IR-001,
  low).
- `biome.json` `files.ignore` omits `"build/**"`. Because `pyproject.toml`
  packages `"api/static/**/*"` into the wheel, running `uv build` when
  `src/factorflow/api/static/assets/*.js` is populated leaves minified JS copies
  under `build/lib/factorflow/api/static/assets/*.js` that match Biome's `*.js`
  include pattern until `build/` is removed (IR-002, low).

## Running the migrator

Inside the application container (`compose.yaml`'s `app` service), the schema
migrator (`python -m factorflow.db.migrate_main`) runs before the API starts
serving, loading `FACTORFLOW_DATABASE_URL` through `DatabaseSettings` (see
[Database URL confinement](#database-url-confinement)) and resolving this
build's SQL files from `factorflow.db.migrate_main.MIGRATIONS_DIR`
(`src/factorflow/db/migrations/`, shipped in the wheel as package data). See
[Deploying and operating FactorFlow](#deploying-and-operating-factorflow).

Exit code 0 means the schema is current or was brought forward; 1–4 each
name a distinct reason the store could not be brought forward (`FACTORFLOW_DATABASE_URL`
unset or refused by `DatabaseSettings` before any connection is opened, or an
unreachable database; store ahead of this build; a tampered migration; or a
migration that failed partway) and none of them start the API. Exit 4 also covers a
build whose migration files cannot be read: a missing migrations directory,
a malformed filename or a repeated version, all reported before any
connection is made. Under `restart: unless-stopped` in `compose.yaml`, a
non-zero exit shows as `Restarting (N)` and the application never becomes
healthy, so `ingestion` never starts (AC-16); stop the loop with
`docker compose stop app`.

## Running the API

The API (`python -m factorflow.app_main`, exec'd by the `app` container after
`migrate_main` exits 0; see [Deploying and operating FactorFlow](#deploying-and-operating-factorflow))
binds to `127.0.0.1` only by default, and no endpoint declares an
authentication requirement. The loopback binding together with the
[Host and Origin checks](#host-and-origin-checks) is what makes that sound.

`GET /api/health` reports liveness, database reachability, whether the
provider credential is set (a boolean, never the value), the highest
applied migration version, and the most recent acquisition run:

```json
{
  "status": "ok",
  "database": "reachable",
  "credential_present": true,
  "schema_version": 4,
  "most_recent_run": {
    "run_id": "3f1c2a9e-8d4b-4e6f-9a10-2b7c5d8e1f03",
    "state": "running",
    "ended_at": null
  }
}
```

`most_recent_run` is the run with the latest `(requested_at, run_id)` —
the same order as `GET /api/acquisition-runs`, so health and the first row of
the Runs list name the same run (DEC-0012). It is read by
`get_most_recent_run` in `src/factorflow/runs/queries.py`, served by
`idx_acquisition_run_recent`, so the interface's 30-second poll stays cheap.
No state is filtered out: a `requested`, `running` or `cancelling` run is
reported as it is, with `ended_at: null`, rather than skipped in favour of an
older finished one. `state` is any run state, and `ended_at` is set exactly
for terminal states. The object carries only these three fields; run detail
is `GET /api/acquisition-runs/{id}`. `most_recent_run` is `null` when the
database is reachable and no run has ever been recorded.

An unreachable database still responds `200` with `database: "unreachable"`,
rather than failing the request, so a caller can distinguish a dead database
from a dead API. In that case `schema_version` and `most_recent_run` are both
`null`, including when the connection fails after the run was read
(DEC-0014). An unmatched non-API path falls back to the built `index.html` when a
bundle is present, and 404s when it is not — the bundle is build output, so a
fresh clone has none until `npm run build` runs; an unmatched path under
`/api` always returns the `{"error": {...}}` envelope.

**Accepted warnings from implementation review v1**
(`CAP-001-E7-S3-implementation-review-v1.md`) — none blocks a current
acceptance criterion:

- The published OpenAPI schema does not list `most_recent_run` in
  `HealthResponse.required`, because the Pydantic field defaults to `None`,
  while `web/src/api/types.ts` types the key as always present. The body
  always carries the key; only a client generated from `/openapi.json` would
  treat it as possibly absent (IR-002, low).
- `tests/unit/test_api_models.py` imports `MostRecentRun` inside each new
  test, under a comment saying this keeps collection working; the symbol now
  imports at module scope, so the comment is stale (IR-001, low).

The API lifespan also manages a reclaim sweep: an asyncio background task
calls `reclaim_stale_runs` via `asyncio.to_thread` every 5 seconds, using
`FACTORFLOW_RUN_STALE_AFTER_SECONDS` (default 900). The task is created after
the pool opens and cancelled before the pool closes, so no sweep runs against
a closed pool. Because the sweep lives in the application container rather
than the ingestion container, it continues operating when ingestion is stopped
or crash-looping — the property that makes AC-20 hold for a crash-looping
ingestion container.

### Host and Origin checks

Loopback binding alone does not keep other web pages out. The API is plain
HTTP with no authentication, so any page the owner's browser loads can send
it requests, and with DNS rebinding can also read the answers. One middleware
in `app.py` (`_add_host_origin_middleware`, CAP-001-E1-S7) therefore checks
every request before any route or the static mount runs (CONST-SEC 1.3
condition H9; `component-design-ingestion-api.md` section 2.5a):

- **Host.** `Host` must be exactly `127.0.0.1:<port>`, `localhost:<port>` or
  `[::1]:<port>`. The host name is compared case-insensitively. A missing
  `Host`, another name, or another port is answered `400 host_not_allowed`.
- **Origin.** A request whose method is not `GET`, `HEAD` or `OPTIONS` and
  that carries an `Origin` header must come from `http://127.0.0.1:<port>`,
  `http://localhost:<port>` or `http://[::1]:<port>`. Any other origin,
  `null` included, is answered `403 origin_not_allowed`. A request with no
  `Origin` header (a script or `curl` on the machine) is not refused by this
  check.

`<port>` is `FACTORFLOW_API_PORT`, read once when `create_app()` runs. Open
the interface at one of those three addresses on that port. Any other name
for the machine, or a proxy that rewrites `Host`, is refused. The interface's
own requests are same-origin and pass.

A refusal runs neither the route nor the static mount, and reads neither the
request body nor any setting other than the port. It is logged at `WARNING`
on the `factorflow.api.app` logger with the rejected header's value and the
request id, for example
`request refused: Host 'evil.example:8000' not allowed (request_id=…)`. The
request-id middleware wraps this one, so the refusal also carries
`X-Request-Id` and `error.request_id`, as on every other error:

```json
{"error": {"code": "host_not_allowed",
           "message": "The request's Host is not one of this API's loopback addresses.",
           "resource": null, "request_id": "…"}}
```

**Accepted warning from implementation review v2**
(`CAP-001-E1-S7-implementation-review-v2.md`, IR-001, low). The allowed hosts
come from `ApiSettings.port` when `app_main` builds its module-level `app` at
import. `build_server(port=...)` still accepts a port override, so a server
built with a port other than `FACTORFLOW_API_PORT` binds that port but
refuses every request with `400 host_not_allowed`. `main()` passes no
override, so the release launch is unaffected.
`tests/integration/test_api_binding.py` sets `FACTORFLOW_API_PORT` to its free
port and rebuilds `app_main.app` before calling `build_server`.

### Error envelope and request correlation

Every request gets a fresh UUID from `app.py`'s request-id middleware. It is
returned as the `X-Request-Id` header on every response, error or not, and is
bound for the request's duration so every log record emitted while handling
it carries the same id. Every non-2xx response under `/api` carries it as
`error.request_id`, so a failure the owner sees can be found in the container
log (DAC-E7-6, DAC-E7-S2-3).

| Failure | Status and `code` | `message` | `resource` |
|---|---|---|---|
| A missing or foreign `Host`, on any path including `/` (see [Host and Origin checks](#host-and-origin-checks)) | `400 host_not_allowed` | `The request's Host is not one of this API's loopback addresses.` | `null` |
| A foreign `Origin` on a request other than `GET`, `HEAD` or `OPTIONS` | `403 origin_not_allowed` | `A state-changing request must come from this API's own origin.` | `null` |
| A route's own error (`errors.py` `error_response`) | as the route chooses, e.g. `409 run_already_terminal` | the route's fixed sentence | the route's resource |
| Unmatched path under `/api` | `404 not_found` | `No resource exists at this path.` | from the path, see below |
| Request validation (`_validation_error_handler`) | `422 validation_error` | `The request did not match the expected shape`, then a colon and each offending field in backticks, e.g. ``: `years`.`` | from the path |
| Any other framework `HTTPException`, e.g. a `405` (`_http_error_handler`) | the exception's status; `code` is the snake_case of its reason phrase (`method_not_allowed`), or `http_error` for a status outside `HTTPStatus` | `The request could not be completed: <reason phrase>.` | from the path |
| Unhandled exception (`internal_error_handler`) | `500 internal_error` | none | none |

A `500` body is exactly `{"error": {"code": "internal_error", "request_id":
"…"}}` — no message, no resource, no stack trace or driver text (DAC-E7-7).
The exception itself is logged server-side on the `factorflow.api` logger as
`unhandled exception during request handling`, at `ERROR`, carrying the same
request id as the body and header. The middleware converts the exception into
that response itself, while the id is still bound; the `Exception` handler
registered in `create_app` is a backstop.

Codes never depend on message wording (DAC-E7-S2-1), and no response echoes a
submitted or raised value (DAC-E7-S2-4): a framework exception's `detail` is
never returned, and a `422` names fields from `loc` only — never the error's
`input`, `ctx` or `msg`. In a field name the leading transport segment
(`body`, `query`, `path`, `header`, `cookie`) is dropped, except that `body`
alone is kept when the body itself is missing; names are de-duplicated in
first-seen order. Headers a framework exception carries, such as `Allow`, are
kept on the response.

`resource` for unmatched paths, validation errors and framework errors comes
from `_resource_for_path`: `instruments`, `settings` or `acquisition-run` when
the path is, or is under, `/api/instruments`, `/api/settings/history-depth` or
`/api/acquisition-runs`; otherwise the path's **last** segment
(`/api/does-not-exist` → `does-not-exist`); otherwise `request`.

These rules are DEC-0009 (framework error code and message), DEC-0010
(`resource` from the path) and DEC-0011 (`loc`-only field naming), all
owner-upheld and pending absorption into `component-design-ingestion-api.md`
§§2.3 and 2.5.

The interface's `toApiError` (`web/src/api/client.ts`) still reads a `500`:
the body has no `message`, so the `ApiError` falls back to
`request failed with status 500` and keeps the body's `code` and `requestId`.

**Accepted warnings from implementation review v1**
(`CAP-001-E7-S2-implementation-review-v1.md`) — none blocks a current
acceptance criterion:

- Because the middleware turns every exception escaping a route into the
  `500`, the exception no longer reaches Starlette's `ServerErrorMiddleware`,
  so `TestClient(app)` with the default `raise_server_exceptions=True` now
  receives a `500` instead of re-raising. Every existing error-path test passes
  `raise_server_exceptions=False`, so nothing relied on the re-raise; a new
  test cannot rely on it either, and should assert on the `500` and its log
  record instead (IR-001, low).
- `_resource_for_path`'s docstring says it falls back to the path's "first
  segment"; the code returns the last, as described above. The docstring is to
  be corrected when the component design absorbs DEC-0010 (IR-002, low).

## Running the acquisition runner

The acquisition runner (`python -m factorflow.ingestion_main`) is a separate
process from the API and shares only the database with it. In production it runs
as the `ingestion` service in `compose.yaml` from the same release image as
`app`, started under its profile after `scripts/deploy-smoke.sh` passes (see
[Deploying and operating FactorFlow](#deploying-and-operating-factorflow)):

```bash
docker compose --profile ingestion up -d
```

It claims the next requested run, executes it, and — when nothing is
claimable — waits `FACTORFLOW_RUN_POLL_INTERVAL_SECONDS` and polls again. In
normal operation the loop does not exit. A configuration error exits `1`
naming the offending environment variable, never its value.

The process holds one database connection, opened with `autocommit=True`.
Every unit of work marks its own `connection.transaction()` block, such as the
claim, each instrument's write and `finalise`, and each block commits when it
exits. Reads outside a block, such as the roster snapshot, hold no transaction
open. Without autocommit, the first bare read would open an implicit
transaction, every later block would become an uncommitted savepoint inside it,
and the run would stay `running` (EXP-20261010-2).

Each process identifies its claims as `ingestion-runner-<hostname>`, which is
what `heartbeat` checks ownership against, so two runners on different hosts
cannot mistake each other's claims for their own.

## The status region

The interface reads `GET /api/health` for itself. `HealthProvider` wraps the
shell and polls once on mount and every 30 seconds thereafter, so exactly one
interval exists no matter how many parts of the interface read the result; the
interval is cleared on unmount, and navigating between destinations does not
reset the cadence. The region renders at the bottom of the navigation rail, so
it is present on every screen.

It distinguishes three liveness states, each carrying a distinct shape as well
as its text so the difference survives in greyscale:

| State | Reads | Means |
|---|---|---|
| `unknown` | Checking | The first poll has not resolved yet |
| `answering` | Answering | The last poll returned a health response |
| `unreachable` | Not answering | The fetch itself failed — the API did not answer at all |

A successful response reporting `database: "unreachable"` is deliberately not
the `unreachable` state: that is the API answering that its store is down, a
different fact from the API being gone, and the two are kept apart so a dead
database does not look like a dead product.

When liveness is `unreachable`, the shell replaces the main region on every
route with a named unreachable state — it replaces rather than accompanies, so
no stale screen renders beside a message saying the product is not answering.
The rail and the region stay put around it. The copy names the likely cause and
where to look, and never surfaces the underlying transport error:

> FactorFlow is not answering. The application container may have stopped, or a
> database migration may have failed and prevented it from starting. Check the
> container logs.

That is the shape a refused start takes in the interface: a failed migration
means the API never binds, so the interface cannot reach it.

Three further behaviors are worth knowing:

- **Timestamps** render as ISO-8601 in `America/Chicago` with the zone visible
  (`2026-09-06 13:30:00 America/Chicago`), never in the viewing machine's local
  zone and never in a locale format. Before the first poll resolves the line
  reads `Not yet checked`.
- **`most_recent_run: null`** renders as `No run recorded` — not as an empty
  success and not as a failure. When the API reports a run, the line reads
  `Last run` followed by that run's outcome badge, the same word, icon and
  severity tier the Runs screen shows (EXP-20261011-2). The region does not
  yet link to the run's detail, although the health response carries the run
  id.
- **A missing provider credential** is reported only on the strength of a
  response that actually arrived. When the API did not answer, presence is
  unknown and the region says nothing about it rather than inferring absence
  from a failed request.

The region reserves a third line, sized but empty and hidden from assistive
technology, so a trading-environment indicator can land later without
restructuring the layout.

## Instruments and Settings screens

Both screens render inside the shell (`web/src/app/shell.tsx`) at their
navigation destinations and use the `ScreenState<T>` union
(`web/src/api/types.ts`) to distinguish loading, both empty states, error,
and unreachable.

**Instruments** (`web/src/screens/instruments/`) is one table with a
lifecycle column — active and retired instruments are never split into two
tables, so a retired instrument's history does not read as archived. An
inline field adds a single symbol; a `textarea` region accepts a
newline/comma/tab/semicolon-separated batch (`parse-bulk-symbols.ts`),
previews which entries are recognised and which are rejected (with a reason)
before anything is submitted, and reports the server's per-symbol outcome
(added/reactivated/rejected) after submission — a rejection never discards
the accepted symbols. Retiring an instrument opens a `dialog` `confirm` (never
`destructive`) that states retirement, not deletion, traps focus, and closes
on Escape or on a successful confirm; the dialog's in-flight-run sentence
renders on every open, unconditionally, because no run-status source exists
yet in the product (a known, disclosed gap — see
`docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S4-implementation-review-v2.md`
finding IR-201). Search and lifecycle filtering are server-side
(`listInstruments`), not a client-side filter over the loaded page, which is
required for the filter to stay correct at 3000 instruments; the table pages
further results with a "Load more" control that appends rows using the
server's keyset `cursor` rather than replacing them. Two known gaps remain
open, tracked in the implementation review above: "Load more" has no guard
against a filter changing while a page request is in flight (IR-202), and
loaded rows are never windowed, so the DOM grows unbounded once many pages
accumulate (IR-203). The acquisition-run start action renders `blocked` (never
a bare `disabled`) with its reason when history depth is unset.

**Settings** (`web/src/screens/settings/`) states history depth as a
positive whole number of years, validating on blur with an error that names
the operation, resource, and reason (`history-depth-form.tsx`); a failed read
is reported distinctly from an unset value. Provider credential presence
(`credential-status.tsx`) is shown as a read-only status — a filled circle,
a cross, or a dashed circle for present/missing/unknown — never the value
itself, each state carrying its own text label so the distinction survives in
greyscale.

## Runs screen

`web/src/screens/runs/` renders at `/runs` inside the shell and reads
`GET /api/acquisition-runs` through `listAcquisitionRuns()`. It produces the
`loading`, `empty-never-populated`, `empty-no-match`, `populated` and `error`
variants of `ScreenState<T>`; the shell owns `unreachable`.

The list is a `history` table — Run, Outcome, Requested, Started, Ended,
Instruments written, Instruments failed — newest first, with any run that
has not finished pinned to the top and marked in progress. The history
variant allows no row target, so the run id in the first column is a real
link to `/runs/<runId>` (middle-click and open-in-new-tab work), the
[Run detail screen](#run-detail-screen). Timestamps use the status region's
`America/Chicago` format, and a missing start or end time shows an em dash
read out as *Not recorded*. An *Outcome* select filters server-side by
state. Having no run ever reads differently from a filter that matches
nothing, and only the second offers *Reset filter*. When the API reports
more pages, the screen says *Showing the 50 most recent runs.* rather than
paging further.

Each outcome is a badge with a word and an icon, one shape per tier, so the
tiers stay distinct without colour (`outcome-badge.tsx`):

| State | Tier |
|---|---|
| `requested`, `cancelled` | neutral |
| `running` | active |
| `cancelling`, `partial` | warning |
| `succeeded` | good |
| `abandoned` | serious |
| `failed` | critical |

A partial run therefore never reads as a success, and a cancelled one never
as a failure. An abandoned run also carries a sentence saying its process
stopped, that coverage already written is kept, and that a new run
continues. `tailwind.config.js` exposes the `status-neutral`,
`status-active` and `status-serious` token pairs for these tiers; the
tokens themselves already existed in `design-system/theme.css`.

While the latest response holds a `requested`, `running` or `cancelling`
run, the screen schedules another request 10 seconds after each answer
(`RUNS_POLL_INTERVAL_MS`). When every run is terminal it schedules nothing,
so a quiet system makes no requests. The timer is cleared on unmount and on
a filter change. During a poll the rows stay rendered, with the table
`aria-busy`.

**`StartRunControl`** (`run-controls.tsx`) needs nothing but a Router
ancestor, so other screens can mount it; the Runs screen supplies its
preconditions from `getHistoryDepth()` and `listInstruments()`. Unset
history depth or zero active instruments renders the button `blocked`,
never `disabled`. It stays focusable, and each reason is linked through
`aria-describedby`, depth first when both hold. A read that failed leaves
the precondition unknown, and the button is not blocked on the client. A
`409` `history_depth_not_set` or `no_active_instruments` from the server
sets the same blocked rendering from `ApiError.code`, never from the API's
own message. A new set of precondition values clears it. After a `202`
the control calls `onStarted` (the Runs screen reloads), then navigates to
the new run's detail. When the run is queued behind an active one it
stays put, says *A run is in progress. This will start when it finishes.*,
and leaves the action available. An optional `label` prop replaces the
button's text, which defaults to *Start acquisition run*; nothing else
changes under another label.

**`CancelRunControl`** (`cancel-run.tsx`) is offered only for a `requested`
or `running` run. It opens a `dialog` `confirm` — never `destructive` —
whose copy differs for a queued run and for a running one. Initial focus
is on *Cancel*, focus is trapped, and Escape closes the dialog without a
request. The dialog stays open and busy until the request answers. The
result is shown as an outcome badge and the action is withdrawn, so a
`cancelling` run is never presented as cancelled. A `409`
`run_already_terminal` shows *This run had already completed.* with the
run's actual outcome. After a `202`, once its `state` prop moves past
`requested` or `running`, the control renders nothing, since its owner now
shows the newer state and the control's own badge would be stale; the
`409` message stays (DEC-0018). The Run detail screen mounts it.

Known gaps, recorded in
`docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S6-implementation-review-v1.md`:

- A poll that fails replaces the rows with the error state and stops
  polling until *Retry* or a filter change, and no test covers that path
  (IR-001).
- The toolbar reads *Not yet loaded* in every state other than `populated`,
  including after a failed poll or an empty filtered answer (IR-002).
- `CancelRunControl` was reachable only through its tests until
  CAP-001-E7-S4 mounted it on Run detail (IR-003, now resolved).

## Run detail screen

`web/src/screens/runs/detail/` renders at `/runs/:runId` inside the shell
and reads `GET /api/acquisition-runs/{id}` through `getAcquisitionRun()`.
It produces the `loading`, `empty-no-match`, `populated` and `error`
variants of `ScreenState<T>`; the shell owns `unreachable`. A run that has
recorded no results yet is `populated`, and says so in place of the roster.
The screen is keyed on the run id, so opening another run — as a re-run
does — starts from a clean filter, page and expansion.

`getAcquisitionRun()` sends only the `outcome` and `cursor` filters that are
set, and never a `limit`, so the API's default page of 50 instruments
applies and a 3000-instrument run is never requested at once. It maps the
body field by field into camelCase, so nothing outside the contract reaches
the screen, and rejects with `ApiError` on a `404` or `422`.

**The summary** (`run-summary.tsx`) is a card holding the run's outcome
badge, its Requested, Started and Ended times (a missing time is an em dash
read out as *Not recorded*, as on the Runs screen), the persisted
*n written and n failed of n named instruments* line, the whole-run count
per outcome from `counts.results_by_outcome`, and a *Last updated* time.
It carries the actions:

- `CancelRunControl` is always mounted, keyed on the run, and renders
  nothing where it does not apply. A conditional mount would lose the
  `409`'s *This run had already completed.* on the refetch that follows.
  After a successful cancel, the summary shows the returned state
  immediately, then refetches the run for its updated timestamps and
  counts. The control's temporary outcome badge disappears when the
  summary takes over.
- A `failed` or `partial` run shows *Re-running is safe: data already
  recorded is not duplicated or overwritten.* and a `StartRunControl`
  labelled *Re-run acquisition*. An `abandoned` run shows the Runs screen's
  abandoned explanation and the default *Start acquisition run*. Neither
  passes precondition props, so the button is blocked only by the API's
  `409` (DEC-0017).

**The roster** (`instrument-roster.tsx`) is an expandable table with one
collapsed row per instrument, grouping the API's consecutive rows and
keeping its failure-first order. The collapsed row shows one badge per
distinct outcome, failed first. A disclosure button (`aria-expanded`,
`aria-controls`) opens the data-type rows the API returned, in the fixed
order Reference, Prices, Fundamentals, Corporate actions. Under an outcome
filter only the matching rows come back, and none is synthesised. A failed
data type reads *Acquiring prices for AAPL failed: \<reason\>*; a
`not_found` one reads *…: not found at the provider.*, never as a failure.
Reasons render as text, never markup.

Each per-data-type outcome is a badge with a word and its tier's icon
(`result-outcome-badge.tsx`, reusing `outcome-badge.tsx`'s icons), per
DEC-0015:

| Outcome | Reads | Tier |
|---|---|---|
| `written` | Written | good |
| `unchanged` | Unchanged | good |
| `not_found` | Not found | warning |
| `skipped` | Skipped | warning |
| `failed` | Failed | critical |

An *Outcome* select filters server-side and returns to page 1, announcing
*n instruments shown* politely. A filter that matches nothing reads *No
instrument in this run matches this filter.* and offers *Reset filter*.
Paging is *Previous page*, *Page n* and *Next page* over a client-side
cursor stack; pages replace each other rather than accumulate. A failed
load shows *Loading run \<id\> failed: …* with its request id and a
*Retry*, and the last good summary stays rendered.

While the run is `requested`, `running` or `cancelling`, the screen
re-requests the same filter and cursor 10 seconds after each answer
(`RUN_DETAIL_POLL_INTERVAL_MS`), keeping open rows open. A terminal run
schedules nothing, a failed poll stops until *Retry*, and the timer is
cleared on unmount (DEC-0016).

The outcome tiers and labels, the paging and polling shape, the re-run
action and the cancel control's change are DEC-0015 to DEC-0018, all
owner-upheld and pending absorption into `ux-design.md` §1.5 and
`component-design-owner-web-app.md` §§2.3, 2.5 and 2.6.

The *n of n named instruments* line shows the run's persisted counts as
served. The runner records `acquisition_run.instruments_named` when it starts
a run (EXP-20261011-1), but no production code writes `instruments_written`
or `instruments_failed` yet, so outside seeded tests the line reads
*0 written and 0 failed of n*, even beside a `Succeeded` outcome. The defect
belongs to the run journal and runner, not this screen
(`CAP-001-E7-S4-tasks.md` Other Notes; EXP-20261011-1 review v1 ER-001).

**Accepted warnings from implementation review v1**
(`CAP-001-E7-S4-implementation-review-v1.md`) — none blocks a current
acceptance criterion:

- The expander's `aria-controls` names the instrument's whole `tbody`,
  which also holds the expander's own row, so the region it points at is
  never hidden. `aria-expanded` still conveys the state (IR-001, low).
- `getAcquisitionRun()` guards `outcome` and `cursor` by truthiness, so an
  explicit empty string would be dropped rather than sent. No current caller
  passes one (IR-002, low).
- The page controls render only in the `populated` state. A later filtered
  page that empties offers only *Reset filter*, which clears the filter as
  well as the page (IR-003, low).

## Coverage screen

`web/src/screens/coverage/` renders at `/coverage` inside the shell and
reads `GET /api/coverage` through `fetchCoverage()`. It produces the
`loading`, `empty-never-populated`, `empty-no-match`, `populated` and
`error` variants of `ScreenState<T>`; the shell owns `unreachable`. A row
with some data types absent is an ordinary populated row, and gap
detection being unavailable shows in the Gaps column, never as a
screen-wide state.

The table has one row per instrument and eleven columns — Symbol,
Lifecycle, Reference, Prices, Fundamentals, Corporate actions, Covered
from, Covered to, Gaps, Depth, Last acquired. `fetchCoverage()` sends only
`symbol`, `lifecycle` and `cursor`. With no `from` or `to` the read covers
everything acquired, and the API's default page of 50 applies. A retired
instrument stays in the table, muted and with the Instruments screen's
lifecycle badge, and keeps its range and presence.

Every status is a word plus a shape, so none depends on colour
(`badges.tsx`):

| Status | Reads | Shape |
|---|---|---|
| Present | Present | check mark |
| Absent | Absent | em dash |
| Unknown (presence, or Gaps when detection is unavailable) | Unknown | question mark, on the hatched `pattern-indeterminate` background |
| Short of stated depth | Short by *n* year(s) | warning triangle |

`cells.tsx` keeps three kinds of empty cell apart. A missing value is an em
dash read out as *No data*, a measured count shows its number (zero
included), and a cell that does not apply is blank with a *Not applicable*
label for assistive technology. Covered-from, covered-to and gap dates are
session dates. They are shown exactly as the API sends them (`YYYY-MM-DD`)
and never pass through `Date`, which would move them by the viewer's zone.
*Last acquired* is an instant, shown in `America/Chicago` through the status
region's `formatTimestamp`. The Depth column shows the shortfall marker only
for a positive `depth_short_by_years`; `null` and `0` leave it blank.
`tailwind.config.js` exposes the `value-missing` and `value-indeterminate`
token pairs and the `pattern-indeterminate` background for these cells; the
tokens themselves already existed in `design-system/theme.css`.

The Gaps cell, per `GapsCell`:

| Gap detection | `gap_count` | Cell |
|---|---|---|
| unavailable | any, even a number | *Unknown* badge |
| available | `null` | blank, *Not applicable* (no daily prices covered) |
| available | a number | the count |

When detection is available a sentence below the table says it cannot see
a market-wide provider outage. When detection is unavailable, that line
gives the reason sentence instead (*Gap detection needs at least two
instruments holding data in this range.* for
`fewer_than_two_instruments_with_data`). An unrecognised reason code is
shown as text rather than dropped.

**Gap dates sit behind expansion.** Each row's symbol cell holds a
disclosure button (`aria-expanded`, `aria-controls`). Opening it fetches
that instrument's dates once, through `fetchCoverageGapDates()`, which
requests `GET /api/coverage?symbol=<s>&limit=1&expand=<s>` and reads only
`expanded`. A body without `expanded` is an error, never an empty list.
The fetch is made only when detection is available and the count is
positive. Otherwise the expansion answers locally with the reason sentence,
*Gap detection applies to daily prices only…*, or *No missing trading days
in the covered range.* Dates are cached by symbol and listed in ascending
order. A failed fetch shows the error with its request id and a *Retry*.
The cache is cleared, and every open row is collapsed, after each
successful load of the page — a refresh, a filter change or a page change.

**No polling.** Coverage is fetched on mount, on a filter or page change,
and on *Refresh*, *Retry* or *Reset filter* — never on a timer. A
refresh keeps the current rows rendered, dimmed and `aria-busy`. The
toolbar holds a symbol filter (debounced 250 ms, server-side), a lifecycle
select, `StartRunControl` (its preconditions read from
`getHistoryDepth()` and `listInstruments()` as the Runs screen reads them),
*Refresh*, a *Last updated* time, and a polite count of the instruments
shown. Paging is over the API's keyset cursor with *Previous page* and
*Next page*. Pages replace each other rather than accumulate, so the DOM
stays bounded at 3000 instruments, and the table scrolls in its own
container while the page does not. This is pagination, not the
virtualisation STD-UI-30 asks for.

No data ever acquired reads *No data has been acquired yet.* with no table.
A filter that matches nothing reads *No instrument matches this filter.*
and offers *Reset filter*. When two or more loaded rows with a covered
range all share the same positive shortfall, a note above the table names
it as the provider plan's history limit rather than missing data
(`uniform-shortfall.ts`). The note judges only the loaded page.

The `expand` request, the plan-limit rule, when an expansion fetches, and
the screen's non-UX-verbatim copy are owner-confirmed choices pending
absorption into their designs, recorded as Open Gaps 1, 3, 4 and 6 in
`CAP-001-E6-S4-tasks.md`. Open Gaps 7–9 there record the Start control's
inputs, the expansion's content and the loading text; each is cited by
number in the module docstrings.

Known gaps, recorded in
`docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S4-implementation-review-v1.md`:

- The gaps-column *Unknown* deliberately shares the presence *Unknown*
  badge (`GapsUnknownBadge` delegates to it), since both mean the check
  could not run. So TC-COMP-065 proves six statuses pairwise distinct
  rather than the seven its task named, and asserts the seventh equal to
  presence *Unknown* (IR-001).
- An expansion whose `gap_dates` comes back `null` on an available view
  shows *Gap detection is unavailable (no reason given).*, which
  contradicts the view. The branch is close to unreachable and untested
  (IR-002).
- *Refresh* collapses every open row as well as clearing the date cache
  (IR-003).
- The test labelled TC-COMP-022 implements the story's depth-shortfall
  rendering, not the component test specification's backfill behaviour
  (IR-004).
- The planned manual keyboard and greyscale passes have not been done
  (IR-005).

## Testing

Integration tests run against a real PostgreSQL 16 instance started by
`testcontainers`, so **Docker must be running**. Each test gets its own
freshly created database inside one shared session container, so tests do
not observe each other's tables.

```bash
uv run pytest                          # full suite
uv run pytest -m postgres              # database-backed tests only
uv run pytest -m 'not postgres'        # no container runtime required
uv run pytest -m 'postgres and slow'   # long-running volume and resume tests only (~160 s)
uv run pytest -m 'postgres and not slow'  # database tests excluding the long-running suite
```

Without a container runtime, run the `not postgres` variant and report the
exclusion — a partial run is not a green suite.

A test that drives the API through `TestClient` must pass a loopback
`base_url`, such as `TestClient(app, base_url="http://127.0.0.1:8000")`.
`TestClient`'s default `Host: testserver` is answered `400 host_not_allowed`
(see [Host and Origin checks](#host-and-origin-checks)). The port must match
`FACTORFLOW_API_PORT` as it was when the app was built (8000 by default).
`tests/unit/test_api_host_origin.py` sends explicit `Host` and `Origin`
headers to test the checks themselves. Tests that set a placeholder
`FACTORFLOW_DATABASE_URL` without connecting must likewise name a loopback
host (for example `postgresql://unused@127.0.0.1/unused`), because
`DatabaseSettings` refuses a non-loopback host without
`sslmode=verify-full` (see [Database URL confinement](#database-url-confinement)).

Tests marked `slow` are the volume and resumability suite (`test_runner_volume.py`,
`test_runner_resume.py`) introduced in CAP-001-E4-S7. They require Docker and take
around 160 seconds to run a 3000-instrument scenario against PostgreSQL. They are
included in `uv run pytest -m postgres` and in the full suite.
`test_coverage_volume.py` (CAP-001-E6-S1), which pages coverage across 3000
instruments, is also marked `slow`, as is
`test_api_coverage.py::test_volume_read_of_3000_instruments` (CAP-001-E6-S3),
which does the same through `GET /api/coverage`. `test_universe_volume.py`
(CAP-002-E1-S3), which builds a 3000-member universe in three calls and
replays it, is marked `slow` as well.

The interface suite is Vitest with React Testing Library, run from the
repository root:

```bash
npm run test
```

One of its files drives a real Vite production build to assert the bundle
lands in `src/factorflow/api/static/` and leaves `.gitkeep` intact, so this
command writes build output as a side effect and takes appreciably longer
than a pure unit suite. It leaves no tracked file modified.

`npm run test:e2e` runs the Playwright suite in `tests/e2e/` against a real
API and PostgreSQL container: `scripts/run-e2e-server.sh` (Playwright's
`webServer.command`) starts the container, applies migrations, builds the
interface bundle, and runs the API process on `127.0.0.1:8123` (or
`FACTORFLOW_API_PORT`), tearing both down after the run; `posttest:e2e`
removes the container by name as a backstop against a hard-killed teardown.
`coverage-expansion.spec.ts` applies `fixtures/coverage-seed.sql` itself, by
`docker exec … psql` into that container (`factorflow-e2e-postgres`), before
its test runs. The seed is idempotent. `cancel-run.spec.ts` and
`run-detail.spec.ts` seed runs and results through `sql()` in
`support/database.ts`, the same `docker exec … psql`, because the e2e server
starts no runner. Every spec shares that one database, so the suite runs on
one worker (`workers: 1` in `playwright.config.ts`).
Needs Docker and Playwright's browsers installed (`npx playwright install`).

The script also starts an acquisition stack on `127.0.0.1:8125` (or
`FACTORFLOW_E2E_ACQ_PORT`): its own API and database, the provider stub
`tests/e2e/support/massive_stub.py` on `127.0.0.1:8126` (or
`FACTORFLOW_E2E_STUB_PORT`), and an ingestion process pointed at it with
`FACTORFLOW_MASSIVE_BASE_URL=http://127.0.0.1:<port>`. The release settings
refuse `http`, so that process runs through the test-only entry point
`tests/e2e/support/ingestion_e2e_main.py`, which calls
`factorflow.ingestion_main.main(settings_factory=..., credential_reader=...)`:

- Its settings accept `http` only for a loopback host (`127.0.0.1`,
  `localhost` or `[::1]`, compared case-insensitively). `localhost` must
  resolve only to loopback addresses. Every other base-URL rule is the
  release validator's.
- It accepts only a designated test credential, `TEST-ONLY-` followed by at
  least 32 lowercase hex characters, at start and again at every claim. Any
  other key refuses start, or ends the process at a later claim, naming
  `FACTORFLOW_MASSIVE_API_KEY` without echoing the value.
- The script generates that key once per run
  (`E2E_PROVIDER_KEY="TEST-ONLY-$(...secrets.token_hex(16)...)"`) and passes it
  only through the environment. No tracked file holds a provider key, and
  `tests/unit/test_no_committed_secrets.py` scans `scripts/`, `tests/` and
  `src/` to keep it that way.

The entry point lives under `tests/`, so the wheel and the container image
never contain it, and no module under `src/` imports it. The release launch
`python -m factorflow.ingestion_main` with an `http` base URL still exits 1.

The script's refused-start check uses GNU `timeout`. On macOS, install
coreutils and put its `gnubin` directory first on `PATH` for the run.

## Validation

The full set of checks, all of which must pass:

```bash
uv sync --all-extras
uv build
uv run pytest
uv run ruff check .
uv run ruff format --check .
uv run mypy src

npm ci
npm run build
npm run test
npm run lint
npm run format
npx tsc --noEmit
```

Note that `npm run format` is `biome format .`, which reports formatting
without writing; add `--write` to apply it.

`ruff` excludes `docs/` and `design-system/`: both carry content this
package does not own, and `docs/` holds approved specifications whose
embedded code fences must not be reformatted outside the specification
review process.
