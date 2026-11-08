---
artifact_schema_version: 1
artifact_id: CAP-002-specification-review
artifact_type: specification-review
artifact_version: 6
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
document: spec-review-report
capability: CAP-002
version: v6
generated: 2026-11-07T22:18:34Z
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
    result: "PASSED, exit 0: 3 capabilities, 11 edges (requires-runtime 4, conforms-to 7, blocked-by 0, requires-contract 0), 1 standard, 2 conformance claims, 1 constitution artifact, 4 references; integration layers CAP-001, CAP-002, CAP-003; no error, no warning (unchanged from review v5)"
  - script: build-architecture.py
    outcome: run
    result: "FAILED, exit 1, on drift only: 3 designs, 27 components, 84 interfaces derived with no problem; docs/architecture.md line 89 (Observation read) lacks coverage_segment, which system design v5 section 4.2 added (FINDING-45). Run in check mode; the rendered inventory was diffed from the scratchpad, nothing written to the repository"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 307 warnings, exit 0 (--strict), 629 artifacts; CAP-002 subject warnings unchanged in kind from review v5: capability pins STD-UI v4 (current v6); eight unchanged designs pin CAP-002-system-design v3 (current v5) and CAP-002-specification-review v2; designs pin tech-stack v5 (current v7); backlog.md pins system design v3 and factor-engine v2; docs/changes/EXP-20261107-1.md pins system design v4 and factor-engine v3 (history)"
  - script: check-references.py
    outcome: run
    result: "PASSED, exit 0: 1256 path references across 648 Markdown files, every reference resolves"
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
  SR-8: "applied — design_system_available true (projects/factorflow-v2/design-system.yaml; all four paths present); UX brief, UX design and classification-ui are byte-identical to reviews v3 to v5 (same content revisions) and git log 3e006b5..b8ee5fe touches no file under design-system/, docs/ux/ or docs/constitution/, so v3's mechanical verification of 62 component-variant pairs and 56 tokens stands; the new cause reaches the owner-facing surface only through reason_detail and detail, both checked below"
  SR-9: "applied — check-capabilities.py (no error, no warning); capability sections 5.1 to 5.4 unchanged; the revision's reliance on CAP-001 coverage checked against CAP-001's approved system design, observation-writer, acquisition-runner and market-data-store designs, DEC-0049 and the delivered ingestion code (FINDING-39)"
  SR-10: "applied — build-architecture.py ran and derived the inventory with no problem; it failed only on docs/architecture.md drift (FINDING-45); the revision adds no component and changes one interface row"
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
    content_revision: sha256:92e24df25e9ee1630a1ce8da841b7f93bf7d448ad587690bcd2e8541fe75258d
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
    content_revision: sha256:285cf2eeccea36f69b1c3c48dcc7a3f490a9a25e925c984a1be42bc6847c7050
  - artifact_id: CAP-002-component-design-research-store
    artifact_version: 2
    content_revision: sha256:8644c9766f72ebb24be991814d61734bba93fcc8c344791cd3c17561a03cb192
  - artifact_id: CAP-002-component-design-universe-service
    artifact_version: 2
    content_revision: sha256:7b18e9f329c2a012cb516584e9127805fc9a15f2b382cf77fa83763bbee6fe03
statistics:
  total_findings: 46
  critical: 0
  high: 2
  medium: 15
  low: 29
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T22:18:34Z
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
    - id: CAP-002-E2
      version: "2 (approved; read for propagation, not a subject)"
    - id: CAP-002-factor-engine-tests
      version: "tests/component/factor-engine-tests.md at 425b648 (read for propagation, not a subject)"
    - id: CAP-001-system-design
      version: "8 (approved; constraint 9, read for the coverage contract, not a subject)"
    - id: CAP-001-component-design-observation-writer
      version: "4 (approved; sections 2.5, 8, 10, read for the coverage contract, not a subject)"
    - id: CAP-001-component-design-acquisition-runner
      version: "approved; section 11 interface table, read for the coverage contract, not a subject"
    - id: CAP-001-component-design-market-data-store
      version: "9 (approved; coverage_segment, read for the coverage contract, not a subject)"
    - id: DEC-0397
      version: "owner, 2026-11-07T21:54:53Z, status open (read in full)"
    - id: DEC-0295
      version: "owner, 2026-11-07T02:39:43Z, status open (read in full)"
    - id: DEC-0049, DEC-0241, DEC-0242, DEC-0243, DEC-0055, DEC-0058, DEC-0082, DEC-0115, DEC-0116, DEC-0122, DEC-0221
      version: "read for the state each finding rests on"
    - id: delivered code
      version: "b8ee5fe: src/factorflow/ingestion runner.py, writer.py, coverage.py, plan.py, massive/client.py, massive/paging.py; db/migrations 0003_coverage.sql, 0006_classifications.sql; classification/sql momentum_inputs.sql, insert_inputs.sql, classify.sql, value_inputs.sql; classification/engine.py, classification/reader.py, api/classification_models.py; web/src/api/classification-types.ts, web/src/screens/research/stocks/factor-card.tsx"
    - id: docs/reference/classification-engine.md
      version: "5250267 (doc-sync of delivered behaviour; read for propagation, not a subject)"
    - id: CAP-002-specification-review
      version: "5 (READY-WITH-WARNINGS; every finding re-checked, not carried on trust)"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Specification Review Report -- CAP-002

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-002 Universe & Factor Classification |
| **Version** | v6 (sixth review; triggered by commit `b8ee5fe`) |
| **Specifications Reviewed** | Capability v1 (approved); system design **v5** (draft, revised); factor-engine **v4** (draft, revised); UX brief v3, UX design v3, classification-api v3, classification-reader v3, classification-ui v3, classification-scheduler v2, research-store v2, universe-service v2 (approved, byte-identical to review v5) |
| **Total Findings** | 46: CRITICAL 0, HIGH 2, MEDIUM 15, LOW 29 |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

Commit `b8ee5fe` revises the two designs to close CAP-002 release blocker B3
and records DEC-0397 (owner, 2026-11-07T21:54:53Z). Momentum outer-joined
`corporate_action`, so a stock whose corporate actions were never acquired was
scored as if it had never split or paid a dividend. Now a momentum input
`return_k` is computed only when one `corporate_actions` coverage segment of
the instrument contains its window `(S_k, E]`. Otherwise it is `missing` with
`detail.cause = "corporate_actions_not_covered"`, the coverage listed,
`known_on` null and `last_acquisition` naming `corporate_actions`. System
design v4 → v5 and factor-engine v3 → v4 are both back to `draft`.

**The rule is sound, and the code CAP-001 runs today supports it.** The
delivered runner writes a `corporate_actions` segment for every successful
fetch, an empty one included, and none for a `failed` or `not_found` fetch.
Segments never overlap, abutting ones merge, and both bounds are inclusive.
Splits and dividends are fetched by the same date field the momentum SQL
windows them on, so a segment containing `[S_k + 1, E]` proves every action in
`(S_k, E]` was fetched. Within CAP-002 nothing else has to change. The reader,
the API and the UI carry `detail` as an opaque object and choose the evidence
wording by reason code and `last_acquisition.outcome` only. They already
receive `corporate_actions` as a data type through DEC-0243. AC-7 and AC-12
are better served than before.

**The contract under the rule is not CAP-001's.** FINDING-39 (HIGH):
CAP-001's approved system design (constraint 9: "a range is reported as
covered only because rows exist for it") and its observation-writer design
("the range written, not the range requested") say the opposite of what the
fix depends on. An empty successful fetch writes no rows, so under those
designs it covers nothing. DEC-0049 (owner, upheld) recorded this exact
runner-versus-design conflict on 2026-10-11 and deferred it to CAP-001's
standard lane, where it is still open. The CAP-002 designs cite the
implementation, not a published contract. If CAP-001 settles the conflict the
way its own designs read, almost every momentum window becomes `missing` and
momentum goes unranked for every stock. Nothing in CAP-002's tests would
show why.

**The revision also misses the amendment the owner scheduled for it.**
FINDING-3 (MEDIUM, carried): DEC-0295 (owner) decided that a JSON-null
`preferred_stock` reads as zero and said the design prose "is amended at the
next revision". This is that revision, and factor-engine §2.4 and system
design §8 question 1 still give the rule the owner rejected. The code
already follows DEC-0295. FINDING-40 (MEDIUM, new): the factor-engine's
Upgrade section still describes a first release. It does not say that, at the
coverage DEC-0397 reports, momentum goes unranked for every stock after the
upgrade, or what happens to sets already recorded under the outer join.
Six LOW findings cover loose ends in the new text, its tests and the places
the revision did not reach (FINDING-41 to FINDING-46).

No finding is CRITICAL, so the verdict is READY-WITH-WARNINGS. Two findings
are HIGH: FINDING-1, carried since review v1, and FINDING-39. **This review
recommends that the owner settle FINDING-39 and fix FINDING-3 before
re-approving the two designs** (see Pipeline Readiness Assessment). This
review approves nothing.

## Review Scope

