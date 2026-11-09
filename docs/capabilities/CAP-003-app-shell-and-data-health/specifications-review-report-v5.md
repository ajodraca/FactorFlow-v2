---
artifact_schema_version: 1
artifact_id: CAP-003-specification-review
artifact_type: specification-review
artifact_version: 5
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
document: spec-review-report
capability: CAP-003
version: v5
generated: 2026-11-08T00:43:00Z
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
    result: "PASSED, exit 0: 3 capabilities, 11 edges (blocked-by 0, requires-runtime 4, requires-contract 0, conforms-to 7), 1 standard, 2 conformance claims, 1 constitution artifact, 4 references; integration layers CAP-001, CAP-002, CAP-003; no error, no warning"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0: 3 designs, 27 components, 88 interfaces, no drift against docs/architecture.md (the change touches no Section 4 interface)"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 481 warnings, exit 0 (--strict, whole project; 482 at v4). Scoped with -a: the capability PASSED with no warning; design/ PASSED with 24 warnings (25 at v4), all upstream pins (FINDING-15, FINDING-35)"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0: 1256 path references across 647 Markdown files; its scope excludes repos/, so the commits the subjects cite were resolved by hand (FINDING-36)"
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
  SR-7: "applied — the change is wording and test expectations only; v4's reproduction of the transport path and the per-stock budget stands, no behaviour it verified changed"
  SR-8: "applied — design_system_available true (projects/factorflow-v2/design-system.yaml; components, theme.css, component-map.json and intake.md exist); the change adds no UI element, component, variant or token; no COMPONENT-SPEC-GAP"
  SR-9: "applied — dependency half and STD-UI conformance half by check-capabilities.py; STD-UI-1 claim support against capability OQ-5 and STD-UI sections 1.1 and 4 by hand (FINDING-30)"
  SR-10: applied
specifications_reviewed:
  capability_spec: docs/capabilities/CAP-003-app-shell-and-data-health/Capability-CAP-003.md
  system_design: docs/capabilities/CAP-003-app-shell-and-data-health/design/system-design.md
  ux_brief: docs/capabilities/CAP-003-app-shell-and-data-health/design/ux-brief.md
  ux_design_spec: docs/capabilities/CAP-003-app-shell-and-data-health/design/ux-design.md
  component_designs:
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-acquisition-runner.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-command-palette.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-data-health-api.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-data-health-reader.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-data-health-ui.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-home-ui.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-ingestion-api.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-massive-client.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-owner-shell.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-owner-web-app.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-rate-limit-governor.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-setup-ui.md
    - docs/capabilities/CAP-003-app-shell-and-data-health/design/component-design-ui-components.md
review_subjects:
  - artifact_id: CAP-003
    artifact_version: 2
    content_revision: sha256:d1228fd385efbf047cf521881048286970e1e207f7809e42e7ce9e71ae475d24
  - artifact_id: CAP-003-system-design
    artifact_version: 2
    content_revision: sha256:4a8c85195d369416656eefa7933adbf88efb77c7b4c31f00dce7a723267c86d6
  - artifact_id: CAP-003-ux-brief
    artifact_version: 2
    content_revision: sha256:3e44ea14bc6add09b70e5a3e1b54143a59bd15e737f29e1fa5f93a1a5c569ebd
  - artifact_id: CAP-003-ux-design
    artifact_version: 2
    content_revision: sha256:86cce09aa4eee380ee98ed2a1bf2a4040d4e0a082055ba0133da1adaa1a42d77
  - artifact_id: CAP-003-component-design-acquisition-runner
    artifact_version: 1
    content_revision: sha256:28e9b7c6a8f85bb3c1ca58fd971b4a30afdafe3a1f720bd812ed70b74fdc51df
  - artifact_id: CAP-003-component-design-command-palette
    artifact_version: 1
    content_revision: sha256:5f90690b3b633cc184c794aafa890965b4fbaa656cd4962835a822875878f617
  - artifact_id: CAP-003-component-design-data-health-api
    artifact_version: 2
    content_revision: sha256:de44a915fc02b671425279bf769a61342a00657b5a4e72fde8205300c9d61259
  - artifact_id: CAP-003-component-design-data-health-reader
    artifact_version: 2
    content_revision: sha256:3ea280a900eaacb56f019a18292cdbf078f0a1a49fc80c3dd1f433097b2116b8
  - artifact_id: CAP-003-component-design-data-health-ui
    artifact_version: 2
    content_revision: sha256:8bc4a8e6142ba3b2768faa0df513a5a15b492d94925f12aa8b03d063024be89d
  - artifact_id: CAP-003-component-design-home-ui
    artifact_version: 1
    content_revision: sha256:a59005fb2706a6cfb222bc7f543c29a1022db0a8bcb1b1c4bd4e6a45af46e7a9
  - artifact_id: CAP-003-component-design-ingestion-api
    artifact_version: 1
    content_revision: sha256:c6800ef2637c3e6010eae5b02d41d00e8bccefa9bbefb0cfe414ebd14632ebce
  - artifact_id: CAP-003-component-design-massive-client
    artifact_version: 1
    content_revision: sha256:1ee80d9e14b1e23f467a330ef0fe004680a37cf5bd6f341fc0485c8f31b35ee4
  - artifact_id: CAP-003-component-design-owner-shell
    artifact_version: 2
    content_revision: sha256:5f5981211166e3ce032005c08284ebac7ffa32004deff5b4f3f987af6435003f
  - artifact_id: CAP-003-component-design-owner-web-app
    artifact_version: 2
    content_revision: sha256:716c1f1105de912de5dd74d37648c9256337eccac3c3a793f1bd74ee29b90544
  - artifact_id: CAP-003-component-design-rate-limit-governor
    artifact_version: 1
    content_revision: sha256:d06d30fcce3b82df99ef1cbcc4a2c25e1778b26d02bf00285c5e17fff113f339
  - artifact_id: CAP-003-component-design-setup-ui
    artifact_version: 1
    content_revision: sha256:0760d1a9efd2c65959dc26125cdbc1cb28befd67c0e07d8ba8fdd811864be8e8
  - artifact_id: CAP-003-component-design-ui-components
    artifact_version: 2
    content_revision: sha256:02f64bfe7dac0b117b7d71bf2a881e1f5b3290470506cdf1fec6dabc3256bc89
statistics:
  total_findings: 34
  critical: 0
  high: 0
  medium: 14
  low: 20
