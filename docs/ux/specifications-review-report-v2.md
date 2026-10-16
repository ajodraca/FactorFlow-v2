---
artifact_schema_version: 1
artifact_id: PRODUCT-UX-specification-review
artifact_type: specification-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-16
updated: 2026-10-16
document: spec-review-report
capability: PRODUCT-UX
version: v2
generated: 2026-10-16T03:51:09Z
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
    result: "Project-wide --strict: PASSED with 230 warnings, exit 0, 281 artifacts; none names docs/ux. The one warning v1 did not have is upstream of the subjects: STD-UI pins PRODUCT-UX v3, now v4. Scoped -a docs/ux --strict before this report: PASSED, exit 0, 11 artifacts, no warning. After writing it: PASSED, exit 0, 12 artifacts (1 ux blueprint, 9 ux screen specs, 2 specification reviews), no warning"
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
  SR-7: "applied — limited to the technical commitments the blueprint makes: route migration, shell and pattern locations, server-side virtualised lists, kill-switch read-back, command palette library, evidence snapshot, version replacement (D-10)"
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
    artifact_version: 4
    content_revision: sha256:20b46f5be2392900319523be2ddda600043c85f7ae5751fb0266f6fbb65a1471
  - artifact_id: PRODUCT-UX-S01
    artifact_version: 2
    content_revision: sha256:3eadf8d67ecc23b360217504363d748aee64d15706fc97857205163b48e6ea5e
  - artifact_id: PRODUCT-UX-S02
    artifact_version: 2
    content_revision: sha256:37803e1e04f1b9f144eeb1bf1a490cf3523011989b67f1595ebde01fb3ecb921
  - artifact_id: PRODUCT-UX-S03
    artifact_version: 2
    content_revision: sha256:db91749ade5ab00c2b9eef5a1f0f14c20e65a548dd923762712961bfeccc95b4
  - artifact_id: PRODUCT-UX-S04
    artifact_version: 2
    content_revision: sha256:c67701da5fb9b87e6015d0de8a2d9ed79d817f73af19f4416b61991d40fdf88e
  - artifact_id: PRODUCT-UX-S05
    artifact_version: 2
    content_revision: sha256:facd6be259524650828014ffaa7cb7a3dc82029ef1ede2f94ace2124dd19d810
  - artifact_id: PRODUCT-UX-S06
    artifact_version: 2
    content_revision: sha256:b10d822b61ed5ddae868029d561a5ee8565383e7290b20f872c935b97e9e9eab
  - artifact_id: PRODUCT-UX-S07
    artifact_version: 2
    content_revision: sha256:9a6f76a46cddbee61417ee4fb304be22bb052140ba879359a11d4f637e3f0d0d
  - artifact_id: PRODUCT-UX-S08
    artifact_version: 2
    content_revision: sha256:f362b2a7fae53484ed996bb8463148020781500ad46bda5f75de597630541516
  - artifact_id: PRODUCT-UX-S09
    artifact_version: 2
    content_revision: sha256:7165c935175c56759db4d1046667c62be4f030224e942ef80e8af1a1760ab407
statistics:
  total_findings: 52
  critical: 0
  high: 2
  medium: 30
  low: 20
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.301"
  timestamp: 2026-10-16T03:51:09Z
  source_artifacts:
    - id: PRODUCT-UX
      version: "4"
    - id: PRODUCT-UX-S01
      version: "2"
    - id: PRODUCT-UX-S02
      version: "2"
    - id: PRODUCT-UX-S03
      version: "2"
    - id: PRODUCT-UX-S04
      version: "2"
    - id: PRODUCT-UX-S05
      version: "2"
    - id: PRODUCT-UX-S06
      version: "2"
    - id: PRODUCT-UX-S07
      version: "2"
    - id: PRODUCT-UX-S08
      version: "2"
    - id: PRODUCT-UX-S09
      version: "2"
    - id: PRODUCT-UX-specification-review
      version: "1 (previous review, context)"
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
| **Version** | v2 |
| **Specifications Reviewed** | `docs/ux/product-ux-blueprint.md` (PRODUCT-UX v4) and nine screen specifications `docs/ux/screens/S01-home.md` to `S09-data-health.md` (PRODUCT-UX-S01 to S09, v2 each) |
| **Total Findings** | 52 open (0 CRITICAL, 2 HIGH, 30 MEDIUM, 20 LOW): 38 carried from v1, 14 new |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

CRITICAL 0 · HIGH 2 · MEDIUM 30 · LOW 20 · **total 52**.

**What changed since v1.** One commit, `c7d5717` on
`usr/alvaro-de-jodra/product-ux-blueprint`, after the v1 head `5a2ba51`. It
records owner decisions D-8 to D-11 (blueprint §12), raises the blueprint to v4
and every screen to v2, and changes text to answer the nine v1 HIGH findings.
All ten subjects changed, so all ten were read in full at their current
revisions, and the diff `5a2ba51..c7d5717` was read line by line.

**v1 resolved: 12 of 50, including all nine HIGH findings.** Each was verified
against the current text and its upstream source, not taken from the revision
history. FINDING-13, 14 and 24 (MEDIUM) were resolved in passing; FINDING-27
(MEDIUM) and FINDING-46 (LOW) were partly resolved. The other 38 are carried,
re-verified at current lines; severities are unchanged on re-evaluation.

**New in this round: 2 HIGH, 6 MEDIUM, 6 LOW (FINDING-51 to FINDING-64).**
Most come from the fixes themselves:

- **FINDING-51 (HIGH), D-10.** The running version keeps trading, but the path by
  which a new version replaces it is not designed. For a live strategy the draft
  must earn its own paper stage, so one strategy runs two versions at once, which
  no view model can hold. The replacement through S07 and through **Start paper
  trading** has no wording and no rule for existing positions.
- **FINDING-52 (HIGH), D-11.** A strategy that hits its daily-loss limit stops
  itself, and nothing says how it ever trades again. This is the per-strategy
  form of v1 FINDING-9's "stop the owner cannot undo". S04 has no rendering for it,
  and the limit's value and base are left open.
- **FINDING-53 to 58 (MEDIUM).** The D-11 rewrite dropped the broker-engaged
  stop that the charter and STD-UI-12 anticipate. S03's new thresholds cannot be
  carried into S05's conditions. The new save-as-universe action leaves AC-5's
  zero-match case and incomplete stocks open. The new list mark *R* conflicts
  with the badge's accessibility contract. Four screens' "Differences from the
  canvas" lists no longer cover what changed. And copy saying strategies "won't
  trade" incomplete stocks contradicts S05's **Sell it** rule.

**Verdict:** READY-WITH-WARNINGS. No CRITICAL finding; two HIGH findings. As
in v1, CONST-AGT's Enforcement section asks for HIGH violations to be resolved
before gate passage, and CONST-REV asks for re-review after them. Recommendation:
owner decisions on FINDING-51 and FINDING-52, then a v3 review, before approving
any of the ten artifacts.

## Review Scope

**Subjects (10), read in full at the revisions in `review_subjects`.** Project
repo `repos/factorflow-v2/FactorFlow-v2` (symlink to `/home/claude/factorflow-v2`),
branch `usr/alvaro-de-jodra/product-ux-blueprint`, head `c7d5717`, working tree
clean. Harness at `/home/claude/ai-agents`, branch
`usr/alvaro-de-jodra/product-ux-artifact-types`, head `ad589c0`, clean. All ten
subjects are `status: draft`; none carries an approval block.

**Upstream read this session, in full or in the parts the subjects cite:**

- `docs/constitution/standards/ui-conventions.md` (STD-UI v6, approved), all 30
  rules, §1, §4 and §5.
- `docs/constitution/product-charter.md` v2 (approved), in full.
- `Capability-CAP-001.md` v8 (approved): scope, flows, all 26 ACs, §5 to §7.
  CAP-001 `design/ux-design.md` v5 (status region, AC-18 trace) and
  `component-design-ingestion-api.md` (run detail, failure records, endpoints).
- `Capability-CAP-002.md` v1 (draft), §1 to §8 in full. CAP-002 has no `design/`
  directory.
- `design-system/`: resolution per `docs/design-system.md`; the `badge`,
  `dialog` and `button` specs in full; the variant tables of all 18 specs (every
  component and variant the subjects name was checked by script); every
  `--token` the subjects name, against `theme.css` (41 distinct, all resolve
  except the documented non-token `--surface` and the family patterns `--risk-*`
  and `--seq`).
- `docs/ux/design-source/`: README, and the visible text of P01, P03, P04, P05,
  P08 and P09, to check each screen's §11.
- The harness templates `docs/templates/ux-blueprint.md` and
  `docs/templates/ux-screen-spec.md`, and `.agents/skills/edg-compliance/SKILL.md`
  (checklist).
- `docs/ux/specifications-review-report-v1.md`, to verify each v1 finding.

**Not available:** CAP-002 design artifacts, the M1 capability D-8 names (not
yet defined), and the private canvas page (its mirrored sources were used).

