---
artifact_schema_version: 1
artifact_id: CAP-002-specification-review
artifact_type: specification-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-16
updated: 2026-10-16
document: spec-review-report
capability: CAP-002
version: v2
generated: 2026-10-17T00:21:30Z
constitutions_reviewed:
  - "CONST-AGT  docs/constitutions/agent-governance.constitution.md (2.3)"
  - "CONST-MDL  docs/constitutions/model-management.constitution.md (1.3)"
  - "CONST-OPS  docs/constitutions/operational-safety.constitution.md (1.3)"
  - "CONST-REV  docs/constitutions/review.constitution.md (1.4)"
  - "CONST-SA   docs/constitutions/static-analysis.constitution.md (2.0)"
  - "CONST-SEC  docs/constitutions/security.constitution.md (1.3, in force: content revision sha256:0f5659addf64eb6aff78fcc810f92673f348d7f8d943061cb5ca225fff15b0c7 equals the approval block's reviewed_revision; commit 3806017 is on the harness main)"
  - "CONST-VER  docs/constitutions/verification.constitution.md (1.2)"
mechanical_checks:
  - script: check-capabilities.py
    outcome: run
    result: "PASSED, exit 0: 2 capabilities, 6 edges (requires-runtime 2, conforms-to 4, blocked-by 0, requires-contract 0), 1 standard (STD-UI), 2 conformance claims, 1 constitution artifact, 2 references; integration layers CAP-001 then CAP-002; no error, no warning"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0: 2 designs, 19 components, 47 interfaces; no drift against docs/architecture.md, whose orphan section lists GET /api/classifications/summary with the unpublished consumer shell-home-and-data-health-ui (recorded by system design section 8 question 10) and CAP-001's Provider reads"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 244 warnings, exit 0 (--strict), 283 artifacts; CAP-002 warnings: Capability-CAP-002.md pins STD-UI v4 (current v6); classification-scheduler, factor-engine, research-store and universe-service pin CAP-002-system-design v1 (current v2); research-store and universe-service also pin CAP-002-ux-design v1 (current v2); none on the six refined artifacts"
  - script: check-references.py
    outcome: run
    result: "FAILED, exit 1: 1126 path references across 237 Markdown files; one dangling path, docs/ux/README.md (a project-repo path), cited by projects/factorflow-v2/decisions/DEC-0068.md:22, DEC-0072.md:21 and DEC-0080.md:15; no review subject is affected (recorded under Observations)"
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
  SR-8: "applied — design_system_available true; 32 component-variant pairs and 56 token names in the UX brief, UX design and classification-ui verified against design-system/; S03-1 to S03-7 and the blueprint review v4 findings touching S03 assessed"
  SR-9: "applied — dependency half and STD-UI conformance half by check-capabilities.py; capability section 5.4 against UX brief section 12.1 (STD-UI v6); tech-stack C2, C4, C5, C8 and OQ-TS-3; CONST-SEC 1.3 SEC-ENC-001 check (q) bookkeeping; AGT-SCOPE-002 composition edits"
  SR-10: applied
specifications_reviewed:
  capability_spec: docs/capabilities/CAP-002-universe-and-factor-classification/Capability-CAP-002.md
  system_design: docs/capabilities/CAP-002-universe-and-factor-classification/design/system-design.md
  ux_brief: docs/capabilities/CAP-002-universe-and-factor-classification/design/ux-brief.md
  ux_design_spec: docs/capabilities/CAP-002-universe-and-factor-classification/design/ux-design.md
  component_designs:
    - docs/capabilities/CAP-002-universe-and-factor-classification/design/component-design-classification-api.md
    - docs/capabilities/CAP-002-universe-and-factor-classification/design/component-design-classification-reader.md
    - docs/capabilities/CAP-002-universe-and-factor-classification/design/component-design-classification-scheduler.md
    - docs/capabilities/CAP-002-universe-and-factor-classification/design/component-design-classification-ui.md
    - docs/capabilities/CAP-002-universe-and-factor-classification/design/component-design-factor-engine.md
    - docs/capabilities/CAP-002-universe-and-factor-classification/design/component-design-research-store.md
    - docs/capabilities/CAP-002-universe-and-factor-classification/design/component-design-universe-service.md
review_subjects:
  - artifact_id: CAP-002
    artifact_version: 1
    content_revision: sha256:8a2706f314bf084b017d65d9a96a9ab3f9973106aa3e6fef3c34d7913741f629
  - artifact_id: CAP-002-system-design
    artifact_version: 2
    content_revision: sha256:66f9b2a0d32425c1fe0e74de0156858560babc0f070deffd6e187a2e38d0251b
  - artifact_id: CAP-002-ux-brief
    artifact_version: 2
    content_revision: sha256:7a1e0035a302a6aacd97c741f4030db9942655eef810d56f3554f77876206186
  - artifact_id: CAP-002-ux-design
    artifact_version: 2
    content_revision: sha256:6dab473445bd9352497ec4b57e4c1e749f38a4438cfee2efd0af96ee5d9ae268
  - artifact_id: CAP-002-component-design-classification-api
    artifact_version: 2
    content_revision: sha256:c6c685ae0a031e27bdf6fed44bae4361b917efb00db37c9ee9b91c5430d14737
  - artifact_id: CAP-002-component-design-classification-reader
    artifact_version: 2
    content_revision: sha256:b6cb4a06a1458192db3bcc65238c8314edc517701f5583436e29066d3649256f
  - artifact_id: CAP-002-component-design-classification-scheduler
    artifact_version: 1
    content_revision: sha256:fe4a952dcfeddc80497a33d6979ef319fab25ba3be7eadc9121c60452d083a24
  - artifact_id: CAP-002-component-design-classification-ui
    artifact_version: 2
    content_revision: sha256:5b6f490e4671134db8361c0f23b7e88f99b869fbe07d3ce72b0248e133f252b5
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
  total_findings: 34
  critical: 0
  high: 2
  medium: 21
  low: 11
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-17T00:21:30Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "2"
    - id: CAP-002-ux-brief
      version: "2"
    - id: CAP-002-ux-design
      version: "2"
    - id: CAP-002-component-design-classification-api
      version: "2"
    - id: CAP-002-component-design-classification-reader
      version: "2"
    - id: CAP-002-component-design-classification-scheduler
      version: "1"
    - id: CAP-002-component-design-classification-ui
      version: "2"
    - id: CAP-002-component-design-factor-engine
      version: "1"
    - id: CAP-002-component-design-research-store
      version: "1"
    - id: CAP-002-component-design-universe-service
      version: "1"
    - id: PRODUCT-UX
      version: "6 (approved 2026-10-16; context)"
    - id: PRODUCT-UX-S03
      version: "4 (approved 2026-10-16; acceptance checks S03-1 to S03-7)"
    - id: PRODUCT-UX-S01
      version: "4 (approved 2026-10-16; consumer context)"
    - id: PRODUCT-UX-S09
      version: "4 (approved 2026-10-16; consumer context)"
    - id: STD-UI
      version: "6 (approved 2026-10-16; context)"
    - id: tech-stack
      version: "5 (approved 2026-10-13; context)"
    - id: CONST-SEC
      version: "1.3 (in force; content revision sha256:0f5659addf64eb6aff78fcc810f92673f348d7f8d943061cb5ca225fff15b0c7)"
    - id: DEC-0052 to DEC-0080
      version: "open, decided_by agent, owner_reviewed false (context)"
    - id: specifications-review-report-v1
      version: "CAP-002 review v1, READY-WITH-WARNINGS (re-verified, not carried)"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Specification Review Report -- CAP-002

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-002 Universe & Factor Classification |
| **Version** | v2 (second review; v1 reviewed the v1 designs) |
| **Specifications Reviewed** | Capability v1 (draft, unchanged); system design v2; UX brief v2; UX design v2; component designs classification-api v2, classification-reader v2, classification-ui v2 (refined for PRODUCT-UX v6 and S03 v4) and classification-scheduler v1, factor-engine v1, research-store v1, universe-service v1 (unchanged) |
| **Total Findings** | 34: CRITICAL 0, HIGH 2, MEDIUM 21, LOW 11 |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

The alignment with the approved product UX blueprint did what it set out to do.
CAP-002 now delivers the blueprint's Research area: S03 at `/research` behind one
rail destination and the three restyled pages under `/research/*` (DEC-0068),
the blueprint's factor cell, inspector, selection tray, as-of line and status
labels (DEC-0072), the compare bound of 2 to 6 from the approved S03 (DEC-0070),
URL query state, a full-set match count, and a summary read for the shell
capability's Home and Data health screens. Every component and token the UX
artifacts name exists in the design system; the `data-table` `virtualised`
variant closes the STD-UI-30 gap v1 recorded, so v1 FINDING-7 is closed, and
v1 FINDING-16, FINDING-20 and FINDING-24 are closed too. Five of S03's seven
acceptance checks are satisfied outright.

Both HIGH findings of v1 stand, because the alignment did not touch the
computation or the scheduler and was not meant to. **FINDING-1**: at first
deployment the scheduler classifies every historical CAP-001 run, oldest first,
one permanent misattributed set per run, contradicting the research-store and
factor-engine designs. **FINDING-2**: the Massive line-item mapping, and whether
quarterly fourth-quarter statements exist, is unvalidated, so value and growth
cannot classify in production and the trailing-twelve-month derivation may have
to change.

The alignment introduced or exposed nine new MEDIUM findings, most at the seams
between the refined and the unrefined artifacts or between v2 additions that were
designed one at a time: the system design's `hide_incomplete` rule contradicts
the component designs (FINDING-3); the unchanged universe-service cannot carry
`hide_incomplete` into the saved snapshot (FINDING-4); saving while *Find a
stock* is active saves a different set than the header counts (FINDING-5);
thresholds silently drop incomplete stocks against the approved S03-1 (FINDING-6);
the first set is neither polled nor shown failed because three components give
the pre-first-set summary three shapes (FINDING-7); the download number S03 and
the UX design print does not exist (FINDING-8); appending the Research
destination breaks four delivered CAP-001 tests (FINDING-12); the capability's
STD-UI mirror disagrees with the brief's v6 record (FINDING-14); and the four
unchanged component designs pin superseded upstream versions (FINDING-15).

