---
artifact_schema_version: 1
artifact_id: CAP-001-specification-review
artifact_type: specification-review
artifact_version: 9
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-10
updated: 2026-10-10
document: spec-review-report
capability: CAP-001
version: v9
generated: 2026-10-10T02:52:59Z
constitutions_reviewed:
  - "CONST-AGT  docs/constitutions/agent-governance.constitution.md (2.3)"
  - "CONST-MDL  docs/constitutions/model-management.constitution.md (1.3)"
  - "CONST-OPS  docs/constitutions/operational-safety.constitution.md (1.3)"
  - "CONST-REV  docs/constitutions/review.constitution.md (1.4)"
  - "CONST-SA   docs/constitutions/static-analysis.constitution.md (2.0)"
  - "CONST-SEC  docs/constitutions/security.constitution.md (1.2, in force: approval reviewed_revision equals the content revision sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc, file equal to origin/main 5ba1068)"
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
    result: "PASSED with 114 warnings, exit 0 (shim, --strict); no error. The warning lines are identical to v8's run; only the inventory line moved (specification review 7 to 8, the v8 report itself)"
  - script: check-references.py
    outcome: run
    result: "Run from the harness root as directed: PASSED, exit 0, 1041 references across 195 harness Markdown files. Does not scan the project repo"
  - script: check-constitutions.py
    outcome: run
    result: "Run from the harness root as directed: PASSED, exit 0, 10 constitutions, 36 skills"
dimension_status:
  SR-1: applied
  SR-2: applied
  SR-3: applied
  SR-4: applied
  SR-5: applied
  SR-6: applied
  SR-7: applied
  SR-8: "applied — UX brief, UX design and design-system/ unchanged since v7 (digest-identical subjects); v6's component and token resolution stands"
  SR-9: "applied — dependency and STD-UI conformance halves by check-capabilities.py; CONST-SEC 1.2 (in force) assessed by hand for the changed rows, because the checker does not read org constitutions"
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
    content_revision: sha256:7e3139a8f24f0222a333ddddc2956e1a46a8edc70fc84c31da9b2b57efa45580
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
  medium: 4
  low: 12
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.296"
  timestamp: 2026-10-10T02:52:59Z
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
| **Version** | v9 |
| **Specifications Reviewed** | Capability, system design, UX brief, UX design, 12 component designs (full set; one changed since v8) |
| **Total Findings** | 18 (0 CRITICAL, 2 HIGH, 4 MEDIUM, 12 LOW) |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

**What changed since v8.** One subject changed, and only its content
revision moved. `component-design-massive-client.md` is still v12 and still
`draft`, at `sha256:7e3139a8...5580` (commit `2d06e31`). v8 reviewed it at
`sha256:1c11f099...d04b`. The contract requires a version bump only when an
*approved* artifact is modified (`docs/artifact-contract.md`, Versioning
Rules), and v12 was never approved, so keeping v12 is permitted. The other 15
subjects are digest-identical to the revisions v8 recorded. Each was
recomputed this session with `artifact-gate.py revision`.

`2d06e31` changes 10 lines in four places: §2.2b (classifier sentence and the
`vx` IPO sentence), the §7 redirect and no-proxy rows, the §12 Decision row,
and the provenance `tool_version` and `timestamp`.

**All five v8 findings it targets are resolved** (FINDING-21 to FINDING-25).
Every changed §7 claim was re-executed on the locked SDK (massive 2.8.0,
urllib3 2.7.0) by a new socket-free probe (Supplementary Evidence):

- `massive-client`'s classifier maps `MaxRetryError` to `RETRYABLE`.
- The budget rule holds exactly. At a budget equal to the requests sent there
  is no wait (3 for the main-pool read, 5 for route 2). At 4 per minute route
  2 waited 15.0 s.
- Route 1 (`vx.list_ipos` through `_through_governor`) and route 2 each record
  3 `/vX/reference/ipos` requests, all through the `vx` `PoolManager`.
- A main-pool ticker-events read fails the new discriminator.
- The bare `RESTClient(retries=3).get_ticker_details` control sends 3 of 4
  requests to `198.51.100.7`.
- Both pools return an `HTTPConnectionPool` with `proxy=None` for
  `http://127.0.0.1:8126`. No request and no socket result.

**New in this round: 3 LOW findings, no MEDIUM or higher.**

- **FINDING-26:** §2.4 still says the corporate-action reads, plural, depend on
  `VXClient`. This is a sibling of the §2.2b sentence FINDING-23 corrected,
  which v8 did not name.
- **FINDING-27:** the redirect row's new alternative, "or with `monotonic`
  injected as well", does not say the injected `sleep` must advance that
  clock. With a frozen fake clock and a no-op sleep, the governor spins
  forever (probe).
- **FINDING-28:** §12 has no row for specification review v8, whose findings
  the new text implements.

The two HIGH findings remain owner-open as v6 to v8 recorded them, and the
four MEDIUM findings remain carried by owner choice.

## Review Scope

**Full set, depth proportional to change.** The skill defines no delta mode,
so every subject appears in `review_subjects` at its current revision.

