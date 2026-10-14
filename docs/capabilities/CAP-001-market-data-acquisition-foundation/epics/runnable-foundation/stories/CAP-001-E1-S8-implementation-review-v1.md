---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S8-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-14
updated: 2026-10-14
story_id: "CAP-001-E1-S8"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S8.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S8-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-14T15:00:21Z"
reviewed_head: "f85817a401696835c533257464538084faf65045"
review_base: "73b1ea5c58544c9359ec778db1cbdccd5f23096c"
reviewed_state_revision: "sha256:88822e99b0352babd5f9e3a44657e59c8adba42e4bc7fe598cf20fc6a862205b"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E1-S8
    artifact_version: 2
    content_revision: sha256:ea34c5e319ca863d4f98a48dd2980b6d6fa787ae4921a818d4a9f12a99f8eeb9
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5-medium
  tool: Devin
  tool_version: unknown
  timestamp: 2026-10-14T15:00:21Z
  source_artifacts:
    - id: CAP-001-E1-S8
      version: "2 (sha256:ea34c5e319ca863d4f98a48dd2980b6d6fa787ae4921a818d4a9f12a99f8eeb9)"
    - id: CAP-001-E1-S8-tasks
      version: "1 (sha256:2b3e375ef369d922056d1dbe3b717b93a01ae7425fdd6ee4b7f86b8b5c8ae9d6)"
    - id: CAP-001-E1-S8-tdd-evidence
      version: "1"
    - id: CAP-001-component-design-runtime-config
      version: "14"
    - id: CAP-001-component-design-schema-migrator
      version: "7"
    - id: CAP-001-component-tests
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S8 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 14/14 satisfied |
| Planned tasks | 18/18 verified |
| Required validation | 16/16 passed |

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2 · **total 2**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | LOW | `DatabaseSettings._confine_plaintext_to_loopback` is a model validator (`error["loc"] == ()`), so `ConfigurationError`'s message starts with Pydantic's `Value error, FACTORFLOW_DATABASE_URL: …` prefix rather than the variable name |
| IR-002 | LOW | `tests/unit/test_distribution_contents.py` is not marked `slow`; runtime-config section 7 says it is marked `slow`, while task T004 made the marker conditional on runtime (~0.4 s) |

Both parts of the story are in place and match their designs:

1. **H7 database URL confinement** (`src/factorflow/config/settings.py:DatabaseSettings._confine_plaintext_to_loopback`, `src/factorflow/db/migrate_main.py:main`). `DatabaseSettings` parses the URL with `psycopg.conninfo.conninfo_to_dict` — libpq's own parser — refuses `PGHOST`, `PGHOSTADDR`, `PGSERVICE` and `PGSERVICEFILE` (even when set to `""`), refuses `hostaddr` and `service` parameters, scans the URI query on libpq's terms (`_libpq_uri_query_keys`, which gives `#` no fragment meaning and URL-decodes parameter names) to refuse a `host` query parameter, refuses multi-host strings, accepts any `sslmode` for `127.0.0.1`, `::1`, or `localhost` whose every `socket.getaddrinfo` address is loopback, and requires `sslmode=verify-full` for any other host or a host-less URL. `migrate_main.main()` loads its URL through `DatabaseSettings()` and returns 1 on `ConfigurationError` before `psycopg.connect` is called. Only `config/settings.py` reads `FACTORFLOW_DATABASE_URL` from the environment.
2. **Migrations as package data (B1)** (`src/factorflow/db/migrations/0001_*.sql` to `0004_*.sql` and `README.md`, `migrate_main.MIGRATIONS_DIR`, `pyproject.toml`). All five files were moved with `git mv` (`R100`, byte-identical; SHA-256 checksums unchanged). `uv build` includes the four SQL files in the wheel, an unpacked wheel resolves `MIGRATIONS_DIR` inside `site/factorflow/db/migrations` and discovers versions 1 to 4, and no file in `src/`, `tests/` or `scripts/` computes a repository-root `migrations/` path.

The story branch `usr/alvaro-de-jodra/CAP-001-E1-S8` (`f89b8c0`) was merged into `main` by PR #112 (`9696b74`) before this review. Because PR #113 (E1-S7) and PR #114 (E1-S7 reviews and doc sync) then landed on `main` and touched 14 of the 15 test modules T001 edited plus `README.md`, this review is taken at current `origin/main` (`f85817a`) against the story's merge base `73b1ea5`. That way `reviewed_state_revision` matches `HEAD` and `pipeline-state.py check --stage doc-sync` is immediately `READY`. Outside those 14 shared test modules and `README.md`, every file in the 57-file S8 change set (`73b1ea5..9696b74`) is byte-identical between `9696b74` and `f85817a`, and S7's changes in the 14 shared modules were already reviewed in `CAP-001-E1-S7-implementation-review-v2.md`.

