---
artifact_schema_version: 1
artifact_id: CAP-003-integration-tests
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


# CAP-003 Integration Test Specification

Each case asserts at an external-protocol boundary named in a component design's API table (HTTP GET, POST, PUT or DELETE on `ingestion-api`, `data-health-api` or `classification-api`), with the consuming and providing components named. Contracts reachable only through `Python call`, `ES module import` or React context entries are tested at component scope.

### TC-INT-001: Shell navigation lands on Settings and the /data sub-pages; / redirects by URL

**Scope:** integration
**Component(s):** owner-shell, ingestion-api
**Traces to:** AC-1, AC-2, AC-25, DAC-E3-S8-2
**Priority:** P1
**Type:** functional
**Contract:** GET /api/health

#### Preconditions
- Real stack (`tests/e2e/support`) with the ingestion API answering `GET /api/health`
- At story E3-S8 only the delivered screens are registered

#### Steps
1. Open `/` and read the URL after the health answer
2. Choose Settings in the rail by keyboard
3. Open `/data/coverage`, `/data/followed`, `/data/downloads`

#### Expected Result
- `/` lands on `/setup` or `/home` by `most_recent_run`
- Each landing renders inside the shell with its top-bar title
- The spec exposes one helper the E5 and E6 closing stories extend

#### Error / Edge Cases
- Home and Data health landings are not asserted at this story

### TC-INT-002: Empty install: / lands on /setup

**Scope:** integration
**Component(s):** owner-shell, ingestion-api
**Traces to:** AC-2, AC-21, DAC-E4-S6-3
**Priority:** P1
**Type:** functional
**Contract:** GET /api/health (`most_recent_run` null)

#### Preconditions
- Empty store; application running

#### Steps
1. Open `/`
2. Wait for `GET /api/health` to answer with `most_recent_run` null

#### Expected Result
- URL is `/setup`; setup's `h1` is visible

#### Error / Edge Cases
- Health unreachable: unreachable state instead

### TC-INT-003: After a download has been requested, / lands on /home

**Scope:** integration
**Component(s):** owner-shell, home-ui, ingestion-api, data-health-api
**Traces to:** AC-2, AC-8, DAC-E5-S5-2
**Priority:** P1
**Type:** functional
**Contract:** GET /api/health, GET /api/attention

#### Preconditions
- A download requested through `POST /api/acquisition-runs`

#### Steps
1. Open `/`
2. Read Home's `h1` and data tile

#### Expected Result
- URL is `/home` with Home's `h1` visible; the tile or its first-download sentence reflects `latest_download`

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-004: Add later, Go to Home, return: drafts kept and / still opens setup

**Scope:** integration
**Component(s):** setup-ui, owner-shell, ingestion-api
**Traces to:** AC-2, AC-3, AC-21, DAC-E4-S5-2
**Priority:** P1
**Type:** functional
**Contract:** GET /api/health, GET /api/instruments

#### Preconditions
- Empty install; years text entered on step 2

#### Steps
1. Choose *Add later* and Continue
2. Activate **Go to Home**
3. Open `/setup` again
4. Open `/`

#### Expected Result
- Home shows its empty state
- Years text and radio choice are as left
- `/` lands on `/setup`

#### Error / Edge Cases
- After following a stock on `/data/followed`, step 4 is ready on return

### TC-INT-005: Pasted symbols are followed; dispositions rendered, accepted kept

**Scope:** integration
**Component(s):** setup-ui, ingestion-api
**Traces to:** AC-5, AC-17
**Priority:** P1
**Type:** functional
**Contract:** POST /api/instruments 201

#### Preconditions
- Application running; step 3 with `KO`, `TSLA`, `ZZZZ!` pasted

#### Steps
1. Press Continue
2. Read the request and the step's summary

#### Expected Result
- `POST /api/instruments` with the accepted symbols as a JSON array answers `201` with `added`, `reactivated`, `rejected`
- Accepted count shown; server-rejected entries named with their reason; accepted entries kept

#### Error / Edge Cases
- `duplicate_active` dispositions reported as already followed

### TC-INT-006: All symbols already followed: 409 treated as success

