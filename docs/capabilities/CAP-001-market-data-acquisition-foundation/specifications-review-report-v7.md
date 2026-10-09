---
artifact_schema_version: 1
artifact_id: CAP-001-specification-review
artifact_type: specification-review
artifact_version: 7
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-09
updated: 2026-10-09
document: spec-review-report
capability: CAP-001
version: v7
generated: 2026-10-09T20:52:06Z
constitutions_reviewed:
  - "CONST-AGT  docs/constitutions/agent-governance.constitution.md (2.3)"
  - "CONST-MDL  docs/constitutions/model-management.constitution.md (1.3)"
  - "CONST-OPS  docs/constitutions/operational-safety.constitution.md (1.3)"
  - "CONST-REV  docs/constitutions/review.constitution.md (1.4)"
  - "CONST-SA   docs/constitutions/static-analysis.constitution.md (2.0)"
  - "CONST-SEC  docs/constitutions/security.constitution.md (1.1 in force on the harness default branch; 1.2 as reworked in 11ecec4, content revision sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc, unmerged and unapproved, read for clause 2a)"
  - "CONST-VER  docs/constitutions/verification.constitution.md (1.2)"
mechanical_checks:
  - script: check-capabilities.py
    outcome: run
    result: "PASSED, exit 0 (-r worktree): 1 capability, 3 edges, 1 standard, 1 conformance claim; no error, no warning"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0 (scratch shim mapping the project repo to the worktree): 1 design, 12 components, 16 interfaces"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 105 warnings, exit 0 (-r worktree --strict); no error. 8 more than v6, all downstream pins of acquisition-runner v7"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0: 1042 references across 191 harness Markdown files (does not scan the project repo)"
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
  SR-8: "applied — UX artifacts and design system unchanged since v6 (digest-identical; no file outside the three designs changed); v6's component and token resolution stands"
  SR-9: "applied — dependency and STD-UI conformance halves by check-capabilities.py; the CONST-SEC 1.2 dependency by hand, because the checker does not read org constitutions"
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
    artifact_version: 8
    content_revision: sha256:e0522afb927bda200926be52dcf5e32f8fc050c6dc6157eb2688293fad6218b9
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
    artifact_version: 11
    content_revision: sha256:af95ec5e503f93915f2b7496956e20e756902e703dc9cfc3fc06c8140d05f64e
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
    artifact_version: 11
    content_revision: sha256:f9c6b57a361b05c7ec0145737a3384d99eabaff5c2425a476864e73da2dbd77b
  - artifact_id: CAP-001-component-design-schema-migrator
    artifact_version: 4
    content_revision: sha256:e877f0c46d6ca6c2f07f736212ccd00693c2c478fefbfbde5608e7af7ac3efa3
statistics:
  total_findings: 18
  critical: 0
  high: 2
  medium: 5
  low: 11
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.296"
  timestamp: 2026-10-09T20:52:06Z
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
      version: "8"
    - id: CAP-001-component-design-coverage-service
      version: "6"
    - id: CAP-001-component-design-ingestion-api
      version: "6"
    - id: CAP-001-component-design-instrument-list-service
      version: "6"
    - id: CAP-001-component-design-market-data-store
      version: "6"
    - id: CAP-001-component-design-massive-client
      version: "11"
    - id: CAP-001-component-design-observation-writer
      version: "4"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: CAP-001-component-design-rate-limit-governor
      version: "8"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-runtime-config
      version: "11"
    - id: CAP-001-component-design-schema-migrator
      version: "4"
    - id: CONST-SEC
      version: "1.2 (harness commit 11ecec4, content revision sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc; unmerged, unapproved)"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Specification Review Report -- CAP-001

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-001 Market Data Acquisition Foundation |
| **Version** | v7 (owner-designated final round after v6) |
| **Specifications Reviewed** | Capability, system design, UX brief, UX design, 12 component designs (full set; three changed since v6) |
| **Total Findings** | 18 (0 CRITICAL, 2 HIGH, 5 MEDIUM, 11 LOW) |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

Three component designs changed since the v6 review (`git diff
abc9b51..HEAD`; no other file in the repository changed):
`component-design-runtime-config.md` v10 to v11,
`component-design-massive-client.md` v10 to v11, and
`component-design-acquisition-runner.md` v7 to v8. The acquisition-runner
design lost its approval and is now `draft`. The rework answers v6 against
CONST-SEC 1.2 as reworked a last time in AI-agents `11ecec4`. It adds one
in-force trigger pinned by content revision, a per-run `TEST-ONLY-`
designated test credential in place of `e2e-test-key`, socket-free redirect
and proxy tests on the `https` base, and the entry-point parameters recorded
by their owning component. These choices are recorded in DEC-0035 to DEC-0038.

**v6 findings.** The three MEDIUM findings the owner required fixed are
resolved: FINDING-3, FINDING-4 and FINDING-5. The two HIGH findings the owner
deliberately left open are now stated as open, with an owner and what they
block. FINDING-1 is in runtime-config §14 item 6, and FINDING-2 is in
massive-client §14 item 7. They are recorded below as owner-open, not as
defects of this rework. The four MEDIUM findings carried from v5 (FINDING-6
to FINDING-9) remain by owner choice. None of the nine LOW findings is fully
resolved. Part (a) of FINDING-13 is superseded by the new FINDING-19.

**Claims verified by execution this session.**

- **The pin.** The value equals `artifact-gate.py revision` of the
  constitution at `11ecec4`. It is unchanged by adding an `approval` block or
  editing `status`.
- **The redirect test seam.** `HTTPConnectionPool._make_request` works as a
  socket-free seam on the locked SDK (massive 2.8.0, urllib3 2.7.0). With
  `retries=0` both the main pool and `vx` refuse the redirect. With
  `retries=3` the control follows it.
- **The proxy claim holds.** The SDK reads only `MASSIVE_API_KEY` from the
  environment, and urllib3 2.7.0 reads only `SSLKEYLOGFILE`. Both pools are
  plain `PoolManager`s with `proxy=None`. A live loopback read with every
  proxy variable set reached the target, and the proxy listener received no
  request.
- **The `TEST-ONLY-` pattern.** Applied as a full match, it rejects every
  value the test row lists. That includes the trailing newline, which
  `re.match('^...$')` would accept.

**New defects of this rework: 1 MEDIUM, 2 LOW.**

- **FINDING-19 (MEDIUM).** The redirect test row is specified at the
  `MassiveClient` level and does not do what it says. Its `vx` read goes
  through `fetch_corporate_actions`, which raises on a main-pool request
  before it reaches `vx`. Its "exactly one request" assertion also conflicts
  with the governor's retries.
- **FINDING-20 (LOW).** Two runtime-config test rows contradict each other on
  the literal `e2e-test-key`.