All eleven artifacts resolved by `get-capability-specifications` are in scope.
The two revised designs were read in full, together with the complete diff of
`b8ee5fe` against `829c9e1` (`origin/main`). Between review v5's base
(`3e006b5`) and `829c9e1` the two designs changed only in `status` and the
`approval` block, the owner's re-approval of 2026-11-07 (`e0b479d`).
`artifact-gate.py revision` confirms that the other nine subjects match the
content revisions review v5 bound, byte for byte. `git log 3e006b5..b8ee5fe`
touches nothing under `design-system/`, `docs/ux/`, `docs/constitution/`,
CAP-001 or CAP-003. Each carried finding was still re-checked against the
current text and records it names.

Read for verification and propagation, none of them a subject and none edited:

- CAP-001: system design v8 (constraint 9, lines 398–400); observation-writer
  v4 (§1, §2.5 lines 199–226, §8 criterion 5 line 390, §10); acquisition-runner
  (§11 line 465); market-data-store v9 (lines 317–333, 521–523); Capability
  AC-7 and AC-12.
- CAP-001 code: `src/factorflow/ingestion/runner.py` (lines 296–340,
  362–395), `writer.py` (lines 72–95, 326–366, 502–652), `coverage.py`
  (lines 12–54), `plan.py` (lines 40–125), `massive/client.py` (lines
  155–255, 287–299), `massive/paging.py` (lines 32–68); migration
  `0003_coverage.sql`.
- CAP-002 code, as the consumers of the new cause: `momentum_inputs.sql`,
  `insert_inputs.sql`, `classify.sql` (lines 107–115), `value_inputs.sql`
  (lines 50–65), `engine.py` (line 115), `reader.py` (line 419),
  `api/classification_models.py` (line 593), migration `0006`
  (`factor_input`), `web/src/api/classification-types.ts` (line 126),
  `web/src/screens/research/stocks/factor-card.tsx` (lines 70–135).
- `docs/reference/classification-engine.md`; epic CAP-002-E2;
  `tests/component/factor-engine-tests.md`; `docs/changes/EXP-20261107-1.md`.
- Decision records, harness `f962287`: DEC-0397 and DEC-0295 in full; DEC-0049,
  DEC-0241, DEC-0242, DEC-0243, DEC-0055, DEC-0058, DEC-0082, DEC-0115,
  DEC-0116, DEC-0122 and DEC-0221 for their state; every record from DEC-0295
  on searched for one naming the two revised designs (only DEC-0295 and
  DEC-0397 do).

Not verified: DEC-0397's production figures (42 momentum-classified stocks,
31 without corporate-action rows, on 2026-11-07). This review has no access to
the production store and takes them from the owner's record.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All template sections present in all eleven; the one diagram edit (factor-engine §2.2, a `coverage_segment` node and edge) sits under its existing narrative; factor-engine §6 against the behaviour change (FINDING-40) |
| SR-2 Correctness | applied | Every claim the revision makes about CAP-001 checked against the code and the CAP-001 designs; the coverage predicate against the momentum SQL's window and the provider's date filters; the precedence rationale against DEC-0241 (FINDING-41); `known_on` against AC-17 (FINDING-43) |
| SR-3 Consistency | applied | DEC-0397 clause by clause against both designs; the new cause and data type through migration `0006`, reader, API, UI, UX brief and UX design; the revision against CAP-001's coverage contract (FINDING-39) and against DEC-0295 (FINDING-3); places the revision did not reach (FINDING-46) |
| SR-4 Testability | applied | ACs unchanged; the new §7 row and §8 criterion 14 against the rule they test (FINDING-42) |
| SR-5 Traceability | applied | System design §7 and factor-engine §13 still map all 23 ACs; AC-7 and AC-12 rows updated; §12 decision list (FINDING-4, FINDING-44); provenance (FINDING-37) |
| SR-6 Clarity | applied | New §2.4 paragraph (FINDING-41); `known_on` basis (FINDING-43); data-type mapping (FINDING-44) |
| SR-7 Feasibility | applied | The predicate costs one index probe per window on `idx_coverage_instrument`, negligible against the AC-11 sizing; coverage and actions are read in one `REPEATABLE READ` snapshot (`engine.py` line 115, DEC-0111); upgrade behaviour (FINDING-40); first-deployment backlog (FINDING-1) |
| SR-8 UX Completeness | applied | As in the frontmatter; S03-1 to S03-7 re-stated below |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` clean; capability §5.1's CAP-001 row cites AC-7 for coverage, which the rule now uses for more than visibility (FINDING-39); C4 (FINDING-14); DEC-0058 (FINDING-15); STD-UI mirror (FINDING-12) |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` derives 27 components and 84 interfaces with no problem; drift in `docs/architecture.md` (FINDING-45); no capability identifier added as an actor; summary-read placeholder carried (FINDING-33) |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, exit 0, PASSED; no error, no warning | none |
| `build-architecture.py -p factorflow-v2` | run, exit 1, FAILED on drift only: 3 designs, 27 components, 84 interfaces; `docs/architecture.md` is out of date (check mode, no `-w`) | FINDING-45 |
| `check-artifacts.py -p factorflow-v2 --strict` | run, exit 0, PASSED with 307 warnings over 629 artifacts | FINDING-12 (STD-UI v4 pin); FINDING-37 (factor-engine pins review v2 and tech-stack v5); FINDING-5 (`backlog.md` pins). The eight `CAP-002-system-design` v3 pins clear once v5 is approved |
| `check-references.py` | run, exit 0, PASSED: 1256 references, 648 files | none |
| `check-constitutions.py` | run, exit 0, PASSED: 10 constitutions, 38 skills | none |

All five ran from the harness worktree
`.claude/worktrees/confident-shtern-083e4b` (`f962287`). The project clone was
on `usr/alvaro-de-jodra/CAP-002-E2-S10` at `b8ee5fe`. The architecture drift
was shown by importing the script's own `collect` and `render` functions,
rendering to the session scratchpad and diffing. The only difference is line
89, the `Observation read` row.

Supplementary evidence gathered in this session:

- `check-prerequisites.sh --project factorflow-v2`: exit 0, every check
  PASSED (context 17 hours old, window 24).
- `pipeline-state.py check --capability CAP-002 --stage specification-review`
  before writing: `AWAITING-APPROVAL` (exit 1). Review v5's `review_subjects`
  do not cover system design v5 at `92e24df2…` or factor-engine v4 at
  `285cf2ee…`. That missing evidence is what this review supplies (Run
  Record).
- `artifact-gate.py revision` for all eleven subjects (`review_subjects`).
- `artifact-gate.py require` (read-only):
  - research-store: passed.
  - System design and factor-engine: each fails three ways, as expected
    before re-approval. The status is `draft`, the approval is stale (it binds
    `5ab3d9c3…` and `40f4719f…`), and review v5 does not cover the current
    revision.

## Constitutions Applied

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | AGT-PROV-001: both designs refreshed their provenance timestamp, but `2026-11-07T16:00:00Z` precedes DEC-0397 by about six hours. It reads as local time labelled UTC, and the review and tech-stack pins are still stale (FINDING-37). AGT-AUTH-002: the coverage rule is an owner decision (DEC-0397), applied, with its trailer on `b8ee5fe`. The null-preferred rule DEC-0295 decided is not applied to the prose (FINDING-3). AGT-EVIDENCE-001: every claim the revision makes about CAP-001 was traced to file and line, and one cites the wrong locus (FINDING-39). AGT-SCOPE-002: no delivered-file edit added |
| CONST-MDL 1.3 | Exact model identifiers in both revised provenance blocks; no product model usage |
| CONST-OPS 1.3 | OPS-MIG-001: no data-model change; `coverage_segment` exists since migration `0003`. OPS-MIG-003: the revision changes observable behaviour of a component already running against a persistent store, and its Upgrade section neither states the change nor the rollback for it (FINDING-40). OPS-ERR-001: the new cause never fails the build; FINDING-11 carried |
| CONST-REV 1.4 | Two-stage report (Stage 1, Stage 2). REV-RCV-001: each claim in the new text was verified against code and CAP-001 designs rather than taken from the commit message or DEC-0397. REV-RCV-002 challenges two statements. Factor-engine §3's "its range is the range requested (`write_instrument_with_outcomes`)" is true of the runner, not the writer, and contrary to CAP-001's designs (FINDING-39). The precedence rationale "both of which judge the window's actions" is partly inaccurate for `price_not_positive` (FINDING-41) |
| CONST-SA 2.0 | SA-MD-002: `docs/architecture.md` drift (FINDING-45); stale section list and step 8a (FINDING-46). SA-CLASS-002: package cycle carried (FINDING-8). SA-MD-003: no new placeholder |
| CONST-SEC 1.3 | SEC-INP-002: the coverage predicate binds no external value; `data_type` is a literal and the window columns are computed. SEC-DAT-001: coverage dates are Internal. SEC-INP-001 (FINDING-16), SEC-ERR-001 (FINDING-11) and SEC-ENC-001 bookkeeping (FINDING-15) carried. No channel, bind or port added |
| CONST-VER 1.2 | All five mechanical checks and the supplementary checks ran in this session; per-AC verdicts in the Traceability Matrix, per-check verdicts for S03, per-claim verdicts for the revision, per-finding disposition of review v5 (VER-EVD-004) |

---

## Stage 1 -- Specification Compliance

The capability is unchanged and approved. The system design still maps all 23
acceptance criteria and S03-1 to S03-7. The revision repairs a fidelity break
against AC-7 and AC-12 that review v5 did not catch. In v3, an absent
corporate-action row counted as "no split or dividend" whether or not the
data had been acquired. It applies the owner's DEC-0397 faithfully, clause by
clause (table below).

