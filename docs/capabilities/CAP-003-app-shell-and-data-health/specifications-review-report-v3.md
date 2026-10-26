---
artifact_schema_version: 1
artifact_id: CAP-003-specification-review
artifact_type: specification-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-25
updated: 2026-10-25
document: spec-review-report
capability: CAP-003
version: v3
generated: 2026-10-26T02:31:00Z
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
    result: "PASSED, exit 0: 3 designs, 27 components, 84 interfaces, no drift against docs/architecture.md; its one recorded interface finding (GET /api/classifications/summary consumer 'shell-home-and-data-health-ui (unpublished)') is declared by CAP-002; the inventory, derived from Section 4.2, lacks the Shell context setter of DEC-0214 (FINDING-9) and the SetupDraftProvider mount (FINDING-24)"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 260 warnings, exit 0 (--strict, whole project, 421 artifacts); none on CAP-003; scoped with -a to the CAP-003 directory before this report: 16 artifacts, PASSED, no warning"
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
  SR-8: "applied — design_system_available true (projects/factorflow-v2/design-system.yaml; components, theme.css, component-map.json and intake.md exist; 18 specs); the variants c9382aa adds (button blocked for Start download, links styled outline) exist in the button spec; S01-3 to S01-7, S02-1 to S02-6 and S09-1 to S09-5 assessed"
  SR-9: "applied — dependency half and STD-UI conformance half by check-capabilities.py; capability section 5.4 against UX brief section 12.1 (STD-UI v6) rule by rule, including each declared specialization against the rule's posture; tech-stack v6 content and approval state (artifact-gate.py check passed); CONST-SEC 1.3 SEC-ENC-001 bookkeeping"
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
    content_revision: sha256:b53713f1a7d809d62700b3482de28dc1b0131ef8c03b4a5ff9fffaa6e24dc98d
  - artifact_id: CAP-003-ux-brief
    artifact_version: 1
    content_revision: sha256:7922e502c1847a1179d0be6ecad3bde3143536f21d4199535ae7901ee02088eb
  - artifact_id: CAP-003-ux-design
    artifact_version: 1
    content_revision: sha256:4d7a816572b09884ffa98872f0a7b5e75a850281a01492378ad46b792b38f7bc
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
    content_revision: sha256:ca070dd2fca538012fdf6a4875f6efc1844f3f1d3edbfe57c21121f4648e43cd
  - artifact_id: CAP-003-component-design-home-ui
    artifact_version: 1
    content_revision: sha256:a59005fb2706a6cfb222bc7f543c29a1022db0a8bcb1b1c4bd4e6a45af46e7a9
  - artifact_id: CAP-003-component-design-ingestion-api
    artifact_version: 1
    content_revision: sha256:c6800ef2637c3e6010eae5b02d41d00e8bccefa9bbefb0cfe414ebd14632ebce
  - artifact_id: CAP-003-component-design-owner-shell
    artifact_version: 1
    content_revision: sha256:4c0865ac001c6556ad83246816159cf101e3ebe6d343bf2c09ff3ab037891b01
  - artifact_id: CAP-003-component-design-owner-web-app
    artifact_version: 1
    content_revision: sha256:600efed70d936386a6704d4e3b490ebc36aa782db1ad74577a3197b11cd5a396
  - artifact_id: CAP-003-component-design-setup-ui
    artifact_version: 1
    content_revision: sha256:0760d1a9efd2c65959dc26125cdbc1cb28befd67c0e07d8ba8fdd811864be8e8
  - artifact_id: CAP-003-component-design-ui-components
    artifact_version: 1
    content_revision: sha256:f192035972886f4d75abf789fba598cf064f5f7aa69ee7f6d72bb2f5d288a558
statistics:
  total_findings: 25
  critical: 0
  high: 0
  medium: 12
  low: 13
pipeline_readiness: READY
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-26T02:31:00Z
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
      version: "2 (READY-WITH-WARNINGS, 22 findings; dispositions verified here, not a subject)"
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
      version: "6 (re-approved by the owner, commit f45c9cb; artifact-gate check passes; governs, not a subject)"
    - id: CAP-001 schema
      version: "src/factorflow/db/migrations/0004_runs.sql (delivered; context)"
    - id: CAP-002-component-design-classification-ui
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
| **Version** | v3 |
| **Specifications Reviewed** | Capability v1; system design v1 (`ui_facing: true`); UX brief v1; UX design v1; ten component designs v1 (all draft), at project-repo commit c9382aa |
| **Total Findings** | 25 (CRITICAL 0, HIGH 0, MEDIUM 12, LOW 13) |
| **Pipeline Readiness** | READY |

Both of review v2's HIGH findings are resolved in the text, verified against
the artifacts rather than against commit c9382aa's message. **v2 FINDING-1:**
the owner's DEC-0202 rule now stands in the system design, the UX brief, the
UX design, `setup-ui`, `owner-shell` and `docs/architecture.md`: setup is
complete once a download exists in any state, *Add later* continues to a step
4 whose **Start download** is `blocked` with the `no_active_instruments` reason
and offers **Go to Home** and **Manage followed stocks**, and unsaved input is
held for the session by `SetupDraftProvider` above the `/setup` route, never
in browser storage. **v2 FINDING-2:** while attention's
`latest_terminal_download` is null, `worstDataTier` and `dataTileBadge` return
null, Home's tile shows the empty state and then a first-download-running state
with at most *Downloading*, and both test plans cover the case.

Five findings are new, all residuals of those two resolutions. Two are MEDIUM.
**FINDING-23:** the fix uses "no download has ever ended" for DEC-0210's
*never-acquired*, and the two differ when the first download ends
*Cancelled by you* before anything is stored. The delivered schema gives a
cancelled run an `ended_at`, so `latest_terminal_download` is set, `cancelled`
contributes no tier, and an empty problem set answers good *Yes* on Home's tile
and on Data health's verdict while the Daily prices and Company financials
cards read *Nothing has been stored yet.* **FINDING-24:** `SetupDraftProvider` is a new cross-component
interface (`setup-ui` owns it, `owner-shell` mounts it) that system design
Section 4.2 does not list, and the system design, brief and UX design place it
"in the route tree", while the two component designs place it, for a stated
reason, outside the route map. The three LOW findings are copy and wording
drift in the new states (FINDING-25 to FINDING-27).

v2's ten MEDIUM and ten LOW findings, which the owner left open for a later
revision, were re-verified and are carried under their v2 identifiers,
FINDING-3 to FINDING-22. None is worse. FINDING-15 is narrower: tech stack v6
is now approved and passes its gate, and only the stale version pins remain.

With no CRITICAL or HIGH finding, the rubric's verdict is READY. Twelve MEDIUM
findings remain open; FINDING-23 should be fixed before test design encodes
`worstDataTier`'s table.

## Review Scope

All four specification types exist and were read in full at project-repo
commit c9382aa on `usr/alvaro-de-jodra/CAP-003-design` (clean, a git worktree):
`Capability-CAP-003.md`, `design/system-design.md`, `design/ux-brief.md`,
`design/ux-design.md` and the ten `design/component-design-*.md` files
(command-palette, data-health-api, data-health-reader, data-health-ui,
home-ui, ingestion-api, owner-shell, owner-web-app, setup-ui, ui-components).
`epics/` and `stories/` do not exist. Review v2
(`specifications-review-report-v2.md`) was read and each of its 22 findings was
re-checked against the current text; the diffs of f45c9cb and c9382aa against
v2's base (0b7c6fb) were read to locate what changed. Six subjects are
byte-identical to their v2 revisions (capability, command-palette,
data-health-api, data-health-reader, ingestion-api, owner-web-app); eight
changed.

