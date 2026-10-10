---
artifact_schema_version: 1
artifact_id: CAP-001-specification-review
artifact_type: specification-review
artifact_version: 8
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-10
updated: 2026-10-10
document: spec-review-report
capability: CAP-001
version: v8
generated: 2026-10-10T02:29:58Z
constitutions_reviewed:
  - "CONST-AGT  docs/constitutions/agent-governance.constitution.md (2.3)"
  - "CONST-MDL  docs/constitutions/model-management.constitution.md (1.3)"
  - "CONST-OPS  docs/constitutions/operational-safety.constitution.md (1.3)"
  - "CONST-REV  docs/constitutions/review.constitution.md (1.4)"
  - "CONST-SA   docs/constitutions/static-analysis.constitution.md (2.0)"
  - "CONST-SEC  docs/constitutions/security.constitution.md (1.2, in force: owner approval 2026-10-09T21:00:28Z, reviewed_revision equal to the content revision sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc, on the harness default branch at 5ba1068)"
  - "CONST-VER  docs/constitutions/verification.constitution.md (1.2)"
mechanical_checks:
  - script: check-capabilities.py
    outcome: run
    result: "PASSED, exit 0 (shim): 1 capability, 3 edges, 1 standard, 1 conformance claim, 1 constitution artifact, 1 reference; no error, no warning"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0 (shim): 1 design, 12 components, 16 interfaces"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 114 warnings, exit 0 (shim, --strict); no error. 3 are new with v12 (E3, E3-S6 and E3-S7 pin massive-client v11), measured against a git archive of the parent commit 771aaaa (111 warnings)"
  - script: check-references.py
    outcome: run
    result: "From the shim: exit 0 but vacuous (0 references across 0 Markdown files; the shim has no git index). From the harness root: PASSED, exit 0, 1041 references across 195 harness Markdown files. Does not scan the project repo"
  - script: check-constitutions.py
    outcome: run
    result: "From the shim: exit 1, a layout artifact (the shim has no .agents/skills, so every applies_to_skills name fails to resolve). From the harness root: PASSED, exit 0, 10 constitutions, 36 skills"
dimension_status:
  SR-1: applied
  SR-2: applied
  SR-3: applied
  SR-4: applied
  SR-5: applied
  SR-6: applied
  SR-7: applied
  SR-8: "applied — UX brief, UX design and design-system/ unchanged since v7 (digest-identical subjects; no diff under design-system/); v6's component and token resolution stands"
  SR-9: "applied — dependency and STD-UI conformance halves by check-capabilities.py; CONST-SEC 1.2 (now in force) assessed by hand, because the checker does not read org constitutions"
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
    artifact_version: 12
    content_revision: sha256:1c11f099dcd3b2f425d7711696d94373993772a9b969fc97f6a620d02b12d04b
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
  total_findings: 20
  critical: 0
  high: 2
  medium: 4
  low: 14
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.296"
  timestamp: 2026-10-10T02:29:58Z
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
      version: "12"
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
      version: "1.2 (in force; content revision sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc)"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Specification Review Report -- CAP-001

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-001 Market Data Acquisition Foundation |
| **Version** | v8 |
| **Specifications Reviewed** | Capability, system design, UX brief, UX design, 12 component designs (full set; one changed since v7) |
| **Total Findings** | 20 (0 CRITICAL, 2 HIGH, 4 MEDIUM, 14 LOW) |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

**What changed since v7.** One subject changed:
`component-design-massive-client.md`, from v11 (approved on v7) to v12
(`draft`), in commit `2cfc504`. Commit `7d93040` added approval blocks to
massive-client v11, runtime-config v11 and acquisition-runner v8 without
changing their content revisions. The other 15 subjects are digest-identical
to the revisions v7 recorded, recomputed this session with
`artifact-gate.py revision`.

v12 changes three things:

- **§2.2b** now says the governor retries a refused redirect `max_attempts`
  times and the read raises `ProviderUnavailable`.
- **§7.** The redirect row and the SDK-retries row are rewritten to match
  CAP-001-E3-S6's DAC-E3-S6-10 and DAC-E3-S6-12 to S6-15.
- **§12** cites DEC-0042 and specification review v7.

**v7 FINDING-19 (MEDIUM) is resolved.** Every claim in the rewritten rows
was re-executed on the locked SDK with an independent probe (Supplementary
Evidence):

- The fake must return the `retries` it was passed.
- The production governor (`max_attempts` default 3) records three requests,
  all `https` to `api.massive.com`, and raises `ProviderUnavailable`, not
  `MaxRetryError`.
- Both of the row's ways of driving the `vx` read reach `/vX/reference/ipos`
  through the `vx` pool.
- `vx.retries == 0`.

v12 is consistent on all of this with E3-S6, DEC-0042, DEC-0038 (as DEC-0042
amends it), the rate-limit-governor design and the code in
`src/factorflow/ingestion/`. One exception is wording: v12 attributes the
retryable classification to the governor, while the governor design and the
code place it in `massive-client` (FINDING-22).

**New in this round: 4 LOW findings, no MEDIUM or higher.**

- FINDING-22: classification is misattributed to the governor.
- FINDING-23: a `/vX/` path does not identify the `vx` sub-client. The SDK's
  ticker-events read is a `/vX/` path on the main pool.
- FINDING-24: the redirect harness leaves three things unstated:
  - the required `requests_per_minute`, plus a real-clock `monotonic` that can
    make the test wait;
  - the undefined "governor seam";
  - a control client that cannot be a `MassiveClient`.
- FINDING-25: v12's provenance timestamp and tool version were not refreshed.

**Context that changed without any subject changing.** CONST-SEC 1.2 is now in
force at exactly the pinned revision. The owner's `approval` block carries
`reviewed_revision` equal to the content revision, which equals the designs'
pin, and the file is on `origin/main` (`5ba1068`). That closes v7 FINDING-10.
Clause 2a's precondition is met, and the remaining interim is handled by
E3-S6's approved landing rule. The two HIGH findings remain owner-open as v7
recorded them. FINDING-2's impact evidence is refreshed: the ratios request
now matches the SDK, and the failure has moved to model validation.

## Review Scope

