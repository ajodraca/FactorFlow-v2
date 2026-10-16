---
artifact_schema_version: 1
artifact_id: PRODUCT-UX-specification-review
artifact_type: specification-review
artifact_version: 4
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-16
updated: 2026-10-16
document: spec-review-report
capability: PRODUCT-UX
version: v4
generated: 2026-10-16T18:11:49Z
constitutions_reviewed:
  - "CONST-AGT  docs/constitutions/agent-governance.constitution.md (2.3)"
  - "CONST-MDL  docs/constitutions/model-management.constitution.md (1.3)"
  - "CONST-OPS  docs/constitutions/operational-safety.constitution.md (1.3)"
  - "CONST-REV  docs/constitutions/review.constitution.md (1.4)"
  - "CONST-SA   docs/constitutions/static-analysis.constitution.md (2.0)"
  - "CONST-SEC  docs/constitutions/security.constitution.md (1.3, in force: content revision sha256:0f5659addf64eb6aff78fcc810f92673f348d7f8d943061cb5ca225fff15b0c7 equals the approval block's reviewed_revision, recomputed this session; file identical on origin/main)"
  - "CONST-VER  docs/constitutions/verification.constitution.md (1.2)"
mechanical_checks:
  - script: check-capabilities.py
    outcome: run
    result: "PASSED, exit 0: 2 capabilities, 6 edges, 1 standard, 2 conformance claims, 1 constitution artifact, 2 references; integration layer 0 CAP-001, layer 1 CAP-002; no error, no warning. The blueprint is not a capability node, and the M1 capability D-8 names is not yet defined, so no edge of either is checked"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0: 1 design, 12 components, 16 interfaces (CAP-001 only; the blueprint declares no components)"
  - script: check-artifacts.py
    outcome: run
    result: "Project-wide --strict: PASSED with 230 warnings, exit 0, 283 artifacts; none names docs/ux. The one warning touching the subjects is upstream of them: STD-UI pins PRODUCT-UX v3, now v6. Scoped -a docs/ux --strict before this report: PASSED, exit 0, 13 artifacts (1 ux blueprint, 9 ux screen specs, 3 specification reviews), no warning. After writing it: PASSED, exit 0, 14 artifacts (1 ux blueprint, 9 ux screen specs, 4 specification reviews), no warning"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0: 1127 path references across 210 Markdown files, all resolve. Harness Markdown only; the subjects' references were checked by hand"
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
  SR-7: "applied — limited to the technical commitments the blueprint makes: route migration, shell and pattern locations, server-side virtualised lists, kill-switch read-back, command palette library, evidence snapshot, the daily-loss limit's measure (D-11), and D-12's sells at the next open through the single order chokepoint and its per-strategy attribution of account positions"
  SR-8: "applied — design_system_available = true (design-system.yaml present; FactorFlow-v2 holds design-system/components, theme.css, component-map.json, intake.md); component mapping, token usage, design source and EDG checks applied to S01 to S09"
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
    artifact_version: 6
    content_revision: sha256:98e19ab089cc064c72f939c58968e29842b3c8de308000f4c854c7d9c120c656
  - artifact_id: PRODUCT-UX-S01
    artifact_version: 4
    content_revision: sha256:65e3245260d015016a2c9b5022e0bf38243f0f4ca34c2c3273cd4e37a5749736
  - artifact_id: PRODUCT-UX-S02
    artifact_version: 4
    content_revision: sha256:22c58f8c9b66ad79dd5fba1728f67756d4c13b1ce559fa589e1e35026394e8e0
  - artifact_id: PRODUCT-UX-S03
    artifact_version: 4
    content_revision: sha256:1563200b2bbbbd33aae8934c8891572fdba6ff84a62aaefcec8f5005c4943a9a
  - artifact_id: PRODUCT-UX-S04
    artifact_version: 4
    content_revision: sha256:f520b54818b8029a73e5181128df603c0a5967ae1cea1b7aa355926446d6aa6f
  - artifact_id: PRODUCT-UX-S05
    artifact_version: 4
    content_revision: sha256:9bc4c1c928c702e695237a0b1e4b234bab288fbc796219d572fdbc5fe0bc68b7
  - artifact_id: PRODUCT-UX-S06
    artifact_version: 4
    content_revision: sha256:fd9b3cff39dbe040cf36460260252ee60fde3d9a53cd544e39a06bf3f80401e2
  - artifact_id: PRODUCT-UX-S07
    artifact_version: 4
    content_revision: sha256:220f10b1fe14b3c6de12f8f95c38791340ef16d72aa4859dac4ecf42a302f603
  - artifact_id: PRODUCT-UX-S08
    artifact_version: 4
    content_revision: sha256:c5b342279e7dd9ea7269f09b9bb21ad22f53d3dc77449190e8293d3184dfdc7d
  - artifact_id: PRODUCT-UX-S09
    artifact_version: 4
    content_revision: sha256:80cd17bf543472046573c09465bd593d25b305cd64e4e2159fa4b2bf481b32c0
statistics:
  total_findings: 64
  critical: 0
  high: 0
  medium: 39
  low: 25
pipeline_readiness: READY
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.301"
  timestamp: 2026-10-16T18:11:49Z
  source_artifacts:
    - id: PRODUCT-UX
      version: "6"
    - id: PRODUCT-UX-S01
      version: "4"
    - id: PRODUCT-UX-S02
      version: "4"
    - id: PRODUCT-UX-S03
      version: "4"
    - id: PRODUCT-UX-S04
      version: "4"
    - id: PRODUCT-UX-S05
      version: "4"
    - id: PRODUCT-UX-S06
      version: "4"
    - id: PRODUCT-UX-S07
      version: "4"
    - id: PRODUCT-UX-S08
      version: "4"
    - id: PRODUCT-UX-S09
      version: "4"
    - id: PRODUCT-UX-specification-review
      version: "3 (previous review, context)"
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
      version: "5 (approved, context)"
    - id: factorflow-design-system
      version: "18 component specs as of 2026-10-16 (context, read-only)"
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
---

# Specification Review Report -- PRODUCT-UX

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | PRODUCT-UX (product UX blueprint, Product UX Scope of `$specification-review`) |
| **Version** | v4 |
| **Specifications Reviewed** | `docs/ux/product-ux-blueprint.md` (PRODUCT-UX v6) and nine screen specifications `docs/ux/screens/S01-home.md` to `S09-data-health.md` (PRODUCT-UX-S01 to S09, v4 each) |
| **Total Findings** | 64 open (0 CRITICAL, 0 HIGH, 39 MEDIUM, 25 LOW): 58 carried from v3, 6 new; 1 v3 finding resolved |
| **Pipeline Readiness** | READY |

CRITICAL 0 · HIGH 0 · MEDIUM 39 · LOW 25 · **total 64**.

**What changed since v3.** One commit, `530875b` on
`usr/alvaro-de-jodra/product-ux-blueprint`, after the v3 report commit
`5843247` (whose subjects were at `73ed956`). It records owner decision D-12
(retiring a strategy: at retire time the owner chooses, with no default, to sell
everything at the next open or to keep the holdings unmanaged), raises the
blueprint to v6 and every screen to v4. Text changed in the blueprint (intro,
§6, §9, §10, §12, §14), S04 (§3 header row) and S08 (§3, §6, §10); S01, S02,
S03, S05, S06, S07 and S09 changed only in frontmatter. The diff
`73ed956..530875b` (10 files, +69 −37) was read line by line, and all ten
subjects were read in full at their current revisions. No upstream artifact
changed since v3 (`git diff 73ed956..HEAD` over `docs/capabilities`,
`docs/constitution`, `design-system`, `docs/ux/design-source` and `web` is
empty), and the harness is at the same head (`ad589c0`).

