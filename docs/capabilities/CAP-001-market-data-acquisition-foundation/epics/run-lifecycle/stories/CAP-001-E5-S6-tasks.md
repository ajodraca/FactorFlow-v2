---
artifact_schema_version: 1
artifact_id: CAP-001-E5-S6-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-11
updated: 2026-09-11
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: gpt-5.6
  tool: Codex
  tool_version: "unknown"
  timestamp: 2026-09-11T23:55:00Z
  source_artifacts:
    - id: CAP-001-E5-S6
      version: "1"
    - id: CAP-001-component-design-owner-web-app
      version: "4"
    - id: CAP-001-ux-design
      version: "5"
    - id: CAP-001-component-design-ingestion-api
      version: "6"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E5-S6 — Runs Screen and Run Controls

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/run-lifecycle/stories/CAP-001-E5-S6.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-E5-tasks`
**Date**: 2026-09-11

## Summary

Replace the Runs route placeholder with the poll-aware run-history screen and its start and cancellation controls. The screen consumes CAP-001-E5-S5's documented API response shape, gives every journal state its mandated tier and explanatory copy, retains keyboard-accessible blocked actions, and routes run identifiers through real anchors to detail.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-9 | Render each recorded outcome honestly. | T002, T005, T006 |
| AC-23 | Keep Start available and explain that an accepted request is queued. | T003, T005, T006 |
| AC-24 | Render the no-instruments refusal as a focusable blocked action with its reason. | T003, T005, T006 |
| DAC-E5-16 | Map all eight run states to their mandated STD-UI-12 tiers. | T002, T005 |
| DAC-E5-17 | Explain an abandoned run and provide the recovery path. | T002, T005 |
| DAC-E5-S6-1 | Poll every 10 seconds only while a run is non-terminal. | T002, T004, T006 |
| DAC-E5-S6-2 | Render the complete state-to-tier mapping. | T002, T005 |
| DAC-E5-S6-3 | Distinguish the history-depth and no-instruments blocked reasons. | T003, T005 |
| DAC-E5-S6-4 | Render run IDs as anchors to run detail. | T002, T005, T006 |
| DAC-E5-S6-5 | Use different cancellation confirmation copy for queued and running runs. | T003, T005 |
| DAC-E5-S6-6 | Report a `409` cancellation race as an already-completed run. | T003, T005 |
| DAC-E5-S6-7 | Explain that no run has ever been requested. | T002, T005 |

## Phase 1: Setup

**Purpose**: Extend the typed API boundary and route wiring with the run contract before screen behavior is added.

- [ ] T001 Update `web/src/api/types.ts` and `web/src/api/client.ts` with the confirmed CAP-001-E5-S5 run-list/start/cancel response types and typed calls for `GET`/`POST /api/acquisition-runs` and `POST /api/acquisition-runs/{id}/cancel`, preserving `ApiError` request-id handling and mapping snake_case wire fields at the client boundary (prerequisite infrastructure for AC-9, AC-23, and AC-24).
- [ ] T002 Update `web/src/app/routes.tsx` to replace the Runs placeholder with the new `web/src/screens/runs/index.tsx` screen and retain `/runs/:runId` as the child-route destination used by run-ID anchors (prerequisite infrastructure for DAC-E5-S6-4).

**Checkpoint**: The typed client exposes only the documented run contract, and the Runs destination can render a real screen without changing the existing run-detail route.

---

## Phase 2: Tests (TDD)

**Purpose**: Write component and route tests that make polling, state semantics, blocked actions, navigation, and cancellation feedback observable before screen implementation.

### Mandatory Component Tests

- [ ] T003 Create `web/src/screens/runs/runs-screen.test.tsx` with `// Implements TC-COMP-251`, `// Implements TC-COMP-252`, `// Implements TC-COMP-285`, `// Implements TC-COMP-286`, `// Implements TC-COMP-287`, `// Implements TC-COMP-288`, and `// Implements TC-COMP-291`: mock the typed API and fake timers to assert all eight text-plus-icon outcome tiers, abandoned recovery copy, a ten-second poll only while a requested/running/cancelling row exists, distinct history-depth/no-instruments blocked reasons without `disabled`, run-ID anchor `href`s, and the never-requested empty state.
- [ ] T004 Create `web/src/screens/runs/run-controls.test.tsx` with `// Implements TC-COMP-289` and `// Implements TC-COMP-290`: assert running versus requested cancellation confirmation text, cooperative `cancelling` feedback and unavailable follow-up action, queued immediate cancellation, start's queued-behind notice, and the already-completed message/outcome after the API's `409 run_already_terminal` response.

