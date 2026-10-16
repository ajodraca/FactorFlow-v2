---
artifact_schema_version: 1
artifact_id: STD-UI-constitution-review
artifact_type: constitution-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-15
updated: 2026-10-15
review_subjects:
  - artifact_id: STD-UI
    artifact_version: 5
    content_revision: sha256:a95373279eace6c2ddcd4f3189c474085ecd6e75f77077086a01a8688fb07648
ai_provenance:
  agent_id: constitution-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude
  tool_version: unknown
  timestamp: 2026-10-16T02:25:00Z
  source_artifacts:
    - id: STD-UI
      version: "5"
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
---

# Constitution Review Report -- STD-UI v3

**Artifact:** `docs/constitution/standards/ui-conventions.md` (`kind: standard`, `artifact_version: 5`, `status: draft`)
**Authority sources:** Product Charter v2; `docs/constitution/tech-stack.md` v5; CAP-001 and its UX brief v7; the `edg-compliance` skill; WCAG 2.1 AA; owner decisions of 2026-09-05 and 2026-10-15 (the latter recorded in `docs/constitution/proposals/STD-UI-v5-proposal.md`)
**Cited by:** CAP-001 and CAP-002, via `conforms-to STD-UI` edges and Section 5.4 conformance tables, derived by `check-capabilities.py`
**Reviewed:** 2026-10-16T02:25:00Z -- in-session by the agent that drafted the v5 amendments. See Independence below.
**Verdict:** READY

## Executive Summary

v5 applies five owner-accepted amendments to a standard that v2 of this review
found READY. STD-UI-1 now separates each concept's domain term from its display
label. STD-UI-20's rationale clause rests on an owner decision, which closes
OQ-UI-5. STD-UI-12 maps the trading state, STD-UI-11 permits the environment
tokens outside the persistent region under a stated restriction, and STD-UI-29
records that an alpha of an existing token is not a new value. Every amendment
names its authority, and the restates-versus-creates distinction CR-2 protects
is kept: each new obligation is labelled as an owner decision, not attributed to
the charter.

Nothing would go wrong if the standard were approved as it stands, and no
finding is CRITICAL or HIGH. **The one thing to fix first is FINDING-7:** the
new STD-UI-1 table gives *score* as the display label for a classification,
while CAP-002 and the product UX blueprint also use *score* for one component of
a classification, the standardised score shown beside the percentile. That gives
one label two meanings, which is the outcome STD-UI-1 exists to prevent. It is
cheap to fix in the table.

The amendments also create expected consumer work. CAP-001's shipped strings
(*Start acquisition run*, *Instruments*, *Retired*, *abandoned*) and CAP-002's
term *not classified* now contradict STD-UI-1. Section 5.2 already derives this
blast radius, and the standard is not wrong because of it (FINDING-8). Three
MEDIUM findings from v2 remain open and are carried forward.

## Independence

This review was performed in-session by the agent that drafted the five
amendments, the proposal recording them, and the product UX blueprint that
motivated them. That is the weakest form of this gate, and it is recorded here
rather than glossed over. Every finding below about the v5 text is
self-assessment. The thirty rules as they stood in v4 were authored and
reviewed in earlier sessions, and are reviewed here as another agent's work.

Before the review, the same agent made two frontmatter-only corrections that a
reviewer would otherwise have raised. It removed a hand-written approval block
that lacked `reviewed_revision` and `review_artifact`, which `check-artifacts.py`
rejected, and returned `status` to `draft`. It also corrected stale provenance
pins (a self-reference to STD-UI v4; tech-stack v2 → v5; CAP-001-ux-brief v5 →
v7; PRODUCT-UX v1 → v3). The `content_revision` above is the corrected
artifact.

If full independence is wanted, re-run this review through the
`specification-reviewer` subagent or in a fresh session.

## Mechanical Checks

`python3 scripts/check-capabilities.py --project factorflow-v2`

```
Capability check - factorflow-v2: 2 capabilities, 6 edges, 1 standard(s), 2 conformance claim(s), 1 constitution artifact(s), 2 reference(s)

  blocked-by              0
  requires-runtime        2
  requires-contract       0
  conforms-to             4

  4/6 edges (66%) do not constrain build order

Specification and implementation order: unconstrained -- no blocked-by edges,
so every capability can be specified and implemented independently.

Integration order (blocked-by + requires-runtime):
  layer 0: CAP-001
  layer 1: CAP-002

PASSED
```

`python3 scripts/check-artifacts.py --project factorflow-v2 --artifact docs/constitution/standards/ui-conventions.md --strict`

```
Artifact check - repos/factorflow-v2/FactorFlow-v2: 1 artifact(s)

  constitution artifact  1
  legacy artifacts       0
PASSED
```

`python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact docs/constitution/standards/ui-conventions.md`

```
sha256:a95373279eace6c2ddcd4f3189c474085ecd6e75f77077086a01a8688fb07648
```

