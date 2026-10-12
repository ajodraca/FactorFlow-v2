---
artifact_schema_version: 1
artifact_id: CAP-001-release
artifact_type: release-readiness
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-12
updated: 2026-10-12
capability_id: CAP-001
release_id: CAP-001-v0.1.0
release_version: 0.1.0
release_commit: ef2dd7c11c58c528d977210030ad5c76e6960432
operational_owner: Alvaro de Jodra
rollback_owner: Alvaro de Jodra
verdict: NOT-READY
ai_provenance:
  agent_id: release-readiness-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-12T13:52:02Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-coverage-matrix
      version: "2"
    - id: CAP-001-integration-tests
      version: "2"
    - id: CAP-001-e2e-tests
      version: "1"
    - id: CAP-001-integration-tests-automation-tasks
      version: "3"
    - id: CAP-001-e2e-tests-automation-tasks
      version: "2"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Release Readiness: CAP-001 — CAP-001-v0.1.0

**Verdict: NOT-READY.** The code passes every test and review gate. But the
release image built from `ef2dd7c` cannot create its schema and serves no owner
interface, and nothing defines how the two-process product is deployed. So
there is no deployment and no post-release validation to record.

Blockers, each needing its own change before a v2 of this manifest:

1. **B1 — The release image applies no migrations.** Defect, found by the
   image smoke test below. `src/factorflow/db/migrate_main.py:35` resolves
   `Path(__file__).resolve().parents[3] / "migrations"`. From a source
   checkout that is the repo's `migrations/`. In the image it resolves to
   `/usr/local/lib/python3.12/migrations`, which does not exist. The migrator
   reports "this build carries up to 0", exits 0, and the API then serves on a
   store with only `applied_migrations` (health: `database: unreachable`,
   `schema_version: null`; the reclaim sweep logs `UndefinedTable`). AC-15
   fails in the release artifact.
2. **B2 — A missing migrations directory is not an error.** `discover()` in
   `src/factorflow/db/migrator.py` globs a missing directory as zero
   migrations, so B1 passes silently instead of refusing the start (the
   intent of AC-16).
3. **B3 — The image serves no owner interface.** The Dockerfile never runs
   `npm run build`. `[tool.setuptools.package-data]` ships only
   `coverage/sql/*.sql`, so `factorflow/api/static` is not installed, and
   `GET /` answers 404.
4. **B4 — No deployment definition for the two-process topology.** Tech stack
   C1 requires the API and the ingestion process to run as containers on the
   owner's machine. The Dockerfile says the full image definition for both
   processes "is out of this story's scope". There is no ingestion image, no
   compose file, and no documented way to reach the loopback-only API (AC-14)
   from the host.
5. **B5 — No runbook, alerting, rollback procedure or post-release check is
   recorded** for the owner-operator.

The E2E suite did not catch B1–B3 because `scripts/run-e2e-server.sh` runs the
API and migrator with `uv run` from the source tree. Only TC-E2E-012 runs the
production start chain, and it also runs from source.

## Acceptance-Criterion Coverage

Every story is `done`, and each story's latest implementation review passes
(38 stories: 33 PASS-WITH-WARNINGS, 5 PASS). The test evidence is the run in
integration automation review v2 (`43ef0e1`), at code state
`sha256:e7ac37e81ee50bedf62de3ad5ea1e8fe18922fc03446de02101c63d20f6647f3`.
`pipeline-state.py automation-revision` reproduces that state at `ef2dd7c`:
`uv run pytest` 932/932 (Docker), `npm run test` 297/297,
`npm run test:e2e` 18/18. Test IDs are those in `tests/coverage-matrix.md`
v2. "Source" means the behaviour is verified from the source tree, not in a
deployed artifact (see B1–B4).

