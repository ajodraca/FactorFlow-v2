---
artifact_schema_version: 1
artifact_id: CAP-001-specification-review
artifact_type: specification-review
artifact_version: 12
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-12
updated: 2026-10-12
document: spec-review-report
capability: CAP-001
version: v12
generated: 2026-10-12T20:17:43Z
constitutions_reviewed:
  - "CONST-AGT  docs/constitutions/agent-governance.constitution.md (2.3)"
  - "CONST-MDL  docs/constitutions/model-management.constitution.md (1.3)"
  - "CONST-OPS  docs/constitutions/operational-safety.constitution.md (1.3)"
  - "CONST-REV  docs/constitutions/review.constitution.md (1.4)"
  - "CONST-SA   docs/constitutions/static-analysis.constitution.md (2.0)"
  - "CONST-SEC  docs/constitutions/security.constitution.md (1.3, in force: content revision sha256:0f5659addf64eb6aff78fcc810f92673f348d7f8d943061cb5ca225fff15b0c7 equals the approval block's reviewed_revision; file identical on origin/main, merge commit e2c6124)"
  - "CONST-VER  docs/constitutions/verification.constitution.md (1.2)"
mechanical_checks:
  - script: check-capabilities.py
    outcome: run
    result: "PASSED, exit 0: 1 capability, 3 edges, 1 standard, 1 conformance claim, integration layer 0 is CAP-001, no blocked-by edges; no error, no warning"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0: 1 design, 12 components, 16 interfaces"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 219 warnings, exit 0 (--strict), no error. Changed subjects: system-design v8 and market-data-store v9 pin tech-stack v3; acquisition-runner v9 and massive-client v14 pin system-design v6 and tech-stack v3; 33 warnings in all are CAP-001-system-design v6 or v7 pins"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0, 1112 references across 209 Markdown files. Harness Markdown only; the project repo's new references were checked by hand"
  - script: check-constitutions.py
    outcome: run
    result: "PASSED, exit 0, 10 constitutions, 36 skills"
dimension_status:
  SR-1: applied
  SR-2: applied
  SR-3: applied
  SR-4: applied
  SR-5: applied
  SR-6: applied
  SR-7: applied
  SR-8: "applied — UX brief v7 and UX design v5 digest-identical to v11; the change adds no screen, state or copy"
  SR-9: "applied — dependency and STD-UI conformance halves by check-capabilities.py; CONST-SEC 1.3 host-local loopback exception (H1 to H9, checks (i) to (q)) and the re-pinned test-double reliance assessed by hand"
  SR-10: applied
specifications_reviewed:
  capability_spec: docs/capabilities/CAP-001-market-data-acquisition-foundation/Capability-CAP-001.md
  system_design: docs/capabilities/CAP-001-market-data-acquisition-foundation/design/system-design.md
  ux_brief: docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-brief.md
  ux_design_spec: docs/capabilities/CAP-001-market-data-acquisition-foundation/design/ux-design.md
  component_designs:
    - design/component-design-acquisition-runner.md
    - design/component-design-coverage-service.md
    - design/component-design-ingestion-api.md
    - design/component-design-instrument-list-service.md
    - design/component-design-market-data-store.md
    - design/component-design-massive-client.md
    - design/component-design-observation-writer.md
    - design/component-design-owner-web-app.md
    - design/component-design-rate-limit-governor.md
    - design/component-design-run-journal.md
    - design/component-design-runtime-config.md
    - design/component-design-schema-migrator.md
review_subjects:
  - artifact_id: CAP-001
    artifact_version: 8
    content_revision: sha256:2da86c13c7da83c486e4cb5df4ab0596a5fd75669326c0cfed21c5719bf82397
  - artifact_id: CAP-001-system-design
    artifact_version: 8
    content_revision: sha256:c0959cb4e54cfe78728eba3238ae12daee8dac8ec2359bddbe0b04c9848825bd
  - artifact_id: CAP-001-ux-brief
    artifact_version: 7
    content_revision: sha256:b657501bed0da0852bf88b4a0537776c84a23c916bd967fb3917a80fc314c984
  - artifact_id: CAP-001-ux-design
    artifact_version: 5
    content_revision: sha256:8bb4b6a479dab7efbbce9fd7962574f134aaa8e834fd5250053f085f764b082f
  - artifact_id: CAP-001-component-design-acquisition-runner
    artifact_version: 9
    content_revision: sha256:2fe3c31955701e914fab84047228cc0ba41acf88e5675a754238f77d469fc47f
  - artifact_id: CAP-001-component-design-coverage-service
    artifact_version: 6
    content_revision: sha256:e87b0e8f2464ef85bf7f319c615b338e4f75e7360f4566f142968d5e9f0cec71
  - artifact_id: CAP-001-component-design-ingestion-api
    artifact_version: 8
    content_revision: sha256:d640754c0efb7e8682c9b048926d84d1d92ff80792ec767ddf6b52e05d811d27
  - artifact_id: CAP-001-component-design-instrument-list-service
    artifact_version: 6
    content_revision: sha256:05c192e26cf1c7c5343dd83bf9d1b29d0e1b91ffd1da181d5aeed4b3051635df
  - artifact_id: CAP-001-component-design-market-data-store
    artifact_version: 9
    content_revision: sha256:51f4d6fef017ccb83a9e3c597b8217afc8eb95513f021c7c23b3b63e6b493bc1
  - artifact_id: CAP-001-component-design-massive-client
    artifact_version: 14
    content_revision: sha256:943d89dd8c497950b11e68a9b8b14bad17d005339d042e7486c9448fde2a86eb
  - artifact_id: CAP-001-component-design-observation-writer
    artifact_version: 4
    content_revision: sha256:7572b6887e699496869a902b98fb5eb5499a2ce727a04d8774063fef1b996794
  - artifact_id: CAP-001-component-design-owner-web-app
    artifact_version: 4
    content_revision: sha256:f2ff988206f8bea4ec5cbfe73ac0bfc95bd964f2ced2625d513c03ca2d12286e
  - artifact_id: CAP-001-component-design-rate-limit-governor
    artifact_version: 8
    content_revision: sha256:21e573a3da2516241814e1353c8c18747e34fde4b0cd957438db1566f7d954ef
  - artifact_id: CAP-001-component-design-run-journal
    artifact_version: 6
    content_revision: sha256:8bdac7de84190e35600ce2e6db041a8b7ea55165b92cd5b533b2f6dee9cadea5
  - artifact_id: CAP-001-component-design-runtime-config
    artifact_version: 13
    content_revision: sha256:03c2788b163743a6bd2656bb38bcd19c7d5eacbf58b1a78d9be907d3f3893a37
  - artifact_id: CAP-001-component-design-schema-migrator
    artifact_version: 6
    content_revision: sha256:0607e17a3b7213622d24033c450d83cdd8c61f72cd371736f468715b7d2a04da
statistics:
  total_findings: 28
  critical: 0
  high: 1
  medium: 8
  low: 19
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-12T20:17:43Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "8"
    - id: CAP-001-ux-brief
      version: "7"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-component-design-acquisition-runner
      version: "9"
    - id: CAP-001-component-design-coverage-service
      version: "6"
    - id: CAP-001-component-design-ingestion-api
      version: "8"
    - id: CAP-001-component-design-instrument-list-service
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "9"
    - id: CAP-001-component-design-massive-client
      version: "14"
    - id: CAP-001-component-design-observation-writer
      version: "4"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: CAP-001-component-design-rate-limit-governor
      version: "8"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-runtime-config
      version: "13"
    - id: CAP-001-component-design-schema-migrator
      version: "6"
    - id: CAP-001-release
      version: "1"
    - id: tech-stack
      version: "5 (context only; review-exempt)"
    - id: CONST-SEC
      version: "1.3 (in force; content revision sha256:0f5659addf64eb6aff78fcc810f92673f348d7f8d943061cb5ca225fff15b0c7)"
    - id: DEC-0050
      version: "open, decided_by owner 2026-10-12"
    - id: DEC-0051
      version: "open, decided_by owner 2026-10-12"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Specification Review Report -- CAP-001

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-001 Market Data Acquisition Foundation |
| **Version** | v12 |
| **Specifications Reviewed** | Capability, system design, UX brief, UX design, 12 component designs (full set; seven changed since v11) |
| **Total Findings** | 28 (0 CRITICAL, 1 HIGH, 8 MEDIUM, 19 LOW) |
| **Pipeline Readiness** | READY-WITH-WARNINGS |
| **Lane** | High risk (`deployment-topology` signal). Specification review must reach READY. **This verdict does not clear the lane** |

**What changed since v11.** Seven commits on
`usr/alvaro-de-jodra/CAP-001-design-deployment`, `cbdda87` to `7628f86`, answer
v11 and map the deployment to the SEC-ENC-001 host-local loopback exception of
CONST-SEC 1.3:

- `component-design-runtime-config.md` v12 to v13:
  - §2.8.1 corrects the AC-14 control count and maps conditions H1 to H9 to
    three named plaintext channels;
  - §2.3 adds the `DatabaseSettings` H7 validator;
  - §2.8.2 installs the locked dependency set;
  - §2.8.3 enforces `scram-sha-256` (`POSTGRES_INITDB_ARGS`, `require_auth`)
    and puts ingestion in a profile started after the smoke check;
  - §2.8.4 specifies backup, rollback and a drill;
  - §2.8.5 widens the smoke check;
  - §2.2c is re-pinned to 1.3 (DEC-0051).
