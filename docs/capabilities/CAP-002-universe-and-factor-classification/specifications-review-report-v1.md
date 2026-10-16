---
artifact_schema_version: 1
artifact_id: CAP-002-specification-review
artifact_type: specification-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-16
updated: 2026-10-16
document: spec-review-report
capability: CAP-002
version: v1
generated: 2026-10-16T06:10:38Z
constitutions_reviewed:
  - "CONST-AGT  docs/constitutions/agent-governance.constitution.md (2.3)"
  - "CONST-MDL  docs/constitutions/model-management.constitution.md (1.3)"
  - "CONST-OPS  docs/constitutions/operational-safety.constitution.md (1.3)"
  - "CONST-REV  docs/constitutions/review.constitution.md (1.4)"
  - "CONST-SA   docs/constitutions/static-analysis.constitution.md (2.0)"
  - "CONST-SEC  docs/constitutions/security.constitution.md (1.3, in force: content revision sha256:0f5659addf64eb6aff78fcc810f92673f348d7f8d943061cb5ca225fff15b0c7 equals the approval block's reviewed_revision; harness checkout on main)"
  - "CONST-VER  docs/constitutions/verification.constitution.md (1.2)"
mechanical_checks:
  - script: check-capabilities.py
    outcome: run
    result: "PASSED, exit 0: 2 capabilities, 6 edges (requires-runtime 2, conforms-to 4, blocked-by 0, requires-contract 0), 1 standard (STD-UI), 2 conformance claims, 1 constitution artifact, 2 references; integration layers CAP-001 then CAP-002; --json errors [] and warnings []"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0: 2 designs, 19 components (12 CAP-001 + 7 CAP-002), 46 interfaces (16 + 30); no drift against docs/architecture.md"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 232 warnings, exit 0 (--strict), 280 artifacts; no error and no warning on any CAP-002 artifact; warnings are CAP-001 legacy-format reports and stale upstream pins, and docs/constitution/standards/ui-conventions.md pinning tech-stack v2 (current v5) and CAP-001-ux-brief v5 (current v7)"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0: 1118 path references across 224 Markdown files resolve; the CAP-002 designs' source-code and fixture references (25 paths) were also checked by hand and all exist"
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
  SR-8: "applied — design_system_available true; every badge, button, input, form, dialog, card, select, tabs, textarea and data-table variant and every token named was verified against design-system/"
  SR-9: "applied — dependency half and STD-UI conformance half by check-capabilities.py; tech-stack conformance (C2, C4, C5, C8, OQ-TS-3) and the CONST-SEC 1.3 host-local loopback exception bookkeeping assessed by hand"
  SR-10: applied
specifications_reviewed:
  capability_spec: docs/capabilities/CAP-002-universe-and-factor-classification/Capability-CAP-002.md
  system_design: docs/capabilities/CAP-002-universe-and-factor-classification/design/system-design.md
  ux_brief: docs/capabilities/CAP-002-universe-and-factor-classification/design/ux-brief.md
  ux_design_spec: docs/capabilities/CAP-002-universe-and-factor-classification/design/ux-design.md
  component_designs:
    - design/component-design-classification-api.md
    - design/component-design-classification-reader.md
    - design/component-design-classification-scheduler.md
    - design/component-design-classification-ui.md
    - design/component-design-factor-engine.md
    - design/component-design-research-store.md
    - design/component-design-universe-service.md
review_subjects:
  - artifact_id: CAP-002
    artifact_version: 1
    content_revision: sha256:8a2706f314bf084b017d65d9a96a9ab3f9973106aa3e6fef3c34d7913741f629
  - artifact_id: CAP-002-system-design
    artifact_version: 1
    content_revision: sha256:4c983dccd0ba788cafb01243dfd7bd729b833224d47b4cc8aaecb88ddfda7709
  - artifact_id: CAP-002-ux-brief
    artifact_version: 1
    content_revision: sha256:f182efb8824df5ae88dd50fdf61063bef0f7dd01a6d3f3170dace10339603e6b
  - artifact_id: CAP-002-ux-design
    artifact_version: 1
    content_revision: sha256:eababc176efc54d26a50964a67d898c1e78a8016cf5293457cb109d46ca3b42d
  - artifact_id: CAP-002-component-design-classification-api
    artifact_version: 1
    content_revision: sha256:982848f73f98a30ea268d327dc073c7216a558d61a25dff67839fe2fd82f4a7d
  - artifact_id: CAP-002-component-design-classification-reader
    artifact_version: 1
    content_revision: sha256:207ef088a8d7056503c8570b1bd8c4fb0d1c4b60907a373654a83aae45734ea0
  - artifact_id: CAP-002-component-design-classification-scheduler
    artifact_version: 1
    content_revision: sha256:fe4a952dcfeddc80497a33d6979ef319fab25ba3be7eadc9121c60452d083a24
  - artifact_id: CAP-002-component-design-classification-ui
    artifact_version: 1
    content_revision: sha256:661e508300f1cc133201fe8e7187d64c2e7740a7c46bd774a5086d754c1ca602
  - artifact_id: CAP-002-component-design-factor-engine
    artifact_version: 1
    content_revision: sha256:ddd2a583397b0851cff48a1702ec7eced6ed4f228cae0845130ed41275596680
  - artifact_id: CAP-002-component-design-research-store
    artifact_version: 1
    content_revision: sha256:e50f0b3e2dd13d1c0402caef704be7f6c4dec060eaebb0fcb5f26f5eec0548c2
  - artifact_id: CAP-002-component-design-universe-service
    artifact_version: 1
    content_revision: sha256:a66df80834625cbdb1a5d6fe07c224d4299c68d15dbc90a939f1f8aa4b9eb8d4
