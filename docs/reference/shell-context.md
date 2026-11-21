# Owner shell context and data-health hook (`web/src/app/`)

Two modules CAP-003-E3-S3 added to the owner shell (component design
`owner-shell` sections 2.3 and 2.4; DAC-E3-18, DAC-E3-19, DAC-E3-S3-1 to
DAC-E3-S3-4): `shell-context.tsx` and `use-data-health.ts`. No screen imports
them yet; their only importers are their tests and, for `useShell`,
`use-data-health.ts`. They read through the fetch functions in
[`shell-client.md`](shell-client.md) and run on the scheduler and health poll in
[`owner-shell-polling.md`](owner-shell-polling.md).

## The shared context (`shell-context.tsx`)

Three intervals serve the whole interface and none is opened per screen:
health's 30 s poll belongs to `health.tsx`, and attention and the score summary
run on `usePolledRead`. Nothing in this module sets a timer.

### `ShellProvider`

Polls `fetchAttention` and `fetchScoreSummary` once for the whole interface and
supplies them, with health and the title detail, to everything beneath it. It
never reads `GET /api/data-health`.

| Constant | Value | Applies |
|---|---|---|
| `IDLE_INTERVAL_MS` (not exported) | `60_000` | attention and summary while nothing is running |
| `ACTIVE_INTERVAL_MS` (not exported) | `10_000` | attention and summary while a download is not terminal or the scores are building |

- **Active.** Both reads use the 10 s cadence when the latest download's state is
  `requested`, `running` or `cancelling`, or when a served summary's
  `later.state` is `building`. Each read's last success is held in a ref and set
  before the next delay is computed, so neither interval depends on React's
  render timing.
- **Not served.** A summary that is `not_served` has no `later` to build, so the
  summary is re-read on the 60 s cadence (DAC-E3-6).
- **`scores` mapping.** The summary route answers `404 not_found` until it is
  deployed, which is `{ kind: "not_served" }`, not an error. A poll `ok` becomes
  `served` with its `checkedAt`; a poll `error` becomes `{ kind: "error", error,
  last }`, where `last` is the previous served `ScoreSummary` or `null` when the
  previous answer was not a summary.

### `ShellContextValue` and `useShell()`

| Member | Meaning |
|---|---|
| `health` | the `HealthState` from `useHealth()`, passed through; `credential_present` stays the boolean it is and no member holds a credential value (AC-4) |
| `attention` | `ReadState<Attention>` of the polled `GET /api/attention` |
| `scores` | `ScoreState` of the polled summary |
| `refresh(kind)` | re-reads `"health"`, `"attention"` or `"scores"` at once and keeps its cadence; a refresh while that read is in flight is ignored |
| `setTitleDetail(text)` | sets the top-bar crumb's detail text; `null` clears it |

`useShell()` throws `useShell() must be called inside <ShellProvider>` outside a
provider. A per-consumer fallback poll would open intervals per screen, and a
frozen default would leave a screen loading with no sign why (DEC-0326).

### `useTitleDetail()`

Returns the crumb detail a screen set, or `null` until one is set. The detail is
held in a context of its own, so a crumb change does not re-render every
`useShell()` consumer and `ShellContextValue` keeps exactly five members
(DEC-0323).

Tests: `shell-context.test.tsx`.

## The data-health hook (`use-data-health.ts`)

### `useDataHealth()`

Returns `{ state: ReadState<DataHealth>, retry() }`. It reads
`GET /api/data-health` on demand only; the shell itself never reads it (AC-28).
It needs a `ShellProvider` above it, because it watches the shell's attention
state.

It reads exactly:

- once on mount;
- once per `retry()`;
- once when two consecutive successful attention answers show
  `latest_download.state` going from `requested`, `running` or `cancelling` to
  `succeeded`, `partial`, `failed`, `cancelled` or `abandoned`. An attention
  error never updates the comparison. The first answer only seeds it, and a
  `null` download counts as no state.

It sets no timer and listens for no visibility change.

- **One read at a time.** A trigger during a read sets a pending flag, and one
  trailing read starts when it settles, so any number of triggers during a read
  add one read (DEC-0325).
- **States.** The first state is `loading`. A success is `{ kind: "ok", data,
  checkedAt }`. A failure is `{ kind: "error", error, last }`, with `last` the
  previous `ok` state's data and `checkedAt`, the earlier error's `last`, or
  `null`. A rejection that is not an `ApiError` or `ApiUnreachableError` is
  rethrown rather than rendered as a stale read.
- **Unmount.** An answer arriving after unmount is dropped and no trailing read
  starts.

Tests: `use-data-health.test.tsx`.
