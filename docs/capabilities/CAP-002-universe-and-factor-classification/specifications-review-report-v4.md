---
artifact_schema_version: 1
artifact_id: CAP-002-specification-review
artifact_type: specification-review
artifact_version: 4
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-06
updated: 2026-11-06
document: spec-review-report
capability: CAP-002
version: v4
generated: 2026-11-07T02:20:00Z
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
    result: "PASSED, exit 0: 3 designs, 27 components, 84 interfaces; no drift against docs/architecture.md"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 305 warnings, exit 0 (--strict), 618 artifacts; CAP-002 subject warnings: capability pins STD-UI v4 (current v6); eight unchanged designs pin CAP-002-system-design v3 (current v4, the revision under review); designs pin tech-stack v5 (current v7, approved); designs pin CAP-002-specification-review v2 (current v3; review pins are provenance and the gate skips them)"
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
  SR-8: "applied — design_system_available true; UX brief, UX design and classification-ui are byte-identical to review v3 (same content revisions) and design-system/ is unchanged since review v3 (git log 57af49c..56a8162 empty), so v3's mechanical verification of 62 component-variant pairs and 56 tokens stands; the v4 change touches no owner-facing surface"
  SR-9: "applied — check-capabilities.py (no error, no warning); capability section 5.1 and 5.4 unchanged; tech-stack v7 (OQ-TS-3 closed for classification, C4 unchanged); CONST-SEC 1.3 SEC-ENC-001 bookkeeping; decision records naming the two revised designs"
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
    content_revision: sha256:d468984ce4ce27093f7f6b32b7b878b9ae744340c2a29b27321dec4e84c9a39f
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
    content_revision: sha256:f03ea9b16b2799922fa095cd11251d4e8b4c6da35e3e810d3ab4565f4edbcb11
  - artifact_id: CAP-002-component-design-research-store
    artifact_version: 2
    content_revision: sha256:8644c9766f72ebb24be991814d61734bba93fcc8c344791cd3c17561a03cb192
  - artifact_id: CAP-002-component-design-universe-service
    artifact_version: 2
    content_revision: sha256:7b18e9f329c2a012cb516584e9127805fc9a15f2b382cf77fa83763bbee6fe03
statistics:
  total_findings: 36
  critical: 0
  high: 2
  medium: 17
  low: 17
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T02:20:00Z
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
    - id: tech-stack
      version: "7 (approved; context)"
    - id: STD-UI
      version: "6 (approved; governs, not a subject)"
    - id: PRODUCT-UX-S03
      version: "4 (approved; governs, not a subject)"
    - id: DEC-0052 to DEC-0294
      version: "CAP-002-scoped records; DEC-0055, DEC-0066, DEC-0088, DEC-0116, DEC-0122, DEC-0221, DEC-0241 to DEC-0243 read in full"
    - id: massive SDK 2.8.0
      version: "massive/rest/models/financials.py; massive/rest/financials.py (uv.lock pins 2.8.0)"
    - id: specifications-review-report-v3
      version: "CAP-002 review v3, READY-WITH-WARNINGS (every finding re-verified, not carried on trust)"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Specification Review Report -- CAP-002

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-002 Universe & Factor Classification |
| **Version** | v4 (fourth review; triggered by commit `56a8162`) |
| **Specifications Reviewed** | Capability v1 (approved); system design **v4** (draft, revised); factor-engine **v3** (draft, revised); UX brief v3, UX design v3, classification-api v3, classification-reader v3, classification-ui v3, classification-scheduler v2, research-store v2, universe-service v2 (all approved, unchanged since review v3) |
| **Total Findings** | 36: CRITICAL 0, HIGH 2, MEDIUM 17, LOW 17 |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

Commit `56a8162` records the owner's answer of 2026-11-06 to system design §8
question 1 (the Massive payload keys of the seven line items) and moves shares
outstanding from the balance sheet to the diluted weighted average of the most
recent quarterly income statement, revising DEC-0055 (6). Only system design
v3 → v4 and factor-engine v2 → v3 changed; the other nine subjects have the
same content revisions review v3 bound.

**The owner's sources hold.** Each of the seven keys exists on the stated
statement model in the `massive` SDK 2.8.0 (`financials.py` lines 530–811), and
the same field names appear in Massive's published balance-sheet,
income-statement and cash-flow-statement references. CAP-001 calls exactly
those three `/stocks/financials/v1/...` endpoints with `raw=True` and stores
every statement field under its wire name, so the keys are the ones the
stored payload will carry. Massive's balance sheet has no share-count field,
which confirms the reason for the move. The capital-expenditure sign is
coherent with `value_inputs.sql`: the amount is `raw × sign` (line 49) and
`fcf_yield`'s numerator is `operating_cash_flow - capital_expenditure`
(line 112), so a provider value of −X becomes +X and FCF = OCF − X.

**The shares move is consistent where it was written and incomplete where it
was not.** The capability, the UX artifacts and the other six component designs
are source-agnostic about shares and need no change. Inside the factor-engine,
the input table, the *Statements* rule, the intro and the test plan still read
as before (FINDING-6). Outside the subjects, DEC-0055 (6) and DEC-0122 still
name the balance sheet (FINDING-7), and epic CAP-002-E2's open question and
story CAP-002-E2-S3 still say the keys are unanswered, with no backlog item
carrying the code change (FINDING-8).

The two HIGH findings are FINDING-1, the first-deployment backlog, carried
unchanged since review v1, and **FINDING-2**, which is new: factor-engine v3 still
states the 12-month span rule that the owner replaced on 2026-10-28 in DEC-0221.
That record directs the amendment "at the design's next revision", and v3 is that
revision. Review v3's FINDING-2 (the keys) is reduced to MEDIUM as FINDING-3:
the keys are now fixed, and only quarter coverage, Q4 included, awaits a real
run. Two other new MEDIUM findings concern the answer itself:
a capital expenditure reported positive yields a wrong FCF, not a missing one
(FINDING-4); `total_equity_attributable_to_parent` includes preferred equity,
against the design's stated reason for choosing it (FINDING-5).

Six review v3 findings are closed: two by the owner upholding DEC-0052 to
DEC-0085 on 2026-10-17, one by tech-stack v7, one by a harness change and two by
CAP-003's design.
No finding is CRITICAL, so the verdict is READY-WITH-WARNINGS.

## Review Scope

All eleven artifacts resolved by `get-capability-specifications` are in scope.
The two revised designs were read in full, together with the complete diff of
`56a8162`. The other nine were confirmed byte-identical in reviewed content to
review v3 by `artifact-gate.py revision`. `git log 57af49c..56a8162` over the
designs and the capability shows only the approval commit `f71478e` and
`56a8162`. Every review v3 finding about those nine was re-checked against the
external facts it rests on (decision records, tech stack, delivered code,
harness gate, CAP-003) rather than carried on trust.

Read for verification and propagation, none of them a subject and none edited:

- `.venv/lib/python3.12/site-packages/massive/rest/models/financials.py`
  (`FinancialBalanceSheet` 530–621, `FinancialCashFlowStatement` 623–726,
  `FinancialIncomeStatement` 728–809) and `massive/rest/financials.py`
  (endpoint paths); `uv.lock` (massive 2.8.0).
- Massive's published references for cash-flow statements, income statements
  and balance sheets (`massive.com/docs/rest/stocks/fundamentals/...`), fetched
  in this session.
- CAP-001 acquisition code: `src/factorflow/ingestion/massive/client.py`
  (120–151, 257–271), `models.py` (206–280), `writer.py` (222–239).
- The unchanged implementation: `src/factorflow/classification/line_items.py`,
  `sql/value_inputs.sql`, `sql/statements.sql`,
  `tests/unit/test_line_items_resolved.py`.
- Epic `CAP-002-E2.md` (v2, approved), story `CAP-002-E2-S3.md` and its task
  plan, `tests/component/factor-engine-tests.md`, `tests/coverage-matrix.md`.
