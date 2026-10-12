---
artifact_schema_version: 1
artifact_id: CAP-001-specification-review
artifact_type: specification-review
artifact_version: 11
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-12
updated: 2026-10-12
document: spec-review-report
capability: CAP-001
version: v11
generated: 2026-10-12T15:54:35Z
constitutions_reviewed:
  - "CONST-AGT  docs/constitutions/agent-governance.constitution.md (2.3)"
  - "CONST-MDL  docs/constitutions/model-management.constitution.md (1.3)"
  - "CONST-OPS  docs/constitutions/operational-safety.constitution.md (1.3)"
  - "CONST-REV  docs/constitutions/review.constitution.md (1.4)"
  - "CONST-SA   docs/constitutions/static-analysis.constitution.md (2.0)"
  - "CONST-SEC  docs/constitutions/security.constitution.md (1.2; last commit 9480517, 2026-10-09, before v10)"
  - "CONST-VER  docs/constitutions/verification.constitution.md (1.2)"
mechanical_checks:
  - script: check-capabilities.py
    outcome: run
    result: "PASSED, exit 0: 1 capability, 3 edges, integration layer 0 is CAP-001, no blocked-by edges; no error, no warning"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0: 1 design, 12 components, 16 interfaces"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 208 warnings, exit 0 (--strict), no error. Changed subjects: system-design v7 and market-data-store v8 each warn on a tech-stack v3 pin (v5 current); runtime-config, schema-migrator and ingestion-api carry no warning. 33 warnings are CAP-001-system-design v6 pins"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0, 1055 references across 202 Markdown files. Harness Markdown only; the project repo's new references were checked by hand"
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
  SR-8: "applied — UX brief and UX design digest-identical to v10; the change serves the existing bundle and adds no UX surface"
  SR-9: "applied — dependency and STD-UI conformance halves by check-capabilities.py; CONST-SEC 1.2 assessed by hand against the new deployment"
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
    artifact_version: 7
    content_revision: sha256:2fcd26a95179c9bab54e82ba0f21d4c8b046f91b43de99a5353f27e75a282a6a
  - artifact_id: CAP-001-ux-brief
    artifact_version: 7
    content_revision: sha256:b657501bed0da0852bf88b4a0537776c84a23c916bd967fb3917a80fc314c984
  - artifact_id: CAP-001-ux-design
    artifact_version: 5
    content_revision: sha256:8bb4b6a479dab7efbbce9fd7962574f134aaa8e834fd5250053f085f764b082f
  - artifact_id: CAP-001-component-design-acquisition-runner
    artifact_version: 8
    content_revision: sha256:e0522afb927bda200926be52dcf5e32f8fc050c6dc6157eb2688293fad6218b9
  - artifact_id: CAP-001-component-design-coverage-service
    artifact_version: 6
    content_revision: sha256:e87b0e8f2464ef85bf7f319c615b338e4f75e7360f4566f142968d5e9f0cec71
  - artifact_id: CAP-001-component-design-ingestion-api
    artifact_version: 7
    content_revision: sha256:c863fd254396068793e5528cce3be9090538b75431dbcaa8081c977fd4006c19
  - artifact_id: CAP-001-component-design-instrument-list-service
    artifact_version: 6
    content_revision: sha256:05c192e26cf1c7c5343dd83bf9d1b29d0e1b91ffd1da181d5aeed4b3051635df
  - artifact_id: CAP-001-component-design-market-data-store
    artifact_version: 8
    content_revision: sha256:5e6aa57b23a91175e31ef4630f4ec7c9b46c15cf9f20d6424aab26e86378379e
  - artifact_id: CAP-001-component-design-massive-client
    artifact_version: 13
    content_revision: sha256:7b6e20a0b46b0aef37caec4e296ddf829f103bcbeb50fdd2bdc2d8b4f4ae5a51
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
    artifact_version: 12
    content_revision: sha256:851100ed4ae5ae98795dd10a9f9c16afdc972df48edfeefedf81e7cfd06fc28d
  - artifact_id: CAP-001-component-design-schema-migrator
    artifact_version: 5
    content_revision: sha256:9c83b8964cd65e838b352ea3bcecf853ab38672560566f54152abdfd78479734
statistics:
  total_findings: 31
  critical: 0
  high: 3
  medium: 7
  low: 21
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-12T15:54:35Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "7"
    - id: CAP-001-ux-brief
      version: "7"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-component-design-acquisition-runner
      version: "8"
    - id: CAP-001-component-design-coverage-service
      version: "6"
    - id: CAP-001-component-design-ingestion-api
      version: "7"
    - id: CAP-001-component-design-instrument-list-service
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "8"
    - id: CAP-001-component-design-massive-client
      version: "13"
    - id: CAP-001-component-design-observation-writer
      version: "4"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: CAP-001-component-design-rate-limit-governor
      version: "8"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-runtime-config
      version: "12"
    - id: CAP-001-component-design-schema-migrator
      version: "5"
    - id: CAP-001-release
      version: "1"
    - id: tech-stack
      version: "5 (context only; review-exempt)"
    - id: CONST-SEC
      version: "1.2 (in force; content revision sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc)"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Specification Review Report -- CAP-001

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-001 Market Data Acquisition Foundation |
| **Version** | v11 |
| **Specifications Reviewed** | Capability, system design, UX brief, UX design, 12 component designs (full set; five changed since v10) |
| **Total Findings** | 31 (0 CRITICAL, 3 HIGH, 7 MEDIUM, 21 LOW) |
| **Pipeline Readiness** | READY-WITH-WARNINGS |
| **Lane** | High risk (`deployment-topology` signal). Specification review must reach READY. **This verdict does not clear the lane** |

**What changed since v10.** Branch `usr/alvaro-de-jodra/CAP-001-design-deployment`,
commits `11e8a94` and `22fc403` on top of `d08f4c1`, answers release manifest
v1 blockers B1, B3 and B4. EXP-20261012-1 already closed B2.

- `component-design-runtime-config.md` v11 to v12 adds section 2.8, the
  deployment definition:
  - a two-stage `Dockerfile` that builds the interface bundle;
  - a `compose.yaml` that runs one image as the application and ingestion
    containers beside PostgreSQL, all on host networking, with PostgreSQL
    loopback-only;
  - upgrade and rollback;
  - a deployment smoke check.

  Sections 1, 2.2c, 3, 6, 7, 8 (criteria 12 to 14), 9, 12, 13 and 14 (items
  5, 7 and 8 closed) change with it.
- `component-design-schema-migrator.md` v4 to v5 moves the migrations into
  the package (`src/factorflow/db/migrations`, `MIGRATIONS_DIR`). Exit 4 now
  covers read failures, and three test rows are added.
- `component-design-ingestion-api.md` v6 to v7 ships the bundle inside the
  installed package and rewords the AC-14 controls.
- `component-design-market-data-store.md` v7 to v8 changes migration paths
  only.
- `system-design.md` v6 to v7 rewords the AC-14 deployment control, from "port
  published to `127.0.0.1`" to the host-network deployment, in section 1,
  constraint 5.11 and the section 7 AC-14 row.
- `docs/constitution/tech-stack.md` v5 records Node.js 22. It is review-exempt
  and used here as context only.

The other 11 subjects are digest-identical to the revisions v10 recorded.
Each was recomputed this session with `artifact-gate.py revision`.

**Packaging works.** The packaging part of the change does what it claims.
This review built a wheel from a scratch copy with the specified
`package-data`. It contains migrations `0001` to `0004`,
`factorflow/api/static/index.html` and 19 bundle assets, and nothing under
`tests/` (Supplementary Evidence). The Vite output path, the health field the
compose healthcheck reads, and the migrator's exit-4 path each match the code.

**New in this round: 2 HIGH, 3 MEDIUM, 7 LOW.**

- **FINDING-31 (HIGH).** Host networking does not keep AC-14's second control.
  The designs claim "two independent controls", but under `network_mode: host`
  the bind address alone decides exposure. The design's own probe shows it: a
  server bound to `0.0.0.0` answers 200 from the LAN address. The owner
  decision of 2026-10-12 rests on the claim that host networking "keeps both".
- **FINDING-32 (HIGH).** The release image installs Python dependencies with
  `pip install .`. That command ignores `uv.lock`, so the deployed dependency
  set is not the one the tests ran (`massive>=2` is unbounded).
