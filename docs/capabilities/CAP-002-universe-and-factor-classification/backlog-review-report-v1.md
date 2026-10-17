---
artifact_schema_version: 1
artifact_id: CAP-002-backlog-review
artifact_type: backlog-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
document: backlog-review-report
capability: CAP-002
scope: epics
version: v1
generated: 2026-10-17T04:10:29Z
review_subjects:
  - artifact_id: CAP-002-backlog
    artifact_version: 1
    content_revision: sha256:656419e37515cb7c40117099af1dc4eee53c56d6ac1292aa5105ec73c4604edc
  - artifact_id: CAP-002-E1
    artifact_version: 1
    content_revision: sha256:d9836f2afaa69ecab634cc7067b4685e25a9137fc11b0a7a7f5c9e0afbfc1019
  - artifact_id: CAP-002-E2
    artifact_version: 1
    content_revision: sha256:952179e4b95b7ca0aff1389da0ac067ae1baf59db11f7b97d634f63acd782456
  - artifact_id: CAP-002-E3
    artifact_version: 1
    content_revision: sha256:1410a7e7bbc0b4bc8d24949fdcdb05bd6d9cf5295fd965f249cb17e84c362b05
  - artifact_id: CAP-002-E4
    artifact_version: 1
    content_revision: sha256:0c08de85b09e2f983a516f9b24550a11443cf22b45b5899ecc42ef0faa008cb9
  - artifact_id: CAP-002-E5
    artifact_version: 1
    content_revision: sha256:d65ec48306f571eb778e59e3bf8f222b4b26c55c1d70ea885785f1f231122e59
statistics:
  epics_reviewed: 5
  stories_reviewed: 0
  total_findings: 10
  critical: 0
  high: 2
  medium: 4
  low: 4
readiness: READY-WITH-WARNINGS
ai_provenance:
  agent_id: backlog-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T04:10:29Z
  source_artifacts:
    - id: CAP-002
      version: "1"
    - id: CAP-002-system-design
      version: "3"
    - id: CAP-002-component-design-universe-service
      version: "2"
    - id: CAP-002-component-design-factor-engine
      version: "2"
    - id: CAP-002-component-design-classification-scheduler
      version: "2"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-research-store
      version: "2"
    - id: CAP-002-ux-design
      version: "3"
    - id: CAP-002-ux-brief
      version: "3"
    - id: CAP-002-backlog
      version: "1"
    - id: CAP-002-E1
      version: "1"
    - id: CAP-002-E2
      version: "1"
    - id: CAP-002-E3
      version: "1"
    - id: CAP-002-E4
      version: "1"
    - id: CAP-002-E5
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Backlog Review Report -- CAP-002

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-002 |
| **Scope** | epics |
| **EPICs Reviewed** | 5 |
| **Stories Reviewed** | 0 |
| **Total Findings** | CRITICAL 0 · HIGH 2 · MEDIUM 4 · LOW 4 · **total 10** |
| **Readiness** | READY-WITH-WARNINGS |

All five EPICs are there and filled in. Each one traces to the capability, and
all 23 capability acceptance criteria map to at least one EPIC, so nothing is
uncovered. The derived acceptance criteria mostly match the approved system
design and component designs, and they are written so they can be tested.

There are two HIGH findings. Both affect the composition seams:
(1) DAC-E4-6 says no assertion in the delivered shell tests changes except the
navigation count, but the design requires a second assertion in
`routes.test.tsx` to change; (2) no EPIC owns the API-side composition in
`app.py` (registering the routers and starting the classification scheduler)
or the extension of `test_api_no_secrets.py`. Without the scheduler start,
AC-10's automatic refresh never runs.

The MEDIUM findings are coverage gaps in the Research-screen EPIC (E4) and an
understated dependency in E1.

This run was unattended. The review made no product decision and wrote no
decision record. Every severity below follows the rubric's severity table.

## Review Scope

Reviewed for `SCOPE=epics` on branch `usr/alvaro-de-jodra/CAP-002-epics`:

- `backlog.md` (CAP-002-backlog v1, draft)
- `epics/universe-definition-and-maintenance/CAP-002-E1.md` (v1, draft)
- `epics/automatic-factor-classification-engine/CAP-002-E2.md` (v1, draft)
- `epics/classification-read-api/CAP-002-E3.md` (v1, draft)
- `epics/research-screen-scores-and-filtering/CAP-002-E4.md` (v1, draft)
- `epics/compare-stock-evidence-and-diagnosis/CAP-002-E5.md` (v1, draft)

Checked against these upstream artifacts: `Capability-CAP-002.md` v1 (approved),
`design/system-design.md` v3 (approved), the seven component designs
(universe-service v2, factor-engine v2, classification-scheduler v2,
classification-reader v3, classification-api v3, classification-ui v3,
research-store v2), `ux-design.md` v3 and `ux-brief.md` v3.

Evidence commands:

- `scripts/check-prerequisites.sh --project factorflow-v2`: PASSED.
- `scripts/pipeline-state.py check ... --stage epic-generation`:
  `RESUME — epic backlog review is missing or not passing`. This is the
  expected entry condition.
- `scripts/check-artifacts.py --project factorflow-v2 --artifact docs/capabilities/CAP-002-universe-and-factor-classification --strict --allow-unchanged-legacy`:
  PASSED with 10 warnings. None of the warnings is about an EPIC or the
  backlog. They are upstream pins: the capability pins STD-UI v4 (v6 is
  current), and the seven component designs, the UX brief and the UX design pin
  specification review v2 (v3 is current). They do not bear on the work
  breakdown, so they are listed here and not raised as findings.
- `scripts/artifact-gate.py revision` was run for each of the six artifacts
  above. The digests are recorded in `review_subjects`.

Reviewer note: the rubric's BR-2 text still names `AC-N.M` numbering for
derived ACs. The current `$epic-generation` skill requires `DAC-E<n>-<m>`
(constraint 6), and every EPIC uses that convention correctly. This review
applies the skill's convention and raises no finding on numbering.

---

## Findings by Dimension

### BR-1 Completeness

Every primary flow and use case in the system design maps to an EPIC:

- classification after a run: E2, E3, E4
- universe writes: E1
- reading classifications and evidence: E3, E4, E5

Each EPIC has a summary stating its value, actors (the components it touches),
goals, NFRs, capability and derived ACs, dependencies, links, traceability and
open questions. None is a placeholder. Owner questions are carried as
`[REQUIRES INPUT]` with what each one blocks, not invented:

- the universe name length (E1)
- the Massive payload keys (E2)

No findings.

### BR-2 Alignment with Upstream

Every derived AC was checked against the component designs:

- E1: DAC-E1-1 to DAC-E1-10 match universe-service §2.3–2.5 and DEC-0057 and
  DEC-0065.
- E2: DAC-E2-1 to DAC-E2-12 match factor-engine §2.3–2.5 and
  classification-scheduler §2.4. This includes the reading that
  `not_enough_stocks` takes precedence over the input reasons for an unranked
  factor, and the start-up reclaim under DEC-0067.
- E3: DAC-E3-1 to DAC-E3-12 match classification-reader §2.4–2.6 and DEC-0079,
  DEC-0081 and DEC-0082.
- E5: DAC-E5-1 to DAC-E5-5 match classification-ui §2.5 and §10, and UX design
  §1.5–1.6.

No scope drift was found. DAC-E2-12 rests on an approved component design
(classification-scheduler §2.4, DEC-0067) and is honestly marked as a
mitigation, so it is not scope drift.

