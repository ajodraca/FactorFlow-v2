---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S3-implementation-review
artifact_type: implementation-review
artifact_version: 2
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-01
updated: 2026-11-01
story_id: "CAP-002-E3-S3"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S3.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 2
reviewed_at: "2026-11-01T03:43:33Z"
reviewed_head: "9acfe60473c013790e205f342aede7da5807e9f6"
review_base: "85254d12f58d74865c59c95d9a21e986d6c79713"
reviewed_state_revision: "sha256:e07f4d5581aaed5a435577791b1e80cfa21d263ee05359600919e5435e6b6495"
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
  timestamp: 2026-11-01T03:55:17Z
  source_artifacts:
    - id: CAP-002-E3-S3
      version: "1 (sha256:55a201cea26b0ad63514f32efe41e8ad0c3940d1ce881d01dafcaae040a74115)"
    - id: CAP-002-E3-S3-tasks
      version: "1 (updated 2026-11-01, last_reworked_review v1)"
    - id: CAP-002-E3-S3-tdd-evidence
      version: "cycle-1 (edited in 9acfe60)"
    - id: CAP-002-E3-S3-implementation-review
      version: "1 (baseline, reviewed_head 7e9ec3a9dc256a1e8f759e0c9aa66a477ba36f67)"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-classification-reader-component-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E3-S3 — Version 2

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **CHANGES-REQUIRED** |
| Critical findings | 0 |
| High findings | 1 |
| Medium findings | 1 |
| Low findings | 0 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 21/22 verified |
| Required validation | 8/9 passed |

**By severity:** CRITICAL 0 · HIGH 1 · MEDIUM 1 · LOW 0 · **total 2**

This is a re-review. Its baseline is v1 (`CHANGES-REQUIRED`, reviewed_head
`7e9ec3a`). The rework commit `9acfe60` changes tests, seed helpers and evidence
only, and no production file. All four v1 findings are resolved in the code:

- The five non-equivalent v1 survivors are now killed, each by the test v1
  named. This review reran all 72 of v1's mutants from its `-mutation.json`
  through `mutation-run.py scope --previous`.
- The IR-004 equivalence reason now cites DEC-0057 and universe-service design
  section 3.

Every acceptance criterion is satisfied and every mandatory test is `ADEQUATE`.

The gate still fails on one required check. The TDD-evidence lint now exits 1:
`TDD-LINT-COVERAGE`, *behaviour-changing commit 9acfe60473c0 … is named by no
cycle and covered by no exception (INV-TDD-002)*. The rework added no cycle to
`CAP-002-E3-S3-tdd-evidence.yaml`. It has no RED/GREEN record, no independent
code-review or spec-drift verdict, no `diff_sha256` and no mutation block for
its diff. It also rewrote one survivor reason inside the already-reviewed
cycle-1. That is IR-001 (HIGH, `delta`). T022 is therefore `PARTIAL`.

IR-002 (MEDIUM, `late`) is new. No evidence test pins a cell's
`reason_detail`. Two reviewer mutants that blank it in `_cell_from_row` or in
`stock_evidence.sql` survive. The production lines are unchanged since v1, so
this cannot block.

