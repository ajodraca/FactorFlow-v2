---
artifact_schema_version: 1
artifact_id: CAP-003-e2e-tests
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


# CAP-003 End-to-End Test Specification

One happy-path and one error-path journey per user flow of the capability specification (section 3). Steps describe only what the owner does and sees on the deployed product; the components involved are listed in metadata for traceability.

### TC-E2E-001: Flow 1 happy path: empty install to a started first download

**Scope:** e2e
**Component(s):** owner-shell, setup-ui, home-ui, ui-components, ingestion-api, data-health-api
**Traces to:** AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-21, AC-25
**Priority:** P1
**Type:** functional
**Journey:** Get from an empty install to a first download — happy path

#### Preconditions
- Fresh install with no data downloaded; the market data credential set

#### Steps
1. Open the product for the first time
2. Read step 1 of setup
3. Enter how far back history should go and read the plan's limit
4. Paste a list of 12 stock symbols including one duplicate and one unreadable entry, and read the summary
5. Continue and start the first download
6. Leave setup and open the product again
7. Watch Home for a while

#### Expected Result
- The product opens setup, not an empty screen; setup shows its steps and the owner's position
- Step 1 says the credential was found, never its value
- The summary names how many were accepted, the duplicate and the unreadable entry, keeps the accepted ones and warns that no factor can be ranked below 30; Continue is still available
- The download runs on its own; the product now opens on Home, which shows the download's progress until scores exist

#### Error / Edge Cases
- Going back a step keeps every value entered later (flow 1 step 6)
- A missing credential: step 1 names the variable to set and that the product must be restarted

### TC-E2E-002: Flow 1 error path: no usable symbol, Add later, setup stays incomplete

**Scope:** e2e
**Component(s):** owner-shell, setup-ui, home-ui, ui-components, ingestion-api, data-health-api
**Traces to:** AC-2, AC-3, AC-5, AC-21
**Priority:** P1
**Type:** functional
**Journey:** Get from an empty install to a first download — error path

#### Preconditions
- Fresh install; depth entered on step 2

#### Steps
1. Paste text containing no usable symbol and read step 3
2. Choose *Add later* and Continue
3. Read step 4 and choose **Go to Home**
4. Open the product again

#### Expected Result
- Continue is withheld with the reason stated beside it
- Step 4's start is blocked with the reason that no stocks are followed, offering **Go to Home** and **Manage followed stocks**
- Home says no data has been downloaded yet and offers setup
- The product still opens setup, with the entered values kept

#### Error / Edge Cases
- Following stocks on the followed-stocks screen and returning: step 4 is ready

### TC-E2E-003: Flow 2 happy path: read the verdict, retry a failure, stop following a symbol

**Scope:** e2e
**Component(s):** owner-shell, data-health-ui, owner-web-app, ui-components, data-health-api, ingestion-api
**Traces to:** AC-11, AC-12, AC-13, AC-14, AC-15, AC-16, AC-20, AC-25
**Priority:** P1
**Type:** functional
**Journey:** Decide whether the data can be trusted — happy path

#### Preconditions
- A download ended partial: two stocks failed on prices, one symbol the provider does not recognise

#### Steps
1. Open Data health and read the title and the three check cards
2. Read *Needs fixing*
3. On a failed row's guidance press **Download now** and watch *Recent downloads*
4. Wait for the download to end and read the checks
5. On the unrecognised symbol's row read the offered actions and press **Stop following**, confirm

#### Expected Result
- One sentence names how many followed stocks need attention and that strategies skip them until fixed; each card shows its tier, result and the time it is current to
- One row per affected stock names what was being downloaded, what failed, why and the consequence
- The download heads *Recent downloads* with its progress; the checks refresh when it ends; nothing stored is duplicated or removed
- The not-found row offers **Stop following** and **Follow a different symbol**, never a download; stopping is confirmed and the stock's history is kept

#### Error / Edge Cases
- The partial download is never shown as complete anywhere on the screen

### TC-E2E-004: Flow 2 error path: a download already running, gaps not determinable

**Scope:** e2e
**Component(s):** owner-shell, data-health-ui, ui-components, data-health-api, ingestion-api
**Traces to:** AC-11, AC-15, AC-24
**Priority:** P1
**Type:** functional
**Journey:** Decide whether the data can be trusted — error path

#### Preconditions
- A download already running; gap detection unable to run on this store

#### Steps
1. Open Data health and press **Download now**
2. Read the daily prices card

#### Expected Result
- The request is accepted with the message that it starts when the current one finishes
- The card shows the gap check as not determinable with its reason, not as passed or failed

#### Error / Edge Cases
- Nothing wrong: *Needs fixing* says so with the time of the last complete download (flow 2 step 6)

### TC-E2E-005: Flow 3 happy path: a partial download needs the owner, then is fixed

**Scope:** e2e
**Component(s):** owner-shell, home-ui, data-health-ui, ui-components, data-health-api, classification-api, ingestion-api
**Traces to:** AC-8, AC-9, AC-10, AC-16, AC-21, AC-25
**Priority:** P1
**Type:** functional
**Journey:** See what needs them today — happy path

