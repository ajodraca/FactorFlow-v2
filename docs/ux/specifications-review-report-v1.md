---
artifact_schema_version: 1
artifact_id: PRODUCT-UX-specification-review
artifact_type: specification-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-16
updated: 2026-10-16
document: spec-review-report
capability: PRODUCT-UX
version: v1
generated: 2026-10-16T03:09:14Z
constitutions_reviewed:
  - "CONST-AGT  docs/constitutions/agent-governance.constitution.md (2.3)"
  - "CONST-MDL  docs/constitutions/model-management.constitution.md (1.3)"
  - "CONST-OPS  docs/constitutions/operational-safety.constitution.md (1.3)"
  - "CONST-REV  docs/constitutions/review.constitution.md (1.4)"
  - "CONST-SA   docs/constitutions/static-analysis.constitution.md (2.0)"
  - "CONST-SEC  docs/constitutions/security.constitution.md (1.3, in force: content revision sha256:0f5659addf64eb6aff78fcc810f92673f348d7f8d943061cb5ca225fff15b0c7 equals the approval block's reviewed_revision; file identical on origin/main)"
  - "CONST-VER  docs/constitutions/verification.constitution.md (1.2)"
mechanical_checks:
  - script: check-capabilities.py
    outcome: run
    result: "PASSED, exit 0: 2 capabilities, 6 edges, 1 standard, 2 conformance claims, 1 constitution artifact, 2 references; integration layer 0 CAP-001, layer 1 CAP-002; no error, no warning. The blueprint is not a capability node, so no PRODUCT-UX edge is checked"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0: 1 design, 12 components, 16 interfaces (CAP-001 only; the blueprint declares no components)"
  - script: check-artifacts.py
    outcome: run
    result: "Project-wide --strict: PASSED with 229 warnings, exit 0, 280 artifacts; no warning names docs/ux. Scoped -a docs/ux --strict: PASSED, exit 0, 1 ux blueprint and 9 ux screen specs, no warning"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0: 1127 path references across 210 Markdown files, all resolve. Harness Markdown only; the subjects' references were checked by hand (see FINDING-25)"
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
  SR-7: "applied — limited to the technical commitments the blueprint makes: route migration, shell and pattern locations, server-side virtualised lists, kill-switch read-back, scoped retry, command palette library, evidence snapshot"
  SR-8: "applied — design_system_available = true (design-system.yaml present; FactorFlow-v2 holds components/, theme.css, component-map.json, intake.md); component mapping, token usage, design source and EDG checks applied to S01 to S09"
  SR-9: "applied — conformance half: §11 against STD-UI v6 rule by rule; dependency half: the blueprint declares no dependency table, check-capabilities.py ran clean on the project"
  SR-10: "not applicable — the blueprint is not a system design and declares no components or interfaces"
specifications_reviewed:
  capability_spec: docs/ux/product-ux-blueprint.md
  system_design: not-provided
  ux_brief: not-provided
  ux_design_spec: docs/ux/screens/
  component_designs: not-provided
review_subjects:
  - artifact_id: PRODUCT-UX
    artifact_version: 3
    content_revision: sha256:2940b8949c5fac8974bc3c107a919b7fd4bf74feb58e92c7ffa4b6a9ee324879
  - artifact_id: PRODUCT-UX-S01
    artifact_version: 1
    content_revision: sha256:eee8f46fe89399b0c2d5f75f6b94e8826d773e0897eea88e024bd7c8200bfc33
  - artifact_id: PRODUCT-UX-S02
    artifact_version: 1
    content_revision: sha256:4ebdd0a496e489802304ab0e612d97c86587345bace5645ac1c0ae5fe356531d
  - artifact_id: PRODUCT-UX-S03
    artifact_version: 1
    content_revision: sha256:ab0ac2718431271c8f0fdbff2c99854aaabaea865a1d95f8f482e1be6e94ee8b
  - artifact_id: PRODUCT-UX-S04
    artifact_version: 1
    content_revision: sha256:aff8f505dbb879f320902e8174770e4caf956689070daf0d229c8da41849958f
  - artifact_id: PRODUCT-UX-S05
    artifact_version: 1
    content_revision: sha256:9de31450a6ee3ad801b46f7fd51d1b8fa78637e6998a8550752cd5fa8b3fb92a
  - artifact_id: PRODUCT-UX-S06
    artifact_version: 1
    content_revision: sha256:32b5195cea3e50223373f87c62de480eb2284b1368a1e8e56d267643ac33f6e5
  - artifact_id: PRODUCT-UX-S07
    artifact_version: 1
    content_revision: sha256:1a3db75f460322fe55373a40a246929dc4f4ebe8805685c778b6479d23d65c3d
  - artifact_id: PRODUCT-UX-S08
    artifact_version: 1
    content_revision: sha256:54f79c5ccb0e0be2d3bfea083afe1aad0f044299d34a6a1901f6df0188bc5041
  - artifact_id: PRODUCT-UX-S09
    artifact_version: 1
    content_revision: sha256:dab126e2cafb854582c6f139958024f098b7eaca5a81ed3138d04a8be5fc5494
statistics:
  total_findings: 50
  critical: 0
  high: 9
  medium: 27
  low: 14
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.301"
  timestamp: 2026-10-16T03:09:14Z
  source_artifacts:
    - id: PRODUCT-UX
      version: "3"
    - id: PRODUCT-UX-S01
      version: "1"
    - id: PRODUCT-UX-S02
      version: "1"
    - id: PRODUCT-UX-S03
      version: "1"
    - id: PRODUCT-UX-S04
      version: "1"
    - id: PRODUCT-UX-S05
      version: "1"
    - id: PRODUCT-UX-S06
      version: "1"
    - id: PRODUCT-UX-S07
      version: "1"
    - id: PRODUCT-UX-S08
      version: "1"
    - id: PRODUCT-UX-S09
      version: "1"
    - id: STD-UI
      version: "6 (approved 2026-10-16, context)"
    - id: product-charter
      version: "2 (approved, context)"
    - id: tech-stack
      version: "5 (approved, context)"
    - id: CAP-001
      version: "8 (approved, context)"
    - id: CAP-002
      version: "1 (draft, context)"
    - id: CAP-001-ux-design
      version: "5 (context)"
    - id: factorflow-design-system
      version: "18 component specs as of 2026-10-15 (context, read-only)"
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
---

# Specification Review Report -- PRODUCT-UX

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | PRODUCT-UX (product UX blueprint, Product UX Scope of `$specification-review`) |
| **Version** | v1 |
| **Specifications Reviewed** | `docs/ux/product-ux-blueprint.md` (PRODUCT-UX v3) and nine screen specifications `docs/ux/screens/S01-home.md` to `S09-data-health.md` (PRODUCT-UX-S01 to S09, v1 each) |
| **Total Findings** | 50 (0 CRITICAL, 9 HIGH, 27 MEDIUM, 14 LOW) |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

CRITICAL 0 · HIGH 9 · MEDIUM 27 · LOW 14 · **total 50**.

The blueprint is structurally complete and mechanically clean: every template
section is present, the nine screens match the §5 table one to one, every screen
lists all eight states, every component variant it names exists in the design
system, every token it names resolves in `theme.css`, and the five scripts pass.
The findings are in what the documents say, not in their shape.

Three groups carry the HIGH findings:

- **Ownership and traceability (FINDING-1, 3).** The M1 row hands new screens to
  CAP-001 as "restyle only", and S03 claims a CAP-002 criterion it gives the
  owner no way to meet.
- **Contradictions on the money path (FINDING-7, 8, 9).** What a rules edit does
  to a running strategy, what the daily-loss limit stops, and how trading
  resumes in M2 after D-7 are each specified two incompatible ways or not at
  all.
- **Normative or behavioural misstatements (FINDING-2, 4, 5, 6).** S09's retry
  buttons describe an API no capability has; §7 redefines a STD-UI-1 label and
  copy uses *promotion*; S01 describes classification behaviour CAP-002 forbids;
  S03 drops the STD-UI-17 mark from the list.

**Verdict:** READY-WITH-WARNINGS. No CRITICAL finding; nine HIGH findings. The
verdict passes the approval gate mechanically (`artifact-gate.py` treats
READY-WITH-WARNINGS as passing), but CONST-AGT's enforcement section says HIGH
violations are resolved before gate passage. The recommendation is to fix the
nine HIGH findings and re-review before approving any of the ten artifacts.

## Review Scope

