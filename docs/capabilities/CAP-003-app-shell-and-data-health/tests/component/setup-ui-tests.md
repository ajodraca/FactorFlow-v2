---
artifact_schema_version: 1
artifact_id: CAP-003-setup-ui-tests
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

# setup-ui Component Test Specification

Component tests for `setup-ui` (CAP-003). Each case verifies one story-level or epic-level derived acceptance criterion within a unit test harness for the FactorFlow-v2 repository; IDs are assigned in AC-ID order across every component file, so this file holds 29 cases (TC-COMP-098 to TC-COMP-126, not necessarily contiguous).

### TC-COMP-098: Step done flags follow server facts; current is the first not done

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-3, DAC-E4-1
**Priority:** P1
**Type:** functional

#### Preconditions
- `useSetupState` with health, depth, instruments and attention reads mocked

#### Steps
1. Resolve health only
2. Add `years` from the depth read
3. Add `active_count` 12
4. Add `attention.latest_download` in any state

#### Expected Result
- Step 1 done when health answered; step 2 when years returned; step 3 when `active_count` above 0; step 4 when a download exists
- The current step is the first not done, re-derived on every visit; done steps are links

#### Error / Edge Cases
- Depth read null: step 2 not done

### TC-COMP-099: Step 1 shows Found or Missing with the variable and restart line

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-4, DAC-E4-3
**Priority:** P1
**Type:** security

#### Preconditions
- Step 1 rendered with `credential_present` true, false and health unreachable

#### Steps
1. Render each case
2. Read the badge and the lines
3. Search the DOM for any key value

#### Expected Result
- `status-good` *Found* or `status-critical` *Missing* with *Set the environment variable `FACTORFLOW_MASSIVE_API_KEY` to your Massive API key.* and *Restart FactorFlow after setting it.*
- Unreachable: `coverage-unknown` *Not determinable* with its reason
- **Continue** always available; no value anywhere

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-100: Zero accepted blocks Continue; below 30 warns and continues

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-5, AC-6, DAC-E4-7
**Priority:** P1
**Type:** functional

#### Preconditions
- Step 3 with *Paste a list* chosen

#### Steps
1. Paste nothing usable
2. Paste 12 valid symbols

#### Expected Result
- **Continue** is `blocked` with *Paste at least one symbol, or choose Add later.*
- *Factor scores need at least 30 stocks with complete data. With 12, no factor can be ranked yet.* shows and **Continue** stays available

#### Error / Edge Cases
- 30 accepted: no warning

### TC-COMP-101: Start download outcomes: progress, queued line, each 409

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-7, AC-15, DAC-E4-9
**Priority:** P1
**Type:** functional

#### Preconditions
- Step 4 with `POST /api/acquisition-runs` mocked and `refresh` spied

#### Steps
1. Answer `202` with `queued_behind` null
2. Answer `202` with `queued_behind` set
3. Answer `409 history_depth_not_set`
4. Answer `409 no_active_instruments`

#### Expected Result
- `refresh("attention")` called; `progress` `determinate` *{done} of {total} stocks* (`indeterminate` while `total` null), *Started {start time}*, *checked {time}*, *You can leave; this keeps running.*
- *A download is running. This starts when it finishes.*
- *Couldn't start the download: history depth isn't set.* with **Go to step 2**
- *Couldn't start the download: no stocks are followed.* with **Go to step 3**

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-102: A missing key does not block Start download

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-17, DAC-E4-10
**Priority:** P2
**Type:** functional

#### Preconditions
- Step 4 with `credential_present` false, depth set and stocks followed

#### Steps
1. Read the **Start download** control
2. Activate it

#### Expected Result
- Not blocked; `POST /api/acquisition-runs` is sent

#### Error / Edge Cases
- The failed download then surfaces on Home (not this test)

### TC-COMP-103: Exactly four steps and two sources, no file control

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-3, DAC-E4-11
**Priority:** P1
**Type:** functional

#### Preconditions
- Setup rendered

#### Steps
1. Count the stepper's steps
2. Read step 3's source options

#### Expected Result
- Four steps; no paper trading step
- *Paste a list* and *Add later* only; no file control

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-104: Step 4 summary card restates key, depth and count; progress unreadable state

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-4, AC-24, DAC-E4-12
**Priority:** P2
**Type:** functional

#### Preconditions
- Step 4 with health, depth and count resolved; attention failing

#### Steps
1. Read the summary card
2. Read the progress region while attention fails

#### Expected Result
- Key presence badge, *{y} years* and *{n}* followed stocks restated
- *Progress can't be read right now* beside the running state, never a frozen bar

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-105: Drafts survive navigating away and back; nothing in browser storage

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-3, DAC-E4-S1-1, DAC-E4-2
**Priority:** P1
**Type:** functional

