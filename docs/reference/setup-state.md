# Setup screen state, drafts and copy (`web/src/screens/setup/`)

Three modules CAP-003-E4-S1 added for the setup screen (component design
`setup-ui` sections 2.1, 2.2, 2.3, 3, 5 and 10; DAC-E4-1, DAC-E4-2, DAC-E4-13,
DAC-E4-S1-1 to DAC-E4-S1-3): `copy.ts`, `draft.tsx` and `use-setup-state.ts`.
The step components CAP-003-E4-S2 added ([`setup-steps.md`](setup-steps.md))
import `copy.ts` and `use-setup-state.ts`; no screen mounts them yet.
`use-setup-state.ts` imports `draft.tsx`. State is read through
`useShell` ([`shell-context.md`](shell-context.md)) and the fetch functions
`getHistoryDepth` and `listInstruments` in `web/src/api/client`.

## Drafts (`draft.tsx`)

The four values the owner has entered and not yet saved, held in React state
only, so they survive a route change while the provider sits above the route
and a freshly mounted provider (a reload) starts empty. Nothing is written to
any browser store. This story mounts nothing: the shell mounts the provider
inside `ShellProvider` and outside the main region's route map
(CAP-003-E4-S6).

### `SetupDrafts`

| Field | Type | Initial | Holds |
|---|---|---|---|
| `yearsText` | `string` | `""` | Step 2's field text, as typed |
| `source` | `"paste" \| "later" \| null` | `null` | Step 3's radio choice |
| `pasted` | `string` | `""` | Step 3's pasted text, as typed |
| `unposted` | `string[]` | `[]` | Symbols step 3 could not post, kept for correction |

### `SetupDraftProvider` and `useSetupDrafts`

- `SetupDraftProvider({ children })` holds the four drafts.
- `useSetupDrafts()` returns `{ drafts, setDraft }` and throws
  `useSetupDrafts() must be called inside <SetupDraftProvider>` outside the
  provider.
- `setDraft(key, value)` changes one draft and leaves the other three as they
  are. It is a functional update, so two writes in one tick both land, and it
  is a stable callback (empty dependency list), so a consumer may list it in
  its own dependencies.

## Step state (`use-setup-state.ts`)

`useSetupState()` derives the four steps from the shell's facts and two reads
made on mount. Each step's done flag is re-derived from its server fact on
every mount, so going back or leaving never shows a step as done that is not.
The screen opens no interval: two reads on mount, and a re-read only when a
step asks for one through `reread`.

### `SetupState`

| Member | Meaning |
|---|---|
| `current` | The step to show: the first step not done (step 4 when all four are, DEC-0343), unless `goTo` chose another this visit |
| `done` | `Record<StepId, boolean>`, below |
| `step4` | `"blocked"` while the followed count is a known `0`, else `"ready"`; an unknown count does not block (DEC-0344) |
| `drafts` | The four drafts, passed through from `useSetupDrafts` |
| `goTo(step)` | Shows one step for this visit; touches no draft and no done flag. The override lives in the hook, not the provider, so it ends with the visit |
| `setDraft` | `useSetupDrafts`'s setter |
| `depth` | `ReadState<HistoryDepth>` from `getHistoryDepth()`, for step 2's error and summary |
| `activeCount` | `ReadState<number>`: `listInstruments({ lifecycle: "active", limit: 1 }).activeCount`, the whole followed count |
| `loading` | `true` while `health.liveness` is `"unknown"` or `depth`, `activeCount` or the shell's `attention` is still `loading` |
| `reread(fact)` | Asks `"depth"` or `"activeCount"` again, for Try again and for a step that has just saved |

`depth`, `activeCount`, `loading` and `reread` are additive to the contract's
six members (DEC-0342). `StepId` is `1 | 2 | 3 | 4`.

### Done flags

| Step | Done when |
|---|---|
| 1 | `health.lastAnsweredAt !== null`; an outage after an answer keeps it done |
| 2 | `depth` is `ok` and `depth.data.years !== null` |
| 3 | `activeCount` is `ok` and greater than `0` |
| 4 | a latest download exists, in any state |

The latest download is `attention.data.latest_download` when `attention` is
`ok`, and the last served answer's when `attention` is an `error`, so one
failed poll does not make a download that existed stop existing (DEC-0344).

### Reads

A re-read does not reset a read to `loading`, so a step's done flag holds until
the new answer settles. A failed read becomes `{ kind: "error", error, last }`,
keeping the previous answer in `last`. Only `ApiError` and
`ApiUnreachableError` become an `error` state; any other error is rethrown.
Answers that arrive after unmount are dropped.

## Copy (`copy.ts`)

Every owner-facing string of the setup screen, so the steps and their tests
share one source. Wording is verbatim from the designs except the sub-line
(DEC-0341). The module imports nothing: template parameters are text the
caller has already formatted. It holds no number or boolean as a bound; the
plan limit is stated as copy and nothing there is validated against
(DAC-E4-S1-3). Its text, comments included, is scanned for the terms the
capability keeps out of owner-facing copy (AC-19, DAC-E7-3). Status labels
(Found, Missing, the download states, Not determinable) come from other
components and are not repeated.

| Export | Holds |
|---|---|
| `SCREEN` | `title`, `subLine`, `stepsLabel` |
| `STEP_TITLES` | The four step titles, keyed 1 to 4 |
| `QUESTIONS` | Step cards' questions for steps 1 to 3 (step 4's is `STEP4.downloadFor`) |
| `stepPosition(n)`, `backLabel(title)`, `nextHint(title)`, `CONTINUE`, `doneLabel(title)` | Position line, footer and screen-reader done text |
| `SUMMARIES` | `years`, `followed`, `downloadStarted` one-line step-list summaries |
| `STEP1` | Market data key lines, including `KEY_VARIABLE` (`FACTORFLOW_MASSIVE_API_KEY`) |
| `STEP2` | History depth label, suffix, description, plan-limit note, `rangeError` (1 to 50 whole years), `saveFailed(reason)` (CAP-003-E4-S2, DEC-0346) |
| `STEP3` | Explanation, source legend, `paste` and `later` options, field text, `counter`, `unreadable`, `didYouMean`, `belowFloor`, `zeroBlocked`, `alreadyFollowed`, `infoNote`, and the S3 additions `duplicateEntry`, `alreadyFollowedEntry`, `saveFailed`, `followedSoFar`, `keptForRetry` |
| `STEP4` | Download heading, summary labels, `start`, `progress`, `started`, `checked`, `canLeave`, `queued`, the two not-startable messages with `goToStep2` and `goToStep3`, `blockedReason`, `goHome`, `manageFollowed`, `progressUnreadable` |
| `READ_ERRORS` | `subjects`, `readFailed(subject, reason)`, `tryAgain` for a failed depth or count read; `notAnswering` and `unexpected`, the two reasons a failure shows (CAP-003-E4-S2, DEC-0345) |

A string a later setup story needs and no design contains is added by that
story with a doc comment saying so.