- **Changed subject:** massive-client v12 at `2d06e31`, read in full. Every
  changed line was checked against:
  - CAP-001-E3-S6 v3 DAC-E3-S6-10 to S6-16;
  - DEC-0038, DEC-0041 and DEC-0042;
  - `component-design-rate-limit-governor.md` v8 §2.3, §2.5, §3 and §7;
  - CONST-SEC 1.2 SEC-ENC-001 condition (2) and Verification (d) and (e);
  - the code, which is byte-identical to v8's probe copy (`diff -r` empty):
    `src/factorflow/ingestion/massive/client.py`, `rate_limit.py`,
    `config/settings.py`, and `tests/unit/governor_fakes.py`.
- **Unchanged subjects (15).** Each revision equals the one v8 recorded, so
  v6 to v8's assessments stand by identity. They were re-read only where they
  interact with the change or with a carried finding.
- **Not subjects.** Epics, stories, task plans, test specifications and
  decision records are governing inputs, not subjects.
- **Repository source.** Every project-repo read used the worktree
  `usr/alvaro-de-jodra/CAP-001-massive-client-redirect` at `2d06e31`, through
  the scratch shim that maps `repos/factorflow-v2/FactorFlow-v2` to it.
  `/home/user/factorflow-v2` and `/home/user/AI-agents/repos/` were not read.
  - Probes ran in the v8 scratchpad venv holding the `uv.lock` versions, against
    v8's `git archive` copy of `src/`.
  - Nothing was written to the worktree except this report. No branch was
    switched and nothing was committed.
- **Pipeline state.** `pipeline-state.py check --stage specification-review`
  reported `AWAITING-APPROVAL`, exit 1: massive-client "approval timestamp is
  missing". That is the expected state of a refined draft. This review
  supplies evidence and approves nothing.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | v12 keeps all 14 template sections. No diagram was added. Carried: FINDING-9 |
| SR-2 Correctness | applied | Every changed §2.2b and §7 claim was re-executed. FINDING-26 is the residual of FINDING-23 (ii). FINDING-2's evidence was refreshed. FINDING-12 and FINDING-20 carried |
| SR-3 Consistency | applied | v12 was checked against E3-S6, DEC-0038/0041/0042, the governor design and the code. FINDING-22 and FINDING-21 are resolved. Carried: FINDING-1, FINDING-8, FINDING-15, FINDING-18 |
| SR-4 Testability | applied | Every new assertion was executed at the `MassiveClient` and SDK level. FINDING-23 and FINDING-24 are resolved. FINDING-27 is new. Carried: FINDING-11, FINDING-12, FINDING-16 |
| SR-5 Traceability | applied | 26/26 capability ACs are still mapped. §12 adds DEC-0041. FINDING-25 is resolved. FINDING-28 is new. Carried: FINDING-6 |
| SR-6 Clarity | applied | FINDING-22 and FINDING-24 (b) are resolved. FINDING-27 is new. Carried: FINDING-13, FINDING-14, FINDING-17 |
| SR-7 Feasibility | applied | All routes, the pool attribution (by the public `connection_from_url` identity), the control and the no-proxy assertions are feasible on the locked SDK with no socket. FINDING-27 is the one way to make the test hang |
| SR-8 UX Completeness | applied | UX artifacts and `design-system/` are unchanged since v7. `design_system_available = true` (all four configured paths present). The change has no UX surface. Carried: FINDING-8 |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` passed with no error or warning. CONST-SEC 1.2 is in force, and condition (2) and Verification (d) and (e) were re-assessed for the changed rows. FINDING-21 is resolved. Carried: FINDING-1 |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passed (12 components, 16 interfaces). The change adds no component and uses no capability as an actor |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` (shim) | run, exit 0: "1 capabilities, 3 edges, 1 standard(s), 1 conformance claim(s), 1 constitution artifact(s), 1 reference(s) ... PASSED" | none. The checker does not read org constitutions |
| `build-architecture.py -p factorflow-v2` (shim) | run, exit 0: "1 design(s), 12 component(s), 16 interface(s) PASSED" | none |
| `check-artifacts.py -p factorflow-v2 --strict` (shim) | run, exit 0: "PASSED with 114 warning(s)", no error | No new warning. The warning lines are identical to v8's run; only the inventory count moved ("specification review 7" to "8"). Massive-client v12 still pins tech-stack v3 (FINDING-18). `CAP-001-E3`, `CAP-001-E3-S6` and `CAP-001-E3-S7` still pin massive-client v11 (Observations) |
| `check-references.py` (harness root, as directed) | run, exit 0: "1041 path references across 195 Markdown files ... PASSED - every reference resolves" | none. It scans harness Markdown only. The new reference was checked by hand: DEC-0041 exists in `projects/factorflow-v2/decisions/` |
| `check-constitutions.py` (harness root, as directed) | run, exit 0: "10 constitutions, 36 skills PASSED" | none |

Prerequisites: `check-prerequisites.sh --project factorflow-v2` (shim) exited
0, with every row PASSED. The harness working tree was clean before and after
(`git status --short` empty), at `5ba1068` = `origin/main`. No constitution or
decision record changed since v8 (no commit since 2026-10-10T00:00Z touches
`docs/constitutions/` or `projects/factorflow-v2/decisions/`).

### Supplementary evidence (fresh, this session)

The probe is `v9review/scripts/v9_probe.py` in the session scratchpad. It
reuses v8's harness and adds the new claims. Before importing anything it
patches `socket.create_connection` and `socket.getaddrinfo` to fail and to
count calls. The count was 0. The key is `"TEST-ONLY-" + secrets.token_hex(16)`.

