---
artifact_schema_version: 1
artifact_id: CAP-003-backlog-review
artifact_type: backlog-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-28
updated: 2026-10-28
document: backlog-review-report
capability: CAP-003
scope: epics
version: v3
generated: 2026-10-28T22:55:08Z
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
  total_findings: 11
  critical: 0
  high: 0
  medium: 5
  low: 6
readiness: READY
ai_provenance:
  agent_id: backlog-reviewer-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-28T22:55:08Z
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
| **Total Findings** | 11 (0 CRITICAL, 0 HIGH, 5 MEDIUM, 6 LOW) |
| **Readiness** | READY |

This is a fresh review of the seven EPICs and `backlog.md` after the owner
reverted the story-generation commit (`1c0be4f` reverts `c03ecf0`). The
artifacts are byte-identical to what review v1 assessed: every content
revision below equals v1's `review_subjects`. Review v2 (`epics-and-stories`)
covered the reverted v2 artifacts and no longer describes anything that exists.

All 28 capability acceptance criteria are covered by at least one EPIC, every
system-design flow (§3.1 to §3.5) and every component that needs work has an
owning EPIC, and the derived criteria restate their component designs
accurately. Nothing blocks story generation.

The review now has context v1 did not: the owner's blind verdict on DEC-0223
(the story breakdown, *answer A*) and DEC-0224 (the `SHELL_ROUTES` target). The
owner reverted the stories but kept the EPICs, so the EPICs plus those two
decisions are the input story generation must honour. Read that way, the five
MEDIUM findings are all places where an EPIC's text says one thing and the
owner's chosen story structure says another, or where a capability rule has no
EPIC-level verification:

- three hidden cross-EPIC dependencies (two from v1, one v1 missed: the
  `requestJson` export E3 needs and E7 owns);
- AC-19 and AC-20 unasserted on the four EPICs that deliver new screens;
- AC-26's token-only rule with no named automated check.

I agree with all eight of v1's findings in substance. I lower one (FINDING-3,
the `SHELL_ROUTES` target) from MEDIUM to LOW because DEC-0224 now records the
departure, and I add three: FINDING-9 (MEDIUM), FINDING-10 and FINDING-11 (LOW).

## Review Scope

Reviewed for `SCOPE=epics` on `usr/alvaro-de-jodra/CAP-003-epics` at
`1c0be4f` (clean tree):

- `backlog.md` (CAP-003-backlog v1, draft)
- `epics/design-system-components-and-shared-patterns/CAP-003-E1.md`
- `epics/data-health-reads/CAP-003-E2.md`
- `epics/owner-shell-and-command-palette/CAP-003-E3.md`
- `epics/first-run-setup/CAP-003-E4.md`
- `epics/home/CAP-003-E5.md`
- `epics/data-health/CAP-003-E6.md`
- `epics/taking-over-the-delivered-screens/CAP-003-E7.md`

Against the approved upstream: `Capability-CAP-003.md` v1,
`design/system-design.md` v1, `design/ux-brief.md` v1, `design/ux-design.md`
v1, the ten `design/component-design-*.md` v1 and
`docs/constitution/tech-stack.md` v7.

Also read: backlog review v1 (same subjects) and v2 (stale), and the decision
records the EPICs and the driver cite:

- **DEC-0222** (EPIC clustering): provisional, second opinion agreed, triage
  accepted. Its derivation matches system design §1, §3 and §4.1.
- **DEC-0223** (story breakdown): owner verdict *overridden*, status
  *reverted*. The owner's blind answer: E3's first story holds
  `shell-types.ts`, `shell-client.ts` and the `requestJson` export, and
  `needs-you.ts` in E1 depends on it as a stated later-epic edge; E4, E5 and
  E6 each close with an owner-shell story that registers that screen (E4's
  also mounts `SetupDraftProvider`); E3 registers the five delivered screens
  itself; the AC-26 literal scan is written in E1 and widened by E3 and each
  screen story; every E3 to E6 screen story carries derived ACs for AC-19 and
  AC-20.
- **DEC-0224** (`SHELL_ROUTES` `/runs` to `/data`): second opinion agreed,
  triage accepted.
