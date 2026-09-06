---
artifact_schema_version: 1
artifact_id: CAP-001-specification-review
artifact_type: specification-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-06
document: spec-review-report
capability: CAP-001
version: v3
generated: 2026-09-06T01:44:17Z
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
    content_revision: sha256:9f45fb9ddc2bf420eebb1cd6f0f2935e9182e976df91dba5af606e829402d3fa
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
    artifact_version: 6
    content_revision: sha256:06b2374963b2db68ff6cab57bfb8924d96d08991f8e5208659cfc11d788d4db8
  - artifact_id: CAP-001-component-design-observation-writer
    artifact_version: 4
    content_revision: sha256:7572b6887e699496869a902b98fb5eb5499a2ce727a04d8774063fef1b996794
  - artifact_id: CAP-001-component-design-owner-web-app
    artifact_version: 4
    content_revision: sha256:f2ff988206f8bea4ec5cbfe73ac0bfc95bd964f2ced2625d513c03ca2d12286e
  - artifact_id: CAP-001-component-design-rate-limit-governor
    artifact_version: 5
    content_revision: sha256:11250c8b5e32b8e1b9329095cc63bb3a188f0df8c87db557d5185931aeebbf5b
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
  total_findings: 6
  critical: 0
  high: 2
  medium: 2
  low: 2
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-06T01:44:17Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "6"
    - id: CAP-001-ux-brief
      version: "7"
    - id: CAP-001-ux-design
      version: "5"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Specification Review Report -- CAP-001

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-001 Market Data Acquisition Foundation |
| **Version** | v3 |
| **Specifications Reviewed** | Capability, system design, UX brief, UX design, 12 component designs |
| **Total Findings** | 6 (0 CRITICAL, 2 HIGH, 2 MEDIUM, 2 LOW) |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

The specification set is substantively sound. All 26 acceptance criteria are
traced through the system design, the UX design and at least one component
design; all five mechanical checks pass; the architectural vocabulary is clean.
The findings are documentation-integrity defects, not design defects: three
sections of prose describe an earlier revision of decisions the specifications
themselves have already superseded.

Two HIGH findings both sit in the system design's Section 4.2 interface table,
which omits status codes that the authoritative component contract defines. The
risk is specific: Section 4.2 is where work breakdown and test design read the
API surface, so an omission there propagates into stories and tests that the
capability's own acceptance criteria would then fail.

## Review Scope

Reviewed: the capability specification, the system design, the UX brief, the UX
design, and all 12 component design specifications listed in the frontmatter --
9,145 lines in total, all read in full.

Not reviewed: `epics/`, excluded by the workflow as non-specification content.

**Gate state at review time.** `scripts/pipeline-state.py` reported
`AWAITING-APPROVAL` for this stage. Two blockers were reported: stale upstream
version pins across 15 artifacts, and missing owner approval on the capability
and system design. The staleness half was corrected before this review ran (see
Preconditions). The approval half remains: the capability and system design are
`status: draft` with no approval block, and no component design carries one.
This review was performed at the owner's explicit direction with that gate
condition open, and the verdict below should be read as advisory evidence for an
approval decision rather than as a passed gate. No approval was recorded by this
review.

### Preconditions corrected before review

Version pins across 15 artifacts referenced superseded upstream revisions:
CAP-001 pinned at 6 or 7 (current 8), system design at 3 (current 6), ux-design
at 4 (current 5), ux-brief at 6 (current 7), and tech-stack at 2 (current 3) in
the system design. Reviewing that set would have produced findings about version
skew rather than about the specifications.

Investigation established the drift was bookkeeping rather than content
divergence. Commit `2878b79` rewrote the capability, system design, UX and all
12 component designs in one coordinated pass resolving the v2 review, without
propagating the pins. Spot-checks confirmed the downstream content reflects
CAP-001 v8: AC-24 to AC-26 are traced with endpoint contracts, state transitions
and integration test rows; the probe-derived Massive decisions (`retries=0`,
`pagination=False`, minute-boundary throttle waits, the derived 900s staleness
window) are present in the component designs. The pins were corrected to match;
no prose was altered. Re-running the state check showed every staleness error
resolved and only the approval blocker remaining.

