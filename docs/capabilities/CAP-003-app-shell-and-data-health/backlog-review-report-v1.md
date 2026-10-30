---
artifact_schema_version: 1
artifact_id: CAP-003-backlog-review
artifact_type: backlog-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-28
updated: 2026-10-28
document: backlog-review-report
capability: CAP-003
scope: epics
version: v1
generated: 2026-10-28T02:34:10Z
review_subjects:
  - artifact_id: CAP-003-backlog
    artifact_version: 1
    content_revision: sha256:aa741aaf5ee9c1908d9f4bd0af003047d398b1b1685a79df17e4be8e0a8ade0d
  - artifact_id: CAP-003-E1
    artifact_version: 1
    content_revision: sha256:e7c6a1f7dd18d7af15174a786aad6d57ba520b341088e601990cae43bac2c2d6
  - artifact_id: CAP-003-E2
    artifact_version: 1
    content_revision: sha256:0fe0f634b23049351be68a93449c30d4ca4e0babb1ab1a1c7298bcf62b30bc9d
  - artifact_id: CAP-003-E3
    artifact_version: 1
    content_revision: sha256:f2ca38939b570f044f7e14604bb74d676c32d85500bf1d2e6ccf2cf2de8b791a
  - artifact_id: CAP-003-E4
    artifact_version: 1
    content_revision: sha256:aa640c780f30406db0704c1b425a1bc93a362ea3812f51d35e1693ac26ba857c
  - artifact_id: CAP-003-E5
    artifact_version: 1
    content_revision: sha256:a36c7abd7c3551971f55aafda7962f1faf9d51ed2a0cbd9396020695ab2e4d3c
  - artifact_id: CAP-003-E6
    artifact_version: 1
    content_revision: sha256:81964d539affbfc8eef5912ae0fa9c809a78c33c6c7d2bdd6d4ea36ef2e9a217
  - artifact_id: CAP-003-E7
    artifact_version: 1
    content_revision: sha256:f6bb25e7ef400db63d6d58300fd392cb80dfe43aed80c76bee1e79e654b16665
statistics:
  epics_reviewed: 7
  stories_reviewed: 0
  total_findings: 8
  critical: 0
  high: 0
  medium: 5
  low: 3
readiness: READY
ai_provenance:
  agent_id: backlog-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-28T02:34:10Z
  source_artifacts:
    - id: CAP-003
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-brief
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-component-design-data-health-api
      version: "1"
    - id: CAP-003-component-design-ingestion-api
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-command-palette
      version: "1"
    - id: CAP-003-component-design-setup-ui
      version: "1"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-component-design-data-health-ui
      version: "1"
    - id: CAP-003-component-design-owner-web-app
      version: "1"
    - id: tech-stack
      version: "7"
    - id: CAP-003-backlog
      version: "1"
    - id: CAP-003-E1
      version: "1"
    - id: CAP-003-E2
      version: "1"
    - id: CAP-003-E3
      version: "1"
    - id: CAP-003-E4
      version: "1"
    - id: CAP-003-E5
      version: "1"
    - id: CAP-003-E6
      version: "1"
    - id: CAP-003-E7
      version: "1"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Backlog Review Report -- CAP-003

## Executive Summary

| Field | Value |
|-------|-------|
| **Capability** | CAP-003 |
| **Scope** | epics |
| **EPICs Reviewed** | 7 |
| **Stories Reviewed** | 0 |
| **Total Findings** | 8 (0 CRITICAL, 0 HIGH, 5 MEDIUM, 3 LOW) |
| **Readiness** | READY |

All 28 capability acceptance criteria are covered by at least one EPIC. All
five control flows of the system design (§3.1 to §3.5) and the capability's
five user flows have an owning EPIC. Every component that needs work has an
EPIC: the eight components in system design §4.1, plus the changes to
`owner-web-app`, `ingestion-api` and the two CAP-002 seam files. The derived
criteria match the component designs closely. I checked them against
ui-components §2.3 to §2.7, data-health-reader §2.6 and §7, data-health-api
§7, command-palette §2.3 and §7, owner-shell §2.1, §2.10 and §7, setup-ui
§2.3, and data-health-ui §11. Each restates its source correctly.