The `_make_request` fake records scheme, host, path and the pool object, and
returns the passed `retries`. It answers `302` with
`Location: https://198.51.100.7/`, or an empty `200` page where a route needs
one. Pool attribution compares the recording pool by identity with
`<manager>.connection_from_url("https://api.massive.com")`, a public urllib3
call.

| Probe | Result |
|-------|--------|
| SDK retries row | `retries == 0` on `RESTClient` and on `vx`. Both `Retry.total == 0` |
| Classifier (FINDING-22) | `_through_governor`'s `classify` returns `retryable` for `MaxRetryError` and for `ValueError`, `fatal` for a `NOT_FOUND` `BadResponse`, and `throttled` for a 429 body (`client.py` lines 281-290). The governor only consumes the `Outcome` |
| Main-pool read, rpm=3 | `ProviderUnavailable` (cause `MaxRetryError`) in 0.0 s wall. 3 requests, all `https` to `api.massive.com`, all via the main `PoolManager`, 0 to the target |
| `vx` route 1, rpm=3 (FINDING-24 (b)) | `c._through_governor(lambda: c._rest_client.vx.list_ipos(ticker="AAPL", raw=True))` gave `ProviderUnavailable` in 0.0 s. 3 `/vX/reference/ipos` requests, 3 via the `vx` `PoolManager`, 0 via main, 0 to the target |
| `vx` route 2, rpm=5 (FINDING-23, FINDING-24 (a)) | `fetch_corporate_actions` gave `ProviderUnavailable` in 0.0 s. 5 requests: splits and dividends via main, then 3 `/vX/reference/ipos` via `vx`. All to `api.massive.com` |
| Budget below the requests | Route 2 at rpm=4, with real `monotonic` and no-op `sleep`, took **15.0 s** wall. The bucket starts full (`rate_limit.py` line 112), so "no smaller than the requests sent" is the exact no-wait threshold |
| Discriminator (FINDING-23) | `get_ticker_events` through `_through_governor` recorded 3 `/vX/reference/tickers/AAPL/events` requests, all via main. The count of `/vX/reference/ipos` via `vx` is 0, so the new assertion fails, as intended. SDK: `VXClient` serves only `/vX/reference/financials` and `/vX/reference/ipos` (`massive/rest/vX.py` lines 69, 113); ticker events is `ReferenceClient` (`reference.py` line 181) |
| Control (FINDING-24 (c)) | `MassiveClient(..., retries=3)` raises `TypeError`. A bare `RESTClient(retries=3, api_key=...).get_ticker_details("AAPL")` raised `MaxRetryError`, with 3 of 4 requests to `198.51.100.7`. `fetch_reference` uses the same SDK call (`client.py` line 73), so the control is "the same main-pool read" that DAC-E3-S6-15 names |
| Injected-monotonic alternative (FINDING-27) | rpm=2, `fetch_reference`. (i) A fake clock advanced by the injected `sleep`: done in 0.00 s, `ProviderUnavailable` after 3 requests. (ii) A frozen fake `monotonic` and no-op `sleep` at rpm=3: done in 0.00 s. (iii) A frozen fake `monotonic` and no-op `sleep` at rpm=2: **still running after 5 s**, stuck after 2 requests in `_acquire_permit` (`rate_limit.py` lines 182-200). It never refills, because elapsed time is always 0 |
| No-proxy row with DEC-0041 (FINDING-21) | Proxy variables set to `http://127.0.0.1:9` and `NO_PROXY` unset. Main and `vx` are each `PoolManager`, not `ProxyManager`. The `https` base gives `HTTPSConnectionPool` with host `api.massive.com` and `proxy=None`. `http://127.0.0.1:8126` gives exactly `HTTPConnectionPool` (not the `HTTPS` subclass) with port 8126 and `proxy=None`. 0 requests were recorded while building pools |
| Ratios (FINDING-2 evidence) | v8's `ratios_probe.py` re-run: a `FinancialRatio`-shaped row fails `FinancialStatement` validation, missing `filing_date`, `fiscal_year`, `period_end`, `tickers` and `timeframe` |
| CONST-SEC in force | `artifact-gate.py revision --repo-dir . --artifact docs/constitutions/security.constitution.md` gives `sha256:82059ecd...cbcc`. That equals `approval.reviewed_revision` (line 10) and the pins. The file equals `origin/main` (`5ba1068`) |
| Provenance (FINDING-25) | `claude --version` reports 2.1.296. v12's `timestamp: 2026-10-10T02:45:19Z` precedes the `2d06e31` commit time, 02:45:41Z |

## Constitutions Applied

All seven constitutions the relevance matrix assigns `specification-review`
were read. None changed since v8.

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | AGT-PROV-001: `tool_version` and `timestamp` were refreshed (FINDING-25 resolved). v12 is unapproved, so keeping the version on modification complies. AGT-EVIDENCE-002: the new counts derive from cited values. 3 is `max_attempts` default, cited to §3 and the owner decision of 2026-09-04. 5 is the two main-pool requests named in the same sentence plus 3. AGT-AUTH-001: this review approves nothing |
| CONST-MDL 1.3 | MDL-PIN-002: the exact model identifier `claude-opus-5-5` is recorded |
| CONST-OPS 1.3 | Probes ran in scratch directories with no socket. The frozen-clock thread was a daemon, and the probe ended with `os._exit`, so no process was left spinning. OPS-LOOP-001 bears on FINDING-27: one documented harness choice yields an unbounded loop |
| CONST-REV 1.4 | REV-STG-001: Stage 1 and Stage 2 are reported separately below. REV-RCV-001: `2d06e31`'s claims were re-executed, not accepted. REV-RCV-002: v8 omissions are corrected (Observations) |
| CONST-SA 2.0 | SA-MD-001: template conformance passes. SA-MD-002: the new DEC-0041 reference resolves. FINDING-14 is carried |
| CONST-SEC 1.2 | In force at the pinned revision. SEC-ENC-001 condition (2) and Verification (d): no redirect is followed on either pool, now attributed to the `vx` `PoolManager` explicitly. Verification (e): the no-proxy row now covers the clause 2a channel's `http` loopback form. The Exception Record's open question on other host-local plaintext channels is unchanged (FINDING-1) |
| CONST-VER 1.2 | VER-EVD-001: every verdict rests on commands run this session. VER-EVD-004: per-rule verdicts are in Stage 1. VER-DEL-001: the author's claims were re-executed independently |