**Full set, depth proportional to change.** The skill defines no delta mode,
so every subject appears in `review_subjects` at its current revision.

- **Changed subject:** massive-client v12, read in full. It was checked line
  by line against:
  - CAP-001-E3-S6 v3 (approved on backlog review v12);
  - DEC-0038, DEC-0041 and DEC-0042;
  - `component-design-rate-limit-governor.md` v8, read in full;
  - runtime-config v11 §2.2c (the condition table and item 6) and §4;
  - system design constraint 5.13;
  - CONST-SEC 1.2 SEC-ENC-001 condition (2) and Verification (d) and (e);
  - the code in `src/factorflow/ingestion/` (`massive/client.py`,
    `massive/errors.py`, `rate_limit.py`), `config/settings.py` and
    `ingestion_main.py`, all at HEAD `2cfc504`.
- **Unchanged subjects (15).** Each revision equals the one v7 recorded, so the
  content is what v6 and v7 read in full. Each was re-read where it interacts
  with the change or with a carried finding. v7's and v6's other assessments
  stand by identity.
- **Not subjects.** Epics, stories, task plans, test specifications and
  decision records are governing inputs, not subjects.
- **Repository source.** Every project-repo read used the worktree
  `usr/alvaro-de-jodra/CAP-001-massive-client-redirect` at `2cfc504`, through
  the scratch shim that maps `repos/factorflow-v2/FactorFlow-v2` to it.
  `/home/user/factorflow-v2` and `/home/user/AI-agents/repos/` were not read.
  Probes ran in a separate scratchpad venv holding the `uv.lock` versions
  (massive 2.8.0, urllib3 2.7.0, pydantic 2.13.5, pydantic-settings 2.15.0),
  against a `git archive` copy of `src/`. Nothing was written to the worktree
  except this report. A `git fetch` in the harness, to confirm
  `origin/main`, updated only its remote-tracking refs and brought nothing
  new.
- **Pipeline state.** `pipeline-state.py check --stage specification-review`
  reported `AWAITING-APPROVAL`, exit 1: massive-client "approval timestamp is
  missing". That is the expected state of a refined draft that has no review
  yet. This owner-requested review supplies the evidence approval needs and
  approves nothing.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | v12 keeps all 14 template sections. No diagram was added, so no new narrative overview is owed. Carried: FINDING-9 |
| SR-2 Correctness | applied | Every new v12 claim was re-executed. The §2.2b `vx` sentence was checked against the SDK (FINDING-23). FINDING-2's impact evidence was refreshed against the code. FINDING-12, FINDING-20 carried |
| SR-3 Consistency | applied | v12 was checked against E3-S6, DEC-0038/0041/0042, the governor design, runtime-config item 6, constraint 5.13 and the code. FINDING-22, FINDING-21. Carried: FINDING-1, FINDING-8, FINDING-15, FINDING-18 |
| SR-4 Testability | applied | Every rewritten §7 assertion was executed at the `MassiveClient` level. FINDING-23, FINDING-24. Carried: FINDING-11, FINDING-12, FINDING-16 |
| SR-5 Traceability | applied | 26/26 capability ACs are still mapped. v12's §12 rows resolve. FINDING-25. Carried: FINDING-6 |
| SR-6 Clarity | applied | FINDING-22, FINDING-24 (b). Carried: FINDING-13, FINDING-14, FINDING-17 |
| SR-7 Feasibility | applied | Both redirect test routes, the control and the SDK-config assertions are feasible on the locked SDK. One caveat is the busy-wait (FINDING-24 (a)). No circular dependency introduced |
| SR-8 UX Completeness | applied | UX artifacts and `design-system/` are unchanged since v7. `design_system_available = true` (all four configured paths present). The change has no UX surface. Carried: FINDING-8 |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` passed with no error or warning. CONST-SEC 1.2 is now in force, and condition (2) and Verification (d) and (e) were re-assessed for the changed rows. Carried: FINDING-1, FINDING-21 |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passed (12 components, 16 interfaces). v12 adds no component and uses no capability as an actor |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` (shim) | run, exit 0: "1 capabilities, 3 edges, 1 standard(s), 1 conformance claim(s), 1 constitution artifact(s), 1 reference(s) ... PASSED" | none. The checker does not read org constitutions |
| `build-architecture.py -p factorflow-v2` (shim) | run, exit 0: "1 design(s), 12 component(s), 16 interface(s) PASSED" | none |
| `check-artifacts.py -p factorflow-v2 --strict` (shim) | run, exit 0: "PASSED with 114 warning(s)", no error | Run against a `git archive` of the parent `771aaaa` it gives 111. The three new warnings are `CAP-001-E3`, `CAP-001-E3-S6` and `CAP-001-E3-S7` pinning massive-client v11 (Observations). Massive-client v12 still pins tech-stack v3 (FINDING-18; the known pre-existing warning). The rest are the classes v6 and v7 recorded, plus pins added by the backlog work since v7 |
| `check-references.py` | run. From the shim: exit 0 but vacuous, because the shim has no git index ("0 path references across 0 Markdown files"). From the harness root: exit 0, "1041 path references across 195 Markdown files ... PASSED" | none. It scans harness Markdown only. v12's new references were checked by hand: DEC-0042 exists in `projects/factorflow-v2/decisions/`, and `specifications-review-report-v7.md` exists. `tests/unit/test_massive_redirects.py` and `tests/unit/test_massive_tls.py` are still planned files that E3-S6 creates |
| `check-constitutions.py` | run. From the shim: exit 1, a layout artifact, because the shim has no `.agents/skills/` and so every `applies_to_skills` name fails to resolve. From the harness root: exit 0, "10 constitutions, 36 skills PASSED" | none |

Prerequisites: `check-prerequisites.sh --project factorflow-v2` (shim) exited
0, with every row PASSED.

### Supplementary evidence (fresh, this session)

The probe scripts live in the session scratchpad (`v8review/scripts/`). They
were written independently of the author's earlier probes and of v7's
`v7review/` scripts. Before importing anything, they patch
`socket.create_connection` and `socket.getaddrinfo` to fail, and no socket
was opened. Each key is generated as `"TEST-ONLY-" + secrets.token_hex(16)`.
The `_make_request` fake records the scheme, host, path and owning pool.
It answers `302` with `Location: https://198.51.100.7/`, or an empty `200`
page where a route needs one.

