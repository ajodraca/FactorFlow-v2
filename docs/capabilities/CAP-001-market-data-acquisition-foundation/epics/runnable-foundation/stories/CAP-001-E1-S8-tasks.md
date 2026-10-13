---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S8-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-12
updated: 2026-10-12
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.296"
  timestamp: 2026-10-13T04:40:00Z
  source_artifacts:
    - id: CAP-001-E1-S8
      version: "2"
    - id: CAP-001-component-design-runtime-config
      version: "14"
    - id: CAP-001-component-design-schema-migrator
      version: "7"
    - id: CAP-001-component-tests
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E1-S8 — Database URL Confinement and Migrations Packaged in the Distribution

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S8.md`
**Component**: `FactorFlow-v2` (modules `runtime-config`, `schema-migrator`)
**Branch**: planned on `usr/alvaro-de-jodra/CAP-001-stories`; coded on the story's own branch per `docs/branch-naming.md`
**Date**: 2026-10-12

## Summary

Two changes every later deployment step needs. (1) `DatabaseSettings` gains the H7 validator of `component-design-runtime-config.md` v14 section 2.3: plaintext only to loopback, every libpq route to another address refused, `sslmode=verify-full` required for any other host; `migrate_main` loads its URL through `DatabaseSettings()` instead of `os.environ` (`component-design-schema-migrator.md` v7 section 2.5), so all three database clients are confined before they connect. (2) The migrations move from the repository-root `migrations/` into `src/factorflow/db/migrations/` as package data, resolved by a public `MIGRATIONS_DIR` beside `migrate_main` (schema-migrator section 2.1, release blocker B1). The 15 test modules using `postgresql://unused/unused` switch to a loopback placeholder (backlog review v13 FINDING-53).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-13 | Password crosses no off-host plaintext channel, appears in no log or error | T005–T008, T011, T013 |
| AC-15 | The installed distribution's migrator finds and applies this build's migrations | T004, T010, T014, T016 |
| AC-16 | Refused URL or missing migrations stops the start; API never binds | T009, T012, T015 |
| DAC-E1-19 | Every client loads its URL through `DatabaseSettings`, which confines it before connecting | T003, T009, T012, T013, T015 |
| DAC-E1-20 | Wheel carries `factorflow/db/migrations/0001` to `0004`; `migrate_main` resolves them next to itself | T004, T010, T016 |
| DAC-E1-S8-1 | Loopback URL loads with any `sslmode` | T005, T013 |
| DAC-E1-S8-2 | Non-loopback or host-less URL without `verify-full` refused without echoing; with it, loads | T006, T013 |
| DAC-E1-S8-3 | Multi-host, `host`, `hostaddr`, `service`, or `PG*` variables refused | T007, T013 |
| DAC-E1-S8-4 | `localhost` resolving off-host refused | T008, T013 |
| DAC-E1-S8-5 | `migrate_main` exits 1 on refused or unset URL without connecting; loopback reaches `run_migrations` | T009, T015 |
| DAC-E1-S8-6 | `MIGRATIONS_DIR` resolves in the package; checksums unchanged | T010, T014 |
| DAC-E1-S8-7 | No code or test computes a repository-root `migrations/` path | T011, T014, T016 |
| DAC-E1-S8-8 | `ingestion_main` and the API lifespan refuse before connecting | T012, T015 |
| DAC-E1-S8-9 | Only `config/settings.py` reads `FACTORFLOW_DATABASE_URL` from the environment | T012, T015 |

## Phase 1: Setup

**Purpose**: Make the existing tests compatible with the coming validator, so the suite stays green except for the new tests.

- [x] T001 Replace `postgresql://unused/unused` with `postgresql://unused@127.0.0.1/unused` in the 15 modules the story lists: `tests/integration/test_api_binding.py`, `test_api_static_mount.py`; `tests/unit/test_api_coverage_routes.py`, `test_api_errors.py`, `test_api_instruments_error_mapping.py`, `test_api_instruments_query_mapping.py`, `test_api_isolation.py`, `test_api_no_secrets.py`, `test_api_request_id.py`, `test_api_request_id_redaction_composition.py`, `test_api_runs_routes.py`, `test_ingestion_e2e_main.py`, `test_ingestion_main.py`, `test_massive_tls.py`, `test_settings_base_url.py`. Leave assertions unchanged; `test_settings_base_url.py`'s exact `Settings()` messages (lines 208-213) must still match.
- [x] T002 Run `uv run pytest` and confirm green before any production change.

