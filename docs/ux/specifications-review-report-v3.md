---
artifact_schema_version: 1
artifact_id: PRODUCT-UX-specification-review
artifact_type: specification-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-16
updated: 2026-10-16
document: spec-review-report
capability: PRODUCT-UX
version: v3
generated: 2026-10-16T17:08:40Z
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
    result: "Project-wide --strict: PASSED with 230 warnings, exit 0, 282 artifacts; none names docs/ux. The one warning touching the subjects is upstream of them: STD-UI pins PRODUCT-UX v3, now v5. Scoped -a docs/ux --strict before this report: PASSED, exit 0, 12 artifacts (1 ux blueprint, 9 ux screen specs, 2 specification reviews), no warning. After writing it: PASSED, exit 0, 13 artifacts (1 ux blueprint, 9 ux screen specs, 3 specification reviews), no warning"
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
  SR-7: "applied — limited to the technical commitments the blueprint makes: route migration, shell and pattern locations, server-side virtualised lists, kill-switch read-back, command palette library, evidence snapshot, and the daily-loss limit's measure (D-11) against the milestone that first supplies intraday prices"
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
    artifact_version: 5
    content_revision: sha256:93674ef52aa0092a508ab995a8c3456dfe32cce3c597951e603eeadeff230eb0
  - artifact_id: PRODUCT-UX-S01
    artifact_version: 3
    content_revision: sha256:f9701ea32ecb1186f9363a4fc4044a2e3c66c1d8d95cb984ebb365de4be6024b
  - artifact_id: PRODUCT-UX-S02
    artifact_version: 3
    content_revision: sha256:0ee0f0a480ab00b16b0487a9079cf7ff87e94baa61d35ca6c3be10e62cba9b48
  - artifact_id: PRODUCT-UX-S03
    artifact_version: 3
    content_revision: sha256:b6ee36f8560d6febe126d14ba9580d753e1f9cf4dd65b2dd27cc768566507c01
  - artifact_id: PRODUCT-UX-S04
    artifact_version: 3
    content_revision: sha256:b78fa2bc60fe6e957bd7d689969243a12ea41866adfa862f23fb5f43305cf1e2
  - artifact_id: PRODUCT-UX-S05
    artifact_version: 3
    content_revision: sha256:546e8324de1fdd8b1335134a06caae6aa58c2b1851eb804ca01deba30577cef1
  - artifact_id: PRODUCT-UX-S06
    artifact_version: 3
    content_revision: sha256:22b837481d8a42bd58ac6387072a22aa62f449539824ff0e595c483619daf9ac
  - artifact_id: PRODUCT-UX-S07
    artifact_version: 3
    content_revision: sha256:41b0c9af0d4d0e5539c5d2c2238488f430b9c903267756fde3c101a667b6abb6
  - artifact_id: PRODUCT-UX-S08
    artifact_version: 3
    content_revision: sha256:c161d2cc01c6c1b75dea03be0ebcd64b5be9a0737d407a82735a18bc15443003
  - artifact_id: PRODUCT-UX-S09
    artifact_version: 3
    content_revision: sha256:e7319ce05fe7ee568c46b687656c4340ed810b21aa6e97dcbb30a20ab5f90024
statistics:
  total_findings: 59
  critical: 0
  high: 1
  medium: 35
  low: 23
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.301"
  timestamp: 2026-10-16T17:08:40Z
  source_artifacts:
    - id: PRODUCT-UX
      version: "5"
    - id: PRODUCT-UX-S01
      version: "3"
    - id: PRODUCT-UX-S02
      version: "3"
    - id: PRODUCT-UX-S03
      version: "3"
    - id: PRODUCT-UX-S04
      version: "3"
    - id: PRODUCT-UX-S05
      version: "3"
    - id: PRODUCT-UX-S06
      version: "3"
    - id: PRODUCT-UX-S07
      version: "3"
    - id: PRODUCT-UX-S08
      version: "3"
    - id: PRODUCT-UX-S09
      version: "3"
    - id: PRODUCT-UX-specification-review
      version: "2 (previous review, context)"
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
| **Version** | v3 |
| **Specifications Reviewed** | `docs/ux/product-ux-blueprint.md` (PRODUCT-UX v5) and nine screen specifications `docs/ux/screens/S01-home.md` to `S09-data-health.md` (PRODUCT-UX-S01 to S09, v3 each) |
| **Total Findings** | 59 open (0 CRITICAL, 1 HIGH, 35 MEDIUM, 23 LOW): 50 carried from v2, 9 new |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

CRITICAL 0 · HIGH 1 · MEDIUM 35 · LOW 23 · **total 59**.

**What changed since v2.** One commit, `73ed956` on
`usr/alvaro-de-jodra/product-ux-blueprint`, after the v2 head `4478f2b`. It
revises D-10 (a paper or live strategy's rules are read-only; **Edit as a new
strategy** copies them into a new Draft strategy), completes D-11 (the
daily-loss limit is today's loss as a percentage of the strategy's value at the
previous close, an owner setting with default 3%; a stopped strategy stays
stopped until the owner resumes it), raises the blueprint to v5 and every
screen to v3. Text changed in the blueprint (§3.3, §6, §9, §12, §14), S01, S04,
S05 and S08; S02, S03, S06, S07 and S09 changed only in frontmatter. The diff
`4478f2b..73ed956` (10 files, +79 −56) was read line by line, and all ten
subjects were read in full at their current revisions. No upstream artifact
changed since v2 (`git diff 4478f2b..HEAD` over `docs/capabilities`,
`docs/constitution`, `design-system` and `docs/ux/design-source` is empty).

**v2 HIGH findings: both resolved.** FINDING-51 is resolved by the revised D-10:
no screen now needs to hold two running versions, S07's go-live is always a
first go-live, and §9 tiers both edit paths. FINDING-52 is resolved by the
completed D-11: the way back is the owner's **Resume {name}…**, tiered in §9 for
paper and live, placed on S08, linked from S01's new item, rendered on S04, and
the limit's base and source are stated. Each was verified against the current
text, not taken from the revision history. The 50 MEDIUM and LOW findings v2
left open were deliberately not addressed; each was re-verified at current
lines and is still open at its v2 severity. Three are partly changed:
FINDING-34 (the 3% default is now owner-sourced), FINDING-57 (two of its
listed omissions no longer exist; one canvas difference on S08 added) and
FINDING-26 (one more real-money dialog without content).

**New in this round: 1 HIGH, 5 MEDIUM, 3 LOW (FINDING-65 to FINDING-73).** Most
are follow-ons of the two fixes:

- **FINDING-65 (HIGH), D-10.** The revised D-10 ends a superseded strategy
  "when the owner pauses or retires it", and S01 and §3.3 clear an item when it
  is retired, but retiring a strategy is an action no screen offers and §9 does
  not tier, and nothing says what it does to the strategy's holdings. Pausing
  keeps holdings and the kill switch does not sell, so no designed path ends a
  live strategy's real-money positions.
- **FINDING-66 to 70 (MEDIUM).** S05's read-only mode covers strategies "paper
  or live trading" and leaves paused, limit-stopped, ready-for-review and
  retired strategies open, while its header still says *Draft*. S06 still
  offers **Start paper trading** on a superseded backtest, the residue of v2
  FINDING-51(c). Pausing a limit-stopped strategy clears its item, but whether
  a later resume keeps the same-day block is unstated. The paper daily-loss
  stop has no milestone and no setting surface before M6, and three texts
  disagree on whether paper limits equal live ones. The per-stock limit is both
  a strategy rule (S05) and an owner setting (S07, S08), the question D-11
  settled only for the daily-loss limit.
- **FINDING-71 to 73 (LOW).** The blocked-resume reason states a loss condition
  for a rule that is by day; S04's **Stopped ({n})** and its new *Stopped*
  badge name different sets; navigating actions are mapped to `button`, which
  the button spec reserves for in-place actions.

**Verdict:** READY-WITH-WARNINGS. No CRITICAL finding; one HIGH finding. As in
v1 and v2, CONST-AGT's Enforcement section asks for HIGH violations to be
resolved before gate passage, and CONST-REV asks for re-review after them.
Recommendation: an owner decision on FINDING-65, then a v4 review, before
approving any of the ten artifacts.

## Review Scope

**Subjects (10), read in full at the revisions in `review_subjects`.** Project
repo `repos/factorflow-v2/FactorFlow-v2` (symlink to `/home/claude/factorflow-v2`),
branch `usr/alvaro-de-jodra/product-ux-blueprint`, head `73ed956`, working tree
clean before this report. Harness at `/home/claude/ai-agents`, branch
`usr/alvaro-de-jodra/product-ux-artifact-types`, head `ad589c0`, clean. All ten
subjects are `status: draft`; none carries an approval block.

**Upstream read this session, in full or in the parts the subjects cite:**

- `docs/constitution/standards/ui-conventions.md` (STD-UI v6, approved), all 30
  rules, §1, §2, §4 to §7.
- `docs/constitution/product-charter.md` v2 (approved), in full.
- `docs/constitution/tech-stack.md` v5 (approved): constraints C6, the kill
  switch and broker-port paragraphs, Key Libraries (lines 65-97, 155-194,
  265-317), and a search for every library the subjects name.