No finding blocks story generation. Four of the five MEDIUM findings are about
sequencing and traceability. Two are hidden back-dependencies between EPICs
that story generation must order explicitly: E1 needs a type module that E3
owns, and E3 needs the draft provider that E4 owns. The other two traceability
findings are one link target that conflicts with the system design and two
capability criteria that no screen EPIC asserts for the new screens. The
fifth MEDIUM finding is a testability gap: the token-only rule has no named
automated check.

## Review Scope

Reviewed for `SCOPE=epics`, at commit `7a779e6` on
`usr/alvaro-de-jodra/CAP-003-epics`:

- `backlog.md` (CAP-003-backlog v1, draft)
- `epics/design-system-components-and-shared-patterns/CAP-003-E1.md`
- `epics/data-health-reads/CAP-003-E2.md`
- `epics/owner-shell-and-command-palette/CAP-003-E3.md`
- `epics/first-run-setup/CAP-003-E4.md`
- `epics/home/CAP-003-E5.md`
- `epics/data-health/CAP-003-E6.md`
- `epics/taking-over-the-delivered-screens/CAP-003-E7.md`

Against the approved upstream:

- `Capability-CAP-003.md` v1
- `design/system-design.md` v1
- `design/ux-brief.md` v1
- `design/ux-design.md` v1
- the ten `design/component-design-*.md` v1
- `docs/constitution/tech-stack.md` v7

Also read: the specification review reports v1 to v3, and decision record
DEC-0222, the EPIC clustering decision the EPICs cite. DEC-0222 is
provisional, `owner_reviewed: false`. Its derivation matches system design
§1, §3 and §4.1.

The delivered repository state was checked where an EPIC states a fact about
it:

- `web/src/components/patterns/` and `web/src/screens/research/` are absent,
  as E1 and E7 state.
- `requestJson` exists in `web/src/api/client.ts` but is not exported, which
  agrees with DAC-E7-12.
- The delivered `GET /api/acquisition-runs` accepts a `state` filter
  (`src/factorflow/api/routes/runs.py`), which DAC-E6-10 relies on.

`check-artifacts.py --strict --allow-unchanged-legacy` on the capability
directory passed with 10 warnings. Each warning is an upstream tech-stack pin
(v6 against the current v7) in an approved component design. That is
stale-pin bookkeeping in the upstream designs, not an EPIC defect. The EPICs
and the backlog pin tech-stack v7, so none of the warnings is a finding here.

---

## Findings by Dimension

### BR-1 Completeness

No findings. Every EPIC carries a summary with business value, actors,
estimate, out-of-scope list, dependencies, links, goals, NFRs, capability and
derived ACs, a traceability table and open questions. None is a placeholder.
The flow-to-EPIC mapping is:

- §3.1 opening and routing: E3
- §3.2 setup: E4
- §3.3 Home and rail counts: E5, with the chips in E3
- §3.4 Data health: E6
- §3.5 delivered screens and palette: E3 and E7

The cross-cutting layers have EPICs of their own: E1 for `ui-components`, and
E2 for `data-health-reader`, `data-health-api` and the `ingestion-api` line.
That matches DEC-0222.

### BR-2 Alignment with Upstream

- **FINDING-3** (MEDIUM, CROSS-LAYER-INCONSISTENCY)
  - **Problem:** E7 DAC-E7-2 migrates the `SHELL_ROUTES` target `/runs` to
    `/data`. Its traceability row cites system design §4.1 and open question
    6, and both say `/data/downloads` (`system-design.md:585-587`, `:866-868`).
  - **Why E7's target is the right one:** it agrees with
    `component-design-owner-web-app.md` §2.1 and with CAP-002's approved
    allocation, where Research's *Open Data health* link goes to `/data`.
  - **Why it is still a finding:** the conflict is specification review v3
    FINDING-10, which stayed open when the designs were approved. E7 settles
    it silently. It does not say that it departs from the system design or
    why.
  - **Severity:** MEDIUM rather than the rubric's default HIGH. The EPIC
    agrees with the more specific approved layer, so a story that follows
    DAC-E7-2 is correct. The remaining risk is a planner who reads the cited
    §4.1 instead.

