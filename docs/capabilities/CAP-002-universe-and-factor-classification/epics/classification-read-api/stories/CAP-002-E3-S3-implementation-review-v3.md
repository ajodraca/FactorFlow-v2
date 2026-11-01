---
artifact_schema_version: 1
artifact_id: CAP-002-E3-S3-implementation-review
artifact_type: implementation-review
artifact_version: 3
status: completed
owner: Alvaro de Jodra
owner_github: ajodraca
created: 2026-11-01
updated: 2026-11-01
story_id: "CAP-002-E3-S3"
story: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S3.md"
tasks: "docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S3-tasks.md"
component: "FactorFlow-v2"
review_version: 3
reviewed_at: "2026-11-01T21:37:43Z"
reviewed_head: "df7f4cc39bc5d7721063468d9af009ac676b7475"
review_base: "85254d12f58d74865c59c95d9a21e986d6c79713"
reviewed_state_revision: "sha256:e2c5e5dcdf53e41ede965d138a44bad2a36076916909fcf4e5ba35b3cbcd0de8"
verdict: PASS-WITH-WARNINGS
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
  timestamp: 2026-11-01T21:45:40Z
  source_artifacts:
    - id: CAP-002-E3-S3
      version: "1 (sha256:55a201cea26b0ad63514f32efe41e8ad0c3940d1ce881d01dafcaae040a74115)"
    - id: CAP-002-E3-S3-tasks
      version: "1 (updated 2026-11-01, last_reworked_review v2)"
    - id: CAP-002-E3-S3-tdd-evidence
      version: "cycle-1, rework-1, rework-2 (as of df7f4cc)"
    - id: CAP-002-E3-S3-implementation-review
      version: "2 (baseline, reviewed_head 9acfe60473c013790e205f342aede7da5807e9f6)"
    - id: CAP-002-component-design-classification-reader
      version: "3"
    - id: CAP-002-classification-reader-component-tests
      version: "1"
    - id: tech-stack
      version: "7"
  invoking_user: ajodraca
  correlation_id: 46789099-86c6-4691-b89c-83f573bd73af
---

# Implementation Review: CAP-002-E3-S3 — Version 3

## Gate Summary

| Field | Result |
|-------|--------|
| Verdict | **PASS-WITH-WARNINGS** |
| Critical findings | 0 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 1 |
| Acceptance criteria | 10/10 satisfied |
| Planned tasks | 22/22 verified |
| Required validation | 9/9 passed |

**By severity:** CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 · **total 1**

This is a re-review. Its baseline is v2 (`CHANGES-REQUIRED`, reviewed_head
`9acfe60`, mutation results `CAP-002-E3-S3-implementation-review-v2-mutation.json`).
The rework commit `df7f4cc` changes no production file. It adds two TDD-evidence
cycles with their logs, patches, reviews and mutation results, adds one assertion
to one evidence test, and updates the plan's `last_reworked_review`.

Both v2 findings are resolved, and this review checked each against the
repository rather than the commit message:

- **v2 IR-001 (HIGH).** The TDD-evidence lint, rerun here with
  `--require-logs`, now exits 0. Cycle `rework-1` names `9acfe60`. Its
  `reviewed_patch` hashes to its `diff_sha256` (`797a3a2b…c21a`), and that equals
  the canonical fingerprint of `8cec1a3..9acfe60`. It carries a RED log, a GREEN
  log, an APPROVED code review, a no-drift spec review and a mutation block.
  Cycle `rework-2` resolves to `df7f4cc` through its `diff_sha256`, which equals
  the hash of the commit's test diff.
- **v2 IR-002 (MEDIUM).** Both v2 survivors are now killed at
  `test_reader_evidence.py:325`.

All nine required commands pass, every acceptance criterion is satisfied and
every mandatory test is `ADEQUATE`.

One new LOW finding remains, scope `late`, so it cannot block (IR-001). The new
assertion's expected value, `"revenue_growth is input_outdated"`, is the seed
helper's own join of the cell's `reason_input` and `reason_code`. A reviewer
mutant that rebuilds `reason_detail` from those two columns therefore survives.

## Review Subject

