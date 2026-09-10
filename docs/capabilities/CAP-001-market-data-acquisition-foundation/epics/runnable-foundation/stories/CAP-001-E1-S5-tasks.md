---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S5-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-06
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-06T00:00:00Z
  source_artifacts:
    - id: CAP-001-E1-S5
      version: "1"
    - id: CAP-001-component-design-owner-web-app
      version: "approved"
    - id: CAP-001-ux-design
      version: "approved"
    - id: tech-stack
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E1-S5 — Status Region and Unreachable State

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S5.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-epics`
**Date**: 2026-09-06

## Summary

This story delivers `web/src/app/status-region.tsx`, replacing the no-op placeholder CAP-001-E1-S4 defines a slot for, and the shell's unreachable-state rendering: when `GET /api/health` cannot be reached at all, the main region is replaced on every route with a designed state naming the likely cause (the application container may have stopped, or a migration may have failed) rather than a raw transport error, while the navigation rail stays rendered so the owner is never stranded. The region itself reports two facts polled every 30 seconds — whether the product is answering, and the most recent run's outcome — with the run-outcome line stating "no run recorded" until CAP-001-E7-S3 populates it, never presenting an empty successful state.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-16 | A store that could not be brought forward surfaces a named unreachable state, not silence | T006, T012 |
| AC-18 | Any screen lets the owner tell whether the product is answering, without inspecting the store | T005, T011 |
| DAC-E1-13 | Status region appears on every screen, polls health every 30s, shows last-updated time | T005, T011 |
| DAC-E1-14 | Region is sized to take a third line later without restructuring | T008, T014 |
| DAC-E1-15 | A failure to reach the API renders a named unreachable state, not a raw transport error | T006, T012 |
| DAC-E1-17 | Region renders correctly before any run has ever existed | T009, T015 |
| DAC-E1-S5-1 | Successful health response shows answering with text label plus icon/shape, readable in greyscale | T007, T013 |
| DAC-E1-S5-2 | Last-updated time uses ISO-8601 and the America/Chicago timezone | T008, T014 |
| DAC-E1-S5-3 | Unreachable state names the likely cause and where to look (container logs) | T006, T012 |
| DAC-E1-S5-4 | Run-outcome line before CAP-001-E7-S3: "no run recorded", not an empty successful state | T009, T015 |
| DAC-E1-S5-5 | Unmounting clears the polling interval; no request continues after navigation | T010, T016 |
| DAC-E1-S5-6 | `credential_present: false` renders distinctly from an unanswered health check | T017, T018 |

## Phase 1: Setup

**Purpose**: Confirm the shell's status-region slot and health-response types this story depends on are present, and add the one new dependency (fake-timer testing) this story's polling tests need.

- [x] T001 Confirm CAP-001-E1-S4's `web/src/app/shell.tsx` (status-region slot) and `web/src/app/status-region.tsx` placeholder are present on this branch; block on CAP-001-E1-S4 rather than duplicating the shell here if not yet landed
- [x] T002 [P] Create or extend `web/src/api/types.ts` with a `HealthResponse` TypeScript type mirroring CAP-001-E1-S6's exact JSON contract: `status: "ok"`, `database: "reachable" | "unreachable"`, `credential_present: boolean`, `schema_version: number | null`, `most_recent_run: RunSummary | null` — developed against the documented contract in this story's Technical Details section, since CAP-001-E1-S6 may not have landed yet (per this story's own "Dependencies" note: "Developable in parallel against the contract above")
- [x] T003 [P] Create `web/src/api/client.ts`'s `fetchHealth()` function (or extend the file if CAP-001-E1-S6's consuming story already started it) — a typed fetch wrapper for `GET /api/health` returning `HealthResponse`, throwing on a transport failure so the region can distinguish "the fetch itself failed" from "the fetch succeeded but reported unreachable" (DAC-E1-S5-3 vs. DAC-E1-S6-2's `database: "unreachable"` case, which are two different failure shapes this story's tests must not conflate)
- [x] T004 [P] Confirm Vitest's fake-timer support is available (it ships with Vitest; no new dependency), since T010/T016's unmount-clears-interval test requires `vi.useFakeTimers()`

**Checkpoint**: `HealthResponse` type and `fetchHealth()` exist; `npm run test` (from CAP-001-E1-S4's scaffolding) still passes with zero new failures; `npx tsc --noEmit` type-checks the new files.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests for the eleven mandatory component TC-IDs mapped from the coverage matrix, using Vitest and React Testing Library with `fetch` stubbed, per the story's own Testing section.

### Mandatory Component Tests

- [x] T005 [P] Implement TC-COMP-304, TC-COMP-018 / DAC-E1-13, AC-18 (status region appears on every screen, polls health every 30s, shows last-updated time) in `web/src/app/status-region.test.tsx` — stub `fetchHealth()` to resolve successfully, render the region, assert it displays an answering state and a last-updated timestamp, then advance fake timers by 30 seconds and assert a second fetch occurred
- [x] T006 [P] Implement TC-COMP-016, TC-COMP-306 / AC-16, DAC-E1-15 (a failure to reach the API renders a named unreachable state, not a raw transport error) in `web/src/app/status-region.test.tsx::test_unreachable_state` — stub `fetchHealth()` to reject (simulating a transport failure, not a successful response reporting `database: "unreachable"`), assert the shell's main region renders the exact designed copy from UX design section 2: *FactorFlow is not answering. The application container may have stopped, or a database migration may have failed and prevented it from starting. Check the container logs.*
- [x] T007 [P] Implement TC-COMP-335 / DAC-E1-S5-1 (successful health response shows answering with text label plus icon/shape, readable in greyscale) in `web/src/app/status-region.test.tsx` — assert the answering state renders both a text label and an icon or shape (not color alone), per STD-UI-24's contrast/non-color-only requirement
- [x] T008 [P] Implement TC-COMP-305, TC-COMP-336 / DAC-E1-14, DAC-E1-S5-2 (region sized to take a third line later; last-updated time in ISO-8601 and America/Chicago) in `web/src/app/status-region.test.tsx` — assert the last-updated timestamp renders in ISO-8601 form localized to America/Chicago (not UTC, not the browser's local zone), and inspect the region's layout/structure for a reserved third line slot per DAC-E1-14 (a structural assertion, similar in kind to CAP-001-E1-S4's token-scale check)
- [x] T009 [P] Implement TC-COMP-308, TC-COMP-338 / DAC-E1-17, DAC-E1-S5-4 (region renders correctly before any run has ever existed; run-outcome line states "no run recorded" rather than an empty successful state) in `web/src/app/status-region.test.tsx` — stub `fetchHealth()` to resolve with `most_recent_run: null`, assert the run-outcome line reads a "no run recorded" message distinct from any success or failure badge
- [x] T010 [P] Implement TC-COMP-339 / DAC-E1-S5-5 (unmounting clears the polling interval; no request continues after navigation) in `web/src/app/status-region.test.tsx` — using `vi.useFakeTimers()`, mount the region, unmount it, advance timers well past 30 seconds, and assert `fetchHealth()` was not called again after unmount

### Additional Unit Tests

- [x] T011 [P] Write a unit test asserting the status region is actually rendered inside the shell's slot on every route (not just in isolation), in `web/src/app/shell.status-region.test.tsx` — navigates between the four destinations and asserts the region persists unchanged, closing the gap between "the region works standalone" (T005–T010) and "the region is mounted where DAC-E1-13 requires"
- [x] T012 [P] Write a unit test asserting the navigation rail stays rendered while the unreachable state is shown (per UX design section 2: "The navigation rail stays rendered so the owner is not stranded"), in `web/src/app/shell.unreachable.test.tsx`
- [x] T013 [P] Write a unit test asserting the answering-state icon/shape and the unreachable-state rendering do not rely on color alone, using a greyscale-simulated snapshot or an explicit check for a non-color visual cue, in `web/src/app/status-region.a11y.test.tsx`

**Checkpoint**: All eleven mandatory TC-ID tests and the three additional unit tests are written and fail — `status-region.tsx`'s real implementation and the shell's unreachable-state wiring do not yet exist (only CAP-001-E1-S4's placeholder is present).

---

## Phase 3: Core Implementation

**Purpose**: Implement the status region's polling, rendering states, and the shell's unreachable-state substitution.

- [x] T014 Replace CAP-001-E1-S4's placeholder in `web/src/app/status-region.tsx` with the real component: on mount, calls `fetchHealth()` (T003) immediately and again every 30 seconds via `setInterval`, clearing the interval on unmount (DAC-E1-S5-5); renders an answering/unreachable state with text plus icon (DAC-E1-S5-1); renders the last-updated time in ISO-8601, America/Chicago (DAC-E1-S5-2); reserves a third line in its layout for the future trading-environment indicator without restructuring (DAC-E1-14)
- [x] T015 Implement the run-outcome line inside `status-region.tsx`: renders "no run recorded" when `most_recent_run` is `null` (DAC-E1-S5-4), and is structured so CAP-001-E7-S3 can later populate a real outcome without changing this story's null-handling branch
- [x] T016 Ensure the polling `setInterval` created in T014 is torn down in a `useEffect` cleanup function, and that a component re-render does not create a second interval (guards against the double-fetch bug T010's test would catch)
- [x] T017 Implement the credential-presence distinction in `status-region.tsx` (DAC-E1-S5-6): when a health response is successfully received with `credential_present: false`, render a state distinct from the unreachable state (T006) — the product answered, but the credential is missing, which is a configuration fact, not a liveness failure
- [x] T018 Modify `web/src/app/shell.tsx` (from CAP-001-E1-S4) to substitute the main region's content, on every route, with the unreachable state (T014's rendering, driven by a failed `fetchHealth()` call) when the API cannot be reached — the navigation rail and status region continue to render around it, per UX design section 2's "the navigation rail stays rendered so the owner is not stranded"

**Checkpoint**: `status-region.tsx` and the shell's unreachable-state wiring exist; T005–T013 all pass.

---

## Phase 4: Integration

**Purpose**: Confirm the status region, mounted inside the real shell, behaves correctly across all four destinations and both liveness outcomes.

- [x] T019 Run the full Phase 2 test suite against the finished implementation and fix any mismatch between the rendered copy and the UX design section 2's exact wording for the unreachable state
- [x] T020 Manually verify (or add an integration-level test if CAP-001-E1-S6 has landed by this point) that `status-region.tsx` correctly distinguishes three response shapes from `GET /api/health`: a successful response with the product answering, a successful response with `credential_present: false`, and a failed fetch (transport error) — these are the three states T006, T009, and T017 test in isolation

**Checkpoint**: `npm run test` passes in full. All eleven mandatory TC-IDs (TC-COMP-016, 018, 304–306, 308, 335–340) are green.

---

## Phase 5: Polish

**Purpose**: Confirm the greyscale-readability and timezone-correctness details hold under the complete validation suite.

- [x] T021 Review every visual state the status region renders (answering, unreachable, credential-missing, no-run-recorded) for a non-color cue alongside its color, per STD-UI-24's greyscale-readability requirement
- [x] T022 Run the complete validation plan (below) and confirm every command passes

**Checkpoint**: All acceptance criteria this story owns are satisfied; `npm run test`, `npm run lint`, and `npx tsc --noEmit` all pass.

---

## Dependencies & Execution Order

### Task Dependencies
- T001–T004 (Phase 1): T001 is a blocking check on CAP-001-E1-S4, not an implementation task; T002, T003, T004 can proceed in parallel once T001 confirms the shell exists.
- T005–T013 (Phase 2): all depend on Phase 1's types and fetch wrapper (T002, T003); independent of each other, can run in parallel.
- T014 depends on T001 (the placeholder it replaces) and T003 (`fetchHealth()`).
- T015, T016, T017 depend on T014 (extend the same file).
- T018 depends on T014 (the rendering it substitutes into the shell) and CAP-001-E1-S4's `shell.tsx`.
- T019 depends on T014–T018 (full implementation) to make Phase 2's tests pass.
- T020, T021, T022 depend on T019.

### Parallel Opportunities
- Phase 1: T002, T003, T004 in parallel after T001.
- Phase 2: T005 through T013 all in parallel (distinct test files or distinct test functions within a shared file).
- Phase 3: T014 (region implementation) and T018 (shell wiring) can be drafted in parallel and converge at T019.

---

## Validation Plan

### Constitution-Defined Commands
- Test: `npm run test`
- Lint: `npm run lint`
- Type check: `npx tsc --noEmit`

### Story-Specific Validation
- A successful health response renders the answering state with text plus icon, and the last-updated time in ISO-8601, America/Chicago (AC-18, DAC-E1-13, DAC-E1-S5-1, DAC-E1-S5-2).
- A rejected fetch (transport failure) renders the exact named unreachable state from UX design section 2, with the navigation rail still rendered around it (AC-16, DAC-E1-15, DAC-E1-S5-3).
- `most_recent_run: null` renders "no run recorded", never an empty successful state (DAC-E1-17, DAC-E1-S5-4).
- `credential_present: false` renders distinctly from the unreachable state (DAC-E1-S5-6).
- Unmounting the region clears its polling interval; advancing fake timers past 30 seconds after unmount produces no further fetch call (DAC-E1-S5-5).
- The region is sized to take a third line later without restructuring (DAC-E1-14).

### Postgres-Marked Test Note
Not applicable. This story's entire test suite runs in Vitest with `fetch` stubbed — no backend or container dependency exists anywhere in this component's tests.

---

## Notes

- **This story depends on CAP-001-E1-S4's shell landing first**, since it replaces the placeholder `status-region.tsx` that story defines and modifies `shell.tsx` to add the unreachable-state substitution. T001 should block rather than recreate the shell if CAP-001-E1-S4 has not yet been coded on this branch.
- **This story is developable in parallel with CAP-001-E1-S6**, per its own "Dependencies" note. T002/T003 build `HealthResponse` and `fetchHealth()` against the documented JSON contract in this story's Technical Details section rather than importing anything from a real backend; when CAP-001-E1-S6 lands, its actual response shape should match this contract exactly, and any drift is that story's responsibility to avoid, not this one's to guess around further.
- **Two distinct "unreachable" concepts must not be conflated.** `GET /api/health` returning successfully with `database: "unreachable"` (CAP-001-E1-S6's DAC-E1-S6-2, meaning the API is up but the database is not) is a different case from this story's DAC-E1-15 (the fetch itself fails — the API is not answering at all). This story's tests (T006) exercise only the latter; the former is a health-response field this region may also want to surface, but the story's own acceptance criteria only name the transport-failure case as producing the shell-wide unreachable state. Flagged here so the two are not accidentally merged into one code path.
- **The run-outcome line's real content is CAP-001-E7-S3's to define**, same boundary CAP-001-E1-S6 already established for `most_recent_run`. This story only implements the `null` branch (T015); the populated-outcome rendering is out of scope here.
- **The timezone requirement (America/Chicago, not UTC or browser-local) comes from `ui-conventions.md`'s resolution of OQ-UI-3**, which distinguishes as-of dates (unconverted) from timestamps (zone-carrying) — the status region's last-updated time is a timestamp, so it renders zone-converted per that resolution, not as a raw ISO string in whatever zone the browser happens to be in.