It leaves one owner decision unapplied: DEC-0295's null `preferred_stock`
(FINDING-3). It also introduces one dependency the target capability's
approved designs contradict (FINDING-39). The other breaks are those review
v5 carried:

- first-deployment semantics of AC-10 and AC-21 (FINDING-1);
- members with no row in the current set (FINDING-9);
- not-current without a later set row (FINDING-10);
- the save under a universe scope (FINDING-25);
- the capability's STD-UI mirror (FINDING-12).

## Stage 2 -- Artifact Quality

The new paragraph is precise where it matters. It states the predicate as
SQL, the inclusive bounds, the `detail` shape, `known_on`, the data type for
`last_acquisition` and the order among causes. The test row covers the three
behaviours a reader needs. Two qualities fall short. The text attributes the
coverage semantics to the code rather than to a contract (FINDING-39). The
revision was narrower than its own description: it missed the null amendment
it was the vehicle for (FINDING-3), the Upgrade section (FINDING-40), the
control-flow step and depth assumption (FINDING-46), and the generated
inventory (FINDING-45). The rest are LOW: aliases and a rationale
(FINDING-41), boundary and precedence tests (FINDING-42), the `known_on`
basis (FINDING-43) and the data-type mapping (FINDING-44).

---

## Verification of the Revision

### DEC-0397 against the designs

| DEC-0397 clause | Factor-engine v4 | System design v5 | Verdict |
|-----------------|------------------|------------------|---------|
| Present or outdated only when one `corporate_actions` segment contains `(S_k, E]`: `covered_from <= S_k + 1 day`, `covered_to >= E` | §2.4 lines 463–471: `EXISTS … covered_from <= w.s_session + 1 … covered_to >= w.e_session` | Constraint 8 lines 659–665: "contains its whole window" | Applied (aliases: FINDING-41) |
| Otherwise `missing`, `detail.cause = corporate_actions_not_covered`, `detail` with `window_months`, `E`, `S` and the segments (`[]` when none) | §2.4 lines 473–477, segments ordered by `covered_from` | Constraint 8 names the cause | Applied |
| `known_on` null | §2.4 line 477 (DEC-0242) | n/a | Applied |
| `missing_data_type` `corporate_actions`, so `last_acquisition` names that data type | §2.4 lines 477–480 | n/a | Applied (rest of the mapping unstated: FINDING-44) |
| Precedence: boundary, not covered, `price_not_positive`, `corporate_action_payload_unusable` | §2.4 lines 480–485 | n/a | Applied (rationale: FINDING-41) |
| AC-7, AC-12 | §13 rows AC-7, AC-12; §8 criterion 14; §7 row | §5 constraint 8 cites both | Applied |
| `artifacts`: both designs and `momentum_inputs.sql` | Both designs carry the change; the SQL is S10's | | Consistent |
| Trailer | `b8ee5fe` ends `Decision-Id: DEC-0397` in the paragraph with `Co-Authored-By` | | Present |

### The revision's claims about CAP-001

| Claim (factor-engine §2.4 lines 456–463, §3 lines 684–689) | Evidence | Verdict |
|--------------------------------------------------------------|----------|---------|
| A segment is written for every successful corporate-actions fetch, an empty result included | `runner.py` 296–331: the four sub-fetches sit in one `try`; an empty result is `[]` (`client.py` 155–164, DEC-0047). `writer.py` 582–585 writes the segment whenever the type has no error outcome | **True of the code** |
| None for a fetch that ended `failed` or `not_found` | `runner.py` 300–316: `InstrumentNotFound`, `ProviderUnavailable` and `MassiveError` become error outcomes. `writer.py` 513–520: "No coverage segment is written". `paging.py` 53–56 never returns a partial page set | **True** |
| The segment's range is the range requested | `runner.py` 327–330 passes `(depth_start, self._today)` for every data type. The writer writes whatever range it is given, and its own docstring calls these "actual coverage ranges returned by the provider" (`writer.py` 75, 90). The range is the runner's, not `write_instrument_with_outcomes`'s | **True of the runner; the cited locus is wrong; contrary to CAP-001's approved designs and open under DEC-0049 (FINDING-39)** |
| Segments of one instrument and data type never overlap; abutting ones merge | `0003_coverage.sql` `coverage_no_overlap` (EXCLUDE over `daterange(…, '[]')`); `coverage.py` 42–51 merges when `seg_from <= current_to + 1 day`; `writer.py` 326–366 is the only writer of `coverage_segment` (repository search) | **True** |
| Bounds inclusive, so `covered_to >= E` and `covered_from <= S_k + 1` cover `(S_k, E]` | `'[]'` in `0003`; `coverage.py` docstring "Both endpoints are inclusive". Splits are fetched by `execution_date` and dividends by `ex_dividend_date`, and `effective_on` is that same field (`client.py` 167–202, 242–255). The momentum SQL windows actions on `effective_on` in `(S_k, E]` (design §2.4 lines 499–502; delivered `momentum_inputs.sql` line 196) | **True: containment proves every split and dividend in the window was fetched** |
| `data_type = 'corporate_actions'` | `coverage_data_type_known` and `acquisition_state_data_type_known` both list it (`0003`) | **True** |

### Consumers of the new cause and data type

| Consumer | What it does with `detail.cause` and `last_acquisition.data_type` | Handles the new values? |
|----------|------------------------------------------------------------------|-------------------------|
| `research-store` (`0006` `factor_input`) | `detail jsonb NOT NULL`, no constraint on its keys; `factor_input_present_is_dated` binds only `present` rows | Yes |
| `factor-engine` `classify.sql` | `reason_detail` is `{label} missing` whatever the cause (delivered lines 107–115; design §2.5) | Yes: *3-month total return missing* |
| `classification-reader`, `classification-api` | `detail: dict[str, Any]` (`reader.py` 419), `detail: dict[str, Any] \| None` (`classification_models.py` 593); designs pass `detail` through | Yes |
| `classification-ui`, UX design §1.6, UX brief §2.6 | `detail: unknown` (`classification-types.ts` 126). The three-part statement depends on `reason_code`, the input label and `last_acquisition.outcome === "not_found"` only (`factor-card.tsx` 70–88, 116–135); the disclosure shows "the corporate actions behind the input and, where it is missing, the download outcome" (UX design §1.6). No design enumerates causes or data types | Yes; one wording edge under Observations |
| `last_acquisition.data_type = corporate_actions` | Already produced for `corporate_action_payload_unusable` (DEC-0243; `momentum_inputs.sql` 270–272; `insert_inputs.sql` line 20) | Yes, not new to any consumer |
| `GET /api/classifications/summary` `stocks_current` | A stock is current when none of its inputs is `missing` or `outdated` | Yes; the count falls for every uncovered stock (FINDING-40) |
| `docs/reference/classification-engine.md` | Documents the delivered v3 behaviour: momentum status table (lines 373–390), `detail` table (408–419), `last_acquisition` mapping (432–446) | Doc-sync after S10 (Follow-up Work) |

### The rule against AC-7 and AC-12

AC-7 requires momentum "computed from exactly the inputs … defined". The
capability defines momentum as total returns "adjusted for splits and
dividends" (§2, line 108). Under v3 a return computed with no corporate
actions available was a price return presented as a total return. Under v4 it
is not computed. AC-12 requires that no score be shown unless every input is
present, and that the input be named. The input is now `missing`, the stock is
`not_classified` on momentum, and the momentum input is named in
`reason_input`. **The rule meets both criteria.** At low coverage the
consequence is AC-14's *not enough stocks to rank*, which is the
capability's intended fail-safe (FINDING-40 asks only that the design say
so).

---

## Findings by Specification

### Capability Specification

#### Architectural Vocabulary (SR-10)

Not applicable to the capability; no finding.

#### Dependencies and Conformance (SR-9)

