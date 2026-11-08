---
artifact_schema_version: 1
artifact_id: CAP-002-release
artifact_type: release-readiness
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
capability_id: CAP-002
release_id: CAP-002-v0.2.0
release_version: 0.2.0
release_commit: 829c9e1684c19f61ca015a82f6853fe769be4b26
operational_owner: Alvaro de Jodra
rollback_owner: Alvaro de Jodra
verdict: NOT-READY
ai_provenance:
  agent_id: release-readiness-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: unknown
  timestamp: "2026-11-07T16:05:00Z"
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "4"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: CAP-002-integration-tests
      version: "1"
    - id: CAP-002-e2e-tests
      version: "1"
    - id: CAP-002-integration-tests-automation-tasks
      version: "1"
    - id: CAP-002-e2e-tests-automation-tasks
      version: "1"
    - id: CAP-002-integration-tests-automation-review
      version: "5"
    - id: CAP-002-e2e-tests-automation-review
      version: "6"
    - id: EXP-20261107-3
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Release Readiness: CAP-002 — CAP-002-v0.2.0

**Verdict: NOT-READY.** The code is complete and verified:

- All 37 stories are `done`, and every latest implementation review passes (34 `PASS-WITH-WARNINGS`, 3 `PASS`).
- Both automation reviews pass at the release commit's automation revision.
- `factorflow:0.2.0-829c9e1` is deployed to production, and all four `scripts/deploy-smoke.sh` checks pass.

Post-release validation against the live Massive provider found three blockers. Together they mean production cannot yet deliver the capability as specified.

| ID | Blocker | Kind | Owner action to close |
| --- | --- | --- | --- |
| B1 | Value and growth never classify in production. The owner's Massive plan answers `403` "You are not entitled to this data. Please upgrade your plan" for financial statements (`/stocks/financials/v1/income-statements`). The `fundamentals` data type failed for all 42 stocks on both post-release runs, and value and growth read `not_enough_stocks`, "0 of 30 stocks qualified". The capability's assumption (section 6) that acquired statements carry the factors' line items fails for every stock. Section 6 says such a widespread absence must be raised with the owner. | Provider entitlement | Upgrade the Massive plan to include financial statements |
| B2 | The provider rate-limits the configured request rate. With `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE=60`, Massive answered `429` "exceeded the maximum requests per minute". On the second run, reference data failed for 17 stocks and corporate actions for 32, recorded as `[unavailable] … The provider failed 3 consecutive attempts.` | Runtime configuration | Set `FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE` to the plan's limit, or raise the plan |
| B3 | Momentum is scored for stocks whose corporate actions were never acquired. The momentum statement joins dividends with a `LEFT JOIN` (factor-engine design §2.4), so a stock with no `corporate_action` rows is scored as if it paid no dividend and never split. 31 of the 42 stocks scored on momentum have none, including dividend payers such as JNJ, KO, PG and XOM. Their total return, score and percentile omit dividends without being marked. This conflicts with AC-7 (exactly the inputs defined) and AC-12 (no score unless every input is present). | CAP-002 product gap | A design decision on how absent or unacquired corporate actions qualify momentum, then a fix |

B2 removes the trigger for B3 on this deployment, but B3 is a product gap regardless: any failed corporate-action acquisition reproduces it.

## Acceptance-Criterion Coverage

The test IDs are from `docs/capabilities/CAP-002-universe-and-factor-classification/tests/coverage-matrix.md` v1: 197 component, 58 integration and 12 E2E cases, covering 266 criteria with no gaps. Full validation passed at the release commit:

- `uv run --offline pytest`: 2610 passed.
- `npm run test`: 2101 passed.
- `npm run test:e2e`: 31 passed, 0 skipped.

These are integration review v5 and e2e review v6. "Production" names what the post-release runs showed.

