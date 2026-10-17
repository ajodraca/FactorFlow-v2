---
artifact_schema_version: 1
artifact_id: CAP-002-backlog-review
artifact_type: backlog-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
document: backlog-review-report
capability: CAP-002
scope: epics
version: v3
generated: 2026-10-17T15:07:52Z
review_subjects:
  - artifact_id: CAP-002-backlog
    artifact_version: 3
    content_revision: sha256:d019ca6f135b540e2cdbf1a34b75966442feafcfddb657a5a58078783e96146f
  - artifact_id: CAP-002-E1
    artifact_version: 1
    content_revision: sha256:d9836f2afaa69ecab634cc7067b4685e25a9137fc11b0a7a7f5c9e0afbfc1019
  - artifact_id: CAP-002-E2
    artifact_version: 1
    content_revision: sha256:952179e4b95b7ca0aff1389da0ac067ae1baf59db11f7b97d634f63acd782456
  - artifact_id: CAP-002-E3
    artifact_version: 3
    content_revision: sha256:2624ef8ff17501c9dbe87bca8f68acfc8ac7771d6d44a207e365940922c22f98
  - artifact_id: CAP-002-E4
    artifact_version: 2
    content_revision: sha256:5cbf2c4447979439776dff424a054b5c0a6f37cedfb840680551dd371ae0c11c
  - artifact_id: CAP-002-E5
    artifact_version: 1
    content_revision: sha256:d65ec48306f571eb778e59e3bf8f222b4b26c55c1d70ea885785f1f231122e59
statistics:
  epics_reviewed: 5
  stories_reviewed: 0
  total_findings: 10
  critical: 0
  high: 0
  medium: 6
  low: 4
readiness: READY
ai_provenance:
  agent_id: backlog-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T15:07:52Z
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
      version: "3"
    - id: CAP-002-E1
      version: "1"
    - id: CAP-002-E2
      version: "1"
    - id: CAP-002-E3
      version: "3"
    - id: CAP-002-E4
      version: "2"
    - id: CAP-002-E5
      version: "1"
  invoking_user: ajodraca
  correlation_id: c64fd8ca-5a44-41e2-83f3-e154b7da5e8f
---

# Backlog Review Report -- CAP-002

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-002 |
| **Scope** | epics |
| **EPICs Reviewed** | 5 |
| **Stories Reviewed** | 0 |
| **Total Findings** | CRITICAL 0 · HIGH 0 · MEDIUM 6 · LOW 4 · **total 10** |
| **Readiness** | READY |

This is the third review of CAP-002's EPICs. Since v2 the owner amended E3
and the backlog in one commit (`bf09213`) to answer v2's one new finding,
FINDING-11. E1, E2, E4 and E5 are byte-identical to v2: their content
revisions match v2's `review_subjects`. No upstream artifact changed after v1.

- **FINDING-11 (changed form, MEDIUM).** The inversion v2 raised is fixed. E3
  and the backlog now say the API composition story imports E1's and E3's
  router modules and E2's scheduler, so it depends on all three. But the new
  text adds that "nothing depends on it at build time". Every delivered API
  route test builds the app through `create_app()`, and CAP-001 mounted each
  router in the story that built it. So under this plan the router stories'
  own route and integration tests cannot pass until the composition story
  lands, and that story is declared to come after them. v2's second
  recommendation, to place E1's mounted-route tests after the composition
  story, was not taken up, and E1 still says nothing.
- **FINDING-12 (new, MEDIUM, `SEQUENCING-INVERSION`).** The UI side has the
  same inversion FINDING-11 had on the API side. E4's composition story adds
  `routes.tsx`'s five `Route` elements. Those elements render E1's Universes
  screens and E5's Compare and Stock evidence screens, and the delivered
  `routes.tsx` imports each screen it routes. So E4's composition story
  depends on E1's and E5's screen stories. E4, E1, E5 and the backlog all say
  the reverse. E5 is a later EPIC than E4. This text has stood unchanged since
  v1, and neither v1 nor v2 raised it. It shows up now because the API side
  states the direction correctly and the UI side, built the same way, does
  not.
