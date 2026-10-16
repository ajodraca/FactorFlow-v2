---
artifact_schema_version: 1
artifact_id: STD-UI-constitution-review
artifact_type: constitution-review
artifact_version: 4
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-15
updated: 2026-10-15
review_subjects:
  - artifact_id: STD-UI
    artifact_version: 6
    content_revision: sha256:3ad42ff2ef4e3e4b1092009b6d96d5d00c7f70956115d902b5507e6008ab62ce
ai_provenance:
  agent_id: constitution-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude
  tool_version: unknown
  timestamp: 2026-10-16T02:18:22Z
  source_artifacts:
    - id: STD-UI
      version: "6"
  invoking_user: ajodraca
  correlation_id: c32bf5a2-35d1-4c15-8990-f31681cbfcc8
---

# Constitution Review Report -- STD-UI v4

**Artifact:** `docs/constitution/standards/ui-conventions.md` (`kind: standard`, `artifact_version: 6`, `status: draft`)
**Authority sources:** Product Charter v2; `docs/constitution/tech-stack.md` v5; CAP-001 and its UX brief v7; the `edg-compliance` skill; WCAG 2.1 AA; owner decisions of 2026-09-05 and 2026-10-15 (the latter recorded in `docs/constitution/proposals/STD-UI-v5-proposal.md`)
**Cited by:** CAP-001 and CAP-002, via `conforms-to STD-UI` edges and Section 5.4 conformance tables, derived by `check-capabilities.py`
**Reviewed:** 2026-10-16T02:18:22Z -- in-session by the agent that drafted v5 and v6. See Independence below.
**Verdict:** READY

## Executive Summary

v6 is v5 plus the fixes v3 of this review asked for before approval. Five
findings are resolved: FINDING-7, the one to fix first, and the four LOWs
FINDING-9 to FINDING-12. STD-UI-1 now names *score* as the label for a whole
classification, *percentile* and *standardised score* as its two components,
and forbids shortening the latter to *score*. That removes the double meaning
CAP-002 was about to conform to. No rule obligation changed beyond the STD-UI-1
label rows, and the numbering is unchanged.

No finding is CRITICAL or HIGH. Four MEDIUM findings remain:

- **FINDING-8** is the consumer migration §5.2 predicts.
- **FINDING-2, FINDING-3 and FINDING-4** are carried forward from v2, unchanged.

None makes a citing capability wrong.

## Independence

As in v3: performed in-session by the agent that drafted v5, v6 and the
proposal. This review checks its own fixes, so treat the confirmations below as
self-assessment. The only content changes since v3 are the v6 fixes listed under
Resolved Findings, the matching revision-history row. (A provenance pin to
review v3 was added and then removed before approval: the gate treats a pinned
review as a governed upstream, and a review is not a source of its subject.)
The provenance timestamp was also corrected to the actual time of the v6 edit:
it had been estimated ahead of the clock, as had the `Reviewed` time in v3 of
this review (stated 02:25Z, actually written about 02:05Z). Re-run through the `specification-reviewer` subagent or a fresh
session for an independent verdict.

## Mechanical Checks

`python3 scripts/check-capabilities.py --project factorflow-v2`: PASSED, 2
capabilities, 1 standard, 2 conformance claims, no warnings. Output identical
to v3 of this review.

`python3 scripts/check-artifacts.py --project factorflow-v2 --artifact docs/constitution/standards/ui-conventions.md --strict`

```
Artifact check - repos/factorflow-v2/FactorFlow-v2: 1 artifact(s)

  constitution artifact  1
  legacy artifacts       0
PASSED
```

`python3 scripts/artifact-gate.py revision --project factorflow-v2 --artifact docs/constitution/standards/ui-conventions.md`

```
sha256:3ad42ff2ef4e3e4b1092009b6d96d5d00c7f70956115d902b5507e6008ab62ce
```

## Resolved Findings

