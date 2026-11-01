# Classification reader

`src/factorflow/classification/reader.py` is the read side of classification
(`component-design-classification-reader.md` sections 2.3 and 2.4). It
resolves the current set, the later attempt beside it and the set summary
(CAP-002-E3-S1), serves the classification list and the `evaluate_filter`
predicate (CAP-002-E3-S2, design sections 2.5 and 2.7), and compares 2 to 6
stocks and reads one stock's evidence and universe memberships (CAP-002-E3-S3,
design sections 2.5 and 2.6). Its six statements are in `classification/sql/`.
The history read is a later story.

Its callers under `src/` are the classification API's `/api/universes`
routes, which page `list_classifications` scoped to a universe to fill each
member's name and cells (CAP-002-E1-S6; see
[`classification-api.md`](classification-api.md#responses)), and the universe
service, whose `create_from_filter` imports `Thresholds`, `current_set` and
`evaluate_filter` (CAP-002-E1-S5; see
[`universe-service.md`](universe-service.md#create-from-a-filter)). The reader
imports `MEMBERSHIP_AS_OF_SQL` from `factorflow.universes.replay`, never the
universe service, so the service imports the reader without a cycle
(`test_reader_does_not_import_the_universe_service`). No module under `src/`
calls `compare` or `stock_evidence` yet; the `/api/classifications` routes that
will are CAP-002-E3-S5's.

Every function that reads the database takes the caller's `psycopg.Connection`. The reader writes
nothing, never commits and catches no database error. Every value it returns
is a stored column; nothing is recomputed (DAC-E3-S1-6).

## The current set and `later`

- **Current set**: the set in state `complete` with the latest `ended_at`.
- **`later`**: the set with the latest `started_at` among the sets started
  after the current set. While no set is complete it is the set with the
  latest `started_at` of all (DEC-0082, DEC-0126). It is in any state; with the
  engine as built it is `building` or `failed`.
- **`not_current`**: true exactly when `later` is not `None`.

| Sets in the database | `set` | `later` |
|---|---|---|
| None | `None` | `None` |
| Only `building` or `failed` sets | `None` | The most recently started one |
| A complete set and nothing started after it | The current set | `None` |
| A complete set and a newer `building` or `failed` set | The current set, `not_current` true | The newer set, with its `failure_reason` when failed |

## Functions

| Function | Returns |
|---|---|
| `read_set_blocks(conn)` | `(CurrentSet \| None, LaterSet \| None)` from one run of `current_set.sql`. The one definition of the `set` and `later` blocks; the summary uses it and the later reads are to reuse it (DAC-E3-11) |
| `current_set(conn)` | The first element of `read_set_blocks` |
| `summary(conn)` | A `Summary`. With no complete set: `set=None`, `never_classified=True`, `later` as above and `stocks_current=None`, without running `summary.sql`. Otherwise it runs `summary.sql` for the current set |
| `list_classifications(conn, filters)` | A `ClassificationPage`: one page of the scored stocks in scope for the current set. See [The list](#the-list) |
| `compare(conn, symbols)` | A `ClassificationPage` of 2 to 6 stocks side by side, with `unknown_symbols` filled. See [Compare](#compare) |
| `stock_evidence(conn, symbol)` | A `StockEvidence`: one stock's cells, inputs and memberships, or `InstrumentNotFound`. See [Stock evidence](#stock-evidence) |
| `evaluate_filter(conn, set_id, thresholds)` | The instrument ids the unscoped list matches in `set_id` for `thresholds`, unpaginated and sorted by id. It runs the list statement itself, so the list and the universe filter snapshot apply one predicate (DAC-E3-2, DAC-E3-S2-7) |
| `resolve_sort(value)` | The `SORT_ALLOWLIST` expression for `value`; `ValueError` for anything else |
| `encode_cursor(set_id, sort, order, key, key_is_null, symbol)` | The cursor for the position after a row. See [Cursors](#cursors) |
| `decode_cursor(cursor, *, set_id, sort, order)` | `(key, key_is_null, symbol)`, or `CursorError` |
| `escape_like(prefix)` | `prefix` with `\`, `%` and `_` escaped for `LIKE ... ESCAPE '\'` |

`summary` raises `RuntimeError("summary.sql returned no row")` if the
aggregate returns no row, which an ungrouped aggregate does not do.

## Returned shapes

All thirteen are frozen dataclasses.

| Type | Fields |
|---|---|
| `CurrentSet` | `set_id`, `classification_date`, `run_id`, `run_started_at` (the acquisition run's `started_at`, DEC-0083), `run_outcome` (the run's state, `succeeded` or `partial`), `state`, `started_at`, `ended_at`, `latest_trading_day`, `active_instruments`, `factors` (a `FactorSummary` per name in `FACTORS`), `not_current` |
| `LaterSet` | `set_id`, `state`, `run_id`, `run_started_at`, `started_at`, `ended_at` (nullable), `failure_reason` (nullable) |
| `FactorSummary` | `qualified_count` and `ranked`, from the set's `classification_set_factor` row; `min_peer_set_size`, the constant `MIN_PEER_SET_SIZE` (30) |
| `StocksCurrent` | `current_count`; `followed_count`, the current set's `active_instruments` |
| `Summary` | `set`, `never_classified` (true exactly when `set` is `None`), `later`, `stocks_current` (`None` while `set` is). It has the same fields in every state (DAC-E3-S1-3) and holds no stock rows |
| `Thresholds` | `bounds` (a `dict` of up to twelve `Decimal` bounds), `hide_incomplete` (default `False`), `symbol` (a prefix, default `None`). The one filter object for the list, compare and the universe snapshot. See [Validation](#validation) |
| `ListFilters` | `universe_id` (default `None`), `symbols` (default `None`; compare's 2 to 6 symbols, see [Validation](#validation)), `sort` (default `symbol`), `order` (default `asc`), `thresholds` (default an empty `Thresholds`), `limit` (default `DEFAULT_PAGE_SIZE`, 50), `cursor` (default `None`) |
| `ClassificationPage` | `set`, `never_classified`, `later` (as on `Summary`), `match_count`, `stocks` (a `StockRow` list), `unknown_symbols` (always `[]` from the list; filled by `compare`), `next_cursor` |
| `StockRow` | `instrument_id`, `symbol`, `name`, `lifecycle`, `factors` (a `FactorCell` per name in `FACTORS`) |
| `FactorCell` | `status` (`classified` or `not_classified`), `score`, `percentile`, `reason_code`, `reason_input`, `reason_detail`, `restated_possible`, each the stored `factor_classification` column |
| `StockEvidence` | `set` (the current set, or `None` when no set is complete), `symbol`, `name`, `lifecycle`, `factors` (a `FactorCell` per stored cell, keyed by factor), `inputs` (an `InputRow` list), `memberships` (a `Membership` list) |
| `InputRow` | `factor`, `input_name`, `label` (from `INPUT_LABELS`, never the input name; STD-UI-1), `status` (`present`, `missing`, `outdated` or `not_computable`), `value`, `as_of`, `known_on`, `restated_possible`, `detail` (the stored `jsonb` as a `dict`), each but `label` the stored `factor_input` column |
| `Membership` | `universe_id`, `name` |

The module re-exports `FACTORS`, `INPUT_LABELS` and `MIN_PEER_SET_SIZE` from
`constants.py` (see [Constants](classification-engine.md#constants)),
`MIN_COMPARE_SYMBOLS` (2) and `MAX_COMPARE_SYMBOLS` (6) from
`factorflow.api.classification_bounds`, and `CursorError` from
`factorflow.runs.queries`. It also exports `INPUT_REASONS`, the three reason
codes `hide_incomplete` acts on: `input_missing`, `input_outdated` and
`input_not_computable` (DEC-0079). `UniverseNotFound` is a `LookupError`
carrying the `universe_id`. `InstrumentNotFound` is a `LookupError` carrying
the upper-cased `symbol`; it is the reader's own class, not the Massive
client's error of the same name.

## Stocks current

A stock is current when none of its `factor_input` rows in the current set is
`missing` or `outdated` (AC-13, DAC-E3-10). A `not_computable` input does not
count against it, and an unranked factor changes no stock's currency.
`current_count` counts the stocks with at least one `factor_input` row in the
set that are current; a complete set with no inputs counts zero.

## The list

`list_classifications` reads the `set` and `later` blocks through
`read_set_blocks`, so a page carries the same blocks as the summary. Before any
set is complete it returns `set=None`, `never_classified=True`, `later`,
`match_count=0`, no stocks and no cursor, without running the list statement.

- **Scope.** Unscoped, the stocks with `lifecycle` `active`; with `symbols`
  set, retired stocks too (DEC-0133). With `universe_id`,
  the universe's members today, retired members kept (DAC-E3-S2-3). "Today" is
  `datetime.now(America/Chicago).date()`, and the members are read with
  `MEMBERSHIP_AS_OF_SQL` at that date. An unknown `universe_id` raises
  `UniverseNotFound`; a retired universe is still a scope (DEC-0128).
  `symbols` keeps only those symbols, and the `Thresholds` symbol prefix only
  symbols that begin with it, matched literally. Only stocks with at least one
  `factor_classification` row in the set are listed.
- **Bounds.** A bound applies only where the stock is `classified` on the
  bound's factor. A stock not classified on that factor stays listed and
  counted (DAC-E3-S2-1, DEC-0081). Bounds are inclusive, and bounds on several
  factors intersect.
- **`hide_incomplete`.** Hides a stock when any of its three cells has a
  reason code in `INPUT_REASONS`. `not_enough_stocks` and `retired` never hide
  a stock (DAC-E3-S2-2, DEC-0079).
- **`match_count`.** The number of stocks matching the scope and filter,
  counted once over the whole result, never the page. Every page of one query
  carries the same count, and an empty page or a page past the end still
  carries it (DAC-E3-S2-4).
- **Sort.** `sort` is a key of `SORT_ALLOWLIST`: `symbol`, or
  `{factor}_score` or `{factor}_percentile` for each factor, seven in all.
  `order` is `asc` or `desc`. Rows not classified on the sort factor, whose
  key is null, come after every classified row in both orders. Ties, and the
  null rows, are ordered by symbol ascending.
- **Name.** A stock's `name` is the `company_name` of its latest
  `instrument_reference` row, by `recorded_at` then `value_hash`, or `None`
  when it has none (DEC-0245, provisional).
- **Cells.** Each cell is the stored row, with its stored `restated_possible`
  (DAC-E3-S2-6). A stock in scope with no row for one of the three factors is
  a data-integrity error: the reader raises `ValueError` naming the instrument
  and the factor (task plan Open Gap 7).

`evaluate_filter` runs the same statement unscoped, sorted by symbol and
unpaginated, for the `set_id` it is given rather than the current set.

### Validation

`Thresholds` and `ListFilters` refuse a bad value with `ValueError` when they
are constructed, before any statement runs.

| Field | Accepted |
|---|---|
| `Thresholds.bounds` | Keys `{factor}_{score\|percentile}_{min\|max}` only; each value a finite `Decimal`; a percentile bound from 0 to 100, both inclusive |
| `Thresholds.hide_incomplete` | A `bool` |
| `Thresholds.symbol` | `None`, or a string whose upper case matches `^[A-Z][A-Z0-9.-]{0,15}$`. It is stored upper-cased |
| `ListFilters.symbols` | `None`, or `MIN_COMPARE_SYMBOLS` to `MAX_COMPARE_SYMBOLS` (2 to 6) entries, each a string matching `^[A-Z][A-Z0-9.-]{0,15}$` as given (`instruments.symbols.is_valid`); `compare` upper-cases and deduplicates them first (DEC-0127) |
| `ListFilters.sort` | A key of `SORT_ALLOWLIST` |
| `ListFilters.order` | `asc` or `desc` |
| `ListFilters.limit` | An `int`, not a `bool`, from 1 to `MAX_PAGE_SIZE` (500), both inclusive |

### Cursors

Pagination is keyset. The reader fetches `limit + 1` rows, and when the extra
row exists it returns `limit` rows and a `next_cursor` for the position after
the last one. A full last page has no cursor.

The cursor is URL-safe base64 of a JSON object, without padding, with exactly
the fields `v` (version 1), `set`, `sort`, `order`, `key` (the last row's sort
key as a string, or `null`), `null` (whether the key is null), `sym` (the last
row's symbol) and `chk`. `chk` is the first 16 hex characters of a SHA-256 of
the other fields as canonical JSON. It detects an altered cursor; it is not a
signature (DEC-0246).

The reader raises `CursorError` for a cursor that:

- is empty, is not base64 JSON, or is not an object;
- has another version, or other fields;
- fails its `chk`;
- has a null key on the `symbol` sort, or a key that is not a string;
- on a factor sort, has a key that is not a finite decimal, is outside its
  column's range (an absolute value of 10^12 or more for a score, 10^3 or more
  for a percentile), or is finer than six decimal places;
- was issued for another set, sort or order.

All but the last are checked before the set is read, so a malformed cursor
runs no statement.

## Compare

`compare(conn, symbols)` is `list_classifications` with `symbols` set, sorted
by symbol ascending, with default `Thresholds` and `limit` 6, so it applies
the list's one statement, cell model and stored `restated_possible`
(DAC-E3-S3-1, DAC-E3-12). It runs no statement of its own.

- **Symbols.** Each is upper-cased, and duplicates are dropped in first-seen
  order, before `ListFilters` checks the count and the shape. A request that
  repeats one symbol therefore counts it once. A non-string symbol raises
  `ValueError`. A bad request runs no statement.
- **Rows.** Every known symbol is returned, retired and incomplete stocks
  included (DEC-0133), in symbol order whatever the request order.
- **`unknown_symbols`.** The requested symbols, normalised and in request
  order, with no row on the page: a symbol that names no instrument, or an
  instrument with no row in the current set (DAC-E3-S3-2, DEC-0131).
- **No complete set.** The list's never-classified page is returned unchanged,
  with `unknown_symbols` `[]` (task plan Open Gap 4).

## Stock evidence

`stock_evidence(conn, symbol)` reads one stock's evidence in the current set
(design 2.6; AC-17, DAC-E3-8). It upper-cases `symbol` and does no other
rewriting or shape check (DEC-0132). It runs three statements: `current_set.sql`
through `read_set_blocks`, `stock_evidence.sql` and `stock_memberships.sql`.

- **Unknown symbol.** No instrument with that symbol raises
  `InstrumentNotFound` before memberships are read.
- **Stock.** `symbol`, `lifecycle`, and `name`, the latest stored reference
  name or `None`, as in the list (DEC-0245, provisional). A retired stock is
  read like any other, with its stored `retired` cells (DAC-E3-S3-4).
- **`factors`.** The stock's stored `factor_classification` rows of the
  current set, keyed by factor in `FACTORS` order. Nothing is derived: each
  column, `reason_detail` and `restated_possible` included, is the stored one.
  Unlike the list, a missing factor row raises nothing; the dict holds what is
  stored.
- **`inputs`.** Every `factor_input` row of the stock in the current set, in
  `FACTORS` order and then each factor's `INPUT_NAMES` order, with its stored
  `value`, `as_of`, `known_on`, `restated_possible` and `detail`. An input's
  `restated_possible` is its own column, independent of the cell's
  (DAC-E3-12).
- **No current set.** With no complete set, `set` is `None` and `factors` and
  `inputs` are empty, with the same fields; a set still `building` is not read
  (DAC-E3-S3-5, DEC-0131, provisional). `memberships` is still read.
- **`memberships`.** The active universes the stock currently belongs to, by
  name and then `universe_id` (DEC-0134). See
  [Statements](#statements).

## Statements

All six are loaded once, at import, from `classification/sql/`, which ships
as package data. They are exposed as `CURRENT_SET_SQL`, `SUMMARY_SQL`,
`LIST_SQL`, `UNIVERSE_EXISTS_SQL`, `EVIDENCE_SQL` and `MEMBERSHIPS_SQL`.

| Statement | Parameters | Result |
|---|---|---|
| `current_set.sql` | none | One row, or none when no set exists. The current set's columns with its run's `state` and `started_at` and its factor rows as one `jsonb` object, beside `later_*` columns. A `FULL JOIN` of the two, so either side's columns are null when it is absent |
| `summary.sql` | `%(set_id)s` | One row: `current_count` and `scored_roster`, the number of stocks with any `factor_input` row in the set. The reader uses `current_count` only |
| `list_classifications.sql` | `set_id`, `scoped`, `member_ids`, `symbol_pattern`, `symbols`, the twelve bounds, `hide_incomplete`, `input_reasons`, `limit_plus_one`, `k`, `ksym` | One row carrying `match_count` and nothing else when the page is empty; otherwise one row per stock on the page, each carrying `match_count` and the stock's columns with seven per factor (`{factor}_status`, `_score`, `_percentile`, `_reason_code`, `_reason_input`, `_reason_detail`, `_restated_possible`) |
| `universe_exists.sql` | `%(universe_id)s` | One row: whether a universe with that id exists, retired or not |
| `stock_evidence.sql` | `symbol`, `set_id` (null with no current set), `factor_order`, `input_order` | Rows over one column list, told apart by `row_kind`: an `instrument` row first (none when the symbol is unknown), then the stock's `cell` rows and its `input` rows of the set, ordered by the bound `FACTORS` and input-name arrays. A null `set_id` matches no cell or input row |
| `stock_memberships.sql` | `%(instrument_id)s` | One row per active universe the instrument belongs to (`universe_id`, `name`), ordered by name and then `universe_id`. It reads `universe_event` directly: the latest `member_added` or `member_removed` event per universe decides membership (DEC-0057), the latest `created` or `renamed` event gives the name, and a universe with a `retired` event is left out |

`list_classifications.sql` has three substitution slots, filled with
`str.format` before it runs: `{sort_expr}`, from `SORT_ALLOWLIST`; `{order}`,
`ASC` or `DESC`; and `{keyset}`, a fixed fragment chosen in code (`true` on the
first page). Every value is a bound parameter, so no request text reaches the
SQL (SEC-INP-002). `test_list_statement_placeholders_are_the_documented_ones`
holds the file to those three slots and to `%(name)s` placeholders.

`tests/unit/test_reader_sql_read_only.py` holds each of the six files to one statement
beginning `WITH` or `SELECT` with no write keyword, and the two evidence
statements to bound `%(name)s` parameters with no `{` slot (SEC-INP-002). The engine's
[safety rules](classification-engine.md#safety-rules) apply to these files too.

Migration `0006_classifications.sql` gives both statements an index path:
`idx_classification_set_complete_recent` for the current set,
`idx_classification_set_started` for `later`, and the `factor_input` and
`classification_set_factor` keys. `test_summary_and_current_set_are_served_from_indexes`
checks that, with sequential scans off, neither plan scans those three tables
whole. The planner's choice at full volume is CAP-002-E3-S4's test. The list
statement's plan has no test in this story.
