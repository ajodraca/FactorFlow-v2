---
artifact_schema_version: 1
artifact_id: CAP-002-backlog-review
artifact_type: backlog-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
document: backlog-review-report
capability: CAP-002
scope: epics
version: v2
generated: 2026-10-17T14:55:19Z
review_subjects:
  - artifact_id: CAP-002-backlog
    artifact_version: 2
    content_revision: sha256:9eb429db7d13f3beee5cfec2d0170285811a6ebeafb7ece77c89a0a3c5d5f62e
  - artifact_id: CAP-002-E1
    artifact_version: 1
    content_revision: sha256:d9836f2afaa69ecab634cc7067b4685e25a9137fc11b0a7a7f5c9e0afbfc1019
  - artifact_id: CAP-002-E2
    artifact_version: 1
    content_revision: sha256:952179e4b95b7ca0aff1389da0ac067ae1baf59db11f7b97d634f63acd782456
  - artifact_id: CAP-002-E3
    artifact_version: 2
    content_revision: sha256:9754251fe84bb7bd65e2fdd0b78d31e1c71a92fad916a7833b326dbc70d5f66a
  - artifact_id: CAP-002-E4
    artifact_version: 2
    content_revision: sha256:5cbf2c4447979439776dff424a054b5c0a6f37cedfb840680551dd371ae0c11c
  - artifact_id: CAP-002-E5
    artifact_version: 1
    content_revision: sha256:d65ec48306f571eb778e59e3bf8f222b4b26c55c1d70ea885785f1f231122e59
statistics:
  epics_reviewed: 5
  stories_reviewed: 0
  total_findings: 9
  critical: 0
  high: 0
  medium: 5
  low: 4
readiness: READY
ai_provenance:
  agent_id: backlog-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T14:55:19Z
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
      version: "2"
    - id: CAP-002-E1
      version: "1"
    - id: CAP-002-E2
      version: "1"
    - id: CAP-002-E3
      version: "2"
    - id: CAP-002-E4
      version: "2"
    - id: CAP-002-E5
      version: "1"
  invoking_user: ajodraca
  correlation_id: fffdf049-e039-4cc9-bc8b-754ddd7582e7
---

# Backlog Review Report -- CAP-002

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-002 |
| **Scope** | epics |
| **EPICs Reviewed** | 5 |
| **Stories Reviewed** | 0 |
| **Total Findings** | CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 4 · **total 9** |
| **Readiness** | READY |

This is the second review of CAP-002's EPICs. Since v1 the owner amended E3,
E4 and the backlog (commit `586b822`) to answer v1's two HIGH findings. Both
are fixed:

- **FINDING-1 (fixed).** DAC-E4-6, E4's *Composition discipline* NFR and E4's
  Dependencies now name `routes.test.tsx`'s route-source assertion as the one
  delivered-test edit beyond the four navigation counts. This matches system
  design v3 §8 question 4 (DEC-0084) and classification-ui §2.1–2.2.
- **FINDING-2 (fixed).** E3 now owns the API composition seam: a goal, an NFR,
  AC-10 on its start side and DAC-E3-13. These match classification-api §2.3,
  §4 and §7 and system design §4.2. E4 no longer links the seam.

E1, E2 and E5 are byte-identical to v1: their content revisions match v1's
`review_subjects`. No upstream artifact changed after v1. So the eight
findings v1 raised against unchanged text are all still there, at their v1
severities: FINDING-3 to FINDING-6 (MEDIUM) and FINDING-7 to FINDING-10 (LOW).

The amendment brings one new MEDIUM finding, FINDING-11. E3 says E1's API
stories depend on E3's composition story. The approved `app.py` edit runs the
other way: it imports the `universes` router module, so the composition story
cannot land until that router exists.

With no CRITICAL or HIGH findings, the verdict is **READY**. This run was
unattended. The review made no product decision and wrote no decision record.

## Review Scope

Reviewed for `SCOPE=epics` on branch `usr/alvaro-de-jodra/CAP-002-epics` at
commit `586b822`:

- `backlog.md` (CAP-002-backlog v2, draft; amended)
- `epics/universe-definition-and-maintenance/CAP-002-E1.md` (v1, draft; unchanged since review v1)
- `epics/automatic-factor-classification-engine/CAP-002-E2.md` (v1, draft; unchanged)
- `epics/classification-read-api/CAP-002-E3.md` (v2, draft; amended)
- `epics/research-screen-scores-and-filtering/CAP-002-E4.md` (v2, draft; amended)
- `epics/compare-stock-evidence-and-diagnosis/CAP-002-E5.md` (v1, draft; unchanged)

