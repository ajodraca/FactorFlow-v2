---
artifact_schema_version: 1
artifact_id: CAP-003-specification-review
artifact_type: specification-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-25
updated: 2026-10-25
document: spec-review-report
capability: CAP-003
version: v2
generated: 2026-10-26T02:10:00Z
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
    result: "PASSED, exit 0: 3 designs, 27 components, 84 interfaces, no drift against docs/architecture.md; its one recorded interface finding (GET /api/classifications/summary consumer 'shell-home-and-data-health-ui (unpublished)') is declared by CAP-002; the inventory, derived from Section 4.2, lacks the Shell context interface owner-web-app consumes under DEC-0214 (FINDING-9)"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 260 warnings, exit 0 (--strict, whole project, 420 artifacts); none on CAP-003; scoped with -a to the CAP-003 directory: 15 artifacts, PASSED, no warning"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0: 1234 path references across 442 Markdown files; its scope excludes repos/, so the paths the CAP-003 artifacts cite were resolved by hand"
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
  SR-8: "applied — design_system_available true; 15 component specs and every variant named, and 54 theme token names, verified against design-system/; S01-3 to S01-7, S02-1 to S02-6 and S09-1 to S09-5 assessed"
  SR-9: "applied — dependency half and STD-UI conformance half by check-capabilities.py; capability section 5.4 against UX brief section 12.1 (STD-UI v6) rule by rule, including each declared specialization against the rule's posture; tech-stack v6 content and approval state (artifact-gate.py check); CONST-SEC 1.3 SEC-ENC-001 bookkeeping"
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
    content_revision: sha256:52cd12cd9b606e6691d9ba1617949d778a1e7431d646c157c0b393a016d8a3f8
  - artifact_id: CAP-003-system-design
    artifact_version: 1
    content_revision: sha256:f7923c08087d91aca1c8264e005a2d0640af760e7cef9e927eda2a8562899cae
  - artifact_id: CAP-003-ux-brief
    artifact_version: 1
    content_revision: sha256:cf8ba368e31b7fac1edb9772724b8603b7cf65ed05263ec1abce2c40f3304b26
  - artifact_id: CAP-003-ux-design
    artifact_version: 1
    content_revision: sha256:c7ba2e3c4dc6f22ea795a0caa8359134bc081c3325f4a9cdb2f216e6f6b3ff78
  - artifact_id: CAP-003-component-design-command-palette
    artifact_version: 1
    content_revision: sha256:5f90690b3b633cc184c794aafa890965b4fbaa656cd4962835a822875878f617
  - artifact_id: CAP-003-component-design-data-health-api
    artifact_version: 1
    content_revision: sha256:9d33b8d79004e9ea4d147fdbf456cce4f174a2d684f8a324140c1a52f5dbdc3f
  - artifact_id: CAP-003-component-design-data-health-reader
    artifact_version: 1
    content_revision: sha256:c8ce9ff3632d077456ade077fe30937bda1c06f0b120a60f5f3401e77db9d7ab
  - artifact_id: CAP-003-component-design-data-health-ui
    artifact_version: 1
    content_revision: sha256:705f395885cac6d3174370cd0ff23e9fd921f3de1cfabe620c50622e8962ee15
  - artifact_id: CAP-003-component-design-home-ui
    artifact_version: 1
    content_revision: sha256:bea5f9d1f37550a590e6d68f28e48d9db882d37dd5e469cf56bdfde1ca0008f7
  - artifact_id: CAP-003-component-design-ingestion-api
    artifact_version: 1
    content_revision: sha256:c6800ef2637c3e6010eae5b02d41d00e8bccefa9bbefb0cfe414ebd14632ebce
  - artifact_id: CAP-003-component-design-owner-shell
    artifact_version: 1
    content_revision: sha256:6523ce0dcef9e5653dd9800dfb894e4576f2036e19d45aa1726556f4dcda7dc8
  - artifact_id: CAP-003-component-design-owner-web-app
    artifact_version: 1
    content_revision: sha256:600efed70d936386a6704d4e3b490ebc36aa782db1ad74577a3197b11cd5a396
  - artifact_id: CAP-003-component-design-setup-ui
    artifact_version: 1
    content_revision: sha256:ba4dcb8ff57fd798a6ebe307414aeb17b0735a9bb378ef37cfd60bb6758df663
  - artifact_id: CAP-003-component-design-ui-components
    artifact_version: 1
    content_revision: sha256:979634738c4a639c1f3ddf980c4221dfed1612db2c4b3a5f20df344516990033
statistics:
  total_findings: 22
  critical: 0
  high: 2
  medium: 10
  low: 10
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-26T02:10:00Z
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
    - id: CAP-003-specification-review
      version: "1 (READY-WITH-WARNINGS, 23 findings; dispositions verified here, not a subject)"
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
      version: "6 (owner-directed 2026-10-25; approval stale, re-approval pending; governs, not a subject)"
    - id: CAP-001-system-design
      version: "8 (approved; context)"
    - id: CAP-002-system-design
      version: "3 (approved; context)"
    - id: CAP-002-component-design-classification-ui
      version: "3 (approved; context)"
    - id: CAP-002-component-design-classification-api
      version: "3 (approved; context)"
    - id: DEC-0200 to DEC-0220
      version: "as of harness commit 9cf1a48 (owner verdicts on DEC-0200, 0202, 0203, 0205, 0206, 0207, 0210, 0211, 0213, 0214, 0216, 0217; the rest open)"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Specification Review Report -- CAP-003

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-003 App Shell & Data Health |
| **Version** | v2 |
| **Specifications Reviewed** | Capability v1; system design v1 (`ui_facing: true`); UX brief v1; UX design v1; ten component designs v1 (all draft), at project-repo commit 0b7c6fb |
| **Total Findings** | 22 (CRITICAL 0, HIGH 2, MEDIUM 10, LOW 10) |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

The owner's answers to review v1 hold where they were applied. Of v1's 23
findings, both HIGH and all 13 MEDIUM findings are resolved in the text the
owner directed them into: tech stack v6 records all ten packages with their
licences, the Daily prices card no longer asserts currency, the system design
carries decomposition's interface changes, AC-28 bounds the aggregate, the
verdict has its download input and a full-proportion answer, Home and Data
health count one population, the empty state no longer hides problem rows,
the `SHELL_ROUTES` and `as-of-line.tsx` seams have owners, and the SEC-ENC-001
bookkeeping is complete (the five designs that cite the phrase are exactly the
five DEC-0208 names). The eight LOW findings the owner deferred are still
present and are carried here as FINDING-13 to FINDING-20.

Two HIGH findings are new. **FINDING-1:** the owner upheld DEC-0202 with a
different setup rule (*Add later* continues to a blocked step 4; unsaved input
held above the `/setup` route for the session), recorded the amendment as
"to be amended by hand", and no artifact carries it: the system design, UX
brief, UX design and `setup-ui` still implement the agent's rejected rule
while citing DEC-0202, whose record says `status: applied`. This is the gap the
driver named; it is a finding. **FINDING-2:** once the first download is
requested and before any download has ended, Home's data tile answers *Yes*
(good) from an empty problem set, beside *No scores yet* on the tile and
*prices not downloaded yet* in the header. The owner's DEC-0210 amendment says never-acquired replaces
the badge with the empty state; the designs key Home's empty state on "no
download requested", so the clause is not carried, and the tile presents the
absence of a detected problem as evidence of correctness (STD-UI-18,
stricter-only).