**Scope:** integration
**Component(s):** setup-ui, ingestion-api
**Traces to:** AC-5, AC-17
**Priority:** P2
**Type:** functional
**Contract:** POST /api/instruments 409

#### Preconditions
- `KO` already followed; step 3 pasted with `KO` after going back

#### Steps
1. Press Continue

#### Expected Result
- The endpoint answers `409`; setup treats it as success and step 4 becomes current

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-007: Every entry malformed: 422 names each entry; nothing discarded

**Scope:** integration
**Component(s):** setup-ui, ingestion-api
**Traces to:** AC-5, AC-17
**Priority:** P2
**Type:** functional
**Contract:** POST /api/instruments 422

#### Preconditions
- Step 3 pasted with entries the client accepts but the server refuses

#### Steps
1. Press Continue

#### Expected Result
- `422` answered; each entry named with its reason in the textarea's live region; nothing discarded; the step stays current

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-008: First run by keyboard: download accepted and progress advances

**Scope:** integration
**Component(s):** setup-ui, owner-shell, ingestion-api, data-health-api
**Traces to:** AC-2, AC-7, AC-25, DAC-E4-S5-1
**Priority:** P1
**Type:** functional
**Contract:** POST /api/acquisition-runs 202; GET /api/attention

#### Preconditions
- Real stack with the Massive stub; empty install

#### Steps
1. Complete steps 1 to 4 by keyboard alone
2. Activate **Start download**
3. Watch the progress region over two attention ticks

#### Expected Result
- `POST /api/acquisition-runs` answers `202`
- Progress shows *{done} of {total} stocks* with *checked {time}* advancing
- `/` now opens Home with the first-download item

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-009: Setup step 4 progress comes from the attention read at 10 s

**Scope:** integration
**Component(s):** setup-ui, owner-shell, data-health-api
**Traces to:** AC-7, AC-25
**Priority:** P2
**Type:** functional
**Contract:** GET /api/attention (`latest_download.progress`)

#### Preconditions
- A running download started from setup

#### Steps
1. Observe `GET /api/attention` requests and the progress region for 30 s

#### Expected Result
- Requests every 10 s while non-terminal; `progress.done` and `total` drive the bar; `total` null renders indeterminate

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-010: Summary served: Home tile and Factor scores card show stocks_current figures

**Scope:** integration
**Component(s):** owner-shell, home-ui, data-health-ui, classification-api
**Traces to:** AC-8, AC-11
**Priority:** P1
**Type:** functional
**Contract:** GET /api/classifications/summary 200

#### Preconditions
- Scores published by `classification-api` with `stocks_current` 27 of 30

#### Steps
1. Open `/home` and read the hero line and scores as-of
2. Open `/data` and read the Factor scores card

#### Expected Result
- *27 of 30 stocks current* with the summary's `set.ended_at`
- Card *Current* with *27 of 30 stocks current* and *3 stocks show as Incomplete until their data is complete*

#### Error / Edge Cases
- `set.not_current`: lag badge on the tile and *Not reflecting the latest download* on the card

### TC-INT-011: Summary not deployed: score figures render not determinable

**Scope:** integration
**Component(s):** owner-shell, home-ui, data-health-ui, classification-api
**Traces to:** AC-8, AC-11, AC-24
**Priority:** P1
**Type:** functional
**Contract:** GET /api/classifications/summary 404

#### Preconditions
- Score routes absent (`404 not_found`)

#### Steps
1. Open `/home` and `/data`

#### Expected Result
- Current count and scores as-of are em dashes with hidden *not determinable*; Factor scores card `coverage-unknown` *Not determinable* with *FactorFlow can't read scores yet.*; nothing renders as an error

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-012: Summary error other than 404 renders the score regions' error state

**Scope:** integration
**Component(s):** owner-shell, home-ui, classification-api
**Traces to:** AC-8, AC-24
**Priority:** P2
**Type:** functional
**Contract:** GET /api/classifications/summary 500

#### Preconditions
- Summary route answering `500`

#### Steps
1. Open `/home`