pipeline_readiness: READY
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T00:43:00Z
  source_artifacts:
    - id: CAP-003
      version: "2 (0febf60)"
    - id: CAP-003-system-design
      version: "2 (c1bd393)"
    - id: CAP-003-ux-brief
      version: "2"
    - id: CAP-003-ux-design
      version: "2 (c8079a1)"
    - id: CAP-003-component-design-acquisition-runner
      version: "1 (839bb07)"
    - id: CAP-003-component-design-command-palette
      version: "1"
    - id: CAP-003-component-design-data-health-api
      version: "2"
    - id: CAP-003-component-design-data-health-reader
      version: "2"
    - id: CAP-003-component-design-data-health-ui
      version: "2"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-component-design-ingestion-api
      version: "1"
    - id: CAP-003-component-design-massive-client
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "2"
    - id: CAP-003-component-design-owner-web-app
      version: "2"
    - id: CAP-003-component-design-rate-limit-governor
      version: "1"
    - id: CAP-003-component-design-setup-ui
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "2"
    - id: CAP-003-specification-review
      version: "4 (a8d782f, READY, 34 findings; dispositions verified here, not a subject)"
    - id: STD-UI
      version: "6 (approved; governs, not a subject)"
    - id: tech-stack
      version: "7 (approved; governs, not a subject)"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Specification Review Report -- CAP-003

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-003 App Shell & Data Health |
| **Version** | v5 |
| **Specifications Reviewed** | Capability v2; system design v2 (`ui_facing: true`); UX brief v2; UX design v2; thirteen component designs. Four subjects changed since v4 (capability, system design, UX design, acquisition-runner); thirteen are digest-identical to v4. All at project-repo commit `c8079a1` |
| **Total Findings** | 34 (CRITICAL 0, HIGH 0, MEDIUM 14, LOW 20) |
| **Pipeline Readiness** | READY |
| **Lane** | standard, as the invoking run declared |

**What changed since v4.** Four commits, `0febf60` to `c8079a1`, record two
owner decisions on review v4 and align the designs with them:

- **FINDING-28.** The owner reworded AC-30 to "the download MUST still finish
  with its recorded outcome, never abandoned" (`0febf60`). System design
  open question 13 is closed (`c1bd393`). The acquisition-runner and the UX
  design now cite the new wording (`839bb07`, `c8079a1`).
- **FINDING-30.** The owner answered the verbatim-reason question as a
  separate follow-up, recorded as capability OQ-5. System design constraint
  17 (d) and the UX design's Error-clarity row now name it.
- **FINDING-31 (a).** The acquisition-runner's persistent-`429` row now
  expects AAPL's fundamentals to be refused as `[not_entitled]`.

**Verdict.** The change is small and mostly correct, so the verdict stays
**READY**.

- **FINDING-28 is resolved.** No design text still requires *partial* when
  nothing was stored. AC-30 is now consistent with the delivered outcome rule
  that every design and test already used.
- **FINDING-31 (a) and FINDING-34's count are resolved.**
- **FINDING-30 is changed, not resolved, and stays MEDIUM.** OQ-5 now states
  that the verbatim reason reaches the owner "against STD-UI-1". Yet
  capability 5.4 still marks STD-UI-1 `yes` and AC-19 is unchanged. The UX
  brief's conformance and Error-clarity rows, and the system design's §1 and
  constraint 3, still claim conformance. STD-UI §1.1 and §4 also do not allow
  a capability-local exception. The capability therefore records a
  non-conformance and claims conformance at the same time. The "separate
  follow-up" has no home in any artifact.

**New: 1 LOW.** FINDING-37: the UX design's provenance timestamp is later
than the commit that contains it.

**Totals.** FINDING-35 and FINDING-36 have changed in scope. Every other v4
finding is carried with the same text and severity. That gives 34 findings:
one resolved, one new.

## Review Scope

All four specification types exist. Read at project-repo commit `c8079a1` on
`usr/alvaro-de-jodra/CAP-003-design-provider-refusals` (clean tree, the
project repository under this harness worktree):

- **Changed subjects, read in full:** the capability, the system design and
  the acquisition-runner component design.
- **UX design, read where it changed plus every region a finding cites.**
  That covers the frontmatter, the Design Source, 0 and 0.3, 1.4's
  *Needs fixing*, 1.8 with its fix by cause and interaction flow, the EDG
  checklist, Section 5 traceability, §6 sources and §7 open questions.
  `git diff a8d782f..HEAD` shows the file changed only in three hunks of
  equal line count. Everything else is byte-identical to the revision v4 read
  in full.
- **The thirteen digest-identical subjects.** `artifact-gate.py revision`
  returns v4's digests for all thirteen (UX brief, massive-client,
  rate-limit-governor, data-health-api, data-health-reader, data-health-ui,
  owner-shell, owner-web-app, ui-components, command-palette, home-ui,
  ingestion-api, setup-ui). v4's assessment of them stands by identity. Each
  was re-read wherever the change touches what it describes:
  - data-health-ui §2.5, §7 and §14;
  - owner-web-app §2.3, §7 and §14;
  - rate-limit-governor §2.3, §2.4, §8 and §14;
  - massive-client §7 rows 1 to 4;
  - UX brief rows 221, 574, 645-646 and 716.
  Each finding v4 located in them was re-checked at its cited text.

**Re-review scope.** `$specification-review` defines no re-review scope
section. The convergence rules in `docs/delivery-lifecycle.md` and
`docs/pipeline-driver.md` govern adversarial review, not this gate. As the
invoking run directed, the current set was judged as a whole and every v4
finding was re-verified. v4's identifiers are kept, and the one new finding
is numbered FINDING-37.

**Not subjects.** `epics/` (7 epics, 51 stories, all `todo`) and `tests/` are
downstream. Neither references AC-29 or AC-30 yet.

**Read to verify claims.**

- Review v4, and v3's finding texts for the carried findings.
- STD-UI v6: §1.1 *Authority*, STD-UI-1, STD-UI-19 and §4 *Conformance*.
- `projects/factorflow-v2/decisions/` up to DEC-0396, searched for a record
  of the four owner answers.
- `git log` of the four commits, with UTC times and trailers.
- Branch reachability of `b69facd`, `90b4ff0` and the CAP-003 commits.

Nothing contacted the provider or the production stack, and no test suite
or reproduction was run. The change alters no behaviour that v4 reproduced:
the transport, the classifier and the budget are untouched.