- **FINDING-7** (LOW)
  - **Problem:** E3's *From Capability* entry `[AC-10]` (line 77) restates a
    different requirement: *no unshipped destination MUST render, even
    disabled*. That is AC-1's destination rule.
  - **What AC-10 actually says:** Home renders no strategy, paper or live
    region. E5 carries that rule.
  - **Related:** DAC-E3-17, the empty top-bar place for the kill switch,
    traces to AC-10. Its true parents are capability §2 *Out of Scope* and
    system design constraint 14.

### BR-3 Coverage (Reverse Traceability)

- **FINDING-4** (MEDIUM)
  - **Scope of AC-19 and AC-20:** AC-19 (display vocabulary) and AC-20 (one
    tier per status, label plus shape) bind every screen this capability
    *delivers or takes over*.
  - **What each EPIC carries:**
    - E7 carries both for the five taken-over screens, with a vocabulary
      sweep test (DAC-E7-3).
    - E1 carries them for the shared `labelOf`, `tierOf` and `StatusBadge`.
    - E2 carries AC-19 for the API's domain vocabulary only.
    - E3 (shell and palette), E4 (setup), E5 (Home) and E6 (Data health)
      neither list nor trace AC-19 or AC-20.
  - **Effect:** no criterion asserts that their composed copy, such as
    titles, item bodies, check-card result lines and confirm wording, shows
    no domain term. No criterion asserts that their statuses go through
    `StatusBadge`. Their copy is written in the display vocabulary, but
    nothing makes story generation prove it on the new screens.
  - **Upstream:** the setup-ui, home-ui and data-health-ui component designs
    do not trace AC-19 or AC-20 either.

### BR-4 Testability

- **FINDING-5** (MEDIUM)
  - **The criteria:** DAC-E1-12 (no spacing, size or colour literal outside
    the theme) and DAC-E3-16 (*no other file MUST write these values*) are
    the operative forms of AC-26.
  - **No named automated check:**
    - The delivered `shell.tokens.test.tsx` asserts only that Tailwind keys
      resolve to custom properties.
    - E1's NFR records that Biome has no rule for this, so the criterion is
      enforced by review.
    - None of the ten component designs' testing tables contains a literal
      scan either.
  - **Effect:** a core capability criterion with no named verification has a
    weak threshold. AC-26 is testable by a static scan, but no EPIC says so.

- **FINDING-8** (LOW)
  - **Problem:** DAC-E1-12 uses *No ... MAY contain* and *no ... MAY be added*
    where 181 of the 183 EPIC criteria use MUST or MUST NOT. The other
    exception is DAC-E2-1, which is a definition. Read as RFC 2119 terms, MAY
    is permissive.
  - **Meaning:** the intended meaning is clear, so this is cosmetic.

### BR-5 Single-Component Scoping

Not applicable at `SCOPE=epics`: there are no stories yet. Two observations
for story generation follow from FINDING-1 and FINDING-2:

- The owner-shell files `routes.tsx`, `destinations.ts`, `titles.ts` and
  `shell.tsx` are edited each time a screen from E4 to E7 registers.
- E1's `needs-you.ts` imports `owner-shell`'s `shell-types.ts`.

Each such edit must sit in a story owned by `owner-shell` or `ui-components`,
not in a screen component's story.

### BR-6 Consistency and Sequencing

The EPIC IDs (`CAP-003-E1` to `CAP-003-E7`) are unique and follow the naming
convention. The derived criteria use the `DAC-E<n>-<m>` convention that
`$epic-generation` prescribes. The declared dependencies are acyclic:

- E1 and E2 have none.
- E3 depends on E1 and, softly, on E2.
- E4 to E7 depend on E1 and E3.
- E5 and E6 also depend on E2.

Two undeclared dependencies run against that order.