All other required commands pass: ruff, format, mypy, both full suites, the
focused suites, T019 and the T020 greps.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S3.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S3-run-20261101T024649Z` |
| HEAD | `9acfe60473c013790e205f342aede7da5807e9f6` (`fix(CAP-002-E3-S3): rework review v1 - evidence isolation, ordering and never-classified later tests`) |
| Review base | `usr/alvaro-de-jodra/CAP-002-integration-20261101T024649Z` → `85254d12f58d74865c59c95d9a21e986d6c79713` (resolved by `pipeline-state.py review-base --base-ref`; `git merge-base --is-ancestor` exit 0) |
| Working tree | clean (`git status --porcelain=v1 --untracked-files=all` empty) before and after validation |
| Changed files reviewed | 21 across three commits (`7e9ec3a`, `8cec1a3`, `9acfe60`); 7 of them changed since the baseline |
| Baseline | v1, reviewed_head `7e9ec3a9dc256a1e8f759e0c9aa66a477ba36f67`, with `CAP-002-E3-S3-implementation-review-v1-mutation.json` |

### Changed Files

Paths under `docs/.../stories/` abbreviate
`docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/`.
A **Δ** in the State column marks a file changed since the baseline.

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/reader.py` | modified | DAC-E3-S3-1 to -5, DAC-E3-7, DAC-E3-8, DAC-E3-12; T016, T017, T018 |
| `src/factorflow/classification/sql/list_classifications.sql` | modified | DAC-E3-S3-1, DAC-E3-S3-4; T013 (DEC-0133) |
| `src/factorflow/classification/sql/stock_evidence.sql` | added | DAC-E3-S3-3, DAC-E3-S3-5; T015 |
| `src/factorflow/classification/sql/stock_memberships.sql` | added | DAC-E3-S3-3, DAC-E3-8; T014 (DEC-0134) |
| `tests/integration/reader_seed.py` | modified **Δ** | T002. The rework adds a keyword-only `reverse=False` to `seed_scored_stock` and `seed_inputs`. That is an optional keyword, which T002 allows, and no existing call changes behaviour (v1 IR-002) |
| `tests/integration/test_reader_compare.py` | added **Δ** | TC-COMP-123, 124, 113; T003, T004, T005, T009. The rework adds a `building` first set to the never-classified case (v1 IR-003) |
| `tests/integration/test_reader_evidence.py` | added **Δ** | TC-COMP-146, 113, 147; T005, T006, T007, T010, T011. The rework adds other stocks and reversed seeding to TC-COMP-146 (v1 IR-001, IR-002) and a docstring to the equal-names test (v1 IR-004) |
| `tests/unit/test_reader_filters.py` | modified | T008 |
| `tests/unit/test_reader_input_labels.py` | added | T008 |
| `tests/unit/test_reader_sql_read_only.py` | modified | T012 |
| `docs/.../stories/CAP-002-E3-S3.md` | modified | `status` → `in-review` only; content revision unchanged |
| `docs/.../stories/CAP-002-E3-S3-tasks.md` | modified **Δ** | 22 checkboxes ticked (`7e9ec3a`), then `updated: 2026-11-01` and `last_reworked_review` (`9acfe60`). This is story-coding rework metadata; no task text changed |
| `docs/.../stories/CAP-002-E3-S3-tdd-evidence.yaml` | added **Δ** | T022. The rework changed one survivor `reason` inside cycle-1 and added no cycle (IR-001) |
| `docs/.../stories/CAP-002-E3-S3-evidence/` (6 files: `cycle-1.patch`, `red-cycle-1.log`, `code-review-cycle-1.txt`, `spec-drift-cycle-1.txt`, `mutants-cycle-1.json`, `mutation-cycle-1-results.json`) | added | T022 (cycle-1); unchanged since the baseline |
| `docs/.../stories/CAP-002-E3-S3-implementation-review-v1.md` and `-v1-mutation.json` | added **Δ** | Review v1 and its mutation results, committed by the driver (`8cec1a3`, docs only) |

No unjustified file, dependency or configuration change. `pyproject.toml`,
`uv.lock` and `tests/conftest.py` are unchanged.

