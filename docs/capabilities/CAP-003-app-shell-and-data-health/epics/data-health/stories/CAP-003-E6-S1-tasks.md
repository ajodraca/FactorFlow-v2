---
artifact_schema_version: 1
artifact_id: CAP-003-E6-S1-tasks
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
  timestamp: 2026-11-07T06:20:14Z
  source_artifacts:
    - id: CAP-003-E6-S1
      version: "1"
    - id: CAP-003-E6
      version: "2"
    - id: CAP-003
      version: "1"
    - id: CAP-003-component-design-data-health-ui
      version: "1"
    - id: CAP-003-component-design-ui-components
      version: "1"
    - id: CAP-003-component-design-owner-shell
      version: "1"
    - id: CAP-003-component-design-data-health-api
      version: "1"
    - id: CAP-003-component-design-data-health-reader
      version: "1"
    - id: CAP-003-component-design-home-ui
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: CAP-003-data-health-ui-tests
      version: "1"
    - id: CAP-003-E1-S1-tasks
      version: "1"
    - id: CAP-003-E1-S5-tasks
      version: "1"
    - id: CAP-003-E1-S6-tasks
      version: "1"
    - id: CAP-003-E1-S7-tasks
      version: "1"
    - id: CAP-003-E3-S1-tasks
      version: "1"
    - id: CAP-003-E3-S3-tasks
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Tasks: CAP-003-E6-S1 — The Verdict and the Three Check Cards

**Story**: `repos/factorflow-v2/FactorFlow-v2/docs/capabilities/CAP-003-app-shell-and-data-health/epics/data-health/stories/CAP-003-E6-S1.md`
**Component**: `FactorFlow-v2` (web interface, `web/src/`; design module `data-health-ui`)
**Branch**: `usr/alvaro-de-jodra/CAP-003-tasks`
**Date**: 2026-11-07

## Summary

Data health opens with one sentence saying whether the data can be trusted and three cards saying what each check found (AC-11). This story creates the first files of `web/src/screens/data-health/` (data-health-ui 2.1). `copy.ts` holds every owner-facing string this story renders. Sibling stories E6-S2 to E6-S5 add theirs to the same module. `verdict.tsx` renders the page header: the `h1` *Is the data good enough to trust?*, with **Full coverage table** and a **Download now** slot to its right. Under it sits the verdict. Its badge is `worstDataTier` (CAP-003-E1-S7) over the aggregate's `affected_count` and `followed_count` and attention's `latest_terminal_download.state`. The sentence is composed per data-health-ui 2.3, with the badge as its first clause, singular forms, and the download clause replacing the count clause's full stop. When gap detection could not run, the check is named after the sentence. Below that comes *checked {time}* from the aggregate. While attention loads, the verdict renders a skeleton. While attention fails, it renders *Couldn't read what needs attention: {reason}.* with **Try again** and computes no tier (DAC-E6-2). `check-card.tsx` is the check-card composition (UX design §3), with the shared read-failure body and skeleton line. `daily-prices-card.tsx`, `financials-card.tsx` and `scores-card.tsx` implement data-health-ui 2.4. Their result lines omit zero parts and never show a null as `0`. They list up to five exception symbols, with *and {k} more* computed from `exception_count`, and carry the STD-UI-18 scope notes. The Factor scores card reads the shell's summary: *{k} stocks show as Incomplete* comes from `stocks_current` alone, and *Scores {time} · from the download started {start time}* links the start time to the download. Every input arrives as a prop from the screen (CAP-003-E6-S5), so this story mounts no provider and makes no request. The tests are `verdict.test.tsx` and `check-cards.test.tsx`.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-11 | Data health opens with a one-sentence verdict naming how many followed stocks need attention, and the three check cards each with tier and as-of | T002, T003, T005, T006, T008, T012, T013, T014, T015, T016, T017 |
| AC-8 | The Factor scores card reads the shell's summary | T005, T016 |
| AC-24 | A null part is never `0`; a not-determinable check renders as such | T002, T004, T005, T007, T008, T014, T015, T016, T017 |
| DAC-E6-1 | Verdict badge from `worstDataTier` over the aggregate's counts and attention's latest terminal download; the sentences as stated; checks' tiers do not feed it; a not-determinable check named after the sentence | T006, T008, T012, T017 |
| DAC-E6-2 | Skeleton while attention loads; header kept with the error and **Try again** while it fails, no tier computed | T007, T013, T017 |
| DAC-E6-3 | Daily prices card labels, result line, gap part, as-of, exceptions and scope note | T002, T014 |
| DAC-E6-4 | Company financials card labels, result line, as-of, exceptions and note | T003, T015 |
| DAC-E6-5 | Factor scores card from the summary in every state, *k* from `stocks_current` alone, as-of with the start-time link | T005, T016 |
| DAC-E6-S1-1 | The three named sentences (1 of 10 partial; 10 of 10 critical; failed with 0 affected) | T006, T012, T017 |
| DAC-E6-S1-2 | Null `gap_stock_count`: the gap part *Gaps not determinable: {reason}* as `coverage-unknown`, the other parts still render, and the verdict names it | T002, T008, T011, T012, T014, T017 |
| DAC-E6-S1-3 | *and 2 more* at `exception_count` 7 with five shown; none at 5 (DEC-0220) | T002, T014 |
| DAC-E6-S1-4 | No DAC-E7-3 term in visible text or accessible names; labels from `labelOf` or `copy.ts` | T009, T010, T011, T012 |
| DAC-E6-S1-5 | Every status through `StatusBadge` with label text and an `aria-hidden` shape; not determinable through `NotDeterminable`; never colour alone | T009, T010, T013, T014, T015, T016, T017 |

Mapped test cases (from `tests/component/data-health-ui-tests.md`, confirmed in `tests/coverage-matrix.md` lines 269–273 and 286–290): **TC-COMP-148** (DAC-E6-2), **TC-COMP-149** (DAC-E6-4), **TC-COMP-150** (DAC-E6-5, AC-8), **TC-COMP-156** (DAC-E6-S1-1, DAC-E6-1), **TC-COMP-157** (DAC-E6-S1-2, DAC-E6-3), **TC-COMP-158** (DAC-E6-S1-3, DAC-E6-3), **TC-COMP-159** (DAC-E6-S1-4, AC-19), **TC-COMP-160** (DAC-E6-S1-5, AC-20). The specification is `status: draft`. Its steps are used as written and sharpened below. Other cases on the AC-11 and AC-24 rows belong to other stories. TC-COMP-151 (null checks, DAC-E6-7) and TC-COMP-155 (per-card read errors, DAC-E6-17) are S5's and S4's, though this story's cards support them (Other Notes). TC-COMP-026 is E1-S7's. TC-INT-014, TC-INT-015 and TC-INT-017 belong to integration automation. No integration or end-to-end case is owned by this story.

## Phase 1: Setup

**Purpose**: Confirm the baseline and the six hard dependencies' exports.

- [ ] T001 From the repo root run `npm ci` and `npm run test`, and record the baseline as green. Confirm, without editing anything, that each hard dependency's deliverable exists. STOP and report if any is missing:
  - (CAP-003-E1-S1) `web/src/components/ui/card.tsx` exports `Card` (`variant` `"default" | "metric" | "summary"`), `CardHeader`, `CardTitle` (an `h2`) and `CardContent`. `web/src/components/ui/button.tsx` exports `Button` with `variant` `outline` and `asChild`. `web/src/components/ui/badge.tsx` renders `data-variant`.
  - (CAP-003-E1-S5) `web/src/components/patterns/tiers.ts` exports `tierOf`, `labelOf` and `type Status`, with the `check` and `scores` members. `web/src/components/patterns/status-badge.tsx` exports the six-tier `StatusBadge({ tier, children })`.
  - (CAP-003-E1-S6) `web/src/components/patterns/presence.tsx` exports `Absent({ label })` and `NotDeterminable({ reason, label? })`. `web/src/components/patterns/format.ts` exports `formatInstant`, `formatClock`, `formatSessionDate` and `formatCount`.
  - (CAP-003-E1-S7) `web/src/components/patterns/worst-data-tier.ts` exports `worstDataTier` and `type DataAnswer`.
  - (CAP-003-E3-S1) `web/src/app/shell-types.ts` exports `ReadState`, `ScoreState`, `Attention`, `DataHealth` and `ScoreSummary`.
  - (CAP-003-E3-S3) `web/src/app/shell-context.tsx` exports `useShell`, and `web/src/app/use-data-health.ts` exports `useDataHealth`. Neither is imported here (Other Notes), but the screen that feeds these props needs both.
  - `web/src/screens/data-health/` does not exist yet.
  
  Check with `grep -nE "export (function|const|type|interface) (Card|CardHeader|CardTitle|CardContent|Button|tierOf|labelOf|Status|StatusBadge|Absent|NotDeterminable|formatInstant|formatClock|formatSessionDate|formatCount|worstDataTier|DataAnswer|ReadState|ScoreState|Attention|DataHealth|ScoreSummary)\b" web/src/components/ui/*.tsx web/src/components/patterns/*.ts* web/src/app/shell-types.ts`. No package is added by this story (traces to AC-11).