- **FINDING-21 (LOW).** The proxy test evidences CONST-SEC 1.2 Verification
  (e) on the `https` base, not on the clause 2a channel.

FINDING-10, FINDING-14 and FINDING-18 also gain small extensions.

## Review Scope

**Full set, depth proportional to change.** As in v6, the skill defines no
delta mode, so every subject is in `review_subjects` at its current revision.

- **Changed subjects** (runtime-config v11, massive-client v11,
  acquisition-runner v8): reviewed line by line. They were checked against the
  capability, the system design and the other component designs. They were
  also checked against CONST-SEC 1.2 at the pinned text, DEC-0025, DEC-0031
  and DEC-0033 to DEC-0038, and the real code in the worktree. Fresh execution
  evidence backs the checks (Supplementary Evidence).
- **Unchanged subjects** (13): each revision was recomputed with
  `artifact-gate.py revision` and equals the revision v6 recorded, so the
  content is the content v6 read in full. They were re-read where they
  interact with the change: `ingestion-api` §4, `market-data-store` §4 and
  the `fundamental_observation` key, system design §4.1, §4.2 and constraint
  5.12, `rate-limit-governor`'s classification of a refused redirect, and
  `owner-web-app` §7. Findings v6 raised against them stand by identity. v6's
  assessment of their other content was not re-derived.
- **Approval binding.** Under `docs/approval-gates.md`, the 13 unchanged
  subjects keep their approvals, because this report affirms the same
  revisions. The three changed designs are `draft` with no approval block, and
  each needs the owner's approval against this report. That includes
  acquisition-runner, whose v7 approval was removed with the change.
- **Not subjects.** `epics/`, stories, task plans and test specifications are
  not subjects. Decision records, CONST-SEC 1.2 and its reviews v1 to v3 are
  governing inputs.
- **Repository source.** Every project-repo read and check used the worktree
  `usr/alvaro-de-jodra/CAP-001-stories` at `7f4b9fe`. Neither
  `/home/user/factorflow-v2` nor `repos/` was read. `build-architecture.py`
  and `check-prerequisites.sh` take no repo-dir option. They ran through a
  read-only scratch shim that maps `repos/factorflow-v2/FactorFlow-v2` to the
  worktree. Probes ran against a `git archive` copy of `src/` in the
  scratchpad, so no bytecode or other file was written to the worktree.

**Pipeline state.** `pipeline-state.py check -r <worktree> --stage
specification-review` reported `AWAITING-APPROVAL`, exit 1. The three
changed designs carry no approval timestamp. No review covers their current
revisions, so `approve` would refuse them. This owner-directed review supplies
that evidence. It approves nothing.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All 14 template sections present in the three changed designs; no diagram added. FINDING-10 (interim states unspecified) |
| SR-2 Correctness | applied | Pin, redirect seam, proxy and pattern claims re-executed; signature and claim-path claims checked against `ingestion_main.py`. FINDING-2, FINDING-12, FINDING-20 |
| SR-3 Consistency | applied | Changed designs checked against the system design, the other 11 component designs, DEC-0025/0031/0033 to 0038 and CONST-SEC 1.2. FINDING-1, FINDING-15, FINDING-18 |
| SR-4 Testability | applied | Every new rule mapped to a §7 row and the row checked for feasibility against the code (Stage 1). FINDING-19, FINDING-20, FINDING-21, FINDING-12, FINDING-13 |
| SR-5 Traceability | applied | 26/26 capability ACs still mapped; new elements trace to AC-13 and AC-16 and to CONST-SEC 1.2 conditions and Verification (a) to (h) |
| SR-6 Clarity | applied | FINDING-14, FINDING-17 |
| SR-7 Feasibility | applied | Checked against `ingestion_main.py`, `ingestion/massive/client.py`, `ingestion/rate_limit.py`, `config/settings.py`, `scripts/run-e2e-server.sh`, `tests/e2e/support/massive_stub.py`, the locked SDK and urllib3 sources, and `artifact-gate.py`. No circular dependency introduced. FINDING-19 |
| SR-8 UX Completeness | applied | UX brief, UX design and the design-system files are byte-unchanged since v6 (the only repository changes are the three designs); v6's resolution of the 10 component specs and every real token stands. The change has no UX surface |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` passed with no error or warning; STD-UI conformance unchanged. CONST-SEC 1.2 conditions, precondition, consumer record and Verification (a) to (h) assessed by hand (see the CONST-SEC section). FINDING-1, FINDING-21 |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passed (12 components, 16 interfaces); the change introduces no component and no capability used as an actor |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2 -r <worktree>` | run, exit 0: "1 capabilities, 3 edges, 1 standard(s), 1 conformance claim(s), 1 constitution artifact(s), 1 reference(s) ... PASSED" | none. The checker does not read org constitutions |
| `build-architecture.py -p factorflow-v2` (scratch shim) | run, exit 0: "1 design(s), 12 component(s), 16 interface(s) PASSED" | none |
| `check-artifacts.py -p factorflow-v2 -r <worktree> --strict` | run, exit 0: "PASSED with 105 warning(s)", no error | The three changed designs each pin tech-stack v3 while v4 is current (FINDING-18). The 8 warnings new since v6 are all epic and task-plan pins of acquisition-runner v7, now v8 (Observations). The rest are the pre-existing classes v6 recorded |
| `check-references.py` | run, exit 0: "1042 path references across 191 Markdown files ... PASSED" | none. It scans harness Markdown only. The changed designs' project-repo references were checked by hand: all resolve, except files the designs declare as planned (`tests/e2e/support/ingestion_e2e_main.py`, `tests/unit/test_ingestion_e2e_main.py`, `tests/unit/test_massive_redirects.py`, `tests/unit/test_massive_tls.py`, `tests/unit/test_settings_base_url.py`, `tests/unit/test_release_excludes_test_paths.py`). Line numbers 90, 138 and 145 of `scripts/run-e2e-server.sh` cited in runtime-config item 5 are correct |
| `check-constitutions.py` | run, exit 0: "10 constitutions, 36 skills PASSED" | none |

Prerequisites: `check-prerequisites.sh --project factorflow-v2` (scratch
shim) exited 0 with every row PASSED. `design_system_available = true`.

### Supplementary evidence (fresh, this session)

The probe scripts are in the session scratchpad (`v7review/scripts/`). They
were written independently of the author's `v7probe/` scripts, which this
review did not reuse. They load the `uv.lock` versions from the uv cache and
run against a `git archive` copy of `src/`. They open no socket, except for
Part C's two loopback listeners. They use a generated `TEST-ONLY-` key, and
they write nothing to the worktree.

