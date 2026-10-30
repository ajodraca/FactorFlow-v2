---
artifact_schema_version: 1
artifact_id: CAP-003-owner-shell-tests
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

# owner-shell Component Test Specification

Component tests for `owner-shell` (CAP-003). Each case verifies one story-level or epic-level derived acceptance criterion within a unit test harness for the FactorFlow-v2 repository; IDs are assigned in AC-ID order across every component file, so this file holds 37 cases (TC-COMP-056 to TC-COMP-182, not necessarily contiguous).

### TC-COMP-056: Root renders a skeleton then redirects by most_recent_run

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-2, AC-21, DAC-E3-1
**Priority:** P1
**Type:** functional

#### Preconditions
- Shell rendered at `/` in a memory router with the health read mocked

#### Steps
1. Render before the health answer arrives
2. Resolve health with `most_recent_run` null
3. Re-render with `most_recent_run` set
4. Navigate to `/data` with setup incomplete

#### Expected Result
- One card-shaped skeleton until the first health answer
- `Navigate replace` to `/setup` when null and `/home` otherwise
- Every other destination stays reachable with its honest empty state

#### Error / Edge Cases
- Health unreachable: unreachable state, no redirect

### TC-COMP-057: DESTINATIONS is one static ordered list with RESEARCH_REGISTERED

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-1, AC-27, DAC-E3-2
**Priority:** P1
**Type:** functional

#### Preconditions
- `web/src/app/destinations.ts`

#### Steps
1. Import `DESTINATIONS` and `RESEARCH_REGISTERED`
2. Grep the app for runtime route detection

#### Expected Result
- One static, ordered list; `RESEARCH_REGISTERED` is true exactly when the Research entry is present
- No runtime route detection anywhere

#### Error / Edge Cases
- A destination without a registered screen: review rejects it

### TC-COMP-058: Unknown path renders the not-found state inside the frame

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-24, DAC-E3-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Shell rendered at an unregistered path

#### Steps
1. Read the top-bar title, the main region and the link

#### Expected Result
- Rail and top bar remain; title *Page not found*; *There's no page at this address.* with a **Home** link to `/home`

#### Error / Edge Cases
- Unknown `/api` path: not the shell's concern (server envelope)

### TC-COMP-059: Summary 404 is not_served; other errors keep last value

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-8, AC-24, DAC-E3-6
**Priority:** P1
**Type:** functional

#### Preconditions
- Shell context with the summary read mocked

#### Steps
1. Answer the summary with `404 not_found`
2. Answer with `500`
3. Fail an attention read after a success

#### Expected Result
- `scores` is `not_served`, not an error; score figures render not determinable
- Other errors render the score regions' error state with **Try again**
- `error.last` keeps the previous value so a chip or card shows it stale

#### Error / Edge Cases
- Recovery after an error: the value is replaced

### TC-COMP-060: Rail chips: counts, absence at zero, names, stale name, polite announcement

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-16, AC-25, DAC-E3-7
**Priority:** P1
**Type:** functional

#### Preconditions
- Shell rendered with attention and summary fixtures

#### Steps
1. Render with 3 problem stocks and 2 Needs-you items
2. Render with zero of each
3. Fail the attention read and read the chip names
4. Change the count and read the live region

#### Expected Result
- Home chip equals `deriveNeedsYou(attention, scores).length`; Data health chip equals `attention.problems.stock_count`; names include the count in words
- A zero count renders no chip
- While attention fails the chip keeps its value and its name gains *, as of {time}*
- A changed count is announced through one polite live region

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-061: Unreachable state card, Last answered line and recovery remount

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-23, DAC-E3-8
**Priority:** P1
**Type:** functional

#### Preconditions
- Shell rendered on `/data/followed`; health mocked

#### Steps
1. Fail the health read
2. Read the main region
3. Succeed the health read again

#### Expected Result
- A `card` with a `section` `role="status"`: *FactorFlow is not answering.*, the cause paragraph and *Last answered {YYYY-MM-DD HH:MM:SS zone}* from `lastAnsweredAt`, announced once
- On recovery the routed screen mounts again at the same URL and refetches; announced once

