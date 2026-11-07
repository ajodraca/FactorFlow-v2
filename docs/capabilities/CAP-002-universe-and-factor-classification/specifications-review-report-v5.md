---
artifact_schema_version: 1
artifact_id: CAP-002-specification-review
artifact_type: specification-review
artifact_version: 5
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-06
updated: 2026-11-06
document: spec-review-report
capability: CAP-002
version: v5
generated: 2026-11-07T02:25:04Z
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
    result: "PASSED, exit 0: 3 capabilities, 11 edges (requires-runtime 4, conforms-to 7, blocked-by 0, requires-contract 0), 1 standard, 2 conformance claims, 1 constitution artifact, 4 references; integration layers CAP-001, CAP-002, CAP-003; no error, no warning"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0: 3 designs, 27 components, 84 interfaces; no drift against docs/architecture.md (check mode, nothing written)"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 305 warnings, exit 0 (--strict), 619 artifacts; CAP-002 subject warnings unchanged in kind from review v4: capability pins STD-UI v4 (current v6); eight unchanged designs pin CAP-002-system-design v3 (current v4, under review); designs pin tech-stack v5 (current v7) and CAP-002-specification-review v2 (current v4; review pins are provenance and the gate skips them); backlog.md pins system design v3 and factor-engine v2"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0: 1247 path references across 520 Markdown files, every reference resolves"
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
  SR-8: "applied — design_system_available true; UX brief, UX design and classification-ui are byte-identical to reviews v3 and v4 (same content revisions) and design-system/ is unchanged (git log 56a8162..3e006b5 touches only the two revised designs and the v4 report), so v3's mechanical verification of 62 component-variant pairs and 56 tokens stands; the revision touches no owner-facing surface"
  SR-9: "applied — check-capabilities.py (no error, no warning); capability sections 5.1 to 5.4 unchanged; decision records naming the two revised designs, and the owner's 2026-11-06 choices against the upheld records they revise"
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
    artifact_version: 4
    content_revision: sha256:5ab3d9c3374a63b721e9a3a465218683f9ac52b82b37b02c6b9db7f4f82c753c
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
    artifact_version: 3
    content_revision: sha256:40f4719fcedb7d73d0495e8d554d7bc2f947279588fd33f71e072d511362e582
  - artifact_id: CAP-002-component-design-research-store
    artifact_version: 2
    content_revision: sha256:8644c9766f72ebb24be991814d61734bba93fcc8c344791cd3c17561a03cb192
  - artifact_id: CAP-002-component-design-universe-service
    artifact_version: 2
    content_revision: sha256:7b18e9f329c2a012cb516584e9127805fc9a15f2b382cf77fa83763bbee6fe03
statistics:
  total_findings: 38
  critical: 0
  high: 1
  medium: 15
  low: 22
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T02:25:04Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "4"
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
      version: "3"
    - id: CAP-002-component-design-research-store
      version: "2"
    - id: CAP-002-component-design-universe-service
      version: "2"
    - id: CAP-002-E2
      version: "2 (approved; read for propagation, not a subject)"
    - id: CAP-002-E2-S3
      version: "1 (docs-sync; read for propagation, not a subject)"
    - id: CAP-002-factor-engine-tests
      version: "tests/component/factor-engine-tests.md at 425b648 (read for propagation, not a subject)"
    - id: tech-stack
      version: "7 (approved; context)"
    - id: STD-UI
      version: "6 (approved; governs, not a subject)"
    - id: PRODUCT-UX-S03
      version: "4 (approved; governs, not a subject)"
    - id: DEC-0052 to DEC-0294
      version: "CAP-002-scoped records; DEC-0055, DEC-0066, DEC-0116, DEC-0117, DEC-0122, DEC-0221, DEC-0241 to DEC-0243 and DEC-0265 read in full"
    - id: massive SDK 2.8.0
      version: "massive/rest/models/financials.py (FinancialBalanceSheet 530-621, FinancialCashFlowStatement 623-726, FinancialIncomeStatement 728-809); package METADATA Version 2.8.0"
    - id: Massive balance-sheet reference
      version: "massive.com/docs/rest/stocks/fundamentals/balance-sheets, fetched 2026-11-07"
    - id: CAP-002-specification-review
      version: "4 (READY-WITH-WARNINGS; every finding re-verified, not carried on trust)"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Specification Review Report -- CAP-002

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-002 Universe & Factor Classification |
| **Version** | v5 (fifth review; triggered by commit `3e006b5`) |
| **Specifications Reviewed** | Capability v1 (approved); system design **v4** (draft, revised again); factor-engine **v3** (draft, revised again); UX brief v3, UX design v3, classification-api v3, classification-reader v3, classification-ui v3, classification-scheduler v2, research-store v2, universe-service v2 (approved, unchanged since review v3) |
| **Total Findings** | 38: CRITICAL 0, HIGH 1, MEDIUM 15, LOW 22 |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

Commit `3e006b5` revises the two designs review v4 left findings on, without
changing their version numbers: system design v4 and factor-engine v3 are
still `draft`, now at new content revisions. It answers v4 FINDING-2, 4, 5
and 6. For FINDING-4 and FINDING-5 it applies the owner's choices of
2026-11-06: capital expenditure is read as a magnitude, and book equity is
`total_equity_attributable_to_parent` less `preferred_stock`, with an absent
value read as zero.

**All four fixes hold.** The statement windows now state DEC-0221's
consecutive-quarter rule as the owner decided it, and `known_on` is null on a
`missing` input of any factor (DEC-0242). Capital expenditure is a magnitude in
`LINE_ITEMS`, the input table, both assumption statements and the system design's
key table, and a test covers both signs. `preferred_stock` exists on the
`massive` SDK's `FinancialBalanceSheet` (line 555, beside
`total_equity_attributable_to_parent` at 566), and the provider's balance-sheet
reference documents it. The shares source now reaches the intro, the
*Statements* rule, the input table, the constraints, the test plan and §12, and
`as_of` cites DEC-0116 (3).

**The new `LineItem` fields fit the rest of §2.4, with one gap and two loose
ends.** `magnitude` and `less_key` are used once each, never together. Both sit
in the one table DEC-0066 (3) requires, and both pass as bound parameters
(§4). The gap is **FINDING-3** (MEDIUM): the rule "absent read as zero, present
but not a plain number makes book equity absent" divides the owner-upheld
DEC-0116 (4) for one field. DEC-0116 (4) lists JSON null separately from
absent, and the design does not say which side a `"preferred_stock": null`
falls on. The two readings record different permanent rows. The loose ends are
LOW: the provider defines `preferred_stock` as the *par or stated value*, which
the design's "book equity is common equity" overstates (FINDING-34), and the
design never states how `sign`, `magnitude` and `less_key` combine
(FINDING-36).

The one HIGH finding is FINDING-1, the first-deployment backlog. Review v1
first raised it, and it is still open with the owner. No finding is CRITICAL,
so the verdict is READY-WITH-WARNINGS. **Both revised designs are clear for the
owner's re-approval at the revisions this report binds.** Any further edit,
including the fix for FINDING-3, changes the content revision and needs fresh
review evidence (see Pipeline Readiness Assessment).

## Review Scope

All eleven artifacts resolved by `get-capability-specifications` are in scope.
The two revised designs were read in full, together with the complete diff of
`3e006b5`. `artifact-gate.py revision` confirms that the other nine are
byte-identical in reviewed content to reviews v3 and v4. `git log 56a8162..HEAD`
over `docs`, `design-system`, `src` and `tests` lists only `3e006b5`, and the
harness worktree is still at `90510ae`, the commit review v4 ran from. Every
external fact a carried finding rests on is therefore the one v4 recorded. Each
carried finding was still checked against the current text of the designs it
names.

Read for verification and propagation, none of them a subject and none edited:

- `.venv/lib/python3.12/site-packages/massive/rest/models/financials.py`
  (`FinancialBalanceSheet` 530–621, `FinancialCashFlowStatement` 623–726,
  `FinancialIncomeStatement` 728–809); the package `METADATA` (2.8.0).
- Massive's balance-sheet reference
  (`massive.com/docs/rest/stocks/fundamentals/balance-sheets`), fetched in this
  session, for the `preferred_stock` definition and the sample's treatment of
  fields with no value.
- CAP-001 `src/factorflow/ingestion/massive/models.py` 205–280
  (`FinancialStatement`, `extra="allow"`, `value_payload()`).
- The implementation that has not been changed yet: `src/factorflow/classification/line_items.py`,
  `sql/value_inputs.sql`, and the `sql/statements.sql` header.
- `tests/component/factor-engine-tests.md`, `tests/coverage-matrix.md`.
- Decision records scoped to CAP-002, by `artifacts`, `decided_by`,
  `owner_verdict` and `status`. Read in full: DEC-0055, DEC-0066, DEC-0116,
  DEC-0117, DEC-0122, DEC-0221, DEC-0241, DEC-0242, DEC-0243 and DEC-0265. Also
  searched: every harness worktree and `origin/main`, for a record of the
  owner's 2026-11-06 answer.