| Probe | Result |
|-------|--------|
| Content-revision pin (`pin_probe.py`, and `artifact-gate.py revision --repo-dir . --artifact docs/constitutions/security.constitution.md` in the harness) | `sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc`, equal to the pin in all three designs and DEC-0036. The working file equals `11ecec4`. Appending an `approval` block: unchanged. Changing `status`: unchanged (`MUTABLE_GATE_FIELDS = {"status", "updated", "approval"}`, `artifact-gate.py` line 26). Bumping `last_reviewed` or editing the Exception Record's "The owner has not yet approved it": changed. After commit `2927226` (constitution review v3, landed during this review) the constitution text is still unchanged and the revision still matches |
| Redirect seam, SDK level (`redirect_proxy_probe.py` Part A) | `socket.create_connection` and `socket.getaddrinfo` were patched to fail. `HTTPConnectionPool._make_request` was replaced by a fake that answers `302` to `https://198.51.100.7/`. `retries=0`: `get_ticker_details` and `vx.list_ipos` each raised `MaxRetryError`, with exactly one request each, to `api.massive.com`. `retries=3` control: each recorded three requests to `198.51.100.7`. A fake that does not set `response.retries`: the `retries=0` client followed the redirect (three requests to `198.51.100.7`). urllib3 sets it at `connectionpool.py` line 540 and `PoolManager.urlopen` reads it back at `poolmanager.py` line 473 |
| Redirect row as specified, `MassiveClient` level (Part B) | `MassiveClient` built as in production (governor `max_attempts=3`): `fetch_reference` recorded 3 requests and raised `ProviderUnavailable`. `fetch_corporate_actions` recorded 3 requests, all to `/stocks/v1/splits`, and reached no `/vX/` path. With `max_attempts=1`: 1 request each, and `fetch_corporate_actions` still reached no `/vX/` path (FINDING-19) |
| Proxy claim (Part C and source grep) | `grep` of massive 2.8.0 finds only `os.getenv(ENV_KEY)` (`MASSIVE_API_KEY`, `rest/__init__.py` line 53) and the WebSocket key. urllib3 2.7.0 reads only `SSLKEYLOGFILE` (`util/ssl_.py` lines 317-318). With `HTTP_PROXY`, `HTTPS_PROXY` and `ALL_PROXY` and their lowercase forms set and `NO_PROXY` unset: the main and `vx` clients are `PoolManager`, not `ProxyManager`. `connection_from_url(BASE)` gives `HTTPSConnectionPool` for `api.massive.com` with `proxy=None`. A loopback `http` base gives `HTTPConnectionPool` with `proxy=None`. A live read against a loopback target with every variable pointing at a loopback proxy listener: target 1 hit, proxy 0 |
| Designated test credential (Part D) | `re.fullmatch(r"TEST-ONLY-[0-9a-f]{32,}", v)` accepts `"TEST-ONLY-" + secrets.token_hex(16)`. It rejects `e2e-test-key`, a 31-hex tail, an uppercase tail, a lowercase prefix, a trailing newline and a 32-character alphanumeric value. `re.match("^...$")` wrongly accepts the trailing newline, which the row's "fully matches" wording and its newline case guard against. `read_provider_credential` does not strip (`settings.py` line 196) |
| Entry-point feasibility | `ingestion_main.main` (lines 49-124) builds `Settings()` at start and reads the key at claim time (line 95) before `client_factory.get_or_rebuild` (line 97), so a raising reader prevents any `RESTClient`. `run_polling_loop` catches nothing (`runner.py` lines 381-405). No test patches `ingestion_main` module attributes, so binding the defaults at definition time breaks nothing |
| Local test double (Verification (a), (b)) | `tests/e2e/support/massive_stub.py` binds `("127.0.0.1", port)` (line 248). It serves nine named fixtures from `tests/fixtures/massive/` (lines 38-58) and imports no outbound client. It is started by `run-e2e-server.sh` line 132. The one fixture carrying a fake `apiKey` literal (`error_with_spurious_credential_field.json`, a redaction-test fixture) is not among those served |
| Release artifact (Verification (g)) | No change to `src/`, `Dockerfile`, `pyproject.toml`, `uv.lock`, `migrations/`, `scripts/` or `tests/` since v6's base `b0dee71`, so v6's wheel evidence (no entry under `tests/`) still applies |
| Constitution in force | `origin/main` (`8f1888e`) carries CONST-SEC `version: 1.1` with no `approval` block. `11ecec4` is not an ancestor of it. The 1.2 file carries no `approval` block |
| Consumer discovery (Verification (h)) | The Exception Record's `git grep` over every ref returns DEC-0031 and DEC-0033 to DEC-0038. Only DEC-0036 contains the exact phrase, and its `artifacts` name the three designs and the script. Each design contains the exact phrase on one line at least (runtime-config 3, massive-client 4, acquisition-runner 2) |

## Constitutions Applied

All seven constitutions the relevance matrix assigns `specification-review`
were read. Only CONST-SEC changed since v6.

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | AGT-PROV-001: the three changed designs carry provenance, a version bump, the shared correlation ID, and CONST-SEC 1.2 with its pinned revision in `source_artifacts`. AGT-SPEC-002: the security confinement choices (DEC-0035 to DEC-0038) are agent decisions. They are open, `owner_reviewed: false` and, apart from DEC-0035, marked PROVISIONAL. They are surfaced in runtime-config §14 item 4 (DEC-0033 to DEC-0037) and massive-client §12 (DEC-0036 to DEC-0038), not settled silently. AGT-AUTH-001: this review approves nothing |
| CONST-MDL 1.3 | MDL-PIN-002: exact model identifier `claude-opus-5-5` recorded |
| CONST-OPS 1.3 | Probes used scratch directories, loopback listeners and a copy of `src/`. OPS-ERR-001: the refusal paths end the process non-zero (a raised reader exception propagates out of `run_polling_loop`; `ConfigurationError` returns 1) |
| CONST-REV 1.4 | REV-STG-001: Stage 1 (specification compliance) and Stage 2 (artifact quality) are reported separately. REV-RCV-001: DEC-0038's probe claims and the designs' feasibility claims were re-verified with independent scripts, not accepted |
| CONST-SA 2.0 | SA-MD-001: template conformance passes. SA-MD-002: internal pointers in runtime-config (FINDING-14) |
| CONST-SEC | **1.1, in force** (`origin/main`): release behaviour conforms, as v6 found, and is unchanged. **1.2 at `11ecec4`**, unmerged and unapproved: applied to clause 2a as a conditional specification (next section) |
| CONST-VER 1.2 | VER-EVD-001: every verdict rests on commands run this session. VER-EVD-004: per-rule verdicts in Stage 1. VER-DEL-001: the author's probe claims were re-executed independently |

