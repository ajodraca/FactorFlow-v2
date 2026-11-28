# Setup screen step components (`web/src/screens/setup/`)

Modules CAP-003-E4-S2, CAP-003-E4-S3 and CAP-003-E4-S4 added for the setup
screen (component design `setup-ui` sections 2.1, 2.3 and 10; AC-3 to AC-6,
AC-17, AC-19, AC-24 to AC-26; DAC-E4-3 to DAC-E4-13, DAC-E4-S2-1 to
DAC-E4-S2-5, DAC-E4-S3-1 to DAC-E4-S3-6, DAC-E4-S4-1). S2: `step-card.tsx`,
`step-list.tsx`, `step-market-data.tsx` and `step-history-depth.tsx`. S3:
`step-stocks.tsx`, `summarise-paste.ts` and `post-in-batches.ts`, and an added
prop on the step card. S4: `step-download.tsx` and `index.tsx` (the screen),
and `KeyPresence` exported from `step-market-data.tsx`. They take a
`SetupState` from `useSetupState` ([`setup-state.md`](setup-state.md)) and
their strings from `copy.ts`. No route mounts `SetupScreen` yet (the shell
mounts it with its draft provider in CAP-003-E4-S6); the only importer outside
the directory is `token-literals.test.ts`. The directory is scanned for style
literals by `token-literals.test.ts` (tests excluded).

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

`StepMarketData({ state })` shows the key's status through `KeyPresence()`,
which reads `health.credential_present` alone, only while `health.liveness` is
`"answering"`; otherwise it renders the not-determinable form with
`STEP1.notAnswering`. `KeyPresence` is exported so step 4's summary card shows
the same verdict from one rule. When the key is missing it adds the line naming
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

## Step 4 (`step-download.tsx`)

`StepDownload({ state })` opens no interval and no animation frame: its progress
follows the shell's `attention` read (DAC-E4-S4-1). The question is
`STEP4.downloadFor(count)` while `state.activeCount` is `ok`, else
`STEP_TITLES[4]`. Back calls `state.goTo(3)`; there is no Continue.

| Part | Behavior |
|---|---|
| Summary card | Three rows: the key (`KeyPresence`), the history depth (`STEP4.yearsValue`, `Absent` with `STEP4.depthAbsent` when `years` is `null`, or the not-determinable form with `READ_ERRORS.readFailed` when the read failed) and the followed count (`formatCount`, or the not-determinable form on a failed read) |
| Start download | `state.step4 === "blocked"` gives the `blocked` button variant (never `disabled`), described by `STEP4.blockedReason`, with no click handler, and adds the exits `STEP4.goHome` (to `/home`) and `STEP4.manageFollowed` (to `/data/followed`). Otherwise a click calls `startAcquisitionRun()`; a ref guard drops a second click while one start is in flight |
| After a start | Stores the returned `runId` and `queuedBehind`, then `refresh("health")`, and `refresh("attention")` too when `queuedBehind` is `null` |
| Refusals | An `ApiError` with code `history_depth_not_set` shows `STEP4.depthNotSet` and a link (`STEP4.goToStep2`) that calls `state.goTo(2)`; `no_active_instruments` shows `STEP4.noStocks` and `STEP4.goToStep3` to step 3. Any other `ApiError` or an `ApiUnreachableError` shows `STEP4.startFailed(failureReason(error))`. Each renders in a `role="alert"` region; any other error is rethrown |
| Progress region | Shown from the latest download in `attention` (the last served one after a failed poll), or, between a start and attention first naming that run (`run_id` equal to the started `runId`), a pending `requested` view with no times (DEC-0356). It holds the download's status badge (`tierOf` and `labelOf` for `{ of: "download", state }`); while attention is in error, `STEP4.progressUnreadable`; while the start was queued behind another run and the state is `requested`, `STEP4.queued`; otherwise, for a state that is not terminal (`succeeded`, `partial`, `failed`, `cancelled`, `abandoned`), `STEP4.progress(done, total)` and a `Progress` bar (indeterminate while `total` is `null`) |
| Footer lines | `STEP4.started` from `started_at`, else `requested_at`, when either is set, plus `STEP4.checked` from the attention check time while attention is `ok`; `STEP4.canLeave` while the state is not terminal |

## Setup screen (`index.tsx`)

| Export | Behavior |
|---|---|
| `screenStateOf(state, now)` | `loading` while the reads settle; `empty-never-populated` when no step is done; otherwise `populated` (all four done) or `partial`, carrying the `SetupState` |
| `cardRenderers(state)` | The `StateRegion` renderers: the loading kind a card skeleton, the other three kinds the current step through `SetupBody`; `empty-no-match`, `unavailable`, `error` and `unreachable` are recorded not applicable, each with its reason, because those states render inside their steps or are the shell's |
| default `SetupScreen` | Calls `useSetupState`; the side column holds the title and sub-line (`SCREEN`) and the step list (or its skeleton while loading); the main column is the `StateRegion`. `SetupBody` picks the step card for `state.current` and moves focus to the step heading when the step changes (`useStepHeadingFocus`), never on first render. It mounts no `SetupDraftProvider` and opens no interval |
