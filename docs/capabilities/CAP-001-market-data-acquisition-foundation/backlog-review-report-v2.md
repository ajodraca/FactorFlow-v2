---
artifact_schema_version: 1
artifact_id: CAP-001-backlog-review
artifact_type: backlog-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-06
document: backlog-review-report
capability: CAP-001
scope: epics
version: v2
generated: 2026-09-06T04:01:12Z
review_subjects:
  - artifact_id: CAP-001-backlog
    artifact_version: 1
    content_revision: sha256:020071550dddd716949ded7fcec63caa2e819c31e5e9c259a424cb6e6f9767a7
  - artifact_id: CAP-001-E1
    artifact_version: 1
    content_revision: sha256:532233d2663befa0140269e31d16f655964f1ab8d51f5cb53b636fd47d325638
  - artifact_id: CAP-001-E2
    artifact_version: 1
    content_revision: sha256:6bdf7d5413365d0ee6944ad9d0b032c0429bab73f19f956031ae1f482fa933a7
  - artifact_id: CAP-001-E3
    artifact_version: 1
    content_revision: sha256:098c54a47f97030f409e3f88ae6351c25c94df7574eaeadb90c7a82bc6908e63
  - artifact_id: CAP-001-E4
    artifact_version: 1
    content_revision: sha256:ff6cee626fc87eb17bfc402db33b6967b3772899b4ed3636ee612d7747723cb6
  - artifact_id: CAP-001-E5
    artifact_version: 1
    content_revision: sha256:89a61d3115239f52236505c3a76e63a5175fd0df930cba1c1049a6ff306baf13
  - artifact_id: CAP-001-E6
    artifact_version: 1
    content_revision: sha256:af5d665847bf6951e426cd93e7b5b8fff62c5bacad627c7a00ec293063dfa6b2
  - artifact_id: CAP-001-E7
    artifact_version: 1
    content_revision: sha256:1baa39635fcbe352717f4991f4263d0f897691bda3cfb9714ed6aa43914470bf
statistics:
  epics_reviewed: 7
  stories_reviewed: 0
  total_findings: 4
  critical: 0
  high: 0
  medium: 1
  low: 3
readiness: READY
ai_provenance:
  agent_id: backlog-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-06T04:01:12Z
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
| **Total Findings** | 4 |
| **Readiness** | READY |

CRITICAL 0 · HIGH 0 · MEDIUM 1 · LOW 3 · **total 4**

This is the second review of the CAP-001 epic backlog. It supersedes v1, which
returned READY-WITH-WARNINGS against earlier revisions of five artifacts. The
HIGH finding v1 raised, and one of its two MEDIUM findings, were addressed in
the backlog between the two reviews; this review verifies the fixes against the
current content revisions rather than accepting them as reported.

No CRITICAL and no HIGH findings remain. The application-shell sequencing defect
is resolved: the shell now sits in E1, which nothing blocks, and the four
screen-delivering epics declare their dependency on it. One MEDIUM and three LOW
findings carry forward unchanged, none of which blocks story generation.

## Review Scope

Reviewed the seven epic definitions under `epics/` and the `backlog.md` index at
the revisions recorded in `review_subjects`, against `Capability-CAP-001.md`
(v8), `design/system-design.md` (v6), `design/ux-design.md`, and all twelve
`design/component-design-*.md` files. Stories remain out of scope; none exist.

Revision digests were recaptured via `artifact-gate.py revision` after the
changes. Five of the eight artifacts changed since v1 (E1, E2, E5, E6, E7 and
`backlog.md`); E3 and E4 are byte-identical to the revisions v1 reviewed, and
their digests below match v1's exactly.

`check-artifacts.py --strict --allow-unchanged-legacy` exits 0 over the
capability directory: 28 artifacts, 0 legacy.

**Reviewer independence.** Performed by the same agent lineage that generated
and then repaired the epics, under the project's `owner-allowed` policy. The
evidentiary value here rests on the checks being mechanical and re-runnable
against named revisions, not on separation of parties. Where this review
verifies a fix, it states what was checked rather than that the fix was
reported.

---

## Verification of v1 Findings