- `Capability-CAP-002.md` v1 (draft), §2 to §5.1 (lines 100-331): flows, all 23
  ACs. CAP-002 has no `design/` directory.
- `Capability-CAP-001.md` v8 (approved): AC-4 to AC-8, AC-24, §6 and §7 (lines
  220-290, 400-420); CAP-001 `design/ux-design.md` v5 (status region and AC-18
  trace); `web/src/screens/instruments/parse-bulk-symbols.ts` (the parser S02
  cites).
- `design-system/`: resolution per `docs/design-system.md`; the `badge`,
  `dialog` and `button` specs in full; the variant table of every one of the 18
  specs (every component and variant the subjects name was checked by script:
  46 pairs, all resolve); every `--token` the subjects name, against
  `theme.css` (41 distinct, all resolve except the documented non-token
  `--surface` and the family patterns `--risk-*` and `--seq`); `intake.md`.
- `docs/ux/design-source/`: README, and the visible text and sample data of
  P01, P03, P04, P05 and P08, to check each changed screen's §11.
- The harness templates `docs/templates/ux-blueprint.md` and
  `docs/templates/ux-screen-spec.md`, and `.agents/skills/edg-compliance/SKILL.md`
  (checklist).
- `docs/ux/specifications-review-report-v2.md` in full, to verify each v2
  finding.

**Not available:** CAP-002 design artifacts, the M1 capability D-8 names and the
M2 to M6 capabilities (not yet defined), and the private canvas page (its
mirrored sources were used).

**Numbering.** Carried findings keep their identifiers. New findings continue
the sequence after v2's highest, FINDING-64, from FINDING-65, as v2 did after
v1. No identifier is reused. Prior-review identifiers in the status table are
written `v2 FINDING-n` so `check-artifacts.py` does not count them as findings
of this report.

**Mapping to the template's `specifications_reviewed` fields**, as the Product
UX Scope prescribes: `capability_spec` is the blueprint, `ux_design_spec` the
screens directory, the rest `not-provided`. The Product UX Scope has no
capability stage, so `pipeline-state.py` and `get-capability-specifications`
were not run, as the skill directs.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | Counted by script: blueprint §0 to §14 (15 sections, template order); each screen §1 to §11; §5 table 9 rows, `screens/` 9 files, one to one; 8 state rows in every screen; 52 acceptance checks (S01 7, S02 6, S03 7, S04 4, S05 6, S06 5, S07 6, S08 6, S09 5). New: FINDING-65, 66. Carried: FINDING-15, 25, 27, 37, 39, 42, 46, 61 |
| SR-2 Correctness | applied | Each screen against the shell, status map, action tiers and vocabulary; screens against each other; the D-10 and D-11 flows walked for paper and live, including pause, kill switch and backtest edits. New: FINDING-65, 66, 67, 68. Carried: FINDING-10, 30, 36, 41, 58, 59, 62 |
| SR-3 Consistency | applied | Routes, milestones, labels, entities, limits and decisions across blueprint, screens, charter, tech stack, CAP-001, CAP-002, STD-UI v6 and the design system. New: FINDING-69, 70. Carried: FINDING-11, 12, 15, 16, 23, 31, 32, 33, 53, 54, 55 |
| SR-4 Testability | applied | All 52 acceptance checks read for an observable outcome; S05-2, the one check whose text changed, is observable, and S08-6 still holds under the new resume rule. Carried: FINDING-49 |
| SR-5 Traceability | applied | Each §10 row against a charter milestone (all resolve) and each named capability (CAP-001, CAP-002 exist; the D-8 capability and M2 to M6 are named future work). Each AC a screen cites against its text. Carried: FINDING-23, 45, 60 |
| SR-6 Clarity | applied | Vague modifiers, undefined references, unsourced quantities, untrue copy. New: FINDING-70, 71, 72. Carried: FINDING-34, 38, 43, 44, 63 |
| SR-7 Feasibility | applied — limited to the blueprint's technical commitments | Route migration, virtualised list and command palette against tech-stack v5, kill-switch read-back, evidence snapshot; the D-11 measure against the milestone that first supplies intraday prices (FINDING-69). Carried: FINDING-50 |
| SR-8 UX Completeness | applied | `design_system_available = true`. Components and variants checked by script against all 18 specs (46 pairs, all exist); tokens against `theme.css` (all resolve); design sources S01 to S09 resolve and the changed screens' §11 were compared with the canvas text; EDG via STD-UI §1.2 plus the `edg-compliance` checklist. New: FINDING-73. Carried: FINDING-25, 26, 28, 29, 47, 56, 57, 64 |
| SR-9 Dependencies and Conformance | applied | §11 against STD-UI v6, rule by rule (Traceability Matrix). Dependency half: no dependency table in the blueprint; `check-capabilities.py` clean. New: FINDING-65 (STD-UI-19). Carried: FINDING-17 to 22, 27, 35, 40 |
| SR-10 Architectural Vocabulary | not applicable — the blueprint is not a system design | It declares no components or interfaces; "strategy service", "risk service" and the like are named view-model sources, not a design |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run — PASSED, exit 0, no error or warning | none |
| `build-architecture.py -p factorflow-v2` | run — PASSED, exit 0, 1 design, 12 components, 16 interfaces | none (SR-10 not applicable) |
| `check-artifacts.py -p factorflow-v2 --strict` | run — PASSED with 230 warnings, exit 0, 282 artifacts; none in `docs/ux`. The warning touching the subjects is on STD-UI, which pins PRODUCT-UX v3 as a source while the blueprint is now v5: upstream drift on an approved standard, not a defect in a subject | none |
| `check-artifacts.py -p factorflow-v2 --strict -a docs/ux` | run — before this report: PASSED, exit 0, 12 artifacts, no warning. After writing it: PASSED, exit 0, 13 artifacts, no warning | none |
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
| CONST-AGT 2.3 | **AGT-AUTH-002:** the D-10 revision and the D-11 completion are recorded in §12 as dated owner decisions, which is what v2 asked for. The follow-on decisions they leave open are surfaced, not taken: what retiring a strategy does to its holdings (FINDING-65), how pause and a limit stop combine (FINDING-68), the paper daily-loss stop's milestone (FINDING-69) and whether the per-stock limit is a rule or a setting (FINDING-70). **AGT-EVIDENCE-002:** the new 3% default cites D-11; FINDING-34 carried for the rest. **AGT-SPEC-002:** FINDING-35 carried, severity not judged. **AGT-PROV-001:** FINDING-48 carried; this report's provenance is complete. **AGT-AUTH-001:** this review approves nothing |
| CONST-REV 1.4 | REV-STG-001: spec compliance (SR-3, SR-5, SR-9 and the D, CAP and STD-UI matrices) and artifact quality (SR-1, SR-2, SR-4, SR-6, SR-8) are separate stages. REV-AGT-001: the subjects are agent-drafted and were held to the full bar. REV-RCV-001: the revision history's claim that FINDING-51 and 52 are fixed was verified against the text, not accepted (Status of v2 Findings) |
| CONST-VER 1.2 | VER-EVD-001: every script ran this session and its output is recorded. VER-EVD-004: per-finding verdicts for all 52 v2 findings, per-decision verdicts for D-1 to D-11, and per-rule verdicts for STD-UI-1 to 30 |
| CONST-SA 2.0 | SA-MD-001 template structure (FINDING-46, 61 carried), SA-MD-002 cross-references (FINDING-25 carried), SA-MD-003 placeholder text (FINDING-43 carried) |
| CONST-SEC 1.3 | In force (revision recomputed and equal to the approval block; identical on `origin/main`). The subjects never render the provider key (S02-4, S09-4; SEC-SEC-001, CAP-001 AC-13 respected). FINDING-35 carried: capital-at-risk actions on the unauthenticated loopback interface now also include resuming a live strategy stopped by its daily-loss limit (§9 `:522`). The browser-to-API channel falls under SEC-ENC-001 (H9) for state-changing routes; that is a system-design matter for M2, M5 and M6, not a blueprint finding |
| CONST-OPS 1.3 | No destructive operation in this review; the only write is this report. OPS-ERR-001: the kill-switch failure path (§3.3) and the blocked resume reason (§3.3, S08) are specified. OPS-MIG-003: the route migration states a one-release redirect |
| CONST-MDL 1.3 | Exact model identifiers in the subjects' provenance (`claude-opus-5-5`) and in this report's |

Project constitution in scope: STD-UI v6 (approved, the standard under SR-9),
the product charter v2 and the tech stack v5.

---

## Status of v2 Findings

Every finding v2 left open was checked against the current text and the upstream
source it cites. "Resolved" means the defect is gone at the cited lines and
nothing equivalent replaced it; follow-on defects the fix created are new
findings and are cross-referenced. Line numbers are current.

