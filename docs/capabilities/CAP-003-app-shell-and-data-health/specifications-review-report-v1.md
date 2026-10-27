---
artifact_schema_version: 1
artifact_id: CAP-003-specification-review
artifact_type: specification-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-25
updated: 2026-10-25
document: spec-review-report
capability: CAP-003
version: v1
generated: 2026-10-25T02:38:43Z
constitutions_reviewed:
  - "CONST-AGT  docs/constitutions/agent-governance.constitution.md (2.3)"
  - "CONST-MDL  docs/constitutions/model-management.constitution.md (1.3)"
  - "CONST-OPS  docs/constitutions/operational-safety.constitution.md (1.3)"
  - "CONST-REV  docs/constitutions/review.constitution.md (1.4)"
  - "CONST-SA   docs/constitutions/static-analysis.constitution.md (2.0)"
  - "CONST-SEC  docs/constitutions/security.constitution.md (1.3)"
  - "CONST-VER  docs/constitutions/verification.constitution.md (1.2)"
mechanical_checks:
  - script: check-capabilities.py
    outcome: run
    result: "PASSED, exit 0: 3 capabilities, 11 edges (requires-runtime 4, conforms-to 7, blocked-by 0, requires-contract 0), 1 standard (STD-UI), 2 conformance claims, 1 constitution artifact, 4 references; integration layers CAP-001, CAP-002, CAP-003; no error, no warning"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0: 3 designs, 27 components, 84 interfaces; no drift against docs/architecture.md; its one interface finding (GET /api/classifications/summary consumer 'shell-home-and-data-health-ui (unpublished)') is declared by CAP-002, not CAP-003; the inventory, derived from Section 4, lacks the home-ui consumer of GET /api/data-health that DEC-0219 added (FINDING-3)"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 247 warnings, exit 0 (--strict, whole project); none on CAP-003; scoped with -a to the CAP-003 directory: 14 artifacts, PASSED, no warning"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0: 1234 path references across 442 Markdown files; its scope excludes repos/, so the paths cited in the 14 CAP-003 artifacts were resolved by hand: every path described as delivered exists, the rest are files the designs introduce, routes, or harness paths that resolve from the harness root"
  - script: check-constitutions.py
    outcome: run
    result: "PASSED, exit 0: 10 constitutions, 38 skills"
dimension_status:
  SR-1: applied
  SR-2: applied
  SR-3: applied
  SR-4: applied
  SR-5: applied
  SR-6: applied
  SR-7: applied
  SR-8: "applied — design_system_available true; 15 component specs and every variant named, and 58 token names, verified against design-system/; S01-3 to S01-7, S02-1 to S02-6 and S09-1 to S09-5 assessed"
  SR-9: "applied — dependency half and STD-UI conformance half by check-capabilities.py; capability section 5.4 against UX brief section 12.1 (STD-UI v6) rule by rule; tech-stack v5 approvals; CONST-SEC 1.3 SEC-ENC-001 bookkeeping"
  SR-10: applied
specifications_reviewed:
  capability_spec: docs/capabilities/CAP-003-app-shell-and-data-health/Capability-CAP-003.md
  system_design: docs/capabilities/CAP-003-app-shell-and-data-health/design/system-design.md
  ux_brief: docs/capabilities/CAP-003-app-shell-and-data-health/design/ux-brief.md
  ux_design_spec: docs/capabilities/CAP-003-app-shell-and-data-health/design/ux-design.md
  component_designs:
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-command-palette.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-data-health-api.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-data-health-reader.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-data-health-ui.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-home-ui.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-ingestion-api.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-owner-shell.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-owner-web-app.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-setup-ui.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-ui-components.md
review_subjects:
  - artifact_id: CAP-003
    artifact_version: 1
    content_revision: sha256:30fde4b76ca4814d6a076fb4a1726e5fac0badaa208211f14634ea59121d1d52
  - artifact_id: CAP-003-system-design
    artifact_version: 1
    content_revision: sha256:0dc47d5706f7002f6d3d559bb7dbb939d208f4b582f2139d1fb37963c736c41d
  - artifact_id: CAP-003-ux-brief
    artifact_version: 1
    content_revision: sha256:6b2244fa47a13bf4fdbed6e43fb59491ce6bb2c635e7fc9789d69ffdc39bb33a
  - artifact_id: CAP-003-ux-design
    artifact_version: 1
    content_revision: sha256:396add68aa214489036c5f6185d1a07f20f243b49504654a4dd2be8c791aefaa
  - artifact_id: CAP-003-component-design-command-palette
    artifact_version: 1
    content_revision: sha256:bd0bed92e8c1d97b2cf0b3b542ba9cf8dbd910054618d691c191a3dc3f598cac
  - artifact_id: CAP-003-component-design-data-health-api
    artifact_version: 1
    content_revision: sha256:8ce3e2763053f9890489084f2e5f056a29b6e5d97ca507c15de7eea8a7c2e816
  - artifact_id: CAP-003-component-design-data-health-reader
    artifact_version: 1
    content_revision: sha256:9af010a9c9b26c312aceacf11dfb8b116a457f591a0d05c469c1798e483f4273
  - artifact_id: CAP-003-component-design-data-health-ui
    artifact_version: 1
    content_revision: sha256:bbe913b197ca8512224da70ebe76040c5121746476c1ffdd2614ad52ea7f75d7
  - artifact_id: CAP-003-component-design-home-ui
    artifact_version: 1
    content_revision: sha256:58c8575e2a294a969159abf51ec3aa1360a33834965adb83e3430c5b1f36d575
  - artifact_id: CAP-003-component-design-ingestion-api
    artifact_version: 1
    content_revision: sha256:2c345c9b3e366ef0e708eac81b0f33d5b48a56ddece9e2457636dea02a52b85f
  - artifact_id: CAP-003-component-design-owner-shell
    artifact_version: 1
    content_revision: sha256:e89610314cf5d386cbab1eb6202f76909303fb47b4e2a5d0ef754754408e33a6
  - artifact_id: CAP-003-component-design-owner-web-app
    artifact_version: 1
    content_revision: sha256:4a300046a106955d4371f434dcdabbe25abe040b4753c2c07e5215ee33e5ad6a
  - artifact_id: CAP-003-component-design-setup-ui
    artifact_version: 1
    content_revision: sha256:6a8a9c8998f56f252baeb0228d259e56d4c05eb2e11a6880146ca114f4d53044
  - artifact_id: CAP-003-component-design-ui-components
    artifact_version: 1
    content_revision: sha256:217f59557b6504682dfe5528da821a25c0aab7d984fd267575bbd7f0319aafb5
