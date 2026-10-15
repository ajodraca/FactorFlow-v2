---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S9-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-14
updated: 2026-10-14
docs_synced_review: CAP-001-E1-S9-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gemini-4-argon-medium
  tool: Devin
  tool_version: unknown
  timestamp: 2026-10-14T15:35:00Z
  source_artifacts:
    - id: CAP-001-E1-S9
      version: "3"
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "8"
    - id: CAP-001-E1
      version: "3"
    - id: CAP-001-component-design-runtime-config
      version: "14"
    - id: CAP-001-component-design-schema-migrator
      version: "7"
    - id: CAP-001-component-design-ingestion-api
      version: "8"
    - id: CAP-001-component-design-market-data-store
      version: "9"
    - id: CAP-001-release
      version: "1"
    - id: tech-stack
      version: "5"
    - id: CONST-SEC
      version: "1.3"
    - id: CAP-001-component-tests
      version: "3"
    - id: CAP-001-coverage-matrix
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E1-S9 — Release Image and Compose Deployment With Smoke Check and Rollback

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S9.md`
**Component**: `FactorFlow-v2` (module `runtime-config`)
**Branch**: `usr/alvaro-de-jodra/CAP-001-E1-tasks`
**Date**: 2026-10-14

## Summary

Delivers the reproducible three-stage release `Dockerfile`, `.dockerignore`, `pyproject.toml` static bundle package-data entry, host-network `compose.yaml`, `scripts/deploy-smoke.sh` deployment smoke check, and the owner-operator deployment, upgrade, backup, rollback, and rehearsal procedures in `README.md` (`component-design-runtime-config.md` v14 section 2.8; CONST-SEC 1.3 `SEC-ENC-001 host-local loopback exception`; release manifest v1 blockers B3, B4, and B5). Also covers the owner-run backup and restore drill on the `factorflow-drill` project during coding, recording the drill's smoke check output, H6 and password-generation statements, and restore verification at `docs/releases/CAP-001-v0.1.0-drill-record.md` for citation by release readiness v2.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-13 | Given the deployment definition, When it is committed, Then it contains no secret: every secret is interpolated from the owner's shell and a missing one stops `docker compose` naming the variable | T003, T006, T007, T013, T016 |
| AC-14 | Given the deployment running, When any non-loopback address of the machine is probed, Then neither the interface nor the database accepts a connection | T003, T005, T008, T009, T013, T014, T015, T017 |
| AC-15 | Given a newer image deployed onto an existing store, When the application container starts, Then the migrator brings the store forward before the API serves | T002, T004, T010, T012, T014, T017 |
| AC-16 | Given a store ahead of the image, When the application container starts, Then it exits 2 on every start, never serves, and ingestion never starts | T001, T003, T007, T012, T013 |
| AC-18 | Given the deployment running, When the owner runs the smoke check or opens `GET /api/health`, Then liveness, database reachability and schema version are reported without inspecting the store | T004, T005, T014, T017 |
| DAC-E1-21 | Given the release image, When it is built, Then it carries the interface bundle and exactly the dependency versions `uv.lock` records, and fails to build when the lock is out of date | T001, T002, T012, T016 |
| DAC-E1-22 | Given `compose.yaml`, When it is rendered, Then every service runs on the host network with nothing published, PostgreSQL listens on `127.0.0.1` only with `scram-sha-256` on every route, and ingestion starts only in its profile after the application is healthy | T003, T007, T013, T016 |
| DAC-E1-23 | Given any deployment, When the owner runs the smoke check, Then it verifies service health, schema version, the served interface, the `pg_hba.conf` methods and the absence of any off-host listener, and exits non-zero on the first failure | T004, T005, T008, T009, T010, T014, T015, T017 |
| DAC-E1-24 | Given an upgrade, When the owner follows the documented procedure, Then a dump is taken first, and a rollback after a migration restores that dump before the older image starts | T006, T015, T017 |
| DAC-E1-S9-1 | Given the `Dockerfile`, When it is read, Then it has an `interface` stage running `npm run build` and a `lock` stage running `uv export --locked` (not `--frozen`); the final stage installs with `--require-hashes` and the project with `--no-deps`, copies the bundle from `interface`, its `CMD` runs `python -m factorflow.db.migrate_main && exec python -m factorflow.app_main`, and no `COPY` names `tests/` or `migrations/`; `.dockerignore` lists `tests/` and `src/factorflow/api/static/` | T001, T012 |
| DAC-E1-S9-2 | Given the built wheel from a temporary copy with a stub `index.html`, When it is listed, Then it contains `factorflow/api/static/index.html` as well as the migrations, and nothing under `tests/`; the test never depends on a prior `npm run build` | T002, T012 |
| DAC-E1-S9-3 | Given `compose.yaml` read as text, When checked, Then each of the three services has `network_mode: host`; the file has no `ports:` key; PostgreSQL's command sets `listen_addresses=127.0.0.1` and its environment sets `POSTGRES_HOST_AUTH_METHOD: scram-sha-256` and `POSTGRES_INITDB_ARGS` with both auth flags; the database URL's host is `127.0.0.1` with `require_auth=scram-sha-256`; no service sets `FACTORFLOW_API_HOST`; every secret and the image tag are `${...:?...}`; `app` and `ingestion` name the same image; `ingestion`'s command is `python -m factorflow.ingestion_main`, it is in the `ingestion` profile and depends on `app` healthy | T003, T013 |
| DAC-E1-S9-4 | Given `scripts/deploy-smoke.sh`, When check 1 reads `pg_hba.conf`, Then every non-comment, non-blank rule's method must be `scram-sha-256`, `peer` or `reject`, and any other method (`trust`, `password`, `md5` or other) fails the check | T004, T014 |
| DAC-E1-S9-5 | Given `scripts/deploy-smoke.sh` with a project argument, When run, Then it finds containers by `com.docker.compose.project=<project>`, defaulting to `factorflow`, and every HTTP request it makes uses `curl --noproxy '*' --proto =http` without `-L` | T005, T014 |
| DAC-E1-S9-6 | Given the smoke check's check 2, When it decides the expected schema version, Then it reads it from the running image (`discover(MIGRATIONS_DIR)` inside the `app` container), not from a constant | T004, T014 |
| DAC-E1-S9-7 | Given the README, When the owner follows it on a first deployment, Then the smoke check runs before the interface is opened at `http://127.0.0.1:8000` or ingestion is started, the password is generated with `openssl rand -hex 24` (at least 128 bits from a secure generator), and the four variables are named | T006, T015 |
| DAC-E1-S9-8 | Given the README's rollback procedure after a migration, When followed, Then `dropdb` runs only after the owner confirms the dump to restore, every `docker compose exec` that connects passes `PGPASSWORD`, and the drill's `down -v` runs only after the owner confirms the project name | T006, T015 |
| DAC-E1-S9-9 | Given no `factorflow` deployment running, When the drill runs once before the first deployment, Then `docker compose -p factorflow-drill up -d` starts PostgreSQL and the application only, `scripts/deploy-smoke.sh factorflow-drill` passes before the store takes any data, ingestion completes one acquisition run against the live provider, the owner records the H6 and `openssl rand -hex 24` statements for the drill, a `pg_dump` is taken and restored into an emptied database by the documented procedure, the coverage read is unchanged after the restore, and the volume is removed with `down -v` only after the owner confirms the project name; the smoke check output and drill record are kept in the change set | T006, T015, T017 |

