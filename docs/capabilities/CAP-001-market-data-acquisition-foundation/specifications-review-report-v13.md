---
artifact_schema_version: 1
artifact_id: CAP-001-specification-review
artifact_type: specification-review
artifact_version: 13
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-12
updated: 2026-10-12
document: spec-review-report
capability: CAP-001
version: v13
generated: 2026-10-12T20:59:00Z
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
    result: "PASSED with 219 warnings, exit 0 (--strict), no error. Changed subjects: runtime-config v14 and schema-migrator v7 raise no warning; massive-client v15 still pins system-design v6 and tech-stack v3; 33 warnings in all are CAP-001-system-design v6 or v7 pins"
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
  SR-8: "applied — UX brief v7 and UX design v5 digest-identical to v12; the change adds no screen, state or copy"
  SR-9: "applied — dependency and STD-UI conformance halves by check-capabilities.py; CONST-SEC 1.3 host-local loopback exception (H1 to H9, checks (i) to (q)) and the test-double reliance wording assessed by hand"
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
    artifact_version: 15
    content_revision: sha256:21d3a56bddbcbf5fbd728bcb61c49d4a38d716c17801c944eaf91a89a6700ace
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
    artifact_version: 14
    content_revision: sha256:46aaabf8792cc8b1f3d805174a5b7117edb25f0f59348e04f2dc4c3d5b8eed1f
  - artifact_id: CAP-001-component-design-schema-migrator
    artifact_version: 7
    content_revision: sha256:364b6b3bc5d1ca0ea33b7266592b907e03974a94b6437432a563195a14453d0e
statistics:
  total_findings: 26
  critical: 0
  high: 0
  medium: 5
  low: 21
pipeline_readiness: READY
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-12T20:59:00Z
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
      version: "15"
    - id: CAP-001-component-design-observation-writer
      version: "4"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: CAP-001-component-design-rate-limit-governor
      version: "8"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-runtime-config
      version: "14"
    - id: CAP-001-component-design-schema-migrator
      version: "7"
    - id: CAP-001-specification-review
      version: "12 (previous round)"
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
| **Version** | v13 |
| **Specifications Reviewed** | Capability, system design, UX brief, UX design, 12 component designs (full set; three changed since v12) |
| **Total Findings** | 26 (0 CRITICAL, 0 HIGH, 5 MEDIUM, 21 LOW) |
| **Pipeline Readiness** | READY |
| **Lane** | High risk (`deployment-topology` signal). Specification review must reach READY; this verdict does. Approval remains the owner's separate act |

**What changed since v12.** One commit, `4e75993` on
`usr/alvaro-de-jodra/CAP-001-design-deployment`, answers v12 FINDING-43 to
FINDING-47 and nothing else:

- `component-design-schema-migrator.md` v6 to v7: `migrate_main` loads its URL
  through `DatabaseSettings` before connecting (H7), with a new §7 test row,
  §8 criterion 10, an exit-1 row covering the refusal, and a reliance sentence
  that routes the exception through `runtime-config` §2.8.1 and DEC-0050.
- `component-design-runtime-config.md` v13 to v14: channel (b) includes the
  migrator; §2.3 lists every database client; §8 criterion 14 covers the
  migrator; the test-double gate names CONST-SEC 1.3, now in force;
  `uv export --locked`; the drill runs `scripts/deploy-smoke.sh
  factorflow-drill` before taking data; the owner's procedure carries H4's
  128-bit floor, H8 after network changes, the README address (H2), a
  `pg_hba.conf` method allow-list and the check before first use of the
  interface.
- `component-design-massive-client.md` v14 to v15: the test-double reliance
  wording names 1.2 as origin and 1.3 as carrier.

The other 13 subjects are digest-identical to the revisions v12 recorded,
recomputed this session with `artifact-gate.py revision`.

**v12 resolved: 5 of 28, including the only HIGH (FINDING-43).** FINDING-44 to
FINDING-47 are resolved as well. Two LOW findings were partly resolved in
passing (FINDING-48 (a), (d) item 4 and (f) for massive-client; FINDING-49
(a)). The fixes were verified against code and tools: `uv export --locked`
offline on exactly the two files the `lock` stage copies; `DatabaseSettings`
raising a value-free `ConfigurationError` in `settings.py`; the migrator's
current environment read in `migrate_main.py`.

**New in this round: 1 MEDIUM, 2 LOW.**

- **FINDING-52 (MEDIUM).** Check (q) on CONST-SEC 1.3's exact text. Both
  runtime-config and schema-migrator say schema-migrator relies on the
  exception, and schema-migrator specifies and tests H7 for its own process.
  It is therefore a relying design, and the Statement requires the project's
  decision to name it in `artifacts`. DEC-0050 does not. The citation half is
  met in substance (schema-migrator carries the exact phrase three times and
  names channel (b)); the decision half is not. v12 offered the route the
  authors took as sufficient; on the exact text it is not.
- **FINDING-53 (LOW).** runtime-config §2.3 says no test changes under the H7
  validator. Ten test modules load settings with `postgresql://unused/unused`,
  which the validator refuses.
- **FINDING-54 (LOW).** Editorial defects introduced in schema-migrator v7: a
  misaligned §12 table, a flowchart that labels the H7 refusal "database
  unreachable", and an AC-14 trace for the database-client confinement.

**Verdict:** READY. No CRITICAL or HIGH finding remains.

## Review Scope

**Full set, depth proportional to change.**

- **Changed subjects (3).** runtime-config v14 and schema-migrator v7 were read
  in full at `4e75993`; massive-client v15's changed paragraph and every
  remaining CONST-SEC 1.2 reference in it were read in context. The diff
  `7628f86..4e75993` was reviewed line by line. Every changed claim was checked
  against:
  - CONST-SEC 1.3's SEC-ENC-001 Statement, conditions H1 to H9, Verification
    checks (i) to (q), the Definitions (*Component*, *Deployment*, *Production
    data*, *Release evidence*), SEC-NDG-001 and the Exception Record;
  - DEC-0050 and DEC-0051 in the harness at `0898bda`;
  - the repository at `4e75993`: `src/factorflow/config/settings.py`,
    `src/factorflow/db/migrate_main.py`, `src/factorflow/api/app.py`,
    `pyproject.toml`, `uv.lock`, and every test module that sets
    `FACTORFLOW_DATABASE_URL`.
- **Unchanged subjects (13).** Each revision equals the one v12 recorded, so
  v12's assessments stand by identity. ingestion-api, market-data-store, the
  system design and acquisition-runner were re-read where they describe the
  database channels, the exception or the migrator, to check the change
  against them (Cross-Specification Consistency).
- **Carried findings re-verified, not assumed.** Every v12 LOW and
  owner-carried MEDIUM was checked against the current text, by digest for
  the unchanged subjects and by line for the changed ones.
- **Not subjects.** Epics, stories, task plans, test specifications, decision
  records, the release manifest and CI are governing, downstream or tooling
  inputs. `tech-stack.md` v5 is review-exempt context.
- **Repository source.** Project repository
  `repos/factorflow-v2/FactorFlow-v2`, branch
  `usr/alvaro-de-jodra/CAP-001-design-deployment`, at `4e75993`, clean tree.
  Harness worktree at `0898bda`. The only file written is this report. Nothing
  was committed, no branch was switched, and nothing was approved.
- **Pipeline state.** `pipeline-state.py check --stage specification-review`
  reported `AWAITING-APPROVAL`, exit 1: each subject's approval block names a
  review (v3, v7 or v10) whose `review_subjects` do not cover its current
  revision. This report supplies coverage at the current revisions and
  approves nothing (Unattended-Run Record).
