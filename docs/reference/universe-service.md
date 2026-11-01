# Universe service

`src/factorflow/universes/` holds named, dated sets of acquired instruments
(`component-design-universe-service.md` sections 2.3 to 2.5 and 3). A
universe's state is never stored: it is replayed from the append-only
`universe_event` log that migration `0005_universes.sql` adds beside the
`universe` table. `replay.py` is the read half (CAP-002-E1-S2); `service.py`
is the writer and re-exports or delegates to the replay types and paged reads
(DEC-0093). It creates by hand and adds members (CAP-002-E1-S3), renames,
removes a member and retires (CAP-002-E1-S4), and creates from a filter
(CAP-002-E1-S5). Its reads are in `universes/sql/`; its writes are inline
constants in `service.py`.

The classification API's `/api/universes` routes call the service
(`src/factorflow/api/routes/universes.py`, CAP-002-E1-S6; see
[`classification-api.md`](classification-api.md)); they also page
`replay.list_universe_rows` for the list's counts. The only other import of
the package from elsewhere under `src/` is the classification reader's import
of `MEMBERSHIP_AS_OF_SQL` from `replay.py`. The service imports `Thresholds`,
`current_set` and `evaluate_filter` from `factorflow.classification.reader`;
the reader never imports the service, so there is no cycle.