| AC ID | Evidence | Result |
| --- | --- | --- |
| AC-1 | E1-S1, E2-S1, E2-S3, E2-S4; TC-COMP-001, TC-INT-001/002, TC-E2E-001/009 (source). The release image serves no interface (B3) | PASS |
| AC-2 | E1-S1, E2-S2, E2-S4; TC-COMP-002, TC-INT-006/007, TC-E2E-001 (source) | PASS |
| AC-3 | E3-S1, E3-S6, E3-S7, E4-S4, E4-S5; TC-COMP-003/389, TC-INT-021–024, TC-E2E-001/009 against the loopback stub (source). Live Massive coverage is unverified (capability assumption, section 6) | PASS |
| AC-4 | E2-S4, E3-S4, E4-S5, E4-S7; TC-COMP-004, the 3000-instrument volume test (`slow`), in the full pytest run (source) | PASS |
| AC-5 | E3-S2, E4-S1, E4-S2, E4-S3; TC-COMP-005 (source) | PASS |
| AC-6 | E4-S1–S4, E4-S6, E4-S7, E7-S4; TC-COMP-006, TC-E2E-005/009 (source). E2E review v3 AR-002: TC-E2E-009 does not check the 1-year depth | PASS |
| AC-7 | E4-S3, E5-S1, E6-S1, E6-S3, E6-S4; TC-COMP-007, TC-INT-017, TC-E2E-001/003 (source). E2E review v3 AR-005: TC-E2E-001 can fail across local midnight | PASS |
| AC-8 | E3-S1, E6-S2, E6-S3, E6-S4; TC-COMP-008, TC-E2E-003 (source) | PASS |
| AC-9 | E4-S5, E4-S6, E5-S1, E5-S3, E5-S5, E5-S6, E7-S1; TC-COMP-009, TC-INT-011, TC-E2E-002/005 (source). `instruments_named` fixed in EXP-20261011-1 | PASS |
| AC-10 | E4-S3, E4-S6, E5-S1, E5-S5, E5-S6, E7-S1, E7-S2, E7-S4; TC-COMP-010, TC-INT-012/013, TC-E2E-002/005 (source). E2E review v3 AR-001: TC-E2E-005 does not check the failure detail; TC-COMP-010 and TC-INT-012 do | PASS |
| AC-11 | E3-S3–S5, E4-S5, E4-S6, E7-S1, E7-S4; TC-COMP-011, TC-INT-025, TC-E2E-006 (source) | PASS |
| AC-12 | E3-S3, E4-S3, E4-S7, E5-S1, E5-S4, E6-S1; TC-COMP-012, TC-E2E-002 (source) | PASS |
| AC-13 | E1-S2, E1-S3, E1-S5, E3-S1, E3-S5–S7; TC-COMP-013, TC-E2E-011 (source); image smoke: health reports `credential_present: false` and no value | PASS |
| AC-14 | E1-S3, E1-S4, E1-S6; TC-COMP-014, TC-E2E-011 (source); `ApiSettings` rejects a non-loopback host; the image binds `127.0.0.1:8000` | PASS |
| AC-15 | E1-S1, E1-S2, E5-S1; TC-COMP-015, TC-E2E-011 pass from source, but the release image applies no migrations (B1) | FAIL |
| AC-16 | E1-S2, E1-S5, E3-S6; TC-COMP-016, TC-E2E-012 (source); image smoke: a start against a store at version 99 exits 2 and never binds. B2 weakens it | PASS |
| AC-17 | E2-S4, E5-S6, E6-S1, E6-S3, E6-S4, E7-S3; TC-COMP-017, TC-E2E-004 (source) | PASS |
| AC-18 | E1-S5, E1-S6, E5-S4, E7-S3; TC-COMP-018, TC-INT-020, TC-E2E-011 (source) | PASS |
| AC-19 | E4-S5, E5-S3, E5-S5, E7-S4; TC-COMP-019, TC-INT-014, TC-E2E-007/008 (source) | PASS |
| AC-20 | E4-S7, E5-S4; TC-COMP-020 (source) | PASS |
| AC-21 | E1-S1, E2-S1, E2-S4, E6-S1, E6-S3, E6-S4; TC-COMP-021, TC-INT-004, TC-E2E-010 (source) | PASS |
| AC-22 | E4-S4, E6-S4; TC-COMP-022 (source) | PASS |
| AC-23 | E4-S5, E5-S2, E5-S5, E5-S6; TC-COMP-023, TC-INT-009 (source) | PASS |
| AC-24 | E5-S5, E5-S6; TC-COMP-024, TC-INT-010 (source) | PASS |
| AC-25 | E2-S4; TC-COMP-025, TC-E2E-010 (source) | PASS |
| AC-26 | E5-S3, E5-S5, E5-S6, E7-S4; TC-COMP-026, TC-INT-015, TC-E2E-007 (source) | PASS |

