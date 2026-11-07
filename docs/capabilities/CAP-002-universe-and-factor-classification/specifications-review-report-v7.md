---
artifact_schema_version: 1
artifact_id: CAP-002-specification-review
artifact_type: specification-review
artifact_version: 7
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
document: spec-review-report
capability: CAP-002
version: v7
generated: 2026-11-07T22:39:09Z
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
    result: "PASSED, exit 0: 3 capabilities, 11 edges (requires-runtime 4, conforms-to 7, blocked-by 0, requires-contract 0), 1 standard, 2 conformance claims, 1 constitution artifact, 4 references; no error, no warning (unchanged)"
  - script: build-architecture.py
    outcome: run
    result: "PASSED, exit 0: 3 designs, 27 components, 84 interfaces; docs/architecture.md matches (check mode, nothing written); review v6 FINDING-45 closed"
  - script: check-artifacts.py
    outcome: run
    result: "PASSED with 306 warnings, exit 0 (--strict), 630 artifacts; CAP-002 subject warnings: capability pins STD-UI v4 (current v6); eight unchanged designs pin CAP-002-system-design v3 (current v5), CAP-002-specification-review v2 and tech-stack v5; backlog.md pins system design v3 and factor-engine v2. The two revised designs raise no warning"
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
  SR-8: "applied — design_system_available true (projects/factorflow-v2/design-system.yaml; all four paths present); UX brief, UX design and classification-ui are byte-identical to reviews v3 to v6 and git log 5921017..aba5501 touches nothing under design-system/, docs/ux/ or docs/constitution/, so v3's mechanical verification of 62 component-variant pairs and 56 tokens stands; the new detail key reaches the owner only through the evidence disclosure, which renders detail without a closed key list"
  SR-9: "applied — check-capabilities.py (no error, no warning); capability sections 5.1 to 5.4 unchanged; the coverage contract checked against DEC-0398, DEC-0049, CAP-001's approved designs and released code, and the tests that do or do not pin it (FINDING-51)"
  SR-10: "applied — build-architecture.py derives the inventory with no problem and no drift; the rework adds no component or interface"
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
    content_revision: sha256:2506b8ef95d58c518bba1ff2a3732033ab0648325b3bb0b838329dcfb969b737
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
    content_revision: sha256:e2f91b6b97654f7f389142487d876c6933bb47f1195b589fca5a15db5371df4e
  - artifact_id: CAP-002-component-design-research-store
    artifact_version: 2
    content_revision: sha256:8644c9766f72ebb24be991814d61734bba93fcc8c344791cd3c17561a03cb192
  - artifact_id: CAP-002-component-design-universe-service
    artifact_version: 2
    content_revision: sha256:7b18e9f329c2a012cb516584e9127805fc9a15f2b382cf77fa83763bbee6fe03
statistics:
  total_findings: 41
  critical: 0
  high: 1
  medium: 14
  low: 26
pipeline_readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: specification-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T22:39:09Z
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
      version: "owner, 2026-11-07T22:33:19Z, status open; staged, not yet committed, in the harness worktree (read in full)"
    - id: DEC-0397, DEC-0295, DEC-0243, DEC-0241, DEC-0049
      version: "read for the state the rework cites"
    - id: CAP-001 designs and release
      version: "system design v8 constraint 9; observation-writer v4; acquisition-runner section 11; market-data-store v9; docs/releases/CAP-001-release-v2.md (read for the contract and release evidence, not subjects)"
    - id: delivered code
      version: "aba5501: src/factorflow/ingestion/runner.py; src/factorflow/db/migrations/0006_classifications.sql; src/factorflow/classification/sql/momentum_inputs.sql; tests/integration test_runner_acquires.py, test_runner_isolation.py, test_runner_resume.py, test_writer_coverage.py"
    - id: CAP-002-specification-review
      version: "6 (READY-WITH-WARNINGS; every finding re-checked, not carried on trust)"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Specification Review Report -- CAP-002

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-002 Universe & Factor Classification |
| **Version** | v7 (seventh review; triggered by commit `aba5501`) |
| **Specifications Reviewed** | Capability v1 (approved); system design **v5** (draft, reworked); factor-engine **v4** (draft, reworked); UX brief v3, UX design v3, classification-api v3, classification-reader v3, classification-ui v3, classification-scheduler v2, research-store v2, universe-service v2 (approved, byte-identical to reviews v5 and v6) |
| **Total Findings** | 41: CRITICAL 0, HIGH 1, MEDIUM 14, LOW 26 |
| **Pipeline Readiness** | READY-WITH-WARNINGS |

Commit `aba5501` reworks system design v5 and factor-engine v4 against review
v6. It keeps both version numbers and both `draft` statuses, and regenerates
`docs/architecture.md`. It targets ten findings: FINDING-3, 37 and 39 to 46.
For FINDING-39 it applies the owner's DEC-0398 (2026-11-07T22:33:19Z):
CAP-001 is released, and its released coverage is the contract. A successful
fetch, an empty one included, covers the range the runner requested, and a
`failed` or `not_found` fetch covers nothing.

**All ten targeted findings are closed.** FINDING-39 (HIGH) is closed by an
owner decision that names the contract, the CAP-001 designs it overrides and
the code it rests on. Both designs now cite it and `runner.py`, and the system
design cites CAP-001 AC-12. The null `preferred_stock` rule now matches
DEC-0295 in prose, table and test (FINDING-3). The rest are stated as asked:

- the Upgrade section (FINDING-40);
- the data type per momentum cause and DEC-0243 (FINDING-44);
- the cause order as the owner's, with column names reconciled (FINDING-41);
- the `known_on` basis (FINDING-43);
- boundary and order tests (FINDING-42);
- the missed sections (FINDING-46);
- UTC provenance with current pins (FINDING-37);
- the generated inventory, `build-architecture.py` now passing (FINDING-45).

**The rework introduces five findings, one MEDIUM.**

- **FINDING-47 (MEDIUM).** The drafted §6 disposition identifies the sets
  built before version 4 by `classification_date` against the release date.
  That rule cannot separate sets built on the release day, which share one
  date. It also misidentifies every set built during a rollback to 0.2.0, the
  path the same section offers. The new `detail.corporate_actions_covered_by`
  marks version-4 rows exactly, and `classification_set.started_at` gives the
  build instant. Either would make the rule exact. The owner should confirm a
  corrected sentence, not this one.