#### Expected Result
- The tile renders *Couldn't read the data summary: {reason}.* with **Try again**; server items still render

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-013: A clean later download removes the data item and the chip without a reload

**Scope:** integration
**Component(s):** home-ui, owner-shell, data-health-api, ingestion-api
**Traces to:** AC-9, AC-16, DAC-E5-S4-2
**Priority:** P1
**Type:** functional
**Contract:** GET /api/attention after POST /api/acquisition-runs

#### Preconditions
- A partial download left three stocks failed; Home open

#### Steps
1. Start a clean download that succeeds for those symbols
2. Wait for the next attention read

#### Expected Result
- The data item and the Data health chip leave without a reload

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-014: Partial download: verdict, Needs fixing rows and Download now

**Scope:** integration
**Component(s):** data-health-ui, owner-shell, data-health-api, ingestion-api
**Traces to:** AC-11, AC-13, AC-15, DAC-E6-S6-1
**Priority:** P1
**Type:** functional
**Contract:** GET /api/data-health, GET /api/attention

#### Preconditions
- Real stack with the Massive stub failing three symbols; a download ended `partial`

#### Steps
1. Open `/data`
2. Read the verdict, the *Needs fixing* header and its rows

#### Expected Result
- *Mostly yes. 3 of {m} followed stocks need attention…*
- *Needs fixing · 3* lists the three; **Download now** in the header because a row is retryable

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-015: Database error on the aggregate: per-card error with Try again, no request id

**Scope:** integration
**Component(s):** data-health-ui, data-health-api
**Traces to:** AC-11, AC-24
**Priority:** P2
**Type:** functional
**Contract:** GET /api/data-health 500 envelope

#### Preconditions
- `GET /api/data-health` answering the `500 internal_error` envelope

#### Steps
1. Open `/data`
2. Search the DOM for the request id

#### Expected Result
- Each card keeps its header; body *Couldn't read the data health checks: {reason}.* with **Try again**; no `request_id` shown

#### Error / Edge Cases
- **Try again** re-reads once

### TC-INT-016: Problems pages concatenate to the full problem set

**Scope:** integration
**Component(s):** data-health-api, data-health-reader (via HTTP)
**Traces to:** AC-13, DAC-E2-S6-1, DAC-E2-3
**Priority:** P1
**Type:** functional
**Contract:** GET /api/data-health/problems

#### Preconditions
- Seeded PostgreSQL with failures on three stocks; `create_app` under `TestClient`

#### Steps
1. GET `/api/data-health/problems?limit=2` and follow `next_cursor`

#### Expected Result
- Concatenated rows equal the reader's full problem set; the last page carries no cursor

#### Error / Edge Cases
- `GET /api/data-health` body matches the reader; `affected_count` equals the row count

### TC-INT-017: A reader failure answers the delivered 500 envelope with X-Request-Id

**Scope:** integration
**Component(s):** data-health-api, ingestion-api
**Traces to:** AC-11, AC-13, AC-21, DAC-E2-S6-2, DAC-E2-9
**Priority:** P1
**Type:** security
**Contract:** GET /api/attention, /api/data-health, /api/data-health/problems → 500 internal_error envelope

#### Preconditions
- Reader raising `psycopg.Error` behind `create_app`

#### Steps
1. GET each of the three routes

#### Expected Result
- Body is the delivered envelope's fixed message with no internal detail; `X-Request-Id` header present

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-018: A 422 on Show more reads Couldn't read more problems with Try again

**Scope:** integration
**Component(s):** data-health-ui, data-health-api
**Traces to:** AC-13, AC-14
**Priority:** P2
**Type:** functional
**Contract:** GET /api/data-health/problems 422

#### Preconditions
- `/data` with a second page; the problems route answering `422`

#### Steps
1. Activate **Show more**
2. Activate **Try again**

#### Expected Result
- *Couldn't read more problems: {reason}.* with **Try again**
- Try again restarts from the first page

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-019: Stop following an unrecognised symbol by keyboard