### Additional Unit Tests

- [ ] T005 Add focused mapping and transport tests in `web/src/api/client.test.ts` and `web/src/api/types.test.ts` for request/list/cancel paths, confirmed `runs`/`next_cursor`/`queued_behind` and cancellation response shapes, transport versus API errors, and preservation of the terminal state carried by a `409` (supports AC-23, AC-24, and DAC-E5-S6-6).
- [ ] T006 Update `web/src/app/routes.test.tsx` to assert `/runs` renders the Runs screen and a rendered run-ID `Link` targets `/runs/:runId`, retaining the child detail route rather than converting navigation into row clicks (supports DAC-E5-S6-4).

**Checkpoint**: Tests are RED until the client, screen, controls, and route wiring exist; mandatory tests carry their TC comments and use fake timers rather than real waiting.

---

## Phase 3: Core Implementation

**Purpose**: Implement the visual state mapping and the Runs list/control behaviors specified by the owner-web and UX designs.

- [ ] T007 Create `web/src/screens/runs/outcome-badge.tsx` with the authoritative `requested → neutral`, `running → active`, `cancelling/partial → warning`, `succeeded → good`, `failed → critical`, `cancelled → neutral`, and `abandoned → serious` mapping; render text plus an icon/shape for every state and include the prescribed abandoned explanation and new-run recovery path (implements AC-9, DAC-E5-16, and DAC-E5-17).
- [ ] T008 Create `web/src/screens/runs/run-controls.tsx` and `web/src/screens/runs/cancel-dialog.tsx`: render Start as `default` or focusable `blocked` with `aria-describedby` for the two distinct preconditions, call the start endpoint and show `queued_behind`, and render `dialog` `confirm` cancellation flows whose queued and running copy reflects their different effects; map a terminal `409` to *This run had already completed.* plus the returned outcome (implements AC-23, AC-24, DAC-E5-S6-3, DAC-E5-S6-5, and DAC-E5-S6-6).
- [ ] T009 Create `web/src/screens/runs/index.tsx`: compose the `data-table` `history`-style list, outcome badges, start controls, never-requested/no-match/error states, last-updated display, and `<Link>` run IDs; fetch on mount and schedule the documented 10-second refresh only while a returned row is non-terminal, clearing the timer on terminal data and unmount (implements AC-9 and DAC-E5-S6-1, DAC-E5-S6-2, DAC-E5-S6-4, and DAC-E5-S6-7; depends on T001 and T007–T008).

**Checkpoint**: The Runs screen makes no requests after it observes an entirely terminal list, every state is legible without colour, and each navigation target is a real anchor.

---

## Phase 4: Integration

**Purpose**: Verify the completed screen uses the shared API and router seams as an owner would.