**Subjects (10), read in full at the revisions in `review_subjects`.** Project
repo `repos/factorflow-v2/FactorFlow-v2` (symlink to `/home/claude/factorflow-v2`),
branch `usr/alvaro-de-jodra/product-ux-blueprint`, head `5a2ba51`, working tree
clean. Harness at `/home/claude/ai-agents`, branch
`usr/alvaro-de-jodra/product-ux-artifact-types`, head `ad589c0`.

**Upstream read in full or in the parts the subjects cite:**

- `docs/constitution/standards/ui-conventions.md` (STD-UI v6, approved, all 30
  rules). The charter and tech stack live at `docs/constitution/product-charter.md`
  and `docs/constitution/tech-stack.md`, not under `docs/` directly.
- `docs/constitution/product-charter.md` v2 (approved) in full.
- `docs/capabilities/CAP-001-.../Capability-CAP-001.md` v8 (approved): scope,
  flows, all 26 ACs, §5, §6, §7. CAP-001 `design/ux-design.md` v5 (status region,
  run outcome badges), `component-design-ingestion-api.md` (endpoints, run
  request), `component-design-runtime-config.md` (credential handling).
- `docs/capabilities/CAP-002-.../Capability-CAP-002.md` v1 (draft) in full.
  CAP-002 has no `design/` directory.
- `design-system/`: `design-system.yaml` resolution, all 18 component specs'
  variant tables, the badge, button, chart and dialog specs in full, `intake.md`,
  `theme.css` tokens.
- `docs/ux/design-source/` README, and the visible text of `P04-Strategies.dc.html`
  and `P09-Data.dc.html` to verify S04 §11 and S09 §11.
- Shipped code where a subject claims to migrate or reuse it: `web/src/app/routes.tsx`,
  `web/src/app/status-region.tsx`, `web/src/screens/runs/outcome-badge.tsx`,
  `web/src/screens/instruments/parse-bulk-symbols.ts`.
- Derived state: `pipeline-state.py status --capability CAP-001` (release-readiness
  RESUME) and `docs/releases/CAP-001-release-v1.md` (NOT-READY).

**Not available:** no capability UX brief or UX design exists yet for PRODUCT-UX
(the type has none), CAP-002 has no design artifacts, and the canvas page itself
is private; its mirrored sources were used.

**Mapping to the template's `specifications_reviewed` fields**, as the Product UX
Scope prescribes: `capability_spec` is the blueprint, `ux_design_spec` the
screens directory, the rest `not-provided`.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | Template sections in the blueprint (§0 to §14) and in each screen (§1 to §11); §5 table against `screens/` (9 and 9); eight states per screen (8 in each, counted); reasons for inapplicable states; acceptance checks present (4 to 7 per screen) |
| SR-2 Correctness | applied | Each screen against the blueprint's shell, status map, action tiers and vocabulary; screens against each other; flows checked for impossible states per milestone |
| SR-3 Consistency | applied | Routes, milestones, labels, entities and decisions across blueprint, screens, charter, CAP-001, CAP-002, STD-UI v6 and the shipped CAP-001 shell; each mismatch raised as CROSS-SPEC-INCONSISTENCY |
| SR-4 Testability | applied | All 49 acceptance checks (S01-1 to S09-5) read for an observable outcome |
| SR-5 Traceability | applied | Each §10 row against a charter milestone (all six resolve) and each named capability against its specification; each AC a screen cites against the cited AC's text |
| SR-6 Clarity | applied | Vague modifiers, undefined references, unquantified or unsourced values, open-ended lists, truncated copy |
| SR-7 Feasibility | applied — limited to the blueprint's technical commitments | Route migration against `routes.tsx`; scoped retry against CAP-001's run API; virtualised list and command palette against tech-stack v5; kill-switch read-back against STD-UI-21 |
| SR-8 UX Completeness | applied | `design_system_available = true`. Every component/variant in the ten documents against the variant tables (all exist); tokens against `theme.css` (all resolve; `--surface` correctly stated as not a token); design source references (S01 to S09 resolve; CAP-002 pages do not); EDG via STD-UI §1.2, which makes STD-UI the project's EDG constitution, plus the `edg-compliance` checklist |
| SR-9 Dependencies and Conformance | applied | §11 against STD-UI v6, rule by rule (see the Traceability Matrix); dependency half: no dependency table in the blueprint, `check-capabilities.py` clean |
| SR-10 Architectural Vocabulary | not applicable — the blueprint is not a system design | It declares no components or interfaces; view-model "services" are named as future sources, not as a design |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run — PASSED, exit 0, no error or warning | none |
| `build-architecture.py -p factorflow-v2` | run — PASSED, exit 0, 1 design, 12 components, 16 interfaces | none (SR-10 not applicable) |
| `check-artifacts.py -p factorflow-v2 --strict` | run — PASSED with 229 warnings, all stale upstream pins in CAP-001 stories, tests and changes; none in `docs/ux` | none |
| `check-artifacts.py -p factorflow-v2 --strict -a docs/ux` | run — PASSED, exit 0, 10 artifacts, no warning | none |
| `check-references.py` | run — PASSED, 1127 references in 210 harness Markdown files | none; the subjects are outside its scope, so FINDING-25 was found by hand |
| `check-constitutions.py` | run — PASSED, 10 constitutions, 36 skills | none |

The prerequisite gate (`check-prerequisites.sh --project factorflow-v2`) passed
this session before any step ran.

## Constitutions Applied

The relevance matrix assigns `specification-review` seven harness constitutions.
All seven were read in full this session.

| Constitution | What it produced in this review |
|--------------|---------------------------------|
| CONST-AGT 2.3 | AGT-SCOPE-002 (FINDING-1), AGT-AUTH-002 decisions surfaced rather than left to implementation (FINDING-7, 8, 14), AGT-SPEC-002 security concern surfaced without judging its severity (FINDING-35), AGT-EVIDENCE-002 sourced quantities (FINDING-34), AGT-PROV-001 provenance of the subjects (FINDING-48) and of this report. AGT-SCOPE-004 not engaged: the charter is not a subject and names no capability |
| CONST-REV 1.4 | REV-STG-001: this report covers spec compliance (SR-3, SR-5, SR-9 and the CAP and STD-UI matrices) and artifact quality (SR-1, SR-2, SR-4, SR-6, SR-8) as separate stages. REV-AGT-001: the subjects are agent-drafted and were held to the full bar |
| CONST-VER 1.2 | VER-EVD-001: every script ran in this session and its output is recorded. VER-EVD-004: per-rule verdicts for STD-UI-1 to 30 and per-decision verdicts for D-1 to D-7 are in the Traceability Matrix |
| CONST-SA 2.0 | SA-MD-001 template structure (FINDING-46), SA-MD-002 cross-references (FINDING-25), SA-MD-003 placeholder text (FINDING-43) |
| CONST-SEC 1.3 | In force (revision verified). The subjects never render the provider key (S02-4, S09-4; SEC-SEC-001, CAP-001 AC-13 respected). Capital-at-risk actions on the unauthenticated loopback interface are surfaced as FINDING-35. New state-changing routes (kill switch, go live) fall under the existing SEC-ENC-001 (H9) Origin obligation of the browser-to-API channel; that is a system-design matter for M2/M5/M6, not a blueprint finding |
| CONST-OPS 1.3 | No destructive operation in this review; the only write is this report. OPS-ERR-001: the kill-switch failure path is specified (toast naming operation, resource, reason). OPS-MIG-003: the route migration states a one-release redirect, which is the rollback posture for that change |
| CONST-MDL 1.3 | Exact model identifiers in the subjects' provenance (`claude-opus-5-5`) and in this report's |

Project constitution in scope: STD-UI v6 (approved, the standard under SR-9),
the product charter v2 and the tech stack v5.

---

## Findings by Specification

### Capability Specification (mapped: product UX blueprint, `product-ux-blueprint.md`)

#### Architectural Vocabulary (SR-10)

