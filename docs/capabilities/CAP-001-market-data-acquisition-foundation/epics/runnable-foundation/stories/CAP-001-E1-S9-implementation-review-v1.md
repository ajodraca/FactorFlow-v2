---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S9-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-15
updated: 2026-10-15
story_id: "CAP-001-E1-S9"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S9.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S9-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-15T02:04:37Z"
reviewed_head: "528eb76225e93574084b987ffb5c2f26955dcf84"
review_base: "46815315ab7e7dc29818063ebb6da4e3ac67dfd4"
reviewed_state_revision: "sha256:7616e84d9cc44e1206efc6a26f1e4bce9c96c338acf77e762a0fedbdc15b3a49"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E1-S9
    artifact_version: 3
    content_revision: sha256:85aa1cbd0fcb5575181a3ec8d380a236234de5d12d5685233af586fe485532b0
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: gemini-4-argon-medium
  tool: Devin
  tool_version: unknown
  timestamp: 2026-10-15T02:04:37Z
  source_artifacts:
    - id: CAP-001-E1-S9
      version: "3 (sha256:85aa1cbd0fcb5575181a3ec8d380a236234de5d12d5685233af586fe485532b0)"
    - id: CAP-001-E1-S9-tasks
      version: "1 (sha256:2e1e9543b6239b725bd520e0c74fd011be0540ede4e8766b4618364e36bc045c)"
    - id: CAP-001-E1-S9-tdd-evidence
      version: "1"
    - id: CAP-001-component-design-runtime-config
      version: "14"
    - id: CAP-001-component-design-schema-migrator
      version: "7"
    - id: CAP-001-component-tests
      version: "3"
    - id: CAP-001-coverage-matrix
      version: "3"
    - id: CONST-SEC
      version: "1.3"
    - id: tech-stack
      version: "5"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E1-S9 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 2 |
| Acceptance criteria | 18/18 satisfied |
| Planned tasks | 19/19 verified |
| Required validation | 16/16 passed |

**Verdict:** PASS-WITH-WARNINGS — CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 2 · **total 2**

| ID | Severity | Summary |
|----|----------|---------|
| IR-001 | LOW | `docs/releases/CAP-001-v0.1.0-drill-record.md` line 9 cites `docs/constitution/standards/security-standards.md` and `operational-standards.md`, which are harness-level constitutions (`CONST-SEC` / `CONST-OPS`) rather than paths under this repo's `docs/constitution/` |
| IR-002 | LOW | `biome.json` `files.ignore` omits `build/**`; after `uv build` runs on a checkout that already has a built static bundle, setuptools stages minified JS into `build/lib/factorflow/api/static/assets/*.js`, which matches `*.js` if `build/` is not removed first |

All 18 acceptance criteria (`AC-13`, `AC-14`, `AC-15`, `AC-16`, `AC-18`, `DAC-E1-21` to `DAC-E1-24`, and `DAC-E1-S9-1` to `DAC-E1-S9-9`), all 19 planned tasks (`T001`–`T019`), and all 19 mapped component test cases (`TC-COMP-393` to `TC-COMP-400` and `TC-COMP-424` to `TC-COMP-434`) are implemented, traced, and independently verified:

1. **Three-stage release image (`Dockerfile`), `.dockerignore`, and wheel bundle (`pyproject.toml`)** (`DAC-E1-21`, `DAC-E1-S9-1`, `DAC-E1-S9-2`, `AC-15`, `AC-16`): `Dockerfile` matches `component-design-runtime-config.md` §2.8.2 verbatim (`interface` on `node:22-slim` running `npm ci && npm run build`; `lock` on `python:3.12-slim` installing `uv==0.12.10` and running `uv export --locked --no-emit-project --format requirements.txt -o requirements.txt`; release stage installing requirements with `--require-hashes`, copying `/build/src/factorflow/api/static`, installing the package with `--no-deps`, and keeping `CMD ["sh", "-c", "python -m factorflow.db.migrate_main && exec python -m factorflow.app_main"]`). `.dockerignore` lists all 11 required entries including `tests/` and `src/factorflow/api/static/`. `pyproject.toml` adds `"api/static/**/*"` to `[tool.setuptools.package-data]`. Independent `docker build -t factorflow:test .` succeeded, packaged `factorflow/api/static/index.html` and the 4 SQL migrations, matched all 22 Linux-applicable locked distributions in `pip freeze` 1:1 against `uv export --locked`, and excluded `node`, `uv`, and `web/`.
2. **Host-network Compose deployment (`compose.yaml`)** (`DAC-E1-22`, `DAC-E1-S9-3`, `AC-13`, `AC-14`, `AC-16`): `compose.yaml` matches `component-design-runtime-config.md` §2.8.3 verbatim. `postgres`, `app`, and `ingestion` all run with `network_mode: host`, `restart: unless-stopped`, and no `ports:` key; PostgreSQL listens only on `127.0.0.1:5432` with `POSTGRES_HOST_AUTH_METHOD: scram-sha-256`, `POSTGRES_INITDB_ARGS: --auth-host=scram-sha-256 --auth-local=scram-sha-256`, and a local-socket `pg_isready` healthcheck; `FACTORFLOW_DATABASE_URL` connects to `127.0.0.1:5432` with `require_auth=scram-sha-256`; all four required variables use `${VAR:?...}` interpolation; `app` and `ingestion` share `factorflow:${FACTORFLOW_IMAGE_TAG:?set FACTORFLOW_IMAGE_TAG}`; and `ingestion` is gated behind `profiles: [ingestion]` and `depends_on: app: condition: service_healthy`.
3. **Deployment smoke check (`scripts/deploy-smoke.sh`)** (`DAC-E1-23`, `DAC-E1-S9-4` to `DAC-E1-S9-6`, `AC-14`, `AC-18`): Accepts optional `[project]` defaulting to `factorflow`, filters containers by `com.docker.compose.project`, validates `pg_hba.conf` rules against `{"scram-sha-256", "peer", "reject"}`, reads expected `schema_version` dynamically from the running `app` image via `discover(MIGRATIONS_DIR)`, uses `curl --noproxy '*' --proto =http` without `-L`, verifies `GET /` serves `index.html`, and probes ports `8000` and `5432` across all non-loopback IPv4, IPv6, link-local (`%<iface>`), and Docker Desktop VM addresses without reading secrets or starting an acquisition run.
4. **Owner runbook (`README.md`) and pre-release drill record (`docs/releases/CAP-001-v0.1.0-drill-record.md`)** (`DAC-E1-24`, `DAC-E1-S9-7` to `DAC-E1-S9-9`, `TC-COMP-397`, `TC-COMP-434`): `README.md` documents the first-deployment, password-rotation, upgrade, backup, both rollback branches, and `factorflow-drill` rehearsal procedures with destructive-step confirmations and `-e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD"` on every connecting `docker compose exec`. `docs/releases/CAP-001-v0.1.0-drill-record.md` records the owner-executed `factorflow-drill` rehearsal (pre-data smoke check output, H6 and `openssl rand -hex 24` statements, live-provider run `1026a847-a2d5-475b-9191-7fab5d7073b1`, `pg_dump` / `dropdb` / `createdb` / `pg_restore`, post-restore smoke check, byte-identical `GET /api/coverage` before and after restore, and confirmed `down -v` teardown) with zero secret values.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S9.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S9-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E1-S9` |
| HEAD | `528eb76225e93574084b987ffb5c2f26955dcf84` |
| Review base | `46815315ab7e7dc29818063ebb6da4e3ac67dfd4` |
| Working tree | clean (no staged, unstaged, or untracked non-ignored files) before and after validation |
| Changed files reviewed | 16 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `.dockerignore` | added | DAC-E1-21, DAC-E1-S9-1; T011 |
| `Dockerfile` | modified | DAC-E1-21, DAC-E1-S9-1, AC-15, AC-16; T012 |
| `README.md` | modified | DAC-E1-24, DAC-E1-S9-7, DAC-E1-S9-8, DAC-E1-S9-9, AC-14; T015 |
| `compose.yaml` | added | AC-13, AC-14, AC-16, DAC-E1-22, DAC-E1-S9-3; T013 |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S9-tasks.md` | modified | Task completion checkboxes (`[x]`); T001–T019 |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S9-tdd-evidence.yaml` | added | Per-cycle TDD, code-review, and spec-drift evidence; T019 |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S9.md` | modified | Story status updated to `in-review`; T016–T019 |
| `docs/releases/CAP-001-v0.1.0-drill-record.md` | added | AC-14, AC-15, AC-18, DAC-E1-23, DAC-E1-24, DAC-E1-S9-9; T017 |
| `pyproject.toml` | modified | DAC-E1-21, DAC-E1-S9-2 (`"api/static/**/*"` in package-data); T012 |
| `scripts/deploy-smoke.sh` | added | AC-14, AC-18, DAC-E1-23, DAC-E1-S9-4, DAC-E1-S9-5, DAC-E1-S9-6; T014 |
| `tests/unit/test_compose_definition.py` | added | AC-13, AC-14, AC-16, DAC-E1-22, DAC-E1-S9-3; T003, T007, T010 |
| `tests/unit/test_deploy_smoke.py` | added | AC-14, AC-18, DAC-E1-23, DAC-E1-S9-4, DAC-E1-S9-5, DAC-E1-S9-6; T004, T005, T008, T009 |
| `tests/unit/test_distribution_contents.py` | modified | DAC-E1-21, DAC-E1-S9-2; T002 |
| `tests/unit/test_no_committed_secrets.py` | modified | AC-13 (`_SCANNED_PREFIXES` and `_SCANNED_FILES` include `scripts/`, `.dockerignore`, `compose.yaml`); T007, T013 |
| `tests/unit/test_readme_deployment.py` | added | DAC-E1-24, DAC-E1-S9-7, DAC-E1-S9-8; T006 |
| `tests/unit/test_release_excludes_test_paths.py` | modified | DAC-E1-21, DAC-E1-S9-1; T001 |

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-13 | SATISFIED | `compose.yaml:4,14,27,32,44,50,51` uses `${VAR:?set VAR}` for `FACTORFLOW_POSTGRES_PASSWORD`, `FACTORFLOW_MASSIVE_API_KEY`, `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE`, and `FACTORFLOW_IMAGE_TAG`; `scripts/deploy-smoke.sh` reads no secrets; `docs/releases/CAP-001-v0.1.0-drill-record.md:22` records no secret values | `tests/unit/test_compose_definition.py:test_compose_database_url_and_required_variable_interpolations` (TC-COMP-426), `test_docker_compose_config_fails_and_names_missing_variable` (TC-COMP-396), `test_secret_scanner_covers_compose_dockerignore_and_deploy_smoke`; `tests/unit/test_no_committed_secrets.py` | Every secret is interpolated from the owner's shell with `:?`, and missing variables fail `docker compose` naming the variable. |
| AC-14 | SATISFIED | `compose.yaml:9,10,29,46` (`network_mode: host`, no `ports:`, `listen_addresses=127.0.0.1`, no `FACTORFLOW_API_HOST`); `scripts/deploy-smoke.sh:154-305` (check 4 host + Docker Desktop VM non-loopback probe on ports 8000 and 5432); `docs/releases/CAP-001-v0.1.0-drill-record.md:48-53,121-126` | `tests/unit/test_compose_definition.py` (TC-COMP-426, TC-COMP-395); `tests/unit/test_deploy_smoke.py:test_smoke_check_4_fails_when_non_loopback_address_accepts_connection`, `test_smoke_check_4_host_probe_enumerates_ipv4_ipv6_and_link_local_with_zone`; drill smoke check runs (TC-COMP-397) | Both preventive controls (`ApiSettings` loopback default and PostgreSQL `listen_addresses=127.0.0.1`) and detective check 4 are verified in unit tests and on the live `factorflow-drill` stack. |
| AC-15 | SATISFIED | `Dockerfile:28` (`CMD ["sh", "-c", "python -m factorflow.db.migrate_main && exec python -m factorflow.app_main"]`); `pyproject.toml:33`; `docs/releases/CAP-001-v0.1.0-drill-record.md:36,50,123` (`schema_version=4`) | `tests/unit/test_release_excludes_test_paths.py` (TC-COMP-424); `tests/unit/test_distribution_contents.py` (TC-COMP-392, TC-COMP-425); `tests/integration/test_migrator_preserves_data.py` & `tests/integration/test_migrations_apply.py` (TC-COMP-015) | Application container migrates the empty drill store to version 4 before serving; populated-store bring-forward is verified by integration tests. |
| AC-16 | SATISFIED | `Dockerfile:28` (`migrate_main && exec ... app_main`); `compose.yaml:24,37-41,52-55` (`restart: unless-stopped`, `app` healthcheck requires `database == 'reachable'` and `schema_version is not None`, `ingestion` depends on `app` `service_healthy`) | `tests/unit/test_compose_definition.py:test_compose_app_and_ingestion_share_image_and_enforce_start_order` (TC-COMP-426); `tests/unit/test_release_excludes_test_paths.py` (TC-COMP-424); `tests/integration/test_migrator_refuses.py`; `tests/e2e/startup-refusal.spec.ts` (TC-E2E-012) | When the store is ahead of the image, `migrate_main` exits 2 before `app_main` is exec'd, `app` never becomes healthy, and `ingestion` never starts. |
| AC-18 | SATISFIED | `scripts/deploy-smoke.sh:100-130` (check 2 queries `GET http://127.0.0.1:8000/api/health` and verifies `database == "reachable"` and `schema_version == EXPECTED_SCHEMA_VERSION`); `docs/releases/CAP-001-v0.1.0-drill-record.md:48-53,121-126` | `tests/unit/test_deploy_smoke.py:test_smoke_reads_expected_schema_version_from_running_image` (TC-COMP-431), `test_smoke_accepts_pg_hba_rules_using_scram_peer_or_reject` (TC-COMP-427); drill smoke check runs (TC-COMP-397) | Health endpoint and smoke check report liveness, database reachability, and schema version without inspecting the store directly. |
| DAC-E1-21 | SATISFIED | `Dockerfile:1-28` (`interface`, `lock`, and release stages); `.dockerignore:1-11`; `pyproject.toml:33` (`"api/static/**/*"`) | `tests/unit/test_release_excludes_test_paths.py:test_out_of_date_uv_lock_fails_locked_export` (TC-COMP-394), `test_dockerfile_builds_bundle_installs_from_lock_and_runs_migrator_first` (TC-COMP-424); `tests/unit/test_distribution_contents.py` (TC-COMP-425); independent `docker build -t factorflow:test .` + `pip freeze` verification (TC-COMP-393) | Built image contains `factorflow/api/static/index.html` and exact `uv.lock` versions, fails when `uv.lock` is out of date, and excludes `node`, `uv`, and `web/`. |
| DAC-E1-22 | SATISFIED | `compose.yaml:1-58` | `tests/unit/test_compose_definition.py` (TC-COMP-395, TC-COMP-396, TC-COMP-426) | All three services use `network_mode: host` with no `ports:`, PostgreSQL binds `127.0.0.1` with `scram-sha-256` on host and local routes, secrets use `${...:?...}`, and `ingestion` renders only under `--profile ingestion` after `app` is healthy. |
| DAC-E1-23 | SATISFIED | `scripts/deploy-smoke.sh:1-305`; `docs/releases/CAP-001-v0.1.0-drill-record.md:38-54,116-126` | `tests/unit/test_deploy_smoke.py` (TC-COMP-398, TC-COMP-427 to TC-COMP-431, plus check 3, check 4, and static secret/run guards); owner drill smoke check (TC-COMP-397) | Verifies container health, `pg_hba.conf` methods, `GET /api/health` reachability and schema version, `GET /` `index.html`, and off-host listener absence on ports 8000 and 5432, exiting non-zero on the first failure. |
| DAC-E1-24 | SATISFIED | `README.md:1363-1415` (*Upgrade, backup and rollback*); `docs/releases/CAP-001-v0.1.0-drill-record.md:73-134` | `tests/unit/test_readme_deployment.py:test_readme_upgrade_takes_dump_first_and_rollback_restores_before_old_image` (TC-COMP-399, TC-COMP-400); owner drill record (TC-COMP-434) | Upgrade step 1 takes a `pg_dump -Fc` to `$FACTORFLOW_BACKUP_DIR` and stops on non-zero exit or empty file; rollback after migration restores the dump before starting `<old>`. |
| DAC-E1-S9-1 | SATISFIED | `Dockerfile:1-28`; `.dockerignore:1-11` | `tests/unit/test_release_excludes_test_paths.py:test_dockerfile_copies_nothing_under_tests`, `test_copy_sources_joins_line_continuations`, `test_dockerfile_builds_bundle_installs_from_lock_and_runs_migrator_first`, `test_dockerignore_excludes_test_and_local_static_paths` (TC-COMP-424) | All stage names, commands, flags (`--locked`, `--require-hashes`, `--no-deps`), `COPY` sources, `CMD`, and `.dockerignore` entries match specification. |
| DAC-E1-S9-2 | SATISFIED | `pyproject.toml:33` (`factorflow = ["coverage/sql/*.sql", "db/migrations/*.sql", "api/static/**/*"]`) | `tests/unit/test_distribution_contents.py:built_wheel`, `test_wheel_carries_the_migrations_and_nothing_under_tests` (TC-COMP-425) | `built_wheel` removes any host `src/factorflow/api/static` directory in the temp copy, writes a stub `index.html`, builds offline, and verifies the wheel contains `factorflow/api/static/index.html`, the 4 migrations, and nothing under `tests/`. |
| DAC-E1-S9-3 | SATISFIED | `compose.yaml:1-58` | `tests/unit/test_compose_definition.py` (TC-COMP-426, 4 test functions) | Text-based parser verifies every required property of `compose.yaml` without adding PyYAML. |
| DAC-E1-S9-4 | SATISFIED | `scripts/deploy-smoke.sh:51-92` (`ALLOWED = {"scram-sha-256", "peer", "reject"}` over `local` and `host*` records, rejecting empty rules or any other method) | `tests/unit/test_deploy_smoke.py:test_smoke_accepts_pg_hba_rules_using_scram_peer_or_reject` (TC-COMP-427), `test_smoke_fails_check_1_on_disallowed_pg_hba_method` (TC-COMP-428, parametrised over `trust`, `password`, `md5`) | Handles comments, inline `#` comments, blank lines, CIDR and netmask column layouts, and fails on any method outside `scram-sha-256`, `peer`, `reject`. |
| DAC-E1-S9-5 | SATISFIED | `scripts/deploy-smoke.sh:12,23-26,37-40,108,135` (`PROJECT="${1:-factorflow}"`, `label=com.docker.compose.project=${PROJECT}`, `curl --silent --show-error --fail --noproxy '*' --proto =http`) | `tests/unit/test_deploy_smoke.py:test_smoke_defaults_to_factorflow_project_and_uses_proxy_free_redirect_free_curl` (TC-COMP-429), `test_smoke_targets_project_named_by_its_argument` (TC-COMP-430) | Verified with default `factorflow` and argument `factorflow-drill`, and verified all `curl` invocations carry `--noproxy '*'` and `--proto =http` without `-L`. |
| DAC-E1-S9-6 | SATISFIED | `scripts/deploy-smoke.sh:100-128` (`docker exec "${APP_CONTAINER}" python -c "...discover(MIGRATIONS_DIR)..."`) | `tests/unit/test_deploy_smoke.py:test_smoke_reads_expected_schema_version_from_running_image` (TC-COMP-431) | When the image reports version 5 and `/api/health` reports `schema_version: 4`, check 2 fails and exits non-zero. |
| DAC-E1-S9-7 | SATISFIED | `README.md:1276-1349` (*First deployment*) | `tests/unit/test_readme_deployment.py:test_readme_first_deployment_runs_smoke_check_before_interface_or_ingestion` (TC-COMP-432) | Documents host networking precondition, `openssl rand -hex 24` (>=128 bits), all four variables, immutable `<version>-<shortsha>` tag rule, `docker compose up -d` → `scripts/deploy-smoke.sh` → `http://127.0.0.1:8000` and `docker compose --profile ingestion up -d`, and re-running after network changes. |
| DAC-E1-S9-8 | SATISFIED | `README.md:1355-1359,1374-1376,1392-1415,1434-1457` | `tests/unit/test_readme_deployment.py:test_readme_rollback_guards_destructive_steps_and_passes_pgpassword_to_exec` (TC-COMP-433) | `dropdb` is preceded by confirming the dump to restore, all 8 connecting `docker compose exec` commands pass `-e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD"`, and `docker compose -p factorflow-drill down -v` is preceded by confirming the project name. |
| DAC-E1-S9-9 | SATISFIED | `docs/releases/CAP-001-v0.1.0-drill-record.md:1-145`; `README.md:1416-1458` | `docs/releases/CAP-001-v0.1.0-drill-record.md` (TC-COMP-397, TC-COMP-434); `tests/unit/test_no_committed_secrets.py` | Drill executed on `factorflow-drill` (`0.1.0-4681531`) while no `factorflow` stack was running: pre-data smoke check passed, H6 and `openssl rand -hex 24` statements recorded, live-provider run completed, `pg_dump` taken and restored into an emptied DB, post-restore smoke check passed, `GET /api/coverage` before and after restore are byte-identical, and volume removed with `down -v` after confirming `factorflow-drill`. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tests/unit/test_release_excludes_test_paths.py:39-246` (`_join_continuation_lines`, `_copy_sources`, `_dockerfile_stages`, TC-COMP-424 and TC-COMP-394 tests) | Preserves E1-S7's `_ORIGIN_ALLOW_LIST_MODULE` / `_ORIGIN_ALLOW_LIST_PARTS` exemption intact. |
| T002 | complete | VERIFIED | `tests/unit/test_distribution_contents.py:30-75` (`_STUB_INDEX_HTML`, `built_wheel`, `test_wheel_carries_the_migrations_and_nothing_under_tests` `# Implements TC-COMP-425`) | Clears any existing `static_dir` in the temp copy before writing stub `index.html`. |
| T003 | complete | VERIFIED | `tests/unit/test_compose_definition.py:35-211` (4 test functions with `# Implements TC-COMP-426`) | Text-based parser without PyYAML; covers all `DAC-E1-S9-3` and `AC-16` healthcheck/restart clauses. |
| T004 | complete | VERIFIED | `tests/unit/test_deploy_smoke.py:225-287` (`TC-COMP-398`, `TC-COMP-427`, `TC-COMP-428` x3, `TC-COMP-431`) | Uses recording `docker`, `curl`, and `ifconfig` stubs on `PATH`. |
| T005 | complete | VERIFIED | `tests/unit/test_deploy_smoke.py:289-347` (`TC-COMP-429`, `TC-COMP-430`) | Verifies default `factorflow` and explicit `factorflow-drill` project labels plus `curl --noproxy '*' --proto =http` without `-L`. |
| T006 | complete | VERIFIED | `tests/unit/test_readme_deployment.py:20-187` (`TC-COMP-432`, `TC-COMP-399`, `TC-COMP-400`, `TC-COMP-433`) | Verifies ordering and exact command flags across `README.md`. |
| T007 | complete | VERIFIED | `tests/unit/test_compose_definition.py:213-220` (`test_secret_scanner_covers_compose_dockerignore_and_deploy_smoke`); `tests/unit/test_no_committed_secrets.py:30-38` | Confirms `compose.yaml`, `.dockerignore`, and `scripts/deploy-smoke.sh` are in `_in_scanned_scope`. |
| T008 | complete | VERIFIED | `tests/unit/test_deploy_smoke.py:352-458` (`test_smoke_check_3_fails_when_root_does_not_serve_index_html`, `test_smoke_check_4_fails_when_non_loopback_address_accepts_connection`, `test_smoke_check_4_host_probe_enumerates_ipv4_ipv6_and_link_local_with_zone`) | Uses `sitecustomize.py` hook to verify exact `(host, port)` probe list (`fe80::...%en0`, global IPv6, IPv4 × ports 8000, 5432) and simulated listener failure. |
| T009 | complete | VERIFIED | `tests/unit/test_deploy_smoke.py:460-495` (`test_smoke_syntax_and_static_secret_and_run_guard`) | Runs `bash -n` (and `shellcheck` if installed) and scans for forbidden secret vars and `/api/acquisition-runs`. |
| T010 | complete | VERIFIED | `tests/unit/test_compose_definition.py:223-327` (`TC-COMP-395`, `TC-COMP-396` x4) | Runs against live `docker compose config` when Docker Compose CLI is available. |
| T011 | complete | VERIFIED | `.dockerignore:1-11` | Lists all 11 required exclusions. |
| T012 | complete | VERIFIED | `Dockerfile:1-28`; `pyproject.toml:33` | Matches `component-design-runtime-config.md` §2.8.2 verbatim. |
| T013 | complete | VERIFIED | `compose.yaml:1-58`; `tests/unit/test_no_committed_secrets.py:30-38` | Matches `component-design-runtime-config.md` §2.8.3 verbatim. |
| T014 | complete | VERIFIED | `scripts/deploy-smoke.sh:1-305` (`chmod +x`, `#!/usr/bin/env bash`, `set -euo pipefail`) | Implements checks 1–4 per `component-design-runtime-config.md` §2.8.5. |
| T015 | complete | VERIFIED | `README.md:70-86,105-113,1269-1485,1664-1675` | Replaces source-checkout launch commands with the Compose deployment, smoke check, upgrade, backup, rollback, and drill procedures. |
| T016 | complete | VERIFIED | Re-run independently in this review: `uv build`, `uv run pytest -m 'not postgres'` (786 passed), `uv run pytest` (1060 passed), `npm run lint`, `npm run format`, `npx tsc --noEmit`, `npm run test` (297 passed), `npm run test:e2e` (18 passed), `docker build -t factorflow:test .`, `TC-COMP-393`, `TC-COMP-395`, `TC-COMP-396` | All suites and Docker checks pass. |
| T017 | complete | VERIFIED | `docs/releases/CAP-001-v0.1.0-drill-record.md:1-145` | Owner-run rehearsal on `factorflow-drill` (`0.1.0-4681531`) recorded with verbatim smoke-check outputs, H6 and password-generation statements, before/after `GET /api/coverage` JSON, dump metadata, and teardown verification. |
| T018 | complete | VERIFIED | Re-run independently: `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, `bash -n scripts/deploy-smoke.sh`, `uv run pytest tests/unit/test_no_committed_secrets.py` | All exit 0 with 0 warnings/errors. |
| T019 | complete | VERIFIED | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S9-tdd-evidence.yaml:1-169` | Records baseline and 4 TDD cycles (`release-image-and-wheel-bundle`, `compose-definition-and-secret-scan`, `deploy-smoke-check-script`, `readme-deployment-upgrade-and-rollback`) with `code_review_verdict: APPROVED`, `drift_detected: false`, `tests_executed: true`, `diff_sha256`, and `commit_hash: stage`. |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `docker build -t factorflow:test .` + image inspection / TC-COMP-393 | ADEQUATE | Independently executed during review: builds the 3-stage image, verifies `factorflow/api/static/index.html` (395 bytes) and 4 SQL migrations in the installed package, confirms `pip freeze` matches all 22 Linux-applicable locked packages from `uv export --locked --no-emit-project --format requirements.txt` 1:1, and confirms `node`, `uv`, `/app/web`, and `/build` are absent | none |
| `test_out_of_date_uv_lock_fails_locked_export` / TC-COMP-394 | ADEQUATE | Copies `pyproject.toml` and `uv.lock` to `tmp_path`, injects `requests>=2` without relocking, runs `uv export --locked --no-emit-project --format requirements.txt -o requirements.txt`, and asserts `returncode != 0` and `not req_out.exists()` | none |
| `test_docker_compose_config_renders_services_and_ingestion_profile` / TC-COMP-395 | ADEQUATE | Runs real `docker compose config` with test env vars; asserts default profile renders `{"postgres", "app"}`, `--profile ingestion` renders `{"postgres", "app", "ingestion"}`, `network_mode: host` appears 3 times, `ports:` is absent, and `@127.0.0.1:5432/factorflow?require_auth=scram-sha-256` is rendered | none |
| `test_docker_compose_config_fails_and_names_missing_variable` / TC-COMP-396 | ADEQUATE | Parametrised over all 4 required variables; pops each variable from the environment, runs `docker compose config`, and asserts `returncode != 0` and `missing_var in result.stderr` | none |
| `scripts/deploy-smoke.sh factorflow-drill` (owner-run) / TC-COMP-397 | ADEQUATE | Recorded in `docs/releases/CAP-001-v0.1.0-drill-record.md:38-54,116-126`: checks 1–4 passed (exit 0) both before any data entered the drill store and after database restore | none |
| `test_smoke_exits_nonzero_on_first_failed_check_when_app_unhealthy` / TC-COMP-398 | ADEQUATE | Stubs `app` health as `unhealthy`; asserts non-zero exit, `"check 1"` and `"app"` in output, zero `curl` calls, and no check 2–4 `docker` calls (`discover(MIGRATIONS_DIR)` or `docker run`) | none |
| `test_readme_upgrade_takes_dump_first_and_rollback_restores_before_old_image` / TC-COMP-399, TC-COMP-400 | ADEQUATE | Verifies `README.md` upgrade section places `pg_dump -U factorflow -d factorflow -Fc` to `$FACTORFLOW_BACKUP_DIR` and the non-zero/empty-file stop rule before `build app`, `stop ingestion`, `up -d`, `deploy-smoke.sh`, and `--profile ingestion up -d`; and verifies rollback-after-migration runs `stop ingestion app` → `dropdb` → `createdb` → `pg_restore --no-owner` → `up -d` `<old>` → `deploy-smoke.sh` → `--profile ingestion up -d` | none |
| `test_dockerfile_copies_nothing_under_tests`, `test_copy_sources_joins_line_continuations`, `test_dockerfile_builds_bundle_installs_from_lock_and_runs_migrator_first`, `test_dockerignore_excludes_test_and_local_static_paths` / TC-COMP-424 | ADEQUATE | Parses `Dockerfile` stages after joining `\` continuations; verifies `interface` (`node:22-slim`, `npm ci && npm run build`), `lock` (`python:3.12-slim`, `uv==0.12.10`, `uv export --locked`, no `--frozen`), release stage (`--require-hashes`, `--no-deps`, `COPY --from=interface`, `COPY --from=lock`, `CMD`), no `COPY`/`ADD` of `tests` or `migrations`, and all 11 `.dockerignore` entries | none |
| `test_wheel_carries_the_migrations_and_nothing_under_tests` / TC-COMP-425 | ADEQUATE | Removes any host `src/factorflow/api/static` in the temporary source copy, writes `_STUB_INDEX_HTML`, runs `uv build --wheel --offline`, and asserts `factorflow/api/static/index.html` (with exact stub content) and all 4 SQL migrations are in the wheel and no `tests/` entry exists | none |
| `test_compose_*` (4 functions in `test_compose_definition.py`) / TC-COMP-426 | ADEQUATE | Parses `compose.yaml` top-level sections and service blocks; verifies `name: factorflow`, no `ports:`, no `FACTORFLOW_API_HOST`, `network_mode: host` and `restart: unless-stopped` on all 3 services, PostgreSQL `127.0.0.1` listen and `scram-sha-256` env vars, local-socket `pg_isready` (no `-h`/`--host`), `FACTORFLOW_DATABASE_URL`, `${VAR:?...}` on all 4 variables, shared image, `app` `http.client` healthcheck, and `ingestion` profile/command/dependency | none |
| `test_smoke_accepts_pg_hba_rules_using_scram_peer_or_reject` / TC-COMP-427 | ADEQUATE | Verifies check 1 accepts `pg_hba.conf` containing comments, blank lines, and `local`/`host` rules with `scram-sha-256`, `peer`, and `reject` | none |
| `test_smoke_fails_check_1_on_disallowed_pg_hba_method` / TC-COMP-428 | ADEQUATE | Parametrised over `trust`, `password`, and `md5`; asserts check 1 fails with non-zero exit naming the disallowed method and makes zero `curl` calls | none |
| `test_smoke_defaults_to_factorflow_project_and_uses_proxy_free_redirect_free_curl` / TC-COMP-429 | ADEQUATE | Asserts default project filters `docker ps` by `label=com.docker.compose.project=factorflow` and every `curl` call includes `--noproxy '*'` and `--proto =http` and never `-L` or `--location` | none |
| `test_smoke_targets_project_named_by_its_argument` / TC-COMP-430 | ADEQUATE | Passes `factorflow-drill` and asserts every `docker ps` call filters by `label=com.docker.compose.project=factorflow-drill` | none |
| `test_smoke_reads_expected_schema_version_from_running_image` / TC-COMP-431 | ADEQUATE | Stubs `discover(MIGRATIONS_DIR)` in `app` container to print `5` while `/api/health` returns `schema_version: 4`; asserts check 2 fails and exits non-zero | none |
| `test_readme_first_deployment_runs_smoke_check_before_interface_or_ingestion` / TC-COMP-432 | ADEQUATE | Verifies `README.md` first-deployment section contains host networking precondition, `openssl rand -hex 24`, `128 bits`, all 4 variables, immutable tag rule, strict ordering (`docker compose up -d` < `scripts/deploy-smoke.sh` < `http://127.0.0.1:8000` and `--profile ingestion up -d`), and network-configuration re-run rule | none |
| `test_readme_rollback_guards_destructive_steps_and_passes_pgpassword_to_exec` / TC-COMP-433 | ADEQUATE | Verifies dump confirmation precedes `dropdb`, project-name confirmation precedes `docker compose -p factorflow-drill down -v`, and all 8 connecting `docker compose exec` commands pass `-e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD"` | none |
| Backup and restore drill record (`docs/releases/CAP-001-v0.1.0-drill-record.md`) / TC-COMP-434 | ADEQUATE | Owner-run rehearsal record documents all 6 steps on `factorflow-drill`, verbatim smoke outputs, H6 and `openssl rand -hex 24` statements, live-provider run completion, `pg_dump` / `dropdb` / `createdb` / `pg_restore`, byte-identical `GET /api/coverage` before and after restore, and confirmed `down -v` cleanup | none |
| Supplementary tests (`T007`, `T008`, `T009`) | ADEQUATE | `test_secret_scanner_covers_compose_dockerignore_and_deploy_smoke`, `test_smoke_check_3_fails_when_root_does_not_serve_index_html`, `test_smoke_check_4_fails_when_non_loopback_address_accepts_connection`, `test_smoke_check_4_host_probe_enumerates_ipv4_ipv6_and_link_local_with_zone`, and `test_smoke_syntax_and_static_secret_and_run_guard` thoroughly cover check 3, check 4 (both host `ifconfig` parsing with `%zone` and Docker Desktop VM probe), shell syntax, and secret/run guards | none |

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `uv run pytest tests/unit/test_release_excludes_test_paths.py tests/unit/test_distribution_contents.py tests/unit/test_compose_definition.py tests/unit/test_deploy_smoke.py tests/unit/test_readme_deployment.py tests/unit/test_no_committed_secrets.py -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 43 passed in 10.69s |
| `bash -n scripts/deploy-smoke.sh` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Syntax OK |
| `uv run ruff check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | All checks passed |
| `uv run ruff format --check .` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 193 files already formatted |
| `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Success: no issues found in 47 source files |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome checked 97 files, no fixes applied (after removing leftover `build/` dir; see IR-002) |
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Biome checked 97 files, no fixes applied |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Clean |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 41 test files, 297 passed (3.83s) |
| `uv build --out-dir /tmp/ir-e1s9-dist && unzip -l /tmp/ir-e1s9-dist/factorflow-*.whl && rm -rf /tmp/ir-e1s9-dist build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Built sdist and wheel; wheel contains `factorflow/api/static/index.html`, `factorflow/db/migrations/0001..0004.sql`, and no `tests/` entries |
| `docker build -t factorflow:test .` + TC-COMP-393 container verification | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 3-stage image built; `index.html` and 4 migrations present in installed package; 22 Linux-applicable locked packages in `pip freeze` match `uv export --locked` 1:1; `node`, `uv`, `/app/web`, and `/build` absent |
| `uv run pytest -m 'not postgres' -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 786 passed, 274 deselected (24.47s) |
| `uv run pytest -q` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 1060 passed in 229.13s (full suite including PostgreSQL testcontainers) |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 18 passed (2.9m) |
| `git status --porcelain -uall` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Empty (working tree clean) |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` | `/Users/alvarodejodra/Projects/ai-agents` | 0 | PASS | `sha256:7616e84d9cc44e1206efc6a26f1e4bce9c96c338acf77e762a0fedbdc15b3a49` (unchanged) |

