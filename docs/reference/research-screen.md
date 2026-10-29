# Research screen modules (`web/src/screens/research/`)

`web/src/screens/research/` will hold the CAP-002 Research screens
(`component-design-classification-ui.md`). So far it holds two pure modules
the screens will share (CAP-002-E4-S2):

- `format.ts`, the one place a CAP-002 number or date becomes text;
- `copy.ts`, every owner-facing string of the CAP-002 screens.

No route, screen or component imports either yet. The URL query model the
screens read lives in `web/src/api/research-query.ts`; see
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
| `CELL`, `INPUT_STATUS` | the factor cell and column states, and an input's non-present status |
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
