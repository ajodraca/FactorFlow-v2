# Setup screen step components (`web/src/screens/setup/`)

Modules CAP-003-E4-S2 and CAP-003-E4-S3 added for the setup screen (component
design `setup-ui` sections 2.3 and 10; AC-3 to AC-6, AC-17, AC-19, AC-25;
DAC-E4-3 to DAC-E4-7, DAC-E4-11, DAC-E4-13, DAC-E4-S2-1 to DAC-E4-S2-5,
DAC-E4-S3-1 to DAC-E4-S3-6). S2: `step-card.tsx`, `step-list.tsx`,
`step-market-data.tsx` and `step-history-depth.tsx`. S3: `step-stocks.tsx`,
`summarise-paste.ts` and `post-in-batches.ts`, and an added prop on the step
card. They take a `SetupState` from `useSetupState`
([`setup-state.md`](setup-state.md)) and their strings from `copy.ts`. No
screen mounts them yet; their importers are their tests. Step 4 is not
delivered here. The directory is scanned for style literals by
`token-literals.test.ts` (tests excluded).

## Step card (`step-card.tsx`)

| Export | Behavior |
|---|---|
| `STEP_HEADING_ID` | `"setup-step-heading"`: the id of the step question, the card's label and the target of a done step's link. One card renders at a time, so one id serves |
| `StepCard` | Props `step`, `question`, optional `explanation`, `note`, `onBack`, `onContinue`, `continueBlocked`, `children`. A `section` labelled by the question (a plain level-2 heading, focusable with `tabIndex={-1}`), the `Step n of 4` line, the explanation capped at `LAYOUT.explanationMeasure`, the children, the note, then the footer. Back shows only for step 2 and later and only when `onBack` is passed, naming the previous step; Continue and the `Next: <step>` hint show only when `onContinue` is passed. When `continueBlocked` is set, the reason renders as text above Continue, which takes the `blocked` button variant (never `disabled`), stays in the tab order and is described by that text through `aria-describedby` |
| `useStepHeadingFocus(current)` | Focuses the step heading when `current` changes, never on first render, so the shell's focus on the screen heading stands. Meant to be called once, in the persistent screen, because each step mounts its own card |
| `failureReason(error)` | `READ_ERRORS.notAnswering` for an `ApiUnreachableError`, else `READ_ERRORS.unexpected`. It never reads the error's message or request id |
| `StepReadError` | Props `subject`, `error`, `onRetry`: `Couldn't read <subject>: <reason>` and a **Try again** button |

## Step list (`step-list.tsx`)

`StepList({ state, header? })` renders the optional header, then the vertical
`Stepper` labelled `SCREEN.stepsLabel`. A step is `current` when it is
`state.current`, else `done` when `state.done[step]`, else `todo`. Only a done
step that is not current is a link, to `#setup-step-heading`, and activating it
calls `state.goTo(step)`. A done step carries a one-line summary when its fact
is known:

| Step | Summary |
|---|---|
| 1 | The shared credential label, only while `health.liveness` is `"answering"` and a health answer exists; a stale answer kept after a failed poll is not summarised (DEC-0349) |
| 2 | `N years of history` when the depth read is `ok` and `years` is not null |
| 3 | `N followed stocks` when the count read is `ok` |
| 4 | `Download started <time>` from the latest download's `started_at`, else `requested_at`; the latest download is the shell's `attention` answer, or the last served one after a failed poll |

## Step 1 (`step-market-data.tsx`)

`StepMarketData({ state })` shows the key's status from
`health.credential_present` alone, read only while `health.liveness` is
`"answering"`; otherwise it shows the not-determinable form with
`STEP1.notAnswering`. When the key is missing it adds the line naming
`FACTORFLOW_MASSIVE_API_KEY` in code type and the restart line. Continue calls
`state.goTo(2)` and is never blocked: a missing key does not stop setup
(DEC-0203).

## Step 2 (`step-history-depth.tsx`)

`StepHistoryDepth({ state })` is a form with one numeric field, `years`,
suffixed `years`.

- **Initial value:** the draft `state.drafts.yearsText` when not empty, else the
  saved years, else empty. Each change is written back with
  `state.setDraft("yearsText", …)`; a failure never resets the draft.
- **Validation:** on blur (`mode: "onTouched"`) and on Continue, with a
  trimmed whole number from 1 to 50 (`MIN_YEARS`, `MAX_YEARS`, mirroring
  `src/factorflow/api/bounds.py`). Otherwise `STEP2.rangeError`.
- **Save:** `setHistoryDepth(Number(years))`. On success it calls
  `state.reread("depth")` and `state.goTo(3)`. An `ApiError` with code
  `validation_error` shows `STEP2.rangeError`; any other `ApiError` or an
  `ApiUnreachableError` shows `STEP2.saveFailed(failureReason(error))`; any
  other error is rethrown.