The MEDIUM findings cluster in three places: two conformance claims rest on
specializations the standard does not grant (FINDING-3, STD-UI-25 for the rail
chips; FINDING-4, STD-UI-29 for the layout module); the revision was applied
unevenly across artifacts (FINDING-7 to FINDING-12, including a `SHELL_ROUTES`
target that the system design and `owner-web-app` map differently, DEC-0214's
`setTitleDetail` absent from the system design, and answered open questions
still carried with `[REQUIRES INPUT]` markers); and Data health's verdict and
empty state have two new boundary cases (FINDING-5, FINDING-6).

## Review Scope

All four specification types exist and were read in full at project-repo
commit 0b7c6fb on `usr/alvaro-de-jodra/CAP-003-design` (clean):
`Capability-CAP-003.md`, `design/system-design.md`, `design/ux-brief.md`,
`design/ux-design.md` and the ten `design/component-design-*.md` files
(command-palette, data-health-api, data-health-reader, data-health-ui,
home-ui, ingestion-api, owner-shell, owner-web-app, setup-ui, ui-components).
`epics/` and `stories/` do not exist. Review v1
(`specifications-review-report-v1.md`) and the diffs of commits 9ac4a45 and
0b7c6fb against v1's base (7d72501) were read to verify each v1 finding's
disposition against the current text, not against the commit messages.

Read to verify claims (governing, not subjects): `docs/ux/product-ux-blueprint.md`
(PRODUCT-UX v6), `docs/ux/screens/S01-home.md`, `S02-setup.md`,
`S09-data-health.md` (v4), `docs/constitution/standards/ui-conventions.md`
(STD-UI v6), `docs/constitution/tech-stack.md` (v6) and its gate state, the
design system (`design-system/components/*/design-spec.md`, `theme.css`,
`component-map.json`, `intake.md`), CAP-002's `component-design-classification-ui.md`
(v3), `docs/architecture.md`, the delivered `tests/unit/test_api_no_secrets.py`
and `tests/unit/test_no_committed_secrets.py`, and decision records DEC-0050,
DEC-0058 and DEC-0200 to DEC-0220 in the harness repository (at 9cf1a48).

This review was delegated unattended by `$design-run`; `scripts/design-next.py`
reports the step as "review (specification-review): the specifications changed
after passing review v1". Only this report was written. See the
*Unattended-Run Record* for the two run conditions decided rather than asked.

## Dimension Status