- The other eight findings are carried unchanged, at their v2 severities:
  FINDING-3 to FINDING-6 (MEDIUM) and FINDING-7 to FINDING-10 (LOW).

With no CRITICAL or HIGH findings, the verdict is **READY**. This run was
unattended. The review made no product decision and wrote no decision record.

## Review Scope

Reviewed for `SCOPE=epics` on branch `usr/alvaro-de-jodra/CAP-002-epics` at
commit `bf09213`:

- `backlog.md` (CAP-002-backlog v3, draft; amended)
- `epics/universe-definition-and-maintenance/CAP-002-E1.md` (v1, draft; unchanged since review v1)
- `epics/automatic-factor-classification-engine/CAP-002-E2.md` (v1, draft; unchanged)
- `epics/classification-read-api/CAP-002-E3.md` (v3, draft; amended)
- `epics/research-screen-scores-and-filtering/CAP-002-E4.md` (v2, draft; unchanged since review v2)
- `epics/compare-stock-evidence-and-diagnosis/CAP-002-E5.md` (v1, draft; unchanged)

These were checked against the same upstream artifacts as v1 and v2:

- `Capability-CAP-002.md` v1 (approved)
- `design/system-design.md` v3 (approved)
- the seven component designs: universe-service v2, factor-engine v2,
  classification-scheduler v2, classification-reader v3, classification-api
  v3, classification-ui v3 and research-store v2
- `ux-design.md` v3 and `ux-brief.md` v3

`git diff --stat c7d81a5..HEAD` touches only `backlog.md`, E3, E4 and the v2
report. `git log b9af1eb..HEAD` shows only `bf09213`, which changes E3 line
42 and backlog lines 70–72 plus their version and timestamp fields.

Evidence commands, all run from the harness main checkout:

- `scripts/check-prerequisites.sh --project factorflow-v2`: PASSED, all eight
  checks. As in v1 and v2, the script had to run outside the Bash sandbox,
  which refuses the temporary file its here-documents create. It is
  read-only.
- `scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --stage epic-generation`:
  `RESUME — backlog review does not cover current .../CAP-002-E3.md`. This is
  the expected entry condition, since E3 and the backlog changed after v2.
- `scripts/check-artifacts.py --project factorflow-v2 --artifact docs/capabilities/CAP-002-universe-and-factor-classification --strict --allow-unchanged-legacy`:
  PASSED with the same 10 warnings as v1 and v2. None of them concerns an EPIC
  or the backlog. The capability pins STD-UI v4 (v6 is current), and the seven
  component designs, the UX brief and the UX design pin specification review
  v2 (v3 is current). These are upstream pins and do not bear on the work
  breakdown, so they are recorded here and not raised as findings.
- `scripts/artifact-gate.py revision` was run for each of the six artifacts
  above. The digests are in `review_subjects`. E1, E2, E4 and E5 match their
  v2 digests exactly.
- Delivered code was read, never changed, as evidence for FINDING-11 and
  FINDING-12: `src/factorflow/api/app.py`, `tests/unit/test_api_runs_routes.py`,
  `tests/integration/test_api_runs.py`, `tests/integration/test_api_coverage.py`,
  `web/src/app/routes.tsx` and `web/src/app/routes.test.tsx`, plus commit
  `5077fcf` (CAP-001-E6-S3).

Reviewer note, carried from v1: the rubric's BR-2 text names `AC-N.M`
numbering for derived ACs. The `$epic-generation` skill requires
`DAC-E<n>-<m>` (constraint 6), and every EPIC uses that correctly. This review
applies the skill's convention.

Line numbers below are for the current revision. The backlog's lines after 70
moved down by two in `bf09213`, so backlog references carried from v2 are
updated: the diagram is now lines 74–80, the E2 bullet lines 82–85 and the
AC-5 traceability row line 113.

### Status of v2 findings