| Evidence | Value |
|----------|-------|
| Story | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S3.md` |
| Task plan | `docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/CAP-002-E3-S3-tasks.md` |
| Component | `FactorFlow-v2` (`repos/factorflow-v2/FactorFlow-v2`, also the project repo) |
| Branch | `usr/alvaro-de-jodra/CAP-002-E3-S3-run-20261101T024649Z` |
| HEAD | `df7f4cc39bc5d7721063468d9af009ac676b7475` (`rework(CAP-002-E3-S3): rework review v2 - rework-1 evidence cycle and cell reason_detail test`) |
| Review base | `origin/main` → `85254d12f58d74865c59c95d9a21e986d6c79713` (`pipeline-state.py review-base --base-ref origin/main`, and the same commit without `--base-ref`; `git merge-base --is-ancestor` exit 0) |
| Working tree | clean (`git status --porcelain=v1 --untracked-files=all` empty) before and after validation |
| Changed files reviewed | 38 across five commits (`7e9ec3a`, `8cec1a3`, `9acfe60`, `0231839`, `df7f4cc`); 20 changed since the baseline, 1 of them outside `docs/` |
| Baseline | v2, reviewed_head `9acfe60473c013790e205f342aede7da5807e9f6`, with `CAP-002-E3-S3-implementation-review-v2-mutation.json` |

### Changed Files

Paths under `docs/.../stories/` abbreviate
`docs/capabilities/CAP-002-universe-and-factor-classification/epics/classification-read-api/stories/`.
A **Δ** in the State column marks a file changed since the baseline (`git diff
9acfe60 df7f4cc`).

| File | State | Story/Task Justification |
|------|-------|--------------------------|
| `src/factorflow/classification/reader.py` | modified | DAC-E3-S3-1 to -5, DAC-E3-7, DAC-E3-8, DAC-E3-12; T016, T017, T018. Unchanged since v1 |
| `src/factorflow/classification/sql/list_classifications.sql` | modified | DAC-E3-S3-1, DAC-E3-S3-4; T013 (DEC-0133). Unchanged since v1 |
| `src/factorflow/classification/sql/stock_evidence.sql` | added | DAC-E3-S3-3, DAC-E3-S3-5; T015. Unchanged since v1 |
| `src/factorflow/classification/sql/stock_memberships.sql` | added | DAC-E3-S3-3, DAC-E3-8; T014 (DEC-0134). Unchanged since v1 |
| `tests/integration/reader_seed.py` | modified | T002 (and the keyword-only `reverse` from the v1 rework) |
| `tests/integration/test_reader_compare.py` | added | TC-COMP-123, 124, 113; T003, T004, T005, T009 |
| `tests/integration/test_reader_evidence.py` | added **Δ** | TC-COMP-146, 113, 147; T005, T006, T007, T010, T011. The rework adds one assertion and its comment at `:324–325` (v2 IR-002) |
| `tests/unit/test_reader_filters.py` | modified | T008 |
| `tests/unit/test_reader_input_labels.py` | added | T008 |
| `tests/unit/test_reader_sql_read_only.py` | modified | T012 |
| `docs/.../stories/CAP-002-E3-S3.md` | modified | `status` → `in-review` only; content revision unchanged (`sha256:55a201ce…4115`) |
| `docs/.../stories/CAP-002-E3-S3-tasks.md` | modified **Δ** | Story-coding rework metadata: `last_reworked_review` → v2. No task text or checkbox changed |
| `docs/.../stories/CAP-002-E3-S3-tdd-evidence.yaml` | added **Δ** | T022. The rework adds a header note and cycles `rework-1` and `rework-2`. Cycle-1 is unchanged by `df7f4cc` |
| `docs/.../stories/CAP-002-E3-S3-evidence/` (6 cycle-1 files, unchanged) and 15 rework files **Δ**: `rework-{1,2}.patch`, `red-rework-{1,2}.log`, `green-rework-{1,2}.log`, `full-suite-rework-2.log`, `code-review-rework-{1,2}.txt`, `spec-drift-rework-{1,2}.txt`, `mutants-rework-{1,2}.json`, `mutation-rework-{1,2}-results.json` | added | T022 (v2 IR-001, IR-002) |
| `docs/.../stories/CAP-002-E3-S3-implementation-review-v1.md`, `-v1-mutation.json`, `-v2.md`, `-v2-mutation.json` | added (v2 pair **Δ**) | Reviews v1 and v2 and their mutation results, committed by the driver (`8cec1a3`, `0231839`, docs only) |

No unjustified file, dependency or configuration change. `pyproject.toml`,
`uv.lock`, `tests/conftest.py` and `frontend/` are unchanged since the base.

## Acceptance Criteria Verification

Production code is identical to v2's reviewed state (`git diff --stat 9acfe60
df7f4cc -- src/` is empty), so the production evidence below is carried from v2
and confirmed by this review's own test and mutation runs.

| AC | Result | Production Evidence | Test Evidence | Notes |
|----|--------|---------------------|---------------|-------|
| AC-16 | SATISFIED | `reader.py:compare` (572–586) over `list_classifications` with `symbols` set; `list_classifications.sql` scope clause (19–22) | `test_reader_compare.py`: `test_compare_returns_every_known_symbol_two_to_six_only`, `test_compare_orders_by_symbol_whatever_the_request_order`, `test_compare_shares_the_list_statement_and_cell_model` | This story covers the side-by-side half. Sort and filter are CAP-002-E3-S2's |
| AC-17 | SATISFIED | `stock_evidence.sql` input branch (33–38); `reader.py:stock_evidence` (589–634) builds `InputRow` with `value`, `as_of`, `known_on` | TC-COMP-146; `test_evidence_input_row_carries_the_dates_the_statement_stored`; `test_evidence_shows_an_outdated_input_and_its_cell_reason_consistently` (now pins the cell's `reason_detail`) | `manual:v3-input-dates-swapped` is killed at `test_reader_evidence.py:146`. The derivability of the pinned detail is IR-001 (LOW, late) |
| DAC-E3-7 | SATISFIED | `ListFilters.__post_init__` (350–357): count 2 to 6 and shape through `is_valid`; `compare` `unknown_symbols` (583–586) | TC-COMP-123, TC-COMP-124, unit `test_compare_refuses_a_bad_request_before_any_statement` | Bound imported once from `api.classification_bounds` (T020 grep) |
| DAC-E3-8 | SATISFIED | `stock_evidence.sql`, `stock_memberships.sql`, `_memberships` (637–640) | TC-COMP-146, the memberships tests, `test_memberships_agree_with_the_membership_replay` | Every leak and ordering mutant is killed |
| DAC-E3-12 | SATISFIED | `_cell_from_row` (643–652) reads the stored `restated_possible`; `InputRow.restated_possible` comes from the input row; compare reuses the list mapper | `test_compare_shares_the_list_statement_and_cell_model`, `test_evidence_cell_and_input_restatement_flags_are_independent` | `manual:evidence-cell-restated-dropped` and `manual:evidence-input-restated-dropped` are killed |
| DAC-E3-S3-1 | SATISFIED | `ListFilters.__post_init__`; scope clause `(i.lifecycle = 'active' OR %(symbols)s::text[] IS NOT NULL)` | TC-COMP-123 and the unit bound tests | Every bound and shape mutant is killed |
| DAC-E3-S3-2 | SATISFIED | `compare` (583–586) | TC-COMP-124 | With no complete set, compare returns the never-classified page with `unknown_symbols=[]` (plan Open Gap 4, flagged for the API design) |
| DAC-E3-S3-3 | SATISFIED | `stock_evidence.sql` (instrument, cell and input branches, ordered by bound arrays, 39–41); `reader.py` 589–634 | TC-COMP-146 | The ordering and leak mutants fail at `:141`, `:174` and `:176` |
| DAC-E3-S3-4 | SATISFIED | Scope clause (DEC-0133); evidence reads the stored `retired` cells | `test_compare_keeps_a_retired_stock_while_the_list_still_omits_it`, `test_evidence_keeps_a_retired_stock_with_the_retired_reason` | Both scope mutants are killed |
| DAC-E3-S3-5 | SATISFIED | `stock_evidence` binds `set_id=None` when `current` is None | `test_evidence_with_no_current_set_has_a_null_set_and_the_same_shape[no_set, building_only]` | `manual:evidence-reads-later-set` and `manual:evidence-set-block-dropped` are killed |

## Task Completion Verification

| Task | Claimed | Result | Implementation Evidence | Notes/Deviation |
|------|---------|--------|-------------------------|-----------------|
| T001 | complete | VERIFIED | All producers exist at the base: E3-S1/E3-S2 reader names, `universes/replay.py:MEMBERSHIP_AS_OF_SQL`, `api/classification_bounds.py` (2, 6), `constants.INPUT_NAMES` (a mapping by factor) and `INPUT_LABELS`, migrations 0005/0006, `instruments.symbols.is_valid` | Only the two compare constants are imported (`reader.py:71`) |
| T002 | complete | VERIFIED | `reader_seed.py`: `seed_inputs`, `rename_universe`, `insert_input(restated_possible=…, detail=…)`, keyword-only `reverse=False` | `add_member`/`remove_member` already existed and are reused. No existing signature changed and no fixture was added |
| T003 | complete | VERIFIED | `test_compare_returns_every_known_symbol_two_to_six_only`, `test_compare_orders_by_symbol_whatever_the_request_order` | TC-COMP-123 |
| T004 | complete | VERIFIED | `test_compare_reports_an_unrecognised_symbol` | TC-COMP-124; malformed symbols are refused in the unit file (T008) |
| T005 | complete | VERIFIED | `test_compare_keeps_a_retired_stock_while_the_list_still_omits_it`, `test_evidence_keeps_a_retired_stock_with_the_retired_reason` | TC-COMP-113, both halves |
| T006 | complete | VERIFIED | `test_evidence_returns_every_input_with_dates_and_universes_in_name_order` (97–178) | TC-COMP-146. The planned `outdated` row is proved in `test_evidence_input_row_carries_the_dates_the_statement_stored` (plan composition, as v1 and v2 noted) |
| T007 | complete | VERIFIED | `test_evidence_with_no_current_set_has_a_null_set_and_the_same_shape` (two cases) | TC-COMP-147; PROVISIONAL DEC-0131 comment present |
| T008 | complete | VERIFIED | `test_reader_filters.py` E3-S3 block, `test_reader_input_labels.py` | Every bound, shape and normalisation mutant is killed |
| T009 | complete | VERIFIED | The seven additional compare tests | The never-classified case holds a `building` first set and asserts a non-null `later` |
| T010 | complete | VERIFIED | `test_evidence_reads_only_the_current_set`, `..._restatement_flags_are_independent`, `..._outdated_input_...` (`:312–328`), `..._case_insensitive_...`, `..._no_universe_...`, `..._two_statements_besides_the_set_block_read` | The outdated-input test now asserts the cell's `reason_detail` (`:325`), resolving v2 IR-002. The pinned value is derivable from the row (IR-001, LOW) |
| T011 | complete | VERIFIED | Memberships tests (379–460) | The equal-names test documents unreachable data (DEC-0057) |
| T012 | complete | VERIFIED | `test_reader_sql_read_only.py`: both files in the one-statement scan and `test_evidence_statements_substitute_no_request_text` | — |
| T013 | complete | VERIFIED | `list_classifications.sql:19–22` | The planned clause plus a one-line DEC-0133 comment; E3-S2's list tests pass in the postgres suite |
| T014 | complete | VERIFIED | `stock_memberships.sql` | The design 2.6 statement with `ORDER BY n.name, u.universe_id` |
| T015 | complete | VERIFIED | `stock_evidence.sql` | Justified deviation: the `UNION ALL` is wrapped in a subquery (see Scope and Plan Deviations) |
| T016 | complete | VERIFIED | `reader.py` 71–78, 350–357, 380–426 | `INPUT_LABELS`/`INPUT_NAMES` imported from `constants` and re-exported; `InstrumentNotFound(LookupError)` at 409 |
| T017 | complete | VERIFIED | `reader.py:compare` (572–586) | No SQL of its own; never-classified page returned unchanged |
| T018 | complete | VERIFIED | `reader.py:stock_evidence` (589–634), `_memberships` (637), `_cell_from_row` (643) | `FactorCell(` at 645 and 759 only, as the plan expects |
| T019 | complete | VERIFIED | `tests/unit/test_package_data_ships_sql.py`: 10 passed | `uv build` also succeeded this time, and its wheel holds `classification/sql/stock_evidence.sql` and `stock_memberships.sql` |
| T020 | complete | VERIFIED | Greps rerun (Independent Validation) | All return as stated |
| T021 | complete | VERIFIED | The module docstring cites DAC-E3-S3-1 to -5, DAC-E3-7, DAC-E3-8, DAC-E3-12 and the five TC-IDs; ruff, format and mypy are clean | No file beyond the plan's list |
| T022 | complete | VERIFIED | `CAP-002-E3-S3-tdd-evidence.yaml`: `cycle-1` (`stage` → `7e9ec3a`), `rework-1` (`9acfe60`), `rework-2` (`stage` → `df7f4cc`); lint exit 0 with `--require-logs` | v2 IR-001 is resolved. `rework-1` was recorded after its commit, as v2's remediation required (see Scope and Plan Deviations) |

## Test Quality Assessment

| Test / TC-ID | Result | Behavior and Assertions Reviewed | Gap |
|--------------|--------|----------------------------------|-----|
| `test_compare_returns_every_known_symbol_two_to_six_only` / TC-COMP-123 | ADEQUATE | 2 and 6 symbols, stored status and reason per cell, retired `lifecycle`, `match_count`, `next_cursor`; 1 and 7 refused with zero statements through a counting wrapper | none |
| `test_compare_reports_an_unrecognised_symbol` / TC-COMP-124 | ADEQUATE | One unknown, two unknown in request order, all unknown with `match_count` 0, none unknown | none |
| `test_compare_keeps_a_retired_stock_while_the_list_still_omits_it` / TC-COMP-113 (compare) | ADEQUATE | Three `retired` cells, and the unscoped list still excludes R; kills both scope mutants | none |
| `test_evidence_keeps_a_retired_stock_with_the_retired_reason` / TC-COMP-113 (evidence) | ADEQUATE | Three `retired`/`not_classified` cells, no inputs, membership kept | none |
| `test_evidence_returns_every_input_with_dates_and_universes_in_name_order` / TC-COMP-146 | ADEQUATE | Labels, `Decimal` values, dates, the `missing` row, input restatement, `detail`, memberships in name order, the set block, and cells equal to AAPL's stored rows, with two other stocks in the same set and AAPL's rows stored against definition order | Observation carried from v2: the kill of `manual:evidence-cells-any-instrument` depends on PostgreSQL's order among tied rows. That order is deterministic for the pinned `postgres:16` image and the fixed insert order. Not a finding |
| `test_evidence_with_no_current_set_has_a_null_set_and_the_same_shape` / TC-COMP-147 | ADEQUATE | No set and building-only (with building inputs) both give `set` None, empty `factors`/`inputs`, populated memberships, the fixed field list, and `InstrumentNotFound` | none |
| Additional compare tests (T009) | ADEQUATE | Shared statement, stored `restated_possible`, default thresholds, set/later blocks, the never-classified page with a non-null building `later`, normalisation and dedupe, a known instrument with no row reported, independence from universes | none |
| Additional evidence tests (T010) | ADEQUATE | Current set only, independent restatement flags, outdated input with the cell's `reason_code`, `reason_input` and now `reason_detail`, case-insensitive lookup, unknown symbol, no universe, statement count | The pinned `reason_detail` equals `f"{reason_input} is {reason_code}"`, so a reader that rebuilt it from those two columns would pass. One `late` survivor, LOW (IR-001). A `late` survivor does not make the test `WEAK` |
| Memberships tests (T011) | ADEQUATE | Two universes in name order, rename, removal, re-add, retired universe, late addition, equal names (documented as unreachable data), equivalence with `MEMBERSHIP_AS_OF_SQL` | none |
| `test_evidence_name_is_the_latest_stored_reference_name`, `test_evidence_never_reads_rows_of_another_set`, `test_evidence_models_are_frozen_and_the_error_names_its_symbol` | ADEQUATE | Latest reference name, empty evidence when only an older set holds rows, frozen models, `InstrumentNotFound.symbol` | none |
| `tests/unit/test_reader_filters.py` (T008 additions) | ADEQUATE | Count bound at 0, 1, 2, 6, 7 and None; shape refusals; bound identity; no-statement fake for seven bad requests; `_normalise_symbols` | none |
| `tests/unit/test_reader_input_labels.py` | ADEQUATE | Identity with `constants.INPUT_LABELS`, key set against `INPUT_NAMES`, exact values, no label equal to its key | none |
| `tests/unit/test_reader_sql_read_only.py` (T012) | ADEQUATE | One read-only statement each; no `{` and no bare `%` | none |

**Mutation.** This review regenerated mutants over `85254d1..df7f4cc` and got 38
from the shared catalogue over every changed production file. It added 4
hand-written mutants of its own (`manual:v3-*`). Then
`mutation-run.py scope --since 9acfe60… --previous …-v2-mutation.json` added
v2's 41 manual mutants (v1's 34 and v2's 7) and tagged the 83:

- **carried** (75): no production line has changed since the baseline;
- **late** (8): this review's 4 mutants, and v2's 4 that v2 tagged `late`.

All 83 ran against the story's five focused suites, with four green baselines
(`repo_head` `df7f4cc`, empty `tree_patch_sha256`): **66 killed, 17 survived**.
The results are in `CAP-002-E3-S3-implementation-review-v3-mutation.json`,
SHA-256 `6db0e0fdd0384ca32a7de51a07a3a9b0b265246057be50e29a9a628b3c81f940`.

v2's two non-equivalent survivors are killed now:

| Mutant | Killed by |
|--------|-----------|
| `manual:v2-cell-reason-detail-dropped` | `test_evidence_shows_an_outdated_input_and_its_cell_reason_consistently`, `test_reader_evidence.py:325` (`None == 'revenue_growth is input_outdated'`) |
| `manual:v2-evidence-sql-cell-reason-detail-null` | Same test and line |

This review's own mutants:

| Mutant | Change | Result |
|--------|--------|--------|
| `manual:v3-cell-reason-detail-from-reason-code` | `_cell_from_row`: `reason_detail=row["reason_code"]` | Killed at `:325` |
| `manual:v3-evidence-sql-cell-reason-input-null` | `stock_evidence.sql:27`: the cell branch selects `NULL` for `reason_input` | Killed at `:323` |
| `manual:v3-input-dates-swapped` | `InputRow(as_of=r["known_on"], known_on=r["as_of"])` | Killed at `:146` |
| `manual:v3-cell-reason-detail-derived` | `_cell_from_row`: `reason_detail=row["reason_detail"] and f"{row['reason_input']} is {row['reason_code']}"` | **Survived** (115 passed). Not equivalent, `late` (IR-001) |

The other sixteen survivors are equivalent, with the dispositions v1 and v2 gave
them:

- **Carried (14).**
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
    section 3 make active names unique, and the statement drops retired
    universes.
- **`manual:v2-evidence-instrument-check-dropped`** (`if not rows:` only). T018
  specifies "zero rows raises `InstrumentNotFound`", and the mutant is that
  rule. Both other branches join `instrument_row`, so a non-empty result always
  starts with the rank-0 instrument row.
- **`manual:v2-evidence-name-hash-tiebreak-asc`** (`value_hash ASC`). DEC-0245
  defines the name as that of the most recent reference row and leaves the order
  among rows recorded at the same instant open. `value_hash` only makes
  `LIMIT 1` deterministic among them.

## Independent Validation

| Command | Working Directory | Exit Code | Result | Notes |
|---------|-------------------|-----------|--------|-------|
| `bash scripts/check-prerequisites.sh --project factorflow-v2 --require tech-stack` | harness root | 0 | PASS | All eight checks PASSED |
| `python3 scripts/pipeline-state.py check --project factorflow-v2 --capability CAP-002 --story docs/.../CAP-002-E3-S3.md --stage adversarial-review` | harness root | 0 | PASS | `READY — review changes were reworked; a new review version is required` |
| `python3 scripts/pipeline-state.py review-base --repo-dir repos/factorflow-v2/FactorFlow-v2 [--base-ref origin/main]` | harness root | 0 | PASS | `85254d12f58d74865c59c95d9a21e986d6c79713` both ways, an ancestor of HEAD; the baseline head `9acfe60` is also an ancestor |
| `uv run --directory repos/factorflow-v2/FactorFlow-v2 --offline pytest tests/unit/test_reader_filters.py tests/unit/test_reader_input_labels.py tests/unit/test_reader_sql_read_only.py -q -p no:cacheprovider` (sandboxed) | component | 2 | NOT RUN (environment) | `error: Failed to initialize cache at /Users/alvarodejodra/.cache/uv … Operation not permitted (os error 1)`, a sandbox refusal; every `uv run` below was sent outside the sandbox as one plain call |
| same command, outside the sandbox | component | 0 | PASS | `85 passed in 0.44s` |
| `uv run --directory … --offline pytest tests/integration/test_reader_compare.py tests/integration/test_reader_evidence.py -m postgres -v -p no:cacheprovider` | component | 0 | PASS | `30 passed in 5.30s` |
| `uv run --directory … --offline pytest -m postgres -q -p no:cacheprovider` | component | 0 | PASS | `865 passed, 1457 deselected, 2 warnings in 361.48s` |
| `uv run --directory … --offline pytest -m "not postgres" -q -p no:cacheprovider` | component | 0 | PASS | `1456 passed, 865 deselected, 1 xfailed, 2 warnings in 27.05s`. The two halves total 2321 passed and 1 xfailed, as in v2: the rework added an assertion, not a test |
| `uv run --directory … --offline ruff check .` | component | 0 | PASS | `All checks passed!` |
| `uv run --directory … --offline ruff format --check .` | component | 0 | PASS | `270 files already formatted` |
| `uv run --directory … --offline mypy src` | component | 0 | PASS | `Success: no issues found in 60 source files` |
| `uv run --directory … --offline pytest tests/unit/test_package_data_ships_sql.py -q -p no:cacheprovider` (T019) | component | 0 | PASS | `10 passed in 0.35s` |
| T020 greps: `MIN_/MAX_COMPARE_SYMBOLS` under `src/factorflow/`; `FROM factor_classification\|IS DISTINCT FROM 'classified'` in `reader.py`; `hide_incomplete` under `classification/sql/`; `universes.service` in `reader.py`; `free-cash-flow yield` under `src/factorflow/`; `^INPUT_LABELS` in `reader.py` | component | 0/1/0/1/0/1 | PASS | One import at `reader.py:71`, and the literals 2 and 6 only in `classification_bounds.py:9,12`. No predicate in Python. `list_classifications.sql` only. No service import. One label line at `constants.py:26`. No label table in the reader |
| `python3 scripts/check-tdd-evidence.py --evidence repos/.../CAP-002-E3-S3-tdd-evidence.yaml --repo-dir repos/factorflow-v2/FactorFlow-v2 --base 85254d12f58d74865c59c95d9a21e986d6c79713 --decisions-dir projects/factorflow-v2/decisions --require-logs` | harness root | 0 | PASS | `0 error(s), 0 warning(s)` |
| `python3 scripts/check-tdd-evidence.py fingerprint --repo-dir … --evidence …-tdd-evidence.yaml --range 8cec1a3..9acfe60`; `git diff 0231839 df7f4cc -- tests/ src/ \| shasum -a 256`; `shasum -a 256` of the rework patches and logs | harness root | 0 | PASS | `797a3a2b…c21a` = `rework-1.diff_sha256` = hash of `rework-1.patch`; `c27e80a9…7e14` = `rework-2.diff_sha256` = hash of `rework-2.patch`; the RED logs and mutation results hash to the values the cycles record |
| `python3 scripts/mutation-run.py generate --repo-dir repos/factorflow-v2/FactorFlow-v2 --range 85254d12…..HEAD --cycle review --out <tmp>/generated.json` | harness root | 0 | PASS | 38 mutants; 4 reviewer manual mutants appended |
| `python3 scripts/mutation-run.py scope --repo-dir … --mutants <tmp>/generated.json --since 9acfe60473c0… --previous …-v2-mutation.json --out <tmp>/mutants.json` | harness root | 0 | PASS | `83 mutant(s) … {"carried": 75, "late": 8}; 0 previous mutant(s) no longer apply` |
| `python3 scripts/mutation-run.py run --repo-dir … --mutants <tmp>/mutants.json --jobs 4 --command 'uv run --all-extras --offline pytest -x -q -p no:cacheprovider -p no:randomly <the five story suites>' --out <tmp>/results.json --logs <tmp>/logs --work-root <tmp>/work` (outside the sandbox) | harness root | 3 | evidence | Four green baselines; `{"killed": 66, "survived": 17}`. Exit 3 reports survivors, which are judged above |
| `uv build --directory … --offline --out-dir <tmp>/dist` (outside the sandbox) | component | 0 | PASS | `Successfully built … factorflow-0.1.0.tar.gz` and `…-py3-none-any.whl`; the wheel lists `factorflow/classification/sql/stock_evidence.sql` and `stock_memberships.sql`. Not required by the story or plan; v2 could not run it |
| `python3 scripts/pipeline-state.py code-revision --repo-dir repos/factorflow-v2/FactorFlow-v2` (before validation, after the test runs, after `uv build`) | harness root | 0 | PASS | `sha256:e2c5e5dcdf53e41ede965d138a44bad2a36076916909fcf4e5ba35b3cbcd0de8` all three times |

`<tmp>` is `/tmp/claude-501/ir-e3s3-v3`, outside the component repository.
`-p no:cacheprovider` only stops pytest writing its cache. It does not change
which tests are selected.

The nine required commands are:

- the story's five (`pytest -m postgres`, `pytest -m 'not postgres'`,
  `ruff check`, `ruff format --check`, `mypy src`);
- the focused story suites;
- T019;
- the T020 greps;
- the TDD-evidence lint.

All nine pass. Excluded, with reasons:

- `npm ci`, `npm run build|test|test:e2e|lint|format` and `npx tsc --noEmit`.
  No frontend file is changed.
- `uv sync --all-extras`. `pyproject.toml` and `uv.lock` are unchanged.

### Validation Side Effects

- Before: HEAD `df7f4cc39bc5d7721063468d9af009ac676b7475`, working tree clean,
  fingerprint `sha256:e2c5e5dc…0de8`.
- After: HEAD unchanged, working tree clean, fingerprint unchanged.
- `uv run` and `uv build` refreshed ignored, untracked outputs:
  `src/factorflow.egg-info/` and `build/`. Mutation clones, logs, mutants,
  results and the built distributions live in `<tmp>`. This review adds only
  this report and its `-mutation.json`, both under `docs/`, which the
  fingerprint excludes.
- Unexpected tracked-file changes: none.

## Findings

| ID | Severity | Scope | Status | Summary |
|----|----------|-------|--------|---------|
| IR-001 | LOW | late | OPEN | The evidence test's pinned cell `reason_detail` is the seed's join of `reason_input` and `reason_code`, so a reader that rebuilt it from those columns survives |

### IR-001 — The pinned `reason_detail` is derivable from the cell's own columns

- **Severity**: LOW
- **Scope**: late
- **Status**: OPEN
- **Acceptance criteria**: AC-17 (the evidence read's cells; design 2.6 and the
  design 7 row "Evidence rows and memberships")
- **Tasks**: T010, T018
- **Files**: `src/factorflow/classification/reader.py:651` (`_cell_from_row`,
  `reason_detail=row["reason_detail"]`); `tests/integration/test_reader_evidence.py:312–328`
  (`test_evidence_shows_an_outdated_input_and_its_cell_reason_consistently`,
  assertion at `:325`); `tests/integration/reader_seed.py:303–305`
  (`seed_scored_stock` stores `f"{reason_input} is {reason_code}"`)
- **Claim challenged**: The new comment at `:324` says the reader "derives
  nothing", and T018 says `_cell_from_row` reads `reason_detail` by name and
  derives nothing.
- **Observed evidence**:
  - `manual:v3-cell-reason-detail-derived` replaces the mapping with
    `row["reason_detail"] and f"{row['reason_input']} is {row['reason_code']}"`.
    It survives the five focused suites: 115 passed.
  - The expected value `"revenue_growth is input_outdated"` is exactly that
    join, because the seed builds it from the same two columns. No other
    evidence test stores a non-null cell detail.
  - The assertion does kill a column mix-up (`manual:v3-cell-reason-detail-from-reason-code`)
    and both v2 blanking mutants.
  - The rework's own code review (`code-review-rework-2.txt`, both rounds,
    NON-BLOCKING note 1) raised the same point. The cycle's description records
    it as not taken, because the engine's real format differs.
  - The production line is unchanged since v1. `scope` tags the mutant `late`.
- **Expected evidence/behavior**: Design 2.6 returns the stock's stored cells.
  T018 says `_cell_from_row` derives nothing, and CAP-002-E3-S4's
  `stock_history` reuses it. A test whose expected detail cannot be rebuilt from
  the row's other columns would fail on any derivation, not only on a lost
  column.
- **Impact**: The surviving fault would have to reproduce the test fixture's own
  wording. A derivation in the product's wording, which uses the label table
  (`classify.sql`), would not match the pinned value and would be caught. The
  production code is correct today. This is `late` and LOW, so it does not block.
- **Required remediation**: Optional. In the evidence read, pin a stored cell
  `reason_detail` that no join of the row's own columns produces. For example,
  insert the cell with `insert_classification(…, reason_detail=<distinct text>)`.
  `manual:v3-cell-reason-detail-derived` should then be killed.

## Previous Review Disposition

| Previous Finding | Disposition | Current Evidence |
|------------------|-------------|------------------|
| v2/IR-001 (HIGH) | RESOLVED | `check-tdd-evidence.py … --require-logs` exits 0 (`0 error(s), 0 warning(s)`). Cycle `rework-1` names `9acfe60` with RED (`red-rework-1.log`, the five v1 survivors surviving cycle-1's tests and failing the rework's), GREEN, APPROVED code review, no-drift spec review, `diff_sha256` `797a3a2b…`, which equals the canonical fingerprint of `8cec1a3..9acfe60` and the hash of `rework-1.patch`, and a mutation block (72 mutants, 58 killed, 14 equivalent). The 72/58/14 split matches v2's run of the same mutants. The corrected `manual:membership-order-id-dropped` reason is recorded in `rework-1`. `df7f4cc` does not touch cycle-1 |
| v2/IR-002 (MEDIUM) | RESOLVED | `test_reader_evidence.py:325` asserts `growth.reason_detail == "revenue_growth is input_outdated"`. This review's run kills both `manual:v2-cell-reason-detail-dropped` and `manual:v2-evidence-sql-cell-reason-detail-null` at that line. Cycle `rework-2` (`stage` → `df7f4cc`) records RED, GREEN, reviews and mutation. The assertion's residual gap is the new IR-001 (LOW, late) |

## Scope and Plan Deviations

- **Justified (carried from v1).** `stock_evidence.sql` wraps its `UNION ALL`
  in a subquery (`SELECT u.* FROM (…) u ORDER BY …`). PostgreSQL refuses
  expressions in a `UNION`'s `ORDER BY`, and the TDD evidence records this. The
  statement also resolves the instrument's latest reference name (DEC-0245)
  through an `instrument_row` CTE.
- **Justified (carried from v1).** T002's `add_member`/`remove_member` already
  existed and are reused.
- **Justified (carried from v2).** `reverse` is a new keyword-only parameter with
  a default, on two seed helpers. T002 permits optional keyword parameters.
- **Accepted process deviation (rework).** T022 asks for each cycle to be
  recorded, with its reviews, before the next cycle begins. `rework-1`'s RED
  reproduction, reviews and mutation run were made after `9acfe60` was
  committed, in the rework of review v2. That is the remediation v2 IR-001
  required. The evidence file's header says so, and the lint accepts the cycle.
  Cycle-1 still carries the reason line `9acfe60` rewrote in place. `rework-1`
  now records the same reason, and its reviews judged it.
- **Plan composition (carried).** TC-COMP-146 seeds seven `present` and one
  `missing` input. The planned `outdated` row is asserted in
  `test_evidence_input_row_carries_the_dates_the_statement_stored`.
- **Plan inaccuracy (not the coder's).** The Validation Plan says "Build: none
  defined"; the tech-stack table lists `uv build`. T019 is the planned
  packaging proof and passed, and `uv build` also passed in this review.
- **Recorded open behaviour (Open Gap 4).** With no complete set, compare
  returns `unknown_symbols=[]`. This follows design 2.7 and is flagged in the
  plan for the API design. It is not a finding.
- **Non-blocking observation (carried).** `stock_evidence` upper-cases its
  symbol and does not shape-check it. That is DEC-0132's "no other rewriting",
  and the symbol is bound. A non-string symbol raises `AttributeError`, and no
  artifact specifies otherwise.
- **Scope leakage.** None. Every changed file traces to a task or to a review
  remediation.

## Follow-Up

- **Next agent**: Doc Sync Agent (`$doc-sync`), with `CAP-002-E3-S3-tasks.md`
  and this report.
- **Required action**: None for the gate. IR-001 is optional: pin a cell
  `reason_detail` that cannot be rebuilt from the row's own columns. It may be
  folded into later work on `_cell_from_row` (CAP-002-E3-S4).
- **Warnings accepted downstream**: IR-001 (LOW)