- **FINDING-1 (HIGH, CROSS-LAYER-INCONSISTENCY).** DAC-E4-6 contradicts the
  design. It says the four delivered shell tests' navigation-count assertions
  move from four to five "and no other assertion in those files changing". The
  E4 NFR *Composition discipline* says the same thing ("four counted-assertion
  edits"), and so does E4's Dependencies paragraph. But system design v3 §8
  question 4 (DEC-0084) and classification-ui §2.1–2.2 require a second edit
  in `web/src/app/routes.test.tsx`: its route-source assertion at lines 105–118
  must gain the five `/research` paths. If a story implements DAC-E4-6 as
  written, either the delivered test fails or the story breaks its own AC.
  Specification review v2 FINDING-12 was raised over exactly this edit list.
- **FINDING-7 (LOW).** DAC-E4-6 traces to "the composition constraint,
  AGT-SCOPE-002; not a capability AC". `$epic-generation` requires every
  derived AC to trace to a parent capability AC.
- **FINDING-9 (LOW).** Three cross-references are wrong:
  - E1's traceability (AC-5) and the backlog's AC-5 row cite "universe-service
    2.8". That section does not exist: the design's §2 ends at 2.6, and the
    last-member refusal is in §2.4.
  - E1's Links label classification-api "2.4, 2.6 (universes routes and error
    mapping)". Error mapping is §2.5. §2.6 is the write request flow, and the
    `origin` response shape is in §2.7.
  - E1's Links call classification-ui §2.1 "Universes screens". §2.1 is
    Placement.

### BR-3 Coverage (Reverse Traceability)

Every capability AC, AC-1 to AC-23, maps to at least one EPIC (see the
matrix). There is no `UNCOVERED-AC`. Each of the seven new components has a
home:

| Component | EPIC |
|-----------|------|
| universe-service | E1 |
| research-store `0005` | E1 |
| factor-engine | E2 |
| classification-scheduler | E2 |
| research-store `0006` | E2 |
| classification-reader | E3 |
| classification-api | E1 (universes routes), E3 (classifications routes) |
| classification-ui | E1, E4, E5 |

- **FINDING-2 (HIGH).** No EPIC owns the API-side composition seam. System
  design §4.2 has two interfaces, *Router registration* and *Scheduler start*.
  §8 question 4 lists two of its nine delivered files, `src/factorflow/api/app.py`
  and `tests/unit/test_api_no_secrets.py`, under `classification-api`. That
  work is classification-api §2.3: two `include_router` calls, plus creating
  and cancelling the scheduler task in `_lifespan` beside the reclaim task. It
  also covers extending the delivered no-secrets test (DEC-0064, DEC-0084). No
  EPIC's goals, ACs or NFRs carry it:
  - E2 owns the scheduler but stops short of starting it. The scheduler design
    says the composition edit is classification-api's.
  - E1 and E3 link classification-api §2.4–2.7 only.
  - E4's Links name "Router registration; Scheduler start consumer", but E4 is
    the UI EPIC, and its NFR limits its delivered-file edits to the UI files.

  If this seam is dropped, none of E1's or E3's endpoints is mounted and AC-10
  never runs at runtime. If two EPICs each take it, `app.py` gets two
  conflicting edits.
- **FINDING-3 (MEDIUM).** E4 leaves out the Research inspector. That is the
  S03 pane covered by classification-ui §2.5 *The inspector*, blueprint §4.5
  and S03-3. On the Research screen, the inspector is the only place that
  shows:
  - the standardised score. The list cell is percentile plus bar only, per
    DAC-E4-1 and classification-ui §2.5.
  - each factor's inputs with their `as_of` and `known_on` (AC-17, S03-3).
  - the memberships line (DEC-0071).

  E4's goals and ACs never mention it, AC-17 is not among E4's ACs, and
  DAC-E4-1 describes the percentile-only cell. So AC-9's "standardised score
  together with a percentile" has no derived AC on Research, and approved
  acceptance check S03-3 is untraced.
- **FINDING-4 (MEDIUM).** E4 does not carry AC-23 (the restatement mark).
  classification-ui §2.5 (`restated-mark.tsx`) and approved S03-6 require the
  *Possibly restated* mark on every percentile it applies to, including the
  Research results and the inspector. E4's NFR cites AC-23, but no E4 AC or
  derived AC requires the mark. DAC-E5-5 covers only Compare and Stock
  evidence.
