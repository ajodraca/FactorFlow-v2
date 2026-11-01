---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S3-tasks
artifact_type: story-tasks
artifact_version: 1
status: draft
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-10-17
updated: 2026-11-01
last_reworked_review: CAP-002-E3-S3-implementation-review-v2.md
ai_provenance:
  agent_id: implementation-planning-agent
  agent_version: "1.0"
  model: claude-sonnet-5-5
  tool: Claude Code
  tool_version: "unknown"
  timestamp: 2026-10-17T23:35:00Z
  source_artifacts:
    - id: CAP-002-E3-S3
      version: "1"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-classification-reader-component-tests
      version: "1"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Tasks: CAP-002-E3-S3 — Compare, Stock Evidence and Stock Memberships Reads

**Story**: `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S3.md`
**Component**: `FactorFlow-v2`
**Branch**: `usr/alvaro-de-jodra/CAP-002-E3-tasks`
**Date**: 2026-10-17

## Summary

Adds to `src/factorflow/classification/reader.py` the three remaining single-stock
reads of the Research screen: `compare` (2 to 6 symbols side by side, every known
symbol returned including an incomplete or retired one, the rest reported in
`unknown_symbols`), `stock_evidence` (the stock's three cells, every `factor_input`
row of the current set with value, `as_of`, `known_on` and `restated_possible`,
and the active universes it belongs to in name order) and the memberships read
behind it, with `sql/stock_evidence.sql` and `sql/stock_memberships.sql`. Compare
is `list_classifications` (CAP-002-E3-S2) with `symbols` set, so it applies the
one list statement, the one cell model and the one `restated_possible` rule; the
2-to-6 check lands on `ListFilters.symbols`, where CAP-002-E3-S2 deliberately left
it (DEC-0127). The evidence read shares E3-S1's `read_set_blocks` for its `set`
block. Everything returned is a stored row; nothing is recomputed (STD-UI-15). No
history, sets, route or UI work is built here.

## Acceptance Criteria Traceability

| AC | Description | Tasks |
|----|-------------|-------|
| AC-15 | Retired stock keeps its row with the `retired` reason (compare and evidence) | T005, T009, T010, T013, T017, T018 |
| AC-16 | View chosen stocks side by side, across all classified stocks | T003, T004, T008, T009, T013, T016, T017, T020 |
| AC-17 | Inputs a classification was built from, and the date each was known | T006, T010, T011, T015, T018 |
| AC-23 | `restated_possible` on every cell, compare and evidence halves | T009, T010, T017, T018 |
| DAC-E3-7 | Compare accepts 2 to 6 symbols, returns every known one, reports the rest | T003, T004, T008, T009, T016, T017 |
| DAC-E3-8 | Evidence returns every current-set `factor_input` row with `as_of`, `known_on`, and the active universes | T006, T007, T010, T011, T014, T015, T018 |
| DAC-E3-12 | Restatement mark on every read that returns a cell (compare, evidence halves) | T009, T010, T017, T018 |
| DAC-E3-S3-1 | Compare returns every known symbol, 2 to 6 only | T003, T008, T009, T013, T016, T017 |
| DAC-E3-S3-2 | Unrecognised compare symbol reported in `unknown_symbols` | T004, T009, T017 |
| DAC-E3-S3-3 | Evidence returns every `factor_input` row with value, dates, `restated_possible` and universes in name order | T006, T010, T011, T014, T015, T018 |
| DAC-E3-S3-4 | Retired stock keeps its row with `retired`, compared or read as evidence | T005, T013, T017, T018 |
| DAC-E3-S3-5 | No current set: `set` null, same shape | T007, T018 |

Mapped component test cases (all mandatory): TC-COMP-123 (DAC-E3-S3-1), TC-COMP-124
(DAC-E3-S3-2), TC-COMP-146 (DAC-E3-S3-3), TC-COMP-113 (DAC-E3-S3-4), TC-COMP-147
(DAC-E3-S3-5). TC-COMP-125 (compare outside 2 to 6 rejected before the reader) traces
to DAC-E3-S5-2 and belongs to the API stories; this story proves the reader's own
re-check only. TC-INT-040 (compare reports unrecognised symbols, DAC-E3-7) and
TC-INT-009 (one stock in two universes, DAC-E3-8) are integration tests through the
API and are owned by the automation phase, not planned here. TC-COMP-189 is mapped to
CAP-002-E3-S2 (the list half of DAC-E3-12); this story adds the compare and evidence
halves as additional tests.

## Phase 1: Setup

**Purpose**: Confirm what this story imports exists and give the tests a way to seed inputs and membership changes.