No finding is CRITICAL, so under the rubric the set is READY-WITH-WARNINGS. This
review recommends that FINDING-1 be corrected in a design revision, FINDING-2
answered by the owner, and FINDING-3, 4, 5, 7 and 15 corrected, before the owner
approves the reviewed revisions.

## Review Scope

All eleven specification artifacts resolved by `get-capability-specifications`
were read in full; `epics/` exists and is empty, and no `stories/` or `tests/`
content exists for CAP-002. Inputs read for conformance and context: the product
UX blueprint `docs/ux/product-ux-blueprint.md` (`PRODUCT-UX` v6, approved) §0 to
§4, §6 to §13 (with §2, §3, §4, §7, §8, §9, §10 and §12 D-8 read closely); the
screen specification `docs/ux/screens/S03-research.md` (v4, approved) in full;
the CAP-002 consumption in `S01-home.md` (§3, §5, §7, S01-6) and
`S09-data-health.md` (§3, §5, §7, §11); `docs/ux/README.md`; the product UX
review `docs/ux/specifications-review-report-v4.md` (status of FINDING-22, 23,
25, 32, 34, 42, 45, 54, 55, 56, 57); `docs/constitution/standards/ui-conventions.md`
(STD-UI v6, all thirty rules and §4); `docs/constitution/tech-stack.md` v5 (C1
to C11, key libraries, OQ-TS-3); the design system under `design-system/` (18
component specifications, `theme.css`, `component-map.json`, `intake.md`);
decision records `DEC-0052` to `DEC-0080`; review v1; and the delivered files the
designs or this review rely on (`src/factorflow/db/migrations/0004_runs.sql`,
`src/factorflow/api/models.py`, `web/src/app/shell*.test.tsx`,
`web/src/app/routes.test.tsx`, `web/src/screens/runs/detail/index.tsx`,
`tests/unit/test_api_isolation.py`, `tests/unit/test_api_no_secrets.py`).

Six artifacts changed since v1 (system design, UX brief, UX design,
classification-api, -reader, -ui); five did not (capability, scheduler,
factor-engine, research-store, universe-service), and their content revisions
equal v1's `review_subjects`. Every v1 finding was re-verified against the
current text rather than carried: the disposition is under "Disposition of Review
v1 Findings".

