---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S5-tasks
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
  timestamp: 2026-11-07T05:57:57Z
  source_artifacts:
    - id: CAP-003-E1-S5
      version: "1"
    - id: CAP-003-E1
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-ux-brief
      version: "1"
    - id: CAP-003-component-design-data-health-api
      version: "1"
    - id: CAP-003-component-design-home-ui
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

# Tasks: CAP-003-E1-S5 — The One Tier Function: tiers.ts and StatusBadge

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S5.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `ui-components`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-06

## Summary

Creates `web/src/components/patterns/tiers.ts`, the one status-to-tier function of the owner interface (component design `ui-components` 2.3; system design constraint 4): it exports `Tier`, `Status`, `NeedsYouKind`, `tierOf(status)` and `labelOf(status)`, implementing every row of UX brief §12.2 as epic DAC-E1-1 restates it, with an exhaustive `switch` and a `never` default so a status kind or state without a row fails to type-check. It takes over CAP-002's delivered `web/src/components/patterns/status-badge.tsx` and generalises `StatusBadge` to the six tiers: it renders S1's vendored `badge` `status-<tier>` variant with the label as text and the tier shape (neutral hollow circle, active ringed dot, good filled circle, warning triangle, serious diamond, critical square) as an `aria-hidden` `lucide-react` icon, so no status is carried by colour alone (DAC-E1-2; STD-UI-8). The takeover removes the pattern's import from a screen (`web/src/screens/runs/outcome-badge.tsx`, design 2.2) and keeps every delivered CAP-002 caller and test green without editing them.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-19 | Every user-visible label uses the STD-UI-1 display label; `labelOf` is the one source of status labels | T003, T006, T009 |
| AC-20 | Every download outcome, check result and stock state renders as one severity tier with its label and shape, never colour alone | T002, T003, T004, T005, T006, T007, T008, T009 |
| AC-12 | `partial` is warning and `abandoned` serious; no partial or interrupted download presented as complete | T003, T006 |
| DAC-E1-1 | `tierOf` / `labelOf` implement every §12.2 row verbatim; `partial` never good, `cancelled` never critical | T003, T006 |
| DAC-E1-2 | `StatusBadge` renders `badge` `status-<tier>` with the label as text and the tier shape as an `aria-hidden` icon | T004, T005, T007, T008 |
| DAC-E1-S5-1 | A new kind or state without a row makes `tierOf` and `labelOf` fail to type-check (exhaustive `switch`, `never` default) | T002, T006, T009 |
| DAC-E1-S5-2 | `tiers.test.ts` asserts every DAC-E1-1 row by input, label and tier, including check `ok` labelled by the caller's check and credential *Found* / *Missing* | T003, T006 |
| DAC-E1-S5-3 | `status-badge.test.tsx`: label in the accessible name, shape `aria-hidden`, no two tiers share a shape | T004, T007 |

Mapped test cases (from `tests/component/ui-components-tests.md`, confirmed in `tests/coverage-matrix.md` lines 64-65 and 95-97): **TC-COMP-020** (DAC-E1-S5-1, AC-20), **TC-COMP-021** (DAC-E1-S5-2, DAC-E1-1, AC-12, AC-20), **TC-COMP-022** (DAC-E1-S5-3, DAC-E1-2, AC-20). The other cases on the AC-12, AC-19 and AC-20 rows (for example TC-COMP-030, 044, 093, 097, 112, 146, 169, 204, 209 and TC-INT-021, TC-INT-036) verify the screens and APIs that consume this story and belong to their own stories. No integration or end-to-end case is owned by this story. The test specification is `status: draft`; its steps are used as written and sharpened below.

## Phase 1: Setup

**Purpose**: Confirm the baseline and the dependency the shapes need.

- [ ] T001 From the repo root run `npm ci` and `npm run test` and record that the delivered CAP-002 tests that render `StatusBadge` pass before any change: `web/src/components/patterns/as-of-line.test.tsx`, `not-current-banner.test.tsx`, `web/src/screens/research/results-pane.test.tsx`, `research.test.tsx`, `set-history-dialog.test.tsx`, `stocks/factor-card.test.tsx`, `stocks/history-tab.test.tsx`. Confirm CAP-003-E1-S1's deliverables are present (`web/src/components/ui/badge.tsx` exporting `Badge` with the six `status-<tier>` variants, `web/src/components/ui/utils.ts`, `lucide-react` in `package.json`) and that the installed `lucide-react` exports `Circle`, `CircleDot`, `Triangle`, `Diamond`, `Square` and `Icon` (`grep -nE "declare const (Circle|CircleDot|Triangle|Diamond|Square|Icon)\b" node_modules/lucide-react/dist/lucide-react.d.ts`). No package is added by this story (traces to AC-20)

