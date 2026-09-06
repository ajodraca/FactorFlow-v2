---
artifact_schema_version: 1
artifact_id: CAP-001-backlog-review
artifact_type: backlog-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-06
document: backlog-review-report
capability: CAP-001
scope: epics
version: v1
generated: 2026-09-06T03:51:24Z
review_subjects:
  - artifact_id: CAP-001-backlog
    artifact_version: 1
    content_revision: sha256:c5ceb6f3f506a3bb7818b9ca67cef8bd398aad7575c3ee6254e2f5fc7ae2b30c
  - artifact_id: CAP-001-E1
    artifact_version: 1
    content_revision: sha256:7dbec6e46e8894a44584f3b215c8e36b7a3f3bcfd41436fda04b7fbc954e5ade
  - artifact_id: CAP-001-E2
    artifact_version: 1
    content_revision: sha256:43bf8fa5fa7cba21600db98b0a120f88f705c2a5d8facdb9668c6c96f868af26
  - artifact_id: CAP-001-E3
    artifact_version: 1
    content_revision: sha256:098c54a47f97030f409e3f88ae6351c25c94df7574eaeadb90c7a82bc6908e63
  - artifact_id: CAP-001-E4
    artifact_version: 1
    content_revision: sha256:ff6cee626fc87eb17bfc402db33b6967b3772899b4ed3636ee612d7747723cb6
  - artifact_id: CAP-001-E5
    artifact_version: 1
    content_revision: sha256:1f509403a913648f8d48697d57d56d25642bb6ec13396596d9c39088b516d128
  - artifact_id: CAP-001-E6
    artifact_version: 1
    content_revision: sha256:aabdcb03a95b274e431b9e99385acb524cbbc793cc62b11d0255f165ded1ac07
  - artifact_id: CAP-001-E7
    artifact_version: 1
    content_revision: sha256:d39982297623e5f9e48edc136a4b8f4cbea68e08910b5345865808ab0070e370
statistics:
  epics_reviewed: 7
  stories_reviewed: 0
  total_findings: 7
  critical: 0
  high: 1
  medium: 2
  low: 4
readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: backlog-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-06T03:51:24Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "6"
    - id: CAP-001-ux-design
      version: "approved"
    - id: CAP-001-backlog
      version: "1"
    - id: CAP-001-E1
      version: "1"
    - id: CAP-001-E2
      version: "1"
    - id: CAP-001-E3
      version: "1"
    - id: CAP-001-E4
      version: "1"
    - id: CAP-001-E5
      version: "1"
    - id: CAP-001-E6
      version: "1"
    - id: CAP-001-E7
      version: "1"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Backlog Review Report -- CAP-001

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-001 |
| **Scope** | epics |
| **EPICs Reviewed** | 7 |
| **Stories Reviewed** | 0 (not in scope) |
| **Total Findings** | 7 |
| **Readiness** | READY-WITH-WARNINGS |

CRITICAL 0 · HIGH 1 · MEDIUM 2 · LOW 4 · **total 7**

The epic backlog covers all 26 capability acceptance criteria, all six user
flows and all twelve components declared in the system design. The epic
boundaries follow three independent seams in the design that agree with one
another, which is a stronger basis than a single decomposition rationale.

One HIGH finding concerns sequencing rather than content: E7 owns the
application shell that E2, E5 and E6 all render inside, but none of those three
declares that dependency and the backlog's sequencing graph places E7 last.
Implementation planning that follows the stated order would schedule three
screen-delivering epics before the shell they need. This is correctable in the
dependency fields without changing any acceptance criterion.

## Review Scope

Reviewed the seven epic definitions under `epics/`, the `backlog.md` index, and
their alignment against `Capability-CAP-001.md` (v8), `design/system-design.md`
(v6), `design/ux-design.md`, and all twelve `design/component-design-*.md`
files. Stories are out of scope; none exist yet.

Revision digests for all eight backlog artifacts were captured via
`artifact-gate.py revision` and are recorded in `review_subjects`.
`check-artifacts.py --strict --allow-unchanged-legacy` exits 0 over the
capability directory, reporting 27 artifacts and 0 legacy artifacts.

**Reviewer independence.** This review was performed by the same agent lineage
that generated the epics, under the project's `owner-allowed` policy, which
permits the author and reviewer to be the same party. Independence here means
this is a distinct evidence-producing action against the current revisions, not
that a second party reviewed it. Findings below include defects in the
reviewer's own prior output, which is the standard this policy depends on.

