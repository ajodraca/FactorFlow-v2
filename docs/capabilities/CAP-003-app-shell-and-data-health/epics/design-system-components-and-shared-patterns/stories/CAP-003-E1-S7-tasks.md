---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S7-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-07
updated: 2026-11-07
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-07T06:03:46Z
  source_artifacts:
    - id: CAP-003-E1-S7
      version: "1"
    - id: CAP-003-E1
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-component-design-data-health-ui
      version: "1"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1"
    - id: CAP-003-E1-S5-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E1-S7 — worstDataTier and dataTileBadge: the One Data Verdict

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S7.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `ui-components`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Creates `web/src/components/patterns/worst-data-tier.ts`, the one place the data verdict is composed (component design `ui-components` 2.4; DEC-0210 and DEC-0217 as the owner amended them). It exports `TIER_ORDER`, the one six-tier order (critical, serious, warning, good, neutral, with active ranked alongside good) that `sortAttention` (CAP-003-E1-S8) imports so the verdict and the Needs-you sort cannot drift apart; `DataAnswer`; `worstDataTier({ affectedCount, followedCount, latestTerminalDownload })`, which returns `null` while no download has ever ended and otherwise the worst of the problem-set tier and the latest-terminal-download tier, with the word following the winning tier and the download clause returned whenever the latest terminal download failed or was interrupted; and `dataTileBadge(verdict, scores)`, Home's data tile badge, the worse of the verdict tier and the score-state tier (`tierOf` from CAP-003-E1-S5) with the label of whichever wins, a tie going to the verdict and `null` whenever the verdict is `null`. Data health's verdict (CAP-003-E6-S1) and Home's tile (CAP-003-E5-S2) both call these, so the two surfaces cannot disagree (AC-8, AC-11, AC-21). Pure functions; no endpoint, schema or storage.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-11 | The Data health verdict names how many followed stocks need attention with its severity tier; this story delivers the function that composes it | T002, T003, T004, T005, T006, T008 |
| AC-8 | Home's tile badge is the worse of the verdict tier and the score-state tier | T003, T006, T008 |
| AC-21 | Before any download has ended, no surface presents a verdict | T002, T003, T006 |
| DAC-E1-3 | `worstDataTier` returns `null` whenever `latestTerminalDownload` is null (any `affectedCount`); `dataTileBadge` returns `null` whenever the verdict is `null`, whatever the score state | T002, T003, T006 |
| DAC-E1-4 | Otherwise `worstDataTier` answers per the DAC-E1-4 table; worst input wins by the one order; the download clause is returned whenever the latest terminal download failed or was interrupted | T002, T005, T006 |
| DAC-E1-5 | `dataTileBadge` returns the worse of verdict and score-state tier with the winner's label; tie to the verdict; null, neutral or active score state never worsens or displaces the answer | T003, T005, T006 |
| DAC-E1-S7-1 | `worst-data-tier.test.ts` covers every DAC-E1-4 row, the `affectedCount >= followedCount > 0` critical case, `cancelled`/`partial` contributing no tier, and `dataTileBadge` over a `null` verdict returning `null` for `failed` and `not_current` | T002, T003 |
| DAC-E1-S7-2 | The tier order is one exported constant `TIER_ORDER` that `sortAttention` imports (DEC-0217) | T004, T005, T006, T007 |

Mapped test cases (from `tests/component/ui-components-tests.md`, confirmed in `tests/coverage-matrix.md` lines 66-68 and 101-102): **TC-COMP-001** (DAC-E1-5, AC-8), **TC-COMP-026** (DAC-E1-S7-1, DAC-E1-3, DAC-E1-4, AC-11, AC-21), **TC-COMP-027** (DAC-E1-S7-2, AC-11). The other cases on the AC-8, AC-11 and AC-21 rows (for example TC-COMP-035, 052, 128, 136, 156 and TC-INT-010, TC-INT-011) verify the screens and APIs that consume this story and belong to their own stories. No integration or end-to-end case is owned by this story. The test specification is `status: draft`; its steps are used as written and sharpened below.

