# Classification API

The classification API is the CAP-002 HTTP surface over the universe service
and the classification reader (`component-design-classification-api.md`
sections 2.1, 2.4 to 2.7). Its universes router is in place (CAP-002-E1-S6);
the `/api/classifications` routes are a later story (CAP-002-E3-S5).

| File | Holds |
|------|-------|
| `src/factorflow/api/routes/universes.py` | The eight `/api/universes` route handlers, the refusal table `REFUSALS` and the response shaping |
| `src/factorflow/api/classification_models.py` | The Pydantic request and response models. CAP-002-E3-S5 appends the classification models and reuses `Thresholds`, `FactorCellResponse` and `SetBlock` from here |
| `src/factorflow/api/classification_bounds.py` | The bounds this API adds: `MIN_COMPARE_SYMBOLS` (2), `MAX_COMPARE_SYMBOLS` (6) and `MAX_UNIVERSE_NAME_LENGTH` |

`app.py` registers the router with one `include_router(universes.router)`, so
every universes route is behind the delivered request-id, Host and Origin
middleware and error envelope (see the README's
[Running the API](../../README.md#running-the-api)). The routes validate,
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

## Tests

- `tests/unit/test_api_classification_models.py`: request models and bounds.
- `tests/unit/test_api_universes_routes.py`: the handlers over a doubled pool,
  service and reader.
- `tests/unit/test_api_classification_error_mapping.py`: `REFUSALS`, messages,
  `resource` and `symbols`.
- `tests/integration/test_api_universes.py`: the routes against PostgreSQL
  behind the real pool, service, replay and reader (marked `postgres`).
- `tests/integration/test_api_classification_host_origin.py`: the Host and
  Origin checks on the universes routes, against a real store (marked
  `postgres`).