- **LOW.** §6 keeps two first-release bullets that are now stale, and one
  rollback sentence contradicts the next (FINDING-48). §6 cites "release
  blockers B1 and B2", which no artifact defines (FINDING-49). The new detail
  key is missing from the §2.4 summary of momentum `detail`, and untested on
  an `outdated` input (FINDING-50). The adopted coverage contract is pinned by
  no test, and DEC-0398's `artifacts` omit the two CAP-001 statements that
  contradict it most directly (FINDING-51).

**`detail.corporate_actions_covered_by` itself is sound.** Segments never
overlap, so exactly one segment contains a covered window. The copy in an
append-only `factor_input` row is the only durable record of the basis,
because CAP-001 deletes and reinserts `coverage_segment` on every merge.
`detail` is opaque to the reader, API and UI.

No finding is CRITICAL, so the verdict is READY-WITH-WARNINGS. The one HIGH
finding is FINDING-1, carried since review v1. No HIGH finding lands on the
rework. The two designs are clear for the owner's re-approval at the
revisions this report binds, with one caveat: the owner was to confirm §6's
disposition at re-approval, and FINDING-47 asks for that sentence to be
corrected first (see Pipeline Readiness Assessment). This review approves
nothing.

## Review Scope

All eleven artifacts resolved by `get-capability-specifications` are in scope.
The two reworked designs were read in full, together with the complete diff of
`aba5501` against `5921017` (review v6). `artifact-gate.py revision` confirms
that the other nine subjects match the revisions reviews v5 and v6 bound.
`git log 5921017..aba5501` touches only the two designs and
`docs/architecture.md`. Every carried finding was re-checked against the
current text. Line numbers below are those at `aba5501`.

Read for verification, none of them a subject and none edited:

- DEC-0398 in full (harness worktree; staged, not committed, at review time),
  and DEC-0397, DEC-0295, DEC-0243, DEC-0241 and DEC-0049 for what the rework
  cites.
- CAP-001: system design v8 constraint 9 (lines 398–400); observation-writer
  v4 §2.5 and §8 criterion 5; acquisition-runner §11; market-data-store v9
  (lines 521–523); `docs/releases/CAP-001-release-v2.md` (deployment
  evidence).
- Code:
  - `src/factorflow/ingestion/runner.py` (lines 296–340);
  - migration `0006` (`classification_set`, `factor_input`);
  - `momentum_inputs.sql` (the `win` relation, lines 34–48);
  - the CAP-001 runner and writer tests, for whether any pins the coverage
    contract.

Not verified: §6's "version 3, in production as `factorflow` 0.2.0", and
DEC-0397's production figures. The repository holds no CAP-002 release
manifest, and this review has no access to the production host.

## Dimension Status

| Dimension | Status | Basis |
|-----------|--------|-------|
| SR-1 Completeness | applied | All template sections present; factor-engine §6 now covers previous release, behaviour change, prior sets, manual action and rollback, with stale first-release bullets left beside them (FINDING-48) |
| SR-2 Correctness | applied | Each rework statement verified against code, migrations and records. The prior-set identification rule fails on the release day and during a rollback (FINDING-47) |
| SR-3 Consistency | applied | Both designs against DEC-0398, DEC-0397, DEC-0295, DEC-0243 and each other. `corporate_actions_covered_by` against the §2.4 summary and §7 (FINDING-50). Carried cross-spec findings re-checked |
| SR-4 Testability | applied | ACs unchanged. The new §7 rows checked against the rules they test; `outdated` covered-by untested (FINDING-50); contract unpinned (FINDING-51) |
| SR-5 Traceability | applied | System design §7 and factor-engine §13 map all 23 ACs; §12 decision list now complete for the revision's rules; shares-source citations (FINDING-4); undefined blockers (FINDING-49) |
| SR-6 Clarity | applied | §6 stale and contradictory text (FINDING-48); undefined B1 and B2 (FINDING-49) |
| SR-7 Feasibility | applied | No new read or edge. The covered-by copy is one small object per present or outdated momentum input, 9,000 at most. Upgrade consequence now stated |
| SR-8 UX Completeness | applied | As in the frontmatter; S03 checks unchanged from review v6 |
| SR-9 Dependencies and Conformance | applied | `check-capabilities.py` clean; the CAP-001 coverage dependency is now an owner-decided contract cited at CAP-001 AC-12 (FINDING-39 closed; residual FINDING-51) |
| SR-10 Architectural Vocabulary | applied | `build-architecture.py` passes with no drift; no capability identifier added as an actor; FINDING-33 carried |

## Mechanical Checks

| Script | Outcome | Findings raised |
|--------|---------|-----------------|
| `check-capabilities.py --project factorflow-v2` | run, exit 0, PASSED; no error, no warning | none |
| `build-architecture.py -p factorflow-v2` | run, exit 0, PASSED: 3 designs, 27 components, 84 interfaces, no drift (check mode) | none; closes v6 FINDING-45 |
| `check-artifacts.py -p factorflow-v2 --strict` | run, exit 0, PASSED with 306 warnings over 630 artifacts | FINDING-12 (STD-UI v4 pin); FINDING-5 (`backlog.md` pins). The two reworked designs no longer warn (closes the pin half of v6 FINDING-37) |
| `check-references.py` | run, exit 0, PASSED: 1256 references, 649 files | none |
| `check-constitutions.py` | run, exit 0, PASSED: 10 constitutions, 38 skills | none |

All five ran from the harness worktree
`.claude/worktrees/confident-shtern-083e4b` (`f962287`, with DEC-0398 staged).
The project clone was on `usr/alvaro-de-jodra/CAP-002-E2-S10` at `aba5501`.

Supplementary evidence:

- `check-prerequisites.sh --project factorflow-v2`: exit 0, every check PASSED.
- `pipeline-state.py check --capability CAP-002 --stage specification-review`
  before writing: `AWAITING-APPROVAL` (exit 1). Both designs' approval blocks
  still bind review v5 and the v4/v3-era revisions.
- `artifact-gate.py revision` for all eleven subjects (`review_subjects`).

## Constitutions Applied