| AC ID | Evidence | Result |
| --- | --- | --- |
| AC-1 | E1-S3, E1-S6, E1-S7; TC-COMP-001–007, TC-INT-001–004, TC-E2E-003, TC-E2E-004 | PASS |
| AC-2 | E1-S5, E4-S8; TC-COMP-008–016, TC-INT-005–008, TC-E2E-005, TC-E2E-006 | PASS |
| AC-3 | E1-S1, E1-S3, E1-S7; TC-COMP-017–022, TC-INT-001, TC-INT-009, TC-INT-010, TC-E2E-003, TC-E2E-011 | PASS |
| AC-4 | E1-S3, E1-S4, E1-S6, E1-S8, E1-S9; TC-COMP-019, TC-COMP-023–032, TC-INT-003, TC-INT-004, TC-INT-010–016, TC-E2E-011 | PASS |
| AC-5 | E1-S3–S9, E4-S8; TC-COMP-008, TC-COMP-009, TC-COMP-033–044, TC-INT-008, TC-INT-017, TC-INT-018, TC-E2E-004, TC-E2E-006, TC-E2E-012 | PASS |
| AC-6 | E1-S1, E1-S2, E1-S4, E1-S6, E1-S8, E1-S9; TC-COMP-034–058, TC-INT-014, TC-INT-016, TC-INT-019–024, TC-E2E-011, TC-E2E-012 | PASS |
| AC-7 | E2-S2, E2-S3, E2-S4; TC-COMP-059–066 and TC-INT-025 pass. The payload keys are bound (DEC-0295, EXP-20261107-1). Production: blocked. Value and growth cannot be computed (B1), and momentum omits dividends for 31 stocks with no acquired corporate actions (B3) | FAIL |
| AC-8 | E2-S5; TC-COMP-067, TC-COMP-068, TC-INT-026 | PASS |
| AC-9 | E2-S5, E3-S2, E3-S5, E4-S2, E4-S3, E4-S6, E4-S9; TC-COMP-069–074, TC-INT-027, TC-E2E-001, TC-E2E-007. Production: momentum shows a score and a 0–100 percentile for all 42 stocks (AAPL score `0.355702`, percentile `75.609756`) | PASS |
| AC-10 | E2-S1, E2-S2, E2-S8, E2-S9, E3-S6; TC-COMP-075–089, TC-INT-028–030, TC-E2E-001. Production: a set was built without user action after each run. These were the CAP-001 run `3a420cea…` at startup, then `30981181…` and `47a36af7…`, each `partial` | PASS |
| AC-11 | E2-S2, E2-S7, E2-S9, E4-S6, E4-S9; TC-COMP-090–093 (3000-instrument build), TC-INT-031 (4.11 s against 300 s). Production: the set for run `47a36af7…` was complete at 15:56:21.381Z, 1.6 s after the run ended at 15:56:19.822Z | PASS |
| AC-12 | E2-S3, E2-S5, E3-S2, E4-S2, E4-S3, E4-S6, E4-S9; TC-COMP-072, 073, 094–099, TC-INT-032, TC-INT-033, TC-E2E-001, TC-E2E-008–010 pass. Production: momentum is scored for 31 stocks whose corporate actions were never acquired (B3) | FAIL |
| AC-13 | E2-S3, E2-S4, E3-S1, E3-S5, E5-S3; TC-COMP-100–106, TC-INT-034, TC-INT-035, TC-E2E-001, TC-E2E-009, TC-E2E-010 | PASS |
| AC-14 | E2-S5, E3-S2, E4-S2, E4-S3, E4-S6, E4-S9; TC-COMP-107–110, TC-INT-036, TC-E2E-002, TC-E2E-008. Production: value and growth state `not_enough_stocks`, "0 of 30 stocks qualified". Momentum read 29 qualified and was not ranked after run `30981181…` | PASS |
| AC-15 | E1-S2, E1-S3, E1-S8, E2-S2, E2-S5, E3-S2, E3-S3, E5-S1–S3; TC-COMP-108, TC-COMP-111–119, TC-INT-037, TC-INT-038, TC-E2E-001, TC-E2E-003, TC-E2E-008, TC-E2E-012 | PASS |
| AC-16 | E3-S2, E3-S3, E3-S5, E3-S6, E4-S1, E4-S2, E4-S5–S7, E4-S9, E5-S1; TC-COMP-120–145, TC-INT-033, TC-INT-038–043, TC-E2E-005, TC-E2E-007, TC-E2E-008 | PASS |
| AC-17 | E3-S3, E3-S5, E5-S3; TC-COMP-105, 106, 146–149, TC-INT-025, TC-INT-044, TC-INT-045, TC-E2E-007, TC-E2E-010 | PASS |
| AC-18 | E3-S4, E3-S5, E5-S2; TC-COMP-150–155, TC-INT-046–048, TC-E2E-009 | PASS |
| AC-19 | E2-S1, E2-S2, E2-S3, E2-S7, E5-S2; TC-COMP-154–162, TC-INT-024, TC-INT-049 | PASS |
| AC-20 | E2-S1, E2-S2, E2-S8, E2-S9, E3-S1, E3-S5, E4-S1, E4-S4, E4-S9; TC-COMP-163–177, TC-INT-050–054, TC-E2E-002, TC-E2E-009 | PASS |
| AC-21 | E3-S1, E3-S5, E4-S4, E4-S9; TC-COMP-170, 174–180, TC-INT-055, TC-INT-056, TC-E2E-001. Production: the summary reports the set, its run and `stocks_current` (`0` current of `42` followed, because fundamentals are absent, B1) | PASS |
| AC-22 | E3-S1, E3-S5, E4-S1, E4-S4, E4-S9; TC-COMP-171, 173, 181–185, TC-INT-057, TC-E2E-002 | PASS |
| AC-23 | E2-S6, E3-S2, E3-S3, E3-S4, E5-S1, E5-S2, E5-S3; TC-COMP-186–192, TC-INT-058, TC-E2E-009 | PASS |

