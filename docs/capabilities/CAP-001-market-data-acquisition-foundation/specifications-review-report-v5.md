---
artifact_schema_version: 1
artifact_id: CAP-001-specification-review
artifact_type: specification-review
artifact_version: 5
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-16
updated: 2026-09-16
document: spec-review-report
capability: CAP-001
version: v5
generated: 2026-09-16T22:06:42Z
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
  SR-9: "applied — conformance half assessed against STD-UI; dependency half assessed against 5.1/5.2/5.3"
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
    artifact_version: 7
    content_revision: sha256:a547b2e319c58207eb95fb91151d2317f21cd2bd001a80a37c54f0ba97b2c030
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
    artifact_version: 6
    content_revision: sha256:d748d38dff2d8ef506a46f7420a3c89dbdb61471fb87fb158112bdea0eed0579
  - artifact_id: CAP-001-component-design-schema-migrator
    artifact_version: 4
    content_revision: sha256:e877f0c46d6ca6c2f07f736212ccd00693c2c478fefbfbde5608e7af7ac3efa3
statistics:
  total_findings: 7
  critical: 0
  high: 0
  medium: 4
  low: 3
pipeline_readiness: READY
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Devin
  tool_version: "unknown"
  timestamp: 2026-09-16T22:06:42Z
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
      version: "7"
    - id: CAP-001-component-design-observation-writer
      version: "4"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: CAP-001-component-design-rate-limit-governor
      version: "8"
    - id: CAP-001-component-design-run-journal
      version: "6"
    - id: CAP-001-component-design-runtime-config
      version: "6"
    - id: CAP-001-component-design-schema-migrator
      version: "4"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Specification Review Report -- CAP-001

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-001 Market Data Acquisition Foundation |
| **Version** | v5 |
| **Specifications Reviewed** | Capability, system design, UX brief, UX design, 12 component designs |
| **Total Findings** | 7 (0 CRITICAL, 0 HIGH, 4 MEDIUM, 3 LOW) |
| **Pipeline Readiness** | READY |

Governor v8 resolves v4 FINDING-1. Its Testing table now states the same
standard token-bucket bound as AC-1 and DEC-0002: a window beginning with a full
bucket may issue capacity plus one window's refill, while subsequent windows
after drawdown are capped at the configured budget. The E3-S4 task plan was
updated separately to propagate that bound. No CRITICAL or HIGH findings remain.

The seven remaining findings are unchanged from v4: four MEDIUM consistency,
traceability, and clarity defects and three LOW bookkeeping or scope defects.
They do not make the specification set incomplete or contradictory for
continued E3-S4 rework.

## Review Scope

The complete CAP-001 manifest was reviewed: the capability specification,
system design, UX brief, UX design, and all 12 component designs listed in the
frontmatter. `epics/` and stories are not specification subjects; the E3-S4 task
plan is mentioned only as downstream propagation evidence.

Only `component-design-rate-limit-governor.md` changed since v4, from v7 at
`sha256:f4a14bc7...` to v8 at `sha256:21e573a3...`. The material change replaces
the stale Testing-table bound identified by v4 FINDING-1. Version, lifecycle,
provenance, and update metadata were refreshed, and stale approval evidence was
removed pending this review and explicit owner approval. All other 15 subjects
are unchanged at the revisions v4 reviewed.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All expected capability and design sections are present; all diagrams have narrative overviews; FINDING-4 remains in the capability readiness summary |
| SR-2 Correctness | applied | Governor AC-1, §2.4, and §7 now state compatible token-bucket behavior; FINDING-2 remains for boundary-path jitter semantics |
| SR-3 Consistency | applied | AC, endpoint, entity, state, and component mappings checked across all specifications; FINDING-3, FINDING-4, and FINDING-7 remain |
| SR-4 Testability | applied | All 26 capability ACs are observable and automatable; the corrected governor testing row now matches its AC; FINDING-5 remains for the declared single-caller model |
| SR-5 Traceability | applied | All 26 ACs map through system and component designs; FINDING-1 remains for the unresolved project-local decision citation |
| SR-6 Clarity | applied | Acceptance criteria contain no vague modifiers; FINDING-1 and FINDING-6 remain |
| SR-7 Feasibility | applied | Twelve-component dependency graph remains acyclic and bounded |
| SR-8 UX Completeness | applied | All screens, states, accessibility requirements, components, tokens, EDG checks, and the documented component gap remain covered |
| SR-9 Dependencies and Conformance | applied | Capability checker passed; dependency typing and STD-UI conformance remain valid |
| SR-10 Architectural Vocabulary | applied | Architecture inventory passed with 12 declared components and 16 interfaces |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, PASSED: 1 capability, 3 edges, 1 standard, 1 conformance claim | none |
| `build-architecture.py -p factorflow-v2` | run, PASSED: 1 design, 12 components, 16 interfaces | none |
| `check-artifacts.py -p factorflow-v2 --strict` | run, PASSED with 50 warnings | FINDING-7 |
| `check-references.py` | run, PASSED: 754 references across 128 Markdown files | none |
| `check-constitutions.py` | run, PASSED: 10 constitutions, 33 skills | none |

