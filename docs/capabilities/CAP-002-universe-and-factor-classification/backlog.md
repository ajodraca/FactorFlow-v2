---
artifact_schema_version: 1
artifact_id: CAP-002-backlog
artifact_type: backlog
artifact_version: 4
status: approved
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
ai_provenance:
  agent_id: story-generation-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T15:40:00Z
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
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
approval:
  approval_policy: owner-allowed
  approved_by: "Alvaro de Jodra"
  approved_at: 2026-10-17T18:06:07Z
  reviewed_revision: sha256:195b8dfac315b44b960f811ca33c03cb862d6b0901790e1eeb4a2e2b64850282
  review_artifact: "docs/capabilities/CAP-002-universe-and-factor-classification/backlog-review-report-v5.md"
---

# Backlog: Universe & Factor Classification

**Capability:** CAP-002
**Generated:** 2026-10-17
**Total EPICs:** 5
**Total Stories:** 37 (206 points)

## EPICs

| EPIC ID | Jira Key | Title | Estimate | Stories | Total Points |
|---------|----------|-------|----------|---------|-------------|
| [CAP-002-E1](epics/universe-definition-and-maintenance/CAP-002-E1.md) | N/A | Universe Definition and Maintenance | L | 9 | 54 |
| [CAP-002-E2](epics/automatic-factor-classification-engine/CAP-002-E2.md) | N/A | Automatic Factor Classification Engine | XL | 9 | 50 |
| [CAP-002-E3](epics/classification-read-api/CAP-002-E3.md) | N/A | Classification Read API: Scoring, Currency and Evidence | L | 6 | 34 |
| [CAP-002-E4](epics/research-screen-scores-and-filtering/CAP-002-E4.md) | N/A | Research Screen: Scores and Filtering | L | 10 | 52 |
| [CAP-002-E5](epics/compare-stock-evidence-and-diagnosis/CAP-002-E5.md) | N/A | Compare, Stock Evidence and Insufficient-Evidence Diagnosis | M | 3 | 16 |

## Sequencing

E2 (the factor engine and scheduler) and E1's own schema and replay stories are
startable in parallel once CAP-001's documented contract is read against,
since CAP-001 is `requires-runtime` and binds at integration rather than
blocking design or most implementation. E3 sits between the write side (E1)
and the read side (E4, E5): it depends on E2 for data and on E1 for the
universe-scope replay, and E1's own filter-save story depends back on E3's
`evaluate_filter` — a deliberate cross-EPIC ordering at the story level, not a
cycle at the EPIC level. E4 owns the one shell-composition seam every screen
in E1 and E5 renders inside; E3 owns the API-side seam (`app.py`: the two routers
and the scheduler start, DAC-E3-13), which E1's and E3's endpoints and E2's
refresh all need at runtime. That composition story lands last on the API side:
it imports E1's and E3's router modules and E2's scheduler, so it depends on
all three stories and nothing depends on it at build time.

```
E2 ──────────────────────────┐
E1 (schema, replay) ─────────┼── E3 ──┬── E4 ── E5
                              │        │
E1 (filter-save story) ◄──────────────┘
E1 (Universes UI) ◄───────────────────── E4 (composition seam)
```