- [x] T001 Confirm the producers exist before any code is written; STOP and report if one is missing rather than creating it here. (a) From CAP-002-E3-S2: `src/factorflow/classification/reader.py` exporting `list_classifications`, `ListFilters`, `Thresholds`, `FactorCell`, `StockRow`, `ClassificationPage`, `SORT_ALLOWLIST`, `UniverseNotFound`, and `sql/list_classifications.sql` whose `scope` CTE restricts an unscoped read to `i.lifecycle = 'active'`; from CAP-002-E3-S1: `read_set_blocks`, `CurrentSet`, `FACTORS`; and `tests/integration/reader_seed.py` with `insert_instrument`, `insert_run`, `insert_set`, `insert_input`, `insert_classification`, `insert_universe`, `retire_universe`, `seed_scored_stock`. (b) From CAP-002-E1-S2: `factorflow.universes.replay.MEMBERSHIP_AS_OF_SQL` (the name CAP-002-E3-S2 expects, DEC-0128; if replay.py exposes another name, import that one and record it in the review hand-off). (c) From CAP-002-E1-S6: `src/factorflow/api/classification_bounds.py` exporting `MIN_COMPARE_SYMBOLS` (2) and `MAX_COMPARE_SYMBOLS` (6); import only those two names (the module also declares `MAX_UNIVERSE_NAME_LENGTH`, which is an open owner input and must not be read here). (d) From CAP-002-E2-S2: `classification/constants.py` exporting `INPUT_NAMES` (open its definition and note whether it is a tuple of the eight names or a mapping by factor; T008 and T015 flatten it accordingly). (e) From CAP-002-E2-S1: migrations `0005_universes.sql` and `0006_classifications.sql` (tables `universe`, `universe_event` with `event_id`, `event_type`, `instrument_id`, `name`; `factor_input`, `factor_classification`). (f) From CAP-002-E2-S5: `src/factorflow/classification/constants.py` exporting `INPUT_LABELS` (`dict[str, str]`, the eight input labels `classify.sql` writes `reason_detail` from; DEC-0130, cross-plan review E2-F15). (g) CAP-001 code already in the repo: `factorflow.instruments.symbols.is_valid`, a predicate taking a `str` and returning a `bool` for the instrument symbol shape `^[A-Z][A-Z0-9.-]{0,15}$` (the helper universe-service design section 2.3 names so that symbol checks never disagree); T016 imports it. Nothing is edited by this task.
- [x] T002 Extend the seeding helper `tests/integration/reader_seed.py` (created by CAP-002-E3-S1 and extended by CAP-002-E3-S2; add functions or optional keyword parameters only, change no existing signature, bound parameters only): `seed_inputs(conn, set_id, instrument_id, *, statuses=None, values=None, restated=()) -> None` that writes all eight `factor_input` rows of a stock through the existing `insert_input` (default every input `present` with a value, `as_of` and `known_on`; `statuses` maps input name to `missing`, `outdated` or `not_computable`; `restated` names the inputs with `restated_possible` true); if `insert_input` lacks `restated_possible` or `detail` keywords, add them as optional parameters defaulting to `False` and `'{}'::jsonb`; and the membership event helpers `add_member(conn, universe_id, instrument_id)`, `remove_member(conn, universe_id, instrument_id)` and `rename_universe(conn, universe_id, name)`, each inserting one `universe_event` row (`recorded_on` and `recorded_at` take their defaults). Add no fixture to `tests/conftest.py`; tests use `migrated_run_schema_connection`.

**Checkpoint**: Producers confirmed present; a test can seed a stock's eight inputs, universes, renames, additions, removals and retirements in a migrated database.

---

## Phase 2: Tests (TDD)

**Purpose**: Write failing tests that define compare, evidence and memberships from the acceptance criteria. Every test imports `from factorflow.classification import reader`, so all fail until Phase 3.

### Mandatory Component Tests

Marker: the integration tests below are `@pytest.mark.postgres`; the unit tests are not. Each carries a `# Implements TC-COMP-nnn` comment and a docstring naming its DAC.

- [x] T003 Implement TC-COMP-123 (compare returns every known symbol, 2 to 6 only) in `tests/integration/test_reader_compare.py` (DAC-E3-S3-1, DAC-E3-7; AC-16). One complete set. Stocks: A classified on all three factors; B `not_classified` on value with `input_missing` and classified on the rest (incomplete); C `not_classified` on growth with `not_enough_stocks`; R a retired instrument with `retired` on every factor and no inputs; D classified. `reader.compare(conn, [...])` with 2 symbols returns both; with 6 symbols (A, B, C, R, D and one more) returns all six; every returned `StockRow` carries its three cells with the stored status and reason, so B, C and R are returned (`match_count == len(stocks)`), none dropped for being incomplete, unranked or retired. 1 symbol and 7 symbols raise `ValueError` and, through a statement-counting wrapper, no statement ran. Stocks come back in symbol-ascending order whatever the request order, and `next_cursor` is None.
- [x] T004 Implement TC-COMP-124 (unrecognised compare symbol reported in `unknown_symbols`) in `tests/integration/test_reader_compare.py` (DAC-E3-S3-2, DAC-E3-7; AC-16). `compare(conn, ["AAA", "BBB", "NOPE"])` with AAA and BBB known returns the two stocks and `unknown_symbols == ["NOPE"]`; two unknown symbols are both reported in request order; all requested symbols unknown (for example `["NOPE", "NADA"]`) returns `stocks == []`, `unknown_symbols == ["NOPE", "NADA"]` and `match_count == 0`. `unknown_symbols` is `[]` when every symbol is known. Only well-formed symbols are used here: a symbol failing the instrument symbol shape is refused with `ValueError` before any SQL, not reported (T008; DEC-0132).
- [x] T005 Implement TC-COMP-113 (retired stock keeps its row with the `retired` reason) in `tests/integration/test_reader_compare.py` and `tests/integration/test_reader_evidence.py` (DAC-E3-S3-4, DAC-E3-S3-1; AC-15). A retired instrument with three `not_classified` rows carrying `retired` and no `factor_input` rows. Compare half (compare file): `compare(conn, ["R", "A"])` returns R with `lifecycle == "retired"` and `reason_code == "retired"` on all three cells, while the unscoped `list_classifications` over the same set still excludes R (DEC-0133; the CAP-002-E3-S2 behaviour is unchanged when `symbols` is None). Evidence half (evidence file): `stock_evidence(conn, "R")` returns `lifecycle == "retired"`, three cells each `retired`, `inputs == []` and its memberships (a retired instrument stays a member of the universes it was added to).
- [x] T006 Implement TC-COMP-146 (evidence returns every `factor_input` with dates and universes) in `tests/integration/test_reader_evidence.py` (DAC-E3-S3-3, DAC-E3-8; AC-17, AC-23). One complete set, stock AAPL with all eight inputs (`seed_inputs`): six `present`, one `outdated` with its stored value and dates, one `missing` with null value and dates, `restated_possible` true on one value input and one growth input; AAPL in universes named `Zeta` (created first) and `Alpha`. `stock_evidence(conn, "AAPL")` returns exactly eight `InputRow`s ordered by factor in `FACTORS` order and, within a factor, by input in the definition order of the design (value: `book_to_price`, `earnings_yield`, `fcf_yield`; growth: `revenue_growth`, `eps_growth`; momentum: `return_3m`, `return_6m`, `return_12m`); each row carries `factor`, `input_name`, `label`, `status`, `value` as `Decimal` compared by value, `as_of`, `known_on`, `restated_possible` and `detail` as stored; the `missing` row has `value`, `as_of`, `known_on` all None; `memberships` is `[Membership(alpha_id, "Alpha"), Membership(zeta_id, "Zeta")]` (name order, not creation order). The `set` block equals `read_set_blocks(conn)[0]`; the three cells equal the stored `factor_classification` rows. `symbol`, `name` and `lifecycle` are the instrument's.
- [x] T007 Implement TC-COMP-147 (evidence with no current set has null `set`, same shape) in `tests/integration/test_reader_evidence.py` (DAC-E3-S3-5, DAC-E3-8; AC-17). Two cases, each in a fresh database: no set at all, and only a `building` set (no `complete` one). For a known instrument (and, in the second case, with a `building` set that already holds `factor_input` rows for it): `stock_evidence(conn, "AAPL")` returns a `StockEvidence` whose `set is None`, `factors == {}`, `inputs == []`, with `symbol`, `name`, `lifecycle` and `memberships` still populated (memberships do not depend on a set; PROVISIONAL, DEC-0131, cite "awaiting owner confirmation (2026-10-17), Open Gap 2 of CAP-002-E3-S3-tasks" in a comment). The object has the same type and field names as the populated one from T006 (compare `dataclasses.fields`). An unknown symbol raises `reader.InstrumentNotFound` in both cases; a `building` set's rows are never returned as evidence.