---

## Findings by Dimension

### BR-1 Completeness

No findings. Every epic carries a summary with business value, actors, an
estimate, out-of-scope statements, dependencies, links to source sections,
goals, non-functional requirements, acceptance criteria in both categories, a
traceability table and open questions. No epic is a placeholder.

All six capability user flows map to at least one epic:

| Capability flow | Epic(s) |
|---|---|
| Acquire market data for the first time | E2, E3, E4, E5 |
| Confirm the data is fit to rely on | E6 |
| Diagnose and recover from a failed acquisition | E7, E5 |
| Stop an acquisition that is taking too long | E5 |
| Add an instrument after the first acquisition | E2, E4 |
| Operate and upgrade the running product | E1, E7 |

All twelve system-design components are represented across the epics.

### BR-2 Alignment with Upstream

FINDING-2 (MEDIUM) and FINDING-5 (LOW) apply. See the summary table.

No scope drift was found. Every epic goal and acceptance criterion traces to
capability or design content; no epic introduces an outcome the capability does
not carry. Component names, API paths, run states, error codes and endpoint
status codes used in the epics match the system design section 4.2 and the
component designs. Spot checks confirmed: the eight run states against
`component-design-run-journal.md` section 2.2, the `409 no_active_instruments`
and `409 history_depth_not_set` refusals against system design 5.18, the
four-error taxonomy against `component-design-massive-client.md` section 2.4,
and the gap-availability threshold of two instruments against
`component-design-coverage-service.md` section 2.3.

The dependency typing in capability section 5.1 is read correctly throughout.
Every epic that mentions Massive states that it is `requires-runtime` and binds
at integration; no epic treats a `conforms-to` target as a blocker. This was the
specific sequencing error the epic-generation guidance warns against, and the
backlog avoids it.

### BR-3 Coverage (Reverse Traceability)

No uncovered capability acceptance criteria. All 26 are assigned to at least one
epic, verified mechanically against the epic files rather than against the
backlog's own table. See the traceability matrix below.

FINDING-2 (MEDIUM) concerns the *precision* of the backlog's coverage table, not
a gap in coverage.

### BR-4 Testability

No findings. Every acceptance criterion states an observable outcome. A scan for
vague modifiers (`should`, `fast`, `appropriate`, `etc.`, `reasonable`,
`quickly`) across all 125 criteria returned nothing. Quantitative thresholds are
sourced rather than invented: 3000 instruments from AC-4, three retry attempts
from the owner decision of 2026-09-04, a 30-second health poll and 10-second run
poll from STD-UI-25, and the two-instrument gap-detection floor from the
coverage-service design.

FINDING-6 (LOW) notes the one criterion whose measurability depends on an
unanswered upstream question.

### BR-5 Single-Component Scoping

Not applicable at epic scope. This dimension governs stories, which do not yet
exist. Recorded here so the next review at `epics-and-stories` scope has the
baseline: several epics deliberately span components (E2 spans
`instrument-list-service`, `ingestion-api` and `owner-web-app`), which is
correct for an epic and must be decomposed to single-component stories later.

### BR-6 Consistency and Sequencing

FINDING-1 (HIGH), FINDING-3 (MEDIUM) and FINDING-4 (LOW) apply.

Verified clean: epic IDs are unique and follow `<capability-id>-E<n>`; directory
slugs are kebab-case and match their titles; `backlog.md` counts reconcile
exactly against the files (7 epics claimed and found, 99 derived criteria
claimed and found, per-epic counts of 11, 12, 14, 15, 17, 14 and 16 all
matching); every derived criterion carries a `(traces to: AC-n)` annotation;
derived numbering is sequential within each epic with no gaps, duplicates or
cross-epic leakage. The declared dependency graph is acyclic.

---

## Findings Summary Table