statistics:
  total_findings: 25
  critical: 0
  high: 2
  medium: 13
  low: 10
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-16T06:10:38Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "1"
    - id: CAP-002-ux-brief
      version: "1"
    - id: CAP-002-ux-design
      version: "1"
    - id: CAP-002-component-design-classification-api
      version: "1"
    - id: CAP-002-component-design-classification-reader
      version: "1"
    - id: CAP-002-component-design-classification-scheduler
      version: "1"
    - id: CAP-002-component-design-classification-ui
      version: "1"
    - id: CAP-002-component-design-factor-engine
      version: "1"
    - id: CAP-002-component-design-research-store
      version: "1"
    - id: CAP-002-component-design-universe-service
      version: "1"
    - id: STD-UI
      version: "4 (approved 2026-09-05; context)"
    - id: tech-stack
      version: "5 (approved 2026-10-13; context)"
    - id: CONST-SEC
      version: "1.3 (in force; content revision sha256:0f5659addf64eb6aff78fcc810f92673f348d7f8d943061cb5ca225fff15b0c7)"
    - id: DEC-0052 to DEC-0067
      version: "open, decided_by agent, owner_reviewed false (context)"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Specification Review Report -- CAP-002

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-002 Universe & Factor Classification |
| **Version** | v1 (first review of this capability) |
| **Specifications Reviewed** | Capability v1; system design v1 (`ui_facing: true`); UX brief v1; UX design v1; seven component designs v1 (classification-api, classification-reader, classification-scheduler, classification-ui, factor-engine, research-store, universe-service) |
| **Total Findings** | 25: CRITICAL 0, HIGH 2, MEDIUM 13, LOW 10 |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

The specification set is substantial, internally well cross-referenced and
honest about what it does not know: every acceptance criterion traces to a
design element, every component carries a test plan and acceptance criteria,
every diagram is preceded by a narrative of four or five sentences, every
component and token the UX design names exists in the design system, and every
schema name the designs read exists in migrations `0001` to `0004`. All five
mechanical checks pass with no error or warning against a CAP-002 artifact.

Two HIGH findings stand. **FINDING-1**: the scheduler classifies every
historical CAP-001 run that has no set, oldest first, at first deployment, so
the first deployment writes one permanent append-only set per historical run,
each labelled with an old run while computed from the store as it stands that
day, delays the first new run past the 5-minute budget, and contradicts the
research-store and factor-engine designs, which say the first set follows the
first qualifying run after deployment. **FINDING-2**: the mapping from the
seven factor line items to Massive statement payload keys, and whether quarterly
statements exist for every quarter, is unvalidated; until the owner answers,
value and growth (five of eight inputs) cannot classify in production, and a
negative answer on quarterly Q4 statements changes the trailing-twelve-month
derivation itself, not only a constant.

No CRITICAL finding exists, so under the rubric the set is READY-WITH-WARNINGS.
This review recommends that FINDING-1 be corrected in a design revision, and
FINDING-2 answered by the owner, before the owner approves the reviewed
revisions.

## Review Scope

All eleven specification artifacts resolved by `get-capability-specifications`
were read in full; no `epics/`, `stories/` or `tests/` content exists for
CAP-002. Inputs read for context and conformance: the product charter is cited
through the designs; `docs/constitution/tech-stack.md` v5 (constraints C1 to
C11, OQ-TS-3); `docs/constitution/standards/ui-conventions.md` (STD-UI v4, all
thirty rules); the design system under `design-system/` (12 component
specifications, `theme.css`, `component-map.json`, `intake.md`); decision
records DEC-0001, DEC-0050 and DEC-0052 to DEC-0067; CAP-001 capability AC-1,
AC-3 to AC-5, AC-7, AC-9, AC-19 to AC-21 (the citations in CAP-002 section 5.1);
CAP-001 system design constraint 6; CAP-001 `component-design-ingestion-api.md`
section 2.3; migrations `0001` to `0004`; and the delivered files the designs
cite (`src/factorflow/api/app.py`, `bounds.py`, `config/settings.py`,
`tests/unit/test_sql_is_append_only.py`, `web/src/app/shell.tsx`,
`web/src/api/client.ts` and others; all exist).

Not available for review: the seven recommendations R1 to R7 that the design
decomposition's alignment review raised against the system design. Commit
`12d2ba7` names them ("reported to its owner, none applied") but no artifact
records them (FINDING-22). This review's own system-design drift findings
(FINDING-15 and others) were derived independently and cannot be matched to
R1 to R7.

Context the driver supplied and this review judged rather than accepted:
sixteen provisional agent decisions (DEC-0052 to DEC-0067, all
`owner_reviewed: false`) and three `[REQUIRES INPUT]` abstentions (Massive
line-item mapping; universe name length; Compare cap). The provisional
decisions are a legitimate unattended-mode outcome and are not findings in
themselves; where a decision creates a defect or leaves an approved artifact's
gate open, the finding names it. The three abstentions are graded by what they
block: FINDING-2 (HIGH, blocks two of three factors), FINDING-12 (MEDIUM, one
constant but a SEC-INP-001 gap), FINDING-16 (LOW, blocks nothing).

The capability is `status: draft` with no approval block, as are all ten
designs; `docs/approval-gates.md` has design phases work on drafts and approval
follow this review, so draft status is not a finding.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All template sections present in all eleven artifacts; NFRs (AC-11, section 5.3), error handling and flows with failure branches present; every diagram preceded by a 4- or 5-sentence narrative (17 diagrams counted) |
| SR-2 Correctness | applied | ACs mutually consistent; error codes unique per meaning; schema and column names checked against migrations `0001` to `0004`; `percent_rank`, `stddev_samp`, split and dividend arithmetic read |
| SR-3 Consistency | applied | AC-to-design mapping; decomposition-to-system-design alignment; cross-spec entity, path, code and conformance-record comparison |
| SR-4 Testability | applied | Each AC checked for observable outcome, concrete input, boundary and measurability |
| SR-5 Traceability | applied | System design section 7, every component's section 13 and UX design section 5 traced; citations to other artifacts verified |
| SR-6 Clarity | applied | Vague-term scan of the capability; undefined references and open defaults |
| SR-7 Feasibility | applied | Circularity, single points of failure, timeouts, first-deployment behaviour, budget |
| SR-8 UX Completeness | applied | `design_system_available` true; all six screens, eight states per region, component mapping (every variant verified), token usage (every token verified), source mapping, AC traceability and EDG checklist |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` (no error, no warning); type, citation and placement of the three section 5.1 rows; STD-UI section 5.4 against the UX brief record; tech-stack C2, C4, C5, C8 and OQ-TS-3; CONST-SEC 1.3 exception bookkeeping |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` (19 components, 46 interfaces, no drift); section 4.1 identifiers on every diagram box and sequence participant; every section 4.2 row names a provider and a consumer component; no capability identifier used as an actor in sections 1 to 5 |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, exit 0, PASSED; `--json` errors `[]`, warnings `[]` | none |
| `build-architecture.py -p factorflow-v2` | run, exit 0, PASSED: 2 designs, 19 components, 46 interfaces, no drift | none |
| `check-artifacts.py -p factorflow-v2 --strict` | run, exit 0, PASSED with 232 warnings, none on a CAP-002 artifact | none against the subjects; the STD-UI pin warnings are recorded under Observations |
| `check-references.py` | run, exit 0, PASSED: 1118 references in 224 Markdown files | none |
| `check-constitutions.py` | run, exit 0, PASSED: 10 constitutions, 36 skills | none |