- `docs/artifact-contract.md` (Versioning Rules), `docs/approval-gates.md`
  (re-approval), `docs/decision-records.md` (trailer), `scripts/artifact-gate.py`
  (`MUTABLE_GATE_FIELDS`).

Implementation drift is excluded by direction. The code still reads shares from
the balance sheet and still holds `REQUIRES_INPUT` keys, and the strict xfail in
`tests/unit/test_line_items_resolved.py` stands, because coding waits for
re-approval. Those items are listed under "Follow-up Work", not as findings.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All template sections present in all eleven; `3e006b5` adds no diagram; factor-engine §7 checked against the revised §2.4 |
| SR-2 Correctness | applied | `preferred_stock` and `sale_of_property_plant_and_equipment` against the SDK and the provider reference; DEC-0221 wording against §2.4; the book-equity rationale against the provider's field definition (FINDING-34) |
| SR-3 Consistency | applied | Each fix traced through both designs and the nine unchanged subjects (no unchanged subject names the capex sign, the shares source, preferred stock or the window rule); owner decisions naming the revised designs checked for application; carried cross-spec findings re-checked |
| SR-4 Testability | applied | ACs unchanged; the four new §7 rows checked against the rules they test; the JSON-null case and the two-statement currency case have no row (FINDING-3, FINDING-35) |
| SR-5 Traceability | applied | System design §7 and component §13 unchanged and still map all 23 ACs; §12 decision list; provenance against the change (FINDING-37); decision records and trailers (FINDING-4) |
| SR-6 Clarity | applied | `preferred_stock` null (FINDING-3); "P1" overloaded and the currency test (FINDING-35); `LineItem` composition (FINDING-36); `PROVISIONAL` on upheld records (FINDING-38) |
| SR-7 Feasibility | applied | Magnitude removes v4's wrong-value mode; Q4 coverage under the now-stated consecutive rule (FINDING-2); first-deployment backlog (FINDING-1); package cycle (FINDING-8) |
| SR-8 UX Completeness | applied | As in the frontmatter: UX artifacts and design system unchanged since v3; S03-1 to S03-7 re-stated below |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` clean; C4 (FINDING-14); DEC-0058 bookkeeping (FINDING-15); STD-UI mirror (FINDING-12); the owner's choices against DEC-0055 (6), DEC-0116 (4) and DEC-0122 (FINDING-4) |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` clean, unchanged counts; the revision adds no component or interface; summary-read placeholder carried (FINDING-33) |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, exit 0, PASSED; no error, no warning | none |
| `build-architecture.py -p factorflow-v2` | run, exit 0, PASSED: 3 designs, 27 components, 84 interfaces, no drift (check mode, no `-w`) | none |
| `check-artifacts.py -p factorflow-v2 --strict` | run, exit 0, PASSED with 305 warnings over 619 artifacts | FINDING-12 (STD-UI v4 pin); FINDING-37 (factor-engine pins review v2 and tech-stack v5); FINDING-5 (`backlog.md` pins factor-engine v2). The eight `CAP-002-system-design` v3 pins clear once v4 is approved |
| `check-references.py` | run, exit 0, PASSED: 1247 references, 520 files | none |
| `check-constitutions.py` | run, exit 0, PASSED: 10 constitutions, 38 skills | none |

All five ran from the harness worktree
`.claude/worktrees/factorflow-v2-cap-002-run-cad67f` (harness branch
`usr/alvaro-de-jodra/CAP-002-automation-rework`, `90510ae`). The project
checkout was on `usr/alvaro-de-jodra/CAP-002-automation-rework` at `3e006b5`.

Supplementary evidence gathered in this session:

- `check-prerequisites.sh --project factorflow-v2`: exit 2. Every check PASSED
  except *Context freshness*, STALE (last run 2026-11-05T18:43:01Z, 31 hours,
  window 24). Handled under "Run Record".
- `pipeline-state.py check --capability CAP-002 --stage specification-review`
  before writing: `AWAITING-APPROVAL` (exit 1). Review v3's `review_subjects`
  do not cover system design v4 at `5ab3d9c3…` or factor-engine v3 at
  `40f4719f…`.
- `artifact-gate.py revision` for all eleven subjects (`review_subjects`).
- `artifact-gate.py require` (read-only):
  - research-store: passed.
  - System design and factor-engine: each fails four ways, as expected before
    re-approval. The status is `draft`, the approval is stale, and the approval
    still points at review v3, which v4 supersedes and which does not cover the
    current revision.

## Constitutions Applied

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | AGT-PROV-001: `3e006b5` changed both designs without refreshing their provenance; the timestamp predates the change and review v4 is in neither design's `source_artifacts` (FINDING-37; the system design's malformed review id is FINDING-32). AGT-AUTH-002: the owner's 2026-11-06 answer and both remedies live only in design prose. The upheld DEC-0055 (6), DEC-0116 (4) and DEC-0122 still state what they revise, and the commit applying DEC-0221 and DEC-0242 carries no trailer (FINDING-4). AGT-EVIDENCE-001: every new claim about the provider's schema was verified against the installed SDK and the live reference. AGT-SCOPE-002: no delivered-file edit added |
| CONST-MDL 1.3 | Exact model identifiers in both revised provenance blocks; no product model usage |
| CONST-OPS 1.3 | OPS-MIG: no migration added. With the keys still unresolved in code, every production value input so far is `missing`, so the revision rewrites no recorded value (C5). OPS-ERR-001: FINDING-11 carried |
| CONST-REV 1.4 | Two-stage report (Stage 1, Stage 2). REV-RCV-001: each of the four fixes was verified against its source rather than taken from the commit message or the brief. REV-RCV-002 challenges three statements. Factor-engine §2.4's "Book equity is common equity" goes beyond the provider's par-or-stated-value definition (FINDING-34). Factor-engine's "Section 14 question 1 is closed" stands while quarter coverage is open (FINDING-2). System design v4's "Nothing else changes" stands while §8 question 3, §9 and §10 are stale (FINDING-32) |
| CONST-SA 2.0 | SA-CLASS-002: package cycle carried (FINDING-8). SA-MD-002: stale version labels (FINDING-22), stale `PROVISIONAL` status (FINDING-38) and stale open-question text (FINDING-32). SA-MD-003: placeholders use `[REQUIRES INPUT]` |
| CONST-SEC 1.3 | SEC-INP-002: `less_key` is a payload key from `line_items.py`, covered by §4's "passed as parameters to `payload ->> %(key)s`, never interpolated". SEC-INP-001: universe name still unbounded (FINDING-16). SEC-ERR-001: FINDING-11 carried. SEC-ENC-001 bookkeeping: FINDING-15 carried. No channel, bind or port added |
| CONST-VER 1.2 | All five mechanical checks and the supplementary checks ran in this session; per-AC verdicts in the Traceability Matrix, per-check verdicts for S03, per-finding disposition of review v4 (VER-EVD-004) |

---

## Stage 1 -- Specification Compliance

The capability is unchanged and approved. The system design still maps all 23
acceptance criteria and S03-1 to S03-7. The revision removes review v4's one
fidelity break against an owner decision: factor-engine §2.4 now states
DEC-0221's windows and DEC-0242's `known_on`. It adds none. The breaks that
remain are the ones review v4 carried:

- first-deployment semantics of AC-10 and AC-21 (FINDING-1);
- members with no row in the current set (FINDING-9);
- not-current without a later set row (FINDING-10);
- the save under a universe scope (FINDING-25);
- the capability's STD-UI mirror (FINDING-12).

## Stage 2 -- Artifact Quality

The revision is careful where review v4 pointed. Every statement v4 named was
updated, and the new §7 rows test what the new rules say. Three loose ends
are new. The `preferred_stock` rule leaves JSON null unplaced (FINDING-3). One
sentence of rationale overstates the provider's field (FINDING-34). The
composition of the three `LineItem` modifiers is unstated (FINDING-36). The
pass also left provenance (FINDING-37) and the stale decision status and
sections v4 listed (FINDING-32, FINDING-38) for later. That was v4's own
advice for LOW findings, and it costs a re-review if done separately.

---

## Verification of the Revision

### The four review v4 findings