| Probe | Result |
|-------|--------|
| Settings | `MassiveSettings.max_attempts` defaults to 3 (`settings.py` line 113). `requests_per_minute` has no default: omitting it raises `ConfigurationError: FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE: Field required` (line 112). `GovernorSettings` itself has no default. The 3 reaches the governor through `GovernorSettings.from_massive_settings` (`rate_limit.py` lines 66-78), which `ingestion_main.py` line 147 uses |
| SDK-retries row (DAC-E3-S6-10) | `MassiveClient` built as in production: `_rest_client.retries == 0`, `vx.retries == 0`, and both pools' `Retry.total == 0`. `RESTClient.__init__` passes `retries` to `VXClient` (`massive/rest/__init__.py` lines 76-81) |
| Redirect row, main-pool read (DAC-E3-S6-13) | `fetch_reference` raised `ProviderUnavailable` (cause `MaxRetryError`). It recorded 3 requests, all `https`, all to `api.massive.com`, all via the main pool, and none to `198.51.100.7`. The cause is `MassiveClient._through_governor.classify`, which returns `RETRYABLE` for any non-`BadResponse` (`client.py` lines 282-284). `RateLimitGovernor.execute` raises after `attempts >= max_attempts` (`rate_limit.py` lines 171-175) |
| Redirect row, `vx` read, route 1 (DAC-E3-S6-14) | `vx.list_ipos` called through `_through_governor` raised `ProviderUnavailable`. It recorded 3 `/vX/reference/ipos` requests, all via the `vx` pool, none to `198.51.100.7` |
| Redirect row, `vx` read, route 2 (DAC-E3-S6-14) | `fetch_corporate_actions`, with `200` empty pages for `/stocks/v1/splits` and `/stocks/v1/dividends` and `302` for `/vX/`, raised `ProviderUnavailable`. It recorded 5 requests: 2 main-pool `200`s, then 3 `/vX/reference/ipos` via the `vx` pool. All went to `api.massive.com` |
| Path as discriminator (FINDING-23) | `get_ticker_events` called through `_through_governor` recorded 3 `/vX/reference/tickers/AAPL/events` requests, **all via the main pool**, 0 via `vx`. The SDK defines it on `ReferenceClient` (`massive/rest/reference.py` line 181). `VXClient` serves only `/vX/reference/financials` and `/vX/reference/ipos` (`massive/rest/vX.py` lines 69, 113) |
| Control (DAC-E3-S6-15) | `MassiveClient(..., retries=3)` raises `TypeError`: the constructor has no `retries` parameter, and `client.py` line 58 hard-codes 0. A bare `RESTClient(retries=3).get_ticker_details` raised `MaxRetryError`, with 3 of 4 requests going to `198.51.100.7` |
| The fake must return the passed `retries` (DAC-E3-S6-12) | With a fake that does not set `response.retries`, the `retries=0` client followed the redirect: 9 of 12 requests went to `198.51.100.7`, and the read still raised `ProviderUnavailable`. Only the row's "none to `198.51.100.7`" assertion catches that, which is why the row's clause is necessary. urllib3 sets the field at `connectionpool.py` line 540, and `PoolManager.urlopen` reads it back at `poolmanager.py` line 473 |
| No-proxy row and DAC-E3-S6-16 | With the proxy variables set and `NO_PROXY` unset, both pools are `PoolManager`, not `ProxyManager`. `connection_from_url("https://api.massive.com")` gives `HTTPSConnectionPool` with `proxy=None`. `connection_from_url("http://127.0.0.1:8126")` gives `HTTPConnectionPool` with `proxy=None`. The third assertion holds but is not in v12's row (FINDING-21) |
| Governor pacing in the test (FINDING-24 (a)) | Production settings, with `sleep` and `jitter` injected and the real `monotonic`. At `requests_per_minute=3`, `fetch_reference` took 0.0 s wall. At `requests_per_minute=2`, it took **30.0 s** wall, busy-waiting in `_acquire_permit` (`rate_limit.py` lines 188-200) |
| Ratios read (FINDING-2 evidence) | `client.py` now calls `list_financials_ratios(ticker=..., raw=True)` with no period bound (lines 253-256, from `f7baf77`). A row shaped like the SDK's `FinancialRatio` (`ticker`, `cik`, `date`, values) fails `FinancialStatement` validation. The missing fields are `filing_date`, `fiscal_year`, `period_end`, `tickers` and `timeframe` |
| CONST-SEC in force | `artifact-gate.py revision` of `docs/constitutions/security.constitution.md` gives `sha256:82059ecd...cbcc`. That equals the frontmatter `approval.reviewed_revision` and the pin in runtime-config §2.2c, massive-client §2.2b and DEC-0036. The working file equals `origin/main` (`5ba1068`) |

## Constitutions Applied

All seven constitutions the relevance matrix assigns `specification-review`
were read. Only CONST-SEC changed since v7, and only by its approval block
(`9480517`).

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | AGT-PROV-001: v12 bumps its version, drops the stale approval and keeps the correlation ID. Its `timestamp` and `tool_version` were not refreshed (FINDING-25). AGT-EVIDENCE-002: the row's "default of 3" cites §3 and the 2026-09-04 owner decision. AGT-AUTH-001: this review approves nothing |
| CONST-MDL 1.3 | MDL-PIN-002: the exact model identifier `claude-opus-5-5` is recorded |
| CONST-OPS 1.3 | Probes ran in scratch directories with no socket. OPS-LOOP-001: the governor bounds the refused-redirect retries at `max_attempts` (verified) |
| CONST-REV 1.4 | REV-STG-001: Stage 1 and Stage 2 are reported separately below. REV-RCV-001: DEC-0042's and E3-S6's claims were re-executed, not accepted. REV-RCV-002: two statements in v7 itself are corrected with evidence (Observations) |
| CONST-SA 2.0 | SA-MD-001: template conformance passes. SA-MD-002: v12's new references resolve. FINDING-14 is carried |
| CONST-SEC 1.2 | **Now in force** at the pinned revision (previous section). SEC-ENC-001 condition (2) and Verification (d): the redirect requirement is met for both pools, and the specified tests now exercise the `vx` pool. Verification (e): FINDING-21. The Exception Record's open question on other host-local plaintext channels (line 367) is unchanged (FINDING-1) |
| CONST-VER 1.2 | VER-EVD-001: every verdict rests on commands run this session. VER-EVD-004: per-rule verdicts are in Stage 1. VER-DEL-001: the author's and the story's claims were re-executed independently |

