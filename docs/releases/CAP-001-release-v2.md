---
artifact_schema_version: 1
artifact_id: CAP-001-release
artifact_type: release-readiness
artifact_version: 2
status: approved
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-12
updated: 2026-10-16
capability_id: CAP-001
release_id: CAP-001-v0.1.0
release_version: 0.1.0
release_commit: 373d25614724a38a7c739482e08bc3df56947c51
operational_owner: Alvaro de Jodra
rollback_owner: Alvaro de Jodra
verdict: READY
ai_provenance:
  agent_id: release-readiness-agent
  agent_version: "1.0"
  model: gemini-4-argon-medium
  tool: Devin
  tool_version: "unknown"
  timestamp: 2026-10-15T23:02:00Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-coverage-matrix
      version: "3"
    - id: CAP-001-component-tests
      version: "3"
    - id: CAP-001-integration-tests
      version: "2"
    - id: CAP-001-e2e-tests
      version: "1"
    - id: CAP-001-integration-tests-automation-tasks
      version: "3"
    - id: CAP-001-e2e-tests-automation-tasks
      version: "2"
    - id: CAP-001-integration-tests-automation-review
      version: "3"
    - id: CAP-001-e2e-tests-automation-review
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
approval:
  approval_policy: owner-allowed
  approved_by: "Alvaro de Jodra"
  approved_at: 2026-10-16T01:40:22Z
  reviewed_revision: sha256:1cffd046a1afb93fa8ba03da8e8a54abd10e85085d75255ae61d3594fad87132
  review_artifact: "docs/releases/CAP-001-release-review-v1.md"
---

# Release Readiness: CAP-001 — CAP-001-v0.1.0

**Verdict: READY.** Every blocker recorded in `docs/releases/CAP-001-release-v1.md` (`B1`–`B5`) is resolved, all 41 stories are `done` with passing adversarial implementation reviews, both integration and E2E automation reviews pass at the current repository fingerprint, the pre-release backup/restore rehearsal (`docs/releases/CAP-001-v0.1.0-drill-record.md`) passed, and the production `factorflow` Compose stack (`factorflow:0.1.0-373d256`) is deployed, verified by `scripts/deploy-smoke.sh`, and verified post-release against the live Massive provider.

Resolution of `CAP-001-release-v1.md` blockers:

1. **B1 — Release image applies migrations (`CAP-001-E1-S8`, `9696b74`).** SQL migrations `0001_extensions_owner_state.sql` through `0004_runs.sql` live in `src/factorflow/db/migrations/`, `migrate_main.MIGRATIONS_DIR` resolves them adjacent to the module, and `[tool.setuptools.package-data]` ships `"db/migrations/*.sql"`. Both the `factorflow-drill` rehearsal (`0.1.0-4681531`) and the production `factorflow` deployment (`0.1.0-373d256`) migrated an empty store to `schema_version=4` on startup.
2. **B2 — Missing migrations directory refuses startup (`EXP-20261012-1`, `ebdfc9a`).** `discover()` in `src/factorflow/db/migrator.py` raises `MigrationError` when the migrations directory does not exist, and `run_migrations` returns exit code `4` before opening any database connection.
3. **B3 — Release image serves the owner interface (`CAP-001-E1-S9`, `528eb76`).** The three-stage `Dockerfile` builds the Vite bundle in `node:22-slim`, copies `/build/src/factorflow/api/static` into the release stage, and packages `"api/static/**/*"` in the wheel. `scripts/deploy-smoke.sh` Check 3 confirms `GET http://127.0.0.1:8000/` serves `index.html`.
4. **B4 — Two-process host-network deployment definition (`CAP-001-E1-S7` `565b7ba`, `CAP-001-E1-S8` `9696b74`, `CAP-001-E1-S9` `528eb76`).** `compose.yaml` runs `postgres:16`, `app`, and `ingestion` (under `profiles: [ingestion]`) on `network_mode: host` with no published ports, `listen_addresses=127.0.0.1`, `scram-sha-256` authentication on every route, `DatabaseSettings` loopback confinement (`H7`), and API `Host`/`Origin` middleware (`H9`).
5. **B5 — Owner runbook, backup/rollback rehearsal, and post-release verification (`CAP-001-E1-S9`, `528eb76`).** `README.md` (*Deploying and operating FactorFlow* and *Running the migrator*) documents first deployment, `scripts/deploy-smoke.sh`, password rotation, upgrade, backup, and both rollback branches; `docs/releases/CAP-001-v0.1.0-drill-record.md` records the executed backup/restore rehearsal; and the production deployment and post-release live-provider run are recorded below.