## Status of v8 Findings

IDs continue v8's numbering. Resolved findings are absent from the summary
table.

| v8 ID | Severity | Status in v9 | Evidence |
|---|---|---|---|
| v8 FINDING-1 | HIGH | **Owner-open** (carried) | Unchanged subjects. CONST-SEC 1.2 still records the question as the owner's (Exception Record, line 367) |
| v8 FINDING-2 | HIGH | **Owner-open** (carried) | massive-client §2.5, §11 and §14 item 7 text unchanged (lines now 445-461, 844-847, 935-946). Ratios probe re-run: same validation failure |
| v8 FINDING-6 to FINDING-9 | MEDIUM | **Carried by owner choice** | Subjects digest-unchanged |
| v8 FINDING-11, FINDING-12, FINDING-14, FINDING-20 | LOW | **Remaining** | runtime-config digest-unchanged |
| v8 FINDING-13 | LOW | **Remaining** ((b)) | massive-client §8 item 13 (now lines 796-798) and the §2.2b comment (line 165) still say `runtime-config` guarantees `https` unqualified. §4 lines 630-632 qualify it |
| v8 FINDING-15, FINDING-16 | LOW | **Remaining** | System design and governor digest-unchanged |
| v8 FINDING-17 | LOW | **Remaining** | massive-client §14 item 2 (now lines 894-905) unchanged |
| v8 FINDING-18 | LOW | **Remaining** | v12 still pins tech-stack v3 (lines 25-26). §12 still labels capability v6 and system design v3 (lines 859-860) |
| v8 FINDING-21 | LOW | **Resolved** | §7 no-proxy row (line 745) now carries DAC-E3-S6-16's third assertion, word for word, citing DEC-0041. §12 adds DEC-0041. Probe confirms |
| v8 FINDING-22 | LOW | **Resolved** | §2.2b (lines 204-207) and §7 (line 744) now attribute the `RETRYABLE` mapping to `massive-client`'s classifier in `_through_governor`. That matches governor §2.3, §2.5 and §3 and `client.py` lines 283-284. v8's optional §2.4 addition was not made, which is acceptable |
| v8 FINDING-23 | LOW | **Resolved as scoped** | Route 2 now asserts the `/vX/reference/ipos` requests number `max_attempts` and go through the `vx` `PoolManager`. The row explains why a `/vX/` path alone is insufficient, and §2.2b (lines 245-246) says "the IPO read". Probe: the assertion passes for both routes and fails for a main-pool ticker-events read. The §2.4 sibling sentence was not in v8's scope and is new FINDING-26 |
| v8 FINDING-24 | LOW | **Resolved** | (a) The row names `GovernorSettings.from_massive_settings` and the budget rule, which the probe confirms exactly (5: 0.0 s; 4: 15.0 s). (b) It names `MassiveClient._through_governor` as the seam. (c) It names the control as a bare `RESTClient(retries=3)` calling `get_ticker_details`. The added alternative introduces FINDING-27 |
| v8 FINDING-25 | LOW | **Resolved** | `tool_version: "2.1.296"`, `timestamp: 2026-10-10T02:45:19Z` (lines 16-17) |

## Stage 1 -- Specification Compliance of the Change

The table gives one verdict per changed rule in `2d06e31` (VER-EVD-004). PASS
means four things hold: the rule agrees with its governing sources, it has a
test row, its assertions hold on the locked SDK and the code, and it does not
contradict E3-S6. Line numbers refer to `2d06e31`.