**Scope:** integration
**Component(s):** data-health-ui, owner-shell, ingestion-api, data-health-api, owner-web-app
**Traces to:** AC-14, AC-17, DAC-E6-S6-2
**Priority:** P1
**Type:** functional
**Contract:** DELETE /api/instruments/{symbol} 200

#### Preconditions
- Real stack with the stub not recognising one symbol; its *Not found* row on `/data`

#### Steps
1. Confirm **Stop following** by keyboard
2. Read the row, the chip and Coverage

#### Expected Result
- `DELETE /api/instruments/{symbol}` sent; the row leaves; the Data health chip decrements
- Coverage still lists the symbol as stopped following with its history

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-020: A refused stop following keeps the dialog open with the reason

**Scope:** integration
**Component(s):** data-health-ui, ingestion-api
**Traces to:** AC-14, AC-17
**Priority:** P2
**Type:** functional
**Contract:** DELETE /api/instruments/{symbol} 404 / 409

#### Preconditions
- A *Not found* row whose symbol was already stopped (`409`) or is unknown (`404`)

#### Steps
1. Confirm **Stop following**

#### Expected Result
- Dialog stays open with *Couldn't stop following {SYMBOL}: {reason}.*; the row refreshes on close

#### Error / Edge Cases
- Both codes follow the same path (the spec treats them alike)

### TC-INT-021: Download now starts a full download that heads Recent downloads

**Scope:** integration
**Component(s):** data-health-ui, owner-shell, ingestion-api, data-health-api
**Traces to:** AC-12, AC-15, AC-25
**Priority:** P1
**Type:** functional
**Contract:** POST /api/acquisition-runs 202 (`queued_behind` null)

#### Preconditions
- `/data` with a retryable row; no download running

#### Steps
1. Activate **Download now**
2. Watch Recent downloads over the next attention ticks
3. Wait for the download to end

#### Expected Result
- `202`; the download heads Recent downloads with `determinate` *{done} of {total} stocks* at the 10 s tick and *checked {time}*
- Nothing stored is duplicated, overwritten or removed; the checks refresh once when it ends

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-022: Download now while a download runs: accepted and queued

**Scope:** integration
**Component(s):** data-health-ui, ingestion-api
**Traces to:** AC-15
**Priority:** P1
**Type:** functional
**Contract:** POST /api/acquisition-runs 202 (`queued_behind` set)

#### Preconditions
- A download running

#### Steps
1. Activate **Download now**

#### Expected Result
- `202` with `queued_behind` set; *A download is running. This starts when it finishes.*

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-023: Download now refused: history depth not set

**Scope:** integration
**Component(s):** data-health-ui, ingestion-api
**Traces to:** AC-15, AC-17
**Priority:** P2
**Type:** functional
**Contract:** POST /api/acquisition-runs 409 history_depth_not_set

#### Preconditions
- History depth unset; a retryable row

#### Steps
1. Activate **Download now**

#### Expected Result
- *Couldn't start the download: history depth isn't set.* with **Set history depth** to `/settings`

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-024: Start the first download refused: no stocks followed

**Scope:** integration
**Component(s):** data-health-ui, ingestion-api
**Traces to:** AC-15, AC-17
**Priority:** P2
**Type:** functional
**Contract:** POST /api/acquisition-runs 409 no_active_instruments

#### Preconditions
- No followed stocks; `latest_terminal_download` set

#### Steps
1. Activate the download control

#### Expected Result
- *Couldn't start the download: no stocks are followed.* with **Follow stocks** to `/data/followed`

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-025: Partial download: Home item names the symbols and the chips carry the counts

**Scope:** integration
**Component(s):** home-ui, owner-shell, data-health-api
**Traces to:** AC-9, AC-16, DAC-E5-S4-1
**Priority:** P1
**Type:** functional
**Contract:** GET /api/attention

#### Preconditions
- Real stack with the stub failing three symbols; a download ended `partial`

#### Steps
1. Open `/home`
2. Read the data item and the two rail chips

#### Expected Result
- The item names the three symbols; the Data health chip reads *3* named *Data health, 3 stocks with problems*; the Home chip equals the number of rendered items

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-026: At 3000 instruments the counts agree across both reads

