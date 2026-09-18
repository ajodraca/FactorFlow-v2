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
and corporate actions — the instrument-list domain service, the instrument
and settings API routes, the API's health endpoint and application factory,
and the owner interface's application shell — its
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
place, though no observation writer or acquisition runner calls them yet. The
remaining API routes (acquisition runs, coverage), the rest of the ingestion
process, and the Coverage and Runs screens are not yet built; those two
destinations still render a placeholder. What exists today is described below — everything else
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
| `src/factorflow/instruments/` | Domain service for the owner-managed instrument list. `symbols.py` normalises supplied symbols and validates their database shape; `service.py` adds or reactivates symbols in one transaction, retires stored symbols without deletion, returns keyset-paged lists with lifecycle counts, and provides the active instrument IDs in symbol order; `settings.py` reads and writes the owner's stated history depth (`read_history_depth`, `write_history_depth`), held in `owner_setting` as a `jsonb` value under the fixed key `history_depth_years` — see [History depth setting](#history-depth-setting). Exposed over HTTP by `src/factorflow/api/routes/instruments.py` and `settings.py` |
| `src/factorflow/api/` | The FastAPI application. `app.py` is the application factory: lifespan-managed `psycopg_pool.ConnectionPool`, request-id middleware, exception handlers (`errors.py`'s envelope for uncaught exceptions and request-validation `422`s), and the static-bundle mount with its SPA fallback. `bounds.py` holds the canonical request-bound constants (`MAX_HISTORY_DEPTH_YEARS`, `MAX_PAGE_SIZE`, etc.) shared across route modules. `routes/health.py` implements `GET /api/health`; `routes/instruments.py` implements `GET`/`POST /api/instruments` and `DELETE /api/instruments/{symbol}`; `routes/settings.py` implements `GET`/`PUT /api/settings/history-depth` — both thin HTTP surfaces over `src/factorflow/instruments/`, delegating all domain logic. `models.py` and `errors.py` hold the response models and the `{"error": {...}}` envelope. `static/` is the Vite build output directory, populated by `npm run build`; only its `.gitkeep` is tracked. See [Running the API](#running-the-api) |
| `src/factorflow/ingestion/hashing.py` | Pure deterministic observation-value canonicalization and hashing. `canonical_json()` emits sorted, compact UTF-8 JSON with exact `Decimal` strings and rejects unsupported values; `value_hash()` returns its raw 32-byte SHA-256 digest. See [Deterministic observation-value hashing](#deterministic-observation-value-hashing) |
| `src/factorflow/ingestion/rate_limit.py` | The synchronous, provider-agnostic `RateLimitGovernor`: full-start token-bucket pacing, bounded throttle handling, and bounded retry backoff. See [Rate limit governor](#rate-limit-governor) |
| `src/factorflow/ingestion/massive/` | Pydantic v2 response models for Massive's four historical data shapes, named in the product's own vocabulary rather than the provider's, the provider's typed error taxonomy, a safe failure-reason composer, and the historical client over Massive's REST SDK. `models.py` defines `TickerReference`, `DailyBar`, `FinancialStatement`, and `CorporateAction`; wire field names (`t`, `o`, `h`, `l`, `c`, `filing_date`, and the rest) appear only as `Field(alias=...)`, never as a public attribute. `errors.py` reconstructs `InstrumentNotFound`, `CredentialRejected`, `ProviderUnavailable`, and `ProviderContractViolation` from the Massive SDK's single, status-code-discarding exception, and composes owner-visible failure reasons from them via `compose_failure_reason` and `MAX_FAILURE_REASON_VARIABLE_TEXT`. `client.py` defines `MassiveClient`, the four product-named reads over one reusable SDK client, every request routed through `RateLimitGovernor`; `paging.py` follows a paged read's `next_url` one page at a time under governor permits. `__init__.py` re-exports exactly these model, error-taxonomy and reason-composer names — no Massive SDK type or raw wire dict crosses the package boundary. See [Massive provider response models](#massive-provider-response-models), [Massive historical client](#massive-historical-client), and [Massive provider failure reasons](#massive-provider-failure-reasons) |
| `src/factorflow/app_main.py` | The uvicorn entrypoint (`python -m factorflow.app_main`). Binds the host and port from `ApiSettings` (loopback only by default) |
| `web/` | The owner interface's Vite root. `index.html` is the bundle entry; `src/main.tsx` mounts the React root inside a `BrowserRouter` |
| `web/src/api/` | The interface's typed access to the JSON API. `types.ts` hand-writes the response shapes against the published contract — `HealthResponse`, `ScreenState<T>`, and the instrument/settings shapes `SymbolOutcome`, `AddInstrumentsResult`, `Instrument`, `InstrumentListResult`, `HistoryDepth`; `client.ts` holds `fetchHealth()`, `addInstruments()`, `retireInstrument()`, `listInstruments()`, `getHistoryDepth()`, `setHistoryDepth()`, and the `ApiError`/`ApiUnreachableError` types a non-2xx response or a failed fetch each map to. Same-origin only — the bundle is served by the API process, so every path is relative |
| `web/src/app/` | The application shell. `shell.tsx` renders the fixed navigation rail of four destinations — Coverage, Instruments, Runs, Settings — a main region, and the status region pinned to the rail's bottom; `routes.tsx` mounts the Instruments and Settings screens (see below) at their destinations, with Coverage and Runs still `ScreenPlaceholder`, plus a `/runs/:runId` child, a `/` redirect to `/coverage`, and a catch-all not-found rendered inside the frame. `status-region.tsx` polls health and renders the region, and exports the unreachable state the shell substitutes for the main region. See [The status region](#the-status-region) |
| `web/src/screens/instruments/` | The Instruments screen: one table with a lifecycle column (never two tables), single-symbol and bulk (`textarea`) add, and retirement through a `dialog` `confirm`. `index.tsx` composes the screen's `ScreenState`; `instrument-table.tsx` holds server-side search/filter and keyset "Load more" paging; `add-field.tsx` and `bulk-add.tsx` (with `parse-bulk-symbols.ts`) add instruments; `retire-dialog.tsx` confirms retirement; `start-action.tsx` renders the acquisition-run trigger `blocked` when history depth is unset; `badges.tsx` renders the active/retired lifecycle badge. See [Instruments and Settings screens](#instruments-and-settings-screens) |
| `web/src/screens/settings/` | The Settings screen: `index.tsx` composes the layout; `history-depth-form.tsx` reads and writes the history-depth setting with STD-UI-19-shaped validation errors; `credential-status.tsx` reports provider credential presence only, never the value, with a distinct icon/shape per state. See [Instruments and Settings screens](#instruments-and-settings-screens) |
| `design-system/` | Vendored `theme.css` design tokens, imported by `web/src/index.css` and mapped into Tailwind's scales by `tailwind.config.js` |
| `tests/unit/` | Tests needing no database |
| `tests/integration/` | Tests running against a real PostgreSQL 16 container |
| `tests/e2e/` | Playwright end-to-end specs, run by `npm run test:e2e` against a real API and PostgreSQL container started by `scripts/run-e2e-server.sh` |
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
shared, application-wide handler still names the right resource per route.

## Deterministic observation-value hashing

`src/factorflow/ingestion/hashing.py` exposes two pure functions for the later
observation writer. `canonical_json(value)` recursively accepts JSON-native
`None`, booleans, integers, strings, lists, and string-keyed dictionaries,
plus `Decimal`. It converts each `Decimal` to its exact string form, then emits
UTF-8 JSON with sorted keys and compact separators. Floats, non-string
dictionary keys, and every other unsupported type raise `TypeError`; no
`str()` or `repr()` fallback can silently create a misleading digest.

`value_hash(value)` returns `hashlib.sha256(canonical_json(value)).digest()` as
32 raw bytes. Equivalent dictionaries therefore hash identically regardless
of insertion order, while a changed supplied field changes the digest. The
function hashes every field the caller supplies: the future observation writer
is responsible for passing only observation values and excluding
`observed_on`, `run_id`, and `recorded_at`.

The canonical form deliberately renders a `Decimal` as a JSON string. A
`Decimal("1.10")` and the literal string `"1.10"` therefore have the same
canonical representation; callers must keep each field's Python type stable.
Changing the canonical form or digest algorithm after observations have been
stored is a data-compatibility change, because unchanged values would otherwise
receive new hashes and be appended again.

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
input and anything outside a plausible Unix-milliseconds magnitude.

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
in request URLs. Every initial and followed page request passes through
`RateLimitGovernor`, while `paging.follow_pages()` follows a present
`next_url` one page at a time and raises if a later page fails rather than
returning a partial range.

Reference reads use Massive's single-ticker endpoint. Daily-bar requests use
multiplier `1`, timespan `day`, inclusive ISO date bounds, and unadjusted bars.
Financial statements are read from the four statement endpoints; corporate
actions combine splits, dividends, IPOs, and ticker-change events. Ticker
events have no provider date-range parameter, so the client validates their
rows and applies the requested inclusive range locally. The client never calls
Massive's forward-looking market-status endpoint or ticker-list endpoint.

## Massive provider failure reasons

`src/factorflow/ingestion/massive/errors.py` also defines
`compose_failure_reason`, which turns one of the four typed `MassiveError`
subclasses into the safe, owner-visible text stored as
`run_instrument_result.reason` (CAP-001-E4-S6 is the consumer; no caller
wires it in yet). The composer takes the typed `error`, the `symbol`, the
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

`npm run test:e2e` runs the Playwright suite in `tests/e2e/` against a real
API and PostgreSQL container: `scripts/run-e2e-server.sh` (Playwright's
`webServer.command`) starts the container, applies migrations, builds the
interface bundle, and runs the API process on `127.0.0.1:8123` (or
`FACTORFLOW_API_PORT`), tearing both down after the run; `posttest:e2e`
removes the container by name as a backstop against a hard-killed teardown.
Needs Docker and Playwright's browsers installed (`npx playwright install`).

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