#### Error / Edge Cases
- Never answered: *Not yet answered since this page opened*

### TC-COMP-063: Top bar leaves the environment region and kill switch place empty

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-10, DAC-E3-17
**Priority:** P2
**Type:** functional

#### Preconditions
- Shell rendered on any route

#### Steps
1. Inspect the top bar for environment or kill-switch controls, disabled or otherwise

#### Expected Result
- No control, placeholder or disabled element occupies the place; it is empty

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-064: useDataHealth reads on mount, retry and terminal transition only

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-28, DAC-E3-19
**Priority:** P1
**Type:** functional

#### Preconditions
- `useDataHealth` under a shell context with fake timers

#### Steps
1. Mount and count reads
2. Call `retry()`
3. Advance ten minutes with no change
4. Have the attention read show `latest_download` turning terminal

#### Expected Result
- One read on mount, one on `retry()`, none on a timer, one on the terminal transition
- Used by `data-health-ui` alone (grep)

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-065: client.ts export change is one keyword; delivered tests unchanged

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-17, DAC-E3-S1-1, DAC-E7-12
**Priority:** P2
**Type:** functional

#### Preconditions
- The story's diff of `web/src/api/client.ts`

#### Steps
1. Read the diff
2. Run `client.coverage.test.ts`, `client.runs.test.ts` and `render.test.tsx`

#### Expected Result
- Only the `export` keyword on line 154 changes; the three tests pass unchanged
- If CAP-002-E4-S1 already exported it, `client.ts` is not edited at all

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-066: fetchScoreSummary resolves not_served on 404 and rejects otherwise

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-24, DAC-E3-S1-2
**Priority:** P1
**Type:** functional

#### Preconditions
- `fetch` mocked for `/api/classifications/summary`

#### Steps
1. Answer `404`
2. Answer `500` and a network failure

#### Expected Result
- Resolves to `{ kind: "not_served" }`
- Rejects with `ApiError` or `ApiUnreachableError` as delivered

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-067: fetchProblems sends limit and cursor only when set

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-13, DAC-E3-S1-3
**Priority:** P2
**Type:** functional

#### Preconditions
- `fetch` mocked for `/api/data-health/problems`

#### Steps
1. Call `fetchProblems(undefined, 50)`
2. Call `fetchProblems('KO', 50)`

#### Expected Result
- First request carries `limit=50` and no `cursor`; second carries both
- Returns `ProblemPage` with `next_cursor` as served

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-068: shell-types mirror the wire shape without added or renamed fields

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-8, AC-16, DAC-E3-S1-4, DAC-E3-18
**Priority:** P2
**Type:** functional

#### Preconditions
- `shell-types.ts`

#### Steps
1. Compile and compare `Attention` against the §4.2 `AttentionResponse` fields

#### Expected Result
- `Attention.latest_terminal_download` carries the recorded terminal `state` and `failure_reason`; no field added or renamed

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-069: usePolledRead pauses while hidden, reads at once on show, never overlaps

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-25, DAC-E3-S2-1, DAC-E3-5
**Priority:** P1
**Type:** functional

#### Preconditions
- `usePolledRead` with fake timers and a read whose answer implies 10 s

#### Steps
1. Set `document.visibilityState` hidden and advance 30 s
2. Set it visible
3. Hold a read in flight and advance past its interval

#### Expected Result
- No read fires while hidden
- One fires at once on visible and the schedule resumes
- No second read of the same kind starts while one is in flight

#### Error / Edge Cases
- Unmount: the timer is cleared

### TC-COMP-070: A failed read keeps the previous value in error.last

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-24, DAC-E3-S2-2
**Priority:** P2
**Type:** functional

#### Preconditions
- `usePolledRead` after one success

#### Steps
1. Fail the next read
2. Read the state

#### Expected Result
- `{ kind: "error", error, last: { data, checkedAt } }` with the previous value kept