- **E2** is startable now against CAP-001's documented contract; its volume
  test and the value/growth inputs wait on the owner's payload-key answer
  (E2's open question), but momentum, the peer sets, the composite and the
  transaction do not.
- **E1**'s schema, `universe-service`'s core writes and its replay queries are
  startable now; its `create_from_filter` story needs E3's `evaluate_filter`
  and a current classification set, so it lands after E3.
- **E3** needs E2's rows to read and E1's `membership_as_of.sql` to scope a
  universe; once both exist, E3's list, compare, evidence, history and
  summary reads are a cohesive unit.
- **E4** needs E3's reads and, for its Save/Add dialogs, E1's universe-write
  API; it is also where the one shell-composition seam (the appended rail
  destination and all five `/research/*` routes) is built, so E1's Universes
  screens and E5's Compare and Stock evidence screens render inside routes
  E4 creates.
- **E5** needs E3's compare and evidence reads and E4's composition seam; it
  has no dependents.

No cross-capability blockers constrain this EPIC breakdown: CAP-001 is
`requires-runtime` (capability section 5.1) and binds at integration, and
`tech-stack.md` and `STD-UI` are `conforms-to`, designed against rather than
waited on.

## Story-Level Ordering

Story generation recorded the hard dependencies in `dependencies.yaml` by what each story imports (DEC-0086, `DEC-0087`; backlog review v3 FINDING-11 and FINDING-12). Where this differs from the EPIC-level prose above, the story graph governs scheduling:

- Each API router is mounted by the story that builds it (CAP-002-E1-S6 mounts `universes`, CAP-002-E3-S5 mounts `classifications`); CAP-002-E3-S6 then starts the scheduler and extends the no-secrets test, depending on both and on CAP-002-E2-S9.
- CAP-002-E4-S10 (shell composition) depends on the Research, Universes, Compare and Stock evidence screen stories, because `routes.tsx` imports each; the `requestJson` export is made by CAP-002-E4-S1.
- Deliberate cross-EPIC edges: E1-S5 on E3-S2 (`evaluate_filter`); E1-S7, S8, S9 on E4-S1 to S6 (fetch layer, patterns, table); E4-S10 on E5-S1 and E5-S3; E2-S1 on E1-S1 (migration numbering has no gaps); E3-S2, S3 on E1-S2 (`membership_as_of`).

## Full Traceability

| Capability AC | System Design Element | Component Design Element | EPIC | Story |
|--------------|----------------------|--------------------------|------|-------|
| AC-1 | 3.2 steps 4, 4a; 4.2; 5.13 | universe-service 2.3-2.5 | CAP-002-E1 | CAP-002-E1-S3, CAP-002-E1-S6, CAP-002-E1-S7 |
| AC-2 | 3.2 step 3a; 3.3 step 15; 4.2; 4.4; 5.14 | universe-service 2.3, 2.4; classification-ui 2.7 | CAP-002-E1, CAP-002-E4 | CAP-002-E1-S5, CAP-002-E4-S8 |
| AC-3 | 4.2; 4.4 | universe-service 2.3 | CAP-002-E1 | CAP-002-E1-S1, CAP-002-E1-S3, CAP-002-E1-S7 |
| AC-4 | 3.2 steps 8, 11, 12; 4.2 | universe-service 2.3, 2.4 | CAP-002-E1 | CAP-002-E1-S4, CAP-002-E1-S6, CAP-002-E1-S8, CAP-002-E1-S9 |
| AC-5 | 3.2 step 7, 7a; 4.2; 5.13 | universe-service 2.4, 2.8; classification-ui 2.7 | CAP-002-E1, CAP-002-E4 | CAP-002-E1-S3, CAP-002-E1-S4, CAP-002-E1-S5, CAP-002-E1-S6, CAP-002-E1-S7, CAP-002-E1-S8, CAP-002-E1-S9, CAP-002-E4-S8 |
| AC-6 | 4.2; 4.4; 5.3 | universe-service 2.5 | CAP-002-E1 | CAP-002-E1-S1, CAP-002-E1-S2, CAP-002-E1-S4, CAP-002-E1-S6, CAP-002-E1-S8, CAP-002-E1-S9 |
| AC-7 | 3.1 steps 8a-10a; 5.7; 5.8 | factor-engine 2.4, 2.5 | CAP-002-E2 | CAP-002-E2-S2, CAP-002-E2-S3, CAP-002-E2-S4 |
| AC-8 | 5.5 | factor-engine 2.5 | CAP-002-E2 | CAP-002-E2-S5 |
| AC-9 | 3.1 step 10a; 3.3 step 15; 5.7 | factor-engine 2.5; classification-reader 2.3, 2.5; classification-ui 2.5 | CAP-002-E2, CAP-002-E3, CAP-002-E4 | CAP-002-E2-S5, CAP-002-E3-S2, CAP-002-E3-S5, CAP-002-E4-S2, CAP-002-E4-S3, CAP-002-E4-S6, CAP-002-E4-S9 |
| AC-10 | 3.1 steps 4-7a, 19-21; 5.10; 4.2 (Scheduler start) | classification-scheduler 2.3, 2.4; factor-engine 2.3; classification-api 2.3 | CAP-002-E2, CAP-002-E3 | CAP-002-E2-S1, CAP-002-E2-S2, CAP-002-E2-S8, CAP-002-E2-S9, CAP-002-E3-S6 |
| AC-11 | 3.1 steps 28-31; 4.3; 5.10 | factor-engine 2.3, 5; classification-scheduler 2.3, 5; classification-ui 2.5, 5 | CAP-002-E2, CAP-002-E4 | CAP-002-E2-S2, CAP-002-E2-S7, CAP-002-E2-S9, CAP-002-E4-S6, CAP-002-E4-S9 |
| AC-12 | 3.1 step 12; 3.3 step 15; 4.4; 5.6 | factor-engine 2.5; classification-reader 2.5; classification-ui 2.5 | CAP-002-E2, CAP-002-E3, CAP-002-E4 | CAP-002-E2-S3, CAP-002-E2-S5, CAP-002-E4-S3, CAP-002-E4-S6, CAP-002-E4-S9 |
| AC-13 | 3.3 step 18; 4.2; 5.6; 5.8 | factor-engine 2.4; classification-reader 2.4; classification-ui 10 | CAP-002-E2, CAP-002-E3, CAP-002-E5 | CAP-002-E2-S3, CAP-002-E2-S4, CAP-002-E3-S1, CAP-002-E3-S5, CAP-002-E5-S3 |
| AC-14 | 3.1 steps 9, 11a; 4.4; 5.6 | factor-engine 2.3, 2.5; classification-reader 2.5; classification-ui 2.5 | CAP-002-E2, CAP-002-E3, CAP-002-E4 | CAP-002-E2-S5, CAP-002-E4-S3, CAP-002-E4-S6, CAP-002-E4-S9 |
| AC-15 | 3.2 step 10; 5.5 | universe-service 2.4; factor-engine 2.5; classification-reader 2.5; classification-ui 2.5 | CAP-002-E1, CAP-002-E2, CAP-002-E3, CAP-002-E5 | CAP-002-E1-S2, CAP-002-E1-S3, CAP-002-E1-S8, CAP-002-E2-S2, CAP-002-E2-S5, CAP-002-E3-S3, CAP-002-E5-S1, CAP-002-E5-S2, CAP-002-E5-S3 |
| AC-16 | 3.3 steps 15, 16; 4.2 | classification-reader 2.3, 2.5; classification-api 2.4, 2.7; classification-ui 2.4, 2.5 | CAP-002-E3, CAP-002-E4, CAP-002-E5 | CAP-002-E3-S2, CAP-002-E3-S3, CAP-002-E3-S5, CAP-002-E3-S6, CAP-002-E4-S1, CAP-002-E4-S2, CAP-002-E4-S5, CAP-002-E4-S6, CAP-002-E4-S7, CAP-002-E4-S9, CAP-002-E5-S1 |
| AC-17 | 3.3 step 17; 4.2; 4.4 | classification-reader 2.6; classification-ui 2.5, 10 | CAP-002-E3, CAP-002-E5 | CAP-002-E3-S3, CAP-002-E3-S5, CAP-002-E5-S3 |
| AC-18 | 4.2; 4.4; 5.3 | classification-reader 2.6; classification-ui 10 | CAP-002-E3, CAP-002-E5 | CAP-002-E3-S4, CAP-002-E3-S5, CAP-002-E5-S2 |
| AC-19 | 3.1 steps 22-24; 5.4 | factor-engine 2.3; classification-ui 2.4, 10 | CAP-002-E2, CAP-002-E5 | CAP-002-E2-S1, CAP-002-E2-S2, CAP-002-E2-S7, CAP-002-E5-S2 |
| AC-20 | 3.1 steps 13-14b, 25-27; 3.3 steps 13, 14, 18; 5.2; 5.11 | factor-engine 2.3, 2.6; classification-scheduler 2.4; classification-reader 2.4; classification-ui 2.6 | CAP-002-E2, CAP-002-E3, CAP-002-E4 | CAP-002-E2-S1, CAP-002-E2-S2, CAP-002-E2-S8, CAP-002-E2-S9, CAP-002-E3-S1, CAP-002-E3-S5, CAP-002-E4-S1, CAP-002-E4-S4, CAP-002-E4-S9 |
| AC-21 | 3.3 steps 13, 18; 8 question 11 | classification-reader 2.4, 2.6; classification-ui 2.6 | CAP-002-E3, CAP-002-E4 | CAP-002-E3-S1, CAP-002-E3-S5, CAP-002-E4-S4, CAP-002-E4-S9 |
| AC-22 | 3.3 step 14; 5.11; 5.18 | classification-reader 2.4; classification-ui 2.4, 2.6 | CAP-002-E3, CAP-002-E4 | CAP-002-E3-S1, CAP-002-E3-S5, CAP-002-E4-S1, CAP-002-E4-S4, CAP-002-E4-S9 |
| AC-23 | 4.2; 4.4; 5.9 | factor-engine 2.4, 2.5; classification-reader 2.5, 2.6; classification-ui 2.5, 10 | CAP-002-E2, CAP-002-E3, CAP-002-E5 | CAP-002-E2-S6, CAP-002-E3-S2, CAP-002-E3-S4, CAP-002-E5-S1, CAP-002-E5-S2, CAP-002-E5-S3 |