- [ ] T010 Update `web/src/screens/runs/runs-screen.test.tsx` and `web/src/screens/runs/run-controls.test.tsx` to exercise the completed typed client through mocked fetch responses, including the `202 requested` queue result and terminal `409` error envelope; assert a refresh transition from active to terminal clears subsequent ten-second fetches (depends on T001 and T009).
- [ ] T011 Create `tests/e2e/runs-start-cancel.spec.ts` using the established Playwright setup and CAP-001-E5-S5-backed API fixture: cover starting while another run is active, navigating through an ID anchor, cancellation confirmation for queued versus running rows, and the already-terminal branch without claiming cancellation occurred (implements the story's start-then-cancel E2E requirement; depends on CAP-001-E5-S5 and T008–T009).

**Checkpoint**: Browser-level coverage verifies the control flow across the route and HTTP boundary, while component tests prove timing and inaccessible-action regressions.

---

## Phase 5: Polish

**Purpose**: Harden regressions and run the frontend checks required by the approved stack.

- [ ] T012 Strengthen `web/src/screens/runs/runs-screen.test.tsx`, `web/src/screens/runs/run-controls.test.tsx`, and `tests/e2e/runs-start-cancel.spec.ts` by manually mutating the poll condition/cadence, tier table, blocked `disabled` attribute, run-ID anchor, confirmation branch, and terminal-409 branch; retain tests that kill each mutation and record RED→GREEN→MUTATE→STRENGTHEN evidence (depends on T010–T011).

**Checkpoint**: The test suite fails if polling continues with terminal data, a non-success outcome is styled as success, a blocked reason becomes unreachable, a queued cancellation uses running copy, or a terminal race is represented as a cancellation.

## Dependencies & Execution Order

### Task Dependencies

- T001 and T002 establish distinct client and router seams and may begin immediately.
- T003–T006 can be authored before implementation; T003 and T004 edit different files, while T003 and T010 must be serialized.
- T007 and T008 depend on T001's types/client; T009 depends on T001, T007, and T008; T010 depends on T001 and T009.
- T011 depends on the completed API fixture from CAP-001-E5-S5 and UI controls from T008–T009. T012 follows full integration coverage.

### Parallel Opportunities

- T001 and T002 can run in parallel.
- T003–T006 can run in parallel because they target different files.
- T007 and T008 can run in parallel after T001; T009 then integrates them.

### Phase Dependencies

- Phase 2 precedes Phase 3 under TDD.
- Phase 3 must complete before the completed-client integration assertions in Phase 4.
- Phase 5 follows the component and E2E paths.

## Validation Plan

### Constitution-Defined Commands

- Install: `npm ci`
- Build: `npm run build`
- Component tests: `npm run test -- web/src/screens/runs web/src/api/client.test.ts web/src/api/types.test.ts web/src/app/routes.test.tsx`
- Full frontend tests: `npm run test`
- End-to-end: `npm run test:e2e`
- Lint: `npm run lint`
- Format: `npm run format`
- Type check: `npx tsc --noEmit`

### Story-Specific Validation

- With fake timers, return a list containing a non-terminal run, advance exactly ten seconds to verify one refresh, then return only terminal rows and verify no later interval fetch occurs.
- Render each of the eight run states and assert both its exact tier variant and human-readable text; assert `partial` is warning, `cancelled` is neutral, and `abandoned` carries its recovery copy.
- Render each blocked Start precondition, confirm the control is focusable and describes the distinct reason, then return a queued `202` to verify the action remains available and displays the active run notice.
- Exercise queued and running cancellation confirmation copy, then a terminal `409` carrying the actual outcome to verify the screen says the run completed rather than falsely announcing cancellation.
- Run the Playwright scenario against the E5-S5 API fixture; if Playwright browsers or its PostgreSQL-backed fixture are unavailable, report that E2E scope as excluded rather than green.

## Notes

### Resolved Conflicts

- The owner-web design's normative state table and UX design's run outcome table govern the state-to-tier mapping. The story's shorthand description of six status variants does not reduce the eight run states; `requested` and `cancelled` are neutral, and `abandoned` remains serious.
- The approved API design and the owner-confirmed E5-S5 plan govern the response field names `runs`, `next_cursor`, `run`, `counts`, `results`, and `queued_behind`; the web client maps those wire names once rather than restating a competing local contract.

### Open Gaps

- The UX design's indeterminate progress indicator remains a non-blocking component-spec gap. Render the specified textual completed-versus-named count and last-updated time without an indicator; no quantitative estimate or substitute control is introduced. The design-system intake owns the next revision.

### Other Notes

- CAP-001-E5-S5 is a hard integration prerequisite: this plan consumes its list, start, and cancellation routes but does not recreate their server-side precondition or state-transition policy.
- The project has no `web/src/components/` directory or vendored shadcn source yet. Keep this story's additions within `web/src/screens/runs/` and existing Tailwind/semantic-control patterns; do not create a local design-system abstraction beyond the screen's needs.
- The existing `web/src/screens/instruments/start-action.tsx` proves the `blocked`-not-`disabled` accessibility pattern. The Runs action must preserve that behavior while adding the distinct no-instruments condition.
