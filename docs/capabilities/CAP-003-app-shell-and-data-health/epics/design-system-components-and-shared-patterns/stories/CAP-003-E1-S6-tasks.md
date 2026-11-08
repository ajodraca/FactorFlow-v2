---
artifact_schema_version: 1
artifact_id: CAP-003-E1-S6-tasks
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
  timestamp: 2026-11-07T05:55:56Z
  source_artifacts:
    - id: CAP-003-E1-S6
      version: "1"
    - id: CAP-003-E1
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-ui-components-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E1-S6 — Presence Renderings and the America/Chicago Formatters

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/design-system-components-and-shared-patterns/stories/CAP-003-E1-S6.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `ui-components`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-06

## Summary

Creates the two shared pattern modules every CAP-003 surface uses to keep present, absent and not determinable apart and to show every time in America/Chicago with its zone (component design `ui-components` 2.5; UX design 0.7; STD-UI-3, STD-UI-4, STD-UI-5, STD-UI-14). `web/src/components/patterns/presence.tsx` exports `Absent` (an em dash in `--value-missing`, hidden from assistive technology, with visually hidden words naming what is absent; never `0`, never blank) and `NotDeterminable` (the vendored `badge` `coverage-unknown` from CAP-003-E1-S1, worded *Not determinable* or the caller's label, carrying `--pattern-indeterminate`, with its reason beside it and in its accessible description). `web/src/components/patterns/format.ts` exports `formatInstant` (`YYYY-MM-DD HH:MM zone`, with seconds on request), `formatClock` (`HH:MM:SS zone`), `formatSessionDate` (a calendar date unconverted), `formatCount` (thousands separators) and `formatDownloadName` (*Download {YYYY-MM-DD HH:MM zone}* from the start time, else the request time: the permanent naming of capability OQ-1). Instants are built from `Intl.DateTimeFormat` parts in `en-US` with `timeZone: "America/Chicago"` and `timeZoneName: "short"`, so the zone reads *CDT* or *CST* as the instant falls and the viewer's machine zone is never read. The delivered `formatTimestamp` in `web/src/app/status-region.tsx` is not touched (system design assumption 5).

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-24 | Present, absent and not determinable kept apart in every data-bearing region; this story delivers the presence renderings | T003, T004, T007, T008 |
| AC-25 | Every polled region shows its last-updated time; this story delivers `formatClock` for *checked {time}* (and the instant formatters) | T001, T002, T005, T006, T008 |
| AC-8 | Home's data tile (TC-COMP-025 traces here): a value no artifact can determine renders through `NotDeterminable`, never as a passed check | T003, T007 |
| DAC-E1-8 | `Absent` is an em dash with hidden text, never `0` and never blank; `NotDeterminable` is `badge` `coverage-unknown` with its reason, never a dimmed absent and never a passed check | T003, T004, T007, T008 |
| DAC-E1-9 | `formatInstant`, `formatClock`, `formatSessionDate`, `formatCount`, `formatDownloadName` render in America/Chicago with *CDT* or *CST*, from `Intl.DateTimeFormat` parts, never a locale format | T001, T002, T005, T006, T008 |
| DAC-E1-S6-1 | October instant → *CDT*, January → *CST*; seconds only with `{ seconds: true }`; `2026-03-08` unshifted through `formatSessionDate` | T001, T005, T006 |
| DAC-E1-S6-2 | `formatCount(1236)` → *1,236*; `formatDownloadName` uses `requested_at` when `started_at` is null | T002, T005, T006 |
| DAC-E1-S6-3 | `NotDeterminable` with a reason: the reason is its accessible description; its badge is `coverage-unknown`, never `status-good` | T003, T007 |

Mapped test cases (from `tests/component/ui-components-tests.md`, confirmed in `tests/coverage-matrix.md` rows DAC-E1-8, DAC-E1-9, DAC-E1-S6-1 to DAC-E1-S6-3): **TC-COMP-023** (DAC-E1-S6-1, DAC-E1-9, AC-25), **TC-COMP-024** (DAC-E1-S6-2, DAC-E1-9, AC-25), **TC-COMP-025** (DAC-E1-S6-3, DAC-E1-8, AC-24, AC-8). The other cases on the AC-8, AC-24 and AC-25 rows belong to sibling and screen stories. No integration or end-to-end case is owned by this story. The test specification is `status: draft`; its steps are used as written and sharpened into literal assertions below.

## Phase 1: Setup

No setup: no package, configuration or token is added. `badge` and `cn()` come from CAP-003-E1-S1 (hard edge); `react` (`useId`) is delivered.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin the formatters' exact output and the presence renderings' DOM before any production code.

### Mandatory Component Tests

- [x] T001 [P] Implement TC-COMP-023 (formatInstant zones CDT/CST, optional seconds, session dates unshifted) in a new `web/src/components/patterns/format.test.ts`, with a `// Implements TC-COMP-023` comment, following the delivered TZ-pinning precedent of `web/src/screens/research/format.test.ts` lines 117-177. Assert against independent literal strings, never against another formatter's output: `formatInstant("2026-10-15T22:46:00Z")` is `"2026-10-15 17:46 CDT"`; `formatInstant("2026-01-15T23:46:00Z")` is `"2026-01-15 17:46 CST"`; `formatInstant("2026-10-15T22:52:10Z", { seconds: true })` is `"2026-10-15 17:52:10 CDT"` and `formatInstant("2026-10-15T22:52:10Z", { seconds: false })` is `"2026-10-15 17:52 CDT"`; the same October instant passed as `new Date("2026-10-15T22:46:00Z")` gives the same string (both input forms, DEC-0309); the autumn change `"2026-11-01T06:30:00Z"` → `"2026-11-01 01:30 CDT"` and `"2026-11-01T07:30:00Z"` → `"2026-11-01 01:30 CST"`; midnight `"2026-10-16T05:00:00Z"` → `"2026-10-16 00:00 CDT"` (never `24`); `formatSessionDate("2026-03-08")` is `"2026-03-08"`. Then a `describe.each(["Asia/Tokyo", "UTC", "America/Los_Angeles"])` block that sets and restores `process.env.TZ` in `beforeEach`/`afterEach` exactly as the precedent does and repeats the October, January and `2026-03-08` assertions (story Implementation: "Tests pin `TZ` independence"; TC edge "a locale format is never used": a locale format would print `10/15/2026` or a 12-hour clock and fail the literal) — kills: remove-attribute of `timeZone: "America/Chicago"` (the machine zone under TZ=Asia/Tokyo prints `2026-10-16 07:46 JST`); swap-case `timeZoneName: "short"` → `"long"` (*Central Daylight Time* ≠ *CDT*); remove-attribute of `hourCycle: "h23"` (en-US falls back to a 12-hour clock, `05:46`); negate-boolean on the `seconds` option (seconds appear by default or never); a `formatSessionDate` mutant that routes the date through `Date` (UTC midnight renders `2026-03-07` in Chicago)
- [x] T002 [P] Implement TC-COMP-024 (formatCount separators; formatDownloadName falls back to requested_at) in `web/src/components/patterns/format.test.ts` (same file as T001, so sequential with it), with a `// Implements TC-COMP-024` comment. `formatCount`: `1236` → `"1,236"`, `0` → `"0"` (a measured zero, STD-UI-4), `999` → `"999"`, `1000` → `"1,000"`, `1234567` → `"1,234,567"`. `formatDownloadName(null, "2026-10-15T22:46:00Z")` is `"Download 2026-10-15 17:46 CDT"` (started_at null → requested_at); TC edge, started_at set: `formatDownloadName("2026-01-15T23:46:00Z", "2026-01-15T23:40:00Z")` is `"Download 2026-01-15 17:46 CST"` (the start time, never the request time; the two instants differ by six minutes so the order is observable) — kills: off-by-one on the grouping width (`{3}` → `{4}` prints `1236`); swap-case of the fallback order (`requestedAt ?? startedAt` prints `17:40` in the edge case); drop-field-copy of the `Download ` prefix
- [x] T003 [P] Implement TC-COMP-025 (NotDeterminable carries its reason and the coverage-unknown badge) in a new `web/src/components/patterns/presence.test.tsx`, with a `// Implements TC-COMP-025` comment, using React Testing Library. Render `<NotDeterminable reason="Gap detection needs at least two stocks with data in range." />`. Step 1: the element `getByText("Not determinable")` returns `toHaveAccessibleDescription("Gap detection needs at least two stocks with data in range.")`; the reason is also visible text beside the badge (`getByText(reason)` is not inside the badge element and has no `sr-only` class). Step 2: the badge element has `data-variant="coverage-unknown"` (literal), never `"status-good"` and never `"coverage-absent"`, and carries the classes `bg-pattern-indeterminate`, `bg-value-indeterminate-muted` and `text-value-indeterminate` (both background classes survive `cn()`, CAP-003-E1-S1 plan Other Notes), and not `text-value-missing` and no `opacity-*` class (never a dimmed absent, DAC-E1-8). With `label="Unknown"` the badge reads *Unknown* and is still `coverage-unknown` with the same description (DAC-E1-8 "or a caller's label"). Two `NotDeterminable`s rendered side by side each describe themselves by their own reason (ids are unique). TC edge (`Absent`, DAC-E1-8): `render(<Absent label="No closing price" />)`: the container's text is `"—No closing price"`; the em dash sits in an element with `aria-hidden="true"`; `getByText("No closing price")` has class `sr-only`; the outer element has class `text-value-missing`; the container's text content contains no `0` and is not empty — kills: remove-attribute of `aria-describedby` on the badge (no accessible description); swap-case `coverage-unknown` → `coverage-absent` or `status-good` (`data-variant` literal); remove-attribute of `aria-hidden` on the em dash; swap-case `sr-only` → no class (hidden words become visible); drop-field-copy of `label` (default *Not determinable* shown instead of *Unknown*)

### Additional Unit Tests

- [x] T004 [P] Add the remaining `Absent` and `NotDeterminable` cases to `web/src/components/patterns/presence.test.tsx` (same file as T003, so sequential with it): `Absent` is not a tab stop and has no role (`userEvent.tab()` focuses nothing; `queryByRole("img")` and `queryByRole("status")` are null), so it is read as part of its row; `getByText("No closing price")` is the only text a screen reader receives (the em dash is `aria-hidden`); `NotDeterminable` is not a tab stop (`userEvent.tab()` focuses nothing; badge spec section 4) (traces to DAC-E1-8, AC-24) — kills: a mutant that renders `Absent`'s dash without `aria-hidden` (two texts read); a mutant adding `tabIndex={0}` to the badge wrapper
- [x] T005 [P] Add input-guard and clock cases to `web/src/components/patterns/format.test.ts` (same file as T001-T002, so sequential with them): `formatClock("2026-10-15T22:52:10Z")` is `"17:52:10 CDT"` and `formatClock(new Date("2026-01-16T06:00:30Z"))` is `"00:00:30 CST"` (AC-25 *checked {time}*; also repeated inside the T001 `describe.each` TZ block); each of `""`, `"2026-10-15"`, `"2026-10-15T22:46:00"` (no zone), `"not a time"`, `"2026-13-45T99:00:00Z"` and `new Date(Number.NaN)` makes `formatInstant` and `formatClock` throw `RangeError`; each of `""`, `"2026-1-5"`, `"20261015"`, `"2026-10-15T00:00:00Z"` makes `formatSessionDate` throw `RangeError`; each of `-1`, `1.5`, `Number.NaN`, `Number.POSITIVE_INFINITY` makes `formatCount` throw `RangeError` (a count is a whole number; nothing the API never sent is rendered, STD-UI-4; delivered precedent `research/format.ts` throws `RangeError` the same way); `formatDownloadName(null, "2026-10-15")` throws `RangeError` (traces to DAC-E1-9, AC-25) — kills: negate-boolean on the ISO-instant guard (a zoneless string parsed in the machine zone renders instead of throwing); off-by-one `n >= 0` → `n > 0` in `formatCount`'s guard (`0` throws, caught by T002's `0` case); negate-boolean on the session-date shape check