Read to verify claims (governing, not subjects): `docs/ux/screens/S02-setup.md`,
`S01-home.md` and `S09-data-health.md` (v4), `docs/constitution/standards/ui-conventions.md`
(STD-UI v6: STD-UI-18, -25, -29), `docs/constitution/tech-stack.md` (v6) and its
gate state, `design-system/components/button/design-spec.md`,
`design-system/theme.css`, `projects/factorflow-v2/design-system.yaml`,
`docs/architecture.md`, the delivered schema
`src/factorflow/db/migrations/0004_runs.sql`, and decision records DEC-0200 to
DEC-0220 in the harness repository (at 9cf1a48).

This review was delegated unattended by `$design-run`;
`scripts/design-next.py` reports the step as "review (specification-review):
the specifications changed after passing review v2". Only this report was
written. See the *Unattended-Run Record* for the conditions decided rather
than asked.

## Dimension Status

Every dimension carries a status. None may be omitted, and `applied` may not be
claimed for a dimension whose mechanical evidence did not run.

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | Capability sections 1 to 8 (28 ACs); system design sections 1 to 10, a narrative before every diagram, the new boxes 20 and 21 and note 6 of 3.2 included; UX brief 1 to 12; UX design 0 to 7; the fourteen template sections of each component design. No primary finding |
| SR-2 Correctness | applied | ACs against each other and the flows; the verdict, tile and empty-state derivations walked at their boundaries against the delivered `acquisition_run` constraints, including a first download that ends *Cancelled by you* or is `requested` or `cancelling` (FINDING-5, -6, -13, -23, -26) |
| SR-3 Consistency | applied | AC-to-design mapping; system design against all ten component designs; UX brief against UX design; the setup and empty-state rules traced through every artifact that carries them; designs against the owner verdicts in DEC-0202 and DEC-0210 (FINDING-8, -10, -11, -18, -21, -24, -25, -26) |
| SR-4 Testability | applied | All 28 ACs for observable outcome, input, boundary and measurability; the new test rows in `setup-ui` 7, `home-ui` 7 and `ui-components` 7 checked against the rules they assert (FINDING-7, -23) |
| SR-5 Traceability | applied | Capability, system design, UX design and component traceability tables; decision-record citations, states and trailers resolved (c9382aa carries `Decision-Id: DEC-0202` and `DEC-0210`, read by `git log --format=%(trailers)`) (FINDING-16, -20, -22) |
| SR-6 Clarity | applied | Placeholder and vague-language scan (four `[REQUIRES INPUT]` markers, all for questions the owner answered); step-number and copy checks (FINDING-12, -14, -17, -19, -25, -27) |
| SR-7 Feasibility | applied | No circular dependency at module level (`SetupDraftProvider` lives in `web/src/screens/setup/draft.tsx` and imports nothing from the shell; the shell already imports screens to register routes); read-only Python components; AC-28 bound on the on-demand read; drafts in React state only. No primary finding |
| SR-8 UX Completeness | applied | `design_system_available` true; every component and variant the new states use exists (`button` `blocked`, which the spec defines as focusable, and links styled `outline`); no COMPONENT-SPEC-GAP; source mapping, design source and EDG checklist present; screen acceptance checks assessed below (FINDING-6, -11, -27) |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` (no error, no warning); dependency typing and citations; STD-UI section 5.4 against UX brief 12.1, rule by rule, and each declared specialization against the rule's posture; tech stack v6 approved and `artifact-gate.py check` passes; SEC-ENC-001 bookkeeping (FINDING-3, -4, -15, -23) |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passed; Section 4.1 declares eight components with stable identifiers, used on every diagram box; every Section 4.2 row names a provider and a consumer component; no capability identifier is used as an actor in Sections 1 to 5; two interfaces the component designs use are absent from Section 4.2 (FINDING-9, -24) |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, PASSED, exit 0 | none; CAP-003 integrates at layer 2 after CAP-001 and CAP-002 |
| `build-architecture.py -p factorflow-v2` | run, PASSED, exit 0, no drift | none from the script against CAP-003 (its recorded interface finding belongs to CAP-002 and is system design open question 5); FINDING-9 and FINDING-24 record interfaces the inventory cannot see because Section 4.2 omits them |
| `check-artifacts.py -p factorflow-v2 --strict` | run, PASSED (260 project warnings, none on CAP-003); scoped run on the CAP-003 directory PASSED with none | none |
| `check-references.py` | run, PASSED, exit 0 | none from the script; its scope excludes `repos/`, so CAP-003 path references were resolved by hand: every delivered path cited exists, the rest are files the designs introduce (`web/src/screens/setup/draft.tsx` among them), routes, or harness paths |
| `check-constitutions.py` | run, PASSED, exit 0 | none |

Also run, read-only: `scripts/check-prerequisites.sh --project factorflow-v2`
(exit 2, context 27 h old, window 24 h; see the run record),
`scripts/pipeline-state.py check --stage specification-review`
(AWAITING-APPROVAL, exit 1: no subject carries an approval),
`scripts/design-next.py -p factorflow-v2 -c CAP-003` (review: specifications
changed after v2), `scripts/artifact-gate.py revision` for the fourteen
subjects, and `scripts/artifact-gate.py check -a docs/constitution/tech-stack.md`
("Artifact gate: passed").

## Constitutions Applied

The relevance matrix assigns `specification-review` seven constitutions; all
seven were read.

| Constitution | What it produced |
|--------------|------------------|
| CONST-AGT 2.3 | AGT-AUTH-003 and AGT-AUTH-002: the owner's DEC-0202 and DEC-0210 amendments are now carried (v2 FINDING-1, -2 resolved); DEC-0210's never-acquired clause is carried through a proxy that misses one state (FINDING-23); DEC-0219's record still contradicts the designs (FINDING-22). AGT-PROV-001: every subject carries a complete provenance block with one correlation id; two revised designs carry a timestamp later than the commit that contains them, and the revised designs name a model the commit does not (FINDING-20). AGT-SCOPE-002: no CAP-001 artifact is edited; setup saves only through CAP-001's endpoints. AGT-EVIDENCE-002: c9382aa introduces no new quantitative value; two constants remain unsourced (FINDING-19). AGT-AUTH-001: nothing is approved by this review |
| CONST-MDL 1.3 | MDL-PIN-003: this report records the exact model identifier; of the eight designs c9382aa revised, the UX brief and UX design name `claude-fable-5-1`, as the commit does, while the system design and five component designs keep `claude-opus-5-5` (FINDING-20) |
| CONST-OPS 1.3 | OPS-MIG-001 and OPS-MIG-003: no schema change; setup's drafts live in React state and are lost on reload by design; rollback is an image redeploy, stated in system design 4.4. OPS-ERR-001: the Data health verdict when the aggregate read fails is still undefined (FINDING-7). OPS-BUDGET-001: this session stayed under the 80-message warning threshold |
| CONST-REV 1.4 | REV-STG-001: the two stages are recorded below. REV-AGT-001: the full bar was applied. REV-RCV-001: each v2 resolution was verified against the current text, not against c9382aa's message (which says "Start download disabled"; the designs say `blocked`, FINDING-27). REV-RCV-002: the FINDING-2 resolution's premise, "while `latestTerminalDownload` is null no download has ever ended, so nothing has been acquired", is challenged with the delivered schema's `acquisition_run_terminal_has_end` constraint (FINDING-23) |
| CONST-SA 2.0 | SA-MD-003: four `[REQUIRES INPUT]` markers stand for questions already answered (FINDING-12). SA-MD-002: stale decision numbers and a stale commit (FINDING-16), a decision state the designs contradict (FINDING-22). SA-DEAD-002: no TODO, TBD or vague placeholder. SA-MD-001 and SA-NAME-001: templates and naming conform (`check-artifacts.py`) |
| CONST-SEC 1.3 | SEC-ENC-001 host-local loopback exception: the exact phrase is cited in the system design, the UX brief, `data-health-api`, `data-health-reader` and `ingestion-api` (in the last two the phrase wraps across a line), each naming its channel, and DEC-0208's `artifacts` name exactly those five; c9382aa adds no channel. SEC-DAT-001: c9382aa adds no API data element; setup drafts are browser memory only. SEC-DEP-003: the ten packages and their licences are in approved tech stack v6. SEC-INP-001, SEC-INP-002, SEC-ERR-001, SEC-SEC-001: unchanged from v2, no finding |
| CONST-VER 1.2 | VER-EVD-001 and VER-EVD-002: every claim rests on this session's reads and script runs. VER-EVD-004: the Traceability Matrix gives a verdict for each of the 28 ACs and each screen acceptance check. VER-DEL-001: the commit's claims (both HIGH findings resolved, `SetupDraftProvider` mounted by `owner-shell`, null answers from `worstDataTier` and `dataTileBadge`, tests added) were re-verified against the artifacts and the schema |

### Stage 1 -- Specification Compliance

Fidelity of the designs to the capability, the owner's recorded decisions, the
approved blueprint and screen specifications, STD-UI v6, the tech stack and the
harness constitutions: FINDING-3, -4, -5, -6, -7, -10, -11, -13, -14, -15, -23,
-25. The scope boundary holds throughout: no provider read, no write, no
table, no browser storage, nothing unshipped rendered, CAP-001's endpoints
consumed unchanged.

### Stage 2 -- Artifact Quality

Internal consistency, maintainability and accuracy of the artifacts
themselves: FINDING-8, -9, -12, -16, -17, -18, -19, -20, -21, -22, -24, -26,
-27.

### Review v2 Dispositions

v2's identifiers are kept, so the owner's open list reads the same in both
reports; the five new findings are FINDING-23 to FINDING-27.

| v2 finding | v2 severity | Disposition in the current text | Carried as |
|------------|-------------|---------------------------------|------------|
| v2 FINDING-1 | HIGH | Resolved. Owner's DEC-0202 rule in system design 3.2 (`:246-260`, diagram `:285-286`, `:304-306`, notes 1 and 6 `:309-315`, `:327-333`), 4.1 (`:564`), 4.4 (`:647-653`), 7 AC-3 (`:788`); UX brief `:98`, `:138`, `:166-168`, `:176`, `:273-275`, `:407-413`, `:819`; UX design `:176`, `:219`, `:425-431`, `:451-454`, `:469`, `:486-487`, `:495-499`, `:523-531`, `:552`, `:1327-1339`; `setup-ui` 1, 2.2, 2.3, 3, 7, 8, 10, 13; `owner-shell` `:108-111`, `:184`; `docs/architecture.md:47`. Every clause of DEC-0202's `owner_decision` is present | FINDING-24, FINDING-25, FINDING-27 (residuals) |
| v2 FINDING-2 | HIGH | Resolved for the case it named. System design 3.3 boxes 20 and 21 (`:356-357`), note 6 (`:395-410`), constraint 4 (`:688-692`), 7 AC-8 and AC-21; UX brief `:188`, `:207`, `:276`, `:778`, `:821`; UX design `:630-642`, `:719`, `:746-747`; `home-ui` 1, 2.2, 2.4, 7 (`:264`), 8; `ui-components` 2.4 (`:233-264`, `:283-290`) and its test (`:458`); `data-health-ui` 2.3 (`:157-162`) | FINDING-23, FINDING-26 (residuals) |
| v2 FINDING-3 | MEDIUM | Open, unchanged | FINDING-3 |
| v2 FINDING-4 | MEDIUM | Open, unchanged | FINDING-4 |
| v2 FINDING-5 | MEDIUM | Open, unchanged | FINDING-5 |
| v2 FINDING-6 | MEDIUM | Open, unchanged | FINDING-6 |
| v2 FINDING-7 | MEDIUM | Open, unchanged | FINDING-7 |
| v2 FINDING-8 | MEDIUM | Open, unchanged | FINDING-8 |
| v2 FINDING-9 | MEDIUM | Open, unchanged | FINDING-9 |
| v2 FINDING-10 | MEDIUM | Open, unchanged | FINDING-10 |
| v2 FINDING-11 | MEDIUM | Open, unchanged | FINDING-11 |
| v2 FINDING-12 | MEDIUM | Open, unchanged | FINDING-12 |
| v2 FINDING-13 | LOW | Open, unchanged | FINDING-13 |
| v2 FINDING-14 | LOW | Open, unchanged | FINDING-14 |
| v2 FINDING-15 | LOW | Narrowed: tech stack v6 is re-approved (f45c9cb) and passes its gate; the four stale version pins remain | FINDING-15 |
| v2 FINDING-16 | LOW | Open, unchanged | FINDING-16 |
| v2 FINDING-17 | LOW | Open, unchanged; the new note 6 of 3.2 cites step 22 correctly | FINDING-17 |
| v2 FINDING-18 | LOW | Open, unchanged | FINDING-18 |
| v2 FINDING-19 | LOW | Open, unchanged | FINDING-19 |
| v2 FINDING-20 | LOW | Open; c9382aa adds two restamps later than its own commit time and a third revision attributed to a model the designs do not name | FINDING-20 |
| v2 FINDING-21 | LOW | Open, unchanged | FINDING-21 |
| v2 FINDING-22 | LOW | Open, unchanged: DEC-0219 is still `status: open`, `owner_reviewed: false` | FINDING-22 |

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability specification; no finding.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py` reports no error and no warning for CAP-003. Both
`requires-runtime` rows are typed and cited correctly; section 5.2 carries the
disclaimers and 5.3 the constraints; no `blocked-by` row.