| Rule | Location | Governing source | Test row | Fresh evidence | Verdict |
|------|----------|------------------|----------|----------------|---------|
| The classifier in `_through_governor` maps any non-`BadResponse` error, `MaxRetryError` included, to `RETRYABLE`, and the governor retries it to `max_attempts` | §2.2b lines 204-210; §7 line 744 | Governor §2.3, §2.5, §3; DEC-0042; constraint 5.13 | §7 line 744 | Classifier probe; `client.py` 281-290 | PASS |
| `vx` serves the IPO read (`/vX/reference/ipos`) | §2.2b lines 245-246 | SDK `vX.py` lines 69, 113 | n/a | SDK read | PASS (residual elsewhere: FINDING-26) |
| The governor is built with `from_massive_settings`, the budget is no smaller than the requests sent, and `sleep`/`jitter` are injected | §7 line 744 | Governor §3; `rate_limit.py` 66-78, 112, 182-200 | the row | rpm 3/5: 0.0 s; rpm 4: 15.0 s | PASS |
| ... "or with `monotonic` injected as well" | §7 line 744 | Governor §7 (fake clock) | the row | Frozen clock with no-op sleep hangs | Under-specified (FINDING-27) |
| Route 1: `vx.list_ipos` through `MassiveClient._through_governor` | §7 line 744 | DAC-E3-S6-14; DEC-0042 | the row | Route 1 probe | PASS |
| `/vX/reference/ipos` requests number `max_attempts`, go through the `vx` `PoolManager`, and the test fails without one | §7 line 744 | DAC-E3-S6-14 (stricter); v8 FINDING-23 | the row | Route 1, route 2 and discriminator probes | PASS |
| Control: bare `RESTClient(retries=3)` calling `get_ticker_details` records requests to the target | §7 line 744 | DAC-E3-S6-15; DEC-0038 | the row | Control probe; `client.py` line 73 | PASS |
| No-proxy: on both pools, `http://127.0.0.1:8126` gives `HTTPConnectionPool` with `proxy is None`, and building a pool sends nothing | §7 line 745 | DAC-E3-S6-16; DEC-0041; SEC-ENC-001 Verification (e) | the row | No-proxy probe (0 requests, 0 sockets) | PASS |
| §12 Decision row adds DEC-0041 | §12 line 864 | DEC-0041 | n/a | Target exists | PASS. No review v8 row (FINDING-28) |
| Provenance refreshed; version kept at 12 on an unapproved draft | frontmatter lines 5-17 | AGT-PROV-001; `docs/artifact-contract.md` Versioning Rules | n/a | `check-artifacts.py` (no error); `claude --version` | PASS |

## Stage 2 -- Artifact Quality of the Change

- **Contract.** v12 passes `check-artifacts.py --strict` with no error, and
  no new warning. Status `draft`, no approval block, correlation ID unchanged,
  provenance current.
- **Structure.** All 14 template sections present. No diagram added.
- **Cross-references.** DEC-0041 resolves. The §12 Decision row describes it
  accurately ("the no-proxy test's loopback `http` pool assertion"). The
  changed text derives from specification review v8, which §12 does not list
  (FINDING-28).
- **Quantitative values.** `max_attempts` default 3 is cited. The 3 and 5
  request counts derive from it and from the requests the same sentence names.
  `8126` comes from DEC-0041.