Not applicable: the blueprint is not a system design. It names view-model
sources ("strategy service", "promotion service") as future owners, which is
appropriate for a product-level UX document.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py`: no error, no warning; the blueprint is not a capability
node and declares no dependency table, so the dependency half has nothing
further to check.

Conformance to STD-UI v6, rule by rule (full table in the Traceability Matrix):
13 rules pass, 2 pass from M2 where they apply, 5 are partial, 9 fail as
written, and 1 is not applicable. The failures and partials:

- FINDING-4 (HIGH) STD-UI-1: §7 redefines *coverage* as *data*; *promotion*
  appears in user copy on four screens.
- FINDING-6 (HIGH) STD-UI-17: the restated mark is removed from list
  presentations.
- FINDING-16 (MEDIUM) STD-UI-8 / 12: tier shapes reused across tiers; a state
  with no shape.
- FINDING-17 (MEDIUM) STD-UI-25, FINDING-18 (MEDIUM) STD-UI-28, FINDING-19
  (MEDIUM) STD-UI-18, FINDING-20 (MEDIUM) STD-UI-5, FINDING-21 (MEDIUM)
  STD-UI-29, FINDING-22 (MEDIUM) STD-UI-30.
- FINDING-2, 5, 24 under STD-UI-2 (words describe behaviour).
- FINDING-27 (MEDIUM) and FINDING-40 (LOW) STD-UI-19 / 11 / 21 table precision.
- FINDING-35 (MEDIUM) CONST-SEC SEC-AUTH-001 posture, surfaced.

No specialization is declared in §11, so specialization legality has nothing
to judge; the issue throughout is claim support. Several cells read as verified
where the screens do not support them (STD-UI-17, 18, 28, 29, 30).

#### Completeness (SR-1)

All fifteen template sections are present. Gaps in content: FINDING-13 (Settings
sections claimed but not specified), FINDING-15 (status map incomplete),
FINDING-25 (five M1 routes without spec or resolvable source), FINDING-27
(untiered actions), FINDING-39 (routes and redirect targets), FINDING-46
(template drift).

#### Correctness (SR-2)

FINDING-7, 8, 9 (HIGH), FINDING-10, 36 (MEDIUM), FINDING-41, 44 (LOW).

#### Testability (SR-4)

The blueprint carries no acceptance checks by design (template: "The blueprint
designs; capabilities specify"). Screen checks are covered below.

#### Clarity (SR-6)

FINDING-34 (MEDIUM), FINDING-38, 43 (LOW).

### System Design Specification

Not provided -- skipped. The Product UX Scope has no system design.

### Component Design Specifications

Not provided -- skipped.

### UX Brief

Not provided -- skipped. Capability UX briefs will cite this blueprint.

### UX Design Specification (mapped: screen specifications S01 to S09)

**SR-8 component mapping.** Every component and variant named in §4 of each
screen and in the blueprint exists: `badge` (status-*, coverage-*, paper,
real-money, secondary), `button` (default, outline, ghost, blocked,
kill-switch), `card` (default, metric, summary, chart), `chart` (line with
period bands, sparkline), `checkbox` (default, acknowledgement), `command`
(dialog), `data-table` (compact, virtualised, holdings, history), `dialog`
(standard, confirm, real-money), `input` (numeric, percentage, currency),
`progress` (determinate, indeterminate, meter), `radio-group` (default, cards),
`select` (inline), `stepper` (horizontal, vertical), `textarea` (list,
autosize), `toast` (error), `toggle-group` (single, environment). Gaps not
recorded as COMPONENT-SPEC-GAP: FINDING-28. Uses that conflict with a
component's own contract: FINDING-26 (`dialog` `real-money`), FINDING-29
(`badge` content), FINDING-9 (real-money dialog for paper).

**SR-8 tokens.** Every `--token` in the ten documents resolves in
`design-system/theme.css`; `--surface` is correctly stated not to be one. Size
literals outside the theme: FINDING-21.

**SR-8 design source.** S01 to S09 cite their mirrored `P0n` source, and each
resolves. S04 §11 ("None beyond §2") matches P04. S09 §11 ("None in content")
does not match P09 (FINDING-5). The CAP-002 pages have no source (FINDING-25).

**SR-8 EDG.** Under STD-UI §1.2, STD-UI is the project's EDG constitution, so
the §11 table is the EDG record and no separate checklist is required by the
screen template. The `edg-compliance` checklist was still walked: success
feedback for non-visible operations (FINDING-42), keyboard operation
(FINDING-28, 42), state definitions (FINDING-37).

**SR-4 testability of the 49 acceptance checks.** All are observable except
S08-5, whose separation is unquantified (FINDING-49). S05-1 and S06-3 are
implementation properties, checkable by contract test.

**Per-screen findings.**

- S01: FINDING-4, 5 (HIGH); 18, 20, 32 (MEDIUM); 41 (LOW).
- S02: FINDING-30, 31, 17 (MEDIUM); 43, 46 (LOW).
- S03: FINDING-3, 6 (HIGH); 22, 23, 24, 25, 20 (MEDIUM); 42, 45 (LOW).
- S04: FINDING-7 (HIGH); 10, 11, 12 (MEDIUM); 39, 46 (LOW).
- S05: FINDING-6, 7 (HIGH); 34 (MEDIUM); 42 (LOW).
- S06: FINDING-16, 17 (MEDIUM); 37, 50 (LOW).
- S07: FINDING-4, 8 (HIGH); 26, 36, 17 (MEDIUM); 37, 44 (LOW).
- S08: FINDING-4, 8, 9 (HIGH); 26, 27 (MEDIUM); 38, 42, 49 (LOW).
- S09: FINDING-2, 5 (HIGH); 19, 27, 32 (MEDIUM); 38 (LOW).

### Cross-Specification Consistency (SR-3)

Consistent and verified:

- **Routes.** §2.1, §2.2, §5 and each screen's `route` agree. The migration in
  §2.2 matches `web/src/app/routes.tsx` (`/coverage`, `/instruments`, `/runs`,
  `/runs/:runId`, `/settings`).
- **Milestones.** Every first-milestone value in §2.2 matches the screen's §2
  table, including the setup step-5 deferral, the S08 live tab and S06/S07.
- **D-2.** Consistent across §10 M2, S09 §2 and S09 §11.
- **D-4 and D-5.** S07 captures a rationale; environment tokens are always
  paired with words (S01-2, S04-2).
- **Run outcomes.** §7 and §8 match STD-UI-1 v6 and STD-UI-12's mapping.

Mismatches, each a CROSS-SPEC-INCONSISTENCY: FINDING-1, 2, 3, 4, 5, 7, 8, 9
(HIGH), FINDING-11, 12, 14, 15, 16, 23, 24, 31, 32, 33 (MEDIUM), FINDING-38
(LOW).

---

## Findings Summary Table

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-5 (CONST-AGT AGT-SCOPE-002) | Blueprint | `product-ux-blueprint.md:506` (§10 M1 CAP-001 row); `:158-162` (§2.2 "shipped CAP-001 routes") | §10 assigns to "CAP-001 (shipped)" as "Restyle only" new work: the S02 setup flow (five steps, new), S09 Data health (a new screen with scoped retry and symbol correction), the `/data/*` route migration and the label changes. CAP-001 v8 (approved) has no acceptance criterion for any of them. CAP-001 is also not delivered by the pipeline's own state: `pipeline-state.py status` reports release-readiness RESUME and `docs/releases/CAP-001-release-v1.md` is NOT-READY, so "shipped" is unverified | If CAP-001 is treated as delivered, AGT-SCOPE-002 forbids sending this work back to it; if it is not, CAP-001 needs a new version and re-review first. Either way no capability owns S02 or S09, and a UX brief claiming the row has no AC to trace to | Owner decides which capability owns S02, S09 and the migration (the new shell capability, or CAP-002 while in flight) and the row is rewritten; replace "shipped" with the actual state or cite the release evidence that makes it true |
| FINDING-2 | HIGH | SR-3 / SR-7 (STD-UI-2) | S09 | `S09-data-health.md:61-64`, `:102-106`, `:128`; blueprint `:506` | S09 is "built on CAP-001's API" in M1, but **Retry {SYMBOL}** and **Retry the {n} that failed** "start a download scoped to the failed stocks and data types", and **Correct symbol** stops following one symbol and follows another "in one step". CAP-001's `POST /api/acquisition-runs` takes no scope (`component-design-ingestion-api.md:183-195`; AC-25 fixes a run's scope to the active roster at start) and `/api/instruments` offers only separate add and retire. The copy "Retrying is safe; only the missing piece is fetched" describes behaviour no specified API has | M1 either builds acquisition API behaviour no capability specifies, or ships buttons whose labels misstate what they do (STD-UI-2, specialization none) | Specify scoped runs and the combined correction in an owning capability with ACs, or change S09 to what CAP-001 provides (Download now over the followed list; separate Stop following and Follow) with copy that says so |
| FINDING-3 | HIGH | SR-3 / SR-5 | S03 | `S03-research.md:42`, `:49-60`, `:115-120` | S03 §2 claims CAP-002 AC-2 (save a threshold filter's result as a named universe) but offers no such action. **Save screen** stores scope and thresholds, a feature with no CAP-002 AC and close to CAP-002's out-of-scope "universes defined by a standing rule or screen"; **Add to universe…** acts only on checked rows, with no select-all over a result that can reach 3000 stocks. Thresholds are only "Percentile at least" floors, while CAP-002 §2 (`Capability-CAP-002.md:126-131`) requires thresholds "above or below a chosen score or percentile" | CAP-002's "Build a universe from a factor filter" flow and AC-2 cannot be met by implementing S03; saved screens enter M1 without an owning AC | Add "Save these {n} stocks as a universe" to the results header; add below-thresholds and score thresholds, or record the narrowing against CAP-002 (in flight); add a CAP-002 AC for saved screens or remove them |
| FINDING-4 | HIGH | SR-9 / SR-3 (STD-UI-1) | Blueprint, S01, S04, S07, S08 | `product-ux-blueprint.md:421` (§7 coverage row), `:110`, `:411`; `S01-home.md:133`; `S04-strategies.md:123`; `S07-promotion-review.md:127`; `S08-portfolio.md:119` | §7 gives *coverage* the display label **data**. STD-UI-1 v6 lists coverage as "unchanged: the domain term is the display label" and forbids any other synonym or a redefined label. User copy also uses the domain term *promotion*, which STD-UI-1 replaces with review / go live: "ready for a promotion review" (S01), "Settings → Promotion gate" (S04 footer, also §2.2 and §10), "Promoted." (S07), "go live from a promotion review" (S08). §7 still cites v5 and lacks v6's *instrument → stock* | §7 is the vocabulary every capability inherits (§0); capabilities that follow it fail STD-UI-1 at their own review | Remove the coverage → data row; replace every user-visible "promotion" or "Promoted" with review / go live wording; cite STD-UI v6 and add instrument → stock |
| FINDING-5 | HIGH | SR-2 / SR-3 (STD-UI-2) | S01, S09 | `S01-home.md:135`; `S09-data-health.md:152`; `design-source/P09-Data.dc.html` (Factor scores card) | S01's data item says "Their scores stay at yesterday's and are marked that way". CAP-002 reclassifies after a partial run, and under AC-12 and AC-13 (`Capability-CAP-002.md:277-284`) a stock whose price is not from the latest trading day the product holds is not classified on the affected factor: it shows *Incomplete*. The blueprint's §6 (`:398-401`) and principle 5 say the same. The canvas P09 carries the wrong model ("3 stocks held at yesterday's, marked as such") while S09 §11 records "None in content" | Home would describe classification behaviour the product does not have, about data strategies trade from; an implementer copying canvas copy, as the design-source README invites, reproduces it | Rewrite the S01 copy to CAP-002's behaviour (affected scores show as Incomplete until data is complete) and list the P09 Factor-scores sentence as a difference in S09 §11 |
| FINDING-6 | HIGH | SR-9 (STD-UI-17, stricter-only) | S03, S05, Blueprint | `S03-research.md:171-172`, `:61-62`; `S05-builder.md:68-69`, `:92`; `product-ux-blueprint.md:537` | S03 §11 folds the *Possibly restated* mark into the inspector "to keep the table scannable", so a restated percentile renders unmarked in the results table; S05's preview picks list ranking percentiles with no mark. STD-UI-17 requires the mark on the value and on "every presentation derived from it"; it is stricter-only, and STD-UI §4 says a looser capability "does not conform". §11 still claims the mark is "on scores". Rated HIGH, not CRITICAL, because the mark survives one interaction away and S07 requires its acknowledgement at go-live; the owner may raise it under the rubric's stricter-only clause | Every capability starting from S03 or S05 inherits a STD-UI-17 nonconformance on the screens where strategies are formed | Keep a compact mark in the §4.4 factor cell and in S05's picks (shape plus accessible text), or amend STD-UI-17; correct the §11 cell |
| FINDING-7 | HIGH | SR-2 / SR-6 (CONST-AGT AGT-AUTH-002) | S05, S04, Blueprint | `S05-builder.md:96-99`; `S04-strategies.md:135-136`; `product-ux-blueprint.md:484` | S05 says saving a backtested or paper-traded strategy creates a version and "the stepper falls back to Draft for that version"; S04-1 says nothing but the stage's own action changes a stage. Neither says whether a paper or live strategy keeps trading its previous version, stops, or trades the new rules after an autosaved edit, which §9 tiers routine with no confirmation. For a live strategy an edit that takes effect is capital-at-risk | A product decision on the money path is left to implementation, and S04 and S05 contradict each other on what changes a stage | Owner decision recorded in §12: what an edit does to a paper or live strategy (for example, the running version keeps trading and the edit is a draft version that earns its own stages) and how S04 shows a strategy with a running version and a draft; tier "edit the rules of a live strategy" in §9 |
| FINDING-8 | HIGH | SR-2 / SR-3 | Blueprint, S07, S08 | `product-ux-blueprint.md:236-240`, `:468-469`, `:299`; `S08-portfolio.md:58-59`, `:107-109`, `:131`; `S07-promotion-review.md:82` | The daily-loss limit has three incompatible scopes. §3.3 and §8 make a limit stop the trading-wide kill-switch state ("Trading, stopped by a limit"; banner on every route). S08 §6 and §4.3 show it per strategy on the strategy card. S08's summary tile is account-level ("Today's loss vs {n}% daily limit") but its helper says "At {n}% this strategy stops itself", and the S07 dialog says the strategy "stops itself after a {n}% daily loss" | M6, and M2 for the stop state, cannot implement one behaviour; whether one strategy or all trading stops is a capital-at-risk behaviour | Owner decision: per strategy, per account, or both; then align §3.3, §4.3, §8, the S07 dialog and S08's tiles and helper |
| FINDING-9 | HIGH | SR-2 / SR-3 (D-7) | Blueprint, S08 | `product-ux-blueprint.md:508`, `:512`, `:234`, `:489`; `S08-portfolio.md:45`, `:105-106`; `design-system/components/dialog/design-spec.md:37-39` | D-7 ships the kill switch in M2 and S08's Pause ships in M2, but §10 M6 and S08 §2 assign the "resume flow" to M6. The only designed Resume trading confirmation (§3.3, §9) is `dialog` `real-money`, which the dialog spec reserves for real funds and forbids for paper ("must never be styled as real-money"). From M2 to M5 a stop, or a paused paper strategy, has no specified way back | M2 delivers a stop the owner cannot undo, or an undesigned resume | Move Resume trading and resume-a-paused-paper-strategy to M2 with `dialog` `confirm` and the `--risk-paper` badge while nothing is live, switching to `real-money` once a live strategy would resume (M6); update §9, §10 and S08 §2 |
| FINDING-10 | MEDIUM | SR-2 | S04 | `S04-strategies.md:41-46`, `:59-64`, `:73`, `:93`, `:123` | S04 tags only its columns by milestone. In M2 and M3 its Paper card shows "tracking distance from the backtest" (backtests arrive in M4, and D-6 says earlier paper strategies have none), "41 of 60 days toward review", and a footer linking to Settings → Promotion gate, which §10 (`:511`) delivers in M5 | The M2 board renders values that cannot be computed and links to a page that does not exist | Milestone-tag card facts and the footer: M2 and M3 Paper cards show days and since-start only; tracking from M4; gate progress and footer from M5 |
| FINDING-11 | MEDIUM | SR-3 (D-6) | Blueprint, S04, S07 | `product-ux-blueprint.md:286-287`, `:508`, `:561`; `S04-strategies.md:41`, `:139` | D-6 says the stepper shows only stages the product has, yet §10 M2 gives the stepper "Draft · Paper · Live" and S04 a Live column from M2, while Live ships in M6 and S04-4 says columns for undelivered milestones are absent. D-6's second half (a paper strategy without a backtest needs one before review) has no rendering: S04's Paper cards offer only **Open**, and S07 assumes a backtest exists | An owner decision applied inconsistently; the not-grandfathered case has no designed path | State that Live is shown from M2 as the destination and reword D-6, or add Live in M6; from M4 give paper strategies without a backtest a "Run backtest" action and notice |
| FINDING-12 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY (D-3) | S04 | `S04-strategies.md:93`, `:123` | D-3 (`product-ux-blueprint.md:558`) defines four gate criteria: minimum paper days, distance from the backtest, benchmark beaten in at least half the market periods, zero rejected orders. S04's `gate` view model carries two, and its footer states two with literal 60 and 2 | The board misstates the owner's gate and cannot render changed settings for the missing criteria | Carry all four criteria in `gate`, template the values from settings, word the footer for four |
| FINDING-13 | MEDIUM | SR-1 / SR-3 | Blueprint | `product-ux-blueprint.md:168-171`, `:491`, `:558` | §2.3 says the promotion-gate and live-limit settings sections "are specified in S07 and S08". Neither screen specifies them, nor D-3's dated record of gate changes. §9 places "Change live allocation or live limits" on S08, which only displays limits | M5 and M6 UX designs have no starting layout for two capital-relevant settings; §9's location is wrong | Specify both Settings sections (controls, dated history, tiers) or state they are designed by the M5 and M6 UX designs; correct §9 |
| FINDING-14 | MEDIUM | SR-5 (CONST-AGT AGT-AUTH-002) | Blueprint | `product-ux-blueprint.md:505`, `:507`, `:44-50` | The M1 CAP-002 row assigns S01 Home (an attention service and the data card) to CAP-002, whose scope and 23 ACs contain no home screen or attention items. The "Shell rework" row reads "new, small; or folded into CAP-002", leaving the shell's owner undecided, while the status note says every decision is decided | M1's shell and home have no owning capability; a UX brief cannot claim an "or" | Record the ownership choice as a §12 decision; add CAP-002 ACs (it is in flight) or name the new capability that owns S01 and the shell |
| FINDING-15 | MEDIUM | SR-1 / SR-3 (STD-UI-12) | Blueprint, screens | `product-ux-blueprint.md:436-471`; `S06-backtest.md:44`; `S04-strategies.md:59`; `S08-portfolio.md:108-112`, `:121-122`; `S09-data-health.md:119`; `S01-home.md:122`; `S02-setup.md:71`, `:88`; `S05-builder.md:44-45` | §8 claims to map every status rendered, but omits: backtest states (complete, running, failed, superseded version); S04's *Limit hit* and *LIVE*; S08's *Near limit*, *At limit*, *Price from {date}* and *Not current*; S09's check tiers and *Not current*; *Can't read account* (S01, S08); S02's *Missing* (§8 says *Not connected* or *Rejected*); S05's *Draft · saved* | Capabilities inherit untiered statuses; STD-UI-12's verification needs each in a tier table | Add each to §8 with one tier, label and shape; reconcile S02's *Missing* with §8 |
| FINDING-16 | MEDIUM | SR-3 / SR-9 (STD-UI-8, STD-UI-12) | Blueprint, S06 | `product-ux-blueprint.md:437-439`, `:293-294`, `:216`, `:218`; `S06-backtest.md:74`; `web/src/screens/runs/outcome-badge.tsx:53-62` | §8 fixes one shape per tier, but §4.3 gives the neutral *Backtested* badge a filled circle (the good tier's shape), S06 maps the restated mark to `status-neutral` with a diamond (serious's shape, also the live chip's), and §3.2's *NO TRADING YET* has "no shape", although STD-UI-8 and 12 require one for a state. §8's shapes for active, good and critical (ringed dot, filled circle, square) differ from CAP-001's shipped tier icons (filled circle, check, cross), with no migration recorded | In greyscale a neutral badge reads as good and a neutral mark as serious; the restyle silently changes shipped icons | One shape per tier, never reused across tiers or channels; give *NO TRADING YET* the neutral shape; record the icon change in the M1 restyle or align §8 with the shipped set |
| FINDING-17 | MEDIUM | SR-9 (STD-UI-25) | Blueprint, S02, S06, S07, S09 | `S02-setup.md:74`; `S06-backtest.md:99`; `S09-data-health.md:108-109`; `S07-promotion-review.md:124-126`; `product-ux-blueprint.md:131-132`, `:208-223`, `:262` | Polled regions with no displayed last-updated time: S02 step-4 progress (10 s), S06 backtest progress (5 s), S09 running download (10 s). Polled regions with no recorded cadence: S07's evidence-change detection, and the shell's environment chips, trading state and nav count chips (only the unreachable state shows "as of {time}") | STD-UI-25 unmet for the shell and four regions; the shell's trading-state freshness is the kill switch's visible state | Add *checked {time}* to each polled region; record cadences for the shell regions and S07 |
| FINDING-18 | MEDIUM | SR-9 (STD-UI-28, stricter-only) | S01, Blueprint | `S01-home.md:72-73`, `:145-146`; `product-ux-blueprint.md:548`, `:147` | S01's sparklines state no measure, units, as-of or n, and their table equivalent is said to live "on the strategy page", which no screen specifies: `/strategies/:id` only "redirects to the page for its current stage", and no screen holds a 30-day daily table | §11's STD-UI-28 claim is unsupported | Name measure, units, as-of and n in the column header or accessible name; specify the table the row links to |
| FINDING-19 | MEDIUM | SR-9 (STD-UI-18, stricter-only) | S09, Blueprint | `S09-data-health.md:56-59`, `:131`; `product-ux-blueprint.md:538` | Only *Daily prices* has a coverage statement, and it is shown on `/data/coverage`, not alongside the result. *Company financials*, *Factor scores* and *Live prices* carry none. STD-UI-18 requires the statement alongside each check's result | Data health's verdict presents the absence of detected problems without its limits | A one-line scope statement under each check card |
| FINDING-20 | MEDIUM | SR-9 (STD-UI-5, specialization none) | S01, S03, Blueprint | `S01-home.md:55`, `:130`; `S03-research.md:59`; `product-ux-blueprint.md:342` | S01's `h1` is "{Weekday}, {day} {Month}" ("Thursday, 15 October"), a locale-formatted date. §4.8's example "checked 18:52:14" has no zone. S03's as-of reads "Scores from today 17:46 CDT" rather than an ISO date | Nonconformance with a rule that allows no specialization | ISO dates (for example "Thursday 2026-10-15") and a visible zone on every timestamp |
| FINDING-21 | MEDIUM | SR-9 (STD-UI-29) | Blueprint, screens | `product-ux-blueprint.md:182-199`, `:201-205`, `:274`, `:305`, `:316`, `:333`, `:549`; `S02-setup.md:57`; `S03-research.md:50-53`, `:65`; `S04-strategies.md:53`; `S05-builder.md:46`, `:65`; `S08-portfolio.md:83` | §11 claims "Only theme tokens", but the documents fix about twenty size literals that no token defines: the 208 px rail, 1180 px cap, panes of 300-340, 220-250, 260-300 and 360-420 px, elements of 22, 52, 56, 28 and 80 px, a 720 px stepper, `minmax(220px, 1fr)`, and breakpoints at 768, 1024, 1279 and 1140 px. `theme.css` defines spacing, type and row-height tokens only | STD-UI-29's verification ("no spacing, size or colour literal appears outside the theme") fails as written | Add layout tokens to `theme.css` through its own decision and cite them, or amend STD-UI-29 to exempt layout widths and breakpoints |
| FINDING-22 | MEDIUM | SR-9 (STD-UI-30) | S03, Blueprint | `S03-research.md:49-57`; `product-ux-blueprint.md:550` | The Research list can reach 3000 rows; S03 gives it filters but no search, while §11 claims search and filter. The command palette is not the list's search | STD-UI-30 unmet on the main research list | Add server-side symbol and name search to the Filters pane |
| FINDING-23 | MEDIUM | SR-3 / SR-5 | S03, Blueprint | `S03-research.md:102`, `:73-75`, `:59`; `product-ux-blueprint.md:302-312`, `:422`, `:454` | CAP-002 branches with no S03 rendering: AC-15 retired stocks (the view model has a `retired` state, §4.4 has three states, §7 limits *Incomplete* to missing or outdated input); AC-20's failure branch (*Score update failed* with its reason); and AC-21's "which acquisition run they reflect", shown only in the not-current banner | CAP-002's UX design starting from S03 misses three ACs | Render retired as *Incomplete* with the reason (and widen §7); add a failure banner; put the download number in the as-of line |
| FINDING-24 | MEDIUM | SR-3 (STD-UI-2) | S03 | `S03-research.md:53-54`, `:142` | "70 means scores better than 70% of followed stocks" and "88 means better than 88% of followed stocks". CAP-002 AC-8 (`Capability-CAP-002.md:266-268`) ranks against actively acquired stocks that qualify on that factor, which excludes incomplete and retired ones | The explanation of the product's main number is wrong | "…better than 70% of the stocks scored on this factor" |
| FINDING-25 | MEDIUM | SR-8 / SR-1 (CONST-SA SA-MD-002) | Blueprint, S03 | `product-ux-blueprint.md:142-144`, `:166-168`; `S03-research.md:171-172` | Stock evidence, compare and universes (five M1 routes) are "CAP-002 page, restyled", "already designed on the CAP-002 canvas pages". CAP-002 has no `design/` directory, the pages are not mirrored in `design-source/`, and S03 §11's "the Marks column from the CAP-002 design" resolves to nothing. These routes carry CAP-002 AC-1, AC-3 to AC-6, AC-17 and AC-18 | Five M1 routes have neither a screen spec nor a resolvable design source | Mirror and cite the CAP-002 canvas pages, or state that CAP-002's UX design designs them; fix the S03 reference |
| FINDING-26 | MEDIUM | SR-8 | S07, Blueprint, S08 | `S07-promotion-review.md:77-84`; `product-ux-blueprint.md:234`, `:489-492`; `S08-portfolio.md:105-106`; `dialog/design-spec.md:35`, `:47`, `:57`, `:88` | The `dialog` `real-money` contract requires an in-dialog checkbox or typed acknowledgement that gates the confirm action, and a title naming the action. S07's dialog has neither (its title is the question "Start live trading {name}?"). Resume trading, changing live allocation or limits, and resuming a paused live strategy specify only "`dialog` `real-money`" with no content | Implementations either break the component contract or invent the acknowledgement | Specify each real-money dialog's title, description and acknowledgement, or record a dialog-spec specialization for S07, whose acknowledgements are on the page |
| FINDING-27 | MEDIUM | SR-1 / SR-9 (STD-UI-19) | Blueprint | `product-ux-blueprint.md:473-492`; `S09-data-health.md:104-106`; `S08-portfolio.md:105-106` | STD-UI-19 requires every action tiered. §9 omits *Correct symbol* (S09; it includes stopping to follow a stock, itself consequential), resuming a paused paper strategy (S08 §6), changing promotion gate settings (D-3), and changing history depth (S02, Settings) | Tiers for these are left to each capability | Add the four rows |
| FINDING-28 | MEDIUM | SR-8 (COMPONENT-SPEC-GAP; STD-UI-24) | Blueprint, S02 | `product-ux-blueprint.md:307-308`, `:221`, `:234`; `S02-setup.md:333-335`; `badge/design-spec.md:46-47` | §4.4 puts the *Incomplete* reason "in a tooltip" on a badge, but no `tooltip` component exists and the badge contract makes badges non-focusable with no hover state, so a keyboard user cannot reach the reason. §3.2's environment chips are links with no component (`badge` is non-interactive). The stopped banner and S02's file input are not routed through `design-system/intake.md` | Undesigned components, one of which blocks keyboard access | Record COMPONENT-SPEC-GAPs for the tooltip (or keep the reason in visible text and the inspector), the environment-chip link and the banner; route the file input through intake |
| FINDING-29 | MEDIUM | SR-8 | Blueprint, screens | `badge/design-spec.md:21`, `:36`, `:74`; `product-ux-blueprint.md:453`, `:466-467`, `:299`, `:309`; `S06-backtest.md:44-45`; `S08-portfolio.md:108`; `S01-home.md:122`; `S07-promotion-review.md:51` | The badge spec forbids text over two words and asks for sentence case without punctuation; `coverage-unknown` must carry the word *unknown*. The blueprint maps multi-word statuses to badges (*Not reflecting the latest download*, *Stopped: daily-loss limit reached at {time}*, *Backtest complete · v{n}*, *Not sent: trading stopped*, *Trimmed by the 8% limit*, *Can't read account*, *Not enough to rank*), and S07 renders *REAL MONEY* | A systematic conflict between the status map and the component it uses | Widen the badge spec's content rule through intake, or pair a short badge with adjacent text |
| FINDING-30 | MEDIUM | SR-2 | S02 | `S02-setup.md:73`, `:114-116`, `:125` | *Add later* lets step 3 continue with zero symbols. Step 4's **Start download** is then refused under CAP-001 AC-24 (409 `no_active_instruments`), and setup completes only once a download has started, so `/` keeps routing to `/setup`. S02 specifies no step-4 rendering for zero stocks | A dead end in first run | Specify step 4 with zero followed stocks: blocked with its reason and a way back to step 3, or setup completing without a download |
| FINDING-31 | MEDIUM | SR-3 / SR-5 | S02 | `S02-setup.md:99`, `:108-110` | `parse` cites CAP-001's `parse-bulk-symbols` for `duplicates` and `rejected[].suggestion`, but that function returns only `{input, normalised, valid}` (`web/src/screens/instruments/parse-bulk-symbols.ts:19-44`). No artifact defines a near miss or how *did you mean BRK.B?* is derived | New behaviour with a wrong source citation | Define the near-miss rule (owner decision) and cite it, or remove suggestions |
| FINDING-32 | MEDIUM | SR-3 | S09, S01 | `S09-data-health.md:119`; `S01-home.md:65`; `Capability-CAP-001.md:127-131`; `Capability-CAP-002.md:281-284` | In M1, S09's Stale state ("as-of predates the latest trading day") and S01's "{n} of {m} stocks current" introduce data staleness. CAP-001 assigns any staleness definition to the capability that keeps data current (M2, under D-2), and S09's definition (the latest calendar trading day) differs from CAP-002 AC-13's (the latest trading day the product holds) | Two definitions of "current" in M1, one owned by nobody | Use CAP-002 AC-13's definition in M1 and add calendar staleness with scheduled downloads in M2, or record an owner decision |
| FINDING-33 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY | Blueprint | `product-ux-blueprint.md:177-199`, `:257-264`; CAP-001 `design/ux-design.md:71`, `:85`, `:691` | CAP-001's approved UX design has a persistent status region on every screen (whether the product answers and how the last run ended, polled at 30 s, its AC-18 trace, and a line reserved for STD-UI-11). The §3 shell has no such region, and §2.2 records only the route migration | The restyle silently removes an approved design element and its AC-18 trace | Keep the region in the shell, or record its removal and where AC-18 is met instead (S09, S01) |
| FINDING-34 | MEDIUM | SR-6 (CONST-AGT AGT-EVIDENCE-002) | S05, Blueprint, S08, S03, S06 | `S05-builder.md:56-60`, `:96`; `product-ux-blueprint.md:467`; `S08-portfolio.md:103-104`, `:110-112`; `S03-research.md:119`, `:121`; `S06-backtest.md:46`, `:99`; `S01-home.md:107` | Quantities with no cited source: S05's rule blanks show [8]% per stock, [2]% cash, [14:45 CT] and [1]% minimum trade without saying whether they are defaults; §8 hardcodes "Trimmed by the 8% limit"; S08's 80% near-limit threshold; S03's compare range 2-6 (with no behaviour for 1 or 7+) and 150 ms debounce; S05's 800 ms autosave; S06's $10,000 base; polling at 60 s, 30 s, 5 min and 5 s | Capital-relevant defaults and thresholds without an owner decision | Mark each an owner decision or `[REQUIRES INPUT]`; state whether S05's values are defaults; template the 8% in §8 |
| FINDING-35 | MEDIUM | SR-9 (CONST-SEC SEC-AUTH-001; CONST-AGT AGT-SPEC-002) | Blueprint | `product-ux-blueprint.md:201`, `:489-492`; `Capability-CAP-001.md:411-415` | The blueprint places capital-at-risk actions (go live, resume trading, change live limits) on the unauthenticated loopback owner interface. CAP-001 §7 leaves open "When must the loopback-only decision be revisited?", noting that "live trading and a kill switch behind the same interface raise the cost of that assumption being wrong". The blueprint neither cites nor resolves it. Surfaced for the owner's security assessment; this review does not judge the risk's severity | A security trade-off carries into M2 and M6 by default | Owner decision before the M2 and M6 UX designs on whether capital-at-risk actions need authentication or another control, recorded and cited in §3 |
| FINDING-36 | MEDIUM | SR-2 | S07 | `S07-promotion-review.md:68`, `:110`, `:150`, `:174-175` | The layout says "Three `checkbox` acknowledgements"; the view model says "the fixed set plus one per mark"; Acknowledgement 2 is labelled "(per mark)" but is one aggregated sentence ("{n} of {m} holdings…"); S07-6 requires one acknowledgement per mark | The acknowledgement count, which the go-live gate depends on, is ambiguous | Choose one per mark or one aggregated statement; align layout, view model, copy and S07-6 |
| FINDING-37 | LOW | SR-1 (STD-UI-23) | S06, S07 | `S06-backtest.md:107`, `:110`; `S07-promotion-review.md:138` | States marked "Not applicable" without the reason STD-UI-23 and the screen template require | Inapplicability cannot be reviewed | Add the reasons |
| FINDING-38 | LOW | SR-6 (STD-UI-1) | Blueprint, S07, S08, S09 | `S08-portfolio.md:47`, `:53`; `S07-promotion-review.md:51`; `product-ux-blueprint.md:218`, `:233`, `:445`, `:244-245`, `:496`; `S09-data-health.md:128` | Label drift: *Paper · practice* (S08) and *REAL MONEY* (S07) against §7's *Paper* and *Live · real money*; *LIVE · n STRATEGY* does not pluralise; *Stopping* names both a download being cancelled (§8) and the kill-switch request in flight (§3.3); "the provider timed out" uses implementation vocabulary that STD-UI-1 lists (timeout); §3.3's copy says "kill switch" | Minor vocabulary inconsistency | Align with §7; use distinct words for the two *Stopping* states; "the provider did not answer" |
| FINDING-39 | LOW | SR-1 | S04, Blueprint | `S04-strategies.md:51-52`; `product-ux-blueprint.md:147` | **Stopped ({n})** opens "the stopped and retired list", which has no route in §2.2 and groups paused, limit-stopped and retired strategies as "Stopped". `/strategies/:id`'s redirect targets for the Paper, Live and Retired stages are not stated | Undefined destinations | Add the route and a stage-to-page map |
| FINDING-40 | LOW | SR-9 (STD-UI-19, STD-UI-11, STD-UI-21) | Blueprint | `product-ux-blueprint.md:488`, `:531`, `:541`, `:505` | §9 adds a fourth tier, "protective", to STD-UI-19's closed set; STD-UI-21 already governs the control. §11 records STD-UI-11 and STD-UI-21 as satisfied by §3.2 and §3.3 without noting that §10 omits both regions in M1 | The conformance table is less precise than the rules | Tier Stop all trading within STD-UI-19's set with STD-UI-21 as governing rule; note M1 inapplicability in §11 |
| FINDING-41 | LOW | SR-2 | Blueprint, S01 | `product-ux-blueprint.md:277-279`, `:388-389`; `S01-home.md:105-106`, `:136` | §4.1's sort order omits the `active` tier, although §6 makes a running download a Needs-you item. S01's Draft item has no explanation sentence (§4.1 requires one or two), its **Run backtest** label implies a mutation while S01 says every action navigates, and the item cannot occur before M4 | Small inconsistencies in the home pattern | Add `active` to the order; give the item a body, a navigational label and an M4 tag |
| FINDING-42 | LOW | SR-1 (STD-UI-24) | S05, Blueprint, S08, S03 | `S05-builder.md:44`; `product-ux-blueprint.md:197`; `S08-portfolio.md:66`; `S03-research.md:117-120` | S05's rename is "click" on the `h1` with no keyboard path; §3.1 specifies no `nav` landmark or `aria-current="page"` for the rail; S08's "Showing {n} of {m} positions" gives no way to see the rest; S03's *Save screen* and *Add to universe…* specify no completion confirmation | Small accessibility and completeness gaps | Specify each |
| FINDING-43 | LOW | SR-6 (CONST-SA SA-MD-003) | S02 | `S02-setup.md:72` | The step-2 plan-limit note ends "A deeper depth is requested as stated…", leaving the user-visible copy unspecified | The implementer writes the copy | Write the full sentence; CAP-001 §6 supplies its content |
| FINDING-44 | LOW | SR-6 | S07 | `S07-promotion-review.md:121-123`, `:137-139` | "Not reachable for a strategy not in Ready for review: route redirects", while §6 handles the gate being no longer met on load and Partial shows *Not yet* rows. Whether Ready for review persists after the gate stops being met is undefined | Routing is ambiguous | State whether the stage is sticky |
| FINDING-45 | LOW | SR-5 | S03 | `S03-research.md:66`, `:106` | The inspector's "memberships and holdings line" and `heldBy[]` cite CAP-002 AC-17, which concerns inputs and their dates; holdings cannot exist before M2 and the line carries no milestone tag | A wrong citation | Cite the M2 strategy source and tag holdings M2 |
| FINDING-46 | LOW | SR-1 (CONST-SA SA-MD-001) | S04, S06, S07, S08, Blueprint, S02 | `S04-strategies.md:37-46`; `S06-backtest.md:38-40`; `S07-promotion-review.md:40-44`; `S08-portfolio.md:39-45`; `product-ux-blueprint.md:564-594`; `S02-setup.md:333-335` | Template drift: §2 of S04, S06, S07 and S08 names milestones but no capability (the template asks for both); §13 does not say why each addition passed intake; S02's file input is recorded in §11 rather than as a COMPONENT-SPEC-GAP in §4 | Minor template drift | Name the capability (or "future: <milestone name>"); add the intake reasoning; record the gap in §4 |
| FINDING-47 | LOW | SR-8 | Blueprint (the design-system changes §13 lists) | `product-ux-blueprint.md:581-586`; `button/design-spec.md:35-36`; `chart/design-spec.md:33-34` | The `button` `kill-switch` and `chart` `sparkline` rows follow a blank line in their variants tables, so Markdown renders them outside the tables | The variants the blueprint relies on read as stray text | Remove the blank lines (a human edit to the design system) |
| FINDING-48 | LOW | CONST-AGT AGT-PROV-001 | Blueprint and S01 to S09 | `product-ux-blueprint.md:19-23`; frontmatter of each screen | All ten subjects record `agent_id: ux-blueprint`, which names no skill or agent in the harness (`.agents/skills`, `.agents/agents`), and `tool_version: unknown`; AGT-PROV-001 requires the tool version | Provenance cannot be traced to a producing agent | Record the producing agent and tool version |
| FINDING-49 | LOW | SR-4 | S08 | `S08-portfolio.md:152` | S08-5 "not adjacent to a routine action without separation" does not quantify the separation; §3 uses `--space-5` | The check is not decidable as written | "…separated by at least `--space-5`" |
| FINDING-50 | LOW | SR-7 | Blueprint, S06 | `product-ux-blueprint.md:577`, `:587-588`; `S06-backtest.md:93`; `docs/constitution/tech-stack.md:97` | The blueprint commits to `command` "on cmdk" and to windowed `virtualised` rows; tech-stack v5's key libraries list neither cmdk nor a virtualisation library. S06 cites a "dataviz hover layer" that no artifact defines | Dependency choices, and their SEC-DEP-003 licence record, are left to implementation | Record the libraries in the tech stack through its workflow; define or drop the hover-layer reference |

---

## Traceability Matrix

### Milestone map against the charter (SR-5)

| §10 row | Charter milestone | Capability named | Exists or future | Verdict |
|---------|-------------------|------------------|------------------|---------|
| M1 Shell rework | M1 Universe & Factors | "new, small; or folded into CAP-002" | Undecided | FAIL (FINDING-14) |
| M1 CAP-001 | M1 | CAP-001 v8, approved | Exists; not released (release-readiness RESUME) | FAIL (FINDING-1) |
| M1 CAP-002 | M1 | CAP-002 v1, draft | Exists; S01 and saved screens not in its scope | FAIL (FINDING-3, 14) |
| M2 | M2 Strategies & Paper Trading | Strategies & paper trading | Future work, named | PASS; content FINDING-9, 10, 11 |
| M3 | M3 Live Market Data | Live market data | Future work, named | PASS |
| M4 | M4 Backtesting | Backtesting | Future work, named | PASS |
| M5 | M5 Promotion Gate | Promotion gate | Future work, named | PASS; content FINDING-13 |
| M6 | M6 Live Trading | Live trading | Future work, named | PASS; content FINDING-8, 9 |

### Owner decisions (VER-EVD-004)

| Decision | Where it should show | Verdict | Evidence |
|----------|----------------------|---------|----------|
| D-1 display labels | §7, all copy | FAIL | §7 diverges from STD-UI-1 v6; *promotion* in copy (FINDING-4) |
| D-2 scheduled downloads from M2 | §10 M2, S09 §2 and §11 | PASS, with FINDING-32 for M1 staleness | `product-ux-blueprint.md:508`; `S09-data-health.md:46`, `:152-154` |
| D-3 gate criteria are owner settings | S04, S07, Settings | PARTIAL | S07 evaluates the settings (`S07:106`); S04 states two of four (FINDING-12); Settings unspecified (FINDING-13) |
| D-4 written rationale | S07 | PASS | `S07-promotion-review.md:68-70`, `:152`, S07-2 |
| D-5 environment tokens outside the region | S01, S04, S08 | PASS | Always with words: S01-2, S04-2, S08 §1 |
| D-6 only shipped stages | §4.2, S04, S05 | PARTIAL | Backtest and Review omitted correctly; Live shown from M2; not-grandfathered case unrendered (FINDING-11) |
| D-7 kill switch in M2 | §10 M2, §3.3, S08 | FAIL | Resume assigned to M6 and specified as a real-money dialog (FINDING-9) |

### CAP-002 acceptance criteria with UX implications

| AC | Where the subjects address it | Verdict |
|----|-------------------------------|---------|
| AC-1 universe by hand | S03 tray *Add to universe…* → *New universe*; universes route (unspecified) | PARTIAL (FINDING-25) |
| AC-2 universe from a filter | Claimed by S03 §2; no action | GAP (FINDING-3) |
| AC-3 to AC-6 several universes, maintenance, no empty universe, membership history | Universes routes, "CAP-002 page, restyled"; §9 tiers | GAP in spec and source (FINDING-25) |
| AC-8 one peer set | S03 helper and footnote misstate the peer set | FAIL (FINDING-24) |
| AC-9 score and percentile | §4.4 percentile in list, standardised score in inspector | PASS |
| AC-12 like-for-like | §4.4 *Incomplete*; contradicted by S01 copy | PARTIAL (FINDING-5) |
| AC-14 enough to rank | S03 Unavailable state, S03-4 | PASS |
| AC-15 retired stocks | No rendering | GAP (FINDING-23) |
| AC-16 compare | S03 sort and floors; compare route | PARTIAL (FINDING-3) |
| AC-17 evidence | S03 inspector, S03-3, evidence route | PASS (route unspecified, FINDING-25) |
| AC-18 classification history | Evidence route only | GAP in spec (FINDING-25) |
| AC-20 previous set while not current | S03 banner; failure branch absent | PARTIAL (FINDING-23) |
| AC-21 currency | As-of time shown; run only in banner | PARTIAL (FINDING-23) |
| AC-22 honest empty state | S03 Empty, never populated | PASS |
| AC-23 restatement mark | S03 inspector, S03-6; absent from list and S05 | PARTIAL (FINDING-6) |

### CAP-001 acceptance criteria with UX implications

| AC | Where the subjects address it | Verdict |
|----|-------------------------------|---------|
| AC-1 named list | S02 step 3; `/data/followed` | PASS |
| AC-2 depth stated | S02 step 2 | PASS |
| AC-7 coverage visibility | `/data/coverage` restyled | PASS |
| AC-8 gap visibility | S09 Daily prices; S09 Unavailable | PASS |
| AC-9 honest outcome | §7, §8, S09-1 | PASS |
| AC-10 failure diagnosis | S09 Needs fixing, S09-2 | PASS (retry semantics FINDING-2) |
| AC-11 unrecognised instrument | S09 *Not found*, S09-3 | PASS |
| AC-13 credential | S02-4, S09-4 | PASS |
| AC-17 honest empty state | S09 Empty, never populated, S09-5 | PASS |
| AC-18 operational visibility | Shipped status region dropped | PARTIAL (FINDING-33) |
| AC-19, AC-26 cancel | §9 *Cancel a download*; downloads routes | PASS |
| AC-21 removal retains history | §9 *Stop following*; S02 info note | PASS |
| AC-22 deepening | S02 step 2 | PASS |
| AC-23 queueing | S09 §6 helper | PASS |
| AC-24 nothing to acquire | S02 *Add later* path | FAIL (FINDING-30) |

### STD-UI v6, rule by rule (VER-EVD-004)

| Rule | §11 claim | Verdict | Evidence |
|------|-----------|---------|----------|
| STD-UI-1 | yes | FAIL | FINDING-4, 38 |
| STD-UI-2 | yes | FAIL | FINDING-2, 5, 24 |
| STD-UI-3 | yes | PASS | Signed returns and scores; fixed precision stated |
| STD-UI-4 | yes | PASS | §4.4; S01-5 and S08-3 never render $0.00 |
| STD-UI-5 | yes | FAIL | FINDING-20 |
| STD-UI-6 | yes | PASS | Full figures in tables and chart labels |
| STD-UI-7 | yes | PASS | One job per palette; risk tokens only with words |
| STD-UI-8 | yes | PARTIAL | FINDING-16 (*NO TRADING YET* without shape) |
| STD-UI-9 | yes | PASS | S06 colour by entity |
| STD-UI-10 | no | NOT APPLICABLE | Binds the theme; no token added |
| STD-UI-11 | yes | PASS from M2 | §3.2, S01-2, S04-2; M1 note FINDING-40 |
| STD-UI-12 | yes | PARTIAL | FINDING-15, 16 |
| STD-UI-13 | yes | PASS | §4.8, S01-6, S03-3 |
| STD-UI-14 | yes | PASS | Three presence states; *Can't read account* never zero |
| STD-UI-15 | yes | PASS | S05 preview labelled as such |
| STD-UI-16 | yes | PASS | Substitutions disclosed (S08 Partial); S01's disclosed carry-forward conflicts with CAP-002 instead (FINDING-5) |
| STD-UI-17 | yes | FAIL | FINDING-6 |
| STD-UI-18 | yes | FAIL | FINDING-19 |
| STD-UI-19 | yes | PARTIAL | FINDING-27, 40 |
| STD-UI-20 | yes | PASS | S07-1 to S07-6; consistency FINDING-36 |
| STD-UI-21 | yes | PASS from M2 | §3.3, S08-2; resume gap FINDING-9 is outside the rule |
| STD-UI-22 | yes | PASS | §4.9, S07-4, S08-5 |
| STD-UI-23 | yes | PARTIAL | Eight states on every screen; reasons missing (FINDING-37) |
| STD-UI-24 | yes | PARTIAL | FINDING-28, 42 |
| STD-UI-25 | yes | FAIL | FINDING-17 |
| STD-UI-26 | yes | PASS | S02 vertical stepper, S02-1, S02-2 |
| STD-UI-27 | yes | PASS | S06-1 |
| STD-UI-28 | yes | FAIL | FINDING-18 (S06 passes, S06-2) |
| STD-UI-29 | yes | FAIL | FINDING-21 |
| STD-UI-30 | yes | FAIL | FINDING-22 |

---

## Pipeline Readiness Assessment

**Verdict: READY-WITH-WARNINGS**

No CRITICAL finding, so the rubric's verdict is READY-WITH-WARNINGS. FINDING-6
was weighed against the rubric's clause that relaxing a stricter-only rule
breaks the standard; it is rated HIGH because the mark is retained one
interaction away and is acknowledged at go-live, which is where STD-UI-17's
authority places the obligation. The owner may judge otherwise, and doing so
would make the verdict NOT-READY.

The nine HIGH findings do not block the pipeline mechanically, but each would
surface again in a capability's own specification review if left:

- FINDING-1, 3: the M1 rows cannot be claimed by a UX brief as written.
- FINDING-7, 8, 9: three money-path behaviours need owner decisions before the
  M2 and M6 UX designs can start from these screens.
- FINDING-2, 4, 5, 6: copy and marks that fail STD-UI-1, 2 and 17.

CONST-AGT (Enforcement) requires HIGH violations to be resolved before gate
passage, and CONST-REV requires re-review after High violations. Fix the HIGH
findings, re-review, and only then approve each artifact separately with
`scripts/artifact-gate.py approve --review-artifact docs/ux/specifications-review-report-v{N}.md`.
This review approves nothing.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-1: decide and record who owns S02, S09 and the route migration;
   correct "CAP-001 (shipped)".
2. FINDING-2: specify scoped retry and symbol correction in an owning
   capability, or reduce S09 to CAP-001's API with honest copy.
3. FINDING-3: give S03 a save-results-as-universe action, below and score
   thresholds, and resolve saved screens against CAP-002.
4. FINDING-4: bring §7 and all copy to STD-UI-1 v6.
5. FINDING-5: rewrite S01's data item to CAP-002 behaviour; list the P09
   difference in S09 §11.
6. FINDING-6: restore the STD-UI-17 mark in list presentations or amend the rule.
7. FINDING-7: owner decision on rule edits to paper and live strategies.
8. FINDING-8: owner decision on the daily-loss limit's scope.
9. FINDING-9: design resume for M2 with a paper-appropriate dialog.

### Should Fix (MEDIUM findings)

FINDING-10 to FINDING-36. Prioritise the STD-UI conformance set (15 to 22, 26 to
29), because every capability inherits it, and the owner decisions (13, 14, 32,
34, 35).

### Nice to Have (LOW findings)

FINDING-37 to FINDING-50.
