---
artifact_schema_version: 1
artifact_id: CAP-001-backlog-review
artifact_type: backlog-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-06
document: backlog-review-report
capability: CAP-001
scope: epics
version: v3
generated: 2026-09-06T09:45:00Z
review_subjects:
  - artifact_id: CAP-001-backlog
    artifact_version: 1
    content_revision: sha256:ed00937dd9578b7d44b90393f553efcd18f04e5ffdeba9b922b27f862df89046
  - artifact_id: CAP-001-E1
    artifact_version: 1
    content_revision: sha256:ac180525d8df5f6890eb1b6a206052c9de0fdef5bde60b06b896b5f37cca05f9
  - artifact_id: CAP-001-E2
    artifact_version: 1
    content_revision: sha256:5eb617f46ac3c4e667bbc1fb37cd24db5415c9fe433e37af631bb08335d0b1c3
  - artifact_id: CAP-001-E3
    artifact_version: 1
    content_revision: sha256:5d534685148014ad16093712059141d733f741af10aec7795edbd7ab0a735784
  - artifact_id: CAP-001-E4
    artifact_version: 1
    content_revision: sha256:a816f4bf64213fd69a69d7c7f619464fb7eadd9243869c53bcccfb551f723c27
  - artifact_id: CAP-001-E5
    artifact_version: 1
    content_revision: sha256:561f2ee746da9e72a559b4f6cc6732a7f695d4121db3078f85a3b0ad86961f74
  - artifact_id: CAP-001-E6
    artifact_version: 1
    content_revision: sha256:3e7daa33528721b180ad98010ae36bd13060971883639fee63210a364861dda0
  - artifact_id: CAP-001-E7
    artifact_version: 1
    content_revision: sha256:4872a958240fa6573faee6d700d33b65129934e0c324ee3b8a4e9f9865156397
statistics:
  epics_reviewed: 7
  stories_reviewed: 0
  total_findings: 5
  critical: 0
  high: 0
  medium: 2
  low: 3
readiness: READY
ai_provenance:
  agent_id: backlog-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-06T09:45:00Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "6"
    - id: CAP-001-ux-design
      version: "5"
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
| **Stories Reviewed** | 0 |
| **Total Findings** | 5 |
| **Readiness** | READY |

CRITICAL 0 · HIGH 0 · MEDIUM 2 · LOW 3 · **total 5**

## Review Scope

This is the third backlog review of CAP-001's epics. It re-reviews the seven
epic files and `backlog.md` at their current content revisions, listed in
`review_subjects`.

**Why a new version was required.** All eight artifacts carry content revisions
different from those v2 reviewed, so v2 no longer binds and the derived pipeline
state reports epic generation as `RESUME` pending a covering review. The change
in every case is confined to two things: the `approval` block added when the
owner approved the epics on 2026-09-06T04:04:42Z against v2, and the `## Stories`
section, which story generation populated in place of the placeholder line "To be
populated by the story generation agent." Verified by diffing every epic against
commit `af229e8`, the revision v2 reviewed: no goal, non-functional requirement,
acceptance criterion, dependency, traceability row or open question was altered
in any epic. The epic bodies this review assesses are byte-identical to those v2
assessed.

**Scope is `epics`, not `epics-and-stories`.** Thirty-six story files exist on
disk, added by commit `0fe4e4a`. They are outside this review. The derived state
reports `story-generation: BLOCKED — epic generation is not complete`, because
the epic gate has no covering review; a story-scope review cannot be produced
until this report is approved and the gate clears. The stories were neither read
nor assessed here, and nothing in this report constitutes evidence about them.

Artifacts read for context: `Capability-CAP-001.md` (v8), `design/system-design.md`
(v6), `design/ux-design.md` (v5), `design/ux-brief.md` and all twelve
`design/component-design-*.md` files.