## CONST-SEC 1.2 at the Pinned Revision

The designs now take effect against one exact text. This table assesses each
condition and each Verification item of SEC-ENC-001 (1.2, `11ecec4`) against
the designs as they stand.

| Requirement | Where the designs meet it | Assessment |
|---|---|---|
| In-force rule: owner `approval` block for the content revision, and the default branch | RC §2.2c *When clause 2a is in force* (lines 311-332); MC §2.2b (lines 249-253); DEC-0036 | **Met.** One trigger plus revision equality; fails closed on a mismatch; pin verified |
| Precondition and Verification (a): the peer is a local test double started by the setup itself, with no relay | RC condition table (line 305), item 3 (lines 397-402) | **Met** (`massive_stub.py`, see evidence) |
| Verification (b): fixture-only responses with no Restricted or Confidential value | RC item 3 | **Met** |
| Condition (1) and Verification (c): three hosts in their stated forms | Clause 2a and the table (lines 279-287, 451-453); RC §7 line 826 | **Met** (unchanged since v6) |
| Condition (2) and Verification (d): loopback only, `localhost` resolution, no redirect | RC items 2 and 6; MC §2.2b and §7 line 739 | **Met in design.** Gaps: FINDING-11 (resolution checked once) and FINDING-19 (the `vx` path is not exercised by the specified test) |
| Condition (2) and Verification (e): no proxy whatever the environment says | RC item 6 (lines 424-433); MC §2.2b (lines 215-226), §7 line 740 | **Met in fact** (probe). The evidence form is FINDING-21 |
| Condition (3) and Verification (f): only a designated test credential, at start and every load; no credential value written | RC item 3 (lines 386-402), item 5 (lines 410-423), §7 lines 828-830 | **Met in design.** Gaps: FINDING-20 (test rows contradict) and FINDING-10 (b) (the committed `e2e-test-key` until item 5 lands) |
| Condition (4) and Verification (g): non-release code only; the built artifact inspected | RC *Release and non-release*, items 1, 4, 5; §7 line 831 | **Met** (unchanged since v6; release inputs unchanged) |
| Consumer record and Verification (h): exact phrase in each design; project decision naming them | RC line 309; DEC-0036 | **Met** |
| Standing of other host-local plaintext channels | RC §2.2c lines 435-440, §14 item 6 | **Owner-open** (FINDING-1). Not decided by the exception, and stated as such |

## Status of v6 Findings

IDs below continue v6's numbering, so the citations of "specification review
v6 FINDING-n" in the designs stay valid. Resolved findings are absent from
the open findings table.

| v6 ID | Severity | Status in v7 | Evidence |
|---|---|---|---|
| v6 FINDING-1 | HIGH | **Owner-open** (carried as FINDING-1) | Deliberately left open by the owner. RC §14 item 6 (lines 1011-1023) now reads "Open; nothing is decided here". It names the production loopback hop, the production PostgreSQL connections and the E2E database channel, with the constitution owner as owner and the release-readiness security evidence as blocked. CONST-SEC 1.2's Exception Record states the same open question. `ingestion-api` §4 (approved, digest-unchanged) still states its reading as settled, and `market-data-store` §4 is still silent. The owner chose not to change those approved designs. Not a defect of this rework |
| v6 FINDING-2 | HIGH | **Owner-open** (carried as FINDING-2) | Deliberately left open by the owner. MC §14 item 7 (lines 929-940) states the SDK contradiction, ER-003 and the unmade ER-004 correction, with the capability owner as owner and the ratios read and AC-3 ratios fundamentals as blocked. §12 cites v6 FINDING-2 as open. §2.5 and §11 are unchanged by stated intent. Not a defect of this rework |
| v6 FINDING-3 | MEDIUM | **Resolved** | There is one trigger, the in-force rule plus revision equality. The pin is verified equal to `artifact-gate.py revision` of `11ecec4`. CONST-SEC appears in `source_artifacts` of all three designs. The SEC-SEC-001 carve-out is no longer needed: CONST-SEC 1.2 chose a generated credential, and DEC-0037 adopts it |
| v6 FINDING-4 | MEDIUM | **Resolved** (gating) | Both tests now run with no socket and no plain-HTTP channel, so no 1.2 gate is needed. The basis is stated (MC §2.2b, DEC-0038). The replacement row has its own defect, FINDING-19 |
| v6 FINDING-5 | MEDIUM | **Resolved** | AR §2.1 (lines 86-126), §3 (lines 269-279), §7 (line 380) and §11 (line 458) record both parameters. RC item 4 points there. DEC-0035 records that it supersedes DEC-0033's signature sentence |
| v6 FINDING-6 to FINDING-9 | MEDIUM | **Carried by owner choice** | Subjects digest-unchanged |
| v6 FINDING-10 | LOW | **Remaining, extended** | Item 5 now specifies the script change, but only "when clause 2a takes effect". The interim is still unstated, and DEC-0037 adds a second one (see FINDING-10) |
| v6 FINDING-11 | LOW | **Remaining** | RC item 2 unchanged |
| v6 FINDING-12 | LOW | **Remaining** | Clause 8, item 2 and the `http://::1:8126` row unchanged |
| v6 FINDING-13 | LOW | **(a) superseded by FINDING-19; (b) remaining** | The row now names a `vx` read, but the named read does not reach `vx`. §8 item 13 and the §2.2b comment are unchanged |
| v6 FINDING-14 | LOW | **Remaining, extended** | All three pointers unchanged. RC §12 now also omits DEC-0038, which item 6 relies on |
| v6 FINDING-15 | LOW | **Remaining** | System design unchanged |
| v6 FINDING-16, FINDING-17 | LOW | **Carried** | Unchanged |
| v6 FINDING-18 | LOW | **Carried, extended** | Acquisition-runner v8 joins the stale tech-stack pin and reference labels |

## Stage 1 -- Specification Compliance of the Change

One verdict per new or changed rule (VER-EVD-004). PASS means the rule is
consistent with its governing source, has a test row, and is feasible against
the code. A finding reference means it passes with the stated gap. `RC` is
runtime-config v11, `MC` massive-client v11 and `AR` acquisition-runner v8.
Line numbers refer to `7f4b9fe`.