## Phase 1: Setup

**Purpose**: No separate setup phase is needed; CAP-001-E1-S7 and CAP-001-E1-S8 are already merged on `main`, so `tests/unit/test_release_excludes_test_paths.py` and `tests/unit/test_distribution_contents.py` already exist at their baseline state.

**Checkpoint**: Proceed directly to Phase 2 (TDD).

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing unit tests that define the release image, wheel bundle, `compose.yaml`, `scripts/deploy-smoke.sh`, and `README.md` contracts before modifying or creating production files.

### Mandatory Component Tests

Every test carries its `# Implements TC-COMP-NNN` comment and no `postgres` marker, so all run under `uv run pytest -m 'not postgres'`.

- [x] T001 [P] Implement TC-COMP-424 and TC-COMP-394 in `tests/unit/test_release_excludes_test_paths.py`: update `_copy_sources` to join `\` line continuations before calling `shlex.split`; assert `Dockerfile` defines an `interface` stage (`FROM node:22-slim AS interface`) running `npm run build` and a `lock` stage (`FROM python:3.12-slim AS lock`) running `uv export --locked` (and not `--frozen`), that the final stage installs requirements with `--require-hashes` and the project with `--no-deps`, copies `/build/src/factorflow/api/static` from `interface` to `./src/factorflow/api/static`, sets `CMD ["sh", "-c", "python -m factorflow.db.migrate_main && exec python -m factorflow.app_main"]`, and has no `COPY` or `ADD` naming `tests/` or `migrations/`; assert `.dockerignore` exists and lists `tests/`, `src/factorflow/api/static/`, `node_modules/`, `.venv/`, `dist/`, `build/`, `test-results/`, `playwright-report/`, `.git/`, `.env`, and `.env.*` (TC-COMP-424, DAC-E1-S9-1); and add a test that copies `pyproject.toml` and `uv.lock` into `tmp_path`, appends an unlocked dependency (`requests>=2`) to the copy's `pyproject.toml`, runs `uv export --locked --no-emit-project --format requirements.txt -o requirements.txt` there, and asserts a non-zero exit with no `requirements.txt` written (TC-COMP-394, DAC-E1-21)
- [x] T002 [P] Implement TC-COMP-425 in `tests/unit/test_distribution_contents.py`: in the `built_wheel` fixture, after copying `src/` and `pyproject.toml` into the temporary source directory (ignoring `src/factorflow/api/static` build artefacts if any exist on the host checkout), write a stub `src/factorflow/api/static/index.html` before running `uv build --wheel --offline`, and assert in `test_wheel_carries_the_migrations_and_nothing_under_tests` (or a dedicated test function) that the built wheel contains `factorflow/api/static/index.html` alongside `factorflow/db/migrations/0001_extensions_owner_state.sql` through `0004_runs.sql` and no entry under `tests/`, without relying on a prior `npm run build` (TC-COMP-425, DAC-E1-S9-2)
- [x] T003 [P] Implement TC-COMP-426 in `tests/unit/test_compose_definition.py` (new, text-based without PyYAML): parse `compose.yaml` at the repository root and assert that `name: factorflow` and the three service blocks `postgres`, `app`, and `ingestion` are present; each of the three service blocks sets `network_mode: host` and `restart: unless-stopped`; the file contains no `ports:` key; `postgres` uses `postgres:16`, sets `listen_addresses=127.0.0.1` in `command`, sets `POSTGRES_HOST_AUTH_METHOD: scram-sha-256` and `POSTGRES_INITDB_ARGS: --auth-host=scram-sha-256 --auth-local=scram-sha-256`, mounts `factorflow-pgdata:/var/lib/postgresql/data`, and runs a local-socket `pg_isready` healthcheck without `-h`; the `x-factorflow-database` anchor's `FACTORFLOW_DATABASE_URL` connects to `@127.0.0.1:5432/factorflow?require_auth=scram-sha-256` with `${FACTORFLOW_POSTGRES_PASSWORD:?set FACTORFLOW_POSTGRES_PASSWORD}`; no service sets `FACTORFLOW_API_HOST`; every secret and the image tag use `${...:?...}` required interpolation (`FACTORFLOW_POSTGRES_PASSWORD`, `FACTORFLOW_MASSIVE_API_KEY`, `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE`, `FACTORFLOW_IMAGE_TAG`); `app` and `ingestion` name the exact same image `factorflow:${FACTORFLOW_IMAGE_TAG:?set FACTORFLOW_IMAGE_TAG}`; `app` depends on `postgres` with `condition: service_healthy` and its healthcheck uses `http.client.HTTPConnection('127.0.0.1', 8000, timeout=3)` checking `h.get('database') == 'reachable' and h.get('schema_version') is not None`; and `ingestion` has `profiles: [ingestion]`, `command: ["python", "-m", "factorflow.ingestion_main"]`, and `depends_on` `app` with `condition: service_healthy` (TC-COMP-426, DAC-E1-S9-3, DAC-E1-22, AC-13, AC-14, AC-16)
- [x] T004 [P] Implement TC-COMP-398, TC-COMP-427, TC-COMP-428, and TC-COMP-431 in `tests/unit/test_deploy_smoke.py` (new): using executable `docker`, `curl`, and `ifconfig`/`ip` stubs placed first on `PATH` in `tmp_path` and recording invocations to a log file in `tmp_path`:
  - `TC-COMP-398`: when stub `docker` reports `app` unhealthy in check 1, `scripts/deploy-smoke.sh` exits non-zero, names check 1 / container health in its error output, and makes no `curl` call and no check 2–4 `docker` call.
  - `TC-COMP-427`: when stub `docker` reports `postgres` and `app` healthy and returns a `pg_hba.conf` containing comments, blank lines, and rules whose methods are `scram-sha-256`, `peer`, and `reject`, check 1 passes (and with checks 2–4 stubbed to succeed, the script exits 0).
  - `TC-COMP-428`: parametrised over `trust`, `password`, and `md5` as the method of one rule in `pg_hba.conf`, `scripts/deploy-smoke.sh` fails check 1 and exits non-zero without running checks 2–4.
  - `TC-COMP-431`: when stub `docker exec <app> python -c "...discover(MIGRATIONS_DIR)..."` prints `5` and stub `curl` for `http://127.0.0.1:8000/api/health` returns `{"status":"ok","database":"reachable","credential_present":true,"schema_version":4,"most_recent_run":null}`, check 2 fails and `scripts/deploy-smoke.sh` exits non-zero, proving expected `schema_version` is read from the image rather than a hardcoded constant.