- **Failed depth read:** a `StepReadError` above the field, whose **Try again**
  calls `state.reread("depth")`.
- Back calls `state.goTo(1)`. The card's note is `STEP2.planLimitNote`.

## Step 3 (`step-stocks.tsx`)

`StepStocks({ state })` asks how the owner names the stocks to follow: a radio
group of two cards, **Paste a list** and **Add later**, stored in
`state.drafts.source`.

- **Continue gate:** blocked, with `STEP3.zeroBlocked`, while `source` is null
  or `"paste"` with no accepted symbol. With `"later"`, Continue calls
  `state.goTo(4)` and posts nothing.
- **Paste field:** a `Textarea` (`variant="list"`) holding `state.drafts.pasted`,
  read-only while a post runs. The text is parsed with the delivered
  `parseBulkSymbols` on paste and on blur, never per keystroke. Blur also
  upper-cases the draft. The first parse of a remount comes from the draft, so
  going back keeps the text and its summary.
- **Summary:** a polite `role="status"` region, always rendered, tied to the
  field by `aria-describedby`. It shows `STEP3.counter` (recognised, duplicates,
  not recognised), then one line per repeated symbol (`STEP3.duplicateEntry`),
  one per unreadable entry (`STEP3.unreadable`) with a **Did you mean `<fix>`?**
  button when `summarisePaste` offers a fix, then the report lines below. Each
  line is text with a warning-coloured left border; no status badge renders.
- **Fix:** applies `replaceEntry` to the draft, re-summarises and returns focus
  to the field.
- **Below the floor:** with 1 to 29 accepted symbols, `STEP3.belowFloor` is shown
  (`FACTOR_FLOOR` = 30). It does not block Continue.
- **Post:** Continue with `"paste"` calls `postInBatches(summary.accepted)`;
  a second Continue while one runs is ignored.
  - `done`: clears `drafts.unposted`, re-reads `activeCount`, and builds report
    lines from the rejected symbols: `STEP3.alreadyFollowedEntry` for
    `duplicate_active`, `STEP3.unreadable` for `malformed`, nothing for other
    dispositions. With no lines it calls `state.goTo(4)`; with lines it stays on
    step 3 so they can be read.
  - `failed`: the field becomes the unposted symbols one per line
    (`drafts.pasted` and `drafts.unposted`), `activeCount` is re-read when any
    batch was posted, and a `role="alert"` shows `STEP3.saveFailed(reason)` and
    `STEP3.followedSoFar(n)`; the summary shows `STEP3.keptForRetry(n)`.
  - A post that settles after the owner left step 3 (Back, a step link,
    unmount) does not call `goTo`.
- **Failed count read:** a `StepReadError` above the radio group whose **Try
  again** calls `state.reread("activeCount")`.
- Back calls `state.goTo(2)`. The card's note is `STEP3.infoNote`.

## Paste summary (`summarise-paste.ts`)

Wraps the delivered parser's output; it never edits `parse-bulk-symbols.ts`.

| Export | Behavior |
|---|---|
| `SYMBOL_SHAPE` | `/^[A-Z][A-Z0-9.-]{0,15}$/`, a mirror of the parser's private shape, pinned equal to it by test |
| `ENTRY_SEPARATOR` | `/([\n,\t;]+)/`, a mirror of the parser's separators; the capture group makes `split` keep them |
| `summarisePaste(parsed)` | Classifies entries in paste order into `{ accepted, duplicates, unreadable }`. A valid symbol seen first is accepted; each later repeat adds the symbol to `duplicates` once; an invalid entry is `unreadable` (`{ input, fix }`) however often it repeats |
| `replaceEntry(raw, input, fix)` | Replaces every whole entry equal to `input` by `fix`, keeping the separators and the whitespace around each entry; an entry that merely contains `input` is left alone |

`fix` is set only for a near miss: a run of `/`, space or `_` between two
letters becomes one `.`, offered only when the result matches `SYMBOL_SHAPE`;
otherwise it is `null`.

## Batched post (`post-in-batches.ts`)

| Export | Behavior |
|---|---|
| `MAX_SYMBOLS_PER_REQUEST` | `1000`, a mirror of the server bound in `src/factorflow/api/bounds.py`, pinned equal by test |
| `BatchOutcome` | `{ kind: "done", posted, rejected }` or `{ kind: "failed", posted, unposted, error, rejected }`; `unposted` holds the failed batch and every later one, in order |
| `postInBatches(symbols)` | Calls `addInstruments` on consecutive slices of at most `MAX_SYMBOLS_PER_REQUEST`, one at a time. A batch's `rejected` entries are collected and its size counts as posted. An `ApiError` with code `all_duplicate` (the 409) counts as posted and the requests go on. Any other `ApiError` or an `ApiUnreachableError` stops with `failed`; any other error is rethrown |