Every dimension carries a status. None may be omitted, and `applied` may not be
claimed for a dimension whose mechanical evidence did not run.

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | Capability sections 1 to 8 (28 ACs); system design sections 1 to 10, a narrative of 3 to 5 sentences before every diagram; UX brief 1 to 12; UX design 0 to 7; the fourteen template sections of each component design, each diagram preceded by its narrative. No primary finding |
| SR-2 Correctness | applied | ACs against each other and the flows; the verdict, tile and empty-state derivations walked at their boundaries, including the first-download window and stocks followed but never downloaded (FINDING-2, -5, -6, -13) |
| SR-3 Consistency | applied | AC-to-design mapping; system design against all ten component designs; UX brief against UX design; designs against the owner verdicts in DEC-0200 to DEC-0220; CAP-003 against CAP-002's approved designs (FINDING-1, -8, -10, -11, -18, -21) |
| SR-4 Testability | applied | All 28 ACs for observable outcome, input, boundary and measurability; AC-28's volume test (20 timed requests after a warm-up) checked (FINDING-7) |
| SR-5 Traceability | applied | Capability, system design, UX design and component traceability tables; decision-record citations and states resolved (FINDING-16, -20, -22) |
| SR-6 Clarity | applied | Placeholder and vague-language scan (four `[REQUIRES INPUT]` markers, all for questions the owner answered); cross-reference and step-number checks (FINDING-12, -14, -17, -19) |
| SR-7 Feasibility | applied | No circular dependency (`ui-components` imports only the theme; screens import it and `owner-shell`; nothing imports a screen); read-only Python components; AC-28 bound on the on-demand read; Home no longer waits on the aggregate. No primary finding |
| SR-8 UX Completeness | applied | `design_system_available` true (`projects/factorflow-v2/design-system.yaml`; every configured path exists): 15 component specs and every variant used exist, 54 theme tokens named in the designs exist in `theme.css`; source mapping and design source present; EDG checklist present; screen acceptance checks assessed below. Findings touching it: FINDING-6, -11 |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` (no error, no warning); dependency typing and citations; STD-UI section 5.4 against UX brief 12.1, rule by rule, and each declared specialization against the rule's posture; tech-stack v6 content and gate (`artifact-gate.py check` FAILED: approval stale); CONST-SEC SEC-ENC-001 bookkeeping (FINDING-2, -3, -4, -15) |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passed; Section 4.1 declares eight components with stable identifiers, used on every diagram box; every Section 4.2 row names a provider and a consumer component; no capability identifier is used as an actor in Sections 1 to 5; one interface the component designs use is absent from Section 4.2 (FINDING-9) |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, PASSED, exit 0 | none; CAP-003 integrates at layer 2 after CAP-001 and CAP-002 |
| `build-architecture.py -p factorflow-v2` | run, PASSED, exit 0, no drift | none from the script against CAP-003 (its recorded interface finding belongs to CAP-002 and is system design open question 5); FINDING-9 records an interface the inventory cannot see because Section 4.2 omits it |
| `check-artifacts.py -p factorflow-v2 --strict` | run, PASSED (260 project warnings, none on CAP-003); scoped run on the CAP-003 directory PASSED with none | none |
| `check-references.py` | run, PASSED, exit 0 | none from the script; its scope excludes `repos/`, so CAP-003 path references were resolved by hand: every delivered path cited exists, the rest are files the designs introduce, routes, or harness paths |
| `check-constitutions.py` | run, PASSED, exit 0 | none |

Also run, read-only: `scripts/check-prerequisites.sh --project factorflow-v2`
(exit 2, context 26 h old, window 24 h; see the run record),
`scripts/pipeline-state.py check --stage specification-review`
(AWAITING-APPROVAL, exit 1: v1 exists and no subject is approved),
`scripts/design-next.py -p factorflow-v2 -c CAP-003` (review: specifications
changed after v1), `scripts/artifact-gate.py revision` for the fourteen
subjects, and `scripts/artifact-gate.py check -a docs/constitution/tech-stack.md`
(FAILED: "approval is stale; reviewed sha256:cf11e1b4..., current revision is
sha256:2288cb25...").

## Constitutions Applied

The relevance matrix assigns `specification-review` seven constitutions; all
seven were read.

| Constitution | What it produced |
|--------------|------------------|
| CONST-AGT 2.3 | AGT-AUTH-003 and AGT-AUTH-002: two owner amendments are not carried into the artifacts that cite them (DEC-0202, FINDING-1; DEC-0210's never-acquired clause, FINDING-2), and one record says a decision the designs call withdrawn is still open (DEC-0219, FINDING-22). AGT-PROV-001: every subject carries a complete provenance block with one correlation id; two are not restamped after their edit and the revised designs name the original producer (FINDING-20). AGT-SCOPE-002: CAP-001's approved designs are not edited; the takeover of its delivered files is now confirmed by the owner (system design open question 8). AGT-SCOPE-003: AC-18's removal clause is gone. AGT-EVIDENCE-002: AC-28's values cite the owner's decision and the layout values cite the approved blueprint; two constants remain unsourced (FINDING-19). AGT-AUTH-001: nothing is approved by this review |
| CONST-MDL 1.3 | MDL-PIN-003: this report records the exact model identifier; the revised designs' provenance does not record the model that produced the 2026-10-25 revision (FINDING-20) |
| CONST-OPS 1.3 | OPS-MIG-001 and OPS-MIG-003: no schema change; rollback is an image redeploy, stated in system design 4.4 and every component's Upgrade section. OPS-ERR-001: every failed read has a defined rendering except the Data health verdict when the aggregate read fails (FINDING-7) |
| CONST-REV 1.4 | REV-STG-001: the two stages are recorded below. REV-AGT-001: the full bar was applied. REV-RCV-001: each v1 resolution was verified against the current text, not against the commit messages (disposition table). REV-RCV-002: two resolutions that follow v1's own recommendations are challenged with evidence from STD-UI's text (FINDING-3 against v1 FINDING-11's "record why"; FINDING-4 against v1 FINDING-6's "narrow AC-26") |
| CONST-SA 2.0 | SA-MD-003: four `[REQUIRES INPUT]` markers stand for questions already answered (FINDING-12). SA-MD-002: stale decision numbers and a stale commit (FINDING-16), a decision state the designs contradict (FINDING-22). SA-DEAD-002: no TODO, TBD or vague placeholder. SA-MD-001 and SA-NAME-001: templates and naming conform (`check-artifacts.py`) |
| CONST-SEC 1.3 | SEC-ENC-001 host-local loopback exception: the exact phrase is cited in the system design, the UX brief, `data-health-api`, `data-health-reader` and `ingestion-api`, each naming its channel, and DEC-0208's `artifacts` name exactly those five (v1 FINDING-21 resolved). SEC-DAT-001: the new response elements are classified Internal in system design 4.2. SEC-AUTH-001: `data-health-api` 4 now states the basis correctly. SEC-DEP-003: licences recorded in tech stack v6 and verified when each package is added. SEC-SEC-001: the sentinel string in `ingestion-api` 2.3 is the delivered test's fixture value, within the scope the project's `test_no_committed_secrets.py` documents for fixture values; no finding. SEC-INP-001 and SEC-INP-002: cursor and limit validated and bound. SEC-ERR-001: no `request_id` or code reaches the owner |
| CONST-VER 1.2 | VER-EVD-001 and VER-EVD-002: every claim rests on this session's reads and script runs. VER-EVD-004: the Traceability Matrix gives a verdict for each of the 28 ACs and each screen acceptance check. VER-DEL-001: the designs' and commits' claims (owner decisions applied, tokens exist, no COMPONENT-SPEC-GAP, DEC-0208 complete) were re-verified against the decision records, `theme.css`, `design-system/` and the phrase citations |

### Stage 1 -- Specification Compliance

Fidelity of the designs to the capability, the owner's recorded decisions, the
approved blueprint and screen specifications, STD-UI v6, the tech stack and the
harness constitutions: FINDING-1, -2, -3, -4, -5, -6, -7, -10, -11, -13, -14,
-15. The scope boundary holds throughout: no provider read, no write, no
table, nothing unshipped rendered, CAP-001's endpoints consumed unchanged.

### Stage 2 -- Artifact Quality

Internal consistency, maintainability and accuracy of the artifacts
themselves: FINDING-8, -9, -12, -16, -17, -18, -19, -20, -21, -22.

### Review v1 Dispositions

| v1 finding | v1 severity | Disposition in the current text | Carried as |
|------------|-------------|---------------------------------|------------|
| v1 FINDING-1 | HIGH | Resolved: `tech-stack.md` v6 Key Libraries lists all ten packages with licences (OQ-TS-10); system design 4.3 (`:609`) and capability OQ-4 (`:450-463`) list all ten. Residuals: UX brief and command-palette still call them provisional; v6's approval is stale | FINDING-12, FINDING-15 |
| v1 FINDING-2 | HIGH | Resolved in the UX design (`:318`, `:771`), `data-health-ui` (`:187`), `ui-components` (`:208`) and capability 5.4 (`:394`): clean label *No missing prices or gaps*, scope note covers currency, Stale state dropped and listed in 0.8. Residuals: the UX brief's scope note; a stale check status in the tier type | FINDING-11, FINDING-21 |
| v1 FINDING-3 | MEDIUM | Resolved: system design 3.1 note 1, 3.3, 4.1, 4.2, 4.3 and constraint 7 carry DEC-0212, DEC-0215, DEC-0220 and the withdrawal of DEC-0219. DEC-0214, outside v1's list, is still not carried | FINDING-9 |
| v1 FINDING-4 | MEDIUM | Resolved: AC-28 (`:324-327`); Home never reads the aggregate; the volume test asserts p95 over 20 timed requests (`data-health-reader` `:503`) | none |
| v1 FINDING-5 | MEDIUM | Resolved: AC-18 (`:285-289`) | none |
| v1 FINDING-6 | MEDIUM | Resolved for AC-26 (`:313-320`); the STD-UI-29 conformance claim built on it does not hold | FINDING-4 |
| v1 FINDING-7 | MEDIUM | Resolved: both figures from `stocks_current` when served (system design 3.3 note 1; UX design 1.3; `home-ui` 2.4; `data-health-ui` 2.4) | none |
| v1 FINDING-8 | MEDIUM | Resolved: every followed stock affected answers critical *No* (`ui-components` `:252`, test `:445`) | none |
| v1 FINDING-9 | MEDIUM | Resolved: `latest_terminal_download` feeds `worstDataTier` (`ui-components` 2.4). Residual: the verdict's failure states | FINDING-7 |
| v1 FINDING-10 | MEDIUM | Resolved: the empty state keys on no download having ended; problem rows render once one has. Residuals: the null-check rendering differs between artifacts; the empty state now spans a running first download | FINDING-6, FINDING-8 |
| v1 FINDING-11 | MEDIUM | Resolved for setup step 4 and Recent downloads; the chips' carve-out is labelled a permitted STD-UI-25 specialization it is not | FINDING-3 |
| v1 FINDING-12 | MEDIUM | Resolved: UX design 0.8 adds the Stale state, the *Needs fixing* sub-line and the market state. Residual: 0.8's count of inherited departures | FINDING-21 |
| v1 FINDING-13 | MEDIUM | Resolved in `owner-web-app` 2.1, matching CAP-002's approved allocation. Residual: the system design maps `/runs` differently | FINDING-10 |
| v1 FINDING-14 | MEDIUM | Resolved: `ui-components` takes over CAP-002's `as-of-line.tsx` (system design 4.1; UX brief 4; UX design 3; `ui-components` 2.1) | none |
| v1 FINDING-15 | LOW | Open, deferred by the owner | FINDING-13 |
| v1 FINDING-16 | LOW | Open, deferred by the owner | FINDING-14 |
| v1 FINDING-17 | LOW | Open, deferred by the owner, now with v5 references beside it | FINDING-15 |
| v1 FINDING-18 | LOW | Open, deferred by the owner | FINDING-16 |
| v1 FINDING-19 | LOW | Open, deferred by the owner | FINDING-17 |
| v1 FINDING-20 | LOW | Open, deferred by the owner | FINDING-18 |
| v1 FINDING-21 | MEDIUM | Resolved: DEC-0208's `artifacts` equal the five designs citing the phrase; system design 4.2 classifies the new elements; `data-health-api` 4 restates the SEC-AUTH-001 basis; `data-health-reader` 4 cites the phrase and the 127.0.0.1:5432 channel | none |
| v1 FINDING-22 | LOW | Open, deferred by the owner | FINDING-19 |
| v1 FINDING-23 | LOW | Resolved for the seven designs (restamped before 0b7c6fb); two others not restamped | FINDING-20 |

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; no finding.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` reports no error and no warning for CAP-003. Both
`requires-runtime` rows are typed and cited correctly, as in v1; section 5.2
carries the disclaimers and 5.3 the constraints; no `blocked-by` row.

