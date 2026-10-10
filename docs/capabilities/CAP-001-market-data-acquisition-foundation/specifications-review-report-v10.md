---
artifact_schema_version: 1
artifact_id: CAP-001-specification-review
artifact_type: specification-review
artifact_version: 10
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-10
updated: 2026-10-10
document: spec-review-report
capability: CAP-001
version: v10
generated: 2026-10-10T22:50:41Z
constitutions_reviewed:
  - "CONST-AGT  docs/constitutions/agent-governance.constitution.md (2.3)"
  - "CONST-MDL  docs/constitutions/model-management.constitution.md (1.3)"
  - "CONST-OPS  docs/constitutions/operational-safety.constitution.md (1.3)"
  - "CONST-REV  docs/constitutions/review.constitution.md (1.4)"
  - "CONST-SA   docs/constitutions/static-analysis.constitution.md (2.0)"
  - "CONST-SEC  docs/constitutions/security.constitution.md (1.2, content revision sha256:82059ecdf4b6833dbb212bde953e39914442f211a869078f0ccbd4a96ad2cbcc; no commit since v9)"
  - "CONST-VER  docs/constitutions/verification.constitution.md (1.2)"
mechanical_checks:
  - script: check-capabilities.py
    outcome: run
    result: "PASSED, exit 0: integration layer 0 is CAP-001, no blocked-by edges; no error, no warning"
  - script: build-architecture.py
    outcome: run
    result: "PASSED: 1 design, 12 components, 16 interfaces"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 151 warnings, exit 0 (--strict); no error. 23 warnings are new pin drift from this revision's version bumps (18 pins of market-data-store v6, 5 pins of massive-client v12)"
  - script: check-references.py
    outcome: run
    result: "Run from the harness root: PASSED, exit 0, 1054 references across 199 Markdown files. Does not scan the project repo"
  - script: check-constitutions.py
    outcome: run
    result: "Run from the harness root: PASSED, exit 0, 10 constitutions, 36 skills"
dimension_status:
  SR-1: applied
  SR-2: applied
  SR-3: applied
  SR-4: applied
  SR-5: applied
  SR-6: applied
  SR-7: applied
  SR-8: "applied — UX brief, UX design unchanged since v7 (digest-identical subjects); the change has no UX surface"
  SR-9: "applied — dependency and STD-UI conformance halves by check-capabilities.py; CONST-SEC 1.2 assessed by hand for the changed text"
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
    artifact_version: 7
    content_revision: sha256:8b11cff20e3589027130fd69dc060a9f979ceebd507523f902fc79c58c4eec2d
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
    artifact_version: 11
    content_revision: sha256:f9c6b57a361b05c7ec0145737a3384d99eabaff5c2425a476864e73da2dbd77b
  - artifact_id: CAP-001-component-design-schema-migrator
    artifact_version: 4
    content_revision: sha256:e877f0c46d6ca6c2f07f736212ccd00693c2c478fefbfbde5608e7af7ac3efa3
statistics:
  total_findings: 19
  critical: 0
  high: 1
  medium: 4
  low: 14
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-10T22:50:41Z
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
      version: "7"
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
| **Version** | v10 |
| **Specifications Reviewed** | Capability, system design, UX brief, UX design, 12 component designs (full set; two changed since v9) |
| **Total Findings** | 19 (0 CRITICAL, 1 HIGH, 4 MEDIUM, 14 LOW) |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

**What changed since v9.** The capability owner decided on 2026-10-10 that
CAP-001 does not acquire Massive ratios. In this capability, fundamentals are
the balance sheet, the income statement and the cash-flow statement. Ratios are
price-derived, the endpoint has no period filter, and ratios can be computed
later from stored statements and bars. Two subjects changed on branch
`usr/alvaro-de-jodra/CAP-001-design-ratios`. The changes are not yet committed.

- `component-design-massive-client.md` went from v12 (approved) to v13
  (`draft`, approval block removed). The changes:
  - §2.5 names three statement endpoints and adds a "Financial ratios: not
    acquired" paragraph.
  - §7 adds a "Ratios are never requested" test row.
  - The §11 ratios row states the real shape and "Not called".
  - §12's review v6 row now says FINDING-2 is closed.
  - §14 item 7 is closed with the decision and lists what that means for the
    implementation.
- `component-design-market-data-store.md` went from v6 (approved) to v7
  (`draft`, approval block removed). The changes:
  - A note says `'ratios'` stays an allowed but unused `statement_type`, with
    no migration.
  - The §5 sizing goes from four statement types (240 thousand rows) to three
    (180 thousand rows).