#### Preconditions
- A partial download left three stocks without today's data; scores published

#### Steps
1. Open the product and read Home
2. Read the first *Needs you* item and the Data health destination
3. Press **Fix data**
4. Fix the data with a full download and return to Home

#### Expected Result
- Home shows the date and market state, the data tile with current of followed and the as-of times of scores and prices, and *Needs you* with the most important item first, each with exactly one action
- The item names the three stocks, says their scores show as Incomplete until fixed; the Data health destination carries the count 3
- Data health opens
- The item leaves the list because its cause is resolved; no strategy, paper or live region appears

#### Error / Edge Cases
- Nothing needs the owner: Home says so and when it last checked (flow 3 step 4)

### TC-E2E-006: Flow 3 error path: scores lag the latest download

**Scope:** e2e
**Component(s):** owner-shell, home-ui, ui-components, data-health-api, classification-api
**Traces to:** AC-8, AC-9, AC-24
**Priority:** P1
**Type:** functional
**Journey:** See what needs them today — error path

#### Preconditions
- A clean download ended after the current scores were produced

#### Steps
1. Open Home and read the data tile

#### Expected Result
- The tile says the scores are not reflecting the latest download rather than presenting the older scores as current

#### Error / Edge Cases
- Attention cannot be read: the header stays and the cards say what could not be read, with *Try again*

### TC-E2E-007: Flow 4 happy path: coverage, followed stocks, downloads and settings in the shell

**Scope:** e2e
**Component(s):** owner-shell, command-palette, data-health-ui, owner-web-app, ui-components, ingestion-api, classification-api
**Traces to:** AC-1, AC-17, AC-19, AC-20, AC-22, AC-26, AC-27
**Priority:** P1
**Type:** functional
**Journey:** Reach CAP-001's surfaces through the shell — happy path

#### Preconditions
- Stocks followed and downloads recorded; CAP-002's Research screens merged

#### Steps
1. Choose Data health in the rail and follow **Full coverage table**, **Manage followed stocks** and a download row
2. On each screen do what CAP-001 allowed: follow and stop following a stock, start and cancel a download, read coverage and gaps, open a failed download's detail, set the history depth, read whether the credential is present
3. Press the command palette shortcut, type part of a symbol, then a page name, and jump
4. Choose Research in the rail

#### Expected Result
- Each screen opens in the same shell, titled in the top bar, with every label in the product's words (stock, followed stock, download, stop following, Complete, Partial, Failed, Cancelled by you, Interrupted)
- Every action works with the same confirmations and refusals
- The palette opens from the keyboard and the top bar, finds the stock and the page, and offers no trading action
- CAP-002's routes open unchanged from the new rail; Strategies and Portfolio are absent, not disabled

#### Error / Edge Cases
- None beyond the scenario

### TC-E2E-008: Flow 4 error path: old bookmark and a preserved refusal

**Scope:** e2e
**Component(s):** owner-shell, owner-web-app, ingestion-api
**Traces to:** AC-17, AC-18
**Priority:** P1
**Type:** functional
**Journey:** Reach CAP-001's surfaces through the shell — error path

#### Preconditions
- A bookmark to `/runs/{id}?x=1`; history depth unset

#### Steps
1. Open the bookmark
2. On the Downloads screen press **Download now**

#### Expected Result
- The product shows the same download's detail at `/data/downloads/{id}?x=1`
- The start is refused naming the operation and the reason (history depth not set), with Settings linked, exactly as CAP-001 refused it

#### Error / Edge Cases
- Bookmarks to `/coverage`, `/instruments` and `/runs` arrive the same way

### TC-E2E-009: Flow 5: the product stops answering and comes back

**Scope:** e2e
**Component(s):** owner-shell, ingestion-api
**Traces to:** AC-23, AC-24
**Priority:** P1
**Type:** functional
**Journey:** The product stops answering — happy path

#### Preconditions
- The owner on the followed-stocks screen

#### Steps
1. Stop the application
2. Read the screen
3. Start the application again

#### Expected Result
- The main region is replaced by the unreachable state showing when the product last answered; the rail and top bar stay
- The followed-stocks screen returns at the same address without the owner reloading

#### Error / Edge Cases
- None beyond the scenario

### TC-E2E-010: Flow 5 error path: the product does not come back

**Scope:** e2e
**Component(s):** owner-shell, ingestion-api
**Traces to:** AC-23
**Priority:** P2
**Type:** functional
**Journey:** The product stops answering — error path

#### Preconditions
- The owner on Home

#### Steps
1. Stop the application and leave it stopped
2. Wait several health intervals
3. Use the rail and the palette

#### Expected Result
- The unreachable state persists with the same last-answered time; nothing reloads
- The rail and the palette's Pages still work; every other route shows the unreachable state in its main region

#### Error / Edge Cases
- None beyond the scenario