- **FINDING-5 (MEDIUM).** AC-15's display obligation is not carried where it
  applies. AC-15 says a retired stock is "shown in its universes as not
  classified because it is retired". The two surfaces that show a stock's
  universes are:
  - Research under a universe scope (E4)
  - the Universe detail Members tab (E1)

  Neither carries it as an AC. E1 lists AC-15 for the "membership side" only.
  DAC-E4-1 lists three cell renderings (scored, Incomplete, Not enough to
  rank), while E4's own traceability row calls it "Four cell renderings". The
  fourth, *Not followed* in `factor-cell.tsx` (classification-ui §2.5,
  DEC-0073), is the missing one. DAC-E3-5 (read side) and DAC-E5-3 (Compare
  and evidence) do not cover it.

### BR-4 Testability

Every derived AC names something that can be observed:

- codes: `universe_name_in_use`, `last_member`, `classification_set_changed`,
  `not_enough_stocks`
- numeric bounds: 30 stocks, 6 months, 2–6 symbols, 3000 instruments, the
  AC-11 budget less one poll interval
- fixed strings: "Not enough to rank", "Incomplete", "Not followed"

None of the vague modifiers BR-4 lists ("should", "fast", "appropriate",
"etc.") appears. The absent list-read latency target (E3 open question) is
carried from system design §8 question 8 and does not undermine an EPIC AC.
No findings.

### BR-5 Single-Component Scoping

This dimension applies to stories and is not assessed for `SCOPE=epics`. Each
EPIC names the components it spans, and the component split looks
decomposable into single-component stories. The one exception is the app.py
seam in FINDING-2, which has no home yet. No findings.

### BR-6 Consistency and Sequencing

The IDs `CAP-002-E1` to `CAP-002-E5` are unique and follow the convention. The
backlog's EPIC count (5) and its traceability rows match the EPIC files.

At EPIC level there are two mutual dependencies, E1 with E3 and E1 with E4.
Both E1 and the backlog's Sequencing section state them deliberately as
story-level orderings:

- E1's filter-save story comes after E3's `evaluate_filter`.
- E1's screens come after E4's composition seam.

So no `SEQUENCING-INVERSION` is raised. Story generation must encode both
orderings in `dependencies.yaml`.

- **FINDING-6 (MEDIUM).** E1 understates its dependencies. Its Universe detail
  Members tab "is S03's results pane and inspector scoped to the universe"
  (UX design §1.4). classification-ui implements it with `results-table.tsx`
  ("shared with 1.4") and `members-tab.tsx` ("results-table scoped") in §2.1,
  and §2.3 shows Universe detail reading `GET /api/classifications` (scoped)
  and `GET /api/classifications/stocks/{symbol}`. So E1 also depends on:
  - E4's results table, factor cell and inspector, not only the shell seam.
  - E3's universe-scoped list read and evidence read, not only
    `evaluate_filter`.

  E1's Dependencies and the backlog's diagram name only the seam and
  `evaluate_filter`.
- **FINDING-8 (LOW).** The backlog contradicts E2 about the volume test. The
  backlog's Sequencing says E2's "volume test and the value/growth inputs wait
  on the owner's payload-key answer". E2's own open question and
  factor-engine §14 question 1 and §7 say the volume test is not blocked,
  because test fixtures declare their own payload keys.
- **FINDING-10 (LOW).** E1 and E4 both claim the classification-ui §2.7
  dialogs. E1's Links claim "2.7 (Save/Add/Remove/Retire dialogs)", but E4
  owns the Save-as-universe and Add-to-universe dialogs (its Goals, AC-2 and
  DAC-E4-5). That risks duplicate stories for the same two dialogs.

---

## Findings Summary Table

