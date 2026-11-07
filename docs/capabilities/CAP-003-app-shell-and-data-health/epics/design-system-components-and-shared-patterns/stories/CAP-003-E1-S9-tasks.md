---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S9-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-06
updated: 2026-11-06
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T05:57:07Z
  source_artifacts:
    - id: CAP-003-E1-S9
      version: "1"
    - id: CAP-003-E1
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-owner-web-app
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1"
    - id: CAP-003-E1-S1-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E1-S9 — StateRegion: STD-UI-23's Eight States Around a Body

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S9.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `ui-components`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-06

## Summary

Creates `web/src/components/patterns/state-region.tsx`, the one place every CAP-003 data-bearing region renders its states (component design 2.7; DAC-E1-10; AC-24; STD-UI-23). `StateRegion<T>` takes the delivered `ScreenState<T>` union from `web/src/api/types.ts` (l.62-70, not edited: DAC-E7-13) and a renderer map with one entry per kind, each either a renderer or `{ notApplicable: "reason" }`, so a caller that omits a kind without naming why fails `npx tsc --noEmit`. It dispatches each kind to its own entry (so `empty-never-populated` can never be rendered as `empty-no-match`), wraps the caller's loading skeleton as busy, renders the caller's three-part error sentence with an `outline` **Try again** `button` (from CAP-003-E1-S1) wired to the caller's retry, and renders nothing for `unreachable`, which the shell replaces (AC-23). The prop and rendering contract no artifact fixes is adopted provisionally (Open Gaps 1 and 2). The story's tests live in `web/src/components/patterns/state-region.test.tsx` and include the `// @ts-expect-error` case that makes the type-level refusal a checked fact.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-24 | Every data-bearing region renders each of STD-UI-23's eight states as designed or records why one does not apply; never-populated is never collapsed into nothing-found | T002, T003, T004, T005, T006 |
| DAC-E1-10 | `StateRegion` takes the delivered `ScreenState` union unchanged, refuses to type-check a call omitting a state without a reason, renders the two empty states as distinct copy and the error with **Try again**, leaves unreachable to the shell | T002, T003, T004, T005, T006 |
| DAC-E1-S9-1 | `state-region.test.tsx`: each kind renders its renderer; the two empty states render different copy; the error renders the operation, the reason and **Try again** wired to the caller's retry | T002, T004, T005 |
| DAC-E1-S9-2 | A call omitting a renderer and its `notApplicable` reason fails `npx tsc --noEmit` (asserted with a `// @ts-expect-error` case in the test file) | T003, T005, T006 |

Mapped test cases (from `tests/component/ui-components-tests.md` l.725-765, confirmed in `tests/coverage-matrix.md` l.59, l.73, l.106-107): **TC-COMP-031** (AC-24, DAC-E1-10, DAC-E1-S9-1) and **TC-COMP-032** (AC-24, DAC-E1-10, DAC-E1-S9-2). The other cases on the AC-24 row (TC-COMP-025, 035, 050 onwards) belong to sibling stories and to the region stories that consume `StateRegion`. No integration or end-to-end case is owned by this story. The test specification is `status: draft`; its steps are used as written and sharpened in Phase 2.

## Phase 1: Setup

**Purpose**: Confirm the one prerequisite this story imports and record the green baseline.

- [ ] T001 Confirm CAP-003-E1-S1 is implemented: `web/src/components/ui/button.tsx` exports `Button` with the `outline` variant and `data-variant` (S1 plan T013) and `web/src/components/token-literals.test.ts` exists (S1 plan T003); then from the repo root run `npm ci` and `npm run test` and record that the suite, including `web/src/api/render.test.tsx` and `token-literals.test.ts`, passes before any change (baseline for T006; traces to DAC-E1-10)

**Checkpoint**: S1's `Button` is importable from `web/src/components/ui/button.tsx`; baseline suite green; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin `StateRegion`'s dispatch, its error and loading wrappers and its type-level refusal before the file exists.