**Run state.** The state engine reports `AWAITING-APPROVAL` (exit 1),
because 13 of the 17 subjects are `draft` with no approval block.
`design-next.py` names this review as the next step: "the specifications
changed after passing review v4". See the *Unattended-Run Record*.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | Capability sections 1 to 8 (30 ACs, OQ-1 to OQ-5). System design 1 to 10. Acquisition-runner: all fourteen template sections, with a four-sentence narrative before its diagram. UX design: the changed rows and their sections. FINDING-34 narrowed |
| SR-2 Correctness | applied | AC-30's new wording walked against the delivered outcome rule, and every design statement and test that cites it (FINDING-28 resolved). The acquisition-runner row 4 assertions re-derived from the fixture they cite (FINDING-31 (a) resolved). Carried: FINDING-5, -6, -7, -13, -23, -26, -29, -31 (b), -33 |
| SR-3 Consistency | applied | AC-30 wording traced through SD §3.6 note 4, §7, §8 Q13 and §10; AR §2.3, §7 and §14; RLG §8 criterion 6; UX design §5. OQ-5 traced against every STD-UI-1 conformance statement in the set. Changed: FINDING-30, -35. Carried: FINDING-8 to -11, -18, -21, -24 to -26, -32 |
| SR-4 Testability | applied | AC-30 as reworded. Observable: terminal state set by the outcome rule, never `abandoned`. Input: a rate limit persisting past the stock's budget. Boundary: the budget, unquantified in the capability and fixed at 300 s, configurable, in the designs. Measure: binary. Tested by AR §7 rows 4 and 5. Carried: FINDING-7, -23 |
| SR-5 Traceability | applied | All 30 ACs map in SD §7. UX design §5 maps the 29 interface-facing ACs, with AC-30's row updated. Commit citations resolved by hand. Changed: FINDING-36. New: FINDING-37. Carried: FINDING-16, -20, -22 |
| SR-6 Clarity | applied | Placeholder and vague-language scan of all 17 subjects: only the carried FINDING-12 markers. OQ-5's "a separate follow-up" names no artifact (part of FINDING-30). Carried: FINDING-12, -14, -17, -19, -25, -27, -34 |
| SR-7 Feasibility | applied | No dependency, interface or behaviour changed. v4's dependency and reproduction evidence holds by identity of the governing designs (massive-client and rate-limit-governor unchanged). No finding |
| SR-8 UX Completeness | applied | `design_system_available` true. The change edits one EDG row and one traceability row, and adds no element, component or token. Source mapping and design source present. The EDG Error-clarity row now discloses the verbatim reason but stays `pass`, unlike the brief's row (FINDING-30). Carried: FINDING-6, -11, -27 |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py`: no error, no warning. 5.1 to 5.3 unchanged and consistent with v2 scope. STD-UI-1: capability 5.4 `yes` against OQ-5 and STD-UI §1.1 and §4 (FINDING-30). Carried: FINDING-3, -4, -15, -23 |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passed with 88 interfaces and no drift. The change adds no component, interface or diagram box. No capability identifier is used as an actor in Sections 1 to 5. Carried: FINDING-9, -24 |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, PASSED, exit 0 | none |
| `build-architecture.py -p factorflow-v2` | run, PASSED, exit 0, no drift | none |
| `check-artifacts.py -p factorflow-v2 --strict` | run, PASSED with 481 project warnings. Scoped: capability PASSED, no warning; `design/` PASSED with 24 warnings, all upstream pins | FINDING-15 (tech-stack v6 pins in four unchanged designs), FINDING-35 (CAP-003 v1 pins in nine designs). The UX design's brief pin was refreshed, hence 24 rather than 25 |
| `check-references.py` | run, PASSED, exit 0 | none from the script, whose scope excludes `repos/`. By hand: `0febf60`, `c1bd393`, `839bb07`, `c8079a1` and `4efc4f6` resolve on the CAP-003 branch, and `b69facd` and `90b4ff0` resolve only from the local branch `usr/alvaro-de-jodra/CAP-001-design-provider-refusals` (FINDING-36) |
| `check-constitutions.py` | run, PASSED, exit 0 | none |

Also run, read-only:

- `scripts/check-prerequisites.sh --project factorflow-v2`: exit 0, every row
  PASSED, context 19 h old.
- `scripts/pipeline-state.py check --stage specification-review`:
  `AWAITING-APPROVAL`, exit 1.
- `scripts/design-next.py -p factorflow-v2 -c CAP-003`: review, "the
  specifications changed after passing review v4".
- `scripts/artifact-gate.py revision` for the 17 subjects (frontmatter
  `review_subjects`).

Design system resolved per `docs/design-system.md`:
`design_system_available = true`.

---

## Constitutions Applied

The relevance matrix assigns `specification-review` seven constitutions. All
seven were read at the versions in the frontmatter, the same versions as v4.

| Constitution | What it produced |
|--------------|------------------|
| CONST-AGT 2.3 | **AGT-AUTH-002:** the two new owner decisions are surfaced and answered in the capability (AC-30 text, OQ-5), but neither is a decision record. Commit `0febf60` names them in its body with no `Decision-Id` trailer (FINDING-36, widened). **AGT-SCOPE-002:** still satisfied. No CAP-001 path changed (`git diff a8d782f..HEAD` touches four CAP-003 files). **AGT-PROV-001:** the capability, system design and acquisition-runner stamp times before their commits. The UX design stamps 00:40:00Z, after its commit at 00:33:43Z (FINDING-37). **AGT-AUTH-001:** this review approves nothing |
| CONST-MDL 1.3 | **MDL-PIN-002 / MDL-PIN-003:** the four commits' trailers name Claude Opus 5.5, and each changed subject records `claude-opus-5-5`. This report records the same identifier |
| CONST-OPS 1.3 | **OPS-ERR-001, OPS-MIG-001, OPS-MIG-003:** unchanged since v4. No new path, schema or upgrade step. Constraint 17 (d)'s rollback note gains only the OQ-5 sentence |
| CONST-REV 1.4 | **REV-STG-001:** Stage 1 and Stage 2 below. **REV-AGT-001:** full bar. **REV-RCV-001:** each change's claim that it "already followed that reading" and that FINDING-31 (a) is fixed was checked against the text and the fixture. **REV-RCV-002:** one claim is challenged with evidence. The UX design's Error-clarity row stays `pass` while stating an exception to STD-UI-1, and STD-UI §1.1 and §4 do not permit that exception locally (FINDING-30) |
| CONST-SA 2.0 | **SA-MD-002:** the UX design's §6 source rows now contradict its own frontmatter (FINDING-35). Citations into the unpushed CAP-001 branch remain (FINDING-36). **SA-MD-003:** OQ-5's answer points at a follow-up no artifact holds (FINDING-30). The carried `[REQUIRES INPUT]` markers on answered questions remain (FINDING-12) |
| CONST-SEC 1.3 | **SEC-ERR-001 / SEC-DAT-001:** unchanged. Rendering the stored reason, with the provider `request_id`, to the loopback-only owner is a STD-UI-1 matter (FINDING-30), not an external error response |
| CONST-VER 1.2 | **VER-EVD-001 / VER-EVD-002:** every verdict rests on this session's reads, digests and script runs. **VER-EVD-004:** per-change verdicts in Stage 1 and per-AC verdicts in the Traceability Matrix. **VER-DEL-001:** the commit messages' claims (FINDING-31 fixed, question 13 closed) were verified against the text, not taken from the messages. **VER-CHK-001:** no suite was run, because the change is design text only |

### Stage 1 -- Specification Compliance of the Change

One verdict per changed statement. SD is the system design, AR the
acquisition-runner, UXD the UX design and UXB the UX brief.