| v2 finding | v2 severity | Status in v3 | Evidence (current revision) |
|------------|-------------|--------------|-----------------------------|
| FINDING-3 (v2) | MEDIUM | **Carried** | E4 unchanged (digest `5cbf2c44…`). Goals lines 49–54 and ACs lines 68–86 still never mention the Research inspector; AC-17 is not among E4's ACs; DAC-E4-1 (line 81) is the percentile-only cell |
| FINDING-4 (v2) | MEDIUM | **Carried** | E4 line 58 still cites AC-23 only in the *Honesty in rendering* NFR; no E4 AC or DAC requires the *Possibly restated* mark |
| FINDING-5 (v2) | MEDIUM | **Carried** | E4 line 81 (DAC-E4-1) still lists three renderings while line 106 reads "Four cell renderings"; E1 line 78 still limits AC-15 to the "membership side" |
| FINDING-6 (v2) | MEDIUM | **Carried** | E1 line 48 (Dependencies) and backlog lines 74–80 (diagram) still name only the shell seam and `evaluate_filter` |
| FINDING-7 (v2) | LOW | **Carried** | E4 line 86 still reads "traces to the composition constraint, AGT-SCOPE-002; not a capability AC"; line 111's Capability AC column is still `n/a` |
| FINDING-8 (v2) | LOW | **Carried** | Backlog lines 82–85 still say E2's "volume test … wait[s] on the owner's payload-key answer"; E2 line 132 still says the volume test is "unaffected and not blocked" |
| FINDING-9 (v2) | LOW | **Carried** | E1 line 105 and backlog line 113 still cite "universe-service 2.4, 2.8"; E1 line 49 still labels classification-api 2.6 "error mapping" and classification-ui 2.1 "Universes screens" |
| FINDING-10 (v2) | LOW | **Carried** | E1 line 49 still claims "2.7 (Save/Add/Remove/Retire dialogs)" while E4 owns Save and Add (E4 lines 53, 85) |
| FINDING-11 (v2) | MEDIUM | **Changed form** (MEDIUM) | Fixed: E3 line 42 now says the composition story "depends on all three" of `routes/universes.py` (E1), `routes/classifications.py` (E3) and the scheduler module (E2). Backlog lines 70–72 say the same. This matches the imports in classification-api §2.3 (lines 218–220). The cycle v2 warned of is gone from the stated dependencies. Remaining: the same sentence says "nothing depends on it at build time", which the delivered route tests contradict (see BR-6). E1 line 48 still says nothing about the composition story, so v2's second recommendation (E1's mounted-route tests after the composition story) was not adopted |

Fixed since v1 and not re-counted: FINDING-1 and FINDING-2 (see v2).

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
placeholder. E3's v3 change rewrites one Dependencies sentence and removes
nothing else. Owner questions are still carried as `[REQUIRES INPUT]` with what
each one blocks: universe name length (E1) and the Massive payload keys (E2).

No findings.

### BR-2 Alignment with Upstream