| Rule | Location | Governing source | Test row | Fresh evidence | Verdict |
|------|----------|------------------|----------|----------------|---------|
| Clause 2a takes effect only under 1.2's in-force rule at the pinned revision | RC lines 311-332; MC 249-253; AR 118-126 | CONST-SEC 1.2 *When a version is in force*; DEC-0036 | n/a | pin probe | PASS |
| Condition table: precondition and consumer-record rows | RC lines 302-309 | SEC-ENC-001 Statement and Verification (a), (h) | n/a | stub inspection; phrase grep; discovery command | PASS |
| Designated test credential at start and every claim | RC item 3 lines 386-402 | 1.2 Definitions; condition (3) | RC §7 lines 828-829 | pattern probe; `settings.py` line 196 | PASS |
| No fixed key committed | RC item 3 lines 395-397; §7 line 830 | 1.2 Definitions; SEC-SEC-001 | RC §7 line 830 | `git grep` (lines 90, 138 only today) | PASS, FINDING-20 |
| Script change: per-run key, no inherited fallback, test entry point | RC item 5 lines 410-423; DEC-0037 | condition (3); DEC-0025 | indirect | script lines 90, 138, 145 verified | PASS, FINDING-10 |
| Entry-point parameters owned by acquisition-runner | AR §2.1 lines 86-126, §3, §11 line 458; RC item 4 | SEC-NDG-001; DEC-0035 | AR §7 line 380 | `ingestion_main.py` lines 49-124, 95-97 | PASS |
| No redirect followed (main pool and `vx`) | MC §2.2b lines 198-213; RC item 6 | condition (2) | MC §7 line 739 | Part A (SDK level), Part B (row as specified) | PASS in design; row FINDING-19 |
| No proxy used, whatever the environment | MC §2.2b lines 215-226, §4 lines 640-645; RC item 6 | condition (2); Verification (e) | MC §7 line 740 | Part C; source grep | PASS, FINDING-21 |
| Transport bullets restated against the pin and the generated credential | RC §4 lines 749-761; MC §4 lines 621-645 | SEC-ENC-001, SEC-NDG-001 | as above | n/a | PASS |
| Component AC-10 (RC) reworded for a designated test credential | RC §8 lines 862-867 | condition (3) | RC §7 lines 828-829 | n/a | PASS |
| Other host-local plaintext channels open | RC §2.2c lines 435-440, §14 item 6 | 1.2 Exception Record | n/a | n/a | Owner-open (FINDING-1) |
| Ratios contract open | MC §14 item 7 lines 929-940 | SDK; ER-003, ER-004 | n/a | v6 `ratios_sig.py` (SDK unchanged) | Owner-open (FINDING-2) |
| Acquisition-runner provenance and status | AR frontmatter | AGT-PROV-001; approval gates | n/a | `artifact-gate.py revision` | PASS (draft, approval removed, CONST-SEC listed) |

## Stage 2 -- Artifact Quality of the Change

- **Contract.** All three designs pass `check-artifacts.py --strict` with no
  error. Versions are bumped, status is `draft`, acquisition-runner's stale
  approval block is removed, provenance is refreshed, and the correlation ID
  is unchanged.
- **Structure.** All 14 template sections are present in each design. No
  diagram was added, so no narrative overview is owed.
- **Cross-references.** All new references resolve: DEC-0035 to DEC-0038,
  constitution reviews v1 and v2, review v6, and script lines 90, 138 and 145.
  Gaps: RC §12 omits DEC-0038, and the older pointers remain (FINDING-14).
- **Quantitative values.** The pattern, the 32-hex generation and the proxy
  test values all cite a source.