## Phase 1: Setup

**Purpose**: Confirm the baseline and the hard dependency's exports.

- [x] T001 From the repo root run `npm ci` and `npm run test` and record the baseline green. Confirm CAP-003-E1-S5's deliverable is present: `web/src/components/patterns/tiers.ts` exports `type Tier` (six tiers), `type Status` with the member `{ of: "scores"; state: "never_classified" | "building" | "not_current" | "failed" | "current" }`, `tierOf(status: Status): Tier` and `labelOf(status: Status): string` (`grep -nE "export (type (Tier|Status)|function (tierOf|labelOf))" web/src/components/patterns/tiers.ts`), and that `RunState` is exported from `web/src/api/types.ts` (delivered, unchanged). If CAP-003-E1-S1's `web/src/components/token-literals.test.ts` is present, note that it will scan the new `worst-data-tier.ts`. No package is added by this story (traces to DAC-E1-4, DAC-E1-5)

**Checkpoint**: Baseline green; `Tier`, `Status`, `tierOf`, `labelOf` and `RunState` importable; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin the verdict table, the tile badge, the null cases and the single tier order before any production code exists.

All tests live in the one new file `web/src/components/patterns/worst-data-tier.test.ts` (story Implementation), so T002-T005 are sequential within it. Every expected value is an independent literal fixture (`{ tier, word, downloadClause }` objects and `{ tier, label, from }` objects written out by hand), never derived from `TIER_ORDER`, `tierOf` or `labelOf`, so a mutant in the code under test cannot cancel out. Assert with `toEqual` on the whole returned object (or `toBeNull()`), so tier, word, label, clause and `from` are each observed.

### Mandatory Component Tests