STD-UI conformance: section 5.4 accounts for all 30 rules and agrees with UX
brief section 12.1 on every applicability. Every `no` follows from M1 scope.
Specialization legality fails for one cell (STD-UI-25, FINDING-3), and claim
support fails in part for STD-UI-29 (FINDING-4) and, in one state of Home's
tile and Data health's verdict, for STD-UI-18 (FINDING-23).

The tech-stack edge is now satisfied against an approved artifact: v6 is
re-approved and `artifact-gate.py check` passes. The row still pins v2
(FINDING-15).

- **FINDING-3** (MEDIUM) — the STD-UI-25 specialization.
- **FINDING-4** (MEDIUM) — the STD-UI-29 claim.
- **FINDING-15** (LOW) — version pins.

#### Completeness (SR-1)

All sections present. No finding.

#### Correctness (SR-2)

No two ACs contradict each other. AC-25 is contradicted by the section 5.4
specialization that exempts the rail chips (FINDING-3). User flow 1 step 7
says *Add later* lets setup *finish*; AC-2 and the owner's DEC-0202 keep it
incomplete (FINDING-25).

#### Testability (SR-4)

All 28 ACs have observable outcomes; AC-28 is measured by a defined volume
test. No primary finding.

#### Clarity (SR-6)

- **FINDING-14** (LOW) — AC-12's "No screen MUST present".
- **FINDING-25** (LOW) — flow 1 step 7's "finish".

### System Design Specification

