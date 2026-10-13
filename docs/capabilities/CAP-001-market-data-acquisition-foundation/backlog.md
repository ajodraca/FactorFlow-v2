---
artifact_schema_version: 1
artifact_id: CAP-001-backlog
artifact_type: backlog
artifact_version: 8
status: approved
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-10-12
ai_provenance:
  agent_id: story-generation-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.296"
  timestamp: 2026-10-13T02:44:32Z
  source_artifacts:
    - id: CAP-001
      version: "8"
    - id: CAP-001-system-design
      version: "8"
    - id: CAP-001-ux-design
      version: "approved"
    - id: CAP-001-E3
      version: "4"
    - id: CAP-001-E3-S6
      version: "3"
    - id: CAP-001-E3-S7
      version: "3"
    - id: CAP-001-E1
      version: "3"
    - id: CAP-001-E1-S7
      version: "2"
    - id: CAP-001-E1-S8
      version: "2"
    - id: CAP-001-E1-S9
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
approval:
  approval_policy: owner-allowed
  approved_by: "Alvaro de Jodra"
  approved_at: 2026-10-13T02:55:48Z
  reviewed_revision: sha256:eacb6eb7ee16d9938b83ac0231b245b0df920aa7ab3b2441cadbe7b1fd726170
  review_artifact: "docs/capabilities/CAP-001-market-data-acquisition-foundation/backlog-review-report-v15.md"
---

# Backlog: Market Data Acquisition Foundation

**Capability:** CAP-001
**Generated:** 2026-09-06
**Total EPICs:** 7
**Total Stories:** 41
**Total Points:** 177

## EPICs

| EPIC ID | Jira Key | Title | Estimate | Stories | Total Points |
|---------|----------|-------|----------|---------|-------------|
| [CAP-001-E1](epics/runnable-foundation/CAP-001-E1.md) | N/A | Runnable Foundation, Schema and Application Shell | L | 9 | 37 |
| [CAP-001-E2](epics/instrument-list-and-history-depth/CAP-001-E2.md) | N/A | Instrument List and History Depth | M | 4 | 16 |
| [CAP-001-E3](epics/provider-integration-and-pacing/CAP-001-E3.md) | N/A | Provider Integration and Pacing | L | 7 | 30 |
| [CAP-001-E4](epics/point-in-time-acquisition/CAP-001-E4.md) | N/A | Point-in-Time Acquisition and Re-run Safety | XL | 7 | 32 |
| [CAP-001-E5](epics/run-lifecycle/CAP-001-E5.md) | N/A | Run Lifecycle: Queueing, Cancellation and Recovery | L | 6 | 31 |
| [CAP-001-E6](epics/coverage-and-gap-visibility/CAP-001-E6.md) | N/A | Coverage and Gap Visibility | L | 4 | 18 |
| [CAP-001-E7](epics/failure-diagnosis-and-operability/CAP-001-E7.md) | N/A | Failure Diagnosis and Operational Visibility | M | 4 | 13 |

## Sequencing

E1 is the critical path: every other EPIC depends on it. There are no
cross-capability blockers. Capability section 5.1 types Massive as
`requires-runtime` with `no-acceptance-criterion`, and both `tech-stack.md` and
`STD-UI` as `conforms-to`, so every EPIC is designed against a cited contract
rather than waiting on another capability. Massive binds at integration in E3
and E4.

```
E1 ──┬── E2 ────────────────┐
     ├── E3-S1..S5 ─────────┤
     └── E4-S1 ── E5-S1 ── E5-S2
                       ├─────┴── E4 remainder ── E6
                       │               └── E4-S5 ── E3-S6 + E3-S7 (merge together)
                       └──────── E5 remainder ── E7
```

E1 also delivers the application shell and status region that every screen
renders inside, so E2, E5, E6 and E7 each depend on E1 for their frame as well
as for the schema. That is why the shell sits in E1 rather than in E7: three
screen-delivering EPICs would otherwise be scheduled ahead of the frame they
need, or each would invent its own.

