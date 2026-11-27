# Setup screen step components (`web/src/screens/setup/`)

Four modules CAP-003-E4-S2 added for the setup screen (component design
`setup-ui` section 10; AC-3, AC-4, AC-17, AC-25; DAC-E4-3, DAC-E4-4,
DAC-E4-13, DAC-E4-S2-1 to DAC-E4-S2-5): `step-card.tsx`, `step-list.tsx`,
`step-market-data.tsx` and `step-history-depth.tsx`. They take a `SetupState`
from `useSetupState` ([`setup-state.md`](setup-state.md)) and their strings
from `copy.ts`. No screen mounts them yet; their importers are their tests.
Steps 3 and 4 are not delivered here. The directory is scanned for style
literals by `token-literals.test.ts` (tests excluded).

## Step card (`step-card.tsx`)

| Export | Behavior |
|---|---|
| `STEP_HEADING_ID` | `"setup-step-heading"`: the id of the step question, the card's label and the target of a done step's link. One card renders at a time, so one id serves |
| `StepCard` | Props `step`, `question`, optional `explanation`, `note`, `onBack`, `onContinue`, `children`. A `section` labelled by the question (a plain level-2 heading, focusable with `tabIndex={-1}`), the `Step n of 4` line, the explanation capped at `LAYOUT.explanationMeasure`, the children, the note, then the footer. Back shows only for step 2 and later and only when `onBack` is passed, naming the previous step; Continue and the `Next: <step>` hint show only when `onContinue` is passed |
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