- `component-design-ingestion-api.md` v7 to v8 adds §2.5a, the Host and
  Origin middleware (H9), and replaces its §4 loopback reading with reliance
  on the exception.
- `component-design-market-data-store.md` v8 to v9 corrects §4's exposure
  statement and supersedes its rollback deferral.
- `component-design-schema-migrator.md` v5 to v6 completes the reference list
  and its §6 manual actions.
- `system-design.md` v7 to v8 extends the §4.1 `runtime-config` row and
  constraint 5.11.
- `component-design-massive-client.md` v13 to v14 and
  `component-design-acquisition-runner.md` v8 to v9 re-pin the test-double
  reliance to 1.3.

The other nine subjects are digest-identical to the revisions v11 recorded,
recomputed this session with `artifact-gate.py revision`.

**CONST-SEC 1.3 is in force.** `artifact-gate.py revision --repo-dir .`
returns `sha256:0f5659ad...5b0c7`. That equals the approval block's
`reviewed_revision`, and the file is identical on `origin/main`, merge commit
`e2c6124`. v11's FINDING-1, the open question it raised, is answered.

**v11 resolved: 12 of 31.** That includes all three HIGH findings
(FINDING-1, FINDING-31, FINDING-32). This review verified the main fixes
against code and tools:

- the locked export works offline with hashes and no dev extra;
- the compose file renders under Compose v2.39.1;
- libpq 18 accepts `require_auth`;
- the API has no state-changing `GET` route and no WebSocket.

**New in this round: 1 HIGH, 4 MEDIUM, 4 LOW.**

- **FINDING-43 (HIGH).** H7 is enforced in `DatabaseSettings` only. The
  migrator is the first client on the application's database channel. It reads
  `FACTORFLOW_DATABASE_URL` straight from the environment at `7628f86`, and no
  design requires it to do otherwise or tests it. Implemented to these
  designs, channel (b) fails H7 and has no SEC-ENC-001 standing.
- **FINDING-44 to FINDING-47 (MEDIUM):**
  - the re-pinned test-double gate still requires "CONST-SEC 1.2 is in force",
    which can no longer hold;
  - `uv export --frozen` does not fail on a stale lock, contrary to the
    design's claim (verified);
  - the backup drill runs the release stack on production data with no H8
    check, and the smoke check cannot see the drill's project;
  - four exception obligations (H4's 128-bit secret, H8 after network changes,
    H2's documentation, H4's `password` method) are not in the owner's
    procedure.
- **FINDING-48 to FINDING-51 (LOW):** stale in-force text and provenance;
  procedure inconsistencies; `localhost` residuals; ingestion-api H9 test and
  contract gaps.

## Review Scope

**Full set, depth proportional to change.**

- **Changed subjects (7).** runtime-config, ingestion-api, market-data-store
  and schema-migrator were read in full at `7628f86`, and the system design's
  changed sections in context. The diff `5ee575a..7628f86` was reviewed line
  by line for all seven. Every changed claim was checked against these
  sources:
  - CONST-SEC 1.3's SEC-ENC-001 Statement, conditions H1 to H9, Verification
    checks (i) to (q), Definitions, SEC-NDG-001 and the Exception Record;
  - CONST-SEC 1.2 at approval commit `9480517`, compared textually with 1.3
    for DEC-0051's claim;
  - DEC-0050 and DEC-0051;
  - the repository at `7628f86`: `src/factorflow/config/settings.py`,
    `db/migrate_main.py`, `db/migrator.py`, `ingestion_main.py`,
    `api/app.py`, `api/routes/*.py`, `pyproject.toml`, `uv.lock`,
    `vite.config.ts`, `playwright.config.ts`, `tests/e2e/*.spec.ts`,
    `tests/e2e/support/`, `scripts/run-e2e-server.sh`, `README.md` and
    `.github/workflows/validate.yml`.
- **Unchanged subjects (9).** Each revision equals the one v11 recorded, so
  v11's assessments stand by identity. They were searched for dependence on
  the changed text: "CONST-SEC", "SEC-ENC-001", "loopback", "pg_dump",
  "backup", "Manual actions" and "5.11". The result is under
  Cross-Specification Consistency.
- **Not subjects.** Epics, stories, task plans, test specifications, decision
  records, the release manifest, CI and the E2E harness are governing,
  downstream or tooling inputs. `tech-stack.md` v5 is review-exempt context.
- **Repository source.** Project repository
  `repos/factorflow-v2/FactorFlow-v2`, branch
  `usr/alvaro-de-jodra/CAP-001-design-deployment`, at `7628f86`, with a clean
  tree. Harness worktree at `0898bda`. The only file written is this report.
  Nothing was committed, no branch was switched, and nothing was approved.
- **Pipeline state.** `pipeline-state.py check --stage specification-review`
  reported `AWAITING-APPROVAL`, exit 1. The reason was "review_subjects does
  not cover" each of the seven changed revisions. This report supplies that
  coverage and approves nothing. See the Unattended-Run Record.
- **Independence.** This review ran in a fresh subagent session that did not
  author any of the artifacts. Under REV-RCV-001 and VER-DEL-001, every
  author claim, the decision records' claims included, was checked against
  code, configuration, constitution text or an offline tool run. Not
  reproduced: the owner's Docker Desktop probes and the `postgres:16`
  entrypoint observation of 2026-10-12, because the Docker daemon is outside
  this session's sandbox.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All 14 template sections are present in each changed design. The one diagram changed in this round (RC §2.8.1) keeps its five-sentence overview. New: FINDING-51 (b). Carried: FINDING-9 |