These were checked against the same upstream artifacts as v1:

- `Capability-CAP-002.md` v1 (approved)
- `design/system-design.md` v3 (approved)
- the seven component designs: universe-service v2, factor-engine v2,
  classification-scheduler v2, classification-reader v3, classification-api
  v3, classification-ui v3 and research-store v2
- `ux-design.md` v3 and `ux-brief.md` v3

`git log c7d81a5..HEAD` lists no commit touching the capability or `design/`.

Evidence commands, all run from the harness main checkout:

- `scripts/check-prerequisites.sh --project factorflow-v2`: PASSED, all eight
  checks. The script had to run outside the Bash sandbox, which refuses the
  temporary file its here-documents create. It is read-only.
- `scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --stage epic-generation`:
  `RESUME — backlog review does not cover current .../CAP-002-E3.md`. This is
  the expected entry condition, since E3, E4 and the backlog changed after v1.
- `scripts/check-artifacts.py --project factorflow-v2 --artifact docs/capabilities/CAP-002-universe-and-factor-classification --strict --allow-unchanged-legacy`:
  PASSED with the same 10 warnings as v1. None of them concerns an EPIC or the
  backlog. The capability pins STD-UI v4 (v6 is current), and the seven
  component designs, the UX brief and the UX design pin specification review
  v2 (v3 is current). These are upstream pins and do not bear on the work
  breakdown, so they are recorded here and not raised as findings.
- `scripts/artifact-gate.py revision` was run for each of the six artifacts
  above. The digests are in `review_subjects`. E1, E2 and E5 match their v1
  digests exactly.

Reviewer note, carried from v1: the rubric's BR-2 text names `AC-N.M`
numbering for derived ACs. The `$epic-generation` skill requires
`DAC-E<n>-<m>` (constraint 6), and every EPIC uses that correctly. This review
applies the skill's convention.

### Status of v1 findings

| v1 finding | v1 severity | Status in v2 | Evidence (current revision) |
|------------|-------------|--------------|-----------------------------|
| FINDING-1 (v1) | HIGH | **Fixed** | E4 line 86 (DAC-E4-6 names "`routes.test.tsx`'s route-source assertion (lines 105–118) gaining the five `/research` paths … (system design section 8 question 4, DEC-0084)"); line 62 (NFR: four counted-assertion edits plus one route-source-assertion edit, "the seven `classification-ui` rows" of §8 Q4, which has exactly seven `classification-ui` rows); line 44 (Dependencies) |
| FINDING-2 (v1) | HIGH | **Fixed** | E3 line 54 (goal), line 63 (NFR: exactly `app.py` and `test_api_no_secrets.py`), line 70 (AC-10, start side), line 94 (DAC-E3-13: routers before the Host/Origin and request-id middleware and the static mount; the scheduler task from `ClassificationSettings()` beside the reclaim task, cancelled on shutdown; the no-secrets test extended), line 42 (E2 scheduler story before the composition story). This matches classification-api §2.3 and the §7 rows "Routers registered behind middleware", "Scheduler task lifecycle" and "No credential in any CAP-002 response". E4 line 45 drops Router registration and Scheduler start and points the API-side §8 Q4 rows to E3. Backlog line 116 adds E3 to the AC-10 row, and lines 68–70 name the seam's owner. |
| FINDING-3 (v1) | MEDIUM | **Carried** | E4 lines 49–54 (Goals) and 68–86 (ACs) still never mention the Research inspector; AC-17 is not among E4's ACs; DAC-E4-1 (line 81) is the percentile-only cell |
| FINDING-4 (v1) | MEDIUM | **Carried** | E4 line 58 cites AC-23 only in an NFR; no E4 AC or DAC requires the *Possibly restated* mark |
| FINDING-5 (v1) | MEDIUM | **Carried** | E4 line 81 (DAC-E4-1) still lists three renderings; line 106 still reads "Four cell renderings"; E1 line 78 still limits AC-15 to the "membership side" |
| FINDING-6 (v1) | MEDIUM | **Carried** | E1 line 48 (Dependencies) and backlog lines 72–78 (diagram) still name only the shell seam and `evaluate_filter` |
| FINDING-7 (v1) | LOW | **Carried** | E4 line 86 still reads "traces to the composition constraint, AGT-SCOPE-002; not a capability AC"; line 111's Capability AC column is still `n/a` |
| FINDING-8 (v1) | LOW | **Carried** | Backlog lines 80–83 still say E2's "volume test … wait[s] on the owner's payload-key answer" |
| FINDING-9 (v1) | LOW | **Carried** | E1 line 105 and backlog line 111 still cite "universe-service 2.4, 2.8"; E1 line 49 still labels classification-api 2.6 "error mapping" and classification-ui 2.1 "Universes screens" |
| FINDING-10 (v1) | LOW | **Carried** | E1 line 49 still claims "2.7 (Save/Add/Remove/Retire dialogs)" while E4 owns Save and Add (E4 lines 53, 85) |