All three tasks write the same new file, `web/src/components/patterns/state-region.test.tsx`, so they run in sequence. Shared fixtures, written once at the top of the file as independent literals (never derived from `StateRegion` itself): `type Row = { name: string }`; one `ScreenState<Row>` per kind (`populated` `{ data: { name: "AAPL" }, fetchedAt: "2026-10-15T22:30:00Z" }`, `partial` `{ data: { name: "MSFT" }, fetchedAt: "2026-10-16T22:30:00Z" }`, `unavailable` `{ reason: "No trading calendar yet" }`, `error` `{ message: "the server could not be reached", requestId: "req-7f3a" }`); and a `RENDERERS: StateRenderers<Row>` object whose seven renderers each return a distinct literal and whose `unreachable` entry is `{ notApplicable: "The shell replaces the main region (AC-23)" }`: loading `<p>Skeleton fixture</p>`; `empty-never-populated` `<p>No stocks followed yet.</p>`; `empty-no-match` `<p>No stock matches that filter.</p>`; populated `` <p>{`Populated ${s.data.name} at ${s.fetchedAt}`}</p> ``; partial `` <p>{`Partial ${s.data.name} at ${s.fetchedAt}`}</p> ``; unavailable `` <p>{`Unavailable: ${s.reason}`}</p> ``; error `` <p>{`Couldn't read what needs you: ${s.message}.`}</p> ``. Each renderer interpolates the fields it receives, so a dispatch that hands it another kind's state shows.

### Mandatory Component Tests