#### Preconditions
- `SetupDraftProvider` above a memory router

#### Steps
1. Enter years text, a radio choice and pasted text on `/setup`
2. Navigate to `/home` and back
3. Read `localStorage` and `sessionStorage`

#### Expected Result
- All three values survive
- Both storages hold nothing

#### Error / Edge Cases
- A freshly mounted provider starts empty (DAC-E4-2)

### TC-COMP-106: Failed depth read carries its error; step 4 blocked at zero stocks

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-21, AC-24, DAC-E4-S1-2, DAC-E4-13
**Priority:** P2
**Type:** functional

#### Preconditions
- `useSetupState` with the depth read failing; a second fixture with `active_count` 0 and step 4 current

#### Steps
1. Derive the state in each

#### Expected Result
- Step 2 not done; the state carries the error for *Couldn't read history depth: {reason}* with **Try again**
- `step4` is `blocked`

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-107: Setup copy is free of domain terms; plan limit is copy

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-19, DAC-E4-S1-3
**Priority:** P2
**Type:** functional

#### Preconditions
- `web/src/screens/setup/copy.ts`

#### Steps
1. Scan the file for the eight DAC-E7-3 terms as whole words
2. Read the plan-limit note

#### Expected Result
- None appears
- The note states 5 years as copy, not a validation

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-108: Successful depth save marks step 2 done and focuses step 3

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-3, AC-17, DAC-E4-S2-1, DAC-E4-4
**Priority:** P1
**Type:** functional

#### Preconditions
- Step 2 with `PUT /api/settings/history-depth` mocked to `200`

#### Steps
1. Enter 5 and press Continue
2. Read step 2's summary and `document.activeElement`

#### Expected Result
- Step 2 reads done *{y} years of history*; step 3 is current and its `h2` has focus

#### Error / Edge Cases
- `422`: field error *History depth must be a whole number of years from 1 to 50.* with the value kept (DAC-E4-4)

### TC-COMP-109: Step 1 unreachable shows Not determinable and never the key

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-4, DAC-E4-S2-2
**Priority:** P1
**Type:** security

#### Preconditions
- Step 1 with health unreachable

#### Steps
1. Read the badge
2. Search text and attributes for a key value

#### Expected Result
- `coverage-unknown`, never *Missing*
- No element carries the value

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-110: Literal scan widened to web/src/screens/setup/

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-26, DAC-E4-S2-3
**Priority:** P2
**Type:** functional

#### Preconditions
- `token-literals.test.ts` and `web/src/screens/setup/`

#### Steps
1. Add the directory to the test's scanned list
2. Run `web/src/components/token-literals.test.ts`
3. Plant a `12px` literal in a non-test source and re-run

#### Expected Result
- Every `.ts` and `.tsx` source under the directory (tests excluded) holds no `px`, `rem`, `em`, `vh`, `vw`, hex, `rgb(` or `hsl(` literal outside `theme.css` tokens and `layout.ts`; the test passes
- The planted literal fails the test naming the file

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-111: Step list, step card, steps 1 and 2 use the display vocabulary

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-19, DAC-E4-S2-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Steps 1 and 2 rendered in every state of the story

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-112: Key-presence badge through StatusBadge; Not determinable through NotDeterminable

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-20, DAC-E4-S2-5
**Priority:** P2
**Type:** functional

#### Preconditions
- Step 1 badges rendered

#### Steps
1. Read each badge's label and icon attributes

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-113: summarisePaste suggests fixes, names duplicates once

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-5, DAC-E4-S3-1, DAC-E4-5
**Priority:** P1
**Type:** functional

#### Preconditions
- `summarisePaste` under test

#### Steps
1. Summarise `BRK/B`, `BRK B`, `BRK_B`
2. Summarise `ZZZZ!`
3. Summarise `KO` twice

#### Expected Result
- Each suggests `BRK.B` (*Did you mean BRK.B?*)
- No fix
- One accepted, one duplicate named once and never posted twice

#### Error / Edge Cases
- Accepted entries are kept whatever else is rejected (AC-5)

### TC-COMP-114: 2500 symbols post as 1000, 1000, 500; parse on paste and blur only

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-5, DAC-E4-S3-2, DAC-E4-6
**Priority:** P1
**Type:** functional

#### Preconditions
- Step 3 with `POST /api/instruments` mocked

#### Steps
1. Paste 2500 symbols and press Continue
2. Type keystrokes into the textarea and count parse calls

#### Expected Result
- Three requests of 1000, 1000 and 500 in order
- Parse runs once on paste and once on blur, never per keystroke

#### Error / Edge Cases
- A `409` batch counts as success; a failed batch keeps its and later entries in the textarea (DAC-E4-6)