**Checkpoint**: Baseline green; every import this story makes resolves; nothing changed.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that pin each sentence, label, tier, part and state before any component exists.

**Shared harness (copied into each of the two test files, since test files share no module).**

- **Fixtures.** Independent literals typed by CAP-003-E3-S1's `Attention`, `DataHealth` and `ScoreSummary`, never built by the code under test:
  - `DH(over)` returns a `DataHealth` with these defaults: `checked_at "2026-10-30T19:03:12Z"`, `never_acquired false`, `followed_count 10`, `affected_count 0`, `checks.daily_prices` `{ status "ok", absent_count 0, gap_stock_count 0, behind_count 0, latest_session "2026-10-29", gap_detection { available true, reason null }, exception_count 0, exception_symbols [] }`, `checks.company_financials` `{ status "ok", absent_count 0, problem_count 0, as_of "2026-10-30T18:00:00Z", exception_count 0, exception_symbols [] }`, and `problems { rows [], next_cursor null }`.
  - `ATT(state)` returns an `Attention` whose `latest_terminal_download` is `{ run_id "r-1", state, ended_at "2026-10-30T18:30:00Z", failure_reason null }`, or `null` when `state` is `null`. It deliberately carries `checked_at "2026-10-30T19:59:59Z"`, `followed_count 99` and `problems.stock_count 7`, values that differ from the aggregate's, so a component reading them instead is caught.
  - `ok(data)` is `{ kind: "ok", data, checkedAt: new Date("2026-10-30T19:03:12Z") }`.
- **Errors.** `INTERNAL` is `new ApiError("database said no", "req-9f3", { code: "internal_error" })`. `UNREACHABLE` is `new ApiUnreachableError("fetch failed")`. Neither message nor request id may ever reach the DOM.
- **Render.** Each test renders `<MemoryRouter>` (react-router-dom 6, delivered) around the component, with props only. No provider is mounted and `fetch` is never called (assert `expect(fetch).not.toHaveBeenCalled()` once per file in an `afterEach`). Times are rendered through CAP-003-E1-S6's formatters (America/Chicago). `2026-10-30T19:03:12Z` is `14:03:12 CDT`, because DST ends 2026-11-01. Expected strings are written out as literals.
- **Assertions.** Sentences use `toHaveTextContent` on the containing element with an exact string, normalised by RTL. Badges are found by `data-variant` (`status-<tier>` and `coverage-unknown`) and compared to literal values.

### Mandatory Component Tests

- [ ] T002 [P] Implement **TC-COMP-157 (card half)** and **TC-COMP-158** with the DAC-E6-3 label rows. Write them as `describe("Daily prices card (TC-COMP-157, TC-COMP-158, DAC-E6-3, DAC-E6-S1-2, DAC-E6-S1-3)")` in a new `web/src/screens/data-health/check-cards.test.tsx`, with `// Implements TC-COMP-157` and `// Implements TC-COMP-158`. Render `<DailyPricesCard check={…} followedCount={…} />`.
  - (a) **`ok`** (TC-COMP-157 edge), with `followedCount` 1236: the region named *Daily prices* has a `status-good` badge reading *No missing prices or gaps*. The result line reads exactly *All 1,236 stocks have prices to 2026-10-29*. The as-of line reads *Prices to 2026-10-29*, with no exception symbols and no *more*.
  - (b) **Gaps not determinable** (TC-COMP-157), with status `exceptions`, `absent_count` 2, `gap_stock_count` null, `behind_count` 1, `gap_detection { available false, reason "fewer_than_two_instruments_with_data" }`, `exception_count` 3 and symbols `["AAA","BBB","CCC"]`:
    - The header badge is `status-warning` *Needs attention*.
    - Inside the result line, a `coverage-unknown` badge reads *Gaps not determinable*. Its accessible description is *fewer than two followed stocks hold daily prices* (DEC-0374).
    - The result line's text is exactly *2 without prices, Gaps not determinable fewer than two followed stocks hold daily prices, 1 behind 2026-10-29*. The NotDeterminable layout supplies the separation, per Other Notes.
    - The raw code `fewer_than_two_instruments_with_data` appears nowhere in `container.textContent`.
    - No `0` part appears.
  - (c) **`not_determinable` status**, with all counts 0, `gap_stock_count` null and the same reason: the header carries `NotDeterminable`, a `coverage-unknown` badge reading *Not determinable* whose accessible description is the reason sentence. The result line is only the gap part, never *All 10 stocks have prices*. No `status-good` badge appears.
  - (d) **Zero parts omitted / null never `0`**:
    - `absent_count` 0, `gap_stock_count` 2 and `behind_count` 0 give exactly *2 with gaps*.
    - `absent_count` 3, `gap_stock_count` 0 and `behind_count` 0 give exactly *3 without prices*, never *0 with gaps*.
    - In (b) the text contains no `0 with gaps`.
  - (e) **Exceptions** (TC-COMP-158), using five symbols `["AAA","BBB","CCC","DDD","EEE"]`:
    - `exception_count` 7: the as-of line reads exactly *Prices to 2026-10-29 · AAA, BBB, CCC, DDD, EEE and 2 more*.
    - `exception_count` 6: *… and 1 more*.
    - `exception_count` 5: *Prices to 2026-10-29 · AAA, BBB, CCC, DDD, EEE*, with no *more*.
    - Three symbols `["AAA","BBB","CCC"]` with `exception_count` 4: *Prices to 2026-10-29 · AAA, BBB, CCC and 1 more*. With `exception_count` 3: no *more*.
  - (f) **`latest_session` null**, with `absent_count` 10 and status `exceptions`: the as-of line holds *Prices to* followed by an `Absent` em dash whose hidden text is *no prices stored yet*. No `null`, `undefined` or `0` appears for the date.
  - (g) **Scope note**: the region contains the verbatim *Gaps and currency are judged against the days and the newest session other followed stocks hold. FactorFlow has no trading calendar, so a day with no download leaves nothing to detect.* and a link named *Full coverage table* with `href="/data/coverage"`.

  Kills:
  - swap-case `status-good`→`status-warning` on the `ok` tier (a)
  - negate-boolean on the `gap_stock_count === null` branch (b, d: `0 with gaps` or a missing part)
  - off-by-one `count > 0` → `>= 0` on the zero-part filter (d)
  - off-by-one on `k > 0` (e at 5 shows *and 0 more*)
  - a hand-written `k = exception_count - 5` (e: the three-symbol row with count 4 shows nothing instead of *and 1 more*)
  - drop-field-copy of `latest_session` (a)
  - remove-attribute of the scope note's link `to` (g)
- [ ] T003 Implement **TC-COMP-149** (Company financials card labels, result line, as-of and note). Write it as `describe("Company financials card (TC-COMP-149, DAC-E6-4)")` in `web/src/screens/data-health/check-cards.test.tsx`, after T002 in the same file, with `// Implements TC-COMP-149`.
  - (a) **`ok`**, `followedCount` 30: `status-good` *All financials present*. The result line is exactly *All 30 stocks have financials*. The as-of line is exactly *Financials to 2026-10-30 13:00 CDT* (from `as_of "2026-10-30T18:00:00Z"`, with the zone).
  - (b) **`exceptions`**, with `absent_count` 2, `problem_count` 1, `exception_count` 3 and symbols `["AAA","BBB","CCC"]`: `status-warning` *Needs attention*. The result line is exactly *2 without financials, 1 with failed downloads*. The as-of line is *Financials to 2026-10-30 13:00 CDT · AAA, BBB, CCC*.
  - (c) **Zero part omitted**: `absent_count` 0 and `problem_count` 4 give exactly *4 with failed downloads*. `absent_count` 5 and `problem_count` 0 give exactly *5 without financials*.
  - (d) **TC edge `as_of` null**: *Financials to* followed by an `Absent` em dash with hidden *no financials stored yet*.
  - (e) **Note**: the region contains *Checks that financials are present and downloaded, not that they are correct.*

  Kills:
  - swap-case of the `ok` label to the Daily prices label (a)
  - drop-field-copy of `problem_count` → `absent_count` (b: *2 with failed downloads*)
  - negate-boolean on the zero filter (c)
  - `formatInstant` replaced by `formatSessionDate` or raw text (a: the zone is missing)
- [ ] T004 Write the check cards' null state, the rendering DAC-E6-7 requires and that CAP-003-E6-S5 composes. Write it as `describe("Check cards' null state (DAC-E6-7 support, AC-24)")` in `web/src/screens/data-health/check-cards.test.tsx`, after T003. Render `DailyPricesCard` and `FinancialsCard` with `check={null}` and `followedCount` 10. For each:
  - The region keeps its `h2` (*Daily prices*, *Company financials*).
  - No element carries a `data-variant` beginning `status-` and no `coverage-unknown` badge renders. The tier slot and the result line are each an `Absent` em dash (`aria-hidden` dash) with the hidden text *no data stored yet*.
  - The text contains neither *No missing prices or gaps*, *All financials present* nor *All 10 stocks*.

  Kills:
  - negate-boolean on the `check === null` guard (a passed check renders)
  - swap-case `Absent` → `NotDeterminable` (a `coverage-unknown` badge appears; Resolved Conflict 3)