- [x] T002 Implement TC-COMP-026 (worst-data-tier.test covers every DAC-E1-4 row and the null cases) as `describe("worstDataTier (TC-COMP-026, DAC-E1-3, DAC-E1-4)")` in a new `web/src/components/patterns/worst-data-tier.test.ts`, with a `// Implements TC-COMP-026` comment. Cases, all `it.each` rows over `{ affectedCount, followedCount, latestTerminalDownload } → expected`: (a) **null before any download ended** (DAC-E1-3; TC edge "affected 3: null, never *Yes*"): `latestTerminalDownload: null` with `(0, 10)`, `(3, 10)` and `(10, 10)` each `toBeNull()`; (b) **problem-set rows** with `latestTerminalDownload: "succeeded"`: `(0, 10)` → `{ tier: "good", word: "Yes", downloadClause: null }`; `(3, 10)` and `(9, 10)` → `{ "warning", "Mostly yes", null }`; `(10, 10)` and `(1, 1)` → `{ "critical", "No", null }` (the `affectedCount >= followedCount > 0` boundary at equality); `(11, 10)` → `{ "critical", "No", null }` (the `>` side of `>=`); `(0, 0)` → `{ "good", "Yes", null }` (row "`affectedCount` 0", whatever `followedCount`); (c) **download rows**: `failed` with `(0, 10)`, `(3, 10)` and `(10, 10)` → `{ "critical", "No", "failed" }`; `abandoned` with `(0, 10)` and `(3, 10)` → `{ "serious", "Mostly yes", "interrupted" }` (serious beats warning, DEC-0217 as amended), and with `(10, 10)` → `{ "critical", "No", "interrupted" }` (the clause is returned "whichever input wins", DAC-E1-4); (d) **states that contribute no tier** (design 2.4 row "any other `latestTerminalDownload` state"): a fixture typed `Record<Exclude<RunState, "failed" | "abandoned">, true>` listing `requested`, `running`, `cancelling`, `succeeded`, `partial`, `cancelled` (so a `RunState` added later without a decision fails `npx tsc --noEmit`), each with `(0, 10)` → `{ "good", "Yes", null }` and `(3, 10)` → `{ "warning", "Mostly yes", null }` — the TC's "`cancelled` or `partial` contributes no tier" is two of these rows. Each row's `it` title names its inputs — kills: negate-boolean on the `latestTerminalDownload === null` guard (a); off-by-one `affectedCount >= followedCount` → `>` (b, `(10, 10)` and `(1, 1)`); off-by-one `affectedCount > 0` → `>= 0` for the warning branch (b, `(0, 10)`); swap-case of the abandoned tier `"serious"` → `"warning"` (c: `(3, 10)` then returns warning) and of its word `"Mostly yes"` → `"No"` (c); hand-written mutant returning the clause only when the download tier wins (c, `abandoned` with `(10, 10)`); swap-case giving `partial` a warning tier (d, `(0, 10)` then returns warning)
- [x] T003 Implement TC-COMP-001 (dataTileBadge takes the worse of verdict and score tier, tie to verdict) as `describe("dataTileBadge (TC-COMP-001, DAC-E1-5, DAC-E1-3)")` in `web/src/components/patterns/worst-data-tier.test.ts` (same file, after T002), with a `// Implements TC-COMP-001` comment. Verdict fixtures are written as literals of type `DataAnswer`, not built by `worstDataTier`: `GOOD = { tier: "good", word: "Yes", downloadClause: null }`, `WARNING = { tier: "warning", word: "Mostly yes", downloadClause: null }`, `SERIOUS = { tier: "serious", word: "Mostly yes", downloadClause: "interrupted" }`, `CRITICAL = { tier: "critical", word: "No", downloadClause: "failed" }`. Score states are `{ of: "scores", state }` literals. Cases (expected objects written out): TC steps — (1) `WARNING` + `failed` → `{ tier: "critical", label: "Score update failed", from: "scores" }`; (2) `WARNING` + `not_current` (a tie) → `{ tier: "warning", label: "Mostly yes", from: "verdict" }`; (3) `WARNING` + `null`, + `never_classified`, + `building`, + `current` → `{ "warning", "Mostly yes", "verdict" }`. Sharpened rows that tell the order apart: `GOOD` + `not_current` → `{ "warning", "Not reflecting the latest download", "scores" }` (a worse score state wins with its own label); `GOOD` + `building` → `{ "good", "Yes", "verdict" }` (active ranks alongside good, so it ties and the tie goes to the verdict — the one case that tells "active = good" from "active below good" and from "active above good"); `GOOD` + `never_classified` and `GOOD` + `null` → `{ "good", "Yes", "verdict" }`; `GOOD` + `current` → `{ "good", "Yes", "verdict" }` (tie); `SERIOUS` + `not_current` → `{ "serious", "Mostly yes", "verdict" }` (serious outranks warning); `SERIOUS` + `failed` → `{ "critical", "Score update failed", "scores" }`; `CRITICAL` + `failed` → `{ "critical", "No", "verdict" }` (tie at critical). TC edge / DAC-E1-3: `dataTileBadge(null, s)` is `null` for `s` = `null` and every one of the five score states (`it.each` over a `Record<Extract<Status, { of: "scores" }>["state"], true>` fixture, so a new score state must be listed), `failed` and `not_current` named explicitly in the titles (DAC-E1-S7-1) — kills: off-by-one on the tie comparison (`<` → `<=`, so the score state wins ties: step 2, `GOOD` + `current`, `CRITICAL` + `failed`); hand-written mutant ranking `active` with `warning` (`GOOD` + `building` returns the scores); swap-case of the winner's label (`label: verdict.word` when the scores win: step 1); negate-boolean on the `verdict === null` guard (the null rows throw or return the score state)

### Additional Unit Tests

