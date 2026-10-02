---
artifact_schema_version: 1
artifact_id: CAP-001-E6-S4-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-02
updated: 2026-10-02
story_id: "CAP-001-E6-S4"
story: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S4.md"
tasks: "docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S4-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-10-02T05:01:44Z"
reviewed_head: "d0a124ba79bc4cf4cc3ff1f7be29d6b31cabac3f"
review_base: "afacd44180b888d63de0f17c02cfe507554b58a2"
reviewed_state_revision: "sha256:95ee1af9d99cc7392cb7b96f87ce23273279655f84ef760d8d0aa0fc4d369d67"
verdict: PASS-WITH-WARNINGS
review_subjects:
  - artifact_id: CAP-001-E6-S4
    artifact_version: 1
    content_revision: sha256:99f8a1bbbf0fd82e63716a18c474bf0ecb011d8c5839671f5ba48730fcdfdac1
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5
  tool: Devin
  tool_version: unknown
  timestamp: 2026-10-02T05:01:44Z
  source_artifacts:
    - id: CAP-001-E6-S4
      version: "1"
    - id: CAP-001-E6-S4-tasks
      version: "1"
  invoking_user: alvarodejodra
  correlation_id: 897301a9-a728-4cc4-ab48-f8bc82dd95e2
---

# Implementation Review: CAP-001-E6-S4 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 1 |
| Low findings | 4 |
| Acceptance criteria | 14/14 satisfied |
| Planned tasks | 25/25 verified |
| Required validation | 6/6 passed |

Every acceptance criterion traces to concrete production code and to at least one
test whose assertions would fail under a plausible regression. All fourteen
mandatory TC-IDs the plan maps to this story are implemented with traceability
comments and are substantive rather than mock-shaped: the no-polling proof holds a
single `mockResolvedValueOnce` so a second fetch would throw rather than silently
pass; the gaps decision table pins the `available=false, gapCount=4` contradiction
that is the one case where a number could leak into the Gaps column; the session-date
test asserts byte identity on the two days a zone conversion would move. The wire
contract in `web/src/api/client.ts` was checked field-by-field against the actual
`CoverageResponse` in `src/factorflow/api/models.py` and the `expanded` exclusion
logic in `src/factorflow/api/routes/coverage.py`, not against the plan's description
of it. All six validation commands the plan and `tech-stack.md` require were rerun
independently from the repository root and exited 0, including the Playwright suite
against a real API and PostgreSQL container (3 passed). The working tree was clean
before and after.

