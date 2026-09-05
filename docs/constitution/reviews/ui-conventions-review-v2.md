---
artifact_schema_version: 1
artifact_id: STD-UI-constitution-review
artifact_type: constitution-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-05
updated: 2026-09-05
review_subjects:
  - artifact_id: STD-UI
    artifact_version: 4
    content_revision: sha256:ecce3693ba29720a0e24b9f5528be59b6d5e87d1160ab65615365f783307d39d
ai_provenance:
  agent_id: constitution-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-05T04:03:14Z
  source_artifacts:
    - id: STD-UI
      version: "4"
  invoking_user: ajodraca
  correlation_id: 6493d4a3-41a0-4991-9e37-c372f762c3d0
---

# Constitution Review Report -- STD-UI v2

**Artifact:** `docs/constitution/standards/ui-conventions.md` (`kind: standard`, `artifact_version: 4`, `status: draft`)
**Authority sources:** Product Charter v2; `docs/constitution/tech-stack.md` v2; CAP-001 v5 and its system design v1; the `edg-compliance` skill; WCAG 2.1 AA; owner decisions of 2026-09-05
**Cited by:** CAP-001, via a `conforms-to STD-UI` edge and a Section 5.4 conformance table, derived by `check-capabilities.py`
**Reviewed:** 2026-09-05 -- in-session by the agent that amended the artifact, including the FINDING-1 fix this review confirms. See Independence below.
**Verdict:** READY

## Executive Summary

STD-UI is a substantial and unusually well-built standard. Thirty rules each
carry a Rule, an Authority, a Verification and a Specialization posture, its
standing against both capabilities and the advisory `edg-compliance` skill is
stated explicitly rather than left to inference, and it declares three
intentional departures and four scope exemptions so a reviewer does not raise
them as defects. Its single consumer's conformance record accounts for every rule
and contradicts none of them.

**This is the second review.** v1 found one HIGH: STD-UI-20 obliged the promotion
gate to capture a written rationale and attributed that to Charter section 3,
which does not impose it. The owner directed the fix rather than tracking it, and
v4 of the artifact labels the rationale clause internal policy pending OQ-UI-5
while leaving the rule's other three clauses on their charter authority. The
obligation itself is unchanged; only its stated basis is. **FINDING-1 is
resolved** and this review confirms it against the amended text.

Nothing would go wrong if the standard were approved as it now stands. Three
MEDIUM findings remain, all carried forward unchanged from v1 and none of which
makes a citing capability wrong. The most substantive is that four rules take
their authority from CAP-001's system design, which inverts the dependency: a
product-wide rule resting on one capability's design loses its basis if that
capability is amended, while continuing to bind every other capability. That is
worth settling before a second capability conforms, not before this one is
approved.

## Independence

This review was performed in-session by the agent that amended the artifact,
which is the weakest form of this gate and is recorded here rather than glossed.

The scope of that involvement is narrow and worth stating precisely. The thirty
rules, the standing sections and the change-control section were authored by
`constitution-agent` in an earlier session and are reviewed here as another
agent's work. Three changes are this reviewer's own: closing OQ-UI-3 to record the owner's
time-zone decision and promoting the thirty rule headings from level four to
level three, both in v3, and the v4 correction to STD-UI-20's authority that this
review confirms as resolving FINDING-1. None is reviewed independently, and a
reader should treat the findings about them as self-assessment. That caveat is
sharpest on FINDING-1: the same agent raised it, fixed it, and is now confirming
the fix.

If full independence is wanted, re-run this review through the
`specification-reviewer` subagent or in a fresh session. The findings below are
unlikely to change, but their standing would.

## Mechanical Checks

`python3 scripts/check-capabilities.py --project factorflow-v2`

```
Capability check - factorflow-v2: 1 capabilities, 3 edges, 1 standard(s), 1 conformance claim(s), 1 constitution artifact(s), 1 reference(s)

  blocked-by              0
  requires-runtime        1
  requires-contract       0
  conforms-to             2

  2/3 edges (66%) do not constrain build order

WARNINGS (1)
  CAP-001 -> Massive (market data provider) [requires-runtime]: no acceptance criterion cited. Either cite the contract, or record that the target has not defined one.

PASSED with 1 warning(s)
```

The warning concerns CAP-001's external provider dependency and is unrelated to
this artifact. No error is reported against STD-UI. The checker resolves all
thirty rules and one conformance claim, which it did not before v3: the rule
headings were previously at a level the extractor does not match, so it read zero
rules from a thirty-rule standard and would have rejected every claim against it.

Structural check of the artifact, run for this review:

```
rules: 30  authority: 30  verification: 30  specialization: 30
rules missing Rule, Authority, Verification or Specialization: none
```

Agreement check between the two conformance records:

```
capability rows: 30  brief rows: 30
disagreements: none
missing from capability: none
missing from brief: none
```

## Findings by Dimension

### CR-1 Completeness

One finding, FINDING-6, surfaced by the approval gate rather than by this review
and corrected before approval. Frontmatter otherwise carries every required field
including
`owning_capability: none`, correct for a standard. Purpose and Standing, Scope,
Normative Rules, Conformance, Change Control, Traceability and Revision History
are all present. The body matches `kind: standard`: thirty numbered rules, each
with the four required parts, verified mechanically above.

### CR-2 Standing

Strong, and the section most standards leave thin is the one this artifact
invests in. Section 1.1 states that the standard wins over a capability, with the
one sound exception that a capability with a stricter acceptance criterion
conforms by satisfying its own, and that a capability may never be looser.
Section 1.2 resolves the relationship with the scaffold-wide `edg-compliance`
skill by layer rather than by precedence contest, declaring `edg-compliance`
advisory beneath this standard without modifying it. Section 1.3 states what a
reader must not conclude, including that a rule's absence is not permission.

The restates-versus-creates distinction CR-2 demands is made explicitly: rules
citing the charter or `tech-stack.md` restate an existing obligation, rules
citing "internal policy" create a new one, and the standard names the latter as
the ones to scrutinise. One finding, FINDING-1, concerns a rule whose Authority line
does not honour that distinction.

### CR-3 Authority

Applicable: `kind` is `standard`. All thirty rules cite an authority, and the
cited sources were checked against their originals. Charter section 3's
point-in-time persistence, its kill-switch-outside-application-health clause and
its decision-history-behind-promotions clause exist as cited; `tech-stack.md`
v2's paper-versus-live styling requirement, its Massive restatement limitation
and its record that Biome carries no `jsx-a11y` equivalent exist as cited;
CAP-001 AC-4's three thousand instruments exists as cited.

One finding, FINDING-2, on four rules whose authority is a single capability's
system design. v1's FINDING-1, on STD-UI-20 attributing its written-rationale
clause to Charter section 3, is resolved in v4: the clause is now labelled
internal policy pending OQ-UI-5, and the rule's remaining three clauses keep the
charter authority that does support them.

### CR-4 Consumer Traceability

The artifact maintains no reverse consumer list, which is correct and is what
CR-4 asks for. Consumers are derived by the checker from CAP-001's `conforms-to`
edge and its Section 5.4 table, and every forward reference resolves.

One finding, FINDING-3: STD-UI-12 embeds one capability's state machine in a
product-wide rule.

### CR-5 Consistency with Citing Capabilities

No findings, and this dimension is stronger than usual because it was checked
mechanically rather than by reading. CAP-001's Section 5.4 and the UX brief's
Section 12.1 each account for all thirty rules and agree with each other on every
verdict, with no rule missing from either and no disagreement between them. No
capability contradicts a rule. CAP-001 delegates nothing to STD-UI that STD-UI
does not record.

### CR-6 Change Control

Section 5.2 derives the blast radius the way CR-6 requires: run the capability
checker, re-review every capability recording the changed rule as `yes` or
`partial`, leave capabilities recording it `not applicable` untouched, and
re-check existing specializations when a `stricter-only` rule tightens. That is a
procedure a reviewer can execute, not a gesture at one.

One finding, FINDING-4: removal is addressed for the rule but not for its consumers.

### CR-7 Decision Quality

Not applicable -- `kind` is `standard`, not `decision-record`.

### CR-8 Clarity

Rules use MUST and MUST NOT consistently and state obligations rather than
designs. Terms are defined where introduced, and STD-UI-1 supplies the product
vocabulary the rest of the document uses. One low finding, FINDING-5.

## Findings Summary Table

CRITICAL 0 · HIGH 0 · MEDIUM 3 · LOW 2 · **total 5**

