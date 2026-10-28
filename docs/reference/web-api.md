# Interface API access (`web/src/api/`)

`web/src/api/` is the owner interface's typed access to the JSON API. It holds
two layers:

- the delivered client, `types.ts` and `client.ts`, for health, instruments,
  settings, acquisition runs and coverage;
- the classification fetch layer, `classification-types.ts` and
  `classification-client.ts`, for `/api/universes` and `/api/classifications`
  (CAP-002-E4-S1; `component-design-classification-ui.md` sections 2.1 and
  2.4). No screen, hook or copy imports it yet.

Same-origin only: the bundle is served by the API process, so every path is
relative.

## Delivered client

`types.ts` hand-writes the response shapes against the published contract:
`HealthResponse`, `ScreenState<T>`, and the instrument/settings shapes
`SymbolOutcome`, `AddInstrumentsResult`, `Instrument`, `InstrumentListResult`,
`HistoryDepth`, and the run shapes `RunState`, `AcquisitionRun`,
`AcquisitionRunPage`, `RunStartResult`, `RunCancelResult` (named apart from
`RunSummary`, the health `most_recent_run` shape `{run_id, state, ended_at}`,
kept snake_case because `fetchHealth()` casts the body unmapped), the
run-detail shapes `DataType`, `ResultOutcome`, `OutcomeCounts`, `RunResult`,
`RunDetail`, and the coverage shapes `PresenceState`, `CoverageDataType`,
`CoverageRow`, `CoverageGapDetection`, `CoverageView`, `CoverageExpansion`.

`client.ts` holds `fetchHealth()`, `addInstruments()`, `retireInstrument()`,
`listInstruments()`, `getHistoryDepth()`, `setHistoryDepth()`,
`listAcquisitionRuns()`, `getAcquisitionRun()`, `startAcquisitionRun()`,
`cancelAcquisitionRun()`, `fetchCoverage()`, `fetchCoverageGapDates()`, and the
`ApiError`/`ApiUnreachableError` types a non-2xx response or a failed fetch
each map to. `ApiError` carries the envelope's `requestId`, plus `code` and
`state` (each `null` when absent), so callers branch on `error.code` rather
than on message text.

### `requestJson`

`requestJson<T>(input, init?)` is exported (DEC-0064, DEC-0086) so that other
fetch layers share one transport. It sends `Accept: application/json` merged
with the caller's headers, and:

- a rejected `fetch` becomes `ApiUnreachableError`;
- a non-2xx status becomes `ApiError` through `toApiError`;
- a 2xx body that is not JSON becomes `ApiUnreachableError`.

## Classification fetch layer

### Types (`classification-types.ts`)

The public types mirror the response shapes of `classification-api` section
2.7 field for field in camelCase. Scores, percentiles and input values are the
wire's decimal strings at stored precision (DEC-0063), and dates and
timestamps the wire's ISO-8601 strings, never `Date` (STD-UI-5). A field is
`| null` where the wire can carry null.

| Type | Wire shape / endpoint |
|------|-----------------------|
| `FactorName` | `"value" \| "growth" \| "momentum"` |
| `FactorCell`, `FactorSummary` | `FactorCellResponse`; one factor's `{qualified_count, ranked, min_peer_set_size}` |
| `CurrentSet`, `LaterSet` | `SetBlock` (always `state: "complete"`, with `notCurrent`); `LaterBlock` (`"building"` or `"failed"`, with `failureReason`) |
| `SetState` | `{neverClassified, set, later}`, the one shape the list and the summary share (DAC-E4-S1-3) |
| `ClassificationList` | `GET /api/classifications`: `SetState` plus `factors`, `matchCount`, `stocks: StockRow[]`, `unknownSymbols`, `nextCursor` |
| `ClassificationSummary` | `GET /api/classifications/summary`: `SetState` plus `factors`, `stocksCurrent` |
| `StockEvidence`, `InputRow`, `Membership` | `GET /api/classifications/stocks/{symbol}` |
| `StockHistory`, `StockHistoryRow` | `GET /api/classifications/stocks/{symbol}/history` |
| `ClassificationSet`, `ClassificationSetPage` | `GET /api/classifications/sets/{set_id}` and `GET /api/classifications/sets` |
| `UniverseList`, `UniverseSummary` | `GET /api/universes` |
| `UniverseDetail`, `UniverseOrigin`, `UniverseMember` | `UniverseResponse` (`GET`, `POST`, `PATCH /api/universes/...`) |
| `UniverseEventPage`, `UniverseEvent` | `GET /api/universes/{id}/events` |
| `AddMembersResult`, `RemoveMemberResult`, `RetireUniverseResult` | the member and retire responses |
| `ThresholdBounds`, `Thresholds` | the twelve optional bounds; plus `hideIncomplete` and `symbol` for a saved filter |
| `ClassificationListParams` | `GET /api/classifications` parameters, every field optional (it does not extend `Thresholds`) |
| `CreateUniverseRequest` | `CreateUniverseByHand` (`name`, `symbols`) or `CreateUniverseFromFilter` (`name`, `filter`, `setId`) |
| `ClassificationOperation`, `ClassificationResource` | the client's operation identifiers and the four resources of section 2.5 |

`neverClassified` is true exactly when `set` is null; it is a distinct value,
never an empty `stocks` list. `later` carries a building or failed set in both
states, and `CurrentSet.notCurrent` is true exactly when `later` is non-null
(DEC-0082).

