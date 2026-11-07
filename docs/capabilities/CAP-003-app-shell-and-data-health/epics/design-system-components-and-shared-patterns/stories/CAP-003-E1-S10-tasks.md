---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S10-tasks
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
  timestamp: 2026-11-07T05:58:21Z
  source_artifacts:
    - id: CAP-003-E1-S10
      version: "1"
    - id: CAP-003-E1
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1"
    - id: CAP-003-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E1-S10 — Take Over as-of-line.tsx from CAP-002 and Generalise It to AsOfLine

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S10.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `ui-components`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-06

## Summary

The owner wants the as-of line built once, so that Home, Data health and Research show their freshness the same way (AC-26; blueprint §4.8). CAP-002 delivered `web/src/components/patterns/as-of-line.tsx` specialised to the Research as-of line (DEC-0073); its cross-capability gate (CAP-002 `classification-ui` merged, capability OQ-2) is satisfied in this clone, since the file and its 409-line `as-of-line.test.tsx` are present. This story takes the file over (component design `ui-components` 2.1, OQ-2 resolved 2026-10-25) and generalises it: `AsOfLine` gains a generic form that renders its parts in one `p` at `--text-xs` `--muted-foreground`, joined by *·* with `--space-2` either side, and the Research line is recomposed from that generic form so that it renders the same text and DOM as before and every delivered case passes unchanged (DAC-E1-13, DAC-E1-S10-1, DAC-E1-S10-2). It is the one delivered pattern file this epic edits rather than creates. The generic API shape (`parts`, discriminating it from the delivered Research props) is fixed by no artifact and is adopted provisionally as DEC-0315; CAP-003-E5-S1's Home header is its first consumer.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-26 | Every surface built from the design-system components; the as-of line is one pattern, not one per screen | T002, T003, T005, T006, T007 |
| DAC-E1-13 | `AsOfLine` is the generalisation of CAP-002's `as-of-line.tsx`, the Research as-of line composes it, and CAP-002's `as-of-line.test.tsx` cases for that line still pass | T001, T003, T005, T006, T007 |
| DAC-E1-S10-1 | `AsOfLine` with three parts renders them joined by *·* with `--space-2` either side in one `p` a screen reader reads as one line | T002, T004, T005 |
| DAC-E1-S10-2 | CAP-002's Research as-of line after the change: every delivered case passes unchanged | T001, T003, T006, T007 |

Mapped test cases (from `tests/component/ui-components-tests.md` lines 769-808, confirmed in `tests/coverage-matrix.md` lines 76, 108, 109): **TC-COMP-033** (AC-26, DAC-E1-S10-1, DAC-E1-13) and **TC-COMP-034** (AC-26, DAC-E1-S10-2, DAC-E1-13). The other cases on the AC-26 row belong to sibling and later stories. No integration or end-to-end case is owned by this story; the delivered CAP-002 end-to-end spec `tests/e2e/research-after-download.spec.ts` line 114 reads the line's text and is protected by keeping that text byte-identical (T006). The test specification is `status: draft`; its steps are used as written and sharpened in Phase 2.

## Phase 1: Setup

**Purpose**: Confirm the hard dependency is delivered and record the baseline the story must keep green.

- [ ] T001 From the repo root confirm CAP-003-E1-S1 is delivered — `web/src/components/ui/utils.ts` exports `cn()` and `web/src/components/token-literals.test.ts` exists with `"web/src/components/"` in `SCANNED_DIRECTORIES` — then run `npm run test` and record that `web/src/components/patterns/as-of-line.test.tsx` (all cases), `web/src/screens/research/results-pane.test.tsx`, `web/src/screens/research/research.test.tsx`, `web/src/screens/research/stocks/stock-evidence.test.tsx` and `web/src/components/token-literals.test.ts` pass before any change; record `sha256sum web/src/components/patterns/as-of-line.test.tsx` as the delivered fingerprint used by T007 (traces to DAC-E1-13, DAC-E1-S10-2)

**Checkpoint**: Baseline green; the delivered test file's fingerprint is recorded.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the generic line and the Research line's composition. All three tasks append to the same file and run in order; they add new `describe` blocks after the delivered line 409 and change no delivered line, import included (the delivered imports `render`, `screen`, `within`, `MemoryRouter` and `AsOfLine` already cover them; DAC-E1-S10-2).