| v1 Finding | v1 Severity | Status | Evidence |
|---|---|---|---|
| FINDING-1 Application shell sequencing | HIGH | **Resolved** | The shell moved from E7 to E1. E1 now carries DAC-E1-12 (four destinations, no principal assumed), DAC-E1-13 (status region on every screen, 30s poll), DAC-E1-14 (sized for a third line), DAC-E1-15 (named unreachable state), DAC-E1-16 (health liveness, database, credential presence, schema version) and DAC-E1-17 (renders before any run exists). E2, E5 and E6 each name E1's shell in their Dependencies field. E7's Out of Scope now excludes the shell and its DAC-E7-8 is narrowed to the most-recent-run field only. `backlog.md` sequencing states why the shell sits in E1 |
| FINDING-2 Derived contributions unmarked | MEDIUM | **Resolved** | All six affected rows now carry an explicit `(derived)` marker: AC-2 `E2; E4, E5 (derived)`, AC-4 `E4; E3 (derived)`, AC-11 `E3, E7; E4 (derived)`, AC-13 `E1, E3; E7 (derived)`, AC-16 `E1; E7 (derived)`, AC-25 `E2; E4 (derived)`. The convention is stated above the table |
| FINDING-3 Parallelism recorded one-sidedly | MEDIUM | Carried forward | Unchanged. See FINDING-1 below |
| FINDING-4 Estimates lack stated basis | LOW | Carried forward | Unchanged. E1 remains L despite absorbing the shell; see FINDING-2 below |
| FINDING-5 Numbering convention conflict | LOW | Carried forward | Harness documentation, unchanged by this edit |
| FINDING-6 AC-4 has no duration bound | LOW | Carried forward | Capability-layer question, correctly still recorded as open |
| FINDING-7 Component designs' §13 tables | LOW | Carried forward | Upstream, unchanged |

Findings are renumbered in this report. The mapping above is the authoritative
correspondence to v1.

---

## Findings by Dimension

### BR-1 Completeness

No findings. All seven epics remain substantively populated. E1 gained a goals
entry, three non-functional requirements covering accessibility, vocabulary and
spacing, one capability criterion and six derived criteria; E7 lost four derived
criteria and one capability criterion and remains complete in every section.

All six capability user flows still map to at least one epic, with one
improvement: flow 6, "Operate and upgrade the running product", is now more
fully served by E1 alone, since the owner can see the product started without
waiting on E7.

### BR-2 Alignment with Upstream

FINDING-3 (LOW) applies, carried forward.

The shell content moved with its grounding intact. DAC-E1-12 through DAC-E1-17
cite `ux-design.md` section 0 and section 2 and `component-design-owner-web-app.md`
sections 2.2 and 2.3, which are the sections that specify the shell. E1's Links
field was extended to name them. No shell criterion lost its source when it
moved.

The split of `GET /api/health` between the two epics is consistent in both
directions: DAC-E1-16 claims liveness, database reachability, credential presence
and schema version, and states that the most-recent-run field is E7's; DAC-E7-8
claims exactly that field and states that the rest is E1's. Neither claims the
whole payload, and together they cover the five fields
`component-design-ingestion-api.md` section 11 specifies.

AC-18's division is stated in both epics. E1 restates the liveness half and says
the run half is E7's; E7 restates the criterion in full and its traceability row
names the shell as E1's. This is a shared criterion recorded explicitly rather
than a duplication.

### BR-3 Coverage (Reverse Traceability)

No findings. All 26 capability acceptance criteria remain covered, verified
mechanically against the epic files. AC-14 and AC-16 moved from being covered by
two epics to being covered by E1 with an E7 derived contribution, which the
backlog table now marks. No criterion lost coverage in the move.

### BR-4 Testability

No findings. The six criteria added to E1 state observable outcomes: four
destinations in a named order, a 30-second poll interval, a named unreachable
state, four specific health fields, and correct rendering before any run exists.
A repeated scan for vague modifiers across all 127 criteria returned nothing.

### BR-5 Single-Component Scoping

Not applicable at epic scope; recorded for the next review. E1 now spans
`market-data-store`, `schema-migrator`, `runtime-config`, `owner-web-app` and
`ingestion-api`, which is a wider span than before and correct for an epic. Its
story decomposition must separate the shell stories from the schema and
migration stories, since they are different components in different languages.

### BR-6 Consistency and Sequencing

FINDING-2 (LOW) applies, carried forward. FINDING-1 (MEDIUM) applies, carried
forward.

Verified clean after the change: derived numbering is sequential with no gaps in
every epic (E1 1..17, E2 1..12, E3 1..14, E4 1..15, E5 1..17, E6 1..14, E7 1..12,
101 total), no epic references another epic's derived identifiers, every derived
criterion carries a `(traces to: AC-n)` annotation, and `backlog.md`'s per-epic
counts and total match the files exactly. E7's renumbering after removing four
criteria left no dangling references.

The dependency graph remains acyclic with the shell edges added: E1 depends on
nothing; E2 and E3 on E1; E4 on E1, E2 and E3; E5 on E1 and E2; E6 on E1 and E4;
E7 on E1 and E5. E1 is now the only epic that can start first, which was already
true and is now true for two reasons rather than one.

---

## Findings Summary Table

