---
artifact_schema_version: 1
artifact_id: CAP-003-component-design-setup-ui
artifact_type: component-design
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-25
updated: 2026-10-25
ai_provenance:
  agent_id: design-decomposition-agent
  agent_version: "1.1"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-25T19:45:46Z
  source_artifacts:
    - id: CAP-003
      version: "1"
    - id: CAP-003-system-design
      version: "1"
    - id: CAP-003-ux-brief
      version: "1"
    - id: CAP-003-ux-design
      version: "1"
    - id: PRODUCT-UX-S02
      version: "4"
    - id: STD-UI
      version: "6"
    - id: tech-stack
      version: "6"
  invoking_user: ajodraca
  correlation_id: 8e98ad1c-3c34-4529-991c-a0af1920daf5
---

# Component: Setup UI

**Status:** draft
**Capability:** CAP-003
**Owner:** Alvaro de Jodra
**Last Updated:** 2026-10-25

This design was produced in an unattended `$design-run`. It applies DEC-0202,
DEC-0203 and DEC-0205 without re-deciding them, and records DEC-0218 (what
step 3 reports as a duplicate and when it suggests a fix), under
`projects/factorflow-v2/decisions/` in the harness repository. Positions
resting on a decision are marked **PROVISIONAL**.

## 1. Overview

`setup-ui` is the first-run setup screen at `/setup`: S02 steps 1 to 4 for M1
(the paper trading step is M2), as one visible multi-step operation the owner
can leave and return to (capability flow 1; AC-3; STD-UI-26). It shows
whether the market data key was found (never its value), saves the history
depth, follows a pasted list of stocks, and starts the first download, each
through the delivered `ingestion-api` endpoint, so the confirmations and
refusals are CAP-001's (system design §3.2; AC-17).

Setup is complete exactly when a download has been requested (DEC-0202,
PROVISIONAL). Every step's committed state is the server's own, so leaving
and returning re-derives every step; drafts not yet committed, and values of
later steps when the owner goes back, live in this component's memory for the
visit and nowhere else (system design §4.4).