Section 4.1 declares eight components with stable identifiers; every diagram
box carries one; Section 4.2 names a provider and consumer component for every
row. Every AC traces (Section 7). The owner's setup rule and DEC-0210's
no-terminal-download clause are carried in 3.1, 3.2, 3.3, 4.1, 4.4,
constraint 4 and Section 7.

- **FINDING-9** (MEDIUM) — DEC-0214's shell-context setter absent from 4.2.
- **FINDING-10** (MEDIUM) — 4.1 and open question 6 map `/runs` to
  `/data/downloads`, not `/data`.
- **FINDING-23** (MEDIUM) — 3.3 note 6 and constraint 4 key never-acquired on
  `latest_terminal_download`, which a cancelled first download sets.
- **FINDING-24** (MEDIUM) — the `SetupDraftProvider` mount is absent from 4.2;
  3.2 note 1 places it "in `owner-shell`'s route tree".
- **FINDING-16** (LOW), **FINDING-17** (LOW) — stale decision numbers; step
  citations.

### Component Design Specifications

Every behaviour has an owning component; every delivered file edited has one
owner (DEC-0211); `setup-ui` states that it owns `SetupDraftProvider` and
`owner-shell` that it only places it. No circular dependency.

- **FINDING-5** (MEDIUM) — *needs attention* means two populations.
- **FINDING-6** (MEDIUM) — **Start the first download** offered while the
  first download runs.
- **FINDING-7** (MEDIUM) — `data-health-ui` verdict failure states.
- **FINDING-8** (MEDIUM) — null-check rendering.
- **FINDING-23** (MEDIUM) — `ui-components` 2.4's table and rationale; the
  `home-ui` and `data-health-ui` tests do not cover the cancelled case.
- **FINDING-13** (LOW), **FINDING-18** (LOW), **FINDING-19** (LOW),
  **FINDING-20** (LOW), **FINDING-21** (LOW), **FINDING-22** (LOW),
  **FINDING-26** (LOW), **FINDING-27** (LOW).

### UX Brief

All screens the capability names are listed; information architecture covers
every AC data element; interactions cover all five flows, *Add later* to a
blocked step 4 included; every suggested component exists; accessibility is
specified; section 12 is complete, with a new 12.2 row for the tile while no
download has ended and a new 12.4 case for blocked step 4.

- **FINDING-11** (MEDIUM) — 2.5 and 12.1 keep the old STD-UI-18 scope note.
- **FINDING-12** (MEDIUM) — answered questions still open with
  `[REQUIRES INPUT]`; packages still provisional.
- Also touched by FINDING-3, -4, -6, -8, -15, -16, -18, -21, -23, -24, -25.

### UX Design Specification

Every brief screen has a section; every UI element maps to an existing spec or
a named composition (no COMPONENT-SPEC-GAP, verified, including step 4's
`blocked` **Start download** and its two exits); source mapping and the design
source are present; every token named exists; the EDG checklist is present.

- **FINDING-12** (MEDIUM) — section 7 carries answered questions; 0.8 and 7
  contradict each other on OQ-3.
- Also touched by FINDING-4, -5, -6, -7, -8, -9, -13, -18, -19, -21, -23,
  -24, -25, -26, -27.

### Cross-Specification Consistency (SR-3)

Entity names, routes, error codes and the eight download states agree across
all fourteen artifacts, and so do the setup-completion signal, the *Add later*
path, the blocked reason's wording (*No stocks are followed. Follow stocks
before downloading.*) and the no-terminal-download keys of Home and Data
health. Mismatches, each a `CROSS-SPEC-INCONSISTENCY`: FINDING-8, FINDING-10,
FINDING-11, FINDING-18, FINDING-21, FINDING-24 (where the draft holder sits),
FINDING-25 (capability flow 1 step 7 against the designs), FINDING-26 (the
first-download-running sentence).

### Screen Specification Acceptance Checks

| Check | Verdict | Evidence |
|-------|---------|----------|
| S01-1, S01-2, S01-5 | not applicable | Live and paper tiles are M2 and M6 (S01 section 2) |
| S01-3 | met | `sortAttention` and one action per item (`ui-components` 2.6; `home-ui` 2.5) |
| S01-4 | met | Items exist only while their cause holds (`data-health-reader` 2.7; `ui-components` 2.6) |
| S01-6 | met, with FINDING-23 | Scores and prices as-of on the tile once a download has ended (`home-ui` 2.4) |
| S01-7 | met | No strategy, paper or live region or placeholder (`home-ui` 3; UX design 1.3) |
| S02-1 | met | *Step n of 4* and the stepper's done, current and to-do states; after *Add later*, step 3 stays to do while step 4 is current (`setup-ui` 2.2, 2.3) |
| S02-2 | met | Unsaved input held by `SetupDraftProvider` across Back and across leaving `/setup` for the session (`setup-ui` 2.2, 7 `draft.test.tsx`); FINDING-24 on where the holder is described |
| S02-3 to S02-6 | met | `setup-ui` 2.3, 7, 10; `owner-shell` 2.5 redirect on `most_recent_run` |
| S09-1 | met | One tier function; *Partial* warning, *Interrupted* serious (`ui-components` 2.3) |
| S09-2, S09-3 | met | Problem rows name operation, stock, reason and fix; *Not found* never offers a download (`data-health-ui` 2.5) |
| S09-4 | met | `credential_present` boolean only; no-secrets test extended (`ingestion-api` 2.3) |
| S09-5 | met, with FINDING-6, FINDING-23 | Empty state before any download has ended (`data-health-ui` 10); a cancelled first download leaves it for a *Yes* verdict |

---

## Findings Summary Table

