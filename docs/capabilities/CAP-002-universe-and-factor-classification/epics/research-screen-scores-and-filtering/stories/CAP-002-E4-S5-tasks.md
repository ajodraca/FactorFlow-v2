---
artifact_schema_version: 1
artifact_id: CAP-002-E4-S5-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-17
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T23:58:00Z
  source_artifacts:
    - id: CAP-002-E4-S5
      version: "1"
    - id: CAP-002-component-design-classification-ui
      version: "3"
    - id: CAP-002-component-design-classification-api
      version: "3"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E4-S5 — Filters Pane and Threshold Sentences

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-002-universe-and-factor-classification/epics/research-screen-scores-and-filtering/stories/CAP-002-E4-S5.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`)
**Branch**: `usr/alvaro-de-jodra/CAP-002-E4-tasks`
**Date**: 2026-10-17

## Summary

Delivers the Research screen's Filters pane: `web/src/screens/research/threshold-sentence.tsx` (the blueprint section 4.7 builder, one row per factor: swatch and name, then *percentile | standardised score*, *at least | at most* and a 56 px value field, validated on blur) and `web/src/screens/research/filters-pane.tsx` (Find a stock, Look in, three sentences, Hide incomplete, Clear filters), plus one small seam the story does not name, `web/src/screens/research/use-research-query.ts`, the React binding between the URL and S2's `ResearchQuery` (Open Gap 1, DEC-0156). Every change is one `setQuery`, hence one URL write and one list request by whatever host observes the URL (S9 on Research, E1-S8 on universe detail); the pane itself never fetches the list. Clear filters resets every filter and keeps the sort. With `showLookIn={false}` (universe detail) the pane has no Look in and writes no `scope`. No results table, banner, poll or screen is built here.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-16 | Filter by thresholds on one or more factors at once, across all stocks and within a universe (the filter controls) | T003, T004, T006, T007, T008, T010, T011 |
| DAC-E4-3 | Thresholds, scope, hide-incomplete and search live in the URL and survive reload and back navigation | T003, T004, T006, T007, T008, T011 |
| DAC-E4-S5-1 | Percentile 101 or a non-finite score is a field error on blur before any request; blank means no threshold | T001, T005, T010 |
| DAC-E4-S5-2 | A threshold, scope, hide-incomplete or search change issues exactly one list request with the mapped parameters and updates the URL | T003, T006, T007, T008, T011 |
| DAC-E4-S5-3 | Clear filters resets all filters and keeps the sort | T004, T006, T011 |
| DAC-E4-S5-4 | Each sentence's accessible name reads as the blanks of the sentence | T002, T005, T010 |

Mapped test cases (all from `tests/component/classification-ui-tests.md`, confirmed in `tests/coverage-matrix.md` lines 222-225): TC-COMP-134 (DAC-E4-S5-1), TC-COMP-135 (DAC-E4-S5-2), TC-COMP-136 (DAC-E4-S5-3), TC-COMP-137 (DAC-E4-S5-4). No other component TC traces to a DAC-E4-S5-* criterion. Each spec body is a one-line generic scenario ("The field blurs", "Made", "Activated", "Read by assistive technology"); the plan sharpens each into concrete assertions from the AC and classification-ui sections 2.5 and 7, UX design section 1.1 items 1 to 5 (Phase 2). The design's test table (classification-ui section 7, lines 943-944) names the same two test files as the story.

## Phase 1: Setup

Skipped. No dependency, configuration or existing file changes: `react-router-dom` 6, `@testing-library/react`, `@testing-library/user-event` and vitest are already in `package.json`; `web/src/screens/research/` is created by CAP-002-E4-S2 (or by the first file written into it). Before T008 read the shipped S1 and S2 files and use their exact names: from `web/src/api/research-query.ts` `ResearchQuery`, `ThresholdSentence`, `Measure`, `Direction`, `DEFAULT_RESEARCH_QUERY`, `decodeResearchQuery`, `applyResearchQuery`, `toListParams`; from `web/src/api/classification-client.ts` `listUniverses` and `listClassifications`; from `web/src/api/classification-types.ts` `FactorName` and the universe type; from `web/src/screens/research/copy.ts` the filters-pane strings. Both stories are planned but not coded when this plan is written; the names above are those S2's plan fixes, and the shipped files govern if they differ.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the pane and the sentence from the acceptance criteria. Four files, none exists: `web/src/screens/research/threshold-sentence.test.tsx` and `web/src/screens/research/filters-pane.test.tsx` (the paths the story names), `web/src/screens/research/use-research-query.test.tsx`. Follow `web/src/screens/settings/history-depth-form.test.tsx` (userEvent, `vi.mock` of the client module with `importActual`, `findByRole`) and render inside `MemoryRouter` as `web/src/app/shell.a11y.test.tsx` does. Each mandatory test carries a traceability comment (`// Implements TC-COMP-134`). The pane tests use one local test host: `<MemoryRouter initialEntries={[url]}><FiltersPane/><ListProbe/></MemoryRouter>` where `ListProbe` reads `useResearchQuery()` and calls the mocked `listClassifications(toListParams(query))` in an effect keyed on the encoded query, and prints `useLocation().search` in a `data-testid="search"` node. `ListProbe` stands in for the results host (S9); it makes "exactly one list request" observable without building the table (Open Gap 1). `listUniverses` is mocked to resolve two active universes. No network, no fake timers.