## Status of v7 Findings

IDs continue v7's numbering, so citations of "specification review v7
FINDING-n" stay valid. Resolved and closed findings are absent from the
summary table.

| v7 ID | Severity | Status in v8 | Evidence |
|---|---|---|---|
| v7 FINDING-1 | HIGH | **Owner-open** (carried) | Unchanged subjects. CONST-SEC 1.2, now in force, still records the question as the owner's (Exception Record, line 367) |
| v7 FINDING-2 | HIGH | **Owner-open** (carried, evidence refreshed) | massive-client §14 item 7 (lines 933-944) unchanged. The ratios request now matches the SDK. Each ratios row fails `FinancialStatement` validation, so `fetch_financials` raises `ProviderContractViolation` and returns none of the three statements either (`client.py` lines 120-141, 299-303) |
| v7 FINDING-6 to FINDING-9 | MEDIUM | **Carried by owner choice** | Subjects digest-unchanged |
| v7 FINDING-10 | LOW | **Closed, overtaken by events** | (b) is moot: CONST-SEC 1.2 came into force at the pinned revision, so clause 2a and runtime-config item 5 are both in force. (a) is handled by E3-S6's approved landing rule: E3-S6 reaches `main` only in the same merge as E3-S7, which makes the script change. With clause 2a in force, "when clause 2a takes effect" in item 5 is now satisfied |
| v7 FINDING-11 | LOW | **Remaining** | runtime-config unchanged. Lines shifted +6 by the approval block |
| v7 FINDING-12 | LOW | **Remaining in the design** | (a) is covered at story level by DAC-E3-S6-5, and (c) is recorded in E3-S6's open questions. runtime-config is unchanged |
| v7 FINDING-13 | LOW | **(a) resolved with FINDING-19; (b) remaining** | v12 §8 item 13 (lines 794-796) and the §2.2b comment (line 165) are unchanged |
| v7 FINDING-14 to FINDING-17 | LOW | **Remaining** | Unchanged text. FINDING-17 is massive-client §14 item 2, unchanged in v12 |
| v7 FINDING-18 | LOW | **Remaining** | v12 still pins tech-stack v3 (frontmatter lines 25-26). §12 still labels capability v6 and system design v3 (lines 857-859) |
| v7 FINDING-19 | MEDIUM | **Resolved** | All of v7's recommendations are adopted in v12 §2.2b and §7 and verified by probe: the `vx` path is exercised, `vx.retries == 0` is asserted, the production governor is specified, the fake's `retries` contract is stated, and DEC-0038's outcome is superseded by DEC-0042. The residual gaps are new LOW findings FINDING-22 to FINDING-24 |
| v7 FINDING-20 | LOW | **Remaining in the design** | Resolved at story level by DEC-0040 (E3-S7 omits the literal). runtime-config §7 lines 834 and 836 are unchanged |
| v7 FINDING-21 | LOW | **Remaining in the design** | DEC-0041 adds the loopback `http` form to DAC-E3-S6-16, and the probe confirms it holds. v12 §7's no-proxy row (line 743) was not aligned with it |

## Stage 1 -- Specification Compliance of the Change

The table gives one verdict per new or changed rule in massive-client v12
(VER-EVD-004). PASS means four things hold: the rule agrees with its
governing sources, it has a test row, the row's assertions hold on the
locked SDK and the code, and the row agrees with E3-S6. Line numbers refer
to `2cfc504`.

| Rule | Location | Governing source | Test row | Fresh evidence | Verdict |
|------|----------|------------------|----------|----------------|---------|
| A refused redirect is retried `max_attempts` times, every request goes to the configured host, and the read raises `ProviderUnavailable` | §2.2b lines 202-208 | DEC-0042; governor §2.2, §2.5, AC-6; constraint 5.13; CONST-SEC 1.2 SEC-ENC-001 condition (2) | §7 line 742 | Main-pool probe; `client.py` 282-288; `rate_limit.py` 171-175 | PASS, FINDING-22 |
| The test drives a main-pool read and a `vx` read socket-free (DEC-0038, DEC-0042) | §2.2b lines 213-216 | DEC-0038 harness; DEC-0042 | §7 line 742 | Probe (no socket opened) | PASS |
| `retries == 0` on `RESTClient` and on `vx` | §7 line 741 | DAC-E3-S6-10; v7 FINDING-19 | the row | SDK-config probe | PASS |
| The fake records scheme, host and path, and returns the passed `retries` | §7 line 742 | DAC-E3-S6-12; v7 FINDING-19 (c) | the row | Negative-control probe | PASS |
| Main-pool read under the production governor: `ProviderUnavailable`, `max_attempts` requests, all `https` to `api.massive.com`, none to the target | §7 line 742 | DAC-E3-S6-13; DEC-0042 | the row | Main-pool probe | PASS, FINDING-24 (a) |
| The `vx` read is driven so that the first redirect is on `/vX/`, by either route; the test fails without a `/vX/` request | §7 line 742 | DAC-E3-S6-14; DEC-0042 | the row | Route 1 and route 2 probes; path-discriminator probe | PASS, FINDING-23, FINDING-24 (b) |
| `retries=3` control records requests to the target | §7 line 742 | DAC-E3-S6-15; DEC-0038 | the row | Control probe | PASS, FINDING-24 (c) |
| DEC-0042 supersedes DEC-0038's redirect-outcome clause; review v7 cited | §12 lines 862-863 | DEC-0042 decision and derivation | n/a | Both targets exist | PASS |
| Version 12, `draft`, approval block removed, `updated` set | frontmatter, lines 5-10, 35-38 | AGT-PROV-001; `docs/approval-gates.md` | n/a | `check-artifacts.py` (no error) | PASS, FINDING-25 |
| No-proxy row (unchanged) agrees with E3-S6 | §7 line 743 | DAC-E3-S6-16; DEC-0041 | the row | No-proxy probe | Narrower than the story (FINDING-21) |