- **Placeholders.** None introduced.
- **Clarity.** The changed sentences are precise, and each assertion is
  machine-checkable. The one imprecision is the injected-clock alternative
  (FINDING-27). One line break in §2.2b (line 207, "`max_attempts` times,
  every one") is cosmetic and does not render.

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; assessed against the system
design.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` passed with no error and no warning. Dependency typing
(one `requires-runtime`, two `conforms-to`), 5.1 to 5.3 placement and the
STD-UI specialization are unchanged from v8 and remain valid. The capability
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
and all 16 interfaces name a provider and a consumer. Constraint 5.13 is
consistent with v12's handling of a refused redirect. FINDING-15 remains.

### Component Design Specifications

#### massive-client v12 at `2d06e31` (changed)

- **Correctness (SR-2) and Feasibility (SR-7).** Every changed claim holds on
  the locked SDK and the code. FINDING-26: §2.4 lines 394-397 still attribute
  the corporate-action reads, plural, to `VXClient`. FINDING-2 is owner-open.
- **Consistency (SR-3).** The classifier's ownership now agrees with the
  governor design and the code. Against E3-S6, the §7 rows are equal or
  stricter, and none contradicts it:
  - DAC-E3-S6-14 is satisfied by any test meeting the `vx` `PoolManager`
    assertion;
  - DAC-E3-S6-15's "same main-pool read" is the same SDK call
    (`get_ticker_details`);
  - DAC-E3-S6-16 is now matched word for word.
- **Testability (SR-4).** FINDING-27. FINDING-13 (b) is carried.
- **Traceability (SR-5).** FINDING-28. FINDING-18 is carried.
- **Clarity (SR-6).** FINDING-17 is carried.

#### rate-limit-governor v8 (unchanged)

Classification belongs to the caller (§2.3, §2.5, §3), and v12 now says so. §7
specifies "a fake clock and a stub sender". The repository's fakes couple the
two: `FakeClock` advances only through `advance` or a bound `FakeSleeper`
(`tests/unit/governor_fakes.py` lines 14-42). That coupling is what FINDING-27
asks v12 to state. FINDING-6, FINDING-7 and FINDING-16 are carried.

#### runtime-config v11, acquisition-runner v8 (unchanged)

Item 6 still agrees with v12: every retried request goes to the configured
host. FINDING-11, FINDING-12, FINDING-14 and FINDING-20 are carried.

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

- **Resolved:** the classifier's ownership (v8 FINDING-22). massive-client
  §2.2b and §7 now agree with `rate-limit-governor` §2.3, §2.5 and §3.
- CROSS-SPEC-INCONSISTENCY, owner-open (FINDING-1): runtime-config §2.2c and
  §14 item 6 against `ingestion-api` §4.
- CROSS-SPEC-INCONSISTENCY, owner-open (FINDING-2): the massive-client ratios
  contract against `market-data-store`'s key and the SDK.
- CROSS-SPEC-INCONSISTENCY (FINDING-15): system design §4.1 says
  "hand-written".
- **Consistent:**
  - the attempt limit of 3 (massive-client §3, governor §3, constraint 5.13,
    `MassiveSettings`);
  - `ProviderUnavailable` on exhaustion;
  - `retries=0` on both pools;
  - the no-proxy assertions (massive-client §7 = DAC-E3-S6-16 = DEC-0041);
  - the pinned CONST-SEC revision.

---

## Findings Summary Table

CRITICAL 0 · HIGH 2 · MEDIUM 4 · LOW 12 · **total 18**. By origin:

- 2 owner-open (v6, via v7 and v8);
- 4 carried by owner choice (v5);
- 9 remaining LOW (v5 to v7);
- 3 new LOW in this round.

5 of v8's findings (FINDING-21 to FINDING-25) are resolved.

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-9 / SR-3 | ingestion-api; market-data-store; runtime-config | ingestion-api §4 lines 313-314; market-data-store §4 lines 542-549; RC §2.2c lines 441-446, §14 item 6 lines 1017-1029 | **Owner-open, carried from v6; unchanged.** Production host-local channels carrying Internal data run without TLS and have no SEC-ENC-001 standing. These are the browser-to-API loopback hop, which `ingestion-api` §4 says SEC-ENC-001 "does not engage on", and the PostgreSQL connections. CONST-SEC 1.2, in force, leaves the question open in its Exception Record (line 367) | Release-readiness security evidence cannot be completed until the owner rules. An approved design asserts a reading the constitution does not give | The constitution owner decides: TLS, a waiver, or a further amendment (`$constitution`, standard). Then align `ingestion-api` §4 and `market-data-store` §4 and §14, and re-review them |
| FINDING-2 | HIGH | SR-2 / SR-5 | massive-client | §2.5 lines 445-461; §11 lines 844-847; §14 item 7 lines 935-946; market-data-store lines 245-261 | **Owner-open, carried from v6; unchanged.** The ratios contract in §2.5 and §11 ("as above", "Same shape and constraints") contradicts massive 2.8.0. `FinancialRatio` carries `ticker`, `cik` and `date`, but no `period_end`, `filing_date`, `fiscal_year` or `timeframe`. `fundamental_observation` keys ratios on `fiscal_period_end`. The ratios probe re-run gives the same result: every ratio row fails `FinancialStatement` validation | As implemented, `fetch_financials` raises `ProviderContractViolation` for any instrument whose ratios read returns a row, discarding the three statements too (`client.py` lines 120-141) | The owner decides the ratios contract and storage mapping, or excludes ratios from AC-3. Then correct §2.5 and §11, and `market-data-store` if the key changes |
| FINDING-6 | MEDIUM | SR-5 | Rate-limit governor | §8 AC-1 amendment note, line 368 | Carried from v5, unchanged by owner choice. `docs/decision-records.md` does not exist in this repository; DEC-0002 is only in the harness | Readers cannot resolve the normative decision from the project repository | Correct the citation or mirror DEC-0002 |
| FINDING-7 | MEDIUM | SR-2 | Rate-limit governor | §2.5 final paragraph, lines 236-237 | Carried from v5, unchanged by owner choice. It says all jitter is full jitter, while the implemented boundary wait adds jitter on top (`rate_limit.py` lines 213-229, IR-005) | Misdescribes the implemented boundary wait | Specify additive boundary jitter, and keep full jitter for retry backoff |
| FINDING-8 | MEDIUM | SR-3 | UX design | §6 Source Mapping, line 715 | Carried from v5, unchanged by owner choice. It cites UX brief v6, capability v7 and system design v3; the current versions are v7, v8 and v6 | Verification points to superseded inputs | Update the three source versions |
| FINDING-9 | MEDIUM | SR-1 | Capability | §8 Readiness Assessment, line 434 | Carried from v5, unchanged by owner choice. It states 23 ACs and three open questions; the document has 26 and two | The readiness summary misstates coverage | Update the counts |
| FINDING-11 | LOW | SR-2 / SR-9 | runtime-config | item 2 lines 385-388; §7 line 833 | Remaining from v6, unchanged. `localhost` is resolved once at start. Condition (2) and Verification (d) concern every connected address, and urllib3 resolves again per connection | A residual gap against condition (2), now that clause 2a is in force | Re-check at every claim, drop `localhost` from the test entry point's set, or record the residual |
| FINDING-12 | LOW | SR-4 | runtime-config | clause 8 line 269; table lines 459, 466; item 2 lines 389-391; §7 line 838 | Remaining from v6 in the design. (a) No control-character row or test; DAC-E3-S6-5 adds it at story level. (b) The `urlsplit`/`parse_url` agreement is untested. (c) The table gives `http://::1:8126` as "host missing", but the scheme check comes first | Small regressions pass the design's suite, and one table reason contradicts the validator | Add the row and the parser-agreement assertion, and correct the reason at the next runtime-config revision |
| FINDING-13 | LOW | SR-6 | massive-client | §8 item 13 lines 796-798; §2.2b line 165 | Remaining from v6, part (b). Item 13 and the code comment still say `runtime-config` guarantees `https` without qualification, while §4 (lines 630-632) qualifies it "in the release build" | Overstates a guarantee for non-release builds, now that clause 2a is in force | Qualify both with "in the release build" |
| FINDING-14 | LOW | SR-6 | runtime-config | §3 line 722; §14 item 3 line 970; §2.3 line 537 vs §2.2c line 475; §12 line 927 vs item 6 line 438 | Remaining from v6 and v7, unchanged. "Section 2.4a" does not exist. The "test in section 7" is in `ingestion-api` §7. §2.3 declares `MassiveSettings(BaseSettings)` against the snippet's `_EnvNamedSettings`. The §12 Decision row omits DEC-0038 | Readers land on the wrong text (SA-MD-002) | Fix the three pointers and extend the §12 row to DEC-0038 |
| FINDING-15 | LOW | SR-3 | System design | §4.1 line 298 | Remaining from v6. `massive-client` is described as a "Hand-written HTTP client" | The system description contradicts the SDK-based design | Reword at the next system-design revision |
| FINDING-16 | LOW | SR-4 | Rate-limit governor | §8 AC-11, lines 385-386 | Carried from v5. A concurrent-caller criterion under a single-threaded model | Vacuously satisfied | Record it as vacuous, or restate it |
| FINDING-17 | LOW | SR-6 | massive-client | §14 item 2 lines 894-905 | Carried from v5, unchanged. It still says it blocks the governor throttle path, which governor §2.5 and constraint 5.13 already provide | Reports a discharged blocker | Mark it resolved |
| FINDING-18 | LOW | SR-3 | All component designs; system design | Provenance and References tables; massive-client lines 25-26, 859-860 | Carried from v5. massive-client v12 still pins tech-stack v3 (v4 is current; the known `check-artifacts.py` warning). Its §12 labels the capability v6 and the system design v3 (current: v8 and v6). The same holds for the designs v7 listed | Repeated checker warnings, and stale labels in a design awaiting approval | Propagate current versions |
| FINDING-20 | LOW | SR-2 / SR-4 | runtime-config | §7 lines 834 and 836; item 3 lines 401-403 | Remaining from v7 in the design. Two test rows contradict on the literal `e2e-test-key`. DEC-0040 settles it for CAP-001-E3-S7, but the design is unchanged | `$test-design` reading the design meets the contradiction | Align runtime-config §7 line 834 with DEC-0040 at its next revision |
| FINDING-26 | LOW | SR-2 / SR-6 | massive-client | §2.4 lines 394-397 | **New** (the sibling of v8 FINDING-23 (ii), which v8 did not name). "`VXClient` is composed into the SDK separately from the stable mixins, so the corporate-action reads that depend on it carry more contract risk than the rest." Only the IPO read depends on `VXClient`. Ticker events is a `ReferenceClient` read on the main client (`massive/rest/reference.py` line 181; `vX.py` lines 69, 113; probe: 3 ticker-events requests, all via the main `PoolManager`). §2.2b (lines 245-246) and §7 (line 744) now say this correctly, so v12 contradicts itself | A reader of §2.4 is told ticker events depends on the separately composed sub-client. The contract-risk argument still holds by the `vX` path prefix (§2.5 lines 488-491), so no behaviour changes | Reword: "so the IPO read, the one corporate-action read that depends on it, carries more contract risk; ticker events shares the `vX` path prefix but is served by the main client" |
| FINDING-27 | LOW | SR-4 / SR-6 / SR-7 | massive-client | §7 line 744 ("or with `monotonic` injected as well, and with `sleep` and `jitter` injected, so the test never waits on the real clock") | **New, introduced by the FINDING-24 fix.** The alternative to the budget rule does not require the injected `sleep` to advance the injected `monotonic`. `_acquire_permit` loops: it reads `monotonic()`, refills by elapsed time, and calls `sleep(wait)` while short of a token (`rate_limit.py` lines 182-200). With a frozen fake clock and a no-op sleep, below the budget, it never refills. Probe at rpm=2: still running after 5 s, stuck after 2 requests. A clock that the sleep advances finishes in 0.00 s. The repository's `FakeClock` and `FakeSleeper` pair (`tests/unit/governor_fakes.py` lines 14-42) has the needed coupling, but the row does not name it. v8's recommendation pointed at "governor §7 ... with its fake clock", and the adopted text dropped that pointer | An implementer taking the alternative literally gets a unit test that hangs instead of failing. The budget branch, which is first, is unaffected. The repository's existing fakes mitigate it | Reword: "or with `monotonic` injected as a fake clock that the injected `sleep` advances (`FakeClock` and `FakeSleeper` in `tests/unit/governor_fakes.py`)". Or drop the alternative and keep the budget rule |
| FINDING-28 | LOW | SR-5 | massive-client | §12 Review rows, lines 865-866 | **New.** `2d06e31` implements specification review v8 FINDING-21 to FINDING-25 in §2.2b and §7: the classifier's ownership, `/vX/reference/ipos` through the `vx` `PoolManager`, the budget rule, the `_through_governor` seam, the bare-SDK control, and the loopback pool assertion. §12 lists reviews v6 and v7 for the same purpose, but not v8, and no §2.2b or §7 text cites it. The §7 redirect row still ends "specification review v7 FINDING-19" | The evidence for the new assertions (v8's probes) cannot be found from the design. That is the same traceability the v7 row provides for FINDING-19 | Add a §12 Review row for specification review v8 (FINDING-21 to FINDING-25, sections 2.2b and 7), and optionally cite it in the §7 redirect row |