E3 v3's Dependencies sentence was checked against classification-api §2.3
(lines 212–250). The `app.py` edit imports `classifications` and `universes`
from `factorflow.api.routes`, `run_classification_loop` from
`factorflow.classification.scheduler` and `ClassificationSettings` from
`factorflow.classification.settings`. classification-scheduler §2.1 (line 138)
places `settings.py` in the scheduler component, so naming "the scheduler
module (E2's scheduler story)" as the third prerequisite is accurate. The
backlog's new sentence agrees with E3. DAC-E3-13 and the rest of E3 are
unchanged, and v2's alignment of them stands. No scope drift was found.

- **FINDING-7 (LOW, carried).** DAC-E4-6 still traces to no capability AC
  (E4 line 86; traceability line 111 `n/a`). `$epic-generation` constraint 6
  requires a parent capability AC. DAC-E3-13 traces the matching API seam to
  AC-10 and AC-16, so the two composition DACs follow different rules.
- **FINDING-9 (LOW, carried).** Three references are still wrong:
  - E1 traceability (line 105) and backlog AC-5 row (line 113) cite
    "universe-service 2.8". The design's §2 ends at 2.6.
  - E1 Links (line 49) label classification-api "2.6 (… error mapping)".
    Error mapping is §2.5.
  - E1 Links call classification-ui §2.1 "Universes screens". §2.1 is
    Placement.

### BR-3 Coverage (Reverse Traceability)

Every capability AC, AC-1 to AC-23, still maps to at least one EPIC. There is
no `UNCOVERED-AC`. The component and seam ownership table from v2 is
unchanged:

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
  - the standardised score. Per classification-ui §2.5, "the standardised
    score never appears in the list (inspector and evidence only)".
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

E3 v3 changes no acceptance criterion. Every AC and DAC is unchanged since v2,
and v2's assessment stands: each derived AC names an observable outcome, and
DAC-E3-13 and DAC-E4-6 name exact files, calls and assertions. No vague
modifier from BR-4's list appears in the amended sentence. The missing
list-read latency target is still an honest open question from system design
§8 question 8, not an untestable EPIC AC.

No findings.

### BR-5 Single-Component Scoping

This dimension applies to stories and is not assessed for `SCOPE=epics`. The
API composition seam still sits in E3 as `classification-api` work, and the
shell seam in E4 as `classification-ui` work, so each can be carried by one
single-component story. The other EPICs still split cleanly into
single-component stories.

No findings.

### BR-6 Consistency and Sequencing

The IDs `CAP-002-E1` to `CAP-002-E5` are unique and follow the convention. The
backlog's EPIC count (5) and its traceability rows match the EPIC files. The
E1↔E3 and E1↔E4 reciprocities are still stated deliberately as story-level
orderings in E1 (line 48), E3 (line 42) and the backlog (lines 64–67), so no
`SEQUENCING-INVERSION` is raised for them.

- **FINDING-6 (MEDIUM, carried).** E1's Universe detail Members tab is
  "results-table scoped" (classification-ui §2.1, `members-tab.tsx`;
  `results-table.tsx` "shared with 1.4"). Per classification-ui §2.3 it also
  reads `GET /api/classifications` (members table) and
  `GET /api/classifications/stocks/{symbol}` (inspector). So E1 also depends
  on:
  - E4's results table, factor cell and inspector
  - E3's universe-scoped list read and evidence read

  E1's Dependencies (line 48) and the backlog diagram (lines 74–80) still name
  only the shell seam and `evaluate_filter`.
- **FINDING-8 (LOW, carried).** The backlog (lines 82–85) still says E2's
  volume test waits on the payload-key answer. E2's own open question (line
  132: "the volume test are unaffected and not blocked") and factor-engine §7
  and §14 question 1 say it does not.
- **FINDING-10 (LOW, carried).** E1's Links (line 49) still claim
  classification-ui §2.7 "Save/Add/Remove/Retire dialogs". E4 owns
  Save-as-universe and Add-to-universe (Goals line 53; DAC-E4-5).
- **FINDING-11 (MEDIUM, changed form).** The direction is now right: E3 line
  42 and backlog lines 70–72 make the composition story depend on E1's
  universes-router story, E3's classifications-router story and E2's
  scheduler story. The same sentence also says "nothing depends on it at build
  time; until it lands, E1's and this EPIC's endpoints exist but are not
  mounted". That second half does not hold for the router stories' own tests:
  - classification-api §7 (line 673) runs route tests through FastAPI
    `TestClient`. Its rows place the universes and classifications contract
    proofs in `tests/integration/test_api_universes.py`,
    `test_api_classifications.py` and `test_api_classification_summary.py`,
    and the route unit checks in `tests/unit/test_api_classifications_routes.py`
    (for example line 708, *Summary route precedence*). These are the
    acceptance evidence for E1's AC-1 to AC-6 API side and E3's DAC-E3-1 to
    DAC-E3-12.
  - Every delivered API route test builds the app through `create_app()`:
    `tests/unit/test_api_runs_routes.py` lines 15, 26 and 41;
    `tests/integration/test_api_runs.py` lines 18 and 41;
    `tests/integration/test_api_coverage.py` lines 32 and 77. A router that is
    not included in `create_app` answers none of them.
  - `tests/integration/test_api_classification_host_origin.py` (line 715)
    tests the Host and Origin middleware on CAP-002 paths. It cannot pass
    without the composed app at all.
  - CAP-001 mounted each router in the story that built it. Commit `5077fcf`
    (CAP-001-E6-S3) adds `coverage` to the `app.py` import and
    `app.include_router(coverage.router)`, together with `routes/coverage.py`
    and `tests/integration/test_api_coverage.py`.

  So if story generation follows E3 and the delivered test pattern, each
  router story carries tests that cannot pass until the composition story,
  while the composition story is declared to depend on that router story.
  That is the cycle v2 described, moved from the module level to the test
  level. Otherwise the router stories ship without their acceptance evidence.
  E1 (line 48) still says nothing about the composition story. Severity is
  MEDIUM, as in v2. The defect decides whether `dependencies.yaml` is right
  first time, and story generation would probably hit it as a red build
  rather than a silent gap. The owner can close it either way, and this review
  does not choose for them:
  - each router story adds its own import and `include_router` line (the
    CAP-001 precedent), leaving the composition story the scheduler task, the
    no-secrets extension and the lifespan test
  - the mounted-route tests land in or after the composition story, declared
    as such in E1, E3 and the backlog
