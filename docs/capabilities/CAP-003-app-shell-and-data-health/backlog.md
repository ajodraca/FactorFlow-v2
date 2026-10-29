---
artifact_schema_version: 1
artifact_id: CAP-003-backlog
artifact_type: backlog
artifact_version: 2
status: approved
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-28
updated: 2026-10-28
ai_provenance:
  agent_id: story-generation-agent
  agent_version: "1.0"
  model: claude-fable-5-1
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-10-28T23:05:00Z
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
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
approval:
  approval_policy: owner-allowed
  approved_by: "Alvaro de Jodra"
  approved_at: 2026-10-28T23:57:47Z
  reviewed_revision: sha256:30dd89eab6ef97c96ec8633bcd3f49307728f534d3498904875728830e418260
  review_artifact: "docs/capabilities/CAP-003-app-shell-and-data-health/backlog-review-report-v4.md"
---

# Backlog: App Shell & Data Health

**Capability:** CAP-003
**Generated:** 2026-10-28
**Total EPICs:** 7
**Total Stories:** 51 (214 points)

The seven EPICs follow the system design's five control flows (§3.1 to §3.5)
and its eight components (§4.1), with the two cross-cutting layers, the
design-system components and the server-side reads, as EPICs of their own and
the command palette folded into the shell EPIC (DEC-0222, PROVISIONAL). E1 and
E2 are independent of each other and start first; E3 needs E1 and, for its
chips, E2; E4 to E7 need E1 and E3, with E5 and E6 also needing E2. No
cross-capability dependency is `blocked-by`: CAP-001 and CAP-002 are
`requires-runtime` and bind at integration, and the owner fixed CAP-002 to land
first (capability OQ-2), so the three edits that touch CAP-002's files (E1's
`AsOfLine` takeover, E3's Research rail entry, E7's `SHELL_ROUTES` edit) are
sequenced after `classification-ui` merges and nothing else waits on it.

## EPICs

| EPIC ID | Title | Estimate | Stories | Total Points |
|---------|-------|----------|---------|-------------|
| [CAP-003-E1](epics/design-system-components-and-shared-patterns/CAP-003-E1.md) | Design-System Components and Shared Patterns | L | 10 | 42 |
| [CAP-003-E2](epics/data-health-reads/CAP-003-E2.md) | Data Health Reads | M | 7 | 28 |
| [CAP-003-E3](epics/owner-shell-and-command-palette/CAP-003-E3.md) | Owner Shell and Command Palette | L | 8 | 39 |
| [CAP-003-E4](epics/first-run-setup/CAP-003-E4.md) | First-Run Setup | M | 6 | 23 |
| [CAP-003-E5](epics/home/CAP-003-E5.md) | Home | M | 5 | 18 |
| [CAP-003-E6](epics/data-health/CAP-003-E6.md) | Data Health | L | 7 | 28 |
| [CAP-003-E7](epics/taking-over-the-delivered-screens/CAP-003-E7.md) | Taking Over the Delivered Screens | L | 8 | 36 |

## Sequencing

The story graph in `dependencies.yaml` governs scheduling; the EPIC order is what it follows except
where a story says otherwise. Under DEC-0223 answer A (the owner's blind verdict, recorded for this
breakdown as DEC-0227): E3-S1 (`shell-types.ts`, `shell-client.ts`, the `requestJson` export) depends on
nothing and E1-S8 (`needs-you.ts`) depends on it, the one deliberate edge against EPIC order; E3-S4
registers the five delivered screens itself; E4, E5 and E6 each close with an owner-shell story
(E4-S6, E5-S5, E6-S7) that registers its screen's route, title and destination, E4-S6 also mounting
`SetupDraftProvider`, so E3 never depends on E4; the AC-26 literal scan is written in E1-S1 and widened
by E3-S2, E3-S5, E3-S6 and every screen story; every E3 to E6 screen story carries derived criteria for
AC-19 and AC-20. Every real-stack end-to-end story depends on E2-S5, which registers the data-health
routes. E7-S8 (the `SHELL_ROUTES` edit) implements `/data` under DEC-0224 and depends on E3-S4 and
E6-S7. E1-S10 and E7-S8 are sequenced after CAP-002's `classification-ui` merges (capability OQ-2).

## Full Traceability