CRITICAL 0 · HIGH 0 · MEDIUM 12 · LOW 13 · **total 25**

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-3 | MEDIUM | SR-9, SR-2 | Capability; UX brief; system design; owner-shell | `Capability-CAP-003.md:401` (5.4 STD-UI-25), `:310-312` (AC-25); `ux-brief.md:740`; `system-design.md:391-394`, `:714-716`, `:810`; `component-design-owner-shell.md:399-402`, `:466-469`, `:648`; STD-UI-25 (`ui-conventions.md:534-544`, "Specialization: permitted — cadence varies per region") | Carried from v2, unchanged. The rail chips are polled and show no last-updated time; 5.4 and every design call this "a permitted specialization of STD-UI-25". STD-UI-25 permits varying the cadence, not omitting the time, and AC-25 ("every region updated by polling MUST show its last-updated time") is unchanged | The conformance claim rests on a specialization outside the rule's declared posture; a test derived from AC-25 fails for the chips | Owner chooses: give the chips a displayed time, or amend STD-UI-25 through `$constitution` (one-way, the owner's); then align AC-25, 5.4 and UX brief 12.1 |
| FINDING-4 | MEDIUM | SR-9 | Capability; system design; UX brief; UX design; owner-shell; setup-ui; ui-components | `Capability-CAP-003.md:313-320` (AC-26), `:405`; `system-design.md:731-742`; `ux-brief.md:448-453`, `:744`; `ux-design.md:298-303`; `component-design-owner-shell.md:149-167` (`layout.ts`); `component-design-setup-ui.md:380-383`; `component-design-ui-components.md:396-404`; STD-UI-29 (`ui-conventions.md:579-592`); `design-system/theme.css:214` | Carried from v2, unchanged. `web/src/app/layout.ts` holds the approved layout sizes as literals and 5.4 marks STD-UI-29 a plain `yes`; STD-UI-29's verification is "No spacing, size or colour literal appears outside the theme" and its specialization "MAY NOT introduce a value". `explanationMeasure: "70ch"` sits beside the theme's `--measure-prose: 75ch` | An implementation review running the standard's verification rejects `layout.ts`; two prose measures exist | Owner chooses, at the standard: amend STD-UI-29 through `$constitution` (one-way), or route the values through `design-system/intake.md` as tokens; say which governs the 70ch cap |
| FINDING-5 | MEDIUM | SR-2, SR-6 | UX design; data-health-ui; ui-components; UX brief; capability AC-11 | `ux-design.md:781-782`, `:803`; `component-design-data-health-ui.md:170-171`, `:190-191`; `component-design-ui-components.md:209`; `ux-brief.md:774`; `component-design-data-health-reader.md:343-346` (DEC-0213 a); `Capability-CAP-003.md:260-263` | Carried from v2, unchanged. The verdict counts only the problem set, while each check card labels its exceptions *Needs attention*, and those include stocks with no prices, stocks behind and stocks with gaps. A stock followed after the last download produces *Yes. None of the {m} followed stocks needs attention.* above a Daily prices card reading *Needs attention* | The screen's one sentence contradicts the card under it in the same words; AC-11's "how many followed stocks need attention" has two answers | Relabel the check-card exception state, or qualify the verdict's clause to the problem set; record the choice in UX design 1.4 and brief 12.2 |
| FINDING-6 | MEDIUM | SR-2, SR-8 | UX design; UX brief; data-health-ui; system design | `ux-design.md:926`; `ux-brief.md:231`; `component-design-data-health-ui.md:125-127`, `:405-414`; `system-design.md:448-449` | Carried from v2, unchanged. The empty state lasts until a download has ended, so it covers the whole first download; during it the card still offers **Start the first download** while Recent downloads beneath shows that download running. Pressing it queues a second full download | The button's label describes an effect it does not have (STD-UI-2); the running-first-download state of the card is not designed | While `latest_download` is non-terminal and none has ended, replace the button with the running download's state, or name the effect truthfully; add the case to `data-health.test.tsx` |
| FINDING-7 | MEDIUM | SR-4, SR-2 | data-health-ui; UX design | `component-design-data-health-ui.md:174-175`, `:337`, `:424-425`; `ux-design.md:931` | Carried from v2, unchanged. 2.3 defines attention's failure as the Error state; the test plan asserts "attention failing gives *Can't tell yet*"; section 10 lists the verdict under Unavailable; no artifact defines the verdict when `GET /api/data-health` fails, UX design 1.4 saying "the verdict's read is attention" | Test design derives a test for copy the design no longer renders; the aggregate-failure rendering of the screen's first line is left to implementation (OPS-ERR-001) | Make the test row match 2.3; define the verdict for an aggregate failure; place the attention-failure case under one state; correct UX design 1.4's Error line |
| FINDING-8 | MEDIUM | SR-3 | UX design; UX brief; data-health-ui | `ux-design.md:926` (null checks `coverage-unknown` *Not determinable*, *Nothing has been stored yet.*); `ux-brief.md:231`, `:824`; `component-design-data-health-ui.md:415-419` (an `Absent` em dash for the tier and the result line) | Carried from v2, unchanged. After a download has ended with nothing stored, the UX design and brief render the null checks as not determinable; `data-health-ui` renders them as absent. CROSS-SPEC-INCONSISTENCY | Story and test take different renderings of the same state | Choose one (the UX design's reading is the screen's authority) and align `data-health-ui` 10 and its test |
| FINDING-9 | MEDIUM | SR-10, SR-3 | System design; UX design; UX brief | `system-design.md:600-602` (Shell context rows), `:551-553` (3.5 note 4); `ux-design.md:168-172`; `ux-brief.md:122`; `component-design-owner-shell.md:220`, `:356-363`; `component-design-owner-web-app.md:80-81`, `:217-219`; DEC-0214 | Carried from v2, unchanged. DEC-0214 gives the shell context `setTitleDetail`, called by `owner-web-app`'s download detail; Section 4.2 lists the Shell context only for `home-ui`, `setup-ui` and `data-health-ui`, without the setter; 3.5 note 4 says "no delivered screen needs to know about the top bar" | The architecture inventory, derived from 4.2, lacks the interface | Add the setter and an `owner-shell` to `owner-web-app` row to 4.2, correct 3.5 note 4, UX design 0.3 and brief 2.1, regenerate `docs/architecture.md` |
| FINDING-10 | MEDIUM | SR-3 | System design; owner-web-app | `system-design.md:577-582` (4.1), `:855-862` (open question 6); `component-design-owner-web-app.md:137-141`; CAP-002 `component-design-classification-ui.md` (approved v3) | Carried from v2, unchanged. The system design migrates `SHELL_ROUTES` `/runs` to `/data/downloads`; CAP-002's approved allocation and `owner-web-app` map it to `/data` (*Open Data health*). CROSS-SPEC-INCONSISTENCY | Research's *Open Data health* would land on Downloads if a story follows the system design | Correct 4.1 and open question 6 to `/data` |
| FINDING-11 | MEDIUM | SR-3, SR-9 | UX brief | `ux-brief.md:218`, `:733`; against `ux-design.md:803`, `component-design-data-health-ui.md:190`, `Capability-CAP-003.md:394` | Carried from v2, unchanged. The UX design and `data-health-ui` carry the STD-UI-18 statement covering gaps and currency; the brief's 2.5 keeps the gaps-only note, and its 12.1 row cites it. CROSS-SPEC-INCONSISTENCY | The conformance narrative 5.4 delegates to specifies a coverage statement that omits currency | Replace the brief's note with the UX design's text and correct 12.1's STD-UI-18 row |
| FINDING-12 | MEDIUM | SR-6, SR-3 | UX brief; UX design; command-palette; data-health-ui; setup-ui; owner-web-app; data-health-reader | `ux-brief.md:222`, `:299`, `:440-441`, `:453-457`, `:596-616`, `:693-700`; `ux-design.md:193-194`, `:1530-1551`, `:1570-1571`, `:1581-1586` (against `:317`); `component-design-command-palette.md:59-60`; `component-design-data-health-ui.md:504-505`; `component-design-setup-ui.md:491-496`; `component-design-owner-web-app.md:297-298`, `:471-476`; `component-design-data-health-reader.md:584-587`; against `Capability-CAP-003.md:428-463`, `system-design.md:820-878` | Carried from v2, unchanged. The owner answered capability OQ-1, OQ-3 and OQ-4 and system design questions 6 and 8 on 2026-10-25, and upheld DEC-0213. The brief and UX design still carry OQ-1 and OQ-3 with `[REQUIRES INPUT]` markers and OQ-4 as open; the brief calls six packages provisional until confirmation; several designs name a download by its start time "until OQ-1 is answered"; four component designs list answered questions or DEC-0213 as awaiting the owner | Unresolved markers on answered questions (SA-MD-003); downstream readers see open questions that are closed | Bring each open-question section forward to the answers in capability 7 and system design 8; remove the markers; state the packages as confirmed in tech stack v6 |
| FINDING-13 | LOW | SR-2 | UX design; data-health-ui | `ux-design.md:805`; `component-design-data-health-ui.md:192`; CAP-002 `component-design-classification-api.md:461-462` | Carried from v2, unchanged. The Factor scores card tests `later` before `set.not_current`, which CAP-002 makes true exactly when `later` is non-null, so *Not reflecting the latest download* is unreachable on the card | A test would be written for an unreachable state | Record that *Updating* and *Score update failed* carry the card's Stale state, or reorder |
| FINDING-14 | LOW | SR-6 | Capability | `Capability-CAP-003.md:264-265` | Carried from v2, unchanged. "No screen MUST present" inverts RFC 2119 | Ambiguity in a core criterion | "No screen MAY present" |
| FINDING-15 | LOW | SR-9 | Capability; system design; UX brief; data-health-reader | `Capability-CAP-003.md:339` (v2); `system-design.md:27` ("6, draft 2026-10-25"), `:901` (v5); `ux-brief.md:657` (v5); `component-design-data-health-reader.md:561` (v5) | Carried from v2, narrowed. Tech stack v6 is re-approved (f45c9cb) and `artifact-gate.py check` passes; the capability's tech-stack row still pins v2, three source tables cite v5, and the system design's provenance calls v6 a draft | Version citations point at superseded revisions | Cite v6, approved, in the five places |
| FINDING-16 | LOW | SR-5, SR-6 | System design; UX brief | `system-design.md:910`; `ux-brief.md:24`, `:646`, `:659` | Carried from v2, unchanged. DEC-0200 to DEC-0208 are given as (0188) to (0196), and the brief cites system design commit 09410b0, on no branch | Dangling references (SA-MD-002) | Replace with 0200 to 0208 and 4c663e2 |
| FINDING-17 | LOW | SR-6 | System design | `system-design.md:236` ("step 9", the redirects are step 8), `:321` ("Step 18", progress is step 19), `:482` ("step 28", the refresh is step 22), `:485` ("step 8's checks", step 7), `:500` ("Step 31's dialog", step 24) | Carried from v2, unchanged. Notes cite steps that do not match the diagrams' `autonumber`; the new 3.2 note 6 cites step 22 correctly | A reader citing a step lands on the wrong message | Renumber the notes |
| FINDING-18 | LOW | SR-3 | UX brief; UX design; home-ui; ui-components; command-palette; data-health-ui; owner-shell | `ux-brief.md:242`; `component-design-home-ui.md:200-207` and `component-design-ui-components.md:352-354` against DEC-0203's five kinds; `ux-design.md:365`; `component-design-data-health-ui.md:202`; `component-design-command-palette.md:129-131` against `component-design-owner-shell.md:323-331`; `component-design-owner-shell.md:523` against `:100-144` | Carried from v2, unchanged: *Follow stocks*; six kinds against five; *{SYMBOL} · {name}* with no name in M1; "any loaded row"; `RESEARCH_REGISTERED` undeclared; `use-data-health.test.tsx` absent from the placement list. CROSS-SPEC-INCONSISTENCY | Stories and tests pick one reading each | As v1 and v2 |
| FINDING-19 | LOW | SR-6 | UX design; command-palette; home-ui | `ux-design.md:365`, `:709`; `component-design-command-palette.md:110`, `:125`, `:180`, `:199`; `component-design-home-ui.md:147-148` | Carried from v2, unchanged. The 250 ms debounce and the per-minute market-state recomputation cite no source (AGT-EVIDENCE-002) | Unsourced behavioural constants | Cite the source or mark `[REQUIRES INPUT]` |
| FINDING-20 | LOW | SR-5 | command-palette; ingestion-api; the revised designs | `component-design-command-palette.md:17` (02:50:00Z), `component-design-ingestion-api.md:17` (02:14:00Z), each pinning `tech-stack` v6, first committed 2026-10-25T19:28:17Z (beffa86); `component-design-data-health-ui.md:17` and `component-design-owner-shell.md:17` (2026-10-26T02:20:00Z) against c9382aa's commit time 2026-10-26T02:18:31Z; `system-design.md:15-20` and the revised component designs' `agent_id` and `model` | Carried from v2; the class is unchanged and c9382aa adds instances. Two designs claim a source that did not exist at their timestamp; two revised designs claim a production time after the commit that contains them; the system design and five component designs revised in c9382aa keep `claude-opus-5-5` and their original agent while the commit, like 9ac4a45 and 0b7c6fb, is attributed to Claude Fable 5.1 (AGT-PROV-001, MDL-PIN-003) | The audit trail cannot say who produced the reviewed revision, or when | Restamp the four; record the revising agent and model, or state that the provenance names the original producer |
| FINDING-21 | LOW | SR-3 | UX design; UX brief; data-health-ui; system design; ui-components | (a) `ux-design.md:927`, `ux-brief.md:231` against `component-design-data-health-ui.md:123`, `:225-231` and `system-design.md:622`; (b) `ux-design.md:205`, `:207`; (c) `ux-design.md:309-311` against `ux-brief.md:572`; (d) `component-design-ui-components.md:191`, `:209` | Carried from v2, unchanged: (a) *Last complete download* comes from Recent downloads' rows in the UX design and brief, from a dedicated `state=succeeded&limit=1` read in `data-health-ui`, which 4.2 does not list; (b) *Needs fixing*'s *checked {time}* is assigned to two reads; (c) 0.8 says six departures are inherited from the brief, which records three; (d) the tier type keeps a check status `not_current` and carries no check identity. CROSS-SPEC-INCONSISTENCY | Stories pick one reading each | As v2 |
| FINDING-22 | LOW | SR-5 | System design; home-ui; owner-shell; data-health-api; DEC-0219 | `system-design.md:345-346`; `component-design-home-ui.md:48-50`; `component-design-owner-shell.md:51-54`; `component-design-data-health-api.md:265-266`, `:317-318`, `:332`; harness `DEC-0219.md` (`status: open`, `owner_reviewed: false`) | Carried from v2, unchanged. The designs say DEC-0219 was withdrawn by the owner on 2026-10-25; the record still holds the agent's decision, open and unreviewed | A later owner review or blind triage can uphold a decision every design contradicts | The driver records the withdrawal on DEC-0219 with `scripts/sdd decisions` |
| FINDING-23 | MEDIUM | SR-2, SR-9 | System design; UX brief; UX design; ui-components; home-ui; data-health-ui; data-health-reader | `component-design-ui-components.md:251-257` (table: `latestTerminalDownload` null returns null; "any other `latestTerminalDownload` state: no tier"; `affectedCount` 0 good *Yes*), `:259-264` (rationale "While `latestTerminalDownload` is null no download has ever ended, so nothing has been acquired to judge"), `:458` (test); `system-design.md:400-402`, `:688-691`; `ux-brief.md:188`, `:207`; `ux-design.md:630-634`, `:781`, `:926`; `component-design-home-ui.md:174-178`, `:264`; `component-design-data-health-ui.md:345`, `:415-419`; `component-design-data-health-reader.md:136`, `:377-380`, `:501`; delivered `src/factorflow/db/migrations/0004_runs.sql:22-24` (`acquisition_run_terminal_has_end`); DEC-0210 `owner_decision` ("never-acquired replaces both with the empty state") | New, a residual of v2 FINDING-2. The resolution uses "no download has ever ended" for DEC-0210's *never-acquired*. The two differ when the first download ends *Cancelled by you* before anything is stored, for example cancelled while still `requested`: the schema gives every `cancelled` run an `ended_at`, so `latest_terminal_download` is set; `cancelled` contributes no tier and the problem set is empty, so `worstDataTier` answers good *Yes*. Home's tile then reads *Yes* beside *No scores yet*, and Data health's verdict reads *Yes. None of the {m} followed stocks needs attention.* above check cards that say *Nothing has been stored yet.* (`never_acquired` true). No test covers the case: `data-health-ui`'s empty-state test and `data-health-reader`'s never-acquired test use a download that failed | The landing screen and Data health answer "can the data be trusted" with *Yes* while nothing is stored: the absence of a detected problem presented as evidence of correctness (STD-UI-18, stricter-only), and the owner's never-acquired clause not met in this state | Key the no-answer on nothing having been acquired, not only on no download having ended: for example, also return no answer while attention's `prices_as_of` is null and no stock has a recorded outcome, or carry `never_acquired` on attention (a change to the provisional DEC-0200 shape). On Data health, treat `never_acquired` with an empty problem set as having no verdict. Correct `ui-components` 2.4's rationale, state the rule in system design 3.3 note 6 and constraint 4, and add a cancelled-first-download case to `worst-data-tier.test.ts`, `data-tile.test.tsx` and `data-health.test.tsx` |
| FINDING-24 | MEDIUM | SR-10, SR-3 | System design; UX brief; UX design; setup-ui; owner-shell | `system-design.md:309-315` (3.2 note 1: "a React state holder in `owner-shell`'s route tree above the `/setup` route"), `:600-607` (4.2 lists `Shell context` and `Screen registration` between `owner-shell` and `setup-ui`, no draft holder); `ux-brief.md:176` and `ux-design.md:495-496` ("a React state holder in the shell's route tree"); against `component-design-setup-ui.md:69-73`, `:84-88`, `:159-161`, `:288-291` ("this component owns and the shell mounts", "inside `ShellProvider` and outside the main region's route map, so neither a route change nor the unreachable state unmounts it") and `component-design-owner-shell.md:108-111`, `:184`; `docs/architecture.md` (no such interface) | New, a residual of v2 FINDING-1. `SetupDraftProvider` is a component `setup-ui` owns and `owner-shell` mounts, a cross-component interface like the `Screen registration` rows, but Section 4.2 does not list it, so the architecture inventory cannot see it. The system design, brief and UX design also place it "in the route tree above the `/setup` route", while the two component designs place it outside the route map and say why: the unreachable state replaces the route map, and a holder inside it is unmounted. CROSS-SPEC-INCONSISTENCY | A story built from the system design's wording can place the holder as a route wrapping `/setup`, which loses the owner's unsaved input on leaving `/setup` or while the product is unreachable, against DEC-0202's owner rule; the inventory omits an interface the shell's composition depends on | Add a `Setup draft provider` row to 4.2 (provider `setup-ui`, consumer `owner-shell`: the `SetupDraftProvider` component mounted inside `ShellProvider` and outside the route map), use the component designs' placement in 3.2 note 1, UX brief 2.3 and UX design 1.2, and regenerate `docs/architecture.md` |
| FINDING-25 | LOW | SR-6, SR-3 | Capability; UX brief; UX design; setup-ui | `Capability-CAP-003.md:154-156` (flow 1 step 7: "choosing *Add later* lets setup finish without a download"); against `Capability-CAP-003.md:234-235` (AC-2), `system-design.md:327-333`, `ux-brief.md:168`, `ux-design.md:523-531`, `component-design-setup-ui.md:260-272`, each citing "capability flow 1 step 7" beside "Setup stays incomplete"; DEC-0202 `owner_decision` | New. The designs cite flow 1 step 7 as the source of a rule that says the opposite of its words: under AC-2 and the owner's DEC-0202 rule, *Add later* lets the owner leave setup, and setup stays incomplete until a download is started. CROSS-SPEC-INCONSISTENCY | A test derived from the flow could expect `/` to open Home after *Add later* | Reword flow 1 step 7, for example "choosing *Add later* lets the owner continue to step 4 and leave setup without a download; setup stays incomplete until one is started (AC-2)" |
| FINDING-26 | LOW | SR-3, SR-2 | UX design; system design; UX brief; home-ui | `ux-design.md:639-641`, `:719`, `:746-747` (*The first download, started {start time}, is running.*; accessible name *Data: downloading. The first download, …*); `system-design.md:357`, `:405-406`; `ux-brief.md:188`, `:821`; against `component-design-home-ui.md:182-186` and `:264` (*Your first download, started …, is running.*), `:356-357` (accessible name without *downloading*); `ux-brief.md:758`, `:760` (`requested` *Queued*, `cancelling` *Stopping*) | New, a residual of v2 FINDING-2. The first-download-running sentence differs between `home-ui` (and its test) and the UX design, system design and brief, and so does the tile's accessible name. All four also render *started {requested_at}, is running* while the download is `requested` (*Queued*) and *is running* while it is `cancelling` (*Stopping*), the states in which the same designs withhold the *Downloading* badge because it is not running. CROSS-SPEC-INCONSISTENCY | The test and the screen authority disagree on copy; the sentence asserts a state the record does not hold (STD-UI-15) | Take the UX design's wording in `home-ui` 2.4, 7 and 10, and give the `requested` and `cancelling` states their own sentence (for example *requested {time}, waiting to start* and *stopping*) |
| FINDING-27 | LOW | SR-8, SR-6 | setup-ui; UX design; UX brief | `component-design-setup-ui.md:148` ("[14] … Start download disabled …"), `:217` ("Start download disabled with the no_active_instruments reason") against `:263` and `design-system/components/button/design-spec.md:34` (`blocked` "stays focusable … a plain `disabled` button is not focusable"); `component-design-setup-ui.md:392`, `ux-design.md:469`, `ux-brief.md:167` (step 4 titled *Download data for {n} stocks* with *Followed stocks* *{n}*, now reachable with *n* = 0); `ux-design.md:468` ("posts nothing Choosing", a missing full stop) | New, a residual of v2 FINDING-1. The blocked step 4 is a new designed state. `setup-ui`'s flowchart and sequence call its **Start download** "disabled", the variant the button spec says must not be used for a precondition; its text and the UX design say `blocked`. The step's heading and summary have no copy for *n* = 0, so they render *Download data for 0 stocks* above a button that cannot start | A story following the diagrams can ship an unfocusable control whose reason never reaches a keyboard or screen-reader user (STD-UI-24); the heading describes a download that cannot happen (STD-UI-2) | Say `blocked` in `setup-ui` 2.2 box 14 and the 2.3 sequence; give step 4 a heading for no followed stocks in the UX design 1.2 table and the two component tables; add the missing full stop |

