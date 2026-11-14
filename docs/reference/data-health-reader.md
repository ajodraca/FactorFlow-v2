# Data health reader

`src/factorflow/data_health/` holds the read-only reads behind the app shell
and the Data health screen (`component-design-data-health-reader.md` sections
2.1, 2.2 and 2.4; CAP-003-E2-S1). Only `read_problems` exists so far;
`read_attention` and `read_data_health` follow in CAP-003-E2-S2 and
CAP-003-E2-S3 on the same models and queries. Nothing under `src/` calls the
module yet: the `data-health-api` routes that will (CAP-003-E2-S4) are not
built.

| File | Holds |
|---|---|
| `__init__.py` | Re-exports `read_problems` |
| `models.py` | The frozen dataclasses of the reads, in the domain vocabulary (no sentence, no tier; DEC-0200) |
| `queries.py` | The parameterised `SELECT` constants, one read each |
| `reader.py` | `read_problems` |

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
`newest_completed_at`, under the aliases of the `Problems` fields. It has no
caller yet; the count, the attention block and `affected_count` are meant to
be this one set (AC-16).

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

## Models

Defined in `models.py`, all `@dataclass(frozen=True)`:

- `Failure`: `data_type`, `outcome` (`failed` or `not_found`), `reason`
  (nullable), `attempts`, `completed_at`, `run_id`.
- `ProblemRow`: `symbol`, `failures` (tuple), `retryable`.
- `ProblemPage`: `rows` (tuple), `next_cursor` (nullable).

`models.py` also defines the shapes that later stories fill: `Progress`,
`LatestDownload`, `LatestTerminalDownload`, `Problems`, `AttentionItem`,
`Attention`, `GapDetectionState`, `DailyPricesCheck`, `CompanyFinancialsCheck`
and `DataHealth`. Nothing builds them yet.

## Tests

`tests/unit/test_data_health_models.py` checks that the models' fields match
the design in order, that each is a frozen dataclass, and that the module
declares exactly the design's dataclasses.
`tests/integration/test_data_health_problems.py` runs `read_problems` against
a real PostgreSQL (`testcontainers[postgres]`, marked `postgres`): paging,
`retryable`, and the leaving of a problem on a later `written` or a retire.