**Scope:** integration
**Component(s):** data-health-api, data-health-reader (via HTTP)
**Traces to:** AC-11, AC-16, DAC-E2-S7-1
**Priority:** P1
**Type:** performance
**Contract:** GET /api/attention, GET /api/data-health

#### Preconditions
- Seeded store: 3000 active instruments with failures on 300

#### Steps
1. GET `/api/attention`
2. GET `/api/data-health` with `read_coverage` call counting

#### Expected Result
- `problems.stock_count` 300 and `followed_count` 3000
- `affected_count` 300 with six `read_coverage` pages consumed

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-027: Attention failure leaves the chips stale, never removes the rail

**Scope:** integration
**Component(s):** owner-shell, data-health-api
**Traces to:** AC-16, AC-24, AC-25
**Priority:** P2
**Type:** functional
**Contract:** GET /api/attention 500 envelope

#### Preconditions
- Chips showing counts; the attention route then answering `500`

#### Steps
1. Wait for the next poll
2. Read the chips and their names

#### Expected Result
- Chips keep their last values; names gain *, as of {time}*; the rail remains

#### Error / Edge Cases
- Recovery: chips update on the next successful read

### TC-INT-028: The three routes sit behind the delivered Host and Origin middleware

**Scope:** integration
**Component(s):** ingestion-api, data-health-api
**Traces to:** AC-16, AC-17, DAC-E2-10
**Priority:** P1
**Type:** security
**Contract:** Host and Origin middleware; /api not_found envelope

#### Preconditions
- `create_app` under `TestClient`

#### Steps
1. GET each route with a foreign `Host`
2. GET each with a foreign `Origin`
3. GET an unknown `/api` path

#### Expected Result
- `400 host_not_allowed` on all three
- A foreign `Origin` on a `GET` is not refused
- `not_found` envelope; every refusal carries a request id

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-029: Step 2 done flag follows the saved history depth

**Scope:** integration
**Component(s):** setup-ui, ingestion-api
**Traces to:** AC-3, AC-17
**Priority:** P2
**Type:** functional
**Contract:** GET /api/settings/history-depth

#### Preconditions
- Application running with depth unset, then set to 5

#### Steps
1. Open `/setup` in each state

#### Expected Result
- Unset: step 2 current; set: step 2 done *5 years of history* and a link

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-030: Saving the depth from step 2 persists it

**Scope:** integration
**Component(s):** setup-ui, ingestion-api
**Traces to:** AC-3, AC-17
**Priority:** P1
**Type:** functional
**Contract:** PUT /api/settings/history-depth 200

#### Preconditions
- Step 2 current

#### Steps
1. Enter 5 and Continue
2. GET `/api/settings/history-depth`

#### Expected Result
- `200`; the read returns `years` 5; step 3 current with its `h2` focused

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-031: An out-of-range depth is refused and the value kept

**Scope:** integration
**Component(s):** setup-ui, ingestion-api
**Traces to:** AC-3, AC-17
**Priority:** P2
**Type:** functional
**Contract:** PUT /api/settings/history-depth 422

#### Preconditions
- Step 2 current

#### Steps
1. Enter 60 and Continue

#### Expected Result
- `422`; field error *History depth must be a whole number of years from 1 to 50.* with the value kept

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-032: Step 3 done flag and blocked step 4 follow active_count

**Scope:** integration
**Component(s):** setup-ui, ingestion-api
**Traces to:** AC-17, AC-21
**Priority:** P2
**Type:** functional
**Contract:** GET /api/instruments?lifecycle=active&limit=1

#### Preconditions
- Application running with no followed stock, then with 12

#### Steps
1. Open `/setup` with *Add later* chosen in each state

#### Expected Result
- 0: step 3 to do and step 4 **Start download** `blocked`
- 12: step 3 done and step 4 ready

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-033: Setup start refused: depth not set names step 2

**Scope:** integration
**Component(s):** setup-ui, ingestion-api
**Traces to:** AC-7, AC-17
**Priority:** P2
**Type:** functional
**Contract:** POST /api/acquisition-runs 409 history_depth_not_set