| v4 finding | What v4 asked | What `3e006b5` did | Verified against | Verdict |
|------------|---------------|--------------------|------------------|---------|
| FINDING-2 (HIGH) | State DEC-0221's windows; DEC-0242's `known_on`; adopt or leave DEC-0241 with the owner; add DEC-0221, DEC-0242 to §12 | §2.4 *Statements* (lines 330–340): P1–P4 trailing, P5–P8 prior, adjacent period ends at most 4 months apart, trailing-only inputs need P1–P4, growth needs P1–P8, a gap or fewer periods makes the input `missing`, "DEC-0221 replaces the 12-month span rule"; `known_on` null for a `missing` input of any factor (424–427); DEC-0241 "open with the owner" (427–428); §12 adds DEC-0116, DEC-0221, DEC-0241, DEC-0242; §7 rows *Consecutive windows* and *Known-on … null on a missing input* | DEC-0221 decision text (`decided_by: owner`, 2026-10-28T01:56:27Z), clause by clause; DEC-0242 decision (`decided_by: owner`, 2026-10-30T21:33:05Z); DEC-0241 (`decided_by: agent`, `status: open`, `owner_verdict: null`); `statements.sql` header lines 1–5 (follows DEC-0221) | **Closed** |
| FINDING-4 (MEDIUM) | A sign-robust capex rule; correct both "never wrong" statements; add a test | `LINE_ITEMS["capital_expenditure"]` sign 1, `magnitude=True`; table formula `TTM(\|capital_expenditure\|)`; §2.4 paragraph (390–395); §3 assumption (628–632); system design §8 question 1 table "magnitude" and §6 assumption 1 (Version 4); §7 *Capital expenditure by magnitude* (−X and +X give OCF − X) | `FinancialCashFlowStatement.purchase_of_property_plant_and_equipment` (line 652) and the separate `sale_of_property_plant_and_equipment` (line 653), which supports "sales are a separate field" | **Closed** |
| FINDING-5 (MEDIUM) | Correct the rationale, or subtract `preferred_stock` with absence stated | `LINE_ITEMS["book_equity"]` `less_key="preferred_stock"`; §2.4 paragraph (395–400); system design §8 question 1 table and rationale (875–880); §7 *Book equity less preferred* | `FinancialBalanceSheet.preferred_stock: Optional[float]` (line 555, `from_dict` line 603), on the same model as `total_equity_attributable_to_parent` (566); balance-sheet reference: "Par or stated value of preferred shares outstanding with preferential rights over common stock", omitted from the sample response | **Closed**; residuals FINDING-3, FINDING-34 |
| FINDING-6 (MEDIUM) | Intro, *Statements* rule, table, constraint, §12, `as_of` for two statement types, §7 and test-specification cases | Intro (55–56); *Statements* rule (340–343: "every value input reads it from the single most recent quarterly income statement, never summed"); table Statements column (410–412); `as_of` cites DEC-0116 (3) (422–424); constraints bullet (604–606); §7 *Market capitalisation* and *Shares are never summed* (736–737); §12 "system design v4" (834) | DEC-0116 (3) ("as_of and the staleness test use the earliest of the latest period ends used") | **Closed** in the design; residuals FINDING-35 (the staleness half of DEC-0116 (3)) and FINDING-5 (the test specification) |

### The new `LineItem` fields against the rest of §2.4