- **FINDING-1** (MEDIUM, SEQUENCING-INVERSION)
  - **The dependency:** E1's DAC-E1-6 and DAC-E1-7 specify
    `deriveNeedsYou(attention: Attention, scores: ScoreState)`.
    `component-design-ui-components.md` §11 (`:546-549`) states that the
    `Attention` and `ScoreState` types *are defined by `owner-shell`
    (`web/src/app/shell-types.ts`) and imported as types only*.
    `component-design-owner-shell.md` §2.1 (`:121`) places
    `shell-types.ts` in owner-shell, and DAC-E3-18 is the E3 criterion that
    defines `Attention`.
  - **Where it runs against epic order:** E1 states *None inside CAP-003:
    this EPIC starts first* (line 47), while E3 depends on E1. So the story
    that delivers `deriveNeedsYou` in E1 needs the `shell-types.ts` story in
    the later E3, and neither EPIC states the interleaving.

- **FINDING-2** (MEDIUM, SEQUENCING-INVERSION)
  - **The provider:** E3's DAC-E3-14 requires `shell.tsx` to mount
    `SetupDraftProvider`. That is setup-ui's `web/src/screens/setup/draft.tsx`,
    which E4 delivers (DAC-E4-2).
  - **The registrations:** E3's AC-1 and DAC-E3-2 put Home, Data health and
    Settings into `DESTINATIONS` and the route map, and those screens land in
    E5, E6 and E7.
  - **What E3 does and does not say:** E3's Dependencies state that *E4 to E7
    register their screens into this EPIC's route map and `DESTINATIONS` as
    they land*. That states the interleaving for routes and destinations but
    leaves two gaps:
    - It says nothing about the provider mount, a dependency of E3 on the
      later E4. E4 meanwhile depends on E3 for the same mount.
    - It does not say which EPIC holds the owner-shell stories that make each
      registration edit.

- **FINDING-6** (LOW)
  - **Problem:** three `backlog.md` *Full Traceability* rows omit an EPIC
    whose derived criteria trace to that capability AC:

    | Row | Omitted EPIC | Derived criteria that trace to it |
    |-----|--------------|-----------------------------------|
    | AC-8 | E6 | DAC-E6-5 |
    | AC-11 | E5 | DAC-E5-3 |
    | AC-21 | E3 | DAC-E3-1 |

  - **Unaffected:** the EPIC count (7) and the story count (0) match the
    files.

---

## Findings Summary Table