- The design-run decisions the EPICs' open questions cite (DEC-0201 to
  DEC-0220), for their review status (FINDING-11).

Repository facts checked where an EPIC states one:

- `web/src/api/client.ts:154` declares `requestJson` without `export`.
- `web/src/components/` and `web/src/screens/research/` do not exist in this
  clone or on `origin/main`: CAP-002 has not merged, as E1, E3 and E7 assume.
- `web/src/screens/` holds the four delivered directories `coverage`,
  `instruments`, `runs`, `settings`.

`check-artifacts.py --strict --allow-unchanged-legacy` on the capability
directory passed (exit 0) with 10 warnings. Each is an approved component
design pinning tech-stack v6 against the current v7. That is stale-pin
bookkeeping in the upstream designs; the EPICs and backlog pin v7, so none is
an EPIC finding.

---

## Findings by Dimension

### BR-1 Completeness

No findings. Each EPIC has a summary with its business value, actors,
estimate, out-of-scope list, dependencies, links, goals, NFRs, capability and
derived ACs, a traceability table and open questions; none is a placeholder.
The flows map to EPICs as v1 found: §3.1 to E3, §3.2 to E4, §3.3 to E5 (chips
in E3), §3.4 to E6, §3.5 to E3 and E7, with E1 (`ui-components`) and E2
(`data-health-reader`, `data-health-api`, the `ingestion-api` line) as the two
cross-cutting EPICs DEC-0222 sets out. The criteria count 80 from the
capability and 103 derived.

### BR-2 Alignment with Upstream

- **FINDING-3** (LOW; v1 MEDIUM)
  - **Problem:** DAC-E7-2 migrates `SHELL_ROUTES` `/runs` to `/data`, and its
    traceability row cites system design §4.1 and open question 6, which both
    say `/data/downloads` (`system-design.md:585-587`, `:866-868`).
  - **What changed since v1:** DEC-0224 now records the departure: `/data`
    follows the owner-web-app design §2.1, CAP-002's approved allocation and
    the link's name, *Open Data health*. The second opinion agreed and triage
    accepted it. The EPIC's criterion is unambiguous and the precedence ladder
    ranks it above design prose, so a planner reading E7 implements the right
    target.
  - **Residual:** E7's text and traceability row still cite only the
    contradicting passages, and DEC-0224's scope and `blocks` name
    `CAP-003-E7-S8`, a story that no longer exists after the revert. That is
    why I keep a finding, at LOW.

- **FINDING-7** (LOW; agrees with v1)
  - **Problem:** E3's *From Capability* `[AC-10]` (line 77) restates AC-1's
    destination rule (*no unshipped destination ... even disabled*), not
    AC-10, which is Home's no-strategy rule and is carried by E5 (line 71).
    DAC-E3-17 (empty top-bar place for the kill switch) traces to it; its real
    parents are capability §2 *Out of Scope* and system design constraint 14.

### BR-3 Coverage (Reverse Traceability)

- **FINDING-4** (MEDIUM; agrees with v1)
  - **Problem:** AC-19 (display vocabulary) and AC-20 (one tier per status,
    label plus shape) bind every screen this capability *delivers or takes
    over*. E7 carries both for the five taken-over screens (with the
    vocabulary sweep, DAC-E7-3), E1 for `labelOf`, `tierOf` and
    `StatusBadge`, and E2 AC-19 for the API's domain vocabulary. E3 (shell
    and palette), E4 (setup), E5 (Home) and E6 (Data health) neither list nor
    trace either criterion, and the setup-ui, home-ui, data-health-ui,
    owner-shell and command-palette designs do not trace them either.
  - **Owner direction:** DEC-0223 answer A puts derived ACs for AC-19 and
    AC-20 on every E3 to E6 screen story. That closes the gap at story level
    only if story generation adds criteria the EPIC does not hold. Until then
    a domain term in, for example, a check-card result line or a palette
    error passes every EPIC criterion.