- [ ] T005 Implement **TC-COMP-150** (Factor scores card from the shell summary in every state), with the states the card table leaves open. Write it as `describe("Factor scores card (TC-COMP-150, DAC-E6-5, AC-8)")` in `web/src/screens/data-health/check-cards.test.tsx`, after T004, with `// Implements TC-COMP-150`. Render `<ScoresCard scores={…} onRetryScores={spy} />`. `SUMMARY(over)` is a served `ScoreSummary` with these defaults: `never_classified false`; `set { set_id "s-1", run_id "run-42", run_started_at "2026-10-30T14:00:00Z", ended_at "2026-10-30T16:45:00Z", active_instruments 12, not_current false, … }`; `later null`; `stocks_current { current_count 9, followed_count 12 }`. It is wrapped as `{ kind: "served", data, checkedAt }`.
  - (a) **Not served** (`{ kind: "not_served" }`): `NotDeterminable`, a `coverage-unknown` badge *Not determinable* whose accessible description and visible reason are *FactorFlow can't read scores yet.*. The sentence appears exactly once. No `status-*` badge, no result line, no *Scores* line.
  - (b) **The five summary states**, each asserted as a `data-variant` literal plus the label:
    - `never_classified true`, `set null`, `stocks_current null`, `later null`: `status-neutral` *No scores yet*.
    - `later { state "building", … }`: `status-active` *Updating*.
    - `later { state "failed", … }`: `status-critical` *Score update failed*.
    - `set.not_current true`, `later null`: `status-warning` *Not reflecting the latest download*. This fixture is synthetic, per Resolved Conflict 5.
    - The default: `status-good` *Current*.
    - Table order: `later` building together with `set.not_current true` gives *Updating*, never *Not reflecting the latest download*.
  - (c) **Result line**, default fixture: exactly *9 of 12 stocks current*, then exactly *3 stocks show as Incomplete until their data is complete*. With `current_count` 12, the result is *12 of 12 stocks current* and there is no *Incomplete* sentence.
  - (d) **TC edge, *k* never from another `followed_count`**: the default fixture's `set.active_instruments` is 12. The component receives no attention or aggregate prop at all, so no other count can leak in. Additionally, `stocks_current { current_count 9, followed_count 15 }` gives *9 of 15 stocks current* and *6 stocks show as Incomplete…*.
  - (e) **As-of**: the line reads exactly *Scores 2026-10-30 11:45 CDT · from the download started 2026-10-30 09:00 CDT*. The start time is a link with `href="/data/downloads/run-42"` whose name is *2026-10-30 09:00 CDT*.
  - (f) **`stocks_current` null with a served summary** (`never_classified true`): the result line is an `Absent` em dash with hidden *no scores yet*, never *0 of …* (DEC-0375). There is no *Scores* line while `set` is null.
  - (g) **`{ kind: "loading" }`**: the region keeps its `h2` *Factor scores*, a descendant carries `aria-busy="true"`, and no badge renders.
  - (h) **`{ kind: "error", error: INTERNAL, last: SUMMARY().data }`**: renders exactly as the default fixture (*Current*, *9 of 12 stocks current*), per owner-shell 2.4, which keeps the last value.
  - (i) **`{ kind: "error", error: INTERNAL, last: null }`**: the `h2` is kept. A `role="status"` element reads exactly *Couldn't read the factor scores: FactorFlow hit an unexpected problem.* (DEC-0376 and -1). A *Try again* button calls `spy` once on click. Neither *req-9f3* nor *database said no* appears.

  Kills:
  - swap-case `building`↔`failed` in the state derivation (b)
  - reordering `not_current` before `later` (b, table order)
  - drop-field-copy `current_count` → `followed_count` (c)
  - off-by-one `k > 0` → `k >= 0` (c: *0 stocks show…*)
  - drop-field-copy `set.run_id` → `set.set_id` in the link (e: `href` ends `s-1`)
  - `set.ended_at` swapped for `set.started_at` (e)
  - negate-boolean on the `last !== null` branch (h, i)
- [ ] T006 [P] Implement **TC-COMP-156** (Verdict sentences: singular, all affected, failed download) with the whole DAC-E6-1 table. Write it as `describe("Verdict sentence (TC-COMP-156, DAC-E6-1, DAC-E6-S1-1)")` in a new `web/src/screens/data-health/verdict.test.tsx`, with `// Implements TC-COMP-156`. Render `<Verdict attention={ok(ATT(s))} dataHealth={ok(DH({ affected_count: n, followed_count: m }))} onRetryAttention={…} onRetryDataHealth={…} downloadNow={<button type="button">Download now</button>} />`. The verdict sentence is the element `getByTestId("verdict-sentence")`. `it.each` rows, each giving the badge's `data-variant` and the exact sentence text:
  - `succeeded`, 0 of 10: `status-good`, *Yes. None of the 10 followed stocks needs attention.*
  - `partial`, 1 of 10 (step 1): `status-warning`, *Mostly yes. 1 of 10 followed stocks needs attention; its scores show as Incomplete until it's fixed.*
  - `succeeded`, 2 of 10: `status-warning`, *Mostly yes. 2 of 10 followed stocks need attention; their scores show as Incomplete until they're fixed.*
  - `succeeded`, 10 of 10 (step 2): `status-critical`, *No. 10 of 10 followed stocks need attention; their scores show as Incomplete until they're fixed.*
  - `failed`, 0 of 10 (step 3): `status-critical`, *No. None of the 10 followed stocks needs attention, and the last download failed.*
  - `failed`, 3 of 10: `status-critical`, *No. 3 of 10 followed stocks need attention; their scores show as Incomplete until they're fixed, and the last download failed.*
  - `abandoned`, 3 of 10 (TC edge): `status-serious`, *Mostly yes. 3 of 10 followed stocks need attention; their scores show as Incomplete until they're fixed, and the last download was interrupted.*
  - `abandoned`, 0 of 10: `status-serious`, *Mostly yes. None of the 10 followed stocks needs attention, and the last download was interrupted.*
  - `cancelled`, 0 of 1236: `status-good`, *Yes. None of the 1,236 followed stocks needs attention.*

  Further cases:
  - **Checks' tiers do not feed it.** `daily_prices.status "exceptions"` and `company_financials.status "exceptions"` with 0 affected and `succeeded` still give `status-good` *Yes…*.
  - **Counts come from the aggregate.** `ATT` carries `problems.stock_count` 7 and `followed_count` 99, and no row's sentence contains *7 of* or *99*.
  - **Checked time.** `getByText("checked 14:03:12 CDT")` comes from the aggregate's `checked_at`. Attention's `checked_at` (*14:59:59 CDT*) appears nowhere.
  - **Header.** The `h1` is exactly *Is the data good enough to trust?* with `tabIndex` -1. A link named *Full coverage table* has `href="/data/coverage"`. The `downloadNow` node renders inside the same `header` element as the `h1`.
  - **One badge.** Exactly one `status-*` badge sits in the header.

  Kills:
  - off-by-one `n === 1` → `n <= 1` (row 0 of 10 says *0 of 10 … needs*) or `n === 2` (row 2 of 10)
  - swap-case `failed`↔`interrupted` clause text (rows `failed`, `abandoned`)
  - negate-boolean on the clause's `!== null` (the `succeeded` rows gain a clause, or the `failed` rows lose it)
  - drop-field-copy `affected_count` → attention's `problems.stock_count` (counts row)
  - drop-field-copy of `checked_at` from attention (checked-time row)
  - drop-defaulted-argument of `formatCount` (1,236 row)
- [ ] T007 Implement **TC-COMP-148** (Verdict skeleton while attention loads; error with Try again while it fails), with the aggregate's states and the no-answer case. Write it as `describe("Verdict states (TC-COMP-148, DAC-E6-2, AC-24)")` in `web/src/screens/data-health/verdict.test.tsx`, after T006 in the same file, with `// Implements TC-COMP-148`.
  - (a) **Step 1**: `attention={{ kind: "loading" }}` with an `ok` aggregate. The `h1`, *Full coverage table* and the `downloadNow` node render. An element inside the header carries `aria-busy="true"`. No `status-*` badge renders, and none of *Yes*, *Mostly yes* or *No.* appears.
  - (b) **Step 2**: `attention={{ kind: "error", error: INTERNAL, last: { data: ATT("failed"), checkedAt } }}` with an aggregate of 10 of 10. The `h1`, *Full coverage table* and the `downloadNow` node are still rendered. A `role="status"` element reads exactly *Couldn't read what needs attention: FactorFlow hit an unexpected problem.*. A button *Try again* calls `onRetryAttention` once and `onRetryDataHealth` never. No `status-*` badge renders, so no tier is computed, even from `last` or from the aggregate. *req-9f3* and *database said no* appear nowhere.
  - (c) The same, with `error: UNREACHABLE`: *Couldn't read what needs attention: FactorFlow is not answering.* (DEC-0373).
  - (d) **Aggregate loading** (`dataHealth={{ kind: "loading" }}`, attention `ok`): skeleton as in (a), with no badge.
  - (e) **Aggregate failing** (`dataHealth={{ kind: "error", error: INTERNAL, last: null }}`, attention `ok` with `succeeded`): *Couldn't read the data health checks: FactorFlow hit an unexpected problem.* with *Try again* calling `onRetryDataHealth` once. No badge. Resolved Conflict 6.
  - (f) **Both failing**: attention's message wins, and only one *Try again* button renders.
  - (g) **No download has ended** (`ATT(null)`, aggregate `ok` with 3 affected): the header renders with the `h1` and actions. No `status-*` badge, no *verdict-sentence* and no *checked* line render, and never *Yes*. This is DAC-E1-3's null answer; CAP-003-E6-S5 renders the empty card on this condition.

  Kills:
  - negate-boolean on the attention `kind === "error"` check (b: a badge renders)
  - a hand-written mutant computing the tier from `attention.last` while it fails (b)
  - swap-case of the two retry callbacks (b, e)
  - negate-boolean on the null-answer guard (g: a badge or *Yes* renders)
  - remove-attribute of `aria-busy` (a, d)
