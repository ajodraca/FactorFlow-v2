---
artifact_schema_version: 1
artifact_id: CAP-003-owner-web-app-tests
artifact_type: test-specification
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-10-30
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: claude-fable-5-1
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-30T02:26:09Z
  source_artifacts:
    - id: CAP-003
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-backlog
      version: "2"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# owner-web-app Component Test Specification

Component tests for `owner-web-app` (CAP-003). Each case verifies one story-level or epic-level derived acceptance criterion within a unit test harness for the FactorFlow-v2 repository; IDs are assigned in AC-ID order across every component file, so this file holds 43 cases (TC-COMP-183 to TC-COMP-225, not necessarily contiguous).

### TC-COMP-183: Delivered screens open at new paths; links and navigate() target them

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-17, AC-18, DAC-E7-1
**Priority:** P1
**Type:** functional

#### Preconditions
- The five screens rendered inside the shell in a memory router

#### Steps
1. Visit `/data/coverage`, `/data/followed`, `/data/downloads`, `/data/downloads/:id`, `/settings`
2. Start a download from Coverage
3. Read the Coverage links on the followed-stocks screen

#### Expected Result
- Each screen opens inside the shell
- Routes to `/data/downloads/{run_id}`
- Links read `/data/coverage?symbol={SYMBOL}`; no internal link or `navigate()` targets an old path

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-184: Label deltas match UX design 1.5 to 1.9 exactly; kept terms stay

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-19, DAC-E7-4
**Priority:** P1
**Type:** functional

#### Preconditions
- The five screens rendered populated

#### Steps
1. Read every user-visible label against the UX design 1.5 to 1.9 list

#### Expected Result
- Coverage *stock*, **Download now**, *Last downloaded*, *Stopped following*, the two blocked reasons with *Settings* a link, the queued sentence; Followed stocks **Follow a stock**, **Follow many**, **Stop following**, *Stopped following*, *followed*, *No stocks followed yet.*, add field *Symbol of the stock to follow*, `status-warning` *Not found*; Downloads *Downloads*, *Started*, *Stocks downloaded*, *Stocks failed*; detail **Cancel download**, *downloading*; Settings *Market data key*
- *Coverage*, *gap*, *history depth*, *trading day*, *Covered from*, *Covered to*, *Depth*, *Reference*, *Prices*, *Fundamentals*, *Corporate actions* stay

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-185: Settings Open setup line and Market data key region; depth form unchanged

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-4, AC-17, DAC-E7-7
**Priority:** P1
**Type:** functional

#### Preconditions
- Settings rendered with key found, missing and health unreachable

#### Steps
1. Read under the `h1`
2. Read the *Market data key* region in each case
3. Compare the history depth form with the delivered one

#### Expected Result
- *Walk through setup again to check the market data key, history depth and followed stocks.* with **Open setup** to `/setup`
- *Found* or *Missing* with the variable name and restart line; `coverage-unknown` *Not determinable* while unreachable, never *Missing*
- Depth form unchanged

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-186: No raw run_id on any surface; Downloads first column is Started

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-19, DAC-E7-10
**Priority:** P1
**Type:** functional

#### Preconditions
- Downloads list and detail rendered

#### Steps
1. Search text and attributes for a raw `run_id`
2. Read the first column

#### Expected Result
- No raw id; *Started* with the start time and zone is the link to the detail

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-187: Settings key region while unreachable: Not determinable, no value

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-4, DAC-E7-S1-1
**Priority:** P1
**Type:** security

#### Preconditions
- Settings with health unreachable

#### Steps
1. Read the key region
2. Search text and attributes for a key value

#### Expected Result
- `coverage-unknown` *Not determinable*; no *Missing*; no value anywhere

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-188: Literal scan widened to web/src/screens/settings/

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-26, DAC-E7-S1-2
**Priority:** P2
**Type:** functional

#### Preconditions
- `token-literals.test.ts` and `web/src/screens/settings/`

#### Steps
1. Add the directory to the test's scanned list
2. Run `web/src/components/token-literals.test.ts`
3. Plant a `12px` literal in a non-test source and re-run