statistics:
  total_findings: 23
  critical: 0
  high: 2
  medium: 13
  low: 8
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-25T02:38:43Z
  source_artifacts:
    - id: CAP-003
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-brief
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-component-design-command-palette
      version: "1"
    - id: CAP-003-component-design-data-health-api
      version: "1"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-component-design-data-health-ui
      version: "1"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-component-design-ingestion-api
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-owner-web-app
      version: "1"
    - id: CAP-003-component-design-setup-ui
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: PRODUCT-UX
      version: "6 (approved 2026-10-16; governs, not a subject)"
    - id: PRODUCT-UX-S01
      version: "4 (approved; acceptance checks S01-1 to S01-7; governs, not a subject)"
    - id: PRODUCT-UX-S02
      version: "4 (approved; acceptance checks S02-1 to S02-6; governs, not a subject)"
    - id: PRODUCT-UX-S09
      version: "4 (approved; acceptance checks S09-1 to S09-5; governs, not a subject)"
    - id: STD-UI
      version: "6 (approved; governs, not a subject)"
    - id: tech-stack
      version: "5 (approved; governs, not a subject)"
    - id: CAP-001-system-design
      version: "8 (approved; context)"
    - id: CAP-002-system-design
      version: "3 (approved; context)"
    - id: CAP-002-component-design-classification-ui
      version: "3 (approved; context)"
    - id: CAP-002-component-design-classification-api
      version: "3 (approved; context)"
    - id: DEC-0200 to DEC-0220
      version: "open, decided_by agent, owner_reviewed false (run design-run-f106a0; verified here, not upheld)"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Specification Review Report -- CAP-003

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-003 App Shell & Data Health |
| **Version** | v1 |
| **Specifications Reviewed** | Capability v1; system design v1 (`ui_facing: true`); UX brief v1; UX design v1; ten component designs v1 (all draft) |
| **Total Findings** | 23 (CRITICAL 0, HIGH 2, MEDIUM 13, LOW 8) |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

The specification set is complete, internally traceable and unusually careful:
every acceptance criterion maps to a system design element, a UX design
element and at least one component design; every diagram box and interface
names a declared component; every component variant and theme token the
designs name exists; the five mechanical checks pass. Nothing blocks epic
generation.

Two HIGH findings stand. **FINDING-1:** ten non-Radix npm packages that the vendored
`command`, `toast`, `data-table` and `form` components need are not in the
approved tech stack, and four of them (DEC-0215) are not even listed in the
system design or the capability's OQ-4, so the capability's own
tech-stack "satisfied when" cannot be confirmed and the stories that vendor
those components cannot start. **FINDING-2:** the Daily prices check judges
currency against the newest session any followed stock holds, because no
trading calendar exists, yet labels a clean result *All current* and states
only its gap limitation; S09 section 7's Stale state can therefore never
render, and the STD-UI-18 claim in capability section 5.4 is supported for
gaps only.

The MEDIUM findings cluster in three places: the system design was not
brought forward when decomposition changed its interfaces (FINDING-3, -4);
the Data health verdict and tile have boundary cases the decisions left
undefined (FINDING-7 to -10); and two seams with CAP-002's approved
classification UI are unowned (FINDING-13, -14).

## Review Scope

All four specification types exist and were read in full:
`Capability-CAP-003.md`, `design/system-design.md`, `design/ux-brief.md`,
`design/ux-design.md` and the ten `design/component-design-*.md` files
(command-palette, data-health-api, data-health-reader, data-health-ui,
home-ui, ingestion-api, owner-shell, owner-web-app, setup-ui, ui-components).
`epics/` and `stories/` do not exist and were not in scope.

Read to verify claims (governing, not subjects): `docs/ux/product-ux-blueprint.md`
(PRODUCT-UX v6), `docs/ux/screens/S01-home.md`, `S02-setup.md`,
`S09-data-health.md` (v4), `docs/constitution/standards/ui-conventions.md`
(STD-UI v6), `docs/constitution/tech-stack.md` (v5), the design system
(`design-system/` component specs, `theme.css`, `component-map.json`,
`intake.md`), CAP-001's coverage-service and ingestion-api designs, migration
`0003_coverage.sql`, `src/factorflow/api/models.py` and `routes/runs.py`,
CAP-002's system design and its classification-api and classification-ui
component designs, `docs/architecture.md`, and decision records DEC-0050,
DEC-0058 and DEC-0200 to DEC-0220 in the harness repository.

This was an unattended review delegated by `$design-run`. The project repo was
read through the run's own worktree at `usr/alvaro-de-jodra/CAP-003-design`
(HEAD 7af60e3, clean). Only this report was written. No artifact, approval
block, branch or decision record was changed, and the skill's closing
discussion prompt was skipped; questions for the owner are listed under
*Open Questions for the Owner*.

## Dimension Status

