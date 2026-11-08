---
artifact_schema_version: 1
artifact_id: CAP-003-data-health-ui-tests
artifact_type: test-specification
artifact_version: 2
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-30
updated: 2026-11-08
ai_provenance:
  agent_id: test-design-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.318"
  timestamp: 2026-11-08T19:19:17Z
  source_artifacts:
    - id: CAP-003
      version: "2"
    - id: CAP-003-system-design
      version: "2"
    - id: CAP-003-backlog
      version: "4"
  invoking_user: Alvaro de Jodra
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# data-health-ui Component Test Specification

Component tests for `data-health-ui` (CAP-003). Each case verifies one story-level or epic-level derived acceptance criterion within a unit test harness for the FactorFlow-v2 repository; IDs are assigned in AC-ID order across every component file, so this file holds 43 cases (TC-COMP-148 to TC-COMP-289, not necessarily contiguous).

### TC-COMP-148: Verdict skeleton while attention loads; error with Try again while it fails

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-11, AC-24, DAC-E6-2
**Priority:** P1
**Type:** functional

#### Preconditions
- Verdict region with the attention read loading, then failing

#### Steps
1. Render while loading
2. Render after the failure

#### Expected Result
- A skeleton while loading
- Header kept; *Couldn't read what needs attention: {reason}.* with **Try again**; no tier computed without the download input

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-149: Company financials card labels, result line, as-of and note

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-11, DAC-E6-4
**Priority:** P1
**Type:** functional

#### Preconditions
- Card fixtures: `ok` with 30 stocks; `exceptions` with `absent_count` 2 and `problem_count` 1; `as_of` set

#### Steps
1. Render each

#### Expected Result
- `ok` *All financials present* with *All 30 stocks have financials*; `exceptions` *Needs attention* with *2 without financials, 1 with failed downloads* and zero parts omitted
- *Financials to {as_of}* with the zone, its exceptions, and *Checks that financials are present and downloaded, not that they are correct.*

#### Error / Edge Cases
- `as_of` null: absent rendering

### TC-COMP-150: Factor scores card from the shell summary in every state

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-8, AC-11, DAC-E6-5
**Priority:** P1
**Type:** functional

#### Preconditions
- Card with the summary `not_served`, `never_classified`, `building`, `failed`, `not_current` and `current`

#### Steps
1. Render each
2. Read the result and as-of lines

#### Expected Result
- Not served: `coverage-unknown` *Not determinable* with *FactorFlow can't read scores yet.*
- *No scores yet* (neutral), *Updating* (active), *Score update failed* (critical), *Not reflecting the latest download* (warning), *Current* (good)
- *{current} of {followed} stocks current* from `stocks_current` with *{k} stocks show as Incomplete until their data is complete*, *k* = `stocks_current.followed_count` minus `current_count`; *Scores {time} · from the download started {start time}* linking to the detail

#### Error / Edge Cases
- *k* never computed from attention's `followed_count`

### TC-COMP-151: never_acquired after a download ended: null check cards, not the empty card

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-21, AC-24, DAC-E6-7
**Priority:** P1
**Type:** functional

#### Preconditions
- `never_acquired` true, `affected_count` 3, `latest_terminal_download` set

#### Steps
1. Render the screen

#### Expected Result
- Verdict, *Needs fixing* and Recent downloads render
- Daily prices and Company financials cards render their null state: an `Absent` em dash for tier and result with hidden *no data stored yet*; never a passed check and never the empty card

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-152: Nothing needs fixing with the last complete download line

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-13, DAC-E6-10
**Priority:** P1
**Type:** functional

#### Preconditions
- `affected_count` 0; `GET /api/acquisition-runs?state=succeeded&limit=1` mocked

#### Steps
1. Render with one succeeded run
2. Render with none

#### Expected Result
- *Nothing needs fixing.* and *Last complete download {start time}*
- *No complete download yet*

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-153: Follow a different symbol navigates to Followed stocks with focusAdd

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-14, DAC-E6-13
**Priority:** P2
**Type:** functional