---

## Traceability Matrix

Per-requirement verdicts (VER-EVD-004). "Traced" means the AC maps to a system
design element, a UX design element and a component design element, and the
component design's own test proves it.

| AC | System design | UX design | Component design(s) | Verdict |
|----|---------------|-----------|---------------------|---------|
| AC-1 | 4.1, 5.11; DEC-0204 | 0.2 | owner-shell 2.6, 2.7 | Traced |
| AC-2 | 3.1, 3.2 note 6 | 0.3, 1.2 | owner-shell 2.5; setup-ui 1, 2.3 | Traced, with FINDING-25 |
| AC-3 | 3.2 notes 1, 6 | 1.2 | setup-ui 2.2, 2.3 (`SetupDraftProvider`); owner-shell 2.1, 2.2 | Traced, with FINDING-24, -27 |
| AC-4 | 3.2, 5.10 | 1.2, 1.4, 1.9 | setup-ui; owner-web-app 2.3; ingestion-api 2.3 | Traced |
| AC-5 | 3.2 notes 2, 3 | 1.2, 1.6 | setup-ui 2.3 (DEC-0218); owner-web-app | Traced |
| AC-6 | 3.2 | 1.2 | setup-ui 10 | Traced |
| AC-7 | 3.2, 3.3 | 1.2, 1.3 | setup-ui; home-ui 2.5; ui-components 2.6 (DEC-0216); data-health-reader 2.6 | Traced |
| AC-8 | 3.3 boxes 6 to 10, 19 to 21 | 1.3 | home-ui 2.4 | Traced, with FINDING-23, -26; in the first-download window the tile shows none of AC-8's figures, by DEC-0210's never-acquired clause |
| AC-9 | 3.3 note 3 | 1.3 | ui-components 2.6; data-health-reader 2.7 | Traced |
| AC-10 | 5.11 | 1.3 | home-ui 3 | Traced |
| AC-11 | 3.4 note 8, constraint 4 | 1.4 | data-health-ui 2.3, 2.4; data-health-reader 2.5 | Traced, with FINDING-5, -7, -23 |
| AC-12 | 5.6 | 0.7, 1.4, 1.7, 1.8 | ui-components 2.3; owner-web-app 2.3 | Traced, with FINDING-14 |
| AC-13 | 3.4 | 1.4 | data-health-reader 2.4; data-health-ui 2.5 | Traced |
| AC-14 | 3.4 note 2 | 1.4 | data-health-reader 2.4; data-health-ui 2.5, 2.7 | Traced |
| AC-15 | 3.4 | 1.4, 1.5, 1.7 | data-health-ui 2.7; owner-web-app 2.3 | Traced, with FINDING-6 |
| AC-16 | 3.3 boxes 17, 18 | 0.2 | owner-shell 2.7; ui-components 2.6 | Traced |
| AC-17 | 3.5, 4.1, 5.2 | 1.5 to 1.9 | owner-web-app; ingestion-api | Traced |
| AC-18 | 3.1 note 4 | 0.3 | owner-shell 2.6; owner-web-app 2.1 (`SHELL_ROUTES`) | Traced, with FINDING-10 |
| AC-19 | 5.3 | 0.7 | owner-web-app 7 (vocabulary sweep); ui-components `labelOf` | Traced |
| AC-20 | 5.4 | 0.7 | ui-components 2.3 | Traced |
| AC-21 | 3.3 boxes 5, 20, 21; 3.4 note 7 | 1.3, 1.4 | home-ui 2.2, 2.4; data-health-ui 2.2, 10; data-health-reader 2.5, 2.6 | Traced, with FINDING-6, -8, -23 |
| AC-22 | 3.5; DEC-0207 | 1.1 | command-palette; owner-shell 2.7 | Traced |
| AC-23 | 3.1 note 3 | 0.5 | owner-shell 2.8 | Traced |
| AC-24 | 3.3, 3.4, 5.5 | States subsections | ui-components 2.7 `StateRegion`; each screen | Traced, with FINDING-8, -13 |
| AC-25 | 5.8, 5.13 | 0.4, accessibility subsections | owner-shell 2.4, 2.7; setup-ui 10; data-health-ui 2.6 | Traced, with FINDING-3, -27 |
| AC-26 | 4.1, 5.12 | every Component Mapping and Token Usage; 0.7 | ui-components; owner-shell 2.1 `layout.ts` | Traced, with FINDING-4 |
| AC-27 | 4.2 | 0.2, 0.3 | owner-shell 2.6; command-palette 2.3 | Traced |
| AC-28 | 5.7, 6.4 | none (not interface-facing) | data-health-reader 5, 7, 8; data-health-api 5, 7, 8 | Traced |

