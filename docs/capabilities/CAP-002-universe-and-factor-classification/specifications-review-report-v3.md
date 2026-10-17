---
artifact_schema_version: 1
artifact_id: CAP-002-specification-review
artifact_type: specification-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
document: spec-review-report
capability: CAP-002
version: v3
generated: 2026-10-17T03:06:45Z
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
    result: "PASSED, exit 0: 2 capabilities, 6 edges (requires-runtime 2, conforms-to 4, blocked-by 0, requires-contract 0), 1 standard (STD-UI), 2 conformance claims, 1 constitution artifact, 2 references; integration layers CAP-001 then CAP-002; no error, no warning"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0: 2 designs, 19 components, 48 interfaces (47 at review v2; system design v3 adds Filter snapshot evaluation, classification-reader to universe-service); no drift against docs/architecture.md"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 238 warnings, exit 0 (--strict), 284 artifacts; one CAP-002 warning: Capability-CAP-002.md pins STD-UI v4 (current v6); none on the ten designs (review v2's four stale-pin warnings are gone)"
  - script: check-references.py
    outcome: run
    result: "FAILED, exit 1: 1130 path references across 242 Markdown files; one dangling path, docs/ux/README.md (a project-repo path), cited by projects/factorflow-v2/decisions/DEC-0068.md:22, DEC-0072.md:21 and DEC-0080.md:15; no review subject affected; the design-run branch's checker, which treats docs/ux/ as a project-repo prefix, PASSES (1164 references, 229 files)"
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
  SR-8: "applied — design_system_available true; 62 component-variant pairs and 56 token names in the UX brief, UX design and classification-ui verified against design-system/; S03-1 to S03-7 assessed"
  SR-9: "applied — dependency half and STD-UI conformance half by check-capabilities.py; capability section 5.4 against UX brief section 12.1 (STD-UI v6); tech-stack C2, C4, C5, C8 and OQ-TS-3; CONST-SEC 1.3 SEC-ENC-001 bookkeeping; AGT-SCOPE-002 delivered-file edits checked against the delivered tests"
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
    artifact_version: 3
    content_revision: sha256:569e796803c16dae26aa43c915f6ac8c230b20ac8e49610ea57679917049fd4f
  - artifact_id: CAP-002-ux-brief
    artifact_version: 3
    content_revision: sha256:0f00a9225ac749d7596d68f2ad4628564948596e25530f6f3c4c076580b9e3aa
  - artifact_id: CAP-002-ux-design
    artifact_version: 3
    content_revision: sha256:cc3e23048fbd651f277d2d6eb01e9d6e5899a7857dcd85f5edc79146c116f03c
  - artifact_id: CAP-002-component-design-classification-api
    artifact_version: 3
    content_revision: sha256:7aec28e5c82650f8f1f92c9cfe4913ec239d18c78f628c99c45bbbebf940b3ab
  - artifact_id: CAP-002-component-design-classification-reader
    artifact_version: 3
    content_revision: sha256:422726f80dba02dd78f17b7b264e5174a808867d04ac127b74a9b468395502fb
  - artifact_id: CAP-002-component-design-classification-scheduler
    artifact_version: 2
    content_revision: sha256:f50b98727b647514be0a550f5c82fa92471759226cec7836f9999bf0ed10a297
  - artifact_id: CAP-002-component-design-classification-ui
    artifact_version: 3
    content_revision: sha256:d6cf5e30fcd9165269d4024e871050ff339b8cae9852fca88faec2d76234f707
  - artifact_id: CAP-002-component-design-factor-engine
    artifact_version: 2
    content_revision: sha256:76ade73b6e5df249f71523fce0056cad17d7a1000b7384e9066897d31a9d40c7
  - artifact_id: CAP-002-component-design-research-store
    artifact_version: 2
    content_revision: sha256:8644c9766f72ebb24be991814d61734bba93fcc8c344791cd3c17561a03cb192
  - artifact_id: CAP-002-component-design-universe-service
    artifact_version: 2
    content_revision: sha256:7b18e9f329c2a012cb516584e9127805fc9a15f2b382cf77fa83763bbee6fe03
statistics:
  total_findings: 34
  critical: 0
  high: 2
  medium: 17
  low: 15
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-17T03:06:45Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "3"
    - id: CAP-002-ux-brief
      version: "3"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-component-design-classification-scheduler
      version: "2"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-research-store
      version: "2"
    - id: CAP-002-component-design-universe-service
      version: "2"
    - id: PRODUCT-UX
      version: "6 (approved 2026-10-16; governs, not a subject)"
    - id: PRODUCT-UX-S03
      version: "4 (approved 2026-10-16; acceptance checks S03-1 to S03-7; governs, not a subject)"
    - id: STD-UI
      version: "6 (approved 2026-10-16; governs, not a subject)"
    - id: tech-stack
      version: "5 (approved 2026-10-13; context)"
    - id: DEC-0081 to DEC-0085
      version: "open, decided_by agent, owner_reviewed false (the consistency pass; verified here)"
    - id: DEC-0052 to DEC-0080
      version: "open, decided_by agent, owner_reviewed false (context; DEC-0069, DEC-0071, DEC-0076 and DEC-0079 partly superseded)"
    - id: specifications-review-report-v2
      version: "CAP-002 review v2, READY-WITH-WARNINGS (every finding re-verified, not carried on trust)"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Specification Review Report -- CAP-002

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-002 Universe & Factor Classification |
| **Version** | v3 (third review; v2 reviewed the blueprint-aligned designs) |
| **Specifications Reviewed** | Capability v1 (draft, unchanged); system design v3; UX brief v3; UX design v3; component designs classification-api v3, classification-reader v3, classification-ui v3, classification-scheduler v2, factor-engine v2, research-store v2, universe-service v2 |
| **Total Findings** | 34: CRITICAL 0, HIGH 2, MEDIUM 17, LOW 15 |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

The owner's consistency pass did what it was directed to do. Of the nine review
v2 findings it targeted, seven are fixed outright: `hide_incomplete` means
input reasons only and the unscoped list is the followed roster in every
artifact (v2 FINDING-3); the saved filter is one object, twelve bounds,
`hide_incomplete` and the *Find a stock* prefix, from the list read through
`universe-service` into the provenance (v2 FINDING-4, FINDING-5; DEC-0085); a
threshold no longer drops a stock that is incomplete on it, so the approved
S03-1 and its helper sentence hold and S03-1 moves from PARTIAL to PASS (v2
FINDING-6; DEC-0081); the summary and the list carry one `set` + `later` shape
before and after the first set and the screen polls from first load (v2
FINDING-7; DEC-0082); every surface the v2 finding named names a download by
its start time, never by an invented number or a raw UUID, with S03's *#{n}*
recorded as a departure (v2 FINDING-8; DEC-0083); and the four component
designs that pinned superseded upstreams are re-versioned (v2 FINDING-15).
Of the other two it targeted, v2 FINDING-12 (the delivered-file edit list)
changed form rather than closing, and v2 FINDING-14 is carried with its brief
side applied, as the pass intended. As side effects, review v2's FINDING-28
closed and FINDING-34 (provenance timestamps) changed form.

Both HIGH findings are carried unchanged, because the pass did not touch the
scheduler or the line-item mapping and was not meant to: FINDING-1 (every
historical run is classified at first deployment, one permanent misattributed
set each) and FINDING-2 (the Massive line items, and whether fourth-quarter
statements exist, are unvalidated). Twenty-four v2 findings are carried as the
owner left them.

The pass introduced or exposed ten new findings, four of them MEDIUM and two
of them v2 findings in changed form.
**FINDING-3** matters first: the pass pinned review v2 as an upstream of nine
designs, and `artifact-gate.py` will refuse every one of them now that this
report exists (verified), while the system design escapes only because it pins
a review id that does not exist. **FINDING-4**: two surfaces DEC-0083 renamed,
the stock's Earlier scores and the never-populated state's latest-download
line, have no read carrying the download's start time. **FINDING-5**: the UX
brief still describes the read shape DEC-0082 replaced. **FINDING-6**: the
universe and classification packages import each other, a cycle SA-CLASS-002
forbids; it predates the pass, and DEC-0085's rationale makes it explicit.

No finding is CRITICAL, so under the rubric the set is READY-WITH-WARNINGS.
This review recommends that FINDING-3 be resolved before the owner attempts
approval, because the gate will refuse nine of the eleven subjects against this
report until it is.

## Review Scope

All eleven specification artifacts resolved by `get-capability-specifications`
were read: the capability, the system design, the UX brief, the UX design and
the three refined component designs (classification-api, -reader, -ui) in
full; universe-service v2 in full; and for classification-scheduler v2,
factor-engine v2 and research-store v2 the complete v2 diff against the
revisions review v2 read in full (commit `1897b94`: new version paragraphs,
re-pinned provenance, updated reference rows and, in research-store, the
`filter_provenance` column comment and its paragraph), plus every section a
carried finding locates. `epics/` exists and is empty; no `stories/` or
`tests/` content exists for CAP-002.

Inputs read for conformance and context, none of them a subject and none
edited: `docs/ux/product-ux-blueprint.md` (`PRODUCT-UX` v6, approved; §4.8
read closely), `docs/ux/screens/S03-research.md` (S03 v4, approved; §3, §7,
§10 read closely), `docs/constitution/standards/ui-conventions.md` (STD-UI v6,
approved), `docs/constitution/tech-stack.md` v5 (OQ-TS-3, key libraries), the
design system under `design-system/`, decision records DEC-0052 to DEC-0085
(DEC-0081 to DEC-0085 in full, DEC-0064, DEC-0069, DEC-0071, DEC-0076 and
DEC-0079 for the statements the pass superseded), review v2 in full, and the
delivered files the designs or this review rely on: `web/src/app/shell.tsx`,
`shell.test.tsx`, `shell.a11y.test.tsx`, `routes.test.tsx`,
`shell.unreachable.test.tsx`, `tests/unit/test_api_no_secrets.py` and
`src/factorflow/api/models.py`. `git log 48ba2fa..1897b94` shows that between
review v2 and this review only the ten CAP-002 designs and the generated
`docs/architecture.md` changed: no governing artifact, no capability, no code.

The capability's content revision equals review v2's `review_subjects`; the
other ten revisions are new. Every review v2 finding was re-verified against
the current text rather than carried on trust; the disposition is under
"Disposition of Review v2 Findings".

Context the driver supplied and this review judged rather than accepted: that
the pass applied only v2 FINDING-3 to FINDING-8, FINDING-12, FINDING-14 (brief
side) and FINDING-15, through DEC-0081 to DEC-0085. Each record was checked
against every artifact that names it and every artifact that applies it, and
each superseded statement was searched for across all eleven subjects
("Verification of the Consistency Pass"). The two seams the pass workers
noticed are disposed of as FINDING-3 (the review id pinned by the system
design) and FINDING-22 (the system design does not cite DEC-0085).