#### Preconditions
- Stocks followed, depth unset, step 4 reached

#### Steps
1. Activate **Start download**

#### Expected Result
- *Couldn't start the download: history depth isn't set.* with **Go to step 2**

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-034: Setup start refused by the server: no stocks names step 3

**Scope:** integration
**Component(s):** setup-ui, ingestion-api
**Traces to:** AC-7, AC-17
**Priority:** P2
**Type:** functional
**Contract:** POST /api/acquisition-runs 409 no_active_instruments

#### Preconditions
- Depth set; the followed list emptied elsewhere after step 4 rendered ready

#### Steps
1. Activate **Start download**

#### Expected Result
- *Couldn't start the download: no stocks are followed.* with **Go to step 3**

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-035: Setup start while a download runs shows the queued line

**Scope:** integration
**Component(s):** setup-ui, ingestion-api
**Traces to:** AC-7, AC-15, AC-17
**Priority:** P2
**Type:** functional
**Contract:** POST /api/acquisition-runs 202 (`queued_behind` set)

#### Preconditions
- A download running; step 4 reached

#### Steps
1. Activate **Start download**

#### Expected Result
- `202` with `queued_behind`; *A download is running. This starts when it finishes.*

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-036: Recent downloads lists the five newest with a running one on top

**Scope:** integration
**Component(s):** data-health-ui, ingestion-api
**Traces to:** AC-12, AC-17, AC-25
**Priority:** P1
**Type:** functional
**Contract:** GET /api/acquisition-runs?limit=5

#### Preconditions
- Seven downloads recorded, the newest running

#### Steps
1. Open `/data`
2. Read Recent downloads

#### Expected Result
- Five rows newest first; the running one heads the list with its progress; each outcome as its tier

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-037: Nothing needs fixing shows the last complete download

**Scope:** integration
**Component(s):** data-health-ui, ingestion-api
**Traces to:** AC-13, AC-17
**Priority:** P2
**Type:** functional
**Contract:** GET /api/acquisition-runs?state=succeeded&limit=1

#### Preconditions
- No problem stock; one succeeded download

#### Steps
1. Open `/data` and read *Needs fixing*

#### Expected Result
- *Nothing needs fixing.* with *Last complete download {start time}*

#### Error / Edge Cases
- No succeeded download: *No complete download yet*

### TC-INT-038: What you follow reads counts, depth and key presence from the API

**Scope:** integration
**Component(s):** data-health-ui, ingestion-api
**Traces to:** AC-4, AC-17
**Priority:** P2
**Type:** functional
**Contract:** GET /api/instruments?limit=1; GET /api/settings/history-depth; GET /api/health

#### Preconditions
- 30 active and 2 retired stocks; depth 5; key present

#### Steps
1. Open `/data` and read *What you follow*

#### Expected Result
- *Followed stocks 30*, *Stopped following 2 (history kept)*, *History depth 5 years*, *Market data key* *Found*; no key value anywhere

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-039: Coverage opened from a Needs fixing row requests the seeded symbol

**Scope:** integration
**Component(s):** owner-web-app, ingestion-api
**Traces to:** AC-14, AC-17
**Priority:** P2
**Type:** functional
**Contract:** GET /api/coverage?symbol=

#### Preconditions
- `/data` with a row for `KO`

#### Steps
1. Follow the row's symbol link
2. Read the first `GET /api/coverage` request

#### Expected Result
- `/data/coverage?symbol=KO`; the request carries `symbol=KO`; the table shows that stock

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-040: The eleven delivered journeys pass at the new paths

**Scope:** integration
**Component(s):** owner-web-app, owner-shell, ingestion-api
**Traces to:** AC-17, AC-18, AC-19
**Priority:** P1
**Type:** functional
**Contract:** Delivered CAP-001 endpoints (instruments, settings, acquisition-runs, cancel, coverage)

#### Preconditions
- Real stack; the eleven delivered e2e specs relabelled and re-pathed (DAC-E7-12)

#### Steps
1. Run the eleven specs