## Stage 2 -- Artifact Quality of the Change

- **Contract.** v12 passes `check-artifacts.py --strict` with no error. The
  version is bumped, the status is `draft`, the stale approval is removed and
  the correlation ID is unchanged. The provenance timestamp and tool version
  are stale (FINDING-25).
- **Structure.** All 14 template sections are present. No diagram was added.
- **Cross-references.** DEC-0042 and review v7 resolve. The §12 Decision row
  describes DEC-0042's scope accurately ("supersedes DEC-0038's
  redirect-outcome clause").
- **Quantitative values.** `max_attempts` default 3 is cited to §3 and the
  owner decision of 2026-09-04. The row needs a `requests_per_minute`, which
  has no default and is not named (FINDING-24 (a)).
- **Placeholders.** None introduced.
- **Clarity.** The rewritten row is precise and testable. Remaining
  imprecision: the classification owner (FINDING-22), the path discriminator
  and §2.2b's "the `vX` corporate-action reads" (FINDING-23), and the
  undefined seam and control (FINDING-24).

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; assessed against the system
design.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` passed with no error and no warning. Dependency typing
(one `requires-runtime`, two `conforms-to`), 5.1 to 5.3 placement and the
STD-UI specialization are unchanged from v7 and remain valid. The capability
names no org constitution as a dependency.

#### Completeness (SR-1)

Unchanged. FINDING-9 is carried.

#### Correctness (SR-2)

No contradictory acceptance criteria and no impossible user-flow states.

#### Testability (SR-4)

All 26 criteria have an observable outcome, a concrete input and a measurable
boundary (unchanged).

#### Clarity (SR-6)

No vague modifiers in the acceptance-criteria block (unchanged).

### System Design Specification

Unchanged (v6, digest-identical). All 12 components carry stable identifiers,
and all 16 interfaces name a provider and a consumer. Constraint 5.13 ("errors
are failures"; timeouts and server errors are retried to the attempt limit)
is consistent with v12's handling of a refused redirect. FINDING-15 remains.

### Component Design Specifications

#### massive-client v12 (changed)

- **Correctness (SR-2) and Feasibility (SR-7).** Every rewritten claim holds
  on the locked SDK and the code. FINDING-23 (ii): §2.2b lines 243-245 say
  `vx` "serves the `vX` corporate-action reads", but it serves only the IPO
  read. FINDING-2 is owner-open, with refreshed evidence.
- **Consistency (SR-3).** The changed rows are consistent with E3-S6
  (DAC-E3-S6-10, S6-12 to S6-15), DEC-0042, DEC-0038 as amended, constraint
  5.13 and runtime-config item 6. FINDING-22: the classification owner is
  misstated. FINDING-21: the no-proxy row is narrower than DAC-E3-S6-16.
- **Testability (SR-4).** FINDING-23 and FINDING-24. FINDING-13 (b) is
  carried.
- **Traceability (SR-5).** §12 cites DEC-0042 and review v7. FINDING-25
  (provenance). FINDING-18 is carried.
- **Clarity (SR-6).** FINDING-17 is carried.

#### rate-limit-governor v8 (unchanged)

The design makes classification the caller's: "Classification therefore moves
to the caller", §2.3 lines 172-179; "Outcome (classified by the caller)",
§2.5 line 203; §3 lines 254-255. The code agrees: `RateLimitGovernor.execute`
consumes the `Outcome` its `classify` callable returns
(`rate_limit.py` lines 146-178). The governor's attempt bound matches v12:
AC-6, and the §7 "Timeouts consume attempts" row (three, then no fourth
request). FINDING-6, FINDING-7 and FINDING-16 are carried.

#### runtime-config v11, acquisition-runner v8 (unchanged; approved on v7)

Item 6 (lines 430-439) says urllib3 refuses a redirect "so no request leaves
the double's address". That agrees with v12, because every retried request
goes to the configured host. FINDING-11, FINDING-12, FINDING-14 and
FINDING-20 are carried. Line numbers shifted +6 by the approval block.

#### ingestion-api v6, market-data-store v6 (unchanged)

FINDING-1 is owner-open: `ingestion-api` §4 lines 313-314 and
`market-data-store` §4 lines 542-549. FINDING-2 is owner-open: the
`fundamental_observation` key at lines 245-261.

#### coverage-service, instrument-list-service, observation-writer, owner-web-app, run-journal, schema-migrator (unchanged)

No interaction with the change.

#### Feasibility (SR-7), all components

No circular dependency. The change adds no component, interface or runtime
dependency.

### UX Brief

Unchanged (v7). SR-8 coverage stands as in v6. No user-facing surface changed.

### UX Design Specification

Unchanged (v5). FINDING-8 is carried.

### Cross-Specification Consistency (SR-3)

- CROSS-SPEC-INCONSISTENCY (FINDING-22): massive-client v12 §2.2b and §7 say
  the governor classifies the refused redirect. `rate-limit-governor` §2.3,
  §2.5 and §3 say the caller classifies.
- CROSS-SPEC-INCONSISTENCY, owner-open (FINDING-1): runtime-config §2.2c and
  §14 item 6 against `ingestion-api` §4.
- CROSS-SPEC-INCONSISTENCY, owner-open (FINDING-2): the massive-client ratios
  contract against `market-data-store`'s key and the SDK.
- CROSS-SPEC-INCONSISTENCY (FINDING-15): system design §4.1 says
  "hand-written".
- **Consistent:** the attempt limit of 3 (massive-client §3, governor §3 and
  AC-7, constraint 5.13, `MassiveSettings`); `ProviderUnavailable` on
  exhaustion (massive-client §2.4, governor §2.2); `retries=0` on both pools
  (massive-client §2.2b and §7, runtime-config item 6); the pinned CONST-SEC
  revision (RC, MC, AR, DEC-0036, and now the in-force approval).

---

## Findings Summary Table

CRITICAL 0 · HIGH 2 · MEDIUM 4 · LOW 14 · **total 20**. By origin:

- 2 owner-open (v6, via v7);
- 4 carried by owner choice (v5, via v6 and v7);
- 10 remaining LOW (v6 and v7);
- 4 new LOW in this round.

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-9 / SR-3 | ingestion-api; market-data-store; runtime-config | ingestion-api §4 lines 313-314; market-data-store §4 lines 542-549; RC §2.2c lines 441-446, §14 item 6 lines 1017-1029 | **Owner-open, carried from v6 via v7; unchanged.** Production host-local channels carrying Internal data run without TLS and have no SEC-ENC-001 standing. These are the browser-to-API loopback hop, which `ingestion-api` §4 still says SEC-ENC-001 "does not engage on", and the PostgreSQL connections. CONST-SEC 1.2, now in force, leaves the question open in its Exception Record (line 367), and RC §14 item 6 records it as the constitution owner's | Release-readiness security evidence cannot be completed until the owner rules. An approved design asserts a reading the constitution does not give | The constitution owner decides: TLS, a waiver, or a further amendment (`$constitution`, standard). Then align `ingestion-api` §4 and `market-data-store` §4 and §14, and re-review them |
| FINDING-2 | HIGH | SR-2 / SR-5 | massive-client | §2.5 lines 443-459; §11 lines 842-845; §14 item 7 lines 933-944; market-data-store lines 245-261 | **Owner-open, carried from v6 via v7; impact evidence refreshed.** The ratios contract in §2.5 and §11 ("as above", "Same shape and constraints") contradicts massive 2.8.0. `FinancialRatio` carries `ticker`, `cik` and `date`, but no `period_end`, `filing_date`, `fiscal_year` or `timeframe`. `fundamental_observation` keys ratios on `fiscal_period_end`. §14 item 7 states this as open, with the capability owner as owner. Since `f7baf77` the request matches the SDK (`client.py` lines 253-256). Now every ratio row fails `FinancialStatement` validation, missing `filing_date`, `fiscal_year`, `period_end`, `tickers` and `timeframe` (probe) | As implemented, `fetch_financials` raises `ProviderContractViolation` for any instrument whose ratios read returns a row. That discards the three statements too, because results are returned only at the end (`client.py` lines 120-141) | The owner decides the ratios contract and storage mapping, or excludes ratios from AC-3. Then correct §2.5 and §11, and `market-data-store` if the key changes |
| FINDING-6 | MEDIUM | SR-5 | Rate-limit governor | §8 AC-1 amendment note, line 368 | Carried from v5, unchanged by owner choice. `docs/decision-records.md` does not exist in this repository; DEC-0002 is only in the harness | Readers cannot resolve the normative decision from the project repository | Correct the citation or mirror DEC-0002 |
| FINDING-7 | MEDIUM | SR-2 | Rate-limit governor | §2.5 final paragraph, lines 236-237 | Carried from v5, unchanged by owner choice. It says all jitter is full jitter, while the implemented boundary wait adds jitter on top (`rate_limit.py` lines 213-229, IR-005) | Misdescribes the implemented boundary wait | Specify additive boundary jitter, and keep full jitter for retry backoff |
| FINDING-8 | MEDIUM | SR-3 | UX design | §6 Source Mapping, line 715 | Carried from v5, unchanged by owner choice. It cites UX brief v6, capability v7 and system design v3; the current versions are v7, v8 and v6 | Verification points to superseded inputs | Update the three source versions |
| FINDING-9 | MEDIUM | SR-1 | Capability | §8 Readiness Assessment, line 434 | Carried from v5, unchanged by owner choice. It states 23 ACs and three open questions; the document has 26 and two | The readiness summary misstates coverage | Update the counts |
| FINDING-11 | LOW | SR-2 / SR-9 | runtime-config | item 2 lines 385-388; §7 line 833 | Remaining from v6, unchanged. `localhost` is resolved once at start. Condition (2) and Verification (d) concern every connected address, and urllib3 resolves again per connection | A residual gap against condition (2), now that clause 2a is in force | Re-check at every claim, drop `localhost` from the test entry point's set, or record the residual |
| FINDING-12 | LOW | SR-4 | runtime-config | clause 8 line 269; table lines 459, 466; item 2 lines 389-391; §7 line 838 | Remaining from v6 in the design. (a) No control-character row or test, which DAC-E3-S6-5 now adds at story level. (b) The `urlsplit`/`parse_url` agreement is untested. (c) The table gives `http://::1:8126` as "host missing", but the scheme check comes first; E3-S6 records this as needing correction | Small regressions pass the design's suite, and one table reason contradicts the validator | Add the row and the parser-agreement assertion, and correct the reason at the next runtime-config revision |
| FINDING-13 | LOW | SR-6 | massive-client | §8 item 13 lines 794-796; §2.2b line 165 | Remaining from v6 in part (b); part (a) is resolved with FINDING-19. Item 13 and the code comment still say `runtime-config` guarantees `https` without qualification, while §4 (lines 628-630) qualifies it "in the release build" | Overstates a guarantee for non-release builds, now that clause 2a is in force | Qualify both with "in the release build" |
| FINDING-14 | LOW | SR-6 | runtime-config | §3 line 722; §14 item 3 line 970; §2.3 line 537 vs §2.2c line 475; §12 line 927 vs item 6 line 438 | Remaining from v6 and v7, unchanged. "Section 2.4a" does not exist. The "test in section 7" is in `ingestion-api` §7. §2.3 declares `MassiveSettings(BaseSettings)` against the snippet's `_EnvNamedSettings`. The §12 Decision row (DEC-0031 to DEC-0037) omits DEC-0038, which item 6 relies on | Readers land on the wrong text (SA-MD-002) | Fix the three pointers and extend the §12 row to DEC-0038 |
| FINDING-15 | LOW | SR-3 | System design | §4.1 line 298 | Remaining from v6. `massive-client` is described as a "Hand-written HTTP client" | The system description contradicts the SDK-based design | Reword at the next system-design revision |
| FINDING-16 | LOW | SR-4 | Rate-limit governor | §8 AC-11, lines 385-386 | Carried from v5. A concurrent-caller criterion under a single-threaded model | Vacuously satisfied | Record it as vacuous, or restate it |
| FINDING-17 | LOW | SR-6 | massive-client | §14 item 2 lines 892-903 | Carried from v5, unchanged in v12. It still says it blocks the governor throttle path, which governor §2.5 and constraint 5.13 already provide | Reports a discharged blocker | Mark it resolved |
| FINDING-18 | LOW | SR-3 | All component designs; system design | Provenance and References tables; massive-client v12 lines 25-26, 857-859 | Carried from v5. v12 still pins tech-stack v3 (v4 is current; the known pre-existing warning). Its §12 labels the capability v6 and the system design v3 (current: v8 and v6). The same holds for the designs v7 listed | Repeated checker warnings, and stale labels in a design awaiting approval | Propagate current versions |
| FINDING-20 | LOW | SR-2 / SR-4 | runtime-config | §7 lines 834 and 836; item 3 lines 401-403 | Remaining from v7 in the design. Two test rows contradict on the literal `e2e-test-key`. DEC-0040 settles it for CAP-001-E3-S7 (the literal is omitted from the refused set), but the design is unchanged | `$test-design` reading the design meets the contradiction. The story is correct | Align runtime-config §7 line 834 with DEC-0040 at its next revision |
| FINDING-21 | LOW | SR-9 / SR-4 | massive-client; runtime-config | MC §7 line 743; RC condition table line 312, item 6 lines 430-439 | Remaining from v7 in the design. Verification (e) concerns the clause 2a loopback `http` channel, but the row asserts pool types and `proxy is None` on the `https` base only. DEC-0041 adds the `http://127.0.0.1:8126` form to DAC-E3-S6-16, and the probe shows it holds. v12 aligned the redirect row with E3-S6 but not this one | The design row that `$test-design` reads is narrower than the approved story. The evidence for (e) depends on the story, not the design | Add DAC-E3-S6-16's third assertion to the §7 no-proxy row, citing DEC-0041 |
| FINDING-22 | LOW | SR-3 / SR-6 | massive-client | §2.2b lines 204-205; §7 line 742 ("because the governor classifies the refused redirect as retryable") | **New.** v12 says "The governor classifies that error as retryable". The governor design gives classification to the caller (§2.3 lines 172-179, §2.5 line 203, §3 lines 254-255). In code, the mapping is `MassiveClient._through_governor.classify`, which returns `RETRYABLE` for any non-`BadResponse` (`client.py` lines 282-284). The governor only consumes the `Outcome` (`rate_limit.py` lines 146-178). DEC-0042's question repeats the wording, while its derivation names `_through_governor` correctly | The ownership of the outcome is misstated. A later decision to treat a refused redirect differently (for example as `FATAL`, which would cost one request instead of `max_attempts`) belongs in `massive-client`'s classifier and §2.4. The design points it at the governor | Reword both places: "`massive-client`'s classifier maps the non-`BadResponse` `MaxRetryError` to `RETRYABLE`, so the governor retries it up to `max_attempts`". Optionally state the non-`BadResponse` rule in §2.4 |
| FINDING-23 | LOW | SR-4 / SR-2 | massive-client | §7 line 742 (`vx` read, route 2, and "the test fails when no `/vX/` request is recorded"); §2.2b lines 243-245 | **New.** A `/vX/` path does not identify the `vx` sub-client. The SDK's `get_ticker_events` is a main-pool read of `/vX/reference/tickers/{id}/events` (`massive/rest/reference.py` line 181). `VXClient` serves only `/vX/reference/financials` and `/vX/reference/ipos` (`vX.py` lines 69, 113). Probe: a ticker-events read recorded 3 `/vX/` requests, all via the main pool. Route 2 works today because `fetch_corporate_actions` calls the IPO read before ticker events (`client.py` lines 192-218); the probe records 3 via `vx`. The guard would still pass if that order changed. So E3-S6 DAC-14's "cannot pass while exercising only the main pool" holds only by call order. Separately, §2.2b says `vx` "serves the `vX` corporate-action reads in section 2.5", plural, but of those two it serves only IPOs | A reordering of `fetch_corporate_actions` would let route 2 pass on the main pool, reopening v7 FINDING-19 (a). This is mitigated by the structural `vx.retries == 0` assertion | In route 2, assert the `/vX/` requests are `/vX/reference/ipos`, or that the recording pool belongs to `vx`'s `PoolManager`. Correct §2.2b to "the IPO read" |
| FINDING-24 | LOW | SR-4 / SR-6 / SR-7 | massive-client | §7 line 742 (harness, `vx` route 1, control) | **New. The harness is under-specified in three ways.** (a) "Built from production settings" leaves `requests_per_minute` unset: it is required with no default (`settings.py` line 112, governor §3). `monotonic` is not among the injected collaborators, so `_acquire_permit` waits on the real clock whenever the budget is below the requests one governor issues (3 for the main-pool read, 5 for route 2). Probe: at 2 per minute, `fetch_reference` took 30.0 s wall, so "so the test does not wait" fails. (b) "The client's governor seam" is not defined: §2.3's interface has four public methods, and in code the seam is the private `MassiveClient._through_governor` (`client.py` line 281). (c) "A control client built with `retries=3`" cannot be a `MassiveClient`: it takes no `retries` and hard-codes 0 (`client.py` line 58; probe `TypeError`). E3-S6 DAC-15's "the same main-pool read" is therefore not literally buildable. Text (c) is unchanged since v11 | Two implementers can build different harnesses, and one can make the unit suite slow without failing | State that the budget is no smaller than the requests the test issues per governor, or inject `monotonic` too, as governor §7 does with its fake clock. Name `_through_governor` as the seam for route 1. State that the control is a bare `RESTClient(retries=3)` calling `get_ticker_details` |
| FINDING-25 | LOW | SR-5 | massive-client | frontmatter lines 16-17 | **New.** AGT-PROV-001: v12 kept v11's `tool_version: "2.1.295"` and set `timestamp: 2026-10-10T00:00:00Z`. v12 was committed at 02:18:58Z (`2cfc504`) in the session whose `Claude-Session` trailer it carries. That session recorded `2.1.296` in backlog review v12 at 02:03:08Z, and in E3-S6 v3 at 22:53Z the day before. `claude --version` reports 2.1.296 | The provenance does not identify the tool or time that produced this version | Set `tool_version` and `timestamp` to the producing run's values at the next edit |