| # | Change | Location | Check | Verdict |
|---|--------|----------|-------|---------|
| 1 | AC-30: "finish with its recorded outcome, never abandoned" | Capability line 349 | Agrees with `journal.py`'s rule as every design states it (SD §3.6 note 4, AR §2.3, RLG §8 criterion 6). Testable by AR §7 rows 4 and 5. Contradicts no other AC | PASS (FINDING-28 resolved) |
| 2 | OQ-5, answered as a separate follow-up | Capability lines 491-497 | States a STD-UI-1 breach on both failure screens. 5.4 (line 399), AC-19 (lines 303-305), UXB lines 574 and 716, SD §1 (lines 120-123) and constraint 3 (lines 920-924) still claim conformance. No artifact holds the follow-up | **FAIL** MEDIUM (FINDING-30, changed) |
| 3 | §8: 30 acceptance criteria | Capability line 503 | Matches §4 | PASS (FINDING-34 (a) resolved) |
| 4 | §3.6 note 4: finishes with its recorded outcome | SD lines 713-725 | Matches AC-30 and AR §2.3 | PASS |
| 5 | Constraint 17 (d): verbatim reason is capability OQ-5's follow-up | SD lines 1072-1077 | Accurate as a disclosure. Contradicts SD §1 "Domain terms stay in the API" and constraint 3 | PASS as written; inconsistency carried in FINDING-30 |
| 6 | §7 AC-30 row; §8 question 13 answered; §9 capability row; §10 at 80 | SD lines 1155, 1256-1268, 1303, 1326-1338 | Consistent with AC-30 and with each other. §10 lists only constraint 16 (c) as a pending choice of this design, which is accurate for the system design. The governor's permit-wait choice is that design's own (RLG question 3) | PASS |
| 7 | §2.3 closing sentence; §14 question 1 answered | AR lines 194-198, 341-344 | Matches AC-30 | PASS |
| 8 | §7 row 4 (d): AAPL fundamentals `failed` `[not_entitled]`, the rest `written` or `unchanged` | AR line 269 | Re-derived from the row-3 fixture the row cites (financials `403` with the entitlement body; reference `200`; other reads `200` empty). Assertion (e) `partial` still holds because AAPL stores its reference | PASS (FINDING-31 (a) resolved) |
| 9 | §7 row 5: `failed` is AC-30's recorded outcome | AR line 270 | Matches AC-30 | PASS |
| 10 | Provenance of the changed subjects | Capability line 24 (00:10:00Z, commit 00:30:03Z); SD line 20 (00:31:17Z, commit 00:32:21Z); AR line 17 (00:33:00Z, commit 00:33:30Z); UXD line 24 (00:40:00Z, commit 00:33:43Z) | AGT-PROV-001 production time | PASS for three; **FAIL** LOW for the UX design (FINDING-37) |
| 11 | UXD frontmatter pins: capability `0febf60`, SD `c1bd393`, brief v2 `4efc4f6` | UXD lines 25-31 | Correct, but §6 rows (lines 1557-1559) and the Design Source (line 61) still name `2e6bfeb, 3174b50`, `c33a8f1` and brief v1 `41ff183` | PASS for the pins; the internal mismatch is FINDING-35 (changed) |
| 12 | UXD EDG Error clarity: exception disclosed, status `pass` | UXD line 1497 | Discloses the breach. UXB line 574 still claims none reaches the owner, so the two disagree | Part of FINDING-30 |
| 13 | UXD §5 AC-30 row: outcome *Partial* or *Failed* shown unchanged | UXD line 1542 | Matches AC-30 and 1.7 and 1.8 | PASS |

### Stage 2 -- Artifact Quality

- **Contract.** All 17 subjects pass `check-artifacts.py --strict`. The four
  changed subjects keep their version (all `draft`, never approved at this
  version), so no version bump is due under AGT-PROV-001's
  approved-artifact rule.
- **Structure.** Template sections are intact, and no diagram changed.
- **Cross-references.** All resolve, apart from FINDING-35 and FINDING-36.
- **Placeholders.** None added. OQ-5's "a separate follow-up" is an
  unanchored reference (FINDING-30).
- **Internal consistency.** The UX design's frontmatter and §6 now disagree
  (FINDING-35). The system design's §1 and constraint 3 disagree with its
  constraint 17 (d) (FINDING-30).

### Review v4 Dispositions