None of the carried findings changed form. The amendment did not touch the
text they rest on. One detail sharpens FINDING-7: DAC-E3-13, the API-side
counterpart of DAC-E4-6, traces to AC-10 and AC-16. That gives the owner a
precedent within the backlog for tracing DAC-E4-6 to AC-16.

---

## Findings by Dimension

### BR-1 Completeness

Every primary flow and use case in the system design maps to an EPIC:

- classification after a run: E2, with E3's composition story starting the
  loop
- universe writes: E1
- reading classifications and evidence: E3, E4, E5

Each EPIC has a summary stating its value, actors, goals, NFRs, capability and
derived ACs, dependencies, links, traceability and open questions. None is a
placeholder. E3's v2 additions are substantive, not stubs:

- a goal
- an NFR
- a capability AC with a stated side
- a derived AC and its traceability row

Owner questions are still carried as `[REQUIRES INPUT]` with what each one
blocks: universe name length (E1) and the Massive payload keys (E2).

No findings.

### BR-2 Alignment with Upstream

DAC-E3-13 was checked against classification-api §2.3, which shows three
insertions in `app.py`:

- the two router imports and `include_router` calls, placed before
  `_add_host_origin_middleware`, `_add_request_id_middleware` and
  `_add_static_mount`
- the `classification_task` created from `run_classification_loop(pool=pool, settings=ClassificationSettings())`
  after the reclaim task
- both tasks cancelled in the `finally` block

It was also checked against the §7 test rows and system design §4.2 (Router
registration; Scheduler start) and §8 question 4. DAC-E3-13 agrees with all of
them. "No other delivered API file changes" matches classification-api §2.1:
"the delivered files this component edits are `app.py` and
`tests/unit/test_api_no_secrets.py` and no other". E3's new actor, `ingestion-api`,
is correct, because system design §8 question 4 says `app.py` is "owned by
`ingestion-api`", with the CAP-002 edit assigned to `classification-api`.

DAC-E4-6 was checked against classification-ui §2.1–2.2 and §8 question 4:
`routes.test.tsx` lines 75 and 105–118, with "No other assertion in the four
files changes". It now agrees with both.

The other derived ACs are unchanged and their v1 alignment stands. No scope
drift was found.

- **FINDING-7 (LOW, carried).** DAC-E4-6 still traces to no capability AC
  (E4 line 86; traceability line 111 `n/a`). `$epic-generation` constraint 6
  requires a parent capability AC. DAC-E3-13 now traces the matching API seam
  to AC-10 and AC-16, so the two composition DACs follow different rules.
- **FINDING-9 (LOW, carried).** Three references are still wrong:
  - E1 traceability (line 105) and backlog AC-5 row (line 111) cite
    "universe-service 2.8". The design's §2 ends at 2.6.
  - E1 Links (line 49) label classification-api "2.6 (… error mapping)".
    Error mapping is §2.5.
  - E1 Links call classification-ui §2.1 "Universes screens". §2.1 is
    Placement.

### BR-3 Coverage (Reverse Traceability)

Every capability AC, AC-1 to AC-23, still maps to at least one EPIC. There is
no `UNCOVERED-AC`. The API composition seam now has a home:

| Component / seam | EPIC |
|------------------|------|
| universe-service | E1 |
| research-store `0005` | E1 |
| factor-engine | E2 |
| classification-scheduler | E2 (loop) |
| research-store `0006` | E2 |
| classification-reader | E3 |
| classification-api | E1 (universes routes), E3 (classifications routes; `app.py` seam and `test_api_no_secrets.py`, DAC-E3-13) |
| classification-ui | E1, E4 (incl. shell seam, DAC-E4-6), E5 |