**Numbering.** Carried findings keep their v1 identifiers. New findings
continue the sequence from FINDING-51, which is the convention this project's
reviews already follow (CAP-001 reviews v12 and v13; STD-UI review v4). Read
"the v2 report's own sequence" as that continuation; no v1 identifier is reused.

**Mapping to the template's `specifications_reviewed` fields**, as the Product
UX Scope prescribes: `capability_spec` is the blueprint, `ux_design_spec` the
screens directory, the rest `not-provided`. The Product UX Scope has no
capability stage, so `pipeline-state.py` and `get-capability-specifications`
were not run, as the skill directs.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | Counted by script: blueprint §0 to §14 (15 sections); each screen §1 to §11; §5 table 9 rows, `screens/` 9 files, one to one; 8 state rows in every screen; 52 acceptance checks (S01 7, S02 6, S03 7, S04 4, S05 6, S06 5, S07 6, S08 6, S09 5). New: FINDING-52 (no resume path), FINDING-55. Carried: FINDING-15, 25, 27, 37, 39, 42, 46 |
| SR-2 Correctness | applied | Each screen against the shell, status map, action tiers and vocabulary; screens against each other; every flow walked per milestone. New: FINDING-51, 52, 58, 59, 61, 62. Carried: FINDING-10, 30, 36, 41, 44 |
| SR-3 Consistency | applied | Routes, milestones, labels, entities and decisions across blueprint, screens, charter, CAP-001, CAP-002, STD-UI v6 and the design system. New: FINDING-53, 54, 57. Carried: FINDING-11, 12, 15, 16, 23, 31, 32, 33 |
| SR-4 Testability | applied | All 52 acceptance checks read for an observable outcome; the three new ones (S03-7, S05-6, S08-6) are observable. Carried: FINDING-49 |
| SR-5 Traceability | applied | Each §10 row against a charter milestone (all resolve) and each named capability (CAP-001, CAP-002 exist; the D-8 capability and M2 to M6 are named future work). Each AC a screen cites against its text. New: FINDING-60. Carried: FINDING-23, 45 |
| SR-6 Clarity | applied | Vague modifiers, undefined references, unsourced quantities, truncated copy. New: FINDING-63. Carried: FINDING-34, 38, 43 |
| SR-7 Feasibility | applied — limited to the blueprint's technical commitments | Route migration, scoped retry removed (D-9, matches CAP-001's run API), virtualised list and command palette against tech-stack v5, kill-switch read-back, version replacement. Carried: FINDING-50 |
| SR-8 UX Completeness | applied | `design_system_available = true`. Components and variants checked by script against all 18 specs (all exist); tokens against `theme.css` (all resolve); design sources S01 to S09 resolve and their §11 lists were compared with the canvas text; EDG via STD-UI §1.2 plus the `edg-compliance` checklist. New: FINDING-56, 57, 64. Carried: FINDING-25, 26, 28, 29, 47 |
| SR-9 Dependencies and Conformance | applied | §11 against STD-UI v6, rule by rule (Traceability Matrix). Dependency half: no dependency table in the blueprint; `check-capabilities.py` clean. Carried: FINDING-17 to 22, 35, 40 |
| SR-10 Architectural Vocabulary | not applicable — the blueprint is not a system design | It declares no components or interfaces; "strategy service", "promotion service" and the like are named view-model sources, not a design |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run — PASSED, exit 0, no error or warning | none |
| `build-architecture.py -p factorflow-v2` | run — PASSED, exit 0, 1 design, 12 components, 16 interfaces | none (SR-10 not applicable) |
| `check-artifacts.py -p factorflow-v2 --strict` | run — PASSED with 230 warnings, exit 0; none in `docs/ux`. The one new warning is on STD-UI, which pins PRODUCT-UX v3 as a source while the blueprint is now v4: upstream drift on an approved standard, not a defect in a subject | none |
| `check-artifacts.py -p factorflow-v2 --strict -a docs/ux` | run — before this report: PASSED, exit 0, 11 artifacts, no warning. After writing it: the first run counted the v1-status table's rows as findings (4 count errors), so those identifiers are written `v1 FINDING-n`; the re-run PASSED, exit 0, 12 artifacts, no warning | none |
| `check-references.py` | run — PASSED, 1127 references in 210 harness Markdown files | none; the subjects are outside its scope, so their references were checked by hand (FINDING-25 carried) |
| `check-constitutions.py` | run — PASSED, 10 constitutions, 36 skills | none |
| `artifact-gate.py revision`, each subject | run — 10 digests, recorded in `review_subjects` | none |

The prerequisite gate (`check-prerequisites.sh --project factorflow-v2`) passed
this session, exit 0, before any step ran.

## Constitutions Applied

The relevance matrix assigns `specification-review` seven harness constitutions.
All seven were read in full this session.

| Constitution | What it produced in this review |
|--------------|---------------------------------|
| CONST-AGT 2.3 | **AGT-AUTH-002:** D-8 to D-11 now appear as decision records (§12), which is what v1 asked for. Two follow-on decisions they leave open are surfaced, not taken: FINDING-51 (how a new version replaces a running one) and FINDING-52 (how a limit-stopped strategy resumes); FINDING-53 records that the D-11 rewrite removed a state no decision covered. **AGT-SCOPE-002:** D-8 moves new work off CAP-001 to a new capability, which is the path the invariant prescribes; the row's wording is FINDING-60. **AGT-SPEC-002:** FINDING-35 carried, severity not judged here. **AGT-EVIDENCE-002:** FINDING-34 carried. **AGT-PROV-001:** FINDING-48 carried; this report's provenance is complete. **AGT-AUTH-001:** this review approves nothing |
| CONST-REV 1.4 | REV-STG-001: spec compliance (SR-3, SR-5, SR-9 and the D, CAP and STD-UI matrices) and artifact quality (SR-1, SR-2, SR-4, SR-6, SR-8) are separate stages. REV-AGT-001: the subjects are agent-drafted and were held to the full bar. REV-RCV-001: the change log's claims were verified, not accepted (Status of v1 Findings) |
| CONST-VER 1.2 | VER-EVD-001: every script ran this session and its output is recorded. VER-EVD-004: per-finding verdicts for all 50 v1 findings, per-decision verdicts for D-1 to D-11, and per-rule verdicts for STD-UI-1 to 30 |
| CONST-SA 2.0 | SA-MD-001 template structure (FINDING-46 carried, FINDING-61), SA-MD-002 cross-references (FINDING-25 carried), SA-MD-003 placeholder text (FINDING-43 carried) |
| CONST-SEC 1.3 | In force (revision recomputed and equal to the approval block; identical on `origin/main`). The subjects never render the provider key (S02-4, S09-4; SEC-SEC-001, CAP-001 AC-13 respected). FINDING-35 carried: capital-at-risk actions, and from M2 the kill switch and **Resume trading**, sit on the unauthenticated loopback interface. New state-changing routes fall under SEC-ENC-001 (H9) for the browser-to-API channel; that is a system-design matter for M2, M5 and M6, not a blueprint finding |
| CONST-OPS 1.3 | No destructive operation in this review; the only write is this report. OPS-ERR-001: the kill-switch failure path is specified (§3.3). OPS-MIG-003: the route migration states a one-release redirect |
| CONST-MDL 1.3 | Exact model identifiers in the subjects' provenance (`claude-opus-5-5`) and in this report's |

Project constitution in scope: STD-UI v6 (approved, the standard under SR-9),
the product charter v2 and the tech stack v5.

---

## Status of v1 Findings

Every v1 finding was checked against the current text and the upstream source
it cites. "Resolved" means the defect is gone at the cited lines and nothing
equivalent replaced it; follow-on defects the fix created are new findings and
are cross-referenced.

