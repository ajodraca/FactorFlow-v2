---
artifact_schema_version: 1
artifact_id: CAP-002-specification-review
artifact_type: specification-review
artifact_version: 8
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
document: spec-review-report
capability: CAP-002
version: v8
generated: 2026-11-07T22:46:15Z
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
    result: "PASSED, exit 0: 3 capabilities, 11 edges (requires-runtime 4, conforms-to 7), 1 standard, 2 conformance claims, 1 constitution artifact, 4 references; no error, no warning (unchanged)"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0: 3 designs, 27 components, 84 interfaces; docs/architecture.md matches (check mode, nothing written)"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 306 warnings, exit 0 (--strict), 631 artifacts; CAP-002 subject warnings: capability pins STD-UI v4 (current v6); eight unchanged designs pin CAP-002-system-design v3, CAP-002-specification-review v2 and tech-stack v5; backlog.md pins system design v3 and factor-engine v2. The two revised designs raise no warning"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0: 1256 path references across 649 Markdown files, every reference resolves"
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
  SR-8: "applied — design_system_available true (projects/factorflow-v2/design-system.yaml; all four paths present); UX brief, UX design and classification-ui are byte-identical to reviews v3 to v7 and git log 3374c57..30efa7f touches only the two revised designs, so v3's mechanical verification of 62 component-variant pairs and 56 tokens stands"
  SR-9: "applied — check-capabilities.py (no error, no warning); capability sections 5.1 to 5.4 unchanged; DEC-0398 and its widened artifacts list checked against the CAP-001 designs it names; the new contract test row checked against DEC-0398 and the module it names (FINDING-52)"
  SR-10: "applied — build-architecture.py derives the inventory with no problem and no drift; the revision adds no component or interface"
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
    artifact_version: 5
    content_revision: sha256:0c01b4afc7a5f67a855508ba4b091ec9f1b6b56530c53f2f1a3abcf313f8b8e2
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
    artifact_version: 4
    content_revision: sha256:8a4746d431a8e0abc2ca780d2b11f6e7efa43c5a7a718cf5834bb0704cb11e77
  - artifact_id: CAP-002-component-design-research-store
    artifact_version: 2
    content_revision: sha256:8644c9766f72ebb24be991814d61734bba93fcc8c344791cd3c17561a03cb192
  - artifact_id: CAP-002-component-design-universe-service
    artifact_version: 2
    content_revision: sha256:7b18e9f329c2a012cb516584e9127805fc9a15f2b382cf77fa83763bbee6fe03
statistics:
  total_findings: 37
  critical: 0
  high: 1
  medium: 13
  low: 23
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T22:46:15Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "5"
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
      version: "4"
    - id: CAP-002-component-design-research-store
      version: "2"
    - id: CAP-002-component-design-universe-service
      version: "2"
    - id: DEC-0398
      version: "owner, committed in harness 217ac9c; artifacts list widened in the worktree (staged, not committed)"
    - id: delivered code
      version: "30efa7f: tests/integration/test_runner_acquires.py (module header and cases); src/factorflow/classification/sql/momentum_inputs.sql; src/factorflow/db/migrations/0006_classifications.sql"
    - id: CAP-002-specification-review
      version: "7 (READY-WITH-WARNINGS; every finding re-checked, not carried on trust)"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Specification Review Report -- CAP-002

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-002 Universe & Factor Classification |
| **Version** | v8 (eighth review; triggered by commit `30efa7f`) |
| **Specifications Reviewed** | Capability v1 (approved); system design **v5** (draft, revised); factor-engine **v4** (draft, revised); UX brief v3, UX design v3, classification-api v3, classification-reader v3, classification-ui v3, classification-scheduler v2, research-store v2, universe-service v2 (approved, byte-identical to reviews v5 to v7) |
| **Total Findings** | 37: CRITICAL 0, HIGH 1, MEDIUM 13, LOW 23 |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

Commit `30efa7f` revises system design v5 and factor-engine v4 against review
v7. It keeps both version numbers and both `draft` statuses. It targets
FINDING-47 to FINDING-51, FINDING-4 and FINDING-32. In the harness worktree,
DEC-0398's `artifacts` now also name CAP-001's system design and
market-data-store design. That change is staged, not committed; the record
itself was committed in `217ac9c`.

**Six of the seven targeted findings are closed, and FINDING-32 is narrowed.**