### Mandatory Component Tests

- [ ] T002 Implement TC-COMP-033 (AsOfLine joins parts with a middle dot in one paragraph) as a new `describe("TC-COMP-033: AsOfLine joins parts with a middle dot in one paragraph (DAC-E1-S10-1)")` appended to `web/src/components/patterns/as-of-line.test.tsx`, each case marked `// Implements TC-COMP-033`. Fixture: the independent literal parts `["Market closed", "prices current to 2026-10-15", "checked 18:52:14 CDT"]` rendered as `<AsOfLine parts={[...]} />` inside `MemoryRouter`. Assert: (a) the container holds exactly one `p` and every part's text is inside it; (b) the `p`'s `textContent` with whitespace collapsed (`.replace(/\s+/g, " ").trim()`) equals the literal `"Market closed · prices current to 2026-10-15 · checked 18:52:14 CDT"`; (c) the `p` has exactly two separator elements — its child `span`s whose trimmed text is `·` — each carrying the classes `inline-block` and `px-2` (`px-2` is `var(--space-2)` through `tailwind.config.js` spacing key `2`), and none is `aria-hidden` (a hidden dot would drop the *·* from what a screen reader reads); (d) the `p` contains no `br`, `div` or second `p`, so it reads as one line; (e) the `p` has `text-xs` and `text-muted-foreground`. Edge case (one part): `parts={["Market closed"]}` renders `textContent` `"Market closed"` and no separator span — kills: off-by-one on the separator guard `index > 0` (→ `index >= 0` puts a leading *·*, failing the exact-text equality in (b) and the one-part edge), and remove-attribute on the separator's `px-2` class (fails (c))
- [ ] T003 Implement TC-COMP-034 (CAP-002 Research as-of line keeps passing its delivered tests) in `web/src/components/patterns/as-of-line.test.tsx` (same file as T002, so sequential) as a new `describe("TC-COMP-034: the Research as-of line composes AsOfLine (DAC-E1-S10-2, DAC-E1-13)")`, each case marked `// Implements TC-COMP-034`. TC-COMP-034's step "run the delivered test file unchanged" is T007; its expected result "the Research line composes `AsOfLine`" is sharpened here into an observable: render the delivered Research props (reuse the file's `renderLine` and `BASE`) and assert that the `as-of-line` `p` holds exactly one separator span (`inline-block px-2`, trimmed text `·`) without `sortLabel`, sitting between `Scores from 2026-10-15 17:46 CDT` and `from the download started`, and exactly two with `sortLabel: "value"`, the second immediately before `sorted by value`; and that the line's collapsed `textContent` with `sortLabel: "value"` still equals the literal `"Scores from 2026-10-15 17:46 CDT · from the download started 2026-10-15 17:30 CDT Complete · sorted by value"` — kills: a Research line that still writes `SCORE_SET.separator` as raw text instead of composing the generic's parts (zero separator spans; this is the delivered code, so the case is RED before T006), and swap-case on the sort clause appended as text rather than as a part (one span instead of two)

### Additional Unit Tests

- [ ] T004 Add a `describe("AsOfLine generic form: element parts, host classes, non-empty parts")` to `web/src/components/patterns/as-of-line.test.tsx` (same file, after T003): (1) element parts — `parts={[<span key="m">Market closed</span>, <a key="l" href="/data">prices current to 2026-10-15</a>]}` keeps both elements as direct children of the `p` in the given order with one separator span between them (no wrapper is added around a part, so the Research line's DOM stays as delivered) — kills: swap-case on part order (rendering `parts` reversed); (2) host classes — `className="min-h-7"` adds `min-h-7` while `text-xs` and `text-muted-foreground` remain, and the `p` keeps `data-testid="as-of-line"` — kills: drop-field-copy on `className` (the `cn()` call ignoring the host's class); (3) type contract — `// @ts-expect-error parts must be non-empty` above `<AsOfLine parts={[]} />` inside a never-called function, enforced by `npx tsc --noEmit` (test files are type-checked, `tsconfig.json` `include: ["web/src"]`) — kills: widening `parts` to `readonly ReactNode[]` (the directive becomes unused and `tsc` fails) (traces to DAC-E1-S10-1)