**Checkpoint**: Baseline green; S1's `badge` and `lucide-react` available; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin the tier table, its exhaustiveness and the badge's words-and-shape contract before any production change.

### Mandatory Component Tests

- [ ] T002 Implement TC-COMP-020 (tierOf and labelOf are exhaustive over the Status union) as a `describe("Status exhaustiveness (TC-COMP-020, DAC-E1-S5-1)")` block in a new `web/src/components/patterns/tiers.test.ts`, with a `// Implements TC-COMP-020` comment. The TC's "add a kind in a type-check fixture, run `npx tsc --noEmit`" is automated with the TypeScript compiler API (`import ts from "typescript"`, the delivered devDependency): read `tiers.ts` (path from `import.meta.url`, as `web/src/app/shell.tokens.test.tsx` does), load the repo-root `tsconfig.json` compiler options with `ts.readConfigFile` + `ts.parseJsonConfigFileContent` (override `types: []`, which `tiers.ts` does not need, to keep the program small), and build a program with root `tiers.ts` through a `ts.createCompilerHost` whose `getSourceFile` returns a spliced copy of `tiers.ts` and delegates every other file. Splice by AST, not by text match, so formatting cannot make the test vacuous: locate the `Status` type alias with `ts.createSourceFile`, then (a) insert `| { of: "planted" }` at the end of its union (a new kind), and (b) insert `| "planted"` at the end of the `state` union of the member whose `of` is `"scores"` (a new state). Cases: (1) the unspliced source yields zero `ts.getPreEmitDiagnostics` for `tiers.ts` (TC edge "Row added: type-check passes", and proof the harness itself compiles); (2) splice (a) changes the source and yields at least one diagnostic whose `start` lies inside the `tierOf` function declaration and at least one inside `labelOf` (function ranges from the spliced AST); (3) the same for splice (b). Give the `describe` a 30-second timeout. Additionally, in the same file, type-level guards enforced by `npx tsc --noEmit` (test files are type-checked, tsconfig `include: ["web/src"]`): `// @ts-expect-error` on `tierOf({ of: "check", check: "daily_prices", status: "not_determinable" })` and on `tierOf({ of: "check", check: "daily_prices", status: "not_current" })` (Not determinable is not a tier, design 2.3; Resolved Conflict 1) — kills: hand-written mutant widening `assertNever(value: never)` to `assertNever(value: unknown)` (cases 2 and 3 then compile clean); swap-case of a nested `default: return assertNever(...)` for `default: return "neutral"` (case 3); widening the check `status` union to accept `not_determinable` (the `@ts-expect-error` becomes unused and tsc fails)
- [ ] T003 Implement TC-COMP-021 (tiers.test asserts every UX brief 12.2 row by input, label and tier) as a `describe("Tier table (TC-COMP-021, DAC-E1-1)")` block in `web/src/components/patterns/tiers.test.ts` (same file as T002, so sequential), with a `// Implements TC-COMP-021` comment. Write the expected table as independent literal fixtures typed so that a missing row fails type-check (TC edge "A row missing from the test: the audit flags it"): `DOWNLOAD: Record<RunState, [label, Tier]>` = `requested` *Queued* neutral, `running` *Downloading* active, `cancelling` *Stopping* warning, `succeeded` *Complete* good, `partial` *Partial* warning, `failed` *Failed* critical, `cancelled` *Cancelled by you* neutral, `abandoned` *Interrupted* serious; `RESULT: Record<"not_found" | "failed", …>` = *Not found* warning, *Failed* critical; `SCORES: Record<Extract<Status, { of: "scores" }>["state"], …>` = `building` *Updating* active, `not_current` *Not reflecting the latest download* warning, `failed` *Score update failed* critical, `never_classified` *No scores yet* neutral, `current` *Current* good; check rows under DEC-0308 (Open Gap 1): `{ check: "daily_prices", status: "ok" }` *No missing prices or gaps* good, `{ check: "company_financials", status: "ok" }` *All financials present* good, `{ check: "daily_prices", status: "exceptions" }` and `{ check: "company_financials", status: "exceptions" }` *Needs attention* warning; credential `present: true` *Found* good, `present: false` *Missing* critical; `ITEM` rows (brief §12.2 *Needs you* rows; DEC-0203): `data_problems` *Data* warning, `download_not_complete` with `failed: true` *Download* critical and with `failed: false` *Download* serious, `credential_missing` *Setup* critical, `first_download` *Download* active, `first_scores` *Scores* active, `score_failed` *Scores* critical, the item fixture typed `Record<NeedsYouKind, …>` over the kinds plus the explicit `failed: false` row. `it.each` over every row asserts `tierOf(status)` and `labelOf(status)` equal the fixture's tier and label (28 rows). Two named guards: `tierOf({ of: "download", state: "partial" })` is not `"good"` and `tierOf({ of: "download", state: "cancelled" })` is not `"critical"` (STD-UI-12) — kills: swap-case of any tier or label in `tiers.ts` (`partial` → good, `abandoned` → critical, *Cancelled by you* → *Cancelled*); swap-case of the two check-`ok` labels between `daily_prices` and `company_financials`; negate-boolean on `present` (credential) and on `failed` (item `download_not_complete`, critical vs serious)
- [ ] T004 [P] Implement TC-COMP-022 (StatusBadge: label in name, shape aria-hidden, shapes unique) in a new `web/src/components/patterns/status-badge.test.tsx`, with a `// Implements TC-COMP-022` comment, using React Testing Library. For each of the six tiers, render `<a href="/data"><StatusBadge tier={tier}>{label}</StatusBadge></a>` with a distinct label per tier and assert: (1) `getByRole("link", { name: label })` resolves, i.e. the accessible name is exactly the label (the icon contributes nothing); (2) the badge element (`[data-variant="status-<tier>"]`) contains exactly one `svg`, which has `aria-hidden="true"` and `focusable="false"`; (3) the shape against an independent literal fixture: neutral — one `circle` child with no `fill` attribute and the `svg` `fill="none"` (hollow); active — exactly two `circle` children (ring and dot); good — exactly one child, a `circle` with `fill="currentColor"` and no `stroke` attribute (the delivered `as-of-line.test.tsx` "one filled circle" assertion); warning — one `path`, `svg` has class `lucide-triangle`; serious — one `path`, `svg` has class `lucide-diamond`; critical — one `rect`, `svg` has class `lucide-square`; (4) uniqueness: the six signatures `svg.getAttribute("fill") + "|" + svg.innerHTML` are pairwise distinct (`new Set(signatures).size === 6`) — TC edge: greyscale rendering keeps the tiers distinguishable by shape alone. The TC's "shapes unique" is asserted both by the fixture (3) and the set (4), so the uniqueness check is not only code compared with itself — kills: swap-case of two tiers' icons in the shape map (fixture (3) fails, for example warning given `Diamond`); remove-attribute of `aria-hidden` on the icon (2); swap-case of good's filled `Icon` for the hollow `Circle` (good's `fill` assertion and the uniqueness set both fail)