STD-UI conformance: section 5.4 accounts for all 30 rules and agrees with UX
brief section 12.1 on every applicability. Every `no` follows from M1 scope.
Specialization legality fails for one cell (STD-UI-25, FINDING-3), and claim
support fails in part for STD-UI-29 (FINDING-4) and, on Home's tile, for
STD-UI-18 (FINDING-2).

The tech-stack edge is satisfied in content (all ten packages and their
licences are in v6) but not against an approved artifact: v6's approval is
stale until the owner re-approves it, and the row still pins v2 (FINDING-15).

- **FINDING-3** (MEDIUM) — the STD-UI-25 specialization.
- **FINDING-4** (MEDIUM) — the STD-UI-29 claim.
- **FINDING-15** (LOW) — version pins; v6 approval stale.

#### Completeness (SR-1)

All sections present; AC-28 adds the performance requirement v1 found
missing. No finding.

#### Correctness (SR-2)

No two ACs contradict each other. AC-25 is contradicted by the section 5.4
specialization that exempts the rail chips (FINDING-3).

#### Testability (SR-4)

All 28 ACs have observable outcomes; AC-28 is measured by a defined volume
test. No primary finding.

#### Clarity (SR-6)

- **FINDING-14** (LOW) — AC-12's "No screen MUST present" (v1 FINDING-16).

### System Design Specification

Section 4.1 declares eight components with stable identifiers; every diagram
box carries one; Section 4.2 names a provider and consumer component for every
row. Every AC traces (Section 7), AC-28 included. Constraint 4 now states the
full verdict rule as the owner amended it.

- **FINDING-1** (HIGH) — 3.2 and 4.1 implement the setup rule the owner
  overrode.
- **FINDING-2** (HIGH) — 3.3 box 19 and note 6 give Home a *Yes* badge before
  any download has ended.
- **FINDING-9** (MEDIUM) — DEC-0214's shell-context setter and its
  `owner-web-app` consumer are absent from 4.2; 3.5 note 4 contradicts it.
- **FINDING-10** (MEDIUM) — 4.1 and open question 6 map `/runs` to
  `/data/downloads`, not `/data`.
- **FINDING-16** (LOW), **FINDING-17** (LOW) — stale decision numbers; step
  citations (v1 FINDING-18, -19).

### Component Design Specifications

Every behaviour has an owning component; every interface used is defined on
both sides except FINDING-9's; every delivered file edited has one owner
(DEC-0211). No circular dependency.

- **FINDING-1** (HIGH) — `setup-ui` 2.2, 2.3, 3, 7, 10.
- **FINDING-2** (HIGH) — `home-ui` 2.2, 2.4; `ui-components` 2.4.
- **FINDING-5** (MEDIUM) — *needs attention* means two populations.
- **FINDING-6** (MEDIUM) — **Start the first download** offered while the
  first download runs.
- **FINDING-7** (MEDIUM) — `data-health-ui` verdict failure states.
- **FINDING-8** (MEDIUM) — null-check rendering.
- **FINDING-13** (LOW), **FINDING-18** (LOW), **FINDING-19** (LOW),
  **FINDING-20** (LOW), **FINDING-21** (LOW), **FINDING-22** (LOW).

### UX Brief

All screens the capability names are listed; information architecture covers
every AC data element; interactions cover all five flows; every suggested
component exists; accessibility is specified; section 12 is complete. The
brief was revised for v1's MEDIUM findings but only partly for the HIGH ones
and the owner's answers.

- **FINDING-11** (MEDIUM) — 2.5 and 12.1 keep the old STD-UI-18 scope note.
- **FINDING-12** (MEDIUM) — answered questions still open with
  `[REQUIRES INPUT]`; packages still provisional.
- Also touched by FINDING-1, -2, -3, -4, -6, -8, -15, -16, -18, -21.

### UX Design Specification

Every brief screen has a section; every UI element maps to an existing spec or
a named composition (no COMPONENT-SPEC-GAP, verified); source mapping and the
design source are present; every token named exists; the EDG checklist is
present.

- **FINDING-12** (MEDIUM) — section 7 and section 3 carry answered questions;
  0.8 and 7 contradict each other on OQ-3.
- Also touched by FINDING-1, -2, -4, -5, -6, -7, -8, -9, -13, -18, -19, -21.

### Cross-Specification Consistency (SR-3)

Entity names, routes, error codes and the eight download states agree across
all fourteen artifacts. Mismatches: FINDING-1 (designs against DEC-0202's
owner verdict), FINDING-8, FINDING-10, FINDING-11, FINDING-18, FINDING-21
(each a `CROSS-SPEC-INCONSISTENCY`).

### Screen Specification Acceptance Checks

| Check | Verdict | Evidence |
|-------|---------|----------|
| S01-1, S01-2, S01-5 | not applicable | Live and paper tiles are M2 and M6 (S01 section 2) |
| S01-3 | met | `sortAttention` and one action per item (`ui-components` 2.6; `home-ui` 2.5) |
| S01-4 | met | Items exist only while their cause holds (`data-health-reader` 2.7; `ui-components` 2.6) |
| S01-6 | met | Scores and prices as-of on the tile (`home-ui` 2.4) |
| S01-7 | met | No strategy, paper or live region or placeholder (`home-ui` 3; UX design 1.3) |
| S02-1, S02-3 to S02-6 | met | `setup-ui` 2.2, 2.3, 10; `owner-shell` 2.6 redirect |
| S02-2 | met, with FINDING-1 | Drafts kept across Back within the visit; the owner's rule keeps them for the session |
| S09-1 | met | One tier function; *Partial* warning, *Interrupted* serious (`ui-components` 2.3) |
| S09-2, S09-3 | met | Problem rows name operation, stock, reason and fix; *Not found* never offers a download (`data-health-ui` 2.5) |
| S09-4 | met | `credential_present` boolean only; no-secrets test extended (`ingestion-api` 2.3) |
| S09-5 | met, with FINDING-6 | Empty state before any download has ended (`data-health-ui` 10) |

---

## Findings Summary Table