- **FINDING-3 (MEDIUM, carried).** E4 still leaves out the Research inspector.
  This is classification-ui §2.5 *The inspector* (`inspector-panel.tsx`),
  blueprint §4.5 and S03-3. On the Research screen it is the only place that
  shows:
  - the standardised score. Per classification-ui §2.5 the list cell holds
    "the standardised score never appears in the list (inspector and evidence
    only)".
  - each input's `as_of` and `known_on` (AC-17).
  - the memberships line (DEC-0071).

  AC-17 is not among E4's ACs, so AC-9's standardised score has no derived AC
  on Research and S03-3 is untraced.
- **FINDING-4 (MEDIUM, carried).** AC-23 is cited only in E4's *Honesty in
  rendering* NFR (line 58). No E4 AC requires the *Possibly restated* mark that
  classification-ui §2.5 places on "the results, the inspector, universe
  detail, compare, evidence and history" (S03-6, STD-UI-17). DAC-E5-5 covers
  only Compare and Stock evidence.
- **FINDING-5 (MEDIUM, carried).** No AC carries AC-15's "shown in its
  universes as not classified because it is retired" on the two surfaces that
  show a stock's universes:
  - Research under a universe scope (E4)
  - Universe detail's Members tab (E1)

  classification-ui §2.5 renders *Not followed* in `factor-cell.tsx` "only
  under a universe scope, on universe detail, compare and evidence". DAC-E4-1
  (line 81) lists three renderings while its traceability row (line 106) says
  four. E1's AC-15 (line 78) is the membership side only.

### BR-4 Testability

DAC-E3-13 is observable at three points:

- the router order relative to the three named `_add_*` calls
- task creation and cancellation in `_lifespan`, which classification-api §7
  already proves in `tests/unit/test_api_classification_lifespan.py`
- the extended no-credential assertion over named routes

The amended DAC-E4-6 names exact files, lines and the paths gained. No vague
modifier from BR-4's list appears in the amended text. The other ACs are
unchanged and v1's assessment stands. The missing list-read latency target is
still an honest open question from system design §8 question 8, not an
untestable EPIC AC.

No findings.

### BR-5 Single-Component Scoping

This dimension applies to stories and is not assessed for `SCOPE=epics`. v1
noted that the `app.py` seam had no home. It now sits in E3 as
`classification-api` work, so one single-component story can carry it: system
design §8 question 4 assigns both `app.py` and `test_api_no_secrets.py` to
`classification-api`. The other EPICs still split cleanly into
single-component stories.

No findings.

### BR-6 Consistency and Sequencing

The IDs `CAP-002-E1` to `CAP-002-E5` are unique and follow the convention. The
backlog's EPIC count (5) and its traceability rows match the EPIC files,
including the amended AC-10 row (E2, E3).

The E1↔E3 and E1↔E4 reciprocities from v1 are still stated deliberately as
story-level orderings in E1 (line 48), E3 (line 42) and the backlog (lines
64–67). So no `SEQUENCING-INVERSION` is raised.

- **FINDING-6 (MEDIUM, carried).** E1's Universe detail Members tab is
  "results-table scoped" (classification-ui §2.1, `members-tab.tsx`;
  `results-table.tsx` "shared with 1.4"). Per classification-ui §2.3 it also
  reads `GET /api/classifications` (members table) and
  `GET /api/classifications/stocks/{symbol}` (inspector). So E1 also depends
  on:
  - E4's results table, factor cell and inspector
  - E3's universe-scoped list read and evidence read

  E1's Dependencies (line 48) and the backlog diagram (lines 72–78) still name
  only the shell seam and `evaluate_filter`.
- **FINDING-8 (LOW, carried).** The backlog (lines 80–83) still says E2's
  volume test waits on the payload-key answer. E2's own open question (line
  132: "the volume test are unaffected and not blocked") and factor-engine §7
  and §14 question 1 say it does not.
- **FINDING-10 (LOW, carried).** E1's Links (line 49) still claim classification-ui
  §2.7 "Save/Add/Remove/Retire dialogs". E4 owns Save-as-universe and
  Add-to-universe (Goals line 53; DAC-E4-5).