`python3 scripts/check-artifacts.py --project factorflow-v2 --artifact
docs/capabilities/CAP-001-market-data-acquisition-foundation --strict
--allow-unchanged-legacy` exits 0 across all 65 artifacts, reporting no schema,
pin-staleness or traceability error. No checker output was omitted.

---

## Findings by Dimension

### BR-1 Completeness

No findings. Every epic carries a summary, actors, estimate, explicit out-of-scope
list, dependencies, links to the design sections it derives from, goals,
non-functional requirements, capability and derived acceptance criteria, a
traceability table and open questions. No epic is a placeholder. The seven epics
between them account for all six capability user flows: first acquisition (E2,
E3, E4), confirming data is fit to rely on (E6), diagnosing a failed acquisition
(E5, E7), stopping a run under way (E5), adding an instrument afterwards (E2, E4)
and operating and upgrading the product (E1).

Non-functional coverage is specific rather than nominal. E4 fixes the hashing
canonicalisation (sorted-key JSON, no whitespace, decimals as strings, SHA-256);
E3 fixes the retry budget at three attempts with full jitter and a bounded
throttle wait; E1 states the advisory-lock serialisation of migration. Where a
threshold is genuinely unfixed, the epic says so rather than inventing one: E4
records that no duration target exists for a 3000-instrument run and that AC-4
therefore constrains completeness but not time.

### BR-2 Alignment with Upstream

**FINDING-1 (MEDIUM).** Five epics restate a capability acceptance criterion
under its own `[AC-N]` label in narrowed or altered wording, so the text under
the capability's identifier is not the capability's text:

- `CAP-001-E3` AC-5 reads "Every acquired value MUST be recorded with the date on
  which it was known. The provider's own filing date MUST NOT serve as that
  date." The capability's AC-5 second clause is "and a run returning a restated
  value for a date already held MUST add a record rather than replace the
  existing one." The filing-date prohibition is real and correct, but it is
  `DAC-E4-1`, a derived criterion, not capability AC-5.
- `CAP-001-E3` AC-13 drops "MUST be supplied at runtime from the environment, and
  MUST NOT appear in the repository", keeping only the log-and-view half.
- `CAP-001-E7` AC-11 reads "The run MUST report an instrument the provider does
  not recognise, distinguishably from other failures", dropping "and MUST
  continue acquiring the remaining instruments".
- `CAP-001-E6` AC-22 reads "An instrument whose coverage falls short of the
  stated history depth MUST be identifiable as such", which is the visibility
  consequence, not the capability's backfill obligation.
- `CAP-001-E2` AC-25 drops the capability's second sentence retaining
  observations written before the run ends.

In each case the narrowing is deliberate and the omitted half is genuinely
delivered by another epic: AC-5's restatement clause by E4, AC-13's environment
half by E1, AC-11's continue-the-run half by E3, AC-22's backfill by E4, AC-25's
retention by E2's own AC-21. The reverse-traceability check below confirms no
half is lost. The defect is presentational and consistent: E1 handles the same
situation correctly, appending to its AC-18 the sentence "The most-recent-run
half of this criterion is delivered by E7, which owns the run records it
reports." The five epics above make the same split silently. A reader diffing an
epic's `[AC-5]` against the capability's AC-5 finds a mismatch with nothing
explaining it, and a downstream consumer treating the epic text as authoritative
for that identifier would implement a weaker criterion than the capability
states.

Not HIGH: no criterion is contradicted, none is dropped from the backlog, and
the backlog traceability table records the multi-epic assignments correctly.

**No scope drift.** Every epic goal and derived criterion traces to a capability
criterion or an explicit design decision. Spot-checked the ones most likely to
drift: E3's `DAC-E3-10` (CIK and FIGI identity) is grounded in system design 6.2;
`DAC-E3-11` (delisted instruments remain acquirable) in 6.3 and the capability's
survivorship concern; E6's `DAC-E6-6` (the product must not claim to detect a
market-wide outage) is a correct honesty constraint following from `DAC-E6-2`'s
derived trading-day set rather than an invented requirement.

