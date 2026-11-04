# Classification API

The classification API is the CAP-002 HTTP surface over the universe service
and the classification reader (`component-design-classification-api.md`
sections 2.1, 2.4 to 2.7). It has two routers: the universes router
(CAP-002-E1-S6), described in the sections from [Operations](#operations) to
[Transactions](#transactions), and the classifications router (CAP-002-E3-S5),
described under [Classification reads](#classification-reads).

| File | Holds |
|------|-------|
| `src/factorflow/api/routes/universes.py` | The eight `/api/universes` route handlers, the refusal table `REFUSALS` and the response shaping |
| `src/factorflow/api/routes/classifications.py` | The six `/api/classifications` read handlers, their own refusal table `REFUSALS` and the cursor-code choice |
| `src/factorflow/api/classification_models.py` | The Pydantic request and response models of both routers. The classification models reuse E1-S6's `FactorCellResponse`, `FactorsResponse` and `SetBlock` through their `from_reader` classmethods (DEC-0281, agent-decided) |
| `src/factorflow/api/classification_bounds.py` | The bounds this API adds: `MIN_COMPARE_SYMBOLS` (2), `MAX_COMPARE_SYMBOLS` (6) and `MAX_UNIVERSE_NAME_LENGTH` |

`app.py` registers the routers with `include_router(universes.router)` and
`include_router(classifications.router)`, so every route of both is behind
the delivered request-id, Host and Origin
middleware and error envelope (see the README's
[Running the API](../../README.md#running-the-api)). The universes routes validate,
delegate to `factorflow.universes.service` (reached as `service.<fn>`) and the
reader, map typed refusals to the envelope and shape the response. They hold
no universe rule and no SQL. The service's behaviour is described in
[`universe-service.md`](universe-service.md), the reader's in
[`classification-reader.md`](classification-reader.md).

## Operations

| Method and path | Service call | Success |
|-----------------|--------------|---------|
| `GET /api/universes` | `list_universes(conn, lifecycle, name, limit, cursor)` | `200` `UniverseListResponse` |
| `POST /api/universes` | `create_by_hand` or `create_from_filter` | `201` `UniverseResponse` |
| `GET /api/universes/{universe_id}` | `get_universe(conn, universe_id, as_of)` | `200` `UniverseResponse` |
| `PATCH /api/universes/{universe_id}` | `rename(conn, universe_id, name)` | `200` `UniverseResponse` |
| `DELETE /api/universes/{universe_id}` | `retire(conn, universe_id)` | `200` `{lifecycle: "retired", retired_at}` |
| `GET /api/universes/{universe_id}/events` | `list_events(conn, universe_id, limit, cursor)` | `200` `UniverseEventsResponse` |
| `POST /api/universes/{universe_id}/members` | `add_members(conn, universe_id, symbols)` | `200` `{added, already_member}` |
| `DELETE /api/universes/{universe_id}/members/{symbol}` | `remove_member(conn, universe_id, symbol)` | `200` `{removed_at}` |

`DELETE /api/universes/{id}` retires and never deletes; members and events
stay. A symbol that is already a member is reported in `already_member` with a
`200`, not refused (DAC-E1-6).

## Requests

`universe_id` is a UUID path parameter. Every request model forbids unknown
keys.

| Parameter or body | Rule |
|-------------------|------|
| `GET /api/universes` query | `lifecycle` one of `active` (default), `retired`, `all`; `name` an optional prefix; `limit` 1 to `MAX_PAGE_SIZE` (500), default `DEFAULT_PAGE_SIZE` (50); `cursor` |
| `GET /api/universes/{id}` query | `as_of`, an optional date; the service defaults it to today |
| `GET .../events` query | `limit` and `cursor` as for the list |
| `CreateUniverseRequest` | `name`, and exactly one of `symbols` (at most `MAX_SYMBOLS_PER_REQUEST`, 1000) and `filter`. `set_id` is required with `filter` and refused without it. The choice is made with `is None`, so `symbols: []` is the by-hand branch and reaches the service's `empty_universe` refusal |
| `RenameUniverseRequest` | `name` |
| `AddMembersRequest` | `symbols`, 1 to `MAX_SYMBOLS_PER_REQUEST` entries |
| `{symbol}` path segment | normalised and shape-checked by the route before the service; a malformed one is `422 validation_error` with `resource` `universe-member` |

A `name` is trimmed and must not be empty. `MAX_UNIVERSE_NAME_LENGTH` is
`None` because the owner has not stated a maximum, so no length bound is
enforced; setting the constant enforces it on create and rename.

Each symbol is trimmed and upper-cased, then must match the instrument symbol
pattern (`factorflow.instruments.symbols`); duplicates are left to the
service.

`filter` is `Thresholds`: the twelve optional bounds
(`{value,growth,momentum}_{score,percentile}_{min,max}`, `Decimal`; a
percentile bound lies in 0 to 100), `hide_incomplete` (default `false`) and
`symbol`, a prefix normalised and shape-checked like a symbol, or `null`.
`Thresholds.to_reader()` hands the reader only the bounds that are set
(DEC-0085).

A body or query that fails these rules is a `422 validation_error` from the
delivered validation handler, which names fields and never echoes a value.
Its `resource` comes from the path's last segment, per the README's
[Error envelope](../../README.md#error-envelope-and-request-correlation)
rules.

## Responses

Decimals (scores, percentiles, stored bounds) serialise as decimal strings at
stored precision: the routes dump each model in Pydantic's JSON mode.

- `UniverseListResponse`: `universes` (each `universe_id`, `name`,
  `lifecycle`, `member_count`, `created_at`, `retired_at`), `active_count`,
  `retired_count` and `next_cursor`. The two counts are computed by paging
  `replay.list_universe_rows` to its end for each lifecycle (DEC-0098,
  provisional).
- `UniverseResponse`: `universe_id`, `name`, `lifecycle`, `created_at`,
  `retired_at`, `member_count`, `as_of`, `as_of_before_creation`, `origin`,
  `members` and `set`.
  - `origin`: `kind`, `set_id`, `classification_date`, `thresholds`,
    `hide_incomplete`, `symbol`; every field but `kind` is null for a universe
    made by hand.
  - each member: `symbol`, `lifecycle` and `member_since` from the service,
    and `name` and `factors` (the `value`, `growth` and `momentum` cells, each
    `status`, `score`, `percentile`, `reason_code`, `reason_input`,
    `reason_detail`, `restated_possible`) from the reader's row for it.
  - `set`: the reader's current set (`set_id`, `classification_date`,
    `run_id`, `run_started_at`, `run_outcome`, `state`, `started_at`,
    `ended_at`, `latest_trading_day`, `active_instruments`, `not_current`),
    or null when no set is complete.
- `UniverseEventsResponse`: `events` (each `event_id`, `event_type`, `name`,
  `symbol`, `recorded_at`, `recorded_on`, and `filter_provenance`, the stored
  jsonb unchanged) and `next_cursor`.

To fill the members, `_universe_response` pages
`reader.list_classifications` scoped to the universe, `MAX_PAGE_SIZE` rows at a
time, until the reader returns no cursor. A member's `name` and `factors` are
null when the reader has no row for it: no complete set, no row in the current
set, or, on an `as_of` read, a member removed since, because the reader scopes
a universe by today's membership (DEC-0097, provisional).

## Refusals

A typed refusal is mapped by `REFUSALS` to the delivered envelope
(`errors.error_response`). Anything else propagates to the delivered
`500 internal_error`.

| Exception | Status and `code` |
|-----------|-------------------|
| `UniverseNotFound` | `404 universe_not_found` |
| `UniverseRetired` | `409 universe_retired` |
| `UniverseNameInUse` | `409 universe_name_in_use` |
| `EmptyUniverse` | `422 empty_universe` |
| `LastMember` | `409 last_member` |
| `NotAMember` | `404 not_a_member` |
| `InstrumentNotAcquired` | `409 instrument_not_acquired` |
| `ClassificationSetChanged` | `409 classification_set_changed` |
| `CursorError` | `422 cursor_invalid` |

- `message` is `Could not <operation>: <reason>.`, built only from the
  request and the exception's own attributes. `universe_retired` names the
  universe by id, because the exception carries no name (DEC-0260,
  agent-decided). Clients branch on `code`, never on `message`.
- `resource` is `universe-member` for `not_a_member` and `last_member`, and
  for `instrument_not_acquired` and `universe_retired` on the two member
  routes; otherwise `universe` (provisional).
- `instrument_not_acquired` adds `error.symbols`, the list of symbols that
  are not followed.

## Transactions

Each handler opens one `with pool.connection()` block and calls the service
and, for create, rename and get, `_universe_response` inside it. Typed
refusals are caught outside the block. A refusal writes nothing, because the
service's own `with conn.transaction():` block rolls back.

**Accepted warnings from implementation review v1**
(`CAP-002-E1-S6-implementation-review-v1.md`) — neither fails an acceptance
criterion:

- The pool hands out an idle connection, so the service's
  `conn.transaction()` is the outer transaction and commits when it exits,
  before `_universe_response` runs. The route's docstring says the pool's
  block is the "caller commits" the service expects; it is not. If shaping
  the response then fails, a create or rename that is already committed is
  answered with an error, and a retried create is refused as
  `universe_name_in_use` (IR-001, medium).
- `_universe_response` pages the reader with cursors it issues itself. If a
  newer set completes between two pages of a universe with more than 500
  current members, the reader's `CursorError` is answered as
  `422 cursor_invalid`, although the request carried no cursor (IR-002, low).

## Classification reads

`routes/classifications.py` serves six read operations over
`factorflow.classification.reader`, reached as `reader.<fn>`. Each handler
checks one connection out of the pool, makes one reader call on it and
commits nothing. A typed refusal becomes the envelope; anything else
propagates to the delivered `500`. The handlers hold no classification rule
and compute nothing: every response value is a reader field copied across.
The reader's behaviour is described in
[`classification-reader.md`](classification-reader.md).

| Method and path | Reader call | Success |
|-----------------|-------------|---------|
| `GET /api/classifications` | `list_classifications(conn, query.to_filters())`, or `compare(conn, symbols)` when `symbols` is given | `200` `ClassificationListResponse` |
| `GET /api/classifications/summary` | `summary(conn)` | `200` `ClassificationSummaryResponse` |
| `GET /api/classifications/sets` | `list_sets(conn, limit, cursor)` | `200` `SetListResponse` |
| `GET /api/classifications/sets/{set_id}` | `get_set(conn, set_id)` | `200` `SetResponse` |
| `GET /api/classifications/stocks/{symbol}` | `stock_evidence(conn, symbol)` | `200` `StockEvidenceResponse` |
| `GET /api/classifications/stocks/{symbol}/history` | `stock_history(conn, symbol, limit, cursor)` | `200` `StockHistoryResponse` |

`/summary` is declared before the parameterised paths, so the literal is
never captured as a path parameter (DAC-E3-S5-1).

### Classification requests

`GET /api/classifications` takes its query as `ClassificationListQuery`, which
forbids unknown keys. The model is flat because a query-parameter model cannot
nest:

| Parameter | Rule |
|-----------|------|
| `universe_id` | an optional UUID; scopes the list to the universe |
| `symbol` | an optional prefix, trimmed, upper-cased and shape-checked like a symbol |
| `sort` | one of `symbol` (default), `{value,growth,momentum}_score` and `{value,growth,momentum}_percentile` |
| `order` | `asc` (default) or `desc` |
| `{value,growth,momentum}_{score,percentile}_{min,max}` | the twelve optional `Decimal` bounds. A percentile bound lies in 0 to 100. NaN and infinity are refused by Pydantic's default for `Decimal` (DEC-0281) |
| `hide_incomplete` | boolean, default `false` |
| `limit` | 1 to `MAX_PAGE_SIZE` (500), default `DEFAULT_PAGE_SIZE` (50) |
| `cursor` | the previous page's `next_cursor` |
| `symbols` | compare: repeated or comma-separated symbols, each trimmed, upper-cased and shape-checked, duplicates dropped in first-seen order, `MIN_COMPARE_SYMBOLS` (2) to `MAX_COMPARE_SYMBOLS` (6) distinct |

`to_filters()` builds the reader's `ListFilters`. Its `Thresholds` carries
only the bounds the request named, with `hide_incomplete` and the `symbol`
prefix.

`symbols` takes no other parameter but `limit`. `compare_conflicts` reads
the names in the query string, not the model's `model_fields_set`, because
FastAPI fills the defaults of `sort`, `order` and `hide_incomplete` into it
(DEC-0281). Each other name the request carries is a `422 validation_error`
whose `loc` is that query field. Compare does not pass `limit` to the reader:
`reader.compare` reads at most `MAX_COMPARE_SYMBOLS` rows itself.

`/sets` and `/stocks/{symbol}/history` take `limit` (1 to 500, default 50)
and `cursor`. `set_id` is a UUID path parameter. The `{symbol}` path segment
is normalised and shape-checked by the `_symbol` dependency before the
reader; a malformed one is a `422 validation_error` with `loc`
`["path", "symbol"]`.

A query that fails these rules is a `422 validation_error` from the delivered
validation handler, which names fields and never echoes a value.

### Classification responses

Decimals serialise as decimal strings at stored precision: `_json` dumps each
model in Pydantic's JSON mode, as the universes routes do.

- `ClassificationListResponse` (list and compare): `set`, `never_classified`,
  `later`, `factors`, then `match_count`, `stocks`, `unknown_symbols` and
  `next_cursor`.
  - `set` is E1-S6's `SetBlock`, or null when no set is complete;
    `never_classified` is true exactly then.
  - `later` is `LaterBlock`: `set_id`, `state`, `started_at`, `ended_at`,
    `failure_reason`, `run_id`, `run_started_at`, or null.
  - `factors` maps `value`, `growth` and `momentum` to `qualified_count`,
    `ranked` and `min_peer_set_size`. While no set is complete each is the
    zero record, `0`, `false` and `MIN_PEER_SET_SIZE` (30) (DEC-0140).
  - each stock: `symbol`, `name`, `lifecycle` and `factors`, the three
    `FactorCellResponse` cells.
  - `match_count` counts the whole filtered scope, not the page.
    `unknown_symbols` is filled by compare only, and is `[]` on a list.
- `ClassificationSummaryResponse`: the same `set`, `never_classified`,
  `later` and `factors`, and `stocks_current` (`current_count`,
  `followed_count`), null while `set` is.
- `StockEvidenceResponse`: `set`, `symbol`, `name`, `lifecycle`, `factors`
  (the three cells by factor name), `inputs` (each `factor`, `input_name`,
  `label`, `status`, `value`, `as_of`, `known_on`, `restated_possible`,
  `detail`) and `memberships` (each `universe_id`, `name`).
- `StockHistoryResponse`: `symbol`, `sets` (each `set_id`,
  `classification_date`, `run_id`, `run_outcome`, `ended_at`, `factors`) and
  `next_cursor`.
- `SetResponse`: `set_id`, `state`, `classification_date`, `run_id`,
  `run_started_at`, `run_outcome`, `started_at`, `ended_at`,
  `failure_reason`, `latest_trading_day`, `active_instruments` and `factors`,
  the per-factor counts. `SetListResponse` is `sets` and `next_cursor`.

The list and the summary build `set`, `never_classified`, `later` and
`factors` through one builder, `_SetBlocks.parts`, so the two cannot drift
(DAC-E3-11, DAC-E3-S5-3). They have one shape before and after the first set
completes.

### Classification refusals

The router's own `REFUSALS` maps the reader's typed refusals (design 2.5,
DEC-0139):

| Exception | Status and `code` | `resource` |
|-----------|-------------------|------------|
| `reader.UniverseNotFound` | `404 universe_not_found` | `universe` |
| `reader.InstrumentNotFound` | `404 instrument_not_found` | `classification` |
| `reader.SetNotFound` | `404 classification_set_not_found` | `classification-set` |
| `CursorError` | `422 cursor_invalid` or `422 cursor_stale` | `classification` |

- `message` is `Could not <operation>: <reason>.`. `_reason` builds the
  reason only from the exception's own attributes (the universe id, the
  symbol or the set id), never from its text.
- `cursor_stale` is answered only on `GET /api/classifications`, for a list
  cursor the reader's own `decode_cursor` accepts for the set, sort and order
  the cursor names: a well-formed cursor for another set. Every other refused
  cursor, and every refused cursor on `/sets` and
  on `/history`, is `cursor_invalid` (DEC-0138). The cursor's values are used
  only to re-run the decoder, never to choose a page.

**Accepted warning from implementation review v3**
(`CAP-002-E3-S5-implementation-review-v3.md`), which fails no acceptance
criterion: `classification_models.py` defines the percentile bound twice,
`_PERCENTILE` for `Thresholds` and `_PERCENTILE_BOUND` for
`ClassificationListQuery`, and has two identical symbol-prefix validators. The
two are the same today and both are tested. A change to one must be made to
the other, or the saved filter and the list query drift apart (IR-001, low).

## Tests

- `tests/unit/test_api_classification_models.py`: request models and bounds,
  `ClassificationListQuery` included.
- `tests/unit/test_api_universes_routes.py`: the handlers over a doubled pool,
  service and reader.
- `tests/unit/test_api_classifications_routes.py`: the classification
  handlers over a doubled pool and reader: the reader call each route makes,
  route order, compare's conflicts and the response shapes.
- `tests/unit/test_api_classification_error_mapping.py`: both `REFUSALS`
  tables, messages, `resource` and `symbols`, and the `cursor_invalid` and
  `cursor_stale` choice.
- `tests/integration/test_api_universes.py`: the routes against PostgreSQL
  behind the real pool, service, replay and reader (marked `postgres`).
- `tests/integration/test_api_classifications.py` and
  `tests/integration/test_api_classification_summary.py`: the classification
  routes against PostgreSQL behind the real pool and reader, with sets seeded
  through `tests/integration/api_classification_support.py` (marked
  `postgres`). `test_a_universe_scopes_the_list_and_an_unknown_one_is_404`
  seeds its retired member with classified cells, which the engine never
  writes for a retired instrument. The reader's own suite pins the realistic
  case (review v3 IR-002, low).
- `tests/integration/test_api_classification_host_origin.py`: the Host and
  Origin checks on the universes and classification routes, against a real
  store (marked `postgres`).