- [x] T005 [P] Implement TC-COMP-429 and TC-COMP-430 in `tests/unit/test_deploy_smoke.py`:
  - `TC-COMP-429`: run `scripts/deploy-smoke.sh` with no arguments against recording stubs that pass all four checks; assert every `docker ps` invocation filters by `label=com.docker.compose.project=factorflow`, and every `curl` invocation includes `--noproxy '*'` and `--proto =http` and never `-L` or `--location`.
  - `TC-COMP-430`: run `scripts/deploy-smoke.sh factorflow-drill` against the recording stubs; assert every `docker ps` invocation filters by `label=com.docker.compose.project=factorflow-drill`.
- [x] T006 [P] Implement TC-COMP-399, TC-COMP-400, TC-COMP-432, and TC-COMP-433 in `tests/unit/test_readme_deployment.py` (new): read `README.md` and assert:
  - `TC-COMP-432`: the first-deployment procedure states host networking (Linux or Docker Desktop with host networking enabled) as a precondition, generates `FACTORFLOW_POSTGRES_PASSWORD` with `openssl rand -hex 24` (at least 128 bits from a cryptographically secure generator), names all four required variables (`FACTORFLOW_POSTGRES_PASSWORD`, `FACTORFLOW_MASSIVE_API_KEY`, `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE`, `FACTORFLOW_IMAGE_TAG`) and the immutable `<version>-<shortsha>` image tag rule, runs `docker compose up -d`, then runs `scripts/deploy-smoke.sh` before opening `http://127.0.0.1:8000` or starting ingestion with `docker compose --profile ingestion up -d`, and states that `scripts/deploy-smoke.sh` must be re-run after any change to the host's network configuration (DAC-E1-S9-7).
  - `TC-COMP-399` and `TC-COMP-400`: the upgrade procedure's step 1 runs `pg_dump -U factorflow -d factorflow -Fc` into `$FACTORFLOW_BACKUP_DIR` before `docker compose build app`, `docker compose stop ingestion`, and `docker compose up -d`, and explicitly states that a non-zero exit or an empty dump file stops the upgrade; both rollback branches (when `<new>` applied no migration, and when `<new>` applied a migration) are documented in the exact order of `runtime-config` section 2.8.4, restoring the step 1 dump into an emptied database before starting `FACTORFLOW_IMAGE_TAG=<old> docker compose up -d`, running the smoke check, and starting ingestion (DAC-E1-24).
  - `TC-COMP-433`: in the rollback-after-migration procedure, `dropdb` is preceded by the owner confirming the dump file to restore; every `docker compose exec` that connects to PostgreSQL (`psql`, `pg_dump`, `dropdb`, `createdb`, `pg_restore`) passes `-e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD"`; and the drill clean-up `docker compose -p factorflow-drill down -v` is preceded by the owner confirming the project name (DAC-E1-S9-8).

