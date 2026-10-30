# Classification engine

`src/factorflow/classification/engine.py` is the factor engine's build
transaction (CAP-002-E2-S2; `component-design-factor-engine.md` sections 2.1
to 2.4). With it come `constants.py`, `line_items.py` and nine statements in
`classification/sql/`: `set_context.sql`, `complete_set.sql` and
`fail_set.sql` for the transaction, `statements.sql`, `value_inputs.sql`,
`growth_inputs.sql` and `insert_inputs.sql` for the fundamentals stage
(CAP-002-E2-S3), and `peer_sets.sql` and `classify.sql` for the
classification stage (CAP-002-E2-S5). `build` either commits a whole
classification set or records the set `failed` with its reason, so no reader
ever sees half a set.

Two stages are registered, in this order. The first derives the value and
growth inputs of every active instrument and writes them to `factor_input`
(see [Fundamental inputs](#fundamental-inputs)). The second forms each
factor's peer set from the set's `factor_input` rows and writes every
instrument's classification on each factor (see
[Classification](#classification)). No stage derives a momentum input yet, so
`momentum` has 0 qualifying stocks and every active instrument is
`not_classified` on it with `not_enough_stocks`. Only the
[classification scheduler](classification-scheduler.md) calls `build`, and
no running process starts it yet.

## `build`

`build(conn, set_id, timeout_seconds) -> BuildResult` takes a
`psycopg.Connection`, the id of a `classification_set` row, and the build
timeout in seconds.

It raises `ValueError` before running any statement, leaving the set as it
was, when:

- `timeout_seconds` is zero or negative, because a `statement_timeout` of 0
  would disable the timeout;
- the connection has `autocommit` on;
- the connection is already inside a transaction, open or aborted.

Otherwise it runs one transaction, in this order:

1. `SET TRANSACTION ISOLATION LEVEL REPEATABLE READ` (DEC-0111). Every stage
   reads the same snapshot, so a row another connection commits during the
   build is not seen (DAC-E2-9).
2. `statement_timeout` is set local to this transaction through
   `set_config('statement_timeout', ..., true)`. The value is whole
   milliseconds, rounded up and never 0: 0.0004 s is sent as `1` and
   300.0004 s as `300001`. The session's own `statement_timeout` is the same
   after the build as before, whether the build succeeded or failed.
3. `set_context.sql` reads the set's [`BuildContext`](#buildcontext). An
   unknown `set_id` raises `LookupError`. When no active instrument holds a
   daily bar, the latest trading day is `NULL` and the build raises
   `ValueError("no price data held for any active instrument")` (DEC-0114).
4. Each stage in `_STAGES` runs in list order (see [Stages](#stages)).
5. `complete_set.sql` moves the set from `building` to `complete`. It sets
   `ended_at`, `latest_trading_day` and `active_instruments`, the size of the
   active roster. When the guard `state = 'building'` matches no row because
   another writer already ended the set, `build` raises
   `RuntimeError("classification set is no longer building")` inside the
   transaction.
6. This set's `classification_set_factor` rows are read into
   `qualified_counts`. The query is the inline constant
   `_QUALIFIED_COUNTS_SQL`, not a file.
7. One commit. The stages' rows and the completion are committed together or
   not at all.

On success `build` returns a `BuildResult` with `state="complete"`,
`failure_reason=None`, `active_instruments` equal to the active roster's size
and `qualified_counts` mapping each factor to its count. The classification
stage writes a count for each of the three factors, 0 included.

### Failure

Any `Exception` raised from step 1 through the commit takes the same path.
That covers a stage's own exception, `QueryCanceled` from the timeout, and the
`LookupError`, `ValueError` and `RuntimeError` above.

1. The transaction is rolled back, taking every row the attempt wrote with it
   (DAC-E2-10).
2. The reason is the exception's class name, a colon and a space, then the
   first line of its message, such as `RuntimeError: first`. An empty message
   still gives the class (`RuntimeError: `). No traceback is ever part of the
   reason.
3. The failure is logged at `ERROR` on the `factorflow.classification.engine`
   logger as `classification build failed: <reason>`. The record carries the
   exception and its traceback (`exc_info`) and `set_id` as an `extra` field.
   The traceback goes to the log only.
4. In a new transaction, at the connection's default isolation level and
   without the build's timeout, `fail_set.sql` moves the set from `building`
   to `failed`, sets `ended_at` and stores the reason, then commits. A set
   another writer already ended keeps that writer's reason and `ended_at`, and
   an unknown `set_id` updates no row.
5. `build` returns a `BuildResult` with `state="failed"`, the reason,
   `active_instruments=0` and `qualified_counts={}`. It does not raise.

A build that exceeds its timeout fails the set with a reason beginning
`QueryCanceled:`, followed by PostgreSQL's message naming the statement
timeout.

A failure while recording the failure, for example a lost connection, is not
caught. It propagates out of `build`, and the set stays `building` until
`reclaim_interrupted_sets` in `scheduler.py` records it `failed` (DEC-0067).

## `BuildContext`

A frozen dataclass read once by `set_context.sql` and passed to every stage.
No stage can rebind its fields.

| Field | Value |
|---|---|
| `set_id` | The set being built |
| `run_id` | The acquisition run the set reflects |
| `classification_date` | The set's `classification_date` |
| `latest_trading_day` | The latest `session_date` of any `daily_bar` held for an active instrument, or `None` when there is none. Retired instruments' bars are ignored, and `observed_on` plays no part |
| `active_ids` | The `instrument_id` of every active instrument, ascending; `()` when there is none |
| `retired_ids` | The `instrument_id` of every retired instrument, ascending; `()` when there is none |

`set_context.sql` takes no row lock. It reads inside the build's snapshot like
every later statement.

## Stages

A stage is `Callable[[psycopg.Connection, BuildContext], None]`. It runs
inside the build transaction and writes through the connection it is given.
`_STAGES` holds two stages, `_fundamental_inputs_stage` and then
`_classification_stage`, which is appended by the last
statement of the module. The docstring under `_STAGES` records the order later
stages must be registered in (DEC-0121, amending DEC-0112). Tests replace the
list with `monkeypatch`.

## Fundamental inputs

`_fundamental_inputs_stage` derives five inputs for every instrument in
`active_ids` (CAP-002-E2-S3; DEC-0115): `book_to_price`, `earnings_yield` and
`fcf_yield` for the `value` factor, and `revenue_growth` and `eps_growth` for
`growth`. It binds the set's dates and active roster,
`FUNDAMENTALS_STALE_AFTER_MONTHS` and the [line items](#line-items), then runs
four statements on one cursor:

1. `statements.sql` creates the temporary table `stmt`.
2. `value_inputs.sql` creates the temporary table `inputs` holding the value
   inputs.
3. `growth_inputs.sql` inserts the growth inputs into `inputs`.
4. `insert_inputs.sql` appends the `value` and `growth` rows of `inputs` to
   `factor_input`.

Both temporary tables are `ON COMMIT DROP`. Only the last statement writes to
the store. Below, `D` is the set's `classification_date` and `L` its
`latest_trading_day`.

### Statement windows

`stmt` holds one row per active instrument, statement type
(`balance_sheet`, `income_statement` or `cash_flow_statement`) and quarterly
`fiscal_period_end` on or before `D`. The row is that period's latest
observation, by `observed_on` and then `recorded_at`, and earlier observations
are left as they are. Rows with `fiscal_period = 'FY'` are excluded before the
latest observation is chosen, so an annual row never displaces a quarter that
shares its period end. Each row carries:

- `backfilled`: the row's `provider_filing_date` is earlier than the first
  `observed_on` of any fundamental row held for the instrument (DEC-0056). A
  null filing date gives `false`.
- `period_rank`: 1 for the newest period end of its statement type (P1), 2
  for the next (P2), and so on.
- `ttm_slot`: 1 to 4 on P1 to P4 when the trailing window is formed, else
  null.
- `prior_slot`: 1 to 4 on P5 to P8 when the prior-year window is formed, else
  null.

The windows follow DEC-0221, which replaces the 12-month span rule in design
section 2.4. Two adjacent period ends are consecutive when the older is at
most 4 months before the newer. The trailing window is formed when P1 to P4
are consecutive, and the prior-year window when all of P1 to P8 are. Too few
periods, or a gap of more than 4 months inside the window, leaves it unformed.
Each statement type is windowed on its own.

### Value and growth inputs

Each line item is read from a row's `payload` under its payload key and
multiplied by its sign. A value is used only when it is a JSON number or a
JSON string holding a plain decimal (`^-?[0-9]+(\.[0-9]+)?$`), checked before
the cast. Anything else, including an absent key or JSON `null`, reads as
absent rather than failing the set (DEC-0116 (4)).

| Input | Value | Rows read |
|---|---|---|
| `book_to_price` | `book_equity` / market capitalisation | The newest balance sheet |
| `earnings_yield` | Trailing sum of `net_income` / market capitalisation | The newest balance sheet and the trailing window's income statements |
| `fcf_yield` | (trailing sum of `operating_cash_flow` minus trailing sum of `capital_expenditure`) / market capitalisation | The newest balance sheet and the trailing window's cash flow statements |
| `revenue_growth` | Trailing sum of `revenue` / prior-year sum, minus 1 | The trailing and prior-year windows' income statements |
| `eps_growth` | Trailing sum of `diluted_eps` / prior-year sum, minus 1 | The trailing and prior-year windows' income statements |

The newest balance sheet is the one at P1 and needs no window. Market
capitalisation is the close of the instrument's latest bar times
`shares_outstanding` from the newest balance sheet (DEC-0055 (6)). The latest
bar is the one with the latest `session_date`, then the latest `observed_on`,
then the latest `recorded_at` (DEC-0055 (5), DEC-0117 (1)). Growth inputs read
no bar.

### Status

Every input gets one status, decided in this order: `missing`, then
`outdated`, then `not_computable`, else `present` (DEC-0116 (1)). The causes
of `missing` are also tested in the order listed, and the first that applies
is named.

| Status | When | `detail.cause` |
|---|---|---|
| `missing` | A line item the input needs has no payload key yet | `line_item_mapping_unresolved` |
| `missing` | The instrument has no quarterly balance sheet (value inputs), or a window the input needs is not formed | `periods_missing` |
| `missing` | A needed line item is absent from a row read | `line_item_absent` |
| `missing` | Value inputs only: the instrument has no bar (DEC-0116 (2)) | `price_missing` |
| `outdated` | `as_of` is earlier than `D` minus `FUNDAMENTALS_STALE_AFTER_MONTHS` months, or, for a value input, the latest bar's `session_date` is earlier than `L` (AC-13) | `outdated` |
| `not_computable` | Value inputs: market capitalisation is zero or less | `market_capitalisation_not_positive` |
| `not_computable` | Growth inputs: the prior-year sum is zero or less (DEC-0055 (2)) | `prior_year_base_not_positive` |
| `present` | Otherwise | none |

A latest period end exactly 6 months before `D` is still current.

### Dates

- `value` is set only on a `present` input. `as_of` and `known_on` are set on
  every input that is not `missing`, and null on a `missing` one
  (DEC-0116 (5)).
- `as_of` is P1 of the income statements for a growth input. For a value
  input it is the earliest of the newest period ends it read, so
  `earnings_yield` takes the earlier of the newest balance sheet and the
  newest income statement (DEC-0116 (3)). The fundamentals staleness test uses
  the same date.
- `known_on` is the latest `observed_on` of every statement row the input
  read, and of its bar for a value input (DEC-0055 (7)).
- `restated_possible` is always `false` from this stage. The `backfilled`
  flags are kept in `detail.periods` (DEC-0056, DEC-0122).

### `detail`

| Status | Keys |
|---|---|
| `present`, value input | `periods`, `balance_sheet_period_end`, `shares_outstanding`, `close`, `bar_date`, `bar_observed_on`, `market_capitalisation` |
| `present`, growth input | `periods` |
| `outdated` | The `present` keys, plus `cause` and `outdated`. `outdated.fundamentals` holds `latest_period_end` and `stale_before`, and, for a value input, `outdated.prices` holds `bar_date` and `latest_trading_day`. Only the rules that applied appear |
| `not_computable` | The `present` keys plus `cause`. A growth input also has `prior_year_base` |
| `missing` | `cause`. `line_items` names the unresolved or absent items for those two causes. `periods_found` is present for `periods_missing` and `line_item_absent` |

`periods` lists each statement row the input read, with its `statement_type`,
`fiscal_period_end`, `observed_on`, `provider_filing_date` and `backfilled`.
`periods_found` lists every quarterly period in `stmt` of the statement types
the input reads, as `statement_type` and `fiscal_period_end`, and is `[]` when
there is none. Both are ordered newest first within each statement type.

### Writing to `factor_input`

`insert_inputs.sql` appends the rows of `inputs` whose factor is in its
`factors` parameter, `['value', 'growth']` for this stage. A `missing` row's
`detail` gains `last_acquisition` (`data_type`, `outcome`, `acquired_at`),
taken from the instrument's `acquisition_state` row for the data type it
lacks: `prices` for `price_missing`, `fundamentals` for every other cause
(AC-12). When the instrument has no such row, `detail` is written as derived.

`factor_input.value` is `numeric(30, 10)`. A present value of magnitude 1e20
or more does not fit, and the insert fails the build.

## Classification

`_classification_stage` classifies every instrument on each factor
(CAP-002-E2-S5; `component-design-factor-engine.md` section 2.5). It runs two
statements on one cursor:

1. `peer_sets.sql`, once, writes one `classification_set_factor` row per
   factor.
2. `classify.sql`, once per factor in `FACTORS` order (`value`, `growth`,
   `momentum`), writes that factor's `factor_classification` rows.

The stage binds the set's `set_id`, `active_ids` and `retired_ids`. It reads
`FACTORS`, `INPUT_NAMES`, `INPUT_LABELS` and `MIN_PEER_SET_SIZE` from
`constants.py` when it runs, not at import, so a test can patch the floor.
Both statements read the committed `factor_input` rows of the build's own set,
inside the build transaction (DEC-0119). Neither reads a universe table, so a
stock's score and percentile on a factor are the same whatever universes it
belongs to (AC-8). Neither reads the `inputs` temporary table.

### Stage order

`_STAGES.append(_classification_stage)` is the last statement of `engine.py`,
and a stage that writes inputs is registered above it (DEC-0121). Peer sets
are formed from those inputs, so they must be written first.
`tests/unit/test_classification_stage_order.py` fails when
`_fundamental_inputs_stage` or `_momentum_inputs_stage` is registered after
`_classification_stage`. When neither is registered, the check passes
vacuously.

### Peer sets

A stock qualifies on a factor when it is in `active_ids` and the set holds a
`present` `factor_input` row for every input of the factor: three for `value`
and `momentum`, two for `growth` (DAC-E2-2). An input with no row counts as
missing. Rows of another set, and rows of an instrument not on the active
roster, are ignored. A retired instrument is therefore in no peer set, even
when it has `present` rows (DAC-E2-8).

`peer_sets.sql` writes a row for every factor, even one no stock qualifies on.
`qualified_count` is the number of qualifying stocks. `ranked` is true when
that count is at least `MIN_PEER_SET_SIZE`, 30 (AC-14, DAC-E2-7).

### Scores and percentiles

For a ranked factor, `classify.sql` scores the peer set with PostgreSQL window
functions, and no numeric library (DEC-0052, DEC-0053):

1. Each input is z-scored over the peer set: the value minus the input's mean,
   divided by its sample standard deviation (`stddev_samp`).
2. The composite is the equal-weight mean of the stock's z-scores.
3. The score is the composite re-standardised the same way, so the peer set's
   scores have mean 0 and standard deviation 1.
4. The percentile is `100 * percent_rank()` over the peer set, ordered by
   score, so it runs from 0 to 100.

A standard deviation of exactly 0 contributes 0 instead of dividing by zero
(DAC-E2-3). An input with one value across the peer set gives every stock a
z-score of 0 on it, and a constant composite gives every stock a score of 0.
There is no tolerance (DEC-0228): when inputs cancel exactly but numeric
rounding leaves the composite a tiny spread, that spread is re-standardised
like any other. No winsorisation or other outlier step is applied.

The percentile is ranked on the unrounded score. Migration
`0006_classifications.sql` stores `score` as `numeric(18, 6)` and `percentile`
as `numeric(9, 6)`, rounded to six decimal places. Two different scores that
round to the same stored value therefore keep different percentiles. Equal
unrounded scores share a percentile. The lowest score has percentile 0, and the highest
has 100 unless another stock ties it.

### Rows written

`classify.sql` writes one `factor_classification` row for every instrument in
`active_ids` and `retired_ids`. `score` and `percentile` are set on a
`classified` row and null on every other.

| Instruments | `status` | `reason_code` | `reason_input` | `reason_detail` |
|---|---|---|---|---|
| Peer set of a ranked factor | `classified` | null | null | null |
| Every other active instrument, factor ranked | `not_classified` | `input_missing`, `input_outdated` or `input_not_computable` | The first input not `present` | The input's label and status, such as `free-cash-flow yield missing` |
| Every active instrument, factor not ranked | `not_classified` | `not_enough_stocks` | null | `<qualified_count> of 30 stocks qualified`, such as `29 of 30 stocks qualified` |
| Every retired instrument | `not_classified` | `retired` | null | null |

- The input named is the first, in the factor's `INPUT_NAMES` order, whose row
  is not `present`. An absent row is named as `missing` (AC-12, DEC-0120).
  `reason_code` is `input_` followed by that status.
- `reason_detail` is the input's label from `constants.INPUT_LABELS`, a space,
  and the status in words: `missing`, `outdated` or `not computable`. The
  labels reach `classify.sql` as the bound array `input_labels`, parallel to
  `input_names`, and the statement holds no label text (DEC-0120, DEC-0130).
- The 30 in the unranked sentence is the bound `min_peer_set_size`, so it is
  always the floor in force.
- `restated_possible` is `false` on every row. CAP-002-E2-S6 carries the
  restatement mark onto the classification (DEC-0121).

### Static checks

`tests/unit/test_classify_sql_static.py` needs no database. It holds the two
statements to these rules:

- Each reads `factor_input`, and never a universe table or the `inputs`
  temporary table.
- Each takes only the stage's `%(name)s` parameters.
- `peer_sets.sql` writes only `classification_set_factor`, and `classify.sql`
  only `factor_classification`.
- `classify.sql` calls `avg`, `stddev_samp` and `percent_rank`, and holds none
  of the label text.

It also asserts that no module under `classification/` imports `numpy`,
`scipy`, `pandas` or `statistics`. `INPUT_LABELS` must have exactly one label
per input name, and the labels must equal the product vocabulary.

## Statements

All nine are loaded once, at import, from `classification/sql/`. They ship as
package data (`classification/sql/*.sql` under
`[tool.setuptools.package-data]` in `pyproject.toml`). Every value is bound as
a `%(name)s` parameter.

| Statement | Effect |
|---|---|
| `set_context.sql` | One row: the set's id, run and classification date, the latest trading day, and the active and retired rosters. No row for an unknown set |
| `complete_set.sql` | `building` to `complete`, with `ended_at = now()`, `latest_trading_day` and `active_instruments`. Guarded by `set_id` and `state = 'building'` |
| `fail_set.sql` | `building` to `failed`, with `ended_at = now()` and `failure_reason`. Guarded by `set_id` and `state = 'building'` |
| `statements.sql` | Creates the temporary table `stmt`: the latest observation of each quarterly statement period on or before the classification date, with `backfilled`, `period_rank`, `ttm_slot` and `prior_slot`. Writes no stored table |
| `value_inputs.sql` | Creates the temporary table `inputs` holding the three value inputs of every active instrument. Writes no stored table |
| `growth_inputs.sql` | Inserts the two growth inputs of every active instrument into `inputs`. Writes no stored table |
| `insert_inputs.sql` | Appends the rows of `inputs` for the factors in `factors` to `factor_input`, adding `last_acquisition` to a `missing` row's `detail` |
| `peer_sets.sql` | Inserts one `classification_set_factor` row per factor: how many active instruments have every input of the factor `present`, and whether that count reaches the floor |
| `classify.sql` | Inserts one factor's `factor_classification` rows: the score and percentile of each stock in a ranked factor's peer set, and a `not_classified` row with its reason for every other active or retired instrument |

## Constants

`constants.py` holds the numbers and names classification is built on. Each
value cites its source in the code. `engine.py` reads
`FUNDAMENTALS_STALE_AFTER_MONTHS` in the fundamentals stage, which binds it as
`stale_months`, and `FACTORS`, `INPUT_NAMES`, `INPUT_LABELS` and
`MIN_PEER_SET_SIZE` in the classification stage.

| Name | Value | Source |
|---|---|---|
| `MIN_PEER_SET_SIZE` | `30` | AC-14, owner decision 2026-10-12 |
| `FUNDAMENTALS_STALE_AFTER_MONTHS` | `6` | AC-13 |
| `MOMENTUM_LAG_MONTHS` | `1` | Capability section 2: skip the most recent month |
| `MOMENTUM_WINDOWS_MONTHS` | `(3, 6, 12)` | Capability section 2 |
| `FACTORS` | `("value", "growth", "momentum")` | Capability section 2 |
| `INPUT_NAMES` | `value`: `book_to_price`, `earnings_yield`, `fcf_yield`; `growth`: `revenue_growth`, `eps_growth`; `momentum`: `return_3m`, `return_6m`, `return_12m` | Mirrors the `factor_input_name_matches_factor` check in migration `0006_classifications.sql` (DEC-0112) |
| `INPUT_LABELS` | `book_to_price`: `book-to-price`; `earnings_yield`: `earnings yield`; `fcf_yield`: `free-cash-flow yield`; `revenue_growth`: `revenue growth`; `eps_growth`: `earnings-per-share growth`; `return_3m`: `3-month total return`; `return_6m`: `6-month total return`; `return_12m`: `12-month total return` | Factor-engine section 10, reader design 2.6, UX brief section 2 item 9 (DEC-0120) |

## Line items

`line_items.py` names the seven fundamentals line items that the value and
growth inputs are derived from (`component-design-factor-engine.md` section
2.4). `LINE_ITEMS` maps each key to a frozen `LineItem(label, statement_type,
payload_key, sign)`. The `label` is the product's word for the item.

| Key | Label | Statement type |
|---|---|---|
| `book_equity` | book equity | `balance_sheet` |
| `shares_outstanding` | shares outstanding | `balance_sheet` |
| `net_income` | net income | `income_statement` |
| `diluted_eps` | diluted earnings per share | `income_statement` |
| `revenue` | revenue | `income_statement` |
| `operating_cash_flow` | operating cash flow | `cash_flow_statement` |
| `capital_expenditure` | capital expenditure | `cash_flow_statement` |

The Massive payload key, sign and quarterly availability of each item are an
open owner question (system design section 8, question 1). Until it is
answered, every `payload_key` is `REQUIRES_INPUT`
(`"[REQUIRES INPUT: Massive payload key]"`) and every `sign` is `1`. A sign of
`-1` would mark an item the provider reports as a negative outflow. Nothing is
guessed.

- `unresolved()` lists the keys whose payload key is still `REQUIRES_INPUT`.
  Today that is all seven.
- `UNRESOLVED_CAUSE` (`"line_item_mapping_unresolved"`) is defined beside
  them as the cause of an input left missing by an unresolved line item
  (DAC-E2-S2-5). `value_inputs.sql` and `growth_inputs.sql` write it as
  `detail.cause`.
- `_line_item_parameters()` in `engine.py` binds the seven items for the
  fundamentals stage as parallel arrays of names, statement types, payload
  keys and signs, with `unresolved()` and `UNRESOLVED_CAUSE`. It reads
  `LINE_ITEMS` when called, not at import. A `REQUIRES_INPUT` key is bound as
  `None`, so the sentinel never reaches SQL. With every key unresolved today,
  every value and growth input is `missing` with this cause, and the build
  still completes.
- `tests/unit/test_line_items_resolved.py` (TC-COMP-059) asserts
  `unresolved() == []` under a strict `xfail` (DEC-0113). While any key is
  unresolved, the suite reports it as an expected failure (`xfailed`). Once
  every key is resolved, the strict XPASS fails the suite until the marker is
  removed.

## Safety rules

`tests/unit/test_engine_sql_safety.py` (TC-COMP-160) holds every file under
`src/factorflow/classification/` to these rules, the scheduler's files
included:

- No module imports `factorflow.ingestion.massive`.
- No `.execute` call builds its statement with an f-string, `%` or `+`.
- No statement updates, deletes from or upserts into an observation table
  (`instrument_reference`, `daily_bar`, `fundamental_observation`,
  `corporate_action`) or an append-only research table (`universe`,
  `universe_event`, `classification_set_factor`, `factor_input`,
  `factor_classification`), and none merges into a research table.
- Every `UPDATE` of `classification_set` is guarded by `state = 'building'`,
  and none deletes from it.

The engine's own files are held to more. `complete_set.sql` and
`fail_set.sql` must also be guarded by `set_id = %(set_id)s`. No engine module
builds a statement with `.format(`. The engine's statements use only
`%(name)s` parameters, never braces or `||` concatenation. Each engine file is
checked once it exists, so a later story's files are covered without editing
the test.