CRITICAL 0 · HIGH 2 · MEDIUM 10 · LOW 10 · **total 22**

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-3, SR-5 | System design; UX brief; UX design; setup-ui; DEC-0202 | `system-design.md:277-280`, `:297-299`, `:302-303`, `:534`, `:753`; `ux-brief.md:166`, `:168`, `:176`, `:273`, `:275`, `:407-409`; `ux-design.md:463`, `:486-489`, `:513-515`, `:1300-1301`; `component-design-setup-ui.md:60-64`, `:124`, `:219-222`, `:232-234`, `:280`, `:328`; harness `projects/factorflow-v2/decisions/DEC-0202.md` (`owner_decision`, owner review 2026-10-25T15:24:55Z) | The owner upheld DEC-0202 with rule B: *Add later* lets Continue past step 3 with no symbols; step 4 shows **Start download** blocked with CAP-001's `no_active_instruments` reason and lets the owner leave for Home or **Manage followed stocks**; unsaved input is held in app memory above the `/setup` route for the session. The record says the setup rule "is to be amended by hand", and its `status` is `applied`. The four artifacts still carry the agent's rule A, citing DEC-0202: *Add later* navigates to `/home`, and drafts live in `setup-ui`'s state "for the visit". CROSS-SPEC-INCONSISTENCY | Stories and tests would implement a rule the owner rejected, under a citation that reads as authority for it; leaving `/setup` and returning loses drafts the owner wants kept (AC-3, S02-2); the decision trail reports the amendment applied when it is not | Apply rule B in system design 3.2 (diagram and notes), 4.1 (`setup-ui` row) and 7 (AC-3), UX brief 2.3, 3 and 5, UX design 1.2 and 2, and `setup-ui` 1, 2.2, 2.3, 3, 7 and 10 (step 4's `blocked` state and its two exits; where the session-scoped drafts live, outside browser storage); the driver records the commit against DEC-0202 |
| FINDING-2 | HIGH | SR-9, SR-2 | System design; UX brief; UX design; home-ui; ui-components | `system-design.md:335-337`, `:351`, `:374-380`; `ux-brief.md:188`, `:207`; `ux-design.md:600-613`, `:689`; `component-design-home-ui.md:106-112`, `:151`; `component-design-ui-components.md:250`, `:255`, `:276-277`; DEC-0210 `owner_decision` ("never-acquired replaces both with the empty state"); STD-UI-18 (`ui-conventions.md:430-439`) | Home's empty state is keyed on `latest_download` null (no download requested). From the moment the first download is requested until one has ended, the tile renders with `worstDataTier(0, m, null)`: `affectedCount` 0 gives good *Yes*, no terminal download contributes no tier, and *No scores yet* (neutral) never displaces it. The tile therefore reads *Yes* beside its own *No scores yet* and the header's *prices not downloaded yet*. The owner's DEC-0210 amendment replaces the badge with the empty state while nothing is acquired; that clause is in no artifact, and no test covers the case | The landing screen answers "can the data be trusted" with *Yes* when nothing has been downloaded: the absence of a detected problem presented as evidence of correctness, which STD-UI-18 (stricter-only) forbids and STD-UI-15 rules out | Carry the clause: while attention's `latest_terminal_download` is null (no download has ever ended, the signal Data health already uses), the tile shows no verdict tier (the first-download state or not determinable with its reason, never *Yes*); state it in system design 3.3, UX brief 2.4, UX design 1.3, `home-ui` 2.2 and 2.4 and `ui-components` 2.4, and add the case to `worst-data-tier.test.ts` and `data-tile.test.tsx` |
| FINDING-3 | MEDIUM | SR-9, SR-2 | Capability; UX brief; system design; owner-shell | `Capability-CAP-003.md:401` (5.4 STD-UI-25), `:310-312` (AC-25); `ux-brief.md:736`; `system-design.md:371-373`, `:678-681`, `:775`; `component-design-owner-shell.md:395-398`, `:462-465`, `:644`; STD-UI-25 (`ui-conventions.md:534-544`, "Specialization: permitted — cadence varies per region") | The rail chips are polled and show no last-updated time; 5.4 and every design call this "a permitted specialization of STD-UI-25". STD-UI-25 permits varying the cadence, not omitting the time, and AC-25 ("every region updated by polling MUST show its last-updated time") is unchanged. The specialization follows v1 FINDING-11's own recommendation ("record why"), which this review withdraws: recording a reason does not make the variation one the rule permits | The conformance claim rests on a specialization outside the rule's declared posture (STD-UI section 4); a test derived from AC-25 fails for the chips; an implementation review applying STD-UI-25 will flag them | Owner chooses: give the chips a displayed time (for example a *checked {time}* line in the rail's data group), or amend STD-UI-25 through `$constitution` so the carve-out is legal (one-way, the owner's); then align AC-25, 5.4 and UX brief 12.1, dropping the "permitted specialization" label |
| FINDING-4 | MEDIUM | SR-9 | Capability; system design; UX brief; UX design; owner-shell; setup-ui; ui-components | `Capability-CAP-003.md:313-320` (AC-26), `:405` (5.4 STD-UI-29); `system-design.md:696-703`; `ux-brief.md:444-449`, `:740`; `ux-design.md:298-303`; `component-design-owner-shell.md:146-164` (`layout.ts`); `component-design-setup-ui.md:318-320`; `component-design-ui-components.md:383-391`; STD-UI-29 (`ui-conventions.md:579-592`); `design-system/theme.css:214` | AC-26 now holds the approved layout sizes (208px, 1180px, 260 to 300px, 28px, 16px, 70ch) as string literals in `web/src/app/layout.ts`, and 5.4 marks STD-UI-29 a plain `yes`. STD-UI-29's verification is "No spacing, size or colour literal appears outside the theme" and its specialization "MAY NOT introduce a value"; `layout.ts` fails the verification by construction. `explanationMeasure: "70ch"` also defines the prose measure a second time beside the theme's `--measure-prose: 75ch` | The resolution holds for AC-26 but the STD-UI-29 conformance claim it supports does not; an implementation review running the standard's verification rejects `layout.ts`, and two prose measures exist | Owner chooses, at the standard: amend STD-UI-29 through `$constitution` to exempt approved-specification layout dimensions held in one module (one-way, the owner's), or route them through `design-system/intake.md` as tokens; either way say which governs the 70ch cap against `--measure-prose`, and mark the 5.4 and UX brief 12.1 cells accordingly |
| FINDING-5 | MEDIUM | SR-2, SR-6 | UX design; data-health-ui; ui-components; UX brief; capability AC-11 | `ux-design.md:749`, `:771-772`; `component-design-data-health-ui.md:167`, `:187-188`; `component-design-ui-components.md:208`; `ux-brief.md:770`; `component-design-data-health-reader.md:343-346` (DEC-0213 a); `Capability-CAP-003.md:260-263` | Under DEC-0210 as amended the verdict counts only the problem set (failed or not found outcomes), while each check card labels its exceptions *Needs attention*, and those exceptions include stocks with no prices (never downloaded counts, DEC-0213 a), stocks behind and stocks with gaps. A stock followed after the last download produces *Yes. None of the {m} followed stocks needs attention.* above a Daily prices card reading *Needs attention*; Home's tile shows *Yes* for the same state. The verdict's consequence clause (scores *Incomplete*) also applies to the stocks it does not count | The screen's one sentence contradicts the card under it in the same words; AC-11's "how many followed stocks need attention" has two answers on one screen | Keep DEC-0210's inputs and separate the words: relabel the check-card exception state (for example *Exceptions* or *Gaps or missing data*), or qualify the verdict's clause to the problem set it counts; record the choice in UX design 1.4 and brief 12.2 |
| FINDING-6 | MEDIUM | SR-2, SR-8 | UX design; UX brief; data-health-ui; system design | `ux-design.md:894`; `ux-brief.md:231`; `component-design-data-health-ui.md:125-127`, `:403-411`; `system-design.md:418-419`, `:473-479` | The empty state now lasts until a download has ended, so it covers the whole first download. During it the card still offers **Start the first download** ("the same post as Download now") while Recent downloads, rendered beneath, shows that first download running. Pressing it queues a second full download (AC-15's queued line) | The button's label describes an effect it does not have (STD-UI-2); the state a running first download produces is not designed | While `latest_download` is non-terminal and none has ended, replace the button with the running download's state (as Home's first-download item does) or name the effect truthfully; add the case to `data-health.test.tsx` |
| FINDING-7 | MEDIUM | SR-4, SR-2 | data-health-ui; UX design | `component-design-data-health-ui.md:171-172`, `:334`, `:419-422`; `ux-design.md:899` | The verdict reads two sources, the aggregate (`affected_count`, `followed_count`) and attention (`latest_terminal_download`). Section 2.3 defines only attention's loading and failure (Error state, "no tier is computed without the download input"); the test plan asserts "attention failing gives *Can't tell yet*", DEC-0210's superseded wording; section 10 lists the verdict under Unavailable while 2.3 says Error; and no artifact defines the verdict when `GET /api/data-health` fails, UX design 1.4 saying "the verdict's read is attention" | Test design derives a test for copy the design no longer renders, and the aggregate-failure rendering of the screen's first line is left to implementation (OPS-ERR-001) | Make the test row match 2.3; define the verdict for an aggregate failure (header kept, the operation and reason, **Try again**); place the attention-failure case under one state; correct UX design 1.4's Error line |
| FINDING-8 | MEDIUM | SR-3 | UX design; UX brief; data-health-ui | `ux-design.md:894` (null checks `coverage-unknown` *Not determinable*, *Nothing has been stored yet.*); `ux-brief.md:231`, `:819`; `component-design-data-health-ui.md:412-416` (an `Absent` em dash for the tier and the result line) | After a download has ended with nothing stored (`never_acquired`), the UX design and brief render the null checks as not determinable; `data-health-ui` renders them as absent. STD-UI-14 keeps the two apart. CROSS-SPEC-INCONSISTENCY | Story and test take different renderings of the same state | Choose one (the UX design's reading is the screen's authority) and align `data-health-ui` 10 and its test |
| FINDING-9 | MEDIUM | SR-10, SR-3 | System design; UX design; UX brief | `system-design.md:570-572` (Shell context rows), `:521-523` (3.5 note 4); `ux-design.md:168-172`, `:183`; `ux-brief.md:122`; `component-design-owner-shell.md:216`, `:352-359`; `component-design-owner-web-app.md:80-81`, `:217-219`; DEC-0214 (`artifacts` name the system design and UX design; owner upheld) | DEC-0214 gives the shell context `setTitleDetail`, called by `owner-web-app`'s download detail for its crumb. Section 4.2 lists the Shell context only for `home-ui`, `setup-ui` and `data-health-ui`, without the setter; 3.5 note 4 says "no delivered screen needs to know about the top bar"; UX design 0.3 and brief 2.1 say titles come from one static table | The architecture inventory, derived from 4.2, lacks the interface; a reader of the system design gets a shell context without the setter and a delivered screen that does not call it | Add the setter to the Shell context shape and an `owner-shell` to `owner-web-app` row to 4.2 (and `classification-ui` as optional consumer), correct 3.5 note 4, UX design 0.3 and brief 2.1, and regenerate `docs/architecture.md` |
| FINDING-10 | MEDIUM | SR-3 | System design; owner-web-app | `system-design.md:548-551` (4.1), `:820-827` (open question 6); `component-design-owner-web-app.md:137-141`; CAP-002 `component-design-classification-ui.md:306-309` (approved v3) | The system design migrates `SHELL_ROUTES` `/runs` to `/data/downloads`. CAP-002's approved allocation and `owner-web-app` map it to `/data` (*Open Data health*). CROSS-SPEC-INCONSISTENCY | The edit v1 FINDING-13 gave an owner now has two targets; Research's *Open Data health* would land on Downloads if a story follows the system design | Correct 4.1 and open question 6 to `/data`, as CAP-002 approved and `owner-web-app` already state |
| FINDING-11 | MEDIUM | SR-3, SR-9 | UX brief | `ux-brief.md:218` (scope note *Gaps are judged against the days other followed stocks hold. A market-wide outage leaves no gap to detect.*), `:729` (12.1 STD-UI-18 "carries S09 §8's scope note"); against `ux-design.md:771`, `component-design-data-health-ui.md:187`, `Capability-CAP-003.md:394` | The UX design and `data-health-ui` carry the corrected STD-UI-18 statement covering currency, and capability 5.4 says so. The brief's 2.5 still specifies the old gaps-only note, and its 12.1 row, which "agrees" with 5.4, cites it. CROSS-SPEC-INCONSISTENCY | The brief, the conformance narrative 5.4 delegates to, specifies a coverage statement that omits what v1 FINDING-2 found missing | Replace the brief's note with the UX design's text and correct 12.1's STD-UI-18 row |
| FINDING-12 | MEDIUM | SR-6, SR-3 | UX brief; UX design; command-palette; data-health-ui; setup-ui; owner-web-app; data-health-reader | `ux-brief.md:299`, `:449-453`, `:592-612`, `:689-692`; `ux-design.md:1394-1397`, `:1492-1513`, `:1531-1534`, `:1543-1548` (against `:317`); `component-design-command-palette.md:59-60`; `component-design-data-health-ui.md:501-502`; `component-design-setup-ui.md:425-430`; `component-design-owner-web-app.md:471-476`; `component-design-data-health-reader.md:584-587`; against `Capability-CAP-003.md:428-463`, `system-design.md:787-843` | The owner answered capability OQ-1, OQ-3 and OQ-4 and system design questions 6 and 8 on 2026-10-25, and upheld DEC-0213. The brief and UX design still carry OQ-1 and OQ-3 with `[REQUIRES INPUT]` markers and OQ-4 as open; the brief calls six packages provisional until confirmation; the UX design's 0.8 says OQ-3 was answered no while its section 7 asks it; "specification review has not seen" these artifacts; question 6 is "carried by the redirect"; four component designs list answered questions or DEC-0213 as awaiting the owner | Unresolved markers on answered questions (SA-MD-003), and a design contradicting itself on scope; downstream readers see open questions that are closed | Bring each open-question section forward to the answers in capability 7 and system design 8; remove the markers; state the packages as confirmed in tech stack v6 |
| FINDING-13 | LOW | SR-2 | UX design; data-health-ui | `ux-design.md:773`; `component-design-data-health-ui.md:189`; CAP-002 `component-design-classification-api.md:461-462` | v1 FINDING-15, deferred: the Factor scores card tests `later` before `set.not_current`, which CAP-002 makes true exactly when `later` is non-null, so *Not reflecting the latest download* is unreachable on the card | A test would be written for an unreachable state | As v1: record that *Updating* and *Score update failed* carry the card's Stale state, or reorder |
| FINDING-14 | LOW | SR-6 | Capability | `Capability-CAP-003.md:264-265` | v1 FINDING-16, deferred: "No screen MUST present" inverts RFC 2119 | Ambiguity in a core criterion | "No screen MAY present" |
| FINDING-15 | LOW | SR-9 | Capability; system design; UX brief; data-health-reader; tech-stack gate | `Capability-CAP-003.md:339` (v2); `system-design.md:866` (v5); `ux-brief.md:653` (v5); `component-design-data-health-reader.md:561` (v5); `artifact-gate.py check -a docs/constitution/tech-stack.md` (FAILED, approval stale) | v1 FINDING-17, deferred, and widened: the capability's tech-stack row pins v2, three source tables cite v5, and v6, which the subjects' provenance pins, has a stale approval | Version citations point at superseded revisions; the "approved technologies" the row's satisfied-when names are confirmed by the owner but not yet in an approved artifact | Cite v6 in the four places once the owner re-approves `tech-stack.md` v6 |
| FINDING-16 | LOW | SR-5, SR-6 | System design; UX brief | `system-design.md:875`; `ux-brief.md:24`, `:642`, `:655` | v1 FINDING-18, deferred: DEC-0200 to DEC-0208 are still given as (0188) to (0196), and the brief cites system design commit 09410b0, on no branch | Dangling references (SA-MD-002) | Replace with 0200 to 0208 and 4c663e2 |
| FINDING-17 | LOW | SR-6 | System design | `system-design.md:236` ("step 9", the redirects are step 8), `:309` ("Step 18", progress is step 19), `:452` ("step 28", the refresh is step 22), `:455` ("step 8's checks", step 7), `:470` ("Step 31's dialog", step 24) | v1 FINDING-19, deferred: notes cite steps that do not match the diagrams' `autonumber` | A reader citing a step lands on the wrong message | Renumber the notes |
| FINDING-18 | LOW | SR-3 | UX brief; UX design; home-ui; ui-components; command-palette; data-health-ui; owner-shell | `ux-brief.md:242`; `component-design-home-ui.md:173-180` and `component-design-ui-components.md:339-341` against DEC-0203's five kinds; `ux-design.md:365`; `component-design-data-health-ui.md:199`; `component-design-command-palette.md:129-131` against `component-design-owner-shell.md:319-327`; `component-design-owner-shell.md:519` against `:100-141` | v1 FINDING-20, deferred: the six small drifts stand (*Follow stocks*; six kinds against five; *{SYMBOL} · {name}* with no name in M1; "any loaded row"; `RESEARCH_REGISTERED` undeclared; `use-data-health.test.tsx` absent from the placement list). CROSS-SPEC-INCONSISTENCY | Stories and tests pick one reading each | As v1 |
| FINDING-19 | LOW | SR-6 | UX design; command-palette; home-ui | `ux-design.md:365`, `:680`; `component-design-command-palette.md:110`, `:125`, `:180`; `component-design-home-ui.md:138-139` | v1 FINDING-22, deferred: the 250 ms debounce and the per-minute market-state recomputation cite no source (AGT-EVIDENCE-002) | Unsourced behavioural constants | Cite the source or mark `[REQUIRES INPUT]` |
| FINDING-20 | LOW | SR-5 | command-palette; ingestion-api; the revised designs | `component-design-command-palette.md:17` (02:50:00Z), `component-design-ingestion-api.md:17` (02:14:00Z), each pinning `tech-stack` v6, first committed 2026-10-25T19:28:17Z (beffa86); `system-design.md:14-20` and the component designs' `agent_id` and `model` | v1 FINDING-23 is resolved for the seven designs it named. Two designs edited in the revision were not restamped and claim a source that did not exist at their timestamp; the revised system and component designs carry the original agent and `claude-opus-5-5` with new timestamps, while both revision commits (9ac4a45, 0b7c6fb) are attributed to Claude Fable 5.1 (AGT-PROV-001, MDL-PIN-003) | The audit trail cannot say who produced the reviewed revision | Restamp the two; record the revising agent and model, or state that the provenance names the original producer |
| FINDING-21 | LOW | SR-3 | UX design; UX brief; data-health-ui; system design; ui-components | (a) `ux-design.md:895`, `ux-brief.md:231` against `component-design-data-health-ui.md:222-228` and `system-design.md:592`; (b) `ux-design.md:205`, `:207`; (c) `ux-design.md:309-311` against `ux-brief.md:568`; (d) `component-design-ui-components.md:190`, `:208` | Small drifts: (a) *Last complete download* comes from Recent downloads' rows in the UX design and brief but from a dedicated `state=succeeded&limit=1` read in `data-health-ui`, which system design 4.2 and 3.4 do not list; (b) UX design 0.4 assigns *Needs fixing*'s *checked {time}* to both the attention and the aggregate reads; (c) 0.8 says six of its seven departures are "inherited from the brief", which records three; (d) the tier type keeps a check status `not_current` that the FINDING-2 resolution removed and carries no check identity, so `labelOf` cannot return the two distinct `ok` labels its table requires. CROSS-SPEC-INCONSISTENCY | Stories pick one reading each; a test could reintroduce the removed Stale state | Align (a) to `data-health-ui`'s read and add it to 4.2; give (b) one source; correct (c); drop `not_current` and add the check's identity to the type |
| FINDING-22 | LOW | SR-5 | System design; home-ui; owner-shell; data-health-api; DEC-0219 | `system-design.md:325-327`; `component-design-home-ui.md:48-50`; `component-design-owner-shell.md:51-54`; `component-design-data-health-api.md:263-264`, `:316-318`, `:332`; harness `DEC-0219.md` (`status: open`, `owner_reviewed: false`) | The designs say DEC-0219 was "withdrawn by the owner on 2026-10-25"; the record still holds the agent's decision (Home reads the aggregate), open and unreviewed | A later owner review or blind triage can uphold a decision every design contradicts | The driver records the withdrawal on DEC-0219 with `scripts/sdd decisions` |