### Additional Unit Tests

- [ ] T005 [P] Write the badge-composition and compatibility tests in `web/src/components/patterns/status-badge.test.tsx` (same file as T004; may be written in the same sitting): (a) for each tier, the badge element has `data-variant="status-<tier>"` and classes `bg-status-<tier>-muted` and `text-status-<tier>` and `text-xs` (the delivered DOM CAP-002's `as-of-line.test.tsx`, `not-current-banner.test.tsx` and Research tests assert; S1's `badge` variant supplies it); (b) `title="2026-10-16 17:40 CDT"` is forwarded as the `title` attribute and `className="w-fit"` is present on the badge (the delivered `not-current-banner.tsx` host class) while the tier classes survive; (c) the badge is not a tab stop (`userEvent.tab()` focuses nothing) and has no ARIA role (badge spec sections 4-5); (d) a source check that `status-badge.tsx` does not import from `screens/` (read the file text, assert no `from "../../screens` — design 2.2: nothing imports a screen) (traces to DAC-E1-2, AC-20) — kills: remove-attribute of `title` forwarding; swap-case of the variant template (`status-${tier}` → `coverage-unknown`); a regression that reintroduces `TIER_CLASSES` from `outcome-badge.tsx` (d)

**Checkpoint**: Phase 2 tests written and failing: `tiers.ts` does not exist (T002, T003 fail to import), and the delivered `StatusBadge` has no `neutral` or `serious` tier, no `lucide-react` icon and imports from a screen (T004, T005 fail).