---

## Pipeline Readiness Assessment

**Verdict:** READY

No CRITICAL and no HIGH finding exists, which is the rubric's definition of
READY. Both of v2's HIGH findings are resolved in every artifact that carries
the rules, and the five residuals are MEDIUM or LOW.

READY does not mean nothing is open. Twelve MEDIUM findings stand: ten the
owner deliberately deferred (FINDING-3 to FINDING-12) and two new ones.
FINDING-23 is the one to fix before test design, because `ui-components` 2.4's
table states the *Yes* answer for a cancelled first download and a test
derived from it would encode that answer; it is one more row and one more
test case in each of three files. FINDING-24 should be fixed before story
generation reaches the setup and shell stories, so that no story places the
draft holder where the unreachable state unmounts it. FINDING-3 and FINDING-4
need an owner choice at the standard, which is one-way under
`docs/unattended-mode.md` and is therefore listed, not decided.

This verdict approves nothing. Every schema-versioned specification in scope
(all fourteen, `status: draft`) stays blocked from epic generation and test
design until the owner explicitly approves each revision with
`scripts/artifact-gate.py approve`, using this report as `--review-artifact`.
`docs/constitution/tech-stack.md` v6, which every subject pins, is approved
and passes `artifact-gate.py check`.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

None.

### Should Fix (MEDIUM findings)