---

## Traceability Matrix

Per-requirement verdicts (VER-EVD-004). "Traced" means the AC maps to a system
design element, a UX design element and a component design element, and the
component design's own test proves it.

| AC | System design | UX design | Component design(s) | Verdict |
|----|---------------|-----------|---------------------|---------|
| AC-1 | 4.1, 5.11; DEC-0204 | 0.2 | owner-shell 2.6, 2.7 | Traced |
| AC-2 | 3.1 | 0.3 | owner-shell 2.5; setup-ui 2.3 | Traced |
| AC-3 | 3.2 note 1 | 1.2 | setup-ui 2.2 | Traced, with FINDING-1 |
| AC-4 | 3.2, 5.10 | 1.2, 1.4, 1.9 | setup-ui; owner-web-app 2.3; ingestion-api 2.3 | Traced |
| AC-5 | 3.2 notes 2, 3 | 1.2, 1.6 | setup-ui 2.3 (DEC-0218); owner-web-app | Traced |
| AC-6 | 3.2 | 1.2 | setup-ui 10 | Traced |
| AC-7 | 3.2, 3.3 | 1.2, 1.3 | setup-ui; home-ui 2.5; ui-components 2.6 (DEC-0216); data-health-reader 2.6 | Traced |
| AC-8 | 3.3 | 1.3 | home-ui 2.4 | Traced, with FINDING-2 |
| AC-9 | 3.3 note 3 | 1.3 | ui-components 2.6; data-health-reader 2.7 | Traced |
| AC-10 | 5.11 | 1.3 | home-ui 3 | Traced |
| AC-11 | 3.4 note 8, constraint 4 | 1.4 | data-health-ui 2.3, 2.4; data-health-reader 2.5 | Traced, with FINDING-5, -7 |
| AC-12 | 5.6 | 0.7, 1.4, 1.7, 1.8 | ui-components 2.3; owner-web-app 2.3 | Traced, with FINDING-14 |
| AC-13 | 3.4 | 1.4 | data-health-reader 2.4; data-health-ui 2.5 | Traced |
| AC-14 | 3.4 note 2 | 1.4 | data-health-reader 2.4; data-health-ui 2.5, 2.7 | Traced |
| AC-15 | 3.4 | 1.4, 1.5, 1.7 | data-health-ui 2.7; owner-web-app 2.3 | Traced, with FINDING-6 |
| AC-16 | 3.3 boxes 17, 18 | 0.2 | owner-shell 2.7; ui-components 2.6 | Traced |
| AC-17 | 3.5, 4.1, 5.2 | 1.5 to 1.9 | owner-web-app; ingestion-api | Traced; the takeover is confirmed by the owner (system design open question 8) |
| AC-18 | 3.1 note 4 | 0.3 | owner-shell 2.6; owner-web-app 2.1 (`SHELL_ROUTES`) | Traced, with FINDING-10 |
| AC-19 | 5.3 | 0.7 | owner-web-app 7 (vocabulary sweep); ui-components `labelOf` | Traced |
| AC-20 | 5.4 | 0.7 | ui-components 2.3 | Traced |
| AC-21 | 3.3 box 5, 3.4 note 7 | 1.3, 1.4 | home-ui 2.2; data-health-ui 2.2, 10; data-health-reader 2.5, 2.6 | Traced, with FINDING-2, -6, -8 |
| AC-22 | 3.5; DEC-0207 | 1.1 | command-palette; owner-shell 2.7 | Traced |
| AC-23 | 3.1 note 3 | 0.5 | owner-shell 2.8 | Traced |
| AC-24 | 3.3, 3.4, 5.5 | States subsections | ui-components 2.7 `StateRegion`; each screen | Traced, with FINDING-8, -13 |
| AC-25 | 5.8, 5.13 | 0.4, accessibility subsections | owner-shell 2.4, 2.7; setup-ui 10; data-health-ui 2.6 | Traced, with FINDING-3 (the rail chips) |
| AC-26 | 4.1, 5.12 | every Component Mapping and Token Usage; 0.7 | ui-components; owner-shell 2.1 `layout.ts` | Traced, with FINDING-4 |
| AC-27 | 4.2 | 0.2, 0.3 | owner-shell 2.6; command-palette 2.3 | Traced |
| AC-28 | 5.7, 6.4 | none (not interface-facing) | data-health-reader 5, 7, 8; data-health-api 5, 7, 8 | Traced |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No CRITICAL finding exists. Two HIGH findings exist and neither blocks epic
generation, because both are confined to one flow and one tile and the fix to
each is stated: FINDING-1 applies a rule the owner has already decided, and
FINDING-2 adds the no-terminal-download case to a function the designs already
share. Both should be resolved before story generation reaches the setup and
Home stories, and before test design, so that no test encodes the rejected
*Add later* rule or a *Yes* tile before any download has ended. FINDING-3 and
FINDING-4 need an owner choice at the standard, which is one-way under
`docs/unattended-mode.md` and is therefore listed, not decided.