### Validation Side Effects

- Before: `git status --porcelain -uall` empty; `reviewed_state_revision` = `sha256:7616e84d9cc44e1206efc6a26f1e4bce9c96c338acf77e762a0fedbdc15b3a49`; an ignored `build/` directory from a prior `uv build` was present on disk.
- After: `git status --porcelain -uall` empty; `reviewed_state_revision` unchanged (`sha256:7616e84d9cc44e1206efc6a26f1e4bce9c96c338acf77e762a0fedbdc15b3a49`). Temporary `/tmp/ir-e1s9-dist`, `build/`, and `factorflow:test` image were cleaned up.
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — `CAP-001-v0.1.0-drill-record.md` header cites non-existent repo-relative constitution paths

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S9-9
- **Tasks**: T017
- **Files**: `docs/releases/CAP-001-v0.1.0-drill-record.md:9`
- **Claim challenged**: Line 9 of `docs/releases/CAP-001-v0.1.0-drill-record.md` lists Governing Specifications as: `` `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/component-design-runtime-config.md` sections 2.8.4 and 2.8.5; `docs/constitution/standards/security-standards.md` v1.3 (`SEC-ENC-001` host-local loopback exception); `docs/constitution/standards/operational-standards.md` v1.3 (`OPS-MIG-003`, `OPS-DEST-001`) ``.
- **Observed evidence**: In `FactorFlow-v2`, `docs/constitution/standards/` contains only `ui-conventions.md`. The security and operational constitutions (`CONST-SEC` and `CONST-OPS`) are org-wide harness constitutions (`docs/constitutions/security.constitution.md` and `docs/constitutions/operational-safety.constitution.md` in the SDD harness), cited elsewhere in the repo as `CONST-SEC 1.3` and `CONST-OPS 1.3` (or `OPS-MIG-003` / `OPS-DEST-001`).
- **Expected evidence/behavior**: Citations in release evidence should name `CONST-SEC` v1.3 and `CONST-OPS` v1.3 (matching `CAP-001-E1-S9.md` and `README.md`) rather than non-existent paths under `docs/constitution/standards/`.
- **Impact**: Documentation-only citation inaccuracy in the drill record header; all required drill content (pre/post smoke check outputs, H6 and `openssl rand -hex 24` statements, live run, backup/restore commands, and coverage comparison) is complete and accurate.
- **Required remediation**: Optional cleanup during `$doc-sync` or release readiness v2: cite `CONST-SEC` v1.3 and `CONST-OPS` v1.3 instead of `docs/constitution/standards/security-standards.md` and `operational-standards.md`. Not blocking.