**Checkpoint**: All Phase 2 tests written and failing: `format.ts` and `presence.tsx` do not exist.

---

## Phase 3: Core Implementation

**Purpose**: Create the two pattern modules that make the Phase 2 tests pass.

- [x] T006 Create `web/src/components/patterns/format.ts` to DEC-0309 (Open Gap 1). Export `type Instant = Date | string` (a `string` must be an ISO-8601 instant with `Z` or an offset). Module-private: `TIME_ZONE = "America/Chicago"`; the delivered `ISO_INSTANT` pattern of `web/src/screens/research/format.ts` line 100 (restated here, since a pattern must not import a screen, component design 2.2); `toDate(value: Instant): Date`, which throws `RangeError("Not an ISO-8601 instant: …")` for a string failing the pattern or for any invalid `Date`; one module-level `Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZoneName: "short" })` and a `partsOf(value)` helper reading `formatToParts`. Exports: `formatInstant(value: Instant, options?: { seconds?: boolean }): string` → `${year}-${month}-${day} ${hour}:${minute}[:${second}] ${timeZoneName}`; `formatClock(value: Instant): string` → `${hour}:${minute}:${second} ${timeZoneName}`; `formatSessionDate(value: string): string` → the input unchanged after a `^\d{4}-\d{2}-\d{2}$` shape check (else `RangeError("Not an ISO-8601 date: …")`), never passed to `Date`; `formatCount(n: number): string` → `RangeError` unless `Number.isSafeInteger(n) && n >= 0`, else `String(n)` with `,` every three digits (the `\B(?=(\d{3})+$)` grouping of the delivered `formatAmount`); `formatDownloadName(startedAt: Instant | null, requestedAt: Instant): string` → `` `Download ${formatInstant(startedAt ?? requestedAt)}` ``. Module doc comment cites component design 2.5, DAC-E1-9, STD-UI-5 and capability OQ-1, and states that the shell's `formatTimestamp` stays as delivered (system design assumption 5). No comment or code calls or names any `toLocale*` method (the Validation Plan greps for it) and no comment writes a unit or hex literal (CAP-003-E1-S1's `token-literals.test.ts` scans this file). Depends on T001, T002, T005 (makes them pass)
- [x] T007 Create `web/src/components/patterns/presence.tsx` to DEC-0310 (Open Gap 2), importing `Badge` from `../ui/badge` (CAP-003-E1-S1) and `useId` from `react`. `Absent({ label }: { label: string }): JSX.Element` renders `<span className="text-value-missing"><span aria-hidden="true">—</span><span className="sr-only">{label}</span></span>`. `NotDeterminable({ reason, label = "Not determinable" }: { reason: string; label?: string }): JSX.Element` renders `<span className="inline-flex items-center gap-2">` holding `<Badge variant="coverage-unknown" aria-describedby={id}>{label}</Badge>` and `<span id={id} className="text-xs text-muted-foreground">{reason}</span>`, with `id = useId()`; the badge's colours and `bg-pattern-indeterminate` come from S1's `coverage-unknown` variant, never restated here. Doc comments cite component design 2.5, UX design 0.7 (three presence renderings), DAC-E1-8, STD-UI-4 and STD-UI-14, and say blank means only "does not apply" and is not this module's. No literal in comments (scanned file). Depends on T003, T004 (makes them pass)