## Acceptance Criteria Verification

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-16 | SATISFIED | `reader.py:compare` (572–586) over `list_classifications` with `symbols` set; `list_classifications.sql` scope clause (19–22) | `test_reader_compare.py`: `test_compare_returns_every_known_symbol_two_to_six_only`, `test_compare_orders_by_symbol_whatever_the_request_order`, `test_compare_shares_the_list_statement_and_cell_model` | This story covers the compare (side-by-side) half. Sort and filter are CAP-002-E3-S2's |
| AC-17 | SATISFIED | `stock_evidence.sql` input branch (33–38); `reader.py:stock_evidence` (589–634) builds `InputRow` with `value`, `as_of`, `known_on` | TC-COMP-146 (`test_evidence_returns_every_input_with_dates_and_universes_in_name_order`), `test_evidence_input_row_carries_the_dates_the_statement_stored` | TC-COMP-146 now seeds AAAA and ZZZZ with other values in the same set. `manual:evidence-inputs-any-instrument` fails at `:141`. The cell `reason_detail` gap is IR-002 (late, MEDIUM) |
| DAC-E3-7 | SATISFIED | `ListFilters.__post_init__` (350–357): count 2 to 6 and shape through `is_valid`; `compare` `unknown_symbols` (583–586) | TC-COMP-123, TC-COMP-124, unit `test_compare_refuses_a_bad_request_before_any_statement` | Bound imported once from `api.classification_bounds` (T020 grep) |
| DAC-E3-8 | SATISFIED | `stock_evidence.sql`, `stock_memberships.sql`, `_memberships` (637–640) | TC-COMP-146, the memberships tests, `test_memberships_agree_with_the_membership_replay` | The "this stock's rows" half is now proved (both v1 leak mutants killed) |
| DAC-E3-12 | SATISFIED | `_cell_from_row` (643–652) reads stored `restated_possible`; `InputRow.restated_possible` from the input row; compare reuses the list mapper | `test_compare_shares_the_list_statement_and_cell_model`, `test_evidence_cell_and_input_restatement_flags_are_independent` | `manual:evidence-cell-restated-dropped` and `manual:evidence-input-restated-dropped` are killed |
| DAC-E3-S3-1 | SATISFIED | `ListFilters.__post_init__`; scope clause `(i.lifecycle = 'active' OR %(symbols)s::text[] IS NOT NULL)` | TC-COMP-123 and the unit bound tests | Every bound and shape mutant is killed, including `manual:v2-filters-isinstance-dropped` |
| DAC-E3-S3-2 | SATISFIED | `compare` (583–586) | TC-COMP-124 | `manual:v2-compare-unknown-from-raw-request` is killed. With no complete set, compare returns the never-classified page with `unknown_symbols=[]` (plan Open Gap 4, flagged for the API design) |
| DAC-E3-S3-3 | SATISFIED | `stock_evidence.sql` (instrument, cell and input branches, ordered by bound arrays, 39–41); `reader.py` 589–634 | TC-COMP-146 | Both v1 ordering mutants now fail at `:141` and `:174`, and both leak mutants at `:141` and `:176` |
| DAC-E3-S3-4 | SATISFIED | Scope clause (DEC-0133); evidence reads the stored `retired` cells | `test_compare_keeps_a_retired_stock_while_the_list_still_omits_it`, `test_evidence_keeps_a_retired_stock_with_the_retired_reason` | `manual:compare-scope-always-active` and `-always-all` are killed |
| DAC-E3-S3-5 | SATISFIED | `stock_evidence` binds `set_id=None` when `current` is None | `test_evidence_with_no_current_set_has_a_null_set_and_the_same_shape[no_set, building_only]` | `manual:evidence-reads-later-set` and `manual:evidence-set-block-dropped` are killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | All producers exist at the base: E3-S1/E3-S2 reader names, `universes/replay.py:MEMBERSHIP_AS_OF_SQL`, `api/classification_bounds.py` (2, 6), `constants.INPUT_NAMES` (a mapping by factor) and `INPUT_LABELS`, migrations 0005/0006, `instruments.symbols.is_valid` | Only the two compare constants are imported (`reader.py:71`) |
| T002 | complete | VERIFIED | `reader_seed.py`: `seed_inputs`, `rename_universe`, `insert_input(restated_possible=…, detail=…)`; rework adds keyword-only `reverse=False` | `add_member`/`remove_member` already existed and are reused. No existing signature changed and no fixture was added |
| T003 | complete | VERIFIED | `test_compare_returns_every_known_symbol_two_to_six_only`, `test_compare_orders_by_symbol_whatever_the_request_order` | TC-COMP-123 |
| T004 | complete | VERIFIED | `test_compare_reports_an_unrecognised_symbol` | TC-COMP-124; malformed symbols are refused in the unit file (T008) |
| T005 | complete | VERIFIED | `test_compare_keeps_a_retired_stock_while_the_list_still_omits_it`, `test_evidence_keeps_a_retired_stock_with_the_retired_reason` | TC-COMP-113, both halves |
| T006 | complete | VERIFIED | `test_evidence_returns_every_input_with_dates_and_universes_in_name_order` (97–178) | TC-COMP-146 is now ADEQUATE (v1 IR-001, IR-002 resolved). The fixture still has seven `present` inputs and one `missing`. The `outdated` row is proved in `test_evidence_input_row_carries_the_dates_the_statement_stored` (plan composition, as v1 noted) |
| T007 | complete | VERIFIED | `test_evidence_with_no_current_set_has_a_null_set_and_the_same_shape` (two cases) | TC-COMP-147; PROVISIONAL DEC-0131 comment present |
| T008 | complete | VERIFIED | `test_reader_filters.py` E3-S3 block, `test_reader_input_labels.py` | Every bound, shape and normalisation mutant is killed |
| T009 | complete | VERIFIED | The seven additional compare tests | The never-classified case now holds a `building` first set (`:261–263`), and `later` is asserted non-null (v1 IR-003 resolved) |
| T010 | complete | VERIFIED | `test_evidence_reads_only_the_current_set`, `..._restatement_flags_are_independent`, `..._outdated_input_...`, `..._case_insensitive_...`, `..._no_universe_...`, `..._two_statements_besides_the_set_block_read` | The outdated-input test asserts the cell's `reason_code`/`reason_input` but not `reason_detail` (IR-002) |
| T011 | complete | VERIFIED | Memberships tests (379–460) | The equal-names test now says it documents unreachable data (v1 IR-004) |
| T012 | complete | VERIFIED | `test_reader_sql_read_only.py`: both files in the one-statement scan and `test_evidence_statements_substitute_no_request_text` | — |
| T013 | complete | VERIFIED | `list_classifications.sql:19–22` | The planned clause plus a one-line DEC-0133 comment; E3-S2's list tests pass in the postgres suite |
| T014 | complete | VERIFIED | `stock_memberships.sql` | The design 2.6 statement with `ORDER BY n.name, u.universe_id` |
| T015 | complete | VERIFIED | `stock_evidence.sql` | Justified deviation: the `UNION ALL` is wrapped in a subquery (see Scope and Plan Deviations). Bound-array ordering; no `universe_event` join |
| T016 | complete | VERIFIED | `reader.py` 71–78, 350–357, 379–426 | `INPUT_LABELS`/`INPUT_NAMES` imported from `constants` and re-exported; `InstrumentNotFound(LookupError)` |
| T017 | complete | VERIFIED | `reader.py:compare` (572–586) | No SQL of its own; never-classified page returned unchanged |
| T018 | complete | VERIFIED | `reader.py:stock_evidence` (589–634), `_memberships` (637), `_cell_from_row` (643) | `FactorCell(` at 645 and 759 only, as the plan expects |
| T019 | complete | VERIFIED | `tests/unit/test_package_data_ships_sql.py`: 10 passed | Glob `classification/sql/*.sql` covers both new files |
| T020 | complete | VERIFIED | Greps rerun (Independent Validation) | All return as stated |
| T021 | complete | VERIFIED | The module docstring cites DAC-E3-S3-1 to -5, DAC-E3-7, DAC-E3-8, DAC-E3-12 and the five TC-IDs; ruff, format and mypy are clean | No file beyond the plan's list |
| T022 | complete | PARTIAL | `CAP-002-E3-S3-tdd-evidence.yaml` cycle-1 only | The rework TDD cycle (`9acfe60`) has no cycle entry, reviews, fingerprint or mutation record; the lint fails INV-TDD-002 (IR-001) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_compare_returns_every_known_symbol_two_to_six_only` / TC-COMP-123 | ADEQUATE | 2 and 6 symbols, stored status and reason per cell, retired `lifecycle`, `match_count`, `next_cursor`; 1 and 7 refused with zero statements through a counting wrapper | none |
| `test_compare_reports_an_unrecognised_symbol` / TC-COMP-124 | ADEQUATE | One unknown, two unknown in request order, all unknown with `match_count` 0, none unknown | none |
| `test_compare_keeps_a_retired_stock_while_the_list_still_omits_it` / TC-COMP-113 (compare) | ADEQUATE | Three `retired` cells, and the unscoped list still excludes R; kills both scope mutants | none |
| `test_evidence_keeps_a_retired_stock_with_the_retired_reason` / TC-COMP-113 (evidence) | ADEQUATE | Three `retired`/`not_classified` cells, no inputs, membership kept | none |
| `test_evidence_returns_every_input_with_dates_and_universes_in_name_order` / TC-COMP-146 | ADEQUATE | Labels, `Decimal` values, dates, the `missing` row, input restatement, `detail`, memberships in name order, the set block, and cells equal to AAPL's stored rows. Two other stocks with different cells and values share the set, and AAPL's rows are stored against definition order | Killing `manual:evidence-cells-any-instrument` depends on which of the tied cells PostgreSQL sorts last per factor. The reader keeps the last cell per factor, so a leak is visible only when another stock's cell wins. That is deterministic for the pinned `postgres:16` image and fixed insert order. The input leak is killed independently of tie order (24 rows against 8). Recorded as an observation, not a finding |
| `test_evidence_with_no_current_set_has_a_null_set_and_the_same_shape` / TC-COMP-147 | ADEQUATE | No set and building-only (with building inputs) both give `set` None, empty `factors`/`inputs`, populated memberships, the fixed field list, and `InstrumentNotFound` | The instance-vs-class field comparison is tautological, but the explicit field list and `isinstance` carry the shape assertion |
| Additional compare tests (T009) | ADEQUATE | Shared statement (one `WITH scope AS`), stored `restated_possible`, default thresholds, set/later blocks with a building later, the never-classified page with a non-null building `later`, normalisation and dedupe, a known instrument with no row reported, independence from universes | none |
| Additional evidence tests (T010) | ADEQUATE (mandatory scope); see IR-002 | Current set only (older complete plus newer building, different values), independent restatement flags, outdated input with cell reason code and input, case-insensitive lookup, unknown symbol, no universe, statement count | No test asserts a cell's `reason_detail`. That is a late survivor pair, MEDIUM, and does not make a test `WEAK` (IR-002) |
| Memberships tests (T011) | ADEQUATE | Two universes in name order, rename, removal, re-add, retired universe, late addition, equal names (documented as unreachable data), equivalence with `MEMBERSHIP_AS_OF_SQL` | none |
| `test_evidence_name_is_the_latest_stored_reference_name`, `test_evidence_never_reads_rows_of_another_set`, `test_evidence_models_are_frozen_and_the_error_names_its_symbol` | ADEQUATE | Latest reference name, empty evidence when only an older set holds rows, frozen models, `InstrumentNotFound.symbol` | none |
| `tests/unit/test_reader_filters.py` (T008 additions) | ADEQUATE | Count bound at 0, 1, 2, 6, 7 and None; shape refusals (`A%`, lower case, `1A`, space, int, 17 characters); bound identity; no-statement fake for seven bad requests; `_normalise_symbols` | none |
| `tests/unit/test_reader_input_labels.py` | ADEQUATE | Identity with `constants.INPUT_LABELS`, key set against `INPUT_NAMES`, exact values, no label equal to its key | none |
| `tests/unit/test_reader_sql_read_only.py` (T012) | ADEQUATE | One read-only statement each; no `{` and no bare `%` | none |

**Mutation.** The review regenerated mutants over `85254d1..9acfe60` and got 38
from the shared catalogue over every changed production file. It added 7
hand-written mutants of its own (`manual:v2-*`). Then
`mutation-run.py scope --since 7e9ec3a… --previous …-v1-mutation.json` added
v1's 34 manual mutants and tagged the 79:

- **carried** (72): no production line has changed since the baseline;
- **late** (7): this review's own mutants.

All 79 ran against the story's five focused suites, with four green baselines:
**61 killed, 18 survived**. The results are in
`CAP-002-E3-S3-implementation-review-v2-mutation.json`, SHA-256
`30637cfb7a14843a92395dd0e24e2242db10d6b579d3c90cb001600d3fdfa90e`.

v1's five non-equivalent survivors are all killed now, each by the test v1
required:

| Mutant | Killed by |
|--------|-----------|
| `manual:evidence-cells-any-instrument` | TC-COMP-146, `test_reader_evidence.py:176` (FactorCell differs) |
| `manual:evidence-inputs-any-instrument` | TC-COMP-146, `:141` (24 input rows, not 8) |
| `manual:evidence-input-order-removed` | TC-COMP-146, `:141` (inputs in storage order) |
| `manual:evidence-factor-order-removed` | TC-COMP-146, `:174` (`['momentum', 'growth', 'value']`) |
| `manual:compare-never-classified-later-dropped` | `test_compare_with_no_complete_set_is_the_never_classified_page`, `test_reader_compare.py:273` (`None == LaterSet(…building…)`) |

Two survivors are not equivalent. Both are `late`, so they make no test `WEAK`:

| Survivor | Change | Why not equivalent | Finding |
|----------|--------|--------------------|---------|
| `manual:v2-cell-reason-detail-dropped` | `_cell_from_row`: `reason_detail=None` | Design 2.3 gives `FactorCell` a `reason_detail`. Design 2.6 returns the stock's three stored cells, and T018 says `_cell_from_row` reads all seven columns by name and derives nothing | IR-002 |
| `manual:v2-evidence-sql-cell-reason-detail-null` | `stock_evidence.sql:27`: cell branch selects `NULL` for `reason_detail` | Same contract, in the statement | IR-002 |

The other sixteen survivors are equivalent:

- **Carried, as v1 judged them (14).**
  - `reader.py:606` `drop-defaulted-argument:1` and `negate-boolean:1`
    (`strict`). `names` and `row` come from the same cursor result.
  - Seven digit mutants inside `--` comments: `list_classifications.sql:20`,
    `stock_evidence.sql:5` (×2), and `stock_memberships.sql:2` (×2), `:3` and
    `:4`.
  - `stock_evidence.sql:26` and `:33` (row-kind ranks). The reader partitions
    by `row_kind`.
  - `stock_memberships.sql:18`. `EXISTS` ignores its select list.
  - `manual:compare-default-limit`. `ListFilters` caps `symbols` at 6 distinct
    entries, and `idx_instrument_symbol` is unique, so the page is identical.
  - `manual:membership-order-id-dropped`. DEC-0057 and universe-service design
    §3 make active names unique, and the statement drops retired universes.
- **`manual:v2-evidence-instrument-check-dropped`** (`if not rows:` only). T018
  specifies "zero rows raises `InstrumentNotFound`", and the mutant is that
  rule. Both other branches join `instrument_row`, so a non-empty result always
  starts with the rank-0 instrument row.
- **`manual:v2-evidence-name-hash-tiebreak-asc`** (`value_hash ASC`). DEC-0245
  defines the name as that of the most recent reference row. `value_hash` only
  makes `LIMIT 1` deterministic among rows recorded at the same instant, which
  DEC-0245's derivation leaves open. The CAP-002-E3-S2 v1 and v2 reviews
  judged the list statement's identical mutant (`manual:rv-name-tiebreak-asc`)
  equivalent on the same ground, and this review keeps that disposition.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All eight checks PASSED |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/.../CAP-002-E3-S3.md --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 --base-ref usr/alvaro-de-jodra/CAP-002-integration-20261101T024649Z` | harness root | 0 | PASS | `85254d12f58d74865c59c95d9a21e986d6c79713`, an ancestor of HEAD; the baseline head `7e9ec3a` is also an ancestor |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline pytest tests/unit/test_reader_filters.py tests/unit/test_reader_input_labels.py tests/unit/test_reader_sql_read_only.py -q -p no:cacheprovider` (sandboxed) | component | 2 | NOT RUN (environment) | `error: Failed to initialize cache at ~/.cache/uv … Operation not permitted (os error 1)`, a sandbox refusal; every `uv run` below was sent outside the sandbox as one plain call |
| same command, outside the sandbox | component | 0 | PASS | `85 passed in 0.22s` |
| `uv run --directory … --offline pytest tests/integration/test_reader_compare.py tests/integration/test_reader_evidence.py -m postgres -v -p no:cacheprovider` | component | 0 | PASS | `30 passed in 5.10s` |
| `uv run --directory … --offline pytest -m postgres -q -p no:cacheprovider` | component | 0 | PASS | `865 passed, 1457 deselected, 2 warnings in 282.83s`. With the other half this totals 2321 passed and 1 xfailed, the same as v1, so the rework added no test function (it edited existing ones) |
| `uv run --directory … --offline pytest -m "not postgres" -q -p no:cacheprovider` | component | 0 | PASS | `1456 passed, 865 deselected, 1 xfailed, 2 warnings in 26.63s` |
| `uv run --directory … --offline ruff check .` | component | 0 | PASS | `All checks passed!` |
| `uv run --directory … --offline ruff format --check .` | component | 0 | PASS | `270 files already formatted` |
| `uv run --directory … --offline mypy src` | component | 0 | PASS | `Success: no issues found in 60 source files` |
| `uv run --directory … --offline pytest tests/unit/test_package_data_ships_sql.py -q -p no:cacheprovider` (T019) | component | 0 | PASS | `10 passed in 0.17s` |
| T020 greps: `MIN_/MAX_COMPARE_SYMBOLS` under `src/factorflow/`; `FROM factor_classification\|IS DISTINCT FROM 'classified'` in `reader.py`; `hide_incomplete` under `classification/sql/`; `universes.service` in `reader.py`; `free-cash-flow yield` under `src/factorflow/`; `^INPUT_LABELS` in `reader.py` | component | 0/1/0/1/0/1 | PASS | One import at `reader.py:71`, and the literals 2 and 6 only in `classification_bounds.py:9,12`. No predicate in Python. `list_classifications.sql` only. No service import. One label line at `constants.py:26`. No label table in the reader |
| `python3 scripts/check-tdd-evidence.py --evidence repos/.../CAP-002-E3-S3-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 85254d12f58d74865c59c95d9a21e986d6c79713 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 1 | **FAIL** | `ERROR TDD-LINT-COVERAGE behaviour-changing commit 9acfe60473c0 (fix(CAP-002-E3-S3): rework review v1 - …) is named by no cycle and covered by no exception (INV-TDD-002)` — `1 error(s), 0 warning(s)` (IR-001) |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 85254d12…..HEAD --cycle review --out <scratch>/generated.json` | harness root | 0 | PASS | 38 mutants; 7 reviewer manual mutants appended |
| `python3 scripts/mutation-run.py scope --repo-dir … --mutants <scratch>/generated.json --since 7e9ec3a9… --previous …-v1-mutation.json --out <scratch>/mutants.json` | harness root | 0 | PASS | `79 mutant(s) … {"carried": 72, "late": 7}; 0 previous mutant(s) no longer apply` |
| `python3 scripts/mutation-run.py run --repo-dir … --mutants <scratch>/mutants.json --jobs 4 --command 'uv run --all-extras pytest -x -q -p no:cacheprovider -p no:randomly <the five story suites>' --out <scratch>/results.json --logs <scratch>/logs --work-root <scratch>/work` (outside the sandbox) | harness root | 3 | evidence | The first launch exited 1 with `FileNotFoundError` because the `--work-root` directory did not exist yet. Once it was created, the run had four green baselines and gave `{"killed": 61, "survived": 18}`. Exit 3 reports survivors, which are judged above |
| `uv build --directory … --offline --out-dir <scratch>/dist` | component | N/A | NOT RUN (environment) | Outside the sandbox the call was refused: `Run outside of the sandbox` (no permission rule names `uv build`). Inside the sandbox with `--cache-dir <scratch>` it exited 2: `No solution found when resolving: setuptools>=68 … the network was disabled` |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` (before and after) | harness root | 0 | PASS | `sha256:e07f4d5581aaed5a435577791b1e80cfa21d263ee05359600919e5435e6b6495` both times |

`-p no:cacheprovider` only stops pytest writing its cache. It does not change
which tests are selected.

The nine required commands are:

- the story's five (`pytest -m postgres`, `pytest -m 'not postgres'`,
  `ruff check`, `ruff format --check`, `mypy src`);