#### Expected Result
- Every `.ts` and `.tsx` source under the directory (tests excluded) holds no `px`, `rem`, `em`, `vh`, `vw`, hex, `rgb(` or `hsl(` literal outside `theme.css` tokens and `layout.ts`; the test passes
- The planted literal fails the test naming the file

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-189: Settings states use the display vocabulary with the exact deltas

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-19, DAC-E7-S1-3
**Priority:** P2
**Type:** functional

#### Preconditions
- Settings in populated, empty, error and dialog states

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case
2. Compare labels with the DAC-E7-4 deltas

#### Expected Result
- None of the eight terms appears
- The deltas are applied exactly; terms whose domain word is the display label stay

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-190: Key-presence badge carries shape

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-20, DAC-E7-S1-4
**Priority:** P2
**Type:** functional

#### Preconditions
- *Found* and *Missing* badges

#### Steps
1. Read each badge's label and icon attributes

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-191: Settings behaviour preserved; eight states through StateRegion

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-17, AC-24, DAC-E7-S1-5
**Priority:** P1
**Type:** functional

#### Preconditions
- The relabelled delivered Settings tests

#### Steps
1. Run them
2. Enumerate the screen's eight-state table

#### Expected Result
- Every request, parameter, confirmation, refusal and cadence CAP-001 accepted renders with the same outcome
- Eight states through `StateRegion` over the unchanged `ScreenState` union, unreachable left to the shell

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-192: Coverage seeds its filter from ?symbol= and clears the query with replace

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-14, AC-17, DAC-E7-S2-1, DAC-E7-6
**Priority:** P1
**Type:** functional

#### Preconditions
- Coverage in a memory router at `/data/coverage?symbol=KO`; `fetch` spied

#### Steps
1. Read the filter and the first request
2. Clear the filter and read the location and history

#### Expected Result
- Filter reads *KO*; first request carries `symbol=KO`
- Query removed with `replace`; no history entry added

#### Error / Edge Cases
- A seeded symbol matching nothing: nothing-found state with its reset (DAC-E7-6)

### TC-COMP-193: Coverage table virtualised: windowed DOM, keyset append, no own windowing

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-17, AC-26, DAC-E7-S2-2, DAC-E7-11
**Priority:** P1
**Type:** functional

#### Preconditions
- 3000 stocks; `coverage-table.tsx` source

#### Steps
1. Render and count DOM rows
2. Append a keyset page
3. Grep `coverage-table.tsx` for windowing code

#### Expected Result
- Only the `virtualised` window in the DOM; pages append as delivered; no windowing of its own

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-194: Literal scan widened to web/src/screens/coverage/

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-26, DAC-E7-S2-3
**Priority:** P2
**Type:** functional

#### Preconditions
- `token-literals.test.ts` and `web/src/screens/coverage/`

#### Steps
1. Add the directory to the test's scanned list
2. Run `web/src/components/token-literals.test.ts`
3. Plant a `12px` literal in a non-test source and re-run

#### Expected Result
- Every `.ts` and `.tsx` source under the directory (tests excluded) holds no `px`, `rem`, `em`, `vh`, `vw`, hex, `rgb(` or `hsl(` literal outside `theme.css` tokens and `layout.ts`; the test passes
- The planted literal fails the test naming the file

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-195: Coverage states use the display vocabulary with the exact deltas

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-19, DAC-E7-S2-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Coverage in populated, empty, error and dialog states

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case
2. Compare labels with the DAC-E7-4 deltas

#### Expected Result
- None of the eight terms appears
- The deltas are applied exactly; kept terms stay

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-196: Presence badges and Stopped following carry shape

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-20, DAC-E7-S2-5
**Priority:** P2
**Type:** functional

#### Preconditions
- `coverage-present`, `coverage-absent`, `coverage-unknown` badges and *Stopped following*

#### Steps
1. Read each badge's label and icon attributes

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-197: Coverage behaviour preserved; eight states through StateRegion

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-17, AC-24, DAC-E7-S2-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The relabelled delivered Coverage tests

#### Steps
1. Run them
2. Enumerate the eight-state table

#### Expected Result
- Every request, parameter, confirmation, refusal and cadence CAP-001 accepted renders with the same outcome
- Eight states through `StateRegion` over the unchanged `ScreenState` union, unreachable left to the shell

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-198: focusAdd focuses the add field on mount; no state leaves focus unchanged

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-14, AC-17, DAC-E7-S3-1, DAC-E7-6
**Priority:** P1
**Type:** functional