This verdict approves nothing. Every schema-versioned specification in scope
(all fourteen, `status: draft`) stays blocked from epic generation and test
design until the owner explicitly approves each revision with
`scripts/artifact-gate.py approve`, using this report as `--review-artifact`.
`docs/constitution/tech-stack.md` v6, which every subject now pins, fails
`artifact-gate.py check` (approval stale) until the owner re-approves it.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. **FINDING-1** — carry DEC-0202's owner rule (*Add later* to a blocked step
   4; session-scoped drafts above `/setup`) into the system design, UX brief,
   UX design and `setup-ui`.
2. **FINDING-2** — no verdict tier on Home's tile until a download has ended,
   as DEC-0210's amendment says.

### Should Fix (MEDIUM findings)

3. **FINDING-3** — show the chips' time, or amend STD-UI-25; align AC-25.
4. **FINDING-4** — settle STD-UI-29 against `layout.ts` and the 70ch measure.
5. **FINDING-5** — one meaning of *needs attention* on Data health.
6. **FINDING-6** — design the running-first-download state of Data health's
   empty card.
7. **FINDING-7** — the verdict's failure states and its test.
8. **FINDING-8** — one rendering for the null checks.
9. **FINDING-9** — DEC-0214 in system design 4.2, 3.5 and UX design 0.3.
10. **FINDING-10** — `/runs` to `/data` in the system design.
11. **FINDING-11** — the brief's STD-UI-18 scope note.
12. **FINDING-12** — bring the open-question sections forward; remove the
    four markers.