- [ ] T008 Implement **TC-COMP-157 (verdict half)**: gaps not determinable named after the sentence. Write it as `describe("Verdict names a check whose gaps can't be checked (TC-COMP-157, DAC-E6-S1-2, DAC-E6-1)")` in `web/src/screens/data-health/verdict.test.tsx`, after T007, with `// Implements TC-COMP-157`.
  - (a) The aggregate's `daily_prices` has status `exceptions`, `absent_count` 2, `gap_stock_count` null, `behind_count` 1 and `gap_detection { available false, reason "fewer_than_two_instruments_with_data" }`, with `succeeded` and 0 affected. The verdict sentence is still *Yes. None of the 10 followed stocks needs attention.*, unchanged and with no tier change. A separate element after it reads exactly *Daily prices can't be checked for gaps: fewer than two followed stocks hold daily prices.*
  - (b) The same with status `not_determinable` and all counts 0: the same named sentence.
  - (c) An unknown code `"calendar_unavailable"` gives *Daily prices can't be checked for gaps: calendar_unavailable.* Reason `null` gives *Daily prices can't be checked for gaps: no reason was given.* (DEC-0374).
  - (d) `gap_stock_count` 0 (detection ran) gives no *can't be checked* text.
  - (e) `checks.daily_prices` null (`never_acquired true`) gives no *can't be checked* text, and the verdict still renders from the counts.

  Kills:
  - negate-boolean on `gap_stock_count === null` (d)
  - drop-field-copy of `gap_detection.reason` (c)
  - a hand-written mutant keying on `status === "not_determinable"` instead (a: nothing is named)
- [ ] T009 Implement **TC-COMP-159 and TC-COMP-160 (verdict half)**. Write them as `describe("Verdict vocabulary and badges (TC-COMP-159, TC-COMP-160, DAC-E6-S1-4, DAC-E6-S1-5)")` in `web/src/screens/data-health/verdict.test.tsx`, after T008, with `// Implements TC-COMP-159` and `// Implements TC-COMP-160`. A module-local `visibleAndAccessibleText(container)` joins `container.textContent` with every `aria-label`, `title` and `aria-describedby`-referenced text.
  - (a) Render every state from T006, T007 and T008. Assert the joined text never matches `/\b(instrument|acquisition|acquire|run|runs|retire|retired|provider credential)\b/i`. A planted case proves the regex is not vacuous: `"one run"` and `"Retired"` match, and `"downloads"` and `"fewer_than_two_instruments_with_data"` do not.
  - (b) For each tier row of T006, the badge element (`[data-variant^="status-"]`) has the word as its text content (*Yes*, *Mostly yes* or *No*) and contains an `svg[aria-hidden="true"]`. The badge and its icon carry no `aria-label` that would replace the words.
  - (c) The verdict's state words are the literals of `copy.ts`. The TC's "never the domain term beside it" is covered by (a).

  Kills:
  - swap-case `answer.word` → `answer.tier` as the badge's text (b: *warning* instead of *Mostly yes*)
  - a hand-written mutant rendering the answer word in a bare `span` instead of `StatusBadge` (b: no `status-*` badge, no `svg[aria-hidden="true"]`)

  The raw-gap-code mutant is killed by T002 (b) and T008 (a), not by this scan: the planted case proves `\b` does not match inside the code.
- [ ] T010 Implement **TC-COMP-159 and TC-COMP-160 (cards half)**. Write them as `describe("Check cards vocabulary and badges (TC-COMP-159, TC-COMP-160, DAC-E6-S1-4, DAC-E6-S1-5)")` in `web/src/screens/data-health/check-cards.test.tsx`, after T005, with both `// Implements` comments and the same local helper as T009.
  - (a) Render every state from T002 to T005. No DAC-E7-3 term appears. The download link's `href` contains `run-42`, but no visible text or accessible name does.
  - (b) Each `ok` and `exceptions` badge and each score-state badge is a `status-*` badge. Its text equals the literal label listed in T002, T003 and T005, and it contains an `svg[aria-hidden="true"]`.
  - (c) Every *Not determinable* rendering is a `coverage-unknown` badge with an accessible description. That covers the Daily prices header, the gap part and the scores card while not served. None of them is a `status-*` badge, an em dash or plain text.
  - (d) Every null value is an `Absent` em dash (`aria-hidden`) with hidden words, never `0` and never empty text. That covers the T002 (f), T003 (d), T004 and T005 (f) cases.

  Kills:
  - swap-case `NotDeterminable` → `StatusBadge tier="neutral"` (c)
  - swap-case `Absent` → empty string (d)

### Additional Unit Tests

- [ ] T011 Write the copy unit cases as `describe("copy.ts (DEC-0373, -2)")` in `web/src/screens/data-health/verdict.test.tsx`, after T009.
  - (a) `readFailureReason(UNREACHABLE)` is *FactorFlow is not answering*. `readFailureReason(INTERNAL)` is *FactorFlow hit an unexpected problem*. A coded `ApiError` (`code "validation_error"`) and a code-less one (`code null`) give the same *FactorFlow hit an unexpected problem*. No result contains the error's `message` or `requestId`.
  - (b) `gapReason("fewer_than_two_instruments_with_data")` is *fewer than two followed stocks hold daily prices*. `gapReason("calendar_unavailable")` is *calendar_unavailable*. `gapReason(null)` is *no reason was given*.
  - (c) `readFailed("what needs attention", "x")` is exactly *Couldn't read what needs attention: x.*

  Kills:
  - swap-case of the two reason sentences (a)
  - negate-boolean on `instanceof ApiUnreachableError` (a)
  - drop-field-copy of the code lookup (b: the raw code is shown for the known one)

**Checkpoint**: All Phase 2 tests exist and fail, because `web/src/screens/data-health/*.tsx` and `copy.ts` do not exist, so the imports fail. Every delivered test still passes.

---

## Phase 3: Core Implementation

**Purpose**: The copy catalogue, the card composition, the three cards and the verdict.