#### Preconditions
- Followed stocks in a memory router

#### Steps
1. Mount with router state `{ focusAdd: true }`
2. Mount with no state

#### Expected Result
- `document.activeElement` is the add field
- Focus unchanged

#### Error / Edge Cases
- A reload does not re-focus (DAC-E7-6)

### TC-COMP-199: Stop following during a running download warns in the dialog

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-17, DAC-E7-S3-2, DAC-E7-9
**Priority:** P1
**Type:** functional

#### Preconditions
- A running download; **Stop following** activated

#### Steps
1. Read the dialog

#### Expected Result
- *A download is running and will still download {SYMBOL} this time. Stopping takes effect from the next download.*; **Cancel** first and focused

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-200: Literal scan widened to web/src/screens/instruments/

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-26, DAC-E7-S3-3
**Priority:** P2
**Type:** functional

#### Preconditions
- `token-literals.test.ts` and `web/src/screens/instruments/`

#### Steps
1. Add the directory to the test's scanned list
2. Run `web/src/components/token-literals.test.ts`
3. Plant a `12px` literal in a non-test source and re-run

#### Expected Result
- Every `.ts` and `.tsx` source under the directory (tests excluded) holds no `px`, `rem`, `em`, `vh`, `vw`, hex, `rgb(` or `hsl(` literal outside `theme.css` tokens and `layout.ts`; the test passes
- The planted literal fails the test naming the file

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-201: Followed stocks states use the display vocabulary with the exact deltas

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-19, DAC-E7-S3-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Followed stocks in populated, empty, error and dialog states

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case
2. Compare labels with the DAC-E7-4 deltas

#### Expected Result
- None of the eight terms appears
- The deltas are applied exactly; kept terms stay

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-202: Not found and Stopped following states carry shape

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-20, DAC-E7-S3-5
**Priority:** P2
**Type:** functional

#### Preconditions
- *Not found* (`status-warning`) and *Stopped following* badges

#### Steps
1. Read each badge's label and icon attributes

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-203: Followed stocks behaviour preserved; eight states through StateRegion

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-17, AC-24, DAC-E7-S3-6
**Priority:** P1
**Type:** functional

#### Preconditions
- The relabelled delivered Followed stocks tests

#### Steps
1. Run them
2. Enumerate the eight-state table

#### Expected Result
- Every request, parameter, confirmation, refusal and cadence CAP-001 accepted renders with the same outcome
- Eight states through `StateRegion` over the unchanged `ScreenState` union, unreachable left to the shell

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-204: Partial run badge and Started link name in the Downloads list

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-12, AC-20, DAC-E7-S4-1, DAC-E7-5
**Priority:** P1
**Type:** functional

#### Preconditions
- A `partial` run in the list

#### Steps
1. Read the badge and the *Started* link name

#### Expected Result
- `status-warning` *Partial* with the triangle shape; link named *Download started {time}, open details*

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-205: Downloads last-updated advances at 10 s and announces politely

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-25, DAC-E7-S4-2
**Priority:** P1
**Type:** functional

#### Preconditions
- A non-terminal download; fake timers

#### Steps
1. Advance three polls
2. Read the last-updated time, the live region and `document.activeElement`

#### Expected Result
- Advances at the delivered 10 s cadence; announced politely; focus unmoved

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-206: outcome-badge removed from web/src/screens/runs/

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-12, AC-20, DAC-E7-S4-3, DAC-E7-5
**Priority:** P2
**Type:** functional

#### Preconditions
- `web/src/screens/runs/` after the story

#### Steps
1. Grep for `outcome-badge`

#### Expected Result
- No import remains; the two files are gone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-207: Literal scan widened to web/src/screens/runs/

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-26, DAC-E7-S4-4
**Priority:** P2
**Type:** functional

#### Preconditions
- `token-literals.test.ts` and `web/src/screens/runs/`

#### Steps
1. Add the directory to the test's scanned list
2. Run `web/src/components/token-literals.test.ts`
3. Plant a `12px` literal in a non-test source and re-run

