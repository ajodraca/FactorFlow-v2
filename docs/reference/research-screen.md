# Research screen modules (`web/src/screens/research/`)

`web/src/screens/research/` will hold the CAP-002 Research screens
(`component-design-classification-ui.md`). So far it holds two pure modules
the screens will share (CAP-002-E4-S2) and one hook (CAP-002-E4-S4):

- `format.ts`, the one place a CAP-002 number or date becomes text;
- `copy.ts`, every owner-facing string of the CAP-002 screens;
- `use-score-set-poll.ts`, the poll that learns when a score set completes
  or fails; see [The score-set poll](#the-score-set-poll-use-score-set-pollts).

No route or screen imports any of them yet. The factor cell, the *Possibly
restated* mark, the not-current banner and the as-of line in
`web/src/components/patterns/` import `format.ts` and `copy.ts`
(CAP-002-E4-S3, CAP-002-E4-S4); see
[`component-patterns.md`](component-patterns.md). The hook's only importer is
its test. The URL query model the screens read lives in
`web/src/api/research-query.ts`; see
[`web-api.md`](web-api.md#research-url-codec-research-queryts).

## Display formatting (`format.ts`)

Every numeric input is the wire's decimal string at stored precision
(DEC-0063). It is rounded by string arithmetic, half away from zero, never
through a float (DEC-0147). The rules:

- a value that rounds to zero is never signed;
- signs use the ASCII hyphen-minus (U+002D);
- the zero spelling a `Decimal` column can emit at a scale (`0E-10`) reads as
  zero;
- any other string that is not a plain decimal throws `RangeError`, so a value
  the API never sent is not rendered (STD-UI-4).

| Function | Output |
|----------|--------|
| `formatScore(value)` | a standardised score: two decimals, `+` or `-`, `0.00` unsigned |
| `formatPercentile(value)` | a whole number 0 to 100, no sign and no `%` |
| `formatRatio(value)` | two decimals; a negative keeps `-`, never a `+` |
| `formatRate(value)` | the engine's fraction times 100, two decimals, signed, with `%` |
| `formatAmount(value)` | whole units with `,` thousands separators, no currency symbol and no abbreviation (STD-UI-6) |
| `formatTimestamp(value, {seconds}?)` | an instant in America/Chicago with the zone as the instant falls, `2026-10-15 17:46 CDT`; with `seconds`, `2026-10-15 17:52:10 CDT` |
| `formatDate(value)` | a calendar date (`classification_date`, `known_on`, an input's `as_of`), returned as received |

`formatTimestamp` accepts only an ISO-8601 instant with `Z` or an offset,
never a local wall-clock time, and throws `RangeError` otherwise. It formats
with `Intl.DateTimeFormat` in `America/Chicago` and `hourCycle: "h23"`, so
midnight is `00` and the machine's zone is never read. `formatDate` checks
the `YYYY-MM-DD` shape, throws `RangeError` otherwise, and never passes the
value through `Date` (STD-UI-5). A date that is not on the calendar, such as
`2026-02-29`, is returned unchanged.

## Owner-facing copy (`copy.ts`)

`copy.ts` holds every owner-facing string of the CAP-002 screens, so
components and their tests share one source. Wording is verbatim from the
UX design, and each group's doc comment cites its section. Display labels
follow STD-UI-1 (DEC-0072). A message a later story needs and no design
contains is added with a doc comment saying so. The universe name's maximum
length is not stated here: it is `[REQUIRES INPUT]` in classification-ui
section 14.

| Export | Holds |
|--------|-------|
| `SHELL_ROUTES` | the delivered CAP-001 routes CAP-002 links to: `download(runId)` gives `/runs/{runId}`, `dataHealth` is `/runs` and `followedStocks` is `/instruments`. When the shell delivers the blueprint's routes, this one map changes |
| `UNIVERSE_LIFECYCLE` | every universe-lifecycle string containing *retire*, *retired* or *retiring* |
| `ErrorCode` | the error codes of classification-api section 2.5 |
| `ErrorContext` | what a failure sentence is built from: `action`, `resource`, `symbols`, `universeName` |
| `OPERATION_LABELS` | one *Could not ...* sentence per `ClassificationOperation` (DEC-0149) |
| `RESOURCE_LABELS` | the display noun of each `ClassificationResource` |
| `FALLBACK_ERROR` | the sentence for an unknown or absent code |
| `ERROR_SENTENCES` | one sentence template per `ErrorCode` (STD-UI-19) |
| `failureSentence(failure)` | the statement of a failed call |
| `FACTOR_LABELS`, `REGIONS` | factor names, and the Research panes' section labels |
| `FILTERS`, `describeQuery(query)`, `savedFromFilter(date, query)` | the Filters pane, and a `ResearchQuery` in words |
| `CELL`, `INPUT_STATUS`, `IncompleteReasonCode` | the factor cell and column states (see [Factor-cell sentences](#factor-cell-sentences)), an input's non-present status, and the three `ReasonCode` values an *Incomplete* cell can carry |
| `RESULTS`, `SCORE_SET` | the results header and empty bodies, and the as-of line, not-current banner and set history |
| `SELECTION`, `DIALOGS` | the selection tray and inspector, and the save and add dialogs |
| `UNIVERSES`, `UNIVERSE_DETAIL` | the universes list and create dialog, and one universe's detail |
| `COMPARE`, `EVIDENCE` | Compare, and the stock evidence panels |

### The retire allow-list

STD-UI-1 forbids *retire* for a stock, whose label is *stop following*, but
leaves *universe* its own label (DEC-0145). So every universe-lifecycle string
that says *retire*, *retired* or *retiring* lives in `UNIVERSE_LIFECYCLE`.
`OPERATION_LABELS["retire-universe"]` is `UNIVERSE_LIFECYCLE.retireFailed`.

`copy.test.ts` (TC-COMP-072) scans every string in the catalogue, and every
sentence `failureSentence` can compose, for vocabulary STD-UI-1 forbids. Such
vocabulary includes *retire* in any string outside this group, which the scan
reads as its allow-list. The test also asserts that no lifecycle string
matches *stock*, *instrument* or *follow*. A later story adds a new lifecycle
string to the group and never edits the scanner.

A string that starts with a `UNIVERSE_LIFECYCLE` string, followed by `: ` and a
remainder without *retire*, is also allowed. This prefix rule is DEC-0226, a
provisional agent decision. It admits the composed `retire-universe` failure
sentences, and it applies to every scanned string.

### Factor-cell sentences

Every *Incomplete* sentence takes one shape, built by a private
`incompleteSentence(cause, factor)`: *Incomplete: {cause}, so {factor} can't
be compared fairly. It isn't guessed.* Three `CELL` functions fill it:

| Function | `cause` |
|----------|---------|
| `incompleteReason(input, status, factor)` | `{input} {status}`, with `status` from `CELL.incompleteStatus` (*is missing*, *is outdated*, *couldn't be computed*) |
| `incompleteDetail(detail, factor)` | the engine's owner-facing `reasonDetail`, as sent (DEC-0151) |
| `incompleteGeneric(code, factor)` | *an input* followed by the status phrase `code` selects, where `code` is an `IncompleteReasonCode` (`input_missing`, `input_outdated`, `input_not_computable`) |

The factor cell's *Incomplete* badge titles itself with `incompleteDetail`
when the cell carries a `reasonDetail` and with `incompleteGeneric` otherwise
([`component-patterns.md`](component-patterns.md)). `notFollowedNoDate`,
*Not followed. Earlier scores stand.*, is the *Not followed* badge's title
while no read carries the date a stock stopped being followed (DEC-0152);
`notFollowedSince(date)` is the sentence for when one does.

### Score-set sentences

`SCORE_SET` is read by the not-current banner, the as-of line and the
score-set poll ([`component-patterns.md`](component-patterns.md)). The
banner reads `notReflecting`, `scoreUpdateFailed`, `buildingBody` and
`failedBody`; the line reads `scoresFrom`, `separator`,
`fromTheDownloadStarted`, `openDownload`, `complete`, `partial`, `sortedBy`,
`checked`, `updating`, `earlierSetsAction` and `couldNotCheck`, and
`RESULTS.tryAgain`; the hook reads `scoresUpdatedTo`. CAP-002-E4-S4 added one
string, `noReasonRecorded` (*no reason was recorded*): the reason clause
`failedBody` takes when a failed set's `failureReason` is null. No design
states it, because the scheduler always records a reason; it is defensive
against the nullable wire type (DEC-0232, provisional). `asOfLine(scoresAt,
downloadStarted, sortedBy)`, the whole line as one string, is not what the
component renders: it composes the parts itself so the start time can be a
link.

### Failure sentences

`failureSentence({operation, resource, code, symbols?, universeName?})`
selects its sentence by `code` alone:

- An `ErrorCode` gives `ERROR_SENTENCES[code]`, called with the operation's
  label as `action`, the resource's label, `symbols` (default `[]`) and
  `universeName` (default `null`). Most templates read
  *{action}: {reason}*, and some add a recovery. Five ignore the action and
  give their own sentence: `classification_set_changed`,
  `universe_not_found`, `universe_retired`, `last_member` and
  `instrument_not_found` (which names the first symbol when there is one).
- Any other code, or `null`, gives `{action}: {FALLBACK_ERROR}`. The code
  itself is never shown.

A code counts as an `ErrorCode` only when it is an own key of
`ERROR_SENTENCES` (`Object.hasOwn`). So an unknown code named like an
`Object.prototype` member, such as `toString`, also gets the fallback. No test
pins that case yet; it is the open warning IR-001 of the story's
implementation review v2.

The sentence never reads the envelope's `message` or the error's `name`. A
`ClassificationApiError` can therefore be passed as is: its `operation`,
`resource`, `code` and `symbols` are the fields read.

## The score-set poll (`use-score-set-poll.ts`)

`useScoreSetPoll({ onNewSet })` is the poll every scored CAP-002 surface
runs (classification-ui 2.3, 2.6; UX design 1.2 Polling and Completion;
AC-20, AC-22; DAC-E4-4, DAC-E4-S4-4 to DAC-E4-S4-6; DEC-0153, DEC-0155,
DEC-0233). It takes one callback, `onNewSet(summary: ClassificationSummary)`,
read from the latest render through a ref, so a changed callback identity
does not restart polling. It returns:

| Field | Type | Meaning |
|-------|------|---------|
| `summary` | `ClassificationSummary \| null` | the last successful read; `null` before the first |
| `checkedAt` | `string \| null` | `new Date().toISOString()` after each successful read; `null` before the first, unchanged by a rejected read |
| `pollFailed` | `boolean` | true after a rejected read, until a read succeeds |
| `tryAgain` | `() => Promise<void>` | one read, now; polling resumes while a continuation condition holds |
| `announcement` | `string \| null` | `SCORE_SET.scoresUpdatedTo(endedAt, runStartedAt)` for the latest new set, both times through `formatTimestamp` |

`POLL_INTERVAL_MS`, an exported constant, is `10_000` (STD-UI-25),
mirroring `HEALTH_POLL_INTERVAL_MS` in `web/src/app/status-region.tsx`.

**Reads.** The hook calls `getClassificationSummary()` from
`web/src/api/classification-client.ts` once on mount, from first load and
before any set exists, then on a `setInterval` of `POLL_INTERVAL_MS` while
all of these hold:

- no read has failed since the last success (`pollFailed` is false), and
- the last read's `later.state` is `building`, or the shell's health reports
  the latest download non-terminal, or one more read is owed (below).

The download's state comes from the delivered `useHealth()` in
`status-region.tsx`: `health.most_recent_run.state` is `requested`,
`running` or `cancelling` (`isNonTerminalRunState` from
`web/src/screens/runs/outcome-badge.tsx`). The hook issues no health read of
its own, so the shell's single 30-second health interval is unchanged. The
timer is cleared when the condition stops holding and on unmount. At most
one read is in flight: a tick that lands during a slow read is skipped, not
queued.

**The owed read.** What a read can have seen is fixed when it is issued. A
read issued while the download still ran cannot have seen the set it
produced, so after the health reports the download terminal the hook keeps
its cadence until a read issued after that report has landed; that read's
`later` then governs (DEC-0233). The guarantee this gives is a further read
0 to 10 seconds after the terminal report. Two handoff exposures remain the
owner's question in DEC-0238 (open, provisional): the owed read's tick
landing inside the scheduler's claim window, and a download shorter than one
30-second health interval, which never shows non-terminal to the hook. If
the owner picks a different rule the hook changes, and CAP-002-E4-S4 and
CAP-002-E4-S9 are reworked.

**A new set.** The hook remembers the last read's `set.setId`, or `null`
when that read had no set, and distinguishes both from "not yet read". A
successful read whose `set` is non-null and whose `setId` differs from the
remembered value is a new complete set, a first set after a never-populated
read included: the hook sets `announcement` once and calls `onNewSet(next)`
once (DAC-E4-S4-5; DEC-0153). The very first read never fires, a read that
returns the same set never re-fires, and each further new set fires once
more. The host's reload with its sort, filters, selection and checked rows
preserved runs from `onNewSet` and is the host's (CAP-002-E4-S6, E4-S9).

**Failure.** A rejected read, whether the API did not answer or refused, sets
`pollFailed` true, keeps `summary` and `checkedAt` as they were, and stops
the timer until `tryAgain` (DEC-0155), whether or not a set exists yet. The
error's text is not rendered (STD-UI-23); the as-of line shows *Could not
check for newer scores.* with **Try again**, and in the never-populated
state, which has no line, E4-S9's body does from the same two fields.
`tryAgain` is the read itself: one call performs one read, a success clears
`pollFailed` and resumes the cadence while a condition holds, and a new set
it returns fires `onNewSet` as any read would. Only the read is guarded: a
host callback that throws is the host's defect, not a failed poll.

**Lifetime.** A mounted ref guards every state update and callback, so a
read resolving after unmount sets nothing and calls nothing. A `StrictMode`
double mount leaves one interval and fires `onNewSet` once. The hook keeps no
module-level state and touches no storage.

`use-score-set-poll.test.ts` beside it carries TC-COMP-177 and TC-COMP-184
and drives the hook with fake timers, mocking the client and `useHealth`.