This is the third such repair in the capability's history (`cb51286`,
`b6288f7`), which is recorded as FINDING-5.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All capability sections present. System design carries API schemas, status codes, auth posture, block and sequence diagrams. All 12 component designs conform to the same 14-section template with Testing and Traceability. Every one of the 16 mermaid diagrams carries a preceding narrative overview of 3+ sentences |
| SR-2 Correctness | applied | 26 ACs checked pairwise for contradiction; none found. API error codes (`no_active_instruments`, `history_depth_not_set`, `run_already_terminal`, `not_found`) are distinct and non-overlapping. Run-state machine is closed over 8 states |
| SR-3 Consistency | applied | AC-to-design mapping complete; entity names, API paths, error codes and the 8 run states checked across capability, system design, UX design and component designs. Three inconsistencies found (FINDING-1, 2, 3) |
| SR-4 Testability | applied | All 26 ACs carry observable outcomes and concrete inputs. Quantified values (3000 instruments, 5-year depth, 3 retries, 900s staleness, 50/500 page size) are sourced to owner decisions or derivation, not invented |
| SR-5 Traceability | applied | System design Section 7 maps all 26 ACs to design elements and sections. UX design Section 5 maps all 26 to UI elements and component variants. Every AC is owned by at least one component design |
| SR-6 Clarity | applied | Acceptance-criteria block scanned for vague modifiers (should, may, appropriate, reasonable, fast, many, large, etc.); none present. ACs use MUST/MUST NOT consistently |
| SR-7 Feasibility | applied | Component dependency graph is acyclic (`build-architecture.py` derived 12 components and 16 interfaces). The single-point-of-failure risk in a claimed run is addressed by the heartbeat and reclaim sweep, deliberately placed in the application container |
| SR-8 UX Completeness | applied | `design_system_available = true`. All 10 referenced components resolve to existing `design-spec.md` files; the 11th and 12th (`chart`, unused) are recorded with reasons. All 55 theme tokens across component specs resolve against `theme.css`. One COMPONENT-SPEC-GAP (`progress`) properly recorded with intake reference. EDG checklist present with 5 dimensions. Source mapping present and verifiable (Path B, non-Figma) |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` PASSED: 3 edges, 1 standard, 1 conformance claim, no errors or warnings. Dependency typing, citation adequacy and 5.1/5.2/5.3 placement reviewed by hand. Conformance half assessed against STD-UI's 30 rules |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` PASSED with no capability-as-component findings. All 12 components declared in Section 4.1 with stable identifiers; every diagram box carries one. All 16 interfaces name a provider and a consumer component |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run — PASSED | none |
| `build-architecture.py -p factorflow-v2` | run — PASSED (1 design, 12 components, 16 interfaces) | none |
| `check-artifacts.py -p factorflow-v2 --strict` | run — PASSED (0 legacy artifacts) | none |
| `check-references.py` | run — PASSED (609 references across 117 files) | none |
| `check-constitutions.py` | run — PASSED (10 constitutions, 31 skills) | none |

No mechanical check produced an error or a warning. All six findings below come
from manual review.

## Constitutions Applied