## Acceptance-Criterion Coverage

All 41 stories in `CAP-001` are `done`, and every story's latest adversarial implementation review passes (`36` `PASS-WITH-WARNINGS`, `5` `PASS`). The full validation suite passed at code fingerprint `sha256:74b5a227951ba0c9160a5c7fede18c6e05832bff4098ade4ca8ab4f098dc8ef7` (`uv run pytest` `1060/1060`, `npm run test` `297/297`, `npm run test:e2e` `18/18`). Test IDs match `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/coverage-matrix.md` v3.

| AC ID | Evidence | Result |
| --- | --- | --- |
| AC-1 | E1-S1, E2-S1, E2-S3, E2-S4, E1-S9; TC-COMP-001, TC-INT-001, TC-INT-002, TC-E2E-001, TC-E2E-009; verified in `factorflow:0.1.0-373d256` (`GET /` serves owner interface; `AAPL`, `DELL`, `MSFT` added via UI) | PASS |
| AC-2 | E1-S1, E2-S2, E2-S4; TC-COMP-002, TC-INT-006, TC-INT-007, TC-E2E-001; verified in `factorflow:0.1.0-373d256` (`history_depth_years=1` stated before first run) | PASS |
| AC-3 | E3-S1, E3-S6, E3-S7, E4-S4, E4-S5; TC-COMP-003, TC-COMP-389, TC-INT-021–024, TC-E2E-001, TC-E2E-009; live Massive provider run `bde9de3b-b372-4dd2-a9ed-4ae1e3245945` acquired reference, daily prices, and corporate actions over `2025-10-15`–`2026-10-15` | PASS |
| AC-4 | E2-S4, E3-S4, E4-S5, E4-S7; TC-COMP-004 (3000-instrument volume test in full `uv run pytest`, `1060/1060` passed) | PASS |
| AC-5 | E3-S2, E4-S1, E4-S2, E4-S3; TC-COMP-005 (`tests/integration/test_observation_append.py`, append-only point-in-time records) | PASS |
| AC-6 | E4-S1–S4, E4-S6, E4-S7, E7-S4; TC-COMP-006, TC-E2E-005, TC-E2E-009 (idempotent re-run without duplicate or overwritten observations) | PASS |
| AC-7 | E4-S3, E5-S1, E6-S1, E6-S3, E6-S4; TC-COMP-007, TC-INT-017, TC-E2E-001, TC-E2E-003; verified on `GET /api/coverage` in `factorflow:0.1.0-373d256` (`AAPL`, `DELL`, `MSFT` presence, `2025-10-15`–`2026-10-15`, `last_acquired_at`) | PASS |
| AC-8 | E3-S1, E6-S2, E6-S3, E6-S4; TC-COMP-008, TC-E2E-003; verified on `GET /api/coverage` in `factorflow:0.1.0-373d256` (`gap_detection.available: true`, `gap_count: 0`) | PASS |
| AC-9 | E4-S5, E4-S6, E5-S1, E5-S3, E5-S5, E5-S6, E7-S1, EXP-20261011-1; TC-COMP-009, TC-INT-011, TC-E2E-002, TC-E2E-005; verified in production run `bde9de3b-b372-4dd2-a9ed-4ae1e3245945` recorded as `partial` (`8` `written`, `4` `failed`) | PASS |
| AC-10 | E4-S3, E4-S6, E5-S1, E5-S5, E5-S6, E7-S1, E7-S2, E7-S4; TC-COMP-010, TC-INT-012, TC-INT-013, TC-E2E-002, TC-E2E-005; verified on `GET /api/acquisition-runs/bde9de3b-b372-4dd2-a9ed-4ae1e3245945` showing affected symbol, data type, and `[unavailable]` reason | PASS |
| AC-11 | E3-S3–S5, E4-S5, E4-S6, E7-S1, E7-S4; TC-COMP-011, TC-INT-025, TC-E2E-006 | PASS |
| AC-12 | E3-S3, E4-S3, E4-S7, E5-S1, E5-S4, E6-S1; TC-COMP-012, TC-E2E-002; verified in production run `bde9de3b-b372-4dd2-a9ed-4ae1e3245945` where failed `fundamentals` / `corporate_actions` data types remain `absent` in `GET /api/coverage` | PASS |
| AC-13 | E1-S2, E1-S3, E1-S5, E1-S8, E1-S9, E3-S1, E3-S5–S7; TC-COMP-013, TC-COMP-389–391, TC-COMP-396, TC-COMP-426, TC-E2E-011; `compose.yaml` `${VAR:?...}` interpolation, `SecretStr`, `RedactingFilter`, `GET /api/health` exposes only `credential_present: true` | PASS |
| AC-14 | E1-S3, E1-S4, E1-S6, E1-S7, E1-S8, E1-S9; TC-COMP-014, TC-COMP-387–388, TC-COMP-395, TC-COMP-397, TC-COMP-426–430, TC-E2E-011; `ApiSettings` loopback bind, `Host`/`Origin` middleware (`H9`), PostgreSQL `listen_addresses=127.0.0.1`, and `scripts/deploy-smoke.sh` Check 4 `PASS` on `factorflow` | PASS |
| AC-15 | E1-S1, E1-S2, E1-S8, E1-S9, E5-S1; TC-COMP-015, TC-COMP-392, TC-COMP-424, TC-COMP-425, TC-E2E-011; `factorflow:0.1.0-373d256` migrated `factorflow-pgdata` through `0001`–`0004` (`schema_version=4`), verified by `scripts/deploy-smoke.sh` Check 2 | PASS |
| AC-16 | E1-S2, E1-S5, E1-S8, E1-S9, E3-S6, EXP-20261012-1; TC-COMP-016, TC-COMP-391, TC-COMP-424, TC-COMP-426, TC-E2E-012; missing directory exits `4` (`EXP-20261012-1`), store ahead of build exits `2`, and `ingestion` waits on `app` `service_healthy` | PASS |
| AC-17 | E2-S4, E5-S6, E6-S1, E6-S3, E6-S4, E7-S3; TC-COMP-017, TC-E2E-004; verified in `docs/releases/CAP-001-v0.1.0-drill-record.md` (`never_acquired: true` when no observations exist) | PASS |
| AC-18 | E1-S5, E1-S6, E1-S9, E5-S4, E7-S3; TC-COMP-018, TC-COMP-397, TC-COMP-431, TC-INT-020, TC-E2E-011; verified on `GET /api/health` and `scripts/deploy-smoke.sh` Check 2 in `factorflow:0.1.0-373d256` | PASS |
| AC-19 | E4-S5, E5-S3, E5-S5, E7-S4; TC-COMP-019, TC-INT-014, TC-E2E-007, TC-E2E-008 | PASS |
| AC-20 | E4-S7, E5-S4; TC-COMP-020 (`reclaim_stale_runs` periodic sweep in `app` lifespan) | PASS |
| AC-21 | E1-S1, E2-S1, E2-S4, E6-S1, E6-S3, E6-S4; TC-COMP-021, TC-INT-004, TC-E2E-010 | PASS |
| AC-22 | E4-S4, E6-S4; TC-COMP-022 | PASS |
| AC-23 | E4-S5, E5-S2, E5-S5, E5-S6; TC-COMP-023, TC-INT-009 | PASS |
| AC-24 | E5-S5, E5-S6; TC-COMP-024, TC-INT-010 | PASS |
| AC-25 | E2-S4; TC-COMP-025, TC-E2E-010 | PASS |
| AC-26 | E5-S3, E5-S5, E5-S6, E7-S4; TC-COMP-026, TC-INT-015, TC-E2E-007 | PASS |