| v4 finding | v4 severity | Disposition in the current text | Evidence |
|------------|-------------|---------------------------------|----------|
| v4 FINDING-3, -4 | MEDIUM | Carried, unchanged | Capability lines 323-333, 423, 427 unchanged |
| v4 FINDING-5 to -8 | MEDIUM | Carried, unchanged | The subjects concerned are digest-identical, and the UX design's changed lines do not touch them |
| v4 FINDING-9, -10 | MEDIUM | Carried, unchanged | SD 4.2 Shell context rows (lines 834-836) still lack `setTitleDetail`. 3.5 note 4 (lines 621-623) is unchanged. 4.1 (lines 781-784) and question 6 (lines 1197-1204) still map `/runs` to `/data/downloads` |
| v4 FINDING-11, -12 | MEDIUM | Carried, unchanged | UXB digest-identical. UXD lines 1583 and 1595 keep the wrapped markers |
| v4 FINDING-13 to -22 | LOW | Carried, unchanged | FINDING-14 at capability line 277. FINDING-15 at capability line 361 and the v6 pins. FINDING-16 at SD line 1322. FINDING-17 at SD lines 299, 384, 545, 548, 563. FINDING-20 narrowed as at v4. FINDING-22: DEC-0219 still `status: open` |
| v4 FINDING-23, -24 | MEDIUM | Carried, unchanged | SD 3.3 note 6 and 3.2 note 1 unchanged. `SetupDraftProvider` still absent from SD |
| v4 FINDING-25 to -27 | LOW | Carried, unchanged | Capability lines 167-169 unchanged |
| v4 **FINDING-28** | MEDIUM | **Resolved** | AC-30 reworded (`0febf60`). SD note 4, §7, question 13 and §10, AR §2.3, §7 row 5 and §14, and UXD §5 align. RLG §8 criterion 6 already said "finalised by the outcome rule". No subject still says "finish as partial" except question 13's heading, kept as the question's history. v4's attribution point is moot: the answer and note 4 name the delivered outcome rule |
| v4 FINDING-29 | MEDIUM | Carried, unchanged | UXD lines 839-846, UXB line 221, DHU line 222 and test line 391 still render *{reason}, {attempts} attempts* for ordinary failures. OQ-5's follow-up covers how the reason is shown, not the attempt suffix |
| v4 **FINDING-30** | MEDIUM | **Changed**, MEDIUM | The owner chose a separate follow-up (OQ-5). The display question is answered. What remains is the conformance record, the standard's change control and the follow-up's home. See the new text below |
| v4 **FINDING-31** | LOW | **Narrowed** to (b) | (a) fixed in AR line 269 (`839bb07`). (b) MC §7 row 1 (line 475) still does not state its jitter |
| v4 FINDING-32, -33 | LOW | Carried, unchanged | SD §3.6 sequence (lines 653-675) and RLG lines 245-247 unchanged |
| v4 **FINDING-34** | LOW | **Narrowed** to flow 2 | §8 now says 30. Flow 2 (lines 171-195) still has no step for a plan refusal |
| v4 **FINDING-35** | LOW | **Changed** | The UX design's brief pin is refreshed. Its §6 rows and Design Source still name the old revisions, and now disagree with its frontmatter. The other pins and rows and OWA question 4 are as at v4 |
| v4 **FINDING-36** | LOW | **Widened** | Adds the two 2026-11-07 owner answers (FINDING-28, FINDING-30), which are capability prose only. `0febf60` has no `Decision-Id` trailer. No record under `projects/factorflow-v2/decisions/` (to DEC-0396). `b69facd` and `90b4ff0` still local only |

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; assessed against the system
design.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` reported no error and no warning. 5.1 to 5.3 are
unchanged and agree with the v2 scope. There is no `blocked-by` row.

The STD-UI conformance table (5.4) is unchanged. Its STD-UI-1 row now
contradicts the capability's own OQ-5 (FINDING-30). FINDING-3, -4 and -15
are carried.

#### Completeness (SR-1)

- **FINDING-34** (LOW, narrowed). Flow 2 has no step for a plan refusal.

#### Correctness (SR-2)

- FINDING-28 is resolved.
- **FINDING-30** (MEDIUM, changed). OQ-5 records a STD-UI-1 breach that 5.4
  and AC-19 deny.
- FINDING-14 is carried.

#### Testability (SR-4)

AC-30 as reworded is testable.

- **Observable outcome:** the download reaches a terminal state set by the
  outcome rule, and is never reclaimed as `abandoned`.
- **Concrete input:** a rate limit that persists past one stock's budget.
- **Boundary:** the budget. It is unquantified in the capability and fixed
  at 300 s, configurable, in the designs, as at v4.

AC-19 is no longer satisfiable on *Needs fixing* and the download detail
while OQ-5's deferral stands (FINDING-30).

#### Clarity (SR-6)

- OQ-5's answer, "a separate follow-up", names no capability, backlog item or
  record (part of FINDING-30).
- FINDING-14 and FINDING-25 are carried.

### System Design Specification

The change closes open question 13, rewords §3.6 note 4 and the AC-30
traceability row, adds the OQ-5 sentence to constraint 17 (d) and refreshes
§9 and §10. Every changed statement agrees with AC-30.

- **FINDING-30** (MEDIUM, changed). Constraint 17 (d) now says the stored
  reason is shown verbatim. §1 (lines 120-123, "every sentence the owner
  reads is composed in the interface in the display vocabulary") and
  constraint 3 (lines 920-924) still say it is not.
- **FINDING-36** (LOW, widened). Open question 16 still lists only the v14
  answers as not yet decision records. The two new answers are also prose
  only.
- Carried: FINDING-9, -10, -16, -17, -23, -24, -32, -33.

### Component Design Specifications

**acquisition-runner (changed).** §2.3, §7 rows 4 and 5 and §14 question 1
follow the new AC-30. Row 4's assertion (d) now matches its fixture. The
narrative before the one diagram runs four sentences, and every behaviour has
an owner. Provenance pins `0febf60` and `c1bd393`.

- No new finding. FINDING-31 (a) is resolved.

**massive-client, rate-limit-governor (unchanged).**

- FINDING-31 (b) and FINDING-33 are carried.
- RLG §14 question 3 (the permit-wait charge) still asks the owner "at
  specification review" and is listed below.

**data-health-reader, data-health-api, data-health-ui, ui-components,
owner-shell, owner-web-app (unchanged).** These still render the stored
reason verbatim (DHU §2.5 line 222; OWA §2.3 line 262 "the reason sentence
itself … unchanged"). Their tests expect it (OWA line 384). None mentions
OQ-5.

- **FINDING-30** (MEDIUM, changed).
- FINDING-29 and FINDING-35 are carried.
- Carried from v3: FINDING-5 to -8, -13, -18 to -23, -26, -27.

**command-palette, home-ui, ingestion-api, setup-ui (unchanged, approved).**
v3's and v4's assessment stands by identity. Their stale-upstream gate
errors clear once the v2 upstreams are approved.

### UX Brief

Unchanged (digest-identical to v4).

- **FINDING-30** (MEDIUM, changed). The Error-clarity row (line 574) still
  says no `request_id` reaches the owner. The STD-UI-1 row (line 716) is
  still `yes`, "Capability §5.4: `yes`, agrees". The UX design's
  Error-clarity row now says otherwise.
- **FINDING-29** (MEDIUM) and **FINDING-35** (LOW) are carried.
- Carried: FINDING-11, -12, -15, -16.

### UX Design Specification

The change refreshes the frontmatter pins and AC-30's traceability row. It
also adds the OQ-5 exception to the Error-clarity row. The design system
still covers every element, so there is no COMPONENT-SPEC-GAP.

- **FINDING-30** (MEDIUM, changed).
  - The Error-clarity row stays `pass` with a stated STD-UI-1 exception.
  - The vocabulary statements at lines 103-105 and 281-283 still say every
    string uses the display labels.
  - The 1.8 example *Downloading daily prices for KO failed: the provider
    timed out 3 times.* (lines 1270-1272) is not what the screen renders. It
    renders the stored `[unavailable] symbol=KO data_type=prices
    request_id=…: …` text.
- **FINDING-35** (LOW, changed). The frontmatter pins the brief at v2
  `4efc4f6`, capability `0febf60` and SD `c1bd393`. The Design Source
  (line 61) and §6 (lines 1557-1559) still say brief v1 `41ff183`,
  capability `2e6bfeb, 3174b50` and SD `c33a8f1`. §6's capability row also
  says "OQ-1 to OQ-4 carried", while line 1497 cites OQ-5.
- **FINDING-37** (LOW, new). The provenance timestamp postdates its commit.
- Carried: FINDING-4 to -9, -12, -13, -18, -19, -21, -23 to -27, -29.

### Cross-Specification Consistency (SR-3)

**Consistent across all subjects:**

- AC-30's outcome: *partial* when anything was stored, *failed* when nothing
  was, never `abandoned`. This holds in the capability, SD §3.6 note 4 and
  §7, AR §2.3 and §7, RLG §8 and UXD §5.
- Everything v4 listed as consistent: the six kinds, `cause` and
  `retryable`, the two fix texts, the error types, `start_instrument()`
  placement and the upgrade facts. None of it changed.

**Mismatches, each a `CROSS-SPEC-INCONSISTENCY`:**

- FINDING-30: capability OQ-5, SD constraint 17 (d) and the UXD
  Error-clarity row, against capability 5.4 and AC-19, UXB lines 574 and
  716, SD §1 and constraint 3, and UXD lines 103-105 and 281-283.
- FINDING-35: UXD frontmatter against UXD §6 and Design Source.
- FINDING-32 (carried).
- FINDING-8, -10, -11, -18, -21, -24, -25, -26 (carried).

### Screen Specification Acceptance Checks

The change touches no screen check. The verdicts are as v4 recorded them.
S09-2 and S09-3 are met with FINDING-29 and FINDING-30: the reason line
carries machine tokens by the owner's deferral (OQ-5), and ordinary failures
show an attempt count the writer never records.

---

## Findings Summary Table

CRITICAL 0 · HIGH 0 · MEDIUM 14 · LOW 20 · **total 34**.

By origin:

- **New:** 1 LOW.
- **Changed:** 3. FINDING-30 is MEDIUM; FINDING-35 and FINDING-36 are LOW.
- **Narrowed:** 2 LOW (FINDING-31, -34).
- **Carried unchanged:** 28 (13 MEDIUM, 15 LOW).
- **Resolved:** 1 MEDIUM (FINDING-28).

New or changed:

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-30 | MEDIUM | SR-9, SR-3, SR-6 | Capability; system design; UX brief; UX design; data-health-ui; owner-web-app | `Capability-CAP-003.md` lines 491-497 (OQ-5: verbatim reason "against STD-UI-1", "Answered … a separate follow-up") against line 399 (5.4 STD-UI-1 `yes`, satisfied by AC-19) and lines 303-305 (AC-19). `system-design.md` lines 1075-1077 (17 (d)) against lines 120-123 (§1) and 920-924 (constraint 3). `ux-brief.md` line 574 (Error clarity: no `request_id` reaches the owner) and line 716 (STD-UI-1 `yes`, "agrees" with 5.4). `ux-design.md` line 1497 (stated exception, still `pass`), lines 103-105, 281-283 and 1270-1272. `component-design-data-health-ui.md` line 222. `component-design-owner-web-app.md` lines 262, 384. `docs/constitution/standards/ui-conventions.md` §1.1 (lines 66-69) and §4 (lines 604-620) | **Changed.** The owner chose to leave the verbatim reason for a separate follow-up. That settles what is rendered. The record still says three incompatible things. (1) OQ-5 and constraint 17 (d) say the owner reads `[not_entitled] … request_id=…`, against STD-UI-1. (2) 5.4, AC-19, the brief's §11 and EDG rows, SD §1 and constraint 3, and the UX design's vocabulary statements say every string conforms. (3) STD-UI §1.1 says a capability "may never be looser", and that "the fix is an amendment to the rule, not a local exception". §4 says a looser capability "does not conform … not a waiver". The deferral is therefore a local exception the standard does not provide for. "A separate follow-up" names no capability, backlog item or decision record, so nothing ensures it is done | 5.1 makes specification review confirm each `yes` in 5.4, and the `yes` for STD-UI-1 cannot be confirmed. A test traced to AC-19, or an implementation review applying STD-UI-1's verification ("no generic or implementation word"), fails on *Needs fixing* and the download detail. The follow-up can be lost | Owner chooses one (no decision is taken here). (a) Bring the readable-segment rendering into CAP-003 now: show only the text after the kind and fields, which v4 costed as small. (b) Amend STD-UI-1 through `$constitution` to admit the stored reason until a named date or capability. (c) Keep the deferral and record it truthfully: mark 5.4 STD-UI-1 as not met on the two failure screens, citing OQ-5; carve AC-19 accordingly; align UXB lines 574 and 716, SD §1 and constraint 3, the UXD vocabulary lines and EDG row status. Under (c), give the follow-up a home (a capability, a backlog entry, or a decision record via `scripts/sdd decisions`) and accept that CAP-003 is recorded as non-conformant to STD-UI-1 until it lands. Under any option, replace the 1.8 example with the text the screen actually shows |
| FINDING-35 | LOW | SR-3, SR-5, SR-6 | UX design; UX brief; data-health-reader; data-health-ui; owner-shell; owner-web-app; ui-components | `ux-design.md` lines 25-31 (frontmatter: capability `0febf60`, SD `c1bd393`, brief `2, draft (4efc4f6)`) against line 61 (Design Source: UX brief v1, `41ff183`) and lines 1557-1559 (§6: brief v1 `41ff183`, capability `2e6bfeb, 3174b50` "OQ-1 to OQ-4 carried", SD `c33a8f1`). As v4: frontmatter pins `"1"` in DHR line 24, DHU line 26, owner-shell lines 26 and 28, OWA lines 24 and 26, UIC line 24. Source rows in owner-shell line 672, OWA line 504, UIC line 687. `ux-brief.md` lines 645-646. OWA question 4 (lines 547-549) still open | **Changed.** `c8079a1` refreshed the UX design's frontmatter but not its prose sources, so the file now cites two different revisions of each of its three upstreams. The remainder is as v4 | Traceability points at superseded inputs, and a reader cannot tell which revision the UX design was checked against | Refresh line 61 and §6 to the frontmatter's revisions and add OQ-5 to §6's capability row. Refresh the other pins and rows and close OWA question 4, as v4 recommended |
| FINDING-36 | LOW | SR-5, SR-9 | Capability; system design; the three change designs | `Capability-CAP-003.md` line 349 (AC-30 reworded) and lines 491-497 (OQ-5), commit `0febf60` (body "Owner decisions 2026-11-07 on specification review v4 FINDING-28 and FINDING-30", no `Decision-Id` trailer). `system-design.md` lines 1287-1297 (question 16), 1023-1034 (constraint 16 (c)). `component-design-rate-limit-governor.md` lines 205-232 and §14 question 3. Citations of `b69facd` and `90b4ff0` in MC lines 559-560, RLG line 388, AR line 326, SD line 1318 | **Widened.** v4 found the answers to CAP-001 v14 FINDING-55 and FINDING-56 recorded only in prose. The answers to v4 FINDING-28 and FINDING-30 are now the same. `projects/factorflow-v2/decisions/` (through DEC-0396) holds none of the four. Constraint 16 (c) and the permit-wait charge are still unconfirmed agent choices. `b69facd` and `90b4ff0` remain reachable only from the unpushed local CAP-001 branch | AGT-AUTH-002's verification expects decision records. `sdd decisions` and blind review cannot see the four answers or the two choices. Deleting the branch loses cited evidence (SA-MD-002) | Owner: record the four answers, and uphold or revert constraint 16 (c) and the permit-wait charge, through `scripts/sdd decisions`. Keep `b69facd` reachable or cite review v4's Supplementary Evidence instead |
| FINDING-37 | LOW | SR-5 | UX design | `ux-design.md` line 24 (`timestamp: 2026-11-08T00:40:00Z`) against commit `c8079a1` at 2026-11-08T00:33:43Z, which contains that line | **New.** The production timestamp is 6 min 17 s after the commit that records the content. The other three changed subjects stamp before their commits. Same class as FINDING-20 | The audit trail asserts a production time that cannot be true (AGT-PROV-001) | Restamp at or before the commit time in the next revision of the UX design |

Carried (one line each; full text in v4 or v3; current locations where the
text moved):

| ID | Severity | Dimension | Specification | Location (current) | Status |
|----|----------|-----------|---------------|--------------------|--------|
| FINDING-3 | MEDIUM | SR-9, SR-2 | Capability; UX brief; system design; owner-shell | Capability lines 323-325, 423; SD lines 454-457, 963-971 | Carried: rail chips show no time; STD-UI-25 permits varying cadence, not omitting the time |
| FINDING-4 | MEDIUM | SR-9 | Capability; system design; UX brief; UX design; owner-shell; setup-ui; ui-components | Capability lines 326-333, 427; SD lines 986-997 | Carried: `layout.ts` literals against STD-UI-29; 70ch beside 75ch |
| FINDING-5 | MEDIUM | SR-2, SR-6 | UX design; data-health-ui; ui-components; UX brief | as v3 | Carried: *needs attention* means two populations |
| FINDING-6 | MEDIUM | SR-2, SR-8 | UX design; UX brief; data-health-ui; system design | as v3 | Carried: **Start the first download** offered while it runs |
| FINDING-7 | MEDIUM | SR-4, SR-2 | data-health-ui; UX design | DHU line 385 | Carried: verdict failure states and the *Can't tell yet* test |
| FINDING-8 | MEDIUM | SR-3 | UX design; UX brief; data-health-ui | DHU line 482 | Carried: null checks not determinable against `Absent` |
| FINDING-9 | MEDIUM | SR-10, SR-3 | System design; UX design; UX brief | SD lines 621-623, 834-836 | Carried: no `setTitleDetail` row in 4.2 |
| FINDING-10 | MEDIUM | SR-3 | System design; owner-web-app | SD lines 781-784, 1197-1204 | Carried: `/runs` to `/data/downloads` against `/data` |
| FINDING-11 | MEDIUM | SR-3, SR-9 | UX brief | as v3 | Carried: gaps-only STD-UI-18 note |
| FINDING-12 | MEDIUM | SR-6, SR-3 | UX brief; UX design; several component designs | UXB lines 440, 596, 608; UXD lines 1583, 1595 | Carried: answered questions still marked |
| FINDING-13 | LOW | SR-2 | UX design; data-health-ui | as v3 | Carried: *Not reflecting the latest download* unreachable on the card |
| FINDING-14 | LOW | SR-6 | Capability | Capability lines 277-278 | Carried: "No screen MUST present" |
| FINDING-15 | LOW | SR-9 | Capability; UX brief; data-health-reader; four unchanged designs | Capability line 361 (v2); UXB line 657; DHR line 644; v6 pins | Carried as narrowed at v4 |
| FINDING-16 | LOW | SR-5, SR-6 | System design; UX brief | SD line 1322; UXB line 659 | Carried: DEC numbers (0188) to (0196) |
| FINDING-17 | LOW | SR-6 | System design | SD lines 299, 384, 545, 548, 563 | Carried: step numbers off by one or more |
| FINDING-18 | LOW | SR-3 | UX brief; UX design; several component designs | as v3 | Carried |
| FINDING-19 | LOW | SR-6 | UX design; command-palette; home-ui | as v3 | Carried: unsourced 250 ms debounce and per-minute recomputation |
| FINDING-20 | LOW | SR-5 | command-palette; ingestion-api; setup-ui; home-ui | as v3 for these four | Carried as narrowed at v4 (FINDING-37 is a new instance in a changed subject) |
| FINDING-21 | LOW | SR-3 | UX design; UX brief; data-health-ui; system design; ui-components | as v3 | Carried |
| FINDING-22 | LOW | SR-5 | System design; home-ui; owner-shell; data-health-api; DEC-0219 | as v3 | Carried: DEC-0219 still open and unreviewed |
| FINDING-23 | MEDIUM | SR-2, SR-9 | System design; UX brief; UX design; ui-components; home-ui; data-health-ui; data-health-reader | SD lines 458-473, 942-947; as v3 | Carried: a cancelled first download answers *Yes* |
| FINDING-24 | MEDIUM | SR-10, SR-3 | System design; UX brief; UX design; setup-ui; owner-shell | SD lines 372-378; `SetupDraftProvider` absent | Carried |
| FINDING-25 | LOW | SR-6, SR-3 | Capability; UX brief; UX design; setup-ui | Capability lines 167-169 | Carried: flow 1 step 7 against AC-2 |
| FINDING-26 | LOW | SR-3, SR-2 | UX design; system design; UX brief; home-ui | SD line 420, 468-471; as v3 | Carried |
| FINDING-27 | LOW | SR-8, SR-6 | setup-ui; UX design; UX brief | as v3 | Carried: "disabled" against `blocked`; *n* = 0 copy |
| FINDING-29 | MEDIUM | SR-2, SR-3 | UX design; UX brief; data-health-ui | UXD lines 839-846; UXB line 221; DHU lines 221-223, 241-248, 389, 391 | Carried: *, {attempts} attempts* on ordinary failures, the count never recorded |
| FINDING-31 | LOW | SR-4 | massive-client | MC line 475 | Narrowed to (b): row 1's jitter unstated |
| FINDING-32 | LOW | SR-3 | System design | SD lines 653-674 | Carried: §3.6 sequence writes per data type, in the wrong order, governor returning `ProviderNotEntitled` |
| FINDING-33 | LOW | SR-2, SR-6 | rate-limit-governor; system design | RLG lines 245-247; SD line 675 | Carried: "raises at once" under redrawn jitter |
| FINDING-34 | LOW | SR-1, SR-6 | Capability | Capability lines 171-195 | Narrowed: flow 2 has no plan-refusal step |

Resolved: **FINDING-28** (MEDIUM), by `0febf60` and its alignment commits.

---

## Traceability Matrix

Per-requirement verdicts (VER-EVD-004). "Traced" means the AC maps to a
system design element, to a UX design element where it is interface-facing,
and to a component design element, and that a component test proves it. The
change touches only AC-19's verdict (through OQ-5) and AC-30's.

| AC | System design | UX design | Component design(s) | Verdict |
|----|---------------|-----------|---------------------|---------|
| AC-1 to AC-12 | as v4 | as v4 | as v4 | Traced, with v3's findings (FINDING-5, -7, -14, -23 to -27) |
| AC-13 | 3.4, 3.4 note 9, 3.6 note 7 | 1.4; 1.8 *Fix by cause* | DHR 2.4; DHA 2.4; DHU 2.5; UIC 2.7a; OWA 2.3 | Traced, with FINDING-29, FINDING-30 |
| AC-14 to AC-18 | as v4 | as v4 | as v4 | Traced, with FINDING-6, -10 |
| AC-19 | 5.3 | 0 vocabulary; 1.5 to 1.9 labels | UIC `labelOf`; OWA 2.2 | Traced for labels. **Not met** for the stored reason on *Needs fixing* and the download detail while OQ-5's deferral stands (FINDING-30) |
| AC-20 to AC-28 | as v4 | as v4 | as v4 | Traced, with v3's findings (FINDING-3, -4, -8, -9, -13, -23, -24, -27) |
| AC-29 | 1; 3.4 note 9; 3.6 notes 1, 5 to 7; 4.1; 4.2; 5.16 (a), (d) | 1.4; 1.8 | MC 2.3 to 2.5; AR 2.3; DHR 2.4; DHA 2.4; owner-shell 2.3; UIC 2.7a; DHU 2.5; OWA 2.3 | Traced (v4's reproduction stands). The reason line carries FINDING-30 |
| AC-30 | 1; 3.6 notes 2 to 5; 4.1; 4.2; 5.16 (b), (e); 5.17; §7 row as reworded | 1.4; 1.8; §5 row as reworded | MC 2.3, 2.5, 2.6; RLG 2.2 to 2.4, §8 criterion 6; AR 2.2, 2.3, §7 rows 4 and 5 | **Traced** (FINDING-28 resolved), with FINDING-31 (b), FINDING-33 |

---

## Pipeline Readiness Assessment

**Verdict:** READY

There is no CRITICAL and no HIGH finding, which is the rubric's definition of
READY. In the declared standard lane this clears the specification gate.

**FINDING-28 is closed.** That was the one v4 finding that made an approved
criterion fail by design. AC-30 and the designs now say the same thing, and
the tests encode it.

**FINDING-30 is the finding to settle before stories E6 and E7 are
regenerated, or test design traces AC-19.** The owner's deferral is a
legitimate product choice. As recorded, though, it leaves a `yes` the review
cannot confirm and a criterion the design does not meet. It is also a form of
exception that STD-UI's own change control rules out. Options (a) to (c) are
each small. The choice is the owner's.

**This verdict approves nothing.** Thirteen subjects are `draft` with no
approval block, and stay blocked from epic generation and test design until
the owner approves each revision with `scripts/artifact-gate.py approve`,
using this report as `--review-artifact`:

- the capability v2, system design v2, UX brief v2 and UX design v2;
- data-health-api, data-health-reader, data-health-ui, owner-shell,
  owner-web-app and ui-components (each v2);
- massive-client, rate-limit-governor and acquisition-runner (each v1).

The four approved designs (command-palette, home-ui, ingestion-api,
setup-ui) are covered here at their approved revisions. Their stale-upstream
gate errors clear once the v2 upstreams are approved.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

None.

### Should Fix (MEDIUM findings)

1. **FINDING-30.** Choose (a), (b) or (c) and align the conformance record.
   Give the follow-up a home if it stays a follow-up.
2. **FINDING-29.** Drop *, {attempts} attempts* for every cause, or bring
   recording the count into scope. No owner decision is needed for the
   first option.
3. **FINDING-23** and **FINDING-24**: before test design and before the
   setup and shell stories respectively.
4. **FINDING-3** to **FINDING-12.** FINDING-3 and FINDING-4 need an owner
   choice at the standard.

### Nice to Have (LOW findings)

5. **FINDING-35** and **FINDING-37**: fold them into the next UX design
   revision.
6. **FINDING-36**: record the four answers and the two choices.
7. **FINDING-31 (b)**, **-32**, **-33** and **-34**, and **FINDING-13** to
   **-22** and **-25** to **-27**.

---

## Open Questions for the Owner

Recorded instead of asked: the run is delegated and has no interactive tool.
None is a decision this review took.

1. **FINDING-30.** With the verbatim reason deferred, which record do you
   want?
   - (a) Fix the display in CAP-003 now.
   - (b) Amend STD-UI-1.
   - (c) Mark STD-UI-1 not met on the two failure screens, and name where the
     follow-up lives.
2. **FINDING-36.** Record the answers to CAP-001 v14 FINDING-55 and -56 and
   to v4 FINDING-28 and -30 as decision records. Uphold or revert constraint
   16 (c) (system design question 12) and the permit-wait charge
   (rate-limit-governor question 3).
3. **Carried design questions:**
   - system design questions 14, 15 and 16;
   - owner-web-app question 3 (the summary card's re-run when every failure
     is a plan refusal).
4. **Carried from v3:**
   - FINDING-3 and FINDING-4, at the standard;
   - FINDING-23's never-acquired signal;
   - FINDING-5's wording;
   - DEC-0219 (FINDING-22).

## Observations Outside the Review Subjects

Not findings against the specifications.

- **The CAP-003 branch is unpushed.** `a8d782f` to `c8079a1` are reachable
  from no remote ref, so review v4 and this report exist only locally until
  the branch is pushed.
- **Downstream artifacts.** The backlog, the 7 epics, the 51 stories and the
  test specifications still pin the CAP-003 v1 designs, and none references
  AC-29 or AC-30. That is bookkeeping for `$epic-generation` and
  `$story-generation` once the v2 set is approved.
- **v4's remaining observations stand.** These are the CAP-001 TC-INT-025
  false green, the non-locking per-data-type write path, and a plan without
  financials making every followed stock a permanent problem.

## Unattended-Run Record

- **Mode.** Delegated by a parent agent, with no interactive input tool. The
  parent directed the following:
  - skip the Step 6 discussion prompt;
  - use the project repository under the harness worktree;
  - create or switch no branch, and commit or push nothing;
  - contact neither the provider nor production.
- **Decided, not asked, as run conditions:**
  1. **Proceeding past `AWAITING-APPROVAL`.** The state engine reports it
     because 13 subjects carry no approval. `design-next.py` names this
     review as the next step, and v3 and v4 proceeded the same way.
  2. **Scope.** The four changed subjects were read (three in full, the UX
     design where it changed and where findings point). The thirteen
     digest-identical subjects were assessed by identity against v4, which
     read them in full, and re-read where the change touches them. The skill
     has no re-review scope section; this follows v4's precedent and the
     parent's instruction.
  3. **Numbering.** v4's identifiers are kept. The one new finding is
     FINDING-37. A finding whose substance moved keeps its identifier and is
     marked changed, narrowed or widened.
  4. **No reproduction.** The change alters no transport, classifier or
     budget behaviour, so v4's reproduction stands.
- **Severity judgements under the rubric:**
  - **FINDING-30 stays MEDIUM, not HIGH or CRITICAL.** The capability does
    not claim a specialization or relaxation of STD-UI-1; it claims
    conformance and separately records the owner's deferral. The rubric's
    CRITICAL case (relaxing a stricter-only rule, or specializing a `none`
    rule) is therefore not the case here. The breach is visible to every
    reader through OQ-5. It blocks no downstream phase, and the cost is a
    test or implementation review failing on a known string. It stays
    MEDIUM rather than LOW because the record now contradicts itself on an
    approved standard, and the standard's own change control rules out the
    form the decision took.
  - **FINDING-37 is LOW**, the same class as FINDING-20.
- **Abstentions:** none. Every owner question is listed, not answered.
- **Writes:** this report only. No specification, approval block, decision
  record, branch, commit, cache or log was touched.