`check-capabilities.py`: no error, no warning. §5.1 is unchanged. The CAP-001
`requires-runtime` row already names per-stock coverage, so DEC-0397 adds no
edge. Its citation, `CAP-001 AC-7`, is about coverage visibility. The momentum
rule now depends on what coverage *means*. That is CAP-001 AC-12's subject
("MUST NOT leave data that presents as complete coverage for a range it did
not fully acquire"), and it is not fixed by any approved CAP-001 artifact in
the form the rule needs (FINDING-39). Tech stack: C4 still unaddressed
(FINDING-14). STD-UI: mirror disagreement carried (FINDING-12).

#### Completeness (SR-1)

No finding.

#### Correctness (SR-2)

No finding. The ACs do not contradict one another.

#### Testability (SR-4)

- FINDING-18 (carried).

#### Clarity (SR-6)

- FINDING-18 (carried).

### System Design Specification (v5, revised)

- **SR-1**: complete; no diagram added.
- **SR-2**: constraint 8's coverage sentence is correct against the code.
  §8 question 1 still reads `preferred_stock` "absent read as 0" (FINDING-3).
- **SR-3**: FINDING-39 (constraint 8, §4.2 against CAP-001); FINDING-46 (§3.1
  step 8a, §6 assumption 2); carried FINDING-13, 19, 20, 29.
- **SR-5**: FINDING-4 (DEC-0295 not cited); carried FINDING-21, 23, 28, 32,
  37, 38.
- **SR-7**: FINDING-1 (§3.1 steps 5, 19 to 21); FINDING-2 (§6 assumption 1).
- **SR-9**: FINDING-39; carried FINDING-14, 16.
- **SR-10**: FINDING-45 (generated inventory); FINDING-33 carried. Otherwise
  no finding: the revision adds no component; the changed row still names
  provider `market-data-store` and consumer `factor-engine`.

### Component Design Specifications

- **factor-engine (v4, revised)**: FINDING-39 (§2.4, §3, §12); FINDING-3
  (§2.4, §7); FINDING-40 (§6); FINDING-41 (§2.4); FINDING-42 (§7);
  FINDING-43 (§2.4 `known_on`); FINDING-44 (§2.3 step 5, §2.4, §12);
  FINDING-46 (version 4 paragraph); FINDING-4 (§2.4, §12); FINDING-37
  (provenance); carried FINDING-1, 2, 11, 15, 17, 18, 28, 34, 35, 36, 38.
- **classification-api (v3)**: FINDING-6, 11, 15, 16, 19, 20, 22. Unchanged.
  Handles the new cause (above).
- **classification-reader (v3)**: FINDING-6, 8, 9, 10, 15, 17, 20, 22, 27.
  Unchanged. Handles the new cause.
- **classification-ui (v3)**: FINDING-6, 9, 10, 11, 23, 26, 27, 29.
  Unchanged. Handles the new cause.
- **classification-scheduler (v2)**: FINDING-1, 15. Unchanged.
- **research-store (v2)**: FINDING-1, 15, 17, 31. Unchanged; `factor_input`
  accepts the new rows.
- **universe-service (v2)**: FINDING-8, 9, 22, 30. Unchanged.
- **SR-7, all components**: no new edge between components. The factor engine
  gains one read (`coverage_segment`) from a store it already reads.

### UX Brief

- **SR-8**: unchanged since v3. FINDING-6, 7, 11, 12, 25.

### UX Design Specification

- **SR-8**: unchanged since v3. FINDING-6, 9, 11, 23, 24, 25, 26, 30.

### Cross-Specification Consistency (SR-3)

- CROSS-SPEC-INCONSISTENCY: factor-engine v4 and system design v5 against
  CAP-001 system design v8 constraint 9, observation-writer v4 §2.5 and §8
  criterion 5, and acquisition-runner §11, on what a coverage segment means
  (FINDING-39).
- CROSS-SPEC-INCONSISTENCY: factor-engine v4 §2.4 and system design v5 §8
  question 1 against DEC-0295 and the delivered `value_inputs.sql` on a null
  `preferred_stock` (FINDING-3).
- Downstream propagation: epic CAP-002-E2, the missing story CAP-002-E2-S10,
  and the factor-engine test specification (FINDING-5).
- Carried: FINDING-1, 6, 7, 11, 12, 13, 17, 19.

### Screen Specification Acceptance Checks (S03)

S03 v4, the UX artifacts and the reads behind them are unchanged since v3.

| Check | Verdict | Evidence |
|-------|---------|----------|
| S03-1 incomplete stocks listed unless hidden | PASS | As v5. A stock missing momentum for want of coverage is *Incomplete* on momentum and listed (DEC-0081) |
| S03-2 match count over the full set | PASS, with FINDING-9 | As v5 |
| S03-3 inputs' as-of in the inspector | PASS | As v5; a not-covered input keeps `as_of = E` (DEC-0118 (4)) |
| S03-4 no percentile below 30 qualifying stocks | PASS | As v5; the likely post-upgrade state (FINDING-40) |
| S03-5 filters, sort and scope survive reload and back | PASS | As v5 |
| S03-6 restatement mark in results and inspector | PASS | As v5; momentum is never marked |
| S03-7 save every matching stock, membership kept | PASS, with FINDING-25 | As v5 |

---

## Disposition of Review v5 Findings

| v5 finding | v5 severity | Status at v6 | Evidence | v6 finding |
|------------|-------------|--------------|----------|------------|
| FINDING-1 first-deployment backlog | HIGH | Carried | Scheduler, research-store, factor-engine §6 (now lines 755–759) and system design §3.1 unchanged; no record decides it | FINDING-1, HIGH |
| FINDING-2 quarter coverage | MEDIUM | Carried | Factor-engine version 3 paragraph still says "Section 14 question 1 is closed" (103–104). DEC-0295 records the owner's deferral ("Q4 quarter coverage is confirmed at the first real run") but defines no check or fallback | FINDING-2, MEDIUM |
| FINDING-3 JSON-null `preferred_stock` | MEDIUM | Carried, **changed** | The owner decided it (DEC-0295) and the code applies it; v4 is the revision DEC-0295 names, and the prose (376, 413–415; system design 881) is unchanged | FINDING-3, MEDIUM |
| FINDING-4 decision records | MEDIUM | Carried, **narrowed** | DEC-0295 (owner) records the answer and remedies and states what it supersedes; trailers exist for DEC-0221 (`8736eb1`…), DEC-0242 (`b357849`…), DEC-0295 (`ae525ff`…). Neither design cites DEC-0295 | FINDING-4, **LOW** |
| FINDING-5 backlog vehicle, test specification | MEDIUM | Carried, **re-scoped** | The code vehicle exists: EXP-20261107-1, owner-approved on its review v2. Epic E2 (v2, 2026-10-17) and the test specification (`425b648`) are unchanged; DEC-0397 adds S10, not yet generated | FINDING-5, MEDIUM |
| FINDING-6 to FINDING-16 | MEDIUM | Carried | Subjects unchanged; DEC-0058 and DEC-0082 `artifacts` unchanged; system design §8 question 2 still `[REQUIRES INPUT]` | FINDING-6 to FINDING-16 |
| FINDING-17 to FINDING-36 | LOW | Carried | Subjects or sections unchanged by `b8ee5fe` (factor-engine §3 append-only bullet, §7 `hypothesis` line, §2.4 currency, book-equity rationale and `LineItem`; system design §1, §4.1 note, §8 questions 3 and 4, §9, §10) | FINDING-17 to FINDING-36 |
| FINDING-37 provenance | LOW | Carried, **changed** | Timestamps refreshed but wrong (16:00Z, before DEC-0397); factor-engine's system-design pin now v5; review and tech-stack pins unchanged | FINDING-37, LOW |
| FINDING-38 `PROVISIONAL` on upheld records | LOW | Carried | Factor-engine lines 52, 291, 361, 645–646, 662, 665, §14 questions 2 and 4 unchanged | FINDING-38, LOW |

Summary: closed 0; carried 38, of which four changed (FINDING-3 widened to a
break against an owner record, FINDING-4 narrowed to LOW, FINDING-5 re-scoped,
FINDING-37 changed). New: 8 (FINDING-39 to FINDING-46).

---

## Findings Summary Table

CRITICAL 0 · HIGH 2 · MEDIUM 15 · LOW 29 · **total 46**

Line numbers are those of system design v5 and factor-engine v4. A carried
finding whose location text gives no line number is located as in review v5,
shifted by the revision's insertions: 13 lines before factor-engine §1, 9
before system design §1, and the 30-line §2.4 paragraph.

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-7, SR-3 | classification-scheduler; research-store; factor-engine; system design | scheduler §2.4 (`qualifying_run.sql`), §5 "Backlog", §6; research-store §6 "Data migration"; factor-engine §6 "Behaviour change after upgrade" (755–759); system design §3.1 steps 5, 19 to 21 | Carried since review v1, unchanged. Every CAP-001 run that ended `succeeded` or `partial` before deployment qualifies, and the scheduler builds one set per run, oldest first, each dated the day it is built. Research-store and factor-engine say the first set follows the first qualifying run after deployment | First deployment appends one permanent, misattributed set per historical run to history (AC-21), and a run ending during the backlog waits behind it (AC-11) | Decide which runs qualify at first deployment and whenever several wait (for example, only the latest without a set); align the four designs; record the choice |
| FINDING-2 | MEDIUM | SR-7, SR-1 | system design; factor-engine | system design §6 assumption 1 (Version 4), §8 question 1; factor-engine version 3 paragraph (103–104: "Section 14 question 1 is closed"), §14 question 1 (922–929), §3 assumption (676–680), §2.4 *Statements* (345–355); DEC-0295 ("Q4 quarter coverage is confirmed at the first real run") | Carried. Quarter coverage, Q4 included, is assigned to the first real run with no defined check and no fallback; the owner's record now confirms that deferral but not the check. With the 4-month adjacency, a stock whose Q4 exists only in an annual statement never forms a trailing window | If quarterly Q4 records are absent, `earnings_yield`, `fcf_yield` and both growth inputs are `missing` for every stock, so value and growth never classify (fail-safe, AC-12) | Define the confirmation query, who runs it, and the fallback (for example Q4 = FY − Q1 − Q2 − Q3, an owner decision); reword "is closed" to "keys answered; coverage open" |
| FINDING-3 | MEDIUM | SR-3, SR-6, SR-4, SR-2 | factor-engine; system design; DEC-0295 | factor-engine §2.4 `LineItem.less_key` comment (376: "absent read as 0") and paragraph (413–415: "an absent `preferred_stock` reads as zero … A present `preferred_stock` that is not a plain number makes book equity absent"); §7 *Book equity less preferred* (793: absent case only); system design §8 question 1 table (881: "absent read as 0"); DEC-0295 (owner, 2026-11-07T02:39:43Z: "preferred_stock absent or JSON null reads as zero; any other non-numeric value makes book equity absent"; derivation: "design prose is amended at the next revision"; rejected: "Null preferred_stock making book_to_price missing"); `docs/changes/EXP-20261107-1.md` line 74; delivered `value_inputs.sql` 50–65 | Carried from v5 FINDING-3, widened to a fidelity break. The owner has decided the null case, the code implements it, and both DEC-0295 and EXP-20261107-1 name the designs' next revision as where the prose is amended. This revision leaves it unchanged. Read literally, a JSON null is a present value that is not a plain number, which is the reading DEC-0295 rejected | The designs up for re-approval state a rule the owner rejected and the code does not follow. A test, doc-sync or adversarial review planned from the design would expect `book_to_price` `missing` for every issuer whose payload carries an explicit null | In this revision: "a `preferred_stock` that is absent or JSON null reads as zero; any other value that is not a plain number makes book equity absent (DEC-0295)", in the `less_key` comment, §2.4 and system design §8 question 1; add the null case to the §7 row |
| FINDING-4 | LOW | SR-5 | factor-engine; system design | factor-engine §2.4 (420–421: "DEC-0055 (6) as revised by the owner on 2026-11-06"), §3 (653–654), §12 decision list (900); system design constraint 8 (650–654: "owner, 2026-11-06 … revises DEC-0055 (6)"), §8 question 1; DEC-0295 (owner; supersedes DEC-0055 (6) and DEC-0122's balance-sheet shares source) | Carried from v5 FINDING-4, narrowed. The owner's answer and both remedies are now recorded (DEC-0295), with supersession stated, and the trailers v5 asked for exist. Neither design cites DEC-0295, although this revision edited both designs' decision references | A reader of either design cannot find the record that governs its shares, capital-expenditure and book-equity rules | Cite DEC-0295 at factor-engine §2.4, §3 and §12, and at system design constraint 8 and §8 question 1 (one edit with FINDING-3) |
| FINDING-5 | MEDIUM | SR-3, SR-5, SR-4 | epic CAP-002-E2; story CAP-002-E2-S10 (absent); factor-engine test specification (downstream, not subjects) | `CAP-002-E2.md` v2 (approved, 2026-10-17): Dependencies (50: CAP-001 tables, no `coverage_segment`), DAC-E2-1 (90: "most-recent balance sheet"), Open Questions (148: payload keys `[REQUIRES INPUT …]`); no `CAP-002-E2-S10.md` (DEC-0397: "Delivered as new story CAP-002-E2-S10"); `tests/component/factor-engine-tests.md`, `tests/coverage-matrix.md` (last changed `425b648`); `backlog.md` pins | Carried from v5 FINDING-5, re-scoped. The payload-key code has its vehicle: EXP-20261107-1 implemented DEC-0295 with integration tests. The approved epic still describes the pre-DEC-0295 rules and omits the coverage dependency. S10 is not generated. The Phase 5 test specification has no case for any rule factor-engine v3 or v4 added to §7 | S10 cannot be planned until generated and backlog-reviewed. Test design and automation would plan from a specification lacking the shares, capex, preferred, consecutive-window and coverage cases | After re-approval: refine E2 (close the open question; DAC-E2-1 per DEC-0295; `coverage_segment` in Dependencies; a DAC for DEC-0397) and generate S10, both through `$backlog-review`; bring the test specification and coverage matrix in line with factor-engine §7 |
| FINDING-6 | MEDIUM | SR-3, SR-1 | UX design; UX brief; classification-ui; classification-api; classification-reader; system design | UX design §1.1, §1.6; brief §2.6; system design §4.2 `/history`; api `StockHistoryResponse`; reader `HistoryRow`, `stock_history.sql`; UX design §1.1 never-populated latest-download line | Carried, unchanged. Two surfaces name a download by its start time, but the history read does not carry it, and the never-populated latest-download line names no read | AC-18, AC-21 and the AC-22 empty state cannot render as specified | Add `run_started_at` to the history read; name the read behind the latest-download line |
| FINDING-7 | MEDIUM | SR-3, SR-8 | UX brief; DEC-0082 | brief §2.1, §2.2, §3, §12.4; DEC-0082 `artifacts` | Carried, unchanged. The brief describes the read shape DEC-0082 replaced and omits the first set's *Updating* and *Score update failed* | Two approved UX artifacts disagree on AC-20 before the first set | Revise the brief to the `set` + `later` shape; add it to DEC-0082's `artifacts` |
| FINDING-8 | MEDIUM | SR-7 | universe-service; classification-reader; DEC-0085 | universe-service §1, §2.3; reader §1, §2.5, §3 | Carried, unchanged: `factorflow.universes` and `factorflow.classification` import each other (SA-CLASS-002) | Package-cycle detection flags either package | Move the shared type and predicate, or the replay SQL, to a neutral module, or record the owner's acceptance |
| FINDING-9 | MEDIUM | SR-3, SR-1 | classification-reader; classification-api; universe-service; UX design; classification-ui | reader §2.5 `scope` CTE, §2.3; api `UniverseResponse.members[].factors`; universe-service `Member`; UX design §1.4; ui `members-tab.tsx` | Carried, unchanged. A member covered after the current set was built is dropped from the scoped list and compare; no read supplies as-of member cells; *Member since* has no source | *{n} of {m} members match* disagrees with its rows | Report such members, supply member cells, source *Member since* |
| FINDING-10 | MEDIUM | SR-3, SR-2 | system design; classification-reader; classification-ui | system design constraint 11; reader `current_set.sql`; ui §2.6 stop rule and diagram | Carried, unchanged. Not-current is derived only from a later set row; the poll's stop rule disagrees with its diagram | AC-20's mark is missing in the claim gap | Derive not-current from the latest qualifying run too; align the stop rule |
| FINDING-11 | MEDIUM | SR-8, SR-3, SR-9 | factor-engine; system design; UX design; UX brief; classification-ui | factor-engine §2.3 (324–330), §4 (707–711), §10 (868–874); system design §3.1 step 25; UX design §1.1, §1.2; brief §3, §8; ui §2.6 | Carried, unchanged. `failure_reason` is the exception class and message, rendered verbatim, while both UX artifacts say no exception text reaches the owner | STD-UI-1 and the EDG claims break on the critical-tier state | Map exception classes to product sentences, or log the detail and write a product reason; correct the UX claims |
| FINDING-12 | MEDIUM | SR-9, SR-3 | capability; UX brief | capability §5.4 rows STD-UI-1, 7, 12; STD-UI v4 pin; brief §12.1 | Carried, unchanged | The checked mirror misstates conformance against STD-UI v6 | Owner: revise capability §5.4 and its pin |
| FINDING-13 | MEDIUM | SR-3 | system design | §3.1 steps 14, 25 to 27; constraint 10; §4.2; §4.4 | Carried, unchanged. DEC-0067's reclaim and timeout, `origin`, `min_peer_set_size`, `unknown_symbols`, three error codes and other contract elements exist only at component level | The design read first by later phases understates the contract | Lift them into §3 and §4.2 |
| FINDING-14 | MEDIUM | SR-9 | system design; capability | capability §5.1 tech-stack row (C2, C4, C5, C8); system design (no C4) | Carried, unchanged | The row's "Satisfied when" cannot be confirmed | State how classification honours C4 |
| FINDING-15 | MEDIUM | SR-9 | DEC-0058; five component designs | DEC-0058 `artifacts` (system design only); api, reader, scheduler, factor-engine (714–715), research-store §4 | Carried, unchanged | Consumer discovery misses five designs | Name them in DEC-0058's `artifacts` or a superseding record |
| FINDING-16 | MEDIUM | SR-9, SR-1 | system design; classification-api; UX brief; UX design; classification-ui | system design §8 question 2; api §2.4; delivered `classification_bounds.py:15` | Carried, unchanged: no artifact bounds the universe name | SEC-INP-001 unmet on create and rename | Owner: state the bound |
| FINDING-17 | LOW | SR-3 | research-store; classification-reader; system design; factor-engine | research-store §2.5; reader §3; system design §4.4; factor-engine §3 (642–644) | Carried, unchanged. Four descriptions of the append-only guard's scope differ from the delivered guard | A reader misjudges enforcement | Align with the delivered guard |
| FINDING-18 | LOW | SR-6, SR-4 | capability | §2, AC-12 | Carried, unchanged. The upheld definitions of the standardised score, non-positive bases and `not_computable` live in records | Definitions outside the capability | Fold them in at the next capability revision |
| FINDING-19 | LOW | SR-3 | system design; DEC-0082 | §3.3 step 14, §3.1 step 15 | Carried, unchanged: both reads said to be polled | A test could re-read 3000 rows every 10 seconds | Amend to the summary poll with one list reload |
| FINDING-20 | LOW | SR-6, SR-3 | system design; api; reader; ui; DEC-0082 | §3.3 step 13, §4.2 `later`; `LaterBlock`; `LaterSet` | Carried, unchanged: "the first set while none is complete" is not what the SQL returns | A test could assert the wrong set | Reword as "the most recent set, while none is complete" |
| FINDING-21 | LOW | SR-5 | system design; DEC-0085 | version 3 paragraph, §3.2, §3.3 step 15, §4.2, §4.4, §9 | Carried, unchanged: DEC-0085 applied, never cited | The supersession of DEC-0079 (f) cannot be found | Cite DEC-0085 |
| FINDING-22 | LOW | SR-5 | classification-reader; classification-api; universe-service | §12 version labels | Carried, unchanged | A reader follows a stale label | Update the labels; add DEC-0085 |
| FINDING-23 | LOW | SR-9, SR-3 | system design; classification-ui; UX design; DEC-0084; DEC-0088 | system design §8 question 4; ui §2.2; UX design §0 | Carried, unchanged. Two delivered tests assert the four labels, and DEC-0088's tenth file is not listed | The confirmed edit list is not the one shown | Add both and cite DEC-0088 |
| FINDING-24 | LOW | SR-5 | UX design | `ai_provenance.timestamp` against commit `25fb3e6` | Carried, unchanged | AGT-PROV-001 production timestamp | Correct at the next revision |
| FINDING-25 | LOW | SR-8, SR-3 | UX design; UX brief; classification-ui | S03 §3 save; UX design §1.1, §1.4, §4; ui §2.7 | Carried, unchanged. The save is withheld under a universe scope, unrecorded as a departure | Unrecorded departure from an approved screen | Record it, or support the scope; correct §1.4 |
| FINDING-26 | LOW | SR-3 | classification-ui; UX design; DEC-0065 | ui §2.3, §14 question 7; UX design §1.3 | Carried, unchanged. Origin lines page the events read, the approach DEC-0065 rejected | Each expansion walks the event log | Add `origin` to list rows, or record why |
| FINDING-27 | LOW | SR-1 | classification-reader; classification-ui | reader §2.2, ui §2.3 narratives | Carried, unchanged: six sentences each | Cosmetic | Trim to five |
| FINDING-28 | LOW | SR-5, SR-9 | system design; factor-engine | system design §4.3; factor-engine §7 (776–778: "already in the tech stack") | Carried, unchanged: tech-stack v7 does not list `hypothesis` | The citation does not support the claim | Cite `pyproject.toml`, or add it to the tech stack |
| FINDING-29 | LOW | SR-3 | system design; classification-ui | §4.2 `GET /api/instruments`; ui §11 | Carried, unchanged | Unused interface in the inventory | Remove or name the screen |
| FINDING-30 | LOW | SR-8, SR-3 | UX design; classification-api; universe-service | UX design §1.3; api `GET /api/universes` | Carried, unchanged: Name sortable with no server sort | A one-page sort would be silently wrong | Add the sort or drop sortability |
| FINDING-31 | LOW | SR-5 | research-store | §6 "Rollback" | Carried, unchanged | Implies an unrecorded acceptance | Record the cost or cite the acceptance |
| FINDING-32 | LOW | SR-5 | system design | version 4 and 5 paragraphs ("Nothing else changes", 96, 105); §1 (OQ-TS-3 "provisionally"); §8 question 3; §9; §10; `ai_provenance.source_artifacts` (`CAP-002-specifications-review-report` v2, `tech-stack` "5") | Carried, unchanged | Closed questions read as open | At the next revision: fix the review id and tech-stack pin, close §8 question 3, add §9 sources, revise §1 and §10 |
| FINDING-33 | LOW | SR-10 | system design | §4.1 note; §4.2 summary consumer `shell-home-and-data-health-ui (unpublished)`; §8 question 10 (b) | Carried, unchanged; CAP-003 publishes `owner-shell` | Undeclared component in the inventory | Replace with `owner-shell`; regenerate `docs/architecture.md` |
| FINDING-34 | LOW | SR-2 | factor-engine; system design | factor-engine §2.4 (410–413: "Book equity is common equity"); system design §8 question 1 rationale (889–895) | Carried, unchanged: `preferred_stock` is the par or stated value | `book_to_price` somewhat overstated for some issuers; the rationale reads as exact | Qualify the sentence, or have the owner choose another treatment |
| FINDING-35 | LOW | SR-6, SR-4 | factor-engine | §2.4 *Currency* (339–343), MC (417–421), table (425), `as_of` (437–439); DEC-0116 (3) | Carried, unchanged. The currency sentence reads "the latest fiscal period end it uses", DEC-0116 (3) says the earliest; "P1" names three dates. The delivered code follows DEC-0116 (3) (EXP-20261107-1) | An implementer following the sentence could mark `present` what DEC-0116 (3) makes `outdated` | Tie the currency test to `as_of`; name each statement type's latest period distinctly |
| FINDING-36 | LOW | SR-6 | factor-engine | §2.4 (360–361, 369–376) | Carried, unchanged: no formula combines `sign`, `magnitude` and `less_key` | None for the seven items today; a later edit has no stated semantics | State the amount once and the valid combinations |
| FINDING-37 | LOW | SR-5 | factor-engine; system design | factor-engine `ai_provenance` (11–34: timestamp `2026-11-07T16:00:00Z`; `CAP-002-specification-review` "2"; `tech-stack` "5"); system design `ai_provenance` (14–37: same timestamp; review id and tech-stack as FINDING-32); DEC-0397 `decided_at` 2026-11-07T21:54:53Z; `b8ee5fe` 2026-11-07T16:02:23-06:00 (22:02:23Z) | Carried from v5 FINDING-37, changed. The revision refreshed both timestamps and the system-design pin, but `16:00:00Z` is about six hours before the owner decided the rule the content records. It reads as 16:00 local time labelled UTC. The review and tech-stack pins still name v2 and v5; review v5, which both current approvals cite, is listed in neither | Provenance misdates the content and misstates its inputs (AGT-PROV-001) | At the edit that follows this review: a UTC timestamp at modification; list the latest specification review and tech-stack v7 |
| FINDING-38 | LOW | SR-6, SR-5 | factor-engine; system design | factor-engine 52, 291, 361, 645–646, 662, 665, §14 questions 2 and 4 (930–940); system design 26 occurrences of `PROVISIONAL` | Carried, unchanged. Owner-upheld decisions still marked **PROVISIONAL**, and open questions ask the owner to uphold them | Settled decisions read as open | Drop the labels and close the questions at the next revision |
| FINDING-39 | HIGH | SR-9, SR-3, SR-5 | factor-engine; system design; capability §5.1; CAP-001 system design, observation-writer and acquisition-runner designs; DEC-0049 | factor-engine §2.4 (456–463: "CAP-001's writer records a `coverage_segment` … for every successful corporate-actions fetch, one that returned no action included"), §3 *Assumption (CAP-001 writer)* (684–689: "its range is the range requested (`write_instrument_with_outcomes` in `src/factorflow/ingestion/writer.py`)"), §12 implemented-code row (898); system design constraint 8 (659–665, "CAP-001 AC-7"), §4.2 `Observation read` (542: "depends on the published observation shapes"); capability §5.1 CAP-001 row (335, "per-stock coverage (`CAP-001 AC-7`)"). Against: CAP-001 system design v8 constraint 9 (398–400: "A range is reported as covered only because rows exist for it. No component may record intended coverage ahead of the write that justifies it"); observation-writer v4 §2.5 (223–226: "Coverage is extended for the range written, not the range requested … the writer takes the written range from the parsed observations rather than from the fetch plan"), §8 criterion 5 (390), §10; acquisition-runner §11 (465: "Parsed observations and the range written"); market-data-store v9 (521–523); DEC-0049 (owner, upheld, applied, 2026-10-11: "The mismatch between the runner's requested-range coverage and the writer design's range-written rule is logged as a follow-up for the standard lane"). Code: `runner.py` 327–330 | New. The fix rests on one semantics: a successful fetch, an empty one included, covers the range requested. That semantics is true of the delivered runner and contrary to every approved CAP-001 artifact that defines coverage. Under CAP-001's designs an empty fetch writes no rows, so it covers nothing. DEC-0049 recorded the conflict and deferred it to CAP-001's standard lane, where it is still open. The CAP-002 designs cite the implementation instead of a contract, and attribute the range to the writer when it is the runner's. CAP-001 AC-7, the citation, is about visibility. No CAP-001 test pins coverage for an empty successful corporate-actions fetch | Momentum's correctness depends on unpublished, disputed behaviour of another capability. If CAP-001 settles DEC-0049 the way its designs read, an empty fetch covers nothing and a non-empty one covers only the dates of returned actions. Nearly every momentum window then becomes `missing`, and momentum goes unranked for every stock (AC-14). CAP-002's tests insert coverage rows directly and would not show the cause. Until then, CAP-001's own reviews read the runner as non-conformant | Before re-approval, the owner settles the contract. Either amend CAP-001 through its standard lane (system design constraint 9, observation-writer §2.5 and §8 criterion 5, acquisition-runner §11): a successful fetch, an empty one included, covers the range requested; a `failed` or `not_found` fetch covers nothing; at least for `corporate_actions`. That closes DEC-0049's follow-up, and a CAP-001 test should pin it. Or record an owner decision adopting that semantics, with the CAP-001 designs in its `artifacts`. Then cite the contract and CAP-001 AC-12 in factor-engine §2.4, §3 and §12 and in system design constraint 8 and §4.2, and correct the locus to `runner.py` |
| FINDING-40 | MEDIUM | SR-1, SR-7 | factor-engine | §6 Upgrade (751–772): "No previous release of this component" (753); "Behaviour change after upgrade" (755–759, payload keys only); "Manual actions required" (760–761); Rollback (762–766); version 4 paragraph (111–122, sections touched exclude §6); DEC-0397 question (on 2026-11-07, 42 momentum-classified stocks in production, 31 scored without corporate actions); summary read `stocks_current` (system design §4.2); OPS-MIG-003 | New. Version 4 changes what a component already running against a persistent store computes, but §6 still describes a first release. It does not state four things. (a) The first set after upgrade makes every uncovered momentum window `missing`. At DEC-0397's figures at most 11 of the 42 stay qualified, below 30, so momentum is unranked for every stock (AC-14), and *{n} of {m} stocks current* falls, until a download re-acquires corporate actions. (b) Sets already recorded with momentum computed without corporate actions stay unaltered and unmarked (C5, AC-18), and §6's forward-compatibility note says M4 backtesting replays them. (c) The manual action: a download once the provider's rate limit clears. (d) The rollback for this change | The owner sees momentum disappear from Research and the current-stock count fall with no stated expectation. Recorded sets built on price-only "total returns" stay indistinguishable from correct ones in history and in the planned backtest. Release readiness has no upgrade statement to verify | Revise §6: the post-upgrade behaviour and its AC-14 consequence, the manual action, the rollback (reverting the image restores the outer join). Record the owner's disposition of sets built before the fix, whether left as recorded and said so, or identified by `classification_date` for the backtest. Never alter recorded rows (C5) |
| FINDING-41 | LOW | SR-6, SR-2 | factor-engine | §2.4 coverage predicate (466–470: `w.instrument_id`, `w.s_session`, `w.e_session`) against the momentum SQL of the same section (502, 504–505, 517–519: `windows w`, `window_start`, `window_end`); precedence rationale (480–485: "`price_not_positive` and `corporate_action_payload_unusable` … both of which judge the window's actions and so presume they are known"); DEC-0241 (1) | New. (a) The predicate names the window's columns differently from the SQL it gates, and does not say which relation `w` is. (b) Under DEC-0241 (1), `price_not_positive` also covers a non-positive `E` or `S_k` close, which does not depend on actions. The order is the owner's (DEC-0397) and stands, but its stated reason is partly wrong: a window with no coverage and a non-positive `E` close is named `corporate_actions_not_covered` | An implementer reconciles two names for one column; a reader misjudges which windows the order affects | Use the SQL's column names (or say the predicate is on `windows`), and reword the rationale to the owner's choice |
| FINDING-42 | LOW | SR-4 | factor-engine | §7 *Corporate actions not covered* (798); §8 criterion 14 (845–849) | New. The row tests no coverage, coverage starting after `S_k + 1` or ending before `E`, and an empty covered window. It has no case at the exact bounds (`covered_from = S_k + 1`, `covered_to = E` leave the input `present`). It has no case for the precedence DEC-0397 decides: no `S_k` bar and no coverage gives the boundary; no coverage with an unusable payload, or with a non-positive `E` close, gives `corporate_actions_not_covered`. Nor does it check `corporate_actions_coverage` listing a partial segment | An off-by-one at either bound, or a different cause order, passes the stated tests | Add the two boundary cases, the three precedence cases and a non-empty `corporate_actions_coverage` assertion |
| FINDING-43 | LOW | SR-6, SR-2 | factor-engine | §2.4 `known_on` (439–442: "latest `observed_on` across every statement, bar and corporate-action row the input used"); §7 *Known-on* (799); AC-17; DEC-0055 (7); `0003_coverage.sql` (no date column on `coverage_segment`) | New. A `present` momentum input now rests on coverage: "no split or dividend in the window" is known only once corporate actions were acquired. But `known_on` is taken over bars and actions, and coverage carries no date. In the B3 case (bars written, corporate actions rate-limited, acquired later), `known_on` precedes the first date the input could have been computed. A `present` input's `detail` does not record the containing segment either | AC-17's "date on which each input was known" can read earlier than the input's basis. Low, because the set itself is dated by `classification_date` (AC-19) | State that coverage does not enter `known_on` and why (it has no date), and record the containing segment in a `present` input's `detail`. If the owner wants `known_on` to reflect it, that needs a dated record CAP-001 does not keep |
| FINDING-44 | LOW | SR-5, SR-6 | factor-engine; DEC-0243 | §2.3 step 5 (307–311: "for the data type concerned"); §2.4 (477–480); §12 decision list (900); DEC-0243 (owner, open: `corporate_action_payload_unusable` → `corporate_actions`, every other momentum cause → `prices`); DEC-0241 (1) ("its missing_data_type is prices, as for every momentum input") | New. The design states the `last_acquisition` data type for the new cause only. DEC-0243's mapping for the other momentum causes, which DEC-0397 extends, appears in no design, and §12 omits DEC-0243 | S10's implementer reconstructs the mapping from the code or the records | State the full mapping in §2.4 (boundary and `price_not_positive` → `prices`; `corporate_action_payload_unusable` and `corporate_actions_not_covered` → `corporate_actions`) and add DEC-0243 to §12 |
| FINDING-45 | LOW | SR-10 | system design (generated `docs/architecture.md`) | `build-architecture.py -p factorflow-v2`, exit 1; `docs/architecture.md` line 89 (`Observation read` without `coverage_segment`) against system design §4.2 (542) | New. The revision changed a §4.2 row without regenerating the inventory. Derivation itself has no problem | The generated inventory lags the design; nothing in CI checks it | Run `python3 scripts/build-architecture.py -p factorflow-v2 -w` in the same change as the next design edit |
| FINDING-46 | LOW | SR-3 | system design; factor-engine | system design §3.1 diagram step 8a (256: "bars, statements, actions, acquisition_state"); §6 assumption 2 (790–793: "at least 13 months of bars for momentum"); version 5 paragraph (105: "Nothing else changes"); factor-engine version 4 paragraph (120: "touches Sections 1, 2.4, 3, 7, 8, 11, 12 and 13") against §2.2 (239, 253), also changed | New. The revision added coverage to constraint 8 and §4.2, but not to the control-flow step that lists the engine's reads. Nor did it reach the depth assumption, though momentum now also needs corporate-actions coverage from `S_12 + 1`. The factor-engine's list of touched sections omits §2.2 | A reader of §3.1 or §6 sees version 4's reads and assumption | Add `coverage_segment` to step 8a, extend assumption 2 to corporate-actions coverage, add §2.2 to the list |

---

## Traceability Matrix

Per-AC verdict (VER-EVD-004). Mappings are unchanged since v5 except where
noted.

| AC | System design | Component design(s) | UX design | Verdict |
|----|---------------|---------------------|-----------|---------|
| AC-1 | 3.2 steps 4, 4a; 5.13 | universe-service 2.4; api 2.5 | 1.3; 1.1, 1.4 | Mapped |
| AC-2 | 3.2 step 3a; 3.3 step 15; 4.2; 4.4 | universe-service `create_from_filter`; reader `evaluate_filter`; api 2.4 | 1.1, 1.3, 1.4 | Mapped with defect (FINDING-25) |
| AC-3 | 4.2; 4.4 | research-store; universe-service | 1.3; 1.1 | Mapped |
| AC-4 | 3.2 steps 8, 11, 12 | universe-service 2.4 | 1.4 | Mapped |
| AC-5 | 3.2 step 7; 5.13 | universe-service 2.4 | 1.3, 1.4; 1.1 | Mapped |
| AC-6 | 4.4; 5.3 | research-store; universe-service 2.5 | 1.4 | Mapped with defect (FINDING-9) |
| AC-7 | 5 constraint 8 (now with corporate-actions coverage); 4.2 `Observation read`; 8 question 1 | factor-engine 2.4 (coverage predicate), 2.5; §13 row updated | 1.5, 1.6 | Mapped; v3's outer-join defect closed by DEC-0397; contract defect FINDING-39; FINDING-3, FINDING-34, FINDING-2 remain |
| AC-8 | 5.5 | factor-engine 2.5; reader 2.5 | 1.1 | Mapped |
| AC-9 | 3.3 step 15; 5.7 | factor-engine 2.5; research-store | 1.1 | Mapped; method owner-upheld (FINDING-18) |
| AC-10 | 3.1 steps 4 to 7a, 19 to 21; 5.10 | classification-scheduler 2.4 | 1.2 | Mapped with defect (FINDING-1) |
| AC-11 | 3.1 steps 28 to 31 | factor-engine 5, 7; scheduler 2.3 | 1.1; 1.2 | Mapped with defect (FINDING-1); the coverage probe adds one indexed lookup per window |
| AC-12 | 3.1 step 12; 3.3 step 15; 5 constraints 6, 8 | factor-engine 2.4 (`corporate_actions_not_covered`), 2.5; reader 2.5; §13 row updated | 1.1, 1.5, 1.6 | Mapped with defect (FINDING-9); an uncovered momentum window is now `missing` with the input named |
| AC-13 | 3.3 step 18; 5.6; 5.8 | factor-engine 2.4; reader 2.4 | 1.6; 1.2 | Mapped; staleness wording FINDING-35 |
| AC-14 | 3.1 steps 9, 11a | factor-engine 2.3 step 6, 2.5 | 1.1 | Mapped; post-upgrade consequence unstated (FINDING-40) |
| AC-15 | 3.2 step 10; 3.3 step 15; 5.5 | factor-engine 2.5; reader 2.5 | 1.1, 1.4, 1.5, 1.6 | Mapped |
| AC-16 | 3.3 steps 15, 16 | reader 2.5; api 2.4 | 1.1, 1.4, 1.5 | Mapped with defect (FINDING-9) |
| AC-17 | 3.3 step 17 | factor-engine 2.4 `detail` (now with `corporate_actions_coverage`), `known_on` null on `missing`; reader 2.6 | 1.1; 1.6 | Mapped; `known_on` basis for a covered window FINDING-43 |
| AC-18 | 4.2 `/history`; 4.4 | reader 2.6; api | 1.6 | Mapped with defect (FINDING-6); sets built before the fix FINDING-40 |
| AC-19 | 3.1 steps 22 to 24; 5.4 | factor-engine 3; scheduler | 1.6 | Mapped; coverage and actions read in one snapshot (delivered `REPEATABLE READ`, DEC-0111) |
| AC-20 | 3.1 steps 13, 14b, 25 to 27; 3.3 steps 13, 14, 18; 5.11 | reader 2.4; api; ui 2.6 | 1.2; 1.1, 1.6 | Mapped with defects (FINDING-7, 10, 11, 19, 20) |
| AC-21 | 3.3 steps 13, 18; 4.2; 8 question 11 | reader 2.4; api; ui 2.6 | 1.2 | Mapped with defects (FINDING-1, FINDING-6) |
| AC-22 | 3.3 step 14 | reader 2.4; api 2.7 | 1.1, 1.5, 1.6 | Mapped (FINDING-6, FINDING-7) |
| AC-23 | 5.9 | factor-engine 2.4, 2.5; research-store | every scored surface | Mapped; DEC-0295 moves the shares row list to the income statement, as the design's "any statement row used" already reads; momentum never marked |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No finding is CRITICAL. No acceptance criterion contradicts another, no core
requirement is untestable, and the revision's rule meets AC-7 and AC-12. Two
findings are HIGH. FINDING-1 is carried unchanged since review v1 and is the
owner's decision on the first-deployment backlog. FINDING-39 is new and lands
on the revised designs.

**Re-approval of the two revised designs.** The verdict lets downstream work
proceed. This review nevertheless recommends against re-approving system
design v5 at `sha256:92e24df2…` and factor-engine v4 at `sha256:285cf2ee…` as
written. Re-approval is the owner's decision; the reasons are these:

- **FINDING-39 (HIGH)** is the foundation of the change. The rule is right
  against the code that runs today, but the coverage semantics it needs is
  contradicted by CAP-001's approved system design, observation-writer and
  acquisition-runner designs. An owner decision of 2026-10-11 (DEC-0049) left
  that conflict open. The owner settles it, preferably in CAP-001's own
  artifacts, and the CAP-002 designs then cite the result. The CAP-001
  amendment is outside this review's subjects.
- **FINDING-3 (MEDIUM)** is one sentence and one test row. The owner's own
  record (DEC-0295) names this revision as where it is fixed.
- **FINDING-40 (MEDIUM)** tells the owner what the upgrade will look like, and
  asks for a decision on sets recorded before the fix. It is best settled
  before S10 ships.

Any edit changes the content revision this report binds and needs fresh review
evidence. One combined edit costs one review. It would cover FINDING-3, the
citation half of FINDING-39, FINDING-40, FINDING-4, FINDING-37 and FINDING-41
to FINDING-46, plus regenerating `docs/architecture.md`.

Re-approval mechanics, for the owner, whichever revision is approved. Both
designs are `draft` and keep their v5-era `approval` blocks, so re-approval is
a direct edit of each block per `docs/approval-gates.md`:

- `approved_at` must be later than the binding report's `generated` time;
- `review_artifact` must point to that report;
- `reviewed_revision` must be the revision that report binds.

This report binds the other nine subjects at their unchanged id, version and
revision, so their approvals are not disturbed. Their pins to
`CAP-002-system-design` v3 clear in the gate once v5 is approved. This review
approves nothing.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-39: settle the coverage contract in CAP-001 (or by an owner record
   naming CAP-001's designs). Close DEC-0049's follow-up and pin empty-result
   coverage with a CAP-001 test. Then cite the contract and CAP-001 AC-12 from
   both CAP-002 designs.
2. FINDING-1: decide which runs qualify at first deployment, then align the
   scheduler, research-store, factor-engine §6 and system design §3.1.

### Should Fix (MEDIUM findings)

3. FINDING-3: apply DEC-0295's null rule to the prose and §7, in this
   revision.
4. FINDING-40: revise factor-engine §6 for the upgrade, and record the owner's
   disposition of sets built before the fix.
5. FINDING-5: after re-approval, refine epic E2, generate S10 through
   `$story-generation` and `$backlog-review`, and bring the test specification
   in line with factor-engine §7.
6. FINDING-2: define the first-run coverage check and the Q4 fallback; reword
   "is closed".
7. FINDING-6 to FINDING-16: as carried.

### Nice to Have (LOW findings)

8. FINDING-4, FINDING-37, FINDING-41 to FINDING-46: put them in the same edit
   as items 1, 3 and 4, so they cost no extra review.
9. FINDING-17 to FINDING-36 and FINDING-38, as listed.

---

## Follow-up Work (implementation drift, not findings)

The delivered code follows factor-engine v3. DEC-0397 assigns the change to
story CAP-002-E2-S10, which does not exist yet (FINDING-5). Once the designs
are re-approved:

1. `src/factorflow/classification/sql/momentum_inputs.sql`:
   - add the coverage predicate per window;
   - add the `corporate_actions_not_covered` cause between the boundary and
     `price_not_positive` in `statused` and in the `detail` `CASE`, with
     `window_months`, `E`, `S` and `corporate_actions_coverage`;
   - map that cause to `corporate_actions` in `missing_data_type` (lines
     267–272);
   - reword the `statused` comment, which states DEC-0241's order of causes.
   `insert_inputs.sql` needs no change.
2. `tests/integration/test_engine_inputs_momentum.py`: the §7 row, and the
   cases FINDING-42 asks for. Existing momentum fixtures must now insert a
   `corporate_actions` coverage segment, or their inputs turn `missing`.
3. `docs/reference/classification-engine.md`: the momentum status table
   (lines 373–390), the `detail` table (408–419) and the `last_acquisition`
   mapping (432–446), at doc-sync.
4. Review v5's follow-up list is done. EXP-20261107-1 set the seven keys,
   `magnitude` and `less_key`; moved shares to the income statement; read a
   null `preferred_stock` as zero; and removed the strict `xfail`
   (`line_items.py` lines 35, 40, 58; `value_inputs.sql` lines 50–65;
   `test_line_items_resolved.py`).

---

## Observations Outside the Review Subjects

- **Evidence wording for a corporate-actions `not_found`.** The UI's
  provider-holds-no-data branch (`factor-card.tsx` lines 70–88, DEC-0181)
  writes *the provider reports no {input label} for {symbol}*. For a
  not-covered window whose corporate-actions outcome is `not_found`, that
  reads *the provider reports no 3-month total return*, when what it lacks is
  corporate actions. This is reachable only if a corporate-actions endpoint
  answers `NOT_FOUND`, since an empty result is `[]` (DEC-0047). The pattern
  already exists for prices.
- **DEC-0241 and DEC-0243.** DEC-0397 (owner) builds its precedence on
  DEC-0241's `price_not_positive`. DEC-0241 is still `decided_by: agent`,
  `status: open`, and its clause (1) ("its missing_data_type is prices, as for
  every momentum input") is now superseded twice, by DEC-0243 and DEC-0397.
  Neither later record names DEC-0241 in `artifacts`.
- **Decision `commits` caches.** DEC-0221, DEC-0242 and DEC-0397 show
  `commits: []` although commits carry their trailers (`8736eb1`, `b357849`,
  `b8ee5fe`).
- **The cause of B3 is CAP-001's.** The corporate-actions fetches failed
  because the provider rate-limited them. Until a download re-acquires them,
  the fix leaves momentum unranked (FINDING-40). The governor's handling of
  that data type is outside this review.
- `docs/architecture.md`: the `GET /api/classifications` row is still
  truncated at `state: building \` (line 78), as review v5 noted.

## Run Record

A parent agent invoked this run as `$specification-review` for CAP-002, writing
`specifications-review-report-v6.md`. The parent restricted writes to this
report and its commit on the project clone's current branch, forbade edits to
any design, and forbade approval and pushing. It directed the review to follow
review v5's precedent for the nine unchanged artifacts and to focus fresh
judgement on the delta. No interactive input tool was available to this
reviewer, so the Step 6 question is returned to the parent rather than asked.

`check-prerequisites.sh` exited 0. One state result was decided rather than
asked. `pipeline-state.py` reported `AWAITING-APPROVAL`, and its only reason is
that review v5 does not cover the two new revisions, which is the evidence this
review exists to produce. Proceeding writes review evidence, not an approval.
It is the step the parent directed, and the state engine's next state after it
is still the owner's approval. No decision record was written, because this
report is the only permitted write.

No other file was written. In particular:

- no specification, decision record, backlog item, test specification, code,
  CAP-001, CAP-003 or `docs/ux/` artifact was edited;
- no approval block was touched;
- no branch, stash or reset was made; the one commit adds this report;
- `build-architecture.py` ran without `-w`, and its rendering for the drift
  diff went to the session scratchpad.