- **Placeholders.** None introduced.
- **Clarity.** The in-force section, the condition table and the owner-open
  items are precise. Remaining imprecision: FINDING-19 (the test row's level
  and governor), FINDING-12 and FINDING-13 (b).

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; assessed against the system
design.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` passed with no error and no warning. Dependency typing
(one `requires-runtime`, two `conforms-to`), 5.1 to 5.3 placement and STD-UI
specialization are unchanged from v6 and remain valid. The capability names
no org constitution as a dependency.

#### Completeness (SR-1)

Unchanged; FINDING-9 carried.

#### Correctness (SR-2)

No contradictory acceptance criteria and no impossible user-flow states.

#### Testability (SR-4)

All 26 criteria have an observable outcome, a concrete input and a measurable
boundary.

#### Clarity (SR-6)

No vague modifiers in the acceptance-criteria block.

### System Design Specification

Unchanged (v6, digest-identical). All 12 components carry stable identifiers.
All 16 interfaces name a provider and a consumer. FINDING-15 remains:
`massive-client` is still "Hand-written HTTP client" at line 298.
Constraint 5.12's claim-time re-read is the seam that AR's `credential_reader`
injects into, and the two are consistent.

### Component Design Specifications

#### runtime-config v11 (changed)

- **Completeness (SR-1).** FINDING-10: interim states unspecified.
- **Correctness (SR-2).** FINDING-20: two §7 rows contradict on the literal
  `e2e-test-key`. FINDING-12 remains.
- **Consistency (SR-3).** Consistent with AR §2.1, §3 and §11, DEC-0035 to
  DEC-0037 and the pinned text. FINDING-1 is owner-open.
- **Testability (SR-4).** FINDING-11 and FINDING-12 remain.
- **Clarity (SR-6).** FINDING-14 remains and is extended.
- **Feasibility (SR-7).** Feasible. The per-run key command yields 32
  lowercase hex characters, the claim-path refusal precedes any client build,
  and the script lines cited are correct.

#### massive-client v11 (changed)

- **Correctness (SR-2) and Feasibility (SR-7).** The socket-free seam and the
  proxy claims hold on the locked SDK. FINDING-19: the redirect row, as
  specified at the `MassiveClient` level, does not reach `vx`, and its count
  conflicts with the governor. FINDING-2 is owner-open.
- **Testability (SR-4).** FINDING-19, FINDING-21, FINDING-13 (b).
- **Traceability (SR-5).** §12 now cites review v6 and the decisions. ER-003
  is recorded in §14 item 7.
- **Carried.** FINDING-17.

#### acquisition-runner v8 (changed)

- **Completeness and Consistency (SR-1, SR-3).** The entry-point signature,
  the claim-path seam and the test row are complete and agree with RC
  item 4, DEC-0035 and the code. The approval was removed correctly with the
  version bump.
- **Feasibility (SR-7).** Feasible against `ingestion_main.py`. A raising
  reader ends the process after the run is claimed, so the claimed run is
  later reclaimed as `abandoned`. That is the existing crash path (AC-20), and
  only the test-only caller can trigger it.
- **Carried.** FINDING-18 (tech-stack pin and reference labels).

#### ingestion-api v6, market-data-store v6 (unchanged)

FINDING-1, owner-open: `ingestion-api` §4 lines 313-314, and
`market-data-store` §4 lines 542-549. FINDING-2, owner-open:
`fundamental_observation` keyed on `fiscal_period_end`, lines 245-261.

#### rate-limit-governor v8 (unchanged)

FINDING-6, FINDING-7 and FINDING-16 carried. A refused redirect surfaces as
`MaxRetryError`, which `massive-client` classifies RETRYABLE, so the governor
retries it up to the attempt limit. This bears on FINDING-19's count.

#### coverage-service, instrument-list-service, observation-writer, owner-web-app, run-journal, schema-migrator (unchanged)

No interaction with the change beyond the above. `owner-web-app` §7's
stubbed-provider strategy still depends on clause 2a for acquisition journeys.

#### Feasibility (SR-7), all components

No circular dependency. The change adds one test-only module, two
keyword-only parameters and no runtime dependency.

### UX Brief

Unchanged (v7). SR-8 coverage stands as in v6. The change has no
user-facing surface.

### UX Design Specification

Unchanged (v5). FINDING-8 carried.

### Cross-Specification Consistency (SR-3)

- CROSS-SPEC-INCONSISTENCY, owner-open (FINDING-1): RC §2.2c and §14 item 6
  call `ingestion-api` §4's loopback reading unsettled, while `ingestion-api`
  §4 states it as settled.
- CROSS-SPEC-INCONSISTENCY, owner-open (FINDING-2): the massive-client ratios
  contract conflicts with `market-data-store`'s key and with the SDK.
- CROSS-SPEC-INCONSISTENCY (FINDING-15): system design §4.1 says
  hand-written; massive-client adopts the official SDK.
- **Resolved since v6.** The `ingestion_main.main` signature is now recorded
  in its owning component (AR §2.1, §11) and agrees with RC item 4 and
  DEC-0035.
- **Consistent across the three designs and the decisions:**
  - the pinned revision (RC, MC, AR, DEC-0036);
  - the pattern and per-run generation (RC, MC, DEC-0037, CONST-SEC
    Definitions);
  - the exception phrase;
  - `retries=0` and the no-proxy requirement (RC item 6, MC §2.2b and §4);
  - the loopback host set;
  - the error taxonomy.

---

## Findings Summary Table

CRITICAL 0 · HIGH 2 · MEDIUM 5 · LOW 11 · **total 18**. Origin: 2
owner-open (v6), 4 carried by owner choice (v5 via v6), 9 remaining or
carried LOW (v6), 3 new in this rework.

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-9 / SR-3 | ingestion-api; market-data-store; runtime-config | ingestion-api §4 lines 313-314; market-data-store §4 lines 542-549; RC §2.2c lines 435-440, §14 item 6 lines 1011-1023 | **Owner-open, carried from v6 unchanged in substance; not a defect of this rework.** Production host-local channels carrying Internal data run without TLS and have no supported SEC-ENC-001 standing: the browser-to-API loopback hop, which `ingestion-api` §4 still asserts "SEC-ENC-001 does not engage on", and the PostgreSQL connections, for which no design states transport encryption. v11 now records the question clearly as the constitution owner's, open, in RC §14 item 6, covering the E2E database channel too. CONST-SEC 1.2's Exception Record states the same open question | Release-readiness security evidence cannot be completed until the owner rules; an approved design asserts a reading the constitution does not give | Constitution owner decides: TLS, a waiver, or a further amendment (`$constitution`, standard). When decided, align `ingestion-api` §4 and `market-data-store` §4 and §14, and re-review them |
| FINDING-2 | HIGH | SR-2 / SR-5 | massive-client | §2.5 lines 440-456; §11 lines 839-842; §14 item 7 lines 929-940; market-data-store lines 245-261 | **Owner-open, carried from v6 unchanged in substance; not a defect of this rework.** The ratios request and response contract in §2.5 and §11 ("as above", "Same shape and constraints") contradicts massive 2.8.0. `list_financials_ratios` takes `ticker` and no period filter, and `FinancialRatio` carries `ticker` and `date` only. `fundamental_observation` keys ratios on `fiscal_period_end`. v11 records this as §14 item 7, "Open; nothing is decided here", owner capability owner, blocking the ratios read and AC-3's ratios fundamentals, and leaves §2.5 and §11 unchanged by stated intent | As implemented (`client.py` lines 245-258 pass `tickers=` to all four methods), the ratios read fails for every instrument | Owner decides the ratios contract and storage mapping, or excludes ratios from AC-3; then correct §2.5 and §11, and `market-data-store` if the key changes |
| FINDING-6 | MEDIUM | SR-5 | Rate-limit governor | §8 AC-1 amendment note | Carried from v5 (v6 FINDING-6), unchanged by owner choice: `docs/decision-records.md` does not exist in this repository; DEC-0002 is only in the harness | Readers cannot resolve the normative decision from the project repository | Correct the citation or mirror DEC-0002 |
| FINDING-7 | MEDIUM | SR-2 | Rate-limit governor | §2.5 final paragraph | Carried from v5 (v6 FINDING-7), unchanged by owner choice: says all jitter is full jitter, while E3-S4 records additive boundary-wait jitter | Misdescribes the implemented boundary wait | Specify additive boundary jitter, keeping full jitter for retry backoff |
| FINDING-8 | MEDIUM | SR-3 | UX design | §6 Source Mapping | Carried from v5 (v6 FINDING-8), unchanged by owner choice: cites UX brief v6, capability v7, system design v3; current are v7, v8, v6 | Verification points to superseded inputs | Update the three source versions |
| FINDING-9 | MEDIUM | SR-1 | Capability | §8 Readiness Assessment | Carried from v5 (v6 FINDING-9), unchanged by owner choice: states 23 ACs and three open questions; the document has 26 and two | The readiness summary misstates coverage | Update the counts |
| FINDING-19 | MEDIUM | SR-4 / SR-7 | massive-client | §7 "A redirect is never followed" row, line 739; §2.2b lines 210-213; DEC-0038 | **New in this rework.** The seam works (Part A). The row is specified at the `MassiveClient` level, and there it is wrong in three ways, verified by Part B. (a) `fetch_corporate_actions` requests `/stocks/v1/splits` and `/stocks/v1/dividends` on the main pool before `vx.list_ipos` (`client.py` lines 155-208). With the fake answering `302` to every request, the read raises at the splits request and never reaches `vx`, so the row passes while exercising only the main pool. That is the gap v6 FINDING-13 (a) asked to close. (b) "Exactly one request is recorded" holds only with a single-attempt governor. A refused redirect is `MaxRetryError`, not `BadResponse`, so `_through_governor` classifies it RETRYABLE (`client.py` lines 276-288). A client built with production settings therefore records 3 requests and raises `ProviderUnavailable`, not `MaxRetryError` as DEC-0038 says. The row names no governor. (c) The fake must set `response.retries` to the `retries` it is passed, as urllib3 does (`connectionpool.py` line 540). Without it, `PoolManager.urlopen` falls back to `Retry.DEFAULT` (`poolmanager.py` line 473) and a `retries=0` client follows the redirect. That failure is loud, but the row does not say so | `vx` serves the IPO and ticker-event reads, which under clause 2a cross the plain-HTTP loopback channel. The only specified test of the no-redirect requirement on `vx` does not exercise it, and no other row asserts `vx.retries == 0`: the SDK-config row checks the main `RESTClient`. A future SDK change to how `vx` is built would pass the suite, and Verification (d) for those reads would rest on a test that does not reach them | Exercise `vx` directly: call `vx.list_ipos` through the client seam, or have the fake answer `302` only for `/vX/` paths and an empty `200` otherwise. Add `vx.retries == 0` to the SDK-config row. Specify the governor (`max_attempts=1`), or assert "every recorded request is to `api.massive.com`, none to `198.51.100.7`" instead of a count. State that the fake returns its response with `retries` set to the value passed in. Align DEC-0038's "asserts MaxRetryError" with the `MassiveClient`-level outcome |
| FINDING-10 | LOW | SR-7 / SR-1 | runtime-config | §2.2c lines 328-330, item 5 lines 410-423; `scripts/run-e2e-server.sh` lines 90, 138, 145, 148-160 | **Remaining from v6, extended by this rework.** (a) As v6 found: once the `https`-only rule ships, and before clause 2a is in force, line 145 starts ingestion with `http://127.0.0.1:8126`. The process exits at start, and the script waits only on the API's health, so the failure is silent. No validator exists in `src/` yet. Item 5 now specifies the script change, but only "when clause 2a takes effect". (b) New: DEC-0037 bundles the key change with clause 2a. If CONST-SEC 1.2 comes into force at a revision other than the pin, clause 2a and the key change are both held. A routine `last_reviewed` bump does exactly that (pin probe; constitution review v3 FINDING-24). Meanwhile 1.2's Definitions already class the committed `e2e-test-key` (lines 90, 138) as a fixed value that SEC-SEC-001 governs in full | Acquisition E2E journeys fail with no visible cause, and a fixed value 1.2 forbids can outlive the constitution's entry into force | State both interims. Decouple item 5's first two bullets (per-run key, no inherited fallback), which need no clause 2a, from the third (the entry-point launch), or make the script fail loudly while held |
| FINDING-11 | LOW | SR-2 / SR-9 | runtime-config | item 2 lines 379-382; §7 line 827 | Remaining from v6, unchanged: `localhost` is resolved once at start, while condition (2) and Verification (d) concern every connected address, and urllib3 resolves again per connection. The DEC-0025 stub uses `127.0.0.1` | Residual gap against condition (2) | Re-check at every claim, drop `localhost` from the test entry point's set, or record the residual |
| FINDING-12 | LOW | SR-4 | runtime-config | clause 8 lines 263-266; table lines 453, 460; item 2 lines 383-385; §7 lines 832-833 | Remaining from v6, unchanged: (a) no control-character row or test; (b) the `urlsplit`/`parse_url` agreement is untested; (c) the table gives `http://::1:8126` "host missing", but `MassiveSettings` checks the scheme first and reports "scheme must be https" | Small regressions pass the suite; one assertion contradicts the code | Add the row and test, the parser-agreement assertion, and correct the reason |
| FINDING-13 | LOW | SR-6 | massive-client | §8 item 13 lines 791-793; §2.2b line 165 | Remaining from v6 in part (b); part (a) is superseded by FINDING-19. Item 13 and the code comment still say `runtime-config` guarantees `https`, unqualified, while §4 (lines 625-627) and §2.2b's prose qualify it "in the release build" | Overstates a guarantee for non-release builds | Qualify both with "in the release build" |
| FINDING-14 | LOW | SR-6 | runtime-config | §3 line 716; §14 item 3 lines 964-965; §2.3 line 531 vs §2.2c line 469; §12 line 921 vs item 6 line 432 | Remaining from v6, extended. "Section 2.4a" does not exist (the mechanism is §2.2b). The "test in section 7" about secret-shaped response fields is in `ingestion-api` §7. §2.3 declares `MassiveSettings(BaseSettings)` against the snippet's `_EnvNamedSettings`. New: item 6 relies on DEC-0038, which the §12 Decision row (DEC-0031 to DEC-0037) omits | Readers land on the wrong text (SA-MD-002) | Fix the three pointers; extend the §12 row to DEC-0038 |
| FINDING-15 | LOW | SR-3 | System design | §4.1 line 298 | Remaining from v6: `massive-client` described as "Hand-written HTTP client" | The system description contradicts the SDK-based design | Reword at the next system-design revision |
| FINDING-16 | LOW | SR-4 | Rate-limit governor | §8 AC-11 | Carried from v5 (v6 FINDING-16): concurrent-caller criterion under a single-threaded model | Vacuously satisfied | Record as vacuous or restate |
| FINDING-17 | LOW | SR-6 | massive-client | §14 item 2 lines 888-899 | Carried from v5 (v6 FINDING-17), unchanged in v11: still says it blocks the governor throttle path, which governor §2.5 and constraint 5.13 provide | Reports a discharged blocker | Mark resolved |
| FINDING-18 | LOW | SR-3 | All component designs; system design | Provenance and References tables | Carried from v5 (v6 FINDING-18), now including acquisition-runner v8. All three changed designs still pin tech-stack v3 (v4 current), and their §12 tables label the capability v6, the system design v3 and the UX design v4 (current v8, v6, v5) | Repeated checker warnings and stale labels carried into designs awaiting approval | Propagate current versions |
| FINDING-20 | LOW | SR-2 / SR-4 | runtime-config | §7 lines 828 and 830; item 3 lines 395-397 | **New in this rework.** Two specified tests contradict. Line 828 puts the literal `e2e-test-key` among the refused inputs of `tests/unit/test_ingestion_e2e_main.py`. Line 830 requires that no tracked file under `tests/` contain `e2e-test-key` "other than in this test's own search patterns". Item 3 also says no fixed key value appears in "its tests" | Implemented literally, the suite fails on its own fixture | Exempt `tests/unit/test_ingestion_e2e_main.py` by name in line 830, or drop the literal from line 828 (any non-matching value covers the branch) |
| FINDING-21 | LOW | SR-9 / SR-4 | massive-client; runtime-config | MC §7 line 740; RC condition table line 306, item 6 lines 424-433 | **New in this rework.** Verification (e) asks that a run with the proxy variables set "shows the channel is not routed through a proxy". The channel is the clause 2a loopback `http` channel, but the specified test asserts pool types and `proxy is None` on the `https` default base only. The structural argument transfers: on the same client, `connection_from_url("http://127.0.0.1:<port>")` yields `HTTPConnectionPool` with `proxy=None`, and a live loopback read with every variable set reached the target with 0 proxy hits. Constitution review v3 FINDING-28 records that (e) does not say which observation counts | The evidence for (e) rests on a reading the constitution has not settled | Add the clause 2a base form to the same socket-free assertion (building a pool sends nothing), or state in RC item 6 that structural evidence on the default base is what is offered for (e) |