| ID | Severity | Dimension | Artifact | Location | Description | Impact | Recommendation |
|----|----------|-----------|----------|----------|-------------|--------|----------------|
| FINDING-1 | MEDIUM | BR-6 | CAP-001-E5, E6, backlog | Dependencies fields; sequencing bullets | E5 states "E4 consumes this EPIC's claim contract and can be developed in parallel against it" and E6 states its read contract "can be developed against in parallel with E4". Both parallelisms are asserted in one side's prose rather than agreed in both files, and the sequencing graph does not show them | A planner reading the graph alone sequences E4 strictly before E5 and E6, losing intended parallelism and lengthening the critical path unnecessarily | State the parallelisable pairs and their enabling contracts once in `backlog.md` sequencing, so the graph and the prose agree |
| FINDING-2 | LOW | BR-6 | CAP-001-E1 through E7 | Estimate fields | Estimates remain t-shirt sizes with no stated basis. E1 absorbed the application shell, six derived criteria and two components in this revision and is still L, which may or may not be right but cannot be checked | Sizes may be read as authoritative when they are unexplained judgement, and E1's size no longer reflects a re-derivation after its scope grew | Record one line per epic on what drives its size, or mark the sizes indicative pending story decomposition. E1 in particular is worth re-checking now that it carries the shell |
| FINDING-3 | LOW | BR-2 | harness documentation | backlog-review-rubric BR-2; epic-generation constraint 6 | The rubric requires `AC-N.M` numbering for derived criteria; the epic-generation skill mandates `DAC-E<n>-<m>` and explains why. The epics follow the generating skill. The two harness documents disagree with each other, not with the artifacts | A future reviewer applying the rubric literally raises a false finding against conforming epics | Reconcile the two documents. `DAC-E<n>-<m>` is the better-reasoned convention and is what the artifacts use |
| FINDING-4 | LOW | BR-2 | upstream component designs | component-design-*.md section 13 tables | AC-24, AC-25 and AC-26 are addressed in the bodies of `component-design-acquisition-runner.md`, `component-design-ingestion-api.md`, `component-design-instrument-list-service.md` and `component-design-run-journal.md` but absent from those components' section 13 traceability tables, having been added to the capability after those tables were written | No impact on this backlog. The component designs understate their own coverage | Raise against the component design layer. Not a blocker for epic approval or story generation |

Two findings closed since v1: the application-shell sequencing defect (HIGH) and
the unmarked derived contributions in the backlog traceability table (MEDIUM).

---

## Traceability Matrix

Verified against the epic files. "(derived)" means the epic contributes through
a derived criterion rather than restating the capability criterion.

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
| AC-14 Network exposure | E1 | n/a | Covered |
| AC-15 Forward data evolution | E1 | n/a | Covered |
| AC-16 Refuse inconsistent start | E1; E7 (derived) | n/a | Covered |
| AC-17 Honest empty state | E6; E1 (derived) | n/a | Covered |
| AC-18 Operational visibility | E1, E7 | n/a | Covered |
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

**Verdict:** READY

No CRITICAL and no HIGH findings. The backlog is aligned with its upstream
layers, internally consistent, and complete for implementation planning.

The v1 HIGH finding is resolved in substance rather than in wording. The shell
did not merely change owner: its six derived criteria carry their design
citations, the health endpoint is split between E1 and E7 with each stating what
the other owns, the four screen-delivering epics declare the dependency, and the
backlog records why the shell sits in E1. The failure mode v1 identified, three
screen epics scheduled ahead of the frame they render inside, cannot now arise
from following the stated sequencing.

The one MEDIUM finding concerns how parallelism is recorded rather than whether
the work is right, and a planner who follows the sequencing conservatively
produces a correct but slower plan rather than a wrong one. The three LOW
findings are an unexamined estimate basis, a harness documentation conflict, and
an upstream traceability gap in the component designs.

Story generation may proceed.

---

## Recommendations

### Must Fix (CRITICAL and HIGH)

None.

### Should Fix (MEDIUM)

1. **FINDING-1** — Record the parallelisable epic pairs and the contracts that
   make each safe once in `backlog.md` sequencing, so the graph and the epics'
   dependency prose agree.

### Nice to Have (LOW)

2. **FINDING-2** — State the basis for each estimate, or mark them indicative.
   Re-check E1 specifically, which absorbed the shell in this revision without a
   size change.
3. **FINDING-3** — Reconcile the derived-criterion numbering convention between
   the backlog-review rubric and the epic-generation skill. Harness change.
4. **FINDING-4** — Raise the missing AC-24, AC-25 and AC-26 rows against the
   component designs' section 13 traceability tables. Upstream change.

---

## Approval

This report is review evidence. It is not an approval.

Approving these epics requires an explicit owner action per
`docs/approval-gates.md`, recorded against the exact content revisions listed in
`review_subjects` above. Those revisions differ from the ones v1 reviewed for
five of the eight artifacts, so v1 is superseded and must not be used as the
approval basis. Editing any reviewed artifact after this point invalidates the
binding again and requires a further review.

A READY verdict with no CRITICAL or HIGH findings needs no waiver. The MEDIUM
and LOW findings above may be accepted as recorded, or addressed first at the
owner's discretion.