Use cases addressed: AC-2 (with the shell's redirect), AC-3, AC-4, AC-5,
AC-6, AC-7, AC-21 (*Add later*), AC-24, AC-25.

Support matrix: as the shell. Dependencies: `owner-shell`'s `useShell()`
(`health.credential_present`, `attention.latest_download`); the delivered
client functions `getHistoryDepth`, `setHistoryDepth`, `listInstruments`,
`addInstruments`, `startAcquisitionRun`; the delivered
`web/src/screens/instruments/parse-bulk-symbols.ts`, imported unchanged;
`factorflow`'s `MAX_SYMBOLS_PER_REQUEST` of 1000 mirrored as a constant;
`ui-components`.

## 2. Design Details

### 2.1 Placement

```
web/src/screens/setup/index.tsx              SetupScreen: loads, re-derives steps, holds the drafts
web/src/screens/setup/use-setup-state.ts     step derivation and the in-memory drafts (DEC-0202)
web/src/screens/setup/step-list.tsx          stepper vertical as nav "Setup steps"
web/src/screens/setup/step-card.tsx          the step card composition (UX design §3)
web/src/screens/setup/step-market-data.tsx   step 1
web/src/screens/setup/step-history-depth.tsx step 2
web/src/screens/setup/step-stocks.tsx        step 3
web/src/screens/setup/summarise-paste.ts     duplicates and near-miss fixes over parseBulkSymbols (DEC-0218)
web/src/screens/setup/post-in-batches.ts     POST /api/instruments in batches of at most 1000
web/src/screens/setup/step-download.tsx      step 4
web/src/screens/setup/copy.ts                every owner-facing string
web/src/screens/setup/*.test.ts(x)
tests/e2e/setup-first-run.spec.ts
```

All new. No delivered file is edited; the parser is imported, not changed
(DEC-0218).

### 2.2 Step state

The flowchart shows how the screen decides each step's state when it loads
and how the drafts survive moving between steps. The actors are the shell
context, the two delivered reads this screen makes and the in-memory draft
store. The decision points are each step's done condition, taken from the
server, and which step is current. The outcome is a stepper showing every step
as done, current or to do, opened on the first step not done, with every draft
kept while the owner moves back and forth (AC-3; S02-1, S02-2).

```mermaid
flowchart TD
    L["[1] mount /setup"] --> R1["[2] useShell: health.credential_present, attention.latest_download"]
    L --> R2["[3] GET /api/settings/history-depth"]
    L --> R3["[4] GET /api/instruments?lifecycle=active&limit=1"]
    R1 --> D1{"[5] step 1 done: health has answered"}
    R2 --> D2{"[6] step 2 done: years set"}
    R3 --> D3{"[7] step 3 done: active_count > 0"}
    R1 --> D4{"[8] step 4 done: latest_download non-null"}
    D1 --> C["[9] current = first step not done"]
    D2 --> C
    D3 --> C
    D4 --> C
    C --> S["[10] stepper: done / current / to do; done steps are links"]
    S --> DR["[11] drafts: years text, source choice, pasted text, parse summary; kept above the step views for the visit"]
    DR --> B["[12] Back or a done-step link: current changes, drafts untouched"]
```

```typescript
// web/src/screens/setup/use-setup-state.ts
type StepId = 1 | 2 | 3 | 4;
interface SetupDrafts {
  yearsText: string;                       // step 2 input as typed
  source: "paste" | "later" | null;        // step 3 radio
  pasted: string;                          // step 3 textarea
  unposted: string[];                      // entries left after a failed batch
}
interface SetupState {
  current: StepId;
  done: Record<StepId, boolean>;           // re-derived from the server on every load
  drafts: SetupDrafts;                     // never written to storage (system design §4.4)
  goTo(step: StepId): void;
  setDraft<K extends keyof SetupDrafts>(key: K, value: SetupDrafts[K]): void;
}
```

### 2.3 Committing each step

The sequence follows system design §3.2. Its actors are the owner, this
screen, the shell and the delivered API. The decision points are the depth's
validity, the parse result, each batch's response, and the download's
acceptance, queueing or refusal. The outcome is a requested download with its
progress on screen, after which `/` opens Home (AC-2, AC-7; S02-6).

```mermaid
sequenceDiagram
    autonumber
    participant O as Owner
    participant SU as setup-ui
    participant SH as owner-shell
    participant API as ingestion-api

    O->>SU: step 2, years, Continue
    SU->>API: PUT /api/settings/history-depth {years}
    alt 422
        SU-->>O: field error, value kept
    else 200
        SU-->>O: step 2 done "{y} years of history"; step 3 current
    end
    O->>SU: step 3, Paste a list, paste
    SU->>SU: parseBulkSymbols + summarisePaste on paste and blur (DEC-0218)
    O->>SU: Continue
    loop batches of at most 1000 accepted symbols
        SU->>API: POST /api/instruments {symbols}
        alt 201, or 409 every symbol already followed
            SU-->>O: added, reactivated, rejected with reasons
        else 422 every entry malformed
            SU-->>O: each entry named with its reason; nothing discarded
        else network or 500
            SU-->>O: posted batches counted; the rest named and kept in the textarea for a retry
        end
    end
    O->>SU: step 4, Start download
    SU->>API: POST /api/acquisition-runs
    alt 202 queued_behind null
        SU->>SH: refresh("attention")
        SH-->>SU: latest_download with progress, every 10 s
        SU-->>O: progress {done} of {total} stocks, "You can leave; this keeps running."
    else 202 queued_behind set
        SU-->>O: "A download is running. This starts when it finishes."
    else 409 history_depth_not_set / no_active_instruments
        SU-->>O: refusal with Go to step 2 / Go to step 3
    end
```

**Step 3 summary (DEC-0218, PROVISIONAL).** `summarisePaste(parsed)` returns
`accepted` (valid, first occurrence), `duplicates` (a normalised form already
seen earlier in the same paste, named once, never posted twice) and
`unreadable` (shape-invalid entries, each with a `fix` when replacing each run
of slash, space or underscore between letters by one dot yields a valid
symbol). A fix is a `button` `outline` *Did you mean {fix}?* that replaces the
entry in the textarea and re-parses. Already-followed entries are reported
after Continue from the response's `duplicate_active` dispositions, as
*already followed*.

**Batches.** Accepted symbols are posted in order in batches of at most 1000
(`MAX_SYMBOLS_PER_REQUEST`). A `409` on a batch means every symbol in it was
already followed and is treated as success, which is also what a repeated
Continue after going back produces (system design §3.2 note 3). If a batch
fails at the transport or with a `500`, the entries of that and later batches
stay in the textarea and are named, the posted ones are counted as followed,
and the step stays current.

**Step 4.** **Start download** is routine and not blocked by a missing key:
CAP-001 refuses a start only for an unset depth or an empty followed list,
and AC-17 preserves that; a download without a key fails and surfaces on Home
(DEC-0203). After `202` the screen calls `refresh("attention")` so the
progress appears at once, then follows the shell's 10 second cadence.

**Add later.** Choosing *Add later* and **Continue** navigates to `/home`,
whose honest empty state offers **Start setup**; nothing is stored, so `/`
opens setup again until a download is requested (DEC-0202; capability flow 1
step 7).

### 2.4 Messages

N/A, not applicable for this component.

## 3. Constraints and Assumptions

- **Delivered endpoints, unchanged** (constraint 2): every save and the start
  go through `ingestion-api` with CAP-001's refusals.
- **No storage** (system design §4.4): drafts live in React state for the
  visit; a reload re-derives committed steps and loses uncommitted drafts,
  which S02 §7 accepts (*setup reads current configuration on load*).
- **The key's value never appears** (AC-4): the screen receives
  `credential_present` only.
- **Four steps in M1**: the paper trading step is absent, not disabled (S02
  §2; capability §2 Out of Scope).
- **Two sources in step 3**: *Paste a list* and *Add later*; *Upload a CSV*
  is not built (capability OQ-3; UX design 0.8).
- **The plan-limit note states 5 years** for the provider plan (S02 §3;
  CAP-001 §6); it is copy, not a validation.
- **Assumption:** `instruments_named` becomes non-zero when a runner claims
  the download; until then progress is indeterminate (DEC-0213 f).

## 4. Security

- No secret is handled; presence is a boolean (AC-4; S02-4).
- Pasted text is parsed locally and posted as a JSON array the delivered route
  validates per symbol (SEC-INP-001).
- Nothing is written to browser storage.
- Server reasons render as text.

## 5. Scalability and Performance

- A 3000-symbol paste is parsed once on paste and once on blur, never per
  keystroke, and posted in three requests.
- Progress follows the shell's attention read; this screen opens no interval.

## 6. Upgrade

- New screen. Settings gains **Open setup** (`owner-web-app`) so setup can be
  reopened, with every step shown as done.
- M2 adds step 5 and moves completion to its own rule; nothing is reserved
  for it now.

## 7. Testing

| Test | File | What it proves |
|------|------|----------------|
| Steps re-derived | `web/src/screens/setup/use-setup-state.test.ts` | Each done flag follows its server fact; current is the first not done (S02-1) |
| Back keeps drafts | `web/src/screens/setup/setup.test.tsx` | Going back from step 4 to 2 and forward again keeps the years text, the radio choice and the pasted text (AC-3; S02-2) |
| Key presence | `web/src/screens/setup/step-market-data.test.tsx` | *Found* or *Missing* with the variable name and restart line; *Not determinable* while health is unreachable; no value anywhere (AC-4; S02-4) |
| Depth | `web/src/screens/setup/step-history-depth.test.tsx` | `422` renders the field error with the value kept |
| Paste summary | `web/src/screens/setup/summarise-paste.test.ts` | Duplicates within the paste named once; `BRK/B`, `BRK B` and `BRK_B` suggest `BRK.B`; `ZZZZ!` suggests nothing; accepted kept whatever else is rejected (AC-5; DEC-0218) |
| Ranking warning | `web/src/screens/setup/step-stocks.test.tsx` | Below 30 accepted the warning shows and **Continue** stays available; at zero it is `blocked` with its reason (AC-6; S02-5) |
| Batches | `web/src/screens/setup/post-in-batches.test.ts` | 2500 symbols post as 1000, 1000, 500; a `409` batch counts as success; a failed batch keeps its and later entries |
| Start | `web/src/screens/setup/step-download.test.tsx` | `202` shows progress from attention with *checked {time}* that advances on each attention answer (AC-25); `queued_behind` shows the queued line; each `409` names its step to fix |
| First run | `tests/e2e/setup-first-run.spec.ts` | Empty install opens setup; all four steps by keyboard; after **Start download** `/` opens Home with the first-download item (AC-2, AC-7, AC-25) |
| Add later | `tests/e2e/setup-first-run.spec.ts` | *Add later* lands on Home's empty state; `/` still opens setup (AC-21; DEC-0202) |

## 8. Acceptance Criteria

1. The stepper shows four steps, the owner's position and what remains; going
   back keeps every later value.
2. Step 1 states *Found* or *Missing* and, when missing, names
   `FACTORFLOW_MASSIVE_API_KEY` and the restart; never the value.
3. A pasted list keeps every accepted entry and names each duplicate and each
   unreadable entry; below 30 accepted it warns and still continues.
4. **Start download** requests a download through the delivered endpoint and
   the progress shows until the owner leaves.
5. Failure scenario: a refused start names the operation, the reason and the
   step that fixes it; a failed save keeps the entered value.

## 9. Workflows

Capability flow 1, all steps, including both alternates (going back; *Add
later*). Intersects Settings, which reopens setup, and Home, which shows the
download's progress afterwards.

## 10. UX / GUI

From UX design §1.2.

**Layout.** Two columns inside the 1180 px main region, `--space-6` apart.
Left, 260 to 300 px: `h1` *Get set up* at `--text-xl`; the sub-line *About 10
minutes, then the data download runs on its own. You can leave and come
back.* at `--text-xs` `--muted-foreground`; the `stepper` `vertical`, four
steps, each a 28 px dot with its number or a check, a bold title and a
one-line done summary: *Market data* (*Found* / *Missing*), *How far back*
(*{y} years of history*), *Stocks to follow* (*{n} followed stocks*),
*Download data* (*Download started {start time}*). Right, fluid: the step card,
a `card` `default` with *Step {n} of 4* at `--text-xs`, the question as `h2`
at `--text-xl`, an explanation capped at 70ch, the controls, an info note at
`--text-xs` on `--muted`, and a footer with **← Back: {previous step title}**
(`button` `ghost`) left and *Next: {next step title}* and **Continue**
(`button` `default`) right; step 1 has no Back, step 4 no Continue. The
1180 px, 260 to 300 px, 28 px and 70ch are approved-specification layout
dimensions read from `owner-shell`'s `web/src/app/layout.ts`, not theme
literals (AC-26 as narrowed by the owner; review v1 FINDING-6).

**Steps.**

| Step | Question | Controls and copy |
|------|----------|-------------------|
| 1 | *Connect market data* | *Market data key:* `badge` `status-good` *Found* or `status-critical` *Missing*; when missing, *Set the environment variable `FACTORFLOW_MASSIVE_API_KEY` to your Massive API key.* and *Restart FactorFlow after setting it.*; while health is unreachable `coverage-unknown` *Not determinable* with *FactorFlow isn't answering, so the key can't be checked.*; **Continue** always available |
| 2 | *How far back should history go?* | `form` `stacked`, *History depth*, `input` `numeric` with the suffix *years*, *Whole years, 1 to 50.*; note *Your provider plan holds 5 years. A deeper depth is requested as stated; the provider returns what it holds.*; `422` *History depth must be a whole number of years from 1 to 50.* |
| 3 | *Which stocks do you want to follow?* | The explanation of S02 §8; `radio-group` `cards` *How do you want to name them?*: **Paste a list** (*Paste symbols separated by commas or one per line.*), **Add later** (*Finish setup now and follow stocks from Data health later.*); *Paste a list* reveals `form` `stacked` with `textarea` `list` *Stock symbols*, placeholder *AAPL, MSFT, NVDA or one symbol per line*, description *Whether the provider knows each one is checked during the download.*; counter *{a} symbols recognised, {d} duplicates, {r} not recognised* with `badge` `status-good` on the accepted count and one `badge` `status-warning` per duplicate or unreadable entry with its reason; *Did you mean {fix}?* as `button` `outline`; below 30, *Factor scores need at least 30 stocks with complete data. With {a}, no factor can be ranked yet.*; at zero, **Continue** `blocked` with *Paste at least one symbol, or choose Add later.*; info note *This is your followed list. You can add or stop following stocks any time in Data health. Stopping keeps their history; nothing is ever deleted.* |
| 4 | *Download data for {n} stocks* | `card` `summary`: *Market data key* (step 1's badge), *History depth* *{y} years*, *Followed stocks* *{n}*; **Start download** (`button` `default`); after `202`, `progress` `determinate` *{done} of {total} stocks* (`indeterminate` while the total is unknown), *Started {start time}*, *checked {time}* at `--text-xs` `--muted-foreground` from the attention read's `checkedAt`, updated on its 10 s poll (AC-25; STD-UI-25; review v1 FINDING-11), *You can leave; this keeps running.*; queued: *A download is running. This starts when it finishes.*; `409`: *Couldn't start the download: history depth isn't set.* with **Go to step 2**, or *Couldn't start the download: no stocks are followed.* with **Go to step 3** |

**Component mapping.**

| UI Element | Component | Variant | Design Spec Reference |
|------------|----------|---------|-----------------------|
| Step list | `stepper` | `vertical`, done steps as links | `design-system/components/stepper/design-spec.md` |
| Step card | `card` | `default` | `design-system/components/card/design-spec.md` |
| Key presence | `badge` | `status-good` / `status-critical` / `coverage-unknown` | `design-system/components/badge/design-spec.md` |
| History depth | `form` + `input` | `stacked` + `numeric` with suffix | `design-system/components/form/design-spec.md`, `design-system/components/input/design-spec.md` |
| Source choice | `radio-group` | `cards` | `design-system/components/radio-group/design-spec.md` |
| Symbols | `form` + `textarea` | `stacked` + `list` | `design-system/components/form/design-spec.md`, `design-system/components/textarea/design-spec.md` |
| Parse counts | `badge` | `status-good`, `status-warning` | `design-system/components/badge/design-spec.md` |
| Near-miss fix | `button` | `outline` | `design-system/components/button/design-spec.md` |
| Step 4 summary | `card` | `summary` | `design-system/components/card/design-spec.md` |
| Continue, Start download | `button` | `default`; `blocked` at zero accepted | `design-system/components/button/design-spec.md` |
| Back | `button` | `ghost` | `design-system/components/button/design-spec.md` |
| Progress | `progress` | `determinate`, `indeterminate` | `design-system/components/progress/design-spec.md` |

**States** (UX design 1.2). Loading: skeleton step list and card. Empty,
never populated: step 1 current, nothing done. Empty, nothing found: step 3
at zero accepted, **Continue** `blocked`. Partial: rejected or duplicate
entries counted with the accepted kept; some steps done. Stale: not
applicable, every step re-derived on load. Unavailable: key presence
`coverage-unknown` while health is unreachable; step 4's progress while
attention fails reads *Progress can't be read right now* beside the running
state, never a frozen bar. Error: a failed depth or count read shows
*Couldn't read {history depth / the followed list}: {reason}* with **Try
again** in that step only; a failed save is a field error with values kept; a
`409` on step 4 is the refusal above. Unreachable: the shell state.

**Tokens.** Stepper per its spec: done dot `--foreground` with a
`--background` check, current ring `--status-active` with
`--status-active-muted`, to-do outline and connector `--border`, step numbers
`--font-numeric` at `--text-xs`; card `--card`, `--border`; fields `--input`
(3:1), focus `--ring`, errors `--destructive`, descriptions and counter
`--muted-foreground`, rejected markers `--status-warning`; key presence on the
status pairs; not determinable `--value-indeterminate` on
`--value-indeterminate-muted` with `--pattern-indeterminate`; radio cards
`--border` with a 1 px `--foreground` selected ring; progress track `--seq-1`,
indicator `--status-active`; spacing `--space-6` between columns, `--space-4`
inside the card, `--space-5` between card regions.

**Accessibility.** The step list is a `nav` *Setup steps* holding an `ol`; the
current step `aria-current="step"`; done steps say so in text (*How far back,
done*). The step card is a `section` labelled by its `h2`; focus moves to that
`h2` when the step changes. The radio group is one tab stop with arrow keys.
The counter is a polite live region tied to the textarea by
`aria-describedby`, and rejected entries are announced with their reason. The
years suffix is part of the input's accessible name. `button` `blocked` stays
focusable with its reason described. The progress bar is a `progressbar`
labelled by its visible text and announced at the 10 second cadence, never
per frame. The key's value appears nowhere (AC-4).

**Internationalization.** None.

## 11. API Endpoints

Consumed only; all delivered and unchanged.

| Endpoint | Method/Operation | Auth/Privilege | Request | Response | Notes |
|----------|-----------------|----------------|---------|----------|-------|
| `/api/settings/history-depth` | GET | none, loopback | none | `years` or null | Step 2 done flag |
| `/api/settings/history-depth` | PUT | none, loopback | `{"years": n}` | `200`; `422` | Step 2 Continue |
| `/api/instruments` | GET | none, loopback | `lifecycle=active&limit=1` | `active_count` | Step 3 done flag and summary |
| `/api/instruments` | POST | none, loopback | `{"symbols": [...]}`, at most 1000 | `201` dispositions; `409`; `422` | Step 3 Continue |
| `/api/acquisition-runs` | POST | none, loopback | none | `202 {run_id, queued_behind}`; `409` | Step 4 |
| `/api/attention` (via `useShell`) | GET | none, loopback | none | `latest_download.progress` | Step 4 progress and done flag |

## 12. References

| Type | Document Name | Description | Link |
|------|---------------|-------------|------|
| UX design | CAP-003 v1 | §1.2 First-run setup, §0.8 departures | `docs/capabilities/CAP-003-app-shell-and-data-health/design/ux-design.md` |
| Screen spec | PRODUCT-UX-S02 v4 | Steps, parse rules, states, S02-1 to S02-6 | `docs/ux/screens/S02-setup.md` |
| System design | CAP-003 v1 | §3.2 and its notes | `docs/capabilities/CAP-003-app-shell-and-data-health/design/system-design.md` |
| Component design | CAP-001 owner web app v4 | `parse-bulk-symbols`, `button` `blocked` | `docs/capabilities/CAP-001-market-data-acquisition-foundation/design/component-design-owner-web-app.md` |
| Decisions | DEC-0202, DEC-0203, DEC-0213, DEC-0218 | Completion, items, progress total, paste summary | `projects/factorflow-v2/decisions/` (harness repository) |

## 13. Traceability

| Capability AC | System Design Element | Component Design Element | Section |
|--------------|----------------------|--------------------------|---------|
| AC-2 | `/` redirect on `most_recent_run` | Step 4 request completes setup; shell redirects | 2.3 |
| AC-3 | Stepper and in-memory drafts | `use-setup-state`, stepper, Back | 2.2 |
| AC-4 | `credential_present` via shell context | Step 1 badge, no value | 10 |
| AC-5 | Reused `parse-bulk-symbols`; dispositions | `summarisePaste`, batches, server dispositions | 2.3 |
| AC-6 | Warning below 30 | Step 3 warning, **Continue** available | 10 |
| AC-7 | First download from setup | Step 4 start and progress | 2.3 |
| AC-21 | Honest empty state | *Add later* to Home's empty state | 2.3 |
| AC-24 | Every region's states | States paragraph | 10 |
| AC-25 | Keyboard; polled freshness | Native and Radix keyboard; progress at 10 s with its *checked {time}* | 10 |
| AC-26 | `ui-components`; layout dimensions in one module | Component mapping; layout dimensions from `layout.ts` | 10 |

## 14. Open Questions

1. **CSV upload in M1** (capability OQ-3). A yes adds a third radio card, a
   `file-input` through `design-system/intake.md` and a capability criterion.
   *Owner: capability owner. Blocks: one control in step 3.*
2. **The download's name** (capability OQ-1): *Download started {start
   time}* until the owner decides on a number. *Owner: capability owner.
   Blocks: copy only.*
3. **DEC-0218's near-miss rule** awaits the owner's verdict; S02 gives one
   example and no rule. *Owner: capability owner. Blocks: nothing.*
