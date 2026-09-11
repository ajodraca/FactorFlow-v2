---
artifact_schema_version: 1
artifact_id: CAP-001-E2-S4-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-10
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-06T22:00:34Z
  source_artifacts:
    - id: CAP-001-E2-S4
      version: "1"
    - id: CAP-001-component-design-owner-web-app
      version: "approved"
    - id: CAP-001-ux-design
      version: "approved"
    - id: CAP-001-E1-S4
      version: "1"
    - id: CAP-001-E2-S3
      version: "1"
    - id: tech-stack
      version: "3"
  invoking_user: ajodraca
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Tasks: CAP-001-E2-S4 — Instruments and Settings Screens

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/instrument-list-and-history-depth/stories/CAP-001-E2-S4.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-epics`
**Date**: 2026-09-06

## Summary

This story delivers `web/src/screens/instruments/` and `web/src/screens/settings/`, rendering inside the shell CAP-001-E1-S4 provides and consuming the endpoints CAP-001-E2-S3 exposes. The Instruments screen is one table with a lifecycle column (not two tables), a single-symbol inline add field, and a `textarea` `list` region for bulk entry at AC-4's volume — every symbol in a batch is classified independently, and rejected entries never discard accepted ones. Retirement is confirmed through `dialog` `confirm`, never `destructive`, with copy that states a run already under way still finishes with the instrument included. The Settings screen states history depth as a positive integer number of years and shows provider credential presence as a read-only status, never a value. Both screens use the `ScreenState<T>` discriminated union from `web/src/api/types.ts` (CAP-001-E1-S4/component design section 2.4) to distinguish loading, both empty states, error, and unreachable.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-1 | Instruments screen shows the current list; no config file involved | T009, T010, T017, T018 |
| AC-2 | Settings screen records and shows a stated history depth | T012, T020 |
| AC-25 / DAC-E2-11 | Retire confirmation states an in-flight run still finishes with the instrument included | T008, T016 |
| DAC-E2-3 | Bulk entry accepts newline/comma/tab/semicolon separators; recognised/rejected reported before anything is added | T006, T014 |
| DAC-E2-9 | Start action renders `blocked` with its reason when depth is unset | T007, T015 |
| DAC-E2-10 | Search and filter remain usable at 3000 instruments | T009, T017 |
| DAC-E2-S4-1 | Bulk-paste preview lists rejected entries with reasons; accepted ones remain available to add | T006, T014 |
| DAC-E2-S4-2 | Retire confirmation uses `dialog` `confirm`, never `destructive`; copy says retirement, not deletion | T008, T016 |
| DAC-E2-S4-3 | An unusable control uses `button` `blocked` with a visible reason, never bare `disabled` | T007, T015 |
| DAC-E2-S4-4 | Instrument table distinguishes active/retired; retired rows are not omitted | T009, T017 |
| DAC-E2-S4-5 | Depth input error names operation, resource, and reason per STD-UI-19 | T011, T019 |
| DAC-E2-S4-6 | Never-populated state is distinct from a filter matching nothing | T010, T018 |
| DAC-E2-S4-7 | Every status shown carries a text label plus icon/shape and reads in greyscale | T013, T021 |

## Phase 1: Setup

**Purpose**: Establish the screen directories, the typed API client calls this story needs, and the shared fetch-layer types the component design's section 2.4 defines. `web/src/api/types.ts`'s `ScreenState<T>` union and the shell/routing scaffolding already exist from CAP-001-E1-S4.

- [x] T001 Create `web/src/screens/instruments/` and `web/src/screens/settings/` directory scaffolding with an `index.tsx` placeholder in each, wired into `web/src/app/routes.tsx` (CAP-001-E1-S4) at the existing Instruments and Settings destinations
- [x] T002 [P] Extend `web/src/api/types.ts` with response types mirroring CAP-001-E2-S3's API contract: `SymbolOutcome` (`inputSymbol`, `normalisedSymbol`, `disposition`, `reason`), `AddInstrumentsResult` (`added`, `reactivated`, `rejected: SymbolOutcome[]`), `Instrument` (`instrumentId`, `symbol`, `lifecycle`, `addedAt`, `retiredAt`), `InstrumentListResult` (rows, `activeCount`, `retiredCount`, `nextCursor`), `HistoryDepth` (`years: number | null`, `updatedAt: string | null`)
- [x] T003 [P] Extend `web/src/api/client.ts` with typed fetch functions: `addInstruments(symbols: string[])`, `retireInstrument(symbol: string)`, `listInstruments(filters)`, `getHistoryDepth()`, `setHistoryDepth(years: number)` — each calling the corresponding CAP-001-E2-S3 endpoint and mapping a non-2xx response into the `ScreenState` `error`/`unreachable` variants per the shared error envelope shape (component design section 2.3's fetch-layer contract)
- [x] T004 [P] Confirm CAP-001-E1-S4's `web/src/app/shell.tsx`, `routes.tsx`, and `web/src/api/types.ts`'s `ScreenState<T>` union are present and importable on this branch; block if not yet landed, rather than duplicating them here
- [x] T005 [P] Confirm CAP-001-E2-S3's `GET/POST/DELETE /api/instruments` and `GET/PUT /api/settings/history-depth` endpoints are present and importable (via a running dev server or contract fixtures) on this branch; block if not yet landed

**Checkpoint**: `web/src/screens/instruments/` and `web/src/screens/settings/` exist as routable placeholders; `web/src/api/types.ts` and `client.ts` export the new types and functions; `npx tsc --noEmit` type-checks cleanly against the placeholders.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests for the seven mandatory component TC-IDs mapped from the coverage matrix, using Vitest and React Testing Library per the tech stack and this story's own Testing section.

### Mandatory Component Tests

- [x] T006 [P] Implement TC-COMP-101, TC-COMP-128 (bulk entry accepts newline/comma/tab/semicolon separators; a rejected entry never discards accepted ones; the preview lists rejections with reasons) in `web/src/screens/instruments/bulk-add.test.tsx` — paste a string mixing all four separators with at least one malformed symbol, assert the preview reports each recognised symbol and the malformed one with a reason, and that submitting adds only the recognised ones
- [x] T007 [P] Implement TC-COMP-107, TC-COMP-130 (Start action renders `blocked` with its reason when depth is unset; a control that cannot be used renders `button` `blocked`, never bare `disabled`) in `web/src/screens/instruments/start-action.test.tsx` — with `HistoryDepth.years` `null`, render the Start action (wherever it's exposed on this screen per the component mapping) and assert it uses the `blocked` variant with a reason exposed via `aria-describedby`, not the HTML `disabled` attribute alone
- [x] T008 [P] Implement TC-COMP-109, TC-COMP-129 (retire confirmation uses `dialog` `confirm`, never `destructive`; states an in-flight run still finishes with the instrument included) in `web/src/screens/instruments/retire-dialog.test.tsx` — open the retire dialog for an active instrument, assert it renders via the `confirm` variant (not `destructive`), that its copy contains "Stop acquiring" rather than "Delete" or "Remove", and — when a run is active — that the additional in-flight-run sentence from `ux-design.md` section 1.2 is present
- [x] T009 [P] Implement TC-COMP-131 (instrument table distinguishes active/retired; retired rows are not omitted) in `web/src/screens/instruments/instrument-table.test.tsx` — render the table with a mix of active and retired instruments, assert both appear in one table (not two), and that retired rows carry the `secondary` lifecycle badge and `--muted-foreground` styling per `ux-design.md` section 1.2's Token Usage
- [x] T010 [P] Implement TC-COMP-133 (never-populated state distinct from a filter matching nothing) in `web/src/screens/instruments/empty-states.test.tsx` — render the screen with zero total instruments and assert the copy *No instruments named yet.* with the add field focused; separately render with instruments present but a filter matching none and assert the distinct copy *No instrument matches this filter.* with a reset control
- [x] T011 [P] Implement TC-COMP-132 (depth input error names operation, resource, reason per STD-UI-19) in `web/src/screens/settings/history-depth-form.test.tsx` — submit a non-positive or non-integer value, assert the rendered error text names the operation (setting history depth), the resource (history depth), and the specific reason (e.g., "must be a positive whole number"), not a generic "Invalid value"
- [x] T012 [P] Implement the Settings screen's AC-2 read/write round trip (depth is recorded and shown) in `web/src/screens/settings/history-depth-form.test.tsx` — submit a valid integer, assert the field reflects the saved value and the "Required before the first acquisition run" description clears

### Additional Unit Tests

- [x] T013 [P] Implement TC-COMP-134 (every status shown carries a text label plus icon/shape and reads in greyscale) in `web/src/screens/instruments/badges.test.tsx` and `web/src/screens/settings/credential-badge.test.tsx` — assert the lifecycle badge, the provider-recognition badge, and the credential-status badge each render a text label alongside their shape/icon, not colour alone (this is the same STD-UI-30-adjacent constraint the component design section 2.5 calls load-bearing)
- [x] T014 [P] Write a unit test asserting the bulk-add parser (extracted as a pure function, not only tested through the rendered `textarea`) correctly splits on newline, comma, tab, and semicolon in combination, in `web/src/screens/instruments/parse-bulk-symbols.test.ts`
- [x] T015 [P] Write a unit test asserting the Settings screen's history-depth field validates on blur, not per keystroke, per `ux-design.md` section 1.3's Interaction Flows, in `web/src/screens/settings/history-depth-form.test.tsx`
- [x] T016 [P] Write a unit test asserting the credential status region on Settings never renders a credential value, a masked value, or a last-four — only the two presence states (`status-good`/`status-critical`) or `coverage-unknown` when health is unreachable, in `web/src/screens/settings/credential-status.test.tsx`
- [x] T017 [P] Write a unit test asserting the Instruments screen's add field rejects a duplicate-of-active symbol as a field error and offers reactivation for a duplicate-of-retired symbol, distinguishing the two per `ux-design.md` section 1.2's Interaction Flows, in `web/src/screens/instruments/add-field.test.tsx`
- [x] T018 [P] Write a unit test asserting filtering and lifecycle selection on the instrument table issue a server-side request (via the typed client from T003) rather than filtering only the currently loaded page, per component design section 2.6, in `web/src/screens/instruments/instrument-table.test.tsx`

**Checkpoint**: All tests above written and failing — the real `web/src/screens/instruments/` and `web/src/screens/settings/` implementations do not yet exist beyond Phase 1's placeholders.

---

## Phase 3: Core Implementation

**Purpose**: Implement both screens per the UX design's sections 1.2 and 1.3 and the component design's section 2.5 mapping.

- [x] T019 Create `web/src/screens/instruments/instrument-table.tsx` implementing the `data-table` `expandable` instrument table with a toolbar (symbol filter, lifecycle filter via `select` `inline`, the *`n` active, `m` retired* count), server-side filtering per T018, keyset pagination consuming `listInstruments` (T003), and the lifecycle column distinguishing active/retired per `ux-design.md` section 1.2's Token Usage
- [x] T020 Create `web/src/screens/instruments/add-field.tsx` implementing the single-symbol inline `form` + `input` `text` add, submitting on `Enter`, calling `addInstruments` (T003) with a one-element array, and rendering the duplicate-active field error versus the duplicate-retired reactivation offer per section 1.2's Interaction Flows
- [x] T021 Create `web/src/screens/instruments/bulk-add.tsx` implementing the `textarea` `list` Add-many region: a pure parsing function (T014) splitting on newline/comma/tab/semicolon, a preview reporting recognised and rejected symbols with reasons before submission, and a submit path calling `addInstruments` with only the recognised symbols
- [x] T022 Create `web/src/screens/instruments/retire-dialog.tsx` implementing the `dialog` `confirm` retire confirmation: initial focus on cancel per the `dialog` contract, copy *Stop acquiring `SYMBOL`? Its recorded history is kept and stays visible on the Coverage screen. You can add it again later.*, the confirm action labelled **Stop acquiring**, and — conditionally, when a run is active — the additional sentence *A run is in progress and will still acquire `SYMBOL` this time. Retirement takes effect from the next run.* On confirm, calls `retireInstrument` (T003)
- [x] T023 Create `web/src/screens/instruments/index.tsx` composing T019–T022 into the full Instruments screen, implementing the `ScreenState<T>` variants from the component design section 2.4: `loading` (skeleton), `empty-never-populated` (*No instruments named yet.* with the add field focused), `empty-no-match` (*No instrument matches this filter.* with a reset), `populated`, `error` (body replaced, retry offered, add field value preserved), and `unreachable` (shell state)
- [x] T024 Create `web/src/screens/settings/history-depth-form.tsx` implementing the `form` `stacked` + `input` `numeric` history-depth field with the *years* suffix as part of its accessible name, blur-triggered validation (T015), the "Required before the first acquisition run" description while unset, and the STD-UI-19-shaped error (operation, resource, reason) for an invalid value, calling `getHistoryDepth`/`setHistoryDepth` (T003)
- [x] T025 Create `web/src/screens/settings/credential-status.tsx` implementing the read-only `card` `summary` credential region: *Provider credential supplied* or *Provider credential missing* (naming the environment variable when missing, never a value), `status-good`/`status-critical` badge, and `coverage-unknown` when `GET /api/health` is unreachable, per section 1.3's Interaction Flows and section 4's security constraint that no credential value is ever rendered
- [x] T026 Create `web/src/screens/settings/index.tsx` composing T024 and T025 into the full Settings screen, in the single narrow column capped at `--measure-prose` with `--space-5` between the two regions, per section 1.3's Page Layout
- [x] T027 Implement the `button` `blocked` Start-action rendering (T007) wherever this story's screens expose it — per the component design's load-bearing note (section 2.5), it must stay focusable and expose its reason via `aria-describedby`, never a bare HTML `disabled` attribute

**Checkpoint**: Both screens are fully implemented; T006–T018 all pass.

---

## Phase 4: Integration

**Purpose**: Confirm both screens work end to end against CAP-001-E2-S3's real endpoints and the CAP-001-E1-S4 shell, including the Playwright add-then-retire path this story's own Testing section names.

- [x] T028 Run the full Phase 2 Vitest suite against the finished implementation, and fix any mismatch between rendered structure and the UX design's exact copy, component variants, or token usage
- [x] T029 Implement the Playwright end-to-end spec named in this story's Testing section, in `tests/e2e/instruments-add-retire.spec.ts`: add a symbol via the single-field form, verify it appears in the table as active, retire it via the confirm dialog, and verify it remains visible in the table marked retired (never removed)
- [x] T030 Verify both screens render correctly inside the CAP-001-E1-S4 shell at their routed destinations, and that navigating between Instruments and Settings preserves the shell's active-rail-item state

**Checkpoint**: `npm run test` and `npm run test:e2e` pass in full. All seven mandatory TC-IDs (TC-COMP-101, 107, 109, 128–134) are green.

---

## Phase 5: Polish

**Purpose**: Confirm accessibility and token discipline hold, and the complete validation suite is green.

- [x] T031 Review both screens for the three load-bearing usages the component design calls out (section 2.5): `button` `blocked` never `disabled`, `dialog` `confirm` never `destructive`, and — not applicable to this story's screens directly, but verify no stray row-click navigation pattern was introduced by copying the Runs screen's convention prematurely
- [x] T032 Review the add field's and retire action's accessible names per `ux-design.md` section 1.2's Accessibility subsection: the add field's name states what is being added (not a bare "Symbol"), and each row's retire action's accessible name identifies its row (*Stop acquiring AAPL*), not a bare "Stop acquiring" repeated per row
- [x] T033 Review both screens for any spacing or type value outside `theme.css`'s defined token scale, consistent with CAP-001-E1-S4's own token-discipline review (STD-UI-29)
- [x] T034 Run the complete validation plan (below) and confirm every command passes

**Checkpoint**: All acceptance criteria this story owns are satisfied; `npm run test`, `npm run test:e2e`, `npm run lint`, and `npx tsc --noEmit` all pass.

---

## Dependencies & Execution Order

### Task Dependencies
- T001 depends on CAP-001-E1-S4's `routes.tsx` existing.
- T002, T003 depend on T001 and on CAP-001-E2-S3's endpoint shapes.
- T004, T005 are blocking checks, not implementation tasks.
- T006–T018 (Phase 2) depend on T001–T005; independent of each other, can run in parallel.
- T019–T022 depend on T002, T003 (typed client and types) and T004 (shell/`ScreenState`).
- T023 depends on T019–T022 (composes them).
- T024, T025 depend on T002, T003.
- T026 depends on T024, T025 (composes them).
- T027 depends on T019 or wherever the Start action is actually exposed on this screen — confirm placement against the component design's section 2.5 mapping before implementing, since the mapping lists it primarily under Coverage (1.1), not Instruments or Settings; see Notes.
- T028 depends on T023, T026 (full implementation) to make Phase 2's tests pass.
- T029 depends on T028.
- T030 depends on T023, T026, and CAP-001-E1-S4's shell.
- T031–T034 depend on T028.

### Parallel Opportunities
- Phase 1: T002, T003 in parallel after T001; T004, T005 in parallel with everything else.
- Phase 2: T006 through T018 all in parallel (distinct test files).
- Phase 3: T019–T022 (Instruments) and T024–T025 (Settings) can proceed in parallel, converging at T023/T026.

---

## Validation Plan

### Constitution-Defined Commands
- Install: `npm ci`
- Test: `npm run test`
- Test (e2e): `npm run test:e2e`
- Lint: `npm run lint`
- Format check: `npm run format`
- Type check: `npx tsc --noEmit`

### Story-Specific Validation
- AC-1 / DAC-E2-10 / DAC-E2-S4-4: the instrument table renders active and retired instruments together, distinguishable by the lifecycle badge, with server-side filtering usable at volume.
- AC-2: a stated history depth is recorded via `PUT` and reflected back via `GET` on the Settings screen.
- AC-25 / DAC-E2-11 / DAC-E2-S4-2: the retire dialog uses `confirm` (never `destructive`) and, when a run is active, states that it still finishes with the instrument included.
- DAC-E2-3 / DAC-E2-S4-1: bulk entry accepts all four separators and reports recognised/rejected before anything is added, never discarding accepted entries.
- DAC-E2-9 / DAC-E2-S4-3: an unusable Start action renders `blocked` with a visible, `aria-describedby`-linked reason, never bare `disabled`.
- DAC-E2-S4-5: an invalid depth value's error names the operation, resource, and reason.
- DAC-E2-S4-6: the never-populated empty state and the no-match empty state render distinct copy.
- DAC-E2-S4-7: every status badge carries a text label alongside its shape/icon and remains legible in greyscale.

---

## Notes

- **The Start action's actual home is ambiguous across this story and the component design.** `component-design-owner-web-app.md` section 2.5 maps "Start acquisition run" (`button`, `default`/`blocked`) to screen **1.1 Coverage**, not to Instruments (1.2) or Settings (1.3). This story's own DAC-E2-9 and DAC-E2-S4-3, however, are listed as this story's acceptance criteria and speak generically of "the Start action" without saying it lives on this story's screens. Two readings are possible: (a) this story only needs to ensure Settings' "Required before the first acquisition run" description is correct and the Start action itself is CAP-001-E6 or another Coverage-owning story's concern, or (b) this story must implement a Start-action-adjacent affordance somewhere in Instruments/Settings. This plan takes the narrower reading — T007/T027 implement the `blocked`-not-`disabled` pattern wherever a control in *this story's own screens* would otherwise need disabling (there is no explicit Start button in Instruments or Settings' component mapping) — and flags this for confirmation before implementation. If Coverage's Start action already exists by the time this story is coded, no code in this story should re-implement it; if it does not exist yet, DAC-E2-9/DAC-E2-S4-3 may be more honestly satisfied by whichever story delivers screen 1.1.
- **The typed API client (`web/src/api/client.ts`) and error-shape handling assume CAP-001-E2-S3's response shapes exactly as documented.** If CAP-001-E7-S2's error envelope (flagged as an open ownership question in `CAP-001-E2-S3-tasks.md`) has not landed by the time this story is implemented, the `ScreenState` `error` variant's `message`/`requestId` fields should degrade gracefully (e.g., a generic message) rather than assume the envelope's exact shape is present.
- **No component test spec entry for TC-COMP-101, 107, 109, 128–134 provides scenario-level detail beyond a restated Given/When/Then**; the concrete test scenarios in Phase 2 are derived from this story's own Testing section and the UX design's Interaction Flows, States, and Accessibility subsections for 1.2 and 1.3, which are considerably more specific.
- **Accessibility enforcement here is partly human review, not fully automated.** Per `component-design-owner-web-app.md` section 4 and `ui-conventions.md`, Biome has no `jsx-a11y` equivalent, so some of this story's accessibility assertions (T032 in particular) are written as Testing-Library assertions where practical but should also be confirmed by manual review, consistent with how CAP-001-E1-S4's task plan treated its own token-discipline and accessibility checks.