---

## Traceability Matrix

| Layer | Coverage | Evidence |
|-------|----------|----------|
| Capability to system design | 26/26 | System design §7 (unchanged) |
| Capability to UX design | 26/26 | UX design §5 (unchanged) |
| Capability to component designs | 26/26 | Every AC is referenced by at least one component design; unchanged by `2d06e31` |
| System components to component designs | 12/12 | One design per component; `build-architecture.py` PASSED |

Changed design elements in `2d06e31`:

| Design element | Capability AC | Constitution or decision | Story criterion | Component AC or test |
|---|---|---|---|---|
| MC §2.2b: the classifier maps a refused redirect to `RETRYABLE` | AC-13 | SEC-ENC-001 condition (2); DEC-0042; constraint 5.13 | DAC-E3-S6-13 | MC AC-8; §7 line 744 |
| MC §2.2b: `vx` serves the IPO read | AC-13 | n/a | DAC-E3-S6-10, S6-14 | §7 lines 743-744 |
| MC §7 redirect row: budget, seam, `vx` `PoolManager` attribution, bare-SDK control | AC-13 | SEC-ENC-001 Verification (d); DEC-0038, DEC-0042 | DAC-E3-S6-12 to S6-15 | §7 line 744 |
| MC §7 no-proxy row: loopback `http` pool | AC-13 | SEC-ENC-001 Verification (e); DEC-0041 | DAC-E3-S6-16 | §7 line 745 |
| MC §12: DEC-0041 | n/a | DEC-0041 | n/a | n/a |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