### IR-002 — `biome.json` `files.ignore` does not exclude setuptools' `build/**` directory

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E1-S9-2
- **Tasks**: T012
- **Files**: `biome.json:5`, `pyproject.toml:33`
- **Claim challenged**: `pyproject.toml` adds `"api/static/**/*"` to `[tool.setuptools.package-data]` so `uv build` packages the Vite bundle into the wheel.
- **Observed evidence**: When `uv build` runs on a working tree where `src/factorflow/api/static/assets/*.js` already exists (for example after `npm run build` or `npm run test`), setuptools copies those minified JS files into `build/lib/factorflow/api/static/assets/*.js`. Because `biome.json` has `"include": ["web/src/**/*.ts", "web/src/**/*.tsx", "*.ts", "*.js", "biome.json"]` (where Biome treats `*.js` as matching any `.js` path not in `ignore`) and `"ignore": ["src/factorflow/api/static/**", ".venv/**", "node_modules/**", "dist/**"]` without `"build/**"`, a subsequent `npm run lint` or `npm run format` on that checkout lints the minified bundle copy under `build/lib/factorflow/api/static/` unless `build/` is removed first.
- **Expected evidence/behavior**: `biome.json` wasn't in the story's change scope, and `npm run lint` / `npm run format` pass on a clean checkout (`Checked 97 files in 16ms. No fixes applied`), but adding `"build/**"` alongside `"dist/**"` in `biome.json` `files.ignore` would prevent local `uv build` artifacts from ever being scanned by Biome.
- **Impact**: Local developer convenience only when running `uv build` without `--out-dir` cleanup followed by `npm run lint`; clean checkouts and Docker builds are unaffected.
- **Required remediation**: Optional in a future touch of `biome.json`: add `"build/**"` to `files.ignore`. Not blocking.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- None. Every file in the 16-file change set traces directly to `CAP-001-E1-S9` and `CAP-001-E1-S9-tasks.md`.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: Proceed to `$doc-sync` for `CAP-001-E1-S9`.
- **Warnings accepted downstream**: IR-001, IR-002