| ID | Constitution | Outcome |
|----|--------------|---------|
| CONST-AGT | Agent Governance | Read and applied. AGT-PROV-001: every reviewed artifact carries a complete `ai_provenance` block, as does this report. AGT-EVIDENCE-002: quantitative values in the specifications are sourced to owner decisions or stated derivations. AGT-AUTH-001 governed the handling of approval — see Review Scope |
| CONST-MDL | Model Governance | Read and applied. MDL-PIN-002: reviewed artifacts name exact model identifiers in provenance (`gpt-5`, and `claude-opus-5` for this report). No production model pinning is in scope for a specification set |
| CONST-OPS | Operational Safety | Read and applied. OPS-MIG-001: AC-15/AC-16 and `schema-migrator` define a forward-only migration strategy with an explicit refuse-to-start path. OPS-MIG-003 is the one substantive tension — see FINDING-6. OPS-ERR-001: no silent error swallowing in the designs; per-instrument failures are recorded |
| CONST-REV | Review | Read and applied. REV-STG-001: this review covers both spec compliance (SR-3, SR-5) and artifact quality (SR-1, SR-2, SR-6) stages. REV-AGT-001: the agent-generated specifications were held to the same bar as human-authored ones |
| CONST-SA | Static Analysis | Read and applied. SA-MD-002: `check-references.py` confirms all 609 cross-references resolve. SA-MD-003: no placeholder language found. SA-NAME-002: quantified values are named constants sourced in `runtime-config` rather than scattered magic numbers |
| CONST-SEC | Security | Read and applied. SEC-SEC-001: AC-13 and constraint 5.12 forbid the credential in repository, logs and API responses. SEC-SEC-002: satisfied rather than waived — rotation at claim time without restart. SEC-AUTH-001: does not engage, and the specifications say why (loopback-only binding, AC-14, constraint 5.11) with an explicit revisit trigger recorded as an open question |
| CONST-VER | Verification | Read and applied. VER-EVD-001: every claim in this report rests on a command executed in this session or a file read in full. VER-EVD-004: per-dimension verdicts are given above for all ten dimensions |

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; assessed against the system
design below.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` reported no errors and no warnings: 3 edges
(1 `requires-runtime`, 2 `conforms-to`), 1 standard, 1 conformance claim, 1
constitution artifact, 1 reference.

**Dependency typing.** The Massive row is typed `requires-runtime`, which is the
weakest true type: acquisition cannot be built against a citation because the
provider defines no acceptance criterion, and the row says so explicitly with the
`no-acceptance-criterion` marker. Not over-typed. No `blocked-by` edges exist, so
the concentration check does not engage.

**Placement.** Section 5.2 correctly holds two deliberate non-dependencies
(Alpaca/broker port, kill switch), each with a reason. Section 5.3 holds
constraints naming no target. No inverted edges, no disclaimers stranded in 5.1.

**Standards conformance (STD-UI).** Section 5.4 accounts for all 30 rules. Every
`no` carries a scope-derived reason rather than convenience ("CAP-001 renders no
chart", "CAP-001 has no order path"), and each is verifiable against the
capability's own scope. The three `partial` claims carry per-criterion detail:
STD-UI-7 (status palette only), STD-UI-17 (acquires restated fundamentals but
derives no value), STD-UI-30 (search and filter required at AC-4's volume, but
the `data-table` spec offers pagination not virtualisation, so the component does
not discharge the rule alone). STD-UI-30's honesty is worth noting — it declares
a gap the design system cannot currently close rather than claiming conformance.

FINDING-4 records the one conformance-adjacent inconsistency.

#### Completeness (SR-1)

All expected sections present: Description, Scope (In/Out), five User Flows with
explicit failure branches, 26 Acceptance Criteria, Dependencies and Constraints,
Assumptions, Open Questions, Readiness Assessment. Non-functional requirements
are carried in the ACs (AC-4 volume, AC-13 credential handling, AC-14 network
exposure) and in Section 5.3 rather than a separate section, which is consistent
with the template.

#### Correctness (SR-2)

No contradictions found across the 26 ACs. The lifecycle criteria added in v8
(AC-24, AC-25, AC-26) were checked specifically against the criteria they
interact with: AC-24 against AC-9 (a zero-instrument run would otherwise finalise
as failed under the derive-from-writes rule), AC-25 against AC-21 (an observation
written for a just-retired instrument is retained), AC-26 against AC-23 (FIFO
queue) and AC-19 (cancel in progress). All three resolve rather than create
tension.

#### Testability (SR-4)

Every AC has an observable outcome and a concrete input. Quantified values are
sourced: 3000 instruments (AC-4, owner), 5-year plan cap (Assumptions, provider
tier), 3 retries per instrument and data type (owner, 2026-09-04), 900s staleness
(derived from a stated ~11.4-minute per-instrument worst case), 50-year max
depth and 50/500 page sizes (FINDING-7 of the v2 review). None is invented.

AC-8's testability deserves note: gap detection is defined as unavailable below
two instruments holding data in the range, and the specification states the
consequence that a market-wide outage is undetectable. That is a testable
limitation rather than a vague requirement.

#### Clarity (SR-6)

The acceptance-criteria block contains no vague modifiers. MUST and MUST NOT are
used consistently. No undefined references, no open-ended lists.

FINDING-1 and FINDING-2 are clarity-adjacent but recorded as consistency
defects, because the prose disagrees with the specification's own content rather
than being merely imprecise.

### System Design Specification

#### Architectural Vocabulary (SR-10)

Clean. All 12 components are declared in Section 4.1 with stable identifiers and
one-line responsibilities. Every box in both mermaid diagrams carries one of
those identifiers -- no box is labelled with a capability identifier. All 16
interfaces in Section 4.2 name a provider component and a consumer component,
including the in-process ones (`run-journal` -> `acquisition-runner`,
`market-data-store` -> `observation-writer`). The one external interface names
"Massive REST API (external)" as provider and `massive-client` as consumer,
which is correct. Capability identifiers appear only in traceability, source
documents and AC citations. `build-architecture.py` independently confirms this.

#### Completeness (SR-1)

API endpoints carry request schemas, response schemas, status codes and an
explicit auth posture. Both diagrams carry preceding narrative overviews of 7 and
5 sentences respectively. Control flow documents error conditions across five
`alt` branches. Section 5 carries 20 numbered architectural constraints.

#### Correctness (SR-2)

Error codes are unique and correctly classified. The 429-versus-5xx distinction
in constraint 5.13 is correct and consistently applied: a `429` does not count as
an attempt and waits to the next minute boundary (Massive sends no
`Retry-After`); a timeout or 5xx counts an attempt and backs off exponentially.
Sequence steps 24 and 27 encode the same split. This was verified against
`component-design-rate-limit-governor.md` section 2.5's outcome table and is
consistent in all three places.

#### Consistency (SR-3)

FINDING-1, FINDING-2 and FINDING-3 recorded here.

#### Traceability (SR-5)

Section 7 maps all 26 ACs to named design elements and sections. Spot-checked
five rows against the cited sections; all resolve.

### Component Design Specifications

#### Completeness (SR-1)

All 12 conform to the same 14-section template, each carrying Testing (section 7)
and Traceability (section 13). Every behaviour in the system design has an owning
component. All 16 mermaid diagrams across the set carry preceding narrative
overviews meeting the 3–5 sentence requirement.

#### Consistency (SR-3)

Every API endpoint in the system design's Section 4.2 is assigned to
`ingestion-api`, whose section 11 carries the authoritative contract. Data flows
match the system design's sequence flows. No orphaned components: all 12 declared
in Section 4.1 have a design, and no design exists for an undeclared component.

#### Feasibility (SR-7)

No circular dependencies (`build-architecture.py` derived the graph cleanly). The
one single point of failure -- a run claimed by a process that then dies -- is
addressed by the heartbeat and staleness sweep, and the design argues explicitly
for placing that sweep in the application container because "a component cannot
be relied on to notice its own death". Performance-critical paths carry
boundaries: per-instrument transactions, governor pacing, bounded page sizes.

### UX Brief

#### UX Completeness (SR-8)

Six screens identified with information architecture, interactions and a
conformance record. Section 12 carries the narrative STD-UI record that Section
5.4 of the capability mirrors. Accessibility requirements specified (WCAG 2.1 AA
per STD-UI-24). Candidate components are valid against the components repository.

### UX Design Specification

#### UX Completeness (SR-8)

Every screen from the brief has a corresponding section. All 10 referenced
components resolve to existing `design-spec.md` files; `chart` and one other are
unused with recorded reasons. All theme tokens resolve against
`design-system/theme.css` -- verified mechanically across all 12 component specs
(55 distinct tokens, all resolving). The EDG compliance checklist is present with
five dimensions, each carrying substantive notes rather than bare pass marks.
Traceability maps all 26 ACs to UI elements and component variants. Source
mapping is present and verifiable, correctly recording Path B (no Figma) with a
null file key.

One COMPONENT-SPEC-GAP is recorded properly: an indeterminate `progress`
indicator, with an intake reference and an explanation of why it was deliberately
not written. Two further gaps the design raised were closed and are documented
with their decisions -- including a defect the design itself found by checking
every component spec against the theme.

FINDING-3 recorded here.

### Cross-Specification Consistency (SR-3)

Entity names, API paths, error codes and user roles are consistent across the
capability, system design, UX design and component designs. The eight run states
(`requested`, `running`, `cancelling`, `succeeded`, `partial`, `failed`,
`cancelled`, `abandoned`) appear with consistent spelling and semantics in all
four layers; the UX design's tier mapping table reproduces STD-UI-12's
assignment without divergence.

---

## Findings Summary Table

CRITICAL 0 · HIGH 2 · MEDIUM 2 · LOW 2 · **total 6**

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-3 | System design | `design/system-design.md:314` | **Resolved 2026-09-06.** The Section 4.2 row for `POST /api/acquisition-runs` listed status codes `202; 409 history_depth_not_set`, omitting `409 no_active_instruments`. Constraint 5.18 requires it, the AC-24 traceability row cites Section 4.2 as where it lives, and `component-design-ingestion-api.md:454` carries it | Section 4.2 is the interface surface that work breakdown and test design read. A story generated from this row would omit AC-24's refusal path, and a test suite derived from it would not cover the empty-roster case that AC-24 exists to specify | Add `409 no_active_instruments` to the status-code cell, matching `component-design-ingestion-api.md` §11 |
| FINDING-2 | HIGH | SR-3 | System design | `design/system-design.md:317` | **Resolved 2026-09-06.** The Section 4.2 row for `POST /api/acquisition-runs/{id}/cancel` described the response as `state: cancelling` only. AC-26 requires a queued run to move directly to `cancelled`, which `component-design-ingestion-api.md:457` records as "`202` with `state: cancelling` when the run was running, or `state: cancelled` when it was still queued" | The queued-cancel path is AC-26's entire subject. A consumer reading only Section 4.2 would implement or test a single terminal state and miss the distinction the AC requires | Extend the response cell to name both states and the condition that selects between them |
| FINDING-3 | MEDIUM | SR-3 | UX design | `design/ux-design.md:709-717` | The Source Mapping table cites "UX brief v6", "Capability CAP-001 v7" and "System design v3". Current versions are 7, 8 and 6 respectively. The `ai_provenance` pins were corrected before this review; these prose citations were not, and are the body counterpart to the same drift | A reader verifying the design against its sources would compare against superseded revisions. The AC count in the same table already says 26, which only CAP-001 v8 has, so the table is internally inconsistent | Update the three version references to v7, v8 and v6 |
| FINDING-4 | MEDIUM | SR-1 | Capability | `Capability-CAP-001.md:436,441,451` | Section 8 Readiness Assessment states "twenty-three acceptance criteria" twice and "Three open questions remain". The specification has 26 ACs, and Section 7 holds two genuinely open questions plus two struck through as answered | Section 8 is the summary a reader consults to judge readiness. It understates the specification's coverage by three criteria and misstates the open-question count, both in the direction of describing an earlier revision | Update both counts to 26 and two, and revise the sentence enumerating what the ACs cover |
| FINDING-5 | LOW | SR-1 | Process | Capability history | Version pins have drifted and been hand-repaired three times (`cb51286`, `b6288f7`, and the correction preceding this review). The generating workflows do not propagate `source_artifacts` versions when a coordinated edit revises several artifacts together | Each recurrence blocks the specification-review gate with `AWAITING-APPROVAL` and costs an investigation to establish that the drift is bookkeeping rather than divergence. It will recur on the next coordinated edit | Raise against the harness rather than this capability: have the generating skills update downstream `source_artifacts` pins, or add a checker that reports stale pins as a distinct condition from stale content |
| FINDING-6 | LOW | SR-1 | System design | `design/system-design.md:390` | Constraint 5.10 states forward-only schema evolution with "no reversal path, so a migration that loses data is unrecoverable". CONST-OPS OPS-MIG-003 requires every upgrade to have a defined rollback path. The specification states the tension plainly but records no operational recovery procedure (backup-and-restore or equivalent) | The design is deliberate and the constraint traces to C5, so this is not a design defect. But an upgrade path with no stated recovery leaves the owner without a documented action when a migration fails destructively | Record the operational recovery expectation -- most likely a pre-migration backup step -- either here or in the capability's constraints, so OPS-MIG-003 is met by a stated procedure rather than by the absence of one |

---

## Traceability Matrix

All 26 acceptance criteria trace through three layers. Verified complete; see
`design/system-design.md` §7 for AC-to-design-element mapping and
`design/ux-design.md` §5 for AC-to-UI-element mapping.

| Layer | Coverage | Evidence |
|-------|----------|----------|
| Capability -> system design | 26/26 | System design §7, all rows resolve to named components and sections |
| Capability -> UX design | 26/26 | UX design §5, each row naming a screen region and a component variant |
| Capability -> component designs | 26/26 | Every AC referenced by at least one of the 12 component designs |
| System design components -> component designs | 12/12 | One design per declared component; no orphans in either direction |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No CRITICAL findings. Two HIGH findings exist and neither blocks downstream
phases outright, which is what separates this verdict from NOT-READY: both are
omissions in a summary table whose authoritative counterpart
(`component-design-ingestion-api.md` §11) is correct and explicitly designated as
the contract that Section 4.2 "must not be read as a competing source".

The HIGH findings should nonetheless be fixed before work breakdown rather than
after. Epic and story generation read the system design's interface table, and
both omissions concern acceptance criteria added in the most recent revision
(AC-24, AC-26) — precisely the criteria a reader is least likely to catch by
familiarity.

The specification set is otherwise in good condition: complete traceability
across three layers, clean architectural vocabulary, all mechanical checks
passing, quantified values sourced rather than invented, and a UX design whose
component and token references resolve without exception.

**Gate status.** This verdict is not an approval and does not satisfy the
approval gate. The capability and system design remain `status: draft` with no
approval block, and `pipeline-state.py` will continue to report
`AWAITING-APPROVAL` until the owner approves the reviewed revisions explicitly.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

**Both resolved on 2026-09-06, at the owner's direction, after this report was
first written.** The fixes are recorded here rather than in a new report version
because they change the reviewed artifact, not the review: the finding stands as
raised, and its remedy is part of the same record.

1. ~~**FINDING-1** — Add `409 no_active_instruments` to the `POST
   /api/acquisition-runs` row in system design §4.2.~~ **Applied.** The
   status-code cell now reads ``202``; ``409`` ``history_depth_not_set``; ``409``
   ``no_active_instruments`` (AC-24), matching `component-design-ingestion-api.md`
   §11.
2. ~~**FINDING-2** — Record both `cancelling` and `cancelled` outcomes, with
   their selecting condition, in the cancel-endpoint row in system design
   §4.2.~~ **Applied.** The response cell now names `state: cancelling` when the
   run was running and `state: cancelled` when it was still queued (AC-26),
   matching `component-design-ingestion-api.md` §11.

`docs/architecture.md` was regenerated with `build-architecture.py --write`,
which propagated the AC-26 wording into the derived interface inventory. All five
mechanical checks pass after the edits.

The system design's `artifact_version` was deliberately left at 6. The change
corrects a summary table to match a contract it already deferred to; bumping it
would restale the `source_artifacts` pins in all 14 downstream artifacts and
reintroduce the condition FINDING-5 describes, for an edit that alters no
design decision. Recorded here so the choice is visible rather than silent.

### Should Fix (MEDIUM findings)

3. **FINDING-3** — Update the three stale version citations in the UX design's
   Source Mapping table to v7, v8 and v6.
4. **FINDING-4** — Correct the AC count (26) and open-question count (two) in the
   capability's Section 8, and revise the accompanying sentence.

### Nice to Have (LOW findings)

5. **FINDING-5** — Fix version-pin propagation in the generating workflows, or
   distinguish stale pins from stale content in the checker. Harness-level, not
   capability-level.
6. **FINDING-6** — State the operational recovery procedure for a failed
   migration, so OPS-MIG-003 is met by a documented step.

### Next Step

After the HIGH findings are addressed, the owner may approve the reviewed
revisions with `scripts/artifact-gate.py approve`, citing this report as
`--review-artifact`. Epic generation and test design remain blocked for
schema-versioned inputs until that approval is recorded.