The checker resolves all thirty rules and both conformance claims, and reports
no error against STD-UI. The rule numbering is unchanged, so no Section 5.4 row
in either capability points at a rule that no longer exists.

## Findings by Dimension

### CR-1 Completeness

Frontmatter carries every required field, with `owning_capability: none`. All
sections are present. Every rule still has Rule, Authority, Verification and
Specialization, including the four amended ones. FINDING-11 (LOW): §1 opens
*FactorFlow-v2 has no interface yet*, which has been untrue since CAP-001
shipped. The sentence predates v5.

### CR-2 Standing

Unchanged and strong. Every v5 obligation is labelled as an owner decision of
2026-10-15, with the proposal named, and none is attributed to the charter.
STD-UI-20 is the clearest case. v4 labelled its rationale clause as internal
policy pending OQ-UI-5. v5 records the owner's confirmation and keeps the
statement that the charter itself does not require a stated reason.

### CR-3 Authority

Applicable: `kind` is `standard`. The new authorities were checked against
their source. Each of A-1 to A-5 exists in
`docs/constitution/proposals/STD-UI-v5-proposal.md` with the rule text as
applied, and that file records acceptance in full on 2026-10-15. FINDING-10
(LOW): that file declares `artifact_schema_version: 1` with an unregistered
`artifact_type`, so the decision behind five rule changes sits in a document the
harness cannot validate. FINDING-2 is carried forward unchanged from v2.

### CR-4 Consumer Traceability

No reverse consumer list is maintained, which is correct. Consumers are derived
from forward edges, and both resolve. FINDING-3 is carried forward and now
extends to STD-UI-1: the display-label table fixes labels for CAP-001's five
run outcomes, so a capability's state machine is again embedded in a
product-wide rule.

### CR-5 Consistency with Citing Capabilities

Two findings.

- FINDING-7 (MEDIUM): *score* has two meanings across the standard and its
  consumers.
- FINDING-8 (MEDIUM): CAP-001 and CAP-002 contradict the amended STD-UI-1.
  The capabilities are the documents to amend.

No capability delegates to content STD-UI lacks.

### CR-6 Change Control

Section 5.2 derives the blast radius, and the v5 revision-history row applies
it: CAP-001 and CAP-002 record STD-UI-1 and STD-UI-12 as *yes* and must be
re-reviewed for those rules. No capability yet records STD-UI-11 or STD-UI-20 as
applicable, so neither needs re-review. FINDING-4 (removal of a rule) is carried
forward unchanged.

### CR-7 Decision Quality

Not applicable -- `kind` is `standard`, not `decision-record`. The proposal
does record rejected alternatives, as an *If rejected* note per amendment.

### CR-8 Clarity

The amended rules use MUST, MUST NOT and MAY consistently.

- FINDING-9 (LOW): STD-UI-11's Verification line still checks only that the
  environment appears on every screen, and says nothing about the new
  restriction on where the tokens may be used.
- FINDING-12 (LOW): STD-UI-1 labels an instrument *on the acquisition list* but
  defines no label for an instrument in general, which the screens call *stock*.
- FINDING-5 is carried forward.

## Findings Summary Table

CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 5 · **total 10**