## Integration and E2E Coverage

| Evidence | Result | Revision |
| --- | --- | --- |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/integration/integration-tests.md` v2 (`TC-INT-001`–`027`), task plan v3 (`30/30` tasks), `integration-tests-automation-review-v3.md` (`PASS-WITH-WARNINGS`: 0 critical, 0 high, 1 medium, 3 low; `283/283` integration tests, `1060/1060` full pytest, `18/18` Playwright E2E) | PASS | `sha256:74b5a227951ba0c9160a5c7fede18c6e05832bff4098ade4ca8ab4f098dc8ef7` |
| `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/e2e/e2e-tests.md` v1 (`TC-E2E-001`–`012`), task plan v2 (`16/16` tasks), `e2e-tests-automation-review-v4.md` (`PASS-WITH-WARNINGS`: 0 critical, 0 high, 2 medium, 4 low; `18/18` Playwright E2E, `297/297` Vitest, `1060/1060` full pytest) | PASS | `sha256:74b5a227951ba0c9160a5c7fede18c6e05832bff4098ade4ca8ab4f098dc8ef7` |

Both recorded revisions match `python3 scripts/pipeline-state.py automation-revision` at release commit `373d25614724a38a7c739482e08bc3df56947c51`.

## Security and Privacy Review

| Result | Evidence | Owner |
| --- | --- | --- |
| PASS | **Credentials and secrets (`AC-13`, `SEC-SEC-001`, `SEC-SEC-002`, `SEC-DAT-001`, `SEC-DAT-003`):** `FACTORFLOW_MASSIVE_API_KEY`, `FACTORFLOW_POSTGRES_PASSWORD`, and `FACTORFLOW_DATABASE_URL` are classified Restricted, supplied from the owner's environment via `${VAR:?...}` in `compose.yaml` (`TC-COMP-396`, `TC-COMP-426`), wrapped in `SecretStr` (`TC-COMP-013`, `test_settings_secrecy.py`), redacted from all log records by `RedactingFilter` (`test_redaction.py`), reloaded per run claim without container restart (`test_credential_reload.py`), never rendered (`GET /api/health` exposes only `credential_present`), and absent from all tracked files (`test_no_committed_secrets.py`). **Provider egress (`SEC-ENC-001`, `SEC-NDG-001`, `EXP-20261009-1` ER-002):** `FACTORFLOW_MASSIVE_BASE_URL` defaults to `https://api.massive.com` and redirects all provider egress only to a validated `https` URL in the release build (`test_settings_base_url.py`); the loopback `http` test-double allowance (`CONST-SEC` 1.3 `SEC-ENC-001 loopback test-double exception`, `DEC-0036`, `DEC-0051`) lives exclusively in `tests/e2e/support/ingestion_e2e_main.py`, which is excluded from the wheel and the release image (`DEC-0033`, `DEC-0034`, `TC-COMP-364`, `TC-COMP-424`, `TC-COMP-425`) and accepts only per-run `^TEST-ONLY-[0-9a-f]{32,}$` keys (`DEC-0037`). **Host-local plaintext channels (`CONST-SEC` 1.3 `SEC-ENC-001 host-local loopback exception`, `DEC-0050`, `component-design-runtime-config.md` §2.8.1 conditions H1–H9):** (H1/H3) `ApiSettings` loopback validator (`127.0.0.1:8000`), PostgreSQL `listen_addresses=127.0.0.1`, `network_mode: host` with no `ports:` (`TC-COMP-395`, `TC-COMP-426`); (H2) `127.0.0.1` client endpoints without proxy or redirect (`http.client`, `curl --noproxy '*' --proto =http` without `-L`, `TC-COMP-429`, `README.md` `http://127.0.0.1:8000` `TC-COMP-432`); (H4) `scram-sha-256` required on client and server (`require_auth=scram-sha-256`, `POSTGRES_HOST_AUTH_METHOD: scram-sha-256`, `POSTGRES_INITDB_ARGS: --auth-host=scram-sha-256 --auth-local=scram-sha-256`), verified in `$PGDATA/pg_hba.conf` by `scripts/deploy-smoke.sh` Check 1 (`TC-COMP-427`, `TC-COMP-428`), and **owner statement (H4)** confirmed for both `factorflow-drill` and production `factorflow`: *"FACTORFLOW_POSTGRES_PASSWORD was generated with `openssl rand -hex 24` (192 bits from a cryptographically secure generator)"*; (H5) channels carry Internal data only; (H6) **owner statement (H6)** confirmed for both `factorflow-drill` and production `factorflow`: *"No account outside the owner's control can run processes on the host"*; (H7) `DatabaseSettings._confine_plaintext_to_loopback` (`CAP-001-E1-S8`, `TC-COMP-389`–`391`) confines `migrate_main`, `app_main`, and `ingestion_main` to loopback unless `sslmode=verify-full`; (H8) `scripts/deploy-smoke.sh` Check 4 passed before data entry on `factorflow-drill` (`docs/releases/CAP-001-v0.1.0-drill-record.md`) and on production `factorflow` (`0.1.0-373d256`); (H9) `Host` (`400 host_not_allowed`) and state-changing `Origin` (`403 origin_not_allowed`) middleware in `src/factorflow/api/app.py` (`CAP-001-E1-S7`, `TC-COMP-387`–`388`). **Supply chain and privacy (`SEC-DEP-001`–`003`):** dependency/license audit recorded in `EXP-20260922-1`; `Dockerfile` exports `uv.lock` with `--locked` and installs with `--require-hashes` (`TC-COMP-393`, `TC-COMP-394`, `TC-COMP-424`). No PII is processed or stored | Alvaro de Jodra |

