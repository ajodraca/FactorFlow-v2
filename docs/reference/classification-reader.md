# Classification reader

`src/factorflow/classification/reader.py` is the read side of classification
(`component-design-classification-reader.md` sections 2.3 and 2.4). It
resolves the current set, the later attempt beside it and the set summary. Its
two statements are in `classification/sql/`. This is CAP-002-E3-S1; the list,
compare, evidence and history reads are later stories.

No route or other module calls the reader yet: nothing under `src/` imports
`factorflow.classification.reader`.

Every function takes the caller's `psycopg.Connection`. The reader writes
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

`summary` raises `RuntimeError("summary.sql returned no row")` if the
aggregate returns no row, which an ungrouped aggregate does not do.

## Returned shapes

All five are frozen dataclasses.

| Type | Fields |
|---|---|
| `CurrentSet` | `set_id`, `classification_date`, `run_id`, `run_started_at` (the acquisition run's `started_at`, DEC-0083), `run_outcome` (the run's state, `succeeded` or `partial`), `state`, `started_at`, `ended_at`, `latest_trading_day`, `active_instruments`, `factors` (a `FactorSummary` per name in `FACTORS`), `not_current` |
| `LaterSet` | `set_id`, `state`, `run_id`, `run_started_at`, `started_at`, `ended_at` (nullable), `failure_reason` (nullable) |
| `FactorSummary` | `qualified_count` and `ranked`, from the set's `classification_set_factor` row; `min_peer_set_size`, the constant `MIN_PEER_SET_SIZE` (30) |
| `StocksCurrent` | `current_count`; `followed_count`, the current set's `active_instruments` |
| `Summary` | `set`, `never_classified` (true exactly when `set` is `None`), `later`, `stocks_current` (`None` while `set` is). It has the same fields in every state (DAC-E3-S1-3) and holds no stock rows |

The module re-exports `FACTORS` and `MIN_PEER_SET_SIZE` from `constants.py`
(see [Constants](classification-engine.md#constants)).

## Stocks current

A stock is current when none of its `factor_input` rows in the current set is
`missing` or `outdated` (AC-13, DAC-E3-10). A `not_computable` input does not
count against it, and an unranked factor changes no stock's currency.
`current_count` counts the stocks with at least one `factor_input` row in the
set that are current; a complete set with no inputs counts zero.

## Statements

Both are loaded once, at import, from `classification/sql/`, which ships as
package data. They are exposed as `CURRENT_SET_SQL` and `SUMMARY_SQL`.

| Statement | Parameters | Result |
|---|---|---|
| `current_set.sql` | none | One row, or none when no set exists. The current set's columns with its run's `state` and `started_at` and its factor rows as one `jsonb` object, beside `later_*` columns. A `FULL JOIN` of the two, so either side's columns are null when it is absent |
| `summary.sql` | `%(set_id)s` | One row: `current_count` and `scored_roster`, the number of stocks with any `factor_input` row in the set. The reader uses `current_count` only |

`tests/unit/test_reader_sql_read_only.py` holds each file to one statement
beginning `WITH` or `SELECT` with no write keyword. The engine's
[safety rules](classification-engine.md#safety-rules) apply to these files too.

Migration `0006_classifications.sql` gives both statements an index path:
`idx_classification_set_complete_recent` for the current set,
`idx_classification_set_started` for `later`, and the `factor_input` and
`classification_set_factor` keys. `test_summary_and_current_set_are_served_from_indexes`
checks that, with sequential scans off, neither plan scans those three tables
whole. The planner's choice at full volume is CAP-002-E3-S4's test.
