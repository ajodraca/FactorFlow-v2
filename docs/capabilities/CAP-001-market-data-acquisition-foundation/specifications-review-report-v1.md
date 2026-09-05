---
artifact_schema_version: 1
artifact_id: CAP-001-specification-review
artifact_type: specification-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-05
updated: 2026-09-05
document: spec-review-report
capability: CAP-001
version: v1
generated: 2026-09-05T15:37:29Z
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
    content_revision: sha256:61c4801eb46f1ac1882800a569346bab204068cba8b4cd1cfbb5b0444308edee
  - artifact_id: CAP-001-system-design
    artifact_version: 3
    content_revision: sha256:6b791f68c9f60091a11c498108a5432f577fc7c20aba3968d8f988c8d24b1ff9
  - artifact_id: CAP-001-ux-brief
    artifact_version: 5
    content_revision: sha256:c65a1ef5e2873603798471045d0248bb90f18de93d89778f26622f33e0ddc8b3
  - artifact_id: CAP-001-ux-design
    artifact_version: 3
    content_revision: sha256:92cf96a5a9299eb13b73732c7c21734f040375e1e91e4df2978c409da87b51ca
statistics:
  total_findings: 8
  critical: 0
  high: 1
  medium: 4
  low: 3
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-05T15:37:29Z
  source_artifacts:
    - id: CAP-001
      version: "6"
    - id: CAP-001-system-design
      version: "3"
    - id: CAP-001-ux-brief
      version: "5"
    - id: CAP-001-ux-design
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
| **Version** | v1 |
| **Specifications Reviewed** | Capability v6, System Design v3, UX Brief v5, UX Design v3, 12 component designs v2 |
| **Total Findings** | 8 (0 CRITICAL, 1 HIGH, 4 MEDIUM, 3 LOW) |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

**Findings:** CRITICAL 0 · HIGH 1 · MEDIUM 4 · LOW 3 · **total 8**

This is a strong specification set. Twenty-three acceptance criteria are
individually observable and quantified where quantification is possible; the
system design declares twelve components with stable identifiers and names both
sides of every interface; and the three commitments that cannot be repaired
later — append-only point-in-time history, coverage derived from written rows
rather than intent, and idempotent writes — are each traced to the constraint
that forces them and carried consistently into the component designs.

Every finding below concerns the **UX design specification**, and all but one
are staleness rather than error: the artifact was generated against earlier
revisions of its own inputs and was not refreshed when the capability gained
AC-22 and AC-23. The behaviour those criteria describe is in fact specified in
the UX design's Section 1.1 prose; what is missing is the traceability that
proves it. No finding blocks epic generation or test design.

## Review Scope

All artifacts the capability folder offers were reviewed and read in full:

- **Capability specification** (mandatory) — present, v6.
- **System design** — present, v3.
- **UX brief and UX design** — both present, v5 and v3. `ui_facing: true`, so
  SR-8 applies.
- **Component designs** — 12 present, all at v2, one per component the system
  design declares.

`epics/` exists in the capability folder and was ignored, as the workflow
requires: it is backlog, not specification.