#### Expected Result
- Every `.ts` and `.tsx` source under the directory (tests excluded) holds no `px`, `rem`, `em`, `vh`, `vw`, hex, `rgb(` or `hsl(` literal outside `theme.css` tokens and `layout.ts`; the test passes
- The planted literal fails the test naming the file

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-208: Downloads states use the display vocabulary with the exact deltas

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-19, DAC-E7-S4-5
**Priority:** P2
**Type:** functional

#### Preconditions
- Downloads in populated, empty, error and dialog states

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case
2. Compare labels with the DAC-E7-4 deltas

#### Expected Result
- None of the eight terms appears
- The deltas are applied exactly; kept terms stay

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-209: Eight download states carry shape through StatusBadge

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-20, DAC-E7-S4-6
**Priority:** P1
**Type:** functional

#### Preconditions
- Runs in each of the eight states

#### Steps
1. Read each badge's label and icon attributes

#### Expected Result
- *Queued* neutral, *Downloading* active, *Stopping* warning, *Complete* good, *Partial* warning, *Failed* critical, *Cancelled by you* neutral, *Interrupted* serious (DAC-E7-5)
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-210: Downloads behaviour preserved; eight states through StateRegion

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-17, AC-24, DAC-E7-S4-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The relabelled delivered Downloads tests

#### Steps
1. Run them
2. Enumerate the eight-state table

#### Expected Result
- Every request, parameter, confirmation, refusal and cadence CAP-001 accepted renders with the same outcome
- Eight states through `StateRegion` over the unchanged `ScreenState` union, unreachable left to the shell

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-211: Detail sets the crumb once the run is read and clears it on unmount

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-14, AC-17, AC-25, DAC-E7-S5-1, DAC-E7-8
**Priority:** P1
**Type:** functional

#### Preconditions
- Download detail with `setTitleDetail` spied

#### Steps
1. Mount before the read resolves
2. Resolve the read
3. Unmount

#### Expected Result
- Crumb reads *Download* before the read
- `setTitleDetail` called once with *Download {start time}*
- Called with `null` on unmount

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-212: Detail progress indeterminate at 0 named, determinate with valuenow

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-14, AC-17, AC-25, DAC-E7-S5-2, DAC-E7-8
**Priority:** P1
**Type:** functional

#### Preconditions
- A running download

#### Steps
1. Render with `instruments_named` 0
2. Render with 120 named and 40 done

#### Expected Result
- `indeterminate`
- `determinate` *40 of 120 stocks* with `aria-valuenow` 40 and no estimated time

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-213: result-outcome-badge removed from the detail

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-12, AC-20, DAC-E7-S5-3, DAC-E7-5
**Priority:** P2
**Type:** functional

#### Preconditions
- `web/src/screens/runs/detail/` after the story

#### Steps
1. Grep for `result-outcome-badge`

#### Expected Result
- No import remains; the two files are gone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-214: Literal scan widened to web/src/screens/runs/detail/

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-26, DAC-E7-S5-4
**Priority:** P2
**Type:** functional

#### Preconditions
- `token-literals.test.ts` and `web/src/screens/runs/detail/`

#### Steps
1. Add the directory to the test's scanned list
2. Run `web/src/components/token-literals.test.ts`
3. Plant a `12px` literal in a non-test source and re-run

#### Expected Result
- Every `.ts` and `.tsx` source under the directory (tests excluded) holds no `px`, `rem`, `em`, `vh`, `vw`, hex, `rgb(` or `hsl(` literal outside `theme.css` tokens and `layout.ts`; the test passes
- The planted literal fails the test naming the file

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-215: Download detail states use the display vocabulary with the exact deltas

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-19, DAC-E7-S5-5
**Priority:** P2
**Type:** functional

#### Preconditions
- Detail in populated, empty, error and dialog states

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case
2. Compare labels with the DAC-E7-4 deltas

#### Expected Result
- None of the eight terms appears
- The deltas are applied exactly; kept terms stay

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-216: Download state, per-stock outcomes and Stopping carry shape

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-20, DAC-E7-S5-6
**Priority:** P2
**Type:** functional

#### Preconditions
- The download's state badge, *Failed* critical, *Not found* warning and *Stopping*

#### Steps
1. Read each badge's label and icon attributes

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-217: Download detail behaviour preserved; eight states through StateRegion

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-17, AC-24, DAC-E7-S5-7
**Priority:** P1
**Type:** functional

#### Preconditions
- The relabelled delivered detail tests