- **FINDING-10** (LOW; new)
  - **Problem:** E7's *From Capability* list omits AC-25, although the five
    taken-over screens hold operations that must stay keyboard-completable and
    two polled regions (Downloads and the download detail, both at 10 s). AC-25
    reaches E7 only through DAC-E7-8, which covers the detail's last-updated
    time; nothing in E7 names the Downloads list's last-updated time. The
    backlog row for AC-25 lists E7.
  - **Why LOW:** E7's accessibility NFR keeps CAP-001 v5's semantics, and
    AC-17 with the relabelled delivered tests preserves the existing keyboard
    and freshness behaviour, so the gap is in traceability rather than in
    what gets built.

### BR-4 Testability

- **FINDING-5** (MEDIUM; agrees with v1)
  - **Problem:** DAC-E1-12 (no spacing, size or colour literal outside the
    theme) and DAC-E3-16 (*no other file MUST write these values*) are AC-26's
    operative forms, and no EPIC names an automated check for them. The
    delivered `shell.tokens.test.tsx` checks only that Tailwind keys resolve to
    custom properties; E1's NFR records that Biome cannot enforce it.
  - **Owner direction:** DEC-0223 answer A names the check: a literal-scan
    test written in E1 and widened by E3 and by each screen story. The EPICs
    do not say so yet.

- **FINDING-8** (LOW; agrees with v1)
  - **Problem:** DAC-E1-12 uses *No ... MAY contain* and *no ... MAY be
    added*, where every other criterion uses MUST or MUST NOT. In RFC 2119
    terms MAY is permissive. The intent is plain, so this is cosmetic.

### BR-5 Single-Component Scoping

Not applicable at `SCOPE=epics`. Notes for story generation, under DEC-0223
answer A:

- The registration stories that close E4, E5 and E6, and E4's provider mount,
  are owned by `owner-shell` even though they sit in a screen EPIC; each
  edits only `web/src/app/` files.
- The `requestJson` export lands in E3's first story (owner-shell) but edits
  `web/src/api/client.ts`, which the owner-web-app design §2.1 lists as its
  file. The owner chose this deliberately (DEC-0223, citing CAP-002's
  equivalent move); the story should say it makes the one-word edit and why.

### BR-6 Consistency and Sequencing

IDs `CAP-003-E1` to `CAP-003-E7` are unique, and derived criteria use the
`DAC-E<n>-<m>` convention `$epic-generation` prescribes. The declared
dependencies are acyclic: E1 and E2 depend on nothing in CAP-003; E3 on E1 and
softly E2; E4 to E7 on E1 and E3; E5 and E6 also on E2. Three dependencies
run against that order and the EPIC text does not state them.

- **FINDING-1** (MEDIUM, SEQUENCING-INVERSION; agrees with v1)
  - **Problem:** DAC-E1-6 and DAC-E1-7 specify `deriveNeedsYou(attention,
    scores)` over the `Attention` and `ScoreState` types, which
    `component-design-ui-components.md` §11 says are defined by owner-shell in
    `web/src/app/shell-types.ts` and imported as types only; the owner-shell
    design §2.1 places that file in owner-shell and DAC-E3-18 is its E3
    criterion. E1's Dependencies (line 47) still say *None inside CAP-003:
    this EPIC starts first*.
  - **Owner direction:** DEC-0223 answer A keeps the edge and makes it
    deliberate: E1's `needs-you.ts` story depends on E3's first story. The
    rubric accepts a later-epic dependency only when the prose states it, and
    E1's prose currently denies it.

