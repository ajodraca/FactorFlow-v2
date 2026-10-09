---
artifact_schema_version: 1
artifact_id: CAP-001-specification-review
artifact_type: specification-review
artifact_version: 6
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-09
updated: 2026-10-09
document: spec-review-report
capability: CAP-001
version: v6
generated: 2026-10-09T15:41:10Z
constitutions_reviewed:
  - "CONST-AGT  docs/constitutions/agent-governance.constitution.md (2.3)"
  - "CONST-MDL  docs/constitutions/model-management.constitution.md (1.3)"
  - "CONST-OPS  docs/constitutions/operational-safety.constitution.md (1.3)"
  - "CONST-REV  docs/constitutions/review.constitution.md (1.4)"
  - "CONST-SA   docs/constitutions/static-analysis.constitution.md (2.0)"
  - "CONST-SEC  docs/constitutions/security.constitution.md (1.1 in force on the harness default branch; 1.2 as reworked in 552fb59, unmerged and unapproved, read for clause 2a)"
  - "CONST-VER  docs/constitutions/verification.constitution.md (1.2)"
mechanical_checks:
  - script: check-capabilities.py
    outcome: run
    result: "PASSED, exit 0 (-r worktree): 1 capability, 3 edges, 1 standard, 1 conformance claim"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0 (scratch shim mapping the project repo to the worktree): 1 design, 12 components, 16 interfaces"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 97 warnings, exit 0 (-r worktree --strict); no error"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0: 999 references across 185 harness Markdown files (does not scan the project repo)"
  - script: check-constitutions.py
    outcome: run
    result: "PASSED, exit 0: 10 constitutions, 36 skills"
dimension_status:
  SR-1: applied
  SR-2: applied
  SR-3: applied
  SR-4: applied
  SR-5: applied
  SR-6: applied
  SR-7: applied
  SR-8: applied
  SR-9: "applied — dependency and STD-UI conformance halves by check-capabilities.py; org-constitution dependency (CONST-SEC 1.1 and 1.2) by hand, because the checker does not read org constitutions"
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
    artifact_version: 6
    content_revision: sha256:62a3a399a3315ccd3ee1a2d40d9b277ae7a3c5dc6baf9bad3eeca67399cdf688
  - artifact_id: CAP-001-ux-brief
    artifact_version: 7
    content_revision: sha256:b657501bed0da0852bf88b4a0537776c84a23c916bd967fb3917a80fc314c984
  - artifact_id: CAP-001-ux-design
    artifact_version: 5
    content_revision: sha256:8bb4b6a479dab7efbbce9fd7962574f134aaa8e834fd5250053f085f764b082f
  - artifact_id: CAP-001-component-design-acquisition-runner
    artifact_version: 7
    content_revision: sha256:87a130bc8f229715adf20082b54654f479f3438ff339d06ad5564dd6532059a6
  - artifact_id: CAP-001-component-design-coverage-service
    artifact_version: 6
    content_revision: sha256:e87b0e8f2464ef85bf7f319c615b338e4f75e7360f4566f142968d5e9f0cec71
  - artifact_id: CAP-001-component-design-ingestion-api
    artifact_version: 6
    content_revision: sha256:5fb48327ab7a372e262486ea291f2a67744b44ac75bf228e165b2cc68fe693f2
  - artifact_id: CAP-001-component-design-instrument-list-service
    artifact_version: 6
    content_revision: sha256:05c192e26cf1c7c5343dd83bf9d1b29d0e1b91ffd1da181d5aeed4b3051635df
  - artifact_id: CAP-001-component-design-market-data-store
    artifact_version: 6
    content_revision: sha256:2f1c55747db5ed2faa6f977a7e2a8523f9f55cc1248caebf3fd2457b5394703e
  - artifact_id: CAP-001-component-design-massive-client
    artifact_version: 10
    content_revision: sha256:a55cacf642757457c35bd5c4e28b5ad144f5b7024e3e2b69050858985b03075b
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
    artifact_version: 10
    content_revision: sha256:455a0eb40110261cdf13f19f3c7125c8236013f8ed23c0529a9cd58f0299f437
  - artifact_id: CAP-001-component-design-schema-migrator
    artifact_version: 4
    content_revision: sha256:e877f0c46d6ca6c2f07f736212ccd00693c2c478fefbfbde5608e7af7ac3efa3
statistics:
  total_findings: 18
  critical: 0
  high: 2
  medium: 7
  low: 9
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.295"
  timestamp: 2026-10-09T15:41:10Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "6"
    - id: CAP-001-ux-brief
      version: "7"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-component-design-acquisition-runner
      version: "7"
    - id: CAP-001-component-design-coverage-service
      version: "6"
    - id: CAP-001-component-design-ingestion-api
      version: "6"
    - id: CAP-001-component-design-instrument-list-service
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-massive-client
      version: "10"
    - id: CAP-001-component-design-observation-writer
      version: "4"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: CAP-001-component-design-rate-limit-governor
      version: "8"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-runtime-config
      version: "10"
    - id: CAP-001-component-design-schema-migrator
      version: "4"
    - id: CONST-SEC
      version: "1.2 (harness commit 552fb59, content revision sha256:317180b394711a35403f4f8a74317453d9604211f44f7405b2c7f6caed39395b; unmerged)"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Specification Review Report -- CAP-001

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-001 Market Data Acquisition Foundation |
| **Version** | v6 |
| **Specifications Reviewed** | Capability, system design, UX brief, UX design, 12 component designs (full set; two changed since v5) |
| **Total Findings** | 18 (0 CRITICAL, 2 HIGH, 7 MEDIUM, 9 LOW) |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

Two component designs changed since the v5 review (`git diff d64fe2c..b0dee71`):
`component-design-runtime-config.md` v6 to v10 and
`component-design-massive-client.md` v7 to v10. They make
`FACTORFLOW_MASSIVE_BASE_URL` honoured (`base=settings.base_url`) and validated
(`https` only, nine clauses), refuse every redirect, and specify a loopback
`http` allowance (clause 2a) that is conditional on the Security Constitution
version 1.2 and confined to a test-only entry point.

The in-force half of the change is sound. The validator snippet reproduces all
33 outcomes its own table states. A probe against the locked SDK (massive 2.8.0,
urllib3 2.7.0) confirms three claims: `retries=0` refuses a redirect on both
connection pools, the default `retries` follows one, and `base` reaches the
`vx` sub-client. A wheel built from `src/` contains no file under `tests/`. The
release behaviour conforms to CONST-SEC 1.1, the version in force: TLS with
certificate verification, no environment switch for plain HTTP, and messages
that never echo the value.

The conditional half is mostly handled correctly. Clause 2a is fully specified
and marked "must not be implemented" until 1.2 is in force. `MassiveSettings` in
`src/` stays `https`-only regardless, so nothing ships dormant. Three gaps
remain. The in-force trigger is a merge, but the constitution's own record says
the text stands only after the owner approves it following re-review, and the
designs do not pin which 1.2 text they were mapped against (FINDING-3). The
redirect unit test uses the same plain-HTTP loopback channel without being
gated or justified (FINDING-4). The interim state of the E2E script is
unspecified (FINDING-10).