### TC-COMP-115: Add later and Continue post nothing and make step 4 current

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-2, AC-21, DAC-E4-S3-3, DAC-E4-8
**Priority:** P1
**Type:** functional

#### Preconditions
- Step 3 with `fetch` spied

#### Steps
1. Choose *Add later* and press Continue

#### Expected Result
- Nothing posted; `source` is `later` in the drafts; step 4 current with step 3 still to do

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-116: Pasted symbols are sent as a JSON array; rejections announced politely

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-25, DAC-E4-S3-4
**Priority:** P2
**Type:** security

#### Preconditions
- Step 3 with the POST mocked to return `rejected` entries

#### Steps
1. Paste and Continue
2. Read the request body and the textarea's live region

#### Expected Result
- A JSON array of symbols the delivered route validates per symbol
- Rejected entries announced with their reason politely

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-117: Step 3 states use the display vocabulary

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-19, DAC-E4-S3-5
**Priority:** P2
**Type:** functional

#### Preconditions
- Step 3 in parse summary, warning, blocked and error states

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-118: Step 3 renders no status badge; one-tier rule recorded not applicable

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-20, DAC-E4-S3-6
**Priority:** P2
**Type:** functional

#### Preconditions
- Step 3 rendered with dispositions

#### Steps
1. Search the step for any `StatusBadge`
2. Read the story's not-applicable record

#### Expected Result
- Dispositions are listed as text; no badge renders; the rule is recorded as not applicable
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-119: Progress checked time advances per attention answer; no own interval

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-25, DAC-E4-S4-1
**Priority:** P1
**Type:** functional

#### Preconditions
- Step 4 after a `202`; attention read mocked; timers spied

#### Steps
1. Deliver three attention answers
2. Count intervals opened by the screen

#### Expected Result
- *checked {time}* advances on each answer; the `progressbar` announces at the 10 s cadence, never per frame
- The screen opens no interval of its own

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-120: Blocked step 4 sends nothing by keyboard; exits reachable by Tab

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-2, AC-21, DAC-E4-S4-2, DAC-E4-8
**Priority:** P1
**Type:** functional

#### Preconditions
- Step 4 blocked with `active_count` 0

#### Steps
1. Tab to **Start download** and press Enter
2. Read `aria-describedby`
3. Tab onward

#### Expected Result
- No request; the reason *No stocks are followed. Follow stocks before downloading.* is read
- **Go to Home** and **Manage followed stocks** are links reachable by Tab

#### Error / Edge Cases
- `active_count` above 0: neither link renders (DAC-E4-8)

### TC-COMP-121: Going back from step 4 to step 2 and forward keeps every value

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-3, DAC-E4-S4-3
**Priority:** P1
**Type:** functional

#### Preconditions
- `setup.test.tsx` with values entered on steps 2 to 4

#### Steps
1. Go back to step 2
2. Go forward again

#### Expected Result
- Years text, radio choice and pasted text are as entered

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-122: Each step's eight states render or are recorded not applicable

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-24, DAC-E4-S4-4
**Priority:** P1
**Type:** functional

#### Preconditions
- Setup rendered through `StateRegion` per step

#### Steps
1. Enumerate loading, never-populated, nothing-found, partial, stale, unavailable, error and unreachable per step

#### Expected Result
- Each renders as UX design 1.2 states or is recorded as not applicable with its reason

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-123: Step 4, summary card and setup screen use the display vocabulary

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-19, DAC-E4-S4-5
**Priority:** P2
**Type:** functional

#### Preconditions
- Step 4 and the screen in every state of the story

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-124: Summary key badge, download state and progress carry shape

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-20, DAC-E4-S4-6
**Priority:** P2
**Type:** functional

#### Preconditions
- Step 4 badges and progress rendered

#### Steps
1. Read each badge's label and icon attributes; read the `progressbar`

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-125: Drafts survive the unreachable state and recovery

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-3, DAC-E4-S6-1, DAC-E3-14
**Priority:** P1
**Type:** functional

#### Preconditions
- Shell with `SetupDraftProvider` mounted outside the main region; drafts entered

#### Steps
1. Fail the health read, then recover

#### Expected Result
- Drafts unchanged, because the provider sits outside the main region

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-126: /setup is titled Setup, focuses its h1 and is enumerated

**Scope:** component
**Component(s):** setup-ui
**Traces to:** AC-17, DAC-E4-S6-2
**Priority:** P2
**Type:** functional

#### Preconditions
- Shell at `/setup`

#### Steps
1. Read the top bar and `document.activeElement`
2. Run `routes.test.tsx` and `titles.test.tsx`

#### Expected Result
- Top bar reads *Setup*; focus on the `h1`; both tests enumerate the route

#### Error / Edge Cases
- None beyond the scenario