1. **FINDING-23** — no *Yes* while nothing has been acquired, a cancelled
   first download included; test it.
2. **FINDING-24** — the `SetupDraftProvider` interface in 4.2, and one
   placement in all five artifacts.
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

13. **FINDING-13** to **FINDING-22** — v2's LOW findings, unchanged in
    substance (FINDING-15 narrowed to the stale pins; FINDING-20 with the new
    restamps).
14. **FINDING-25** to **FINDING-27** — capability flow 1 step 7's wording;
    the first-download-running sentence; the blocked step 4's control and
    heading.

---

## Open Questions for the Owner

Recorded instead of asked, because the run is unattended. None is a decision
this review took.

1. **FINDING-23:** which signal means *never acquired* on Home, where the
   aggregate is not read: attention's `prices_as_of` and the problem set, or
   a `never_acquired` field added to attention (a change to DEC-0200's
   provisional shape).
2. **FINDING-3:** show the rail chips' time, or amend STD-UI-25 (one-way).
3. **FINDING-4:** amend STD-UI-29 for approved layout dimensions, or route
   them through intake as tokens (one-way); and which governs the 70ch cap.
4. **FINDING-5:** which wording separates the verdict's count from the check
   cards' exceptions.
5. **DEC-0219** is open in the harness although the designs record it as
   withdrawn (FINDING-22).

## Unattended-Run Record

- Mode: unattended, delegated by `$design-run` (run `design-run-f106a0`) after
  the owner's direction resolved v2's two HIGH findings (c9382aa) and
  re-approved tech stack v6 (f45c9cb).
- Decided, not asked (run conditions, recorded here because the delegation
  permits writing only this report; the driver may record them as decisions):
  1. `check-prerequisites.sh` exited 2 (context 27 h old, window 24 h). The
     review proceeded without refreshing, as review v2 did: every finding rests
     on the specifications read directly from the checked-out branch at
     c9382aa, not on the context cache, and a refresh would write `cache/` and
     `logs/` and update repositories, which the delegation forbids.
  2. `pipeline-state.py` reported AWAITING-APPROVAL because no subject carries
     an approval. v2's `review_subjects` are bound to revisions that c9382aa
     replaced for eight of the fourteen subjects, so v2 is not current evidence
     for them; `design-next.py` names this re-review as the next step.
  3. v2's identifiers are kept for the carried findings and the new ones are
     numbered from FINDING-23, so the owner's deferred list keeps its numbers;
     the summary table counts only open findings.
- Abstentions: none. FINDING-3 and FINDING-4 name one-way choices for the
  owner; FINDING-23 names a choice of signal; this review makes none of them.
- Severity and verdict are review judgments under the rubric, not decisions
  under `docs/decision-records.md`. FINDING-23 is rated MEDIUM, not HIGH as
  v2 FINDING-2 was: v2 FINDING-2 covered the window every install passes
  through, and FINDING-23 a boundary of the resolution reached only by
  cancelling the first download before anything is stored, the calibration v2
  applied to its edge-case findings (FINDING-5, FINDING-6).
- Writes: this report only. No artifact, approval block, decision record,
  branch or commit was touched; the skill's closing discussion prompt was
  skipped; the driver commits the report.