- [ ] T002 Implement TC-COMP-031 (StateRegion renders each of the eight states with distinct empties) in a new `web/src/components/patterns/state-region.test.tsx`, with a `// Implements TC-COMP-031` comment, using React Testing Library and `@testing-library/user-event`. Cases: (1) `it.each` over the seven rendered kinds: `render(<StateRegion state={FIXTURE[kind]} renderers={RENDERERS} onRetry={vi.fn()} />)` shows exactly that kind's literal (`Populated AAPL at 2026-10-15T22:30:00Z`, `Partial MSFT at 2026-10-16T22:30:00Z`, `Unavailable: No trading calendar yet`, and so on) and `queryByText` of every other kind's literal is `null`; (2) distinct empties: rendering `empty-never-populated` shows `No stocks followed yet.` and not `No stock matches that filter.`, and rendering `empty-no-match` shows the reverse (step 2 of the TC); (3) error: the region shows `Couldn't read what needs you: the server could not be reached.` (the operation and the reason the caller's renderer supplies) and `getByRole("button", { name: "Try again" })` with `data-variant="outline"`; `retry` is not called on render, and `await user.click(...)` calls it exactly once (step 3, "wired to the caller's retry"); (4) unreachable, the TC's edge case: rendering `{ kind: "unreachable" }` leaves the container empty (`expect(container).toBeEmptyDOMElement()`), and the `notApplicable` reason text is not in the document (traces to AC-24, DAC-E1-10, DAC-E1-S9-1) — kills: swap-case on the `empty-never-populated` dispatch branch (the never-populated state renders the no-match literal, case 2 fails); swap-case `populated` ↔ `partial` (the literal names the wrong kind); drop-field-copy of `onClick={onRetry}` (the spy is never called); negate-boolean on the unreachable branch (anything rendered fails `toBeEmptyDOMElement`)
- [ ] T003 Implement TC-COMP-032 (StateRegion refuses an omitted renderer without notApplicable) in `web/src/components/patterns/state-region.test.tsx` (after T002, same file), with a `// Implements TC-COMP-032` comment, as a `describe("type-level coverage (DAC-E1-S9-2)")` block. Each case is a typed `const` declaration that is never rendered, so Vitest (which strips types and does not type-check) runs it harmlessly and `npx tsc --noEmit` (whose `tsconfig.json` `include` is `web/src`, so test files are checked) judges it; each declaration starts on the line directly after its directive, where TypeScript reports a missing-property error, and is referenced in an `expect(...).toBeDefined()` so `noUnusedLocals` does not raise a second, unrelated error. Cases: (a) `// @ts-expect-error -- error has neither a renderer nor { notApplicable } (DAC-E1-S9-2)` above `const omitsError: StateRenderers<Row> = { loading: …, "empty-never-populated": …, "empty-no-match": …, populated: …, partial: …, unavailable: …, unreachable: … };` — every key but `error`; (b) `// @ts-expect-error -- unreachable is the shell's; only a reason is accepted (DEC-0313)` above a full map whose `unreachable` is a renderer function; (c) positive control, no directive: a full map whose `partial` is `{ notApplicable: "Nothing here is filtered" }` type-checks. The TC's step ("run `npx tsc --noEmit`") is executed in T006 (traces to AC-24, DAC-E1-10, DAC-E1-S9-2) — kills: a `StateRenderers` mapped type loosened to optional keys (`?:` or `Partial<…>`), which makes (a) compile and `tsc` fail with "Unused '@ts-expect-error' directive"; an `unreachable` entry widened to `StateRenderer`, which does the same to (b); a `NotApplicable` dropped from the entry union, which makes (c) fail to compile

### Additional Unit Tests

- [ ] T004 Write the wrapper and runtime-not-applicable cases in `web/src/components/patterns/state-region.test.tsx` (after T003, same file) under `describe("StateRegion wrappers (DEC-0314)")`: (1) loading: `getByText("Skeleton fixture")` has an ancestor with `aria-busy="true"` (`closest('[aria-busy="true"]')` not null), and no other kind's output has one (assert for `populated`); (2) error announced politely with the control outside the announcement: `getByRole("status")` has text content exactly `Couldn't read what needs you: the server could not be reached.` and `within(getByRole("status")).queryByRole("button")` is `null`, while `getByRole("button", { name: "Try again" })` is present; no `alert` role is rendered (`queryByRole("alert")` is `null`); (3) the envelope's request id never reaches the owner from `StateRegion` itself: `container.textContent` does not contain `req-7f3a` (UX design 0.7, STD-UI-19); (4) **Try again** only on error: for every non-error kind `queryByRole("button", { name: "Try again" })` is `null`; (5) a kind whose entry is `{ notApplicable: … }` and which nevertheless arrives at runtime (a map with `partial: { notApplicable: "Nothing here is filtered" }`, state `partial`) renders nothing and never shows the reason (`toBeEmptyDOMElement`, `queryByText("Nothing here is filtered")` `null`) (traces to AC-24, DAC-E1-10) — kills: remove-attribute of `aria-busy` (case 1); swap-case of `role="status"` to `role="alert"` (case 2's `queryByRole("alert")`) and remove-attribute of `role` (case 2's `getByRole("status")`); negate-boolean on the `typeof entry === "function"` test in the render helper (case 5 renders the object, or the seven renderers render nothing in T002); negate-boolean placing **Try again** outside the error branch (case 4)

**Checkpoint**: `state-region.test.tsx` fails at import (no `state-region.tsx`) and `npx tsc --noEmit` fails on the missing module; no production code yet.

---

## Phase 3: Core Implementation

**Purpose**: Create the pattern to the contract adopted in Open Gaps 1 and 2.

- [ ] T005 Create `web/src/components/patterns/state-region.tsx` (depends on T001-T004; makes T002-T004 pass). Exports, per DEC-0313: `export interface NotApplicable { readonly notApplicable: string }`; `export type StateKind = ScreenState<unknown>["kind"]`; `export type StateRenderer<T, K extends StateKind> = ((state: Extract<ScreenState<T>, { kind: K }>) => ReactNode) | NotApplicable`; `export type StateRenderers<T> = { readonly [K in Exclude<StateKind, "unreachable">]: StateRenderer<T, K> } & { readonly unreachable: NotApplicable }`; `export interface StateRegionProps<T> { state: ScreenState<T>; renderers: StateRenderers<T>; onRetry: () => void }`; `export function StateRegion<T>({ state, renderers, onRetry }: StateRegionProps<T>): JSX.Element | null`. `ScreenState` is imported as a type from `../../api/types` (relative path, no alias; `types.ts` is not edited, DAC-E7-13) and `Button` from `../ui/button`. Body: a private `renderEntry<S>(entry: ((state: S) => ReactNode) | NotApplicable, state: S): ReactNode` returning `typeof entry === "function" ? entry(state) : null`; a `switch (state.kind)` with one `case` per kind, each passing the narrowed `state` to its own entry (no `default` fall-through; the `unreachable` case returns `null` without reading `renderers.unreachable`, AC-23; an exhaustive `const unhandled: never = state` guard after the switch). Rendering, per DEC-0314: `loading` → `<div aria-busy="true">{renderEntry(...)}</div>`; `error` → when the entry is a renderer, `<div className="flex flex-col gap-2"><div role="status">{entry(state)}</div><Button type="button" variant="outline" className="w-fit" onClick={onRetry}>Try again</Button></div>`, and `null` when the entry is `NotApplicable`; every other kind → the entry's output with no wrapper, `null` for `NotApplicable`. `StateRegion` never reads `state.requestId` or renders any field of the state itself; every user-visible string except **Try again** is the caller's. A doc comment cites component design 2.7, DAC-E1-10, AC-24, STD-UI-23, AC-23 for the unreachable kind and the two DEC-PENDING tokens; it writes no unit literal and no hex colour (T001's `token-literals.test.ts` scans every non-test file under `web/src/components/`, comments included). No `dangerouslySetInnerHTML` (component design 4; `web/src/api/render.test.tsx`)

**Checkpoint**: `npm run test` passes T002-T004; `npx tsc --noEmit` passes with both `@ts-expect-error` directives consumed.

---

## Phase 4: Integration

**Purpose**: None in this story. `StateRegion` is a leaf pattern with no wiring; the regions that render through it are the consumer stories' (Story Dependency Classification), and no delivered screen is changed here.

**Checkpoint**: No file outside `web/src/components/patterns/state-region.tsx` and `state-region.test.tsx` is changed.

---

## Phase 5: Polish

**Purpose**: Prove the full validation set and record the TDD evidence.

- [ ] T006 From the repo root run `npm run test`, `npm run lint`, `npm run format`, `npx tsc --noEmit` and `npm run build`; confirm `token-literals.test.ts` and `render.test.tsx` pass with `state-region.tsx` in their scan, and confirm `git diff --stat` touches only the two story files (no edit to `web/src/api/types.ts`). Then prove TC-COMP-032's directives are load-bearing: temporarily change `StateRenderers`' first mapped clause to `?:` optional keys, confirm `npx tsc --noEmit` fails on `state-region.test.tsx` with "Unused '@ts-expect-error' directive", and revert (traces to DAC-E1-S9-2, DAC-E1-10, AC-24)
- [ ] T007 After each TDD cycle in T002–T006 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S9-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`; no per-cycle commit is made (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E1-S1 | hard | `state-region.tsx` imports `Button` (`outline`) from `web/src/components/ui/button.tsx`, which S1 creates (S1 plan T013); existing graph edge S9 → S1 |
| CAP-003-E5-S3 | reverse | Home's regions render through `StateRegion` (DAC-E5-S3-3); graph edge E5-S3 → S9 already present |
| CAP-003-E4-S4 | reverse | Setup's step states render through `StateRegion` (DAC-E4-S4-4); graph edge E4-S4 → S9 already present |
| CAP-003-E6-S5 | reverse | Data health's regions render through `StateRegion` (DAC-E6-S5-3); graph edge E6-S5 → S9 already present |
| CAP-003-E7-S1 | reverse | Settings' eight-state table renders through `StateRegion` (DAC-E7-S1-5); graph edge present |
| CAP-003-E7-S2 | reverse | Coverage's eight-state table renders through `StateRegion` (DAC-E7-S2-6); graph edge present |
| CAP-003-E7-S3 | reverse | Followed stocks' eight-state table renders through `StateRegion` (DAC-E7-S3-6); graph edge present |
| CAP-003-E7-S4 | reverse | Downloads' eight-state table renders through `StateRegion` (DAC-E7-S4-7); graph edge present |
| CAP-003-E7-S5 | reverse | Download detail's eight-state table renders through `StateRegion` (DAC-E7-S5-7); graph edge present |

No new hard edge: the only produced module this story imports is S1's `button.tsx`; `web/src/api/types.ts` is delivered (CAP-001) and unchanged.

### Task Dependencies
- T001: No dependencies (needs CAP-003-E1-S1 implemented)
- T002: Depends on T001
- T003: Depends on T002 (same file)
- T004: Depends on T003 (same file)
- T005: Depends on T002, T003, T004
- T006: Depends on T005
- T007: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- None worth taking: the story is one test file and one source file; T002-T004 share the test file.

---

## Validation Plan

### Constitution-Defined Commands
(tech stack v7, Validation Commands, working directory `.`)
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format`
- Type check: `npx tsc --noEmit`

### Story-Specific Validation
- DAC-E1-S9-1 / TC-COMP-031: `npm run test -- state-region` passes T002's cases: each of the seven rendered kinds shows only its own literal, the two empty states show different copy, the error shows the operation and reason with **Try again**, whose click calls the retry spy once, and `unreachable` renders an empty container.
- DAC-E1-S9-2 / TC-COMP-032: `npx tsc --noEmit` exits 0 with both `@ts-expect-error` directives in `state-region.test.tsx` consumed; the T006 loosening experiment makes it fail with "Unused '@ts-expect-error' directive" and is reverted.
- DAC-E1-10 "unchanged": `git diff -- web/src/api/types.ts` is empty.
- AC-24 never-populated not collapsed: T002 case 2 passes; a hand-written mutant routing `empty-never-populated` to the `empty-no-match` entry (Other Notes) is killed.
- AC-26 carry-over: `token-literals.test.ts` (S1) passes with `state-region.tsx` scanned; `render.test.tsx` passes (no `dangerouslySetInnerHTML`).
- Plan self-consistency: no check above forbids what a task requires. `state-region.tsx`'s doc comment names DEC-PENDING tokens and component design sections only, which the literal scan does not match; the **Try again** literal in the source is the copy DAC-E1-10 requires.

---

## Notes

### Resolved Conflicts

1. **"Each of the eight kinds renders its renderer" vs "leave the unreachable kind to the shell".** Story DAC-E1-S9-1 says each of the eight `ScreenState` kinds renders its renderer; epic DAC-E1-10 and component design 2.7 say `StateRegion` leaves `unreachable` to the shell, which replaces the main region (AC-23; UX design 0.5 *Unreachable*). Epic acceptance criteria govern story criteria (constraint 9.1), and TC-COMP-031's own edge case ("Unreachable kind: left to the shell") agrees: seven kinds render their renderer, `unreachable` renders nothing (T002 case 4, T005). How the caller's map records that is Open Gap 1.
2. **STD-UI-23's *stale* vs the `ScreenState` union.** STD-UI-23 names stale and not populated; the delivered union has `populated` and no stale kind. Epic DAC-E1-10 requires the union unchanged and story DAC-E1-S9-1 enumerates "the eight `ScreenState` kinds", so `StateRegion` covers the union's kinds; stale is a rendering a region gives inside its `populated` or `partial` renderer, as the consumer stories already record (DAC-E5-S3-3 "stale is the aging *checked {time}*"; DAC-E6-S5-3 stale recorded as not rendered under DEC-0201). STD-UI-23's verification is the UX brief's per-region enumeration, not this type. Not a gap for this story.
3. **Story Dependencies "`card` for the skeleton" vs card spec and design 2.7.** The card spec (section 4) requires a skeleton "matching the final layout", which differs per region (UX design 1.2 to 1.9 States), and design 2.7 gives the caller "one renderer per state", loading included. The design's normative prose governs the story's dependency note: the skeleton is the caller's loading renderer (built from S1's `card` where the region is a card), and `StateRegion` "renders" it by dispatching to it and marking it busy. `state-region.tsx` imports `Button` only; S1 remains the hard prerequisite through `button`.

### Open Gaps

1. **`StateRegion`'s prop contract and the unreachable entry. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0313.** Component design 2.7 says a caller passes "either a renderer or `{ notApplicable: "reason" }` for each of the eight kinds" and that `StateRegion` "leaves the unreachable kind to the shell"; no artifact names the props, the renderer signature, how retry reaches **Try again**, what a caller passes for `unreachable`, or what renders when a kind marked not applicable arrives at runtime. Adopted (T003, T005): props `{ state: ScreenState<T>; renderers: StateRenderers<T>; onRetry: () => void }`; each renderer receives its kind's narrowed state (`Extract<ScreenState<T>, { kind: K }>`); all eight keys are required; the `unreachable` key accepts only `NotApplicable`, so every call records why it does not render that state and none can supply a renderer `StateRegion` would ignore; `StateRegion` renders `null` for `unreachable` and for any kind whose entry is `NotApplicable`; `onRetry` is a required top-level prop. Derivation: design 2.7's "for each of the eight kinds" (all keys required) and "leaves the unreachable kind to the shell" (no renderer is ever called for it); STD-UI-23's specialization "a region MAY declare a state inapplicable with a recorded reason" (the reason is a record, not display copy); DAC-E1-S9-1's "**Try again** wired to the caller's retry" (a caller-supplied callback); the delivered screens' precedent of a reload-token bump on retry (`web/src/screens/instruments/index.tsx`, `research/universes/index.tsx`). Alternatives rejected: leaving `unreachable` out of the map (contradicts "each of the eight kinds"); accepting a renderer for `unreachable` and ignoring it (a silent footgun); retry inside the `error` entry (breaks "one renderer per state"). Consumed by every region story that renders through `StateRegion` (CAP-003-E4-S4, CAP-003-E5-S3, CAP-003-E6-S5, CAP-003-E7-S1, CAP-003-E7-S2, CAP-003-E7-S3, CAP-003-E7-S4, CAP-003-E7-S5), so this is propagating. Owning design: `component-design-ui-components.md` 2.7, at its next revision.
2. **How `StateRegion` renders the error, the loading skeleton and the other kinds. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0314.** DAC-E1-10 and design 2.7 require "the error with its three parts and **Try again**" and "the loading skeleton", but no artifact says where the three parts (operation, stock or download, reason; UX design 0.7, STD-UI-19) come from, which control renders **Try again**, or what live-region semantics the error and loading carry. Adopted (T004, T005): the caller's `error` renderer supplies the whole three-part sentence (the copy is each screen design's, e.g. *Couldn't read {what}: {reason}.*, UX design 1.3 and 1.4 States, and taken-over screens keep their v5 wording), and `StateRegion` renders it inside a `role="status"` element followed, outside it, by `Button` `variant="outline"` labelled **Try again** whose `onClick` is `onRetry`; `StateRegion` never renders a field of the state itself, so `requestId` cannot reach the owner through it; `loading` is the caller's skeleton wrapped in `aria-busy="true"`; every other kind is the renderer's output unwrapped. Derivation: UX design 1.3 Component Mapping ("Try again (error states) | `button` | `outline`"); UX design 0.7 ("`request_id` is never shown"); STD-UI-24 ("Content updated by polling MUST announce politely") and UX design 10 "every polled change announces politely and never moves focus", hence `status` not `alert`; the CAP-002 precedent of stating a failed poll in the status element with **Try again** outside it (`web/src/screens/research/results-pane.test.tsx` l.922) and of a screen-supplied failure sentence (`research/stocks/history-tab.tsx` l.248-260); card spec section 4 (skeleton to the final layout, so the shape is the caller's). Alternatives rejected: a fixed *Couldn't {operation}: {reason}.* template in `StateRegion` (would take copy from the screens and change the taken-over screens' wording, AC-17); `role="alert"` as the delivered CAP-001 screens use (assertive on polled regions, against STD-UI-24). Consumed by the region stories' tests that query the error and **Try again**, so this is propagating. Owning design: `component-design-ui-components.md` 2.7, at its next revision.

### Other Notes

- **Type check is the only judge of TC-COMP-032.** Vitest strips types, so the `@ts-expect-error` declarations must be runtime-harmless (typed constants, never rendered) and must start on the line directly after their directive; a declaration split so that the error lands on a later line leaves the directive unused and fails `tsc` for the wrong reason.
- **No literal in comments.** `state-region.tsx` is scanned by S1's `token-literals.test.ts` comments included; write no unit literal or hex colour in its doc comment.
- **Imports are relative** (`../../api/types`, `../ui/button`), as component design 2.1 and DEC-0211 require; no alias is added.
- **Behaviour-changing commits.** T005 is the one production change; T002-T004 are test-only cycles (their evidence carries `mutation: {not_applicable: test-only cycle}`), T006 changes nothing that remains.
- **Hand-written mutants** for the mutation run (beside the generated ones):
  - `web/src/components/patterns/state-region.tsx`: `renderEntry(renderers["empty-never-populated"], state)` → `renderEntry(renderers["empty-no-match"] as never, state as never)` (never-populated collapsed into nothing-found; killed by T002 case 2)
  - `web/src/components/patterns/state-region.tsx`: `typeof entry === "function"` → `typeof entry !== "function"` (killed by T002 case 1 and T004 case 5)
  - `web/src/components/patterns/state-region.tsx`: `<div aria-busy="true">` → `<div>` (killed by T004 case 1)
  - `web/src/components/patterns/state-region.tsx`: `<div role="status">` → `<div role="alert">` (killed by T004 case 2)
  - `web/src/components/patterns/state-region.tsx`: `onClick={onRetry}` → (deleted) (killed by T002 case 3)
  - `web/src/components/patterns/state-region.tsx`: `{ readonly [K in Exclude<StateKind, "unreachable">]: StateRenderer<T, K> }` → `{ readonly [K in Exclude<StateKind, "unreachable">]?: StateRenderer<T, K> }` (killed by `npx tsc --noEmit` through T003 case (a), not by Vitest; run it under T006's type-check, not the Vitest mutation run)