- **FINDING-2** (MEDIUM, SEQUENCING-INVERSION; agrees with v1, sharpened)
  - **Problem:** E3 assigns itself the `SetupDraftProvider` mount (E3 AC-3 at
    line 76: *This EPIC mounts setup-ui's `SetupDraftProvider`*; DAC-E3-14)
    while E4 delivers the provider (DAC-E4-2), and E4's Dependencies (line 45)
    in turn rely on E3 for *the `/setup` route and the mounting of this
    EPIC's `SetupDraftProvider`*. E5 and E6 likewise rely on E3 for *the
    `/home` route and the Home destination* and *the `/data` route and the
    Data health destination*. E3's Dependencies (line 47) say *E4 to E7
    register their screens*.
  - **Owner direction, and the conflict with it:** DEC-0223 answer A puts the
    mount and the `/setup` registration in an owner-shell story that closes
    E4, the `/home` and `/data` registrations in owner-shell stories closing
    E5 and E6, and the five delivered screens' registration in E3 itself.
    So under the owner's structure:
    - E3's AC-3 and DAC-E3-14 are delivered by an E4 story, not by E3;
    - E4's, E5's and E6's Dependencies name E3 for work they now contain;
    - E3's *E4 to E7 register their screens* is wrong for E7.
  - **Effect:** story generation must either follow the EPIC text (and
    recreate the E3-before-E4 inversion) or follow the owner and leave an E3
    criterion covered from another EPIC, which the `epics-and-stories` review
    will flag under BR-3 unless the stories say so.

- **FINDING-9** (MEDIUM, SEQUENCING-INVERSION; new, v1 missed it)
  - **Problem:** E3 needs `requestJson` exported. The owner-shell design §1
    lists the delivered `requestJson` among `shell-client.ts`'s dependencies,
    and the command-palette design §2.3 fetches universes with it *exported
    per DEC-0211*. E3's Dependencies (line 47) call `requestJson` *delivered*.
    It is delivered but not exported (`web/src/api/client.ts:154`), and the
    export is DAC-E7-12, an E7 criterion (*`web/src/api/client.ts` MUST export
    `requestJson` unless CAP-002 has already added the export*). E3 therefore
    depends on the later E7, and neither EPIC states it. v1 noted that the
    export was missing and that DAC-E7-12 agreed with that, but not that E3
    needs it first.
  - **Owner direction:** DEC-0223 answer A moves the export into E3's first
    story, with E7 only confirming that it exists. That reverses DAC-E7-12's
    allocation, which E7's text still states.

- **FINDING-6** (LOW; agrees with v1)
  - **Problem:** three `backlog.md` *Full Traceability* rows omit an EPIC
    whose derived criteria trace to that AC: AC-8 omits E6 (DAC-E6-5), AC-11
    omits E5 (DAC-E5-3), AC-21 omits E3 (DAC-E3-1). The EPIC count (7) and the
    story count (0) match the files. I recomputed every row from the EPICs'
    *From Capability* lists and `(traces to: ...)` annotations; these three
    are the only differences.

- **FINDING-11** (LOW; new)
  - **Problem:** the EPICs' open questions list as *awaiting the owner's
    review* decisions the owner had already upheld on 2026-10-25, before the
    EPICs were generated on 2026-10-28:

    | EPIC | Listed as awaiting review | Actually upheld (blind or direct) |
    |------|---------------------------|-----------------------------------|
    | E1 (line 137) | DEC-0216 | DEC-0216 |
    | E2 (line 138) | DEC-0213 | DEC-0213 |
    | E3 (line 154) | DEC-0207, DEC-0214 | DEC-0207, DEC-0214 |
    | E5 (line 126) | DEC-0203 (*not seen rendered*), DEC-0206, DEC-0216 | DEC-0203, DEC-0206, DEC-0216 |
    | E6 (line 143) | DEC-0213 | DEC-0213 |
    | E7 (line 135) | DEC-0211, DEC-0214 | DEC-0211, DEC-0214 |

    The ones still open are correctly listed (DEC-0201, DEC-0204, DEC-0209,
    DEC-0212, DEC-0215, DEC-0218, DEC-0220).
  - **Effect:** a planner may treat settled behaviour as reversible. Each
    entry says it blocks nothing, so the effect is small.

---

## Findings Summary Table

| ID | Severity | Dimension | Artifact | Location | Description | Impact | Recommendation |
|----|----------|-----------|----------|----------|-------------|--------|----------------|
| FINDING-1 | MEDIUM | BR-6 | CAP-003-E1, CAP-003-E3 | E1 line 47 (Dependencies), DAC-E1-6, DAC-E1-7; E3 DAC-E3-18; ui-components §11; owner-shell §2.1 | SEQUENCING-INVERSION. `deriveNeedsYou` in E1 imports `Attention` and `ScoreState` from owner-shell's `shell-types.ts`, delivered in E3; E1 says it depends on nothing in CAP-003. Agrees with v1 | The E1 `needs-you.ts` story cannot type-check before an E3 story; E1's prose denies the edge DEC-0223 makes deliberate | Story generation states the edge (E1's `needs-you.ts` story depends on E3's first story) in the story prose and `dependencies.yaml`, per DEC-0223; at the next EPIC edit, state it in E1's Dependencies |
| FINDING-2 | MEDIUM | BR-6 | CAP-003-E3, CAP-003-E4, CAP-003-E5, CAP-003-E6 | E3 line 76 `[AC-3]`, DAC-E3-14, line 47; E4 line 45; E5 line 45; E6 line 45 | SEQUENCING-INVERSION. E3 claims the `SetupDraftProvider` mount that E4's provider must precede, and E4 to E6 rely on E3 for their routes and destinations; DEC-0223 answer A moves both into owner-shell stories closing E4 to E6, and has E3 register E7's screens | The EPIC text and the owner's story structure disagree, so E3's AC-3 and DAC-E3-14 will be covered from E4 and E4 to E6's dependency statements will be inaccurate | Stories follow DEC-0223 and say that E4's closing owner-shell story delivers E3's DAC-E3-14 and AC-3 mount; at the next EPIC edit, move AC-3's mount clause and DAC-E3-14 to E4, update E4 to E6's Dependencies and E3's *E4 to E7 register* |
| FINDING-3 | LOW | BR-2 | CAP-003-E7 | DAC-E7-2 (line 86) and its traceability row; `system-design.md:585-587`, `:866-868`; DEC-0224 | CROSS-LAYER-INCONSISTENCY, mitigated. DAC-E7-2's `/runs` to `/data` cites system design §4.1 and OQ-6, which say `/data/downloads`; DEC-0224 now records the departure. v1 rated this MEDIUM | Residual only: E7 cites the contradicting passages, and DEC-0224 names `CAP-003-E7-S8`, a reverted story ID | Cite DEC-0224 in the story that edits `copy.ts` (and in E7 at its next edit); correct system design §4.1 and OQ-6 at its next revision |
| FINDING-4 | MEDIUM | BR-3 | CAP-003-E3, CAP-003-E4, CAP-003-E5, CAP-003-E6 | *From Capability* lists and traceability tables; DAC-E7-3 scope | AC-19 and AC-20 are asserted for the taken-over screens (E7) and the shared functions (E1), but by no criterion on the shell, palette, setup, Home or Data health. Agrees with v1 | A domain term or a colour-only status on a new screen passes every EPIC criterion | Per DEC-0223, give every E3 to E6 screen story derived ACs tracing to AC-19 and AC-20 (the DAC-E7-3 term list absent; statuses through `StatusBadge`); add both ACs to E3 to E6 at the next EPIC edit |
| FINDING-5 | MEDIUM | BR-4 | CAP-003-E1, CAP-003-E3 | DAC-E1-12, DAC-E3-16; E1 NFR (Biome has no rule) | AC-26's literal ban and `layout.ts`'s single-writer rule have no named automated check. Agrees with v1 | A stray `px`, `rem` or hex literal can land unnoticed | Per DEC-0223, a literal-scan test written in E1 (`web/src/components/`), widened by E3 (the seven `layout.ts` values) and by each screen story for its directory |
| FINDING-6 | LOW | BR-6 | backlog.md | *Full Traceability* rows AC-8, AC-11, AC-21 | The rows omit E6 (DAC-E6-5), E5 (DAC-E5-3) and E3 (DAC-E3-1). Agrees with v1 | Reverse lookups from the backlog undercount the EPICs on these ACs | Add the three EPICs when story generation rewrites the backlog |
| FINDING-7 | LOW | BR-2 | CAP-003-E3 | line 77 `[AC-10]`; DAC-E3-17 | `[AC-10]` restates AC-1's destination rule, not AC-10's Home rule; DAC-E3-17 traces to it. Agrees with v1 | A criterion is cited for a requirement it does not state | Drop `[AC-10]` from E3 (E5 carries it), fold the text into `[AC-1]`, retrace DAC-E3-17 to AC-1 and system design constraint 14 |
| FINDING-8 | LOW | BR-4 | CAP-003-E1 | DAC-E1-12 (line 96) | *No ... MAY* wording where every other criterion uses MUST or MUST NOT. Agrees with v1 | Cosmetic; the intent is unambiguous | Reword as *MUST NOT contain* and *MUST NOT be added*; carry the MUST NOT form into the stories |
| FINDING-9 | MEDIUM | BR-6 | CAP-003-E3, CAP-003-E7 | E3 line 47 (Dependencies); DAC-E7-12 (line 96); owner-shell §1; command-palette §2.3; `web/src/api/client.ts:154` | SEQUENCING-INVERSION, new. E3's `shell-client.ts` and the palette need `requestJson` exported; E3 calls it delivered, but it is unexported and DAC-E7-12 puts the export in the later E7 | E3's first story cannot compile against `requestJson` until an E7 story lands, unless the allocation is moved | Per DEC-0223, E3's first story adds the export (unless CAP-002 already has) and E7's story only confirms it; at the next EPIC edit, reword DAC-E7-12 and E3's Dependencies to match |
| FINDING-10 | LOW | BR-3 | CAP-003-E7 | *From Capability* list; DAC-E7-8; NFR *Accessibility* | AC-25 is absent from E7's capability list and reaches it only through DAC-E7-8 (the detail's freshness); the Downloads list's last-updated time and keyboard completeness on the five screens are not named | Traceability gap; behaviour is preserved by AC-17 and the relabelled delivered tests | Story generation adds AC-25 to the E7 stories that touch polled or interactive regions; add `[AC-25]` to E7 at its next edit |
| FINDING-11 | LOW | BR-6 | CAP-003-E1, E2, E3, E5, E6, E7 | Open Questions: E1 line 137, E2 line 138, E3 line 154, E5 line 126, E6 line 143, E7 line 135 | Open questions call DEC-0203, DEC-0206, DEC-0207, DEC-0211, DEC-0213, DEC-0214 and DEC-0216 unreviewed, but the owner upheld all seven on 2026-10-25, before the EPICs were written | Settled behaviour reads as provisional | Correct the statuses at the next EPIC edit; stories cite those decisions as upheld |