- **FINDING-47 (MEDIUM): closed.** §6 now identifies a set built before
  version 4 by its rows. Every `present` or `outdated` momentum row version 4
  writes carries `detail.corporate_actions_covered_by`, and no version-3 row
  does. A set with such a row lacking the key was built by version 3. That
  holds on the release day and during a rollback to 0.2.0, the two cases the
  date rule failed. A set with no `present` or `outdated` momentum row scored
  no stock on momentum, so it needs no classification. The test is sound
  (verification below), and the owner can confirm the disposition as written.
- **FINDING-48 to FINDING-50: closed.** The stale first-release bullets are
  gone, and the rollback bullet no longer contradicts itself. B1 and B2 are
  gone; B3 is cited with DEC-0397, the record that describes it. The new key
  is listed with the rest of momentum `detail` and tested on an `outdated`
  input.
- **FINDING-51: closed.** A §7 row now pins the contract. An empty successful
  corporate-actions fetch records one segment over the range requested; a
  failed fetch records none and leaves an existing segment unchanged.
  DEC-0398's `artifacts` cover all four CAP-001 statements.
- **FINDING-4: closed.** Every statement of the shares source now cites
  DEC-0295.
- **FINDING-32: narrowed.** The provenance review id is now real
  (`CAP-002-specification-review` v7). §1's "provisionally", §8 question 3 and
  §10 still describe OQ-TS-3 and the payload keys as open.

**Two LOW findings are new.** FINDING-52: the contract row places a CAP-002
test in a CAP-001 test module. That module is not in the factor-engine's §2.1
placement and is in tension with DEC-0398's "No CAP-001 change is made in the
B3 lane", and the row pins `failed` but not `not_found`. FINDING-53: both
designs' provenance timestamps read `2026-11-07T23:20:00Z`. That is 36
minutes after the commit that produced them (22:44:18Z) and after this
review ran.

No finding is CRITICAL, so the verdict is READY-WITH-WARNINGS. The one HIGH
finding is FINDING-1, carried since review v1. **Nothing on the two revised
designs is above LOW, so both are clear for the owner's re-approval at:**

- `CAP-002-system-design` v5: `sha256:0c01b4afc7a5f67a855508ba4b091ec9f1b6b56530c53f2f1a3abcf313f8b8e2`
- `CAP-002-component-design-factor-engine` v4: `sha256:8a4746d431a8e0abc2ca780d2b11f6e7efa43c5a7a718cf5834bb0704cb11e77`

This review approves nothing.

## Review Scope

All eleven artifacts resolved by `get-capability-specifications` are in scope.
The two revised designs were read in full, with the complete diff of
`30efa7f` against `3374c57` (review v7). `artifact-gate.py revision` confirms
the other nine match the revisions reviews v5 to v7 bound. `git log
3374c57..30efa7f` touches only the two designs. Line numbers below are those
at `30efa7f`.

Read for verification, none of them a subject and none edited:

- DEC-0398 as committed (`217ac9c`) and as staged in the harness worktree.
- `tests/integration/test_runner_acquires.py` (module header, cases), for the
  contract row.
- `momentum_inputs.sql` (the version-3 `detail` keys, lines 221–266 of the
  delivered statement), for the row-based identification.