- **Independence.** This review ran in a fresh subagent session that authored
  none of the artifacts. Under REV-RCV-001 and VER-DEL-001 every author claim
  in the change was checked against code, configuration, constitution text or
  an offline tool run. Not reproduced: anything needing a Docker daemon.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All 14 template sections present in the three changed designs. The one changed diagram (SM §2.3) keeps its overview paragraph, which no longer describes the gate the chart now draws: FINDING-54 (b). Carried: FINDING-9 |
| SR-2 Correctness | applied | Every new code, configuration and tool claim checked (Supplementary Evidence). New: FINDING-53. Carried: FINDING-7, FINDING-12, FINDING-20, FINDING-26, FINDING-29, FINDING-36 (b) |
| SR-3 Consistency | applied | The H7 client list agrees across RC §2.3, RC H7 row, RC §8 criterion 14 and SM §2.5. Carried: FINDING-8, FINDING-15, FINDING-18 (extended), FINDING-48, FINDING-49 (b), FINDING-51 (c) |
| SR-4 Testability | applied | SM §8 criterion 10 and the new SM §7 row have observable outcomes and concrete inputs; RC criterion 14 now names all three clients. Carried: FINDING-11, FINDING-12, FINDING-16, FINDING-27, FINDING-51 (a) |
| SR-5 Traceability | applied | 26 of 26 capability ACs mapped. New: FINDING-54 (c). Carried: FINDING-6, FINDING-28, FINDING-30 |
| SR-6 Clarity | applied | Commands, keys and paths exact. New: FINDING-54 (b), FINDING-52 (the "does not cite separately" sentence). Carried: FINDING-13, FINDING-14 (extended), FINDING-17 |
| SR-7 Feasibility | applied | `uv export --locked` verified offline on the `lock` stage's two inputs; no new component or interface; no circular dependency. New: FINDING-53 (understated blast radius) |
| SR-8 UX Completeness | applied | UX artifacts unchanged. A configuration refusal presents as the existing unreachable state (SM §10). Carried: FINDING-8 |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` passed with no error or warning; capability unchanged. CONST-SEC 1.3 per condition and channel below. New: FINDING-52. Carried: FINDING-50 |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passed (12 components, 16 interfaces). The change adds no component, interface or capability-as-actor |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, exit 0, "PASSED" (integration layer 0: CAP-001; no blocked-by edges) | none |
| `build-architecture.py -p factorflow-v2` | run, exit 0, "1 design(s), 12 component(s), 16 interface(s) PASSED" | none |
| `check-artifacts.py -p factorflow-v2 --strict` | run, exit 0, "PASSED with 219 warning(s)", no error | FINDING-18 (massive-client v15 pins system-design v6 and tech-stack v3). runtime-config v14 and schema-migrator v7 raise none |
| `check-references.py` (harness root) | run, exit 0, "1112 path references across 209 Markdown files ... PASSED" | none. It scans harness Markdown only. The one project path added this round, `tests/unit/test_migrate_main_confinement.py`, is declared new by SM §7; the others already resolve or were declared new in v12 |
| `check-constitutions.py` (harness root) | run, exit 0, "10 constitutions, 36 skills PASSED" | none |

**Prerequisites.** `check-prerequisites.sh --project factorflow-v2` exited
**0**: every row PASSED, context freshness "last run 0h ago". v12's recorded
deviation (stale context) does not recur. Design system resolved per
`docs/design-system.md`: `design_system_available = true`
(`design-system.yaml` present, components repository is this repository).

### Supplementary evidence (fresh, this session)

| Claim in the change | Evidence | Result |
|---|---|---|
| CONST-SEC 1.3 is in force (RC lines 844-845, 349-351) | `artifact-gate.py revision --repo-dir . --artifact docs/constitutions/security.constitution.md` gives `sha256:0f5659ad...5b0c7`, equal to `approval.reviewed_revision`; `git branch -r --contains e2c6124` lists `origin/main`; `git diff origin/main HEAD` on the file is empty | Holds (FINDING-48 (a) resolved) |
| `--locked` "fails the build if `uv.lock` is out of date"; the export carries the locked runtime set (RC lines 887, 905-908) | uv 0.12.10 (the pinned version), `--offline`, in a scratch directory holding only `pyproject.toml` and `uv.lock`, as stage 2 copies them: exit 0, 260 `--hash` lines, `massive==2.8.0`, `psycopg-binary==3.3.5`, no `pytest`, `ruff` or `mypy`. With `requests>=2` added to `dependencies`: exit 1 | Holds (FINDING-45 resolved). Static `[project]` metadata (`pyproject.toml` lines 5-17), so the check needs no source tree |
| `DatabaseSettings()` refuses with a `ConfigurationError` naming the variable and not the value (SM line 232, 244-246) | `settings.py`: `_EnvNamedSettings.__init__` (lines 54-76) re-raises with `errors(include_url=False, include_input=False)`; `DatabaseSettings(_EnvNamedSettings)` (line 79). A model-level validator has an empty `loc`, so its own message must name the variable, which the RC §2.3 docstring requires (lines 548-553) | Holds for the code. RC §2.3's snippet (line 539) still shows `DatabaseSettings(BaseSettings)`: FINDING-14 (extended) |
| `migrate_main` "today reads `FACTORFLOW_DATABASE_URL` itself (its docstring defers the wiring...)" (SM lines 246-248; RC lines 644-646) | `migrate_main.py` lines 8-13 (docstring) and 168 (`os.environ.get`) | Holds |
| `app_main`'s pool and `ingestion_main` load through `DatabaseSettings` (RC lines 642-644, 860) | `src/factorflow/api/app.py` line 171 (`DatabaseSettings()` in the lifespan); `ingestion_main` loads `Settings` through `settings_factory` (AR §2.1 lines 97-110), whose database member is `DatabaseSettings` | Holds |
| "No code under `src/` reads `FACTORFLOW_DATABASE_URL` from the environment except `DatabaseSettings` and the redaction filter" (RC lines 648-650) | `grep -rn FACTORFLOW_DATABASE_URL src/`: `settings.py` (the model and `_DATABASE_URL_VAR` for redaction) and `migrate_main.py`, which the implementing story changes | Holds as the target state the paragraph states |
| "The tests and the E2E stack already connect to `127.0.0.1` or `localhost`, so none of them changes" (RC lines 639-640) | 24 lines in 15 test modules set `postgresql://unused/unused`. Ten load settings with it: six through `with TestClient(...)` (lifespan, `app.py` line 171), plus `test_settings_base_url.py` (lines 208-213), `test_massive_tls.py` (line 55), `test_ingestion_main.py` (line 113) and `test_ingestion_e2e_main.py` (line 77) | **Does not hold** (FINDING-53) |
| DEC-0050 names the designs that rely on the exception (RC line 1460; SM lines 248-251) | `projects/factorflow-v2/decisions/DEC-0050.md` `artifacts`: runtime-config, ingestion-api, market-data-store, system design. The consumer search the Exception Record prescribes (`git grep ... -- 'projects/*/decisions/*'` over every ref) finds DEC-0050 as the only host-local consumer record | **Does not name schema-migrator** (FINDING-52) |
| The smoke check's `pg_hba.conf` allow-list (`scram-sha-256`, `peer`, `reject`) matches H4 | CONST-SEC line 232, H4: no `trust`, no `password`; `peer` allowed. The allow-list is stricter than H4 (it also rejects `md5`, `ident`, `cert`) | Holds (FINDING-47 (d) resolved). Not run against a container (no Docker daemon) |
| massive-client v15 timestamp precedes its commit | `ai_provenance.timestamp: 2026-10-12T20:40:28Z`; `4e75993` dated 15:40:42 -0500 = 20:40:42Z | Holds (FINDING-48 (f) resolved for massive-client; acquisition-runner still 22:00:00Z) |

