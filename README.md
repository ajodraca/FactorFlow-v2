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
| `migrations/` | Numbered, forward-only SQL migrations. See `migrations/README.md` for the conventions |
| `src/factorflow/` | The `factorflow` package (`src/` layout) |
| `src/factorflow/db/` | Database definitions. `applied_migrations.py` exports `APPLIED_MIGRATIONS_DDL`, the migration-tracking table the schema migrator creates before applying the first migration file |
| `tests/unit/` | Tests needing no database |
| `tests/integration/` | Tests running against a real PostgreSQL 16 container |
| `docs/` | Constitution, capability specifications, and designs |

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