- the focused story suites;
- T019;
- the T020 greps;
- the TDD-evidence lint.

The lint fails, so 8 of 9 pass. Excluded, with reasons, as in v1:

- `uv build`. It is listed in the tech stack, but neither the story's
  Validation section nor the task plan names it. T019's guard is the planned
  packaging proof, and it passed. The command could not run in this session,
  as recorded above. The verdict does not depend on it.
- `npm ci`, `npm run build|test|test:e2e|lint|format` and `npx tsc --noEmit`.
  No frontend file is changed.
- `uv sync --all-extras`. `pyproject.toml` and `uv.lock` are unchanged.

### Validation Side Effects

- Before: HEAD `9acfe60473c013790e205f342aede7da5807e9f6`, working tree clean,
  fingerprint `sha256:e07f4d55…6495`.
- After: HEAD unchanged, working tree clean, fingerprint unchanged.
- `uv run` refreshed the ignored `src/factorflow.egg-info/` (editable install
  metadata), which is not tracked. Mutation clones, logs, mutants and results
  live in the scratch directory. This review adds only this report and its
  `-mutation.json`, both under `docs/`, which the fingerprint excludes.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | HIGH | delta | OPEN | The rework commit is named by no TDD-evidence cycle, so the TDD lint fails INV-TDD-002 and the rework diff has no independent review record |
