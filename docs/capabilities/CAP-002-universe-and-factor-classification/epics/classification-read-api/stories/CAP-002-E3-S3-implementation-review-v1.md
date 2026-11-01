---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S3-implementation-review
artifact_type: implementation-review
artifact_version: 1
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-01
updated: 2026-11-01
story_id: "CAP-002-E3-S3"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S3.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 1
reviewed_at: "2026-11-01T03:26:38Z"
reviewed_head: "7e9ec3a9dc256a1e8f759e0c9aa66a477ba36f67"
review_base: "85254d12f58d74865c59c95d9a21e986d6c79713"
reviewed_state_revision: "sha256:7b000adee14338919680a7688fd9e1036d8de1ff34f18af30bfde7ae71421b50"
verdict: CHANGES-REQUIRED
review_subjects:
  - artifact_id: CAP-002-E3-S3
    artifact_version: 1
    content_revision: sha256:55a201cea26b0ad63514f32efe41e8ad0c3940d1ce881d01dafcaae040a74115
ai_provenance:
  agent_id: adversarial-review-agent
  agent_version: "1.0"
  model: claude-opus-5-5
  tool: Claude Code
  tool_version: "2.1.290"
  timestamp: 2026-11-01T03:26:38Z
  source_artifacts:
    - id: CAP-002-E3-S3
      version: "1 (sha256:55a201cea26b0ad63514f32efe41e8ad0c3940d1ce881d01dafcaae040a74115)"
    - id: CAP-002-E3-S3-tasks
      version: "1 (updated 2026-10-18)"
    - id: CAP-002-E3-S3-tdd-evidence
      version: "cycle-1"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-classification-reader-component-tests
      version: "1"
    - id: CAP-002-coverage-matrix
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E3-S3 — Version 1

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 3 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 7/10 satisfied |
| Planned tasks | 20/22 verified |
| Required validation | 9/9 passed |

**By severity:** CRITICAL 0 · HIGH 3 · MEDIUM 0 · LOW 1 · **total 4**

This is an initial review, so every finding has scope `initial`. The production
code is correct as far as this review could trace it. `compare` reuses the one
list statement, and its one-clause scope edit (DEC-0133) keeps a retired stock
in a compare while the unscoped list still omits it. `stock_evidence` binds the
current set's id and reads only that set. The memberships statement is the
design 2.6 replay, and it agrees with E1-S2's `MEMBERSHIP_AS_OF_SQL` in the
equivalence test. All nine required validation commands pass when rerun
independently: 865 postgres-marked and 1456 other tests passed, plus 1 xfail.
ruff, format and mypy are clean, and the TDD-evidence lint reports 0 errors.

The gate fails on test strength. This review regenerated the mutation catalogue
over the whole change set (38 mutants) and added 34 hand-written ones. Five
non-equivalent survivors are left:

- **IR-001 (HIGH).** Every evidence test seeds exactly one stock with rows in the
  current set. A statement that returns other stocks' cells or inputs as this
  stock's evidence therefore passes the mandatory TC-COMP-146 and every other
  test (`manual:evidence-cells-any-instrument`,
  `manual:evidence-inputs-any-instrument`).
- **IR-002 (HIGH).** TC-COMP-146's order assertions cannot fail. The fixture
  inserts cells and inputs in the expected order, so dropping either ordering key
  survives (`manual:evidence-input-order-removed`,
  `manual:evidence-factor-order-removed`).
- **IR-003 (HIGH).** T009's never-classified compare test asserts
  `later == read_set_blocks(conn)[1]` with no set at all, where both sides are
  `None`. Dropping `later` from that page survives
  (`manual:compare-never-classified-later-dropped`).

The fourth finding, IR-004 (LOW), is about evidence quality. The TDD evidence
calls the dropped `universe_id` tiebreak equivalent, but it argues from
PostgreSQL executor behaviour rather than from an artifact. The test of that
tiebreak cannot fail either way.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S3.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S3-run-20261101T024649Z` |
| HEAD | `7e9ec3a9dc256a1e8f759e0c9aa66a477ba36f67` (`feat(CAP-002-E3-S3): compare, stock evidence and stock memberships reads`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-integration-20261101T024649Z` → `85254d12f58d74865c59c95d9a21e986d6c79713` (resolved by `pipeline-state.py review-base --base-ref`; an ancestor of HEAD) |
| Working tree | clean: nothing staged, unstaged or untracked, before and after validation |
| Changed files reviewed | 19 (one commit, `85254d1..7e9ec3a`) |
| Baseline | none: initial review |