- **FINDING-33 to FINDING-35 (MEDIUM):**
  - market-data-store §4 still says the database accepts connections only from
    the container network;
  - the new rollback contradicts the owner-deferred OPS-MIG-003 posture and is
    incomplete;
  - the release-evidence smoke run is not isolated from the real deployment.
- **FINDING-36 to FINDING-42 (LOW).**

FINDING-1 (HIGH) is still open for the owner. The new compose file now
specifies the plaintext database channel it concerns. The four MEDIUM
findings carried by owner choice and fourteen earlier LOW findings remain.

## Review Scope

**Full set, depth proportional to change.**

- **Changed subjects (5).** Each was read in full. The diff `d08f4c1..22fc403`
  was reviewed line by line, and every changed claim was checked against
  these sources:
  - the repository at `22fc403`: `Dockerfile`, `pyproject.toml`, `uv.lock`,
    `vite.config.ts`, `package.json`, `tsconfig.json`, `web/src/index.css`,
    `src/factorflow/api/app.py`, `api/models.py`, `api/routes/health.py`,
    `app_main.py`, `ingestion_main.py`, `config/settings.py`,
    `db/migrate_main.py`, `db/migrator.py`, and the tests and fixtures that
    reference `migrations/`;
  - `docs/releases/CAP-001-release-v1.md` and `docs/changes/EXP-20261012-1.md`;
  - CONST-SEC 1.2's Exception Record.
- **Unchanged subjects (11).** Each revision equals the one v10 recorded, so
  the v6 to v10 assessments stand by identity. They were searched for
  dependence on the changed text. Searched terms: "publish", "compose",
  "container network", "127.0.0.1", "5.11", "AC-14", and repository-root
  `migrations/` paths. The result is under Cross-Specification Consistency.
- **Not subjects.** Epics, stories, task plans, test specifications, decision
  records and the release manifest are governing or downstream inputs, not
  subjects. `tech-stack.md` v5 is review-exempt context.
- **Repository source.** Every project-repo read used
  `repos/factorflow-v2/FactorFlow-v2` on branch
  `usr/alvaro-de-jodra/CAP-001-design-deployment` at `22fc403`. The tree was
  clean. The only file written is this report. Nothing was committed, no
  branch was switched, and nothing was approved.
- **Pipeline state.** `pipeline-state.py check --stage specification-review`
  reported `AWAITING-APPROVAL`, exit 1, for the five changed subjects. The
  reason was "review_subjects does not cover" each new revision. No existing
  review covers those revisions, so an owner approval cannot pass the gate
  until a review does. This review supplies that evidence and approves
  nothing. v10 met the same state for refined designs and handled it the same
  way. The interpretation is recorded under Unattended-Run Record.
- **Independence.** This review ran in a fresh subagent session that did not
  author any of the artifacts. Under REV-RCV-001 and VER-DEL-001, every claim
  was checked against code, configuration, or an offline tool run, not
  accepted as written. One exception: the owner's Docker Desktop probes in
  runtime-config §2.8.1 could not be reproduced, because the Docker daemon is
  outside this session's sandbox. They are taken as owner-supplied evidence,
  and §2.8.5 check 4 is their deployed-form verification.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All 14 template sections are present in each changed design. §2.8.1's diagram has a five-sentence overview. New: FINDING-34, FINDING-39 (c), FINDING-40 (c), FINDING-41. Carried: FINDING-9 |