---

## Traceability Matrix

| Layer | Coverage | Evidence |
|-------|----------|----------|
| Capability to system design | 26/26 | System design §7 (unchanged) |
| Capability to UX design | 26/26 | UX design §5 (unchanged) |
| Capability to component designs | 26/26 | Every AC is referenced by at least one component design; unchanged by v12 |
| System components to component designs | 12/12 | One design per component; `build-architecture.py` PASSED |

Changed design elements in v12:

| Design element | Capability AC | Constitution or decision | Story criterion | Component AC or test |
|---|---|---|---|---|
| MC §2.2b: a refused redirect is retried to `max_attempts` and raises `ProviderUnavailable` | AC-13 | SEC-ENC-001 condition (2); DEC-0042; constraint 5.13 | DAC-E3-S6-13, S6-14 | MC AC-8; §7 line 742 |
| MC §7: `vx.retries == 0` | AC-13 | DEC-0042 | DAC-E3-S6-10 | §7 line 741 |
| MC §7 redirect row: harness, main-pool, `vx` and control | AC-13 | SEC-ENC-001 Verification (d); DEC-0038, DEC-0042 | DAC-E3-S6-12 to S6-15 | §7 line 742 |
| MC §12: DEC-0042, review v7 | n/a | DEC-0042 | n/a | n/a |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