Two HIGH findings are pre-existing content that the change brings into scope.
First, the standing under SEC-ENC-001 of the product's host-local plaintext
channels. `ingestion-api` §4 asserts that loopback disengages SEC-ENC-001, and
the database channel is never analysed. No constitution text supports the first
reading, and CONST-SEC 1.2's own Exception Record calls it unsettled
(FINDING-1). Second, the Massive ratios contract in `massive-client` §2.5 and
§11 contradicts the locked SDK. The design cites the expedited review item
(ER-004) that required its correction but does not make it (FINDING-2).

The four MEDIUM and three LOW findings carried from v5 are unchanged.

## Review Scope

**Full-set review, with depth proportional to change.** The skill defines no
delta mode: Step 1 requires every discovered specification to be read in full,
and the rubric's verdict applies to the set. A two-file review could also not
assess the change. Its correctness depends on unchanged artifacts:
`ingestion-api` §4's loopback reading, `acquisition-runner` owning
`ingestion_main.py`, system design §4.1 and §4.2, and `market-data-store`'s
fundamentals shape.

- **Changed subjects** (`runtime-config` v10, `massive-client` v10): reviewed
  line by line against the capability, the system design, the other component
  designs, CONST-SEC 1.1 and 1.2, DEC-0025 and DEC-0031 to DEC-0034, the real
  code in the worktree, and fresh execution evidence (see Supplementary
  Evidence).
- **Unchanged subjects** (14): each revision was recomputed with
  `artifact-gate.py revision` and equals the revision v5 recorded, so the
  content v5 reviewed is the content here. Each was read in full again, for its
  interaction with the change and to re-verify the v5 findings carried forward.
  v5's assessment of content the change does not touch was not re-derived from
  first principles. Where re-reading found a pre-existing defect, it is
  reported (FINDING-1, FINDING-2, FINDING-14, FINDING-15).