#### Preconditions
- A *Not found* row rendered in a memory router

#### Steps
1. Activate **Follow a different symbol than FBXX**
2. Read the location and router state

#### Expected Result
- `/data/followed` with state `{ focusAdd: true }`

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-154: What you follow lines, key badge and Manage link

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-4, AC-17, DAC-E6-16
**Priority:** P1
**Type:** functional

#### Preconditions
- Instruments count, depth and health reads mocked

#### Steps
1. Render with `active_count` 30, `retired_count` 2, years 5, key found
2. Render with depth null and health unreachable

#### Expected Result
- *Followed stocks 30*, *Stopped following 2 (history kept)*, *History depth 5 years* as a link to `/settings`, *Market data key* `badge` *Found*, **Manage followed stocks** to `/data/followed`
- *not set* link; key `coverage-unknown` *Not determinable*

#### Error / Edge Cases
- Key missing: *Missing*

### TC-COMP-155: A failed read replaces each card body with its error and no request_id

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-24, DAC-E6-17
**Priority:** P1
**Type:** functional

#### Preconditions
- Each of the aggregate, recent downloads and what-you-follow reads failing with a `500` envelope

#### Steps
1. Render
2. Search the DOM for the `request_id`

#### Expected Result
- Each card keeps its header; body *Couldn't read {the data health checks / recent downloads / what you follow}: {reason}.* with **Try again**
- No `request_id` shown

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-156: Verdict sentences: singular, all affected, failed download

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-11, DAC-E6-S1-1, DAC-E6-1
**Priority:** P1
**Type:** functional

#### Preconditions
- Verdict fixtures

#### Steps
1. Render `affected_count` 1 of 10 with a `partial` latest download
2. Render 10 of 10
3. Render a `failed` latest download with 0 affected

#### Expected Result
- *Mostly yes. 1 of 10 followed stocks needs attention; its scores show as Incomplete until it's fixed.*
- `status-critical` *No*
- *No. None of the 10 followed stocks needs attention, and the last download failed.*

#### Error / Edge Cases
- `abandoned`: `status-serious` *Mostly yes* with *, and the last download was interrupted.* (DAC-E6-1)

### TC-COMP-157: Gaps not determinable in the Daily prices card and the verdict

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-11, AC-24, DAC-E6-S1-2, DAC-E6-3
**Priority:** P1
**Type:** functional

#### Preconditions
- `gap_stock_count` null with `gap_detection.reason`; `absent_count` 2, `behind_count` 1

#### Steps
1. Render the card and the verdict

#### Expected Result
- Gap part *Gaps not determinable: {reason}* as `coverage-unknown`; absent and behind parts still render
- Verdict names *Daily prices can't be checked for gaps: {reason}.*

#### Error / Edge Cases
- `ok`: *No missing prices or gaps* with *All {m} stocks have prices to {latest_session}* (DAC-E6-3)

### TC-COMP-158: and {k} more from exception_count minus shown symbols

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-11, AC-24, DAC-E6-S1-3, DAC-E6-3
**Priority:** P2
**Type:** functional

#### Preconditions
- Daily prices card with five `exception_symbols`

#### Steps
1. Render with `exception_count` 7
2. Render with 5

#### Expected Result
- *and 2 more* follows the symbols
- No *and {k} more*

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-159: Verdict and check cards use the display vocabulary

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-19, DAC-E6-S1-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Verdict and the three cards in every state of the story

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-160: Verdict, check and score badges carry shape; Not determinable through NotDeterminable

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-20, DAC-E6-S1-5
**Priority:** P2
**Type:** functional

#### Preconditions
- Verdict badge, each check's tier badge and the score-state badge rendered

#### Steps
1. Read each badge's label and icon attributes

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-161: Download now 409 reasons never interchanged; transport failure offers Try again

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-15, DAC-E6-S2-1, DAC-E6-11
**Priority:** P1
**Type:** functional

#### Preconditions
- **Download now** with `POST /api/acquisition-runs` mocked