**Checkpoint**: Full suite green on loopback placeholders.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the confinement and the package-data layout.

### Mandatory Component Tests

Each carries its `# Implements TC-COMP-NNN` comment. Unit tests carry no `postgres` marker.

- [ ] T003 [P] Implement TC-COMP-391 in `tests/unit/test_database_url_all_clients.py` (new): with a loopback URL and `psycopg.connect`, `psycopg_pool.ConnectionPool` and `run_migrations` replaced by recording doubles, `migrate_main.main()`, the API lifespan (`with TestClient(create_app())`) and `ingestion_main.main()` (stop it at its first database call by having the `psycopg.connect` double raise a sentinel) each reach their database call with the configured URL.
- [ ] T004 [P] Implement TC-COMP-392 in `tests/unit/test_distribution_contents.py` (new): copy `src/` and `pyproject.toml` to `tmp_path`, run `uv build --wheel --offline` there (the offline pattern `test_release_excludes_test_paths.py` uses, DEC-0045), assert the wheel lists `factorflow/db/migrations/0001_extensions_owner_state.sql` to `0004_runs.sql` and nothing under `tests/`; then unpack the wheel into `tmp_path/site` and run the test interpreter in a subprocess with `tmp_path/site` first on `sys.path` (its dependencies, such as `psycopg`, come from the project environment) to print `factorflow.db.migrate_main.MIGRATIONS_DIR` and the `discover(MIGRATIONS_DIR)` versions, asserting the directory is `tmp_path/site/factorflow/db/migrations` and the versions are 1 to 4. This proves the installed layout resolves the files without depending on a network install. Mark the module `slow` if it exceeds the suite's usual runtime (pyproject marker exists). The stub `index.html` and `api/static` assertion are CAP-001-E1-S9's.
- [x] T005 [P] Implement TC-COMP-410 in `tests/unit/test_database_url_confinement.py` (new): `@127.0.0.1`, `@[::1]`, `@localhost` (resolution patched via `socket.getaddrinfo` to loopback only), each with no `sslmode` and `sslmode=disable`, load.
- [x] T006 [P] Implement TC-COMP-411 and TC-COMP-412 in the same module: `@db.example.com` and `@10.0.0.5` with no `sslmode`, `prefer` and `require`, and a host-less Unix-socket URL, raise `ConfigurationError` naming `FACTORFLOW_DATABASE_URL`, with neither the URL nor `p` in the message; with `sslmode=verify-full` they load.
- [x] T007 [P] Implement TC-COMP-413 and TC-COMP-414 in the same module: a loopback URL with `host=10.0.0.5`, `hostaddr=10.0.0.5`, `service=x`, or two hosts raises; a loopback URL raises while each of `PGHOST`, `PGHOSTADDR`, `PGSERVICE`, `PGSERVICEFILE` is set (`monkeypatch.setenv`).
- [x] T008 [P] Implement TC-COMP-415 in the same module: `localhost` resolving to `127.0.0.1` and `192.0.2.10` raises.
- [ ] T009 [P] Implement TC-COMP-416, TC-COMP-417 and TC-COMP-418 in `tests/unit/test_migrate_main_confinement.py` (new): with `psycopg.connect` patched to fail the test if called and `caplog` capturing `factorflow.db.migrator`, `main()` returns 1 for each refused URL of TC-COMP-416 and for an unset variable, with the `error` record naming the variable and containing neither URL nor password; with `run_migrations` recording, a loopback URL calls it once with that URL and `MIGRATIONS_DIR` and returns 0.
- [ ] T010 [P] Implement TC-COMP-419 by extending `tests/unit/test_migrator_discover.py`: `MIGRATIONS_DIR == Path(migrate_main.__file__).resolve().parent / "migrations"`, and `discover(MIGRATIONS_DIR)` returns versions 1 to 4 with these SHA-256 checksums, recorded before the move by running `discover` on the current `migrations/` and pasted as constants.
- [ ] T011 [P] Implement TC-COMP-420 in `tests/unit/test_migrations_location.py` (new): an AST/text scan of `src/`, `tests/` and `scripts/` finds no path expression ending in a top-level `migrations` directory (`parents[N] / "migrations"`, `"migrations/000"` as a path), the repository root has no `migrations/` directory, and `tests/fixtures/migrations_ok/` still exists.
- [ ] T012 [P] Implement TC-COMP-421, TC-COMP-422 and TC-COMP-423 in `tests/unit/test_database_url_all_clients.py`: with `FACTORFLOW_DATABASE_URL=postgresql://u:p@10.0.0.5/d` and `psycopg.connect` and `ConnectionPool` patched to fail if called, `ingestion_main.main()` returns non-zero and its reported message (stderr, `capsys`) names the variable without the URL or password; entering the API lifespan raises before a pool is constructed, with the same message property; an AST scan of `src/factorflow` finds `os.environ`/`os.getenv` reads of `FACTORFLOW_DATABASE_URL` (literal or via a module constant holding it) only in `config/settings.py`.