- **FINDING-12 (MEDIUM, new, `SEQUENCING-INVERSION`).** E4's shell composition
  story runs the other way from how E4, E1, E5 and the backlog state it. It is
  the UI twin of FINDING-11.
  - E4 line 44 says the seam "registers every `/research/*` route at once" and
    that "E1's and E5's screens render inside routes this EPIC's composition
    story creates, so both depend on it". DAC-E4-6 (line 86) requires all five
    routes registered, with `routes.test.tsx`'s route-source assertion gaining
    all five paths.
  - E1 line 48 and E5 line 42 each declare a dependency on that composition
    story. The backlog says the same at line 79 (`E1 (Universes UI) ◄── E4
    (composition seam)`) and lines 92–97 ("E5 needs … E4's composition seam").
  - classification-ui §2.2 (lines 267–271) gives the five routes as
    `element={<ResearchScreen />}`, `<StockEvidenceScreen />`,
    `<CompareScreen />`, `<UniversesScreen />` and `<UniverseDetailScreen />`.
    §2.1 places those screens in `screens/research/stocks/` and
    `screens/research/compare/` (E5) and `screens/research/universes/` and
    `universes/detail/` (E1). The delivered `web/src/app/routes.tsx` imports
    each screen it routes (lines 3–7), so the edited file must import E1's and
    E5's screen modules.
  - classification-ui §7's *Shell composition* row (line 970) has
    `routes.test.tsx` assert that the five `/research` paths "render inside
    the shell". The screens' own tests are Vitest component tests with doubled
    reads (§7 intro), so they need no route.

  So E4's composition story cannot compile or pass its tests until E1's
  Universes screens and E5's Compare and Stock evidence screens exist, and
  those screen stories do not need it at build time. E5 comes after E4, so
  this is a `SEQUENCING-INVERSION` under BR-6, and no prose states the real
  interleaving: E4, E1, E5 and the backlog all state the reverse. If story
  generation copies those Dependencies into `dependencies.yaml` while the
  composition story's technical details follow §2.2, E1's and E5's screen
  stories and E4's composition story depend on each other. The result is a
  cycle `check-artifacts.py` rejects, or a story that cannot be built in the
  stated order.

  The runtime point behind the current text is real: a screen is unreachable
  in the browser, and its E2E spec cannot run, until its route exists. That is
  a reason to order E1's and E5's end-to-end acceptance after the composition
  story, not their screen modules. The owner can resolve it either way:
  - restate the ordering (composition story after the Research, Universes,
    Universe detail, Compare and Stock evidence screen stories; the E2E specs
    after it)
  - split the route registration per screen story, which DAC-E4-6's "at once"
    and the single route-source assertion would then have to allow

---

## Findings Summary Table