**v3 HIGH finding: resolved.** v3 FINDING-65 is resolved by D-12, verified
against the text rather than the revision history: **Retire {name}…** is now on
every S08 strategy card (`S08-portfolio.md:66-69`), §9 tiers it consequential
for paper and capital-at-risk with `dialog` `real-money` for live
(`product-ux-blueprint.md:536-537`), §6 states what happens to the holdings on
each path and that the sells go through the ordinary order path, including
while trading is stopped (`:422-432`), §10 assigns it to M2 and M6
(`:553`, `:557`), §12 records the dated decision (`:612`), and S04 points to
S08 (`S04-strategies.md:52-53`). A designed path now ends a live strategy's
real-money positions. "For good" answers whether a retired strategy can be
restored. What D-12 leaves open is MEDIUM or below and is raised as new
findings: whether a draft can be discarded (FINDING-77, the one part of v3
FINDING-65's recommendation D-12 does not answer), and the edges of the two
retire paths (FINDING-74 to 76, 78, 79).

**The 58 MEDIUM and LOW findings v3 left open** were deliberately not
addressed. Each was re-verified at current lines (the blueprint shifted by 12
to 15 lines below §6) and is still open at its v3 severity. Seven are partly
changed or extended by the D-12 commit: v3 FINDING-27 (retiring is now tiered;
two actions still are not), v3 FINDING-68 (S08 §3 now offers **Resume**
instead of **Pause** on a limit-stopped card, which §3.3 and S01 still
contradict), v3 FINDING-72 (the header list's members are now named), and
v3 FINDING-15, 26, 35 and 64, each extended to the retire dialog or its
statuses. v3 FINDING-39 is more pressing: D-12 sends retired strategies to a
list that still has no route or layout.

**New in this round: 4 MEDIUM, 2 LOW (FINDING-74 to FINDING-79).** All are
follow-ons of D-12; none is HIGH under the calibration v1 to v3 used:

- **FINDING-74 (MEDIUM).** Between choosing *Sell everything* and the sells
  settling, the strategy's state is undefined. "Retiring ends a pause or a
  daily-loss stop" read literally lets a paused or limit-stopped strategy
  rebalance before the open. On the day of a stop, that sidesteps the same-day
  block (the class of v3 FINDING-68). Unfilled orders at retire time, the
  retiring badge and the S04 column are unstated.
- **FINDING-75 (MEDIUM).** A retire sell that fails or fills partly leaves a
  position listed nowhere once the card "leaves the page". Pending retire sells
  while trading is stopped are not in the Resume trading dialog, and whether
  they make that dialog `real-money` is unstated.
- **FINDING-76 (MEDIUM).** Kept, unmanaged holdings are specified only as an
  S08 list. Unstated: their relation to the per-stock limit, how they stay
  apart from an active strategy's shares of the same stock, how a broker-side
  sale is seen, and what Home and the shell show when only unmanaged holdings
  remain.
- **FINDING-77 (MEDIUM).** Draft and Backtested strategies, including the copy
  **Edit as a new strategy** makes, can be neither retired nor discarded, while
  §9 tiers that edit `routine` (reversible).
- **FINDING-78, 79 (LOW).** Retire-dialog copy and vocabulary (*Sell
  everything*, the live wording, no recorded label for *Retire* or *Not managed
  by a strategy*); S08's §2, §4, §8 and §10 not updated for the D-12 additions.

**Verdict:** READY. No CRITICAL and no HIGH finding. The 39 MEDIUM and 25 LOW
findings stay open by the owner's choice. Under CONST-AGT Enforcement, Medium
violations are surfaced and logged and do not necessarily block the pipeline.
This review approves nothing. Each of the ten artifacts is approved separately
by the owner with `scripts/artifact-gate.py approve`, citing this report.

## Review Scope

**Subjects (10), read in full at the revisions in `review_subjects`.** Project
repo `repos/factorflow-v2/FactorFlow-v2` (symlink to `/home/claude/factorflow-v2`),
branch `usr/alvaro-de-jodra/product-ux-blueprint`, head `530875b`, working tree
clean before this report. Harness at `/home/claude/ai-agents`, branch
`usr/alvaro-de-jodra/product-ux-artifact-types`, head `ad589c0`, clean. All ten
subjects are `status: draft`; none carries an approval block.

**Upstream read this session, in full or in the parts the subjects cite:**

- `docs/constitution/standards/ui-conventions.md` (STD-UI v6, approved), in
  full: all 30 rules and §1, §2, §4 to §7.
- `docs/constitution/product-charter.md` v2 (approved), in full.
- `docs/constitution/tech-stack.md` v5 (approved): constraints C2, C3, C6, the
  broker-port and order-chokepoint constraints (lines 55-97, 240-317), and a
  search for every library the subjects name.
- `Capability-CAP-002.md` v1 (draft): flows and the ACs the subjects cite
  (lines 190-316). CAP-002 has no `design/` directory.
- `Capability-CAP-001.md` v8 (approved): AC-6, AC-18, AC-23, AC-24, §7 (lines
  220-290, 405-420); CAP-001 `design/ux-design.md` v5 (status region, AC-18
  trace); `web/src/screens/instruments/parse-bulk-symbols.ts` (the parser S02
  cites).
- `design-system/`: resolution per `docs/design-system.md`; the `dialog`,
  `button`, `radio-group` and `badge` specs in full; the variant table of all
  18 specs (every component and variant the subjects name was checked by
  script: 48 pairs, all resolve); every `--token` the subjects name, against
  `theme.css`; `intake.md`.
- `docs/ux/design-source/`: README, and the visible text of P08 (for S08's new
  controls; the canvas has no retire control and no unmanaged-holdings card).
- The harness templates `docs/templates/ux-blueprint.md` and
  `docs/templates/ux-screen-spec.md`, and `.agents/skills/edg-compliance/SKILL.md`
  (checklist, as in v3).
- `docs/ux/specifications-review-report-v3.md` in full, to verify each v3
  finding; the summary tables of v1 and v2, for the regression check.

**Not available:** CAP-002 design artifacts, the M1 capability D-8 names and the
M2 to M6 capabilities (not yet defined), and the private canvas page (its
mirrored sources were used).

**Numbering.** Carried findings keep their identifiers. New findings continue
the sequence after v3's highest, FINDING-73, from FINDING-74. No identifier is
reused. Prior-review identifiers in the status table are written
`v3 FINDING-n` so `check-artifacts.py` does not count them as findings of this
report.

**Mapping to the template's `specifications_reviewed` fields**, as the Product
UX Scope prescribes: `capability_spec` is the blueprint, `ux_design_spec` the
screens directory, the rest `not-provided`. The Product UX Scope has no
capability stage, so `pipeline-state.py` and `get-capability-specifications`
were not run, as the skill directs.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | Counted by script: blueprint §0 to §14 (15 sections, template order); each screen §1 to §11; §5 table 9 rows, `screens/` 9 files, one to one; 8 state rows in every screen; 53 acceptance checks (S01 7, S02 6, S03 7, S04 4, S05 6, S06 5, S07 6, S08 7, S09 5; S08-7 new). New: FINDING-74, 75, 76, 77, 79. Carried: FINDING-15, 25, 27, 37, 39, 42, 46, 61, 66 |
| SR-2 Correctness | applied | Each screen against the shell, status map, action tiers and vocabulary; screens against each other. D-12 walked for paper and live on both paths, from active, paused and limit-stopped states, with and without the kill switch engaged, and for a sell that fails. New: FINDING-74, 75. Carried: FINDING-10, 30, 36, 41, 58, 59, 62, 66, 67, 68 |
| SR-3 Consistency | applied | Routes, milestones, labels, entities, limits and decisions across blueprint, screens, charter, tech stack, CAP-001, CAP-002, STD-UI v6 and the design system. New: FINDING-76. Carried: FINDING-11, 12, 15, 16, 23, 31, 32, 33, 53, 54, 55, 69, 70 |
| SR-4 Testability | applied | All 53 acceptance checks read for an observable outcome. S08-7 is observable except its "never traded by FactorFlow" clause for a stock an active strategy also trades (FINDING-76). Carried: FINDING-49 |
| SR-5 Traceability | applied | Each §10 row against a charter milestone (all resolve) and each named capability (CAP-001, CAP-002 exist; the D-8 capability and M2 to M6 are named future work). D-12 traced to §6, §9, §10, §12, S04, S08 and S01. Each AC a screen cites against its text. Carried: FINDING-23, 45, 60 |
| SR-6 Clarity | applied | Vague modifiers, undefined references, unsourced quantities, untrue copy. New: FINDING-78. Carried: FINDING-34, 38, 43, 44, 63, 70, 71, 72 |
| SR-7 Feasibility | applied — limited to the blueprint's technical commitments | Route migration, virtualised list and command palette against tech-stack v5, kill-switch read-back, evidence snapshot, the D-11 measure. D-12's sells at the next open are ordinary orders through the single chokepoint (tech-stack `:272-274`, `:311-313`), which the text states (`:429-431`); an at-open sell is expressible in the broker port's own vocabulary (`:252-255`). Keeping holdings apart from strategies needs per-strategy attribution of account-level broker positions (`:287-288`), which no subject specifies (FINDING-76). Carried: FINDING-50, 69 |
| SR-8 UX Completeness | applied | `design_system_available = true`. Components and variants checked by script against all 18 specs (48 pairs, all exist); tokens against `theme.css` (all resolve except the documented non-token `--surface` and the family patterns `--risk-*` and `--seq`); design sources S01 to S09 resolve, and S08's §11 was compared with P08's text; EDG via STD-UI §1.2 plus the `edg-compliance` checklist. New: FINDING-79. Carried: FINDING-25, 26, 28, 29, 47, 56, 57, 64, 73 |
| SR-9 Dependencies and Conformance | applied | §11 against STD-UI v6, rule by rule (Traceability Matrix). Dependency half: no dependency table in the blueprint; `check-capabilities.py` clean. New: FINDING-77 (STD-UI-19). Carried: FINDING-17 to 22, 27, 35, 40 |
| SR-10 Architectural Vocabulary | not applicable — the blueprint is not a system design | It declares no components or interfaces; "strategy service", "risk service" and the like are named view-model sources, not a design |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run — PASSED, exit 0, no error or warning | none |
| `build-architecture.py -p factorflow-v2` | run — PASSED, exit 0, 1 design, 12 components, 16 interfaces | none (SR-10 not applicable) |
| `check-artifacts.py -p factorflow-v2 --strict` | run — PASSED with 230 warnings, exit 0, 283 artifacts; none in `docs/ux`. The warning touching the subjects is on STD-UI, which pins PRODUCT-UX v3 as a source while the blueprint is now v6: upstream drift on an approved standard, not a defect in a subject | none |
| `check-artifacts.py -p factorflow-v2 --strict -a docs/ux` | run — before this report: PASSED, exit 0, 13 artifacts, no warning. After writing it: PASSED, exit 0, 14 artifacts, no warning | none |
| `check-references.py` | run — PASSED, 1127 references in 210 harness Markdown files | none; the subjects are outside its scope, so their references were checked by hand (FINDING-25 carried) |
| `check-constitutions.py` | run — PASSED, 10 constitutions, 36 skills | none |
| `artifact-gate.py revision`, each subject | run — 10 digests, recorded in `review_subjects` | none |

The prerequisite gate (`check-prerequisites.sh --project factorflow-v2`) passed
this session, exit 0, before any step ran. Design system resolved per
`docs/design-system.md`: `projects/factorflow-v2/design-system.yaml` present,
every configured path exists, `design_system_available = true`.

## Constitutions Applied

The relevance matrix assigns `specification-review` seven harness constitutions.
All seven were read in full this session.

| Constitution | What it produced in this review |
|--------------|---------------------------------|
| CONST-AGT 2.3 | **AGT-AUTH-002:** D-12 is recorded in §12 as a dated owner decision, which is what v3 asked for. The follow-on decisions it leaves open are surfaced, not taken: whether drafts can be discarded (FINDING-77), whether unmanaged holdings count against the per-stock limit (FINDING-76), and what a retiring strategy may do before its sells go (FINDING-74). **AGT-EVIDENCE-002:** D-12 introduces no new quantity; FINDING-34 carried. **AGT-SPEC-002:** FINDING-35 carried and extended, severity not judged. **AGT-PROV-001:** FINDING-48 carried; this report's provenance is complete. **AGT-AUTH-001:** this review approves nothing. **Enforcement:** no Critical or High violation is open |
| CONST-REV 1.4 | REV-STG-001: spec compliance (SR-3, SR-5, SR-9 and the D, CAP and STD-UI matrices) and artifact quality (SR-1, SR-2, SR-4, SR-6, SR-8) are separate stages. REV-AGT-001: the subjects are agent-drafted and were held to the full bar. REV-RCV-001: the revision history's claim that FINDING-65 is fixed was verified against the text, element by element of v3's recommendation, not accepted (Status of v3 Findings) |
| CONST-VER 1.2 | VER-EVD-001: every script ran this session and its output is recorded. VER-EVD-004: per-finding verdicts for all 59 v3 findings, per-decision verdicts for D-1 to D-12, and per-rule verdicts for STD-UI-1 to 30 |
| CONST-SA 2.0 | SA-MD-001 template structure (FINDING-46, 61 carried; 79 new), SA-MD-002 cross-references (FINDING-25 carried), SA-MD-003 placeholder text (FINDING-43 carried) |
| CONST-SEC 1.3 | In force (revision recomputed and equal to the approval block; identical on `origin/main`). The subjects never render the provider key (S02-4, S09-4; SEC-SEC-001, CAP-001 AC-13 respected). FINDING-35 carried and extended: the capital-at-risk actions on the unauthenticated loopback interface now also include retiring a live strategy (§9 `:537`). The browser-to-API channel falls under SEC-ENC-001 (H9) for state-changing routes; that is a system-design matter for M2, M5 and M6, not a blueprint finding |
| CONST-OPS 1.3 | No destructive operation in this review; the only write is this report. OPS-ERR-001: a failed retire sell is surfaced (Orders card and an S01 item, `S08:120-121`), so it is not swallowed; where the unsold position is then listed is FINDING-75. OPS-MIG-003: the route migration states a one-release redirect |
| CONST-MDL 1.3 | Exact model identifiers in the subjects' provenance (`claude-opus-5-5`) and in this report's |

Project constitution in scope: STD-UI v6 (approved, the standard under SR-9),
the product charter v2 and the tech stack v5.

---

## Status of v3 Findings

Every finding v3 left open was checked against the current text and the upstream
source it cites. "Resolved" means the defect is gone at the cited lines and
nothing equivalent replaced it; follow-on defects the fix created are new
findings and are cross-referenced. Line numbers are current.

| v3 ID | v3 severity | Status in v4 | Evidence (current lines) |
|-------|-------------|--------------|--------------------------|
| v3 FINDING-65 | HIGH | **Resolved** | D-12 (`product-ux-blueprint.md:612`). Element by element of v3's finding: (a) retiring is offered, on every S08 strategy card (`S08-portfolio.md:66-69`), and S04 points there (`S04-strategies.md:52-53`); (b) §9 tiers it, paper consequential with `dialog` `confirm`, live capital-at-risk with `dialog` `real-money` (`:536-537`); (c) what happens to the holdings is the owner's explicit choice, sell at the next open or keep unmanaged (§6 `:422-428`), and the sells are ordinary orders that respect the kill switch (`:429-431`); (d) a designed path now ends a live strategy's positions; (e) a retired strategy is not restorable ("for good", `:423`); (f) §10 assigns paper retiring to M2 and live to M6 (`:553`, `:557`). Not answered: whether a Draft or Backtested strategy can be discarded, and **Edit as a new strategy** is still tiered routine (FINDING-77, MEDIUM). Follow-ons: FINDING-74, 75, 76 (MEDIUM), 78, 79 (LOW) |
| v3 FINDING-66 | MEDIUM | Open, MEDIUM | S05's read-only mode still covers "a strategy that is paper or live trading" (`S05-builder.md:100`); paused, limit-stopped, ready-for-review and now retired strategies are still unaddressed; header *Draft · saved {time}* (`:44-45`), sub-line (`:48-50`) and §1 (`:34-35`) unchanged; §9 `:523` "creates a version" against S05 `:98` |
| v3 FINDING-67 | MEDIUM | Open, MEDIUM | S06 still offers **Start paper trading** on every backtest (`S06-backtest.md:48-49`, `:97`); its Stale state (`:109`) does not block it; S05 `:98-99`; S04 does not place an edited Backtested card (`:72-73`) |
| v3 FINDING-68 | MEDIUM | Open, MEDIUM (partly changed) | The D-12 commit changed S08 §3: a limit-stopped card now shows **Resume {name}…** in place of **Pause this strategy…** (`S08:66-68`), which answers v3's "name both resume cases in S08 §3" and implies a limit-stopped strategy cannot be paused there. But §3.3 (`:249`) and S01 (`:138`) still clear the item when the strategy is "paused", S08's view model still keeps `paused` and `stoppedByLimitAt` independent (`:108`), and §4.3 still gives no badge precedence (`:310-311`). Found this round: §9 places **Pause** on S04 too (`:527`), whose cards offer no pause control (`S04:70-76`). D-12's "Retiring ends a pause or a daily-loss stop" adds a third interaction: FINDING-74 |
| v3 FINDING-69 | MEDIUM | Open, MEDIUM | (a) §10 M6 still owns per-strategy daily-loss stops (`:557`) while paper uses the same value (`:245-246`), §9 tiers the paper resume (`:535`), S01's example is paper (`:138`), S08 §2 says M6 (`:46`); (b) set "in Settings with the other limits" (`:245`) against §2.3 (`:168-170`) and §9 (`:533`); (c) S08 `:63` and S07 `:66` still disagree with §3.3; (d) "its own limit" (`S01:62`, `S08:61-62`); (e) unchanged |
| v3 FINDING-70 | MEDIUM | Open, MEDIUM | Rule in S05 (`:56-57`, `:90`); setting in S07 (`:66`, `:81-82`, `:109`) and S08 (`:58-59`, `:106`, `:164`); §8 `:507`, §9 `:533`, S01 `:135`. D-12's unmanaged holdings add a case the answer must cover (FINDING-76) |
| v3 FINDING-71 | LOW | Open, LOW | Block reason unchanged (`:250-252`; `S08:132-133`); S01's **Review and resume** (`:138`) |
| v3 FINDING-72 | LOW | Open, LOW (partly changed) | **Stopped ({n})** now "opens the list of paused and retired strategies" (`S04:52-53`), so its members are named and limit-stopped strategies are by implication not in it. Still: *Stopped* names that list and the serious *Stopped: daily-loss limit* badge on cards that stay in their column (`:59-60`, `:103-105`); whether a paused card also leaves its column is unstated; `stoppedCount` (`:95`); badge precedence over *Limit hit* unstated (`:59-60`) |
| v3 FINDING-73 | LOW | Open, LOW | `button/design-spec.md:20`; S01 `:85`, `:106-107`, `:138`; S04 `:74-76`, `:86`, `:104-105` |
| v3 FINDING-53 | MEDIUM | Open, MEDIUM | §3.3 still says "Only the owner stops all trading" (`:236`); §8 has only *Trading stopped* by the owner (`:508`); STD-UI-12 (`ui-conventions.md:350-352`) and charter §3 (`product-charter.md:119-122`) still anticipate a broker-engaged stop |
| v3 FINDING-54 | MEDIUM | Open, MEDIUM | S05 conditions still `{factor, minPercentile}` (`S05:90`, `:51-54`) against S03's measure and direction (`S03-research.md:52-58`, `:102`); **Use in a strategy** still carries "the current scope and thresholds as the rule's conditions" (`S03:120-121`, §6 `:408-409`) |
| v3 FINDING-55 | MEDIUM | Open, MEDIUM | S03's *Empty, nothing found* (`S03:136`) still silent on the save action; S03-7 (`:174-176`) silent on incomplete stocks; the dialog still not in §4 (`:83-95`). CAP-002 flow step 5 and AC-5 (`Capability-CAP-002.md:202-203`, `:257-259`) |
| v3 FINDING-56 | MEDIUM | Open, MEDIUM | §4.4 still draws a `badge` reading *R* with an accessible name (`:321-325`; S03 `:66`; S05 `:68-70`) against `badge/design-spec.md:54` |
| v3 FINDING-57 | MEDIUM | Open, MEDIUM | Unchanged lists: S01 (`:163-168`), S03 (`:178-188`), S04 (`:147-149`), S05 (`:161-165`), S08 (`:184-193`, still without P08's "as recorded in the database and at the broker"). S08's new retire control and unmanaged-holdings card are additions the canvas does not draw, not disagreements |
| v3 FINDING-58 | MEDIUM | Open, MEDIUM | Principle 5 (`:101-103`), §6 (`:438-439`), §9 (`:517`), S01 (`:136`) and S09 (`S09-data-health.md:131`) still say a holding strategy keeps an incomplete stock, against S05's **Sell it** (`S05:135`) |
| v3 FINDING-59 | LOW | Open, LOW | "each confirmed on its own" (`S09:108-110`) against routine following (`:516`) |
| v3 FINDING-60 | LOW | Open, LOW | "consumed unchanged" (`:551`) and "on CAP-001's API as it is" (`:550`) against S09 §2's CAP-002 dependency (`S09:43`) |
| v3 FINDING-61 | LOW | Open, LOW | S05-6 still between S05-2 and S05-3 (`S05:147-159`) |
| v3 FINDING-62 | LOW | Open, LOW | *Step n of 5* (`S02-setup.md:62`) against four steps before M2 (`:51-52`) |
| v3 FINDING-63 | LOW | Open, LOW | One date and a count (`:529`, `:441-445`); paused strategies on **Resume trading** still unstated. Pending retire sells in that dialog: FINDING-75 |
| v3 FINDING-64 | LOW | Open, LOW (extended) | §9 `confirm` texts still open with a question and name no confirm label (`:517`, `:526`, `:527`, `:529`, `:531`; `:535` inherits), now also *Retire {name}?* (`:536`), against `dialog/design-spec.md:85-86` |
| v3 FINDING-10 | MEDIUM | Open, MEDIUM | Paper and Ready card facts still include tracking distance from the backtest (`S04:74-75`); footer still links Settings → Review gate untagged (`:65-66`, `:129`) |
| v3 FINDING-11 | MEDIUM | Open, MEDIUM | "M2 (Live column empty until M6)" (`S04:41`) against S04-4 (`:145`) and D-6 (`:606`); §10 M2 still gives the stepper *Live* (`:553`); the not-grandfathered case still has no rendering |
| v3 FINDING-12 | MEDIUM | Open, MEDIUM | `gate` still `{paperDays, trackingPp}` (`S04:94`); footer still two criteria with literal 60 and 2 (`:129`) |
| v3 FINDING-15 | MEDIUM | Open, MEDIUM (extended) | §8 (`:473-510`) still omits backtest states, S04's *LIVE*, S08's *Near limit*, *At limit*, *Price from {date}*, *Not current*, S09's *Not current*, *Can't read account*, S02's *Missing*, S05's *Draft · saved*, the *Possibly restated* mark and S08's *Stopped: daily-loss limit reached at {time}*. D-12 adds two more with no tier: *Retiring: selling {n} positions at the next open* (`S08:118-119`) and *Retired*, `badge` `secondary` with tier "—" (`:312`), now rendered in S04's list (`:431-432`) |
| v3 FINDING-16 | MEDIUM | Open, MEDIUM | *Backtested* with a filled circle (`:306`); *NO TRADING YET* with no shape (`:216`); S06's mark `status-neutral` with a diamond (`S06:74`) |
| v3 FINDING-17 | MEDIUM | Open, MEDIUM | No *checked {time}* on S02 step-4 progress (`S02:75`), S06 progress (`S06:98-99`) or S09's running download (`S09:111-112`); no cadence for S07's evidence-change detection (`S07:124-126`) or the shell's chips and trading state (`:208-223`) |
| v3 FINDING-18 | MEDIUM | Open, MEDIUM | Sparklines without measure, units, as-of or n, their table "on the strategy page" (`S01:147-148`; §11 `:593`) |
| v3 FINDING-19 | MEDIUM | Open, MEDIUM | Only *Daily prices* states its scope, on `/data/coverage` (`S09:134`; §11 `:583`) |
| v3 FINDING-20 | MEDIUM | Open, MEDIUM | `h1` *{Weekday}, {day} {Month}* and *Thursday, 15 October* (`S01:55`, `:131`); zoneless *checked 18:52:14* (`:358`); *Scores from today 17:46 CDT* (`S03:62`) |
| v3 FINDING-21 | MEDIUM | Open, MEDIUM | Size literals unchanged (`:179-206`, `:286`, `:317`, `:332`, `:348`; S02 `:58`; S03 `:49`, `:55`, `:69`; S04 `:54`; S05 `:46`, `:65`; S08 `:95`) while §11 claims "only theme tokens" (`:594`) |
| v3 FINDING-22 | MEDIUM | Open, MEDIUM | No search in S03's filters (`S03:49-60`); §11 claims search and filter (`:595`) |
| v3 FINDING-23 | MEDIUM | Open, MEDIUM | `retired` and `failedReason` without rendering (`S03:107`, `:105`); the as-of line omits the download (`:62`); CAP-002 AC-15, AC-20, AC-21 (`Capability-CAP-002.md:289-313`) |
| v3 FINDING-25 | MEDIUM | Open, MEDIUM | Stock evidence, compare and universes still "CAP-002 page, restyled" with no spec or source (`:142-144`, `:166-170`); S03 §11 cites "the Marks column from the CAP-002 design" (`S03:182-184`); `docs/capabilities/CAP-002-*/` holds only the capability |
| v3 FINDING-26 | MEDIUM | Open, MEDIUM (extended) | S07's real-money dialog: no acknowledgement, a question for a title (`S07:77-84`); §9's other real-money dialogs have no content (`:530`, `:533`, `:534`). The new retire-live row (`:537`) has content (the positions and their value) but no typed or checked acknowledgement, and puts the quantities in an option rather than the description. `dialog/design-spec.md:35`, `:68`, `:85` |
| v3 FINDING-27 | MEDIUM | Open, MEDIUM (partly changed) | Retiring is now tiered (`:536-537`). Still untiered: changing the review-gate settings (D-3) and changing history depth (S02, Settings). Creating a strategy and discarding one: FINDING-77 |
| v3 FINDING-28 | MEDIUM | Open, MEDIUM | Tooltip on a non-focusable badge (`:320`); chips as links with no component (`:221`); the stopped banner and S02's file input still not routed through intake (`S02:168-170`; `design-system/intake.md` has no entry) |
| v3 FINDING-29 | MEDIUM | Open, MEDIUM | Badges over two words (`badge/design-spec.md:21`): `:311`, `S04:59-60`, `:492`, `:505-507`, `S08:127-128`, `S06:44`; the nav count chip carries a number (`:130-132`) |
| v3 FINDING-30 | MEDIUM | Open, MEDIUM | *Add later* still leads to a step 4 with zero stocks (`S02:74`, `:115-117`, `:126`) that CAP-001 AC-24 refuses (`Capability-CAP-001.md:283-288`) |
| v3 FINDING-31 | MEDIUM | Open, MEDIUM | `parse` still cites `parse-bulk-symbols` for `duplicates` and `suggestion` (`S02:100`, `:109-111`); the parser returns only `input`, `normalised`, `valid` (`web/src/screens/instruments/parse-bulk-symbols.ts:19-26`) |
| v3 FINDING-32 | MEDIUM | Open, MEDIUM | S09's Stale (`S09:122`) and S01's "{n} of {m} stocks current" (`S01:66`) against CAP-002 AC-13 (`Capability-CAP-002.md:280-283`) |
| v3 FINDING-33 | MEDIUM | Open, MEDIUM | No status region in §3 (`:177-206`, `:269-276`); CAP-001's pages "consumed unchanged" (`:551`) while its approved region and AC-18 trace (`ux-design.md:71`, `:85`, `:691`) are dropped |
| v3 FINDING-34 | MEDIUM | Open, MEDIUM | Still unsourced: S05's rule blanks (`S05:56-60`) and 800 ms (`:97`); §8's 8% (`:507`); S08's 80% and "older than 2 polls" (`S08:134-136`, `:146`); S03's 2-6 and 150 ms (`S03:126`, `:128`); S06's $10,000 (`S06:46`); the polling cadences |
| v3 FINDING-35 | MEDIUM | Open, MEDIUM (extended; surfaced, severity not judged) | Capital-at-risk actions on the unauthenticated loopback interface (`:201`, `:526-537`), now including retiring a live strategy with a real-money sell (`:537`); CAP-001 §7's open question (`Capability-CAP-001.md:411-415`) still neither cited nor resolved |
| v3 FINDING-36 | MEDIUM | Open, MEDIUM | "Three `checkbox` acknowledgements" (`S07:68`), "the fixed set plus one per mark" (`:110`), one aggregated per-mark sentence (`:150`), S07-6 (`:174-175`) |
| v3 FINDING-37 | LOW | Open, LOW | "Not applicable" without reason: S06 `:107`, `:110`; S07 `:138` |
| v3 FINDING-38 | LOW | Open, LOW | *Paper · practice* (`S08:48`, `:54`), *REAL MONEY* (`S07:51`), *LIVE · n STRATEGY* (`:218`), *Stopping* for two states (`:233`, `:484`), "timed out" (`:541`, `S09:131`), "kill switch" in copy (`:256-257`), *Promotion failed* (`S07:142`), two labels for the limit stop (`:311` against `S08:127-128`) |
| v3 FINDING-39 | LOW | Open, LOW (more pressing) | **Stopped ({n})** still opens a list with no route or layout (`S04:52-53`); `/strategies/:id`'s redirect target is unstated for any stage, now including *Paused* and *Retired* (`:147`). D-12 sends every retired strategy to that list and says "its evidence and decision history are kept" (`:431-432`), but no screen shows them |
| v3 FINDING-40 | LOW | Open, LOW | §9 tiers Stop all trading "protective" (`:528`); §11 records STD-UI-11 and 21 (`:576`, `:586`) without noting §10 omits both in M1 (`:550`) |
| v3 FINDING-41 | LOW | Open, LOW | §4.1's sort order omits `active` (`:289-290`); the Draft item has no body, a mutation-like label and no M4 tag (`S01:137`) |
| v3 FINDING-42 | LOW | Open, LOW | Rename by "click" (`S05:44`); no `nav` landmark in §3.1 (`:197`); "Showing {n} of {m}" with no way to the rest (`S08:73`); no completion confirmation for save-as-universe and add-to-universe (`S03:122-127`) |
| v3 FINDING-43 | LOW | Open, LOW | "A deeper depth is requested as stated…" (`S02:73`) |
| v3 FINDING-44 | LOW | Open, LOW | Whether Ready for review persists after the gate stops being met (`S07:121-123`, `:137`) |
| v3 FINDING-45 | LOW | Open, LOW | Holdings line and `heldBy[]` cite CAP-002 AC-17 with no M2 tag (`S03:70`, `:111`) |
| v3 FINDING-46 | LOW | Open, LOW | Bare milestones in S04 and S08 §2 (`S04:39-43`, `S08:41-46`); §13 gives no intake reasoning (`:614-644`); S02's file input in §11, not §4 (`S02:168-170`) |
| v3 FINDING-47 | LOW | Open, LOW | Blank line before the `kill-switch` and `sparkline` rows (`button/design-spec.md:35`; `chart/design-spec.md:33`) |
| v3 FINDING-48 | LOW | Open, LOW | `agent_id: ux-blueprint`, `tool_version: unknown` in all ten subjects (blueprint `:19-23`; screens `:16-20`) |
| v3 FINDING-49 | LOW | Open, LOW | S08-5 unquantified (`S08:177`) |
| v3 FINDING-50 | LOW | Open, LOW | cmdk and a virtualisation library still not in tech-stack v5 (no match in `tech-stack.md`); §13 `:627`, `:637-638`; S06 cites a "dataviz hover layer" (`S06:93`) |

**Superseded:** none. **Regression check on earlier resolved findings:** v1
FINDING-1 to 9, 13, 14 and 24, and v2 FINDING-51 and 52, remain resolved at the
current text. D-12 does not reopen v2 FINDING-52: the way back from a
daily-loss stop is still the owner's **Resume {name}…**, and retiring is a
second, separately tiered way out.

---

## Findings by Specification

### Capability Specification (mapped: product UX blueprint, `product-ux-blueprint.md`)

#### Architectural Vocabulary (SR-10)

Not applicable: the blueprint is not a system design and declares no components
or interfaces.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py`: no error, no warning. The blueprint is not a
capability node and declares no dependency table.

Conformance to STD-UI v6, rule by rule (full table in the Traceability Matrix):
14 rules pass, 2 pass from M2 where they apply, 7 are partial, 6 fail as
written, and 1 is not applicable. The distribution is unchanged from v3; D-12
changes the evidence inside STD-UI-19 (retiring tiered; FINDING-77 added) and
STD-UI-2 (FINDING-76, 78). The failures and partials:

- STD-UI-1 PARTIAL: FINDING-38, 72, 78.
- STD-UI-2 PARTIAL: FINDING-58, 63, 66, 71, 76, 78.
- STD-UI-5 FAIL: FINDING-20. STD-UI-18 FAIL: FINDING-19. STD-UI-25 FAIL:
  FINDING-17. STD-UI-28 FAIL: FINDING-18. STD-UI-29 FAIL: FINDING-21.
  STD-UI-30 FAIL: FINDING-22.
- STD-UI-8 PARTIAL: FINDING-16, 56. STD-UI-12 PARTIAL: FINDING-15, 16, 53.
  STD-UI-19 PARTIAL: FINDING-27, 40, 68, 77. STD-UI-23 PARTIAL: FINDING-37.
  STD-UI-24 PARTIAL: FINDING-28, 42, 56, 73.
- CONST-SEC: FINDING-35 (carried, extended, surfaced).

No specialization is declared in §11. The issue remains claim support: the
STD-UI-18, 25, 28, 29 and 30 cells read as satisfied where the screens do not
support them, and the STD-UI-19 cell ("§9") omits creating and discarding a
strategy and two settings changes.

#### Completeness (SR-1)

All fifteen template sections are present. Content gaps: FINDING-74 (retiring
interval), 75 (failed retire sells), 76 (unmanaged holdings), 77 (discarding a
draft); FINDING-15, 25, 27, 39 and 46 carried.

#### Correctness (SR-2)

FINDING-74, 75 (MEDIUM); FINDING-41, 58, 59, 66 and 68 carried.

#### Testability (SR-4)

The blueprint carries no acceptance checks by design (template: "The blueprint
designs; capabilities specify"). Screen checks are covered below.

#### Clarity (SR-6)

FINDING-78 (LOW); FINDING-34, 38, 63, 69, 70, 71 and 72 carried.

### System Design Specification

Not provided -- skipped. The Product UX Scope has no system design.

### Component Design Specifications

Not provided -- skipped.

### UX Brief

Not provided -- skipped. Capability UX briefs will cite this blueprint.

### UX Design Specification (mapped: screen specifications S01 to S09)

**SR-8 component mapping.** Every component and variant in §4 of each screen
and in the blueprint exists in `design-system/components/` (48 pairs checked by
script over the §4 tables and every inline `` `component` `variant` `` pair).
D-12's new uses resolve: `button` `ghost`, `radio-group` `cards` (two options,
no default, which the radio-group spec permits and, for a capital-at-risk
choice, requires: `radio-group/design-spec.md:50-51`, `:81`), `dialog` `confirm`
with the `paper` badge for a paper trade (`dialog/design-spec.md:37-39`) and
`dialog` `real-money` for live. Uses that conflict with a component's own
contract: FINDING-26 (extended: the retire-live dialog has no acknowledgement),
29, 56, 64 (extended: *Retire {name}?*), 73 carried. S08's §4 does not map the
new elements: FINDING-79. Gaps not routed through intake: FINDING-28 carried.

**SR-8 tokens.** Every `--token` the ten documents name resolves in
`design-system/theme.css`; `--surface` is correctly stated not to be one. Size
literals: FINDING-21 carried.

**SR-8 design source.** S01 to S09 cite their mirrored `P0n` source, and each
resolves. P08's text was read for S08's changes: the canvas has no retire
control and no unmanaged-holdings card, so S08's additions draw what the canvas
does not have, which is not a disagreement. Remaining unlisted differences are
FINDING-57 (carried). The CAP-002 pages still have no source (FINDING-25).

**SR-8 EDG.** Under STD-UI §1.2, STD-UI is the project's EDG constitution, so
§11 is the EDG record. The `edg-compliance` checklist was walked over the
changed content: a create/modify/delete pattern for strategies (retire now
designed for paper and live strategies; none for drafts: FINDING-77);
confirmation dialogs (FINDING-26, 64, 78); terminology (FINDING-72, 78); state
after an operation (FINDING-74, 75); success feedback (FINDING-42).

**SR-4 testability of the 53 acceptance checks.** All are observable except
S08-5 (FINDING-49) and S08-7's "never traded by FactorFlow" clause where an
active strategy trades the same stock (FINDING-76). S05-1 and S06-3 are
implementation properties, checkable by contract test. No check covers the tier
of the retire-live dialog (FINDING-79). S05's checks are listed out of order
(FINDING-61).

**Per-screen findings (open).**

- Blueprint: FINDING-74, 75, 76, 77 (MEDIUM); 78, 79 (LOW); carried 11, 15
  to 22, 25 to 29, 33 to 35, 53, 54, 56, 58, 66, 68, 69, 70 (MEDIUM), 38 to
  42, 46, 47, 48, 50, 59, 60, 63, 64, 71, 72 (LOW).
- S01: FINDING-74, 75, 76 (MEDIUM); carried 18, 20, 32, 57, 58, 68, 69, 70
  (MEDIUM), 41, 71, 73 (LOW).
- S02: carried 17, 28, 30, 31 (MEDIUM), 43, 46, 62 (LOW).
- S03: carried 20, 22, 23, 25, 34, 54, 55, 56, 57 (MEDIUM), 42, 45 (LOW).
- S04: FINDING-74, 77 (MEDIUM); 79 (LOW); carried 10, 11, 12, 15, 29, 57, 67
  (MEDIUM), 39, 46, 72, 73 (LOW).
- S05: FINDING-77 (MEDIUM); carried 34, 54, 56, 57, 58, 66, 67, 70 (MEDIUM),
  42, 61 (LOW).
- S06: carried 15, 16, 17, 29, 34, 67 (MEDIUM), 37, 50 (LOW).
- S07: carried 11, 17, 26, 36, 69, 70 (MEDIUM), 37, 38, 44 (LOW).
- S08: FINDING-74, 75, 76 (MEDIUM); 78, 79 (LOW); carried 15, 26, 29, 34, 57,
  68, 69, 70 (MEDIUM), 38, 42, 46, 49, 71 (LOW).
- S09: carried 17, 19, 32, 58 (MEDIUM), 38, 59, 60 (LOW).

### Cross-Specification Consistency (SR-3)

Consistent and verified this round:

- **Routes.** §2.1, §2.2, §5 and each screen's `route` agree; the migration in
  §2.2 is unchanged.
- **D-12 across the subjects.** The intro (`:49-50`), §6 (`:422-432`), §9
  (`:536-537`), §10 (`:553`, `:557`), §12 (`:612`), S04 (`:52-53`), S08
  (`:66-69`, `:74-78`, `:117-122`, S08-7) and S01 (`:138`, the item clears
  when the strategy is retired) state the same rule: the owner chooses, with no
  default, to sell at the next open or keep the holdings unmanaged; `confirm`
  for paper, `real-money` for live; offered on the S08 card.
- **D-12 against the charter and the tech stack.** The owner keeps control of
  which strategies run (charter §1, `product-charter.md:63-66`); retire sells
  are ordinary orders through the one chokepoint the kill switch guards
  (tech-stack `:272-274`, `:311-313`; blueprint `:429-431`); evidence and
  decision history are kept (charter §3 Persistence, `:123-129`).
- **D-10 and D-11** remain consistent as v3 recorded, with the S08 §3 change
  noted under v3 FINDING-68.
- **STD-UI-1.** §7 matches the v6 table row for row; D-12's new labels are not
  in it (FINDING-78).

Mismatches, each a CROSS-SPEC-INCONSISTENCY: FINDING-76 (MEDIUM); carried
FINDING-11, 12, 15, 16, 23, 31, 32, 33, 53, 54, 55, 69, 70 (MEDIUM) and 60
(LOW).

---

## Findings Summary Table

New findings first (FINDING-74 to 79), then carried findings: v3's new
findings (66 to 73), then the earlier ones in v3's order.

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-74 | MEDIUM | SR-2 / SR-1 (STD-UI-2, STD-UI-19; D-12, D-11) | Blueprint, S08, S04, S01 | `product-ux-blueprint.md:249-252`, `:303-312`, `:424-432`, `:536-537`; `S08-portfolio.md:66-69`, `:100-109`, `:117-122`; `S04-strategies.md:52-53`, `:99-105`; `S01-home.md:138` | D-12 defines the two end states but not the interval between choosing **Sell everything at the next open** and the sells settling. The strategy "sends sell orders for all its positions at the next market open, then retires", and "Retiring ends a pause or a daily-loss stop" (`:424-429`). Unstated: (a) whether the strategy's own scheduled rebalance still runs before that open. Read literally, a paused or limit-stopped strategy is no longer paused or stopped, so a rebalance between the choice and the open could buy; on the day of a daily-loss stop that sidesteps the same-day block of §3.3 (`:250-252`), the class of v3 FINDING-68. (b) What happens to orders the strategy has sent and not yet filled at retire time, on either path; a fill after *Keep the holdings* "retires at once" has no owner. (c) Its stage meanwhile: S08 shows *Retiring: selling {n} positions at the next open* (`:118-119`), but §4.3 has no such stage, S08 §5 no field for it, and S04 moves the strategy to the Stopped list only once retired, without saying which column holds the card meanwhile. (d) Whether the choice can be withdrawn before the open. (e) When S01's daily-loss item clears on this path, at the choice or once retired | For a live strategy, the M6 implementation decides whether a strategy the owner is retiring can still trade real money before its sells go, and whether a daily-loss stop holds until the open | State that from the owner's confirmation of *Sell everything*, the strategy sends no order other than its retire sells: no rebalance, unsent orders cancelled, and the pause or stop is lifted only so far as it would block the sells. State what happens to sent, unfilled orders on both paths. Give the retiring state a §4.3 row and tier (with FINDING-15), an S04 placement and S08 view-model fields, and say whether it can be cancelled before the open |
| FINDING-75 | MEDIUM | SR-2 / SR-1 (STD-UI-2, STD-UI-11, STD-UI-19; D-12, D-7) | S08, Blueprint, S01 | `S08-portfolio.md:117-122`, `:174-176`; `product-ux-blueprint.md:234`, `:284-291`, `:429-431`, `:441-445`, `:503`, `:529-530`; `S01-home.md:134-138`; `design-system/components/dialog/design-spec.md:37-39` | Two follow-on paths of *Sell everything* are undesigned. (a) **A sell that does not complete.** S08 §6 keeps a failed sell on the Orders card and gives S01 a *Needs you* item, but the card "leaves the page" once the sells "settle" (`:119-121`), so the unsold position is then listed nowhere: neither on a strategy card nor under *Not managed by a strategy*. Whether the strategy is retired with a residual position, and whether FactorFlow retries, is unstated; §8's *Filled n of m* (`:503`) has the same gap. The S01 item has no copy, tier or action, though §4.1 requires exactly one action. (b) **Sells pending while all trading is stopped.** They go "at the next open after the owner resumes trading" (`:429-431`), but the Resume trading confirmation says *{n} paper strategies send orders again from the next rebalance, {date}* (`:529`). It omits the pending retire sells, which go at the next open, not the next rebalance. §3.3 (`:234`) and §9 (`:529-530`) choose the dialog by whether "any live strategy would resume"; a retiring live strategy's pending real-money sells do not obviously count, so an implementation can release real-money orders behind the paper-badged `confirm` that S08-4 reserves for "resuming paper only" | A real-money position can drop out of S08's listing after a failed sell; the Resume trading dialog can misstate what will trade, when, and in which environment | Keep the strategy card, or move the residue under *Not managed by a strategy*, until every retire sell has filled, with a stated recovery action; give S01's item its copy, tier and action. List pending retire sells in the Resume trading dialog with their timing, and state that a pending real-money retire sell makes Resume trading capital-at-risk (`dialog` `real-money`) |
| FINDING-76 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY / SR-7 / SR-1 / SR-4 (STD-UI-2, STD-UI-15; D-12, D-11; CONST-AGT AGT-AUTH-002) | S08, Blueprint, S01 | `product-ux-blueprint.md:210-218`, `:425-428`, `:536`; `S08-portfolio.md:57-63`, `:74-78`, `:100-109`, `:143`, `:180-182`; `S01-home.md:58-64`, `:98-99`; `docs/constitution/tech-stack.md:272-274`, `:287-288` | *Keep the holdings* is specified only as an S08 list: the positions are "never traded by FactorFlow again" and their value is in *Account value* (`S08:74-78`). Unstated: (a) **limits.** Whether unmanaged positions count in S08's *Largest position vs {n}% limit* tile (`:58-59`) and in the per-stock or exposure checks the order chokepoint applies (tech stack `:272-274`). That decides whether an active strategy's buys of the same stock are trimmed (with v3 FINDING-70). (b) **Shared stocks.** The broker holds one position per stock per account, and positions come from the broker port (tech stack `:287-288`). When an active strategy holds or later buys the same stock, nothing says how its shares and the unmanaged shares are kept apart so that "never traded" holds when that strategy sells. (c) **Sales at the broker.** The owner is told to sell them there (`S08:77`), but how S08's list learns of the sale, above all for a shared stock, is unstated, and S08 §5 has no field or source for the list. (d) **An environment with no active strategy.** After the last live or paper strategy is retired with *Keep*, holdings remain while §3.2 shows a chip only per environment "that has an active strategy" and otherwise *NO TRADING YET* (`:210-216`), untrue after trading has happened. S01's Live tile is null under an unstated condition and could hide real-money holdings from Home (`:98-99`). S08's empty state reads *No strategy is live. A strategy goes live after your review.* (`:143`), with no word about what is held. (e) S08-7's "never traded by FactorFlow" (`:180-182`) is not decidable for a stock an active strategy also trades | M2 and M6 decide by implementation whether unmanaged real-money holdings constrain, or are traded by, active strategies, and whether Home and the shell show them | Owner decision: whether unmanaged positions count against the per-stock limit. Then state that they are tracked by share count per stock, apart from every strategy's, and that no strategy ever sells them; that a broker-side sale is attributed to them first; add `unmanaged[]` with its source to S08 §5; define S01's tile, §3.2's chip and S08's empty-state copy when an account holds only unmanaged positions; reword S08-7 so it can be observed (no order is placed for unmanaged shares; their count changes only by a broker-side sale) |
| FINDING-77 | MEDIUM | SR-1 / SR-9 (STD-UI-19; residual of v3 FINDING-65; D-10, D-12) | Blueprint, S04, S05, S08, S01 | `product-ux-blueprint.md:414-420`, `:422-423`, `:512-537`, `:523-524`, `:612`; `S04-strategies.md:52-53`, `:70-73`; `S05-builder.md:100-105`; `S08-portfolio.md:64-69`; `S01-home.md:57` | Retiring is offered only on an S08 card, and S08 has cards only for paper and live strategies. A Draft or Backtested strategy, including the *{name} (copy)* that **Edit as a new strategy** creates (`S05:103-105`), can be neither retired nor discarded on any screen; S04's Draft and Backtested card actions (`:72-73`) offer neither. §9 tiers **Edit as a new strategy** `routine` (`:524`), which STD-UI-19 defines as reversible, but its effect, a new strategy on the board, cannot be undone; **+ New strategy** (`S01:57`, `S04:53`) has no §9 row. v3 FINDING-65 asked whether a draft can be discarded; D-12 does not say | M2's board accumulates drafts the owner cannot remove, and the §9 tier of two creating actions misstates their reversibility | Owner decision: whether a Draft or Backtested strategy can be retired or deleted, and where (S04 card or S05). Then add it and creating a strategy to §9 with their tiers; if drafts cannot be removed, tier creating one consequential and say so in its copy |
| FINDING-78 | LOW | SR-6 (STD-UI-1, STD-UI-2) | Blueprint, S08 | `product-ux-blueprint.md:424-428`, `:454-471`, `:536-537`; `S08-portfolio.md:68-69`, `:74-77`, `:117-119` | (a) The option *Sell everything at the next open, {date}* (`:536`) names "everything" where the action sells only this strategy's positions, while other strategies and unmanaged holdings share the account; §6's own gloss says "all its positions" (`:425`). (b) The live row gives "the same required choice" (`:537`), whose keep option reads *Keep the holdings in the paper account*; the live wording is not given. (c) Nothing covers a strategy that holds nothing at retire time, where the required choice has no effect. (d) D-12 adds user-visible concepts (*Retire* a strategy, *Retired*, *Retiring*, *Not managed by a strategy*) that §7 does not record. STD-UI-1 lets a concept be added only with its domain term and display label recorded, and "retire" is STD-UI-1's domain term for an instrument, whose display label is *stop following* (`ui-conventions.md:163`) | The copy can overstate the sale or leave the live wording to the implementer, and the vocabulary table no longer covers what the screens say | *Sell its {n} positions at the next open, {date}*; give the live keep option's wording (*in your live account*); omit the choice when nothing is held; record *retire (a strategy) → Retire / Retired* and *unmanaged position → Not managed by a strategy* in §7's new concepts, through STD-UI-1's change control or the M2 capability's UX brief |
| FINDING-79 | LOW | SR-1 / SR-8 (CONST-SA SA-MD-001; STD-UI-19) | S08, Blueprint, S04 | `S08-portfolio.md:41-46`, `:86-98`, `:100-109`, `:151-158`, `:168-182`; `product-ux-blueprint.md:553`, `:557`, `:625`; `S04-strategies.md:99-102` | The D-12 additions to S08 §3 and §6 are not carried through S08's other sections. §2 assigns no milestone to retiring (paper M2, live M6 per §10 `:553`, `:557`) or to the *Not managed by a strategy* card. §4 has no rows for **Retire {name}…** (`button` `ghost`), the *Not managed* `card` and its table, or the dialog's `radio-group` `cards`. §5 has no fields for either (content in FINDING-74, 76). §8 has no copy for the retire dialog or the *Retiring* line. §10's S08-4 checks the dialog for resuming only, so nothing checks that retiring a live strategy requires `dialog` `real-money` (§9 `:537`). Blueprint §13's `radio-group` row (`:625`) does not list the retire dialog among its users. S04 §6 lists the actions that change a stage (backtest, start paper trading, go live) without retire (`:99-102`) | A capability taking S08 as its starting layout gets the retire control and the new card without their component, milestone or test anchors | Add the §2 and §4 rows and the §8 copy, and an S08-8 check that retiring a live strategy requires `dialog` `real-money`; add the retire dialog to §13's `radio-group` users and retire to S04 §6's list |
| FINDING-66 | MEDIUM | SR-2 / SR-1 (STD-UI-2; D-10) | S05, Blueprint | `S05-builder.md:34-35`, `:44-50`, `:97-105`, `:149-152`; `product-ux-blueprint.md:307-312`, `:523`, `:534` | Carried from v3: S05's read-only mode covers only "paper or live trading"; Ready for review, Paused, Stopped by a limit and Retired are not addressed; read-only mode keeps the *Draft* header and the "every value can be changed" sub-line; §9 and S05 disagree on when a version is created | The M2 builder can open a paused or limit-stopped strategy editable, or label a live one *Draft* | As v3: every strategy that has started paper trading opens read-only; give the read-only header, sub-line and purpose; align §9 and S05 on versions |
| FINDING-67 | MEDIUM | SR-2 (D-6) | S06, S04, S05 | `S06-backtest.md:48-49`, `:97`, `:109`, `:138`; `S05-builder.md:98-99`; `S04-strategies.md:72-73`; `product-ux-blueprint.md:606` | Carried from v3: S06 offers **Start paper trading** on a superseded backtest; which version starts is unstated; S04 does not place an edited Backtested card | M4 can paper-trade an untested version | As v3: block it on a superseded backtest, or state which version starts; state S04's column |
| FINDING-68 | MEDIUM | SR-2 (D-11; STD-UI-19) | Blueprint, S08, S01, S04 | `product-ux-blueprint.md:249-252`, `:310-311`, `:527`, `:531`, `:534-535`; `S08-portfolio.md:66-68`, `:108`, `:126-133`; `S01-home.md:138`; `S04-strategies.md:70-76` | Carried from v3, partly changed: S08 §3 now offers **Resume** in place of **Pause** on a limit-stopped card, which implies it cannot be paused there, but §3.3 and S01 still clear the item when the strategy is "paused", the view model keeps the two states independent, and no badge precedence is given. §9 also places **Pause** on S04, whose cards have no pause control | Implementations differ on whether a limit-stopped strategy can be paused and whether the same-day block survives | State that a limit-stopped strategy cannot be paused (and drop "paused" from §3.3 and S01's clearing rule), or state that pausing keeps the stop and its same-day block; give badge precedence; drop S04 from §9's Pause row or add the control |
| FINDING-69 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY / SR-7 (D-11) | Blueprint, S01, S07, S08 | `product-ux-blueprint.md:168-170`, `:243-246`, `:533`, `:535`, `:553-557`; `S01-home.md:43`, `:61-62`, `:138`; `S07-promotion-review.md:66`; `S08-portfolio.md:43-46`, `:57-63`, `:106`; `docs/constitution/tech-stack.md:287-288` | Carried from v3: the paper daily-loss stop has no milestone (M6 owns per-strategy stops) and no setting surface before M6; S08 and S07 disagree with §3.3 on whether paper uses the live value; "its own limit" for one setting; an intraday measure before M3 | The M2 capability cannot tell whether it ships paper daily-loss stops, where the value is set, or how a stop is measured before M3 | As v3: tag the paper stop's milestone, state where and at what tier the value is set before M6, align S08 and S07, reword "its own limit" |
| FINDING-70 | MEDIUM | SR-3 / SR-6 (CONST-AGT AGT-AUTH-002) | S05, S07, S08, Blueprint, S01 | `S05-builder.md:56-57`, `:90`; `S07-promotion-review.md:66`, `:81-82`, `:109`; `S08-portfolio.md:58-59`, `:106`, `:164`; `product-ux-blueprint.md:507`, `:533`; `S01-home.md:135` | Carried from v3: the per-stock limit is both a versioned strategy rule (S05) and an account-wide owner setting (S07, S08); which value trims an order is unstated. Unmanaged holdings add a case (FINDING-76) | M2 and M6 decide by implementation what governs real-money position size | As v3: an owner decision recorded in §12, then align S05, S07, S08, §8 and S01 |
| FINDING-71 | LOW | SR-6 (STD-UI-2) | Blueprint, S08, S01 | `product-ux-blueprint.md:250-252`; `S08-portfolio.md:132-133`; `S01-home.md:138` | Carried from v3: the blocked-resume reason states a loss condition for a rule that is by day; S01's **Review and resume** leads on that day to a control that cannot resume | The block reason can misstate the account's state | As v3: *Stopped by its daily-loss limit today. You can resume after today's close.* |
| FINDING-72 | LOW | SR-6 (STD-UI-1) | S04, Blueprint | `S04-strategies.md:52-53`, `:59-60`, `:95`, `:103-105`; `product-ux-blueprint.md:310-311` | Carried from v3, partly changed: the header list's members are now named (paused and retired), but *Stopped* still names it and the serious badge on limit-stopped cards that stay in their column; whether a paused card leaves its column, and badge precedence over *Limit hit*, are unstated | The board's count and badges can disagree about what is stopped | As v3: name the list for what it holds (**Paused and retired ({n})**), say whether paused cards leave their column, and give the serious badge precedence |
| FINDING-73 | LOW | SR-8 (STD-UI-24) | S01, S04 | `design-system/components/button/design-spec.md:20`; `S01-home.md:85`, `:106-107`, `:138`; `S04-strategies.md:74-76`, `:86`, `:104-105` | Carried from v3: navigating actions mapped to `button`, which the button spec reserves for in-place actions | Navigation loses link semantics | As v3: map navigating actions to links |
| FINDING-10 | MEDIUM | SR-2 | S04 | `S04-strategies.md:65-66`, `:74-75`, `:129` | Carried from v3: M2 and M3 Paper cards show tracking distance from a backtest (M4); the footer links Settings → Review gate (M5), untagged | The M2 board renders values that cannot be computed and links to a page that does not exist | Milestone-tag the card facts and the footer |
| FINDING-11 | MEDIUM | SR-3 (D-6) | Blueprint, S04, S07 | `S04-strategies.md:41`, `:45-46`, `:145`; `product-ux-blueprint.md:298-299`, `:553`, `:606` | Carried from v3: a Live column in M2 "empty until M6" against S04-4 and D-6; the stepper shows *Live* from M2; the not-grandfathered case has no rendering | An owner decision applied inconsistently | Apply D-6 to S04 §2 and §10 M2; render the not-grandfathered case |
| FINDING-12 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY (D-3) | S04 | `S04-strategies.md:94`, `:129` | Carried from v3: `gate` and the footer carry two of D-3's four criteria, with literal values | The board misstates the owner's gate | Carry all four criteria from the owner's settings |
| FINDING-15 | MEDIUM | SR-1 / SR-3 (STD-UI-12) | Blueprint, screens | `product-ux-blueprint.md:303-312`, `:473-510`; `S08-portfolio.md:118-119`; see the status table | Carried from v3, extended: §8 omits the statuses listed in the status table, and now *Retiring: selling {n} positions at the next open* and *Retired* (`badge` `secondary`, tier "—") | Capabilities inherit untiered statuses | Map every rendered status, the two retire states included, to one tier with its shape in §8 |
| FINDING-16 | MEDIUM | SR-3 / SR-9 (STD-UI-8, STD-UI-12) | Blueprint, S06 | `product-ux-blueprint.md:216`, `:306`; `S06-backtest.md:74` | Carried from v3: tier shapes reused, *NO TRADING YET* without shape, S06's mark drawn unlike §4.4's | In greyscale a neutral badge reads as good | Give each tier one shape and every status its tier's shape |
| FINDING-17 | MEDIUM | SR-9 (STD-UI-25) | Blueprint, S02, S06, S07, S09 | `S02-setup.md:75`; `S06-backtest.md:98-99`; `S09-data-health.md:111-112`; `S07-promotion-review.md:124-126`; `product-ux-blueprint.md:208-223` | Carried from v3: polled regions with no last-updated time or no recorded cadence | STD-UI-25 unmet for the shell and four regions | Add *checked {time}* and a cadence to each |
| FINDING-18 | MEDIUM | SR-9 (STD-UI-28) | S01, Blueprint | `S01-home.md:147-148`; `product-ux-blueprint.md:593` | Carried from v3: sparklines without provenance; their table on an unspecified page | §11's STD-UI-28 claim unsupported | State measure, units, as-of and n, and specify the table's page |
| FINDING-19 | MEDIUM | SR-9 (STD-UI-18) | S09, Blueprint | `S09-data-health.md:134`; `product-ux-blueprint.md:583` | Carried from v3: only one check states its scope, and not alongside its result | Absence of detected problems presented without limits | State each check's coverage on its card |
| FINDING-20 | MEDIUM | SR-9 (STD-UI-5) | S01, S03, Blueprint | `S01-home.md:55`, `:131`; `S03-research.md:62`; `product-ux-blueprint.md:358` | Carried from v3: locale-formatted `h1`, zoneless *checked* time, non-ISO as-of | Nonconformance with a rule that allows no specialization | ISO dates; zone on every timestamp |
| FINDING-21 | MEDIUM | SR-9 (STD-UI-29) | Blueprint, screens | `product-ux-blueprint.md:179-206`, `:594`; screens as in the status table | Carried from v3: about twenty size literals while §11 claims only tokens | STD-UI-29 verification fails as written | Replace literals with tokens or route new sizes through the theme |
| FINDING-22 | MEDIUM | SR-9 (STD-UI-30) | S03, Blueprint | `S03-research.md:49-60`; `product-ux-blueprint.md:595` | Carried from v3: no search on the 3000-row list | STD-UI-30 unmet | Add search to S03's filters |
| FINDING-23 | MEDIUM | SR-3 / SR-5 | S03 | `S03-research.md:62`, `:77-79`, `:105`, `:107` | Carried from v3: no rendering for retired stocks (AC-15), score-update failure (AC-20) or the download the scores reflect (AC-21) | CAP-002's UX design misses three ACs | Render all three |
| FINDING-25 | MEDIUM | SR-8 / SR-1 (CONST-SA SA-MD-002) | Blueprint, S03 | `product-ux-blueprint.md:142-144`, `:166-170`; `S03-research.md:182-184` | Carried from v3: routes with neither spec nor resolvable source; S03 cites a CAP-002 design that does not exist | Unresolvable references | Specify the routes or name their source; fix S03's citation |
| FINDING-26 | MEDIUM | SR-8 | S07, Blueprint | `S07-promotion-review.md:77-84`; `product-ux-blueprint.md:530`, `:533`, `:534`, `:537`; `dialog/design-spec.md:35`, `:68`, `:85` | Carried from v3, extended: real-money dialogs without acknowledgement or content; the retire-live dialog has content but no acknowledgement, and its quantities sit in an option, not the description | Contract broken or invented | Give every real-money dialog its title, description with quantities and values, and acknowledgement |
| FINDING-27 | MEDIUM | SR-1 / SR-9 (STD-UI-19) | Blueprint | `product-ux-blueprint.md:512-537` | Carried from v3, partly changed: retiring is now tiered; changing review-gate settings and changing history depth are still untiered | Tiers left to each capability | Add the two rows (creating and discarding a strategy: FINDING-77) |
| FINDING-28 | MEDIUM | SR-8 (COMPONENT-SPEC-GAP; STD-UI-24) | Blueprint, S02 | `product-ux-blueprint.md:221`, `:320`; `S02-setup.md:168-170` | Carried from v3: tooltip on a non-focusable badge; chip links with no component; banner and file input not through intake | Undesigned components; keyboard access blocked | Route each through `design-system/intake.md` |
| FINDING-29 | MEDIUM | SR-8 | Blueprint, screens | `badge/design-spec.md:21`; `product-ux-blueprint.md:130-132`, `:311`, `:492`, `:505-507`; `S08-portfolio.md:127-128`; `S04-strategies.md:59-60`; `S06-backtest.md:44` | Carried from v3: multi-word badges and a count in a badge | Systematic conflict with the badge contract | Shorten to two words with the rest as text, or amend the badge spec |
| FINDING-30 | MEDIUM | SR-2 | S02 | `S02-setup.md:74`, `:115-117`, `:126` | Carried from v3: *Add later* leads to a step 4 that CAP-001 AC-24 refuses | First-run dead end | Skip or block step 4 when nothing is followed |
| FINDING-31 | MEDIUM | SR-3 / SR-5 | S02 | `S02-setup.md:51-52`, `:100`, `:109-111` | Carried from v3: near-miss suggestions cite a function that does not produce them | New behaviour with a wrong source | Name the new behaviour and its owner |
| FINDING-32 | MEDIUM | SR-3 | S09, S01 | `S09-data-health.md:122`; `S01-home.md:66` | Carried from v3: an M1 staleness definition unlike CAP-002 AC-13 | Two definitions of "current" | Use AC-13's definition |
| FINDING-33 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY | Blueprint | `product-ux-blueprint.md:177-206`, `:269-276`, `:551`; CAP-001 `design/ux-design.md:71`, `:85`, `:691` | Carried from v3: the shell drops CAP-001's approved status region and its AC-18 trace | An approved design element removed silently | Keep the region or record where AC-18 is now satisfied |
| FINDING-34 | MEDIUM | SR-6 (CONST-AGT AGT-EVIDENCE-002) | S05, Blueprint, S08, S03, S06 | as in the status table | Carried from v3: unsourced quantities remain | Capital-relevant defaults without an owner decision | Source each value or mark it `[REQUIRES INPUT]` |
| FINDING-35 | MEDIUM | SR-9 (CONST-SEC SEC-AUTH-001; CONST-AGT AGT-SPEC-002) | Blueprint | `product-ux-blueprint.md:201`, `:526-537`; `Capability-CAP-001.md:411-415` | Carried from v3, extended: capital-at-risk actions on the unauthenticated loopback interface, now including retiring a live strategy; surfaced, severity not judged | A security trade-off carries into M2 and M6 by default | Owner decision before the M2 UX design |
| FINDING-36 | MEDIUM | SR-2 | S07 | `S07-promotion-review.md:68`, `:110`, `:150`, `:174-175` | Carried from v3: the acknowledgement count disagrees across layout, view model, copy and S07-6 | The go-live gate's count is ambiguous | One acknowledgement per mark, stated the same way in all four |
| FINDING-53 | MEDIUM | SR-3 / SR-1 (STD-UI-12; charter §3) | Blueprint | `product-ux-blueprint.md:236-241`, `:508`, `:611`; `docs/constitution/standards/ui-conventions.md:350-352`; `docs/constitution/product-charter.md:119-122` | Carried from v3: the broker-engaged trading stop STD-UI-12 and the charter anticipate has no rendering | M2 and M6 have no state for a broker-side stop | Add the state, tiered serious, to §3.3 and §8 |
| FINDING-54 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY | S03, S05, Blueprint | `S03-research.md:52-58`, `:102`, `:120-121`; `S05-builder.md:51-54`, `:90`; `product-ux-blueprint.md:408-409` | Carried from v3: S03's thresholds cannot be carried into S05's percentile-floor conditions | The research-to-strategy hand-off drops or mistranslates the filter | Align S05's conditions with S03's measure and direction |
| FINDING-55 | MEDIUM | SR-1 / SR-3 (CAP-002 AC-2, AC-5) | S03 | `S03-research.md:61-64`, `:122-124`, `:136`, `:163-164`, `:174-176`; `Capability-CAP-002.md:202-203`, `:248-250`, `:257-259` | Carried from v3: save-as-universe at zero matches and for incomplete stocks undesigned | AC-5 unmet and AC-2's membership ambiguous | Block the save at zero; state incomplete-stock membership; map the dialog |
| FINDING-56 | MEDIUM | SR-8 (STD-UI-8, STD-UI-24) | Blueprint, S03, S05 | `product-ux-blueprint.md:321-325`; `S03-research.md:66`; `S05-builder.md:68-70`; `badge/design-spec.md:54` | Carried from v3: the *R* badge with an accessible-name override the badge cannot carry | The stricter-only mark has a label the component forbids | A mark component or a badge label meaningful out of context |
| FINDING-57 | MEDIUM | SR-8 (design source; blueprint §0) | S01, S03, S04, S05, S08 | `S01-home.md:163-168`; `S03-research.md:178-188`; `S04-strategies.md:147-149`; `S05-builder.md:161-165`; `S08-portfolio.md:184-193`; against `design-source/P01`, `P03`, `P04`, `P05`, `P08` | Carried from v3: canvas differences still unlisted (see the status table) | Implementers copying canvas copy reintroduce removed defects | List each difference with its reason |
| FINDING-58 | MEDIUM | SR-2 (STD-UI-2) | Blueprint, S01, S05, S09 | `product-ux-blueprint.md:101-103`, `:438-439`, `:517`; `S01-home.md:136`; `S09-data-health.md:131`; `S05-builder.md:135` | Carried from v3: copy says holding strategies keep incomplete stocks, against S05's **Sell it** | The owner can be told a live holding is safe while it is being sold | Condition the copy on the strategy's incomplete-data rule |
| FINDING-37 | LOW | SR-1 (STD-UI-23) | S06, S07 | `S06-backtest.md:107`, `:110`; `S07-promotion-review.md:138` | Carried from v3: "Not applicable" without reason | Inapplicability unreviewable | State each reason |
| FINDING-38 | LOW | SR-6 (STD-UI-1) | Blueprint, S07, S08, S09 | as in the status table | Carried from v3: vocabulary drift | Minor vocabulary drift | Align each with §7 |
| FINDING-39 | LOW | SR-1 | S04, Blueprint | `S04-strategies.md:52-53`; `product-ux-blueprint.md:147`, `:431-432` | Carried from v3, more pressing: the paused-and-retired list has no route or layout, and `/strategies/:id` has no redirect target for Paused or Retired, while D-12 sends retired strategies there and keeps their evidence | Undefined destinations | Route and lay out the list; state each stage's redirect target |
| FINDING-40 | LOW | SR-9 (STD-UI-19, 11, 21) | Blueprint | `product-ux-blueprint.md:528`, `:550`, `:576`, `:586` | Carried from v3 | The conformance table is less precise than the rules | Use STD-UI-19's tiers; note M1's omission in §11 |
| FINDING-41 | LOW | SR-2 | Blueprint, S01 | `product-ux-blueprint.md:289-290`; `S01-home.md:137` | Carried from v3 | Small inconsistencies in the home pattern | Add `active` to the sort; complete the Draft item |
| FINDING-42 | LOW | SR-1 (STD-UI-24) | S05, Blueprint, S08, S03 | `S05-builder.md:44`; `product-ux-blueprint.md:197`; `S08-portfolio.md:73`; `S03-research.md:122-127` | Carried from v3 | Small accessibility gaps | Keyboard rename, `nav` landmark, a way to the rest, completion confirmations |
| FINDING-43 | LOW | SR-6 (CONST-SA SA-MD-003) | S02 | `S02-setup.md:73` | Carried from v3 | Copy left to the implementer | Write the sentence |
| FINDING-44 | LOW | SR-6 | S07 | `S07-promotion-review.md:121-123`, `:137` | Carried from v3 | Routing ambiguous | State whether the stage persists |
| FINDING-45 | LOW | SR-5 | S03 | `S03-research.md:70`, `:111` | Carried from v3 | Wrong citation | Tag the holdings line M2 |
| FINDING-46 | LOW | SR-1 (CONST-SA SA-MD-001) | S04, S08, Blueprint, S02 | `S04-strategies.md:39-43`; `S08-portfolio.md:41-46`; `product-ux-blueprint.md:614-644`; `S02-setup.md:168-170` | Carried from v3 | Minor template drift | Name capabilities beside milestones; give intake reasons; move the file input to §4 |
| FINDING-47 | LOW | SR-8 | Blueprint (design-system changes) | `button/design-spec.md:35`; `chart/design-spec.md:33` | Carried from v3 | Variants render outside their tables | Remove the blank lines (a human edit to the design system) |
| FINDING-48 | LOW | CONST-AGT AGT-PROV-001 | Blueprint and S01 to S09 | `product-ux-blueprint.md:19-23`; each screen's frontmatter `:16-20` | Carried from v3 | Provenance not traceable to an agent | Record the producing agent and tool version |
| FINDING-49 | LOW | SR-4 | S08 | `S08-portfolio.md:177` | Carried from v3 | Check not decidable | Quantify the separation |
| FINDING-50 | LOW | SR-7 | Blueprint, S06 | `product-ux-blueprint.md:627`, `:637-638`; `S06-backtest.md:93` | Carried from v3 | Library choices and licence records left to implementation | Record cmdk and the virtualisation library in the tech stack |
| FINDING-59 | LOW | SR-2 (STD-UI-19) | S09, Blueprint | `S09-data-health.md:108-110`; `product-ux-blueprint.md:516` | Carried from v3 | A confirmation STD-UI-19 forbids may be added | Drop "confirmed" for the routine half |
| FINDING-60 | LOW | SR-5 / SR-6 (CONST-AGT AGT-SCOPE-002) | Blueprint, S09 | `product-ux-blueprint.md:550-551`; `S09-data-health.md:43` | Carried from v3 | The new capability starts from an untrue ownership statement | Name the CAP-002 dependency in §10 |
| FINDING-61 | LOW | SR-1 (CONST-SA SA-MD-001) | S05 | `S05-builder.md:147-159` | Carried from v3 | Check identifiers read out of order | Move S05-6 after S05-5 |
| FINDING-62 | LOW | SR-2 (STD-UI-26) | S02 | `S02-setup.md:51-52`, `:62` | Carried from v3 | The M1 position indicator counts a step that does not exist | *Step n of N* |
| FINDING-63 | LOW | SR-6 (STD-UI-2) | Blueprint | `product-ux-blueprint.md:441-445`, `:529`, `:531` | Carried from v3 (retire sells: FINDING-75) | The confirmation can misstate when orders resume | List strategies and dates; state paused strategies stay paused |
| FINDING-64 | LOW | SR-8 | Blueprint | `product-ux-blueprint.md:517`, `:526`, `:527`, `:529`, `:531`, `:535`, `:536`; `dialog/design-spec.md:85-86` | Carried from v3, extended to *Retire {name}?* | Implementations break the content rules or invent labels | Action titles and verb confirm labels |

---

## Traceability Matrix

### Milestone map against the charter (SR-5)

| §10 row | Charter milestone | Capability named | Exists or future | Verdict |
|---------|-------------------|------------------|------------------|---------|
| M1 App shell & data health | M1 Universe & Factors | New capability (D-8) | Future work, named; to be defined through the pipeline | PASS; wording and dependency FINDING-60 |
| M1 CAP-001 | M1 | CAP-001 v8, approved | Exists; "no new work" | PASS; FINDING-60, 33 |
| M1 CAP-002 | M1 | CAP-002 v1, draft | Exists; S03 claims AC-2 and delivers it | PASS; content FINDING-23, 25, 55 |
| M2 | M2 Strategies & Paper Trading | Strategies & paper trading | Future work, named; now includes retiring a paper strategy (D-12) | PASS; content FINDING-10, 11, 54, 66, 69, 74, 75, 76, 77 |
| M3 | M3 Live Market Data | Live market data | Future work, named | PASS |
| M4 | M4 Backtesting | Backtesting | Future work, named | PASS; content FINDING-67 |
| M5 | M5 Promotion Gate | Promotion gate | Future work, named | PASS |
| M6 | M6 Live Trading | Live trading | Future work, named; now includes retiring a live strategy (D-12) | PASS; content FINDING-68, 69, 70, 74, 75, 76 |

### Owner decisions (VER-EVD-004)

| Decision | Where it should show | Verdict | Evidence |
|----------|----------------------|---------|----------|
| D-1 display labels | §7, all copy | PASS (§7); copy residue LOW | §7 equals STD-UI-1 v6 (`:454-467`); FINDING-38, 72, 78 |
| D-2 scheduled downloads from M2 | §10 M2, S09 §2 and §11 | PASS, with FINDING-32 for M1 staleness | `:553`; `S09:46`, `:162-164` |
| D-3 gate criteria are owner settings | S04, S07, Settings | PARTIAL | S07 evaluates the settings (`S07:106`); S04 states two of four (FINDING-12); Settings deferred to M5's design (`:168-170`) |
| D-4 written rationale | S07 | PASS | `S07:68-70`, `:152`, S07-2 |
| D-5 environment tokens outside the region | S01, S04, S08 | PASS | Always with words: S01-2, S04-2, S08 §1 |
| D-6 only shipped stages | §4.2, S04, S05 | PARTIAL | Live shown from M2 against S04-4; not-grandfathered case unrendered (FINDING-11); superseded backtest (FINDING-67) |
| D-7 kill switch in M2 | §10 M2, §3.3, S08 | PASS | `:234`, `:528-531`, `:553`; `S08:45`; retire sells respect it (`:429-431`); Resume trading omits them (FINDING-75) |
| D-8 new M1 capability | §10 M1, S01, S02, S09 §2 | PASS | `:550-552`; `S01:42`; `S02:51-52`; `S09:43`. Wording FINDING-60 |
| D-9 S09 recovery as CAP-001 provides | S09, §6, §9 | PASS | `S09:60-65`, `:100-110`, `:155-157`; `:434-439`, `:518`. Wording FINDING-59 |
| D-10 an edit makes a new strategy | §6, §9, S04, S05 | PARTIAL | Applied everywhere it names (`:414-420`, `:523-524`, `:610`; `S04:99-102`; `S05:100-105`, S05-2), and retiring, the way the original ends, is now designed (D-12). The copy cannot be discarded (FINDING-77); read-only scope (FINDING-66); superseded backtest (FINDING-67) |
| D-11 daily-loss limit stops one strategy until resumed | §3.3, §4.3, §8, §9, S01, S04, S07, S08 | PARTIAL | Scope, measure, default and the owner's resume applied (`:236-252`, `:311`, `:506`, `:534-535`; `S01:138`; `S04:103-105`; `S08:126-133`). Pause interaction (FINDING-68); retire interaction (FINDING-74); paper milestone and setting surface (FINDING-69); broker-engaged stop (FINDING-53) |
| D-12 the owner chooses what retiring does to holdings | §6, §9, §10, §12, S04, S08, S01 | PARTIAL | The choice, its two outcomes, the tiers and the control are applied everywhere D-12 names (`:422-432`, `:536-537`, `:553`, `:557`, `:612`; `S04:52-53`; `S08:66-69`, `:74-78`, `:117-122`, S08-7; `S01:138`). The interval before the sells (FINDING-74), failed sells and the kill switch (FINDING-75), unmanaged holdings (FINDING-76), dialog copy and vocabulary (FINDING-78), S08's other sections (FINDING-79) |

### CAP-002 acceptance criteria with UX implications

| AC | Where the subjects address it | Verdict |
|----|-------------------------------|---------|
| AC-1 universe by hand | S03 tray *Add to universe…* → *New universe*; universes route (unspecified) | PARTIAL (FINDING-25) |
| AC-2 universe from a filter | S03 **Save these {n} as a universe…**, S03-7 | PARTIAL (FINDING-55) |
| AC-3 to AC-6 several universes, maintenance, no empty universe, membership history | Universes routes, "CAP-002 page, restyled"; §9 tiers (`:520-522`); AC-5 at the save action unspecified | GAP (FINDING-25, 55) |
| AC-8 one peer set | S03 helper and footnote "of the stocks scored on this factor" | PASS |
| AC-9 score and percentile | §4.4 percentile in list, standardised score in inspector | PASS |
| AC-12 like-for-like | §4.4 *Incomplete*; S01 and S09 copy agree | PASS |
| AC-14 enough to rank | S03 Unavailable state, S03-4 | PASS |
| AC-15 retired stocks | No rendering | GAP (FINDING-23) |
| AC-16 compare | S03 sort, thresholds above or below on score or percentile; compare route | PASS (route unspecified, FINDING-25) |
| AC-17 evidence | S03 inspector, S03-3, evidence route | PASS (route unspecified, FINDING-25) |
| AC-18 classification history | Evidence route only | GAP in spec (FINDING-25) |
| AC-20 previous set while not current | S03 banner; failure branch absent | PARTIAL (FINDING-23) |
| AC-21 currency | As-of time shown; download only in banner | PARTIAL (FINDING-23) |
| AC-22 honest empty state | S03 Empty, never populated | PASS |
| AC-23 restatement mark | §4.4 in lists and previews, S03-6, S05-6, S06, S07 | PASS (form FINDING-56) |

### CAP-001 acceptance criteria with UX implications

| AC | Where the subjects address it | Verdict |
|----|-------------------------------|---------|
| AC-1 named list | S02 step 3; `/data/followed`; S09 *Follow a different symbol* | PASS |
| AC-2 depth stated | S02 step 2 | PASS |
| AC-6 re-run safety | S09 **Download now** as the retry, copy states it | PASS |
| AC-7 coverage visibility | `/data/coverage` restyled | PASS |
| AC-8 gap visibility | S09 Daily prices; S09 Unavailable | PASS |
| AC-9 honest outcome | §7, §8, S09-1 | PASS |
| AC-10 failure diagnosis | S09 Needs fixing, S09-2 | PASS |
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
| STD-UI-1 | yes | PARTIAL | §7 matches v6; copy residue FINDING-38; *Stopped* for two sets FINDING-72; D-12 labels unrecorded FINDING-78 |
| STD-UI-2 | yes | PARTIAL | FINDING-58, 63, 66, 71; *NO TRADING YET* after every strategy is retired FINDING-76; *Sell everything* FINDING-78 |
| STD-UI-3 | yes | PASS | Signed returns and scores; fixed precision stated |
| STD-UI-4 | yes | PASS | §4.4; S01-5 and S08-3 never render $0.00 |
| STD-UI-5 | yes | FAIL | FINDING-20 |
| STD-UI-6 | yes | PASS | Full figures in tables and chart labels |
| STD-UI-7 | yes | PASS | One job per palette; risk tokens only with words |
| STD-UI-8 | yes | PARTIAL | FINDING-16, 56 |
| STD-UI-9 | yes | PASS | S06 colour by entity |
| STD-UI-10 | no | NOT APPLICABLE | Binds the theme; no token added |
| STD-UI-11 | yes | PASS from M2 | §3.2, S01-2, S04-2; the retire dialogs keep paper and real money apart (`:536-537`); M1 note FINDING-40 |
| STD-UI-12 | yes | PARTIAL | FINDING-15 (now also *Retiring* and *Retired*), 16, 53 |
| STD-UI-13 | yes | PASS | §4.8, S01-6, S03-3; the retire-live sell option states value "at the last close" (`:537`) |
| STD-UI-14 | yes | PASS | Three presence states; *Can't read account* never zero |
| STD-UI-15 | yes | PASS | S05 preview labelled as such |
| STD-UI-16 | yes | PASS | Incomplete shown, never filled |
| STD-UI-17 | yes | PASS | §4.4 in lists and previews, S03-6, S05-6, S06 limits, S07 acknowledgement; form FINDING-56 |
| STD-UI-18 | yes | FAIL | FINDING-19 |
| STD-UI-19 | yes | PARTIAL | Retiring now tiered (`:536-537`). FINDING-27, 40, 68, 77 |
| STD-UI-20 | yes | PASS | S07-1 to S07-6; every go-live is a first go-live under D-10; consistency FINDING-36 |
| STD-UI-21 | yes | PASS from M2 | §3.3, S08-2; retire sells respect the stop (`:429-431`) |
| STD-UI-22 | yes | PASS | §4.9, S07-4, S08-5; **Retire {name}…** sits last on the card, `--space-5` from the consequential control before it and away from the routine **Evidence** (`S08:66-69`) |
| STD-UI-23 | yes | PARTIAL | Eight states on every screen; reasons missing (FINDING-37) |
| STD-UI-24 | yes | PARTIAL | FINDING-28, 42, 56, 73 |
| STD-UI-25 | yes | FAIL | FINDING-17 |
| STD-UI-26 | yes | PASS | S02 vertical stepper, S02-1, S02-2; position text FINDING-62 (LOW) |
| STD-UI-27 | yes | PASS | S06-1 |
| STD-UI-28 | yes | FAIL | FINDING-18 (S06 passes, S06-2) |
| STD-UI-29 | yes | FAIL | FINDING-21 |
| STD-UI-30 | yes | FAIL | FINDING-22 |

---

## Pipeline Readiness Assessment

**Verdict: READY**

No CRITICAL and no HIGH finding, so the rubric's verdict is READY. v3's only HIGH
finding, FINDING-65, is resolved by D-12 and was verified element by element
against the current text.

The new findings were weighed against HIGH under the calibration v1 to v3 used,
where a HIGH leaves capital-at-risk behaviour, a normative conflict or a
cross-spec contradiction to the implementer, and a gap a later capability's UX
design can close without contradicting these subjects is MEDIUM or below:

- **FINDING-74** is the nearest to HIGH: a literal reading of "Retiring ends a
  pause or a daily-loss stop" lets a retiring live strategy rebalance before its
  sells go. It is MEDIUM because the confirmed behaviour the owner sees is
  sells only (STD-UI-2 already binds the implementation to it), because the M6
  UX design can state "no order but the retire sells" without contradicting
  D-12, and because v3 rated the same class (v3 FINDING-68) MEDIUM.
- **FINDING-75 and 76** concern visibility and attribution of positions after
  the owner's explicit choice, and the per-stock limit question v3 already
  holds at MEDIUM (v3 FINDING-70). A later design can close both without
  contradicting the subjects.
- **FINDING-77** touches no capital: it is the part of v3 FINDING-65's
  recommendation D-12 did not answer.

The owner may judge otherwise. What remains:

- **FINDING-74 to 77.** Four MEDIUM edges of D-12; 76 and 77 need owner
  answers, 74 and 75 are text once the intended behaviour is stated.
- **The 35 carried MEDIUM findings**, unaddressed by choice. The STD-UI set
  (FINDING-15 to 22, 26 to 29) is inherited by every capability that cites
  §11; v3 FINDING-68 now carries an internal contradiction the D-12 commit
  introduced (S08 §3 against §3.3 and S01).

CONST-AGT Enforcement treats Medium violations as surfaced and logged, not
necessarily blocking. This review approves nothing. Each schema-versioned
subject (PRODUCT-UX and PRODUCT-UX-S01 to S09) stays blocked from downstream
gates until the owner explicitly approves it with
`scripts/artifact-gate.py approve --review-artifact docs/ux/specifications-review-report-v4.md`.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

None.

### Should Fix (MEDIUM findings)

New: FINDING-74 (the retiring interval: no order but the retire sells, open
orders, state, cancellation), 75 (failed retire sells; pending sells in the
Resume trading dialog and its tier), 76 (unmanaged holdings: limits, shared
stocks, broker-side sales, environments with no active strategy), 77
(discarding a draft; tier of creating a strategy).

Carried: FINDING-10 to 12, 15 to 23, 25 to 36, 53 to 58, 66 to 70. Prioritise
the STD-UI conformance set (15 to 22, 26 to 29), because every capability
inherits it; the owner decisions (32, 34, 35, 53, 70, 76, 77); and v3
FINDING-68, whose S08 §3 now contradicts §3.3 and S01.

### Nice to Have (LOW findings)

New: FINDING-78, 79. Carried: FINDING-37 to 50, 59 to 64, 71 to 73.