- [ ] T012 Create `web/src/screens/data-health/copy.ts`. Its module doc comment states that this is every owner-facing string of the Data health screen (data-health-ui 2.1), that CAP-003-E6-S2 to S5 add their strings here, that no string carries a DAC-E7-3 term (AC-19), and that `{reason}` text is never an envelope `message` or `request_id` (UX design 0.7). Strings are verbatim from data-health-ui 2.3 and 2.4 and epic DAC-E6-1 to DAC-E6-5 unless marked. Exports:
  - `PAGE_TITLE` is *Is the data good enough to trust?*. `FULL_COVERAGE_TABLE` is *Full coverage table*. `TRY_AGAIN` is *Try again*.
  - `CHECK_TITLES` is `{ daily_prices: "Daily prices", company_financials: "Company financials", scores: "Factor scores" }`.
  - `countClause(n, m)` returns:
    - for `n === 0`: *None of the {m} followed stocks needs attention*
    - for `n === 1`: *1 of {m} followed stocks needs attention; its scores show as Incomplete until it's fixed*
    - otherwise: *{n} of {m} followed stocks need attention; their scores show as Incomplete until they're fixed*

    Counts go through `formatCount`.
  - `verdictSentenceRest(n, m, downloadClause: DataAnswer["downloadClause"])` is `countClause` plus *, and the last download failed.*, *, and the last download was interrupted.* or *.*, depending on the clause.
  - `gapsNotCheckable(reason)` is *Daily prices can't be checked for gaps: {reason}.*
  - `checked(time)` is *checked {time}*.
  - `readFailed(what, reason)` is *Couldn't read {what}: {reason}.*
  - `READ_TARGETS` is `{ attention: "what needs attention", checks: "the data health checks", scores: "the factor scores" }`. The `scores` value is DEC-0376.
  - `readFailureReason(error: ApiError | ApiUnreachableError): string` follows DEC-0373. An `ApiUnreachableError` gives *FactorFlow is not answering*. Every `ApiError`, whatever its `code`, gives *FactorFlow hit an unexpected problem*. Leave a comment that the GET reads used here answer only `200` or the `500` `internal_error` envelope (data-health-api 11, owner-shell 2.3), so a per-code table has nothing else to key on yet.
  - `GAP_REASONS` is `{ fewer_than_two_instruments_with_data: "fewer than two followed stocks hold daily prices" }`. `gapReason(code: string | null)` returns the mapped clause, the code itself when it is unknown (following the delivered `web/src/screens/coverage/copy.ts` `reasonSentence`, which never drops an unknown reason), or *no reason was given* for `null` (DEC-0374).
  - Daily prices:
    - `allPrices(m, date)`: *All {m} stocks have prices to {date}*
    - `withoutPrices(n)`: *{n} without prices*
    - `withGaps(n)`: *{n} with gaps*
    - `behind(n, date)`: *{n} behind {date}*
    - `GAPS_NOT_DETERMINABLE`: *Gaps not determinable*
    - `PRICES_TO`: *Prices to*
    - `PRICES_SCOPE_NOTE`: verbatim from 2.4
  - Company financials:
    - `allFinancials(m)`: *All {m} stocks have financials*
    - `withoutFinancials(n)`: *{n} without financials*
    - `withFailedDownloads(n)`: *{n} with failed downloads*
    - `FINANCIALS_TO`: *Financials to*
    - `FINANCIALS_NOTE`: verbatim
  - `andMore(k)` is *and {k} more*.
  - Factor scores:
    - `stocksCurrent(c, f)`: *{c} of {f} stocks current*
    - `showAsIncomplete(k)`: *{k} stocks show as Incomplete until their data is complete*
    - `SCORES_AT`: *Scores*
    - `FROM_DOWNLOAD_STARTED`: *from the download started*
    - `SCORES_NOT_SERVED`: *FactorFlow can't read scores yet.*
  - `ABSENT` is `{ noData: "no data stored yet", noPrices: "no prices stored yet", noFinancials: "no financials stored yet", noScores: "no scores yet" }`. The first comes from DAC-E6-7. The other three are this plan's hidden words for the absent renderings STD-UI-4 requires (Other Notes).

  `ApiError` and `ApiUnreachableError` are imported from `../../api/client` (delivered), `formatCount` from `../../components/patterns/format`, and `type DataAnswer` from `../../components/patterns/worst-data-tier`. No unit or hex literal appears, comments included: S5 adds this directory to `token-literals.test.ts`. Makes T011 pass and supplies T002–T010.
- [ ] T013 Create `web/src/screens/data-health/check-card.tsx`, the check-card composition (UX design §3, 1.4 item 2; data-health-ui 10). It has three exports:
  - `CheckCard({ title, status, result, asOf, children }: { title: string; status?: ReactNode; result?: ReactNode; asOf?: ReactNode; children?: ReactNode })` renders `<section aria-labelledby={id}>`, with `id = useId()`, wrapping `<Card variant="metric">`. `CardHeader` lays out in a row (`flex-row items-center gap-2`) holding `<CardTitle id={id}>{title}</CardTitle>` (an `h2` at `--text-lg`, from E1-S1) and then `status`. `CardContent` holds the result as `<p className="text-base font-semibold">`, the as-of as `<p className="text-xs text-muted-foreground">` (each rendered only when given), and then `children`.
  - `ReadFailure({ sentence, onRetry })` renders `<p role="status">{sentence}</p>` followed, outside it, by `<Button variant="outline" onClick={onRetry}>{TRY_AGAIN}</Button>`. This is the error convention of CAP-003-E1-S9's `StateRegion` (DEC-0314), followed here without importing it (Other Notes).
  - `SkeletonLine()` renders `<div aria-busy="true" className="h-4 animate-pulse rounded bg-secondary" />`, the delivered `set-history-dialog.tsx` precedent with token classes.

  No literal appears, and nothing is styled by colour alone. Supplies T002–T010.
- [ ] T014 [P] Create `web/src/screens/data-health/daily-prices-card.tsx` exporting `DailyPricesCard({ check, followedCount }: { check: DataHealth["checks"]["daily_prices"]; followedCount: number })`, using `CheckCard` and `CHECK_TITLES.daily_prices`.
  - **`check === null`**: `status` and `result` are each `<Absent label={ABSENT.noData} />`, with no as-of and no scope note (DAC-E6-7; T004).
  - **Status**:
    - `ok` and `exceptions` give `<StatusBadge tier={tierOf(s)}>{labelOf(s)}</StatusBadge>`, with `s = { of: "check", check: "daily_prices", status }`.
    - `not_determinable` gives `<NotDeterminable reason={gapReason(check.gap_detection.reason)} />`.
  - **Result**:
    - When `status === "ok"`, `allPrices(formatCount(followedCount), date)`.
    - Otherwise the ordered parts joined by `", "`:
      - `withoutPrices` when `absent_count > 0`
      - the gap part: when `gap_stock_count === null`, `<NotDeterminable label={GAPS_NOT_DETERMINABLE} reason={gapReason(…)} />`, else `withGaps` when it is above 0
      - `behind` when `behind_count > 0`

    Counts go through `formatCount`.
  - **Dates**: `date` is `formatSessionDate(latest_session)`, or `<Absent label={ABSENT.noPrices} />` when it is null.
  - **As-of**: `PRICES_TO`, the date, then, when `exception_symbols` is non-empty, `" · "` and the symbols joined by `", "`, then `" " + andMore(k)` when `k = exception_count - exception_symbols.length` is above 0 (DEC-0220).
  - **Children**: the `PRICES_SCOPE_NOTE` paragraph (`text-xs text-muted-foreground`) and `<Button variant="outline" asChild><Link to="/data/coverage">{FULL_COVERAGE_TABLE}</Link></Button>`.

  The module doc comment cites data-health-ui 2.4, DAC-E6-3, DEC-0201, DEC-0206, DEC-0213 and DEC-0220. Depends on T012 and T013, and makes T002, T004 (prices half) and T010 pass.
- [ ] T015 [P] Create `web/src/screens/data-health/financials-card.tsx` exporting `FinancialsCard({ check, followedCount }: { check: DataHealth["checks"]["company_financials"]; followedCount: number })`, using `CheckCard` and `CHECK_TITLES.company_financials`.
  - `check === null` is handled as in T014.
  - Status: `StatusBadge` over `tierOf` and `labelOf` of `{ of: "check", check: "company_financials", status }`.
  - Result: `allFinancials(formatCount(followedCount))` when `ok`, otherwise the non-zero parts of `withoutFinancials(absent_count)` and `withFailedDownloads(problem_count)`, joined by `", "`.
  - As-of: `FINANCIALS_TO`, then `formatInstant(as_of)` (a timestamp with the zone), or `<Absent label={ABSENT.noFinancials} />` when it is null, then the exceptions exactly as T014.
  - Children: the `FINANCIALS_NOTE` paragraph.

  The doc comment cites data-health-ui 2.4, DAC-E6-4 and STD-UI-18. Depends on T012 and T013, and makes T003, T004 (financials half) and T010 pass.
- [ ] T016 [P] Create `web/src/screens/data-health/scores-card.tsx` exporting `ScoresCard({ scores, onRetryScores }: { scores: ScoreState; onRetryScores: () => void })`, using `CheckCard` and `CHECK_TITLES.scores`. By `scores.kind`:
  - **`loading`**: body `<SkeletonLine />`, with no badge (ui-components 2.4: a caller whose read has not answered renders its skeleton).
  - **`not_served`**: `status` is `<NotDeterminable reason={SCORES_NOT_SERVED} />`, with no result and no as-of.
  - **`error`**: when `last !== null`, render as `served` with `last` (owner-shell 2.4). Otherwise the body is `<ReadFailure sentence={readFailed(READ_TARGETS.scores, readFailureReason(error))} onRetry={onRetryScores} />` with no badge (DEC-0376).
  - **`served`** (with summary `d`):
    - **State**, as a module-local `scoreStateOf(d)` in the table's order:
      - `d.never_classified` gives `never_classified`
      - else `d.later?.state === "building"` gives `building`
      - else `d.later?.state === "failed"` gives `failed`
      - else `d.set?.not_current` gives `not_current`
      - else `current`

      Status: `<StatusBadge tier={tierOf(st)}>{labelOf(st)}</StatusBadge>`, with `st = { of: "scores", state }`.
    - **Result**:
      - When `d.stocks_current` is null: `<Absent label={ABSENT.noScores} />` (DEC-0375).
      - Otherwise: `stocksCurrent(formatCount(current_count), formatCount(followed_count))`.
      - With `k = stocks_current.followed_count - stocks_current.current_count`, when `k > 0` a second `text-base` line `showAsIncomplete(formatCount(k))` follows. *k* is never computed from any other `followed_count` (DAC-E6-5).
    - **As-of** (only when `d.set` is non-null): `${SCORES_AT} ${formatInstant(d.set.ended_at)} · ${FROM_DOWNLOAD_STARTED} `, then `<Link to={`/data/downloads/${d.set.run_id}`}>{formatInstant(d.set.run_started_at)}</Link>` (data-health-ui 3 assumption; home-ui 2.4 for `ended_at`).

  The doc comment cites data-health-ui 2.4 and 3, DAC-E6-5, AC-8, and Resolved Conflict 5 on the `not_current` branch. Depends on T012 and T013, and makes T005 and T010 (scores half) pass.