| IR-002 | MEDIUM | late | OPEN | No evidence test pins a cell's `reason_detail`, so blanking it in `_cell_from_row` or `stock_evidence.sql` survives |

### IR-001 — The rework cycle has no TDD-evidence entry (INV-TDD-002)

- **Severity**: HIGH
- **Scope**: delta
- **Status**: OPEN
- **Acceptance criteria**: N/A (T022 traces to no AC)
- **Tasks**: T022
- **Files**: `docs/.../stories/CAP-002-E3-S3-tdd-evidence.yaml` (only `cycle-1`,
  whose `diff_sha256` `5e90be32…0684` and `reviewed_patch` `cycle-1.patch`
  describe `7e9ec3a`); `docs/.../stories/CAP-002-E3-S3-evidence/` (no file added
  since `7e9ec3a`); commit `9acfe60`
- **Claim challenged**: T022 is checked, and the rework commit message lists
  IR-001 to IR-004 as reworked. The v1 Follow-Up required "Record the rework as
  a new TDD-evidence cycle".
- **Observed evidence**:
  - The TDD lint, rerun by this review with `--require-logs`, exits 1 with
    `ERROR TDD-LINT-COVERAGE behaviour-changing commit 9acfe60473c0 … is named
    by no cycle and covered by no exception (INV-TDD-002)`.
  - `9acfe60` changes `reader_seed.py`, `test_reader_compare.py` and
    `test_reader_evidence.py`, so it is behaviour-changing in the lint's
    classification.
  - The evidence file's only change in that commit is one line inside
    `cycle-1`: the `manual:membership-order-id-dropped` survivor `reason` was
    replaced. There is no `cycle-2`, and no rework RED record. No log shows the
    five v1 survivors surviving the old tests and failing the new ones. There
    is no GREEN record, and no code-review or spec-drift verdict for the rework
    diff. There is no `diff_sha256` or `reviewed_patch`, and no mutation block.
    The `CAP-002-E3-S3-evidence/` directory is unchanged since `7e9ec3a`.
  - Cycle-1 now carries a disposition its own reviews never judged.
  - Both sibling reworks in this epic recorded their rework as a `cycle-2` with
    `commit_hash: stage`, RED/GREEN, reviews, patch and mutation results:
    `CAP-002-E3-S1-tdd-evidence.yaml` and `CAP-002-E3-S2-tdd-evidence.yaml`.
    The lint resolves such a cycle to `9acfe60` through `diff_sha256`.