The capability is `status: draft` with no approval block, as are all ten
designs; `docs/approval-gates.md` has design phases work on drafts and approval
follow this review, so draft status is not a finding.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All template sections present in all eleven artifacts; every diagram the pass rewrote preceded by a narrative of three to five sentences (system design §3.2: 4; api §2.6: 5; ui §2.6: 5; universe-service §2.2 and §2.4: 5 each; reader §2.7: 4); the two six-sentence narratives v2 found are unchanged (FINDING-30); data paths for every UX data element traced to a read (FINDING-4, FINDING-7 gaps) |
| SR-2 Correctness | applied | ACs mutually consistent; error codes unique; read semantics checked for internal contradiction (FINDING-8, FINDING-21) |
| SR-3 Consistency | applied | AC-to-design mapping; decomposition-to-system-design alignment; cross-spec comparison of the `set` and `later` blocks, the filter object, `run_started_at`, copy and routes across the eleven artifacts, the blueprint and S03 (eight CROSS-SPEC-INCONSISTENCY findings) |
| SR-4 Testability | applied | Each AC checked for observable outcome, concrete input, boundary and measurability; each S03 check checked against the tests the designs plan, including the new search-then-save and first-set tests |
| SR-5 Traceability | applied | System design §7 (23 ACs and S03-1 to S03-7), component §13 tables and UX design §5 traced; provenance pins, decision-record `artifacts` and body references checked (FINDING-3, FINDING-22, FINDING-23, FINDING-25) |
| SR-6 Clarity | applied | Vague-term scan of the capability; undefined references and open defaults in the designs (FINDING-21) |
| SR-7 Feasibility | applied | Circularity at component, module and package level (FINDING-6), single points of failure, timeouts, first deployment, first set, poll cost |
| SR-8 UX Completeness | applied | `design_system_available` true; five routes, eight states per region, component mapping (62 component-variant pairs) and token usage (56 names) verified mechanically against `design-system/`, source mapping table and design source present (Path B, *Generated from UX brief v3, starting from PRODUCT-UX-S03*), AC traceability, EDG checklist; S03-1 to S03-7 |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` (no error, no warning); type, citation and placement of the three §5.1 rows; STD-UI §5.4 against the brief's v6 record; tech-stack C2, C4, C5, C8, OQ-TS-3; CONST-SEC 1.3 SEC-ENC-001 bookkeeping; AGT-SCOPE-002 edit list against the delivered tests |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` (19 components, 48 interfaces, no drift); §4.1 identifiers on every diagram box and sequence participant; every §4.2 row, including the new `Filter snapshot evaluation`, names a provider and a consumer component; the one unpublished consumer is written as a placeholder and recorded as §8 question 10; no capability identifier appears in §1 to §5 |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, exit 0, PASSED; no error, no warning | none |
| `build-architecture.py -p factorflow-v2` | run, exit 0, PASSED: 2 designs, 19 components, 48 interfaces, no drift | none (the generated row for `GET /api/classifications` is truncated by the generator; Observations) |
| `check-artifacts.py -p factorflow-v2 --strict` | run, exit 0, PASSED with 238 warnings over 284 artifacts | FINDING-11 (capability pins STD-UI v4); the checker leaves unknown pin ids alone, so the system design's malformed review pin is invisible to it (FINDING-3) |
| `check-references.py` | run, exit 1: one dangling path in three harness decision records | none against a subject; Observations |
| `check-constitutions.py` | run, exit 0, PASSED: 10 constitutions, 36 skills | none |

All five ran from the harness checkout at `/Users/alvarodejodra/Projects/ai-agents`
(branch `main`, `da3b58b`), where `repos/` lives. That checkout's
`check-artifacts.py`, `artifact-gate.py` and `check-references.py` differ from
the design-run branch: the first two only in recognising `ux-blueprint` and
`ux-screen-spec` artifacts, which touches no CAP-002 subject and not the
upstream-pin logic FINDING-3 rests on; the third in treating `docs/ux/` as a
project-repo prefix, which is why it fails here and passes there.

Supplementary evidence gathered fresh in this session:

- `bash scripts/check-prerequisites.sh --project factorflow-v2`: exit 2, every
  check PASSED except *Context freshness* STALE (last run
  2026-10-16T01:37:01Z, 25 hours, window 24). Handled under "Unattended-Run
  Record". The first attempt inside the sandbox failed on a bash 3.2
  here-string temp file and was rerun outside it, read-only.
- `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --stage specification-review`
  before writing: `AWAITING-APPROVAL` (exit 1), because a review exists and
  nothing is approved; unlike at review v2 it reports no stale upstream. This
  review ran on the driver's direction because ten reviewed revisions changed
  after v2.
- `python3 scripts/artifact-gate.py revision` for all eleven subjects (values
  in `review_subjects`).
- `artifact-gate.py`'s `upstream_errors` evaluated over a copy of the project
  repository's `docs/` with a v3 report in place: the nine designs pinning
  `CAP-002-specification-review` v2 each return *upstream
  CAP-002-specification-review is stale: artifact records v2, current version
  is v3 and is not approved*; the capability and the system design return none
  (FINDING-3).
- Design-system verification: every component-variant pair named by the UX
  brief, UX design and classification-ui (62 pairs) exists in its
  `design-spec.md`; every token named (56 distinct names) exists in
  `design-system/theme.css`, family prefixes (`--factor-*`, `--seq`,
  `--status-<tier>`) resolving to defined members.
- Delivered code checks: `web/src/app/shell.test.tsx:71` and `:72–77`,
  `shell.a11y.test.tsx:36`, `routes.test.tsx:75` and `:105–118`,
  `shell.unreachable.test.tsx:58` and `:59–64` (FINDING-24);
  `tests/unit/test_api_no_secrets.py` holds one test over `GET /api/health`
  and no module list, as DEC-0084 says; `src/factorflow/api/models.py:169–179`
  `MostRecentRun` carries `run_id`, `state`, `ended_at` only (FINDING-4).
- Searches across all eleven subjects for every statement the pass superseded
  (results under "Verification of the Consistency Pass").
- Narrative sentence counts for every diagram the pass rewrote.

## Constitutions Applied

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | AGT-AUTH-002: every decision the pass made is a record (DEC-0081 to DEC-0085), and the designs cite the record that binds them, except the system design for DEC-0085 (FINDING-22). AGT-SCOPE-002: the delivered-file list is now complete at file level (DEC-0084) and awaits the owner (FINDING-10); its "nothing else" is false at assertion level (FINDING-24). AGT-EVIDENCE-001: the pass's line-cited claims about delivered tests were checked at those lines; all hold except the "no other assertion changes" claim. AGT-EVIDENCE-002: no new quantitative value without a source. AGT-PROV-001: blocks present on all eleven; one timestamp postdates its commit (FINDING-25); the review pins added by the pass break the approval gate (FINDING-3) |
| CONST-MDL 1.3 | No product model usage; exact model identifiers in every provenance block (MDL-PIN-002, MDL-PIN-003). Nothing else engaged |
| CONST-OPS 1.3 | OPS-MIG-001/002/003: unchanged since v2; the rollback citation is still unsupported (FINDING-34). OPS-ERR-001: a scheduler failing every iteration still only logs (FINDING-8). OPS-DEST: no destructive operation specified |
| CONST-REV 1.4 | This report is two-stage (Stage 1 and Stage 2 below). REV-RCV-001: each fix the pass claims was verified against the artifact text and, where it cites delivered code, against the code. REV-RCV-002: two claims are challenged with evidence: DEC-0084's "no other assertion in the four files changes" (FINDING-24) and DEC-0082's "the interface polls both reads" (FINDING-20); and the four re-versioned designs' statement that v2 FINDING-34 is carried for them, which their own new timestamps make untrue (disposition table) |
| CONST-SA 2.0 | SA-CLASS-002: a package-level import cycle between `factorflow.universes` and `factorflow.classification` (FINDING-6). SA-DUP-001: the pass reduced duplication (one filter object, one `later` shape). SA-MD-002: the dangling "decomposition report" citation is gone (v2 FINDING-28 closed); stale version labels in reference tables (FINDING-23); one dangling path in harness decision records (Observations). SA-MD-003: placeholders use `[REQUIRES INPUT]`. SA-DEAD-002: no TODO or TBD |
| CONST-SEC 1.3 (in force) | SEC-AUTH-001 non-engagement inherited (capability §5.3). SEC-INP-001: the new `symbol` field of the saved filter is shape-checked at the API and reader; the universe name is still unbounded (FINDING-18). SEC-INP-002: allowlisted sort, parameterised SQL, `LIKE` escaping. SEC-DAT-001: Internal throughout. SEC-ERR-001: exception text in `failure_reason` now also reaches the never-populated state (FINDING-9). SEC-ENC-001 host-local loopback exception: no channel, bind or port added; DEC-0058's `artifacts` still name only the system design (FINDING-15). SEC-AUD-001: no listed event class |
| CONST-VER 1.2 | All five mechanical checks and the supplementary checks ran in this session; the Traceability Matrix gives a per-AC verdict, the S03 table a per-check verdict and the decision-record table a per-record verdict (VER-EVD-004) |

---

## Stage 1 -- Specification Compliance

The system design maps all 23 acceptance criteria and all seven S03 checks,
and the component designs map every one they own. The capability's owner
decisions are carried exactly. Against the approved blueprint and S03, the pass
removed the one fidelity break v2 found against an approved artifact (S03-1,
DEC-0081) and recorded S03 §3's *#{n}* as a departure rather than printing a
number nothing defines. Fidelity still breaks where review v2 left it: the
first-deployment semantics of AC-10 (FINDING-1), members with no row in the
current set and the as-of view (FINDING-7), the first set's currency when no
later set row exists (FINDING-8), the save withheld under a universe scope
without a recorded departure (FINDING-27) and the capability's own STD-UI
mirror (FINDING-11). The pass's own renaming of downloads leaves two surfaces
without a source (FINDING-4).

## Stage 2 -- Artifact Quality

Structure, narratives, traceability tables, test plans and security sections
are complete in every artifact, and the pass's version paragraphs say exactly
which findings each artifact applies and which it carries. Quality defects are
propagation gaps of the pass itself, an artifact it revised without applying a
decision that bears on it (FINDING-5), a decision its system design applies
without citing (FINDING-22), a decision text that overstates (FINDING-20,
FINDING-24), reference labels it left behind (FINDING-23) and wording that
outruns the SQL (FINDING-21); a provenance practice that breaks the approval
gate (FINDING-3); a package cycle (FINDING-6); and one provenance timestamp
later than its commit (FINDING-25).