| v2 ID | v2 severity | Status in v3 | Evidence (current lines) |
|-------|-------------|--------------|--------------------------|
| v2 FINDING-51 | HIGH | **Resolved** | D-10 revised (`product-ux-blueprint.md:596`): a paper or live strategy's rules are read-only and **Edit as a new strategy** makes a separate Draft strategy. (a) No strategy runs two versions: §6 `:414-420` says so, S04's view model drops `runningVersion`/`draftVersion` (`S04-strategies.md:93`), S05 opens read-only (`S05-builder.md:100-105`, S05-2 `:149-152`). (b) No replacement exists, so S07's "moves to Live" and "gains or increments the live chip" (`S07-promotion-review.md:127-130`) are true; holdings are not carried over (`:596`); §9 tiers both edit paths (`:511-512`). (c) S04 resolved (a stage changes only through its action, `S04:99-102`). Follow-ons: FINDING-65 (HIGH), 66, 67 (MEDIUM) |
| v2 FINDING-52 | HIGH | **Resolved** | D-11 completed (`:597`, §3.3 `:243-252`): the owner resumes with **Resume {name}…** on S08 (`S08-portfolio.md:117-120`), tiered `confirm` for paper and `real-money` for live (§9 `:522-523`); S01's item has **Review and resume** and a clearing rule (`S01-home.md:138`, §3.3 `:249`); S04 renders the stop and keeps the card in its column (`S04:59-60`, `:103-105`, `stoppedByLimitAt?` `:93`); the limit is one owner setting, default 3%, applied to each strategy, measured against its value at the previous close (`:243-246`, `S08:99`). Follow-ons: FINDING-68, 69 (MEDIUM), 71, 72 (LOW) |
| v2 FINDING-53 | MEDIUM | Open, MEDIUM | §3.3 still says "Only the owner stops all trading" (`:236`); §8 has only *Trading stopped* by the owner (`:496`); STD-UI-12 (`ui-conventions.md:350-352`) and charter §3 (`product-charter.md:119-122`) still anticipate a broker-engaged stop |
| v2 FINDING-54 | MEDIUM | Open, MEDIUM | S05 conditions still `{factor, minPercentile}` (`S05:90`, `:51-54`) against S03's measure and direction (`S03-research.md:52-58`, `:102`); **Use in a strategy** still carries "the current scope and thresholds as the rule's conditions" (`S03:120-121`, §6 `:408-409`) |
| v2 FINDING-55 | MEDIUM | Open, MEDIUM | S03's *Empty, nothing found* state (`S03:136`) still does not mention the save action; S03-7 (`:174-176`) still does not say whether a stock incomplete on a thresholded factor matches; the dialog is still not in §4 (`:83-95`). CAP-002 flow step 5 and AC-5 (`Capability-CAP-002.md:202-203`, `:257-259`) |
| v2 FINDING-56 | MEDIUM | Open, MEDIUM | §4.4 still draws a `badge` reading *R* with an accessible name (`:321-325`; S03 `:66`; S05 `:68-70`) against `badge/design-spec.md:53-54` |
| v2 FINDING-57 | MEDIUM | Open, MEDIUM (partly changed) | Two listed omissions no longer exist: S04's *Draft changes* line and S05's running-version line were removed. Still unlisted: S01 (`:163-168`) omits P01's "classifications stay at yesterday's" item, "ready for a promotion review" and the Live tile's "daily-loss limit unused"; S03 (`:178-188`) omits P03's "of followed stocks" helper and footnote; S04 (`:147-149`, "None beyond §2") omits P04's footer *Settings → Promotion gate*; S05 (`:161-165`) omits P05's *Tilt to score* and the unmarked preview percentile. Found this round: S08 (`:168-177`) omits P08's banner clause "as recorded in the database and at the broker", which §3.3 `:234` drops |
| v2 FINDING-58 | MEDIUM | Open, MEDIUM | Principle 5 (`:101-103`), §6 (`:426-427`), §9 (`:505`), S01 (`:136`) and S09 (`S09-data-health.md:131`) still say a holding strategy keeps an incomplete stock, against S05's **Sell it** (`S05:135`) |
| v2 FINDING-59 | LOW | Open, LOW | "each confirmed on its own" (`S09:108-110`) against routine following (`:504`) |
| v2 FINDING-60 | LOW | Open, LOW | "consumed unchanged" (`:537`) and "on CAP-001's API as it is" (`:536`) against S09 §2's CAP-002 dependency (`S09:43`) |
| v2 FINDING-61 | LOW | Open, LOW | S05-6 still listed between S05-2 and S05-3 (`S05:147-159`) |
| v2 FINDING-62 | LOW | Open, LOW | *Step n of 5* (`S02-setup.md:62`) against four steps before M2 (`:51-52`) |
| v2 FINDING-63 | LOW | Open, LOW | One date for every paper strategy and a count, not a list (`:517`, `:429-433`); whether paused strategies stay paused on **Resume trading** is still unstated. D-11 settles it for limit-stopped strategies (they resume only through **Resume {name}…**, `:246-248`) |
| v2 FINDING-64 | LOW | Open, LOW | §9 `confirm` texts still open with a question and name no confirm label (`:505`, `:514`, `:515`, `:517`, `:519`; `:523` inherits) against `dialog/design-spec.md:85-86` |
| v2 FINDING-10 | MEDIUM | Open, MEDIUM | Paper and Ready card facts still include tracking distance from the backtest (`S04:74-75`); the footer still links Settings → Review gate untagged (`:65-66`, `:129`) |
| v2 FINDING-11 | MEDIUM | Open, MEDIUM | "M2 (Live column empty until M6)" (`S04:41`) against S04-4 (`:145`) and D-6 (`:592`); §10 M2 still gives the stepper *Live* (`:539`); the not-grandfathered case still has no rendering |
| v2 FINDING-12 | MEDIUM | Open, MEDIUM | `gate` still `{paperDays, trackingPp}` (`S04:94`); the footer still states two criteria with literal 60 and 2 (`:129`) |
| v2 FINDING-15 | MEDIUM | Open, MEDIUM | §8 (`:461-498`) still omits backtest states, S04's *LIVE*, S08's *Near limit*, *At limit*, *Price from {date}*, *Not current*, S09's *Not current*, *Can't read account*, S02's *Missing*, S05's *Draft · saved*, the *Possibly restated* mark and S08's *Stopped: daily-loss limit reached at {time}* |
| v2 FINDING-16 | MEDIUM | Open, MEDIUM | *Backtested* with a filled circle (`:306`); *NO TRADING YET* with no shape (`:216`); S06's mark `status-neutral` with a diamond (`S06-backtest.md:74`) |
| v2 FINDING-17 | MEDIUM | Open, MEDIUM | No *checked {time}* on S02 step-4 progress (`S02:75`), S06 progress (`S06:98-99`) or S09's running download (`S09:111-112`); no cadence for S07's evidence-change detection (`S07:124-126`) or the shell's chips and trading state (`:208-223`) |
| v2 FINDING-18 | MEDIUM | Open, MEDIUM | Sparklines without measure, units, as-of or n, their table "on the strategy page" (`S01:147-148`; §11 `:579`) |
| v2 FINDING-19 | MEDIUM | Open, MEDIUM | Only *Daily prices* states its scope, shown on `/data/coverage` (`S09:134`; §11 `:569`) |
| v2 FINDING-20 | MEDIUM | Open, MEDIUM | `h1` *{Weekday}, {day} {Month}* and *Thursday, 15 October* (`S01:55`, `:131`); zoneless *checked 18:52:14* (`:358`); *Scores from today 17:46 CDT* (`S03:62`) |
| v2 FINDING-21 | MEDIUM | Open, MEDIUM | Size literals unchanged (`:179-206`, `:286`, `:317`, `:332`, `:348`; S02 `:58`; S03 `:49`, `:55`, `:69`; S04 `:54`; S05 `:46`, `:65`; S08 `:88`) while §11 claims "only theme tokens" (`:580`) |
| v2 FINDING-22 | MEDIUM | Open, MEDIUM | No search in S03's filters (`S03:49-60`); §11 claims search and filter (`:581`) |
| v2 FINDING-23 | MEDIUM | Open, MEDIUM | `retired` without rendering (`S03:107`); `failedReason` without rendering (`:105`); the as-of line omits the download (`:62`); CAP-002 AC-15, AC-20, AC-21 (`Capability-CAP-002.md:289-313`) |
| v2 FINDING-25 | MEDIUM | Open, MEDIUM | Stock evidence, compare and universes still "CAP-002 page, restyled" with no spec or source (`:142-144`, `:166-170`); S03 §11 cites "the Marks column from the CAP-002 design" (`S03:182-184`), which does not exist |
| v2 FINDING-26 | MEDIUM | Open, MEDIUM (extended) | S07's real-money dialog: no acknowledgement, a question for a title (`S07:77-84`); §9's other real-money dialogs have no content (`:518`, `:521`, `:522`), and `:522` now also covers resuming a live strategy stopped by its daily-loss limit. `dialog/design-spec.md:35`, `:68`, `:85` |
| v2 FINDING-27 | MEDIUM | Open, MEDIUM | Resuming a limit-stopped strategy is now tiered (`:522-523`). Still untiered: changing the review-gate settings (D-3) and changing history depth (S02, Settings). Retiring a strategy: FINDING-65 |
| v2 FINDING-28 | MEDIUM | Open, MEDIUM | Tooltip on a non-focusable badge (`:320`); chips as links with no component (`:221`); the stopped banner and S02's file input still not routed through intake (`S02:168-170`; `design-system/intake.md` has no entry) |
| v2 FINDING-29 | MEDIUM | Open, MEDIUM | Badges over two words (`badge/design-spec.md:21`): *Stopped: daily-loss limit* (`:311`, `S04:59-60`), *Not reflecting the latest download* (`:480`), *Not sent: trading stopped* / *strategy stopped* (`:493-494`), *Trimmed by the 8% limit* (`:495`), *Stopped: daily-loss limit reached at {time}* (`S08:114-115`), *Backtest complete · v{n}* (`S06:44`); the nav count chip carries a number (`:130-132`) |
| v2 FINDING-30 | MEDIUM | Open, MEDIUM | *Add later* still leads to a step 4 with zero stocks (`S02:74`, `:115-117`, `:126`) that CAP-001 AC-24 refuses (`Capability-CAP-001.md:283-288`) |
| v2 FINDING-31 | MEDIUM | Open, MEDIUM | `parse` still cites `parse-bulk-symbols` for `duplicates` and `suggestion` (`S02:100`, `:109-111`); the parser returns only `input`, `normalised`, `valid` (`web/src/screens/instruments/parse-bulk-symbols.ts:19-26`) |
| v2 FINDING-32 | MEDIUM | Open, MEDIUM | S09's Stale (`S09:122`) and S01's "{n} of {m} stocks current" (`S01:66`) against CAP-002 AC-13 (`Capability-CAP-002.md:281-284`) |
| v2 FINDING-33 | MEDIUM | Open, MEDIUM | No status region in §3 (`:177-206`, `:269-276`); CAP-001's pages "consumed unchanged" (`:537`) while its approved region and AC-18 trace (`ux-design.md:71`, `:85`, `:691`) are dropped |
| v2 FINDING-34 | MEDIUM | Open, MEDIUM (partly changed) | The daily-loss default is now owner-sourced (D-11, `:245`, `:597`). Still unsourced: S05's rule blanks (`S05:56-60`) and 800 ms (`:97`); §8's 8% (`:495`); S08's 80% and "older than 2 polls" (`S08:121`, `:133`); S03's 2-6 and 150 ms (`S03:126`, `:128`); S06's $10,000 (`S06:46`); the polling cadences |
| v2 FINDING-35 | MEDIUM | Open, MEDIUM (surfaced, severity not judged) | Capital-at-risk actions on the unauthenticated loopback interface (`:201`, `:514-523`), now including resuming a limit-stopped live strategy (`:522`); CAP-001 §7's open question (`Capability-CAP-001.md:411-415`) still neither cited nor resolved |
| v2 FINDING-36 | MEDIUM | Open, MEDIUM | "Three `checkbox` acknowledgements" (`S07:68`), "the fixed set plus one per mark" (`:110`), one aggregated per-mark sentence (`:150`), S07-6 (`:174-175`) |
| v2 FINDING-37 | LOW | Open, LOW | "Not applicable" without reason: S06 `:107`, `:110`; S07 `:138` |
| v2 FINDING-38 | LOW | Open, LOW | *Paper · practice* (`S08:48`, `:54`), *REAL MONEY* (`S07:51`), *LIVE · n STRATEGY* (`:218`), *Stopping* for two states (`:233`, `:472`), "timed out" (`:527`, `S09:131`), "kill switch" in copy (`:256-257`), *Promotion failed* (`S07:142`), two labels for the limit stop (`:311` against `S08:114-115`) |
| v2 FINDING-39 | LOW | Open, LOW | **Stopped ({n})** opens an unrouted list (`S04:52-53`); `/strategies/:id`'s redirect targets unstated (`:147`). Semantics of that list: FINDING-72 |
| v2 FINDING-40 | LOW | Open, LOW | §9 tiers Stop all trading "protective" (`:516`); §11 records STD-UI-11 and 21 without noting §10 omits both in M1 (`:562`, `:572`, `:536`) |
| v2 FINDING-41 | LOW | Open, LOW | §4.1's sort order omits `active` (`:289-290`); the Draft item has no body, a mutation-like label and no M4 tag (`S01:137`) |
| v2 FINDING-42 | LOW | Open, LOW | Rename by "click" (`S05:44`); no `nav` landmark in §3.1 (`:197`); "Showing {n} of {m}" with no way to the rest (`S08:71`); no completion confirmation for save-as-universe and add-to-universe (`S03:122-127`) |
| v2 FINDING-43 | LOW | Open, LOW | "A deeper depth is requested as stated…" (`S02:73`) |
| v2 FINDING-44 | LOW | Open, LOW | Whether Ready for review persists after the gate stops being met (`S07:121-123`, `:137`) |
| v2 FINDING-45 | LOW | Open, LOW | Holdings line and `heldBy[]` cite CAP-002 AC-17 with no M2 tag (`S03:70`, `:111`) |
| v2 FINDING-46 | LOW | Open, LOW | Bare milestones in S04 and S08 §2 (`S04:39-43`, `S08:41-46`); §13 gives no intake reasoning (`:599-629`); S02's file input in §11, not §4 (`S02:168-170`) |
| v2 FINDING-47 | LOW | Open, LOW | Blank line before the `kill-switch` and `sparkline` rows (`button/design-spec.md:35`; `chart/design-spec.md:33`) |
| v2 FINDING-48 | LOW | Open, LOW | `agent_id: ux-blueprint`, `tool_version: unknown` in all ten subjects (blueprint `:19-23`; screens `:16-20`) |
| v2 FINDING-49 | LOW | Open, LOW | S08-5 unquantified (`S08:164`) |
| v2 FINDING-50 | LOW | Open, LOW | cmdk and a virtualisation library still not in tech-stack v5 (no match in `tech-stack.md`); S06 cites a "dataviz hover layer" (`S06:93`) |