## Integration and E2E Coverage

| Evidence | Result | Revision |
| --- | --- | --- |
| `tests/integration/integration-tests.md` v2 (TC-INT-001–027), plan v3 (30/30 tasks), automation review v2 PASS-WITH-WARNINGS: 0 critical/high/medium, 3 low (AR-003 accepted by the owner 2026-10-12) | PASS | `sha256:e7ac37e81ee50bedf62de3ad5ea1e8fe18922fc03446de02101c63d20f6647f3` |
| `tests/e2e/e2e-tests.md` v1 (TC-E2E-001–012), plan v2, automation review v3 PASS-WITH-WARNINGS: 2 medium, 4 low, all open | PASS | `sha256:e7ac37e81ee50bedf62de3ad5ea1e8fe18922fc03446de02101c63d20f6647f3` |

Both recorded revisions equal the current automation revision at `ef2dd7c`.

## Security and Privacy Review

| Result | Evidence | Owner |
| --- | --- | --- |
| PASS | Credential (AC-13): read from the environment only (`MassiveSettings`, `SecretStr`), redacted from logs (`config/redaction.py` `RedactingFilter`), never rendered (health exposes only `credential_present`); TC-COMP-013 and TC-E2E-011 pass. The E2E key is generated per run and never written (DEC-0037). Exposure (AC-14): loopback-only bind enforced at configuration (TC-COMP-014, TC-E2E-011). The test-only plain-`http` ingestion entry point is excluded from the wheel and the image (DEC-0033, DEC-0034). Not done: no dependency vulnerability scan is defined in the tech stack's validation commands | Alvaro de Jodra |

## Migration and Rollback

| Result | Migration evidence | Rollback procedure and verification |
| --- | --- | --- |
| FAIL | From source, migrations `0001`–`0004` apply and re-apply idempotently (TC-COMP-015, `tests/integration/test_migrat*`). In the release image, none apply (B1, B2) | None recorded (B5). Smoke only: `docker rm -f` of the app container left the store unchanged. As the first release, 0.1.0 has no earlier build to roll back to, and AC-16 by design refuses an older build on a newer store |

## Observability and Operational Readiness

| Result | Operational owner | Signals, alerts, and runbook |
| --- | --- | --- |
| FAIL | Alvaro de Jodra | Signals exist: `GET /api/health` (status, database, credential presence, schema version, most recent run; AC-18, TC-INT-020) and the interface's status region. No alerting, log destination or runbook is defined (B5) |

## Deployment Evidence

| Result | Environment | Commit/tag | Validation |
| --- | --- | --- | --- |
| FAIL | Image smoke test only, not a deployment: Docker 28.3.2 on the owner's Mac, throwaway `postgres:16` on a private network, 2026-10-12 | `ef2dd7c`, image `factorflow:0.1.0-ef2dd7c` (`sha256:1df2d0e2f7da…`), no tag | `docker build` succeeded. Start on an empty store: migrator exit 0 with 0 migrations applied, API up, `GET /api/health` 200 with `database: unreachable`, `GET /` 404 (B1, B3). Start on a store at version 99: exit 2, API not started (AC-16 holds). No self-hosted deployment exists to validate (B4) |

## Release Approval

| Field | Evidence |
| --- | --- |
| Approval status | Not requested: the verdict is NOT-READY. Pending B1–B5, an independent `$release-review` and owner approval |
| Release approver | Alvaro de Jodra |

## Post-Release Validation

| Result | Verified at | Evidence and follow-up |
| --- | --- | --- |
| FAIL | — | Not performed: nothing is deployed (B4). Once deployed: health 200 with `database: ok` and schema version 4, the interface loads on loopback, and a first acquisition run with the owner's Massive key reaches a terminal state with coverage shown |