**No cross-layer inconsistency.** Component names in every epic match the twelve
component designs. API paths spot-checked against system design 4.2 and
`component-design-ingestion-api.md` section 11: `/api/health`,
`/api/instruments`, `POST /api/instruments`, `DELETE /api/instruments/{symbol}`,
`GET`/`PUT /api/settings/history-depth` all match, including the `201`/`409`/`422`
and `404`/`409` status semantics in `DAC-E2-4` and `DAC-E2-5`. Run states in
`DAC-E5-1` match `component-design-run-journal.md`.

**Derived-criterion numbering is correct.** All 101 derived criteria use
`DAC-E<n>-<m>` and every one carries a `(traces to: AC-N)` annotation; zero
omissions. This is the convention `epic-generation` constraint 6 mandates. The
backlog-review rubric's BR-2 text specifies `AC-N.M`, which the artifacts do not
use and should not; see FINDING-4.

### BR-3 Coverage (Reverse Traceability)

No findings. All 26 capability acceptance criteria are covered. Each was checked
against every epic for both a `From Capability` restatement and a `traces to:`
annotation on a derived criterion; the full result is the traceability matrix
below. There are no `UNCOVERED-AC` findings.

Coverage of the criteria added latest to the capability, and so most at risk of
being missed, is present and specific: AC-24 in `DAC-E5-14` (the start endpoint
refuses and creates no run, naming which precondition failed), AC-25 in
`DAC-E4-12` (roster read once at claim time) and `DAC-E2-11`, AC-26 in
`DAC-E5-8` (a requested run cancels by direct transition, leaving an active run
unaffected).

Every component in system design 4.1 that requires work is claimed by an epic:
market-data-store, schema-migrator, runtime-config and owner-web-app shell by E1;
instrument-list-service by E2; massive-client and rate-limit-governor by E3;
acquisition-runner and observation-writer by E4; run-journal by E5;
coverage-service by E6; ingestion-api across E1, E2, E5 and E7.

### BR-4 Testability