| ID | Severity | Dimension | Artifact | Location | Description | Impact | Recommendation |
|----|----------|-----------|----------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | BR-6 | CAP-001-E2, E5, E6, E7, backlog | Dependencies fields; backlog sequencing graph | E7 delivers the application shell and status region (DAC-E7-9, DAC-E7-15) that every screen in E2, E5 and E6 renders inside. None of the three declares a dependency on E7, and the sequencing graph places E7 last. E7 itself notes the shell "is consumed by E2, E5 and E6", so the relationship is known but recorded only in the consumed direction | Implementation planning that follows the stated order schedules three screen-delivering epics before the shell they require, or duplicates shell work across them | Either split the shell into its own early epic, or add it to E1, or declare the E2, E5 and E6 dependency on E7 explicitly and redraw the sequencing graph. No acceptance criterion changes either way |
| FINDING-2 | MEDIUM | BR-2, BR-3 | CAP-001-backlog | Full Traceability table | Six rows list an epic that contributes only via a derived criterion, not via a restated capability criterion: AC-2 lists E4 and E5, AC-4 lists E3, AC-11 lists E4, AC-13 lists E7, AC-14 lists E7, AC-25 lists E4. Each is genuinely covered (verified: DAC-E4-8, DAC-E4-13, DAC-E5-14, DAC-E3-6/7/9, DAC-E4-10, DAC-E7-4/7/16, DAC-E7-15, DAC-E4-12), so no coverage gap exists | A reader reconciling the table against an epic's "From Capability" section finds an apparent mismatch and must re-derive the link by hand | Mark contributions-via-derived distinctly in the table, for example "E4 (derived)", so the table distinguishes restatement from elaboration |
| FINDING-3 | MEDIUM | BR-6 | CAP-001-E5, E6 | Dependencies fields | E5 states "E4 consumes this EPIC's claim contract and can be developed in parallel against it" and E6 states its read contract "can be developed against in parallel with E4". Both are reasonable, but the parallelism is asserted in the dependent's own file rather than agreed in both, and the sequencing graph does not show it | A planner reading only the graph sequences E4 before E5 and E6 strictly, losing intended parallelism and lengthening the critical path | State the parallelisable pairs once in `backlog.md` sequencing, with the contract that makes each safe, rather than in one side's dependency prose |
| FINDING-4 | LOW | BR-6 | CAP-001-E1 through E7 | Estimate fields | Estimates are recorded as t-shirt sizes with no basis stated. E4 is XL and E2 and E7 are M, but nothing records what distinguishes them, so the sizes cannot be checked or re-derived | Sizes may be taken as authoritative in planning when they are unexplained judgement | Record one line per epic on what drives its size, or state explicitly that sizes are indicative only pending story decomposition |
| FINDING-5 | LOW | BR-2 | harness documentation | backlog-review-rubric BR-2; epic-generation constraint 6 | The rubric requires derived criteria to use `AC-N.M` numbering; the epic-generation skill mandates `DAC-E<n>-<m>` and explains why (global uniqueness, no collision with capability criteria). The epics follow the generating skill. The templates disagree with each other, not with the artifacts | A future reviewer applying the rubric literally would raise a false finding against conforming epics | Reconcile the two harness documents. The `DAC-E<n>-<m>` convention is the better-reasoned of the two and is what the artifacts use |
| FINDING-6 | LOW | BR-4 | CAP-001-E4 | AC-4, open questions | AC-4 is restated as completing a 3000-instrument run "without manual intervention", which is observable, but no duration bound exists. The epic records this honestly as an open question carried from capability section 7 | A run taking many hours satisfies the criterion as written. Test design cannot set a timeout without inventing one | No change to the epic. The question belongs to the capability layer and is correctly recorded rather than answered here |
| FINDING-7 | LOW | BR-2 | upstream component designs | component-design-*.md section 13 tables | AC-24, AC-25 and AC-26 are addressed in the bodies of `component-design-acquisition-runner.md`, `component-design-ingestion-api.md`, `component-design-instrument-list-service.md` and `component-design-run-journal.md`, but do not appear in those components' section 13 traceability tables. The three criteria were added to the capability after those tables were written. The epics trace them correctly | No impact on this backlog. The component designs' traceability tables understate their own coverage | Raise against the component design layer. Not a blocker for epic approval or for story generation |

---

## Traceability Matrix

Coverage verified against the epic files directly. "Restated" means the epic
lists the criterion under "From Capability"; "derived" means it contributes
through a derived criterion tracing to it.