Every dimension carries a status. None may be omitted, and `applied` may not be
claimed for a dimension whose mechanical evidence did not run.

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | Capability sections 1 to 8; system design sections 1 to 10 with a 3 to 5 sentence narrative before every diagram; UX brief 1 to 12; UX design 0 to 7; all fourteen template sections in each component design, each diagram preceded by its narrative |
| SR-2 Correctness | applied | ACs checked against each other and the flows; verdict, tile and check derivations walked at their boundaries (FINDING-2, -5, -6, -8, -9, -10, -15) |
| SR-3 Consistency | applied | AC-to-design mapping; system design against all ten component designs; UX brief against UX design; CAP-003 against CAP-002's approved designs (FINDING-3, -7, -13, -14, -20) |
| SR-4 Testability | applied | All 27 ACs for observable outcome, input, boundary and measurability (FINDING-5, -8, -11) |
| SR-5 Traceability | applied | Capability, system design, UX design and component traceability tables; decision-record citations resolved (FINDING-13, -18) |
| SR-6 Clarity | applied | Placeholder and vague-language scan (none found); cross-reference and step-number checks (FINDING-16, -19) |
| SR-7 Feasibility | applied | No circular dependency; read-only components; volume at 3000 stocks; landing-screen read path (FINDING-4, -14) |
| SR-8 UX Completeness | applied | `design_system_available` true: 15 component specs and every variant used verified; 58 token names verified in `theme.css`; source mapping and design source present; EDG checklist present; screen acceptance checks assessed (FINDING-11, -12) |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` (no error, no warning); dependency typing and citations; STD-UI section 5.4 against UX brief 12.1, rule by rule; tech-stack v5; CONST-SEC SEC-ENC-001 bookkeeping (FINDING-1, -2, -6, -17, -21) |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passed; Section 4.1 declares eight components with stable identifiers, used on every diagram box; every Section 4.2 row names a provider and a consumer component; no capability identifier is used as an actor in Sections 1 to 5 |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, PASSED, exit 0 | none; CAP-003 integrates at layer 2 after CAP-001 and CAP-002 |
| `build-architecture.py -p factorflow-v2` | run, PASSED, exit 0, no drift | none against CAP-003 from the script; its interface finding belongs to CAP-002 and is CAP-003 system design open question 5. FINDING-3 records an interface the inventory cannot see because Section 4.2 omits it |
| `check-artifacts.py -p factorflow-v2 --strict` | run, PASSED (247 project warnings, none on CAP-003); scoped run on the CAP-003 directory PASSED with none | none |
| `check-references.py` | run, PASSED, exit 0 | none from the script; its scope excludes `repos/`, so CAP-003 path references were checked by hand (FINDING-18 is the only dangling reference found) |
| `check-constitutions.py` | run, PASSED, exit 0 | none |

## Constitutions Applied

The relevance matrix assigns `specification-review` seven constitutions; all
seven were read.

| Constitution | What it produced |
|--------------|------------------|
| CONST-AGT 2.3 | AGT-PROV-001: all fourteen subjects carry a complete provenance block with one correlation id, but seven component designs are stamped after the commit that introduced them (FINDING-23). AGT-SCOPE-002: CAP-001 designs are not edited; taking over its delivered files is recorded as CAP-003's own work pending the owner's confirmation (system design OQ-8). AGT-SCOPE-003: AC-18's removal clause is not testable at delivery (FINDING-5). AGT-SCOPE-005: the server-side aggregate, the static destination list and the item catalogue each state the later capabilities they were weighed against (DEC-0200, DEC-0203, DEC-0204). AGT-EVIDENCE-002: two unsourced quantitative values (FINDING-22). AGT-AUTH-002: every agent decision is recorded and open for the owner; none is resolved silently in the designs |
| CONST-MDL 1.3 | No model-governance obligation falls on a specification review beyond recording the exact model identifier, done in this report's provenance |
| CONST-OPS 1.3 | OPS-MIG-001 and OPS-MIG-003: no schema change; rollback is an image redeploy, stated in system design 4.4 and every component's Upgrade section. OPS-ERR-001: every failed read has a defined rendering. OPS-DEST-003: no destructive mechanism; `dialog` `confirm`, never `destructive`, for stopping following |
| CONST-REV 1.4 | REV-STG-001: the two stages are recorded below. REV-AGT-001: the full bar was applied to agent-authored designs. REV-RCV-002: two positions the designs record as settled are challenged with evidence (FINDING-2 against DEC-0201's currency rule; FINDING-8 against DEC-0210's warning rule) |
| CONST-SA 2.0 | SA-MD-002: dangling decision numbers (FINDING-18); SA-MD-003 and SA-DEAD-002: no TBD, TODO or vague placeholder; three `[REQUIRES INPUT]` markers, each in an open question. SA-NAME-001 and SA-MD-001: templates and naming conform (`check-artifacts.py`) |
| CONST-SEC 1.3 | SEC-ENC-001 host-local loopback exception: cited by its exact phrase in the system design, the UX brief and two component designs, with DEC-0208 recorded, but DEC-0208's `artifacts` name only the system design and the reader's database channel is not cited by phrase; SEC-DAT-001 classification is stated only in one component design; one SEC-AUTH-001 basis is misattributed (FINDING-21). SEC-INP-001 and SEC-INP-002: cursor and limit validated and bound. SEC-DEP-003: licences deferred to when each package is added, with no package added before confirmation (FINDING-1). SEC-ERR-001: no `request_id` or code reaches the owner |
| CONST-VER 1.2 | VER-EVD-001 and VER-EVD-002: every claim here rests on this session's reads and script runs. VER-EVD-004: the Traceability Matrix gives a verdict for each of the 27 ACs and each screen acceptance check. VER-DEL-001: the designs' own claims (no COMPONENT-SPEC-GAP, every token exists, delivered fields exist) were re-verified against `design-system/`, `theme.css`, `models.py`, `routes/runs.py` and migration 0003 rather than accepted |

### Stage 1 -- Specification Compliance

Fidelity of the designs to the capability, the approved blueprint and screen
specifications, STD-UI v6, the tech stack and the harness constitutions:
FINDING-1, -2, -5, -6, -7, -8, -9, -10, -11, -12, -13, -15, -16, -17, -21.
The designs honour the capability's scope boundary throughout: no provider
read, no write, no table, nothing unshipped rendered, CAP-001's endpoints
consumed unchanged and verified against the delivered models and routes
(`GET /api/acquisition-runs` accepts `state`, `GET /api/instruments` returns
`active_count`, `retired_count` and `next_cursor`, `acquisition_state.last_outcome`
holds only `written`, `not_found` and `failed`).

### Stage 2 -- Artifact Quality

Internal consistency, maintainability and accuracy of the artifacts
themselves: FINDING-3, -4, -14, -18, -19, -20, -22, -23.

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; no finding.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` reports no error and no warning for CAP-003. Both
`requires-runtime` rows are typed correctly: the CAP-001 row needs the running
product for AC-7, AC-11 to AC-17 and AC-21; the CAP-002 row needs the running
summary read and routes for AC-8, AC-11 and AC-27 and states the honest
rendering until then. Citations resolve and say what the rows claim (verified
against CAP-002's classification-api component design: `set.ended_at`,
`set.run_started_at`, `set.not_current`, `later`, `stocks_current`). Section
5.2 carries the deliberate disclaimers; section 5.3 carries the constraints.
No `blocked-by` row.

STD-UI conformance: section 5.4 accounts for all 30 rules and agrees with UX
brief section 12.1 on every row. Every `no` follows from M1 scope (no chart, no
order path, no environment, no promotion). STD-UI-17 `partial` is detailed in
the brief. Specialization legality holds: STD-UI-1, -12, -25, -29 and -30
specializations are within `permitted`; no stricter-only rule is relaxed.
Claim support fails in part for STD-UI-18 (FINDING-2) and is in tension for
STD-UI-29 (FINDING-6).

- **FINDING-1** (HIGH) — tech-stack conformance cannot be confirmed; see the
  summary table.