---

## Traceability Matrix

| Capability AC | EPIC(s) | Story(ies) | Status |
|---------------|---------|------------|--------|
| AC-1 | E3 | (not yet generated) | Covered |
| AC-2 | E3, E4 | (not yet generated) | Covered |
| AC-3 | E3, E4 | (not yet generated) | Covered; mount allocation conflicts with DEC-0223, FINDING-2 |
| AC-4 | E2, E4, E6, E7 | (not yet generated) | Covered |
| AC-5 | E4, E7 | (not yet generated) | Covered |
| AC-6 | E4 | (not yet generated) | Covered |
| AC-7 | E1, E2, E4, E5 | (not yet generated) | Covered |
| AC-8 | E1, E2, E3, E5, E6 | (not yet generated) | Covered (backlog row omits E6, FINDING-6) |
| AC-9 | E1, E2, E5 | (not yet generated) | Covered |
| AC-10 | E5 (E3 cites it, FINDING-7) | (not yet generated) | Covered |
| AC-11 | E1, E2, E5, E6 | (not yet generated) | Covered (backlog row omits E5, FINDING-6) |
| AC-12 | E1, E2, E3, E5, E6, E7 | (not yet generated) | Covered |
| AC-13 | E2, E6 | (not yet generated) | Covered |
| AC-14 | E2, E6, E7 | (not yet generated) | Covered |
| AC-15 | E4, E6, E7 | (not yet generated) | Covered |
| AC-16 | E1, E2, E3, E5, E6 | (not yet generated) | Covered |
| AC-17 | E2, E3, E4, E6, E7 | (not yet generated) | Covered |
| AC-18 | E3, E7 | (not yet generated) | Covered |
| AC-19 | E1, E2, E7 | (not yet generated) | Covered; new screens unasserted, FINDING-4 |
| AC-20 | E1, E7 | (not yet generated) | Covered; new screens unasserted, FINDING-4 |
| AC-21 | E1, E2, E3, E4, E5, E6 | (not yet generated) | Covered (backlog row omits E3, FINDING-6) |
| AC-22 | E3 | (not yet generated) | Covered |
| AC-23 | E3 | (not yet generated) | Covered |
| AC-24 | E1, E2, E3, E4, E5, E6, E7 | (not yet generated) | Covered |
| AC-25 | E1, E3, E4, E5, E6, E7 | (not yet generated) | Covered; E7 only through DAC-E7-8, FINDING-10 |
| AC-26 | E1, E3, E4, E5, E6, E7 | (not yet generated) | Covered; verification unnamed, FINDING-5 |
| AC-27 | E3, E7 | (not yet generated) | Covered |
| AC-28 | E2, E3, E6 | (not yet generated) | Covered |