#### Steps
1. Answer `409 history_depth_not_set`
2. Answer `409 no_active_instruments`
3. Fail the transport

#### Expected Result
- *Couldn't start the download: history depth isn't set.* with **Set history depth** to `/settings`
- *Couldn't start the download: no stocks are followed.* with **Follow stocks** to `/data/followed`
- *Couldn't start the download: {reason}.* with **Try again**

#### Error / Edge Cases
- `202` `queued_behind` null: `refresh("attention")`; set: *A download is running. This starts when it finishes.* (DAC-E6-11)

### TC-COMP-162: Stop following 409 keeps the dialog open; Esc closes and refreshes the row

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-14, AC-17, DAC-E6-S2-2, DAC-E6-12
**Priority:** P1
**Type:** functional

#### Preconditions
- Stop-following dialog with `DELETE /api/instruments/{symbol}` mocked to `409`

#### Steps
1. Confirm
2. Press Esc

#### Expected Result
- Dialog stays open with *Couldn't stop following {SYMBOL}: {reason}.*
- Esc closes it; the row is refreshed

#### Error / Edge Cases
- `200`: dialog closes, aggregate re-read, `refresh("attention")`, *Stopped following {SYMBOL}* announced politely with no toast (DAC-E6-12)

### TC-COMP-163: Download now controls and stop-following dialog use the display vocabulary

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-19, DAC-E6-S2-3
**Priority:** P2
**Type:** functional

#### Preconditions
- Controls, helper lines, refusals and the dialog in every state of the story

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-164: No status badge in these controls; one-tier rule recorded not applicable

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-20, DAC-E6-S2-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Download now control and the dialog rendered

#### Steps
1. Search for any `StatusBadge`
2. Read the story's not-applicable record

#### Expected Result
- No badge renders; the rule is recorded as not applicable
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-165: A row with failed and not_found failures renders both fixes correctly

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-13, AC-14, DAC-E6-S3-1, DAC-E6-8
**Priority:** P1
**Type:** functional

#### Preconditions
- A row served `retryable: true` with a `failed` prices failure whose reason begins `[unavailable] ` and a `not_found` reference failure; when CAP-003-E8-S8 has landed, the failures also carry `cause` `"unavailable"` and `null`

#### Steps
1. Render the row

#### Expected Result
- Both badges render
- The *Failed* failure reads *Downloading daily prices failed: {reason}, {attempts} attempts* with its served `attempts`, then *Download again to retry; data already stored is never duplicated or overwritten.*
- *Not found* fix controls **Stop following** and **Follow a different symbol** render; no per-row download control exists

#### Error / Edge Cases
- Per-failure copy per DAC-E6-8: *The provider doesn't recognise this symbol.* and the consequence sentence
- No fixture of this case carries a reason beginning `[not_entitled] ` or `[rate_limited] `, whose rendering is CAP-003-E8-S9's (TC-COMP-282, TC-COMP-283; E6-S3 v2)

### TC-COMP-166: Show more appends pages with served cursors and keeps focus

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-13, AC-14, DAC-E6-S3-2, DAC-E6-9
**Priority:** P1
**Type:** functional

#### Preconditions
- 120 problem stocks; `fetchProblems` mocked

#### Steps
1. Render the first page
2. Activate **Show more** twice

#### Expected Result
- `fetchProblems` called with the served cursors and `limit` 50
- Rows append in symbol order; focus stays on the control

#### Error / Edge Cases
- `422`: *Couldn't read more problems: {reason}.* with **Try again** restarting from the first page (DAC-E6-9)

### TC-COMP-167: Provider reason renders verbatim as text; no request ID beyond it

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-24, DAC-E6-S3-3
**Priority:** P1
**Type:** security

#### Preconditions
- A row whose `reason` contains markup, begins `[unavailable] ` and holds `request_id=r1`

#### Steps
1. Render
2. Search the DOM

#### Expected Result
- The reason is text, never markup, shown verbatim as stored, its leading kind and its `request_id=r1` included
- No request ID appears anywhere beyond the reason text