- **FINDING-17** (LOW) — section 5.1 pins `tech-stack.md` at v2.

#### Completeness (SR-1)

All sections present. Non-functional coverage: security (5.3 loopback),
volume (STD-UI-30, 3000 stocks), accessibility (AC-25). No performance target
exists for the Data health aggregate (FINDING-4, raised against the design
because DEC-0219 moved it onto the landing screen).

#### Correctness (SR-2)

- **FINDING-5** (MEDIUM) — AC-18 requires the redirects to be removed, which
  section 2 places out of scope.
- **FINDING-6** (MEDIUM) — AC-26 forbids every size literal outside the theme,
  while the approved blueprint and screen specifications fix layout sizes the
  theme does not define.

#### Testability (SR-4)

All 27 ACs have observable outcomes. AC-18's second clause (FINDING-5) and
AC-25 as the design applies it (FINDING-11) are the exceptions.

#### Clarity (SR-6)

- **FINDING-16** (LOW) — AC-12's "No screen MUST present" inverts RFC 2119.

### System Design Specification

Section 4.1 declares eight components with stable identifiers and one-line
responsibilities; every box in Sections 2 and 3 carries one; Section 4.2 names
a provider and consumer component for every cross-boundary interaction,
reusing seven published identifiers. Every AC traces (Section 7). Approved
technologies only, apart from FINDING-1. C8 and C11 are honoured.

- **FINDING-3** (MEDIUM, CROSS-SPEC-INCONSISTENCY) — Sections 3.3, 4.1, 4.2
  and 4.3 were not brought forward for DEC-0212, DEC-0215, DEC-0219 and
  DEC-0220.
- **FINDING-4** (MEDIUM) — the most expensive read now sits on the landing
  screen with no latency bound.
- **FINDING-18** (LOW) — Section 9 cites decisions by stale numbers.
- **FINDING-19** (LOW) — notes in 3.1, 3.2 and 3.4 cite the wrong sequence
  steps.

### Component Design Specifications

Every behaviour has an owning component; every interface used is defined on
both sides; every delivered file edited has one owner (DEC-0211); test
strategy is present in each. No circular dependency: `ui-components` imports
only the theme, the screens import it and `owner-shell`, and nothing imports a
screen. Read-only by construction for both Python components.

- **FINDING-7** (MEDIUM) — the tile's and the Factor scores card's *current of
  followed* mixes two populations.
- **FINDING-8** (MEDIUM) — `worstDataTier` answers *Mostly yes* when every
  followed stock needs attention.
- **FINDING-9** (MEDIUM) — a failed latest download never reaches the
  verdict.
- **FINDING-10** (MEDIUM) — `never_acquired` hides every *Needs fixing* row
  that the rail and Home count.
- **FINDING-11** (MEDIUM) — three polled regions show no last-updated time.
- **FINDING-13** (MEDIUM) — the `SHELL_ROUTES` migration CAP-002 assigns to
  this capability has no owner here.
- **FINDING-14** (MEDIUM) — `web/src/components/patterns/as-of-line.tsx` is
  specified by two capabilities.
- **FINDING-15** (LOW) — one Factor scores branch cannot be reached.
- **FINDING-20** (LOW) — small internal inconsistencies.
- **FINDING-21** (MEDIUM) — security bookkeeping gaps.
- **FINDING-22** (LOW) — two unsourced quantitative values.
- **FINDING-23** (LOW) — provenance timestamps after the commit.

### UX Brief

All screens the capability names are listed (eight screens, two shell
surfaces); information architecture covers every AC data element; the
interactions table covers all five flows and their alternates; every
suggested component exists in `design-system/components/`; accessibility is
specified. The STD-UI record (section 12) is complete and agrees with the
capability. Findings that touch the brief: FINDING-2 (12.2 *All current*,
12.4 Stale cell), FINDING-18 (section 10 decision numbers, provenance commit
09410b0), FINDING-20 (label drift).

### UX Design Specification

Every brief screen has a section; every UI element maps to an existing spec or
a named composition (no COMPONENT-SPEC-GAP, verified); source mapping and the
design source are present; every token named exists in `theme.css`; all 27
ACs trace (section 5); the EDG checklist is present with STD-UI's declared
departures.

- **FINDING-12** (MEDIUM) — section 0.8 omits three departures from the
  approved screen specifications.
- Also touched by FINDING-2, -7, -8, -9, -11, -15, -20.

### Cross-Specification Consistency (SR-3)

Entity names, routes, error codes and the eight download states agree across
all fourteen artifacts and with CAP-001's delivered code. Mismatches:
FINDING-3, -7, -13, -14, -20 (each a `CROSS-SPEC-INCONSISTENCY`).

### Screen Specification Acceptance Checks

| Check | Verdict | Evidence |
|-------|---------|----------|
| S01-1, S01-2, S01-5 | not applicable | Live and paper tiles are M2 and M6 (S01 section 2) |
| S01-3 | met | `sortAttention` and one action per item (ui-components 2.6; home-ui 2.5) |
| S01-4 | met | Items exist only while their cause holds (data-health-reader 2.7; ui-components 2.6) |
| S01-6 | met | Scores and prices as-of on the tile (home-ui 2.4) |
| S01-7 | met | No strategy, paper or live region or placeholder (home-ui 3; UX design 1.3) |
| S02-1 to S02-6 | met | setup-ui 2.2, 2.3, 10; owner-shell 2.6 redirect |
| S09-1 | met | One tier function; *Partial* warning, *Interrupted* serious (ui-components 2.3) |
| S09-2 | met, with FINDING-10 | Problem rows name operation, stock, reason and fix; hidden in one edge case |
| S09-3 | met | Not found rows never offer a download (data-health-reader 2.4; data-health-ui 2.5) |
| S09-4 | met | `credential_present` boolean only; no-secrets test extended (ingestion-api 2.3) |
| S09-5 | met | `never_acquired` empty state (data-health-ui 10) |

---

## Findings Summary Table