**Superseded:** none. **Regression check on v1's resolved findings:** v1
FINDING-1 to 9, 13, 14 and 24 remain resolved at the current text. v1 FINDING-7
("an edit never changes what trades") holds more strongly under the revised
D-10, with the scope gap of FINDING-66.

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
written, and 1 is not applicable. Against v2, STD-UI-20 moved back to PASS
(FINDING-51 resolved: every go-live is now a first go-live through S07). The
failures and partials:

- STD-UI-1 PARTIAL: FINDING-38, 72.
- STD-UI-2 PARTIAL: FINDING-58, 63, 66, 71.
- STD-UI-5 FAIL: FINDING-20. STD-UI-18 FAIL: FINDING-19. STD-UI-25 FAIL:
  FINDING-17. STD-UI-28 FAIL: FINDING-18. STD-UI-29 FAIL: FINDING-21.
  STD-UI-30 FAIL: FINDING-22.
- STD-UI-8 PARTIAL: FINDING-16, 56. STD-UI-12 PARTIAL: FINDING-15, 16, 53.
  STD-UI-19 PARTIAL: FINDING-27, 40, 65, 68. STD-UI-23 PARTIAL: FINDING-37.
  STD-UI-24 PARTIAL: FINDING-28, 42, 56, 73.
- CONST-SEC: FINDING-35 (carried, surfaced).

No specialization is declared in §11. The issue remains claim support: the
STD-UI-18, 25, 28, 29 and 30 cells read as satisfied where the screens do not
support them, and the STD-UI-19 cell ("§9") omits retiring a strategy.

#### Completeness (SR-1)

All fifteen template sections are present. Content gaps: FINDING-65 (retiring a
strategy), FINDING-15, 25, 27, 39 and 46 carried.

#### Correctness (SR-2)

FINDING-65 (HIGH); FINDING-66, 68 (MEDIUM); FINDING-41, 58 and 59 carried.

#### Testability (SR-4)

The blueprint carries no acceptance checks by design (template: "The blueprint
designs; capabilities specify"). Screen checks are covered below.

#### Clarity (SR-6)

FINDING-69, 70 (MEDIUM); FINDING-71 (LOW); FINDING-34, 38 and 63 carried.

### System Design Specification

Not provided -- skipped. The Product UX Scope has no system design.

### Component Design Specifications

Not provided -- skipped.

### UX Brief

Not provided -- skipped. Capability UX briefs will cite this blueprint.

### UX Design Specification (mapped: screen specifications S01 to S09)

**SR-8 component mapping.** Every component and variant in §4 of each screen
and in the blueprint exists in `design-system/components/` (46 pairs checked by
script over the §4 tables and every inline `` `component` `variant` `` pair).
Uses that conflict with a component's own contract: FINDING-73 (`button` for
navigation), FINDING-26, 29, 56 and 64 carried. Gaps not routed through intake:
FINDING-28 carried.

**SR-8 tokens.** Every `--token` the ten documents name resolves in
`design-system/theme.css`; `--surface` is correctly stated not to be one. Size
literals: FINDING-21 carried.

**SR-8 design source.** S01 to S09 cite their mirrored `P0n` source, and each
resolves. The changed screens' §11 were compared with the canvas text: S04's
read-only and limit-stop additions draw states the canvas does not have, which
is not a disagreement. Remaining unlisted differences are FINDING-57
(carried, now also S08). The CAP-002 pages still have no source (FINDING-25).

**SR-8 EDG.** Under STD-UI §1.2, STD-UI is the project's EDG constitution, so
§11 is the EDG record. The `edg-compliance` checklist was walked over the
changed content: create/modify/delete operations follow a standard pattern
(retiring a strategy has none: FINDING-65), terminology (FINDING-72),
confirmation dialogs (FINDING-26, 64), success feedback (FINDING-42), keyboard
and link semantics (FINDING-73).

**SR-4 testability of the 52 acceptance checks.** All are observable except
S08-5 (FINDING-49). S05-1 and S06-3 are implementation properties, checkable by
contract test. S05-2's new wording is observable. S05's checks are listed out
of order (FINDING-61).