No finding blocks the gate. One MEDIUM records a quietly weakened assertion in
TC-COMP-065 whose deviation from the plan is noted only in a test comment; the four
LOW findings are maintainability and evidence-quality items.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S4.md` |
| Task plan | `docs/capabilities/CAP-001-market-data-acquisition-foundation/epics/coverage-and-gap-visibility/stories/CAP-001-E6-S4-tasks.md` |
| Component | `FactorFlow-v2` |
| Branch | `usr/alvaro-de-jodra/CAP-001-E6-S4-run-20261002T044207Z` |
| HEAD | `d0a124ba79bc4cf4cc3ff1f7be29d6b31cabac3f` |
| Review base | `usr/alvaro-de-jodra/CAP-001-E6-integration-20261002T044207Z` @ `afacd44180b888d63de0f17c02cfe507554b58a2` (verified ancestor of HEAD) |
| Working tree | clean — no staged, unstaged or untracked non-ignored files, before and after validation |
| Changed files reviewed | 23 |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `tailwind.config.js` | modified | T001 (DAC-E6-S4-1, -3, -7) |
| `web/src/api/types.ts` | modified | T002 (AC-7, AC-8) |
| `web/src/api/client.ts` | modified | T003 (AC-7, AC-8) |
| `web/src/api/client.coverage.test.ts` | added | T012 (AC-7, AC-8) |
| `web/src/screens/coverage/test-fixtures.ts` | added | T004 |
| `web/src/screens/coverage/coverage.test.tsx` | added | T005 (AC-7, AC-17, AC-21, AC-22, DAC-E6-4, DAC-E6-S4-4, -6) |
| `web/src/screens/coverage/coverage-table.test.tsx` | added | T006 (AC-8, DAC-E6-S4-5) |
| `web/src/screens/coverage/coverage.polling.test.tsx` | added | T007 (DAC-E6-13) |
| `web/src/screens/coverage/cells.test.tsx` | added | T008, T010 (DAC-E6-S4-1, -2; DAC-E6-4) |
| `web/src/screens/coverage/badges.test.tsx` | added | T009 (DAC-E6-S4-3, -7) |
| `web/src/screens/coverage/uniform-shortfall.test.ts` | added | T011 (DAC-E6-S4-6) |
| `web/src/screens/coverage/copy.ts` | added | T013, T024 |
| `web/src/screens/coverage/badges.tsx` | added | T014 (DAC-E6-S4-3, -7; AC-22) |
| `web/src/screens/coverage/cells.tsx` | added | T015 (DAC-E6-S4-1, -2) |
| `web/src/screens/coverage/uniform-shortfall.ts` | added | T016, T024 (DAC-E6-S4-6) |
| `web/src/screens/coverage/coverage-table.tsx` | added | T017, T024 (AC-7, AC-8, AC-21, AC-22, DAC-E6-4) |
| `web/src/screens/coverage/index.tsx` | added | T018, T024 (AC-17, DAC-E6-13, DAC-E6-S4-4, -5, -6) |
| `web/src/app/routes.tsx` | modified | T019 |
| `web/src/app/shell.tsx` | modified | T020 (DAC-E6-S4-5) |
| `tests/e2e/fixtures/coverage-seed.sql` | added | T022 |
| `tests/e2e/coverage-expansion.spec.ts` | added | T023 (AC-8, DAC-E6-13, DAC-E6-S4-2, -5) |
| `.../stories/CAP-001-E6-S4-tasks.md` | modified | T001–T025 checkbox bookkeeping only (diff is 25 `[ ]`→`[x]` pairs; no prose altered) |
| `.../stories/CAP-001-E6-S4.md` | modified | frontmatter `status: planning` → `in-review`; no AC or technical text altered |

No changed file lacks a story or task justification. No scope leakage found: the one
file outside `web/src/screens/coverage/` and `web/src/api/` that the change touches
is `web/src/app/shell.tsx`, which T020 authorises and bounds to two class lists, and
the diff contains exactly those two lines. `ScreenPlaceholder` was deleted from
`routes.tsx` rather than kept, which is the branch T019 prescribes when CAP-001-E5-S6
has already replaced the `/runs` placeholder — it has (commit `1a0eb78`), and
`noUnusedLocals` would otherwise fail.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-7 | SATISFIED | `web/src/screens/coverage/coverage-table.tsx:11-23` (11 `th scope="col"` in the ux-design order), `:195-220` (four `PresenceBadge`, `SessionDate` range, `Timestamp` last-acquired) | `coverage.test.tsx` "renders the row's presence badges, range and Chicago last-acquired under the 11 headers" | Header list asserted by exact array equality, and each cell located by its column-header index rather than by position. |
| AC-8 | SATISFIED | `coverage-table.tsx:206-208` (count in the row via `GapsCell`), `:80-116, 240-285` (dates fetched once on expansion, cached, sorted) | `coverage-table.test.tsx` "shows counts, fetches dates once on Enter, caches them, and never fetches for a zero"; `tests/e2e/coverage-expansion.spec.ts` | Test proves no date is in the DOM before expansion and that collapse/re-expand issues no second call; the e2e proves exactly one `expand=CVC` request in a browser. |
| AC-17 | SATISFIED | `web/src/screens/coverage/index.tsx:89-90, 206` (`empty-never-populated` → `NEVER_ACQUIRED`, no table rendered) | `coverage.test.tsx` "states that no data has been acquired and renders no table and no zero" | `queryByRole("table")` null and `queryByText("0")` null, so an empty table cannot read as healthy. |
| AC-21 | SATISFIED | `coverage-table.tsx:176-204` (retired symbol muted, `LifecycleBadge` reused, range still rendered) | `coverage.test.tsx` "marks a retired row with the secondary badge and still shows its range and presence" | `data-variant="secondary"` and the full covered range both asserted on the same retired row. |
| AC-22 | SATISFIED | `coverage-table.tsx:209-213` (marker only when `depthShortByYears > 0`), `copy.ts:54-56` (`shortBy` singular/plural) | `coverage.test.tsx` "marks only positive shortfalls, singular and plural, and leaves the rest blank" | Covers 2, 1, `null` and `0`; `0` renders a blank Depth cell, matching the plan's Resolved Conflict 3. |
| DAC-E6-4 | SATISFIED | `cells.tsx:61-72` (`!available` → `GapsUnknownBadge` regardless of count), `coverage-table.tsx:148-150, 246-248` (reason once below the table and in the expansion) | `coverage.test.tsx` "renders Unknown with the indeterminate pattern and the reason once, and expansion does not fetch"; `cells.test.tsx` GapsCell decision table | The `available=false, gapCount=4` contradiction is pinned, so no number can leak. Reason sentence asserted to appear exactly once. |
| DAC-E6-13 | SATISFIED | `index.tsx:68-125` (one effect keyed on filters/cursor/reloadToken, no `setInterval`), `:188-192` (last-updated) | `coverage.polling.test.tsx` TC-COMP-039; `coverage-expansion.spec.ts:81-83` (15 s browser check) | 10 fake minutes produce exactly one fetch; the single `mockResolvedValueOnce` means a second call would reject rather than pass quietly. |
| DAC-E6-S4-1 | SATISFIED | `cells.tsx:9-34` (`MissingValue` / `CountValue` / `Inapplicable` with distinct `data-state` and visible text) | `cells.test.tsx` TC-COMP-059 (set sizes of states and texts both asserted as 3) | Also verified through the screen for a row with three `null` values. |
| DAC-E6-S4-2 | SATISFIED | `cells.tsx:41-52` (`formatSessionDate` identity; `Timestamp` delegates to the shell's `formatTimestamp`) | `cells.test.tsx` TC-COMP-060 (CDT and CST cases, plus `2024-01-01`/`2024-12-31` identity) | Session dates are never passed to `Date`, verified by reading the implementation, not only the test. |
| DAC-E6-S4-3 | SATISFIED | `badges.tsx:70-96` (three variants, each with label plus `svg` shape or em-dash glyph; `bg-pattern-indeterminate` on unknown only) | `badges.test.tsx` TC-COMP-061 | Tailwind emits `.bg-pattern-indeterminate{background-image:var(--pattern-indeterminate)}` and the four `value-*` utilities in the real build output, so the tokens are live and not merely configured. |
| DAC-E6-S4-4 | SATISFIED | `index.tsx:177-180` (Start control in the always-rendered toolbar), `:206-219` (distinct `NEVER_ACQUIRED` vs `NO_MATCH` copy with Reset) | `coverage.test.tsx` TC-COMP-062 cases (a) and (b) | Each case asserts the presence of its own copy *and* the absence of the other's, so the two states cannot converge. |
| DAC-E6-S4-5 | SATISFIED | `index.tsx:238` (`coverage-table-scroll` with `min-h-0 flex-1 overflow-auto`), `:246-271` (cursor-stack pager), `web/src/app/shell.tsx:54,65` (`h-screen`, scrolling `main`) | `coverage-table.test.tsx` TC-COMP-063 (50-row pages replace each other; filter is server-side; focus retained); `coverage-expansion.spec.ts:77-79` (page itself does not scroll) | Bounded-DOM pagination rather than virtualisation; STD-UI-30's virtualisation clause is a standing capability gap the story's own Open Questions and the plan's Open Gap 2 record, not a new defect. |
| DAC-E6-S4-6 | SATISFIED | `uniform-shortfall.ts:15-25`, `index.tsx:198-202` (note above the table) | `uniform-shortfall.test.ts` (4 cases incl. uncovered-row exclusion); `coverage.test.tsx` TC-COMP-064 uniform / mixed / single-row | Per-row badges and gap counts verified unchanged in the uniform case, so the note adds rather than replaces. |
| DAC-E6-S4-7 | SATISFIED | `badges.tsx:17-47` (check polyline, question path, warning triangle), `instruments/badges.tsx` (filled vs hollow square) | `badges.test.tsx` TC-COMP-065 | Signatures are label-plus-shape and survive stripping every `class` attribute, so no status depends on colour. See IR-001 for the narrowed distinctness set. |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | `tailwind.config.js:30-36` | Exactly the four colours plus `backgroundImage`; every value an `hsl(var(--x) / <alpha-value>)` or `var()` reference, no literal. Tokens confirmed to pre-exist in `design-system/theme.css:92-99`. |
| T002 | complete | VERIFIED | `web/src/api/types.ts:128-194` | All named types present with the required shapes and docstrings; session dates typed as `string`. |
| T003 | complete | VERIFIED | `client.ts:291-370` | Reuses `requestJson`; sends no `limit`/`from`/`to`; `null` and `0` copied through; missing `expanded` throws `ApiError` rather than returning `[]`. |
| T004 | complete | VERIFIED | `test-fixtures.ts:11-38` | Defaults match the plan exactly; exports no test cases. |
| T005 | complete | VERIFIED | `coverage.test.tsx` (7 `describe` blocks: TC-COMP-007/017/062/021/022/030/064) | Rendered inside `MemoryRouter`; `../../api/client` and `../runs/run-controls` mocked as the plan's conventions require. |
| T006 | complete | VERIFIED | `coverage-table.test.tsx` (TC-COMP-008, TC-COMP-063, plus the expansion-error and inapplicable-expansion cases) | Both "Additional" cases from the plan are present. |
| T007 | complete | VERIFIED | `coverage.polling.test.tsx` | Fake timers, `2026-09-06T15:00:00Z` system time, 10 fake minutes, Refresh at 15:10, `aria-busy` while pending, real timers restored in `afterEach`. |
| T008 | complete | VERIFIED | `cells.test.tsx:47-109` | TC-COMP-059 and TC-COMP-060 as specified, including the in-screen `MissingValue` check. |
| T009 | complete | VERIFIED | `badges.test.tsx` | TC-COMP-061 complete; TC-COMP-065 present with a narrowed distinctness set — see IR-001. |
| T010 | complete | VERIFIED | `cells.test.tsx:111-142` | All six decision-table rows plus both `reasonSentence` cases. |
| T011 | complete | VERIFIED | `uniform-shortfall.test.ts` | Empty, single, differing, `null`, `0` and uncovered-row cases all present. |
| T012 | complete | VERIFIED | `client.coverage.test.ts` | Separate file as planned; URL equality asserted exactly; `422` envelope and thrown-`fetch` paths both covered. |
| T013 | complete | VERIFIED | `copy.ts:11-56` | Three verbatim UX sentences byte-identical to the plan; `planLimitNote` and `shortBy` match the specified templates. |
| T014 | complete | VERIFIED | `badges.tsx:49-119` | Variants, test ids, classes and icon shapes all as specified; `LifecycleBadge` reused from `../instruments/badges` with no second lifecycle badge introduced. |
| T015 | complete | VERIFIED | `cells.tsx:9-72` | `formatTimestamp` imported from `../../app/status-region` (CAP-001-E1-S5) rather than re-implemented; `font-numeric` applied; `formatSessionDate` is the identity with the STD-UI-5 docstring. |
| T016 | complete | VERIFIED | `uniform-shortfall.ts:15-25` | Behaviour matches T011 exactly; docstring cites DAC-E6-S4-6, coverage-service §3 and Open Gap 3. |
| T017 | complete | VERIFIED | `coverage-table.tsx:54-286` | `aria-busy`, dimmed rows while refreshing, `useId`-based `aria-controls`, cancellation via a generation counter, all four expansion branches, single statement below the table. |
| T018 | complete | VERIFIED | `index.tsx:34-276` | All five `ScreenState` kinds and the docstring reasoning for the three never produced; toolbar order as planned; 250 ms debounce only for a non-empty symbol filter; cursor stack with conditional pager buttons; no interval. |
| T019 | complete | VERIFIED | `routes.tsx:3,27` | `/coverage` now renders `CoverageScreen`; other routes untouched; `routes.test.tsx` unmodified and passing. |
| T020 | complete | VERIFIED | `shell.tsx:54,65` | Exactly the two class-list changes T020 authorises, nothing else. |
| T021 | complete | VERIFIED | `npm run test` — `shell.test.tsx`, `shell.layout.test.tsx`, `shell.a11y.test.tsx`, `shell.status-region.test.tsx`, `shell.tokens.test.tsx`, `routes.test.tsx` all pass | Independently confirmed that no `src/app/*.test.tsx` file appears in the change set, so the suites really are unmodified. No `act(...)` warnings in the run output. |
| T022 | complete | VERIFIED | `tests/e2e/fixtures/coverage-seed.sql` | CVA/CVB/CVC with reference and prices segments; CVC's bar set omits 2024-01-04, which is what makes its gap count 1; `sha256(...)` value hash; `ON CONFLICT DO NOTHING` throughout. No `.spec.ts` suffix. |
| T023 | complete | VERIFIED | `tests/e2e/coverage-expansion.spec.ts` | All nine planned steps present. Step 2 waits on the filtered response rather than on the rows alone; justified in a code comment and in the commit message (the unfiltered page already holds the seeded rows). |
| T024 | complete | VERIFIED | `index.tsx:29-32,68`, `coverage-table.tsx:42-48,84`, `copy.ts:5-8`, `uniform-shortfall.ts:10-13` | Both required one-line comments present verbatim; Open Gaps 1, 3, 4, 6, 7, 8 and 9 cited by number in the four docstrings. |
| T025 | complete | VERIFIED | Independent rerun of all six commands — see Independent Validation | Every command exits 0 on the reviewer's own run; no tracked file modified. |

No unchecked task appears implemented, and no checked task lacks evidence.

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `coverage.test.tsx` "renders the row's presence badges…" / TC-COMP-007 | ADEQUATE | Exact header array, `scope` on every header, four presence badges inside the row, anchored regexes on the range and the Chicago timestamp. Reordering a column or converting the timestamp both fail it. | none |
| `coverage-table.test.tsx` "shows counts, fetches dates once on Enter…" / TC-COMP-008 | ADEQUATE | Pre-expansion absence of dates, keyboard `Enter`, `aria-expanded` transition, accessible-name flip, focus retention, call count and argument, ascending order from deliberately unsorted fixture data, cache survival across collapse, and no call for a zero count. Pre-loading dates, losing the cache or sorting by arrival all fail it. | none |
| `coverage.test.tsx` "states that no data has been acquired…" / TC-COMP-017 | ADEQUATE | Copy present, `table` absent, no `0` anywhere. A reassuring empty table fails it. | none |
| `coverage.test.tsx` "marks a retired row…" / TC-COMP-021 | ADEQUATE | `data-variant="secondary"`, label, and retained range and presence on the same row. | none |
| `coverage.test.tsx` "marks only positive shortfalls…" / TC-COMP-022 | ADEQUATE | 2 / 1 / `null` / `0` across four rows; the two non-shortfall Depth cells asserted empty with `/^$/`. Treating `0` as a shortfall fails it. | Traces to the story's AC-22, which differs from the component spec's TC-COMP-022 expected result — IR-004. |
| `coverage.test.tsx` "renders Unknown with the indeterminate pattern…" / TC-COMP-030 | ADEQUATE | Per-row badge variant, label, hatch class, absence of `0`, reason exactly once below the table, a second occurrence on expansion, and no fetch. | none |
| `coverage.polling.test.tsx` / TC-COMP-039 | ADEQUATE | One call over 10 fake minutes with a single `mockResolvedValueOnce`, unchanged last-updated text, then a controlled pending promise proving rows survive with `aria-busy="true"` and no loading message. Any accidental interval, and any collapse-to-loading on refresh, fail it. | none |
| `cells.test.tsx` TC-COMP-059 | ADEQUATE | Three distinct `data-state` values and three distinct *visible* texts (`sr-only` stripped), plus the in-screen case. Collapsing missing into blank fails it. | none |
| `cells.test.tsx` TC-COMP-060 | ADEQUATE | Byte identity on `2024-01-02`, `2024-01-01`, `2024-12-31`; CDT and CST renderings. Passing a session date through `Date` fails it. | none |
| `badges.test.tsx` TC-COMP-061 | ADEQUATE | Variant, label with hidden glyphs stripped, icon-or-glyph presence, and the hatch present on unknown but absent on absent. | none |
| `coverage.test.tsx` TC-COMP-062 | ADEQUATE | Both states assert their own copy and the other's absence; Reset clears the input and refetches with no `symbol`. | none |
| `coverage-table.test.tsx` TC-COMP-063 | ADEQUATE | Scroll container classes, server-side filter argument after the debounce, retained focus, polite count region, lifecycle filter, cursor on Next, body-row set equality against page two only, `S0001` gone, both pager buttons conditionally absent. A client-side filter or an accumulating list fails it. | Volume is proven by bounded 50-row pages rather than by rendering 3000 rows; that is the plan's deliberate design (Open Gap 2). |
| `coverage.test.tsx` TC-COMP-064 | ADEQUATE | Uniform, mixed and single-row cases; per-row badges and gap counts asserted unchanged in the uniform case. | none |
| `badges.test.tsx` TC-COMP-065 | ADEQUATE | Six pairwise-distinct label-plus-shape signatures, every label non-empty, and every signature unchanged after stripping all `class` attributes. | `GapsUnknownBadge` is asserted *equal* to the unknown presence badge instead of joining the distinctness set — IR-001. |
| `cells.test.tsx` GapsCell decision table (T010) | ADEQUATE | All six count/availability combinations including the contradictory `gapCount=4, available=false`, plus known and unknown reason codes. | `reasonSentence(null)` is not covered — IR-002. |
| `uniform-shortfall.test.ts` (T011) | ADEQUATE | Pure-function unit covering empty, single, differing, `null`, `0`, and uncovered-row exclusion in both directions. | none |
| `client.coverage.test.ts` (T012) | ADEQUATE | Exact URL equality, explicit absence of `limit`/`from`/`to`, full camelCase mapping object equality, `0`-vs-`null` preservation, `BRK.B` and `A&B` encoding, `gap_dates: null` passthrough, missing `expanded` rejection, `422` envelope and transport failure. Mocks `fetch` at the global boundary, so the real `requestJson` runs. | none |
| `tests/e2e/coverage-expansion.spec.ts` (T023) | ADEQUATE | Real browser, real API, real PostgreSQL. Gap counts read from the rendered cells, absence of any `expand=` request before expansion, exactly one after, unconverted `2024-01-02`, page does not scroll, and no further non-`expand` request over 15 s. | none |

Mocks were checked for validity. The screen suites mock only the module boundary
(`../../api/client`) with `vi.importActual` spread, so the real `CoverageScreen`,
`CoverageTable`, `GapsCell`, `uniformShortfallYears` and copy constants all execute.
`../runs/run-controls` is stubbed, which the plan mandates and which keeps CAP-001-E5-S6's
control under its own tests rather than duplicating them here; nothing about this
story's own behaviour is bypassed by it. `client.coverage.test.ts` stubs `fetch`
rather than the client, so the mapping code under test genuinely runs. Determinism:
the two suites that depend on time install fake timers and a fixed system time and
restore real timers in `afterEach`; no test depends on order, network or ambient
environment. The full suite was run once and passed 222/222 with no flake and no
`act(...)` warning.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `npm run format` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome format .` — check only, no `--write`; 75 files checked, no fixes applied. Satisfies `tech-stack.md`'s "format commands are checks, not rewrites". |
| `npm run lint` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `biome lint .` — 75 files, no diagnostics. The two `biome-ignore` directives in the change set were inspected: both suppress `useExhaustiveDependencies` for a deliberate token-based trigger and both carry a reason. |
| `npx tsc --noEmit` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | No output. |
| `npm run test` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | 36 files, 222 tests passed, 0 skipped. Includes the six untouched `src/app/*` shell/routes suites that render `/coverage`. |
| `npm run build` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | Vite production build, 58 modules. Emitted CSS confirmed to contain `.bg-pattern-indeterminate`, `.text-value-missing`, `.bg-value-missing-muted`, `.text-value-indeterminate` and `.bg-value-indeterminate-muted`. |
| `npm run test:e2e` | `repos/factorflow-v2/FactorFlow-v2` | 0 | PASS | `playwright test` against the real API on `127.0.0.1:8123` and the `factorflow-e2e-postgres` container. 3 passed in 21.2 s, including `coverage-expansion.spec.ts`. |
| `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src` | `repos/factorflow-v2/FactorFlow-v2` | N/A | NOT RUN | Not required: the task plan's Validation Plan names only the six frontend commands, and the change set contains no Python, no migration and no `pyproject.toml` change. The Python API was read, not modified, and `npm run test:e2e` exercises it live. Recorded as an explicit exclusion rather than a green result. |
| Manual keyboard and greyscale pass (plan's "Manual review" item) | — | N/A | NOT RUN | Not reproducible in an unattended run with no display. Partly compensated by automated evidence: TC-COMP-065 proves every status survives the removal of all colour classes, TC-COMP-008 proves the expander is reachable and operable by `Enter` with focus retained, and TC-COMP-063 proves the filter keeps focus. The screenshot check remains an owner action and is carried as IR-005. |

### Validation Side Effects

- Before: `git status --porcelain` empty on `usr/alvaro-de-jodra/CAP-001-E6-S4-run-20261002T044207Z` at `d0a124b`.
- After: `git status --porcelain` empty. `npm run build` and `npm run test` rewrote
  `src/factorflow/api/static/index.html` and `src/factorflow/api/static/assets/`,
  both of which are git-ignored (`git status --ignored=matching` reports them as
  `!!`), exactly as `tech-stack.md` records. `npm run test:e2e`'s `posttest:e2e` hook
  removed its own PostgreSQL container.
- Unexpected tracked-file changes: none.

## Findings

### IR-001 — TC-COMP-065's distinctness set silently drops one of the seven statuses the plan named

- **Severity**: MEDIUM
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S4-7
- **Tasks**: T009
- **Files**: `web/src/screens/coverage/badges.test.tsx:62-92`; `web/src/screens/coverage/badges.tsx:49-60,103-105`
- **Claim challenged**: T009's instruction to "collect a signature for each status the screen renders — the three presence badges; `<GapsUnknownBadge />`; `<DepthShortBadge years={2} />`; `LifecycleBadge` retired and active" and then "assert that all signatures are pairwise distinct".
- **Observed evidence**: the test builds a six-member `statuses` object that excludes `gapsUnknown`, asserts `new Set(signatures).size === signatures.length` over those six only, and then asserts the opposite for the seventh: `expect(signature(gapsUnknown)).toBe(signature(statuses.unknown))` (line 82). This is forced by the implementation, where `GapsUnknownBadge` delegates to the same `UnknownBadge` as the unknown presence state, so the two signatures are identical by construction.
- **Expected evidence/behavior**: either seven pairwise-distinct signatures as T009 specifies, or the deviation recorded where a reader of the plan will find it. `story-coding`'s completion step requires deviations from the task plan to be noted; the commit message notes the Playwright step-2 change but not this one.
- **Impact**: none on DAC-E6-S4-7 itself — a gaps-column *Unknown* and a presence *Unknown* are the same status, and reading the same is arguably the correct behaviour, so the AC ("every status remains distinguishable") is still met. The cost is evidential: a reviewer who trusts the TC-ID mapping would believe seven statuses were proven mutually distinguishable when six were, and the justification lives only in a two-line comment inside the test.
- **Required remediation**: record the deviation against T009 in the task plan's notes (or in the doc-sync summary) stating that the gaps-column Unknown deliberately shares the presence-Unknown signature, so the narrowed assertion is a decision rather than an omission. No code change is needed.

### IR-002 — The `gapDates === null` and `reason === null` fallbacks render "Gap detection is unavailable (no reason given)" on an available view, untested

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-4 (edge), AC-8
- **Tasks**: T013, T017
- **Files**: `web/src/screens/coverage/coverage-table.tsx:274-276`; `web/src/screens/coverage/copy.ts:26-31`
- **Claim challenged**: T017's "If `gapDates` comes back `null`, it falls back to the reason sentence", and T010's specification of `reasonSentence` for an unknown code.
- **Observed evidence**: line 274 is reached only when `gapDetection.available` is true (lines 246-248 already returned otherwise), so `gapDetection.reason` is `null` there, and `reasonSentence(null)` returns `Gap detection is unavailable (no reason given).` — a sentence no artifact words. Neither this branch nor `reasonSentence(null)` has a test: `cells.test.tsx:136-141` covers the known code and `"something_new"` only.
- **Expected evidence/behavior**: the plan specifies the fallback's target but not its wording for a `null` reason; the sentence the user would see contradicts the view, which reports detection as available.
- **Impact**: minimal in practice. On the service side a positive `gap_count` implies prices coverage and an available view, in which case `read_gap_dates` returns a list, so the branch is close to unreachable. If it ever fires, the owner sees a self-contradictory sentence.
- **Required remediation**: either give the branch its own copy constant for "dates could not be read for this instrument" and a test, or add a brief comment at `coverage-table.tsx:274` recording that the branch is defensive and why the reason sentence is the chosen fallback.

### IR-003 — A successful refresh collapses every expanded row, which no artifact asks for

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: AC-8
- **Tasks**: T017, T018
- **Files**: `web/src/screens/coverage/coverage-table.tsx:74-78`; `web/src/screens/coverage/index.tsx:88,243`
- **Claim challenged**: T017's "the expansion cache clears when `refreshToken` changes".
- **Observed evidence**: `index.tsx:88` increments `responseToken` on every successful response and passes it as `refreshToken`, and the effect at `coverage-table.tsx:74-78` calls both `setGapDates({})` **and** `setExpanded({})`. Clearing the cache is planned; clearing `expanded` is an additional effect the plan does not mention. The consequence is that pressing *Refresh* closes a row the owner had opened, and the next expansion refetches.
- **Expected evidence/behavior**: the plan asks only for cache invalidation. Collapsing is a reasonable conservative choice on a filter or page change, where the row may no longer exist, but on a plain refresh of the same page it discards the owner's state.
- **Impact**: a small interaction regression on the screen whose whole point is inspection; no AC is violated, since AC-8 only requires the dates to sit behind expansion.
- **Required remediation**: either keep `expanded` across a same-filter refresh and clear only the cache, or record the collapse as a deliberate choice in `CoverageTable`'s docstring alongside the existing cache note.

### IR-004 — `// Implements TC-COMP-022` labels a test that does not exercise that TC's expected result

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: AC-22
- **Tasks**: T005
- **Files**: `web/src/screens/coverage/coverage.test.tsx:180-208`; `docs/capabilities/CAP-001-market-data-acquisition-foundation/tests/component/all-component-tests.md:491-511`
- **Claim challenged**: the traceability comment asserting that this test implements TC-COMP-022.
- **Observed evidence**: the component test specification's TC-COMP-022 expected result is "Deepening backfills history: when the owner-operator increases the stated history depth, the next acquisition run MUST acquire the missing earlier range…" — a backend acquisition behaviour. The story restates AC-22 as "Given an instrument short of the stated depth, When it renders, Then it shows as short by a stated number of years", and the test implements the story's wording. The two do not describe the same behaviour.
- **Expected evidence/behavior**: a TC-ID mapping should point at a test that exercises what the specification says. The task plan anticipated the mismatch in general terms ("the component test spec's steps are generic boilerplate… that AC is the source of truth"), and the story is approved, so the implementation followed the right source. The defect is upstream, in the specification's restatement of AC-22.
- **Impact**: no behaviour is wrong and no story AC is unmet, but the coverage matrix now reads as though the backfill behaviour has a component test on this branch when it does not.
- **Required remediation**: no code change. Carry to doc-sync as a specification follow-up so TC-COMP-022's expected result is split or renumbered against the capability's AC-22 and the story's rendering criterion.

### IR-005 — The plan's two manual review items remain unperformed

- **Severity**: LOW
- **Status**: OPEN
- **Acceptance criteria**: DAC-E6-S4-7, DAC-E6-S4-5
- **Tasks**: T025 (Validation Plan, "Manual review")
- **Files**: `docs/.../CAP-001-E6-S4-tasks.md:770-773`
- **Claim challenged**: the plan's own statement that manual review is required "because Biome carries no `jsx-a11y` equivalent (owner-web-app section 4)", listing a keyboard pass through filter → lifecycle → Start → Refresh → expanders → pager and a greyscale screenshot of a populated screen.
- **Observed evidence**: no record of either exists in the change set or the commit message, and neither can be performed in an unattended run with no display. `tech-stack.md` likewise records that accessibility expectations "are enforced by review rather than by a linter".
- **Expected evidence/behavior**: an owner-run keyboard and greyscale pass, or an explicit acceptance that the automated substitutes suffice.
- **Impact**: the automated evidence covers most of it — TC-COMP-065 proves every badge survives the removal of all colour classes, TC-COMP-008 proves the expander is keyboard-operable with focus retained, TC-COMP-063 proves the filter keeps focus, and the Playwright spec drives the expansion by `Enter` in a real browser. What no test covers is tab order across the whole toolbar and a human look at the rendered greyscale result.
- **Required remediation**: owner action at the doc-sync or release-readiness boundary; not a Coding Agent task and not a gate blocker.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified, recorded by the author.** `tests/e2e/coverage-expansion.spec.ts:49-55` waits
  on the debounced filter's response rather than on the rows alone, because the
  unfiltered first page can already contain the seeded rows. Noted in the commit
  message and in a code comment.
- **Justified, prescribed by the plan.** `ScreenPlaceholder` was deleted from
  `routes.tsx` rather than kept. T019 instructs exactly this when CAP-001-E5-S6 has
  already replaced the `/runs` placeholder, which it has (`1a0eb78`); keeping the
  function would fail `noUnusedLocals`.
- **Justified, within the plan's latitude.** `index.tsx` keeps `lastLoadedAt` as its
  own state and reads it for the toolbar, where T018 describes reading `fetchedAt`
  from the `populated` state. The implementation is strictly better — it shows a
  last-updated time in the empty and never-acquired states too, which T018 requires
  the toolbar to survive into — but it leaves `populated.fetchedAt` (`index.tsx:94`)
  set and never read. Harmless; `ScreenState` requires the field.
- **Not recorded by the author.** The TC-COMP-065 narrowing described in IR-001.
- **Known, pre-existing, not introduced here.** STD-UI-30's virtualisation clause is
  only partly met: the screen provides search and filter and bounds the DOM with
  keyset pages that replace each other, but adds no virtualisation library. The
  story's own Open Questions and the plan's Open Gap 2 both record this, and
  capability section 5.4 and owner-web-app OQ 2 already route it. It is not a finding
  against this story.
- **Three hard dependency edges the plan declared new** (CAP-001-E1-S5,
  CAP-001-E2-S4, CAP-001-E5-S6) are present in
  `docs/capabilities/CAP-001-market-data-acquisition-foundation/dependencies.yaml:43`.
  Open Gap 7's coordinator action — plan or implement CAP-001-E5-S6 first — was
  honoured: `StartRunControl` exists at `web/src/screens/runs/run-controls.tsx` with
  the `historyDepthYears` / `activeInstrumentCount` props `index.tsx:177-180` supplies.

## Follow-Up

- **Next agent**: Doc Sync Agent
- **Required action**: proceed with doc-sync for CAP-001-E6-S4 against this report.
  Carry IR-001 into the task plan's notes as a recorded deviation, and IR-004 into
  the specification follow-up list (TC-COMP-022's expected result does not match the
  story's AC-22 rendering criterion). IR-005 is owner action at a later boundary.
- **Warnings accepted downstream**: IR-001 (MEDIUM), IR-002, IR-003, IR-004, IR-005 (LOW)