- Decision records DEC-0052 to DEC-0294 scoped to CAP-002, by verdict and by
  `artifacts`; DEC-0055, DEC-0066, DEC-0088, DEC-0116, DEC-0122, DEC-0221 and
  DEC-0241 to DEC-0243 in full.
- `docs/constitution/tech-stack.md` v7; the CAP-003 capability and system
  design (for v3 FINDING-26 and FINDING-29); `scripts/artifact-gate.py`.

Implementation drift is excluded by direction and by design: the code still
reads shares from the balance sheet and still holds `REQUIRES_INPUT` keys,
because coding waits for re-approval. It is listed under "Follow-up Work", not
as a finding.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All template sections present in all eleven; v4 adds no diagram; factor-engine §7 test plan checked against the revised §2.4 (FINDING-6) |
| SR-2 Correctness | applied | The seven keys against the SDK models and Massive's references; sign arithmetic against `value_inputs.sql`; the design's rationale for each key against the provider's field definitions (FINDING-4, FINDING-5) |
| SR-3 Consistency | applied | The shares move searched across all eleven subjects, the epic, the story, the test specifications and the decision records; owner decisions naming the revised designs checked for application (FINDING-2, FINDING-6 to FINDING-8); v3 cross-spec findings re-checked |
| SR-4 Testability | applied | ACs unchanged; factor-engine §7 has no test for the new market-capitalisation rule or the sign (FINDING-6) |
| SR-5 Traceability | applied | System design §7 and component §13 unchanged and still map all 23 ACs; v4 sources against §9; provenance pins; decision-record `artifacts` (FINDING-7, FINDING-35) |
| SR-6 Clarity | applied | "P1" with two statement types (FINDING-6); vague-term scan of the v4 text |
| SR-7 Feasibility | applied | Q4 coverage and its failure mode under DEC-0221 (FINDING-3); sign failure mode (FINDING-4); first-deployment backlog (FINDING-1); package cycle (FINDING-11) |
| SR-8 UX Completeness | applied | As in the frontmatter: UX artifacts and design system unchanged since v3, so v3's mechanical verification stands; S03-1 to S03-7 re-stated below |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` clean; C4 (FINDING-17); OQ-TS-3 closed by tech-stack v7; DEC-0058 bookkeeping (FINDING-18); STD-UI mirror (FINDING-15) |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` clean; v4 adds no component or interface; the summary read's placeholder consumer now has a published identifier (FINDING-36) |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, exit 0, PASSED; no error, no warning | none |
| `build-architecture.py -p factorflow-v2` | run, exit 0, PASSED: 3 designs, 27 components, 84 interfaces, no drift | none (the truncated `GET /api/classifications` row v3 observed persists; Observations) |
| `check-artifacts.py -p factorflow-v2 --strict` | run, exit 0, PASSED with 305 warnings over 618 artifacts | FINDING-15 (STD-UI v4 pin); the eight `CAP-002-system-design` v3 pins are the expected consequence of the revision under review and clear once v4 is approved |
| `check-references.py` | run, exit 0, PASSED: 1247 references, 520 files | none (review v3's dangling `docs/ux/README.md` no longer occurs) |
| `check-constitutions.py` | run, exit 0, PASSED: 10 constitutions, 38 skills | none |

All five ran from the harness worktree
`.claude/worktrees/factorflow-v2-cap-002-run-cad67f` (harness branch
`usr/alvaro-de-jodra/CAP-002-blind-review-20261106`, `90510ae`), over the
project checkout on `usr/alvaro-de-jodra/CAP-002-automation-rework` at
`56a8162`.

Supplementary evidence gathered in this session:

- `check-prerequisites.sh --project factorflow-v2`: exit 2, every check PASSED
  except *Context freshness* STALE (last run 2026-11-05T18:43:01Z, 31 hours,
  window 24). Handled under "Run Record".
- `pipeline-state.py check --capability CAP-002 --stage specification-review`
  before writing: `AWAITING-APPROVAL` (exit 1): review v3's `review_subjects`
  do not cover system design v4 or factor-engine v3.
- `artifact-gate.py revision` for all eleven subjects (`review_subjects`).
- `artifact-gate.py require` (read-only) on research-store, UX design and epic
  E2: passed; on the system design: fails on draft status, stale approval and
  review coverage, as expected before re-approval.
- `scripts/artifact-gate.py` lines 288–327: `upstream_errors` now skips pinned
  review reports (lines 305–319, citing review v3 FINDING-3).
- The SDK models, Massive's three references and CAP-001's acquisition path
  (results under "Verification of the Owner's Answer").

## Constitutions Applied

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | AGT-PROV-001: both revised designs incremented `artifact_version` and carry complete provenance; the system design still pins a review id that names no artifact (FINDING-35). AGT-AUTH-002: the owner's answer is recorded in both designs, but the upheld record DEC-0055 (6) still states the superseded rule and no record supersedes it (FINDING-7). AGT-EVIDENCE-001: the answer cites the SDK file and the Massive reference; both verified. AGT-EVIDENCE-002: v4 adds no quantitative value. AGT-SCOPE-002: v4 adds no delivered-file edit |
| CONST-MDL 1.3 | Exact model identifiers in both revised provenance blocks; no product model usage |
| CONST-OPS 1.3 | OPS-MIG: v4 adds no migration. Because the keys were unresolved, every production value input so far is `missing`, so no recorded set computed market capitalisation from the balance sheet and the revision rewrites no history (C5). OPS-ERR-001: FINDING-13 carried |
| CONST-REV 1.4 | Two-stage report (Stage 1, Stage 2). REV-RCV-001: the owner's two sources were verified independently against the installed SDK and the live provider references. REV-RCV-002: four statements are challenged with evidence: "Book equity ... attributable to common shareholders" (FINDING-5); "Where they do not, inputs are `missing`, never wrong" for the sign half (FINDING-4); factor-engine v3's "FINDING-2 ... is closed" while quarter coverage is open (FINDING-3); system design v4's "Nothing else changes" while §8 question 3, §9 and §10 are stale (FINDING-35) |
| CONST-SA 2.0 | SA-CLASS-002: package cycle carried (FINDING-11). SA-MD-002: stale version labels (FINDING-25) and stale open-question text (FINDING-6, FINDING-35). SA-MD-003: placeholders use `[REQUIRES INPUT]` |
| CONST-SEC 1.3 | SEC-INP-002: payload keys are bound as parameters, never interpolated (factor-engine §4; `value_inputs.sql` lines 12–14). SEC-INP-001: universe name still unbounded (FINDING-19). SEC-ERR-001: FINDING-14 carried. SEC-ENC-001 bookkeeping: FINDING-18 carried. No channel, bind or port added |
| CONST-VER 1.2 | All five mechanical checks and the supplementary checks ran in this session; per-AC verdicts in the Traceability Matrix, per-check verdicts for S03, per-finding disposition of review v3 (VER-EVD-004) |

---

## Stage 1 -- Specification Compliance

The capability is unchanged and approved. The system design still maps all 23
acceptance criteria and S03-1 to S03-7. The owner's answer makes AC-7, AC-9 and
AC-23 achievable for value and growth in production, subject to quarter
coverage (FINDING-3). Fidelity breaks where review v3 left it: first-deployment
semantics of AC-10 and AC-21 (FINDING-1), members with no row in the current
set (FINDING-12), not-current without a later set row (FINDING-13), the save
under a universe scope (FINDING-28) and the capability's STD-UI mirror
(FINDING-15). The revision adds one fidelity break of its own, against an owner
decision rather than the capability: the factor-engine's statement windows
contradict DEC-0221 (FINDING-2).

## Stage 2 -- Artifact Quality

The system design's v4 text is precise and sourced. Its residual-risk paragraph
names the two things only a real run can confirm. The factor-engine's v3 edits
are correct where made, but the revision stopped at the code listing: the
input table, the *Statements* rule, the intro, a constraint bullet, the
references table and the test plan were not brought along (FINDING-6), and
owner decisions naming the design were not folded in (FINDING-2). The answer's
own rationale overstates in two places (FINDING-4, FINDING-5).

---

## Verification of the Owner's Answer

### Keys against the provider schema

| Line item | Statement type | Key | SDK model field (`financials.py`) | Massive reference | Verdict |
|-----------|----------------|-----|-----------------------------------|-------------------|---------|
| book equity | `balance_sheet` | `total_equity_attributable_to_parent` | `FinancialBalanceSheet` line 566 | balance sheets: "Total shareholders' equity attributable to the parent company, excluding noncontrolling interests" | Exists; includes preferred equity (FINDING-5) |
| shares outstanding | `income_statement` | `diluted_shares_outstanding` | `FinancialIncomeStatement` line 737 | income statements: a weighted average including dilutive securities | Exists; is a weighted average, as v4 states |
| net income | `income_statement` | `net_income_loss_attributable_common_shareholders` | line 750 | income statements: available to common shareholders after preferred dividends and noncontrolling interests | Exists; matches the design's claim |
| diluted EPS | `income_statement` | `diluted_earnings_per_share` | line 736 | income statements | Exists |
| revenue | `income_statement` | `revenue` | line 758 | income statements | Exists |
| operating cash flow | `cash_flow_statement` | `net_cash_from_operating_activities` | `FinancialCashFlowStatement` line 643 | cash-flow statements | Exists |
| capital expenditure | `cash_flow_statement` | `purchase_of_property_plant_and_equipment` | line 652 | cash-flow statements: outflows "typically reported as negative values" | Exists; "typically", not always (FINDING-4) |

`FinancialBalanceSheet` (lines 531–569) has no share-count field: `common_stock`
is a par or stated dollar value. The balance-sheet reference lists 38 fields and
none of them is a share count. **The reason for the move is confirmed.**

### Keys against the stored payload

CAP-001's `MassiveClient.fetch_financials` calls
`list_financials_balance_sheets`, `list_financials_income_statements` and
`list_financials_cash_flow_statements` (`client.py` 133–136), which resolve to
`/stocks/financials/v1/balance-sheets`, `/income-statements` and
`/cash-flow-statements` (`massive/rest/financials.py` 70, 125, 182). It calls
them with `raw=True` and stamps `statement_type` with the same three values
`LINE_ITEMS` uses. `FinancialStatement` sets `extra="allow"` (`models.py` 250),
so every statement field is kept under its wire name, and
`value_payload()` is `model_dump(mode="json")` (280). The SDK's `from_dict`
reads each wire key under the identical field name. The keys v4 names are
therefore the keys `fundamental_observation.payload` will hold. The `massive`
version is unpinned in `pyproject.toml` (`>=2`) but locked at 2.8.0 in
`uv.lock`; with `raw=True` only the wire schema matters, and the published
references agree with 2.8.0.

### Sign against `value_inputs.sql`

`amount = (payload ->> key)::numeric * sign` (line 49), then
`fcf_yield` numerator `= operating_cash_flow - capital_expenditure`
(line 112), and factor-engine §2.4 states the same formula. With sign −1, a
provider value of −X contributes +X, so FCF = OCF − X. **Coherent.** The code
still carries sign `1` and `REQUIRES_INPUT` (`line_items.py` 26–36). That is
the expected drift; the follow-up must change the key and the sign together.

### Shares move across CAP-002

| Artifact | Says | Consistent? |
|----------|------|-------------|
| Capability §2, §6 | Market capitalisation and "shares outstanding" without a statement source | Yes |
| System design v4 constraint 8, §6 assumption 1, §8 question 1 | Most recent quarterly income statement, diluted weighted average, never summed | Yes |
| Factor-engine v3 `LINE_ITEMS`, "The eight inputs", §14 question 1 | Same | Yes |
| Factor-engine v3 input table, *Statements* rule, intro, constraints bullet, §7, §12 | Balance sheet only for `book_to_price`; no income statement for `fcf_yield`; "carried, not answered"; "most recent balance sheet"; no test; "system design v3" | **No** (FINDING-6) |
| Research-store, reader, API, UI, scheduler, universe-service, UX brief, UX design | No statement source for shares | Yes (nothing to change) |
| DEC-0055 (6); DEC-0122 | "shares outstanding from the most recent quarterly balance sheet"; "the newest balance sheet supplying shares_outstanding" | **No** (FINDING-7) |
| Epic CAP-002-E2 Open Questions, Out of Scope, Dependencies, DAC-E2-1 | Keys `[REQUIRES INPUT]`; value and growth blocked; "most-recent balance sheet" | **No** (FINDING-8) |
| Story CAP-002-E2-S3 | "Verification ... waits on the owner's payload-key answer" | **No** (FINDING-8) |
| `tests/component/factor-engine-tests.md`, `tests/coverage-matrix.md` | No case for the source or the never-summed rule | Gap (FINDING-6) |
| Code (`line_items.py`, `value_inputs.sql`, `test_line_items_resolved.py`) | Balance sheet; unresolved keys; strict xfail | Expected drift (Follow-up Work) |

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability; no finding.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py`: no error, no warning. §5.1 unchanged: the CAP-001
`requires-runtime` row is correctly typed, cited and placed; §5.2 disclaimers
correctly placed. CAP-003 now declares its own `requires-runtime` edge on
CAP-002 (CAP-003 capability line 342), so the direction review v3's FINDING-29
recommended is in place and no CAP-002 row is needed. Tech stack: C2, C5 and
C8 honoured; C4 still not addressed (FINDING-17); OQ-TS-3 is closed for
classification in tech-stack v7 (approved, 2026-10-27). STD-UI: all 30 rules
accounted for, no illegal specialization; mirror disagreement carried
(FINDING-15).

#### Completeness (SR-1)

No finding.

#### Correctness (SR-2)

No finding. The ACs do not contradict one another.

#### Testability (SR-4)

- FINDING-21 (reduced): the capability text still does not define "standardised
  score" or non-positive bases, now owner-upheld in DEC-0053 and DEC-0055 (2).

#### Clarity (SR-6)

- FINDING-21 (above).

### System Design Specification (v4)

- **SR-1**: complete; no diagram added.
- **SR-2**: the §8 question 1 table is correct against the provider schema;
  the stated reason for book equity is not (FINDING-5).
- **SR-3**: FINDING-16 (drift from the decomposition), FINDING-22 (both reads
  polled), FINDING-23 ("the first set"), FINDING-32 (unused interface), all
  carried.
- **SR-5**: FINDING-24 (DEC-0085 not cited), FINDING-26 (edit list, now also
  DEC-0088), FINDING-31 (`hypothesis`), FINDING-35 (stale §8 question 3, §9,
  §10 and provenance).
- **SR-7**: FINDING-1 (§3.1 steps 5 and 19 to 21); FINDING-3 and FINDING-4
  (§6 assumption 1).
- **SR-9**: FINDING-17 (C4); FINDING-19 (§8 question 2).
- **SR-10**: FINDING-36. Otherwise no finding: §4.1 declares seven identifiers;
  every diagram box and participant carries one; every §4.2 row names provider
  and consumer components; no capability identifier is an actor in §1 to §5.

### Component Design Specifications

- **factor-engine (v3)**: FINDING-1 (§6); FINDING-2 (§2.4 windows, DEC-0221;
  DEC-0242); FINDING-3 (§14 question 1, assumption bullet); FINDING-4 (§2.4,
  §6.1 assumption bullet); FINDING-5 (`LINE_ITEMS` book equity); FINDING-6
  (§2.4 table and *Statements* rule, intro, constraints bullet, §7, §12);
  FINDING-14 (§2.3 `fail_set.sql`); FINDING-18 (§4); FINDING-20 (§3);
  FINDING-21; FINDING-25 (§12 "system design v3"); FINDING-31 (§7).
- **classification-api (v3)**: FINDING-9, FINDING-14, FINDING-18, FINDING-19,
  FINDING-22 (its §5 is right), FINDING-23, FINDING-25. Unchanged.
- **classification-reader (v3)**: FINDING-9, FINDING-11, FINDING-12,
  FINDING-13, FINDING-18, FINDING-20, FINDING-23, FINDING-25, FINDING-30.
  Unchanged.
- **classification-ui (v3)**: FINDING-9, FINDING-12, FINDING-13, FINDING-14,
  FINDING-26, FINDING-29, FINDING-30, FINDING-32. Unchanged.
- **classification-scheduler (v2)**: FINDING-1, FINDING-18. Unchanged.
- **research-store (v2)**: FINDING-1 (§6), FINDING-18, FINDING-20 (§2.5),
  FINDING-34. Unchanged.
- **universe-service (v2)**: FINDING-11, FINDING-12, FINDING-25, FINDING-33.
  Unchanged.
- **SR-7, all components**: no new edge; the scheduler drives the engine, the
  engine and the reader read the stores, the API calls the service and the
  reader; `universe-service` and `classification-reader` still reference each
  other (FINDING-11).

### UX Brief

- **SR-8**: unchanged since v3. FINDING-9, FINDING-10, FINDING-14, FINDING-15,
  FINDING-28.

### UX Design Specification

- **SR-8**: unchanged since v3. FINDING-9, FINDING-12, FINDING-14, FINDING-26
  (§0), FINDING-27, FINDING-28, FINDING-29, FINDING-33 (Name sortable).

### Cross-Specification Consistency (SR-3)

- CROSS-SPEC-INCONSISTENCY: factor-engine §2.4 windows against owner decision
  DEC-0221, which the code follows (`statements.sql` header and lines 34–51)
  (FINDING-2).
- CROSS-SPEC-INCONSISTENCY: factor-engine §2.4 input table, *Statements* rule
  and intro against its own `LINE_ITEMS`, "The eight inputs" and §14, and
  against system design constraint 8 (FINDING-6).
- CROSS-SPEC-INCONSISTENCY: system design v4 and factor-engine v3 against
  DEC-0055 (6) and DEC-0122 (FINDING-7), and against epic CAP-002-E2 and story
  CAP-002-E2-S3 (FINDING-8).
- Carried: FINDING-1, FINDING-9, FINDING-10, FINDING-14, FINDING-15,
  FINDING-16, FINDING-20 (now LOW), FINDING-22.

### Screen Specification Acceptance Checks (S03)

S03 v4, the UX artifacts and the reads behind them are unchanged since v3.

| Check | Verdict | Evidence |
|-------|---------|----------|
| S03-1 incomplete stocks listed unless hidden | PASS | As v3 (DEC-0081, now owner-upheld) |
| S03-2 match count over the full set | PASS, with FINDING-12 | As v3 |
| S03-3 inputs' as-of in the inspector | PASS | As v3; with two statement types behind a value input, *as of* follows DEC-0116 (3) in code, not the design (FINDING-6) |
| S03-4 no percentile below 30 qualifying stocks | PASS | As v3 |
| S03-5 filters, sort and scope survive reload and back | PASS | As v3 |
| S03-6 restatement mark in results and inspector | PASS | As v3; DEC-0075 is now owner-upheld, so the form is no longer provisional |
| S03-7 save every matching stock, membership kept | PASS, with FINDING-28 | As v3 |

---

## Disposition of Review v3 Findings

| v3 finding | v3 severity | Status at v4 | Evidence | v4 finding |
|------------|-------------|--------------|----------|------------|
| F-1 first-deployment backlog | HIGH | Carried | Scheduler and research-store revisions unchanged; factor-engine §6 and system design §3.1 untouched by `56a8162`; no later record decides it (epic E2 still lists it as open) | FINDING-1, HIGH |
| F-2 line-item mapping | HIGH | Changed in form, reduced | Keys and signs fixed against the provider schema (verified above); quarter coverage, Q4 included, and sign uniformity unconfirmed (system design §6 assumption 1) | FINDING-3, MEDIUM; new FINDING-4, FINDING-5 |
| F-3 review pins break the gate | MEDIUM | Closed (harness) | `artifact-gate.py` 305–319 skips pinned review reports; `require` passes on unchanged designs that pin review v2 | Residual malformed id in FINDING-35 |
| F-4 download start time on two surfaces | MEDIUM | Carried | api, reader, ui, UX unchanged; system design `/history` row untouched | FINDING-9 |
| F-5 UX brief read shape | MEDIUM | Carried | Brief unchanged | FINDING-10 |
| F-6 package cycle | MEDIUM | Carried | universe-service, reader unchanged; no record accepts the cycle | FINDING-11 |
| F-7 members with no row in the set | MEDIUM | Carried | Unchanged | FINDING-12 |
| F-8 not-current definition, poll stop | MEDIUM | Carried | Unchanged | FINDING-13 |
| F-9 exception text to the owner | MEDIUM | Carried | Unchanged; DEC-0066 (1), which writes the exception class and message, is owner-upheld, so the remaining defect is the UX artifacts' claim and STD-UI-1 | FINDING-14 |
| F-10 AGT-SCOPE-002 reading | MEDIUM | Closed (owner) | DEC-0069 and DEC-0084 upheld 2026-10-17T21:21:34Z | Residual in FINDING-26 |
| F-11 capability §5.4 against the brief | MEDIUM | Carried | Capability unchanged; `check-artifacts.py` still warns STD-UI v4 | FINDING-15 |
| F-12 system design drift | MEDIUM | Carried | v4 touched none of the listed sections | FINDING-16 |
| F-13 append-only guard coverage | MEDIUM | Reduced | Delivered `tests/unit/test_research_sql_is_append_only.py:56` scans every `.sql` and `.py` under `src/factorflow/`, and `test_engine_sql_safety.py:120` the engine package, so the coverage hole is closed in code; research-store §2.5, reader §3 and system design §4.4 still describe it differently | FINDING-20, LOW |
| F-14 C4 not addressed | MEDIUM | Carried | No occurrence of C4 in system design v4; tech-stack v7 C4 unchanged | FINDING-17 |
| F-15 DEC-0058 `artifacts` | MEDIUM | Carried | DEC-0058 `artifacts` still lists only the system design | FINDING-18 |
| F-16 build timeout equals the budget | MEDIUM | Closed (owner) | DEC-0067 upheld 2026-10-17T21:21:34Z | none |
| F-17 capability arithmetic | MEDIUM | Reduced | DEC-0053 and DEC-0055 upheld; capability §2 and AC-12 not amended | FINDING-21, LOW |
| F-18 universe name length | MEDIUM | Carried | System design v4 §8 question 2 still `[REQUIRES INPUT]`; delivered `classification_bounds.py:15` holds `None` | FINDING-19 |
| F-19 OQ-TS-3 | MEDIUM | Closed (tech stack) | tech-stack v7 OQ-TS-3 "Answered for classification 2026-10-27: no numeric library", approved | Residual in FINDING-35 |
| F-20 both reads polled | LOW | Carried | System design §3.3 step 14 untouched | FINDING-22 |
| F-21 "the first set" | LOW | Carried | Unchanged | FINDING-23 |
| F-22 DEC-0085 not cited | LOW | Carried | v4 adds no citation | FINDING-24 |
| F-23 stale reference labels | LOW | Carried, widened | Unchanged, plus factor-engine v3 §12 "CAP-002 system design v3" | FINDING-25 |
| F-24 edit list at assertion level | LOW | Carried, widened | Unchanged, and DEC-0088 (owner) adds `pyproject.toml` as a tenth file that §8 question 4 does not list | FINDING-26 |
| F-25 UX design timestamp | LOW | Carried | Unchanged | FINDING-27 |
| F-26 S09's incomplete count | LOW | Closed (consumer) | CAP-003's system design consumes the summary "as published, not redefined" (`never_classified`, `set`, `later`, `stocks_current`) and builds its *Factor scores* card from it (CAP-003 system design lines 113, 633, 766), so no CAP-002 change is needed | none |
| F-27 save under a universe scope | LOW | Carried | Unchanged | FINDING-28 |
| F-28 origin through the events read | LOW | Carried | Unchanged | FINDING-29 |
| F-29 proposed §5.1 row | LOW | Closed (as recommended) | CAP-003 declares the edge; CAP-002 §5.1 has no row | Residual in FINDING-36 |
| F-30 two long narratives | LOW | Carried | Unchanged | FINDING-30 |
| F-31 `hypothesis` citation | LOW | Carried | tech-stack v7 still omits `hypothesis`; factor-engine v3 §7 still says "already in the tech stack" | FINDING-31 |
| F-32 unused `GET /api/instruments` | LOW | Carried | Unchanged | FINDING-32 |
| F-33 universe name sort | LOW | Carried | Unchanged | FINDING-33 |
| F-34 rollback citation | LOW | Carried | Unchanged | FINDING-34 |

Summary: closed 6 (F-3, F-10, F-16, F-19, F-26, F-29); reduced 3 (F-2 to
MEDIUM, F-13 and F-17 to LOW); carried 25. New: 8 (FINDING-2, FINDING-4 to
FINDING-8, FINDING-35, FINDING-36).

---

## Findings Summary Table

CRITICAL 0 · HIGH 2 · MEDIUM 17 · LOW 17 · **total 36**

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-7, SR-3 | classification-scheduler; research-store; factor-engine; system design | scheduler §2.4 (`qualifying_run.sql`), §5 "Backlog", §6; research-store §6 "Data migration"; factor-engine §6 "Behaviour change after upgrade"; system design §3.1 steps 5, 19 to 21 | Carried from v3 FINDING-1: every CAP-001 run that ended `succeeded` or `partial` before deployment qualifies and is claimed oldest first, one set per run, each dated the day it is built; research-store and factor-engine say the first set follows the first qualifying run after deployment | First deployment appends one permanent, misattributed set per historical run to C5 history (AC-21), and a run ending during the backlog waits behind it (AC-11). The owner's answer makes these sets classify value and growth too, so each carries computed scores | Decide which runs qualify at first deployment and whenever several wait (for example only the latest qualifying run without a set); align scheduler, research-store, factor-engine §6 and system design §3.1; record the choice |
| FINDING-2 | HIGH | SR-3, SR-5 | factor-engine; DEC-0221; DEC-0242 | factor-engine v3 §2.4 *Statements* (line 326: P4 "later than P1 minus 12 months"; prior-year window "the four most recent on or before P1 minus 12 months under the same span rule"); DEC-0221 (`decided_by: owner`, 2026-10-28; `artifacts` names this design: "This replaces section 2.4's 12-month span rule ... Section 2.4's prose is amended at the design's next revision"); delivered `statements.sql` header and lines 34–51 (DEC-0221). Secondary: §2.4 line 397 (`known_on` for every input) against DEC-0242 (owner: a `missing` input has `known_on` null); momentum table "never (prices are positive by acquisition)" against DEC-0241 (agent, open: `price_not_positive`) | Factor-engine v3 is the next revision DEC-0221 names, and it still states the window rule the owner replaced: the 12-month span rule, which skips the year-ago quarter of 52-week filers and lets one missing quarter through, instead of P1 to P8 with consecutive quarter ends at most 4 months apart. It also omits DEC-0242's `known_on` carve-out | Re-approving v3 approves a rule the owner found produces present but wrong growth values, and the code no longer matches the approved design. The follow-up for the shares move edits these statement-window inputs and would be planned from this section | Before re-approval, amend §2.4 *Statements* to DEC-0221's rule (P1 to P4 trailing, P5 to P8 prior, adjacent period ends at most 4 months apart, trailing-only inputs need P1 to P4, growth needs P1 to P8), cite DEC-0221 and DEC-0242, state `known_on` null for a `missing` input, and either adopt DEC-0241's `price_not_positive` cause or leave it with the owner. Add DEC-0221 and DEC-0242 to §12 |
| FINDING-3 | MEDIUM | SR-7, SR-1 | system design; factor-engine | system design v4 §6 assumption 1 (Version 4 paragraph, lines 767–773), §8 question 1; factor-engine v3 §14 question 1, §6.1 assumption bullet, version 3 paragraph ("Review v2's FINDING-2 ... is closed"); DEC-0221 (consecutive quarters); `statements.sql` (`fiscal_period <> 'FY'`) | Changed in form from v3 FINDING-2. The keys and signs are fixed and verified. What remains open is quarter coverage, Q4 included. With annual rows excluded and DEC-0221's 4-month adjacency, a stock whose fourth quarter exists only as an annual statement never forms a trailing window. The providers' references list `fiscal_quarter` 1 to 4 for quarterly records but do not say whether Q4 is filed or derived. The confirmation is assigned to "the first real run" with no defined check | If Q4 quarterly records are absent, `earnings_yield`, `fcf_yield` and both growth inputs are `missing` for every stock, so value and growth never classify (fails safe, AC-12). The factor-engine's "closed" overstates | Define the confirmation: the query or check run after the first Financials run (quarterly records with `fiscal_quarter = 4` per instrument; positive `purchase_of_property_plant_and_equipment` count), who runs it, and the fallback if Q4 is absent (for example Q4 = FY − Q1 − Q2 − Q3, a DEC-0055 (1) revision). Reword the factor-engine's "is closed" to "keys answered; coverage open" |
| FINDING-4 | MEDIUM | SR-2, SR-7 | system design; factor-engine | system design v4 §8 question 1 (capital expenditure sign −1); §6 assumption 1 Version 4 ("until then a missing quarter still leaves an input `missing`, never wrong"); factor-engine §2.4 `LINE_ITEMS` (`capital_expenditure`, −1) and §6.1 assumption bullet ("Where they do not, inputs are `missing`, never wrong"); Massive cash-flow reference ("typically reported as negative values") | The sign is a constant −1 on a field the provider describes as *typically* negative. A record reporting a purchase as a positive amount gives `capital_expenditure` = −X and FCF = OCF + X: present, overstated and unmarked. The design's "never wrong" covers missing quarters only, yet the factor-engine's assumption bullet applies it to every deviation | A wrong `fcf_yield` enters an append-only set and the value composite of that stock and of its peers' standardisation, with nothing on the screen to show it | Specify a sign-robust rule and record it: either capital expenditure is the magnitude (FCF = OCF − \|purchase_of_property_plant_and_equipment\|; purchases and sales are separate fields), or a positive value makes `fcf_yield` `missing` with a named cause. Add the case to §7 and correct both "never wrong" statements |
| FINDING-5 | MEDIUM | SR-2 | system design; factor-engine | system design v4 §8 question 1 ("Book equity and net income are the amounts attributable to common shareholders, so that they match a market capitalisation of common shares"); factor-engine `LINE_ITEMS["book_equity"]`; `FinancialBalanceSheet.total_equity_attributable_to_parent` and `.preferred_stock` (lines 566, 555); Massive balance-sheet reference ("attributable to the parent company, excluding noncontrolling interests") | The chosen key is equity attributable to the parent: it excludes noncontrolling interests but includes preferred stock, which the provider reports as a separate component of equity (`preferred_stock`). The design's stated reason is true of net income (the provider defines it after preferred dividends) but not of book equity | For issuers with preferred equity (banks, insurers, REITs, utilities) `book_to_price` is overstated against a common-shares market capitalisation, contrary to the design's own intent, and the values are recorded permanently | Owner: either keep the key and correct the sentence (parent equity, including preferred), or define book equity as `total_equity_attributable_to_parent − preferred_stock` (absent preferred read as zero, or as `missing`, stated) and add it to `LINE_ITEMS` |
| FINDING-6 | MEDIUM | SR-3, SR-4, SR-1 | factor-engine | v3 line 55 ("One owner question blocks part of this component and is carried, not answered"); §2.4 *Statements* line 332 ("Balance-sheet items use the single most recent quarterly statement", nothing on the income statement row); input table lines 384–386 (`book_to_price` "balance sheet, most recent"; `fcf_yield` "cash flow, TTM"); line 396 ("`as_of` is P1", with two statement types now behind each value input); constraints bullet line 574 ("most recent balance sheet"); §7 line 703 (Market capitalisation row unchanged); `tests/component/factor-engine-tests.md`; §12 line 797 ("system design v3") | The revision updated `LINE_ITEMS`, "The eight inputs" and §14, but not the parts an implementer reads to build the query. They still say every value input reads its own statement type only, and none says that `book_to_price` and `fcf_yield` also need the most recent quarterly income statement. "P1" is ambiguous once two statement types feed one input; the code resolves it by DEC-0116 (3), the earliest of the latest period ends, which the design does not cite. No test covers "read from that one statement and never summed" or the capex sign | The obvious implementation from the table (add the key, change the statement type) sums four quarters of shares for `earnings_yield` and leaves shares absent for the other two value inputs (`value_inputs.sql` lines 38, 53, 58); nothing in the test plan would catch it | Update the intro, the *Statements* rule, the table's Statements column (each value input also reads the most recent quarterly income statement for MC), the constraints bullet and §12; state `as_of` for two statement types (cite DEC-0116 (3)); add §7 and test-specification cases for shares from the income statement P1 for all three value inputs, never multiplied by four, and for FCF = OCF − \|capex\| |
| FINDING-7 | MEDIUM | SR-5, SR-9 | system design; factor-engine; DEC-0055; DEC-0122 | DEC-0055 decision (6) ("shares outstanding from the most recent quarterly balance sheet"; `owner_verdict: upheld`, `status: applied`); DEC-0122 ("including the newest balance sheet supplying shares_outstanding"); system design v4 constraint 8 and factor-engine v3 §2.4 ("revises DEC-0055 (6)"); commit `56a8162` (no `Decision-Id` trailer) | Both designs revise an upheld decision record in prose, but no record carries the revision: DEC-0055 (6) still states the balance-sheet rule, and DEC-0122, which defines the restatement mark over "exactly the statement rows listed", still names the balance sheet as the shares source | `sdd decisions` readers, blind review and `revert` see the superseded rule as current. The restatement mark's rows are defined against the wrong statement | Record the owner's 2026-11-06 answer as an owner decision that supersedes DEC-0055 (6) and amends DEC-0122's wording. The record should name both designs in `artifacts`, and the follow-up commit should carry its `Decision-Id` |
| FINDING-8 | MEDIUM | SR-3, SR-5 | epic CAP-002-E2; story CAP-002-E2-S3 (downstream, not subjects) | `CAP-002-E2.md` v2 (approved) Open Questions first item (`[REQUIRES INPUT ...]`, "Blocks: the values in `line_items.py` and the stories implementing value and growth inputs"), Out of Scope and Dependencies (payload keys the owner's open question), DAC-E2-1 ("most-recent balance sheet"); `CAP-002-E2-S3.md` Description ("Verification against a real acquisition run waits on the owner's payload-key answer"), status `docs-sync` | The approved backlog still says the keys are unanswered and that value and growth are blocked, and no story or change record carries the work the answer requires. That work: setting `line_items.py`, reading shares from the income statement in `value_inputs.sql`, and lifting the strict xfail | The code change has no planned vehicle; implementing it under S3 would reopen a story in `docs-sync`; the epic misleads backlog and test design | Refine E2 (close the open question, add the income-statement source to DAC-E2-1) and pass it through `$backlog-review`; add a story under E2, or an expedited change if `scripts/classify-lane.py` allows, for the follow-up below |
| FINDING-9 | MEDIUM | SR-3, SR-1 | UX design; UX brief; classification-ui; classification-api; classification-reader; system design | As v3 FINDING-4 (UX design §1.1, §1.6; brief §2.6; system design §4.2 `/history`; api `StockHistoryResponse`; reader `HistoryRow`, `stock_history.sql`; `MostRecentRun`) | Carried: two surfaces name a download by its start time, but no read carries it | AC-18, AC-21 and the AC-22 empty state cannot render as specified | As v3: add `run_started_at` to the history read and name the read behind the never-populated latest-download line |
| FINDING-10 | MEDIUM | SR-3, SR-8 | UX brief; DEC-0082 | As v3 FINDING-5 (brief §2.1, §2.2, §3, §12.4) | Carried: the brief still describes the read shape DEC-0082 replaced and omits the first set's failure before any set | Two approved UX artifacts disagree on AC-20 before the first set | As v3 |
| FINDING-11 | MEDIUM | SR-7 | universe-service; classification-reader; DEC-0085 | As v3 FINDING-6 | Carried: `factorflow.universes` and `factorflow.classification` import each other (SA-CLASS-002) | Package cycle detection flags either package | As v3: move the shared filter type and predicate, or the membership replay SQL, to a neutral module, or record the owner's acceptance |
| FINDING-12 | MEDIUM | SR-3, SR-1 | classification-reader; classification-api; universe-service; UX design; classification-ui | As v3 FINDING-7 | Carried: members with no row in the current set, the as-of view and *Member since* | *{n} of {m} members match* disagrees with its rows | As v3 |
| FINDING-13 | MEDIUM | SR-3, SR-2 | system design; classification-reader; classification-ui | As v3 FINDING-8 | Carried: not-current derived only from a later set row; the poll stop rule disagrees with its diagram | AC-20's mark missing in the claim gap; a stuck scheduler invisible | As v3 |
| FINDING-14 | MEDIUM | SR-8, SR-3, SR-9 | factor-engine; system design; UX design; UX brief; classification-ui | As v3 FINDING-9; DEC-0066 (1) upheld | Carried: `failure_reason` is the exception class and message, rendered verbatim, while both UX artifacts say no exception reaches the owner. The owner upheld the write side; the render side and the UX claims remain | STD-UI-1 v6 and the EDG claims break on the one critical-tier state | Map exception classes to fixed product sentences at render, or keep the detail in the log and write a product-vocabulary reason; correct the UX claims either way |
| FINDING-15 | MEDIUM | SR-9, SR-3 | capability; UX brief | As v3 FINDING-11 | Carried: capability §5.4 disagrees with brief §12.1 on STD-UI-1, STD-UI-7, STD-UI-12 and pins STD-UI v4 | The checked mirror misstates conformance against the standard in force | Owner: revise capability §5.4 and its pin to v6 |
| FINDING-16 | MEDIUM | SR-3 | system design | As v3 FINDING-12 | Carried: DEC-0067's reclaim and timeout, the `name` prefix, `origin`, `min_peer_set_size`, `unknown_symbols`, three error codes, the completion UPDATE and `name` on stock rows remain component-level only | The design epic and test design read first understates the contract | As v3 |
| FINDING-17 | MEDIUM | SR-9 | system design; capability | As v3 FINDING-14 | Carried: no statement of how classification honours C4 (tech-stack v7 C4 unchanged) | The capability's "Satisfied when" cannot be confirmed | As v3 |
| FINDING-18 | MEDIUM | SR-9 | DEC-0058; five component designs | As v3 FINDING-15 | Carried: DEC-0058 `artifacts` still names only the system design; five component designs cite the SEC-ENC-001 exception | Consumer discovery misses five designs | As v3 |
| FINDING-19 | MEDIUM | SR-9, SR-1 | system design; classification-api; UX brief; UX design; classification-ui | system design v4 §8 question 2; api §2.4; delivered `src/factorflow/api/classification_bounds.py:15` (`None`) | Carried from v3 FINDING-18: no artifact bounds the universe name | SEC-INP-001 (High) unmet on create and rename | Owner: state the bound |
| FINDING-20 | LOW | SR-3 | research-store; classification-reader; system design | As v3 FINDING-13 | Reduced: delivered guards now scan every `.sql` under `src/factorflow/` (`test_research_sql_is_append_only.py:56`), but research-store §2.5, reader §3 and system design §4.4 still describe three different scopes | A reader of the design misjudges the enforcement | Align the three descriptions with the delivered guard |
| FINDING-21 | LOW | SR-6, SR-4 | capability | As v3 FINDING-17 | Reduced: DEC-0053 and DEC-0055 (2) are owner-upheld, but capability §2 and AC-12 still do not define the standardised score, non-positive bases or `not_computable` | The definitions live in records, not in the capability | At the next capability revision, fold the upheld definitions into §2 and AC-12 |
| FINDING-22 | LOW | SR-3 | system design; DEC-0082 | As v3 FINDING-20 | Carried | As v3 | As v3 |
| FINDING-23 | LOW | SR-6, SR-3 | system design; api; reader; ui; DEC-0082 | As v3 FINDING-21 | Carried | As v3 | As v3 |
| FINDING-24 | LOW | SR-5 | system design; DEC-0085 | As v3 FINDING-22 | Carried: v4 still does not cite DEC-0085 | As v3 | As v3 |
| FINDING-25 | LOW | SR-5 | classification-reader; classification-api; universe-service; factor-engine | As v3 FINDING-23, plus factor-engine v3 §12 line 797 ("CAP-002 system design v3") | Carried and widened | A reader follows a stale version label | Update the labels |
| FINDING-26 | LOW | SR-9, SR-3 | system design; classification-ui; UX design; DEC-0084; DEC-0088 | As v3 FINDING-24; system design v4 §8 question 4; DEC-0088 (`decided_by: owner`, upheld, names the system design: "DEC-0084's nine-file list is extended by this tenth file", `pyproject.toml`) | Carried and widened: the list is understated at assertion level, and the system design has not applied DEC-0088 | The edit list the owner confirmed is not the one the design shows | Add the two label assertions and `pyproject.toml` to §8 question 4; cite DEC-0088 |
| FINDING-27 | LOW | SR-5 | UX design | As v3 FINDING-25 | Carried | As v3 | As v3 |
| FINDING-28 | LOW | SR-8, SR-3 | UX design; UX brief; classification-ui | As v3 FINDING-27 | Carried | As v3 | As v3 |
| FINDING-29 | LOW | SR-3 | classification-ui; UX design; DEC-0065 | As v3 FINDING-28 | Carried | As v3 | As v3 |
| FINDING-30 | LOW | SR-1 | classification-reader; classification-ui | As v3 FINDING-30 | Carried | Cosmetic | As v3 |
| FINDING-31 | LOW | SR-5, SR-9 | system design; factor-engine | As v3 FINDING-31; tech-stack v7 Key Libraries (no `hypothesis`) | Carried | As v3 | As v3 |
| FINDING-32 | LOW | SR-3 | system design; classification-ui | As v3 FINDING-32 | Carried | As v3 | As v3 |
| FINDING-33 | LOW | SR-8, SR-3 | UX design; classification-api; universe-service | As v3 FINDING-33 | Carried | As v3 | As v3 |
| FINDING-34 | LOW | SR-5 | research-store | As v3 FINDING-34 | Carried | As v3 | As v3 |
| FINDING-35 | LOW | SR-5 | system design | v4 `ai_provenance.source_artifacts` (`CAP-002-specifications-review-report` v2, an id no artifact has; `tech-stack` "5, approved 2026-10-13", current v7); §8 question 3 (still asks for OQ-TS-3 to be closed, closed in tech-stack v7 on 2026-10-27); §9 (no row for the SDK models file or Massive's cash-flow reference that §8 question 1 now rests on); §10 line 1066 (lists "the mapping from the seven factor inputs to the provider's statement payload keys" as genuinely missing); version 4 paragraph ("Nothing else changes") | The revision changed what these sections describe without updating them | The design read first by later phases reports an open question that is closed, a missing input that is supplied, and a source table without the answer's sources | At this revision: fix the review id, update the tech-stack pin and §8 question 3, add the two sources to §9, revise §10 |
| FINDING-36 | LOW | SR-10 | system design | §4.2 `GET /api/classifications/summary` consumer (line 516) and §4.1 note (line 502): `shell-home-and-data-health-ui (unpublished)`; §8 question 10 (b); CAP-003 system design (`owner-shell` consumes the summary, line 633); `docs/architecture.md` lines 83 and 113 | CAP-003 has now published the consuming component (`owner-shell`), so the placeholder names a component no design declares, and the inventory lists the interface twice with different consumers | The architecture inventory carries an undeclared component name | Replace the placeholder with `owner-shell`, close §8 question 10 (b), and regenerate `docs/architecture.md` |

---

## Traceability Matrix

Per-AC verdict (VER-EVD-004). Mappings are unchanged since v3 except where
noted.

| AC | System design | Component design(s) | UX design | Verdict |
|----|---------------|---------------------|-----------|---------|
| AC-1 | 3.2 steps 4, 4a; 5.13 | universe-service 2.4; api 2.5 | 1.3; 1.1, 1.4 | Mapped |
| AC-2 | 3.2 step 3a; 3.3 step 15; 4.2; 4.4 | universe-service `create_from_filter`; reader `evaluate_filter`; api 2.4 | 1.1, 1.3, 1.4 | Mapped with defect (FINDING-28) |
| AC-3 | 4.2; 4.4 | research-store; universe-service | 1.3; 1.1 | Mapped |
| AC-4 | 3.2 steps 8, 11, 12 | universe-service 2.4 | 1.4 | Mapped |
| AC-5 | 3.2 step 7; 5.13 | universe-service 2.4 | 1.3, 1.4; 1.1 | Mapped |
| AC-6 | 4.4; 5.3 | research-store; universe-service 2.5 | 1.4 | Mapped with defect (FINDING-12) |
| AC-7 | 5.7; 5.8 (v4: MC from the income statement) | factor-engine 2.4, 2.5 | 1.5, 1.6 | Mapped with defects (FINDING-2 windows, FINDING-5 book equity, FINDING-6 table); value and growth demonstrable in production once the code follows and Q4 is confirmed (FINDING-3) |
| AC-8 | 5.5 | factor-engine 2.5; reader 2.5 | 1.1 | Mapped |
| AC-9 | 3.3 step 15; 5.7 | factor-engine 2.5; research-store | 1.1 | Mapped; method owner-upheld (FINDING-21) |
| AC-10 | 3.1 steps 4 to 7a, 19 to 21; 5.10 | classification-scheduler 2.4 | 1.2 | Mapped with defect (FINDING-1) |
| AC-11 | 3.1 steps 28 to 31 | factor-engine 5, 7; scheduler 2.3 | 1.1; 1.2 | Mapped with defect (FINDING-1); v3 FINDING-16 closed |
| AC-12 | 3.1 step 12; 3.3 step 15; 5.6 | factor-engine 2.5; reader 2.5 | 1.1, 1.5, 1.6 | Mapped with defect (FINDING-12) |
| AC-13 | 3.3 step 18; 5.6; 5.8 | factor-engine 2.4; reader 2.4 | 1.6; 1.2 | Mapped; *as of* with two statement types per FINDING-6 |
| AC-14 | 3.1 steps 9, 11a | factor-engine 2.3 step 6, 2.5 | 1.1 | Mapped |
| AC-15 | 3.2 step 10; 3.3 step 15; 5.5 | factor-engine 2.5; reader 2.5 | 1.1, 1.4, 1.5, 1.6 | Mapped |
| AC-16 | 3.3 steps 15, 16 | reader 2.5; api 2.4 | 1.1, 1.4, 1.5 | Mapped with defect (FINDING-12) |
| AC-17 | 3.3 step 17 | factor-engine 2.4 `detail`; reader 2.6 | 1.1; 1.6 | Mapped (FINDING-2 secondary: `known_on` for `missing`) |
| AC-18 | 4.2 `/history`; 4.4 | reader 2.6; api | 1.6 | Mapped with defect (FINDING-9) |
| AC-19 | 3.1 steps 22 to 24; 5.4 | factor-engine 3; scheduler | 1.6 | Mapped |
| AC-20 | 3.1 steps 13, 14b, 25 to 27; 3.3 steps 13, 14, 18; 5.11 | reader 2.4; api; ui 2.6 | 1.2; 1.1, 1.6 | Mapped with defects (FINDING-10, FINDING-13, FINDING-14, FINDING-22, FINDING-23) |
| AC-21 | 3.3 steps 13, 18; 4.2; 8 question 11 | reader 2.4; api; ui 2.6 | 1.2 | Mapped with defects (FINDING-1, FINDING-9) |
| AC-22 | 3.3 step 14 | reader 2.4; api 2.7 | 1.1, 1.5, 1.6 | Mapped (FINDING-9, FINDING-10) |
| AC-23 | 5.9 | factor-engine 2.4, 2.5; research-store | every scored surface | Mapped; the mark's rows must include the income statement supplying shares (FINDING-7) |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No finding is CRITICAL: no AC contradicts another, no core requirement is
untestable, and the owner's answer is correct against the provider's schema.
Two findings are HIGH. FINDING-1 is carried unchanged since review v1.
FINDING-2 is new and in the revised factor-engine: it re-states a statement
window rule the owner replaced. This review recommends fixing FINDING-2 before
the owner re-approves factor-engine v3, because DEC-0221 itself names this
revision as the place the fix belongs.

Of the six new MEDIUM findings, three are best resolved in the same pass as
FINDING-2, before re-approval, because they are text in the two revised
designs: FINDING-4 (the sign rule), FINDING-5 (book equity, the owner's call)
and FINDING-6 (the rest of §2.4 and §7). FINDING-7 (the decision records) and
FINDING-8 (the backlog vehicle) belong to the owner and to
`$backlog-review` respectively, and should land before the code follow-up is
planned.

Re-approval mechanics, for the owner: the system design v4 and factor-engine v3
are `draft` and keep their v3-era `approval` blocks, so re-approval is a direct
edit of each block per `docs/approval-gates.md`, with `approved_at` after this
report's `generated` time and `review_artifact` pointing here. This report binds
the other nine subjects at their unchanged id, version and revision, so their
approvals are not disturbed. Their pins to `CAP-002-system-design` v3 clear in
the gate once v4 is approved. This review approves nothing.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-2: amend factor-engine §2.4 to DEC-0221's windows (and DEC-0242's
   `known_on`) before re-approving v3.
2. FINDING-1: decide which runs qualify at first deployment; align the four
   designs.

### Should Fix (MEDIUM findings)

3. FINDING-3: define the first-run coverage check and the Q4 fallback.
4. FINDING-4: make the capital-expenditure sign robust or make a positive value `missing`.
5. FINDING-5: correct the book-equity rationale or subtract `preferred_stock`.
6. FINDING-6: bring factor-engine §2.4's table, *Statements* rule, intro, constraint, §7 and §12 in line with the move; add the tests.
7. FINDING-7: record the owner's answer as a decision superseding DEC-0055 (6); amend DEC-0122.
8. FINDING-8: refine epic E2 and add a backlog item for the code follow-up.
9. FINDING-9 to FINDING-19: as carried from v3.

### Nice to Have (LOW findings)

10. FINDING-20 to FINDING-36, as listed; FINDING-35 and FINDING-36 can be
    done in the same edit as FINDING-2.

---

## Follow-up Work (implementation drift, not findings)

The code deliberately still follows system design v3 and factor-engine v2. Once
the owner re-approves, the following must change. FINDING-8 asks for a planned
vehicle for this work.

1. `src/factorflow/classification/line_items.py` lines 1–5 (docstring says the
   keys are open) and 26–36: the seven keys; `shares_outstanding` statement
   type `income_statement`; `capital_expenditure` sign −1 (or per FINDING-4).
2. `src/factorflow/classification/sql/value_inputs.sql`: line 38 reads only the
   rank-1 balance sheet and the window rows, so for every value input it must
   also read the rank-1 quarterly income statement. Line 58 sums
   `shares_outstanding` across every row used, which would multiply it by four
   for `earnings_yield` once shares come from the income statement; it must
   take the one rank-1 row. Line 114's comment and `balance_sheet_period_end`
   in `detail` name the balance sheet. The restatement mark (DEC-0122) must
   include the income statement row.
3. `tests/unit/test_line_items_resolved.py:9`: the strict `xfail` turns into a
   failure (XPASS) once the keys are set; remove the marker.
4. `tests/integration/test_engine_inputs_fundamentals.py` and the test
   specifications (`tests/component/factor-engine-tests.md`,
   `tests/coverage-matrix.md`): cases for shares from the income statement P1
   for all three value inputs, not summed, and for the capex sign (FINDING-6).

---

## Observations Outside the Review Subjects

- **CAP-001 timeframe constraint.** `FinancialStatement.timeframe` is
  `Literal["annual", "quarterly"]` (`src/factorflow/ingestion/massive/models.py:258`),
  and `fetch_financials` passes no `timeframe` filter (`client.py` 257–271).
  Massive's income-statement and cash-flow references list a third value,
  `trailing_twelve_months`. If those endpoints return TTM records unfiltered,
  CAP-001 would reject them as a `ProviderContractViolation`, and the first
  real run CAP-002's assumption 1 waits on would surface it there first. This
  is CAP-001's to check; no CAP-002 finding.
- **Gate leniency on a draft upstream.** `artifact-gate.py`'s
  `upstream_approved` (lines 265–285) treats an artifact as approved when its
  `approval.approved_at` is set. The two revised designs are `draft` but keep
  their v3-era approval blocks, so a downstream pin to system design v4 would
  pass `upstream_errors` before re-approval. Only factor-engine v3 pins v4, and
  its own `require` fails on status and stale approval, so nothing is exposed
  now. This is a harness observation.
- `docs/architecture.md` (generated): the `GET /api/classifications` row is
  still truncated at `state: building \`, as v3 observed.
- DEC-0076's text still says the save posts "the thresholds and the scope"
  (v3 observation, unchanged).

## Run Record

This run was invoked by a parent agent as `$specification-review` for CAP-002.
The parent restricted writes to this report and forbade branch changes in the
project repository. No interactive input tool was available to this reviewer,
so the Step 6 question is returned to the parent rather than asked.

One prerequisite did not pass and was decided rather than asked:
`check-prerequisites.sh` exited 2 because the context cache was 31 hours old
against a 24-hour window. Refreshing runs the context feeder, which writes
`cache/` and `logs/` and fetches and updates the repositories under `repos/`.
Both are outside the one write this run is permitted. This review reads every
subject directly from the checkout at `56a8162` and uses no cached summary, so
the stale cache bears on nothing it judges. Decision: proceed, and record it
here, as review v3 did in the same situation. No decision record was written,
because this report is the only permitted write. The parent or owner may record
it and refresh the context before the next step.

No specification, decision record, backlog item, code, tech-stack,
constitution, CAP-001, CAP-003 or `docs/ux/` artifact was edited; no approval
block was touched; no branch, commit, stash or reset was made. The only write is
this report.