- **Approval binding.** All 16 subjects are listed in `review_subjects` at
  their current revisions. Under `docs/approval-gates.md` ("When a newer review
  supersedes an older one"), the approval pointers of the 14 unchanged subjects
  still stand, because this report affirms the same revision. Only the two
  changed designs need the owner's approval against this report.
- **Not subjects:** `epics/`, stories, task plans and test specifications.
  Decision records, the Security Constitution and its reviews are governing
  inputs, not subjects.
- **Repository source.** Every project-repo read and check used the worktree
  `usr/alvaro-de-jodra/CAP-001-stories` at `b0dee71`. The clone at
  `repos/factorflow-v2` (`/home/user/factorflow-v2`) was not read. The two
  scripts that take no repo-dir option ran through a scratch directory mapping
  `repos/factorflow-v2/FactorFlow-v2` to the worktree.

**Pipeline state.** `pipeline-state.py check --stage specification-review`
reported `AWAITING-APPROVAL`, exit 1, because v5 is a passing review while the
two designs are `draft` with no approval. `artifact-gate.py check` on each
reports "approval is stale; reviewed nothing". No review covers their current
revisions, so the owner cannot approve them: `approve` refuses a review that
omits the artifact or names a stale revision. This review is the owner-directed
refinement that makes approval possible. It writes evidence and approves
nothing.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All template sections present in both changed designs; no new diagram (none needs a narrative). FINDING-5 (an interface change with no owning-component entry) and FINDING-10 (interim state unspecified) |
| SR-2 Correctness | applied | All 33 rows of runtime-config §2.2c's table reproduced from its snippet; the redirect, `base` and TLS claims re-executed against the locked SDK. FINDING-2, FINDING-11, FINDING-13 |
| SR-3 Consistency | applied | Changed designs checked against the system design, all 10 other component designs, the UX artifacts, DEC-0025/0031-0034 and CONST-SEC. FINDING-1, FINDING-5, FINDING-15, FINDING-18 |
| SR-4 Testability | applied | Every new rule mapped to a §7 test row (Stage 1 table). FINDING-4, FINDING-12, FINDING-13 |
| SR-5 Traceability | applied | New design elements trace to AC-13 and AC-16; 26/26 capability ACs still mapped. FINDING-2 (cited review item not carried through) |
| SR-6 Clarity | applied | FINDING-3, FINDING-14, FINDING-17 |
| SR-7 Feasibility | applied | Against `src/factorflow/config/settings.py`, `src/factorflow/ingestion_main.py`, `src/factorflow/ingestion/runner.py`, the `Dockerfile`, `pyproject.toml`, `scripts/run-e2e-server.sh`, `tests/e2e/support/massive_stub.py`, and the SDK and urllib3 sources pinned by `uv.lock`. The dependency graph stays acyclic. FINDING-10 |
| SR-8 UX Completeness | applied | UX brief and UX design unchanged (digest-identical to v5) and re-read; the change has no UX surface. Design system available: all 10 referenced component specs exist under `design-system/components/`; every real token named in `ux-design.md` is defined in `design-system/theme.css` (the only unresolved strings are `--success`, `--warning` and `--info`, which §3 cites as the stale names it corrected) |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` passed with no error or warning; STD-UI conformance unchanged. The CONST-SEC dependency was assessed by hand. FINDING-1, FINDING-3, FINDING-4 |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passed (12 components, 16 interfaces); the change introduces no component and no capability-as-actor |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2 -r <worktree>` | run, exit 0: "1 capabilities, 3 edges, 1 standard(s), 1 conformance claim(s), 1 constitution artifact(s), 1 reference(s) ... PASSED" | none. The checker does not read org constitutions, so the CONST-SEC dependency is outside its reach |
| `build-architecture.py -p factorflow-v2` (scratch shim, project repo mapped to the worktree) | run, exit 0: "1 design(s), 12 component(s), 16 interface(s) PASSED" | none |
| `check-artifacts.py -p factorflow-v2 -r <worktree> --strict` | run, exit 0: "PASSED with 97 warning(s)", no error | Only one warning class touches the changed designs: both pin tech-stack v3 while v4 is current (FINDING-18). Eight task plans pin `massive-client` v7 or `runtime-config` v6 (Observations). The remainder are pre-existing legacy-format implementation reviews and story/epic pins outside this review's subjects |
| `check-references.py` | run, exit 0: "999 path references across 185 Markdown files ... PASSED" | none. It scans harness Markdown only; it excludes `repos/`. The changed designs' project-repo references were checked by hand: all resolve, except files the designs declare as planned (`tests/e2e/support/ingestion_e2e_main.py`, `tests/unit/test_settings_base_url.py`, `tests/unit/test_ingestion_e2e_main.py`, `tests/unit/test_release_excludes_test_paths.py`, `tests/unit/test_massive_redirects.py`, `tests/unit/test_massive_tls.py`) and two internal section references (FINDING-14). `docs/changes/EXP-20261009-1-review-v1.md` resolves at commit `1d12e67`, as both designs state |
| `check-constitutions.py` | run, exit 0: "10 constitutions, 36 skills PASSED" | none |

Prerequisites: `check-prerequisites.sh --project factorflow-v2` (scratch shim,
project repo mapped to the worktree) exited 0, with every row PASSED.
`design_system_available = true` (`projects/factorflow-v2/design-system.yaml`;
all four paths exist in the worktree).

### Supplementary evidence (fresh, this session)

Scripts are in the session scratchpad (`v6probe/scripts/`). They use only
loopback listeners and a dummy key, and they write nothing to the worktree.

| Probe | Command and result |
|-------|--------------------|
| Redirect refusal on the locked SDK | `redirect_probe.py` with massive 2.8.0, urllib3 2.7.0, certifi 2026.7.22 and websockets 17.1, the `uv.lock` versions loaded from the uv cache. Results: `retries=0` on the main client gave `MaxRetryError(ResponseError)`, 0 hits on the redirect target. `retries=0` on `vx` gave the same, 0 hits. `retries=3` followed the redirect, 1 hit on the target. A `Location` naming 198.51.100.7 produced no connection attempt. Both pools report `cert_reqs=CERT_REQUIRED` and `retries.total=0`. `BASE == vx.BASE ==` the configured value. Mechanism: urllib3 2.7.0 `poolmanager.py` lines 473-495 fall back to `response.retries`, which is the SDK's `Retry(total=0)` from `massive/rest/base.py` lines 57-83 |
| Base URL validator table | `base_url_table.py` transcribes runtime-config §2.2c's snippet (lines 428-452), with clause 2a as a flag. 33 rows evaluated, 0 mismatches against the table's accept and reject outcomes, for both the release settings and the clause 2a wrapper (Python 3.13 `urlsplit`) |
| Parser agreement (§2.2c item 2) | `parse_agree.py`: `urlsplit(...).hostname` and urllib3 `parse_url(...).host` agree, modulo IPv6 brackets, for every accepted value including the three loopback forms |
| Release artifact (DEC-0034) | `uv build --wheel --offline` from a scratch copy of `pyproject.toml`, `uv.lock` and `src/` produced `factorflow-0.1.0-py3-none-any.whl`: 56 files, top level `factorflow` and `factorflow-0.1.0.dist-info`, 0 entries under `tests/`. The `Dockerfile` copies only `pyproject.toml uv.lock`, `src` and `migrations`. No module under `src/` imports from `tests` |
| Ratios signature (FINDING-2) | `ratios_sig.py`: `list_financials_balance_sheets` accepts `tickers` and `period_end_gte`; `list_financials_ratios` accepts neither (`ticker` only). Binding `tickers=..., period_end_gte=...` raises `TypeError: got an unexpected keyword argument 'tickers'`. `FinancialRatio` carries `ticker` and `date`, not `period_end`, `filing_date`, `fiscal_year` or `timeframe` |
| Constitution in force | `git show origin/main:docs/constitutions/security.constitution.md` gives `version: 1.1`. `552fb59` is not an ancestor of `origin/main` (`bf7466f`). The 1.2 content revision is `sha256:317180b394711a35403f4f8a74317453d9604211f44f7405b2c7f6caed39395b` |

## Constitutions Applied

All seven constitutions the relevance matrix assigns `specification-review`
were read.

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | AGT-PROV-001: the changed designs carry provenance, a version bump on modification (7 to 10, 6 to 10) and the shared correlation ID. Their `source_artifacts` omit CONST-SEC 1.2, on which clause 2a depends (FINDING-3). AGT-SPEC-002: the security confinement choices (DEC-0033, DEC-0034) are agent decisions marked PROVISIONAL and surfaced for owner review in runtime-config §14 item 4, not taken silently. AGT-AUTH-001: this review approves nothing. AGT-EVIDENCE-001: claims below cite file and line |
| CONST-MDL 1.3 | Exact model identifier `claude-opus-5-5` recorded |
| CONST-OPS 1.3 | Probes used loopback listeners and scratch directories only; the wheel was built from a copy so the worktree stayed clean. OPS-ERR-001: the new refusal paths end the process non-zero (`ingestion_main.main` returns 1 on `ConfigurationError`; a raised refusal propagates out of `run_polling_loop`, which catches nothing, `runner.py` lines 381-405) |
| CONST-REV 1.4 | REV-STG-001: Stage 1 (specification compliance) and Stage 2 (artifact quality) are reported separately below. REV-RCV-001: the designs' own probe claim and the constitution reviews' conclusions were re-verified rather than accepted |
| CONST-SA 2.0 | SA-MD-001: template conformance passes (`check-artifacts.py`). SA-MD-002: two dangling internal references in runtime-config (FINDING-14) |
| CONST-SEC | **1.1, in force** (harness default branch), applied to all release behaviour. Conforms: SEC-ENC-001 (`https` only, `CERT_REQUIRED`, redirects refused); SEC-NDG-001 (no configuration value, flag or variable enables `http`); SEC-INP-001 (nine-clause validation); SEC-ERR-001 and AC-13 (messages name the variable and clause, never the value, `settings.py` line 58 `include_input=False`). **1.2 as reworked in `552fb59`**, unmerged and unapproved, applied to clause 2a as a conditional specification only. Clause 2a meets conditions (1) to (4), in agreement with CONST-SEC review v2's CR-5 table. Gaps: FINDING-3, FINDING-4, FINDING-11. Host-local plaintext channels outside the exception: FINDING-1 |
| CONST-VER 1.2 | VER-EVD-001: every verdict rests on commands run in this session. VER-EVD-004: per-rule verdicts are in the Stage 1 table. VER-DEL-001: the design's "probe on 2026-10-09" claim was re-executed independently, not accepted |

## Constitution Dependency: CONST-SEC 1.2

The parent direction asked whether the dependency on an unmerged, unapproved
constitution version is handled correctly. The facts are these:

- The harness default branch carries CONST-SEC **1.1**, whose SEC-ENC-001 has
  no loopback exception.
- Version 1.2 exists only on `claude/loving-lovelace-kss3am`: first text
  `64f61f8`, reworked `552fb59`. Its frontmatter says `status: Active`. Its
  Exception Record says "The owner has not yet reviewed the final text, and it
  stands as the owner's decision only once the owner approves it after
  re-review."
- A re-review, `docs/constitutions/reviews/security-review-v2.md` (`7b0e1e9`,
  2026-10-09T15:27:41Z), landed during this review. Its verdict is
  READY-WITH-WARNINGS with 1 HIGH, 5 MEDIUM and 4 LOW findings, and it
  recommends further text changes. Among them: condition (2) "must not follow
  any redirect" (its FINDING-21), condition (4) wording (FINDING-23), a
  SEC-SEC-001 carve-out for designated test credentials (FINDING-18), and one
  standing trigger (FINDING-16).

| Requirement for handling the dependency | Assessment |
|---|---|
| In-force behaviour must not rely on the unapproved text | **Met.** `MassiveSettings` in `src/` stays `https`-only, with no setting, flag, constant or variable for `http` (runtime-config §2.2c item 1, lines 350-353; snippet lines 438-439). The release-settings test row says it "does not change when clause 2a takes effect" (§7 line 778) |
| Conditional text must be clearly marked and not implementable early | **Met.** "Until then it is specified but must not be implemented, and an `http` value fails start whatever its host" (§2.2c lines 305-311); §14 item 4 lists what the change unblocks |
| Nothing dormant ships in the release artifact | **Met**, by design and by evidence. The allowance lives only in `tests/e2e/support/ingestion_e2e_main.py`; the built wheel holds nothing under `tests/` |
| The trigger and the governing text are unambiguous | **Not met** (FINDING-3). The trigger is "merged to the harness default branch", but the constitution makes approval after re-review the condition. "CONST-SEC 1.2" has already named two texts, and the re-review recommends a third. Neither the design text nor `source_artifacts` pins the revision the condition table (§2.2c lines 298-303) was mapped against |
| Every plain-HTTP channel the designs require is covered | **Not met** (FINDING-4). The `massive-client` redirect test needs a plain-HTTP loopback channel but is not gated on 1.2 and states no basis under 1.1 |
| The interim state is specified | **Partly** (FINDING-10). `scripts/run-e2e-server.sh` will start an ingestion process that fails at start once the `https`-only rule ships, and nothing says so |
| Owner actions are recorded | **Met.** §14 item 4 (re-review, approval, DEC-0033 and DEC-0034 owner review, DEC-0031 still open) and items 5 and 6 |

## Stage 1 — Specification Compliance of the Change

One verdict per new or changed rule (VER-EVD-004). "PASS" means the rule is
consistent with its governing source, has a test row, and is feasible against
the code. A finding reference means the rule passes with the stated gap.

| Rule | Location | Governing source | Test row (§7) | Fresh evidence | Verdict |
|------|----------|------------------|---------------|----------------|---------|
| Clause 1: unset means `https://api.massive.com` | RC §2.2c line 249 | massive-client §2.6 (probe 2026-09-05) | "Base URL default is the governed host" | table row 1 | PASS |
| Clause 2: `https` only, scheme compared without case | RC line 250 | SEC-ENC-001 (1.1) | non-`https` and accepted rows | table rows 3, 6, 18, 19 | PASS |
| Clause 3: host present | RC line 251 | DEC-0032 | malformed row | table rows 20-22 | PASS |
| Clause 4: no userinfo | RC line 252 | DEC-0032, SEC-SEC-001 | malformed row; disclosure row (`s3cret`) | table row 23 | PASS |
| Clause 5: port 1-65535 | RC lines 253-254 | DEC-0032 | malformed row | table rows 4, 24-26 | PASS |
| Clause 6: path empty or `/`, trailing `/` removed | RC lines 255-259 | `massive/rest/base.py` `self.BASE + path` | accepted row; massive-client "no double slash" row | table rows 2, 27-28 | PASS |
| Clause 7: no query or fragment | RC line 260 | DEC-0032 | malformed row | table rows 29-30 | PASS |
| Clause 8: no empty value, whitespace or control characters | RC lines 261-264 | DEC-0032 | malformed row (empty, leading space only) | table rows 31-32; control character tested ad hoc | PASS, FINDING-12 |
| Clause 9: message names variable and clause, never the value | RC lines 265-268 | AC-13, SEC-ERR-001 | "A base URL failure discloses no value" | `settings.py` line 58 | PASS, FINDING-12 |
| Clause 2a host set | RC lines 276-284 | CONST-SEC 1.2 condition (1) | `test_ingestion_e2e_main.py` rows | table, 2a column | PASS (conditional) |
| 2a item 1: `src` stays `https`-only | RC lines 350-353 | SEC-NDG-001 (1.1 and 1.2) | "Loopback `http` fails start in the release settings" | snippet | PASS |
| 2a item 2: `localhost` resolves only to loopback | RC lines 357-364 | condition (2) | "`localhost` must resolve only to loopback" | `parse_agree.py` | PASS (conditional), FINDING-11 |
| 2a item 3: dummy key at start and at every claim | RC lines 365-375 | condition (3) | two refusal rows | `ingestion_main.py` line 95 is the re-read seam; `runner.py` lines 381-405 propagate a raise | PASS (conditional), FINDING-3 (SEC-SEC-001 carve-out pending) |
| 2a item 4: `ingestion_main.main` gains two keyword-only parameters | RC lines 376-381 | SEC-NDG-001 | indirect only | `ingestion_main.py` lines 49-124 | PASS (feasible), FINDING-5 |
| 2a item 5: E2E script starts ingestion through the test entry point | RC lines 382-384 | DEC-0025 | none | `run-e2e-server.sh` line 145 | PASS (conditional), FINDING-10 |
| 2a item 6, and massive-client "No redirect is ever followed" | RC lines 385-390; MC lines 196-210, 619-622 | condition (2) | `test_massive_redirects.py` row | redirect probe | PASS, FINDING-4, FINDING-13 |
| Release artifact is the `src/` distribution; production runs only from an image that installs it | RC lines 313-345 | 1.2 Definitions; DEC-0034 | `test_release_excludes_test_paths.py` row | wheel build; `Dockerfile` | PASS. Production ingestion launch is the owner's open §14 item 5 |
| `base=settings.base_url` mandatory; `vx` inherits | MC lines 163, 222-241 | ER-001, ER-002 | "The configured base URL is passed to the SDK" | probe `BASE == vx.BASE` | PASS |
| TLS verification never disabled; default base `https` | MC lines 601-608, 735-736 | SEC-ENC-001 | TLS and default-base rows | probe `CERT_REQUIRED` on both pools | PASS, FINDING-13 |
| Component AC-10 and AC-11 (RC); AC-13 (MC) | RC lines 814-821; MC lines 767-769 | AC-13, AC-16 | rows above; `test_ingestion_main.py` row (AC-16) | n/a | PASS, FINDING-13 |
| Clause 2a gated on CONST-SEC 1.2 | RC lines 305-311; MC lines 231-235 | CONST-SEC 1.1 in force | n/a | `origin/main` at 1.1 | PASS, FINDING-3 |

`RC` is `component-design-runtime-config.md`; `MC` is
`component-design-massive-client.md`. Line numbers refer to `b0dee71`.

## Stage 2 — Artifact Quality of the Change

- **Contract.** Both designs pass `check-artifacts.py --strict`. Their
  versions are bumped, they are `status: draft`, stale approval blocks are
  removed, provenance is refreshed and the correlation ID is unchanged.
- **Structure.** All 14 template sections are present in each design. No
  diagram was added, so no new narrative overview is owed.
- **Cross-references.** All new references resolve: `_LOOPBACK_HOSTS`, the
  `_EnvNamedSettings` `include_input=False` claim, `Dockerfile`, `pyproject.toml`,
  `scripts/run-e2e-server.sh`, DEC-0025 and DEC-0031 to DEC-0034, review v1,
  and the EXP review at `1d12e67`. Two older internal references in
  runtime-config do not (FINDING-14).
- **Quantitative values.** Port range, stub address `127.0.0.1:8126` and
  dummy key `e2e-test-key` all cite a source (DEC-0025, DEC-0032).
- **Placeholders.** No TBD, TODO or vague placeholder text is introduced.
- **Clarity.** Clause numbering, the condition-mapping table and the outcome
  table are precise. Remaining imprecision: FINDING-3, FINDING-12, FINDING-13.

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; assessed against the system
design.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` passed with no error and no warning. Dependency typing
(one `requires-runtime`, two `conforms-to`), placement between 5.1 and 5.3, and
STD-UI specialization are unchanged from v5 and remain valid. The capability
names no org constitution as a dependency. Its §5.3 loopback constraint gives
SEC-AUTH-001's basis only, not SEC-ENC-001's (see FINDING-1).

#### Completeness (SR-1)

Unchanged; v5 FINDING-4 is carried as FINDING-9.

#### Correctness (SR-2)

No contradictory acceptance criteria and no impossible user-flow states.

#### Testability (SR-4)

All 26 criteria have an observable outcome, a concrete input and a measurable
boundary.

#### Clarity (SR-6)

No vague modifiers in the acceptance-criteria block.

### System Design Specification

Unchanged (v6). All 12 components carry stable identifiers, and all 16
interfaces name a provider and a consumer component. The provider row
("HTTPS/JSON") and the block-diagram edge `MC -->|"HTTPS"| EXT` agree with the
release behaviour of the change. Section 4.1 still describes `massive-client`
as a "Hand-written HTTP client" (FINDING-15). Constraint 5.12's credential
re-read at claim time is the seam clause 2a item 3 uses, and the two are
consistent.

### Component Design Specifications

#### runtime-config v10 (changed)

- **Completeness (SR-1).** §2.2c is complete for the release rule and for
  clause 2a. FINDING-10: the interim behaviour of the E2E harness is
  unspecified.
- **Correctness (SR-2).** The snippet reproduces every table outcome.
  FINDING-11: `localhost` resolution is checked once at start, while urllib3
  resolves again on every new connection.
- **Consistency (SR-3).** FINDING-5: the `ingestion_main.main` signature
  change belongs to `acquisition-runner`, which does not record it, and DEC-0033
  still says "only a keyword-only settings-factory parameter".
- **Testability (SR-4).** FINDING-12.
- **Clarity (SR-6).** FINDING-3 and FINDING-14.
- **Feasibility (SR-7).** Feasible as written. The settings-factory seam works
  with a `MassiveSettings` subclass: a model field accepts a subclass instance
  without re-validating it, and `_build_client_for_key` uses `model_copy`,
  which keeps the subclass (`ingestion_main.py` lines 127-149).
  `ApiSettings`/`app_main` never load `MassiveSettings` (`app_main.py` line 26),
  so the acquisition API process is unaffected, as item 5 claims.

#### massive-client v10 (changed)

- **Correctness (SR-2).** FINDING-2: the ratios request and response contract
  (§2.5 lines 420-436; §11 line 818) conflicts with the locked SDK.
  FINDING-13: §8 item 13 is unqualified for non-release builds.
- **Testability (SR-4).** FINDING-4 and FINDING-13.
- **Traceability (SR-5).** FINDING-2: §12 cites ER-004 as addressed, but one
  of its three required corrections is missing.
- **Carried.** v5 FINDING-6 is carried as FINDING-17.

#### ingestion-api v6 (unchanged)

FINDING-1. §4 (lines 313-314) asserts "traffic is loopback only, which is why
SEC-ENC-001 does not engage on this hop".

#### market-data-store v6 (unchanged)

FINDING-1. §4 (lines 542-549) states the network posture of the database
channel but nothing about its transport encryption. The `fundamental_observation`
natural key requires `fiscal_period_end` for `statement_type = 'ratios'`
(lines 245-261), which the SDK's ratios model does not carry (FINDING-2).

#### acquisition-runner v7 (unchanged)

FINDING-5. §2.1 (line 87) places `src/factorflow/ingestion_main.py` in this
component, and §11 (lines 407-415) lists no entrypoint parameters.

#### rate-limit-governor v8 (unchanged)

The carried v5 findings stand: FINDING-6, FINDING-7 and FINDING-16. The
redirect refusal surfaces as `MaxRetryError`, which `massive-client` classifies
`RETRYABLE` (`client.py` lines 276-288), so the governor bounds it at the
attempt limit. That is consistent with §2.5.

#### coverage-service, instrument-list-service, observation-writer, owner-web-app, run-journal, schema-migrator (unchanged)

No interaction with the change beyond what is recorded above.
`owner-web-app` §7's "stubbed provider" end-to-end strategy depends on clause
2a for acquisition journeys, which runtime-config §14 item 4 records.

#### Feasibility (SR-7), all components

No circular dependency is introduced. Clause 2a adds one test-only module and
two keyword-only parameters, and no runtime dependency.

### UX Brief

Unchanged (v7), re-read in full. SR-8 coverage stands as in v5. The change has
no user-facing surface: credential presence copy and the health contract are
untouched.

### UX Design Specification

Unchanged (v5), re-read in full. Components and tokens resolve (see Dimension
Status). v5 FINDING-3 is carried as FINDING-8.

### Cross-Specification Consistency (SR-3)

- CROSS-SPEC-INCONSISTENCY: runtime-config §2.2c (lines 392-396) and §14 item 6
  call `ingestion-api` §4's loopback reading unsettled, while `ingestion-api` §4
  states it as settled (FINDING-1).
- CROSS-SPEC-INCONSISTENCY: runtime-config §2.2c item 4 changes the signature
  of an entrypoint `acquisition-runner` owns, and `acquisition-runner` is silent
  (FINDING-5).
- CROSS-SPEC-INCONSISTENCY: the massive-client ratios contract conflicts with
  `market-data-store`'s `fundamental_observation` key and with the SDK
  (FINDING-2).
- CROSS-SPEC-INCONSISTENCY: system design §4.1 calls `massive-client`
  hand-written; massive-client §1 and the tech stack adopt the official SDK
  (FINDING-15).
- Consistent: variable names (`FACTORFLOW_MASSIVE_BASE_URL` in runtime-config
  §2.2 and massive-client §2.2b and §2.6), the default base URL, `retries=0`,
  the loopback host set (runtime-config, massive-client, `settings.py` line 21),
  the dummy key (runtime-config, `run-e2e-server.sh` lines 90 and 138, DEC-0025,
  DEC-0033), and the error taxonomy.

---

## Findings Summary Table

CRITICAL 0 · HIGH 2 · MEDIUM 7 · LOW 9 · **total 18**

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-9 / SR-3 | ingestion-api; market-data-store; runtime-config | ingestion-api §4 lines 313-314; market-data-store §4 lines 542-549; runtime-config §4 lines 705-714, §2.2c lines 392-396, §14 item 6 | Two production channels carrying non-Public (Internal) data run without TLS, and neither has a supported SEC-ENC-001 standing. (a) Browser to `ingestion-api` over plain HTTP on loopback: ingestion-api §4 asserts "traffic is loopback only, which is why SEC-ENC-001 does not engage on this hop". SEC-ENC-001 in force (1.1) covers data "between client and server" with no loopback exception. CONST-SEC 1.2's Exception Record calls this reading "a project interpretation ... not settled here", and runtime-config v10 agrees, but ingestion-api still states it as settled. (b) Application and ingestion to PostgreSQL over the container network: no design states transport encryption or analyses SEC-ENC-001. runtime-config §4's new "Transport encryption" bullet covers only the provider URL, although runtime-config also loads `FACTORFLOW_DATABASE_URL`. Pre-existing, surfaced by this change | An approved specification asserts conformance to a Critical invariant on a basis the governing text does not give, and a second channel is unanalysed. If the owner rules that either channel engages SEC-ENC-001, TLS or a constitution-owner waiver (CONST-SEC Enforcement) is needed before release, and the release-readiness security evidence cannot be completed until then | Constitution owner decides the standing of host-local plaintext channels, loopback and container network: amend SEC-ENC-001 (`$constitution`, standard), or issue a time-boxed waiver, or require TLS (for example `sslmode` on the database URL). Until decided, restate ingestion-api §4 as an open question citing runtime-config §14 item 6, and add the database channel to that question and to market-data-store §4 and §14. Both designs then need re-review |
| FINDING-2 | HIGH | SR-2 / SR-5 | massive-client | §2.5 lines 420-436; §11 line 818; §12 line 835; §14 | §2.5 says the four financials endpoints share "one shape": selection by `cik` or `tickers`, period by `period_end` or `filing_date`, and each result carries `period_end`, `filing_date`, `fiscal_year`, `fiscal_quarter` and `timeframe`. §11's ratios row says "as above / Same shape and constraints". The locked SDK disagrees. massive 2.8.0 `list_financials_ratios` (`massive/rest/financials.py` line 191) takes `ticker` and no period filter; binding `tickers=..., period_end_gte=...` raises `TypeError`. `FinancialRatio` (`models/financials.py` line 812) carries `ticker` and `date` but none of the period fields. `market-data-store` keys `fundamental_observation` on `fiscal_period_end` for `statement_type = 'ratios'`. The EXP-20261009-1 review recorded this as ER-003 and ER-004, and ER-004 required the §11 correction "in the high-risk lane's design update". v10 cites ER-004 as addressed but does not make it, and §14 records no open question | Implemented as specified, the ratios read fails for every instrument (the worktree's `client.py` `_financial_page`, lines 245-258, passes `tickers=` to all four methods), so AC-3 fundamentals are not acquired. The stored shape cannot hold ratios rows without a mapping no design gives. The E2E stub serves statement-shaped ratios, so tests pass while the live path fails | Correct §2.5 and §11 for ratios: selection by `ticker`, the available filters, and the response shape. Specify how a ratios row maps to `fundamental_observation`'s period key, or exclude ratios from AC-3's fundamentals with an owner decision. Record ER-003 as a §14 open question with an owner. Align `market-data-store` if the key changes, and narrow §12's ER-004 citation to what was actually addressed |
| FINDING-3 | MEDIUM | SR-9 / SR-6 | runtime-config; massive-client | RC §2.2c lines 298-311, §12 line 868, frontmatter `source_artifacts`; MC §2.2b lines 231-235, §12 line 834 | Clause 2a "takes effect once CONST-SEC 1.2, carrying that exception, is merged to the AI-agents harness default branch". Three problems follow. The constitution's Exception Record says the text "stands as the owner's decision only once the owner approves it after re-review"; no harness document defines an approval form for org constitutions, so a merge and an approval are different events (CONST-SEC review v2 FINDING-16). "CONST-SEC 1.2" has named two texts (`64f61f8`, `552fb59`), and re-review v2 (`7b0e1e9`) recommends further changes under the same version: "must not follow any redirect", condition (4) wording, and a SEC-SEC-001 carve-out for the designated test credential this design hardcodes as `e2e-test-key`. Neither design pins the text the condition table was mapped against, and neither lists CONST-SEC in `source_artifacts` | A merge of a further-revised 1.2 would put clause 2a in force against a text the design was never checked against. The approval the constitution itself requires is not part of the trigger | State one trigger: the owner's approval of CONST-SEC 1.2, evidenced by its merge to the default branch. Pin the reviewed text (`552fb59`, `sha256:317180b3...`) and require the condition table to be re-checked if the merged text differs. Add CONST-SEC to both designs' `source_artifacts`. Note that item 3 depends on the SEC-SEC-001 carve-out the re-review requests |
| FINDING-4 | MEDIUM | SR-9 / SR-3 | massive-client | §7 line 716; §2.2b lines 207-210 | The redirect test builds a `MassiveClient` against `http://127.0.0.1:<port>` ("test-only construction") and sends a request carrying `Authorization: Bearer` over plain HTTP to a loopback double. That is the channel kind the designs otherwise gate on CONST-SEC 1.2: runtime-config says clause 2a "must not be implemented" until 1.2 is in force. This row is not gated, is not listed among the tests §14 item 4 unblocks, and states no basis under 1.1 (for example that a designated test credential and fixture data are Public). Under 1.2 it also has no start-time credential refusal (condition (3)) | The no-redirect requirement's only test may be unimplementable before 1.2 is in force, or may be implemented on an unstated reading of SEC-ENC-001. Either way the gating story differs between the two designs | Either gate the row on 1.2 and list it in runtime-config §14 item 4, stating how conditions (1) to (4) hold (literal designated test credential, `127.0.0.1` only, code under `tests/`); or state the basis on which it is permitted under 1.1 |
| FINDING-5 | MEDIUM | SR-3 / SR-1 | runtime-config; acquisition-runner | RC §2.2c item 4 lines 376-381; acquisition-runner §2.1 line 87, §11 lines 407-415; DEC-0033 | runtime-config specifies that `factorflow.ingestion_main.main` gains two keyword-only parameters, a settings factory and a credential reader. `acquisition-runner` owns `ingestion_main.py` (§2.1) and its interface table records neither parameter, and §3's credential re-read bullet does not mention the injectable reader. DEC-0033, which the design cites for the confinement, still says "`ingestion_main.main` gains only a keyword-only settings-factory parameter" | Story generation assigns work by owning component. The entrypoint interface change is specified in a component that does not own the file, and the cited decision contradicts the design | Record the two parameters in `acquisition-runner` §2.1, §3 and §11 (this needs re-review), or state in runtime-config that the change is made to acquisition-runner's entrypoint on its behalf. Have the owner's review of DEC-0033 record that DEC-0034 and the design supersede its signature text |
| FINDING-6 | MEDIUM | SR-5 | Rate-limit governor | §8 AC-1 amendment note | Carried from v5 FINDING-1, unchanged: `docs/decision-records.md` does not exist in this repository; DEC-0002 exists only at `projects/factorflow-v2/decisions/DEC-0002.md` in the harness | Readers cannot resolve the normative decision from the project repository | Correct the citation or mirror DEC-0002 into a governed project artifact |
| FINDING-7 | MEDIUM | SR-2 | Rate-limit governor | §2.5 final paragraph | Carried from v5 FINDING-2, unchanged: the design says all jitter is full jitter, while E3-S4 records deliberate additive jitter for boundary waits | The specification misdescribes the implemented boundary-path wait | Specify additive boundary-wait jitter while retaining full jitter for retry backoff, or record an approved exception |
| FINDING-8 | MEDIUM | SR-3 | UX design | §6 Source Mapping | Carried from v5 FINDING-3, unchanged: the table cites UX brief v6, capability v7 and system design v3; current versions are v7, v8 and v6 | Verification points readers to superseded inputs | Update the three source versions |
| FINDING-9 | MEDIUM | SR-1 | Capability | §8 Readiness Assessment | Carried from v5 FINDING-4, unchanged: it states 23 ACs twice and three open questions; the document has 26 ACs and two open questions | The readiness summary understates coverage and misstates unresolved decisions | Update the counts and the enumerating sentence |
| FINDING-10 | LOW | SR-7 / SR-1 | runtime-config | §2.2c lines 305-311, item 5 lines 382-384; `scripts/run-e2e-server.sh` lines 135-160 | Once the `https`-only rule ships and before clause 2a is in force, the script still starts the acquisition stack's ingestion process with `FACTORFLOW_MASSIVE_BASE_URL=http://127.0.0.1:8126` (line 145). That process will exit non-zero at start, and the script waits only on the acquisition API's health (lines 148-160), so the failure is silent. The design changes the script only as part of clause 2a and says nothing about the interim | Acquisition-stack E2E journeys stay held with no visible cause; a reader cannot tell intended from broken | State the interim: for example, drop or guard the acquisition ingestion launch until clause 2a is in force, or make the script fail loudly, and name the held E2E tasks |
| FINDING-11 | LOW | SR-2 / SR-9 | runtime-config | §2.2c item 2 lines 357-361; §7 line 780 | `localhost` is resolved once, at start, with `getaddrinfo`. Condition (2) concerns "every address the component connects to", and urllib3 resolves again on each new connection (CONST-SEC review v2 FINDING-22). The DEC-0025 stub uses `127.0.0.1`, so `localhost` is not needed by any planned launch | A resolver or hosts-file change mid-run is outside the check: a residual gap against condition (2) | Re-check resolution at every claim alongside the credential check, or drop `localhost` from the test entry point's accepted set, or record the residual explicitly |
| FINDING-12 | LOW | SR-4 | runtime-config | §2.2c clause 8 lines 261-264, table line 409, item 2 lines 361-364; §7 lines 784-785 | Three stated behaviours are not pinned. (a) Clause 8 rejects control characters, but no table row or test value covers one. (b) Item 2 claims accepted values parse to the same host under `urlsplit` and urllib3 `parse_url` (true by probe) without a test. (c) The table gives `http://::1:8126` the reason "host missing", but the snippet checks the scheme first and reports "scheme must be https", so a §7 test asserting that the message names the table's clause fails on that row | Small regressions in these behaviours would pass the specified suite, and one specified assertion contradicts the specified code | Add a control-character row and test; add a parser-agreement assertion to `test_ingestion_e2e_main.py`; correct that table row's reason, or reorder the checks |
| FINDING-13 | LOW | SR-4 / SR-6 | massive-client | §7 lines 715-716; §8 item 13 lines 767-769; §2.2b line 163 | (a) The redirect row exercises "the read" without naming one. The `vx` sub-client builds its own `PoolManager` (`massive/rest/__init__.py` lines 76-87) and serves the vX reads, so a test on a main-pool read does not exercise it (the probe shows it also refuses today). (b) §8 item 13 and the §2.2b code comment say `runtime-config` guarantees `https`. Under clause 2a, a non-release build passes `http`, a qualification §2.2b's prose and §4 carry but these do not | A future change to how `vx` is constructed would escape the test. Item 13 overstates a guarantee for non-release builds | Add a vX read, for example `list_ipos`, to the redirect row, or assert `vx.retries == 0`. Qualify item 13 and the comment with "in the release build" |
| FINDING-14 | LOW | SR-6 | runtime-config | §3 line 672; §14 item 3 lines 914-915; §2.3 line 487 vs §2.2c line 425 | Three internal pointers do not resolve or disagree. "Section 2.4a specifies the mechanism" names a section runtime-config does not have; the mechanism is §2.2b. "The test in section 7 asserting that no response model carries a secret-shaped field" names a test that is in `ingestion-api` §7 (`tests/unit/test_api_no_secrets.py`), not here. §2.3 declares `class MassiveSettings(BaseSettings)` while §2.2c's snippet declares `MassiveSettings(_EnvNamedSettings)`, and `_EnvNamedSettings` is introduced nowhere in the design. Pre-existing except the last | Readers following the pointers land on the wrong text (SA-MD-002) | Point §3 at §2.2b, point §14 item 3 at ingestion-api §7, and align §2.3's snippet with `_EnvNamedSettings` |
| FINDING-15 | LOW | SR-3 | System design | §4.1 line 298 | The responsibility of `massive-client` reads "Hand-written HTTP client for Massive reference, aggregate, fundamental and corporate-action reads". Since tech stack v3 (2026-09-05) and massive-client §1, the component wraps the official `massive` SDK, which owns transport. Pre-existing | The system-level description contradicts the component design the change builds on: `base=`, `retries=0` and redirect behaviour are SDK properties | Reword the §4.1 responsibility to "project-owned boundary around the official `massive` client" at the next system-design revision |
| FINDING-16 | LOW | SR-4 | Rate-limit governor | §8 AC-11 | Carried from v5 FINDING-5, unchanged: the concurrent-caller criterion is asserted while §5 declares a single-threaded caller model | The criterion is vacuously satisfied rather than exercised | Record the criterion as vacuous under the current model or restate the future-concurrency bound |
| FINDING-17 | LOW | SR-6 | Massive client | §14 open question 2 lines 862-873 | Carried from v5 FINDING-6, unchanged in v10: the item still says it blocks the governor throttle path, although governor §2.5 and system-design constraint 5.13 provide the requested behaviour | Pipeline bookkeeping reports a discharged blocker | Mark it resolved or restate any remaining question |
| FINDING-18 | LOW | SR-3 | All component designs; system design | Provenance and References tables | Carried from v5 FINDING-7, broadened. Thirteen specifications, including both changed designs, pin tech-stack v3 while v4 is current (`check-artifacts.py` warnings). Every component design's References table also labels the capability v6 (current v8), the system design v3 (current v6) and the UX design v4 (current v5); system design §9 labels the capability v7 | Repeated checker warnings and stale source labels; the two designs just revised to v10 carry them forward | Propagate current versions to pins and reference labels, starting with the two designs awaiting approval |

---

## Resolved and Carried Since v5

Nothing v5 raised was resolved by this change. Four MEDIUM and three LOW v5
findings carry forward with their descriptions unchanged except where noted.

| v5 ID | v6 ID | Status |
|---|---|---|
| v5 FINDING-1 | FINDING-6 | Carried; governor unchanged |
| v5 FINDING-2 | FINDING-7 | Carried; governor unchanged |
| v5 FINDING-3 | FINDING-8 | Carried; UX design unchanged |
| v5 FINDING-4 | FINDING-9 | Carried; capability unchanged |
| v5 FINDING-5 | FINDING-16 | Carried; governor unchanged |
| v5 FINDING-6 | FINDING-17 | Carried; massive-client changed but the item is untouched |
| v5 FINDING-7 | FINDING-18 | Carried and broadened to the capability, system-design and UX-design reference labels |

The expedited review EXP-20261009-1 (commit `1d12e67`) is a governing input.
Its items are dispositioned as follows:

| Expedited review item | Disposition in v10 |
|---|---|
| ER-001 HIGH, unvalidated base URL chooses the credential's host and scheme | Addressed: runtime-config §2.2c clauses 1 to 9, `https` only in release |
| ER-002 HIGH, deployment topology | Addressed in design: runtime-config §3 says release evidence must name the egress setting; not yet evidenced (release-readiness) |
| ER-003 MEDIUM, ratios modelling | Not addressed and not recorded as open (FINDING-2) |
| ER-004 LOW, three design corrections | `base=` in §2.2b: done. `test_massive_tls.py` row: done, marked "Not yet written". Ratios in §11: not done (FINDING-2) |

---

## Traceability Matrix

| Layer | Coverage | Evidence |
|-------|----------|----------|
| Capability to system design | 26/26 | System design §7 (unchanged) |
| Capability to UX design | 26/26 | UX design §5 (unchanged) |
| Capability to component designs | 26/26 | Every AC referenced by at least one component design; unchanged by v10 |
| System components to component designs | 12/12 | One design per declared component; `build-architecture.py` PASSED |

New and changed design elements in v10:

| Design element | Capability AC | Constitution or decision | Component AC |
|---|---|---|---|
| RC §2.2c clauses 1 to 9 (base URL validated at start) | AC-13 (credential only to an `https` host), AC-16 (refuse an inconsistent start) | SEC-ENC-001, SEC-INP-001, SEC-ERR-001; DEC-0032 | RC AC-10, AC-11 |
| RC §2.2c clause 2a and items 1 to 6 (test-only loopback `http`) | Enables E2E coverage of AC-3, AC-9 to AC-11 and AC-19 journeys (DEC-0025); no capability AC requires it | CONST-SEC 1.2 SEC-ENC-001 (1) to (4), SEC-NDG-001; DEC-0031, DEC-0033, DEC-0034 | RC AC-10 (second half) |
| MC §2.2b `base=settings.base_url` | AC-3 (reads reach the configured provider) | ER-001, ER-002, ER-004 | MC AC-13 |
| MC §2.2b and §4 "No redirect is ever followed" | AC-13 | SEC-ENC-001 (1.1); 1.2 condition (2) | none stated (FINDING-13 notes §8 has no redirect criterion; §7 carries the test) |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

There are no CRITICAL findings, so the verdict is not NOT-READY. There are two
HIGH findings, so it is not READY. Neither blocks a downstream phase.
FINDING-1 needs a constitution-owner decision and is already recorded as that
owner's open question in runtime-config §14 item 6 and in CONST-SEC 1.2's
Exception Record. FINDING-2 is a contract correction to an AC-3 read that the
base-URL work does not depend on.

The rubric defines readiness as this verdict and defines no numeric score, so
none is given.

The core of the change is complete, testable, feasible and conformant to the
constitution in force: `https`-only validation, `base=` passing, the
no-redirect requirement, and confinement of clause 2a out of `src/`. Clause 2a
is correctly held as specified but not in force. FINDING-3 and FINDING-4 should
be settled before it takes effect.

This verdict is review evidence, not approval. `component-design-runtime-config.md`
v10 and `component-design-massive-client.md` v10 remain `draft`. Each is blocked
from epic generation and test design until the owner explicitly approves it,
with `python3 scripts/artifact-gate.py approve --project factorflow-v2
--artifact <path> --review-artifact
docs/capabilities/CAP-001-market-data-acquisition-foundation/specifications-review-report-v6.md`.
The other 14 subjects keep their existing approvals, because this report
affirms their unchanged revisions.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-1: obtain the constitution owner's ruling on host-local plaintext
   channels (loopback owner interface, container-network database). Until then,
   restate ingestion-api §4 as an open question and add the database channel to
   it.
2. FINDING-2: correct massive-client §2.5 and §11 for ratios against SDK
   2.8.0, define the storage mapping or exclude ratios, and record ER-003 as an
   open question.

### Should Fix (MEDIUM findings)

3. FINDING-3: make the clause 2a trigger the owner's approval of a pinned 1.2
   text, and list CONST-SEC in `source_artifacts`.
4. FINDING-4: gate or justify the plain-HTTP redirect test.
5. FINDING-5: record the `ingestion_main.main` parameters in
   `acquisition-runner` and reconcile DEC-0033.
6. FINDING-6 to FINDING-9: the four carried v5 items.

### Nice to Have (LOW findings)

7. FINDING-10: state the E2E script's interim behaviour.
8. FINDING-11: re-check `localhost` per claim or drop it.
9. FINDING-12 and FINDING-13: pin the untested behaviours and qualify item 13.
10. FINDING-14 and FINDING-15: fix internal pointers and the system-design
    wording.
11. FINDING-16 to FINDING-18: the carried v5 items.

---

## Observations Outside the Review Subjects

These are not findings against the specifications. They are recorded because
this review found them.

- **Decision trailers not parsed by git.** Four commits carry `Decision-Id`
  lines in a non-final paragraph, so `git interpret-trailers --parse` returns
  only `Co-Authored-By` and `Claude-Session`. In FactorFlow-v2 these are
  `0ab7581` and `7ec4501` (DEC-0033), and in the harness `64f61f8` (DEC-0031 to
  DEC-0033) and `552fb59` (DEC-0034). DEC-0033's commit set therefore omits the
  v8 and v9 design edits, and `sdd decisions revert DEC-0033` would not revert
  them. `docs/decision-records.md` names this failure for DEC-0004 and DEC-0005.
- **State engine wording.** `pipeline-state.py` reports `AWAITING-APPROVAL`
  for a passing older review whose subjects changed after it. No approval is
  possible in that state; a new review is.
- **Downstream propagation.** Eight task plans pin `massive-client` v7 or
  `runtime-config` v6 (`check-artifacts.py` warnings). No story yet covers the
  v10 rules. The high-risk lane's backlog work follows owner approval.
- **Script reach.** `build-architecture.py` and `check-prerequisites.sh` accept
  no repo-dir option and were run through a read-only scratch mapping to the
  worktree. `check-references.py` covers harness Markdown only.
- **Constitution re-review timing.** CONST-SEC review v2 (`7b0e1e9`) was
  committed at 15:27:41Z, during this review. Its findings are cited where they
  bear on the designs. This report's assessment of 1.2 uses the `552fb59` text.
