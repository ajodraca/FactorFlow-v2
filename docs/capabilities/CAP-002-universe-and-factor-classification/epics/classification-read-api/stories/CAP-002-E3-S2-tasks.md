---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S2-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-10-30
last_reworked_review: CAP-002-E3-S2-implementation-review-v1.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T23:10:00Z
  source_artifacts:
    - id: CAP-002-E3-S2
      version: "1"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-classification-reader-component-tests
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E3-S2 — Classification List Read and the Single evaluate_filter Predicate

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S2.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E3-tasks`
**Date**: 2026-10-17

## Summary

Adds to `src/factorflow/classification/reader.py` the sorted, filtered, searched,
counted list of scored stocks: `list_classifications`, the one filter predicate
`evaluate_filter`, and the `Thresholds`, `ListFilters`, `FactorCell`, `StockRow`
and `ClassificationPage` models, with `sql/list_classifications.sql` (scope and
`matched` CTEs, `match_count`, keyset page). Sorting resolves through a fixed
allowlist of column expressions and the cursor is a versioned opaque value bound
to its set, sort and order, so no request text reaches SQL (SEC-INP-002). A
universe scope reuses E1's membership replay instead of restating it
(SA-DUP-001). `evaluate_filter` runs the same statement as the list, so the list
read, compare (E3-S3) and `universe-service`'s snapshot (E1-S5) apply one
predicate: twelve bounds, `hide_incomplete` and the symbol prefix. The page
carries the `set` and `later` blocks that E3-S1's `read_set_blocks` produces, and
every cell carries the stored `restated_possible`. No compare, evidence, history
or sets read is built here.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-9 | Every classified cell carries score and percentile as stored (serve side) | T007, T014, T016, T019 |
| AC-16 | Sort by any factor metric, thresholds on several factors, whole-scope, unscoped and universe | T003, T004, T005, T006, T010, T011, T012, T013, T015, T016, T017, T018, T019, T020 |
| AC-23 | `restated_possible` on the listed cell (read-through) | T008, T014, T019 |
| DAC-E3-2 | One predicate for list, compare, snapshot | T005, T010, T012, T020 |
| DAC-E3-3 | A threshold excludes only a stock classified on that factor that fails it | T006, T016, T019 |
| DAC-E3-4 | `hide_incomplete` hides input reasons only | T007, T016, T019 |
| DAC-E3-5 | Unscoped list is active only; universe scope keeps retired | T009, T016, T018, T019 |
| DAC-E3-6 | `match_count` over the whole filtered scope, same on every page | T010, T016, T019 |
| DAC-E3-12 | Restatement mark on every cell (list half) | T008, T014, T019 |
| DAC-E3-S2-1 | Threshold excludes only classified failing stocks | T006, T019 |
| DAC-E3-S2-2 | `hide_incomplete` hides only the three input reasons | T007, T016, T019 |
| DAC-E3-S2-3 | Unscoped list active only; universe scope keeps `retired` | T009, T018, T019 |
| DAC-E3-S2-4 | `match_count` identical on every page | T010, T019 |
| DAC-E3-S2-5 | Sort allowlist rejects; cursor round-trips and rejects tampering | T003, T004, T015, T017 |
| DAC-E3-S2-6 | Restated value or growth cell carries `restated_possible` | T008, T014, T019 |
| DAC-E3-S2-7 | All-null thresholds match every stock in scope | T005, T011, T020 |

Mapped component test cases (all mandatory): TC-COMP-096 (DAC-E3-S2-1), TC-COMP-108
(DAC-E3-S2-2), TC-COMP-112 (DAC-E3-S2-3), TC-COMP-120 (DAC-E3-S2-4), TC-COMP-121
(DAC-E3-S2-5), TC-COMP-189 (DAC-E3-S2-6), TC-COMP-122 (DAC-E3-S2-7). TC-COMP-113
(retired stock compared or read as evidence) traces to DAC-E3-S3-4 and TC-COMP-123
to DAC-E3-S3-1; both belong to CAP-002-E3-S3 and are not planned here. The coverage
matrix lists no integration or end-to-end test for this story's criteria.

## Phase 1: Setup

**Purpose**: Confirm what this story imports exists and give the list tests a way to seed scored cells and universes.

- [x] T001 Confirm the producers exist before any code is written; STOP and report if one is missing rather than creating it here. (a) From CAP-002-E3-S1: `src/factorflow/classification/reader.py` exporting `read_set_blocks`, `CurrentSet`, `LaterSet`, `FACTORS` (defined by CAP-002-E2-S2's `constants.py`, re-exported), and `tests/integration/reader_seed.py` with `insert_instrument`, `insert_run`, `insert_set`, `insert_input`. (b) From CAP-002-E1-S2: `src/factorflow/universes/replay.py` holding the `membership_as_of.sql` text as a module constant; the design names the file, not the constant, and this plan expects `MEMBERSHIP_AS_OF_SQL` (the `GAPS_SQL` pattern of `src/factorflow/coverage/gaps.py`; DEC-0128). If replay.py exposes it under another name, import that name and record it in the review hand-off; if it exposes no SQL text at all, STOP. Also confirm `factorflow.universes.__init__` does not import `factorflow.universes.service` (a later import of the reader by the service would otherwise be a cycle; T005 pins it). (c) From CAP-002-E2-S1: migrations `0005_universes.sql` and `0006_classifications.sql` (tables `universe`, `universe_event`, `factor_classification`). (d) CAP-001 code already in the repo: `src/factorflow/api/bounds.py` (`DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE`) and `CursorError` in `src/factorflow/runs/queries.py`. (e) From CAP-002-E2-S2, reached through CAP-002-E3-S1's hard edge: `tests/unit/test_engine_sql_safety.py` (CAP-002-E2-S2 T010, TC-COMP-160) applies its brace, `||` and `%(name)s`-only checks, and its ban on a `.format(` call as an `.execute(` argument, only to the factor-engine design 2.1 file set (`engine.py`, `line_items.py`, `constants.py` and the ten engine `.sql` files). To the rest of `classification/` it applies only its package-wide rules: no `factorflow.ingestion.massive` import; no f-string, `%` or `+` expression as an `.execute(` argument; no `UPDATE` or `DELETE` on observation or append-only tables; `state = 'building'` on every `UPDATE classification_set`. If it still applies the brace or `.format(` rules to every `classification/sql/*.sql` or every `classification/**/*.py`, STOP and report it rather than editing it or the design-pinned `{sort_expr}`, `{order}` and `{keyset}` slots. Nothing is edited by this task.
- [x] T002 Extend the seeding helper `tests/integration/reader_seed.py` (created by CAP-002-E3-S1; add functions only, change none of its signatures, bound parameters only): `insert_classification(conn, set_id, instrument_id, factor, status="classified", *, score=None, percentile=None, reason_code=None, reason_input=None, reason_detail=None, restated_possible=False)` honouring `factor_classification_shape` and `factor_classification_reason_input_agrees` (a `classified` row needs `score` and `percentile`; an input reason needs `reason_input`); `insert_universe(conn, name, instrument_ids) -> UUID` that inserts the `universe` row, a `created` event with `name`, and one `member_added` event per instrument (`recorded_on` takes its default); `retire_universe(conn, universe_id)` that inserts the `retired` event; and `seed_scored_stock(conn, set_id, symbol, *, value=(score, percentile) | reason, growth=..., momentum=..., lifecycle="active", restated=()) -> int` that creates the instrument and its three `factor_classification` rows in one call so a list test seeds a stock in one line. A reason argument is a tuple `(reason_code, reason_input_or_None)`. Add no fixture to `tests/conftest.py`; tests use `migrated_run_schema_connection`.

**Checkpoint**: Producers confirmed present; a test can seed a complete set with scored and unscored stocks, retired instruments and universes in a migrated database.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define the filter models, sort and cursor rules, and the list semantics from the acceptance criteria. Every test imports `from factorflow.classification import reader`, so all fail until Phase 3.

### Mandatory Component Tests

Marker: the integration tests below are `@pytest.mark.postgres`; the unit tests are not. Each carries a `# Implements TC-COMP-nnn` comment and a docstring naming its DAC.

- [x] T003 [P] Implement TC-COMP-121 (sort allowlist enforced) in `tests/unit/test_reader_sort_allowlist.py` (DAC-E3-S2-5; SEC-INP-002). `reader.SORT_ALLOWLIST` has exactly the seven keys `symbol`, `value_score`, `growth_score`, `momentum_score`, `value_percentile`, `growth_percentile`, `momentum_percentile`. `ListFilters(sort=x)` and `reader.resolve_sort(x)` raise `ValueError` for `symbol;DROP TABLE instrument`, `score`, `value_score; --`, `VALUE_SCORE`, `""`, `None` and a value with a trailing space. With a recording fake connection (the pattern of `tests/unit/governor_fakes.py`: a class whose `cursor()` records every `execute` call) `list_classifications(fake, ListFilters(sort="bad"))` raises before the fake sees any statement, so nothing is interpolated into SQL. For each of the seven sorts and both orders, the statement the reader sends contains only that sort's allowlist text beyond the shared template, and no request value (assert the request string is absent from the statement text).
- [x] T004 [P] Implement TC-COMP-121 (cursor round-trips and rejects tampering) in `tests/unit/test_reader_cursor.py` (DAC-E3-S2-5). `reader.encode_cursor(set_id, sort, order, key, key_is_null, symbol)` and `reader.decode_cursor(cursor, *, set_id, sort, order)` round-trip: a symbol-sort key (`str`), a factor-sort key (`Decimal("12.345600")` compared by value, not by string), a null key with `key_is_null` true. The value is URL-safe (no `+`, `/`, `=`) and versioned. `decode_cursor` raises `reader.CursorError` for: an empty string, non-base64, base64 of non-JSON, a JSON list, an unsupported `v`, a missing field, a `key_is_null` that is not a boolean, a factor-sort key that is not a decimal string, a flipped character in an otherwise valid cursor (assert it raises or decodes to a payload the checks below reject; never a silently different key), and a cursor decoded under a different `sort`, `order` or `set_id` than it was issued for. `reader.CursorError is factorflow.runs.queries.CursorError` (one exception class, so the API's existing 422 mapping applies).
- [x] T005 [P] Implement TC-COMP-122 (all-null thresholds match every stock in scope), the filter-model rules and the import-order guard in `tests/unit/test_reader_filters.py` (DAC-E3-S2-7, DAC-E3-2). `Thresholds()` has empty `bounds`, `hide_incomplete` false, `symbol` None, and `factors_constrained()` is empty; `Thresholds(bounds={k: Decimal(...)})` accepts all twelve names `{value,growth,momentum}_{score,percentile}_{min,max}`, refuses any other key, refuses a `float` or `int` value, refuses `Decimal("NaN")` and `Decimal("Infinity")` for score bounds, and accepts percentile bounds `0` and `100` and refuses `-0.1` and `100.1`; `factors_constrained()` returns exactly the factors with a bound. `Thresholds(symbol="aa")` stores `"AA"`; `""`, `"1A"`, `"A%"`, `"A_"`, `"A B"` and a 17-character prefix raise `ValueError`, a 16-character one passes. `ListFilters` defaults to `sort="symbol"`, `order="asc"`, `limit=DEFAULT_PAGE_SIZE`; `limit` 0 and `MAX_PAGE_SIZE + 1` raise, 1 and `MAX_PAGE_SIZE` pass; `order` outside `asc`/`desc` raises. `reader.escape_like("A%_\\")` escapes `%`, `_` and the escape character (the design's "a `%` in the prefix is literal" is met by this defence in depth, since the shape check already refuses `%`; see Notes, Resolved Conflicts). A subprocess test (`python -I -c "import factorflow.classification.reader, sys; assert 'factorflow.universes.service' not in sys.modules"`) pins that the reader does not import the universe service, so E1-S5's `service -> reader` import cannot become a cycle. No test here checks `ListFilters.symbols` size (DEC-0127; E3-S3).
- [x] T006 Implement TC-COMP-096 (threshold excludes only classified stocks failing the bound) in `tests/integration/test_reader_list.py` (DAC-E3-S2-1, DAC-E3-3; AC-12, AC-16). One complete set, active stocks: A classified on value at percentile 90; B classified on value at 60; C `not_classified` on value with `input_missing`; D `not_classified` on value with `not_enough_stocks`; E classified on value at 85 but `input_outdated` on momentum. `value_percentile_min=80` lists A, C, D, E and not B; `match_count == 4` and C and D appear with their reason on the cell. A bound on a factor never removes a stock because of another factor's reason (E stays). `value_percentile_max=70` lists B, C, D. A `*_score_min` bound is inclusive and compares the stored score. Two bounds on two factors intersect. With `hide_incomplete=True` as well, C and E leave the list and the count while D stays.
- [x] T007 Implement TC-COMP-108 (`hide_incomplete` hides only input-reason stocks) in `tests/integration/test_reader_list.py` (DAC-E3-S2-2, DAC-E3-4; AC-14, AC-15). Stocks: fully classified on three factors (reason_code NULL on every row: this case pins the `NOT (NULL IN ...)` defect in the design snippet, DEC-0129); `input_missing`, `input_outdated` and `input_not_computable` each on a different factor of a different stock (each hidden, whichever factor carries it); `not_enough_stocks` on an unranked factor (kept); a retired instrument with `retired` on every factor, scoped through a universe (kept). Default lists all of them; `hide_incomplete=True` removes exactly the three input-reason stocks and `match_count` follows. A stock with an input reason on one factor and `not_enough_stocks` on another is hidden.
- [x] T008 Implement TC-COMP-189 (restated value or growth cell carries `restated_possible`) in `tests/integration/test_reader_list.py` (DAC-E3-S2-6, DAC-E3-12; AC-23). Seed `restated_possible=True` on a stock's value and growth rows and False on momentum; the listed `StockRow.factors["value"].restated_possible` and `["growth"]` are True and `["momentum"]` False; an unmarked stock has all False; the flag is the stored column (the reader derives nothing).
- [x] T009 Implement TC-COMP-112 (unscoped list is active only; universe scope keeps retired) in `tests/integration/test_reader_list.py` (DAC-E3-S2-3, DAC-E3-5; AC-15, AC-16). A retired instrument with three `not_classified` rows with `retired` and no inputs is absent from the unscoped list and its `match_count`; the same instrument is present under a universe it belongs to, with `lifecycle == "retired"` and `reason_code == "retired"` on every factor; an active member's cells are identical scoped and unscoped (AC-8). A universe member with no `factor_classification` row in the current set is absent. A random UUID as `universe_id` raises `reader.UniverseNotFound`. A retired universe (`retire_universe`) is still scoped and lists its members as of today (PROVISIONAL, DEC-0128; the test comment cites "awaiting owner confirmation (2026-10-17), Open Gap 3 of CAP-002-E3-S2-tasks"). Membership changes follow the replay: a member removed before today is absent.
- [x] T010 Implement TC-COMP-120 (`match_count` identical on every page) in `tests/integration/test_reader_list.py` (DAC-E3-S2-4, DAC-E3-6; AC-16). 120 active stocks match; with `limit=50` three pages (50, 50, 20) all report `match_count == 120`, `next_cursor` is None only on the last, and the union of pages is the 120 stocks once each. Thresholds, `hide_incomplete` and the symbol prefix each change the number identically on every page. A request whose thresholds match nothing returns `stocks == []`, `match_count == 0`; a page requested with the cursor built from the final stock of the 120 (sort `symbol`, same filters) returns an empty page that still carries `match_count == 120`.
- [x] T011 Implement TC-COMP-122 (all-null thresholds match every stock in scope) in `tests/integration/test_reader_list.py` (DAC-E3-S2-7, DAC-E3-2). `Thresholds()` with `hide_incomplete` false lists every active stock with a row in the set (unscoped) and every row-bearing member (universe scope), `match_count` equals that number, stocks that are incomplete, unranked and retired included in the universe scope; `evaluate_filter` with the same default `Thresholds` returns the same ids.

### Additional Unit and Integration Tests

- [x] T012 `evaluate_filter` equals the list, and the symbol prefix, in `tests/integration/test_reader_list.py` (design section 7 rows "Evaluate filter equals the list" and "Symbol prefix"; DAC-E3-2, DAC-E3-S2-7, S03-7): for each of several `Thresholds` (bounds only; bounds plus `hide_incomplete`; bounds plus a prefix; prefix plus `hide_incomplete`; a stock incomplete on a thresholded factor among the matches) `sorted(evaluate_filter(conn, set_id, t))` equals the sorted `instrument_id` of every stock the list returns across all its pages (unpaginated, `limit=MAX_PAGE_SIZE`). `Thresholds(symbol="AA")` matches `AAPL` and `AA` and not `BAAP`; `match_count` follows the prefix; `evaluate_filter` on an empty `Thresholds()` returns every active stock with a row in that set. `evaluate_filter` takes the named `set_id` as given (it does not require it to be the current set).
- [x] T013 Sort and keyset in `tests/integration/test_reader_list.py` (design section 7 rows "Incomplete rows sort last", "Default order is symbol", "Keyset pages are stable"; AC-16): no `sort` gives symbol ascending; `symbol` desc reverses; `value_score` asc and desc both place `not_classified` rows after every classified row, ties on symbol ascending; `value_percentile` the same; 120 stocks under `momentum_percentile` desc with 20 unclassified, paged at 50, cover every stock exactly once with the page boundary falling inside the unclassified block in one sub-case and between classified and unclassified in another; a stock with equal scores across a page boundary is neither repeated nor skipped. A cursor issued for another `sort`, `order` or `set_id` raises `CursorError` and no page is returned.
- [x] T014 Cell shape in `tests/integration/test_reader_list.py` (AC-9, AC-12, DAC-E3-12): a classified cell returns the stored `score` and `percentile` as `Decimal` with `reason_code`, `reason_input`, `reason_detail` None; a `not_classified` cell returns `score` and `percentile` None, its reason code and, for an input reason, `reason_input` and `reason_detail`; `StockRow` carries `instrument_id`, `symbol`, `name`, `lifecycle` and the three `factors` keys in `FACTORS` order; nothing is recomputed (seed a percentile that is not derivable from the scores and assert it is returned unchanged).
- [x] T015 Page blocks and never-classified in `tests/integration/test_reader_list.py` (DAC-E3-11 list half; AC-20, AC-22): with a complete set and a newer `building` set the page's `set` and `later` equal what `reader.read_set_blocks(conn)` returns and `set.not_current` is True; with a complete set alone `later` is None and `not_current` False; with no complete set and a `building` first set the page is `ClassificationPage(set=None, never_classified=True, later=<that set>, match_count=0, stocks=[], unknown_symbols=[], next_cursor=None)` and no list statement runs (assert via a statement-counting wrapper); with no set at all `later` is None and the shape is identical. `unknown_symbols` is `[]` on a list. An unknown `universe_id` while no set is complete returns the never-classified page (the design's read sequence resolves the set first; Open Gap 6).
- [x] T016 [P] Read-only and parameterisation guard: extend `tests/unit/test_reader_sql_read_only.py` (created by CAP-002-E3-S1) so its scan also covers `list_classifications.sql` and `universe_exists.sql` (one statement each, beginning `WITH` or `SELECT`, no write keyword, comments stripped). In `tests/unit/test_reader_sort_allowlist.py` also assert that the only `str.format`/`%` placeholders left in `list_classifications.sql` are the documented ones (`{sort_expr}`, `{order}`, `{keyset}`) and that every other placeholder is a `%(name)s` bound parameter (SEC-INP-002).

**Checkpoint**: All tests written and failing (no production code yet).

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass with the models, the allowlist and cursor, the two statements and the two public reads.

- [x] T017 Add to `src/factorflow/classification/reader.py` (module-level, no function bodies that touch the database yet): `INPUT_REASONS = ("input_missing", "input_outdated", "input_not_computable")`; `SORT_ALLOWLIST: dict[str, str]` with the seven keys of design 2.3 mapping to the `matched` output column names (`m.symbol`, `m.value_score`, ..., `m.momentum_percentile`) because the design's `c_{f}.score` expressions name the joined tables, which are not visible outside the `matched` CTE (Resolved Conflicts, DEC-0129); `resolve_sort(value: object) -> str` raising `ValueError` for anything not a key; `CursorError` imported from `factorflow.runs.queries` and re-exported (one class for the API's 422 mapping); `class UniverseNotFound(LookupError)`; `escape_like(prefix: str) -> str`; the frozen dataclasses `Thresholds` (`bounds`, `hide_incomplete`, `symbol`, `factors_constrained()`, `__post_init__` validation per T005, symbol upper-cased with `object.__setattr__`), `FactorCell`, `StockRow`, `ListFilters` (`universe_id`, `symbols`, `sort`, `order`, `thresholds`, `limit`, `cursor`; `__post_init__` validates `sort`, `order`, `limit`; `symbols` is stored unchecked, DEC-0127) and `ClassificationPage`, with the exact fields and types of design 2.3. Import `DEFAULT_PAGE_SIZE` and `MAX_PAGE_SIZE` from `factorflow.api.bounds`. Do not import `factorflow.api.classification_bounds`, `factorflow.universes.service` or anything from `factorflow.api.routes`. Do not redefine `FACTORS`, `CurrentSet`, `LaterSet`. (depends on T001)
- [x] T018 Add the versioned cursor to `src/factorflow/classification/reader.py`: `encode_cursor` and `decode_cursor` per T004. The wire format is the contract of `runs/queries.py` (JSON, `separators=(",", ":")`, `base64.urlsafe_b64encode`, `=` stripped, `"v": 1`) with the fields `set`, `sort`, `order`, `key`, `null`, `sym`; `key` is `str` for the `symbol` sort and `str(Decimal)` otherwise; decoding validates every field's type and raises `CursorError` for any failure and for a `set`, `sort` or `order` that differs from the request. The helper is private to the reader because `runs/queries.py` exposes only payload-specific encoders and editing CAP-001 code is out of scope (Open Gap 4). (depends on T017)
- [x] T019 Create `src/factorflow/classification/sql/list_classifications.sql` and `src/factorflow/classification/sql/universe_exists.sql`. `universe_exists.sql`: `SELECT EXISTS (SELECT 1 FROM universe WHERE universe_id = %(universe_id)s::uuid)`. `list_classifications.sql` is one `WITH` statement with the shape of design 2.5, corrected as DEC-0129 records: CTE `scope` over `instrument i` with `(%(scoped)s::boolean AND i.instrument_id = ANY(%(member_ids)s::bigint[])) OR (NOT %(scoped)s::boolean AND i.lifecycle = 'active')`, `AND (%(symbol_pattern)s::text IS NULL OR i.symbol LIKE %(symbol_pattern)s::text ESCAPE '\')`, `AND (%(symbols)s::text[] IS NULL OR i.symbol = ANY(%(symbols)s::text[]))` and `AND EXISTS (SELECT 1 FROM factor_classification c WHERE c.set_id = %(set_id)s::uuid AND c.instrument_id = i.instrument_id)`. A `LIKE` pattern written in the file uses `%%` where a literal percent is needed (psycopg placeholder rule); the pattern value itself is passed bound as `escape_like(prefix) + "%"`. CTE `matched` joins `factor_classification` three times (aliases `c_value`, `c_growth`, `c_momentum`, each on `set_id`, `instrument_id` and its factor) and selects `instrument_id, symbol, name, lifecycle` then, per factor, `status`, `score`, `percentile`, `reason_code`, `reason_input`, `reason_detail`, `restated_possible` aliased `value_status`, `value_score`, ... (21 columns). Its `WHERE` holds, for each of the twelve bounds, a static guard `(%(value_score_min)s::numeric IS NULL OR c_value.status IS DISTINCT FROM 'classified' OR c_value.score >= %(value_score_min)s::numeric)` (`<=` for `_max`, `percentile` for the percentile columns; DEC-0081), then `AND (NOT %(hide_incomplete)s::boolean OR NOT (COALESCE(c_value.reason_code = ANY(%(input_reasons)s::text[]), false) OR <growth> OR <momentum>))`. The final `SELECT` is `c.match_count, p.*` from `(SELECT count(*) AS match_count FROM matched) c LEFT JOIN LATERAL (SELECT m.* FROM matched m WHERE {keyset} ORDER BY ({sort_expr} IS NULL) ASC, {sort_expr} {order}, m.symbol ASC LIMIT %(limit_plus_one)s::bigint) p ON true`, so an empty page still returns one row carrying the count. `{sort_expr}` and `{order}` come only from `SORT_ALLOWLIST` and the `asc`/`desc` enumeration; `{keyset}` is one of a fixed set of fragments chosen in code (`true`; or, for ascending and a non-null last key, `({sort_expr} IS NULL OR {sort_expr} > %(k)s OR ({sort_expr} = %(k)s AND m.symbol > %(ksym)s))`; `<` for descending; and for a null last key `({sort_expr} IS NULL AND m.symbol > %(ksym)s)`), with `%(k)s` cast to `numeric` for factor sorts and `text` for the symbol sort. `match_count` is computed once because `matched` is referenced twice and PostgreSQL materialises it. (depends on T017)
- [x] T020 Add `list_classifications(conn, filters) -> ClassificationPage` and `evaluate_filter(conn, set_id, thresholds) -> list[int]` to `src/factorflow/classification/reader.py`. Load both new `.sql` files at import with `read_text()` next to the S1 constants (`LIST_SQL`, `UNIVERSE_EXISTS_SQL`). `list_classifications` follows design 2.7: resolve `sort` (`ValueError`), decode the cursor structurally, call `read_set_blocks(conn)`; with no current set return `ClassificationPage(set=None, never_classified=True, later=later, match_count=0, stocks=[], unknown_symbols=[], next_cursor=None)` without running the list statement; otherwise bind the cursor to the set (mismatch raises `CursorError`), and for a universe scope run `UNIVERSE_EXISTS_SQL` (`UniverseNotFound` when false), then run the imported `MEMBERSHIP_AS_OF_SQL` with `{"universe_id": ..., "as_of": today}` where `today` is `datetime.now(ZoneInfo("America/Chicago")).date()` (DEC-0065) and pass the returned `instrument_id` values as `member_ids`; an empty member list is passed as an empty array and yields an empty page. Run the formatted `LIST_SQL` once with a plain cursor (`cursor.execute(LIST_SQL.format(sort_expr=..., order=..., keyset=...), params)`; never an f-string, `%` or `+` expression as the `.execute` argument, which CAP-002-E2-S2's `tests/unit/test_engine_sql_safety.py` rejects anywhere under `classification/`), `limit_plus_one = limit + 1`; map the first row's `match_count`, build `StockRow`s from the aliased columns by name through the cursor description (the module-local `_row_to_*` pattern of `runs/queries.py`; a row whose `instrument_id` is None is the empty-page row and yields no stock), trim to `limit` and, when a `limit + 1`-th row existed, `next_cursor` from the last kept row's sort key, null flag and symbol. `evaluate_filter` calls the same private `_run_list` helper with the default sort, no cursor, `limit_plus_one=None` (`LIMIT NULL`, no limit), unscoped and no `symbols`, and returns the `instrument_id`s ordered by `instrument_id`; it must not build a second predicate. No `commit`, no write. (depends on T018, T019)

**Checkpoint**: T003 to T016 pass; `uv run mypy src` is clean for the changed module.

---

## Phase 4: Integration

**Purpose**: Confirm the new statements ship in the release image and that the shared predicate has one definition.

- [x] T021 Run `uv run pytest tests/unit/test_package_data_ships_sql.py` (the guard CAP-002-E1-S1 created and CAP-002-E2-S1 extended). It must pass with `classification/sql/list_classifications.sql` and `universe_exists.sql` present, proving a non-editable install carries them (DEC-0088). If it fails, do not edit `pyproject.toml` here: the glob is CAP-002-E2-S1's deliverable; record the failure in the review hand-off. Nothing is mounted or wired in this story: the routes (CAP-002-E3-S5), compare (CAP-002-E3-S3) and the snapshot (CAP-002-E1-S5) consume `list_classifications`, `ListFilters`, `Thresholds` and `evaluate_filter` later. (depends on T019)
- [x] T022 Confirm single definition (SA-DUP-001): `grep -rn "api.classification_bounds\|universes.service" src/factorflow/classification/reader.py` returns nothing; `grep -rn "MEMBERSHIP_AS_OF_SQL\|membership_as_of" src/factorflow/classification/` shows an import and no restated replay statement; `grep -rn "hide_incomplete" src/factorflow/classification/sql/` shows the predicate in `list_classifications.sql` only. (depends on T020)

**Checkpoint**: The new SQL is covered by the package-data guard and the reader imports nothing it must not.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns

- [x] T023 Run the full validation set (Validation Plan below), fix any lint, format or type finding in the files this story added or extended, and confirm the module docstring and test comments cite DAC-E3-S2-1 to DAC-E3-S2-7, DAC-E3-2 to DAC-E3-6, DAC-E3-12 and the seven TC-IDs. Add no file beyond the two SQL files, the four test files named in the story, the `reader_seed.py` and `test_reader_sql_read_only.py` extensions, and `reader.py`. `tests/unit/test_engine_sql_safety.py` (CAP-002-E2-S2 T010) runs in the full suite and must pass unedited over `reader.py`, `list_classifications.sql` and `universe_exists.sql`; if it fails, report it in the review hand-off rather than editing it or the design-pinned placeholders. (depends on T020, T021, T022)
- [x] T024 After each TDD cycle in T003–T023 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E3-S2-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here as `reverse`, `soft`, or
`context`. A newly discovered hard dependency must be added to the graph.

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E3-S1 | hard | Existing graph edge. `reader.py`, `read_set_blocks`, `CurrentSet`, `LaterSet`, `FACTORS` and `tests/integration/reader_seed.py` are extended here (T001, T002, T017, T020) |
| CAP-002-E1-S2 | hard | Existing graph edge. `universes/replay.py` supplies `membership_as_of.sql` for the universe scope (T001, T020) |
| CAP-002-E1-S5 | reverse | `create_from_filter` imports `Thresholds` and `evaluate_filter` from this story's `reader.py` (graph edge `E1-S5: [E1-S3, E3-S2]`); drives the import-order guard (T005) |
| CAP-002-E3-S3 | reverse | `compare` reuses `list_classifications`, the models and the statement, and adds the 2 to 6 check on `ListFilters.symbols` (DEC-0127) |
| CAP-002-E3-S5 | reverse | The list route builds `ListFilters` and maps `CursorError` and `UniverseNotFound` |
| CAP-002-E1-S6 | context | Creates `api/classification_bounds.py` (`MIN/MAX_COMPARE_SYMBOLS`). Not imported here: `E1-S6 -> E1-S5 -> E3-S2` would make a hard edge a cycle (DEC-0127) |
| CAP-002-E2-S1 | context | Owns `0005`/`0006` tables the statement reads and the package-data glob (T021); reached through CAP-002-E3-S1's hard edge |
| CAP-002-E2-S2 | context | Owns `classification/__init__.py` and `constants.py` (`FACTORS`), and the package guard `tests/unit/test_engine_sql_safety.py` (TC-COMP-160), which scans this story's `reader.py` and two SQL files under its package-wide rules only and must pass unedited (T001 (e), T020, T023); reached through CAP-002-E3-S1's hard edge |
| CAP-002-E3-S4 | context | Owns the 3000-stock volume test (TC-COMP-153); cited only to bound what this story's 120-row tests do not prove |
| CAP-002-E1-S1 | context | Owns the `universe` and `universe_event` tables the seed helper writes (T002) and the package-data guard (T021); reached through CAP-002-E1-S2's hard edge |

### Task Dependencies
- T001: No dependencies
- T002: Depends on T001
- T003, T004, T005, T016: Depend on T001; unit tests in separate files (T016 edits T003's file and `test_reader_sql_read_only.py`, written after T003)
- T006 to T015: Depend on T002; same file `test_reader_list.py`, written in order
- T017: Depends on T001, after Phase 2
- T018: Depends on T017
- T019: Depends on T017; can run in parallel with T018
- T020: Depends on T018, T019
- T021: Depends on T019
- T022: Depends on T020
- T023: Depends on T020, T021, T022
- T024: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: T003, T004, T005 (three unit files) and the `test_reader_list.py` group (T006 to T015) are independent files
- Phase 3: T018 and T019 can run in parallel after T017

---

## Validation Plan

### Constitution-Defined Commands
- Build: none defined for Python in the tech-stack Validation Commands table (no separate build step)
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` (the story's Validation section; `uv run pytest` runs both)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

If no container runtime is available, run `uv run pytest -m 'not postgres'` and report that the `postgres`-marked list tests were excluded (tech stack, Validation Commands note).

### Story-Specific Validation
- DAC-E3-S2-1: `uv run pytest tests/integration/test_reader_list.py -m postgres -k "threshold"` shows TC-COMP-096 green
- DAC-E3-S2-2: TC-COMP-108 green, including the fully classified stock (reason NULL) that the design snippet would drop
- DAC-E3-S2-3: TC-COMP-112 green: retired absent unscoped, present with `retired` under a universe, `UniverseNotFound` for an unknown id
- DAC-E3-S2-4: TC-COMP-120 green: `match_count` 120 on all three pages and on an empty page
- DAC-E3-S2-5: `uv run pytest tests/unit/test_reader_sort_allowlist.py tests/unit/test_reader_cursor.py` passes with no database
- DAC-E3-S2-6: TC-COMP-189 green
- DAC-E3-S2-7: TC-COMP-122 green, unit and integration
- Predicate singularity: `evaluate_filter` equals the list in every T012 case; `grep` checks of T022 return as stated
- Package guard: `uv run pytest tests/unit/test_engine_sql_safety.py` (CAP-002-E2-S2 T010, TC-COMP-160) passes unedited with the two new SQL files and the extended `reader.py` present (T001 (e), T023)

---

## Notes

### Resolved Conflicts

- **Design 2.5's `hide_incomplete` snippet versus DAC-E3-S2-2 and DAC-E3-4.** `NOT (c_value.reason_code IN (...) OR c_growth.reason_code IN (...) OR c_momentum.reason_code IN (...))` is NULL, not true, when every `reason_code` is NULL (a fully classified stock), so the `WHERE` drops the stock. The acceptance criteria say only input-reason stocks are hidden; they outrank an illustrative snippet (precedence step 1). The plan wraps each term as `COALESCE(reason_code = ANY(%(input_reasons)s), false)` and T007 pins the case. Likewise the threshold guard uses `status IS DISTINCT FROM 'classified'` so a missing joined row cannot turn a keep into a drop. No source edit required (DEC-0129).
- **Design 2.5's `c_value.*, c_growth.*, c_momentum.*` and `SORT_ALLOWLIST` values `c_{f}.score`.** Three `SELECT *` expansions repeat `score`, `percentile` and the other columns, and the joined aliases are not visible to the outer query that sorts the page. The snippet is shape-only ("shape; the sort expression is substituted"); the plan aliases the columns (`value_score`, ...) and maps the same seven keys to those aliases. The key set, the fact that values are repository constants and the "only the seven expressions reach SQL" test are unchanged (DEC-0129).
- **Design 2.5 "when the page is empty the count is still returned" versus a `SELECT m.*, (SELECT count(*) ...) FROM matched m` that returns no row for an empty page.** The prose and DAC-E3-6 govern; the plan returns the count from its own one-row subquery (T019, T010).
- **Design 7 "a `%` in the prefix is literal" versus design 4 `^[A-Z][A-Z0-9.-]{0,15}$`.** The shape check refuses `%` and `_` before SQL, so a literal-percent prefix cannot reach the query. Both are normative; the plan keeps the shape check (the stricter, SEC-INP-001) and keeps `escape_like` plus `ESCAPE '\'` as defence in depth, proved by a unit test on the escape (T005). No source edit required.
- **Design 7 "`ListFilters.symbols` of 1 or 7 raises before SQL" in `test_reader_filters.py` (a test file this story's Technical Details lists) versus the dependency graph.** The bound constants live in `api/classification_bounds.py`, created by CAP-002-E1-S6; a hard edge E3-S2 to E1-S6 closes the cycle E3-S2, E1-S6, E1-S5, E3-S2. No acceptance criterion of this story covers the compare bound; DAC-E3-S3-1 (E3-S3, TC-COMP-123) does. This story declares the field, passes it through, and leaves the size check to E3-S3 (DEC-0127). The `test_reader_filters.py` file is still created here for `Thresholds` and `ListFilters`.
- **System design v3 and reader design v3 versus DEC-0071 (1) and the v2 "any factor `not_classified`" wording**: DEC-0079 (a)/(b) govern; the plan implements the input-reason rule and the active-roster rule only (E3 register).

### Open Gaps

1. **The name of the replay SQL constant.** Design 3 assumes `membership_as_of.sql` is importable from `factorflow.universes.replay` "as a SQL constant" and names none. The plan expects `MEMBERSHIP_AS_OF_SQL` (the `GAPS_SQL` precedent). Not a value; resolved at T001 by importing whatever name CAP-002-E1-S2 chose. Flag for the next revision of the universe-service design 2.5 to name it.
2. **How the replay joins the list.** Design 2.5 sketches a `membership_now` CTE inside the list statement; design 2.7 and 5 show a separate replay query followed by "an `IN` over at most 3000 instrument ids". The plan follows 2.7 (run the imported statement, pass the ids as a `bigint[]`), the only form that imports rather than restates the replay. Flag for the next revision of reader design 2.5 to drop `membership_now`.
3. **PROVISIONAL — awaiting owner confirmation (2026-10-17): a retired universe is still a valid scope.** Only an unknown `universe_id` raises `UniverseNotFound` (design 2.5); no artifact says whether a retired universe may be read. The plan lists its members as of today (the replay is by event and a retirement removes none). Derivation: AC-6 retains the record of a retired universe, the memberships read excludes retired universes only because it names places "the owner can still act in" (design 2.6), which is not a reason to hide one's results here, and refusing would need an invented error. Pinned by T009; recorded as DEC-0128. Flag for reader design 2.5 and the API design's error table.
4. **The cursor shares a contract, not code, with `runs/queries.py`.** Design 2.5 says the reader "shares the encoder" (SA-DUP-001). The existing public encoders fix their payloads (`encode_cursor(ts, run_id)`, `encode_detail_cursor(...)`) and a generic one would mean editing CAP-001 code, outside this story. The plan reuses the exception class and the wire format and writes a reader-private encoder for the `set`/`sort`/`order`/`key` payload. A tampered value is detected structurally and by the binding to set, sort and order; the cursor is unsigned, and a forged but well-formed key can only choose where a page starts, since the key is a bound parameter. Flag for a later refactor extracting the shared base64-JSON helpers.
5. **`evaluate_filter` ordering and set.** The signature returns instrument ids; no artifact orders them or requires the set to be current (E1-S5 checks currency itself, DAC-E1-2). The plan orders by `instrument_id` and uses the supplied `set_id` as given. Not a bound.
6. **Order of the unknown-universe check against the never-classified short-circuit.** Design 2.7 resolves the set first, so with no complete set a bad `universe_id` returns the never-classified page rather than `UniverseNotFound`. Followed as written (T015); flag for the API design if a 404 is wanted there.
7. **A stock missing one of its three `factor_classification` rows.** The scope requires only one row; the engine writes three per stock (research-store 2.4, factor-engine 7). The mapper treats a null `*_status` as a data-integrity error rather than inventing a cell (ValueError), per constraint 3 (no invented behaviour). Not a bound.

### Other Notes

- **Dependency graph.** No edge added. `CAP-002-E3-S2: [CAP-002-E3-S1, CAP-002-E1-S2]` already holds every hard producer (`reader.py` and `reader_seed.py` from E3-S1; `replay.py` from E1-S2); the E2 stories and E1-S1 are reached through them. The edge E1-S5 to E3-S2 is the reverse of this story's and creates no cycle.
- **Story status.** The skill's step of setting the story's frontmatter `status: planning` was not performed: the supervising instruction forbids editing the approved story. The story stays `todo`.
- **Consistency with the CAP-002-E3-S1 plan.** This plan extends, and does not redefine, `read_set_blocks`, `CurrentSet`, `LaterSet` and `reader_seed.py`, and inherits its PROVISIONAL `later` rule (DEC-0126) for the page's `later`.
- **Parameter typing.** `psycopg` 3 binds server-side, so a parameter used only in `IS NULL` needs a cast (`::numeric`, `::text`, `::boolean`, `::bigint[]`, `::uuid`); the plan casts every parameter in the statement.
- **Compare is out of scope but shaped for.** `ListFilters.symbols` and the `scope` predicate on it exist so E3-S3 reuses the statement; `unknown_symbols` is always `[]` on a list.
- **Volume.** The 3000-stock proof, index use and the seven sorts at scale belong to CAP-002-E3-S4 (TC-COMP-153); this story's tests use at most 120 rows.
- **`ZoneInfo("America/Chicago")` needs tz data** at runtime; a slim container image without the system zoneinfo database would fail at the first universe-scoped read. Check at T020 and, if absent, report that the `tzdata` dependency belongs to the tech-stack owner rather than adding it here.
- **Risk.** Run T001 first. CAP-002-E3-S1, CAP-002-E1-S2 and their predecessors are `todo` at planning time; the list tests cannot run against `0006` until they land.