No findings at epic level. Criteria state observable outcomes with concrete
boundaries: `DAC-E2-4` fixes exact status codes per input class; `DAC-E3-8` fixes
the attempt limit at a configured default of 3; `DAC-E1-13` fixes the health poll
at 30 seconds; `DAC-E6-4` fixes the threshold below which gap detection reports
unavailable at fewer than two instruments holding data. Where the capability
itself leaves a value open, the epic names the gap rather than papering over it
(E4's duration open question).

The vague-modifier sweep found no "should", "fast", "appropriate" or "etc." used
as a requirement in any criterion.

### BR-5 Single-Component Scoping

Not applicable at `epics` scope; this dimension governs stories. Recorded for
the story-scope review: `backlog.md` states every story is scoped to the single
writable repository `FactorFlow-v2`, with the twelve component names as modules
within it, and that no story spans both Python and TypeScript. That claim is
untested here and must be verified when the stories are reviewed.

### BR-6 Consistency and Sequencing

**FINDING-2 (MEDIUM).** `CAP-001-E1`'s document heading is "Runnable Foundation
and Schema". Its own frontmatter summary, and the `backlog.md` epic table, both
name it "Runnable Foundation, Schema and Application Shell". The application
shell was moved into E1 by commit `af229e8` in response to v1's HIGH sequencing
finding; the summary, out-of-scope list, goals, criteria and story list were all
updated, and the heading was not. A reader scanning headings sees an epic that
does not appear to own the shell, which is precisely the fact v1's finding
existed to make visible.

**FINDING-3 (LOW).** Estimates remain unexplained t-shirt sizes. Carried from v2
FINDING-2, unchanged. E1 absorbed the application shell and six derived criteria
and remained `L`. The story decomposition now on disk assigns E1 24 points across
6 stories against E4's 32 across 7, which is consistent with `L` against `XL`,
but that reconciliation is not recorded in the epics and the sizes still cannot
be checked from the epic files alone.

**IDs and counts are consistent.** Epic IDs `CAP-001-E1` through `E7` are unique
and conform to `<capability>-E<n>`. Derived criterion counts per epic —
17/12/14/15/17/14/12 — match the `backlog.md` derived-criteria table exactly and
total the 101 it declares. Story counts and points declared in each epic's
`## Stories` section (6/24, 4/16, 5/20, 7/32, 6/28, 4/18, 4/13) match the
`backlog.md` epic table row for row, and sum to the 36 stories and 151 points it
states.

**Dependencies are declared and acyclic.** Verified as a graph: E1 depends on
nothing; E2 and E3 on E1; E4 on E1, E2, E3; E5 on E1, E2; E6 on E1, E4; E7 on
E1, E5. No cycle exists. The declared dependencies match the `backlog.md`
sequencing diagram.

**v2 FINDING-1 is resolved.** The parallelisable pairs and their enabling
contracts are now stated in `backlog.md` sequencing: E2 and E3 parallel after E1;
E5 alongside E3 and E4 against the claim contract the component design fixes; E6
against its fixed read contract. The graph and the prose now agree, and the
assertion is no longer confined to one side's prose.

**FINDING-4 (LOW).** Carried from v2 FINDING-3, unchanged and not an artifact
defect. `backlog-review-rubric` BR-2 requires `AC-N.M` numbering for derived
criteria; `epic-generation` constraint 6 mandates `DAC-E<n>-<m>` and gives the
reason (global uniqueness across epics). The epics follow the generating skill.
The two harness documents contradict each other, so a reviewer applying the
rubric literally raises a false finding against conforming artifacts, as this
review would have done without checking the generating skill.

**FINDING-5 (LOW).** Carried from v2 FINDING-4, unchanged. AC-24, AC-25 and AC-26
are addressed in the bodies of `component-design-acquisition-runner.md`,
`component-design-ingestion-api.md`, `component-design-instrument-list-service.md`
and `component-design-run-journal.md`, but are incompletely represented in those
components' section 13 traceability tables, having been added to the capability
after those tables were written. No impact on this backlog; the component designs
understate their own coverage. Belongs to the specification layer.

---

## Findings Summary Table

| ID | Severity | Dimension | Artifact | Location | Description | Impact | Recommendation |
|----|----------|-----------|----------|----------|-------------|--------|----------------|
| FINDING-1 | MEDIUM | BR-2 | CAP-001-E2, E3, E6, E7 | `### From Capability` sections | Five capability criteria are restated under their own `[AC-N]` label in narrowed or altered wording: E3 AC-5 and AC-13, E7 AC-11, E6 AC-22, E2 AC-25. Each omitted half is delivered by another epic, but the narrowing is unmarked, unlike E1's AC-18 which states its split explicitly | A reader comparing an epic's criterion against the capability finds an unexplained mismatch; a consumer treating the epic text as authoritative for that identifier implements a weaker criterion than the capability states | Restate each criterion in the capability's own words and append the split sentence, following the pattern E1 AC-18 already uses. Move E3's filing-date prohibition to a derived criterion, which is where it belongs |
| FINDING-2 | MEDIUM | BR-6 | CAP-001-E1 | Document heading, line 41 | Heading reads "Runnable Foundation and Schema" while the frontmatter summary and the `backlog.md` table both read "Runnable Foundation, Schema and Application Shell". The shell was moved into E1 by `af229e8` and the heading was not updated with the rest of the file | The epic that owns the application shell does not say so in its title, obscuring the very fact v1's HIGH sequencing finding was raised to surface | Change the E1 heading to match its summary and the backlog table |
| FINDING-3 | LOW | BR-6 | CAP-001-E1 through E7 | `Estimate` fields | T-shirt sizes carry no stated basis. E1 kept `L` after absorbing the shell and six derived criteria. Carried from v2 FINDING-2 | Sizes may be read as authoritative when they are unexplained judgement, and cannot be checked from the epic files | Record one line per epic on what drives its size, or mark the sizes indicative. The story points now on disk are consistent with the sizes and can supply the basis |
| FINDING-4 | LOW | BR-2 | harness documentation | `backlog-review-rubric` BR-2; `epic-generation` constraint 6 | The rubric requires `AC-N.M` for derived criteria; the epic-generation skill mandates `DAC-E<n>-<m>` and explains why. The epics follow the generating skill. Carried from v2 FINDING-3 | A reviewer applying the rubric literally raises a false finding against conforming epics | Reconcile the two documents. `DAC-E<n>-<m>` is the better-reasoned convention and is what the artifacts use |
| FINDING-5 | LOW | BR-2 | upstream component designs | `component-design-*.md` section 13 tables | AC-24, AC-25 and AC-26 are addressed in the bodies of four component designs but incompletely represented in their section 13 traceability tables. Carried from v2 FINDING-4 | No impact on this backlog. The component designs understate their own coverage | Raise against the specification layer. Not a blocker for epic approval or story generation |

---

## Traceability Matrix

Every capability acceptance criterion, the epics covering it, and how. **(d)**
marks coverage contributed through a derived criterion's `traces to:` annotation
rather than a `From Capability` restatement. Stories are outside this review's
scope and are not assessed; the column records what `backlog.md` asserts.

| Capability AC | EPIC(s) | Story(ies) per backlog.md | Status |
|---------------|---------|---------------------------|--------|
| AC-1 Named instrument list | E2 | E1-S1, E2-S1, E2-S3, E2-S4 | Covered |
| AC-2 History depth stated, not assumed | E2; E4 (d), E5 (d) | E1-S1, E2-S2, E2-S3, E2-S4 | Covered |
| AC-3 Data types acquired | E3, E4; E6 (d) | E3-S1, E3-S2, E4-S4, E4-S5 | Covered |
| AC-4 Acquisition volume, 3000 instruments | E4; E2 (d), E3 (d), E6 (d), E7 (d) | E3-S4, E4-S5, E4-S7 | Covered |
| AC-5 Point-in-time record | E3, E4 | E3-S2, E4-S1, E4-S2, E4-S3 | Covered (E3 restatement narrowed, FINDING-1) |
| AC-6 Re-run safety | E4 | E4-S1, E4-S2, E4-S3, E4-S4, E4-S6 | Covered |
| AC-7 Coverage visibility | E6 | E4-S3, E6-S1, E6-S3, E6-S4 | Covered |
| AC-8 Gap visibility | E6 | E6-S2, E6-S3, E6-S4 | Covered |
| AC-9 Honest run outcome | E5 | E5-S1, E5-S3, E5-S5, E5-S6, E7-S1 | Covered |
| AC-10 Failure diagnosis | E7; E3 (d) | E4-S6, E5-S5, E7-S1, E7-S2, E7-S4 | Covered |
| AC-11 Unrecognised instrument does not stop the run | E3, E7; E4 (d) | E3-S3, E3-S5, E4-S6, E7-S1, E7-S4 | Covered (E7 restatement narrowed, FINDING-1) |
| AC-12 A failed run leaves no false history | E4, E6; E3 (d), E5 (d) | E4-S1, E4-S3, E6-S1 | Covered |
| AC-13 Credential handling | E1, E3; E4 (d), E7 (d) | E1-S2, E1-S3, E3-S1, E3-S5, E7-S2 | Covered (E3 restatement narrowed, FINDING-1) |
| AC-14 Network exposure | E1 | E1-S3, E1-S4, E1-S6 | Covered |
| AC-15 Forward data evolution | E1 | E1-S1, E1-S2 | Covered |
| AC-16 Refuse an inconsistent start | E1; E7 (d) | E1-S2, E1-S5 | Covered |
| AC-17 Honest empty state | E6; E1 (d) | E6-S1, E6-S3, E6-S4, E1-S5 | Covered |
| AC-18 Operational visibility | E1, E7 | E1-S5, E1-S6, E7-S3 | Covered (split stated explicitly in E1) |
| AC-19 Cancel a run in progress | E5; E4 (d) | E4-S5, E5-S3, E5-S5, E7-S4 | Covered |
| AC-20 An interrupted run does not block the next | E5 | E4-S7, E5-S4 | Covered |
| AC-21 Removal retains history | E2, E6 | E2-S1, E2-S4, E6-S1, E6-S3, E6-S4 | Covered |
| AC-22 Deepening backfills history | E4, E6 | E4-S4, E6-S1, E6-S4 | Covered (E6 restatement narrowed, FINDING-1) |
| AC-23 Concurrent run requests queue | E5 | E5-S2, E5-S5, E5-S6 | Covered |
| AC-24 A run with nothing to acquire is refused | E5 | E5-S5, E5-S6 | Covered |
| AC-25 Retiring takes effect from the next run | E2; E4 (d) | E2-S4, E4-S5 | Covered (E2 restatement narrowed, FINDING-1) |
| AC-26 A queued run can be cancelled before it starts | E5 | E5-S3, E5-S5, E5-S6, E7-S4 | Covered |

---

## Readiness Assessment

**Verdict:** READY

No CRITICAL and no HIGH findings. All 26 capability acceptance criteria are
covered, the seven epics are complete and internally consistent, dependencies are
declared and acyclic, derived criteria are correctly numbered and universally
traced, and the counts in `backlog.md` reconcile exactly with the epic files.
`check-artifacts.py --strict` exits 0.

The two MEDIUM findings are both presentational and neither blocks implementation
planning. FINDING-1 narrows the wording of five criteria whose omitted halves are
demonstrably covered elsewhere in the backlog; FINDING-2 is a stale heading on
one epic. Both are worth fixing because they mislead a reader, not because they
change what gets built.

This verdict binds only the eight content revisions in `review_subjects`, and
only the epic layer. It is not evidence about the 36 story files on disk.

---

## Recommendations

### Must Fix (CRITICAL and HIGH)

None.

### Should Fix (MEDIUM)

1. **FINDING-1** — Restate the five narrowed criteria in the capability's own
   words and append an explicit split sentence naming the epic that owns the
   other half, following the pattern `CAP-001-E1` AC-18 already uses. Relocate
   E3's filing-date prohibition to a derived criterion.
2. **FINDING-2** — Update the `CAP-001-E1` heading to "Runnable Foundation,
   Schema and Application Shell", matching its summary and the backlog table.

### Nice to Have (LOW)

3. **FINDING-3** — State the basis for each estimate or mark the sizes
   indicative. The story points now decomposed can supply that basis.
4. **FINDING-4** — Reconcile the derived-criterion numbering convention between
   the backlog-review rubric and the epic-generation skill. Harness change.
5. **FINDING-5** — Complete the AC-24, AC-25 and AC-26 rows in the four component
   designs' section 13 traceability tables. Upstream change.

---

## Approval

This report is review evidence. It is not an approval.

Approving these epics requires an explicit owner action per
`docs/approval-gates.md`, recorded against the exact content revisions listed in
`review_subjects` above. Those revisions differ from the ones v2 reviewed for all
eight artifacts, so the existing `approval` blocks — which cite v2 and its
superseded revisions — no longer bind the current content, and v2 must not be
used as the approval basis. Editing any reviewed artifact after this point
invalidates the binding again and requires a further review.

A READY verdict with no CRITICAL or HIGH findings needs no waiver. The MEDIUM and
LOW findings above may be accepted as recorded, or addressed first at the owner's
discretion. Addressing any of them changes the affected artifact's content
revision and requires a v4 review before approval.

Story-scope review remains blocked until these epics are approved against their
current revisions.