#### Error / Edge Cases
- First read fails: `last` is absent

### TC-COMP-071: HealthProvider records lastAnsweredAt and keeps delivered rendering

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-23, DAC-E3-S2-3
**Priority:** P2
**Type:** functional

#### Preconditions
- `HealthProvider` with the health read mocked

#### Steps
1. Succeed a read and read `lastAnsweredAt`
2. Run the delivered `formatTimestamp` cases

#### Expected Result
- `lastAnsweredAt` is the instant of the success
- The delivered tests still render *America/Chicago*

#### Error / Edge Cases
- Delivered `unknown`, `answering`, `unreachable` states and 30 s cadence unchanged (DAC-E3-5)

### TC-COMP-072: The seven layout values live only in layout.ts

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-26, DAC-E3-S2-4, DAC-E3-16
**Priority:** P1
**Type:** functional

#### Preconditions
- `token-literals.test.ts` layout rule over `web/src/`

#### Steps
1. Run the rule
2. Plant `208px` in another source and re-run

#### Expected Result
- `208px`, `1180px`, `260px`, `300px`, `28px`, `16px` and `70ch` occur in no non-test source other than `web/src/app/layout.ts`
- The planted value fails the test

#### Error / Edge Cases
- `layout.ts` holds `railWidth` 208, `contentMaxWidth` 1180, `sideColumnMin` 260, `sideColumnMax` 300, `markerSize` 28, `railIconSize` 16, `explanationMeasure` 70ch (DAC-E3-16)

### TC-COMP-073: Attention and summary cadence: 60 s idle, 10 s while a download runs

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-25, DAC-E3-S3-1
**Priority:** P1
**Type:** functional

#### Preconditions
- Shell context with fake timers and attention fixtures

#### Steps
1. Answer with no running download and advance time
2. Answer with `latest_download.state` `running`
3. Answer with the download terminal

#### Expected Result
- 60 s between reads when idle
- 10 s while non-terminal
- Back to 60 s after the next answer once terminal

#### Error / Edge Cases
- Scores building: 10 s as well (DEC-0212)

### TC-COMP-074: refresh("attention") reads at once and reschedules without overlap

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-25, DAC-E3-S3-2, DAC-E3-5
**Priority:** P2
**Type:** functional

#### Preconditions
- Shell context with a scheduled attention read

#### Steps
1. Call `refresh("attention")`
2. Advance to the previously scheduled time

#### Expected Result
- One attention read fires at once; the next is rescheduled from it; no overlap

#### Error / Edge Cases
- `refresh` during an in-flight read: no second read

### TC-COMP-075: setTitleDetail holds the detail until cleared or unmount

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-17, DAC-E3-S3-3
**Priority:** P2
**Type:** functional

#### Preconditions
- Shell context with a screen calling `setTitleDetail`

#### Steps
1. Call `setTitleDetail("Download 2026-10-15 09:30 CDT")`
2. Unmount the calling screen

#### Expected Result
- The context holds the text until `setTitleDetail(null)`
- Unmount clears it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-076: Shell context exposes credential_present as a boolean only

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-4, DAC-E3-S3-4
**Priority:** P1
**Type:** security

#### Preconditions
- Shell context types and a health answer

#### Steps
1. Read `health.credential_present`
2. Inspect every context type for a value field

#### Expected Result
- A boolean is passed; no value field exists on any context type

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-077: Legacy paths redirect with replace and the query kept

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-18, DAC-E3-S4-1, DAC-E3-3
**Priority:** P1
**Type:** functional

#### Preconditions
- `legacy-redirects.tsx` in a memory router

#### Steps
1. Visit `/runs/abc?x=1`
2. Visit `/coverage`, `/instruments` and `/runs`

#### Expected Result
- Location becomes `/data/downloads/abc?x=1` with `replace`
- The others land on `/data/coverage`, `/data/followed`, `/data/downloads`

#### Error / Edge Cases
- History length does not grow (replace)