| ID | Severity | Dimension | Artifact | Location | Description | Impact | Recommendation |
|----|----------|-----------|----------|----------|-------------|--------|----------------|
| FINDING-1 | MEDIUM | BR-6 | CAP-003-E1, CAP-003-E3 | E1 line 47 (Dependencies), DAC-E1-6, DAC-E1-7; E3 DAC-E3-18; ui-components §11 `:546-549`; owner-shell §2.1 `:121` | SEQUENCING-INVERSION. `deriveNeedsYou` in E1 imports the `Attention` and `ScoreState` types from owner-shell's `shell-types.ts`, which E3 delivers. E1 declares no in-capability dependency and E3 depends on E1 | The first E1 story to build `needs-you.ts` cannot type-check until an E3 story lands. The driver finds this as a start-stop during implementation | State the interleaving in E1's Dependencies, for example that the `shell-types.ts` story in E3 precedes the `needs-you.ts` story in E1. Story generation must then carry it in `dependencies.yaml` |
| FINDING-2 | MEDIUM | BR-6 | CAP-003-E3, CAP-003-E4 | E3 DAC-E3-14, DAC-E3-2, AC-1, line 47 (Dependencies); E4 DAC-E4-2, line 45 | SEQUENCING-INVERSION. E3 mounts setup-ui's `SetupDraftProvider`, which E4 delivers, and E4 depends on E3 for that mount. E3 states the route and destination interleaving with E4 to E7 but not this one. No EPIC names which stories make the owner-shell registration edits | Without a stated order, story generation may put the `shell.tsx` mount before the provider exists, or put owner-shell edits into setup-ui, home-ui or data-health-ui stories (BR-5) | In E3's Dependencies, state that the mount and each screen's registration land in owner-shell stories sequenced after the screen's first story, and assign those stories to E3 or to the screen EPIC explicitly |
| FINDING-3 | MEDIUM | BR-2 | CAP-003-E7 | DAC-E7-2 (line 86) and its traceability row; `system-design.md:585-587`, `:866-868`; `component-design-owner-web-app.md` §2.1 | CROSS-LAYER-INCONSISTENCY. DAC-E7-2 maps `SHELL_ROUTES` `/runs` to `/data` and cites system design §4.1 and OQ-6, which map it to `/data/downloads`. The EPIC follows owner-web-app §2.1 and CAP-002's approved allocation without recording the departure. This is specification review v3 FINDING-10, still open | A planner who reads the cited system-design section implements the wrong target, so Research's *Open Data health* link lands on Downloads | Add an open question or note to E7 recording that DAC-E7-2 follows owner-web-app §2.1 and CAP-002 over system design §4.1 and OQ-6 (spec review v3 FINDING-10). Correct the system design separately |
| FINDING-4 | MEDIUM | BR-3 | CAP-003-E3, CAP-003-E4, CAP-003-E5, CAP-003-E6 | *From Capability* and traceability tables; DAC-E7-3 scope | AC-19 and AC-20 are carried for the five taken-over screens (E7) and the shared functions (E1), but by no criterion on the shell, palette, setup, Home or Data health, which this capability delivers | The new screens' vocabulary and tier rendering go unasserted, and a domain term in their copy would pass every EPIC criterion | Add AC-19 and AC-20 to E3 to E6, or widen DAC-E7-3's vocabulary sweep (or a sibling in E1) to every screen this capability delivers |
| FINDING-5 | MEDIUM | BR-4 | CAP-003-E1, CAP-003-E3 | DAC-E1-12, DAC-E3-16; E1 NFR *Accessibility* (Biome has no rule) | AC-26's literal ban and the single-writer rule for `layout.ts` have no named automated check. `shell.tokens.test.tsx` covers Tailwind keys only | Enforcement rests on review, so a stray `px` or hex literal can land unnoticed | Name a static scan test, for example a Vitest test over `web/src/**` rejecting px, rem and hex literals outside `theme.css` and `layout.ts`, in E1 and E3 |
| FINDING-6 | LOW | BR-6 | backlog.md | rows AC-8, AC-11, AC-21 | The rows omit E6 (DAC-E6-5), E5 (DAC-E5-3) and E3 (DAC-E3-1) respectively | Reverse lookups from the backlog undercount the EPICs that touch these ACs | Add the three EPICs to the rows at the next backlog edit |
| FINDING-7 | LOW | BR-2 | CAP-003-E3 | line 77 `[AC-10]`; DAC-E3-17 | The *From Capability* `[AC-10]` restates AC-1's destination rule, not AC-10's Home rule, and DAC-E3-17 traces to it | Traceability cites a criterion for a requirement it does not state | Drop `[AC-10]` from E3's capability list (E5 carries it), fold the restatement into `[AC-1]`, and retrace DAC-E3-17 to AC-1 and system design constraint 14 |
| FINDING-8 | LOW | BR-4 | CAP-003-E1 | DAC-E1-12 (line 96) | *No ... MAY* wording where every other criterion uses MUST or MUST NOT | Cosmetic, since the intent is unambiguous | Reword as *MUST NOT contain* and *MUST NOT be added* |

---

## Traceability Matrix