#### Error / Edge Cases
- How a stored reason is shown to the owner is capability OQ-5's separate follow-up (E6-S3 v2; backlog review v6 FINDING-12)

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-168: Needs fixing card, rows, Show more, empty and error states use the display vocabulary

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-19, DAC-E6-S3-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Needs fixing in every state of the story

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-169: Failure outcome badges carry shape

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-20, DAC-E6-S3-5
**Priority:** P2
**Type:** functional

#### Preconditions
- *Failed* and *Not found* badges rendered

#### Steps
1. Read each badge's label and icon attributes

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-170: Partial and Interrupted never read as complete in Recent downloads

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-12, AC-25, DAC-E6-S4-1, DAC-E6-14
**Priority:** P1
**Type:** functional

#### Preconditions
- A `partial` and an `abandoned` run

#### Steps
1. Render the list

#### Expected Result
- *Partial* warning with *{written} of {named} stocks, {failed} failed*
- *Interrupted* serious with *FactorFlow restarted mid-download; {written} kept, the rest picked up next time*

#### Error / Edge Cases
- Columns *Started* (row header link), *Outcome*, *Ended* (em dash while running), *Result* (DAC-E6-14)

### TC-COMP-171: Recent downloads re-read per attention answer only while running

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-12, AC-25, DAC-E6-S4-2, DAC-E6-14
**Priority:** P1
**Type:** functional

#### Preconditions
- `listAcquisitionRuns` spied; attention read mocked

#### Steps
1. Deliver three answers with `latest_download` `running`
2. Deliver answers with it terminal

#### Expected Result
- One `listAcquisitionRuns` call per answer; *checked {time}* advances
- No re-read follows a terminal answer

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-172: What you follow key badge while unreachable is Not determinable, never the value

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-4, DAC-E6-S4-3
**Priority:** P1
**Type:** security

#### Preconditions
- Health unreachable

#### Steps
1. Render *What you follow*
2. Search for a key value

#### Expected Result
- `coverage-unknown`, never *Missing*
- No element carries a key value

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-173: Recent downloads and What you follow use the display vocabulary

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-19, DAC-E6-S4-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Both regions in every state of the story

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-174: Outcome column, key badge, progressbar and em dashes carry shape

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-20, DAC-E6-S4-5
**Priority:** P2
**Type:** functional

#### Preconditions
- *Outcome* badges, key badge, running `progressbar`, `Absent` dashes

#### Steps
1. Read each badge's label and icon attributes

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-175: Empty card offers Open setup or Start the first download; running first download shows beneath

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-21, DAC-E6-S5-1, DAC-E6-6
**Priority:** P1
**Type:** functional

#### Preconditions
- `latest_terminal_download` null

#### Steps
1. Render with `active_count` 0
2. Render with `active_count` 12
3. Render with a running first download

#### Expected Result
- **Open setup** to `/setup` with *Follow some stocks first.*
- **Start the first download** with *Download data for your 12 followed stocks to see whether it can be trusted.*
- Recent downloads renders beneath with its progress

#### Error / Edge Cases
- Card `h2` *No data has been downloaded yet.*; verdict, check cards and What you follow absent (DAC-E6-6)

### TC-COMP-176: Aggregate read once with no action; once more after stop following

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-11, AC-28, DAC-E6-S5-2, DAC-E6-15
**Priority:** P1
**Type:** functional

#### Preconditions
- Screen mounted with fake timers; `fetchDataHealth` spied

#### Steps
1. Advance ten minutes with no action and no terminal transition
2. Confirm a successful stop following

#### Expected Result
- `fetchDataHealth` called exactly once
- Called once more

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-177: Data health regions render the eight states or record non-applicability

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-24, DAC-E6-S5-3
**Priority:** P1
**Type:** functional

#### Preconditions
- Screen rendered through `StateRegion`

#### Steps
1. Enumerate each region's states

#### Expected Result
- Each renders or records why it does not apply; the check cards' Stale state is recorded as not rendered under DEC-0201 until a trading calendar exists

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-178: Literal scan widened to web/src/screens/data-health/

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-26, DAC-E6-S5-4
**Priority:** P2
**Type:** functional

