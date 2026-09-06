---
artifact_schema_version: 1
artifact_id: CAP-001-specification-review
artifact_type: specification-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-05
updated: 2026-09-05
document: spec-review-report
capability: CAP-001
version: v2
generated: 2026-09-05T17:55:07Z
constitutions_reviewed:
  - CONST-AGT  docs/constitutions/agent-governance.constitution.md
  - CONST-MDL  docs/constitutions/model-management.constitution.md
  - CONST-OPS  docs/constitutions/operational-safety.constitution.md
  - CONST-REV  docs/constitutions/review.constitution.md
  - CONST-SA   docs/constitutions/static-analysis.constitution.md
  - CONST-SEC  docs/constitutions/security.constitution.md
  - CONST-VER  docs/constitutions/verification.constitution.md
mechanical_checks:
  - script: check-capabilities.py
    outcome: run
  - script: build-architecture.py
    outcome: run
  - script: check-artifacts.py
    outcome: run
  - script: check-references.py
    outcome: run
  - script: check-constitutions.py
    outcome: run
dimension_status:
  SR-1: applied
  SR-2: applied
  SR-3: applied
  SR-4: applied
  SR-5: applied
  SR-6: applied
  SR-7: applied
  SR-8: applied
  SR-9: applied
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
    artifact_version: 6
    content_revision: sha256:d92b721608aa24958b0b972c8816383e49f2c13ddb58c97bae68898dc27c4a2f
  - artifact_id: CAP-001-system-design
    artifact_version: 3
    content_revision: sha256:6b791f68c9f60091a11c498108a5432f577fc7c20aba3968d8f988c8d24b1ff9
  - artifact_id: CAP-001-ux-brief
    artifact_version: 6
    content_revision: sha256:e4a4254a42936006ba7451b70bb26ffc85053f4da3095ca82a6c873eb23f74e5
  - artifact_id: CAP-001-ux-design
    artifact_version: 4
    content_revision: sha256:a9e11856e28706537c44dc9b458a9529171f8279d28bd417f3f03630f7604a66
  - artifact_id: CAP-001-component-design-acquisition-runner
    artifact_version: 3
    content_revision: sha256:8146a2327e5b40a045eb9349b27174e760465e0b19ed481a598b2d52abe9c928
  - artifact_id: CAP-001-component-design-coverage-service
    artifact_version: 3
    content_revision: sha256:8d78dcaea35081fc83c7c478e8d1541309675cad8fb126849d19da905c8fc603
  - artifact_id: CAP-001-component-design-ingestion-api
    artifact_version: 3
    content_revision: sha256:45b4f3b4dfc177cd579e34b348fbe7dfb59fe51dd70277be9dd49993aaa9523b
  - artifact_id: CAP-001-component-design-instrument-list-service
    artifact_version: 3
    content_revision: sha256:f9198ccc1402388cde3e41d48de96c032f9eced4b972fed85055feb309b06763
  - artifact_id: CAP-001-component-design-market-data-store
    artifact_version: 4
    content_revision: sha256:0bfbadb42d3d7ab054e1df8d220d4018657d3308cbed0aec3d917385357c36f0
  - artifact_id: CAP-001-component-design-massive-client
    artifact_version: 3
    content_revision: sha256:2e0e251b9ad9165258eaff42d005c6a348eecdd6a4c613ffac1859ab4920ee7a
  - artifact_id: CAP-001-component-design-observation-writer
    artifact_version: 3
    content_revision: sha256:0e57035d3fdab46172bd4f729fcbd572a8fa8c97d8a5159c1e7fd6a0550e1fbd
  - artifact_id: CAP-001-component-design-owner-web-app
    artifact_version: 3
    content_revision: sha256:4463a8ac709412134bf6b9108643c00d350ebe3801a2dd24e98bbdc64b523d24
  - artifact_id: CAP-001-component-design-rate-limit-governor
    artifact_version: 3
    content_revision: sha256:d9bb50ae5b602f7074a1e1a4f1afc364a421dcc134e253c59c1d74fc8112260d
  - artifact_id: CAP-001-component-design-run-journal
    artifact_version: 3
    content_revision: sha256:603d72cecb94c61e031da77a615ccb51da0c5da2a1b864c2eea3cd9a9f41a8c3
  - artifact_id: CAP-001-component-design-runtime-config
    artifact_version: 3
    content_revision: sha256:b9e191536644bc166adb752a8e8148b0125d1ae86d1840f37dddc36c2636c42b
  - artifact_id: CAP-001-component-design-schema-migrator
    artifact_version: 3
    content_revision: sha256:caf7cb80a969accaf6959358973503fb2cd4d7af031024ca3d515890d6397efc