## Migration and Rollback

| Result | Migration evidence | Rollback procedure and verification |
| --- | --- | --- |
| PASS | Forward-only SQL migrations `0001_extensions_owner_state.sql` (`1`), `0002_observations.sql` (`2`), `0003_coverage.sql` (`3`), and `0004_runs.sql` (`4`) are packaged in `src/factorflow/db/migrations/` (`CAP-001-E1-S8`, `TC-COMP-392`, `TC-COMP-425`) and applied under advisory lock by `python -m factorflow.db.migrate_main` before `app_main` starts (`Dockerfile` `CMD`, `AC-15`, `AC-16`). A missing migrations directory exits `4` before connecting (`EXP-20261012-1`), and a store ahead of the build exits `2` (`TC-COMP-016`, `TC-E2E-012`). Verified on `factorflow-drill` (`0.1.0-4681531`) and on the production `factorflow` deployment (`0.1.0-373d256`, `scripts/deploy-smoke.sh` Check 2: `health database=reachable, schema_version=4`). | Rollback owner: `Alvaro de Jodra`. Procedure documented in `README.md` (*Upgrade, backup and rollback*) and `component-design-runtime-config.md` §2.8.4 (`OPS-MIG-003` branch (a), `OPS-DEST-001`, `TC-COMP-399`, `TC-COMP-400`, `TC-COMP-433`): (1) pre-upgrade backup via `docker compose exec -T -e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD" postgres pg_dump -U factorflow -d factorflow -Fc > "$FACTORFLOW_BACKUP_DIR/factorflow-<old>-<ts>.dump"`; (2) rollback without migration: `docker compose stop ingestion`, `FACTORFLOW_IMAGE_TAG=<old> docker compose up -d`, `scripts/deploy-smoke.sh`, `FACTORFLOW_IMAGE_TAG=<old> docker compose --profile ingestion up -d`; (3) rollback after migration: confirm dump file to restore (`OPS-DEST-001`), `docker compose stop ingestion app`, `dropdb`/`createdb` with `-e PGPASSWORD="$FACTORFLOW_POSTGRES_PASSWORD"`, `pg_restore -U factorflow -d factorflow --no-owner < "$FACTORFLOW_BACKUP_DIR/<dump>"`, `FACTORFLOW_IMAGE_TAG=<old> docker compose up -d`, `scripts/deploy-smoke.sh`, and `FACTORFLOW_IMAGE_TAG=<old> docker compose --profile ingestion up -d`. Rehearsed end-to-end in `docs/releases/CAP-001-v0.1.0-drill-record.md` (`2026-10-15T01:32:45Z`–`2026-10-15T01:49:00Z` on `factorflow-drill`, dump `27,439` bytes `sha256:f5a0f79f2ac2ee954008f494674bfcc5be1b5f3fc7fad8cb4f48031dd9af6a5b`, `scripts/deploy-smoke.sh factorflow-drill` exit `0` before and after restore, byte-identical `GET /api/coverage` before and after restore, and confirmed `down -v` teardown). |