- **E1** first and alone. Nothing else can start without the schema, migrations, runtime configuration and the application shell. The exception is E1-S7 to E1-S9, added after the other epics landed. They follow those epics deliberately (see *Deployment stories* below).
- **E2 and E3-S1 to E3-S5** are parallelizable once E1 lands, and share no components. **E3-S6 and E3-S7** also need E4-S5 (`factorflow.ingestion_main`), deliberately a later-epic dependency, and touch `acquisition-runner`'s module. They **merge together**: E3-S6 reaches `main` only in the same merge as E3-S7 (see below).
- **E4** starts with E4-S1 after E1, then its remaining stories need E2's instrument list and stated depth, E3's provider client, E5-S1's schema and E5-S2's claim contract. It is the largest EPIC and carries the three commitments the system design names unrecoverable if wrong.
- **E5** needs E1, E2 and E4-S1's observation migration. E5-S1 then owns migrations 0003 and 0004 together, avoiding a migration-order cycle with E4-S3; the remaining E5 work can run alongside later E4 stories against the fixed schema and claim contracts.
- **E6** needs E4's written coverage segments to read, though its read contract is fixed and can be built against in parallel.
- **E7** needs E5's run records. It supplies the most recent run's outcome to the status region E1 delivers, and owns the error envelope every screen renders, so its error contract is worth settling early even though its run detail screen comes last.

## Stories

41 stories across the seven EPICs, 177 points. Every story is scoped to the
single writable repository `FactorFlow-v2`, which `project.yaml` declares; the
twelve component names from the system design are modules within it rather than
separate repositories, and each story names its module in the description.

| EPIC | Stories | Points | Language split |
|------|---------|--------|----------------|
| E1 Runnable Foundation, Schema and Application Shell | 9 | 37 | 7 Python, 2 TypeScript |
| E2 Instrument List and History Depth | 4 | 16 | 3 Python, 1 TypeScript |
| E3 Provider Integration and Pacing | 7 | 30 | 7 Python |
| E4 Point-in-Time Acquisition and Re-run Safety | 7 | 32 | 7 Python |
| E5 Run Lifecycle: Queueing, Cancellation and Recovery | 6 | 31 | 5 Python, 1 TypeScript |
| E6 Coverage and Gap Visibility | 4 | 18 | 3 Python, 1 TypeScript |
| E7 Failure Diagnosis and Operational Visibility | 4 | 13 | 3 Python, 1 TypeScript |
| **Total** | **41** | **177** | 35 Python, 6 TypeScript |

No story spans both languages, so none straddles the pytest and vitest boundary.
E1-S9 also writes the `Dockerfile`, `compose.yaml` and a shell script; its
automated tests are pytest, so it is counted as Python.

### Deployment stories (added 2026-10-12)

E1-S7 to E1-S9 implement the approved deployment definition (runtime-config
v14 sections 2.3 and 2.8, schema-migrator v7, ingestion-api v8 section 2.5a),
closing release manifest v1 blockers B1, B3 and B4. E1-S7 adds the `Host` and
`Origin` checks (H9). E1-S8 confines every database client through
`DatabaseSettings` (H7) and ships the migrations as package data (B1). E1-S9
delivers the release image, `compose.yaml`, `scripts/deploy-smoke.sh`, and the
README's run, upgrade, backup and rollback procedures (B3, B4), and depends on
E1-S8. All three also depend on stories in later epics: E2-S3, E5-S5, E7-S2,
E3-S6 and E4-S5, all done. So they come after those epics, not in E1's original
position. E1-S7 and E1-S8 are independent and can start at once, but they edit
13 of the same test modules, so whichever merges second rebases onto the first. The plaintext
loopback channels rely on the CONST-SEC 1.3 `SEC-ENC-001 host-local loopback
exception` (DEC-0050). E1-S9's backup drill needs the owner's Docker host and
live provider key. It is part of E1-S9's completion, run during coding with the
owner present. The smoke check against the real production deployment is
release evidence for release readiness v2.

### Provider base URL stories (added 2026-10-09)

E3-S6 and E3-S7 implement the approved base URL designs (runtime-config v11
section 2.2c, massive-client v11 section 2.2b, acquisition-runner v8 section
2.1). E3-S6 is the release-build half: `https`-only validation, `base=` on the
SDK, and socket-free no-redirect and no-proxy tests. E3-S7 is the test-only
loopback `http` entry point for the E2E stub, which rests on CONST-SEC 1.2
(in force at the pinned revision since 2026-10-09). Both depend on E4-S5, a
later epic, deliberately, because E4 owns `factorflow.ingestion_main`.
Placement and split: DEC-0039. E3-S6's redirect test expectations supersede
the approved massive-client section 7 redirect row and DEC-0038 (DEC-0042).
`$doc-sync` does not edit component designs, so a design refinement of
massive-client section 7 (`$design-decomposition`) is required before
`$test-design` reads that row; DEC-0042 governs meanwhile.

