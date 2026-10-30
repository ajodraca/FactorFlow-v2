---
artifact_schema_version: 1
artifact_id: CAP-003-home-ui-tests
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

# home-ui Component Test Specification

Component tests for `home-ui` (CAP-003). Each case verifies one story-level or epic-level derived acceptance criterion within a unit test harness for the FactorFlow-v2 repository; IDs are assigned in AC-ID order across every component file, so this file holds 21 cases (TC-COMP-127 to TC-COMP-147, not necessarily contiguous).

### TC-COMP-127: Home empty state before any download

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-21, DAC-E5-1
**Priority:** P1
**Type:** functional

#### Preconditions
- Home with `attention.latest_download` null

#### Steps
1. Render and read the main region

#### Expected Result
- Header rendered; one `card` with `h2` *No data has been downloaded yet.*, *Set up FactorFlow to name the stocks to follow and start the first download.* and **Start setup** (link to `/setup`)
- No tile and no list

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-128: Hero line figures from stocks_current; fallbacks while not served

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-8, DAC-E5-4
**Priority:** P1
**Type:** functional

#### Preconditions
- Data tile with the summary served (`stocks_current` 27 of 30), then `not_served`, then `never_classified`

#### Steps
1. Render each

#### Expected Result
- Served: *27 of 30 stocks current*, both from `stocks_current`; scores as-of from `set.ended_at`
- Not served: followed from attention's `followed_count`, current an em dash with hidden *not determinable*, scores as-of an em dash
- `never_classified`: *No scores yet*; prices as-of is `prices_as_of` unconverted

#### Error / Edge Cases
- Never more current than followed

### TC-COMP-129: Lag badge only when the set is not current or a later set is building or failed

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-8, DAC-E5-5
**Priority:** P1
**Type:** functional

#### Preconditions
- Data tile with summary fixtures

#### Steps
1. Render with `set.not_current` true
2. Render with `later.state` `building`, then `failed`
3. Render current with no `later`

#### Expected Result
- `status-warning` *Not reflecting the latest download* in the first three
- Absent in the last

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-130: No strategy, paper or live element on Home

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-10, DAC-E5-10
**Priority:** P1
**Type:** functional

#### Preconditions
- Home rendered populated

#### Steps
1. Search text and roles for strategy, paper or live
2. Read the summary row's columns and the header

#### Expected Result
- No such element or placeholder; the second and third columns are empty; no *+ New strategy*, no *next rebalance*, no right-hand header action

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-131: Attention failure keeps the header and shows card errors; 404 keeps server items

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-24, DAC-E5-11
**Priority:** P1
**Type:** functional

#### Preconditions
- Home with attention failing after a success; a summary `500`; a summary `404`

#### Steps
1. Render each

#### Expected Result
- Header stays; each card body reads *Couldn't read {what needs you / the data summary}: {reason}.* with **Try again**; *checked {time}* ages
- Summary error other than 404 renders inside the tile the same way
- Summary 404: server items still render; the first-download item follows DEC-0216

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-132: marketState closed outside session hours, not determinable inside, across DST

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-24, DAC-E5-S1-1, DAC-E5-6
**Priority:** P1
**Type:** functional

#### Preconditions
- `marketState` under test with America/Chicago instants

#### Steps
1. Evaluate a Saturday, a Sunday, a weekday 08:29 and 15:00
2. Evaluate a weekday 08:30 and 14:59
3. Repeat across the March and November DST changes

#### Expected Result
- `closed` for the first four; `not_determinable` for the two inside hours; same results across DST

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-133: Header date heading and unshifted prices as-of

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-24, DAC-E5-S1-2, DAC-E5-6
**Priority:** P2
**Type:** functional

#### Preconditions
- `header.tsx` on 2026-10-15 with `prices_as_of` set

#### Steps
1. Read the `h1` and the as-of line

#### Expected Result
- *Thursday, 2026-10-15*; `prices_as_of` rendered unshifted through `formatSessionDate`

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-134: Header, as-of line and copy use the display vocabulary

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-19, DAC-E5-S1-3
**Priority:** P2
**Type:** functional

#### Preconditions
- Header rendered in every state of the story

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-135: Market-state badge through NotDeterminable with its shape

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-20, DAC-E5-S1-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Header inside session hours

#### Steps
1. Read the badge's label and icon attributes

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-136: Downloading badge only while running; verdict once a download ended

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-8, AC-21, DAC-E5-S2-1, DAC-E5-2
**Priority:** P1
**Type:** functional

#### Preconditions
- Data tile with `latest_terminal_download` null and the summary at `404`

#### Steps
1. Render with `latest_download.state` `requested`
2. Render with `running`
3. Render with `latest_terminal_download` set

#### Expected Result
- No *Downloading* badge
- `status-active` *Downloading* shows
- The verdict badge renders

#### Error / Edge Cases
- First-download-running body *Your first download, started {time}, is running.* with no verdict word, hero count, as-of, lag badge or progress (DAC-E5-2)