- [x] T004 Implement TC-COMP-027 (TIER_ORDER is one exported constant shared by sortAttention) as `describe("TIER_ORDER is the one tier order (TC-COMP-027, DAC-E1-S7-2)")` in `web/src/components/patterns/worst-data-tier.test.ts` (same file, after T003), with a `// Implements TC-COMP-027` comment. The TC's "grep" steps are automated as a source scan in the style of the delivered `web/src/api/render.test.tsx` (`readdirSync` walk of `web/src/` resolved from `import.meta.url`; Vitest's root is `web/`), over non-test sources only (`.ts`/`.tsx` not matching `\.test\.tsx?$`), each read with `//` line comments and `/* … */` block comments stripped first (so a doc comment that names `TIER_ORDER`, such as the one T006 writes, is neither a declaration nor a consumer). Cases: (a) the walk finds more than zero files and exactly one file declares `TIER_ORDER` (`/\b(?:const|let|var)\s+TIER_ORDER\b/`), and that file is `components/patterns/worst-data-tier.ts`, where `/export\s+const\s+TIER_ORDER\b/` matches exactly once (TC step 1); (b) every other non-test source that mentions `TIER_ORDER` imports it from the module (`/import\s*(?:type\s*)?\{[^}]*\bTIER_ORDER\b[^}]*\}\s*from\s*["'][^"']*\/worst-data-tier["']/`), collecting offenders and asserting `toEqual([])` — this guards every future consumer, `needs-you.ts` included; (c) `it.runIf(existsSync(<web/src/components/patterns/needs-you.ts>))("sortAttention's module imports TIER_ORDER from ./worst-data-tier")` asserting the import regex of (b) matches `needs-you.ts` (TC step 2): it is skipped until CAP-003-E1-S8 creates that file and then runs without any edit to this test (Other Notes); (d) "a second order literal: review rejects it" (TC edge) is automated: a module-local helper `tierOrderLiteralsIn(source: string): string[]` returns matches of an array of three or more consecutive tier-name strings (`/\[\s*(["'])(critical|serious|warning|good|active|neutral)\1\s*,\s*(["'])(critical|serious|warning|good|active|neutral)\3\s*,\s*(["'])(critical|serious|warning|good|active|neutral)\5/`) or of two consecutive tier keys with numeric values (`/\b(critical|serious|warning|good|active|neutral)\s*:\s*-?\d+\s*,\s*(critical|serious|warning|good|active|neutral)\s*:\s*-?\d+/`); planted-source cases prove it non-vacuous (`const ORDER = ["critical", "serious", "warning"]` → one match; `{ critical: 0, serious: 1 }` → one match; `type Tier = "neutral" | "active" | "good"` → none, so `tiers.ts`'s union is not flagged; `{ active: 2, retired: 1 }` → none); then every non-test source other than `worst-data-tier.ts` yields `[]` — kills: hand-written mutant adding a local `const TIER_ORDER = …` in another source file (a); remove-attribute of the `export` on `TIER_ORDER` (a); a consumer re-declaring its own order array (d). (traces to DAC-E1-S7-2, AC-11)
- [x] T005 Write the order-semantics test as `describe("TIER_ORDER semantics (DEC-0217, DEC-0311)")` in `web/src/components/patterns/worst-data-tier.test.ts` (same file, after T004). Against independent literal relations, not the constant's own numbers: (a) `Object.keys(TIER_ORDER).sort()` equals `["active", "critical", "good", "neutral", "serious", "warning"]`; (b) strict ranks `TIER_ORDER.critical < TIER_ORDER.serious < TIER_ORDER.warning < TIER_ORDER.good < TIER_ORDER.neutral` (chain asserted pairwise); (c) `TIER_ORDER.active === TIER_ORDER.good`; (d) sorting the literal list `["neutral", "good", "critical", "active", "warning", "serious"]` with `(a, b) => TIER_ORDER[a] - TIER_ORDER[b]` (a stable `Array.prototype.sort`) yields `["critical", "serious", "warning", "good", "active", "neutral"]` — the way CAP-003-E1-S8's `sortAttention` consumes it (ascending rank = more severe first); (e) `Object.isFrozen(TIER_ORDER)` is true, so no caller can reorder the one order at run time (traces to DAC-E1-S7-2, DAC-E1-4, DAC-E1-5) — kills: off-by-one on any rank (`active: 3` → `active: 4` fails (c); `serious: 1` → `serious: 2` fails (b)); swap-case of two keys' ranks (b, d); remove-attribute of the `Object.freeze` call (e)

**Checkpoint**: Phase 2 tests written and failing: `worst-data-tier.ts` does not exist, so the file fails to import; once a stub exists, T004 (a) and T005 still fail until `TIER_ORDER` is exported and frozen.

---

## Phase 3: Core Implementation

**Purpose**: Write the one tier order and the two verdict functions.

- [x] T006 Create `web/src/components/patterns/worst-data-tier.ts` (component design `ui-components` 2.4; DEC-0210, DEC-0217 as amended). Imports, types only where possible: `import type { RunState } from "../../api/types"`; `import { type Status, type Tier, labelOf, tierOf } from "./tiers"` (CAP-003-E1-S5). Exports:
  - `export const TIER_ORDER: Readonly<Record<Tier, number>> = Object.freeze({ critical: 0, serious: 1, warning: 2, good: 3, active: 3, neutral: 4 })` — DEC-0311 (Open Gap 1): ascending rank is severity order, lower is worse; doc comment states it is the one six-tier order of the owner interface (DEC-0217 as amended; blueprint 4.1; UX design 1.3 "active sorts with good"), that `sortAttention` (`needs-you.ts`) imports it, and that no other order may be declared (TC-COMP-027).
  - `export type DataAnswer = { tier: "good" | "warning" | "serious" | "critical"; word: "Yes" | "Mostly yes" | "No"; downloadClause: "failed" | "interrupted" | null }` (design 2.4 verbatim; the caller composes the sentence text from `downloadClause`, data-health-ui 2.3).
  - `export function worstDataTier(inputs: { affectedCount: number; followedCount: number; latestTerminalDownload: RunState | null }): DataAnswer | null`: return `null` when `latestTerminalDownload === null` (DAC-E1-3, whatever `affectedCount`). Problem tier: `affectedCount === 0` → good; else `affectedCount >= followedCount` → critical (this includes `followedCount` 0, DEC-0312, Open Gap 2); else warning. Download tier and clause: `failed` → critical, clause `"failed"`; `abandoned` → serious, clause `"interrupted"`; every other state → no tier, clause `null`. The answer tier is the input with the lower `TIER_ORDER` rank (no download tier means the problem tier). Word from the winning tier: good *Yes*, warning and serious *Mostly yes*, critical *No* (a module-local `Record<DataAnswer["tier"], DataAnswer["word"]>`). `downloadClause` is set from the download alone, whichever input wins.
  - `export function dataTileBadge(verdict: DataAnswer | null, scores: Extract<Status, { of: "scores" }> | null): { tier: Tier; label: string; from: "verdict" | "scores" } | null`: `null` when `verdict === null`, whatever `scores` (DAC-E1-3). When `scores` is `null` → `{ tier: verdict.tier, label: verdict.word, from: "verdict" }`. Otherwise the scores win only when `TIER_ORDER[tierOf(scores)] < TIER_ORDER[verdict.tier]` (strictly worse; a tie goes to the verdict), returning `{ tier: tierOf(scores), label: labelOf(scores), from: "scores" }`; else the verdict object above (DAC-E1-5).
  Module doc comment cites component design 2.4, DAC-E1-3/4/5, AC-8, AC-11, AC-21 and states that the checks' tiers do not feed the answer (DEC-0210 as amended) and that Not determinable is not an answer of this function (design 2.4). No unit literal (number joined to `px`, `rem`, `em`, `vh`, `vw`) and no `#` followed by hex digits anywhere in the file, comments included (CAP-003-E1-S1's literal scan reads it). Depends on T002-T005 (makes them pass)