Independent mutation checks confirm the new tests fail when the production checks are weakened: disabling the loopback/env/query helpers in `settings.py` fails 22 of 38 tests in `test_database_url_confinement.py`; replacing `_libpq_uri_query_keys` with `urlsplit` fails 3 of 38 (the `#?host=` bypass cases); reverting `migrate_main.main()` to `os.environ.get` fails 5 of 7 in `test_migrate_main_confinement.py`.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S8.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S8-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | detached HEAD at `origin/main` (`f85817a`), containing PR #112 (`9696b74`, merge of `usr/alvaro-de-jodra/CAP-001-E1-S8` at `f89b8c0`) |
| HEAD | `f85817a401696835c533257464538084faf65045` |
| Review base | `--base-ref 73b1ea5` (`usr/alvaro-de-jodra/CAP-001-stories`, the branch base of `usr/alvaro-de-jodra/CAP-001-E1-S8`): `73b1ea5c58544c9359ec778db1cbdccd5f23096c` |
| Working tree | clean (no staged, unstaged or untracked non-ignored files) before and after validation |
| Changed files reviewed | 57 in the S8 change set (`73b1ea5..9696b74`), verified at `f85817a` |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/config/settings.py` | modified | DAC-E1-19, DAC-E1-S8-1 to S8-4, AC-13; T013 |
| `src/factorflow/db/migrate_main.py` | modified | DAC-E1-19, DAC-E1-20, DAC-E1-S8-5, DAC-E1-S8-6, AC-15, AC-16; T014, T015 |
| `src/factorflow/db/migrations/0001_extensions_owner_state.sql` | renamed (`R100` from `migrations/`) | DAC-E1-20, DAC-E1-S8-6, AC-15; T014 |
| `src/factorflow/db/migrations/0002_observations.sql` | renamed (`R100` from `migrations/`) | DAC-E1-20, DAC-E1-S8-6, AC-15; T014 |
| `src/factorflow/db/migrations/0003_coverage.sql` | renamed (`R100` from `migrations/`) | DAC-E1-20, DAC-E1-S8-6, AC-15; T014 |
| `src/factorflow/db/migrations/0004_runs.sql` | renamed (`R100` from `migrations/`) | DAC-E1-20, DAC-E1-S8-6, AC-15; T014 |
| `src/factorflow/db/migrations/README.md` | renamed (`R100` from `migrations/`) | DAC-E1-20; T014 |
| `pyproject.toml` | modified | DAC-E1-20, AC-15; T014 (`"db/migrations/*.sql"` in package-data) |
| `Dockerfile` | modified | DAC-E1-S8-7; T014 (removes `COPY migrations ./migrations`) |
| `README.md` | modified | Story Description; T014 (`src/factorflow/db/migrations/` layout row) |
| `src/factorflow/api/models.py` | modified | Story Description; T014 (comment path update) |
| `src/factorflow/runs/queries.py` | modified | Story Description; T014 (two comment path updates) |
| `web/src/api/types.ts` | modified | Story Description; T014 (two comment path updates) |
| `tests/e2e/support/acquisition.ts` | modified | Story Description; T014 (comment path update) |
| `tests/e2e/fixtures/coverage-seed.sql` | modified | Story Description; T014 (comment path update) |
| `tests/fixtures/migrations_ok/0001_extensions_owner_state.sql` | modified (symlink target) | DAC-E1-S8-7; T014 — deviation recorded in the TDD evidence |
| `tests/conftest.py` | modified | DAC-E1-S8-7; T014 (imports `MIGRATIONS_DIR`) |
| `tests/unit/test_database_url_confinement.py` | added | DAC-E1-S8-1 to S8-4, AC-13; T005–T008 |
| `tests/unit/test_migrate_main_confinement.py` | added | DAC-E1-S8-5, AC-13, AC-16; T009 |
| `tests/unit/test_database_url_all_clients.py` | added | DAC-E1-19, DAC-E1-S8-8, DAC-E1-S8-9; T003, T012 |
| `tests/unit/test_distribution_contents.py` | added | DAC-E1-20, AC-15; T004 |
| `tests/unit/test_migrations_location.py` | added | DAC-E1-S8-7; T011 |
| `tests/unit/test_migrator_discover.py` | modified | DAC-E1-S8-6, DAC-E1-S8-7; T010, T014 |
| `tests/unit/test_no_committed_secrets.py` | modified | Story Description; T014 (`_SCANNED_PREFIXES` drops `"migrations/"`, now under `"src/"`) |
| `tests/unit/test_migration_0001_matches_design.py` | modified | DAC-E1-S8-7; T014 |
| `tests/unit/test_migration_filenames.py` | modified | DAC-E1-S8-7; T014 |
| `tests/unit/test_runs_queries.py` | modified | DAC-E1-S8-7; T014 |
| `tests/unit/test_schema_migrations_match_design.py` | modified | DAC-E1-S8-7; T014 |
| `tests/unit/test_sql_is_append_only.py` | modified | DAC-E1-S8-7; T014 |
| `tests/integration/test_api_coverage.py` | modified | DAC-E1-S8-7; T014 |
| `tests/integration/test_api_health.py` | modified | DAC-E1-S8-7; T014 |
| `tests/integration/test_api_pagination.py` | modified | DAC-E1-S8-7; T014 |
| `tests/integration/test_api_runs.py` | modified | DAC-E1-S8-7; T014 |
| `tests/integration/test_instrument_constraints.py` | modified | DAC-E1-S8-7; T014 |
| `tests/integration/test_migration_0001.py` | modified | DAC-E1-S8-7; T014 |
| `tests/integration/test_migration_idempotence.py` | modified | DAC-E1-S8-7; T014 |
| `tests/integration/test_migrator_empty.py` | modified | DAC-E1-S8-7; T014 |
| `tests/integration/test_observation_append.py` | modified | DAC-E1-S8-7; T014 |
| `tests/integration/test_owner_setting.py` | modified | DAC-E1-S8-7; T014 |
| `tests/integration/test_api_binding.py` | modified | Story Description; T001 |
| `tests/integration/test_api_static_mount.py` | modified | Story Description; T001 |
| `tests/unit/test_api_coverage_routes.py` | modified | Story Description; T001 |
| `tests/unit/test_api_errors.py` | modified | Story Description; T001 |
| `tests/unit/test_api_instruments_error_mapping.py` | modified | Story Description; T001 |
| `tests/unit/test_api_instruments_query_mapping.py` | modified | Story Description; T001 |
| `tests/unit/test_api_isolation.py` | modified | Story Description; T001 |
| `tests/unit/test_api_no_secrets.py` | modified | Story Description; T001 |
| `tests/unit/test_api_request_id.py` | modified | Story Description; T001 |
| `tests/unit/test_api_request_id_redaction_composition.py` | modified | Story Description; T001 |
| `tests/unit/test_api_runs_routes.py` | modified | Story Description; T001 |
| `tests/unit/test_ingestion_e2e_main.py` | modified | Story Description; T001 |
| `tests/unit/test_ingestion_main.py` | modified | Story Description; T001 |
| `tests/unit/test_massive_tls.py` | modified | Story Description; T001 |
| `tests/unit/test_settings_base_url.py` | modified | Story Description; T001 |
| `docs/.../stories/CAP-001-E1-S8.md` | modified | Status to `in-review`; T016–T018 |
| `docs/.../stories/CAP-001-E1-S8-tasks.md` | modified | Task ticks; T001–T018 |
| `docs/.../stories/CAP-001-E1-S8-tdd-evidence.yaml` | added | T018 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 | SATISFIED | `settings.py:93-145` `_confine_plaintext_to_loopback` raises fixed rule strings naming `_DATABASE_URL_VAR` and never the URL or password; `_EnvNamedSettings` calls `exc.errors(include_input=False)` | `test_database_url_confinement.py` (`_assert_refused` checks `url not in message` and `_PASSWORD not in message` across all 28 refusal cases); `test_migrate_main_confinement.py` (TC-COMP-416); `test_database_url_all_clients.py` (TC-COMP-421, TC-COMP-422) | Plaintext off-host channels are refused before connecting, and no failure echoes the URL or `s3cretpw`. |
| AC-15 | SATISFIED | `migrate_main.py:34` `MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"`; `pyproject.toml:38` `"db/migrations/*.sql"` | `test_distribution_contents.py` (TC-COMP-392); `test_migrator_discover.py` (TC-COMP-419); `tests/conftest.py` + PostgreSQL integration suite | Both a checkout and an unpacked wheel resolve the four migrations and apply them cleanly. |
| AC-16 | SATISFIED | `migrate_main.py:169-174` catches `ConfigurationError` and returns 1 before `run_migrations`; `Dockerfile` chains `migrate_main && exec ... app_main` | `test_migrate_main_confinement.py` (TC-COMP-416, TC-COMP-417); `test_database_url_all_clients.py` (TC-COMP-421, TC-COMP-422) | A refused or unset URL returns 1 without calling `psycopg.connect`. |
| DAC-E1-19 | SATISFIED | `migrate_main.py:170`, `api/app.py` lifespan, and `ingestion_main.py` via `Settings.database` all instantiate `DatabaseSettings` before opening a connection | `test_database_url_all_clients.py:test_all_three_clients_reach_their_database_call_on_a_loopback_url` (TC-COMP-391), plus TC-COMP-416, 421, 422, 423 | All three database clients load through `DatabaseSettings`. |
| DAC-E1-20 | SATISFIED | `src/factorflow/db/migrations/0001_*.sql`..`0004_*.sql`; `pyproject.toml:38`; `migrate_main.py:34` | `test_distribution_contents.py` (TC-COMP-392); `unzip -l` on built wheel | Wheel lists all four SQL files under `factorflow/db/migrations/` and nothing under `tests/`. |
| DAC-E1-S8-1 | SATISFIED | `settings.py:163-178` `_is_loopback_database_host`: `127.0.0.1`, `::1`, or `localhost` whose every `socket.getaddrinfo` address has `ip_address(...).is_loopback` | `test_database_url_confinement.py:test_loopback_url_loads_with_any_sslmode` (TC-COMP-410, 6 cases) | Tested with no `sslmode` and `sslmode=disable`. `%zone` IPv6 suffixes are stripped before `ip_address`. |
| DAC-E1-S8-2 | SATISFIED | `settings.py:139-143`: non-loopback or empty host requires `params.get("sslmode") == "verify-full"` | `test_non_loopback_or_hostless_url_without_verify_full_is_refused` (TC-COMP-411, 8 cases) and `test_non_loopback_or_hostless_url_with_verify_full_loads` (TC-COMP-412, 3 cases) | Covers `@db.example.com`, `@10.0.0.5`, and host-less `@/d` across absent, `prefer`, `require`, and `verify-full`. |
| DAC-E1-S8-3 | SATISFIED | `settings.py:106-136`: refuses `PGHOST`/`PGHOSTADDR`/`PGSERVICE`/`PGSERVICEFILE` in `os.environ`, `hostaddr` or `service` in `conninfo_to_dict`, `"host"` in `_libpq_uri_query_keys(url)`, and `"," in host` | `test_loopback_url_with_another_address_route_is_refused` (TC-COMP-413, 12 cases incl. `#` and `%73` bypasses) and `test_loopback_url_is_refused_while_a_libpq_address_variable_is_set` (TC-COMP-414, 8 cases incl. empty string) | Independent probing confirmed parity with libpq on `#` in password/path, percent-encoded `ho%73t`, `?host=` with no `/dbname`, and keyword/value conninfo strings. |
| DAC-E1-S8-4 | SATISFIED | `settings.py:174-177`: `all(ip_address(...).is_loopback for address in addresses)` | `test_localhost_resolving_off_host_is_refused` (TC-COMP-415) | `127.0.0.1` + `192.0.2.10` raises `ConfigurationError` naming `sslmode=verify-full` without the URL or password. |
| DAC-E1-S8-5 | SATISFIED | `migrate_main.py:169-177`: `DatabaseSettings()` in `try`, `_log_failure(str(exc), version=None)` + `return 1` on `ConfigurationError`, else `run_migrations(settings.url.get_secret_value(), MIGRATIONS_DIR)` | `test_migrate_main_confinement.py`: TC-COMP-416 (5 refused cases), TC-COMP-417 (unset), TC-COMP-418 (loopback reaches `run_migrations`) | `_log_failure` emits at `ERROR` on `factorflow.db.migrator`. `psycopg.connect` is patched to `pytest.fail` and is never called on refusal. |
| DAC-E1-S8-6 | SATISFIED | `migrate_main.py:34` `MIGRATIONS_DIR`; `R100` renames of `0001`–`0004` | `test_migrator_discover.py:test_migrations_dir_resolves_inside_the_package_with_unchanged_checksums` (TC-COMP-419); `test_distribution_contents.py` (TC-COMP-392) | All four SHA-256 checksums match `_CHECKSUMS_BEFORE_MOVE`. |
| DAC-E1-S8-7 | SATISFIED | All 17 test files (`conftest.py` + 16 modules) import `MIGRATIONS_DIR`; `Dockerfile` drops `COPY migrations`; comments updated | `test_migrations_location.py` (TC-COMP-420): scans `.py`, `.sh`, `.ts`, `.tsx`, `.sql` across `src/`, `tests/`, `scripts/` and checks `not (REPO_ROOT / "migrations").exists()` | `tests/fixtures/migrations_ok/` still exists and its `0001` symlink resolves to the package migration. |
| DAC-E1-S8-8 | SATISFIED | `ingestion_main.py:main()` catches `ConfigurationError` from `Settings()` before connecting; `api/app.py` lifespan calls `DatabaseSettings()` before `ConnectionPool` | `test_database_url_all_clients.py`: `test_ingestion_exits_nonzero_on_a_refused_url_before_connecting` (TC-COMP-421) and `test_api_startup_fails_on_a_refused_url_before_opening_a_pool` (TC-COMP-422) | Note in task plan: `ingestion_main` reports start-time `ConfigurationError` on stderr (before logging is configured, DAC-E1-7), which TC-COMP-421 asserts. |
| DAC-E1-S8-9 | SATISFIED | `migrate_main.py` no longer imports `os`; only `config/settings.py:386` (redaction filter) reads `_DATABASE_URL_VAR` from `os.environ` | `test_database_url_all_clients.py:test_only_settings_reads_the_database_url_from_the_environment` (TC-COMP-423) and `test_the_source_scan_detects_each_read_form` (11 synthetic forms) | Verified by both AST scan and `grep -rn "FACTORFLOW_DATABASE_URL" src`. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | 15 listed test modules updated from `postgresql://unused/unused` to `postgresql://unused@127.0.0.1/unused` (commit `6e45759`) | `grep -rn "postgresql://unused/unused" tests/` returns no hits; `test_settings_base_url.py` assertions unchanged. |
| T002 | complete | VERIFIED | TDD evidence baseline: 934 passed before and after T001 | Historical baseline recorded in `CAP-001-E1-S8-tdd-evidence.yaml`. |
| T003 | complete | VERIFIED | `tests/unit/test_database_url_all_clients.py:test_all_three_clients_reach_their_database_call_on_a_loopback_url` (`# Implements TC-COMP-391`) | In the merged tree, `TestClient(api_app.create_app())` enters the lifespan without sending an HTTP request, so S7's middleware is not triggered. |
| T004 | complete | VERIFIED | `tests/unit/test_distribution_contents.py` (`# Implements TC-COMP-392`, two tests) | Copies `src/` (excluding `*.egg-info`) and `pyproject.toml` to `tmp_path`, builds offline wheel, checks contents and unpacked `MIGRATIONS_DIR` via subprocess. Not marked `slow` (runs in ~0.4 s; see IR-002). |
| T005 | complete | VERIFIED | `test_database_url_confinement.py:test_loopback_url_loads_with_any_sslmode` (`# Implements TC-COMP-410`) | — |
| T006 | complete | VERIFIED | `test_database_url_confinement.py`: TC-COMP-411 and TC-COMP-412 tests | — |
| T007 | complete | VERIFIED | `test_database_url_confinement.py`: TC-COMP-413 and TC-COMP-414 tests | Includes `#` fragment-hiding, `%73` percent-encoding, keyword conninfo, and empty-string `PG*` env vars. |
| T008 | complete | VERIFIED | `test_database_url_confinement.py:test_localhost_resolving_off_host_is_refused` (`# Implements TC-COMP-415`) | — |
| T009 | complete | VERIFIED | `tests/unit/test_migrate_main_confinement.py`: TC-COMP-416, TC-COMP-417, TC-COMP-418 | — |
| T010 | complete | VERIFIED | `tests/unit/test_migrator_discover.py:test_migrations_dir_resolves_inside_the_package_with_unchanged_checksums` (`# Implements TC-COMP-419`) | Pinned SHA-256 digests for versions 1 to 4. |
| T011 | complete | VERIFIED | `tests/unit/test_migrations_location.py` (`# Implements TC-COMP-420`, plus positive/negative regex self-tests) | — |
| T012 | complete | VERIFIED | `tests/unit/test_database_url_all_clients.py`: TC-COMP-421, TC-COMP-422, TC-COMP-423 + scanner self-test | — |
| T013 | complete | VERIFIED | `src/factorflow/config/settings.py:93-178` (`_confine_plaintext_to_loopback`, `_libpq_uri_query_keys`, `_is_loopback_database_host`) | Uses `conninfo_to_dict`; see IR-001 on the `Value error, ` message prefix. |
| T014 | complete | VERIFIED | `git mv` of 5 files into `src/factorflow/db/migrations/`; `MIGRATIONS_DIR` in `migrate_main.py`; `pyproject.toml` package-data; `Dockerfile`; `README.md`; `conftest.py` + 16 test modules; `test_no_committed_secrets.py`; comments in `models.py`, `queries.py`, `types.ts`, `acquisition.ts`, `coverage-seed.sql`; symlink in `tests/fixtures/migrations_ok/` | Every file named in the story and task plan was updated. |
| T015 | complete | VERIFIED | `src/factorflow/db/migrate_main.py:169-177`; deferral paragraph and `import os` removed | Confirmed `Settings.database` default factory propagates `ConfigurationError` unwrapped to `ingestion_main.main()`. |
| T016 | complete | VERIFIED | Re-run by this review: `uv build`, `uv run pytest` (1031 passed), `npm ci`, `npm run build`, `npm run test:e2e` (18 passed), `npm run lint`, `npx tsc --noEmit` | — |
| T017 | complete | VERIFIED | Re-run: `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` all exit 0 | — |
| T018 | complete | VERIFIED | `CAP-001-E1-S8-tdd-evidence.yaml`: 3 cycles (`database-url-confinement` → `e44f1f5`, `migrations-as-package-data` → `c8dd959`, `all-clients-confined` → `7453d5d`), each `APPROVED` and `drift_detected: false` with `diff_sha256` | — |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_all_three_clients_reach_their_database_call_on_a_loopback_url` / TC-COMP-391 | ADEQUATE | Runs real `migrate_main.main()`, `TestClient(create_app())` lifespan, and `ingestion_main.main()` with recording doubles; asserts each receives `_LOOPBACK_URL` | none |
| `test_wheel_carries_the_migrations_and_nothing_under_tests`, `test_installed_layout_resolves_its_migrations` / TC-COMP-392 | ADEQUATE | Copies `src/` without `*.egg-info` to `tmp_path`, builds wheel offline, checks zip entries, extracts wheel and runs a subprocess importing from the extracted site to verify `MIGRATIONS_DIR` and `discover()` versions 1–4 | none |
| `test_loopback_url_loads_with_any_sslmode` / TC-COMP-410 | ADEQUATE | Parametrised over `127.0.0.1`, `[::1]`, `localhost` (with `socket.getaddrinfo` patched) × `""` and `?sslmode=disable` | none |
| `test_non_loopback_or_hostless_url_without_verify_full_is_refused` / TC-COMP-411 | ADEQUATE | 8 cases (`db.example.com`, `10.0.0.5`, host-less) across absent/`prefer`/`require`; asserts variable name, `"sslmode=verify-full"`, and absence of URL and password | none |
| `test_non_loopback_or_hostless_url_with_verify_full_loads` / TC-COMP-412 | ADEQUATE | 3 cases load with `sslmode=verify-full` | none |
| `test_loopback_url_with_another_address_route_is_refused` / TC-COMP-413 | ADEQUATE | 12 cases covering `host=`, `hostaddr=`, `service=`, comma multi-host, `#` in password or path before query, `%73` percent-encoded `host`, and keyword/value conninfo | none |
| `test_loopback_url_is_refused_while_a_libpq_address_variable_is_set` / TC-COMP-414 | ADEQUATE | 4 `PG*` vars × non-empty and empty `""` values; asserts var name, rule text, and no value/password | none |
| `test_localhost_resolving_off_host_is_refused` / TC-COMP-415 | ADEQUATE | Mixed `127.0.0.1` + `192.0.2.10` resolution refused | none |
| `test_refused_url_exits_1_without_connecting` / TC-COMP-416 | ADEQUATE | 5 refused cases; `psycopg.connect` patched to `pytest.fail`; checks `ERROR` log on `factorflow.db.migrator` for var name and no URL/password | none |
| `test_unset_url_exits_1_without_connecting` / TC-COMP-417 | ADEQUATE | Unset env returns 1, logs variable name, never connects | none |
| `test_loopback_url_reaches_run_migrations` / TC-COMP-418 | ADEQUATE | Asserts `run_migrations` called once with `(url, MIGRATIONS_DIR)` and returns 0 | none |
| `test_migrations_dir_resolves_inside_the_package_with_unchanged_checksums` / TC-COMP-419 | ADEQUATE | Checks `MIGRATIONS_DIR` path and exact SHA-256 digests for versions 1–4 | none |
| `test_nothing_resolves_a_repository_root_migrations_directory`, `test_repository_root_has_no_migrations_directory` / TC-COMP-420 | ADEQUATE | Scans `.py`/`.sh`/`.ts`/`.tsx`/`.sql`, backed by 8 positive and 4 negative regex self-tests; verifies root `migrations/` is gone and fixture symlink resolves into package | none |
| `test_ingestion_exits_nonzero_on_a_refused_url_before_connecting` / TC-COMP-421 | ADEQUATE | `psycopg.connect` patched to `pytest.fail`; checks non-zero return and stderr content | none |
| `test_api_startup_fails_on_a_refused_url_before_opening_a_pool` / TC-COMP-422 | ADEQUATE | `ConnectionPool` patched to `pytest.fail`; checks raised error content | none |
| `test_only_settings_reads_the_database_url_from_the_environment` / TC-COMP-423 | ADEQUATE | AST scan of `src/factorflow` backed by 11-form self-test (`os.environ[...]`, `.get`, `.pop`, `os.getenv`, imported `environ`/`getenv`, `key=`, local and imported constants) | none |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv sync --all-extras` | `/tmp/ff-e1s7/FactorFlow-v2` at `f85817a` | 0 | PASS | — |
| `uv run ruff check .` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | 190 files already formatted |
| `uv run mypy src` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | No issues in 47 source files |
| `npm run lint` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | Biome checked 97 files |
| `npm run format` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | Biome checked 97 files |
| `npx tsc --noEmit` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | — |
| `uv run pytest tests/unit/test_database_url_confinement.py tests/unit/test_migrate_main_confinement.py tests/unit/test_database_url_all_clients.py tests/unit/test_distribution_contents.py tests/unit/test_migrations_location.py tests/unit/test_migrator_discover.py -q` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | 74 passed in 0.92s |
| `uv run pytest -m 'not postgres' -q` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | 757 passed, 274 deselected |
| `uv run pytest -q` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | 1031 passed (PostgreSQL-marked included; Docker 28.3.2) |
| `npm ci` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | — |
| `npm run build` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | Bundle written to git-ignored `src/factorflow/api/static/` |
| `npm run test:e2e` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | 18 passed (2.9m) |
| `uv build --out-dir /tmp/ir-e1s8-dist && unzip -l /tmp/ir-e1s8-dist/factorflow-*.whl \| grep db/migrations` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | Lists `0001_extensions_owner_state.sql` to `0004_runs.sql` under `factorflow/db/migrations/` |
| `grep -rn "FACTORFLOW_DATABASE_URL" src \| grep -E "environ\|getenv"` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | Only `src/factorflow/config/settings.py:386` (via `_DATABASE_URL_VAR`) |
| `test ! -d migrations` | `/tmp/ff-e1s7/FactorFlow-v2` | 0 | PASS | Repository-root `migrations/` directory is absent |

### Validation Side Effects

- Before: `git status --porcelain` empty; state revision `sha256:88822e99…205b`.
- After: `git status --porcelain` empty; state revision unchanged (`sha256:88822e99…205b`). Temporary `/tmp/ir-e1s8-dist` and `/tmp/ir_e1s8_mutant.py` were removed.
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — Model-validator `ValueError` in `DatabaseSettings` produces a `Value error, FACTORFLOW_DATABASE_URL: …` prefix

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S8-2, DAC-E1-S8-3
- **Tasks**: T013
- **Files**: `src/factorflow/config/settings.py:67-82` (`_EnvNamedSettings.__init__`), `src/factorflow/config/settings.py:93-145` (`DatabaseSettings._confine_plaintext_to_loopback`)
- **Claim challenged**: Task T013 notes: "Raise `ValueError` with a message naming the rule and never the value, so `_EnvNamedSettings.__init__` re-raises it as `ConfigurationError` prefixed `FACTORFLOW_DATABASE_URL` (confirm the prefix: the field is `url` under prefix `FACTORFLOW_DATABASE_`; a model-level validator's error `loc` is empty, so the message must name the variable itself)."
- **Observed evidence**: Because `_confine_plaintext_to_loopback` is a `@model_validator(mode="after")` raising `ValueError(f"{_DATABASE_URL_VAR}: ...")`, Pydantic v2 sets `error["loc"] = ()` and `error["msg"] = "Value error, FACTORFLOW_DATABASE_URL: ..."`. `_EnvNamedSettings` leaves `message` as-is when `var_names` is empty, so `str(exc)` is `"Value error, FACTORFLOW_DATABASE_URL: <rule>"` (unlike `MassiveSettings._validate_base_url`, which raises `PydanticCustomError("base_url_invalid", ...)` on a `@field_validator("base_url")` so `error["msg"]` has no `"Value error, "` prefix and `error["loc"] == ("base_url",)` prefixes the variable name cleanly).
- **Expected evidence/behavior**: Every acceptance criterion (AC-13, DAC-E1-S8-2, DAC-E1-S8-3, DAC-E1-S8-5, DAC-E1-S8-8) requires the message to name `FACTORFLOW_DATABASE_URL` and the rule and omit the URL and password — which it does. Raising `PydanticCustomError` (or making the validator a `@field_validator("url")` as on `MassiveSettings`) would omit the redundant `"Value error, "` prefix.
- **Impact**: Cosmetic prefix on the error message; all acceptance criteria and tests pass.
- **Required remediation**: Optional in a future touch of `settings.py`: raise `PydanticCustomError` in `_confine_plaintext_to_loopback` (or strip a leading `"Value error, "` in `_EnvNamedSettings`). Not blocking.

### IR-002 — `test_distribution_contents.py` is not marked `slow` as `component-design-runtime-config.md` section 7 states

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-20
- **Tasks**: T004
- **Files**: `tests/unit/test_distribution_contents.py:1-83`; `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/component-design-runtime-config.md:1342-1343`
- **Claim challenged**: `component-design-runtime-config.md` section 7 states: "`test_distribution_contents.py` runs `uv build` into a temporary directory, so it is marked `slow`."
- **Observed evidence**: Task T004 phrased this as "Mark the module `slow` if it exceeds the suite's usual runtime (pyproject marker exists)." Because `uv build --wheel --offline` completes in ~0.4 s, the coding agent left the module unmarked, so it runs in every default and `-m 'not postgres'` invocation.
- **Expected evidence/behavior**: Running the test on every invocation is strictly stronger than gating it behind `slow`, and no acceptance criterion requires the marker, but the component design sentence and the code disagree.
- **Impact**: Documentation-only discrepancy between `component-design-runtime-config.md` section 7 (and `README.md`'s list of `slow`-marked tests) and `test_distribution_contents.py`.
- **Required remediation**: Note as an upstream design follow-up during `$doc-sync` (or add `pytestmark = pytest.mark.slow` when CAP-001-E1-S9 extends `test_distribution_contents.py`). Not blocking.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- `tests/fixtures/migrations_ok/0001_extensions_owner_state.sql` is a symlink to the release `0001_extensions_owner_state.sql` migration. Moving `migrations/` broke its relative target (`../../../migrations/0001_extensions_owner_state.sql`), so T014 repointed it to `../../../src/factorflow/db/migrations/0001_extensions_owner_state.sql`. The fixture directory itself stayed at `tests/fixtures/migrations_ok/`. Recorded in `CAP-001-E1-S8-tdd-evidence.yaml` (`migrations-as-package-data.deviation`) and verified by `test_migrations_location.py:87-88`. Justified.
- `Dockerfile` line `COPY migrations ./migrations` was removed in T014 as planned in the task plan's Notes, so `docker build` stays valid between E1-S8 and E1-S9. Justified.
- The story branch (`f89b8c0`) was merged into `main` by PR #112 (`9696b74`) before this review, and PRs #113 and #114 (E1-S7) merged after it. Reviewing at `origin/main` (`f85817a`) records a current `reviewed_state_revision` while verifying the full S8 diff from `73b1ea5`.
- The tasks file remains `status: draft` while its tasks are ticked; no gate in this phase reads that field.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Run `$doc-sync` for CAP-001-E1-S8.
- **Warnings accepted downstream**: IR-001, IR-002