#### Preconditions
- `token-literals.test.ts` and `web/src/screens/data-health/`

#### Steps
1. Add the directory to the test's scanned list
2. Run `web/src/components/token-literals.test.ts`
3. Plant a `12px` literal in a non-test source and re-run

#### Expected Result
- Every `.ts` and `.tsx` source under the directory (tests excluded) holds no `px`, `rem`, `em`, `vh`, `vw`, hex, `rgb(` or `hsl(` literal outside `theme.css` tokens and `layout.ts`; the test passes
- The planted literal fails the test naming the file

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-179: Data health screen uses the display vocabulary in every state

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-19, DAC-E6-S5-5
**Priority:** P2
**Type:** functional

#### Preconditions
- Screen in every state including the empty card and null check cards

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-180: Every status on the screen carries shape; null check tiers through Absent

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-20, DAC-E6-S5-6
**Priority:** P2
**Type:** functional

#### Preconditions
- Every region's badges and the null check tiers rendered

#### Steps
1. Read each badge's label and icon attributes

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-226: The what-failed line shows the served attempts value, never a literal 3

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-13, DAC-E6-S3-6, DAC-E6-8
**Priority:** P1
**Type:** functional

#### Preconditions
- `problem-row.test.tsx`; *Failed* failures with reasons beginning `[unavailable] ` (or `null`) serving `attempts` 1 and, in a second fixture, 2

#### Steps
1. Render each row
2. Read the what-failed line

#### Expected Result
- The line reads *Downloading {data type} failed: {reason}, {attempts} attempts* with `{attempts}` the value that fixture serves, unchanged
- No assertion in the story's tests expects a recorded 3

#### Error / Edge Cases
- Production rows serve the column default, 1, because the delivered writer never records `attempts` (specification review v5 FINDING-29)

### TC-COMP-227: The fix is chosen in one place keyed by outcome, the attempt count part of it

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-13, AC-14, DAC-E6-S3-7, DAC-E6-8
**Priority:** P2
**Type:** functional

#### Preconditions
- `problem-row.tsx` after CAP-003-E6-S3

#### Steps
1. Read where a failure's fix is chosen
2. Render a *Failed* and a *Not found* failure

#### Expected Result
- One choice per failure keyed by its outcome: *Failed* gives the *Download again* line; *Not found* gives its controls and sentence
- The what-failed line's attempt count is rendered inside that per-failure rendering, so CAP-003-E8-S9 can route the choice through `failureRecovery` without changing TC-COMP-165's or TC-COMP-226's assertions

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-282: A plan-refusal failure names the plan, drops the attempts and offers no download

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-29, AC-13, DAC-E8-S9-1, DAC-E8-17
**Priority:** P1
**Type:** functional

#### Preconditions
- `problem-row.test.tsx`; failure `{ data_type: "fundamentals", outcome: "failed", cause: "not_entitled", reason: "[not_entitled] symbol=KO data_type=fundamentals request_id=r1: the provider plan is not entitled to this data", attempts: 1 }`

#### Steps
1. Render the row
2. Query buttons and links by accessible name

#### Expected Result
- *Failed* renders through `StatusBadge`
- The what-failed line reads exactly *Downloading company financials failed: {reason}* with no *attempts* text
- `PLAN_FIX_TEXT` renders as one `--text-xs` line
- No button and no link whose accessible name contains *Download*; no per-row control

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-283: A rate-limited failure offers the later download with no per-row control

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-30, AC-13, DAC-E8-S9-2, DAC-E8-17
**Priority:** P1
**Type:** functional

#### Preconditions
- `problem-row.test.tsx`; a `failed` failure with cause `rate_limited` and a reason beginning `[rate_limited] `

#### Steps
1. Render the row