| ID | Severity | Dimension | Artifact | Location | Description | Impact | Recommendation |
|----|----------|-----------|----------|----------|-------------|--------|----------------|
| FINDING-3 | MEDIUM | BR-3 | CAP-002-E4 | Goals (lines 49–54); EPIC ACs (lines 68–86) | Carried from v1. The Research inspector is missing: the standardised score (AC-9), inputs' `as_of`/`known_on` (AC-17, S03-3) and memberships | Story generation could leave out a third of S03 and the only Research display of the standardised score | Add AC-17 (inspector side) and a derived AC for the inspector: percentile and signed standardised score, inputs with dates, memberships, the 150 ms debounced read |
| FINDING-4 | MEDIUM | BR-3 | CAP-002-E4 | EPIC ACs; NFR line 58 | Carried. AC-23 is cited only in an NFR; no AC requires the *Possibly restated* mark in the Research list and inspector (S03-6) | The mark could be left out on the main list surface (STD-UI-17) | Add AC-23 (display side) to E4 with a derived AC covering results cells and inspector |
| FINDING-5 | MEDIUM | BR-3 | CAP-002-E4, CAP-002-E1 | E4 DAC-E4-1 (line 81) vs line 106; E1 AC-15 (line 78) | Carried. No AC carries AC-15's "shown in its universes" display on Research under a universe scope or the Members tab; DAC-E4-1 lists three renderings while its row says four | The *Not followed* rendering on universe surfaces has no AC to test against | Add *Not followed* to DAC-E4-1 and AC-15 (display side) to E4; widen E1's AC-15 note to the Members tab |
| FINDING-6 | MEDIUM | BR-6 | CAP-002-E1, backlog | E1 Dependencies (line 48); backlog diagram (lines 74–80) | Carried. The Members tab reuses E4's results table, factor cell and inspector, and reads E3's scoped list and evidence; only the shell seam and `evaluate_filter` are declared | Hidden dependencies show up as stop-start work during implementation | State both in E1 and the backlog so story generation encodes them in `dependencies.yaml` |
| FINDING-11 | MEDIUM | BR-6 | CAP-002-E3 (also E1, backlog) | E3 Dependencies (line 42); backlog Sequencing (lines 70–72); E1 Dependencies (line 48) | Changed form. The composition story's dependency on the two router stories and the scheduler story is now stated correctly, but "nothing depends on it at build time" is wrong for the router stories' own route and integration tests: every delivered route test builds `create_app()`, and the Host/Origin test needs the composed app | A router story carrying its §7 tests cannot pass before the composition story that depends on it, so there is a test-level cycle, or the router stories ship without acceptance evidence | Either mount each router in its own story (CAP-001's `5077fcf` precedent) and leave the composition story the scheduler task, the no-secrets extension and the lifespan test, or place the mounted-route tests in or after the composition story; state the choice in E3, E1 and the backlog |
| FINDING-12 | MEDIUM | BR-6 | CAP-002-E4 (also E1, E5, backlog) | E4 Dependencies (line 44) and DAC-E4-6 (line 86); E1 line 48; E5 line 42; backlog lines 79, 92–97 | New (`SEQUENCING-INVERSION`). E4's composition story adds the five `Route` elements, which render (and so import) E1's Universes and Universe detail screens and E5's Compare and Stock evidence screens (classification-ui §2.2 lines 267–271; delivered `routes.tsx` lines 3–7), so it depends on those screen stories; the artifacts all say E1 and E5 depend on it, and E5 is later than E4 | Copying the stated Dependencies into `dependencies.yaml` creates a cycle with the composition story's real prerequisites, or schedules a story that cannot compile | Restate the ordering: the composition story lands after the five screen stories, and the E2E specs after it. Or split route registration per screen story, relaxing DAC-E4-6's "at once". Mirror the result in E1, E5 and the backlog |
| FINDING-7 | LOW | BR-2 | CAP-002-E4 | DAC-E4-6 (line 86); traceability (line 111) | Carried. The derived AC traces to no capability AC, against `$epic-generation` constraint 6; DAC-E3-13, the matching API seam, traces to AC-10 and AC-16 | Traceability convention broken and the two seam DACs follow different rules; no functional effect | Trace DAC-E4-6 to AC-16, as DAC-E3-13 does, or recast it as an NFR |
| FINDING-8 | LOW | BR-6 | CAP-002-backlog | Sequencing, E2 bullet (lines 82–85) | Carried. Says E2's volume test waits on the payload keys; E2 (line 132) and factor-engine §7/§14 say it does not | Could schedule the volume test as blocked when it is not | Correct the backlog sentence |
| FINDING-9 | LOW | BR-2 | CAP-002-E1, backlog | E1 Links (line 49), E1 traceability AC-5 (line 105), backlog AC-5 row (line 113) | Carried. Cites a universe-service §2.8 that does not exist; mislabels classification-api §2.6 as error mapping (it is §2.5); calls classification-ui §2.1 "Universes screens" (it is Placement) | Readers follow dead or wrong references | Fix to universe-service §2.4, classification-api §2.5 and §2.7, and UX design §1.3–1.4 or classification-ui §10 |
| FINDING-10 | LOW | BR-6 | CAP-002-E1, CAP-002-E4 | E1 Links (line 49) | Carried. E1 and E4 both claim the Save/Add dialogs of classification-ui §2.7 | Duplicate stories for the same two dialogs | Limit E1's §2.7 link to the create, rename, Remove and Retire dialogs and the refusals |

FINDING-1 and FINDING-2 were fixed in v2 and are not counted. FINDING-11
appears once above, in its v3 form.

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
| AC-10 | E2, E3 (DAC-E3-13) | — | Covered |
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

There are no HIGH findings either. The six MEDIUM findings remain, and none
of them blocks story generation:

- FINDING-3, FINDING-4 and FINDING-5 are carried from v1. They decide whether
  E4's stories carry the inspector, the restatement mark and the *Not
  followed* rendering.
- FINDING-6 (carried), FINDING-11 (changed form) and FINDING-12 (new) are
  dependency statements. They decide whether `dependencies.yaml` is right
  first time.

FINDING-11 and FINDING-12 are one pattern: a single composition story that
imports what other stories build, described as if those stories depended on
it. The commit `bf09213` fixed the API half's direction. The same correction
is still needed on the UI half, and on the API half for the tests. Each is
cheaper to fix in the EPICs, in a sentence or two, than in the stories they
will seed. The cycle check in `check-artifacts.py` would catch the worst case
once `dependencies.yaml` exists.

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

1. FINDING-12: restate E4's composition-story ordering. It lands after the
   Research, Universes, Universe detail, Compare and Stock evidence screen
   stories, and the E2E specs after it. Correct E4 line 44, E1 line 48, E5
   line 42 and the backlog (line 79 and lines 92–97) to match. Alternatively,
   split route registration per screen story and relax DAC-E4-6 accordingly.
2. FINDING-11: say where the mounted-route tests go. Either each router
   story mounts its own router (CAP-001 precedent), or the
   `create_app()`-based route and integration tests land in or after the
   composition story. Replace "nothing depends on it at build time" in E3 and
   the backlog with that statement, and add it to E1's Dependencies.
3. FINDING-3: add the Research inspector to E4: AC-17 (inspector side) and a
   derived AC covering the standardised score, the inputs' dates and the
   memberships.
4. FINDING-4: add AC-23 (display side) to E4 for the results cells and the
   inspector.
5. FINDING-5: add the *Not followed* rendering to DAC-E4-1, add AC-15 (display
   side) to E4, and widen E1's AC-15 note to the Members tab.
6. FINDING-6: declare E1's dependencies on E4's shared results table and
   inspector, and on E3's scoped list and evidence reads.

### Nice to Have (LOW)

1. FINDING-7: trace DAC-E4-6 to AC-16, as DAC-E3-13 does, or recast it as an
   NFR.
2. FINDING-8: correct the backlog's statement that the volume test is blocked.
3. FINDING-9: fix the three wrong section references in E1 and the backlog.
4. FINDING-10: split the classification-ui §2.7 dialog ownership explicitly
   between E1 and E4.