| v1 ID | v1 severity | Status in v2 | Evidence (current lines) |
|-------|-------------|--------------|--------------------------|
| v1 FINDING-1 | HIGH | **Resolved** | D-8 (`product-ux-blueprint.md:580`) assigns the shell, migration, S01, S02 and S09 to a new capability, *App shell & data health*, named as future work; §10 M1 (`:522-524`) gives CAP-001 "no new work" and drops "shipped". This is the path AGT-SCOPE-002 prescribes. Residual wording: FINDING-60 (LOW) |
| v1 FINDING-2 | HIGH | **Resolved** | D-9 (`:581`); S09 offers **Download now** over the followed list and two separate actions for a not-found symbol (`S09-data-health.md:60-65`, `:100-110`); copy now matches CAP-001 AC-6 and its recovery flow (`Capability-CAP-001.md:226-227`, `:168-170`); the canvas retry buttons are listed in S09 §11 (`:155-157`). Follow-on: FINDING-59 (LOW) |
| v1 FINDING-3 | HIGH | **Resolved** | S03 adds **Save these {n} as a universe…** (`S03-research.md:63-64`, `:122-124`, S03-7 `:174-176`), thresholds on percentile or standardised score, at least or at most (`:52-58`, `:102`), and drops saved screens (§11 `:185-186`), matching CAP-002 §2 (`Capability-CAP-002.md:126-131`) and AC-2. Follow-ons: FINDING-54, 55 (MEDIUM) |
| v1 FINDING-4 | HIGH | **Resolved** | §7 drops *coverage → data*, adds *instrument → stock*, cites v6 (`:426-443`); *promotion* is gone from user copy (S01 `:134`, S04 `:127`, S07 `:127-129`, S08 `:127`; Settings section *Review gate*). Remaining vocabulary drift ("kill switch", "timed out") is FINDING-38 (LOW, carried) |
| v1 FINDING-5 | HIGH | **Resolved** | S01's data item now follows CAP-002 AC-12 and AC-13 (`S01-home.md:136`); S09 §11 lists the P09 Factor-scores sentence (`S09-data-health.md:158-161`). Follow-on: S01 §11 does not list the same sentence on P01 (FINDING-57) |
| v1 FINDING-6 | HIGH | **Resolved** | §4.4 puts the *Possibly restated* mark in lists and previews (`:310-314`); S03's table (`:66`, S03-6 `:171-173`) and S05's picks (`:68-70`, `:93`, S05-6) carry it; §11's STD-UI-17 cell is corrected (`:554`). Follow-on: the mark's form (FINDING-56, MEDIUM); S06 still draws it differently (FINDING-16, carried) |
| v1 FINDING-7 | HIGH | **Resolved** | D-10 (`:582`): the running version keeps trading; §6 (`:403-408`), §9 (`:499`), S05 (`:97-104`, S05-2) and S04 (`:58-61`, `:100-103`, S04-1) now agree on what an edit does. Follow-on: the replacement path (FINDING-51, HIGH) |
| v1 FINDING-8 | HIGH | **Resolved** | D-11 (`:583`): per strategy. §3.3 (`:236-241`), §4.3 (`:300`), §8 (`:482`), S01 (`:59-63`), S07's dialog (`:82`) and S08 (`:57-63`, `:113-117`, S08-6) all say one strategy stops. Follow-ons: FINDING-52 (HIGH), FINDING-53 (MEDIUM) |
| v1 FINDING-9 | HIGH | **Resolved** | Resume trading while only paper would resume, and resuming a paused paper strategy, ship in M2 through `dialog` `confirm` with the `paper` badge (§3.3 `:234`, §9 `:504`, `:506`, §10 M2 `:525`, S08 `:45`, `:110-112`, S08-4); this is what the dialog spec prescribes for paper (`dialog/design-spec.md:37-39`). Copy detail: FINDING-63 (LOW) |
| v1 FINDING-10 | MEDIUM | Open, MEDIUM | S04's Paper card facts still include tracking distance from the backtest and gate progress, and the footer still links Settings → Review gate, none tagged by milestone (`S04-strategies.md:63-64`, `:66-67`, `:75`); backtests arrive in M4 and the gate in M5 |
| v1 FINDING-11 | MEDIUM | Open, MEDIUM | S04 §2 now says the Live column is present from M2, "empty until M6" (`:41`), which contradicts S04-4 (`:143`) and D-6 (`:578`) more directly than before; §10 M2 still gives the stepper *Live* (`:525`). The not-grandfathered case still has no rendering |
| v1 FINDING-12 | MEDIUM | Open, MEDIUM | `gate` still carries two of D-3's four criteria (`S04:95`); the footer still states two, with literal 60 and 2 (`:127`) |
| v1 FINDING-13 | MEDIUM | **Resolved** | §2.3 now states the review-gate and live-limit sections are designed by the M5 and M6 UX designs (`:168-170`), and §9 places live-limit changes on Settings only (`:508`), the alternative v1 offered |
| v1 FINDING-14 | MEDIUM | **Resolved** | D-8 records the shell's and S01's owner (`:580`); §10 no longer offers an "or" (`:522`) |
| v1 FINDING-15 | MEDIUM | Open, MEDIUM | §8 still omits backtest states, S04's *Limit hit* and *LIVE*, S08's *Near limit*, *At limit*, *Price from {date}*, *Not current*, S09's *Not current*, *Can't read account*, S02's *Missing* and S05's *Draft · saved*. Two new statuses are also absent: the *Possibly restated* mark (`:310-314`) and S08's *Stopped: daily-loss limit reached at {time}* (`S08:114-115`) |
| v1 FINDING-16 | MEDIUM | Open, MEDIUM | §4.3 *Backtested* still has the good tier's filled circle (`:295`); §3.2 *NO TRADING YET* still has no shape (`:216`); S06 still draws the restated mark as `status-neutral` with a diamond (`S06-backtest.md:74`), now also unlike §4.4's *R* mark; §8 shapes still differ from CAP-001's shipped icons with no migration recorded |
| v1 FINDING-17 | MEDIUM | Open, MEDIUM | No *checked {time}* on S02 step-4 progress (`S02:75`), S06 progress (`S06:98-99`) or S09's running download (`S09:111-112`); no cadence for S07's evidence-change detection (`S07:124-126`) or the shell's chips and trading state |
| v1 FINDING-18 | MEDIUM | Open, MEDIUM | S01's sparklines still state no measure, units, as-of or n, and their table is "on the strategy page", which no screen specifies (`S01:146-147`; §11 `:565`) |
| v1 FINDING-19 | MEDIUM | Open, MEDIUM | Only *Daily prices* has a scope statement, still shown on `/data/coverage` (`S09:134`); the other check cards carry none (§11 `:555`) |
| v1 FINDING-20 | MEDIUM | Open, MEDIUM | `h1` *{Weekday}, {day} {Month}* and copy *Thursday, 15 October* (`S01:55`, `:131`); §4.8's *checked 18:52:14* has no zone (`:347`); S03's *Scores from today 17:46 CDT* (`S03:62`) |
| v1 FINDING-21 | MEDIUM | Open, MEDIUM | The size literals are unchanged (`:182-205`, `:306`, `:321`, `:337`; S02 `:58`; S03 `:49`, `:55`, `:69`; S04 `:54`; S05 `:46`, `:65`; S08 `:88`) while §11 still claims "only theme tokens" (`:566`) |
| v1 FINDING-22 | MEDIUM | Open, MEDIUM | S03's Filters pane still has no search (`S03:49-60`); §11 still claims search and filter (`:567`) |
| v1 FINDING-23 | MEDIUM | Open, MEDIUM | `retired` still has no rendering (`S03:107`); `failedReason` still none (`:105`; CAP-002 AC-20); the as-of line still omits the download (`:62`; AC-21) |
| v1 FINDING-24 | MEDIUM | **Resolved** | Helper and footnote now say "of the stocks scored on this factor" (`S03:56-58`, `:149`), which matches CAP-002 AC-8. The canvas difference is not listed: FINDING-57 |
| v1 FINDING-25 | MEDIUM | Open, MEDIUM | Stock evidence, compare and universes are still "CAP-002 page, restyled" with no spec or mirrored source (`:142-144`, `:166-168`); S03 §11 still cites "the Marks column from the CAP-002 design" (`S03:182-184`) |
| v1 FINDING-26 | MEDIUM | Open, MEDIUM | S07's real-money dialog still has no acknowledgement and a question for a title (`S07:77-84`); the other real-money dialogs (`:505`, `:508`, `:509`) still have no content |
| v1 FINDING-27 | MEDIUM | Open, MEDIUM (partly resolved) | *Correct symbol* is gone (D-9) and resuming a paused paper strategy is now tiered (`:506`). Still untiered: changing the review-gate settings (D-3) and changing history depth (S02, Settings). Resuming a limit-stopped strategy is FINDING-52 |
| v1 FINDING-28 | MEDIUM | Open, MEDIUM | §4.4 still puts the *Incomplete* reason in a tooltip on a non-focusable badge (`:309`); environment chips are still links with no component (`:221`); the stopped banner and S02's file input are still not routed through intake (`S02:168-170`) |
| v1 FINDING-29 | MEDIUM | Open, MEDIUM | Badges still carry more than two words (`:468`, `:483`; S06 `:44`; S01 `:123`; S07 `:51`), and the fixes add *Stopped: daily-loss limit* (`:300`), *Not sent: strategy stopped* (`:482`) and *Stopped: daily-loss limit reached at {time}* (`S08:114-115`). The nav count chip is a badge carrying a number (`:130-132`), which the badge spec also excludes (`badge/design-spec.md:22`) |
| v1 FINDING-30 | MEDIUM | Open, MEDIUM | *Add later* still lets step 3 continue with zero symbols, and step 4 with zero stocks is still unspecified (`S02:74`, `:115-117`, `:126`) |
| v1 FINDING-31 | MEDIUM | Open, MEDIUM | `parse` still cites `parse-bulk-symbols` for `duplicates` and `suggestion` (`S02:100`, `:109-111`). D-8's "on CAP-001's API as it is" (`S02:51-52`) makes the gap plainer: no CAP-001 artifact defines a near miss |
| v1 FINDING-32 | MEDIUM | Open, MEDIUM | S09's Stale state (`S09:122`) and S01's "{n} of {m} stocks current" (`S01:66`) still introduce an M1 staleness definition unlike CAP-002 AC-13's |
| v1 FINDING-33 | MEDIUM | Open, MEDIUM | The §3 shell still has no status region, and the D-8 row now says CAP-001's pages are consumed "unchanged" (`:523`) while the approved CAP-001 UX design's region and its AC-18 trace (`ux-design.md:71`, `:85`, `:691`) are dropped |
| v1 FINDING-34 | MEDIUM | Open, MEDIUM | Unsourced quantities unchanged: S05's rule blanks (`S05:56-60`) and 800 ms (`:97`); §8's 8% (`:483`); S08's 80% and "older than 2 polls" (`S08:118-120`, `:130`); S03's 2-6 and 150 ms (`S03:126`, `:128`); S06's $10,000 (`S06:46`); the polling cadences |
| v1 FINDING-35 | MEDIUM | Open, MEDIUM (surfaced, severity not judged) | Capital-at-risk actions remain on the unauthenticated loopback interface (`:201`, `:503-509`), and the kill switch and **Resume trading** now arrive there in M2; CAP-001 §7's open question (`Capability-CAP-001.md:411-415`) is still neither cited nor resolved |
| v1 FINDING-36 | MEDIUM | Open, MEDIUM | "Three `checkbox` acknowledgements" (`S07:68`), "the fixed set plus one per mark" (`:110`), one aggregated "(per mark)" sentence (`:150`) and S07-6 (`:174-175`) still disagree |
| v1 FINDING-37 | LOW | Open, LOW | "Not applicable" without reason: S06 `:107`, `:110`; S07 `:138` |
| v1 FINDING-38 | LOW | Open, LOW | *Paper · practice* (`S08:48`, `:54`), *REAL MONEY* (`S07:51`), *LIVE · n STRATEGY* (`:218`), *Stopping* for two states (`:233`, `:460`), "timed out" (`:513`, `S09:131`), "kill switch" in copy (`:245-246`). Also *Promotion failed* (`S07:142`) and two labels for the limit stop (`:300` against `S08:114-115`) |
| v1 FINDING-39 | LOW | Open, LOW | **Stopped ({n})** still opens an unrouted list (`S04:52-53`); `/strategies/:id`'s redirect targets are still unstated (`:147`) |
| v1 FINDING-40 | LOW | Open, LOW | §9 still tiers Stop all trading "protective" (`:503`), as the harness template allows (`docs/templates/ux-blueprint.md`, §9) but STD-UI-19's three-tier rule does not; §11 still records STD-UI-11 and 21 without noting §10 omits both regions in M1 (`:548`, `:558`, `:522`) |
| v1 FINDING-41 | LOW | Open, LOW | §4.1's order still omits `active` (`:278-279`); the Draft item still has no body, a mutation-like label and no M4 tag (`S01:137`) |
| v1 FINDING-42 | LOW | Open, LOW | S05's rename is still "click" (`S05:44`); §3.1 still specifies no `nav` landmark (`:197`); S08's "Showing {n} of {m}" still has no way to the rest (`S08:71`); S03's new **Save these {n} as a universe…** and **Add to universe…** still specify no completion confirmation (`S03:122-127`) |
| v1 FINDING-43 | LOW | Open, LOW | "A deeper depth is requested as stated…" (`S02:73`) |
| v1 FINDING-44 | LOW | Open, LOW | Whether Ready for review persists after the gate stops being met is still undefined (`S07:121-123`, `:137`) |
| v1 FINDING-45 | LOW | Open, LOW | The holdings line and `heldBy[]` still cite CAP-002 AC-17 with no M2 tag (`S03:70`, `:111`) |
| v1 FINDING-46 | LOW | Open, LOW (partly resolved) | S01, S02 and S09 §2 now name the D-8 capability, and S05, S06, S07 name §10's capability by its milestone name. S04 and S08 §2 still give bare milestones (`S04:39-43`, `S08:41-46`); §13 still gives no intake reasoning (`:585-615`); S02's file input is still in §11, not §4 (`S02:168-170`) |
| v1 FINDING-47 | LOW | Open, LOW | The `button` `kill-switch` and `chart` `sparkline` rows still follow a blank line (`button/design-spec.md:35`; `chart/design-spec.md:33`) |
| v1 FINDING-48 | LOW | Open, LOW | All ten subjects still record `agent_id: ux-blueprint` and `tool_version: unknown` (frontmatter lines 16-20 of each screen; blueprint `:19-23`) |
| v1 FINDING-49 | LOW | Open, LOW | S08-5 still unquantified (`S08:161`) |
| v1 FINDING-50 | LOW | Open, LOW | cmdk and a virtualisation library are still not in tech-stack v5; S06 still cites a "dataviz hover layer" (`S06:93`) |