| ID | Severity | Dimension | Location | Finding | Impact | Recommendation |
|----|----------|-----------|----------|---------|--------|----------------|
| FINDING-2 | MEDIUM | CR-3 | STD-UI-14, STD-UI-15, STD-UI-18, and STD-UI-25's authority line | Four rules take their authority from CAP-001's system design constraints 5.5 and 5.9 and its control flow steps. A product-wide standard derives its basis from one capability's design | The dependency is inverted. Amending CAP-001's system design would silently remove the basis for rules that continue to bind every later capability. The rules themselves are sound and generalise well; only their sourcing is local | Restate the underlying obligation in product terms, citing charter section 3's point-in-time persistence, and cite CAP-001's system design as the case that motivated it rather than as the authority |
| FINDING-3 | MEDIUM | CR-4 | STD-UI-12, the tier mapping table | The rule hard-codes CAP-001's eight run states and their tier assignments inside a product-wide standard | Capability-specific content in a standard inverts the direction CR-4 protects: if CAP-001's lifecycle changes, the standard must be amended. Contrast STD-UI-30, which defers correctly with "the volume is the capability's own" | Move the CAP-001 mapping into the capability's Section 5.4, leaving STD-UI-12 to define the six tiers and require every capability to map its own states to them |
| FINDING-4 | MEDIUM | CR-6 | Section 5.2 | Change control covers changing a rule and adding one, and states that numbering is permanent and a retired rule is marked retired in place. It does not say what a consuming capability does with a conformance row for a rule that has been retired | Removal is the case CR-6 names as most often missing. A capability's Section 5.4 would keep asserting conformance to a rule that no longer exists, and the checker would then report it as citing a rule that does not exist, turning a governance change into a mechanical failure in an unrelated artifact | Add one clause: on retiring rule n, consuming capabilities mark the row retired rather than deleting it, so the numbering stays legible and the checker is told what to expect |
| FINDING-6 | LOW | CR-1 | Frontmatter `source_artifacts` | The artifact recorded `CAP-001-ux-brief` at version 1 while the brief stood at version 5. Found by `artifact-gate.py approve`, which refused with "upstream CAP-001-ux-brief is stale", not by this review's own reading of the frontmatter | Provenance understated which version of its own consumer the standard was written against. No rule content is affected. It blocked approval until corrected, which is the gate working as intended | Corrected to version 5 before approval. This review's recorded `content_revision` is the corrected artifact |
| FINDING-5 | LOW | CR-8 | STD-UI-29 | "A component MUST NOT be overridden at a call site; a correction belongs in the vendored component" states where a fix lives rather than what must be true | Edges into implementation, which CR-8 asks standards to stay out of. Defensible, since `tech-stack.md` v2 vendors shadcn/ui into the repository and the clause is grounded in that decision | Optional. If tightened, keep the token-consumption obligation and drop the sentence about where the correction belongs |

## Citing Capability Matrix

| Capability | What it cites | Exists here | Contradiction |
|------------|---------------|-------------|---------------|
| CAP-001 | `conforms-to STD-UI` edge in Section 5.1, with a Section 5.4 table recording all thirty rules: 17 yes, 9 no with reasons, 4 partial | Yes. All thirty rule references resolve, and no row cites a rule that does not exist | None. Verified mechanically against both the capability's Section 5.4 and the UX brief's Section 12.1, which agree with each other on every rule |

## Readiness Assessment

**READY.** No CRITICAL and no HIGH findings. The artifact may be approved.

v1's single HIGH is resolved at its source rather than waived. STD-UI-20 now
states that Charter section 3 authorises its evidence, acknowledgement and
not-a-toggle clauses, and that the written-rationale clause is internal policy
pending OQ-UI-5. That is the distinction section 1.1 of the standard demands of
its own rules, now applied to the one rule that had not honoured it.

Every rule carries an authority, and each was checked against its original source
rather than taken at face value. Four of those authorities point at a capability
this standard governs rather than at a product-level source, which FINDING-2
records; that weakens the sourcing without making any rule wrong, and it does not
bar approval.

The consumer blast radius is derivable from forward references, and demonstrably
so: the checker resolves CAP-001's `conforms-to` edge and its thirty-row table
into one conformance claim, and no reverse consumer list is maintained anywhere
in the artifact.

The verdict is independent of CAP-001's own lifecycle state. That capability is
draft and unapproved, which does not lower this standard's readiness.

## Recommendations

### Must Fix (CRITICAL and HIGH)

None. v1's FINDING-1 was fixed in artifact v4 before this review and is confirmed
resolved above.

### Should Fix (MEDIUM)

- **FINDING-2** -- restate STD-UI-14, STD-UI-15, STD-UI-18 and STD-UI-25 on
  product-level authority, citing CAP-001's system design as motivation rather
  than as basis.
- **FINDING-3** -- move STD-UI-12's CAP-001 state mapping into that capability's
  Section 5.4.
- **FINDING-4** -- add a removal clause to Section 5.2 covering what a consumer does
  with a retired rule's conformance row.

### Nice to Have (LOW)

- **FINDING-6** -- already corrected before approval; listed for the record.
- **FINDING-5** -- optionally trim STD-UI-29's clause about where a correction belongs.