**Design system:** configured and resolved. `projects/factorflow-v2/design-system.yaml`
names `FactorFlow-v2` as the components repo, and all four declared paths exist
(`design-system/components` with 12 component specs, `theme.css`,
`component-map.json`, `intake.md`). `design_system_available = true`, so
component mapping and token checks were performed rather than skipped.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All required sections present in every artifact. Every one of the 15 mermaid diagrams across the system design and component designs carries a preceding narrative of 3–5 sentences naming what it depicts, its actors, and the expected outcome; each was checked individually |
| SR-2 Correctness | applied | 23 ACs cross-read for contradiction; run-state machine checked for unreachable and conflicting transitions; five user flows walked including failure branches |
| SR-3 Consistency | applied | API paths, entity names, run states, badge variants and status tiers compared across capability, system design, UX design and all 12 component designs |
| SR-4 Testability | applied | Every AC assessed for observable outcome, concrete input, boundary condition and measurability |
| SR-5 Traceability | applied | AC-to-design mapping verified in all three traceability tables; gaps recorded as FINDING-1 |
| SR-6 Clarity | applied | Mechanical scan for vague modifiers, unquantified terms and open-ended lists across all artifacts, plus reading |
| SR-7 Feasibility | applied | Component dependency graph derived from all 12 declarations and checked for cycles and single points of failure |
| SR-8 UX Completeness | applied | Design system resolved and available, so screen coverage, component mapping, source mapping, token usage, traceability and EDG were all assessed |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` run; both halves apply — the project declares one standard (STD-UI) and CAP-001 declares two `conforms-to` edges, so the conformance half was assessed rather than skipped |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` run and its 12-component, 13-interface inventory read; Sections 1–5 of the system design checked for capability identifiers used as actors |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py` | run — PASSED with 1 warning | FINDING-4 |
| `build-architecture.py` | run — FAILED (exit 1) | FINDING-2 |
| `check-artifacts.py` | run — PASSED, 21 artifacts, 0 legacy | none |
| `check-references.py` | run — PASSED, 609 references across 117 files | none |
| `check-constitutions.py` | run — PASSED, 10 constitutions, 31 skills | none |

`build-architecture.py` exited 1, and the reason matters for how the finding is
severity-rated. It did **not** fail to derive an inventory: it reported
`1 design(s), 12 component(s), 13 interface(s)` and named no capability
identifier used as a provider or consumer, and no interface naming an undeclared
component. It failed because the checked-in `docs/architecture.md` is out of
date relative to what it derived. That is a repository-hygiene defect, not a
design defect, which is why FINDING-2 is MEDIUM rather than the HIGH an
underivable design would earn.

## Constitutions Applied

The relevance matrix assigns `specification-review` seven constitutions. All
seven were read in full before the review dimensions were applied.

| ID | Constitution | What it produced here |
|----|--------------|------------------------|
| `CONST-AGT` | Agent Governance | AGT-PROV-001 drove the provenance check across all 16 artifacts, which surfaced FINDING-1 and FINDING-3. AGT-EVIDENCE-002 confirmed: every quantitative value in the capability (3000 instruments, 3 retry attempts, 10s/30s polling) cites an owner decision or the tech stack. AGT-SCOPE-003 confirmed: all 23 ACs are exercisable end to end on delivery. AGT-AUTH-003 satisfied — the UX design's Section 7 escalates decisions to the capability rather than resolving them in a layout |
| `CONST-MDL` | Model Governance | MDL-PIN-002 checked across every artifact's `ai_provenance.model`. All exact identifiers (`claude-opus-5`, `gpt-5`), no aliases. FINDING-8 records the one gap, which is `tool_version`, not the model |
| `CONST-OPS` | Operational Safety | OPS-MIG-001 satisfied: forward-only numbered migrations with an `applied_migrations` table constitute an explicit migration strategy, and AC-15/AC-16 make refusal-to-start the failure mode. OPS-DEST-003 checked specifically — the design states a preservation intent and prescribes a preserving mechanism (retire, never delete; `INSERT ... ON CONFLICT DO NOTHING`), with no intent-versus-mechanism contradiction. OPS-MIG-003 produced FINDING-5 |
| `CONST-REV` | Review | REV-STG-001 structures this report: spec compliance (SR-3, SR-5, SR-9) and artifact quality (SR-1, SR-2, SR-4, SR-6) are both covered with findings. REV-AGT-001 honoured: these artifacts are agent-generated and were reviewed at the full bar, not a reduced one |
| `CONST-SA` | Static Analysis | Applied to the artifacts as artifacts — structural consistency across the 12 component designs (all carry the same 14 sections), no placeholder text, no unresolved references |
| `CONST-SEC` | Security | Credential handling traced end to end: AC-13, system design constraint 5.12, `runtime-config` §2, and the UX design's Settings screen agree that presence is a boolean and the value appears in no view or log. AC-14's loopback binding is the stated and sole basis for having no authentication, and it is recorded as a revisit trigger in the capability's open questions rather than left implicit |
| `CONST-VER` | Verification | VER-EVD-001 and VER-EVD-002: every claim in this report rests on a command run in this session or a file read in this session. VER-EVD-004: the dimension status table and the per-AC traceability matrix below give per-requirement verdicts rather than an aggregate pass |

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; assessed against the system
design below.

#### Dependencies and Conformance (SR-9)

**Script output, verbatim:**

```
WARNINGS (1)
  CAP-001 -> Massive (market data provider) [requires-runtime]: no acceptance
  criterion cited. Either cite the contract, or record that the target has not
  defined one.