**Superseded:** none. Where a decision answered a finding (D-8 for FINDING-1
and 14, D-9 for FINDING-2, D-10 for FINDING-7, D-11 for FINDING-8), the finding
is recorded as resolved by that decision.

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
13 rules pass, 2 pass from M2 where they apply, 8 are partial, 6 fail as
written, and 1 is not applicable. Against v1, STD-UI-1, 2 and 17 moved off FAIL
(FINDING-4, 2, 5, 24 and 6 resolved), and STD-UI-20 moved to PARTIAL
(FINDING-51). The failures and partials:

- STD-UI-1 PARTIAL: FINDING-38 (LOW).
- STD-UI-2 PARTIAL: FINDING-51, 58, 63.
- STD-UI-5 FAIL: FINDING-20. STD-UI-18 FAIL: FINDING-19. STD-UI-25 FAIL:
  FINDING-17. STD-UI-28 FAIL: FINDING-18. STD-UI-29 FAIL: FINDING-21.
  STD-UI-30 FAIL: FINDING-22.
- STD-UI-8 PARTIAL: FINDING-16, 56. STD-UI-12 PARTIAL: FINDING-15, 16, 53.
  STD-UI-19 PARTIAL: FINDING-27, 40, 52. STD-UI-20 PARTIAL: FINDING-51.
  STD-UI-23 PARTIAL: FINDING-37. STD-UI-24 PARTIAL: FINDING-28, 42, 56.
- CONST-SEC: FINDING-35 (carried, surfaced).

No specialization is declared in §11. The issue remains claim support: the
STD-UI-18, 25, 28, 29 and 30 cells read as satisfied where the screens do not
support them.

#### Completeness (SR-1)

All fifteen template sections are present. Content gaps: FINDING-52 (no way
back from a limit stop), FINDING-15, 25, 27, 39 and 46 carried.

#### Correctness (SR-2)

FINDING-51, 52 (HIGH); FINDING-58 (MEDIUM); FINDING-63 (LOW); FINDING-41
carried.

#### Testability (SR-4)