#### Steps
1. Run them
2. Enumerate the eight-state table

#### Expected Result
- Every request, parameter, confirmation, refusal and cadence CAP-001 accepted renders with the same outcome
- Eight states through `StateRegion` over the unchanged `ScreenState` union, unreachable left to the shell

#### Error / Edge Cases
- The two cancel confirmations keep their wording and outcomes; a *Not found* stock offers **Open Data health** to `/data` (DAC-E7-8)

### TC-COMP-218: Vocabulary sweep fails live when a term is introduced

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-19, DAC-E7-S6-1, DAC-E7-3
**Priority:** P1
**Type:** functional

#### Preconditions
- `web/src/screens/vocabulary.test.tsx`

#### Steps
1. Run the sweep
2. Change a screen's `copy.ts` to include *Retired* and re-run

#### Expected Result
- Passes on the shipped screens
- Fails naming the screen, the state and the term

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-219: Sweep matcher reads text and accessible names as whole words, case-insensitive

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-19, DAC-E7-S6-2, DAC-E7-3
**Priority:** P2
**Type:** functional

#### Preconditions
- The sweep's matcher

#### Steps
1. Render a fixture with *running* and *Coverage* in text and names
2. Render one with *Run* in an accessible name only

#### Expected Result
- *running* and *Coverage* pass
- *Run* in an accessible name is caught (whole word, any case, via `getByRole` name queries)

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-220: requestJson import type-checks; types.ts and directory names unchanged

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-17, AC-19, DAC-E7-S6-3, DAC-E7-12, DAC-E7-13
**Priority:** P2
**Type:** functional

#### Preconditions
- `web/src/api/client.ts`, `types.ts`, the screen directories

#### Steps
1. Import `{ requestJson }` in the test and run `npx tsc --noEmit`
2. Diff `web/src/api/types.ts` and the `instruments` and `runs` directory names against `HEAD` before E7

#### Expected Result
- The import type-checks
- `types.ts` and the directory names are unchanged

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-221: The eleven e2e specs hold no old path or label

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-18, AC-19, DAC-E7-S7-1
**Priority:** P1
**Type:** functional

#### Preconditions
- `tests/e2e/*.spec.ts` after the story

#### Steps
1. Grep for `goto("/coverage")`, `goto("/instruments")`, `goto("/runs")`
2. Grep for **Add instrument**, **Retire**, **Start acquisition run**, *Provider credential*

#### Expected Result
- Nothing matches

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-222: Spec outcome assertions are byte-for-byte the delivered ones

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-17, DAC-E7-S7-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The eleven specs' diff against the delivered versions

#### Steps
1. Diff each spec
2. Classify every changed line

#### Expected Result
- Assertions on dispositions, refusals, cancellation states, coverage rows and the unrecognised-symbol diagnosis are unchanged apart from labels and paths

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-223: The SHELL_ROUTES change touches copy.ts only, three target strings

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-18, AC-27, DAC-E7-S8-1, DAC-E7-2
**Priority:** P1
**Type:** functional

#### Preconditions
- The story's diff

#### Steps
1. List the non-test files changed
2. Read the diff of `web/src/screens/research/copy.ts`

#### Expected Result
- Only `copy.ts` changes; its diff is the three targets `/data/downloads/:id`, `/data`, `/data/followed`

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-224: Research links land on their new targets with no redirect

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-18, DAC-E7-S8-2
**Priority:** P1
**Type:** functional

#### Preconditions
- A Research screen rendering the three links in a memory router with the shell's routes

#### Steps
1. Follow the download link
2. Follow *Open Data health*
3. Follow the refusal link

#### Expected Result
- Lands on the download detail, on Data health at `/data`, and on Followed stocks, with no redirect in between

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-225: The task plan cites DEC-0224 for the /data target

**Scope:** component
**Component(s):** owner-web-app
**Traces to:** AC-27, DAC-E7-S8-3
**Priority:** P3
**Type:** functional

#### Preconditions
- Story E7-S8's task plan and its commit

#### Steps
1. Read the task plan's decision citations
2. Read the commit's trailers

#### Expected Result
- The plan cites DEC-0224 as the decision the `/data` target rests on; the commit carries `Decision-Id: DEC-0224`

#### Error / Edge Cases
- Process check, not a product behaviour (coverage note)