#### Expected Result
- First run, diagnose, cancel, coverage, followed-stock changes and the unrecognised-symbol flow behave as CAP-001 accepted, with the same confirmations and refusals, at `/data/*` and `/settings`

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-041: Palette finds a followed stock from the server and opens its coverage

**Scope:** integration
**Component(s):** command-palette, owner-shell, ingestion-api
**Traces to:** AC-22, DAC-E3-S8-3
**Priority:** P1
**Type:** functional
**Contract:** GET /api/instruments?symbol=&lifecycle=active&limit=8

#### Preconditions
- One followed stock `KO`; research routes unregistered in this clone

#### Steps
1. Press Ctrl+K and type *K*
2. Press Enter on the Stocks result

#### Expected Result
- Stocks group lists `KO` from the server
- Lands on `/data/coverage?symbol=KO`

#### Error / Edge Cases
- Research registered: `/research/stocks/KO`

### TC-INT-042: A failed stock search names the operation and leaves Pages usable

**Scope:** integration
**Component(s):** command-palette, ingestion-api
**Traces to:** AC-22, AC-24
**Priority:** P2
**Type:** functional
**Contract:** GET /api/instruments error

#### Preconditions
- The instruments route answering `500`

#### Steps
1. Open the palette and type *K*

#### Expected Result
- *Couldn't search followed stocks: {reason}.* in the Stocks group; Pages still navigates

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-043: More than eight matches shows the first-8 hint

**Scope:** integration
**Component(s):** command-palette, ingestion-api
**Traces to:** AC-22
**Priority:** P3
**Type:** functional
**Contract:** GET /api/instruments (`next_cursor` set)

#### Preconditions
- Twelve followed stocks starting with *A*

#### Steps
1. Open the palette and type *A*

#### Expected Result
- Eight stocks listed and *Showing the first 8. Keep typing to narrow.*

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-044: Universes group lists active universes while research routes are registered

**Scope:** integration
**Component(s):** command-palette, classification-api
**Traces to:** AC-22, AC-27
**Priority:** P2
**Type:** functional
**Contract:** GET /api/universes?lifecycle=active

#### Preconditions
- CAP-002 merged (`RESEARCH_REGISTERED` true); two active universes

#### Steps
1. Open the palette
2. Type part of a universe name and choose it

#### Expected Result
- One universes request per open; the group filtered locally; choosing it opens the CAP-002 universe route unchanged

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-045: A failed universes read leaves Stocks and Pages usable

**Scope:** integration
**Component(s):** command-palette, classification-api
**Traces to:** AC-22, AC-24
**Priority:** P3
**Type:** functional
**Contract:** GET /api/universes error

#### Preconditions
- The universes route answering `500`

#### Steps
1. Open the palette and type

#### Expected Result
- *Couldn't read universes: {reason}.*; Stocks and Pages still usable

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-046: Stopping and restarting the application: unreachable state then recovery without reload

**Scope:** integration
**Component(s):** owner-shell, ingestion-api
**Traces to:** AC-23, DAC-E3-S8-1
**Priority:** P1
**Type:** functional
**Contract:** GET /api/health failure and recovery

#### Preconditions
- Real stack; the owner on `/data/followed`

#### Steps
1. Stop the application container through `tests/e2e/support`
2. Read the main region
3. Restart the container

#### Expected Result
- Rail and top bar remain; *Last answered* carries the last success
- The same URL and JavaScript context return (no `load` event)

#### Error / Edge Cases
- None beyond the scenario

### TC-INT-047: p95 of GET /api/data-health at 3000 stocks is at most 2 s

**Scope:** integration
**Component(s):** data-health-api, data-health-reader (via HTTP)
**Traces to:** AC-28, DAC-E2-S7-2, DAC-E2-14
**Priority:** P1
**Type:** performance
**Contract:** GET /api/data-health latency

#### Preconditions
- Seeded store of 3000 active instruments with failures on 300; in-process application

#### Steps
1. Send one warm-up request
2. Send 20 timed requests and compute the p95

#### Expected Result
- p95 at most 2 s, computed over the 20 timed requests only; a failure names the measured p95 in the assertion message

#### Error / Edge Cases
- Memory stays bounded during the loop