| ID | Severity | Dimension | Location | Finding | Impact | Recommendation |
|----|----------|-----------|----------|---------|--------|----------------|
| FINDING-7 | MEDIUM | CR-5, CR-8 | STD-UI-1 table, row *classification → score* | *Score* is the display label for a whole classification, but CAP-002 (§2, §5.4 STD-UI-1 row) and `docs/ux/product-ux-blueprint.md` §4.4 and S03 also use *score* for the standardised score shown beside the percentile | One label carries two concepts, contradicting the rule's own one-name-per-concept purpose. A screen reading "score 88" versus "score +1.21" is ambiguous | Split the row: *classification → score* (the whole), and add *standardised score → standardised score* and *percentile rank → percentile* as explicit labels. Or label the classification *factor score* |
| FINDING-8 | MEDIUM | CR-5 | CAP-001 §5.4 STD-UI-1 row and shipped UI; CAP-002 §5.4 STD-UI-1 row | CAP-001's shipped interface uses domain terms that now have display labels: *Start acquisition run*, *Instruments* (screen title and messages), *Retired*, *abandoned*. CAP-002 adds *not classified* as a term, which is now a domain term labelled *Incomplete* | Both capabilities contradict STD-UI-1 v5 once it is approved. This is the blast radius §5.2 predicts, not a defect of the standard | Per §5.2: re-review CAP-001 and CAP-002 for STD-UI-1. Amend CAP-001's UX brief and design strings and rename the shipped UI; update CAP-002's §5.4 row and UX brief before its specification review |
| FINDING-2 | MEDIUM | CR-3 | STD-UI-14, STD-UI-15, STD-UI-18, STD-UI-25 authority lines | Carried forward from v2 unchanged. Four rules take their authority from CAP-001's system design | Product-wide rules rest on one capability's design | As v2: restate on product-level authority, citing CAP-001 as motivation |
| FINDING-3 | MEDIUM | CR-4 | STD-UI-12 run-lifecycle mapping; **extended in v5** to the STD-UI-1 run-outcome label row | Capability-specific state machines embedded in product-wide rules | If CAP-001's lifecycle changes, the standard must be amended twice | As v2: move CAP-001's mapping and run-outcome labels to its §5.4 or UX brief, leaving the standard to define tiers and the labelling rule |
| FINDING-4 | MEDIUM | CR-6 | §5.2 | Carried forward from v2 unchanged. No clause on what a consumer does with a retired rule's conformance row | A rule removal would become a mechanical failure in unrelated artifacts | As v2: add a retirement clause |
| FINDING-9 | LOW | CR-8 | STD-UI-11 Verification | The new MAY / MUST NOT clause on environment tokens has no stated verification | A reviewer has no check for misuse of `--risk-*` tokens outside an environment context | Add: *and every use of a `--risk-*` token outside the region marks an environment and states it in words* |
| FINDING-10 | LOW | CR-3 | `docs/constitution/proposals/STD-UI-v5-proposal.md` | The authority for A-1 to A-5 lives in a file declaring `artifact_schema_version: 1` with the unregistered type `constitution-amendment-proposal`. `check-artifacts.py` reports it as matching no known artifact type when pointed at it | The decision behind five rule changes is outside the governed record. The rules remain sound | Either drop `artifact_schema_version` and treat the file as a plain record, or record the decision as a `decision-record` constitution artifact |
| FINDING-11 | LOW | CR-1 | §1 first sentence | *FactorFlow-v2 has no interface yet* has been untrue since CAP-001 shipped | Cosmetic, but misleads a first-time reader | Reword to the standard's purpose without a dated claim |
| FINDING-12 | LOW | CR-8 | STD-UI-1 table, first row | Labels *instrument (on the acquisition list)* only; the screens call a generic instrument *stock* without a rule saying so | Small gap a capability could fill inconsistently | Add *instrument → stock* as a row above the acquisition-list row |
| FINDING-5 | LOW | CR-8 | STD-UI-29 | Carried forward from v2 unchanged | — | As v2 |

v2's FINDING-6 (stale `CAP-001-ux-brief` pin) recurred in v5 at v5 → v7. It was
corrected before this review, as recorded under Independence.

## Citing Capability Matrix

| Capability | What it cites | Exists here | Contradiction |
|------------|---------------|-------------|---------------|
| CAP-001 | `conforms-to STD-UI` edge; §5.4 table of all thirty rules (STD-UI-1 *yes*, STD-UI-11 *no*, STD-UI-12 *yes*, STD-UI-20 *no*, STD-UI-29 *yes*) | Yes. All thirty references resolve | **Yes, against STD-UI-1 v5** (FINDING-8): shipped strings and UX brief use domain terms now labelled. No contradiction with the other amended rules |
| CAP-002 | `conforms-to STD-UI` edge; §5.4 table of all thirty rules (STD-UI-1 *yes*, STD-UI-11 *no*, STD-UI-12 *yes*, STD-UI-20 *no*, STD-UI-29 *yes*) | Yes | **Yes, against STD-UI-1 v5** (FINDINGS 7, 8): adds *not classified* as a term, and uses *score* for the standardised score |

## Readiness Assessment

**READY.** No CRITICAL and no HIGH findings, and the mechanical checks report no
error against STD-UI. The artifact may be approved.

Every rule has a valid authority. The five v5 obligations rest on a recorded,
accepted owner decision, with the proposal naming the rule text applied. The
consumer blast radius is derivable from forward references and is stated in the
revision history: CAP-001 and CAP-002 re-review STD-UI-1 and STD-UI-12. The
contradictions FINDING-8 records are what that re-review exists to resolve. They
do not lower this standard's verdict, because a standard's readiness is
independent of its consumers' state.

Approving before fixing FINDING-7 is permitted, but it locks an ambiguous label
into the rule CAP-002 is about to conform to. Fixing it first changes the
content, so it needs a v6 and a fresh review.

## Recommendations

### Must Fix (CRITICAL and HIGH)

None.

### Should Fix (MEDIUM)

- **FINDING-7** -- disambiguate *score* in the STD-UI-1 table before CAP-002
  conforms to it.
- **FINDING-8** -- re-review CAP-001 and CAP-002 for STD-UI-1 per §5.2, and
  rename CAP-001's shipped strings.
- **FINDING-2, FINDING-3, FINDING-4** -- carried forward from v2.

### Nice to Have (LOW)

- **FINDING-9** -- extend STD-UI-11's Verification line.
- **FINDING-10** -- put the amendment decision in a governed or plainly
  ungoverned form.
- **FINDING-11** -- reword §1's opening sentence.
- **FINDING-12** -- add *instrument → stock*.
- **FINDING-5** -- carried forward from v2.