Every function takes the caller's `psycopg.Connection`. Neither module issues
`COMMIT` itself and neither catches a database error. But on a
connection with no transaction open, such as one fresh from the API's pool, a
write's `with conn.transaction():` block is psycopg's outer transaction and
commits when it exits (see the classification API's
[accepted warning IR-001](classification-api.md#transactions)).

## Writes

Every write runs inside `with conn.transaction():`, so a refusal raised inside
it writes nothing. Its first statement is
`SELECT pg_advisory_xact_lock(UNIVERSE_WRITE_LOCK_KEY)` (`2002_0001`, one key
for every universe write, DEC-0065). Every check after it is made by replay
under that lock, so a write that waited sees what the lock holder committed:
two concurrent creates of one name cannot both succeed, and a write queued
behind a retire is refused as retired. The service issues `INSERT` only, never
`UPDATE` or `DELETE` (DEC-0057).

| Function | Does | Returns |
|---|---|---|
| `create_by_hand(conn, name, symbols)` | Appends a `universe` row, one `created` event and one `member_added` event per distinct symbol | The replayed `Universe` |
| `add_members(conn, universe_id, symbols)` | Appends one `member_added` event per symbol that is not a current member. An empty list is a no-op (DEC-0095) | `(added, already_member)`, both ascending |
| `create_from_filter(conn, name, set_id, thresholds)` | Appends a `universe` row, one `created` event carrying `filter_provenance`, and one `member_added` event per stock the filter matches, in symbol order. See [Create from a filter](#create-from-a-filter) | The replayed `Universe`, `origin.kind` `from_filter` |
| `rename(conn, universe_id, name)` | Appends one `renamed` event. The id, `created_at`, history and members are unchanged. Renaming to the universe's own current name is allowed and appends an event (DEC-0096) | The replayed `Universe` |
| `remove_member(conn, universe_id, symbol)` | Appends one `member_removed` event. Coverage is not consulted | The event's `recorded_at` |
| `retire(conn, universe_id)` | Appends one `retired` event. Members, name and history stay readable | The replayed `Universe`, `lifecycle` `retired` |

### Order of checks

Each write takes the lock, then checks in this order and raises the first
refusal that applies:

| Function | Checks, in order |
|---|---|
| `create_by_hand` | name shape, symbol shape, coverage, name in use, empty |
| `add_members` | symbol shape, coverage, universe known, universe active |
| `create_from_filter` | name shape, set currency, empty, name in use |
| `rename` | name shape, universe known, universe active, name in use by another active universe |
| `remove_member` | symbol shape, universe known, universe active, current member, last member |
| `retire` | universe known, universe active |

So a malformed name or symbol is a plain `ValueError` even against an unknown
or retired universe, and `add_members` reports uncovered symbols before an
unknown universe.

- **Name shape.** The name is trimmed; an empty result raises `ValueError`.
  No length bound is enforced.
- **Name in use.** Another *active* universe holds exactly the trimmed name,
  found by paging `list_universe_rows`. A retired universe's name is free.
- **Symbol shape.** Symbols are normalised to upper case, deduplicated and
  sorted. More than `MAX_SYMBOLS_PER_REQUEST` raw symbols, or any symbol that
  fails `factorflow.instruments.symbols.is_valid`, raises `ValueError`.
  `remove_member` takes one symbol through the same rule.
- **Coverage.** A symbol is covered when an `instrument` row with that symbol
  has at least one `coverage_segment`, whatever the instrument's lifecycle
  (`coverage_check.sql`, `COVERAGE_CHECK_SQL`). `create_from_filter` makes no
  coverage check: its members are the reviewed filter result.
- **Set currency.** `create_from_filter` reads `current_set(conn)` after the
  lock. The call is refused unless a complete set exists and its `set_id`
  equals the requested one. A later `building` or `failed` set is not a change.
- **Current member and last member.** Membership is checked before the
  last-member rule, so `LastMember` is raised only when the removal would leave
  the universe empty.

### Create from a filter

`create_from_filter` saves the result of the classification list's threshold
filter as a universe (AC-2, design 2.4).

- **Members.** Exactly `evaluate_filter(conn, set_id, thresholds)`, the
  reader's own list statement, so the list and the saved universe apply one
  predicate (DEC-0076, DEC-0085). The whole `Thresholds` is passed unchanged:
  the twelve bounds, `hide_incomplete` and the `symbol` prefix. The returned
  ids are deduplicated and resolved to instruments in one read
  (`_INSTRUMENTS_BY_ID_SQL`), ordered by symbol, and written in that order. An
  empty result raises `EmptyUniverse` before the name check.
- **Provenance.** The `created` event's `filter_provenance` is a JSON object
  with exactly five keys:

  | Key | Value |
  |---|---|
  | `set_id` | The requested set's id, as a string |
  | `classification_date` | The current set's `classification_date`, ISO format |
  | `thresholds` | Only the bounds that were set, keyed by the query-parameter names the reader uses (`{factor}_score_min` and so on); `{}` without bounds |
  | `hide_incomplete` | Always present, `true` or `false` |
  | `symbol` | The search prefix, or `null` without a search |

- **Bound encoding (DEC-0248).** A bound is a `Decimal`. An integral one is
  written as a JSON integer, any other as a JSON number through `float`.
  `replay.origin_from_provenance` reads each back as `Decimal(str(value))`, so
  a bound with more than 15 significant digits reads back as the nearest
  double. Two bounds that `Thresholds` accepts cannot be written: a
  non-integral bound above the largest double encodes as `Infinity`, which
  PostgreSQL rejects, and an integral bound of 4300 or more digits raises
  `ValueError`. Either is raised after the filter is evaluated, and nothing is
  written.
- **Immutability.** Membership is replayed from the events only. A later
  classification set changes nothing a saved universe holds (DAC-E1-S5-6).

## Refusals

| Exception | Base | Raised when |
|---|---|---|
| `UniverseNotFound` | `LookupError` | No universe has the id |
| `UniverseRetired` | `ValueError` | The universe is retired. Every write to it is refused: `rename`, `add_members`, `remove_member` and `retire` |
| `UniverseNameInUse` | `ValueError` | Another active universe holds the name |
| `EmptyUniverse` | `ValueError` | A create by hand has no members, or a filter matches no stock |
| `InstrumentNotAcquired` | `ValueError` | Any symbol is not covered. `symbols` names every one, sorted, and the whole request is refused |
| `NotAMember` | `LookupError` | `remove_member`'s symbol is not a current member. The message names the normalised symbol |
| `LastMember` | `ValueError` | `remove_member` would remove the sole current member. The message ends `retire the universe instead` |
| `ClassificationSetChanged` | `ValueError` | `create_from_filter`'s `set_id` is not the current complete set. `requested_set_id` is the requested id; `current_set_id` the current one, or `None` when no set is complete |

## Reads

Reads take no lock.

| Function | Returns |
|---|---|
| `get_universe(conn, universe_id, as_of=None)` (service) | The `Universe` replayed as of `as_of`, default today; `UniverseNotFound` for an unknown id |
| `list_universes(conn, lifecycle, name_prefix, limit, cursor)` (service) | One page of replayed `Universe`s, newest first, and the next cursor |
| `list_events(conn, universe_id, limit, cursor)` (service) | One page of `UniverseEvent`s by `event_id` descending, and the next cursor; `UniverseNotFound` for an unknown id |
| `current_state(conn, universe_id, as_of=None)` (replay) | The `Universe`, or `None` for an unknown id |
| `membership_as_of(conn, universe_id, as_of)` (replay) | The `Member`s at the end of `as_of`, ordered by symbol |
| `list_universe_rows(conn, lifecycle, name_prefix, limit, cursor)` (replay) | One page of `UniverseRow`s, newest first by `(created_at, universe_id)`, and the next cursor |
| `fold_members(events, as_of)` (replay) | The pure statement of `membership_as_of.sql`: `instrument_id` to the selected add's `recorded_at` |

`lifecycle` is `active`, `retired` or `all`; anything else raises `ValueError`.
`limit` must be 1 to `MAX_PAGE_SIZE`, else `ValueError`. `name_prefix` matches
with `starts_with`, so `%` and `_` are literal. Cursors are versioned URL-safe
base64 JSON; a malformed, empty or wrong-version cursor raises `CursorError`.

### Replay rules

- **Membership.** For each instrument, the highest `event_id` among its
  `member_added` and `member_removed` events recorded on or before `as_of`
  decides; it is a member when that event is `member_added`, with
  `member_since` its `recorded_at`. Dates are the `recorded_on` column, the
  America/Chicago date (DEC-0065). A retired instrument stays a member and
  replays with `lifecycle` `retired`.
- **Name and lifecycle.** The name is the latest `renamed` event's, else the
  `created` event's. The universe is `retired`, with `retired_at` that event's
  `recorded_at`, once it has a `retired` event. Both are the current values
  whatever `as_of` is; only the members vary with it.
- **Before creation.** An `as_of` before the `created` event's date returns no
  members and `as_of_before_creation` true, with `created_on` the creation date.
- **Origin.** A `created` event without `filter_provenance` is
  `Origin(kind="by_hand", ...)` with every other field `None`; with it,
  `kind="from_filter"` and the set, date, thresholds, `hide_incomplete` and
  `symbol` it records.

## Returned shapes

All are frozen dataclasses defined in `replay.py`.

| Type | Fields |
|---|---|
| `Universe` | `universe_id`, `name`, `lifecycle`, `created_at`, `retired_at`, `members`, `origin`, `as_of`, `as_of_before_creation`, `created_on` |
| `Member` | `instrument_id`, `symbol`, `lifecycle` (the instrument's), `member_since` |
| `Origin` | `kind`, `set_id`, `classification_date`, `thresholds`, `hide_incomplete`, `symbol` |
| `UniverseEvent` | `event_id`, `event_type`, `name`, `symbol`, `recorded_at`, `recorded_on`, `filter_provenance` |
| `UniverseRow` | `universe_id`, `name`, `lifecycle`, `created_at`, `retired_at` |
| `ReplayEvent` | `event_id`, `event_type`, `instrument_id`, `recorded_at`, `recorded_on` |

## The event log

`universe_event` takes five event types: `created`, `renamed`,
`member_added`, `member_removed` and `retired`. Its constraints require an
instrument on exactly the two member events, a name on exactly `created` and
`renamed` (trimmed and non-empty), and `filter_provenance` only on `created`.
Partial unique indexes allow one `created` and one `retired` event per
universe. `tests/unit/test_research_sql_is_append_only.py` checks that no
statement updates or deletes either universe table, and
`tests/unit/test_universe_sql_safety.py` that every statement in the package
uses placeholders only, never string formatting; the lock statement is the one
positional placeholder.