---

## Traceability Matrix

| Layer | Coverage | Evidence |
|-------|----------|----------|
| Capability to system design | 26/26 | System design §7 (unchanged) |
| Capability to UX design | 26/26 | UX design §5 (unchanged) |
| Capability to component designs | 26/26 | Every AC referenced by at least one component design; unchanged by this rework |
| System components to component designs | 12/12 | One design per component; `build-architecture.py` PASSED |

New and changed design elements in this rework:

| Design element | Capability AC | Constitution or decision | Component AC or test |
|---|---|---|---|
| RC §2.2c *When clause 2a is in force* (pinned revision) | AC-13 | CONST-SEC 1.2 *When a version is in force*; DEC-0036 | RC AC-10 |
| RC item 3, designated test credential at start and every claim | AC-13 | 1.2 Definitions, condition (3); DEC-0037 | RC §7 lines 828-830 |
| RC item 5, per-run key in the E2E script | AC-13 | condition (3), SEC-SEC-001; DEC-0025, DEC-0037 | RC §7 line 830 |
| AR §2.1 and §11, `main` keyword-only parameters | AC-13, AC-16 | SEC-NDG-001; DEC-0035 | AR §7 line 380 |
| MC §2.2b, no redirect and no proxy (every build) | AC-13 | SEC-ENC-001; condition (2), Verification (d), (e); DEC-0038 | MC §7 lines 739-740 |
| RC §14 item 6, MC §14 item 7 (owner-open questions) | AC-13; AC-3 | 1.2 Exception Record; ER-003, ER-004 | n/a |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