### Additional Unit and Integration Tests

- [x] T008 [P] Compare bound, normalisation and labels in `tests/unit/test_reader_filters.py` (extending the CAP-002-E3-S2 file) and the new `tests/unit/test_reader_input_labels.py` (design section 7 row "Filters model": `ListFilters.symbols` of 1 or 7 raises before SQL, 2 and 6 pass; DAC-E3-S3-1; DEC-0127, DEC-0130, DEC-0132). `ListFilters(symbols=[...])` with 1 or 7 entries raises `ValueError`, 2 and 6 well-formed upper-case entries (for example `["AAA", "BBB"]`) pass, `None` passes (a list, not a compare); `ListFilters(symbols=["AAA", "A%"])` raises `ValueError` (each entry must match the instrument symbol shape; reader design section 4, SEC-INP-001; DEC-0132). `reader.MIN_COMPARE_SYMBOLS is classification_bounds.MIN_COMPARE_SYMBOLS` and likewise MAX, so the bound has one definition. With a recording fake connection (the `tests/unit/governor_fakes.py` pattern) `reader.compare(fake, ["A"])`, `compare(fake, ["A"] * 7)`, `compare(fake, ["aapl", "AAPL"])` (one distinct symbol) and `compare(fake, [])` raise `ValueError` before the fake sees any statement; `compare(fake, [1, 2])` raises `ValueError` (symbols must be strings); `compare(fake, ["AAA", "a b"])` and `compare(fake, ["AAA", "1A"])` raise `ValueError` before the fake sees any statement (after upper-casing, `"A B"` and `"1A"` fail the shape). The module-level `_normalise_symbols(["b", "a", "B"])` returns `["B", "A"]` (upper-cased, deduplicated, first-seen order). `test_reader_input_labels.py`: `reader.INPUT_LABELS is constants.INPUT_LABELS` (the reader re-exports the one label table, reader design 2.6; DEC-0130); its keys, as a set, equal the names of `constants.INPUT_NAMES` flattened over `FACTORS`; and it maps them to the labels `book-to-price`, `earnings yield`, `free-cash-flow yield`, `revenue growth`, `earnings-per-share growth`, `3-month total return`, `6-month total return`, `12-month total return`, none of them equal to its key (STD-UI-1: product vocabulary, never a payload key).
- [x] T009 Compare shape and reuse in `tests/integration/test_reader_compare.py` (design section 7 row "Compare keeps incomplete and unfollowed stocks"; AC-8, AC-16, DAC-E3-2, DAC-E3-12): a compared stock's three cells equal those the unscoped `list_classifications` returns for it (same set, one statement); `restated_possible` is True on a restated value and growth cell and False on the rest, as stored (AC-23); compare ignores thresholds, `hide_incomplete` and the prefix (it uses a default `Thresholds`), so an input-incomplete stock is returned; `page.set`/`page.later` equal `read_set_blocks(conn)`; with no complete set the result is the never-classified page (`set=None`, `never_classified=True`, `stocks=[]`, `unknown_symbols=[]`, `match_count=0`, `later` as `read_set_blocks` returns it) and no list statement runs (statement-counting wrapper); `compare(conn, ["aapl", "msft"])` finds `AAPL` and `MSFT` (DEC-0132) and a duplicated request symbol appears once; a known instrument with no `factor_classification` row in the current set (for example inserted after the set) is absent from `stocks` and reported in `unknown_symbols` (PROVISIONAL, DEC-0131; the comment cites Open Gap 2); a universe is irrelevant to compare (it has no universe argument).
- [x] T010 Evidence details in `tests/integration/test_reader_evidence.py` (design section 7 row "Evidence rows and memberships"; AC-12, AC-17, AC-23, DAC-E3-12): only the current set's rows are returned (seed an older `complete` set and a newer `building` set holding different values for the same stock; the evidence shows the current set's values and its `set.not_current` is True); each cell carries `restated_possible` as stored and each input row its own flag (the cell flag and the input flag are independent stored columns, nothing derived); a stock with an `outdated` input and `reason_input` on its cell shows both consistently; labels come from `reader.INPUT_LABELS` (`label == "book-to-price"` for `book_to_price`); `symbol` lookup is case-insensitive (`"aapl"` finds `AAPL`; DEC-0132); an unknown symbol raises `reader.InstrumentNotFound` with a complete set present; a stock in no universe has `memberships == []`; the evidence read issues exactly two statements (the evidence statement and the memberships statement) plus the set block read, counted by a wrapper, never one per input or per universe.
- [x] T011 Memberships in `tests/integration/test_reader_evidence.py` (design section 7 evidence row; DEC-0057, DEC-0134; AC-17): a stock added to two universes lists both in name order; a rename shows the new name; a stock removed from a universe omits it; a stock removed and then re-added includes it; a retired universe is omitted; a stock added to a universe after the set was built still appears (memberships are not a set property); equal names order by `universe_id`. Equivalence guard: for every seeded non-retired universe and every seeded instrument, `universe_id in {m.universe_id for m in memberships(i)}` equals `i in {row[0] for row in conn.execute(MEMBERSHIP_AS_OF_SQL, {"universe_id": u, "as_of": today})}`, with `today = datetime.now(ZoneInfo("America/Chicago")).date()`, so the reverse-direction statement cannot drift from E1-S2's replay (SA-DUP-001).
- [x] T012 [P] Read-only and parameterisation guard: extend `tests/unit/test_reader_sql_read_only.py` (CAP-002-E3-S1, extended by E3-S2) so its scan also covers `stock_evidence.sql` and `stock_memberships.sql` (one statement each, beginning `WITH` or `SELECT`, no write keyword, comments stripped), and assert both files contain no `{` placeholder and no `%` other than `%(name)s` bound parameters (SEC-INP-002: no request text is substituted; the evidence ordering is passed as bound arrays).