#### Expected Result
- The what-failed line ends at *{reason}* with no *attempts* text
- `RATE_LIMIT_FIX_TEXT` renders as one `--text-xs` line
- The row holds no per-row control; the header's **Download now** is the action

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-284: Unavailable and null causes keep Download again with the served attempts

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-13, AC-29, AC-30, DAC-E8-S9-3, DAC-E8-17, DAC-E8-19
**Priority:** P1
**Type:** functional

#### Preconditions
- `problem-row.test.tsx`; `failed` failures with cause `unavailable` and with cause `null`, each serving its fixture's `attempts`

#### Steps
1. Render each row

#### Expected Result
- Each reads *Downloading {data type} failed: {reason}, {attempts} attempts* with the served value, as E6-S3 renders it
- Each is followed by *Download again to retry; data already stored is never duplicated or overwritten.*
- The assertion uses the served value, never a literal 3

#### Error / Edge Cases
- A result recorded before the upgrade (`[unavailable]`) reads as an ordinary failure (DAC-E8-19)

### TC-COMP-285: A not-found failure keeps its fixes whatever its cause

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-14, DAC-E8-S9-4, DAC-E8-15
**Priority:** P1
**Type:** functional

#### Preconditions
- `problem-row.test.tsx`; `not_found` failures whose cause is `not_entitled`, `rate_limited` and `null`

#### Steps
1. Render each row

#### Expected Result
- Each renders E6-S3's *Not found* fix: **Stop following**, **Follow a different symbol** and *Probably a typo or a delisted ticker. Downloading again won't help.*
- No download is offered and neither new fix text renders

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-286: Download now hides when only plan refusals load and returns with one rate limit

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-29, AC-30, AC-16, DAC-E8-S9-5, DAC-E8-17
**Priority:** P1
**Type:** functional

#### Preconditions
- `needs-fixing.test.tsx`; every loaded row `retryable: false` because its failures are `not_entitled`

#### Steps
1. Render the card and read the header
2. Add one row with a `rate_limited` failure and `retryable: true`; re-render

#### Expected Result
- Step 1: no **Download now**; the header reads *Needs fixing · {affected_count}*, plan refusals included
- Step 2: **Download now** renders; the header count is still `affected_count`

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-287: The data-health screen holds no copy of the fix words or of the cause mapping

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-29, AC-30, DAC-E8-S9-6, DAC-E8-16
**Priority:** P2
**Type:** functional

#### Preconditions
- A source check in the story's tests reading the non-test sources under `web/src/screens/data-health/`, as `web/src/components/token-literals.test.ts` reads sources

#### Steps
1. Run the check
2. Plant `"not_entitled"` in a source and re-run

#### Expected Result
- Neither *Your Massive plan doesn't include this data* nor *FACTORFLOW_MASSIVE_REQUESTS_PER_MINUTE* appears, nor the string literals `"not_entitled"` and `"rate_limited"`
- The planted literal fails the check naming the file

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-288: The new fix lines pass the literal scan with the delivered text-xs class

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-26, DAC-E8-S9-7
**Priority:** P2
**Type:** functional

#### Preconditions
- The AC-26 literal scan as CAP-003-E6-S5 widens it to `web/src/screens/data-health/`

#### Steps
1. Run it after the story
2. Read the class of each new fix line

#### Expected Result
- It passes
- Each new fix line takes the delivered fix line's `--text-xs` class; no component, variant, token or literal is added

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-289: The two new row states keep the display vocabulary and render the reason as text

**Scope:** component
**Component(s):** data-health-ui
**Traces to:** AC-19, DAC-E8-S9-8
**Priority:** P2
**Type:** security

#### Preconditions
- Rows rendered with a `not_entitled` and a `rate_limited` failure; a reason containing markup

#### Steps
1. Run E6-S3's DAC-E6-S3-4 term scan over the visible text and accessible names
2. Search the DOM for elements created from the reason

#### Expected Result
- None of *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* appears as a whole word in any case
- The reason renders as text, never markup (AGT-PROHIB-003)

#### Error / Edge Cases
- The stored reason's leading kind and `request_id=` render verbatim as part of the reason text (capability OQ-5 is a separate follow-up)