- Migration `0006` (`classification_set`, `factor_input`).

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | Factor-engine §6 now has one bullet per subject; §2.1 placement against the new §7 row (FINDING-52) |
| SR-2 Correctness | applied | Row-based identification checked case by case against version-3 output and the classification rule; provenance timestamps against the commit (FINDING-53) |
| SR-3 Consistency | applied | Both designs against DEC-0295, DEC-0397, DEC-0398 and each other; `corporate_actions_covered_by` now consistent across §2.4, §6 and §7 |
| SR-4 Testability | applied | The two new §7 rows against the rules they pin; `not_found` not pinned (FINDING-52) |
| SR-5 Traceability | applied | System design §7 and factor-engine §13 map all 23 ACs; DEC-0295 cited wherever the shares source is stated; provenance (FINDING-32, FINDING-53) |
| SR-6 Clarity | applied | §6 contradictions and undefined labels removed; carried FINDING-32 |
| SR-7 Feasibility | applied | No new read, edge or migration; the identification needs only `factor_input` rows the engine already writes |
| SR-8 UX Completeness | applied | As in the frontmatter; S03 checks unchanged from review v7 |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` clean; DEC-0398 now names CAP-001 system design, market-data-store, observation-writer and acquisition-runner; contract test row (FINDING-52) |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passes with no drift; FINDING-33 carried |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, exit 0, PASSED; no error, no warning | none |
| `build-architecture.py -p factorflow-v2` | run, exit 0, PASSED: 3 designs, 27 components, 84 interfaces, no drift (check mode) | none |
| `check-artifacts.py -p factorflow-v2 --strict` | run, exit 0, PASSED with 306 warnings over 631 artifacts | FINDING-12 (STD-UI v4 pin); FINDING-5 (`backlog.md` pins). Neither revised design warns |
| `check-references.py` | run, exit 0, PASSED: 1256 references, 649 files | none |
| `check-constitutions.py` | run, exit 0, PASSED: 10 constitutions, 38 skills | none |

All five ran from the harness worktree
`.claude/worktrees/confident-shtern-083e4b` (`217ac9c`, with DEC-0398's
`artifacts` change staged). The project clone was on
`usr/alvaro-de-jodra/CAP-002-E2-S10` at `30efa7f`.

Supplementary: `check-prerequisites.sh` exit 0, every check PASSED.
`pipeline-state.py check --stage specification-review` reported
`AWAITING-APPROVAL` (exit 1), because the approval blocks still bind review v5.
`artifact-gate.py revision` was run for all eleven subjects.

## Constitutions Applied

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | AGT-PROV-001: review id and pins now correct (FINDING-32 narrowed). Both timestamps are after their commit and after this review (FINDING-53). AGT-AUTH-002: §6's disposition remains the owner's to confirm; the identification rule is now one the rows support. DEC-0398's widened `artifacts` await commit. AGT-EVIDENCE-001: every closure traced to file and line |
| CONST-MDL 1.3 | Exact model identifiers in both provenance blocks |
| CONST-OPS 1.3 | OPS-MIG-003: the rollback is defined and consistent, and sets built during a rollback are now identifiable. OPS-MIG-001: no data-model change |
| CONST-REV 1.4 | Two-stage report. REV-RCV-001: §6's identification claim was tested case by case rather than accepted. REV-RCV-002: the contract row's placement is challenged against DEC-0398's own scope statement (FINDING-52) |
| CONST-SA 2.0 | SA-MD-002: no undefined reference remains in §6. SA-MD-001: §6 now has one bullet per subject |
| CONST-SEC 1.3 | No new input, channel or data class |
| CONST-VER 1.2 | All five mechanical checks and the supplementary checks ran in this session; per-finding disposition of review v7; per-AC verdicts unchanged from v7 except as noted (VER-EVD-004) |

---

## Stage 1 -- Specification Compliance

No owner decision is misapplied. DEC-0295, DEC-0397 and DEC-0398 are applied
and cited wherever their rules are stated, and §6's disposition is drafted for
the owner rather than decided. The breaks that remain are those carried since
review v4 or earlier:

- FINDING-1, first-deployment backlog;
- FINDING-9, members with no row;
- FINDING-10, not-current without a later set row;
- FINDING-12, the STD-UI mirror;
- FINDING-25, the save under a universe scope.

## Stage 2 -- Artifact Quality

The revision does exactly what review v7 asked, and removes rather than adds
text where v7 found clutter. The two new findings are small. One is where a
test lives and which outcome it omits (FINDING-52). The other is a
provenance timestamp set ahead of time (FINDING-53).

---

## Verification of the Revision

### The targeted findings

| v7 finding | What v7 asked | What `30efa7f` did | Verdict |
|------------|---------------|--------------------|---------|
| FINDING-47 (MEDIUM) | Identify version-4 sets exactly, by the row marker or `started_at` | §6 (808–817): identification by rows, with the version-3 rule, the rollback case and the no-momentum-row case stated | **Closed** (checked below) |
| FINDING-48 (LOW) | Drop or mark the first-release bullets; fix "stops builds" | Both first-release bullets removed; "Manual actions" now version 4's only (818–822); rollback bullet (823–827) no longer says builds stop | **Closed** |
| FINDING-49 (LOW) | Define or drop B1 and B2 | Dropped; the manual action states the rate condition itself. B3 in both version notes cites DEC-0397, which describes it | **Closed** |
| FINDING-50 (LOW) | Key in the §2.4 summary; test on `outdated` | §2.4 summary (459–463) lists `corporate_actions_covered_by`; §7 *Covered by on an outdated input* (860) | **Closed** |
| FINDING-51 (LOW) | A test pinning the contract; widen DEC-0398's `artifacts` | §7 *Coverage contract pinned* (861); DEC-0398 `artifacts` add CAP-001 system design and market-data-store (worktree, staged) | **Closed**; residual FINDING-52 |
| FINDING-4 (LOW) | Cite DEC-0295 where the shares source is stated | Factor-engine §2.4 (433–435), §3 (694); system design constraint 8 (658) | **Closed** |
| FINDING-32 (LOW) | Fix the review id and tech-stack pin; close §8 question 3; add §9 sources; revise §1 and §10 | Review id now `CAP-002-specification-review` v7 (tech-stack fixed at v7) | **Narrowed**: §1 (144–145, "provisionally"), §8 question 3 (915) and §10 unchanged |

### §6's row-based identification

The rule (808–817): a set with a `present` or `outdated` momentum row lacking
`detail.corporate_actions_covered_by` was built by version 3. A set with no
such row needs no classification.

| Case | What the rule says | Actually | Correct? |
|------|-------------------|----------|----------|
| Version-3 set with any `present` or `outdated` momentum row | Version 3 (key absent: the delivered version-3 `detail` is `window_months`, `E`, `S`, `adjusted_close`, `splits`, `dividends` and, when outdated, `cause` and `outdated`) | Version 3 | Yes |
| Version-4 set with any `present` or `outdated` momentum row | Version 4 (§2.4 501–503 and 459–463 require the key on every such row; §7 asserts it on `present` and `outdated`) | Version 4 | Yes |
| Set built on the release day, either engine | Decided by its rows | — | Yes (v7's failing case) |
| Set built during a rollback to 0.2.0 | Version 3 | Version 3 | Yes (v7's failing case) |
| Set with no `present` or `outdated` momentum row | Unclassified, "does not matter" | No stock classified on momentum, because classification needs every momentum input `present` (§2.5 `peer` CTE) | Yes |
| An `outdated` version-4 input whose window is not covered | Cannot occur: `corporate_actions_not_covered` ranks before `outdated` | — | Consistent |

The rule needs no external record and no row change (C5). One condition is
implicit: it holds only while later engine versions keep writing the key.
That is a constraint on future revisions, recorded under Observations, not a
defect now.

### The coverage contract row

| Question | Evidence | Verdict |
|----------|----------|---------|
| Does it pin what DEC-0398 adopts? | An empty successful fetch → one segment over the range requested; a failed fetch → none, and an existing segment unchanged. DEC-0398: "a failed or not_found fetch records none" | Yes for `failed` and the empty success. `not_found` is not pinned; it takes the same `error_outcomes` path in `writer.py` 582, but a stub raising `InstrumentNotFound` is not asserted (FINDING-52) |
| Is it feasible in that module? | The module stubs the provider at the typed `MassiveClient` (`MagicMock`) against a migrated store; `fetch_corporate_actions` can return `[]` or raise | Yes |
| Does it detect the regression v6 FINDING-39 feared? | A CAP-001 change to range-written coverage would leave an empty fetch uncovered and fail the first assertion | Yes |
| Where does it live? | `tests/integration/test_runner_acquires.py` is CAP-001's module: its header says it "Exercises CAP-001-E4-S5" and "Implements TC-COMP-003, TC-COMP-146". It is not in factor-engine §2.1's placement list (181–210). DEC-0398 says "No CAP-001 change is made in the B3 lane" | Placement and scope unstated (FINDING-52) |

---

## Findings by Specification

### Capability Specification

- **SR-9**: `check-capabilities.py` clean; §5.1 unchanged. FINDING-12 and
  FINDING-14 are carried.
- **SR-1, SR-2**: no finding.
- **SR-4, SR-6**: FINDING-18 carried.

### System Design Specification (v5, revised)

- **SR-5**: FINDING-32 (narrowed), FINDING-53 (timestamp); carried
  FINDING-21, 23, 28, 38.
- **SR-3**: carried FINDING-13, 19, 20, 29.
- **SR-7**: carried FINDING-1, FINDING-2.
- **SR-9**: carried FINDING-14, 16.
- **SR-10**: FINDING-33 carried.

### Component Design Specifications

- **factor-engine (v4, revised)**:
  - new: FINDING-52 (§7 contract row, §2.1), FINDING-53 (provenance);
  - carried: FINDING-2, 11, 15, 17, 18, 28, 34, 35, 36, 38.
  - FINDING-1 no longer has a location here: the first-deployment bullet was
    removed, and the scheduler, research-store and system design still
    disagree.
- **classification-api, -reader, -ui, -scheduler, research-store,
  universe-service**: unchanged; findings as review v7.

### UX Brief / UX Design Specification

- **SR-8**: unchanged since v3; findings as review v7.

### Cross-Specification Consistency (SR-3)

- No new cross-spec inconsistency. CAP-002 against CAP-001 on coverage is an
  owner-decided contract, with all four contradicting CAP-001 designs now in
  DEC-0398's `artifacts`.
- Downstream propagation still open: epic CAP-002-E2, story CAP-002-E2-S10,
  the test specification (FINDING-5).
- Carried: FINDING-1, 6, 7, 11, 12, 13, 17, 19.

### Screen Specification Acceptance Checks (S03)

Unchanged from review v7: S03-1, S03-3 to S03-6 PASS; S03-2 PASS with
FINDING-9; S03-7 PASS with FINDING-25.

---

## Disposition of Review v7 Findings

| v7 finding | v7 severity | Status at v8 | Evidence | v8 finding |
|------------|-------------|--------------|----------|------------|
| v7 FINDING-1 | HIGH | Carried | Scheduler, research-store and system design §3.1 unchanged; the factor-engine §6 bullet it cited was removed | FINDING-1, HIGH |
| v7 FINDING-2 | MEDIUM | Carried | Version 3 paragraph (103–104), §14 question 1 (987–994) | FINDING-2 |
| v7 FINDING-4 | LOW | **Closed** | Table above | — |
| v7 FINDING-5 | MEDIUM | Carried | Epic, S10, test specification unchanged; the specification now also lacks the two new §7 rows | FINDING-5 |
| FINDING-6 to FINDING-16 | MEDIUM | Carried | Subjects or sections unchanged | FINDING-6 to FINDING-16 |
| FINDING-17 to FINDING-31 | LOW | Carried | Unchanged | FINDING-17 to FINDING-31 |
| v7 FINDING-32 | LOW | Carried, **narrowed** | Table above | FINDING-32, LOW |
| FINDING-33 to FINDING-36, FINDING-38 | LOW | Carried | Unchanged | same IDs |
| FINDING-47 to FINDING-51 | MEDIUM, LOW | **Closed** | Table above | FINDING-52 (residual of 51) |

Summary: closed 6 (MEDIUM 1, LOW 5); carried 35, one narrowed. New: 2.

---

## Findings Summary Table

CRITICAL 0 · HIGH 1 · MEDIUM 13 · LOW 23 · **total 37**

IDs are review v7's; closed IDs leave gaps. Carried rows keep v7's
description, with locations updated where they moved.

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-7, SR-3 | classification-scheduler; research-store; system design | scheduler §2.4 (`qualifying_run.sql`), §5 "Backlog", §6; research-store §6 "Data migration"; system design §3.1 steps 5, 19 to 21 | Carried since review v1. The scheduler builds one set per pre-deployment qualifying run, oldest first, each dated the day it is built; research-store says the first set follows the first qualifying run after deployment. Factor-engine §6 no longer states it | A fresh deployment appends one misattributed set per historical run (AC-21); a run ending during the backlog waits (AC-11) | Decide which runs qualify at first deployment and whenever several wait; align the designs; record the choice |
| FINDING-2 | MEDIUM | SR-7, SR-1 | system design; factor-engine | system design §6 assumption 1, §8 question 1; factor-engine version 3 paragraph (103–104), §14 question 1 (987–994), §3 (716–720); DEC-0295 | Carried. Quarter coverage left to the first real run with no check or fallback | Value and growth may never classify (fail-safe); "is closed" overstates | Define the check and fallback; reword "is closed" |
| FINDING-5 | MEDIUM | SR-3, SR-5, SR-4 | epic CAP-002-E2; story CAP-002-E2-S10 (absent); factor-engine test specification (downstream) | `CAP-002-E2.md` v2 (Dependencies 50, DAC-E2-1 90, Open Questions 148); no `CAP-002-E2-S10.md`; `tests/component/factor-engine-tests.md`, `tests/coverage-matrix.md` (`425b648`); `backlog.md` pins | Carried. Epic predates DEC-0295 and DEC-0397; S10 not generated; the test specification lacks every rule factor-engine v3 and v4 added to §7 | S10 cannot be planned; test design would plan from a stale specification | After re-approval: refine E2, generate S10 through `$backlog-review`, align the test specification and coverage matrix |
| FINDING-6 | MEDIUM | SR-3, SR-1 | UX design; UX brief; classification-ui; classification-api; classification-reader; system design | UX design §1.1, §1.6; brief §2.6; system design §4.2 `/history`; reader `HistoryRow` | Carried. History read lacks the download start time | AC-18, AC-21, AC-22 empty state cannot render as specified | Add `run_started_at`; name the read |
| FINDING-7 | MEDIUM | SR-3, SR-8 | UX brief; DEC-0082 | brief §2.1, §2.2, §3, §12.4 | Carried. Replaced read shape | Two UX artifacts disagree on AC-20 | Revise the brief |
| FINDING-8 | MEDIUM | SR-7 | universe-service; classification-reader | universe-service §1, §2.3; reader §1, §2.5, §3 | Carried. Mutual package import | Cycle detection flags both | Neutral module, or record acceptance |
| FINDING-9 | MEDIUM | SR-3, SR-1 | classification-reader; classification-api; universe-service; UX design; classification-ui | reader §2.5 `scope` CTE; api `UniverseResponse`; UX §1.4 | Carried. Late-covered members dropped | Match count disagrees with rows | Report such members; supply cells |
| FINDING-10 | MEDIUM | SR-3, SR-2 | system design; classification-reader; classification-ui | constraint 11; `current_set.sql`; ui §2.6 | Carried | AC-20 mark missing in the claim gap | Derive from the latest qualifying run |
| FINDING-11 | MEDIUM | SR-8, SR-3, SR-9 | factor-engine; system design; UX design; UX brief; classification-ui | factor-engine §2.3 (336–342), §4 (750–754); system design §3.1 step 25; UX §1.1, §1.2 | Carried. Exception text rendered to the owner | STD-UI-1 and EDG claims break | Map classes to product sentences |
| FINDING-12 | MEDIUM | SR-9, SR-3 | capability; UX brief | capability §5.4; STD-UI v4 pin; brief §12.1 | Carried | Mirror misstates conformance | Owner: revise §5.4 and its pin |
| FINDING-13 | MEDIUM | SR-3 | system design | §3.1 steps 14, 25 to 27; constraint 10; §4.2; §4.4 | Carried | Contract understated | Lift into §3 and §4.2 |
| FINDING-14 | MEDIUM | SR-9 | system design; capability | capability §5.1 tech-stack row | Carried. C4 not addressed | Row unconfirmable | State how C4 is honoured |
| FINDING-15 | MEDIUM | SR-9 | DEC-0058; five component designs | DEC-0058 `artifacts`; factor-engine §4 (757–758) | Carried | Consumer discovery misses five designs | Name them in DEC-0058 |
| FINDING-16 | MEDIUM | SR-9, SR-1 | system design; classification-api; UX artifacts; classification-ui | system design §8 question 2 | Carried. No universe-name bound | SEC-INP-001 unmet | Owner: state the bound |
| FINDING-17 | LOW | SR-3 | research-store; classification-reader; system design; factor-engine | factor-engine §3 (682–684) and three others | Carried | Enforcement misjudged | Align with the delivered guard |
| FINDING-18 | LOW | SR-6, SR-4 | capability | §2, AC-12 | Carried | Definitions in records | Fold in at the next capability revision |
| FINDING-19 | LOW | SR-3 | system design; DEC-0082 | §3.3 step 14, §3.1 step 15 | Carried | Over-polling test | Amend to the summary poll |
| FINDING-20 | LOW | SR-6, SR-3 | system design; api; reader; ui | §3.3 step 13, §4.2 `later` | Carried | Wrong-set assertion | Reword "the first set" |
| FINDING-21 | LOW | SR-5 | system design | version 3 paragraph, §3.2, §3.3, §4.2, §4.4, §9 | Carried. DEC-0085 not cited | Supersession untraceable | Cite DEC-0085 |
| FINDING-22 | LOW | SR-5 | classification-reader; classification-api; universe-service | §12 version labels | Carried | Stale label | Update labels |
| FINDING-23 | LOW | SR-9, SR-3 | system design; classification-ui; UX design | §8 question 4; ui §2.2; UX §0 | Carried | Edit list differs | Add assertions and `pyproject.toml` |
| FINDING-24 | LOW | SR-5 | UX design | `ai_provenance.timestamp` against `25fb3e6` | Carried | AGT-PROV-001 | Correct at the next revision |
| FINDING-25 | LOW | SR-8, SR-3 | UX design; UX brief; classification-ui | S03 §3; UX §1.1, §1.4, §4 | Carried | Unrecorded departure | Record it or support the scope |
| FINDING-26 | LOW | SR-3 | classification-ui; UX design | ui §2.3, §14 question 7 | Carried | Event-log walk | Add `origin` to list rows |
| FINDING-27 | LOW | SR-1 | classification-reader; classification-ui | §2.2, §2.3 narratives | Carried | Cosmetic | Trim |
| FINDING-28 | LOW | SR-5, SR-9 | system design; factor-engine | system design §4.3; factor-engine §7 (837–839) | Carried. `hypothesis` not in tech-stack v7 | Unsupported citation | Cite `pyproject.toml` or add it |
| FINDING-29 | LOW | SR-3 | system design; classification-ui | §4.2 `GET /api/instruments` | Carried | Unused interface | Remove or name the screen |
| FINDING-30 | LOW | SR-8, SR-3 | UX design; classification-api | UX §1.3 | Carried | One-page sort | Add the sort or drop it |
| FINDING-31 | LOW | SR-5 | research-store | §6 "Rollback" | Carried | Implied acceptance | Record or cite it |
| FINDING-32 | LOW | SR-5 | system design | §1 (144–145, OQ-TS-3 "provisionally"); §8 question 3 (915); §9; §10 (payload keys listed as missing); version 4 and 5 notes ("Nothing else changes") | Carried, narrowed. Provenance review id and tech-stack pin are now correct; the sections still describe OQ-TS-3, closed in tech-stack v7, and the payload keys, answered in DEC-0295, as open | Closed questions read as open in the design read first | Close §8 question 3; revise §1 and §10; add §9 sources |
| FINDING-33 | LOW | SR-10 | system design | §4.1 note; §4.2 summary consumer placeholder | Carried | Undeclared component | Use `owner-shell`; regenerate |
| FINDING-34 | LOW | SR-2 | factor-engine; system design | factor-engine §2.4 (422–424); system design §8 question 1 rationale | Carried | Rationale reads as exact | Qualify the sentence |
| FINDING-35 | LOW | SR-6, SR-4 | factor-engine | §2.4 *Currency* (351–355), `as_of` (451–453) | Carried | Currency sentence ambiguous against DEC-0116 (3) | Tie it to `as_of` |
| FINDING-36 | LOW | SR-6 | factor-engine | §2.4 `LineItem` (382–388) | Carried | Composition unstated | State the amount formula |
| FINDING-38 | LOW | SR-6, SR-5 | factor-engine; system design | factor-engine 52, 302, 373, 686, 702, 705, §14 questions 2 and 4 (996–1006); system design labels | Carried | Settled decisions read as open | Drop the labels; close the questions |
| FINDING-52 | LOW | SR-4, SR-3 | factor-engine; DEC-0398 | §7 *Coverage contract pinned* (861: `tests/integration/test_runner_acquires.py`; "a failed fetch records none"); §2.1 placement (181–210, engine test files only); `test_runner_acquires.py` header ("Exercises CAP-001-E4-S5", "Implements TC-COMP-003, TC-COMP-146"); DEC-0398 ("a failed or not_found fetch records none"; "No CAP-001 change is made in the B3 lane") | New, residual of v7 FINDING-51. (a) The row puts a CAP-002 contract test in a CAP-001 module traced to CAP-001's test specification. Factor-engine §2.1 does not list it, and nothing says whether adding it is within DEC-0398's "no CAP-001 change". (b) The row pins the empty success and `failed`, not `not_found` | S10's planner and adversarial reviewer must decide whether editing a CAP-001 test module is in scope; CAP-001's coverage matrix will not trace the case. A change that wrote coverage on `not_found` would pass | State in §2.1 and §7 that S10 adds this case to CAP-001's module and that DEC-0398 permits test additions, or place it in a CAP-002 module (for example `tests/integration/test_coverage_contract.py`) and list it in §2.1. Add a `not_found` case |
| FINDING-53 | LOW | SR-5 | factor-engine; system design | factor-engine `ai_provenance.timestamp` (17); system design `ai_provenance.timestamp` (20): both `2026-11-07T23:20:00Z`; commit `30efa7f` 2026-11-07T16:44:18-06:00 (22:44:18Z); this review 22:46:15Z | New. The production timestamp is 36 minutes after the commit that produced the content and after this review ran. It looks set ahead rather than taken | Provenance misdates the content (AGT-PROV-001); an approval made now would predate the artifact's own stated production time | At the next edit, set the timestamp at modification (on or before the commit). Not worth a separate revision, since any edit needs a new review |

---

## Traceability Matrix

Per-AC verdicts are as review v7 (VER-EVD-004), with these changes:

- **AC-7**: Mapped. The contract is now pinned by a §7 row; FINDING-52 for
  `not_found` and the row's placement. FINDING-34 and FINDING-2 remain.
- **AC-17**: Mapped. `corporate_actions_covered_by` is consistent across §2.4,
  §6 and §7 (v7 FINDING-50 closed).
- **AC-18**: Mapped with defect (FINDING-6). Identification of sets built
  before version 4 is now row-based and exact (v7 FINDING-47 closed).

The other twenty rows are unchanged from review v7:

- AC-1, AC-3, AC-4, AC-5, AC-8, AC-9, AC-13, AC-14, AC-15, AC-19 and AC-23
  are mapped.
- AC-2 and AC-6 are mapped with defects FINDING-25 and FINDING-9.
- AC-10 and AC-11 are mapped with defect FINDING-1.
- AC-12 and AC-16 are mapped with defect FINDING-9.
- AC-20, AC-21 and AC-22 are mapped with the defects v7 lists (FINDING-1, 6,
  7, 10, 11, 19, 20).

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No finding is CRITICAL. The one HIGH finding is FINDING-1, carried since
review v1, which is the owner's decision on the first-deployment backlog. It
no longer has a location in either revised design.

**Re-approval of the two revised designs.** Nothing on either is above LOW,
and §6's disposition is now one the owner can confirm as written. Both are
clear for the owner's re-approval at the revisions this report binds:

- `CAP-002-system-design` v5 at
  `sha256:0c01b4afc7a5f67a855508ba4b091ec9f1b6b56530c53f2f1a3abcf313f8b8e2`;
- `CAP-002-component-design-factor-engine` v4 at
  `sha256:8a4746d431a8e0abc2ca780d2b11f6e7efa43c5a7a718cf5834bb0704cb11e77`.

FINDING-52 and FINDING-53 are LOW. They can be fixed at the next edit or
settled in S10's planning, since any edit changes these revisions and needs a
new review. Re-approval is a direct edit of each `approval` block per
`docs/approval-gates.md`:

- `approved_at` must be later than this report's `generated` time
  (2026-11-07T22:46:15Z);
- `review_artifact` must point here;
- `reviewed_revision` must be the digest above.

The nine unchanged subjects keep their approvals. DEC-0398's widened
`artifacts` should be committed with the records. This review approves
nothing.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-1: decide which runs qualify at first deployment; align the
   scheduler, research-store and system design §3.1.

### Should Fix (MEDIUM findings)

2. FINDING-5: after re-approval, refine epic E2, generate S10, and align the
   test specification with factor-engine §7, the two new rows included.
3. FINDING-2, FINDING-6 to FINDING-16: as carried.

### Nice to Have (LOW findings)

4. FINDING-52: settle the contract test's home and add `not_found`, at the
   latest in S10's task plan.
5. FINDING-53, FINDING-32: at the next edit of the designs.
6. FINDING-17 to FINDING-31, FINDING-33 to FINDING-36, FINDING-38: as listed.

---

## Follow-up Work (implementation drift, not findings)

As review v7, plus the two new §7 rows for S10: the `outdated` covered-by case
in `test_engine_inputs_momentum.py`, and the coverage contract case in the
module FINDING-52 settles.

## Observations Outside the Review Subjects

- **The row-based identification holds only while every later engine version
  keeps writing `corporate_actions_covered_by` on `present` and `outdated`
  momentum rows.** A future revision that renames or drops the key would
  change how M4 classifies sets, so such a revision should restate the test.
- DEC-0398's widened `artifacts` are staged, not committed, in the harness
  worktree.
- Review v7's observations on CAP-001's design prose, the unverifiable
  production claim, the UI's provider-holds-no-data wording, DEC-0241's status
  and the decision `commits` caches still stand.

## Run Record

The coordinator, through the parent thread, directed this run as
`$specification-review` for CAP-002, writing `specifications-review-report-v8.md`.
It used the same clone and rules as reviews v6 and v7. No interactive input
tool was available, so the Step 6 question is returned to the coordinator.
`check-prerequisites.sh` exited 0. `pipeline-state.py` reported
`AWAITING-APPROVAL` for the reason given above, which this review's evidence
addresses. No decision record was written.

No other file was written:

- no specification, decision record, backlog item, test specification, code
  or approval block was edited;
- no branch, stash or reset was made; the one commit adds this report;
- `build-architecture.py` ran without `-w`.