- **Expected evidence/behavior**:
  - T022: "After each TDD cycle … stage only that cycle's diff, dispatch an
    independent code-review subagent and an independent spec-drift subagent
    against it, and append the cycle to `CAP-002-E3-S3-tdd-evidence.yaml` …
    before the next cycle begins."
  - INV-TDD-002 (`docs/constitutions/tdd-discipline.constitution.md`): a
    behaviour-changing commit named by no cycle entry and covered by no
    exception is a violation.
  - INV-TDD-003: per-task code-review and spec-drift verdicts are mandatory.
  - Skill step E.8: each lint `ERROR` is a finding of at least HIGH severity.
    The constitution rates INV-TDD-002 Critical. This review grades it HIGH on
    the skill's scale, because it is a failing required validation and missing
    process evidence for a tests-only commit, with no production defect.
- **Impact**: The rework's test changes passed no independent review, and no
  record exists of the RED that would show the new assertions fail against v1's
  survivors. This review did reproduce those kills itself. However, the
  per-cycle review contract is the gate the constitution makes mechanical, and
  the lint will keep failing every later review of this story until the cycle
  exists. The in-place edit also makes cycle-1 differ from what its reviews
  approved.
- **Required remediation**:
  - Append a rework cycle (for example `cycle-2`, `commit_hash: stage`) that
    covers the `9acfe60` diff. Give it the tasks it touches, RED evidence (the
    v1 survivors surviving the cycle-1 tests, then failing the new ones), GREEN
    evidence, independent code-review and spec-drift verdicts with their logs,
    `diff_sha256` and `reviewed_patch`, and a mutation block.
  - Record the corrected `manual:membership-order-id-dropped` reason in that
    cycle rather than only in cycle-1.
  - `check-tdd-evidence.py … --base 85254d1… --require-logs` must exit 0.
  - No production change is required.