There are no CRITICAL findings, so the verdict is not NOT-READY. Two HIGH
findings remain, so it is not READY. Both are owner-open items that v6 and v7
recorded and that are unchanged here:

- **FINDING-1**, the standing of host-local plaintext channels, blocks the
  release-readiness security evidence.
- **FINDING-2**, the ratios contract, blocks the ratios read and AC-3's ratios
  fundamentals. As the code stands, it also blocks every financials read for
  an instrument with ratio rows.

Neither blocks epic generation or test design.

The refinement did what it set out to do. v7 FINDING-19 is resolved, and
massive-client §7 now agrees with CAP-001-E3-S6 and DEC-0042, so
`$test-design` can read the redirect row as written. Each assertion holds on
the locked SDK and the current code. The four new findings are LOW wording
and harness-precision gaps. None changes behaviour, and none makes the
specified test wrong today.

The rubric defines readiness as this verdict and no numeric score, so none is
given.

**This verdict is review evidence, not approval.**

- `component-design-massive-client.md` v12 is `draft`. It stays blocked from
  epic generation and test design until the owner explicitly approves it,
  with `python3 scripts/artifact-gate.py approve --project factorflow-v2
  --artifact
  docs/capabilities/CAP-001-market-data-acquisition-foundation/design/component-design-massive-client.md
  --review-artifact
  docs/capabilities/CAP-001-market-data-acquisition-foundation/specifications-review-report-v8.md`.