| Capability AC | EPIC(s) | Story(ies) | Status |
|---------------|---------|------------|--------|
| AC-1 | E3 | (not yet generated) | Covered |
| AC-2 | E3, E4 | (not yet generated) | Covered |
| AC-3 | E3, E4 | (not yet generated) | Covered |
| AC-4 | E2, E4, E6, E7 | (not yet generated) | Covered |
| AC-5 | E4, E7 | (not yet generated) | Covered |
| AC-6 | E4 | (not yet generated) | Covered |
| AC-7 | E1, E2, E4, E5 | (not yet generated) | Covered |
| AC-8 | E1, E2, E3, E5, E6 | (not yet generated) | Covered (backlog row omits E6, FINDING-6) |
| AC-9 | E1, E2, E5 | (not yet generated) | Covered |
| AC-10 | E3, E5 | (not yet generated) | Covered (E5); E3's citation misattributed, FINDING-7 |
| AC-11 | E1, E2, E5, E6 | (not yet generated) | Covered (backlog row omits E5, FINDING-6) |
| AC-12 | E1, E2, E3, E5, E6, E7 | (not yet generated) | Covered |
| AC-13 | E2, E6 | (not yet generated) | Covered |
| AC-14 | E2, E6, E7 | (not yet generated) | Covered |
| AC-15 | E4, E6, E7 | (not yet generated) | Covered |
| AC-16 | E1, E2, E3, E5, E6 | (not yet generated) | Covered |
| AC-17 | E2, E3, E4, E6, E7 | (not yet generated) | Covered |
| AC-18 | E3, E7 | (not yet generated) | Covered |
| AC-19 | E1, E2, E7 | (not yet generated) | Covered; the new screens are not asserted, FINDING-4 |
| AC-20 | E1, E7 | (not yet generated) | Covered; the new screens are not asserted, FINDING-4 |
| AC-21 | E1, E2, E3, E4, E5, E6 | (not yet generated) | Covered (backlog row omits E3, FINDING-6) |
| AC-22 | E3 | (not yet generated) | Covered |
| AC-23 | E3 | (not yet generated) | Covered |
| AC-24 | E1, E2, E3, E4, E5, E6, E7 | (not yet generated) | Covered |
| AC-25 | E1, E3, E4, E5, E6, E7 | (not yet generated) | Covered |
| AC-26 | E1, E3, E4, E5, E6, E7 | (not yet generated) | Covered; verification unnamed, FINDING-5 |
| AC-27 | E3, E7 | (not yet generated) | Covered |
| AC-28 | E2, E3, E6 | (not yet generated) | Covered |

No capability AC is UNCOVERED.

---

## Readiness Assessment

**Verdict:** READY — CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 3 · **total 8**

There are no CRITICAL or HIGH findings. Every capability acceptance
criterion, system design flow and component that requires work is
represented. The derived criteria are concrete and testable. They restate
their component designs without drift, with one exception: the `SHELL_ROUTES`
target (FINDING-3), where the EPIC follows the more specific approved layer.

The five MEDIUM findings should be resolved during story generation or by a
small EPIC revision:

- FINDING-1 and FINDING-2 are the two back-dependencies that
  `dependencies.yaml` must order explicitly.
- FINDING-3 is the unrecorded departure from system design §4.1.
- FINDING-4 is AC-19 and AC-20 on the new screens.
- FINDING-5 is a named scan for the token-only rule.

None blocks story generation.

A passing report is evidence, not approval. Each EPIC and `backlog.md` stays
`draft` until the owner runs the explicit approval action
(`scripts/artifact-gate.py approve`), and DEC-0222, which these EPICs rest on,
remains open for the owner's review.

---

## Recommendations

### Must Fix (CRITICAL and HIGH)

None.

### Should Fix (MEDIUM)

1. **FINDING-1:** E1's Dependencies should state that the
   `shell-types.ts` story in E3 precedes the `needs-you.ts` story in E1. The
   alternative is to record that `ui-components` defines the two types it
   reads.
2. **FINDING-2:** E3's Dependencies should state when owner-shell mounts
   `SetupDraftProvider` and registers each screen's route, destination and
   title, and in which EPIC those owner-shell stories sit.
3. **FINDING-3:** Record in E7 that DAC-E7-2's `/runs` to `/data` follows
   owner-web-app §2.1 and CAP-002's approved allocation over system design
   §4.1 and open question 6 (spec review v3 FINDING-10).
4. **FINDING-4:** Carry AC-19 and AC-20 into E3 to E6, or extend the
   vocabulary sweep to every screen this capability delivers.
5. **FINDING-5:** Name an automated literal scan for AC-26 in E1 and E3.

### Nice to Have (LOW)

1. **FINDING-6:** Add E6, E5 and E3 to the backlog rows for AC-8, AC-11 and
   AC-21.
2. **FINDING-7:** Correct E3's `[AC-10]` citation and DAC-E3-17's trace.
3. **FINDING-8:** Reword DAC-E1-12's *MAY* as *MUST NOT*.