### Mandatory Component Tests

- [ ] T001 [P] Implement TC-COMP-134 (Threshold field validates percentile and non-finite scores on blur) in `web/src/screens/research/threshold-sentence.test.tsx`, rendering `ThresholdSentence` for value with `onCommit` as a `vi.fn()`: (a) measure *percentile*, type `101`, tab away: a field error is in the document (`role="alert"` text in the field's `aria-describedby`, field `aria-invalid="true"`) and `onCommit` was never called; the same for `-1`, `abc`, `1e3` and `100.5`; (b) measure *standardised score*, type `NaN`, then `Infinity`, then `-Infinity`, then `abc`: each is a field error and `onCommit` is never called; (c) the valid edges commit exactly once each on blur: percentile `0`, `100`, `70`, `87.5` (value kept as typed) and score `-0.45`, `+1.27`, `0`; (d) a blank value after a committed one commits `null` (no threshold on that measure) with no field error, and a field that was always blank commits nothing on blur. The error text is a sentence in the STD-UI-19 shape the S2 catalogue provides (operation, resource, reason), not a bare "Invalid"
- [ ] T002 [P] Implement TC-COMP-137 (Threshold sentences have accessible names reading as sentences) in `web/src/screens/research/threshold-sentence.test.tsx`: for the value row assert `getByRole("combobox", { name: "Measure for value" })`, `getByRole("combobox", { name: "Direction for value" })` and `getByRole("textbox", { name: "Value threshold" })` exactly (UX design 1.1 item 3; classification-ui 2.5); for growth and momentum assert *Measure for growth*, *Direction for growth*, *Value threshold for growth* and the momentum equivalents, so the three textboxes have distinct names (Open Gap 2). Also assert the options read *percentile* and *standardised score*, *at least* and *at most* in that order, the input placeholder is *any*, the input is 56 px wide (`w-14`), the sentence is a `<p>` holding the three controls, and the swatch is `aria-hidden` beside the factor's display name (*Value*, *Growth*, *Momentum*), so reading the row gives the factor, then the three blanks in order
- [ ] T003 [P] Implement TC-COMP-135 (One list request per filter change, URL updated) in `web/src/screens/research/filters-pane.test.tsx`, over the test host above starting at an empty URL; clear the `listClassifications` mock after the initial request and assert for each change: (a) choose a universe in *Look in*: exactly one new call, with `toListParams` of the new query (`universeId` set), and the `search` node holds `scope=<id>`; (b) *value* measure *percentile*, direction *at least*, type `80`, blur: exactly one new call carrying `valuePercentileMin: "80"` and no other bound (use the camelCase name S1 shipped), `search` holds `value.measure=percentile&value.direction=atLeast&value.value=80`; (c) change the momentum sentence to *standardised score* *at most* `-0.5`: exactly one call with `momentumScoreMax: "-0.5"` and `valuePercentileMin` still `"80"` (thresholds on several factors at once, AC-16); (d) check *Hide stocks with an incomplete score*: exactly one call with `hideIncomplete: true`, `search` holds `hide_incomplete=true`; (e) type `aa` in *Find a stock* and press Enter: exactly one call with `symbol: "AA"`, and typing alone issued none. After each step the previous query's parameters are still present (changes accumulate). Use the call count from `mock.calls.length` before and after, never `toHaveBeenCalled`
- [ ] T004 [P] Implement TC-COMP-136 (Clear filters resets filters and keeps sort) in `web/src/screens/research/filters-pane.test.tsx`: start at `?scope=<id>&value.measure=percentile&value.direction=atLeast&value.value=80&growth.measure=standardisedScore&growth.direction=atMost&growth.value=1.5&hide_incomplete=true&symbol=AA&sort=value_percentile&order=desc`; activate **Clear filters**: exactly one new list call, whose parameters are the defaults plus `sort: "value_percentile"` and `order: "desc"` (no scope, no bound, no `hideIncomplete`, no `symbol`); the `search` node holds exactly `sort=value_percentile&order=desc`; every control is back to its default (*Look in* shows *All followed stocks*, the six threshold controls show their defaults and empty fields, the checkbox is unchecked, *Find a stock* is empty); the button is no longer rendered (it appears only while a filter is active); and a key the codec does not own (add `&tab=history` to the start URL) is still in the `search` node. Repeat from `?sort=symbol` alone: **Clear filters** is not rendered at all, so sort alone is not an active filter

### Additional Unit Tests

- [ ] T005 [P] Sentence behaviour in `web/src/screens/research/threshold-sentence.test.tsx` (AC-16, DAC-E4-S5-1, DAC-E4-S5-4; Open Gap 2, DEC-0157): (a) agreement with the codec: a table of `(measure, value, valid)` rows (percentile `0`, `100`, `100.0`, `-1`, `101`, `abc`, ``, `1e3`; score `-0.45`, `+1.27`, `0`, `abc`, `NaN`, `Infinity`, `1e3`, ``) gives the same verdict from the sentence as `decodeResearchQuery(new URLSearchParams(...))` gives for the same sentence (kept or dropped), so the two rules cannot drift; (b) the field is `type="text"` with `inputMode="decimal"`, not `type="number"` (a number input cannot hold `NaN` or `Infinity`, so the non-finite case would be untestable and unreachable); (c) changing *measure* or *direction* with a valid value commits the sentence once; with a blank value commits nothing; changing *measure* from *standardised score* `150` to *percentile* shows the field error and commits nothing (the URL keeps the last valid sentence); (d) no commit and no error while typing, only on blur (type `10`, `1`, `0`: zero calls until blur); (e) the error clears when the field becomes valid or blank; (f) the draft re-syncs when the `value` prop changes (Clear filters or back navigation set it to `undefined`: the field empties, the error clears, the selects return to *percentile* and *at least*); (g) the field is not disabled while a request is in flight (rows stay visible and dimmed, focus does not move)
- [ ] T006 [P] Pane behaviour in `web/src/screens/research/filters-pane.test.tsx` (AC-16, DAC-E4-3, DAC-E4-S5-2, DAC-E4-S5-3; Open Gaps 1 to 3, DEC-0156 to DEC-0158): (a) structure and order: `h2` *Find stocks*, a `section` named *Filters*, then *Find a stock* (placeholder *Symbol*), *Look in*, the three sentences in the order value, growth, momentum, the percentile helper *Percentile 70 means "scores better than 70% of the stocks scored on this factor".*, the checkbox with its helper *They're shown by default so nothing disappears silently.* (`aria-describedby`), and **Clear filters** last; all strings come from `copy.ts`, none is typed in the component; (b) *Look in* options are *All followed stocks · {n}* (from `activeInstruments`; just *All followed stocks* when `null`) then each active universe by name from the mocked `listUniverses`, its accessible name reads *Look in: All followed stocks*, and the select always has a value; (c) choosing *All followed stocks* after a universe removes `scope` from the URL (the default is never written); (d) `showLookIn={false}`: no *Look in* control, and a start URL carrying `scope=<id>` is left untouched by every change and by **Clear filters** (the pane neither reads nor writes `scope`), while the other filters still work; `children` render above **Clear filters** (the *Members as of* slot of E1-S8) in both modes; (e) **Clear filters** visibility: absent on an empty query and on `?sort=symbol`, present for each single active filter in turn (a universe scope, one sentence, hide-incomplete, a symbol); with `showLookIn={false}` a `scope` alone does not make it appear; (f) *Find a stock*: Enter and blur commit once each, a blur with unchanged text commits nothing, `Esc` empties the field and commits `symbol: null`, a value of `1!` is a field error with no write (S2 symbol rule), lower case is upper-cased in the URL; (g) focus: after changing a select, a threshold or the checkbox, `document.activeElement` is the control that changed; after **Clear filters** it is *Find a stock* (the button unmounted); (h) back navigation: after two changes, `navigate(-1)` restores the earlier URL and the controls show the earlier values, because changes are pushes (DAC-E4-3); (i) an unlisted scope in the start URL adds an extra *Unavailable universe* option that is selected, the other options are unchanged and no write happens until the owner chooses (Open Gap 3); (j) `listUniverses` rejecting leaves *All followed stocks* usable, shows the S2 failure sentence for operation and resource and never the envelope `message`, and the other filters still work
- [ ] T007 [P] Hook behaviour in `web/src/screens/research/use-research-query.test.tsx` (DAC-E4-3, DAC-E4-S5-2; Open Gap 1, DEC-0156), through a `renderHook` with a `MemoryRouter` wrapper: `query` equals `decodeResearchQuery` of the location search; `setQuery(next)` writes `applyResearchQuery(current params, next)`, so unknown keys survive and defaults are not written, and causes exactly one navigation (history length +1); `setQuery` of an equal query causes no navigation (no duplicate entry, no second request); `clear()` writes `{ ...DEFAULT_RESEARCH_QUERY, sort: query.sort }`, keeping `sort` and `order`; two consecutive `setQuery` calls in one tick (a select change then a blur) each apply to the latest URL, not to a stale snapshot (the functional `setSearchParams` form); `query` identity is stable across re-renders while the search string is unchanged (it is an effect key for hosts)

**Checkpoint**: All tests written and failing (`./threshold-sentence`, `./filters-pane` and `./use-research-query` do not exist). No production code yet.

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass with three new files, plus any missing strings in the S2 catalogue, and no edit to any other delivered file.

- [ ] T008 Create `web/src/screens/research/use-research-query.ts` (DEC-0156; makes T007 pass; depends on S2's `research-query.ts`): `useResearchQuery(): { query: ResearchQuery; setQuery(next: ResearchQuery): void; clear(): void }` over react-router's `useSearchParams`. `query` is `useMemo(() => decodeResearchQuery(searchParams), [searchParams.toString()])`. `setQuery` calls `setSearchParams((prev) => applyResearchQuery(prev, next))` (push, the default, so back restores; the functional form so two writes in a tick compose) and returns without navigating when the encoded result equals the current search string. `clear` is `setQuery({ ...DEFAULT_RESEARCH_QUERY, sort: current.sort })`. No `window`, no `Date`, no fetch. Doc comment names DAC-E4-3 and says the host that issues the list request must key it on `query` (S9, E1-S8)
- [ ] T009 Add to `web/src/screens/research/copy.ts` only the strings of this story that S2 did not harvest (check each against the shipped file first; S2's plan T012 lists *Find stocks*, *Find a stock*, *Look in*, *All followed stocks · {n}*, the measure and direction labels, *Measure for {factor}*, *Direction for {factor}*, *Value threshold*, the percentile helper, *Hide stocks with an incomplete score* and its helper, *Clear filters*): the placeholders *Symbol* and *any*, the factor display names *Value*, *Growth*, *Momentum* if absent, the field-error sentences for a threshold value and a symbol (operation *Setting a threshold*, resource the factor's threshold, reason *a percentile is a number from 0 to 100* / *a standardised score is a finite number* — STD-UI-19 shape, wording composed from the S2 operation and reason pieces where they exist) and the *Unavailable universe* option label (DEC-0158). Add nothing the designs already contain; every addition gets a doc comment naming its source, and a line in `copy.test.ts`'s anchor table in the same change so S2's forbidden-vocabulary scan covers it (no `instrument`, no bare `score`). This is an additive edit to an S2 file, recorded as Open Gap 4
- [ ] T010 Create `web/src/screens/research/threshold-sentence.tsx` (makes T001, T002, T005 pass; depends on T009): `ThresholdSentence({ factor, value, onCommit })` where `value?: { measure; direction; value: string }` is the factor's current `ThresholdSentence` from the query and `onCommit(next: ThresholdSentence | null): void`. A `<p>` with the swatch (`<span aria-hidden>` filled by inline `style={{ backgroundColor: "hsl(var(--factor-value))" }}` per factor; `theme.css` defines `--factor-*` but `tailwind.config.js` maps none of them, and a utility class cannot be built from a dynamic name, so inline style is the mechanism that adds no literal colour, STD-UI-29, and edits no delivered config; Open Gap 5), the factor's display name, a native `<select>` for measure (*percentile*, *standardised score*), a native `<select>` for direction (*at least*, *at most*) and a `type="text" inputMode="decimal"` field (`w-14`, placeholder *any*). Local draft state `{ measure, direction, raw }` is initialised from `value` and re-synced in an effect keyed on the `value` prop's three parts, so Clear filters and back navigation reset it. One pure exported function `validateThresholdValue(measure, raw): string | null` (null when valid): percentile `^\d+(\.\d+)?$` and `0 <= n <= 100`; standardised score `^[+-]?\d+(\.\d+)?$` (finite by construction, no exponent, no `NaN`, no `Infinity`); the same rule S2's decoder applies (T005 (a) pins the agreement; if S2 exports its own validator by then, import it and delete this one). On a select change and on blur: blank raw commits `null` only if `value` was set; a valid non-blank raw commits `{ measure, direction, value: raw }` only if it differs from `value`; an invalid one sets the field error and commits nothing. Error: a `<p role="alert" id>` in `--destructive` (inline `style={{ color: "hsl(var(--destructive))" }}`, Open Gap 5), the field `aria-invalid` and `aria-describedby` pointing at it. Names per Open Gap 2. Do not use `disabled` while a request is in flight
- [ ] T011 Create `web/src/screens/research/filters-pane.tsx` (makes T003, T004, T006 pass; depends on T008, T009, T010): `FiltersPane({ showLookIn = true, activeInstruments = null, children })`, a `<section aria-label="Filters">` of `--border`-separated parts with `h2` *Find stocks*, top to bottom: *Find a stock* (`<input type="text">`, label and placeholder from copy; Enter and blur commit `symbol`, `Esc` clears and commits; S2's symbol rule, field error on a rejected value), *Look in* (native `<select>` named *Look in: All followed stocks* style per the select contract; options from `listUniverses()` fetched once on mount with a cancel flag, the unlisted-scope extra option of Open Gap 3; omitted when `showLookIn` is false), three `ThresholdSentence` rows in the order value, growth, momentum, the percentile helper, the *Hide stocks with an incomplete score* checkbox with `aria-describedby` helper, `{children}`, and **Clear filters** (`type="button"`, ghost styling as the delivered buttons, rendered only while any of: a sentence, a symbol, hide-incomplete, or — when `showLookIn` — a scope is set; `sort` never counts). All reads come from `useResearchQuery().query` and all writes are one `setQuery({ ...query, ... })`; with `showLookIn` false the written query keeps the `scope` it read, so the codec leaves it as found. After **Clear filters** move focus to the *Find a stock* input by ref (DEC-0157). The pane never calls `listClassifications`, never reads `message` of an `ApiError`, and renders no results. Loading `listUniverses` shows the select with *All followed stocks* only

**Checkpoint**: Every test in the four files passes; `npx tsc --noEmit` is clean; `git diff --name-status` shows new files, the `copy.ts` and `copy.test.ts` additions of T009 only if any string was missing, this plan, the status line and `dependencies.yaml`.

---

## Phase 4: Integration

**Purpose**: Show the pane sits beside the delivered code without changing it and without a screen.

- [ ] T012 Confirm the delivered surface is unchanged (depends on T008 to T011): run the whole existing web suite (`client.*.test.ts`, `render.test.tsx`, the shell and routes tests, the screen tests, and S1 to S4's tests where present) without editing any of them; `git diff --stat` shows only the files listed at the Phase 3 checkpoint, `CAP-002-E4-S5-tdd-evidence.yaml` and nothing under `web/src/app/`. Nothing mounts the pane yet (first importers: CAP-002-E4-S9 on `/research`, CAP-002-E1-S8 on universe detail with `showLookIn={false}`, and the nothing-found state's **Clear filters** through `useResearchQuery().clear`). Confirm `web/src/api/render.test.tsx` still finds no `dangerouslySetInnerHTML`

**Checkpoint**: Only new files, the T009 catalogue additions and the status line differ from `HEAD`; every delivered test is green.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns.

- [ ] T013 Run `npm run format` (a check; `biome format .` does not write), fix any report by running `npx biome format --write` on the touched files only, then `npm run lint`, `npx tsc --noEmit`, `npm run test` and `npm run build`. Add short doc comments on `FiltersPane`, `ThresholdSentence`, `validateThresholdValue` and `useResearchQuery` naming the DAC each serves, in the style of `web/src/screens/settings/history-depth-form.tsx`. `npm run test:e2e` is not part of this story (no screen exists). No behaviour change
- [ ] T014 After each TDD cycle in T001-T013 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E4-S5-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC). The three cycles are listed in Other Notes

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E4-S1 | hard | `filters-pane.tsx` imports `listUniverses` from `classification-client.ts` and the universe and `FactorName` types from `classification-types.ts`; the test host mocks `listClassifications` from the same module. The graph listed only S2 for this story (reachable transitively); the direct edge is added, as S3 and S4 carry it |
| CAP-002-E4-S2 | hard | All three files import `ResearchQuery`, `ThresholdSentence`, `DEFAULT_RESEARCH_QUERY`, `decodeResearchQuery`, `applyResearchQuery` and `toListParams` from `research-query.ts` and the labels from `copy.ts`; existing graph edge `CAP-002-E4-S5: [CAP-002-E4-S2]` |
| CAP-002-E4-S3 | context | The factor cell and restated mark are results-side patterns; the pane imports neither. The story's Dependencies line does not list it and no import exists |
| CAP-002-E4-S4 | context | The poll's refresh-once preserves the filters by reading the same URL query; the pane and the hook share no import |
| CAP-002-E4-S6 | context | The results table issues sort requests from the same `ResearchQuery`; neither imports the other, and the pane's test host stands in for it |
| CAP-002-E4-S9 | reverse | S9 mounts the pane on `/research`, issues the list request keyed on `useResearchQuery().query` and renders the nothing-found **Clear filters**; graph edge `CAP-002-E4-S9: [..., CAP-002-E4-S5, ...]` |
| CAP-002-E1-S8 | reverse | Universe detail embeds the pane with `showLookIn={false}` and the *Members as of* children slot; graph edge `CAP-002-E1-S8: [..., CAP-002-E4-S5, ...]` |

New hard edge added to `dependencies.yaml`: `CAP-002-E4-S5: [CAP-002-E4-S1, CAP-002-E4-S2]` (S1 inserted before S2 in numeric order). No cycle: S1 depends on nothing. No unknown ID.

### Task Dependencies

- T001 to T007: no dependencies (four test files; T001, T002 and T005 share `threshold-sentence.test.tsx`, T003, T004 and T006 share `filters-pane.test.tsx`)
- T008: depends on T007 existing (RED first) and on S2's `research-query.ts`
- T009: depends on S2's `copy.ts` and on T005, T006 existing (the strings they assert)
- T010: depends on T001, T002, T005 existing and on T009
- T011: depends on T003, T004, T006 existing and on T008, T009, T010
- T012: depends on T008 to T011
- T013: depends on T012
- T014: interleaved, runs after every TDD cycle and before the next begins

### Parallel Opportunities

- Phase 2: tasks on different files are parallel; one agent per file (sentence tests, pane tests, hook tests)
- Phase 3: T008 and T009 are independent; T010 follows T009; T011 follows T008, T009 and T010

---

## Validation Plan

### Constitution-Defined Commands
- Build: `npm run build`
- Test: `npm run test` (single file while iterating: `npx vitest run web/src/screens/research/filters-pane.test.tsx`)
- Lint: `npm run lint`
- Format: `npm run format` (check only)
- Type check: `npx tsc --noEmit` (named in the story's Technical Details; not in the tech-stack table)

Working directory is the repository root `repos/factorflow-v2/FactorFlow-v2`. The tech-stack file's Validation Commands table lists `npm run build`, `npm run test`, `npm run test:e2e`; lint and format come from `package.json` (`biome lint .`, `biome format .`) and the story. `npm run test:e2e` is not run (no screen exists).

### Story-Specific Validation
- DAC-E4-S5-1: T001 and T005 show 101, `-1`, `abc`, `NaN` and `Infinity` as field errors with zero commits, blank as no threshold, and the pane's verdicts equal the codec's
- DAC-E4-S5-2: T003 shows one new `listClassifications` call per change with the mapped parameters, the URL updated in the same step, and none while typing
- DAC-E4-S5-3: T004 shows every filter back at its default, `sort` and `order` kept, and the unowned `tab` key kept
- DAC-E4-S5-4: T002 shows the three accessible names per row and the sentence reading in order
- DAC-E4-3 / AC-16: T006 (h) shows back navigation restoring the controls; T003 (c) shows several factors filtered at once; T006 (d) shows the pane on universe detail with no *Look in*
- Delivered surface: `git diff --stat` shows no modified delivered file other than the additive `copy.ts` edit, if any

---

## Notes

### Resolved Conflicts

1. **The story says every change is a request; the list request is another story's.** DAC-E4-S5-2 and TC-COMP-135 require exactly one list request per change, but the pane is not the results host: E4-S6 owns sorting as a request and E4-S9 composes the screen. Governing rule: story acceptance criteria outrank the file list; the criterion is met if each change produces exactly one URL write, because the host keys its single list request on the URL (DAC-E4-3, "they live in the URL"). Settled by the pane being controlled by the URL, with a probe host in its test. The interface is a shape no artifact fixes and is Open Gap 1 (DEC-0156).
2. **The design names the numeric field `input` `numeric`; the AC requires a non-finite score to be a field error.** A `type="number"` field cannot contain `NaN` or `Infinity`, so DAC-E4-S5-1 would be unreachable. The AC outranks the element name: the field is a text input with `inputMode="decimal"`, which is what "numeric" means in the design system's contract for a field that must accept typed text. Decided, not provisional beyond Open Gap 2's commit rules.
3. **Accessible names.** The design fixes *Measure for value*, *Direction for value* and *Value threshold*. Used verbatim for value, the same pattern for growth and momentum for the first two; the third is literally identical across three rows, which would give three textboxes with one name. See Open Gap 2.
4. **Rationale clause.** The helper *They're shown by default so nothing disappears silently.* and the statement that a threshold excludes only classified stocks are rationale for server behaviour (DEC-0081); the pane maps `hide_incomplete` and the bounds one-to-one and adds no client-side exclusion.
5. **The story cites `ux-design.md` section 1.1 and classification-ui sections 2.4, 2.5 and 7.** Section 2.4 is the fetch layer and section 2.5 holds the pane; no conflict.
6. **The sibling S2 plan mislabels this story.** S2's dependency table says CAP-002-E4-S5 is "the as-of line, banner and poll" importing `formatTimestamp`; that is CAP-002-E4-S4. S5 imports `research-query.ts` and `copy.ts`, not `format.ts`. The graph edge stands. S2's plan is not edited here; correct the row at its next revision.

### Open Gaps

1. **The URL binding, the pane's props and who issues the list request. PROVISIONAL — awaiting owner confirmation (2026-10-17). Recorded as DEC-0156.** No artifact fixes any of them. Adopted: `useResearchQuery()` in `use-research-query.ts`, `FiltersPane({ showLookIn = true, activeInstruments = null, children })`, push navigation, and a probe host in the pane test. Derivation in the record. Follow-up: classification-ui section 2.5 should state the props and the hook at its next revision; E4-S9 and E1-S8 import the hook rather than decoding the URL themselves.
2. **Commit points, invalid-value handling, accessible-name uniqueness and focus after Clear. PROVISIONAL — awaiting owner confirmation (2026-10-17). Recorded as DEC-0157.** Adopted: selects commit on change, the value and search on blur or Enter, `Esc` clears search; a measure change that invalidates the value is a field error with no write; fields are text with decimal input mode; focus moves to *Find a stock* after Clear. The third accessible name, undetermined by the design as written (three rows share *Value threshold*), is adopted as *Value threshold* for the value row (verbatim) and *Value threshold for growth* / *Value threshold for momentum* on the others so each textbox is unique; this is a recorded extension of the design's names, not a replacement, and T002 asserts the value row verbatim. Follow-up: UX design 1.1 item 3 should state the per-factor names.
3. **Look in with a scope that is not an active universe. PROVISIONAL — awaiting owner confirmation (2026-10-17). Recorded as DEC-0158.** Adopted: an extra selected option labelled *Unavailable universe*; the pane neither clears nor judges the scope. Follow-up: UX design 1.1 item 2 should say how a retired or unknown scope reads.
4. **Strings the catalogue may lack.** S2 harvests the filter-pane wording but the placeholders, the factor display names, the threshold error sentences and the new *Unavailable universe* label may be missing. T009 adds them to `copy.ts` and its anchor test in this change (the precedent set by S3's plan), which is the only edit to a file another story delivers. Follow-up: none, unless S2's reviewer prefers the strings to move into S2.
5. **Swatch and error colour mechanism (not a product decision).** `design-system/theme.css` defines `--factor-value`, `--factor-growth`, `--factor-momentum` and `--destructive`, but `tailwind.config.js` maps none of them, and the delivered screens use `text-status-critical` for errors. The design asks for `--destructive` and the factor swatches by name, so both are set as inline `style` with `hsl(var(--token))`, which introduces no literal (STD-UI-29) and edits no delivered config. Follow-up: map the tokens in `tailwind.config.js` in a shell or design-system change if more consumers appear (S3's gap 4 is the same mechanism).
6. **Names of S1 and S2 exports.** Both stories are planned but not coded. Names this plan relies on are those S2's and S1's plans fix; the shipped files govern and T008 to T011 read them first.

### Other Notes

- **Cycle plan for T014.** Three TDD cycles, each RED then GREEN, each reviewed before the next: (1) T007 then T008 (`use-research-query.ts`); (2) T001, T002, T005 then T009 and T010 (`threshold-sentence.tsx` and any catalogue strings); (3) T003, T004, T006 then T011 (`filters-pane.tsx`). Cycle 3 is the largest; split it at the Look in part (T006 (b), (c), (i), (j)) if a review needs a smaller change set.
- **Code order.** S5 is coded after S1 and S2. The sentence tests import types only from S2 and run without the client, but the pane tests need S1's `listUniverses` mock target and `npx tsc --noEmit` needs both.
- **Story status.** The story's `status` moves from `todo` to `planning` in this change, as the S1 to S4 plans did; no other story line is touched.
- **Universe detail.** The *Members as of* field belongs to CAP-002-E1-S8 (its AC DAC-E1-S8-1); this story only provides the `children` slot and the `showLookIn={false}` mode. Look in is the only part of the pane that depends on `listUniverses`.
- **Sibling stories.** CAP-002-E4-S1 supplies `listUniverses`, `listClassifications` and the types the pane imports; CAP-002-E4-S3 (factor cell) and CAP-002-E4-S6 (results table) are results-side and share no import with the pane, so neither is a prerequisite; the table's sort requests and the pane's filter writes meet only in the URL.
- **Risk.** The largest risk is the seam between the pane and S9: if S9 decodes the URL itself instead of importing `useResearchQuery`, the two could disagree on pushes versus replaces. T007 pins the push behaviour and the doc comment names the contract.