- READY-WITH-WARNINGS is a passing verdict for that command.
- The other 15 subjects keep their existing approvals, because this report
  covers them at the same id, version and content revision.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-1 (owner-open): the constitution owner rules on host-local
   plaintext channels. Then align `ingestion-api` §4 and `market-data-store`.
2. FINDING-2 (owner-open): the capability owner decides the ratios contract
   and storage, or excludes ratios. Then correct massive-client §2.5 and §11.

### Should Fix (MEDIUM findings)

3. FINDING-6 to FINDING-9: the carried v5 items, held by owner choice.

### Nice to Have (LOW findings)

4. FINDING-22 to FINDING-25: the v12 wording, harness and provenance fixes.
   They are cheap to fold into the next massive-client edit. FINDING-21 can
   go in the same edit (add DAC-E3-S6-16's loopback assertion).
5. FINDING-11 to FINDING-14, FINDING-20: the residual runtime-config and
   massive-client gaps, several already corrected at story level.
6. FINDING-15 to FINDING-18: system-design wording and the carried items.

---

## Observations Outside the Review Subjects

These are not findings against the specifications.

- **CONST-SEC 1.2 is in force.** It was approved at 2026-10-09T21:00:28Z on
  `security-review-v3.md`, and its revision equals the pin. Clause 2a and
  runtime-config item 5 are therefore in force, as E3-S6 and DEC-0039 state.
  Any later edit to the constitution's text, other than `status` or
  `approval`, changes its revision and holds clause 2a until a re-pin and
  re-review (RC §2.2c).
- **Downstream pins.** `CAP-001-E3` v4, `CAP-001-E3-S6` v3 and `CAP-001-E3-S7`
  v3 pin massive-client v11. These are the three new `check-artifacts.py`
  warnings. Once v12 is approved, the stories' pins and any task plan made
  from them should reference v12.
- **Decision-record hygiene.** DEC-0042's derivation still says "The section 7
  row is to be aligned by $doc-sync after E3-S6 is implemented". That was
  superseded by E3-S6's "design refinement required" (`6189e8d`) and is now
  done by v12. DEC-0042 is `status: open`, `owner_reviewed: false` and
  `commits: []`, although `2cfc504` carries `Decision-Id: DEC-0042`. DEC-0038
  is not annotated as partly superseded. v12 §12 records that.
- **Corrections to v7 (REV-RCV-002).** (1) v7 FINDING-19's impact said `vx`
  "serves the IPO and ticker-event reads". The SDK serves ticker events from
  the main client (FINDING-23). (2) v7 FINDING-2's impact cited `client.py`
  passing `tickers=` to all four financials methods. `f7baf77`, which reached
  the branch between v7's reading base `7f4b9fe` and its report commit,
  already special-cased ratios. The defect remains, moved to validation
  (refreshed above).
- **Script reach.** `build-architecture.py`, `check-capabilities.py` and
  `check-artifacts.py` ran through the shim as directed. From the shim,
  `check-references.py` scanned nothing and `check-constitutions.py` failed
  on the missing `.agents/skills/`. Both were re-run read-only at the harness
  root, which left its working tree clean.
- **WebSocket proxies.** v7's observation still applies: the SDK's WebSocket
  client honours proxy variables. That is out of scope until M3.