| ID | Outcome |
|----|---------|
| CONST-AGT 2.3 | AGT-PROV-001: both timestamps are now `2026-11-07T22:35:00Z`, after DEC-0398 (22:33:19Z). That is six seconds after `aba5501` (22:34:54Z), a minute rounding, not a misdating. Pins name review v6 and tech-stack v7. AGT-AUTH-002: the contract is an owner decision (DEC-0398) carried by the `Decision-Id: DEC-0398` trailer on `aba5501`; the record itself is staged but not committed in the harness. The §6 disposition is drafted for the owner to confirm, not decided by the agent (FINDING-47). AGT-EVIDENCE-001: every rework statement traced to file and line |
| CONST-MDL 1.3 | Exact model identifiers in both provenance blocks |
| CONST-OPS 1.3 | OPS-MIG-003: §6 now defines the rollback for version 4 (revert to 0.2.0), but one sentence contradicts it (FINDING-48), and the prior-set rule ignores the rollback window (FINDING-47). OPS-MIG-001: no data-model change |
| CONST-REV 1.4 | Two-stage report. REV-RCV-001: every closure verified against the text, the code and the records, not the commit message. REV-RCV-002 challenges two statements. §6's "so the M4 backtest can tell them apart" does not hold on the release day or in a rollback (FINDING-47). "Reverting the image stops builds" contradicts the line before it (FINDING-48) |
| CONST-SA 2.0 | SA-MD-002: undefined references B1 and B2 (FINDING-49). SA-MD-001: two "behaviour change" bullets in one section (FINDING-48). SA-CLASS-002: FINDING-8 carried |
| CONST-SEC 1.3 | No new input, channel or data class. `corporate_actions_covered_by` holds two dates. Carried FINDING-11, 15, 16 |
| CONST-VER 1.2 | All five mechanical checks and the supplementary checks ran in this session; per-finding disposition of review v6, per-AC verdicts, per-check verdicts for S03 (VER-EVD-004) |

---

## Stage 1 -- Specification Compliance

The rework restores fidelity to DEC-0295 (FINDING-3) and turns the coverage
dependency into an owner-decided contract (DEC-0398). Both designs now apply
every owner decision that names them: DEC-0221, DEC-0242, DEC-0295, DEC-0397
and DEC-0398. The momentum cause order and data types are stated as the owner
and DEC-0243 fixed them. The breaks that remain are those carried since review
v4 or earlier:

- FINDING-1, first-deployment backlog;
- FINDING-9, members with no row;
- FINDING-10, not-current without a later set row;
- FINDING-12, the STD-UI mirror;
- FINDING-25, the save under a universe scope.

## Stage 2 -- Artifact Quality

The rework is careful and complete against review v6. Every statement v6
named was changed, and both version notes now list the sections touched. The
new findings come from the one place that added substance rather than
precision, the §6 Upgrade section: its identification rule (FINDING-47), the
stale first-release text beside the new bullets (FINDING-48), and an
undefined reference (FINDING-49). FINDING-50 is a one-line omission, and
FINDING-51 asks for a test and two `artifacts` entries.

---

## Verification of the Rework

### The ten targeted findings

