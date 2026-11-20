# Owner shell polling and layout (`web/src/app/`)

Three modules CAP-003-E3-S2 added to the owner shell (component design
`owner-shell` sections 2.1 and 2.4; DAC-E3-5, DAC-E3-16, DAC-E3-S2-1 to
DAC-E3-S2-4): `layout.ts`, `use-polled-read.ts` and `health.tsx`. No screen
imports them yet; their only importers are their tests and each other. The
delivered `status-region.tsx` still renders the status region and keeps its own
health poll until CAP-003-E3-S6 moves it onto `health.tsx`. The fetch functions
the shell reads through are in [`shell-client.md`](shell-client.md).

## The layout values (`layout.ts`)

`LAYOUT` is a `const` object of the seven approved-specification layout
dimensions, each a CSS length as text:

| Key | Value | Used for |
|---|---|---|
| `railWidth` | `208px` | the rail |
| `contentMaxWidth` | `1180px` | Home, Setup and Data health content cap |
| `sideColumnMin` | `260px` | setup's step list, lower bound |
| `sideColumnMax` | `300px` | setup's step list, upper bound |
| `markerSize` | `28px` | setup's step dot; Home's severity tile |
| `railIconSize` | `16px` | the rail item icon |
| `explanationMeasure` | `70ch` | setup's step explanation |

These are not theme tokens. The layout rule in
`web/src/components/token-literals.test.ts` (TC-COMP-072) scans every scanned
source under `web/src/` and fails on a whole-value `208px`, `1180px`, `260px`,
`300px`, `28px`, `16px` or `70ch` written anywhere except `layout.ts` and the
`web/src/screens/research/` directory (CAP-002's research screens, outside the
rule by capability section 5, DEC-0321). Matching is on whole values: `116px`,
`1280px`, `2.16px`, `16pxs` and `16 px` do not match. A call site reads
`LAYOUT.<key>`.

## The scheduler (`use-polled-read.ts`)

### `startPolling(read, nextDelayMs, onSettled)`

Plain code, no React. Returns `{ refresh(), stop() }`.

- It reads once at once, then after each read settles schedules the next with
  `setTimeout`, with the delay `nextDelayMs()` returns, asked after `onSettled`
  has seen the answer so the delay can follow it.
- `onSettled` receives a `PollOutcome<T>`: `{ ok: true, data }` or
  `{ ok: false, error }`. A rejected read is an outcome, not a throw.
- A read never starts while one is in flight, so `refresh()`, a visibility
  change and an elapsed interval cannot overlap (TC-COMP-069).
- While `document.visibilityState` is `hidden` the timer is cleared, and no
  timer is set when a read settles; when the page becomes visible a read starts
  at once (DAC-E3-S2-1).
- The next read is scheduled even if `onSettled` throws.
- `refresh()` reads at once and is ignored while a read is in flight. `stop()`
  clears the timer, removes the `visibilitychange` listener, and drops any
  outcome still in flight.

### `usePolledRead(read, intervalMs)`

Returns `{ state, refresh }`, where `state` is a `ReadState<T>` from
`shell-types.ts` (see [`shell-client.md`](shell-client.md)).

- `intervalMs(last)` is given the last successful answer, or `null` before one.
  `read` and `intervalMs` are held in refs, so a new closure on re-render
  applies from the next read and never restarts the poll.
- A success sets `{ kind: "ok", data, checkedAt }`; `checkedAt` is the instant
  the answer arrived (AC-25).
- A failure keeps the previous value: `{ kind: "error", error, last }` where
  `last` is the previous `ok` state's `{ data, checkedAt }`, the earlier error's
  `last`, or `null` when nothing succeeded yet (DAC-E3-S2-2, TC-COMP-070).
- A rejection that is not an `ApiError` or `ApiUnreachableError` is rethrown
  from `onSettled`, so it surfaces as a programming error rather than a stale
  read.
- The poll starts on mount and stops on unmount.

Tests: `use-polled-read.test.ts`.

## The health poll (`health.tsx`)

Copied from the delivered `status-region.tsx`'s poll, with two differences: it
records `lastAnsweredAt` (AC-23) and it runs on `startPolling`, so it pauses
while the page is hidden (DAC-E3-5). Rendering stays in `status-region.tsx`.

| Export | Meaning |
|---|---|
| `HEALTH_POLL_INTERVAL_MS` | `30_000` |
| `UNREACHABLE_MESSAGE` | the designed unreachable copy, verbatim from UX design section 2 |
| `Liveness` | `"unknown"`, `"answering"` or `"unreachable"` |
| `HealthState` | `{ liveness, health, lastUpdated, lastAnsweredAt }` |
| `formatTimestamp(when)` | ISO-8601 date and time in `America/Chicago`, with the zone name appended |
| `HealthProvider` | polls once and supplies the state to everything beneath it |
| `useHealth()` | the current `HealthState` |
| `useHealthRefresh()` | a function that re-reads health at once |

`HealthState` fields: `health` is the last successful response, or `null`;
`lastUpdated` is when the last poll completed, successfully or not;
`lastAnsweredAt` is the instant of the last success and is kept while
unreachable (DEC-0212).

- **Outcomes.** A response sets `liveness: "answering"` and both times to the
  arrival instant. A rejected `fetchHealth` sets `liveness: "unreachable"`,
  keeps `health` and `lastAnsweredAt`, and moves `lastUpdated`; the error's text
  is discarded (STD-UI-23). A response reporting `database: "unreachable"` is
  still `answering`: the API is up and its store is down (DAC-E1-S6-2).
- **One chain.** Inside a `HealthProvider` there is one poll however many
  consumers read it. `useHealth()` with no provider above it polls for itself,
  so a consumer renders on its own in a test.
- **`useHealthRefresh()`** is the provider's `refresh` inside a provider, and a
  stable no-op outside one (DEC-0322). It is the read behind the shell
  context's `refresh("health")`.
- **`formatTimestamp`** builds the text from `Intl` parts, spells midnight `00`
  where an engine says `24`, and never uses the viewing machine's zone
  (STD-UI-5, DAC-E1-S5-2).

Tests: `health.test.tsx`.