**Checkpoint**: T002-T005 pass (T004 (c) reported as skipped while `needs-you.ts` does not exist); `worst-data-tier.ts` exports exactly `TIER_ORDER`, `DataAnswer`, `worstDataTier`, `dataTileBadge`.

---

## Phase 4: Integration

**Purpose**: Prove the new module sits cleanly in the delivered suite and the shared scans.

- [x] T007 Run, unchanged, the whole Vitest suite (`npm run test`), including `web/src/components/patterns/tiers.test.ts` and `status-badge.test.tsx` (CAP-003-E1-S5), `web/src/components/token-literals.test.ts` (CAP-003-E1-S1, if present: it scans `worst-data-tier.ts`) and `web/src/api/render.test.tsx`. Confirm with `git diff --stat` and `git status --short web/` that the only source files changed or added are `web/src/components/patterns/worst-data-tier.ts` and `worst-data-tier.test.ts`: `tiers.ts`, `package.json`, `web/src/api/types.ts` and everything under `web/src/app/` and `web/src/screens/` unchanged (traces to DAC-E1-S7-2, AC-11)

**Checkpoint**: Whole Vitest suite green; no delivered file or sibling story's file edited.

---

## Phase 5: Polish

**Purpose**: Validation commands and TDD evidence.

- [x] T008 Run `npm run lint`, `npm run format` (fix with `npx biome format --write web/src/components/patterns/worst-data-tier.ts web/src/components/patterns/worst-data-tier.test.ts` only), `npx tsc --noEmit` (enforces the `Record<…>` completeness of T002 (d) and T003's null-verdict fixture, and the `DataAnswer` literal types of T003's verdict fixtures) and `npm run build` from the repo root. Then the manual form of TC-COMP-027's edge: add `const TIER_ORDER = ["critical"];` to a temporary `web/src/components/patterns/planted-order.ts`, confirm `npm run test -- worst-data-tier` fails naming that file, and delete it (traces to DAC-E1-S7-2, AC-11)
- [x] T009 After each TDD cycle in T002–T008 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E1-S7-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`; no per-cycle commit is planned. Cycles: (1) T004 + T005 + the `TIER_ORDER` part of T006 (the one order); (2) T002 + the `DataAnswer` / `worstDataTier` part of T006 (the verdict); (3) T003 + the `dataTileBadge` part of T006 (the tile badge); T007-T008 add no behaviour and join cycle 3's validation evidence (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E1-S5 | hard | `worst-data-tier.ts` imports `Tier`, `Status`, `tierOf` and `labelOf` from `web/src/components/patterns/tiers.ts`, which S5 creates (S5 plan T006); existing graph edge |
| CAP-003-E1-S1 | context | Its `token-literals.test.ts` scans `worst-data-tier.ts` (no unit literal may be written); this story imports nothing S1 creates. S1 is already upstream through S5 |
| CAP-003-E1-S8 | reverse | `sortAttention` in `needs-you.ts` imports `TIER_ORDER` (DAC-E1-S7-2; S8 story Dependencies); edge S8 → S7 present |
| CAP-003-E5-S2 | reverse | Home's `data-tile.tsx` calls `worstDataTier` and `dataTileBadge` (home-ui 2.4); edge E5-S2 → E1-S7 present |
| CAP-003-E6-S1 | reverse | Data health's `verdict.tsx` calls `worstDataTier` and composes the sentence from `DataAnswer.downloadClause` (data-health-ui 2.3); edge E6-S1 → E1-S7 present |

No hard dependency beyond the existing `CAP-003-E1-S7: [CAP-003-E1-S5]`; no edge is added.

### Task Dependencies

- T001: No dependencies
- T002 → T003 → T004 → T005: same file, sequential; after T001
- T006: Depends on T002-T005 (built cycle by cycle per T009: `TIER_ORDER`, then `worstDataTier`, then `dataTileBadge`)
- T007: Depends on T006
- T008: Depends on T007
- T009: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities

- None within the story: one test file and one source file, and each cycle builds on the previous one (`worstDataTier` and `dataTileBadge` both rank through `TIER_ORDER`).

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

- DAC-E1-3 / AC-21: T002 (a) and T003's null-verdict rows pass — no `null` latest terminal download yields an answer, and no score state reaches the tile without a verdict.
- DAC-E1-4 / AC-11 / DAC-E1-S7-1: T002 (b)-(d) pass, including `(10, 10)` and `(1, 1)` critical, `cancelled` and `partial` contributing no tier, and the interrupted clause returned under a critical problem-set answer.
- DAC-E1-5 / AC-8: T003 passes, including the tie at warning (*Mostly yes*), `GOOD` + `building` staying *Yes*, and `GOOD` + `not_current` returning *Not reflecting the latest download*.
- DAC-E1-S7-2: T004 and T005 pass; `grep -rnE "(const|let|var) TIER_ORDER\b" web/src --include=*.ts --include=*.tsx | grep -v "\.test\."` prints exactly one line, in `web/src/components/patterns/worst-data-tier.ts`; T008's planted second order fails the suite.
- AC-26 (S1's scan, when present): `token-literals.test.ts` passes over `worst-data-tier.ts`.

---

## Notes

### Resolved Conflicts

1. **AC-21 wording: "ended" vs "run".** Capability AC-21 reads "before any download has run"; this story restates it as "before any download has ended". Epic DAC-E1-3 (above the story) and component design 2.4 key the null answer on `latestTerminalDownload === null`, which is the same condition (DEC-0210 as amended: never-acquired replaces the verdict until a download ends). Not a contradiction; the plan keys on `latestTerminalDownload === null` (T002 (a), T006).
2. **DEC-0210 / DEC-0217 agent text vs owner decision.** Both records' `decision:` bodies (checks' tiers feeding the verdict; serious answering *No*) were superseded by the owner's upheld decisions (problem set and latest terminal download only; serious answers *Mostly yes* with the interrupted clause). Epic DAC-E1-3/4/5 and component design 2.4 carry the owner's version and govern; the plan implements them (T002 (c), T006).
3. **Positional shorthand in a consumer story.** CAP-003-E5-S2's Description writes `worstDataTier(problems.stock_count, followed_count, latest_terminal_download.state)`; this story's Description, Acceptance Criteria and component design 2.4 fix the object signature `worstDataTier({ affectedCount, followedCount, latestTerminalDownload })`. The story and design govern this module's interface; E5-S2's wording is prose shorthand for the same three inputs, and its caller passes `latest_terminal_download?.state ?? null`.

### Open Gaps

1. **The shape of `TIER_ORDER`. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0311.** DAC-E1-S7-2 requires "one exported constant `TIER_ORDER`" and DEC-0217 (as amended) fixes its semantics — critical, serious, warning, good, neutral, with active ranked alongside good — but no artifact fixes the constant's type, and a plain array cannot express that active ties with good. Adopted (T005, T006): `export const TIER_ORDER: Readonly<Record<Tier, number>> = Object.freeze({ critical: 0, serious: 1, warning: 2, good: 3, active: 3, neutral: 4 })`, lower rank = more severe, consumed as `TIER_ORDER[a] - TIER_ORDER[b]` for an ascending sort (most severe first) and `TIER_ORDER[x] < TIER_ORDER[y]` for "x is worse". Derivation: a `Record<Tier, number>` is exhaustive over `Tier` at type-check time (a seventh tier without a rank fails `npx tsc --noEmit`), expresses the active/good tie as equal ranks, and is directly usable as a sort key by `sortAttention` (design 2.6: "orders by critical, serious, warning, good, neutral, with active sorting with good … stable for equal keys") with `Array.prototype.sort`'s stability; consecutive integers from 0 follow the order's listing. Consumers: CAP-003-E1-S8 (`sortAttention`) — its plan must sort ascending by this rank. Owning design to absorb it: component design `ui-components` section 2.4 (where `TIER_ORDER` belongs beside `worstDataTier`) and 2.6 (`sortAttention`), at its next revision.
2. **Some stocks affected while none is followed. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0312.** Design 2.4's rows are "`affectedCount` 0" (good), "above 0, below `followedCount`" (warning) and "`affectedCount` ≥ `followedCount` > 0" (critical); `affectedCount > 0` with `followedCount === 0` matches no row, yet the function must return something. The case is unreachable on consistent reads: the problem set counts only active followed stocks (data-health-reader 2.4, DEC-0201), so `affected_count ≤ followed_count`. Adopted (T006): such an input answers critical *No* — the problem tier is `affectedCount === 0 ? good : affectedCount >= followedCount ? critical : warning`. Derivation: design 2.4 already uses `≥` so that an `affectedCount` above `followedCount` is critical, and an inconsistent read should never read better than the data (the reasoning DEC-0210 as amended applies to never-acquired data); taking the worse tier keeps the verdict honest. No test pins the unreachable input beyond the `(11, 10)` row of the `>` side; the coding agent need not add one. Contained to this module. Owning design to absorb it: component design `ui-components` section 2.4 (the verdict table), at its next revision.

### Other Notes

- **TC-COMP-027's second step and CAP-003-E1-S8.** "`sortAttention` imports `TIER_ORDER`" cannot be observed until S8 creates `needs-you.ts` (S8 hard-depends on this story). T004 (b) guards every consumer unconditionally, and T004 (c) is an `it.runIf` on the file's existence, so S8's landing activates it without editing this test. S8's plan should keep both green and import `TIER_ORDER` (not a copy) from `./worst-data-tier`.
- **Labels.** The verdict's label is its answer word (*Yes*, *Mostly yes*, *No*); the scores' label is `labelOf(scores)` (*Score update failed*, *Not reflecting the latest download*). This module renders nothing and composes no sentence: `downloadClause` is a key, and CAP-003-E6-S1 turns it into *, and the last download failed.* / *, and the last download was interrupted.* (data-health-ui 2.3). `StatusBadge` (CAP-003-E1-S5) renders the tile badge from `{ tier, label }`.
- **Scope of the return tier.** `dataTileBadge` can return `neutral` or `active` only if the verdict could, which it cannot (`DataAnswer.tier` is good or worse); the return type stays `Tier` as the design declares.
- **Inputs outside the domain.** Negative or fractional counts are not produced by the wire (`followed_count`, `affected_count`, `problems.stock_count` are counts); no guard is added. A non-terminal `RunState` passed as `latestTerminalDownload` (the wire field only carries terminal states) falls in design 2.4's "any other state: no tier" row and is tested as such (T002 (d)).
- **No self-contradicting scan.** CAP-003-E1-S1's `token-literals.test.ts` reads every non-test file under `web/src/components/`, comments included; T004 (d)'s planted literals live in the test file, which neither scan reads. T004 (d)'s numeric-record pattern does not match `worst-data-tier.ts` because that file is excluded by name, and it matches no delivered non-test source (checked at HEAD `996f8a3`: the only `active: <n>` records are in `universes.test.tsx`, a test file).
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `web/src/components/patterns/worst-data-tier.ts`: `active: 3` → `active: 2`
  - `web/src/components/patterns/worst-data-tier.ts`: `TIER_ORDER[tierOf(scores)] < TIER_ORDER[verdict.tier]` → `TIER_ORDER[tierOf(scores)] <= TIER_ORDER[verdict.tier]`
  - `web/src/components/patterns/worst-data-tier.ts`: the `downloadClause` assignment → set only when the download tier wins (`downloadWins ? clause : null`)
  - `web/src/components/patterns/worst-data-tier.ts`: `affectedCount >= followedCount` → `affectedCount > followedCount`
  - `web/src/components/patterns/worst-data-tier.ts`: `serious: "Mostly yes"` → `serious: "No"`