No capability AC is UNCOVERED.

---

## Readiness Assessment

**Verdict:** READY — CRITICAL 0 · HIGH 0 · MEDIUM 5 · LOW 6 · **total 11**

There are no CRITICAL or HIGH findings. Every capability acceptance
criterion, system-design flow and component that requires work has an EPIC,
and the derived criteria are concrete, testable and faithful to their
component designs. I spot-checked the verdict table (DAC-E1-3, DAC-E1-4
against ui-components §2.4), the problems paging bounds (DAC-E2-3 against
data-health-api §2.3), the market-state hours (DAC-E5-6 against home-ui §2.3)
and the `requestJson`, `shell-types.ts` and `SetupDraftProvider` placements
against the owner-shell, ui-components, command-palette and owner-web-app
designs.

Four of the five MEDIUM findings (FINDING-1, FINDING-2, FINDING-4,
FINDING-5) are places where the owner's DEC-0223 answer A already says what
the stories must do; FINDING-9 is resolved by the same answer. The EPIC text
still states the earlier allocation, so story generation must follow
DEC-0223 explicitly and say in each affected story which EPIC criterion it
delivers across an EPIC boundary. None blocks story generation.

A passing report is evidence, not approval. The EPICs and `backlog.md` stay
`draft` until the owner runs the explicit approval action
(`scripts/artifact-gate.py approve`); DEC-0222 and DEC-0224 remain open for
the owner's review.