| ID | Was | Confirmed in v6 |
|----|-----|-----------------|
| FINDING-7 | MEDIUM — *score* had two meanings | STD-UI-1 table: *classification → score*, *percentile rank → percentile*, *standardised score → standardised score — never shortened to score*. The blueprint's §7 and specs S03 and S05 now use the split consistently |
| FINDING-9 | LOW — STD-UI-11 Verification missed the token restriction | Verification now adds *every use of a `--risk-*` token outside the region marks an environment and states it in words* |
| FINDING-10 | LOW — decision record in a schema-versioned file of an unregistered type | `artifact_schema_version` removed from the proposal; it is now a plain record the standard cites, which `check-artifacts.py` does not govern |
| FINDING-11 | LOW — dated claim in §1 | Reworded as history: *When this standard was first written, FactorFlow-v2 had no interface.* |
| FINDING-12 | LOW — no label for an instrument in general | Row added: *instrument → stock* |

## Findings by Dimension

### CR-1 Completeness

No findings. Required frontmatter, all sections, and all four parts of every
rule are present.

### CR-2 Standing

No findings. Every v5 and v6 obligation is labelled as an owner decision, not
attributed to the charter.

### CR-3 Authority

FINDING-2 is carried forward. The STD-UI-1 label rows rest on the owner decision
recorded in the proposal, which exists and matches the applied text.

### CR-4 Consumer Traceability

FINDING-3 is carried forward, including its v3 extension to the STD-UI-1
run-outcome row.

### CR-5 Consistency with Citing Capabilities

FINDING-8 remains:

- CAP-001's shipped strings (*Start acquisition run*, *Instruments*, *Retired*,
  *abandoned*) contradict STD-UI-1.
- CAP-002's §5.4 row still adds *not classified* and *score* as its own terms.
  Under v6, *not classified* is a domain term labelled *Incomplete*. CAP-002
  must also adopt *standardised score* for the signed component, since §2 calls
  it a "standardised score" and its row lists *score*.

Both are resolved by the capabilities, per §5.2.

### CR-6 Change Control

FINDING-4 is carried forward. The v6 revision-history row names its own blast
radius: only the STD-UI-1 label rows changed, so CAP-001 and CAP-002 re-review
STD-UI-1, which v5 already required.

### CR-7 Decision Quality

Not applicable -- `kind` is `standard`.

### CR-8 Clarity

FINDING-5 is carried forward. No new findings.

## Findings Summary Table

CRITICAL 0 · HIGH 0 · MEDIUM 4 · LOW 1 · **total 5 open** (5 resolved since v3)

| ID | Severity | Dimension | Location | Finding | Impact | Recommendation |
|----|----------|-----------|----------|---------|--------|----------------|
| FINDING-8 | MEDIUM | CR-5 | CAP-001 shipped UI and UX brief; CAP-002 §5.4 STD-UI-1 row | Both capabilities use domain terms that STD-UI-1 now labels | Expected migration; the capabilities are amended, not the standard | Re-review CAP-001 and CAP-002 for STD-UI-1; rename CAP-001's strings; update CAP-002's row to *Incomplete*, *percentile*, *standardised score* |
| FINDING-2 | MEDIUM | CR-3 | STD-UI-14, -15, -18, -25 authority | Carried from v2 | As v2 | As v2 |
| FINDING-3 | MEDIUM | CR-4 | STD-UI-12 run mapping; STD-UI-1 run-outcome row | Carried from v2, extended in v3 | As v3 | As v3 |
| FINDING-4 | MEDIUM | CR-6 | §5.2 | Carried from v2 | As v2 | As v2 |
| FINDING-5 | LOW | CR-8 | STD-UI-29 | Carried from v2 | As v2 | As v2 |

## Citing Capability Matrix

| Capability | What it cites | Exists here | Contradiction |
|------------|---------------|-------------|---------------|
| CAP-001 | `conforms-to STD-UI`; §5.4, all thirty rules | Yes | Yes, against STD-UI-1 (FINDING-8) |
| CAP-002 | `conforms-to STD-UI`; §5.4, all thirty rules | Yes | Yes, against STD-UI-1 (FINDING-8) |

## Readiness Assessment

**READY.** No CRITICAL and no HIGH findings, and no mechanical check reports an
error against STD-UI. Every rule has a valid authority, and the consumer blast
radius is derivable from forward references and stated in the revision history.
The artifact may be approved.

## Recommendations

### Must Fix (CRITICAL and HIGH)

None.

### Should Fix (MEDIUM)

- **FINDING-8** -- run the STD-UI-1 re-review of CAP-001 and CAP-002.
- **FINDING-2, FINDING-3, FINDING-4** -- carried forward from v2.

### Nice to Have (LOW)

- **FINDING-5** -- carried forward from v2.