| SR-2 Correctness | applied | Every new code, configuration and tool claim was checked (Supplementary Evidence). New: FINDING-31, FINDING-32, FINDING-35, FINDING-36, FINDING-40. Carried: FINDING-7, FINDING-12, FINDING-20, FINDING-26, FINDING-29 |
| SR-3 Consistency | applied | New: FINDING-33, FINDING-34, FINDING-37, FINDING-42. Carried: FINDING-1, FINDING-8, FINDING-15, FINDING-18 |
| SR-4 Testability | applied | §8 criteria 12 to 14 have observable outcomes. New: FINDING-38, FINDING-39. Carried: FINDING-11, FINDING-12, FINDING-16, FINDING-27 |
| SR-5 Traceability | applied | 26/26 capability ACs are still mapped. New AC-15 rows trace to §2.8.2 and §2.8.3. New: FINDING-37. Carried: FINDING-6, FINDING-28, FINDING-30 |
| SR-6 Clarity | applied | The new text names files, keys and commands exactly. No vague modifiers were found. New: FINDING-38 (b). Carried: FINDING-13, FINDING-14, FINDING-17 |
| SR-7 Feasibility | applied | The packaging and Vite layout were verified by an offline wheel build and the config. The compose file was validated by Compose v2.39.1 `config`. New: FINDING-32, FINDING-35, FINDING-36 |
| SR-8 UX Completeness | applied | UX artifacts are unchanged. The change makes the existing bundle reachable and adds no screen, state or copy. Carried: FINDING-8 |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` passed with no error or warning; the capability is unchanged. CONST-SEC 1.2: FINDING-1 is extended; SEC-SEC-001 passes for compose; SEC-DAT-001 gap in FINDING-40 (c) |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passed (12 components, 16 interfaces). The system design names no capability as an actor. New: FINDING-42 (the §4.1 responsibility omits the deployment definition) |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, exit 0, "PASSED" (integration layer 0: CAP-001, no blocked-by edges) | none |
| `build-architecture.py -p factorflow-v2` | run, exit 0, "1 design(s), 12 component(s), 16 interface(s) PASSED" | none |
| `check-artifacts.py -p factorflow-v2 --strict` | run, exit 0, "PASSED with 208 warning(s)", no error | FINDING-18 (system-design v7 and market-data-store v8 pin tech-stack v3). 33 warnings are `CAP-001-system-design` v6 pins: 10 unchanged designs and UX artifacts, plus backlog, epics, stories and test specifications. The changed designs' bumps add downstream pin drift (Observations) |
| `check-references.py` (harness root) | run, exit 0, "1055 path references across 202 Markdown files ... PASSED" | none. It scans harness Markdown only. The project-repo references the change adds were checked by hand: the existing files exist, and the declared-new ones (`compose.yaml`, `.dockerignore`, `scripts/deploy-smoke.sh`, `tests/unit/test_distribution_contents.py`, `tests/unit/test_compose_definition.py`, `src/factorflow/db/migrations/`) are introduced by the design |
| `check-constitutions.py` (harness root) | run, exit 0, "10 constitutions, 36 skills PASSED" | none |

Prerequisites: `check-prerequisites.sh --project factorflow-v2` exited 0, with
every row PASSED and context 22 hours old. The harness worktree was at
`673c71a`. No constitution has changed since v10. The decision records added
since v10 are DEC-0047 to DEC-0049. None concerns deployment, networking or
SEC-ENC-001.

### Supplementary evidence (fresh, this session)

| Claim in the change | Evidence | Result |
|---|---|---|
| Stage 1's bundle lands in `/build/src/factorflow/api/static` | `vite.config.ts`: `root: "web"`, `build.outDir: "../src/factorflow/api/static"`, `emptyOutDir: false`. `package.json` `build` is `vite build` | Holds |
| Stage 1 needs `design-system/` | `web/src/index.css` line 4: `@import "../../design-system/theme.css"` | Holds; the stage copies it |
| The `package-data` line installs the migrations and the bundle | A scratch copy of `src/` and `pyproject.toml` with `factorflow = ["coverage/sql/*.sql", "db/migrations/*.sql", "api/static/**/*"]` and the four SQL files under `src/factorflow/db/migrations/`. Built with `setuptools.build_meta.build_wheel` (setuptools 84.0.0, read-only from the local uv cache). The wheel contains `factorflow/db/migrations/0001_*` to `0004_*`, `factorflow/api/static/index.html` and 19 `assets/` files, and nothing under `tests/` | Holds (B1, B3) |
| The API serves the bundle from the installed package | `src/factorflow/api/app.py` line 39 `_STATIC_DIR = Path(__file__).parent / "static"`. Line 266 mounts it only if it exists, which is why the v1 image answered 404 | Holds (ingestion-api §2.5) |
| The image resolved migrations outside the package | `src/factorflow/db/migrate_main.py` line 35 `Path(__file__).resolve().parents[3] / "migrations"` | Holds (B1). The design renames it to the public `MIGRATIONS_DIR` |
| Read failures exit 4 before any connection | `migrate_main.py` `run_migrations`: `discover(migrations_dir)` runs first and returns `4, message` on `MigrationError`, before `psycopg.connect`. `migrator.py` lines 40-49 raise `migrations directory not found: {directory}` | Holds (schema-migrator §2.5, §2.3 docstring) |
| "16 test modules ... compute `parents[N] / "migrations"`" | grep of `tests/unit` and `tests/integration` for `/ "migrations"`: exactly 16 modules, plus `tests/conftest.py` | Holds |
| `test_no_committed_secrets.py` scans `migrations/` | Line 30 `_SCANNED_PREFIXES = ("src/", "tests/", "migrations/")` | Holds |
| Other references move too | `api/models.py` line 173, `runs/queries.py` lines 43 and 302, `tests/e2e/fixtures/coverage-seed.sql` line 3, `tests/fixtures/migrations_ok/0002_test_only.sql` line 2. Not enumerated: `tests/e2e/support/acquisition.ts` line 22, `web/src/api/types.ts` lines 143 and 270 | Partly (FINDING-41) |
| The compose healthcheck's condition matches health | `api/models.py` lines 42-45: `status: Literal["ok"]`, `database: Literal["reachable", "unreachable"]`, `schema_version: int \| None`. `routes/health.py` lines 105-111 | Holds |
| "The owner sets three variables" | `api/app.py` lines 171 and 181 load `DatabaseSettings` and `RunSettings`, and `app_main.py` loads `ApiSettings`, never `MassiveSettings`. `ingestion_main` loads `Settings` (`config/settings.py` lines 79-190): required values are `database.url`, `massive.api_key` and `massive.requests_per_minute`, and every other value has a default | Holds |
| The bind is confined to loopback | `config/settings.py` line 23 `_LOOPBACK_HOSTS = {"127.0.0.1", "localhost", "::1"}`, lines 93-107 `_reject_non_loopback_host` | Holds (control 1) |
| Ingestion is a long-running loop | `ingestion_main.py` docstring lines 1-9 and `run_polling_loop` at line 130. It returns non-zero only on configuration failure | Holds |
| `compose.yaml` is valid and refuses missing secrets | The design's YAML, extracted verbatim, run through Compose v2.39.1 offline (`DOCKER_HOST` set to an unreachable address). With the three variables set, `config` renders it, and no `ports:` key appears. With them unset, both `config` **and `ps`** stop: "required variable FACTORFLOW_POSTGRES_PASSWORD is missing a value". With the password `p@ss/w:rd`, `config` renders `postgresql://factorflow:p@ss/w:rd@127.0.0.1:5432/factorflow` | Holds. Evidence for FINDING-38 (a) and FINDING-40 (a) |
| The existing Dockerfile parser handles the new file | `test_release_excludes_test_paths.py` `_copy_sources` calls `shlex.split(line, comments=True)` per line. On `COPY ... tsconfig.json \` that raises `ValueError: No escaped character` (run this session) | Does not hold (FINDING-39 (a)) |
| "PyYAML is not a project dependency" | `uv.lock` has no `pyyaml` package | Holds |
| The image installs the locked dependency set | `pyproject.toml` lines 11-17 are open ranges (`massive>=2` and others). `uv.lock` lines 561-562 pin `massive` 2.8.0. The tech stack, OQ-TS-5, says "`uv.lock` and `package-lock.json` are" the authoritative versions. §2.8.2 copies `uv.lock` but installs with `pip install .`, which does not read it | Does not hold (FINDING-32) |
| A host-network deployment confines a `0.0.0.0` bind | runtime-config §2.8.1 probe table, line 771: "HTTP server bound `0.0.0.0` (control) | 200 | 200" (LAN 200) | Does not hold. The deployment adds no restriction (FINDING-31) |
| E2E ports do not collide with 8000 and 5432 | `scripts/run-e2e-server.sh` lines 43-47 use 55433 and 8123 to 8126 | Holds |

## Constitutions Applied

All seven constitutions the relevance matrix assigns `specification-review`
were read. None has changed since v10.

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | **AGT-PROV-001:** the five changed designs refreshed `model` (`claude-opus-5-5`), `tool_version` (2.1.290) and `timestamp` (2026-10-12T15:10:00Z), and kept `correlation_id`. The system design and market-data-store still pin tech-stack v3 (FINDING-18). **AGT-SPEC-002:** host networking removes a network-layer restriction, and the designs present that as no reduction (FINDING-31). **AGT-AUTH-003:** runtime-config §2.8.4 sets a rollback posture different from market-data-store's owner-deferred one without flagging it (FINDING-34). **AGT-EVIDENCE-002:** the compose healthcheck timings cite no source (FINDING-36). **AGT-AUTH-001:** this review approves nothing |
| CONST-MDL 1.3 | **MDL-PIN-002:** the exact identifier `claude-opus-5-5` is recorded in the designs and in this report |
| CONST-OPS 1.3 | **OPS-MIG-001:** the move changes no migration's content, so no recorded checksum changes. PASS. **OPS-MIG-003:** FINDING-34. **OPS-VER-001** and **OPS-DEST-001:** FINDING-35. **OPS-DEST-002:** the design names `docker compose down -v` as the only command that removes data. **OPS-ERR-001:** the smoke check exits non-zero on its first failed check. No destructive operation was run in this review |
| CONST-REV 1.4 | **REV-STG-001:** Stage 1 and Stage 2 are reported separately below. **REV-AGT-001:** full bar. **REV-RCV-001:** claims were checked against code and tools. The reviewer is independent of the author |
| CONST-SA 2.0 | **SA-MD-001:** template conformance passes; one table is split by a blank line (FINDING-39 (c)). **SA-MD-002:** the new paths resolve or are declared new; stale internal pointers are in FINDING-37. **SA-MD-003:** no placeholder language was introduced |
| CONST-SEC 1.2 | **SEC-SEC-001:** every compose secret is a `:?` interpolation. PASS. **SEC-NDG-001** and DEC-0034: the image copies no `tests/` path, and `.dockerignore` excludes it. PASS. **SEC-ENC-001:** the compose file now states the production database channel as `postgresql://...@127.0.0.1:5432` with no TLS, which is the Exception Record's open question (ii) (FINDING-1). **SEC-AUTH-001:** its non-engagement rests on AC-14, whose control count is misstated (FINDING-31). **SEC-DAT-001:** the new password variable is unclassified (FINDING-40 (c)). **SEC-DEP-001:** the image adds three base images, and no scan is defined (FINDING-32) |
| CONST-VER 1.2 | **VER-EVD-001:** every verdict rests on reads and commands run this session. **VER-EVD-004:** Stage 1 gives one verdict per changed rule. **VER-DEL-001:** the owner's probes could not be re-run and are marked as such. **VER-CHK-001:** no test suite was run, because the change is design-only; packaging and compose claims were exercised offline instead |

## Status of v10 Findings

IDs continue v10's numbering. No v10 finding is resolved.

| v10 ID | Severity | Status in v11 | Evidence |
|---|---|---|---|
| v10 FINDING-1 | HIGH | **Owner-open, extended** | CONST-SEC 1.2 is unchanged, and runtime-config §14 item 6 is still open. runtime-config §2.8.3 (line 836) now specifies the production database channel as plaintext `postgresql://factorflow:...@127.0.0.1:5432/factorflow`. PostgreSQL starts without `ssl`. The browser hop stays plain `http` on loopback (ingestion-api §4 lines 337-338) |
| v10 FINDING-6 to FINDING-9 | MEDIUM | **Carried by owner choice** | Subjects digest-unchanged |
| v10 FINDING-11, FINDING-12, FINDING-20 | LOW | **Remaining** | runtime-config changed, but none of the cited text did |
| v10 FINDING-13, FINDING-17, FINDING-26 to FINDING-29 | LOW | **Remaining** | massive-client digest-unchanged |
| v10 FINDING-14 | LOW | **Remaining** | runtime-config §3 line 973 still says "Section 2.4a specifies the mechanism". The §12 Decision row (line 1202) still stops at DEC-0037 |
| v10 FINDING-15 | LOW | **Remaining** | System design v7 is the revision v10 named for the fix. §4.1 line 300 still says "Hand-written HTTP client" |
| v10 FINDING-16 | LOW | **Remaining** | Governor digest-unchanged |
| v10 FINDING-18 | LOW | **Remaining, extended** | See the summary table |
| v10 FINDING-30 | LOW | **Remaining** | System design v7 does not record the definition of fundamentals |