Context the driver supplied and this review judged rather than accepted: the
alignment's decision records DEC-0068 to DEC-0080 (two `kind: contradiction`,
following approved artifacts; the rest provisional, all `owner_reviewed: false`);
the six alignment recommendations the decomposition step reported against system
design v2 and did not apply, which the commit message `cff55b5` counts but does
not list (FINDING-28); this review found each of them independently and grades
them as FINDING-3 (hide-incomplete semantics and unscoped list scope), FINDING-4
(filter provenance carrying `hide_incomplete`), FINDING-7 (summary before the
first set), FINDING-8 (the download's visible identifier) and FINDING-16 (`name`
on stock rows, among the system design's other omissions); and four
`[REQUIRES INPUT]` abstentions, graded by what they block: the Massive line-item
mapping (FINDING-2, HIGH), the universe name length (FINDING-22, MEDIUM), the
download's visible number (FINDING-8, MEDIUM) and the capability's §5.1 row for
the *App shell & data health* capability with the summary read's consumer
identifier (FINDING-27, LOW; the unpublished consumer itself is handled as the
rubric requires and is not a finding).

The capability is `status: draft` with no approval block, as are all ten
designs; `docs/approval-gates.md` has design phases work on drafts and approval
follow this review, so draft status is not a finding.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All template sections present in all eleven artifacts; every diagram preceded by a narrative (nine diagrams in the refined designs counted: seven of three to five sentences, two of six, FINDING-29); data paths for every UX data element traced to a read (FINDING-9 gaps) |
| SR-2 Correctness | applied | ACs mutually consistent; error codes unique; read semantics checked for internal contradiction (FINDING-3, FINDING-6, FINDING-10) |
| SR-3 Consistency | applied | AC-to-design mapping; decomposition-to-system-design alignment; cross-spec comparison of entity names, fields, codes, routes and copy across the eleven artifacts, the blueprint and S03 (nine CROSS-SPEC-INCONSISTENCY findings) |
| SR-4 Testability | applied | Each AC checked for observable outcome, concrete input, boundary and measurability; each S03 check checked against the tests the designs plan |
| SR-5 Traceability | applied | System design §7 (23 ACs and S03-1 to S03-7), component §13 tables and UX design §5 traced; provenance pins and decision-record `artifacts` checked |
| SR-6 Clarity | applied | Vague-term scan of the capability; undefined references and open defaults in the designs |
| SR-7 Feasibility | applied | Circularity, single points of failure, timeouts, first deployment, first set, budget |
| SR-8 UX Completeness | applied | `design_system_available` true; five routes, eight states per region, component mapping and token usage verified, source mapping and design source present, AC traceability, EDG checklist; S03-1 to S03-7 and the blueprint review findings touching S03 |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` (no error, no warning); type, citation and placement of the three §5.1 rows and of the proposed fourth; STD-UI §5.4 against the brief's v6 record; tech-stack C2, C4, C5, C8, OQ-TS-3; CONST-SEC 1.3 check (q); AGT-SCOPE-002 composition edits |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` (19 components, 47 interfaces, no drift); §4.1 identifiers on every diagram box and sequence participant; every §4.2 row names a provider and a consumer component; the one consumer no design has published is written as an unpublished placeholder and recorded as §8 question 10, as the rubric requires; no capability identifier used as an actor in §1 to §5 |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, exit 0, PASSED; no error, no warning | none |
| `build-architecture.py -p factorflow-v2` | run, exit 0, PASSED: 2 designs, 19 components, 47 interfaces, no drift; the inventory's orphan section lists the summary read's unpublished consumer, which system design §8 question 10 records | none (SR-10 satisfied by the open question) |
| `check-artifacts.py -p factorflow-v2 --strict` | run, exit 0, PASSED with 244 warnings over 283 artifacts | FINDING-14 (capability pins STD-UI v4), FINDING-15 (four component designs pin system design v1, two also UX design v1) |
| `check-references.py` | run, exit 1: one dangling path in three harness decision records | none against a subject; recorded under Observations |
| `check-constitutions.py` | run, exit 0, PASSED: 10 constitutions, 36 skills | none |

All five ran from the harness checkout at `/Users/alvarodejodra/Projects/ai-agents`
(branch `main`, `da3b58b`), where `repos/` lives. That checkout's scripts predate
the design-run branch; of the five, only `check-artifacts.py` differs on that
branch, and the difference (recognising `ux-blueprint` and `ux-screen-spec`
artifacts and `docs/ux/` reviews) touches no CAP-002 subject.

Supplementary evidence gathered fresh in this session:

- `bash scripts/check-prerequisites.sh --project factorflow-v2`: exit 0, every
  check PASSED (the first attempt inside the sandbox failed on a bash 3.2
  here-string temp file; rerun outside it, read-only).
- `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --stage specification-review`
  before writing: `AWAITING-APPROVAL` (exit 1), because review v1 exists and
  nothing is approved; it also reports the four unchanged component designs'
  upstream pins as stale (FINDING-15). This v2 review ran on the driver's
  direction, since six reviewed revisions changed after v1.
- `python3 scripts/artifact-gate.py revision` for all eleven subjects (values in
  `review_subjects`; the five unchanged equal v1's), and with `--repo-dir .` for
  `docs/constitutions/security.constitution.md`: `sha256:0f5659ad…b0c7`, equal to
  its approval block, commit `3806017` on `main` and `origin/main`.
- Design-system verification: every component-variant pair named by the UX
  brief, UX design and classification-ui (32 pairs, from `data-table`
  `virtualised`, `expandable`, `history` to `toast` `success`, `info`, `error`)
  exists in its `design-spec.md`; every token named (56 distinct names) exists in
  `design-system/theme.css`, the four non-matches being family prefixes
  (`--factor-*`, `--risk-*`, `--seq`, `--status-<tier>`).
- Schema and code checks: `acquisition_run.run_id` is `uuid`
  (`0004_runs.sql:2`); `GET /api/health` carries `most_recent_run`
  (`src/factorflow/api/models.py:46`); the delivered shell tests
  `web/src/app/shell.test.tsx:71`, `shell.a11y.test.tsx:36`,
  `routes.test.tsx:75` and `shell.unreachable.test.tsx:58` each assert exactly
  four navigation items.
- Narrative sentence counts for the nine diagrams in the refined designs.

## Constitutions Applied

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | AGT-AUTH-002: every decision class surfaced as a decision record or `[REQUIRES INPUT]`. AGT-AUTH-003: the alignment's disagreements with the system design are flagged in component §14, but three of six recommendations are recorded nowhere and two citations point at a "decomposition report" that does not exist (FINDING-28). AGT-SCOPE-002: the composition edits to delivered CAP-001 files rest on a provisional reading (FINDING-13) and are understated (FINDING-12). AGT-SCOPE-005: composite and backfill rules bind M4 and are surfaced (system design §8 question 9); the capability leaves the arithmetic undefined (FINDING-21). AGT-EVIDENCE-002: quantitative values are cited (S03, blueprint, DEC records, component specifications) or marked; the one value printed without a source is the download number (FINDING-8). AGT-PROV-001: blocks present; two v2 timestamps postdate their commits (FINDING-34) |
| CONST-MDL 1.3 | No product model usage; provenance model fields present (MDL-PIN-003). Nothing else engaged |
| CONST-OPS 1.3 | OPS-MIG-001/002/003: additive migrations with explicit strategy and dump-and-restore rollback, one unsupported citation (FINDING-33). OPS-ERR-001: failures are logged and recorded; a scheduler failing every iteration only logs and leaves the owner's screen unmarked (FINDING-10). OPS-DEST: no destructive operation specified |
| CONST-REV 1.4 | This report is two-stage (Stage 1 and Stage 2 below) and verifies each upstream claim against the artifacts: DEC-0079 (f)'s "without an edit" (FINDING-4), DEC-0069's "nothing else in the shell is edited" (FINDING-12) and the UX design's S03-1 trace (FINDING-6) were checked and found not to hold |
| CONST-SA 2.0 | SA-MD-002: one dangling reference in harness decision records (Observations) and a citation to a non-existent decomposition report (FINDING-28). SA-MD-003: placeholders use `[REQUIRES INPUT]`. SA-DUP-001: the summary read keeps the current-set and current-stock rules in one place; the append-only guard reuse is not implementable as written (FINDING-17). SA-DEAD-002: no TODO or TBD |
| CONST-SEC 1.3 (in force) | SEC-AUTH-001 non-engagement inherited (capability §5.3). SEC-INP-001: universe name unbounded (FINDING-22); every other new parameter (`hide_incomplete`, `symbols` 2 to 6, the twelve bounds, `symbol` prefix) is bounded. SEC-INP-002: allowlisted sort, parameterised SQL, `LIKE` escaping. SEC-DAT-001: Internal throughout. SEC-ERR-001: exception text in `failure_reason` reaches API responses and the screen (FINDING-11). SEC-ENC-001 host-local loopback exception: no channel, bind or port added; H9 covered on the new routes by tests the api design plans; check (q) incomplete for five component designs (FINDING-19). SEC-AUD-001: no listed event class |
| CONST-VER 1.2 | All five mechanical checks and the supplementary checks ran in this session; the Traceability Matrix gives a per-AC verdict and the S03 table a per-check verdict (VER-EVD-004) |

---

## Stage 1 -- Specification Compliance

The system design maps all 23 acceptance criteria and all seven S03 checks, and
the component designs map every one they own. The capability's owner decisions
(factor definitions, 30-stock threshold, 6-month and latest-trading-day rules,
5-minute budget, no empty universe) are carried exactly. Against the approved
blueprint and S03, the refined designs follow every route, destination, pattern,
label, tier and bound the approved artifacts fix, and record their departures
(search, the renderings S03 leaves unspecified, the restatement mark's
composition, placements) as decisions. Fidelity breaks in six places: the
first-deployment semantics of "every run that ends succeeded or partial"
(FINDING-1), the threshold behaviour S03-1 forbids (FINDING-6), the saved
snapshot's equality with the displayed result under search and hide-incomplete
(FINDING-4, FINDING-5), the first set's currency and failure (FINDING-7,
FINDING-10), universe members with no row in the current set and the as-of view
(FINDING-9), and the capability's own STD-UI mirror (FINDING-14).

## Stage 2 -- Artifact Quality

Structure, narratives, traceability tables, test plans and security sections are
complete in every artifact. Quality defects are drift between the system design
and its decomposition (FINDING-3, FINDING-16), refined designs that rely on an
unrefined one without changing it (FINDING-4, FINDING-15), contract shapes that
disagree across three components (FINDING-7), copy that prints a value the data
model lacks (FINDING-8), understated edits to delivered code (FINDING-12),
owner-facing exception text (FINDING-11), unrecorded review recommendations
(FINDING-28), over-long narratives (FINDING-29) and provenance timestamps later
than their commits (FINDING-34).

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability; no finding.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py`: no error, no warning. By hand:

- **CAP-001 `requires-runtime`**: type, citations and placement correct, as in
  v1; unchanged.
- **Non-dependencies** (§5.2) correctly placed.
- **`tech-stack.md` `conforms-to`**: C2, C5 and C8 honoured; C4 still not
  addressed (FINDING-18); `hypothesis` cited to a tech stack that does not list
  it (FINDING-30); OQ-TS-3 closed only provisionally (FINDING-23).
- **STD-UI `conforms-to`**: all 30 rules accounted for; no specialization of a
  `none` or `stricter-only` rule. The table now disagrees with the brief's v6
  record on STD-UI-1, STD-UI-7 and STD-UI-12 and pins STD-UI v4 (FINDING-14);
  the v1 disagreement on STD-UI-30 is resolved.
- **The proposed row for the *App shell & data health* capability** (the
  designs' abstention): the designs suggest `requires-runtime`; under type
  correctness and placement no CAP-002 row is needed (FINDING-27).

#### Completeness (SR-1)

No finding. Description, scope, six flows with failure branches, 23 ACs, NFRs,
constraints, assumptions and readiness are present.

#### Correctness (SR-2)

No finding. The ACs do not contradict one another.

#### Testability (SR-4)

- FINDING-21: "standardised score" and non-positive bases are undefined, so
  AC-7, AC-9 and AC-12 are testable only against agent decisions.

#### Clarity (SR-6)

- FINDING-21 (above). "A few chosen stocks" (§2, flow 4 step 3) is now bounded
  at 2 to 6 by the approved S03 (DEC-0070); v1 FINDING-16 is closed at design
  level.

### System Design Specification

- **SR-1**: complete; the three diagrams carry 5, 5 and 4 sentence narratives.
- **SR-2**: error codes unique; FINDING-3 (`hide_incomplete` as "any factor
  `not_classified`" empties the list whenever one factor is unranked).
- **SR-3**: FINDING-3; FINDING-4 (§4.2 and §4.4 filter without
  `hide_incomplete`); FINDING-7 (summary shape before the first set);
  FINDING-10 (constraint 11 narrower than AC-20); FINDING-16 (drift from the
  decomposition); FINDING-31 (`GET /api/instruments` declared for a consumer that
  does not use it).
- **SR-5**: all 23 ACs and S03-1 to S03-7 traced in §7; FINDING-24 (assumption
  8, "nothing else"); FINDING-30.
- **SR-7**: FINDING-1 (§3.1 steps 5 and 21); FINDING-2 (§6 assumption 1, §8
  question 1).
- **SR-9**: FINDING-18 (C4); FINDING-23 (OQ-TS-3); FINDING-13 (§8 question 4);
  FINDING-27 (§8 question 10 (a)).
- **SR-10**: no finding. Section 4.1 declares seven component identifiers;
  every diagram box and sequence participant carries one; every §4.2 row names a
  provider and a consumer component; the summary read's second consumer is the
  placeholder `shell-home-and-data-health-ui (unpublished)` with §8 question 10
  recording the missing identifier, which is what the rubric asks of a
  cross-capability reference whose design does not exist.

### Component Design Specifications

- **classification-api (v2)**: FINDING-4 (`Thresholds.hide_incomplete` relies on
  universe-service carrying it); FINDING-5 (`Thresholds` has no prefix);
  FINDING-7 (`ClassificationSummaryResponse` before the first set); FINDING-8
  (§10, §14 question 5); FINDING-12 (no-secrets test, "no other delivered file");
  FINDING-13; FINDING-19; FINDING-22; FINDING-25 (`extra="forbid"` against "the
  scope").
- **classification-reader (v2)**: FINDING-3 (§2.5, §14 question 2); FINDING-6
  (threshold predicate and its test); FINDING-7 (`Summary.later`); FINDING-9
  (`EXISTS` scope, no member-list operation); FINDING-10 (`current_set.sql`);
  FINDING-17 (§3 claim about the guard); FINDING-28 ("decomposition report");
  FINDING-29 (§2.2 narrative).
- **classification-ui (v2)**: FINDING-5 (save posts thresholds and
  `hide_incomplete` only); FINDING-7 (`ClassificationSummary` type, poll start);
  FINDING-8 (*download {run_id}* against its own §10); FINDING-9 (Members tab,
  *Member since*, as-of view); FINDING-10 (poll stop rule against its sequence
  diagram); FINDING-12 (shell tests); FINDING-26 (origin through the events
  read); FINDING-28; FINDING-29 (§2.3 narrative); FINDING-31.
- **classification-scheduler (v1)**: FINDING-1; FINDING-15; FINDING-19;
  FINDING-20; FINDING-34.
- **factor-engine (v1)**: FINDING-1 (§6); FINDING-2; FINDING-11; FINDING-15;
  FINDING-17; FINDING-19; FINDING-21; FINDING-30; FINDING-34.
- **research-store (v1)**: FINDING-1 (§6); FINDING-4 (provenance comment);
  FINDING-15; FINDING-17; FINDING-19; FINDING-33; FINDING-34.
- **universe-service (v1)**: FINDING-4 (signature, `Origin`, test); FINDING-9
  (`Member` has no cells or name); FINDING-15; FINDING-32; FINDING-34.
- **SR-7, all components**: no circular dependency (scheduler to engine to
  stores; API to service and reader; reader to the universe replay SQL; the
  summary read adds a reader function, not an edge). The single build slot is
  protected by DEC-0067's reclaim, which the system design still does not carry
  (FINDING-16).

### UX Brief

- **SR-8**: every route the blueprint's §10 M1 row assigns CAP-002 is claimed;
  S03's view model is mapped field by field to the reads; eight states per
  region; the STD-UI-12 tier table follows blueprint §8 (DEC-0072); accessibility
  is specified; every component proposed exists. FINDING-5 and FINDING-25 (§2.1
  item 6, the save's content); FINDING-8 (§2.1 item 1, *download #{n}*);
  FINDING-11 (§3 and §8 claim no exception reaches the owner); FINDING-14 (§12.1
  disagrees with capability §5.4, which the brief itself flags).

### UX Design Specification

- **SR-8**: starts from S03 as blueprint §0 requires; every brief screen has a
  section; component mapping complete and every variant exists; tokens all
  exist; source mapping table and design source present (Path B, *Generated from
  UX brief, starting from PRODUCT-UX-S03*); all 23 ACs and S03-1 to S03-7 in the
  traceability tables; EDG checklist present; no component-spec gap. FINDING-5
  (save under search); FINDING-6 (S03-1 trace); FINDING-7 (never-populated state);
  FINDING-8 (*download #412*); FINDING-9 (*Member since*, as-of view); FINDING-11
  (*{failure_reason as recorded}*); FINDING-25; FINDING-26; FINDING-32 (Name
  sortable).

### Cross-Specification Consistency (SR-3)

- CROSS-SPEC-INCONSISTENCY: first set after deployment (research-store §6,
  factor-engine §6) against the backlog (scheduler §6; system design §3.1 step
  21) (FINDING-1).
- CROSS-SPEC-INCONSISTENCY: `hide_incomplete` "any factor `not_classified`"
  (system design §3.3 step 15, §4.2; DEC-0071) against input reasons only
  (reader, api, ui; DEC-0079) (FINDING-3).
- CROSS-SPEC-INCONSISTENCY: the saved filter and its provenance without
  `hide_incomplete` (system design §4.2, §4.4; universe-service §2.3, §2.4)
  against `Thresholds.hide_incomplete` and `origin.hide_incomplete` (api, reader,
  ui, UX design) (FINDING-4).
- CROSS-SPEC-INCONSISTENCY: the summary before the first set (api §2.7 `set`
  carrying `not_current`; reader `Summary.later`; ui `ClassificationSummary`
  without either) (FINDING-7).
- CROSS-SPEC-INCONSISTENCY: *download #{n}* (S03 §3, UX brief, UX design, ui §10)
  against *download {run_id}* (ui §2.6, DEC-0079) and a `uuid` `run_id`
  (FINDING-8).
- CROSS-SPEC-INCONSISTENCY: SEC-ERR-001 posture "inherited from ingestion-api
  §2.3" (system design §3.1 step 25) against `failure_reason` carrying exception
  text to the screen (FINDING-11).
- CROSS-SPEC-INCONSISTENCY: capability §5.4 against UX brief §12.1 on STD-UI-1,
  STD-UI-7 and STD-UI-12 (FINDING-14).
- CROSS-SPEC-INCONSISTENCY: system design §4.2 and constraint 10 against the
  decomposition's contract and DEC-0067 (FINDING-16).
- CROSS-SPEC-INCONSISTENCY: system design §4.4 and reader §3 ("every `.sql`
  file", "over `src/factorflow/`") against research-store §2.5 (migrations only)
  (FINDING-17).

### Screen Specification Acceptance Checks (S03)

`docs/ux/README.md` has specification review check the design against the
screen specification's acceptance checks. Verdict per check:

| Check | Verdict | Evidence |
|-------|---------|----------|
| S03-1 incomplete stocks listed unless hidden | PARTIAL | Listed by default and hidden only by the checkbox, which the components correctly limit to input reasons (reader §2.5); but a stock incomplete on a factor that carries a threshold is excluded with the checkbox off, against S03-1's text and the S03 §3 helper (FINDING-6); the system design's rule would hide every stock while one factor is unranked (FINDING-3) |
| S03-2 match count over the full set | PASS, with FINDING-9 | `match_count` is `count(*)` over the `matched` CTE before keyset and limit (reader §2.5), tested at 120 rows over pages of 50 and at 3000 end to end; under a universe scope a member with no row in the current set is silently uncounted (FINDING-9) |
| S03-3 inputs' as-of in the inspector | PASS | `factor_input.as_of` and `known_on` on the stock read; the inspector line per factor (UX design §1.1 item 3; ui §2.5) |
| S03-4 no percentile below 30 qualifying stocks | PASS | `classification_set_factor.ranked`; every cell *Not enough to rank* and the header count once (UX design §1.1; ui §2.5) |
| S03-5 filters, sort and scope survive reload and back | PASS | `research-query.ts` round-trip codec; every filter a URL key and a request parameter (ui §2.4, §7) |
| S03-6 restatement mark on the percentile in results and inspector | PASS (provisional form) | `restated_possible` on every read; the mark as a composition with its words as text (DEC-0075, a recorded departure from blueprint §4.4's component, awaiting the owner) |
| S03-7 save every matching stock, membership kept | PARTIAL | The snapshot is server-side against the named set with the same predicate as the list (reader `evaluate_filter`), blocked at zero matches (DEC-0076); but it diverges from the displayed result when *Find a stock* is active (FINDING-5), depends on `hide_incomplete` reaching universe-service, which as designed does not carry it (FINDING-4), and is withheld under a universe scope without a recorded departure (FINDING-25) |

### Product UX Review v4 Findings Touching S03

The blueprint's review left these open; the CAP-002 designs claim to resolve
several as recorded departures. Assessment:

| UX review v4 finding | Claimed by CAP-002 | Assessment |
|----------------------|--------------------|------------|
| FINDING-22 no search on the 3000-row list | DEC-0074, *Find a stock* | Resolved for CAP-002 as a recorded, provisional departure from S03 §3; STD-UI-30 is discharged at capability level (blueprint §11 claims search). Introduces FINDING-5 at the save |
| FINDING-23 no rendering for retired stocks, score-update failure, download in the as-of line | DEC-0073 | Retired (*Not followed*) and failure (*Score update failed*, critical banner) resolved; v1 FINDING-24's retired-after-set case is now specified. The download's identifier is not (FINDING-8), and a failed first set is not rendered (FINDING-7) |
| FINDING-25 restyled routes without a source | UX brief §2.3 to §2.6, UX design §1.3 to §1.6 | Resolved for CAP-002. S03 §11 still cites "the *Marks* column from the CAP-002 design", which v2 no longer has; that citation is the screen specification's to fix |
| FINDING-32 two definitions of *current* | DEC-0071 (current = no `missing` or `outdated` input, AC-13) | Resolved on CAP-002's side; S09's *Stale* rule is the shell capability's. S09's *Incomplete* count and named exceptions are not carried (FINDING-24) |
| FINDING-34 the 2 to 6 is unsourced | DEC-0070 treats it as binding | Correct treatment: an approved artifact binds; sourcing it is the blueprint's |
| FINDING-42 no completion confirmations | DEC-0076 toasts | Resolved |
| FINDING-45 holdings line not tagged M2 | Holdings line and *Start a strategy* absent, not disabled | Resolved for CAP-002 |
| FINDING-54 S05 cannot carry S03's measure and direction | Deferred as M2's | Correctly deferred: *Use in a strategy* is absent in M1 |
| FINDING-55 save at zero matches and incomplete membership | DEC-0076 | The rules are specified (blocked at zero; incomplete stocks on unthresholded factors are members; hidden stocks are not); equality with the display is broken by FINDING-4 and FINDING-5 |
| FINDING-56 the *R* badge's accessible-name override | DEC-0075, a composition | Resolved as a recorded, provisional departure from blueprint §4.4's component; the owner may prefer a mark component through `intake.md` |
| FINDING-57 canvas differences unlisted | none | Not CAP-002's: the screen specifications' own; CAP-002 takes nothing from the canvas |

### Disposition of Review v1 Findings

| v1 finding | v1 severity | Status in v2 | v2 finding |
|------------|-------------|--------------|------------|
| v1 FINDING-1 first-deployment backlog | HIGH | Open, unchanged (scheduler, research-store, factor-engine unchanged; system design §3.1 steps 5, 21 unchanged) | FINDING-1, HIGH |
| v1 FINDING-2 line-item mapping | HIGH | Open, unchanged (system design §6 assumption 1, §8 question 1 abstained) | FINDING-2, HIGH |
| v1 FINDING-3 not-current definition | MEDIUM | Open; the ui poll rule now contradicts its own diagram | FINDING-10 |
| v1 FINDING-4 members with no row in the current set | MEDIUM | Open and extended (as-of view, *Member since*, compare capped at 6) | FINDING-9 |
| v1 FINDING-5 exception text to the owner | MEDIUM | Open (factor-engine unchanged; UX design §1.2 renders it) | FINDING-11 |
| v1 FINDING-6 append-only guard coverage | MEDIUM | Open (research-store unchanged; reader §3 repeats the claim) | FINDING-17 |
| v1 FINDING-7 STD-UI-30 `yes` against `partial` | MEDIUM | Closed: both now `yes`, discharged by `data-table` `virtualised`. A new disagreement on STD-UI-1, -7 and -12 replaces it | FINDING-14 |
| v1 FINDING-8 C4 not addressed | MEDIUM | Open | FINDING-18 |
| v1 FINDING-9 DEC-0058 `artifacts` | MEDIUM | Open (five component designs cite the exception) | FINDING-19 |
| v1 FINDING-10 build timeout | MEDIUM | Open (scheduler unchanged) | FINDING-20 |
| v1 FINDING-11 capability arithmetic | MEDIUM | Open (capability unchanged) | FINDING-21 |
| v1 FINDING-12 universe name length | MEDIUM | Open (abstained) | FINDING-22 |
| v1 FINDING-13 AGT-SCOPE-002 reading | MEDIUM | Open; now DEC-0069 with one destination | FINDING-13 |
| v1 FINDING-14 OQ-TS-3 | MEDIUM | Open | FINDING-23 |
| v1 FINDING-15 system design drift | MEDIUM | Open and extended | FINDING-16 |
| v1 FINDING-16 "a few" unquantified | LOW | Closed at design level by DEC-0070 (approved S03 §6) | none |
| v1 FINDING-17 `hypothesis` citation | LOW | Open | FINDING-30 |
| v1 FINDING-18 unused `GET /api/instruments` | LOW | Open | FINDING-31 |
| v1 FINDING-19 universe name sort | LOW | Open | FINDING-32 |
| v1 FINDING-20 "above" for an inclusive bound | LOW | Closed: v2 copy says *at least* and *at most* throughout | none |
| v1 FINDING-21 rollback citation | LOW | Open (research-store unchanged) | FINDING-33 |
| v1 FINDING-22 R1 to R7 unrecorded | LOW | Open in new form: six alignment recommendations unrecorded | FINDING-28 |
| v1 FINDING-23 delivered API test files | LOW | Open and merged into a wider finding with the shell tests, raised to MEDIUM | FINDING-12 |
| v1 FINDING-24 retired after the set was built | LOW | Closed: DEC-0073 renders a stock no longer followed as *Not followed* on every factor in its universes | none |
| v1 FINDING-25 provenance timestamps | LOW | Open and extended to two v2 artifacts | FINDING-34 |

---

## Findings Summary Table

CRITICAL 0 · HIGH 2 · MEDIUM 21 · LOW 11 · **total 34**

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-7, SR-3 | classification-scheduler; research-store; factor-engine; system design | scheduler §2.4 (`qualifying_run.sql`), §5 "Backlog", §6 "Behaviour change after upgrade"; research-store §6 "Data migration"; factor-engine §6; system design §3.1 steps 5 and 19 to 21 | Carried from v1, untouched by the alignment: every CAP-001 run that ended `succeeded` or `partial` before deployment qualifies, and the scheduler claims them oldest first, one set per run, each dated the day it is built; the research-store and factor-engine designs say the first set follows the first qualifying run after deployment | First deployment appends one permanent set per historical run to C5 history, each naming an old `run_id` while computed from the store as it stands that day (AC-21 misstated); a run ending during the backlog waits behind it (AC-11); implementing either reading leaves the other designs wrong | Decide in the system design which runs qualify (for example only the latest qualifying run without a set, superseding older unclassified runs) at first deployment and whenever several wait; align scheduler, research-store and factor-engine §6 and record the choice |
| FINDING-2 | HIGH | SR-7, SR-1 | factor-engine; system design; capability | system design §6 assumption 1, §8 question 1 (abstained); factor-engine §2.3 step 3, §2.4 `LINE_ITEMS`, §14 question 1; capability §6 assumption 1 | Carried from v1: the payload keys and sign conventions of the seven line items, and whether a quarterly statement exists for every fiscal quarter including the fourth, are unvalidated; the fixtures hold four balance-sheet keys | Until answered every value and growth input is `missing`, so two of three factors never classify in production and AC-7, AC-9 and AC-23 are demonstrable for momentum only; if fourth-quarter figures exist only in annual statements, DEC-0055 (1)'s trailing-twelve-month derivation itself must change | Owner: answer §8 question 1 against statements from a real Financials run, including quarterly Q4; revise DEC-0055 (1) and the engine's statements stage if needed, before the value and growth stories are planned |
| FINDING-3 | MEDIUM | SR-3, SR-2 | system design; classification-reader; classification-api; classification-ui; DEC-0071 | system design §3.3 step 15 and §4.2 `GET /api/classifications` (`hide_incomplete`: "exclude stocks with any factor `not_classified`"); DEC-0071 decision (1); reader §2.5 "Hide incomplete" and "Scope", §3, §14 question 2; api §3, §14 question 4; ui §3, §14 question 4; `docs/architecture.md` row `GET /api/classifications` | CROSS-SPEC-INCONSISTENCY: the system design and DEC-0071 exclude stocks with any factor `not_classified`; the three component designs exclude only input reasons (`input_missing`, `input_outdated`, `input_not_computable`), never `not_enough_stocks` or `retired` (DEC-0079). The components also restrict the unscoped list to `lifecycle = 'active'`, which the system design does not state | Read literally, the system design's rule empties the list whenever one factor has fewer than 30 qualifying stocks (AC-14), the expected production state while FINDING-2 is open, and hides retired members under a universe scope; epic generation, test design and the generated inventory read the system design's wording | Amend system design §3.3 step 15, §4.2 and DEC-0071 to the component designs' rule and state the unscoped list's scope (owner verdict on DEC-0079 (a) and (b)) |
| FINDING-4 | MEDIUM | SR-3, SR-5 | system design; universe-service; research-store; DEC-0079; DEC-0076 | system design §4.2 `POST /api/universes` (`"filter": {thresholds}`), §4.4 `filter_provenance` "(thresholds and `set_id`)"; universe-service §2.3 `create_from_filter(..., thresholds: dict[str, Decimal])` and `Origin` (`kind`, `set_id`, `thresholds`), §2.4 event table, §7 "Filter snapshot equals the reviewed result"; research-store `COMMENT ON COLUMN universe_event.filter_provenance`; api §2.4, §2.7 `origin.hide_incomplete`; DEC-0079 (f); DEC-0076 `artifacts` | CROSS-SPEC-INCONSISTENCY: S03-7's snapshot equality now depends on `hide_incomplete` travelling in the saved filter and its provenance (DEC-0076), but the system design and the unchanged universe-service type the filter as a map of Decimal bounds, return an `Origin` without `hide_incomplete` or the scores' date, and test provenance as thresholds plus `set_id`. DEC-0079 (f) asserts universe-service carries it "without an edit"; DEC-0076 does not name universe-service among its artifacts | A story written from universe-service as designed drops `hide_incomplete`, saving stocks the owner hid, and the origin line cannot say *stocks with an incomplete score hidden*; the snapshot is append-only history | Revise universe-service (accept the reader's `Thresholds`, add `hide_incomplete` and the scores' date to `Origin`, test them) and system design §4.2 and §4.4; add universe-service to DEC-0076's artifacts |
| FINDING-5 | MEDIUM | SR-3, SR-8 | classification-ui; UX design; UX brief; classification-api; classification-reader | ui §2.4 (`ResearchQuery` holds the `symbol` prefix), §2.7 (the save posts the thresholds and `hide_incomplete`); UX design §1.1 Filters item 1 and "Saving the result as a universe"; UX brief §2.1 items 3 and 6; api §2.4 `Thresholds` (`extra="forbid"`, no prefix); reader §2.3 `evaluate_filter(conn, set_id, thresholds)`; DEC-0074; DEC-0076 | *Find a stock* narrows the list and its `match_count` through the `symbol` prefix, but the save posts only thresholds and `hide_incomplete`, and neither the API model nor `evaluate_filter` accepts a prefix. With a search active, **Save these {n} as a universe…** saves every stock matching the thresholds, not the {n} the header and the dialog name; no artifact blocks or adapts the save during a search | S03-7 and DEC-0076's "the saved members are exactly the stocks the results header counts" fail whenever the owner searches before saving, writing unintended membership into append-only history; the planned e2e check does not exercise search | Carry the prefix in the snapshot (add it to `Thresholds`, `evaluate_filter` and the provenance) or render the save `blocked` with its reason while a search is active; add the case to the reader, API and e2e tests |
| FINDING-6 | MEDIUM | SR-8, SR-2 | system design; classification-reader; UX design; UX brief | S03 §10 S03-1 and §3 helper (*They're shown by default so nothing disappears silently.*); system design §3.3 step 15; reader §2.5 "Thresholds" and §7 "Thresholds exclude incomplete on that factor"; UX design §5 S03-1 row and §4 EDG departures; UX brief §2.1 item 6; blueprint §1 principle 5 | The approved S03-1 lists a stock with any incomplete factor unless the checkbox is on. The designs exclude a stock incomplete on any factor that carries a threshold even with the checkbox off, and the UX design traces S03-1 as satisfied without that exception; the departure appears only inside DEC-0071 and DEC-0076's derivations, not in the UX design's list of departures from S03 | With a threshold set, incomplete stocks leave the list unannounced, so the approved helper sentence describes behaviour the product does not have (STD-UI-2) and blueprint principle 5 (*A screen never silently drops a row*) is unmet; a test written from S03-1 fails against the reader | Owner: amend S03-1 and the helper through the PRODUCT-UX change process, or keep such stocks listed, or state the number excluded for being incomplete on a filtered factor beside the count (blueprint §4.10 *Partial*); then align the reader test and the UX design's trace |
| FINDING-7 | MEDIUM | SR-3, SR-8 | classification-api; classification-reader; classification-ui; UX design; system design | api §2.7 `ClassificationSummaryResponse` ("`set` carries the building set's identity in `not_current`" while `never_classified`); reader §2.3 `Summary` (`set` None plus a separate `later`) and `ClassificationPage` (no `later`); ui §2.4 `ClassificationSummary` (`set` of non-nullable `CurrentSet` fields or null, no `later`), §2.6 poll start rule; UX design §1.1 States "Empty, never populated", §1.2; system design §3.3 step 14, §4.2 summary row | CROSS-SPEC-INCONSISTENCY: before the first complete set the three components give the summary three shapes, and the list read reports nothing about a building or failed first set. The interface polls only while `set.notCurrent` is building or a download is non-terminal, so once the first download ends the never-populated screen stops polling while the first set builds; its copy shows the download's state, never *Updating* or a first-set failure | At first deployment flow 1 step 3 (*without any further action*) fails until a reload; a first set that fails never shows its failure and reason (AC-20); S01 Home cannot render the state from an undefined shape | Specify one shape (for example a `later` block on the summary and the list whenever no complete set exists), keep polling while it is `building`, render *Updating* or *Score update failed* with its reason in the never-populated state, and carry the shape into system design §4.2 |
| FINDING-8 | MEDIUM | SR-3, SR-6 | UX design; UX brief; classification-ui; classification-api | S03 §3 banner copy (*from download #{n}*, approved); UX brief §2.1 item 1; UX design §0 (numbers paragraph), §1.1 Results header (*download #412*), §1.2 as-of line and banner; ui §2.6 (*download {run_id}*, DEC-0079 (e)) against ui §10 (*download #{n}*) and §14 question 3; api §10, §14 question 5; `0004_runs.sql:2` (`run_id uuid`) | CROSS-SPEC-INCONSISTENCY: the approved S03 copy, the brief and the UX design print a download number no table or artifact defines; the UX design presents *#412* as settled without a marker, while classification-ui departs from S03 by rendering the UUID and its own §10 still reproduces *#{n}* | AC-21's provenance line has three incompatible texts; an implementer following the UX design invents a number, and a 36-character UUID breaks blueprint §4.8's one-line as-of pattern and will not match S09's numbered *Recent downloads* | Owner: decide whether downloads gain a short visible number and which capability owns it; meanwhile mark the UX design's copy `[REQUIRES INPUT]`, record the UUID fallback as a departure from S03 §3, and make ui §10 agree with §2.6 |
| FINDING-9 | MEDIUM | SR-3, SR-1 | classification-reader; classification-api; universe-service; UX design; classification-ui | reader §2.5 `scope` CTE (`AND EXISTS (SELECT 1 FROM factor_classification c WHERE c.set_id = ...)`), §2.3 interface; api §2.7 `UniverseResponse.members[].factors`; universe-service §2.3 `Member` (no name, no cells); UX design §1.4 (*Member since*, *Members as of*, *{n} of {m} members match*); ui §2.1 `members-tab.tsx`, §2.3 (members table from `GET /api/classifications`) | Carried from v1 FINDING-4 and extended: (a) a member or compared stock covered after the current set was built has no row in it and is silently dropped from the universe-scoped list and from compare, not reported in `unknown_symbols`, while `member_count` counts it; (b) no reader operation supplies cells for `GET /api/universes/{id}` members, which the as-of view (up to 3000 past members) now needs and compare (capped at 6) cannot supply; (c) the Members table's *Member since* column has no source on the list read it is built from | *{n} of {m} members match* disagrees with its rows (STD-UI-16, flow 4 step 5); the as-of view and *Member since* cannot be implemented without inventing a read | Give an instrument with no row in the current set a stated state on the list, compare and universe reads; add a reader operation returning cells for a member list (or an `as_of` on the scoped list) and `member_since` on universe-scoped rows |
| FINDING-10 | MEDIUM | SR-3, SR-2 | system design; classification-reader; classification-ui | system design constraint 11; reader §2.4 `current_set.sql` (`later` from `classification_set` rows only); ui §2.6 start and stop rule and its sequence diagram (the note "health poll reports most_recent_run terminal; set block not yet building" followed by a summary poll) | Carried from v1 FINDING-3: not-current is derived only from a later set row, so a run that ended `succeeded` or `partial` with no set yet (the claim gap, a backlog, a scheduler loop failing every iteration, which only logs) leaves the previous set unmarked, and the poll stops when no set is building and the 30-second health poll reports the download terminal; the ui design's own diagram keeps polling through that gap, contradicting its rule | AC-20's mark is missing in those cases and the screen stops refreshing until a reload; a stuck scheduler is invisible to the owner | Define not-current against the latest qualifying run (constraint 11, reader §2.4) and keep polling while such a run lacks a complete set; make the ui rule and diagram agree |
| FINDING-11 | MEDIUM | SR-8, SR-3, SR-9 | factor-engine; system design; UX design; UX brief; classification-ui | factor-engine §2.3 (`fail_set.sql`, reason = exception class and message), §4; system design §3.1 step 25; UX design §1.2 banner (*{failure_reason as recorded}*) and `toast` `error` *Score update failed: {reason}*, §4 EDG row; UX brief §3 preamble and §8 EDG row; ui §2.6 | Carried from v1 FINDING-5: the failed-set reason is the Python exception class and message (a `psycopg` message or a statement timeout), returned by the list, summary and sets reads and rendered verbatim in the critical banner and a toast; both UX artifacts claim no exception reaches the owner | The one critical-tier state CAP-002 renders breaks STD-UI-1 v6 (no implementation vocabulary) and the EDG claims, and puts database error text in API responses against SEC-ERR-001 | Record a product-vocabulary reason (operation, resource, cause) in `failure_reason` and keep the exception detail in the structured log keyed by `set_id`, or map exception classes to fixed sentences |
| FINDING-12 | MEDIUM | SR-9, SR-1 | classification-ui; classification-api; DEC-0069; DEC-0064 | ui §2.2 ("The three edits change no delivered behaviour"), §7 row "Shell composition" (`shell.test.tsx`, `routes.test.tsx`); DEC-0069 ("nothing else in the shell is edited"); delivered `web/src/app/shell.test.tsx:71`, `shell.a11y.test.tsx:36`, `routes.test.tsx:75`, `shell.unreachable.test.tsx:58`; api §3 ("No other delivered file is edited"; isolation test "covers the new modules the day they exist"), §4 and §7 last row (no-secrets test extended "by the implementing story") | Appending the Research destination changes behaviour four delivered CAP-001 test files assert (exactly four navigation items); the ui plan names two of them and the record says nothing else is edited. The api design both claims no delivered file beyond `app.py` changes and plans to extend `tests/unit/test_api_no_secrets.py` (v1 FINDING-23, still open) | The composition story either breaks CAP-001's suite or edits delivered tests the AGT-SCOPE-002 reading (FINDING-13) does not cover; the edit set the owner is asked to confirm is understated | List every delivered file CAP-002 edits (`app.py`, `shell.tsx`, `routes.tsx`, `client.ts`, the four shell tests, the no-secrets test) in DEC-0069 and DEC-0064 and the component designs, or place the new assertions in new test modules |
| FINDING-13 | MEDIUM | SR-9 | system design; classification-api; classification-ui; DEC-0069; DEC-0064 | system design §8 question 4; DEC-0069 (PROVISIONAL, superseding DEC-0064's shell part); api §2.3, §14 question 2; ui §2.2; blueprint §12 D-8 ("CAP-001 is approved and takes no new work") | Carried from v1 FINDING-13: registering routers and the scheduler in `app.py`, appending a rail destination and five routes, and exporting `requestJson` edit files owned by delivered CAP-001 components; the reading that this is CAP-002's own composition work remains an agent's, and both component designs say the editing stories are blocked until the owner confirms | Every CAP-002 route, the scheduler and the reachable interface wait on this answer, so no end-to-end acceptance test can pass before it | Owner: confirm or replace the reading against FINDING-12's complete edit list, and say where the changed composition is documented without amending CAP-001 |
| FINDING-14 | MEDIUM | SR-9, SR-3 | capability; UX brief | capability §5.4 rows STD-UI-1 (*not classified*, *instrument*, *retired* as vocabulary), STD-UI-7 (`partial`), STD-UI-12 (seven states "each mapped to an existing tier") and the §5.4 preamble ("the two must agree"); capability `ai_provenance` STD-UI v4 (current v6); UX brief §12 preamble, §12.1 rows STD-UI-1, STD-UI-7 (`yes`), STD-UI-12, §12.2 | Replaces v1 FINDING-7, now closed. The checked mirror and the narrative record disagree on STD-UI-7 (`partial` against `yes`), on STD-UI-1 (v4 terms against v6 display labels) and on STD-UI-12 (two states rendered as STD-UI-14 presence rather than tiers); the capability pins the superseded standard | The machine-checked mirror misstates conformance against the standard in force, and a later STD-UI change derives its blast radius from it; only the owner may revise it, as the brief records | Owner: revise capability §5.4 and its STD-UI pin to v6 to match UX brief §12.1 |
| FINDING-15 | MEDIUM | SR-5, SR-3 | classification-scheduler; factor-engine; research-store; universe-service | `ai_provenance.source_artifacts` of the four v1 designs (CAP-002-system-design v1; research-store and universe-service also CAP-002-ux-design v1); `check-artifacts.py` warnings; `pipeline-state.py` ("upstream CAP-002-system-design is stale: artifact records v1, current version is v2") | The four component designs the alignment did not refine pin superseded upstream versions and were not re-checked against them; universe-service already disagrees with v2 (FINDING-4) and cites system design v1 and UX design v1 sections | The approval gate reports these four as stale, so they cannot be approved with the other seven, and a reader cannot tell which v2 statements they were checked against | Re-version the four against system design v2 and UX design v2, with the FINDING-1 and FINDING-4 corrections, or record why each is unaffected, before approval |
| FINDING-16 | MEDIUM | SR-3 | system design | system design §3.1 steps 14 and 25 to 27, constraint 10, §4.2 rows `GET /api/universes`, `GET /api/classifications`, summary and "Classification append", §4.4 `classification_set` writers; scheduler §14 question 1; api §2.5, §2.7, §11; reader §2.3; DEC-0065; DEC-0067 | Carried from v1 FINDING-15 and extended: version 2 still omits DEC-0067's start-up reclaim and build timeout (which make `classification-scheduler` a second writer of the state transition), the `name` prefix on `GET /api/universes`, `origin`, `run_outcome`, `min_peer_set_size`, `unknown_symbols`, the codes `classification_set_not_found`, `cursor_invalid` and `cursor_stale`, and the five-column completion UPDATE ("state fields only"); it now also omits `name` on stock rows, `started_at` and `latest_trading_day` in the set block and the never-classified summary shape (FINDING-7) | The design epic generation and test design read first understates the reliability mechanism and the API contract | Revise the system design to carry these, or record why each stays component-level |
| FINDING-17 | MEDIUM | SR-3, SR-7 | research-store; factor-engine; classification-reader; system design | research-store §2.5 item 2 (scans migration `.sql` files and Python sources; reuses `prohibited_observation_mutations` "with this capability's table list"); factor-engine §3; reader §3 ("The append-only guard over `src/factorflow/` covers it"); system design §4.4 ("scans every `.sql` file"); `tests/unit/test_sql_is_append_only.py` | Carried from v1 FINDING-6: CAP-002's statements live in `.sql` files under `src/factorflow/classification/sql/` and `src/factorflow/universes/sql/`, which the research-store guard does not scan; the delivered helper cannot take another table list without editing the delivered test | The C5 enforcement the system design marks "critical, unrecoverable if wrong" has a coverage hole | Widen the guard to every `.sql` file under `src/factorflow/`, share the matcher through a new module, and correct factor-engine §3 and reader §3 |
| FINDING-18 | MEDIUM | SR-9 | system design; capability | capability §5.1 row `docs/constitution/tech-stack.md` (C2, C4, C5, C8); system design (no occurrence of C4); §4.2 "Observation read" | Carried from v1 FINDING-8: the system design states how C2, C5 and C8 are honoured but never C4; the engine reads the store's tables directly | The capability's own "Satisfied when" cannot be confirmed, and M4 inherits an undecided reading (AGT-SCOPE-005) | State how classification honours C4 (for example: the store's published read shapes are the historical half of the contract) and surface the reading to the owner |
| FINDING-19 | MEDIUM | SR-9 | DEC-0058; five component designs | DEC-0058 `artifacts` (system-design.md only); classification-api §4, classification-reader §4, classification-scheduler §4, factor-engine §4, research-store §4 (each cites `SEC-ENC-001 host-local loopback exception`) | Carried from v1 FINDING-9: CONST-SEC 1.3 (in force) requires the decision recording reliance to name every design citing the exception; five component designs, two refined in v2, cite it and are not named | Consumer discovery for re-review on any change to the exception misses five designs; check (q) fails for them | Name the five designs in the `artifacts` of DEC-0058 or of a superseding record |
| FINDING-20 | MEDIUM | SR-7 | classification-scheduler; factor-engine | scheduler §2.3 (`build_timeout_seconds` default 300), §3 "No retry", §14 question 2; factor-engine §7 volume test; DEC-0067 | Carried from v1 FINDING-10: the build timeout equals the whole AC-11 budget and a timed-out set is not retried until the next qualifying run | A store that consistently builds past 300 seconds never produces a new set, turning a performance miss into a standing outage of classification; the trade-off is the owner's (AGT-SPEC-002) | Owner: decide the timeout separately from the budget and whether a timed-out build is retried |
| FINDING-21 | MEDIUM | SR-6, SR-4 | capability | capability §2 factor definitions; AC-7, AC-9, AC-12; system design constraints 7 and 8, §8 questions 6, 7 and 9; DEC-0053; DEC-0055 (2) | Carried from v1 FINDING-11: "standardised score", a non-positive growth base and a non-positive market capitalisation are undefined in the capability, and AC-12 names two input statuses while the designs add `not_computable` (rendered *Couldn't be computed*, DEC-0077) | Every set writes these provisional choices into append-only history the M4 backtest will replay | Owner: uphold DEC-0053 and DEC-0055 (2) and amend capability §2 and AC-12, or define them differently in a capability revision |
| FINDING-22 | MEDIUM | SR-9, SR-1 | system design; classification-api; UX brief; UX design; classification-ui | system design §8 question 2, constraint 15; api §2.4 `MAX_UNIVERSE_NAME_LENGTH`; UX brief §9; UX design §7; ui §14 question 1 | Carried from v1 FINDING-12: no artifact bounds the universe name | SEC-INP-001 (High) requires a maximum length on every external string field; the create and rename routes cannot conform | Owner: state the bound |
| FINDING-23 | MEDIUM | SR-9 | system design; tech-stack | `tech-stack.md` OQ-TS-3 (resolver "Capability owner", blocks "Classification and backtest implementation"); system design §4.3 and §8 question 3; DEC-0052 | Carried from v1 FINDING-14: the approved tech stack still records the numeric library as open and blocking; only an agent's provisional decision closes it | Implementation planning would proceed against an approved artifact that says it is blocked | Owner: uphold or replace DEC-0052 and amend OQ-TS-3 through `$tech-stack` before implementation planning |
| FINDING-24 | LOW | SR-5, SR-3 | system design; classification-api; DEC-0071 | system design §6 assumption 8 ("through the summary read and nothing else"), §4.2 summary row; api §2.7 `ClassificationSummaryResponse`; DEC-0071 derivation (cites S09's `exceptions`); S09 §3, §5 (`checks[]` with `exceptions`), §11 (*{n} stocks show as Incomplete*) | The summary carries `stocks_current` (no `missing` or `outdated` input) but neither a count of stocks shown *Incomplete*, which also covers `not_computable`, nor the named exceptions S09's *Factor scores* card renders | The shell capability will need a CAP-002 contract change or a second read the system design says it will not use | Add an incomplete count and a bounded exception list to the summary, or drop "nothing else" and name the read S09 will use |
| FINDING-25 | LOW | SR-8, SR-3 | UX design; UX brief; classification-ui; classification-api | S03 §3 (Results header carries **Save these {n} as a universe…** for every scope); UX brief §2.1 item 6; UX design §1.1 "Saving the result as a universe", §1.4, §4 EDG row, §5 AC-2 row; ui §2.7; api §2.4 `Thresholds` (`extra="forbid"`) | The save is withheld under a universe scope ("the save carries thresholds only"), a departure from S03 §3 absent from the UX design's list of departures; and the brief and UX design say the posted filter carries "the scope", which the API model rejects | An unrecorded departure from an approved screen, and wording an implementer may follow into a `422` | Record the departure with its reason, or support the scope in the snapshot, and correct "the scope" in the brief and UX design |
| FINDING-26 | LOW | SR-3 | classification-ui; UX design; DEC-0065 | ui §2.3 (the Universes screen's edge to the events read labelled *origin on expansion*), §14 question 7; UX design §1.3 (origin line "read once per expansion from the universe's `created` event"), §7 last item; DEC-0065 alternatives rejected | The universes list reaches each row's origin line by paging the newest-first events read to its oldest event, the approach DEC-0065 rejected ("one line of text costs a walk over the whole log"); `UniverseListResponse` carries no origin | Each expansion of a long-lived universe walks its whole event log | Add `origin` to the rows of `UniverseListResponse` (universe-service already replays the `created` event) or record why DEC-0065's rejection no longer holds |
| FINDING-27 | LOW | SR-9 | system design; UX brief; UX design; classification-ui | system design §8 question 10 (a) ("most likely as `requires-runtime` for the rail entry"); UX brief §9; UX design §7; ui §14 question 2 | The proposed §5.1 row would be over-typed and misplaced: CAP-002 is buildable and runnable without the shell capability (DEC-0069's interim composition), and the summary read's consumer relation is the shell capability's dependency on CAP-002, which belongs in that capability's own table | Recording it as proposed invents an integration-order constraint and an apparent cycle with the shell capability's dependency on the summary read | Owner: record no CAP-002 §5.1 row for it (at most a §5.2 note), and have the shell capability declare its dependency on `GET /api/classifications/summary` when it is defined |
| FINDING-28 | LOW | SR-5 | design decomposition record | commit `cff55b5` ("six recommendations against system design v2 (reported, not applied)", none listed); reader §14 question 2 and ui §14 question 4 ("in the decomposition report"); no such report exists | Carried from v1 FINDING-22 in new form: the alignment's six recommendations exist only as a count, and two component designs cite a report that does not exist; three of the six are visible in component §14, three (provenance carrying `hide_incomplete`, `name` on stock rows, the summary before the first set) nowhere | Neither the owner at approval nor epic generation can see what the decomposition found misaligned; this review identified them independently (FINDING-3, 4, 7, 8, 16) | Record the six in an artifact the owner and later stages read and fix the dangling citation |
| FINDING-29 | LOW | SR-1 | classification-reader; classification-ui | reader §2.2 narrative before the block diagram (six sentences); ui §2.3 narrative before the data-fetch map (six sentences) | Two diagram narratives exceed the rubric's three to five sentences | Cosmetic | Trim each to five sentences |
| FINDING-30 | LOW | SR-5, SR-9 | system design; factor-engine | system design §4.3 key libraries (`hypothesis`, source "tech-stack v5"); factor-engine §7 | Carried from v1 FINDING-17: `tech-stack.md` v5 does not list `hypothesis` | A conformance claim rests on a citation that does not support it | Cite `pyproject.toml`, or have the owner add it to the tech stack |
| FINDING-31 | LOW | SR-3 | system design; classification-ui | system design §4.2 row `GET /api/instruments` (consumer `classification-ui`, "for picking members by symbol"); ui §11 ("not required by any CAP-002 screen in the UX design") | Carried from v1 FINDING-18: a declared interface has no consuming screen | An unused interface appears in the architecture inventory | Remove the row or name the screen that uses it |
| FINDING-32 | LOW | SR-8, SR-3 | UX design; classification-api; universe-service | UX design §1.3 (Name column "sortable"); api §11 `GET /api/universes` (no `sort`); universe-service §2.5 (pages by `created_at`) | Carried from v1 FINDING-19 | A sort over one loaded page would be silently wrong (STD-UI-30) | Add a name sort to the API and service, or drop sortability |
| FINDING-33 | LOW | SR-5 | research-store | research-store §6 "Rollback" ("the accepted cost the system design section 4.4 names") | Carried from v1 FINDING-21: system design §4.4 names the dump-and-restore path but no loss of universes created after the upgrade | The citation implies an acceptance that is not recorded | Record the cost in the system design or cite where the owner accepted it |
| FINDING-34 | LOW | SR-5 | system design; UX brief; four component designs | system design `timestamp` 23:05:00Z against commit `c4c9f2f` at 23:00:21Z; UX brief 23:20:00Z against `e0d6235` at 23:15:29Z; scheduler, factor-engine, research-store and universe-service 06:40Z to 07:10Z against `12d2ba7` at 05:51:57Z | Carried from v1 FINDING-25 and extended: production timestamps later than the commits that introduced the content | AGT-PROV-001 requires the production timestamp; these are not it | Correct the timestamps on the next revision |

---

## Traceability Matrix

Per-AC verdict (VER-EVD-004). "Mapped" means the AC traces to system design,
component and, where it has UX implications, UX design elements that would
satisfy it as written.

| AC | System design | Component design(s) | UX design | Verdict |
|----|---------------|---------------------|-----------|---------|
| AC-1 | 3.2 steps 4, 4a; 5.13 | universe-service 2.4, `coverage_check.sql`; api 2.5 | 1.3 create dialog; 1.1 and 1.4 **Add to universe…** | Mapped |
| AC-2 | 3.2 step 3a; 4.4; 5.14 | universe-service `create_from_filter`; reader `evaluate_filter`; api 2.4 | 1.1 **Save these {n} as a universe…**; 1.3, 1.4 origin line | Mapped with defects (FINDING-4, FINDING-5, FINDING-25) |
| AC-3 | 4.2; 4.4 | research-store; universe-service | 1.3; 1.1 *Look in*; memberships line | Mapped |
| AC-4 | 3.2 steps 8, 11, 12 | universe-service 2.4 | 1.4 | Mapped |
| AC-5 | 3.2 step 7; 5.13 | universe-service 2.4 | 1.3, 1.4 `blocked`; 1.1 save at zero matches | Mapped |
| AC-6 | 4.4; 5.3 | research-store; universe-service 2.5 | 1.4 History, *Members as of* | Mapped with defect (FINDING-9: no read supplies the as-of view's cells) |
| AC-7 | 5.7; 5.8 | factor-engine 2.4, 2.5 | 1.5, 1.6 | Mapped; value and growth not demonstrable until FINDING-2; arithmetic per FINDING-21 |
| AC-8 | 5.5 | factor-engine 2.5; reader 2.5 | 1.1 scope | Mapped |
| AC-9 | 5.7 | factor-engine 2.5; research-store | 1.1 factor cell; inspector | Mapped; method provisional (FINDING-21) |
| AC-10 | 3.1 steps 4 to 7a, 19 to 21; 5.10 | classification-scheduler 2.4 | 1.2 | Mapped with defect (FINDING-1) |
| AC-11 | 3.1 steps 28 to 31 | factor-engine 5, 7; scheduler 2.3 | 1.1 `virtualised`; 1.2 poll | Mapped with defects (FINDING-1, FINDING-20) |
| AC-12 | 3.3 step 15; 5.6 | factor-engine 2.5; reader 2.5 | 1.1, 1.5, 1.6 *Incomplete* | Mapped with defects (FINDING-6, FINDING-9) |
| AC-13 | 3.3 step 18; 5.6; 5.8 | factor-engine 2.4; reader 2.4 summary | 1.6; 1.2 current-stock count | Mapped |
| AC-14 | 3.1 steps 9, 11a | factor-engine 2.3 step 6, 2.5 | 1.1 header count | Mapped |
| AC-15 | 3.2 step 10; 5.5 | factor-engine 2.5; reader 2.5 scope | 1.1 (universe scope), 1.4, 1.5, 1.6 *Not followed* | Mapped |
| AC-16 | 3.3 steps 15, 16 | reader 2.5; api 2.4 | 1.1, 1.4, 1.5 | Mapped with defect (FINDING-9) |
| AC-17 | 3.3 step 17 | factor-engine 2.4 `detail`; reader 2.6 | 1.1 inspector; 1.6 | Mapped |
| AC-18 | 4.4 | reader 2.6 history | 1.6 Earlier scores | Mapped |
| AC-19 | 3.1 steps 22 to 24; 5.4 | factor-engine 3; scheduler `claim_set.sql` | 1.6 | Mapped |
| AC-20 | 3.1 steps 13, 14b, 25 to 27; 3.3 steps 13, 18; 5.11 | reader 2.4; ui 2.6 | 1.2 banner | Mapped with defects (FINDING-7, FINDING-10, FINDING-11) |
| AC-21 | 3.3 steps 13, 18 | reader 2.4 | 1.2 as-of line; set history | Mapped with defects (FINDING-1, FINDING-8) |
| AC-22 | 3.3 step 14 | reader 2.4; api 2.7 | 1.1, 1.5, 1.6 never-scored states | Mapped with defect (FINDING-7) |
| AC-23 | 5.9 | factor-engine 2.4, 2.5; research-store | every scored surface (DEC-0075) | Mapped; in production only after FINDING-2 |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No finding is CRITICAL: no AC contradicts another, no core requirement is
untestable, and nothing prevents epic generation, story generation or test
design from starting on these specifications. Two HIGH findings exist and
should be resolved before the owner approves the reviewed revisions: FINDING-1
is a design defect that would write permanent, misattributed sets on first
deployment and is resolved by a design revision; FINDING-2 is the owner's answer
that two of the three factors depend on and that may change the engine's
trailing-twelve-month derivation.

Of the twenty-one MEDIUM findings, nine are new with the alignment. Five of them
are design corrections this review recommends before approval because each
writes or shows something wrong at the first use: FINDING-3 (`hide_incomplete`
in the system design), FINDING-4 and FINDING-5 (the saved snapshot), FINDING-7
(the first set) and FINDING-15 (four stale component designs, which the gate
will refuse anyway). Eight MEDIUM findings await only an owner answer or verdict:
FINDING-6 (S03-1), FINDING-8 (download number), FINDING-13 (AGT-SCOPE-002
reading), FINDING-14 (capability §5.4), FINDING-20 (timeout), FINDING-21
(arithmetic), FINDING-22 (name length) and FINDING-23 (OQ-TS-3).

Every schema-versioned specification in scope (the capability, the system
design, the UX brief, the UX design and the seven component designs) remains
`draft` and is blocked from epic generation and test design until the owner
explicitly approves it with `scripts/artifact-gate.py approve`, naming this
report as `--review-artifact`. This review approves nothing. The four component
designs FINDING-15 names will be reported stale by the gate until they are
re-versioned. The decision records DEC-0052 to DEC-0080 carry
`owner_reviewed: false`; DEC-0053, DEC-0055 and DEC-0056 decide what is written
into append-only history, and DEC-0069, DEC-0071, DEC-0076 and DEC-0079 decide
the interface's contract, so the owner's verdict on them matters most before
implementation.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-1: decide which runs qualify at first deployment and when several
   wait; align scheduler, research-store and factor-engine §6 and system design
   §3.1 steps 5 and 21.
2. FINDING-2: owner to supply the seven line-item keys and confirm quarterly Q4
   statements against real acquired data; revise DEC-0055 (1) if they do not
   exist.

### Should Fix (MEDIUM findings)

3. FINDING-3: one `hide_incomplete` rule (input reasons) and the unscoped list's scope in the system design and DEC-0071.
4. FINDING-4: universe-service and system design §4.2, §4.4 carry `hide_incomplete` in the snapshot and provenance.
5. FINDING-5: carry the search prefix in the snapshot, or block the save during a search.
6. FINDING-6: owner verdict on S03-1 against threshold exclusion.
7. FINDING-7: one pre-first-set summary shape; poll and render the first set's state.
8. FINDING-8: owner decision on a download's visible identifier; mark the UX design's copy meanwhile.
9. FINDING-9: state for members with no row in the current set; a member-list read; `member_since` on scoped rows.
10. FINDING-10: not-current against the latest qualifying run; poll until it has a complete set.
11. FINDING-11: product-vocabulary `failure_reason`; detail to the log.
12. FINDING-12: list every delivered file CAP-002 edits, including four shell tests and the no-secrets test.
13. FINDING-13: owner to confirm the AGT-SCOPE-002 reading.
14. FINDING-14: owner to align capability §5.4 and its pin with STD-UI v6.
15. FINDING-15: re-version the four unchanged component designs against v2.
16. FINDING-16: carry DEC-0067 and the contract additions into the system design.
17. FINDING-17: widen the append-only guard to every `.sql` under `src/factorflow/`.
18. FINDING-18: state how C4 is honoured.
19. FINDING-19: extend DEC-0058's `artifacts` to the five citing component designs.
20. FINDING-20: owner decision on the build timeout and retry.
21. FINDING-21: owner to uphold or revise the standardisation and non-positive-base rules in the capability.
22. FINDING-22: owner to state the universe name bound.
23. FINDING-23: owner to close OQ-TS-3 in the tech stack.

### Nice to Have (LOW findings)

24. FINDING-24 S09's incomplete count and exceptions; FINDING-25 save under a
    universe scope and "the scope"; FINDING-26 origin on the universe list;
    FINDING-27 no CAP-002 §5.1 row for the shell capability; FINDING-28 record
    the six recommendations; FINDING-29 two long narratives; FINDING-30
    `hypothesis` citation; FINDING-31 unused interface; FINDING-32 universe name
    sort; FINDING-33 rollback citation; FINDING-34 provenance timestamps.

---

## Observations Outside the Review Subjects

- `check-references.py` exits 1 on one dangling path: `docs/ux/README.md`,
  cited by `projects/factorflow-v2/decisions/DEC-0068.md:22`, `DEC-0072.md:21`
  and `DEC-0080.md:15`. The file exists in the project repository; the checker
  resolves paths in harness files against the harness root. Qualifying the path
  (`repos/factorflow-v2/FactorFlow-v2/docs/ux/README.md`) in those records
  clears it. No review subject is affected.
- `projects/factorflow-v2/decisions/DEC-0068.md` to `DEC-0080.md` are untracked
  in the harness checkout at the time of this review.
- `docs/architecture.md` (generated) carries cells with an unbalanced backtick
  where the generator split a cell (for example the rows for
  `DELETE /api/universes/{id}/members/{symbol}`, `GET /api/universes` and the
  orphan row); a `build-architecture.py` formatting matter, not a design one.
- `docs/constitution/standards/ui-conventions.md` (STD-UI v6, approved) pins
  `PRODUCT-UX` v3 while v6 is current (`check-artifacts.py` warning); a
  conformance target of this capability, not a subject of this review.
- The badge specification limits a label to one or two words, while blueprint
  §8 and §4.4 use *Not enough to rank*, *Not reflecting the latest download* and
  *Score update failed* as badge labels; DEC-0077 applies the limit to *Couldn't
  be computed* only. The blueprint's labels bind CAP-002; reconciling the
  specification with them is the design system's and the blueprint's.

## Unattended-Run Record

Run as the `$specification-review` step of a `$design-run` driver run,
unattended per `docs/unattended-mode.md`. No question was asked and no decision
was recorded: this review decides nothing and only reports. The Step 6
discussion prompt was skipped. No specification, decision record, tech-stack,
constitution, CAP-001 or `docs/ux/` artifact was edited; no approval block was
touched. The only write is this report.