statistics:
  total_findings: 11
  critical: 0
  high: 5
  medium: 5
  low: 1
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: gpt-5
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-05T17:55:07Z
  source_artifacts:
    - id: CAP-001
      version: "6"
    - id: CAP-001-system-design
      version: "3"
    - id: CAP-001-ux-brief
      version: "6"
    - id: CAP-001-ux-design
      version: "4"
    - id: CAP-001-component-design-acquisition-runner
      version: "3"
    - id: CAP-001-component-design-coverage-service
      version: "3"
    - id: CAP-001-component-design-ingestion-api
      version: "3"
    - id: CAP-001-component-design-instrument-list-service
      version: "3"
    - id: CAP-001-component-design-market-data-store
      version: "4"
    - id: CAP-001-component-design-massive-client
      version: "3"
    - id: CAP-001-component-design-observation-writer
      version: "3"
    - id: CAP-001-component-design-owner-web-app
      version: "3"
    - id: CAP-001-component-design-rate-limit-governor
      version: "3"
    - id: CAP-001-component-design-run-journal
      version: "3"
    - id: CAP-001-component-design-runtime-config
      version: "3"
    - id: CAP-001-component-design-schema-migrator
      version: "3"
    - id: STD-UI
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Specification Review Report -- CAP-001

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-001 Market Data Acquisition Foundation |
| **Version** | v2 |
| **Specifications Reviewed** | Capability v6, System Design v3, UX Brief v6, UX Design v4, eleven component designs v3 and Market Data Store v4 |
| **Total Findings** | 11 (0 CRITICAL, 5 HIGH, 5 MEDIUM, 1 LOW) |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

**Findings:** CRITICAL 0 · HIGH 5 · MEDIUM 5 · LOW 1 · **total 11**

The specification set is traceable and architecturally coherent: all 23 capability
acceptance criteria map into the system and UX designs, the 12-component graph is
derivable, and all repository checks complete successfully. It is not yet cleanly
implementation-ready. The external provider contract is deliberately deferred to
an implementing story; the system-design HTTP interface table lacks full API
contracts; operational timing values needed by recovery and retries
remain undecided; the provider plan has not been demonstrated at the committed
volume; and the runtime design explicitly violates the governing secret-rotation
rule. These are HIGH findings, but the rubric assigns `READY-WITH-WARNINGS` when
there are no CRITICAL findings.

This review proceeded before artifact approval by explicit owner direction.
Approval is a downstream gate informed by this report, not a prerequisite for
creating it.

## Review Scope

The capability specification, system design, UX brief, UX design, and all 12
component designs were read in full. The configured FactorFlow design system was
available; the 10 referenced component specifications, theme tokens, component
map, and intake process were reviewed. All seven constitutions assigned to this
workflow were applied. Backlog artifacts were out of scope.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | Required sections, contracts, unresolved inputs, diagrams, and component coverage reviewed across all 16 specifications |
| SR-2 Correctness | applied | ACs, state transitions, security rules, data-preservation behavior, and edge cases cross-checked |
| SR-3 Consistency | applied | Versions, endpoint names, states, entities, terminology, and cross-references compared across the complete set |
| SR-4 Testability | applied | All 23 ACs and component acceptance criteria checked for observable inputs, outputs, bounds, and failure behavior |
| SR-5 Traceability | applied | Capability-to-system, component, and UX mappings checked; all 23 capability ACs are mapped |
| SR-6 Clarity | applied | Ambiguous terms, deferred decisions, and stale narrative claims reviewed |
| SR-7 Feasibility | applied | Runtime dependency, provider limits, operational timing, persistence, and deployment constraints assessed |
| SR-8 UX Completeness | applied | Screens, states, accessibility, components, tokens, source mapping, EDG checklist, and UX traceability assessed |
| SR-9 Dependencies and Conformance | applied | Capability dependency graph, STD-UI claims, and constitution obligations assessed with mechanical evidence |
| SR-10 Architectural Vocabulary | applied | Generated architecture inventory and provider/consumer vocabulary checked |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py` | run — PASSED with 1 warning | FINDING-1 |
| `build-architecture.py` | run — PASSED; 1 design, 12 components, 13 interfaces | none |
| `check-artifacts.py` | run — PASSED; 22 artifacts before this report | none |
| `check-references.py` | run — PASSED; 609 references across 117 Markdown files | none |
| `check-constitutions.py` | run — PASSED; 10 constitutions, 31 skills | none |

`check-capabilities.py` reported:

```text
WARNINGS (1)
  CAP-001 -> Massive (market data provider) [requires-runtime]: no acceptance criterion cited. Either cite the contract, or record that the target has not defined one.