**Checkpoint**: New tests written and failing (no production code yet).

---

## Phase 3: Core Implementation

**Purpose**: The validator, the migrator's settings load, and the package move.

- [x] T013 Add `_confine_plaintext_to_loopback` (`model_validator(mode="after")`) to `DatabaseSettings` in `src/factorflow/config/settings.py`, per runtime-config section 2.3: parse `url.get_secret_value()` the way libpq does (`psycopg.conninfo.conninfo_to_dict`), refuse more than one host or a `host`, `hostaddr` or `service` parameter, refuse when `PGHOST`, `PGHOSTADDR`, `PGSERVICE` or `PGSERVICEFILE` is set; accept any `sslmode` when the host is exactly `127.0.0.1` or `::1`, or `localhost` whose every `socket.getaddrinfo` address is loopback (`ipaddress.ip_address(...).is_loopback`); otherwise require `sslmode=verify-full`. Raise `ValueError` with a message naming the rule and never the value, so `_EnvNamedSettings.__init__` re-raises it as `ConfigurationError` prefixed `FACTORFLOW_DATABASE_URL` (confirm the prefix: the field is `url` under prefix `FACTORFLOW_DATABASE_`; a model-level validator's error `loc` is empty, so the message must name the variable itself). (DAC-E1-19, DAC-E1-S8-1 to S8-4, AC-13)
- [ ] T014 Move the migrations: `git mv migrations/0001_extensions_owner_state.sql migrations/0002_observations.sql migrations/0003_coverage.sql migrations/0004_runs.sql migrations/README.md src/factorflow/db/migrations/`; content unchanged. In `src/factorflow/db/migrate_main.py` replace `_MIGRATIONS_DIR = ...parents[3] / "migrations"` with the public `MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"`. In `pyproject.toml` set `[tool.setuptools.package-data] factorflow = ["coverage/sql/*.sql", "db/migrations/*.sql"]`. Update every reference (schema-migrator section 2.1): `tests/conftest.py` (lines 23-27) and the test modules computing `parents[N] / "migrations"` — `tests/integration/test_api_coverage.py`, `test_api_health.py`, `test_api_pagination.py`, `test_api_runs.py`, `test_instrument_constraints.py`, `test_migration_0001.py`, `test_migration_idempotence.py`, `test_migrator_empty.py`, `test_observation_append.py`, `test_owner_setting.py`; `tests/unit/test_migration_0001_matches_design.py`, `test_migration_filenames.py`, `test_migrator_discover.py`, `test_runs_queries.py`, `test_schema_migrations_match_design.py`, `test_sql_is_append_only.py` — to import `MIGRATIONS_DIR`; `tests/unit/test_no_committed_secrets.py` `_SCANNED_PREFIXES` (replace `"migrations/"`, now covered by `"src/"`); the `migrations/000N_*.sql` comments in `src/factorflow/api/models.py`, `src/factorflow/runs/queries.py`, `web/src/api/types.ts`, `tests/e2e/support/acquisition.ts`, `tests/e2e/fixtures/coverage-seed.sql` and any other hit of `grep -rn "migrations/0" src web tests scripts`; the README's layout table (line 108) and any other `migrations/` mention; and remove `COPY migrations ./migrations` from the `Dockerfile` so the existing image still builds until CAP-001-E1-S9 rewrites it. (DAC-E1-20, DAC-E1-S8-6, DAC-E1-S8-7, AC-15)
- [ ] T015 In `src/factorflow/db/migrate_main.py` `main()`: construct `DatabaseSettings()` (import from `factorflow.config.settings`); on `ConfigurationError` log the error's message through `_log_failure(str(exc), version=None)` and return 1 without calling `run_migrations`; otherwise call `run_migrations(settings.url.get_secret_value(), MIGRATIONS_DIR)`. Remove the direct `os.environ.get` read and the docstring's deferral paragraph (lines 8-13). Confirm `ingestion_main` already catches the `ConfigurationError` raised while `Settings` builds its `database` default and that the API lifespan's `DatabaseSettings()` raises before `ConnectionPool(...)`; no change expected in either (story Implementation Notes). (DAC-E1-19, DAC-E1-S8-5, DAC-E1-S8-8, DAC-E1-S8-9, AC-16)

**Checkpoint**: Every Phase 2 test passes.

---

## Phase 4: Integration

**Purpose**: Confirm the whole system still migrates and runs from the new location.

- [ ] T016 Run `uv build` and the full `uv run pytest` (PostgreSQL-marked tests apply the migrations from `MIGRATIONS_DIR` through `tests/conftest.py`), then `npm ci`, `npm run build`, `npm run test:e2e` (`scripts/run-e2e-server.sh` runs `python -m factorflow.db.migrate_main` from the source checkout, which must now resolve the package directory). Run `npm run lint` and `npx tsc --noEmit` for the `web/src/api/types.ts` and `tests/e2e/support/acquisition.ts` comment edits.

**Checkpoint**: Python, TypeScript and Playwright suites green; the wheel carries the migrations.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [ ] T017 Run `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`; fix findings in touched files only.
- [ ] T018 After each TDD cycle in T003–T015 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-001-E1-S8-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

Hard edges already in `dependencies.yaml` for this story: CAP-001-E1-S2, CAP-001-E1-S3, CAP-001-E1-S6, CAP-001-E4-S5 (all done). No new edge.

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E1-S7 | soft | Edits 13 of the same test modules (its `base_url`), no shared production file; whichever merges second rebases |
| CAP-001-E1-S9 | reverse | Consumes `MIGRATIONS_DIR` (smoke check 2), the `db/migrations` package data, and rewrites the `Dockerfile` this plan trims; already a hard edge from E1-S9 to this story |

### Task Dependencies
- T001 → T002.
- T003–T012: depend on T002; parallel with each other. T010 records the checksums before T014 moves the files.
- T013: depends on T005–T008.
- T014: depends on T004, T010, T011.
- T015: depends on T003, T009, T012, T013.
- T016: depends on T013–T015.
- T017: depends on T016.
- T018: interleaved — after every TDD cycle, before the next begins.

### Parallel Opportunities
- Phase 2: T003–T012 span six test modules.
- Phase 3: T013 (settings) and T014 (move) touch different files; T015 follows both.

---

## Validation Plan

### Constitution-Defined Commands
- Install: `uv sync --all-extras`
- Build: `uv build`
- Test: `uv run pytest -m 'not postgres'`, then `uv run pytest`
- Lint: `uv run ruff check .`; `npm run lint`
- Format: `uv run ruff format --check .`; `npm run format`
- Types: `uv run mypy src`; `npx tsc --noEmit`
- End-to-end: `npm ci`, `npm run build`, `npm run test:e2e`

### Story-Specific Validation
- `unzip -l dist/factorflow-*.whl | grep db/migrations` lists the four SQL files.
- `grep -rn "FACTORFLOW_DATABASE_URL" src | grep -E "environ|getenv"` shows only `config/settings.py`.
- `test -d migrations` fails at the repository root.

## Notes

- **"Logged message" for ingestion (resolved by precedence).** DAC-E1-S8-8 says the message is logged; `ingestion_main` reports configuration errors on stderr because logging is configured only after settings load (DAC-E1-7, existing behaviour). The requirement's substance is the message's content (names the variable, no value); TC-COMP-421 asserts it on stderr. Flagged for the story's next revision (backlog review v14 FINDING-3).
- **Settings default factory.** `Settings.database` is built by `Field(default_factory=DatabaseSettings)`; T015 confirms the `ConfigurationError` raised there reaches `ingestion_main`'s handler unwrapped. If Pydantic wraps it, `Settings` must catch and re-raise it as `ConfigurationError` naming the variable; T012's test detects either outcome.
- **Dockerfile line.** The story says CAP-001-E1-S9 removes the `migrations/` copy when it rewrites the file. Removing that one line here keeps `docker build` valid between the two merges and does not conflict with E1-S9, which hard-depends on this story and rebases onto it. No AC is affected.
- **Package-data entry.** Only `db/migrations/*.sql` is added; `README.md` in the moved directory is documentation and is not shipped. `api/static/**/*` is CAP-001-E1-S9's.
- **Shared test modules.** CAP-001-E1-S7 changes the `TestClient` `base_url` in 13 of the modules T001 edits. There is no code dependency either way; whichever story merges second rebases onto the first.
- **No TDD exception.** Every behaviour-changing commit is covered by T018.