### Additional Unit Tests

- [x] T007 [P] In `tests/unit/test_compose_definition.py`, add a test that updates `tests/unit/test_no_committed_secrets.py` `_SCANNED_FILES` / `_SCANNED_PREFIXES` coverage (or asserts directly) that `compose.yaml` and `scripts/deploy-smoke.sh` are scanned by `test_no_committed_secrets.py` so no hardcoded secret can land in either file (AC-13)
- [x] T008 [P] In `tests/unit/test_deploy_smoke.py`, add unit tests for check 3 and check 4 of `scripts/deploy-smoke.sh` using the stub harness: check 3 fails and exits non-zero when `GET http://127.0.0.1:8000/` does not return HTTP 200 with HTML (`<!doctype html>` / `<html` from `index.html`); check 4 probes both ports `8000` and `5432` across every non-loopback IPv4, IPv6, and link-local (with `%zone`) address discovered from `ifconfig` / `ip addr` (and, when Docker Desktop's VM is detected, via `docker run --rm --network host <app image> python -c ...`), and exits non-zero if any non-loopback address accepts a connection on port `8000` or `5432` (AC-14, DAC-E1-23; backlog review v15 FINDING-7)
- [x] T009 [P] In `tests/unit/test_deploy_smoke.py`, add a test asserting `bash -n scripts/deploy-smoke.sh` exits 0 (and `shellcheck scripts/deploy-smoke.sh` exits 0 when `shutil.which("shellcheck")` is present) and that a static scan of `scripts/deploy-smoke.sh` finds no reference to `FACTORFLOW_MASSIVE_API_KEY`, `FACTORFLOW_POSTGRES_PASSWORD`, `FACTORFLOW_DATABASE_URL`, or `/api/acquisition-runs` (DAC-E1-23, runtime-config section 2.8.5)
- [x] T010 [P] Implement TC-COMP-393, TC-COMP-395, and TC-COMP-396 in `tests/unit/test_compose_definition.py` (or a dedicated helper test module) with `pytest.mark.skipif` when `docker` / `docker compose` is unavailable on the host so they run where Docker is present and are recorded as skipped/not-run rather than passed when absent:
  - `TC-COMP-395`: with the four variables set to non-secret test values in the subprocess environment, `docker compose config` renders `postgres` and `app` only, `docker compose --profile ingestion config` renders `postgres`, `app`, and `ingestion`, every service has `network_mode: host` and no `ports:`, and the database URL's host is `127.0.0.1` (DAC-E1-22).
  - `TC-COMP-396`: parametrised over each of the four required variables (`FACTORFLOW_POSTGRES_PASSWORD`, `FACTORFLOW_MASSIVE_API_KEY`, `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE`, `FACTORFLOW_IMAGE_TAG`), running `docker compose config` with that variable unset and the other three set exits non-zero and names the missing variable in stderr (DAC-E1-22, AC-13).
  - `TC-COMP-393`: documented in the validation plan and executed during Phase 4 when Docker is available (`docker build -t factorflow:test .`, verifying `factorflow/api/static/index.html`, comparing `pip freeze` inside the image against `uv export --locked --no-emit-project --format requirements.txt`, and verifying `node`, `uv`, and `web/` are absent from the final stage) (DAC-E1-21).

**Checkpoint**: All new unit tests in `tests/unit/test_release_excludes_test_paths.py`, `tests/unit/test_distribution_contents.py`, `tests/unit/test_compose_definition.py`, `tests/unit/test_deploy_smoke.py`, and `tests/unit/test_readme_deployment.py` are written and failing for the expected missing-implementation reasons.

---

## Phase 3: Core Implementation

**Purpose**: Create `.dockerignore`, `compose.yaml`, and `scripts/deploy-smoke.sh`, and update `Dockerfile`, `pyproject.toml`, `tests/unit/test_no_committed_secrets.py`, and `README.md` to make all Phase 2 tests pass.

- [x] T011 [P] Create `.dockerignore` at the repository root excluding `node_modules/`, `.venv/`, `dist/`, `build/`, `tests/`, `test-results/`, `playwright-report/`, `.git/`, `.env`, `.env.*`, and `src/factorflow/api/static/`, per `component-design-runtime-config.md` section 2.8.2 (DAC-E1-S9-1)
- [x] T012 Rewrite `Dockerfile` at the repository root with the exact three-stage definition from `component-design-runtime-config.md` section 2.8.2 (`interface` on `node:22-slim` running `npm ci && npm run build`; `lock` on `python:3.12-slim` installing `uv==0.12.10` and running `uv export --locked --no-emit-project --format requirements.txt -o requirements.txt`; release stage on `python:3.12-slim` installing `requirements.txt` with `--require-hashes`, copying `pyproject.toml`, `uv.lock`, `src`, and `/build/src/factorflow/api/static`, running `pip install --no-cache-dir --no-deps .`, and keeping `CMD ["sh", "-c", "python -m factorflow.db.migrate_main && exec python -m factorflow.app_main"]`), and update `pyproject.toml` `[tool.setuptools.package-data]` to `factorflow = ["coverage/sql/*.sql", "db/migrations/*.sql", "api/static/**/*"]` (depends on T001, T002, T011; DAC-E1-21, DAC-E1-S9-1, DAC-E1-S9-2, AC-15, AC-16)
- [x] T013 [P] Create `compose.yaml` at the repository root with the exact definition from `component-design-runtime-config.md` section 2.8.3 (`name: factorflow`, `x-factorflow-database` anchor, `postgres`, `app`, and `ingestion` services on `network_mode: host`, `scram-sha-256` auth arguments, required `${...:?...}` variable interpolations, `pg_isready` local-socket and `http.client` healthchecks, `profiles: [ingestion]`, `restart: unless-stopped`, and `factorflow-pgdata` volume), and add `"compose.yaml"` and `".dockerignore"` to `_SCANNED_FILES` in `tests/unit/test_no_committed_secrets.py` (`scripts/` is already covered by `_E2E_KEY_SCANNED_PREFIXES`; add `"scripts/"` to `_SCANNED_PREFIXES` as well) (depends on T003, T007; DAC-E1-22, DAC-E1-S9-3, AC-13, AC-14, AC-16)
- [x] T014 [P] Create `scripts/deploy-smoke.sh` (executable, `chmod +x`, `#!/usr/bin/env bash`, `set -euo pipefail`) implementing `component-design-runtime-config.md` section 2.8.5:
  - Accepts optional `[project]` positional argument defaulting to `factorflow`.
  - Check 1: inspects `docker ps --filter "label=com.docker.compose.project=${PROJECT}"` to verify both `postgres` and `app` containers are running and healthy; runs `docker exec "${POSTGRES_CONTAINER}" sh -c 'grep -v "^[[:space:]]*#" "$PGDATA/pg_hba.conf"'` and verifies that at least one rule exists and every non-blank, non-comment rule's auth method is `scram-sha-256`, `peer`, or `reject`, exiting non-zero on any other method (`trust`, `password`, `md5`, etc.).
  - Check 2: fetches `http://127.0.0.1:8000/api/health` using `curl --silent --show-error --fail --noproxy '*' --proto =http` (no `-L`), reads the expected highest migration version from the running `app` image via `docker exec "${APP_CONTAINER}" python -c "from factorflow.db.migrate_main import MIGRATIONS_DIR; from factorflow.db.migrator import discover; print(max(f.version for f in discover(MIGRATIONS_DIR)))"`, and verifies HTTP 200, `database == "reachable"`, and `schema_version` equal to that expected integer.
  - Check 3: fetches `http://127.0.0.1:8000/` using `curl --silent --show-error --fail --noproxy '*' --proto =http` (no `-L`) and verifies HTTP 200 and that the body contains the bundle's `index.html` document (`<!doctype html>` / `<div id="root">`).
  - Check 4: enumerates all non-loopback IPv4, IPv6, and link-local (with interface zone `%<iface>`) addresses on the host from `ifconfig` (macOS) or `ip addr` (Linux) and probes TCP ports `8000` and `5432` on each, failing immediately if any accepts a connection; when running on Docker Desktop (`docker info` operating system / VM check), also runs a one-shot `--rm --network host` container from the running `app` image to enumerate non-loopback addresses inside the Linux VM and probe ports `8000` and `5432` on each.
  - Exits non-zero on the first failed check with a clear message naming the check; never reads, prints, or sends any secret; starts no acquisition run (depends on T004, T005, T008, T009; DAC-E1-23, DAC-E1-S9-4, DAC-E1-S9-5, DAC-E1-S9-6, AC-14, AC-18)
- [x] T015 [P] Update `README.md` to replace the source-checkout run instructions (`Running the migrator`, `Running the API`, `Running the acquisition runner`) and update the `Requirements`, `Layout`, and `Configuration` sections with the owner deployment, verification, upgrade, backup, rollback, and rehearsal procedures of `component-design-runtime-config.md` sections 2.8.3, 2.8.4, 2.8.5, and 9:
  - Update `Requirements` for Node.js 22 (matching `tech-stack.md` v5 and `node:22-slim`) and Docker with host networking enabled.
  - Update `Layout` to describe the three-stage `Dockerfile`, `.dockerignore`, `compose.yaml`, and `scripts/deploy-smoke.sh`.
  - Document the first-deployment procedure: host networking precondition (Linux, or Docker Desktop with host networking enabled) and ports `8000` and `5432` free; password generation with `openssl rand -hex 24` (192 bits, satisfying H4's >=128-bit requirement and URL-safe character rule); the four required shell environment variables (`FACTORFLOW_POSTGRES_PASSWORD`, `FACTORFLOW_MASSIVE_API_KEY`, `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE`, `FACTORFLOW_IMAGE_TAG`) and the immutable `<version>-<shortsha>` image tag rule; `docker compose up -d` (starting `postgres` and `app` only); running `scripts/deploy-smoke.sh`; only after it passes opening the interface at `http://127.0.0.1:8000` and starting ingestion with `docker compose --profile ingestion up -d`; re-running `scripts/deploy-smoke.sh` after every `docker compose up -d` and after any change to the host's network configuration; and the password rotation procedure (`ALTER ROLE` via `docker compose exec -e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD" postgres psql ...`).
  - Document the upgrade, backup (`$FACTORFLOW_BACKUP_DIR`, stopping on a non-zero exit or empty dump file), rollback when `<new>` applied no migration, rollback when `<new>` applied a migration (confirming the dump file before `dropdb`, passing `-e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD"` on every connecting `docker compose exec`), and the pre-release `factorflow-drill` rehearsal procedure (including confirming the project name before `docker compose -p factorflow-drill down -v`) (depends on T006; DAC-E1-24, DAC-E1-S9-7, DAC-E1-S9-8, DAC-E1-S9-9, AC-14)

**Checkpoint**: All unit tests in `tests/unit/test_release_excludes_test_paths.py`, `tests/unit/test_distribution_contents.py`, `tests/unit/test_compose_definition.py`, `tests/unit/test_deploy_smoke.py`, and `tests/unit/test_readme_deployment.py` pass under `uv run pytest -m 'not postgres'`.

---

## Phase 4: Integration

**Purpose**: Verify the full test suites, the Docker image build and Compose config rendering, and execute the owner-run backup and restore drill on `factorflow-drill` to record the drill evidence in the change set.

- [x] T016 Run `uv build`, `uv run pytest -m 'not postgres'`, `uv run pytest`, `npm run lint`, `npm run format`, `npx tsc --noEmit`, `npm run test`, and `npm run test:e2e`; where Docker is available, run `docker build -t factorflow:test .` and execute TC-COMP-393 (verifying `factorflow/api/static/index.html` in the installed package, `pip freeze` matching `uv export --locked --no-emit-project --format requirements.txt`, and absence of `node`, `uv`, and `web/` in the final image) as well as TC-COMP-395 and TC-COMP-396 against `docker compose config` (depends on T011–T015; DAC-E1-21, DAC-E1-22)
- [x] T017 Implement TC-COMP-397 and TC-COMP-434 (owner-run during coding, with the owner supplying `FACTORFLOW_MASSIVE_API_KEY` and running the commands that use it on the owner's Docker host with host networking enabled and no `factorflow` deployment running):
  1. Generate the drill database password with `openssl rand -hex 24`, build/tag the release image `factorflow:0.1.0-<shortsha>`, and start PostgreSQL and the application only with `docker compose -p factorflow-drill up -d`.
  2. Run `scripts/deploy-smoke.sh factorflow-drill` before any data enters the drill store and capture its full output (TC-COMP-397).
  3. Record the owner's H6 statement (that no account outside the owner's control can run processes on the host) and password-generation statement (that the drill's `FACTORFLOW_POSTGRES_PASSWORD` was generated with `openssl rand -hex 24`).
  4. Open `http://127.0.0.1:8000`, set history depth and add at least one active instrument, start ingestion with `docker compose -p factorflow-drill --profile ingestion up -d`, let one acquisition run complete against the live provider, and capture the `GET /api/coverage` response.
  5. Take a `pg_dump -Fc` to `$FACTORFLOW_BACKUP_DIR` (outside the repository), stop `ingestion` and `app`, confirm the dump file to restore, drop and recreate the `factorflow` database with `-e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD"`, restore the dump with `pg_restore --no-owner`, restart `app` with `docker compose -p factorflow-drill up -d`, re-run `scripts/deploy-smoke.sh factorflow-drill`, and capture `GET /api/coverage` again to confirm coverage is unchanged.
  6. After confirming the project name `factorflow-drill`, tear down the drill stack and its volume with `docker compose -p factorflow-drill down -v`.
  7. Write the complete smoke check output, the H6 and password-generation statements, and the before/after restore record (containing no secret values) to `docs/releases/CAP-001-v0.1.0-drill-record.md` (depends on T016; DAC-E1-23, DAC-E1-24, DAC-E1-S9-9, AC-14, AC-15, AC-18)

**Checkpoint**: Full Python, frontend, Playwright, and Docker suites pass, and `docs/releases/CAP-001-v0.1.0-drill-record.md` is recorded in the change set with no secrets.

---

## Phase 5: Polish

**Purpose**: Final static-analysis, formatting, and secret-scan verification, plus per-cycle TDD evidence recording.

- [x] T018 Run `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, `bash -n scripts/deploy-smoke.sh`, and `uv run pytest tests/unit/test_no_committed_secrets.py`; fix any findings in the touched files only (depends on T016, T017)
- [x] T019 After each TDD cycle in T001–T015 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-001-E1-S9-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

Hard edges already in `dependencies.yaml` for this story: CAP-001-E1-S6, CAP-001-E1-S8, CAP-001-E3-S6, CAP-001-E4-S5 (all implemented and merged to `main`). No new hard edge.

| Story | Classification | Evidence |
|---|---|---|
| CAP-001-E1-S2 | context | Cited by the story's AC-15 and AC-16 verification table rows for the migrator's existing re-application (`tests/integration/test_migrator_preserves_data.py`) and store-ahead exit-2 (`tests/integration/test_migrator_refuses.py`) tests; already transitive through CAP-001-E1-S6 and CAP-001-E1-S8 |
| CAP-001-E1-S7 | soft | Also edited `tests/unit/test_release_excludes_test_paths.py` (its `_ORIGIN_ALLOW_LIST_MODULE` / `_ORIGIN_ALLOW_LIST_PARTS` exemption for DAC-E1-S7-6) and is already merged on `main`; no code dependency in either direction |
| CAP-001-E5-S1 | context | Added `tests/integration/test_migrations_apply.py` (`TC-COMP-015`), which proves bring-forward of new migrations (`0003`, `0004`) onto a populated store for AC-15 (backlog review v15 FINDING-1(b)); this plan neither imports nor modifies it |

### Task Dependencies
- T001–T010: No prior task dependencies; can run in parallel across their respective test files.
- T011: No prior task dependency; creates `.dockerignore`.
- T012: Depends on T001, T002, T011.
- T013: Depends on T003, T007.
- T014: Depends on T004, T005, T008, T009.
- T015: Depends on T006.
- T016: Depends on T011–T015.
- T017: Depends on T016 (requires the built release image, `compose.yaml`, `scripts/deploy-smoke.sh`, and `README.md` procedure, plus owner interaction for the live provider key).
- T018: Depends on T016, T017.
- T019: Interleaved — runs after every TDD cycle in T001–T015, before the next cycle begins.

### Parallel Opportunities
- Phase 2: T001 (`test_release_excludes_test_paths.py`), T002 (`test_distribution_contents.py`), T003/T007/T010 (`test_compose_definition.py`), T004/T005/T008/T009 (`test_deploy_smoke.py`), and T006 (`test_readme_deployment.py`) target five distinct test files and can be written in parallel.
- Phase 3: T011/T012 (`.dockerignore`, `Dockerfile`, `pyproject.toml`), T013 (`compose.yaml`, `test_no_committed_secrets.py`), T014 (`scripts/deploy-smoke.sh`), and T015 (`README.md`) touch disjoint files and can be implemented in parallel once their respective Phase 2 tests exist.

---

## Validation Plan

### Constitution-Defined Commands
- Install: `uv sync --all-extras`; `npm ci`
- Build: `uv build`; `npm run build`
- Test: `uv run pytest -m 'not postgres'`, then `uv run pytest`; `npm run test`; `npm run test:e2e`
- Lint: `uv run ruff check .`; `npm run lint`
- Format: `uv run ruff format --check .`; `npm run format`
- Types: `uv run mypy src`; `npx tsc --noEmit`

### Story-Specific Validation
- `uv run pytest tests/unit/test_release_excludes_test_paths.py tests/unit/test_distribution_contents.py tests/unit/test_compose_definition.py tests/unit/test_deploy_smoke.py tests/unit/test_readme_deployment.py -q` passes with all mapped TC-COMP markers present.
- `bash -n scripts/deploy-smoke.sh` exits 0 (and `shellcheck scripts/deploy-smoke.sh` exits 0 if `shellcheck` is installed).
- Where Docker is available: `docker build -t factorflow:test .` succeeds, `docker compose config` and `docker compose --profile ingestion config` succeed with the four variables set and fail naming each missing variable when unset, and the owner-run `scripts/deploy-smoke.sh factorflow-drill` and backup/restore drill pass with their record saved at `docs/releases/CAP-001-v0.1.0-drill-record.md`.

---

## Notes

### Resolved Conflicts

1. **`test_compose_definition.py` assertions vs story AC-16 verification row (backlog review v15 FINDING-1(a)).** The story's AC-16 verification row states that `test_compose_definition.py` checks "`ingestion` depends on a healthy `app`, whose healthcheck needs a non-null `schema_version`; `restart: unless-stopped`", whereas `DAC-E1-S9-3`, `component-design-runtime-config.md` section 7, and `TC-COMP-426` omit the healthcheck `schema_version` and `restart: unless-stopped` clauses from their summary list. Both properties are verbatim in `component-design-runtime-config.md` section 2.8.3's `compose.yaml`. T003 asserts every item in `DAC-E1-S9-3` / `TC-COMP-426` **plus** the `app` healthcheck's `schema_version is not None` check and `restart: unless-stopped` on all three services, satisfying both the normative criteria and the story's verification table without conflict.
2. **AC-15 populated-store migration citation (backlog review v15 FINDING-1(b)).** The story's AC-15 verification row credits "bring-forward onto a populated store" to `CAP-001-E1-S2`, whose test (`tests/integration/test_migrator_preserves_data.py`) re-applies an already-applied migration. The test that applies new migrations (`0003`, `0004`) onto a populated store is `tests/integration/test_migrations_apply.py` (`TC-COMP-015`, added in `CAP-001-E5-S1`). Both tests already exist and pass in `uv run pytest`; `CAP-001-E1-S2` and `CAP-001-E5-S1` are classified as `context` above, and no story edit is needed.
3. **`slow` marker on `tests/unit/test_distribution_contents.py` (backlog review v15 FINDING-9 & E1-S8 IR-002).** `component-design-runtime-config.md` section 7 states that `test_distribution_contents.py` is marked `slow`, whereas `CAP-001-E1-S9` and `TC-COMP-425` specify `Preconditions: uv run pytest -m 'not postgres'` without requiring the `slow` marker, and `CAP-001-E1-S8` left the module unmarked because `uv build --wheel --offline` completes in ~0.4 s (documented as accepted warning IR-002 in `README.md`). Keeping `tests/unit/test_distribution_contents.py` unmarked (and without `postgres`) preserves existing pattern and ensures it runs in every default and `-m 'not postgres'` invocation.
4. **Smoke checks 3 and 4 unit-test coverage (backlog review v15 FINDING-7).** While `DAC-E1-S9-4` to `DAC-E1-S9-6` pin checks 1 and 2 in derived story criteria, `DAC-E1-23` and `component-design-runtime-config.md` section 2.8.5 require checks 3 (`GET /` serves `index.html`) and 4 (off-host listener probe across non-loopback IPv4, IPv6, link-local with zone, and Docker Desktop VM). Under the precedence ladder (`DAC-E1-23` and design normative prose), T008 adds unit tests for checks 3 and 4 in `tests/unit/test_deploy_smoke.py` alongside T004 and T005.

### Open Gaps

1. **Owner-confirmed (2026-10-14): File path for the drill record and smoke check output kept in the change set (`docs/releases/CAP-001-v0.1.0-drill-record.md`).**
   - **What is undefined:** `CAP-001-E1-S9` Description (*Owner-run items*) and `DAC-E1-S9-9` require that *"The drill's smoke check output and drill record are kept in the change set, at the location the implementation plan fixes, and cited by release readiness v2"*, and `component-design-runtime-config.md` section 2.8.4 requires the drill and its smoke check output to be recorded as release evidence before the first deployment of `0.1.0`, but neither artifact fixes the exact repository file path.
   - **What the plan does:** Fixes the path at `docs/releases/CAP-001-v0.1.0-drill-record.md` (T017).
   - **Derivation:** Release readiness v1 lives at `docs/releases/CAP-001-release-v1.md` and declares `release_id: CAP-001-v0.1.0` and `release_version: 0.1.0`. Placing the drill record beside the release readiness manifests under `docs/releases/` as `docs/releases/CAP-001-v0.1.0-drill-record.md`: (a) co-locates the pre-release rehearsal evidence with the release readiness v2 manifest that cites it, (b) keeps it under `docs/` so `ruff` and `pipeline-state.py`'s code fingerprint (`implementation_path`) treat it as documentation rather than production source, and (c) avoids matching `check-artifacts.py`'s `*-release*.md` glob pattern if a future check scans `docs/releases/`.
   - **Owning design to absorb at next revision:** `component-design-runtime-config.md` section 2.8.4.

### Other Notes

- **Rebase / shared module with `CAP-001-E1-S7` and `CAP-001-E1-S8`.** Both `CAP-001-E1-S7` and `CAP-001-E1-S8` are already merged into `main` (and present on `usr/alvaro-de-jodra/CAP-001-E1-tasks`). `tests/unit/test_release_excludes_test_paths.py` already contains `E1-S7`'s `_ORIGIN_ALLOW_LIST_MODULE` / `_ORIGIN_ALLOW_LIST_PARTS` exemption; T001 extends the `Dockerfile` / `.dockerignore` portion of that file without touching the scheme-scan exemption. Likewise `tests/unit/test_distribution_contents.py` already exists from `E1-S8`; T002 extends its `built_wheel` fixture to write a stub `src/factorflow/api/static/index.html` into the temporary copy before running `uv build --wheel --offline`.
- **Owner-run boundary (T017).** Per `CAP-001-E1-S9` *Owner-run items* and `DAC-E1-S9-9`, the backup and restore drill against `factorflow-drill` requires Docker with host networking enabled and the owner's real Massive API key against the live provider. The coding agent must never handle or log the owner's real API key or database password; the owner runs the commands that use the key and confirms the destructive steps (`dropdb` and `docker compose -p factorflow-drill down -v`).
- **No TDD exception.** Every behaviour-changing commit in T001–T015 is covered by T019 in `CAP-001-E1-S9-tdd-evidence.yaml`.