---

## Recommendations

### Must Fix (CRITICAL and HIGH)

None.

### Should Fix (MEDIUM)

1. **FINDING-2:** The stories follow DEC-0223. The owner-shell story closing
   E4 mounts `SetupDraftProvider` and registers `/setup`, and it says it
   delivers E3's AC-3 mount clause and DAC-E3-14. The stories closing E5 and
   E6 register `/home` and `/data`, and E3 registers the five delivered
   screens. At the next EPIC edit, move the mount to E4 and correct E3 to
   E6's Dependencies.
2. **FINDING-9:** E3's first story exports `requestJson` (unless CAP-002 has)
   and E7's story confirms it. At the next EPIC edit, reword DAC-E7-12 and
   E3's Dependencies to match.
3. **FINDING-1:** State the E1 `needs-you.ts` to E3 first-story edge in the
   story prose and `dependencies.yaml`, and later in E1's Dependencies.
4. **FINDING-4:** Give every E3 to E6 screen story derived ACs for AC-19 and
   AC-20.
5. **FINDING-5:** Name the literal-scan test in E1's first story, and widen it
   in E3 and in each screen story.

### Nice to Have (LOW)

1. **FINDING-3:** Cite DEC-0224 in the `copy.ts` story. When the stories are
   regenerated, re-point DEC-0224's `blocks` at the new story ID.
2. **FINDING-6:** Add E6, E5 and E3 to the backlog rows for AC-8, AC-11 and
   AC-21.
3. **FINDING-7:** Correct E3's `[AC-10]` citation and DAC-E3-17's trace.
4. **FINDING-8:** Reword DAC-E1-12's *MAY* as *MUST NOT*.
5. **FINDING-10:** Add AC-25 to E7 and to its polled-region stories.
6. **FINDING-11:** Correct the review status of DEC-0203, DEC-0206, DEC-0207,
   DEC-0211, DEC-0213, DEC-0214 and DEC-0216 in the EPICs' open questions.
