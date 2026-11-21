# Owner shell fetch module (`web/src/app/shell-client.ts`)

The one fetch module for the owner shell's reads of `data-health-api`'s three
routes and the classification score summary (CAP-003-E3-S1; component design
`owner-shell` sections 2.1 and 2.3; DAC-E3-18). Its types are in
`web/src/app/shell-types.ts`.

Every read goes through the delivered `requestJson` in `web/src/api/client.ts`
(see [`web-api.md`](web-api.md)), so a rejected `fetch` or a non-JSON 2xx body is an
`ApiUnreachableError` and a non-2xx status is an `ApiError`. No body is mapped,
cast field by field or re-keyed: the wire shape is the type, snake_case as served.

## Reads

| Function | Request | Resolves |
|---|---|---|
| `fetchAttention()` | `GET /api/attention` | `Attention` |
| `fetchDataHealth()` | `GET /api/data-health` | `DataHealth` |
| `fetchProblems(cursor, limit)` | `GET /api/data-health/problems?limit=…[&cursor=…]` | `ProblemPage` |
| `fetchScoreSummary()` | `GET /api/classifications/summary` | `ScoreSummary`, or `{ kind: "not_served" }` |

All four send `GET` with `Accept: application/json` and no method override.

### `fetchProblems`

`limit` is sent as given; it is never clamped or defaulted, because the server
owns its bound and refuses out-of-range values. `cursor` is sent only when it is
not `null` or `undefined`: both of those ask for the first page, and an empty
string is sent as `cursor=` (it is not treated as the first page). Cursors are
URL-encoded by `URLSearchParams`, so a cursor such as `BRK/B` round-trips.

### `fetchScoreSummary`

The summary route answers `404 not_found` until it is deployed. `ApiError`
carries the envelope's `code`, not the HTTP status, so the mapping is
`code === "not_found"` → `{ kind: "not_served" }`. Every other `ApiError`, an
`ApiUnreachableError`, and a `404` without the envelope reject unchanged. A
caller tells the two results apart with `"kind" in value`: the wire summary has
no `kind` key.

## Types (`shell-types.ts`)

- Wire shapes, exactly as served: `Attention` (with `Problems`, `Progress`,
  `LatestDownload`, `LatestTerminalDownload`, `AttentionItem`), `ProblemPage`
  (with `ProblemRow`, `Failure`), `DataHealth` (with `DailyPricesCheck`,
  `CompanyFinancialsCheck`, `GapDetectionState`) and `ScoreSummary`. Every
  timestamp and date is ISO-8601 text; every nullable field is `| null`.
  `ScoreSummary` reuses `FactorName`, `LaterSet` and `RunOutcome` from
  `classification-types.ts`.
- Read state, with `checkedAt` as a `Date`: `ReadState<T>` (`loading`, `ok`,
  `error` keeping the last good answer in `last`) and `ScoreState` (`loading`,
  `served`, `not_served`, `error`).

The tests in `web/src/app/shell-client.test.ts` pin each read's resolved type
with `expectTypeOf`; `npx tsc --noEmit` is the observer.