**Checkpoint**: All tests written and failing (no production code yet).

---

## Phase 3: Core Implementation

**Purpose**: Make the tests pass with the compare scope, the two statements, the models and the three public reads.

- [x] T013 Edit the scope predicate of `src/factorflow/classification/sql/list_classifications.sql` (delivered by CAP-002-E3-S2) so the active-only restriction no longer applies to a compare: replace `NOT %(scoped)s::boolean AND i.lifecycle = 'active'` with `NOT %(scoped)s::boolean AND (i.lifecycle = 'active' OR %(symbols)s::text[] IS NOT NULL)`. Change nothing else in the file, add no parameter and no second statement; CAP-002-E3-S2's own tests (retired absent from the unscoped list, which passes no `symbols`) must still pass. Record DEC-0133 in a one-line SQL comment above the clause. (depends on T001)
- [x] T014 [P] Create `src/factorflow/classification/sql/stock_memberships.sql` from the design section 2.6 statement (`latest_member_event` CTE via `DISTINCT ON (e.universe_id)` ordered by `event_id DESC`, the `LATERAL` name from the latest `created`/`renamed` event, `member_added` and not-retired filters), with parameter `%(instrument_id)s` and the order made total: `ORDER BY n.name, u.universe_id`. No other change to the design's statement (DEC-0134). (depends on T001)
- [x] T015 [P] Create `src/factorflow/classification/sql/stock_evidence.sql`, one statement (psycopg runs one statement per `execute` with bound parameters) that returns every row of one stock's evidence through `UNION ALL` over a common column list (`row_kind`, `instrument_id`, `symbol`, `name`, `lifecycle`, `factor`, `input_name`, `status`, `score`, `percentile`, `reason_code`, `reason_input`, `reason_detail`, `value`, `as_of`, `known_on`, `restated_possible`, `detail`, each branch casting its absent columns to the column's type): an `instrument` row from `instrument` where `symbol = %(symbol)s::text` (zero rows means the instrument is unknown); `cell` rows from `factor_classification` where `set_id = %(set_id)s::uuid` and the instrument matches (no row when `set_id` is NULL); and `input` rows from `factor_input` for the same set and instrument. `ORDER BY row_kind_rank, array_position(%(factor_order)s::text[], factor), array_position(%(input_order)s::text[], input_name)` with the two arrays bound by the reader (`FACTORS` and the input definition order), so ordering needs no interpolation. No `JOIN` to `universe_event`. (depends on T001)
- [x] T016 Add to `src/factorflow/classification/reader.py`, in the existing style: `from factorflow.api.classification_bounds import MAX_COMPARE_SYMBOLS, MIN_COMPARE_SYMBOLS` (the only import of that module; it is a constants module, so no cycle with `factorflow.universes.service`, which T020 re-checks); `from factorflow.instruments.symbols import is_valid` (the CAP-001 symbol-shape helper of T001(g); if `reader.py` already imports it for `Thresholds.symbol`, reuse that import; write no symbol-shape regex in `reader.py`); the `ListFilters.__post_init__` check that `symbols`, when not None, holds `MIN_COMPARE_SYMBOLS` to `MAX_COMPARE_SYMBOLS` entries and that every entry is a `str` for which `is_valid(entry)` is true (the instrument symbol shape, reader design section 4, SEC-INP-001), each entry checked as stored and never rewritten (callers upper-case first: `compare` through `_normalise_symbols`, the API through its query model), raising `ValueError` before any SQL (DEC-0127, DEC-0132); `INPUT_LABELS` and `INPUT_NAMES` added to the existing `from factorflow.classification.constants import ...` line (re-exported, so `reader.INPUT_LABELS` exists; `INPUT_LABELS` is the one label table CAP-002-E2-S5 adds and `classify.sql` writes `reason_detail` from, reader design 2.6, DEC-0130; define no label table and write no label literal in `reader.py`); the frozen dataclasses `Membership` (`universe_id`, `name`), `InputRow` (`factor`, `input_name`, `label`, `status`, `value`, `as_of`, `known_on`, `restated_possible`, `detail`; `factor` is added beside the design 2.3 field list because the API's `inputs[]` carries it, Open Gap 5) and `StockEvidence` (`set`, `symbol`, `name`, `lifecycle`, `factors: dict[str, FactorCell]`, `inputs: list[InputRow]`, `memberships: list[Membership]`); `class InstrumentNotFound(LookupError)`; and `_normalise_symbols(symbols) -> list[str]` (upper-case, deduplicate in first-seen order, `ValueError` for a non-string; it does not check the shape, which the `ListFilters` re-check refuses). Do not redefine `FactorCell`, `StockRow`, `ClassificationPage`, `CurrentSet`, `FACTORS`, `INPUT_LABELS` or `read_set_blocks`. (depends on T001, T013)
- [x] T017 Add `compare(conn, symbols) -> ClassificationPage` to `src/factorflow/classification/reader.py` per design 2.5: normalise the symbols, build `ListFilters(symbols=normalised, limit=MAX_COMPARE_SYMBOLS)` (default `sort="symbol"`, `order="asc"`, default `Thresholds`, no universe; the size and symbol-shape checks raise here before any SQL) and call `list_classifications`; return the page unchanged when `never_classified`; otherwise return `dataclasses.replace(page, unknown_symbols=[s for s in normalised if s not in {row.symbol for row in page.stocks}])`, so an unrecognised symbol and a known instrument with no row in the current set are both reported rather than dropped (DEC-0131). Write no SQL and no predicate of its own (DAC-E3-2). No `commit`, no write. (depends on T016)
- [x] T018 Add `stock_evidence(conn, symbol) -> StockEvidence`, the private cell mapper `_cell_from_row` and the private memberships helper to `src/factorflow/classification/reader.py`. Load `stock_evidence.sql` and `stock_memberships.sql` at import as `EVIDENCE_SQL` and `MEMBERSHIPS_SQL` next to the earlier constants (`read_text()`, the `gaps.py` pattern). Sequence: upper-case the symbol; `current, _later = read_set_blocks(conn)`; run `EVIDENCE_SQL` once with `{"symbol", "set_id": current.set_id if current else None, "factor_order": list(FACTORS), "input_order": [name for factor in FACTORS for name in INPUT_NAMES[factor]]}` (the input definition order comes from `INPUT_NAMES`, not from a dict's key order) using a plain cursor and map rows by name through the cursor description (the module-local `_row_to_*` pattern of `runs/queries.py`); zero rows raises `InstrumentNotFound`; build `factors` from the `cell` rows keyed by factor in `FACTORS` order. Each `FactorCell` comes from the new module-private helper `_cell_from_row(row: Mapping[str, Any]) -> FactorCell`, which reads the seven unprefixed columns `status`, `score`, `percentile`, `reason_code`, `reason_input`, `reason_detail`, `restated_possible` by name and derives nothing. Import `Mapping` from `collections.abc` and `Any` from `typing` if the module does not already. This is the only `FactorCell(` call this story adds. CAP-002-E3-S4's `stock_history` reuses it for its rows, which carry the same columns. Leave CAP-002-E3-S2's list mapper, which reads the prefixed `value_status`, ... aliases, unchanged. Build `inputs` from the `input` rows with `label = INPUT_LABELS[input_name]`; run `MEMBERSHIPS_SQL` with the instrument id and build `memberships`. With no current set, or no stored rows for the instrument, `factors` and `inputs` are empty and `set` is `current` (DEC-0131); `later` is not part of the evidence (its `not_current` flag rides on `set`). No `commit`, no write. (depends on T014, T015, T016)

**Checkpoint**: T003 to T012 pass; `uv run mypy src` is clean for the changed module.

---

## Phase 4: Integration

**Purpose**: Confirm the new statements ship in the release image and that the bound, the predicate and the replay each have one definition.

- [x] T019 Run `uv run pytest tests/unit/test_package_data_ships_sql.py` (the guard CAP-002-E1-S1 created and CAP-002-E2-S1 extended). It must pass with `classification/sql/stock_evidence.sql` and `stock_memberships.sql` present, proving a non-editable install carries them (DEC-0088). If it fails, do not edit `pyproject.toml` here: the glob is CAP-002-E2-S1's deliverable; record the failure in the review hand-off. Nothing is mounted or wired in this story: the routes (CAP-002-E3-S5) consume `compare`, `stock_evidence` and `InstrumentNotFound` later. (depends on T014, T015)
- [x] T020 Confirm single definitions (SA-DUP-001): `grep -rn "MIN_COMPARE_SYMBOLS\|MAX_COMPARE_SYMBOLS" src/factorflow/` shows one import in `reader.py` and no literal 2 or 6 bound restated beside it; `grep -n "FROM factor_classification\|IS DISTINCT FROM 'classified'" src/factorflow/classification/reader.py` returns nothing (no second predicate in Python; `hide_incomplete` is deliberately not in this pattern, because CAP-002-E3-S2's `Thresholds.hide_incomplete` field and the `hide_incomplete` parameter `_run_list` binds legitimately live in `reader.py` per design 2.3) and `grep -rn "hide_incomplete" src/factorflow/classification/sql/` still shows `list_classifications.sql` only; `grep -n "universes.service" src/factorflow/classification/reader.py` returns nothing (CAP-002-E1-S5's `create_from_filter` imports this reader, so the reverse import would be a cycle) and the CAP-002-E3-S2 subprocess import-order test still passes. `grep -rn "free-cash-flow yield" src/factorflow/` shows exactly one line, in `src/factorflow/classification/constants.py`, and `grep -n "^INPUT_LABELS" src/factorflow/classification/reader.py` returns nothing (one label table, reader design 2.6; DEC-0130). Note for the reviewer: CAP-002-E3-S2's T022 grep for `api.classification_bounds` in `reader.py` is a point-in-time check of that story; this story adds the import deliberately (T016). (depends on T018)

**Checkpoint**: The new SQL is covered by the package-data guard and the reader imports nothing it must not.

---

## Phase 5: Polish

**Purpose**: Final refinements and cross-cutting concerns

- [x] T021 Run the full validation set (Validation Plan below), fix any lint, format or type finding in the files this story added or extended, and confirm the module docstring and test comments cite DAC-E3-S3-1 to DAC-E3-S3-5, DAC-E3-7, DAC-E3-8, DAC-E3-12 and the five TC-IDs. Add no file beyond the two SQL files, `test_reader_compare.py`, `test_reader_evidence.py`, `test_reader_input_labels.py`, the `reader_seed.py`, `test_reader_filters.py` and `test_reader_sql_read_only.py` extensions, the one-clause edit to `list_classifications.sql` and `reader.py`. (depends on T018, T019, T020)
- [x] T022 After each TDD cycle in T003–T021 — not once at the end — stage only that cycle's diff, dispatch an independent code-review subagent and an independent spec-drift subagent against it, and append the cycle to `CAP-002-E3-S3-tdd-evidence.yaml` beside this story with `code_review_verdict`, `spec_drift.drift_detected`, `tests_executed: true`, its RED/GREEN evidence and `diff_sha256` — the SHA-256 of the staged diff the reviews judged — before the next cycle begins. Never include a `REJECTED` or `drift_detected: true` cycle in a commit. Each cycle's `commit_hash` names the commit carrying it: the cycle's own commit, or — when a driver commits once per stage, so the stage commit carries this file and cannot hold its own hash — `commit_hash: stage` (INV-TDD-002, TEST-TDD-008; traces to no AC)

**Checkpoint**: All acceptance criteria satisfied, all validation passes, and every behaviour-changing commit is named by a TDD-evidence cycle entry.

---

## Dependencies & Execution Order

### Story Dependency Classification

Every other story ID cited by this plan must either be a hard edge in the
capability's `dependencies.yaml` or appear here as `reverse`, `soft`, or
`context`. A newly discovered hard dependency must be added to the graph.

| Story | Classification | Evidence |
|---|---|---|
| CAP-002-E3-S2 | hard | Existing graph edge. `list_classifications`, `ListFilters`, `FactorCell`, `StockRow`, `ClassificationPage` and `list_classifications.sql` are extended and reused here (T001, T013, T016, T017) |
| CAP-002-E1-S2 | hard | Existing graph edge. `MEMBERSHIP_AS_OF_SQL` is the oracle of the memberships equivalence test (T011) and the event tables it replays back `stock_memberships.sql` |
| CAP-002-E1-S6 | hard | New edge, added to `dependencies.yaml`. Creates `src/factorflow/api/classification_bounds.py` (`MIN_COMPARE_SYMBOLS`, `MAX_COMPARE_SYMBOLS`) that `reader.py` imports (T016, design 2.3). No cycle: E1-S6 depends on E1-S3, E1-S4, E1-S5, and E1-S5 on E3-S2; nothing in that chain depends on E3-S3. Anticipated by DEC-0127 |
| CAP-002-E2-S5 | hard | New edge, added to `dependencies.yaml` (cross-plan review E3-F05). Adds `INPUT_LABELS` to `src/factorflow/classification/constants.py` (cross-plan review E2-F15). It is the one label table `classify.sql` writes `reason_detail` from, and `reader.py` imports it for each evidence input's `label` (T001, T008, T016, T018; reader design 2.6; DEC-0130). No cycle: E2-S5 depends only on E2-S2, which depends on E2-S1 and E1-S1; none of them depends on an E3 story |
| CAP-002-E3-S1 | context | `read_set_blocks`, `CurrentSet` and `reader_seed.py` are used here, reached through CAP-002-E3-S2's hard edge |
| CAP-002-E1-S5 | context | Only named in the cycle argument for E1-S6 above; this story imports nothing from `universes.service` (T020) |
| CAP-002-E1-S1 | context | Owns the `universe` and `universe_event` tables the seed helpers write (T002) and the package-data guard (T019); reached through CAP-002-E1-S2 |
| CAP-002-E2-S1 | context | Owns `0005`/`0006` tables and the package-data glob (T019); reached through CAP-002-E3-S1 via CAP-002-E3-S2 |
| CAP-002-E2-S2 | context | Owns `constants.py` (`FACTORS`, `INPUT_NAMES`); T008 checks `INPUT_LABELS`'s keys against `INPUT_NAMES` and T018 flattens `INPUT_NAMES` for the input order; reached through CAP-002-E3-S1 |
| CAP-002-E3-S4 | reverse | Its volume test (TC-COMP-153) runs against the compare and list reads built here, and its `stock_history` reuses the `_cell_from_row` mapper added here (T018) (graph edge `E3-S4: [E3-S3]`) |
| CAP-002-E3-S5 | reverse | The compare and evidence routes call `compare`, `stock_evidence` and map `InstrumentNotFound` |

### Task Dependencies
- T001: No dependencies
- T002: Depends on T001
- T003, T004, T005, T009: Depend on T002; `test_reader_compare.py` (T005 also touches `test_reader_evidence.py`), written in order
- T006, T007, T010, T011: Depend on T002; same file `test_reader_evidence.py`, written in order after T005's evidence half
- T008, T012: Depend on T001; separate unit files, can run in parallel with every other test task (T008 and T012 fail until Phase 3)
- T013: Depends on T001; after Phase 2
- T014, T015: Depend on T001; can run in parallel with T013 and each other
- T016: Depends on T001, T013
- T017: Depends on T016
- T018: Depends on T014, T015, T016; can run in parallel with T017
- T019: Depends on T014, T015
- T020: Depends on T018
- T021: Depends on T018, T019, T020
- T022: Interleaved — runs after every TDD cycle, before the next cycle begins

### Parallel Opportunities
- Phase 2: the compare group (T003, T004, T009), the evidence group (T006, T007, T010, T011) and the unit files (T008, T012) are independent files, with T005 as the one task spanning compare and evidence
- Phase 3: T013, T014 and T015 are independent files; T017 and T018 can run in parallel after T016

---

## Validation Plan

### Constitution-Defined Commands
- Build: none defined for Python in the tech-stack Validation Commands table (no separate build step)
- Test: `uv run pytest -m postgres` and `uv run pytest -m 'not postgres'` (the story's Validation section; `uv run pytest` runs both)
- Lint: `uv run ruff check .`
- Format: `uv run ruff format --check .`
- Type check: `uv run mypy src`

If no container runtime is available, run `uv run pytest -m 'not postgres'` and report that the `postgres`-marked compare and evidence tests were excluded (tech stack, Validation Commands note).

### Story-Specific Validation
- DAC-E3-S3-1: `uv run pytest tests/integration/test_reader_compare.py -m postgres` shows TC-COMP-123 green: incomplete, unranked and retired stocks returned; 1 and 7 symbols raise before any statement; the unit half in `tests/unit/test_reader_filters.py` (count and symbol-shape refusals) passes with no database
- DAC-E3-S3-2: TC-COMP-124 green, `unknown_symbols` in request order, nothing dropped
- DAC-E3-S3-3: `uv run pytest tests/integration/test_reader_evidence.py -m postgres -k "evidence"` shows TC-COMP-146 green: eight input rows in definition order with dates, `restated_possible`, memberships in name order
- DAC-E3-S3-4: TC-COMP-113 green in both files: the retired stock keeps `retired` on every cell in compare and evidence, and stays out of the unscoped list
- DAC-E3-S3-5: TC-COMP-147 green: `set` None, empty `factors` and `inputs`, same dataclass fields as the populated read
- DAC-E3-12: the compare and evidence tests of T009 and T010 show `restated_possible` on cells and inputs as stored
- Single definitions: `tests/unit/test_reader_sql_read_only.py` passes with the two new files; the `grep` checks of T020 return as stated; the memberships equivalence test of T011 passes

---

## Notes

### Resolved Conflicts

- **Reader design 2.5 "compare ... no lifecycle restriction" versus CAP-002-E3-S2's list scope, which restricts an unscoped read to `lifecycle = 'active'` (DEC-0073).** DAC-E3-S3-1 and DAC-E3-S3-4 (story acceptance criteria) require compare to return a retired stock; DAC-E3-S2-3 requires the unscoped list to exclude it. Both hold when the active restriction applies only while `symbols` is null. Story acceptance criteria outrank an earlier plan's illustrative scope (precedence step 1). The plan edits one clause of the statement CAP-002-E3-S2 delivers and writes no second statement (T013; DEC-0133).
- **Story "memberships via E1's membership replay" versus reader design 2.6, which gives `stock_memberships.sql` as its own statement.** `membership_as_of.sql` answers "members of one universe"; the memberships read needs "universes of one instrument", and looping the per-universe statement would cost one query per universe per read. The design's statement is the more specific contract and implements the same rule (latest member event decides, DEC-0057); the story names the same file. The plan runs the design's statement and adds an equivalence test against E1-S2's `MEMBERSHIP_AS_OF_SQL` as the single-definition guard (T011, T014; DEC-0134).
- **Reader design 7 "`ListFilters.symbols` of 1 or 7 raises before SQL" versus CAP-002-E3-S2, which stores `symbols` unchecked.** Not a conflict: DEC-0127 deferred the check to this story, whose edge to CAP-002-E1-S6 closes no cycle. The check lands in `ListFilters.__post_init__` (T016) with its tests in `test_reader_filters.py` (T008).
- **Illustrative design 2.6 statement text versus psycopg's one-statement-per-execute rule.** Design 2.6 describes `stock_evidence.sql` as resolving the instrument, the three cells and the inputs together; one `UNION ALL` statement with a row-kind column does so in one file and one round trip (T015). The design's prose governs, the shape is the implementation's.

### Open Gaps

1. **PROVISIONAL — awaiting owner confirmation (2026-10-17): the label of each `factor_input` row.** Reader design 2.6 says `label` is "the same table `factor-engine` writes `reason_detail` from", but `factor-engine` defines only `LineItem.label` for the seven line items and an `INPUT_NAMES` list; no approved artifact defines a table that maps an input name to a label. The values come from the UX brief section 2 item 9 and the UX design wording (Momentum row, input descriptions) under STD-UI-1, which factor-engine section 10 also requires of `reason_detail`: `book_to_price` "book-to-price", `earnings_yield` "earnings yield", `fcf_yield` "free-cash-flow yield", `revenue_growth` "revenue growth", `eps_growth` "earnings-per-share growth", `return_3m`/`return_6m`/`return_12m` "3-month/6-month/12-month total return". The table is `INPUT_LABELS` in `src/factorflow/classification/constants.py`, added by CAP-002-E2-S5, whose `classify.sql` builds `reason_detail` from it (cross-plan review E2-F15; DEC-0120). `reader.py` imports and re-exports it (T016), and T008 pins its identity, keys and values. Recorded as DEC-0130. Owner-directed fix (cross-plan review 2026-10-18, E3-F05): the reader no longer defines its own `INPUT_LABELS`; it imports `constants.INPUT_LABELS`, owned by CAP-002-E2-S5, and the graph gains `CAP-002-E3-S3 -> CAP-002-E2-S5` — derivation: as first written, this plan kept a second table in `reader.py` while CAP-002-E2-S5 T015 (DEC-0120) built `reason_detail` from the input name with underscores shown as spaces. One input therefore read "free-cash-flow yield" on its row and "fcf yield missing" in its cell, which splits design 2.6's one table. The engine stage cannot import `reader.py` (no E2-S5 edge reaches an E3 story), and both modules already import `constants.py`. The values stay DEC-0130's because `input_name.replace('_', ' ')` contradicts design 2.6's own example `book-to-price`, the UX design's input names and factor-engine section 10 ("never a payload key"). Flag for the next revision of reader design 2.6 and factor-engine 2.5 and 10: name `constants.INPUT_LABELS` as the table.
2. **PROVISIONAL — awaiting owner confirmation (2026-10-17): a known instrument with no stored rows in the current set.** Neither the acceptance criteria nor the designs say what compare or evidence returns for an instrument that exists but has no `factor_classification` row (for example one added after the set was built), and `FactorCell` has no reason code for an absent row. The plan returns stored rows only: compare reports such a symbol in `unknown_symbols` (so it is not silently dropped) and evidence returns empty `factors` and `inputs`; evidence read before any set exists is the same case with `set` None (DAC-E3-S3-5). Derivation: STD-UI-15 (nothing recomputed or invented), the closed reason-code enumeration, DAC-E3-S3-2 and STD-UI-16 (never drop a requested symbol), and that every roster stock and every retired instrument does carry rows. Recorded as DEC-0131. Flag for reader design 2.5/2.6: either define a cell for "no row" or state that `unknown_symbols` also carries unscored instruments.
3. **PROVISIONAL — awaiting owner confirmation (2026-10-17): symbol normalisation and the 2-to-6 count.** No artifact says whether compare upper-cases symbols or counts duplicates. The plan upper-cases, deduplicates in first-seen order and applies the 2-to-6 check to the distinct symbols (`["AAPL", "aapl"]` is one symbol and is rejected); `stock_evidence` upper-cases its symbol. Derivation: symbols are stored upper-case and `Thresholds.symbol` already upper-cases; a duplicate pair would otherwise pass the check and yield a one-column "side by side". Recorded as DEC-0132. Flag for the API design's compare model (it should normalise the same way before calling).
4. **Compare with no current set.** Design 2.7's short-circuit returns `unknown_symbols=[]`, so requested symbols vanish into the never-classified page. Followed as written: nothing is classified, and the page says so; reporting every symbol unknown would be false. Not a bound; flag for the API design if a distinct message is wanted.
5. **`InputRow.factor`.** Design 2.3 lists `InputRow` without `factor`, but the API design's `inputs[]` carries `factor` (section 2.7 `StockEvidenceResponse`). The sibling contract needs it and an additive field breaks nothing; the plan includes it. Flag for the next revision of reader design 2.3.
6. **"Name order" collation.** The memberships order is `ORDER BY n.name, u.universe_id` under the database's default collation; no artifact fixes a collation. Tests use ASCII names only. Not a bound.
7. **Evidence carries no `later` block.** Design 2.3 gives `StockEvidence` the `CurrentSet` only; `CurrentSet.not_current` carries the "a newer download is being scored" signal, so the plan adds nothing.
8. Owner-directed fix (cross-plan review 2026-10-18, E3-F10): a compare symbol that fails the instrument symbol shape after upper-casing is refused with `ValueError` before any SQL by the `ListFilters.__post_init__` re-check, which uses `factorflow.instruments.symbols.is_valid` and checks each entry as stored without rewriting; only a well-formed symbol that names no instrument is reported in `unknown_symbols` (T004, T008, T016, T017; DEC-0132 amended) — derivation: reader design section 4 (SEC-INP-001) requires each `symbols` entry to match the instrument symbol shape, re-checked by the dataclasses' `__post_init__`; API design section 2.4 fixes the shape as `^[A-Z][A-Z0-9.-]{0,15}$` after upper casing for every symbol; universe-service design section 2.3 names `factorflow.instruments.symbols` as the shared helper so symbol checks never disagree; `ValueError` is the refusal every `__post_init__` check in `reader.py` already raises (DEC-0127, CAP-002-E3-S2 T017); CAP-002-E3-S5 T016 refuses the same symbol with 422 at the API, so the reader and the API agree.
9. **Owner-directed fix (cross-plan review 2026-10-18, E3-F11): one mapper for the unprefixed cell columns.** The evidence `cell` rows become `FactorCell`s through one module-private helper in `reader.py`, `_cell_from_row(row: Mapping[str, Any]) -> FactorCell`. It reads `status`, `score`, `percentile`, `reason_code`, `reason_input`, `reason_detail` and `restated_possible` by name, and CAP-002-E3-S4's `stock_history` reuses it (T018). Derivation: reader design 2.3 fixes `FactorCell`'s seven fields but names no mapper. The evidence statement (T015) and CAP-002-E3-S4's history statement (its T012) return those seven columns under the same unprefixed names, so one helper serves both. CAP-002-E3-S2's list mapper reads the prefixed aliases and stays separate. That leaves CAP-002-E3-S4's single-definition grep (its T018) with exactly two construction sites, the list mapper and `_cell_from_row` (SA-DUP-001).

### Other Notes

- **Dependency graph.** Edges added: `CAP-002-E3-S3: [CAP-002-E3-S2, CAP-002-E1-S2, CAP-002-E1-S6, CAP-002-E2-S5]` (E1-S6 supplies `classification_bounds.py`; E2-S5 supplies `constants.INPUT_LABELS`, cross-plan review E3-F05; no cycle, see the table). The scheduling cost is real: E3-S3 now waits for E1-S3 to E1-S6; if the owner prefers the compare bound to live in the reader, that is a design change to reader design 2.3 and the API design, not a planning choice.
- **Story status.** The skill's step of setting the story's frontmatter `status: planning` was not performed: the supervising instruction forbids editing the approved story. The story stays `todo`.
- **Consistency with the CAP-002-E3-S1 and E3-S2 plans.** This plan extends, and does not redefine, `read_set_blocks`, `CurrentSet`, `reader_seed.py`, `ListFilters` and `list_classifications.sql`; it reuses their import-at-load SQL pattern, statement-counting wrapper, `_row_to_*` mapping and `migrated_run_schema_connection` fixture. The one cross-story edit (T013) is a single clause in a statement that exists only once CAP-002-E3-S2 has landed.
- **Compare volume.** Compare is bounded at 6 rows by the 2-to-6 check and `limit=MAX_COMPARE_SYMBOLS`; no volume proof is needed here. The 3000-stock proof belongs to CAP-002-E3-S4.
- **Index use.** `stock_evidence.sql` reads `factor_input` and `factor_classification` by their primary keys' `set_id` prefix with the instrument filter, and `stock_memberships.sql` by `idx_universe_event_instrument` (research-store section 2.5); neither is asserted with `EXPLAIN` here because one stock's rows are not a volume concern (the summary proof of CAP-002-E3-S1 covers the pattern).
- **Risk.** Run T001 first. CAP-002-E3-S2, CAP-002-E1-S2, CAP-002-E1-S6 and CAP-002-E2-S5 are `todo` at planning time; `classification_bounds.py` is the latest of them to land, and the import of `MAX_UNIVERSE_NAME_LENGTH`'s module must not pull an unresolved owner input (read only the two compare constants).