| ID | Severity | Dimension | Artifact | Location | Description | Impact | Recommendation |
|----|----------|-----------|----------|----------|-------------|--------|----------------|
| FINDING-1 | HIGH | BR-2 | CAP-002-E4 | DAC-E4-6; NFR *Composition discipline*; Dependencies | Says only the navigation-count assertions change ("no other assertion"); system design §8 Q4 (DEC-0084) and classification-ui §2.2 also change `routes.test.tsx`'s route-source assertion (lines 105–118) | A story that follows DAC-E4-6 cannot pass the delivered test without breaking its own AC | Amend DAC-E4-6, the NFR and Dependencies to name the route-source assertion as the one permitted extra change, quoting the §8 Q4 list |
| FINDING-2 | HIGH | BR-3 | Backlog; E1, E2, E3, E4 | No EPIC goal or AC; E4 Links only | The API composition seam (classification-api §2.3: `app.py` router registration and scheduler start/stop; extending `test_api_no_secrets.py`) belongs to no EPIC | Routes might not be mounted and AC-10 might never run, or `app.py` gets two conflicting edits | Give the seam to one EPIC (E3 is the natural owner of classification-api's composition) with a derived AC tracing to AC-10 and AC-16; remove the stray Router/Scheduler links from E4, or reconcile them with its NFR; note the E2 → seam dependency |
| FINDING-3 | MEDIUM | BR-3 | CAP-002-E4 | Goals; EPIC ACs | The Research inspector is missing: standardised score (AC-9), inputs' `as_of`/`known_on` (AC-17, S03-3), memberships | Story generation could leave out a third of S03 and the only Research display of the standardised score | Add AC-17 (inspector side) and a derived AC for the inspector: percentile and signed standardised score, inputs with dates, memberships, 150 ms debounced read |
| FINDING-4 | MEDIUM | BR-3 | CAP-002-E4 | EPIC ACs | AC-23 is only cited in an NFR; no AC or derived AC requires the *Possibly restated* mark in the Research list and inspector (S03-6) | The mark could be left out on the main list surface (STD-UI-17) | Add AC-23 (display side) to E4 with a derived AC covering results cells and inspector |
| FINDING-5 | MEDIUM | BR-3 | CAP-002-E4, CAP-002-E1 | DAC-E4-1; E1 AC-15 annotation | No AC carries AC-15's "shown in its universes" display on Research under a universe scope or on the Universe detail Members tab; DAC-E4-1 lists three cell renderings while its traceability row says four | The *Not followed* rendering on universe surfaces has no AC to test against | Add the *Not followed* rendering to DAC-E4-1 and list AC-15 (display side) on E4; widen E1's AC-15 note to its Members tab |
| FINDING-6 | MEDIUM | BR-6 | CAP-002-E1, backlog | Dependencies; Sequencing diagram | The Universe detail Members tab reuses E4's results table, factor cell and inspector, and reads E3's scoped list and evidence; only the shell seam and `evaluate_filter` are declared | Hidden dependencies show up as stop-start work during implementation | State both dependencies in E1 and the backlog so story generation encodes them in `dependencies.yaml` |
| FINDING-7 | LOW | BR-2 | CAP-002-E4 | DAC-E4-6 | Derived AC traces to no capability AC, against `$epic-generation` constraint 6 | Traceability convention broken; no functional effect | Trace to AC-16 (screens must be reachable for sort, filter and compare) or recast it as an NFR |
| FINDING-8 | LOW | BR-6 | CAP-002-backlog | Sequencing, E2 bullet | Says E2's volume test waits on the payload keys; E2 and factor-engine §7/§14 say it does not | Could schedule the volume test as blocked when it is not | Correct the backlog sentence |
| FINDING-9 | LOW | BR-2 | CAP-002-E1, backlog | E1 Links, E1 traceability AC-5, backlog AC-5 row | Cites a universe-service §2.8 that does not exist; mislabels classification-api §2.6 as error mapping (it is §2.5); calls classification-ui §2.1 "Universes screens" (it is Placement) | Readers follow dead or wrong references | Fix to universe-service §2.4, classification-api §2.5 and §2.7, and UX design §1.3–1.4 or classification-ui §10 |
| FINDING-10 | LOW | BR-6 | CAP-002-E1, CAP-002-E4 | E1 Links | E1 and E4 both claim the Save/Add dialogs of classification-ui §2.7 | Duplicate stories for the same two dialogs | Limit E1's §2.7 link to the create, rename, Remove and Retire dialogs and the refusals |

---

## Traceability Matrix

| Capability AC | EPIC(s) | Story(ies) | Status |
|---------------|---------|------------|--------|
| AC-1 | E1 | — | Covered |
| AC-2 | E1, E4 | — | Covered |
| AC-3 | E1 | — | Covered |
| AC-4 | E1 | — | Covered |
| AC-5 | E1, E4 | — | Covered |
| AC-6 | E1 | — | Covered |
| AC-7 | E2 | — | Covered |
| AC-8 | E2 | — | Covered |
| AC-9 | E2, E3, E4 | — | Covered (Research display of the standardised score has no derived AC, FINDING-3) |
| AC-10 | E2 | — | Covered (runtime trigger unowned, FINDING-2) |
| AC-11 | E2, E4 | — | Covered |
| AC-12 | E2, E3 (DAC-E3-3), E4 | — | Covered |
| AC-13 | E2, E3, E5 | — | Covered |
| AC-14 | E2, E3 (DAC-E3-4), E4 | — | Covered |
| AC-15 | E1, E2, E3 (DAC-E3-4, DAC-E3-5), E5 | — | Covered (universe-surface display has no AC, FINDING-5) |
| AC-16 | E3, E4, E5 | — | Covered |
| AC-17 | E3, E5 | — | Covered (Research inspector side missing, FINDING-3) |
| AC-18 | E3, E5 | — | Covered |
| AC-19 | E2, E5 | — | Covered |
| AC-20 | E2, E3, E4 | — | Covered |
| AC-21 | E3, E4 | — | Covered |
| AC-22 | E3, E4 | — | Covered |
| AC-23 | E2, E3, E5 | — | Covered (Research list and inspector missing, FINDING-4) |

The Story column is empty because `SCOPE=epics`.

---

## Readiness Assessment

**Verdict:** READY-WITH-WARNINGS

There are no CRITICAL findings:

- Every capability AC is covered.
- No EPIC is empty.
- No two ACs contradict each other.

There are two HIGH findings. FINDING-1 is a cross-layer inconsistency in
DAC-E4-6. FINDING-2 is a design interface that no EPIC owns, and AC-10 depends
on it at runtime. Neither stops story generation from starting. Both should be
fixed before stories are generated for E3 and E4: otherwise the inconsistency
and the unowned seam pass straight into story ACs. The four MEDIUM findings are
narrow additions to E4 and E1. The four LOW findings are wording and
reference fixes.

A passing verdict is not an approval. Approval stays a separate, explicit
owner action (`scripts/artifact-gate.py approve`). Under `owner-allowed`, the
owner may author, review and approve. If the owner wants to accept a finding
for now, the documented expiring waiver process in `docs/approval-gates.md`
applies. This review creates no waiver.

---

## Recommendations

### Must Fix (CRITICAL and HIGH)

1. FINDING-1: amend DAC-E4-6, E4's *Composition discipline* NFR and E4's
   Dependencies paragraph so they name the `routes.test.tsx` route-source
   assertion (lines 105–118) as the one permitted change beyond the four
   navigation counts, matching system design §8 question 4.
2. FINDING-2: give classification-api §2.3 (the `app.py` router registration
   and scheduler start/stop) and the `test_api_no_secrets.py` extension to one
   EPIC, with a derived AC tracing to AC-10. Then reconcile E4's Links with its
   NFR.

### Should Fix (MEDIUM)

1. FINDING-3: add the Research inspector to E4: AC-17 (inspector side) and a
   derived AC covering the standardised score, the inputs' dates and the
   memberships.
2. FINDING-4: add AC-23 (display side) to E4 for the results cells and the
   inspector.
3. FINDING-5: add the *Not followed* rendering to DAC-E4-1, add AC-15 (display
   side) to E4, and widen E1's AC-15 note to the Members tab.
4. FINDING-6: declare E1's dependencies on E4's shared results table and
   inspector, and on E3's scoped list and evidence reads.

### Nice to Have (LOW)

1. FINDING-7: trace DAC-E4-6 to a capability AC, or recast it as an NFR.
2. FINDING-8: correct the backlog's statement that the volume test is blocked.
3. FINDING-9: fix the three wrong section references.
4. FINDING-10: split the classification-ui §2.7 dialog ownership explicitly
   between E1 and E4.