## Observability and Operational Readiness

| Result | Operational owner | Signals, alerts, and runbook |
| --- | --- | --- |
| PASS | Alvaro de Jodra | **Health and status signals (`AC-18`, `DAC-E7-8`, `TC-COMP-018`, `TC-INT-020`, `TC-E2E-011`):** `GET http://127.0.0.1:8000/api/health` reports `status`, `database` (`reachable`/`unreachable`), `credential_present`, `schema_version`, and `most_recent_run` (`run_id`, `state`, `ended_at`); the owner interface status region polls every 30s (`STD-UI-25`) and renders `Answering`/`Not answering` plus the latest run outcome badge; `compose.yaml` runs 5s `pg_isready` (Unix socket) and `http.client` `/api/health` container healthchecks with `restart: unless-stopped`. **Structured logging and failure diagnosis (`AC-9`, `AC-10`, `DAC-E7-6`, `DAC-E7-7`, `DAC-E7-12`):** container stdout/stderr (`docker compose logs`) emits structured records with per-request `request_id` (`X-Request-Id`), redacted by `RedactingFilter`; run detail (`GET /api/acquisition-runs/{id}` and `/runs/:runId`) surfaces per-instrument, per-data-type outcomes and safe failure reasons carrying `symbol`, `data_type`, and provider `request_id`. **Automatic stale-claim recovery (`AC-20`, `TC-COMP-020`):** `reclaim_stale_runs` runs every 5s in the `app` lifespan, transitioning claimed runs whose heartbeat exceeds `stale_after_seconds` (900s default) to `abandoned`. **Runbook (`README.md` *Deploying and operating FactorFlow* and *Running the migrator*, `TC-COMP-399`, `TC-COMP-400`, `TC-COMP-432`, `TC-COMP-433`):** covers first deployment, `scripts/deploy-smoke.sh` checks 1–4, password rotation, upgrade, backup, both rollback branches, and migrator exit codes `0`–`4`. Single owner-operator self-hosted deployment (`Capability-CAP-001.md` §2/§5.3: owner-triggered runs, no external pager). |