### TC-COMP-137: Tile verdict equals the Data health verdict; worse score state wins

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-8, AC-11, DAC-E5-S2-2, DAC-E5-3
**Priority:** P1
**Type:** functional

#### Preconditions
- The same problem set and latest download as a `data-health-ui` verdict fixture

#### Steps
1. Render the tile
2. Render with a `failed` score state
3. Render with *No scores yet* and *Updating*

#### Expected Result
- Tile verdict tier equals the fixture's
- `status-critical` *Score update failed*
- The verdict's badge stays

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-138: Tile is one link named by its content; never reads /api/data-health

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-8, AC-11, AC-25, DAC-E5-S2-3, DAC-E5-3
**Priority:** P1
**Type:** functional

#### Preconditions
- Data tile rendered with `fetch` spied

#### Steps
1. Read the tile's role and accessible name
2. List every `fetch` URL

#### Expected Result
- One link named by title, tier and figures (or the first-download sentence)
- `/api/data-health` never requested

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-139: Data tile uses the display vocabulary in every state

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-19, DAC-E5-S2-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Data tile in every state of the story

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-140: Tile badges and em dashes carry shape, never colour alone

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-20, DAC-E5-S2-5
**Priority:** P2
**Type:** functional

#### Preconditions
- Verdict, score-state, *Downloading* and lag badges; `Absent` and `NotDeterminable` figures

#### Steps
1. Read each badge's label and icon attributes

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-141: Needs you order, action names and no mutating request

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-9, AC-25, DAC-E5-S3-1, DAC-E5-7, DAC-E5-8
**Priority:** P1
**Type:** functional

#### Preconditions
- Items `data_problems` (KO, TSLA, FBXX), `download_not_complete` (failed) and `credential_missing`; `fetch` spied

#### Steps
1. Render the list
2. Read the order and each action's accessible name
3. List `fetch` methods

#### Expected Result
- Critical before serious before warning, newest first within a tier
- *Fix data for KO, TSLA and FBXX*, *See the download that failed*, *Open Settings to set the market data key*
- No mutating method

#### Error / Edge Cases
- Each kind's tag, tier, title, body and single action per DAC-E5-7; plural forms by count

### TC-COMP-142: An item leaves when its cause is gone; count announced without moving focus

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-9, AC-25, DAC-E5-S3-2, DAC-E5-9
**Priority:** P1
**Type:** functional

#### Preconditions
- Needs you with an item; focus on a control

#### Steps
1. Deliver a next read lacking the item's cause
2. Read the live region and `document.activeElement`

#### Expected Result
- The item leaves; the new count is announced politely; focus unchanged

#### Error / Edge Cases
- No item: *Nothing needs you right now.* with *checked {time}* (DAC-E5-9)

### TC-COMP-143: Home's regions render the eight states or record non-applicability

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-24, DAC-E5-S3-3
**Priority:** P1
**Type:** functional

#### Preconditions
- Home rendered through `StateRegion`

#### Steps
1. Enumerate each region's states

#### Expected Result
- Never-populated is the empty card; nothing-found and partial do not apply; stale is the aging *checked {time}*; unavailable is the not-determinable figures; error per DAC-E5-11; unreachable is the shell's

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-144: Literal scan widened to web/src/screens/home/

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-26, DAC-E5-S3-4
**Priority:** P2
**Type:** functional

#### Preconditions
- `token-literals.test.ts` and `web/src/screens/home/`

#### Steps
1. Add the directory to the test's scanned list
2. Run `web/src/components/token-literals.test.ts`
3. Plant a `12px` literal in a non-test source and re-run

#### Expected Result
- Every `.ts` and `.tsx` source under the directory (tests excluded) holds no `px`, `rem`, `em`, `vh`, `vw`, hex, `rgb(` or `hsl(` literal outside `theme.css` tokens and `layout.ts`; the test passes
- The planted literal fails the test naming the file

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-145: Needs you card, rows and Home use the display vocabulary

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-19, DAC-E5-S3-5
**Priority:** P2
**Type:** functional

#### Preconditions
- Needs you and Home in every state of the story

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-146: Item tag badges carry the tier and shape; severity tile hidden

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-20, DAC-E5-S3-6
**Priority:** P2
**Type:** functional

#### Preconditions
- Needs you items rendered

#### Steps
1. Read each tag badge's label and icon; read the severity tile's `aria-hidden`

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-147: Home precedes Research in the rail and appears in the palette Pages

**Scope:** component
**Component(s):** home-ui
**Traces to:** AC-1, DAC-E5-S5-1
**Priority:** P1
**Type:** functional

#### Preconditions
- `DESTINATIONS` after story E5-S5; palette rendered

#### Steps
1. Render the rail
2. Open the palette and read the Pages group

#### Expected Result
- Home precedes the Research entry (when registered)
- Pages lists *Home*

#### Error / Edge Cases
- None beyond the scenario