The blueprint carries no acceptance checks by design (template: "The blueprint
designs; capabilities specify"). Screen checks are covered below.

#### Clarity (SR-6)

FINDING-60, 63, 64 (LOW); FINDING-34 and 38 carried.

### System Design Specification

Not provided -- skipped. The Product UX Scope has no system design.

### Component Design Specifications

Not provided -- skipped.

### UX Brief

Not provided -- skipped. Capability UX briefs will cite this blueprint.

### UX Design Specification (mapped: screen specifications S01 to S09)

**SR-8 component mapping.** Every component and variant in §4 of each screen
and in the blueprint exists in `design-system/components/` (checked by script
over the §4 tables and every inline `` `component` `variant` `` pair). Uses that
conflict with a component's own contract: FINDING-56 (`badge` reading *R*),
FINDING-64 (`dialog` content rules), FINDING-26 and 29 carried. Gaps not routed
through intake: FINDING-28 carried.

**SR-8 tokens.** Every `--token` the ten documents name resolves in
`design-system/theme.css`; `--surface` is correctly stated not to be one. Size
literals: FINDING-21 carried.

**SR-8 design source.** S01 to S09 cite their mirrored `P0n` source, and each
resolves. Compared against the canvas text, S01, S03, S04 and S05 §11 no longer
list every difference, mostly differences the v2 fixes created (FINDING-57).
S09 §11 now matches P09. The CAP-002 pages still have no source (FINDING-25).

**SR-8 EDG.** Under STD-UI §1.2, STD-UI is the project's EDG constitution, so
§11 is the EDG record. The `edg-compliance` checklist was walked over the
changed content: terminology (FINDING-38), success feedback for operations not
immediately visible (FINDING-42, now covering save-as-universe), elements whose
visible text is not meaningful (FINDING-56), confirmation dialogs (FINDING-64).

**SR-4 testability of the 52 acceptance checks.** All are observable except
S08-5 (FINDING-49). S05-1 and S06-3 are implementation properties, checkable by
contract test. S05's checks are listed out of order (FINDING-61).

**Per-screen findings (open).**

- S01: FINDING-58 (MEDIUM); 57 (MEDIUM); carried 18, 20, 32 (MEDIUM), 41 (LOW).
- S02: FINDING-62 (LOW); carried 17, 28, 30, 31 (MEDIUM), 43, 46 (LOW).
- S03: FINDING-54, 55, 56, 57 (MEDIUM); carried 20, 22, 23, 25 (MEDIUM), 42, 45 (LOW).
- S04: FINDING-51, 52 (HIGH); 57 (MEDIUM); carried 10, 11, 12, 15 (MEDIUM), 39, 46 (LOW).
- S05: FINDING-51 (HIGH); 54, 57, 58 (MEDIUM); 61 (LOW); carried 34 (MEDIUM), 42 (LOW).
- S06: FINDING-51 (HIGH); carried 15, 16, 17 (MEDIUM), 37, 50 (LOW).
- S07: FINDING-51 (HIGH); carried 17, 26, 36 (MEDIUM), 37, 38, 44 (LOW).
- S08: FINDING-51, 52 (HIGH); carried 15, 26, 29 (MEDIUM), 38, 42, 46, 49 (LOW).
- S09: FINDING-58 (MEDIUM); 59, 60 (LOW); carried 17, 19, 32 (MEDIUM), 38 (LOW).

### Cross-Specification Consistency (SR-3)

Consistent and verified this round:

- **Routes.** §2.1, §2.2, §5 and each screen's `route` agree; the migration in
  §2.2 is unchanged.
- **Milestones.** Every first milestone in §2.2 matches the screen's §2 table,
  including the M2 resume flow (§10, S08 §2) that FINDING-9 asked for.
- **D-8 to D-11.** Each decision is applied in every location §12's "Blocks"
  column names, apart from the follow-on gaps raised below.
- **D-9 against CAP-001.** **Download now** over the followed list matches
  CAP-001's run API (no scope parameter; AC-25) and its recovery flow; *Stop
  following* and *Follow* are CAP-001 AC-21 and AC-1.
- **STD-UI-1.** §7 matches the v6 table row for row.

Mismatches, each a CROSS-SPEC-INCONSISTENCY: FINDING-51, 52 (HIGH);
FINDING-53, 54, 55, 57, 58 (MEDIUM); FINDING-59, 60 (LOW); and carried
FINDING-11, 12, 15, 16, 23, 31, 32, 33 (MEDIUM).

---

## Findings Summary Table

New findings first (FINDING-51 to 64), then carried findings in v1 order.

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-51 | HIGH | SR-2 / SR-1 (CONST-AGT AGT-AUTH-002; D-10) | Blueprint, S04, S05, S06, S07, S08 | `product-ux-blueprint.md:403-408`, `:501`, `:582`; `S04-strategies.md:58-61`, `:94`, `:100-103`; `S05-builder.md:97-104`; `S06-backtest.md:47-49`; `S07-promotion-review.md:63-67`, `:80-82`, `:105`, `:127-130`; `S08-portfolio.md:64`, `:101` | D-10 says a draft "earns its own stages" and replaces the running version "only through the action that earns the stage". (a) For a **live** strategy that means the draft paper-trades while the live version trades, so one strategy runs two versions at once. S04 (one `stage`, one `runningVersion`, the card "stays in the running version's column"), S01's list and S08 cannot show that. If the draft does not paper-trade, it reaches S07 on the live version's paper record, against S04's own "nothing reaches real money without passing through paper trading" (`S04:50-52`). (b) The replacement itself is undesigned. S07 offers *Money to allocate* and says the strategy "moves to Live" and the live chip "gains or increments" as if nothing were live. Its title and dialog do not say which version is replaced. §9's **Start paper trading** confirm promises "${amount} of practice money" with no word on the running paper version or its holdings (STD-UI-2). (c) For a backtested strategy with a newer draft, which version S04's and S06's **Start paper trading** starts is unstated | M2 implements a paper replacement whose wording is untrue and whose holdings rule is an implementation choice. M5 and M6 have no design for changing a live strategy's rules, which is a capital-at-risk path | Owner decision recorded in §12. Does a live strategy's draft paper-trade alongside the live version? If so, how do S04, S01 and S08 show both; if not, on what evidence does it reach S07? What does replacement do to the running version's positions, in paper and in live? Then specify S07 for a replacement (title, allocation, dialog, chip) and §9's confirm wording when **Start paper trading** replaces a running version, and state which version each stage action acts on |
| FINDING-52 | HIGH | SR-2 / SR-1 (CONST-AGT AGT-AUTH-002; D-11; STD-UI-19) | Blueprint, S01, S04, S08 | `product-ux-blueprint.md:236-241`, `:279-280`, `:300`, `:482`, `:503-509`, `:529`, `:583`; `S08-portfolio.md:59-63`, `:66-68`, `:99`, `:101`, `:113-117`; `S04-strategies.md:59`, `:77`, `:94`; `S01-home.md:59-62` | Under D-11 a strategy that reaches its daily-loss limit "stops itself", and no subject says how it trades again. Does it re-arm at the next session, or does the owner resume it, and with which confirmation? §9 has no action for it. S08 offers **Resume {name}…** only "when paused", and `stoppedByLimitAt` is a separate field. S01's *Needs you* item has no action, and §4.1 removes an item only when "its cause is resolved", which is undefined here. S04 renders the stop nowhere: its *Limit hit* badge is the per-stock limit on Paper cards (`paper.limitHit`, as on P04), the Live card's view model has no stopped field, and whether the card moves to **Stopped ({n})** is unstated. The limit itself is two things at once: "each strategy has its own daily-loss limit" (`S08:62`, `S01:62`) against one `limits.dailyLossPct` that "applies to each strategy separately" (`S08:99`), and what the percentage is measured against is unstated | The per-strategy form of v1 FINDING-9: from M6 a live strategy can stop with no designed way back. Whether it re-arms by itself is a capital-at-risk behaviour left to implementation | Owner decision recorded in §12: automatic re-arm (when, and how S08 and S01 say so) or owner resume (tier it in §9, `dialog` `real-money` for a live strategy, and give S08 its control and S01's item its action). Render the stop on S04's Live and Paper cards with §4.3's badge and say which list it sits in. State whether the daily-loss percentage is one setting or set per strategy, and what it is a percentage of |
| FINDING-53 | MEDIUM | SR-3 / SR-1 (STD-UI-12; charter §3) | Blueprint | `product-ux-blueprint.md:236-241`, `:484`, `:583`; `docs/constitution/standards/ui-conventions.md:350-352`; `docs/constitution/product-charter.md:119-122` | v3 tiered "a stop the system engaged (daily-loss limit, broker-side limit)" serious. v4 replaced it with "Only the owner stops all trading" and deleted §8's *stopped by a limit* row. D-11 decided only the daily-loss limit. The charter's kill switch uses "broker-side limits ... where available", and STD-UI-12 maps trading "stopped by a limit or by the broker" to serious, "with what triggered it". A trading-wide stop the broker engages now has no rendering, and §3.3's statement asserts it cannot happen | M2 and M6 have no state for a broker-side stop; an implementation either invents one or shows trading as allowed while the broker refuses orders | Restore a broker-engaged trading state in §3.3 and §8 (serious, naming the trigger, with its banner and its way back), or record an owner decision that the product never renders one and why |
| FINDING-54 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY | S03, S05, Blueprint | `S03-research.md:52-58`, `:102`, `:120-121`; `S05-builder.md:51-54`, `:90`; `product-ux-blueprint.md:397-398` | The FINDING-3 fix gave S03 thresholds `{measure: percentile/standardisedScore, direction: atLeast/atMost, value}`. S05's conditions are still `{factor, minPercentile}`, written "percentile is at least [n]". **Use in a strategy** and §6 still say S05 opens "prefilled with the filter as conditions", which S05 cannot hold for an *at most* or standardised-score threshold | The M2 hand-off from research to strategy drops or mistranslates the owner's filter | Either widen S05's condition sentence and view model to measure and direction, or state that **Use in a strategy** carries only percentile floors and tell the owner which thresholds were not carried |
| FINDING-55 | MEDIUM | SR-1 / SR-3 (CAP-002 AC-2, AC-5) | S03 | `S03-research.md:61-64`, `:122-124`, `:136`, `:163-164`, `:174-176`; `Capability-CAP-002.md:193-203`, `:248-250`, `:257-259` | **Save these {n} as a universe…** leaves two of CAP-002's branches undesigned. (a) Zero matches: CAP-002's flow (step 5) and AC-5 require the product to say so and not save. S03's *Empty, nothing found* state does not mention the action, so a "Save these 0" button is not excluded. (b) Membership: S03-7 saves "every matching stock", and S03-1 lists a stock with any incomplete factor unless hidden. S03 never says whether a stock incomplete on a thresholded factor matches, while CAP-002 keeps "exactly those members" that meet the profile | CAP-002's UX design starts with AC-5 unmet and AC-2's membership rule ambiguous | Specify the action's state at zero matches (absent, or `blocked` with the reason) and state that a stock incomplete on a thresholded factor does not match; add the dialog and its name field to §4 |
| FINDING-56 | MEDIUM | SR-8 (STD-UI-8, STD-UI-24) | Blueprint, S03, S05 | `product-ux-blueprint.md:310-314`; `S03-research.md:66`; `S05-builder.md:68-70`; `badge/design-spec.md:53-54`, `:74` | The FINDING-6 fix draws the restatement mark as "a small `badge` `status-neutral` reading *R* whose accessible name is *Possibly restated*". The badge contract says the label "must be meaningful out of context. 'Real money', not 'RM'", and gives the badge "no role", so it is read as part of its row. An accessible-name override on a role-less element is not something it offers. Sighted users get a bare *R*; STD-UI-8 asks for a text label plus a shape. S06 draws the same mark differently (FINDING-16) | The mark that satisfies a stricter-only rule in lists has a label the component forbids and an accessible name the component cannot carry | Record a COMPONENT-SPEC-GAP through `design-system/intake.md` for a compact mark (shape plus visually hidden text, or an icon with `role="img"` and a name), or widen the badge contract through intake; use one rendering in §4.4 and S06 |
| FINDING-57 | MEDIUM | SR-8 (design source; blueprint §0) | S01, S03, S04, S05 | `S01-home.md:162-167` against `design-source/P01-Home.dc.html`; `S03-research.md:178-188` against `P03-Research.dc.html`; `S04-strategies.md:145-147` against `P04-Strategies.dc.html`; `S05-builder.md:159-163` against `P05-Builder.dc.html` | §0 and `docs/ux/README.md` say every disagreement with the canvas is listed in §11, and the design-source README points implementers to the files "for exact spacing, sizes and copy". After the v2 changes the lists are short. **S01** omits P01's "classifications stay at yesterday's" data item (the model FINDING-5 removed), "ready for a promotion review", the Live tile's "daily-loss limit unused" and the Draft item's body. **S03** omits P03's "of followed stocks" helper and footnote. **S04** says "None beyond §2" while P04's footer reads *Settings → Promotion gate* and S04 adds the *Draft changes* line. **S05** omits P05's *Tilt to score*, the unmarked preview percentile and the running-version line | An implementer copying canvas copy reintroduces the FINDING-4 and FINDING-5 defects the fixes removed | List each difference with its reason, as S09 §11 now does |
| FINDING-58 | MEDIUM | SR-2 (STD-UI-2) | Blueprint, S01, S05, S09 | `product-ux-blueprint.md:101-103`, `:414-415`, `:493`; `S01-home.md:136`; `S09-data-health.md:131`; `S05-builder.md:61-62`, `:133-134` | Principle 5, §6's data-problem flow, §9's stop-following confirmation, S01's data item and S09's failed row all say a strategy holding an incomplete stock keeps it and won't trade it ("it keeps holding KO and won't trade it until fixed"). S05 lets the owner choose **Sell it**: "Treat an incomplete score as a reason to exit." For a strategy with that rule, the copy describes behaviour it does not have, in S09's example about a live strategy | From M2 the owner can be told a live holding is safe while the strategy is selling it | Make the copy depend on each holding strategy's rule (for example "Deep Value Quarterly keeps KO; Momentum Tilt sells it at its next rebalance"), and reword principle 5 and §6 to "according to each strategy's incomplete-data rule" |
| FINDING-59 | LOW | SR-2 (STD-UI-19) | S09, Blueprint | `S09-data-health.md:108-110`; `product-ux-blueprint.md:492` | S09 says fixing a typo is "two actions, stop following and follow, each confirmed on its own (D-9)". §9 tiers following as routine with no confirmation | An implementation may add a confirmation STD-UI-19 forbids for a routine action | "two separate actions: stop following (confirmed) and follow" |
| FINDING-60 | LOW | SR-5 / SR-6 (CONST-AGT AGT-SCOPE-002) | Blueprint, S09 | `product-ux-blueprint.md:522-523`; `S09-data-health.md:43` | The CAP-001 row says "Its API and pages are consumed unchanged by the row above", but that row restyles and relabels CAP-001's Coverage, Instruments, Runs, Run detail and Settings pages and moves their routes. Under AGT-SCOPE-002 the new capability takes ownership of those pages, and the row should say so. The D-8 row also says S09 and S01 are built "on CAP-001's API as it is", while S09 §2 and S01's data card read CAP-002's classification state; §10 does not record that dependency | The new capability's definition starts from an ownership statement that is untrue and a dependency list that misses CAP-002 | "CAP-001: no new work; *App shell & data health* takes ownership of its pages and routes"; name the dependency on CAP-002's classification state in the D-8 row |
| FINDING-61 | LOW | SR-1 (CONST-SA SA-MD-001) | S05 | `S05-builder.md:146-157` | S05-6 is placed between S05-2 and S05-3 with list number 6. Markdown renders it as item 3, beside the identifier S05-6 | The permanent check identifiers read out of order | Move S05-6 to the end of the list |
| FINDING-62 | LOW | SR-2 (STD-UI-26) | S02 | `S02-setup.md:51-52`, `:62` | The step card reads *Step n of 5*, while §2 says the stepper shows four steps before M2 | In M1 the position indicator counts a step that does not exist | *Step n of N*, as S02-1 already says |
| FINDING-63 | LOW | SR-6 (STD-UI-2) | Blueprint | `product-ux-blueprint.md:417-421`, `:504`, `:506` | The paper **Resume trading** confirmation says "{n} paper strategies send orders again from the next rebalance, {date}". Strategies rebalance on their own schedules (S05; S01's `nextRebalance` is the earliest), so one date can be wrong. §6's emergency-stop flow says the dialog *lists* what will trade, while §9 gives a count. Whether paused strategies stay paused is unstated | The confirmation can misstate when orders resume | List each strategy that resumes with its own next rebalance, and say that paused strategies stay paused |
| FINDING-64 | LOW | SR-8 | Blueprint | `product-ux-blueprint.md:493`, `:501`, `:502`, `:504`, `:506`; `dialog/design-spec.md:85-86` | The dialog spec asks for a title that "names the action, not the question" and a confirm label that restates the verb. Every §9 `confirm` text opens with a question (*Pause {name}?*, *Resume trading?*), and none names its confirm label | Implementations either break the component's content rules or invent the labels | Give each §9 confirmation a title naming the action, a description, and a confirm label |
| FINDING-10 | MEDIUM | SR-2 | S04 | `S04-strategies.md:63-64`, `:66-67`, `:75` | Carried from v1: M2 and M3 Paper cards show tracking distance from a backtest (M4) and gate progress, and the footer links Settings → Review gate (M5), untagged | The M2 board renders values that cannot be computed and links to a page that does not exist | As v1: milestone-tag card facts and the footer |
| FINDING-11 | MEDIUM | SR-3 (D-6) | Blueprint, S04, S07 | `S04-strategies.md:41`, `:45-46`, `:143`; `product-ux-blueprint.md:287-288`, `:525`, `:578` | Carried from v1, sharpened: S04 §2 now places a Live column in M2 "empty until M6", contradicting S04-4 and D-6; the stepper shows *Live* from M2; the not-grandfathered case has no rendering | An owner decision applied inconsistently | As v1: reword D-6 to allow Live as the destination, or add Live in M6; give un-backtested paper strategies a "Run backtest" path from M4 |
| FINDING-12 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY (D-3) | S04 | `S04-strategies.md:95`, `:127` | Carried from v1: `gate` and the footer carry two of D-3's four criteria, with literal values | The board misstates the owner's gate | As v1 |
| FINDING-15 | MEDIUM | SR-1 / SR-3 (STD-UI-12) | Blueprint, screens | `product-ux-blueprint.md:449-486`; see the status table above | Carried from v1, extended: §8 omits the statuses v1 listed, plus the *Possibly restated* mark and *Stopped: daily-loss limit reached at {time}* | Capabilities inherit untiered statuses | As v1; add the two new ones |
| FINDING-16 | MEDIUM | SR-3 / SR-9 (STD-UI-8, STD-UI-12) | Blueprint, S06 | `product-ux-blueprint.md:216`, `:295`; `S06-backtest.md:74` | Carried from v1: tier shapes reused (Backtested filled circle; S06 mark diamond), *NO TRADING YET* without shape, shipped icons changed silently | In greyscale a neutral badge reads as good | As v1; use the FINDING-56 rendering in S06 |
| FINDING-17 | MEDIUM | SR-9 (STD-UI-25) | Blueprint, S02, S06, S07, S09 | `S02-setup.md:75`; `S06-backtest.md:98-99`; `S09-data-health.md:111-112`; `S07-promotion-review.md:124-126`; `product-ux-blueprint.md:208-223` | Carried from v1: polled regions with no last-updated time or no recorded cadence | STD-UI-25 unmet for the shell and four regions | As v1 |
| FINDING-18 | MEDIUM | SR-9 (STD-UI-28) | S01, Blueprint | `S01-home.md:146-147`; `product-ux-blueprint.md:565` | Carried from v1: sparklines without provenance; table on an unspecified page | §11's STD-UI-28 claim unsupported | As v1 |
| FINDING-19 | MEDIUM | SR-9 (STD-UI-18) | S09, Blueprint | `S09-data-health.md:134`; `product-ux-blueprint.md:555` | Carried from v1: only one check states its scope, and not alongside its result | Absence of detected problems presented without limits | As v1 |
| FINDING-20 | MEDIUM | SR-9 (STD-UI-5) | S01, S03, Blueprint | `S01-home.md:55`, `:131`; `S03-research.md:62`; `product-ux-blueprint.md:347` | Carried from v1: locale-formatted `h1`, zoneless *checked* time, non-ISO as-of | Nonconformance with a rule that allows no specialization | As v1 |
| FINDING-21 | MEDIUM | SR-9 (STD-UI-29) | Blueprint, screens | `product-ux-blueprint.md:182-205`, `:566`; screens as in the status table | Carried from v1: about twenty size literals while §11 claims only tokens | STD-UI-29 verification fails as written | As v1 |
| FINDING-22 | MEDIUM | SR-9 (STD-UI-30) | S03, Blueprint | `S03-research.md:49-60`; `product-ux-blueprint.md:567` | Carried from v1: no search on the 3000-row list | STD-UI-30 unmet | As v1 |
| FINDING-23 | MEDIUM | SR-3 / SR-5 | S03 | `S03-research.md:62`, `:77-79`, `:105`, `:107` | Carried from v1: no rendering for retired stocks (AC-15), score-update failure (AC-20) or the download the scores reflect (AC-21) | CAP-002's UX design misses three ACs | As v1 |
| FINDING-25 | MEDIUM | SR-8 / SR-1 (CONST-SA SA-MD-002) | Blueprint, S03 | `product-ux-blueprint.md:142-144`, `:166-168`; `S03-research.md:182-184` | Carried from v1: five M1 routes with neither spec nor resolvable source; S03 cites a CAP-002 design that does not exist | Unresolvable references | As v1 |
| FINDING-26 | MEDIUM | SR-8 | S07, Blueprint | `S07-promotion-review.md:77-84`; `product-ux-blueprint.md:505`, `:508-509`; `dialog/design-spec.md:31-35`, `:85` | Carried from v1: real-money dialogs without acknowledgement or content | Contract broken or invented | As v1 |
| FINDING-27 | MEDIUM | SR-1 / SR-9 (STD-UI-19) | Blueprint | `product-ux-blueprint.md:490-509` | Carried from v1, partly resolved: changing review-gate settings and changing history depth are still untiered | Tiers left to each capability | Add the two rows (and FINDING-52's resume) |
| FINDING-28 | MEDIUM | SR-8 (COMPONENT-SPEC-GAP; STD-UI-24) | Blueprint, S02 | `product-ux-blueprint.md:221`, `:309`; `S02-setup.md:168-170` | Carried from v1: tooltip on a non-focusable badge; chip links with no component; banner and file input not through intake | Undesigned components; keyboard access blocked | As v1 |
| FINDING-29 | MEDIUM | SR-8 | Blueprint, screens | `badge/design-spec.md:21-22`, `:74`; `product-ux-blueprint.md:130-132`, `:300`, `:468`, `:482-483`; `S08-portfolio.md:114-115` | Carried from v1, extended: multi-word badges, plus the new limit-stop labels and a count in a badge | Systematic conflict with the badge contract | As v1 |
| FINDING-30 | MEDIUM | SR-2 | S02 | `S02-setup.md:74`, `:115-117`, `:126` | Carried from v1: *Add later* leads to a step 4 that CAP-001 AC-24 refuses | First-run dead end | As v1 |
| FINDING-31 | MEDIUM | SR-3 / SR-5 | S02 | `S02-setup.md:51-52`, `:100`, `:109-111` | Carried from v1: near-miss suggestions cite a function that does not produce them | New behaviour with a wrong source | As v1 |
| FINDING-32 | MEDIUM | SR-3 | S09, S01 | `S09-data-health.md:122`; `S01-home.md:66` | Carried from v1: an M1 staleness definition unlike CAP-002 AC-13 | Two definitions of "current" | As v1 |
| FINDING-33 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY | Blueprint | `product-ux-blueprint.md:177-205`, `:258-265`, `:523`; CAP-001 `design/ux-design.md:71`, `:85`, `:691` | Carried from v1: the shell drops CAP-001's approved status region and its AC-18 trace | An approved design element removed silently | As v1 |
| FINDING-34 | MEDIUM | SR-6 (CONST-AGT AGT-EVIDENCE-002) | S05, Blueprint, S08, S03, S06 | as in the status table | Carried from v1: unsourced quantities | Capital-relevant defaults without an owner decision | As v1 |
| FINDING-35 | MEDIUM | SR-9 (CONST-SEC SEC-AUTH-001; CONST-AGT AGT-SPEC-002) | Blueprint | `product-ux-blueprint.md:201`, `:503-509`; `Capability-CAP-001.md:411-415` | Carried from v1: capital-at-risk actions, and from M2 the kill switch and **Resume trading**, on the unauthenticated loopback interface; surfaced, severity not judged | A security trade-off carries into M2 and M6 by default | As v1: owner decision before the M2 UX design |
| FINDING-36 | MEDIUM | SR-2 | S07 | `S07-promotion-review.md:68`, `:110`, `:150`, `:174-175` | Carried from v1: the acknowledgement count disagrees across layout, view model, copy and S07-6 | The go-live gate's count is ambiguous | As v1 |
| FINDING-37 | LOW | SR-1 (STD-UI-23) | S06, S07 | `S06-backtest.md:107`, `:110`; `S07-promotion-review.md:138` | Carried from v1 | Inapplicability unreviewable | As v1 |
| FINDING-38 | LOW | SR-6 (STD-UI-1) | Blueprint, S07, S08, S09 | as in the status table | Carried from v1, extended with *Promotion failed* and the two limit-stop labels | Minor vocabulary drift | As v1 |
| FINDING-39 | LOW | SR-1 | S04, Blueprint | `S04-strategies.md:52-53`; `product-ux-blueprint.md:147` | Carried from v1 | Undefined destinations | As v1 |
| FINDING-40 | LOW | SR-9 (STD-UI-19, 11, 21) | Blueprint | `product-ux-blueprint.md:503`, `:522`, `:548`, `:558` | Carried from v1. The harness template lists "protective" as a tier, which is why the blueprint uses it; STD-UI-19 still names three | The conformance table is less precise than the rules | As v1 |
| FINDING-41 | LOW | SR-2 | Blueprint, S01 | `product-ux-blueprint.md:278-279`; `S01-home.md:137` | Carried from v1 | Small inconsistencies in the home pattern | As v1 |
| FINDING-42 | LOW | SR-1 (STD-UI-24) | S05, Blueprint, S08, S03 | `S05-builder.md:44`; `product-ux-blueprint.md:197`; `S08-portfolio.md:71`; `S03-research.md:122-127` | Carried from v1; S03's part now applies to save-as-universe and add-to-universe | Small accessibility gaps | As v1 |
| FINDING-43 | LOW | SR-6 (CONST-SA SA-MD-003) | S02 | `S02-setup.md:73` | Carried from v1 | Copy left to the implementer | As v1 |
| FINDING-44 | LOW | SR-6 | S07 | `S07-promotion-review.md:121-123`, `:137` | Carried from v1 | Routing ambiguous | As v1 |
| FINDING-45 | LOW | SR-5 | S03 | `S03-research.md:70`, `:111` | Carried from v1 | Wrong citation | As v1 |
| FINDING-46 | LOW | SR-1 (CONST-SA SA-MD-001) | S04, S08, Blueprint, S02 | `S04-strategies.md:39-43`; `S08-portfolio.md:41-46`; `product-ux-blueprint.md:585-615`; `S02-setup.md:168-170` | Carried from v1, partly resolved (S01, S02, S05 to S07, S09 now name the capability) | Minor template drift | As v1 for S04, S08, §13 and S02 |
| FINDING-47 | LOW | SR-8 | Blueprint (design-system changes) | `button/design-spec.md:35`; `chart/design-spec.md:33` | Carried from v1 | Variants render outside their tables | As v1 (a human edit to the design system) |
| FINDING-48 | LOW | CONST-AGT AGT-PROV-001 | Blueprint and S01 to S09 | `product-ux-blueprint.md:19-23`; each screen's frontmatter | Carried from v1 | Provenance not traceable to an agent | As v1 |
| FINDING-49 | LOW | SR-4 | S08 | `S08-portfolio.md:161` | Carried from v1 | Check not decidable | As v1 |
| FINDING-50 | LOW | SR-7 | Blueprint, S06 | `product-ux-blueprint.md:598`, `:608-609`; `S06-backtest.md:93` | Carried from v1 | Library choices and licence records left to implementation | As v1 |

---

## Traceability Matrix

### Milestone map against the charter (SR-5)

| §10 row | Charter milestone | Capability named | Exists or future | Verdict |
|---------|-------------------|------------------|------------------|---------|
| M1 App shell & data health | M1 Universe & Factors | New capability (D-8) | Future work, named; to be defined through the pipeline | PASS; wording and dependency FINDING-60 |
| M1 CAP-001 | M1 | CAP-001 v8, approved | Exists; "no new work" | PASS; FINDING-60, 33 |
| M1 CAP-002 | M1 | CAP-002 v1, draft | Exists; S03 claims AC-2 and now delivers it | PASS; content FINDING-23, 25, 55 |
| M2 | M2 Strategies & Paper Trading | Strategies & paper trading | Future work, named | PASS; content FINDING-10, 11, 51, 54 |
| M3 | M3 Live Market Data | Live market data | Future work, named | PASS |
| M4 | M4 Backtesting | Backtesting | Future work, named | PASS |
| M5 | M5 Promotion Gate | Promotion gate | Future work, named | PASS; content FINDING-51 |
| M6 | M6 Live Trading | Live trading | Future work, named | PASS; content FINDING-51, 52 |

### Owner decisions (VER-EVD-004)

| Decision | Where it should show | Verdict | Evidence |
|----------|----------------------|---------|----------|
| D-1 display labels | §7, all copy | PASS (§7); copy residue LOW | §7 equals STD-UI-1 v6 (`:430-443`); "kill switch", "timed out" in copy (FINDING-38) |
| D-2 scheduled downloads from M2 | §10 M2, S09 §2 and §11 | PASS, with FINDING-32 for M1 staleness | `:525`; `S09:46`, `:162-164` |
| D-3 gate criteria are owner settings | S04, S07, Settings | PARTIAL | S07 evaluates the settings (`S07:106`); S04 states two of four (FINDING-12); Settings deferred to M5's design (`:168-170`) |
| D-4 written rationale | S07 | PASS | `S07:68-70`, `:152`, S07-2 |
| D-5 environment tokens outside the region | S01, S04, S08 | PASS | Always with words: S01-2, S04-2, S08 §1 |
| D-6 only shipped stages | §4.2, S04, S05 | PARTIAL | Live shown from M2 against S04-4; not-grandfathered case unrendered (FINDING-11) |
| D-7 kill switch in M2 | §10 M2, §3.3, S08 | PASS | Resume trading and paper resume in M2 through `confirm` (`:234`, `:504`, `:506`, `:525`; S08 `:45`) |
| D-8 new M1 capability | §10 M1, S01, S02, S09 §2 | PASS | `:522-524`; `S01:42`; `S02:51-52`; `S09:43`. Wording FINDING-60 |
| D-9 S09 recovery as CAP-001 provides | S09, §6, §9 | PASS | `S09:60-65`, `:100-110`, `:155-157`; `:410-415`, `:494`. Confirmation wording FINDING-59 |
| D-10 edit keeps the running version trading | §6, §9, S04, S05 | PARTIAL | The edit rule is applied everywhere; the replacement path is not designed (FINDING-51) |
| D-11 daily-loss limit stops one strategy | §3.3, §4.3, §8, S01, S07, S08 | PARTIAL | Scope applied everywhere; no way back and no S04 rendering (FINDING-52); broker-engaged stop dropped (FINDING-53) |

### CAP-002 acceptance criteria with UX implications

| AC | Where the subjects address it | Verdict |
|----|-------------------------------|---------|
| AC-1 universe by hand | S03 tray *Add to universe…* → *New universe*; universes route (unspecified) | PARTIAL (FINDING-25) |
| AC-2 universe from a filter | S03 **Save these {n} as a universe…**, S03-7 | PARTIAL (FINDING-55) |
| AC-3 to AC-6 several universes, maintenance, no empty universe, membership history | Universes routes, "CAP-002 page, restyled"; §9 tiers; AC-5 at the save action unspecified | GAP (FINDING-25, 55) |
| AC-8 one peer set | S03 helper and footnote "of the stocks scored on this factor" | PASS |
| AC-9 score and percentile | §4.4 percentile in list, standardised score in inspector | PASS |
| AC-12 like-for-like | §4.4 *Incomplete*; S01 and S09 copy now agree | PASS |
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
| STD-UI-1 | yes | PARTIAL | §7 matches v6; copy residue FINDING-38 |
| STD-UI-2 | yes | PARTIAL | FINDING-51 (replacement wording), 58, 63 |
| STD-UI-3 | yes | PASS | Signed returns and scores; fixed precision stated |
| STD-UI-4 | yes | PASS | §4.4; S01-5 and S08-3 never render $0.00 |
| STD-UI-5 | yes | FAIL | FINDING-20 |
| STD-UI-6 | yes | PASS | Full figures in tables and chart labels |
| STD-UI-7 | yes | PASS | One job per palette; risk tokens only with words |
| STD-UI-8 | yes | PARTIAL | FINDING-16, 56 |
| STD-UI-9 | yes | PASS | S06 colour by entity |
| STD-UI-10 | no | NOT APPLICABLE | Binds the theme; no token added |
| STD-UI-11 | yes | PASS from M2 | §3.2, S01-2, S04-2; M1 note FINDING-40 |
| STD-UI-12 | yes | PARTIAL | FINDING-15, 16, 53 |
| STD-UI-13 | yes | PASS | §4.8, S01-6, S03-3 |
| STD-UI-14 | yes | PASS | Three presence states; *Can't read account* never zero |
| STD-UI-15 | yes | PASS | S05 preview labelled as such |
| STD-UI-16 | yes | PASS | Incomplete shown, never filled; S01's carry-forward sentence removed |
| STD-UI-17 | yes | PASS | §4.4 in lists and previews, S03-6, S05-6, S06 limits, S07 acknowledgement; form FINDING-56 |
| STD-UI-18 | yes | FAIL | FINDING-19 |
| STD-UI-19 | yes | PARTIAL | FINDING-27, 40, 52 |
| STD-UI-20 | yes | PARTIAL | S07-1 to S07-6 for a first go-live; a replacement go-live is undesigned (FINDING-51); consistency FINDING-36 |
| STD-UI-21 | yes | PASS from M2 | §3.3, S08-2; resume now designed for M2 |
| STD-UI-22 | yes | PASS | §4.9, S07-4, S08-5 |
| STD-UI-23 | yes | PARTIAL | Eight states on every screen; reasons missing (FINDING-37) |
| STD-UI-24 | yes | PARTIAL | FINDING-28, 42, 56 |
| STD-UI-25 | yes | FAIL | FINDING-17 |
| STD-UI-26 | yes | PASS | S02 vertical stepper, S02-1, S02-2; position text FINDING-62 (LOW) |
| STD-UI-27 | yes | PASS | S06-1 |
| STD-UI-28 | yes | FAIL | FINDING-18 (S06 passes, S06-2) |
| STD-UI-29 | yes | FAIL | FINDING-21 |
| STD-UI-30 | yes | FAIL | FINDING-22 |

---

## Pipeline Readiness Assessment

**Verdict: READY-WITH-WARNINGS**

No CRITICAL finding, so the rubric's verdict is READY-WITH-WARNINGS. Neither
HIGH finding blocks the M1 work. M1 delivers no strategy, no order and no limit:
the shell, S01's data region, S02, S03 and S09 are untouched by FINDING-51 and
52.

FINDING-51 and FINDING-52 were weighed against CRITICAL. Each leaves a
capital-at-risk behaviour to implementation, which is the class v1 rated HIGH
for FINDING-7, 8 and 9. Each touches M2 (paper replacement) or M6 (live
replacement, live limit stop), not the work the pipeline does next. The owner
may judge otherwise.

The nine v1 HIGH findings are resolved, and the owner decisions behind them are
recorded where the pipeline will read them. What remains:

- **FINDING-51, 52.** Two owner decisions the D-10 and D-11 records leave open,
  both on the money path, both needed before the M2 UX design starts from S04,
  S05, S06 or S08.
- **FINDING-53 to 58.** Consistency gaps the fixes introduced, each a small
  text change once its question is answered.
- **The 24 carried MEDIUM findings**, unaddressed by choice. The STD-UI set
  (FINDING-15 to 22) is inherited by every capability that cites §11.

CONST-AGT (Enforcement) asks for HIGH violations to be resolved before gate
passage, and CONST-REV asks for re-review after High violations. Recommendation:
decide FINDING-51 and 52, fix them, re-review, and only then approve each
artifact separately with
`scripts/artifact-gate.py approve --review-artifact docs/ux/specifications-review-report-v{N}.md`.
This review approves nothing.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-51: owner decision on how a new version replaces a running one
   (concurrent paper run for a live strategy or not; what happens to positions);
   then S04, S01 and S08 for two running versions, S07 for a replacement go-live,
   and §9's **Start paper trading** wording when it replaces a running version.
2. FINDING-52: owner decision on how a strategy stopped by its daily-loss limit
   trades again; tier it in §9; give S08 its control and S01's item its action;
   render the stop on S04; settle the limit's value source and base.

### Should Fix (MEDIUM findings)

New: FINDING-53 (broker-engaged stop), 54 (S05 conditions), 55 (save-as-universe
branches), 56 (the *R* mark), 57 (canvas difference lists), 58 (incomplete-data
copy against S05's **Sell it**).

Carried: FINDING-10, 11, 12, 15 to 23, 25 to 36. Prioritise the STD-UI
conformance set (15 to 22, 26 to 29), because every capability inherits it, and
the owner decisions (32, 34, 35).

### Nice to Have (LOW findings)

New: FINDING-59 to 64. Carried: FINDING-37 to 50.