---

## Verification of the Consistency Pass

Each record of the pass, checked against every artifact its `artifacts` list
names and every subject that applies it, and searched for across all eleven
subjects for the statement it supersedes.

| Record | Applied consistently? | Superseded statement still presented as current? | Residue |
|--------|-----------------------|--------------------------------------------------|---------|
| DEC-0081 (threshold excludes only stocks classified on that factor; supersedes the threshold readings of DEC-0071 and DEC-0076 (2)) | Yes, in all six artifacts it names and in universe-service (not named; consistent): system design §3.3 step 15, §4.2, §7; reader §2.5 predicate `c_{factor}.status <> 'classified' OR` the bound and its test; api §3, §7; ui §2.5, §3, §7; UX design §1.1, §4 (no departure recorded), §5; UX brief §2.1 item 6, §3, §5 | No. "fails that factor" and "fails only that factor" occur nowhere; brief §10 records DEC-0076 (2) as superseded | none |
| DEC-0082 (one `set` + `later` shape; polling from first load; *Updating* / *Score update failed* before the first set) | Yes in the five artifacts it names: system design §3.3 steps 13 and 14, §4.2, constraint 11; reader §2.3, §2.4, §7; api §2.7 (v2 shape explicitly withdrawn); ui §2.4, §2.6, §7; UX design §1.1 States, §1.2, §5 | Yes, in the UX brief, which DEC-0082 does not name: §2.1 maps `not_current` "with the building or failed later set", the nesting DEC-0082 removed | FINDING-5 (brief), FINDING-20 (the record and the system design say both reads are polled; the four lower designs poll the summary only), FINDING-21 ("the first set" against the SQL's most recent set) |
| DEC-0083 (a download named by its start time; `run_started_at` on the set, `later` and set reads; S03 §3's *#{n}* a recorded departure; supersedes DEC-0079 (e)) | Yes on the surfaces it lists: no *#412*, *#{n}* or raw UUID appears on any CAP-002 surface except as the recorded departure (system design §3.3 step 18, §8 question 11; brief §2.1 item 1, §9; UX design §0, §1.2, §7; ui §2.6, §14); `run_started_at` on `SetBlock`, `LaterBlock` and the set rows in the system design, api, reader and ui | No. *download {run_id}* survives only in ui §14's history of version 2 | FINDING-4 (Earlier scores and the never-populated latest-download line name a download whose start time no read carries) |
| DEC-0084 (nine delivered files, each with one CAP-002 owner; supersedes DEC-0069's "nothing else in the shell is edited") | Yes at file level: system design §8 question 4 is the one list; api §1, §2.1, §3, §4, §7 and ui §2.1, §2.2, §3, §6, §7 cite it; the no-secrets claim matches the delivered file | Partly: UX design §0 still says "Nothing else in the delivered shell is edited", two sentences after citing the list | FINDING-24 (the exact-label assertions at `shell.test.tsx:72–77` and `shell.unreachable.test.tsx:59–64` change too, against "nothing else") |
| DEC-0085 (the filter is the reader's `Thresholds` end to end; supersedes DEC-0079 (f)) | Yes in content in all six artifacts it names: `create_from_filter(..., thresholds: Thresholds)`, `evaluate_filter(conn, set_id, thresholds)` arity unchanged, `Origin` with `classification_date`, `hide_incomplete`, `symbol`, `filter_provenance` with all of them (system design §4.2, §4.4; universe-service §2.3, §2.4, §7; research-store §2.3 comment; reader §2.3; api §2.4, §2.7; ui §2.4, §2.7). The five component designs cite DEC-0085 | No. "without an edit" survives only in reader §2.3's statement that it is superseded | FINDING-22 (the system design never cites DEC-0085 or DEC-0079 (f)), FINDING-6 (DEC-0085's "no new dependency edge" is true, but the edges already form a package cycle) |

The two seams the pass workers reported, disposed of here:

1. **The system design pins `CAP-002-specifications-review-report` v2; the
   report's `artifact_id` is `CAP-002-specification-review`.** Confirmed
   (system design `ai_provenance.source_artifacts`; review v2 frontmatter line
   3). The other nine designs pin the correct id. Because no artifact defines
   the system design's id, `check-artifacts.py` and the gate ignore the pin;
   because the other nine pin a review report that is never approved, the gate
   will refuse them now that this report exists. Both halves are FINDING-3.
2. **System design v3 applies the FINDING-4 resolution citing review v2
   FINDING-4 but not DEC-0085, recorded after it; DEC-0085's `artifacts` names
   the system design.** Confirmed: DEC-0085 was opened at 2026-10-17T02:36:42Z,
   after the system design v3 commit `4abfe3f` (02:02:58Z); the system design's
   version paragraph says "the decisions this version made are DEC-0081 to
   DEC-0084", and its §9 rows mention DEC-0079 (a), (b) and (e) but not (f).
   The content agrees with DEC-0085 and nothing presents DEC-0079 (f) as
   current, so the gap is traceability only: FINDING-22, LOW.

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability; no finding.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py`: no error, no warning. By hand:

- **CAP-001 `requires-runtime`**: type, citations and placement correct;
  unchanged.
- **Non-dependencies** (§5.2) correctly placed.
- **`tech-stack.md` `conforms-to`**: C2, C5 and C8 honoured; C4 still not
  addressed (FINDING-14); `hypothesis` cited to a tech stack that does not list
  it (FINDING-31); OQ-TS-3 closed only provisionally (FINDING-19).
- **STD-UI `conforms-to`**: all 30 rules accounted for; no specialization of a
  `none` or `stricter-only` rule. The table still disagrees with the brief's v6
  record on STD-UI-1, STD-UI-7 and STD-UI-12 and pins STD-UI v4; the brief now
  states both values row by row and carries the revision to the owner
  (FINDING-11).
- **The proposed row for the *App shell & data health* capability**: under
  type correctness and placement no CAP-002 row is needed (FINDING-29).

#### Completeness (SR-1)

No finding. Unchanged since v2.

#### Correctness (SR-2)

No finding. The ACs do not contradict one another.

#### Testability (SR-4)

- FINDING-17: "standardised score" and non-positive bases are undefined, so
  AC-7, AC-9 and AC-12 are testable only against agent decisions.

#### Clarity (SR-6)

- FINDING-17 (above).

### System Design Specification

- **SR-1**: complete; the three diagrams carry 5, 5 and 4 sentence narratives.
- **SR-2**: error codes unique; no finding.
- **SR-3**: FINDING-12 (drift from the decomposition, reduced); FINDING-20
  (both reads polled, against the four lower designs); FINDING-21 ("the first
  set while none is complete"); FINDING-32 (`GET /api/instruments` declared
  for a consumer that does not use it).
- **SR-5**: all 23 ACs and S03-1 to S03-7 traced in §7; FINDING-3 (review pin
  id); FINDING-22 (DEC-0085 not cited); FINDING-26 (assumption 8, "nothing
  else"); FINDING-31.
- **SR-7**: FINDING-1 (§3.1 steps 5 and 21); FINDING-2 (§6 assumption 1, §8
  question 1).
- **SR-9**: FINDING-14 (C4); FINDING-19 (OQ-TS-3); FINDING-10 and FINDING-24
  (§8 question 4); FINDING-29 (§8 question 10 (a)).
- **SR-10**: no finding. Section 4.1 declares seven component identifiers;
  every diagram box and sequence participant carries one; every §4.2 row names
  a provider and a consumer component, including the new `Filter snapshot
  evaluation` (`classification-reader` to `universe-service`); the summary
  read's second consumer is the placeholder
  `shell-home-and-data-health-ui (unpublished)` with §8 question 10 recording
  the missing identifier.

### Component Design Specifications

- **classification-api (v3)**: FINDING-3; FINDING-4 (`StockHistoryResponse`
  without `run_started_at`); FINDING-9; FINDING-10; FINDING-15; FINDING-18;
  FINDING-20 (its §5 is right; the system design disagrees); FINDING-21;
  FINDING-23 (§12 "classification scheduler v1").
- **classification-reader (v3)**: FINDING-3; FINDING-4 (`HistoryRow`,
  `stock_history.sql`); FINDING-6 (imports `factorflow.universes.replay`);
  FINDING-7 (`EXISTS` scope); FINDING-8 (`current_set.sql`); FINDING-13 (§3
  guard claim); FINDING-15; FINDING-21 (§3 "later is the first set");
  FINDING-23 (§12 "research store v1", "factor engine v1"); FINDING-30 (§2.2
  narrative).
- **classification-ui (v3)**: FINDING-3; FINDING-4 (§2.3 and §2.6, the
  never-populated latest-download line); FINDING-7 (Members tab, *Member
  since*, as-of view); FINDING-8 (poll stop rule against its sequence diagram);
  FINDING-9; FINDING-10; FINDING-24 (§2.2 against its own §7 row); FINDING-28
  (origin through the events read); FINDING-30 (§2.3 narrative); FINDING-32.
- **classification-scheduler (v2)**: FINDING-1; FINDING-3; FINDING-15;
  FINDING-16.
- **factor-engine (v2)**: FINDING-1 (§6); FINDING-2; FINDING-3; FINDING-9;
  FINDING-13; FINDING-15; FINDING-17; FINDING-31.
- **research-store (v2)**: FINDING-1 (§6); FINDING-3; FINDING-13; FINDING-15;
  FINDING-34.
- **universe-service (v2)**: FINDING-3; FINDING-6 (imports
  `factorflow.classification.reader`); FINDING-7 (`Member` has no cells or
  name); FINDING-23 (§12 "research store v1", DEC-0085 missing from its
  decision row); FINDING-33.
- **SR-7, all components**: at component level the scheduler drives the
  engine, the engine and the reader read the stores, the API calls the service
  and the reader; `universe-service` and `classification-reader` reference each
  other (FINDING-6). The single build slot is protected by DEC-0067's reclaim,
  which the system design still does not carry (FINDING-12).

### UX Brief

- **SR-8**: every route the blueprint's §10 M1 row assigns CAP-002 is claimed;
  S03's view model is mapped field by field to the reads; eight states per
  region; the STD-UI-12 tier table follows blueprint §8; accessibility is
  specified; every component proposed exists. FINDING-5 (the v2 read shape and
  the never-populated state without the first set's state); FINDING-4 (§2.6,
  Earlier scores naming the download by its start time); FINDING-9 (§3 and §8
  claim no exception reaches the owner); FINDING-11 (§12.1 and capability
  §5.4); FINDING-27 (the save withheld under a universe scope).

### UX Design Specification

- **SR-8**: starts from S03 as blueprint §0 requires; every brief screen has a
  section; component mapping complete and every variant exists; tokens all
  exist; source mapping table and design source present; all 23 ACs and S03-1
  to S03-7 in the traceability tables; EDG checklist present; no
  component-spec gap. FINDING-4 (§1.1 never-populated latest-download line,
  §1.6 Earlier scores); FINDING-7 (*Member since*, as-of view); FINDING-9
  (*{failure_reason as recorded}*, now also before the first set); FINDING-24
  (§0 "Nothing else in the delivered shell is edited"); FINDING-25 (provenance
  timestamp); FINDING-27 (§1.4 "the save carries thresholds only"); FINDING-28;
  FINDING-33 (Name sortable).

### Cross-Specification Consistency (SR-3)

- CROSS-SPEC-INCONSISTENCY: first set after deployment (research-store §6,
  factor-engine §6) against the backlog (scheduler §6; system design §3.1 step
  21) (FINDING-1).
- CROSS-SPEC-INCONSISTENCY: the download's start time required on Earlier
  scores and on the never-populated latest-download line (UX design §1.1,
  §1.6; brief §2.6; ui §2.6) against reads that do not carry it
  (`StockHistoryResponse`, `HistoryRow`, system design §4.2 history row;
  `MostRecentRun`) (FINDING-4).
- CROSS-SPEC-INCONSISTENCY: the UX brief's nested `not_current` shape and its
  never-populated state against DEC-0082 as the system design, UX design and
  component designs apply it (FINDING-5).
- CROSS-SPEC-INCONSISTENCY: SEC-ERR-001 posture "inherited from ingestion-api
  §2.3" (system design §3.1 step 25) against `failure_reason` carrying
  exception text to the screen (FINDING-9).
- CROSS-SPEC-INCONSISTENCY: capability §5.4 against UX brief §12.1 on STD-UI-1,
  STD-UI-7 and STD-UI-12 (FINDING-11).
- CROSS-SPEC-INCONSISTENCY: system design §4.2 and constraint 10 against the
  decomposition's contract and DEC-0067 (FINDING-12).
- CROSS-SPEC-INCONSISTENCY: system design §4.4 and reader §3 ("every `.sql`
  file", "over `src/factorflow/`") against research-store §2.5 (migrations
  only) (FINDING-13).
- CROSS-SPEC-INCONSISTENCY: "the interface polls both reads" (system design
  §3.3 step 14, DEC-0082) against the summary-only poll of api §5, ui §2.3,
  UX design §1.2 and reader §9 (FINDING-20).

### Screen Specification Acceptance Checks (S03)

`docs/ux/README.md` has specification review check the design against the
screen specification's acceptance checks. Verdict per check:

| Check | Verdict | Evidence |
|-------|---------|----------|
| S03-1 incomplete stocks listed unless hidden | PASS (PARTIAL at v2) | A threshold applies only where the stock is classified on that factor (reader §2.5, `c_{factor}.status <> 'classified' OR` the bound; test "Thresholds exclude only stocks classified on that factor"); `hide_incomplete` excludes input reasons only and is the one control that removes an incomplete stock (reader §2.5; api §7; ui §7); the UX design's trace holds without exception and records no departure (UX design §4, §5; DEC-0081) |
| S03-2 match count over the full set | PASS, with FINDING-7 | `match_count` is `count(*)` over the `matched` CTE with scope, thresholds, prefix and `hide_incomplete` applied and paging not (reader §2.5), tested at 120 rows over pages of 50 and at 3000 end to end; under a universe scope a member with no row in the current set is silently uncounted (FINDING-7) |
| S03-3 inputs' as-of in the inspector | PASS | `factor_input.as_of` and `known_on` on the stock read; the inspector line per factor (UX design §1.1 item 3; ui §2.5) |
| S03-4 no percentile below 30 qualifying stocks | PASS | `classification_set_factor.ranked`; every cell *Not enough to rank* and the header count once (UX design §1.1; ui §2.5) |
| S03-5 filters, sort and scope survive reload and back | PASS | `research-query.ts` round-trip codec, the *Find a stock* prefix included (ui §2.4, §7) |
| S03-6 restatement mark on the percentile in results and inspector | PASS (provisional form) | `restated_possible` on every read; the mark as a composition with its words as text (DEC-0075, awaiting the owner) |
| S03-7 save every matching stock, membership kept | PASS (PARTIAL at v2), with FINDING-27 | The snapshot evaluates the one filter object, bounds, `hide_incomplete` and the search prefix, against the named set with the list's predicate (DEC-0085; reader `evaluate_filter`; universe-service §2.4), proved by the reader's "evaluate filter equals the list", universe-service's "Hidden stocks are not saved" and "Search then save", api's "Create from a result under a search" and the ui's e2e member-count check with and without a search. The save is still withheld under a universe scope without a recorded departure from S03 §3 (FINDING-27) |

### Product UX Review v4 Findings Touching S03

Unchanged from review v2's assessment except where the pass moved them:

| UX review v4 finding | Assessment at v3 |
|----------------------|------------------|
| UX review v4 FINDING-22 no search on the 3000-row list | Resolved for CAP-002 by DEC-0074 (recorded, provisional departure); the save under a search, which v2 found broken, now holds (v2 FINDING-5 fixed) |
| UX review v4 FINDING-23 renderings for retired stocks, score-update failure and the download in the as-of line | Resolved for CAP-002: the download is named by its start time with S03 §3's *#{n}* a recorded departure (DEC-0083), and a failed first set is rendered (DEC-0082); whether downloads gain a number is the owner's (system design §8 question 11) |
| UX review v4 FINDING-55 save at zero matches and incomplete membership | Resolved: the rules are specified and the saved members now equal the displayed result under search and *Hide stocks with an incomplete score* |
| UX review v4 FINDING-25, 32, 34, 42, 45, 54, 56, 57 | As review v2 assessed them; the S09 exceptions behind UX review v4 FINDING-32 remain unserved (this report's FINDING-26) |

### Disposition of Review v2 Findings

| v2 finding | v2 severity | Status at v3 | Evidence | v3 finding |
|------------|-------------|--------------|----------|------------|
| v2 FINDING-1 first-deployment backlog | HIGH | Carried | Scheduler §6 "Behaviour change after upgrade" unchanged; research-store §6 and factor-engine §6 unchanged; system design §3.1 step 21 unchanged; the scheduler's v2 paragraph names it the owner's | FINDING-1, HIGH |
| v2 FINDING-2 line-item mapping | HIGH | Carried | System design §6 assumption 1 and §8 question 1 still abstained; factor-engine unchanged | FINDING-2, HIGH |
| v2 FINDING-3 `hide_incomplete` semantics, unscoped scope | MEDIUM | Fixed | System design §3.3 step 15 ("Hide incomplete", "Scope") and §4.2 `GET /api/classifications` state input reasons only and the active roster; DEC-0071 (1) recorded as superseded by DEC-0079 (a), (b) there and in §9; `docs/architecture.md` regenerated; reader §14 question 2, api §14 question 4 and ui §14 question 4 closed | none |
| v2 FINDING-4 filter provenance without `hide_incomplete` | MEDIUM | Fixed | universe-service v2 §2.3 `create_from_filter(..., thresholds: Thresholds)`, `Origin` with `classification_date`, `hide_incomplete`, `symbol`; §2.4 `filter_provenance`; §7 tests "Filter snapshot equals the reviewed result", "Hidden stocks are not saved"; system design §4.2 `POST /api/universes`, "Universe operations", §4.4; research-store column comment; DEC-0085 names universe-service, closing v2's note on DEC-0076's `artifacts` | FINDING-22 (traceability residue) |
| v2 FINDING-5 save under *Find a stock* | MEDIUM | Fixed | `Thresholds.symbol` in reader §2.3 and api §2.4; the save posts it (ui §2.7); tests at reader ("Evaluate filter equals the list" with a prefix), universe-service ("Search then save"), api ("Create from a result under a search"), e2e (`universe-from-result.spec.ts`) | none |
| v2 FINDING-6 thresholds against S03-1 | MEDIUM | Fixed | DEC-0081 from the approved S03-1; reader §2.5 predicate and test; UX design §5 S03-1 "satisfied without exception" and §4 records no departure; brief §2.1 item 6 and §3; system design §3.3 step 15 | none |
| v2 FINDING-7 summary before the first set | MEDIUM | Fixed in the five artifacts it named | DEC-0082; one `set` + `later` shape in system design §3.3 steps 13 and 14 and §4.2, reader §2.3 and §2.4 (`ClassificationPage.later`), api §2.7 (`LaterBlock`; v2 shape withdrawn), ui §2.4 (`ClassificationSummary.later`) and §2.6 (poll from first load); UX design §1.1 States renders *Updating* or *Score update failed* before the first set | FINDING-5, FINDING-20, FINDING-21 (residues) |
| v2 FINDING-8 the download number | MEDIUM | Fixed on the surfaces it named | DEC-0083; no *#412*, *#{n}* or raw UUID on any surface except as the recorded departure; `run_started_at` on the set, `later` and set rows; S03 §3 departure recorded; system design §8 question 11 abstains on the number; ui §10 agrees with §2.6 | FINDING-4 (two further surfaces lack a source) |
| v2 FINDING-9 members with no row in the current set | MEDIUM | Carried | Reader §2.5 `EXISTS` scope; universe-service `Member` without name or cells; UX design §1.4 *Member since*, *Members as of* | FINDING-7 |
| v2 FINDING-10 not-current definition, poll stop | MEDIUM | Carried | Constraint 11 and reader `current_set.sql` unchanged; ui §2.6 changed only the start rule, and its diagram still polls after "most_recent_run terminal; later not yet building" | FINDING-8 |
| v2 FINDING-11 exception text to the owner | MEDIUM | Carried, exposure widened | factor-engine §2.3 unchanged; the never-populated state now renders the first set's `failure_reason` too (UX design §1.1; ui §2.6) | FINDING-9 |
| v2 FINDING-12 delivered-file edit set understated | MEDIUM | Changed in form | Fixed at file level: nine files listed once in system design §8 question 4 and cited by api and ui (DEC-0084); the api no longer claims no other delivered file. Two of the four shell tests also assert the exact four labels, so "four → five; nothing else" is false | FINDING-24, LOW |
| v2 FINDING-13 AGT-SCOPE-002 reading | MEDIUM | Carried | Owner confirmation still pending, now over DEC-0084's list (system design §8 question 4; api §14 question 2) | FINDING-10 |
| v2 FINDING-14 capability §5.4 against the brief | MEDIUM | Carried (brief side applied) | Brief §12 preamble and §12.1 state §5.4's value and the v6 record row by row and §9 carries `[REQUIRES INPUT]`; capability §5.4 and its STD-UI v4 pin unchanged (`check-artifacts.py` warning) | FINDING-11 |
| v2 FINDING-15 four designs pin superseded upstreams | MEDIUM | Fixed | scheduler, factor-engine, research-store and universe-service re-versioned to v2 with pins to system design v3, UX design v3 and STD-UI v6; `check-artifacts.py` no longer warns on them and `pipeline-state.py` no longer reports a stale upstream. The re-pinning added review v2 as an upstream, which breaks the gate now (FINDING-3), and left body labels behind (FINDING-23) | FINDING-3, FINDING-23 (introduced by the fix) |
| v2 FINDING-16 system design drift | MEDIUM | Carried, reduced | `run_outcome`, `started_at`, `latest_trading_day` and the never-classified shape are now in system design §4.2; DEC-0067's reclaim and timeout, the `name` prefix, `origin` on `GET /api/universes/{id}`, `min_peer_set_size`, `unknown_symbols`, three codes, the completion UPDATE and `name` on stock rows are not | FINDING-12 |
| v2 FINDING-17 append-only guard coverage | MEDIUM | Carried | research-store §2.5, reader §3 and system design §4.4 unchanged | FINDING-13 |
| v2 FINDING-18 C4 not addressed | MEDIUM | Carried | No occurrence of C4 in the system design | FINDING-14 |
| v2 FINDING-19 DEC-0058 `artifacts` | MEDIUM | Carried | DEC-0058 still names only the system design; five component designs cite the exception | FINDING-15 |
| v2 FINDING-20 build timeout equals the budget | MEDIUM | Carried | Scheduler §2.3 `build_timeout_seconds` 300 | FINDING-16 |
| v2 FINDING-21 capability arithmetic | MEDIUM | Carried | Capability unchanged | FINDING-17 |
| v2 FINDING-22 universe name length | MEDIUM | Carried | Still `[REQUIRES INPUT]` in system design §8 question 2, api §2.4, brief §5, UX design §7, ui §14 | FINDING-18 |
| v2 FINDING-23 OQ-TS-3 | MEDIUM | Carried | `tech-stack.md` v5 OQ-TS-3 unchanged | FINDING-19 |
| v2 FINDING-24 S09's incomplete count | LOW | Carried | Assumption 8 and `ClassificationSummaryResponse` unchanged | FINDING-26 |
| v2 FINDING-25 save under a universe scope | LOW | Carried, reduced | Brief §2.1 item 6 and UX design §1.1 now say the filter carries "no scope" (the "the scope" wording is corrected); the departure is still absent from UX design §4's list, and UX design §1.4 still says "the save carries thresholds only" | FINDING-27 |
| v2 FINDING-26 origin through the events read | LOW | Carried | ui §2.3 edge and §14 question 7; UX design §1.3 and §7 | FINDING-28 |
| v2 FINDING-27 proposed §5.1 row | LOW | Carried | System design §8 question 10 (a); brief §9; UX design §7; ui §14 question 2 | FINDING-29 |
| v2 FINDING-28 unrecorded recommendations, dangling citation | LOW | Fixed (side effect of the pass) | No subject cites a "decomposition report" (reader §14 question 2 and ui §14 question 4 closed); of the six recommendations, four are resolved (v2 FINDING-3, 4, 7, 8) and the rest are recorded in FINDING-12 | none |
| v2 FINDING-29 two long narratives | LOW | Carried | Reader §2.2 and ui §2.3 still six sentences each | FINDING-30 |
| v2 FINDING-30 `hypothesis` citation | LOW | Carried | System design §4.3 unchanged | FINDING-31 |
| v2 FINDING-31 unused `GET /api/instruments` | LOW | Carried | System design §4.2 row; ui §11 | FINDING-32 |
| v2 FINDING-32 universe name sort | LOW | Carried | UX design §1.3 Name "sortable"; api §11 no `sort` | FINDING-33 |
| v2 FINDING-33 rollback citation | LOW | Carried | research-store §6 "the accepted cost the system design section 4.4 names" | FINDING-34 |
| v2 FINDING-34 provenance timestamps | LOW | Changed in form | The six artifacts it named now carry timestamps before their commits (system design 01:55Z against `4abfe3f` 02:02:58Z; brief 02:10Z against `be04c84` 02:12:24Z; the four re-versioned designs 02:35Z against `1897b94` 02:48:57Z, so their own "FINDING-34 carried" statements are no longer true); the UX design v3's 02:40Z is later than `25fb3e6` (02:27:57Z) | FINDING-25, LOW |

Summary: fixed 8 (v2 FINDING-3, 4, 5, 6, 7, 8, 15, 28); changed in form 2
(v2 FINDING-12, 34); carried 24 (v2 FINDING-1, 2, 9, 10, 11, 13, 14, 16 to 27,
29 to 33).

---

## Findings Summary Table

CRITICAL 0 · HIGH 2 · MEDIUM 17 · LOW 15 · **total 34**

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-7, SR-3 | classification-scheduler; research-store; factor-engine; system design | scheduler §2.4 (`qualifying_run.sql`), §5 "Backlog", §6 "Behaviour change after upgrade"; research-store §6 "Data migration"; factor-engine §6; system design §3.1 steps 5 and 19 to 21 | Carried from v2 FINDING-1, untouched by the pass: every CAP-001 run that ended `succeeded` or `partial` before deployment qualifies, and the scheduler claims them oldest first, one set per run, each dated the day it is built; the research-store and factor-engine designs say the first set follows the first qualifying run after deployment | First deployment appends one permanent set per historical run to C5 history, each naming an old `run_id` while computed from the store as it stands that day (AC-21 misstated); a run ending during the backlog waits behind it (AC-11); implementing either reading leaves the other designs wrong | Decide in the system design which runs qualify at first deployment and whenever several wait (for example only the latest qualifying run without a set); align scheduler, research-store and factor-engine §6 and record the choice |
| FINDING-2 | HIGH | SR-7, SR-1 | factor-engine; system design; capability | system design §6 assumption 1, §8 question 1 (abstained); factor-engine §2.3 step 3, §2.4 `LINE_ITEMS`, §14 question 1; capability §6 assumption 1 | Carried from v2 FINDING-2: the payload keys and sign conventions of the seven line items, and whether a quarterly statement exists for every fiscal quarter including the fourth, are unvalidated; the fixtures hold four balance-sheet keys | Until answered every value and growth input is `missing`, so two of three factors never classify in production and AC-7, AC-9 and AC-23 are demonstrable for momentum only; if fourth-quarter figures exist only in annual statements, DEC-0055 (1)'s trailing-twelve-month derivation must change | Owner: answer §8 question 1 against statements from a real Financials run, including quarterly Q4; revise DEC-0055 (1) and the engine's statements stage if needed, before the value and growth stories are planned |
| FINDING-3 | MEDIUM | SR-5, SR-3 | all ten designs; `scripts/artifact-gate.py` | system design `ai_provenance.source_artifacts` (`CAP-002-specifications-review-report` v2); the other nine designs' `source_artifacts` (`CAP-002-specification-review` v2); review v2 frontmatter line 3 (`artifact_id: CAP-002-specification-review`); `scripts/artifact-gate.py` `upstream_errors` (lines 267 to 296), called from `gate_errors` (line 471) and `approve` (line 539) | The pass added review v2 as an upstream of every design. The system design's id names no artifact, so `check-artifacts.py` and the gate ignore that pin. The nine others pin the right id at v2; review reports carry no approval, so with this report present `upstream_errors` returns *upstream CAP-002-specification-review is stale: artifact records v2, current version is v3 and is not approved* for each of the nine (verified over a copy of the repository with a v3 report in place) | `artifact-gate.py approve` and `require` refuse the UX brief, the UX design and all seven component designs against this report; a waiver cannot clear it (waivers cover only a blocking review verdict); re-pinning to v3 changes the content revisions this report binds and repeats the problem at the next review; only the system design's malformed pin lets it through | Owner, before attempting approval: either remove the review report from `source_artifacts` in all ten designs (the version paragraphs already cite it) and correct the system design's id in the same revision, accepting a fresh review of the changed revisions; or, through a harness change outside this project, have `upstream_errors` skip upstreams whose `artifact_type` is a review, as `check-artifacts.py`'s `check_upstream_pins` already treats review reports. Do not re-pin to v3 |
| FINDING-4 | MEDIUM | SR-3, SR-1 | UX design; UX brief; classification-ui; classification-api; classification-reader; system design | UX design §1.6 Earlier scores ("Download (its start time, linked to its detail, with its outcome badge; DEC-0083)") and §7 question 11; brief §2.6 (earlier scores' download "named by its start time"); system design §4.2 `/history` row (`classification_date` and `run_id` only); api §2.7 `StockHistoryResponse` (`set_id, classification_date, run_id, run_outcome, ended_at, factors`); reader §2.3 `HistoryRow`, §2.6 `stock_history.sql`; DEC-0083 (lists `run_started_at` on four reads, not `/history`). UX design §1.1 States "Empty, never populated" (*The latest download, started {time}, is Downloading* / *ended Failed at {time}: {reason}*); ui §2.3 (the health poll as the only source), §2.6; delivered `src/factorflow/api/models.py:169–179` (`MostRecentRun`: `run_id`, `state`, `ended_at`) | CROSS-SPEC-INCONSISTENCY: DEC-0083 names every download by its start time, but two surfaces that name one have no read carrying it: each Earlier scores row, whose read returns `run_id` and `run_outcome` only, and the never-populated state's latest-download line, whose only specified source is `GET /api/health`'s `most_recent_run`, which carries no start time and no failure reason | AC-18 and AC-21 on the evidence page and the AC-22 empty state cannot be rendered as specified without inventing a field or a request; the easy fallback, printing `run_id`, is what DEC-0083 forbids | Add `run_started_at` to `HistoryRow`, `stock_history.sql`, `StockHistoryResponse`, the system design's `/history` row and DEC-0083; for the latest-download line, name the read in ui §2.3 and §2.6 (for example `GET /api/acquisition-runs/{id}` for `most_recent_run.run_id`, reused unchanged, whose run summary carries `started_at` and `failure_reason`) or drop the start time and reason from that line |
| FINDING-5 | MEDIUM | SR-3, SR-8 | UX brief; DEC-0082 | brief §2.1 data element `classificationSet` ("`not_current` with the building or failed later set and its `failure_reason`"); §2.2 data elements ("Source: the `set` block") and headline states ("A fourth, never scored … with the latest download's state"); §3 row "Read the scored stocks"; §12.4 S03 results "Empty, never populated"; §10 row for DEC-0082 ("not this brief's"); DEC-0082 `artifacts` (brief absent) | CROSS-SPEC-INCONSISTENCY: the brief is the one v3 artifact that still describes the shape DEC-0082 replaced, the later set nested in `set.not_current`, and its never-populated state omits the first set's *Updating* and *Score update failed* with its reason, which DEC-0082, system design §3.3 step 14 and UX design §1.1 require | Two governed UX artifacts up for approval disagree on the read shape and on the AC-20 rendering before the first set; a test written from the brief's §3 or §12.4 omits the first-set failure | Revise brief §2.1, §2.2, §3 and §12.4 to the `set` + `later` shape and the never-populated renderings of UX design §1.1, and add the brief to DEC-0082's `artifacts` |
| FINDING-6 | MEDIUM | SR-7 | universe-service; classification-reader; DEC-0085 | universe-service §1 Dependencies and §2.3 (`from factorflow.classification.reader import Thresholds`; `create_from_filter` calls `evaluate_filter`); reader §1 Dependencies, §2.5 "Scope", §3 assumption (`membership_as_of.sql` "importable from `factorflow.universes.replay`"); DEC-0085 derivation ("adds no new dependency edge"); CONST-SA SA-CLASS-002 | `factorflow.universes` imports `factorflow.classification.reader` and `factorflow.classification.reader` imports `factorflow.universes.replay`: a package-level cycle. It predates the pass (v1's `evaluate_filter` call and replay import) and neither earlier review raised it; DEC-0085 is right that the type import adds no edge, and it makes the coupling a type dependency | SA-CLASS-002 (High, agent-checkable) forbids circular dependencies between packages or modules; the modules stay acyclic only while `replay.py` imports nothing from the service, and package cycle detection at review will flag either story | Place the shared pieces in a module neither package owns (the filter type and predicate, or the membership replay SQL), or record the owner's acceptance of the cycle; update both component designs and DEC-0085's derivation |
| FINDING-7 | MEDIUM | SR-3, SR-1 | classification-reader; classification-api; universe-service; UX design; classification-ui | reader §2.5 `scope` CTE (`AND EXISTS (SELECT 1 FROM factor_classification c WHERE c.set_id = ...)`), §2.3; api §2.7 `UniverseResponse.members[].factors`; universe-service §2.3 `Member` (no name, no cells); UX design §1.4 (*Member since*, *Members as of*, *{n} of {m} members match*); ui §2.1 `members-tab.tsx`, §2.3 (members table from `GET /api/classifications`) | Carried from v2 FINDING-9: (a) a member or compared stock covered after the current set was built has no row in it and is silently dropped from the universe-scoped list and from compare, not reported in `unknown_symbols`, while `member_count` counts it; (b) no reader operation supplies cells for `GET /api/universes/{id}` members, which the as-of view needs; (c) the Members table's *Member since* has no source on the list read it is built from | *{n} of {m} members match* disagrees with its rows (STD-UI-16, flow 4 step 5); the as-of view and *Member since* cannot be implemented without inventing a read | Give an instrument with no row in the current set a stated state on the list, compare and universe reads; add a reader operation returning cells for a member list (or an `as_of` on the scoped list) and `member_since` on universe-scoped rows |
| FINDING-8 | MEDIUM | SR-3, SR-2 | system design; classification-reader; classification-ui | system design constraint 11; reader §2.4 `current_set.sql` (`later` from `classification_set` rows only); ui §2.6 stop rule and its sequence diagram (the note "health poll reports most_recent_run terminal; later not yet building" followed by a summary poll) | Carried from v2 FINDING-10: not-current is derived only from a later set row, so a run that ended `succeeded` or `partial` with no set yet (the claim gap, a backlog, a scheduler loop failing every iteration, which only logs) leaves the previous set unmarked, and the poll stops when no set is building and the health poll reports the download terminal; the ui's own diagram keeps polling through that gap. DEC-0082 changed the start rule only | AC-20's mark is missing in those cases and the screen stops refreshing until a reload; a stuck scheduler is invisible to the owner | Define not-current against the latest qualifying run (constraint 11, reader §2.4) and keep polling while such a run lacks a complete set; make the ui rule and diagram agree |
| FINDING-9 | MEDIUM | SR-8, SR-3, SR-9 | factor-engine; system design; UX design; UX brief; classification-ui | factor-engine §2.3 (`fail_set.sql`, reason = exception class name and message), §4; system design §3.1 step 25; UX design §1.1 States (never-populated *Score update failed {time}: {reason}*), §1.2 banner (*{failure_reason as recorded}*) and `toast` `error`; brief §3 preamble and §8 EDG row; ui §2.6 | Carried from v2 FINDING-11, exposure widened: the failed-set reason is the Python exception class and message, returned by the list, summary and sets reads and rendered verbatim in the banner, a toast and now the never-populated state (DEC-0082); both UX artifacts claim no exception reaches the owner | The one critical-tier state CAP-002 renders breaks STD-UI-1 v6 and the EDG claims, and puts database error text in API responses against SEC-ERR-001 | Record a product-vocabulary reason in `failure_reason` and keep the exception detail in the structured log keyed by `set_id`, or map exception classes to fixed sentences |
| FINDING-10 | MEDIUM | SR-9 | system design; classification-api; classification-ui; DEC-0069; DEC-0084 | system design §8 question 4; DEC-0069; DEC-0084 (PROVISIONAL); api §2.3, §14 question 2; ui §2.2; blueprint §12 D-8 | Carried from v2 FINDING-13: registering routers and the scheduler in `app.py`, appending a rail destination and five routes, exporting `requestJson` and editing five delivered tests touch files owned by delivered CAP-001 components; the reading that this is CAP-002's own composition work remains an agent's, now over DEC-0084's nine-file list | Every CAP-002 route, the scheduler and the reachable interface wait on this answer | Owner: confirm or replace the reading against the list (corrected per FINDING-24), and say where the changed composition is documented without amending CAP-001 |
| FINDING-11 | MEDIUM | SR-9, SR-3 | capability; UX brief | capability §5.4 rows STD-UI-1, STD-UI-7 (`partial`), STD-UI-12 and the preamble ("the two must agree"); capability `ai_provenance` STD-UI v4 (current v6); brief §12 preamble, §12.1 rows STD-UI-1, STD-UI-7, STD-UI-12, §9 | Carried from v2 FINDING-14 with its brief side applied: the brief now states §5.4's value beside its v6 record row by row and hands the revision to the owner; the checked mirror still disagrees on three rules and pins the superseded standard | The machine-checked mirror misstates conformance against the standard in force, and a later STD-UI change derives its blast radius from it | Owner: revise capability §5.4 and its STD-UI pin to v6 to match brief §12.1 |
| FINDING-12 | MEDIUM | SR-3 | system design | system design §3.1 steps 14 and 25 to 27, constraint 10, §4.2 rows `GET /api/universes`, `GET /api/universes/{id}`, `GET /api/classifications` and "Classification append", §4.4 `classification_set` writers; scheduler §14 question 1; api §2.5, §2.7, §11; reader §2.3; DEC-0065; DEC-0067 | Carried from v2 FINDING-16, reduced: version 3 now carries `run_outcome`, `started_at`, `latest_trading_day` and the never-classified shape, but still omits DEC-0067's start-up reclaim and build timeout (which make `classification-scheduler` a second writer of the state transition), the `name` prefix on `GET /api/universes`, `origin` on `GET /api/universes/{id}`, `min_peer_set_size`, `unknown_symbols`, the codes `classification_set_not_found`, `cursor_invalid` and `cursor_stale`, the completion UPDATE ("state fields only") and `name` on stock rows | The design epic generation and test design read first understates the reliability mechanism and the API contract | Revise the system design to carry these, or record why each stays component-level |
| FINDING-13 | MEDIUM | SR-3, SR-7 | research-store; factor-engine; classification-reader; system design | research-store §2.5 item 2; factor-engine §3; reader §3 ("The append-only guard over `src/factorflow/` covers it"); system design §4.4 ("scans every `.sql` file"); `tests/unit/test_sql_is_append_only.py` | Carried from v2 FINDING-17: CAP-002's statements live in `.sql` files under `src/factorflow/classification/sql/` and `src/factorflow/universes/sql/`, which the research-store guard does not scan; the delivered helper cannot take another table list without editing the delivered test | The C5 enforcement the system design marks "critical, unrecoverable if wrong" has a coverage hole | Widen the guard to every `.sql` file under `src/factorflow/`, share the matcher through a new module, and correct factor-engine §3 and reader §3 |
| FINDING-14 | MEDIUM | SR-9 | system design; capability | capability §5.1 row `docs/constitution/tech-stack.md` (C2, C4, C5, C8); system design (no occurrence of C4); §4.2 "Observation read" | Carried from v2 FINDING-18: the system design states how C2, C5 and C8 are honoured but never C4; the engine reads the store's tables directly | The capability's own "Satisfied when" cannot be confirmed, and M4 inherits an undecided reading (AGT-SCOPE-005) | State how classification honours C4 and surface the reading to the owner |
| FINDING-15 | MEDIUM | SR-9 | DEC-0058; five component designs | DEC-0058 `artifacts` (system-design.md only); classification-api §4, classification-reader §4, classification-scheduler §4, factor-engine §4, research-store §4 | Carried from v2 FINDING-19: CONST-SEC 1.3 requires the decision recording reliance to name every design citing the `SEC-ENC-001 host-local loopback exception`; five component designs cite it and are not named | Consumer discovery for re-review on any change to the exception misses five designs | Name the five designs in the `artifacts` of DEC-0058 or of a superseding record |
| FINDING-16 | MEDIUM | SR-7 | classification-scheduler; factor-engine | scheduler §2.3 (`build_timeout_seconds` default 300), §3 "No retry", §14 question 2; factor-engine §7 volume test; DEC-0067 | Carried from v2 FINDING-20: the build timeout equals the whole AC-11 budget and a timed-out set is not retried until the next qualifying run | A store that consistently builds past 300 seconds never produces a new set; the trade-off is the owner's (AGT-SPEC-002) | Owner: decide the timeout separately from the budget and whether a timed-out build is retried |
| FINDING-17 | MEDIUM | SR-6, SR-4 | capability | capability §2 factor definitions; AC-7, AC-9, AC-12; system design constraints 7 and 8, §8 questions 6, 7 and 9; DEC-0053; DEC-0055 (2) | Carried from v2 FINDING-21: "standardised score", a non-positive growth base and a non-positive market capitalisation are undefined in the capability, and AC-12 names two input statuses while the designs add `not_computable` | Every set writes these provisional choices into append-only history the M4 backtest will replay | Owner: uphold DEC-0053 and DEC-0055 (2) and amend capability §2 and AC-12, or define them differently in a capability revision |
| FINDING-18 | MEDIUM | SR-9, SR-1 | system design; classification-api; UX brief; UX design; classification-ui | system design §8 question 2, constraint 15; api §2.4 `MAX_UNIVERSE_NAME_LENGTH`; brief §5, §9; UX design §7; ui §14 question 1 | Carried from v2 FINDING-22: no artifact bounds the universe name | SEC-INP-001 (High) requires a maximum length on every external string field; the create and rename routes cannot conform | Owner: state the bound |
| FINDING-19 | MEDIUM | SR-9 | system design; tech-stack | `tech-stack.md` OQ-TS-3 (resolver "Capability owner", blocks "Classification and backtest implementation"); system design §4.3 and §8 question 3; DEC-0052 | Carried from v2 FINDING-23: the approved tech stack still records the numeric library as open and blocking; only an agent's provisional decision closes it | Implementation planning would proceed against an approved artifact that says it is blocked | Owner: uphold or replace DEC-0052 and amend OQ-TS-3 through `$tech-stack` before implementation planning |
| FINDING-20 | LOW | SR-3 | system design; DEC-0082 | system design §3.3 step 14 ("The interface polls both reads every 10 seconds from first load") and §3.1 step 15; DEC-0082 decision (same words); against api §5 ("polls `GET /api/classifications/summary`, not the list") and §9, ui §2.3 ("Only the score-set state polls"), §2.6 and §5, UX design §1.2 "Polling", reader §9 | CROSS-SPEC-INCONSISTENCY: the system design and the record say both reads are polled; every lower design polls the summary and reloads the list once on completion | A test written from the system design expects the 3000-row list re-read every 10 seconds; the component designs size the poll on the summary | Amend system design §3.3 step 14, §3.1 step 15 and DEC-0082 to the summary poll with one list reload on completion |
| FINDING-21 | LOW | SR-6, SR-3 | system design; classification-api; classification-reader; classification-ui; DEC-0082 | system design §3.3 step 13 and §4.2 (`later`: "the most recent set newer than `set`, or the first set while none is complete"); DEC-0082; api §2.7 `LaterBlock`; reader §2.3 `LaterSet`, §3 ("before any complete set, `later` is the first set"); ui `LaterSet` comment; against reader §2.4 `current_set.sql` (most recent `started_at` after `-infinity`) | While no set is complete the SQL returns the most recent set, so after a failed first attempt and a building second one `later` is the second, not "the first set" the contract text names | A test written from the contract could assert the failed first set; the SQL's behaviour is the sensible one | Reword as "the most recent set, while none is complete" in all five places and the record |
| FINDING-22 | LOW | SR-5 | system design; DEC-0085 | system design version 3 paragraph ("The decisions this version made are DEC-0081 to DEC-0084"), §3.2 narrative, §3.3 step 15, §4.2 `POST /api/universes`, "Universe operations", "Filter snapshot evaluation", §4.4 `universe_event` row (each citing review v2 FINDING-4 and FINDING-5 only), §9 rows for decision records (DEC-0079 (a), (b), (e), not (f)), §10; DEC-0085 `artifacts` and decision ("Applied by system design v3"), opened 02:36:42Z after commit `4abfe3f` (02:02:58Z) | The system design applies DEC-0085's resolution and is named in its `artifacts`, but never cites it or records DEC-0079 (f)'s supersession; the five component designs do. No superseded statement is presented as current | A reader of the design epic generation reads first cannot find the record that withdrew DEC-0079 (f)'s rejection, and the record's blast radius names a design that does not cite it | Cite DEC-0085, superseding DEC-0079 (f), in §3.3 step 15, §4.2, §4.4 and §9 at the next revision |
| FINDING-23 | LOW | SR-5 | classification-reader; classification-api; universe-service | reader §12 ("CAP-002 research store v1", "CAP-002 factor engine v1"); api §12 ("classification scheduler v1"); universe-service §12 ("CAP-002 research store v1"; its decision-records row omits DEC-0085, which its own version paragraph and §2.3 apply) | Body references name component-design versions superseded in the same pass (each is now v2); the frontmatter pins are correct, so `check-artifacts.py` cannot see these | A reader follows a stale version label | Update the labels and add DEC-0085 at the next revision |
| FINDING-24 | LOW | SR-9, SR-3 | system design; classification-ui; UX design; DEC-0084 | system design §8 question 4 rows for `shell.test.tsx` and `shell.unreachable.test.tsx` ("four → five; nothing else") and "no other delivered test is touched"; DEC-0084 ("no other assertion in the four files changes"); ui §2.2 (same words) against its own §7 "Shell composition" row ("in the fixed order ending in Research"); UX design §0 ("Nothing else in the delivered shell is edited"); delivered `web/src/app/shell.test.tsx:72–77` and `shell.unreachable.test.tsx:59–64` (`toEqual(["Coverage", "Instruments", "Runs", "Settings"])`) | Changed in form from v2 FINDING-12: the file list is now complete, but two of the four tests also assert the exact four labels, which fail once Research is appended, so the claim that only the counts change is false; UX design §0 keeps DEC-0069's superseded wording | The AGT-SCOPE-002 edit description the owner is asked to confirm (FINDING-10) is still understated at assertion level; a story following "nothing else" breaks CAP-001's suite | Add the two label assertions to the §8 question 4 table and DEC-0084; align ui §2.2 with its §7 row; reword UX design §0 to cite the list instead of "nothing else" |
| FINDING-25 | LOW | SR-5 | UX design | UX design `ai_provenance.timestamp` 2026-10-17T02:40:00Z against commit `25fb3e6` (2026-10-17T02:27:57Z), the last commit to touch the file | Changed in form from v2 FINDING-34: the six artifacts v2 named now carry timestamps earlier than their commits; the UX design v3's is twelve minutes later than its commit | AGT-PROV-001 requires the production timestamp; this is not it | Correct the timestamp at the next revision |
| FINDING-26 | LOW | SR-5, SR-3 | system design; classification-api; DEC-0071 | system design §6 assumption 8 ("through the summary read and nothing else"), §4.2 summary row; api §2.7 `ClassificationSummaryResponse`; DEC-0071 derivation (cites S09's `exceptions`); S09 §3, §5, §11 | Carried from v2 FINDING-24: the summary carries `stocks_current` but neither a count of stocks shown *Incomplete*, which also covers `not_computable`, nor the named exceptions S09's *Factor scores* card renders | The shell capability will need a CAP-002 contract change or a second read the system design says it will not use | Add an incomplete count and a bounded exception list to the summary, or drop "nothing else" and name the read S09 will use |
| FINDING-27 | LOW | SR-8, SR-3 | UX design; UX brief; classification-ui | S03 §3 (the Results header carries **Save these {n} as a universe…** for every scope); brief §2.1 item 6; UX design §1.1 "Saving the result as a universe", §1.4 ("because the save carries thresholds only"), §4 EDG departures list; ui §2.7 | Carried from v2 FINDING-25, reduced: the brief and UX design §1.1 now say correctly that the filter carries no scope, but the save is still withheld under a universe scope without the departure appearing in UX design §4's list, and §1.4 still gives the superseded reason "thresholds only" | An unrecorded departure from an approved screen | Record the departure with its reason, or support the scope in the snapshot, and correct §1.4's reason |
| FINDING-28 | LOW | SR-3 | classification-ui; UX design; DEC-0065 | ui §2.3 (the Universes screen's edge to the events read labelled *origin on expansion*), §14 question 7; UX design §1.3 (origin line "read once per expansion from the universe's `created` event"), §7 last item; DEC-0065 alternatives rejected | Carried from v2 FINDING-26: the universes list reaches each row's origin line by paging the newest-first events read to its oldest event, the approach DEC-0065 rejected; `UniverseListResponse` carries no origin | Each expansion of a long-lived universe walks its whole event log | Add `origin` to the rows of `UniverseListResponse` or record why DEC-0065's rejection no longer holds |
| FINDING-29 | LOW | SR-9 | system design; UX brief; UX design; classification-ui | system design §8 question 10 (a) ("most likely as `requires-runtime` for the rail entry"); brief §9; UX design §7; ui §14 question 2 | Carried from v2 FINDING-27: the proposed §5.1 row would be over-typed and misplaced: CAP-002 is buildable and runnable without the shell capability, and the summary read's consumer relation is the shell capability's dependency on CAP-002 | Recording it as proposed invents an integration-order constraint and an apparent cycle | Owner: record no CAP-002 §5.1 row for it (at most a §5.2 note), and have the shell capability declare its dependency on `GET /api/classifications/summary` |
| FINDING-30 | LOW | SR-1 | classification-reader; classification-ui | reader §2.2 narrative (six sentences); ui §2.3 narrative (six sentences) | Carried from v2 FINDING-29: two diagram narratives exceed the rubric's three to five sentences | Cosmetic | Trim each to five sentences |
| FINDING-31 | LOW | SR-5, SR-9 | system design; factor-engine | system design §4.3 key libraries (`hypothesis`, source "tech-stack v5"); factor-engine §7 | Carried from v2 FINDING-30: `tech-stack.md` v5 does not list `hypothesis` | A conformance claim rests on a citation that does not support it | Cite `pyproject.toml`, or have the owner add it to the tech stack |
| FINDING-32 | LOW | SR-3 | system design; classification-ui | system design §4.2 row `GET /api/instruments` (consumer `classification-ui`, "for picking members by symbol"); ui §11 ("not required by any CAP-002 screen") | Carried from v2 FINDING-31: a declared interface has no consuming screen | An unused interface appears in the architecture inventory | Remove the row or name the screen that uses it |
| FINDING-33 | LOW | SR-8, SR-3 | UX design; classification-api; universe-service | UX design §1.3 (Name column "sortable"); api §11 `GET /api/universes` (no `sort`); universe-service §2.5 (pages by `created_at`) | Carried from v2 FINDING-32 | A sort over one loaded page would be silently wrong (STD-UI-30) | Add a name sort to the API and service, or drop sortability |
| FINDING-34 | LOW | SR-5 | research-store | research-store §6 "Rollback" ("the accepted cost the system design section 4.4 names") | Carried from v2 FINDING-33: system design §4.4 names the dump-and-restore path but no loss of universes created after the upgrade | The citation implies an acceptance that is not recorded | Record the cost in the system design or cite where the owner accepted it |

---

## Traceability Matrix

Per-AC verdict (VER-EVD-004). "Mapped" means the AC traces to system design,
component and, where it has UX implications, UX design elements that would
satisfy it as written.

| AC | System design | Component design(s) | UX design | Verdict |
|----|---------------|---------------------|-----------|---------|
| AC-1 | 3.2 steps 4, 4a; 5.13 | universe-service 2.4, `coverage_check.sql`; api 2.5 | 1.3 create dialog; 1.1 and 1.4 **Add to universe…** | Mapped |
| AC-2 | 3.2 step 3a; 3.3 step 15; 4.2; 4.4; 5.14 | universe-service `create_from_filter` with `Thresholds`; reader `evaluate_filter`; api 2.4 | 1.1 **Save these {n} as a universe…**; 1.3, 1.4 origin line | Mapped with defect (FINDING-27); v2 FINDING-4 and FINDING-5 closed |
| AC-3 | 4.2; 4.4 | research-store; universe-service | 1.3; 1.1 *Look in*; memberships line | Mapped |
| AC-4 | 3.2 steps 8, 11, 12 | universe-service 2.4 | 1.4 | Mapped |
| AC-5 | 3.2 step 7; 5.13 | universe-service 2.4 | 1.3, 1.4 `blocked`; 1.1 save at zero matches | Mapped |
| AC-6 | 4.4; 5.3 | research-store; universe-service 2.5 | 1.4 History, *Members as of* | Mapped with defect (FINDING-7) |
| AC-7 | 5.7; 5.8 | factor-engine 2.4, 2.5 | 1.5, 1.6 | Mapped; value and growth not demonstrable until FINDING-2; arithmetic per FINDING-17 |
| AC-8 | 5.5 | factor-engine 2.5; reader 2.5 | 1.1 scope | Mapped |
| AC-9 | 3.3 step 15; 5.7 | factor-engine 2.5; research-store | 1.1 factor cell; inspector | Mapped; method provisional (FINDING-17) |
| AC-10 | 3.1 steps 4 to 7a, 19 to 21; 5.10 | classification-scheduler 2.4 | 1.2 | Mapped with defect (FINDING-1) |
| AC-11 | 3.1 steps 28 to 31 | factor-engine 5, 7; scheduler 2.3 | 1.1 `virtualised`; 1.2 poll | Mapped with defects (FINDING-1, FINDING-16) |
| AC-12 | 3.1 step 12; 3.3 step 15; 5.6 | factor-engine 2.5; reader 2.5 (DEC-0081) | 1.1, 1.5, 1.6 *Incomplete* | Mapped with defect (FINDING-7); v2 FINDING-6 closed |
| AC-13 | 3.3 step 18; 5.6; 5.8 | factor-engine 2.4; reader 2.4 summary | 1.6; 1.2 current-stock count | Mapped |
| AC-14 | 3.1 steps 9, 11a | factor-engine 2.3 step 6, 2.5 | 1.1 header count | Mapped |
| AC-15 | 3.2 step 10; 3.3 step 15; 5.5 | factor-engine 2.5; reader 2.5 scope | 1.1 (universe scope), 1.4, 1.5, 1.6 *Not followed* | Mapped |
| AC-16 | 3.3 steps 15, 16 | reader 2.5; api 2.4 | 1.1, 1.4, 1.5 | Mapped with defect (FINDING-7) |
| AC-17 | 3.3 step 17 | factor-engine 2.4 `detail`; reader 2.6 | 1.1 inspector; 1.6 | Mapped |
| AC-18 | 4.2 `/history`; 4.4 | reader 2.6 `stock_history`; api `StockHistoryResponse` | 1.6 Earlier scores | Mapped with defect (FINDING-4: the Download column has no source) |
| AC-19 | 3.1 steps 22 to 24; 5.4 | factor-engine 3; scheduler `claim_set.sql` | 1.6 | Mapped |
| AC-20 | 3.1 steps 13, 14b, 25 to 27; 3.3 steps 13, 14, 18; 5.11 | reader 2.4 `later`; api `LaterBlock`; ui 2.6 | 1.2 banner; 1.1 and 1.6 never-populated state | Mapped with defects (FINDING-8, FINDING-9; FINDING-5 in the brief; FINDING-20, FINDING-21); v2 FINDING-7 closed |
| AC-21 | 3.3 steps 13, 18; 4.2; 8 question 11 | reader 2.4 `run_started_at`; api `SetBlock`; ui 2.6 | 1.2 as-of line; set history | Mapped with defects (FINDING-1, FINDING-4); v2 FINDING-8 closed |
| AC-22 | 3.3 step 14 | reader 2.4; api 2.7 | 1.1, 1.5, 1.6 never-scored states | Mapped (FINDING-4 for the latest-download line; FINDING-5 for the brief) |
| AC-23 | 5.9 | factor-engine 2.4, 2.5; research-store | every scored surface (DEC-0075) | Mapped; in production only after FINDING-2 |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No finding is CRITICAL: no AC contradicts another, no core requirement is
untestable, and nothing in the specifications prevents epic generation, story
generation or test design from starting. Two HIGH findings exist, both carried
from review v1 through v2 and both outside the pass: FINDING-1 is a design
defect that would write permanent, misattributed sets on first deployment;
FINDING-2 is the owner's answer that two of the three factors depend on.

One MEDIUM finding stands in front of the approval step itself. **FINDING-3**:
with this report present, `artifact-gate.py` refuses the UX brief, the UX
design and all seven component designs, because each pins review v2 as an
upstream and a review report is never approved; the system design escapes only
because its pin names an id that does not exist. The owner should resolve it,
by a design revision followed by a fresh review or by the harness change the
finding describes, before attempting `artifact-gate.py approve` on any subject.

Of the other sixteen MEDIUM findings, three are new and are design corrections
this review recommends before approval: FINDING-4 (a download's start time on
two surfaces), FINDING-5 (the brief's stale read shape) and FINDING-6 (the
package cycle). Thirteen are carried from v2 as the owner left them; six of
those await only an owner answer or verdict (FINDING-10, FINDING-11 and
FINDING-16 to FINDING-19).

Every schema-versioned specification in scope (the capability, the system
design, the UX brief, the UX design and the seven component designs) remains
`draft` and is blocked from epic generation and test design until the owner
explicitly approves it with `scripts/artifact-gate.py approve`, naming this
report as `--review-artifact`. This review approves nothing. The decision
records DEC-0052 to DEC-0085 carry `owner_reviewed: false`; DEC-0081 follows
from the approved S03 and is the one the owner can most readily uphold, while
DEC-0082 to DEC-0085 decide the interface's contract and should be read with
FINDING-4, FINDING-5, FINDING-20, FINDING-21, FINDING-22 and FINDING-24.

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

3. FINDING-3: take the review report out of the designs' `source_artifacts` (and fix the system design's id), or exempt review upstreams in the gate, before approval.
4. FINDING-4: `run_started_at` on the history read; name the read behind the never-populated latest-download line.
5. FINDING-5: bring UX brief §2.1, §2.2, §3 and §12.4 to DEC-0082's shape and never-populated renderings.
6. FINDING-6: break the `factorflow.universes` / `factorflow.classification` package cycle or record its acceptance.
7. FINDING-7: state for members with no row in the current set; a member-list read; `member_since` on scoped rows.
8. FINDING-8: not-current against the latest qualifying run; poll until it has a complete set.
9. FINDING-9: product-vocabulary `failure_reason`; detail to the log.
10. FINDING-10: owner to confirm the AGT-SCOPE-002 reading over the corrected list.
11. FINDING-11: owner to align capability §5.4 and its pin with STD-UI v6.
12. FINDING-12: carry DEC-0067 and the remaining contract additions into the system design.
13. FINDING-13: widen the append-only guard to every `.sql` under `src/factorflow/`.
14. FINDING-14: state how C4 is honoured.
15. FINDING-15: extend DEC-0058's `artifacts` to the five citing component designs.
16. FINDING-16: owner decision on the build timeout and retry.
17. FINDING-17: owner to uphold or revise the standardisation and non-positive-base rules in the capability.
18. FINDING-18: owner to state the universe name bound.
19. FINDING-19: owner to close OQ-TS-3 in the tech stack.

### Nice to Have (LOW findings)

20. FINDING-20 the summary-only poll in the system design and DEC-0082;
    FINDING-21 "the most recent set" wording; FINDING-22 cite DEC-0085 in the
    system design; FINDING-23 stale reference labels; FINDING-24 the two label
    assertions in the edit list; FINDING-25 the UX design's timestamp;
    FINDING-26 S09's incomplete count and exceptions; FINDING-27 the save under
    a universe scope; FINDING-28 origin on the universe list; FINDING-29 no
    CAP-002 §5.1 row for the shell capability; FINDING-30 two long narratives;
    FINDING-31 `hypothesis` citation; FINDING-32 unused interface; FINDING-33
    universe name sort; FINDING-34 rollback citation.

---

## Observations Outside the Review Subjects

- `check-references.py` on `main` exits 1 on one dangling path,
  `docs/ux/README.md`, cited by `projects/factorflow-v2/decisions/DEC-0068.md:22`,
  `DEC-0072.md:21` and `DEC-0080.md:15`. The file exists in the project
  repository; the design-run branch's checker treats `docs/ux/` as a
  project-repo prefix and passes. No review subject is affected.
- `docs/architecture.md` (generated): the row for `GET /api/classifications`
  ends at `state: building \`, because the generator splits the cell on the
  system design's escaped pipe in `building \| failed`; the rest of the shape
  (the `later` fields, `not_current`, `factors`, `match_count`, `stocks`,
  `next_cursor`) and the auth, status-code and stability columns are lost from
  the inventory. The system design's Markdown is valid; the defect is
  `build-architecture.py`'s, or the design can avoid a pipe inside a cell.
  Unbalanced backticks in other rows, which review v2 noted, remain.
- `projects/factorflow-v2/decisions/DEC-0052.md` to `DEC-0085.md` are
  untracked in the harness `main` checkout; DEC-0068 to DEC-0080 are committed
  and DEC-0081 to DEC-0085 staged on the design-run branch.
- `docs/constitution/standards/ui-conventions.md` (STD-UI v6, approved) pins
  `PRODUCT-UX` v3 while v6 is current (`check-artifacts.py` warning); a
  conformance target of this capability, not a subject.
- DEC-0076's text still says the save posts "the thresholds and the scope";
  the designs correctly post no scope (FINDING-27). The record is the owner's
  to amend or supersede.

## Unattended-Run Record

Run as the `$specification-review` step of a `$design-run` driver run,
unattended per `docs/unattended-mode.md`. The Step 6 discussion prompt was
skipped. No question was asked.

One prerequisite did not pass and was decided rather than asked:
`check-prerequisites.sh` exited 2 because the context cache was 25 hours old
against a 24-hour window. Refreshing runs the context feeder, which fetches
and updates the repositories under `repos/`; the driver pinned the project
repository at `1897b94` on `usr/alvaro-de-jodra/CAP-002-design` and forbade
any change to it for this step. This review reads every subject directly from
that pinned tree and uses no cached summary, so the stale cache bears on
nothing it judges. Decision: proceed, and record it here. The driver may record
it as a decision record and refresh the context before the next step; this
review wrote no decision record, because its only permitted write is this
report.

No specification, decision record, tech-stack, constitution, CAP-001 or
`docs/ux/` artifact was edited; no approval block was touched; no branch,
commit, stash or reset was made. The only write is this report.