- [ ] T017 Create `web/src/screens/data-health/verdict.tsx` exporting `Verdict(props: { attention: ReadState<Attention>; dataHealth: ReadState<DataHealth>; onRetryAttention: () => void; onRetryDataHealth: () => void; downloadNow: ReactNode })`.
  - **Header.** It renders `<header className="flex flex-col gap-3">`. The first row (`flex items-start justify-between gap-4`) holds `<h1 tabIndex={-1} className="text-xl font-semibold">{PAGE_TITLE}</h1>` (owner-shell: focus moves to the screen's `h1`) and, on the right, `<div className="flex gap-2">` with `<Button variant="outline" asChild><Link to="/data/coverage">{FULL_COVERAGE_TABLE}</Link></Button>` and `{props.downloadNow}`.
  - **Body**, in this order (DAC-E6-2; Resolved Conflict 6):
    1. Attention `loading` gives `<SkeletonLine />`.
    2. Attention `error` gives `<ReadFailure sentence={readFailed(READ_TARGETS.attention, readFailureReason(error))} onRetry={onRetryAttention} />`. `last` is never read, so no tier is computed.
    3. Aggregate `loading` gives `<SkeletonLine />`.
    4. Aggregate `error` gives `ReadFailure` with `READ_TARGETS.checks` and `onRetryDataHealth`.
    5. Otherwise `answer = worstDataTier({ affectedCount: dh.affected_count, followedCount: dh.followed_count, latestTerminalDownload: att.latest_terminal_download?.state ?? null })`. When `answer` is null, there is no body (T007 (g)). When it is set, the body is:
       - `<p data-testid="verdict-sentence">` holding `<StatusBadge tier={answer.tier}>{answer.word}</StatusBadge>`, `<span className="sr-only">.</span>` and `{" " + verdictSentenceRest(dh.affected_count, dh.followed_count, answer.downloadClause)}`, so the line reads as one sentence with the badge as its first clause (Other Notes)
       - when `dh.checks.daily_prices?.gap_stock_count === null`, a `<p>` with `gapsNotCheckable(gapReason(dh.checks.daily_prices.gap_detection.reason))` (Resolved Conflict 2)
       - `<p className="text-xs text-muted-foreground">{checked(formatClock(dh.checked_at))}</p>`

  The doc comment cites data-health-ui 2.3, DAC-E6-1 and DAC-E6-2, DEC-0210 and DEC-0217 as amended, and states that the checks' tiers never feed the answer. The `Verdict` mounts no provider and calls no hook of the shell: CAP-003-E6-S5 passes `attention` from `useShell()`, `dataHealth` and `retry` from `useDataHealth()`, `() => refresh("attention")`, and E6-S2's `DownloadNow`. Depends on T012 and T013, and makes T006–T009 and T011 pass.

**Checkpoint**: `npx vitest run web/src/screens/data-health` is green, and the module exports exactly `Verdict`, `CheckCard`, `ReadFailure`, `SkeletonLine`, `DailyPricesCard`, `FinancialsCard`, `ScoresCard` and the `copy.ts` catalogue.

---

## Phase 4: Integration

**Purpose**: Prove the new files sit cleanly in the delivered suite and the shared scans.

- [ ] T018 Run the whole Vitest suite (`npm run test`) unchanged. It includes `web/src/api/render.test.tsx`, which walks all of `web/src` and forbids `dangerouslySetInnerHTML`, so provider reasons render as text (data-health-ui 4). It also includes, when present, `web/src/components/token-literals.test.ts` (CAP-003-E1-S1). This story does not widen that scan's directory list; S5 does (DAC-E6-S5-4). Run S5's future scan by hand now: `grep -nE "[0-9](px|rem|em|vh|vw)\b|#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(" web/src/screens/data-health/*.ts web/src/screens/data-health/*.tsx | grep -v "\.test\."` prints nothing. Then confirm with `git status --short web/ package.json` that the only changes are the eight new files under `web/src/screens/data-health/`, and that no delivered file, sibling story file or `package.json` was touched (traces to AC-11, AC-24).

**Checkpoint**: The whole suite is green, the future literal scan is clean, and only this story's eight files were added.

---

## Phase 5: Polish

**Purpose**: Validation commands and TDD evidence.

- [ ] T019 Run `npm run lint`, `npm run format` and `npx tsc --noEmit` from the repo root. Format the new files with `npx biome format --write web/src/screens/data-health/`, only those files. `tsc` checks the indexed `DataHealth["checks"][…]` prop types and that `ScoreState` is handled exhaustively. Then run `npm run build`. Finally, run the mutation pass: `python3 scripts/mutation-run.py run --command "npx vitest run web/src/screens/data-health && npx tsc --noEmit"` over the six production files, with the hand-written mutants listed in Other Notes. It must leave no surviving non-equivalent mutant (traces to AC-11, AC-24).
- [ ] T020 After each TDD cycle, and not once at the end:
  - Stage only that cycle's diff.
  - Dispatch an independent code-review subagent and an independent spec-drift subagent against it.
  - Append the cycle to `CAP-003-E6-S1-tdd-evidence.yaml` beside this story with:
    - `code_review_verdict`
    - `spec_drift.drift_detected`
    - `tests_executed: true`
    - its RED/GREEN evidence
    - the structured `mutation:` block that `scripts/mutation-run.py summary` prints, or `mutation: {not_applicable: <reason>}` for a cycle with no production change
    - `diff_sha256`: the SHA-256 of the staged diff the reviews judged, computed by `scripts/check-tdd-evidence.py fingerprint --staged` and saved as the cycle's `reviewed_patch`

  Do this before the next cycle begins. `scripts/check-tdd-evidence.py` must pass before hand-off. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. This story runs under a driver that commits once per stage, so every cycle records `commit_hash: stage` and no per-cycle commit is planned.

  The cycles:
  1. T002, T004 (prices half), T013, the `copy.ts` card strings and `gapReason` from T012, and T014.
  2. T003, T004 (financials half) and T015.
  3. T005 and T016, with `ReadFailure`/`SkeletonLine` and the scores strings and `readFailureReason`.
  4. T010, which adds tests only and joins cycle 3's evidence if no production change follows.
  5. T006–T009, T011 and T017 (the verdict).

  T018 and T019 add no behaviour and join cycle 5's validation evidence (INV-TDD-002, TEST-TDD-008; traces to no AC).

**Checkpoint**: Every acceptance criterion is satisfied, all validation passes, and every behaviour-changing change is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

| Story | Classification | Evidence |
|---|---|---|
| CAP-003-E1-S1 | hard | `Card`, `CardHeader`, `CardTitle`, `CardContent` and `Button` (`outline`, `asChild`) from `web/src/components/ui/` (E1-S1 plan T012–T014). Existing edge |
| CAP-003-E1-S5 | hard | `tierOf`, `labelOf`, `Status` and the six-tier `StatusBadge` (E1-S5 plan T006, T007). Existing edge |
| CAP-003-E1-S6 | hard | `Absent`, `NotDeterminable`, `formatInstant`, `formatClock`, `formatSessionDate` and `formatCount` (E1-S6 plan T006, T007). Existing edge |
| CAP-003-E1-S7 | hard | `worstDataTier` and `DataAnswer` (E1-S7 plan T006). Existing edge |
| CAP-003-E3-S1 | hard | `ReadState`, `ScoreState`, `Attention`, `DataHealth` and `ScoreSummary` from `web/src/app/shell-types.ts` (E3-S1 plan T009). Existing edge |
| CAP-003-E3-S3 | hard | Existing edge, kept (never removed). The story's *Implementation* passes `useShell()`'s values in as props, so this story's code imports nothing from `shell-context.tsx` or `use-data-health.ts`. T001 still confirms them for the screen that feeds the props |
| CAP-003-E6-S2 | reverse | It imports `copy.ts` (S2 Dependencies: "the copy catalogue"). Its `DownloadNow` is what S5 passes into `Verdict`'s `downloadNow` slot. S2 depends on S1, so S1 cannot import it (Other Notes) |
| CAP-003-E6-S3 | reverse | It imports `copy.ts` (S3 Dependencies), and may reuse `ReadFailure` |
| CAP-003-E6-S4 | reverse | It imports `copy.ts`, and owns DAC-E6-17 and TC-COMP-155, whose per-card error can reuse `ReadFailure` and `readFailureReason` (DEC-0373) |
| CAP-003-E6-S5 | reverse | `DataHealthScreen` renders `Verdict`, `DailyPricesCard`, `FinancialsCard` and `ScoresCard` and wires their props and callbacks (S5 Dependencies). It owns DAC-E6-6, DAC-E6-7 and TC-COMP-151 at screen level, with this story's null-check rendering |
| CAP-003-E1-S9 | context | Its `StateRegion` error convention (`role="status"` sentence, **Try again** `outline` outside) is followed by `ReadFailure`. Nothing is imported, because `StateRegion` takes `ScreenState`, not the shell's `ReadState` (register G12) |
| CAP-003-E5-S2 | context | Home's data tile calls the same `worstDataTier`. home-ui 2.4's em dash and score-error renderings are the precedent for DEC-0375 and -4 |

No new hard dependency is found, so no edge is added to `CAP-003-E6-S1: [CAP-003-E3-S3, CAP-003-E3-S1, CAP-003-E1-S7, CAP-003-E1-S5, CAP-003-E1-S6, CAP-003-E1-S1]`.

### Task Dependencies

- T001: no dependencies.
- T002 → T003 → T004 → T005 → T010: same file (`check-cards.test.tsx`), sequential, after T001.
- T006 → T007 → T008 → T009 → T011: same file (`verdict.test.tsx`), sequential, after T001. This chain can run in parallel with the `check-cards.test.tsx` chain.
- T012: depends on T001. Its tests exist first per the T020 cycles.
- T013: depends on T012.
- T014, T015 and T016: each depends on T012 and T013. They are different files, so they can run in parallel.
- T017: depends on T012 and T013.
- T018: depends on T014–T017.
- T019: depends on T018.
- T020: interleaved; it runs after every TDD cycle, before the next cycle begins.

### Parallel Opportunities

- The two test files (T002–T005 and T010 against T006–T009 and T011) can be written in parallel.
- T014, T015 and T016 can be written in parallel once T012 and T013 exist.

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

The Python commands do not apply, because no file under `src/` is touched. `npm run test:e2e` does not apply either: no end-to-end case belongs to this story.

### Story-Specific Validation

- **DAC-E6-1, DAC-E6-S1-1 and AC-11**: T006 passes with the three DAC-E6-S1-1 sentences character for character, the singular/plural boundary at 1 and 2, both download clauses, and the counts taken from the aggregate rather than attention.
- **DAC-E6-2 and AC-24**: T007 passes. No status badge exists while attention loads or fails, *Try again* calls the attention retry, and *req-9f3* is never in the DOM.
- **DAC-E6-3, DAC-E6-S1-2 and DAC-E6-S1-3**: T002 and T008 pass. *Gaps not determinable* is `coverage-unknown`, *and 2 more* appears at 7, and nothing appears at 5. `grep -n "fewer_than_two_instruments_with_data" web/src/screens/data-health/*.tsx` prints nothing: the code is mapped only in `copy.ts`.
- **DAC-E6-4**: T003 passes.
- **DAC-E6-5 and AC-8**: T005 passes. `grep -nE "attention|useShell|useDataHealth" web/src/screens/data-health/scores-card.tsx` prints nothing, so the card's counts can come only from its `scores` prop.
- **DAC-E6-S1-4 and AC-19**: T009 and T010 pass over every state. Run this grep with comments stripped by eye: `grep -niE "\b(instrument|acquisition|acquire|retire|retired)\b" web/src/screens/data-health/copy.ts`. It prints only the `GAP_REASONS` key line, which is the wire code and is never rendered.
- **DAC-E6-S1-5 and AC-20**: T009 (b) and T010 (b)–(d) pass.
- **AC-26, ahead of S5**: T018's literal grep is clean.

---

## Notes

### Resolved Conflicts

1. **The verdict while attention fails.** data-health-ui section 7's Verdict row says "attention failing gives *Can't tell yet*". **Governing:** epic DAC-E6-2, together with data-health-ui 2.3 (l.181), TC-COMP-148 and ux-design 1.4 States (Error). The header is kept, *Couldn't read what needs attention: {reason}.* renders with **Try again**, and no tier is computed. *Can't tell yet* is never rendered (T007).
2. **What triggers *Daily prices can't be checked for gaps*.** data-health-ui 2.3 says "a check that is not determinable … is still named after the sentence", which reads as `status === "not_determinable"`. Story DAC-E6-S1-2 and TC-COMP-157 give the trigger as `gap_stock_count` null with status `exceptions` (`absent_count` 2, `behind_count` 1). **Governing:** the story AC, which ranks above design prose. The verdict keys on `checks.daily_prices.gap_stock_count === null`. That is null exactly when gap detection is unavailable (DEC-0213 (c)), so it covers both the `exceptions` and the `not_determinable` case (T008 (a), (b)). Company financials has no not-determinable status. DAC-E6-1 gives no "named" wording for the Factor scores card, so nothing else is named.
3. **The check cards' null state.** ux-design 1.4 States says null checks render `coverage-unknown` *Not determinable* with *Nothing has been stored yet.*. **Governing:** epic DAC-E6-7 and data-health-ui 10 States: an `Absent` em dash for the tier and the result line, with hidden *no data stored yet*. The cards implement that rendering (T004, T014, T015). Spec review v3 FINDING-8 recorded the same.
4. **The verdict's inputs and the DEC records' text.** DEC-0210's record says "from the problem set alone", and DEC-0217's agent text says serious answers *No*. **Governing:** epic DAC-E6-1, with ux-design 1.4 and data-health-ui 2.3 as amended by the owner on 2026-10-25. The inputs are `worstDataTier` over the aggregate's `affected_count` and `followed_count` and attention's `latest_terminal_download.state`. Serious answers `status-serious` *Mostly yes* (T006).
5. ***Not reflecting the latest download* is unreachable on real data.** CAP-002 sets `set.not_current` true exactly when `later` is non-null (`web/src/api/classification-types.ts` l.55–56), and the card table checks `later` first. **Governing:** epic DAC-E6-5's listed order. The branch is implemented in table order, and TC-COMP-150's `not_current` fixture is synthetic (T005 (b), T016).
6. **"The verdict's read is attention" against DAC-E6-1's aggregate counts.** ux-design 1.4 States (Error) says "the verdict's read is attention, so its failure renders there". DAC-E6-1 takes *n* and *m* from the aggregate. **Governing:** epic DAC-E6-1 for the inputs, so the verdict needs both reads. What it renders while the aggregate loads or fails is settled by ui-components 2.4 (l.277–281): "a caller whose read of these inputs has not answered renders its skeleton, and one whose read has failed renders its region's Error state". The aggregate's Error wording is ux-design 1.4's *Couldn't read the data health checks: {reason}.* (also DAC-E6-17), with **Try again** calling `useDataHealth().retry()` (DAC-E6-15, "on Try again"). Falling back to attention's `problems.stock_count` and `followed_count` is rejected, because data-health-ui 3 requires "the header count, the verdict's *n* and the rows" to come from one response. This corrects the register's G1 for the verdict (T007 (d)–(f)).
7. **A failed read's last value.** owner-shell 2.4 says "a failed read keeps the last value in `error.last`, so a chip or a card shows its last value as stale". **Governing for the verdict:** epic DAC-E6-2 ("computing no tier without the download input"), so the verdict never reads `attention.last` or the aggregate's `last` (T007 (b)). The Factor scores card has no epic AC to the contrary, so it follows owner-shell 2.4 and renders `last` (T005 (h)).

### Open Gaps

1. **The `{reason}` of a failed read. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0373.**
   - **What is undetermined.** data-health-ui 2.3, ux-design 1.4 States and DAC-E6-2 require *Couldn't read {what}: {reason}.*, and ux-design 0.7 says "the envelope's `code` selects the wording and `request_id` is never shown". No artifact gives the wording for any code.
   - **What the plan adopts (T011, T012).** `readFailureReason(error)` returns *FactorFlow is not answering* for an `ApiUnreachableError` and *FactorFlow hit an unexpected problem* for every `ApiError`. It never reads `message` or `requestId`.
   - **Derivation.** The reads this story renders (`GET /api/attention`, `GET /api/data-health`, `GET /api/classifications/summary`) answer only `200`, the `500` `internal_error` envelope (data-health-api 11) or, for the summary, `404 not_served`, which is not an error (owner-shell 2.3). So only two cases exist. The first sentence is ux-design 0.5's unreachable heading *FactorFlow is not answering.* used as a clause. The second is the delivered CAP-002 fallback `FALLBACK_ERROR` (`web/src/screens/research/copy.ts` l.165) without its trailing *Try again.*, because the **Try again** control follows it.
   - **Alternatives rejected.** Rendering `ApiError.message` was rejected: delivered envelope messages carry domain terms (register C13; AC-19) and are not owner copy. A per-code table was rejected because no other code can arrive.
   - **Classification.** Propagating. CAP-003-E6-S3, S4 and S5 render the same *Couldn't read …: {reason}.* family and should import `readFailureReason` from `copy.ts` rather than define another. Write-path codes (`409`, `404`, `422`) are theirs to add.
   - **Owning design.** data-health-ui 2.3 and 8 (with ux-design 1.4 States, Error), at its next revision.
2. **The display clause for `gap_detection.reason`. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0374.**
   - **What is undetermined.** DAC-E6-3, DAC-E6-S1-2 and data-health-ui 2.3 and 2.4 render *Gaps not determinable: {reason}* and *Daily prices can't be checked for gaps: {reason}.* with `{reason}` taken from `checks.daily_prices.gap_detection.reason`. That field carries a code, not a sentence: `coverage-service` passes `UNAVAILABLE_REASON = "fewer_than_two_instruments_with_data"` (`src/factorflow/coverage/gaps.py:35`), and the data-health reader carries it unchanged (E2-S3 plan T008). No artifact gives its Data health wording. The delivered Coverage sentence *Gap detection needs at least two instruments holding data in this range.* (`web/src/screens/coverage/copy.ts` l.13) uses the forbidden term *instruments* (AC-19) and does not fit the clause slot.
   - **What the plan adopts (T011, T012).** `fewer_than_two_instruments_with_data` maps to *fewer than two followed stocks hold daily prices*. An unknown non-null code is shown as itself, and `null` gives *no reason was given*.
   - **Derivation.** It is the same condition the delivered Coverage sentence states, in display vocabulary (STD-UI-1 v6 "stock"), shaped to complete both sentences. The unknown-code rule follows the delivered `reasonSentence`'s "an unknown code is shown as text, never dropped (owner-web-app 2.4: the interface does not invent a reason)".
   - **Classification.** Contained to this story's `copy.ts`.
   - **Owning design.** data-health-ui 2.3 and 2.4, at its next revision.
3. **The Factor scores result line when `stocks_current` is null. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0375.**
   - **What is undetermined.** data-health-ui 2.4 and DAC-E6-5 give the result line only as *{current} of {followed} stocks current* from `stocks_current`, which `classification-api` serves as `null` when no current set exists (`src/factorflow/api/classification_models.py` l.569–577). This is the case for `never_classified`, including a first set that is building or failed. No artifact gives the line for that case. The as-of line needs `set`, which is then null too.
   - **What the plan adopts (T005 (f), T016).** When `stocks_current` is null, the result line is an `Absent` em dash with hidden *no scores yet*, and the *Scores …* as-of line is omitted while `set` is null. While the summary is not served, no result line renders: the `NotDeterminable` badge and its reason are the card's whole statement.
   - **Derivation.** STD-UI-4 and ux-design 0.7 require absent values to render as an em dash, never `0` or blank. home-ui 2.4 renders the same summary figure on Home's data tile (CAP-003-E5-S2) as "an em dash with hidden *not determinable*" while never classified. Here the hidden words say *no scores yet*, because the summary did answer and there is nothing to count, which is absence, not indeterminacy (UX 0.7: the three presence renderings are never confused). The not-served case already carries `coverage-unknown` in its badge, so a second rendering would repeat it.
   - **Classification.** Contained.
   - **Owning design.** data-health-ui 2.4, at its next revision.
4. **The Factor scores card when the summary read fails with no last value. PROVISIONAL — awaiting owner confirmation (2026-11-06). Recorded as DEC-0376.**
   - **What is undetermined.** `ScoreState` has an `error` kind (owner-shell 2.3) whose `last` may be null. The card table and ux-design 1.4 States (Error lists *what needs attention / the data health checks / recent downloads / what you follow*) do not cover it.
   - **What the plan adopts (T005 (i), T016).** The header is kept, and the body is *Couldn't read the factor scores: {reason}.* with **Try again**, which calls an `onRetryScores` prop. CAP-003-E6-S5 wires it to `useShell().refresh("scores")`, the context's only re-read (owner-shell 2.3).
   - **Derivation.** It is ux-design 1.4's per-card Error pattern, applied to the one read it does not list. home-ui (l.345) does the same for the same summary: "a summary error other than `404` renders … the same way". The noun *the factor scores* follows the card's title.
   - **Classification.** Propagating, because CAP-003-E6-S5 must pass `onRetryScores`.
   - **Owning design.** data-health-ui 2.4 and 10 (States, Error), at its next revision.

### Other Notes

- **Why `Verdict` takes a `downloadNow` slot.** The story places **Download now** right of the `h1`, but `download-now.tsx` is CAP-003-E6-S2's, and S2 hard-depends on S1. S1 therefore cannot import it. `Verdict` renders **Full coverage table** itself and the `downloadNow` node beside it. CAP-003-E6-S5 passes `<DownloadNow />` there. This is a prop seam inside the component, not a new contract.
- **Interface published for CAP-003-E6-S5.**
  - `Verdict({ attention, dataHealth, onRetryAttention, onRetryDataHealth, downloadNow })` renders the page header (`h1` and actions) in every state, and no verdict body while `latest_terminal_download` is null. S5 can render it above its empty card, and decides the header actions in that state (register G7).
  - `DailyPricesCard({ check, followedCount })` and `FinancialsCard({ check, followedCount })` render their DAC-E6-7 null state when `check` is null. S5 passes `dh.checks.*` and `dh.followed_count`.
  - `ScoresCard({ scores, onRetryScores })`.
  - The check cards do not take the aggregate's `ReadState`. While the aggregate loads or fails, S5 renders `CheckCard` with `SkeletonLine` or `ReadFailure` (the DAC-E6-17 *Couldn't read the data health checks: {reason}.*), using this story's exports. TC-COMP-155 is CAP-003-E6-S4's.