**Checkpoint**: T002–T004 fail (the generic form does not exist yet; `tsc` reports `parts` unknown) while the delivered cases in lines 1-409 still pass.

---

## Phase 3: Core Implementation

**Purpose**: Add the generic form to `AsOfLine` and recompose the Research line from it, in the one delivered file.

- [ ] T005 Add the generic form to `web/src/components/patterns/as-of-line.tsx` per DEC-0315 (Open Gap 1): export `interface AsOfLinePartsProps { parts: readonly [ReactNode, ...ReactNode[]]; className?: string }`; keep the delivered `export interface AsOfLineProps` byte-for-byte (its name, fields and doc comments); change the exported signature to `export function AsOfLine(props: AsOfLineProps | AsOfLinePartsProps): JSX.Element | null` and dispatch with `if ("parts" in props)`. The parts branch returns one `<p data-testid="as-of-line" className={cn("text-xs text-muted-foreground", props.className)}>` (import `cn` from `../ui/utils`, CAP-003-E1-S1) whose children are the parts in order, each part after the first preceded by `<span className="inline-block px-2">{SEPARATOR}</span>`, where a module constant `const SEPARATOR = " · ";` is the pattern's own (no screen import for the generic form). Render each part in a `Fragment` keyed by its index with `// biome-ignore lint/suspicious/noArrayIndexKey: parts are positional and never reorder.` (the delivered precedent is `web/src/screens/research/compare/index.tsx` line 75). Write a doc comment citing component design `ui-components` 2.1, blueprint §4.8, DAC-E1-13, DAC-E1-S10-1 and DEC-0315, and stating why the separator is an `inline-block` holding `" · "`: the spaces keep word boundaries in the text a screen reader and `textContent` read, and an inline-block drops collapsible spaces at the start and end of its own line, so the visible gap is the `--space-2` padding alone (traces to AC-26, DAC-E1-13, DAC-E1-S10-1)
- [ ] T006 Recompose the Research line in `web/src/components/patterns/as-of-line.tsx` (same file, after T005): move the delivered `AsOfLine` body into a module-private `function ResearchAsOfLine(props: AsOfLineProps): JSX.Element | null`, called from the non-`parts` branch of `AsOfLine`. Keep unchanged the `set === null` handling (null, or the `as-of-line-skeleton` `div` with `LINE_HEIGHT` while `loading`), `OUTCOME`, `LiveRegion`, `LINE_HEIGHT = "min-h-7"` and every copy and format import. Replace the hand-written `p` with `<AsOfLine parts={parts} className={LINE_HEIGHT} />`, where `parts` is: part 1 — `SCORE_SET.scoresFrom(produced)` minus the time, then the produced time in its `font-numeric` `span`; part 2 — `SCORE_SET.fromTheDownloadStarted(started)` minus the time, the `Link` exactly as delivered, `{" "}` and the outcome `StatusBadge`; part 3, only when `sortLabel !== undefined` — `SCORE_SET.sortedBy(sortLabel)`; then append to the last part, without a separator and in the delivered order, `{" "}` plus the `checked` `font-numeric` `span` (while building with a non-null `checkedAt`), `<LiveRegion …/>`, and `{" "}` plus the **Try again** `button` (while `pollFailed`). Split `SetSentence` into the two part builders accordingly; `SCORE_SET.separator` is no longer written by this file (the generic's `SEPARATOR` renders the same `" · "`). Update the file's top doc comment to say the file is taken over by CAP-003 `ui-components` (owner decision 2026-10-25) and that the Research line composes the generic `AsOfLine`; keep every delivered sentence of it that still holds. The resulting text is character-for-character the delivered text (Resolved Conflict 1 explains why the Research branch keeps its `screens/research` imports) (traces to AC-26, DAC-E1-13, DAC-E1-S10-2)

**Checkpoint**: T002–T004 pass and every delivered case in `as-of-line.test.tsx` passes with the file's delivered lines untouched.

---

## Phase 4: Integration

**Purpose**: Prove the Research screens and the AC-26 scans still hold, with no caller edited.

- [ ] T007 Run `npm run test` and confirm, unchanged: every case in `web/src/components/patterns/as-of-line.test.tsx` lines 1-409 (TC-COMP-034 step 1), `web/src/screens/research/results-pane.test.tsx` (locates the line by `data-testid="as-of-line"` and reads its text, lines 325, 383, 503), `web/src/screens/research/research.test.tsx` (lines 396, 573, 580, 835), `web/src/screens/research/stocks/stock-evidence.test.tsx` (line 450), `web/src/screens/research/copy.test.ts`, `web/src/components/patterns/not-current-banner.test.tsx`, `web/src/components/token-literals.test.ts` (CAP-003-E1-S1's literal scan over the edited file) and `web/src/api/render.test.tsx`. Then confirm the delivered test file was only appended to: `git diff -U0 -- web/src/components/patterns/as-of-line.test.tsx | grep -E '^-[^-]'` prints nothing and the first hunk starts after line 409; and that no caller or screen was edited: `git diff --exit-code -- web/src/screens web/src/app web/src/api` (the delivered caller `web/src/screens/research/results-pane.tsx` line 271 already renders `AsOfLine` with the Research props: Resolved Conflict 2) (traces to AC-26, DAC-E1-13, DAC-E1-S10-2)

**Checkpoint**: The whole Vitest suite is green; the only changed files are `as-of-line.tsx`, the appended `as-of-line.test.tsx`, and this story's TDD-evidence file.

---

## Phase 5: Polish

**Purpose**: Validation commands and TDD evidence.

- [ ] T008 Run `npm run lint`, `npm run format` (fix with `npx biome format --write web/src/components/patterns/as-of-line.tsx web/src/components/patterns/as-of-line.test.tsx` only), `npx tsc --noEmit` (proves T004's `@ts-expect-error` and that the delivered `BASE: AsOfLineProps` and `Partial<AsOfLineProps>` still type-check against the widened signature) and `npm run build` from the repo root; fix findings in this story's two files only (traces to AC-26, DAC-E1-S10-1, DAC-E1-S10-2)
- [ ] T009 After each TDD cycle in T002–T008 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E1-S10-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`; no per-cycle commit is planned. Cycles: (1) T002 + T004 + T005, the generic form; (2) T003 + T006, the Research line's composition; T007–T008 add no behaviour and join cycle 2's validation evidence (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E1-S1 | hard | `cn()` from `web/src/components/ui/utils.ts` (T005) and the literal scan `web/src/components/token-literals.test.ts` that checks the edited file (T007); existing graph edge `CAP-003-E1-S10: [CAP-003-E1-S1]` |
| CAP-003-E1-S5 | soft | Takes over `web/src/components/patterns/status-badge.tsx` concurrently. This story keeps the delivered import `StatusBadge, type StatusTier` from `./status-badge` and the delivered call shape `{tier, title?, children}`, whose DOM the delivered `as-of-line.test.tsx` lines 212-282 assert; S5 must keep that API or update this file's import in its own change. Neither story needs the other's code to be written |
| CAP-003-E5-S1 | reverse | Its `web/src/screens/home/header.tsx` renders the Home as-of line through the generic `AsOfLine` `parts` form this story adds (DEC-0315); graph edge `CAP-003-E5-S1 → CAP-003-E1-S10` already present |

No new hard edge is discovered; `dependencies.yaml` is unchanged.

### Task Dependencies

- T001: No dependencies
- T002 → T003 → T004: same file, sequential; after T001
- T005: Depends on T002, T004 (test first)
- T006: Depends on T003, T005
- T007: Depends on T006
- T008: Depends on T007
- T009: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities

- None within the story: every task edits one of two coupled files (`as-of-line.tsx`, `as-of-line.test.tsx`). The story as a whole runs in parallel with every other E1 story except CAP-003-E1-S5 touching the neighbouring `status-badge.tsx` (soft; no shared file).

---

## Validation Plan

### Constitution-Defined Commands

(`docs/constitution/tech-stack.md` v7 Validation Commands, working directory `.`)

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm run test` (Vitest, root `web`)
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit`

### Story-Specific Validation

- DAC-E1-S10-1: T002 and T004 pass; `npx tsc --noEmit` passes with T004's `@ts-expect-error` in place.
- DAC-E1-S10-2: the T001 fingerprint and `git diff -U0` of `as-of-line.test.tsx` show only appended lines after line 409; every delivered case passes (T007).
- DAC-E1-13: T003 passes (the Research line's dots are the generic's separator spans); `git diff --exit-code -- web/src/screens` (no caller edited); `grep -n "SCORE_SET.separator" web/src/components/patterns/as-of-line.tsx` prints nothing, because the separator is the generic's.
- AC-26: `web/src/components/token-literals.test.ts` passes over the edited file; `npm run build` succeeds.

---

## Notes

### Resolved Conflicts

1. **Layering vs the delivered test's import.** Component design `ui-components` 2.2 (normative prose) says "nothing imports a screen", and the delivered `as-of-line.tsx` imports `RESULTS`, `SCORE_SET`, `SHELL_ROUTES` from `web/src/screens/research/copy.ts` and `formatTimestamp` from `web/src/screens/research/format.ts`. Story DAC-E1-S10-2 and epic DAC-E1-13 require the delivered `as-of-line.test.tsx`, which imports `{ AsOfLine, type AsOfLineProps }` from `./as-of-line` and renders the Research line from data props alone (line 9, lines 57-72), to pass unchanged; so `as-of-line.tsx` must itself render the Research copy, and restating those strings would duplicate the copy catalogue (SA-DUP-001). Epic and story acceptance criteria govern design prose: the Research branch keeps its `screens/research` imports, and the generic form (T005) imports no screen. Follow-up for the next revision of component design `ui-components` 2.2: name `as-of-line.tsx`'s Research branch as the one sanctioned exception until `owner-web-app`'s rebuild moves the Research copy.
2. **"CAP-002's Research as-of line caller updated to compose `AsOfLine`"** (story Technical Details, Implementation). The delivered caller `web/src/screens/research/results-pane.tsx` line 271 already renders `<AsOfLine …/>` with the Research props, and every file under `web/src/screens/` is `owner-web-app`'s (DEC-0211). The acceptance criteria (DAC-E1-13: the Research line composes `AsOfLine`; DAC-E1-S10-2: it renders as before) are met by recomposing the Research line inside `as-of-line.tsx` (T006); the caller needs no edit, and none is made. The ACs and DEC-0211 govern the Technical Details bullet.
3. **"Run the delivered test file unchanged"** (TC-COMP-034) vs **"`as-of-line.test.tsx` (cases added for the generalised form)"** (story Implementation). Both hold: the new cases are appended as new `describe` blocks after line 409 and no delivered line, import included, changes (T002–T004, checked in T007).

### Open Gaps

1. **The generic `AsOfLine` API beside the delivered Research props. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0315.** No artifact gives the generic `AsOfLine`'s props, and the delivered `AsOfLine` name and `AsOfLineProps` type are already the Research line's. Adopted (T005, T006): `AsOfLine(props: AsOfLineProps | AsOfLinePartsProps)`, dispatching on `"parts" in props`; `AsOfLineProps` stays the delivered Research interface unchanged; the new exported `AsOfLinePartsProps` is `{ parts: readonly [ReactNode, ...ReactNode[]]; className?: string }`; the `parts` form renders one `p` with `data-testid="as-of-line"` and `text-xs text-muted-foreground` plus the host's `className`, each part after the first preceded by `<span className="inline-block px-2"> · </span>`; the Research form composes `<AsOfLine parts={…} className="min-h-7" />`. Derivation: DAC-E1-13 names the generic `AsOfLine` and requires the Research line to compose it; DAC-E1-S10-2 and TC-COMP-034 require the delivered test (which types `BASE` as `AsOfLineProps` with `set`, `later`, `checkedAt`, `pollFailed`, `onTryAgain`) to pass unchanged, so one exported name must accept both shapes and `AsOfLineProps` must keep the Research shape; `parts` is the vocabulary of DAC-E1-S10-1, TC-COMP-033 ("`AsOfLine` rendered with three parts") and component design 2.1 ("parts joined by ' · '"); the non-empty tuple follows TC-COMP-033, whose minimum is one part with no separator, while zero parts has no defined rendering; `className` exists because the Research line needs its delivered `min-h-7` (DEC-0154, skeleton parity) while the blueprint's line is otherwise only `--text-xs` `--muted-foreground`; `data-testid="as-of-line"` is the hook the delivered Research tests locate the line by. Rejected: renaming the Research line and editing the test's import (breaks "unchanged"); naming the generic differently (breaks DAC-E1-13 and TC-COMP-033); making `AsOfLineProps` itself a union (the delivered `BASE: AsOfLineProps` and `Partial<AsOfLineProps>` would then depend on union narrowing); moving the Research line under `web/src/screens/research/` (changes the test's import and edits `owner-web-app`'s directory, DEC-0211). Consumers: CAP-003-E5-S1 (Home header, *{market state} · prices current to {prices_as_of} · checked {time}*, whose market state may be a `badge` part) and the Data health verdict's as-of line (component design `data-health-ui`). Follow-up: component design `ui-components` 2.1 should state `AsOfLine`'s two prop shapes at its next revision.

### Other Notes

- **The separator's spacing is new for Research.** The delivered Research line wrote `" · "` as plain text (about a space's width either side). Composed from the generic form, its dots take the pattern's `--space-2` padding, as DAC-E1-S10-1 requires of the one as-of line. The text, the accessible text and every delivered assertion are unchanged; only the visible gap widens. This is expected, not a regression.
- **Why `inline-block`.** A plain `span` with `px-2` plus surrounding spaces would show a space and the padding on each side. Putting the spaces inside an `inline-block` keeps them in `textContent` and in the text a screen reader reads, while the inline-block's own line drops them visually. jsdom cannot observe layout, so T002 asserts the classes; check the line visually in `npm run build` output if in doubt.
- **No wrapper around parts.** Parts are rendered as given, inside a keyed `Fragment`, so the Research line's DOM keeps its delivered shape (text nodes, the `font-numeric` spans, the `Link`, the badge, the `output`). The end-to-end `page.getByText(/^Scores from \S+ \S+ C[SD]T/)` (`tests/e2e/research-after-download.spec.ts` line 114) still matches the `p` alone; wrapping part 1 in a `span` would match that span instead, so do not add one.
- **Literal scan over comments.** CAP-003-E1-S1's `token-literals.test.ts` scans every non-test file under `web/src/components/`, comments included: the doc comments T005 and T006 write must not contain a joined unit literal (write "8 px" with a space, or name the token `--space-2`), a hex colour, or `rgb(`/`hsl(` outside `var(`.
- **`cn()` and the classes used.** `text-xs` (font size) and `text-muted-foreground` (colour) are distinct tailwind-merge groups, and `min-h-7` merges with neither, so `cn()` keeps all three for the Research line (the delivered test at lines 400-405 and the `heightToken` helper at lines 92-98 check this).
- **Status badge.** CAP-003-E1-S5 rewrites `status-badge.tsx` concurrently; this story does not touch it. If S5 renames `StatusTier`, its change updates this file's import; the delivered assertions on the Research badges (lines 212-282) bind S5, not this story.
- **Reference doc.** `docs/reference/component-patterns.md` "The as-of line" (lines 248 onwards) describes the delivered inline flow; updating it to the composed form is doc-sync's step after review, not this plan's.
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `web/src/components/patterns/as-of-line.tsx`: `index > 0 ?` → `index >= 0 ?` (leading separator)
  - `web/src/components/patterns/as-of-line.tsx`: `const SEPARATOR = " · ";` → `const SEPARATOR = "   ";`
  - `web/src/components/patterns/as-of-line.tsx`: `className="inline-block px-2"` → `className="inline-block px-1"`
  - `web/src/components/patterns/as-of-line.tsx`: `cn("text-xs text-muted-foreground", props.className)` → `cn("text-xs text-muted-foreground")`
  - `web/src/components/patterns/as-of-line.tsx`: in `ResearchAsOfLine`, the `sortedBy` part → appended to part 2 as `` `${SEPARATOR}${SCORE_SET.sortedBy(sortLabel)}` `` text