```

Recorded as FINDING-4, MEDIUM. Per the rubric an uncited edge is a finding about
the target, and this target is an external commercial provider rather than a
capability. The row already states in its "What is needed" cell that no criterion
can be cited because Massive is not a capability and its coverage is under
evaluation — which is precisely the "record that the target has not defined one"
branch the checker names. The finding stands because the checker cannot read that
prose, but the remedy is small.

**Dependency typing** — correct. The Massive edge is `requires-runtime`, which is
the weakest true type: acquisition genuinely cannot run without a live provider,
and no interface-only substitute exists. Both other edges are `conforms-to`, the
right type for a standard and for the tech stack. No `blocked-by` rows exist at
all, so there is no `blocked-by` concentration finding and the capability is
correctly reported as independently implementable.

**Placement** — correct. Section 5.2 carries two genuine non-dependencies (the
broker port, the kill switch) with reasons, rather than leaving disclaimers in the
5.1 table where a later reader would misread them as dependencies. Section 5.3
holds the ten constraints that name no target.

**Standards conformance** — the project declares one standard (STD-UI, v4,
approved), so this half applies rather than being skipped. Section 5.4 accounts
for all 30 rules with no omissions and no invented rules.

*Specialization legality* — no violation. Every rule CAP-001 marks `yes` or
`partial` it satisfies at or above the rule's own bar; nothing marked
`stricter-only` is relaxed, and nothing marked `none` is specialized. The two
`partial` claims both carry per-criterion detail, as the rubric requires:
STD-UI-7 is scoped to the status palette because the capability renders no
series, and STD-UI-30 states plainly that the `data-table` spec offers pagination
where the rule requires virtualisation, so the component does not discharge the
rule alone. A `partial` that names what it does not cover is the honest form.

*"Does not apply" justification* — all nine `no` markings were checked against
the rule text, and each follows from scope rather than convenience: STD-UI-9,
-27 and -28 govern charts and CAP-001 renders none (confirmed against system
design 4.3, which selects a charting library without using it); STD-UI-11 and
-20 govern paper/live environments and promotion, neither of which exists here;
STD-UI-21 governs the kill switch, recorded as a non-dependency because there is
no order path; STD-UI-22 governs capital-at-risk and destructive controls, and
retirement is demonstrably neither since it discards nothing; STD-UI-26 governs
multi-step operations, and the first-run path is three separate operations, a
judgement the UX design records and marks reversible if it ever becomes a wizard.
FINDING-7 concerns only how STD-UI-10 is labelled, not whether it is satisfied.

*Missing constitution artifacts* — none. STD-UI resolves to
`docs/constitution/standards/ui-conventions.md`, and `check-capabilities.py`
confirms one constitution artifact and one reference, with no dangling citation.

#### Completeness (SR-1)

No findings. Description, Scope (both halves), five User Flows, 23 Acceptance
Criteria, Dependencies and Constraints, Assumptions, Open Questions and a
Readiness Assessment are all present and substantively populated. Non-functional
requirements are carried as acceptance criteria rather than a separate section —
AC-4 (volume), AC-13 (credential handling), AC-14 (network exposure), AC-15 and
AC-16 (upgrade safety) — which is a legitimate structure, and each is testable in
that form. Error handling is specified through AC-9 to AC-12 and AC-20, and every
user flow terminates in an explicit failure branch.

#### Correctness (SR-2)

No findings. The 23 criteria were cross-read for contradiction and none
conflicts. Three pairs that could easily have contradicted each other do not:
AC-5 (append on restatement) against AC-6 (re-run adds nothing) is resolved by
the natural key including a value hash, so an identical value collides and a
restated one does not; AC-19 (cancel retains written coverage) against AC-12 (no
false history) is resolved by the per-instrument commit boundary; and AC-21
(removal retains history) against AC-3 (a run provides all four data types) is
resolved by retirement removing the instrument from the active roster rather than
from storage. The five user flows are logically valid, and the run state machine
in `run-journal` §2.2 has no unreachable state and no conflicting transition.

#### Testability (SR-4)

No findings. All 23 criteria carry an observable outcome and a concrete input.
Boundary conditions are explicit where they exist — 3000 instruments (AC-4), two
instruments as the floor for gap detection, the stated history depth (AC-2,
AC-22), request order for queued runs (AC-23). The criteria most at risk of being
untestable are instead the most carefully drawn: AC-12 is falsifiable by killing a
run partway and reading coverage; AC-20 is falsifiable by killing the ingestion
container and waiting out the staleness window; AC-13 is falsifiable by grepping
logs and API responses. AC-4 constrains completeness but not duration, which the
capability states plainly as an open question rather than leaving implied — that
is a recorded scope decision, not an untestable criterion.

#### Clarity (SR-6)

No findings. A mechanical scan of the acceptance criteria for vague modifiers
(`should`, `may`, `appropriate`, `reasonable`), unquantified terms (`fast`,
`many`, `large`) and open-ended lists (`etc.`, `and so on`) returned nothing. The
criteria use MUST and MUST NOT throughout. Every quantitative value is sourced:
3000 instruments to an owner decision, the retry limit of 3 to an owner decision
of 2026-09-04, polling cadences to STD-UI-25.

### System Design Specification

#### Architectural Vocabulary (SR-10)

No findings — this dimension is fully satisfied, which is worth stating
explicitly because it is the one most often failed.

Section 4.1 declares all twelve components with stable identifiers and one-line
responsibilities. Every box in both mermaid diagrams carries one of those
identifiers; none is labelled with a capability identifier. Section 4.2 records
thirteen interfaces, each naming a provider component and a consumer component —
including the two that most invite vagueness, where the run-request claim names
`run-journal` → `acquisition-runner` and the external provider read names
`Massive REST API (external)` → `massive-client` rather than "consumed by
CAP-001". `build-architecture.py` independently derived the same 12 components
and 13 interfaces and reported no capability used as a provider or consumer.

Capability identifiers appear in Sections 1–5 only as citations for *why* a
design decision holds (`AC-12`, `C5`), never as an actor performing an action.
Section 1 explicitly instructs the reader to read Section 4 first as the
vocabulary for the rest of the document.

#### Completeness (SR-1)

No findings. All nine API endpoints carry a shape and a stability rating.
Authentication is specified as deliberately absent with its sole justification
(loopback binding) and its revisit trigger. Both diagrams — the block diagram in
Section 2 and the sequence diagram in Section 3 — carry preceding narratives of
the required length that name what is depicted, the components involved, the
decision points, and the expected outcome. Four control flows outside the main
run path (queued starts, application start, cancellation, abandoned-run reclaim)
are each specified in numbered steps, and gap computation and credential loading
likewise.

#### Correctness (SR-2)

No findings. The eight run states are distinct and their tier assignments are
non-overlapping. The design's most consequential correctness argument — that
`429` is flow control and never an attempt, while timeouts and 5xx are failures
that consume one of three attempts — is stated with its rationale in constraint
5.13 and implemented consistently in `rate-limit-governor` and `massive-client`.

#### Consistency (SR-3)

No findings at this level; cross-artifact findings are consolidated below.

#### Traceability (SR-5)

No findings. All 23 ACs appear in the Section 7 traceability table, each naming
concrete design elements and the sections that carry them. Spot-checked against
the design body: AC-8's entry correctly names the two-instrument floor, AC-20's
correctly names the sweep's placement in the application container, and AC-23's
correctly names the FIFO claim.

### Component Design Specifications

#### Completeness (SR-1)

No findings. All twelve carry the same fourteen sections, so no component is
missing a security, testing, upgrade or traceability treatment. Every behaviour
in the system design has an owning component, and each of the fifteen diagrams
across the set carries a preceding narrative of the required length — checked
individually rather than sampled.

#### Consistency (SR-3)

No findings. Every API endpoint in the system design is assigned to
`ingestion-api`, which refines `DELETE /api/instruments` to
`DELETE /api/instruments/{symbol}` — a legitimate elaboration of the parent's
shape, not a contradiction. Data flows match the system design's sequence flow.

#### Feasibility (SR-7)

No findings. The dependency graph derived from all twelve declarations is
acyclic, terminating at two leaves (`runtime-config`, `market-data-store`). No
circular dependency exists. The single-owner deployment means single points of
failure are inherent and accepted rather than overlooked — constraint 5.16 states
this. The one genuine availability risk, a runner dying mid-run, is precisely
what the heartbeat-and-sweep mechanism addresses, and the design argues its
placement (application container, not ingestion) rather than asserting it.

### UX Brief

#### UX Completeness (SR-8)

No findings. Six regions are identified with information architecture,
interactions, constraints, accessibility requirements and a complete STD-UI
conformance record including the rule-by-rule table, the status tier table, and
state coverage for each of the six regions across all eight states STD-UI-23
requires.

### UX Design Specification

#### UX Completeness (SR-8)

Five screens plus the shell-level status region cover all six of the brief's
regions. Every UI element maps to one of the twelve component specs that exist,
and the single unmapped element — an indeterminate progress indicator — is
correctly recorded as a `COMPONENT-SPEC-GAP` in Section 3 with a suggested slug
and an intake reference, which is the prescribed handling rather than a defect.
The component map's null Figma key is explained (shadcn/ui publishes no official
kit) and the source mapping table is present with a verification method and date
per row. Token usage is specified per screen against `theme.css` custom
properties. The EDG checklist is present with all five checks passing and
reasons. Traceability exists but is incomplete — FINDING-1.

Every `badge` variant the design uses was checked against
`design-system/components/badge/design-spec.md` rather than assumed: the three
`coverage-*` presence variants (spec line 36) and all six `status-*` severity
tiers (line 35) are defined there, so no variant is invented at a call site and
no component-spec gap exists beyond the progress indicator already recorded.

Findings: **FINDING-1 (HIGH)**, **FINDING-3**, **FINDING-6**, **FINDING-6**.

### Cross-Specification Consistency (SR-3)

Entity names, API paths, run states, badge variants, status tiers and screen
names were compared across the capability, system design, UX design and all
twelve component designs.

**Consistent:** all nine API paths; the eight run states and their six severity
tiers, which agree between STD-UI-12, the capability, the system design, the UX
design's Section 5 table and `run-journal` §2.2; the two-instrument floor for gap
detection; the `confirm`-not-`destructive` dialog decision for retirement and
cancellation; credential-presence-as-boolean.

**Inconsistent:** the UX design's source-version citations only — FINDING-3.
No entity, path, code, role, flag or service name disagrees anywhere in the set.

---

## Findings Summary Table

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-5 | UX Design | `design/ux-design.md` §5 | The traceability table maps AC-1 through AC-21 and stops. AC-22 (deepening backfills history) and AC-23 (concurrent run requests queue) have no row, although both are specified in the prose: AC-22's *Short by `n` years* presentation in §1.1 and AC-23's queued-start behaviour and *A run is in progress* message in §1.1 | Test design derives UX coverage from this table. Two acceptance criteria with real, specified user-facing behaviour would be read as having no UX surface and could go untested at the interface level | Add rows for AC-22 (§1.1 Depth column, `badge` `status-warning`) and AC-23 (§1.1 Start action queued state, `button` `default`). The design work is already done; only the mapping is missing |
| FINDING-2 | MEDIUM | SR-10 | Repository | `docs/architecture.md` | `build-architecture.py -p factorflow-v2` exits 1: the checked-in inventory is out of date. The derivation itself succeeded — 1 design, 12 components, 13 interfaces, with no capability used as a provider or consumer and no interface naming an undeclared component | The architecture inventory is the cross-capability component registry. While stale it under-reports the project's components as zero, and the system design's own §9 cites it as "Empty: 0 designs, 0 components" | Run `python3 scripts/build-architecture.py -p factorflow-v2 --write` and commit. This is repository hygiene, not a design defect — no SR-10 finding against the design itself |
| FINDING-3 | MEDIUM | SR-3 | UX Design | `design/ux-design.md` frontmatter, §6 | Source versions are stale and internally contradictory. Frontmatter cites system design v2 (actual v3) and STD-UI v4; §6 Source Mapping cites capability v5, "all 21 acceptance criteria" (actual v6, 23 criteria) and system design v1. Three different system-design versions are implied across one artifact | A reader cannot tell which revision the design was verified against. Under AGT-PROV-001 the provenance block must record the source artifact versions actually used, and here they disagree with each other | Update the frontmatter and §6 to CAP-001 v6, system design v3, STD-UI v4, and correct "21 acceptance criteria" to 23. Pairs naturally with FINDING-1 |
| FINDING-4 | MEDIUM | SR-9 | Capability | `Capability-CAP-001.md` §5.1 | `check-capabilities.py` warning, verbatim: `CAP-001 -> Massive (market data provider) [requires-runtime]: no acceptance criterion cited. Either cite the contract, or record that the target has not defined one.` | The dependency graph cannot mechanically confirm the edge is satisfiable. In substance the row already explains why no criterion exists, but the checker cannot read prose and will warn on every future run | Add an explicit machine-readable marker that the target defines no acceptance criterion, in whatever form `check-capabilities.py` recognises for the "record that the target has not defined one" branch. The prose justification is already correct and should stay |
| FINDING-5 | MEDIUM | SR-1 | System Design | `design/system-design.md` §5.10 | Forward-only migration is specified with no rollback path, which OPS-MIG-003 permits only with the compensating risk mitigation described. The design states "there is no reversal path, so a migration that loses data is unrecoverable" but specifies no backup or restore procedure as compensation | Deploying a defective migration against accumulated point-in-time history has no recovery. Per C5 this history cannot be re-acquired as observed, so the loss would be permanent | Record the backup and restore procedure as the compensating mitigation OPS-MIG-003 requires. The `market-data-store` component design §2.5 already identifies the unspecified backup procedure as the higher-value gap when role-grant enforcement was rejected — this finding is that gap, raised at capability level |
| FINDING-6 | LOW | SR-8 | UX Design | `design/ux-design.md` §0, header | The header states the design system carries "12 component specifications" while §4's EDG table refers to "the eleven component specifications" and §3 says "all twelve specs resolve" | Cosmetic inconsistency from the `textarea` component being added mid-design. No downstream impact | Change "the eleven component specifications" to twelve in §4 |
| FINDING-7 | LOW | SR-9 | Capability | `Capability-CAP-001.md` §5.4 | STD-UI-10 is marked `no` — does not apply — but its "why not" cell says the rule "binds the shared theme, not this capability" and then cites the validation that satisfies it. A rule satisfied by inheritance is conceptually `yes | inherited`, not `no` | The conformance table is the machine-checked mirror of the brief's narrative record. A rule marked inapplicable that is in fact satisfied understates conformance and could mislead a later capability reusing the theme | Consider re-marking STD-UI-10 as `yes` with the inherited basis, or state explicitly that the theme discharges it on every capability's behalf. Judgement call, not an error |
| FINDING-8 | LOW | SR-1 | Capability, UX Design | frontmatter of both | `ai_provenance.tool_version` is `"unknown"` in the two artifacts produced with Codex, while the Claude Code artifacts carry `"2.1.92"` | AGT-PROV-001 requires tool name and version populated on creation. `"unknown"` is sanctioned for `invoking_user` but not named as acceptable for `tool_version` | Record the Codex version if it can be recovered; otherwise leave as-is and treat it as a known limitation of that tool's reporting |

---

## Traceability Matrix

Per-AC verdicts across the three traceability tables, as VER-EVD-004 requires.
`✓` means the AC is mapped in that artifact; `—` means the artifact does not
apply to that AC; `✗` means it should be mapped and is not.

| AC | Capability | System Design §7 | UX Design §5 | Verdict |
|----|-----------|------------------|--------------|---------|
| AC-1 Named instrument list | ✓ | ✓ | ✓ | PASS |
| AC-2 History depth stated | ✓ | ✓ | ✓ | PASS |
| AC-3 Data types acquired | ✓ | ✓ | ✓ | PASS |
| AC-4 Acquisition volume | ✓ | ✓ | ✓ | PASS |
| AC-5 Point-in-time record | ✓ | ✓ | ✓ | PASS |
| AC-6 Re-run safety | ✓ | ✓ | ✓ | PASS |
| AC-7 Coverage visibility | ✓ | ✓ | ✓ | PASS |
| AC-8 Gap visibility | ✓ | ✓ | ✓ | PASS |
| AC-9 Honest run outcome | ✓ | ✓ | ✓ | PASS |
| AC-10 Failure diagnosis | ✓ | ✓ | ✓ | PASS |
| AC-11 Unrecognised instrument | ✓ | ✓ | ✓ | PASS |
| AC-12 No false history | ✓ | ✓ | ✓ | PASS |
| AC-13 Credential handling | ✓ | ✓ | ✓ | PASS |
| AC-14 Network exposure | ✓ | ✓ | ✓ | PASS |
| AC-15 Forward data evolution | ✓ | ✓ | ✓ | PASS |
| AC-16 Refuse inconsistent start | ✓ | ✓ | ✓ | PASS |
| AC-17 Honest empty state | ✓ | ✓ | ✓ | PASS |
| AC-18 Operational visibility | ✓ | ✓ | ✓ | PASS |
| AC-19 Cancel a run | ✓ | ✓ | ✓ | PASS |
| AC-20 Interrupted run | ✓ | ✓ | ✓ | PASS |
| AC-21 Removal retains history | ✓ | ✓ | ✓ | PASS |
| AC-22 Deepening backfills | ✓ | ✓ | ✗ (specified in §1.1 prose, absent from table) | FINDING-1 |
| AC-23 Concurrent requests queue | ✓ | ✓ | ✗ (specified in §1.1 prose, absent from table) | FINDING-1 |

21 of 23 fully traced across all applicable artifacts; 2 traced in the capability
and system design but missing from the UX traceability table while present in its
prose.

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No CRITICAL findings exist, so nothing blocks downstream work. One HIGH finding
exists (FINDING-1), and it does not block: the UX behaviour for AC-22 and AC-23
is specified in the UX design's prose, so epic generation and test design have
the substance they need even before the traceability table is corrected. The
verdict is READY-WITH-WARNINGS rather than READY solely because that HIGH finding
should be closed before test design treats the UX traceability table as
authoritative for coverage.

What this specification set gets right is worth recording, because it is what
makes the verdict safe. The system design fully satisfies SR-10, the dimension
most often failed: twelve components with stable identifiers, thirteen interfaces
each naming both sides, and no capability identifier used as an actor anywhere in
Sections 1 through 5. All 23 acceptance criteria are testable, with the three
hardest to falsify — no false history, interrupted-run recovery, credential
non-disclosure — drawn so that each has a concrete falsification procedure. The
component dependency graph is acyclic. And the conformance table accounts for all
30 STD-UI rules with every "does not apply" justified by scope rather than
convenience, which is the cheapest place to escape a standard and the one that
deserved the most scepticism.

Two findings warrant attention beyond their severity. FINDING-5 is rated MEDIUM
against the rubric's severity criteria, but it is the finding with the largest
irreversible consequence: a defective migration against point-in-time history has
no recovery path, and C5 makes that loss permanent. It is MEDIUM because it does
not block downstream phases, not because the risk is small — this is exactly the
class of judgement AGT-SPEC-002 reserves for the owner rather than the agent.
FINDING-3 matters because provenance staleness is how a review comes to certify a
revision nobody actually read.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. **FINDING-1** — Add AC-22 and AC-23 rows to the UX design's §5 traceability
   table. The design work exists in §1.1; only the mapping is missing.

### Should Fix (MEDIUM findings)

2. **FINDING-3** — Correct the UX design's frontmatter and §6 source versions to
   CAP-001 v6 / 23 criteria, system design v3, STD-UI v4. Do this together with
   FINDING-1, since both stem from the same un-refreshed regeneration.
3. **FINDING-5** — Record the backup and restore procedure as OPS-MIG-003's
   compensating mitigation for forward-only migration. Owner decision, per
   AGT-SPEC-002.
4. **FINDING-2** — Run `build-architecture.py -p factorflow-v2 --write` and
   commit the refreshed inventory.
5. **FINDING-4** — Add the machine-readable "target defines no acceptance
   criterion" marker to the Massive dependency row.

### Nice to Have (LOW findings)

6. **FINDING-6** — "eleven component specifications" → twelve in §4.
7. **FINDING-7** — Reconsider STD-UI-10's `no` marking versus `yes | inherited`.
8. **FINDING-8** — Populate `tool_version` for the Codex-produced artifacts if
   recoverable.