## Constitutions Applied

All seven constitutions the relevance matrix assigns `specification-review`
were read; all are at the versions v12 recorded.

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | **AGT-PROV-001:** RC v14, SM v7 and MC v15 bump their versions, keep `correlation_id`, and refresh timestamps that precede the commit. **AGT-SPEC-002:** no security judgement was made on the owner's behalf; FINDING-52's open choice (whether acquisition-runner is a relying design) is surfaced, not decided. **AGT-EVIDENCE-002:** the 128-bit floor cites H4; the 192-bit figure is computed from `openssl rand -hex 24`. Healthcheck timings still unsourced (FINDING-36 (b)). **AGT-AUTH-001:** this review approves nothing |
| CONST-MDL 1.3 | **MDL-PIN-002:** the exact identifier `claude-opus-5-5` is recorded in the three changed designs and in this report |
| CONST-OPS 1.3 | **OPS-MIG-003:** met under branch (a) by RC §2.8.4, and the drill now runs the H8 check before taking data (v12 FINDING-46 resolved). **OPS-DEST-001:** `dropdb` and `down -v` still follow owner confirmation. **OPS-ERR-001:** the smoke check exits non-zero on its first failure; the migrator's H7 refusal exits 1 with a logged message. No destructive operation was run in this review |
| CONST-REV 1.4 | **REV-STG-001:** Stage 1 and Stage 2 are reported separately below. **REV-AGT-001:** full bar. **REV-RCV-001:** each answer to v12 was verified independently, including the authors' reliance argument for check (q). **REV-RCV-002:** that argument, and v12's own recommendation that invited it, are challenged on the constitution's text (FINDING-52) |
| CONST-SA 2.0 | **SA-MD-001:** template conformance passes; SM §12's table is malformed (FINDING-54 (a)). **SA-MD-002:** new paths resolve or are declared new. **SA-MD-003:** no placeholder language introduced |
| CONST-SEC 1.3 | In force (Supplementary Evidence). **SEC-ENC-001, host-local loopback exception:** assessed by condition and channel below. **SEC-ENC-001, test-double exception:** the gate now names 1.3 and records that it has held since 2026-10-12 (v12 FINDING-44 resolved). **SEC-NDG-001:** H7 now holds for every database client the product runs, so channel (b) is not a disableable security feature. **SEC-SEC-001:** unchanged, PASS. **SEC-DAT-001:** password Restricted, PASS. **SEC-DEP-001:** floating base-image tags, no image scan (Observations) |
| CONST-VER 1.2 | **VER-EVD-001:** every verdict rests on reads and commands run this session. **VER-EVD-004:** Stage 1 gives one verdict per changed rule, and the CONST-SEC table one per check and channel. **VER-DEL-001:** Docker-dependent claims were not re-run and are marked. **VER-CHK-001:** no test suite was run, the change being design-only; the export, settings and test-URL claims were exercised against code and tools instead |

### CONST-SEC 1.3: the host-local loopback exception, by check and channel

Channels as RC §2.8.1 (lines 837-842) names them: (a) the browser to the API at
`http://127.0.0.1:8000`; (b) the application container to PostgreSQL, carrying
the migrator's connection and the API's pool; (c) the ingestion container to
PostgreSQL.

| Check | Condition | (a) browser to API | (b) application container to PostgreSQL | (c) ingestion to PostgreSQL |
|---|---|---|---|---|
| (i) | H1, H3 | PASS. `ApiSettings` bind; no `ports:`. `localhost` residual: FINDING-50 (a) | PASS. `listen_addresses=127.0.0.1`; `test_compose_definition.py`, smoke check 4 | as (b) |
| (j) | H2 | PASS. Healthcheck and smoke check use no proxy or redirect; §9 gives `http://127.0.0.1:8000` and assigns the README change to the implementing story (v12 FINDING-47 (c) resolved) | PASS. URL host `127.0.0.1`, `psycopg` | as (b) |
| (k) | H4 | PASS. No credential crosses | PASS. `require_auth`, `POSTGRES_HOST_AUTH_METHOD`, `POSTGRES_INITDB_ARGS`; 128-bit floor normative in §2.8.3 with a release-evidence generation statement; smoke check 1 allow-lists methods (v12 FINDING-47 (a), (d) resolved) | as (b) |
| (l) | H5 | PASS. Internal (IA §4) | PASS. Internal (MDS §4) | as (b) |
| (m) | H6 | PASS. Owner named; per-deployment statement in release evidence (RC line 859); the drill is covered by the same statement (line 1129) | as (a) | as (a) |
| (n) | H7 | PASS. `ApiSettings`; FINDING-50 (a) | **PASS** (v12: FAIL). The migrator loads its URL through `DatabaseSettings` before connecting (SM §2.5), tested by `test_migrate_main_confinement.py` for wiring and `test_database_url_confinement.py` for every override route; the API pool through `DatabaseSettings` (`app.py` line 171); PostgreSQL's deployment definition is release evidence | PASS. Via `Settings.database`. `localhost` residual: FINDING-50 (b) |
| (o) | H8 | PASS. Smoke check 4 after every `up -d` and every network change; ingestion gated by profile; the interface opened only after the check; the drill runs its own check (v12 FINDING-46, FINDING-47 (b), (e) resolved) | as (a) | as (a) |
| (p) | H9 | PASS for the mechanism. One of five state-changing routes tested: FINDING-51 (a) | n/a (not HTTP) | n/a |
| (q) | Citation and decision | PASS. IA cites the phrase and names the hop; DEC-0050 names IA | PASS for RC and MDS. **Decision half not met for schema-migrator**, a relying design absent from DEC-0050's `artifacts` (FINDING-52) | PASS for RC and MDS (acquisition-runner discussed under FINDING-52, not raised) |

### Check (q) and the schema-migrator: the judgement requested

The question is whether schema-migrator satisfies check (q) by relying on the
exception "through" runtime-config §2.8.1 and DEC-0050 instead of citing it
separately. On the constitution's exact text, it does not, for these reasons:

1. **The obligation attaches to each relying design.** The Statement (CONST-SEC
   line 232) reads: a consumer "MUST cite it in each design that relies on it
   by the exact phrase `SEC-ENC-001 host-local loopback exception`, naming
   each channel it covers, and its project MUST record a decision ... whose
   `artifacts` name those designs". Check (q) (line 233) verifies that "the
   consumer's designs cite the exception by its phrase and its project has
   recorded the decision the Statement requires". Neither text provides for a
   design relying on the exception through another design.
2. **schema-migrator is a relying design by the designs' own words and by the
   Definitions.** RC line 847: "`schema-migrator` relies on the exception
   through this section and DEC-0050". SM lines 249-250: channel (b) "relies on
   the `SEC-ENC-001 host-local loopback exception` of CONST-SEC 1.3 for it".
   CONST-SEC's *Component* definition (line 90) is "the process of the product
   that opens or accepts a channel"; the migrator is a separate process
   (`python -m factorflow.db.migrate_main`) that opens channel (b), and SM
   specifies and tests that process's H7 behaviour (§2.5, §7 line 359, §8
   criterion 10).
3. **The citation half is met in substance.** SM contains the exact phrase at
   lines 250, 359 and 436, and names channel (b) by reference to RC §2.8.1.
   Line 251's "this design therefore does not cite the exception separately"
   is inaccurate rather than harmful.
4. **The decision half is not met.** DEC-0050's `artifacts` name
   runtime-config, ingestion-api, market-data-store and the system design.
   schema-migrator is absent, and RC line 1460 describes DEC-0050 as "naming
   the designs that cite it", which is no longer true.