| Point | Evidence | Coherent? |
|-------|----------|-----------|
| One mapping table (DEC-0066 (3), owner-upheld) | `magnitude` and `less_key` are fields of `LineItem`, so the mapping stays in `LINE_ITEMS` and nowhere else | Yes |
| Parameter binding (SEC-INP-002) | §4: "Payload keys from `line_items.py` are passed as parameters"; `less_key` is such a key | Yes |
| Capital expenditure | `sign 1, magnitude=True` → `\|value\|`; table `TTM(\|capital_expenditure\|)` sums per-quarter magnitudes; system design table "magnitude" | Yes (the table's `\|…\|` repeats what `magnitude` already does, harmlessly) |
| Book equity | `less_key="preferred_stock"`, "a field of the same statement", read from the single most recent quarterly balance sheet; system design "less `preferred_stock` (absent read as 0)" | Yes, except JSON null (FINDING-3) |
| Rows used, restatement, `known_on` | `preferred_stock` comes from the balance-sheet row book equity already uses, so no row is added to DEC-0122's list or to `known_on` | Yes; the income-statement row for MC is the one DEC-0122 omits (FINDING-4) |
| `unresolved()` guard | Checks `payload_key` only; `less_key` is a constant, never `REQUIRES_INPUT` | Yes |
| Composition | No item sets more than one of `sign = −1`, `magnitude`, `less_key`; the design states no formula combining them, and `sign`'s comment describes a −1 convention no item now uses | Unstated (FINDING-36) |
| "P1" | `book_equity(P1)` is the balance sheet's latest; MC's P1 the income statement's latest; `as_of`'s P1 the earlier of the two | Overloaded (FINDING-35) |

### The shares move and the remedies across CAP-002

| Artifact | Says | Consistent? |
|----------|------|-------------|
| Capability §2, §6 | Value composite and free cash flow "operating cash flow less capital expenditure"; line items listed without statement source or sign | Yes |
| System design v4 constraint 8, §6 assumption 1, §8 question 1 | Shares from the most recent quarterly income statement, never summed; capex magnitude; book equity less `preferred_stock` | Yes |
| Factor-engine v3 intro, §2.4, §3, §7, §12, §14 | Same | Yes, with FINDING-3, FINDING-35, FINDING-36 |
| Research-store, reader, API, UI, scheduler, universe-service, UX brief, UX design | No statement source, sign or preferred rule; research-store's "a `missing` … input may carry … dates where they exist" permits DEC-0242's null | Yes (nothing to change) |
| DEC-0055 (6); DEC-0122; DEC-0116 (4) | Shares from the balance sheet; restatement rows name "the newest balance sheet supplying shares_outstanding"; JSON null and non-numeric values "count as absent, so the input is missing" | **No** (FINDING-4) |
| Epic CAP-002-E2, story CAP-002-E2-S3 | Keys `[REQUIRES INPUT]`; "most-recent balance sheet"; verification waits on the owner's answer | **No** (FINDING-5) |
| `tests/component/factor-engine-tests.md`, `tests/coverage-matrix.md` | Only TC-COMP-062 touches shares (non-positive); no case for the income-statement source, never summed, capex magnitude, preferred subtraction or consecutive windows | **No** (FINDING-5) |
| Code (`line_items.py`, `value_inputs.sql`, `test_line_items_resolved.py`) | Balance-sheet shares; unresolved keys; strict xfail; no magnitude or `less_key` | Expected drift (Follow-up Work) |

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability; no finding.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py`: no error, no warning. §5.1 is unchanged. The CAP-001
`requires-runtime` row is correctly typed, cited and placed, and the §5.2
disclaimers are correctly placed. CAP-003 declares its own `requires-runtime`
edge on CAP-002. Tech stack: C2, C5 and C8 are honoured; C4 is still not
addressed (FINDING-14). STD-UI: all 30 rules are accounted for and no
specialization is illegal; the mirror disagreement is carried (FINDING-12).

#### Completeness (SR-1)

No finding.

#### Correctness (SR-2)

No finding. The ACs do not contradict one another.

#### Testability (SR-4)

- FINDING-18: the capability text still does not define the standardised
  score or non-positive bases, which DEC-0053 and DEC-0055 (2) now fix as
  owner-upheld rules.

#### Clarity (SR-6)

- FINDING-18 (above).

### System Design Specification (v4, revised)

- **SR-1**: complete; no diagram added.
- **SR-2**: the §8 question 1 table and rationale are correct against the SDK
  for every key, including `preferred_stock`; "absent read as 0" leaves JSON
  null unplaced (FINDING-3); the rationale reads `preferred_stock` as all of
  preferred equity (FINDING-34).
- **SR-3**: FINDING-13 (drift from the decomposition), FINDING-19 (both reads
  polled), FINDING-20 ("the first set"), FINDING-29 (unused interface), all
  carried.
- **SR-5**: FINDING-21 (DEC-0085 not cited), FINDING-23 (edit list, DEC-0088),
  FINDING-28 (`hypothesis`), FINDING-32 (stale §1, §8 question 3, §9, §10 and
  review id), FINDING-37 (provenance), FINDING-38 (`PROVISIONAL` on upheld
  records).
- **SR-7**: FINDING-1 (§3.1 steps 5, 19 to 21); FINDING-2 (§6 assumption 1).
- **SR-9**: FINDING-14 (C4); FINDING-16 (§8 question 2).
- **SR-10**: FINDING-33. Otherwise no finding: §4.1 declares seven
  identifiers; every diagram box and participant carries one; every §4.2 row
  names provider and consumer components; no capability identifier is an actor
  in §1 to §5.

### Component Design Specifications

- **factor-engine (v3, revised)**: FINDING-1 (§6); FINDING-2 (version 3
  paragraph, §14 question 1); FINDING-3 (§2.4 `less_key`, §7); FINDING-11
  (§2.3 `fail_set.sql`); FINDING-15 (§4); FINDING-17 (§3); FINDING-18;
  FINDING-28 (§7); FINDING-34 (§2.4 rationale); FINDING-35 (§2.4 currency and
  "P1"); FINDING-36 (§2.4 `LineItem`); FINDING-37 (provenance); FINDING-38
  (`PROVISIONAL` labels, §14 questions 2 to 4).
- **classification-api (v3)**: FINDING-6, FINDING-11, FINDING-15, FINDING-16,
  FINDING-19 (its §5 is right), FINDING-20, FINDING-22. Unchanged.
- **classification-reader (v3)**: FINDING-6, FINDING-8, FINDING-9,
  FINDING-10, FINDING-15, FINDING-17, FINDING-20, FINDING-22, FINDING-27.
  Unchanged.
- **classification-ui (v3)**: FINDING-6, FINDING-9, FINDING-10, FINDING-11,
  FINDING-23, FINDING-26, FINDING-27, FINDING-29. Unchanged.
- **classification-scheduler (v2)**: FINDING-1, FINDING-15. Unchanged.
- **research-store (v2)**: FINDING-1 (§6), FINDING-15, FINDING-17 (§2.5),
  FINDING-31. Unchanged.
- **universe-service (v2)**: FINDING-8, FINDING-9, FINDING-22, FINDING-30.
  Unchanged.
- **SR-7, all components**: no new edge. The scheduler drives the engine, the
  engine and the reader read the stores, and the API calls the service and
  the reader. `universe-service` and `classification-reader` still import each
  other (FINDING-8).

### UX Brief

- **SR-8**: unchanged since v3. FINDING-6, FINDING-7, FINDING-11, FINDING-12,
  FINDING-25.

### UX Design Specification

- **SR-8**: unchanged since v3. FINDING-6, FINDING-9, FINDING-11, FINDING-23
  (§0), FINDING-24, FINDING-25, FINDING-26, FINDING-30 (Name sortable).

### Cross-Specification Consistency (SR-3)

- CROSS-SPEC-INCONSISTENCY: system design v4 and factor-engine v3 against the
  upheld DEC-0055 (6), DEC-0116 (4) and DEC-0122 (FINDING-4), and against epic
  CAP-002-E2, story CAP-002-E2-S3 and the factor-engine test specification
  (FINDING-5).
- Carried: FINDING-1, FINDING-6, FINDING-7, FINDING-11, FINDING-12,
  FINDING-13, FINDING-17, FINDING-19.
- Closed by this revision: v4's factor-engine §2.4 against DEC-0221 (v4
  FINDING-2), and factor-engine §2.4 against its own `LINE_ITEMS` and system
  design constraint 8 (v4 FINDING-6).

### Screen Specification Acceptance Checks (S03)

S03 v4, the UX artifacts and the reads behind them are unchanged since v3.

| Check | Verdict | Evidence |
|-------|---------|----------|
| S03-1 incomplete stocks listed unless hidden | PASS | As v3 and v4 (DEC-0081, owner-upheld) |
| S03-2 match count over the full set | PASS, with FINDING-9 | As v4 |
| S03-3 inputs' as-of in the inspector | PASS | As v4; the design now states *as of* for an input that reads two statement types (DEC-0116 (3)), so v4's caveat is resolved; the staleness half is FINDING-35 |
| S03-4 no percentile below 30 qualifying stocks | PASS | As v4 |
| S03-5 filters, sort and scope survive reload and back | PASS | As v4 |
| S03-6 restatement mark in results and inspector | PASS | As v4; DEC-0122's row list must gain the income statement behind MC (FINDING-4) |
| S03-7 save every matching stock, membership kept | PASS, with FINDING-25 | As v4 |

---

## Disposition of Review v4 Findings

| v4 finding | v4 severity | Status at v5 | Evidence | v5 finding |
|------------|-------------|--------------|----------|------------|
| F-1 first-deployment backlog | HIGH | Carried | Scheduler and research-store unchanged; factor-engine §6 (701–705) and system design §3.1 steps 5, 19 to 21 untouched by `3e006b5`; no record decides it | FINDING-1, HIGH |
| F-2 windows against DEC-0221; `known_on` | HIGH | **Closed** | Verified above | none |
| F-3 quarter coverage | MEDIUM | Carried | Factor-engine version 3 paragraph still says "Section 14 question 1 is closed" (103–104); no confirmation check or Q4 fallback is defined; §2.4 now states the 4-month adjacency, which makes the Q4 failure mode explicit | FINDING-2, MEDIUM |
| F-4 capex sign | MEDIUM | **Closed** | Verified above | none |
| F-5 book equity includes preferred | MEDIUM | **Closed**, with residuals | Verified above | FINDING-3, MEDIUM (null); FINDING-34, LOW (par value) |
| F-6 shares source in the rest of §2.4 and §7 | MEDIUM | **Closed**, with residuals | Verified above | FINDING-35, LOW (staleness test); test specification moved into FINDING-5 |
| F-7 decision records | MEDIUM | Carried, widened | DEC-0055 (6), DEC-0122 unchanged; no record of the 2026-11-06 answer or remedies in any harness worktree or `origin/main`; `3e006b5` carries no `Decision-Id` trailer; DEC-0221 and DEC-0242 `status: open`, `commits: []` | FINDING-4, MEDIUM |
| F-8 backlog vehicle | MEDIUM | Carried, widened | Epic E2, story E2-S3 unchanged; the test specification and coverage matrix (unchanged since `425b648`) lack every case §7 added | FINDING-5, MEDIUM |
| F-9 download start time | MEDIUM | Carried | Subjects unchanged | FINDING-6 |
| F-10 UX brief read shape | MEDIUM | Carried | Unchanged | FINDING-7 |
| F-11 package cycle | MEDIUM | Carried | Unchanged | FINDING-8 |
| F-12 members with no row | MEDIUM | Carried | Unchanged | FINDING-9 |
| F-13 not-current definition, poll stop | MEDIUM | Carried | Unchanged | FINDING-10 |
| F-14 exception text to the owner | MEDIUM | Carried | Factor-engine §2.3 (309–315), §4, §10 unchanged | FINDING-11 |
| F-15 capability §5.4 mirror | MEDIUM | Carried | Unchanged; `check-artifacts.py` still warns STD-UI v4 | FINDING-12 |
| F-16 system design drift | MEDIUM | Carried | Revision touched none of the listed sections | FINDING-13 |
| F-17 C4 not addressed | MEDIUM | Carried | No occurrence of C4 | FINDING-14 |
| F-18 DEC-0058 `artifacts` | MEDIUM | Carried | Harness unchanged since v4 | FINDING-15 |
| F-19 universe name length | MEDIUM | Carried | System design §8 question 2 still `[REQUIRES INPUT]` | FINDING-16 |
| F-20 append-only guard descriptions | LOW | Carried | Factor-engine §3 (594–596) unchanged | FINDING-17 |
| F-21 capability arithmetic | LOW | Carried | Capability unchanged | FINDING-18 |
| F-22 both reads polled | LOW | Carried | Unchanged | FINDING-19 |
| F-23 "the first set" | LOW | Carried | Unchanged | FINDING-20 |
| F-24 DEC-0085 not cited | LOW | Carried | Unchanged | FINDING-21 |
| F-25 stale reference labels | LOW | Carried, narrowed | Factor-engine §12 now reads "system design v4" (834); reader, api and universe-service labels unchanged | FINDING-22 |
| F-26 edit list and DEC-0088 | LOW | Carried | §8 question 4 unchanged | FINDING-23 |
| F-27 UX design timestamp | LOW | Carried | Unchanged | FINDING-24 |
| F-28 save under a universe scope | LOW | Carried | Unchanged | FINDING-25 |
| F-29 origin through the events read | LOW | Carried | Unchanged | FINDING-26 |
| F-30 two long narratives | LOW | Carried | Unchanged | FINDING-27 |
| F-31 `hypothesis` citation | LOW | Carried | Factor-engine §7 (722–724) still "already in the tech stack" | FINDING-28 |
| F-32 unused `GET /api/instruments` | LOW | Carried | Unchanged | FINDING-29 |
| F-33 universe name sort | LOW | Carried | Unchanged | FINDING-30 |
| F-34 rollback citation | LOW | Carried | Unchanged | FINDING-31 |
| F-35 system design stale sections and provenance | LOW | Carried | Version 4 paragraph still ends "Nothing else changes"; §1 (130–132), §8 question 3, §9, §10 (1073–1078), provenance review id and tech-stack pin unchanged | FINDING-32 |
| F-36 summary consumer placeholder | LOW | Carried | §4.1 note (504) and §4.2 row (518) unchanged | FINDING-33 |

Summary: closed 4 (F-2, F-4, F-5, F-6); carried 32, two of them widened
(F-7, F-8) and one narrowed (F-25). New: 6 (FINDING-3, FINDING-34 to
FINDING-38).

---

## Findings Summary Table

CRITICAL 0 · HIGH 1 · MEDIUM 15 · LOW 22 · **total 38**

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-7, SR-3 | classification-scheduler; research-store; factor-engine; system design | scheduler §2.4 (`qualifying_run.sql`), §5 "Backlog", §6; research-store §6 "Data migration"; factor-engine §6 "Behaviour change after upgrade" (701–705); system design §3.1 steps 5, 19 to 21 | Carried from v4 FINDING-1 (first raised in review v1). Every CAP-001 run that ended `succeeded` or `partial` before deployment qualifies. The scheduler claims them oldest first, one set per run, each dated the day it is built. Research-store and factor-engine instead say the first set follows the first qualifying run after deployment | First deployment appends one permanent, misattributed set per historical run to C5 history (AC-21), and a run that ends during the backlog waits behind it (AC-11). With the keys answered, each such set computes value and growth scores too | Decide which runs qualify at first deployment and whenever several wait (for example, only the latest qualifying run without a set). Align the scheduler, research-store, factor-engine §6 and system design §3.1, and record the choice |
| FINDING-2 | MEDIUM | SR-7, SR-1 | system design; factor-engine | system design §6 assumption 1 (Version 4, 769–775), §8 question 1 (884–885); factor-engine version 3 paragraph (103–104: "Section 14 question 1 is closed. Review v2's FINDING-2 … is closed with it"), §14 question 1 (862–869), §3 assumption (628–632); §2.4 *Statements* (333–339); `statements.sql` (`fiscal_period <> 'FY'`) | Carried from v4 FINDING-3. Quarter coverage, Q4 included, is still assigned to "the first real run" with no defined check and no fallback. With the 4-month adjacency now written in §2.4, a stock whose fourth quarter exists only as an annual statement never forms a trailing window, because the Q3-to-Q1 gap is about 6 months | If Q4 quarterly records are absent, `earnings_yield`, `fcf_yield` and both growth inputs are `missing` for every stock, so value and growth never classify (fail-safe, AC-12). The factor-engine's "closed" overstates | Define the confirmation: the query run after the first Financials run (quarterly records with `fiscal_quarter = 4` per instrument), who runs it, and the fallback if Q4 is absent (for example Q4 = FY − Q1 − Q2 − Q3, a DEC-0055 (1) revision). Reword "is closed" to "keys answered; coverage open" |
| FINDING-3 | MEDIUM | SR-6, SR-4, SR-2 | factor-engine; system design; DEC-0116 | factor-engine §2.4 `LineItem.less_key` comment (361: "absent read as 0") and paragraph (397–400: "an absent `preferred_stock` reads as zero … A present `preferred_stock` that is not a plain number makes book equity absent, as any unreadable field does"); §7 *Book equity less preferred* (739: absent case only); system design §8 question 1 table (867); DEC-0116 (4) (owner-upheld: "a value that is absent, JSON null, a non-numeric string or any other JSON type counts as absent, so the input is missing"); CAP-001 `models.py` 205–280 (`extra="allow"`, `model_dump(mode="json")` keeps the wire value) | The rule splits DEC-0116 (4)'s single "absent" class in two for one field: absent reads as zero, while a present value that is not a plain number makes book equity absent. DEC-0116 (4) names JSON null separately from absent, and the design does not say which side a `"preferred_stock": null` falls on. Massive's balance-sheet reference does not say whether a field with no value is omitted or returned as null; its sample omits `preferred_stock`. CAP-001 stores whatever the wire carries | Under the literal reading (a null key is present and not a plain number), `book_to_price` is `missing` for every issuer without preferred stock whenever the payload carries explicit nulls. Value would then be unclassified for most stocks and possibly unranked (AC-14): fail-safe, but it defeats the remedy. Under the other reading, book equity is computed. Two faithful implementations would record different permanent rows, and the follow-up code is planned from this text | State that a `preferred_stock` that is absent or JSON null reads as zero, and that any other value that is not a plain number makes book equity absent (or the owner's other choice). Use the same wording in system design §8 question 1. Add a §7 row for the null case. Record the carve-out from DEC-0116 (4) with the owner's answer (FINDING-4) |
| FINDING-4 | MEDIUM | SR-5, SR-9 | system design; factor-engine; DEC-0055; DEC-0116; DEC-0122; DEC-0221; DEC-0242 | DEC-0055 (6) ("shares outstanding from the most recent quarterly balance sheet"; upheld, applied); DEC-0122 ("including the newest balance sheet supplying shares_outstanding"; upheld, applied); DEC-0116 (4) (above); DEC-0221 and DEC-0242 (`decided_by: owner`, `status: open`, `commits: []`); commit `3e006b5` (message ends with `Co-Authored-By` only, no `Decision-Id`); no record naming `preferred_stock` or `diluted_shares_outstanding` in this worktree, the other harness worktrees or `origin/main` | Carried from v4 FINDING-7, widened. The owner's 2026-11-06 answer, and now the two remedies chosen the same day, exist only in design prose. Three upheld records still state the rules these choices revise: shares from the balance sheet, the restatement rows, and absence for `preferred_stock`. `3e006b5` applies DEC-0221, DEC-0242 and both remedies without a `Decision-Id` trailer, so `sdd decisions` links no commit to them | `sdd decisions` readers, blind review and `revert` see superseded rules as current and cannot find the change that applied the owner's choices. The restatement mark's rows are defined against the wrong statement (AC-23). The code follow-up has no record to cite | Record the owner's 2026-11-06 answer and both remedies as owner decisions. They should supersede DEC-0055 (6), amend DEC-0122's row list to the income statement supplying shares, and carve `preferred_stock` out of DEC-0116 (4) (FINDING-3), naming both designs in `artifacts`. Carry their trailers, and those of DEC-0221 and DEC-0242, on the follow-up commits |
| FINDING-5 | MEDIUM | SR-3, SR-5, SR-4 | epic CAP-002-E2; story CAP-002-E2-S3; factor-engine test specification (downstream, not subjects) | `CAP-002-E2.md` v2 (approved): Open Questions first item (`[REQUIRES INPUT …]`), Out of Scope, Dependencies, DAC-E2-1 ("most-recent balance sheet"). `CAP-002-E2-S3.md` Description ("waits on the owner's payload-key answer"; status `docs-sync`). `tests/component/factor-engine-tests.md` and `tests/coverage-matrix.md` (last changed `425b648`; only TC-COMP-062 touches shares). `backlog.md` pins (factor-engine v2, system design v3) | Carried from v4 FINDING-8, widened. The approved backlog still says the keys are unanswered and value and growth blocked, and no story or change record carries the follow-up. The Phase 5 test specification has no case for any rule `3e006b5` added to §7: shares from the income statement, never summed, capex by magnitude, book equity less preferred, consecutive windows | The code change has no planned vehicle. Implementing it under S3 would reopen a story in `docs-sync`. Test design and automation would plan from a specification that lacks the new cases | Refine E2 (close the open question; add the income-statement source, the magnitude and the preferred rule to DAC-E2-1) through `$backlog-review`. Add a story under E2, or an expedited change if `scripts/classify-lane.py` allows. Bring the test specification and coverage matrix in line with factor-engine §7 |
| FINDING-6 | MEDIUM | SR-3, SR-1 | UX design; UX brief; classification-ui; classification-api; classification-reader; system design | UX design §1.1, §1.6; brief §2.6; system design §4.2 `/history` row (`classification_date`, `run_id` only); api `StockHistoryResponse`; reader `HistoryRow`, `stock_history.sql`; UX design §1.1 never-populated latest-download line; `MostRecentRun` | Carried from v4 FINDING-9. Two surfaces name a download by its start time, but the history read does not carry it. The never-populated screen's latest-download line names no read that supplies it | AC-18, AC-21 and the AC-22 empty state cannot render as specified | Add `run_started_at` to the history read, and name the read behind the never-populated latest-download line |
| FINDING-7 | MEDIUM | SR-3, SR-8 | UX brief; DEC-0082 | brief §2.1, §2.2, §3, §12.4; DEC-0082 `artifacts` | Carried from v4 FINDING-10. The brief still describes the read shape DEC-0082 replaced (the later set nested in `set.not_current`). Its never-populated state also omits the first set's *Updating* and *Score update failed* | Two approved UX artifacts disagree on AC-20 before the first set | Revise the brief to the `set` + `later` shape and the never-populated renderings of UX design §1.1; add the brief to DEC-0082's `artifacts` |
| FINDING-8 | MEDIUM | SR-7 | universe-service; classification-reader; DEC-0085 | universe-service §1, §2.3 (imports `factorflow.classification.reader`); reader §1, §2.5, §3 (imports `factorflow.universes.replay`) | Carried from v4 FINDING-11: `factorflow.universes` and `factorflow.classification` import each other (SA-CLASS-002) | Package-cycle detection flags either package | Move the shared filter type and predicate, or the membership replay SQL, to a neutral module, or record the owner's acceptance |
| FINDING-9 | MEDIUM | SR-3, SR-1 | classification-reader; classification-api; universe-service; UX design; classification-ui | reader §2.5 `scope` CTE, §2.3; api `UniverseResponse.members[].factors`; universe-service `Member`; UX design §1.4; ui `members-tab.tsx` | Carried from v4 FINDING-12. A member, or a compared stock, covered after the current set was built is silently dropped from the scoped list and from compare. No read supplies cells for the as-of member view, and *Member since* has no source | *{n} of {m} members match* disagrees with its rows | Report such members (for example in `unknown_symbols`), supply member cells, and source *Member since* |
| FINDING-10 | MEDIUM | SR-3, SR-2 | system design; classification-reader; classification-ui | system design constraint 11; reader `current_set.sql`; ui §2.6 stop rule and its sequence diagram | Carried from v4 FINDING-13. Not-current is derived only from a later set row, so a qualifying run with no set yet leaves the previous set unmarked. The poll's stop rule disagrees with its own diagram | AC-20's mark is missing in the claim gap; a stuck scheduler is invisible | Derive not-current from the latest qualifying run as well, and align the stop rule with the diagram |
| FINDING-11 | MEDIUM | SR-8, SR-3, SR-9 | factor-engine; system design; UX design; UX brief; classification-ui | factor-engine §2.3 (309–315), §4 (653–657), §10; system design §3.1 step 25; UX design §1.1, §1.2; brief §3, §8; ui §2.6; DEC-0066 (1) upheld | Carried from v4 FINDING-14. `failure_reason` is the exception class and message, rendered verbatim, while both UX artifacts say no exception text reaches the owner | STD-UI-1 v6 and the EDG claims break on the one critical-tier state | Map exception classes to fixed product sentences at render, or keep the detail in the log and write a reason in product vocabulary; correct the UX claims either way |
| FINDING-12 | MEDIUM | SR-9, SR-3 | capability; UX brief | capability §5.4 rows STD-UI-1, STD-UI-7, STD-UI-12; capability STD-UI v4 pin; brief §12.1 | Carried from v4 FINDING-15. Capability §5.4 disagrees with brief §12.1 on three rules and pins STD-UI v4 | The checked mirror misstates conformance against the standard in force | Owner: revise capability §5.4 and its pin to v6 |
| FINDING-13 | MEDIUM | SR-3 | system design | §3.1 steps 14, 25 to 27; constraint 10; §4.2; §4.4 `classification_set` writers | Carried from v4 FINDING-16. DEC-0067's start-up reclaim and timeout, the `name` prefix, `origin`, `min_peer_set_size`, `unknown_symbols`, three error codes, the completion UPDATE and `name` on stock rows exist only at component level | The design read first by epic and test design understates the contract | Lift these into §3 and §4.2 |
| FINDING-14 | MEDIUM | SR-9 | system design; capability | capability §5.1 tech-stack row (C2, C4, C5, C8); system design (no occurrence of C4) | Carried from v4 FINDING-17: no statement of how classification honours C4 | The capability's "Satisfied when" cannot be confirmed | State how classification honours C4 and surface the reading to the owner |
| FINDING-15 | MEDIUM | SR-9 | DEC-0058; five component designs | DEC-0058 `artifacts` (system design only); api, reader, scheduler, factor-engine (660–661), research-store §4 | Carried from v4 FINDING-18. Five component designs cite the SEC-ENC-001 exception, and DEC-0058 names none of them | Consumer discovery misses five designs | Name the five designs in DEC-0058's `artifacts`, or in a superseding record |
| FINDING-16 | MEDIUM | SR-9, SR-1 | system design; classification-api; UX brief; UX design; classification-ui | system design §8 question 2; api §2.4; delivered `src/factorflow/api/classification_bounds.py:15` (`None`) | Carried from v4 FINDING-19: no artifact bounds the universe name | SEC-INP-001 (High) unmet on create and rename | Owner: state the bound |
| FINDING-17 | LOW | SR-3 | research-store; classification-reader; system design; factor-engine | research-store §2.5; reader §3; system design §4.4; factor-engine §3 (594–596) | Carried from v4 FINDING-20. The delivered guards scan every `.sql` under `src/factorflow/`, but four designs describe the scope in different ways | A reader of a design misjudges the enforcement | Align the descriptions with the delivered guard |
| FINDING-18 | LOW | SR-6, SR-4 | capability | capability §2, AC-12 | Carried from v4 FINDING-21. DEC-0053 and DEC-0055 (2) are owner-upheld, but the capability does not define the standardised score, non-positive bases or `not_computable` | The definitions live in records, not in the capability | At the next capability revision, fold the upheld definitions into §2 and AC-12 |
| FINDING-19 | LOW | SR-3 | system design; DEC-0082 | system design §3.3 step 14, §3.1 step 15; DEC-0082 | Carried from v4 FINDING-22. The system design and the record say both reads are polled; every lower design polls the summary and reloads the list once on completion | A test written from the system design re-reads 3000 rows every 10 seconds | Amend both to the summary poll with one list reload |
| FINDING-20 | LOW | SR-6, SR-3 | system design; api; reader; ui; DEC-0082 | system design §3.3 step 13, §4.2 `later`; api `LaterBlock`; reader `LaterSet`, `current_set.sql` | Carried from v4 FINDING-23. "The first set while none is complete" is not what the SQL returns, which is the most recent set | A test written from the contract could assert the wrong set | Reword as "the most recent set, while none is complete" |
| FINDING-21 | LOW | SR-5 | system design; DEC-0085 | system design version 3 paragraph, §3.2, §3.3 step 15, §4.2, §4.4, §9 | Carried from v4 FINDING-24. The design applies DEC-0085 but never cites it or DEC-0079 (f)'s supersession | The record that withdrew DEC-0079 (f) cannot be found from the design | Cite DEC-0085 |
| FINDING-22 | LOW | SR-5 | classification-reader; classification-api; universe-service | reader §12 ("research store v1", "factor engine v1"); api §12 ("classification scheduler v1"); universe-service §12 ("research store v1"; DEC-0085 omitted) | Carried from v4 FINDING-25, narrowed: factor-engine §12 now names system design v4 | A reader follows a stale version label | Update the labels and add DEC-0085 |
| FINDING-23 | LOW | SR-9, SR-3 | system design; classification-ui; UX design; DEC-0084; DEC-0088 | system design §8 question 4; ui §2.2; UX design §0; delivered `shell.test.tsx:72–77`, `shell.unreachable.test.tsx:59–64`; DEC-0088 (owner, upheld: `pyproject.toml` is a tenth file) | Carried from v4 FINDING-26. Two tests also assert the exact four labels, so "only the counts change" is false, and DEC-0088's tenth file is not in the list | The edit list the owner confirmed is not the one the design shows | Add the two label assertions and `pyproject.toml` to §8 question 4; cite DEC-0088 |
| FINDING-24 | LOW | SR-5 | UX design | UX design `ai_provenance.timestamp` 2026-10-17T02:40:00Z against commit `25fb3e6` (02:27:57Z) | Carried from v4 FINDING-27: the timestamp is later than the commit that produced the content | AGT-PROV-001 asks for the production timestamp | Correct it at the next revision |
| FINDING-25 | LOW | SR-8, SR-3 | UX design; UX brief; classification-ui | S03 §3 save action; UX design §1.1, §1.4 ("thresholds only"), §4 departures; ui §2.7 | Carried from v4 FINDING-28. The save is withheld under a universe scope, and the departure is missing from UX design §4. §1.4 gives a superseded reason | An unrecorded departure from an approved screen | Record the departure, or support the scope in the snapshot; correct §1.4 |
| FINDING-26 | LOW | SR-3 | classification-ui; UX design; DEC-0065 | ui §2.3, §14 question 7; UX design §1.3; DEC-0065 alternatives rejected | Carried from v4 FINDING-29. Each origin line is reached by paging the events read to its oldest event, the approach DEC-0065 rejected | Each expansion of a long-lived universe walks its whole event log | Add `origin` to `UniverseListResponse` rows, or record why the rejection no longer holds |
| FINDING-27 | LOW | SR-1 | classification-reader; classification-ui | reader §2.2 narrative; ui §2.3 narrative (six sentences each) | Carried from v4 FINDING-30 | Cosmetic | Trim each to five sentences |
| FINDING-28 | LOW | SR-5, SR-9 | system design; factor-engine | system design §4.3 (`hypothesis`, "tech-stack v5"); factor-engine §7 (722–724: "already in the tech stack"); tech-stack v7 Key Libraries | Carried from v4 FINDING-31: the tech stack does not list `hypothesis` | A conformance claim rests on a citation that does not support it | Cite `pyproject.toml`, or have the owner add it to the tech stack |
| FINDING-29 | LOW | SR-3 | system design; classification-ui | system design §4.2 `GET /api/instruments`; ui §11 | Carried from v4 FINDING-32: a declared interface has no consuming screen | The architecture inventory lists an unused interface | Remove the row, or name the screen |
| FINDING-30 | LOW | SR-8, SR-3 | UX design; classification-api; universe-service | UX design §1.3 (Name sortable); api `GET /api/universes` (no `sort`); universe-service §2.5 | Carried from v4 FINDING-33 | A sort over one loaded page would be silently wrong (STD-UI-30) | Add a name sort, or drop sortability |
| FINDING-31 | LOW | SR-5 | research-store | research-store §6 "Rollback" | Carried from v4 FINDING-34. The cited system design §4.4 records no accepted loss of universes created after an upgrade | The citation implies an acceptance that is not recorded | Record the cost, or cite where the owner accepted it |
| FINDING-32 | LOW | SR-5 | system design | version 4 paragraph (88–96, "Nothing else changes"); §1 (130–132, OQ-TS-3 "provisionally", amendment "the owner's"); §8 question 3 (891–895); §9 (no row for the SDK models file or Massive's statement references that §8 question 1 rests on); §10 (1073–1078, lists the payload-key mapping as missing); `ai_provenance.source_artifacts` (`CAP-002-specifications-review-report` v2, an id no artifact has; `tech-stack` "5, approved 2026-10-13") | Carried from v4 FINDING-35. The revision changed what these sections describe without updating them; OQ-TS-3 was closed in tech-stack v7 on 2026-10-27 | The design read first by later phases reports a closed question as open and a supplied input as missing | At the next revision: fix the review id and tech-stack pin, close §8 question 3, add the sources to §9, revise §1 and §10 |
| FINDING-33 | LOW | SR-10 | system design | §4.1 note (504); §4.2 summary consumer (518) `shell-home-and-data-health-ui (unpublished)`; §8 question 10 (b); CAP-003 system design (`owner-shell`) | Carried from v4 FINDING-36. CAP-003 has published the consumer as `owner-shell`, so the placeholder names a component no design declares | The architecture inventory carries an undeclared component name | Replace the placeholder with `owner-shell`, close §8 question 10 (b), regenerate `docs/architecture.md` |
| FINDING-34 | LOW | SR-2 | factor-engine; system design | factor-engine §2.4 (395–398: "**Book equity is common equity:** … includes preferred stock, so `preferred_stock` … is subtracted"); system design §8 question 1 (877–880); Massive balance-sheet reference: `preferred_stock` is the "Par or stated value of preferred shares outstanding" | New. The provider defines the subtracted field as a par or stated value, not as the carrying amount of preferred equity. Where an issuer carries preferred equity above that value, the excess stays in `total_equity_attributable_to_parent − preferred_stock`. The design presents the result as common equity without qualification | For such issuers `book_to_price` remains somewhat overstated against a common-shares market capitalisation, though less than at v4. The rationale reads as exact | Qualify the sentence (book equity is parent equity less the par or stated value of preferred stock, an approximation of common equity), or have the owner choose another treatment. Check against the first real Financials run |
| FINDING-35 | LOW | SR-6, SR-4 | factor-engine | §2.4 *Currency* (324–326: "the latest fiscal period end it uses"); MC definition (402–404) and table row `book_equity(P1)` (410); `as_of` sentence (422–424); DEC-0116 (3) ("as_of and the staleness test use the earliest of the latest period ends used"); `value_inputs.sql` line 73 | New, residual of v4 FINDING-6. Every value input now reads two statement types. The currency sentence still uses "the latest fiscal period end it uses", which reads naturally as the later of the two, while DEC-0116 (3), cited only for `as_of`, sets the staleness test at the earlier. "P1" now names three dates in one paragraph: the latest balance sheet in `book_equity(P1)`, the latest income statement in MC, and the earlier of the two in `as_of` | When statement types end on different dates, an implementer following the currency sentence marks `present` an input that DEC-0116 (3) makes `outdated` (AC-13). The case is rare, because the three statements usually come from one filing. No §7 row covers it | Tie the currency test to `as_of` ("an input whose `as_of` is earlier than D − 6 months") and cite DEC-0116 (3) there. Name each statement type's latest period distinctly; add a §7 row with two statement types of different period ends |
| FINDING-36 | LOW | SR-6 | factor-engine | §2.4 *Line items* (345–346: "read as `payload ->> key` with the key and sign"); `LineItem` (359: `sign` "+1, or -1 when the provider reports an outflow negative"; 360–361: `magnitude`, `less_key`) | New. The read is now key, sign, magnitude and `less_key`, but the sentence that defines it names only key and sign. No formula combines the three modifiers, or says which combinations are valid (for example, whether `less_key` is subtracted before or after `sign` and magnitude). The `sign` comment describes a −1 convention no item now uses | None for the seven configured items, since no item combines modifiers. A later edit to `LINE_ITEMS` would have no stated semantics | State the amount once (for example `sign × (\|key\| if magnitude else key) − less_key`, absent `less_key` read as 0) and restrict or document the valid combinations |
| FINDING-37 | LOW | SR-5 | system design; factor-engine | system design `ai_provenance` (lines 14–37); factor-engine `ai_provenance` (11–34: timestamp 2026-11-06T12:00:00Z; `CAP-002-specification-review` v2; `tech-stack` 5); commit `3e006b5` at 2026-11-07T02:11:03Z; `docs/artifact-contract.md` Versioning Rules ("`updated` and provenance timestamp change on every material modification"); `check-artifacts.py` warnings | New. `3e006b5` changed both designs' content (revisions `5ab3d9c3…`, `40f4719f…`) and applies review v4, but neither design's provenance changed. The timestamp predates the change by about 14 hours, and review v4 is in neither design's `source_artifacts` | Provenance does not identify the inputs of the content up for re-approval (AGT-PROV-001) | At the next revision, set the timestamp to the modification time and list `CAP-002-specification-review` v4 and `tech-stack` v7. Provenance is part of the content revision (`MUTABLE_GATE_FIELDS` excludes only `status`, `updated` and `approval`), so editing it now needs a new review |
| FINDING-38 | LOW | SR-6, SR-5 | factor-engine; system design | factor-engine lines 52–53, 276, 346, 597–598, 614, 617, 871–875 (§14 question 2: "to uphold DEC-0055"), 878–880 (§14 question 4: "to uphold or set another value"); system design: 26 occurrences of `PROVISIONAL`, among them §1 (130–132), §4.3 (546, 556), §8 questions 5 and 6, §10 (1087–1093: "the owner's verdict on each record, earn the remaining points"); DEC-0052 to DEC-0058, DEC-0064 to DEC-0067, DEC-0069, DEC-0071, DEC-0082 to DEC-0084: `owner_verdict: upheld`, `status: applied` (DEC-0055 upheld 2026-10-17T21:21:33Z) | New. Both revised designs still mark owner-upheld decisions **PROVISIONAL**, and their open questions still ask the owner to uphold decisions that were upheld on 2026-10-17. The seven unchanged component designs carry the same labels | The two designs up for re-approval present settled decisions as open, and epic and test design inherit the wrong status. Overlaps FINDING-32 (OQ-TS-3) | At the next revision of each design, drop `PROVISIONAL` from upheld decisions and close or reword the questions they answer; update the §10 readiness text |

---

## Traceability Matrix

Per-AC verdict (VER-EVD-004). Mappings are unchanged since v4 except where
noted.

| AC | System design | Component design(s) | UX design | Verdict |
|----|---------------|---------------------|-----------|---------|
| AC-1 | 3.2 steps 4, 4a; 5.13 | universe-service 2.4; api 2.5 | 1.3; 1.1, 1.4 | Mapped |
| AC-2 | 3.2 step 3a; 3.3 step 15; 4.2; 4.4 | universe-service `create_from_filter`; reader `evaluate_filter`; api 2.4 | 1.1, 1.3, 1.4 | Mapped with defect (FINDING-25) |
| AC-3 | 4.2; 4.4 | research-store; universe-service | 1.3; 1.1 | Mapped |
| AC-4 | 3.2 steps 8, 11, 12 | universe-service 2.4 | 1.4 | Mapped |
| AC-5 | 3.2 step 7; 5.13 | universe-service 2.4 | 1.3, 1.4; 1.1 | Mapped |
| AC-6 | 4.4; 5.3 | research-store; universe-service 2.5 | 1.4 | Mapped with defect (FINDING-9) |
| AC-7 | 5.7; 5.8; 8 question 1 (MC from the income statement; capex magnitude; book equity less preferred) | factor-engine 2.4, 2.5 | 1.5, 1.6 | Mapped; v4's window, book-equity and table defects closed; remaining FINDING-3 (null preferred), FINDING-34 (par value), FINDING-2 (Q4 coverage) |
| AC-8 | 5.5 | factor-engine 2.5; reader 2.5 | 1.1 | Mapped |
| AC-9 | 3.3 step 15; 5.7 | factor-engine 2.5; research-store | 1.1 | Mapped; method owner-upheld (FINDING-18) |
| AC-10 | 3.1 steps 4 to 7a, 19 to 21; 5.10 | classification-scheduler 2.4 | 1.2 | Mapped with defect (FINDING-1) |
| AC-11 | 3.1 steps 28 to 31 | factor-engine 5, 7; scheduler 2.3 | 1.1; 1.2 | Mapped with defect (FINDING-1) |
| AC-12 | 3.1 step 12; 3.3 step 15; 5.6 | factor-engine 2.4, 2.5; reader 2.5 | 1.1, 1.5, 1.6 | Mapped with defect (FINDING-9); consecutive-window `missing` now stated |
| AC-13 | 3.3 step 18; 5.6; 5.8 | factor-engine 2.4; reader 2.4 | 1.6; 1.2 | Mapped; *as of* for two statement types now stated; staleness test FINDING-35 |
| AC-14 | 3.1 steps 9, 11a | factor-engine 2.3 step 6, 2.5 | 1.1 | Mapped |
| AC-15 | 3.2 step 10; 3.3 step 15; 5.5 | factor-engine 2.5; reader 2.5 | 1.1, 1.4, 1.5, 1.6 | Mapped |
| AC-16 | 3.3 steps 15, 16 | reader 2.5; api 2.4 | 1.1, 1.4, 1.5 | Mapped with defect (FINDING-9) |
| AC-17 | 3.3 step 17 | factor-engine 2.4 `detail`, `known_on` null on `missing` (DEC-0242); reader 2.6 | 1.1; 1.6 | Mapped (v4's secondary defect closed) |
| AC-18 | 4.2 `/history`; 4.4 | reader 2.6; api | 1.6 | Mapped with defect (FINDING-6) |
| AC-19 | 3.1 steps 22 to 24; 5.4 | factor-engine 3; scheduler | 1.6 | Mapped |
| AC-20 | 3.1 steps 13, 14b, 25 to 27; 3.3 steps 13, 14, 18; 5.11 | reader 2.4; api; ui 2.6 | 1.2; 1.1, 1.6 | Mapped with defects (FINDING-7, FINDING-10, FINDING-11, FINDING-19, FINDING-20) |
| AC-21 | 3.3 steps 13, 18; 4.2; 8 question 11 | reader 2.4; api; ui 2.6 | 1.2 | Mapped with defects (FINDING-1, FINDING-6) |
| AC-22 | 3.3 step 14 | reader 2.4; api 2.7 | 1.1, 1.5, 1.6 | Mapped (FINDING-6, FINDING-7) |
| AC-23 | 5.9 | factor-engine 2.4, 2.5; research-store | every scored surface | Mapped; the design's rule ("any statement row used") covers the income statement behind MC, DEC-0122's row list does not (FINDING-4) |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No finding is CRITICAL. No AC contradicts another, no core requirement is
untestable, and every provider field the designs now name exists on the
provider's schema. One finding is HIGH: FINDING-1, carried unchanged since
review v1, which is the owner's decision on the first-deployment backlog. No
finding at this review is new at HIGH.

**Re-approval of the two revised designs.** The four findings review v4 placed
on system design v4 and factor-engine v3 are closed: FINDING-2 (v4's HIGH) and
FINDING-4, 5 and 6. Nothing new is above MEDIUM. Both designs are therefore
clear for the owner's re-approval at the revisions this report binds: system
design v4 at `sha256:5ab3d9c3…` and factor-engine v3 at `sha256:40f4719f…`.
Three things remain on them, and none blocks:

- **FINDING-1 (HIGH)** touches factor-engine §6 and system design §3.1. It
  predates both revisions and is the owner's decision.
- **FINDING-3 (MEDIUM)** is one sentence and one test row: how a JSON-null
  `preferred_stock` reads. It is best settled before the code follow-up is
  planned, because the code implements exactly this rule. Two paths are open.
  The owner may re-approve now and fix it in the same change as the follow-up,
  or fix it first and obtain a new review. Any edit changes the content revision
  that this report binds, provenance and LOW clean-ups included (FINDING-37).
- **FINDING-2 (MEDIUM)** and the LOW findings can wait for the next
  substantive revision.

FINDING-4 (the decision records) and FINDING-5 (the backlog vehicle and test
specification) belong to the owner and to `$backlog-review` respectively, and
should land before the code follow-up is planned.

Re-approval mechanics, for the owner: both designs are `draft` and keep their
v3-era `approval` blocks, so re-approval is a direct edit of each block per
`docs/approval-gates.md`:

- `approved_at` must be later than this report's `generated` time;
- `review_artifact` must point here;
- `reviewed_revision` must be the revision above.

This report binds the other nine subjects at their unchanged id, version and
revision, so their approvals are not disturbed. Their pins to
`CAP-002-system-design` v3 clear in the gate once v4 is approved. This review
approves nothing.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-1: decide which runs qualify at first deployment, then align the
   scheduler, research-store, factor-engine §6 and system design §3.1.

### Should Fix (MEDIUM findings)

2. FINDING-3: state that a JSON-null `preferred_stock` reads as zero (or the
   owner's other choice) and add the test row. Do this before the code
   follow-up is planned.
3. FINDING-4: record the owner's 2026-11-06 answer and the two remedies. They
   should supersede DEC-0055 (6), amend DEC-0122 and carve `preferred_stock`
   out of DEC-0116 (4). Carry the trailers on the follow-up commits.
4. FINDING-5: refine epic E2, add a backlog item for the code follow-up, and
   bring the factor-engine test specification in line with §7.
5. FINDING-2: define the first-run coverage check and the Q4 fallback; reword
   "is closed".
6. FINDING-6 to FINDING-16: as carried.

### Nice to Have (LOW findings)

7. FINDING-17 to FINDING-38, as listed. FINDING-32, FINDING-34 to FINDING-38
   can share one edit with the next substantive revision of the two designs,
   so that they cost no extra review.

---

## Follow-up Work (implementation drift, not findings)

The code deliberately still follows system design v3 and factor-engine v2. Once
the owner re-approves, the following must change. FINDING-5 asks for a planned
vehicle for this work, and FINDING-4 for the records it should cite.

1. `src/factorflow/classification/line_items.py`:
   - lines 1–5: the docstring still says the keys are open;
   - lines 17–36: the seven keys; `shares_outstanding` statement type
     `income_statement`; the `magnitude` and `less_key` fields;
     `capital_expenditure` `magnitude=True`; `book_equity`
     `less_key="preferred_stock"`.
2. `src/factorflow/classification/sql/value_inputs.sql`:
   - the line-item input (lines 9–15, 41–50) must carry `magnitude` and
     `less_key`;
   - the amount must take the absolute value for capital expenditure and
     subtract `preferred_stock` from the same balance sheet, reading it as zero
     when absent (and as FINDING-3 settles for null);
   - line 38 reads only the rank-1 balance sheet and the window rows, so every
     value input must also read the rank-1 quarterly income statement;
   - line 58 sums `shares_outstanding` over every row used, which would
     multiply it by four for `earnings_yield`; it must take the one rank-1 row;
   - the line 114 comment and `balance_sheet_period_end` in `detail` name the
     balance sheet;
   - the restatement rows must include the income statement (FINDING-4).
3. `tests/unit/test_line_items_resolved.py`: the strict `xfail` becomes an
   XPASS failure once the keys are set, so remove the marker.
4. `tests/integration/test_engine_inputs_fundamentals.py`: the four §7 rows
   added by `3e006b5` (shares never summed, capital expenditure by magnitude,
   book equity less preferred, consecutive windows). `statements.sql` already
   follows DEC-0221.

---

## Observations Outside the Review Subjects

- **Review v4's timestamp.** v4's `generated` and `ai_provenance.timestamp`,
  2026-11-07T02:20:00Z, are nine minutes later than `3e006b5`
  (2026-11-07T02:11:03Z), the commit that added the report. An approval that
  named v4 would have had to postdate a time the report itself had not reached.
  This report's timestamp was taken when it was written. No action is needed if
  re-approval cites this report.
- **CAP-001 timeframe constraint** (v4 observation, unchanged).
  `FinancialStatement.timeframe` accepts only `annual` and `quarterly`, and
  Massive's income-statement and cash-flow references also list
  `trailing_twelve_months`. This is CAP-001's to check.
- **Gate leniency on a draft upstream** (v4 observation, unchanged).
  `upstream_approved` treats a `draft` artifact with a set `approved_at` as
  approved. Nothing is exposed now.
- `docs/architecture.md`: the `GET /api/classifications` row is still
  truncated at `state: building \`.
- DEC-0076's text still says the save posts "the thresholds and the scope".
- DEC-0241 (`decided_by: agent`, `triage: accepted`, `owner_verdict: null`) is
  implemented in the delivered momentum code. The factor-engine now says it is
  "open with the owner", which is accurate. Its momentum table's "prices are
  positive by acquisition" is the premise DEC-0241 found unenforced, and
  follows whatever the owner decides.

## Run Record

A parent agent invoked this run as `$specification-review` for CAP-002. The
parent restricted writes to this report and forbade branch changes in the
project repository. No interactive input tool was available to this reviewer,
so the Step 6 question is returned to the parent rather than asked.

One prerequisite did not pass and was decided rather than asked.
`check-prerequisites.sh` exited 2 because the context cache was 31 hours old
against a 24-hour window. Refreshing runs the context feeder, which writes
`cache/` and `logs/` and fetches and updates the repositories under `repos/`.
Both are outside the one write this run is permitted. This review reads every
subject directly from the checkout at `3e006b5` and uses no cached summary, so
the stale cache bears on nothing it judges. Decision: proceed and record it
here, as reviews v3 and v4 did in the same situation. No decision record was
written, because this report is the only permitted write. The parent or owner
may record it and refresh the context before the next step.

No other file was written. In particular:

- no specification, decision record, backlog item, test specification, code,
  tech-stack, constitution, CAP-001, CAP-003 or `docs/ux/` artifact was
  edited;
- no approval block was touched;
- no branch, commit, stash or reset was made;
- `build-architecture.py` ran without `-w`.