Supplementary evidence gathered fresh in this session:

- `bash scripts/check-prerequisites.sh --project factorflow-v2`: exit 0, every
  check PASSED (first attempt inside the sandbox failed on a heredoc temp file;
  rerun outside it).
- `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --stage specification-review`
  before writing: `READY — specifications are ready for review`.
- `python3 scripts/artifact-gate.py revision` for all eleven subjects (values in
  `review_subjects`), and for `docs/constitutions/security.constitution.md`:
  `sha256:0f5659ad…b0c7`, equal to its approval block, file on `main`.
- Design-system verification: every `--token` named in the UX brief, UX design
  and classification-ui exists in `design-system/theme.css`; every component
  variant named exists in its `design-spec.md`.
- Schema verification: every table, column, index and enumeration value the
  designs read (`instrument.lifecycle`, `fundamental_observation.fiscal_period`,
  `provider_filing_date`, `corporate_action.action_type`, `effective_on`,
  `acquisition_run.state` values, `idx_daily_bar_instrument_session` and the
  rest) exists in migrations `0001` to `0004`; `bounds.py` holds 50, 500 and 1000.

## Constitutions Applied

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | AGT-AUTH-002: every decision class surfaced as a decision record or `[REQUIRES INPUT]`. AGT-AUTH-003: the UX design flags its disagreement with the brief on `toast`; R1 to R7 are flagged only in a commit message (FINDING-22). AGT-SCOPE-002: the composition edits to delivered CAP-001 files rest on a provisional reading (FINDING-13). AGT-SCOPE-005: composite and backfill rules bind M4 and are surfaced (system design section 8 question 9); the capability itself leaves the arithmetic undefined (FINDING-11). AGT-EVIDENCE-002: every quantitative value is cited or marked; none invented. AGT-PROV-001: blocks present; seven component-design timestamps postdate their commit (FINDING-25) |
| CONST-MDL 1.3 | No product model usage; provenance model fields present. Nothing else engaged |
| CONST-OPS 1.3 | OPS-MIG-001/002/003: additive migrations with an explicit strategy and the dump-and-restore rollback (research-store section 6), one unsupported citation (FINDING-21). OPS-ERR-001: failures logged and recorded; the not-current mark misses a stuck scheduler (FINDING-3). OPS-DEST: no destructive operation specified |
| CONST-REV 1.4 | This report is two-stage (spec compliance, then artifact quality) and verifies each upstream claim against the artifacts rather than accepting it |
| CONST-SA 2.0 | SA-MD-002: references resolve. SA-MD-003: placeholders use `[REQUIRES INPUT]`. SA-DUP-001: the append-only guard reuse is not implementable as written (FINDING-6). SA-DEAD-002: no TODO or TBD |
| CONST-SEC 1.3 (in force) | SEC-AUTH-001 non-engagement inherited from CAP-001 (capability 5.3). SEC-INP-001: universe name has no length bound (FINDING-12). SEC-INP-002: allowlisted sort, parameterised SQL. SEC-DAT-001: Internal throughout, recorded. SEC-ERR-001: raw exception text reaches the owner interface against the cited CAP-001 posture (FINDING-5). SEC-ENC-001 host-local loopback exception: no channel, bind or port added and H1 to H9 inherited by registration; check (q) incomplete for five component designs (FINDING-9). SEC-AUD-001: no listed event class occurs |
| CONST-VER 1.2 | All five mechanical checks and the supplementary checks ran in this session; the Traceability Matrix gives a per-AC verdict (VER-EVD-004) |

---

## Stage 1 -- Specification Compliance

The system design maps all 23 acceptance criteria, and the component designs
map every one they own; no design element lacks an AC or a stated reason. The
capability's owner decisions (factor definitions, 30-stock threshold, 6-month
and latest-trading-day rules, 5-minute budget, no empty universe) are carried
exactly into constraints 6 and 8, the engine constants and the research-store
checks. Fidelity breaks in four places: the first-deployment semantics of
"every run that ends succeeded or partial" (FINDING-1, AC-10, AC-11, AC-21),
the definition of "not reflecting the latest acquisition" (FINDING-3, AC-20),
universe members and compared stocks with no row in the current set
(FINDING-4, flow 4 step 5), and the capability's own STD-UI-30 and C4 claims,
which the designs do not support (FINDING-7, FINDING-8).

## Stage 2 -- Artifact Quality