- **FINDING-11 (MEDIUM, new, introduced by E3 v2).** E3's Dependencies (line
  42) get the ordering between the composition story and the router stories
  backwards. They say "E1's API stories depend back on that same composition
  story, since the one `app.py` edit mounts the `universes` router too". The
  approved edit (classification-api §2.3) starts with
  `from factorflow.api.routes import classifications, …, universes` plus the
  scheduler and settings imports. So the composition story cannot be
  implemented, or even import, until three things exist:
  - E1's `routes/universes.py`
  - E3's own `routes/classifications.py`
  - E2's scheduler

  E3 declares the E2 ordering correctly. The router orderings are inverted for
  E1 and missing for E3's own router.

  E1 (line 48) and the backlog's Sequencing (lines 64–78) say nothing about
  any of this. The backlog says only that the seam "lands after E2's
  scheduler story" (line 70). If story generation copies E3's sentence into
  `dependencies.yaml` while the composition story's own technical details
  follow the design's imports, the E1 router story and the composition story
  depend on each other. The result is either a cycle that `check-artifacts.py`
  rejects or a story that cannot be built in the stated order.

  The runtime point behind E3's sentence is real: E1's endpoints are not
  reachable until mounted, and E1's integration tests exercise the mounted
  app. But that is a reason to order the composition story **before** E1's
  integration-level acceptance, not before E1's router module. Severity is
  MEDIUM per the rubric's BR-6 treatment of dependency defects. The fix is
  one sentence, and the cycle check would catch the worst case.

---

## Findings Summary Table

| ID | Severity | Dimension | Artifact | Location | Description | Impact | Recommendation |
|----|----------|-----------|----------|----------|-------------|--------|----------------|
| FINDING-3 | MEDIUM | BR-3 | CAP-002-E4 | Goals (lines 49–54); EPIC ACs (lines 68–86) | Carried from v1. The Research inspector is missing: the standardised score (AC-9), inputs' `as_of`/`known_on` (AC-17, S03-3) and memberships | Story generation could leave out a third of S03 and the only Research display of the standardised score | Add AC-17 (inspector side) and a derived AC for the inspector: percentile and signed standardised score, inputs with dates, memberships, the 150 ms debounced read |
| FINDING-4 | MEDIUM | BR-3 | CAP-002-E4 | EPIC ACs; NFR line 58 | Carried. AC-23 is cited only in an NFR; no AC requires the *Possibly restated* mark in the Research list and inspector (S03-6) | The mark could be left out on the main list surface (STD-UI-17) | Add AC-23 (display side) to E4 with a derived AC covering results cells and inspector |
| FINDING-5 | MEDIUM | BR-3 | CAP-002-E4, CAP-002-E1 | E4 DAC-E4-1 (line 81) vs line 106; E1 AC-15 (line 78) | Carried. No AC carries AC-15's "shown in its universes" display on Research under a universe scope or the Members tab; DAC-E4-1 lists three renderings while its row says four | The *Not followed* rendering on universe surfaces has no AC to test against | Add *Not followed* to DAC-E4-1 and AC-15 (display side) to E4; widen E1's AC-15 note to the Members tab |
| FINDING-6 | MEDIUM | BR-6 | CAP-002-E1, backlog | E1 Dependencies (line 48); backlog diagram (lines 72–78) | Carried. The Members tab reuses E4's results table, factor cell and inspector, and reads E3's scoped list and evidence; only the shell seam and `evaluate_filter` are declared | Hidden dependencies show up as stop-start work during implementation | State both in E1 and the backlog so story generation encodes them in `dependencies.yaml` |
| FINDING-11 | MEDIUM | BR-6 | CAP-002-E3 (also E1, backlog) | E3 Dependencies (line 42); backlog Sequencing (lines 64–78) | New. E3 says E1's API stories depend on the composition story, but the approved `app.py` edit imports the `universes` and `classifications` router modules, so the composition story depends on E1's and E3's router stories (as well as E2's scheduler story); E1 and the backlog state neither direction | Copying E3's sentence into `dependencies.yaml` creates a cycle with the composition story's real prerequisites, or schedules a story that cannot import | Reverse the sentence: the composition story lands after E2's scheduler story, E1's universes-router story and E3's classifications-router story; E1's integration-level route tests come after the composition story. Mirror this in E1's Dependencies and the backlog Sequencing |
| FINDING-7 | LOW | BR-2 | CAP-002-E4 | DAC-E4-6 (line 86); traceability (line 111) | Carried. The derived AC traces to no capability AC, against `$epic-generation` constraint 6; DAC-E3-13, the matching API seam, traces to AC-10 and AC-16 | Traceability convention broken and the two seam DACs follow different rules; no functional effect | Trace DAC-E4-6 to AC-16, as DAC-E3-13 does, or recast it as an NFR |
| FINDING-8 | LOW | BR-6 | CAP-002-backlog | Sequencing, E2 bullet (lines 80–83) | Carried. Says E2's volume test waits on the payload keys; E2 (line 132) and factor-engine §7/§14 say it does not | Could schedule the volume test as blocked when it is not | Correct the backlog sentence |
| FINDING-9 | LOW | BR-2 | CAP-002-E1, backlog | E1 Links (line 49), E1 traceability AC-5 (line 105), backlog AC-5 row (line 111) | Carried. Cites a universe-service §2.8 that does not exist; mislabels classification-api §2.6 as error mapping (it is §2.5); calls classification-ui §2.1 "Universes screens" (it is Placement) | Readers follow dead or wrong references | Fix to universe-service §2.4, classification-api §2.5 and §2.7, and UX design §1.3–1.4 or classification-ui §10 |
| FINDING-10 | LOW | BR-6 | CAP-002-E1, CAP-002-E4 | E1 Links (line 49) | Carried. E1 and E4 both claim the Save/Add dialogs of classification-ui §2.7 | Duplicate stories for the same two dialogs | Limit E1's §2.7 link to the create, rename, Remove and Retire dialogs and the refusals |

