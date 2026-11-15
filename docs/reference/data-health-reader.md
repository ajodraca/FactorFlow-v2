# Data health reader

`src/factorflow/data_health/` holds the read-only reads behind the app shell
and the Data health screen (`component-design-data-health-reader.md` sections
2.1 to 2.4; CAP-003-E2-S1, CAP-003-E2-S2). `read_problems` and
`read_attention` and `read_data_health` exist (CAP-003-E2-S3 adds the last).
Nothing under `src/` calls the module yet: the `data-health-api` routes that
will (CAP-003-E2-S4) are not built.

| File | Holds |
|---|---|
| `__init__.py` | Re-exports `read_attention`, `read_data_health` and `read_problems` |
| `models.py` | The frozen dataclasses of the reads, in the domain vocabulary (no sentence, no tier; DEC-0200) |
| `queries.py` | The parameterised `SELECT` constants, one read each |
| `reader.py` | `read_problems`, `read_attention`, `read_data_health`, the private `_attention_items` and the private fold `_ChecksFold` |

The module writes nothing and edits no delivered file (DEC-0211). Neither
`queries.py` nor `reader.py` may contain an `INSERT`, `UPDATE`, `DELETE`,
`TRUNCATE`, `ALTER` or `DROP` token; `tests/unit/test_data_health_sql_is_read_only.py`
enforces it with the pattern of `tests/unit/test_sql_is_append_only.py`.
Every function takes the caller's `psycopg.Connection` and leaves commit and
rollback to the caller's `with pool.connection()` block. `cursor` and `limit`
are bound as psycopg parameters, never interpolated (SEC-INP-002).

## The problem set

A followed stock has a problem when its `instrument.lifecycle` is `active` and
any of its `acquisition_state` rows has `last_outcome` `failed` or
`not_found` (DEC-0201). A retired stock is in no count and no row. Each
failure's `reason`, `attempts` and `completed_at` come from the
`run_instrument_result` row matched on
`(last_run_id, instrument_id, data_type)`. A problem therefore leaves the set
only when a later download records `written` for that data type, or the stock
is retired; nothing else removes it.

`PROBLEM_COUNT_SQL` applies the same predicate to count the set: it returns
`stock_count`, `symbols` (the first three by symbol) and
`newest_completed_at`, under the aliases of the `Problems` fields.
`read_attention` is its caller; the count, the attention block and
`affected_count` are meant to be this one set (AC-16).

## `read_problems(conn, *, cursor, limit) -> ProblemPage`

Pages the problem set by symbol, using `PROBLEM_ROWS_SQL`.

- **Precondition, the caller's:** `cursor` is a normalised valid symbol or
  `None`, and `limit` is 1 to 500. `read_problems` validates neither.
- The query selects `limit + 1` distinct stocks with `symbol > cursor`, then
  returns every failure of those stocks ordered by `symbol, data_type`.
- `rows` holds at most `limit` `ProblemRow`s, in symbol order.
- `next_cursor` is the last kept symbol only when the extra stock exists, so a
  final page that is exactly full carries none.
- `ProblemRow.retryable` is true when any of its failures has outcome
  `failed`; a row whose failures are all `not_found` is not retryable
  (AC-14).

Version 1 shape: `Failure` has no `cause` field, and `retryable` does not
exclude `not_entitled`. Both are added in version 2 by CAP-003-E8-S6.

## `read_attention(conn) -> Attention`

The cheap aggregate the shell polls. It runs five fixed statements on the
caller's connection, in this order, whatever the roster size (AC-28), calls no
`coverage-service` function, and leaves the transaction to the caller.

| Statement | Gives |
|---|---|
| `FOLLOWED_COUNT_SQL` | `followed_count` (active instruments) and `checked_at`, the statement's `now()`, the caller's transaction start |
| `PRICES_AS_OF_SQL` | `prices_as_of`: the greatest `prices` `covered_to` over active instruments, or `None` |
| `PROBLEM_COUNT_SQL` | `problems` (see above) |
| `LATEST_DOWNLOAD_SQL` | the run with the greatest `requested_at` (ties: greater `run_id`), with its progress |
| `LATEST_TERMINAL_SQL` | the run with the greatest `ended_at` among `succeeded`, `partial`, `failed`, `cancelled` and `abandoned` (ties: greater `run_id`), with its `failure_reason` |

- `latest_download` and `latest_terminal_download` are two selections, so a
  running download never displaces the last ended one. Either is `None` when no
  such run exists.
- `Progress.done` counts the instruments holding a `run_instrument_result` for
  all four data types in that run. `Progress.total` is `instruments_named`, or
  `None` while that is 0 (DEC-0213 f). A run's `state` is returned as recorded.
- `credential_present` comes from the delivered
  `factorflow.config.settings.credential_present()`; the key's value is never
  read.
- `items` is built by `_attention_items`, in this order, each existing exactly
  while its cause holds (DEC-0203): `data_problems` (`problems.stock_count > 0`,
  `recorded_at` is `newest_completed_at`); `download_not_complete` (the latest
  terminal download is `failed` or `abandoned`, `recorded_at` is its `ended_at`,
  and it alone carries `run_id`); `credential_missing` (the key is absent,
  `recorded_at` is `checked_at`). Items carry no tier and no copy (DEC-0200).