### IR-002 — No evidence test pins a cell's `reason_detail`

- **Severity**: MEDIUM
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: AC-17 (the evidence read's cells; design 2.6 and the
  design 7 row "Evidence rows and memberships")
- **Tasks**: T010, T018
- **Files**: `src/factorflow/classification/reader.py:651` (`_cell_from_row`,
  `reason_detail=row["reason_detail"]`);
  `src/factorflow/classification/sql/stock_evidence.sql:27`;
  `tests/integration/test_reader_evidence.py:312–326`
  (`test_evidence_shows_an_outdated_input_and_its_cell_reason_consistently`) and
  97–178 (TC-COMP-146)
- **Claim challenged**: T018 says `_cell_from_row` reads the seven unprefixed
  columns, `reason_detail` among them, by name and derives nothing, and that
  each evidence cell is the stored row.
- **Observed evidence**:
  - `manual:v2-cell-reason-detail-dropped` (`reason_detail=None`) survives the
    five focused suites, and so does
    `manual:v2-evidence-sql-cell-reason-detail-null` (the cell branch selects
    `NULL`).
  - TC-COMP-146 compares each cell with its stored row, but AAPL's three cells
    are classified, so `reason_detail` is None on both sides.
  - The outdated-input test seeds the growth cell with the reason detail
    `revenue_growth is input_outdated` (`seed_scored_stock`), but it asserts
    only `reason_code` and `reason_input`.
  - The retired cells carry no detail.
  - The production lines are unchanged since the baseline, and v1 did not run
    these mutants. `scope` tags both `late`.