Fixed since v1, and no longer counted: FINDING-1 (HIGH, BR-2) and FINDING-2
(HIGH, BR-3). The evidence is in *Status of v1 findings* above.

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
| AC-10 | E2, E3 (DAC-E3-13) | — | Covered (runtime start now owned; v1 FINDING-2 fixed) |
| AC-11 | E2, E4 | — | Covered |
| AC-12 | E2, E3 (DAC-E3-3), E4 | — | Covered |
| AC-13 | E2, E3, E5 | — | Covered |
| AC-14 | E2, E3 (DAC-E3-4), E4 | — | Covered |
| AC-15 | E1, E2, E3 (DAC-E3-4, DAC-E3-5), E5 | — | Covered (universe-surface display has no AC, FINDING-5) |
| AC-16 | E3 (incl. DAC-E3-13), E4, E5 | — | Covered |
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

**Verdict:** READY

There are no CRITICAL findings:

- Every capability AC is covered.
- No EPIC is empty.
- No two ACs contradict each other.

There are no HIGH findings either. v1's two HIGH findings are fixed:

- FINDING-1: DAC-E4-6 and its NFR now carry the full classification-ui edit
  list from system design §8 question 4.
- FINDING-2: E3 now owns the `app.py` seam and the no-secrets test extension
  through DAC-E3-13, which matches classification-api §2.3.

The five MEDIUM findings remain. Four are carried unchanged from v1: E4's
missing inspector, the restatement mark and *Not followed* on Research, and
E1's understated dependencies. FINDING-11 is new: E3 states the composition
story's dependency on the router stories backwards. None of them blocks story
generation. Each is cheaper to fix in the EPICs than in the stories they will
seed:

- FINDING-3, FINDING-4 and FINDING-5 decide whether E4's stories carry the
  inspector, the mark and the *Not followed* rendering.
- FINDING-6 and FINDING-11 decide whether `dependencies.yaml` is right first
  time.

The four LOW findings are wording and reference fixes.

A passing verdict is not an approval. Approval stays a separate, explicit
owner action (`scripts/artifact-gate.py approve`). Under `owner-allowed`, the
same owner may author, review and approve. No peer or separate expert is
required. This review creates no waiver.

---

## Recommendations

### Must Fix (CRITICAL and HIGH)

None.

### Should Fix (MEDIUM)

1. FINDING-11: rewrite E3's Dependencies sentence so the composition story
   lands after E2's scheduler story, E1's universes-router story and E3's
   classifications-router story. State in E1 and in the backlog Sequencing
   that E1's mounted-route integration tests come after that composition
   story.
2. FINDING-3: add the Research inspector to E4: AC-17 (inspector side) and a
   derived AC covering the standardised score, the inputs' dates and the
   memberships.
3. FINDING-4: add AC-23 (display side) to E4 for the results cells and the
   inspector.
4. FINDING-5: add the *Not followed* rendering to DAC-E4-1, add AC-15 (display
   side) to E4, and widen E1's AC-15 note to the Members tab.
5. FINDING-6: declare E1's dependencies on E4's shared results table and
   inspector, and on E3's scoped list and evidence reads.

### Nice to Have (LOW)

1. FINDING-7: trace DAC-E4-6 to AC-16, as DAC-E3-13 does, or recast it as an
   NFR.
2. FINDING-8: correct the backlog's statement that the volume test is blocked.
3. FINDING-9: fix the three wrong section references in E1 and the backlog.
4. FINDING-10: split the classification-ui §2.7 dialog ownership explicitly
   between E1 and E4.
