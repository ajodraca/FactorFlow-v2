---
artifact_schema_version: 1
artifact_id: CAP-001-E1-S4-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-09-06
updated: 2026-09-08
last_reworked_review: CAP-001-E1-S4-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5
  tool: Claude Code
  tool_version: "2.1.92"
  timestamp: 2026-09-06T00:00:00Z
  source_artifacts:
    - id: CAP-001-E1-S4
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

# Tasks: CAP-001-E1-S4 — Application Shell: Navigation Rail and Routing

**Story**: `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/runnable-foundation/stories/CAP-001-E1-S4.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-001-epics`
**Date**: 2026-09-06

## Summary

This story delivers the frontend project's first code: `package.json`, `vite.config.ts`, `web/index.html`, `web/src/main.tsx`, `web/src/app/shell.tsx`, and `web/src/app/routes.tsx`. It is the frame every later screen (E2, E5, E6, E7) renders inside — a fixed left navigation rail with four destinations in a fixed order (Coverage, Instruments, Runs, Settings), a main region, and a status-region slot that CAP-001-E1-S5 fills. Nothing in the shell assumes a principal: no sign-in, no user menu, no account area, because AC-14 binds the interface to loopback with no authentication. The shell is a composition per the UX design, not a design-system component, and introduces no spacing or type value outside the defined token scale.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-14 | Shell contains no sign-in, user menu, or account area | T009, T015 |
| DAC-E1-12 | Rail presents four destinations in order, run detail as a child route | T009, T010, T015, T016 |
| DAC-E1-S4-1 | Destination labels use the exact product vocabulary (STD-UI-1) | T010, T016 |
| DAC-E1-S4-2 | Run detail route renders as a child of Runs; Runs stays the active rail item | T011, T017 |
| DAC-E1-S4-3 | Every spacing/type value in the shell comes from the defined token scale | T012, T018 |
| DAC-E1-S4-4 | Keyboard traversal reaches every destination; the active one is announced (WCAG 2.1 AA) | T013, T019 |
| DAC-E1-S4-5 | An unknown route renders a not-found state inside the frame | T014, T020 |
| DAC-E1-S4-6 | `npm run build` output lands in the API package's static directory | T001, T021 |

## Phase 1: Setup

**Purpose**: Bootstrap the frontend project — no `package.json`, Vite config, or `web/` directory exists anywhere in the repository yet. This is the first frontend code in the capability.

- [x] T001 Create `package.json` at the repo root defining the npm scripts the tech stack's validation table names (`build`, `test`, `test:e2e`, `lint`, `format`) and dependencies `react`, `react-dom`, `react-router-dom` (routing library implied by the story's "routes.tsx" and "child route" language but not named explicitly by either the component design or the story; `react-router-dom` v6 is the conventional choice for this shape in the React 18 ecosystem the tech stack specifies — flagged in Notes as a gap-fill), dev dependencies `vite`, `typescript`, `tailwindcss`, `vitest`, `@testing-library/react`, `@playwright/test`, `biome`
- [x] T002 [P] Create `vite.config.ts` at the repo root with `root: "web"` and `build.outDir` pointing into `src/factorflow/api/static` (relative path from `web/`), per component design section 2.1 — this is what makes `npm run build`'s output land where CAP-001-E1-S6's static-file mount expects it
- [x] T003 [P] Create `web/index.html` as the Vite entry HTML, loading `web/src/main.tsx`
- [x] T004 [P] Create `web/src/main.tsx` mounting the React root and rendering the shell from `web/src/app/shell.tsx`
- [x] T005 [P] Create `tsconfig.json` at the repo root (or `web/tsconfig.json` per Vite convention) targeting the tech stack's TypeScript 5.x, with `web/src` as the source root
- [x] T006 [P] Create `tailwind.config.js` referencing `design-system/theme.css`'s custom properties (the token scale this shell and every later screen must consume, per STD-UI-29) rather than introducing a separate Tailwind theme
- [x] T007 [P] Create `vitest.config.ts` (or extend `vite.config.ts`) configuring Vitest with React Testing Library's jsdom environment
- [x] T008 [P] Create `web/src/app/__init__`-equivalent scaffolding: an empty `web/src/app/status-region.tsx` placeholder module exporting a no-op component, so `shell.tsx` can import and render the slot CAP-001-E1-S5 will fill without this story building it