### Nice to Have (LOW findings)

13. **FINDING-13** to **FINDING-19** — v1's deferred LOW findings, unchanged
    in substance (FINDING-15 widened to the v5 citations and the stale v6
    approval).
14. **FINDING-20** to **FINDING-22** — provenance restamp, small drifts, and
    DEC-0219's record.

---

## Open Questions for the Owner

Recorded instead of asked, because the run is unattended. None is a decision
this review took.

1. **FINDING-3:** show the rail chips' time, or amend STD-UI-25 (one-way).
2. **FINDING-4:** amend STD-UI-29 for approved layout dimensions, or route
   them through intake as tokens (one-way); and which governs the 70ch cap.
3. **FINDING-2:** what Home's tile shows between the first download's request
   and its end (first-download state, or not determinable with its reason).
4. **FINDING-5:** which wording separates the verdict's count from the check
   cards' exceptions.
5. **Tech stack v6** awaits the owner's re-approval.
6. **DEC-0219** is open in the harness although the designs record it as
   withdrawn (FINDING-22); **DEC-0202**'s amendment is unapplied (FINDING-1).

## Unattended-Run Record

- Mode: unattended, delegated by `$design-run` (run `design-run-f106a0`) after
  the owner's 2026-10-25 answers to review v1.
- Decided, not asked (run conditions, recorded here because the delegation
  permits writing only this report; the driver may record them as decisions):
  1. `check-prerequisites.sh` exited 2 (context 26 h old, window 24 h). The
     review proceeded without refreshing: every finding rests on the
     specifications read directly from the checked-out branch at 0b7c6fb, not
     on the context cache, and a refresh would write `cache/` and `logs/` and
     update repositories, which the delegation forbids.
  2. `pipeline-state.py` reported AWAITING-APPROVAL because v1 exists and no
     subject is approved. v1's `review_subjects` are bound to revisions that
     commits 9ac4a45 and 0b7c6fb replaced, so v1 is not current evidence for
     any subject; `design-next.py` names this re-review as the next step.
- Abstentions: none. FINDING-3 and FINDING-4 name one-way choices for the
  owner; this review makes neither.
- Severity and verdict are review judgments under the rubric, not decisions
  under `docs/decision-records.md`.
- Writes: this report only. No artifact, approval block, decision record,
  branch or commit was touched; the skill's closing discussion prompt was
  skipped; the driver commits the report.