| Capability AC | System Design Element | Component Design Element | EPIC | Story |
|--------------|----------------------|--------------------------|------|-------|
| AC-1 | §4.1 static destination list in two groups; constraint 11; DEC-0204 | owner-shell 2.6, 2.7 | E3 | CAP-003-E3-S4, CAP-003-E3-S6, CAP-003-E3-S8, CAP-003-E5-S5, CAP-003-E6-S7 |
| AC-2 | §3.1 `/` redirect on `most_recent_run`; §3.2; DEC-0202 | owner-shell 2.5; setup-ui 2.3 | E3, E4 | CAP-003-E3-S4, CAP-003-E4-S1, CAP-003-E4-S4, CAP-003-E4-S5, CAP-003-E4-S6, CAP-003-E5-S5 |
| AC-3 | §3.2 note 1; stepper and in-memory drafts | setup-ui 2.2; owner-shell 2.1 (`SetupDraftProvider` placement) | E4, E3 | CAP-003-E4-S1, CAP-003-E4-S2, CAP-003-E4-S3, CAP-003-E4-S4, CAP-003-E4-S5, CAP-003-E4-S6 |
| AC-4 | §3.2; constraint 10; no-secrets test extended | setup-ui 10; data-health-api 4; ingestion-api 2.3; data-health-ui 2.6; owner-web-app 2.3 | E2, E4, E6, E7 | CAP-003-E2-S2, CAP-003-E2-S4, CAP-003-E2-S5, CAP-003-E3-S3, CAP-003-E4-S2, CAP-003-E4-S4, CAP-003-E6-S4, CAP-003-E7-S1 |
| AC-5 | §3.2 notes 2, 3; reused `parse-bulk-symbols` | setup-ui 2.3; owner-web-app 3 | E4, E7 | CAP-003-E4-S3, CAP-003-E7-S3 |
| AC-6 | §3.2 warning below 30 | setup-ui 10 step 3 | E4 | CAP-003-E4-S3 |
| AC-7 | §3.2, §3.3; `latest_download.progress`; DEC-0203 kind 4 | data-health-reader 2.6; setup-ui 2.3; home-ui 2.5; ui-components 2.6 | E1, E2, E4, E5 | CAP-003-E1-S8, CAP-003-E2-S2, CAP-003-E4-S4, CAP-003-E4-S5, CAP-003-E5-S3, CAP-003-E5-S4 |
| AC-8 | §3.3 boxes 6 to 10, 19 to 21 | home-ui 2.4; data-health-api 2.4; ui-components 2.4; owner-shell 2.3 | E1, E2, E3, E5, E6 | CAP-003-E1-S6, CAP-003-E1-S7, CAP-003-E2-S2, CAP-003-E3-S1, CAP-003-E3-S3, CAP-003-E5-S2, CAP-003-E6-S1 |
| AC-9 | §3.3 note 3; `sortAttention`; DEC-0203 | ui-components 2.6; data-health-reader 2.4, 2.7; home-ui 2.5 | E1, E2, E5 | CAP-003-E1-S8, CAP-003-E2-S1, CAP-003-E2-S2, CAP-003-E5-S3, CAP-003-E5-S4 |
| AC-10 | constraint 11; M1 regions only | owner-shell 2.6; home-ui 3 | E3, E5 | CAP-003-E3-S6, CAP-003-E5-S3 |
| AC-11 | §3.4 note 8; constraint 4; `GET /api/data-health`; DEC-0201, DEC-0210 | ui-components 2.4; data-health-reader 2.5; data-health-api 2.4; data-health-ui 2.3, 2.4 | E1, E2, E5, E6 | CAP-003-E1-S7, CAP-003-E2-S3, CAP-003-E2-S4, CAP-003-E2-S6, CAP-003-E5-S2, CAP-003-E6-S1, CAP-003-E6-S5, CAP-003-E6-S6 |
| AC-12 | constraint 6; recorded states only | ui-components 2.3; data-health-reader 2.5, 2.6; home-ui 2.5; data-health-ui 2.6; owner-web-app 2.3 | E1, E2, E3, E5, E6, E7 | CAP-003-E1-S5, CAP-003-E2-S2, CAP-003-E2-S3, CAP-003-E3-S7, CAP-003-E5-S3, CAP-003-E6-S4, CAP-003-E7-S4, CAP-003-E7-S5 |
| AC-13 | §3.4; DEC-0201 | data-health-reader 2.4; data-health-api 2.4; data-health-ui 2.5 | E2, E6 | CAP-003-E2-S1, CAP-003-E2-S4, CAP-003-E2-S6, CAP-003-E3-S1, CAP-003-E6-S3, CAP-003-E6-S6 |
| AC-14 | §3.4 note 2; `retryable` | data-health-reader 2.4; data-health-ui 2.5, 2.7; owner-web-app 2.3 | E2, E6, E7 | CAP-003-E2-S1, CAP-003-E6-S2, CAP-003-E6-S3, CAP-003-E6-S6, CAP-003-E7-S2, CAP-003-E7-S3, CAP-003-E7-S5 |
| AC-15 | §3.4; `POST /api/acquisition-runs`, `queued_behind` | data-health-ui 2.7; setup-ui 2.3; owner-web-app 2.3 | E4, E6, E7 | CAP-003-E4-S4, CAP-003-E6-S2, CAP-003-E6-S6, CAP-003-E7-S2, CAP-003-E7-S4 |
| AC-16 | §3.3 boxes 17, 18 | owner-shell 2.7; ui-components 2.6; data-health-reader 2.4; data-health-api 2.4; home-ui 2.5; data-health-ui 2.5 | E1, E2, E3, E5, E6 | CAP-003-E1-S8, CAP-003-E2-S1, CAP-003-E2-S5, CAP-003-E2-S6, CAP-003-E2-S7, CAP-003-E3-S1, CAP-003-E3-S3, CAP-003-E3-S6, CAP-003-E5-S3, CAP-003-E5-S4, CAP-003-E5-S5, CAP-003-E6-S3, CAP-003-E6-S7 |
| AC-17 | §3.5, §4.1, constraint 2 | owner-web-app 2.1, 2.3, 2.6; owner-shell 2.6; ingestion-api 2.1; setup-ui 3; data-health-ui 11 | E2, E3, E4, E6, E7 | CAP-003-E2-S1, CAP-003-E2-S4, CAP-003-E2-S5, CAP-003-E2-S6, CAP-003-E3-S1, CAP-003-E3-S3, CAP-003-E3-S4, CAP-003-E4-S2, CAP-003-E4-S3, CAP-003-E4-S4, CAP-003-E4-S6, CAP-003-E6-S2, CAP-003-E6-S4, CAP-003-E6-S7, CAP-003-E7-S1, CAP-003-E7-S2, CAP-003-E7-S3, CAP-003-E7-S4, CAP-003-E7-S5, CAP-003-E7-S6, CAP-003-E7-S7 |
| AC-18 | §3.1 note 4; `legacy-redirects.tsx` | owner-shell 2.6; owner-web-app 2.1, 2.3 | E3, E7 | CAP-003-E3-S4, CAP-003-E3-S8, CAP-003-E7-S2, CAP-003-E7-S3, CAP-003-E7-S4, CAP-003-E7-S7, CAP-003-E7-S8 |
| AC-19 | constraint 3; display labels in the interface | ui-components 2.3; data-health-reader 3; owner-web-app 2.3, 7 | E1, E2, E7 | CAP-003-E1-S5, CAP-003-E2-S4, CAP-003-E3-S4, CAP-003-E3-S5, CAP-003-E3-S6, CAP-003-E3-S7, CAP-003-E4-S1, CAP-003-E4-S2, CAP-003-E4-S3, CAP-003-E4-S4, CAP-003-E5-S1, CAP-003-E5-S2, CAP-003-E5-S3, CAP-003-E6-S1, CAP-003-E6-S2, CAP-003-E6-S3, CAP-003-E6-S4, CAP-003-E6-S5, CAP-003-E7-S1, CAP-003-E7-S2, CAP-003-E7-S3, CAP-003-E7-S4, CAP-003-E7-S5, CAP-003-E7-S6, CAP-003-E7-S7 |
| AC-20 | constraint 4; one tier function | ui-components 2.3; owner-web-app 2.3 | E1, E7 | CAP-003-E1-S5, CAP-003-E1-S8, CAP-003-E3-S5, CAP-003-E3-S6, CAP-003-E3-S7, CAP-003-E4-S2, CAP-003-E4-S3, CAP-003-E4-S4, CAP-003-E5-S1, CAP-003-E5-S2, CAP-003-E5-S3, CAP-003-E6-S1, CAP-003-E6-S2, CAP-003-E6-S3, CAP-003-E6-S4, CAP-003-E6-S5, CAP-003-E7-S1, CAP-003-E7-S2, CAP-003-E7-S3, CAP-003-E7-S4, CAP-003-E7-S5 |
| AC-21 | §3.3 boxes 5, 20, 21; §3.4 note 7 | data-health-reader 2.5, 2.6; data-health-api 2.4; setup-ui 2.3; home-ui 2.2, 2.4; data-health-ui 2.2, 10; ui-components 2.4 | E1, E2, E3, E4, E5, E6 | CAP-003-E1-S7, CAP-003-E2-S2, CAP-003-E2-S3, CAP-003-E2-S6, CAP-003-E3-S4, CAP-003-E4-S1, CAP-003-E4-S4, CAP-003-E4-S5, CAP-003-E5-S2, CAP-003-E5-S3, CAP-003-E5-S4, CAP-003-E6-S5 |
| AC-22 | §3.5; DEC-0207 | owner-shell 2.7; command-palette 2.2, 2.3 | E3 | CAP-003-E3-S5, CAP-003-E3-S6, CAP-003-E3-S8 |
| AC-23 | §3.1 note 3; DEC-0204 | owner-shell 2.8 | E3 | CAP-003-E3-S2, CAP-003-E3-S6, CAP-003-E3-S8 |
| AC-24 | constraint 5; states per region | ui-components 2.5, 2.7; owner-shell 2.8; command-palette 2.4; setup-ui 10; home-ui 10; data-health-ui 10; owner-web-app 2.5 | E1, E2, E3, E4, E5, E6, E7 | CAP-003-E1-S6, CAP-003-E1-S9, CAP-003-E2-S3, CAP-003-E2-S4, CAP-003-E3-S1, CAP-003-E3-S2, CAP-003-E3-S3, CAP-003-E3-S4, CAP-003-E3-S5, CAP-003-E4-S2, CAP-003-E4-S4, CAP-003-E5-S1, CAP-003-E5-S3, CAP-003-E6-S1, CAP-003-E6-S3, CAP-003-E6-S4, CAP-003-E6-S5, CAP-003-E7-S1, CAP-003-E7-S2, CAP-003-E7-S3, CAP-003-E7-S4, CAP-003-E7-S5 |
| AC-25 | constraint 8, 13; cadences and *checked {time}* | owner-shell 2.4, 2.7; ui-components 3, 7; setup-ui 10; home-ui 2.3, 10; data-health-ui 2.6, 10; command-palette 7; owner-web-app 10 | E1, E3, E4, E5, E6, E7 | CAP-003-E1-S1, CAP-003-E1-S2, CAP-003-E1-S3, CAP-003-E1-S4, CAP-003-E1-S6, CAP-003-E3-S2, CAP-003-E3-S3, CAP-003-E3-S4, CAP-003-E3-S5, CAP-003-E3-S6, CAP-003-E3-S7, CAP-003-E3-S8, CAP-003-E4-S2, CAP-003-E4-S3, CAP-003-E4-S4, CAP-003-E4-S5, CAP-003-E5-S1, CAP-003-E5-S2, CAP-003-E5-S3, CAP-003-E5-S5, CAP-003-E6-S2, CAP-003-E6-S3, CAP-003-E6-S4, CAP-003-E6-S7, CAP-003-E7-S1, CAP-003-E7-S2, CAP-003-E7-S3, CAP-003-E7-S4, CAP-003-E7-S5 |
| AC-26 | §4.1, constraint 12; DEC-0205; `layout.ts` | ui-components 2.1, 2.2; owner-shell 2.1, 10; setup-ui 10; home-ui 10; data-health-ui 10; owner-web-app 10; command-palette 10 | E1, E3, E4, E5, E6, E7 | CAP-003-E1-S1, CAP-003-E1-S2, CAP-003-E1-S3, CAP-003-E1-S4, CAP-003-E1-S10, CAP-003-E3-S2, CAP-003-E3-S5, CAP-003-E3-S6, CAP-003-E4-S2, CAP-003-E4-S4, CAP-003-E5-S1, CAP-003-E5-S3, CAP-003-E6-S5, CAP-003-E7-S1, CAP-003-E7-S2, CAP-003-E7-S3, CAP-003-E7-S4, CAP-003-E7-S5 |
| AC-27 | §4.2 `classification-ui` registration; DEC-0204; open question 6 | owner-shell 2.6; command-palette 2.3; owner-web-app 2.1 | E3, E7 | CAP-003-E3-S4, CAP-003-E3-S5, CAP-003-E5-S5, CAP-003-E6-S7, CAP-003-E7-S8 |
| AC-28 | constraint 7; assumption 4; `GET /api/data-health` on demand | data-health-reader 5, 7; data-health-api 5; owner-shell 2.3 (`useDataHealth`) | E2, E3, E6 | CAP-003-E2-S2, CAP-003-E2-S3, CAP-003-E2-S7, CAP-003-E3-S3, CAP-003-E6-S5, CAP-003-E6-S6 |