The other 14 subjects are digest-identical to the revisions v9 recorded. Each
was recomputed this session with `artifact-gate.py revision`.

**v9 FINDING-2 (HIGH) is resolved.** The design no longer claims a ratios
contract the SDK does not have. It acquires no ratios and holds that with a
test row. Every claim the new text makes about the SDK, the DDL and the code was
checked against the source this session (Supplementary Evidence).

**New in this round: 2 LOW findings.**

- **FINDING-29:** massive-client §5 still sizes a run as "up to four reads per
  instrument ... on the order of 12000 requests". The design's own endpoint
  list gives 9 first-page requests per instrument, so about 27000 plus pages.
  The estimate was already wrong before this change, when it should have been
  10.
- **FINDING-30:** what AC-3's "company fundamentals" covers is now defined
  only in two component designs. The capability, the system design and the
  decision record set do not record it.

FINDING-1 (HIGH) remains owner-open. The four MEDIUM findings remain carried by
the owner's choice.

## Review Scope

**Full set, depth proportional to change.**

- **Changed subjects:** massive-client v13 and market-data-store v7, each read
  in full. Their working-tree diff against `33e0562` was reviewed line by line,
  and every changed claim was checked against these sources:
  - massive 2.8.0 as installed from `uv.lock` (`.venv/.../massive/rest/financials.py`
    and `massive/rest/models/financials.py`);
  - `migrations/0002_observations.sql`;
  - `src/factorflow/ingestion/massive/client.py` and `models.py`;
  - the unit tests, fixtures and E2E stub that reference ratios;
  - the capability's AC-3 and §6, and the system design's §6.
- **Unchanged subjects (14).** Each revision equals the one v9 recorded, so the
  v6 to v9 assessments stand by identity. They were re-read only where they
  touch the change. This review searched observation-writer,
  acquisition-runner, the capability and the system design for ratios or
  statement-type assumptions. None depends on ratios.
- **Not subjects.** Epics, stories, task plans, test specifications and
  decision records are governing inputs, not subjects.
- **Repository source.** Every project-repo read used
  `repos/factorflow-v2/FactorFlow-v2` on branch
  `usr/alvaro-de-jodra/CAP-001-design-ratios`, created from `33e0562` (the
  owner approved the branch). Besides the two design edits, the only file
  written to the repository is this report. Nothing was committed.