## Integration and E2E Coverage

| Evidence | Result | Revision |
| --- | --- | --- |
| `docs/capabilities/CAP-002-universe-and-factor-classification/tests/integration/integration-tests.md` v1 (TC-INT-001–058), task plan v1, an automation review at the release commit (`PASS-WITH-WARNINGS`: 2 LOW, AR-001 and AR-002). It was written as `integration-tests-automation-review-v5.md`, but story E2-S10 (PR #181) merged its own review under that name, of a later state (`sha256:7d091c13…`), so this row is the only record of the review at this revision. The full suite passed 2610; the integration scope passed 931; the 58 markers are all present | PASS | `sha256:b35e025162254ea0c2f059a57b0b5b642de8a5c073661ae9484b2332ebbea295` |
| `docs/capabilities/CAP-002-universe-and-factor-classification/tests/e2e/e2e-tests.md` v1 (TC-E2E-001–012), task plan v1, an automation review at the release commit (`PASS-WITH-WARNINGS`: 2 LOW, AR-013 and AR-014). It was written as `e2e-tests-automation-review-v6.md`, but story E2-S10 (PR #181) merged its own review under that name, of a later state (`sha256:7d091c13…`), so this row is the only record of the review at this revision. `npm run test:e2e` passed 31 with 0 skipped | PASS | `sha256:b35e025162254ea0c2f059a57b0b5b642de8a5c073661ae9484b2332ebbea295` |

Both revisions match `python3 scripts/pipeline-state.py automation-revision` at release commit `829c9e1`. That commit includes EXP-20261107-2 (#178, a test-only scheduler-race fix) and EXP-20261107-3 (#179, version 0.2.0).

The E2E provider is a stub (`tests/e2e/support/massive_stub.py`). It serves statements under the resolved keys, so the automated suite does not exercise the live plan's entitlement or rate limit. B1 and B2 surfaced only in production.

## Security and Privacy Review

| Result | Evidence | Owner |
| --- | --- | --- |
| PASS | **No new secret or channel.** CAP-002 adds no credential, environment secret or network listener. It adds two optional settings, `FACTORFLOW_CLASSIFICATION_POLL_INTERVAL_SECONDS` and `FACTORFLOW_CLASSIFICATION_BUILD_TIMEOUT_SECONDS`, both validated at start. `compose.yaml` and the `Dockerfile` are unchanged since CAP-001's `373d256`. **New routes stay behind the CAP-001 boundary.** `/api/universes` and `/api/classifications` are mounted behind the Host and Origin middleware and ahead of the static mount (DAC-E1-S6-5, DAC-E3-S5-6, DAC-E3-13; TC-COMP-028, 088, 126). The no-secrets test covers every new route (TC-COMP-088). `deploy-smoke.sh` Check 4 found no off-host listener on 8000 or 5432 after the upgrade. **Isolation.** The classification package is isolated from ingestion, and `ingestion_main` imports nothing from classification (TC-COMP-085, 160). Every write is append-only, with static guards against `UPDATE` and `DELETE` on `universe_event` (TC-COMP-047, 054). **Supply chain.** No runtime dependency was added: `pyproject.toml` and `package.json` changed only the version and the package-data globs for the `universes/sql` and `classification/sql` statement files. **Privacy.** Only public market data and the owner's universe names are stored, with no personal data. The post-release provider probes ran inside the ingestion container and printed neither the key nor any credential | Alvaro de Jodra |

## Migration and Rollback

| Result | Migration evidence | Rollback procedure and verification |
| --- | --- | --- |
| PASS | Forward-only migrations `0005_universes.sql` and `0006_classifications.sql` are packaged in `src/factorflow/db/migrations/`. They apply over 0001–0004 with existing data unchanged (DAC-E1-S1-1, DAC-E2-S1-1; TC-COMP-045, 156), and a second migrator run applies nothing (TC-COMP-048). A `pg_dump` restore returns the current set and membership unchanged (TC-COMP-158). Production: `factorflow:0.2.0-829c9e1` migrated `factorflow_factorflow-pgdata` from schema 4 to 6 on start, and `deploy-smoke.sh` Check 2 reported `schema_version=6` | Rollback owner: Alvaro de Jodra. The procedure is the README's *Upgrade, backup and rollback*, "rollback when `<new>` applied a migration": stop `ingestion` and `app`, confirm the dump, `dropdb`/`createdb`, `pg_restore --no-owner`, `FACTORFLOW_IMAGE_TAG=0.1.0-373d256 docker compose up -d`, `scripts/deploy-smoke.sh` (expect schema 4), then restart ingestion. The pre-upgrade dump was taken at 2026-11-07T14:21:10Z: `~/factorflow-backups/factorflow-0.1.0-373d256-20261107T142110Z.dump`, 80,905 bytes, sha256 `309b7aeb5fbcaa5c096c3c2f3cc37b2a3d87eb2afb1126d405c04e585bb3555a`. `pg_dump` exited 0, and `pg_restore -l` lists 11 `TABLE DATA` entries. The restore path itself was rehearsed end to end for 0.1.0 (`docs/releases/CAP-001-v0.1.0-drill-record.md`). It was not re-rehearsed for 0.2.0, whose rollback branch is the same. Image `factorflow:0.1.0-373d256` remains on the host |

## Observability and Operational Readiness

| Result | Operational owner | Signals, alerts, and runbook |
| --- | --- | --- |
| PASS | Alvaro de Jodra | **Classification signals.** `GET /api/classifications/summary` reports the current set (`set_id`, `run_id`, `state`, `latest_trading_day`, `active_instruments`) and any `later` building or failed set. Per factor it reports `qualified_count`, `ranked` and `min_peer_set_size`, plus `stocks_current`. The Research screen polls it every 10 s while a set builds (`use-score-set-poll.ts`). A failed set shows its recorded reason (AC-20). An interrupted build is reclaimed as failed at start (DAC-E2-12, TC-COMP-168). **Run diagnosis.** `GET /api/acquisition-runs/{id}` gives per-symbol, per-data-type outcomes, which located B1 and B2. **Gap.** The `ingestion` container wrote no log lines during either run, so the provider's actual status codes (`403`, `429`) came from a direct probe, not from the product. The safe reason `[unavailable] … failed 3 consecutive attempts` hides an entitlement refusal and a rate limit behind one wording. This is a CAP-001 classification issue, follow-up F1. **Runbook.** The README's *Deploying and operating FactorFlow* and *Configuration* (the two classification settings, with their timing rule) and the reference docs `classification-engine.md`, `classification-scheduler.md`, `classification-reader.md` and `classification-api.md`. A single owner-operator runs it, with no pager |

## Deployment Evidence

| Result | Environment | Commit/tag | Validation |
| --- | --- | --- | --- |
| PASS | Self-hosted Docker Compose, project `factorflow`, on the owner's macOS host: `postgres:16`, `factorflow-app-1` and `factorflow-ingestion-1` on `network_mode: host` (127.0.0.1:5432 and :8000), volume `factorflow_factorflow-pgdata`. Upgraded from `factorflow:0.1.0-373d256` | Commit `829c9e1684c19f61ca015a82f6853fe769be4b26` (merge of #179), image `factorflow:0.2.0-829c9e1` (`sha256:bfe883826e8d603f524149c5041db319694f363670f3526c255c56e8fdc2a502`) | `FACTORFLOW_IMAGE_TAG=0.2.0-829c9e1 docker compose build app` exited 0. Then `docker compose stop ingestion` and `docker compose up -d`: `app` became `healthy` and migrated to schema 6. `scripts/deploy-smoke.sh` exited 0: Check 1 (postgres and app healthy; `pg_hba.conf` methods verified), Check 2 (`schema_version=6`), Check 3 (`GET /` serves `index.html`), Check 4 (no off-host listener). `docker compose --profile ingestion up -d` started `factorflow-ingestion-1` on `0.2.0-829c9e1`. `GET /api/health` returned `status ok`, `database reachable`, `credential_present true`, `schema_version 6` |

## Release Approval

| Field | Evidence |
| --- | --- |
| Approval status | Not requested. The verdict is NOT-READY (B1–B3). Independent release review and owner approval follow a READY manifest |
| Release approver | Alvaro de Jodra |

## Post-Release Validation

| Result | Verified at | Evidence and follow-up |
| --- | --- | --- |
| FAIL | 2026-11-07T15:56:20Z | **Setup.** With owner approval, production went from 6 followed stocks to 42 (36 added: AMZN, GOOGL, NVDA, JPM, JNJ, PG, KO, PEP, WMT, HD, XOM, CVX, UNH, PFE, MRK, ABBV, CSCO, ORCL, INTC, IBM, CAT, DE, HON, MMM, MCD, NKE, DIS, VZ, T, COST, ADBE, CRM, LOW, TXN, QCOM, AMGN). History depth was already 3 years. **On start.** The scheduler built a complete set from the last CAP-001 run `3a420cea…` (AC-10). **Run 1, `30981181-c749-4b9b-b0db-c62e9a2ae411`** (14:34:00–14:40:03Z, `partial`). Fundamentals failed for 42 of 42 stocks, prices for 13, reference data for 17 and corporate actions for 36. The set was built at 14:40:05Z: value and growth had 0 qualified, momentum 29 qualified and was not ranked (AC-14). **Run 2, `47a36af7-3587-4c1d-b48f-7141dc7e73e2`** (15:51:17–15:56:19Z, `partial`). Prices were complete (13 written, 29 unchanged). Fundamentals failed for 42, reference data for 17 and corporate actions for 32. The set is `complete`: momentum had 42 qualified and was ranked; value and growth read "0 of 30 stocks qualified". `GET /api/classifications` returns `match_count 42`, with momentum scored and percentiled per stock and value and growth `not_classified` / `not_enough_stocks`. **Root causes.** Probes from the ingestion container: income statements answer `403` "not entitled" (B1); the reference and splits endpoints answer `429` "exceeded the maximum requests per minute" (B2). A store query found 31 momentum-classified stocks with no `corporate_action` rows (B3). **Follow-up.** Close B1 (plan) and B2 (rate setting), and decide and fix B3. Then run acquisition again and record the result in `CAP-002-release-v2.md`. F1 (CAP-001): report a provider `403` entitlement refusal and a `429` rate limit under distinct safe reasons, not as `unavailable` after retries. Re-run `scripts/deploy-smoke.sh` after every `docker compose up -d` |