---

## Phase 3: Core Implementation

**Purpose**: Write the one tier function and generalise `StatusBadge` over S1's `badge`.

- [ ] T006 Create `web/src/components/patterns/tiers.ts` (component design 2.3; UX brief §12.2; DAC-E1-1). Exports: `type Tier = "neutral" | "active" | "good" | "warning" | "serious" | "critical"`; `type NeedsYouKind = "data_problems" | "download_not_complete" | "credential_missing" | "first_download" | "first_scores" | "score_failed"` (declared here, story Implementation, so `tiers.ts` imports nothing from `needs-you.ts`; Resolved Conflict 2); `type Status` = `{ of: "download"; state: RunState }` | `{ of: "result"; outcome: "failed" | "not_found" }` | `{ of: "scores"; state: "never_classified" | "building" | "not_current" | "failed" | "current" }` | `{ of: "check"; check: "daily_prices" | "company_financials"; status: "ok" | "exceptions" }` (DEC-0308; Resolved Conflict 1) | `{ of: "credential"; present: boolean }` | `{ of: "item"; kind: NeedsYouKind; failed?: boolean }`; `tierOf(status: Status): Tier` and `labelOf(status: Status): string`. `RunState` is `import type { RunState } from "../../api/types"` (unchanged; types only). Each function is a `switch (status.of)` whose every branch over a string union is itself a `switch` with one `case` per value, and every `switch` ends `default: return assertNever(x)`, where a module-local `function assertNever(value: never): never` throws `new Error(\`Unhandled status: ${JSON.stringify(value)}\`)`; boolean fields (`present`, `failed`) use a conditional. Rows exactly as T003's fixture: download *Queued* / *Downloading* / *Stopping* / *Complete* / *Partial* / *Failed* / *Cancelled by you* / *Interrupted* with neutral / active / warning / good / warning / critical / neutral / serious; result *Not found* warning, *Failed* critical; scores *Updating* active, *Not reflecting the latest download* warning, *Score update failed* critical, *No scores yet* neutral, *Current* good; check `ok` good labelled *No missing prices or gaps* (`daily_prices`) or *All financials present* (`company_financials`), `exceptions` warning *Needs attention*; credential *Found* good / *Missing* critical; item *Data* warning, *Download* critical when `failed` else serious (`download_not_complete`), *Setup* critical, *Download* active (`first_download`), *Scores* active (`first_scores`), *Scores* critical (`score_failed`). Module doc comment: the one status-to-tier function (AC-20; system design constraint 4), labels are STD-UI-1 v6 display labels (AC-19), Not determinable is not a tier and renders through `NotDeterminable`, never `tierOf` (design 2.3, 2.5). No unit literal or `#`-hex in comments (S1's literal scan reads this file). Depends on T002, T003 (makes T002, T003 pass)
- [ ] T007 Rewrite the delivered `web/src/components/patterns/status-badge.tsx` (takeover from CAP-002; Resolved Conflict 3). Props keep the delivered API, widened: `StatusBadgeProps { tier: Tier; children: string; title?: string; className?: string }` with `Tier` imported from `./tiers`; keep `export type StatusTier = Tier` with a doc comment that it is kept for the delivered CAP-002 callers (`as-of-line.tsx`, `set-history-dialog.tsx`, `stocks/history-tab.tsx` import it), so none of them is edited. Render `<Badge variant={\`status-${tier}\` as const} title={title} className={className}>` from `../ui/badge` (S1), containing the icon then `{children}`. The icon map `TIER_ICON: Record<Tier, JSX.Element>` (or a `switch` with a `never` default), each with `aria-hidden="true" focusable="false" className="h-3 w-3 shrink-0"`: neutral `<Circle />` (stroke only, hollow); active `<CircleDot />` (ring and dot); good `<Icon iconNode={FILLED_CIRCLE} />` with `const FILLED_CIRCLE: IconNode = [["circle", { cx: "12", cy: "12", r: "10", fill: "currentColor", key: "filled-circle" }]]` — lucide ships no filled-circle glyph and the delivered `as-of-line.test.tsx` requires the circle element itself to carry `fill="currentColor"` (Other Notes); warning `<Triangle fill="currentColor" />`; serious `<Diamond fill="currentColor" />`; critical `<Square fill="currentColor" />` (filled, as CAP-002's warning and critical shapes are). Remove the `TIER_CLASSES` import from `../../screens/runs/outcome-badge` and the local `BADGE` class string (the `badge` variant carries them). Doc comment cites component design 2.3, DAC-E1-2, blueprint §8 and STD-UI-8, and states the label comes from `labelOf` or the caller's own answer word (for example `dataTileBadge`'s). Depends on T006 (makes T004, T005 pass)

**Checkpoint**: T002-T005 pass; `tiers.ts` exists; `StatusBadge` renders six tiers through `badge`.

---

## Phase 4: Integration

**Purpose**: Prove the takeover keeps every delivered caller and the shared scans green without editing them.

- [ ] T008 Run, unchanged, every delivered test that renders `StatusBadge` (T001's list), plus `web/src/components/token-literals.test.ts` (S1: `tiers.ts` and `status-badge.tsx` are scanned; the iconNode's unitless `"12"` / `"10"` match no length pattern), `web/src/components/ui/badge.test.tsx` (S1) and `web/src/api/render.test.tsx`. Confirm with `git diff --stat` that the only source files changed are `web/src/components/patterns/tiers.ts`, `tiers.test.ts`, `status-badge.tsx` and `status-badge.test.tsx`: no CAP-002 caller, no file under `web/src/screens/` or `web/src/app/`, `package.json` and `web/src/api/types.ts` unchanged (traces to AC-20, DAC-E1-2)

**Checkpoint**: The whole Vitest suite is green with no delivered test or caller edited.

---

## Phase 5: Polish

**Purpose**: Validation commands and TDD evidence.

- [ ] T009 Run `npm run lint`, `npm run format` (fix with `npx biome format --write` on this story's four files only), `npx tsc --noEmit` (enforces T002's `@ts-expect-error` guards and the `Record<…>` completeness of T003's fixtures) and `npm run build` from the repo root; then the manual form of TC-COMP-020: add `| { of: "planted" }` to `Status` in `tiers.ts`, confirm `npx tsc --noEmit` reports errors in `tierOf` and `labelOf`, and revert (traces to DAC-E1-S5-1, AC-19, AC-20)
- [ ] T010 After each TDD cycle in T002–T009 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E1-S5-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`; no per-cycle commit is planned. Cycles: (1) T002 + T003 + T006 the tier function; (2) T004 + T005 + T007 the `StatusBadge` takeover; T008-T009 add no behaviour and join cycle 2's validation evidence (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E1-S1 | hard | `StatusBadge` renders S1's `web/src/components/ui/badge.tsx` `status-<tier>` variant and imports `lucide-react`, which S1 adds to `package.json`; existing graph edge |
| CAP-003-E1-S6 | context | `NotDeterminable` (`presence.tsx`) is where Not determinable renders instead of `tierOf` (design 2.3, 2.5); this story only keeps it out of `Status`, importing nothing from S6 |
| CAP-003-E1-S7 | reverse | `worst-data-tier.ts` imports `Tier` and calls `tierOf({ of: "scores", … })` from `tiers.ts`; edge S7 → S5 present |
| CAP-003-E1-S8 | reverse | `needs-you.ts` imports `Tier` and `NeedsYouKind` from `tiers.ts` and the item row renders its tag through `StatusBadge`; edge S8 → S5 present |
| CAP-003-E1-S10 | soft | Takes over `as-of-line.tsx`, which imports `StatusBadge` and `StatusTier`; this plan keeps both names and the `{tier, children, title}` API, so the two stories develop concurrently against the delivered API |
| CAP-003-E3-S7 | reverse | The download-finished toast takes its outcome label and tier from `labelOf` / `tierOf` and renders them through `StatusBadge`; edge present |
| CAP-003-E5-S2 | reverse | The data tile renders `dataTileBadge`'s answer word through `StatusBadge` `tier` + label (the reason the label stays a prop); edge present |
| CAP-003-E6-S1 | reverse | The check cards call `tierOf` / `labelOf` with `{ of: "check", check, status }` (DEC-0308); edge present |
| CAP-003-E7-S4 | reverse | Replaces `outcome-badge.tsx` with `StatusBadge` over `tierOf({ of: "download", state })`; edge present |

No hard dependency beyond the existing `CAP-003-E1-S5: [CAP-003-E1-S1]`; no edge is added.

### Task Dependencies

- T001: No dependencies
- T002 → T003: same file, sequential; after T001
- T004 → T005: same file, sequential; can run in parallel with T002/T003
- T006: Depends on T002, T003
- T007: Depends on T004, T005, T006
- T008: Depends on T007
- T009: Depends on T008
- T010: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities

- Phase 2: `tiers.test.ts` (T002, T003) in parallel with `status-badge.test.tsx` (T004, T005)
- Phase 3: sequential (`status-badge.tsx` imports `Tier` from `tiers.ts`)

---

## Validation Plan

### Constitution-Defined Commands

(`docs/constitution/tech-stack.md` v7 Validation Commands, working directory `.`)

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm run test` (Vitest; also drives a real Vite build)
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit`

### Story-Specific Validation

- DAC-E1-1 / DAC-E1-S5-2 / AC-12: T003 passes (28 rows); `partial` warning and `cancelled` neutral.
- DAC-E1-S5-1: T002 passes; `npx tsc --noEmit` passes; the manual plant in T009 fails `tsc` in both functions and is reverted.
- DAC-E1-2 / DAC-E1-S5-3: T004 and T005 pass; greyscale distinguishability is asserted structurally, by the per-tier shape fixture and the six distinct icon signatures (T004 (3) and (4)), not by a rendered screenshot.
- AC-20 takeover: every delivered CAP-002 `StatusBadge` test passes unchanged (T008); `grep -n "screens/" web/src/components/patterns/status-badge.tsx` prints nothing.
- AC-26 (S1's scan): `token-literals.test.ts` passes over the two new source files.

---

## Notes

### Resolved Conflicts

1. **Check status values: design snippet vs epic AC and the wire.** Component design 2.3's illustrative snippet types the check as `{ of: "check"; status: "ok" | "exceptions" | "not_current" }`. Epic DAC-E1-1 lists check `ok` / `exceptions` only, UX brief §12.2 has no `not_current` check row (and renders `not_determinable` as presence, not a tier), the `data-health-api` §11 wire enum is `ok` / `exceptions` / `not_determinable`, and design 2.3's own prose says "Not determinable is not a tier … never through `tierOf`". Epic AC and design normative prose govern over the snippet: the check `status` is `"ok" | "exceptions"`; `not_current` has no row and no label is invented for it; `not_determinable` is rejected at the type level (T002) and renders through `NotDeterminable` (CAP-003-E1-S6).
2. **Where `NeedsYouKind` is declared.** Design 2.6's snippet declares `NeedsYouKind` in `needs-you.ts`; the story's Implementation (an approved story criterion source, above design snippets) declares it in `tiers.ts` "so `tiers.ts` does not import from `needs-you.ts`". The story governs: `tiers.ts` declares and exports it, and `needs-you.ts` (CAP-003-E1-S8) imports and may re-export it, which satisfies both.
3. **"Creates `status-badge.tsx`" vs the delivered file.** The story says this story creates `web/src/components/patterns/status-badge.tsx`; CAP-002 already delivered that file (four tiers, `{tier, children, title?, className?}`, classes imported from `web/src/screens/runs/outcome-badge.tsx`) and six CAP-002 files call it. The code fact governs the wording: this story rewrites the file in place. Its props are settled by established local precedent (constraint 9.5), not left open: the delivered `{ tier, children, title?, className? }` API is kept and widened to the six tiers, because (a) six delivered callers and their tests depend on it and are not this story's to edit, and (b) callers must render labels that are not `labelOf` outputs — `dataTileBadge`'s answer word *Mostly yes* (component design `home-ui` 2.4, `ui-components` 2.4) — so the badge cannot take a `Status` only. DAC-E1-2 ("render the `badge` `status-<tier>` variant with the label as text") is met by composing S1's `Badge`. Backlog review v4 FINDING-4 assumed `StatusBadge` takes a `Status`; that was a reviewer's reading, not a contract.

### Open Gaps

1. **How a check status names its check. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0308.** DAC-E1-S5-2 requires check `ok` to be labelled *No missing prices or gaps* or *All financials present* "by the caller's check", but design 2.3's `Status` member `{ of: "check"; status }` carries no check identity, and no artifact names the field or its values. Adopted (T003, T006): `{ of: "check"; check: "daily_prices" | "company_financials"; status: "ok" | "exceptions" }`; `tierOf` ignores `check`; `labelOf` uses it only for `ok`. Derivation: the values are the `data-health-api` §11 / `data-health-reader` wire keys of `checks {daily_prices, company_financials}`, which the caller already holds when it reads `checks.<key>.status`, so the call is `tierOf({ of: "check", check: key, status: checks[key].status })` with no mapping; naming the field after the wire object (`check`) matches the other members, which name their discriminating field after the domain value (`state`, `outcome`, `kind`). Consumers: CAP-003-E6-S1 (the *Daily prices* and *Company financials* check cards) and any later surface rendering a check result. Owning design to absorb it: component design `ui-components` section 2.3 (the `Status` type) at its next revision.

### Other Notes

- **Shapes come from `lucide-react`** (story Dependencies: "`lucide-react` for the shapes"), keeping the delivered geometry the CAP-002 tests pin: active `CircleDot` renders two `circle`s (`as-of-line.test.tsx` "ringed dot"), warning `Triangle` a `path` and critical `Square` a `rect` (`not-current-banner.test.tsx`). Lucide icons are stroke-only, and `<Circle fill="currentColor" />` puts `fill` on the `svg`, not on the `circle`, which fails the delivered `as-of-line.test.tsx` assertion that good's single child is a `circle` with `fill="currentColor"` and no `stroke`; hence good uses lucide's `Icon` with a one-circle `iconNode` carrying `fill` on the element. Should the installed `lucide-react` not export `Icon` (T001 check), draw good as an inline `svg` with `viewBox="0 0 24 24"`, the same classes and one `<circle cx="12" cy="12" r="10" fill="currentColor" />` child — the DOM T004 asserts is identical either way.
- **Filled vs hollow.** Design 2.3 fixes the shapes, not their fill. Neutral stays hollow (it must differ from good's filled circle); warning, serious and critical are filled with `fill="currentColor"`, as CAP-002's delivered warning and critical shapes are (local precedent).
- **`failed` on items.** Design 2.3's snippet makes `failed` optional on `{ of: "item" }`; it matters only for `download_not_complete`, where `failed: true` is critical and anything else (the interrupted case) serious, matching brief §12.2 "last download failed / interrupted — critical / serious". CAP-003-E1-S8 derives it from `latest_terminal_download.state`.
- **Runtime guard.** `assertNever` throws on a value outside the union (a wire value the types did not foresee) rather than rendering a status without a tier; types make it unreachable in checked code. No test exercises the throw beyond the type-level cases, because the throw is a defensive path the types already exclude.
- **Who consumes these exports.** CAP-003-E1-S7 imports `Tier` and calls `tierOf({ of: "scores", … })` for `dataTileBadge`; CAP-003-E1-S8 imports `Tier` and `NeedsYouKind`; CAP-003-E3-S7 renders the toast's outcome through `labelOf` / `tierOf` and `StatusBadge`; CAP-003-E5-S2 renders the data tile's answer word through `StatusBadge` with a caller label; CAP-003-E1-S10, taking over `as-of-line.tsx` concurrently, keeps importing `StatusBadge` and `StatusTier`, whose names and props this plan preserves.
- **`StatusTier` alias.** Kept only so the delivered CAP-002 callers compile unedited; new CAP-003 code imports `Tier` from `tiers.ts`. CAP-003-E7-S4 deletes `outcome-badge.tsx`, which this story stops importing.
- **`font-semibold`.** S1's `badge` base adds `font-semibold` to every badge; no delivered test asserts its absence, so CAP-002 badges gain the weight the badge spec gives them.
- **No self-contradicting scan.** S1's `token-literals.test.ts` scans every non-test file under `web/src/components/`, comments included: write no unit literal (no joined number-plus-`px`) and no `#` followed by hex digits in `tiers.ts` or `status-badge.tsx`; the `iconNode`'s `"12"` and `"10"` are unitless.
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `web/src/components/patterns/tiers.ts`: `function assertNever(value: never): never` → `function assertNever(value: unknown): never`
  - `web/src/components/patterns/tiers.ts`: `case "partial":` row tier `"warning"` → `"good"`
  - `web/src/components/patterns/tiers.ts`: `status.failed ? "critical" : "serious"` → `status.failed ? "serious" : "critical"`
  - `web/src/components/patterns/status-badge.tsx`: `warning: <Triangle` → `warning: <Diamond`
  - `web/src/components/patterns/status-badge.tsx`: good's `<Icon iconNode={FILLED_CIRCLE}` → `<Circle`