## `read_data_health(conn) -> DataHealth`

The Data health aggregate (DEC-0201, DEC-0213, DEC-0220). The caller owns the
transaction.

1. `DATA_HEALTH_HEAD_SQL` gives `checked_at` (`now()`), `followed_count`
   (active instruments) and `latest_session`: the greatest `prices`
   `coverage_segment.covered_to` over active instruments, or `None`.
2. `read_coverage(conn, lifecycle="active", cursor=None, limit=MAX_LIMIT)` (500)
   is the delivered `coverage-service` function, called unchanged and paged to a
   null `next_cursor`. A `ValueError` from it propagates; nothing catches it.
3. If the first view's `never_acquired` is true, no further page is read and
   `daily_prices` and `company_financials` are `None`, never zero counts
   (AC-21). Otherwise each page is folded by `_ChecksFold.add_page` together
   with that page's `FUNDAMENTALS_STATE_SQL` rows (`last_outcome`,
   `last_acquired_at` per symbol, one statement per page), so memory holds one
   page and at most five symbols per check whatever the roster size.
4. `PROBLEM_COUNT_SQL` gives `affected_count`, the statement behind
   `Problems.stock_count` (DEC-0201), and `read_problems(conn, cursor=None,
   limit=50)` gives the first problem page.

The fold, per stock:

| Check | Counts | In the union (`exception_count`, first five `exception_symbols`) |
|---|---|---|
| Daily prices | `absent_count` (`presence["prices"]` is `absent` or `unknown`); `behind_count` (`covered_to` earlier than `latest_session`, never for a null `covered_to` or `latest_session`); `gap_stock_count` (`gaps.missing_days > 0`) | a stock with any of the three, counted once |
| Company financials | `absent_count` (`presence["fundamentals"]` is `absent` or `unknown`); `problem_count` (fundamentals `last_outcome` is `failed` or `not_found`); `as_of` (the greatest `last_acquired_at` among `written` rows) | a stock that is absent or has a problem, counted once |

- `DailyPricesCheck.status` is `exceptions` when absent, behind or gap counts
  sum above 0, else `not_determinable` when gap detection is unavailable, else
  `ok`. A page whose `gap_detection.available` is false makes it unavailable for
  the whole read and the first such page's `reason` is kept; `gap_stock_count`
  is then `None`.
- `CompanyFinancialsCheck.status` is `exceptions` or `ok`.
- Only the fundamentals `acquisition_state` row feeds `problem_count` and
  `as_of`; another data type's state is never read for a stock without one.

## Models

Defined in `models.py`, all `@dataclass(frozen=True)`:

- `Failure`: `data_type`, `outcome` (`failed` or `not_found`), `reason`
  (nullable), `attempts`, `completed_at`, `run_id`.
- `ProblemRow`: `symbol`, `failures` (tuple), `retryable`.
- `ProblemPage`: `rows` (tuple), `next_cursor` (nullable).
- `Attention`: `checked_at`, `followed_count`, `prices_as_of`,
  `credential_present`, `problems`, `latest_download`,
  `latest_terminal_download`, `items` (tuple of `AttentionItem`), with
  `Progress`, `LatestDownload`, `LatestTerminalDownload`, `Problems` and
  `AttentionItem` as its parts; `read_attention` builds them.

- `GapDetectionState`: `available`, `reason` (nullable).
- `DailyPricesCheck`: `status`, `absent_count`, `gap_stock_count` (nullable),
  `behind_count`, `latest_session` (nullable), `gap_detection`,
  `exception_count`, `exception_symbols`.
- `CompanyFinancialsCheck`: `status`, `absent_count`, `problem_count`, `as_of`
  (nullable), `exception_count`, `exception_symbols`.
- `DataHealth`: `checked_at`, `never_acquired`, `followed_count`,
  `affected_count`, `daily_prices` and `company_financials` (both `None`
  exactly when `never_acquired`), `problems` (the first page of 50);
  `read_data_health` builds them.

## Tests

`tests/unit/test_data_health_models.py` checks that the models' fields match
the design in order, that each is a frozen dataclass, and that the module
declares exactly the design's dataclasses.
`tests/integration/test_data_health_problems.py` runs `read_problems` against
a real PostgreSQL (`testcontainers[postgres]`, marked `postgres`): paging,
`retryable`, and the leaving of a problem on a later `written` or a retire.
`tests/integration/test_data_health_attention.py` does the same for
`read_attention` (marked `postgres`): the five statements at a small store and
at 3000 instruments, progress and its null total, the latest-versus-terminal
selection and its tie-breaks, and each item existing exactly while its cause
holds. `tests/unit/test_data_health_items.py` covers `_attention_items`, the
package export and that the reader calls `credential_present()` and never
reads the key.
`tests/unit/test_data_health_checks.py` covers the fold with fake coverage
pages: status, unknown presence, the union and its five-symbol cap across page
boundaries, `as_of`, the cross-page gap availability and reason, and the
package export. `tests/integration/test_data_health_checks.py` (marked
`postgres`) runs `read_data_health` against a real PostgreSQL: the paging call
sequence, error propagation, the never-acquired store, retired stocks and 3000
stocks over six pages (`slow`), a store with every group, `not_determinable`,
and that `problem_count` and `as_of` come from the fundamentals row only.