**Landing rule: E3-S6 and E3-S7 merge together** (specification review v7
FINDING-10 (a), resolved 2026-10-09). E3-S6 alone makes the E2E acquisition
stack's ingestion process refuse to start, and `.github/workflows/validate.yml`
runs the `End-to-end` job on every pull request and on push to `main`. So E3-S6
reaches `main` only in the same merge as E3-S7. The default `$pipeline-run`
cannot do this on its own: it keeps E3-S7 `waiting` until E3-S6's reviewed
commit is on `origin/main`, and opens one PR per story. Use one of two routes:
(a) one supervised run with opt-in local integration
(`--integration-branch usr/<name>/CAP-001-E3-integration[-<suffix>]`,
`docs/supervised-runs.md`), publishing the integration branch as one PR; or
(b) attended, hold E3-S6's PR, code E3-S7 with `$story-coding` on a branch
stacked on E3-S6, and merge the pair together. Either way, use a merge commit,
not squash or rebase. Both are `P1`. No design change is needed, because clause 2a is
in force under CONST-SEC 1.2 at the pinned revision. It is a merge-order rule,
not a dependency: E3-S7 already depends on E3-S6, and a reverse edge would be a
cycle.

### Critical path

`E1-S1` schema, then `E1-S2` migrator, then `E1-S3` configuration, are the three
stories every other story waits on. `E4-S5`, the acquisition run loop at 8
points, is the largest single story and depends on the most: the writer, range
planning, the provider client, pacing and the claim contract.

`E1-S4` and `E1-S5`, the application shell and status region, unblock every
screen story in E2, E5, E6 and E7, which is why the shell sits in E1.


## Full Traceability

Every capability acceptance criterion is assigned to at least one EPIC. Criteria
appearing in more than one EPIC are genuinely shared: AC-13 is loaded in E1 and
enforced on the provider path in E3, AC-11 is produced in E3, classified in E4
and presented in E7, and so on.

An EPIC marked **(derived)** contributes to that criterion through one of its
derived criteria rather than by restating the capability criterion in its own
"From Capability" section. Both are real coverage; the distinction is recorded
so a reader reconciling this table against an EPIC file finds what they expect.

| Capability AC | System Design Element | Component Design Element | EPIC | Story |
|--------------|----------------------|--------------------------|------|-------|
| AC-1 Named instrument list | 4.1, 4.2 | instrument-list-service, ingestion-api, owner-web-app | E2 | E1-S1, E2-S1, E2-S3, E2-S4 |
| AC-2 History depth stated, not assumed | 4.2, 3 | instrument-list-service, ingestion-api | E2; E4, E5 (derived) | E1-S1, E2-S2, E2-S3, E2-S4 |
| AC-3 Data types acquired | 4.1, 4.2 | massive-client, acquisition-runner, observation-writer | E3, E4 | E3-S1, E3-S2, E3-S6, E3-S7, E4-S4, E4-S5 |
| AC-4 Acquisition volume, 3000 instruments | 3, 5.13, 5.14 | rate-limit-governor, acquisition-runner | E4; E3 (derived) | E3-S4, E4-S5, E4-S7 |
| AC-5 Point-in-time record | 3, 5.3, 5.4 | observation-writer, massive-client | E3, E4 | E3-S2, E4-S1, E4-S2, E4-S3 |
| AC-6 Re-run safety | 3 step 16, 4.2 | observation-writer, acquisition-runner | E4 | E4-S1, E4-S2, E4-S3, E4-S4, E4-S6 |
| AC-7 Coverage visibility | 4.1, 4.2 | market-data-store, coverage-service, ingestion-api, owner-web-app | E5, E6 | E5-S1, E4-S3, E6-S1, E6-S3, E6-S4 |
| AC-8 Gap visibility | 4.1, 5.5 | coverage-service | E6 | E6-S2, E6-S3, E6-S4 |
| AC-9 Honest run outcome | 3 steps 26-27 | run-journal | E5 | E5-S1, E5-S3, E5-S5, E5-S6, E7-S1 |
| AC-10 Failure diagnosis | 3 step 21, 4.2 | run-journal, ingestion-api, owner-web-app | E7 | E4-S6, E5-S5, E7-S1, E7-S2, E7-S4 |
| AC-11 Unrecognised instrument does not stop the run | 3 steps 18-21 | massive-client, acquisition-runner, run-journal | E3, E7; E4 (derived) | E3-S3, E3-S5, E4-S6, E7-S1, E7-S4 |
| AC-12 A failed run leaves no false history | 3 step 17, 5.9 | market-data-store, observation-writer, coverage-service | E4, E5, E6 | E4-S1, E5-S1, E4-S3, E6-S1 |
| AC-13 Credential handling | 3 steps 37-39, 4.2, 5.12 | runtime-config, massive-client, acquisition-runner, schema-migrator | E1, E3; E7 (derived) | E1-S2, E1-S3, E1-S8, E1-S9, E3-S1, E3-S5, E3-S6, E3-S7, E7-S2 |
| AC-14 Network exposure | 5.11 | runtime-config, ingestion-api, owner-web-app | E1 | E1-S3, E1-S4, E1-S6, E1-S7, E1-S9 |
| AC-15 Forward data evolution | 3 steps 32-35 | schema-migrator, market-data-store, runtime-config | E1, E5 | E1-S1, E1-S2, E1-S8, E1-S9, E5-S1 |
| AC-16 Refuse an inconsistent start | 3 step 36 | schema-migrator, owner-web-app, runtime-config | E1; E7 (derived) | E1-S2, E1-S5, E1-S8, E1-S9 |
| AC-17 Honest empty state | 4.2 | coverage-service, owner-web-app | E6; E1 (derived) | E6-S1, E6-S3, E6-S4, E1-S5 |
| AC-18 Operational visibility | 4.2 | ingestion-api, owner-web-app, runtime-config | E1, E7 | E1-S5, E1-S6, E1-S9, E7-S3 |
| AC-19 Cancel a run in progress | 3 steps 44-47, 4.2 | run-journal, acquisition-runner, ingestion-api | E5 | E4-S5, E5-S3, E5-S5, E7-S4 |
| AC-20 An interrupted run does not block the next | 3 steps 48-51, 5.7 | run-journal reclaim sweep | E5 | E4-S7, E5-S4 |
| AC-21 Removal retains history | 4.1, 4.2, 5.8 | instrument-list-service, coverage-service | E2, E6 | E2-S1, E2-S4, E6-S1, E6-S3, E6-S4 |
| AC-22 Deepening backfills history | 3, 5.3, 5.9 | acquisition-runner, coverage-service | E4, E6 | E4-S4, E6-S1, E6-S4 |
| AC-23 Concurrent run requests queue | 3, 4.2, 5.17 | run-journal, ingestion-api | E5 | E5-S2, E5-S5, E5-S6 |
| AC-24 A run with nothing to acquire is refused | 4.2, 5.18 | ingestion-api | E5 | E5-S5, E5-S6 |
| AC-25 Retiring takes effect from the next run | 3, 5.19 | instrument-list-service, acquisition-runner | E2; E4 (derived) | E2-S4, E4-S5 (via roster-read-once) |
| AC-26 A queued run can be cancelled before it starts | 3, 4.2, 5.20 | run-journal, ingestion-api | E5 | E5-S3, E5-S5, E5-S6, E7-S4 |