**Checkpoint**: `npm ci` resolves; `npm run build` succeeds and produces output under `src/factorflow/api/static/`; `npm run lint` and `npx tsc --noEmit` run cleanly against the empty scaffolding; `npm run test` collects zero tests and exits 0.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests for the eight mandatory component TC-IDs mapped from the coverage matrix, using Vitest and React Testing Library per the tech stack and the story's own Testing section.

### Mandatory Component Tests

- [x] T009 [P] Implement TC-COMP-014 (partial — shell has no auth-implying element), TC-COMP-303, and AC-14's shell-level assertion (no sign-in, user menu, or account area) in `web/src/app/shell.test.tsx` — render the shell, assert no element matches sign-in, account, or user-menu semantics (by role, accessible name, or test id), per the story's own Testing section
- [x] T010 [P] Implement TC-COMP-303 (rail presents four destinations in order), TC-COMP-329 (labels use the exact product vocabulary) in `web/src/app/shell.test.tsx` — assert the rail renders exactly four navigation items, in the order Coverage, Instruments, Runs, Settings, with those exact labels and no others (not "Jobs", not "Sync", not "Import")
- [x] T011 [P] Implement TC-COMP-330 (run detail route renders as a child of Runs; Runs stays active) in `web/src/app/routes.test.tsx` — navigate to a run detail path, assert the Runs rail item still carries the active/current indicator and no fifth rail item appears
- [x] T012 [P] Implement TC-COMP-331 (every spacing/type value in the shell comes from the defined scale) in `web/src/app/shell.test.tsx` (or a dedicated `web/src/app/shell.tokens.test.tsx`) — statically inspect the shell's rendered styles or its source for any CSS length/font-size value not resolving to one of `theme.css`'s `--space-*`/`--text-*` custom properties; this is closer to a lint/static-scan test than a rendering assertion, consistent with the story's "introduces no spacing value outside the scale" wording
- [x] T013 [P] Implement TC-COMP-332 (keyboard traversal reaches every destination; the active one is announced, WCAG 2.1 AA) in `web/src/app/shell.a11y.test.tsx` — using Testing Library's `userEvent`, tab through the rail, assert focus visits all four destinations in order and the active route is exposed via `aria-current` (or an equivalent accessible-name/state mechanism)
- [x] T014 [P] Implement TC-COMP-333 (an unknown route renders a not-found state inside the frame) in `web/src/app/routes.test.tsx` — navigate to an undefined path, assert the shell's main region renders a not-found state and the rail/status-region frame remains present (no empty page, no crash)

### Additional Unit Tests

- [x] T015 [P] Write a unit test asserting the shell's DOM structure matches the layout contract (fixed left rail, main region, status-region slot pinned to the bottom of the rail) rather than only checking content, in `web/src/app/shell.layout.test.tsx`
- [x] T016 [P] Write a unit test asserting `routes.tsx` declares exactly the five routes this story owns (four destinations plus one run-detail child route) and no additional top-level route, in `web/src/app/routes.test.tsx`

**Checkpoint**: All eight mandatory TC-ID tests and the two additional unit tests are written and fail — `shell.tsx` and `routes.tsx` do not yet exist.

---

## Phase 3: Core Implementation

**Purpose**: Implement the shell composition and its routing per the UX design's section 0 and the component design's section 2.2.