**Per-screen findings (open).**

- Blueprint: FINDING-65 (HIGH); 66, 68, 69, 70 (MEDIUM); 71, 72 (LOW); carried
  11, 15 to 22, 25 to 29, 33 to 35, 53, 54, 56, 58 (MEDIUM), 38 to 42, 46, 47,
  48, 50, 59, 60, 63, 64 (LOW).
- S01: FINDING-69 (MEDIUM); 71, 73 (LOW); carried 18, 20, 32, 57, 58 (MEDIUM),
  41 (LOW).
- S02: carried 17, 28, 30, 31 (MEDIUM), 43, 46, 62 (LOW).
- S03: carried 20, 22, 23, 25, 34, 54, 55, 56, 57 (MEDIUM), 42, 45 (LOW).
- S04: FINDING-65 (HIGH); 67 (MEDIUM); 72, 73 (LOW); carried 10, 11, 12, 15,
  57 (MEDIUM), 39, 46 (LOW).
- S05: FINDING-66, 67, 70 (MEDIUM); carried 34, 54, 56, 57, 58 (MEDIUM), 42,
  61 (LOW).
- S06: FINDING-67 (MEDIUM); carried 15, 16, 17, 34 (MEDIUM), 37, 50 (LOW).
- S07: FINDING-69, 70 (MEDIUM); carried 11, 17, 26, 36 (MEDIUM), 37, 38, 44
  (LOW).
- S08: FINDING-65 (HIGH); 68, 69, 70 (MEDIUM); 71 (LOW); carried 15, 26, 29,
  34, 57 (MEDIUM), 38, 42, 46, 49 (LOW).
- S09: carried 17, 19, 32, 58 (MEDIUM), 38, 59, 60 (LOW).

### Cross-Specification Consistency (SR-3)

Consistent and verified this round:

- **Routes.** §2.1, §2.2, §5 and each screen's `route` agree; the migration in
  §2.2 is unchanged.
- **D-10 across the subjects.** §6 (`:414-420`), §9 (`:511-512`), §12
  (`:596`), S04 (`:99-102`) and S05 (`:97-105`, S05-2) state the same rule: a
  paper or live strategy's rules are read-only and an edit makes a separate
  Draft strategy. S07 no longer needs a replacement form.
- **D-11 across the subjects.** §3.3 (`:236-252`), §4.3 (`:311`), §8
  (`:494`), §9 (`:522-523`), §12 (`:597`), S01 (`:138`), S04 (`:103-105`) and
  S08 (`:113-120`, S08-6) agree that the stop is per strategy, serious, and
  ended only by the owner's **Resume {name}…**, blocked on the day of the stop.
- **STD-UI-1.** §7 matches the v6 table row for row.

Mismatches, each a CROSS-SPEC-INCONSISTENCY: FINDING-69, 70 (MEDIUM); carried
FINDING-11, 12, 15, 16, 23, 31, 32, 33, 53, 54, 55 (MEDIUM) and 60 (LOW).

---

## Findings Summary Table