```

## Constitutions Applied

| ID | Application and result |
|----|------------------------|
| `CONST-AGT` | Provenance, source fidelity, escalation of unsupported values, and end-to-end exercisability were checked. Deferred provider and configuration decisions produced FINDING-3, FINDING-4, FINDING-6, FINDING-7, and FINDING-8. |
| `CONST-MDL` | Exact model identifiers are used. The remaining unavailable Codex tool version is recorded as FINDING-11. |
| `CONST-OPS` | Forward-only migration and preservation mechanisms are explicit. Market Data Store v4 now records the owner-accepted absence of a current backup procedure, closing v1 FINDING-5 without silently claiming a recovery capability. |
| `CONST-REV` | Specification compliance and artifact quality were reviewed separately, with revision-bound evidence for every reviewed artifact. |
| `CONST-SA` | Structural checks, reference validation, placeholders, and repeated component-design structure were assessed. |
| `CONST-SEC` | Credential storage, logging, exposure, input validation, network binding, and rotation were traced. The explicit SEC-SEC-002 violation is FINDING-5. |
| `CONST-VER` | Every verdict is tied to a file read or command output from this review; the AC matrix below gives per-requirement evidence. |

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

No findings. Components have stable identifiers, interfaces name providers and
consumers, and capability identifiers are confined to traceability and sources.

#### Dependencies and Conformance (SR-9)

FINDING-1 applies. The Massive `requires-runtime` edge lacks a cited acceptance
criterion or an explicit machine-readable declaration that the target defines
none. The component design separately confirms that its contract is incomplete
(FINDING-3).
STD-UI is otherwise accounted for rule by rule.

#### Completeness, Correctness, Testability, and Clarity (SR-1, SR-2, SR-4, SR-6)

No additional capability-level findings. All 23 ACs are observable and mapped.

### System Design Specification

The component inventory and vocabulary are coherent, and the architecture
builder derives all 12 components and 13 interfaces. FINDING-2 records that the
HTTP portion of the system-design interface table does not provide the complete
request, response, status, and authentication contracts SR-1 requires. The
external provider row is also high-level; FINDING-3 records the missing
executable contract in the owning component design.

### Component Design Specifications

- **FINDING-3 (SR-1):** the Massive endpoint contract is absent.
- **FINDING-4 (SR-7):** recovery, retry, timeout, and polling values required by
  the algorithms remain unresolved.
- **FINDING-5 (SR-2):** runtime credential rotation violates SEC-SEC-002.
- **FINDING-6 (SR-7):** provider coverage and limits at the committed scale are
  unverified.
- **FINDING-7 (SR-4):** request-model bounds and defaults are unresolved.
- **FINDING-8 (SR-2):** observable lifecycle edge cases lack capability-level
  decisions.

The remaining component designs are internally consistent and contain concrete
interfaces, security controls, tests, acceptance criteria, and traceability.

### UX Brief

- **FINDING-9 (SR-3):** current frontmatter is paired with stale narrative
  source versions, counts, and readiness claims.
- **FINDING-10 (SR-8):** the indeterminate progress indicator remains a governed
  component-spec gap. The text fallback keeps the screen implementable.

### UX Design Specification

FINDING-9 and FINDING-10 apply. All 23 ACs are now present in the UX traceability
table, the 10 used design-system components resolve, all named theme tokens
exist, and the EDG checklist is present.

### Cross-Specification Consistency (SR-3)

Runtime states, endpoint paths, entity names, status tiers, and all 23 AC
mappings agree. The only material cross-specification inconsistency is the stale
UX narrative described by FINDING-9.

---

## Findings Summary Table

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | MEDIUM | SR-9 | Capability dependency target | Capability §5.1 | `check-capabilities.py` reports that the Massive `requires-runtime` edge cites no acceptance criterion and does not declare that the target defines none | The dependency graph cannot mechanically verify what satisfies the runtime edge | Add the checker-supported machine-readable no-target-criterion declaration, or cite the target contract criterion once defined |
| FINDING-2 | HIGH | SR-1 | System Design | `design/system-design.md` §4.2 | The HTTP interface rows give prose shapes but no concrete request/response schemas, systematic status codes, or per-interface authentication declaration | Downstream decomposition must reconstruct the API contract from component documents, and system-level compatibility cannot be tested directly against the design | Add request/response schema references, success and error status codes, and the loopback/no-auth declaration to every HTTP operation in §4.2 |
| FINDING-3 | HIGH | SR-1 | Massive Client | `component-design-massive-client.md` §§11, 14 | Paths, query parameters, pagination, and authoritative schemas for all four Massive reads are deferred to the implementing story | All four provider methods are blocked, and fixtures cannot demonstrate conformance to the real API | Resolve the provider documentation now and record exact endpoints, parameters, pagination, auth, response schemas, and error semantics |
| FINDING-4 | HIGH | SR-7 | Runtime Config; Run Journal; Rate-Limit Governor; Massive Client | `runtime-config.md` §2.2/§14; `run-journal.md` §14; `rate-limit-governor.md` §14; `massive-client.md` §14 | Request timeouts, initial backoff, throttle wait budget, heartbeat period, staleness window, and idle poll interval are `[REQUIRES INPUT]`; the designs say they block construction, the runner loop, and reclaim | Implementers must invent safety-sensitive values; bad choices can reclaim a healthy run, leave a dead run blocking work, or wait indefinitely on exhausted quota | Make an owner decision for each value, define valid ranges and relationships such as staleness greater than heartbeat, and place one canonical set of defaults in Runtime Config |
| FINDING-5 | HIGH | SR-2 | Runtime Config | `component-design-runtime-config.md` §§3, 4, 14 | The design explicitly states that provider-key rotation requires an ingestion-container restart and therefore does not meet SEC-SEC-002, which prohibits redeployment-required rotation | The specification knowingly conflicts with a High governing security rule; downstream work cannot claim security conformance | Either design zero-downtime credential reload or obtain and record the governing owner decision/constitution change required by the rule's Ask Before enforcement |
| FINDING-6 | HIGH | SR-7 | Capability; Massive Client | Capability open questions; `component-design-massive-client.md` §14 | Massive coverage and rate limiting have not been evaluated for 3,000 instruments at owner-selected depth; the design says failure would change AC-3 and AC-4 | Two core acceptance commitments may be infeasible under the selected provider or plan | Run a documented provider evaluation with realistic depth and pagination, record plan limits and throughput evidence, and revise AC-3/AC-4 or the provider choice if needed |
| FINDING-7 | MEDIUM | SR-4 | Ingestion API; Instrument List; Coverage Service | respective §14 sections | Maximum history depth, list cap, page-size defaults/maxima, and the coverage query's default range are unresolved, with several explicitly blocking request models | API boundary tests and validation contracts cannot be finalized consistently | Decide and centralize each bound/default, update request/response schemas, and add boundary tests |
| FINDING-8 | MEDIUM | SR-2 | Ingestion API; Instrument List; Run Journal | respective §14 sections | The capability does not decide the observable outcomes for requesting a run with no active instruments, retiring an instrument during a run, or cancelling a queued run | Different components already assume behavior without a capability AC, so UI, API, and test expectations can diverge | Add capability-level acceptance criteria or explicit non-goals for all three cases, then align component state transitions and UX copy |
| FINDING-9 | MEDIUM | SR-3 | UX Brief; UX Design | `ux-brief.md` introduction, §§9–10; `ux-design.md` header, §§3, 4, 6 | UX Brief v6 still cites Capability v2, System Design v1, STD-UI v2, 21 ACs, seven endpoints, and 11 components; UX Design v4 still says it was generated from Brief v5 and refers to 11 components | Reviewers cannot reliably determine which source revisions and inventory the UX claims validate, despite current frontmatter | Refresh narrative source mapping and readiness text to Capability v6, System Design v3, UX Brief v6, STD-UI v4, 23 ACs, nine HTTP operations, and 12 component specs |
| FINDING-10 | MEDIUM | SR-8 | UX Brief; UX Design; Owner Web App | UX Brief §4; UX Design §§1.1, 3; `component-design-owner-web-app.md` §14 | Indeterminate acquisition progress has no design-system component specification; prose provides a text fallback but records the final progress region as blocked | Accessibility and interaction behavior for a persistent, live-updating status region are not governed or reusable | Add the `progress` component/variant through the design-system intake process, including live-region and reduced-motion behavior, then replace the gap marker |
| FINDING-11 | LOW | SR-1 | Capability; UX Design | frontmatter | Codex-authored artifacts still carry `ai_provenance.tool_version: "unknown"` | Provenance is less reproducible, but specification behavior is unaffected | Populate the exact Codex version if recoverable; otherwise retain the explicit limitation |

## Traceability Matrix

| AC | Capability | System Design | UX Design | Verdict |
|----|------------|---------------|-----------|---------|
| AC-1 Named instrument list | mapped | mapped | mapped | PASS |
| AC-2 History depth stated | mapped | mapped | mapped | PASS |
| AC-3 Data types acquired | mapped | mapped | mapped | PASS, feasibility risk FINDING-6 |
| AC-4 Acquisition volume | mapped | mapped | mapped | PASS, feasibility risk FINDING-6 |
| AC-5 Point-in-time record | mapped | mapped | mapped | PASS |
| AC-6 Re-run safety | mapped | mapped | mapped | PASS |
| AC-7 Coverage visibility | mapped | mapped | mapped | PASS |
| AC-8 Gap visibility | mapped | mapped | mapped | PASS |
| AC-9 Honest run outcome | mapped | mapped | mapped | PASS |
| AC-10 Failure diagnosis | mapped | mapped | mapped | PASS |
| AC-11 Unrecognised instrument | mapped | mapped | mapped | PASS |
| AC-12 No false history | mapped | mapped | mapped | PASS |
| AC-13 Credential handling | mapped | mapped | mapped | PASS, conformance risk FINDING-5 |
| AC-14 Network exposure | mapped | mapped | mapped | PASS |
| AC-15 Forward data evolution | mapped | mapped | mapped | PASS |
| AC-16 Refuse inconsistent start | mapped | mapped | mapped | PASS |
| AC-17 Honest empty state | mapped | mapped | mapped | PASS |
| AC-18 Operational visibility | mapped | mapped | mapped | PASS |
| AC-19 Cancel a run | mapped | mapped | mapped | PASS, edge-case gap FINDING-8 |
| AC-20 Interrupted run | mapped | mapped | mapped | PASS, unresolved parameters FINDING-4 |
| AC-21 Removal retains history | mapped | mapped | mapped | PASS, edge-case gap FINDING-8 |
| AC-22 Deepening backfills | mapped | mapped | mapped | PASS |
| AC-23 Concurrent requests queue | mapped | mapped | mapped | PASS |

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No CRITICAL finding makes the specifications unusable as a whole. Five HIGH
findings materially affect implementation quality and should be closed before
implementation planning: incomplete system-level HTTP contracts, the absent
provider contract, unresolved operational timings, explicit secret-rotation
nonconformance, and unverified provider feasibility. Under the rubric, HIGH
findings do not produce `NOT-READY`; they do make a clean `READY` verdict
unavailable.

The previous review's architecture-inventory and UX traceability findings are
closed: the architecture builder now passes, and UX Design v4 maps AC-22 and
AC-23. The backup gap is now an explicit owner-accepted deferral in Market Data
Store v4. The remaining dependency warning and provenance limitation persist.

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. Complete the system-design HTTP contracts (FINDING-2).
2. Specify and cite the complete Massive API contract (FINDING-3).
3. Decide the operational timing and retry configuration (FINDING-4).
4. Resolve or formally govern the SEC-SEC-002 nonconformance (FINDING-5).
5. Validate the provider and plan at the committed volume and depth (FINDING-6).

### Should Fix (MEDIUM findings)

6. Fix the machine-readable Massive dependency citation (FINDING-1).
7. Set API bounds and defaults (FINDING-7).
8. Decide the three observable lifecycle edge cases (FINDING-8).
9. Refresh stale UX narrative provenance and counts (FINDING-9).
10. Close the indeterminate-progress component gap (FINDING-10).

### Nice to Have (LOW findings)

11. Populate the Codex tool version where recoverable (FINDING-11).