## Derived Acceptance Criteria

Each EPIC introduces derived criteria elaborated from the designs, numbered
`DAC-E<n>-<m>` and traced to a parent capability criterion in the EPIC's own
traceability table.

| EPIC | Derived ACs | Count |
|------|-------------|-------|
| E1 | DAC-E1-1 to DAC-E1-24 | 24 |
| E2 | DAC-E2-1 to DAC-E2-12 | 12 |
| E3 | DAC-E3-1 to DAC-E3-14 | 14 |
| E4 | DAC-E4-1 to DAC-E4-15 | 15 |
| E5 | DAC-E5-1 to DAC-E5-17 | 17 |
| E6 | DAC-E6-1 to DAC-E6-14 | 14 |
| E7 | DAC-E7-1 to DAC-E7-12 | 12 |
| **Total** | | **108** |

## Open Questions Carried From the Capability and Designs

None is blocking. Each is recorded in the EPIC it affects, or in the story it affects.

| Question | Affects | EPIC | Source |
|----------|---------|------|--------|
| Massive's instrument coverage for all four data types is untested | AC-3 | E3, E4 | Capability 7, assumption 1 |
| Decoupling the per-run E2E key from clause 2a (spec review v7 FINDING-10 (b); (a) resolved by the landing rule) | AC-13 | E3 | runtime-config 2.2c item 5 |
| `localhost` resolved once at start by the test entry point (spec review v7 FINDING-11) | AC-13 | E3 | runtime-config 2.2c item 2 |
| No duration target for a 3000-instrument run | AC-4 | E4 | Capability 7 |
| Whether a separate DDL credential is worth introducing | AC-13 | E1 | schema-migrator 14 |
| Indeterminate progress indicator is an unresolved component-spec gap | AC-9 presentation | E5 | ux-design 3, 7 |
| Density tier unselected (OQ-UI-4) | STD-UI-29 | E6 | ux-design 0 |
| `data-table` offers pagination, not the virtualisation STD-UI-30 requires | AC-4 presentation | E6 | Capability 5.4 |
| Whether the owner should see the configured provider request budget | run duration anticipation | E7 | ux-design 7 |
| When the loopback-only decision must be revisited | AC-14 | E1 | Capability 7 |