| v6 finding | What v6 asked | What `aba5501` did | Verified against | Verdict |
|------------|---------------|--------------------|------------------|---------|
| FINDING-3 (MEDIUM) | Apply DEC-0295's null rule to prose, table and §7 | `less_key` comment (383); §2.4 (419–423, cites DEC-0295); §7 *Book equity less preferred* adds JSON null → 1000 and a non-numeric string → `missing`; system design §8 question 1 table (890); §12 adds DEC-0295 | DEC-0295 decision text; delivered `value_inputs.sql` 50–65 | **Closed** |
| FINDING-37 (LOW) | UTC timestamp at modification; latest review and tech-stack v7 | Both `timestamp: 2026-11-07T22:35:00Z`; factor-engine pins review v6 and tech-stack 7; system design pins review "6" and "tech-stack 7, approved 2026-10-27" | `aba5501` at 22:34:54Z; DEC-0398 at 22:33:19Z; `tech-stack.md` v7 `approved_at` 2026-10-27T23:03:56Z; `check-artifacts.py` raises no pin warning on either design | **Closed** (the system design's malformed review id stays in FINDING-32) |
| FINDING-39 (HIGH) | Settle the coverage contract (amend CAP-001, or an owner record naming CAP-001's designs); cite it and CAP-001 AC-12; correct the locus to `runner.py` | DEC-0398 (owner): released behaviour is the contract, CAP-001 prose is drift, no CAP-001 change in this lane; `artifacts` name both CAP-002 designs, observation-writer, acquisition-runner and `runner.py`. Factor-engine §2.4 (464–476) and §3 *Contract* (718–726) cite DEC-0398, DEC-0049 and `runner.py`. §12 has a `runner.py` row and DEC-0398. System design constraint 8 (665–672) cites DEC-0398, `runner.py` and CAP-001 AC-12; §4.2 `Observation read` (546) depends on it | `runner.py` 327–330; DEC-0398 decision text; CAP-001 AC-12 ("MUST NOT leave data that presents as complete coverage for a range it did not fully acquire"), which the released behaviour meets because a failed fetch covers nothing | **Closed**; residual LOW FINDING-51 (no test pins the contract; two CAP-001 statements not in `artifacts`) |
| FINDING-40 (MEDIUM) | Revise §6: post-upgrade behaviour, prior sets' disposition, manual action, rollback | §6 (787–822): previous release; version-4 behaviour with the at-most-11 and AC-14 consequence; prior sets stay unmarked, identified by `classification_date` against the release; manual action, a corporate-actions download; rollback to 0.2.0 | C5, AC-14, AC-18; migration `0006`; OPS-MIG-003 | **Closed**; residuals FINDING-47 (identification), FINDING-48 (stale text), FINDING-49 (B1, B2) |
| FINDING-41 (LOW) | Reconcile column names; reword the order rationale | Predicate on `win` (`momentum_inputs.sql`'s relation, `s_session` = S_k, `e_session` = E), mapped to the sketch's `window_start`/`window_end` (474–477); order "is the owner's (DEC-0397)", "named `corporate_actions_not_covered` even when its `E` or `S_k` close is not positive" (504–510) | Delivered `win` CTE carries `s_session`, `e_session` (lines 34–48) | **Closed** |
| FINDING-42 (LOW) | Boundary pair, three precedence cases, a non-empty coverage list | §7 *Corporate actions not covered* adds exact `S_k + 1`/`E` → `present`, the partial segment listed, `corporate_actions_covered_by`; new row *Order of momentum causes* with the three cases and `last_acquisition.data_type = prices` for the boundary | DEC-0397 order; DEC-0243 mapping | **Closed** |
| FINDING-43 (LOW) | State that coverage does not enter `known_on` and why; record the containing segment | §2.4 (512–518): coverage carries no date, `known_on` stays DEC-0055 (7), the case where it precedes the download is named, AC-19; `detail.corporate_actions_covered_by` on `present` and `outdated` (494–496) | `0003` (no date column); AC-17, AC-19 | **Closed**; consistency residual FINDING-50 |
| FINDING-44 (LOW) | Full cause → data type mapping; cite DEC-0243 | §2.4 (498–502): boundary and `price_not_positive` → `prices`; not covered and unusable payload → `corporate_actions`; §2.3 step 5 points to it (314–316); §12 adds DEC-0243 | DEC-0243; delivered `momentum_inputs.sql` 267–272 | **Closed** |
| FINDING-45 (LOW) | Regenerate `docs/architecture.md` | Line 89 now lists `coverage_segment` | `build-architecture.py` exit 0, no drift | **Closed** |
| FINDING-46 (LOW) | Step 8a; assumption 2; §2.2 in the section list | System design step 8a (260), assumption 2 (798–802), version 5 note (98–109); factor-engine version 4 note lists §1, 2.2, 2.3, 2.4, 3, 6, 7, 8, 11, 12 and 13 | Diff `5921017..aba5501` touches exactly those sections | **Closed** |

### `detail.corporate_actions_covered_by`

| Question | Evidence | Verdict |
|----------|----------|---------|
| Well defined? | "the segment that contains its window", `{covered_from, covered_to}` (494–496). `coverage_no_overlap` makes the containing segment unique, and merging abutting ranges makes it exist whenever the window is covered | Yes |
| Point-in-time safe (C5, AC-19)? | The value is copied into the append-only `factor_input` row as read inside the build's `REPEATABLE READ` snapshot. `coverage_segment` itself is deleted and reinserted on every CAP-001 merge (`writer.py` 326–366), so this copy is the only durable record of the basis | Yes; it adds a guarantee |
| Consumers? | `factor_input.detail` is `jsonb` with no key constraint (`0006`); reader, API and UI treat `detail` as opaque; the UX disclosure lists "the corporate actions behind the input" without a fixed key list | Yes |
| Size (AC-11)? | At most 9,000 momentum inputs, each two dates | Negligible |
| Consistent within the design? | Stated in the coverage paragraph and asserted in §7 for a `present` input. The §2.4 summary of momentum `detail` (453–456) still lists only `E`, `S_k`, the closes, splits and dividends, and no row asserts it on an `outdated` input | FINDING-50 (LOW) |
| Useful beyond AC-17? | Every version-4 `present` or `outdated` momentum row carries it and no version-3 row does, so it identifies the computing version from the rows themselves | Basis for FINDING-47's recommendation |

### The §6 disposition of sets built before version 4

The disposition is to leave them as recorded and unmarked (C5, AC-18). That
complies with C5 and is the owner's to confirm. The identification sentence
(801–805) does not do what it claims:

| Case | `classification_date` rule says | Actually | Correct? |
|------|-------------------------------|----------|----------|
| Set built the day before the upgrade | before → version 3 | version 3 | Yes |
| Set built on the release day, before the image change | not before → version 4 | version 3 | **No** |
| Set built on the release day, after the image change | not before → version 4 | version 4 | Yes |
| Set built during a rollback to 0.2.0 (§6 Rollback) | after → version 4 | version 3, with the B3 defect | **No** |
| Set built for a backlog run after the upgrade (FINDING-1) | after → version 4 | version 4 (built by the new engine) | Yes |

`classification_date` is a calendar date and several sets can share one,
one per qualifying run. `classification_set.started_at` is a `timestamptz`
(migration `0006`). The CAP-001 release manifest shows the kind of timestamped
deployment evidence a release records (`CAP-001-release-v2.md` line 143). The
row-level marker above needs no external record at all (FINDING-47).

---

## Findings by Specification

### Capability Specification

- **SR-9**: `check-capabilities.py` clean. §5.1's CAP-001 row is unchanged.
  The momentum rule's reliance on coverage is now carried by DEC-0398 and the
  system design's citation of CAP-001 AC-12, so v6's citation-adequacy point
  is closed. FINDING-12 and FINDING-14 are carried.
- **SR-1, SR-2**: no finding.
- **SR-4, SR-6**: FINDING-18 carried.

### System Design Specification (v5, reworked)

- **SR-1, SR-2**: no new finding. §8 question 1 now matches DEC-0295.
- **SR-3**: carried FINDING-13, 19, 20, 29.
- **SR-5**: FINDING-4 (constraint 8's shares source, 657, cites the owner's
  2026-11-06 answer but not DEC-0295); carried FINDING-21, 23, 28, 32, 38.
- **SR-7**: carried FINDING-1, FINDING-2.
- **SR-9**: FINDING-51; carried FINDING-14, 16.
- **SR-10**: FINDING-33 carried; otherwise no finding.

### Component Design Specifications

- **factor-engine (v4, reworked)**:
  - new: FINDING-47 (§6 prior sets), FINDING-48 (§6 stale text and
    rollback), FINDING-49 (§6 B1, B2), FINDING-50 (§2.4 summary, §7),
    FINDING-51 (§3 contract, §7);
  - FINDING-4 (§2.4 MC, 428; §3, 687);
  - carried FINDING-1, 2, 11, 15, 17, 18, 28, 34, 35, 36, 38.
- **classification-api, -reader, -ui, -scheduler, research-store,
  universe-service**: unchanged; findings as review v6. All six handle the new
  key (opaque `detail`).

### UX Brief / UX Design Specification

- **SR-8**: unchanged since v3. UX brief FINDING-6, 7, 11, 12, 25. UX design
  FINDING-6, 9, 11, 23, 24, 25, 26, 30.

### Cross-Specification Consistency (SR-3)

- Closed: the CAP-002 designs against CAP-001 on coverage (v6 FINDING-39),
  now an owner-decided contract. The residual is FINDING-51.
- Closed: the CAP-002 designs against DEC-0295 on null `preferred_stock`
  (v6 FINDING-3).
- Downstream propagation still open: epic CAP-002-E2, story CAP-002-E2-S10,
  the factor-engine test specification (FINDING-5).
- Carried: FINDING-1, 6, 7, 11, 12, 13, 17, 19.

### Screen Specification Acceptance Checks (S03)

Unchanged from review v6: S03-1, S03-3 to S03-6 PASS; S03-2 PASS with
FINDING-9; S03-7 PASS with FINDING-25. The UX artifacts and the reads behind
them are byte-identical. The rework changes no owner-facing rule.

---

## Disposition of Review v6 Findings

| v6 finding | v6 severity | Status at v7 | Evidence | v7 finding |
|------------|-------------|--------------|----------|------------|
| v6 FINDING-1 | HIGH | Carried | Scheduler, research-store unchanged; factor-engine §6 bullet now at 806–810; system design §3.1 steps 5, 19 to 21 unchanged | FINDING-1, HIGH |
| v6 FINDING-2 | MEDIUM | Carried | Version 3 paragraph (103–104), §14 question 1 (980–987) unchanged | FINDING-2 |
| v6 FINDING-3 | MEDIUM | **Closed** | Table above | — |
| v6 FINDING-4 | LOW | Carried, **narrowed** | §12, §2.4 book equity and system design §8 question 1 now cite DEC-0295; the shares-source statements (factor-engine 428, 687; system design 657) do not | FINDING-4, LOW |
| v6 FINDING-5 | MEDIUM | Carried | Epic E2 v2, test specification at `425b648`, no S10, `backlog.md` pins unchanged | FINDING-5 |
| FINDING-6 to FINDING-16 | MEDIUM | Carried | Subjects or sections unchanged | FINDING-6 to FINDING-16 |
| FINDING-17 to FINDING-31 | LOW | Carried | Unchanged | FINDING-17 to FINDING-31 |
| v6 FINDING-32 | LOW | Carried, **narrowed** | Tech-stack pin now v7; the review id `CAP-002-specifications-review-report` (no artifact has it), the two "Nothing else changes" notes, §1 OQ-TS-3, §8 question 3, §9 and §10 unchanged | FINDING-32, LOW |
| FINDING-33 to FINDING-36 | LOW | Carried | Unchanged | FINDING-33 to FINDING-36 |
| v6 FINDING-37 | LOW | **Closed** | Table above | — |
| v6 FINDING-38 | LOW | Carried | `PROVISIONAL` at 52, 297, 368, 679, 695, 698, §14 questions 2 and 4 | FINDING-38 |
| v6 FINDING-39 | HIGH | **Closed** | Table above | residual FINDING-51, LOW |
| v6 FINDING-40 | MEDIUM | **Closed** | Table above | residuals FINDING-47 to FINDING-49 |
| FINDING-41 to FINDING-46 | LOW | **Closed** | Table above | FINDING-50 (residual of 43) |

Summary: closed 10 (HIGH 1, MEDIUM 2, LOW 7); carried 36, two narrowed
(FINDING-4, FINDING-32). New: 5 (FINDING-47 to FINDING-51).

---

## Findings Summary Table

CRITICAL 0 · HIGH 1 · MEDIUM 14 · LOW 26 · **total 41**

IDs are review v6's, so a closed ID leaves a gap. Carried findings keep v6's
description; their factor-engine line numbers shift by the rework's
insertions (about 6 lines after the version notes, 36 after §2.4's coverage
paragraph, 64 after §6).

| ID | Severity | Dimension | Specification | Location | Description | Impact | Recommendation |
|----|----------|-----------|---------------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | SR-7, SR-3 | classification-scheduler; research-store; factor-engine; system design | scheduler §2.4 (`qualifying_run.sql`), §5 "Backlog", §6; research-store §6 "Data migration"; factor-engine §6 "Behaviour change after upgrade" (806–810); system design §3.1 steps 5, 19 to 21 | Carried since review v1. Every pre-deployment `succeeded` or `partial` run qualifies, and the scheduler builds one set per run, oldest first, each dated the day it is built; research-store and factor-engine say the first set follows the first qualifying run after deployment | First deployment appends one permanent, misattributed set per historical run (AC-21), and a run ending during the backlog waits behind it (AC-11) | Decide which runs qualify at first deployment and whenever several wait; align the four designs; record the choice |
| FINDING-2 | MEDIUM | SR-7, SR-1 | system design; factor-engine | system design §6 assumption 1, §8 question 1; factor-engine version 3 paragraph (103–104), §14 question 1 (980–987), §3 (709–713); DEC-0295 ("Q4 quarter coverage is confirmed at the first real run") | Carried. Quarter coverage is left to the first real run with no defined check or fallback; with the 4-month adjacency a Q4 reported only annually breaks every trailing window | Value and growth may never classify (fail-safe, AC-12); "is closed" overstates | Define the confirmation query, who runs it and the fallback; reword "is closed" |
| FINDING-4 | LOW | SR-5 | factor-engine; system design | factor-engine §2.4 MC (428: "DEC-0055 (6) as revised by the owner on 2026-11-06"), §3 (687: "owner 2026-11-06"); system design constraint 8 (657: "owner, 2026-11-06 … revises DEC-0055 (6)") | Carried, narrowed. DEC-0295 is now cited for book equity, in §12 and in system design §8 question 1, but not where the shares source is stated, the rule DEC-0295 records as superseding DEC-0055 (6) | A reader of the shares rule still lands on the superseded DEC-0055 (6) | Cite DEC-0295 at those three places |
| FINDING-5 | MEDIUM | SR-3, SR-5, SR-4 | epic CAP-002-E2; story CAP-002-E2-S10 (absent); factor-engine test specification (downstream) | `CAP-002-E2.md` v2: Dependencies (50, no `coverage_segment`), DAC-E2-1 (90), Open Questions (148, `[REQUIRES INPUT …]`); no `CAP-002-E2-S10.md`; `tests/component/factor-engine-tests.md`, `tests/coverage-matrix.md` (`425b648`); `backlog.md` pins | Carried. The approved epic predates DEC-0295 and DEC-0397; S10 is not generated; the test specification lacks every rule factor-engine v3 and v4 added to §7, now including the order and covered-by rows | S10 cannot be planned until generated and backlog-reviewed; test design would plan from a stale specification | After re-approval: refine E2 and generate S10 through `$backlog-review`; align the test specification and coverage matrix with factor-engine §7 |
| FINDING-6 | MEDIUM | SR-3, SR-1 | UX design; UX brief; classification-ui; classification-api; classification-reader; system design | UX design §1.1, §1.6; brief §2.6; system design §4.2 `/history`; api `StockHistoryResponse`; reader `HistoryRow` | Carried. History read lacks the download start time; the never-populated latest-download line names no read | AC-18, AC-21, AC-22 empty state cannot render as specified | Add `run_started_at` to the history read; name the read |
| FINDING-7 | MEDIUM | SR-3, SR-8 | UX brief; DEC-0082 | brief §2.1, §2.2, §3, §12.4 | Carried. Brief describes the replaced read shape | Two UX artifacts disagree on AC-20 | Revise the brief; add it to DEC-0082's `artifacts` |
| FINDING-8 | MEDIUM | SR-7 | universe-service; classification-reader | universe-service §1, §2.3; reader §1, §2.5, §3 | Carried. Mutual package import (SA-CLASS-002) | Cycle detection flags both | Move the shared parts to a neutral module, or record acceptance |
| FINDING-9 | MEDIUM | SR-3, SR-1 | classification-reader; classification-api; universe-service; UX design; classification-ui | reader §2.5 `scope` CTE; api `UniverseResponse.members[].factors`; universe-service `Member`; UX design §1.4 | Carried. Late-covered members dropped; no as-of member cells; *Member since* unsourced | *{n} of {m} members match* disagrees with its rows | Report such members; supply cells; source *Member since* |
| FINDING-10 | MEDIUM | SR-3, SR-2 | system design; classification-reader; classification-ui | constraint 11; `current_set.sql`; ui §2.6 | Carried. Not-current only from a later set row; stop rule disagrees with its diagram | AC-20's mark missing in the claim gap | Derive from the latest qualifying run; align the stop rule |
| FINDING-11 | MEDIUM | SR-8, SR-3, SR-9 | factor-engine; system design; UX design; UX brief; classification-ui | factor-engine §2.3 (330–336), §4 (743–747), §10; system design §3.1 step 25; UX §1.1, §1.2 | Carried. Exception text rendered to the owner while UX says none is | STD-UI-1 and EDG claims break | Map exception classes to product sentences; correct the UX claims |
| FINDING-12 | MEDIUM | SR-9, SR-3 | capability; UX brief | capability §5.4 STD-UI-1, 7, 12; STD-UI v4 pin; brief §12.1 | Carried | The mirror misstates conformance against STD-UI v6 | Owner: revise §5.4 and its pin |
| FINDING-13 | MEDIUM | SR-3 | system design | §3.1 steps 14, 25 to 27; constraint 10; §4.2; §4.4 | Carried. Contract elements exist only at component level | The design read first understates the contract | Lift them into §3 and §4.2 |
| FINDING-14 | MEDIUM | SR-9 | system design; capability | capability §5.1 tech-stack row; system design (no C4) | Carried | "Satisfied when" unconfirmable | State how C4 is honoured |
| FINDING-15 | MEDIUM | SR-9 | DEC-0058; five component designs | DEC-0058 `artifacts`; factor-engine §4 (750–751) and four others | Carried | Consumer discovery misses five designs | Name them in DEC-0058's `artifacts` |
| FINDING-16 | MEDIUM | SR-9, SR-1 | system design; classification-api; UX artifacts; classification-ui | system design §8 question 2; `classification_bounds.py:15` | Carried. No bound on the universe name | SEC-INP-001 unmet | Owner: state the bound |
| FINDING-17 | LOW | SR-3 | research-store; classification-reader; system design; factor-engine | research-store §2.5; reader §3; system design §4.4; factor-engine §3 (675–677) | Carried | A reader misjudges enforcement | Align with the delivered guard |
| FINDING-18 | LOW | SR-6, SR-4 | capability | §2, AC-12 | Carried | Definitions live in records | Fold them in at the next capability revision |
| FINDING-19 | LOW | SR-3 | system design; DEC-0082 | §3.3 step 14, §3.1 step 15 | Carried | A test could over-poll | Amend to the summary poll |
| FINDING-20 | LOW | SR-6, SR-3 | system design; api; reader; ui | §3.3 step 13, §4.2 `later` | Carried | A test could assert the wrong set | Reword "the first set" |
| FINDING-21 | LOW | SR-5 | system design | version 3 paragraph, §3.2, §3.3, §4.2, §4.4, §9 | Carried. DEC-0085 not cited | Supersession untraceable | Cite DEC-0085 |
| FINDING-22 | LOW | SR-5 | classification-reader; classification-api; universe-service | §12 version labels | Carried | Stale label | Update labels; add DEC-0085 |
| FINDING-23 | LOW | SR-9, SR-3 | system design; classification-ui; UX design | §8 question 4; ui §2.2; UX §0 | Carried | Confirmed edit list differs | Add the two assertions and `pyproject.toml`; cite DEC-0088 |
| FINDING-24 | LOW | SR-5 | UX design | `ai_provenance.timestamp` against `25fb3e6` | Carried | AGT-PROV-001 | Correct at the next revision |
| FINDING-25 | LOW | SR-8, SR-3 | UX design; UX brief; classification-ui | S03 §3; UX §1.1, §1.4, §4; ui §2.7 | Carried | Unrecorded departure | Record it or support the scope |
| FINDING-26 | LOW | SR-3 | classification-ui; UX design | ui §2.3, §14 question 7 | Carried | Event-log walk per expansion | Add `origin` to list rows |
| FINDING-27 | LOW | SR-1 | classification-reader; classification-ui | §2.2 and §2.3 narratives | Carried | Cosmetic | Trim to five sentences |
| FINDING-28 | LOW | SR-5, SR-9 | system design; factor-engine | system design §4.3; factor-engine §7 (832–834) | Carried. `hypothesis` not in tech-stack v7 | Unsupported citation | Cite `pyproject.toml` or add it |
| FINDING-29 | LOW | SR-3 | system design; classification-ui | §4.2 `GET /api/instruments` | Carried | Unused interface | Remove or name the screen |
| FINDING-30 | LOW | SR-8, SR-3 | UX design; classification-api | UX §1.3 Name sortable | Carried | Silently wrong one-page sort | Add the sort or drop it |
| FINDING-31 | LOW | SR-5 | research-store | §6 "Rollback" | Carried | Implied unrecorded acceptance | Record or cite it |
| FINDING-32 | LOW | SR-5 | system design | version 4 and 5 notes ("Nothing else changes", 96, 109); §1 OQ-TS-3; §8 question 3; §9; §10; `ai_provenance` review id `CAP-002-specifications-review-report` | Carried, narrowed: tech-stack pin fixed | Closed questions read as open; the provenance review id names no artifact | Fix the review id; close §8 question 3; add §9 sources; revise §1 and §10 |
| FINDING-33 | LOW | SR-10 | system design | §4.1 note; §4.2 summary consumer placeholder; §8 question 10 (b) | Carried | Undeclared component in the inventory | Use `owner-shell`; regenerate |
| FINDING-34 | LOW | SR-2 | factor-engine; system design | factor-engine §2.4 (417–419); system design §8 question 1 rationale | Carried. `preferred_stock` is a par or stated value | Rationale reads as exact | Qualify the sentence |
| FINDING-35 | LOW | SR-6, SR-4 | factor-engine | §2.4 *Currency* (346–350), MC, table, `as_of` (446–447) | Carried | Currency sentence could be read against DEC-0116 (3) | Tie it to `as_of`; disambiguate "P1" |
| FINDING-36 | LOW | SR-6 | factor-engine | §2.4 `LineItem` (377–383) | Carried | Composition of modifiers unstated | State the amount formula |
| FINDING-38 | LOW | SR-6, SR-5 | factor-engine; system design | factor-engine 52, 297, 368, 679, 695, 698, §14 questions 2 and 4; system design `PROVISIONAL` labels | Carried | Settled decisions read as open | Drop the labels; close the questions |
| FINDING-47 | MEDIUM | SR-2, SR-7 | factor-engine | §6 *Sets built before version 4* (801–805: "They are the sets whose `classification_date` precedes the release that carries CAP-002-E2-S10, which its release manifest records, so the M4 backtest can tell them apart without any row changing"); §6 *Rollback* (816–818); migration `0006` (`classification_date date`, `started_at timestamptz`); §2.4 `corporate_actions_covered_by` (494–496) | New. The disposition itself (keep, do not mark) complies with C5, but the identification rule is a date comparison and fails in two cases. Sets built on the release day share its date whichever engine built them. Sets built during a rollback to 0.2.0, which the same section offers, carry later dates but version-3 momentum with the B3 defect | The M4 backtest, which §6 says replays by `classification_date`, would treat some version-3 sets as version 4. Those are the sets the disposition exists to exclude, and §6 asserts it can tell them apart. The owner is to confirm this sentence at re-approval | Before the owner confirms it, identify version-4 sets exactly. Either use the row marker (every version-4 `present` or `outdated` momentum input carries `detail.corporate_actions_covered_by`, and no version-3 row does), or compare `classification_set.started_at` with the deployment and any rollback instants the release records. Say which, and drop "precedes the release" |
| FINDING-48 | LOW | SR-6, SR-1 | factor-engine | §6 "Behaviour change after upgrade" (806–810, payload keys before the owner answers); "Manual actions required" first sentence (811–812, the owner's answer to §14 question 1); *Rollback* (816–819: "Reverting the image to 0.2.0 restores version 3's momentum … Reverting the image stops builds") | New. With version 3 now named as the previous release, two first-release bullets describe a state that ended with DEC-0295 and EXP-20261107-1, so §6 has two "behaviour change" bullets. The rollback bullet says reverting both restores version 3's builds and stops builds; the second sentence was written for reverting to a pre-CAP-002 image | An operator reading the rollback cannot tell what the revert does; the first-release text reads as current | Mark the first-release bullets historical or drop them (keeping FINDING-1's subject where it belongs), and qualify "stops builds" as reverting to an image before CAP-002 |
| FINDING-49 | LOW | SR-6, SR-5 | factor-engine; system design | factor-engine §6 (814: "CAP-002 release blockers B1 and B2"); version notes (factor-engine 111, system design 98: "release blocker B3") | New. No artifact in the project repository or the harness defines B1 or B2; B3 is described only in DEC-0397's question. There is no CAP-002 release manifest | The manual action's precondition cannot be looked up (SA-MD-002) | Name what B1 and B2 are (for example, the corporate-actions rate limit) or cite the record that defines them |
| FINDING-50 | LOW | SR-3, SR-4 | factor-engine | §2.4 summary of `detail` (453–456: "for a momentum input, `E`, `S_k`, the two closes, and every split and dividend applied"); §7 *Corporate actions not covered* (854: asserted on a `present` input only); §2.4 (494–496: "A `present` or `outdated` momentum input records … `corporate_actions_covered_by`") | New, residual of v6 FINDING-43. The key is stated in the coverage paragraph but not in the section's own summary of momentum `detail`, and no test asserts it on an `outdated` input | An implementer working from the summary omits it; an omission on `outdated` inputs passes the tests | Add the key to the summary sentence; assert it on an `outdated` input in §7 |
| FINDING-51 | LOW | SR-9, SR-4 | factor-engine; system design; DEC-0398 | factor-engine §3 *Contract* (718–726: "a change to it in CAP-001 would be a change to this contract"); §7 (no contract row); DEC-0398 `artifacts` (two CAP-002 designs, observation-writer, acquisition-runner, `runner.py`); CAP-001 system design v8 constraint 9 (398–400); market-data-store v9 (521–523); CAP-001 tests `test_runner_acquires.py`, `test_runner_isolation.py`, `test_runner_resume.py`, `test_writer_coverage.py` | New, residual of v6 FINDING-39. The contract is decided and cited, but no test pins it. No CAP-001 runner test asserts a covered range, nor that an empty successful corporate-actions fetch writes coverage while a failed one does not, and CAP-002's fixtures insert coverage directly. DEC-0398's `artifacts` omit the two CAP-001 statements that contradict it most directly | A CAP-001 change that follows its own design prose would make nearly every momentum window `missing` with no failing test in either capability. A reader of CAP-001 constraint 9 or the market-data-store design does not reach DEC-0398 | Add a §7 row for S10 that runs the acquisition runner with a stubbed empty corporate-actions result and a failed one, then builds a set: momentum present for the first, `corporate_actions_not_covered` for the second. This is a CAP-002 test and changes no CAP-001 code. Add CAP-001's system design and market-data-store to DEC-0398's `artifacts` |

---

## Traceability Matrix

Per-AC verdict (VER-EVD-004). Unchanged from review v6 except as noted.

| AC | System design | Component design(s) | UX design | Verdict |
|----|---------------|---------------------|-----------|---------|
| AC-1 | 3.2 steps 4, 4a; 5.13 | universe-service 2.4; api 2.5 | 1.3; 1.1, 1.4 | Mapped |
| AC-2 | 3.2 step 3a; 3.3 step 15; 4.2; 4.4 | universe-service; reader `evaluate_filter`; api 2.4 | 1.1, 1.3, 1.4 | Mapped with defect (FINDING-25) |
| AC-3 | 4.2; 4.4 | research-store; universe-service | 1.3; 1.1 | Mapped |
| AC-4 | 3.2 steps 8, 11, 12 | universe-service 2.4 | 1.4 | Mapped |
| AC-5 | 3.2 step 7; 5.13 | universe-service 2.4 | 1.3, 1.4; 1.1 | Mapped |
| AC-6 | 4.4; 5.3 | research-store; universe-service 2.5 | 1.4 | Mapped with defect (FINDING-9) |
| AC-7 | 5 constraint 8 (coverage, DEC-0397, DEC-0398); 4.2 `Observation read`; 8 question 1 (DEC-0295) | factor-engine 2.4, 2.5 | 1.5, 1.6 | Mapped; v6's contract and null-preferred defects closed; FINDING-34, FINDING-2 remain; contract unpinned (FINDING-51) |
| AC-8 | 5.5 | factor-engine 2.5; reader 2.5 | 1.1 | Mapped |
| AC-9 | 3.3 step 15; 5.7 | factor-engine 2.5 | 1.1 | Mapped (FINDING-18) |
| AC-10 | 3.1 steps 4 to 7a, 19 to 21; 5.10 | scheduler 2.4 | 1.2 | Mapped with defect (FINDING-1) |
| AC-11 | 3.1 steps 28 to 31 | factor-engine 5, 7 | 1.1; 1.2 | Mapped with defect (FINDING-1) |
| AC-12 | 3.1 step 12; 5 constraints 6, 8 | factor-engine 2.4 (cause, data type and order now complete), 2.5 | 1.1, 1.5, 1.6 | Mapped with defect (FINDING-9) |
| AC-13 | 3.3 step 18; 5.6; 5.8 | factor-engine 2.4 | 1.6; 1.2 | Mapped (FINDING-35) |
| AC-14 | 3.1 steps 9, 11a | factor-engine 2.5; §6 states the post-upgrade consequence | 1.1 | Mapped |
| AC-15 | 3.2 step 10; 5.5 | factor-engine 2.5 | 1.1, 1.4, 1.5, 1.6 | Mapped |
| AC-16 | 3.3 steps 15, 16 | reader 2.5; api 2.4 | 1.1, 1.4, 1.5 | Mapped with defect (FINDING-9) |
| AC-17 | 3.3 step 17 | factor-engine 2.4 (`known_on` basis stated; `corporate_actions_covered_by`) | 1.1; 1.6 | Mapped; v6 FINDING-43 closed; summary omission FINDING-50 |
| AC-18 | 4.2 `/history`; 4.4 | reader 2.6 | 1.6 | Mapped with defect (FINDING-6); prior-set identification FINDING-47 |
| AC-19 | 3.1 steps 22 to 24; 5.4 | factor-engine 3 | 1.6 | Mapped |
| AC-20 | 3.1 steps 13, 14b, 25 to 27; 3.3; 5.11 | reader 2.4; api; ui 2.6 | 1.2; 1.1, 1.6 | Mapped with defects (FINDING-7, 10, 11, 19, 20) |
| AC-21 | 3.3 steps 13, 18; 4.2 | reader 2.4; ui 2.6 | 1.2 | Mapped with defects (FINDING-1, 6) |
| AC-22 | 3.3 step 14 | reader 2.4; api 2.7 | 1.1, 1.5, 1.6 | Mapped (FINDING-6, 7) |
| AC-23 | 5.9 | factor-engine 2.4, 2.5 | every scored surface | Mapped |

---

## Pipeline Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No finding is CRITICAL. The one HIGH finding is FINDING-1, carried since
review v1, which is the owner's decision on the first-deployment backlog. No
HIGH finding lands on the rework. All ten findings it targeted are closed,
review v6's HIGH among them.

**Re-approval of the two reworked designs.** Nothing on system design v5 at
`sha256:2506b8ef…` or factor-engine v4 at `sha256:e2f91b6b…` is above MEDIUM,
so both are clear for the owner's re-approval at these revisions, with one
caveat. The coordinator states that the owner will confirm §6's disposition of
sets built before version 4 at re-approval. FINDING-47 shows that the sentence
the owner would confirm does not identify those sets correctly. Two paths:

- Correct the sentence first (with FINDING-48 and FINDING-49 in the same §6
  edit, FINDING-50 and FINDING-4 alongside) and obtain fresh review evidence.
  This review recommends that path, because the edit is small and the owner's
  confirmation should bind a correct rule.
- Re-approve now, confirming the disposition (keep and do not mark), and
  record that the identification rule is to be corrected at the next revision.

Any edit changes the content revision this report binds and needs a new
review. FINDING-51's test row can go in the same edit; its `artifacts` half is
a harness record change.

Re-approval mechanics, for the owner: both designs are `draft` and keep their
review-v5-era `approval` blocks, so re-approval is a direct edit of each block
per `docs/approval-gates.md`:

- `approved_at` must be later than this report's `generated` time;
- `review_artifact` must point here;
- `reviewed_revision` must be the revision above.

DEC-0398 is staged but not committed in the harness. It should be committed
with the records before S10 is planned. This report binds the other nine
subjects at their unchanged revisions. This review approves nothing.

---

## Recommendations

### Must Fix (CRITICAL and HIGH findings)

1. FINDING-1: decide which runs qualify at first deployment; align the
   scheduler, research-store, factor-engine §6 and system design §3.1.

### Should Fix (MEDIUM findings)

2. FINDING-47: identify version-4 sets by `corporate_actions_covered_by` or
   by `started_at`, before the owner confirms §6.
3. FINDING-5: after re-approval, refine epic E2, generate S10, and align the
   test specification with factor-engine §7.
4. FINDING-2, FINDING-6 to FINDING-16: as carried.

### Nice to Have (LOW findings)

5. FINDING-48, FINDING-49, FINDING-50, FINDING-4 and the §7 row of FINDING-51,
   in the same edit as item 2.
6. FINDING-51's `artifacts` entries, when DEC-0398 is committed.
7. FINDING-17 to FINDING-36 and FINDING-38, as listed.

---

## Follow-up Work (implementation drift, not findings)

Unchanged from review v6, with three additions for S10:

- `momentum_inputs.sql` writes `corporate_actions_covered_by` on `present` and
  `outdated` inputs.
- `tests/integration/test_engine_inputs_momentum.py` covers the new *Order of
  momentum causes* row.
- `docs/reference/classification-engine.md` gains the key in its momentum
  `detail` table at doc-sync.

## Observations Outside the Review Subjects

- **DEC-0398 is staged, not committed** in the harness worktree, while
  `aba5501` carries its trailer and both designs cite it.
- **CAP-001's design prose still contradicts the released coverage.**
  DEC-0398 records this as documentation drift outside the B3 lane, and
  DEC-0049's follow-up remains the vehicle for it.
- **§6's "version 3, in production as `factorflow` 0.2.0"** could not be
  verified: no CAP-002 release manifest exists in the repository.
- Review v6's observations on the UI's provider-holds-no-data wording,
  DEC-0241's status and the decision `commits` caches still stand.

## Run Record

The coordinator, through the parent thread, directed this run as
`$specification-review` for CAP-002, writing `specifications-review-report-v7.md`.
It used the same clone and rules as review v6: review only, no approval, no
design edits, commit the report, no push. No interactive input tool was
available, so the Step 6 question is returned to the coordinator.

`check-prerequisites.sh` exited 0. `pipeline-state.py` reported
`AWAITING-APPROVAL`, for the same reason as at review v6: the approval blocks
bind review v5. The missing evidence is what this review produces. No decision
record was written.

No other file was written. In particular:

- no specification, decision record, backlog item, test specification, code,
  CAP-001 or `docs/ux/` artifact was edited;
- no approval block was touched;
- no branch, stash or reset was made; the one commit adds this report;
- `build-architecture.py` ran without `-w`.