New findings first (FINDING-65 to 73), then carried findings in numeric order.

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-65 | HIGH | SR-1 / SR-2 / SR-9 (STD-UI-19; CONST-AGT AGT-AUTH-002; D-10) | Blueprint, S01, S04, S08 | `product-ux-blueprint.md:249`, `:312`, `:418-419`, `:500-523`, `:512`, `:596`; `S01-home.md:138`; `S04-strategies.md:52-53`; `S08-portfolio.md:64-67`; `S07-promotion-review.md:151` | The revised D-10 ends a superseded strategy "until the owner pauses or retires it" (§6, §12), §3.3 and S01 clear the daily-loss item when the strategy is "retired", §4.3 has a *Retired* stage and S04 a "stopped and retired list". But retiring a strategy is an action no screen offers (S04's cards, S05 and S08's card carry no such control), §9 does not tier it, and nothing says what it does to the strategy's holdings and scheduled orders: sold at the next rebalance, sold now, or kept unmanaged. Pausing keeps holdings (§9 `:515`) and Stop all trading "does not sell what I hold" (`S07:151`), so no designed path ends a strategy's positions. §9 tiers **Edit as a new strategy** routine (reversible) although nothing designs how the copy is discarded | D-10's replacement path for a live strategy ends in an undesigned action. From M6, retiring a live strategy either sells or orphans real-money holdings, a capital-at-risk behaviour left to implementation; M2's S04 retired list has no way in | Owner decision recorded in §12: what retiring a strategy does to its holdings and orders, for paper and live; whether a Draft or Backtested strategy can be discarded; whether a retired strategy can be restored. Then tier it in §9 (consequential for paper and drafts; capital-at-risk with `dialog` `real-money` where live holdings are sold), place the control (S08's card, S04's card), and render the retired list (with FINDING-39) |
| FINDING-66 | MEDIUM | SR-2 / SR-1 (STD-UI-2; D-10) | S05, Blueprint | `S05-builder.md:34-35`, `:44-50`, `:97-105`, `:149-152`; `product-ux-blueprint.md:307-312`, `:511`, `:522` | S05's read-only mode applies to "a strategy that is paper or live trading" (`:100`); §4.3 also has *Ready for review* (still paper trading), *Paused by you*, *Stopped by a limit* and *Retired*, and S05 does not say how it opens for them. §9 permits editing only Draft or Backtested strategies, but if a paused live strategy opened editable, **Resume** (§9 `:522`) would then trade rules that never passed paper or review, the outcome D-10 exists to prevent. In read-only mode the header still shows *Draft · saved {time}* (`:44-45`), the Rules sub-line still says *Every value can be changed after a backtest; each change makes a new version.* (`:48-50`), and §1 says the primary action "moves the strategy to the next stage" (`:34-35`); on a live strategy each describes behaviour the product does not have. §9 also says editing a Draft "creates a version" while S05 creates one only when a Backtested strategy is saved (`:98`) | The M2 builder can open a paused or limit-stopped strategy editable, or show a live strategy labelled *Draft* | State that every strategy that has started paper trading opens read-only (Paper, Ready for review, Live, Paused, Stopped by a limit, Retired). Give the read-only header (the §4.3 stage badge, not *Draft*), sub-line and purpose. Align §9 and S05 on when a version is created |
| FINDING-67 | MEDIUM | SR-2 (D-6; residual of v2 FINDING-51(c)) | S06, S04, S05 | `S06-backtest.md:48-49`, `:97`, `:109`, `:138`; `S05-builder.md:98-99`; `S04-strategies.md:72-73`; `product-ux-blueprint.md:592` | Saving a Backtested strategy creates a new version and "the stepper falls back to Draft for that version" (S05). S06 offers **Start paper trading** on every backtest; its Stale state for a backtest of an older version adds a banner and **Run backtest** but does not remove or block **Start paper trading**. Which version it starts is unstated: the backtested one (then the strategy trades rules that are not its current rules), or the current one (then a version with no backtest starts paper trading, which D-6 says cannot later be reviewed). S04 does not say whether an edited Backtested strategy's card moves to Draft | M4 implements one of two behaviours, one of which paper-trades an untested version | On a superseded backtest, make **Start paper trading** `blocked` with *This backtest is of version {n}. Run a backtest of the current rules first.*, or state that it starts the backtested version and what happens to the newer edits. State in S04 which column an edited Backtested strategy is in |
| FINDING-68 | MEDIUM | SR-2 (D-11; STD-UI-19) | Blueprint, S08, S01 | `product-ux-blueprint.md:249-252`, `:310-311`, `:519`, `:522-523`; `S08-portfolio.md:66-67`, `:101`, `:117-120`; `S01-home.md:138` | §3.3 and S01 say the daily-loss item clears when the strategy is "paused", so Pause is available on a limit-stopped strategy. S08's view model keeps `paused` and `stoppedByLimitAt` as independent fields, so a strategy can be both. For such a strategy nothing says which resume applies: §9's "Resume a paused paper strategy" has no same-day block, while resuming a limit-stopped one is `blocked` until after the close (§3.3). Pausing on the day of the stop and resuming then sidesteps the block, whose stated reason is that the loss is still at the limit. S08 §3 offers Pause or **Resume {name}…** "when paused" (`:66-67`), not when stopped by the limit, against its own §6. §4.3 gives one stage badge, *Paused* or *Stopped: daily-loss limit*, with no precedence | Implementations differ on whether the same-day block holds; for a live strategy that is a real-money resume against a loss already at the limit | State whether a limit-stopped strategy can be paused. If it can, state that pausing keeps the limit stop, that any resume on the day of the stop is blocked, and which badge shows. Name both resume cases in S08 §3 |
| FINDING-69 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY / SR-7 (D-11) | Blueprint, S01, S07, S08 | `product-ux-blueprint.md:168-170`, `:243-246`, `:521`, `:523`, `:539-543`; `S01-home.md:43`, `:61-62`, `:138`; `S07-promotion-review.md:66`; `S08-portfolio.md:43-46`, `:57-63`, `:99`; `docs/constitution/tech-stack.md:287-288` | (a) **Milestone.** §10 M6 and S08 §2 place "per-strategy daily-loss stops" and limit meters in M6, while §3.3 says paper strategies use the same value, §9 tiers resuming a limit-stopped paper strategy, S01's example is a paper strategy, and S01 §2 assigns strategy-related items to M2; none tags the paper stop. S08's paper tab (M2) has two limit tiles with `progress` `meter`. (b) **Setting surface.** The value is "set in Settings with the other limits", but §2.3 leaves the live-limit section to M6's design and §9 tiers "live limits" capital-at-risk; how it is set before M6, and whether changing a value that also governs paper is that action, is unstated. (c) **Paper equals live.** §3.3 "paper strategies use the same value" against S08 "paper limits mirror your live settings *when they do*" and S07 "Limits (live only)". (d) S01 and S08 still say "each strategy has its own limit" for one setting applied to each strategy. (e) **Feasibility.** Today's loss intraday needs intraday prices, which arrive in M3 (S08 §2 `:44`); the broker port supplies no prices (tech stack). A paper stop before M3 could only be evaluated at the close | The M2 capability cannot tell whether it ships paper daily-loss stops, where the owner sets the value, or how a stop is measured before M3 | Tag the paper daily-loss stop with its milestone (with M6, or from M3), or state that paper strategies have none before it; say where the value is set before M6 and its tier; reword S08 `:63` and S07 `:66` to match §3.3; replace "its own limit" with "measured separately against your daily-loss limit" |
| FINDING-70 | MEDIUM | SR-3 / SR-6 (CONST-AGT AGT-AUTH-002) | S05, S07, S08, Blueprint, S01 | `S05-builder.md:56-57`, `:90`; `S07-promotion-review.md:66`, `:81-82`, `:109`; `S08-portfolio.md:58-59`, `:99`, `:151`; `product-ux-blueprint.md:495`, `:521`; `S01-home.md:135` | The per-stock limit is two things at once. S05 makes it a strategy rule: *Never more than [8] % in one stock*, `rules.maxPerStockPct`, versioned per strategy. S07 and S08 make it an owner setting: `limits.perStockPct` from "settings" ("broker + settings", "settings + risk service"), *Limits (live only): per-stock and daily-loss limits*, one account-wide tile *Largest position vs {n}% limit*, changed under §9's "live limits". S01's item says trimming left a strategy holding "less NVDA than its rules asked for", which reads as a cap separate from the rules. Which value trims an order, and what S08's account-wide tile compares against when strategies' rules differ, is unstated. D-11 settled this question for the daily-loss limit only | M2 and M6 decide by implementation whether a strategy's own cap or the owner's setting governs real-money position size | Owner decision recorded in §12: rule, setting, or both (the setting as a cap over each strategy's rule). Then align S05, S07, S08, §8 and S01's copy |
| FINDING-71 | LOW | SR-6 (STD-UI-2) | Blueprint, S08, S01 | `product-ux-blueprint.md:250-252`; `S08-portfolio.md:118-120`; `S01-home.md:138` | On the day of the stop, **Resume {name}…** is `blocked` with *Today's loss is still at the limit. You can resume after today's close.* The block is by day, not by loss: the strategy still holds positions, and today's loss can move back under the limit, when the first sentence is untrue. S01's action **Review and resume** leads on that day to a control that cannot resume | The block reason can misstate the account's state | *Stopped by its daily-loss limit today. You can resume after today's close.*; label S01's action **Review** on the day of the stop, or keep it and say why resume is blocked |
| FINDING-72 | LOW | SR-6 (STD-UI-1) | S04, Blueprint | `S04-strategies.md:52-53`, `:59-60`, `:95`, `:103-105`; `product-ux-blueprint.md:310-311` | **Stopped ({n})** "opens the stopped and retired list" (`stoppedCount`), while a strategy stopped by its daily-loss limit "stays in its column" with a *Stopped* badge. Whether `stoppedCount` counts it is unstated, "Stopped" names two different sets on one screen, and §4.3 calls the owner's pause *Paused*. A card has one optional status badge while a Paper card can be both *Limit hit* and *Stopped: daily-loss limit*; precedence is unstated | The board's count and badges can disagree about what is stopped | Name the header list for what it holds (for example **Paused and retired ({n})**), state that limit-stopped strategies are not in it, and state that the serious stop badge takes the slot over *Limit hit* |
| FINDING-73 | LOW | SR-8 (STD-UI-24) | S01, S04 | `design-system/components/button/design-spec.md:20`; `S01-home.md:85`, `:106-107`, `:138`; `S04-strategies.md:74-76`, `:86`, `:104-105` | The button spec says not to use `button` for "Navigating to another route — use a link, so middle-click and open-in-new-tab work". S01 maps every *Needs you* action to `button` while §6 says each navigates (the new **Review and resume** among them); S04 maps its card actions to `button`, and **Open**, **Monitor**, **Review evidence** and the limit-stopped **Open** navigate | Navigation loses link semantics; implementations either break the component contract or deviate from the spec | Map navigating actions to links (styled as buttons through Radix Slot where wanted), and keep `button` for actions that change state |
| FINDING-10 | MEDIUM | SR-2 | S04 | `S04-strategies.md:65-66`, `:74-75`, `:129` | Carried from v2: M2 and M3 Paper cards show tracking distance from a backtest (M4), and the footer links Settings → Review gate (M5), untagged | The M2 board renders values that cannot be computed and links to a page that does not exist | As v2: milestone-tag card facts and the footer |
| FINDING-11 | MEDIUM | SR-3 (D-6) | Blueprint, S04, S07 | `S04-strategies.md:41`, `:45-46`, `:145`; `product-ux-blueprint.md:298-299`, `:539`, `:592` | Carried from v2: a Live column in M2 "empty until M6" against S04-4 and D-6; the stepper shows *Live* from M2; the not-grandfathered case has no rendering | An owner decision applied inconsistently | As v2 |
| FINDING-12 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY (D-3) | S04 | `S04-strategies.md:94`, `:129` | Carried from v2: `gate` and the footer carry two of D-3's four criteria, with literal values | The board misstates the owner's gate | As v2 |
| FINDING-15 | MEDIUM | SR-1 / SR-3 (STD-UI-12) | Blueprint, screens | `product-ux-blueprint.md:461-498`; see the status table above | Carried from v2: §8 omits the statuses listed in the status table | Capabilities inherit untiered statuses | As v2 |
| FINDING-16 | MEDIUM | SR-3 / SR-9 (STD-UI-8, STD-UI-12) | Blueprint, S06 | `product-ux-blueprint.md:216`, `:306`; `S06-backtest.md:74` | Carried from v2: tier shapes reused, *NO TRADING YET* without shape, S06's mark drawn unlike §4.4's | In greyscale a neutral badge reads as good | As v2 |
| FINDING-17 | MEDIUM | SR-9 (STD-UI-25) | Blueprint, S02, S06, S07, S09 | `S02-setup.md:75`; `S06-backtest.md:98-99`; `S09-data-health.md:111-112`; `S07-promotion-review.md:124-126`; `product-ux-blueprint.md:208-223` | Carried from v2: polled regions with no last-updated time or no recorded cadence | STD-UI-25 unmet for the shell and four regions | As v2 |
| FINDING-18 | MEDIUM | SR-9 (STD-UI-28) | S01, Blueprint | `S01-home.md:147-148`; `product-ux-blueprint.md:579` | Carried from v2: sparklines without provenance; table on an unspecified page | §11's STD-UI-28 claim unsupported | As v2 |
| FINDING-19 | MEDIUM | SR-9 (STD-UI-18) | S09, Blueprint | `S09-data-health.md:134`; `product-ux-blueprint.md:569` | Carried from v2: only one check states its scope, and not alongside its result | Absence of detected problems presented without limits | As v2 |
| FINDING-20 | MEDIUM | SR-9 (STD-UI-5) | S01, S03, Blueprint | `S01-home.md:55`, `:131`; `S03-research.md:62`; `product-ux-blueprint.md:358` | Carried from v2: locale-formatted `h1`, zoneless *checked* time, non-ISO as-of | Nonconformance with a rule that allows no specialization | As v2 |
| FINDING-21 | MEDIUM | SR-9 (STD-UI-29) | Blueprint, screens | `product-ux-blueprint.md:179-206`, `:580`; screens as in the status table | Carried from v2: about twenty size literals while §11 claims only tokens | STD-UI-29 verification fails as written | As v2 |
| FINDING-22 | MEDIUM | SR-9 (STD-UI-30) | S03, Blueprint | `S03-research.md:49-60`; `product-ux-blueprint.md:581` | Carried from v2: no search on the 3000-row list | STD-UI-30 unmet | As v2 |
| FINDING-23 | MEDIUM | SR-3 / SR-5 | S03 | `S03-research.md:62`, `:77-79`, `:105`, `:107` | Carried from v2: no rendering for retired stocks (AC-15), score-update failure (AC-20) or the download the scores reflect (AC-21) | CAP-002's UX design misses three ACs | As v2 |
| FINDING-25 | MEDIUM | SR-8 / SR-1 (CONST-SA SA-MD-002) | Blueprint, S03 | `product-ux-blueprint.md:142-144`, `:166-170`; `S03-research.md:182-184` | Carried from v2: routes with neither spec nor resolvable source; S03 cites a CAP-002 design that does not exist | Unresolvable references | As v2 |
| FINDING-26 | MEDIUM | SR-8 | S07, Blueprint | `S07-promotion-review.md:77-84`; `product-ux-blueprint.md:518`, `:521-522`; `dialog/design-spec.md:35`, `:68`, `:85` | Carried from v2, extended: real-money dialogs without acknowledgement or content, now including resuming a live strategy stopped by its daily-loss limit | Contract broken or invented | As v2; give the limit-stop resume its description (what re-arms, from which close) |
| FINDING-27 | MEDIUM | SR-1 / SR-9 (STD-UI-19) | Blueprint | `product-ux-blueprint.md:500-523` | Carried from v2: changing review-gate settings and changing history depth are untiered | Tiers left to each capability | Add the two rows (retiring a strategy is FINDING-65) |
| FINDING-28 | MEDIUM | SR-8 (COMPONENT-SPEC-GAP; STD-UI-24) | Blueprint, S02 | `product-ux-blueprint.md:221`, `:320`; `S02-setup.md:168-170` | Carried from v2: tooltip on a non-focusable badge; chip links with no component; banner and file input not through intake | Undesigned components; keyboard access blocked | As v2 |
| FINDING-29 | MEDIUM | SR-8 | Blueprint, screens | `badge/design-spec.md:21`; `product-ux-blueprint.md:130-132`, `:311`, `:480`, `:493-495`; `S08-portfolio.md:114-115` | Carried from v2: multi-word badges and a count in a badge | Systematic conflict with the badge contract | As v2 |
| FINDING-30 | MEDIUM | SR-2 | S02 | `S02-setup.md:74`, `:115-117`, `:126` | Carried from v2: *Add later* leads to a step 4 that CAP-001 AC-24 refuses | First-run dead end | As v2 |
| FINDING-31 | MEDIUM | SR-3 / SR-5 | S02 | `S02-setup.md:51-52`, `:100`, `:109-111` | Carried from v2: near-miss suggestions cite a function that does not produce them | New behaviour with a wrong source | As v2 |
| FINDING-32 | MEDIUM | SR-3 | S09, S01 | `S09-data-health.md:122`; `S01-home.md:66` | Carried from v2: an M1 staleness definition unlike CAP-002 AC-13 | Two definitions of "current" | As v2 |
| FINDING-33 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY | Blueprint | `product-ux-blueprint.md:177-206`, `:269-276`, `:537`; CAP-001 `design/ux-design.md:71`, `:85`, `:691` | Carried from v2: the shell drops CAP-001's approved status region and its AC-18 trace | An approved design element removed silently | As v2 |
| FINDING-34 | MEDIUM | SR-6 (CONST-AGT AGT-EVIDENCE-002) | S05, Blueprint, S08, S03, S06 | as in the status table | Carried from v2, partly changed: unsourced quantities remain; the daily-loss default is now owner-sourced | Capital-relevant defaults without an owner decision | As v2 |
| FINDING-35 | MEDIUM | SR-9 (CONST-SEC SEC-AUTH-001; CONST-AGT AGT-SPEC-002) | Blueprint | `product-ux-blueprint.md:201`, `:514-523`; `Capability-CAP-001.md:411-415` | Carried from v2: capital-at-risk actions on the unauthenticated loopback interface, now including resuming a limit-stopped live strategy; surfaced, severity not judged | A security trade-off carries into M2 and M6 by default | As v2: owner decision before the M2 UX design |
| FINDING-36 | MEDIUM | SR-2 | S07 | `S07-promotion-review.md:68`, `:110`, `:150`, `:174-175` | Carried from v2: the acknowledgement count disagrees across layout, view model, copy and S07-6 | The go-live gate's count is ambiguous | As v2 |
| FINDING-53 | MEDIUM | SR-3 / SR-1 (STD-UI-12; charter §3) | Blueprint | `product-ux-blueprint.md:236-241`, `:496`, `:597`; `docs/constitution/standards/ui-conventions.md:350-352`; `docs/constitution/product-charter.md:119-122` | Carried from v2: the broker-engaged trading stop STD-UI-12 and the charter anticipate has no rendering, and §3.3 says only the owner stops all trading | M2 and M6 have no state for a broker-side stop | As v2 |
| FINDING-54 | MEDIUM | SR-3 CROSS-SPEC-INCONSISTENCY | S03, S05, Blueprint | `S03-research.md:52-58`, `:102`, `:120-121`; `S05-builder.md:51-54`, `:90`; `product-ux-blueprint.md:408-409` | Carried from v2: S03's thresholds cannot be carried into S05's percentile-floor conditions | The research-to-strategy hand-off drops or mistranslates the filter | As v2 |
| FINDING-55 | MEDIUM | SR-1 / SR-3 (CAP-002 AC-2, AC-5) | S03 | `S03-research.md:61-64`, `:122-124`, `:136`, `:163-164`, `:174-176`; `Capability-CAP-002.md:202-203`, `:248-250`, `:257-259` | Carried from v2: save-as-universe at zero matches and for incomplete stocks undesigned | AC-5 unmet and AC-2's membership ambiguous | As v2 |
| FINDING-56 | MEDIUM | SR-8 (STD-UI-8, STD-UI-24) | Blueprint, S03, S05 | `product-ux-blueprint.md:321-325`; `S03-research.md:66`; `S05-builder.md:68-70`; `badge/design-spec.md:53-54` | Carried from v2: the *R* badge with an accessible-name override the badge cannot carry | The stricter-only mark has a label the component forbids | As v2 |
| FINDING-57 | MEDIUM | SR-8 (design source; blueprint §0) | S01, S03, S04, S05, S08 | `S01-home.md:163-168`; `S03-research.md:178-188`; `S04-strategies.md:147-149`; `S05-builder.md:161-165`; `S08-portfolio.md:168-177`; against `design-source/P01`, `P03`, `P04`, `P05`, `P08` | Carried from v2, partly changed: canvas differences still unlisted (see the status table); S08's banner wording added | Implementers copying canvas copy reintroduce removed defects | As v2: list each difference with its reason |
| FINDING-58 | MEDIUM | SR-2 (STD-UI-2) | Blueprint, S01, S05, S09 | `product-ux-blueprint.md:101-103`, `:426-427`, `:505`; `S01-home.md:136`; `S09-data-health.md:131`; `S05-builder.md:135` | Carried from v2: copy says holding strategies keep incomplete stocks, against S05's **Sell it** | The owner can be told a live holding is safe while it is being sold | As v2 |
| FINDING-37 | LOW | SR-1 (STD-UI-23) | S06, S07 | `S06-backtest.md:107`, `:110`; `S07-promotion-review.md:138` | Carried from v2 | Inapplicability unreviewable | As v2 |
| FINDING-38 | LOW | SR-6 (STD-UI-1) | Blueprint, S07, S08, S09 | as in the status table | Carried from v2 | Minor vocabulary drift | As v2 |
| FINDING-39 | LOW | SR-1 | S04, Blueprint | `S04-strategies.md:52-53`; `product-ux-blueprint.md:147` | Carried from v2 | Undefined destinations | As v2 |
| FINDING-40 | LOW | SR-9 (STD-UI-19, 11, 21) | Blueprint | `product-ux-blueprint.md:516`, `:536`, `:562`, `:572` | Carried from v2 | The conformance table is less precise than the rules | As v2 |
| FINDING-41 | LOW | SR-2 | Blueprint, S01 | `product-ux-blueprint.md:289-290`; `S01-home.md:137` | Carried from v2 | Small inconsistencies in the home pattern | As v2 |
| FINDING-42 | LOW | SR-1 (STD-UI-24) | S05, Blueprint, S08, S03 | `S05-builder.md:44`; `product-ux-blueprint.md:197`; `S08-portfolio.md:71`; `S03-research.md:122-127` | Carried from v2 | Small accessibility gaps | As v2 |
| FINDING-43 | LOW | SR-6 (CONST-SA SA-MD-003) | S02 | `S02-setup.md:73` | Carried from v2 | Copy left to the implementer | As v2 |
| FINDING-44 | LOW | SR-6 | S07 | `S07-promotion-review.md:121-123`, `:137` | Carried from v2 | Routing ambiguous | As v2 |
| FINDING-45 | LOW | SR-5 | S03 | `S03-research.md:70`, `:111` | Carried from v2 | Wrong citation | As v2 |
| FINDING-46 | LOW | SR-1 (CONST-SA SA-MD-001) | S04, S08, Blueprint, S02 | `S04-strategies.md:39-43`; `S08-portfolio.md:41-46`; `product-ux-blueprint.md:599-629`; `S02-setup.md:168-170` | Carried from v2 | Minor template drift | As v2 |
| FINDING-47 | LOW | SR-8 | Blueprint (design-system changes) | `button/design-spec.md:35`; `chart/design-spec.md:33` | Carried from v2 | Variants render outside their tables | As v2 (a human edit to the design system) |
| FINDING-48 | LOW | CONST-AGT AGT-PROV-001 | Blueprint and S01 to S09 | `product-ux-blueprint.md:19-23`; each screen's frontmatter | Carried from v2 | Provenance not traceable to an agent | As v2 |
| FINDING-49 | LOW | SR-4 | S08 | `S08-portfolio.md:164` | Carried from v2 | Check not decidable | As v2 |
| FINDING-50 | LOW | SR-7 | Blueprint, S06 | `product-ux-blueprint.md:612`, `:622-623`; `S06-backtest.md:93` | Carried from v2 | Library choices and licence records left to implementation | As v2 |
| FINDING-59 | LOW | SR-2 (STD-UI-19) | S09, Blueprint | `S09-data-health.md:108-110`; `product-ux-blueprint.md:504` | Carried from v2 | A confirmation STD-UI-19 forbids may be added | As v2 |
| FINDING-60 | LOW | SR-5 / SR-6 (CONST-AGT AGT-SCOPE-002) | Blueprint, S09 | `product-ux-blueprint.md:536-537`; `S09-data-health.md:43` | Carried from v2 | The new capability starts from an untrue ownership statement | As v2 |
| FINDING-61 | LOW | SR-1 (CONST-SA SA-MD-001) | S05 | `S05-builder.md:147-159` | Carried from v2 | Check identifiers read out of order | As v2 |
| FINDING-62 | LOW | SR-2 (STD-UI-26) | S02 | `S02-setup.md:51-52`, `:62` | Carried from v2 | The M1 position indicator counts a step that does not exist | As v2 |
| FINDING-63 | LOW | SR-6 (STD-UI-2) | Blueprint | `product-ux-blueprint.md:429-433`, `:517`, `:519` | Carried from v2 | The confirmation can misstate when orders resume | As v2 |
| FINDING-64 | LOW | SR-8 | Blueprint | `product-ux-blueprint.md:505`, `:514`, `:515`, `:517`, `:519`, `:523`; `dialog/design-spec.md:85-86` | Carried from v2 | Implementations break the content rules or invent labels | As v2 |

---

## Traceability Matrix

### Milestone map against the charter (SR-5)

| §10 row | Charter milestone | Capability named | Exists or future | Verdict |
|---------|-------------------|------------------|------------------|---------|
| M1 App shell & data health | M1 Universe & Factors | New capability (D-8) | Future work, named; to be defined through the pipeline | PASS; wording and dependency FINDING-60 |
| M1 CAP-001 | M1 | CAP-001 v8, approved | Exists; "no new work" | PASS; FINDING-60, 33 |
| M1 CAP-002 | M1 | CAP-002 v1, draft | Exists; S03 claims AC-2 and delivers it | PASS; content FINDING-23, 25, 55 |
| M2 | M2 Strategies & Paper Trading | Strategies & paper trading | Future work, named | PASS; content FINDING-10, 11, 54, 65, 66, 69 |
| M3 | M3 Live Market Data | Live market data | Future work, named | PASS |
| M4 | M4 Backtesting | Backtesting | Future work, named | PASS; content FINDING-67 |
| M5 | M5 Promotion Gate | Promotion gate | Future work, named | PASS |
| M6 | M6 Live Trading | Live trading | Future work, named | PASS; content FINDING-65, 68, 69, 70 |

### Owner decisions (VER-EVD-004)

| Decision | Where it should show | Verdict | Evidence |
|----------|----------------------|---------|----------|
| D-1 display labels | §7, all copy | PASS (§7); copy residue LOW | §7 equals STD-UI-1 v6 (`:442-455`); FINDING-38, 72 |
| D-2 scheduled downloads from M2 | §10 M2, S09 §2 and §11 | PASS, with FINDING-32 for M1 staleness | `:539`; `S09:46`, `:162-164` |
| D-3 gate criteria are owner settings | S04, S07, Settings | PARTIAL | S07 evaluates the settings (`S07:106`); S04 states two of four (FINDING-12); Settings deferred to M5's design (`:168-170`) |
| D-4 written rationale | S07 | PASS | `S07:68-70`, `:152`, S07-2 |
| D-5 environment tokens outside the region | S01, S04, S08 | PASS | Always with words: S01-2, S04-2, S08 §1 |
| D-6 only shipped stages | §4.2, S04, S05 | PARTIAL | Live shown from M2 against S04-4; not-grandfathered case unrendered (FINDING-11); superseded backtest (FINDING-67) |
| D-7 kill switch in M2 | §10 M2, §3.3, S08 | PASS | `:234`, `:517-519`, `:539`; `S08:45` |
| D-8 new M1 capability | §10 M1, S01, S02, S09 §2 | PASS | `:536-538`; `S01:42`; `S02:51-52`; `S09:43`. Wording FINDING-60 |
| D-9 S09 recovery as CAP-001 provides | S09, §6, §9 | PASS | `S09:60-65`, `:100-110`, `:155-157`; `:422-427`, `:506`. Wording FINDING-59 |
| D-10 an edit makes a new strategy | §6, §9, S04, S05 | PARTIAL | The rule is applied everywhere it names (`:414-420`, `:511-512`, `:596`; `S04:99-102`; `S05:100-105`, S05-2). Retiring, which it names as the way the original ends, is undesigned (FINDING-65); read-only scope (FINDING-66); superseded backtest (FINDING-67) |
| D-11 daily-loss limit stops one strategy until resumed | §3.3, §4.3, §8, §9, S01, S04, S07, S08 | PARTIAL | Scope, measure, default and the owner's resume applied everywhere (`:236-252`, `:311`, `:494`, `:522-523`; `S01:138`; `S04:103-105`; `S08:113-120`). Pause interaction (FINDING-68); paper milestone and setting surface (FINDING-69); broker-engaged stop (FINDING-53) |

### CAP-002 acceptance criteria with UX implications

| AC | Where the subjects address it | Verdict |
|----|-------------------------------|---------|
| AC-1 universe by hand | S03 tray *Add to universe…* → *New universe*; universes route (unspecified) | PARTIAL (FINDING-25) |
| AC-2 universe from a filter | S03 **Save these {n} as a universe…**, S03-7 | PARTIAL (FINDING-55) |
| AC-3 to AC-6 several universes, maintenance, no empty universe, membership history | Universes routes, "CAP-002 page, restyled"; §9 tiers; AC-5 at the save action unspecified | GAP (FINDING-25, 55) |
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
| STD-UI-1 | yes | PARTIAL | §7 matches v6; copy residue FINDING-38; *Stopped* for two sets FINDING-72 |
| STD-UI-2 | yes | PARTIAL | FINDING-58, 63, 66 (read-only header and sub-line), 71 |
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
| STD-UI-16 | yes | PASS | Incomplete shown, never filled |
| STD-UI-17 | yes | PASS | §4.4 in lists and previews, S03-6, S05-6, S06 limits, S07 acknowledgement; form FINDING-56 |
| STD-UI-18 | yes | FAIL | FINDING-19 |
| STD-UI-19 | yes | PARTIAL | FINDING-27, 40, 65 (retire untiered), 68 |
| STD-UI-20 | yes | PASS | S07-1 to S07-6; every go-live is a first go-live under D-10; consistency FINDING-36 |
| STD-UI-21 | yes | PASS from M2 | §3.3, S08-2 |
| STD-UI-22 | yes | PASS | §4.9, S07-4, S08-5 |
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

**Verdict: READY-WITH-WARNINGS**

No CRITICAL finding, so the rubric's verdict is READY-WITH-WARNINGS. The one
HIGH finding does not block the M1 work: M1 delivers no strategy, no order and
no limit, and the shell, S01's data region, S02, S03 and S09 are untouched by
FINDING-65 to 70.

FINDING-65 was weighed against CRITICAL and against MEDIUM. It leaves a
capital-at-risk behaviour to implementation (what retiring a live strategy does
to real-money holdings), the class v1 and v2 rated HIGH for FINDING-7, 8, 9, 51
and 52, and an owner decision record (D-10) now depends on it. It touches M2
(the retired list, discarding a copy) and M6 (live holdings), not the work the
pipeline does next. The owner may judge otherwise.

Both v2 HIGH findings are resolved, and the decisions behind them are recorded
where the pipeline will read them. What remains:

- **FINDING-65.** One owner decision on retiring a strategy, needed before the
  M2 UX design starts from S04 or S08.
- **FINDING-66 to 70.** Gaps the fixes left at their edges; 69 and 70 need
  owner answers, the others are text once the answers are known.
- **The 30 carried MEDIUM findings**, unaddressed by choice. The STD-UI set
  (FINDING-15 to 22, 26 to 29) is inherited by every capability that cites §11.

CONST-AGT (Enforcement) asks for HIGH violations to be resolved before gate
passage, and CONST-REV asks for re-review after High violations.
Recommendation: decide FINDING-65, fix it, re-review, and only then approve each
artifact separately with
`scripts/artifact-gate.py approve --review-artifact docs/ux/specifications-review-report-v{N}.md`.
This review approves nothing.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-65: owner decision on what retiring a strategy does to its holdings
   and orders (paper and live), and whether drafts can be discarded; then tier
   it in §9, place the control on S08 and S04, and render the retired list.

### Should Fix (MEDIUM findings)

New: FINDING-66 (S05 read-only scope and header), 67 (S06 superseded
backtest), 68 (pause and a limit stop), 69 (paper daily-loss milestone and
setting), 70 (per-stock limit: rule or setting).

Carried: FINDING-10 to 12, 15 to 23, 25 to 36, 53 to 58. Prioritise the STD-UI
conformance set (15 to 22, 26 to 29), because every capability inherits it, and
the owner decisions (32, 34, 35, 53, 70).

### Nice to Have (LOW findings)

New: FINDING-71 to 73. Carried: FINDING-37 to 50, 59 to 64.