- **Pipeline state.** `pipeline-state.py check --stage specification-review`
  reported `AWAITING-APPROVAL`, exit 1, for both changed designs ("approval
  timestamp is missing"). That is the expected state of a refined draft. This
  review supplies evidence and approves nothing.
- **Independence.** The same session that made the design-decomposition
  refinement also ran this review, so the reviewer is not independent of the
  author. Under REV-RCV-001 and VER-DEL-001, every claim was checked against
  the SDK, DDL and code rather than accepted as written. The full rubric was
  applied (REV-AGT-001). While checking against those sources, the refinement
  was corrected before its review revision was fixed:
  - the ratios endpoint selects by `ticker` **or** `cik`;
  - `FinancialRatio` also carries `cik`;
  - not every ratio is price-derived;
  - the §7 row first said "once each per page", but later pages go through
    `next_url`, not the SDK method.

  The revisions in `review_subjects` include these corrections. An owner who
  wants an independent gate can run the `specification-reviewer` profile in a
  fresh session against the same revisions.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | Both designs keep all 14 template sections. No diagram was added. Carried: FINDING-9 |
| SR-2 Correctness | applied | Every new SDK, DDL and code claim was checked at file:line. FINDING-2 is resolved. FINDING-29 is new. Carried: FINDING-7, FINDING-12, FINDING-20, FINDING-26 |
| SR-3 Consistency | applied | massive-client §2.5, §7, §11 and §14 item 7 and the market-data-store note and §5 agree with each other, with the DDL and with the SDK. Carried: FINDING-1, FINDING-8, FINDING-15, FINDING-18 |
| SR-4 Testability | applied | The decision is held by a §7 row whose assertions can be checked against SDK mocks. Carried: FINDING-11, FINDING-12, FINDING-16, FINDING-27 |
| SR-5 Traceability | applied | 26/26 capability ACs are still mapped. The new §7 row cites §2.5 and §14 item 7, and §12 records FINDING-2 as closed. Carried: FINDING-6, FINDING-28 |
| SR-6 Clarity | applied | The new text is quantified and names its fields. FINDING-30 is new. Carried: FINDING-13, FINDING-14, FINDING-17 |
| SR-7 Feasibility | applied | Removing one SDK call from `fetch_financials` adds no dependency. The DDL is unchanged, so no migration is required (OPS-MIG-001) |
| SR-8 UX Completeness | applied | UX artifacts are unchanged since v7. The change has no UX surface: coverage reports data types, not statement types. Carried: FINDING-8 |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` passed with no error or warning. CONST-SEC 1.2: the change adds no channel, credential or input path. Carried: FINDING-1 |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passed (12 components, 16 interfaces). The change adds no component and uses no capability as an actor |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, exit 0, "PASSED" (integration layer 0: CAP-001, no blocked-by edges) | none |
| `build-architecture.py -p factorflow-v2` | run, "1 design(s), 12 component(s), 16 interface(s) PASSED" | none |
| `check-artifacts.py -p factorflow-v2 --strict` | run, exit 0, "PASSED with 151 warning(s)", no error | Both changed designs pass with one warning each: they pin tech-stack v3 while v4 is current (FINDING-18). 23 warnings are new pin drift caused by the version bumps: 18 downstream pins of market-data-store v6 and 5 pins of massive-client v12 (coverage matrix, component and integration test specs, E3-S6 and E3-S7 task plans). The 8 older massive-client pins (v7, v11) now report v13 as current (Observations) |
| `check-references.py` (harness root) | run, exit 0, "1054 path references across 199 Markdown files ... PASSED" | none. It scans harness Markdown only. The new design references (`0002_observations.sql`, `client.py`, `models.py`, the five test paths) were checked by hand and all exist |
| `check-constitutions.py` (harness root) | run, exit 0, "10 constitutions, 36 skills PASSED" | none |

Prerequisites: `check-prerequisites.sh --project factorflow-v2` exited 0, with
every row PASSED. The harness worktree was clean at `068aaa8`. No constitution
changed since v9. The only decision-record commit since v9 is `e99207d`
(DEC-0044 to DEC-0046, from the E3-S6 and E3-S7 plans), which does not touch
ratios.

### Supplementary evidence (fresh, this session)

| Claim in the change | Evidence | Result |
|---|---|---|
| `list_financials_ratios` selects by `ticker` or `cik` and has no date or period filter | `massive/rest/financials.py` lines 191-320 (SDK 2.8.0). The parameter families are `ticker`, `cik`, then only ratio values (`price`, `average_volume`, `market_cap`, `earnings_per_share`, `price_to_*`, `dividend_yield`, `return_on_*`, `debt_to_equity`, `current`, `quick`, `cash`, `ev_to_*`, `enterprise_value`, `free_cash_flow`), plus `limit`, `sort`, `params`, `raw` and `options`. Path `/stocks/financials/v1/ratios` (line 314) | Holds |
| `FinancialRatio` carries `ticker`, `cik` and `date`, and no `period_end`, `filing_date`, `fiscal_year`, `fiscal_quarter` or `timeframe` | `massive/rest/models/financials.py` lines 812-835 | Holds |
| Most ratios are price-derived and the rest come from statement lines | The same model: `price_to_earnings`, `price_to_book`, `ev_to_ebitda` and `dividend_yield` use price. `current`, `quick` and `debt_to_equity` use only balance-sheet lines | Holds. It refines the owner's "ratios are price-derived" without changing the decision |
| The DDL keeps `'ratios'`, so no migration is needed | `migrations/0002_observations.sql` lines 49-51 (`fundamental_statement_known`) equal the design's DDL | Holds |
| §5 sizing is 180 thousand rows | 3000 instruments × 4 quarters × 5 years × 3 statement types = 180000 (was × 4 = 240000) | Holds |
| The implementation still acquires ratios (§14 item 7) | `client.py` line 130 (`("ratios", self._rest_client.list_financials_ratios)`), lines 257-260 (ratios branch in `_financial_page`), docstring lines 119-123. `models.py` lines 211 and 260. Tests: `test_massive_financials.py` lines 111-113, 153, 232, 243-262, 273-305; `test_massive_sdk_config.py` line 148; `test_massive_client_governor_integration.py` lines 117 and 193; `fixtures/massive/financial_quarterly.json` line 9; `e2e/support/massive_stub.py` line 69 | Holds. The list is complete for `src/` and `tests/` |
| The §7 row's "first page, then `next_url`" | `client.py` lines 270-277: `_next_page` issues `_rest_client._get` on the parsed path and never calls the `list_financials_*` method again | Holds |
| No other design depends on ratios | Searched observation-writer, acquisition-runner, ingestion-api, coverage-service, the capability and the system design for `ratio` and statement-type lists. Only the market-data-store DDL and the massive-client text match | Holds |

## Constitutions Applied

All seven constitutions the relevance matrix assigns `specification-review`
were read. None changed since v9.

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | AGT-PROV-001: on both designs, `model`, `tool_version` and `timestamp` were refreshed on modification and `correlation_id` is unchanged. market-data-store's `model` moved from `claude-opus-5` to `claude-opus-5-5`. The tool version is `claude --version` this session (2.1.290), which is lower than massive-client v12's recorded 2.1.296; the two were recorded from different installations. AGT-AUTH-002: the scope decision is the owner's, stated in this session, and is recorded with its date. AGT-EVIDENCE-002: the 180-thousand figure derives from the cited sizing basis. AGT-AUTH-001: this review approves nothing |
| CONST-MDL 1.3 | MDL-PIN-002: the exact identifier `claude-opus-5-5` is recorded |
| CONST-OPS 1.3 | OPS-MIG-001 and OPS-DEST-003: the persistent structure is unchanged, and the design says so (`'ratios'` stays allowed, no migration). That matches the "no data migration" intent. No destructive operation was run |
| CONST-REV 1.4 | REV-STG-001: Stage 1 and Stage 2 are reported separately below. REV-AGT-001: full bar. REV-RCV-001: claims were checked against the sources. The lack of reviewer independence is disclosed under Review Scope |
| CONST-SA 2.0 | SA-MD-001: template conformance passes. SA-MD-002: every new path resolves. SA-MD-003: no placeholder language was introduced |
| CONST-SEC 1.2 | In force at the pinned revision. The change removes one outbound read and adds no channel, credential, input or log path. SEC-ENC-001 standing is unaffected. FINDING-1 is unchanged |
| CONST-VER 1.2 | VER-EVD-001: every verdict rests on reads and commands run this session. VER-EVD-004: there is a per-rule verdict for each requirement in Stage 1. VER-CHK-001: no tests were run, because the change is design-only. The test row's assertions were checked against the code's call structure instead |

## Status of v9 Findings

IDs continue v9's numbering. Resolved findings are absent from the summary
table.

| v9 ID | Severity | Status in v10 | Evidence |
|---|---|---|---|
| v9 FINDING-1 | HIGH | **Owner-open** (carried) | Subjects digest-unchanged. CONST-SEC 1.2 still leaves the question open |
| v9 FINDING-2 | HIGH | **Resolved** | Owner decision of 2026-10-10. The changes: massive-client §2.5 (lines 445-484) names three statement endpoints and records ratios as not called; §11 line 871 gives the real shape and "Not called"; §7 line 765 holds the decision; §14 item 7 (line 959 onward) is closed. market-data-store keeps `'ratios'` allowed but unused, so the `fundamental_observation` key is no longer asked to carry period-less rows |
| v9 FINDING-6 to FINDING-9 | MEDIUM | **Carried by owner choice** | Subjects digest-unchanged |
| v9 FINDING-11, FINDING-12, FINDING-14, FINDING-20 | LOW | **Remaining** | runtime-config digest-unchanged |
| v9 FINDING-13 | LOW | **Remaining** ((b)) | massive-client §8 (line 821) still says `runtime-config` "guarantees" `https` without qualification. Untouched by this change |
| v9 FINDING-15, FINDING-16 | LOW | **Remaining** | System design and governor digest-unchanged |
| v9 FINDING-17 | LOW | **Remaining** | massive-client §14 item 2 (line 918) unchanged |
| v9 FINDING-18 | LOW | **Remaining** | Both changed designs still pin tech-stack v3 (massive-client lines 25-26). massive-client §12 lines 883-884 still label the capability v6 and the system design v3 |
| v9 FINDING-26 | LOW | **Remaining** | massive-client §2.4 line 396 unchanged |
| v9 FINDING-27 | LOW | **Remaining** | The §7 redirect row (line 768) is unchanged |
| v9 FINDING-28 | LOW | **Remaining** | §12 still has no row for review v8 |

## Stage 1 -- Specification Compliance of the Change

One verdict per changed rule (VER-EVD-004). PASS means four things hold: the
rule agrees with the owner decision and the governing sources, it agrees with
the SDK and the DDL, it has a test row where it is behaviour, and it
contradicts no other subject. Line numbers refer to the working tree reviewed.

| Rule | Location | Governing source | Test row | Fresh evidence | Verdict |
|------|----------|------------------|----------|----------------|---------|
| In CAP-001, company fundamentals are the three statements, read from three endpoints | MC §2.5 lines 445-452 | Owner decision 2026-10-10; AC-3 | MC §7 line 765 | Capability AC-3 (line 217) does not define fundamentals more narrowly or more broadly | PASS (definition placement: FINDING-30) |
| The ratios endpoint is not called, and the reason is its shape | MC §2.5 lines 465-484; §11 line 871 | Owner decision; SDK 2.8.0 | MC §7 line 765 | `financials.py` 191-320; `models/financials.py` 812-835 | PASS |
| `fetch_financials` issues exactly three statement reads per instrument | MC §2.5 lines 480-481 | Owner decision | MC §7 line 765 | `client.py` 116-145 and 270-277 give the call structure the row asserts on | PASS (the code does not yet comply; see Observations) |
| Test row: three SDK calls for the first page, `list_financials_ratios` never called, no request to the ratios path, statement types limited to three | MC §7 line 765 | §2.5; §14 item 7 | itself | Every assertion is observable on the mocked `RESTClient` that `test_massive_financials.py` already uses (lines 232, 281, 303) | PASS |
| §14 item 7 is closed, with its consequences | MC §14 line 959 onward | Owner decision; v6 FINDING-2; EXP-20261009-1 ER-003 and ER-004 | n/a | The implementation file list was checked as complete (Supplementary Evidence) | PASS |
| §12 review v6 row says "closed by owner decision" | MC §12 line 890 | §14 item 7 | n/a | n/a | PASS |
| `'ratios'` stays allowed but unused, with no migration | MDS note after the DDL | Owner decision; OPS-MIG-001 | n/a. Store behaviour does not change, and "no CAP-001 write produces it" is held by MC §7 line 765 | `0002_observations.sql` lines 49-51 | PASS |
| Sizing goes from four statement types to three, about 180 thousand rows | MDS §5 | Sizing basis in the same bullet | n/a | The arithmetic holds | PASS |
| Version bump, `draft`, approval block removed, provenance refreshed | Both frontmatters | `docs/artifact-contract.md` Versioning Rules; AGT-PROV-001 | n/a | `check-artifacts.py --strict`: no error | PASS |

## Stage 2 -- Artifact Quality of the Change

- **Contract.** Both designs pass `check-artifacts.py --strict` with no error.
  Each carries only the tech-stack pin warning it had before (FINDING-18). The
  status is `draft` with no approval block, the correlation ID is unchanged,
  and the provenance is current.
- **Structure.** All 14 template sections are present in each. No diagram was
  added.
- **Cross-references.** Every new path resolves. The sections each new
  sentence cites (§2.5, §7, §11, §14 item 7 and the market-data-store note)
  exist and say what is attributed to them.
- **Quantitative values.** "Three statement reads", "180 thousand rows" and
  "massive 2.8.0" each derive from a cited source.
- **Placeholders.** None introduced.
- **Clarity.** The new text names fields, methods and paths exactly. Prose
  uses commas rather than em dashes, as the decomposition skill requires.
  Earlier text in both designs still uses em dashes, which this change did not
  touch.
- **Residual.** The §5 request-volume bullet next to the change was not updated
  (FINDING-29). Neither the capability nor the system design records the
  definition of fundamentals (FINDING-30).

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; assessed against the system
design.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` passed with no error and no warning. Dependency typing,
5.1 to 5.3 placement and the STD-UI specialization are unchanged from v9.

#### Completeness (SR-1)

Unchanged. FINDING-9 is carried.

#### Correctness (SR-2)

No contradictory acceptance criteria. The narrowed reading of AC-3 does not
contradict any criterion, because AC-3 never listed statement types.

#### Testability (SR-4)

All 26 criteria have an observable outcome, a concrete input and a measurable
boundary (unchanged).

#### Clarity (SR-6)

AC-3's "company fundamentals" has no definition in the capability, and its
scope was decided in a component design (FINDING-30).

### System Design Specification

Unchanged (v6, digest-identical). §6 assumption 1 ("includes company
fundamentals") and the §4.1 `massive-client` row stay true under the decision.
FINDING-15 remains.

### Component Design Specifications

#### massive-client v13 (changed)

- **Correctness (SR-2).** Every new claim holds against SDK 2.8.0, the DDL and
  the code. FINDING-29 covers the §5 volume bullet. FINDING-26 is carried.
- **Consistency (SR-3).** §2.5, §7, §11, §12 and §14 item 7 agree with each
  other and with market-data-store v7. §1's use case "Fetch company
  financials" and §3's plan bullet remain accurate.
- **Testability (SR-4).** The new row holds the decision. FINDING-27 and
  FINDING-13 (b) are carried.
- **Traceability (SR-5).** FINDING-28 and FINDING-18 are carried.
- **Clarity (SR-6).** FINDING-17 is carried.

#### market-data-store v7 (changed)

The note and the sizing are correct and consistent with massive-client v13 and
`0002_observations.sql`. FINDING-1 is still owner-open on its §4.

#### acquisition-runner, coverage-service, ingestion-api, instrument-list-service, observation-writer, owner-web-app, rate-limit-governor, run-journal, runtime-config, schema-migrator (unchanged)

None depends on ratios. Coverage and the run journal record the data type
`fundamentals`, not statement types, so their contracts are unaffected. The
carried findings stand as v9 recorded them.

#### Feasibility (SR-7), all components

No circular dependency. The change removes one outbound read and adds no
component, interface or runtime dependency.

### UX Brief

Unchanged (v7). No user-facing surface changed.

### UX Design Specification

Unchanged (v5). FINDING-8 is carried.

### Cross-Specification Consistency (SR-3)

- **Resolved (v9 FINDING-2):** the massive-client ratios contract against
  market-data-store's key and the SDK.
- CROSS-SPEC-INCONSISTENCY, owner-open (FINDING-1): runtime-config §2.2c and
  §14 item 6 against `ingestion-api` §4.
- CROSS-SPEC-INCONSISTENCY (FINDING-15): system design §4.1 says
  "hand-written".
- **Consistent:**
  - statement types: three acquired, four allowed by the DDL, with the unused
    one stated in both designs;
  - the data type `fundamentals` across coverage, journal and runner;
  - the `fundamental_observation` key.

---

## Findings Summary Table

CRITICAL 0 · HIGH 1 · MEDIUM 4 · LOW 14 · **total 19**. By origin:

- 1 owner-open (v6, via v7 to v9);
- 4 carried by owner choice (v5);
- 12 remaining LOW (v5 to v9);
- 2 new LOW in this round.

v9 FINDING-2 is resolved.

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-9 / SR-3 | ingestion-api; market-data-store; runtime-config | ingestion-api §4; market-data-store §4; runtime-config §2.2c and §14 item 6 | **Owner-open, carried from v6; unchanged.** Production host-local channels carrying Internal data run without TLS and have no SEC-ENC-001 standing. CONST-SEC 1.2 leaves the question open in its Exception Record | Release-readiness security evidence cannot be completed until the owner rules | The constitution owner decides: TLS, a waiver, or a further amendment (`$constitution`, standard). Then align and re-review the designs |
| FINDING-6 | MEDIUM | SR-5 | Rate-limit governor | §8 AC-1 amendment note | Carried from v5, unchanged by owner choice. `docs/decision-records.md` does not exist in this repository | Readers cannot resolve the normative decision from the project repository | Correct the citation or mirror DEC-0002 |
| FINDING-7 | MEDIUM | SR-2 | Rate-limit governor | §2.5 final paragraph | Carried from v5, unchanged by owner choice. It says all jitter is full jitter; the boundary wait adds jitter on top | Misdescribes the implemented boundary wait | Specify additive boundary jitter |
| FINDING-8 | MEDIUM | SR-3 | UX design | §6 Source Mapping | Carried from v5, unchanged by owner choice. Stale source versions | Verification points to superseded inputs | Update the three source versions |
| FINDING-9 | MEDIUM | SR-1 | Capability | §8 Readiness Assessment | Carried from v5, unchanged by owner choice. It states 23 ACs and three open questions | The readiness summary misstates coverage | Update the counts |
| FINDING-11 | LOW | SR-2 / SR-9 | runtime-config | item 2; §7 | Remaining from v6. `localhost` is resolved once at start | Residual gap against SEC-ENC-001 condition (2) | Re-check per claim, drop `localhost`, or record the residual |
| FINDING-12 | LOW | SR-4 | runtime-config | clause 8; table; item 2; §7 | Remaining from v6. Missing control-character row, parser-agreement assertion, and one wrong table reason | Small regressions pass the design's suite | Add the row and assertion, and correct the reason |
| FINDING-13 | LOW | SR-6 | massive-client | §8 line 821; §2.2b comment | Remaining from v6, part (b). "guarantees `https`" is not qualified "in the release build" | Overstates a guarantee for non-release builds | Qualify both |
| FINDING-14 | LOW | SR-6 | runtime-config | §3; §14 item 3; §2.3; §12 | Remaining from v6 and v7. Three dangling pointers and an incomplete §12 Decision row | Readers land on the wrong text | Fix the pointers and extend the row |
| FINDING-15 | LOW | SR-3 | System design | §4.1 line 298 | Remaining from v6. `massive-client` is described as "Hand-written HTTP client" | Contradicts the SDK-based design | Reword at the next system-design revision |
| FINDING-16 | LOW | SR-4 | Rate-limit governor | §8 AC-11 | Carried from v5. A concurrent-caller criterion under a single-threaded model | Vacuously satisfied | Record it as vacuous, or restate it |
| FINDING-17 | LOW | SR-6 | massive-client | §14 item 2 line 918 | Carried from v5. It still claims to block the governor throttle path | Reports a discharged blocker | Mark it resolved |
| FINDING-18 | LOW | SR-3 | All component designs; system design | Provenance and References tables; massive-client lines 25-26, 883-884 | Carried from v5. Both changed designs still pin tech-stack v3 (v4 is current). massive-client §12 labels the capability v6 and the system design v3 (current: v8 and v6) | Repeated checker warnings and stale labels in designs awaiting approval | Propagate current versions |
| FINDING-20 | LOW | SR-2 / SR-4 | runtime-config | §7; item 3 | Remaining from v7. Two test rows contradict on `e2e-test-key`, and DEC-0040 settles it at story level only | `$test-design` meets the contradiction | Align runtime-config §7 with DEC-0040 |
| FINDING-26 | LOW | SR-2 / SR-6 | massive-client | §2.4 line 396 | Remaining from v9. It says the corporate-action reads, plural, depend on `VXClient`; only the IPO read does | Self-contradiction with §2.2b and §7; no behaviour change | Reword as v9 recommended |
| FINDING-27 | LOW | SR-4 / SR-6 / SR-7 | massive-client | §7 redirect row line 768 | Remaining from v9. The injected-`monotonic` alternative does not require the injected `sleep` to advance it | A literal reading yields a test that hangs | Name the `FakeClock` and `FakeSleeper` coupling, or drop the alternative |
| FINDING-28 | LOW | SR-5 | massive-client | §12 Review rows lines 889-890 | Remaining from v9. No §12 row for specification review v8 | v8's evidence cannot be found from the design | Add the row |
| FINDING-29 | LOW | SR-2 | massive-client | §5 "Request volume at AC-4", lines 702-705 | **New** (unchanged text next to the change). "Up to four reads per instrument ... on the order of 12000 requests plus pages." The four reads are data types, but the design's endpoint list in §2.5 and §11 gives one reference, one aggregate, three statement and four corporate-action first-page requests per instrument: 9, or about 27000 plus pages for 3000 instruments. It was 10 (30000) before ratios were dropped, so the figure was already low | Run-duration expectations derived from §5 come out about 2.25 times too short. No behaviour depends on the figure, because pacing is the configured budget | Restate as "nine first-page requests per instrument (one reference, one aggregate, three statements, four corporate actions), about 27000 plus pages per full run" |
| FINDING-30 | LOW | SR-6 / SR-5 | Capability; system design; massive-client | Capability AC-3 line 217 ("company fundamentals"); massive-client §2.5 line 445; market-data-store note | **New.** The owner's definition of AC-3's "company fundamentals" (the three statements, no ratios) is recorded only in two component designs. The capability, the system design and the decision-record set (`projects/factorflow-v2/decisions/`, last DEC-0046) do not record it | A reader of the capability or system design cannot tell that ratios are out of scope. `$test-design` or a later capability could reintroduce them as part of AC-3 | At the next capability revision, add the definition to AC-3 or to the scope's out-of-scope list (for example "financial ratios; derivable from stored statements and bars"). Alternatively, record it as a decision record that the designs cite |

---

## Traceability Matrix

| Layer | Coverage | Evidence |
|-------|----------|----------|
| Capability to system design | 26/26 | System design §7 (unchanged) |
| Capability to UX design | 26/26 | UX design §5 (unchanged) |
| Capability to component designs | 26/26 | Every AC is still referenced. massive-client §13's AC-3 row ("fundamental ... reads") is unchanged and accurate |
| System components to component designs | 12/12 | One design per component; `build-architecture.py` PASSED |

Changed design elements:

| Design element | Capability AC | Constitution or decision | Story criterion | Component AC or test |
|---|---|---|---|---|
| MC §2.5: fundamentals are three statements, and ratios are not called | AC-3 | Owner decision 2026-10-10 | CAP-001-E3-S1 (the four historical reads; task plan pins massive-client v7) | MC §7 line 765 |
| MC §11: ratios row "Not called" | AC-3 | Owner decision | n/a | MC §7 line 765 |
| MC §14 item 7: closed, with its consequences | AC-3 | v6 FINDING-2; EXP-20261009-1 ER-003 and ER-004 | n/a | n/a |
| MDS: `'ratios'` allowed but unused; three-type sizing | AC-3, AC-4 | OPS-MIG-001 | n/a | n/a |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

There are no CRITICAL findings, so the verdict is not NOT-READY. One HIGH
finding remains, so it is not READY. **FINDING-1**, the standing of host-local
plaintext channels, blocks the release-readiness security evidence. It does
not block epic generation or test design. v9 FINDING-2, the other HIGH, is
resolved by the owner's decision.

The refinement did what it set out to do. The ratios question is closed, §2.5
and §11 match the SDK, a test row holds the decision, and the store's DDL needs
no change. The two new findings are LOW:

- a stale request-volume estimate;
- a scope definition that lives only in component designs.

Neither changes behaviour.

The rubric defines readiness as this verdict and no numeric score, so none is
given.

**This verdict is review evidence, not approval.**

- `component-design-massive-client.md` v13 and
  `component-design-market-data-store.md` v7 are `draft`. They stay blocked
  from epic generation and test design until the owner explicitly approves
  each one, with `python3 scripts/artifact-gate.py approve --project
  factorflow-v2 --artifact <design path> --review-artifact
  docs/capabilities/CAP-001-market-data-acquisition-foundation/specifications-review-report-v10.md`.
- READY-WITH-WARNINGS is a passing verdict for that command.
- The other 14 subjects keep their existing approvals, because this report
  covers them at the same id, version and content revision.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-1 (owner-open): the constitution owner rules on host-local plaintext
   channels. Then align `ingestion-api` §4 and `market-data-store`.

### Should Fix (MEDIUM findings)

2. FINDING-6 to FINDING-9: the carried v5 items, held by owner choice.

### Nice to Have (LOW findings)

3. FINDING-29: one sentence in massive-client §5. It is cheap to fold into this
   draft before approval, together with FINDING-13 (b), FINDING-17,
   FINDING-26, FINDING-27, FINDING-28 and FINDING-18's massive-client part.
4. FINDING-30: record the definition of fundamentals at the next capability
   revision, or as a decision record.
5. FINDING-11, FINDING-12, FINDING-14, FINDING-15, FINDING-16 and FINDING-20:
   unchanged residuals.

---

## Observations Outside the Review Subjects

These are not findings against the specifications.

- **The implementation does not yet match the design.** `fetch_financials`
  still reads ratios (`client.py` line 130, lines 257-260), and the tests,
  fixture and E2E stub listed in massive-client §14 item 7 expect it to.
  Removing the read and adding the §7 "Ratios are never requested" test is
  follow-up code work. No story or expedited change carries it yet. Because it
  removes one SDK call and its tests, with no schema or interface change, the
  `$expedited-change` lane is a candidate; `classify-lane.py` decides. Until it
  lands, a run still writes `statement_type = 'ratios'` rows, which the DDL
  accepts.
- **Downstream pins and story wording.** There are 23 new pin-drift warnings
  (Mechanical Checks). `CAP-001-E3-S6` and `CAP-001-E3-S7` list "the ratios
  response shape (`massive-client` section 14 item 7, specification review v6
  FINDING-2)" among open owner questions that are out of scope. That item is
  now closed. Both are bookkeeping for `$story-generation` and `$backlog-review`
  once the two designs are approved.
- **The capability's §6 assumption and the plan name.** "Stocks Starter +
  Financials & Ratios" names the subscription and stays accurate. The add-on is
  still what makes the three statement endpoints available.
- **The ratios-label commit.** `93ec4ca` ("label ratios statements 'ratios',
  matching the DDL") is an ancestor of this branch. It made ratios rows
  storable, which is why v9 FINDING-2's impact statement (a
  `ProviderContractViolation` for every financials read) may no longer describe
  the current code. This review did not re-run that probe, because the design
  no longer acquires ratios.