The warning count fell from 51 in v4 to 50 because E3-S4 tasks now pin governor
v8. Remaining warnings cover legacy implementation-review summary formats,
tech-stack revision pins, two other task plans pinning governor v6, stale story
pins, and constitution pins. `check-references.py` still cannot detect
FINDING-1 because the nonexistent path is inline code rather than a Markdown
link.

## Constitutions Applied

| ID | Outcome |
|----|---------|
| CONST-AGT | Provenance present on every reviewed artifact and this report; review and approval kept separate |
| CONST-MDL | Exact model identifier recorded in this report |
| CONST-OPS | Retry and throttle loops remain bounded by design; governor v8 changes no operational bound |
| CONST-REV | Specification compliance and artifact quality independently assessed |
| CONST-SA | Mechanical reference, capability, and architecture checks run; quantified values retain named sources |
| CONST-SEC | Governor amendment changes no credential, logging, authentication, or data-classification surface |
| CONST-VER | Claims are tied to files read or commands rerun; all ten dimensions carry a verdict |

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; assessed against the system
design.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` passed. Dependency type, placement, citation, and STD-UI
specialization checks remain unchanged and valid.

#### Completeness (SR-1)

All expected sections and 26 acceptance criteria are present. FINDING-4 records
the stale readiness-summary counts.

#### Correctness (SR-2)

No contradictory acceptance criteria or impossible user-flow states found.

#### Testability (SR-4)

All 26 criteria have observable outcomes, concrete inputs, and measurable
boundaries.

#### Clarity (SR-6)

No vague modifiers in the acceptance-criteria block.

### System Design Specification

#### Architectural Vocabulary (SR-10)

All 12 components have stable identifiers and all 16 cross-boundary interfaces
name provider and consumer components. Capability IDs remain confined to source
and traceability contexts.

#### Completeness, Correctness, Consistency, and Traceability

Endpoints retain schemas, status codes, and authentication posture. Constraint
5.13 remains compatible with the governor's corrected pacing and throttle
semantics. Section 7 maps all 26 ACs. FINDING-7 records only the tech-stack
source-version drift.

### Component Design Specifications

#### Completeness (SR-1)

All 12 designs conform to the component template, own every declared behavior,
and define their interfaces and test strategies.

#### Correctness and Consistency (SR-2, SR-3)

Governor v8 resolves v4 FINDING-1. Section 7 now requires the standard
full-bucket-window bound and steady-state configured-budget bound stated by AC-1
and DEC-0002. The corresponding E3-S4 T002 text now uses the same two-part
bound. The implementation test already calculates `capacity + refill_rate *
window_length`; story rework should align its stale name and leading docstring
with the corrected contract before the next implementation review.

FINDING-2 remains: §2.5's universal full-jitter sentence differs from the
recorded additive boundary-wait implementation semantics. FINDING-6 remains:
the Massive client retains a discharged open blocker.

#### Feasibility (SR-7)

No circular dependencies or unbounded design paths. The token-bucket correction
changes documentation consistency, not implementation feasibility.

### UX Brief

#### UX Completeness (SR-8)

All six screens, interactions, edge states, and accessibility requirements are
covered. Design-system component references remain valid.

### UX Design Specification

#### UX Completeness (SR-8)

All brief screens are specified. Components and tokens resolve, the `progress`
component gap remains explicitly recorded, the EDG checklist is present, and
all 26 UX-relevant ACs are mapped. FINDING-3 records stale source-version labels.

### Cross-Specification Consistency (SR-3)

The eight run states, error codes, API paths, component identifiers, and entity
names remain consistent. The token-bucket bound is now consistent between
governor §§2.4, 7, and 8 and the downstream E3-S4 task plan.

---

## Findings Summary Table

CRITICAL 0 · HIGH 0 · MEDIUM 4 · LOW 3 · **total 7**.

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | MEDIUM | SR-5 | Rate-limit governor | §8 AC-1 amendment note | `docs/decision-records.md` does not exist in this repository; DEC-0002 exists only at `projects/factorflow-v2/decisions/DEC-0002.md` in the harness repository | Readers cannot resolve the normative decision from the project repository | Correct the citation or mirror DEC-0002 into a governed project artifact |
| FINDING-2 | MEDIUM | SR-2 | Rate-limit governor | §2.5 final paragraph | The design says all jitter is full jitter, while E3-S4 records deliberate additive jitter for boundary waits to avoid retrying before quota refill | The specification misdescribes the implemented boundary-path wait | Specify additive boundary-wait jitter while retaining full jitter for retry backoff, or record an approved exception |
| FINDING-3 | MEDIUM | SR-3 | UX design | §6 Source Mapping | The source table cites UX brief v6, capability v7, and system design v3; current versions are v7, v8, and v6 | Verification points readers to superseded inputs | Update the three source versions |
| FINDING-4 | MEDIUM | SR-1 | Capability | §8 readiness assessment | It states 23 ACs twice and three open questions; the document has 26 ACs and two open questions | The readiness summary understates coverage and misstates unresolved decisions | Update the counts and the enumerating sentence |
| FINDING-5 | LOW | SR-4 | Rate-limit governor | §8 AC-11 | The concurrent-caller criterion is asserted while §5 declares a single-threaded caller model | The criterion is vacuously satisfied rather than exercised | Record the criterion as vacuous under the current model or restate the future-concurrency bound |
| FINDING-6 | LOW | SR-6 | Massive client | §14 open question 2 | The item still says it blocks the governor throttle path although governor §2.5 and system-design constraint 5.13 provide the requested behavior | Pipeline bookkeeping reports a blocker that has already been discharged | Mark it resolved or restate any remaining question |
| FINDING-7 | LOW | SR-3 | All reviewed specifications | Provenance and References | Thirteen specifications pin tech-stack v3 while v4 is current; all 12 component References tables also name v3 | Repeated checker warnings and stale source labels | Propagate v4 pins and references; retain the harness-level durable fix from v3 FINDING-5 |

## Resolved Since v4

| Prior finding | Resolution evidence |
|---------------|---------------------|
| v4 FINDING-1, HIGH | Governor v8 §7 now states capacity plus one window's refill for a window beginning full and configured budget for later windows after drawdown. E3-S4 tasks v2 T002 carries the same contract. The design and task artifacts both pass strict artifact validation |

---

## Traceability Matrix

| Layer | Coverage | Evidence |
|-------|----------|----------|
| Capability to system design | 26/26 | System design §7 |
| Capability to UX design | 26/26 | UX design §5 |
| Capability to component designs | 26/26 | Every AC is referenced by at least one component design |
| System components to component designs | 12/12 | One design per declared component, no orphans |

## Pipeline Readiness Assessment

**Verdict:** READY

There are no CRITICAL or HIGH findings. The token-bucket contradiction that
blocked safe continuation of E3-S4 has been removed from both the governor's
test strategy and the task plan. The remaining four MEDIUM and three LOW
findings should be scheduled but do not prevent implementation rework against
the current governor contract.

This verdict is review evidence, not approval. Governor v8 remains draft until
the owner explicitly approves this exact revision against this report.

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

None.

### Should Fix (MEDIUM findings)

1. Make the DEC-0002 citation project-resolvable.
2. Reconcile §2.5 boundary-path jitter wording with the approved implementation behavior.
3. Refresh UX-design source versions.
4. Correct capability §8 counts.

### Nice to Have (LOW findings)

5. Clarify governor AC-11 under the single-caller model.
6. Close or restate Massive-client open question 2.
7. Propagate tech-stack v4 pins and Reference-table labels.