### TC-COMP-078: titles.ts gives every registered route a title with linked crumbs

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-17, DAC-E3-S4-2, DAC-E3-9
**Priority:** P2
**Type:** functional

#### Preconditions
- `titles.ts` and the route map

#### Steps
1. Enumerate every registered route and read its title
2. Read the crumb links

#### Expected Result
- *Settings*, *Data health › Coverage*, *Data health › Followed stocks*, *Data health › Downloads*, *Data health › Downloads › Download* (generic noun until set), *Page not found*, and the Research titles when registered
- *Data health* links to `/data` and *Downloads* to `/data/downloads`

#### Error / Edge Cases
- An unregistered route: no title entry

### TC-COMP-079: routes.test asserts only the routes this story registers

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-17, DAC-E3-S4-3
**Priority:** P2
**Type:** functional

#### Preconditions
- `routes.test.tsx` at story E3-S4

#### Steps
1. Run the test and list its assertions

#### Expected Result
- Visits the five delivered screens at their new paths, asserts the not-found state for an unknown path and the `/` redirect targets by URL
- Asserts nothing about `/setup`, `/home` or `/data` content

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-080: NotFound is a status card with a keyboard-reachable Home link

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-19, AC-25, DAC-E3-S4-4
**Priority:** P2
**Type:** functional

#### Preconditions
- `NotFound` rendered

#### Steps
1. Read the card, section role and `h1`
2. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case
3. Tab to the link

#### Expected Result
- A `card` holding a `section` `role="status"` with the `h1` and the **Home** link
- Text free of the eight terms; the link is reachable by keyboard

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-087: Rail lists Research (when registered) and Settings only, no disabled item

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-1, DAC-E3-S6-1
**Priority:** P1
**Type:** functional

#### Preconditions
- Shell at story E3-S6 with `DESTINATIONS` enumerated by `shell.test.tsx`

#### Steps
1. Render the rail
2. Read the groups and items
3. Inspect `shell.test.tsx`'s enumeration

#### Expected Result
- Two groups; the Research entry only when registered, and Settings; nothing else; no disabled item
- The test enumerates `DESTINATIONS` rather than a fixed list

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-088: ⌘K ignored in text fields, opens on document, Esc restores focus

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-22, AC-25, DAC-E3-S6-2, DAC-E3-10
**Priority:** P1
**Type:** functional

#### Preconditions
- Shell rendered with the palette

#### Steps
1. Dispatch `keydown` ⌘K on an `input`, a `textarea`, a `select` and a `contenteditable`
2. Dispatch it on `document`
3. Press Esc

#### Expected Result
- The palette does not open from the text fields
- It opens from `document`; Esc returns focus to the opener

#### Error / Edge Cases
- Ctrl+K: same behaviour (DAC-E3-10)

### TC-COMP-089: startup specs rewritten to the frame, redirect URLs and unreachable text

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-1, AC-23, DAC-E3-S6-3, DAC-E3-15
**Priority:** P2
**Type:** functional

#### Preconditions
- `startup-health.spec.ts` and `startup-refusal.spec.ts` at story E3-S6

#### Steps
1. Read the specs' assertions

#### Expected Result
- They assert the frame renders, `/` redirects to `/setup` or `/home` by URL, and the unreachable state's text with *Last answered*
- Nothing about screens later stories register

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-090: Below 768 px the rail stacks above the content and stays reachable

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-26, DAC-E3-S6-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Shell rendered at a 700 px viewport

#### Steps
1. Read the rail's position relative to the main region
2. Tab through every rail item

#### Expected Result
- The rail stacks above the content; every item stays reachable

#### Error / Edge Cases
- Desktop width: rail beside the content at `railWidth`

### TC-COMP-091: Literal scan widened to web/src/app/

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-26, DAC-E3-S6-5
**Priority:** P1
**Type:** functional

#### Preconditions
- `token-literals.test.ts` and `web/src/app/`

#### Steps
1. Add the directory to the test's scanned list
2. Run `web/src/components/token-literals.test.ts`
3. Plant a `12px` literal in a non-test source and re-run