- [x] T017 Create `web/src/app/shell.tsx` implementing the fixed left navigation rail (`--space-7` width per UX design section 0), the main region (`--space-5` padding, `--space-5` inter-region gap), and a status-region slot rendering the placeholder from T008 — the rail lists Coverage, Instruments, Runs, Settings in that exact order and exact labels, with no sign-in, user menu, or account element anywhere, and no fifth destination
- [x] T018 Create `web/src/app/routes.tsx` declaring the four destination routes plus one run-detail child route nested under Runs, using `react-router-dom` (per T001's dependency choice) — an unmatched route renders a not-found state inside the shell's main region rather than outside the frame
- [x] T019 Style the shell exclusively with `theme.css`'s custom properties (`--space-3`, `--space-5`, `--space-7`, `--text-base`, `--text-sm`, `--text-xs`, `--text-xl`, `--row-height`) via Tailwind's token-referencing config (T006) — no literal pixel or rem value should appear in `shell.tsx`'s styling
- [x] T020 Implement keyboard accessibility in `shell.tsx`: every rail item is a focusable, keyboard-activatable element in natural tab order, and the active destination is marked with `aria-current="page"` (or the ARIA state React Router's `NavLink` exposes), satisfying WCAG 2.1 AA per STD-UI-24

**Checkpoint**: `shell.tsx` and `routes.tsx` exist implementing every behavior Phase 2's tests require; T009–T016 all pass.

---

## Phase 4: Integration

**Purpose**: Confirm the shell, routing, and build pipeline work together, and that the built bundle lands where the API expects it.

- [x] T021 Run `npm run build` and verify the output lands under `src/factorflow/api/static/` (per T002's Vite config), confirming DAC-E1-S4-6 and the assumption CAP-001-E1-S6's static-file mount depends on
- [x] T022 Run the full Phase 2 test suite against the finished `shell.tsx`/`routes.tsx` and fix any mismatch between actual rendered structure and the UX design's section 0 layout contract

**Checkpoint**: `npm run test` passes in full. All eight mandatory TC-IDs (TC-COMP-014, 303, 329–334) are green. `npm run build` succeeds and its output directory matches CAP-001-E1-S6's expectation.

---

## Phase 5: Polish

**Purpose**: Confirm the density/token discipline holds and the complete validation suite is green.

- [x] T023 Review `shell.tsx` and its styling for any hardcoded value that should instead resolve to a `theme.css` token (per DAC-E1-S4-3), including any Tailwind utility class that bypasses the configured token scale
- [x] T024 Run the complete validation plan (below) and confirm every command passes

**Checkpoint**: All acceptance criteria this story owns are satisfied; `npm run test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build` all pass.

---

## Dependencies & Execution Order

### Task Dependencies
- T001–T008 (Phase 1): T001 has no dependencies; T002–T008 can run in parallel after T001, though T006 depends on `design-system/theme.css` already existing (it does, vendored at the repo root) and T008 has no dependency beyond T001.
- T009–T016 (Phase 2): all depend on Phase 1's scaffolding (T001–T008); independent of each other, can run in parallel.
- T017 depends on T001 (dependencies), T006 (token config), and T008 (status-region placeholder).
- T018 depends on T001 (`react-router-dom`) and T017 (the shell it routes into).
- T019 depends on T017 (styles the same file).
- T020 depends on T017 and T018 (adds accessibility semantics across both).
- T021 depends on T002 and T017/T018 (a real build to run).
- T022 depends on T017–T020 (full implementation) to make Phase 2's tests pass.
- T023, T024 depend on T022.

### Parallel Opportunities
- Phase 1: T002 through T008 in parallel after T001.
- Phase 2: T009 through T016 all in parallel (distinct test files or distinct test functions within a shared file).
- Phase 3: T017 and T018 have a soft dependency (T018 nests routes inside what T017 renders) but can be drafted in parallel and integrated at T019/T020.

---

## Validation Plan

### Constitution-Defined Commands
- Install: `npm ci`
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format check: `npm run format`
- Type check: `npx tsc --noEmit`

### Story-Specific Validation
- The rail renders exactly four destinations, in the order Coverage, Instruments, Runs, Settings, using those exact labels (DAC-E1-12, DAC-E1-S4-1).
- No element matching sign-in, account, or user-menu semantics is present anywhere in the shell (AC-14).
- Opening a run detail route keeps Runs as the active rail item and adds no fifth destination (DAC-E1-S4-2).
- No spacing or type value outside `theme.css`'s defined scale appears in the shell's styling (DAC-E1-S4-3, STD-UI-29).
- Keyboard traversal reaches every destination, and the active one is announced via `aria-current` or an equivalent mechanism, meeting WCAG 2.1 AA per STD-UI-24 (DAC-E1-S4-4).
- An unknown route renders a not-found state inside the shell's frame, not an empty page or a crash (DAC-E1-S4-5).
- `npm run build` output lands in `src/factorflow/api/static/`, matching what CAP-001-E1-S6's static-file mount expects (DAC-E1-S4-6).

---

## Notes

- **This story bootstraps the entire frontend project.** No `package.json`, `vite.config.ts`, `web/` directory, or any TypeScript/React file exists anywhere in the repository yet. Phase 1 here is the frontend-side equivalent of what CAP-001-E1-S1's task plan does for the Python backend.
- **The routing library is this plan's choice, not an existing contract.** Neither the story nor the component design names a specific routing library — they describe behavior ("routes.tsx", "a child route of Runs") without naming the mechanism. This plan selects `react-router-dom` v6 as the conventional fit for React 18 and the described route-nesting shape, and flags this here per constraint 7 (note gaps rather than invent silently) rather than presenting it as something the design already specified. If the owner has a different preference, T001 and T018 are the only tasks that would need to change.
- **`status-region.tsx` is a placeholder in this story.** CAP-001-E1-S5 owns its real implementation (liveness and last-run-outcome polling from `GET /api/health`). This story only defines the slot in the shell's layout and renders a no-op stand-in so the layout tests (T015) can assert the slot's position without depending on S5's content.
- **No design-system component (`badge`, `button`, `data-table`, etc.) is used by this story.** The ten components mapped in the component design's section 2.5 belong to the screens E2, E5, E6, and E7 deliver; the shell itself is pure composition, per both the story's and the UX design's own description.
- **Token discipline (T012, T023) is closer to a static scan than a rendering assertion.** The story's phrasing ("introduces no spacing value outside the scale") is a code-review-style constraint. This plan treats it as a test where practical (grepping rendered styles or source for literal length values) but notes that some part of this may end up enforced by human review rather than an automated assertion, consistent with `ui-conventions.md`'s own statement that Biome carries no `jsx-a11y` equivalent and that STD-UI-24's accessibility enforcement is human review.
- **CAP-001-E2-S1's task plan is present but uncommitted on this branch** (from a different planning pass). This story's plan does not depend on it and was not affected by it.
- **Open design question (implementation-review-v1, IR-004): the rail's `--space-7` width (48px) cannot legibly contain the visible text label "Instruments" DAC-E1-S4-1 requires.** `shell.tsx` implements the rail width exactly as ux-design §0 specifies (`--space-7`), and `theme.css` defines that token as `3rem`/48px — confirmed in the built CSS. ux-design §0 also requires the four destinations to render as visible text labels, and those two statements are in tension: 48px is an icon-rail width, and the design names no icons. This is faithful-to-design behavior, not an implementation defect, so it is not resolved here — introducing a width outside the defined scale would violate STD-UI-29. **Follow-up owed to the UX design owner:** either widen the rail to a wider scale value, specify icons with accessible names instead of (or alongside) visible text, or state explicitly that labels wrap. Until ux-design §0 is revised, `shell.tsx` keeps `--space-7` as specified.