## Deployment Evidence

| Result | Environment | Commit/tag | Validation |
| --- | --- | --- | --- |
| PASS | Self-hosted Docker Compose (`compose.yaml`, project `factorflow`) on the owner's macOS host (Darwin 27.0.0, Docker Engine 28.3.2 with host networking enabled); `postgres:16`, `factorflow-app-1`, and `factorflow-ingestion-1` on `network_mode: host` (`127.0.0.1:5432` and `127.0.0.1:8000`), volume `factorflow-pgdata` | Commit `373d25614724a38a7c739482e08bc3df56947c51` (`cdbad94`), image `factorflow:0.1.0-373d256` (`sha256:abfe6dd48b35238f65acadf39a73938e26c61554cf6605790b33ded82b9f2f67`) | `docker build -t factorflow:0.1.0-373d256 .` exited `0`; `docker compose up -d` started `factorflow-postgres-1` (`healthy`) and `factorflow-app-1` (`healthy`, applied migrations `0001`–`0004`); `scripts/deploy-smoke.sh` exited `0` (`PASS: Check 1 (postgres and app healthy; pg_hba.conf methods verified)`, `PASS: Check 2 (health database=reachable, schema_version=4)`, `PASS: Check 3 (GET / serves index.html)`, `PASS: Check 4 (no off-host listener on port 8000 or 5432)`); `docker compose --profile ingestion up -d` started `factorflow-ingestion-1` (`Up`). Pre-release rehearsal on `factorflow-drill` (`0.1.0-4681531`) recorded in `docs/releases/CAP-001-v0.1.0-drill-record.md`. |

## Release Approval

| Field | Evidence |
| --- | --- |
| Approval status | Pending independent release review and owner approval |
| Release approver | Alvaro de Jodra |

## Post-Release Validation

| Result | Verified at | Evidence and follow-up |
| --- | --- | --- |
| PASS | 2026-10-15T22:58:09Z | On the running production `factorflow` deployment (`factorflow:0.1.0-373d256`), `scripts/deploy-smoke.sh` exited `0` across all four checks. The owner opened `http://127.0.0.1:8000`, set `history_depth_years` to `1`, added active instruments `AAPL`, `DELL`, and `MSFT`, and triggered live-provider acquisition run `bde9de3b-b372-4dd2-a9ed-4ae1e3245945` (`requested_at=2026-10-15T22:57:56.591318Z`, `started_at=2026-10-15T22:57:57.201595Z`, `ended_at=2026-10-15T22:58:09.501427Z`, `instruments_named=3`). The run reached terminal state `partial` (`8` data-type outcomes `written` across `AAPL`, `DELL`, and `MSFT` for `reference`, `prices`, and `corporate_actions`; `4` data-type outcomes `failed` with `[unavailable]` reasons after 3 attempts). `GET http://127.0.0.1:8000/api/health` returned `200` with `{"status":"ok","database":"reachable","credential_present":true,"schema_version":4,"most_recent_run":{"run_id":"bde9de3b-b372-4dd2-a9ed-4ae1e3245945","state":"partial","ended_at":"2026-10-15T22:58:09.501427Z"}}`. `GET http://127.0.0.1:8000/api/coverage` returned `200` with `never_acquired: false`, `gap_detection: {"available": true, "reason": null}`, and covered range `2025-10-15` to `2026-10-15` (`gap_count: 0`, `depth_short_by_years: null`) for `AAPL`, `DELL`, and `MSFT`. Follow-up: re-run `scripts/deploy-smoke.sh` after every `docker compose up -d` and after any host network configuration change (`SEC-ENC-001` condition `H8`). |