- **Props, not hooks.** The story's *Implementation* says "Inputs arrive as props from the screen (E6-S5)". No component here calls `useShell()` or `useDataHealth()`, so the tests need no provider and make no request, which T002's harness asserts.
- **The badge as the sentence's first clause.** DAC-E6-S1-1 quotes the sentence as *Mostly yes. 1 of 10 …*, while ux-design 1.4's table shows the text after the badge starting *1 of 10 …*. The full stop after the badge word is rendered `sr-only`. The sentence's `textContent` and its screen-reader reading are exactly the DAC's sentence, and the visible line is the badge followed by the UX table's sentence.
- **The gap part's punctuation.** *Gaps not determinable: {reason}* renders through CAP-003-E1-S6's `NotDeterminable({ label: "Gaps not determinable", reason })`. That is the badge with the reason beside it and in its accessible description, which DAC-E6-S1-5 requires ("a value no artifact can determine goes through `NotDeterminable`"). The colon of the prose is carried by that layout, not by an extra character. T002 (b) asserts the words, their order, the `coverage-unknown` variant and the description.
- **Separators.** The as-of lines join their parts with `" · "`, the separator data-health-ui 2.4 itself uses in *Scores {time} · from the download started {start time}*. Exception symbols are joined by `", "`, and *and {k} more* follows after a space. These are presentational and set no bound. T002 (e) and T003 (b) pin them.
- **Singular copy (register G11).** The artifacts give singular forms only for the verdict's count clause. *{k} stocks show as Incomplete…*, *All {m} stocks have prices…* and *and {k} more* are implemented exactly as written, so at 1 they read *1 stocks …*. This is recorded as a copy follow-up for data-health-ui 2.4, not adopted silently.
- **G9 and G10 (open owner findings), recorded and not fixed.** A first download that ends `cancelled` with nothing stored answers *Yes* (FINDING-23). The verdict can read *Yes* while the Daily prices card reads *Needs attention* (FINDING-5). Both follow from DAC-E6-1 as written. T006's "checks' tiers do not feed it" row pins the second.
- **Hidden absent words.** *no prices stored yet* (`latest_session` null), *no financials stored yet* (`as_of` null) and *no scores yet* (`stocks_current` null) are the visually hidden labels `Absent` requires (E1-S6: "with visually hidden words naming what is absent"). They are what TC-COMP-149's edge "absent rendering" asks for. Only *no data stored yet* is quoted by an artifact (DAC-E6-7).
- **`exception_symbols` is already at most five** (data-health-reader: the first five by symbol). The card renders what it is given, so "up to five" holds without slicing. *k* is `exception_count` minus the symbols shown.
- **No self-contradicting check.** The term-scan regex is applied to rendered text and accessible names, never to source. `copy.ts` holds the wire code `fewer_than_two_instruments_with_data` only as a map key, and the T009 planted case proves the regex's `\b` does not match inside it. The Validation Plan's grep on `copy.ts` expects exactly that line.
- **Hand-written mutants** (add these to the mutation run beside the generated ones):
  - `web/src/screens/data-health/copy.ts`: `n === 1` → `n <= 1`
  - `web/src/screens/data-health/verdict.tsx`: `dh.affected_count` → `att.problems.stock_count` (in the `worstDataTier` call)
  - `web/src/screens/data-health/verdict.tsx`: `dh.checked_at` → `att.checked_at`
  - `web/src/screens/data-health/verdict.tsx`: attention `error` branch → compute from `attention.last.data`
  - `web/src/screens/data-health/verdict.tsx`: `gap_stock_count === null` → `status === "not_determinable"`
  - `web/src/screens/data-health/daily-prices-card.tsx`: `exception_count - exception_symbols.length` → `exception_count - 5`, killed by T002 (e)'s three-symbol row with count 4
  - `web/src/screens/data-health/daily-prices-card.tsx`: `gap_stock_count === null` → `!gap_stock_count`
  - `web/src/screens/data-health/scores-card.tsx`: `stocks_current.followed_count` → `d.set.active_instruments`. This is equivalent on consistent data (owner-shell: `followed_count` is the set's `active_instruments`). T005 (d)'s second fixture (`followed_count` 15, `active_instruments` 12) tells them apart.
  - `web/src/screens/data-health/scores-card.tsx`: swap the `building` and `not_current` checks