### Changed Files

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/reader.py` | modified | DAC-E3-S3-1 to -5, DAC-E3-7, DAC-E3-8, DAC-E3-12; T016, T017, T018 |
| `src/factorflow/classification/sql/list_classifications.sql` | modified | DAC-E3-S3-1, DAC-E3-S3-4; T013 (DEC-0133) |
| `src/factorflow/classification/sql/stock_evidence.sql` | added | DAC-E3-S3-3, DAC-E3-S3-5; T015 |
| `src/factorflow/classification/sql/stock_memberships.sql` | added | DAC-E3-S3-3, DAC-E3-8; T014 (DEC-0134) |
| `tests/integration/reader_seed.py` | modified | T002 |
| `tests/integration/test_reader_compare.py` | added | TC-COMP-123, 124, 113; T003, T004, T005, T009 |
| `tests/integration/test_reader_evidence.py` | added | TC-COMP-146, 113, 147; T005, T006, T007, T010, T011 |
| `tests/unit/test_reader_filters.py` | modified | T008 |
| `tests/unit/test_reader_input_labels.py` | added | T008 |
| `tests/unit/test_reader_sql_read_only.py` | modified | T012 |
| `docs/.../stories/CAP-002-E3-S3.md` | modified | `status: planning` → `in-review` only |
| `docs/.../stories/CAP-002-E3-S3-tasks.md` | modified | the 22 checkboxes `[ ]` → `[x]` only (word diff) |
| `docs/.../stories/CAP-002-E3-S3-tdd-evidence.yaml` | added | T022 |
| `docs/.../stories/CAP-002-E3-S3-evidence/cycle-1.patch` | added | T022; it equals the committed `src/` and `tests/` diff file by file, and its SHA-256 `5e90be32…0684` is the cycle's `diff_sha256` |
| `docs/.../stories/CAP-002-E3-S3-evidence/red-cycle-1.log` | added | T022 (RED: 52 failed, 60 passed) |
| `docs/.../stories/CAP-002-E3-S3-evidence/code-review-cycle-1.txt` | added | T022 (APPROVED) |
| `docs/.../stories/CAP-002-E3-S3-evidence/spec-drift-cycle-1.txt` | added | T022 (DRIFT: NONE) |
| `docs/.../stories/CAP-002-E3-S3-evidence/mutants-cycle-1.json` | added | T022 |
| `docs/.../stories/CAP-002-E3-S3-evidence/mutation-cycle-1-results.json` | added | T022 |

No unjustified file, dependency or configuration change. `pyproject.toml`,
`uv.lock` and `tests/conftest.py` are unchanged.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-16 | SATISFIED | `reader.py:compare` (572) over `list_classifications` with `symbols` set; `list_classifications.sql` scope clause | `test_reader_compare.py`: `test_compare_returns_every_known_symbol_two_to_six_only`, `test_compare_orders_by_symbol_whatever_the_request_order`, `test_compare_shares_the_list_statement_and_cell_model` | This story covers AC-16's compare half (side by side). Sort and filter belong to CAP-002-E3-S2 |
| AC-17 | PARTIAL | `stock_evidence.sql` input branch; `reader.py:stock_evidence` (589) builds `InputRow` with `value`, `as_of`, `known_on` | `test_evidence_returns_every_input_with_dates_and_universes_in_name_order`, `test_evidence_input_row_carries_the_dates_the_statement_stored` | Production is correct. No test can tell this stock's inputs from another stock's (IR-001) |
| DAC-E3-7 | SATISFIED | `ListFilters.__post_init__` (350–357) checks a count of 2 to 6 and the shape through `is_valid`; `compare` computes `unknown_symbols` (583–586) | TC-COMP-123, TC-COMP-124 and the unit `test_compare_refuses_a_bad_request_before_any_statement` | Bound imported from `api.classification_bounds` (T020 grep) |
| DAC-E3-8 | PARTIAL | `stock_evidence.sql`, `stock_memberships.sql`, `_memberships` (637) | TC-COMP-146, the memberships tests, `test_memberships_agree_with_the_membership_replay` | Memberships are adequately proved. The "this stock's `factor_input` rows" half has the IR-001 gap |
| DAC-E3-12 | SATISFIED | `_cell_from_row` (643) reads the stored `restated_possible`; `InputRow.restated_possible` comes from the input row; compare reuses the list mapper | `test_compare_shares_the_list_statement_and_cell_model`, `test_evidence_cell_and_input_restatement_flags_are_independent` | Mutants dropping either flag are killed (`manual:evidence-cell-restated-dropped`, `manual:evidence-input-restated-dropped`) |
| DAC-E3-S3-1 | SATISFIED | `ListFilters.__post_init__`; scope clause `(i.lifecycle = 'active' OR %(symbols)s::text[] IS NOT NULL)` | TC-COMP-123 (B incomplete, C unranked, R retired, all returned; 1 and 7 refused with no statement run) and the unit bound tests | All six bound and shape mutants are killed |
| DAC-E3-S3-2 | SATISFIED | `compare` (583–586) | TC-COMP-124 (`["NOPE"]`, `["ZZZ", "NOPE"]` in request order, all unknown, none unknown) | With no complete set, compare returns the never-classified page with `unknown_symbols=[]`. That is task plan Open Gap 4, flagged there for the API design, and not a defect of this change |
| DAC-E3-S3-3 | PARTIAL | `stock_evidence.sql` (instrument, cell and input branches, ordered by bound arrays); `reader.py` 589–634 | TC-COMP-146 | Production is correct. The test cannot fail under a cross-instrument leak (IR-001) or a dropped ordering key (IR-002) |
| DAC-E3-S3-4 | SATISFIED | Scope clause (DEC-0133); evidence reads the stored `retired` cells | `test_compare_keeps_a_retired_stock_while_the_list_still_omits_it`, `test_evidence_keeps_a_retired_stock_with_the_retired_reason` | `manual:compare-scope-always-active` and `-always-all` are killed |
| DAC-E3-S3-5 | SATISFIED | `stock_evidence` binds `set_id=None` when `current` is None, so the cell and input branches return nothing | `test_evidence_with_no_current_set_has_a_null_set_and_the_same_shape[no_set, building_only]` | `manual:evidence-reads-later-set` and `manual:evidence-set-block-dropped` are killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | Every producer exists at the base: `reader.py` E3-S1/E3-S2 names, `MEMBERSHIP_AS_OF_SQL` in `universes/replay.py`, `classification_bounds.py` (2, 6), `constants.INPUT_NAMES` (a mapping by factor) and `INPUT_LABELS`, migrations 0005/0006, `instruments.symbols.is_valid` | Only the two compare constants are imported (`reader.py:71`) |
| T002 | complete | VERIFIED | `reader_seed.py`: `seed_inputs`, `rename_universe`, `insert_input(restated_possible=False, detail=None)` | `add_member` and `remove_member` already existed and were reused. No signature changed and no fixture added |
| T003 | complete | VERIFIED | `test_compare_returns_every_known_symbol_two_to_six_only`, `test_compare_orders_by_symbol_whatever_the_request_order` | TC-COMP-123 |
| T004 | complete | VERIFIED | `test_compare_reports_an_unrecognised_symbol` | TC-COMP-124. Malformed symbols are refused in the unit file (T008) |
| T005 | complete | VERIFIED | `test_compare_keeps_a_retired_stock_while_the_list_still_omits_it`, `test_evidence_keeps_a_retired_stock_with_the_retired_reason` | TC-COMP-113, both halves |
| T006 | complete | PARTIAL | `test_evidence_returns_every_input_with_dates_and_universes_in_name_order` | TC-COMP-146 is WEAK (IR-001, IR-002). The fixture has seven `present` inputs and one `missing`, not the plan's six/one `outdated`/one `missing`. The `outdated` case lives in `test_evidence_input_row_carries_the_dates_the_statement_stored` |
| T007 | complete | VERIFIED | `test_evidence_with_no_current_set_has_a_null_set_and_the_same_shape` (two cases) | TC-COMP-147. The PROVISIONAL DEC-0131 comment is present |
| T008 | complete | VERIFIED | `test_reader_filters.py` (bound, shape, the no-statement fake, `_normalise_symbols`), `test_reader_input_labels.py` | Every bound, shape and normalisation mutant is killed |
| T009 | complete | PARTIAL | `test_compare_shares_the_list_statement_and_cell_model`, `..._ignores_thresholds_...`, `..._carries_the_set_and_later_blocks`, `..._with_no_complete_set_is_the_never_classified_page`, `..._normalises_case_...`, `..._known_instrument_with_no_row_...`, `..._independent_of_universes` | The plan's "`later` as `read_set_blocks` returns it" on the never-classified page is asserted only where `later` is None (IR-003) |
| T010 | complete | VERIFIED | `test_evidence_reads_only_the_current_set`, `..._restatement_flags_are_independent`, `..._outdated_input_...`, `..._case_insensitive_...`, `..._no_universe_...`, `..._two_statements_besides_the_set_block_read` | Two statements beyond the set read, asserted by identity with `EVIDENCE_SQL`/`MEMBERSHIPS_SQL` |
| T011 | complete | VERIFIED | Memberships tests at `test_reader_evidence.py:354–433` | The equivalence guard compares both statements over every non-retired seeded universe. IR-004 covers the equal-names test |
| T012 | complete | VERIFIED | `test_reader_sql_read_only.py`: both files in the one-statement scan, plus `test_evidence_statements_substitute_no_request_text` | — |
| T013 | complete | VERIFIED | `list_classifications.sql:19–22` | The planned clause and a one-line DEC-0133 comment. E3-S2's list tests pass in the postgres suite |
| T014 | complete | VERIFIED | `stock_memberships.sql` | The design 2.6 statement with `ORDER BY n.name, u.universe_id` and a header comment |
| T015 | complete | VERIFIED | `stock_evidence.sql` | Justified deviation: the `UNION ALL` is wrapped in a subquery because PostgreSQL rejects expressions in a `UNION`'s `ORDER BY`. This is recorded in the TDD evidence. Ordering uses the bound arrays and there is no `universe_event` join |
| T016 | complete | VERIFIED | `reader.py` 71, 78, 350–357, 379–426 | `INPUT_LABELS`/`INPUT_NAMES` imported from `constants` and re-exported. `InstrumentNotFound(LookupError)` carries `.symbol` |
| T017 | complete | VERIFIED | `reader.py:compare` (572–586) | No SQL of its own. The never-classified page is returned unchanged |
| T018 | complete | VERIFIED | `reader.py:stock_evidence` (589–634), `_memberships` (637), `_cell_from_row` (643) | The one new `FactorCell(` site (two in the module, as the plan expects) |
| T019 | complete | VERIFIED | `tests/unit/test_package_data_ships_sql.py` passes (10 passed). The glob `classification/sql/*.sql` covers both new files | — |
| T020 | complete | VERIFIED | Greps rerun (see Independent Validation) | All return as stated |
| T021 | complete | VERIFIED | Module docstring cites DAC-E3-S3-1 to -5, DAC-E3-7, DAC-E3-8, DAC-E3-12 and the five TC-IDs. Full validation is green | No file beyond the plan's list |
| T022 | complete | VERIFIED | `CAP-002-E3-S3-tdd-evidence.yaml` cycle-1, `commit_hash: stage`; lint 0 errors. `cycle-1.patch` equals the committed code diff | One RED/GREEN cycle matches the plan's tests-first then code structure. IR-004 covers one survivor disposition |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_compare_returns_every_known_symbol_two_to_six_only` / TC-COMP-123 | ADEQUATE | 2 and 6 symbols, stored status and reason per cell, retired `lifecycle`, `match_count`, `next_cursor`, and 1 and 7 refused with zero statements through a counting wrapper | none |
| `test_compare_reports_an_unrecognised_symbol` / TC-COMP-124 | ADEQUATE | One unknown, two unknown in request order, all unknown with `match_count` 0, none unknown | none |
| `test_compare_keeps_a_retired_stock_while_the_list_still_omits_it` / TC-COMP-113 (compare) | ADEQUATE | Three `retired` cells, and the unscoped list still excludes R. Kills both scope mutants | none |
| `test_evidence_keeps_a_retired_stock_with_the_retired_reason` / TC-COMP-113 (evidence) | ADEQUATE | Three `retired`/`not_classified` cells, no inputs, membership kept | none |
| `test_evidence_returns_every_input_with_dates_and_universes_in_name_order` / TC-COMP-146 | WEAK | Labels, values as `Decimal`, dates, the `missing` row, input restatement, `detail`, memberships in name order, set block, cells equal to stored rows | The only stock with rows in the set is AAPL, so another stock's rows would pass (IR-001). Rows are seeded in the asserted order, so the ordering keys are untested (IR-002) |
| `test_evidence_with_no_current_set_has_a_null_set_and_the_same_shape` / TC-COMP-147 | ADEQUATE | No set and building-only (with building inputs) both give `set` None, empty `factors`/`inputs`, populated memberships, the fixed field list, and `InstrumentNotFound` | The fields comparison of instance against class is tautological, but the explicit field-name list and `isinstance` carry it |
| Additional compare tests (T009) | WEAK (one test) | Shared statement (one `WITH scope AS` statement), stored `restated_possible`, default thresholds, set/later blocks with a building later, normalisation and dedupe, a known instrument with no row reported, independence from universes | `test_compare_with_no_complete_set_is_the_never_classified_page` asserts `later` only where it is None (IR-003). The other T009 tests are ADEQUATE |
| Additional evidence tests (T010) | ADEQUATE | Current set only (older complete plus newer building with different values), independent restatement flags, outdated input and cell reason, case-insensitive lookup, unknown symbol, no universe, statement count | none beyond IR-001, which is TC-COMP-146's |
| Memberships tests (T011) | ADEQUATE | Two universes in name order, rename, removal, re-add, retired universe, late addition, equal names, equivalence with `MEMBERSHIP_AS_OF_SQL` | `test_memberships_with_equal_names_order_by_universe_id` cannot fail without the tiebreak, which is unreachable in product data (IR-004) |
| `test_evidence_name_is_the_latest_stored_reference_name`, `test_evidence_never_reads_rows_of_another_set`, `test_evidence_models_are_frozen_and_the_error_names_its_symbol` | ADEQUATE | Latest reference name, empty evidence when only an older set holds rows, frozen models, `InstrumentNotFound.symbol` | none |
| `tests/unit/test_reader_filters.py` (T008 additions) | ADEQUATE | Count bound at 0, 1, 2, 6, 7 and None; shape refusals (`A%`, lower case, `1A`, space, int, 17 characters); bound identity; no-statement fake for seven bad requests; `_normalise_symbols` | none |
| `tests/unit/test_reader_input_labels.py` | ADEQUATE | Identity with `constants.INPUT_LABELS`, the key set against `INPUT_NAMES`, exact values, no label equal to its key | none |
| `tests/unit/test_reader_sql_read_only.py` (T012) | ADEQUATE | One read-only statement each, no `{` and no bare `%` | none |

**Mutation.** The review regenerated mutants over `85254d1..7e9ec3a`, 38 from the
shared catalogue across every changed production file. It added 34 hand-written
mutants: 20 of the coder's 23 and 14 of its own. The coder's other three
replaced an ordering key with an alphabetical column or set the compare `limit`
to 5. Each was killed in the coder's run, and each is superseded here by a
stronger variant (key removed, `limit` omitted). All 72 ran against
the story's five focused suites, with four green baselines: **53 killed, 19
survived**. Results are in `CAP-002-E3-S3-implementation-review-v1-mutation.json`,
SHA-256 `dde2c9de…366b`.

Five survivors are not equivalent:

| Survivor | Change | Why not equivalent | Test that should kill it |
|----------|--------|--------------------|--------------------------|
| `manual:evidence-cells-any-instrument` | cell branch `JOIN instrument_row i ON true` | Returns every stock's cells in the set as this stock's (DAC-E3-S3-3, DAC-E3-8, design 2.6 "its three `factor_classification` rows") | TC-COMP-146 (IR-001) |
| `manual:evidence-inputs-any-instrument` | input branch `JOIN instrument_row i ON true` | Returns every stock's inputs as this stock's (DAC-E3-S3-3, DAC-E3-8, AC-17) | TC-COMP-146 (IR-001) |
| `manual:evidence-input-order-removed` | drops `array_position(%(input_order)s…)` from `ORDER BY` | Design 2.6 "then input name in the factor's definition order"; T006 fixes that order | TC-COMP-146 (IR-002) |
| `manual:evidence-factor-order-removed` | drops `array_position(%(factor_order)s…)` from `ORDER BY` | T018 "`factors` … keyed by factor in `FACTORS` order"; cell order becomes heap order | TC-COMP-146 (IR-002) |
| `manual:compare-never-classified-later-dropped` | never-classified branch returns `replace(page, later=None)` | T017 returns the page unchanged; design 2.7 says the never-classified page carries `later`, the first set, building or failed | `test_compare_with_no_complete_set_is_the_never_classified_page` (IR-003) |

The other fourteen survivors are equivalent:

- `reader.py:606` `drop-defaulted-argument:1` and `negate-boolean:1` (`strict`).
  `names` and `row` come from the same cursor result, so their lengths are always
  equal.
- Seven mutants of digits inside `--` comments: `list_classifications.sql:20`,
  `stock_evidence.sql:5` (×2), `stock_memberships.sql:2` (×2), `:3` and `:4`.
  PostgreSQL discards comments.
- `stock_evidence.sql:26` (cell rank 1→2) and `:33` (input rank 2→3). The reader
  partitions rows by `row_kind`, and the order within each kind is unchanged.
- `stock_memberships.sql:18` (`SELECT 2` inside `EXISTS`). `EXISTS` ignores its
  select list.
- `manual:compare-default-limit` (no `limit`). `ListFilters` caps `symbols` at 6
  distinct entries, and `idx_instrument_symbol` is unique, so at most 6 rows
  match and the page and `next_cursor` are identical.
- `manual:membership-order-id-dropped`. This one is equivalent by contract, not
  by executor (IR-004). universe-service design §3 says "Names are unique among
  active universes" (DEC-0057), and the statement excludes retired universes. Two
  returned memberships therefore never share a name. Under the default
  deterministic collation, distinct names never tie.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All eight checks PASSED |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/.../CAP-002-E3-S3.md --stage adversarial-review` | harness root | 0 | PASS | `READY — story is ready for independent review` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261101T024649Z` | harness root | 0 | PASS | `85254d12f58d74865c59c95d9a21e986d6c79713`; `git merge-base --is-ancestor` confirms it is an ancestor of HEAD |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline pytest tests/unit/test_reader_filters.py tests/unit/test_reader_input_labels.py tests/unit/test_reader_sql_read_only.py -q` (sandboxed) | component | 2 | NOT RUN (environment) | `error: Failed to initialize cache at ~/.cache/uv … Operation not permitted`, a sandbox refusal. Every `uv run` below was sent outside the sandbox as one plain call |
| same command, outside the sandbox | component | 0 | PASS | `85 passed in 0.23s` |
| `uv run --directory … --offline pytest tests/integration/test_reader_compare.py tests/integration/test_reader_evidence.py -m postgres -v` | component | 0 | PASS | `30 passed in 5.45s` |
| `uv run --directory … --offline pytest -m postgres -q -p no:cacheprovider` | component | 0 | PASS | `865 passed, 1457 deselected, 2 warnings in 280.80s` |
| `uv run --directory … --offline pytest -m 'not postgres' -q -p no:cacheprovider` | component | 0 | PASS | `1456 passed, 865 deselected, 1 xfailed, 2 warnings in 26.12s`. The two halves total 2321 passed and 1 xfailed, the coder's full-suite figure |
| `uv run --directory … --offline ruff check .` | component | 0 | PASS | `All checks passed!` |
| `uv run --directory … --offline ruff format --check .` | component | 0 | PASS | `270 files already formatted` |
| `uv run --directory … --offline mypy src` | component | 0 | PASS | `Success: no issues found in 60 source files` |
| `uv run --directory … --offline pytest tests/unit/test_package_data_ships_sql.py -v -p no:cacheprovider` (T019) | component | 0 | PASS | `10 passed` |
| T020 greps (`MIN_/MAX_COMPARE_SYMBOLS` under `src/factorflow/`; `FROM factor_classification\|IS DISTINCT FROM 'classified'` in `reader.py`; `hide_incomplete` under `classification/sql/`; `universes.service` in `reader.py`; `free-cash-flow yield` under `src/factorflow/`; `^INPUT_LABELS` in `reader.py`) | component | 0/1/0/1/0/1 | PASS | One import at `reader.py:71`; the literals 2 and 6 only in `classification_bounds.py`; no predicate in Python; `list_classifications.sql` only; no service import; one label line in `constants.py:26`; no label table in the reader |
| `python3 scripts/check-tdd-evidence.py --evidence .../CAP-002-E3-S3-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 85254d12… --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | `0 error(s), 0 warning(s)` |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 85254d12…..HEAD --cycle review --out <scratch>/mutants.json` | harness root | 0 | PASS | 38 mutants; 34 manual mutants appended (no `scope`: initial review) |
| `python3 scripts/mutation-run.py run --repo-dir … --mutants <scratch>/mutants.json --jobs 4 --command 'uv run --all-extras pytest -x -q -p no:cacheprovider -p no:randomly <the five story suites>' --out <scratch>/results.json` (outside the sandbox) | harness root | 3 | evidence | Four green baselines; `{"killed": 53, "survived": 19}`. Exit 3 reports survivors, which are judged above |
| `uv build --directory … --offline --out-dir <scratch>/dist` | component | N/A | NOT RUN (environment) | Outside the sandbox the call was refused as `Run outside of the sandbox` (no permission rule names `uv build`). Inside the sandbox with `--cache-dir <scratch>` it failed: `Failed to fetch: https://pypi.org/simple/setuptools/ … deny network-outbound pypi.org:443 (user denied)` |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` (before and after) | harness root | 0 | PASS | `sha256:7b000adee14338919680a7688fd9e1036d8de1ff34f18af30bfde7ae71421b50` both times |

`-p no:cacheprovider` only stops pytest writing its cache. It does not change
which tests are selected.

The nine required commands are:

- the story's five (`pytest -m postgres`, `pytest -m 'not postgres'`,
  `ruff check`, `ruff format --check`, `mypy src`);
- the focused story suites;
- T019;
- the T020 greps;
- the TDD-evidence lint.

Excluded, with reasons:

- `uv build`. The tech stack lists it, but neither the story's Validation section
  nor the task plan does. The plan writes "Build: none defined", which misreads
  the tech-stack table. The packaging concern it would add, that the two new SQL
  files ship, is the subject of T019's guard. That guard passed, and the
  `pyproject.toml` glob `classification/sql/*.sql` covers both files. The
  command could not run in this session, as recorded above.
- `npm ci`, `npm run build|test|test:e2e|lint|format` and `npx tsc --noEmit`.
  No frontend file is changed, and neither the story nor the plan names them.
- `uv sync --all-extras`. `pyproject.toml` and `uv.lock` are unchanged, and
  every `uv run` resolved the locked environment.

### Validation Side Effects

- Before: HEAD `7e9ec3a9dc256a1e8f759e0c9aa66a477ba36f67`, working tree clean
  (`git status --porcelain=v1 --untracked-files=all` empty), fingerprint
  `sha256:7b000adee143…1b50`.
- After: HEAD unchanged, working tree clean, fingerprint unchanged. Mutation
  clones, logs, mutants and results live in the scratch directory. The only files
  this review adds are this report and its `-mutation.json`, both under `docs/`,
  which the fingerprint excludes.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | HIGH | initial | OPEN | Every evidence test seeds one stock with rows in the current set, so returning other stocks' cells or inputs survives TC-COMP-146 |
| IR-002 | HIGH | initial | OPEN | TC-COMP-146 seeds rows in the asserted order, so dropping either `ORDER BY` key of `stock_evidence.sql` survives |
| IR-003 | HIGH | initial | OPEN | The never-classified compare test asserts `later` only where it is None, so dropping a non-null `later` survives |
| IR-004 | LOW | initial | OPEN | The equal-names tiebreak test cannot fail, and the TDD evidence calls its mutant equivalent on executor rather than artifact grounds |

### IR-001 — No evidence test can tell this stock's rows from another stock's

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S3-3, DAC-E3-8, AC-17
- **Tasks**: T006 (TC-COMP-146), T010
- **Files**: `tests/integration/test_reader_evidence.py` (every test that reads
  `factors` or `inputs`, 97–345 and 436–464);
  `src/factorflow/classification/sql/stock_evidence.sql:30` and `:36`
  (`JOIN instrument_row i USING (instrument_id)`)
- **Claim challenged**: TC-COMP-146 proves that evidence returns "every
  `factor_input` row of the current set" for the stock, and that its cells are
  the stock's stored rows.
- **Observed evidence**: Two mutants survive the five focused suites. One turns
  the cell-branch join into `JOIN instrument_row i ON true`
  (`manual:evidence-cells-any-instrument`). The other does the same to the input
  branch (`manual:evidence-inputs-any-instrument`). Either one makes the read
  return every stock's cells or inputs in the current set. Every evidence test
  that asserts `factors` or `inputs` seeds exactly one instrument with rows in the
  current set. `test_memberships_agree_with_the_membership_replay` seeds three,
  but it asserts memberships only. So the 6 or 24 rows such a statement would
  return are never present in a test. The production statement is correct.
- **Expected evidence/behavior**: DAC-E3-S3-3 says "Given a stock … every
  `factor_input` row of the current set is returned". Design 2.6 says "its three
  `factor_classification` rows and every `factor_input` row of the current set
  for the instrument". A test should fail when another stock's rows appear.
- **Impact**: A wrong join key or a dropped instrument filter would put another
  stock's cells and inputs into this stock's evidence and inspector. The `factors`
  dict would silently keep whichever stock's cell came last for each factor. That
  shows the owner the wrong reasons and inputs behind a result (AC-17), and no
  test would fail.
- **Required remediation**: Make TC-COMP-146, or a T010 evidence test, seed at
  least one other stock with different cells and inputs in the same current set.
  Assert that the evidence carries only the requested stock's rows. Both mutants
  must then be killed.

### IR-002 — TC-COMP-146's order assertions cannot fail

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: DAC-E3-S3-3
- **Tasks**: T006 (TC-COMP-146), T015, T018
- **Files**: `tests/integration/test_reader_evidence.py:97–153` (the asserts at
  117 and 149); `tests/integration/reader_seed.py:323` (`seed_inputs`) and
  `seed_scored_stock`; `src/factorflow/classification/sql/stock_evidence.sql:39–41`
- **Claim challenged**: The test asserts the inputs in definition order
  (`[(r.factor, r.input_name) …] == DEFINITION_ORDER`) and the cells in `FACTORS`
  order (`list(evidence.factors) == list(FACTORS)`).
- **Observed evidence**: Both orderings survive removal. Dropping
  `array_position(%(input_order)s::text[], u.input_name)` survives
  (`manual:evidence-input-order-removed`). Dropping
  `array_position(%(factor_order)s::text[], u.factor)` also survives
  (`manual:evidence-factor-order-removed`). `seed_inputs` inserts the eight inputs
  in `FACTORS` × `INPUT_NAMES` order, and `seed_scored_stock` inserts the three
  cells in `FACTORS` order. The rows therefore reach the sort already in the
  asserted order. Each assertion holds whether or not the ordering key exists.
  The coder's ordering mutants replaced the keys with alphabetical columns, so
  they were killed. They never checked a missing key.
- **Expected evidence/behavior**: Design 2.6 says the inputs are "ordered by
  factor then input name in the factor's definition order". T006 fixes that order,
  and T018 says `factors` is "keyed by factor in `FACTORS` order". The test must
  fail when either ordering is lost.
- **Impact**: A regression that drops or breaks an ordering key leaves the
  evidence page's inputs and cells in storage order. Storage order matches
  definition order only when rows happened to be written that way. The current
  test cannot see that.
- **Required remediation**: Seed the cells and inputs in an order different from
  the asserted one, for example reversed, in TC-COMP-146 or a dedicated test. The
  assertions then depend on the statement's `ORDER BY`. Both mutants must then be
  killed.

### IR-003 — The never-classified compare page's `later` is asserted only when it is None

- **Severity**: HIGH
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: AC-16 (compare half; no criterion is unsatisfied in
  production)
- **Tasks**: T009, T017
- **Files**: `tests/integration/test_reader_compare.py:255–271`;
  `src/factorflow/classification/reader.py:581–582`
- **Claim challenged**: T009 says that with no complete set, compare returns "the
  never-classified page (`set=None`, `never_classified=True`, `stocks=[]`,
  `unknown_symbols=[]`, `match_count=0`, `later` as `read_set_blocks` returns it)".
- **Observed evidence**: The test seeds no set at all, so `read_set_blocks(conn)`
  returns `(None, None)` and `page.later == reader.read_set_blocks(conn)[1]`
  compares `None` with `None`. The mutant
  `manual:compare-never-classified-later-dropped` returns
  `dataclasses.replace(page, later=None)` from the never-classified branch, and
  it survives.
- **Expected evidence/behavior**: T017 says to "return the page unchanged when
  `never_classified`". Design 2.7 says the never-classified page carries
  `later (the first set, building or failed, or None)`. T009 asks for that
  `later`, and E3-S2 already tests that the list carries it. A test should fail
  when compare loses a non-null `later`.
- **Impact**: Before the first set completes, the compare view could lose its
  *a first download is being scored* or *failed* signal (AC-20, DEC-0082) with no
  failing test. The production code is correct today.
- **Required remediation**: Make the never-classified compare case hold a
  `building` or `failed` first set, so `later` is non-null, and assert it equals
  `read_set_blocks(conn)[1]`. The mutant must then be killed.

### IR-004 — The equal-names tiebreak test proves nothing, and its equivalence claim names no artifact

- **Severity**: LOW
- **Scope**: initial
- **Status**: OPEN
- **Acceptance criteria**: N/A
- **Tasks**: T011, T022
- **Files**: `tests/integration/test_reader_evidence.py:398–406`;
  `CAP-002-E3-S3-tdd-evidence.yaml` (survivor `manual:membership-order-id-dropped`)
- **Claim challenged**: The TDD evidence says `manual:membership-order-id-dropped`
  is equivalent because "PostgreSQL keeps presorted equal keys in place".
- **Observed evidence**: The mutant survives this review's run too. The stated
  reason is executor behaviour: small-sort stability and the presorted
  short-circuit after `DISTINCT ON`. SQL does not guarantee either one. The
  reason names no artifact, which skill step E.9 requires. In product data the
  tiebreak is unreachable: universe-service design §3 makes names unique among
  active universes (DEC-0057), and `stock_memberships.sql` excludes retired ones.
  The mutant is equivalent on that ground. However,
  `test_memberships_with_equal_names_order_by_universe_id` creates equal names
  by direct inserts, and it cannot fail with or without the tiebreak.
- **Expected evidence/behavior**: An equivalence disposition cites the artifact
  that makes the difference unobservable or leaves it open (skill E.9). A test
  either pins behaviour or is not presented as proof of it.
- **Impact**: Evidence quality only. A reader of the evidence may believe the
  tiebreak is pinned by a test when it is not.
- **Required remediation**: Correct the disposition's reason in the next cycle's
  evidence to cite the universe-service uniqueness rule. Either keep the test
  and say in its docstring that it documents unreachable data, or drop it. No
  production change.

## Previous Review Disposition

Not applicable — initial review.

## Scope and Plan Deviations

- **Justified.** `stock_evidence.sql` wraps its `UNION ALL` in a subquery
  (`SELECT u.* FROM (…) u ORDER BY …`). PostgreSQL refuses expressions in a
  `UNION`'s `ORDER BY`, and the TDD evidence records this. The plan's columns,
  bound arrays and single statement are kept. The statement also resolves the
  instrument's latest reference name (DEC-0245) through an `instrument_row` CTE.
- **Justified.** T002's `add_member` and `remove_member` already existed in
  `reader_seed.py` and were reused rather than redefined.
- **Plan composition.** T006 asked for six `present`, one `outdated` and one
  `missing` input in TC-COMP-146. The test seeds seven `present` and one
  `missing`. The `outdated` row with its stored value and dates is asserted in
  `test_evidence_input_row_carries_the_dates_the_statement_stored`. This is noted
  under IR-002's test rather than raised separately.
- **Plan inaccuracy (not the coder's).** The Validation Plan says "Build: none
  defined for Python in the tech-stack Validation Commands table". The table
  lists `uv build`. T019 is the planned packaging proof, and it passed.
- **Recorded open behaviour (Open Gap 4).** With no complete set, compare
  returns `unknown_symbols=[]`, so a well-formed symbol that names no instrument
  is not reported until a set exists. The plan follows design 2.7's short-circuit
  and flags this for the API design. It is noted here for the owner and is not a
  finding.
- **Non-blocking observation.** `stock_evidence` upper-cases its symbol but does
  not shape-check it. That is DEC-0132's "no other rewriting", and the symbol is a
  bound parameter, so it is safe. A non-string symbol raises `AttributeError`, not
  `ValueError`. The code-review cycle noted this too, and no artifact specifies
  otherwise.
- Bookkeeping: all 22 tasks are checked, and T006 and T009 are only PARTIAL
  (IR-001 to IR-003). There is no scope leakage and no unjustified file.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding`, rework), with
  `CAP-002-E3-S3-tasks.md` and this report.
- **Required action**:
  - Strengthen the tests so that the five non-equivalent survivors are killed:
    `manual:evidence-cells-any-instrument` and
    `manual:evidence-inputs-any-instrument` (IR-001),
    `manual:evidence-input-order-removed` and
    `manual:evidence-factor-order-removed` (IR-002), and
    `manual:compare-never-classified-later-dropped` (IR-003).
  - Correct IR-004's evidence.
  - Record the rework as a new TDD-evidence cycle.
  - No production change is required.
  - Then rerun `$adversarial-review`. It will use this report as its baseline and
    `CAP-002-E3-S3-implementation-review-v1-mutation.json` as `scope --previous`.
- **Warnings accepted downstream**: N/A