Some fields are passed through as received with no key renamed (DEC-0144):
`InputRow.detail` and `UniverseEvent.filterProvenance` are `unknown`, and
`UniverseOrigin.thresholds` stays keyed by query-parameter name
(`value_percentile_min`). `UniverseMember.name` and `factors` are null when the
reader has no row for the member (DEC-0097).

`StockEvidence.factors` holds only the cells the API sent, `{}` for a stock
with none (DEC-0140), but its declared type is
`Record<FactorName, FactorCell>`, so the compiler does not flag a missing
factor. Check for each cell at runtime. This is the open warning IR-001 of the
story's implementation review v1.

### Endpoint functions (`classification-client.ts`)

Every function goes through `requestJson` and maps the snake_case wire to the
types above field by field. Path segments are passed through
`encodeURIComponent`. Only present parameters are sent.

| Function | Request | Operation | Resource |
|----------|---------|-----------|----------|
| `listUniverses(params?)` | `GET /api/universes` (`lifecycle`, `name`, `limit`, `cursor`) | `list-universes` | `universe` |
| `createUniverse(universe)` | `POST /api/universes` | `create-universe` | `universe` |
| `getUniverse(universeId, {asOf}?)` | `GET /api/universes/{id}` (`as_of`) | `get-universe` | `universe` |
| `renameUniverse(universeId, name)` | `PATCH /api/universes/{id}` `{name}` | `rename-universe` | `universe` |
| `retireUniverse(universeId)` | `DELETE /api/universes/{id}`, no body | `retire-universe` | `universe` |
| `listUniverseEvents(universeId, {limit, cursor}?)` | `GET /api/universes/{id}/events` | `list-universe-events` | `universe` |
| `addUniverseMembers(universeId, symbols)` | `POST /api/universes/{id}/members` `{symbols}` | `add-universe-members` | `universe-member` |
| `removeUniverseMember(universeId, symbol)` | `DELETE /api/universes/{id}/members/{symbol}`, no body | `remove-universe-member` | `universe-member` |
| `listClassifications(params?)` | `GET /api/classifications` | `list-classifications` | `classification` |
| `getClassificationSummary()` | `GET /api/classifications/summary` | `get-classification-summary` | `classification` |
| `listClassificationSets({limit, cursor}?)` | `GET /api/classifications/sets` | `list-classification-sets` | `classification-set` |
| `getClassificationSet(setId)` | `GET /api/classifications/sets/{set_id}` | `get-classification-set` | `classification-set` |
| `getStockEvidence(symbol)` | `GET /api/classifications/stocks/{symbol}` | `get-stock-evidence` | `classification` |
| `getStockHistory(symbol, {limit, cursor}?)` | `GET /api/classifications/stocks/{symbol}/history` | `get-stock-history` | `classification` |

`UniverseListParams` (`lifecycle` of `active`, `retired` or `all`, `name`,
`limit`, `cursor`) is declared in `classification-client.ts`.

Request encoding:

- `listClassifications` sends `universe_id`, compare `symbols` as one repeated
  key per entry (`symbols=A&symbols=B`), `symbol`, `sort`, `order`, the twelve
  bounds under their snake_case names (`value_percentile_min`, ...),
  `hide_incomplete=true` only when `hideIncomplete` is `true`, `limit` and
  `cursor`. `matchCount` is the response's `match_count`, never the number of
  rows loaded.
- `createUniverse` sends `{name, symbols}` by hand, or
  `{name, filter, set_id}` from a result. The filter body carries the present
  bounds under their snake_case names plus `hide_incomplete` and `symbol`
  (which may be `null`).
- Writes with a body send `Content-Type: application/json`; the two `DELETE`
  calls send neither body nor `Content-Type`.

### `ClassificationApiError`

A non-2xx answer from any of these functions throws `ClassificationApiError`,
a subclass of `ApiError`, so a screen builds its `error` state from it as from
any other `ApiError`. Beyond `ApiError`'s `code`, `state` and `requestId` it
carries:

| Field | Source |
|-------|--------|
| `operation` | the function's `ClassificationOperation` (DEC-0143) |
| `resource` | the envelope's `resource` when it is one of `universe`, `universe-member`, `classification`, `classification-set`; otherwise the function's own resource from the table above. A `validation_error` that names a path segment such as `universes` falls back this way |
| `reason` | the envelope's `code` (`null` when absent) |
| `symbols` | the envelope's `symbols` list (`instrument_not_acquired`) when it is a list of strings, else `[]` |

The envelope's `message` is never parsed. A body that is not JSON or not an
envelope leaves `resource` at the function's own and `symbols` at `[]`.
`ApiUnreachableError` (a failed `fetch`, or a 2xx body that is not JSON) passes
through unchanged.

The delivered `toApiError` drops the envelope's `resource` and `symbols`, and
`client.ts` changes only by the `requestJson` export. So each call wraps
`globalThis.fetch` for the synchronous start of `requestJson` alone, clones a
non-2xx response for that call, and restores the global in `finally` before
anything is awaited. Concurrent calls each keep their own envelope. This relies
on `requestJson` calling `fetch` before its first `await`; the restoration and
concurrency tests in `classification-client.test.ts` fail if it stops doing so.