CRITICAL 0 · HIGH 2 · MEDIUM 13 · LOW 8 · **total 23**

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-9 | Capability; system design; ui-components | `Capability-CAP-003.md:329` (tech-stack row, "confirms the system design uses only approved technologies"); `system-design.md:564`; `component-design-ui-components.md:78-84`, `:129-134`; DEC-0205; DEC-0215 | `tech-stack.md` v5 (line 97) approves "`shadcn/ui` on Radix primitives" and no other UI package. The designs need ten non-Radix packages: `cmdk`, `sonner`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react` (DEC-0205) and `@tanstack/react-table`, `react-hook-form`, `zod`, `@hookform/resolvers` (DEC-0215, which also adds the Radix `@radix-ui/react-label`). All are PROVISIONAL and gated: no story adds one before the owner's `$tech-stack` confirmation. The four DEC-0215 packages appear in neither system design 4.3 nor capability OQ-4, so the owner's question as written undercounts what is asked | The capability's own "satisfied when" for the tech-stack edge is unmet. Until confirmation, the stories that vendor `command` (AC-22), `toast`, `data-table` (the five taken-over screens) and `form` (setup, Settings, Followed stocks) cannot be implemented as designed (AC-26) | Owner runs `$tech-stack` to amend `tech-stack.md`, confirming or replacing all ten packages and recording each licence (SEC-DEP-003); amend capability OQ-4 and system design 4.3 to list all ten |
| FINDING-2 | HIGH | SR-9, SR-2 | UX brief; UX design; data-health-reader; data-health-ui; capability 5.4 | `ux-design.md:743`, `:866`; `ux-brief.md:231`, `:760-761`, `:809`; `component-design-data-health-ui.md:179`, `:282-286`; `component-design-data-health-reader.md:339-341`; `Capability-CAP-003.md:384`; DEC-0201 | Daily prices judges *behind* against `latest_session`, the newest session any followed stock holds (DEC-0201), because no trading calendar exists (DEC-0206). A clean result is labelled *All current* with *All {m} stocks have prices to {date}*, and the only scope note covers gaps. S09 section 7 defines Stale as an as-of before the latest trading day; the substitute rule makes it unreachable, which data-health-ui 3 admits while the UX brief and UX design still describe it as rendered. STD-UI-18 (stricter-only) forbids presenting the absence of a detected problem as evidence of correctness and requires stating what a check does not cover; STD-UI-16 forbids an undisclosed substitute for an unknown | If no download runs for days, or the latest one fails before writing, Data health reads *Yes* with *All current*: the screen's one question is answered beyond what is derived (STD-UI-15). Test design would also derive a Stale test that can never pass | Either render the currency part as not determinable with its reason (no trading calendar), or replace *All current* with wording that asserts no currency and add a scope sentence stating that currency is judged against the newest session any followed stock holds. Record the S09 section 7 departure (FINDING-12) and correct capability 5.4's STD-UI-18 cell |
| FINDING-3 | MEDIUM | SR-3 | System design | `system-design.md:313-345` (3.3 flow), `:498` (4.1 ui-components list), `:513-515` (HealthProvider "unchanged except"), `:524` (4.2 `GET /api/data-health`, consumer `data-health-ui` only), `:564` (4.3); DEC-0212, DEC-0215, DEC-0219 (`kind: contradiction`), DEC-0220 | Decomposition changed four things the system design still states otherwise: `home-ui` reads `GET /api/data-health` (DEC-0219); `form` is vendored and five packages added (DEC-0215); the response gains `exception_count` per check and checks are null when never acquired (DEC-0220, DEC-0213); `HealthProvider` pauses while hidden (DEC-0212). CROSS-SPEC-INCONSISTENCY | The architecture inventory is derived from Section 4, so it lacks the `home-ui` consumer; epic generation and test design reading the system design see a different interface set and package list from the component designs | Revise the system design (v2) to add the `GET /api/data-health` → `home-ui` row, `form` and the five packages, the two response fields, the health pause, and Home's read in 3.3 and constraint 7 |
| FINDING-4 | MEDIUM | SR-7, SR-1 | System design; home-ui; data-health-api | `system-design.md:744-747` (OQ-7); `component-design-home-ui.md:365-367` (OQ-3); `component-design-data-health-api.md:252-254`; `component-design-data-health-reader.md:446-449`, `:483` | `GET /api/data-health` runs six `read_coverage` pages at 3000 stocks and has no latency target; DEC-0219 now reads it on every mount of Home, which `/` opens on every product start. The volume test records the duration but asserts nothing | The landing screen's tile badge waits on the product's most expensive read with no bound; a slow derivation degrades the first screen the owner sees, and nothing would fail a test | Owner sets a latency criterion for the aggregate (capability AC or NFR) before test design, or chooses a cheaper source for the tile's badge |
| FINDING-5 | MEDIUM | SR-2, SR-4 | Capability | `Capability-CAP-003.md:285-287` (AC-18 "and MUST then be removed"); `:130-131` (out of scope: removing the redirects) | AC-18 requires the redirects to be removed one release after this capability ships, while section 2 puts their removal out of scope; the clause cannot be exercised at this capability's delivery (AGT-SCOPE-003) | A criterion no test at delivery can pass; story generation would either drop it silently or create work the scope excludes | Drop "and MUST then be removed" from AC-18, keeping the removal as the out-of-scope item and the system design's one-file deletion note |
| FINDING-6 | MEDIUM | SR-2, SR-9 | Capability; UX design; ui-components | `Capability-CAP-003.md:311-314` (AC-26); `ux-design.md:295-297`; `component-design-ui-components.md:337-342`; STD-UI-29 verification | AC-26 and STD-UI-29 forbid any spacing, size or colour literal outside the theme and permit no new value. The approved blueprint and screen specs fix 208 px, 1180 px, 260 to 300 px, 28 px, 16 px and 70ch, none a token (`theme.css` has `--measure-prose: 75ch`). The designs declare these "bind the layout, not the theme", an exemption neither rule grants | Implementation must either violate AC-26 as written or invent tokens STD-UI-10 and blueprint section 13 say are not added; the conformance claim for STD-UI-29 is not checkable | Owner decides: add layout tokens through `design-system/intake.md` (theme change, validated), or narrow AC-26 to the rule's density, type and spacing scope with the layout sizes named as approved-spec values; record it in 5.4 |
| FINDING-7 | MEDIUM | SR-3, SR-2 | UX design; home-ui; data-health-ui; system design; UX brief | `ux-design.md:595-597`; `component-design-home-ui.md:146`; `component-design-data-health-ui.md:181`; `system-design.md:331`, `:347-349`; `ux-brief.md:188` | Home's *{current} of {followed}* takes `current` from the score set (`stocks_current.current_count`, counted over the set's `active_instruments`) and `followed` from attention (followed now). The system design and brief take both from the summary, with attention only as the fallback. Data health's *k* is "`followed_count` minus `current_count`" without saying which `followed_count`. CROSS-SPEC-INCONSISTENCY | After the owner stops following stocks the set counted as current, the tile can read more current than followed (*1,236 of 1,226*) and *k* can go negative | Use one population: both figures from `stocks_current` when served, attention's count only while not served, as the system design says; state *k*'s source |
| FINDING-8 | MEDIUM | SR-2, SR-4 | ui-components; UX design; data-health-ui | `component-design-ui-components.md:221`; `ux-design.md:723-724`; DEC-0210 | `affectedCount` maps to warning whenever it is above zero, and warning answers *Mostly yes*. The boundary where every followed stock needs attention is undefined | A provider outage or a rejected key produces *Mostly yes. 120 of 120 followed stocks need attention*, a verdict its own count contradicts | Define the proportion boundary (for example *No* when every followed stock is affected, or a threshold) and add the boundary case to `worst-data-tier.test.ts` |
| FINDING-9 | MEDIUM | SR-2, SR-3 | UX design; data-health-ui; ui-components | `ux-design.md:725`; `component-design-data-health-ui.md:287-290`, `:470-476`; DEC-0210 | UX design 1.4's critical clause *, and the last download failed.* has no input: `worstDataTier` takes the two checks, the scores tier and the problem count, not the latest download. Home rates a failed latest download critical (*The last download failed*) | A failed download that recorded no per-stock failure leaves Data health at *Yes* while Home shows a critical item for the same cause; one screen's question contradicts the other's | Owner chooses (data-health-ui OQ-1): add `latest_terminal_download` failed as a critical input to `worstDataTier`, or remove the clause from UX design 1.4 |
| FINDING-10 | MEDIUM | SR-2 | data-health-reader; UX design; data-health-ui | `component-design-data-health-reader.md:330-333`, `:205-213`; `ux-design.md:863`; `component-design-data-health-ui.md:125-126` | `never_acquired` comes from coverage (no observation row anywhere), while the problem set comes from `acquisition_state`. When a download has run but stored nothing (every request failed), Data health renders only *No data has been downloaded yet.* in place of everything, while the rail chip and Home's *{A}, {B}, {C} and {k} more stocks are missing data* count those failures and send the owner to `/data` | **Fix data** lands on a screen that hides every row and reason it promised (AC-13, AC-16; S09-2); the copy also says no download ran when one did | Render *Needs fixing* (and Recent downloads) whenever `affected_count` is above zero, or base the empty state on "no download ever ended" as Home does |
| FINDING-11 | MEDIUM | SR-4, SR-8 | UX design; setup-ui; data-health-ui; owner-shell | `ux-design.md:208` (Recent downloads shows *checked {time}* only "otherwise"), `:454` (setup step 4); `component-design-setup-ui.md:326`; `component-design-data-health-ui.md:222-235`; `component-design-owner-shell.md:358-365` | AC-25 and STD-UI-25 require every region updated by polling to show its last-updated time. Setup step 4's progress (10 s) and Recent downloads while a download runs (10 s) show none, and Recent downloads shows one only when it is not polling. The rail chips are polled and show none, with no recorded reason | AC-25 fails for three regions; test design has no time to assert | Add *checked {time}* to setup step 4 and to Recent downloads while running; for the chips, either show the time or record why the Home and Data health *checked* lines stand for them |
| FINDING-12 | MEDIUM | SR-8, SR-9 | UX design | `ux-design.md:300-319` (0.8); `:747-749`; `:576-586`; capability `Capability-CAP-003.md:327` ("lists every departure") | Section 0.8 lists four departures but omits three: S09 section 3's *Needs fixing* header "with the download it came from", replaced by *From your most recent downloads* (DEC-0201); S01 sections 3, 5 and 8's market state from a trading calendar (*Market closed at 15:00 CDT*), replaced by DEC-0206's *Market closed* or not determinable; S09 section 7's Stale state, unreachable (FINDING-2) | Blueprint section 0 and the capability's blueprint edge require every departure listed; the owner reviewing 0.8 would not see these three | Add the three rows to 0.8 with their decisions |
| FINDING-13 | MEDIUM | SR-3, SR-5 | System design; owner-shell; owner-web-app | `system-design.md:739-743` (OQ-6, "Owner: that design's owner"); `component-design-owner-shell.md:614-620`; `component-design-owner-web-app.md:96-114`; CAP-002 `component-design-classification-ui.md` (approved v3) lines 300-310, 914-915; DEC-0211 | CAP-002's approved design assigns the shell capability one edit: migrating three link targets in `SHELL_ROUTES` (`web/src/screens/research/copy.ts`) from `/runs/:runId`, `/runs`, `/instruments` to the new paths. CAP-003's system design assigns it back to CAP-002's owner and names only one target; DEC-0211 gives every file under `web/src/screens/` to `owner-web-app`, whose file list omits it. CROSS-SPEC-INCONSISTENCY | The edit has no owner; when the redirects are removed, three Research links break | Assign the `SHELL_ROUTES` edit to one CAP-003 component (owner-web-app under DEC-0211) and correct OQ-6 to CAP-002's approved allocation and all three targets |
| FINDING-14 | MEDIUM | SR-7, SR-3 | ui-components | `component-design-ui-components.md:113`, `:518-524` (OQ-2); CAP-002 `component-design-classification-ui.md:195` | Both capabilities create `web/src/components/patterns/as-of-line.tsx`: CAP-003 a generic `AsOfLine`, CAP-002 (approved) one specialised to Research (DEC-0073). Recorded as an open question with a recommendation, not resolved | Whichever lands second either overwrites the other or edits a file another capability owns; the blueprint's build-once rule (section 0, 4.8) is at risk | Owner settles the file's owner and shape with CAP-002's owner before story generation; record it in a decision and in both designs |
| FINDING-15 | LOW | SR-2 | UX design; data-health-ui | `ux-design.md:745`, `:866`; `component-design-data-health-ui.md:181`; CAP-002 `component-design-classification-api.md:461-462` | The Factor scores card checks `later` building, then failed, then `set.not_current`. CAP-002 makes `set.not_current` true exactly when `later` is non-null, so the *Not reflecting the latest download* branch is never reached and the card's only Stale rendering cannot occur | A test would be written for an unreachable state; AC-24's Stale state for this card is in effect *Updating* | Record that the card's Stale state is carried by *Updating* and *Score update failed*, or reorder so the lag label shows |
| FINDING-16 | LOW | SR-6 | Capability | `Capability-CAP-003.md:264-265` (AC-12) | "No screen MUST present ... as complete" reads, under RFC 2119, as "no screen is required to present", the opposite of the intent | Ambiguity in a core criterion | "No screen MAY present", or "Every screen MUST NOT present" |
| FINDING-17 | LOW | SR-9 | Capability | `Capability-CAP-003.md:329` | The tech-stack row cites `tech-stack.md` (v2); the approved artifact is v5, which the system design cites | Version pin points at a superseded revision | Cite v5 |
| FINDING-18 | LOW | SR-5, SR-6 | System design; UX brief | `system-design.md:788`; `ux-brief.md:646`; `ux-brief.md:24`, `:633` (commit 09410b0) | The source-document rows give DEC-0200 to DEC-0208's subjects as (0188) to (0196), numbers from before the run renumbered its records; DEC-0188 to DEC-0196 exist on no branch. The brief's provenance cites system design commit 09410b0, which is on no branch (the branch commit is 4c663e2, differing only in those numbers) | A later run claiming DEC-0188 to DEC-0196 would make these point at unrelated records (SA-MD-002) | Replace the parenthetical numbers with 0200 to 0208 and the commit with 4c663e2 |
| FINDING-19 | LOW | SR-6 | System design | `system-design.md:236-238` (3.1 note 4 "step 9", the redirects are step 8), `:308-309` (3.2 note 4 "Step 18", progress is step 19), `:432-447` (3.4 notes: "step 28", the refresh is step 22; "step 8's checks", the checks are step 7; "Step 31's dialog", the dialog is step 24) | Notes cite sequence steps that do not match the diagrams' `autonumber` | A reader citing a step lands on the wrong message | Renumber the notes against the diagrams |
| FINDING-20 | LOW | SR-3 | UX brief; UX design; home-ui; ui-components; command-palette; data-health-ui; owner-shell | `ux-brief.md:242` vs `ux-design.md:1001` and `component-design-owner-web-app.md:168-170`; `component-design-ui-components.md:293-295` and `component-design-home-ui.md:211` vs `system-design.md:806` and DEC-0203; `ux-design.md:355` vs `component-design-command-palette.md:165-169`; `component-design-data-health-ui.md:191-192` vs `system-design.md:436-437`; `component-design-command-palette.md:129-131` vs `component-design-owner-shell.md:290-297`; `component-design-owner-shell.md:484` vs `:99-139` | Six small drifts: the brief's *Follow stocks* against the design's **Follow a stock** and **Follow many**; six item kinds against the "five kinds" of DEC-0203 and the system design (kind 4 split in two); the palette's *{SYMBOL} · {name}* against no name in M1; **Download now** in *Needs fixing* when "any loaded row" is retryable against "at least one row"; `RESEARCH_REGISTERED` consumed by the palette but not declared by `owner-shell`; a test file cited in owner-shell 7 but absent from its placement list. CROSS-SPEC-INCONSISTENCY | Stories and tests pick one reading each | Align to the component designs' readings and state them in the upstream artifact at the next revision; use "any row" for **Download now** |
| FINDING-21 | MEDIUM | SR-9 | System design; data-health-api; data-health-reader; DEC-0208 | DEC-0208 `artifacts` (system design only); `component-design-data-health-api.md:229-234`; `component-design-ingestion-api.md:175-178`; `component-design-data-health-reader.md:434`, `:437-439`; `system-design.md:523-525` | (a) SEC-ENC-001 requires the decision's `artifacts` to name each design relying on the host-local loopback exception; DEC-0208 names only the system design, while data-health-api and ingestion-api cite the phrase and data-health-reader relies on the database channel without it. (b) SEC-DAT-001: the new response elements are classified (Internal) only in data-health-reader 4, not in the system design that introduces them, though H5 depends on it. (c) data-health-api 4 says SEC-AUTH-001 "is met by" the exception's H1 to H9; the exception governs transport, and the basis is that the routes are not externally reachable plus the owner's loopback decision (CONST-SEC 1.4 backlog FINDING-58) | Consumer discovery for a re-review when the exception changes misses three designs; the classification H5 rests on is not where the data is introduced | Extend DEC-0208's `artifacts` to the three component designs and the UX brief; cite the phrase and the 127.0.0.1:5432 channel in data-health-reader 4; classify the new elements in system design 4.2; restate the SEC-AUTH-001 basis |
| FINDING-22 | LOW | SR-6 | UX design; command-palette; home-ui | `ux-design.md:355`; `component-design-command-palette.md:125`, `:180`; `component-design-home-ui.md:132-133` | Two quantitative values cite no source (AGT-EVIDENCE-002): the palette's 250 ms debounce, and the market state recomputed "each minute" | Unsourced behavioural constants | Cite the command spec or the shadcn default if that is the source, or mark them `[REQUIRES INPUT]` |
| FINDING-23 | LOW | SR-5 | ui-components; owner-shell; command-palette; setup-ui; home-ui; data-health-ui; owner-web-app | `ai_provenance.timestamp` lines 17 of each: 02:25Z, 02:40Z, 02:50Z, 03:00Z, 03:15Z, 03:30Z, 03:45Z on 2026-10-25 | Commit 7af60e3, which introduced all ten component designs, was made at 2026-10-25T02:22:24Z; seven designs claim production times after it, the latest 83 minutes later (AGT-PROV-001) | Provenance times are not production times, so the audit trail cannot order the artifacts | Restamp each with its actual production time at the next revision |

---

## Traceability Matrix

Per-requirement verdicts (VER-EVD-004). "Traced" means the AC maps to a system
design element, a UX design element and a component design element, and the
component design's own test proves it.

| AC | System design | UX design | Component design(s) | Verdict |
|----|---------------|-----------|---------------------|---------|
| AC-1 | 4.1, 5.11; DEC-0204 | 0.2 | owner-shell 2.6, 2.7 | Traced |
| AC-2 | 3.1 | 0.3 | owner-shell 2.5; setup-ui 2.3 | Traced |
| AC-3 | 3.2 note 1 | 1.2 | setup-ui 2.2 | Traced |
| AC-4 | 3.2, 5.10 | 1.2, 1.4, 1.9 | setup-ui; owner-web-app 2.3; ingestion-api 2.3 | Traced |
| AC-5 | 3.2 notes 2, 3 | 1.2, 1.6 | setup-ui 2.3 (DEC-0218); owner-web-app | Traced |
| AC-6 | 3.2 | 1.2 | setup-ui 10 | Traced |
| AC-7 | 3.2, 3.3 | 1.2, 1.3 | setup-ui; home-ui 2.5; ui-components 2.6 (DEC-0216); data-health-reader 2.6 | Traced |
| AC-8 | 3.3 | 1.3 | home-ui 2.4 | Traced, with FINDING-7 |
| AC-9 | 3.3 note 3 | 1.3 | ui-components 2.6; data-health-reader 2.7 | Traced |
| AC-10 | 5.11 | 1.3 | home-ui 3 | Traced |
| AC-11 | 3.4 | 1.4 | data-health-ui 2.3, 2.4; data-health-reader 2.5 | Traced, with FINDING-2, -8, -9 |
| AC-12 | 5.6 | 0.7, 1.4, 1.7, 1.8 | ui-components 2.3; owner-web-app 2.3 | Traced, with FINDING-2, -16 |
| AC-13 | 3.4 | 1.4 | data-health-reader 2.4; data-health-ui 2.5 | Traced, with FINDING-10 |
| AC-14 | 3.4 note 2 | 1.4 | data-health-reader 2.4; data-health-ui 2.5, 2.7 | Traced |
| AC-15 | 3.4 | 1.4, 1.5, 1.7 | data-health-ui 2.7; owner-web-app 2.3 | Traced |
| AC-16 | 3.3 boxes 17, 18 | 0.2 | owner-shell 2.7; ui-components 2.6 | Traced, with FINDING-10 |
| AC-17 | 3.5, 4.1, 5.2 | 1.5 to 1.9 | owner-web-app; ingestion-api | Traced; the takeover awaits the owner's confirmation (system design OQ-8) |
| AC-18 | 3.1 note 4 | 0.3 | owner-shell 2.6 | Traced for the redirects; FINDING-5 for removal |
| AC-19 | 5.3 | 0.7 | owner-web-app 7 (vocabulary sweep); ui-components `labelOf` | Traced |
| AC-20 | 5.4 | 0.7 | ui-components 2.3 | Traced |
| AC-21 | 3.3 box 5, 3.4 | 1.3, 1.4 | home-ui; data-health-ui; data-health-reader 2.5 | Traced, with FINDING-10 |
| AC-22 | 3.5; DEC-0207 | 1.1 | command-palette; owner-shell 2.7 | Traced; implementation gated by FINDING-1 (`cmdk`) |
| AC-23 | 3.1 note 3 | 0.5 | owner-shell 2.8 | Traced |
| AC-24 | 3.3, 3.4, 5.5 | States subsections | ui-components 2.7 `StateRegion`; each screen | Traced, with FINDING-2, -15 (unreachable Stale states) |
| AC-25 | 5.8, 5.13 | 0.4, accessibility subsections | owner-shell 2.4; each screen | FINDING-11 |
| AC-26 | 4.1, 5.12 | every Component Mapping and Token Usage | ui-components | Traced, with FINDING-1, -6 |
| AC-27 | 4.2 | 0.2, 0.3 | owner-shell 2.6; command-palette 2.3 | Traced, with FINDING-13, -14 |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No CRITICAL finding exists. Two HIGH findings exist and neither blocks epic
generation or test design: FINDING-1 gates the implementing stories that add
non-Radix packages, which the designs already forbid before the owner's
confirmation, and FINDING-2 is a derivation and copy correction to one check
card. Both should be resolved before story generation reaches the stories
they touch, and FINDING-2 before test design, so that no test encodes the
*All current* label or the unreachable Stale state.

This verdict approves nothing. Every schema-versioned specification in scope
(all fourteen, `status: draft`) stays blocked from epic generation and test
design until the owner explicitly approves each revision with
`scripts/artifact-gate.py approve`, using this report as `--review-artifact`.
The owner also has twenty-one open agent decisions (DEC-0200 to DEC-0220) to
uphold or revert; their blind second opinion has not been run.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. **FINDING-1** — confirm or replace the ten non-Radix packages through
   `$tech-stack`, and list all ten in capability OQ-4 and system design 4.3.
2. **FINDING-2** — stop asserting currency the Daily prices check cannot
   establish; record the S09 section 7 departure; correct capability 5.4's
   STD-UI-18 cell.

### Should Fix (MEDIUM findings)

3. **FINDING-3** — revise the system design for DEC-0212, DEC-0215, DEC-0219
   and DEC-0220 so the architecture inventory matches the components.
4. **FINDING-4** — set a latency criterion for `GET /api/data-health`.
5. **FINDING-5** — remove the removal clause from AC-18.
6. **FINDING-6** — reconcile AC-26 and STD-UI-29 with the approved layout
   sizes.
7. **FINDING-7** — take the tile's two figures from one population.
8. **FINDING-8** — define the verdict at full proportion.
9. **FINDING-9** — decide whether a failed latest download reaches the verdict.
10. **FINDING-10** — show *Needs fixing* whenever problems exist.
11. **FINDING-11** — last-updated times on the three polled regions.
12. **FINDING-12** — list the three missing departures in UX design 0.8.
13. **FINDING-13** — own the `SHELL_ROUTES` migration in CAP-003.
14. **FINDING-14** — settle `as-of-line.tsx` with CAP-002's owner.
15. **FINDING-21** — complete the SEC-ENC-001, SEC-DAT-001 and SEC-AUTH-001
    bookkeeping.

### Nice to Have (LOW findings)

16. **FINDING-15** to **FINDING-20**, **FINDING-22**, **FINDING-23** — dead
    branch, wording, version pin, stale numbers, step citations, drift,
    unsourced constants and timestamps; each a one-line correction at the next
    revision.

---

## Open Questions for the Owner

Recorded instead of asked, because the run is unattended. None is a decision
this review took.

1. **Capability assumption 1** asks the owner to confirm "at the first review"
   that the rail shows only shipped destinations in M1. The designs implement
   that reading (DEC-0204); confirmation remains the owner's.
2. **Capability assumption 3** asks the owner to confirm that "one release" in
   AC-18 means the next release image.
3. **System design OQ-8**: confirm that taking over CAP-001's delivered files
   (the DEC-0211 list) is CAP-003's own work under AGT-SCOPE-002.
4. **Capability OQ-1** (download number) and **OQ-3** (CSV upload) remain
   `[REQUIRES INPUT]`; both change copy and one control, not structure.
5. **FINDING-1, -4, -6, -9, -14** each need an owner choice before the
   affected stories.

## Unattended-Run Record

- Mode: unattended, delegated by `$design-run` (run `design-run-f106a0`).
- Decisions recorded by this review: none. Severity and verdict are review
  judgments under the rubric, not decisions under `docs/decision-records.md`.
- Abstentions: none.
- Writes: this report only. No artifact, approval block, decision record,
  branch or commit was touched; the driver commits the report.
