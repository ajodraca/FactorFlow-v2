# FactorFlow

Classify a self-defined stock universe and trade it automatically under
owner-controlled strategies, proven in paper before capital is at risk.

A single repository holding the specifications, the application, the market
data ingestion process, and the owner interface. See
`docs/constitution/product-charter.md` for the product itself and
`docs/constitution/tech-stack.md` for the approved technology stack.

## Status

Early. The database schema foundation, the instrument-list domain service,
the API's health endpoint and application factory, and the owner interface's
application shell — its navigation rail, routing, and status region — are in
place. The remaining API routes, the ingestion process, and the interface's
screen content are not yet built. Each of the four destinations currently
renders a placeholder. What exists today is described below — everything else
in `docs/` is specification for work not yet implemented.

## Requirements

- Python 3.12 or newer
- [uv](https://docs.astral.sh/uv/) for dependency resolution
- Node.js 18 or 20+ with npm, for the owner interface (Vite 5 requires
  `^18.0.0 || >=20.0.0`; Node 19 is not supported)
- Docker, for the `postgres`-marked test suite (see Testing)

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
| `Dockerfile` | Application container image. Runs the schema migrator, then execs the API process (`python -m factorflow.app_main`), chained with `&&` so a failed migration prevents the API from ever binding |
| `migrations/` | Numbered, forward-only SQL migrations. See `migrations/README.md` for the conventions |
| `src/factorflow/` | The `factorflow` package (`src/` layout) |
| `src/factorflow/config/` | Runtime configuration and the credential boundary. `settings.py` validates every environment variable at start and holds secrets in `SecretStr`; `redaction.py` scrubs known secret values from log records. See [Configuration](#configuration) |
| `src/factorflow/db/` | Database definitions and the schema migrator. `applied_migrations.py` exports `APPLIED_MIGRATIONS_DDL`, the migration-tracking table the migrator creates before applying the first migration file. `migrator.py` discovers, checksums, and applies migration files under an advisory lock. `migrate_main.py` is the container entrypoint (`python -m factorflow.db.migrate_main`), mapping every outcome to an exit code 0–4 |
| `src/factorflow/instruments/` | Domain service for the owner-managed instrument list. `symbols.py` normalises supplied symbols and validates their database shape; `service.py` adds or reactivates symbols in one transaction, retires stored symbols without deletion, returns keyset-paged lists with lifecycle counts, and provides the active instrument IDs in symbol order. This internal API is not yet exposed through HTTP; CAP-001-E2-S3 owns the route layer. |
| `src/factorflow/api/` | The FastAPI application. `app.py` is the application factory: lifespan-managed `psycopg_pool.ConnectionPool`, request-id middleware, and the static-bundle mount with its SPA fallback. `routes/health.py` implements `GET /api/health`. `models.py` and `errors.py` hold the response models and the `{"error": {...}}` envelope. `static/` is the Vite build output directory, populated by `npm run build`; only its `.gitkeep` is tracked. See [Running the API](#running-the-api) |
| `src/factorflow/app_main.py` | The uvicorn entrypoint (`python -m factorflow.app_main`). Binds the host and port from `ApiSettings` (loopback only by default) |
| `web/` | The owner interface's Vite root. `index.html` is the bundle entry; `src/main.tsx` mounts the React root inside a `BrowserRouter` |
| `web/src/api/` | The interface's typed access to the JSON API. `types.ts` hand-writes the response shapes against the published contract; `client.ts` holds `fetchHealth()` and the `ApiUnreachableError` it raises when the API does not answer. Same-origin only — the bundle is served by the API process, so every path is relative |
| `web/src/app/` | The application shell. `shell.tsx` renders the fixed navigation rail of four destinations — Coverage, Instruments, Runs, Settings — a main region, and the status region pinned to the rail's bottom; `routes.tsx` declares those four routes plus a `/runs/:runId` child, a `/` redirect to `/coverage`, and a catch-all not-found rendered inside the frame. `status-region.tsx` polls health and renders the region, and exports the unreachable state the shell substitutes for the main region. See [The status region](#the-status-region) |
| `design-system/` | Vendored `theme.css` design tokens, imported by `web/src/index.css` and mapped into Tailwind's scales by `tailwind.config.js` |
| `tests/unit/` | Tests needing no database |
| `tests/integration/` | Tests running against a real PostgreSQL 16 container |
| `docs/` | Constitution, capability specifications, and designs |

## Configuration

Every setting is read from the environment at process start and validated
before anything else runs, so a misconfiguration fails immediately rather
than surfacing later as a confusing runtime error. A missing or malformed
required value raises `ConfigurationError` naming the **environment
variable** — never its value.

| Variable | Required | Default | Notes |
|---|---|---|---|
| `FACTORFLOW_DATABASE_URL` | yes | — | Held as a secret; never logged |
| `FACTORFLOW_DATABASE_POOL_MIN` | no | `1` | Minimum 1 |
| `FACTORFLOW_DATABASE_POOL_MAX` | no | `4` | Minimum 1 |
| `FACTORFLOW_API_HOST` | no | `127.0.0.1` | Loopback only; a non-loopback address is rejected at start |
| `FACTORFLOW_API_PORT` | no | `8000` | 1–65535 |
| `FACTORFLOW_MASSIVE_API_KEY` | yes | — | Held as a secret. Supplied to both processes; the application reads only whether it is set |
| `FACTORFLOW_MASSIVE_BASE_URL` | no | `https://api.massive.com` | |
| `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` | yes | — | No default: the budget is the owner's provider plan and cannot be guessed |
| `FACTORFLOW_MASSIVE_MAX_ATTEMPTS` | no | `3` | Minimum 1 |
| `FACTORFLOW_MASSIVE_TIMEOUT_SECONDS` | no | `30` | Minimum 1 second |
| `FACTORFLOW_MASSIVE_BACKOFF_INITIAL_SECONDS` | no | `2` | |
| `FACTORFLOW_MASSIVE_MAX_THROTTLE_WAIT_SECONDS` | no | `300` | |
| `FACTORFLOW_RUN_HEARTBEAT_SECONDS` | no | `60` | Minimum 1 second |
| `FACTORFLOW_RUN_STALE_AFTER_SECONDS` | no | `900` | See the timing rules below |
| `FACTORFLOW_RUN_POLL_INTERVAL_SECONDS` | no | `5` | Minimum 1 second |
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

## Running the migrator

The application container runs the schema migrator before it starts serving,
reading the database connection from the `FACTORFLOW_DATABASE_URL`
environment variable:

```bash
FACTORFLOW_DATABASE_URL=postgresql://user:pass@host:5432/factorflow \
  uv run python -m factorflow.db.migrate_main
```

Exit code 0 means the schema is current or was brought forward; 1–4 each
name a distinct reason the store could not be brought forward (unreachable
database, store ahead of this build, a tampered migration, or a migration
that failed partway) and none of them start the API.

## Running the API

The API binds to `127.0.0.1` only by default, and no endpoint declares an
authentication requirement — the loopback binding is what makes that sound.
Once the schema is current (see above), start it with:

```bash
FACTORFLOW_DATABASE_URL=postgresql://user:pass@host:5432/factorflow \
FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=60 \
  uv run python -m factorflow.app_main
```

`GET /api/health` reports liveness, database reachability, whether the
provider credential is set (a boolean, never the value), and the highest
applied migration version:

```json
{
  "status": "ok",
  "database": "reachable",
  "credential_present": true,
  "schema_version": 4,
  "most_recent_run": null
}
```

An unreachable database still responds `200` with `database: "unreachable"`,
rather than failing the request, so a caller can distinguish a dead database
from a dead API. `most_recent_run` is `null` until a later story populates
it. An unmatched non-API path falls back to the built `index.html` when a
bundle is present, and 404s when it is not — the bundle is build output, so a
fresh clone has none until `npm run build` runs; an unmatched path under
`/api` always returns the `{"error": {...}}` envelope.

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
  success and not as a failure. A later story populates the field and fills in
  the recorded branch.
- **A missing provider credential** is reported only on the strength of a
  response that actually arrived. When the API did not answer, presence is
  unknown and the region says nothing about it rather than inferring absence
  from a failed request.

The region reserves a third line, sized but empty and hidden from assistive
technology, so a trading-environment indicator can land later without
restructuring the layout.

## Testing

Integration tests run against a real PostgreSQL 16 instance started by
`testcontainers`, so **Docker must be running**. Each test gets its own
freshly created database inside one shared session container, so tests do
not observe each other's tables.

```bash
uv run pytest                      # full suite
uv run pytest -m postgres          # database-backed tests only
uv run pytest -m 'not postgres'    # no container runtime required
```

Without a container runtime, run the `not postgres` variant and report the
exclusion — a partial run is not a green suite.

The interface suite is Vitest with React Testing Library, run from the
repository root:

```bash
npm run test
```

One of its files drives a real Vite production build to assert the bundle
lands in `src/factorflow/api/static/` and leaves `.gitkeep` intact, so this
command writes build output as a side effect and takes appreciably longer
than a pure unit suite. It leaves no tracked file modified.

`npm run test:e2e` is defined but has no Playwright specs yet; the
end-to-end suite arrives with a later story.

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