There are no CRITICAL findings, so the verdict is not NOT-READY. Two HIGH
findings remain, so it is not READY. Both are owner-open items unchanged since
v6:

- **FINDING-1**, the standing of host-local plaintext channels, blocks the
  release-readiness security evidence.
- **FINDING-2**, the ratios contract, blocks the ratios read and AC-3's ratios
  fundamentals. As the code stands, it also blocks every financials read for an
  instrument with ratio rows.

Neither blocks epic generation or test design.

`2d06e31` did what it set out to do. Each of v8 FINDING-21 to FINDING-25 is
resolved, and each claim was re-executed on the locked SDK. The three new
findings are LOW:

- a stale plural in §2.4;
- an under-specified alternative that can hang the unit test;
- a missing §12 row.

None changes behaviour, and none makes the specified test wrong when taken by
its first branch.

The rubric defines readiness as this verdict and no numeric score, so none is
given.

**This verdict is review evidence, not approval.**

- `component-design-massive-client.md` v12 is `draft`. It stays blocked from
  epic generation and test design until the owner explicitly approves it,
  with `python3 scripts/artifact-gate.py approve --project factorflow-v2
  --artifact
  docs/capabilities/CAP-001-market-data-acquisition-foundation/design/component-design-massive-client.md
  --review-artifact
  docs/capabilities/CAP-001-market-data-acquisition-foundation/specifications-review-report-v9.md`.
- Review v8 can no longer serve as that `--review-artifact`. It names v12 at
  `sha256:1c11f099...`, so the gate would refuse it as stale.
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

4. FINDING-26 to FINDING-28: one sentence in §2.4, one clause in the §7
   redirect row, and one §12 row. They are cheap to fold into the same draft
   before approval, or into the next massive-client edit. FINDING-13 (b),
   FINDING-17 and FINDING-18's massive-client part can go in the same edit.
5. FINDING-11, FINDING-12, FINDING-14 and FINDING-20: the residual
   runtime-config gaps, several already corrected at story level.
6. FINDING-15 and FINDING-16: system-design wording and the vacuous governor
   criterion.

---

## Observations Outside the Review Subjects

These are not findings against the specifications.

- **Downstream pins and story wording.** `CAP-001-E3` v4, `CAP-001-E3-S6` v3
  and `CAP-001-E3-S7` v3 still pin massive-client v11. These are three of the
  `check-artifacts.py` warnings. E3-S6 is now behind the design in three
  places:
  - DAC-E3-S6-13 still says "the governor classifies the refused redirect as
    retryable";
  - DAC-E3-S6-14 still accepts any `/vX/` request, and its "cannot pass while
    exercising only the main pool" holds only by call order;
  - DAC-E3-S6-15 says "a control client built with `retries=3`" without
    naming the bare SDK client.

  None contradicts the design, because the design's test satisfies the story.
  But DEC-0042 says E3-S6 "governs". Once v12 is approved, re-pinning E3-S6 to
  v12 and aligning those three criteria is `$story-generation` and
  `$backlog-review` work.
- **Decision-record hygiene.** DEC-0042's question repeats "the production
  RateLimitGovernor classifies the refused redirect as retryable". Its
  derivation still says "The section 7 row is to be aligned by $doc-sync". It
  is still `status: open`, `owner_reviewed: false` and `commits: []`, although
  `2cfc504` and `2d06e31` both carry `Decision-Id: DEC-0042`. DEC-0041 lists
  only `28022493` in `commits`, and `2d06e31` now also carries its trailer.
- **Corrections to v8 (REV-RCV-002).**
  - v8 FINDING-23 (ii) named only §2.2b. §2.4 lines 394-397 carry the same
    misattribution (FINDING-26).
  - v8 FINDING-24's recommendation offered "inject `monotonic` too" without
    stating the clock-sleep coupling as a requirement. It pointed at the
    governor's fake clock, and the adopted wording dropped that pointer
    (FINDING-27).
- **Script reach.** `build-architecture.py`, `check-capabilities.py` and
  `check-artifacts.py` ran through the shim. `check-references.py` and
  `check-constitutions.py` ran read-only at the harness root, as directed,
  because the shim has no git index and no `.agents/`. The harness working
  tree stayed clean.
- **WebSocket proxies.** v7's observation still applies: the SDK's WebSocket
  client honours proxy variables. That is out of scope until M3.