5. **Why it matters.** The Exception Record (CONST-SEC line 389) makes the
   decision's `artifacts` the list of "designs to re-review" when the exception
   changes. A change to H7 would route runtime-config to re-review, but not the
   design that carries an H7 test row and acceptance criterion of its own.

v12's FINDING-43 recommendation offered "state in RC §2.8.1 that channel (b)
includes the migrator's connection" as an alternative to citing and recording.
The authors took that route. That recommendation was insufficient on the exact
text; this report corrects it rather than treating the authors' choice as a
regression.

Severity is MEDIUM, not HIGH. Coverage under the exception depends on H1 to
H9 (the Statement: "This exception covers only channels meeting all of (H1) to
(H9)"), and all nine hold for channel (b) as specified. The unmet obligation is
the consumer's registration duty. One decision record discharges it, and
nothing downstream is built on the gap.

**acquisition-runner, not raised.** It owns `ingestion_main`, the process that
opens channel (c). It neither claims reliance nor specifies any
exception-specific behaviour; its database URL is loaded and confined entirely
by runtime-config's `Settings`, which is in DEC-0050. That differs from
schema-migrator after this revision. The owner may still decide that every
design owning a client process is a relying design; FINDING-52's
recommendation asks for that decision to be recorded at the same time.

## Status of v12 Findings

IDs continue v12's numbering.

| v12 ID | Severity | Status in v13 | Evidence |
|---|---|---|---|
| v12 FINDING-43 | HIGH | **Resolved** | SM §2.5 lines 240-251 require `DatabaseSettings()` before `psycopg.connect`, exit 1 on refusal; SM §7 line 359 adds the confinement test (non-loopback hosts, `host`/`hostaddr` parameters, `PGHOST`, unset, `connect` patched to fail); SM §8 criterion 10; RC §2.3 lines 642-650, RC H7 row line 860 and RC §8 criterion 14 (lines 1386-1389) cover all three clients; RC §2.8.1 lines 840-848 put the migrator in channel (b). H7 now holds for channel (b) by design. The registration residual is raised as FINDING-52 |
| v12 FINDING-44 | MEDIUM | **Resolved** | RC §2.2c bullets now name 1.3 (lines 342-346) and record that both conditions have held since 2026-10-12 (lines 349-351); lines 337-339 state once that "CONST-SEC 1.2" citations for the test-double exception mean the same text in 1.3; RC §4 (1245-1246), §8 criterion 10 (1372), §14 item 4 (1509, 1533-1536) and MC lines 258-263 aligned. Remaining 1.2 labels (RC line 290, the condition table, §7 rows; MC lines 220, 235, 666) name the version that added the unchanged text, as RC lines 337-339 and MC lines 258-260 state |
| v12 FINDING-45 | MEDIUM | **Resolved** | RC line 887 `uv export --locked`; lines 905-908 correct the claim; §7 Dockerfile row (line 1334) asserts `--locked` and not `--frozen`. Verified offline (Supplementary Evidence) |
| v12 FINDING-46 | MEDIUM | **Resolved** | RC §2.8.4 lines 1125-1135: live provider and real key stated; the drill is a deployment under the exception, covered by the H6 and password statements, and runs `scripts/deploy-smoke.sh factorflow-drill` before the interface and ingestion; §2.8.5 lines 1145-1148 add the project argument; §7 drill row (line 1337) |
| v12 FINDING-47 | MEDIUM | **Resolved** | (a) §2.8.3 lines 1006-1012, §6 lines 1287-1288, §9 lines 1398-1399, H4 row; (b) §2.8.5 lines 1140-1142, §9 lines 1409-1412, H8 row; (c) §9 lines 1401-1406, H2 row; (d) smoke check 1, lines 1150-1156; (e) H8 row, §2.8.3 lines 1030-1033, §9 |
| v12 FINDING-6 to FINDING-9 | MEDIUM | **Carried by owner choice** | Subjects digest-unchanged; text re-checked |
| v12 FINDING-48 | LOW | **Partly resolved** | Resolved: (a) RC line 844; (d) item 4 (lines 1533-1536); (f) for massive-client. Remaining: (b) RC §12 line 1459 still lists a 1.3 "draft ... not in force until reviewed, approved and merged"; (c) RC §2.2c lines 458-463; (d) items 6 (lines 1558-1576), 7 (1577-1579) and 8 (1586-1587); (e) RC §4 lines 1226 and 1229-1230 ("Both", "either" over three values); (f) acquisition-runner `timestamp: 2026-10-12T22:00:00Z`; (g) IA line 378, MDS line 572, SD line 411 "in force only once" |
| v12 FINDING-49 | LOW | **Partly resolved** | (a) resolved: RC §6 lines 1286-1293 list four variables, the smoke check and the profile start; §9 says "the four variables" (line 1400). (b) remains: MDS §6 line 626 "Manual actions required: none" |
| v12 FINDING-50 | LOW | **Remaining** | RC lines 301-302 and 632-635 unchanged; `settings.py` line 23 still includes `localhost` in `_LOOPBACK_HOSTS` |
| v12 FINDING-51 | LOW | **Remaining** | ingestion-api and system design digest-unchanged |
| v12 FINDING-36 | LOW | **Remaining** (part (b)) | RC §2.8.3 lines 1053-1058 unchanged |
| v12 FINDING-11, FINDING-12, FINDING-20 | LOW | **Remaining** | RC §2.2c item 2 (lines 402-405), clause 8 and the condition table, and the cited §7 rows (1323-1327) unchanged |
| v12 FINDING-13, FINDING-17, FINDING-26 to FINDING-29 | LOW | **Remaining** | massive-client v15 changed only lines 258-260 and its frontmatter |
| v12 FINDING-14 | LOW | **Remaining, extended** | RC §3 line 1207 "Section 2.4a"; §14 item 3's test pointer; §2.3 snippets lines 539 and 563 declare `BaseSettings`, against §2.2c line 492 and the code; §12 Decision row (line 1457) stops at DEC-0037 and omits DEC-0038 and DEC-0051 |
| v12 FINDING-15 | LOW | **Remaining** | SD §4.1 line 300 "Hand-written HTTP client" |
| v12 FINDING-16 | LOW | **Remaining** | Governor digest-unchanged |
| v12 FINDING-18 | LOW | **Remaining, extended** | massive-client v15 pins system design v6 and tech stack v3; IA §12 line 551 labels "Runtime Configuration v13"; RC and SM §12 label the capability v6, the system design v3 and the UX design v4 |
| v12 FINDING-30 | LOW | **Remaining** | Capability and system design unchanged |

## Stage 1 -- Specification Compliance of the Change

One verdict per changed rule (VER-EVD-004). PASS means the rule agrees with
the governing sources and owner decisions, agrees with the code and tools,
has a test or check where it is behaviour, and contradicts no other subject.
Line numbers refer to `4e75993`. RC is runtime-config, SM schema-migrator, MC
massive-client, IA ingestion-api, MDS market-data-store, AR
acquisition-runner, SD the system design.

| # | Rule | Location | Governing source | Test or check | Verdict |
|---|------|----------|------------------|---------------|---------|
| 1 | The migrator loads its URL through `DatabaseSettings` before connecting | SM §2.5 lines 240-248; §1 lines 74-78; §4 lines 285-288 | H7; check (n); v12 FINDING-43 | SM §7 line 359 | PASS (code base class and current env read verified) |
| 2 | Exit 1 covers an unset or refused URL, before any connection, value never named | SM §2.5 line 232 | H7; AC-13, AC-16; SEC-ERR-001 | SM §7 line 359 | PASS |
| 3 | The start flowchart gains the H7 gate | SM §2.3 lines 157-161 | SR-1 diagram rule | n/a | PASS for order. **FAIL** LOW for the exit label and stale overview (FINDING-54 (b)) |
| 4 | Confinement test and criterion 10 | SM §7 line 359; §8 lines 384-387 | check (n) | itself | PASS. With RC's `test_database_url_confinement.py`, every override route is covered |
| 5 | References and traceability for the new element | SM §12 lines 435-436; §13 line 446 | SA-MD-001; SR-5 | n/a | **FAIL** LOW (FINDING-54 (a), (c)) |
| 6 | schema-migrator relies on the exception through RC and DEC-0050 | SM lines 248-251; RC lines 846-848, 1460 | CONST-SEC Statement; check (q) | n/a | **FAIL** MEDIUM for the decision half (FINDING-52) |
| 7 | Every database client loads through `DatabaseSettings`; no other env read | RC §2.3 lines 642-650 | H7 | RC H7 row; SM §7 | PASS (verified in code) |
| 8 | The tests are unaffected by the validator | RC §2.3 lines 639-640 (unchanged since v13) | n/a | grep of `tests/` | **FAIL** LOW (FINDING-53) |
| 9 | Channel (b) includes the migrator; exception in force | RC §2.8.1 lines 837-848 | CONST-SEC 1.3; DEC-0050 | n/a | PASS |
| 10 | H2: README and §9 direct the browser to the loopback address | RC H2 row line 855; §9 lines 1401-1406 | H2; check (j) | n/a | PASS |
| 11 | H4: 128-bit floor, generation statement, method allow-list | RC H4 row line 857; §2.8.3 lines 1006-1012; §2.8.5 lines 1150-1156; §6; §9 | H4; check (k) | smoke check 1; release evidence | PASS |
| 12 | H7 row lists all three clients | RC line 860 | H7; check (n) | three test files named | PASS |
| 13 | H8: network-change trigger; check before first interface use | RC H8 row line 861; §2.8.3 lines 1030-1033; §2.8.5 lines 1139-1143; §9 lines 1401-1412 | H8; *Deployment* definition; check (o) | smoke check 4 | PASS (stricter than the definition: every `up -d`) |
| 14 | Smoke check takes a project name | RC §2.8.5 lines 1145-1150 | v12 FINDING-46 | itself | PASS |
| 15 | The drill is a deployment under the exception and runs the check first | RC §2.8.4 lines 1125-1135; §7 line 1337 | H6, H8; OPS-MIG-003 | drill row | PASS |
| 16 | `uv export --locked` | RC line 887; lines 901-912; §7 line 1334 | OQ-TS-5; v12 FINDING-45 | Dockerfile row | PASS (verified offline) |
| 17 | Test-double gate names 1.3, in force; 1.2 citations mean the 1.3 text | RC §2.2c lines 329-359; §4 lines 1242-1254; §8 criterion 10; §14 item 4 | CONST-SEC 1.3; DEC-0051 | existing §7 rows | PASS |
| 18 | First-deployment manual actions | RC §6 lines 1286-1293 | §2.8.3, §2.8.5 | n/a | PASS (also resolves FINDING-49 (a)) |
| 19 | Criterion 14 covers migrator, application and ingestion | RC §8 lines 1386-1393 | H7 | SM §7; RC §7 | PASS |
| 20 | Test-double reliance wording | MC lines 256-266 | DEC-0051 | n/a | PASS |
| 21 | Version bump, status and approval blocks kept, provenance refreshed | RC, SM, MC frontmatter | `docs/artifact-contract.md`; AGT-PROV-001 | `check-artifacts.py --strict` | PASS. MC pins (FINDING-18). Approvals stale until re-approved |

## Stage 2 -- Artifact Quality of the Change

- **Contract.** All three changed designs pass `check-artifacts.py --strict`
  with no error; massive-client keeps its pin warnings (FINDING-18). The
  correlation ID is unchanged.
- **Structure.** All 14 template sections present. SM §12's table has a
  four-cell and a five-cell row (FINDING-54 (a)).
- **Cross-references.** Every section the new sentences cite exists. RC line
  1460's description of DEC-0050 is now inaccurate (FINDING-52).
- **Quantitative values.** The 128-bit floor is sourced to H4 and the 192-bit
  figure is computed. Healthcheck timings remain unsourced (FINDING-36 (b)).
- **Placeholders.** None introduced.
- **Clarity.** SM line 251 says the design does not cite the exception while
  it does (FINDING-52); the SM flowchart labels a configuration refusal
  "database unreachable" (FINDING-54 (b)).

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; assessed against the system
design.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` passed with no error and no warning. Dependency
typing, placement across 5.1 to 5.3 and the STD-UI specialization are
unchanged from v12. No `blocked-by` edge exists.

#### Completeness (SR-1)

Unchanged. FINDING-9 is carried.

#### Correctness (SR-2)

No contradictory acceptance criteria.

#### Testability (SR-4)

All 26 criteria have an observable outcome, a concrete input and a measurable
boundary (unchanged).

#### Clarity (SR-6)

FINDING-30 is carried.

### System Design Specification

v8, digest-unchanged. Constraint 5.11 names the channel families ("browser to
API, both processes to PostgreSQL"); the migrator's connection belongs to the
same channel to `127.0.0.1:5432`, so the citation still covers it. FINDING-15,
FINDING-18, FINDING-48 (g) and FINDING-51 (b) remain.

### Component Design Specifications

#### runtime-config v14 (changed)

- **Conformance (SR-9).** H2, H4, H7 and H8 are now carried into the
  procedure and the tests (v12 FINDING-43, FINDING-46, FINDING-47 resolved).
  FINDING-52 (line 1460's DEC-0050 description), FINDING-50 carried.
- **Correctness and feasibility (SR-2, SR-7).** `--locked` verified. FINDING-53
  (the tests claim). FINDING-36 (b) carried.
- **Consistency and clarity (SR-3, SR-6).** v12 FINDING-44 resolved.
  FINDING-48 (b) to (e) and FINDING-14 (extended) carried.
- **Carried.** FINDING-11, FINDING-12, FINDING-20.

#### schema-migrator v7 (changed)

The H7 confinement is specified, tested and accepted as a criterion, and the
exit table covers it. FINDING-52 (the decision half of check (q), and line
251's sentence) and FINDING-54 (table, flowchart, trace) are new. FINDING-18
labels carried.

#### massive-client v15 (changed: wording only)

Consistent with RC §2.2c. Its remaining "CONST-SEC 1.2" references (lines 220,
235, 666) name the version that added the unchanged text and are accurate.
FINDING-13, FINDING-17, FINDING-18 and FINDING-26 to FINDING-29 carried.

#### ingestion-api v8, market-data-store v9, acquisition-runner v9 (unchanged)

None contradicts the change. IA §4 and MDS §4 cite the exception for the
browser hop and "the application's and ingestion's connections", which RC
§2.8.1 now defines to include the migrator. AR's `ingestion_main` loads
`Settings`, so its client is confined by RC (see the check (q) judgement).
FINDING-48 (f), (g), FINDING-49 (b) and FINDING-51 remain.

#### coverage-service, instrument-list-service, observation-writer, owner-web-app, rate-limit-governor, run-journal (unchanged)

None depends on the changed text. Their carried findings stand as v12
recorded them.

#### Feasibility (SR-7), all components

No circular dependency. The change adds no component and no interface. The
migrator's existing dependency on runtime-config (SM §1) now names the
confinement it uses.

### UX Brief

Unchanged (v7). No user-facing surface changed.

### UX Design Specification

Unchanged (v5). FINDING-8 is carried. A configuration refusal by the migrator
presents as the existing unreachable state, whose copy already names a failed
start as a cause (SM §10).

### Cross-Specification Consistency (SR-3)

- CROSS-SPEC-INCONSISTENCY (FINDING-52): RC line 847 and SM lines 248-251 say
  schema-migrator relies on the exception; DEC-0050's `artifacts` and RC line
  1460's description of it do not include schema-migrator.
- CROSS-SPEC-INCONSISTENCY (FINDING-54 (c)): the H7 element is traced to
  "AC-13, AC-14" in SM §13, "AC-13, AC-16" in SM §7 and "AC-13" in RC §7.
- CROSS-SPEC-INCONSISTENCY (FINDING-49 (b), carried): upgrade manual actions,
  MDS §6 against RC §2.8.4 and SM §6.
- CROSS-SPEC-INCONSISTENCY (FINDING-51 (c), carried): the distribution test,
  IA §7 against RC §7.
- **Consistent:**
  - the client list for H7 across RC §2.3, the RC H7 row, RC criterion 14 and
    SM §2.5;
  - channel (b)'s definition across RC §2.8.1 and SM §2.5;
  - the test-double gate across RC §2.2c, RC §4, RC criterion 10 and MC;
  - the drill and smoke-check project argument across RC §2.8.4, §2.8.5 and
    §7;
  - the four deployment variables across RC §2.2, §2.8.3, §6, §8 and §9.

---

## Findings Summary Table

CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 21 · **total 26**. By origin:

- 4 MEDIUM carried by owner choice (since v5);
- 19 LOW remaining (v5 to v12), two of them partly resolved and two extended;
- 3 new in this round: 1 MEDIUM, 2 LOW.

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-52 | MEDIUM | SR-9 / SR-3 / SR-6 | schema-migrator; runtime-config; DEC-0050 | SM §2.5 lines 248-251, §7 line 359, §12 line 436; RC §2.8.1 lines 846-848, §12 line 1460; DEC-0050 `artifacts` | **New.** Check (q) on CONST-SEC 1.3's exact text. The Statement requires citation "in each design that relies on it" and a decision "whose `artifacts` name those designs". RC and SM both say schema-migrator relies on the exception, and SM specifies and tests H7 for the migrator process, a *Component* of channel (b). The citation half is met in substance (the exact phrase at SM lines 250, 359, 436; channel (b) named), although line 251 says the design "does not cite the exception separately". The decision half is not: DEC-0050 names runtime-config, ingestion-api, market-data-store and the system design only, and the Statement has no reliance-through-another-design route. v12 FINDING-43 offered this route as an alternative; it was insufficient | The Exception Record's consumer search ("its `artifacts` name the designs to re-review") misses a design carrying an H7 test and criterion of its own, so a change to H7 would not route it to re-review. Release security evidence would claim (q) for channel (b) where its decision half is unmet. H1 to H9 still hold, so the channel's coverage is unaffected | Record a decision with `scripts/decisions.py new` whose text contains `SEC-ENC-001 host-local loopback exception` and whose `artifacts` include `component-design-schema-migrator.md` (the tooling cannot amend DEC-0050); correct SM line 251 and RC line 1460 to match. In the same record, decide whether acquisition-runner, which owns channel (c)'s client process but specifies nothing exception-specific, is a relying design |
| FINDING-6 | MEDIUM | SR-5 | Rate-limit governor | §8 AC-1 amendment note | Carried from v5, unchanged by owner choice. `docs/decision-records.md` does not exist in this repository | Readers cannot resolve the normative decision from the project repository | Correct the citation or mirror DEC-0002 |
| FINDING-7 | MEDIUM | SR-2 | Rate-limit governor | §2.5 final paragraph | Carried from v5, unchanged by owner choice. It says all jitter is full jitter, but the boundary wait adds jitter on top | Misdescribes the implemented boundary wait | Specify additive boundary jitter |
| FINDING-8 | MEDIUM | SR-3 | UX design | §6 Source Mapping | Carried from v5, unchanged by owner choice. Stale source versions | Verification points to superseded inputs | Update the three source versions |
| FINDING-9 | MEDIUM | SR-1 | Capability | §8 Readiness Assessment | Carried from v5, unchanged by owner choice. It states 23 ACs and three open questions | The readiness summary misstates coverage | Update the counts |
| FINDING-53 | LOW | SR-2 / SR-7 | runtime-config | RC §2.3 lines 639-640 | **New** (text unchanged since runtime-config v13; v12 did not catch it). "The tests and the E2E stack already connect to `127.0.0.1` or `localhost`, so none of them changes." At `4e75993`, 24 lines in 15 test modules set `FACTORFLOW_DATABASE_URL=postgresql://unused/unused`, whose host `unused` the H7 rule (lines 635-639) refuses without `sslmode=verify-full`. Ten of them load settings with it: six enter the application lifespan through `with TestClient(...)` (`DatabaseSettings()` at `src/factorflow/api/app.py` line 171), and `test_settings_base_url.py` (which asserts the exact `Settings()` message, lines 208-213), `test_massive_tls.py`, `test_ingestion_main.py` and `test_ingestion_e2e_main.py` load `Settings` or call `main()` | A task plan built on the sentence omits ten test modules that fail once the validator lands. No security or behaviour impact, and the validation commands catch it at once | Replace the sentence: the unit tests' placeholder URL changes to a loopback form (for example `postgresql://unused@127.0.0.1/unused`), and name the affected modules for the implementing story |
| FINDING-54 | LOW | SR-1 / SR-6 / SR-5 | schema-migrator | SM §2.3 lines 144-161; §12 lines 435-436; §13 line 446; §7 line 359 | **New**, introduced by v7. (a) §12: the "Runtime Configuration v14" row has four cells and no Link; the CONST-SEC 1.3 row has five, the fifth being runtime-config's path, so the rendered table loses runtime-config's link. (b) §2.3: the H7 gate's "no" branch joins `Z1`, "Exit 1: database unreachable", while §2.5 line 232 says a refusal reports the `ConfigurationError` message before any connection; the overview paragraph (lines 144-153) does not mention the gate. (c) §13 traces the confinement to "AC-13, AC-14"; AC-14 is the owner interface's reachability (capability lines 248-249); SM §7 says "AC-13, AC-16" and RC §7 line 1332 "AC-13" | A broken reference link, a chart that labels a configuration refusal as an outage, and three disagreeing traces for one element. No behaviour change | (a) Restore the Link cell and drop the extra cell. (b) Give the refusal its own exit node and add one sentence to the overview. (c) Trace the element consistently (H7; AC-13, AC-16) and drop AC-14 |
| FINDING-48 | LOW | SR-3 / SR-6 / SR-2 | runtime-config; ingestion-api; market-data-store; system design; acquisition-runner | as listed | Remaining from v12, **partly resolved**: (a), (d) item 4 and (f) for massive-client are fixed. Remaining: (b) RC §12 line 1459 lists a "v1.3 draft ... not in force until reviewed, approved and merged" beside line 1453's 1.3 row; (c) RC §2.2c lines 458-463 describe an IA §4 reading IA v8 withdrew and say 1.2 leaves the database channels open; (d) RC §14 item 6 is headed "Decided" and still says "Open; nothing is decided here", item 7 says the tech stack names no Node version, item 8 keeps "its two-control structure"; (e) RC §4 lists three Restricted values, then says "Both" and "either"; (f) acquisition-runner `ai_provenance.timestamp: 2026-10-12T22:00:00Z` postdates its commit `7628f86` (19:38:22Z); (g) IA line 378, MDS line 572 and SD line 411 say the exception is in force "only once" 1.3 is approved and merged | Readers of the security sections meet superseded status text; one audit timestamp is in the future of its commit. No behaviour changes | Update the remaining sentences and the timestamp at the next revision of each design |
| FINDING-49 | LOW | SR-3 / SR-6 | market-data-store | MDS §6 line 626 | Remaining from v12, **partly resolved**: (a) is fixed (RC §6 and §9). (b) remains: MDS §6 says "Manual actions required: none" for an upgrade, while RC §2.8.4 step 1 and SM §6 require a `pg_dump` first | MDS understates the upgrade procedure | Align MDS §6 with SM §6 |
| FINDING-50 | LOW | SR-9 / SR-2 | runtime-config | RC §2.2c lines 301-302; §2.3 lines 632-635; `config/settings.py` line 23 | Remaining from v12. (a) `ApiSettings` accepts `localhost` as a bind host, while H1 names only `127.0.0.1` and `::1` for a listener. (b) `DatabaseSettings` resolves `localhost` once at load, while H7 asks for every address actually connected to; the design rests (b) on H6. The deployment names `127.0.0.1` for both | A configuration the code accepts can step outside H1 or H7 without a refusal | Accept only the two literals for the API bind (and, if the tests allow, a plaintext database host), or record (b) as an accepted residual |
| FINDING-51 | LOW | SR-4 / SR-1 / SR-3 | ingestion-api; system design | IA §7 lines 446-447; IA §11; SD §4.2 | Remaining from v12. (a) Check (p) asks that every state-changing route reject a foreign `Origin`; the test exercises one of five, and not `Origin: null`. (b) `400 host_not_allowed` and `403 origin_not_allowed` are listed in neither IA §11 nor SD §4.2. (c) IA §7 still says the bundle is "built before `uv build`" where RC §7 writes a stub | Check (p)'s evidence is one route; endpoint contracts omit two responses; two designs describe one test differently | Parametrise the Origin test over the five routes and add `Origin: null`; note the two responses once in IA §11 and SD §4.2; copy RC §7's wording into IA §7 |
| FINDING-36 | LOW | SR-2 | runtime-config | RC §2.8.3 lines 1053-1058 | Remaining from v11, part (b). Healthcheck interval, timeout and retries are "design values" with a rationale but no source AGT-EVIDENCE-002 accepts and no `[REQUIRES INPUT]` marker | Unsourced quantitative values in a governed design | Record the owner's direction for the values, or mark them |
| FINDING-11 | LOW | SR-2 / SR-9 | runtime-config | §2.2c item 2; §7 | Remaining from v6. `localhost` is resolved once at start by the test-double entry point | Residual gap against the test-double exception's condition (2) | Re-check per connection, drop `localhost`, or record the residual |
| FINDING-12 | LOW | SR-4 | runtime-config | §2.2c clause 8; condition table; item 2; §7 | Remaining from v6. A missing control-character row, a missing parser-agreement assertion, and one wrong table reason | Small regressions pass the design's suite | Add the row and assertion, and correct the reason |
| FINDING-13 | LOW | SR-6 | massive-client | §8; §2.2b comment | Remaining from v6, part (b). "guarantees `https`" is not qualified "in the release build" | Overstates a guarantee for non-release builds | Qualify both |
| FINDING-14 | LOW | SR-6 | runtime-config | §3 line 1207; §14 item 3; §2.3 lines 539, 563; §12 line 1457 | Remaining from v6 and v7, **extended**. "Section 2.4a" does not exist; §14 item 3 points to a section 7 test that lives in ingestion-api; §2.3's snippets declare `DatabaseSettings(BaseSettings)` and `MassiveSettings(BaseSettings)`, while §2.2c line 492 and the code use `_EnvNamedSettings`, whose value-free `ConfigurationError` SM §2.5's exit-1 message now depends on; the §12 Decision row stops at DEC-0037 and omits DEC-0038 and DEC-0051 | Readers land on the wrong text; an implementer copying the snippet would lose the value-free error formatting | Fix the pointers, correct the two base classes, and extend the Decision row |
| FINDING-15 | LOW | SR-3 | System design | §4.1 line 300 | Remaining from v6. `massive-client` is described as "Hand-written HTTP client" | Contradicts the SDK-based design | Reword the row |
| FINDING-16 | LOW | SR-4 | Rate-limit governor | §8 AC-11 | Carried from v5. A concurrent-caller criterion under a single-threaded model | Vacuously satisfied | Record it as vacuous, or restate it |
| FINDING-17 | LOW | SR-6 | massive-client | §14 item 2 | Carried from v5. It still claims to block the governor throttle path | Reports a discharged blocker | Mark it resolved |
| FINDING-18 | LOW | SR-3 | System design; component designs; UX artifacts | Frontmatter pins and References tables | Carried from v5, **extended**. SD v8 and MDS v9 pin tech stack v3 (v5 current). AR v9 and MC v15 pin system design v6 and tech stack v3. IA §12 line 551 labels "Runtime Configuration v13" (v14 current). RC and SM §12 label the capability v6, the system design v3 and the UX design v4. `check-artifacts.py` counts 33 system-design pin warnings | Repeated checker warnings and stale labels; content impact assessed as none | Propagate current versions when each design is next revised |
| FINDING-20 | LOW | SR-2 / SR-4 | runtime-config | §7; §14 item 3 | Remaining from v7. Two test rows contradict on `e2e-test-key`, and DEC-0040 settles it at story level only | `$test-design` meets the contradiction | Align RC §7 with DEC-0040 |
| FINDING-26 | LOW | SR-2 / SR-6 | massive-client | §2.4 | Remaining from v9. It says the corporate-action reads, plural, depend on `VXClient`; only the IPO read does | Self-contradiction with §2.2b and §7 | Reword as v9 recommended |
| FINDING-27 | LOW | SR-4 / SR-6 / SR-7 | massive-client | §7 redirect row | Remaining from v9. The injected-`monotonic` alternative does not require the injected `sleep` to advance it | A literal reading yields a test that hangs | Name the `FakeClock` and `FakeSleeper` coupling, or drop the alternative |
| FINDING-28 | LOW | SR-5 | massive-client | §12 Review rows | Remaining from v9. No §12 row for specification review v8 | v8's evidence cannot be found from the design | Add the row |
| FINDING-29 | LOW | SR-2 | massive-client | §5 | Remaining from v10. "Up to four reads per instrument ... 12000 requests"; §2.5 and §11 give nine first-page requests per instrument, about 27000 | Run-duration expectations about 2.25 times too short | Restate as nine first-page requests, about 27000 plus pages |
| FINDING-30 | LOW | SR-6 / SR-5 | Capability; system design; massive-client | Capability AC-3; massive-client §2.5 | Remaining from v10. The definition of "company fundamentals" (three statements, no ratios) lives only in two component designs | A later reader can reintroduce ratios under AC-3 | Record it in the capability or a decision record |

---

## Traceability Matrix

| Layer | Coverage | Evidence |
|-------|----------|----------|
| Capability to system design | 26/26 | System design §7 (unchanged) |
| Capability to UX design | 26/26 | UX design §5 (unchanged) |
| Capability to component designs | 26/26 | Every AC still referenced; SM §13 adds an H7 row whose AC-14 trace is wrong (FINDING-54 (c)) |
| System components to component designs | 12/12 | One design per component; `build-architecture.py` PASSED |

Changed design elements:

| Design element | Capability AC | Constitution or decision | Release blocker | Component AC or test |
|---|---|---|---|---|
| SM §2.5 migrator URL confinement | AC-13, AC-16 | H7, check (n); DEC-0050 (FINDING-52) | release security evidence | SM §8 criterion 10; `test_migrate_main_confinement.py` |
| RC §2.3 client list; RC H7 row; RC §8 criterion 14 | AC-13, AC-16 | H7 | release security evidence | `test_database_url_confinement.py`; `test_migrate_main_confinement.py` |
| RC §2.8.1 channel (b) includes the migrator | AC-13, AC-14 | CONST-SEC 1.3 host-local exception; DEC-0050 | release security evidence | per check (CONST-SEC table) |
| RC §2.8.2 `uv export --locked` | AC-15, AC-16 | OQ-TS-5; SEC-NDG-001 | B1, B3 | RC §7 Dockerfile row |
| RC §2.8.3, §6, §9 password floor and generation statement | AC-13 | H4, check (k) | B4 | release evidence |
| RC §2.8.5 project argument, method allow-list, network-change trigger | AC-14, AC-15, AC-18 | H4, H8; OPS-ERR-001 | B1, B3, B4 | the smoke check |
| RC §2.8.4 drill under the exception | AC-15, AC-16 | OPS-MIG-003; H6, H8 | B5 | RC §7 drill row |
| RC §2.2c gate names 1.3; MC wording | AC-13 | CONST-SEC 1.3 test-double exception; DEC-0036, DEC-0051 | n/a | existing §7 rows |

---

## Pipeline Readiness Assessment

**Verdict:** READY

There are no CRITICAL and no HIGH findings. v12's only HIGH, FINDING-43, is
resolved: every database client the product runs, the migrator included, now
loads its URL through `DatabaseSettings` before connecting. The migrator's
confinement is tested and accepted as a criterion, and channel (b) meets H1 to
H9 as specified. v12's four MEDIUM findings on the change are resolved and
were verified against code and tools.

**The high-risk lane's specification-review requirement is met by this
verdict.** Clearing the lane still needs the owner's approval of each changed
revision against this report.

The five MEDIUM findings do not block READY under the rubric:

- **FINDING-52** is the one the owner should act on before or with approval,
  because it touches the exception's evidence on this lane. One decision
  record discharges it and changes no behaviour.
- FINDING-6 to FINDING-9 are carried by the owner's choice since v5.

The 21 LOW findings are editorial, traceability or residual items. FINDING-53
is worth folding into the implementing story's plan.

The rubric defines readiness as this verdict and no numeric score, so none is
given.

**This verdict is review evidence, not approval.**

- The three changed subjects are runtime-config v14, schema-migrator v7 and
  massive-client v15. Each keeps `status: approved` with an approval block
  that does not cover its current revision, so each is unapproved at that
  revision.
- Every subject whose approval block names a review that does not cover its
  current revision stays blocked from epic generation and test design until
  the owner explicitly approves that revision against this report. Per
  `pipeline-state.py`, that is the case for the system design,
  acquisition-runner, ingestion-api, market-data-store, massive-client,
  runtime-config and schema-migrator.
- All seven already carry an approval block, and `artifact-gate.py approve`
  records only a first approval: per `docs/approval-gates.md` (*Re-approving
  an already-approved artifact*), re-approval is the owner's direct edit of
  the existing block. `approved_at` must be later than this report's
  timestamp; `review_artifact` becomes
  `docs/capabilities/CAP-001-market-data-acquisition-foundation/specifications-review-report-v13.md`;
  and `reviewed_revision` moves to the revision printed by
  `artifact-gate.py revision`, for the subjects whose content changed.
- The other subjects keep their existing approvals, because their approval
  blocks still cover their current revisions.
- This review ran no approval.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

None.

### Should Fix (MEDIUM findings)

1. **FINDING-52.** Record a decision naming schema-migrator among the
   designs relying on the host-local exception (and settle acquisition-runner
   in the same record); correct SM line 251 and RC line 1460.
2. FINDING-6 to FINDING-9: the carried v5 items, held by owner choice.

### Nice to Have (LOW findings)

3. FINDING-53 and FINDING-54: small edits; FINDING-53 also belongs in the
   implementing story's task plan.
4. FINDING-48 to FINDING-51, FINDING-14 and FINDING-18: fold into the next
   revision of each design.
5. FINDING-36 (b), FINDING-11 to FINDING-13, FINDING-15 to FINDING-17,
   FINDING-20 and FINDING-26 to FINDING-30: unchanged residuals.

---

## Observations Outside the Review Subjects

These are not findings against the specifications.

- **Tech stack v5's approval is still stale (owner action).**
  `artifact-gate.py check` on `docs/constitution/tech-stack.md`: approval for
  `sha256:46408823...`, current revision `sha256:cf11e1b4...`. Review-exempt;
  re-approved through `$tech-stack`.
- **DEC-0050 and DEC-0051 read `owner_reviewed: false`, `status: open`.** Both
  are `decided_by: owner`. FINDING-52's new record would naturally be reviewed
  with them.
- **The implementation does not yet match the designs** at `4e75993`:
  `migrate_main.py` reads the URL from the environment (line 168) and
  `_MIGRATIONS_DIR` resolves `parents[3]`; there is no `compose.yaml`,
  `.dockerignore` or `scripts/deploy-smoke.sh`; the H9 middleware is absent;
  the H7 validator is not in `settings.py`. This is follow-up work after
  approval, on the high-risk lane.
- **Password change procedure (RC §2.8.3 lines 1016-1020).** `ALTER ROLE ...
  PASSWORD '<new>'` sends the new password as SQL text over the container's
  local socket and puts it in the host's process arguments and shell history.
  CONST-SEC 1.3 leaves Unix-socket channels undecided, so this is not raised
  as a finding; psql's `\password` sends a SCRAM verifier instead, if the
  owner wants the stronger form.
- **Plaintext loopback channels in tests and CI** (carried from v12): the E2E
  stacks' browser-to-API channels, the main E2E database channel (the
  constitution owner's open question (iii)), and the testcontainers database
  remain without stated standing.
- **SEC-DEP-001 for the image** (carried): floating base-image tags and no
  container scan.
- **Downstream pins.** Epics, stories, task plans, test specifications and
  `docs/changes/EXP-*` records pin superseded design versions
  (`check-artifacts.py` warnings), bookkeeping for the downstream skills once
  the designs are approved.

## Unattended-Run Record

This run was delegated by a parent agent with no interactive input tool.
Nobody could be asked.

- **Prerequisites passed** (exit 0). No deviation.
- **Interpretation recorded: proceeding past `AWAITING-APPROVAL`.**
  - The state check exited 1 because no approval is backed by a review
    covering the current revisions.
  - The task directing this run asked for exactly that review, and an owner
    approval cannot pass the gate without one.
  - v10 to v12 proceeded the same way in the same state.
- **No decision record was written.** This run's only permitted write is this
  report. FINDING-52 recommends a record; creating it is the owner's act.
- **Severity judgements made from the artifacts.**
  - **FINDING-52 is MEDIUM.** It is an unmet MUST of the exception's consumer
    obligations, verified by check (q), on a Critical invariant. But coverage
    rests on H1 to H9, which hold, and the gap is a registration list that one
    record fixes. The rubric places a choice that is recorded, but recorded
    incompletely, at MEDIUM unless the capability cannot be implemented
    without it, and it can.
  - **FINDING-53 is LOW.** The false sentence understates the implementing
    story's test changes. The validation commands expose it immediately, and
    it has no security or behaviour effect.
  - **FINDING-43 is resolved, not partly resolved.** Its defect was H7
    failing for channel (b). That is fixed in design, test and criterion. The
    registration point is carried separately so its severity is judged on its
    own.
- **Not determined.**
  - Docker-dependent behaviour: compose rendering of the changed text, the
    `pg_hba.conf` contents of a fresh `postgres:16` volume with the stated
    `POSTGRES_INITDB_ARGS`, and the drill. There is no Docker daemon in this
    session. The compose YAML is unchanged from what v12 rendered.
  - The libpq version in the manylinux `psycopg-binary` 3.3.5 wheel (no
    package-index access).
- **No question for the owner was needed to reach the verdict.** The one
  owner choice FINDING-52 raises (acquisition-runner) does not affect it.
