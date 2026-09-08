# FactorFlow

Classify a self-defined stock universe and trade it automatically under
owner-controlled strategies, proven in paper before capital is at risk.

A single repository holding the specifications, the application, the market
data ingestion process, and the owner interface. See
`docs/constitution/product-charter.md` for the product itself and
`docs/constitution/tech-stack.md` for the approved technology stack.

## Status

Early. The database schema foundation is in place; the application, the
ingestion process, and the owner interface are not yet built. What exists
today is described below — everything else in `docs/` is specification for
work not yet implemented.

## Requirements

- Python 3.12 or newer
- [uv](https://docs.astral.sh/uv/) for dependency resolution
- Docker, for the `postgres`-marked test suite (see Testing)

## Setup

```bash
uv sync --all-extras
```

## Layout

| Path | Contents |
|------|----------|
| `Dockerfile` | Application container image. Runs the schema migrator, then execs `uvicorn`, chained with `&&` so a failed migration prevents the API from ever binding. Not yet a runnable service — no FastAPI app module exists yet |
| `migrations/` | Numbered, forward-only SQL migrations. See `migrations/README.md` for the conventions |
| `src/factorflow/` | The `factorflow` package (`src/` layout) |
| `src/factorflow/config/` | Runtime configuration and the credential boundary. `settings.py` validates every environment variable at start and holds secrets in `SecretStr`; `redaction.py` scrubs known secret values from log records. See [Configuration](#configuration) |
| `src/factorflow/db/` | Database definitions and the schema migrator. `applied_migrations.py` exports `APPLIED_MIGRATIONS_DDL`, the migration-tracking table the migrator creates before applying the first migration file. `migrator.py` discovers, checksums, and applies migration files under an advisory lock. `migrate_main.py` is the container entrypoint (`python -m factorflow.db.migrate_main`), mapping every outcome to an exit code 0–4 |
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

## Validation

The full set of checks, all of which must pass:

```bash
uv sync --all-extras
uv build
uv run pytest
uv run ruff check .
uv run ruff format --check .
uv run mypy src
```

`ruff` excludes `docs/` and `design-system/`: both carry content this
package does not own, and `docs/` holds approved specifications whose
embedded code fences must not be reformatted outside the specification
review process.