**Checkpoint**: T001-T005 pass; CAP-003-E1-S1's `token-literals.test.ts` still passes over the two new files.

---

## Phase 4: Integration

**Purpose**: Prove the new modules sit inside the delivered checks without touching delivered files.

- [x] T008 Run the full suite with `npm run test` and confirm, unchanged: `web/src/components/token-literals.test.ts` and `web/src/components/ui/vendoring.test.ts` (CAP-003-E1-S1) pass over `presence.tsx` and `format.ts`; `web/src/api/render.test.tsx` (no `dangerouslySetInnerHTML`) passes; the delivered `web/src/app/status-region*.test.tsx` cases asserting `formatTimestamp`'s *America/Chicago* output pass. Confirm with `git diff --exit-code -- web/src/app web/src/screens web/src/api web/src/components/ui package.json tailwind.config.js design-system` that this story touched none of them (traces to DAC-E1-8, DAC-E1-9, AC-24, AC-25)

**Checkpoint**: The whole Vitest suite is green and only the four story files are new.

---

## Phase 5: Polish

**Purpose**: Validation commands and TDD evidence.

- [x] T009 Run `npm run lint`, `npm run format` (fix with `npx biome format --write` on this story's four files only), `npx tsc --noEmit` (the test files are type-checked too) and `npm run build` from the repo root; fix findings in this story's files only (traces to AC-24, AC-25)
- [x] T010 After each TDD cycle in T001–T009 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-003-E1-S6-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence, the structured `mutation:` block `scripts/mutation-run.py summary` prints (or `mutation: {not_applicable: <reason>}` for a cycle with no production change), and `diff_sha256` — the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch` — before the next cycle begins; `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage`; no per-cycle commit is planned. Cycles: (1) T001 + T002 + T005 + T006 formatters; (2) T003 + T004 + T007 presence renderings; T008-T009 add no behaviour and join cycle 2's validation evidence (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E1-S1 | hard | `presence.tsx` imports `Badge` (`coverage-unknown` variant, spreading `aria-describedby`) from `web/src/components/ui/badge.tsx` and relies on S1's `cn()` keeping `bg-pattern-indeterminate` beside `bg-value-indeterminate-muted`; both files are created by S1 (edge already in the graph) |
| CAP-003-E3-S1 | context | Its `shell-types.ts` keeps wire timestamps as ISO strings (snake_case `started_at`, `requested_at`) and `ReadState.checkedAt` as `Date`; this is why `Instant` accepts both and `formatDownloadName` takes two positional instants (Open Gap 1). Nothing is imported from it |
| CAP-003-E3-S6 | reverse | Renders *Last answered* through `formatInstant(…, { seconds: true })` from a `Date` |
| CAP-003-E3-S7 | reverse | Names the download in its toast through `formatDownloadName` from attention's snake_case `latest_download` |
| CAP-003-E4-S4 | reverse | Uses `formatInstant`, `formatClock`, `formatCount` |
| CAP-003-E5-S1 | reverse | Renders `prices_as_of` through `formatSessionDate` and the market state through `NotDeterminable` |
| CAP-003-E5-S2 | reverse | Uses `Absent`, `NotDeterminable` and the formatters on the data tile |
| CAP-003-E6-S1 | reverse | Uses `Absent`, `NotDeterminable` and the formatters on the check cards |
| CAP-003-E6-S4 | reverse | Uses `Absent`, `NotDeterminable` and the formatters in the download summary |
| CAP-003-E7-S2 | reverse | Renders not-determinable presence through `NotDeterminable` and em dashes through `Absent` |
| CAP-003-E7-S5 | reverse | Sets the download detail's crumb through `formatDownloadName` from the delivered camelCase `startedAt`/`requestedAt` |

No new hard edge: the graph line `CAP-003-E1-S6: [CAP-003-E1-S1]` is already complete.

### Task Dependencies

- T001 → T002 → T005: same file, sequential
- T003 → T004: same file, sequential; in parallel with T001-T002-T005
- T006: Depends on T001, T002, T005
- T007: Depends on T003, T004 (and on CAP-003-E1-S1's `badge.tsx` and `utils.ts` existing)
- T008: Depends on T006, T007
- T009: Depends on T008
- T010: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities

- Phase 2: the `format.test.ts` chain (T001, T002, T005) in parallel with the `presence.test.tsx` chain (T003, T004)
- Phase 3: T006 and T007 in parallel (different files)

---

## Validation Plan

### Constitution-Defined Commands

(`docs/constitution/tech-stack.md` v7 Validation Commands, working directory `.`)

- Install: `npm ci`
- Build: `npm run build`
- Test: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit`

### Story-Specific Validation

- DAC-E1-S6-1 / DAC-E1-9: T001 and T005 pass, including the `describe.each` TZ block; `grep -n "toLocale" web/src/components/patterns/format.ts` prints nothing (T006 forbids the word in comments too, so this check cannot contradict a task).
- DAC-E1-S6-2: T002 passes.
- DAC-E1-S6-3 / DAC-E1-8: T003 and T004 pass.
- AC-26 carry-over: `token-literals.test.ts` (CAP-003-E1-S1) passes with `presence.tsx` and `format.ts` in its scanned directory.
- No delivered file changed: the `git diff --exit-code` of T008 exits 0; `git status --short web/` lists only the four new files of this story.

---

## Notes

### Resolved Conflicts

1. **`formatDownloadName`'s argument.** Component design 2.5 writes the call as `formatDownloadName(startedAt ?? requestedAt)`, a single already-resolved instant; story DAC-E1-S6-2 and TC-COMP-024 say "given a download with `started_at` null, When `formatDownloadName` renders it, Then it uses `requested_at`", and epic DAC-E1-9 says the name comes "from `started_at`, else `requested_at`", so the fallback is the function's behaviour, not the caller's. Epic and story acceptance criteria govern over the design's illustrative call (constraint 9.1): the function takes both instants and resolves the fallback itself. The exact parameter shape is Open Gap 1.
2. **Where the reason sits.** Component design 2.5 allows the reason "beside it or in its accessible description"; story DAC-E1-S6-3 requires it "in its accessible description"; UX design 0.7 requires it "beside it or one interaction away" for every viewer. A visually hidden description alone would satisfy the story but leave a sighted viewer with neither the reason beside the badge nor an interaction (no tooltip is designed). Rendering the reason as visible text beside the badge and pointing the badge's `aria-describedby` at it satisfies all three; the badge itself keeps to two words (badge spec section 7), so the reason is never inside it. No source edit is needed.

### Open Gaps

1. **Formatter input types. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0309.** Component design 2.5 names the parameters (`date`, `n`, `startedAt ?? requestedAt`) but no artifact fixes their types, and the callers hold both forms: the wire's ISO-8601 strings (owner-shell's `Attention`, declared in `web/src/app/shell-types.ts` by CAP-003-E3-S1, keeps snake_case `started_at`, `requested_at`, `checked_at` as `string`; the delivered `web/src/api/types.ts` lines 227-228 `requestedAt: string`, `startedAt: string | null`) and client `Date`s (owner-shell §2.3 `ReadState.checkedAt: Date`; the *Last answered* line's `lastAnsweredAt`). Adopted (T006): `type Instant = Date | string`, where a string must be an ISO-8601 instant with `Z` or an offset; `formatInstant(value: Instant, options?: { seconds?: boolean })`; `formatClock(value: Instant)`; `formatSessionDate(value: string)` (a `YYYY-MM-DD` calendar date, as TC-COMP-023 calls it); `formatCount(n: number)` for a non-negative safe integer; `formatDownloadName(startedAt: Instant | null, requestedAt: Instant)`, two positional instants so both the snake_case wire shape and the camelCase delivered run type can call it without a mapping; every malformed input throws `RangeError` naming it. Derivation: the delivered CAP-002 formatter `web/src/screens/research/format.ts` (lines 100-142) takes ISO strings, validates them with the same instant pattern and throws `RangeError` rather than render a value the API never sent (STD-UI-4), and its `formatDate` returns a session date unchanged after a shape check; accepting `Date` as well is the minimum that lets the shell's `Date` clocks use the same function; Resolved Conflict 1 puts the fallback inside `formatDownloadName`. Consumers: CAP-003-E3-S6, CAP-003-E3-S7, CAP-003-E4-S4, CAP-003-E5-S1, CAP-003-E5-S2, CAP-003-E6-S1, CAP-003-E6-S4, CAP-003-E7-S5 and every later screen story calling a formatter. Follow-up: component design `ui-components` section 2.5 should state the signatures at its next revision.
2. **Presence component props. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0310.** Component design 2.5 and DAC-E1-8 fix what `Absent` and `NotDeterminable` render (hidden text naming what is absent; *Not determinable* "or a caller's label"; "its reason") but no artifact names the props. Adopted (T007): `Absent({ label: string })`, `label` being the full visually hidden phrase (for example *No closing price*); `NotDeterminable({ reason: string; label?: string })`, `label` defaulting to *Not determinable*; neither takes a `className` (no consumer design asks for one). Derivation: the delivered CAP-001 precedent `web/src/screens/coverage/cells.tsx` `MissingValue` renders the dash `aria-hidden` with an `sr-only` phrase, which `Absent` generalises by letting the caller name the phrase; `reason` and `label` are the design's own words. Consumers: CAP-003-E5-S1, CAP-003-E5-S2, CAP-003-E6-S1, CAP-003-E6-S4, CAP-003-E7-S2 and every screen story rendering presence. Follow-up: component design `ui-components` section 2.5 should state the props at its next revision.

### Other Notes

- **The delivered `formatTimestamp` stays.** `web/src/app/status-region.tsx` line 72 prints *America/Chicago* and is asserted by delivered tests; it is `owner-shell`'s file (DEC-0211) and is not edited (system design assumption 5). CAP-002's `web/src/screens/research/format.ts` `formatTimestamp` produces the same shape as `formatInstant`; it is CAP-002's screen module and is not re-pointed here (surgical change). Collapsing it onto `formatInstant` is a candidate for the screen takeover, not this story.
- **Why `hourCycle: "h23"`.** `en-US` with `hour: "2-digit"` defaults to a 12-hour clock with a day period; `hour12: false` makes some engines print midnight as `24`. The delivered precedent uses `hourCycle: "h23"`, and T001's midnight case pins it.
- **Why `2026-03-08`.** It is the spring daylight-saving change in America/Chicago; any mutant that routes the session date through `Date` renders it as the previous day under Chicago and as a varying day under the T001 TZ block.
- **`process.env.TZ` in tests.** Vitest 2 runs each test file in its own worker; the delivered `research/format.test.ts` already sets and restores `process.env.TZ` per test, and Node re-reads the zone on assignment. T001 copies that pattern exactly, restore included.
- **Not a tier.** `NotDeterminable` is never passed to `tierOf` or `StatusBadge` (component design 2.3: "Not determinable is not a tier"); it carries no tier shape, and its non-colour cue is the `--pattern-indeterminate` hatch plus its words (badge spec section 2).
- **Scanned files.** Both new modules sit under `web/src/components/`, which CAP-003-E1-S1's `token-literals.test.ts` scans, comments included: write no unit or hex literal in either file.
- **Hand-written mutants** (add to the mutation run beside the generated ones):
  - `web/src/components/patterns/format.ts`: `timeZone: TIME_ZONE,` → (deleted)
  - `web/src/components/patterns/format.ts`: `startedAt ?? requestedAt` → `requestedAt ?? startedAt`
  - `web/src/components/patterns/format.ts`: `hourCycle: "h23",` → (deleted)
  - `web/src/components/patterns/format.ts`: `return value;` in `formatSessionDate` → `return formatInstant(new Date(value)).slice(0, 10);`
  - `web/src/components/patterns/presence.tsx`: `aria-describedby={id}` → (deleted)
  - `web/src/components/patterns/presence.tsx`: `variant="coverage-unknown"` → `variant="coverage-absent"`