#### Expected Result
- Every `.ts` and `.tsx` source under the directory (tests excluded) holds no `px`, `rem`, `em`, `vh`, `vw`, hex, `rgb(` or `hsl(` literal outside `theme.css` tokens and `layout.ts`; the test passes
- The planted literal fails the test naming the file

#### Error / Edge Cases
- `layout.ts` excluded by name

### TC-COMP-092: Shell surfaces use the display vocabulary

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-19, DAC-E3-S6-6
**Priority:** P1
**Type:** functional

#### Preconditions
- Rail, chips, top bar, unreachable state and toast container rendered in every state of the story

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-093: Chip badges and the unreachable status carry tier shape, never colour alone

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-20, DAC-E3-S6-7
**Priority:** P1
**Type:** functional

#### Preconditions
- Chip badges (`status-warning`) and the unreachable `role="status"` section rendered

#### Steps
1. Read each badge's text and icon attributes
2. Render an undeterminable value

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-094: One warning toast on running to partial, none on /data

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-12, DAC-E3-S7-1, DAC-E3-13
**Priority:** P1
**Type:** functional

#### Preconditions
- Shell on `/home` with the attention read mocked

#### Steps
1. Answer `latest_download.state` `running` then `partial`
2. Repeat on `/data`

#### Expected Result
- Exactly one `warning` toast reading *Download {start time}* with label *Partial*, linking to `/data/downloads/{id}`
- On `/data`: none

#### Error / Edge Cases
- `cancelled`: no toast; `failed`: `error`; `succeeded`: `success` (DAC-E3-13)

### TC-COMP-095: No toast when the first answer after mount is already terminal

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-12, DAC-E3-S7-2, DAC-E3-13
**Priority:** P2
**Type:** functional

#### Preconditions
- Shell mounted with the attention read mocked

#### Steps
1. Answer with a terminal `latest_download` first

#### Expected Result
- No toast is raised, because no transition was observed

#### Error / Edge Cases
- A later transition: one toast

### TC-COMP-096: Toast title, label and link use the display vocabulary

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-19, DAC-E3-S7-3
**Priority:** P2
**Type:** functional

#### Preconditions
- The toast rendered in every state of the story

#### Steps
1. Scan visible text and accessible names for *instrument*, *acquisition*, *acquire*, *run*, *runs*, *Retire*, *Retired*, *Provider credential* as whole words, any case

#### Expected Result
- None of the eight terms appears
- Every label is the STD-UI-1 v6 display label from `labelOf` or the component's `copy.ts`, never the domain term beside it

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-097: Toast outcome label renders through StatusBadge with its shape

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-20, DAC-E3-S7-4
**Priority:** P2
**Type:** functional

#### Preconditions
- Toasts for *Complete*, *Partial*, *Interrupted*, *Failed*

#### Steps
1. Read each label's badge and icon attributes

#### Expected Result
- Each status goes through `StatusBadge` with its label as text and its tier shape `aria-hidden`
- A value no artifact can determine goes through `NotDeterminable`; no state is conveyed by colour alone

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-181: Data health crumb on /data/downloads links to /data

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-17, DAC-E6-S7-1
**Priority:** P1
**Type:** functional

#### Preconditions
- Shell at `/data/downloads` after story E6-S7

#### Steps
1. Read the *Data health* crumb
2. Activate it

#### Expected Result
- Links to `/data` and lands on the Data health screen

#### Error / Edge Cases
- None beyond the scenario

### TC-COMP-182: Data health reached from the rail and palette Pages by keyboard, h1 focused

**Scope:** component
**Component(s):** owner-shell
**Traces to:** AC-1, AC-25, DAC-E6-S7-2
**Priority:** P1
**Type:** functional

#### Preconditions
- Shell with `/data` registered

#### Steps
1. Tab to Data health in the rail and press Enter
2. Open the palette, type *Data*, choose Pages › Data health

#### Expected Result
- `/data` renders with its `h1` focused, both ways

#### Error / Edge Cases
- None beyond the scenario