| SR-2 Correctness | applied | Every new code, configuration and tool claim was checked (Supplementary Evidence). New: FINDING-45, FINDING-48 (f). Carried: FINDING-7, FINDING-12, FINDING-20, FINDING-26, FINDING-29, FINDING-36 (b) |
| SR-3 Consistency | applied | New: FINDING-44, FINDING-48, FINDING-49, FINDING-51 (c). Carried: FINDING-8, FINDING-15, FINDING-18 |
| SR-4 Testability | applied | §8 criteria 12 to 14 and the new §7 rows have observable outcomes. New: FINDING-43 (no test for the migrator's confinement), FINDING-51 (a). Carried: FINDING-11, FINDING-12, FINDING-16, FINDING-27 |
| SR-5 Traceability | applied | 26 of 26 capability ACs are mapped. The AC-14 rows in SD §7, RC §13 and IA §13 now agree. Carried: FINDING-6, FINDING-28, FINDING-30 |
| SR-6 Clarity | applied | Commands, keys and paths are exact. New: FINDING-48 (d), FINDING-49. Carried: FINDING-13, FINDING-14, FINDING-17 |
| SR-7 Feasibility | applied | Locked export, compose rendering, profiles and the drill's project isolation were verified offline. New: FINDING-46 |
| SR-8 UX Completeness | applied | UX artifacts are unchanged. H9 adds no user-visible state, because the interface's own requests carry its own origin. Carried: FINDING-8 |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` passed with no error or warning, and the capability is unchanged. CONST-SEC 1.3: per-condition table under Constitutions Applied. New: FINDING-43, FINDING-46, FINDING-47, FINDING-50 |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passed (12 components, 16 interfaces). SD §4.1 now assigns the deployment definition (v11 FINDING-42 resolved). No capability is used as an actor |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, exit 0, "PASSED" (integration layer 0: CAP-001; no blocked-by edges) | none |
| `build-architecture.py -p factorflow-v2` | run, exit 0, "1 design(s), 12 component(s), 16 interface(s) PASSED" | none. `docs/architecture.md` already carries the new §4.1 row |
| `check-artifacts.py -p factorflow-v2 --strict` | run, exit 0, "PASSED with 219 warning(s)", no error | FINDING-18 (pins in SD v8, MDS v9, AR v9, MC v14) |
| `check-references.py` (harness root) | run, exit 0, "1112 path references across 209 Markdown files ... PASSED" | none. It scans harness Markdown only. The project references added this round were checked by hand: the existing ones resolve, and the declared-new files (`tests/unit/test_api_host_origin.py`, `tests/unit/test_database_url_confinement.py`, `compose.yaml`, `scripts/deploy-smoke.sh`) are introduced by the designs |
| `check-constitutions.py` (harness root) | run, exit 0, "10 constitutions, 36 skills PASSED" | none |

**Prerequisites.** `check-prerequisites.sh --project factorflow-v2` exited
**2**. Context freshness was STALE: the last run was 2026-10-11T16:32:54Z,
27 hours ago against a 24-hour window. Every other row PASSED. The context
feeder was not run; the Unattended-Run Record says why the review proceeded.
No review input reads the cache: the five scripts read the working tree, and
`check-references.py` explicitly excludes `cache/`.

### Supplementary evidence (fresh, this session)

| Claim in the change | Evidence | Result |
|---|---|---|
| CONST-SEC 1.3 is in force | `artifact-gate.py revision --repo-dir . --artifact docs/constitutions/security.constitution.md` gives `sha256:0f5659ad...5b0c7`. That equals `approval.reviewed_revision`. `git diff origin/main HEAD` on the file is empty, and `e2c6124` is on `origin/main` | Holds |
| DEC-0051: 1.3 leaves the test-double exception's conditions (1) to (4) unchanged | The SEC-ENC-001 Statement before "Separately," is byte-identical in `9480517` (1.2) and `HEAD` (1.3). The six definitions it uses are identical. In checks (a) to (h), only the Verification lead-in changes: "unless it meets every condition of the host-local loopback exception" | Holds |
| `uv export --frozen --no-emit-project --format requirements.txt` exports the locked runtime set with hashes | uv 0.12.10 (the pinned version), offline, on a scratch copy of `pyproject.toml` and `uv.lock`: exit 0, 260 `--hash` lines, `massive==2.8.0`, `psycopg-binary==3.3.5`, no `pytest`, `ruff` or `mypy`, no project line. `dev` is an extra (`pyproject.toml` lines 19-27) | Holds (v11 FINDING-32) |
| "`--frozen` fails the build if `uv.lock` is out of date" | Same copy with `requests>=2` added to `dependencies`: `uv export --frozen` exits 0, and `requests` is absent from the export. `uv export --locked` refuses with exit 1 | **Does not hold** (FINDING-45) |
| `require_auth=scram-sha-256` is honoured by the bundled libpq 18 | `.venv`: `psycopg` 3.3.5 binary, `psycopg.pq.version()` = 180006 (macOS wheel). `conninfo_to_dict` on the compose URL returns `require_auth: scram-sha-256`. The manylinux wheel's libpq version was not checked (no index access) | Holds for the locked version |
| `compose.yaml` renders; ingestion is profile-gated; the drill gets its own volume | The design's YAML, extracted verbatim, run through Compose v2.39.1 offline with `DOCKER_HOST` unreachable. `config` renders the URL with `?require_auth=scram-sha-256`, `listen_addresses=127.0.0.1` and both `POSTGRES_INITDB_ARGS` options. `config --services` gives `postgres` and `app`, and adds `ingestion` with `--profile ingestion`. `-p factorflow-drill` renames the volume to `factorflow-drill_factorflow-pgdata`. `stop ingestion` resolves the profiled service | Holds |
| `postgres:16` trusts loopback and the local socket unless `--auth-host`/`--auth-local` are given | Not reproduced (no Docker daemon). Consistent with initdb's default method, `trust`, and with the image's entrypoint, which appends only `host all all all <method>` | Owner-supplied evidence, plausible |
| The migrator's connection is confined by `DatabaseSettings` | `migrate_main.py` lines 8-13 say the URL "is read directly from the `FACTORFLOW_DATABASE_URL` environment variable rather than through a `runtime-config` settings object". Line 168 calls `os.environ.get(...)`, and line 116 calls `psycopg.connect(database_url)`. `api/app.py` line 171 and `ingestion_main.py` line 80 do go through `DatabaseSettings` | **Does not hold for the migrator** (FINDING-43) |
| "No route changes state on GET, HEAD or OPTIONS, and the API serves no WebSocket" | `routes/*.py`: six `GET` handlers (health, history-depth, instruments, coverage, runs list, run detail), all reads. Five state-changing routes: `POST /api/acquisition-runs`, `POST .../{run_id}/cancel`, `PUT /api/settings/history-depth`, `POST /api/instruments` and `DELETE /api/instruments/{symbol}`. No `websocket` in `src/` | Holds |
| "The E2E stacks pass" the Host and Origin checks | `playwright.config.ts` `baseURL` is `http://127.0.0.1:8123`. The acquisition specs use `http://127.0.0.1:8125` (`support/acquisition.ts` line 17), matching each stack's `FACTORFLOW_API_PORT` (`run-e2e-server.sh` lines 96 and 151). `vite.config.ts` has no proxy. `startup-refusal.spec.ts` reroutes to 8124, where nothing listens | Holds |
| "The 15 test modules that build a `TestClient`" | `grep -rl TestClient tests` gives 15 files | Holds |
| The owner's browser is directed to `http://127.0.0.1:8000` by the README and §9 | `README.md` has no `127.0.0.1:8000`. RC §9 (lines 1351-1366) gives no URL | **Does not hold** (FINDING-47 (c)) |

## Constitutions Applied

All seven constitutions the relevance matrix assigns `specification-review`
were read. CONST-SEC moved from 1.2 to 1.3 since v11. The others are
unchanged.

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | **AGT-PROV-001:** provenance refreshed in all seven changed designs, `correlation_id` kept. The massive-client and acquisition-runner timestamps (22:00:00Z) postdate their commit (19:38:22Z): FINDING-48 (f). **AGT-SPEC-002:** v11 FINDING-31's single-layer posture was put to the owner and recorded (RC §2.8.1 lines 787-793). The gaps found this round are surfaced for the owner, not judged acceptable here (FINDING-43, 46, 47). **AGT-AUTH-003:** the rollback disagreement is now an explicit supersession in MDS §6 and §14. **AGT-EVIDENCE-002:** healthcheck timings still unsourced (FINDING-36 (b)). **AGT-AUTH-001:** this review approves nothing |
| CONST-MDL 1.3 | **MDL-PIN-002:** the exact identifier `claude-opus-5-5` is recorded in the designs and in this report |
| CONST-OPS 1.3 | **OPS-MIG-003:** met under branch (a) by RC §2.8.4: a dump before every upgrade, a restore into an emptied database, immutable tags, and a drill. The drill's own H8 gap is FINDING-46. **OPS-DEST-001:** `dropdb` and `down -v` are run only after the owner confirms the dump or the project name. PASS. **OPS-VER-001:** the release-evidence run is now the real deployment with the owner's values (v11 FINDING-35 resolved). **OPS-ERR-001:** the smoke check exits non-zero on its first failure. No destructive operation was run in this review |
| CONST-REV 1.4 | **REV-STG-001:** Stage 1 and Stage 2 are reported separately below. **REV-AGT-001:** full bar. **REV-RCV-001:** DEC-0051's substantive claim and the authors' answers to v11 were independently checked. **REV-RCV-002:** the `--frozen` claim is challenged with a reproduction (FINDING-45) |
| CONST-SA 2.0 | **SA-MD-001:** template conformance passes. **SA-MD-002:** new paths resolve or are declared new; superseded internal statements are FINDING-48. **SA-MD-003:** no placeholder language introduced |
| CONST-SEC 1.3 | In force (Supplementary Evidence). **SEC-ENC-001, host-local loopback exception:** assessed condition by condition below. **SEC-ENC-001, test-double exception:** the re-pin is substantively correct, but the gate text contradicts it (FINDING-44). **SEC-NDG-001:** a host-local plaintext channel is not a debug mode "while its conditions hold, (H7) in particular". H7 does not hold for the migrator (FINDING-43). The image still copies no `tests/` path. **SEC-SEC-001:** every compose secret is a `:?` interpolation. PASS. **SEC-DAT-001:** `FACTORFLOW_POSTGRES_PASSWORD` is classified Restricted (RC §4). PASS. **SEC-AUTH-001:** unchanged reasoning, now on one stated preventive control per service. **SEC-DEP-001:** base images use floating tags and no image scan is stated (Observations) |
| CONST-VER 1.2 | **VER-EVD-001:** every verdict rests on reads and commands run this session. **VER-EVD-004:** Stage 1 gives one verdict per changed rule, and the CONST-SEC table one per condition and channel. **VER-DEL-001:** the owner's probes could not be re-run and are marked as such. **VER-CHK-001:** no test suite was run, because the change is design-only; packaging, export, compose and conninfo claims were exercised offline instead |

### CONST-SEC 1.3: the host-local loopback exception, by condition and channel

Channels as RC §2.8.1 (lines 822-826) names them:

- (a) the browser to the API at `http://127.0.0.1:8000`;
- (b) the application container to PostgreSQL;
- (c) the ingestion container to PostgreSQL.

| Check | Condition | (a) browser to API | (b) application container to PostgreSQL | (c) ingestion to PostgreSQL |
|---|---|---|---|---|
| (i) | H1, H3 | PASS. `ApiSettings` bind; no `ports:`. `localhost` residual: FINDING-50 (a) | PASS. `listen_addresses=127.0.0.1`; asserted by `test_compose_definition.py` and smoke check 4 | as (b) |
| (j) | H2 | PASS for the healthcheck (`http.client`) and the smoke check (`curl --noproxy '*'`, no `-L`). H9 keeps any slash redirect on a loopback `Host`. Documentation: FINDING-47 (c) | PASS. URL host `127.0.0.1`, `psycopg` | as (b) |
| (k) | H4 | PASS. No credential crosses | PASS for configuration: `require_auth`, `POSTGRES_HOST_AUTH_METHOD`, `POSTGRES_INITDB_ARGS`. The 128-bit floor is not mandated: FINDING-47 (a). The detective check is partial: FINDING-47 (d) | as (b) |
| (l) | H5 | PASS. Internal (IA §4) | PASS. Internal (MDS §4) | as (b) |
| (m) | H6 | PASS. Owner named; per-deployment statement in release evidence (RC line 842) | as (a) | as (a) |
| (n) | H7 | PASS. Server confinement in `ApiSettings`; FINDING-50 (a) | **FAIL.** The migrator, the first client, is unconfined (FINDING-43). `app_main`'s pool is confined by `DatabaseSettings`. PostgreSQL's deployment definition is release evidence. PASS | PASS. Via `Settings.database`. `localhost` residual: FINDING-50 (b) |
| (o) | H8 | PASS for production: smoke check 4 covers IPv4, IPv6, link-local and the VM's addresses, and ingestion is gated. Gaps: FINDING-47 (b) and (e). Drill: FINDING-46 | as (a) | as (a) |
| (p) | H9 | PASS for the mechanism. Tests cover one of five state-changing routes: FINDING-51 (a) | n/a (not HTTP) | n/a |
| (q) | Citation and decision | PASS. RC, IA, MDS and SD cite `SEC-ENC-001 host-local loopback exception` and name their channels, and DEC-0050's `artifacts` name exactly those four. The schema-migrator is neither (FINDING-43) | | |

## Status of v11 Findings

IDs continue v11's numbering.

| v11 ID | Severity | Status in v12 | Evidence |
|---|---|---|---|
| v11 FINDING-1 | HIGH | **Resolved** | The constitution owner ruled: CONST-SEC 1.3 is in force, and DEC-0050 records reliance. RC §2.8.1, IA §4, MDS §4 and SD 5.11 cite the exception and name the channels. Conformance gaps against the exception's conditions are new findings (43, 46, 47, 50, 51). The E2E database channel stays the constitution owner's open question (iii) (Observations) |
| v11 FINDING-31 | HIGH | **Resolved** | RC §2.8.1 lines 787-807 state one preventive control per service plus a detective check, and record the owner's decision on that basis. IA §4 line 343 matches |
| v11 FINDING-32 | HIGH | **Resolved** | RC §2.8.2: the `lock` stage exports `uv.lock` with hashes, and stage 3 installs with `--require-hashes` then `--no-deps` (verified offline). The `--frozen` claim is wrong: FINDING-45 |
| v11 FINDING-33 | MEDIUM | **Resolved** | MDS §4 lines 556-563: host loopback, every `pg_hba.conf` line `scram-sha-256` |
| v11 FINDING-34 | MEDIUM | **Resolved** | One posture, branch (a): RC §2.8.4, MDS §6 and §14 item 1 (superseded deferral kept as history), SM §6. Residual: MDS §6 "Manual actions required: none" (FINDING-49 (b)) |
| v11 FINDING-35 | MEDIUM | **Resolved** | RC §7 line 1293: the smoke check runs against the real deployment with the owner's values. The drill runs under its own project before any deployment |
| v11 FINDING-36 | LOW | **Partly resolved** | (a) The restart loop is described (RC lines 1014-1020; criterion 14). (b) remains (summary table) |
| v11 FINDING-37 | LOW | **Resolved** | IA §13 and RC §13 AC-14 rows match SD §7. RC §3's pointer was removed. RC §14 item 7 was closed (its residual wording is in FINDING-48 (d)) |
| v11 FINDING-38 | LOW | **Resolved** | Label-based container lookup needs no variables. The version source is named. IPv6 and link-local are covered. The ports precondition is stated (RC §2.8.5) |
| v11 FINDING-39 | LOW | **Resolved** | Continuation lines noted (RC line 1291). Stub `index.html` (line 1290). Table contiguous. Residual in IA §7: FINDING-51 (c) |
| v11 FINDING-40 | LOW | **Resolved** | URL-safe constraint and change procedure (RC lines 987-997). Both variables listed in §2.2, and the password classified Restricted |
| v11 FINDING-41 | LOW | **Resolved** | SM §2.1 lines 118-122 enumerate the three omitted comment sites |
| v11 FINDING-42 | LOW | **Resolved** | SD §4.1 line 298 and `docs/architecture.md` assign the deployment definition |
| v11 FINDING-6 to FINDING-9 | MEDIUM | **Carried by owner choice** | Subjects digest-unchanged |
| v11 FINDING-11, FINDING-12, FINDING-20 | LOW | **Remaining** | RC §2.2c item 2 and the cited §7 rows are unchanged |
| v11 FINDING-13, FINDING-17, FINDING-26 to FINDING-29 | LOW | **Remaining** | massive-client v14 changed only its CONST-SEC pins |
| v11 FINDING-14 | LOW | **Remaining** | RC §3 line 1167 "Section 2.4a specifies the mechanism". §12 Decision row (line 1404) stops at DEC-0037 |
| v11 FINDING-15 | LOW | **Remaining** | SD v8 §4.1 line 300 "Hand-written HTTP client" |
| v11 FINDING-16 | LOW | **Remaining** | Governor digest-unchanged |
| v11 FINDING-18 | LOW | **Remaining, extended** | Summary table |
| v11 FINDING-30 | LOW | **Remaining** | Capability and system design do not record the definition of fundamentals |

## Stage 1 -- Specification Compliance of the Change

One verdict per changed rule (VER-EVD-004). PASS means four things hold: the
rule agrees with the owner decisions and the governing sources, it agrees with
the code and the tools, it has a test row or check where it is behaviour, and
it contradicts no other subject. Line numbers refer to `7628f86`. RC is
runtime-config, IA ingestion-api, MDS market-data-store, SM schema-migrator,
MC massive-client, AR acquisition-runner and SD the system design.

| # | Rule | Location | Governing source | Test or check | Verdict |
|---|------|----------|------------------|---------------|---------|
| 1 | AC-14: one preventive control per service, one detective check | RC §2.8.1 lines 787-807; IA §4 line 343; RC §13 line 1418 | AC-14; owner decision 2026-10-12 | `test_api_binding.py`, `test_compose_definition.py`, smoke check 4 | PASS |
| 2 | Channels (a) to (c) rely on the host-local exception; H1 to H9 mapping | RC §2.8.1 lines 822-845 | CONST-SEC 1.3; DEC-0050 | per row | PASS for H1 to H3, H5, H6 and H9. H4, H8: PASS with gaps (FINDING-47). H7: **FAIL** (FINDING-43). Status text stale (FINDING-48 (a)) |
| 3 | `DatabaseSettings` refuses a plaintext URL to a non-loopback host and every libpq override route | RC §2.3 lines 541-548, 619-635 | H7; check (n) | `test_database_url_confinement.py` | PASS for the validator. **FAIL** for coverage of every client (FINDING-43). `localhost` residual (FINDING-50 (b)) |
| 4 | The image installs exactly the locked set | RC §2.8.2 lines 865-893 | tech stack OQ-TS-5; v11 FINDING-32 | RC §7 Dockerfile row | PASS for the install (verified). **FAIL** for the stale-lock claim (FINDING-45) |
| 5 | `scram-sha-256` enforced on every route; the client requires it | RC §2.8.3 lines 924, 935-936, 998-1003; MDS §4 | H4 | `test_compose_definition.py`; smoke check 1 | PASS for configuration (rendered). Entropy and detective-check gaps (FINDING-47 (a), (d)) |
| 6 | Ingestion in a profile, started after the smoke check | RC §2.8.3 lines 965, 1004-1013 | H8 | `test_compose_definition.py` | PASS (profile verified). First-use ordering of the interface (FINDING-47 (e)) |
| 7 | Password: URL-safe, initialisation caveat, change procedure | RC §2.8.3 lines 987-997 | v11 FINDING-40 | n/a | PASS |
| 8 | Restart loop described; healthchecks open no uncovered channel | RC §2.8.3 lines 1014-1028 | v11 FINDING-36 (a); H2, H7 | criterion 14 | PASS |
| 9 | Healthcheck timings | RC §2.8.3 lines 1029-1034 | AGT-EVIDENCE-002 | n/a | **FAIL** LOW (FINDING-36 (b)) |
| 10 | Upgrade, backup and rollback | RC §2.8.4 lines 1047-1091; MDS §6, §14 item 1; SM §6 | OPS-MIG-003; owner decision 2026-10-12 | RC §7 drill row | PASS (v11 FINDING-34 resolved). MDS §6 manual-actions line (FINDING-49 (b)) |
| 11 | The drill | RC §2.8.4 lines 1093-1101; §7 line 1294 | OPS-MIG-003; H8 | the drill | **FAIL** (FINDING-46) |
| 12 | Smoke check: label lookup, version source, `pg_hba.conf`, IPv6, link-local, VM addresses | RC §2.8.5 lines 1103-1140 | AC-14, AC-15, AC-18; H4, H8 | itself | PASS (v11 FINDING-38 resolved). Gaps: FINDING-46 (label), FINDING-47 (b), (d) |
| 13 | Two new deployment variables; password Restricted | RC §2.2 lines 124-125; §4 lines 1183-1188 | SEC-DAT-001 | n/a | PASS. "Both" and "either" with three values (FINDING-48 (e)) |
| 14 | Test-double reliance re-pinned to 1.3 | RC §2.2c lines 329-354; MC lines 259-264; AR lines 122-126; DEC-0051 | CONST-SEC 1.3 Impact | n/a | PASS for substance (verified). **FAIL** for the gate text (FINDING-44) |
| 15 | §6, §9 operational steps | RC §6 lines 1246-1250; §9 lines 1353-1359 | §2.8.3 | n/a | **FAIL** LOW (FINDING-49 (a)) |
| 16 | §7 rows: confinement, distribution stub, Dockerfile, compose, smoke check, drill | RC §7 lines 1289-1294 | H1 to H4, H7; B1, B3; v11 FINDING-39 | itself | PASS. The Dockerfile row asserts `--frozen` (FINDING-45). There is no migrator row (FINDING-43) |
| 17 | §8 criteria 12 to 14 | RC §8 lines 1335-1349 | AC-14, AC-16; H7 | smoke check; compose row | PASS. "Either process" omits the migrator (FINDING-43) |
| 18 | §12, §14 items 6 to 8 | RC §12 lines 1400-1410; §14 lines 1504-1542 | n/a | n/a | **FAIL** LOW (FINDING-48 (b), (d)) |
| 19 | Host and Origin middleware | IA §2.5a lines 269-299 | H9; owner decision 2026-10-12 | `test_api_host_origin.py` | PASS (routes, WebSocket, E2E origins, TestClient count verified). Test breadth (FINDING-51 (a)). Contract listing (FINDING-51 (b)) |
| 20 | Browser hop relies on the exception; AC-14 single control | IA §4 lines 343-348, 369-380 | CONST-SEC 1.3; DEC-0050 | n/a | PASS |
| 21 | IA §13 AC-14 row | IA §13 | SD §7 | n/a | PASS (v11 FINDING-37 (a) resolved) |
| 22 | Database exposure, `scram-sha-256` and the exception | MDS §4 lines 556-572 | RC §2.8.1, §2.8.3 | n/a | PASS (v11 FINDING-33 resolved) |
| 23 | Migration-path references enumerated; manual actions | SM §2.1 lines 113-122; SM §6 lines 320-323 | v11 FINDING-41; RC §2.8.4 | n/a | PASS |
| 24 | §4.1 `runtime-config` owns the deployment definition; 5.11 cites the exception | SD §4.1 line 298; 5.11 lines 404-412 | owner decision 2026-10-12; DEC-0050 | `build-architecture.py` | PASS |
| 25 | Version bump; status and approval block kept; provenance refreshed | All seven frontmatters | `docs/artifact-contract.md` | `check-artifacts.py --strict` | PASS. MC and AR timestamps wrong (FINDING-48 (f)). Pins (FINDING-18). Approvals stale until re-approved |

## Stage 2 -- Artifact Quality of the Change

- **Contract.** All seven changed designs pass `check-artifacts.py --strict`
  with no error. Four carry pin warnings (FINDING-18). The correlation ID is
  unchanged.
- **Structure.** All 14 template sections are present. RC §7's table is
  contiguous again.
- **Cross-references.** Every section the new sentences cite exists. Several
  status sentences were written before 1.3 came into force and were not
  updated (FINDING-48).
- **Quantitative values.** Ports, the 192-bit password, uv 0.12.10 and Node 22
  are sourced. Healthcheck timings are not (FINDING-36 (b)).
- **Placeholders.** None introduced.
- **Clarity.** Commands, keys and paths are exact. RC §14 item 6 contradicts
  its own heading (FINDING-48 (d)).

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification. It is assessed against the
system design.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` passed with no error and no warning. Dependency
typing, placement across 5.1 to 5.3 and the STD-UI specialization are
unchanged from v11. No `blocked-by` edge exists.

#### Completeness (SR-1)

Unchanged. FINDING-9 is carried.

#### Correctness (SR-2)

No contradictory acceptance criteria. AC-14 is met by the specified
deployment under one preventive control per service.

#### Testability (SR-4)

All 26 criteria have an observable outcome, a concrete input and a measurable
boundary (unchanged).

#### Clarity (SR-6)

FINDING-30 is carried.

### System Design Specification

v8 is accurate in §1, §4.1 and 5.11. The 5.11 sentence names both channel
families and cites the exception and DEC-0050 (check (q)). Its "in force only
once" clause is now satisfied (FINDING-48 (g)). FINDING-15 and FINDING-18
remain. The §4.2 status codes do not list the H9 answers (FINDING-51 (b)).

### Component Design Specifications

#### runtime-config v13 (changed)

- **Correctness and feasibility (SR-2, SR-7).**
  - FINDING-45: `--frozen`.
  - FINDING-46: the drill.
  - FINDING-36 (b): healthcheck timings.

  Verified to hold: the locked export, the rendered compose file, profile
  gating, the drill's separate volume, and `require_auth` parsing.
- **Conformance (SR-9).** FINDING-43 (H7 for the migrator, through §2.3, §7
  and §8 criterion 14), FINDING-47 (H2, H4, H8 in the procedure), FINDING-50.
- **Consistency and clarity (SR-3, SR-6).** FINDING-44 (gate text),
  FINDING-48 (status text), FINDING-49 (three or four variables).
- **Carried.** FINDING-11, FINDING-12, FINDING-14, FINDING-20.

#### ingestion-api v8 (changed)

§2.5a meets H9's mechanism and its relaxation for services that change state
only on unsafe methods. That relaxation is justified by the routes. FINDING-51
covers test breadth, the contract listing and the stale distribution row.

#### market-data-store v9 (changed)

§4 is correct, and so is the superseded rollback record. FINDING-49 (b) covers
the §6 manual-actions line.

#### schema-migrator v6 (changed)

The reference enumeration and §6 are correct. The migrator's own database
connection is the subject of FINDING-43: SM names no H7 confinement, cites no
exception, and has no test for either.

#### massive-client v14, acquisition-runner v9 (changed: re-pin only)

AR's re-pin is consistent. MC line 259 still says the reliance is on "CONST-SEC
1.2", and line 262 paraphrases RC's gate as "CONST-SEC 1.3 in force", which RC
does not say (FINDING-44). Both carry a provenance timestamp after their commit
(FINDING-48 (f)) and stale system-design and tech-stack pins (FINDING-18).

#### coverage-service, instrument-list-service, observation-writer, owner-web-app, rate-limit-governor, run-journal (unchanged)

None depends on the changed text. None cites CONST-SEC 1.2 or a loopback
reading, none describes a backup posture, and each cites constraint 5.11 only
for "loopback, no authentication", which v8 keeps. Their carried findings
stand as v11 recorded them.

#### Feasibility (SR-7), all components

No circular dependency. The change adds no component and no interface. It adds
one operational step, ingestion after the smoke check, which `profiles`
enforces at `up` and which a reboot does not need.

### UX Brief

Unchanged (v7). No user-facing surface changed.

### UX Design Specification

Unchanged (v5). FINDING-8 is carried. The H9 answers are never seen by the
owner interface, because its requests carry its own origin and host.

### Cross-Specification Consistency (SR-3)

- CROSS-SPEC-INCONSISTENCY (FINDING-44): the test-double gate. RC §2.2c says
  "CONST-SEC 1.2 is in force"; MC line 262 says "CONST-SEC 1.3 in force"; both
  pin 1.3's revision.
- CROSS-SPEC-INCONSISTENCY (FINDING-43): channel (b)'s confinement. RC places
  it in `DatabaseSettings`; SM says the migrator takes its URL "from
  `runtime-config`"; the code reads the environment directly; no design
  reconciles them.
- CROSS-SPEC-INCONSISTENCY (FINDING-49 (b)): upgrade manual actions. MDS §6
  says "none"; RC §2.8.4 and SM §6 say "`pg_dump` first".
- CROSS-SPEC-INCONSISTENCY (FINDING-51 (c)): the distribution test. IA §7 says
  the bundle is "built before `uv build`"; RC §7 says a stub is written.
- CROSS-SPEC-INCONSISTENCY (FINDING-48 (c)): RC §2.2c lines 453-458 describe
  an IA §4 reading that IA v8 withdrew.
- **Consistent:**
  - the host-local channel naming across RC §2.8.1, IA §4, MDS §4 and SD 5.11;
  - DEC-0050's artifacts against the designs that cite the phrase;
  - the rollback posture across RC §2.8.4, MDS §6 and §14, and SM §6;
  - the AC-14 element across SD §7, RC §13 and IA §13;
  - the `scram-sha-256` statement across RC §2.8.3 and MDS §4.

---

## Findings Summary Table

CRITICAL 0 · HIGH 1 · MEDIUM 8 · LOW 19 · **total 28**. By origin:

- 4 MEDIUM carried by owner choice (since v5);
- 15 LOW remaining (v5 to v11);
- 9 new in this round: 1 HIGH, 4 MEDIUM, 4 LOW.

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-43 | HIGH | SR-9 / SR-4 / SR-3 | schema-migrator; runtime-config | SM §1 lines 75-77, §4 lines 269-270, §7; RC §2.3 lines 541-548 and 619-635, §2.8.1 H7 row line 843, §7 line 1289, §8 criterion 14 line 1343; DEC-0050 `artifacts` | **New.** H7 requires every client the product's code controls to refuse plaintext to a non-loopback address "whatever its configuration says". Check (n) requires tests showing it. The designs put that refusal in `DatabaseSettings` only, test only `DatabaseSettings`, and §8 criterion 14 speaks of "either process". The first client on channel (b) is the migrator. The image runs `python -m factorflow.db.migrate_main` as its own process before `app_main` (RC line 881), and the migrator opens its own connection (SM §5). At `7628f86`, `migrate_main.py` reads `FACTORFLOW_DATABASE_URL` from `os.environ` (lines 8-13 and 168) and calls `psycopg.connect` on it (line 116), bypassing `DatabaseSettings`; its docstring defers the wiring to a follow-up. SM v6 says only that the URL "comes from `runtime-config`". It names no H7 check, cites no exception and has no test for it, and DEC-0050's `artifacts` omit it | Implemented to these designs, the migrator connects in plaintext to whatever host the variable names before any validator runs. Channel (b) then fails H7, and the exception does not cover it, so the channel has no SEC-ENC-001 standing (Critical). Check (n) would pass on `DatabaseSettings` tests while the client that runs first is unconfined, and release security evidence would claim H7 where it does not hold | In SM §2.5 or §4, require `migrate_main` to load the URL through `DatabaseSettings` (or the same validator) before connecting, exiting 1 with a message naming the variable and not the value. Add an SM §7 row mirroring `test_database_url_confinement.py` for `migrate_main.main()`: a non-loopback host without `sslmode=verify-full`, a `hostaddr` parameter, `PGHOST` set; each exits non-zero, and `psycopg.connect` is never called. Extend RC §8 criterion 14 to the migrator. Then either have SM cite the `SEC-ENC-001 host-local loopback exception` for its connection and record SM in a decision that extends DEC-0050's artifacts, or state in RC §2.8.1 that channel (b) includes the migrator's connection |
| FINDING-44 | MEDIUM | SR-3 / SR-6 / SR-9 | runtime-config; massive-client | RC §2.2c lines 290, 320, 329-354 (bullets 340-344, then 346-350), §4 lines 1202-1208, §7 lines 1280-1284, §8 criterion 10 lines 1326-1331, §14 item 4 lines 1455-1487; MC lines 259-264 | **New.** CROSS-SPEC-INCONSISTENCY. The re-pin (DEC-0051) changed the pinned revision but not the version the gate names. RC §2.2c pins 1.3's `sha256:0f5659...` and then makes clause 2a take effect only when "CONST-SEC 1.2 is in force under its own rule" and "that in-force file's content revision equals the pinned revision above". 1.3 is in force, so under its own rule 1.2 is not, and the two bullets cannot both hold. Read literally, clause 2a is not in force, though it is already implemented in `tests/e2e/support/ingestion_e2e_main.py`. The same 1.2 wording recurs in the places listed. MC line 259 relies on "CONST-SEC 1.2", and line 262 paraphrases RC's gate as "CONST-SEC 1.3 in force". DEC-0051's substance holds: the test-double text is identical in 1.2 and 1.3 (Supplementary Evidence) | The activation condition of a Critical-invariant exception contradicts itself in its owning design. A reader cannot tell from RC whether clause 2a is in force, and the strict reading stops the E2E acquisition stack | Change both §2.2c bullets and lines 346-350 to 1.3. Relabel the other 1.2 references, or say once that the test-double text is unchanged since 1.2. Align MC line 259. Close §14 item 4's "Still open" paragraph |
| FINDING-45 | MEDIUM | SR-2 / SR-7 | runtime-config | RC §2.8.2 lines 870, 888-889; §7 line 1291 | **New.** "`--frozen` fails the build if `uv.lock` is out of date with `pyproject.toml`, so an unlocked change cannot reach an image." That is `--locked`. `--frozen` exports the lock without checking it. Reproduced with uv 0.12.10 offline: with `requests>=2` added to `pyproject.toml`, `uv export --frozen ...` exits 0 and omits `requests`, while `--locked` refuses. Stage 3 installs the project with `--no-deps`, so a dependency added without relocking is absent from the image. CI's `uv sync --all-extras` (`.github/workflows/validate.yml` lines 46 and 131) re-locks silently, so the tests would still have it. The §7 row asserts `--frozen` | The deployed dependency set can again differ from the tested one, which is the defect class v11 FINDING-32 closed. The design states a guarantee its command does not give | Use `uv export --locked ...`, and assert `--locked` in the §7 row. Optionally run `uv sync --locked` in CI. Correct the sentence |
| FINDING-46 | MEDIUM | SR-9 / SR-7 | runtime-config | RC §2.8.4 Drill lines 1093-1101; §2.8.5 lines 1110-1112; §7 line 1294 | **New.** The drill backs up "a store holding a completed acquisition run" under `docker compose -p factorflow-drill`, before the first deployment. The release image accepts only an `https` provider (§2.2c clause 2), so a completed run needs the live provider and the owner's real key. The drill stack therefore operates on production data, which makes it a production environment under CONST-SEC's definitions, over the same plaintext channels (a) to (c). H8 requires the off-host listener check before a channel first carries production data, with the result kept as release evidence. If the drill is treated as another environment, the check is due before first use, kept with its records. The drill specifies no check. As specified it cannot run one: `deploy-smoke.sh` "finds containers by the project label" `com.docker.compose.project=factorflow`, so it does not see `factorflow-drill` containers | The drill runs plaintext channels carrying production data outside the exception's conditions, and its record is release evidence (OPS-MIG-003, B5) | Give `deploy-smoke.sh` a project-name argument (default `factorflow`). Specify that the drill starts `postgres` and `app`, runs the smoke check, keeps the output with the drill record, and only then starts ingestion. State whether the drill uses the owner's real key and that the H6 statement covers it |
| FINDING-47 | MEDIUM | SR-9 / SR-1 | runtime-config | RC H2 row line 838, H4 row line 840, H8 row line 844; §2.8.3 lines 987-989; §2.8.5 lines 1106-1107 and 1112-1116; §6 lines 1246-1250; §9 lines 1353-1359 | **New.** Four exception obligations rest on owner actions the procedure does not require, and one claim is broader than the procedure. **(a) H4's 128-bit floor.** The H4 row says the password "is generated with `openssl rand -hex 24`". §2.8.3's normative sentence constrains only characters ("`openssl rand -hex 24` produces one"), and §6 and §9 say only "set" or "export". A short URL-safe password complies with the procedure and fails H4, and no release-evidence item records the generation (check (k)). **(b) H8 after network changes.** CONST-SEC's *Deployment* includes "a change to the host's network configuration", and the H8 row says "(as the exception defines it)". §2.8.5 and §9 say "after every `docker compose up -d`". **(c) H2's documentation.** The H2 row says the README and §9 direct the browser to `http://127.0.0.1:8000`. §9 has no URL, the README has none at `7628f86`, and no design lists that README change. **(d) Smoke check 1** looks only for `trust`. H4 also forbids `password`, and check (k) says "with a cleartext secret". **(e) "Ingestion, the only process that brings production data in."** On a first deployment, the interface can write owner data (instruments, history depth) to the production store before the check, and §9 does not order the check first | Release evidence for H2, H4 and H8 depends on steps the design does not require, so a deployment can follow the design and still fall outside the exception | (a) Require a password of at least 128 bits from a CSPRNG in §2.8.3, §6 and §9, and add the generation statement to the release evidence beside H6's. (b) Add "and after any change to the host's network configuration" to §2.8.5 and §9. (c) List the README change and put the URL in §9. (d) Assert that every non-comment `pg_hba.conf` method is `scram-sha-256` (or `peer` or `reject`). (e) Order the smoke check before first use of the interface on a first deployment |
| FINDING-6 | MEDIUM | SR-5 | Rate-limit governor | §8 AC-1 amendment note | Carried from v5, unchanged by owner choice. `docs/decision-records.md` does not exist in this repository | Readers cannot resolve the normative decision from the project repository | Correct the citation or mirror DEC-0002 |
| FINDING-7 | MEDIUM | SR-2 | Rate-limit governor | §2.5 final paragraph | Carried from v5, unchanged by owner choice. It says all jitter is full jitter, but the boundary wait adds jitter on top | Misdescribes the implemented boundary wait | Specify additive boundary jitter |
| FINDING-8 | MEDIUM | SR-3 | UX design | §6 Source Mapping | Carried from v5, unchanged by owner choice. Stale source versions | Verification points to superseded inputs | Update the three source versions |
| FINDING-9 | MEDIUM | SR-1 | Capability | §8 Readiness Assessment | Carried from v5, unchanged by owner choice. It states 23 ACs and three open questions | The readiness summary misstates coverage | Update the counts |
| FINDING-48 | LOW | SR-3 / SR-6 / SR-2 | runtime-config; ingestion-api; market-data-store; system design; massive-client; acquisition-runner | as listed | **New.** Stale or incorrect status text and provenance. (a) RC line 828: "That exception is **not yet in force**". It has been since `e2c6124`. (b) RC §12 line 1406 lists a "v1.3 draft ... not in force until reviewed, approved and merged" beside line 1400's 1.3 row. (c) RC §2.2c lines 453-458 describe an IA §4 reading that IA v8 (lines 372-380) withdrew, and say 1.2 leaves the database channels open, which 1.3 decided. (d) RC §14 item 6 (lines 1504-1522) is headed "Decided", then says "Open; nothing is decided here". Item 4 still lists 1.2's approval as open. Item 7 says the tech stack names no Node version. Item 8 (line 1533) keeps "its two-control structure", which §2.8.1 now disclaims. (e) RC §4 lines 1184-1191 list three Restricted values, then say "Both" and "either". (f) MC and AR carry `ai_provenance.timestamp: 2026-10-12T22:00:00Z`, but commit `7628f86`, which wrote them, is dated 19:38:22Z, and this review ran at 20:17Z. (g) IA line 378, MDS line 572 and SD line 411 say the exception is in force "only once" 1.3 is approved and merged; that is now satisfied | Readers of the security sections are told the exception is not in force, and the AGT-PROV-001 audit trail carries a future timestamp. No behaviour changes | Update the status sentences, drop line 1406 and the superseded §2.2c paragraph, tidy §14 items 4 and 6 to 8, fix "Both" and "either", and correct the two timestamps at the next revision |
| FINDING-49 | LOW | SR-3 / SR-6 | runtime-config; market-data-store | RC §6 lines 1246-1250, §9 line 1354; MDS §6 line 626 | **New.** (a) §2.8.3 (line 981) and §8 criterion 12 require four variables. §6 lists three, omitting `FACTORFLOW_IMAGE_TAG`, whose `:?` guard stops `up`, and omits the smoke check and the `--profile ingestion` start. §9 says "the three variables of section 2.8.3". (b) MDS §6 still says "Manual actions required: none" for an upgrade. RC §2.8.4 step 1 and SM §6 line 320 require a `pg_dump` first | An owner following §6 or §9 cannot start the deployment, and MDS understates the upgrade procedure | Say four variables in §6 and §9 and add the smoke-check and profile steps to §6. Align MDS §6 with SM §6 |
| FINDING-50 | LOW | SR-9 / SR-2 | runtime-config | RC §2.2c lines 301-302; §2.3 lines 627-630; `config/settings.py` line 23 | **New.** `localhost` residuals. (a) `ApiSettings` accepts `localhost` as a bind host (`_LOOPBACK_HOSTS = {"127.0.0.1", "localhost", "::1"}`, which RC says `ApiSettings` uses). H1 names only `127.0.0.1` and `::1` for a listener, check (i) wants bind configuration naming only those, and H7 wants the server to refuse a non-loopback bind at start. A `localhost` bind goes wherever the resolver points, unchecked. (b) `DatabaseSettings` resolves `localhost` once at load, while H7 asks for "every address it actually connects to". The design records this and rests it on H6. The deployment names `127.0.0.1` for both, so neither engages as specified | A configuration the code accepts can step outside H1 or H7 without a refusal | Accept only the two literals for the API bind (and, if the tests allow, for a plaintext database host), or resolve `localhost` and bind or connect to the verified address. Otherwise record (b) as an accepted residual |
| FINDING-51 | LOW | SR-4 / SR-1 / SR-3 | ingestion-api; system design | IA §7 lines 446-447; IA §11; SD §4.2 | **New.** (a) Check (p) asks for tests showing that "every state-changing route" rejects a foreign `Origin`. The row exercises `POST /api/acquisition-runs` only. Four more exist (`POST .../{run_id}/cancel`, `PUT /api/settings/history-depth`, `POST /api/instruments`, `DELETE /api/instruments/{symbol}`), and `Origin: null` is not covered. (b) `400 host_not_allowed` and `403 origin_not_allowed` apply to every endpoint, but neither IA §11 nor SD §4.2 lists them. (c) IA §7 line 447 still says "With the bundle built before `uv build`". RC §7 line 1290 now writes a stub `index.html` (v11 FINDING-39 (b)) | Check (p)'s evidence is one route, endpoint contracts omit two responses, and two designs describe the same test differently | Parametrise the Origin test over the five routes and add `Origin: null`. Note the two responses in IA §11 (once, for all endpoints) and SD §4.2. Copy RC §7's wording into IA §7 |
| FINDING-36 | LOW | SR-2 | runtime-config | RC §2.8.3 lines 1029-1034 | Remaining from v11, part (b) only. The healthcheck interval, timeout and retries are called "design values, not derived ones", with a rationale, but cite none of the sources AGT-EVIDENCE-002 accepts and carry no `[REQUIRES INPUT]` marker | Unsourced quantitative values in a governed design | Record the owner's direction for the values, or mark them |
| FINDING-11 | LOW | SR-2 / SR-9 | runtime-config | §2.2c item 2; §7 | Remaining from v6. `localhost` is resolved once at start (test-double entry point) | Residual gap against SEC-ENC-001 condition (2) | Re-check per claim, drop `localhost`, or record the residual |
| FINDING-12 | LOW | SR-4 | runtime-config | §2.2c clause 8; condition table; item 2; §7 | Remaining from v6. A missing control-character row, a missing parser-agreement assertion, and one wrong table reason | Small regressions pass the design's suite | Add the row and assertion, and correct the reason |
| FINDING-13 | LOW | SR-6 | massive-client | §8; §2.2b comment | Remaining from v6, part (b). "guarantees `https`" is not qualified "in the release build" | Overstates a guarantee for non-release builds | Qualify both |
| FINDING-14 | LOW | SR-6 | runtime-config | §3 line 1167; §14 item 3; §2.3; §12 line 1404 | Remaining from v6 and v7. Dangling pointers ("Section 2.4a"; the section 7 test that lives in ingestion-api; `MassiveSettings(BaseSettings)`), and a §12 Decision row that omits DEC-0038 | Readers land on the wrong text | Fix the pointers and extend the row |
| FINDING-15 | LOW | SR-3 | System design | §4.1 line 300 | Remaining from v6. `massive-client` is described as "Hand-written HTTP client" | Contradicts the SDK-based design | Reword the row |
| FINDING-16 | LOW | SR-4 | Rate-limit governor | §8 AC-11 | Carried from v5. A concurrent-caller criterion under a single-threaded model | Vacuously satisfied | Record it as vacuous, or restate it |
| FINDING-17 | LOW | SR-6 | massive-client | §14 item 2 | Carried from v5. It still claims to block the governor throttle path | Reports a discharged blocker | Mark it resolved |
| FINDING-18 | LOW | SR-3 | System design; component designs; UX artifacts | Frontmatter pins and References tables | Carried from v5, **extended**. SD v8 and MDS v9 pin tech stack v3, and v5 is current. AR v9 and MC v14 were re-pinned to CONST-SEC 1.3 but still pin system design v6 and tech stack v3. RC §12 labels the capability v6, the system design v3, the UX design v4 and the tech stack v3. IA §12 and SM §12 labels are as v11 recorded. `check-artifacts.py` counts 33 system-design pin warnings | Repeated checker warnings and stale labels. Content impact assessed: none (Cross-Specification Consistency) | Propagate current versions when each design is next revised |
| FINDING-20 | LOW | SR-2 / SR-4 | runtime-config | §7; item 3 | Remaining from v7. Two test rows contradict on `e2e-test-key`, and DEC-0040 settles it at story level only | `$test-design` meets the contradiction | Align RC §7 with DEC-0040 |
| FINDING-26 | LOW | SR-2 / SR-6 | massive-client | §2.4 | Remaining from v9. It says the corporate-action reads, plural, depend on `VXClient`; only the IPO read does | Self-contradiction with §2.2b and §7; no behaviour change | Reword as v9 recommended |
| FINDING-27 | LOW | SR-4 / SR-6 / SR-7 | massive-client | §7 redirect row | Remaining from v9. The injected-`monotonic` alternative does not require the injected `sleep` to advance it | A literal reading yields a test that hangs | Name the `FakeClock` and `FakeSleeper` coupling, or drop the alternative |
| FINDING-28 | LOW | SR-5 | massive-client | §12 Review rows | Remaining from v9. No §12 row for specification review v8 | v8's evidence cannot be found from the design | Add the row |
| FINDING-29 | LOW | SR-2 | massive-client | §5 | Remaining from v10. "Up to four reads per instrument ... 12000 requests". §2.5 and §11 give nine first-page requests per instrument, so about 27000 | Run-duration expectations come out about 2.25 times too short | Restate as nine first-page requests, about 27000 plus pages |
| FINDING-30 | LOW | SR-6 / SR-5 | Capability; system design; massive-client | Capability AC-3; massive-client §2.5 | Remaining from v10. The definition of "company fundamentals" (three statements, no ratios) lives only in two component designs | A later reader can reintroduce ratios under AC-3 | Record it in the capability or a decision record |

---

## Traceability Matrix

| Layer | Coverage | Evidence |
|-------|----------|----------|
| Capability to system design | 26/26 | System design §7. Unchanged except the AC-14 row, which matches the component rows |
| Capability to UX design | 26/26 | UX design §5 (unchanged) |
| Capability to component designs | 26/26 | Every AC is still referenced. The AC-14 rows in RC §13 and IA §13 now match SD §7 |
| System components to component designs | 12/12 | One design per component; `build-architecture.py` PASSED. §4.1 now assigns the deployment definition to `runtime-config` |

Changed design elements:

| Design element | Capability AC | Constitution or decision | Release blocker | Component AC or test |
|---|---|---|---|---|
| RC §2.8.1 one preventive control per service, one detective check | AC-14 | Owner decision 2026-10-12; SEC-AUTH-001 basis | B4 | RC §8 criterion 13; `test_compose_definition.py`; smoke check 4 |
| RC §2.8.1 H1 to H9 mapping; IA §4; MDS §4; SD 5.11 | AC-13, AC-14 | CONST-SEC 1.3 host-local exception; DEC-0050 | release security evidence | per condition (CONST-SEC table); FINDING-43, 46, 47 |
| RC §2.3 `DatabaseSettings` H7 validator | AC-13 | H7, check (n) | release security evidence | `test_database_url_confinement.py`; RC §8 criterion 14. No migrator row (FINDING-43) |
| RC §2.8.2 locked install | AC-15, AC-16 | tech stack OQ-TS-5; SEC-NDG-001 | B1, B3 | RC §7 Dockerfile row (FINDING-45) |
| RC §2.8.3 `scram-sha-256`, `require_auth`, ingestion profile | AC-13, AC-15, AC-16 | H4, H8; SEC-SEC-001 | B4 | `test_compose_definition.py`; smoke check 1 |
| RC §2.8.4 backup, rollback, drill | AC-15, AC-16 | OPS-MIG-003; OPS-DEST-001 | B5 | drill row (FINDING-46) |
| RC §2.8.5 smoke check | AC-14, AC-15, AC-18 | H4, H8; OPS-ERR-001 | B1, B3, B4 | itself |
| RC §2.2c re-pin; MC, AR re-pins | AC-13 | CONST-SEC 1.3 test-double exception; DEC-0036, DEC-0051 | n/a | existing §7 rows (FINDING-44) |
| IA §2.5a Host and Origin middleware | AC-14 (no-authentication posture) | H9 | release security evidence | `test_api_host_origin.py` (FINDING-51 (a)) |
| SD §4.1 `runtime-config` row | n/a | owner decision 2026-10-12 | B4 | `build-architecture.py` |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

There are no CRITICAL findings, so the verdict is not NOT-READY. One HIGH
finding exists, so it is not READY:

- **FINDING-43** (new): the migrator, the first client on the application's
  database channel, is outside the H7 confinement the designs specify. No
  design requires or tests its confinement, and the code at `7628f86` bypasses
  it. Channel (b) would then fail a condition of the exception that gives it
  SEC-ENC-001 standing.

**The lane is not cleared.** CAP-001 is on the high-risk lane (signal
`deployment-topology`). Specification review must reach READY, and
READY-WITH-WARNINGS does not clear the lane. FINDING-43 must be resolved by a
revised schema-migrator design (and the RC §8 criterion it touches), and a new
specification review must cover the revised revisions.

The four new MEDIUM findings do not block the verdict. They should be folded
into the same revision, because each touches the exception's evidence or the
deployment procedure on this lane:

- FINDING-44, the gate text;
- FINDING-45, `--locked`;
- FINDING-46, the drill;
- FINDING-47, the procedure obligations.

The change otherwise achieves what it set out to do. v11's three HIGH findings
are resolved:

- the AC-14 control count is honest and decided by the owner;
- the image installs the locked, hash-verified set;
- the constitution owner's ruling is in force, with every relying design
  citing it.

The `scram-sha-256` enforcement, the H9 middleware and the backup procedure
are sound.

The rubric defines readiness as this verdict and no numeric score, so none is
given.

**This verdict is review evidence, not approval.**

- The seven changed subjects are system-design v8, ingestion-api v8,
  market-data-store v9, massive-client v14, acquisition-runner v9,
  runtime-config v13 and schema-migrator v6. Each keeps `status: approved`
  with an approval block that does not cover its current revision, so each is
  unapproved at that revision. Each stays blocked from epic generation and
  test design until the owner explicitly approves it with
  `python3 scripts/artifact-gate.py approve --project factorflow-v2 --artifact
  <design path> --review-artifact
  docs/capabilities/CAP-001-market-data-acquisition-foundation/specifications-review-report-v12.md`.
- READY-WITH-WARNINGS is a passing verdict for that command. On the high-risk
  lane it is not sufficient for the specification gate, so approving against
  this report would not clear the lane.
- The other nine subjects keep their existing approvals, because this report
  covers them at the same ID, version and content revision.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. **FINDING-43.** Specify in schema-migrator that `migrate_main` validates
   `FACTORFLOW_DATABASE_URL` through `DatabaseSettings` before connecting.
   Add the test row, extend RC §8 criterion 14, and bring the migrator under
   the exception's citation and decision record.

### Should Fix (MEDIUM findings)

2. **FINDING-44.** Make RC §2.2c's gate name 1.3, and align MC.
3. **FINDING-45.** `uv export --locked`, asserted in RC §7.
4. **FINDING-46.** Parameterise the smoke check's project, and run it in the
   drill before ingestion.
5. **FINDING-47.** Carry H4's entropy floor, H8's network-change trigger,
   H2's documentation, a full `pg_hba.conf` check, and first-use ordering into
   §2.8.3, §2.8.5, §6, §9 and the release evidence.
6. FINDING-6 to FINDING-9: the carried v5 items, held by owner choice.

### Nice to Have (LOW findings)

7. FINDING-48 to FINDING-51: small edits, cheap to fold into the revision for
   FINDING-43 to FINDING-47, together with FINDING-18's labels.
8. FINDING-36 (b), FINDING-11 to FINDING-17, FINDING-20 and FINDING-26 to
   FINDING-30: unchanged residuals.

---

## Observations Outside the Review Subjects

These are not findings against the specifications.

- **Tech stack v5's approval is stale (owner action).**
  `artifact-gate.py check` on `docs/constitution/tech-stack.md` reported
  FAILED: the approval is for `sha256:46408823...` and the current revision is
  `sha256:cf11e1b4...`. Four revised designs pin v5. The owner re-approves it
  through `$tech-stack`. It is review-exempt and is not a finding here.
- **DEC-0050 and DEC-0051 read `owner_reviewed: false`, `status: open`.**
  Both are `decided_by: owner`. The owner may want to review them when
  approving the designs.
- **The implementation does not yet match the designs.** At `7628f86`:
  - `migrate_main.py` reads the URL from the environment, and `_MIGRATIONS_DIR`
    still resolves `parents[3]`;
  - there is no `compose.yaml`, `.dockerignore` or `scripts/deploy-smoke.sh`;
  - the H9 middleware is absent;
  - `tests/e2e/support/ingestion_e2e_main.py` still cites CONST-SEC 1.2.

  This is follow-up work after approval, and it is high-risk-lane work.
- **Plaintext loopback channels in tests and CI.** IA v8 withdrew the reading
  that a loopback hop does not engage SEC-ENC-001. Without it, these channels
  need standing too, or a classification of their fixture data as Public:
  - the E2E stacks' browser to API channels on `127.0.0.1:8123` to `8125`;
  - the main E2E database channel, which publishes its port on every
    address and stays the constitution owner's open question (iii);
  - the testcontainers database used by the postgres-marked tests.

  The test-double exception covers only the stub channel. The host-local
  exception would need H6 and H8 in each environment, and CI runs on
  GitHub-hosted `ubuntu-latest` runners, where H6 is doubtful. This is the
  constitution owner's and capability owner's decision.
- **SEC-DEP-001 for the image.** Base images use floating tags
  (`node:22-slim`, `python:3.12-slim`, `postgres:16`), and no image scan is
  stated. MDS §4 says the PostgreSQL image is "covered by dependency scanning
  on the Python and container manifests", and CI shows no container scan.
  This was v11 FINDING-32's secondary recommendation, not its defect.
- **Downstream pins.** Epics, stories, task plans and test specifications pin
  superseded design versions (`check-artifacts.py` warnings). This is
  bookkeeping for `$story-generation`, `$backlog-review` and `$test-design`
  once the designs are approved.

## Unattended-Run Record

This run was delegated by a parent agent, with no interactive input tool.
Nobody could be asked.

- **Prerequisite exit 2, proceeded with the deviation recorded.**
  - `check-prerequisites.sh` reported context STALE: 27 hours old, against a
    24-hour window. `docs/prerequisites.md` says to ask the owner whether to
    refresh, and to stop otherwise.
  - The refresh was not run. It is the owner's decision, and the feeder
    performs `git fetch` in `repos/`.
  - The review proceeded because no input it uses comes from the cache. Every
    artifact was read from the working tree at `7628f86`. The five scripts
    read the working tree, and `check-references.py` excludes `cache/`. No
    finding or verdict depends on cached content.
  - This is a deviation from the prerequisite rule, recorded here so the
    owner can reject it. The context can be refreshed with
    `bash scripts/context_feeder.sh --project factorflow-v2 --verbose`.
- **Interpretation recorded (proceed past `AWAITING-APPROVAL`).**
  - The state check exited 1 because no review covers the seven changed
    revisions.
  - The task directing this run asked for exactly that review.
  - An owner approval cannot pass the gate without a review that covers the
    revision.
  - v10 and v11 proceeded the same way in the same state.
- **No decision record was written.** This run's only permitted write is this
  report.
- **Severity judgements made from the artifacts.**
  - **FINDING-43 is HIGH.** It leaves a production channel failing a
    condition of the written-in exception to a Critical invariant, on the
    high-risk lane. The code already exhibits the gap, and no design or test
    would catch it. It is not CRITICAL: in the specified deployment the URL
    names `127.0.0.1` with `require_auth`, so no credential crosses in clear
    and no plaintext leaves the host unless the configuration is changed.
  - **FINDING-46 and FINDING-47 are MEDIUM, not HIGH.** The production
    deployment's configuration meets the conditions, and the gaps are in a
    one-off drill and in owner-procedure evidence. Each is closed by a
    sentence or a flag.
  - **FINDING-45 is MEDIUM.** The image is still built from a hash-verified
    locked set. The gap is lock staleness, detectable with one flag.
- **Not determined.**
  - The owner's Docker Desktop probes, and the `postgres:16` entrypoint's
    `trust` lines: no Docker daemon access in this session.
  - The libpq version bundled in the manylinux `psycopg-binary` 3.3.5 wheel:
    no package-index access.
  - A real image build and `compose up`: not run, for the same reason.
- **No question for the owner was needed to reach the verdict.** The owner
  decisions the findings call for are listed under Recommendations.