Structure, narratives, traceability tables, test plans and security sections
are complete in every artifact. Quality defects are drift between the system
design and its decomposition (FINDING-15), an append-only guard whose scope
misses the SQL files the components write (FINDING-6), owner-facing exception
text (FINDING-5), unsupported or stale citations (FINDING-17, FINDING-21,
FINDING-23), unrecorded review recommendations (FINDING-22) and provenance
timestamps later than the commits that introduced them (FINDING-25).

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability; no finding.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py`: no error, no warning. By hand:

- **CAP-001 `requires-runtime`**: type correct (CAP-002 can only be exercised
  on a running acquisition); citations adequate: AC-1, AC-3, AC-4, AC-5, AC-7,
  AC-9, AC-19, AC-20, AC-21 each say what the row claims. Placement correct.
  No `blocked-by` row.
- **Non-dependencies** (5.2) correctly placed: CAP-001 writes, Massive, Alpaca.
- **`tech-stack.md` `conforms-to`**: C2, C5 and C8 honoured (system design
  constraints 2, 3, 19); C4 is not addressed anywhere in the system design
  (FINDING-8); `hypothesis` is cited to the tech stack, which does not list it
  (FINDING-17); OQ-TS-3, which the approved tech stack says blocks
  classification implementation, is closed only by an agent's provisional
  decision (FINDING-14).
- **STD-UI `conforms-to`**: all 30 rules accounted for; no specialization of a
  `none` or `stricter-only` rule; every "no" carries a scope-derived reason.
  STD-UI-30 is claimed `yes` while every design records `partial` (FINDING-7).
  STD-UI-7 `partial` carries its detail.

#### Completeness (SR-1)

No finding. Description, scope, six flows with failure branches, 23 ACs, NFRs
(AC-11, 5.3), constraints, assumptions and readiness are present.

#### Correctness (SR-2)

No finding. The ACs do not contradict one another.

#### Testability (SR-4)

- FINDING-11: "standardised score" (AC-9) and the treatment of a non-positive
  growth base or market capitalisation are undefined, so AC-7, AC-9 and AC-12
  are testable only against agent decisions.

#### Clarity (SR-6)

- FINDING-16: "a few chosen stocks" (section 2, flow 4 step 3) is unquantified.
- FINDING-11 (above).

### System Design Specification

- **SR-1**: complete; the three diagrams carry 5, 5 and 4 sentence narratives.
- **SR-2**: error codes unique; the classification arithmetic is internally
  consistent.
- **SR-3**: FINDING-3 (constraint 11 narrower than AC-20); FINDING-15 (drift
  from the decomposition); FINDING-18 (`GET /api/instruments` declared for a
  consumer that does not use it).
- **SR-5**: all 23 ACs traced in section 7; FINDING-17.
- **SR-7**: FINDING-1 (3.1 step 21 and the qualifying-run rule at first
  deployment); FINDING-2 (assumption 1 unvalidated, section 8 question 1).
- **SR-9**: FINDING-8 (C4); FINDING-14 (OQ-TS-3); FINDING-13 (section 8
  question 4).
- **SR-10**: no finding. Section 4.1 declares seven component identifiers;
  every diagram box and sequence participant carries one; every section 4.2 row
  names a provider and a consumer component; "the first capability" appears
  only as a source citation, never as an actor.

### Component Design Specifications

- **classification-scheduler**: FINDING-1 (section 6 backlog, section 5
  "about n budgets"); FINDING-10 (300-second timeout equal to the budget, no
  retry); FINDING-25.
- **factor-engine**: FINDING-2 (section 14 question 1, `line_items.py`,
  quarterly-only statements); FINDING-5 (`failure_reason` is the exception
  class and message); FINDING-6 (claim that the delivered guard covers its SQL);
  FINDING-11 (market-capitalisation extension of `not_computable`); FINDING-25.
- **research-store**: FINDING-1 (section 6 contradicts the scheduler);
  FINDING-6 (guard scans migrations and Python only; helper takes no table
  list); FINDING-21; FINDING-25.
- **classification-reader**: FINDING-3 (`current_set.sql` derives not-current
  from set rows only); FINDING-4 (`EXISTS` scope drops instruments with no row
  in the current set); FINDING-24 (live lifecycle beside set-dated cells);
  FINDING-25.
- **classification-api**: FINDING-4 (no reader operation supplies member cells
  for `GET /api/universes/{id}`); FINDING-12 (`MAX_UNIVERSE_NAME_LENGTH`);
  FINDING-13; FINDING-19 (no sort on `GET /api/universes`); FINDING-23;
  FINDING-25.
- **classification-ui**: FINDING-3 (poll stop rule); FINDING-13; FINDING-25.
- **universe-service**: FINDING-4 (coverage, not set presence, gates
  membership); FINDING-25.
- **SR-7, all components**: no circular dependency (scheduler to engine to
  stores; API to service and reader; reader to the universe replay SQL, one
  direction). The single build slot is protected against an orphaned `building`
  row by DEC-0067's start-up reclaim, which the system design does not yet
  carry (FINDING-15).

### UX Brief

- **SR-8**: all user-facing screens, the eight STD-UI-23 states per region,
  the STD-UI-12 tier table (DEC-0059), accessibility and a valid component list
  are present; the COMPONENT-SPEC-GAP for a numeric toolbar filter is recorded
  through `intake.md`. FINDING-7 (its `partial` for STD-UI-30 disagrees with the
  capability); FINDING-5 (its EDG claim that no exception reaches the owner is
  contradicted downstream); FINDING-20.

### UX Design Specification

- **SR-8**: every brief screen has a section; component mapping complete and
  every variant exists; tokens all exist; source mapping table and design
  source present (Path B, "Generated from UX brief"); all 23 ACs in the
  traceability table; EDG checklist present. FINDING-5 (`<failure_reason as
  recorded>` rendered in the currency region); FINDING-19 (Name column
  sortable); FINDING-20 ("above" for an inclusive bound).

### Cross-Specification Consistency (SR-3)

- CROSS-SPEC-INCONSISTENCY: first set after deployment (research-store
  section 6, factor-engine section 6) against the backlog (scheduler section 6)
  (FINDING-1).
- CROSS-SPEC-INCONSISTENCY: STD-UI-30 `yes` (capability 5.4) against
  `partial` (UX brief 12.1, system design constraint 18, UX design section 3,
  classification-ui section 14) (FINDING-7).
- CROSS-SPEC-INCONSISTENCY: SEC-ERR-001 posture "inherited from ingestion-api
  §2.3" (system design 3.1 step 25), whose text says driver messages are never
  returned, against `failure_reason` carrying the exception message to the
  interface (FINDING-5).
- CROSS-SPEC-INCONSISTENCY: system design section 4.2 and constraint 10
  against the decomposition's additions (FINDING-15).
- CROSS-SPEC-INCONSISTENCY: system design section 4.4 ("scans every `.sql`
  file") against research-store section 2.5 (migrations only) (FINDING-6).

---

## Findings Summary Table

CRITICAL 0 · HIGH 2 · MEDIUM 13 · LOW 10 · **total 25**

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-7, SR-3 | classification-scheduler; research-store; factor-engine; system design | scheduler sections 2.4 (`qualifying_run.sql`), 5 "Backlog", 6 "Behaviour change after upgrade"; research-store section 6 "Data migration"; factor-engine section 6; system design 3.1 steps 19 to 21 | The qualifying-run rule (`succeeded` or `partial` with no `classification_set`) makes every CAP-001 run that ended before deployment a qualifying run. The scheduler design states it will claim the oldest and work forward, one set per historical run, each dated the day it is built. The research-store and factor-engine designs state instead that the first set follows the first qualifying run after deployment. | On first deployment the append-only store (C5, "critical, unrecoverable if wrong", system design 4.2) gains one permanent set per historical run, each naming an old `run_id` while computed from the store as it stands that day, so AC-21's "which acquisition run they reflect" is misstated and history carries duplicate sets per date. A run ending during the backlog waits behind it, so AC-11's 5 minutes is missed (scheduler section 5 concedes "about n budgets"). Implementing either reading leaves the other design wrong. | Decide in the system design which runs qualify (for example: only the latest qualifying run without a set, superseding older unclassified runs, at first deployment and whenever several are waiting) and align the scheduler, research-store and factor-engine sections 6 to it; record the choice as an owner or provisional decision. AC-10 requires classifications up to date after each such run, not one set per run |
| FINDING-2 | HIGH | SR-7, SR-1 | factor-engine; system design; capability | system design section 6 assumption 1 and section 8 question 1; factor-engine sections 2.3 step 3 (`fiscal_period <> 'FY'`), 2.4 (`LINE_ITEMS`), 14 question 1; capability section 6 assumption 1 | The payload keys and sign conventions of the seven line items, and whether Massive returns a quarterly statement for every fiscal quarter including the fourth, are unknown; the capability asked for validation during system design and it could not be done (fixtures hold four balance-sheet keys). The engine reads only quarterly statements and requires four distinct quarters inside twelve months. | Until answered, every value and growth input is `missing` with `line_item_mapping_unresolved`, so value and growth never classify in production and AC-7, AC-9 and AC-23 are demonstrable for momentum only. If fourth-quarter figures exist only in annual (`FY`) statements, no trailing-twelve-month window can ever be formed and DEC-0055 (1) itself must change, which is a design revision, not the one-constant edit DEC-0066 anticipates | Owner: answer system design section 8 question 1 against statements acquired by a real Financials run, including whether quarterly Q4 rows exist. If they do not, revise DEC-0055 (1) and the engine's statements stage before the value and growth stories are planned |
| FINDING-3 | MEDIUM | SR-3, SR-2 | system design; classification-reader; classification-ui | system design constraint 11; reader section 2.4 `current_set.sql`; classification-ui section 2.6 start and stop rule; UX design section 1.2 polling | "Not current" is derived only from a later `classification_set` row in `building` or `failed`. A run that has ended `succeeded` or `partial` but has no set yet (the claim gap of up to one poll interval, a backlog, or a scheduler loop failing every iteration, which only logs) leaves the previous set reported as current with no mark. The interface stops polling when no set is building and no run is non-terminal, so a poll landing in the claim gap stops polling until the next run starts or the owner reloads. | AC-20 requires the previous set to be marked until a new set is complete; in the cases above it is shown unmarked, and flow 1 step 3's refresh "without any further action" does not happen until the owner reloads. A stuck scheduler is invisible to the owner. | Define not-current against the latest qualifying run (its `ended_at` later than the current set's run, with or without a set) in system design constraint 11 and reader 2.4, and keep the interface polling while such a run lacks a complete set |
| FINDING-4 | MEDIUM | SR-3, SR-1 | classification-reader; classification-api; universe-service | reader section 2.5 (`EXISTS (SELECT 1 FROM factor_classification c WHERE c.set_id = %(set_id)s ...)`) and `compare`; classification-api section 2.7 `UniverseResponse.members[].factors`; reader section 2.3 interface; universe-service section 3 "Coverage, not lifecycle" | Membership is gated on coverage, but list and compare scope are gated on a row in the current set. An instrument covered after the current set was built (CAP-001 AC-19 keeps coverage written by a cancelled run, and a failed or cancelled run triggers no set) can be a universe member and an instrument, yet it is excluded from the universe-scoped list and from compare, and is not reported in `unknown_symbols`. No reader operation supplies factor cells for `GET /api/universes/{id}` members other than `compare`, which is capped at 500, while a universe may hold 3000 members and the as-of view is served from that response. | Flow 4 step 5 and STD-UI-16 forbid leaving a stock out; the Members table count (`member_count`) and its rows disagree; the API cannot be implemented for an as-of view of more than 500 members without inventing a reader operation | Specify a state for an instrument with no row in the current set (for example "not yet classified, acquired after this set") returned by list, compare and universe detail, and add the reader operation that returns cells for an arbitrary member list without the compare cap |
| FINDING-5 | MEDIUM | SR-8, SR-3 | factor-engine; system design; UX design; UX brief | factor-engine sections 2.3 (`fail_set.sql` reason = exception class and message) and 4; system design 3.1 step 25; UX design section 1.2 failed headline ("failed: <failure_reason as recorded>") and section 4 EDG row; UX brief section 8 EDG row; CAP-001 `component-design-ingestion-api.md` section 2.3 | The failed-set reason is the Python exception class and message, which the factor-engine concedes may carry a `psycopg` message naming tables or columns, and a timed-out build (DEC-0067) yields a statement-timeout message. The UX design renders it verbatim. STD-UI-1 forbids surfacing "exception" and "timeout" vocabulary; both UX artifacts claim no exception reaches the owner; the system design cites ingestion-api section 2.3 as the posture, which states driver messages are never returned | The one critical-tier state CAP-002 renders breaks STD-UI-1 and the EDG claim, and departs from the CAP-001 posture it cites | Record a product-vocabulary reason (operation, resource, cause, per STD-UI-19) in `failure_reason` and keep the exception detail in the structured log with the `set_id`, or map exception classes to fixed sentences as the reclaim reason already does |
| FINDING-6 | MEDIUM | SR-3, SR-7 | research-store; factor-engine; system design | research-store section 2.5 item 2 (scans `src/factorflow/db/migrations/*.sql` and Python sources; reuses `prohibited_observation_mutations` "with this capability's table list"); factor-engine section 3 second bullet; system design 4.4 ("scans every `.sql` file"); `tests/unit/test_sql_is_append_only.py` lines 11 to 34 | CAP-002's statements live in `.sql` files under `src/factorflow/classification/sql/` and `src/factorflow/universes/sql/`. The research-store guard, like the delivered one, scans only migration `.sql` files and Python sources, so it sees none of them, including the three `UPDATE classification_set` statements whose `state = 'building'` guard it claims to assert. The delivered helper takes only `text` and a module-level table tuple, so it cannot be reused with another table list without editing the delivered test. The factor-engine's claim that the delivered guard covers its SQL is therefore false | The central C5 enforcement the system design marks "critical, unrecoverable if wrong" has a coverage hole; only the per-component `*_sql_safety` tests remain | Widen the guard to every `.sql` file under `src/factorflow/`, as system design 4.4 states, and specify how the matcher is shared without editing the delivered test (for example a new shared helper module), then correct factor-engine section 3 |
| FINDING-7 | MEDIUM | SR-9, SR-8 | capability; UX brief | capability section 5.4 row STD-UI-30 (`yes`) and section 5.4 preamble ("the two must agree"); UX brief section 12.1 row STD-UI-30 (`partial`); system design constraint 18; UX design section 3; classification-ui section 14 question 3 | The capability claims full conformance to STD-UI-30 while the UX brief, the conformance record of record under STD-UI section 4, and every design say `partial` because the `data-table` specification offers pagination and not virtualisation; CAP-001 records `partial` in both places | The machine-checked mirror overstates conformance, and a later change to STD-UI-30 derives its blast radius from it | Mark STD-UI-30 `partial` in capability section 5.4 with the same detail as the UX brief |
| FINDING-8 | MEDIUM | SR-9 | system design; capability | capability section 5.1 row `docs/constitution/tech-stack.md` ("the market data source as one contract that classification reads history through (C4)"; satisfied when review confirms C2, C4, C5, C8); system design (no occurrence of C4); system design 4.2 row "Observation read" | The system design states how C2, C5 and C8 are honoured but never addresses C4. The factor engine reads `daily_bar`, `fundamental_observation` and `corporate_action` directly through SQL; the CAP-001 design placed C4 on the `massive-client` provider interface. Whether the store's published table shapes are the historical half of the C4 contract is not stated | The capability's own "Satisfied when" for this row cannot be confirmed; M4 backtesting will inherit whatever reading CAP-002 sets without it having been decided (AGT-SCOPE-005) | State in the system design how classification honours C4 (for example: the `market-data-store` read interface is the historical half of the C4 contract) or, if a read interface is required, specify it; surface the reading to the owner |
| FINDING-9 | MEDIUM | SR-9 | system design; five component designs; DEC-0058 | DEC-0058 `artifacts` (system-design.md only); classification-api section 4, classification-reader section 4, classification-scheduler section 4, factor-engine section 4, research-store section 4 (each cites `SEC-ENC-001 host-local loopback exception`) | CONST-SEC 1.3 SEC-ENC-001 requires a consumer's project to record a decision whose `artifacts` name every design that cites and relies on the exception; check (q) verifies it. Five component designs cite the exact phrase and are not named | Consumer discovery for re-review on any change to the exception misses five designs; check (q) fails for them | Name the five component designs in the `artifacts` of the decision that records reliance (DEC-0058, or a record superseding it), as the exception requires |
| FINDING-10 | MEDIUM | SR-7 | classification-scheduler; factor-engine | scheduler section 2.3 (`build_timeout_seconds` default 300) and section 3 "No retry"; factor-engine section 2.3 step 1 and section 7 volume test (295 seconds); DEC-0067 | The build timeout equals the whole AC-11 budget and a timed-out set is recorded failed with no retry until the next qualifying run. A store whose build consistently exceeds 300 seconds (load from the API in the same container, growth in history read) never produces a new set; each run adds another failed set | A performance miss becomes a standing outage of classification rather than a late result; the reliability trade-off is the owner's under AGT-SPEC-002 and is surfaced only as "uphold or set another value" | Owner: decide the timeout separately from the AC-11 budget and whether a timed-out build is retried, and state the consequence of each choice in the scheduler design |
| FINDING-11 | MEDIUM | SR-6, SR-4 | capability | capability section 2 factor definitions; AC-7, AC-9, AC-12; system design constraints 7 and 8 and section 8 questions 6, 7, 9; factor-engine section 2.4 (`MC <= 0` extension); DEC-0053; DEC-0055 (2) | The capability does not define "standardised score" (method, sample or population dispersion, zero-dispersion inputs), how growth is treated when the prior-year base is not positive, or a ratio when market capitalisation is not positive; AC-12 names only missing and outdated inputs while the designs add a third status, `not_computable`. All are settled by agent-provisional decisions | Every set writes these choices into append-only history and the backtest at M4 will replay them; a later change cannot rewrite recorded sets (AGT-SCOPE-005) | Owner: before implementation, either uphold DEC-0053 and DEC-0055 (2) with the factor-engine extension and amend capability section 2 and AC-12 to state them, or define them differently in a capability revision |
| FINDING-12 | MEDIUM | SR-9, SR-1 | system design; classification-api; research-store; universe-service; UX design; classification-ui | system design section 8 question 2 and constraint 15; classification-api section 2.4 `MAX_UNIVERSE_NAME_LENGTH` | No artifact bounds the universe name; until the owner answers, the API enforces trimmed and non-empty only | SEC-INP-001 (High severity) requires a maximum length on every external string field; the create and rename routes cannot conform, and the store has no bound either | Owner: state the bound; then the API constant, the field hints and a later additive `CHECK` follow as the designs describe |
| FINDING-13 | MEDIUM | SR-9 | system design; classification-api; classification-ui | system design section 8 question 4; DEC-0064; classification-api sections 2.3 and 14 question 2; classification-ui sections 2.2 and 14 question 7 | Registering CAP-002's routers and scheduler in `src/factorflow/api/app.py`, appending rail destinations and routes in `web/src/app/shell.tsx` and `routes.tsx`, and exporting `requestJson` in `web/src/api/client.ts` edit files owned by delivered CAP-001 components; the reading that this is CAP-002's own work under AGT-SCOPE-002 is an agent's, pending owner confirmation, and both component designs say the editing story is blocked until then | The `app.py` story gates every CAP-002 route and the scheduler, so no end-to-end acceptance test can pass until the owner confirms; the CAP-001 `ingestion-api` and `owner-web-app` designs will then describe four destinations and five routers that no longer match the code | Owner: confirm or replace the reading in section 8 question 4, and say where the changed composition is documented without amending the delivered capability |
| FINDING-14 | MEDIUM | SR-9 | system design; tech-stack | `docs/constitution/tech-stack.md` OQ-TS-3 ("Blocks: Classification and backtest implementation"; resolver "Capability owner, at the system design"); system design section 4.3 and section 8 question 3; DEC-0052 (`decided_by: agent`) | The approved tech stack names the owner as the one who closes OQ-TS-3 and says it blocks classification implementation. The system design closes it provisionally by agent decision and records that "Blocks: nothing" | Implementation planning would proceed against an approved artifact that still records the choice as open and blocking | Owner: uphold or replace DEC-0052 and amend `tech-stack.md` OQ-TS-3 through `$tech-stack` before implementation planning |
| FINDING-15 | MEDIUM | SR-3 | system design | system design 3.1 steps 14 and 25 to 27, constraint 10, section 4.2 rows `GET /api/universes` and "Classification append", section 4.4 `classification_set` writers; classification-scheduler section 14 question 1; DEC-0065, DEC-0066, DEC-0067 | The decomposition added behaviour and contract the system design does not carry: start-up reclaim of an orphaned `building` set and a build timeout (`FACTORFLOW_CLASSIFICATION_BUILD_TIMEOUT_SECONDS`), which makes `classification-scheduler` a second writer of the state transition; a `name` prefix on `GET /api/universes`; `origin`, `run_outcome`, `unknown_symbols`, `min_peer_set_size`; codes `classification_set_not_found`, `cursor_invalid`, `cursor_stale`; a completion `UPDATE` of five columns where 4.2 says "state fields only". The scheduler design itself recommends amending 3.1 and constraint 10 | The system design, which epic generation and test design read first, understates the reliability mechanism and the API contract | Revise the system design to carry DEC-0067 and the contract additions, or record why they stay component-level |
| FINDING-16 | LOW | SR-6 | capability; UX brief; UX design; classification-ui | capability section 2 ("placing a few chosen stocks side by side") and flow 4 step 3; UX design section 7; classification-ui sections 5 and 14 question 1 | "A few" is unquantified; the design bounds Compare at the API's 500 and leaves a lower cap as `[REQUIRES INPUT]` | At 500 columns Compare issues 500 evidence requests and renders a 500-column table; nothing is blocked | Owner: state a cap or confirm 500 |
| FINDING-17 | LOW | SR-5, SR-9 | system design; factor-engine | system design section 4.3 key libraries (`hypothesis`, source "tech-stack v5"); factor-engine section 7 ("both already in the tech stack") | `tech-stack.md` v5 does not list `hypothesis`; it is a dev dependency in `pyproject.toml` since CAP-001-E4-S4 | The conformance claim "only approved technologies" rests on a citation that does not support it | Cite `pyproject.toml`, or have the owner add `hypothesis` to the tech stack |
| FINDING-18 | LOW | SR-3 | system design; classification-ui | system design section 4.2 row `GET /api/instruments` (consumer `classification-ui`, "for picking members"); classification-ui section 11 ("not required by any CAP-002 screen") | A declared interface has no consuming screen | An unused interface appears in the architecture inventory | Remove the row or name the screen that uses it |
| FINDING-19 | LOW | SR-8, SR-3 | UX design; classification-api; universe-service | UX design section 1.3 (Name column "sortable"); classification-api section 11 `GET /api/universes` (no `sort`); universe-service section 2.5 (pages by `created_at`) | The UX design makes the universe list sortable by name; the API offers no sort and pages by creation time | A sort over one loaded page would be silently wrong (STD-UI-30) | Add a name sort to the API and service, or drop sortability from the UX design |
| FINDING-20 | LOW | SR-8 | UX design; UX brief | UX design sections 1.1 (summary "Momentum score above 0.00") and 1.3 (origin line); UX brief section 2.4; reader section 2.5 (`score >= %(..._min)s`) | Copy says "above" for a bound the panel labels "at least" and the server applies inclusively | STD-UI-2: the words describe behaviour the product does not have at the boundary value | Use "at least" and "at most" in the summary and origin lines |
| FINDING-21 | LOW | SR-5 | research-store | research-store section 6 "Rollback" ("the accepted cost the system design section 4.4 names") | System design 4.4 names the dump-and-restore path but no loss of universes; restoring discards universes created after the upgrade, which are owner data no run reproduces | The citation implies an acceptance that is not recorded | Record the cost in the system design or cite where the owner accepted it |
| FINDING-22 | LOW | SR-5 | design decomposition record | commit `12d2ba7` message (R1 to R7 "reported to its owner, none applied"); no artifact in the capability folder | The alignment review's seven recommendations against the system design exist only as a count in a commit message | Neither the owner at approval nor epic generation can see what the decomposition found misaligned; this review could not verify them | Record R1 to R7 in an artifact the owner and later stages read, for example an appendix to the system design's open questions or a decision record |
| FINDING-23 | LOW | SR-3 | classification-api | classification-api section 3 ("covers the new modules the day they exist") against section 7 last row ("Extended to the new modules by the implementing story") for `tests/unit/test_api_isolation.py` and `test_api_no_secrets.py`; DEC-0064 ("No other delivered file is edited by CAP-002") | The design both claims the delivered tests need no change and plans to extend them, which DEC-0064 rules out | A story either edits delivered test files outside DEC-0064 or leaves the new modules unchecked by `test_api_no_secrets.py` | Choose one: new test modules, or an amended DEC-0064 naming the two files |
| FINDING-24 | LOW | SR-3, SR-8 | classification-reader; UX design | reader section 2.3 `StockRow.lifecycle` and section 2.5 scope (live `instrument.lifecycle`); capability AC-15; factor-engine section 2.5 (retired roster at build time) | A stock retired after the current set was built is returned with live lifecycle `retired` beside the set's classified cells until the next qualifying run; no artifact specifies that rendering | The owner sees a retired marker with scores, which AC-15 ("shown in its universes as not classified because it is retired") does not describe | Specify the rendering for this combination, or state that AC-15 applies from the next set |
| FINDING-25 | LOW | SR-5 | seven component designs | `ai_provenance.timestamp` 06:40Z to 07:40Z on 2026-10-16 in all seven; commit `12d2ba7` at 05:51:57Z | Every component-design production timestamp is 48 to 108 minutes after the commit that introduced it | AGT-PROV-001 requires the production timestamp; the recorded times are not it | Correct the timestamps on the next revision |

---

## Traceability Matrix

Per-AC verdict (VER-EVD-004). "Mapped" means the AC traces to system design,
component and, where it has UX implications, UX design elements that would
satisfy it as written.

| AC | System design | Component design(s) | UX design | Verdict |
|----|---------------|---------------------|-----------|---------|
| AC-1 | 3.2 steps 4, 4a; 5.13 | universe-service 2.4, 2.5 `coverage_check.sql`; classification-api 2.5 | 1.3 create dialog | Mapped |
| AC-2 | 3.2 step 3a; 5.14 | universe-service `create_from_filter`; reader `evaluate_filter` | 1.1 Save as universe; 1.4 origin | Mapped |
| AC-3 | 4.2; 4.4 | research-store 2.3; universe-service | 1.3 | Mapped |
| AC-4 | 3.2 steps 8, 11, 12 | universe-service 2.4 | 1.4 | Mapped |
| AC-5 | 3.2 step 7; 5.13 | universe-service 2.4 | 1.3, 1.4 `blocked` | Mapped |
| AC-6 | 4.4; 5.3 | research-store 2.3; universe-service 2.5 | 1.4 History, as-of | Mapped |
| AC-7 | 5.7; 5.8 | factor-engine 2.4, 2.5 | 1.5, 1.6 | Mapped; value and growth not demonstrable until FINDING-2; arithmetic per FINDING-11 |
| AC-8 | 5.5 | factor-engine 2.5; reader 2.5 | 1.1 scope | Mapped |
| AC-9 | 5.7 | factor-engine 2.5; research-store 2.4 | 1.1 | Mapped; method provisional (FINDING-11) |
| AC-10 | 3.1 steps 4 to 7a, 19 to 21; 5.10 | classification-scheduler 2.4 | 1.2 | Mapped with defect (FINDING-1) |
| AC-11 | 3.1 steps 28 to 31 | factor-engine 5, 7 volume; scheduler 2.3 | 1.2 | Mapped with defects (FINDING-1, FINDING-10) |
| AC-12 | 5.6 | factor-engine 2.5; reader | 1.1, 1.5, 1.6 | Mapped with defect (FINDING-4); third status per FINDING-11 |
| AC-13 | 5.6; 5.8 | factor-engine 2.4 currency | 1.6 | Mapped |
| AC-14 | 3.1 steps 9, 11a | factor-engine 2.3 step 6, 2.5 | 1.1 header | Mapped |
| AC-15 | 3.2 step 10; 5.5 | factor-engine 2.5; universe-service | 1.1, 1.4 | Mapped; post-set retirement unspecified (FINDING-24) |
| AC-16 | 3.3 steps 15, 16 | reader 2.5; classification-api 2.4 | 1.1, 1.4, 1.5 | Mapped with defect (FINDING-4) |
| AC-17 | 3.3 step 17 | factor-engine 2.4 `detail`; reader 2.6 | 1.6 | Mapped |
| AC-18 | 4.4 | reader 2.6 history | 1.6 History | Mapped |
| AC-19 | 3.1 steps 22 to 24; 5.4 | factor-engine 3; scheduler `claim_set.sql` | 1.6 | Mapped |
| AC-20 | 3.1 steps 13, 14b, 25 to 27; 5.11 | reader 2.4; classification-ui 2.6 | 1.2 | Mapped with defects (FINDING-3, FINDING-5) |
| AC-21 | 3.3 step 13 | reader 2.4 | 1.2 | Mapped with defect (FINDING-1) |
| AC-22 | 3.3 step 14 | reader 2.4 | 1.1, 1.6 | Mapped |
| AC-23 | 5.9 | factor-engine 2.4, 2.5; research-store | every screen | Mapped; in production only after FINDING-2 |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No finding is CRITICAL: no AC contradicts another, no core requirement is
untestable, and nothing prevents epic generation, story generation or test
design from starting on these specifications. Two HIGH findings exist and
should be resolved before the owner approves the reviewed revisions:
FINDING-1 is a design defect that would write permanent, misattributed sets on
first deployment and is resolved by a design revision; FINDING-2 is the
owner's answer that two of the three factors depend on and that may change the
engine's trailing-twelve-month derivation.

Of the thirteen MEDIUM findings, four await only an owner answer (FINDING-12
name length, FINDING-13 the AGT-SCOPE-002 reading, FINDING-14 OQ-TS-3,
FINDING-10 the timeout) and one an owner choice on the capability's arithmetic
(FINDING-11). The rest are design corrections.

Every schema-versioned specification in scope (the capability, the system
design, the UX brief, the UX design and the seven component designs) remains
`draft` and is blocked from epic generation and test design until the owner
explicitly approves it with `scripts/artifact-gate.py approve`, naming this
report as `--review-artifact`. This review approves nothing. The sixteen
provisional decisions DEC-0052 to DEC-0067 carry `owner_reviewed: false`;
DEC-0053, DEC-0055 and DEC-0056 decide what is written into append-only
history, so the owner's verdict on them matters most before implementation.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-1: decide which runs qualify at first deployment and when several
   are waiting; align the scheduler, research-store and factor-engine sections 6
   and system design 3.1 step 21.
2. FINDING-2: owner to supply the seven line-item keys and confirm quarterly Q4
   statements against real acquired data; revise DEC-0055 (1) if they do not
   exist.

### Should Fix (MEDIUM findings)

3. FINDING-3: define not-current against the latest qualifying run; keep polling until it has a complete set.
4. FINDING-4: give instruments with no row in the current set a stated state and a reader operation for member cells.
5. FINDING-5: product-vocabulary `failure_reason`; detail to the log.
6. FINDING-6: widen the append-only guard to every `.sql` under `src/factorflow/`.
7. FINDING-7: STD-UI-30 `partial` in capability 5.4.
8. FINDING-8: state how C4 is honoured.
9. FINDING-9: extend the decision's `artifacts` to the five citing component designs.
10. FINDING-10: owner decision on the build timeout and retry.
11. FINDING-11: owner to uphold or revise the standardisation and non-positive-base rules in the capability.
12. FINDING-12: owner to state the universe name bound.
13. FINDING-13: owner to confirm the AGT-SCOPE-002 reading and where the composition change is documented.
14. FINDING-14: owner to close OQ-TS-3 in the tech stack.
15. FINDING-15: carry DEC-0067 and the contract additions into the system design.

### Nice to Have (LOW findings)

16. FINDING-16 Compare cap; FINDING-17 `hypothesis` citation; FINDING-18
    unused interface; FINDING-19 universe name sort; FINDING-20 "above" wording;
    FINDING-21 rollback citation; FINDING-22 record R1 to R7; FINDING-23
    delivered test files; FINDING-24 retired-after-set rendering; FINDING-25
    provenance timestamps.

---

## Observations Outside the Review Subjects

- `docs/constitution/standards/ui-conventions.md` (STD-UI v4, approved) pins
  `tech-stack` v2 and `CAP-001-ux-brief` v5 while v5 and v7 are current
  (`check-artifacts.py` warnings). It is a conformance target of this
  capability, not a subject of this review; a `$review-constitution` pass on it
  is the route.
- `projects/factorflow-v2/decisions/DEC-0052.md` to `DEC-0067.md` are
  untracked in the harness checkout at the time of this review.

## Unattended-Run Record

Run as the `$specification-review` step of a `$design-run` driver run,
unattended per `docs/unattended-mode.md`. No question was asked and no
decision was recorded: this review decides nothing and only reports. The Step 6
discussion prompt was skipped. No specification, tech-stack, constitution or
CAP-001 artifact was edited; no approval block was touched. The only write is
this report.