There are no CRITICAL findings, so the verdict is not NOT-READY. Two HIGH
findings remain, so it is not READY. Both are the owner-open items the owner
deliberately left for decision (FINDING-1 and FINDING-2). Each is now stated
in the designs as open, with an owner and what it blocks. Neither blocks epic
generation or test design. FINDING-1 blocks release-readiness security
evidence. FINDING-2 blocks the ratios read and AC-3's ratios fundamentals.

The rework did what this round required. Every MEDIUM v6 finding the owner
asked to be fixed is resolved, and the claims the rework rests on hold
against the real SDK, urllib3, `artifact-gate.py` and the code. It introduces
one MEDIUM defect, FINDING-19. The no-redirect test row does not exercise the
`vx` path it names. That is a contained test-specification correction and does
not change the design's behaviour, which the probe shows is correct today.

The rubric defines readiness as this verdict and defines no numeric score, so
none is given.

This verdict is review evidence, not approval. `component-design-runtime-config.md`
v11, `component-design-massive-client.md` v11 and
`component-design-acquisition-runner.md` v8 are `draft`. Each is blocked from
epic generation and test design until the owner explicitly approves it, with
`python3 scripts/artifact-gate.py approve --project factorflow-v2 --artifact
<path> --review-artifact
docs/capabilities/CAP-001-market-data-acquisition-foundation/specifications-review-report-v7.md`.
READY-WITH-WARNINGS is a passing verdict for that command. The other 13
subjects keep their existing approvals, because this report affirms their
unchanged revisions. Clause 2a remains specified but not in force until
CONST-SEC 1.2 is in force at the pinned revision.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-1 (owner-open): the constitution owner rules on host-local
   plaintext channels; then align `ingestion-api` §4 and `market-data-store`.
2. FINDING-2 (owner-open): the capability owner decides the ratios contract
   and storage, or excludes ratios; then correct massive-client §2.5 and §11.

### Should Fix (MEDIUM findings)

3. FINDING-19: make the redirect row exercise `vx`, assert `vx.retries == 0`,
   and specify the governor and the fake's `retries` contract.
4. FINDING-6 to FINDING-9: the carried v5 items (held by owner choice).

### Nice to Have (LOW findings)

5. FINDING-10: state both interims, and decouple the key change from the
   entry-point launch.
6. FINDING-20 and FINDING-21: reconcile the two key-literal test rows, and
   add the loopback base to the proxy assertion.
7. FINDING-11 to FINDING-14: residual test and pointer gaps in runtime-config
   and massive-client (include DEC-0038 in RC §12).
8. FINDING-15 to FINDING-18: the system-design wording and the carried items.

---

## Observations Outside the Review Subjects

These are not findings against the specifications.

- **Constitution review v3 landed during this review.** Commit `2927226`
  (20:44:44Z) added `docs/constitutions/reviews/security-review-v3.md`,
  READY-WITH-WARNINGS. It did not change the constitution text, so the pin
  still matches. Its FINDING-24 agrees with this review's pin probe: a routine
  frontmatter edit changes the revision and withdraws 1.2, failing closed. Its
  FINDING-28 agrees with FINDING-21. When approving 1.2, the owner keeps the
  designs' pin valid only by adding the `approval` block and changing nothing
  else, including the Exception Record's "The owner has not yet approved it".
  Any other edit holds clause 2a until a re-pin and re-review, as RC §2.2c
  states.
- **WebSocket half and proxies.** The no-proxy property is verified for the
  SDK's REST pools. The SDK's WebSocket client calls `websockets.connect`
  without a `proxy` argument, and websockets 17.1 defaults to `proxy=True`
  (`asyncio/client.py` line 276), which honours the proxy environment. The
  live feed is out of scope for CAP-001 (MC §2.7). When M3 attaches it to this
  component, MC §2.2b's "every build" requirement will need an explicit
  `proxy=None`.
- **Probe evidence durability.** DEC-0038's derivation cites
  `v7probe/nosocket_probe2.py` and `proxy_probe.py` in a session scratchpad.
  They are not committed. This review reproduced the SDK-level claims with
  independent scripts.
- **Decision trailers.** Unlike the v6 observation, the `Decision-Id`
  trailers of `7f4b9fe` (FactorFlow-v2) and `11ecec4` (harness) parse with
  `git interpret-trailers --parse`. DEC-0035 to DEC-0038 still list
  `commits: []`.
- **Downstream propagation.** Eight new `check-artifacts.py` warnings: epic
  E5 and task plans for E3-S5, E4-S3, E4-S6, E5-S2, E5-S3, E5-S4 and E7-S4 pin
  acquisition-runner v7, now v8 and `draft`. No story yet covers the clause 2a
  rules or the per-run key.
- **Script reach.** `build-architecture.py` and `check-prerequisites.sh` ran
  through a read-only scratch shim. `check-references.py` covers harness
  Markdown only.