## Stage 1 -- Specification Compliance of the Change

One verdict per changed rule (VER-EVD-004). PASS means four things hold: the
rule agrees with the owner decisions and the governing sources, it agrees with
the code and the tools, it has a test row or check where it is behaviour, and
it contradicts no other subject. Line numbers refer to `22fc403`. RC is
runtime-config, SM schema-migrator, IA ingestion-api, MDS market-data-store
and SD the system design.

| # | Rule | Location | Governing source | Test or check | Verdict |
|---|------|----------|------------------|---------------|---------|
| 1 | runtime-config owns the Dockerfile, compose and `.dockerignore` | RC §1 | Owner decision 2026-10-12 | n/a | PASS (system design §4.1 not updated: FINDING-42) |
| 2 | The ingestion container runs the same image, with `python -m factorflow.ingestion_main` | RC §2.2c DEC-0034 bullet; §14 item 5 | Owner decision 2026-10-12; DEC-0034 | RC §7 compose row | PASS |
| 3 | All three containers run on host networking, nothing is published, PostgreSQL listens on loopback only, and both services are unreachable from the LAN | RC §2.8.1 | AC-14; owner decision 2026-10-12 | RC §7 compose row; smoke check 4; `test_api_binding.py` | PASS for the exposure outcome. **FAIL** for "two independent controls" (FINDING-31) |
| 4 | Host networking is a deployment precondition (Linux, or Docker Desktop with it enabled) | RC §2.8.1, §3 | Owner probes 2026-10-12 | Smoke checks 2 and 4 | PASS (probes not reproduced here) |
| 5 | A two-stage image builds the bundle, carries no Node.js, and installs the distribution | RC §2.8.2 | B3; DEC-0034; tech stack v5 | RC §7 Dockerfile and distribution rows | PASS for the bundle and packaging (verified). **FAIL** for the dependency install (FINDING-32) |
| 6 | `package-data` gains `db/migrations/*.sql` and `api/static/**/*` | RC §2.8.2; SM §2.1; IA §2.5 | B1, B3 | `test_distribution_contents.py` | PASS (scratch wheel build). Test-row gap: FINDING-39 (b) |
| 7 | `.dockerignore` excludes non-release paths and the local bundle | RC §2.8.2 | DEC-0034; B3 | RC §7 Dockerfile row | PASS |
| 8 | Compose definition: `:?` secrets, one image and tag, start order by health, named volume | RC §2.8.3 | AC-13, AC-15, AC-16; SEC-SEC-001 | RC §7 compose row; smoke check 1 | PASS (Compose `config` verified). "Leaves the application container exited": FINDING-36. URL composition: FINDING-40 |
| 9 | Upgrade and rollback | RC §2.8.4; §6 | OPS-MIG-003; MDS §6 and §14 item 1 | none | **FAIL** (FINDING-34) |
| 10 | The deployment smoke check | RC §2.8.5; §9 | AC-14, AC-15, AC-18; B1, B3, B4 | itself | PASS with gaps (FINDING-38) |
| 11 | §3 constraints: loopback bind, host-network precondition, compose-supplied environment | RC §3 | AC-13, AC-14; SD 5.11 | as above | PASS (stale pointer: FINDING-37) |
| 12 | §7 adds four rows | RC §7 lines 1094-1097 | B1, B3, B4; DEC-0034 | itself | PASS with gaps (FINDING-35, FINDING-39) |
| 13 | §8 criteria 12 to 14 | RC §8 | AC-14, AC-16; B1, B3, B4 | smoke check; compose row | PASS (criterion 14 wording: FINDING-36) |
| 14 | §13: the AC-14 and AC-15 rows | RC §13 | SD v7 §7 | n/a | AC-15 PASS. AC-14's system-design column is stale (FINDING-37) |
| 15 | §14 items 7 and 8 are closed | RC §14 | Tech stack v5; SD v7 | n/a | PASS (item 7's trailing "should record it": FINDING-37) |
| 16 | Migrations are package data, resolved by `MIGRATIONS_DIR` next to `migrate_main` | SM §1, §2.1, §3 | B1; owner decision 2026-10-12 | SM §7 three rows | PASS (verified). Reference enumeration: FINDING-41 |
| 17 | `discover` raises on a missing directory, a malformed name, a repeated version, or `BEGIN` or `COMMIT` | SM §2.3 | EXP-20261012-1 | SM §7 | PASS (`migrator.py` 40-49) |
| 18 | Exit 4 covers read failures, before any connection | SM §2.5 | AC-16; EXP-20261012-1 | `test_migrate_main_exit_codes.py` | PASS (`migrate_main.py` `run_migrations`) |
| 19 | The bundle is served from the installed package | IA §2.5, §3 | B3 | IA §7 two rows | PASS (`app.py` line 39) |
| 20 | "Two independent controls" for AC-14 | IA §4 line 311 | AC-14; SD 5.11 | `test_api_binding.py`; smoke check 4 | **FAIL** (FINDING-31) |
| 21 | The IA §13 AC-14 row | IA §13 line 522 | SD v7 §7 | n/a | **FAIL** LOW (FINDING-37) |
| 22 | Migration paths move; content and checksums are unchanged | MDS §2.2 tree and note; §2.5 test path | B1; OPS-MIG-001 | `test_sql_is_append_only.py` | PASS |
| 23 | MDS §4's database exposure statement, unchanged by this revision | MDS §4 lines 556-557 | RC §2.8.1 | n/a | **FAIL** (FINDING-33) |
| 24 | AC-14 deployment wording | SD §1 lines 65-72; 5.11 lines 404-408; §7 line 516 | AC-14; owner decisions 2026-09-03 and 2026-10-12 | n/a | PASS. These sentences are accurate. The §7 row's two elements are read as two controls by IA and RC (FINDING-31) |
| 25 | Version bump; status and approval block kept; provenance refreshed | All five frontmatters | `docs/artifact-contract.md` Versioning Rules | `check-artifacts.py --strict` | PASS (approval stale until re-approved; Observations) |

## Stage 2 -- Artifact Quality of the Change

- **Contract.** All five changed designs pass `check-artifacts.py --strict`
  with no error. Two carry the tech-stack v3 pin warning (FINDING-18). The
  correlation ID is unchanged.
- **Structure.** All 14 template sections are present. The one new diagram
  (RC §2.8.1) has a five-sentence overview. RC §7's table is split by a blank
  line at line 1093 (FINDING-39 (c)).
- **Cross-references.** The sections each new sentence cites exist. Three
  pointers went stale once the system design was revised (FINDING-37).
- **Quantitative values.** Ports 8000 and 5432 and the Node 22 version are
  sourced. The healthcheck interval, timeout and retry counts are not
  (FINDING-36).
- **Placeholders.** None introduced.
- **Clarity.** Commands, keys and paths are exact. Prose uses commas rather
  than em dashes in the new text.

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification. It is assessed against the
system design.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` passed with no error and no warning. Dependency
typing, placement across 5.1 to 5.3 and the STD-UI specialization are
unchanged from v10. No `blocked-by` edge exists.

#### Completeness (SR-1)

Unchanged. FINDING-9 is carried.

#### Correctness (SR-2)

No contradictory acceptance criteria. AC-14 ("MUST NOT be reachable from a
non-loopback network interface") is met by the specified deployment. The
finding concerns how many controls the designs claim, not whether the
criterion holds (FINDING-31).

#### Testability (SR-4)

All 26 criteria have an observable outcome, a concrete input and a measurable
boundary (unchanged).

#### Clarity (SR-6)

FINDING-30 is carried.

### System Design Specification

v7 is accurate in §1 and 5.11. Two findings:

- §4.1 does not assign the deployment definition to any component
  (FINDING-42).
- §4.1's `massive-client` row is still wrong (FINDING-15).

Its §7 AC-14 row lists the deployment and the bind as two elements, and
ingestion-api and runtime-config read that as two independent controls
(FINDING-31). Its frontmatter and §9 still pin tech-stack v3 (FINDING-18).

### Component Design Specifications

#### runtime-config v12 (changed)

- **Correctness (SR-2).** FINDING-31: the AC-14 control count. FINDING-32:
  unlocked dependency install. FINDING-36: restart behaviour and unsourced
  healthcheck timings. FINDING-40: the composed URL and the new variables.
  Carried: FINDING-12, FINDING-20.
- **Consistency (SR-3).** FINDING-34: rollback posture against
  market-data-store. FINDING-37: stale AC-14 text.
- **Testability (SR-4).** FINDING-38: smoke check gaps. FINDING-39: test-row
  feasibility. Carried: FINDING-11.
- **Feasibility (SR-7).** FINDING-35: the evidence run is not isolated.
  Verified to hold:
  - the packaging works;
  - the Vite layout works;
  - the compose file parses;
  - its `:?` guards stop every subcommand.
- **Clarity (SR-6).** Carried: FINDING-14.

#### schema-migrator v5 (changed)

Correct against the code (Stage 1 rows 16 to 18). FINDING-41 covers the
reference enumeration.

#### ingestion-api v7 (changed)

§2.5, §3 and §7 are correct. §4 restates the two-control claim (FINDING-31),
and §13's AC-14 row was not updated (FINDING-37). §12 still labels the system
design v3, the UX design v4 and the capability v6 (FINDING-18).

#### market-data-store v8 (changed)

The path changes are correct, and the note that content and checksums are
unchanged holds. §4's database-exposure sentence was not revised (FINDING-33).
§6 and §14 item 1 now disagree with runtime-config §2.8.4 (FINDING-34).
FINDING-1 remains on its §4.

#### acquisition-runner, coverage-service, instrument-list-service, massive-client, observation-writer, owner-web-app, rate-limit-governor, run-journal (unchanged)

None depends on the changed text:

- None restates "port published to `127.0.0.1`".
- Each cites constraint 5.11 only for "loopback, no authentication", which v7
  keeps.
- None names the repository-root `migrations/` path. They cite migration files
  by name.

Their stale `CAP-001-system-design` v6 pin is bookkeeping (FINDING-18), not a
content inconsistency. The carried findings stand as v10 recorded them.

#### Feasibility (SR-7), all components

No circular dependency. The change adds no component and no interface. It
adds one ordering dependency, ingestion after a healthy application, which
compose enforces at `up` and which a reboot does not need, because the store
is already at the image's version.

### UX Brief

Unchanged (v7). No user-facing surface changed.

### UX Design Specification

Unchanged (v5). FINDING-8 is carried.

### Cross-Specification Consistency (SR-3)

- CROSS-SPEC-INCONSISTENCY (FINDING-33): market-data-store §4 says "container
  network, no database port to the host". runtime-config §2.8.1 and system
  design §1 say PostgreSQL is on the host's loopback.
- CROSS-SPEC-INCONSISTENCY (FINDING-34): the OPS-MIG-003 posture differs.
  market-data-store §6 and §14 item 1 take branch (b), with the data directory
  restore deferred. runtime-config §2.8.4 gives a `pg_dump` restore.
- CROSS-SPEC-INCONSISTENCY (FINDING-37): two AC-14 traceability rows still say
  "port published":
  - ingestion-api §13;
  - runtime-config §13, system-design column.

  System design v7 §7 says "host-network deployment".
- CROSS-SPEC-INCONSISTENCY, owner-open (FINDING-1): host-local plaintext
  channels.
- CROSS-SPEC-INCONSISTENCY (FINDING-15, FINDING-18): carried.
- **Consistent:**
  - the `package-data` line across runtime-config, schema-migrator and
    ingestion-api;
  - `MIGRATIONS_DIR` across schema-migrator and market-data-store;
  - the image's default command across runtime-config and schema-migrator §2.1;
  - "same image for ingestion" across runtime-config §2.2c and §2.8.3;
  - the health payload across compose and the ingestion-api contract.

---

## Findings Summary Table

CRITICAL 0 · HIGH 3 · MEDIUM 7 · LOW 21 · **total 31**. By origin:

- 1 owner-open (since v6);
- 4 carried by owner choice (since v5);
- 14 remaining LOW (v5 to v10);
- 12 new in this round: 2 HIGH, 3 MEDIUM, 7 LOW.

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-9 / SR-3 | ingestion-api; market-data-store; runtime-config | ingestion-api §4 lines 337-338; market-data-store §4; runtime-config §2.2c, §2.8.3 line 836, §14 item 6 (line 1299) | **Owner-open, carried from v6, extended.** Production host-local channels carrying Internal data run without TLS and have no SEC-ENC-001 standing. CONST-SEC 1.2's Exception Record leaves (i) the loopback owner-interface hop and (ii) the database channels open. The new compose file now states channel (ii) concretely: `postgresql://...@127.0.0.1:5432/factorflow`, with no `sslmode`, and PostgreSQL without `ssl` | Release-readiness security evidence cannot be completed until the owner rules. The deployment this round defines is the release vehicle | The constitution owner decides for each channel: TLS, a waiver, or a further amendment (`$constitution`, standard). Then align runtime-config §2.8.3, ingestion-api §4 and market-data-store §4, and re-review |
| FINDING-31 | HIGH | SR-2 / SR-3 | runtime-config; ingestion-api; system design | RC §2.8.1 lines 748-762 ("which keeps both"; "The two independent controls for AC-14 are therefore"), probe table line 771; IA §4 line 311; SD §7 AC-14 row line 516 | **New.** Under `network_mode: host`, Docker publishes nothing, and the process's bind address alone decides exposure. The "deployment" control adds no restriction. The design's own probe row shows a `0.0.0.0` bind on host networking answering 200 from the LAN address. Control 2's stated effect ("A container that binds loopback cannot be reached from another host") restates control 1. AC-14 therefore rests on one preventive control, the bind: the `ApiSettings` validator plus compose not setting `FACTORFLOW_API_HOST`. Detective checks back it: `test_api_binding.py`, `test_compose_definition.py`, and smoke check 4 when run. The old "publish to `127.0.0.1`" layer is gone, though RC §2.8.1 says host networking "keeps both", and the owner decision of 2026-10-12 is recorded on that basis | The no-authentication posture, "sound solely because of that binding" (SD 5.11; capability §5.3), loses the defence in depth the designs claim. Release security evidence, stories and tests would record a second control that does not exist. Any listener a later capability adds to either container is LAN-reachable unless it binds loopback itself. Under AGT-SPEC-002 a reduced security control is for the owner to assess, and it was presented as no reduction | Correct RC §2.8.1, IA §4 and IA §13 to state one preventive control plus the detective checks. Put the trade-off to the owner explicitly. Either accept the single layer and record that decision, or add an independent layer, for example a host firewall rule denying non-loopback inbound 8000 and 5432, stated as a host precondition and verified by smoke check 4. Record "every listener binds loopback" where later capabilities inherit it (tech stack, or a decision record via `$constitution`) |
| FINDING-32 | HIGH | SR-7 / SR-2 | runtime-config | RC §2.8.2 lines 796-801 (`COPY pyproject.toml uv.lock ./` ... `RUN pip install --no-cache-dir .`); lines 785, 796, 840 (`node:22-slim`, `python:3.12-slim`, `postgres:16`) | **New.** pip does not read `uv.lock`. `pip install .` resolves `pyproject.toml`'s open ranges (lines 11-17: `massive>=2`, `fastapi>=0.115`, `uvicorn>=0.30`, `psycopg[binary]>=3`, `psycopg-pool>=3`, `pydantic-settings>=2`) against the index at build time. `uv.lock` pins `massive` 2.8.0 (lines 561-562), the version massive-client's claims and probes were verified against (massive-client lines 207, 474 and 974). Tech stack OQ-TS-5 makes `uv.lock` authoritative. The copied `uv.lock` goes unused. Stage 1 uses `npm ci`, so only the Python half is unpinned. Base images are floating tags, and no dependency scan of the image is defined (SEC-DEP-001) | The release image's Python dependency set is not the one the 932-test run exercised, and `massive` has no upper bound. This is the B1 to B3 class of defect: the deployed artifact differs from what the tests ran. Neither the §7 rows nor the smoke check exercise a provider read, so drift would surface at the owner's first live run | Install the locked set in stage 2. For example: `uv export --frozen --no-dev` to a requirements file installed with `pip install --require-hashes -r`, then `pip install --no-deps .`; or `uv sync --frozen --no-dev`. Add a §7 assertion that the Dockerfile installs from `uv.lock`. Consider digest-pinned base images, and state the image's SEC-DEP-001 scan |
| FINDING-33 | MEDIUM | SR-3 | market-data-store | MDS §4 lines 556-557 | **New.** CROSS-SPEC-INCONSISTENCY. "The database accepts connections only from the container network; the application publishes no database port to the host." Under RC §2.8.1 and §2.8.3, PostgreSQL runs in the host network namespace and listens on the host's `127.0.0.1:5432`, and the owner's probe found it "open" from macOS loopback. MDS v8 was revised this round, but this sentence was not, and RC §14 item 8's "Affected" list omits it | The store's security section understates its exposure. Any local process on the deployment machine can reach PostgreSQL with the password. The SEC-AUTH-001 reasoning there rests on a premise that no longer holds, although its conclusion (no external reachability) still does | Restate: PostgreSQL listens only on the host's loopback (RC §2.8.1). Local processes can reach it with the database password; other hosts cannot. Keep the SEC-AUTH-001 reasoning on that basis |
| FINDING-34 | MEDIUM | SR-3 / SR-1 | runtime-config; market-data-store; schema-migrator | RC §2.8.4 lines 914-924 and §6; MDS §6 lines 617-626 and §14 item 1; SM §6 lines 319-321 | **New.** market-data-store records OPS-MIG-003 under branch (b). Rollback after a migration is not currently possible, because the owner deferred the backup procedure to a future operations capability (2026-09-05). Its posture is "restore the PostgreSQL data directory". RC §2.8.4 now gives a different posture, a restore from `pg_dump`, without flagging the disagreement (AGT-AUTH-003). The new procedure is also incomplete: (a) the Upgrade bullet has no backup step, though rollback depends on "a `pg_dump` taken before the upgrade"; (b) no restore sequence is given, such as stopping ingestion, emptying the database, restoring, and starting the older tag; (c) "set the previous tag" presumes the previous image is kept under a distinct tag, while the default `local` is overwritten by each local build | Two OPS-MIG-003 postures exist. An owner following §2.8.4 literally has no dump to restore and may have no previous image. Release evidence (B5) cannot cite a tested procedure. 0.1.0 has nothing to roll back to, so the exposure starts at the second deployment, the point by which market-data-store says the procedure must exist | Either keep branch (b) and say so in RC §2.8.4, citing MDS §14 item 1, or have the owner decide on a full procedure and record that decision. A full procedure has a dump step in the upgrade, restore steps, and a tag-retention rule. Then align MDS §6 and §14 and SM §6 |
| FINDING-35 | MEDIUM | SR-7 / SR-2 | runtime-config | RC §7 row "The image deploys and serves" (line 1097); §2.8.3 (`name: factorflow`, volume `factorflow-pgdata`); §2.8.5; §9 | **New.** The release-evidence run is `docker compose up -d` "with a throwaway password and a generated test key", "Run on the deployment machine". `compose.yaml` fixes the project name and the named volume. `POSTGRES_PASSWORD` acts only when the volume is first initialised, and host networking fixes ports 8000 and 5432. On a machine with a running deployment, `up -d` with other values recreates the live app and ingestion containers. The app gets a password the role lacks and loops on exit 1, and ingestion gets the test key. On a fresh machine, the run initialises the production volume with the throwaway password, so the owner's real `up` fails to authenticate until the volume is removed (`down -v`, OPS-DEST-001). §2.8.5 and §9 instead run the smoke check against the real deployment after every `up` | Verification can take down or mis-seed the deployment it verifies (OPS-VER-001). It is also unclear which deployment the release evidence describes | State which run is release evidence. Either (i) the smoke check against the real deployment with the owner's own values, or (ii) a prior run under its own project name (`-p`), removed afterwards with explicit confirmation, before the real deployment exists. With host networking and fixed ports, a second project cannot run beside a live one |
| FINDING-6 | MEDIUM | SR-5 | Rate-limit governor | §8 AC-1 amendment note | Carried from v5, unchanged by owner choice. `docs/decision-records.md` does not exist in this repository | Readers cannot resolve the normative decision from the project repository | Correct the citation or mirror DEC-0002 |
| FINDING-7 | MEDIUM | SR-2 | Rate-limit governor | §2.5 final paragraph | Carried from v5, unchanged by owner choice. It says all jitter is full jitter, but the boundary wait adds jitter on top | Misdescribes the implemented boundary wait | Specify additive boundary jitter |
| FINDING-8 | MEDIUM | SR-3 | UX design | §6 Source Mapping | Carried from v5, unchanged by owner choice. Stale source versions | Verification points to superseded inputs | Update the three source versions |
| FINDING-9 | MEDIUM | SR-1 | Capability | §8 Readiness Assessment | Carried from v5, unchanged by owner choice. It states 23 ACs and three open questions | The readiness summary misstates coverage | Update the counts |
| FINDING-36 | LOW | SR-2 / SR-7 | runtime-config | RC §2.8.3 lines 854, 871 and 884 (`restart: unless-stopped`), lines 893-896, healthcheck blocks; §8 criterion 14 lines 1145-1147 | **New.** Two problems. (a) "A refused migration (exits 1 to 4) leaves the application container exited." Under `unless-stopped`, Docker restarts a container whenever it exits, whatever the code, so a refused migration becomes a restart loop (`Restarting (2)`) that re-runs the migrator each time. AC-16 still holds: nothing serves or writes, and ingestion never starts at `up`. The policy is also what brings exit 1 back after a reboot. (b) The healthcheck `interval`, `timeout` and `retries` values (5 s, 3 s or 5 s, 30) cite no source (AGT-EVIDENCE-002) | A test or owner checking for an exited container finds a restarting one. Exit-4 migrations are retried on every restart | Describe the restart loop in §2.8.3 and criterion 14, or choose a different policy on the owner's decision. Source or mark the healthcheck values |
| FINDING-37 | LOW | SR-5 / SR-3 | ingestion-api; runtime-config | IA §13 line 522; RC §13 line 1213; RC §3 lines 955-958; RC §14 item 7 line 1315 | **New.** Text stale after system design v7: (a) IA §13's AC-14 row still reads "Port published to `127.0.0.1`" and "Bind address and published port, both asserted by test"; there is no published port; (b) RC §13's AC-14 system-design column still reads "Port published to `127.0.0.1`"; (c) RC §3 says "The recommendation to update that sentence is in section 14 item 8", which is now applied; (d) RC §14 item 7 ends "the tech stack should record it", which it now does | AC-14 traceability names a control and a test that do not exist | Copy SD v7's AC-14 element into both §13 rows, describe the controls as FINDING-31 resolves them, and drop the two stale sentences |
| FINDING-38 | LOW | SR-4 / SR-6 | runtime-config | RC §2.8.5 lines 926-944; §2.8.4 line 923 | **New.** Four gaps in the smoke check. (a) `docker compose ps` (check 1) and `docker compose exec` (rollback) interpolate the whole file. They stop unless all three `:?` variables, `FACTORFLOW_MASSIVE_API_KEY` included, are set in the caller's environment (verified with Compose v2.39.1). The precondition is unstated. (b) Check 2's "the highest version the image carries" has no stated source. (c) Check 4 covers IPv4 addresses only, while AC-14 covers any non-loopback interface. (d) Host ports 8000 and 5432 must be free; unstated | The script fails in a shell without the secrets, or its author improvises the version source. An IPv6 exposure would pass check 4 | State the environment precondition, or use `docker ps --filter label=com.docker.compose.project=factorflow`. Name the version source, for example `discover(MIGRATIONS_DIR)` run in the app container. Add global IPv6 addresses, and state the ports precondition |
| FINDING-39 | LOW | SR-4 / SR-1 | runtime-config; ingestion-api | RC §7 lines 1093-1097 and 1101; IA §7 | **New.** Three problems with the §7 rows. (a) The Dockerfile row extends `test_release_excludes_test_paths.py`, whose `_copy_sources` runs `shlex.split` per line. §2.8.2's `COPY ... tsconfig.json \` continuation raises `ValueError: No escaped character` (verified), so the existing TC-COMP-364 test fails on the specified Dockerfile until it joins continuation lines. The row does not say so. (b) `test_distribution_contents.py` asserts `index.html` only "when the bundle has been built before `uv build`". The behaviour otherwise (skip, fail or build) is unstated, and a skip makes the B3 assertion vacuous in a pytest-first validation order. (c) A blank line at line 1093 splits the §7 table. The four new rows have no header or delimiter row and do not render as table rows | The implementing story meets a crashing test it was not told about. The B3 regression test can pass without checking anything. Table-reading tools miss four rows | Note the continuation handling in the row. Specify the absent-bundle behaviour, for example build a stub `index.html` in a temporary copy, or fail. Remove the blank line |
| FINDING-40 | LOW | SR-2 / SR-1 | runtime-config | RC §2.8.3 line 836 and lines 896-900; §2.2 table; §4 data classification | **New.** Three problems with the composed database URL and the new variables. (a) The password is interpolated unencoded into the URL. One containing `@`, `/`, `:` or `#` yields a malformed URL: Compose renders `postgresql://factorflow:p@ss/w:rd@127.0.0.1:5432/factorflow`. (b) "Composed from the password, so the two cannot disagree" holds for the two variables. But `POSTGRES_PASSWORD` only initialises an empty volume, so changing `FACTORFLOW_POSTGRES_PASSWORD` later breaks the app with exit 1, "database unreachable". (c) `FACTORFLOW_POSTGRES_PASSWORD` and `FACTORFLOW_IMAGE_TAG` are absent from §2.2's table, and §4's SEC-DAT-001 classification names only the API key and the database URL | A valid password can make the product unstartable with a misleading message. A new secret is unclassified | Constrain the password's characters or encode it. State the initialisation caveat and the change procedure (`ALTER ROLE`, then restart). List both variables, and classify the password Restricted |
| FINDING-41 | LOW | SR-1 | schema-migrator | SM §2.1 lines 114-122 | **New.** "Every reference to the repository-root `migrations/` path moves with it" enumerates files, but omits `tests/e2e/support/acquisition.ts` line 22 and `web/src/api/types.ts` lines 143 and 270, which cite `migrations/000N` in comments | Stale comments only | Add them, or drop "every" and rely on the implementing story's list |
| FINDING-42 | LOW | SR-3 / SR-10 | System design | SD §4.1 line 298 | **New.** The `runtime-config` responsibility reads "Loads and validates configuration and the provider credential from the environment; redacts secrets". RC v12 §1 also gives it the `Dockerfile`, `compose.yaml` and `.dockerignore` (owner decision 2026-10-12). SD v7 cites RC §2.8.1 in §1 and 5.11, but §4.1 assigns the deployment definition to no component | The system design's component vocabulary does not show who owns the deployment | Extend the §4.1 row at the next system-design revision |
| FINDING-11 | LOW | SR-2 / SR-9 | runtime-config | §2.2c item 2; §7 | Remaining from v6. `localhost` is resolved once at start | Residual gap against SEC-ENC-001 condition (2) | Re-check per claim, drop `localhost`, or record the residual |
| FINDING-12 | LOW | SR-4 | runtime-config | §2.2c clause 8; condition table; item 2; §7 | Remaining from v6. A missing control-character row, a missing parser-agreement assertion, and one wrong table reason | Small regressions pass the design's suite | Add the row and assertion, and correct the reason |
| FINDING-13 | LOW | SR-6 | massive-client | §8 line 821; §2.2b comment | Remaining from v6, part (b). "guarantees `https`" is not qualified "in the release build" | Overstates a guarantee for non-release builds | Qualify both |
| FINDING-14 | LOW | SR-6 | runtime-config | §3 line 973; §14 item 3; §2.3; §12 line 1202 | Remaining from v6 and v7. Three dangling pointers ("Section 2.4a"; the section 7 test that lives in ingestion-api; `MassiveSettings(BaseSettings)`), and a §12 Decision row that omits DEC-0038 | Readers land on the wrong text | Fix the pointers and extend the row |
| FINDING-15 | LOW | SR-3 | System design | §4.1 line 300 | Remaining from v6. `massive-client` is described as "Hand-written HTTP client". v7 was the revision v10 named for the fix | Contradicts the SDK-based design | Reword the row |
| FINDING-16 | LOW | SR-4 | Rate-limit governor | §8 AC-11 | Carried from v5. A concurrent-caller criterion under a single-threaded model | Vacuously satisfied | Record it as vacuous, or restate it |
| FINDING-17 | LOW | SR-6 | massive-client | §14 item 2 line 918 | Carried from v5. It still claims to block the governor throttle path | Reports a discharged blocker | Mark it resolved |
| FINDING-18 | LOW | SR-3 | System design; component designs; UX artifacts | Frontmatter pins and References tables | Carried from v5, **extended**. SD v7 (frontmatter and §9) and MDS v8 pin tech-stack v3; v5 is current. RC §12 labels the tech stack v3, the capability v6, the system design v3 and the UX design v4, although RC's frontmatter pins tech stack v5. IA §12 and SM §12 label the system design v3 and the UX design v4. The ten unchanged designs and UX artifacts pin system design v6; v7 is current. massive-client §12 labels are as v10 recorded | Repeated checker warnings and stale labels. Content impact assessed: none for the v6 pins (Cross-Specification Consistency) | Propagate current versions when each design is next revised |
| FINDING-20 | LOW | SR-2 / SR-4 | runtime-config | §7; item 3 | Remaining from v7. Two test rows contradict on `e2e-test-key`, and DEC-0040 settles it at story level only | `$test-design` meets the contradiction | Align RC §7 with DEC-0040 |
| FINDING-26 | LOW | SR-2 / SR-6 | massive-client | §2.4 line 396 | Remaining from v9. It says the corporate-action reads, plural, depend on `VXClient`; only the IPO read does | Self-contradiction with §2.2b and §7; no behaviour change | Reword as v9 recommended |
| FINDING-27 | LOW | SR-4 / SR-6 / SR-7 | massive-client | §7 redirect row line 768 | Remaining from v9. The injected-`monotonic` alternative does not require the injected `sleep` to advance it | A literal reading yields a test that hangs | Name the `FakeClock` and `FakeSleeper` coupling, or drop the alternative |
| FINDING-28 | LOW | SR-5 | massive-client | §12 Review rows lines 889-890 | Remaining from v9. No §12 row for specification review v8 | v8's evidence cannot be found from the design | Add the row |
| FINDING-29 | LOW | SR-2 | massive-client | §5 lines 702-705 | Remaining from v10. "Up to four reads per instrument ... 12000 requests". §2.5 and §11 give nine first-page requests per instrument, so about 27000 | Run-duration expectations come out about 2.25 times too short | Restate as nine first-page requests, about 27000 plus pages |
| FINDING-30 | LOW | SR-6 / SR-5 | Capability; system design; massive-client | Capability AC-3 line 217; massive-client §2.5 line 445 | Remaining from v10. The definition of "company fundamentals" (three statements, no ratios) lives only in two component designs | A later reader can reintroduce ratios under AC-3 | Record it in the capability or a decision record |

---

## Traceability Matrix

| Layer | Coverage | Evidence |
|-------|----------|----------|
| Capability to system design | 26/26 | System design §7, lines 503-528. Only the AC-14 row changed |
| Capability to UX design | 26/26 | UX design §5 (unchanged) |
| Capability to component designs | 26/26 | Every AC is still referenced. RC §13 adds an AC-15 row. The AC-14 rows in RC §13 and IA §13 are stale (FINDING-37) |
| System components to component designs | 12/12 | One design per component; `build-architecture.py` PASSED. The deployment definition is owned by `runtime-config` without a §4.1 mention (FINDING-42) |

Changed design elements:

| Design element | Capability AC | Constitution or decision | Release blocker | Component AC or test |
|---|---|---|---|---|
| RC §2.8.1 host-network topology, loopback-only PostgreSQL | AC-14 | Owner decision 2026-10-12; SEC-AUTH-001 basis | B4 | RC §8 criterion 13; `test_compose_definition.py`; smoke check 4 |
| RC §2.8.2 two-stage image, `package-data`, `.dockerignore` | AC-1, AC-15, AC-16 | DEC-0034; SEC-NDG-001 | B1, B3 | `test_distribution_contents.py`; `test_release_excludes_test_paths.py` (extended) |
| RC §2.8.3 compose definition | AC-13, AC-15, AC-16 | SEC-SEC-001; DEC-0034 | B4 | RC §8 criteria 12 and 14; `test_compose_definition.py`; smoke check 1 |
| RC §2.8.4 upgrade and rollback | AC-15, AC-16 | OPS-MIG-003 | B5 (partly) | none (FINDING-34) |
| RC §2.8.5 smoke check | AC-14, AC-15, AC-18 | OPS-ERR-001 | B1, B3, B4 | itself |
| SM §2.1 migrations as package data; §2.5 exit 4 | AC-15, AC-16 | EXP-20261012-1 | B1, B2 | SM §7 three new rows |
| IA §2.5 bundle in the installed package | AC-1, AC-7, AC-17 (every screen) | n/a | B3 | IA §7 two new rows |
| SD §1, 5.11, §7: AC-14 wording | AC-14 | Owner decisions 2026-09-03 and 2026-10-12 | B4 | n/a |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

There are no CRITICAL findings, so the verdict is not NOT-READY. Three HIGH
findings exist, so it is not READY:

- **FINDING-1** (owner-open since v6): the SEC-ENC-001 standing of host-local
  plaintext channels. This round's compose file makes the database channel
  concrete.
- **FINDING-31** (new): the designs claim two independent AC-14 controls.
  Under host networking there is one preventive control, and the owner's
  decision rests on "keeps both".
- **FINDING-32** (new): the release image installs Python dependencies outside
  the lockfile.

**The lane is not cleared.** CAP-001 is on the high-risk lane (signal
`deployment-topology`, `docs/risk-model.md` line 80). `docs/lanes.md` line 14
says specification review must reach READY, and READY-WITH-WARNINGS does not
clear the lane. All three HIGH findings must be resolved before this gate can
pass:

- FINDING-1 by the constitution owner's ruling;
- FINDING-31 by corrected text plus an owner decision on the single-layer
  posture;
- FINDING-32 by a locked install.

Then a new specification review must cover the revised revisions.

The change achieves most of what it set out to do. The image will find its
migrations and carry its bundle, which this review verified by building the
wheel. Ingestion has a defined container, and the loopback-bound API is
reachable from the owner's browser.

The rubric defines readiness as this verdict and no numeric score, so none is
given.

**This verdict is review evidence, not approval.**

- The five changed subjects are system-design v7, ingestion-api v7,
  market-data-store v8, runtime-config v12 and schema-migrator v5. Each keeps
  `status: approved` with an approval block that does not cover its current
  revision, so each is unapproved at that revision. Each stays blocked from
  epic generation and test design until the owner explicitly approves it with
  `python3 scripts/artifact-gate.py approve --project factorflow-v2 --artifact
  <design path> --review-artifact
  docs/capabilities/CAP-001-market-data-acquisition-foundation/specifications-review-report-v11.md`.
- READY-WITH-WARNINGS is a passing verdict for that command. On the high-risk
  lane it is not sufficient for the specification gate, so approving against
  this report would not clear the lane.
- The other 11 subjects keep their existing approvals, because this report
  covers them at the same ID, version and content revision.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. **FINDING-31.** Correct the AC-14 control statements in runtime-config
   §2.8.1 and ingestion-api §4 and §13. Then put the single-layer posture to
   the owner: accept it and record that, or add an independent layer.
2. **FINDING-32.** Install the locked dependency set in the image, and add a
   §7 assertion that holds it.
3. **FINDING-1** (owner-open). The constitution owner rules on host-local
   plaintext channels. Then align runtime-config §2.8.3, ingestion-api §4 and
   market-data-store §4.

### Should Fix (MEDIUM findings)

4. **FINDING-33.** Correct market-data-store §4's database exposure.
5. **FINDING-34.** Settle one OPS-MIG-003 posture across runtime-config,
   market-data-store and schema-migrator.
6. **FINDING-35.** Say which run is release evidence, and isolate any
   throwaway run.
7. FINDING-6 to FINDING-9: the carried v5 items, held by owner choice.

### Nice to Have (LOW findings)

8. FINDING-36 to FINDING-40 are small edits to runtime-config. They are cheap
   to fold into the revision that fixes FINDING-31 and FINDING-32, together
   with FINDING-37's ingestion-api row and FINDING-18's labels in the three
   revised designs.
9. FINDING-41 and FINDING-42: one sentence each.
10. FINDING-11 to FINDING-17, FINDING-20 and FINDING-26 to FINDING-30:
    unchanged residuals.

---

## Observations Outside the Review Subjects

These are not findings against the specifications.

- **Tech stack v5's approval is stale.** `artifact-gate.py check` on
  `docs/constitution/tech-stack.md` reported FAILED. Its approval is for
  `sha256:46408823...`, and the current revision is `sha256:cf11e1b4...`. Its
  `status` still reads `approved`. The three revised designs now pin it, so a
  phase-boundary `require` will fail on it until the owner re-approves it
  through `$tech-stack`.
- **The implementation does not yet match the designs.** At `22fc403` these
  still hold:
  - the `Dockerfile` copies `migrations/` and builds no bundle;
  - `migrate_main.py` line 35 resolves `parents[3]`;
  - `pyproject.toml` ships only `coverage/sql/*.sql`;
  - there is no `compose.yaml`, `.dockerignore` or `scripts/deploy-smoke.sh`.

  This is follow-up implementation work after approval. It is high-risk-lane
  work, because it changes deployment topology.
- **Downstream wording and pins.** `epics/runnable-foundation/CAP-001-E1.md`
  line 66 still says "the container publishes its port to `127.0.0.1`". The
  changed designs' bumps add pin drift in E3, E5, E3-S6, E3-S7, E5-S1, 22 task
  plans, the coverage matrix and the component test specification. This is
  bookkeeping for `$story-generation`, `$backlog-review` and `$test-design`
  once the designs are approved.
- **The release manifest's post-release check.** It expects health to show
  `database: ok`. The API returns `reachable` or `unreachable`
  (`api/models.py` line 43). The compose healthcheck uses the correct value,
  and manifest v2 should too.
- **Secret-scan scope.** CAP-001-E1-S3 implementation review v3 noted that
  `test_no_committed_secrets.py` leaves a top-level compose file unscanned.
  The new `test_compose_definition.py` covers literals in `compose.yaml`.
  `scripts/` stays outside the scan.

## Unattended-Run Record

This run was driven and unattended. Nobody could be asked.

- **Interpretation recorded (proceed past `AWAITING-APPROVAL`).**
  - The state check exited 1 because no review covers the five changed
    revisions.
  - The task directing this run asked for exactly that review.
  - An owner approval cannot pass the gate without a review that covers the
    revision (`docs/approval-gates.md`).
  - v10 proceeded the same way in the same state.
  - This follows from those artifacts, not from an assumption.
- **No decision record was written.** This run's only permitted write is this
  report, so the interpretation is recorded here instead of under
  `projects/factorflow-v2/decisions/`. A driver that wants it in the decision
  log can copy it.
- **Severity judgements made from the artifacts.**
  - FINDING-31 is HIGH. It misstates a security control that the
    no-authentication decision depends on, in the very topology that put this
    capability on the high-risk lane, and the owner's 2026-10-12 decision was
    recorded on that claim.
  - FINDING-32 is HIGH. It reproduces the release-manifest defect class: the
    deployed artifact differs from the tested one.
  - Neither is CRITICAL, because AC-14 is still met and the packaging works.
- **Not determined.**
  - The owner's Docker Desktop probes: not reproducible without Docker daemon
    access, which this session does not have.
  - Which versions `pip install .` would resolve today: no package-index
    access. FINDING-32 is structural, so the answer does not change it.
  - The behaviour of a real image build or `compose up`: not run, for the
    same reason. Compose behaviour was taken from Compose v2.39.1 run
    offline, and restart semantics from Docker's documented `unless-stopped`
    policy.
- **No question for the owner was needed to reach the verdict.** The owner
  decisions the findings call for are listed under Recommendations.