- **Expected evidence/behavior**: Design 2.3 fixes `FactorCell.reason_detail`.
  Design 2.6 returns the stock's three stored cells. T018 says
  `_cell_from_row` derives nothing, and CAP-002-E3-S4's `stock_history`
  reuses it. A test should fail when a cell's stored `reason_detail` is lost.
- **Impact**: A regression that drops the column from the statement, or the
  field from the mapper, would make the evidence page and inspector show a
  cell's reason without its detail line, such as "revenue growth is outdated"
  (AC-17), and no test would fail. `_cell_from_row` is the seam CAP-002-E3-S4
  reuses, and that story's reviews mutate only its own lines. The production
  code is correct today. This is `late`, so it does not block.
- **Required remediation**: Optional for this gate. Assert the stored
  `reason_detail` of a `not_classified` input-reason cell in the evidence read,
  for example in the outdated-input test or in TC-COMP-146 with an
  input-reason cell. Both mutants should then be killed.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v1/IR-001 (HIGH) | RESOLVED | TC-COMP-146 seeds AAAA and ZZZZ with other cells `(0.9, 90)` and other input values in the same current set (`test_reader_evidence.py:103–135`) and asserts AAPL's stored cells (`:168–178`). `manual:evidence-inputs-any-instrument` fails at `:141`; `manual:evidence-cells-any-instrument` fails at `:176` (this review's run) |
| v1/IR-002 (HIGH) | RESOLVED | `seed_scored_stock`/`seed_inputs` gain `reverse` (`reader_seed.py:276`, `:334`), and TC-COMP-146 stores AAPL's cells and inputs against definition order (`reverse=True`, `:117`, `:126`). `manual:evidence-input-order-removed` fails at `:141`; `manual:evidence-factor-order-removed` fails at `:174` |
| v1/IR-003 (HIGH) | RESOLVED | The never-classified compare case inserts a `building` first set and asserts `read_set_blocks(conn)[1] is not None` (`test_reader_compare.py:261–263`); `manual:compare-never-classified-later-dropped` fails at `:273` (`None == LaterSet(… state='building' …)`) |
| v1/IR-004 (LOW) | RESOLVED | The survivor reason now cites DEC-0057 and universe-service design §3 (line 445: "Names are unique among active universes"). The equal-names test's docstring states that it documents unreachable data (`test_reader_evidence.py:426–427`). The correction was made inside cycle-1 rather than in a new cycle, which IR-001 covers |

## Scope and Plan Deviations

- **Justified (carried from v1).** `stock_evidence.sql` wraps its `UNION ALL`
  in a subquery (`SELECT u.* FROM (…) u ORDER BY …`). PostgreSQL refuses
  expressions in a `UNION`'s `ORDER BY`, and the TDD evidence records this. The
  statement also resolves the instrument's latest reference name (DEC-0245)
  through an `instrument_row` CTE.
- **Justified (carried from v1).** T002's `add_member`/`remove_member` already
  existed and are reused.
- **Justified (rework).** `reverse` is a new keyword-only parameter with a
  default, on two seed helpers. T002 permits optional keyword parameters, and
  every existing call keeps its behaviour.
- **Plan composition (carried).** TC-COMP-146 seeds seven `present` and one
  `missing` input. The planned `outdated` row is asserted in
  `test_evidence_input_row_carries_the_dates_the_statement_stored`.
- **Plan inaccuracy (not the coder's).** The Validation Plan says "Build: none
  defined"; the tech-stack table lists `uv build`. T019 is the planned
  packaging proof and passed.
- **Recorded open behaviour (Open Gap 4).** With no complete set, compare
  returns `unknown_symbols=[]`. This follows design 2.7 and is flagged in the
  plan for the API design. It is not a finding.
- **Non-blocking observation (carried).** `stock_evidence` upper-cases its
  symbol and does not shape-check it. That is DEC-0132's "no other rewriting",
  and the symbol is bound. A non-string symbol raises `AttributeError`, and no
  artifact specifies otherwise.
- **Evidence bookkeeping.** `9acfe60` edited the reviewed `cycle-1` in place
  and added no cycle (IR-001). All 22 tasks are checked, and T022 is
  `PARTIAL`.
- **Scope leakage.** None. Every changed file traces to a task or to v1's
  remediation.

## Follow-Up

- **Next agent**: Coding Agent (`$story-coding`, rework), with
  `CAP-002-E3-S3-tasks.md` and this report.
- **Required action**:
  - Record the `9acfe60` rework as a new TDD-evidence cycle with RED/GREEN,
    independent code-review and spec-drift verdicts, `diff_sha256`,
    `reviewed_patch` and a mutation block. The TDD lint must then exit 0
    (IR-001).
  - IR-002 is optional for the gate: an assertion on a cell's stored
    `reason_detail` in the evidence read.
  - No production change is required.
  - Then rerun `$adversarial-review`. It will take this report as its baseline
    and `CAP-002-E3-S3-implementation-review-v2-mutation.json` as
    `scope --previous`.
- **Warnings accepted downstream**: N/A