| Capability AC | EPIC(s) | Story(ies) | Status |
|---------------|---------|------------|--------|
| AC-1 Named instrument list | E2 | n/a | Covered |
| AC-2 History depth stated | E2; E4, E5 (derived) | n/a | Covered |
| AC-3 Data types acquired | E3, E4 | n/a | Covered |
| AC-4 Acquisition volume 3000 | E4; E3 (derived) | n/a | Covered |
| AC-5 Point-in-time record | E3, E4 | n/a | Covered |
| AC-6 Re-run safety | E4 | n/a | Covered |
| AC-7 Coverage visibility | E6 | n/a | Covered |
| AC-8 Gap visibility | E6 | n/a | Covered |
| AC-9 Honest run outcome | E5 | n/a | Covered |
| AC-10 Failure diagnosis | E7 | n/a | Covered |
| AC-11 Unrecognised instrument | E3, E7; E4 (derived) | n/a | Covered |
| AC-12 No false history | E4, E6 | n/a | Covered |
| AC-13 Credential handling | E1, E3; E7 (derived) | n/a | Covered |
| AC-14 Network exposure | E1; E7 (derived) | n/a | Covered |
| AC-15 Forward data evolution | E1 | n/a | Covered |
| AC-16 Refuse inconsistent start | E1, E7 | n/a | Covered |
| AC-17 Honest empty state | E6 | n/a | Covered |
| AC-18 Operational visibility | E7 | n/a | Covered |
| AC-19 Cancel a run in progress | E5 | n/a | Covered |
| AC-20 Interrupted run unblocks | E5 | n/a | Covered |
| AC-21 Removal retains history | E2, E6 | n/a | Covered |
| AC-22 Deepening backfills | E4, E6 | n/a | Covered |
| AC-23 Concurrent requests queue | E5 | n/a | Covered |
| AC-24 Empty run refused | E5 | n/a | Covered |
| AC-25 Retiring from next run | E2; E4 (derived) | n/a | Covered |
| AC-26 Queued run cancellable | E5 | n/a | Covered |

**26 of 26 capability acceptance criteria covered. No UNCOVERED-AC findings.**

---

## Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

No CRITICAL findings. One HIGH finding exists and does not block story
generation.

The backlog is complete against its upstream layers and internally consistent.
Every capability acceptance criterion is covered, every user flow and component
is represented, the derived criteria are well-formed and traceable, the backlog
index reconciles exactly against the files, and the declared dependency graph is
acyclic. Every quantitative threshold traces to a sourced decision rather than
to invention.

FINDING-1 is HIGH because it would misdirect implementation sequencing, not
because the work is missing or wrong. The shell is specified, owned and
traceable; only its position in the order is inconsistent between E7 and its
three consumers. It is correctable in the dependency fields and the sequencing
graph without touching any acceptance criterion, and it should be fixed before
implementation planning consumes the sequencing.

The three MEDIUM and LOW findings on traceability precision, parallelism
recording and estimate basis reduce the backlog's usability as a planning
instrument without affecting its correctness. FINDING-5 and FINDING-7 are
defects in harness documentation and in the upstream component designs
respectively, not in these epics.

---

## Recommendations

### Must Fix (CRITICAL and HIGH)

1. **FINDING-1** — Resolve the application-shell sequencing. Preferred option:
   move the shell and status region into E1, which already delivers the
   runnable foundation and has no dependants blocking it, leaving E7 to own run
   detail and failure presentation. Alternatives are a dedicated shell epic or
   explicit E2, E5 and E6 dependencies on E7 with the sequencing graph redrawn.
   Whichever is chosen, `backlog.md` sequencing must agree with the epics'
   dependency fields.

### Should Fix (MEDIUM)

2. **FINDING-2** — Mark derived contributions distinctly in the backlog
   traceability table so restatement and elaboration are distinguishable.
3. **FINDING-3** — Record the parallelisable epic pairs and their enabling
   contracts once in `backlog.md`, rather than in one side's dependency prose.

### Nice to Have (LOW)

4. **FINDING-4** — State the basis for each t-shirt estimate, or mark the
   estimates indicative pending story decomposition.
5. **FINDING-5** — Reconcile the derived-criterion numbering convention between
   the backlog-review rubric and the epic-generation skill. Harness change, not
   an artifact change.
6. **FINDING-6** — No action in this backlog. The duration question belongs to
   the capability layer and is correctly carried as an open question.
7. **FINDING-7** — Raise the missing AC-24, AC-25 and AC-26 rows against the
   component designs' section 13 traceability tables. Upstream change, not a
   blocker here.

---

## Approval

This report is review evidence. It is not an approval.

Approving these epics requires an explicit owner action per
`docs/approval-gates.md`, recorded against the exact content revisions listed in
`review_subjects` above. Editing any reviewed artifact invalidates that revision
binding and requires a new review.

A READY-WITH-WARNINGS verdict permits story generation to proceed at the owner's
discretion. If the owner prefers to approve while FINDING-1 remains open, that
is a deliberate acceptance rather than an implicit one, and the expiring waiver
process in `docs/approval-gates.md` is the documented route. No waiver has been
created by this review.
